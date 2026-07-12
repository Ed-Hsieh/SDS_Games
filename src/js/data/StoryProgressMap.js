/**
 * StoryProgressMap.js
 * Generic event vocabulary for optional world systems. Mainline progression is
 * owned by StorySceneRegistry and must not be reconstructed from quest ids,
 * random kills, or legacy landmark chains.
 */

export const StoryEventTypes = Object.freeze({
    QUEST_UNLOCKED: 'quest_unlocked',
    QUEST_ACCEPTED: 'quest_accepted',
    QUEST_READY: 'quest_ready',
    QUEST_COMPLETED: 'quest_completed',
    WORLD_INTERACTION: 'world_interaction',
    ZONE_EXPLORED: 'zone_explored',
    LANDMARK_VISITED: 'landmark_visited',
    MONSTER_KILL: 'monster_kill',
    DUNGEON_COMPLETED: 'dungeon_completed',
    DUNGEON_BOSS_DEFEATED: 'dungeon_boss_defeated'
});

export const StoryActionTypes = Object.freeze({
    REVEAL_CLUE: 'reveal_clue',
    REVEAL_NEXT_CLUE: 'reveal_next_clue',
    RECORD_PROGRESS: 'record_progress',
    MARK_FINAL_READY: 'mark_final_ready'
});

export const StoryProgressRules = Object.freeze([]);

export function matchesStoryRule(rule, payload = {}) {
    if (!rule || !rule.match) return true;
    return Object.entries(rule.match).every(([key, expected]) => {
        const actual = payload[key];
        return Array.isArray(expected) ? expected.includes(actual) : actual === expected;
    });
}

export function getStoryEventRules(eventType, payload = {}) {
    return StoryProgressRules.filter(rule =>
        rule.event === eventType && matchesStoryRule(rule, payload)
    );
}
