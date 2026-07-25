/**
 * StorySceneManager.js
 * Run-aware owner for the 66-scene screenplay. It applies scene and achievement
 * flags and scene-owned forge-series unlocks only; item, equipment, material,
 * currency, and other reward effects are deliberately outside this pass.
 */

import GameManager from './GameManager.js';
import {
    StorySceneOrder,
    getStoryScene
} from '../data/StorySceneRegistry.js';
import { getStoryActor, getStoryExpressionLayer } from '../data/StoryActors.js';
import {
    PROLOGUE_TUTORIAL_OUTCOME_FLAG,
    PROLOGUE_TUTORIAL_RESOLVED_FLAG,
    PROLOGUE_WAKE_DIALOGUE_PENDING_FLAG,
    applyStorySceneEffects,
    getCurrentRunStoryFlagKeys,
    getStoryEncounterVictoryFlag,
    getStorySceneCompleteFlag
} from '../data/StoryStateContract.js';
import {
    StoryEncounterPhase,
    StoryEncounterTransition,
    getStoryEncounterBeats,
    getStoryEncounterContract,
    getStoryEncounterContractById,
    hasPostBattlePresentation
} from '../data/StoryEncounterContracts.js';
import { isOptionalStoryScene } from '../data/ChapterRegionRegistry.js';
import { getStoryObjectiveHint } from '../data/StoryObjectiveHints.js';
import { storyJournalManager } from './StoryJournalManager.js';
import { unlockRecipeSeriesForScene } from './BlueprintManager.js';

export const StoryRun = Object.freeze({
    FIRST: 1,
    SECOND: 2
});

