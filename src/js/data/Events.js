import { EventDatabase } from './EventCatalog.js';
import { weightedPick } from '../utils/WeightedPick.js';

export { EventDatabase } from './EventCatalog.js';

export const EventType = Object.freeze({
    BLESSING: 'blessing',
    CURSE: 'curse',
    GAMBLE: 'gamble',
    TRADE: 'trade',
    MYSTERY: 'mystery',
    ENCOUNTER: 'encounter'
});

export const EventRole = Object.freeze({
    RESOURCE: 'resource',
    RISK_REWARD: 'risk_reward',
    TRADE: 'trade',
    STORY_SEED: 'story_seed',
    SIDE_STORY: 'side_story',
    WORLD_LORE: 'world_lore',
    PRESSURE: 'pressure'
});

export const ResultType = Object.freeze({
    GOLD: 'gold',
    HEAL: 'heal',
    DAMAGE: 'damage',
    ITEM: 'item',
    BUFF: 'buff',
    DEBUFF: 'debuff',
    STAT: 'stat',
    EXP: 'exp',
    UNLOCK_QUEST: 'unlock_quest',
    WORLD_INTERACTION: 'world_interaction'
});

const ZoneEventTypes = Object.freeze({
    low: Object.freeze(Object.values(EventType)),
    medium: Object.freeze(Object.values(EventType)),
    high: Object.freeze(Object.values(EventType)),
    death: Object.freeze(Object.values(EventType)),
    boss: Object.freeze([
        EventType.BLESSING,
        EventType.CURSE,
        EventType.MYSTERY,
        EventType.ENCOUNTER
    ])
});

const ZoneEventTypeWeights = Object.freeze({
    low: Object.freeze({
        [EventType.BLESSING]: 0.38,
        [EventType.CURSE]: 0.08,
        [EventType.GAMBLE]: 0.08,
        [EventType.TRADE]: 0.18,
        [EventType.MYSTERY]: 0.12,
        [EventType.ENCOUNTER]: 0.16
    }),
    medium: Object.freeze({
        [EventType.BLESSING]: 0.25,
        [EventType.CURSE]: 0.13,
        [EventType.GAMBLE]: 0.12,
        [EventType.TRADE]: 0.18,
        [EventType.MYSTERY]: 0.18,
        [EventType.ENCOUNTER]: 0.14
    }),
    high: Object.freeze({
        [EventType.BLESSING]: 0.25,
        [EventType.CURSE]: 0.2,
        [EventType.GAMBLE]: 0.15,
        [EventType.TRADE]: 0.1,
        [EventType.MYSTERY]: 0.15,
        [EventType.ENCOUNTER]: 0.15
    }),
    death: Object.freeze({
        [EventType.BLESSING]: 0.12,
        [EventType.CURSE]: 0.24,
        [EventType.GAMBLE]: 0.16,
        [EventType.TRADE]: 0.08,
        [EventType.MYSTERY]: 0.22,
        [EventType.ENCOUNTER]: 0.18
    }),
    boss: Object.freeze({
        [EventType.BLESSING]: 0.35,
        [EventType.CURSE]: 0.25,
        [EventType.MYSTERY]: 0.2,
        [EventType.ENCOUNTER]: 0.2
    })
});

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

function isEventAllowedInLocation(event = {}, options = {}) {
    const requiredIds = Array.isArray(event.landmarkIds) ? uniqueStrings(event.landmarkIds) : [];
    const contextIds = getContextLandmarkIds(options);
    if (requiredIds.length > 0 && !requiredIds.some(id => contextIds.includes(id))) return false;

    const requiredTags = Array.isArray(event.landmarkTags) ? uniqueStrings(event.landmarkTags) : [];
    const contextTags = Array.isArray(options.landmarkTags) ? uniqueStrings(options.landmarkTags) : [];
    return requiredTags.length === 0 || requiredTags.some(tag => contextTags.includes(tag));
}

function filterExcludedEvents(events, excludeIds = []) {
    const excluded = new Set(uniqueStrings(excludeIds));
    if (excluded.size === 0) return events;
    const filtered = events.filter(event => !excluded.has(event.id));
    return filtered.length > 0 ? filtered : events;
}

function preferUnrepeatedRoles(events, recentRoles = []) {
    const roles = uniqueStrings(recentRoles);
    if (roles.length === 0 || events.length < 2) return events;

    const recentRoleSet = new Set(roles);
    const fresh = events.filter(event => event.eventRole && !recentRoleSet.has(event.eventRole));
    if (fresh.length > 0) return fresh;

    const latestRole = roles[roles.length - 1];
    const alternatives = events.filter(event => event.eventRole && event.eventRole !== latestRole);
    return alternatives.length > 0 ? alternatives : events;
}

function getLocationWeight(event, options = {}) {
    const requiredIds = Array.isArray(event.landmarkIds) ? uniqueStrings(event.landmarkIds) : [];
    if (requiredIds.length === 0) return 1;
    const contextIds = getContextLandmarkIds(options);
    return requiredIds.some(id => contextIds.includes(id))
        ? Math.max(1, Number(event.locationWeightBoost) || 1.4)
        : 1;
}

export function getEventChapterRange(event = {}) {
    const range = Array.isArray(event.chapterRange)
        ? event.chapterRange
        : [event.minChapter, event.maxChapter];
    const min = Number(range[0] ?? event.minChapter ?? 1);
    const max = Number(range[1] ?? event.maxChapter ?? 3);
    return {
        min: Number.isFinite(min) ? min : 1,
        max: Number.isFinite(max) ? max : 3
    };
}

export function isEventAllowedInChapter(event = {}, chapter = 1) {
    const numericChapter = Number(chapter);
    const activeChapter = Number.isFinite(numericChapter) ? numericChapter : 1;
    const { min, max } = getEventChapterRange(event);
    return activeChapter >= min && activeChapter <= max;
}

export function getEventsForZone(zone, options = {}) {
    const allowedTypes = ZoneEventTypes[zone] || ZoneEventTypes.low;
    return EventDatabase.filter(event => {
        const zones = Array.isArray(event.zones) ? event.zones : [];
        return allowedTypes.includes(event.type)
            && (options.chapter === undefined || isEventAllowedInChapter(event, options.chapter))
            && isEventAllowedInLocation(event, options)
            && (zones.length === 0 || zones.includes(zone));
    });
}

export function getRandomEvent(zone, options = {}) {
    const events = getEventsForZone(zone, options);
    return events.length > 0 ? events[Math.floor(Math.random() * events.length)] : null;
}

export function getEventForZone(zone = 'low', rng = Math.random, options = {}) {
    const eligible = getEventsForZone(zone, options);
    const available = filterExcludedEvents(eligible, options.excludeIds);
    const candidates = preferUnrepeatedRoles(available, options.recentRoles);
    if (candidates.length === 0) return null;

    const typeWeights = ZoneEventTypeWeights[zone] || ZoneEventTypeWeights.low;
    const weighted = candidates.map(event => ({
        event,
        weight: Math.max(0, Number(event.weight) || 1)
            * (typeWeights[event.type] || 0.05)
            * getLocationWeight(event, options)
    }));

    return weightedPick(weighted, rng)?.event || candidates[0];
}
