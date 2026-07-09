/**
 * QuestSpineFramework.js
 * Canonical planning layer for the main quest route.
 *
 * This file is intentionally separate from Quests.js. It gives the project a
 * seven-chapter spine without changing the currently playable quest chain.
 * After the spine is approved, Quests.js can be moved chapter by chapter.
 */

export const QuestSpineStatus = Object.freeze({
    LIVE_EXISTING: 'live_existing',
    NEEDS_REORDER: 'needs_reorder',
    NEEDS_RECHAPTER: 'needs_rechapter',
    NEEDS_RETARGET: 'needs_retarget',
    NEEDS_REWARD_PASS: 'needs_reward_pass',
    PLANNED_GAP: 'planned_gap'
});

export const QuestSpineRole = Object.freeze({
    TOWN_ANCHOR: 'town_anchor',
    ROUTE_PROBE: 'route_probe',
    SURVIVAL_PRESSURE: 'survival_pressure',
    FORGE_PREPARATION: 'forge_preparation',
    BOSS_CLUE: 'boss_clue',
    BOSS_GATE: 'boss_gate',
    BOSS_CONVERGENCE: 'boss_convergence',
    OPTIONAL_BOSS: 'optional_boss',
    DUNGEON_BRIDGE: 'dungeon_bridge',
    CHAPTER_BRIDGE: 'chapter_bridge',
    PLANNED_SLOT: 'planned_slot'
});

export const QuestMeaningBeat = Object.freeze({
    BIG_GOAL: 'big_goal',
    ROUTE_EXPLORATION: 'route_exploration',
    INFORMATION_CLUES: 'information_clues',
    EQUIPMENT_PRESSURE: 'equipment_pressure',
    TOWN_STATE_SHIFT: 'town_state_shift',
    BOSS_CONVERGENCE: 'boss_convergence',
    SIDE_STORY_DUNGEON: 'side_story_dungeon',
    REWARD_REROUTE: 'reward_reroute'
});

export const DungeonSpineMode = Object.freeze({
    SIDE_STORY_SUPPLEMENT: 'side_story_supplement',
    OPTIONAL_SUPPORT: 'optional_support',
    PLANNED_GAP: 'planned_gap'
});

