/**
 * DevPanel.js
 * 全域開發測試面板（Ctrl+Alt+K 開關，或網址加 ?dev=1）。
 * 涵蓋：角色等級、道具、任務進度、BOSS 線索、地點、章節/城鎮狀態、副本、裝備效果、存檔。
 */

import GameManager from '../managers/GameManager.js';
import { questManager, QuestStatus } from '../managers/QuestManager.js';
import { worldStoryManager } from '../managers/WorldStoryManager.js';
import { WorldStoryChains, WorldLandmarks } from '../data/WorldStories.js';
import { QuestDatabase, QuestRewardItems, getQuestById } from '../data/Quests.js';
import { MaterialDatabase } from '../data/Materials.js';
import { EquipmentDatabase, SetDatabase } from '../data/Equipment.js';
import { TowerBossEquipment } from '../data/BossEquipment.js';
import { ShopData, SecretShopItems } from '../data/Items.js';
import { MonsterDatabase } from '../data/Monsters.js';
import { applyMonsterCombatBalance, getMonsterCombatRank } from '../data/CombatBalance.js';
import { StoryEventTypes } from '../data/StoryProgressMap.js';
import { TownPlaceDatabase } from '../data/TownPlaces.js';
import { getTownRuntimeSummary, TownVisibility } from '../managers/TownStateResolver.js';
import {
    getChapterOneRouteGroup,
    getChapterOneRouteGroups
} from '../data/ChapterOneRoutePlan.js';
import { resolveItemById, resolveItemRecord } from './ItemResolver.js';
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
const DEV_PANEL_STORAGE_KEY = 'sds.devPanel.state';

const ITEM_SOURCE_LABELS = {
    material: '素材庫',
    equipment: '裝備庫',
    questReward: '任務物品',
    bossEquipment: '首領裝備',
    shop: '商店物品'
};

const ITEM_TYPE_LABELS = {
    all: '全部',
    material: '素材',
    weapon: '武器',
    armor: '防具',
    equipment: '防具',
    accessory: '飾品',
    potion: '藥水',
    blueprint: '圖紙',
    key: '道具',
    quest: '任務',
    book: '書籍',
    currency: '貨幣',
    scroll: '卷軸',
    item: '物品'
};

const DEV_ITEM_CATEGORY_ORDER = [
    'all',
    'material',
    'weapon',
    'armor',
    'accessory',
    'blueprint',
    'potion',
    'key',
    'quest',
    'book',
    'currency',
    'scroll',
    'item'
];

const DEV_TOWN_VISIBILITY_FLAGS = [
    'town.elder.first_warning',
    'town.network.first_recovery_named',
    'town.crossroads.notice_read',
    'town.scholar.first_index_open',
    'town.forge.problem_named',
    'town.blacksmith.forge_open',
    'town.apothecary.problem_named',
    'town.apothecary.stock_basic_potion',
    'town.supply.route_problem_named',
    'town.supply.first_route_open',
    'town.south_gate.guard_route_ready',
    'town.tinker.repair_logic_named',
    'town.mine.route_problem_named',
    'market.rumor.material_index',
    'market.tinker.repair_stock',
    'town.rumor.elite_warning_open',
    'secretShopUnlocked',
    'town.black_market.contact_open',
    'town.black_market.rules_explained',
    'town.casino.showcase_seen',
    'town.casino.owner_route_seeded',
    'town.casino.false_odds_exposed',
    'foundTowerGlyphMemory',
    'tower.unsealed'
];

const DEV_TOWN_RECOVERY_FLAGS = [
    'town.elder.first_warning',
    'town.network.first_recovery_named',
    'town.crossroads.notice_read',
    'town.scholar.first_index_open',
    'town.forge.problem_named',
    'town.apothecary.problem_named',
    'town.supply.route_problem_named',
    'town.supply.first_route_open',
    'town.south_gate.guard_route_ready',
    'market.rumor.material_index',
    'town.rumor.elite_warning_open'
];

const EQUIPMENT_SLOT_LABELS = {
    weapon: '武器',
    armor: '防具',
    accessory: '飾品'
};

function readDevLevel(item) {
    return Number(item?.level ?? item?.requiredLevel ?? 1) || 1;
}

function normalizeDevType(item) {
    const type = String(item?.type || '').toLowerCase();
    if (type === 'equipment') return 'armor';
    if (item?.autoUnlockedBlueprint || type === 'blueprint') return 'blueprint';
    return type || 'item';
}

