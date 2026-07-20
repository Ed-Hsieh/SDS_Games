/**
 * ChapterRegionRegistry.js
 * Authoritative desktop adventure-map topology for the seven-chapter campaign.
 * Geography and story triggers are fixed. Randomness is limited to encounters
 * selected while the player traverses an authored route segment.
 */

export const RegionLocationKind = Object.freeze({
    ENTRY: 'entry',
    LANDMARK: 'landmark',
    CAMP: 'camp',
    SIDE_ROUTE: 'side_route',
    BOSS_ARENA: 'boss_arena',
    STORY_TRANSITION: 'story_transition'
});

export const RegionSceneTrigger = Object.freeze({
    REGION_ENTRY: 'region_entry',
    SEGMENT_ENTER: 'segment_enter',
    LOCATION_ENTER: 'location_enter',
    LOCATION_INSPECT: 'location_inspect',
    BOSS_CONVERGENCE: 'boss_convergence',
    RETURN_ROUTE: 'return_route'
});

const bounds = Object.freeze({ cols: 48, rows: 32 });
const cameraBounds = Object.freeze({ minX: 0, minY: 0, maxX: 48, maxY: 32 });

function segment(id, from, to, path, options = {}) {
    return Object.freeze({
        id,
        from,
        to,
        path,
        width: options.width || 2,
        terrain: options.terrain || 'road',
        fatiguePerCell: options.fatiguePerCell ?? 1,
        encounterTableId: options.encounterTableId || null,
        optional: Boolean(options.optional),
        prerequisites: options.prerequisites || []
    });
}

function location(id, name, kind, x, y, options = {}) {
    return Object.freeze({
        id,
        name,
        kind,
        position: Object.freeze({ x, y }),
        icon: options.icon || '◇',
        mapHint: options.mapHint || '靠近後才能確認這個地點。',
        arrival: options.arrival || '',
        repeat: options.repeat || options.arrival || '',
        sceneIds: Object.freeze(options.sceneIds || []),
        bossId: options.bossId || null,
        optional: Boolean(options.optional),
        imageId: options.imageId || null,
        prerequisites: Object.freeze(options.prerequisites || []),
        assetStatus: options.assetStatus || 'pending_after_screenplay_lock'
    });
}

function binding(sceneId, stageClass, targetId, trigger, options = {}) {
    return Object.freeze({
        sceneId,
        stageClass,
        targetId,
        trigger,
        runCondition: options.runCondition || 'any',
        prerequisites: Object.freeze(options.prerequisites || []),
        resultingFlags: Object.freeze(options.resultingFlags || [])
    });
}

function region(config) {
    return Object.freeze({
        ...config,
        worldBounds: bounds,
        cameraBounds,
        fogMask: Object.freeze({
            persistence: 'current_run',
            initialRevealRadius: 1,
            discoveredMarker: 'location_thumbnail',
            undiscoveredMarker: 'black_question_square'
        })
    });
}