export const QuestSpineChapters = Object.freeze([
    {
        chapter: 1,
        levelRange: [1, 10],
        titleKey: 'south_road_recovery',
        intent: 'Teach route reading, early survival pressure, first forge loop, and the first boss convergence.',
        mainBossId: 'forest_guardian',
        optionalBossIds: ['ambush_mantis', 'blood_moon_stag'],
        townStateGoal: 'The town learns the south road is usable again, but not safe.',
        mapGoal: 'Town watchpost plus nearby clues reveal the first route pocket.',
        dungeonGoal: 'Cave access becomes the first optional pressure valve after the route is understood.',
        dungeonIntegration: {
            mode: DungeonSpineMode.SIDE_STORY_SUPPLEMENT,
            note: 'Cave content can echo the south road problem, but the main route should stand without requiring dungeon clears.'
        },
        meaningBeats: [
            QuestMeaningBeat.BIG_GOAL,
            QuestMeaningBeat.ROUTE_EXPLORATION,
            QuestMeaningBeat.INFORMATION_CLUES,
            QuestMeaningBeat.EQUIPMENT_PRESSURE,
            QuestMeaningBeat.TOWN_STATE_SHIFT,
            QuestMeaningBeat.BOSS_CONVERGENCE,
            QuestMeaningBeat.SIDE_STORY_DUNGEON,
            QuestMeaningBeat.REWARD_REROUTE
        ],
        rewardGoal: 'Rusty sword starts the loop; quest materials should not replace monster farming.',
        status: QuestSpineStatus.LIVE_EXISTING
    },
    {
        chapter: 2,
        levelRange: [11, 20],
        titleKey: 'bell_water_and_seals',
        intent: 'Shift from direct extermination to clue following: old water, bell traces, and sealed dead routes.',
        mainBossId: 'drowned_oracle',
        optionalBossIds: ['lich'],
        townStateGoal: 'The town starts treating outside reports as evidence, not errands.',
        mapGoal: 'Water and tomb clues split into two recoverable routes.',
        dungeonGoal: 'Snow and ruin dungeons should become useful preparation, not required filler.',
        dungeonIntegration: {
            mode: DungeonSpineMode.SIDE_STORY_SUPPLEMENT,
            note: 'Dungeons can deepen water, seal, and ruin stories, but should not replace the core clue route.'
        },
        meaningBeats: [
            QuestMeaningBeat.BIG_GOAL,
            QuestMeaningBeat.ROUTE_EXPLORATION,
            QuestMeaningBeat.INFORMATION_CLUES,
            QuestMeaningBeat.EQUIPMENT_PRESSURE,
            QuestMeaningBeat.TOWN_STATE_SHIFT,
            QuestMeaningBeat.BOSS_CONVERGENCE,
            QuestMeaningBeat.SIDE_STORY_DUNGEON,
            QuestMeaningBeat.REWARD_REROUTE
        ],
        rewardGoal: 'Rewards support access and repair pressure without overfeeding crafting materials.',
        status: QuestSpineStatus.LIVE_EXISTING
    },
    {
        chapter: 3,
        levelRange: [21, 30],
        titleKey: 'black_iron_supply_line',
        intent: 'Make town supply, black iron, and smuggling pressure the chapter problem before the boss.',
        mainBossId: 'ash_baron',
        optionalBossIds: [],
        townStateGoal: 'Town services should visibly depend on repaired supply lines.',
        mapGoal: 'Storehouse and keep routes create the first clear mid-game wall.',
        dungeonGoal: 'Ruins can provide non-series equipment and repair pressure relief.',
        dungeonIntegration: {
            mode: DungeonSpineMode.SIDE_STORY_SUPPLEMENT,
            note: 'Dungeon rewards can support black-iron preparation, but the supply-line story remains the main chapter spine.'
        },
        meaningBeats: [
            QuestMeaningBeat.BIG_GOAL,
            QuestMeaningBeat.ROUTE_EXPLORATION,
            QuestMeaningBeat.INFORMATION_CLUES,
            QuestMeaningBeat.EQUIPMENT_PRESSURE,
            QuestMeaningBeat.TOWN_STATE_SHIFT,
            QuestMeaningBeat.BOSS_CONVERGENCE,
            QuestMeaningBeat.SIDE_STORY_DUNGEON,
            QuestMeaningBeat.REWARD_REROUTE
        ],
        rewardGoal: 'The player should need better gear decisions before the boss.',
        status: QuestSpineStatus.NEEDS_RECHAPTER
    },
    {
        chapter: 4,
        levelRange: [31, 40],
        titleKey: 'thorn_bargain',
        intent: 'Use thorn and poison bargains as the first chapter where build identity starts to matter.',
        mainBossId: 'thorn_witch',
        optionalBossIds: [],
        townStateGoal: 'NPC requests should feel like consequences of strange trade routes.',
        mapGoal: 'The thorn route needs clues, an entry condition, and a boss gate before art expansion.',
        dungeonGoal: 'Jungle dungeon should connect to special equipment rather than generic loot.',
        dungeonIntegration: {
            mode: DungeonSpineMode.SIDE_STORY_SUPPLEMENT,
            note: 'Jungle dungeon can provide non-series equipment and background pressure once the thorn route is approved.'
        },
        meaningBeats: [
            QuestMeaningBeat.BIG_GOAL,
            QuestMeaningBeat.ROUTE_EXPLORATION,
            QuestMeaningBeat.INFORMATION_CLUES,
            QuestMeaningBeat.EQUIPMENT_PRESSURE,
            QuestMeaningBeat.TOWN_STATE_SHIFT,
            QuestMeaningBeat.BOSS_CONVERGENCE,
            QuestMeaningBeat.SIDE_STORY_DUNGEON,
            QuestMeaningBeat.REWARD_REROUTE
        ],
        rewardGoal: 'Poison/nature route rewards must be planned carefully to avoid stat inflation.',
        status: QuestSpineStatus.NEEDS_REORDER
    },
    {
        chapter: 5,
        levelRange: [41, 50],
        titleKey: 'dragon_heat_route',
        intent: 'Turn dragon evidence into a long preparation chapter with stronger equipment expectations.',
        mainBossId: 'elder_dragon',
        optionalBossIds: [],
        townStateGoal: 'The town should prepare for evacuation and heat damage.',
        mapGoal: 'Dragon watch, heat crag, and obelisk routes form the convergence chain.',
        dungeonGoal: 'Dungeon rewards should offer non-series alternatives for dragon preparation.',
        dungeonIntegration: {
            mode: DungeonSpineMode.SIDE_STORY_SUPPLEMENT,
            note: 'Dungeons can offer special preparation routes, but dragon evidence remains the chapter driver.'
        },
        meaningBeats: [
            QuestMeaningBeat.BIG_GOAL,
            QuestMeaningBeat.ROUTE_EXPLORATION,
            QuestMeaningBeat.INFORMATION_CLUES,
            QuestMeaningBeat.EQUIPMENT_PRESSURE,
            QuestMeaningBeat.TOWN_STATE_SHIFT,
            QuestMeaningBeat.BOSS_CONVERGENCE,
            QuestMeaningBeat.SIDE_STORY_DUNGEON,
            QuestMeaningBeat.REWARD_REROUTE
        ],
        rewardGoal: 'Legendary wording and recipe names should support a more poetic dragon tier.',
        status: QuestSpineStatus.LIVE_EXISTING
    },
    {
        chapter: 6,
        levelRange: [51, 60],
        titleKey: 'abyss_breach',
        intent: 'Late-game pressure where void, abyss, and survival penalties punish weak builds.',
        mainBossId: 'demon_lord_asariel',
        optionalBossIds: [],
        townStateGoal: 'The town becomes a defended shelter rather than a neutral hub.',
        mapGoal: 'Abyss breach route should replace old death-zone language.',
        dungeonGoal: 'Hell dungeon should become a route-specific source of special equipment.',
        dungeonIntegration: {
            mode: DungeonSpineMode.SIDE_STORY_SUPPLEMENT,
            note: 'Hell dungeon can carry side-story danger and special equipment, while the abyss breach remains the main route.'
        },
        meaningBeats: [
            QuestMeaningBeat.BIG_GOAL,
            QuestMeaningBeat.ROUTE_EXPLORATION,
            QuestMeaningBeat.INFORMATION_CLUES,
            QuestMeaningBeat.EQUIPMENT_PRESSURE,
            QuestMeaningBeat.TOWN_STATE_SHIFT,
            QuestMeaningBeat.BOSS_CONVERGENCE,
            QuestMeaningBeat.SIDE_STORY_DUNGEON,
            QuestMeaningBeat.REWARD_REROUTE
        ],
        rewardGoal: 'Rewards should support late repair and focused build refinement, not free power.',
        status: QuestSpineStatus.LIVE_EXISTING
    },
    {
        chapter: 7,
        levelRange: [61, 70],
        titleKey: 'light_void_convergence',
        intent: 'Final chapter is deliberately unimplemented until the route, boss, drops, and art plan are approved.',
        mainBossId: null,
        optionalBossIds: [],
        plannedBossSlot: 'glimmer_light_final',
        townStateGoal: 'Final town state should show accumulated recovery and the cost of the last route.',
        mapGoal: 'Create only after chapter seven route logic is approved.',
        dungeonGoal: 'Any final dungeon route needs its own loot identity before content is added.',
        dungeonIntegration: {
            mode: DungeonSpineMode.PLANNED_GAP,
            note: 'No final dungeon should be created until the chapter seven route, boss, and reward identity are approved.'
        },
        meaningBeats: [
            QuestMeaningBeat.BIG_GOAL,
            QuestMeaningBeat.ROUTE_EXPLORATION,
            QuestMeaningBeat.INFORMATION_CLUES,
            QuestMeaningBeat.EQUIPMENT_PRESSURE,
            QuestMeaningBeat.TOWN_STATE_SHIFT,
            QuestMeaningBeat.BOSS_CONVERGENCE,
            QuestMeaningBeat.SIDE_STORY_DUNGEON,
            QuestMeaningBeat.REWARD_REROUTE
        ],
        rewardGoal: 'Do not add new final-tier materials or bosses without a matching content plan.',
        status: QuestSpineStatus.PLANNED_GAP
    }
]);

