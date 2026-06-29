/**
 * DevPanel.js
 * 全域開發測試面板（Ctrl+Shift+D 開關，或網址加 ?dev=1）。
 * 涵蓋：角色等級、道具、任務進度、BOSS 線索、地點、章節/城鎮狀態、副本、裝備效果、存檔。
 */

import GameManager from '../managers/GameManager.js';
import { questManager, QuestStatus } from '../managers/QuestManager.js';
import { worldStoryManager } from '../managers/WorldStoryManager.js';
import { WorldStoryChains, WorldLandmarks } from '../data/WorldStories.js';
import { QuestDatabase, getQuestById } from '../data/Quests.js';
import { MaterialDatabase } from '../data/Materials.js';
import { EquipmentDatabase, SetDatabase } from '../data/Equipment.js';
import { MonsterDatabase } from '../data/Monsters.js';
import { applyMonsterCombatBalance, getMonsterCombatRank } from '../data/CombatBalance.js';
import { StoryEventTypes } from '../data/StoryProgressMap.js';
import { TownPlaceDatabase } from '../data/TownPlaces.js';
import { resolveItemById } from './ItemResolver.js';
import { escapeHtml, formatAffixStats } from './ItemDisplay.js';
import { showGlobalToast } from './UIFeedback.js';
import { isDevModeEnabled } from './DevMode.js';
import {
    getAttackSpeed,
    getCritChance,
    getCritDamage,
    getTotalAtk,
    getTotalDef
} from '../models/CharacterLogic.js';
import { getEquipmentEffectTotals } from '../managers/EquipmentEffectResolver.js';

const DUNGEON_IDS = ['cave', 'snow', 'ruins', 'jungle', 'hell'];
const DEV_SOURCE = 'boss_test_panel';

const PANEL_STYLE = `
.dev-panel { position: fixed; top: 0; right: 0; bottom: 0; width: min(440px, 96vw); z-index: 99990;
    background: rgba(8, 11, 16, 0.97); border-left: 1px solid rgba(233, 189, 101, 0.35);
    color: #edf2f4; font-size: 13px; display: flex; flex-direction: column; box-shadow: -8px 0 30px rgba(0,0,0,0.5); }
.dev-panel[hidden] { display: none; }
.dev-panel-head { display: flex; align-items: center; gap: 8px; padding: 10px 12px;
    border-bottom: 1px solid rgba(233, 189, 101, 0.25); }
.dev-panel-head strong { color: #e9bd65; font-size: 14px; flex: 1; }
.dev-panel-tabs { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px 10px;
    border-bottom: 1px solid rgba(255,255,255,0.08); }
.dev-panel-tabs button { padding: 4px 9px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.16);
    background: rgba(255,255,255,0.05); color: #cfd8dc; cursor: pointer; font-size: 12px; }
.dev-panel-tabs button.is-active { background: rgba(233, 189, 101, 0.22); color: #ffe9b8; border-color: rgba(233,189,101,0.5); }
.dev-panel-body { flex: 1; overflow-y: auto; padding: 10px 12px; display: grid; gap: 10px; align-content: start; }
.dev-card { border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 8px 10px;
    background: rgba(255,255,255,0.03); display: grid; gap: 6px; }
.dev-card h4 { margin: 0; color: #e9bd65; font-size: 12px; }
.dev-row { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }
.dev-row small { color: #90a4ae; }
.dev-panel button.dev-act { padding: 3px 8px; border-radius: 5px; border: 1px solid rgba(140,190,235,0.4);
    background: rgba(140,190,235,0.12); color: #cfe7fb; cursor: pointer; font-size: 12px; }
.dev-panel button.dev-act:hover { background: rgba(140,190,235,0.28); }
.dev-panel button.dev-act.is-on { background: rgba(126,211,158,0.25); border-color: rgba(126,211,158,0.6); color: #d8f5e3; }
.dev-panel input, .dev-panel select { padding: 3px 6px; border-radius: 5px; border: 1px solid rgba(255,255,255,0.2);
    background: rgba(0,0,0,0.4); color: #edf2f4; font-size: 12px; max-width: 160px; }
.dev-panel a { color: #9bd0ff; }
.dev-report { white-space: pre-wrap; margin: 0; padding: 7px; border-radius: 6px; background: rgba(0,0,0,0.28); color: #d8e8f7; font-size: 12px; line-height: 1.45; }
.dev-panel .dev-close { border: none; background: none; color: #90a4ae; font-size: 16px; cursor: pointer; }
.dev-status { color: #7ed39e; }
.dev-muted { color: #78909c; }
.dev-panel-toggle { position: fixed; right: 10px; bottom: 10px; z-index: 99989; padding: 6px 10px;
    border-radius: 8px; border: 1px solid rgba(233,189,101,0.5); background: rgba(8,11,16,0.9);
    color: #e9bd65; cursor: pointer; font-size: 12px; }
`;

