/**
 * ForgeScene.js
 * 鍛造工坊場景控制器
 */
import GameManager from '../managers/GameManager.js';
import { enhancementSystem, GemType } from './EnhancementSystem.js';
import { ItemType } from '../models/DataModel.js';
import { questSystem } from './QuestSystem.js';
import { ObjectiveType } from '../data/Quests.js';

export default class ForgeScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.selectedEquipment = null;
        this.selectedGem = null;
        this.selectedGemSlot = null;
        this.enhanceHistory = [];
    }

    init() {
        console.log('Forge Scene Initialized');
        this.cacheDOM();
        this.bindEvents();
        this.updateUI();
        this.loadEquipmentList();
    }

    cleanup() {
        this.unbindEvents();
        console.log('Forge Scene Cleaned up');
    }

    cacheDOM() {
        this.dom = {
            gold: this.container.querySelector('#forge-gold'),
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
            gemSlots: this.container.querySelector('#gem-slots'),
            gemInventory: this.container.querySelector('#gem-inventory'),
            btnSocketGem: this.container.querySelector('#btn-socket-gem'),
            enhanceHistory: this.container.querySelector('#enhance-history'),
            btnBackLobby: this.container.querySelector('#btn-back-lobby')
        };
    }

    bindEvents() {
        this.dom.btnEnhance?.addEventListener('click', () => this.enhanceEquipment());
        this.dom.btnSocketGem?.addEventListener('click', () => this.socketGem());
        this.dom.btnBackLobby?.addEventListener('click', () => this.app.loadScene('lobby'));
    }

    unbindEvents() {
        // Clean up if needed
    }

    updateUI() {
        const gold = GameManager.getGold() || 0;
        if (this.dom.gold) this.dom.gold.textContent = gold;
    }

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
                    this.addEquipmentCard(item, true, slot);
                }
            }
        }
        
        // 背包中的裝備
        inventory.forEach(stack => {
            const item = stack.item;
            if (item && (item.type === ItemType.WEAPON || item.type === ItemType.ARMOR || item.type === ItemType.ACCESSORY)) {
                this.addEquipmentCard(item, false);
            }
        });

        // 載入寶石
        this.loadGemInventory();
    }

    addEquipmentCard(item, isEquipped, slot = null) {
        const card = document.createElement('div');
        card.className = `equipment-card ${item.rarity || 'common'}`;
        
        const levelStr = item.enhanceLevel ? ` +${item.enhanceLevel}` : '';
        const equippedBadge = isEquipped ? '<span class="equipped-badge">裝備中</span>' : '';
        
        card.innerHTML = `
            <div class="card-icon">${item.icon || '⚔️'}</div>
            <div class="card-info">
                <div class="card-name">${item.name}${levelStr}</div>
                <div class="card-stats">
                    ${item.atk ? `⚔️${item.atk}` : ''}
                    ${item.def ? `🛡️${item.def}` : ''}
                </div>
            </div>
            ${equippedBadge}
        `;
        
        card.addEventListener('click', () => this.selectEquipment(item, isEquipped, slot));
        this.dom.equipmentList.appendChild(card);
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

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
