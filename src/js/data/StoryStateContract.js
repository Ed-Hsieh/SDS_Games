/**
 * StoryStateContract.js
 * The screenplay scene flags are the authoritative current-run state. Only
 * achievement-memory flags survive a run reset; physical objects never do.
 */

export const StoryAchievementIds = Object.freeze({
    FLAG_DID_NOT_RETURN: 'flag_did_not_return',
    WATER_WAS_COLD: 'water_was_cold',
    ELDER_BEFORE_SCAR: 'elder_before_scar',
    DEALER_LEFT_SEAT: 'dealer_left_seat',
    ECHO_WENT_AHEAD: 'echo_went_ahead',
    UNFINISHED_REGICIDE: 'unfinished_regicide',
    FLOWERS_BLOOM_AT_ECHO_END: 'flowers_bloom_at_echo_end'
});

export const StoryAchievementRegistry = Object.freeze({
    [StoryAchievementIds.FLAG_DID_NOT_RETURN]: {
        name: '旗沒有回來',
        sourceSceneId: 'ch4_s06_flag_returns'
    },
    [StoryAchievementIds.WATER_WAS_COLD]: {
        name: '醒來時，水已經涼了',
        sourceSceneId: 'ch5_s06_mia_operation'
    },
    [StoryAchievementIds.ELDER_BEFORE_SCAR]: {
        name: '封痕前的老人',
        sourceSceneId: 'ch6_s02_scar_aftermath'
    },
    [StoryAchievementIds.DEALER_LEFT_SEAT]: {
        name: '莊家離席',
        sourceSceneId: 'ch6_s07_house_changes_seats'
    },
    [StoryAchievementIds.ECHO_WENT_AHEAD]: {
        name: '先行的回聲',
        sourceSceneId: 'ch7_s02_ruined_flower_field'
    },
    [StoryAchievementIds.UNFINISHED_REGICIDE]: {
        name: '未竟的弒王',
        sourceSceneId: 'ch7_s09_first_or_second_epilogue'
    },
    [StoryAchievementIds.FLOWERS_BLOOM_AT_ECHO_END]: {
        name: '回聲盡頭，花仍會開',
        sourceSceneId: 'ch7_s09_first_or_second_epilogue'
    }
});

export function getStoryAchievementFlag(achievementId) {
    return `story.achievement.${achievementId}`;
}

export function getStorySceneCompleteFlag(sceneId) {
    return `story.scene.${sceneId}.complete`;
}

export function getStoryEncounterVictoryFlag(encounterId) {
    return `story.encounter.${encounterId}.victory`;
}

export const PROLOGUE_TUTORIAL_RESOLVED_FLAG = 'story.prologue.tutorialResolved';
export const PROLOGUE_TUTORIAL_OUTCOME_FLAG = 'story.prologue.tutorialOutcome';
export const PROLOGUE_WAKE_DIALOGUE_PENDING_FLAG = 'story.prologue.wakeDialoguePending';

