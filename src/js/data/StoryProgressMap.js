export const StoryEventTypes = {
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
};

export const StoryActionTypes = {
    REVEAL_CLUE: 'reveal_clue',
    REVEAL_NEXT_CLUE: 'reveal_next_clue',
    RECORD_PROGRESS: 'record_progress',
    MARK_FINAL_READY: 'mark_final_ready'
};

const A = StoryActionTypes;
const E = StoryEventTypes;

function clue(clueId) {
    return { type: A.REVEAL_CLUE, clueId };
}

function nextClue(chainId) {
    return { type: A.REVEAL_NEXT_CLUE, chainId };
}

function progress(chainId, progressId) {
    return { type: A.RECORD_PROGRESS, chainId, progressId };
}

function finalReady(chainId) {
    return { type: A.MARK_FINAL_READY, chainId };
}

export const StoryProgressRules = [
    {
        id: 'notice-board-starts-hunt-rumors',
        event: E.WORLD_INTERACTION,
        match: { interactionId: 'crossroads_notice_board' },
        actions: [
            clue('hunter_board_notice'),
            nextClue('forest_guardian')
        ]
    },
    {
        id: 'special-bounty-points-to-blood-moon',
        event: E.WORLD_INTERACTION,
        match: { interactionId: 'special_bounty_notice' },
        actions: [
            clue('hunter_board_notice'),
            progress('blood_moon_stag', 'set_hunt_marker')
        ]
    },
    {
        id: 'ruin-tablet-starts-seal-thread',
        event: E.WORLD_INTERACTION,
        match: { interactionId: 'ruin_tablet_trace' },
        actions: [
            clue('carved_stone_shard'),
            progress('lich', 'collect_rune_shards')
        ]
    },
    {
        id: 'blueprint-cache-connects-crafting-to-forest',
        event: E.WORLD_INTERACTION,
        match: { interactionId: 'field_blueprint_cache' },
        actions: [
            progress('forest_guardian', 'track_mist_marks')
        ]
    },
    {
        id: 'beggar-seeds-villager-request',
        event: E.WORLD_INTERACTION,
        match: { interactionId: 'crossroads_beggar' },
        actions: [
            clue('villager_herb_request')
        ]
    },
    {
        id: 'ancient-coin-opens-smuggler-thread',
        event: E.WORLD_INTERACTION,
        match: { interactionId: 'merchant_ancient_coin' },
        actions: [
            clue('sealed_wax_contract'),
            progress('ash_baron', 'trade_coal_token')
        ]
    },
    {
        id: 'map-fragment-points-to-stag-route',
        event: E.WORLD_INTERACTION,
        match: { interactionId: 'cartographer_map_fragment' },
        actions: [
            clue('broken_horn_map'),
            progress('blood_moon_stag', 'compare_migration')
        ]
    },
    {
        id: 'tower-glyph-feeds-seal-order',
        event: E.WORLD_INTERACTION,
        match: { interactionId: 'tower_glyph_memory' },
        actions: [
            clue('mist_tablet_rubbing'),
            progress('lich', 'cleanse_tablets')
        ]
    },
    {
        id: 'dungeon-forge-relic-feeds-ledger',
        event: E.WORLD_INTERACTION,
        match: { interactionId: 'dungeon_forge_relic' },
        actions: [
            clue('ash_ledger_page'),
            progress('ash_baron', 'recover_ledger')
        ]
    },

    {
        id: 'main-001-frames-first-trail',
        event: E.QUEST_COMPLETED,
        match: { questId: 'main_001' },
        actions: [
            clue('bloodied_arrow_pouch')
        ]
    },
    {
        id: 'main-002-turns-combat-into-tracking',
        event: E.QUEST_COMPLETED,
        match: { questId: 'main_002' },
        actions: [
            clue('wolf_fang_marks'),
            progress('forest_guardian', 'kill_wolves')
        ]
    },
    {
        id: 'main-005-expands-to-mid-zone-mystery',
        event: E.QUEST_COMPLETED,
        match: { questId: 'main_005' },
        actions: [
            clue('black_bark_sample'),
            progress('forest_guardian', 'track_mist_marks')
        ]
    },
    {
        id: 'merchant-commission-becomes-contract-story',
        event: E.QUEST_COMPLETED,
        match: { questId: 'commission_merchant_001' },
        actions: [
            progress('ash_baron', 'accept_contract')
        ]
    },
    {
        id: 'forge-commission-becomes-lure-crafting',
        event: E.QUEST_COMPLETED,
        match: { questId: 'commission_forge_001' },
        actions: [
            progress('elder_dragon', 'craft_dragon_lure')
        ]
    },
    {
        id: 'lich-main-quest-opens-final-state',
        event: E.QUEST_COMPLETED,
        match: { questId: 'main_007' },
        actions: [
            finalReady('lich')
        ]
    },

    {
        id: 'low-zone-exploration-finds-first-thread',
        event: E.ZONE_EXPLORED,
        match: { zoneId: 'low' },
        counter: { key: 'zone.low', required: 3 },
        actions: [
            clue('bloodied_arrow_pouch')
        ]
    },
    {
        id: 'low-zone-exploration-builds-forest-tracking',
        event: E.ZONE_EXPLORED,
        match: { zoneId: 'low' },
        counter: { key: 'zone.low.deep', required: 7 },
        actions: [
            progress('forest_guardian', 'track_mist_marks')
        ]
    },
    {
        id: 'medium-zone-exploration-finds-moon-moss',
        event: E.ZONE_EXPLORED,
        match: { zoneId: 'medium' },
        counter: { key: 'zone.medium', required: 5 },
        actions: [
            clue('moon_moss_sample'),
            progress('blood_moon_stag', 'mark_moon_moss')
        ]
    },
    {
        id: 'high-zone-exploration-feeds-lich-tablets',
        event: E.ZONE_EXPLORED,
        match: { zoneId: 'high' },
        counter: { key: 'zone.high', required: 5 },
        actions: [
            progress('lich', 'cleanse_tablets')
        ]
    },
    {
        id: 'death-zone-exploration-finds-dragon-heat',
        event: E.ZONE_EXPLORED,
        match: { zoneId: 'death' },
        counter: { key: 'zone.death', required: 4 },
        actions: [
            clue('dragon_heat_trace'),
            progress('elder_dragon', 'collect_heat_traces')
        ]
    },

    {
        id: 'hunter-boardwalk-confirms-arrow-pouch',
        event: E.LANDMARK_VISITED,
        match: { landmarkId: 'hunter_boardwalk' },
        actions: [
            clue('bloodied_arrow_pouch')
        ]
    },
    {
        id: 'rotroot-ravine-confirms-black-bark',
        event: E.LANDMARK_VISITED,
        match: { landmarkId: 'rotroot_ravine' },
        actions: [
            clue('black_bark_sample'),
            progress('forest_guardian', 'track_mist_marks')
        ]
    },
    {
        id: 'mist-tablet-hill-solves-tablet-thread',
        event: E.LANDMARK_VISITED,
        match: { landmarkId: 'mist_tablet_hill' },
        actions: [
            clue('mist_tablet_rubbing'),
            progress('forest_guardian', 'solve_tablet_hint'),
            progress('lich', 'cleanse_tablets')
        ]
    },
    {
        id: 'charred-obelisk-builds-dragon-thread',
        event: E.LANDMARK_VISITED,
        match: { landmarkId: 'charred_obelisk' },
        actions: [
            clue('dragon_heat_trace'),
            progress('elder_dragon', 'collect_heat_traces')
        ]
    },

    {
        id: 'wolf-kills-complete-forest-track',
        event: E.MONSTER_KILL,
        match: { monsterId: 'wild_wolf' },
        counter: { key: 'kill.wild_wolf', required: 5 },
        actions: [
            clue('wolf_fang_marks'),
            progress('forest_guardian', 'kill_wolves')
        ]
    },
    {
        id: 'alpha-wolf-feeds-blood-moon-track',
        event: E.MONSTER_KILL,
        match: { monsterId: 'tower_alpha_wolf' },
        actions: [
            clue('moon_moss_sample'),
            progress('blood_moon_stag', 'mark_moon_moss')
        ]
    },
    {
        id: 'stone-monsters-feed-lich-shards',
        event: E.MONSTER_KILL,
        match: { monsterId: ['stone_golem', 'stone_golem_mini', 'ancient_guardian', 'rune_keeper'] },
        counter: { key: 'kill.stone_seal', required: 3 },
        actions: [
            clue('carved_stone_shard'),
            progress('lich', 'collect_rune_shards')
        ]
    },
    {
        id: 'dragonkin-feed-dragon-heat',
        event: E.MONSTER_KILL,
        match: { monsterId: ['wyvern', 'drake', 'dragon_knight'] },
        counter: { key: 'kill.dragonkin', required: 2 },
        actions: [
            clue('dragon_heat_trace'),
            progress('elder_dragon', 'collect_heat_traces')
        ]
    },
    {
        id: 'spider-kills-feed-ambush-thread',
        event: E.MONSTER_KILL,
        match: { monsterId: 'poison_spider' },
        counter: { key: 'kill.poison_spider', required: 3 },
        actions: [
            clue('silk_tripwire'),
            progress('ambush_mantis', 'repeat_route')
        ]
    },
    {
        id: 'skeleton-kills-feed-ash-ledger',
        event: E.MONSTER_KILL,
        match: { monsterId: ['skeleton', 'skeleton_warrior', 'tower_skeleton_captain'] },
        counter: { key: 'kill.skeleton', required: 4 },
        actions: [
            clue('ash_ledger_page'),
            progress('ash_baron', 'recover_ledger')
        ]
    },

    {
        id: 'cave-clear-feeds-lich-survival',
        event: E.DUNGEON_COMPLETED,
        match: { dungeonId: 'cave' },
        actions: [
            progress('lich', 'survive_curse')
        ]
    },
    {
        id: 'snow-clear-feeds-oracle-bell',
        event: E.DUNGEON_COMPLETED,
        match: { dungeonId: 'snow' },
        actions: [
            clue('drowned_bell_rubbing'),
            progress('drowned_oracle', 'find_first_bell')
        ]
    },
    {
        id: 'ruins-clear-feeds-seal-order',
        event: E.DUNGEON_COMPLETED,
        match: { dungeonId: 'ruins' },
        actions: [
            progress('lich', 'cleanse_tablets'),
            progress('drowned_oracle', 'solve_water_order')
        ]
    },
    {
        id: 'jungle-clear-feeds-thorn-and-ambush',
        event: E.DUNGEON_COMPLETED,
        match: { dungeonId: 'jungle' },
        actions: [
            clue('thorn_trade_bead'),
            progress('thorn_witch', 'deliver_herbs'),
            progress('ambush_mantis', 'survive_second_campfire')
        ]
    },
    {
        id: 'hell-clear-feeds-dragon-and-ash',
        event: E.DUNGEON_COMPLETED,
        match: { dungeonId: 'hell' },
        actions: [
            progress('elder_dragon', 'survive_black_flame'),
            progress('ash_baron', 'trade_coal_token')
        ]
    },
    {
        id: 'cave-boss-pushes-final-lich',
        event: E.DUNGEON_BOSS_DEFEATED,
        match: { bossId: 'cave_boss' },
        actions: [
            finalReady('lich')
        ]
    }
];

function matchesValue(expected, actual) {
    if (expected === undefined) return true;
    if (Array.isArray(expected)) return expected.includes(actual);
    return expected === actual;
}

export function matchesStoryRule(rule, payload = {}) {
    return Object.entries(rule.match || {}).every(([key, expected]) => matchesValue(expected, payload[key]));
}

export function getStoryEventRules(eventType, payload = {}) {
    return StoryProgressRules.filter(rule => rule.event === eventType && matchesStoryRule(rule, payload));
}
