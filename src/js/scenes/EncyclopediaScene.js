/**
 * EncyclopediaScene.js
 * Five-category player codex with category-specific presentation rules.
 */

import GameManager from '../managers/GameManager.js';
import {
    formatChance,
    formatQuantity,
    getBlueprintEntries,
    getItemEntries,
    getMonsterEntries,
    isBlueprintKnownInEncyclopedia,
    isBlueprintSeriesKnownInEncyclopedia,
    isEncyclopediaRevealAll,
    isItemKnown,
    isMonsterKnown,
    setEncyclopediaRevealAll,
    syncMonsterKnowledge,
    syncOwnedItemKnowledge,
    unlockAllEncyclopediaEntries
} from '../managers/EncyclopediaManager.js?v=codex-runtime-20260719c';
import {
    CodexCategoryId,
    applyCodexClass,
    compareCodexEntries,
    getCodexClass,
    getCodexItemCategory,
    getReadableCodexRarity,
    getReadableCodexType,
    getReadableSourceType
} from '../data/CodexCatalogClasses.js?v=ui-convergence-20260712y';
import {
    buildItemStatChipsHtml,
    escapeHtml,
    getItemVisualHtml
} from '../utils/ItemDisplay.js';
import { attachItemTooltip } from '../utils/ItemTooltip.js';
import { showGlobalToast } from '../utils/UIFeedback.js';
import { isDevModeEnabled } from '../utils/DevMode.js';
import { getGeneratedMonsterImage } from '../data/AssetManifest.js';
import { resolveItemById } from '../utils/ItemResolver.js';
import {
    getMonsterSkillRows,
    normalizeMonsterSkill
} from '../data/MonsterSkills.js';

const ItemTabs = new Set([
    CodexCategoryId.EQUIPMENT,
    CodexCategoryId.MATERIALS,
    CodexCategoryId.ITEMS
]);

const UnknownIcon = {
    equipment: '?',
    materials: '?',
    blueprints: '?',
    items: '?',
    monsters: '?',
    monster: '?'
};

function getEntryId(entry = {}) {
    return entry.id || entry.entryId || entry.recipeId || '';
}

function getItemFromEntry(entry = {}) {
    return entry.item || entry.result || entry;
}

function getSourceLabel(entry = {}) {
    return (entry.sources || []).map(source => source.label).join(' / ') || entry.sourceLabel || '-';
}

function hasFilterMatch(entry = {}, filterValue) {
    if (!filterValue || filterValue === 'all') return true;
    return entry.rarity === filterValue
        || entry.type === filterValue
        || entry.sourceType === filterValue
        || entry.result?.type === filterValue
        || (entry.sources || []).some(source => source.type === filterValue)
        || (entry.sourceRefs || []).some(source => source.type === filterValue);
}

function getSearchText(entry = {}) {
    return [
        entry.id,
        entry.entryId,
        entry.name,
        entry.catalogNo,
        entry.type,
        entry.rarity,
        entry.sourceLabel,
        entry.rank,
        entry.element,
        entry.attack,
        entry.defense,
        entry.maxHp,
        ...(entry.skills || []).map(skill => typeof skill === 'string' ? skill : skill?.name || skill?.id),
        entry.result?.name,
        entry.result?.id,
        ...(entry.sources || []).flatMap(source => [source.type, source.label]),
        ...(entry.sourceRefs || []).flatMap(source => [
            source.type,
            source.label,
            source.sourceLabel,
            source.npcName,
            source.description
        ]),
        ...(entry.usageRefs || []).flatMap(usage => [usage.type, usage.label, usage.id]),
        ...(entry.codexLinks || []).flatMap(link => [link.category, link.id, link.label])
    ].join(' ').toLowerCase();
}

function formatPrice(value) {
    return value == null ? '-' : `${value}G`;
}

function formatChapter(value) {
    return value == null ? '-' : `第 ${value} 章`;
}

function safePercent(value) {
    return value == null ? '-' : formatChance(value);
}

function readItemDescription(item = {}, fallback = '尚未記錄更多說明。') {
    return item.description || item.desc || fallback;
}

function renderStat(label, value) {
    return `
        <div class="codex-stat">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
        </div>
    `;
}

function renderEmpty(text = '尚無資料') {
    return `<div class="codex-empty compact">${escapeHtml(text)}</div>`;
}