class DevPanel {
    constructor(app) {
        this.app = app;
        this.root = null;
        this.body = null;
        this.tab = 'character';
        this.open = false;
        this.validationResult = null;
        this.tabs = [
            ['character', '角色'],
            ['items', '道具'],
            ['quests', '任務'],
            ['boss', 'BOSS線'],
            ['world', '地點'],
            ['town', '章節/城鎮'],
            ['dungeon', '副本'],
            ['effects', '裝備效果'],
            ['validation', '驗證'],
            ['save', '存檔']
        ];
        this.mount();
        this.bindHotkey();
        if (new URLSearchParams(window.location.search).has('dev')) {
            this.showToggleButton();
        }
    }

    mount() {
        const style = document.createElement('style');
        style.textContent = PANEL_STYLE;
        document.head.appendChild(style);

        this.root = document.createElement('aside');
        this.root.className = 'dev-panel';
        this.root.hidden = true;
        this.root.innerHTML = `
            <div class="dev-panel-head">
                <strong>開發測試面板</strong>
                <small class="dev-muted">Ctrl+Shift+D</small>
                <button class="dev-close" type="button" data-dev="close">✕</button>
            </div>
            <div class="dev-panel-tabs">
                ${this.tabs.map(([id, label]) => `<button type="button" data-dev-tab="${id}">${label}</button>`).join('')}
            </div>
            <div class="dev-panel-body"></div>
        `;
        document.body.appendChild(this.root);
        this.body = this.root.querySelector('.dev-panel-body');

        this.root.addEventListener('click', event => this.handleClick(event));
    }

    showToggleButton() {
        if (document.querySelector('.dev-panel-toggle')) return;
        const btn = document.createElement('button');
        btn.className = 'dev-panel-toggle';
        btn.type = 'button';
        btn.textContent = '🛠 測試';
        btn.addEventListener('click', () => this.toggle());
        document.body.appendChild(btn);
    }

    bindHotkey() {
        document.addEventListener('keydown', event => {
            if (event.ctrlKey && event.shiftKey && String(event.key).toLowerCase() === 'd') {
                event.preventDefault();
                this.toggle();
            }
        });
    }

    toggle(force) {
        this.open = force !== undefined ? Boolean(force) : !this.open;
        this.root.hidden = !this.open;
        if (this.open) this.render();
    }

    render() {
        for (const button of this.root.querySelectorAll('[data-dev-tab]')) {
            button.classList.toggle('is-active', button.dataset.devTab === this.tab);
        }
        const renderers = {
            character: () => this.renderCharacter(),
            items: () => this.renderItems(),
            quests: () => this.renderQuests(),
            boss: () => this.renderBoss(),
            world: () => this.renderWorld(),
            town: () => this.renderTown(),
            dungeon: () => this.renderDungeon(),
            effects: () => this.renderEffects(),
            validation: () => this.renderValidation(),
            save: () => this.renderSave()
        };
        this.body.innerHTML = (renderers[this.tab] || renderers.character)();
    }

    refresh(message) {
        GameManager.markSaveDirty?.('dev-panel');
        if (message) showGlobalToast('測試面板', message, 'info', { duration: 2600 });
        this.render();
    }

    // ==================== 各分頁 ====================

