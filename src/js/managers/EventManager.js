/**
 * EventManager.js
 * 選擇與返回事件的行為（使用 data/Events.js 作為單一資料庫）
 */
import { EventDatabase, EventType, EventRole, ResultType, isEventAllowedInChapter } from '../data/Events.js';
import GameManager from './GameManager.js';
import { Consumable, Item } from '../models/DataModel.js';
import { ItemType, ItemRarity } from '../models/Enums.js';
import { weightedPick } from '../utils/WeightedPick.js';
import { questManager, QuestStatus } from './QuestManager.js';
import { QuestDatabase, getQuestById } from '../data/Quests.js';
import { worldInteractionManager } from './WorldInteractionManager.js';
import { getWorldInteraction } from '../data/WorldInteractions.js';

const MAP_QUESTION_EVENT_IDS_BY_ZONE = {
    low: [
        'field_notice_board',
        'abandoned_blueprint_cache'
    ],
    medium: [
        'weathered_route_tablet',
        'field_notice_board',
        'abandoned_blueprint_cache',
        'special_bounty_notice'
    ],
    high: [
        'weathered_route_tablet',
        'special_bounty_notice'
    ],
    death: [
        'weathered_route_tablet'
    ],
    boss: [
        'weathered_route_tablet'
    ]
};

const EVENT_MEMORY_FLAG_PREFIX = 'event.memory.';
const EVENT_LAST_STEP_FLAG_PREFIX = 'event.lastStep.';

function getEventMemoryKey(eventObj = {}) {
    return String(eventObj.memoryKey || eventObj.id || '').trim();
}

function getEventRepeatPolicy(eventObj = {}) {
    if (eventObj.repeatPolicy) return eventObj.repeatPolicy;
    switch (eventObj.eventRole) {
        case EventRole.STORY_SEED:
        case EventRole.SIDE_STORY:
            return 'one_time';
        case EventRole.WORLD_LORE:
            return 'chapter_once';
        default:
            return 'repeatable';
    }
}

function getEventMemoryFlag(eventObj = {}, chapter = null) {
    const key = getEventMemoryKey(eventObj);
    if (!key) return null;
    const suffix = chapter === null || chapter === undefined ? key : `${key}.chapter.${chapter}`;
    return `${EVENT_MEMORY_FLAG_PREFIX}${suffix}`;
}

function getEventLastStepFlag(eventObj = {}) {
    const key = getEventMemoryKey(eventObj);
    return key ? `${EVENT_LAST_STEP_FLAG_PREFIX}${key}` : null;
}

function getCurrentEventStep(options = {}) {
    const rawStep = options.stepCount ?? GameManager.getFlag('map.travelStep');
    const step = Number(rawStep);
    return Number.isFinite(step) ? step : null;
}

function pickWeightedEvent(pool = [], rng = Math.random) {
    if (pool.length === 0) return null;
    const weightedPool = pool.map(event => {
        const numericWeight = Number(event.weight);
        const weight = Number.isFinite(numericWeight) ? Math.max(0, numericWeight) : 1;
        return { event, weight };
    }).filter(entry => entry.weight > 0);

    if (weightedPool.length === 0) return pool[0] || null;
    return weightedPick(weightedPool, rng)?.event || weightedPool[0].event;
}

function filterExcludedEvents(pool = [], excludeIds = []) {
    const excludeSet = new Set(excludeIds.filter(Boolean));
    if (excludeSet.size === 0) return pool;
    const filtered = pool.filter(event => !excludeSet.has(event.id));
    return filtered.length > 0 ? filtered : pool;
}

function normalizeChapter(chapter) {
    const numericChapter = Number(chapter);
    return Number.isFinite(numericChapter) ? Math.max(1, numericChapter) : 1;
}

export function getCurrentStoryChapter() {
    const mainQuests = Array.isArray(QuestDatabase.main) ? QuestDatabase.main : [];
    let chapter = 1;

    for (const quest of mainQuests) {
        const questChapter = normalizeChapter(quest.chapter);
        const state = questManager.getQuestState(quest.id);
        if (state?.status && state.status !== QuestStatus.LOCKED) {
            chapter = Math.max(chapter, questChapter);
        }
    }

    return chapter;
}

function getEventChapter(options = {}) {
    return options.chapter !== undefined ? normalizeChapter(options.chapter) : getCurrentStoryChapter();
}

