/**
 * EventManager.js
 * 選擇與返回事件的行為（使用 data/Events.js 作為單一資料庫）
 */
import { EventDatabase, EventType, ResultType } from '../data/Events.js';
import GameManager from './GameManager.js';
import { Consumable, Item, ItemType, ItemRarity } from '../models/DataModel.js';

function weightedPick(list, rng = Math.random) {
    const total = list.reduce((s, it) => s + (it.weight || 0), 0);
    if (total <= 0) return null;
    let r = rng() * total;
    for (const it of list) {
        r -= (it.weight || 0);
        if (r <= 0) return it;
    }
    return list[list.length - 1];
}

export function getEventForZone(zoneType, rng = Math.random) {
    if (!zoneType) zoneType = 'low';

    // Define preferred event type weights per zone (sums roughly to 1)
    const zoneWeights = {
        low: [
            { type: EventType.BLESSING, weight: 0.6 },
            { type: EventType.CURSE, weight: 0.1 },
            { type: EventType.GAMBLE, weight: 0.05 },
            { type: EventType.TRADE, weight: 0.1 },
            { type: EventType.MYSTERY, weight: 0.05 },
            { type: EventType.ENCOUNTER, weight: 0.1 }
        ],
        medium: [
            { type: EventType.BLESSING, weight: 0.35 },
            { type: EventType.CURSE, weight: 0.15 },
            { type: EventType.GAMBLE, weight: 0.1 },
            { type: EventType.TRADE, weight: 0.15 },
            { type: EventType.MYSTERY, weight: 0.15 },
            { type: EventType.ENCOUNTER, weight: 0.1 }
        ],
        high: [
            { type: EventType.BLESSING, weight: 0.25 },
            { type: EventType.CURSE, weight: 0.2 },
            { type: EventType.GAMBLE, weight: 0.15 },
            { type: EventType.TRADE, weight: 0.1 },
            { type: EventType.MYSTERY, weight: 0.15 },
            { type: EventType.ENCOUNTER, weight: 0.15 }
        ],
        boss: [
            { type: EventType.BLESSING, weight: 0.35 },
            { type: EventType.CURSE, weight: 0.25 },
            { type: EventType.MYSTERY, weight: 0.2 },
            { type: EventType.ENCOUNTER, weight: 0.2 }
        ]
    };

    const candidates = zoneWeights[zoneType] || zoneWeights.low;
    const chosen = weightedPick(candidates, rng);
    const targetType = chosen ? chosen.type : EventType.MYSTERY;

    // Find events of that type
    const pool = EventDatabase.filter(e => e.type === targetType);
    if (pool.length === 0) {
        // fallback: any event
        if (EventDatabase.length === 0) return null;
        return EventDatabase[Math.floor(rng() * EventDatabase.length)];
    }

    return pool[Math.floor(rng() * pool.length)];
}

function getWeightedRandomResults(randomResults, rng = Math.random) {
    const totalWeight = randomResults.reduce((sum, r) => sum + (r.weight || 0), 0);
    if (totalWeight <= 0) return randomResults[0] ? randomResults[0].results || [] : [];
    let random = rng() * totalWeight;
    for (const option of randomResults) {
        random -= (option.weight || 0);
        if (random <= 0) return option.results || [];
    }
    return randomResults[0].results || [];
}

function generateEventItem(itemType) {
    const timestamp = Date.now();
    switch (itemType) {
        case 'gem': {
            // 鑲嵌功能已停用，改為獎勵強化石（材料）
            return new Item(`enhance_stone_${timestamp}`, '強化石', ItemType.MATERIAL, ItemRarity.RARE, '🪨', '可用於強化或任務的材料。', 150);
        }
        case 'random':
        default: {
            const items = [
                new Consumable(`event_potion_${timestamp}`, '神秘藥水', ItemType.POTION, ItemRarity.RARE, '🧪', '來自異世界的神秘藥水', 100, { hp: 80, mp: 40 }),
                new Item(`event_crystal_${timestamp}`, '魔力水晶', ItemType.MATERIAL, ItemRarity.EPIC, '💎', '蘊含強大魔力的水晶', 200)
            ];
            return items[Math.floor(Math.random() * items.length)];
        }
    }
}