    renderCharacter() {
        const char = GameManager.getCharacter();
        return `
            <div class="dev-card">
                <h4>角色狀態</h4>
                <div class="dev-row"><small>Lv.${char.level}｜EXP ${char.exp}｜HP ${char.hp}/${char.maxHp}｜金幣 ${GameManager.getGold()}</small></div>
                <div class="dev-row">
                    <input id="dev-level" type="number" min="1" max="99" placeholder="等級" value="${char.level}">
                    <button class="dev-act" type="button" data-dev="set-level">設定等級</button>
                    <button class="dev-act" type="button" data-dev="full-heal">補滿生命</button>
                </div>
                <div class="dev-row">
                    <input id="dev-gold" type="number" placeholder="金幣" value="1000">
                    <button class="dev-act" type="button" data-dev="add-gold">加金幣</button>
                    <button class="dev-act" type="button" data-dev="zero-gold">金幣歸零</button>
                    <input id="dev-exp" type="number" placeholder="經驗" value="500">
                    <button class="dev-act" type="button" data-dev="add-exp">加經驗</button>
                </div>
            </div>
        `;
    }

    renderItems() {
        const ids = [...Object.keys(MaterialDatabase), ...Object.keys(EquipmentDatabase)];
        return `
            <div class="dev-card">
                <h4>加入道具（材料 / 裝備 / 任務道具）</h4>
                <div class="dev-row">
                    <input id="dev-item-id" list="dev-item-ids" placeholder="輸入物品 id">
                    <datalist id="dev-item-ids">${ids.map(id => `<option value="${escapeHtml(id)}"></option>`).join('')}</datalist>
                    <input id="dev-item-qty" type="number" min="1" value="1" style="width:60px">
                    <button class="dev-act" type="button" data-dev="add-item">背包</button>
                    <button class="dev-act" type="button" data-dev="add-item-warehouse">倉庫</button>
                </div>
            </div>
            <div class="dev-card">
                <h4>套裝（直接給齊並裝備）</h4>
                <div class="dev-row">
                    ${Object.values(SetDatabase).map(set => `
                        <button class="dev-act" type="button" data-dev="grant-set" data-set-id="${escapeHtml(set.id)}">${escapeHtml(set.name || set.id)}</button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderQuests() {
        const groups = [
            ['主線', QuestDatabase.main],
            ['懸賞', QuestDatabase.bounty],
            ['委託', QuestDatabase.commission],
            ['隱藏', QuestDatabase.hidden || []]
        ];
        return groups.map(([label, quests]) => `
            <div class="dev-card">
                <h4>${label}</h4>
                ${quests.map(quest => {
                    const status = questManager.getQuestState(quest.id)?.status || 'locked';
                    return `
                        <div class="dev-row">
                            <small style="flex:1">${escapeHtml(quest.name)} <span class="dev-status">[${status}]</span></small>
                            <button class="dev-act" type="button" data-dev="quest-unlock" data-quest-id="${quest.id}">解鎖</button>
                            <button class="dev-act" type="button" data-dev="quest-accept" data-quest-id="${quest.id}">接取</button>
                            <button class="dev-act" type="button" data-dev="quest-fill" data-quest-id="${quest.id}">補滿</button>
                            <button class="dev-act" type="button" data-dev="quest-finish" data-quest-id="${quest.id}">回報</button>
                        </div>
                    `;
                }).join('')}
            </div>
        `).join('');
    }

    renderBoss() {
        return Object.keys(WorldStoryChains).map(chainId => {
            const status = worldStoryManager.getBossFlowStatus(chainId);
            if (!status) return '';
            const defeated = worldStoryManager.hasMonsterDefeated(status.bossId);
            return `
                <div class="dev-card">
                    <h4>${escapeHtml(status.title)} <small class="dev-muted">${escapeHtml(status.archetype || '')}</small></h4>
                    <div class="dev-row"><small>線索 ${status.clueCount}/${status.totalClues}｜推進 ${status.completedProgress}/${status.progressMethods.length}｜${status.finalReady ? '<span class="dev-status">決戰就緒</span>' : '未就緒'}${defeated ? '｜<span class="dev-status">已擊敗</span>' : ''}</small></div>
                    <div class="dev-row">
                        <button class="dev-act" type="button" data-dev="boss-clue" data-chain-id="${chainId}">+1 線索</button>
                        <button class="dev-act" type="button" data-dev="boss-clues" data-chain-id="${chainId}">全線索</button>
                        <button class="dev-act" type="button" data-dev="boss-progress" data-chain-id="${chainId}">完成推進</button>
                        <button class="dev-act" type="button" data-dev="boss-final" data-chain-id="${chainId}">決戰就緒</button>
                        <button class="dev-act" type="button" data-dev="boss-reset" data-chain-id="${chainId}">重置</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderWorld() {
        return `
            <div class="dev-card">
                <h4>地標（點擊＝造訪並觸發線索/推進）</h4>
                ${WorldLandmarks.map(landmark => {
                    const visited = Boolean(GameManager.getFlag(`world.landmark.${landmark.id}.visited`));
                    return `
                        <div class="dev-row">
                            <small style="flex:1">${landmark.icon || ''} ${escapeHtml(landmark.name)}（第${landmark.chapter}章）${visited ? '<span class="dev-status"> 已造訪</span>' : ''}</small>
                            <button class="dev-act" type="button" data-dev="visit-landmark" data-landmark-id="${landmark.id}">造訪</button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderTown() {
        const mains = QuestDatabase.main;
        const finished = mains.filter(quest => questManager.getQuestState(quest.id)?.status === QuestStatus.FINISHED);
        const chapter = finished.reduce((max, quest) => Math.max(max, quest.chapter), mains.some(q => questManager.getQuestState(q.id)?.status !== 'locked') ? 1 : 0);
        return `
            <div class="dev-card">
                <h4>章節狀態</h4>
                <small>主線完成 ${finished.length}/${mains.length}，目前章節進度約：第 ${Math.max(1, chapter)} 章</small>
            </div>
            ${TownPlaceDatabase.filter(place => (place.states || []).length > 0).map(place => `
                <div class="dev-card">
                    <h4>${place.icon || ''} ${escapeHtml(place.name)}</h4>
                    ${place.states.map(state => {
                        const on = Boolean(GameManager.getFlag(state.flag));
                        return `
                            <div class="dev-row">
                                <small style="flex:1">${escapeHtml(state.title)}</small>
                                <button class="dev-act ${on ? 'is-on' : ''}" type="button" data-dev="toggle-flag" data-flag="${escapeHtml(state.flag)}">${on ? 'ON' : 'OFF'}</button>
                            </div>
                        `;
                    }).join('')}
                </div>
            `).join('')}
        `;
    }

    renderDungeon() {
        return DUNGEON_IDS.map(dungeonId => `
            <div class="dev-card">
                <h4>${dungeonId}</h4>
                <div class="dev-row">
                    <button class="dev-act" type="button" data-dev="dungeon-clear" data-dungeon-id="${dungeonId}">觸發通關事件</button>
                    <button class="dev-act" type="button" data-dev="dungeon-boss" data-dungeon-id="${dungeonId}">觸發BOSS擊殺</button>
                    <button class="dev-act" type="button" data-dev="quest-unlock" data-quest-id="dungeon_${dungeonId}_001">解鎖任務I</button>
                    <button class="dev-act" type="button" data-dev="quest-unlock" data-quest-id="dungeon_${dungeonId}_002">解鎖任務II</button>
                </div>
            </div>
        `).join('');
    }

    renderEffects() {
        const char = GameManager.getCharacter();
        const slots = ['weapon', 'armor', 'accessory'];
        const passives = typeof char.getActivePassiveCombatEffects === 'function'
            ? (char.getActivePassiveCombatEffects() || [])
            : [];
        return `
            <div class="dev-card">
                <h4>目前裝備</h4>
                ${slots.map(slot => {
                    const item = char.equipment?.[slot];
                    if (!item) return `<div class="dev-row"><small>${slot}: <span class="dev-muted">空</span></small></div>`;
                    const affixText = Array.isArray(item.affixes) && item.affixes.length > 0
                        ? item.affixes.map(affix => `${affix.name || '詞綴'}（${formatAffixStats(affix.stats)}）`).join('、')
                        : '無詞綴';
                    return `<div class="dev-row"><small>${slot}: <strong>${escapeHtml(item.name)}</strong>｜${escapeHtml(affixText)}</small></div>`;
                }).join('')}
            </div>
            <div class="dev-card">
                <h4>生效中的被動戰鬥效果</h4>
                ${passives.length > 0
                    ? passives.map(effect => `<div class="dev-row"><small>${escapeHtml(effect?.name || effect?.id || JSON.stringify(effect))}</small></div>`).join('')
                    : '<small class="dev-muted">目前沒有生效的被動效果</small>'}
            </div>
        `;
    }

    renderValidation() {
        const monsterOptions = Object.values(MonsterDatabase)
            .sort((a, b) => (a.level || 1) - (b.level || 1))
            .map(monster => `<option value="${escapeHtml(monster.id)}">Lv.${monster.level || 1} ${escapeHtml(monster.name || monster.id)} (${escapeHtml(monster.id)})</option>`)
            .join('');
        const weaponOptions = Object.values(EquipmentDatabase)
            .filter(item => String(item.type || '').toLowerCase() === 'weapon')
            .sort((a, b) => (a.level || a.requiredLevel || 1) - (b.level || b.requiredLevel || 1))
            .map(item => `<option value="${escapeHtml(item.id)}">Lv.${item.level || item.requiredLevel || 1} ${escapeHtml(item.name || item.id)} (${escapeHtml(item.id)})</option>`)
            .join('');
        const result = this.validationResult
            ? `<pre class="dev-report">${escapeHtml(this.validationResult)}</pre>`
            : '<small class="dev-muted">選擇怪物後執行一次模擬，會用目前角色與可選武器計算 TTK / TTD。</small>';

        return `
            <div class="dev-card">
                <h4>裝備觸發條件</h4>
                ${this.renderEquippedTriggerSummary()}
            </div>
            <div class="dev-card">
                <h4>戰鬥模擬</h4>
                <div class="dev-row">
                    <select id="dev-validation-monster">${monsterOptions}</select>
                    <select id="dev-validation-weapon">
                        <option value="">目前武器</option>
                        ${weaponOptions}
                    </select>
                    <button class="dev-act" type="button" data-dev="run-combat-validation">模擬</button>
                </div>
                ${result}
            </div>
            <div class="dev-card">
                <h4>腳本驗證</h4>
                <small class="dev-muted">需要在終端執行；此處列出本次調平相關命令。</small>
                <pre class="dev-report">node scripts/EquipmentEffectCheck.mjs
node scripts/DifficultyProgressionCheck.mjs
node scripts/MonsterBalanceCheck_v4.js</pre>
                <div class="dev-row">
                    <a href="scripts/tools-ui/FightMatchupCheck.html" target="_blank" rel="noreferrer">Matchup 工具頁</a>
                    <a href="scripts/tools-ui/MonsterBalanceCheck.html" target="_blank" rel="noreferrer">怪物報表</a>
                </div>
            </div>
        `;
    }

    renderEquippedTriggerSummary() {
        const char = GameManager.getCharacter();
        const items = Object.values(char?.equipment || {}).filter(Boolean);
        if (items.length === 0) return '<small class="dev-muted">目前沒有裝備。</small>';

        const rows = [];
        for (const item of items) {
            const effects = Array.isArray(item.specialEffects) ? item.specialEffects : [];
            if (effects.length === 0) {
                rows.push(`<div class="dev-row"><small>${escapeHtml(item.name || item.id)}：無特殊觸發。</small></div>`);
                continue;
            }
            for (const effect of effects) {
                rows.push(`<div class="dev-row"><small>${escapeHtml(item.name || item.id)}｜${escapeHtml(effect.type)} ${escapeHtml(effect.value ?? '')}：${escapeHtml(this.describeEffectTrigger(effect))}</small></div>`);
            }
        }
        return rows.join('');
    }

    describeEffectTrigger(effect = {}) {
        const type = String(effect.type || '').replace(/[\s-]/g, '_').toLowerCase();
        const value = effect.value ?? 0;
        const triggers = {
            lifesteal: `命中造成傷害時，依 ${value}% 轉為治療。`,
            life_steal: `命中造成傷害時，依 ${value}% 轉為治療。`,
            damagereduction: `受到傷害時計算，減少 ${value}% 傷害。`,
            damage_reduction: `受到傷害時計算，減少 ${value}% 傷害。`,
            dodgechance: `受到攻擊時，以 ${value}% 機率閃避。`,
            dodge_chance: `受到攻擊時，以 ${value}% 機率閃避。`,
            armorpenetration: `攻擊命中時計算，忽略 ${value}% 防禦。`,
            armor_penetration: `攻擊命中時計算，忽略 ${value}% 防禦。`,
            double_strike: `攻擊命中時，以 ${value}% 機率追加一次傷害。`,
            execute: `目標低生命時觸發斬殺增傷，強化收尾能力。`,
            damagereflect: `受到傷害時，反彈 ${value}% 傷害給攻擊者。`,
            damage_reflect: `受到傷害時，反彈 ${value}% 傷害給攻擊者。`,
            revive: `死亡判定時，以 ${value}% 機率復活。`,
            fire: `攻擊命中時計入火屬性增傷 ${value}%。`,
            ice: `攻擊命中時檢定冰屬性控制或增傷。`,
            thunder: `攻擊命中時檢定雷屬性追加效果。`,
            poison: `攻擊命中時附加中毒壓力。`,
            void: `攻擊命中時計入虛空屬性效果。`,
            voiddamage: `攻擊命中時計入虛空增傷 ${value}%。`,
            critdamage: `爆擊成立時提高爆擊傷害。`,
            hp: `裝備後提高生命上限。`
        };
        return triggers[type] || '依效果類型在攻擊、受擊或死亡判定時觸發。';
    }

    renderSave() {
        const saveManager = GameManager.saveManager;
        const lastSave = saveManager.lastLocalSaveAt ? new Date(saveManager.lastLocalSaveAt).toLocaleTimeString() : '—';
        return `
            <div class="dev-card">
                <h4>存檔</h4>
                <small>schema v${saveManager.createSaveData().schemaVersion}｜最近本機存檔：${lastSave}｜未存變更：${saveManager.dirty ? '是' : '否'}</small>
                <div class="dev-row">
                    <button class="dev-act" type="button" data-dev="save-local">立即本機存檔</button>
                    <button class="dev-act" type="button" data-dev="load-local">讀取本機存檔</button>
                    <button class="dev-act" type="button" data-dev="save-export">匯出檔案</button>
                    <button class="dev-act" type="button" data-dev="save-import">匯入檔案</button>
                    <button class="dev-act" type="button" data-dev="save-reset">清除並重置</button>
                </div>
            </div>
        `;
    }

    // ==================== 行為 ====================

    handleClick(event) {
        const tabButton = event.target.closest('[data-dev-tab]');
        if (tabButton) {
            this.tab = tabButton.dataset.devTab;
            this.render();
            return;
        }

        const actionButton = event.target.closest('[data-dev]');
        if (!actionButton) return;
        const action = actionButton.dataset.dev;
        const data = actionButton.dataset;

        const actions = {
            close: () => this.toggle(false),
            'set-level': () => {
                const char = GameManager.getCharacter();
                const level = Math.max(1, Number(this.body.querySelector('#dev-level')?.value) || char.level);
                char.level = level;
                char.exp = 0;
                char.syncProperties?.();
                char.hp = char.maxHp;
                GameManager.notify('all');
                this.refresh(`等級設為 ${level}`);
            },
            'full-heal': () => {
                const char = GameManager.getCharacter();
                char.hp = char.maxHp;
                GameManager.notify('all');
                this.refresh('生命已補滿');
            },
            'add-gold': () => {
                GameManager.addGold(Number(this.body.querySelector('#dev-gold')?.value) || 0);
                this.refresh('金幣已加入');
            },
            'zero-gold': () => {
                GameManager.removeGold(GameManager.getGold());
                this.refresh('金幣歸零（可測一無所有隱藏線）');
            },
            'add-exp': () => {
                const char = GameManager.getCharacter();
                char.exp += Number(this.body.querySelector('#dev-exp')?.value) || 0;
                char.checkLevelUp?.();
                GameManager.notify('all');
                this.refresh('經驗已加入');
            },
            'add-item': () => this.addItem(false),
            'add-item-warehouse': () => this.addItem(true),
            'run-combat-validation': () => this.runCombatValidation(),
            'grant-set': () => {
                GameManager.grantSetEquipmentForTesting([data.setId], data.setId);
                this.refresh(`已給予並裝備套裝 ${data.setId}`);
            },
            'quest-unlock': () => {
                questManager.unlockQuest(data.questId);
                this.refresh(`已解鎖 ${data.questId}`);
            },
            'quest-accept': () => {
                const result = questManager.acceptQuest(data.questId);
                this.refresh(result.success ? `已接取 ${data.questId}` : `接取失敗：${result.message}`);
            },
            'quest-fill': () => this.fillQuest(data.questId),
            'quest-finish': () => {
                const result = questManager.completeQuest(data.questId);
                this.refresh(result.success ? `已回報 ${data.questId}` : `回報失敗：${result.message}`);
            },
            'boss-clue': () => {
                worldStoryManager.revealNextClue(data.chainId, { source: DEV_SOURCE });
                this.refresh();
            },
            'boss-clues': () => {
                worldStoryManager.revealAllClues(data.chainId, { source: DEV_SOURCE });
                this.refresh();
            },
            'boss-progress': () => {
                for (const method of WorldStoryChains[data.chainId]?.progressMethods || []) {
                    worldStoryManager.recordProgress(data.chainId, method.id, { source: DEV_SOURCE });
                }
                this.refresh();
            },
            'boss-final': () => {
                worldStoryManager.markFinalReady(data.chainId, { source: DEV_SOURCE });
                this.refresh();
            },
            'boss-reset': () => {
                worldStoryManager.resetStoryChain(data.chainId);
                this.refresh(`已重置 ${data.chainId}`);
            },
            'visit-landmark': () => {
                const outcome = worldStoryManager.visitLandmark(data.landmarkId, { source: DEV_SOURCE });
                this.refresh(outcome.success ? `已造訪 ${outcome.title}` : '造訪失敗');
            },
            'toggle-flag': () => {
                GameManager.setFlag(data.flag, !GameManager.getFlag(data.flag));
                this.refresh();
            },
            'dungeon-clear': () => {
                worldStoryManager.applyStoryEvent(StoryEventTypes.DUNGEON_COMPLETED, { dungeonId: data.dungeonId, source: DEV_SOURCE });
                this.refresh(`已觸發 ${data.dungeonId} 通關事件`);
            },
            'dungeon-boss': () => {
                worldStoryManager.applyStoryEvent(StoryEventTypes.DUNGEON_BOSS_DEFEATED, { dungeonId: data.dungeonId, bossId: `${data.dungeonId}_boss`, source: DEV_SOURCE });
                this.refresh(`已觸發 ${data.dungeonId} BOSS 擊殺事件`);
            },
            'save-local': () => {
                const result = GameManager.saveToLocalStorage();
                this.refresh(result.success ? '已寫入本機存檔' : `存檔失敗：${result.error}`);
            },
            'load-local': () => {
                const result = GameManager.loadFromLocalStorage();
                this.refresh(result.loaded ? `已從${result.source === 'backup' ? '備份' : '主檔'}讀取` : '沒有可讀取的本機存檔');
            },
            'save-export': () => GameManager.writeSaveFile(),
            'save-import': () => this.importSave(),
            'save-reset': () => {
                if (window.confirm('確定清除本機存檔並重置所有進度？')) {
                    GameManager.resetSaveData();
                    this.refresh('已重置');
                }
            }
        };

        actions[action]?.();
    }

    runCombatValidation() {
        const monsterId = this.body.querySelector('#dev-validation-monster')?.value || 'slime';
        const weaponId = this.body.querySelector('#dev-validation-weapon')?.value || '';
        const sourceChar = GameManager.getCharacter();
        const character = this.cloneCharacterForValidation(sourceChar);
        if (weaponId && EquipmentDatabase[weaponId]) {
            character.equipment.weapon = { ...EquipmentDatabase[weaponId] };
        }

        const monsterData = MonsterDatabase[monsterId];
        if (!monsterData) {
            this.validationResult = `找不到怪物：${monsterId}`;
            this.render();
            return;
        }

        const monster = { ...monsterData };
        applyMonsterCombatBalance(monster);
        const effects = getEquipmentEffectTotals(character);
        const rank = getMonsterCombatRank(monster);
        const effectiveDefense = Math.max(0, (monster.defense || 0) * (1 - (effects.armorPenetration || 0) / 100));
        let averageHit = Math.max(1, getTotalAtk(character) - effectiveDefense);
        averageHit *= 1 + getCritChance(character) * (getCritDamage(character) - 1);
        averageHit *= 1 + ((effects.fire || 0) + (effects.voidDamage || 0)) / 100;
        if (rank === 'boss') averageHit *= 1 + (effects.bossBonus || 0) / 100;
        averageHit *= 1 + ((effects.doubleStrike || 0) / 100) * 0.5;

        const playerDps = averageHit * getAttackSpeed(character);
        const rawMonsterDps = Math.max(1, (monster.attack || 0) - getTotalDef(character)) * (monster.attackSpeed || 1);
        const monsterDps = Math.max(
            1,
            rawMonsterDps * (1 - Math.min(0.75, (effects.damageReduction || 0) / 100))
                - playerDps * ((effects.lifesteal || 0) / 100)
        );
        const playerHp = character.maxHp || sourceChar.maxHp || 1;
        const timeToKill = (monster.hp || 1) / playerDps;
        const timeToDie = playerHp / monsterDps;
        const ratio = timeToKill / timeToDie;

        this.validationResult = [
            `${character.level || 1}級角色 vs ${monster.name || monster.id}（${rank}）`,
            `武器：${character.equipment.weapon?.name || '拳頭'}`,
            `玩家：HP ${Math.round(playerHp)} / ATK ${getTotalAtk(character)} / DEF ${getTotalDef(character)} / DPS ${playerDps.toFixed(1)}`,
            `怪物：HP ${monster.hp} / ATK ${monster.attack} / DEF ${monster.defense} / DPS ${monsterDps.toFixed(1)}`,
            `TTK ${timeToKill.toFixed(1)}s / TTD ${timeToDie.toFixed(1)}s / 壓力比 ${ratio.toFixed(2)}`,
            ratio < 0.75 ? '結果：玩家明顯有利'
                : ratio < 1.15 ? '結果：接近五五波，需要注意血量與耐久'
                    : '結果：怪物有利，需要更好的裝備、藥水或配置'
        ].join('\n');

        showGlobalToast('DEV 驗證', '戰鬥模擬完成', 'info', { duration: 1800 });
        this.render();
    }

    cloneCharacterForValidation(sourceChar) {
        const equipment = {};
        for (const [slot, item] of Object.entries(sourceChar?.equipment || {})) {
            equipment[slot] = item ? { ...item, stats: { ...(item.stats || {}) }, specialEffects: [...(item.specialEffects || [])] } : null;
        }
        const level = Math.max(1, Number(sourceChar?.level) || 1);
        const maxHp = Number(sourceChar?.maxHp) || (100 + level * 20);
        return {
            level,
            baseAtk: Number(sourceChar?.baseAtk) || 5,
            baseDef: Number(sourceChar?.baseDef) || 2,
            hp: maxHp,
            maxHp,
            equipment,
            activeBuffs: [...(sourceChar?.activeBuffs || [])],
            unlockedPassiveEffectIds: [...(sourceChar?.unlockedPassiveEffectIds || [])],
            equippedPassiveEffectIds: [...(sourceChar?.equippedPassiveEffectIds || [])],
            passiveEffectSlots: sourceChar?.passiveEffectSlots || 1
        };
    }

    addItem(toWarehouse) {
        const itemId = String(this.body.querySelector('#dev-item-id')?.value || '').trim();
        const quantity = Math.max(1, Number(this.body.querySelector('#dev-item-qty')?.value) || 1);
        if (!itemId) return;

        const item = resolveItemById(itemId, { order: ['material', 'equipment', 'shop', 'questReward', 'bossEquipment'] });
        if (!item) {
            this.refresh(`找不到物品 ${itemId}`);
            return;
        }
        const success = toWarehouse
            ? GameManager.addToWarehouse(item, quantity)
            : GameManager.addToInventory(item, quantity);
        this.refresh(success ? `已加入 ${item.name} x${quantity}` : '加入失敗（背包已滿？）');
    }

    fillQuest(questId) {
        const state = questManager.questStates?.[questId];
        const quest = getQuestById(questId);
        if (!quest || !state || state.status !== QuestStatus.ACTIVE) {
            this.refresh('任務需先處於進行中才能補滿');
            return;
        }
        for (const progress of state.progress || []) {
            progress.current = progress.required;
        }
        state.status = QuestStatus.COMPLETED;
        questManager.notify('quest_ready', { questId, quest });
        this.refresh(`已補滿 ${quest.name} 的目標`);
    }

    importSave() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json,.json';
        input.addEventListener('change', async () => {
            const file = input.files?.[0];
            if (!file) return;
            try {
                await GameManager.importSaveFile(file);
                this.refresh('存檔匯入完成');
            } catch (error) {
                this.refresh(`匯入失敗：${error.message}`);
            }
        });
        input.click();
    }
}

let devPanelInstance = null;

export function initDevPanel(app) {
    if (typeof document === 'undefined' || devPanelInstance) return devPanelInstance;
    if (!isDevModeEnabled()) return null;
    devPanelInstance = new DevPanel(app);
    window.devPanel = devPanelInstance;
    return devPanelInstance;
}

export default initDevPanel;