function pickEventByIds(eventIds = [], rng = Math.random, zoneType = null, options = {}) {
    const chapter = getEventChapter(options);
    let pool = eventIds
        .map(eventId => EventDatabase.find(event => event.id === eventId))
        .filter(event => isEventEligible(event, zoneType, { ...options, chapter }));

    if (pool.length === 0) return null;
    pool = filterExcludedEvents(pool, options.excludeIds || []);
    return pickWeightedEvent(pool, rng);
}

function getResultEntries(eventObj = {}) {
    const choices = Array.isArray(eventObj.choices) ? eventObj.choices : [];
    return choices.flatMap(choice => {
        const results = [];
        if (Array.isArray(choice.results)) results.push(...choice.results);
        if (Array.isArray(choice.successResults)) results.push(...choice.successResults);
        if (Array.isArray(choice.failResults)) results.push(...choice.failResults);
        if (Array.isArray(choice.randomResults)) {
            for (const option of choice.randomResults) {
                if (Array.isArray(option.results)) results.push(...option.results);
            }
        }
        return results;
    }).filter(Boolean);
}

function isQuestUnlockUseful(questId) {
    if (!questId) return false;
    try {
        return questManager.getQuestState(questId)?.status === QuestStatus.LOCKED;
    } catch (error) {
        return true;
    }
}

function isWorldInteractionUseful(interactionId) {
    if (!interactionId) return false;
    const interaction = getWorldInteraction(interactionId);
    if (!interaction) return true;
    if (interaction.oneTime && worldInteractionManager.hasResolved(interactionId)) {
        return false;
    }
    return true;
}

function isEventRetired(eventObj = {}) {
    const retireFlags = Array.isArray(eventObj.retireWhenFlags) ? eventObj.retireWhenFlags : [];
    if (retireFlags.some(flag => GameManager.getFlag(flag))) return true;

    const retireQuestIds = Array.isArray(eventObj.retireWhenQuestIds) ? eventObj.retireWhenQuestIds : [];
    return retireQuestIds.some(questId => {
        try {
            return questManager.getQuestState(questId)?.status !== QuestStatus.LOCKED;
        } catch (error) {
            return false;
        }
    });
}

function isEventMemoryBlocked(eventObj = {}, options = {}) {
    const policy = getEventRepeatPolicy(eventObj);
    const chapter = getEventChapter(options);

    if (policy === 'one_time' || policy === 'until_resolved') {
        const flag = getEventMemoryFlag(eventObj);
        if (flag && GameManager.getFlag(flag)) return true;
    }

    if (policy === 'chapter_once') {
        const flag = getEventMemoryFlag(eventObj, chapter);
        if (flag && GameManager.getFlag(flag)) return true;
    }

    const cooldownSteps = Number(eventObj.cooldownSteps || 0);
    const currentStep = getCurrentEventStep(options);
    const lastStepFlag = getEventLastStepFlag(eventObj);
    const lastStep = lastStepFlag ? Number(GameManager.getFlag(lastStepFlag)) : NaN;
    if (
        cooldownSteps > 0
        && Number.isFinite(currentStep)
        && Number.isFinite(lastStep)
        && currentStep - lastStep < cooldownSteps
    ) {
        return true;
    }

    return false;
}

function hasMatchingLandmarkTag(eventObj = {}, options = {}) {
    const requiredTags = Array.isArray(eventObj.landmarkTags) ? eventObj.landmarkTags.filter(Boolean) : [];
    const currentTags = Array.isArray(options.landmarkTags) ? options.landmarkTags.filter(Boolean) : [];
    if (requiredTags.length === 0 || currentTags.length === 0) return true;
    return requiredTags.some(tag => currentTags.includes(tag));
}

