import GameManager from './GameManager.js';
import { CombatVfxLab } from '../scenes/CombatVfxLab.js';
import { CombatSessionPhase } from './RealtimeCombatSession.js';
import SceneCombatFlow from './SceneCombatFlow.js';
import { getGeneratedItemImage } from '../data/AssetManifest.js';
import { attachItemTooltip } from '../utils/ItemTooltip.js';
import { markMonsterKnown } from './EncyclopediaManager.js';
import audioManager from '../utils/AudioManager.js';

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function findHealingPotion() {
    return (GameManager.getInventory() || []).find(stack => {
        const item = stack?.item || {};
        const id = String(item.id || '').toLowerCase();
        const type = String(item.type || '').toLowerCase();
        return Number(item.effect?.hp) > 0
            || id.includes('health_potion')
            || (type === 'potion' && !id.includes('antidote'));
    }) || null;
}

function createRhythmCharacter(character, offhand) {
    return {
        equipment: { weapon: character?.equipment?.weapon || null, offhand },
        getWeaponSpeed: () => character?.getWeaponSpeed?.() || 1,
        getAttackSpeed: () => character?.getAttackSpeed?.() || 1,
        getAttackInterval: () => character?.getAttackInterval?.() || 1,
        getCritChance: () => character?.getCritChance?.() || 0.05,
        getCritDamage: () => character?.getCritDamage?.() || 1.5,
        getTotalAtk: () => character?.getTotalAtk?.() || 5
    };
}

export default class CombatFlowController {
    constructor(root, options = {}) {
        this.root = root;
        this.options = options;
        this.flow = options.flow || new SceneCombatFlow(options.scene || {});
        options.ensureStage?.(root);
        this.overlay = root.querySelector('[data-combat-stage]') || root.querySelector('#adventure-combat-overlay');
        this.combatRoot = root.querySelector('[data-combat-root]') || root.querySelector('#adventure-combat-root');
        this.rewardsPanel = this.combatRoot?.querySelector('#adventure-combat-rewards') || null;
        this.lab = null;
        this.encounter = null;
        this.result = null;
        this.activePotion = null;
        this.tutorialPanel = null;
        this.tutorialState = null;
        this.handleRewardClick = this.handleRewardClick.bind(this);
        this.rewardsPanel?.addEventListener('click', this.handleRewardClick);
        this.ensureStylesheet();
    }

    ensureStylesheet() {
        if (document.querySelector('#scene-combat-vfx-style')) return;
        const link = document.createElement('link');
        link.id = 'scene-combat-vfx-style';
        link.rel = 'stylesheet';
        link.href = 'src/style/combat-vfx-lab.css?v=monster-centered-20260719a';
        document.head.appendChild(link);
        this.ownsStylesheet = true;
    }

    isActive() {
        return Boolean(this.overlay && !this.overlay.hidden);
    }

    start(encounter) {
        if (!encounter || this.isActive() || !this.overlay || !this.combatRoot) return false;
        this.flow.beginEncounter(encounter);
        this.encounter = encounter;
        this.result = null;
        this.rewards = null;
        this.activePotion = findHealingPotion();
        const isPrologueTutorial = Boolean(encounter.context?.prologueTutorial);
        const contextualGuidance = encounter.context?.combatGuidance || null;
        encounter.player.potions = isPrologueTutorial
            ? Math.max(1, Number(encounter.player.potions) || 0)
            : Math.max(0, Number(this.activePotion?.quantity) || 0);
        encounter.player.potionHeal = Math.max(1, Number(this.activePotion?.item?.effect?.hp) || 30);

        const potionImage = this.combatRoot.querySelector('#adventure-combat-potion-icon');
        const potionName = this.combatRoot.querySelector('#adventure-combat-potion-name');
        if (potionImage) potionImage.src = getGeneratedItemImage(this.activePotion?.item || { id: 'health_potion_s', type: 'potion' });
        if (potionName) potionName.textContent = isPrologueTutorial
            ? '應急藥劑'
            : (this.activePotion?.item?.name || '沒有補給');
        if (this.rewardsPanel) this.rewardsPanel.innerHTML = '';
        this.setupTutorial(isPrologueTutorial, contextualGuidance);

        this.overlay.hidden = false;
        const character = GameManager.getCharacter();
        const offhand = String(character?.equipment?.armor?.type || '').toLowerCase() === 'weapon'
            ? character.equipment.armor
            : null;

        this.lab = new CombatVfxLab(this.combatRoot, {
            monster: encounter.visual,
            player: encounter.player,
            loadout: encounter.loadout,
            rhythmCharacter: createRhythmCharacter(character, offhand),
            autoStart: true,
            startMonsterPaused: isPrologueTutorial,
            fleeChance: encounter.fleeChance ?? 0.35,
            fleeCooldown: encounter.fleeCooldown ?? 2,
            canFlee: () => encounter.canFlee !== false,
            onWeaponAttempt: () => this.handleTutorialWeaponAttempt(),
            onPotionAttempt: () => this.handleTutorialPotionAttempt(),
            onFleeAttempt: () => this.handleTutorialFleeAttempt(),
            fleeRejectedText: encounter.fleeRejectedText || '這場戰鬥無法撤離。',
            resultActionLabels: {
                [CombatSessionPhase.VICTORY]: encounter.victoryActionLabel || '收下戰利品並繼續',
                [CombatSessionPhase.DEFEAT]: encounter.defeatActionLabel || '返回村落',
                [CombatSessionPhase.ESCAPED]: encounter.escapeActionLabel || '返回場景'
            },
            onCombatEvent: event => this.handleCombatEvent(event),
            onBattleEnd: event => this.handleBattleEnd(event),
            onResultAction: snapshot => this.finish(snapshot.phase)
        });
        this.flow.beginCombat();
        this.combatRoot.querySelector('#battle-preview')?.focus({ preventScroll: true });
        this.options.onActiveChange?.(true, this.flow.getSnapshot());
        return true;
    }

