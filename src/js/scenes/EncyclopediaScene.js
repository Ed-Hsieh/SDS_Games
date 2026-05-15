/**
 * EncyclopediaScene.js
 * Player-facing monster and blueprint encyclopedia.
 */

import GameManager from '../managers/GameManager.js';
import {
    getMonsterSkillRows,
    normalizeMonsterSkill
} from '../data/MonsterSkills.js';
import {
    formatChance,
    formatQuantity,
    getBlueprintEntries,
    getMonsterEntries,
    getReadableElement,
    getReadableType,
    isBlueprintKnownInEncyclopedia,
    isEncyclopediaRevealAll,
    isItemKnown,
    isMonsterKnown,
    setEncyclopediaRevealAll,
    unlockAllEncyclopediaEntries
} from '../managers/EncyclopediaManager.js';
import { resolveItemById } from '../utils/ItemResolver.js';
import { escapeHtml } from '../utils/ItemDisplay.js';
import { attachItemTooltip } from '../utils/ItemTooltip.js';
import { showGlobalToast } from '../utils/UIFeedback.js';

const silhouetteByType = {
    weapon: '⚔',
    armor: '⬟',
    equipment: '⬟',
    accessory: '◌',
    potion: '✚',
    material: '◆',
    key: '◇',
    blueprint: '▧'
};

function getSilhouette(type, fallback = '◆') {
    return silhouetteByType[type] || fallback;
}

function formatGold(gold) {
    if (Array.isArray(gold)) return `${gold[0]}-${gold[1]}`;
    return String(gold ?? 0);
}

function formatStats(stats = {}) {
    return Object.entries(stats)
        .filter(([, value]) => value !== 0 && value != null)
        .map(([key, value]) => `${key} ${value > 0 ? '+' : ''}${value}`)
        .join(' / ');
}

const RaritySortRank = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5
};

function buildTooltipStatsHtml(rows = []) {
    return rows
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([label, value]) => `
            <div class="item-detail-stat">
                <span>${escapeHtml(label)}</span>
                <span class="value">${escapeHtml(value)}</span>
            </div>
        `)
        .join('');
}

