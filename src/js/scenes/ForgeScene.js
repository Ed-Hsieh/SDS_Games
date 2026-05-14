/**
 * ForgeScene.js
 * 鍛造工坊場景控制器
 */
import GameManager, { ItemType, ItemRarity } from '../managers/GameManager.js';
import { enhancementManager } from '../managers/EnhancementManager.js';
import { affixManager } from '../managers/AffixManager.js';
import { questManager, ObjectiveType } from '../managers/QuestManager.js';
import { RecipeDatabase, getRecipe, getRecipesByType, canCraft, getMissingMaterials } from '../managers/RecipeManager.js';
import { MaterialDatabase, getMaterial } from '../managers/MaterialManager.js';
import { getRecipeBlueprintInfo, isRecipeBlueprintKnown } from '../managers/BlueprintManager.js';
import { globalGoalTracker } from '../utils/GlobalGoalTracker.js';

export default class ForgeScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.selectedEnhanceEquipment = null;
        this.enhanceHistory = [];
        this.rerollHistory = [];
        this.affixManager = affixManager;
        
        // 鍛造相關
        this.currentTab = 'craft';
        this.selectedRecipe = null;
        this.recipeFilter = 'all';
        
        // 詞綴重鑄相關
        this.selectedAffixEquipment = null;
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.updateUI();
        this.switchTab('craft');
    }

    cleanup() {
        this.unbindEvents();
        globalGoalTracker.setForgeRecipe(null);
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
            craftCost: this.container.querySelector('#craft-cost'),
            craftSuccessRate: this.container.querySelector('#craft-success-rate'),
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
        const inventory = GameManager.getInventory() || [];
        const warehouse = GameManager.state?.warehouse || [];

        if (this.selectedRecipe && !recipes.some(recipe => recipe.id === this.selectedRecipe.id)) {
            this.clearSelectedRecipe();
        }
        
        this.dom.recipeList.innerHTML = recipes.map(recipe => {
            const blueprintInfo = getRecipeBlueprintInfo(recipe.id);
            const known = blueprintInfo.known;
            const craftable = canCraft(recipe.id, inventory, warehouse);
            const rarityClass = recipe.rarity || 'common';
            const selectedClass = this.selectedRecipe?.id === recipe.id ? 'selected' : '';
            const stateClass = known
                ? (craftable ? 'craftable' : 'locked')
                : 'blueprint-locked';
            const badge = known
                ? (craftable ? '<span class="craftable-badge">可製作</span>' : '<span class="locked-badge">素材不足</span>')
                : '<span class="blueprint-badge">需要圖紙</span>';
            
            return `
                <div class="recipe-card ${rarityClass} ${stateClass} ${selectedClass}" 
                     data-recipe-id="${recipe.id}">
                    <div class="recipe-icon">${recipe.icon}</div>
                    <div class="recipe-info">
                        <div class="recipe-name">${recipe.name}</div>
                        <div class="recipe-type">${this.getTypeLabel(recipe.type)}</div>
                    </div>
                    ${badge}
                </div>
            `;
        }).join('') + this.renderHiddenBlueprintNote(hiddenCount);

        if (recipes.length === 0) {
            this.dom.recipeList.innerHTML = this.renderHiddenBlueprintNote(hiddenCount, true);
        }
        
        // 綁定點擊事件
        this.dom.recipeList.querySelectorAll('.recipe-card').forEach(card => {
            card.addEventListener('click', () => {
                const recipeId = card.dataset.recipeId;
                this.selectRecipe(recipeId);
            });
        });
    }

    getRecipesForCurrentFilter() {
        if (this.recipeFilter === 'armor') {
            return Object.values(RecipeDatabase).filter(recipe => recipe.type === 'armor' || recipe.type === 'equipment');
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
        });
        
        // 顯示配方詳情
        this.showRecipeInfo(recipe);
        globalGoalTracker.setForgeRecipe(recipe.id);
    }

    clearSelectedRecipe() {
        this.selectedRecipe = null;
        globalGoalTracker.setForgeRecipe(null);

        if (this.dom.selectedRecipe) {
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
                <span>探索公告欄、圖匣、石碑、副本或特殊物品後，相關配方會出現在這裡。</span>
            </div>
        `;
    }

    showRecipeInfo(recipe) {
        if (!this.dom.recipeInfo) return;
        
        const inventory = GameManager.getInventory() || [];
        const warehouse = GameManager.state?.warehouse || [];
        const blueprintInfo = getRecipeBlueprintInfo(recipe.id);
        const blueprintKnown = blueprintInfo.known;
        const craftable = canCraft(recipe.id, inventory, warehouse);
        const missingMaterials = getMissingMaterials(recipe.id, inventory, warehouse);
        const gold = GameManager.getGold() || 0;
        const hasGold = gold >= recipe.cost;
        const resultStats = recipe.result?.stats || {};
        
        // 顯示製作結果預覽
        const result = recipe.result;
        this.dom.craftResultPreview.innerHTML = `
            <div class="preview-item ${result.rarity || 'common'}">
                <div class="item-icon">${result.icon}</div>
                <div class="item-name">${result.name}</div>
                <div class="item-stats">
                    ${resultStats.attack || result.attack ? `<span>⚔️ ${resultStats.attack || result.attack}</span>` : ''}
                    ${resultStats.defense || result.defense ? `<span>🛡️ ${resultStats.defense || result.defense}</span>` : ''}
                    ${resultStats.hp || result.hp ? `<span>❤️ +${resultStats.hp || result.hp}</span>` : ''}
                    ${resultStats.mp || result.mp ? `<span>💙 +${resultStats.mp || result.mp}</span>` : ''}
                </div>
                <div class="item-desc">${result.desc || ''}</div>
            </div>
        `;
        
        // 顯示所需材料
        this.dom.materialsList.innerHTML = recipe.materials.map(mat => {
            const material = getMaterial(mat.id);
            const owned = this.getMaterialCount(mat.id, inventory);
            const enough = owned >= mat.quantity;
            
            return `
                <div class="material-req ${enough ? 'enough' : 'not-enough'}">
                    <span class="mat-icon">${material?.icon || '❓'}</span>
                    <span class="mat-name">${material?.name || mat.id}</span>
                    <span class="mat-count ${enough ? '' : 'lacking'}">${owned}/${mat.quantity}</span>
                </div>
            `;
        }).join('');
        
        // 費用和成功率
        this.dom.craftCost.textContent = `${recipe.cost} 金幣`;
        this.dom.craftCost.className = `cost-value ${hasGold ? '' : 'not-enough'}`;
        this.dom.craftSuccessRate.textContent = `${recipe.successRate}%`;
        this.renderCraftGuidance(recipe, missingMaterials, hasGold, gold, blueprintInfo);
        
        // 按鈕狀態
        this.dom.btnCraft.disabled = !blueprintKnown || !craftable || !hasGold;
        
        this.dom.recipeInfo.style.display = 'block';
        
        // 更新選中顯示
        this.dom.selectedRecipe.innerHTML = `
            <div class="selected-item ${recipe.rarity || 'common'}">
                <div class="item-icon">${recipe.icon}</div>
                <div class="item-info">
                    <div class="item-name">${recipe.name}</div>
                    <div class="item-rarity">${recipe.rarity || 'common'}</div>
                </div>
            </div>
        `;
    }

    renderCraftGuidance(recipe, missingMaterials, hasGold, gold, blueprintInfo = null) {
        if (!this.dom.craftGuidance) return;

        if (blueprintInfo && !blueprintInfo.known) {
            const discovery = blueprintInfo.discovery;
            this.dom.craftGuidance.className = 'forge-craft-guidance blueprint';
            this.dom.craftGuidance.innerHTML = `
                <strong>製作圖未取得</strong>
                <span>${discovery?.clue || '這份配方需要先在世界中找到圖紙。'}</span>
                <div class="forge-missing-list">
                    <span class="forge-missing-chip">線索來源：${discovery?.source || '未知'}</span>
                </div>
            `;
            return;
        }

        const goldNeed = Math.max(0, recipe.cost - gold);
        if (missingMaterials.length === 0 && hasGold) {
            this.dom.craftGuidance.className = 'forge-craft-guidance ready';
            this.dom.craftGuidance.innerHTML = `
                <strong>素材檢查完成</strong>
                <span>材料與金幣足夠，可以製作。成功率 ${recipe.successRate}%。</span>
            `;
            return;
        }

        const missingHtml = missingMaterials.map(mat => {
            const material = getMaterial(mat.id);
            return `
                <span class="forge-missing-chip">
                    ${material?.icon || '◇'} ${material?.name || mat.id} ${mat.owned}/${mat.required}
                </span>
            `;
        }).join('');
        const goldHtml = goldNeed > 0 ? `<span class="forge-missing-chip">金幣 ${gold}/${recipe.cost}</span>` : '';

        this.dom.craftGuidance.className = 'forge-craft-guidance blocked';
        this.dom.craftGuidance.innerHTML = `
            <strong>素材不足</strong>
            <span>先補齊缺口，再回來製作 ${recipe.name}。</span>
            <div class="forge-missing-list">${missingHtml}${goldHtml}</div>
        `;
    }

    getMaterialCount(materialId, inventory) {
        // 同時檢查背包和倉庫
        const inventoryCount = (GameManager.state?.inventory || [])
            .filter(stack => stack.item?.id === materialId)
            .reduce((sum, stack) => sum + (stack.quantity || 1), 0);
        
        const warehouseCount = (GameManager.state?.warehouse || [])
            .filter(stack => stack.item?.id === materialId)
            .reduce((sum, stack) => sum + (stack.quantity || 1), 0);
        
        return inventoryCount + warehouseCount;
    }

    loadMaterialsInventory() {
        if (!this.dom.materialsInventory) return;
        
        const inventory = GameManager.getInventory() || [];
        const materials = inventory.filter(stack => 
            stack.item?.type === ItemType.MATERIAL || stack.item?.type === 'material'
        );
        
        if (materials.length === 0) {
            this.dom.materialsInventory.innerHTML = '<div class="empty-inventory">尚無材料</div>';
            return;
        }
        
        this.dom.materialsInventory.innerHTML = materials.map(stack => {
            const item = stack.item;
            return `
                <div class="material-card ${item.rarity || 'common'}">
                    <span class="mat-icon">${item.icon || '📦'}</span>
                    <span class="mat-name">${item.name}</span>
                    <span class="mat-count">x${stack.quantity || 1}</span>
                </div>
            `;
        }).join('');
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
        const inventory = GameManager.getInventory() || [];
        const warehouse = GameManager.state?.warehouse || [];
        if (!isRecipeBlueprintKnown(recipe.id)) {
            this.showMessage('需要先取得這份製作圖。', 'warning');
            return;
        }
        
        // 再次檢查
        if (!canCraft(recipe.id, inventory, warehouse)) {
            this.showMessage('材料不足！', 'error');
            return;
        }
        
        if (GameManager.getGold() < recipe.cost) {
            this.showMessage('金幣不足！', 'error');
            return;
        }
        
        // 禁用按鈕
        this.dom.btnCraft.disabled = true;
        
        // 播放製作動畫
        await this.playCraftAnimation();
        
        // 扣除材料
        for (const mat of recipe.materials) {
            GameManager.removeMaterial(mat.id, mat.quantity);
        }
        
        // 扣除金幣
        GameManager.addGold(-recipe.cost);
        
        // 判定成功
        const roll = Math.random() * 100;
        const success = roll < recipe.successRate;
        
        if (success) {
            // 創建新物品並加入背包
            const newItem = { ...recipe.result, instanceId: `crafted_${Date.now()}` };
            
            // 如果是裝備類型，生成隨機詞綴
            if (newItem.type === 'weapon' || newItem.type === 'armor' || newItem.type === 'accessory') {
                // 添加耐久度屬性
                if (newItem.durability === undefined) {
                    newItem.durability = 50;
                    newItem.maxDurability = 50;
                }
                
                // 生成隨機詞綴
                this.affixManager.generateAffixes(newItem, true);
                
                // 根據最高詞綴稀有度提升裝備稀有度
                if (newItem.affixes && newItem.affixes.length > 0) {
                    const rarityOrder = [ItemRarity.COMMON, ItemRarity.UNCOMMON, ItemRarity.RARE, ItemRarity.EPIC, ItemRarity.LEGENDARY];
                    let highestAffixRarity = newItem.rarity;
                    
                    for (const affix of newItem.affixes) {
                        const affixRarityIndex = rarityOrder.indexOf(affix.rarity);
                        const currentHighest = rarityOrder.indexOf(highestAffixRarity);
                        if (affixRarityIndex > currentHighest) {
                            highestAffixRarity = affix.rarity;
                        }
                    }
                    
                    // 如果詞綴稀有度高於裝備，提升裝備稀有度
                    const equipRarityIndex = rarityOrder.indexOf(newItem.rarity);
                    const highestIndex = rarityOrder.indexOf(highestAffixRarity);
                    if (highestIndex > equipRarityIndex) {
                        newItem.rarity = highestAffixRarity;
                    }
                }
            }
            
            GameManager.addItem(newItem);
            
            this.showCraftResult(true, newItem);
            
            // 任務系統
            questManager.updateProgress(ObjectiveType.CRAFT, recipe.type, 1);
        } else {
            this.showCraftResult(false, null);
        }
        
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
        
        resultEl.style.display = 'flex';
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
                <div class="result-item ${item.rarity || ''}">
                    <span>${item.icon}</span>
                    <span>${item.name}</span>
                </div>
                ${affixInfo}
                ${durabilityInfo}
            `;
        } else {
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
        const char = GameManager.getCharacter();
        const inventory = GameManager.state?.inventory || [];
        
        if (!this.dom.affixEquipmentList) return;
        
        this.dom.affixEquipmentList.innerHTML = '';
        
        // 已裝備的物品
        if (char?.equipment) {
            for (const slot in char.equipment) {
                const item = char.equipment[slot];
                if (item) {
                    this.addAffixEquipmentCard(item, true, slot);
                }
            }
        }
        
        // 背包中的裝備
        inventory.forEach(stack => {
            const item = stack.item;
            if (item && (item.type === ItemType.WEAPON || item.type === ItemType.ARMOR || item.type === ItemType.ACCESSORY ||
                         item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory')) {
                this.addAffixEquipmentCard(item, false, null);
            }
        });
    }

    addAffixEquipmentCard(item, isEquipped, slot = null) {
        if (!this.dom.affixEquipmentList) return;
        
        const card = document.createElement('div');
        card.className = `equipment-card ${item.rarity || 'common'}`;
        
        const equippedBadge = isEquipped ? '<span class="equipped-badge">裝備中</span>' : '';
        const affixCount = item.affixes ? item.affixes.length : 0;
        const durabilityStr = item.durability !== null && item.durability !== undefined 
            ? `<span class="durability">🔧${item.durability}/${item.maxDurability}</span>` 
            : '';
        
        card.innerHTML = `
            <div class="card-icon">${item.icon || '⚔️'}</div>
            <div class="card-info">
                <div class="card-name">${item.name}</div>
                <div class="card-stats">
                    ${item.atk || item.attack ? `⚔️${item.atk || item.attack}` : ''}
                    ${item.def || item.defense ? `🛡️${item.def || item.defense}` : ''}
                    ${durabilityStr}
                </div>
                <div class="card-affixes">✨ 詞綴: ${affixCount}</div>
            </div>
            ${equippedBadge}
        `;
        
        card.addEventListener('click', () => this.selectAffixEquipment(item, isEquipped, slot));
        this.dom.affixEquipmentList.appendChild(card);
    }

    selectAffixEquipment(item, isEquipped, slot) {
        this.selectedAffixEquipment = { item, isEquipped, slot };
        
        // 更新選中顯示
        if (this.dom.selectedAffixEquipment) {
            this.dom.selectedAffixEquipment.innerHTML = `
                <div class="selected-item ${item.rarity || 'common'}">
                    <div class="item-icon">${item.icon || '⚔️'}</div>
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-rarity">${this.getRarityText(item.rarity)}</div>
                    </div>
                </div>
            `;
        }
        
        // 顯示詞綴資訊
        this.showAffixRerollInfo(item);
    }

    showAffixRerollInfo(item) {
        if (!this.dom.affixInfo) return;
        
        const affixSlots = this.affixManager.getAffixSlots(item.rarity || 'common');
        const currentAffixes = item.affixes || [];
        
        // 顯示當前詞綴
        if (this.dom.currentAffixesDisplay) {
            if (currentAffixes.length > 0) {
                this.dom.currentAffixesDisplay.innerHTML = currentAffixes.map(affix => {
                    const rarityClass = affix.rarity || 'common';
                    const typeLabel = affix.type === 'prefix' ? '【前綴】' : '【後綴】';
                    const effectText = this.formatAffixEffect(affix);
                    return `<div class="affix-item ${rarityClass}">${typeLabel} ${affix.name}: ${effectText}</div>`;
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
                this.dom.affixSlotsDisplay.innerHTML = `
                    <div class="slot-info">前綴槽位: ${affixSlots.prefix}</div>
                    <div class="slot-info">後綴槽位: ${affixSlots.suffix}</div>
                `;
            }
        }
        
        // 計算重鑄費用
        const rerollRequirement = this.calculateRerollRequirements(item);
        if (this.dom.rerollCost) {
            this.dom.rerollCost.textContent = `${rerollRequirement.gold} 金幣`;
            this.dom.rerollCost.className = `cost-value ${GameManager.getGold() >= rerollRequirement.gold ? '' : 'not-enough'}`;
        }
        if (this.dom.rerollMaterialCost) {
            this.dom.rerollMaterialCost.innerHTML = this.formatRerollMaterials(rerollRequirement.materials);
            this.dom.rerollMaterialCost.className = `cost-value ${this.hasRerollMaterials(rerollRequirement.materials) ? '' : 'not-enough'}`;
        }
        
        // 按鈕狀態
        if (this.dom.btnRerollAffix) {
            const canReroll = affixSlots.prefix > 0 || affixSlots.suffix > 0;
            const hasGold = GameManager.getGold() >= rerollRequirement.gold;
            const hasMaterials = this.hasRerollMaterials(rerollRequirement.materials);
            this.dom.btnRerollAffix.disabled = !canReroll || !hasGold || !hasMaterials;
        }
        
        this.dom.affixInfo.style.display = 'block';
    }

    formatAffixEffect(affix) {
        if (!affix) return '';
        if (this.affixManager && typeof this.affixManager.getAffixDescription === 'function') {
            return this.affixManager.getAffixDescription(affix);
        }
        // Fallback: simple serialization
        return Object.entries(affix.stats || {}).map(([k, v]) => `${k}:${v}`).join(', ');
    }

    calculateRerollCost(item) {
        return this.calculateRerollRequirements(item).gold;
    }

    calculateRerollRequirements(item) {
        const goldByRarity = {
            'common': 50,
            'uncommon': 100,
            'rare': 200,
            'epic': 400,
            'legendary': 800
        };
        const materialByRarity = {
            'common': [{ id: 'iron_shard', quantity: 1 }],
            'uncommon': [{ id: 'iron_shard', quantity: 2 }],
            'rare': [{ id: 'high_ore', quantity: 1 }],
            'epic': [{ id: 'forge_core', quantity: 1 }],
            'legendary': [{ id: 'rare_metal', quantity: 1 }]
        };

        const rarity = item?.rarity || 'common';
        return {
            gold: goldByRarity[rarity] || 100,
            materials: materialByRarity[rarity] || materialByRarity.common
        };
    }

    hasRerollMaterials(materials = []) {
        return materials.every(mat => this.getMaterialCount(mat.id) >= mat.quantity);
    }

    consumeRerollMaterials(materials = []) {
        for (const mat of materials) {
            GameManager.removeMaterial(mat.id, mat.quantity);
        }
    }

    formatRerollMaterials(materials = []) {
        if (!materials.length) return '無';
        return materials.map(mat => {
            const material = getMaterial(mat.id);
            const owned = this.getMaterialCount(mat.id);
            const enough = owned >= mat.quantity;
            return `<span class="${enough ? '' : 'lacking'}">${material?.icon || '📦'} ${material?.name || mat.id} ${owned}/${mat.quantity}</span>`;
        }).join(' ');
    }

    async rerollAffixes() {
        if (!this.selectedAffixEquipment) return;
        
        const { item } = this.selectedAffixEquipment;
        const requirement = this.calculateRerollRequirements(item);
        
        // 檢查金幣
        if (GameManager.getGold() < requirement.gold) {
            this.showMessage('金幣不足！', 'error');
            return;
        }
        if (!this.hasRerollMaterials(requirement.materials)) {
            this.showMessage('重鑄素材不足！', 'error');
            return;
        }
        
        // 扣除金幣
        GameManager.addGold(-requirement.gold);
        this.consumeRerollMaterials(requirement.materials);
        
        // 禁用按鈕
        if (this.dom.btnRerollAffix) {
            this.dom.btnRerollAffix.disabled = true;
            this.dom.btnRerollAffix.textContent = '✨ 重鑄中...';
        }
        
        // 播放動畫
        await this.playRerollAnimation();
        
        // 保存原始名稱
        if (!item._baseName) {
            item._baseName = item.name;
        }
        
        // 恢復原始名稱再重鑄
        item.name = item._baseName;
        
        // 重鑄詞綴
        const result = this.affixManager.generateAffixes(item, true);
        
        // 根據最高詞綴稀有度更新裝備稀有度
        this.updateEquipmentRarity(item);
        
        // 顯示結果
        this.showRerollResult(result);
        
        // 更新 UI
        this.updateUI();
        this.showAffixRerollInfo(item);
        this.loadAffixEquipmentList();
        
        // 添加到歷史
        this.addToRerollHistory({
            success: true,
            message: `重鑄完成！獲得 ${result.affixes ? result.affixes.length : 0} 個詞綴`,
            affixes: result.affixes || []
        });
        
        // 恢復按鈕
        if (this.dom.btnRerollAffix) {
            this.dom.btnRerollAffix.disabled = false;
            this.dom.btnRerollAffix.textContent = '✨ 重鑄詞綴！';
        }
    }

    updateEquipmentRarity(item) {
        if (!item.affixes || item.affixes.length === 0) return;
        
        // 找出最高稀有度的詞綴
        const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        let highestRarity = item._baseRarity || item.rarity || 'common';
        
        // 保存原始稀有度
        if (!item._baseRarity) {
            item._baseRarity = item.rarity;
        }
        
        for (const affix of item.affixes) {
            const affixRarityIndex = rarityOrder.indexOf(affix.rarity);
            const currentHighestIndex = rarityOrder.indexOf(highestRarity);
            if (affixRarityIndex > currentHighestIndex) {
                highestRarity = affix.rarity;
            }
        }
        
        // 更新裝備稀有度
        item.rarity = highestRarity;
    }

    async playRerollAnimation() {
        const resultEl = this.dom.rerollResult;
        if (!resultEl) return;
        
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
        
        resultEl.innerHTML = `
            <div class="result-icon success">${icon}</div>
            <div class="result-text">獲得 ${affixCount} 個詞綴！</div>
        `;
        
        setTimeout(() => {
            resultEl.style.display = 'none';
        }, 2000);
    }

    addToRerollHistory(result) {
        this.rerollHistory.unshift({
            ...result,
            timestamp: Date.now()
        });
        
        if (this.rerollHistory.length > 10) {
            this.rerollHistory.pop();
        }
        
        this.renderRerollHistory();
    }

    renderRerollHistory() {
        if (!this.dom.rerollHistory) return;
        
        this.dom.rerollHistory.innerHTML = this.rerollHistory.map(entry => `
            <div class="history-entry success">
                <span class="history-icon">✨</span>
                <span class="history-text">${entry.message}</span>
            </div>
        `).join('');
    }

    getRarityText(rarity) {
        const rarityMap = {
            'common': '普通',
            'uncommon': '優秀',
            'rare': '稀有',
            'epic': '史詩',
            'legendary': '傳說'
        };
        return rarityMap[rarity] || rarity || '普通';
    }

    // ==================== 裝備強化系統 ====================

    isEquipmentItem(item) {
        return item && (
            item.type === ItemType.WEAPON ||
            item.type === ItemType.ARMOR ||
            item.type === ItemType.ACCESSORY ||
            item.type === 'weapon' ||
            item.type === 'armor' ||
            item.type === 'accessory'
        );
    }

    loadEnhanceEquipmentList() {
        const char = GameManager.getCharacter();
        const inventory = GameManager.state?.inventory || [];

        if (!this.dom.enhanceEquipmentList) return;

        this.dom.enhanceEquipmentList.innerHTML = '';

        if (char?.equipment) {
            for (const slot in char.equipment) {
                const item = char.equipment[slot];
                if (item && this.isEquipmentItem(item)) {
                    this.addEnhanceEquipmentCard(item, true, slot);
                }
            }
        }

        inventory.forEach(stack => {
            const item = stack.item;
            if (this.isEquipmentItem(item)) {
                this.addEnhanceEquipmentCard(item, false, null);
            }
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
        card.className = `equipment-card ${item.rarity || 'common'} ${isSelected ? 'selected' : ''}`;

        const equippedBadge = isEquipped ? '<span class="equipped-badge">裝備中</span>' : '';
        const level = item.enhanceLevel || 0;
        const stability = item.enhancementStability ?? 0;
        const maxStability = item.maxEnhancementStability ?? 0;
        const markCount = Object.keys(item.enhancementMarks || {}).length;

        card.innerHTML = `
            <div class="card-icon">${item.icon || '⚔️'}</div>
            <div class="card-info">
                <div class="card-name">${enhancementManager.getDisplayName(item)}</div>
                <div class="card-stats">
                    +${level} / 穩定度 ${stability}/${maxStability} / 印記 ${markCount}
                </div>
            </div>
            ${equippedBadge}
        `;

        card.addEventListener('click', () => this.selectEnhanceEquipment(item, isEquipped, slot));
        this.dom.enhanceEquipmentList.appendChild(card);
    }

    selectEnhanceEquipment(item, isEquipped, slot) {
        this.selectedEnhanceEquipment = { item, isEquipped, slot };

        if (this.dom.selectedEnhanceEquipment) {
            this.dom.selectedEnhanceEquipment.innerHTML = `
                <div class="selected-item ${item.rarity || 'common'}">
                    <div class="item-icon">${item.icon || '⚔️'}</div>
                    <div class="item-info">
                        <div class="item-name">${enhancementManager.getDisplayName(item)}</div>
                        <div class="item-rarity">${this.getRarityText(item.rarity)}</div>
                    </div>
                </div>
            `;
        }

        this.showEnhanceInfo(item);
        this.loadEnhanceEquipmentList();
    }

    showEnhanceInfo(item) {
        if (!this.dom.enhanceInfo) return;

        const preview = enhancementManager.getEnhancementPreview(item);
        const gold = GameManager.getGold() || 0;
        const hasGold = gold >= preview.cost;

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
            this.dom.enhanceCost.className = `cost-value ${hasGold ? '' : 'not-enough'}`;
        }
        if (this.dom.enhanceNextMilestone) {
            this.dom.enhanceNextMilestone.textContent = preview.nextMilestone
                ? `下一個印記：+${preview.nextMilestone}`
                : '已達最終強化';
        }

        this.renderEnhancementMarks(item);

        if (this.dom.btnEnhanceEquipment) {
            this.dom.btnEnhanceEquipment.disabled = !preview.canEnhance || !hasGold;
            this.dom.btnEnhanceEquipment.textContent = preview.canEnhance
                ? `強化至 ${preview.nextLevel ? `+${preview.nextLevel}` : 'MAX'}`
                : '無法繼續強化';
        }

        this.dom.enhanceInfo.style.display = 'block';
    }

    renderEnhancementMarks(item) {
        if (!this.dom.enhanceMarksDisplay) return;

        const marks = Object.values(item.enhancementMarks || {})
            .sort((a, b) => (a.milestone || 0) - (b.milestone || 0));

        if (marks.length === 0) {
            this.dom.enhanceMarksDisplay.innerHTML = '<div class="no-affixes">尚無強化印記</div>';
            return;
        }

        this.dom.enhanceMarksDisplay.innerHTML = marks.map(mark => `
            <div class="affix-item ${mark.rarity || 'rare'}">
                +${mark.milestone} ${enhancementManager.getMarkDescription(mark)}
            </div>
        `).join('');
    }

    async enhanceSelectedEquipment() {
        if (!this.selectedEnhanceEquipment) return;

        const { item } = this.selectedEnhanceEquipment;
        const preview = enhancementManager.getEnhancementPreview(item);

        if (!preview.canEnhance) {
            this.showMessage('這件裝備無法繼續強化。', 'warning');
            return;
        }

        if (GameManager.getGold() < preview.cost) {
            this.showMessage('金幣不足。', 'error');
            return;
        }

        if (this.dom.btnEnhanceEquipment) {
            this.dom.btnEnhanceEquipment.disabled = true;
            this.dom.btnEnhanceEquipment.textContent = '強化中...';
        }

        await this.playEnhanceAnimation();

        const result = enhancementManager.enhance(item);

        if (result.success) {
            questManager.updateProgress(ObjectiveType.ENHANCE, item.rarity || 'any', 1);
            questManager.updateStats('enhance_level', result.newLevel);
        }

        GameManager.notify('all');
        this.showEnhanceResult(result);
        this.addToEnhanceHistory(result);
        this.updateUI();
        this.showEnhanceInfo(item);
        this.loadEnhanceEquipmentList();
    }

    async playEnhanceAnimation() {
        const resultEl = this.dom.enhanceResult;
        if (!resultEl) return;

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
        const markText = result.milestoneMark
            ? `<div class="result-affixes"><span class="affix-tag legendary">${enhancementManager.getMarkDescription(result.milestoneMark)}</span></div>`
            : '';

        resultEl.innerHTML = `
            <div class="result-icon ${className}">${icon}</div>
            <div class="result-text">${result.message}</div>
            ${markText}
        `;

        setTimeout(() => {
            resultEl.style.display = 'none';
        }, 2600);
    }

    addToEnhanceHistory(result) {
        this.enhanceHistory.unshift({
            ...result,
            timestamp: Date.now()
        });

        if (this.enhanceHistory.length > 10) {
            this.enhanceHistory.pop();
        }

        this.renderEnhanceHistory();
    }

    renderEnhanceHistory() {
        if (!this.dom.enhanceHistory) return;

        if (this.enhanceHistory.length === 0) {
            this.dom.enhanceHistory.innerHTML = '<div class="empty-inventory">尚無強化紀錄</div>';
            return;
        }

        this.dom.enhanceHistory.innerHTML = this.enhanceHistory.map(entry => `
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