function isEventEligible(eventObj = {}, zoneType = null, options = {}) {
    if (!eventObj) return false;

    if (isEventRetired(eventObj)) return false;

    if (!isEventAllowedInChapter(eventObj, getEventChapter(options))) return false;

    if (isEventMemoryBlocked(eventObj, options)) return false;

    if (!hasMatchingLandmarkTag(eventObj, options)) return false;

    const zones = Array.isArray(eventObj.zones) ? eventObj.zones : [];
    if (zoneType && zones.length > 0 && !zones.includes(zoneType)) {
        return false;
    }

    const results = getResultEntries(eventObj);
    if (results.length === 0) return true;

    const gatedResults = results.filter(result => {
        return result.type === ResultType.WORLD_INTERACTION || result.type === ResultType.UNLOCK_QUEST;
    });

    if (gatedResults.length === 0) return true;

    const hasUsefulGatedResult = gatedResults.some(result => {
        if (result.type === ResultType.WORLD_INTERACTION) {
            return isWorldInteractionUseful(result.interactionId || result.value);
        }
        if (result.type === ResultType.UNLOCK_QUEST) {
            return isQuestUnlockUseful(result.questId || result.value);
        }
        return true;
    });

    if (hasUsefulGatedResult) return true;

    const hasNonGatedResult = results.some(result => {
        return result.type !== ResultType.WORLD_INTERACTION && result.type !== ResultType.UNLOCK_QUEST;
    });

    return hasNonGatedResult;
}

