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
import { getWorldEventReflectionByRole } from '../data/CharacterProfiles.js';

const MAP_QUESTION_EVENT_IDS_BY_ZONE = {
    low: [
        'field_notice_board',
        'south_gate_patrol_marks',
        'hunter_tripwire_cache',
        'silver_thread_pattern',
        'snare_salvage_pouch',
        'muddy_supply_cart',
        'foragers_emergency_stash',
        'abandoned_blueprint_cache'
    ],
    medium: [
        'weathered_route_tablet',
        'drowned_lantern_line',
        'thorn_toll_roots',
        'muddy_supply_cart',
        'silver_thread_pattern',
        'snare_salvage_pouch',
        'injured_adventurer',
        'abandoned_blueprint_cache',
        'special_bounty_notice'
    ],
    high: [
        'weathered_route_tablet',
        'ancient_guardian',
        'leyline_splinter',
        'obsidian_deserter_map',
        'thorn_toll_roots',
        'drowned_lantern_line',
        'special_bounty_notice'
    ],
    death: [
        'ash_scout_report',
        'dragon_heat_haze',
        'refugee_cart_repair',
        'dimensional_rift',
        'last_campfire_before_north',
        'weathered_route_tablet'
    ],
    boss: [
        'dragon_heat_haze',
        'dimensional_rift',
        'last_campfire_before_north',
        'weathered_route_tablet'
    ]
};

const EVENT_MEMORY_FLAG_PREFIX = 'event.memory.';
const EVENT_LAST_STEP_FLAG_PREFIX = 'event.lastStep.';
const WORLD_EVENT_JOURNAL_LIMIT = 24;

const EVENT_ROLE_LABELS = {
    [EventRole.RESOURCE]: '補給發現',
    [EventRole.RISK_REWARD]: '風險抉擇',
    [EventRole.TRADE]: '旅途交易',
    [EventRole.STORY_SEED]: '故事種子',
    [EventRole.SIDE_STORY]: '支線聽聞',
    [EventRole.WORLD_LORE]: '世界見聞',
    [EventRole.PRESSURE]: '章節壓力'
};

const EVENT_REWARD_ROLE_MULTIPLIERS = {
    [EventRole.RESOURCE]: 0.95,
    [EventRole.RISK_REWARD]: 1.12,
    [EventRole.TRADE]: 1,
    [EventRole.STORY_SEED]: 0.78,
    [EventRole.SIDE_STORY]: 0.86,
    [EventRole.WORLD_LORE]: 0.82,
    [EventRole.PRESSURE]: 1.18
};

const EVENT_REWARD_CHAPTER_MULTIPLIERS = {
    1: 0.86,
    2: 1,
    3: 1.15
};

const EVENT_REWARD_ZONE_MULTIPLIERS = {
    low: 0.86,
    medium: 1,
    high: 1.1,
    death: 1.22,
    boss: 1.22
};

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

function getWorldEventJournalState() {
    if (!GameManager.state.ui || typeof GameManager.state.ui !== 'object') {
        GameManager.state.ui = {};
    }

    if (!Array.isArray(GameManager.state.ui.worldEventJournal)) {
        GameManager.state.ui.worldEventJournal = [];
    }

    return GameManager.state.ui.worldEventJournal;
}

export function getWorldEventJournalRecords() {
    return getWorldEventJournalState().slice();
}

function getEventRoleLabel(eventRole) {
    return EVENT_ROLE_LABELS[eventRole] || '旅途事件';
}

function getEventZoneLabel(zoneId) {
    const labels = {
        low: '低威脅區',
        medium: '中威脅區',
        high: '高威脅區',
        death: '死亡區',
        boss: '首領邊境'
    };
    return labels[zoneId] || zoneId || '未知地帶';
}