export const ChapterRegionRegistry = Object.freeze({
    chapter_01_south_gate: region({
        regionId: 'chapter_01_south_gate',
        chapter: 1,
        levelBand: [1, 10],
        title: '南門以外',
        encounterBand: 'chapter_01',
        visual: Object.freeze({
            mode: 'continuous_overworld_tile',
            tileId: 'south_gate_borderland',
            backgroundId: 'overworld_south_gate',
            mapTitle: '南門外林地',
            subtitle: '第一區域',
            grade: 'chapter_01_borderland',
            renderRoutes: false,
            renderBoundary: false
        }),
        entryNodes: ['south_gate_entry'],
        exitNodes: ['south_gate_entry'],
        routeSegments: Object.freeze([
            segment('collapsed_approach', 'south_gate_entry', 'south_gate_farmland', [[6, 16], [15, 16]], { terrain: 'broken_road', encounterTableId: 'ch1_road' }),
            segment('three_marks_north', 'south_gate_farmland', 'hunter_boardwalk', [[15, 16], [28, 8]], { terrain: 'farmland_edge', encounterTableId: 'ch1_woodland' }),
            segment('three_marks_south', 'south_gate_farmland', 'old_campfire_site', [[15, 16], [29, 24]], { terrain: 'wet_road', encounterTableId: 'ch1_woodland' }),
            segment('silver_thread_branch', 'hunter_boardwalk', 'silver_snare_pass', [[28, 8], [34, 10], [39, 9]], { terrain: 'cut_boardwalk', encounterTableId: 'ch1_ambush', optional: false }),
            segment('rotroot_salvage_spur', 'rotroot_ravine', 'rotroot_salvage', [[35, 19], [36, 12], [37, 5]], { terrain: 'raised_roots', encounterTableId: 'ch1_rotroot', optional: true }),
            segment('rootwatch_spur', 'rotroot_ravine', 'rootwatch_grove', [[35, 19], [38, 23], [40, 27]], { terrain: 'root_grove', encounterTableId: 'ch1_rotroot_elite', optional: true }),
            segment('forest_reaction_route', 'old_campfire_site', 'old_wolf_den', [[29, 24], [35, 19], [42, 19]], { terrain: 'rotroot_woodland', encounterTableId: 'ch1_forest' })
        ]),
        locationNodes: Object.freeze([
            location('south_gate_entry', '南門入口', RegionLocationKind.ENTRY, 6, 16, { sceneIds: ['ch1_s01_road_collapse'] }),
            location('south_gate_farmland', '南門農田', RegionLocationKind.LANDMARK, 15, 16, { imageId: 'south_gate_farmland', sceneIds: ['ch1_s06_three_landmarks'] }),
            location('hunter_boardwalk', '獵人棧道', RegionLocationKind.LANDMARK, 28, 8, { imageId: 'hunter_boardwalk', sceneIds: ['ch1_s06_three_landmarks'] }),
            location('old_campfire_site', '舊營火點', RegionLocationKind.CAMP, 29, 24, { imageId: 'old_campfire_site', sceneIds: ['ch1_s06_three_landmarks'] }),
            location('silver_snare_pass', '銀絲伏道', RegionLocationKind.SIDE_ROUTE, 39, 9, { imageId: 'silver_snare_pass', sceneIds: ['ch1_s07_silver_snare'], bossId: 'ambush_mantis' }),
            location('rotroot_ravine', '腐根溪谷', RegionLocationKind.LANDMARK, 35, 19, { imageId: 'rotroot_ravine', sceneIds: ['ch1_s09_rotroot_approach'] }),
            location('rotroot_salvage', '腐根補給岔路', RegionLocationKind.SIDE_ROUTE, 37, 5, { imageId: 'rotroot_ravine', sceneIds: [] }),
            location('rootwatch_grove', '根哨林隙', RegionLocationKind.SIDE_ROUTE, 40, 27, { imageId: 'rotroot_ravine', sceneIds: [], bossId: 'treant' }),
            location('old_wolf_den', '古樹根心', RegionLocationKind.BOSS_ARENA, 42, 19, { imageId: 'old_wolf_den', sceneIds: ['ch1_s10_forest_guardian'], bossId: 'forest_guardian' })
        ]),
        sceneBindings: Object.freeze([
            binding('ch1_s01_road_collapse', 'regional_canvas', 'collapsed_approach', RegionSceneTrigger.REGION_ENTRY),
            binding('ch1_s06_three_landmarks', 'regional_canvas', 'three_marks_north', RegionSceneTrigger.SEGMENT_ENTER),
            binding('ch1_s07_silver_snare', 'location_scene', 'silver_snare_pass', RegionSceneTrigger.LOCATION_ENTER),
            binding('ch1_s09_rotroot_approach', 'regional_canvas', 'forest_reaction_route', RegionSceneTrigger.SEGMENT_ENTER),
            binding('ch1_s10_forest_guardian', 'location_scene', 'old_wolf_den', RegionSceneTrigger.BOSS_CONVERGENCE)
        ]),
        bossConvergence: Object.freeze({ bossId: 'forest_guardian', locationId: 'old_wolf_den', sceneId: 'ch1_s10_forest_guardian' }),
        returnState: Object.freeze({ townEntryPlaceId: 'gate', afterSceneId: 'ch1_s10_forest_guardian' })
    }),

    chapter_02_broken_evacuations: region({
        regionId: 'chapter_02_broken_evacuations',
        chapter: 2,
        levelBand: [11, 20],
        title: '斷路上的藥味',
        encounterBand: 'chapter_02',
        visual: Object.freeze({
            mode: 'continuous_overworld_tile',
            tileId: 'broken_evacuation_basin',
            backgroundId: 'overworld_evacuation_basin',
            mapTitle: '斷裂撤離盆地',
            subtitle: '第二區域',
            grade: 'chapter_02_evacuation_basin',
            renderRoutes: false,
            renderBoundary: false
        }),
        entryNodes: ['evacuation_road_entry'],
        exitNodes: ['evacuation_road_entry'],
        routeSegments: Object.freeze([
            segment('mist_tablet_road', 'evacuation_road_entry', 'mist_tablet_hill', [[3, 18], [17, 17]], { terrain: 'mist_road', encounterTableId: 'ch2_road' }),
            segment('moon_migration_branch', 'mist_tablet_hill', 'moon_moss_slope', [[17, 17], [26, 8]], { terrain: 'moon_moss', encounterTableId: 'ch2_migration', optional: true }),
            segment('opened_tomb_road', 'mist_tablet_hill', 'opened_ancient_tomb', [[17, 17], [29, 17], [41, 17]], { terrain: 'ruin_road', encounterTableId: 'ch2_dead_route' }),
            segment('north_checkpoint_exit', 'opened_ancient_tomb', 'north_checkpoint_marker', [[41, 17], [44, 20], [45, 25]], { terrain: 'checkpoint_road', encounterTableId: 'ch2_north' })
        ]),
        locationNodes: Object.freeze([
            location('evacuation_road_entry', '斷裂撤離路', RegionLocationKind.ENTRY, 3, 18),
            location('mist_tablet_hill', '霧碑丘', RegionLocationKind.LANDMARK, 17, 17, { imageId: 'mist_tablet_hill', sceneIds: ['ch2_s04_mist_and_tomb_route'] }),
            location('moon_moss_slope', '月苔坡', RegionLocationKind.SIDE_ROUTE, 26, 8, { imageId: 'moon_moss_slope', sceneIds: ['ch2_s05_moon_moss_trace'], optional: true }),
            location('opened_ancient_tomb', '掘開古墓', RegionLocationKind.BOSS_ARENA, 41, 17, { imageId: 'opened_ancient_tomb', sceneIds: ['ch2_s06_keeper_of_names'], bossId: 'lich' }),
            location('north_checkpoint_marker', '北向廢棄關卡', RegionLocationKind.STORY_TRANSITION, 45, 25, { imageId: 'cut_roadsign', sceneIds: ['ch2_s08_shadow_at_the_checkpoint'] })
        ]),
        sceneBindings: Object.freeze([
            binding('ch2_s04_mist_and_tomb_route', 'regional_canvas', 'opened_tomb_road', RegionSceneTrigger.SEGMENT_ENTER),
            binding('ch2_s05_moon_moss_trace', 'location_scene', 'moon_moss_slope', RegionSceneTrigger.LOCATION_ENTER),
            binding('ch2_s06_keeper_of_names', 'location_scene', 'opened_ancient_tomb', RegionSceneTrigger.BOSS_CONVERGENCE),
            binding('ch2_s08_shadow_at_the_checkpoint', 'regional_canvas', 'north_checkpoint_exit', RegionSceneTrigger.RETURN_ROUTE)
        ]),
        bossConvergence: Object.freeze({ bossId: 'lich', locationId: 'opened_ancient_tomb', sceneId: 'ch2_s06_keeper_of_names' }),
        returnState: Object.freeze({ townEntryPlaceId: 'market', afterSceneId: 'ch2_s08_shadow_at_the_checkpoint' })
    }),

    chapter_03_shadow_watch: region({
        regionId: 'chapter_03_shadow_watch',
        chapter: 3,
        levelBand: [21, 30],
        title: '影子仍守夜',
        encounterBand: 'chapter_03',
        entryNodes: ['dead_checkpoint'],
        exitNodes: ['dead_checkpoint'],
        routeSegments: Object.freeze([
            segment('checkpoint_line', 'dead_checkpoint', 'night_watch_line', [[4, 18], [15, 18], [20, 12]], { terrain: 'abandoned_road', encounterTableId: 'ch3_checkpoint' }),
            segment('drowned_voice_branch', 'night_watch_line', 'sunken_altar_reef', [[20, 12], [27, 19], [33, 27]], { terrain: 'coastal_mud', encounterTableId: 'ch3_coast', optional: true }),
            segment('old_command_road', 'night_watch_line', 'old_command_post', [[20, 12], [29, 13], [37, 16]], { terrain: 'black_iron_road', encounterTableId: 'ch3_shadow' }),
            segment('held_breach', 'old_command_post', 'shadow_command_yard', [[37, 16], [43, 16]], { terrain: 'command_yard', encounterTableId: 'ch3_shadow_elite' })
        ]),
        locationNodes: Object.freeze([
            location('dead_checkpoint', '廢棄關卡', RegionLocationKind.ENTRY, 4, 18, { sceneIds: ['ch3_s01_dead_checkpoint'] }),
            location('night_watch_line', '霧中守夜線', RegionLocationKind.LANDMARK, 20, 12, { sceneIds: ['ch3_s03_lamp_oil_in_fog'] }),
            location('sunken_altar_reef', '浮出祭壇', RegionLocationKind.SIDE_ROUTE, 33, 27, { imageId: 'sunken_altar_reef', sceneIds: ['ch3_s06_drowned_voice'], bossId: 'drowned_oracle', optional: true }),
            location('old_command_post', '舊指揮所', RegionLocationKind.LANDMARK, 37, 16, { imageId: 'black_iron_storehouse', sceneIds: ['ch3_s07_old_command_post'] }),
            location('shadow_command_yard', '左線指揮場', RegionLocationKind.BOSS_ARENA, 43, 16, { sceneIds: ['ch3_s08_shadow_commander'], bossId: 'shadow_commander' })
        ]),
        sceneBindings: Object.freeze([
            binding('ch3_s01_dead_checkpoint', 'location_scene', 'dead_checkpoint', RegionSceneTrigger.REGION_ENTRY),
            binding('ch3_s03_lamp_oil_in_fog', 'regional_canvas', 'checkpoint_line', RegionSceneTrigger.SEGMENT_ENTER),
            binding('ch3_s06_drowned_voice', 'location_scene', 'sunken_altar_reef', RegionSceneTrigger.LOCATION_ENTER),
            binding('ch3_s07_old_command_post', 'location_scene', 'old_command_post', RegionSceneTrigger.LOCATION_INSPECT),
            binding('ch3_s08_shadow_commander', 'location_scene', 'shadow_command_yard', RegionSceneTrigger.BOSS_CONVERGENCE)
        ]),
        bossConvergence: Object.freeze({ bossId: 'shadow_commander', locationId: 'shadow_command_yard', sceneId: 'ch3_s08_shadow_commander' }),
        returnState: Object.freeze({ townEntryPlaceId: 'crossroads', afterSceneId: 'ch3_s08_shadow_commander' })
    }),

    chapter_04_gray_ridge: region({
        regionId: 'chapter_04_gray_ridge',
        chapter: 4,
        levelBand: [31, 40],
        title: '石心與灰雨',
        encounterBand: 'chapter_04',
        entryNodes: ['stone_route_entry'],
        exitNodes: ['stone_route_entry'],
        routeSegments: Object.freeze([
            segment('moving_stone_road', 'stone_route_entry', 'gray_ridge_entry', [[3, 18], [13, 18], [20, 15]], { terrain: 'moving_stone', encounterTableId: 'ch4_stone' }),
            segment('thorn_trial_branch', 'stone_route_entry', 'thorn_glasshouse_ruin', [[3, 18], [10, 9], [17, 7]], { terrain: 'thorn_road', encounterTableId: 'ch4_thorn', optional: true }),
            segment('gray_ridge_causeway', 'gray_ridge_entry', 'rear_marker', [[20, 15], [28, 15], [33, 20]], { terrain: 'gray_causeway', encounterTableId: 'ch4_evacuate' }),
            segment('center_span', 'rear_marker', 'ancient_titan_ribcage', [[33, 20], [38, 16], [43, 14]], { terrain: 'broken_span', encounterTableId: 'ch4_titan' }),
            segment('ash_freight_loop', 'gray_ridge_entry', 'center_span_marker', [[20, 15], [25, 8], [34, 9]], { terrain: 'ash_freight', encounterTableId: 'ch4_ash', optional: true })
        ]),
        locationNodes: Object.freeze([
            location('stone_route_entry', '移動石路', RegionLocationKind.ENTRY, 3, 18, { sceneIds: ['ch4_s01_road_moves_underfoot'] }),
            location('thorn_glasshouse_ruin', '荊棘溫室遺址', RegionLocationKind.SIDE_ROUTE, 17, 7, { imageId: 'thorn_glasshouse_ruin', sceneIds: ['ch4_s03_thorn_value_rule'], bossId: 'thorn_witch', optional: true }),
            location('gray_ridge_entry', '灰脊入口', RegionLocationKind.LANDMARK, 20, 15, { sceneIds: ['ch4_s04_gray_ridge_evacuates'] }),
            location('rear_marker', '後標燈位', RegionLocationKind.LANDMARK, 33, 20, { sceneIds: ['ch4_s05_body_locks'] }),
            location('center_span_marker', '中央跨度', RegionLocationKind.LANDMARK, 34, 9, { sceneIds: ['ch4_s06_flag_returns'] }),
            location('ancient_titan_ribcage', '石脊心口', RegionLocationKind.BOSS_ARENA, 43, 14, { sceneIds: ['ch4_s07_titan_rises'], bossId: 'ancient_titan' })
        ]),
        sceneBindings: Object.freeze([
            binding('ch4_s01_road_moves_underfoot', 'regional_canvas', 'moving_stone_road', RegionSceneTrigger.REGION_ENTRY),
            binding('ch4_s03_thorn_value_rule', 'location_scene', 'thorn_glasshouse_ruin', RegionSceneTrigger.LOCATION_ENTER),
            binding('ch4_s04_gray_ridge_evacuates', 'regional_canvas', 'gray_ridge_causeway', RegionSceneTrigger.SEGMENT_ENTER),
            binding('ch4_s05_body_locks', 'location_scene', 'rear_marker', RegionSceneTrigger.LOCATION_ENTER),
            binding('ch4_s06_flag_returns', 'location_scene', 'center_span_marker', RegionSceneTrigger.LOCATION_ENTER),
            binding('ch4_s07_titan_rises', 'location_scene', 'ancient_titan_ribcage', RegionSceneTrigger.BOSS_CONVERGENCE)
        ]),
        bossConvergence: Object.freeze({ bossId: 'ancient_titan', locationId: 'ancient_titan_ribcage', sceneId: 'ch4_s07_titan_rises' }),
        returnState: Object.freeze({ townEntryPlaceId: 'gate', afterSceneId: 'ch4_s07_titan_rises' })
    }),

    chapter_05_four_fronts: region({
        regionId: 'chapter_05_four_fronts',
        chapter: 5,
        levelBand: [41, 50],
        title: '元素失衡',
        encounterBand: 'chapter_05',
        entryNodes: ['four_front_entry'],
        exitNodes: ['four_front_entry'],
        routeSegments: Object.freeze([
            segment('fire_front', 'four_front_entry', 'four_front_nexus', [[3, 16], [13, 8], [23, 16]], { terrain: 'fire_front', encounterTableId: 'ch5_fire' }),
            segment('ice_front', 'four_front_entry', 'four_front_nexus', [[3, 16], [13, 24], [23, 16]], { terrain: 'ice_front', encounterTableId: 'ch5_ice' }),
            segment('thunder_front', 'four_front_entry', 'four_front_nexus', [[3, 16], [14, 13], [23, 16]], { terrain: 'thunder_front', encounterTableId: 'ch5_thunder' }),
            segment('poison_front', 'four_front_entry', 'four_front_nexus', [[3, 16], [14, 20], [23, 16]], { terrain: 'poison_front', encounterTableId: 'ch5_poison' }),
            segment('convergence_road', 'four_front_nexus', 'elemental_core', [[23, 16], [34, 16], [42, 16]], { terrain: 'elemental_convergence', encounterTableId: 'ch5_convergence' }),
            segment('emergency_return', 'elemental_core', 'four_front_entry', [[42, 16], [38, 25], [24, 27], [12, 24], [3, 16]], { terrain: 'exposed_stone', encounterTableId: 'ch5_emergency_return' }),
            segment('observation_loop', 'four_front_nexus', 'old_waystation_cache', [[23, 16], [29, 8], [37, 7]], { terrain: 'exposed_stone', encounterTableId: 'ch5_observation', optional: true })
        ]),
        locationNodes: Object.freeze([
            location('four_front_entry', '四線入口', RegionLocationKind.ENTRY, 3, 16),
            location('four_front_nexus', '四象交會線', RegionLocationKind.LANDMARK, 23, 16, { sceneIds: ['ch5_s03_elemental_convergence'] }),
            location('elemental_core', '元素收束核心', RegionLocationKind.BOSS_ARENA, 42, 16, { sceneIds: ['ch5_s04_elemental_lord'], bossId: 'elemental_lord' }),
            location('emergency_return_marker', '緊急回程線', RegionLocationKind.STORY_TRANSITION, 24, 27, { sceneIds: ['ch5_s05_fourfold_shrapnel'] }),
            location('old_waystation_cache', '舊驛站藏庫', RegionLocationKind.LANDMARK, 37, 7, { sceneIds: ['ch5_s09_whistle_cache'] })
        ]),
        sceneBindings: Object.freeze([
            binding('ch5_s03_elemental_convergence', 'regional_canvas', 'convergence_road', RegionSceneTrigger.SEGMENT_ENTER),
            binding('ch5_s04_elemental_lord', 'location_scene', 'elemental_core', RegionSceneTrigger.BOSS_CONVERGENCE),
            binding('ch5_s05_fourfold_shrapnel', 'regional_canvas', 'emergency_return', RegionSceneTrigger.RETURN_ROUTE),
            binding('ch5_s09_whistle_cache', 'location_scene', 'old_waystation_cache', RegionSceneTrigger.LOCATION_INSPECT)
        ]),
        bossConvergence: Object.freeze({ bossId: 'elemental_lord', locationId: 'elemental_core', sceneId: 'ch5_s04_elemental_lord' }),
        returnState: Object.freeze({ townEntryPlaceId: 'mia_workroom', afterSceneId: 'ch5_s05_fourfold_shrapnel' })
    }),

    chapter_06_dragon_scar: region({
        regionId: 'chapter_06_dragon_scar',
        chapter: 6,
        levelBand: [51, 60],
        title: '龍守封痕',
        encounterBand: 'chapter_06',
        entryNodes: ['northern_drake_watch'],
        exitNodes: ['northern_drake_watch'],
        routeSegments: Object.freeze([
            segment('elder_pursuit', 'northern_drake_watch', 'seal_warning_line', [[3, 18], [13, 17], [23, 13], [31, 13]], { terrain: 'dragon_watch', encounterTableId: 'ch6_perimeter' }),
            segment('heat_crag_branch', 'northern_drake_watch', 'dragon_heat_crag', [[3, 18], [12, 25], [20, 25]], { terrain: 'heated_crag', encounterTableId: 'ch6_drake', optional: true }),
            segment('sealed_broad_road', 'seal_warning_line', 'elder_dragon_line', [[31, 13], [39, 13], [44, 15]], { terrain: 'seal_scar', encounterTableId: 'ch6_dragon_line' }),
            segment('blind_collapse_return', 'elder_dragon_line', 'broad_road_collapse', [[44, 15], [40, 23], [31, 25]], { terrain: 'collapsed_broad_road', encounterTableId: 'ch6_collapse' }),
            segment('old_route_mouth_approach', 'broad_road_collapse', 'old_route_mouth', [[31, 25], [22, 27], [16, 24]], { terrain: 'acoustic_blind_turns', encounterTableId: 'ch6_old_road' })
        ]),
        locationNodes: Object.freeze([
            location('northern_drake_watch', '北境龍哨', RegionLocationKind.ENTRY, 3, 18, { imageId: 'northern_drake_watch', sceneIds: ['ch6_s01_northern_drake_watch'] }),
            location('dragon_heat_crag', '龍焰裂脊', RegionLocationKind.SIDE_ROUTE, 20, 25, { imageId: 'dragon_heat_crag', optional: true }),
            location('seal_warning_line', '封痕警戒線', RegionLocationKind.LANDMARK, 31, 13, { sceneIds: ['ch6_s02_scar_aftermath', 'ch6_s03_stop_before_the_line'] }),
            location('elder_dragon_line', '龍族守線', RegionLocationKind.BOSS_ARENA, 44, 15, { imageId: 'charred_obelisk', sceneIds: ['ch6_s04_dragon_convergence'], bossId: 'elder_dragon' }),
            location('broad_road_collapse', '寬路盡頭', RegionLocationKind.STORY_TRANSITION, 31, 25, { sceneIds: ['ch6_s05_after_the_broad_road'] }),
            location('old_route_mouth', '舊路回音口', RegionLocationKind.LANDMARK, 16, 24, { sceneIds: ['ch6_s09_the_old_note_answers'] })
        ]),
        sceneBindings: Object.freeze([
            binding('ch6_s01_northern_drake_watch', 'regional_canvas', 'elder_pursuit', RegionSceneTrigger.REGION_ENTRY),
            binding('ch6_s02_scar_aftermath', 'location_scene', 'seal_warning_line', RegionSceneTrigger.LOCATION_ENTER),
            binding('ch6_s03_stop_before_the_line', 'location_scene', 'seal_warning_line', RegionSceneTrigger.LOCATION_INSPECT),
            binding('ch6_s04_dragon_convergence', 'location_scene', 'elder_dragon_line', RegionSceneTrigger.BOSS_CONVERGENCE),
            binding('ch6_s05_after_the_broad_road', 'regional_canvas', 'blind_collapse_return', RegionSceneTrigger.RETURN_ROUTE),
            binding('ch6_s09_the_old_note_answers', 'location_scene', 'old_route_mouth', RegionSceneTrigger.LOCATION_INSPECT)
        ]),
        bossConvergence: Object.freeze({ bossId: 'elder_dragon', locationId: 'elder_dragon_line', sceneId: 'ch6_s04_dragon_convergence', secondRunResolution: 'evidence_bound_non_attack' }),
        returnState: Object.freeze({ townEntryPlaceId: 'gate', afterSceneId: 'ch6_s05_after_the_broad_road' })
    }),

    chapter_07_fall_site: region({
        regionId: 'chapter_07_fall_site',
        chapter: 7,
        levelBand: [61, 70],
        title: '墜落之地',
        encounterBand: 'chapter_07',
        entryNodes: ['old_mountain_road'],
        exitNodes: ['old_mountain_road'],
        routeSegments: Object.freeze([
            segment('echo_blind_turns', 'old_mountain_road', 'ruined_flower_field', [[3, 21], [10, 17], [15, 20], [21, 13]], { terrain: 'old_mountain_road', encounterTableId: 'ch7_blind_turns' }),
            segment('settlement_trace', 'ruined_flower_field', 'final_mountain_camp', [[21, 13], [29, 13], [34, 17]], { terrain: 'ruined_settlement', encounterTableId: 'ch7_settlement' }),
            segment('echo_notch_loop', 'ruined_flower_field', 'echo_notch_overlook', [[21, 13], [24, 7], [31, 6]], { terrain: 'echo_notches', encounterTableId: 'ch7_echo', optional: true }),
            segment('fall_site_approach', 'final_mountain_camp', 'demon_fall_site', [[34, 17], [40, 16], [44, 14]], { terrain: 'fall_site_wound', encounterTableId: 'ch7_fall_site' })
        ]),
        locationNodes: Object.freeze([
            location('old_mountain_road', '舊山路', RegionLocationKind.ENTRY, 3, 21, { sceneIds: ['ch7_s01_narrow_human_road'] }),
            location('ruined_flower_field', '毀壞花田', RegionLocationKind.LANDMARK, 21, 13, { sceneIds: ['ch7_s02_ruined_flower_field'] }),
            location('echo_notch_overlook', '回音刻口', RegionLocationKind.SIDE_ROUTE, 31, 6, { optional: true }),
            location('final_mountain_camp', '終點前營地', RegionLocationKind.CAMP, 34, 17, { sceneIds: ['ch7_s04_three_anchor_check'] }),
            location('demon_fall_site', '魔王墜落地', RegionLocationKind.BOSS_ARENA, 44, 14, { sceneIds: ['ch7_s05_fall_site_audience', 'ch7_s06_combat_body_falls', 'ch7_s07_last_core'], bossId: 'demon_lord_asariel' })
        ]),
        sceneBindings: Object.freeze([
            binding('ch7_s01_narrow_human_road', 'regional_canvas', 'echo_blind_turns', RegionSceneTrigger.REGION_ENTRY),
            binding('ch7_s02_ruined_flower_field', 'location_scene', 'ruined_flower_field', RegionSceneTrigger.LOCATION_ENTER),
            binding('ch7_s04_three_anchor_check', 'location_scene', 'final_mountain_camp', RegionSceneTrigger.LOCATION_INSPECT),
            binding('ch7_s05_fall_site_audience', 'location_scene', 'demon_fall_site', RegionSceneTrigger.BOSS_CONVERGENCE),
            binding('ch7_s06_combat_body_falls', 'location_scene', 'demon_fall_site', RegionSceneTrigger.BOSS_CONVERGENCE),
            binding('ch7_s07_last_core', 'location_scene', 'demon_fall_site', RegionSceneTrigger.BOSS_CONVERGENCE)
        ]),
        bossConvergence: Object.freeze({ bossId: 'demon_lord_asariel', locationId: 'demon_fall_site', sceneId: 'ch7_s05_fall_site_audience', secondRunCoreSceneId: 'ch7_s07_last_core' }),
        returnState: Object.freeze({ townEntryPlaceId: 'crossroads', afterSceneId: 'ch7_s07_last_core' })
    })
});

