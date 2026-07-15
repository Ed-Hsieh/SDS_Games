/**
 * ChapterQuestFramework.js
 * Planning data for Lv1-Lv70 quest, town, source, and reward placement.
 *
 * This file is intentionally framework-only. Combat and tower redesign are
 * paused and should not be implemented through this data.
 */

export const ChapterFrameworkStatus = Object.freeze({
    FRAMEWORK: 'framework',
    ACTIVE_DIRECTION: 'active_direction',
    PAUSED: 'paused'
});

export const ChapterSourceRole = Object.freeze({
    MAIN_STORY: 'main_story',
    SIDE_STORY: 'side_story',
    MONSTER_DROP: 'monster_drop',
    ELITE_DROP: 'elite_drop',
    DUNGEON: 'dungeon',
    FORGE: 'forge',
    MARKET: 'market',
    CASINO: 'casino',
    BLACK_MARKET: 'black_market',
    INFORMATION: 'information'
});

export const ChapterRewardScale = Object.freeze({
    ORDINARY: 'ordinary',
    STORY_MATCHED: 'story_matched',
    FEATURE_UNLOCK: 'feature_unlock',
    UNIQUE_EQUIPMENT: 'unique_equipment',
    SYSTEM_ACCESS: 'system_access'
});

export const ChapterQuestFramework = Object.freeze([
    {
        id: 'chapter_01_after_the_broken_gate',
        chapter: 1,
        levelRange: [1, 10],
        title: '南門以外',
        subtitle: '城鎮不是大廳，而是剛撐住一口氣的避難所。',
        coreConflict: 'The player proves which roads still exist and learns that monsters are evidence of route damage.',
        townFocus: [
            'south_gate_first_repair',
            'apothecary_counter_reopens',
            'first_npc_returns',
            'basic_route_safety'
        ],
        questBeats: [
            'Establish the broken town and missing services.',
            'Make the first repaired route visibly useful.',
            'Let the elder, scholar, herbalist, and gate defenders become people before they become menus.'
        ],
        rewardDirection: [
            ChapterRewardScale.ORDINARY,
            ChapterRewardScale.FEATURE_UNLOCK,
            ChapterRewardScale.STORY_MATCHED
        ],
        primarySources: [
            ChapterSourceRole.MAIN_STORY,
            ChapterSourceRole.SIDE_STORY,
            ChapterSourceRole.MONSTER_DROP,
            ChapterSourceRole.MARKET
        ],
        thirdPartySources: ['supply_caravans'],
        elementPressure: ['none', 'early_nature', 'early_undead'],
        townUnlocks: ['basic_shop_stock', 'south_gate_exit', 'starter_healing_stock'],
        dungeonRole: 'Small early dungeon content may teach preparation, but should not dominate the chapter.',
        implementationNotes: 'Do not unlock casino as the main reason to play this chapter.'
    },
    {
        id: 'chapter_02_miststone_and_drowned_bell',
        chapter: 2,
        levelRange: [11, 20],
        title: '斷路上的藥味',
        subtitle: '補給、藥品、市集與舊撤離紀錄開始讓城鎮重新呼吸。',
        coreConflict: 'The player discovers that safe travel creates medicine, supply, and civic recovery.',
        townFocus: [
            'market_supply_line',
            'rumor_board_network',
            'apothecary_stock_growth',
            'first_forge_service'
        ],
        questBeats: [
            'Connect route repair to stock changes and map confidence.',
            'Introduce old evacuation and grave records through the lich route.',
            'Let side quests reward practical town growth instead of only gold.'
        ],
        rewardDirection: [
            ChapterRewardScale.STORY_MATCHED,
            ChapterRewardScale.FEATURE_UNLOCK,
            ChapterRewardScale.UNIQUE_EQUIPMENT
        ],
        primarySources: [
            ChapterSourceRole.MAIN_STORY,
            ChapterSourceRole.SIDE_STORY,
            ChapterSourceRole.DUNGEON,
            ChapterSourceRole.FORGE,
            ChapterSourceRole.MARKET
        ],
        thirdPartySources: ['supply_caravans', 'scholar_network'],
        elementPressure: ['mist', 'water', 'earth'],
        townUnlocks: ['market_stalls', 'basic_forge', 'route_hints'],
        dungeonRole: 'Dungeons should give specific mechanics, materials, or unlock clues.',
        implementationNotes: 'The player should begin to feel that money and materials have multiple uses.'
    },
    {
        id: 'chapter_03_black_iron_shadow_precursor',
        chapter: 3,
        levelRange: [21, 30],
        title: '影子仍守夜',
        subtitle: '暗影不是虛空本體，而是舊命令、黑鐵路線與誘惑捷徑的前兆。',
        coreConflict: 'Shadow soldiers, casino showcase prizes, and black-market access make the player choose between stable preparation and risky shortcuts.',
        townFocus: [
            'casino_showcase_hook',
            'black_market_contact',
            'lamplighter_routes',
            'shadow_precursor_sources'
        ],
        questBeats: [
            'Introduce shadow shard sources around Lv24-30.',
            'Open casino temptation through display-case items before the owner route becomes explicit.',
            'Reveal black-market access as useful but not harmless.'
        ],
        rewardDirection: [
            ChapterRewardScale.UNIQUE_EQUIPMENT,
            ChapterRewardScale.SYSTEM_ACCESS,
            ChapterRewardScale.STORY_MATCHED
        ],
        primarySources: [
            ChapterSourceRole.ELITE_DROP,
            ChapterSourceRole.CASINO,
            ChapterSourceRole.BLACK_MARKET,
            ChapterSourceRole.FORGE,
            ChapterSourceRole.INFORMATION
        ],
        thirdPartySources: ['casino_house', 'black_market_ring', 'scholar_network'],
        elementPressure: ['shadow', 'black_iron', 'undead'],
        townUnlocks: ['casino_floor', 'casino_prize_showcase', 'black_market_contact', 'shadow_precursor_crafting'],
        dungeonRole: 'Dungeons should test whether the player used forge, market, monster drops, or casino preparation.',
        implementationNotes: 'Shadow must stay weaker than void and should not appear in Lv1-10 content.'
    },
    {
        id: 'chapter_04_fourfold_fracture',
        chapter: 4,
        levelRange: [31, 40],
        title: '石心與灰雨',
        subtitle: '石路、灰雨、旗與燈把地圖本身變成鎖的一部分。',
        coreConflict: 'The player sees that land instability and route safety matter as much as raw combat strength.',
        townFocus: [
            'elemental_stock',
            'route_based_market_supply',
            'forge_countergear',
            'rumor_board_elite_warnings'
        ],
        questBeats: [
            'Let each element have clear monster, material, and equipment identity.',
            'Make town services offer different solutions instead of one optimal path.',
            'Use the flag-and-lamp crisis to prove that courage without support can still kill someone.'
        ],
        rewardDirection: [
            ChapterRewardScale.STORY_MATCHED,
            ChapterRewardScale.UNIQUE_EQUIPMENT,
            ChapterRewardScale.FEATURE_UNLOCK
        ],
        primarySources: [
            ChapterSourceRole.MONSTER_DROP,
            ChapterSourceRole.ELITE_DROP,
            ChapterSourceRole.DUNGEON,
            ChapterSourceRole.FORGE,
            ChapterSourceRole.MARKET
        ],
        thirdPartySources: ['supply_caravans', 'scholar_network', 'casino_house'],
        elementPressure: ['fire', 'ice', 'thunder', 'poison'],
        townUnlocks: ['elemental_shop_stock', 'forge_counter_recipes', 'rotating_casino_pools'],
        dungeonRole: 'Dungeons become deliberate preparation checks with better special drops.',
        implementationNotes: 'The four common elements should feel similar in tier, not equal in flavor.'
    },
    {
        id: 'chapter_05_dragonline_contracts',
        chapter: 5,
        levelRange: [41, 50],
        title: '元素失衡',
        subtitle: '元素前線、藥師手記、遠征名冊與進階鍛造把準備變得昂貴。',
        coreConflict: 'Elemental fronts and old expedition truth force the player to prepare without repeating the old armed mistake.',
        townFocus: [
            'advanced_forge_contracts',
            'dungeon_supply_contracts',
            'elite_material_requests',
            'specialized_market_orders'
        ],
        questBeats: [
            'Move the blacksmith and supply network from repair into specialization.',
            'Use elite monsters as serious resource and equipment targets.',
            'Make the herbalist notebook and expedition list carry second-run rescue and dragon-proof value.'
        ],
        rewardDirection: [
            ChapterRewardScale.UNIQUE_EQUIPMENT,
            ChapterRewardScale.FEATURE_UNLOCK,
            ChapterRewardScale.SYSTEM_ACCESS
        ],
        primarySources: [
            ChapterSourceRole.ELITE_DROP,
            ChapterSourceRole.DUNGEON,
            ChapterSourceRole.FORGE,
            ChapterSourceRole.SIDE_STORY
        ],
        thirdPartySources: ['supply_caravans', 'black_market_ring'],
        elementPressure: ['dragon', 'advanced_earth', 'advanced_fire'],
        townUnlocks: ['advanced_forge', 'dungeon_contract_board', 'elite_route_hints'],
        dungeonRole: 'Dungeons should be difficult enough that preparation route choice matters.',
        implementationNotes: 'Boss-dropped items must visually match boss-held or boss-worn objects.'
    },
    {
        id: 'chapter_06_dragon_seal',
        chapter: 6,
        levelRange: [51, 60],
        title: '龍守封痕',
        subtitle: '龍族不是盟友；他們守著被人類弄傷的封印邊界。',
        coreConflict: 'The player either repeats the old expedition as a stronger invader or meets the non-war proof conditions.',
        townFocus: [
            'elder_pursuit_and_aftermath',
            'casino_owner_route_pressure',
            'contract_anomaly_record_only',
            'dragon_non_war_conditions'
        ],
        questBeats: [
            'Let risky third-party sources become tempting but consequential.',
            'Use the seal scar shard and Echo Whistle route meaning to separate the second run from the first-run dragon war.',
            'Resolve Vesper through Loaded Dice and contract reversal in the second run.'
        ],
        rewardDirection: [
            ChapterRewardScale.UNIQUE_EQUIPMENT,
            ChapterRewardScale.SYSTEM_ACCESS,
            ChapterRewardScale.STORY_MATCHED
        ],
        primarySources: [
            ChapterSourceRole.BLACK_MARKET,
            ChapterSourceRole.CASINO,
            ChapterSourceRole.DUNGEON,
            ChapterSourceRole.ELITE_DROP,
            ChapterSourceRole.INFORMATION
        ],
        thirdPartySources: ['black_market_ring', 'casino_house', 'scholar_network'],
        elementPressure: ['dragon_fire', 'late_shadow', 'void_foreshadow_only'],
        townUnlocks: ['casino_owner_resolution_hooks', 'contract_anomaly_record', 'dragon_route_aftermath'],
        dungeonRole: 'Dungeons can require specialized mainline preparation; formal Void and tower content remain outside mandatory Chapter 6.',
        implementationNotes: 'Use durable consequences only. Do not add fake moral branches.'
    },
    {
        id: 'chapter_07_fall_site_true_kill',
        chapter: 7,
        levelRange: [61, 70],
        title: '墜落之地',
        subtitle: '回聲哨打開舊山路，魔王墜落的真相終於變成可抵達的地方。',
        coreConflict: 'The player reaches the Demon King through a road understood by people, tools, and memory rather than brute force alone.',
        townFocus: [
            'glimmer_true_kill_preparation',
            'external_route_departure_hints',
            'terminal_supply_line',
            'final_preparation_routes'
        ],
        questBeats: [
            'Use the Echo Whistle route and Ailo memory event to open the old mountain road.',
            'Let glimmer complete the true-kill method without importing formal light or Void rewards.',
            'Let the town feel changed by the entire previous rebuild.'
        ],
        rewardDirection: [
            ChapterRewardScale.SYSTEM_ACCESS,
            ChapterRewardScale.UNIQUE_EQUIPMENT,
            ChapterRewardScale.STORY_MATCHED
        ],
        primarySources: [
            ChapterSourceRole.MAIN_STORY,
            ChapterSourceRole.DUNGEON,
            ChapterSourceRole.FORGE,
            ChapterSourceRole.INFORMATION
        ],
        thirdPartySources: ['scholar_network', 'supply_caravans'],
        elementPressure: ['glimmer', 'demon', 'external_light_hook_only'],
        townUnlocks: ['terminal_town_state', 'second_run_external_route_index'],
        dungeonRole: 'The Radiant Corridor is an optional second-run external route and never part of Demon King preparation; the tower rewrite remains paused.',
        implementationNotes: 'Do not assign tower rewards or external Boss art before their stories and map branches are approved.'
    }
]);