export const MainQuestSpineNodes = Object.freeze([
    {
        questId: 'main_001',
        plannedChapter: 1,
        role: QuestSpineRole.TOWN_ANCHOR,
        status: QuestSpineStatus.NEEDS_REWARD_PASS,
        mapNodeIds: ['south_gate_farmland'],
        bossThreadIds: [],
        notes: 'Keep as the opening handrail. Reward pass should avoid giving extra materials beyond the intended rusty sword start.'
    },
    {
        questId: 'main_002',
        plannedChapter: 1,
        role: QuestSpineRole.SURVIVAL_PRESSURE,
        status: QuestSpineStatus.LIVE_EXISTING,
        mapNodeIds: ['south_gate_farmland'],
        bossThreadIds: [],
        notes: 'First farming pressure. Slime drops should teach the material loop more than quest rewards do.'
    },
    {
        questId: 'main_003',
        plannedChapter: 1,
        role: QuestSpineRole.BOSS_CLUE,
        status: QuestSpineStatus.LIVE_EXISTING,
        mapNodeIds: ['hunter_boardwalk', 'old_campfire_site', 'cut_roadsign'],
        bossThreadIds: ['ambush_mantis'],
        notes: 'This quest now turns the slime anomaly into route clues and a silver-thread bait, without requiring the blacksmith before he is staged into town.'
    },
    {
        questId: 'main_004',
        plannedChapter: 1,
        role: QuestSpineRole.OPTIONAL_BOSS,
        status: QuestSpineStatus.LIVE_EXISTING,
        mapNodeIds: ['hunter_boardwalk', 'cut_roadsign', 'silver_snare_pass'],
        bossThreadIds: ['ambush_mantis'],
        linkedBossId: 'ambush_mantis',
        notes: 'Optional boss pressure teaches route clues before the first main convergence.'
    },
    {
        questId: 'main_005',
        plannedChapter: 1,
        role: QuestSpineRole.BOSS_CONVERGENCE,
        status: QuestSpineStatus.LIVE_EXISTING,
        mapNodeIds: ['broken_horn_camp', 'rotroot_ravine', 'old_wolf_den'],
        bossThreadIds: ['forest_guardian'],
        linkedBossId: 'forest_guardian',
        notes: 'Chapter one main boss convergence.'
    },
    {
        questId: 'main_006',
        plannedChapter: 1,
        role: QuestSpineRole.CHAPTER_BRIDGE,
        status: QuestSpineStatus.NEEDS_REWARD_PASS,
        mapNodeIds: ['moon_moss_slope'],
        bossThreadIds: ['blood_moon_stag'],
        linkedBossId: 'blood_moon_stag',
        notes: 'Works better as optional bridge pressure plus dungeon/cave unlock, not as a hard chapter endpoint.'
    },
    {
        questId: 'main_007',
        plannedChapter: 2,
        role: QuestSpineRole.ROUTE_PROBE,
        status: QuestSpineStatus.NEEDS_RETARGET,
        mapNodeIds: ['mist_tablet_hill'],
        bossThreadIds: ['lich', 'drowned_oracle'],
        notes: 'Replace high-zone targets with route-node clue targets during the runtime pass.'
    },
    {
        questId: 'main_009',
        plannedChapter: 2,
        role: QuestSpineRole.BOSS_CONVERGENCE,
        status: QuestSpineStatus.LIVE_EXISTING,
        mapNodeIds: ['drowned_bell_coast', 'sunken_altar_reef'],
        bossThreadIds: ['drowned_oracle'],
        linkedBossId: 'drowned_oracle',
        notes: 'Chapter two main boss convergence.'
    },
    {
        questId: 'main_010',
        plannedChapter: 2,
        role: QuestSpineRole.OPTIONAL_BOSS,
        status: QuestSpineStatus.LIVE_EXISTING,
        mapNodeIds: ['mist_tablet_hill', 'opened_ancient_tomb'],
        bossThreadIds: ['lich'],
        linkedBossId: 'lich',
        notes: 'Optional seal boss can deepen chapter two without blocking the whole route.'
    },
    {
        questId: 'main_011',
        plannedChapter: 3,
        role: QuestSpineRole.BOSS_CONVERGENCE,
        status: QuestSpineStatus.NEEDS_RECHAPTER,
        mapNodeIds: ['obsidian_keep_gate', 'black_iron_storehouse'],
        bossThreadIds: ['ash_baron'],
        linkedBossId: 'ash_baron',
        notes: 'Move from current chapter two into planned chapter three during runtime quest reorder.'
    },
    {
        questId: 'main_008',
        plannedChapter: 4,
        role: QuestSpineRole.BOSS_CONVERGENCE,
        status: QuestSpineStatus.NEEDS_REORDER,
        mapNodeIds: ['thorn_glasshouse_ruin'],
        bossThreadIds: ['thorn_witch'],
        linkedBossId: 'thorn_witch',
        notes: 'Currently appears too early. It should become chapter four after route and reward design are approved.'
    },
    {
        questId: 'main_012',
        plannedChapter: 5,
        role: QuestSpineRole.BOSS_GATE,
        status: QuestSpineStatus.NEEDS_RECHAPTER,
        mapNodeIds: ['northern_drake_watch', 'dragon_heat_crag'],
        bossThreadIds: ['elder_dragon'],
        notes: 'Dragon preparation quest. Current chapter three value is a temporary implementation detail.'
    },
    {
        questId: 'main_013',
        plannedChapter: 5,
        role: QuestSpineRole.BOSS_CONVERGENCE,
        status: QuestSpineStatus.NEEDS_RECHAPTER,
        mapNodeIds: ['charred_obelisk'],
        bossThreadIds: ['elder_dragon'],
        linkedBossId: 'elder_dragon',
        notes: 'Chapter five dragon boss convergence.'
    },
    {
        questId: 'main_014',
        plannedChapter: 6,
        role: QuestSpineRole.BOSS_GATE,
        status: QuestSpineStatus.NEEDS_RECHAPTER,
        mapNodeIds: ['abyssal_seal_break'],
        bossThreadIds: ['demon_lord_asariel'],
        notes: 'Abyss preparation quest. Replace old death-zone target text during runtime pass.'
    },
    {
        questId: 'main_015',
        plannedChapter: 6,
        role: QuestSpineRole.BOSS_CONVERGENCE,
        status: QuestSpineStatus.NEEDS_RECHAPTER,
        mapNodeIds: ['abyssal_seal_break'],
        bossThreadIds: ['demon_lord_asariel'],
        linkedBossId: 'demon_lord_asariel',
        notes: 'Chapter six abyss boss convergence.'
    },
    {
        plannedQuestId: 'main_016+',
        plannedChapter: 7,
        role: QuestSpineRole.PLANNED_SLOT,
        status: QuestSpineStatus.PLANNED_GAP,
        mapNodeIds: [],
        bossThreadIds: [],
        linkedBossId: null,
        notes: 'Chapter seven requires approved boss, route, drops, materials, and art plan before implementation.'
    }
]);