export const ChapterRegionOrder = Object.freeze(Object.values(ChapterRegionRegistry)
    .sort((a, b) => a.chapter - b.chapter)
    .map(entry => entry.regionId));

const SceneBindingIndex = new Map();
const LocationIndex = new Map();

for (const entry of Object.values(ChapterRegionRegistry)) {
    for (const sceneBinding of entry.sceneBindings) {
        SceneBindingIndex.set(sceneBinding.sceneId, { ...sceneBinding, regionId: entry.regionId, chapter: entry.chapter });
    }
    for (const node of entry.locationNodes) {
        LocationIndex.set(`${entry.regionId}:${node.id}`, { ...node, regionId: entry.regionId, chapter: entry.chapter });
    }
}

export function getChapterRegion(chapterOrId) {
    if (typeof chapterOrId === 'string' && ChapterRegionRegistry[chapterOrId]) {
        return ChapterRegionRegistry[chapterOrId];
    }
    const chapter = Math.min(7, Math.max(1, Number(chapterOrId) || 1));
    return Object.values(ChapterRegionRegistry).find(entry => entry.chapter === chapter) || null;
}

export function getSceneRegionBinding(sceneId) {
    return SceneBindingIndex.get(sceneId) || null;
}

export function getRegionLocation(regionId, locationId) {
    return LocationIndex.get(`${regionId}:${locationId}`) || null;
}

export function getChapterLocation(chapter, locationId) {
    const entry = getChapterRegion(chapter);
    return entry ? getRegionLocation(entry.regionId, locationId) : null;
}

export function findChapterLocation(locationId, chapter = null) {
    if (chapter) return getChapterLocation(chapter, locationId);
    for (const entry of Object.values(ChapterRegionRegistry)) {
        const node = getRegionLocation(entry.regionId, locationId);
        if (node) return node;
    }
    return null;
}

export function getAllChapterLocations() {
    return [...LocationIndex.values()];
}

export function isOptionalStoryScene(sceneId) {
    if (!sceneId) return false;
    return [...LocationIndex.values()].some(node =>
        node.optional && (node.sceneIds || []).includes(sceneId)
    );
}

export function getLocationProgressTargets(locationId, chapter) {
    const node = getChapterLocation(chapter, locationId);
    if (!node) return [];
    return [
        `region:${node.regionId}`,
        `location:${node.id}`,
        ...node.sceneIds.map(sceneId => `scene:${sceneId}`)
    ];
}