export const LevelBandQuestFramework = Object.freeze([
    {
        id: 'lv_01_10_broken_services',
        levelRange: [1, 10],
        chapter: 1,
        title: 'Broken Services',
        expectedMonsterRole: 'basic threat and first readable silhouettes',
        expectedEquipmentRole: 'starter gear, simple story-matched rewards, first repaired-service rewards',
        expectedMaterialRole: 'low-count crafting materials, no shadow shards'
    },
    {
        id: 'lv_11_20_supply_and_ruins',
        levelRange: [11, 20],
        chapter: 2,
        title: 'Supply And Ruins',
        expectedMonsterRole: 'route, coast, ruin, and stronger regional mobs',
        expectedEquipmentRole: 'first distinct side-quest equipment and forge recipes',
        expectedMaterialRole: 'route materials and early dungeon materials'
    },
    {
        id: 'lv_21_30_shadow_precursor',
        levelRange: [21, 30],
        chapter: 3,
        title: 'Shadow Precursor',
        expectedMonsterRole: 'black iron and shadow soldier pressure',
        expectedEquipmentRole: 'shadow precursor gear, casino curiosity items, black-market risk items',
        expectedMaterialRole: 'shadow shards begin around Lv24-30'
    },
    {
        id: 'lv_31_40_four_elements',
        levelRange: [31, 40],
        chapter: 4,
        title: 'Four Elements',
        expectedMonsterRole: 'fire, ice, thunder, poison groups with equal tier but different behavior',
        expectedEquipmentRole: 'counter gear and dungeon-specific specials',
        expectedMaterialRole: 'elemental materials with controlled drop rates'
    },
    {
        id: 'lv_41_50_advanced_contracts',
        levelRange: [41, 50],
        chapter: 5,
        title: 'Advanced Contracts',
        expectedMonsterRole: 'elite and dragon-route preparation threats',
        expectedEquipmentRole: 'advanced forge contracts, elite drops, non-sword spread',
        expectedMaterialRole: 'elite materials and dungeon preparation components'
    },
    {
        id: 'lv_51_60_dragon_and_late_shadow',
        levelRange: [51, 60],
        chapter: 6,
        title: 'Dragon And Late Shadow',
        expectedMonsterRole: 'dragon-route threats, late shadow pressure, and Void foreshadowing only',
        expectedEquipmentRole: 'forbidden, casino, dungeon, and high-risk preparation gear',
        expectedMaterialRole: 'dragon and late-shadow materials; no mandatory formal Void source'
    },
    {
        id: 'lv_61_70_fall_site_glimmer',
        levelRange: [61, 70],
        chapter: 7,
        title: 'Fall Site Glimmer',
        expectedMonsterRole: 'demon-route threats and terminal glimmer preparation enemies',
        expectedEquipmentRole: 'mainline Demon King preparation without required formal light gear',
        expectedMaterialRole: 'glimmer and current-run true-kill anchors; formal light remains optional'
    }
]);

