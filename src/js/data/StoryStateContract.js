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

const SceneEffects = Object.freeze({
    ch4_s06_flag_returns: {
        first_run: {
            flags: {
                'story.fate.frey': 'dead',
                [getStoryAchievementFlag(StoryAchievementIds.FLAG_DID_NOT_RETURN)]: true
            }
        },
        second_run: { flags: { 'story.fate.frey': 'alive', 'story.fate.tavi': 'alive' } }
    },
    ch5_s06_mia_operation: {
        first_run: {
            flags: {
                'story.fate.mia': 'dead',
                [getStoryAchievementFlag(StoryAchievementIds.WATER_WAS_COLD)]: true
            }
        },
        second_run: { flags: { 'story.fate.mia': 'alive' } }
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
    ch7_s07_last_core: {
        first_run: { flags: { 'story.fate.demonKing': 'surviving' } },
        second_run: { flags: { 'story.fate.demonKing': 'dead' } }
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
    'story.scene.',
    'story.encounter.',
    'story.fate.',
    'story.ailo.'
]);

const CurrentRunStoryKeys = Object.freeze([
    'story.activeSceneId',
    'story.activeScenePhase',
    'story.lastSceneId',
    'story.chapter',
    'story.ending',
    'story.campaignComplete'
]);

export function clearCurrentRunStoryFlags(flags = {}) {
    const cleared = [];
    for (const key of Object.keys(flags)) {
        if (CurrentRunStoryKeys.includes(key)
            || CurrentRunStoryPrefixes.some(prefix => key.startsWith(prefix))) {
            delete flags[key];
            cleared.push(key);
        }
    }
    return cleared;
}
