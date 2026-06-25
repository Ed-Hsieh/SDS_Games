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
        id: 'special-bounty-points-to-blood-moon',
        event: E.WORLD_INTERACTION,
        match: { interactionId: 'special_bounty_notice' },
        requires: [{ type: 'monsterDefeated', monsterId: 'forest_guardian' }],
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
        actions: []
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
        requires: [{ type: 'monsterDefeated', monsterId: 'forest_guardian' }],
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
        id: 'rumor-echo-rhythm-validates-bell-order',
        event: E.WORLD_INTERACTION,
        match: { interactionId: 'rumor_echo_rhythm' },
        actions: [
            progress('drowned_oracle', 'use_echo_shell')
        ]
    },
    {
        id: 'black-market-coal-token-opens-meeting',
        event: E.WORLD_INTERACTION,
        match: { interactionId: 'black_market_coal_token' },
        actions: [
            clue('smuggled_coal_token'),
            progress('ash_baron', 'trade_coal_token')
        ]
    },
    {
        id: 'thorn-bargain-choice-reveals-rule',
        event: E.WORLD_INTERACTION,
        match: { interactionId: 'thorn_bargain_choice' },
        actions: [
            clue('green_bargain_mark'),
            progress('thorn_witch', 'choose_bargain')
        ]
    },

    {
        id: 'main-001-frames-first-trail',
        event: E.QUEST_COMPLETED,
        match: { questId: 'main_001' },
        actions: [
            progress('ambush_mantis', 'repeat_route')
        ]
    },
    {
        id: 'main-002-turns-slime-into-silver-thread',
        event: E.QUEST_COMPLETED,
        match: { questId: 'main_002' },
        actions: [
            progress('ambush_mantis', 'repeat_route')
        ]
    },
    {
        id: 'main-003-prepares-reverse-trap',
        event: E.QUEST_COMPLETED,
        match: { questId: 'main_003' },
        actions: [
            progress('ambush_mantis', 'craft_bait_hook')
        ]
    },
    {
        id: 'main-004-reopens-forest-trail',
        event: E.QUEST_COMPLETED,
        match: { questId: 'main_004' },
        actions: [
            clue('bloodied_arrow_pouch'),
            progress('forest_guardian', 'track_mist_marks')
        ]
    },
    {
        id: 'main-005-turns-forest-into-blood-moon',
        event: E.QUEST_COMPLETED,
        match: { questId: 'main_005' },
        requires: [{ type: 'monsterDefeated', monsterId: 'forest_guardian' }],
        actions: [
            clue('hunter_board_notice'),
            progress('blood_moon_stag', 'set_hunt_marker')
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
        id: 'forge-neelu-blueprint-feeds-thorn-craft',
        event: E.QUEST_COMPLETED,
        match: { questId: 'commission_forge_001' },
        actions: [
            progress('thorn_witch', 'color_trade_bead')
        ]
    },
    {
        id: 'forge-mithril-route-becomes-lure-crafting',
        event: E.QUEST_COMPLETED,
        match: { questId: 'commission_forge_002' },
        actions: [
            progress('elder_dragon', 'craft_dragon_lure')
        ]
    },
    {
        id: 'casino-false-odds-reveals-ash-route',
        event: E.QUEST_COMPLETED,
        match: { questId: 'commission_casino_001' },
        actions: [
            progress('ash_baron', 'recover_ledger')
        ]
    },
    {
        id: 'lamplighter-corrects-drowned-bell-route',
        event: E.QUEST_COMPLETED,
        match: { questId: 'commission_coast_lamplighter' },
        actions: [
            progress('drowned_oracle', 'solve_water_order')
        ]
    },
    {
        id: 'broken-standard-breaks-vanguard-oath',
        event: E.QUEST_COMPLETED,
        match: { questId: 'commission_broken_standard' },
        actions: [
            progress('demon_lord_asariel', 'break_vanguard_oath')
        ]
    },
    {
        id: 'last-index-stabilizes-crown-mark',
        event: E.QUEST_COMPLETED,
        match: { questId: 'commission_scholar_last_index' },
        actions: [
            progress('demon_lord_asariel', 'stabilize_crown_mark')
        ]
    },
    {
        id: 'main-007-opens-hill-threads',
        event: E.QUEST_COMPLETED,
        match: { questId: 'main_007' },
        actions: [
            progress('thorn_witch', 'deliver_herbs'),
            clue('carved_stone_shard'),
            clue('villager_herb_request'),
            progress('lich', 'collect_rune_shards')
        ]
    },
    {
        id: 'main-008-points-to-drowned-coast',
        event: E.QUEST_COMPLETED,
        match: { questId: 'main_008' },
        actions: [
            clue('wet_treasure_fragment'),
            progress('drowned_oracle', 'find_first_bell')
        ]
    },
    {
        id: 'main-009-exposes-opened-tomb',
        event: E.QUEST_COMPLETED,
        match: { questId: 'main_009' },
        actions: [
            clue('carved_stone_shard'),
            progress('lich', 'collect_rune_shards')
        ]
    },
    {
        id: 'main-010-reveals-ash-ledger',
        event: E.QUEST_COMPLETED,
        match: { questId: 'main_010' },
        actions: [
            clue('ash_ledger_page'),
            progress('ash_baron', 'recover_ledger')
        ]
    },
    {
        id: 'main-011-points-to-northern-heat',
        event: E.QUEST_COMPLETED,
        match: { questId: 'main_011' },
        actions: [
            clue('dragon_heat_trace'),
            progress('elder_dragon', 'collect_heat_traces')
        ]
    },
    {
        id: 'main-012-opens-charred-obelisk',
        event: E.QUEST_COMPLETED,
        match: { questId: 'main_012' },
        actions: [
            progress('elder_dragon', 'survive_black_flame')
        ]
    },
    {
        id: 'main-013-turns-dragon-nest-to-abyss',
        event: E.QUEST_COMPLETED,
        match: { questId: 'main_013' },
        actions: [
            clue('dragon_nest_resonance'),
            progress('demon_lord_asariel', 'read_nest_resonance')
        ]
    },
    {
        id: 'main-014-readies-asariel-breach',
        event: E.QUEST_COMPLETED,
        match: { questId: 'main_014' },
        actions: [
            clue('cracked_crown_mark'),
            progress('demon_lord_asariel', 'stabilize_crown_mark'),
            finalReady('demon_lord_asariel')
        ]
    },

    {
        id: 'low-zone-exploration-finds-first-thread',
        event: E.ZONE_EXPLORED,
        match: { zoneId: 'low' },
        counter: { key: 'zone.low', required: 3 },
        actions: [
            progress('ambush_mantis', 'repeat_route')
        ]
    },
    {
        id: 'low-zone-exploration-confirms-campfire-risk',
        event: E.ZONE_EXPLORED,
        match: { zoneId: 'low' },
        counter: { key: 'zone.low.campfire', required: 8 },
        actions: [
            progress('ambush_mantis', 'survive_second_campfire')
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
        requires: [{ type: 'monsterDefeated', monsterId: 'forest_guardian' }],
        actions: [
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
        id: 'hunter-boardwalk-confirms-silk-tripwire',
        event: E.LANDMARK_VISITED,
        match: { landmarkId: 'hunter_boardwalk' },
        actions: [
            clue('silk_tripwire'),
            progress('ambush_mantis', 'repeat_route')
        ]
    },
    {
        id: 'old-campfire-confirms-survivor-warning',
        event: E.LANDMARK_VISITED,
        match: { landmarkId: 'old_campfire_site' },
        actions: [
            clue('survivor_warning'),
            progress('ambush_mantis', 'survive_second_campfire')
        ]
    },
    {
        id: 'cut-roadsign-confirms-bait-hook',
        event: E.LANDMARK_VISITED,
        match: { landmarkId: 'cut_roadsign' },
        requires: [
            { type: 'clue', clueId: 'silk_tripwire' },
            { type: 'clue', clueId: 'survivor_warning' }
        ],
        actions: [
            clue('snapped_bait_hook'),
            progress('ambush_mantis', 'craft_bait_hook')
        ]
    },
    {
        id: 'silver-snare-pass-confirms-ambush-loop',
        event: E.LANDMARK_VISITED,
        match: { landmarkId: 'silver_snare_pass' },
        actions: [
            progress('ambush_mantis', 'repeat_route')
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
        id: 'moon-moss-slope-builds-stag-track',
        event: E.LANDMARK_VISITED,
        match: { landmarkId: 'moon_moss_slope' },
        requires: [{ type: 'monsterDefeated', monsterId: 'forest_guardian' }],
        actions: [
            clue('moon_moss_sample'),
            progress('blood_moon_stag', 'mark_moon_moss')
        ]
    },
    {
        id: 'broken-horn-camp-builds-stag-route',
        event: E.LANDMARK_VISITED,
        match: { landmarkId: 'broken_horn_camp' },
        requires: [{ type: 'monsterDefeated', monsterId: 'forest_guardian' }],
        actions: [
            clue('broken_horn_map'),
            progress('blood_moon_stag', 'compare_migration')
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
        id: 'thorn-glasshouse-builds-witch-thread',
        event: E.LANDMARK_VISITED,
        match: { landmarkId: 'thorn_glasshouse_ruin' },
        actions: [
            clue('thorn_trade_bead'),
            progress('thorn_witch', 'deliver_herbs')
        ]
    },
    {
        id: 'drowned-coast-builds-oracle-thread',
        event: E.LANDMARK_VISITED,
        match: { landmarkId: 'drowned_bell_coast' },
        actions: [
            clue('drowned_bell_rubbing'),
            progress('drowned_oracle', 'find_first_bell')
        ]
    },
    {
        id: 'sunken-altar-solves-oracle-order',
        event: E.LANDMARK_VISITED,
        match: { landmarkId: 'sunken_altar_reef' },
        actions: [
            clue('oracle_shell'),
            progress('drowned_oracle', 'solve_water_order')
        ]
    },
    {
        id: 'opened-tomb-builds-lich-thread',
        event: E.LANDMARK_VISITED,
        match: { landmarkId: 'opened_ancient_tomb' },
        actions: [
            clue('carved_stone_shard'),
            progress('lich', 'collect_rune_shards')
        ]
    },
    {
        id: 'obsidian-keep-opens-baron-contract',
        event: E.LANDMARK_VISITED,
        match: { landmarkId: 'obsidian_keep_gate' },
        actions: [
            clue('sealed_wax_contract'),
            progress('ash_baron', 'accept_contract')
        ]
    },
    {
        id: 'black-iron-storehouse-builds-ledger',
        event: E.LANDMARK_VISITED,
        match: { landmarkId: 'black_iron_storehouse' },
        actions: [
            clue('ash_ledger_page'),
            progress('ash_baron', 'recover_ledger')
        ]
    },
    {
        id: 'northern-drake-watch-builds-dragon-thread',
        event: E.LANDMARK_VISITED,
        match: { landmarkId: 'northern_drake_watch' },
        actions: [
            clue('dragon_heat_trace'),
            progress('elder_dragon', 'collect_heat_traces')
        ]
    },
    {
        id: 'dragon-heat-crag-builds-nest-resonance',
        event: E.LANDMARK_VISITED,
        match: { landmarkId: 'dragon_heat_crag' },
        actions: [
            clue('dragon_heat_trace'),
            progress('elder_dragon', 'survive_black_flame')
        ]
    },
    {
        id: 'abyssal-seal-break-builds-asariel-thread',
        event: E.LANDMARK_VISITED,
        match: { landmarkId: 'abyssal_seal_break' },
        actions: [
            clue('cracked_crown_mark'),
            progress('demon_lord_asariel', 'stabilize_crown_mark')
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
        requires: [{ type: 'monsterDefeated', monsterId: 'forest_guardian' }],
        actions: [
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
        id: 'demon-vanguard-feeds-asariel-oath',
        event: E.MONSTER_KILL,
        match: { monsterId: 'demon_soldier' },
        counter: { key: 'kill.demon_soldier', required: 4 },
        actions: [
            clue('abyss_vanguard_oath'),
            progress('demon_lord_asariel', 'break_vanguard_oath')
        ]
    },
    {
        id: 'demon-generals-ready-asariel',
        event: E.MONSTER_KILL,
        match: { monsterId: 'demon_general' },
        counter: { key: 'kill.demon_general', required: 2 },
        actions: [
            clue('cracked_crown_mark'),
            progress('demon_lord_asariel', 'stabilize_crown_mark'),
            finalReady('demon_lord_asariel')
        ]
    },
    {
        id: 'spider-kills-feed-ambush-thread',
        event: E.MONSTER_KILL,
        match: { monsterId: 'poison_spider' },
        counter: { key: 'kill.poison_spider', required: 3 },
        actions: [
            progress('ambush_mantis', 'repeat_route')
        ]
    },
    {
        id: 'ambush-mantis-defeat-opens-forest-trail',
        event: E.MONSTER_KILL,
        match: { monsterId: 'ambush_mantis' },
        actions: [
            clue('bloodied_arrow_pouch'),
            progress('forest_guardian', 'track_mist_marks')
        ]
    },
    {
        id: 'forest-guardian-defeat-opens-blood-moon',
        event: E.MONSTER_KILL,
        match: { monsterId: 'forest_guardian' },
        actions: [
            clue('hunter_board_notice')
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
            progress('thorn_witch', 'deliver_herbs'),
            clue('thorn_trade_bead'),
            progress('ambush_mantis', 'survive_second_campfire')
        ]
    },
    {
        id: 'hell-clear-feeds-dragon-and-ash',
        event: E.DUNGEON_COMPLETED,
        match: { dungeonId: 'hell' },
        actions: [
            progress('elder_dragon', 'survive_black_flame'),
            progress('ash_baron', 'trade_coal_token'),
            clue('abyss_vanguard_oath'),
            progress('demon_lord_asariel', 'break_vanguard_oath')
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
