/**
 * StoryEncounterContracts.js
 *
 * Runtime gates for authored mainline battles. The screenplay owns prose and
 * scene order; this contract owns where dialogue pauses for combat and where
 * post-battle presentation resumes. No combat values or rewards live here.
 */

export const StoryEncounterPhase = Object.freeze({
    FULL: 'full',
    PRE_BATTLE: 'pre_battle',
    POST_BATTLE: 'post_battle'
});

export const StoryEncounterTransition = Object.freeze({
    ENCOUNTER_REQUIRED: 'encounter_required',
    POST_BATTLE: 'post_battle',
    RETRY_REQUIRED: 'retry_required',
    SCENE_COMPLETED: 'scene_completed'
});

function contract(config) {
    return Object.freeze({
        requiredOutcome: 'victory',
        runConditions: Object.freeze(config.runConditions || ['first_run', 'second_run']),
        postBattleBeatIndex: null,
        ...config
    });
}

export const StoryEncounterContracts = Object.freeze({
    ch1_s10_forest_guardian: contract({
        id: 'mainline_ch1_forest_guardian',
        sceneId: 'ch1_s10_forest_guardian',
        monsterId: 'forest_guardian',
        regionId: 'chapter_01_south_gate',
        locationId: 'old_wolf_den',
        combatStartBeatIndex: 4,
        postBattleBeatIndex: 5
    }),
    ch2_s06_keeper_of_names: contract({
        id: 'mainline_ch2_lich',
        sceneId: 'ch2_s06_keeper_of_names',
        monsterId: 'lich',
        regionId: 'chapter_02_broken_evacuations',
        locationId: 'opened_ancient_tomb',
        combatStartBeatIndex: 7,
        postBattleBeatIndex: 8
    }),
    ch3_s08_shadow_commander: contract({
        id: 'mainline_ch3_shadow_commander',
        sceneId: 'ch3_s08_shadow_commander',
        monsterId: 'shadow_commander',
        regionId: 'chapter_03_shadow_watch',
        locationId: 'shadow_command_yard',
        combatStartBeatIndex: 4,
        postBattleBeatIndex: 5
    }),
    ch4_s07_titan_rises: contract({
        id: 'mainline_ch4_ancient_titan',
        sceneId: 'ch4_s07_titan_rises',
        monsterId: 'ancient_titan',
        regionId: 'chapter_04_gray_ridge',
        locationId: 'titan_vein_ruins',
        combatStartBeatIndex: 6,
        postBattleBeatIndex: 7
    }),
    ch5_s04_elemental_lord: contract({
        id: 'mainline_ch5_elemental_lord',
        sceneId: 'ch5_s04_elemental_lord',
        monsterId: 'elemental_lord',
        regionId: 'chapter_05_four_fronts',
        locationId: 'elemental_core',
        combatStartBeatIndex: 3,
        postBattleBeatIndex: 4
    }),
    ch6_s04_dragon_convergence: contract({
        id: 'mainline_ch6_elder_dragon',
        sceneId: 'ch6_s04_dragon_convergence',
        monsterId: 'elder_dragon',
        regionId: 'chapter_06_dragon_scar',
        locationId: 'elder_dragon_line',
        runConditions: Object.freeze(['first_run']),
        combatStartBeatIndex: 1,
        postBattleBeatIndex: 2
    }),
    ch7_s05_fall_site_audience: contract({
        id: 'mainline_ch7_demon_king_body',
        sceneId: 'ch7_s05_fall_site_audience',
        monsterId: 'demon_lord_asariel',
        regionId: 'chapter_07_fall_site',
        locationId: 'demon_fall_site',
        combatStartBeatIndex: 6,
        postBattleBeatIndex: null
    })
});