export const STORY_SCENE_BACKGROUNDS = Object.freeze({
    ch1_s01_road_collapse: 'src/assets/images/art/scenes/world/landmarks/south-road-broken.webp',
    ch1_s02_wake_under_bitter_bottles: 'src/assets/images/art/scenes/town/locations/mia_workroom.webp',
    ch1_s03_broken_crossroads: 'src/assets/images/art/scenes/town/locations/crossroads-broken.webp',
    ch1_s04_elder_to_scholar: 'src/assets/images/art/scenes/town/locations/handbook.webp',
    ch1_s05_south_gate_introduction: 'src/assets/images/art/scenes/town/locations/gate-broken.webp',
    ch1_s08_cold_forge_smoke: 'src/assets/images/art/scenes/town/locations/forge-cold.webp',
    ch1_s11_roads_breathe_again: 'src/assets/images/art/scenes/town/locations/crossroads-recovery-1.webp',
    ch2_s01_empty_crates: 'src/assets/images/art/scenes/town/locations/market-sparse.webp',
    ch2_s02_name_under_basket: 'src/assets/images/art/scenes/town/locations/mia_workroom.webp',
    ch2_s03_ledger_that_would_not_close: 'src/assets/images/art/scenes/town/locations/handbook.webp',
    ch2_s04_mist_and_tomb_route: 'src/assets/images/art/scenes/world/landmarks/mist_tablet_hill.webp',
    ch2_s05_moon_moss_trace: 'src/assets/images/art/scenes/world/landmarks/moon_moss_slope.webp',
    ch2_s06_keeper_of_names: 'src/assets/images/art/scenes/world/landmarks/opened_ancient_tomb.webp',
    ch2_s07_names_return_to_town: 'src/assets/images/art/scenes/town/locations/civic-room-working.webp',
    ch2_s08_shadow_at_the_checkpoint: 'src/assets/images/art/scenes/world/landmarks/cut_roadsign.webp',
    ch3_s01_dead_checkpoint: 'src/assets/images/art/scenes/world/landmarks/obsidian_keep_gate.webp',
    ch3_s02_shadows_count_names: 'src/assets/images/art/scenes/town/locations/forge.webp',
    ch3_s03_lamp_oil_in_fog: 'src/assets/images/art/scenes/town/locations/gate-working.webp',
    ch3_s04_showcase_glass: 'src/assets/images/art/scenes/backgrounds/casino-prize-wall.webp',
    ch3_s05_blank_creditor_trace: 'src/assets/images/art/scenes/town/locations/alley.webp',
    ch3_s06_drowned_voice: 'src/assets/images/art/scenes/world/landmarks/sunken_altar_reef.webp',
    ch3_s07_old_command_post: 'src/assets/images/art/scenes/world/landmarks/black_iron_storehouse.webp',
    ch3_s08_shadow_commander: 'src/assets/images/art/scenes/world/landmarks/black_iron_storehouse.webp',
    ch3_s09_temptation_and_orders: 'src/assets/images/art/scenes/town/locations/civic-room-working.webp',
    ch4_s01_road_moves_underfoot: 'src/assets/images/art/scenes/world/landmarks/stone-route-moving-wall.webp',
    ch4_s02_caravan_rear_missing: 'src/assets/images/art/scenes/town/locations/market.webp',
    ch4_s03_thorn_value_rule: 'src/assets/images/art/scenes/world/landmarks/thorn_glasshouse_ruin.webp',
    ch4_s04_gray_ridge_evacuates: 'src/assets/images/art/scenes/world/landmarks/gray-ridge-causeway.webp',
    ch4_s05_body_locks: 'src/assets/images/art/scenes/world/landmarks/gray-ridge-rear-marker.webp',
    ch4_s06_flag_returns: 'src/assets/images/art/scenes/world/landmarks/gray-ridge-center-span-aftermath.webp',
    ch4_s07_titan_rises: 'src/assets/images/art/scenes/world/landmarks/titan-vein-ruins-awakened.webp',
    ch4_s08_returned_objects: 'src/assets/images/art/scenes/town/locations/forge.webp',
    ch4_s09_four_elements_one_report: 'src/assets/images/art/scenes/town/locations/civic-room-working.webp',
    ch5_s01_four_fronts_converge: 'src/assets/images/art/scenes/town/locations/civic-room-working.webp',
    ch5_s02_forge_contracts: 'src/assets/images/art/scenes/town/locations/forge.webp',
    ch5_s03_elemental_convergence: 'src/assets/images/art/scenes/world/landmarks/four-front-convergence.webp',
    ch5_s04_elemental_lord: 'src/assets/images/art/entities/monsters/elemental_lord.webp',
    ch5_s05_fourfold_shrapnel: 'src/assets/images/art/scenes/world/landmarks/four-front-emergency-return.webp',
    ch5_s06_mia_operation: 'src/assets/images/art/scenes/town/locations/mia-workroom-operation.webp',
    ch5_s07_after_the_ratchet: 'src/assets/images/art/scenes/town/locations/mia_workroom.webp',
    ch5_s08_expedition_list: 'src/assets/images/art/scenes/town/locations/civic-room-working.webp',
    ch5_s09_whistle_cache: 'src/assets/images/art/scenes/world/landmarks/old-waystation-cache.webp',
    ch5_s10_before_dawn: 'src/assets/images/art/scenes/town/locations/gate-working.webp',
    ch5_s11_town_loses_its_voice: 'src/assets/images/art/scenes/town/locations/crossroads-recovery-1.webp',
    ch6_s01_northern_drake_watch: 'src/assets/images/art/scenes/world/maps/overworld_dragon_scar.webp',
    ch6_s02_scar_aftermath: 'src/assets/images/art/scenes/world/landmarks/abyssal_seal_break.webp',
    ch6_s03_stop_before_the_line: 'src/assets/images/art/entities/monsters/elder_dragon.webp',
    ch6_s04_dragon_convergence: 'src/assets/images/art/entities/monsters/elder_dragon.webp',
    ch6_s05_after_the_broad_road: 'src/assets/images/art/scenes/world/landmarks/dragon_heat_crag.webp',
    ch6_s06_settlement_throw: 'src/assets/images/art/scenes/backgrounds/casino-game-table.webp',
    ch6_s07_house_changes_seats: 'src/assets/images/art/scenes/backgrounds/casino-game-table.webp',
    ch6_s08_brush_past_or_invitation: 'src/assets/images/art/scenes/town/locations/gate-working.webp',
    ch6_s09_the_old_note_answers: 'src/assets/images/art/scenes/world/landmarks/old-waystation-cache.webp',
    ch7_s01_narrow_human_road: 'src/assets/images/art/scenes/world/maps/overworld_fall_site.webp',
    ch7_s02_ruined_flower_field: 'src/assets/images/art/scenes/world/landmarks/ruined-flower-field.webp',
    ch7_s03_echo_memory: 'src/assets/images/art/scenes/world/landmarks/ruined-flower-field.webp',
    ch7_s04_three_anchor_check: 'src/assets/images/art/scenes/world/landmarks/final-mountain-camp.webp',
    ch7_s05_fall_site_audience: 'src/assets/images/art/entities/monsters/demon_lord_asariel.webp',
    ch7_s06_combat_body_falls: 'src/assets/images/art/entities/monsters/demon_lord_asariel.webp',
    ch7_s07_last_core: 'src/assets/images/art/entities/monsters/demon_lord_asariel.webp',
    ch7_s08_return_to_town: 'src/assets/images/art/scenes/backgrounds/town-overview-recovery.webp',
    ch7_s09_first_or_second_epilogue: 'src/assets/images/art/scenes/backgrounds/town-overview-recovery.webp'
});

