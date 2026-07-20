/**
 * ForgeScene.js
 * 鍛造工坊場景控制器
 */
import GameManager from '../managers/GameManager.js';
import { enhancementManager } from '../managers/EnhancementManager.js';
import { staffAttunementManager } from '../managers/StaffAttunementManager.js';
import { StaffAttunementContract, StaffAttunementElements } from '../data/StaffAttunement.js';
import { affixManager } from '../managers/AffixManager.js';
import {
    craftRecipe,
    getCraftStatus,
    getRecipe,
    getRecipesByType
} from '../managers/RecipeManager.js';
import { getMaterial } from '../data/Materials.js';
import { getRecipeBlueprintInfo } from '../managers/BlueprintManager.js';
import { attachItemTooltip } from '../utils/ItemTooltip.js';
import audioManager from '../utils/AudioManager.js';
import {
    buildItemDisplayModel,
    buildItemStatChipsHtml,
    escapeHtml,
    getItemVisualHtml,
    getItemRarityText
} from '../utils/ItemDisplay.js';

export default class ForgeScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.selectedEnhanceEquipment = null;

        // 鍛造相關
        this.currentTab = 'craft';
        this.selectedRecipe = null;
        this.recipeFilter = 'all';

        // 詞綴重鑄相關
        this.selectedAffixEquipment = null;
        this.selectedRepairEquipment = null;
        this.selectedAttuneEquipment = null;
        this.selectedAttunementElement = null;
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.updateUI();
        this.switchTab('craft');
    }

    cleanup() {
        this.unbindEvents();
    }

    cacheDOM() {
        this.dom = {
            gold: this.container.querySelector('#forge-gold'),
            btnBackLobby: this.container.querySelector('#btn-back-lobby'),

            // Tab 相關
            tabBtns: this.container.querySelectorAll('.tab-btn'),
            tabContents: this.container.querySelectorAll('.tab-content'),

            // 鍛造製作面板
            craftPanel: this.container.querySelector('#craft-panel'),
            recipeList: this.container.querySelector('#recipe-list'),
            filterBtns: this.container.querySelectorAll('.filter-btn'),
            selectedRecipe: this.container.querySelector('#selected-recipe'),
            recipeInfo: this.container.querySelector('#recipe-info'),
            craftResultPreview: this.container.querySelector('#craft-result-preview'),
            materialsList: this.container.querySelector('#materials-list'),
            craftGuidance: this.container.querySelector('#forge-craft-guidance'),
            btnCraft: this.container.querySelector('#btn-craft'),
            craftResult: this.container.querySelector('#craft-result'),
            materialsInventory: this.container.querySelector('#materials-inventory'),
            materialSearch: this.container.querySelector('#material-search'),

            // 裝備強化面板
            enhancePanel: this.container.querySelector('#enhance-panel'),
            enhanceEquipmentList: this.container.querySelector('#enhance-equipment-list'),
            selectedEnhanceEquipment: this.container.querySelector('#selected-enhance-equipment'),
            enhanceInfo: this.container.querySelector('#enhance-info'),
            enhanceLevel: this.container.querySelector('#enhance-level'),
            enhanceStability: this.container.querySelector('#enhance-stability'),
            enhanceSuccessRate: this.container.querySelector('#enhance-success-rate'),
            enhanceCost: this.container.querySelector('#enhance-cost'),
            enhanceNextMilestone: this.container.querySelector('#enhance-next-milestone'),
            enhanceMarksDisplay: this.container.querySelector('#enhance-marks-display'),
            btnEnhanceEquipment: this.container.querySelector('#btn-enhance-equipment'),
            enhanceResult: this.container.querySelector('#enhance-result'),
            enhanceHistory: this.container.querySelector('#enhance-history'),
            attunePanel: this.container.querySelector('#attune-panel'),
            attuneEquipmentList: this.container.querySelector('#attune-equipment-list'),
            selectedAttuneEquipment: this.container.querySelector('#selected-attune-equipment'),
            attuneInfo: this.container.querySelector('#attune-info'),
            attuneCurrentElement: this.container.querySelector('#attune-current-element'),
            attuneCost: this.container.querySelector('#attune-cost'),
            attuneElementOptions: this.container.querySelector('#attune-element-options'),
            attuneMaterialHints: this.container.querySelector('#attune-material-hints'),
            btnAttuneEquipment: this.container.querySelector('#btn-attune-equipment'),
            attuneResult: this.container.querySelector('#attune-result'),
            repairPanel: this.container.querySelector('#repair-panel'),
            repairEquipmentList: this.container.querySelector('#repair-equipment-list'),
            selectedRepairEquipment: this.container.querySelector('#selected-repair-equipment'),
            repairInfo: this.container.querySelector('#repair-info'),
            repairDurability: this.container.querySelector('#repair-durability'),
            repairMissing: this.container.querySelector('#repair-missing'),
            repairCost: this.container.querySelector('#repair-cost'),
            repairMaterialCost: this.container.querySelector('#repair-material-cost'),
            repairMaterialHints: this.container.querySelector('#repair-material-hints'),
            btnRepairEquipment: this.container.querySelector('#btn-repair-equipment'),
            repairResult: this.container.querySelector('#repair-result'),

            // 詞綴重鑄面板
            affixPanel: this.container.querySelector('#affix-panel'),
            affixEquipmentList: this.container.querySelector('#affix-equipment-list'),
            selectedAffixEquipment: this.container.querySelector('#selected-affix-equipment'),
            affixInfo: this.container.querySelector('#affix-info'),
            currentAffixesDisplay: this.container.querySelector('#current-affixes-display'),
            affixSlotsDisplay: this.container.querySelector('#affix-slots-display'),
            rerollCost: this.container.querySelector('#reroll-cost'),
            rerollMaterialCost: this.container.querySelector('#reroll-material-cost'),
            btnRerollAffix: this.container.querySelector('#btn-reroll-affix'),
            rerollResult: this.container.querySelector('#reroll-result'),
            rerollHistory: this.container.querySelector('#reroll-history')
        };
    }

    bindEvents() {
        // Tab 切換
        this.dom.tabBtns?.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // 配方篩選
        this.dom.filterBtns?.forEach(btn => {
            btn.addEventListener('click', () => this.filterRecipes(btn.dataset.filter));
        });

        // 鍛造
        this.dom.btnCraft?.addEventListener('click', () => this.craftItem());

        // 材料搜尋
        this.dom.materialSearch?.addEventListener('input', (e) => this.searchMaterials(e.target.value));

        // 裝備強化
        this.dom.btnEnhanceEquipment?.addEventListener('click', () => this.enhanceSelectedEquipment());
        this.dom.btnAttuneEquipment?.addEventListener('click', () => this.attuneSelectedEquipment());
        this.dom.btnRepairEquipment?.addEventListener('click', () => this.repairSelectedEquipment());

        // 詞綴重鑄
        this.dom.btnRerollAffix?.addEventListener('click', () => this.rerollAffixes());

        // 返回
        this.dom.btnBackLobby?.addEventListener('click', () => this.app.loadScene('lobby'));
    }

    unbindEvents() {
        // Clean up if needed
    }

    updateUI() {
        const gold = GameManager.getGold() || 0;
        if (this.dom.gold) this.dom.gold.textContent = gold;
    }

    // ==================== Tab 切換 ====================

    switchTab(tabName) {
        this.currentTab = tabName;

        // 更新 Tab 按鈕狀態
        this.dom.tabBtns?.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // 更新內容面板
        this.dom.tabContents?.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-panel`);
        });

        // 載入對應內容
        switch (tabName) {
            case 'craft':
                this.loadRecipeList();
                this.loadMaterialsInventory();
                break;
            case 'enhance':
                this.loadEnhanceEquipmentList();
                this.renderEnhanceHistory();
                break;
            case 'attune':
                this.loadAttuneEquipmentList();
                break;
            case 'repair':
                this.loadRepairEquipmentList();
                this.loadMaterialsInventory();
                break;
            case 'affix':
                this.loadAffixEquipmentList();
                break;
        }
    }

    // ==================== 鍛造製作系統 ====================

    loadRecipeList() {
        if (!this.dom.recipeList) return;

        const allRecipes = this.getRecipesForCurrentFilter();
        const recipes = allRecipes.filter(recipe => getRecipeBlueprintInfo(recipe.id).known);
        const hiddenCount = allRecipes.length - recipes.length;

        if (this.selectedRecipe && !recipes.some(recipe => recipe.id === this.selectedRecipe.id)) {
            this.clearSelectedRecipe();
        }

        this.dom.recipeList.innerHTML = recipes.map(recipe => {
            const blueprintInfo = getRecipeBlueprintInfo(recipe.id);
            const known = blueprintInfo.known;
            const craftable = getCraftStatus(recipe.id).hasMaterials;
            const model = this.getRecipeDisplayModel(recipe);
            const rarityClass = model.rarity || 'common';
            const selectedClass = this.selectedRecipe?.id === recipe.id ? 'selected' : '';
            const stateClass = known
                ? (craftable ? 'craftable' : 'locked')
                : 'blueprint-locked';
            const stateLabel = known
                ? (craftable ? '可製作' : '素材不足')
                : '需要圖紙';
            const badge = known
                ? (craftable ? '<span class="craftable-badge">可製作</span>' : '<span class="locked-badge">素材不足</span>')
                : '<span class="blueprint-badge">需要圖紙</span>';

            return `
                <div class="recipe-card rarity-frame rarity-${rarityClass} ${rarityClass} ${stateClass} ${selectedClass}"
                     data-recipe-id="${recipe.id}"
                     role="button"
                     tabindex="0"
                     aria-pressed="${this.selectedRecipe?.id === recipe.id ? 'true' : 'false'}"
                     aria-label="${escapeHtml(`${model.name}，${stateLabel}，${model.typeText}，${model.rarityText}，${recipe.cost} 金幣，成功率 ${recipe.successRate}%`)}">
                    <div class="recipe-icon">${this.renderItemVisual(model)}</div>
                    <div class="recipe-info">
                        <div class="recipe-card-head">
                            <div class="recipe-name">${escapeHtml(model.name)}</div>
                            ${badge}
                        </div>
                        <div class="recipe-type recipe-meta">
                            <span>${escapeHtml(model.typeText)}</span>
                            <span>${escapeHtml(model.rarityText)}</span>
                            <span>${escapeHtml(recipe.cost)}G</span>
                            <span>成功率 ${escapeHtml(recipe.successRate)}%</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('') + this.renderHiddenBlueprintNote(hiddenCount);

        if (recipes.length === 0) {
            this.dom.recipeList.innerHTML = this.renderHiddenBlueprintNote(hiddenCount, true);
        }

        // 綁定點擊事件
        this.dom.recipeList.querySelectorAll('.recipe-card').forEach(card => {
            const recipe = getRecipe(card.dataset.recipeId);
            this.attachRecipeTooltip(card, recipe);
            card.addEventListener('click', () => {
                const recipeId = card.dataset.recipeId;
                this.selectRecipe(recipeId);
            });
            card.addEventListener('keydown', event => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                this.selectRecipe(card.dataset.recipeId);
            });
        });
    }

    getRecipesForCurrentFilter() {
        if (this.recipeFilter === 'armor') {
            return getRecipesByType('all').filter(recipe => recipe.type === 'armor' || recipe.type === 'equipment');
        }

        return getRecipesByType(this.recipeFilter);
    }

    getTypeLabel(type) {
        const labels = {
            'weapon': '武器',
            'armor': '防具',
            'equipment': '防具',
            'accessory': '飾品',
            'potion': '藥水'
        };
        return labels[type] || type;
    }

    getRarityLabel(rarity) {
        return getItemRarityText(rarity);
    }

    getRecipeDisplayModel(recipe) {
        return buildItemDisplayModel(this.getRecipeTooltipItem(recipe), {
            typeText: this.getTypeLabel(recipe?.result?.type || recipe?.type),
            rarity: recipe?.result?.rarity || recipe?.rarity || 'common'
        });
    }

    getRecipeTooltipItem(recipe) {
        const result = recipe?.result || {};
        return {
            ...result,
            name: result.name || recipe?.name,
            icon: result.icon || recipe?.icon,
            image: result.image || recipe?.image || '',
            type: result.type || recipe?.type,
            rarity: result.rarity || recipe?.rarity || 'common',
            description: result.description || result.desc || '',
            desc: result.desc || result.description || ''
        };
    }

    renderItemVisual(item, fallbackIcon = '◆') {
        return getItemVisualHtml(item, fallbackIcon);
    }

    getRecipeTooltipOptions(recipe, extraOptions = {}) {
        const result = recipe?.result || {};
        const footerRows = [
            ['成功率', `${recipe?.successRate ?? 0}%`],
            ...(Array.isArray(extraOptions.footerRows) ? extraOptions.footerRows : [])
        ];

        return {
            price: recipe?.cost,
            priceLabel: '製作費',
            description: result.description || result.desc || '',
            ...extraOptions,
            footerRows
        };
    }

    attachRecipeTooltip(element, recipe, extraOptions = {}) {
        if (!element || !recipe?.result) return;
        attachItemTooltip(element, this.getRecipeTooltipItem(recipe), this.getRecipeTooltipOptions(recipe, extraOptions));
    }

    filterRecipes(filter) {
        this.recipeFilter = filter;

        // 更新篩選按鈕狀態
        this.dom.filterBtns?.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.loadRecipeList();
    }

    selectRecipe(recipeId) {
        const recipe = getRecipe(recipeId);
        if (!recipe) return;

        this.selectedRecipe = recipe;

        // 更新選中狀態
        this.dom.recipeList.querySelectorAll('.recipe-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.recipeId === recipeId);
            card.setAttribute('aria-pressed', card.dataset.recipeId === recipeId ? 'true' : 'false');
        });

        // 顯示配方詳情
        this.showRecipeInfo(recipe);
    }

    clearSelectedRecipe() {
        this.selectedRecipe = null;

        if (this.dom.selectedRecipe) {
            this.dom.selectedRecipe.style.display = '';
            this.dom.selectedRecipe.innerHTML = `
                <div class="empty-slot">
                    <span class="empty-icon">📜</span>
                    <span class="empty-text">選擇要製作的配方</span>
                </div>
            `;
        }
        if (this.dom.recipeInfo) {
            this.dom.recipeInfo.style.display = 'none';
        }
        if (this.dom.craftResult) {
            this.dom.craftResult.style.display = 'none';
        }
    }

    renderHiddenBlueprintNote(hiddenCount, empty = false) {
        if (hiddenCount <= 0) return '';

        return `
            <div class="recipe-discovery-note ${empty ? 'is-empty' : ''}">
                <strong>${hiddenCount} 份製作圖尚未取得</strong>
                <span>透過怪物掉落、副本、任務或特殊事件取得圖紙後，相關配方會出現在這裡。</span>
            </div>
        `;
    }

    showRecipeInfo(recipe) {
        if (!this.dom.recipeInfo) return;

        const blueprintInfo = getRecipeBlueprintInfo(recipe.id);
        const blueprintKnown = blueprintInfo.known;
        const status = getCraftStatus(recipe.id);
        const craftable = status.hasMaterials;
        const gold = status.gold;
        const hasGold = status.hasGold;
        const resultStats = recipe.result?.stats || {};
        const result = recipe.result || {};
        const model = this.getRecipeDisplayModel(recipe);
        const rarity = model.rarity || 'common';
        const rateClass = this.getRateClass(recipe.successRate);

        // 顯示製作結果預覽
        this.dom.craftResultPreview.innerHTML = `
            <div class="preview-item forge-preview-item rarity-frame rarity-${escapeHtml(rarity)} ${escapeHtml(rarity)}">
                <div class="forge-preview-head">
                    <div class="forge-preview-icon">${this.renderItemVisual(model)}</div>
                    <div class="forge-preview-body">
                        <div class="forge-preview-heading">
                            <div class="item-name">${escapeHtml(model.name)}</div>
                            <div class="forge-preview-meta">
                                <span>${escapeHtml(model.typeText)}</span>
                                <span>${escapeHtml(model.rarityText)}</span>
                                <span>${escapeHtml(recipe.cost)} 金幣</span>
                            </div>
                        </div>
                        <span class="forge-success-pill ${rateClass}">成功率 ${escapeHtml(recipe.successRate)}%</span>
                    </div>
                </div>
                <div class="forge-preview-stats">
                    ${this.renderCraftStatChips(resultStats, result)}
                </div>
                ${model.description ? `<div class="forge-preview-desc">${escapeHtml(model.description)}</div>` : ''}
            </div>
        `;

        // 顯示所需材料
        const materialRows = status.materialStatus.map(mat => {
            const material = getMaterial(mat.id);
            return { mat, material, owned: mat.owned, enough: mat.enough };
        });

        this.dom.materialsList.innerHTML = this.renderForgeMaterialRows(recipe.materials);

        this.dom.materialsList.querySelectorAll('.forge-material-row').forEach((rowEl, index) => {
            const row = materialRows[index];
            if (!row?.material) return;
            attachItemTooltip(rowEl, row.material, {
                footerRows: [
                    ['持有', `${row.owned}`],
                    ['需求', `${row.mat.quantity}`]
                ],
                hint: row.enough ? '材料已足夠' : '材料不足'
            });
        });

        this.renderCraftGuidance(recipe, gold, blueprintInfo);

        // 按鈕狀態
        this.dom.btnCraft.disabled = !blueprintKnown || !craftable || !hasGold;

        this.dom.recipeInfo.style.display = 'grid';

        if (this.dom.selectedRecipe) {
            this.dom.selectedRecipe.style.display = 'none';
        }
    }

    renderCraftGuidance(recipe, gold, blueprintInfo = null) {
        if (!this.dom.craftGuidance) return;
        this.dom.craftGuidance.hidden = false;

        if (blueprintInfo && !blueprintInfo.known) {
            const discovery = blueprintInfo.discovery;
            this.dom.craftGuidance.className = 'forge-craft-guidance blueprint';
            this.dom.craftGuidance.innerHTML = `
                <strong>製作圖未取得</strong>
                <div class="forge-missing-list">
                    <span class="forge-missing-chip">圖紙來源：${discovery?.source || '世界探索'}</span>
                </div>
            `;
            return;
        }

        const goldNeed = Math.max(0, recipe.cost - gold);
        if (goldNeed > 0) {
            this.dom.craftGuidance.className = 'forge-craft-guidance blocked';
            this.dom.craftGuidance.innerHTML = `
                <strong>金幣不足</strong>
                <div class="forge-missing-list">
                    <span class="forge-missing-chip">金幣 ${gold}/${recipe.cost}</span>
                </div>
            `;
            return;
        }

        this.dom.craftGuidance.hidden = true;
        this.dom.craftGuidance.innerHTML = '';
    }

    renderCraftStatChips(stats = {}, result = {}, options = {}) {
        const itemLike = {
            ...result,
            stats: {
                ...(result.stats || {}),
                ...(stats || {})
            }
        };

        return buildItemStatChipsHtml(itemLike, {
            ...options,
            chipClass: 'forge-stat-chip',
            emptyText: '無額外數值'
        });
    }

    renderForgeMaterialRows(materials = [], options = {}) {
        const { compact = false, emptyText = '無' } = options;
        if (!materials.length) {
            return `<div class="forge-material-empty">${escapeHtml(emptyText)}</div>`;
        }

        return materials.map(mat => {
            const material = getMaterial(mat.id);
            const owned = GameManager.getItemCountAcrossStorage(mat.id);
            const required = mat.quantity || 0;
            const enough = owned >= required;
            const icon = material ? getItemVisualHtml(material, '❓') : '❓';
            const name = escapeHtml(material?.name || mat.id);

            return `
                <div class="forge-material-row ${compact ? 'is-compact' : ''} ${enough ? 'is-enough' : 'is-lacking'}" data-material-id="${escapeHtml(mat.id)}">
                    <span class="forge-material-icon">${icon}</span>
                    <span class="forge-material-name">${name}</span>
                    <strong class="forge-material-count">${owned}/${required}</strong>
                </div>
            `;
        }).join('');
    }

    loadMaterialsInventory() {
        if (!this.dom.materialsInventory) return;

        const inventory = GameManager.getInventory() || [];
        const materials = inventory.filter(stack =>
            String(stack.item?.type || '').toLowerCase() === 'material'
        );

        if (materials.length === 0) {
            this.dom.materialsInventory.innerHTML = '<div class="empty-inventory">尚無材料</div>';
            return;
        }

        this.dom.materialsInventory.innerHTML = materials.map(stack => {
            const item = stack.item;
            return `
                <div class="material-card rarity-frame rarity-${item.rarity || 'common'} ${item.rarity || 'common'}">
                    <span class="mat-icon">${getItemVisualHtml(item, '📦')}</span>
                    <span class="mat-name">${item.name}</span>
                    <span class="mat-count">x${stack.quantity || 1}</span>
                </div>
            `;
        }).join('');

        this.dom.materialsInventory.querySelectorAll('.material-card').forEach((card, index) => {
            const stack = materials[index];
            if (stack?.item) attachItemTooltip(card, stack.item, { quantity: stack.quantity || 1 });
        });
    }

    searchMaterials(query) {
        if (!this.dom.materialsInventory) return;

        const cards = this.dom.materialsInventory.querySelectorAll('.material-card');
        const lowerQuery = query.toLowerCase();

        cards.forEach(card => {
            const name = card.querySelector('.mat-name').textContent.toLowerCase();
            card.style.display = name.includes(lowerQuery) ? 'flex' : 'none';
        });
    }

    async craftItem() {
        if (!this.selectedRecipe) return;

        const recipe = this.selectedRecipe;
        const status = getCraftStatus(recipe.id);
        if (!status.ok) {
            const message = {
                blueprint: '尚未取得這份製作圖紙。',
                materials: '製作素材不足。',
                gold: '金幣不足。',
                recipe: '找不到這份配方。'
            }[status.reason] || '目前無法製作。';
            this.showMessage(message, status.reason === 'blueprint' ? 'warning' : 'error');
            return;
        }

        // 禁用按鈕
        this.dom.btnCraft.disabled = true;

        // 播放製作動畫
        await this.playCraftAnimation();

        const result = craftRecipe(recipe.id);
        this.showCraftResult(result.success, result.item);

        // 更新 UI
        this.updateUI();
        this.loadRecipeList();
        this.loadMaterialsInventory();
        this.showRecipeInfo(recipe);

        // 重新啟用按鈕
        setTimeout(() => {
            this.dom.btnCraft.disabled = false;
        }, 1000);
    }

    async playCraftAnimation() {
        const resultEl = this.dom.craftResult;
        if (!resultEl) return;
        audioManager.play('hammer', { throttleKey: 'forge-craft-hammer', throttleMs: 250 });

        resultEl.style.display = 'flex';
        resultEl.className = 'craft-result is-info';
        resultEl.innerHTML = `
            <div class="result-icon spinning">⚒️</div>
            <div class="result-text">鍛造中...</div>
        `;

        await this.sleep(1500);
    }

    showCraftResult(success, item) {
        const resultEl = this.dom.craftResult;
        if (!resultEl) return;

        if (success) {
            audioManager.play('craft-success', { throttleKey: 'forge-craft-success', throttleMs: 260 });
            resultEl.className = 'craft-result is-success';
            // 顯示詞綴資訊
            let affixInfo = '';
            if (item.affixes && item.affixes.length > 0) {
                const affixNames = item.affixes.map(a => `<span class="affix-tag ${a.rarity}">${a.name}</span>`).join('');
                affixInfo = `<div class="result-affixes">${affixNames}</div>`;
            }

            // 顯示耐久度
            let durabilityInfo = '';
            if (item.durability !== undefined) {
                durabilityInfo = `<div class="result-durability">耐久度：${item.durability}/${item.maxDurability}</div>`;
            }

            resultEl.innerHTML = `
                <div class="result-icon success">✅</div>
                <div class="result-text">鍛造成功！</div>
                <div class="result-item rarity-frame rarity-${item.rarity || 'common'} ${item.rarity || ''}">
                    <span>${getItemVisualHtml(item, item.icon || '◆')}</span>
                    <span>${item.name}</span>
                </div>
                ${affixInfo}
                ${durabilityInfo}
            `;
            const resultItemEl = resultEl.querySelector('.result-item');
            if (resultItemEl) attachItemTooltip(resultItemEl, item, { hint: '已放入背包' });
        } else {
            audioManager.play('craft-fail', { throttleKey: 'forge-craft-fail', throttleMs: 260 });
            resultEl.className = 'craft-result is-error';
            resultEl.innerHTML = `
                <div class="result-icon fail">❌</div>
                <div class="result-text">鍛造失敗！材料已損失...</div>
            `;
        }

        setTimeout(() => {
            resultEl.style.display = 'none';
        }, 3500);  // 延長顯示時間，讓玩家看清詞綴
    }

    // ==================== 詞綴重鑄系統 ====================

    loadAffixEquipmentList() {
        if (!this.dom.affixEquipmentList) return;

        this.dom.affixEquipmentList.innerHTML = '';
        GameManager.getEquipmentEntries().forEach(entry => {
            this.addAffixEquipmentCard(entry.item, entry.isEquipped, entry.slot || null);
        });

        if (!this.dom.affixEquipmentList.children.length) {
            this.dom.affixEquipmentList.innerHTML = '<div class="empty-inventory">目前沒有可重鑄詞綴的裝備</div>';
        }
    }

    addAffixEquipmentCard(item, isEquipped, slot = null) {
        if (!this.dom.affixEquipmentList) return;

        const card = document.createElement('div');
        card.className = `equipment-card rarity-frame rarity-${item.rarity || 'common'} ${item.rarity || 'common'}`;

        const equippedBadge = isEquipped ? '<span class="equipped-badge">裝備中</span>' : '';
        const affixCount = item.affixes ? item.affixes.length : 0;
        const durabilityStr = item.durability !== null && item.durability !== undefined
            ? `<span class="durability">🔧${item.durability}/${item.maxDurability}</span>`
            : '';

        card.innerHTML = `
            <div class="card-icon">${getItemVisualHtml(item, '⚔️')}</div>
            <div class="card-info">
                <div class="card-name">${item.name}</div>
                <div class="card-stats">
                    ${item.attack ? `⚔️${item.attack}` : ''}
                    ${item.defense ? `🛡️${item.defense}` : ''}
                    ${durabilityStr}
                </div>
                <div class="card-affixes">✨ 詞綴: ${affixCount}</div>
            </div>
            ${equippedBadge}
        `;

        attachItemTooltip(card, item, { hint: '點擊選擇裝備' });
        card.addEventListener('click', () => this.selectAffixEquipment(item, isEquipped, slot));
        this.dom.affixEquipmentList.appendChild(card);
    }

    selectAffixEquipment(item, isEquipped, slot) {
        this.selectedAffixEquipment = { item, isEquipped, slot };

        // 更新選中顯示
        if (this.dom.selectedAffixEquipment) {
            this.dom.selectedAffixEquipment.innerHTML = `
                <div class="selected-item rarity-frame rarity-${item.rarity || 'common'} ${item.rarity || 'common'}">
                    <div class="item-icon">${this.renderItemVisual(item, '⚔️')}</div>
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-rarity">${this.getRarityText(item.rarity)}</div>
                    </div>
                </div>
            `;
            attachItemTooltip(
                this.dom.selectedAffixEquipment.querySelector('.selected-item'),
                item,
                { hint: '目前選擇的重鑄裝備' }
            );
        }

        // 顯示詞綴資訊
        this.showAffixRerollInfo(item);
    }

    showAffixRerollInfo(item) {
        if (!this.dom.affixInfo) return;

        const affixSlots = affixManager.getAffixSlots(item.rarity || 'common');
        const currentAffixes = item.affixes || [];

        // 顯示當前詞綴
        if (this.dom.currentAffixesDisplay) {
            if (currentAffixes.length > 0) {
                this.dom.currentAffixesDisplay.innerHTML = currentAffixes.map(affix => {
                    const rarityClass = affix.rarity || 'common';
                    const typeLabel = affix.type === 'prefix' ? '【前綴】' : '【後綴】';
                    const effectText = this.formatAffixEffect(affix);
                    return `
                        <div class="affix-item forge-affix-row rarity-frame rarity-${rarityClass} ${rarityClass}">
                            <span class="forge-affix-kind">${typeLabel}</span>
                            <span class="forge-affix-name">${escapeHtml(affix.name || '詞綴')}</span>
                            <strong class="forge-affix-stat">${escapeHtml(effectText)}</strong>
                        </div>
                    `;
                }).join('');
            } else {
                this.dom.currentAffixesDisplay.innerHTML = '<div class="no-affixes">尚無詞綴</div>';
            }
        }

        // 顯示槽位資訊
        if (this.dom.affixSlotsDisplay) {
            if (affixSlots.prefix === 0 && affixSlots.suffix === 0) {
                this.dom.affixSlotsDisplay.innerHTML = '<div class="no-slots">此稀有度無法擁有詞綴</div>';
            } else {
                this.dom.affixSlotsDisplay.innerHTML = this.renderAffixSlotCards(affixSlots, currentAffixes);
            }
        }

        // 計算重鑄費用
        const rerollStatus = affixManager.getRerollStatus(item);
        const rerollRequirement = rerollStatus.requirement;
        if (this.dom.rerollCost) {
            this.dom.rerollCost.textContent = `${rerollRequirement.gold} 金幣`;
            this.dom.rerollCost.className = `cost-value ${rerollStatus.hasGold ? '' : 'not-enough'}`;
        }
        if (this.dom.rerollMaterialCost) {
            this.dom.rerollMaterialCost.innerHTML = `<div class="forge-material-list is-compact">${this.renderForgeMaterialRows(rerollRequirement.materials, { compact: true })}</div>`;
            this.dom.rerollMaterialCost.className = `cost-value ${rerollStatus.hasMaterials ? '' : 'not-enough'}`;
        }

        // 按鈕狀態
        if (this.dom.btnRerollAffix) {
            const canReroll = affixSlots.prefix > 0 || affixSlots.suffix > 0;
            this.dom.btnRerollAffix.disabled = !canReroll || !rerollStatus.ok;
        }

        this.dom.affixInfo.style.display = 'block';
    }

    formatAffixEffect(affix) {
        if (!affix) return '';
        return affixManager.getAffixDescription(affix);
    }

    renderAffixSlotCards(affixSlots, currentAffixes = []) {
        const counts = currentAffixes.reduce((acc, affix) => {
            const type = affix?.type === 'suffix' ? 'suffix' : 'prefix';
            acc[type] += 1;
            return acc;
        }, { prefix: 0, suffix: 0 });

        return [
            this.renderAffixSlotCard('prefix', '前綴槽', '詞首能力', counts.prefix, affixSlots.prefix),
            this.renderAffixSlotCard('suffix', '後綴槽', '詞尾能力', counts.suffix, affixSlots.suffix)
        ].join('');
    }

    renderAffixSlotCard(type, title, subtitle, used, total) {
        const pips = Array.from({ length: Math.max(total, 0) }, (_, index) => `
            <span class="forge-slot-pip ${index < used ? 'is-filled' : ''}" aria-hidden="true"></span>
        `).join('');

        return `
            <div class="forge-slot-card is-${type}">
                <div class="forge-slot-head">
                    <span class="forge-slot-icon">${type === 'prefix' ? '⬖' : '⬗'}</span>
                    <span class="forge-slot-title">${title}</span>
                    <strong>${used}/${total}</strong>
                </div>
                <div class="forge-slot-subtitle">${subtitle}</div>
                <div class="forge-slot-pips">${pips || '<span class="forge-slot-empty">無槽位</span>'}</div>
            </div>
        `;
    }

    async rerollAffixes() {
        if (!this.selectedAffixEquipment) return;

        const { item } = this.selectedAffixEquipment;
        const status = affixManager.getRerollStatus(item);
        if (!status.ok) {
            this.showMessage(status.reason === 'gold' ? '金幣不足！' : '重鑄素材不足！', 'error');
            return;
        }

        // 禁用按鈕
        if (this.dom.btnRerollAffix) {
            this.dom.btnRerollAffix.disabled = true;
            this.dom.btnRerollAffix.textContent = '✨ 重鑄中...';
        }

        // 播放動畫
        await this.playRerollAnimation();

        const result = affixManager.rerollAffixes(item);
        if (!result.success) {
            this.showMessage(result.reason === 'gold' ? '金幣不足！' : '重鑄素材不足！', 'error');
            return;
        }

        // 顯示結果
        this.showRerollResult(result.equipment);

        // 更新 UI
        this.updateUI();
        this.showAffixRerollInfo(item);
        this.loadAffixEquipmentList();

        this.renderRerollHistory();

        // 恢復按鈕
        if (this.dom.btnRerollAffix) {
            this.dom.btnRerollAffix.disabled = false;
            this.dom.btnRerollAffix.textContent = '✨ 重鑄詞綴！';
        }
    }

    async playRerollAnimation() {
        const resultEl = this.dom.rerollResult;
        if (!resultEl) return;
        audioManager.play('reroll', { throttleKey: 'forge-reroll-start', throttleMs: 260 });

        resultEl.style.display = 'flex';
        resultEl.innerHTML = `
            <div class="result-icon spinning">✨</div>
            <div class="result-text">重鑄中...</div>
        `;

        await this.sleep(1500);
    }

    showRerollResult(result) {
        const resultEl = this.dom.rerollResult;
        if (!resultEl) return;

        const affixCount = result.affixes ? result.affixes.length : 0;
        const hasLegendary = result.affixes?.some(a => a.rarity === 'legendary');
        const icon = hasLegendary ? '🌟' : '✨';
        audioManager.play(hasLegendary ? 'jackpot' : 'reward', {
            throttleKey: 'forge-reroll-result',
            throttleMs: 260
        });

        resultEl.innerHTML = `
            <div class="result-icon success">${icon}</div>
            <div class="result-text">獲得 ${affixCount} 個詞綴！</div>
        `;

        setTimeout(() => {
            resultEl.style.display = 'none';
        }, 2000);
    }

    renderRerollHistory() {
        if (!this.dom.rerollHistory) return;

        this.dom.rerollHistory.innerHTML = affixManager.getRerollHistory().map(entry => `
            <div class="history-entry success">
                <span class="history-icon">✨</span>
                <span class="history-text">${entry.message}</span>
            </div>
        `).join('');
    }

    getRarityText(rarity) {
        return getItemRarityText(rarity);
    }

    // ==================== 裝備強化系統 ====================

    loadRepairEquipmentList() {
        if (!this.dom.repairEquipmentList) return;

        const repairable = GameManager.getEquipmentEntries({ includeWarehouse: true })
            .map(entry => ({ ...entry, requirement: GameManager.getRepairRequirement?.(entry.item) }))
            .filter(entry => entry.requirement);

        if (this.selectedRepairEquipment && !GameManager.getRepairRequirement?.(this.selectedRepairEquipment.item)) {
            this.clearRepairSelection();
        }

        this.dom.repairEquipmentList.innerHTML = '';

        repairable.forEach(entry => this.addRepairEquipmentCard(entry));

        if (!repairable.length) {
            this.dom.repairEquipmentList.innerHTML = '<div class="empty-inventory">目前沒有需要修復的裝備</div>';
        }

        if (!this.selectedRepairEquipment && this.dom.repairMaterialHints) {
            this.dom.repairMaterialHints.innerHTML = '選擇裝備後會顯示需要的材料與庫存。';
        }
    }

    addRepairEquipmentCard(entry) {
        if (!this.dom.repairEquipmentList) return;

        const { item, sourceLabel, requirement } = entry;
        const durability = Number(item.durability) || 0;
        const maxDurability = Number(item.maxDurability) || 0;
        const isSelected = this.selectedRepairEquipment?.item === item;
        const card = document.createElement('div');
        card.className = `equipment-card repair-equipment-card rarity-frame rarity-${item.rarity || 'common'} ${item.rarity || 'common'} ${isSelected ? 'selected' : ''}`;
        card.innerHTML = `
            <div class="card-icon">${getItemVisualHtml(item, '🛠️')}</div>
            <div class="card-info">
                <div class="card-name">${escapeHtml(item.name || item.id || '未知裝備')}</div>
                <div class="card-stats">
                    <span>耐久 ${durability}/${maxDurability}</span>
                    <span>缺損 ${requirement.missing}</span>
                </div>
            </div>
            <span class="equipped-badge repair-source-badge">${escapeHtml(sourceLabel)}</span>
        `;

        attachItemTooltip(card, item, { hint: '選擇後查看修復費用' });
        card.addEventListener('click', () => this.selectRepairEquipment(entry));
        this.dom.repairEquipmentList.appendChild(card);
    }

    selectRepairEquipment(entry) {
        this.selectedRepairEquipment = entry;
        const { item, sourceLabel } = entry;

        if (this.dom.selectedRepairEquipment) {
            this.dom.selectedRepairEquipment.innerHTML = `
                <div class="selected-item repair-selected-item rarity-frame rarity-${item.rarity || 'common'} ${item.rarity || 'common'}">
                    <div class="item-icon">${this.renderItemVisual(item, '🛠️')}</div>
                    <div class="item-info">
                        <div class="item-name">${escapeHtml(item.name || item.id || '未知裝備')}</div>
                        <div class="item-rarity">${escapeHtml(this.getRarityText(item.rarity))} · ${escapeHtml(sourceLabel)}</div>
                    </div>
                </div>
            `;
            attachItemTooltip(
                this.dom.selectedRepairEquipment.querySelector('.selected-item'),
                item,
                { hint: '正在修復此裝備' }
            );
        }

        this.showRepairInfo(item);
        this.loadRepairEquipmentList();
    }

    clearRepairSelection() {
        this.selectedRepairEquipment = null;

        if (this.dom.selectedRepairEquipment) {
            this.dom.selectedRepairEquipment.innerHTML = `
                <div class="empty-slot">
                    <span class="empty-icon">🛠️</span>
                    <span class="empty-text">選擇需要修復的裝備</span>
                </div>
            `;
        }
        if (this.dom.repairInfo) this.dom.repairInfo.style.display = 'none';
        if (this.dom.repairResult) this.dom.repairResult.style.display = 'none';
    }

    showRepairInfo(item) {
        if (!this.dom.repairInfo) return;

        const status = GameManager.getRepairStatus(item);
        const { requirement } = status;
        if (!requirement) {
            this.clearRepairSelection();
            return;
        }

        const durability = Number(item.durability) || 0;
        const maxDurability = Number(item.maxDurability) || 0;

        if (this.dom.repairDurability) {
            this.dom.repairDurability.textContent = `${durability}/${maxDurability}`;
        }
        if (this.dom.repairMissing) {
            this.dom.repairMissing.textContent = `${requirement.missing}`;
        }
        if (this.dom.repairCost) {
            this.dom.repairCost.textContent = `${requirement.gold} 金幣`;
            this.dom.repairCost.className = `cost-value ${status.hasGold ? '' : 'not-enough'}`;
        }
        if (this.dom.repairMaterialCost) {
            this.dom.repairMaterialCost.innerHTML = this.formatRepairMaterials(requirement.materials);
            this.dom.repairMaterialCost.className = `cost-value ${status.hasMaterials ? '' : 'not-enough'}`;
        }
        if (this.dom.repairMaterialHints) {
            this.dom.repairMaterialHints.innerHTML = this.formatRepairMaterials(requirement.materials, true);
        }
        if (this.dom.btnRepairEquipment) {
            this.dom.btnRepairEquipment.disabled = !status.ok;
        }

        this.dom.repairInfo.style.display = 'block';
    }

    formatRepairMaterials(materials = [], detailed = false) {
        const className = detailed ? 'forge-material-list' : 'forge-material-list is-compact';
        return `<div class="${className}">${this.renderForgeMaterialRows(materials, { compact: !detailed })}</div>`;
    }

    repairSelectedEquipment() {
        if (!this.selectedRepairEquipment) return;

        const { item } = this.selectedRepairEquipment;
        const result = GameManager.repairEquipmentItem?.(item);
        if (result?.success) {
            audioManager.play('hammer', { throttleKey: 'forge-repair-success', throttleMs: 260 });
            this.updateUI();
            this.clearRepairSelection();
            this.loadRepairEquipmentList();
            this.showRepairResult(true, `${item.name || '裝備'} 已修復完成。`);
            return;
        }

        const reasonText = {
            gold: '金幣不足，無法修復。',
            materials: '修復素材不足。',
            'not-needed': '這件裝備不需要修復。'
        }[result?.reason] || '修復失敗。';
        this.showRepairResult(false, reasonText);
        if (item) this.showRepairInfo(item);
    }

    showRepairResult(success, message) {
        if (!this.dom.repairResult) return;

        this.dom.repairResult.style.display = 'flex';
        this.dom.repairResult.className = `repair-result ${success ? 'success' : 'fail'}`;
        this.dom.repairResult.innerHTML = `
            <div class="result-icon">${success ? '✓' : '!'}</div>
            <div class="result-text">${escapeHtml(message)}</div>
        `;

        setTimeout(() => {
            if (this.dom.repairResult) this.dom.repairResult.style.display = 'none';
        }, 2600);
    }

    // ==================== 法杖元素調律 ====================

    getAttuneEquipmentEntries() {
        return GameManager.getEquipmentEntries({ includeWarehouse: true })
            .filter(entry => staffAttunementManager.isFocus(entry.item));
    }

    loadAttuneEquipmentList() {
        if (!this.dom.attuneEquipmentList) return;
        const entries = this.getAttuneEquipmentEntries();
        this.dom.attuneEquipmentList.innerHTML = '';

        for (const entry of entries) {
            const { item, sourceLabel, isEquipped } = entry;
            const current = staffAttunementManager.getCurrentAttunement(item);
            const fixed = staffAttunementManager.getFixedElement(item);
            const card = document.createElement('div');
            const selected = this.selectedAttuneEquipment?.item === item;
            card.className = `equipment-card rarity-frame rarity-${item.rarity || 'common'} ${item.rarity || 'common'} ${selected ? 'selected' : ''}`;
            card.innerHTML = `
                <div class="card-icon">${getItemVisualHtml(item, '◆')}</div>
                <div class="card-info">
                    <div class="card-name">${escapeHtml(item.name || '未命名法杖')}</div>
                    <div class="card-stats">${escapeHtml(fixed ? `固定${fixed.label}元素` : current ? `${current.label}元素` : '中性')} · ${escapeHtml(sourceLabel)}</div>
                </div>
                ${isEquipped ? '<span class="equipped-badge">裝備中</span>' : ''}
            `;
            attachItemTooltip(card, item, { hint: '點擊選擇法杖' });
            card.addEventListener('click', () => this.selectAttuneEquipment(entry));
            this.dom.attuneEquipmentList.appendChild(card);
        }

        if (!entries.length) {
            this.dom.attuneEquipmentList.innerHTML = '<div class="empty-inventory">目前沒有可查看的法杖</div>';
        }
        this.renderAttunementMaterialHints();
    }

    selectAttuneEquipment(entry) {
        this.selectedAttuneEquipment = entry;
        this.selectedAttunementElement = staffAttunementManager.getCurrentAttunement(entry.item)?.element || null;
        this.dom.selectedAttuneEquipment.innerHTML = `
            <div class="selected-item rarity-frame rarity-${entry.item.rarity || 'common'} ${entry.item.rarity || 'common'}">
                <div class="item-icon">${this.renderItemVisual(entry.item, '◆')}</div>
                <div class="item-info">
                    <div class="item-name">${escapeHtml(entry.item.name || '未命名法杖')}</div>
                    <div class="item-rarity">${escapeHtml(this.getRarityText(entry.item.rarity))} · ${escapeHtml(entry.sourceLabel)}</div>
                </div>
            </div>
        `;
        attachItemTooltip(this.dom.selectedAttuneEquipment.querySelector('.selected-item'), entry.item, { hint: '目前選擇的法杖' });
        this.showAttuneInfo(entry.item);
        this.loadAttuneEquipmentList();
    }

    showAttuneInfo(item) {
        if (!this.dom.attuneInfo) return;
        const current = staffAttunementManager.getCurrentAttunement(item);
        const fixed = staffAttunementManager.getFixedElement(item);
        const eligible = staffAttunementManager.canAttune(item);
        this.dom.attuneCurrentElement.textContent = fixed
            ? `${fixed.label}（固定）`
            : current?.label || '中性';
        this.dom.attuneCost.textContent = `${StaffAttunementContract.goldCost} 金幣`;

        if (!eligible) {
            this.dom.attuneElementOptions.innerHTML = `<div class="forge-material-empty">${fixed ? '這把法杖具有固定元素，無法重新調律。' : '這把法杖沒有可替換的元素槽。'}</div>`;
            this.dom.btnAttuneEquipment.disabled = true;
            this.dom.btnAttuneEquipment.textContent = '無法調律';
            this.dom.attuneInfo.style.display = 'block';
            return;
        }

        this.dom.attuneElementOptions.innerHTML = Object.values(StaffAttunementElements).map(element => {
            const preview = staffAttunementManager.getElementPreview(item, element.id);
            const material = getMaterial(element.materialId);
            const selected = this.selectedAttunementElement === element.id;
            const state = !preview.unlocked ? `第 ${element.unlockChapter} 章開放`
                : preview.enoughMaterial ? `${preview.owned}/${preview.materialQuantity}`
                    : `素材 ${preview.owned}/${preview.materialQuantity}`;
            return `
                <button class="attune-element-card ${selected ? 'selected' : ''} ${preview.unlocked ? '' : 'locked'}"
                        data-attune-element="${escapeHtml(element.id)}"
                        ${preview.unlocked ? '' : 'disabled'}>
                    <span class="attune-element-icon">${getItemVisualHtml(material, '◆')}</span>
                    <strong>${escapeHtml(element.label)}元素</strong>
                    <span>${escapeHtml(material?.name || element.materialId)} · ${escapeHtml(state)}</span>
                    <small>${escapeHtml(element.sourceLabel)}</small>
                </button>
            `;
        }).join('');

        this.dom.attuneElementOptions.querySelectorAll('[data-attune-element]').forEach(button => {
            button.addEventListener('click', () => {
                this.selectedAttunementElement = button.dataset.attuneElement;
                this.showAttuneInfo(item);
            });
        });

        const preview = this.selectedAttunementElement
            ? staffAttunementManager.getElementPreview(item, this.selectedAttunementElement)
            : null;
        this.dom.btnAttuneEquipment.disabled = !preview?.available || preview?.alreadyActive;
        this.dom.btnAttuneEquipment.textContent = preview?.alreadyActive
            ? '目前已是此元素'
            : preview?.available
                ? `調律為${preview.element.label}元素`
                : '選擇可用元素';
        this.dom.attuneInfo.style.display = 'block';
    }

    renderAttunementMaterialHints() {
        if (!this.dom.attuneMaterialHints) return;
        this.dom.attuneMaterialHints.innerHTML = Object.values(StaffAttunementElements).map(element => {
            const material = getMaterial(element.materialId);
            return `<div class="forge-material-row is-compact"><span class="forge-material-icon">${getItemVisualHtml(material, '◆')}</span><span class="forge-material-name">${escapeHtml(element.label)} · ${escapeHtml(material?.name || element.materialId)}</span><strong class="forge-material-count">第 ${element.unlockChapter} 章</strong></div>`;
        }).join('');
    }

    attuneSelectedEquipment() {
        const item = this.selectedAttuneEquipment?.item;
        if (!item || !this.selectedAttunementElement) return;
        const result = staffAttunementManager.attune(item, this.selectedAttunementElement);
        const reasonText = {
            ineligible: '這把法杖無法進行元素調律。',
            chapter_locked: '目前章節尚未理解這種元素。',
            materials: '調律素材不足。',
            gold: '金幣不足。',
            already_active: '這把法杖目前已是所選元素。'
        }[result.reason];
        this.showAttuneResult(result.success, result.message || reasonText || '元素調律失敗。');
        this.updateUI();
        this.showAttuneInfo(item);
        this.loadAttuneEquipmentList();
    }

    showAttuneResult(success, message) {
        if (!this.dom.attuneResult) return;
        this.dom.attuneResult.style.display = 'flex';
        this.dom.attuneResult.className = `attune-result ${success ? 'success' : 'fail'}`;
        this.dom.attuneResult.innerHTML = `<div class="result-icon ${success ? 'success' : 'fail'}">${success ? '✓' : '!'}</div><div class="result-text">${escapeHtml(message)}</div>`;
        audioManager.play(success ? 'craft-success' : 'craft-fail', { throttleKey: 'forge-attune-result', throttleMs: 260 });
        setTimeout(() => {
            if (this.dom.attuneResult) this.dom.attuneResult.style.display = 'none';
        }, 2600);
    }

    loadEnhanceEquipmentList() {
        if (!this.dom.enhanceEquipmentList) return;

        this.dom.enhanceEquipmentList.innerHTML = '';
        GameManager.getEquipmentEntries().forEach(entry => {
            this.addEnhanceEquipmentCard(entry.item, entry.isEquipped, entry.slot || null);
        });

        if (!this.dom.enhanceEquipmentList.children.length) {
            this.dom.enhanceEquipmentList.innerHTML = '<div class="empty-inventory">目前沒有可強化裝備</div>';
        }
    }

    addEnhanceEquipmentCard(item, isEquipped, slot = null) {
        if (!this.dom.enhanceEquipmentList) return;

        enhancementManager.initializeEnhancementState(item);
        const card = document.createElement('div');
        const isSelected = this.selectedEnhanceEquipment?.item === item;
        card.className = `equipment-card rarity-frame rarity-${item.rarity || 'common'} ${item.rarity || 'common'} ${isSelected ? 'selected' : ''}`;

        const equippedBadge = isEquipped ? '<span class="equipped-badge">裝備中</span>' : '';
        const level = item.enhanceLevel || 0;
        const stability = item.enhancementStability ?? 0;
        const maxStability = item.maxEnhancementStability ?? 0;

        card.innerHTML = `
            <div class="card-icon">${getItemVisualHtml(item, '⚔️')}</div>
            <div class="card-info">
                <div class="card-name">${enhancementManager.getDisplayName(item)}</div>
                <div class="card-stats">
                    強化 +${level} · 保護 ${stability}/${maxStability}
                </div>
            </div>
            ${equippedBadge}
        `;

        attachItemTooltip(card, item, { hint: '點擊選擇裝備' });
        card.addEventListener('click', () => this.selectEnhanceEquipment(item, isEquipped, slot));
        this.dom.enhanceEquipmentList.appendChild(card);
    }

    selectEnhanceEquipment(item, isEquipped, slot) {
        this.selectedEnhanceEquipment = { item, isEquipped, slot };

        if (this.dom.selectedEnhanceEquipment) {
            this.dom.selectedEnhanceEquipment.innerHTML = `
                <div class="selected-item rarity-frame rarity-${item.rarity || 'common'} ${item.rarity || 'common'}">
                    <div class="item-icon">${this.renderItemVisual(item, '⚔️')}</div>
                    <div class="item-info">
                        <div class="item-name">${enhancementManager.getDisplayName(item)}</div>
                        <div class="item-rarity">${this.getRarityText(item.rarity)}</div>
                    </div>
                </div>
            `;
            attachItemTooltip(
                this.dom.selectedEnhanceEquipment.querySelector('.selected-item'),
                item,
                { hint: '目前選擇的強化裝備' }
            );
        }

        this.showEnhanceInfo(item);
        this.loadEnhanceEquipmentList();
    }

    showEnhanceInfo(item) {
        if (!this.dom.enhanceInfo) return;

        const preview = enhancementManager.getEnhancementPreview(item);

        if (this.dom.enhanceLevel) {
            this.dom.enhanceLevel.textContent = `+${preview.currentLevel} → ${preview.nextLevel ? `+${preview.nextLevel}` : 'MAX'}`;
        }
        if (this.dom.enhanceStability) {
            this.dom.enhanceStability.textContent = `${preview.stability}/${preview.maxStability}`;
        }
        if (this.dom.enhanceSuccessRate) {
            this.dom.enhanceSuccessRate.textContent = `${preview.successRate}%`;
            this.dom.enhanceSuccessRate.className = `rate-value ${this.getRateClass(preview.successRate)}`;
        }
        if (this.dom.enhanceCost) {
            this.dom.enhanceCost.textContent = `${preview.cost} 金幣`;
            this.dom.enhanceCost.className = `cost-value ${preview.hasGold ? '' : 'not-enough'}`;
        }
        if (this.dom.enhanceNextMilestone) {
            this.dom.enhanceNextMilestone.textContent = preview.nextMilestone
                ? `+${preview.nextMilestone} 時可能獲得額外能力`
                : '已達最終強化';
        }

        this.renderEnhancementMarks(item);

        if (this.dom.btnEnhanceEquipment) {
            this.dom.btnEnhanceEquipment.disabled = !preview.canEnhance;
            this.dom.btnEnhanceEquipment.classList.toggle('is-insufficient', preview.canEnhance && !preview.hasGold);
            this.dom.btnEnhanceEquipment.textContent = preview.available
                ? `強化至 ${preview.nextLevel ? `+${preview.nextLevel}` : 'MAX'}`
                : preview.canEnhance
                    ? '金幣不足'
                    : '無法繼續強化';
        }

        this.dom.enhanceInfo.style.display = 'block';
    }

    renderEnhancementMarks(item) {
        if (!this.dom.enhanceMarksDisplay) return;

        const previews = enhancementManager.getMilestonePreviews(item);
        const preview = enhancementManager.getEnhancementPreview(item);
        const visiblePreviews = previews.filter(group => group.granted || group.level === preview.nextMilestone);

        this.dom.enhanceMarksDisplay.innerHTML = `
            <div class="enhance-ability-list">
                ${visiblePreviews.map(group => this.renderEnhancementAbilityGroup(group, preview.nextMilestone)).join('') || '<div class="forge-material-empty">已達最終強化，沒有下一階段能力。</div>'}
            </div>
        `;
    }

    renderEnhancementAbilityGroup(group, nextMilestone) {
        const stateClass = group.granted
            ? 'is-granted'
            : group.level === nextMilestone
                ? 'is-next'
                : group.unlocked
                    ? 'is-missed'
                    : 'is-locked';
        const stateLabel = group.granted
            ? '已取得'
            : group.level === nextMilestone
                ? '下一階段'
                : group.unlocked
                    ? '未取得'
                    : '未解鎖';
        const body = group.granted
            ? this.renderEnhancementAbilityRow(enhancementManager.getMarkDisplay(group.granted), true)
            : group.options.map(option => this.renderEnhancementAbilityRow(option)).join('');

        return `
            <section class="enhance-ability-group ${stateClass}">
                <div class="enhance-ability-head">
                    <span class="enhance-ability-level">+${group.level}</span>
                    <strong>${stateLabel}</strong>
                </div>
                <div class="enhance-ability-options">
                    ${body || '<div class="forge-material-empty">此階段沒有可顯示能力</div>'}
                </div>
            </section>
        `;
    }

    renderEnhancementAbilityRow(option, granted = false) {
        const rarity = option.rarity || 'rare';
        return `
            <div class="enhance-ability-row ${granted ? 'is-granted' : ''} rarity-frame rarity-${rarity} ${rarity}">
                <span class="enhance-ability-dot"></span>
                <span class="enhance-ability-name">${escapeHtml(option.label)}</span>
                ${option.statsText ? `<strong>${escapeHtml(option.statsText)}</strong>` : ''}
            </div>
        `;
    }

    async enhanceSelectedEquipment() {
        if (!this.selectedEnhanceEquipment) return;

        const { item } = this.selectedEnhanceEquipment;
        const preview = enhancementManager.getEnhancementPreview(item);

        if (!preview.canEnhance) {
            this.showEnhanceNotice('這件裝備無法繼續強化。', 'fail');
            return;
        }

        if (!preview.hasGold) {
            this.showEnhanceNotice(`金幣不足，需要 ${preview.cost} 金幣。`, 'fail');
            return;
        }

        if (this.dom.btnEnhanceEquipment) {
            this.dom.btnEnhanceEquipment.disabled = true;
            this.dom.btnEnhanceEquipment.textContent = '強化中...';
        }

        await this.playEnhanceAnimation();

        const result = enhancementManager.enhance(item);

        this.showEnhanceResult(result);
        this.renderEnhanceHistory();
        this.updateUI();
        this.showEnhanceInfo(item);
        this.loadEnhanceEquipmentList();
    }

    async playEnhanceAnimation() {
        const resultEl = this.dom.enhanceResult;
        if (!resultEl) return;
        audioManager.play('hammer', { throttleKey: 'forge-enhance-hammer', throttleMs: 250 });

        resultEl.style.display = 'flex';
        resultEl.innerHTML = `
            <div class="result-icon spinning">⚒️</div>
            <div class="result-text">強化中...</div>
        `;

        await this.sleep(900);
    }

    showEnhanceResult(result) {
        const resultEl = this.dom.enhanceResult;
        if (!resultEl) return;

        const icon = result.success ? '✓' : '!';
        const className = result.success ? 'success' : 'fail';
        audioManager.play(result.success ? 'craft-success' : 'craft-fail', {
            throttleKey: 'forge-enhance-result',
            throttleMs: 260
        });
        const abilityText = result.milestoneMark
            ? `<div class="result-affixes"><span class="affix-tag legendary">${enhancementManager.getMarkDescription(result.milestoneMark)}</span></div>`
            : '';

        resultEl.innerHTML = `
            <div class="result-icon ${className}">${icon}</div>
            <div class="result-text">${result.message}</div>
            ${abilityText}
        `;

        setTimeout(() => {
            resultEl.style.display = 'none';
        }, 2600);
    }

    showEnhanceNotice(message, type = 'info') {
        const resultEl = this.dom.enhanceResult;
        if (!resultEl) return;

        const iconMap = {
            success: '✓',
            fail: '!',
            warning: '!',
            info: 'i'
        };
        const className = type === 'success' ? 'success' : type === 'info' ? 'info' : 'fail';
        if (className === 'fail') {
            audioManager.play('craft-fail', {
                throttleKey: 'forge-enhance-blocked',
                throttleMs: 260
            });
        }

        resultEl.style.display = 'flex';
        resultEl.className = `enhance-result ${className}`;
        resultEl.innerHTML = `
            <div class="result-icon ${className}">${iconMap[type] || iconMap.info}</div>
            <div class="result-text">${escapeHtml(message)}</div>
        `;

        setTimeout(() => {
            if (this.dom.enhanceResult) this.dom.enhanceResult.style.display = 'none';
        }, 2600);
    }

    renderEnhanceHistory() {
        if (!this.dom.enhanceHistory) return;

        const history = enhancementManager.getEnhancementHistory();
        if (history.length === 0) {
            this.dom.enhanceHistory.innerHTML = '<div class="empty-inventory">尚無強化紀錄</div>';
            return;
        }

        this.dom.enhanceHistory.innerHTML = history.map(entry => `
            <div class="history-entry ${entry.success ? 'success' : 'fail'}">
                <span class="history-icon">${entry.success ? '✓' : '!'}</span>
                <span class="history-text">${entry.message}</span>
            </div>
        `).join('');
    }

    getRateClass(rate) {
        if (rate >= 75) return 'high';
        if (rate >= 40) return 'medium';
        return 'low';
    }

    showMessage(message, type = 'info') {
        if (!this.dom?.craftResult) return;

        const iconMap = {
            success: '✓',
            error: '!',
            warning: '!',
            info: 'i'
        };

        this.dom.craftResult.style.display = 'flex';
        this.dom.craftResult.className = `craft-result is-${type}`;
        this.dom.craftResult.innerHTML = `
            <div class="result-icon">${iconMap[type] || iconMap.info}</div>
            <div class="result-text">${message}</div>
        `;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
