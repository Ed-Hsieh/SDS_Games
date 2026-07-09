/**
 * TownStateResolver.js
 * Runtime visibility rules for the rebuilt town.
 *
 * TownPlaces.js describes every possible place, resident, action, and state.
 * This resolver decides which of those entries belong in the current town view.
 */

import GameManager from './GameManager.js';
import { questManager, QuestStatus } from './QuestManager.js';
import { getTownPlace, getTownPlaces } from '../data/TownPlaces.js';

export const TownVisibility = Object.freeze({
    VISIBLE: 'visible',
    LOCKED: 'locked',
    HIDDEN: 'hidden'
});

export const TownRuntimeStage = Object.freeze({
    CHAPTER_1_INITIAL: 'chapter_1_initial',
    CHAPTER_1_RECOVERY: 'chapter_1_recovery',
    SHADOW_SOURCES: 'shadow_sources',
    SPECIALIZED_TOWN: 'specialized_town'
});

const TownRules = Object.freeze({
    places: {
        crossroads: {
            visible: true,
            stage: TownRuntimeStage.CHAPTER_1_INITIAL,
            note: '第一章起點：村長、公告板與主線回報。'
        },
        gate: {
            visible: true,
            stage: TownRuntimeStage.CHAPTER_1_INITIAL,
            note: '第一章出城口：冒險地圖與南門防線。'
        },
        handbook: {
            visible: true,
            stage: TownRuntimeStage.CHAPTER_1_INITIAL,
            note: '第一章情報入口：書記、百科與成就。'
        },
        market: {
            visibleWhen: [{ anyFlags: ['town.apothecary.problem_named', 'town.supply.route_problem_named', 'town.supply.first_route_open', 'town.apothecary.stock_basic_potion'] }],
            stage: TownRuntimeStage.CHAPTER_1_RECOVERY,
            hiddenReason: '市集要等藥棚、補給線或基礎庫存被故事提起後再回到城鎮畫面。'
        },
        forge: {
            visibleWhen: [{ anyFlags: ['town.forge.problem_named', 'town.blacksmith.forge_open', 'town.mine.route_problem_named'] }],
            stage: TownRuntimeStage.CHAPTER_1_RECOVERY,
            hiddenReason: '冷爐要等裝備壓力與斷鉤問題被故事提起後再回到城鎮畫面。'
        },
        alley: {
            visibleWhen: [{ anyFlags: ['secretShopUnlocked', 'town.black_market.contact_open', 'town.black_market.rules_explained'] }],
            stage: TownRuntimeStage.SHADOW_SOURCES,
            hiddenReason: '黑市需要古幣、債務或暗巷線索才會進入城鎮地圖。'
        },
        casino: {
            visibleWhen: [{ anyFlags: ['town.casino.showcase_seen', 'town.casino.owner_route_seeded', 'town.casino.false_odds_exposed'] }],
            stage: TownRuntimeStage.SHADOW_SOURCES,
            hiddenReason: '賭場尚未進入第一章初始循環。'
        },
        tower: {
            visibleWhen: [{ anyFlags: ['foundTowerGlyphMemory', 'tower.unsealed', 'town.scholar.last_index_bound'] }],
            stage: TownRuntimeStage.SPECIALIZED_TOWN,
            hiddenReason: '塔目前是暫緩內容，未被線索觸發前不佔大廳空間。'
        }
    },
    residents: {
        'crossroads:town_scholar': {
            visible: false,
            hiddenReason: '書記固定待在手札書桌，避免同一位 NPC 在第一章初始城鎮中跨地點漂移。'
        },
        village_elder: { visible: true },
        town_scholar: { visible: true },
        blacksmith: {
            visibleWhen: [{ anyFlags: ['town.forge.problem_named', 'town.blacksmith.forge_open'] }]
        },
        standard_bearer_frey: {
            visibleWhen: [{ anyFlags: ['town.gate.defense_problem_named', 'town.south_gate.guard_route_ready'] }]
        },
        herbalist: {
            visibleWhen: [{ anyFlags: ['town.apothecary.problem_named', 'town.apothecary.stock_basic_potion'] }]
        },
        merchant: {
            visibleWhen: [{ anyFlags: ['town.supply.route_problem_named', 'town.supply.first_route_open', 'market.rumor.material_index'] }],
            hiddenReason: '商人等補給線問題浮上檯面後再回到市集。'
        },
        tinker: {
            visibleWhen: [{ anyFlags: ['town.tinker.repair_logic_named', 'market.tinker.repair_stock'] }],
            hiddenReason: '修補匠等修補規則被提起後再出現。'
        },
        supply_captain: {
            visibleWhen: [{ anyFlags: ['town.supply.route_problem_named', 'town.supply.first_route_open'] }],
            hiddenReason: '補給隊長等補給線被標記後回到南門。'
        },
        lamplighter_tavi: {
            visibleWhen: [{ anyFlags: ['town.south_gate.guard_route_ready', 'town.lamplighter.glimmer_route_named'] }],
            hiddenReason: '點燈人等南門巡守穩定後進入城鎮。'
        },
        old_miner_bran: {
            visibleWhen: [{ anyFlags: ['town.mine.route_problem_named', 'town.blacksmith.mithril_route_ready'] }],
            hiddenReason: '老礦工等礦路問題被提起後才待在冷爐旁。'
        },
        rumor_broker: {
            visibleWhen: [{ anyFlags: ['market.rumor.material_index', 'town.rumor.elite_warning_open'] }],
            hiddenReason: '情報販子等情報網開始運作後再進手札書桌。'
        },
        street_beggar: {
            visibleWhen: [{ anyFlags: ['secretShopUnlocked', 'town.black_market.contact_open'] }]
        },
        black_market: {
            visibleWhen: [{ anyFlags: ['secretShopUnlocked', 'town.black_market.rules_explained'] }]
        },
        casino_dealer: {
            visibleWhen: [{ anyFlags: ['town.casino.showcase_seen', 'town.casino.owner_route_seeded'] }]
        },
        accountant_marlo: {
            visibleWhen: [{ anyFlags: ['town.casino.false_odds_exposed', 'town.casino.relief_fund_counted'] }]
        },
        casino_owner: {
            visibleWhen: [{ anyFlags: ['town.casino.owner_route_seeded', 'town.casino.dark_contract_sealed'] }]
        },
        tower_warden: {
            visibleWhen: [{ anyFlags: ['foundTowerGlyphMemory', 'tower.unsealed'] }]
        }
    },
    actions: {
        merchant_ancient_coin: {
            visibleWhen: [{ anyFlags: ['secretShopUnlocked', 'merchantAncientCoinAccepted', 'town.black_market.contact_open'] }]
        }
    }
});