const SceneEffects = Object.freeze({
    ch1_s04_elder_to_scholar: {
        first_run: { flags: { 'story.handbook.active': true } },
        second_run: { flags: { 'story.handbook.active': true } }
    },
    ch1_s06_three_landmarks: {
        first_run: { flags: { 'story.ch1.three_landmarks_complete': true, 'story.ch1.silver_snare_active': true } },
        second_run: { flags: { 'story.ch1.three_landmarks_complete': true, 'story.ch1.silver_snare_active': true } }
    },
    ch1_s07_silver_snare: {
        first_run: { flags: { 'story.ch1.silver_snare_cleared': true } },
        second_run: { flags: { 'story.ch1.silver_snare_cleared': true } }
    },
    ch1_s08_cold_forge_smoke: {
        first_run: { flags: { 'town.blacksmith.forge_open': true, 'story.ch1.rotroot_active': true } },
        second_run: { flags: { 'town.blacksmith.forge_open': true, 'story.ch1.rotroot_active': true } }
    },
    ch1_s09_rotroot_approach: {
        first_run: { flags: { 'story.ch1.forest_guardian_active': true } },
        second_run: { flags: { 'story.ch1.forest_guardian_active': true } }
    },
    ch1_s10_forest_guardian: {
        first_run: { flags: { 'boss.forest_guardian.defeated': true } },
        second_run: { flags: { 'boss.forest_guardian.defeated': true } }
    },
    ch1_s11_roads_breathe_again: {
        first_run: { flags: { 'map.gates.rotroot_broken_bridge.open': true, 'story.chapter_02.open': true } },
        second_run: { flags: { 'map.gates.rotroot_broken_bridge.open': true, 'story.chapter_02.open': true } }
    },
    ch2_s03_ledger_that_would_not_close: {
        first_run: { flags: { 'story.ch2.route_investigation_active': true } },
        second_run: { flags: { 'story.ch2.route_investigation_active': true } }
    },
    ch2_s04_mist_and_tomb_route: {
        first_run: { flags: { 'story.ch2.lich_active': true } },
        second_run: { flags: { 'story.ch2.lich_active': true } }
    },
    ch2_s05_moon_moss_trace: {
        first_run: { flags: { 'story.ch2.moon_moss_trace_recorded': true } },
        second_run: { flags: { 'story.ch2.moon_moss_trace_recorded': true } }
    },
    ch2_s06_keeper_of_names: {
        first_run: { flags: { 'boss.lich.defeated': true, 'story.ch2.lich_phylactery_recovered': true } },
        second_run: { flags: { 'boss.lich.defeated': true, 'story.ch2.lich_phylactery_recovered': true, 'story.execution.glimmer_shard_reserved': true } }
    },
    ch2_s07_names_return_to_town: {
        first_run: { flags: { 'town.market.public_medicine_authorized': true } },
        second_run: { flags: { 'town.market.public_medicine_authorized': true } }
    },
    ch2_s08_shadow_at_the_checkpoint: {
        first_run: { flags: { 'story.chapter_03.open': true } },
        second_run: { flags: { 'story.chapter_03.open': true } }
    },
    ch3_s01_dead_checkpoint: {
        first_run: { flags: { 'story.ch3.checkpoint_evidence_recovered': true } },
        second_run: { flags: { 'story.ch3.checkpoint_evidence_recovered': true } }
    },
    ch3_s02_shadows_count_names: {
        first_run: { flags: { 'story.ch3.command_route_known': true } },
        second_run: { flags: { 'story.ch3.command_route_known': true } }
    },
    ch3_s03_lamp_oil_in_fog: {
        first_run: {
            flags: {
                'story.ch3.command_road_open': true,
                'story.ch3.rear_marker_unmeasured': true
            }
        },
        second_run: {
            flags: {
                'story.ch3.command_road_open': true,
                'story.ch3.rear_marker_ready': true
            }
        }
    },
    ch3_s04_showcase_glass: {
        first_run: { flags: { 'story.ch3.showcase_inspected': true } },
        second_run: { flags: { 'story.ch3.showcase_inspected': true } }
    },
    ch3_s05_blank_creditor_trace: {
        first_run: { flags: { 'story.ch3.blank_collateral_recorded': true } },
        second_run: { flags: { 'story.ch3.blank_collateral_recorded': true } }
    },
    ch3_s06_drowned_voice: {
        first_run: {
            flags: {
                'boss.drowned_oracle.defeated': true,
                'story.ch3.ancient_rune_recovered': true
            }
        },
        second_run: {
            flags: {
                'boss.drowned_oracle.defeated': true,
                'story.ch3.ancient_rune_recovered': true,
                'story.execution.ancient_rune_bound': true
            }
        }
    },
    ch3_s07_old_command_post: {
        first_run: { flags: { 'story.ch3.kaedren_identified': true } },
        second_run: { flags: { 'story.ch3.kaedren_identified': true } }
    },
    ch3_s08_shadow_commander: {
        first_run: { flags: { 'boss.shadow_commander.defeated': true } },
        second_run: { flags: { 'boss.shadow_commander.defeated': true } }
    },
    ch3_s09_temptation_and_orders: {
        first_run: { flags: { 'story.chapter_04.open': true, 'town.market.public_medicine': true, 'town.market.open': true } },
        second_run: { flags: { 'story.chapter_04.open': true, 'town.market.public_medicine': true, 'town.market.open': true } }
    },
    ch4_s01_road_moves_underfoot: {
        first_run: {
            flags: {
                'story.ch4.gray_ridge_rescue_active': true,
                'story.ch4.ruin_investigation_active': true
            }
        },
        second_run: {
            flags: {
                'story.ch4.gray_ridge_rescue_active': true,
                'story.ch4.ruin_investigation_active': true
            }
        }
    },
    ch4_s02_caravan_rear_missing: {
        first_run: {
            flags: {
                'story.ch4.evacuation_equipment_ready': true
            }
        },
        second_run: {
            flags: {
                'story.ch4.evacuation_equipment_ready': true,
                'story.ch4.rear_marker_wind_guard_ready': true
            }
        }
    },
    ch4_s03_thorn_value_rule: {
        first_run: {
            flags: {
                'boss.thorn_witch.defeated': true,
                'story.ch4.forest_essence_recovered': true
            }
        },
        second_run: {
            flags: {
                'boss.thorn_witch.defeated': true,
                'story.ch4.thorn_host_parasite_separated': true
            }
        }
    },
    ch4_s04_gray_ridge_evacuates: {
        first_run: {
            flags: {
                'story.ch4.evacuation_active': true,
                'story.ch4.central_crossing_held': true
            }
        },
        second_run: {
            flags: {
                'story.ch4.evacuation_active': true,
                'story.ch4.central_crossing_held': true
            }
        }
    },
    ch4_s05_body_locks: {
        first_run: { flags: { 'story.ch4.rear_marker': 'failed' } },
        second_run: { flags: { 'story.ch4.rear_marker': 'lit' } }
    },
    ch4_s06_flag_returns: {
        first_run: {
            flags: {
                'story.fate.frey': 'dead',
                'story.ch4.evacuation_complete': true,
                [getStoryAchievementFlag(StoryAchievementIds.FLAG_DID_NOT_RETURN)]: true
            }
        },
        second_run: {
            flags: {
                'story.fate.frey': 'alive',
                'story.fate.tavi': 'alive',
                'story.ch4.evacuation_complete': true
            }
        }
    },
    ch4_s07_titan_rises: {
        first_run: {
            flags: {
                'boss.ancient_titan.defeated': true,
                'story.ch4.regulation_channels_exposed': true,
                'story.ch4.mountain_drain_identified': true
            }
        },
        second_run: {
            flags: {
                'boss.ancient_titan.defeated': true,
                'story.ch4.regulation_channels_exposed': true,
                'story.ch4.mountain_drain_identified': true
            }
        }
    },
    ch4_s08_returned_objects: {
        first_run: { flags: { 'story.ch4.town_aftermath_recorded': true } },
        second_run: { flags: { 'story.ch4.town_aftermath_recorded': true } }
    },
    ch4_s09_four_elements_one_report: {
        first_run: {
            flags: {
                'story.chapter_05.open': true,
                'story.ch4.four_front_evidence_complete': true,
                'story.ch4.ailo_lower_road_breadcrumb': true,
                'story.ch4.lorne_refused_private_table': true
            }
        },
        second_run: {
            flags: {
                'story.chapter_05.open': true,
                'story.ch4.four_front_evidence_complete': true,
                'story.ch4.ailo_lower_road_breadcrumb': true,
                'story.ch4.lorne_refused_private_table': true
            }
        }
    },
    ch5_s01_four_fronts_converge: {
        first_run: {
            flags: {
                'story.ch5.four_fronts_open': true,
                'story.ch5.shared_pressure_hypothesis': true
            }
        },
        second_run: {
            flags: {
                'story.ch5.four_fronts_open': true,
                'story.ch5.shared_pressure_hypothesis': true
            }
        }
    },
    ch5_s02_forge_contracts: {
        first_run: {
            flags: {
                'story.ch5.advanced_forge_ready': true,
                'story.ch5.unscoped_handling_summary': true,
                'story.ch5.preparation_complete': true
            }
        },
        second_run: {
            flags: {
                'story.ch5.advanced_forge_ready': true,
                'story.ch5.summary_scope_challenged': true,
                'story.ch5.ratchet_removed': true,
                'story.ch5.execution_housings_ready': true,
                'story.ch5.preparation_complete': true
            }
        }
    },
    ch5_s03_elemental_convergence: {
        first_run: {
            flags: {
                'story.ch5.convergence_core_open': true,
                'story.ch5.four_front_evidence_complete': true
            }
        },
        second_run: {
            flags: {
                'story.ch5.convergence_core_open': true,
                'story.ch5.four_front_evidence_complete': true,
                'story.ch5.pressure_free_handling_proven': true,
                'story.ch5.scoped_handling_record': true
            }
        }
    },
    ch5_s04_elemental_lord: {
        first_run: {
            flags: {
                'boss.elemental_lord.defeated': true,
                'story.ch5.fourfold_shard_embedded': true,
                'story.ch5.protagonist_disabled': true
            }
        },
        second_run: {
            flags: {
                'boss.elemental_lord.defeated': true,
                'story.ch5.fourfold_shard_embedded': true,
                'story.ch5.protagonist_disabled': true
            }
        }
    },
    ch5_s05_fourfold_shrapnel: {
        first_run: {
            flags: {
                'story.ch5.emergency_return_complete': true,
                'story.ch5.surgery_ready': true
            }
        },
        second_run: {
            flags: {
                'story.ch5.emergency_return_complete': true,
                'story.ch5.surgery_ready': true
            }
        }
    },
    ch5_s06_mia_operation: {
        first_run: {
            flags: {
                'story.ch5.protagonist_saved': true,
                'story.ch5.fourfold_shard_removed': true,
                'story.fate.mia': 'dead',
                [getStoryAchievementFlag(StoryAchievementIds.WATER_WAS_COLD)]: true
            }
        },
        second_run: {
            flags: {
                'story.ch5.protagonist_saved': true,
                'story.ch5.fourfold_shard_removed': true,
                'story.ch5.pressure_free_operation_succeeded': true,
                'story.fate.mia': 'alive'
            }
        }
    },
    ch5_s07_after_the_ratchet: {
        first_run: {
            flags: {
                'story.ch5.operation_aftermath_recorded': true,
                'story.ch5.last_page_recorded': true,
                'story.ch5.scholar_confidence_collapsed': true
            }
        },
        second_run: {
            flags: {
                'story.ch5.operation_aftermath_recorded': true,
                'story.ch5.protected_operator_principle': true,
                'story.ch5.scoped_handling_record': true
            }
        }
    },
    ch5_s08_expedition_list: {
        first_run: {
            flags: {
                'story.ch5.expedition_truth_reconstructed': true,
                'story.ch5.elder_departure_seeded': true
            }
        },
        second_run: {
            flags: {
                'story.ch5.expedition_truth_reconstructed': true,
                'story.ch5.elder_preparations_detected': true
            }
        }
    },
    ch5_s09_whistle_cache: {
        first_run: {
            flags: {
                'story.ch5.echo_whistle_recovered': true
            }
        },
        second_run: {
            flags: {
                'story.ch5.echo_whistle_recovered': true,
                'story.ch5.ailo_recognized_whistle': true
            }
        }
    },
    ch5_s10_before_dawn: {
        first_run: {
            flags: {
                'story.ch5.elder_departed': true
            }
        },
        second_run: {
            flags: {
                'story.ch5.elder_departure_prevented': true,
                'story.ch5.elder_alive_shard_given': true,
                'story.fate.elder': 'alive'
            }
        }
    },
    ch5_s11_town_loses_its_voice: {
        first_run: {
            flags: {
                'story.ch5.town_temperature_recorded': true,
                'story.ch5.vesper_settlement_staged': true,
                'story.chapter_06.open': true
            }
        },
        second_run: {
            flags: {
                'story.ch5.town_temperature_recorded': true,
                'story.ch5.vesper_settlement_staged': true,
                'story.chapter_06.open': true
            }
        }
    },
    ch6_s02_scar_aftermath: {
        first_run: {
            flags: {
                'story.fate.elder': 'dead',
                [getStoryAchievementFlag(StoryAchievementIds.ELDER_BEFORE_SCAR)]: true
            }
        },
        second_run: { flags: { 'story.fate.elder': 'alive' } }
    },
    ch6_s04_dragon_convergence: {
        first_run: {
            flags: {
                'boss.elder_dragon.defeated': true,
                'story.ch6.dragon_containment': 'collapsed'
            }
        },
        second_run: {
            flags: {
                'story.ch6.dragon_containment': 'preserved',
                'story.ch6.dragon_non_attack_observed': true
            }
        }
    },
    ch6_s07_house_changes_seats: {
        first_run: {
            flags: {
                'story.fate.vesper': 'escaped',
                'story.fate.lorne': 'restitution_pending',
                [getStoryAchievementFlag(StoryAchievementIds.DEALER_LEFT_SEAT)]: true
            }
        },
        second_run: {
            flags: {
                'story.fate.vesper': 'collected',
                'story.fate.lorne': 'supervised_restitution'
            }
        }
    },
    ch6_s08_brush_past_or_invitation: {
        first_run: {
            flags: {
                'story.ch6.echo_whistle': 'stolen',
                'story.fate.ailo': 'missing'
            }
        },
        second_run: {
            flags: {
                'story.ch6.echo_whistle': 'shared',
                'story.ch6.ailo_companion': true
            }
        }
    },
    ch6_s09_the_old_note_answers: {
        first_run: {
            flags: {
                'story.ch6.old_route_open': true,
                'story.chapter_07.open': true
            }
        },
        second_run: {
            flags: {
                'story.ch6.old_route_open': true,
                'story.chapter_07.open': true
            }
        }
    },
    ch7_s02_ruined_flower_field: {
        first_run: {
            flags: {
                'story.fate.ailo': 'missing_presumed_dead',
                [getStoryAchievementFlag(StoryAchievementIds.ECHO_WENT_AHEAD)]: true
            }
        }
    },
    ch7_s03_echo_memory: {
        second_run: {
            flags: {
                'story.fate.ailo': 'alive',
                'story.ailo.name_revealed': true,
                'story.ailo.memory_complete': true
            }
        }
    },
    ch7_s04_three_anchor_check: {
        first_run: {
            flags: {
                'story.ch7.true_kill_ready': false,
                'story.ch7.anchor_state': 'unavailable'
            }
        },
        second_run: {
            flags: {
                'story.ch7.true_kill_ready': true,
                'story.ch7.anchor_state': 'armed'
            }
        }
    },
    ch7_s05_fall_site_audience: {
        first_run: {
            flags: {
                'story.ch7.demon_body_engaged': true
            }
        },
        second_run: {
            flags: {
                'story.ch7.demon_body_engaged': true
            }
        }
    },
    ch7_s06_combat_body_falls: {
        first_run: {
            flags: {
                'story.ch7.combat_body': 'defeated_apparent',
                'story.ch7.core': 'unseen'
            }
        },
        second_run: {
            flags: {
                'story.ch7.combat_body': 'defeated',
                'story.ch7.core': 'exposed'
            }
        }
    },
    ch7_s07_last_core: {
        first_run: {
            flags: {
                'story.fate.demonKing': 'surviving',
                'story.ch7.core': 'unseen',
                'story.ch7.curse_pressure': 'dormant'
            }
        },
        second_run: {
            flags: {
                'story.fate.demonKing': 'dead',
                'story.ch7.core': 'destroyed',
                'story.ch7.curse_pressure': 'ceased'
            }
        }
    },
    ch7_s08_return_to_town: {
        first_run: {
            flags: {
                'story.ch7.town_return': 'hollow'
            }
        },
        second_run: {
            flags: {
                'story.ch7.town_return': 'true'
            }
        }
    },
    ch7_s09_first_or_second_epilogue: {
        first_run: {
            flags: {
                [getStoryAchievementFlag(StoryAchievementIds.UNFINISHED_REGICIDE)]: true,
                'story.secondRunUnlocked': true,
                'story.ending': 'hollow_victory'
            }
        },
        second_run: {
            flags: {
                [getStoryAchievementFlag(StoryAchievementIds.FLOWERS_BLOOM_AT_ECHO_END)]: true,
                'story.ending': 'true_ending',
                'story.campaignComplete': true
            }
        }
    }
});