    handleCombatEvent(event) {
        if (event.type === 'player:potion' && this.activePotion) {
            GameManager.useConsumable(this.activePotion.instanceId, false, {
                applyEffect: false,
                notifyType: false
            });
            this.activePotion = findHealingPotion();
        } else if (event.type === 'player:hit' && event.weapon?.effect !== 'unarmed') {
            const slot = event.slot === 'offhand' ? 'offhand' : 'main';
            const destroyedWeapon = GameManager.reduceWeaponDurability(slot === 'offhand' ? 'armor' : 'weapon');
            if (destroyedWeapon) {
                audioManager.play('weapon-break', { throttleKey: `weapon-break-${slot}`, throttleMs: 250 });
                this.lab?.handleWeaponBroken(slot, destroyedWeapon);
            }
        } else if (event.type === 'monster:hit') {
            GameManager.reduceArmorDurability();
        }
        this.updateTutorial(event);
        this.options.onCombatEvent?.(event, this.encounter);
    }

    setupTutorial(prologueEnabled, contextualGuidance = null) {
        this.tutorialPanel?.remove();
        this.tutorialPanel = null;
        this.tutorialState = prologueEnabled ? { stage: 'attack', complete: false } : null;
        if (!prologueEnabled && !contextualGuidance) return;

        const stage = this.combatRoot?.querySelector('#battle-preview');
        if (!stage) return;
        const panel = document.createElement('aside');
        panel.className = 'combat-tutorial-prompt';
        panel.setAttribute('aria-live', 'polite');
        panel.innerHTML = '<span>戰鬥教學</span><strong></strong><small></small>';
        stage.appendChild(panel);
        this.tutorialPanel = panel;
        const label = panel.querySelector('span');
        if (label) label.textContent = prologueEnabled ? '戰鬥教學' : '調查實戰';
        this.setTutorialPrompt(
            prologueEnabled ? '在青綠色命中區或金黃色暴擊區出手。' : contextualGuidance.text,
            prologueEnabled ? '滑鼠左鍵 · 命中或暴擊' : contextualGuidance.control
        );
    }

    setTutorialPrompt(message, control = '') {
        if (!this.tutorialPanel) return;
        const copy = this.tutorialPanel.querySelector('strong');
        const key = this.tutorialPanel.querySelector('small');
        if (copy) copy.textContent = message;
        if (key) key.textContent = control;
        this.tutorialPanel.classList.remove('is-current');
        void this.tutorialPanel.offsetWidth;
        this.tutorialPanel.classList.add('is-current');
    }

    updateTutorial(event) {
        if (!this.tutorialState || !event) return;

        if (this.tutorialState.stage === 'attack' && event.type === 'player:miss') {
            this.setTutorialPrompt('這次揮空了。等節奏環恢復，再打出命中或暴擊。', '青綠色命中 · 金黃色暴擊');
            return;
        }

        if (this.tutorialState.stage === 'attack' && event.type === 'player:hit') {
            this.tutorialState.stage = 'potion';
            this.setTutorialPrompt('命中成立。現在喝下應急藥劑。', '空白鍵 · 使用藥水');
            return;
        }

        if (this.tutorialState.stage === 'potion' && event.type === 'player:potion') {
            this.tutorialState.stage = 'flee';
            this.setTutorialPrompt('補給已使用。現在嘗試離開戰鬥。', 'F · 嘗試撤離');
            return;
        }

        if (event.type === 'monster:telegraph' && event.attack?.id === 'prologue_stag_charge') {
            this.setTutorialPrompt('退路斷了。巨影壓低了角。', '劇情戰鬥');
            return;
        }

        if (event.type === 'battle:end') {
            this.tutorialPanel?.classList.add('is-complete');
        }
    }