function getDevTypeLabel(type) {
    return ITEM_TYPE_LABELS[type] || type || '物品';
}

function getDevItemName(item) {
    return item?.name || item?.recipeName || item?.id || '未命名物品';
}

function getDevItemLabel(entry) {
    const item = entry.item;
    const level = readDevLevel(item);
    const typeLabel = getDevTypeLabel(entry.type);
    const sourceLabel = ITEM_SOURCE_LABELS[entry.source] || entry.source;
    const setLabel = item?.setId ? `｜${item.setId}` : '';
    return `Lv.${level} [${typeLabel}] ${getDevItemName(item)}｜${entry.id}｜${sourceLabel}${setLabel}`;
}

function addDevCatalogEntry(map, source, item) {
    if (!item?.id || map.has(item.id)) return;
    const type = normalizeDevType(item);
    map.set(item.id, {
        id: item.id,
        source,
        type,
        item,
        label: ''
    });
}

function getDevItemCatalog() {
    const map = new Map();
    Object.values(MaterialDatabase || {}).forEach(item => addDevCatalogEntry(map, 'material', item));
    Object.values(EquipmentDatabase || {}).forEach(item => addDevCatalogEntry(map, 'equipment', item));
    Object.values(QuestRewardItems || {}).forEach(item => addDevCatalogEntry(map, 'questReward', item));
    Object.values(TowerBossEquipment || {}).forEach(item => addDevCatalogEntry(map, 'bossEquipment', item));
    Object.values(ShopData || {}).forEach(shop => {
        (shop.items || []).forEach(item => addDevCatalogEntry(map, 'shop', item));
    });
    (SecretShopItems || []).forEach(item => addDevCatalogEntry(map, 'shop', item));

    return Array.from(map.values())
        .map(entry => ({ ...entry, label: getDevItemLabel(entry) }))
        .sort((a, b) =>
            readDevLevel(a.item) - readDevLevel(b.item)
            || getDevTypeLabel(a.type).localeCompare(getDevTypeLabel(b.type), 'zh-Hant')
            || getDevItemName(a.item).localeCompare(getDevItemName(b.item), 'zh-Hant')
            || a.id.localeCompare(b.id)
        );
}

function getDevEquipmentSlot(item) {
    const type = normalizeDevType(item);
    if (type === 'weapon') return 'weapon';
    if (type === 'accessory') return 'accessory';
    if (type === 'armor') return 'armor';
    return null;
}