const STORY_BEAT_BACKGROUNDS = Object.freeze({
    ch2_s03_ledger_that_would_not_close: Object.freeze({
        any: Object.freeze([
            Object.freeze({ from: 1, to: 10, image: 'src/assets/images/art/scenes/town/locations/civic-room-working.webp' }),
            Object.freeze({ from: 11, to: 14, image: 'src/assets/images/art/scenes/town/locations/mia_workroom.webp' }),
            Object.freeze({ from: 15, to: 19, image: 'src/assets/images/art/scenes/town/locations/forge.webp' })
        ])
    }),
    ch2_s07_names_return_to_town: Object.freeze({
        any: Object.freeze([
            Object.freeze({ from: 1, to: 14, image: 'src/assets/images/art/scenes/town/locations/civic-room-working.webp' }),
            Object.freeze({ from: 15, to: 21, image: 'src/assets/images/art/scenes/town/locations/market-sparse.webp' })
        ])
    }),
    ch3_s02_shadows_count_names: Object.freeze({
        any: Object.freeze([
            Object.freeze({ from: 1, to: 11, image: 'src/assets/images/art/scenes/town/locations/forge.webp' }),
            Object.freeze({ from: 12, to: 20, image: 'src/assets/images/art/scenes/town/locations/mia_workroom.webp' })
        ])
    }),
    ch3_s09_temptation_and_orders: Object.freeze({
        any: Object.freeze([
            Object.freeze({ from: 1, to: 7, image: 'src/assets/images/art/scenes/town/locations/civic-room-working.webp' }),
            Object.freeze({ from: 8, to: 16, image: 'src/assets/images/art/scenes/town/locations/mia_workroom.webp' }),
            Object.freeze({ from: 17, to: 23, image: 'src/assets/images/art/scenes/town/locations/gate-working.webp' }),
            Object.freeze({ from: 24, to: 28, image: 'src/assets/images/art/scenes/town/locations/market.webp' }),
            Object.freeze({ from: 29, to: 35, image: 'src/assets/images/art/scenes/town/locations/civic-room-working.webp' })
        ])
    }),
    ch4_s02_caravan_rear_missing: Object.freeze({
        any: Object.freeze([
            Object.freeze({ from: 1, to: 5, image: 'src/assets/images/art/scenes/town/locations/market.webp' }),
            Object.freeze({ from: 6, to: 12, image: 'src/assets/images/art/scenes/town/locations/forge.webp' })
        ])
    }),
    ch4_s06_flag_returns: Object.freeze({
        first_run: Object.freeze([
            Object.freeze({
                from: 7,
                to: 9,
                image: 'src/assets/images/art/scenes/story/cg/frey-last-standard.webp'
            })
        ])
    }),
    ch4_s08_returned_objects: Object.freeze({
        first_run: Object.freeze([
            Object.freeze({ from: 1, to: 7, image: 'src/assets/images/art/scenes/town/locations/forge-grief.webp' }),
            Object.freeze({ from: 8, to: 10, image: 'src/assets/images/art/scenes/town/locations/gate-after-frey.webp' })
        ]),
        second_run: Object.freeze([
            Object.freeze({ from: 1, to: 21, image: 'src/assets/images/art/scenes/town/locations/forge.webp' })
        ]),
        any: Object.freeze([
            Object.freeze({ from: 22, to: 29, image: 'src/assets/images/art/scenes/town/locations/mia_workroom.webp' })
        ])
    }),
    ch4_s09_four_elements_one_report: Object.freeze({
        any: Object.freeze([
            Object.freeze({ from: 1, to: 14, image: 'src/assets/images/art/scenes/town/locations/civic-room-working.webp' }),
            Object.freeze({ from: 15, to: 18, image: 'src/assets/images/art/scenes/world/landmarks/stone-route-moving-wall.webp' }),
            Object.freeze({ from: 19, to: 26, image: 'src/assets/images/art/scenes/backgrounds/casino-prize-wall.webp' })
        ])
    }),
    ch5_s03_elemental_convergence: Object.freeze({
        second_run: Object.freeze([
            Object.freeze({ from: 5, to: 10, image: 'src/assets/images/art/scenes/town/locations/forge.webp' })
        ])
    }),
    ch5_s05_fourfold_shrapnel: Object.freeze({
        any: Object.freeze([
            Object.freeze({ from: 5, to: 10, image: 'src/assets/images/art/scenes/town/locations/mia-workroom-operation.webp' })
        ])
    }),
    ch5_s07_after_the_ratchet: Object.freeze({
        first_run: Object.freeze([
            Object.freeze({ from: 1, to: 2, image: 'src/assets/images/art/scenes/town/locations/mia-workroom-after-loss.webp' }),
            Object.freeze({ from: 3, to: 9, image: 'src/assets/images/art/scenes/town/locations/civic-room-depleted.webp' })
        ])
    }),
    ch5_s10_before_dawn: Object.freeze({
        first_run: Object.freeze([
            Object.freeze({ from: 1, to: 4, image: 'src/assets/images/art/scenes/town/locations/civic-room-depleted.webp' })
        ]),
        second_run: Object.freeze([
            Object.freeze({ from: 6, to: 15, image: 'src/assets/images/art/scenes/town/locations/gate-working.webp' })
        ])
    }),
    ch6_s06_settlement_throw: Object.freeze({
        any: Object.freeze([
            Object.freeze({ from: 1, to: 1, image: 'src/assets/images/art/scenes/town/locations/civic-room-depleted.webp' }),
            Object.freeze({ from: 2, to: 15, image: 'src/assets/images/art/scenes/backgrounds/casino-game-table.webp' })
        ])
    }),
    ch6_s07_house_changes_seats: Object.freeze({
        second_run: Object.freeze([
            Object.freeze({ from: 6, to: 16, image: 'src/assets/images/art/scenes/backgrounds/casino-game-table.webp' }),
            Object.freeze({ from: 17, to: 20, image: 'src/assets/images/art/scenes/backgrounds/casino-prize-wall.webp' })
        ])
    }),
    ch5_s11_town_loses_its_voice: Object.freeze({
        first_run: Object.freeze([
            Object.freeze({ from: 1, to: 1, image: 'src/assets/images/art/scenes/town/locations/mia-workroom-after-loss.webp' }),
            Object.freeze({ from: 2, to: 2, image: 'src/assets/images/art/scenes/town/locations/gate-after-frey.webp' }),
            Object.freeze({ from: 3, to: 6, image: 'src/assets/images/art/scenes/town/locations/crossroads-first-run-loss.webp' })
        ]),
        any: Object.freeze([
            Object.freeze({ from: 7, to: 11, image: 'src/assets/images/art/scenes/backgrounds/casino-prize-wall.webp' })
        ])
    }),
    ch7_s08_return_to_town: Object.freeze({
        first_run: Object.freeze([
            Object.freeze({ from: 1, to: 4, image: 'src/assets/images/art/scenes/town/locations/gate-after-frey.webp' }),
            Object.freeze({ from: 5, to: 5, image: 'src/assets/images/art/scenes/town/locations/mia-workroom-after-loss.webp' }),
            Object.freeze({ from: 6, to: 6, image: 'src/assets/images/art/scenes/town/locations/civic-room-depleted.webp' }),
            Object.freeze({ from: 7, to: 10, image: 'src/assets/images/art/scenes/town/locations/forge-grief.webp' }),
            Object.freeze({ from: 11, to: 11, image: 'src/assets/images/art/scenes/town/locations/casino.webp' }),
            Object.freeze({ from: 12, to: 16, image: 'src/assets/images/art/scenes/town/locations/civic-room-depleted.webp' })
        ]),
        second_run: Object.freeze([
            Object.freeze({ from: 17, to: 21, image: 'src/assets/images/art/scenes/town/locations/gate-working.webp' }),
            Object.freeze({ from: 22, to: 28, image: 'src/assets/images/art/scenes/town/locations/mia_workroom.webp' }),
            Object.freeze({ from: 29, to: 33, image: 'src/assets/images/art/scenes/town/locations/civic-room-working.webp' }),
            Object.freeze({ from: 34, to: 37, image: 'src/assets/images/art/scenes/town/locations/forge.webp' }),
            Object.freeze({ from: 38, to: 41, image: 'src/assets/images/art/scenes/town/locations/casino.webp' })
        ])
    }),
    ch7_s09_first_or_second_epilogue: Object.freeze({
        first_run: Object.freeze([
            Object.freeze({
                from: 1,
                to: 3,
                image: 'src/assets/images/art/scenes/backgrounds/town-overview-hollow-victory.webp'
            }),
            Object.freeze({
                from: 4,
                to: 7,
                image: 'src/assets/images/art/scenes/story/cg/demon-survives-ending.webp'
            })
        ]),
        second_run: Object.freeze([
            Object.freeze({
                from: 8,
                to: 11,
                image: 'src/assets/images/art/scenes/world/landmarks/ruined-flower-field.webp'
            }),
            Object.freeze({
                from: 12,
                to: 14,
                image: 'src/assets/images/art/scenes/world/maps/overworld_fall_site.webp'
            })
        ])
    })
});