export const StoryRouteEncounterContracts = Object.freeze({
    ch1_s07_silver_snare: contract({
        id: 'route_ch1_ambush_mantis',
        sceneId: 'ch1_s07_silver_snare',
        monsterId: 'ambush_mantis',
        regionId: 'chapter_01_south_gate',
        locationId: 'silver_snare_pass',
        combatStartBeatIndex: 3,
        postBattleBeatIndex: 4
    }),
    ch3_s01_dead_checkpoint: contract({
        id: 'route_ch3_shadow_checkpoint',
        sceneId: 'ch3_s01_dead_checkpoint',
        monsterId: 'shadow_soldier',
        regionId: 'chapter_03_shadow_watch',
        locationId: 'dead_checkpoint',
        combatStartBeatIndex: 4,
        postBattleBeatIndex: 5
    }),
    ch3_s06_drowned_voice: contract({
        id: 'route_ch3_drowned_oracle',
        sceneId: 'ch3_s06_drowned_voice',
        monsterId: 'drowned_oracle',
        regionId: 'chapter_03_shadow_watch',
        locationId: 'sunken_altar_reef',
        combatStartBeatIndex: 4,
        postBattleBeatIndex: 5
    }),
    ch4_s03_thorn_value_rule: contract({
        id: 'route_ch4_thorn_witch',
        sceneId: 'ch4_s03_thorn_value_rule',
        monsterId: 'thorn_witch',
        regionId: 'chapter_04_gray_ridge',
        locationId: 'thorn_glasshouse_ruin',
        combatStartBeatIndex: 6,
        postBattleBeatIndex: 7
    })
});

export function getStoryRunCondition(runNumber = 1) {
    return Number(runNumber) >= 2 ? 'second_run' : 'first_run';
}

export function getStoryEncounterContract(sceneId, runNumber = 1) {
    const entry = StoryEncounterContracts[sceneId] || StoryRouteEncounterContracts[sceneId] || null;
    if (!entry) return null;
    return entry.runConditions.includes(getStoryRunCondition(runNumber)) ? entry : null;
}

export function getStoryEncounterContractById(encounterId, runNumber = 1) {
    const entry = [
        ...Object.values(StoryEncounterContracts),
        ...Object.values(StoryRouteEncounterContracts)
    ].find(candidate => candidate.id === encounterId) || null;
    if (!entry) return null;
    return entry.runConditions.includes(getStoryRunCondition(runNumber)) ? entry : null;
}

export function hasPostBattlePresentation(entry) {
    return Number.isInteger(entry?.postBattleBeatIndex);
}

export function getStoryEncounterBeats(scene, entry, phase) {
    const beats = Array.isArray(scene?.beats) ? scene.beats : [];
    if (!entry || phase === StoryEncounterPhase.FULL) return beats;

    const selected = phase === StoryEncounterPhase.POST_BATTLE
        ? beats.slice(entry.postBattleBeatIndex)
        : beats.slice(0, entry.combatStartBeatIndex);

    // Enter/exit beats are runtime directions. Dialogue presentation handles
    // only narration and spoken lines on either side of the combat boundary.
    return selected.filter(beat => !['enter', 'exit'].includes(beat?.beat));
}

export function validateStoryEncounterContract(scene, entry) {
    const errors = [];
    if (!scene) return ['missing scene'];
    if (!entry) return ['missing encounter contract'];
    if (scene.id !== entry.sceneId) errors.push('scene id mismatch');

    const startBeat = scene.beats?.[entry.combatStartBeatIndex];
    if (!startBeat || startBeat.beat !== 'exit') {
        errors.push('combat start must point to an exit beat');
    }

    if (hasPostBattlePresentation(entry)) {
        const postBeat = scene.beats?.[entry.postBattleBeatIndex];
        if (!postBeat || postBeat.beat !== 'enter') {
            errors.push('post-battle start must point to an enter beat');
        }
        if (entry.postBattleBeatIndex <= entry.combatStartBeatIndex) {
            errors.push('post-battle beats must follow combat start');
        }
    }

    return errors;
}