function summarizeEventResults(results = [], messages = []) {
    const typed = results.map(result => {
        switch (result?.type) {
            case ResultType.GOLD:
                return Number(result.value) > 0 ? `金幣 +${result.value}` : '';
            case ResultType.HEAL:
                return result.isPercent ? `恢復 ${Math.round(Number(result.value || 0) * 100)}%` : `恢復 ${result.value || 0}`;
            case ResultType.DAMAGE:
                return `受傷 ${result.value || 0}`;
            case ResultType.ITEM:
                return '取得物資';
            case ResultType.BUFF:
                return '短暫強化';
            case ResultType.DEBUFF:
                return '承受負面狀態';
            case ResultType.EXP:
                return `經驗 +${result.value || 0}`;
            case ResultType.UNLOCK_QUEST:
                return '新增委託';
            case ResultType.WORLD_INTERACTION:
                return '新增聽聞';
            default:
                return '';
        }
    }).filter(Boolean);

    return [...new Set(typed)].slice(0, 4).join('、') || messages.filter(Boolean).slice(0, 2).join('、') || '沒有明顯變化';
}

function getEventReflection(eventObj = {}, choice = {}, results = []) {
    if ((results || []).some(result => result?.type === ResultType.WORLD_INTERACTION || result?.type === ResultType.UNLOCK_QUEST)) {
        return '這不是單純的事件結果，它把新的委託、聽聞或世界變化推進了一格。';
    }

    const voicedReflection = getWorldEventReflectionByRole(eventObj.eventRole, `${eventObj.id}:${choice.text || ''}`);
    if (voicedReflection) return voicedReflection;

    switch (eventObj.eventRole) {
        case EventRole.RESOURCE:
            return '這類事件會補充續航，適合在深入地圖前判斷自己是否還能繼續走。';
        case EventRole.RISK_REWARD:
            return '收益與代價都很明顯，之後遇到類似情況時可以拿這次選擇當參考。';
        case EventRole.TRADE:
            return '旅途交易讓金幣不只是存款，也能換成情報、補給或臨時戰力。';
        case EventRole.WORLD_LORE:
            return '這段紀錄讓地脈、地點與章節災害多了一塊可以對照的碎片。';
        case EventRole.PRESSURE:
            return '附近的世界壓力正在升高，繼續深入前最好先確認裝備與藥水。';
        default:
            return choice.intent || '這段經歷已被整理成旅途筆記，之後可以回來對照。';
    }
}

function recordWorldEventJournal(eventObj = {}, choice = {}, results = [], messages = [], context = {}) {
    if (!eventObj?.id) return;

    const journal = getWorldEventJournalState();
    const zone = context.zone || eventObj.zone || eventObj._eventContext?.zone || '';
    const entry = {
        key: `${eventObj.id}:${Date.now()}`,
        eventId: eventObj.id,
        title: eventObj.name || '旅途事件',
        icon: eventObj.icon || '✦',
        role: eventObj.eventRole || EventRole.RESOURCE,
        roleLabel: getEventRoleLabel(eventObj.eventRole),
        zone,
        zoneLabel: getEventZoneLabel(zone),
        choiceText: choice.text || '沒有記下選擇',
        intent: choice.intent || '',
        description: eventObj.description || '',
        resultSummary: summarizeEventResults(results, messages),
        resultMessages: messages.filter(Boolean).slice(0, 4),
        reflection: getEventReflection(eventObj, choice, results),
        timestamp: Date.now()
    };

    const last = journal[0];
    if (last?.eventId === entry.eventId && last?.choiceText === entry.choiceText) {
        journal[0] = {
            ...last,
            ...entry,
            key: last.key,
            count: Number(last.count || 1) + 1
        };
    } else {
        journal.unshift(entry);
    }

    if (journal.length > WORLD_EVENT_JOURNAL_LIMIT) {
        journal.splice(WORLD_EVENT_JOURNAL_LIMIT);
    }

    GameManager.markSaveDirty?.('world-event-journal');
    GameManager.notify?.('world-event-journal');
}

function getCurrentEventStep(options = {}) {
    const rawStep = options.stepCount ?? GameManager.getFlag('map.travelStep');
    const step = Number(rawStep);
    return Number.isFinite(step) ? step : null;
}

function uniqueStrings(values = []) {
    return [...new Set(values.map(value => String(value || '').trim()).filter(Boolean))];
}