function resolveStoryBackground(sceneId, beatOrder = null, runNumber = StoryRun.FIRST) {
    if (Number.isFinite(beatOrder)) {
        const runKey = runNumber === StoryRun.SECOND ? 'second_run' : 'first_run';
        const ranges = [
            ...(STORY_BEAT_BACKGROUNDS[sceneId]?.[runKey] || []),
            ...(STORY_BEAT_BACKGROUNDS[sceneId]?.any || [])
        ];
        const match = ranges.find(range => beatOrder >= range.from && beatOrder <= range.to);
        if (match) return match.image;
    }
    return STORY_SCENE_BACKGROUNDS[sceneId] || null;
}

class StorySceneManager {
    constructor() {
        this.completedSceneIds = new Set();
        this.activeSceneId = null;
        this.activeScenePhase = null;
        this.pendingEncounter = null;
        this.runNumber = StoryRun.FIRST;
        this.currentChapter = 1;
        GameManager.registerSaveSystem?.('storyScenes', this);
    }

    isFlagSet(flag) {
        return Boolean(flag && GameManager.getFlag?.(flag));
    }

    isPrologueTutorialResolved() {
        return this.isFlagSet(PROLOGUE_TUTORIAL_RESOLVED_FLAG);
    }

    resolvePrologueTutorial(outcome = 'defeat') {
        if (this.isPrologueTutorialResolved()) {
            return { success: false, reason: 'already_resolved', outcome: GameManager.getFlag(PROLOGUE_TUTORIAL_OUTCOME_FLAG) };
        }

        GameManager.setFlag(PROLOGUE_TUTORIAL_RESOLVED_FLAG, true, { reason: 'prologue-tutorial-resolved' });
        GameManager.setFlag(PROLOGUE_TUTORIAL_OUTCOME_FLAG, outcome, { reason: 'prologue-tutorial-resolved' });
        const health = GameManager.setCharacterHealth(1, { reason: 'prologue-tutorial-resolved' });
        return { success: true, outcome, hp: health?.hp || 1 };
    }

