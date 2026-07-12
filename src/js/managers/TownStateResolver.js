/**
 * TownStateResolver.js
 * Evaluates screenplay-owned visibility for places, residents, actions, and
 * environmental states. Scene completion is the primary progression source.
 */

import GameManager from './GameManager.js';
import { getTownPlace, getTownPlaces } from '../data/TownPlaces.js?v=dialogue-flow-20260712w';
import { getStorySceneCompleteFlag } from '../data/StoryStateContract.js';

export const TownVisibility = Object.freeze({
    VISIBLE: 'visible',
    LOCKED: 'locked',
    HIDDEN: 'hidden'
});

export const TownRuntimeStage = Object.freeze({
    BROKEN_TOWN: 'broken_town',
    RECOVERY_NETWORK: 'recovery_network',
    REGIONAL_PRESSURE: 'regional_pressure',
    ENDGAME: 'endgame'
});

function hasFlag(flag) {
    return Boolean(flag && GameManager.getFlag?.(flag));
}

function getRunNumber() {
    return Math.max(1, Number(GameManager.getFlag?.('story.run')) || 1);
}

function getChapter() {
    return Math.min(7, Math.max(1, Number(GameManager.getFlag?.('story.chapter')) || 1));
}

export function evaluateTownCondition(condition = { always: true }) {
    if (!condition || condition.always === true) return true;
    if (Array.isArray(condition.all)) return condition.all.every(evaluateTownCondition);
    if (Array.isArray(condition.any)) return condition.any.some(evaluateTownCondition);
    if (condition.not) return !evaluateTownCondition(condition.not);
    if (condition.sceneComplete) {
        return hasFlag(getStorySceneCompleteFlag(condition.sceneComplete));
    }
    if (condition.sceneIncomplete) {
        return !hasFlag(getStorySceneCompleteFlag(condition.sceneIncomplete));
    }
    if (condition.flag) {
        const value = GameManager.getFlag?.(condition.flag);
        return Object.prototype.hasOwnProperty.call(condition, 'equals')
            ? value === condition.equals
            : Boolean(value);
    }
    if (condition.run !== undefined) return getRunNumber() === Number(condition.run);
    if (condition.minChapter !== undefined) return getChapter() >= Number(condition.minChapter);
    if (condition.maxChapter !== undefined) return getChapter() <= Number(condition.maxChapter);
    return false;
}

function resolveVisibility(entry = {}) {
    if (evaluateTownCondition(entry.when)) return TownVisibility.VISIBLE;
    return entry.locked ? TownVisibility.LOCKED : TownVisibility.HIDDEN;
}

function resolveEntry(entry = {}, options = {}) {
    const runtimeVisibility = resolveVisibility(entry);
    if (runtimeVisibility === TownVisibility.HIDDEN && !options.includeHidden) return null;
    return {
        ...entry,
        runtimeVisibility
    };
}

function resolveStates(states = [], options = {}) {
    return states
        .map(state => resolveEntry(state, options))
        .filter(Boolean);
}

export function resolveTownPlace(place, options = {}) {
    if (!place) return null;

    const runtimeVisibility = resolveVisibility(place);
    if (runtimeVisibility === TownVisibility.HIDDEN && !options.includeHidden) return null;

    return {
        ...place,
        residents: (place.residents || [])
            .map(resident => resolveEntry(resident, options))
            .filter(Boolean),
        actions: (place.actions || [])
            .map(action => resolveEntry(action, options))
            .filter(Boolean),
        states: resolveStates(place.states || [], options),
        runtimeVisibility,
        runtimeStage: getTownRuntimeStage()
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

export function getTownRuntimeStage() {
    const chapter = getChapter();
    if (chapter <= 1) return TownRuntimeStage.BROKEN_TOWN;
    if (chapter <= 3) return TownRuntimeStage.RECOVERY_NETWORK;
    if (chapter <= 5) return TownRuntimeStage.REGIONAL_PRESSURE;
    return TownRuntimeStage.ENDGAME;
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
        run: getRunNumber(),
        chapter: getChapter(),
        stage: getTownRuntimeStage(),
        visiblePlaces,
        hiddenPlaces,
        visibleResidents,
        hiddenResidents
    };
}

export function getTownRules() {
    return getTownPlaces().map(place => ({
        id: place.id,
        when: place.when,
        residents: (place.residents || []).map(resident => ({ id: resident.npcId, when: resident.when })),
        actions: (place.actions || []).map(action => ({ id: action.id || action.route, when: action.when }))
    }));
}