    handleTutorialFleeAttempt() {
        if (!this.tutorialState) return false;
        if (this.tutorialState.stage !== 'flee') {
            const prompts = {
                attack: ['先打出一次命中或暴擊。', '滑鼠左鍵 · 命中或暴擊'],
                potion: ['先喝下應急藥劑。', '空白鍵 · 使用藥水']
            };
            const [message, control] = prompts[this.tutorialState.stage] || prompts.attack;
            this.setTutorialPrompt(message, control);
            return true;
        }

        this.tutorialState.stage = 'complete';
        this.tutorialState.complete = true;
        this.setTutorialPrompt('你轉身尋找退路。山坡卻先一步裂開。', '撤離失敗');
        this.lab?.forceMonsterAttack('prologue_stag_charge');
        return true;
    }

    handleTutorialPotionAttempt() {
        if (!this.tutorialState) return false;
        if (this.tutorialState.stage === 'potion') return false;
        if (this.tutorialState.stage === 'attack') {
            this.setTutorialPrompt('先打出一次命中或暴擊，再處理傷勢。', '滑鼠左鍵 · 命中或暴擊');
        } else if (this.tutorialState.stage === 'flee') {
            this.setTutorialPrompt('補給已經用過。現在嘗試撤離。', 'F · 嘗試撤離');
        }
        return true;
    }

    handleTutorialWeaponAttempt() {
        if (!this.tutorialState || this.tutorialState.stage === 'attack') return false;
        if (this.tutorialState.stage === 'potion') {
            this.setTutorialPrompt('攻擊已經完成。現在喝下應急藥劑。', '空白鍵 · 使用藥水');
        } else if (this.tutorialState.stage === 'flee') {
            this.setTutorialPrompt('補給已使用。現在嘗試撤離。', 'F · 嘗試撤離');
        }
        return true;
    }

    handleBattleEnd(event) {
        GameManager.setCharacterHealth(Math.max(0, Number(event.snapshot?.player?.hp) || 0), {
            reason: 'combat-end',
            notify: false
        });
        this.result = event.result;
        const isPrologueDefeat = event.result === CombatSessionPhase.DEFEAT
            && Boolean(this.encounter?.context?.prologueTutorial);

        if (event.result === CombatSessionPhase.VICTORY) {
            markMonsterKnown(this.encounter?.monster || this.encounter?.visual);
            this.rewards = this.options.settleVictory?.(this.encounter, event) || { rows: [] };
        } else if (event.result === CombatSessionPhase.DEFEAT) {
            GameManager.setCharacterHealth(1, { reason: 'combat-defeat' });
            this.rewards = this.encounter?.context?.prologueTutorial
                ? { rows: [
                    { label: this.encounter.context.prologueIssuedGear?.weapon || '公會制式獵刀', value: '斷裂' },
                    { label: this.encounter.context.prologueIssuedGear?.armor || '公會外勤皮甲', value: '撕裂' },
                    { label: '去向', value: '跌落斷坡' }
                ] }
                : { rows: [{ label: '失去戰鬥能力', value: '將返回村落' }] };
        } else {
            GameManager.notify('all');
            this.rewards = { rows: [{ label: '撤離成功', value: '沒有取得戰利品' }] };
        }

        this.flow.beginSettlement(event.result, this.rewards);
        this.options.onBattleStateChange?.(event.result, this.rewards, this.flow.getSnapshot());

        if (isPrologueDefeat) {
            const completedEncounter = this.encounter;
            queueMicrotask(() => {
                if (this.encounter === completedEncounter && this.result === event.result) {
                    this.finish(event.result);
                }
            });
            return;
        }

        this.renderRewards(this.rewards);
    }