export function getEventForZone(zoneType, rng = Math.random, options = {}) {
    if (!zoneType) zoneType = 'low';
    const chapter = getEventChapter(options);

    // Define preferred event type weights per zone (sums roughly to 1)
    const zoneWeights = {
        low: [
            { type: EventType.BLESSING, weight: 0.38 },
            { type: EventType.CURSE, weight: 0.08 },
            { type: EventType.GAMBLE, weight: 0.08 },
            { type: EventType.TRADE, weight: 0.18 },
            { type: EventType.MYSTERY, weight: 0.12 },
            { type: EventType.ENCOUNTER, weight: 0.16 }
        ],
        medium: [
            { type: EventType.BLESSING, weight: 0.25 },
            { type: EventType.CURSE, weight: 0.13 },
            { type: EventType.GAMBLE, weight: 0.12 },
            { type: EventType.TRADE, weight: 0.18 },
            { type: EventType.MYSTERY, weight: 0.18 },
            { type: EventType.ENCOUNTER, weight: 0.14 }
        ],
        high: [
            { type: EventType.BLESSING, weight: 0.25 },
            { type: EventType.CURSE, weight: 0.2 },
            { type: EventType.GAMBLE, weight: 0.15 },
            { type: EventType.TRADE, weight: 0.1 },
            { type: EventType.MYSTERY, weight: 0.15 },
            { type: EventType.ENCOUNTER, weight: 0.15 }
        ],
        death: [
            { type: EventType.BLESSING, weight: 0.12 },
            { type: EventType.CURSE, weight: 0.24 },
            { type: EventType.GAMBLE, weight: 0.16 },
            { type: EventType.TRADE, weight: 0.08 },
            { type: EventType.MYSTERY, weight: 0.22 },
            { type: EventType.ENCOUNTER, weight: 0.18 }
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
    let pool = EventDatabase.filter(e => e.type === targetType && isEventEligible(e, zoneType, { ...options, chapter }));
    pool = filterExcludedEvents(pool, options.excludeIds || []);
    if (pool.length === 0) {
        // fallback: any event
        let fallbackPool = EventDatabase.filter(event => isEventEligible(event, zoneType, { ...options, chapter }));
        fallbackPool = filterExcludedEvents(fallbackPool, options.excludeIds || []);
        if (fallbackPool.length === 0) return null;
        return pickWeightedEvent(fallbackPool, rng);
    }

    return pickWeightedEvent(pool, rng);
}

export function getMapQuestionEventForZone(zoneType = 'low', rng = Math.random, options = {}) {
    const eventIds = MAP_QUESTION_EVENT_IDS_BY_ZONE[zoneType] || MAP_QUESTION_EVENT_IDS_BY_ZONE.low;
    const discoveryEvent = pickEventByIds(eventIds, rng, zoneType, options);
    if (discoveryEvent && rng() < 0.55) return discoveryEvent;
    return getEventForZone(zoneType, rng, options) || discoveryEvent;
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
        case 'forge_material': {
            return new Item(`enhance_stone_${timestamp}`, '強化石', ItemType.MATERIAL, ItemRarity.RARE, '🪨', '可用於強化或任務的材料。', 150);
        }
        case 'material_medium': {
            return new Item(`event_material_${timestamp}`, '可用金屬碎片', ItemType.MATERIAL, ItemRarity.UNCOMMON, '⛏️', '野外撿到的金屬碎片，尺寸尷尬，但鐵匠會說它很有潛力。', 45);
        }
        case 'material_low': {
            return new Item(`event_scrap_${timestamp}`, '雜色材料包', ItemType.MATERIAL, ItemRarity.COMMON, '📦', '一小包可用材料，品質普通，但總比空手回家強。', 25);
        }
        case 'random':
        default: {
            const items = [
                new Consumable(`event_potion_${timestamp}`, '神秘藥水', ItemType.POTION, ItemRarity.RARE, '🧪', '來自異世界的神秘藥水', 100, { hp: 120 }),
                new Item(`event_crystal_${timestamp}`, '星輝水晶', ItemType.MATERIAL, ItemRarity.EPIC, '💎', '蘊含星輝能量的水晶', 200)
            ];
            return items[Math.floor(Math.random() * items.length)];
        }
    }
}

function markEventResolved(eventObj = {}, context = {}) {
    const policy = getEventRepeatPolicy(eventObj);
    const chapter = getEventChapter(context);
    const resultEntries = Array.isArray(context.results) ? context.results : [];
    const hasMeaningfulResult = Boolean(context.choice?.markEventResolved) || resultEntries.length > 0;

    if (policy !== 'repeatable' && hasMeaningfulResult) {
        const memoryFlag = policy === 'chapter_once'
            ? getEventMemoryFlag(eventObj, chapter)
            : getEventMemoryFlag(eventObj);
        if (memoryFlag) GameManager.setFlag(memoryFlag, true);
    }

    const cooldownSteps = Number(eventObj.cooldownSteps || 0);
    const currentStep = getCurrentEventStep(context);
    const lastStepFlag = getEventLastStepFlag(eventObj);
    if (cooldownSteps > 0 && Number.isFinite(currentStep) && lastStepFlag) {
        if (!GameManager.state.flags || typeof GameManager.state.flags !== 'object') {
            GameManager.state.flags = {};
        }
        GameManager.state.flags[lastStepFlag] = currentStep;
    }

    if ((policy !== 'repeatable' && hasMeaningfulResult) || cooldownSteps > 0) {
        GameManager.markSaveDirty?.('event-memory');
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

    markEventResolved(eventObj, {
        ...(eventObj._eventContext || {}),
        choice,
        results,
        stepCount: eventObj.stepCount ?? eventObj._eventContext?.stepCount
    });

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
        case ResultType.UNLOCK_QUEST: {
            const questId = result.questId || result.value;
            if (!questId) return result.message;

            const before = questManager.getQuestState(questId);
            questManager.unlockQuest(questId);
            const after = questManager.getQuestState(questId);
            const quest = getQuestById(questId);

            if (result.message) return result.message;
            if (before.status === QuestStatus.LOCKED && after.status !== QuestStatus.LOCKED && quest) {
                return `新的委託紀錄已寫入：${quest.name}`;
            }
            return quest ? `已記錄委託紀錄：${quest.name}` : null;
        }
        case ResultType.WORLD_INTERACTION: {
            const interactionId = result.interactionId || result.value;
            const outcome = worldInteractionManager.trigger(interactionId, {
                source: 'event',
                toast: result.toast
            });

            if (result.message) return result.message;
            return outcome.messages?.join(' ') || null;
        }
        default:
            return result.message;
    }
}

export default {
    getEventForZone,
    getMapQuestionEventForZone
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

    getRecentEventIds(limit = 2) {
        return this.eventHistory
            .slice(-limit)
            .map(entry => entry?.event?.id)
            .filter(Boolean);
    }

    /**
     * 觸發隨機事件
     * @param {string} zone - 當前區域
     * @returns {Object|null} 事件物件
     */
    triggerRandomEvent(zone = 'low', options = {}) {
        const event = getEventForZone(zone, Math.random, {
            ...options,
            excludeIds: options.excludeIds || this.getRecentEventIds(2)
        });
        if (!event) return null;

        this.currentEvent = { ...event, zone, stepCount: options.stepCount, _eventContext: { ...options, zone } };
        return this.currentEvent;
    }

    triggerMapQuestionEvent(zone = 'low', options = {}) {
        const event = getMapQuestionEventForZone(zone, Math.random, {
            ...options,
            excludeIds: options.excludeIds || this.getRecentEventIds(2)
        });
        if (!event) return null;

        this.currentEvent = { ...event, zone, stepCount: options.stepCount, _eventContext: { ...options, zone } };
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