export function getStorySceneEffects(sceneId, runNumber = 1) {
    const runKey = Number(runNumber) >= 2 ? 'second_run' : 'first_run';
    return SceneEffects[sceneId]?.[runKey] || null;
}

export function applyStorySceneEffects(sceneId, runNumber, setFlag) {
    const effect = getStorySceneEffects(sceneId, runNumber);
    if (!effect || typeof setFlag !== 'function') return [];

    const applied = [];
    for (const [flag, value] of Object.entries(effect.flags || {})) {
        setFlag(flag, value);
        applied.push({ flag, value });
    }
    return applied;
}

const CurrentRunStoryPrefixes = Object.freeze([
    'story.prologue.',
    'story.scene.',
    'story.encounter.',
    'story.fate.',
    'story.ailo.',
    'story.ch1.',
    'story.ch2.',
    'story.ch3.',
    'story.ch4.',
    'story.ch5.',
    'story.ch6.',
    'story.ch7.',
    'story.chapter_',
    'story.execution.'
]);

const CurrentRunStoryKeys = Object.freeze([
    'story.activeSceneId',
    'story.activeScenePhase',
    'story.lastSceneId',
    'story.chapter',
    'story.ending',
    'story.campaignComplete'
]);

export function getCurrentRunStoryFlagKeys(flags = {}) {
    return Object.keys(flags).filter(key => (
        CurrentRunStoryKeys.includes(key)
        || CurrentRunStoryPrefixes.some(prefix => key.startsWith(prefix))
    ));
}