export const QuestSpineGaps = Object.freeze([
    {
        id: 'runtime_chapter_values',
        status: QuestSpineStatus.NEEDS_RECHAPTER,
        summary: 'Quests.js still uses the old chapter 1-3 implementation. Do not change it until the spine is approved.'
    },
    {
        id: 'main_008_order_conflict',
        status: QuestSpineStatus.NEEDS_REORDER,
        summary: 'Thorn Witch currently appears before Drowned Oracle and Ash Baron, but the seven-chapter spine places it in chapter four.'
    },
    {
        id: 'old_zone_objectives',
        status: QuestSpineStatus.NEEDS_RETARGET,
        summary: 'Objective targets such as low, medium, high, and death should become landmark or route-clue targets.'
    },
    {
        id: 'reward_material_overfeed',
        status: QuestSpineStatus.NEEDS_REWARD_PASS,
        summary: 'Main and commission rewards still need a pass so monster farming remains meaningful.'
    },
    {
        id: 'chapter_seven_content',
        status: QuestSpineStatus.PLANNED_GAP,
        summary: 'Chapter seven intentionally has no concrete boss or quest yet.'
    },
    {
        id: 'town_state_resolver',
        status: QuestSpineStatus.PLANNED_GAP,
        summary: 'Town changes need a resolver that reads quest completion, landmark state, and chapter progress.'
    }
]);