export default class EncyclopediaScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.activeTab = 'monsters';
        this.searchText = '';
        this.filterValue = 'all';
        this.sortValue = 'level-asc';
        this.selectedId = null;
        this.updateFromFlags = this.updateFromFlags.bind(this);
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        GameManager.subscribe(this.updateFromFlags);
        this.render();
    }

    cleanup() {
        GameManager.unsubscribe(this.updateFromFlags);
    }

    cacheDOM() {
        this.dom = {
            backButton: this.container.querySelector('#btn-codex-back'),
            revealButton: this.container.querySelector('#btn-codex-toggle-reveal'),
            unlockAllButton: this.container.querySelector('#btn-codex-unlock-all'),
            tabs: this.container.querySelectorAll('[data-codex-tab]'),
            search: this.container.querySelector('#codex-search'),
            filter: this.container.querySelector('#codex-filter'),
            sort: this.container.querySelector('#codex-sort'),
            list: this.container.querySelector('#codex-list'),
            detail: this.container.querySelector('#codex-detail'),
            summary: this.container.querySelector('#codex-summary')
        };
    }

    bindEvents() {
        this.dom.backButton?.addEventListener('click', () => {
            if (typeof this.app?.navigateTo === 'function') {
                this.app.navigateTo('lobby');
            } else if (window.location.hash.slice(1) === 'lobby') {
                this.app?.loadScene?.('lobby');
            } else {
                window.location.hash = 'lobby';
            }
        });

        this.dom.revealButton?.addEventListener('click', () => {
            setEncyclopediaRevealAll(!isEncyclopediaRevealAll());
            this.render();
        });

        this.dom.unlockAllButton?.addEventListener('click', () => {
            unlockAllEncyclopediaEntries();
            showGlobalToast('百科已解鎖', '所有百科資訊已標記為已知。', 'success');
            this.render();
        });

        this.dom.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.activeTab = tab.dataset.codexTab;
                this.selectedId = null;
                this.filterValue = 'all';
                this.sortValue = this.getDefaultSortValue();
                if (this.dom.filter) this.dom.filter.value = 'all';
                if (this.dom.sort) this.dom.sort.value = this.sortValue;
                this.render();
            });
        });

        this.dom.search?.addEventListener('input', event => {
            this.searchText = event.target.value.trim().toLowerCase();
            this.render();
        });

        this.dom.filter?.addEventListener('change', event => {
            this.filterValue = event.target.value;
            this.render();
        });

        this.dom.sort?.addEventListener('change', event => {
            this.sortValue = event.target.value;
            this.render();
        });

        this.dom.list?.addEventListener('click', event => {
            const row = event.target.closest('[data-entry-id]');
            if (!row) return;
            this.selectedId = row.dataset.entryId;
            this.render();
        });
    }

    updateFromFlags(_state, type) {
        if (type === 'flags' || type === 'all') this.render();
    }

    getEntries() {
        return this.activeTab === 'monsters' ? getMonsterEntries() : getBlueprintEntries();
    }

    getDefaultSortValue(tab = this.activeTab) {
        return tab === 'monsters' ? 'level-asc' : 'rarity-asc';
    }

    getFilteredEntries(entries = this.getEntries()) {
        const query = this.searchText;

        return entries.filter(entry => {
            const matchesFilter = this.filterValue === 'all'
                || entry.rank === this.filterValue
                || entry.rarity === this.filterValue
                || entry.sourceType === this.filterValue
                || entry.type === this.filterValue;

            if (!matchesFilter) return false;
            if (!query) return true;

            return [
                entry.id,
                entry.name,
                entry.sourceLabel,
                entry.rarity,
                entry.rank,
                entry.type
            ].some(value => String(value || '').toLowerCase().includes(query));
        });
    }

    getSortedEntries(entries) {
        const sorted = [...entries];
        const getRarityRank = entry => RaritySortRank[entry.rarity] || 0;
        const getLevel = entry => Number.isFinite(Number(entry.level)) ? Number(entry.level) : null;
        const getLevelMissingRank = entry => getLevel(entry) === null ? 1 : 0;
        const getSourceCount = entry => entry.drops?.length || (entry.discovery?.interactionId ? 1 : 0);
        const getName = entry => entry.name || entry.id || entry.entryId || '';

        sorted.sort((a, b) => {
            switch (this.sortValue) {
                case 'level-desc':
                    return getLevelMissingRank(a) - getLevelMissingRank(b)
                        || (getLevel(b) || 0) - (getLevel(a) || 0)
                        || getName(a).localeCompare(getName(b), 'zh-Hant');
                case 'rarity-asc':
                    return getRarityRank(a) - getRarityRank(b) || getName(a).localeCompare(getName(b), 'zh-Hant');
                case 'rarity-desc':
                    return getRarityRank(b) - getRarityRank(a) || getName(a).localeCompare(getName(b), 'zh-Hant');
                case 'source-desc':
                    return getSourceCount(b) - getSourceCount(a) || getName(a).localeCompare(getName(b), 'zh-Hant');
                case 'source-asc':
                    return getSourceCount(a) - getSourceCount(b) || getName(a).localeCompare(getName(b), 'zh-Hant');
                case 'type-asc':
                    return getReadableType(a.type || a.rank).localeCompare(getReadableType(b.type || b.rank), 'zh-Hant')
                        || getName(a).localeCompare(getName(b), 'zh-Hant');
                case 'name-asc':
                    return getName(a).localeCompare(getName(b), 'zh-Hant');
                case 'level-asc':
                default:
                    return getLevelMissingRank(a) - getLevelMissingRank(b)
                        || (getLevel(a) || 0) - (getLevel(b) || 0)
                        || getName(a).localeCompare(getName(b), 'zh-Hant');
            }
        });

        return sorted;
    }

    render() {
        const allEntries = this.getEntries();
        const entries = this.getSortedEntries(this.getFilteredEntries(allEntries));
        const selectedInFilteredEntries = entries.some(entry => this.getEntryId(entry) === this.selectedId);

        if (entries.length > 0 && (!this.selectedId || !selectedInFilteredEntries)) {
            this.selectedId = entries[0] ? this.getEntryId(entries[0]) : null;
        } else if (!this.selectedId && allEntries.length > 0) {
            this.selectedId = this.getEntryId(allEntries[0]);
        }

        this.renderHeader(entries, allEntries);
        this.renderFilters();
        this.renderList(entries);
        this.attachListTooltips(entries);

        const selectedEntry = entries.find(entry => this.getEntryId(entry) === this.selectedId)
            || allEntries.find(entry => this.getEntryId(entry) === this.selectedId)
            || null;
        this.renderDetail(selectedEntry);
        this.attachDetailTooltips(selectedEntry);
    }

    renderHeader(entries, allEntries = entries) {
        this.dom.tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.codexTab === this.activeTab);
        });

        if (this.dom.revealButton) {
            const revealAll = isEncyclopediaRevealAll();
            this.dom.revealButton.classList.toggle('is-active', revealAll);
            this.dom.revealButton.textContent = `顯示全部：${revealAll ? '開' : '關'}`;
        }

        if (this.dom.summary) {
            const knownCount = entries.filter(entry => entry.known).length;
            const label = this.activeTab === 'monsters' ? '怪物' : '圖紙';
            this.dom.summary.textContent = `${label} ${knownCount}/${allEntries.length}`;
        }
    }

    renderFilters() {
        if (this.dom.filter) {
            if (this.dom.filter.dataset.codexFilterMode !== this.activeTab) {
                if (this.activeTab === 'monsters') {
                    this.dom.filter.innerHTML = `
                        <option value="all">全部</option>
                        <option value="world">野外</option>
                        <option value="dungeon">副本</option>
                        <option value="tower">塔</option>
                        <option value="normal">普通</option>
                        <option value="elite">菁英</option>
                        <option value="boss">BOSS</option>
                        <option value="world_boss">世界 BOSS</option>
                    `;
                } else {
                    this.dom.filter.innerHTML = `
                        <option value="all">全部</option>
                        <option value="weapon">武器</option>
                        <option value="armor">防具</option>
                        <option value="equipment">裝備</option>
                        <option value="accessory">飾品</option>
                        <option value="potion">消耗品</option>
                        <option value="uncommon">Uncommon</option>
                        <option value="rare">Rare</option>
                        <option value="epic">Epic</option>
                        <option value="legendary">Legendary</option>
                    `;
                }

                this.dom.filter.dataset.codexFilterMode = this.activeTab;
            }

            this.dom.filter.value = this.filterValue;
        }

        if (!this.dom.sort) return;

        const sortOptions = this.activeTab === 'monsters'
            ? [
                ['level-asc', '等級低到高'],
                ['level-desc', '等級高到低'],
                ['rarity-desc', '稀有度高到低'],
                ['rarity-asc', '稀有度低到高'],
                ['name-asc', '名稱排序']
            ]
            : [
                ['rarity-asc', '稀有度低到高'],
                ['rarity-desc', '稀有度高到低'],
                ['source-desc', '來源多到少'],
                ['source-asc', '來源少到多'],
                ['type-asc', '類型排序'],
                ['name-asc', '名稱排序']
            ];

        if (!sortOptions.some(([value]) => value === this.sortValue)) {
            this.sortValue = this.getDefaultSortValue();
        }

        if (this.dom.sort.dataset.codexSortMode !== this.activeTab) {
            this.dom.sort.innerHTML = sortOptions
                .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
                .join('');
            this.dom.sort.dataset.codexSortMode = this.activeTab;
        }

        this.dom.sort.value = this.sortValue;
    }

    renderList(entries) {
        if (!this.dom.list) return;

        if (entries.length === 0) {
            this.dom.list.innerHTML = '<div class="codex-empty codex-list-empty">沒有符合條件的資料</div>';
            return;
        }

        this.dom.list.innerHTML = entries.map(entry => {
            const id = this.getEntryId(entry);
            const isSelected = id === this.selectedId;
            return this.activeTab === 'monsters'
                ? this.renderMonsterRow(entry, isSelected)
                : this.renderBlueprintRow(entry, isSelected);
        }).join('');
    }

    renderMonsterRow(entry, isSelected) {
        const known = entry.known;
        const name = known ? entry.name : '未知怪物';
        const icon = known ? entry.icon : getSilhouette('material', '◆');
        const subtitle = known
            ? `${entry.sourceLabel} / ${getReadableType(entry.rank)}`
            : `${entry.sourceLabel} / 未解鎖`;

        return `
            <button class="codex-list-row rarity-frame rarity-${escapeHtml(entry.rarity)} ${isSelected ? 'active' : ''} ${known ? '' : 'is-locked'}" data-entry-id="${escapeHtml(entry.entryId)}" type="button">
                <span class="codex-row-icon">${escapeHtml(icon)}</span>
                <span class="codex-row-main">
                    <strong>${escapeHtml(name)}</strong>
                    <small>${escapeHtml(subtitle)}</small>
                </span>
                <span class="codex-row-meta">Lv.${known ? escapeHtml(entry.level || '-') : '??'}</span>
            </button>
        `;
    }

    renderBlueprintRow(entry, isSelected) {
        const known = entry.known;
        const icon = known ? entry.icon : getSilhouette('blueprint', '▧');
        const sourceCount = entry.drops.length || (entry.discovery?.interactionId ? 1 : 0);

        return `
            <button class="codex-list-row rarity-frame rarity-${escapeHtml(entry.rarity)} ${isSelected ? 'active' : ''} ${known ? '' : 'is-locked'}" data-entry-id="${escapeHtml(entry.id)}" type="button">
                <span class="codex-row-icon">${escapeHtml(icon)}</span>
                <span class="codex-row-main">
                    <strong>${escapeHtml(known ? entry.name : '未知圖紙')}</strong>
                    <small>${escapeHtml(getReadableType(entry.type))} / ${escapeHtml(entry.rarity)}</small>
                </span>
                <span class="codex-row-meta">${sourceCount} 源</span>
            </button>
        `;
    }

    renderDetail(entry) {
        if (!this.dom.detail) return;
        if (!entry) {
            this.dom.detail.innerHTML = '<div class="codex-empty">沒有資料</div>';
            return;
        }

        this.dom.detail.innerHTML = this.activeTab === 'monsters'
            ? this.renderMonsterDetail(entry)
            : this.renderBlueprintDetail(entry);
    }

    renderMonsterDetail(entry) {
        const known = entry.known;
        const icon = known ? entry.icon : getSilhouette('material', '◆');
        const title = known ? entry.name : '未知怪物';
        const description = known ? (entry.description || '尚無描述') : '資料尚未解鎖';

        return `
            <section class="codex-detail-head">
                <div class="codex-portrait rarity-frame rarity-${escapeHtml(entry.rarity)} ${known ? '' : 'is-locked'}">${escapeHtml(icon)}</div>
                <div>
                    <div class="codex-kicker">${escapeHtml(entry.sourceLabel)} / ${escapeHtml(getReadableType(entry.rank))}</div>
                    <h2>${escapeHtml(title)}</h2>
                    <p>${escapeHtml(description)}</p>
                </div>
            </section>

            <section class="codex-stat-grid">
                ${this.renderStat('等級', known ? entry.level : '??')}
                ${this.renderStat('HP', known ? entry.maxHp : '???')}
                ${this.renderStat('攻擊', known ? entry.attack : '???')}
                ${this.renderStat('防禦', known ? entry.defense : '???')}
                ${this.renderStat('攻擊頻率', known ? `${entry.attackSpeed}s` : '???')}
                ${this.renderStat('屬性', known ? getReadableElement(entry.element) : '???')}
                ${this.renderStat('經驗', known ? entry.exp : '???')}
                ${this.renderStat('金幣', known ? formatGold(entry.gold) : '???')}
            </section>

            ${this.renderDropSection('掉落物品', entry.itemDrops, 'item')}
            ${this.renderDropSection('圖紙', entry.blueprintDrops, 'blueprint')}
            ${this.renderSkillSection(entry)}
        `;
    }

    renderBlueprintDetail(entry) {
        const known = entry.known;
        const icon = known ? entry.icon : getSilhouette('blueprint', '▧');
        const resultStats = formatStats(entry.result?.stats || {});

        return `
            <section class="codex-detail-head">
                <div class="codex-portrait rarity-frame rarity-${escapeHtml(entry.rarity)} ${known ? '' : 'is-locked'}">${escapeHtml(icon)}</div>
                <div>
                    <div class="codex-kicker">${escapeHtml(getReadableType(entry.type))} / ${escapeHtml(entry.rarity)}</div>
                    <h2>${escapeHtml(known ? entry.name : '未知圖紙')}</h2>
                    <p>${escapeHtml(known ? (entry.result?.desc || entry.discovery?.hint || '可透過探索、戰鬥或任務取得。') : '資料尚未解鎖')}</p>
                </div>
            </section>

            <section class="codex-stat-grid">
                ${this.renderStat('製作費', known ? `${entry.cost}G` : '???')}
                ${this.renderStat('成功率', known && entry.successRate != null ? `${entry.successRate}%` : '???')}
                ${this.renderStat('成品類型', known ? getReadableType(entry.result?.type || entry.type) : '???')}
                ${this.renderStat('成品數值', known ? (resultStats || '-') : '???')}
            </section>

            ${this.renderMaterials(entry, known)}
            ${this.renderBlueprintSources(entry)}
        `;
    }

    renderStat(label, value) {
        return `
            <div class="codex-stat">
                <span>${escapeHtml(label)}</span>
                <strong>${escapeHtml(value)}</strong>
            </div>
        `;
    }

    renderDropSection(title, drops, kind) {
        if (!drops || drops.length === 0) {
            return `
                <section class="codex-section">
                    <h3>${escapeHtml(title)}</h3>
                    <div class="codex-empty compact">無資料</div>
                </section>
            `;
        }

        return `
            <section class="codex-section">
                <h3>${escapeHtml(title)}</h3>
                <div class="codex-drop-grid">
                    ${drops.map(drop => this.renderDropToken(drop, kind)).join('')}
                </div>
            </section>
        `;
    }

    renderDropToken(drop, kind) {
        const known = kind === 'blueprint'
            ? isBlueprintKnownInEncyclopedia(drop.recipeId)
            : isItemKnown(drop.id);
        const icon = known ? drop.icon : getSilhouette(drop.type, kind === 'blueprint' ? '▧' : '◆');
        const name = known ? drop.name : '未解鎖';
        const quantity = kind === 'blueprint' ? '' : `x${formatQuantity(drop.quantity)}`;
        const dropId = kind === 'blueprint' ? drop.recipeId : drop.id;

        return `
            <div class="codex-drop-token rarity-frame rarity-${escapeHtml(drop.rarity)} ${known ? '' : 'is-locked'}" data-codex-kind="${escapeHtml(kind)}" data-drop-id="${escapeHtml(dropId)}">
                <div class="codex-drop-icon">${escapeHtml(icon)}</div>
                <div class="codex-drop-info">
                    <strong>${escapeHtml(name)}</strong>
                    <span>${escapeHtml(formatChance(drop.chance))} ${escapeHtml(quantity)}</span>
                </div>
            </div>
        `;
    }

    renderSkillSection(entry) {
        const skills = this.getNormalizedSkills(entry);
        return `
            <section class="codex-section">
                <h3>技能</h3>
                <div class="codex-pill-row">
                    ${skills.length > 0
                        ? skills.map((skill, index) => `<span class="codex-pill codex-skill-pill" data-skill-index="${index}">${escapeHtml(skill.icon)} ${escapeHtml(skill.category || '特殊')}｜${escapeHtml(skill.name)}</span>`).join('')
                        : '<span class="codex-pill muted">無資料</span>'}
                </div>
            </section>
        `;
    }

    renderMaterials(entry, known) {
        return `
            <section class="codex-section">
                <h3>材料</h3>
                <div class="codex-drop-grid">
                    ${(entry.materials || []).map(material => {
                        const item = resolveItemById(material.id, { order: ['material', 'shop', 'questReward'] });
                        const rarity = item?.rarity || 'common';
                        return `
                            <div class="codex-drop-token rarity-frame rarity-${escapeHtml(rarity)} ${known ? '' : 'is-locked'}" data-codex-kind="material" data-drop-id="${escapeHtml(material.id)}">
                                <div class="codex-drop-icon">${escapeHtml(known ? (item?.icon || '◆') : getSilhouette('material'))}</div>
                                <div class="codex-drop-info">
                                    <strong>${escapeHtml(known ? (item?.name || material.id) : '未解鎖')}</strong>
                                    <span>x${escapeHtml(material.quantity)}</span>
                                </div>
                            </div>
                        `;
                    }).join('') || '<div class="codex-empty compact">無材料資料</div>'}
                </div>
            </section>
        `;
    }

    renderBlueprintSources(entry) {
        const sources = entry.drops || [];
        return `
            <section class="codex-section">
                <h3>來源</h3>
                <div class="codex-source-list">
                    ${sources.length > 0 ? sources.map(source => {
                        const monsterKnown = isMonsterKnown(source.monster.entryId);
                        return `
                            <div class="codex-source-row" data-source-entry-id="${escapeHtml(source.monster.entryId)}">
                                <span>${escapeHtml(monsterKnown ? source.monster.name : '未知敵人')}</span>
                                <strong>${escapeHtml(source.monster.sourceLabel)} / ${escapeHtml(formatChance(source.chance))}</strong>
                            </div>
                        `;
                    }).join('') : `<div class="codex-source-row"><span>${escapeHtml(entry.discovery?.sourceName || '特殊互動')}</span><strong>${escapeHtml(entry.discovery?.interactionId || '-')}</strong></div>`}
                </div>
            </section>
        `;
    }

    attachListTooltips(entries) {
        if (!this.dom.list) return;

        this.dom.list.querySelectorAll('.codex-list-row').forEach(row => {
            const entry = entries.find(candidate => this.getEntryId(candidate) === row.dataset.entryId);
            if (entry) this.attachEntryTooltip(row, entry, this.activeTab);
        });
    }

    attachDetailTooltips(entry) {
        if (!entry || !this.dom.detail) return;

        const portrait = this.dom.detail.querySelector('.codex-portrait');
        this.attachEntryTooltip(portrait, entry, this.activeTab);

        if (this.activeTab === 'monsters') {
            this.attachMonsterDropTooltips(entry);
            this.attachSkillTooltips(entry);
        } else {
            this.attachBlueprintDetailTooltips(entry);
        }
    }

    attachEntryTooltip(element, entry, entryType) {
        if (!element || !entry) return;

        if (entryType === 'monsters') {
            attachItemTooltip(element, this.getMonsterTooltipItem(entry), this.getMonsterTooltipOptions(entry));
            return;
        }

        attachItemTooltip(element, this.getBlueprintTooltipItem(entry), this.getBlueprintTooltipOptions(entry));
    }

    attachMonsterDropTooltips(entry) {
        const itemDrops = new Map((entry.itemDrops || []).map(drop => [drop.id, drop]));
        const blueprintDrops = new Map((entry.blueprintDrops || []).map(drop => [drop.recipeId, drop]));
        const blueprintEntries = new Map(getBlueprintEntries().map(blueprint => [blueprint.id, blueprint]));

        this.dom.detail.querySelectorAll('.codex-drop-token[data-codex-kind]').forEach(token => {
            const kind = token.dataset.codexKind;
            const dropId = token.dataset.dropId;

            if (kind === 'blueprint') {
                const drop = blueprintDrops.get(dropId);
                const blueprint = blueprintEntries.get(dropId) || drop;
                if (!blueprint) return;

                const known = isBlueprintKnownInEncyclopedia(dropId);
                attachItemTooltip(
                    token,
                    this.getBlueprintTooltipItem(blueprint, known),
                    this.getBlueprintTooltipOptions(blueprint, known, [['掉落率', formatChance(drop?.chance)]])
                );
                return;
            }

            const drop = itemDrops.get(dropId);
            if (drop) this.attachItemDropTooltip(token, drop);
        });
    }

    attachBlueprintDetailTooltips(entry) {
        const materialMap = new Map((entry.materials || []).map(material => [material.id, material]));
        const monsterEntries = new Map(getMonsterEntries().map(monster => [monster.entryId, monster]));

        this.dom.detail.querySelectorAll('.codex-drop-token[data-codex-kind="material"]').forEach(token => {
            const material = materialMap.get(token.dataset.dropId);
            if (material) this.attachMaterialTooltip(token, material, entry.known);
        });

        this.dom.detail.querySelectorAll('.codex-source-row[data-source-entry-id]').forEach(row => {
            const monster = monsterEntries.get(row.dataset.sourceEntryId);
            if (monster) this.attachEntryTooltip(row, monster, 'monsters');
        });
    }

    attachItemDropTooltip(element, drop) {
        const known = isItemKnown(drop.id);
        const item = known
            ? {
                ...(resolveItemById(drop.id, { order: ['material', 'equipment', 'bossEquipment', 'shop', 'questReward'] }) || {}),
                id: drop.id,
                name: drop.name,
                icon: drop.icon,
                type: drop.type,
                rarity: drop.rarity
            }
            : {
                name: '未知掉落物',
                icon: getSilhouette(drop.type),
                type: drop.type,
                rarity: drop.rarity,
                description: '尚未解鎖的掉落資訊。'
            };

        attachItemTooltip(element, item, {
            description: known ? undefined : '尚未解鎖的掉落資訊。',
            footerRows: [
                ['掉落率', formatChance(drop.chance)],
                ['數量', formatQuantity(drop.quantity)]
            ],
            hint: known ? '百科掉落資料' : '取得或發現後解鎖'
        });
    }

    attachMaterialTooltip(element, material, recipeKnown) {
        const resolved = resolveItemById(material.id, { order: ['material', 'shop', 'questReward'] });
        const known = recipeKnown && resolved;
        const item = known
            ? resolved
            : {
                name: '未知材料',
                icon: getSilhouette('material'),
                type: 'material',
                rarity: resolved?.rarity || 'common',
                description: '圖紙解鎖後會顯示材料資訊。'
            };

        attachItemTooltip(element, item, {
            quantity: known ? material.quantity : undefined,
            description: known ? undefined : '圖紙解鎖後會顯示材料資訊。',
            hint: known ? '製作材料' : '圖紙解鎖後顯示'
        });
    }

    getNormalizedSkills(entry) {
        if (!entry?.known) return [];
        return (entry.skills || []).map(skill => normalizeMonsterSkill(skill));
    }

    attachSkillTooltips(entry) {
        const skills = this.getNormalizedSkills(entry);
        this.dom.detail.querySelectorAll('.codex-skill-pill[data-skill-index]').forEach(pill => {
            const skill = skills[Number(pill.dataset.skillIndex)];
            if (!skill) return;
            attachItemTooltip(pill, this.getSkillTooltipItem(skill), this.getSkillTooltipOptions(skill));
        });
    }

    getSkillTooltipItem(skill) {
        return {
            id: skill.id,
            name: skill.name,
            icon: skill.icon,
            type: 'skill',
            rarity: skill.rarity || 'rare',
            description: skill.description
        };
    }

    getSkillTooltipOptions(skill) {
        return {
            typeText: '怪物技能',
            rarityText: skill.category || '特殊',
            description: skill.description,
            statsHtml: buildTooltipStatsHtml(getMonsterSkillRows(skill)),
            hint: '滑過技能可查看效果'
        };
    }

    getMonsterTooltipItem(entry) {
        const known = entry.known;
        return {
            id: entry.entryId,
            name: known ? entry.name : '未知怪物',
            icon: known ? entry.icon : getSilhouette('material'),
            type: 'monster',
            rarity: entry.rarity,
            description: known ? (entry.description || '百科中的怪物資料。') : '尚未解鎖的怪物資料。'
        };
    }

    getMonsterTooltipOptions(entry) {
        const known = entry.known;
        return {
            typeText: entry.sourceLabel,
            rarityText: known ? getReadableType(entry.rank) : '未解鎖',
            description: known ? (entry.description || '百科中的怪物資料。') : '尚未解鎖的怪物資料。',
            statsHtml: known ? buildTooltipStatsHtml([
                ['等級', entry.level || '-'],
                ['HP', entry.maxHp],
                ['攻擊', entry.attack],
                ['防禦', entry.defense],
                ['攻擊頻率', `${entry.attackSpeed}s`],
                ['屬性', getReadableElement(entry.element)]
            ]) : '',
            footerRows: known ? [
                ['經驗', entry.exp],
                ['金幣', formatGold(entry.gold)]
            ] : [],
            hint: known ? '百科怪物資料' : '擊敗或發現後解鎖'
        };
    }

    getBlueprintTooltipItem(entry, forcedKnown = null) {
        const known = forcedKnown ?? entry.known;
        return {
            id: entry.id || entry.recipeId,
            name: known ? entry.name : '未知圖紙',
            icon: known ? entry.icon : getSilhouette('blueprint'),
            type: 'blueprint',
            rarity: entry.rarity || 'rare',
            description: known
                ? (entry.result?.desc || entry.discovery?.hint || '可透過鍛造製作的圖紙。')
                : '尚未解鎖的圖紙資料。'
        };
    }

    getBlueprintTooltipOptions(entry, forcedKnown = null, extraFooterRows = []) {
        const known = forcedKnown ?? entry.known;
        const resultStats = formatStats(entry.result?.stats || {});
        const sourceCount = entry.drops?.length || (entry.discovery?.interactionId ? 1 : 0);

        return {
            typeText: '圖紙',
            rarityText: entry.rarity || 'rare',
            description: known
                ? (entry.result?.desc || entry.discovery?.hint || '可透過鍛造製作的圖紙。')
                : '尚未解鎖的圖紙資料。',
            statsHtml: known ? buildTooltipStatsHtml([
                ['成品', entry.result?.name || entry.name || '-'],
                ['類型', getReadableType(entry.result?.type || entry.type)],
                ['製作費', `${entry.cost || 0}G`],
                ['成功率', entry.successRate != null ? `${entry.successRate}%` : '-'],
                ['能力', resultStats || '-']
            ]) : '',
            footerRows: [
                ...(known ? [['來源數', `${sourceCount}`]] : []),
                ...extraFooterRows.filter(([, value]) => value !== undefined && value !== null)
            ],
            hint: known ? '百科圖紙資料' : '取得圖紙後解鎖'
        };
    }

    getEntryId(entry) {
        return this.activeTab === 'monsters' ? entry.entryId : entry.id;
    }
}
