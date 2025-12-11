/**
 * EventSystem.js
 * 隨機事件系統 - Slay the Spire 風格的選擇事件處理
 */
import GameManager from '../managers/GameManager.js';
import EventManager from '../managers/EventManager.js';

export default class EventSystem {
    constructor() {
        this.currentEvent = null;
        this.eventHistory = [];
    }

    /**
     * 觸發隨機事件
     * @param {string} zone - 當前區域
     * @returns {Object|null} 事件物件
     */
    triggerRandomEvent(zone = 'low') {
        const event = EventManager.getEventForZone(zone);
        if (!event) return null;

        this.currentEvent = { ...event, zone };
        return this.currentEvent;
    }

    /**
     * 執行選項
     * @param {number} choiceIndex - 選項索引
     * @returns {Object} 執行結果
     */
    executeChoice(choiceIndex) {
        if (!this.currentEvent) {
            return { success: false, message: '沒有進行中的事件' };
        }
        // Delegate event resolution to manager
        const res = EventManager.executeChoice(this.currentEvent, choiceIndex);
        // record history if success
        if (res && res.success) {
            this.eventHistory.push({ event: this.currentEvent, choiceIndex, timestamp: Date.now() });
            const eventName = this.currentEvent.name;
            this.currentEvent = null;
            return { success: true, eventName, messages: res.messages };
        }
        return res;
    }

    /**
     * 檢查並支付花費
     */
    checkAndPayCost(char, cost) {
        // 檢查金幣
        if (cost.gold) {
            if (GameManager.getGold() < cost.gold) {
                return { success: false, message: `金幣不足！需要 ${cost.gold}G` };
            }
            GameManager.removeGold(cost.gold);
        }

        // 檢查/扣除 HP
        if (cost.hp) {
            const hpCost = cost.isPercent ? Math.floor(char.maxHp * cost.hp) : cost.hp;
            if (char.hp <= hpCost) {
                return { success: false, message: '生命值不足以支付！' };
            }
            char.hp -= hpCost;
            return { success: true, message: `消耗 ${hpCost} 生命值` };
        }

        // 扣除屬性
        if (cost.atk) {
            char.baseAtk = Math.max(1, char.baseAtk - cost.atk);
            return { success: true, message: `攻擊力降低 ${cost.atk}` };
        }

        return { success: true };
    }

    /**
     * 加權隨機選擇結果
     */
    getWeightedRandomResults(randomResults) {
        // retained for backward compatibility but manager handles logic
        const totalWeight = randomResults.reduce((sum, r) => sum + r.weight, 0);
        let random = Math.random() * totalWeight;
        for (const option of randomResults) {
            random -= option.weight;
            if (random <= 0) return option.results;
        }
        return randomResults[0].results;
    }

    /**
     * 應用單個結果
     */
    applyResult(char, result) {
        // delegate to EventManager to keep logic in managers
        const tempChar = GameManager.getCharacter();
        if (!tempChar) return result.message;
        // Not used locally; EventManager applies results centrally.
        return result.message;
    }

    /**
     * 生成事件物品
     */
    generateEventItem(itemType) {
        const timestamp = Date.now();
        
        switch (itemType) {
            case 'gem':
                const gems = [
                    { name: '紅寶石', icon: '🔴', stat: 'atk', value: 3 },
                    { name: '藍寶石', icon: '🔵', stat: 'def', value: 3 },
                    { name: '綠寶石', icon: '🟢', stat: 'hp', value: 20 }
                ];
                const gem = gems[Math.floor(Math.random() * gems.length)];
                return new Item(`gem_${timestamp}`, gem.name, ItemType.GEM, ItemRarity.RARE, gem.icon, 
                    `可鑲嵌到裝備上，${gem.stat}+${gem.value}`, 150, { stat: gem.stat, value: gem.value });
                
            case 'random':
            default:
                const items = [
                    new Consumable(`event_potion_${timestamp}`, '神秘藥水', ItemType.POTION, ItemRarity.RARE, '🧪', '來自異世界的神秘藥水', 100, { hp: 80, mp: 40 }),
                    new Item(`event_crystal_${timestamp}`, '魔力水晶', ItemType.MATERIAL, ItemRarity.EPIC, '💎', '蘊含強大魔力的水晶', 200)
                ];
                return items[Math.floor(Math.random() * items.length)];
        }
    }

    /**
     * 獲取當前事件
     */
    getCurrentEvent() {
        return this.currentEvent;
    }

    /**
     * 取消當前事件
     */
    cancelEvent() {
        this.currentEvent = null;
    }
}

// 單例模式
export const eventSystem = new EventSystem();