export function getQuestSpineChapter(chapter) {
    const numericChapter = Number(chapter);
    return QuestSpineChapters.find(entry => entry.chapter === numericChapter) || null;
}

export function getQuestSpineNode(questId) {
    return MainQuestSpineNodes.find(node => node.questId === questId || node.plannedQuestId === questId) || null;
}

export function getQuestSpineNodesByChapter(chapter) {
    const numericChapter = Number(chapter);
    return MainQuestSpineNodes.filter(node => node.plannedChapter === numericChapter);
}

export function getQuestSpineNodesByBoss(bossId) {
    if (!bossId) return [];
    return MainQuestSpineNodes.filter(node =>
        node.linkedBossId === bossId || (node.bossThreadIds || []).includes(bossId)
    );
}

export function getQuestSpineCoverageSummary() {
    return QuestSpineChapters.map(chapter => {
        const nodes = getQuestSpineNodesByChapter(chapter.chapter);
        const implementedNodes = nodes.filter(node => node.questId);
        const bossNodes = nodes.filter(node => node.role === QuestSpineRole.BOSS_CONVERGENCE);
        const gapNodes = nodes.filter(node => node.status === QuestSpineStatus.PLANNED_GAP);

        return {
            chapter: chapter.chapter,
            titleKey: chapter.titleKey,
            levelRange: chapter.levelRange,
            mainBossId: chapter.mainBossId,
            meaningBeats: chapter.meaningBeats || [],
            dungeonMode: chapter.dungeonIntegration?.mode || null,
            nodeCount: nodes.length,
            implementedCount: implementedNodes.length,
            bossConvergenceCount: bossNodes.length,
            hasPlannedGap: gapNodes.length > 0 || chapter.status === QuestSpineStatus.PLANNED_GAP,
            statuses: [...new Set(nodes.map(node => node.status))]
        };
    });
}