function hasFlag(flag) {
    return Boolean(flag && GameManager.getFlag?.(flag));
}

function getQuestStatus(questId) {
    return questManager.getQuestState?.(questId)?.status || QuestStatus.LOCKED;
}

function isQuestAtLeast(questId, statuses = []) {
    return statuses.includes(getQuestStatus(questId));
}

function checkCondition(condition = {}) {
    if (condition.flag) return hasFlag(condition.flag) === (condition.value ?? true);
    if (condition.notFlag) return !hasFlag(condition.notFlag);
    if (Array.isArray(condition.anyFlags)) return condition.anyFlags.some(hasFlag);
    if (Array.isArray(condition.allFlags)) return condition.allFlags.every(hasFlag);
    if (condition.questId && Array.isArray(condition.statuses)) {
        return isQuestAtLeast(condition.questId, condition.statuses);
    }
    if (condition.questFinished) {
        return isQuestAtLeast(condition.questFinished, [QuestStatus.FINISHED]);
    }
    if (condition.questStarted) {
        return isQuestAtLeast(condition.questStarted, [QuestStatus.ACTIVE, QuestStatus.COMPLETED, QuestStatus.FINISHED]);
    }
    if (condition.minLevel) {
        return Number(GameManager.getCharacter?.()?.level || 1) >= Number(condition.minLevel);
    }
    return true;
}

