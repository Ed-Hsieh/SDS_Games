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
        title: '破門之後',
        subtitle: '城鎮不是大廳，而是剛撐住一口氣的避難所。',
        coreConflict: 'The player learns that monsters outside the south gate are only the surface of a wider collapse.',
        townFocus: [
            'south_gate_first_repair',
            'apothecary_counter_reopens',
            'first_npc_returns',
            'basic_route_safety'
        ],
        questBeats: [
            'Establish the broken town and missing services.',
            'Make the first repaired route visibly useful.',
            'Let the elder, blacksmith, herbalist, and gate defenders become people before they become menus.'
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
        title: '霧碑與沉鐘',
        subtitle: '道路、海岸、廢墟與補給線開始把城鎮拉向外界。',
        coreConflict: 'The player discovers that routes and supplies are narrative power, not only travel convenience.',
        townFocus: [
            'market_supply_line',
            'rumor_board_network',
            'apothecary_stock_growth',
            'first_forge_service'
        ],
        questBeats: [
            'Connect route repair to stock changes and map confidence.',
            'Introduce non-town threats through coast, bell, and ruin clues.',
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
        title: '黑鐵與暗影前兆',
        subtitle: '暗影不是虛空本體，而是讓玩家提早感到不對勁的弱前置。',
        coreConflict: 'Shadow soldiers and black-iron routes make the player choose between stable preparation and risky shortcuts.',
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
        title: '四相裂線',
        subtitle: '冰、火、雷、毒各自成為一條可準備、可針對的威脅線。',
        coreConflict: 'The player sees that preparation route choice matters against parallel elemental fronts.',
        townFocus: [
            'elemental_stock',
            'route_based_market_supply',
            'forge_countergear',
            'rumor_board_elite_warnings'
        ],
        questBeats: [
            'Let each element have clear monster, material, and equipment identity.',
            'Make town services offer different solutions instead of one optimal path.',
            'Use side quests to seed dungeon-specific preparation.'
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
        title: '龍脈與遠征契約',
        subtitle: '城鎮不只是恢復，而是開始替高難度遠征生產選擇。',
        coreConflict: 'Elite preparation, advanced forge contracts, and route control become the core power loop.',
        townFocus: [
            'advanced_forge_contracts',
            'dungeon_supply_contracts',
            'elite_material_requests',
            'specialized_market_orders'
        ],
        questBeats: [
            'Move the blacksmith and supply network from repair into specialization.',
            'Use elite monsters as serious resource and equipment targets.',
            'Make long side quests unlock distinctive preparation tools.'
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
        id: 'chapter_06_abyssal_bargains',
        chapter: 6,
        levelRange: [51, 60],
        title: '深淵交易',
        subtitle: '虛空壓力逼近，捷徑開始真的有代價。',
        coreConflict: 'The player weighs forbidden power, casino pressure, black-market help, and town trust.',
        townFocus: [
            'forbidden_material_exchange',
            'casino_owner_route_pressure',
            'black_market_debt_echo',
            'void_precursor_preparation'
        ],
        questBeats: [
            'Let risky third-party sources become tempting but consequential.',
            'Escalate shadow into void pressure without fully turning every shadow item into void.',
            'Make town trust and supply reliability visible in late preparation.'
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
        elementPressure: ['void', 'abyss', 'late_shadow'],
        townUnlocks: ['forbidden_stock', 'casino_owner_resolution_hooks', 'void_warning_routes'],
        dungeonRole: 'Dungeons can require specialized preparation, but tower content remains out of scope.',
        implementationNotes: 'Use durable consequences only. Do not add fake moral branches.'
    },
    {
        id: 'chapter_07_glimmer_becomes_light',
        chapter: 7,
        levelRange: [61, 70],
        title: '微光成明',
        subtitle: '微光不進化成光明裝備，但會把玩家帶到真正的光明副本前。',
        coreConflict: 'The town becomes a final staging ground for light pressure and future tower counterplay.',
        townFocus: [
            'radiant_chapel_foundation',
            'glimmer_to_light_story_bridge',
            'terminal_supply_line',
            'final_preparation_routes'
        ],
        questBeats: [
            'Use glimmer as the narrative bridge toward light.',
            'Build the Lv70 radiant dungeon route as counterweight to future tower pressure.',
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
        elementPressure: ['glimmer', 'light', 'late_void_counter'],
        townUnlocks: ['radiant_corridor_route', 'glimmer_light_preparation', 'terminal_town_state'],
        dungeonRole: 'Radiant dungeon exists to prepare the player for future tower rewrite, but the tower itself is paused.',
        implementationNotes: 'Do not build tower monsters, tower equipment, or tower reward images in this pass.'
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
        id: 'lv_51_60_abyss_void_pressure',
        levelRange: [51, 60],
        chapter: 6,
        title: 'Abyss And Void Pressure',
        expectedMonsterRole: 'late shadow and void-adjacent threats',
        expectedEquipmentRole: 'forbidden, casino, dungeon, and high-risk preparation gear',
        expectedMaterialRole: 'void-adjacent materials remain controlled and consequential'
    },
    {
        id: 'lv_61_70_glimmer_light_bridge',
        levelRange: [61, 70],
        chapter: 7,
        title: 'Glimmer To Light',
        expectedMonsterRole: 'radiant-route threats and terminal preparation enemies',
        expectedEquipmentRole: 'light preparation gear and radiant dungeon rewards',
        expectedMaterialRole: 'glimmer bridge materials and true light dungeon materials'
    }
]);

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