export const SecondRunExternalBossFramework = Object.freeze({
    status: ChapterFrameworkStatus.PAUSED,
    unlock: 'first_run_false_ending_achievement',
    requiredForTrueEnding: false,
    physicalPersistence: 'current_run_only',
    rollout: 'staggered_across_second_run',
    resumeGate: 'complete_and_validate_first_run_story_systems_and_required_art_then_audit_persistent_evidence_flags',
    tracks: Object.freeze([
        Object.freeze({
            key: 'prologue_blood_moon_stag',
            runtimeBossId: 'blood_moon_stag',
            window: 'opening_seed_then_second_run_hidden_rematch',
            purpose: 'Revisit the opening charge route and identify the curse-maddened beast behind the silhouette.',
            status: 'identity_accepted_route_paused'
        }),
        Object.freeze({
            key: 'nameless_curse',
            runtimeBossId: null,
            window: 'ch2_ch3',
            purpose: 'Give the erased dead a curse-compressed body without reducing them to one honored corpse or generic undead ruler.',
            status: 'concept_accepted_route_paused'
        }),
        Object.freeze({
            key: 'expedition_supreme_commander',
            runtimeBossId: null,
            window: 'ch5_ch6',
            purpose: 'Reveal the expedition history that mandatory records can only approach from outside.',
            status: 'pending_story_design'
        }),
        Object.freeze({
            key: 'ash_baron_external',
            runtimeBossId: 'ash_baron',
            window: 'ch3_ch4',
            purpose: 'Expose freight rights, ash contracts, and regional exploitation.',
            status: 'legacy_runtime_requires_rewrite'
        }),
        Object.freeze({
            key: 'entropy_balance_external',
            runtimeBossId: null,
            window: 'after_ch5_elemental_lord',
            purpose: 'Manifest the violent balancing response left when four ordinary elements lose mutual restraint.',
            status: 'concept_accepted_route_paused'
        }),
        Object.freeze({
            key: 'light_trial_external',
            runtimeBossId: 'aurora_archon',
            window: 'ch6',
            purpose: 'Introduce formal light and a weapon-form-neutral method for revealing the Chapter 7 Void target.',
            status: 'concept_accepted_existing_runtime_requires_story_unlock'
        }),
        Object.freeze({
            key: 'void_revelation_external',
            runtimeBossId: null,
            existingCandidateId: 'tower_void_king',
            window: 'post_true_ending',
            purpose: 'Reveal the creditor and Void cosmology before later DLC extends the rebuilt tower.',
            status: 'pending_story_and_tower_rewrite'
        })
    ]),
    dlcBoundary: 'DLC continues the post-reveal light, Void, and tower world; first external resolutions remain in the base game.',
    pauseRule: 'Do not expand second-run routes, lore, encounters, rewards, flags, or art before the first-run resume gate passes.'
});

export const ChapterQuestPausedSystems = Object.freeze({
    combat: {
        status: ChapterFrameworkStatus.PAUSED,
        reason: 'Combat redesign is intentionally deferred until town, quest, reward, and source placement are stable.'
    },
    tower: {
        status: ChapterFrameworkStatus.PAUSED,
        reason: 'Tower content will be rebuilt later and should not receive monsters, equipment, or art in this pass.'
    }
});

export function getChapterQuestFrame(chapter) {
    const numericChapter = Number(chapter);
    return ChapterQuestFramework.find(frame => frame.chapter === numericChapter) || null;
}

export function getChapterFrameByLevel(level) {
    const numericLevel = Number(level);
    if (!Number.isFinite(numericLevel)) return null;
    return ChapterQuestFramework.find(frame =>
        numericLevel >= frame.levelRange[0] && numericLevel <= frame.levelRange[1]
    ) || null;
}

export function getLevelBandQuestFrame(level) {
    const numericLevel = Number(level);
    if (!Number.isFinite(numericLevel)) return null;
    return LevelBandQuestFramework.find(frame =>
        numericLevel >= frame.levelRange[0] && numericLevel <= frame.levelRange[1]
    ) || null;
}