export default class EncyclopediaScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.activeTab = CodexCategoryId.EQUIPMENT;
        this.searchText = '';
        this.filterValue = 'all';
        this.sortKey = getCodexClass(this.activeTab).defaultSort;
        this.sortDirection = 'asc';
        this.selectedId = null;
        this.updateFromFlags = this.updateFromFlags.bind(this);
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        syncMonsterKnowledge();
        syncOwnedItemKnowledge();
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
            sortDirection: this.container.querySelector('#codex-sort-direction'),
            list: this.container.querySelector('#codex-list'),
            detail: this.container.querySelector('#codex-detail'),
            summary: this.container.querySelector('#codex-summary')
        };
    }

    bindEvents() {
        this.dom.backButton?.addEventListener('click', () => {
            if (typeof this.app?.navigateTo === 'function') this.app.navigateTo('lobby');
            else this.app?.loadScene?.('lobby');
        });

        this.dom.revealButton?.addEventListener('click', () => {
            if (!isDevModeEnabled()) return;
            setEncyclopediaRevealAll(!isEncyclopediaRevealAll());
        });

        this.dom.unlockAllButton?.addEventListener('click', () => {
            if (!isDevModeEnabled()) return;
            unlockAllEncyclopediaEntries();
            showGlobalToast('百科已更新', '全部百科資訊已解鎖。', 'success');
        });

        this.dom.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.activeTab = tab.dataset.codexTab;
                this.selectedId = null;
                this.filterValue = 'all';
                this.sortKey = getCodexClass(this.activeTab).defaultSort;
                this.sortDirection = 'asc';
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
            this.sortKey = event.target.value;
            this.render();
        });

        this.dom.sortDirection?.addEventListener('click', () => {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
            this.render();
        });

        this.dom.list?.addEventListener('click', event => {
            const row = event.target.closest('[data-entry-id]');
            if (!row) return;
            this.selectedId = row.dataset.entryId;
            this.render();
        });

        this.dom.detail?.addEventListener('click', event => {
            const link = event.target.closest('[data-codex-link-category][data-codex-link-id]');
            if (!link) return;
            this.navigateToCodexEntry(link.dataset.codexLinkCategory, link.dataset.codexLinkId);
        });
    }

    updateFromFlags(_state, type) {
        if (type === 'flags' || type === 'story-journal' || type === 'all') this.render();
    }

    getEntriesForCategory(categoryId = this.activeTab) {
        if (categoryId === CodexCategoryId.BLUEPRINTS) {
            return applyCodexClass(categoryId, getBlueprintEntries());
        }

        if (categoryId === CodexCategoryId.MONSTERS) {
            return applyCodexClass(categoryId, getMonsterEntries());
        }

        if (ItemTabs.has(categoryId)) {
            const entries = getItemEntries().filter(entry => getCodexItemCategory(entry) === categoryId);
            return applyCodexClass(categoryId, entries);
        }

        return [];
    }

    getEntries() {
        return this.getEntriesForCategory(this.activeTab);
    }

    navigateToCodexEntry(category, id) {
        if (!category || !id) return;
        const targetEntries = this.getEntriesForCategory(category);
        if (!targetEntries.some(entry => getEntryId(entry) === id)) {
            showGlobalToast('百科尚未收錄', '這個目標目前沒有可跳轉的百科條目。', 'warning');
            return;
        }

        this.activeTab = category;
        this.selectedId = id;
        this.filterValue = 'all';
        this.searchText = '';
        this.sortKey = getCodexClass(this.activeTab).defaultSort;
        this.sortDirection = 'asc';
        if (this.dom.search) this.dom.search.value = '';
        this.render();
    }

    getCategoryForItem(item = {}) {
        if (!item?.id) return CodexCategoryId.ITEMS;
        const entry = getItemEntries().find(candidate => candidate.id === item.id);
        return entry ? getCodexItemCategory(entry) : getCodexItemCategory(item);
    }

    getFilteredEntries(entries = this.getEntries()) {
        const query = this.searchText;
        return entries.filter(entry => {
            if (!hasFilterMatch(entry, this.filterValue)) return false;
            return !query || getSearchText(entry).includes(query);
        });
    }

    getSortedEntries(entries) {
        const direction = this.sortDirection === 'desc' ? -1 : 1;
        return [...entries].sort((a, b) => compareCodexEntries(this.activeTab, this.sortKey, direction, a, b));
    }

    render() {
        const allEntries = this.getEntries();
        const entries = this.getSortedEntries(this.getFilteredEntries(allEntries));
        const selectedExists = entries.some(entry => getEntryId(entry) === this.selectedId);

        if (entries.length > 0 && (!this.selectedId || !selectedExists)) {
            this.selectedId = getEntryId(entries[0]);
        } else if (entries.length === 0) {
            this.selectedId = null;
        }

        this.renderHeader(entries, allEntries);
        this.renderControls();
        this.renderList(entries);

        const selectedEntry = entries.find(entry => getEntryId(entry) === this.selectedId) || null;
        this.renderDetail(selectedEntry);
        this.attachTooltips(selectedEntry);
    }

    renderHeader(entries, allEntries) {
        const CodexClass = getCodexClass(this.activeTab);
        this.dom.tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.codexTab === this.activeTab);
        });

        const devMode = isDevModeEnabled();
        if (this.dom.revealButton) {
            const revealAll = isEncyclopediaRevealAll();
            this.dom.revealButton.hidden = !devMode;
            this.dom.revealButton.classList.toggle('is-active', devMode && revealAll);
            this.dom.revealButton.textContent = `顯示全部：${revealAll ? '開' : '關'}`;
        }
        if (this.dom.unlockAllButton) this.dom.unlockAllButton.hidden = !devMode;

        if (this.dom.summary) {
            const knownCount = entries.filter(entry => entry.known).length;
            this.dom.summary.textContent = `${CodexClass.label} ${knownCount}/${allEntries.length}`;
        }
    }

    renderControls() {
        const CodexClass = getCodexClass(this.activeTab);

        if (this.dom.filter) {
            this.dom.filter.innerHTML = CodexClass.filters
                .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
                .join('');
            this.dom.filter.value = this.filterValue;
        }

        if (this.dom.sort) {
            if (!CodexClass.sorts.some(([value]) => value === this.sortKey)) {
                this.sortKey = CodexClass.defaultSort;
            }
            this.dom.sort.innerHTML = CodexClass.sorts
                .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
                .join('');
            this.dom.sort.value = this.sortKey;
        }

        if (this.dom.sortDirection) {
            this.dom.sortDirection.textContent = this.sortDirection === 'asc' ? '↑' : '↓';
            this.dom.sortDirection.setAttribute('aria-label', this.sortDirection === 'asc' ? '正序' : '倒序');
        }
    }

    renderList(entries) {
        if (!this.dom.list) return;
        if (entries.length === 0) {
            this.dom.list.innerHTML = '<div class="codex-empty codex-list-empty">沒有符合條件的資料</div>';
            return;
        }

        const CodexClass = getCodexClass(this.activeTab);
        this.dom.list.innerHTML = entries.map(entry => {
            const known = entry.known;
            const id = getEntryId(entry);
            const item = getItemFromEntry(entry);
            const icon = known && this.activeTab === CodexCategoryId.MONSTERS
                ? this.renderMonsterVisual(entry)
                : known
                    ? getItemVisualHtml(item, UnknownIcon[this.activeTab], this.activeTab === CodexCategoryId.BLUEPRINTS ? 'codex-blueprint-image' : 'codex-item-image')
                    : escapeHtml(UnknownIcon[this.activeTab]);
            const name = known ? entry.name : '未解鎖';
            const subtitle = known ? CodexClass.getSubtitle(entry) : '尚未取得資料';
            const meta = known ? CodexClass.getListMeta(entry) : '';

            return `
                <button class="codex-list-row rarity-frame rarity-${escapeHtml(entry.rarity || 'common')} ${id === this.selectedId ? 'active' : ''} ${known ? '' : 'is-locked'}"
                    data-entry-id="${escapeHtml(id)}"
                    type="button">
                    <span class="codex-row-icon">${icon}</span>
                    <span class="codex-row-main">
                        <strong>${escapeHtml(name)}</strong>
                        <small>${escapeHtml(subtitle)}</small>
                    </span>
                    <span class="codex-row-meta">${escapeHtml(meta)}</span>
                </button>
            `;
        }).join('');
    }

    renderDetail(entry) {
        if (!this.dom.detail) return;
        if (!entry) {
            this.dom.detail.innerHTML = '<div class="codex-empty">沒有資料</div>';
            return;
        }

        if (this.activeTab === CodexCategoryId.EQUIPMENT) {
            this.dom.detail.innerHTML = this.renderEquipmentDetail(entry);
        } else if (this.activeTab === CodexCategoryId.MATERIALS) {
            this.dom.detail.innerHTML = this.renderMaterialDetail(entry);
        } else if (this.activeTab === CodexCategoryId.BLUEPRINTS) {
            this.dom.detail.innerHTML = this.renderBlueprintDetail(entry);
        } else if (this.activeTab === CodexCategoryId.MONSTERS) {
            this.dom.detail.innerHTML = this.renderMonsterDetail(entry);
        } else {
            this.dom.detail.innerHTML = this.renderItemDetail(entry);
        }
    }

    renderDetailHead(entry, options = {}) {
        const known = entry.known;
        const item = options.item || getItemFromEntry(entry);
        const icon = known
            ? getItemVisualHtml(item, options.fallbackIcon || UnknownIcon[this.activeTab], options.imageClass || 'codex-item-image')
            : escapeHtml(options.lockedIcon || UnknownIcon[this.activeTab]);
        const title = known ? (options.title || entry.name) : '未解鎖';
        const kicker = known ? (options.kicker || '') : '尚未取得資料';
        const description = known ? options.description : '取得、擊敗或發現後，百科會補上完整內容。';

        return `
            <section class="codex-detail-head">
                <div class="codex-portrait rarity-frame rarity-${escapeHtml(entry.rarity || 'common')} ${known ? '' : 'is-locked'}">${icon}</div>
                <div>
                    <div class="codex-kicker">${escapeHtml(kicker)}</div>
                    <h2>${escapeHtml(title)}</h2>
                    <p>${escapeHtml(description || '尚未記錄更多說明。')}</p>
                </div>
            </section>
        `;
    }

    renderMonsterVisual(entry = {}, imageClass = 'codex-item-image') {
        const image = entry.image || getGeneratedMonsterImage(String(entry.id || entry.entryId || '').replace(/^world:|^tower:|^dungeon:[^:]+:/g, ''));
        if (image) {
            return `<img src="${escapeHtml(image)}" alt="${escapeHtml(entry.name || '')}" class="${escapeHtml(imageClass)}">`;
        }
        return escapeHtml(entry.icon || UnknownIcon.monster);
    }

    renderMonsterDetail(entry) {
        const known = entry.known;
        const icon = known ? this.renderMonsterVisual(entry, 'codex-monster-image') : escapeHtml(UnknownIcon.monsters);
        const title = known ? entry.name : '未解鎖';
        const description = known
            ? (entry.description || '已記錄的敵人。')
            : '遭遇或擊敗後，百科會補上完整怪物資料。';

        return `
            <section class="codex-detail-head">
                <div class="codex-portrait rarity-frame rarity-${escapeHtml(entry.rarity || 'common')} ${known ? '' : 'is-locked'}">${icon}</div>
                <div>
                    <div class="codex-kicker">${escapeHtml(known ? `${getReadableCodexType(entry.rank || entry.type)} / ${entry.sourceLabel || '未知地點'}` : '尚未取得資料')}</div>
                    <h2>${escapeHtml(title)}</h2>
                    <p>${escapeHtml(description)}</p>
                </div>
            </section>
            <section class="codex-stat-grid">
                ${renderStat('等級', known ? (entry.level ?? '-') : '???')}
                ${renderStat('生命', known ? (entry.maxHp ?? '-') : '???')}
                ${renderStat('攻擊', known ? (entry.attack ?? '-') : '???')}
                ${renderStat('防禦', known ? (entry.defense ?? '-') : '???')}
                ${renderStat('元素', known ? getReadableCodexType(entry.element || 'none') : '???')}
                ${renderStat('出沒', known ? (entry.sourceLabel || '-') : '???')}
            </section>
            ${this.renderMonsterSkillSection(entry)}
            ${this.renderMonsterDropSection(entry)}
        `;
    }

    renderMonsterSkillSection(entry) {
        if (!entry.known) return '';
        const skills = (entry.skills || []).map(skill => normalizeMonsterSkill(skill));
        return `
            <section class="codex-section">
                <h3>狀態與技能</h3>
                <div class="codex-skill-grid">
                    ${skills.map(skill => this.renderMonsterSkillCard(skill)).join('') || renderEmpty('沒有已知特殊狀態')}
                </div>
            </section>
        `;
    }

    renderMonsterSkillCard(skill = {}) {
        const rows = getMonsterSkillRows(skill)
            .filter(([label]) => label !== '分類')
            .slice(0, 4);
        return `
            <article class="codex-skill-card rarity-frame rarity-${escapeHtml(skill.rarity || 'rare')}">
                <div class="codex-skill-head">
                    <span class="codex-skill-icon">${escapeHtml(skill.icon || '✦')}</span>
                    <span class="codex-skill-copy">
                        <strong>${escapeHtml(skill.name || skill.id || '特殊技能')}</strong>
                        <small>${escapeHtml(skill.category || '特殊')}</small>
                    </span>
                </div>
                <p>${escapeHtml(skill.description || '怪物使用的特殊能力。')}</p>
                <div class="codex-skill-rows">
                    ${rows.map(([label, value]) => `
                        <span><b>${escapeHtml(label)}</b>${escapeHtml(value)}</span>
                    `).join('')}
                </div>
            </article>
        `;
    }

    renderMonsterDropSection(entry) {
        if (!entry.known) return '';
        const itemDrops = (entry.itemDrops || []).map(drop => this.renderMonsterItemDrop(drop)).join('');
        const blueprintDrops = (entry.blueprintDrops || []).map(drop => this.renderMonsterBlueprintDrop(drop)).join('');
        return `
            <section class="codex-section">
                <h3>掉落物</h3>
                <div class="codex-drop-grid">
                    ${itemDrops || renderEmpty('尚未整理物品掉落')}
                </div>
            </section>
            <section class="codex-section">
                <h3>圖紙掉落</h3>
                <div class="codex-drop-grid">
                    ${blueprintDrops || renderEmpty('尚未整理圖紙掉落')}
                </div>
            </section>
        `;
    }

    renderMonsterItemDrop(drop = {}) {
        const item = resolveItemById(drop.id, { order: ['equipment', 'material', 'shop', 'rewardItem'] }) || drop;
        const itemKnown = Boolean(drop.id && isItemKnown(drop.id));
        const category = this.getCategoryForItem({ ...item, id: drop.id || item.id });
        return `
            <button class="codex-drop-token rarity-frame rarity-${escapeHtml(item.rarity || 'common')}"
                type="button"
                data-codex-link-category="${escapeHtml(category)}"
                data-codex-link-id="${escapeHtml(drop.id || item.id || '')}">
                <div class="codex-drop-icon">${itemKnown ? getItemVisualHtml(item, '?', 'codex-drop-image') : escapeHtml(UnknownIcon.items)}</div>
                <div class="codex-drop-info">
                    <strong>${escapeHtml(itemKnown ? (item.name || drop.id || '未知物品') : '未解鎖物品')}</strong>
                    <span>${escapeHtml(formatChance(drop.chance))}</span>
                </div>
            </button>
        `;
    }

    renderMonsterBlueprintDrop(drop = {}) {
        const blueprintId = drop.seriesId || drop.recipeId || drop.id;
        const blueprint = getBlueprintEntries().find(entry =>
            entry.seriesId === blueprintId ||
            entry.recipeId === blueprintId ||
            entry.id === blueprintId
        ) || drop;
        const known = drop.seriesId
            ? isBlueprintSeriesKnownInEncyclopedia(drop.seriesId)
            : Boolean(drop.recipeId && isBlueprintKnownInEncyclopedia(drop.recipeId));
        return `
            <button class="codex-drop-token rarity-frame rarity-${escapeHtml(blueprint?.rarity || 'rare')}"
                type="button"
                data-codex-link-category="${escapeHtml(CodexCategoryId.BLUEPRINTS)}"
                data-codex-link-id="${escapeHtml(blueprintId || '')}">
                <div class="codex-drop-icon">${known ? getItemVisualHtml({ ...blueprint, type: 'blueprint' }, '?', 'codex-drop-image') : escapeHtml(UnknownIcon.blueprints)}</div>
                <div class="codex-drop-info">
                    <strong>${escapeHtml(known ? (blueprint?.name || drop.recipeId || '未知圖紙') : '未解鎖圖紙')}</strong>
                    <span>${escapeHtml(formatChance(drop.chance))}</span>
                </div>
            </button>
        `;
    }

    renderEquipmentDetail(entry) {
        const item = entry.item || entry;
        const known = entry.known;
        const statChips = known
            ? buildItemStatChipsHtml(item, { chipClass: 'codex-pill', emptyText: '沒有戰鬥數值', showMore: false })
            : '<span class="codex-pill muted">尚未解鎖</span>';

        return `
            ${this.renderDetailHead(entry, {
                item,
                kicker: `${getReadableCodexType(entry.type)} / ${getReadableCodexRarity(entry.rarity)}`,
                description: readItemDescription(item)
            })}
            <section class="codex-stat-grid">
                ${renderStat('等級', known ? (entry.level ?? '-') : '???')}
                ${renderStat('稀有度', known ? getReadableCodexRarity(entry.rarity) : '???')}
                ${renderStat('來源', known ? getSourceLabel(entry) : '???')}
            </section>
            <section class="codex-section">
                <h3>裝備數值</h3>
                <div class="codex-pill-row">${statChips}</div>
            </section>
            ${this.renderSourceSection(entry, '取得來源')}
        `;
    }

    renderMaterialDetail(entry) {
        const item = entry.item || entry;
        const known = entry.known;

        return `
            ${this.renderDetailHead(entry, {
                item,
                kicker: getReadableCodexRarity(entry.rarity),
                description: readItemDescription(item)
            })}
            <section class="codex-stat-grid">
                ${renderStat('稀有度', known ? getReadableCodexRarity(entry.rarity) : '???')}
                ${renderStat('價格', known ? formatPrice(entry.price) : '???')}
                ${renderStat('用途數', known ? `${entry.usageRefs?.length || 0}` : '???')}
            </section>
            ${this.renderSourceSection(entry, '素材來源')}
            ${this.renderUsageSection(entry)}
        `;
    }

    renderBlueprintDetail(entry) {
        const known = entry.known;
        const result = entry.result || {};
        const resultItem = {
            ...result,
            id: result.id || entry.id,
            name: result.name || entry.name,
            rarity: result.rarity || entry.rarity,
            type: result.type || entry.type
        };

        return `
            ${this.renderDetailHead(entry, {
                item: { ...entry, type: 'blueprint' },
                imageClass: 'codex-blueprint-image',
                fallbackIcon: UnknownIcon.blueprints,
                kicker: `圖紙 / ${getReadableCodexRarity(entry.rarity)}`,
                description: entry.discovery?.hint || readItemDescription(resultItem, '記錄一件可鍛造物的製作方式。')
            })}
            <section class="codex-stat-grid">
                ${renderStat('製作費', known ? formatPrice(entry.cost) : '???')}
                ${renderStat('成功率', known ? (entry.successRate != null ? `${entry.successRate}%` : '-') : '???')}
                ${renderStat('成品類型', known ? getReadableCodexType(resultItem.type) : '???')}
                ${renderStat('來源數', known ? `${entry.drops?.length || (entry.discovery ? 1 : 0)}` : '???')}
            </section>
            ${this.renderBlueprintResult(entry, resultItem)}
            ${this.renderMaterialCostSection(entry)}
            ${this.renderBlueprintSources(entry)}
        `;
    }

    renderItemDetail(entry) {
        const item = entry.item || entry;
        const known = entry.known;
        const effectText = this.getItemUsageText(item);

        return `
            ${this.renderDetailHead(entry, {
                item,
                kicker: getReadableCodexType(entry.type),
                description: readItemDescription(item)
            })}
            <section class="codex-stat-grid">
                ${renderStat('類型', known ? getReadableCodexType(entry.type) : '???')}
                ${renderStat('稀有度', known ? getReadableCodexRarity(entry.rarity) : '???')}
                ${renderStat('來源', known ? getSourceLabel(entry) : '???')}
            </section>
            <section class="codex-section">
                <h3>用途</h3>
                <div class="codex-source-list">
                    <div class="codex-source-row">
                        <span>${escapeHtml(effectText.label)}</span>
                        <strong>${escapeHtml(effectText.value)}</strong>
                    </div>
                </div>
            </section>
            ${this.renderSourceSection(entry, '取得來源')}
        `;
    }

    getItemUsageText(item = {}) {
        if (item.hp != null) return { label: '使用效果', value: `恢復生命 ${item.hp}` };
        if (item.effect?.hp != null) return { label: '使用效果', value: `恢復生命 ${item.effect.hp}` };
        if (item.effect?.cure) return { label: '使用效果', value: `解除 ${item.effect.cure}` };
        if (item.buff?.type) return { label: '使用效果', value: '暫時增益' };
        if (item.isSecretKey) return { label: '持有用途', value: '開啟特殊交易或劇情入口' };
        if (item.type === 'currency') return { label: '持有用途', value: '可在特定系統中兌換' };
        if (item.type === 'key' || item.type === 'quest') return { label: '持有用途', value: '推進任務、地點或特殊互動' };
        if (item.type === 'book') return { label: '閱讀用途', value: '閱讀後解鎖紀錄或能力' };
        return { label: '持有用途', value: '特殊物品' };
    }

    renderBlueprintResult(entry, resultItem) {
        if (!entry.known) return '';
        const resultItems = Array.isArray(entry.results) && entry.results.length > 0
            ? entry.results
            : [resultItem];
        const cards = resultItems.map(item => `
            <button class="codex-drop-token rarity-frame rarity-${escapeHtml(item.rarity || 'common')}"
                type="button"
                data-result-item
                data-codex-link-category="${escapeHtml(this.getCategoryForItem(item))}"
                data-codex-link-id="${escapeHtml(item.id || '')}">
                <div class="codex-drop-icon">${getItemVisualHtml(item, '?', 'codex-drop-image')}</div>
                <div class="codex-drop-info">
                    <strong>${escapeHtml(item.name || entry.name)}</strong>
                    <span>${escapeHtml(getReadableCodexType(item.type))}</span>
                </div>
            </button>
        `).join('');
        return `
            <section class="codex-section">
                <h3>成品</h3>
                <div class="codex-drop-grid">
                    ${cards}
                </div>
            </section>
        `;
    }

    renderMaterialCostSection(entry) {
        if (!entry.known) return '';
        const rows = (entry.materials || []).map(material => {
            const item = resolveItemById(material.id, { order: ['material', 'shop', 'rewardItem'] });
            const itemKnown = Boolean(item && isItemKnown(material.id));
            const rarity = item?.rarity || 'common';
            const category = item ? this.getCategoryForItem({ ...item, id: material.id }) : CodexCategoryId.MATERIALS;
            return `
                <button class="codex-drop-token rarity-frame rarity-${escapeHtml(rarity)}"
                    type="button"
                    data-material-id="${escapeHtml(material.id)}"
                    data-codex-link-category="${escapeHtml(category)}"
                    data-codex-link-id="${escapeHtml(material.id)}">
                    <div class="codex-drop-icon">${itemKnown ? getItemVisualHtml(item, '?', 'codex-drop-image') : escapeHtml(UnknownIcon.materials)}</div>
                    <div class="codex-drop-info">
                        <strong>${escapeHtml(itemKnown ? item.name : '未解鎖素材')}</strong>
                        <span>x${escapeHtml(material.quantity)}</span>
                    </div>
                </button>
            `;
        }).join('');

        return `
            <section class="codex-section">
                <h3>所需素材</h3>
                <div class="codex-drop-grid">${rows || renderEmpty('不需要素材')}</div>
            </section>
        `;
    }

    renderSourceSection(entry, title) {
        if (!entry.known) return '';
        const refs = entry.sourceRefs || [];
        if (refs.length === 0) {
            return `
                <section class="codex-section">
                    <h3>${escapeHtml(title)}</h3>
                    ${renderEmpty('尚未整理來源')}
                </section>
            `;
        }

        return `
            <section class="codex-section">
                <h3>${escapeHtml(title)}</h3>
                <div class="codex-source-card-grid">
                    ${refs.map(ref => this.renderSourceCard(ref)).join('')}
                </div>
            </section>
        `;
    }

    renderSourceCard(ref = {}) {
        const isMonster = ref.type === 'monster';
        const isQuest = ref.type === 'quest';
        const sourceKnown = !isMonster || isMonsterKnown(ref.id);
        const icon = isMonster && sourceKnown
            ? this.renderMonsterSourceVisual(ref)
            : this.renderGenericSourceVisual(ref);
        const questMeta = [
            ref.chapter != null ? `第 ${ref.chapter} 章` : null,
            ref.npcName
        ].filter(Boolean).join(' / ');
        const sourceMeta = [
            ref.sourceLabel || getReadableSourceType(ref.type),
            ref.npcName
        ].filter(Boolean).join(' / ');
        const meta = isMonster
            ? `${sourceKnown ? (ref.sourceLabel || '怪物') : '未知來源'} / ${safePercent(ref.chance)}`
            : isQuest
                ? questMeta
                : sourceMeta;
        const cardTag = isMonster ? 'button' : 'article';
        const cardType = isMonster ? 'type="button"' : '';
        const cardLink = isMonster
            ? `data-codex-link-category="${escapeHtml(CodexCategoryId.MONSTERS)}" data-codex-link-id="${escapeHtml(ref.id || '')}"`
            : '';

        return `
            <${cardTag} class="codex-source-card ${isMonster ? 'is-monster-source' : ''} ${isQuest ? 'is-quest-source' : ''} rarity-frame rarity-${escapeHtml(ref.rarity || 'common')}"
                ${cardType}
                data-source-entry-id="${escapeHtml(ref.id || '')}"
                ${cardLink}>
                <span class="codex-source-icon">${icon}</span>
                <span class="codex-source-copy">
                    <strong>${escapeHtml(sourceKnown ? (ref.label || ref.id || '未知來源') : '未知敵人')}</strong>
                    <small>${escapeHtml(meta)}</small>
                </span>
            </${cardTag}>
        `;
    }

    renderMonsterSourceVisual(ref = {}) {
        const image = ref.image || getGeneratedMonsterImage(String(ref.id || '').replace(/^world:|^tower:|^dungeon:[^:]+:/g, ''));
        if (image) return `<img src="${escapeHtml(image)}" alt="${escapeHtml(ref.label || '')}">`;
        return escapeHtml(ref.icon || UnknownIcon.monster);
    }

    renderGenericSourceVisual(ref = {}) {
        if (ref.portrait) return `<img src="${escapeHtml(ref.portrait)}" alt="${escapeHtml(ref.npcName || ref.label || '')}">`;
        const iconByType = {
            quest: '📜',
            casino: '🎰',
            shop: '🛒'
        };
        return escapeHtml(ref.icon || iconByType[ref.type] || UnknownIcon.items);
    }

    renderUsageSection(entry) {
        if (!entry.known) return '';
        const refs = entry.usageRefs || [];
        return `
            <section class="codex-section">
                <h3>用於製作</h3>
                <div class="codex-drop-grid">
                    ${refs.map(ref => this.renderUsageCard(ref)).join('') || renderEmpty('尚未接到鍛造配方')}
                </div>
            </section>
        `;
    }

    renderUsageCard(ref = {}) {
        const result = ref.result || {};
        const item = {
            ...result,
            id: result.id || ref.resultId || ref.id,
            name: result.name || ref.label,
            type: result.type || ref.resultType || 'blueprint',
            rarity: result.rarity || 'common'
        };
        const isRecipeLink = ref.type === 'recipe';
        const linkCategory = isRecipeLink ? CodexCategoryId.BLUEPRINTS : this.getCategoryForItem(item);
        const linkId = isRecipeLink ? ref.id : item.id;
        const resultKnown = isRecipeLink
            ? isBlueprintKnownInEncyclopedia(ref.id)
            : Boolean(item.id && isItemKnown(item.id));
        const usageTypeLabel = isRecipeLink
            ? (item.type === 'potion' ? '藥水配方' : '圖紙')
            : getReadableCodexType(item.type);

        return `
            <button class="codex-drop-token rarity-frame rarity-${escapeHtml(item.rarity || 'common')}"
                type="button"
                data-usage-result-id="${escapeHtml(item.id)}"
                data-codex-link-category="${escapeHtml(linkCategory)}"
                data-codex-link-id="${escapeHtml(linkId)}">
                <div class="codex-drop-icon">${resultKnown ? getItemVisualHtml(item, '?', 'codex-drop-image') : escapeHtml(UnknownIcon.items)}</div>
                <div class="codex-drop-info">
                    <strong>${escapeHtml(resultKnown ? (item.name || ref.label || ref.id) : '未解鎖成品')}</strong>
                    <span>${escapeHtml(resultKnown ? usageTypeLabel : '尚未取得資料')}</span>
                </div>
            </button>
        `;
    }

    renderBlueprintSources(entry) {
        if (!entry.known) return '';
        const sources = entry.drops || [];
        const rows = sources.map(source => {
            const monster = source.monster || {};
            const known = isMonsterKnown(monster.entryId);
            const image = known ? getGeneratedMonsterImage(String(monster.entryId || '').replace(/^monster:|^world:|^tower:|^dungeon:[^:]+:/g, '')) : '';
            const icon = image
                ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(monster.name || '')}">`
                : escapeHtml(UnknownIcon.monster);
            return `
                <button class="codex-source-card is-monster-source rarity-frame rarity-common"
                    type="button"
                    data-source-entry-id="${escapeHtml(monster.entryId || '')}"
                    data-codex-link-category="${escapeHtml(CodexCategoryId.MONSTERS)}"
                    data-codex-link-id="${escapeHtml(monster.entryId || '')}">
                    <span class="codex-source-icon">${icon}</span>
                    <span class="codex-source-copy">
                        <strong>${escapeHtml(known ? monster.name : '未知敵人')}</strong>
                        <small>${escapeHtml(monster.sourceLabel || '-')} / ${escapeHtml(formatChance(source.chance))}</small>
                    </span>
                </button>
            `;
        }).join('');

        return `
            <section class="codex-section">
                <h3>圖紙來源</h3>
                <div class="codex-source-card-grid">
                    ${rows || this.renderDiscoverySource(entry)}
                </div>
            </section>
        `;
    }

    renderDiscoverySource(entry) {
        const discovery = entry.discovery || {};
        return `
            <div class="codex-source-card">
                <span class="codex-source-icon">?</span>
                <span class="codex-source-copy">
                    <strong>${escapeHtml(discovery.sourceName || '特殊互動')}</strong>
                    <small>${escapeHtml(discovery.hint || discovery.interactionId || '尚未整理來源')}</small>
                </span>
            </div>
        `;
    }

    attachTooltips(selectedEntry) {
        if (!selectedEntry || !this.dom.detail) return;

        this.dom.detail.querySelectorAll('[data-source-entry-id]').forEach(element => {
            const monster = getMonsterEntries().find(entry => entry.entryId === element.dataset.sourceEntryId);
            if (!monster) return;
            attachItemTooltip(element, this.getMonsterTooltipItem(monster), this.getMonsterTooltipOptions(monster));
        });

        this.dom.detail.querySelectorAll('[data-material-id]').forEach(element => {
            const item = resolveItemById(element.dataset.materialId, { order: ['material', 'shop', 'rewardItem'] });
            if (item && isItemKnown(element.dataset.materialId)) attachItemTooltip(element, item, { hint: '所需素材' });
        });

        const resultCard = this.dom.detail.querySelector('[data-result-item]');
        if (resultCard && selectedEntry?.result) {
            attachItemTooltip(resultCard, selectedEntry.result, { hint: '成品詳情' });
        }
    }

    getMonsterTooltipItem(entry) {
        const known = entry.known;
        return {
            id: entry.entryId,
            name: known ? entry.name : '未知敵人',
            icon: known ? entry.icon : UnknownIcon.monster,
            image: known ? (entry.image || getGeneratedMonsterImage(entry.id || entry.entryId)) : '',
            type: 'monster',
            rarity: entry.rarity,
            description: known ? (entry.description || '已記錄的敵人。') : '擊敗或遭遇後顯示資料。'
        };
    }

    getMonsterTooltipOptions(entry) {
        const known = entry.known;
        return {
            typeText: entry.sourceLabel || '怪物',
            rarityText: known ? getReadableCodexType(entry.rank) : '未解鎖',
            footerRows: known ? [
                ['等級', entry.level || '-'],
                ['生命', entry.maxHp || '-'],
                ['攻擊', entry.attack || '-'],
                ['防禦', entry.defense || '-']
            ] : []
        };
    }
}