function getContextLandmarkIds(options = {}) {
    return uniqueStrings([
        options.landmarkId,
        options.currentLandmarkId,
        options.nearestLandmarkId,
        ...(Array.isArray(options.nearbyLandmarkIds) ? options.nearbyLandmarkIds : [])
    ]);
}

function hasAnyMatch(required = [], current = []) {
    if (required.length === 0) return true;
    if (current.length === 0) return false;
    return required.some(value => current.includes(value));
}

function getLocationWeightMultiplier(eventObj = {}, options = {}) {
    const requiredIds = Array.isArray(eventObj.landmarkIds) ? uniqueStrings(eventObj.landmarkIds) : [];
    if (requiredIds.length === 0) return 1;

    const contextIds = getContextLandmarkIds(options);
    if (!hasAnyMatch(requiredIds, contextIds)) return 1;

    const boost = Number(eventObj.locationWeightBoost);
    return Number.isFinite(boost) && boost > 0 ? boost : 1.4;
}

function getRecentRoleWeightMultiplier(eventObj = {}, options = {}) {
    const recentRoles = Array.isArray(options.recentRoles) ? options.recentRoles.filter(Boolean) : [];
    const role = eventObj.eventRole;
    if (!role || recentRoles.length === 0) return 1;

    const lastRole = recentRoles[recentRoles.length - 1];
    if (role === lastRole) return 0.24;

    const recentCount = recentRoles.filter(entry => entry === role).length;
    if (recentCount >= 2) return 0.36;
    if (recentCount === 1) return 0.62;
    return 1;
}

function getRoleDiversePool(pool = [], options = {}) {
    const recentRoles = Array.isArray(options.recentRoles) ? options.recentRoles.filter(Boolean) : [];
    const lastRole = recentRoles[recentRoles.length - 1];
    if (!lastRole || pool.length <= 1) return pool;

    const recentRoleSet = new Set(recentRoles);
    const freshAlternatives = pool.filter(event => event?.eventRole && !recentRoleSet.has(event.eventRole));
    if (freshAlternatives.length > 0) return freshAlternatives;

    const alternatives = pool.filter(event => event?.eventRole && event.eventRole !== lastRole);
    return alternatives.length > 0 ? alternatives : pool;
}

function shouldExpandForRoleDiversity(pool = [], options = {}) {
    const recentRoles = Array.isArray(options.recentRoles) ? options.recentRoles.filter(Boolean) : [];
    if (pool.length === 0 || recentRoles.length === 0) return false;

    const recentRoleSet = new Set(recentRoles);
    return !pool.some(event => event?.eventRole && !recentRoleSet.has(event.eventRole));
}

function pickWeightedEvent(pool = [], rng = Math.random, options = {}) {
    const candidatePool = getRoleDiversePool(pool, options);
    if (candidatePool.length === 0) return null;
    const weightedPool = candidatePool.map(event => {
        const numericWeight = Number(event.weight);
        const baseWeight = Number.isFinite(numericWeight) ? Math.max(0, numericWeight) : 1;
        const weight = baseWeight
            * getLocationWeightMultiplier(event, options)
            * getRecentRoleWeightMultiplier(event, options);
        return { event, weight };
    }).filter(entry => entry.weight > 0);

    if (weightedPool.length === 0) return candidatePool[0] || null;
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

function getEventRewardContext(eventObj = {}, options = {}) {
    const chapter = getEventChapter(options);
    const zone = options.zone || eventObj.zone || eventObj._eventContext?.zone || 'low';
    const role = eventObj.eventRole || EventRole.RESOURCE;
    return { chapter, zone, role };
}

function getEventRewardMultiplier(eventObj = {}, result = {}, options = {}) {
    const { chapter, zone, role } = getEventRewardContext(eventObj, options);
    const roleMultiplier = EVENT_REWARD_ROLE_MULTIPLIERS[role] ?? 1;
    const chapterMultiplier = chapter >= 3
        ? EVENT_REWARD_CHAPTER_MULTIPLIERS[3]
        : EVENT_REWARD_CHAPTER_MULTIPLIERS[chapter] ?? 1;
    const zoneMultiplier = EVENT_REWARD_ZONE_MULTIPLIERS[zone] ?? 1;
    const typeMultiplier = result.type === ResultType.DAMAGE
        ? (chapter <= 1 ? 0.86 : chapter >= 3 ? 1.08 : 1)
        : 1;

    return Math.max(0.6, Math.min(1.45, roleMultiplier * chapterMultiplier * zoneMultiplier * typeMultiplier));
}

function tuneNumericEventValue(value, eventObj = {}, result = {}, options = {}) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) return value;
    const multiplier = getEventRewardMultiplier(eventObj, result, options);
    return Math.max(1, Math.round(numericValue * multiplier));
}