    isPrologueWakeDialoguePending() {
        return this.isFlagSet(PROLOGUE_WAKE_DIALOGUE_PENDING_FLAG);
    }

    completePrologueRescue() {
        GameManager.setFlag(PROLOGUE_WAKE_DIALOGUE_PENDING_FLAG, true);
        const recovery = GameManager.restoreCharacterAtHome('prologue-rescue');
        return { success: true, recovery };
    }

    consumePrologueWakeDialogue() {
        if (!this.isPrologueWakeDialoguePending()) return false;
        GameManager.setFlag(PROLOGUE_WAKE_DIALOGUE_PENDING_FLAG, false, { reason: 'prologue-wake-dialogue-consumed' });
        return true;
    }

    getRunNumber() {
        return Math.max(StoryRun.FIRST, Number(GameManager.getFlag?.('story.run')) || this.runNumber || 1);
    }

    getRunCondition() {
        return this.getRunNumber() >= StoryRun.SECOND ? 'second_run' : 'first_run';
    }

    isSceneComplete(sceneId) {
        return this.completedSceneIds.has(sceneId) || this.isFlagSet(getStorySceneCompleteFlag(sceneId));
    }

    getEncounterContract(sceneId) {
        return getStoryEncounterContract(sceneId, this.getRunNumber());
    }

    isEncounterResolved(encounterOrSceneId) {
        const entry = typeof encounterOrSceneId === 'string'
            ? (this.getEncounterContract(encounterOrSceneId)
                || getStoryEncounterContractById(encounterOrSceneId, this.getRunNumber()))
            : encounterOrSceneId;
        return Boolean(entry?.id && this.isFlagSet(getStoryEncounterVictoryFlag(entry.id)));
    }

    getPendingEncounter() {
        return this.pendingEncounter ? { ...this.pendingEncounter } : null;
    }

    getScenePhase(sceneId, requestedPhase = null) {
        const entry = this.getEncounterContract(sceneId);
        if (!entry) return StoryEncounterPhase.FULL;

        if ([StoryEncounterPhase.PRE_BATTLE, StoryEncounterPhase.POST_BATTLE].includes(requestedPhase)) {
            return requestedPhase;
        }
        if (this.activeSceneId === sceneId && this.activeScenePhase) {
            return this.activeScenePhase;
        }
        if (this.isEncounterResolved(entry) && hasPostBattlePresentation(entry)) {
            return StoryEncounterPhase.POST_BATTLE;
        }
        return StoryEncounterPhase.PRE_BATTLE;
    }

    matchesBeatCondition(condition = 'any') {
        if (!condition || condition === 'any') return true;
        if (condition === 'first_run') return this.getRunNumber() === StoryRun.FIRST;
        if (condition === 'second_run') return this.getRunNumber() >= StoryRun.SECOND;
        if (condition.startsWith('!')) return !this.isFlagSet(condition.slice(1));
        return this.isFlagSet(condition);
    }

    isSceneAvailableInRun(sceneId) {
        const scene = getStoryScene(sceneId);
        if (!scene) return false;
        return scene.beats.some(beat => this.matchesBeatCondition(beat.condition));
    }

    getAvailableSceneOrder() {
        return StorySceneOrder.filter(sceneId => this.isSceneAvailableInRun(sceneId));
    }