function passesRule(rule = {}) {
    if (rule.visible === true) return true;
    const conditions = rule.visibleWhen || rule.when || [];
    if (!Array.isArray(conditions) || conditions.length === 0) return false;
    return conditions.some(checkCondition);
}

function resolveVisibility(rule = {}) {
    return passesRule(rule) ? TownVisibility.VISIBLE : (rule.locked ? TownVisibility.LOCKED : TownVisibility.HIDDEN);
}

function cloneEntry(entry) {
    return { ...entry };
}

function resolveEntry(entry = {}, ruleMap = {}, placeId = '') {
    const scopedKey = placeId && entry.npcId ? `${placeId}:${entry.npcId}` : '';
    const scopedActionKey = placeId && entry.id ? `${placeId}:${entry.id}` : '';
    const rule = ruleMap[scopedKey] || ruleMap[scopedActionKey] || ruleMap[entry.npcId || entry.id] || {};
    const visibility = resolveVisibility(rule.visible === undefined && !rule.visibleWhen ? { visible: true } : rule);
    return {
        entry: {
            ...cloneEntry(entry),
            runtimeVisibility: visibility,
            hiddenReason: rule.hiddenReason || '',
            unlockHint: rule.unlockHint || ''
        },
        visibility
    };
}

export function resolveTownPlace(place, options = {}) {
    if (!place) return null;

    const rule = TownRules.places[place.id] || { visible: true };
    const visibility = resolveVisibility(rule);
    if (visibility === TownVisibility.HIDDEN && !options.includeHidden) return null;

    const residents = (place.residents || [])
        .map(resident => resolveEntry(resident, TownRules.residents, place.id))
        .filter(result => options.includeHidden || result.visibility !== TownVisibility.HIDDEN)
        .map(result => result.entry);

    const actions = (place.actions || [])
        .map(action => resolveEntry(action, TownRules.actions, place.id))
        .filter(result => options.includeHidden || result.visibility !== TownVisibility.HIDDEN)
        .map(result => result.entry);

    return {
        ...place,
        residents,
        actions,
        runtimeVisibility: visibility,
        runtimeStage: rule.stage || TownRuntimeStage.CHAPTER_1_INITIAL,
        runtimeNote: rule.note || '',
        hiddenReason: rule.hiddenReason || ''
    };
}

export function getResolvedTownPlaces(options = {}) {
    return getTownPlaces()
        .map(place => resolveTownPlace(place, options))
        .filter(Boolean);
}

export function getResolvedTownPlace(placeId, options = {}) {
    return resolveTownPlace(getTownPlace(placeId), options);
}

export function getTownRuntimeSummary() {
    const allPlaces = getResolvedTownPlaces({ includeHidden: true });
    const visiblePlaces = allPlaces.filter(place => place.runtimeVisibility === TownVisibility.VISIBLE);
    const hiddenPlaces = allPlaces.filter(place => place.runtimeVisibility === TownVisibility.HIDDEN);
    const visibleResidents = visiblePlaces.flatMap(place => (place.residents || [])
        .filter(resident => resident.runtimeVisibility === TownVisibility.VISIBLE)
        .map(resident => ({ ...resident, placeId: place.id, placeName: place.name })));
    const hiddenResidents = allPlaces.flatMap(place => (place.residents || [])
        .filter(resident => resident.runtimeVisibility === TownVisibility.HIDDEN)
        .map(resident => ({ ...resident, placeId: place.id, placeName: place.name })));

    return {
        stage: visiblePlaces.some(place => place.runtimeStage === TownRuntimeStage.SHADOW_SOURCES)
            ? TownRuntimeStage.SHADOW_SOURCES
            : TownRuntimeStage.CHAPTER_1_INITIAL,
        visiblePlaces,
        hiddenPlaces,
        visibleResidents,
        hiddenResidents
    };
}

export function getTownRules() {
    return TownRules;
}
