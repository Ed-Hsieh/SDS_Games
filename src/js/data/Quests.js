/**
 * Optional quest runtime contracts.
 *
 * Mandatory chapter progression is owned by StorySceneRegistry and
 * StorySceneManager. It must not be copied into this database. Optional stories
 * enter this database only after dialogue, owner, interactions, rewards, and
 * runtime flags are approved and implemented.
 */

export const QuestType = Object.freeze({
    BOUNTY: 'bounty',
    COMMISSION: 'commission',
    HIDDEN: 'hidden'
});

export const QuestStatus = Object.freeze({
    LOCKED: 'locked',
    AVAILABLE: 'available',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    FINISHED: 'finished'
});

export const ObjectiveType = Object.freeze({
    KILL: 'kill',
    COLLECT: 'collect',
    GOLD: 'gold',
    CRAFT: 'craft',
    ENHANCE: 'enhance',
    GAMBLE_WIN: 'gamble_win',
    GAMBLE_PROFIT: 'gamble_profit',
    EXPLORE: 'explore',
    EVENT: 'event',
    TALK: 'talk',
    DUNGEON_CLEAR: 'dungeon_clear',
    DUNGEON_BOSS: 'dungeon_boss',
    DUNGEON_FLOOR: 'dungeon_floor',
    CUSTOM: 'custom'
});

export const QuestDatabase = Object.freeze({
    bounty: Object.freeze([]),
    commission: Object.freeze([]),
    hidden: Object.freeze([])
});

export function getQuestById(questId) {
    if (!questId) return null;
    for (const category of Object.values(QuestDatabase)) {
        const quest = category.find(entry => entry.id === questId);
        if (quest) return quest;
    }
    return null;
}