export function executeChoice(eventObj, choiceIndex) {
    if (!eventObj) return { success: false, message: 'no event' };
    const choice = eventObj.choices && eventObj.choices[choiceIndex];
    if (!choice) return { success: false, message: 'invalid choice' };

    const char = GameManager.getCharacter();
    const resultMessages = [];

    // cost handling
    if (choice.cost) {
        const costCheck = checkAndPayCost(char, choice.cost);
        if (!costCheck.success) return costCheck;
        if (costCheck.message) resultMessages.push(costCheck.message);
    }

    // determine results
    let results = [];
    if (choice.isRandom && choice.randomResults) {
        results = getWeightedRandomResults(choice.randomResults);
    } else if (choice.chance !== undefined) {
        const success = Math.random() < choice.chance;
        results = success ? (choice.successResults || []) : (choice.failResults || []);
    } else {
        results = choice.results || [];
    }

    // apply results
    for (const result of results) {
        const msg = applyResultToCharacter(char, result);
        if (msg) resultMessages.push(msg);
    }

    return { success: true, eventName: eventObj.name, messages: resultMessages };
}

function checkAndPayCost(char, cost) {
    // gold
    if (cost.gold) {
        if (GameManager.getGold() < cost.gold) return { success: false, message: `金幣不足！需要 ${cost.gold}G` };
        GameManager.removeGold(cost.gold);
    }

    if (cost.hp) {
        const hpCost = cost.isPercent ? Math.floor(char.maxHp * cost.hp) : cost.hp;
        if (char.hp <= hpCost) return { success: false, message: '生命值不足以支付！' };
        char.hp -= hpCost;
        return { success: true, message: `消耗 ${hpCost} 生命值` };
    }

    if (cost.atk) {
        char.baseAtk = Math.max(1, char.baseAtk - cost.atk);
        return { success: true, message: `攻擊力降低 ${cost.atk}` };
    }

    return { success: true };
}

function applyResultToCharacter(char, result) {
    switch (result.type) {
        case ResultType.GOLD:
            if (result.value > 0) GameManager.addGold(result.value);
            return result.message;
        case ResultType.HEAL: {
            const healAmount = result.isPercent ? Math.floor(char.maxHp * result.value) : result.value;
            const actualHeal = Math.min(healAmount, char.maxHp - char.hp);
            char.hp += actualHeal;
            return result.message || `恢復 ${actualHeal} 生命值`;
        }
        case ResultType.DAMAGE: {
            const damage = Math.max(1, result.value - char.getTotalDef());
            char.hp = Math.max(1, char.hp - damage);
            return result.message || `受到 ${damage} 點傷害`;
        }
        case ResultType.BUFF:
        case ResultType.DEBUFF:
            if (char.addBuff) char.addBuff(result.buffType, result.value, result.duration);
            return result.message;
        case ResultType.STAT:
            if (char[result.stat] !== undefined) {
                char[result.stat] += result.value;
                if (result.stat === 'maxHp' && result.value > 0) {
                    char.hp = Math.min(char.hp + result.value, char.maxHp);
                }
            }
            return result.message;
        case ResultType.EXP:
            char.exp += result.value;
            if (char.checkLevelUp) char.checkLevelUp();
            return result.message || `獲得 ${result.value} 經驗值`;
        case ResultType.ITEM: {
            const item = generateEventItem(result.itemType);
            if (item) GameManager.addToInventory(item);
            return result.message || (item ? `獲得 ${item.name}！` : result.message);
        }
        default:
            return result.message;
    }
}

export default {
    getEventForZone
};

/**
 * EventManager 類 - 事件系統管理器
 * (原 scenes/EventSystem.js 整合而來)
 */
export class EventManagerClass {
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
        const event = getEventForZone(zone);
        if (!event) return null;

        this.currentEvent = { ...event, zone };
        return this.currentEvent;
    }

    /**
     * 執行選項
     * @param {number} choiceIndex - 選項索引
     * @returns {Object} 執行結果
     */
    executeChoiceByIndex(choiceIndex) {
        if (!this.currentEvent) {
            return { success: false, message: '沒有進行中的事件' };
        }
        const res = executeChoice(this.currentEvent, choiceIndex);
        if (res && res.success) {
            this.eventHistory.push({ event: this.currentEvent, choiceIndex, timestamp: Date.now() });
            const eventName = this.currentEvent.name;
            this.currentEvent = null;
            return { success: true, eventName, messages: res.messages };
        }
        return res;
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

    /**
     * 獲取事件歷史
     */
    getEventHistory() {
        return this.eventHistory;
    }
}

// 單例導出
export const eventManager = new EventManagerClass();