    renderRewards(rewards = {}) {
        if (!this.rewardsPanel) return;
        const rows = Array.isArray(rewards.rows) ? [...rewards.rows] : [];
        if (Number.isFinite(Number(rewards.exp))) rows.unshift({ label: '經驗', value: `+${rewards.exp}` });
        if (Number.isFinite(Number(rewards.gold))) rows.splice(rows.length > 0 ? 1 : 0, 0, { label: '金幣', value: `+${rewards.gold}` });
        if (rewards.drops && rewards.drops.length === 0) rows.push({ label: '物品掉落', value: '無' });
        const summary = rows.map(row => (
            `<div class="adventure-combat-reward-row"><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(row.value)}</strong></div>`
        )).join('');
        const loot = (rewards.drops || []).map((drop, index) => this.renderDropDecision(drop, index)).join('');
        this.rewardsPanel.innerHTML = `${summary}${loot ? `<div class="combat-loot-list">${loot}</div>` : ''}`;
        this.rewardsPanel.querySelectorAll('[data-combat-drop-index]').forEach(element => {
            const index = Number(element.dataset.combatDropIndex);
            const drop = rewards.drops?.[index];
            if (drop?.item) attachItemTooltip(element, drop.item, { quantity: drop.quantity });
        });
        this.updateResultActionState();
    }

    renderDropDecision(drop, index) {
        const item = drop.item || {};
        const quantity = Math.max(1, Number(drop.quantity) || 1);
        const image = item.id ? getGeneratedItemImage(item) : '';
        const status = {
            inventory: '已放入背包',
            warehouse: '背包已滿，送入倉庫',
            discarded: '已丟棄',
            missing: '物品資料缺失'
        }[drop.stored] || '等待決定';
        const pending = drop.decision === 'pending';
        return `
            <article class="combat-loot-card is-${escapeHtml(drop.decision || 'pending')}" data-combat-drop-index="${index}">
                <span class="combat-loot-icon">${image ? `<img src="${escapeHtml(image)}" alt="">` : escapeHtml(item.icon || '◆')}</span>
                <span class="combat-loot-copy"><strong>${escapeHtml(item.name || drop.itemId || '未知物品')}</strong><small>${quantity} 個 · ${escapeHtml(status)}</small></span>
                <span class="combat-loot-actions">
                    ${pending ? `<button type="button" data-drop-decision="claim" data-drop-index="${index}">拿取</button><button type="button" data-drop-decision="discard" data-drop-index="${index}">丟棄</button>` : ''}
                </span>
            </article>`;
    }

    handleRewardClick(event) {
        const button = event.target.closest?.('[data-drop-decision][data-drop-index]');
        if (!button || !this.rewards?.drops) return;
        const index = Number(button.dataset.dropIndex);
        const drop = this.rewards.drops[index];
        if (!drop || drop.decision !== 'pending') return;
        this.options.resolveDrop?.(drop, button.dataset.dropDecision, this.encounter);
        this.renderRewards(this.rewards);
    }

    updateResultActionState() {
        const action = this.combatRoot?.querySelector('#combat-result-restart');
        if (!action) return;
        const pendingCount = (this.rewards?.drops || []).filter(drop => drop.decision === 'pending').length;
        action.disabled = pendingCount > 0;
        action.title = pendingCount > 0 ? `尚有 ${pendingCount} 件戰利品需要決定` : '';
    }

    finish(phase = this.result) {
        if ((this.rewards?.drops || []).some(drop => drop.decision === 'pending')) return false;
        const defeated = phase === CombatSessionPhase.DEFEAT;
        const sceneComplete = !defeated && Boolean(this.options.isSceneComplete?.(
            this.encounter,
            phase,
            this.rewards,
            this.flow.getSnapshot()
        ));
        this.flow.finishSettlement({ sceneComplete, settlement: this.rewards });
        const snapshot = this.flow.getSnapshot();

        this.lab?.destroy?.();
        this.lab = null;
        this.tutorialPanel?.remove();
        this.tutorialPanel = null;
        this.tutorialState = null;
        this.overlay.hidden = true;
        const completedEncounter = this.encounter;
        const completedRewards = this.rewards;
        this.encounter = null;
        this.result = null;
        this.rewards = null;
        this.options.onActiveChange?.(false, snapshot);

        if (defeated) this.options.onDefeat?.(completedEncounter, snapshot);
        else if (sceneComplete) {
            this.options.onSceneComplete?.(completedEncounter, completedRewards, snapshot);
            if (!this.options.exitOnSceneComplete) this.flow.resumeScene();
        }
        else this.options.onReturnToScene?.(phase, completedEncounter, completedRewards, snapshot);
    }

    destroy() {
        this.lab?.destroy?.();
        this.lab = null;
        this.tutorialPanel?.remove();
        this.tutorialPanel = null;
        this.tutorialState = null;
        if (this.overlay) this.overlay.hidden = true;
        this.rewardsPanel?.removeEventListener('click', this.handleRewardClick);
        if (this.ownsStylesheet) document.querySelector('#scene-combat-vfx-style')?.remove();
    }
}
