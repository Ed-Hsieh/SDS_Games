import GameManager from './GameManager.js';
import { CombatVfxLab } from '../scenes/CombatVfxLab.js';
import { CombatSessionPhase } from './RealtimeCombatSession.js';
import SceneCombatFlow from './SceneCombatFlow.js';
import { getGeneratedItemImage } from '../data/AssetManifest.js';
import { attachItemTooltip } from '../utils/ItemTooltip.js';
import { markMonsterKnown } from './EncyclopediaManager.js';
import audioManager from '../utils/AudioManager.js';
import { createRecipeBlueprintDisplayItems } from './BlueprintManager.js';
import { buildCombatWeaponEntry } from './AdventureEncounterManager.js';
import { buildMonsterCombatActions } from '../data/MonsterCombatProfiles.js';
import { GuildTutorialFlag } from '../data/GuildTutorial.js';

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

function getEquipmentKind(item) {
    return String(item?.type || '').toLowerCase();
}

function isUsableEquipment(item) {
    if (!item || !['weapon', 'armor'].includes(getEquipmentKind(item))) return false;
    return Number.isFinite(Number(item.durability)) && Number(item.durability) > 0;
}

function createRhythmCharacter(character, offhand) {
    return {
        equipment: { weapon: character?.equipment?.weapon || null, offhand },
        getWeaponSpeed: () => character.getWeaponSpeed(),
        getAttackSpeed: () => character.getAttackSpeed(),
        getAttackInterval: () => character.getAttackInterval(),
        getCritChance: () => character.getCritChance(),
        getCritDamage: () => character.getCritDamage(),
        getTotalAtk: () => character.getTotalAtk()
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
        this.lootTutorialActive = false;
        this.handleRewardClick = this.handleRewardClick.bind(this);
        this.handleEquipmentClick = this.handleEquipmentClick.bind(this);
        this.rewardsPanel?.addEventListener('click', this.handleRewardClick);
        this.combatRoot?.addEventListener('click', this.handleEquipmentClick);
        this.ensureStylesheet();
    }

    ensureStylesheet() {
        if (document.querySelector('#scene-combat-vfx-style')) return;
        const link = document.createElement('link');
        link.id = 'scene-combat-vfx-style';
        link.rel = 'stylesheet';
        link.href = 'src/style/combat-vfx-lab.css?v=battle-replacement-20260721a';
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
        const character = GameManager.getCharacter();
        const offhand = String(character?.equipment?.armor?.type || '').toLowerCase() === 'weapon'
            ? character.equipment.armor
            : null;
        this.setupTutorial(isPrologueTutorial, contextualGuidance, { hasOffhand: Boolean(offhand) });

        this.overlay.hidden = false;

        this.lab = new CombatVfxLab(this.combatRoot, {
            monster: encounter.visual,
            player: encounter.player,
            loadout: encounter.loadout,
            rhythmCharacter: createRhythmCharacter(character, offhand),
            secondaryEquipment: character?.equipment?.armor || null,
            autoStart: true,
            startMonsterPaused: isPrologueTutorial,
            fleeChance: encounter.fleeChance ?? 0.5,
            fleeCooldown: encounter.fleeCooldown ?? 2,
            canFlee: () => encounter.canFlee !== false,
            onWeaponAttempt: slot => this.handleTutorialWeaponAttempt(slot),
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

    getEquipmentCandidates(slot) {
        const secondary = slot === 'secondary';
        return (GameManager.getInventory() || []).filter(stack => {
            const kind = getEquipmentKind(stack?.item);
            return isUsableEquipment(stack?.item) && (secondary ? ['weapon', 'armor'].includes(kind) : kind === 'weapon');
        });
    }

    renderEquipmentPicker(slot) {
        const picker = this.combatRoot?.querySelector('#combat-equipment-picker');
        const title = this.combatRoot?.querySelector('#combat-equipment-picker-title');
        const list = this.combatRoot?.querySelector('#combat-equipment-picker-list');
        if (!picker || !title || !list) return false;
        const normalizedSlot = slot === 'secondary' ? 'secondary' : 'main';
        const equipmentSlot = normalizedSlot === 'secondary' ? 'armor' : 'weapon';
        const equipped = GameManager.getCharacter()?.equipment?.[equipmentSlot] || null;
        const requiresTutorialOffhand = Boolean(
            this.encounter?.context?.prologueTutorial
            && ['prepare_offhand', 'attack', 'offhand', 'replace_offhand'].includes(this.tutorialState?.stage)
        );
        const candidates = this.getEquipmentCandidates(normalizedSlot).filter(stack => (
            !requiresTutorialOffhand
            || normalizedSlot !== 'secondary'
            || getEquipmentKind(stack.item) === 'weapon'
        ));
        const rows = [];
        if (equipped) {
            const image = getGeneratedItemImage(equipped);
            rows.push(`<button class="combat-equipment-option is-equipped" type="button" disabled>
                <span class="combat-equipment-option-icon">${image ? `<img src="${escapeHtml(image)}" alt="">` : escapeHtml(equipped.icon || '◇')}</span>
                <span><strong>${escapeHtml(equipped.name)}</strong><small>目前裝備</small></span>
            </button>`);
        }
        candidates.forEach(stack => {
            const item = stack.item;
            const image = getGeneratedItemImage(item);
            const kind = getEquipmentKind(item) === 'armor' ? '護甲' : '武器';
            const durability = item.durability === undefined
                ? ''
                : ` · 耐久 ${Math.max(0, Number(item.durability) || 0)}/${Math.max(1, Number(item.maxDurability) || 1)}`;
            rows.push(`<button class="combat-equipment-option" type="button" data-combat-equip-instance="${escapeHtml(stack.instanceId)}">
                <span class="combat-equipment-option-icon">${image ? `<img src="${escapeHtml(image)}" alt="">` : escapeHtml(item.icon || '◇')}</span>
                <span><strong>${escapeHtml(item.name)}</strong><small>${kind}${escapeHtml(durability)}</small></span>
            </button>`);
        });
        title.textContent = normalizedSlot === 'main' ? '更換主武器' : '更換副裝備';
        list.innerHTML = rows.join('') || '<p class="combat-equipment-picker-empty">背包裡沒有可用裝備。</p>';
        picker.dataset.slot = normalizedSlot;
        picker.hidden = false;
        this.activeEquipmentPickerSlot = normalizedSlot;
        return true;
    }

    closeEquipmentPicker() {
        const picker = this.combatRoot?.querySelector('#combat-equipment-picker');
        if (picker) picker.hidden = true;
        this.activeEquipmentPickerSlot = null;
    }

    handleEquipmentClick(event) {
        const changeButton = event.target.closest?.('[data-combat-change-slot]');
        if (changeButton) {
            event.stopPropagation();
            this.renderEquipmentPicker(changeButton.dataset.combatChangeSlot);
            return;
        }
        if (event.target.closest?.('[data-combat-picker-close]')) {
            event.stopPropagation();
            this.closeEquipmentPicker();
            return;
        }
        const option = event.target.closest?.('[data-combat-equip-instance]');
        if (!option || !this.activeEquipmentPickerSlot) return;
        event.stopPropagation();
        const slot = this.activeEquipmentPickerSlot;
        const equipmentSlot = slot === 'secondary' ? 'armor' : 'weapon';
        const instanceId = option.dataset.combatEquipInstance;
        if (instanceId && !GameManager.equipItemToSlot(instanceId, equipmentSlot)) {
            this.lab?.setFeed('目前無法更換這件裝備');
            return;
        }
        this.syncCombatEquipment(slot, { fullCooldown: false });
        this.closeEquipmentPicker();
        if (this.tutorialState?.stage === 'replace_offhand' && slot === 'secondary') {
            const secondary = GameManager.getCharacter()?.equipment?.armor;
            if (getEquipmentKind(secondary) === 'weapon') {
                this.combatRoot?.querySelector('[data-combat-change-slot="secondary"]')?.classList.remove('is-tutorial-target');
                this.tutorialState.stage = 'potion';
                this.setTutorialPrompt('副手已補上。主手損毀時，原本的副手會自動接替。現在喝下應急藥劑。', '空白鍵 · 使用藥水');
            }
        } else if (this.tutorialState?.stage === 'prepare_offhand' && slot === 'secondary') {
            const secondary = GameManager.getCharacter()?.equipment?.armor;
            if (getEquipmentKind(secondary) === 'weapon') {
                this.combatRoot?.querySelector('[data-combat-change-slot="secondary"]')?.classList.remove('is-tutorial-target');
                this.tutorialState.stage = 'attack';
                this.setTutorialPrompt('副手已就位。在青綠色命中區或金黃色暴擊區出手。', '滑鼠左鍵 · 命中或暴擊');
            }
        }
    }

    syncCombatEquipment(changedSlot = 'main', options = {}) {
        const character = GameManager.getCharacter();
        const mainItem = character?.equipment?.weapon || null;
        const secondaryItem = character?.equipment?.armor || null;
        const offhandItem = mainItem && getEquipmentKind(secondaryItem) === 'weapon' ? secondaryItem : null;
        const mainEntry = buildCombatWeaponEntry(mainItem, character, this.encounter?.monster, 'main');
        const offhandEntry = buildCombatWeaponEntry(offhandItem, character, this.encounter?.monster, 'offhand');
        this.encounter.loadout.main = mainEntry;
        this.encounter.loadout.offhand = offhandEntry;
        if (changedSlot === 'main' || changedSlot === 'both') {
            this.lab?.replaceCombatEquipment('main', mainItem, mainEntry, options);
        }
        if (changedSlot === 'secondary' || changedSlot === 'both') {
            this.lab?.replaceCombatEquipment('offhand', secondaryItem, offhandEntry, options);
            if (!this.encounter?.context?.prologueTutorial) {
                const defense = Math.max(0, Number(character.getTotalDef()));
                const attacks = buildMonsterCombatActions(this.encounter?.monster, defense);
                this.encounter.visual.attacks = attacks;
                this.lab?.replaceMonsterAttacks(attacks);
            }
        }
        this.lab?.setFeed(options.message || `${changedSlot === 'main' ? '主武器' : '副裝備'}已更換`);
    }

    findAutomaticReplacement(kind) {
        return (GameManager.getInventory() || []).find(stack => (
            isUsableEquipment(stack?.item) && getEquipmentKind(stack.item) === kind
        )) || null;
    }

    handleBrokenEquipment(slot, destroyedItem) {
        const normalizedSlot = slot === 'offhand' ? 'offhand' : slot === 'armor' ? 'armor' : 'main';
        if (normalizedSlot === 'main') {
            if (GameManager.promoteOffhandWeaponToMain()) {
                this.syncCombatEquipment('both', { automatic: true, fullCooldown: true, message: `${destroyedItem.name}損毀，副武器已移至主手` });
                return true;
            }
            const replacement = this.findAutomaticReplacement('weapon');
            if (replacement && GameManager.equipItemToSlot(replacement.instanceId, 'weapon')) {
                this.syncCombatEquipment('main', { automatic: true, fullCooldown: true, message: `${destroyedItem.name}損毀，已遞補${replacement.item.name}` });
                return true;
            }
            this.lab?.handleWeaponBroken('main', destroyedItem);
            return false;
        }

        const replacementKind = normalizedSlot === 'armor' ? 'armor' : 'weapon';
        const replacement = this.findAutomaticReplacement(replacementKind);
        if (replacement && GameManager.equipItemToSlot(replacement.instanceId, 'armor')) {
            this.syncCombatEquipment('secondary', { automatic: true, fullCooldown: true, message: `${destroyedItem.name}損毀，已遞補${replacement.item.name}` });
            return true;
        }
        this.lab?.replaceCombatEquipment('offhand', null, null, { fullCooldown: true });
        this.lab?.setFeed(`${destroyedItem.name}損毀，副裝備欄已空缺`);
        return false;
    }

    handleCombatEvent(event) {
        if (event.type === 'player:potion' && this.activePotion) {
            GameManager.useConsumable(this.activePotion.instanceId, false, {
                applyEffect: false,
                notifyType: false
            });
            this.activePotion = findHealingPotion();
        } else if (
            event.type === 'player:hit'
            && event.weapon?.effect !== 'unarmed'
            && !this.encounter.context?.prologueTutorial
        ) {
            const slot = event.slot === 'offhand' ? 'offhand' : 'main';
            const destroyedWeapon = GameManager.reduceWeaponDurability(slot === 'offhand' ? 'armor' : 'weapon');
            if (destroyedWeapon) {
                audioManager.play('weapon-break', { throttleKey: `weapon-break-${slot}`, throttleMs: 250 });
                this.handleBrokenEquipment(slot, destroyedWeapon);
            }
        } else if (event.type === 'monster:hit') {
            const destroyedArmor = GameManager.reduceArmorDurability();
            if (destroyedArmor) {
                audioManager.play('weapon-break', { throttleKey: 'armor-break', throttleMs: 250 });
                this.handleBrokenEquipment('armor', destroyedArmor);
            }
        }
        this.updateTutorial(event);
        this.options.onCombatEvent?.(event, this.encounter);
    }

    setupTutorial(prologueEnabled, contextualGuidance = null, options = {}) {
        this.tutorialPanel?.remove();
        this.tutorialPanel = null;
        this.tutorialState = prologueEnabled
            ? { stage: options.hasOffhand ? 'attack' : 'prepare_offhand', complete: false }
            : null;
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
            prologueEnabled
                ? (options.hasOffhand
                    ? '在青綠色命中區或金黃色暴擊區出手。'
                    : '副手欄位目前沒有武器。先用右側「更換」補上副手。')
                : contextualGuidance.text,
            prologueEnabled
                ? (options.hasOffhand ? '滑鼠左鍵 · 命中或暴擊' : '更換 · 裝備副手武器')
                : contextualGuidance.control
        );
        if (prologueEnabled && !options.hasOffhand) {
            this.combatRoot?.querySelector('[data-combat-change-slot="secondary"]')?.classList.add('is-tutorial-target');
        }
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

        if (this.tutorialState.stage === 'attack' && event.type === 'player:hit' && event.slot !== 'offhand') {
            this.tutorialState.stage = 'offhand';
            this.setTutorialPrompt('主手命中會短暫打開副手窗口。立刻追擊。', '滑鼠右鍵 · 副手追擊');
            return;
        }

        if (this.tutorialState.stage === 'offhand' && event.type === 'player:hit' && event.slot === 'offhand') {
            this.tutorialState.stage = 'break';
            this.setTutorialPrompt('武器會在攻擊中消耗耐久。再揮一次主手。', '滑鼠左鍵 · 觀察耐久');
            return;
        }

        if (this.tutorialState.stage === 'break' && event.type === 'player:hit' && event.slot !== 'offhand') {
            this.tutorialState.stage = 'replace_offhand';
            audioManager.play('weapon-break', { throttleKey: 'prologue-weapon-break', throttleMs: 250 });
            const promotion = GameManager.promoteOffhandWeaponToMain({ breakCurrentMain: true });
            if (promotion) {
                this.syncCombatEquipment('both', {
                    automatic: true,
                    fullCooldown: true,
                    message: `${promotion.broken.name}損毀，${promotion.promoted.name}已從副手移至主手`
                });
            }
            this.combatRoot?.querySelector('[data-combat-change-slot="secondary"]')?.classList.add('is-tutorial-target');
            this.setTutorialPrompt('主手損毀，副手已自動移到主手。點擊右側「更換」，補上一把副武器。', '右側更換 · 裝備副武器');
            return;
        }

        if (this.tutorialState.stage === 'offhand' && event.type === 'player:hit' && event.slot === 'main') {
            this.setTutorialPrompt('副手攻擊窗口已重新開啟。請在兩圈內完成追擊。', '滑鼠右鍵 · 副手追擊');
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
                prepare_offhand: ['先在右側更換欄裝備一把副手武器。', '更換 · 裝備副手武器'],
                attack: ['先打出一次命中或暴擊。', '滑鼠左鍵 · 命中或暴擊'],
                offhand: ['主手命中後，趁兩圈內用副手追擊。', '滑鼠右鍵 · 副手追擊'],
                break: ['再使用一次主手，觀察武器耐久。', '滑鼠左鍵 · 主手攻擊'],
                replace_offhand: ['副手已接替主手。現在替右側補上一把副武器。', '右側更換 · 裝備副武器'],
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
        if (this.tutorialState.stage === 'prepare_offhand') {
            this.setTutorialPrompt('先在右側更換欄裝備一把副手武器。', '更換 · 裝備副手武器');
        } else if (this.tutorialState.stage === 'attack') {
            this.setTutorialPrompt('先打出一次命中或暴擊，再處理傷勢。', '滑鼠左鍵 · 命中或暴擊');
        } else if (this.tutorialState.stage === 'offhand') {
            this.setTutorialPrompt('先在兩圈窗口內完成副手追擊。', '滑鼠右鍵 · 副手追擊');
        } else if (this.tutorialState.stage === 'break') {
            this.setTutorialPrompt('再使用一次主手，觀察武器耐久。', '滑鼠左鍵 · 主手攻擊');
        } else if (this.tutorialState.stage === 'replace_offhand') {
            this.setTutorialPrompt('副手已接替主手。現在替右側補上一把副武器。', '右側更換 · 裝備副武器');
        } else if (this.tutorialState.stage === 'flee') {
            this.setTutorialPrompt('補給已經用過。現在嘗試撤離。', 'F · 嘗試撤離');
        }
        return true;
    }

    handleTutorialWeaponAttempt(slot) {
        if (!this.tutorialState) return false;
        const stage = this.tutorialState.stage;
        const isExpected = (stage === 'attack' && slot === 'main')
            || (stage === 'offhand' && (slot === 'main' || slot === 'offhand'))
            || (stage === 'break' && slot === 'main');
        if (isExpected) return false;
        if (stage === 'prepare_offhand') {
            this.setTutorialPrompt('先在右側更換欄裝備一把副手武器。', '更換 · 裝備副手武器');
        } else if (stage === 'offhand') {
            this.setTutorialPrompt('副手窗口只維持兩圈。現在用右鍵追擊。', '滑鼠右鍵 · 副手追擊');
        } else if (stage === 'break') {
            this.setTutorialPrompt('再使用一次主手，觀察武器耐久。', '滑鼠左鍵 · 主手攻擊');
        } else if (stage === 'replace_offhand') {
            this.setTutorialPrompt('副手已接替主手。現在替右側補上一把副武器。', '右側更換 · 裝備副武器');
        }
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
                    { label: this.encounter.context.prologueIssuedGear?.weapon || '主武器', value: '遺失' },
                    { label: this.encounter.context.prologueIssuedGear?.armor || '副武器', value: '遺失' },
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
            GameManager.removeTutorialItemGroup('guild-prologue', { notify: false });
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
        const resultPanel = this.rewardsPanel.closest('.combat-result');
        const preservedScrollTop = resultPanel?.scrollTop || 0;
        const rows = Array.isArray(rewards.rows) ? [...rewards.rows] : [];
        if (Number.isFinite(Number(rewards.exp))) rows.unshift({ label: '經驗', value: `+${rewards.exp}` });
        if (Number.isFinite(Number(rewards.gold))) rows.splice(rows.length > 0 ? 1 : 0, 0, { label: '金幣', value: `+${rewards.gold}` });
        if (rewards.drops && rewards.drops.length === 0) rows.push({ label: '物品掉落', value: '無' });
        const summary = rows.map(row => (
            `<div class="adventure-combat-reward-row"><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(row.value)}</strong></div>`
        )).join('');
        const blueprints = createRecipeBlueprintDisplayItems(rewards.blueprintUnlocks || []);
        const blueprintCards = blueprints.map(item => {
            const image = getGeneratedItemImage(item);
            return `<article class="combat-blueprint-card" data-combat-blueprint-id="${escapeHtml(item.id)}">
                <span class="combat-loot-icon">${image ? `<img src="${escapeHtml(image)}" alt="">` : escapeHtml(item.icon || '◇')}</span>
                <span><strong>${escapeHtml(item.name)}</strong><small>已登錄至鍛造藍圖</small></span>
            </article>`;
        }).join('');
        const pendingDrops = (rewards.drops || []).filter(drop => drop.decision === 'pending');
        if (this.result === CombatSessionPhase.VICTORY
            && !this.encounter?.context?.prologueTutorial
            && pendingDrops.length > 0
            && !GameManager.getFlag(GuildTutorialFlag.FIRST_LOOT_DECISION_COMPLETE)) {
            this.lootTutorialActive = true;
        }
        const lootTutorial = this.lootTutorialActive
            ? `<aside class="combat-settlement-guide">
                <span>首次戰利品</span>
                <strong>決定要帶走什麼</strong>
                <p>新掉落物必須選擇「拿取」或「放棄」。背包已滿時，可以丟棄右側既有物品騰出空位。</p>
            </aside>`
            : '';
        const loot = (rewards.drops || []).map((drop, index) => this.renderDropDecision(drop, index)).join('');
        this.rewardsPanel.innerHTML = `
            ${lootTutorial}
            <div class="combat-settlement-summary">${summary}${blueprintCards ? `<div class="combat-blueprint-list">${blueprintCards}</div>` : ''}</div>
            <div class="combat-settlement-columns">
                <section><header><strong>戰利品</strong><small>決定拿取或放棄</small></header>${loot ? `<div class="combat-loot-list">${loot}</div>` : '<p class="combat-settlement-empty">沒有物品掉落</p>'}</section>
                ${this.renderSettlementInventory()}
            </div>`;
        this.rewardsPanel.querySelectorAll('[data-combat-drop-index]').forEach(element => {
            const index = Number(element.dataset.combatDropIndex);
            const drop = rewards.drops?.[index];
            if (drop?.item) attachItemTooltip(element, drop.item, { quantity: drop.quantity });
        });
        this.rewardsPanel.querySelectorAll('[data-settlement-inventory-index]').forEach(element => {
            const stack = GameManager.getInventory()?.[Number(element.dataset.settlementInventoryIndex)];
            if (stack?.item) attachItemTooltip(element, stack.item, { quantity: stack.quantity });
        });
        this.rewardsPanel.querySelectorAll('[data-combat-blueprint-id]').forEach((element, index) => {
            if (blueprints[index]) attachItemTooltip(element, blueprints[index], { quantity: 1 });
        });
        if (resultPanel) resultPanel.scrollTop = preservedScrollTop;
        this.updateResultActionState();
    }

    renderSettlementInventory() {
        const inventory = GameManager.getInventory() || [];
        const capacity = Math.max(inventory.length, GameManager.getInventoryCapacity() || 0);
        const slots = Array.from({ length: capacity }, (_, index) => {
            const stack = inventory[index];
            if (!stack) return '<span class="combat-inventory-slot is-empty" aria-hidden="true"></span>';
            const image = getGeneratedItemImage(stack.item);
            return `<article class="combat-inventory-slot" data-settlement-inventory-index="${index}">
                ${image ? `<img src="${escapeHtml(image)}" alt="">` : `<span>${escapeHtml(stack.item?.icon || '◆')}</span>`}
                <b>${Math.max(1, Number(stack.quantity) || 1)}</b>
                <button type="button" data-settlement-discard="${escapeHtml(stack.instanceId)}" title="放到戰利品區">放下</button>
            </article>`;
        }).join('');
        return `<section class="combat-settlement-inventory">
            <header><strong>背包</strong><small>${inventory.length} / ${capacity}</small></header>
            <div class="combat-inventory-grid">${slots}</div>
        </section>`;
    }

    renderDropDecision(drop, index) {
        const item = drop.item || {};
        const quantity = Math.max(1, Number(drop.quantity) || 1);
        const image = item.id ? getGeneratedItemImage(item) : '';
        const status = {
            inventory: '已放入背包',
            'inventory-full': '背包已滿，請先騰出空位',
            discarded: drop.origin === 'inventory' ? '已從背包放下' : '已放棄',
            missing: '物品資料缺失'
        }[drop.stored] || '等待決定';
        const pending = drop.decision === 'pending';
        const reclaimable = drop.decision === 'discarded';
        return `
            <article class="combat-loot-card is-${escapeHtml(drop.decision || 'pending')}" data-combat-drop-index="${index}">
                <span class="combat-loot-icon">${image ? `<img src="${escapeHtml(image)}" alt="">` : escapeHtml(item.icon || '◆')}</span>
                <span class="combat-loot-copy"><strong>${escapeHtml(item.name || drop.itemId || '未知物品')}</strong><small>${quantity} 個 · ${escapeHtml(status)}</small></span>
                <span class="combat-loot-actions">
                    ${pending ? `<button type="button" data-drop-decision="claim" data-drop-index="${index}">拿取</button><button type="button" data-drop-decision="discard" data-drop-index="${index}">放棄</button>` : ''}
                    ${reclaimable ? `<button type="button" data-drop-decision="claim" data-drop-index="${index}">拿回</button>` : ''}
                </span>
            </article>`;
    }

    handleRewardClick(event) {
        const discardInventory = event.target.closest?.('[data-settlement-discard]');
        if (discardInventory) {
            const instanceId = discardInventory.dataset.settlementDiscard;
            const stack = GameManager.getInventory()?.find(entry => entry.instanceId === instanceId);
            if (!stack || !GameManager.discardItem(instanceId, false, { force: true })) return;
            const existingGroundStack = this.rewards?.drops?.find(drop => (
                drop.decision === 'discarded'
                && drop.item?.id === stack.item?.id
                && GameManager.isStackable(stack.item)
            ));
            if (existingGroundStack) {
                existingGroundStack.quantity = Math.max(1, Number(existingGroundStack.quantity) || 1)
                    + Math.max(1, Number(stack.quantity) || 1);
                existingGroundStack.stored = 'discarded';
            } else {
                this.rewards.drops = [
                    ...(this.rewards.drops || []),
                    {
                        dropId: `settlement-ground:${instanceId}`,
                        itemId: stack.item?.id,
                        item: stack.item,
                        quantity: Math.max(1, Number(stack.quantity) || 1),
                        origin: 'inventory',
                        decision: 'discarded',
                        stored: 'discarded'
                    }
                ];
            }
            this.renderRewards(this.rewards);
            return;
        }
        const button = event.target.closest?.('[data-drop-decision][data-drop-index]');
        if (!button || !this.rewards?.drops) return;
        const index = Number(button.dataset.dropIndex);
        const drop = this.rewards.drops[index];
        if (!drop || !['pending', 'discarded'].includes(drop.decision)) return;
        this.options.resolveDrop?.(drop, button.dataset.dropDecision, this.encounter);
        if (this.lootTutorialActive
            && !this.rewards.drops.some(entry => entry.decision === 'pending')) {
            GameManager.setFlag(GuildTutorialFlag.FIRST_LOOT_DECISION_COMPLETE, true, {
                reason: 'first-loot-decision-complete'
            });
        }
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
        this.closeEquipmentPicker();
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
        this.combatRoot?.removeEventListener('click', this.handleEquipmentClick);
        if (this.ownsStylesheet) document.querySelector('#scene-combat-vfx-style')?.remove();
    }
}