function getEventRewardTier(eventObj = {}, options = {}) {
    const { chapter, zone, role } = getEventRewardContext(eventObj, options);
    if (role === EventRole.PRESSURE || zone === 'death' || zone === 'boss' || chapter >= 3) return 'high';
    if (role === EventRole.STORY_SEED || zone === 'low' || chapter <= 1) return 'low';
    return 'medium';
}

function tuneEventResults(results = [], eventObj = {}, options = {}) {
    return results.map(result => {
        if (!result || typeof result !== 'object') return result;
        const tuned = { ...result };
        if (tuned.type === ResultType.GOLD || tuned.type === ResultType.EXP || tuned.type === ResultType.DAMAGE) {
            tuned.value = tuneNumericEventValue(tuned.value, eventObj, tuned, options);
        }
        if (tuned.type === ResultType.ITEM && !tuned.rewardTier) {
            tuned.rewardTier = getEventRewardTier(eventObj, options);
        }
        return tuned;
    });
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

function adjustEventTypeWeights(candidates = [], zoneType = 'low', chapter = 1) {
    const activeChapter = normalizeChapter(chapter);
    const pressureTypes = new Set([
        EventType.CURSE,
        EventType.GAMBLE,
        EventType.MYSTERY,
        EventType.ENCOUNTER
    ]);
    const chapterMultipliers = activeChapter >= 3
        ? {
            [EventType.BLESSING]: 0.72,
            [EventType.CURSE]: 1.18,
            [EventType.GAMBLE]: 1.08,
            [EventType.TRADE]: 0.88,
            [EventType.MYSTERY]: 1.25,
            [EventType.ENCOUNTER]: 1.18
        }
        : activeChapter >= 2
            ? {
                [EventType.BLESSING]: 0.88,
                [EventType.CURSE]: 1.05,
                [EventType.GAMBLE]: 1.12,
                [EventType.TRADE]: 1.05,
                [EventType.MYSTERY]: 1.18,
                [EventType.ENCOUNTER]: 1
            }
            : {
                [EventType.BLESSING]: 1.04,
                [EventType.CURSE]: 0.74,
                [EventType.GAMBLE]: 0.82,
                [EventType.TRADE]: 1.12,
                [EventType.MYSTERY]: 0.9,
                [EventType.ENCOUNTER]: 0.95
            };
    const zonePressure = zoneType === 'death' || zoneType === 'boss'
        ? 1.16
        : zoneType === 'high'
            ? 1.08
            : zoneType === 'low'
                ? 0.94
                : 1;

    return candidates.map(entry => {
        const baseWeight = Number(entry.weight);
        const multiplier = chapterMultipliers[entry.type] ?? 1;
        const pressureMultiplier = pressureTypes.has(entry.type) ? zonePressure : 1;
        const weight = Math.max(0.01, (Number.isFinite(baseWeight) ? baseWeight : 1) * multiplier * pressureMultiplier);
        return { ...entry, weight };
    });
}

function getMapQuestionDiscoveryChance(zoneType = 'low', chapter = 1) {
    const activeChapter = normalizeChapter(chapter);
    let chance = activeChapter >= 3 ? 0.3 : activeChapter >= 2 ? 0.38 : 0.48;
    if (zoneType === 'low' && activeChapter === 1) chance += 0.04;
    if (zoneType === 'death' || zoneType === 'boss') chance -= 0.06;
    return Math.max(0.24, Math.min(0.52, chance));
}

function pickEventByIds(eventIds = [], rng = Math.random, zoneType = null, options = {}) {
    const chapter = getEventChapter(options);
    let pool = eventIds
        .map(eventId => EventDatabase.find(event => event.id === eventId))
        .filter(event => isEventEligible(event, zoneType, { ...options, chapter }));

    if (pool.length === 0) return null;
    pool = filterExcludedEvents(pool, options.excludeIds || []);
    return pickWeightedEvent(pool, rng, options);
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
    if (requiredTags.length === 0) return true;
    return hasAnyMatch(uniqueStrings(requiredTags), uniqueStrings(currentTags));
}

function hasMatchingLandmarkId(eventObj = {}, options = {}) {
    const requiredIds = Array.isArray(eventObj.landmarkIds) ? uniqueStrings(eventObj.landmarkIds) : [];
    if (requiredIds.length === 0) return true;
    return hasAnyMatch(requiredIds, getContextLandmarkIds(options));
}

function isEventEligible(eventObj = {}, zoneType = null, options = {}) {
    if (!eventObj) return false;

    if (isEventRetired(eventObj)) return false;

    if (!isEventAllowedInChapter(eventObj, getEventChapter(options))) return false;

    if (isEventMemoryBlocked(eventObj, options)) return false;

    if (!hasMatchingLandmarkTag(eventObj, options)) return false;

    if (!hasMatchingLandmarkId(eventObj, options)) return false;

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

    const candidates = adjustEventTypeWeights(zoneWeights[zoneType] || zoneWeights.low, zoneType, chapter);
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
        return pickWeightedEvent(fallbackPool, rng, options);
    }

    if (shouldExpandForRoleDiversity(pool, options)) {
        let diverseFallbackPool = EventDatabase.filter(event => isEventEligible(event, zoneType, { ...options, chapter }));
        diverseFallbackPool = filterExcludedEvents(diverseFallbackPool, options.excludeIds || []);
        const diverseCandidates = getRoleDiversePool(diverseFallbackPool, options);
        if (diverseCandidates.length > 0 && diverseCandidates !== diverseFallbackPool) {
            return pickWeightedEvent(diverseCandidates, rng, options);
        }
    }

    return pickWeightedEvent(pool, rng, options);
}

