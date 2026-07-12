/**
 * StorySceneManager.js
 * Run-aware owner for the 66-scene screenplay. It applies scene and achievement
 * flags only; item, equipment, material, currency, and reward effects are
 * deliberately outside this pass.
 */

import GameManager from './GameManager.js';
import {
    StorySceneOrder,
    getStoryScene
} from '../data/StorySceneRegistry.js';
import { getStoryActor, getStoryExpressionLayer } from '../data/StoryActors.js?v=mia-layer-test-20260712x';
import {
    applyStorySceneEffects,
    clearCurrentRunStoryFlags,
    getStoryEncounterVictoryFlag,
    getStorySceneCompleteFlag
} from '../data/StoryStateContract.js?v=dialogue-flow-20260712w';
import {
    StoryEncounterPhase,
    StoryEncounterTransition,
    getStoryEncounterBeats,
    getStoryEncounterContract,
    getStoryEncounterContractById,
    hasPostBattlePresentation
} from '../data/StoryEncounterContracts.js';
import { isOptionalStoryScene } from '../data/ChapterRegionRegistry.js';
import { storyJournalManager } from './StoryJournalManager.js';

export const StoryRun = Object.freeze({
    FIRST: 1,
    SECOND: 2
});

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
        const expression = beat.expression || 'neutral';
        return {
            ...beat,
            actorId: actor?.id || null,
            speaker: actor?.name || '',
            role: actor?.role || '',
            portrait: actor?.portrait || null,
            isNarration: beat.beat !== 'speaker',
            expression: beat.expression,
            expressionLayer: actor ? getStoryExpressionLayer(actor.id, expression) : null,
            background: scene.background,
            viewpoint: scene.viewpoint
        };
    }

    buildPresentation(sceneId, options = {}) {
        const scene = getStoryScene(sceneId);
        if (!scene) return null;
        const encounter = this.getEncounterContract(sceneId);
        const scenePhase = this.getScenePhase(sceneId, options.phase);
        const sourceBeats = encounter
            ? getStoryEncounterBeats(scene, encounter, scenePhase)
            : scene.beats;
        const beats = sourceBeats
            .filter(beat => this.matchesBeatCondition(beat.condition))
            .map(beat => this.resolveBeat(beat, scene));
        const participants = [...new Set(beats.map(beat => beat.actorId).filter(Boolean))]
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
            lines: beats,
            effectMessages: [],
            narrativeTitle: scene.id,
            narrativeSummary: scene.objective,
            tone: scene.stageClass,
            route: null,
            routeLabel: null,
            background: scene.background,
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
        GameManager.markSaveDirty?.('story-scene-complete');
        return {
            success: true,
            completed: true,
            sceneId,
            transition: StoryEncounterTransition.SCENE_COMPLETED,
            nextSceneId: this.getNextAvailableSceneAfter(sceneId),
            appliedEffects,
            discoveries,
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
            this.pendingEncounter = null;
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

    getNextAvailableSceneForActor(actorId, { stageClass = null } = {}) {
        if (!actorId) return null;
        const sceneId = this.getNextAvailableSceneId();
        const scene = getStoryScene(sceneId);
        if (!scene || (stageClass && scene.stageClass !== stageClass)) return null;
        const participates = scene.beats.some(beat =>
            beat.actorId === actorId && this.matchesBeatCondition(beat.condition)
        );
        return participates ? sceneId : null;
    }

    beginSecondRun() {
        if (!this.isFlagSet('story.secondRunUnlocked')) {
            return { success: false, reason: 'second_run_locked' };
        }
        const clearedFlags = clearCurrentRunStoryFlags(GameManager.state?.flags || {});
        this.completedSceneIds.clear();
        this.activeSceneId = null;
        this.activeScenePhase = null;
        this.pendingEncounter = null;
        this.runNumber = StoryRun.SECOND;
        this.currentChapter = 1;
        GameManager.setFlag?.('story.run', StoryRun.SECOND);
        GameManager.setFlag?.('story.chapter', 1);
        GameManager.setFlag?.('story.activeSceneId', null);
        GameManager.setFlag?.('story.activeScenePhase', null);
        GameManager.setFlag?.('story.lastSceneId', null);
        storyJournalManager.resetForRun(StoryRun.SECOND);
        GameManager.markSaveDirty?.('story-second-run');
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
