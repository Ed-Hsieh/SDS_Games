/**
 * ForgeScene.js
 * 鍛造工坊場景控制器
 */
import GameManager from '../managers/GameManager.js';
import { enhancementSystem, GemType } from './EnhancementSystem.js';
import AffixSystem from './AffixSystem.js';
import { ItemType } from '../models/DataModel.js';
import { questSystem } from './QuestSystem.js';
import { ObjectiveType } from '../data/Quests.js';
import { RecipeDatabase, getRecipe, getRecipesByType, canCraft, getMissingMaterials } from '../data/Recipes.js';
import { getMaterial, MaterialDatabase } from '../data/Materials.js';

export default class ForgeScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.selectedEquipment = null;
        this.selectedGem = null;
        this.selectedGemSlot = null;
        this.enhanceHistory = [];
        this.affixSystem = new AffixSystem();
        
        // 鍛造相關
        this.currentTab = 'craft';
        this.selectedRecipe = null;
        this.recipeFilter = 'all';
    }

    init() {
        console.log('Forge Scene Initialized');
        this.cacheDOM();
        this.bindEvents();
        this.updateUI();
        this.switchTab('craft');
    }

    cleanup() {
        this.unbindEvents();
        console.log('Forge Scene Cleaned up');
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
            btnCraft: this.container.querySelector('#btn-craft'),
            craftResult: this.container.querySelector('#craft-result'),
            materialsInventory: this.container.querySelector('#materials-inventory'),
            materialSearch: this.container.querySelector('#material-search'),
            
            // 強化面板
            enhancePanel: this.container.querySelector('#enhance-panel'),
            equipmentList: this.container.querySelector('#equipment-list'),
            selectedEquipment: this.container.querySelector('#selected-equipment'),
            enhanceInfo: this.container.querySelector('#enhance-info'),
            currentStats: this.container.querySelector('#current-stats-display'),
            previewStats: this.container.querySelector('#preview-stats-display'),
            successRate: this.container.querySelector('#success-rate'),
            enhanceCost: this.container.querySelector('#enhance-cost'),
            btnEnhance: this.container.querySelector('#btn-enhance'),
            useProtection: this.container.querySelector('#use-protection'),
            enhanceResult: this.container.querySelector('#enhance-result'),
            enhanceHistory: this.container.querySelector('#enhance-history'),
            
            // 寶石面板
            gemPanel: this.container.querySelector('#gem-panel'),
            gemEquipmentList: this.container.querySelector('#gem-equipment-list'),
            selectedGemEquipment: this.container.querySelector('#selected-gem-equipment'),
            gemSocketInfo: this.container.querySelector('#gem-socket-info'),
            gemSlots: this.container.querySelector('#gem-slots'),
            btnSocketGem: this.container.querySelector('#btn-socket-gem'),
            btnRemoveGem: this.container.querySelector('#btn-remove-gem'),
            gemInventory: this.container.querySelector('#gem-inventory')
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
        
        // 強化
        this.dom.btnEnhance?.addEventListener('click', () => this.enhanceEquipment());
        
        // 寶石
        this.dom.btnSocketGem?.addEventListener('click', () => this.socketGem());
        this.dom.btnRemoveGem?.addEventListener('click', () => this.removeGem());
        
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
                this.loadEquipmentList();
                break;
            case 'gem':
                this.loadGemEquipmentList();
                this.loadGemInventory();
                break;
        }
    }

    // ==================== 鍛造製作系統 ====================

    loadRecipeList() {
        if (!this.dom.recipeList) return;
        
        const recipes = getRecipesByType(this.recipeFilter);
        const inventory = GameManager.getInventory() || [];
        const warehouse = GameManager.state?.warehouse || [];
        
        this.dom.recipeList.innerHTML = recipes.map(recipe => {
            const craftable = canCraft(recipe.id, inventory, warehouse);
            const rarityClass = recipe.rarity || 'common';
            
            return `
                <div class="recipe-card ${rarityClass} ${craftable ? 'craftable' : 'locked'}" 
                     data-recipe-id="${recipe.id}">
                    <div class="recipe-icon">${recipe.icon}</div>
                    <div class="recipe-info">
                        <div class="recipe-name">${recipe.name}</div>
                        <div class="recipe-type">${this.getTypeLabel(recipe.type)}</div>
                    </div>
                    ${craftable ? '<span class="craftable-badge">✓</span>' : '<span class="locked-badge">🔒</span>'}
                </div>
            `;
        }).join('');
        
        // 綁定點擊事件
        this.dom.recipeList.querySelectorAll('.recipe-card').forEach(card => {
            card.addEventListener('click', () => {
                const recipeId = card.dataset.recipeId;
                this.selectRecipe(recipeId);
            });
        });
    }

    getTypeLabel(type) {
        const labels = {
            'weapon': '武器',
            'armor': '防具',
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
    }

    showRecipeInfo(recipe) {
        if (!this.dom.recipeInfo) return;
        
        const inventory = GameManager.getInventory() || [];
        const warehouse = GameManager.state?.warehouse || [];
        const craftable = canCraft(recipe.id, inventory, warehouse);
        const gold = GameManager.getGold() || 0;
        const hasGold = gold >= recipe.cost;
        
        // 顯示製作結果預覽
        const result = recipe.result;
        this.dom.craftResultPreview.innerHTML = `
            <div class="preview-item ${result.rarity || 'common'}">
                <div class="item-icon">${result.icon}</div>
                <div class="item-name">${result.name}</div>
                <div class="item-stats">
                    ${result.attack ? `<span>⚔️ ${result.attack}</span>` : ''}
                    ${result.defense ? `<span>🛡️ ${result.defense}</span>` : ''}
                    ${result.hp ? `<span>❤️ +${result.hp}</span>` : ''}
                    ${result.mp ? `<span>💙 +${result.mp}</span>` : ''}
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
        this.dom.craftCost.textContent = `${recipe.cost}G`;
        this.dom.craftCost.className = `cost-value ${hasGold ? '' : 'not-enough'}`;
        this.dom.craftSuccessRate.textContent = `${recipe.successRate}%`;
        
        // 按鈕狀態
        this.dom.btnCraft.disabled = !craftable || !hasGold;
        
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
            GameManager.addItem(newItem);
            
            this.showCraftResult(true, newItem);
            
            // 任務系統
            questSystem.updateProgress(ObjectiveType.CRAFT, recipe.type, 1);
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
            resultEl.innerHTML = `
                <div class="result-icon success">✅</div>
                <div class="result-text">鍛造成功！</div>
                <div class="result-item">
                    <span>${item.icon}</span>
                    <span>${item.name}</span>
                </div>
            `;
        } else {
            resultEl.innerHTML = `
                <div class="result-icon fail">❌</div>
                <div class="result-text">鍛造失敗！材料已損失...</div>
            `;
        }
        
        setTimeout(() => {
            resultEl.style.display = 'none';
        }, 2500);
    }

    // ==================== 強化系統 ====================

    loadEquipmentList() {
        const char = GameManager.getCharacter();
        const inventory = GameManager.state?.inventory || [];
        
        if (!this.dom.equipmentList) return;
        
        this.dom.equipmentList.innerHTML = '';
        
        // 已裝備的物品
        if (char?.equipment) {
            for (const slot in char.equipment) {
                const item = char.equipment[slot];
                if (item) {
                    this.addEquipmentCard(item, true, slot, this.dom.equipmentList);
                }
            }
        }
        
        // 背包中的裝備
        inventory.forEach(stack => {
            const item = stack.item;
            if (item && (item.type === ItemType.WEAPON || item.type === ItemType.ARMOR || item.type === ItemType.ACCESSORY ||
                         item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory')) {
                this.addEquipmentCard(item, false, null, this.dom.equipmentList);
            }
        });
    }

    addEquipmentCard(item, isEquipped, slot = null, container) {
        if (!container) return;
        
        const card = document.createElement('div');
        card.className = `equipment-card ${item.rarity || 'common'}`;
        
        const levelStr = item.enhanceLevel ? ` +${item.enhanceLevel}` : '';
        const equippedBadge = isEquipped ? '<span class="equipped-badge">裝備中</span>' : '';
        
        card.innerHTML = `
            <div class="card-icon">${item.icon || '⚔️'}</div>
            <div class="card-info">
                <div class="card-name">${item.name}${levelStr}</div>
                <div class="card-stats">
                    ${item.atk || item.attack ? `⚔️${item.atk || item.attack}` : ''}
                    ${item.def || item.defense ? `🛡️${item.def || item.defense}` : ''}
                </div>
            </div>
            ${equippedBadge}
        `;
        
        card.addEventListener('click', () => this.selectEquipment(item, isEquipped, slot));
        container.appendChild(card);
    }

    selectEquipment(item, isEquipped, slot) {
        this.selectedEquipment = { item, isEquipped, slot };
        
        // 更新選中顯示
        this.dom.selectedEquipment.innerHTML = `
            <div class="selected-item ${item.rarity || 'common'}">
                <div class="item-icon">${item.icon || '⚔️'}</div>
                <div class="item-info">
                    <div class="item-name">${enhancementSystem.getDisplayName(item)}</div>
                    <div class="item-rarity">${item.rarity || 'common'}</div>
                </div>
            </div>
        `;
        
        // 顯示強化資訊
        this.showEnhanceInfo(item);
        this.updateGemSlots(item);
        this.showAffixInfo(item);
    }

    showEnhanceInfo(item) {
        if (!this.dom.enhanceInfo) return;
        
        const preview = enhancementSystem.getEnhancementPreview(item);
        
        // 當前屬性
        this.dom.currentStats.innerHTML = `
            ${item.atk ? `<div>攻擊力: ${item.atk}</div>` : ''}
            ${item.def ? `<div>防禦力: ${item.def}</div>` : ''}
            <div>強化等級: +${item.enhanceLevel || 0}</div>
        `;
        
        // 預覽屬性
        if (preview.canEnhance) {
            const bonusMultiplier = 1 + ((preview.nextLevel) * 0.05);
            const baseAtk = item._baseAtk || item.atk || 0;
            const baseDef = item._baseDef || item.def || 0;
            
            this.dom.previewStats.innerHTML = `
                ${baseAtk ? `<div>攻擊力: ${Math.floor(baseAtk * bonusMultiplier)} <span class="stat-up">↑</span></div>` : ''}
                ${baseDef ? `<div>防禦力: ${Math.floor(baseDef * bonusMultiplier)} <span class="stat-up">↑</span></div>` : ''}
                <div>強化等級: +${preview.nextLevel} <span class="stat-up">↑</span></div>
            `;
        } else {
            this.dom.previewStats.innerHTML = '<div class="max-level">已達最高等級！</div>';
        }
        
        // 成功率和費用
        this.dom.successRate.textContent = `${preview.successRate}%`;
        this.dom.successRate.className = `rate-value ${preview.successRate >= 50 ? 'high' : preview.successRate >= 20 ? 'medium' : 'low'}`;
        this.dom.enhanceCost.textContent = `${preview.cost}G`;
        
        // 按鈕狀態
        this.dom.btnEnhance.disabled = !preview.canEnhance;
        
        this.dom.enhanceInfo.style.display = 'block';
    }

    async enhanceEquipment() {
        if (!this.selectedEquipment) return;
        
        const { item } = this.selectedEquipment;
        const useProtection = this.dom.useProtection?.checked || false;
        
        // 禁用按鈕
        this.dom.btnEnhance.disabled = true;
        
        // 播放動畫
        await this.playEnhanceAnimation();
        
        // 執行強化
        const result = enhancementSystem.enhance(item, useProtection);
        
        // 顯示結果
        this.showEnhanceResult(result);
        
        // 任務系統：更新強化進度
        if (result.success) {
            const newLevel = item.enhanceLevel || 0;
            questSystem.updateProgress(ObjectiveType.ENHANCE, 'any', 1);
            questSystem.updateStats('enhance_level', newLevel);
        }
        
        // 更新 UI
        this.updateUI();
        this.showEnhanceInfo(item);
        this.loadEquipmentList();
        this.addToHistory(result);
        
        // 重新啟用按鈕
        setTimeout(() => {
            this.dom.btnEnhance.disabled = false;
        }, 1000);
    }

    async playEnhanceAnimation() {
        const resultEl = this.dom.enhanceResult;
        if (!resultEl) return;
        
        resultEl.style.display = 'flex';
        resultEl.innerHTML = `
            <div class="result-icon spinning">⚒️</div>
            <div class="result-text">強化中...</div>
        `;
        
        await this.sleep(1500);
    }

    showEnhanceResult(result) {
        const resultEl = this.dom.enhanceResult;
        if (!resultEl) return;
        
        const icon = result.success ? (result.isCritical ? '✨' : '✅') : '❌';
        const className = result.success ? 'success' : 'fail';
        
        resultEl.innerHTML = `
            <div class="result-icon ${className}">${icon}</div>
            <div class="result-text">${result.message}</div>
        `;
        
        setTimeout(() => {
            resultEl.style.display = 'none';
        }, 2000);
    }

    addToHistory(result) {
        this.enhanceHistory.unshift({
            ...result,
            timestamp: Date.now()
        });
        
        if (this.enhanceHistory.length > 10) {
            this.enhanceHistory.pop();
        }
        
        this.renderHistory();
    }

    renderHistory() {
        if (!this.dom.enhanceHistory) return;
        
        this.dom.enhanceHistory.innerHTML = this.enhanceHistory.map(entry => `
            <div class="history-entry ${entry.success ? 'success' : 'fail'}">
                <span class="history-icon">${entry.success ? '✅' : '❌'}</span>
                <span class="history-text">${entry.message}</span>
            </div>
        `).join('');
    }

    // ==================== 寶石系統 ====================

    loadGemInventory() {
        const inventory = GameManager.state?.inventory || [];
        if (!this.dom.gemInventory) return;
        
        this.dom.gemInventory.innerHTML = '';
        
        inventory.forEach(stack => {
            const item = stack.item;
            if (item && (item.type === ItemType.GEM || item.type === ItemType.SOCKET_GEM || item.type === 'socket_gem')) {
                const gemCard = document.createElement('div');
                gemCard.className = 'gem-card';
                gemCard.innerHTML = `
                    <span class="gem-icon">${item.icon || '💎'}</span>
                    <span class="gem-name">${item.name}</span>
                    <span class="gem-count">x${stack.quantity}</span>
                `;
                gemCard.addEventListener('click', () => this.selectGem(item));
                this.dom.gemInventory.appendChild(gemCard);
            }
        });
        
        if (this.dom.gemInventory.children.length === 0) {
            this.dom.gemInventory.innerHTML = '<div class="empty-gems">沒有可用的寶石</div>';
        }
    }

    selectGem(gem) {
        this.selectedGem = gem;
        
        // 更新 UI 顯示選中狀態
        this.dom.gemInventory.querySelectorAll('.gem-card').forEach(card => {
            card.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');
        
        this.updateSocketButton();
    }

    updateGemSlots(item) {
        if (!this.dom.gemSlots) return;
        
        const maxSlots = enhancementSystem.getGemSlotCount(item);
        const socketedGems = item.socketedGems || [];
        
        this.dom.gemSlots.innerHTML = '';
        
        for (let i = 0; i < 3; i++) {
            const slot = document.createElement('div');
            
            if (i < maxSlots) {
                const gem = socketedGems[i];
                if (gem) {
                    slot.className = 'gem-slot filled';
                    slot.innerHTML = `
                        <span class="slot-icon">${gem.icon || '💎'}</span>
                        <span class="slot-label">${gem.name}</span>
                    `;
                } else {
                    slot.className = 'gem-slot empty';
                    slot.innerHTML = `
                        <span class="slot-icon">◇</span>
                        <span class="slot-label">空槽位</span>
                    `;
                }
                slot.addEventListener('click', () => this.selectGemSlot(i));
            } else {
                slot.className = 'gem-slot locked';
                slot.innerHTML = `
                    <span class="slot-icon">🔒</span>
                    <span class="slot-label">未解鎖</span>
                `;
            }
            
            slot.dataset.slot = i;
            this.dom.gemSlots.appendChild(slot);
        }
    }

    selectGemSlot(slotIndex) {
        this.selectedGemSlot = slotIndex;
        
        this.dom.gemSlots.querySelectorAll('.gem-slot').forEach((slot, i) => {
            slot.classList.toggle('selected', i === slotIndex);
        });
        
        this.updateSocketButton();
    }

    updateSocketButton() {
        if (!this.dom.btnSocketGem) return;
        
        const canSocket = this.selectedEquipment && 
                         this.selectedGem && 
                         this.selectedGemSlot !== null;
        
        this.dom.btnSocketGem.disabled = !canSocket;
    }

    socketGem() {
        if (!this.selectedEquipment || !this.selectedGem || this.selectedGemSlot === null) {
            return;
        }
        
        const result = enhancementSystem.socketGem(
            this.selectedEquipment.item,
            this.selectedGem,
            this.selectedGemSlot
        );
        
        if (result.success) {
            this.showMessage(result.message, 'success');
            this.loadGemInventory();
            this.updateGemSlots(this.selectedEquipment.item);
        } else {
            this.showMessage(result.message, 'error');
        }
        
        this.selectedGem = null;
        this.selectedGemSlot = null;
        this.updateSocketButton();
    }

    showMessage(message, type) {
        // 簡單的訊息顯示
        alert(message);
    }

    // ==================== 詞綴系統 ====================

    showAffixInfo(item) {
        if (!this.dom.affixPanel) {
            // 如果 DOM 不存在，動態創建詞綴面板
            this.createAffixPanel();
        }

        const affixSlots = this.affixSystem.getAffixSlots(item.rarity || 'common');
        const currentAffixes = item.affixes || [];

        // 計算重鑄費用
        const rerollCost = this.calculateRerollCost(item);

        // 顯示當前詞綴
        let affixHtml = '<h4>裝備詞綴</h4>';
        
        if (affixSlots.prefix === 0 && affixSlots.suffix === 0) {
            affixHtml += '<p class="no-affix">此稀有度無法擁有詞綴</p>';
        } else {
            affixHtml += '<div class="affix-slots">';
            affixHtml += `<p>詞綴槽位: 前綴 ${affixSlots.prefix} / 後綴 ${affixSlots.suffix}</p>`;
            
            if (currentAffixes.length > 0) {
                affixHtml += '<ul class="affix-list">';
                for (const affix of currentAffixes) {
                    const typeLabel = affix.type === 'prefix' ? '【前綴】' : '【後綴】';
                    const effectText = this.formatAffixEffect(affix);
                    affixHtml += `<li class="affix-item ${affix.type}">${typeLabel} ${affix.name}: ${effectText}</li>`;
                }
                affixHtml += '</ul>';
            } else {
                affixHtml += '<p class="no-affix">尚無詞綴</p>';
            }
            affixHtml += '</div>';
        }

        if (this.dom.currentAffixes) {
            this.dom.currentAffixes.innerHTML = affixHtml;
        }

        if (this.dom.affixCost) {
            this.dom.affixCost.textContent = `${rerollCost}G`;
        }

        if (this.dom.btnRerollAffix) {
            const canReroll = affixSlots.prefix > 0 || affixSlots.suffix > 0;
            this.dom.btnRerollAffix.disabled = !canReroll;
        }

        if (this.dom.affixPanel) {
            this.dom.affixPanel.style.display = 'block';
        }
    }

    createAffixPanel() {
        // 在寶石面板後動態創建詞綴面板
        const gemSection = this.container.querySelector('.gem-section');
        if (!gemSection) return;

        const affixPanel = document.createElement('div');
        affixPanel.className = 'affix-section';
        affixPanel.id = 'affix-panel';
        affixPanel.innerHTML = `
            <div class="section-header">
                <h3>⚡ 詞綴重鑄</h3>
            </div>
            <div class="affix-content">
                <div id="current-affixes" class="current-affixes"></div>
                <div class="reroll-controls">
                    <span class="cost-label">重鑄費用: <span id="affix-cost">0</span></span>
                    <button id="btn-reroll-affix" class="btn-reroll">🔄 重鑄詞綴</button>
                </div>
            </div>
        `;

        gemSection.after(affixPanel);

        // 重新綁定 DOM 和事件
        this.dom.affixPanel = affixPanel;
        this.dom.currentAffixes = affixPanel.querySelector('#current-affixes');
        this.dom.affixCost = affixPanel.querySelector('#affix-cost');
        this.dom.btnRerollAffix = affixPanel.querySelector('#btn-reroll-affix');
        this.dom.btnRerollAffix.addEventListener('click', () => this.rerollAffixes());
    }

    formatAffixEffect(affix) {
        const effects = [];
        if (affix.bonusAtk) effects.push(`攻擊+${affix.bonusAtk}`);
        if (affix.bonusDef) effects.push(`防禦+${affix.bonusDef}`);
        if (affix.bonusHp) effects.push(`生命+${affix.bonusHp}`);
        if (affix.bonusMp) effects.push(`魔力+${affix.bonusMp}`);
        if (affix.bonusCrit) effects.push(`暴擊+${affix.bonusCrit}%`);
        if (affix.bonusSpeed) effects.push(`速度+${affix.bonusSpeed}`);
        if (affix.bonusHpRegen) effects.push(`生命回復+${affix.bonusHpRegen}`);
        if (affix.bonusMpRegen) effects.push(`魔力回復+${affix.bonusMpRegen}`);
        if (affix.bonusGoldFind) effects.push(`金幣獲取+${affix.bonusGoldFind}%`);
        if (affix.bonusExpBonus) effects.push(`經驗加成+${affix.bonusExpBonus}%`);
        if (affix.bonusLifeSteal) effects.push(`生命偷取+${affix.bonusLifeSteal}%`);
        if (affix.bonusAtkPercent) effects.push(`攻擊+${affix.bonusAtkPercent}%`);
        if (affix.bonusDefPercent) effects.push(`防禦+${affix.bonusDefPercent}%`);
        if (affix.bonusAllStats) effects.push(`全屬性+${affix.bonusAllStats}`);
        return effects.join(', ') || '無效果';
    }

    calculateRerollCost(item) {
        const basePrice = item.price || 100;
        const rarityMultiplier = {
            'common': 0,
            'uncommon': 1,
            'rare': 2,
            'epic': 3,
            'legendary': 5
        };
        const multiplier = rarityMultiplier[item.rarity || 'common'] || 1;
        return Math.floor(basePrice * 0.5 * multiplier);
    }

    async rerollAffixes() {
        if (!this.selectedEquipment) {
            this.showMessage('請先選擇裝備！', 'error');
            return;
        }

        const { item } = this.selectedEquipment;
        const cost = this.calculateRerollCost(item);
        const currentGold = GameManager.getGold();

        if (currentGold < cost) {
            this.showMessage(`金幣不足！需要 ${cost}G`, 'error');
            return;
        }

        // 扣除金幣
        GameManager.addGold(-cost);

        // 播放動畫
        if (this.dom.btnRerollAffix) {
            this.dom.btnRerollAffix.disabled = true;
            this.dom.btnRerollAffix.textContent = '🔄 重鑄中...';
        }

        await this.sleep(1000);

        // 重鑄詞綴
        const result = this.affixSystem.generateAffixes(item, true);

        // 更新顯示
        this.showAffixInfo(item);
        this.updateUI();

        // 添加到歷史
        this.addToHistory({
            success: true,
            message: `重鑄詞綴完成，獲得 ${result.affixes.length} 個詞綴！`,
            isCritical: false
        });

        // 恢復按鈕
        if (this.dom.btnRerollAffix) {
            this.dom.btnRerollAffix.disabled = false;
            this.dom.btnRerollAffix.textContent = '🔄 重鑄詞綴';
        }

        // 更新裝備卡片顯示
        this.loadEquipmentList();
        
        this.showMessage(`重鑄成功！獲得 ${result.affixes.length} 個詞綴`, 'success');
    }

    // ==================== 寶石面板的裝備列表 ====================

    loadGemEquipmentList() {
        const char = GameManager.getCharacter();
        const inventory = GameManager.state?.inventory || [];
        
        if (!this.dom.gemEquipmentList) return;
        
        this.dom.gemEquipmentList.innerHTML = '';
        
        // 已裝備的物品
        if (char?.equipment) {
            for (const slot in char.equipment) {
                const item = char.equipment[slot];
                if (item) {
                    this.addGemEquipmentCard(item, true, slot);
                }
            }
        }
        
        // 背包中的裝備
        inventory.forEach(stack => {
            const item = stack.item;
            if (item && (item.type === ItemType.WEAPON || item.type === ItemType.ARMOR || item.type === ItemType.ACCESSORY ||
                         item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory')) {
                this.addGemEquipmentCard(item, false, null);
            }
        });
    }

    addGemEquipmentCard(item, isEquipped, slot) {
        if (!this.dom.gemEquipmentList) return;
        
        const card = document.createElement('div');
        card.className = `equipment-card ${item.rarity || 'common'}`;
        
        const gemCount = item.socketedGems?.length || 0;
        const maxSlots = enhancementSystem.getGemSlotCount(item);
        const equippedBadge = isEquipped ? '<span class="equipped-badge">裝備中</span>' : '';
        
        card.innerHTML = `
            <div class="card-icon">${item.icon || '⚔️'}</div>
            <div class="card-info">
                <div class="card-name">${item.name}</div>
                <div class="card-stats">
                    💎 ${gemCount}/${maxSlots}
                </div>
            </div>
            ${equippedBadge}
        `;
        
        card.addEventListener('click', () => this.selectGemEquipment(item, isEquipped, slot));
        this.dom.gemEquipmentList.appendChild(card);
    }

    selectGemEquipment(item, isEquipped, slot) {
        this.selectedEquipment = { item, isEquipped, slot };
        
        // 更新選中顯示
        if (this.dom.selectedGemEquipment) {
            this.dom.selectedGemEquipment.innerHTML = `
                <div class="selected-item ${item.rarity || 'common'}">
                    <div class="item-icon">${item.icon || '⚔️'}</div>
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-rarity">${item.rarity || 'common'}</div>
                    </div>
                </div>
            `;
        }
        
        // 顯示寶石槽資訊
        if (this.dom.gemSocketInfo) {
            this.dom.gemSocketInfo.style.display = 'block';
        }
        
        this.updateGemSlots(item);
        this.updateRemoveGemButton();
    }

    updateRemoveGemButton() {
        if (!this.dom.btnRemoveGem) return;
        
        const hasSelectedSlotWithGem = this.selectedEquipment && 
                                        this.selectedGemSlot !== null &&
                                        this.selectedEquipment.item.socketedGems?.[this.selectedGemSlot];
        
        this.dom.btnRemoveGem.disabled = !hasSelectedSlotWithGem;
    }

    removeGem() {
        if (!this.selectedEquipment || this.selectedGemSlot === null) {
            return;
        }
        
        const item = this.selectedEquipment.item;
        const gem = item.socketedGems?.[this.selectedGemSlot];
        
        if (!gem) {
            this.showMessage('此槽位沒有寶石！', 'error');
            return;
        }
        
        // 移除寶石
        item.socketedGems[this.selectedGemSlot] = null;
        
        // 將寶石返還到背包
        GameManager.addItem(gem);
        
        this.showMessage(`成功移除 ${gem.name}！`, 'success');
        
        // 更新 UI
        this.updateGemSlots(item);
        this.loadGemInventory();
        this.updateRemoveGemButton();
        
        this.selectedGemSlot = null;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