    getPreviousAvailableSceneId(sceneId) {
        const order = this.getAvailableSceneOrder();
        const index = order.indexOf(sceneId);
        for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
            if (!isOptionalStoryScene(order[cursor])) return order[cursor];
        }
        return null;
    }

    getNextAvailableSceneAfter(sceneId) {
        const order = this.getAvailableSceneOrder();
        const index = order.indexOf(sceneId);
        for (let cursor = index + 1; cursor < order.length; cursor += 1) {
            if (!isOptionalStoryScene(order[cursor])) return order[cursor];
        }
        return null;
    }

    canStartScene(sceneId, { force = false } = {}) {
        const scene = getStoryScene(sceneId);
        if (!scene) return { success: false, reason: 'missing_scene', scene: null };
        if (!this.isSceneAvailableInRun(sceneId)) {
            return { success: false, reason: 'scene_not_in_current_run', scene };
        }
        if (force) return { success: true, reason: null, scene };

        const previousSceneId = this.getPreviousAvailableSceneId(sceneId);
        if (previousSceneId && !this.isSceneComplete(previousSceneId)) {
            return { success: false, reason: 'previous_scene_incomplete', scene, previousSceneId };
        }
        return { success: true, reason: null, scene };
    }

    resolveActor(actorId) {
        if (!actorId) return null;
        return getStoryActor(actorId, { isFlagSet: flag => this.isFlagSet(flag) }) || {
            id: actorId,
            name: actorId,
            role: '故事角色'
        };
    }

    resolveBeat(beat, scene) {
        const actor = this.resolveActor(beat.actorId);
        const actors = (beat.actorIds || [])
            .map(actorId => this.resolveActor(actorId))
            .filter(Boolean);
        const expression = beat.expression || 'neutral';
        const backgroundImage = resolveStoryBackground(scene.id, beat.order, this.getRunNumber());
        return {
            ...beat,
            actorId: actor?.id || null,
            actorIds: actors.map(entry => entry.id),
            actors,
            speaker: actor?.name || '',
            role: actor?.role || '',
            portrait: actor?.portrait || null,
            standing: actor?.standing || null,
            standingFacing: actor?.standingFacing || 'center',
            isNarration: ['narration', 'cutaway'].includes(beat.beat),
            visualMode: beat.visualMode || (beat.beat === 'cutaway' ? 'cutaway' : null),
            expression: beat.expression,
            expressionLayer: actor ? getStoryExpressionLayer(actor.id, expression) : null,
            background: beat.background || scene.background,
            backgroundImage,
            viewpoint: scene.viewpoint
        };
    }

    buildPresentation(sceneId, options = {}) {
        const scene = getStoryScene(sceneId);
        if (!scene) return null;
        const objectiveHint = getStoryObjectiveHint(sceneId);
        const encounter = this.getEncounterContract(sceneId);
        const scenePhase = this.getScenePhase(sceneId, options.phase);
        const sourceBeats = encounter
            ? getStoryEncounterBeats(scene, encounter, scenePhase)
            : scene.beats;
        const beats = sourceBeats
            .filter(beat => this.matchesBeatCondition(beat.condition))
            .map(beat => this.resolveBeat(beat, scene));
        const participants = [...new Set(beats.flatMap(beat => (
            beat.actorIds?.length ? beat.actorIds : [beat.actorId]
        )).filter(Boolean))]
            .map(actorId => this.resolveActor(actorId));
        const lead = participants[0] || {
            id: 'narration',
            name: '故事',
            role: '敘事'
        };

        return {
            success: true,
            scene,
            sceneId,
            scenePhase,
            encounter: encounter ? {
                ...encounter,
                phase: scenePhase,
                resolved: this.isEncounterResolved(encounter)
            } : null,
            npc: lead,
            participants,
            lines: beats.filter(beat => ['narration', 'speaker', 'cutaway'].includes(beat.beat)),
            timeline: beats.filter(beat => (
                ['narration', 'speaker', 'cutaway'].includes(beat.beat)
                || (beat.stageAction && beat.actorIds?.length)
            )),
            effectMessages: [],
            narrativeTitle: scene.title || objectiveHint?.title || `第 ${scene.chapter} 章事件`,
            narrativeSummary: objectiveHint?.text || '繼續處理目前事件。',
            tone: scene.stageClass,
            route: null,
            routeLabel: null,
            background: resolveStoryBackground(scene.id, null, this.getRunNumber()) || scene.background,
            backgroundImage: resolveStoryBackground(scene.id, null, this.getRunNumber()),
            worldState: scene.worldState,
            viewpoint: scene.viewpoint,
            knowledgeBoundary: scene.knowledgeBoundary
        };
    }

    buildCheckpointPresentation(sceneId, checkpointId) {
        const scene = getStoryScene(sceneId);
        const checkpoint = scene?.checkpoints?.[checkpointId];
        if (!scene || !checkpoint) return null;
        const objectiveHint = getStoryObjectiveHint(sceneId);
        const [rangeStart, rangeEnd] = checkpoint.beatRange || [];
        const sourceBeats = checkpoint.beats || scene.beats.filter(beat => (
            Number.isFinite(rangeStart)
            && Number.isFinite(rangeEnd)
            && beat.order >= rangeStart
            && beat.order <= rangeEnd
        ));
        const beats = sourceBeats
            .filter(beat => this.matchesBeatCondition(beat.condition))
            .map(beat => ({
                ...this.resolveBeat(beat, scene),
                background: checkpoint.background || beat.background || scene.background,
                backgroundImage: checkpoint.backgroundImage || null
            }));
        const participants = [...new Set(beats.flatMap(beat => (
            beat.actorIds?.length ? beat.actorIds : [beat.actorId]
        )).filter(Boolean))]
            .map(actorId => this.resolveActor(actorId));

        return {
            success: true,
            scene,
            sceneId,
            checkpointId,
            npc: participants[0] || { id: 'narration', name: '故事', role: '敘事' },
            participants,
            lines: beats.filter(beat => ['narration', 'speaker', 'cutaway'].includes(beat.beat)),
            timeline: beats.filter(beat => (
                ['narration', 'speaker', 'cutaway'].includes(beat.beat)
                || (beat.stageAction && beat.actorIds?.length)
            )),
            effectMessages: [],
            narrativeTitle: checkpoint.title || scene.title || objectiveHint?.title || `第 ${scene.chapter} 章事件`,
            narrativeSummary: checkpoint.title || objectiveHint?.text || '繼續處理目前事件。',
            tone: scene.stageClass,
            route: null,
            routeLabel: null,
            background: checkpoint.background || scene.background,
            backgroundImage: checkpoint.backgroundImage || null,
            worldState: scene.worldState,
            viewpoint: scene.viewpoint,
            knowledgeBoundary: scene.knowledgeBoundary
        };
    }

    startScene(sceneId, options = {}) {
        const gate = this.canStartScene(sceneId, options);
        if (!gate.success) return { ...gate, lines: [], participants: [] };
        const scenePhase = this.getScenePhase(sceneId, options.phase);
        const encounter = this.getEncounterContract(sceneId);
        if (scenePhase === StoryEncounterPhase.POST_BATTLE
            && encounter
            && !this.isEncounterResolved(encounter)) {
            return { success: false, reason: 'encounter_not_resolved', scene: gate.scene, lines: [], participants: [] };
        }
        this.activeSceneId = sceneId;
        this.activeScenePhase = scenePhase;
        this.currentChapter = gate.scene.chapter;
        GameManager.setFlag?.('story.activeSceneId', sceneId);
        GameManager.setFlag?.('story.activeScenePhase', scenePhase);
        GameManager.setFlag?.('story.chapter', gate.scene.chapter);
        GameManager.markSaveDirty?.('story-scene-start');
        return this.buildPresentation(sceneId, { phase: scenePhase });
    }

    completeScene(sceneId = this.activeSceneId, options = {}) {
        const scene = getStoryScene(sceneId);
        if (!scene) return { success: false, reason: 'missing_scene' };
        const encounter = this.getEncounterContract(sceneId);
        const phase = this.getScenePhase(sceneId, options.phase || this.activeScenePhase);

        if (encounter) {
            if (phase === StoryEncounterPhase.PRE_BATTLE && !this.isEncounterResolved(encounter)) {
                const previousAttempts = this.pendingEncounter?.id === encounter.id
                    ? Number(this.pendingEncounter.attempts) || 0
                    : 0;
                this.pendingEncounter = {
                    ...encounter,
                    status: 'ready',
                    attempts: previousAttempts
                };
                this.activeSceneId = null;
                this.activeScenePhase = null;
                GameManager.setFlag?.('story.activeSceneId', null);
                GameManager.setFlag?.('story.activeScenePhase', null);
                GameManager.markSaveDirty?.('story-encounter-ready');
                return {
                    success: true,
                    completed: false,
                    sceneId,
                    transition: StoryEncounterTransition.ENCOUNTER_REQUIRED,
                    encounter: this.getPendingEncounter()
                };
            }

            if (phase === StoryEncounterPhase.POST_BATTLE && !this.isEncounterResolved(encounter)) {
                return {
                    success: false,
                    completed: false,
                    reason: 'encounter_not_resolved',
                    sceneId,
                    encounter
                };
            }
        }

        return this.finalizeScene(sceneId);
    }

    finalizeScene(sceneId) {
        const scene = getStoryScene(sceneId);
        if (!scene) return { success: false, reason: 'missing_scene' };
        this.completedSceneIds.add(sceneId);
        this.activeSceneId = null;
        this.activeScenePhase = null;
        if (this.pendingEncounter?.sceneId === sceneId) this.pendingEncounter = null;
        this.currentChapter = scene.chapter;
        GameManager.setFlag?.(getStorySceneCompleteFlag(sceneId), true);
        GameManager.setFlag?.('story.lastSceneId', sceneId);
        GameManager.setFlag?.('story.activeSceneId', null);
        GameManager.setFlag?.('story.activeScenePhase', null);
        GameManager.setFlag?.('story.chapter', scene.chapter);
        const appliedEffects = applyStorySceneEffects(
            sceneId,
            this.getRunNumber(),
            (flag, value) => GameManager.setFlag?.(flag, value)
        );
        const discoveries = storyJournalManager.recordSceneDiscoveries(sceneId, {
            runNumber: this.getRunNumber()
        });
        const blueprintUnlocks = unlockRecipeSeriesForScene(sceneId);
        GameManager.markSaveDirty?.('story-scene-complete');
        return {
            success: true,
            completed: true,
            sceneId,
            transition: StoryEncounterTransition.SCENE_COMPLETED,
            nextSceneId: this.getNextAvailableSceneAfter(sceneId),
            appliedEffects,
            discoveries,
            blueprintUnlocks,
            outputDescription: scene.outputsRaw
        };
    }

    beginEncounter(encounterId = this.pendingEncounter?.id) {
        const pending = this.pendingEncounter;
        if (!pending || pending.id !== encounterId) {
            return { success: false, reason: 'missing_pending_encounter', encounterId };
        }
        if (this.isEncounterResolved(pending)) {
            return { success: false, reason: 'encounter_already_resolved', encounter: { ...pending } };
        }

        this.pendingEncounter = {
            ...pending,
            status: 'active',
            attempts: (Number(pending.attempts) || 0) + 1
        };
        GameManager.markSaveDirty?.('story-encounter-start');
        return { success: true, encounter: this.getPendingEncounter() };
    }

    resolveEncounter(encounterId = this.pendingEncounter?.id, result = {}) {
        const pending = this.pendingEncounter;
        if (!pending || pending.id !== encounterId) {
            return { success: false, reason: 'missing_pending_encounter', encounterId };
        }

        const victory = typeof result === 'boolean' ? result : Boolean(result.victory);
        if (!victory) {
            const retry = { ...pending, status: 'retry' };
            this.pendingEncounter = retry;
            this.activeSceneId = null;
            this.activeScenePhase = null;
            GameManager.setFlag?.('story.activeSceneId', null);
            GameManager.setFlag?.('story.activeScenePhase', null);
            GameManager.markSaveDirty?.('story-encounter-retry');
            return {
                success: true,
                completed: false,
                victory: false,
                sceneId: retry.sceneId,
                transition: StoryEncounterTransition.RETRY_REQUIRED,
                encounter: retry
            };
        }

        GameManager.setFlag?.(getStoryEncounterVictoryFlag(pending.id), true);
        this.pendingEncounter = { ...pending, status: 'victory' };

        if (hasPostBattlePresentation(pending)) {
            this.activeSceneId = pending.sceneId;
            this.activeScenePhase = StoryEncounterPhase.POST_BATTLE;
            GameManager.setFlag?.('story.activeSceneId', pending.sceneId);
            GameManager.setFlag?.('story.activeScenePhase', StoryEncounterPhase.POST_BATTLE);
            GameManager.markSaveDirty?.('story-encounter-victory');
            return {
                success: true,
                completed: false,
                victory: true,
                sceneId: pending.sceneId,
                transition: StoryEncounterTransition.POST_BATTLE,
                encounter: this.getPendingEncounter(),
                presentation: this.buildPresentation(pending.sceneId, {
                    phase: StoryEncounterPhase.POST_BATTLE
                })
            };
        }

        this.pendingEncounter = null;
        GameManager.markSaveDirty?.('story-encounter-victory');
        return {
            ...this.finalizeScene(pending.sceneId),
            victory: true,
            encounter: { ...pending, status: 'victory' }
        };
    }

    getNextAvailableSceneId() {
        return this.getAvailableSceneOrder().find(sceneId =>
            !isOptionalStoryScene(sceneId) && !this.isSceneComplete(sceneId)
        ) || null;
    }

    beginSecondRun() {
        if (!this.isFlagSet('story.secondRunUnlocked')) {
            return { success: false, reason: 'second_run_locked' };
        }
        const clearedFlags = getCurrentRunStoryFlagKeys(GameManager.getFlagsByPrefix());
        this.completedSceneIds.clear();
        this.activeSceneId = null;
        this.activeScenePhase = null;
        this.pendingEncounter = null;
        this.runNumber = StoryRun.SECOND;
        this.currentChapter = 1;
        GameManager.updateFlags({
            'story.run': StoryRun.SECOND,
            'story.chapter': 1,
            'story.activeSceneId': null,
            'story.activeScenePhase': null,
            'story.lastSceneId': null
        }, {
            remove: clearedFlags,
            reason: 'story-second-run'
        });
        storyJournalManager.resetForRun(StoryRun.SECOND);
        return { success: true, sceneId: StorySceneOrder[0], clearedFlags };
    }

    serialize() {
        return {
            completedSceneIds: [...this.completedSceneIds],
            activeSceneId: this.activeSceneId,
            activeScenePhase: this.activeScenePhase,
            pendingEncounter: this.pendingEncounter ? { ...this.pendingEncounter } : null,
            runNumber: this.getRunNumber(),
            currentChapter: this.currentChapter
        };
    }

    deserialize(data = {}) {
        this.completedSceneIds = new Set(data.completedSceneIds || []);
        this.activeSceneId = data.activeSceneId || null;
        this.activeScenePhase = data.activeScenePhase || null;
        this.pendingEncounter = data.pendingEncounter
            ? {
                ...data.pendingEncounter,
                status: data.pendingEncounter.status === 'active' ? 'ready' : data.pendingEncounter.status
            }
            : null;
        this.runNumber = Math.max(1, Number(data.runNumber) || 1);
        this.currentChapter = Math.min(7, Math.max(1, Number(data.currentChapter) || 1));
    }

    resetProgress() {
        this.completedSceneIds.clear();
        this.activeSceneId = null;
        this.activeScenePhase = null;
        this.pendingEncounter = null;
        this.runNumber = StoryRun.FIRST;
        this.currentChapter = 1;
        storyJournalManager.resetForRun(StoryRun.FIRST);
    }
}

export const storySceneManager = new StorySceneManager();
export default StorySceneManager;