export function getMapQuestionEventForZone(zoneType = 'low', rng = Math.random, options = {}) {
    const chapter = getEventChapter(options);
    const eventIds = MAP_QUESTION_EVENT_IDS_BY_ZONE[zoneType] || MAP_QUESTION_EVENT_IDS_BY_ZONE.low;
    const discoveryEvent = pickEventByIds(eventIds, rng, zoneType, { ...options, chapter });
    if (discoveryEvent && rng() < getMapQuestionDiscoveryChance(zoneType, chapter)) return discoveryEvent;
    return getEventForZone(zoneType, rng, { ...options, chapter }) || discoveryEvent;
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

function generateCleanEventItem(itemType) {
    const timestamp = Date.now();
    switch (itemType) {
        case 'forge_material':
            return new Item(`enhance_stone_${timestamp}`, '精煉鐵片', ItemType.MATERIAL, ItemRarity.RARE, '🔩', '能用來強化裝備的乾淨鐵片。', 150);
        case 'material_medium':
            return new Item(`event_material_${timestamp}`, '可用零件', ItemType.MATERIAL, ItemRarity.UNCOMMON, '⚙️', '從事件中取得的可用零件，鍛造師應該能處理。', 45);
        case 'material_low':
            return new Item(`event_scrap_${timestamp}`, '破舊材料', ItemType.MATERIAL, ItemRarity.COMMON, '🧱', '雖然破舊，但整理後仍能拿來製作基礎裝備。', 25);
        case 'random':
        default: {
            const items = [
                new Consumable(`event_potion_${timestamp}`, '濃縮生命藥水', ItemType.POTION, ItemRarity.RARE, '🧪', '從奇遇中取得的高效藥水。', 100, { hp: 120 }),
                new Item(`event_crystal_${timestamp}`, '地脈晶片', ItemType.MATERIAL, ItemRarity.EPIC, '💠', '仍殘留地脈回聲的晶片，可作為高階素材。', 200)
            ];
            return items[Math.floor(Math.random() * items.length)];
        }
    }
}

function generateReadableEventItem(itemType, options = {}) {
    const timestamp = Date.now();
    const tier = options.rewardTier || 'medium';
    switch (itemType) {
        case 'forge_material':
            if (tier === 'high') {
                return new Item(`event_refined_steel_${timestamp}`, '精煉地脈鋼片', ItemType.MATERIAL, ItemRarity.EPIC, '🔷', '從高壓地脈旁整理出的鍛造輔材，邊緣有細小藍光。', 260);
            }
            if (tier === 'low') {
                return new Item(`event_rough_steel_${timestamp}`, '粗磨鐵片', ItemType.MATERIAL, ItemRarity.UNCOMMON, '🧩', '品質不算漂亮，但鍛造師看見會先收起來再嫌棄。', 90);
            }
            return new Item(`enhance_stone_${timestamp}`, '打磨用青鋼片', ItemType.MATERIAL, ItemRarity.RARE, '🧩', '流動匠人常用的補強材料，邊緣仍留著細小火星痕。', 150);
        case 'material_medium':
            if (tier === 'high') {
                return new Item(`event_mithril_scrap_${timestamp}`, '壓紋秘銀碎材', ItemType.MATERIAL, ItemRarity.RARE, '⛏️', '裂面上有被壓過的銀色紋路，適合高階圖紙的材料缺口。', 160);
            }
            if (tier === 'low') {
                return new Item(`event_repair_parts_${timestamp}`, '補修零件包', ItemType.MATERIAL, ItemRarity.UNCOMMON, '🧰', '螺釘、扣片與一點不該問來源的金屬邊角。', 55);
            }
            return new Item(`event_material_${timestamp}`, '旅途雜材', ItemType.MATERIAL, ItemRarity.UNCOMMON, '🧰', '從路邊事件中整理出的可用材料，品質普通但很實際。', 45);
        case 'material_low':
            return new Item(`event_scrap_${timestamp}`, '可用碎料', ItemType.MATERIAL, ItemRarity.COMMON, '🔩', '看起來零散，仍能拿去補鍛造材料的缺口。', 25);
        case 'random':
        default: {
            const items = tier === 'high' ? [
                new Consumable(`event_elixir_${timestamp}`, '旅人強效藥水', ItemType.POTION, ItemRarity.EPIC, '🧪', '瓶塞封著蠟印，喝下去前最好先相信自己的胃。', 220, { hp: 220 }),
                new Item(`event_crystal_${timestamp}`, '地脈結晶屑', ItemType.MATERIAL, ItemRarity.EPIC, '🔷', '從不穩定地脈中剝落的小結晶，可作為高階鍛造輔材。', 200)
            ] : [
                new Consumable(`event_potion_${timestamp}`, '旅人急救藥水', ItemType.POTION, ItemRarity.RARE, '🧪', '瓶身有些刮痕，但藥液仍然清澈。', 100, { hp: 120 }),
                new Item(`event_crystal_${timestamp}`, '地脈結晶屑', ItemType.MATERIAL, ItemRarity.EPIC, '🔷', '從不穩定地脈中剝落的小結晶，可作為高階鍛造輔材。', 200)
            ];
            return items[Math.floor(Math.random() * items.length)];
        }
    }
}

function markEventResolved(eventObj = {}, context = {}) {
    const policy = getEventRepeatPolicy(eventObj);
    const chapter = getEventChapter(context);
    const resultEntries = Array.isArray(context.results) ? context.results : [];
    const explicitlyUnresolved = context.choice?.markEventResolved === false;
    const hasMeaningfulResult = !explicitlyUnresolved && (
        Boolean(context.choice?.markEventResolved)
        || policy !== 'repeatable'
        || resultEntries.length > 0
    );

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

function checkAndPayCostClean(char, cost) {
    if (cost.gold) {
        if (GameManager.getGold() < cost.gold) {
            return { success: false, message: `金幣不足，需要 ${cost.gold}G。` };
        }
        GameManager.removeGold(cost.gold);
    }

    if (cost.hp) {
        const hpCost = cost.isPercent ? Math.floor(char.maxHp * cost.hp) : cost.hp;
        if (char.hp <= hpCost) {
            return { success: false, message: '生命太低，不能承擔這個代價。' };
        }
        char.hp -= hpCost;
        return { success: true, message: `支付 ${hpCost} 生命。` };
    }

    if (cost.atk) {
        char.baseAtk = Math.max(1, char.baseAtk - cost.atk);
        return { success: true, message: `攻擊力降低 ${cost.atk}。` };
    }

    return { success: true };
}

export function executeChoice(eventObj, choiceIndex) {
    if (!eventObj) return { success: false, message: 'no event' };
    const choice = eventObj.choices && eventObj.choices[choiceIndex];
    if (!choice) return { success: false, message: 'invalid choice' };

    const char = GameManager.getCharacter();
    const resultMessages = [];

    // cost handling
    if (choice.cost) {
        const costCheck = checkAndPayCostClean(char, choice.cost);
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

    const eventContext = {
        ...(eventObj._eventContext || {}),
        zone: eventObj.zone || eventObj._eventContext?.zone,
        stepCount: eventObj.stepCount ?? eventObj._eventContext?.stepCount
    };
    const tunedResults = tuneEventResults(results, eventObj, eventContext);

    // apply results
    for (const result of tunedResults) {
        const msg = applyResultToCharacter(char, result);
        if (msg) resultMessages.push(msg);
    }

    markEventResolved(eventObj, {
        ...eventContext,
        choice,
        results: tunedResults
    });

    recordWorldEventJournal(eventObj, choice, tunedResults, resultMessages, {
        ...eventContext,
        zone: eventObj.zone
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
            const item = generateReadableEventItem(result.itemType, {
                rewardTier: result.rewardTier
            });
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
        this.offeredEventIds = [];
        this.offeredEventRoles = [];
    }

    getRecentEventIds(limit = 2) {
        const executedIds = this.eventHistory
            .slice(-limit)
            .map(entry => entry?.event?.id)
            .filter(Boolean);
        const offeredIds = this.offeredEventIds.slice(-limit).filter(Boolean);
        return [...new Set([...offeredIds, ...executedIds])].slice(-limit);
    }

    getRecentEventRoles(limit = 3) {
        const executedRoles = this.eventHistory
            .slice(-limit)
            .map(entry => entry?.event?.eventRole)
            .filter(Boolean);
        const offeredRoles = this.offeredEventRoles.slice(-limit).filter(Boolean);
        return [...offeredRoles, ...executedRoles].slice(-limit);
    }

    rememberOfferedEvent(event) {
        if (!event?.id) return;
        this.offeredEventIds.push(event.id);
        if (this.offeredEventIds.length > 12) {
            this.offeredEventIds.splice(0, this.offeredEventIds.length - 12);
        }

        if (event.eventRole) {
            this.offeredEventRoles.push(event.eventRole);
            if (this.offeredEventRoles.length > 12) {
                this.offeredEventRoles.splice(0, this.offeredEventRoles.length - 12);
            }
        }
    }

    /**
     * 觸發隨機事件
     * @param {string} zone - 當前區域
     * @returns {Object|null} 事件物件
     */
    triggerRandomEvent(zone = 'low', options = {}) {
        const event = getEventForZone(zone, Math.random, {
            ...options,
            excludeIds: options.excludeIds || this.getRecentEventIds(2),
            recentRoles: options.recentRoles || this.getRecentEventRoles(3)
        });
        if (!event) return null;

        this.currentEvent = { ...event, zone, stepCount: options.stepCount, _eventContext: { ...options, zone } };
        this.rememberOfferedEvent(this.currentEvent);
        return this.currentEvent;
    }

    triggerMapQuestionEvent(zone = 'low', options = {}) {
        const event = getMapQuestionEventForZone(zone, Math.random, {
            ...options,
            excludeIds: options.excludeIds || this.getRecentEventIds(4),
            recentRoles: options.recentRoles || this.getRecentEventRoles(4)
        });
        if (!event) return null;

        this.currentEvent = { ...event, zone, stepCount: options.stepCount, _eventContext: { ...options, zone } };
        this.rememberOfferedEvent(this.currentEvent);
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