function cloneDevItem(item) {
    if (!item) return null;
    if (typeof structuredClone === 'function') {
        try {
            return structuredClone(item);
        } catch (error) {
            // Fall through to JSON clone for plain data.
        }
    }
    return JSON.parse(JSON.stringify(item));
}

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
        this.state = this.loadPanelState();
        this.tabs = [
            ['character', '角色'],
            ['items', '道具'],
            ['quests', '任務'],
            ['chapter1', '第一章'],
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
                <small class="dev-muted">Ctrl+Alt+K</small>
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
        this.root.addEventListener('change', event => this.handleChange(event));
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
            if (event.ctrlKey && event.altKey && String(event.key).toLowerCase() === 'k') {
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
            chapter1: () => this.renderChapterOne(),
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

    loadPanelState() {
        if (typeof localStorage === 'undefined') return {};
        try {
            return JSON.parse(localStorage.getItem(DEV_PANEL_STORAGE_KEY) || '{}') || {};
        } catch (error) {
            return {};
        }
    }

    savePanelState(patch = {}) {
        this.state = { ...(this.state || {}), ...patch };
        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem(DEV_PANEL_STORAGE_KEY, JSON.stringify(this.state));
            } catch (error) {
                console.warn('[DevPanel] Failed to save panel state:', error);
            }
        }
        return this.state;
    }

    handleChange(event) {
        const field = event.target?.dataset?.devField;
        if (!field) return;

        this.savePanelState({ [field]: event.target.value });
        if (field === 'itemCategory') {
            this.render();
        }
    }

    renderCharacter() {
        const char = GameManager.getCharacter();
        const fatigue = GameManager.getAdventureFatigueStatus?.({ recover: false });
        const fatigueText = fatigue
            ? `${fatigue.current}/${fatigue.max}${fatigue.depleted ? '（虛弱）' : ''}`
            : '未啟用';
        return `
            <div class="dev-card">
                <h4>角色狀態</h4>
                <div class="dev-row"><small>Lv.${char.level}｜EXP ${char.exp}｜HP ${char.hp}/${char.maxHp}｜金幣 ${GameManager.getGold()}</small></div>
                <div class="dev-row"><small>疲勞 ${fatigueText}</small></div>
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
                <div class="dev-row">
                    <button class="dev-act" type="button" data-dev="fatigue-full">補滿疲勞</button>
                    <button class="dev-act" type="button" data-dev="fatigue-empty">耗盡疲勞</button>
                </div>
            </div>
        `;
    }

    renderItems() {
        const catalog = getDevItemCatalog();
        const category = this.state.itemCategory || 'all';
        const typeSet = new Set(catalog.map(entry => entry.type));
        const categories = [
            ...DEV_ITEM_CATEGORY_ORDER.filter(type => type === 'all' || typeSet.has(type)),
            ...Array.from(typeSet).filter(type => !DEV_ITEM_CATEGORY_ORDER.includes(type))
        ];
        const filtered = category === 'all'
            ? catalog
            : catalog.filter(entry => entry.type === category);
        const selectedId = filtered.some(entry => entry.id === this.state.itemId)
            ? this.state.itemId
            : filtered[0]?.id || '';
        const selectedEntry = filtered.find(entry => entry.id === selectedId);
        const qty = Math.max(1, Number(this.state.itemQty) || 1);

        return `
            <div class="dev-card">
                <h4>加入物品</h4>
                <div class="dev-row">
                    <select id="dev-item-category" data-dev-field="itemCategory">
                        ${categories.map(type => `<option value="${escapeHtml(type)}"${type === category ? ' selected' : ''}>${escapeHtml(getDevTypeLabel(type))}</option>`).join('')}
                    </select>
                    <select id="dev-item-id" data-dev-field="itemId" style="min-width:260px;max-width:100%;">
                        ${filtered.map(entry => `<option value="${escapeHtml(entry.id)}"${entry.id === selectedId ? ' selected' : ''}>${escapeHtml(entry.label)}</option>`).join('')}
                    </select>
                    <input id="dev-item-qty" data-dev-field="itemQty" type="number" min="1" value="${qty}" style="width:70px">
                </div>
                <div class="dev-row">
                    <button class="dev-act" type="button" data-dev="add-item">加入背包</button>
                    <button class="dev-act" type="button" data-dev="add-item-warehouse">送入倉庫</button>
                    <small>${selectedEntry ? escapeHtml(`${getDevItemName(selectedEntry.item)}｜${getDevTypeLabel(selectedEntry.type)}｜${ITEM_SOURCE_LABELS[selectedEntry.source] || selectedEntry.source}`) : '沒有符合分類的物品'}</small>
                </div>
            </div>
            <div class="dev-card">
                <h4>套裝測試</h4>
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

    renderChapterOne() {
        const mainQuestIds = new Set(['main_001', 'main_002', 'main_003', 'main_004', 'main_005', 'main_006']);
        const questRows = QuestDatabase.main
            .filter(quest => mainQuestIds.has(quest.id))
            .map(quest => {
                const state = questManager.getQuestState(quest.id);
                const status = state?.status || 'locked';
                const progress = Array.isArray(state?.progress) && state.progress.length > 0
                    ? state.progress.map(item => `${item.current}/${item.required} ${item.target}`).join('｜')
                    : '尚無進度';
                return `
                    <div class="dev-row">
                        <small style="flex:1">${escapeHtml(quest.id)}｜${escapeHtml(quest.name || quest.id)}｜${escapeHtml(status)}｜${escapeHtml(progress)}</small>
                        <button class="dev-act" type="button" data-dev="quest-unlock" data-quest-id="${escapeHtml(quest.id)}">解鎖</button>
                        <button class="dev-act" type="button" data-dev="quest-accept" data-quest-id="${escapeHtml(quest.id)}">接取</button>
                        <button class="dev-act" type="button" data-dev="quest-fill" data-quest-id="${escapeHtml(quest.id)}">填滿</button>
                    </div>
                `;
            }).join('');

        const routeCards = getChapterOneRouteGroups().map(group => {
            const visited = (group.landmarkIds || []).filter(landmarkId =>
                Boolean(GameManager.getFlag(worldStoryManager.getLandmarkVisitedFlag(landmarkId)))
            );
            const bossButtons = (group.bossThreadIds || []).map(chainId => `
                <button class="dev-act" type="button" data-dev="chapter1-ready-boss" data-chain-id="${escapeHtml(chainId)}">收束 ${escapeHtml(chainId)}</button>
            `).join('');
            const landmarkRows = (group.landmarkIds || []).map(landmarkId => {
                const landmark = WorldLandmarks.find(item => item.id === landmarkId);
                const isVisited = visited.includes(landmarkId);
                return `
                    <div class="dev-row">
                        <small style="flex:1">${landmark?.icon || ''} ${escapeHtml(landmark?.name || landmarkId)}${isVisited ? '｜已記錄' : ''}</small>
                        <button class="dev-act" type="button" data-dev="visit-landmark" data-landmark-id="${escapeHtml(landmarkId)}">造訪</button>
                    </div>
                `;
            }).join('');

            return `
                <div class="dev-card">
                    <h4>${escapeHtml(group.name)} <small class="dev-muted">${visited.length}/${group.landmarkIds.length}</small></h4>
                    <small>${escapeHtml(group.summary)}</small>
                    <div class="dev-row">
                        <button class="dev-act" type="button" data-dev="chapter1-visit-route" data-route-id="${escapeHtml(group.id)}">造訪整條路線</button>
                        ${bossButtons}
                    </div>
                    ${landmarkRows}
                </div>
            `;
        }).join('');

        return `
            <div class="dev-card">
                <h4>第一章主線狀態</h4>
                ${questRows}
            </div>
            ${routeCards}
        `;
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
        const townSummary = getTownRuntimeSummary();
        const visiblePlaceNames = townSummary.visiblePlaces.map(place => place.name || place.id).join('、') || '無';
        const hiddenPlaceNames = townSummary.hiddenPlaces.map(place => `${place.name || place.id}${place.hiddenReason ? `：${place.hiddenReason}` : ''}`).join('\n') || '無';
        const visibleResidentRows = townSummary.visibleResidents.map(resident => `
            <div class="dev-row">
                <small style="flex:1">${escapeHtml(resident.label || resident.npcId)}｜${escapeHtml(resident.placeName || resident.placeId)}｜${escapeHtml(resident.role || '')}</small>
            </div>
        `).join('') || '<small class="dev-muted">沒有可見人物</small>';
        const hiddenResidentRows = townSummary.hiddenResidents.map(resident => `
            <div class="dev-row">
                <small style="flex:1">${escapeHtml(resident.label || resident.npcId)}｜${escapeHtml(resident.placeName || resident.placeId)}｜${escapeHtml(resident.hiddenReason || '尚未達成登場條件')}</small>
            </div>
        `).join('') || '<small class="dev-muted">沒有被延後的人物</small>';
        return `
            <div class="dev-card">
                <h4>章節狀態</h4>
                <small>主線完成 ${finished.length}/${mains.length}，目前章節進度約：第 ${Math.max(1, chapter)} 章｜城鎮階段：${escapeHtml(townSummary.stage)}</small>
                <div class="dev-row">
                    <button class="dev-act" type="button" data-dev="town-reset-initial">第一章初始城鎮</button>
                    <button class="dev-act" type="button" data-dev="town-open-recovery">第一章回復網路</button>
                </div>
            </div>
            <div class="dev-card">
                <h4>目前可見場所</h4>
                <small>${escapeHtml(visiblePlaceNames)}</small>
            </div>
            <div class="dev-card">
                <h4>第一章可見人物</h4>
                ${visibleResidentRows}
            </div>
            <div class="dev-card">
                <h4>延後登場人物 / 場所</h4>
                ${hiddenResidentRows}
                <pre class="dev-report">${escapeHtml(hiddenPlaceNames)}</pre>
            </div>
            ${TownPlaceDatabase.filter(place => (place.states || []).length > 0).map(place => `
                <div class="dev-card">
                    <h4>${place.icon || ''} ${escapeHtml(place.name)}</h4>
                    <div class="dev-row"><small>顯示狀態：${escapeHtml(townSummary.visiblePlaces.some(visible => visible.id === place.id) ? TownVisibility.VISIBLE : TownVisibility.HIDDEN)}</small></div>
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
        const combatState = this.getCombatValidationState();
        const monsterOptions = Object.values(MonsterDatabase)
            .sort((a, b) => (a.level || 1) - (b.level || 1))
            .map(monster => `<option value="${escapeHtml(monster.id)}"${monster.id === combatState.monsterId ? ' selected' : ''}>Lv.${monster.level || 1} ${escapeHtml(monster.name || monster.id)} (${escapeHtml(monster.id)})</option>`)
            .join('');
        const equipmentEntries = getDevItemCatalog().filter(entry => getDevEquipmentSlot(entry.item));
        const slotOptions = slot => equipmentEntries
            .filter(entry => getDevEquipmentSlot(entry.item) === slot)
            .map(entry => `<option value="${escapeHtml(entry.id)}"${combatState[slot] === entry.id ? ' selected' : ''}>${escapeHtml(entry.label)}</option>`)
            .join('');
        const result = this.validationResult
            ? `<pre class="dev-report">${escapeHtml(this.validationResult)}</pre>`
            : '<small class="dev-muted">先選怪物。可直接用目前裝備，或指定武器 / 防具 / 飾品做假想配裝模擬。</small>';

        return `
            <div class="dev-card">
                <h4>裝備觸發條件</h4>
                ${this.renderEquippedTriggerSummary()}
            </div>
            <div class="dev-card">
                <h4>戰鬥模擬</h4>
                <div class="dev-row">
                    <select id="dev-validation-monster" data-dev-field="combatMonsterId">${monsterOptions}</select>
                    <button class="dev-act" type="button" data-dev="run-current-combat-validation">用目前裝備模擬</button>
                </div>
                <div class="dev-row">
                    <select id="dev-validation-weapon" data-dev-field="combatWeaponId" style="min-width:230px;max-width:100%;">
                        <option value="">目前武器</option>
                        <option value="__none__"${combatState.weapon === '__none__' ? ' selected' : ''}>不裝武器</option>
                        ${slotOptions('weapon')}
                    </select>
                    <select id="dev-validation-armor" data-dev-field="combatArmorId" style="min-width:230px;max-width:100%;">
                        <option value="">目前防具</option>
                        <option value="__none__"${combatState.armor === '__none__' ? ' selected' : ''}>不裝防具</option>
                        ${slotOptions('armor')}
                    </select>
                    <select id="dev-validation-accessory" data-dev-field="combatAccessoryId" style="min-width:230px;max-width:100%;">
                        <option value="">目前飾品</option>
                        <option value="__none__"${combatState.accessory === '__none__' ? ' selected' : ''}>不裝飾品</option>
                        ${slotOptions('accessory')}
                    </select>
                    <button class="dev-act" type="button" data-dev="run-combat-validation">用指定配裝模擬</button>
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
            void: `攻擊命中時附加虛空吞噬，每秒造成傷害並回復生命。`,
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
            'run-current-combat-validation': () => this.runCombatValidation('current'),
            'run-combat-validation': () => this.runCombatValidation('configured'),
            'fatigue-full': () => {
                const status = GameManager.getAdventureFatigueStatus?.({ recover: false });
                GameManager.restoreAdventureFatigue?.(status?.max || 9999);
                this.refresh('疲勞已補滿');
            },
            'fatigue-empty': () => {
                const status = GameManager.getAdventureFatigueStatus?.({ recover: false });
                GameManager.consumeAdventureFatigue?.(status?.max || 9999);
                this.refresh('疲勞已耗盡，虛弱狀態已套用');
            },
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
                questManager.syncExplorationObjectives?.();
                this.refresh(outcome.success ? `已造訪 ${outcome.title}` : '造訪失敗');
            },
            'chapter1-visit-route': () => {
                const group = getChapterOneRouteGroup(data.routeId);
                if (!group) {
                    this.refresh(`找不到第一章路線：${data.routeId}`);
                    return;
                }
                for (const landmarkId of group.landmarkIds || []) {
                    worldStoryManager.visitLandmark(landmarkId, { source: `${DEV_SOURCE}:chapter1`, chapterRouteId: group.id });
                }
                questManager.syncExplorationObjectives?.();
                this.refresh(`已造訪第一章路線：${group.name}`);
            },
            'chapter1-ready-boss': () => {
                const chain = WorldStoryChains[data.chainId];
                if (!chain) {
                    this.refresh(`找不到 Boss 線：${data.chainId}`);
                    return;
                }
                worldStoryManager.revealAllClues(data.chainId, { source: `${DEV_SOURCE}:chapter1` });
                for (const method of chain.progressMethods || []) {
                    worldStoryManager.recordProgress(data.chainId, method.id, { source: `${DEV_SOURCE}:chapter1` });
                }
                worldStoryManager.markFinalReady(data.chainId, { source: `${DEV_SOURCE}:chapter1` });
                questManager.syncExplorationObjectives?.();
                this.refresh(`已收束 Boss 線：${data.chainId}`);
            },
            'town-reset-initial': () => {
                for (const flag of DEV_TOWN_VISIBILITY_FLAGS) {
                    GameManager.setFlag(flag, false);
                }
                this.refresh('已切回第一章初始城鎮顯示');
            },
            'town-open-recovery': () => {
                for (const flag of DEV_TOWN_RECOVERY_FLAGS) {
                    GameManager.setFlag(flag, true);
                }
                this.refresh('已打開第一章回復網路顯示');
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

    getCombatValidationState() {
        const firstMonster = Object.values(MonsterDatabase)
            .sort((a, b) => (a.level || 1) - (b.level || 1))[0]?.id || 'slime';
        return {
            monsterId: this.state.combatMonsterId || firstMonster,
            weapon: this.state.combatWeaponId || '',
            armor: this.state.combatArmorId || '',
            accessory: this.state.combatAccessoryId || ''
        };
    }

    readCombatValidationState() {
        const fallback = this.getCombatValidationState();
        return {
            monsterId: this.body.querySelector('#dev-validation-monster')?.value || fallback.monsterId,
            weapon: this.body.querySelector('#dev-validation-weapon')?.value || '',
            armor: this.body.querySelector('#dev-validation-armor')?.value || '',
            accessory: this.body.querySelector('#dev-validation-accessory')?.value || ''
        };
    }

    resolveDevEquipmentItem(itemId, slot) {
        if (!itemId || itemId === '__none__') return null;
        const record = resolveItemRecord(itemId, { order: ['equipment', 'bossEquipment', 'questReward', 'shop'] });
        const item = record?.item;
        if (!item || getDevEquipmentSlot(item) !== slot) return null;
        return cloneDevItem(item);
    }

    applyCombatEquipmentSelection(character, selection) {
        for (const slot of ['weapon', 'armor', 'accessory']) {
            const itemId = selection[slot];
            if (!itemId) continue;
            character.equipment[slot] = itemId === '__none__'
                ? null
                : this.resolveDevEquipmentItem(itemId, slot);
        }
    }

    describeCombatEquipment(character) {
        return ['weapon', 'armor', 'accessory']
            .map(slot => `${EQUIPMENT_SLOT_LABELS[slot]}：${character.equipment?.[slot]?.name || '空'}`)
            .join(' / ');
    }

    describeCombatEffects(effects) {
        const parts = [
            effects.armorPenetration ? `破甲 ${effects.armorPenetration}%` : '',
            effects.damageReduction ? `減傷 ${effects.damageReduction}%` : '',
            effects.lifesteal ? `吸血 ${effects.lifesteal}%` : '',
            effects.doubleStrike ? `連擊 ${effects.doubleStrike}%` : '',
            effects.fire ? `火傷 ${effects.fire}%` : '',
            effects.void ? `虛空 ${effects.void}/秒` : ''
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(' / ') : '無主要戰鬥詞條';
    }

    runCombatValidation(mode = 'configured') {
        const selection = this.readCombatValidationState();
        const monsterId = selection.monsterId;
        if (mode === 'current') {
            this.savePanelState({ combatMonsterId: monsterId });
        } else {
            this.savePanelState({
                combatMonsterId: monsterId,
                combatWeaponId: selection.weapon,
                combatArmorId: selection.armor,
                combatAccessoryId: selection.accessory
            });
        }
        const sourceChar = GameManager.getCharacter();
        const character = this.cloneCharacterForValidation(sourceChar);
        if (mode !== 'current') this.applyCombatEquipmentSelection(character, selection);

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
        averageHit *= 1 + (effects.fire || 0) / 100;
        if (rank === 'boss') averageHit *= 1 + (effects.bossBonus || 0) / 100;
        averageHit *= 1 + ((effects.doubleStrike || 0) / 100) * 0.5;

        const playerDps = averageHit * getAttackSpeed(character) + (effects.void || 0);
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
        const modeLabel = mode === 'current' ? '目前裝備' : '指定配裝';

        this.validationResult = [
            `${modeLabel}｜${character.level || 1}級角色 vs ${monster.name || monster.id}（${rank}）`,
            this.describeCombatEquipment(character),
            `玩家：HP ${Math.round(playerHp)} / ATK ${getTotalAtk(character)} / DEF ${getTotalDef(character)} / AS ${getAttackSpeed(character).toFixed(2)} / DPS ${playerDps.toFixed(1)}`,
            `怪物：HP ${monster.hp} / ATK ${monster.attack} / DEF ${monster.defense} / AS ${monster.attackSpeed || 1} / DPS ${monsterDps.toFixed(1)}`,
            `詞條：${this.describeCombatEffects(effects)}`,
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
        this.savePanelState({ itemId, itemQty: quantity });

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
