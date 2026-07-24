import { getStoryObjectiveHint, getTownNpcActionCopy } from '../data/StoryObjectiveHints.js';
import { storySceneManager } from './StorySceneManager.js';
import { chapterOneProgressionManager } from './ChapterOneProgressionManager.js';
import GameManager from './GameManager.js';
import { GuildTutorialFlag } from '../data/GuildTutorial.js';
import { PROLOGUE_TUTORIAL_RESOLVED_FLAG } from '../data/StoryStateContract.js';
import { getSceneRegionBinding } from '../data/ChapterRegionRegistry.js';
import {
    getTownSceneBinding,
    TownSceneTrigger
} from '../data/TownPlaces.js';
import { ChapterOneInvestigationOrder } from '../data/ChapterOneProgression.js';

class StoryGuidanceManager {
    resolveChapterOneTrigger(sceneId, context = {}) {
        if (sceneId === 'ch1_s06_three_landmarks') {
            const investigations = context.chapterOneInvestigations || {};
            const farmlandComplete = Boolean(investigations.south_gate_farmland?.evidence);
            if (farmlandComplete
                && context.chapterOneFirstReportPending
                && !context.chapterOneFirstReportComplete) {
                return {
                    trigger: TownSceneTrigger.NPC_INTERACT,
                    placeId: 'gate',
                    actorId: 'standard_bearer_frey',
                    targetId: null
                };
            }
            if (farmlandComplete
                && context.chapterOneFirstReportComplete
                && !context.chapterOneHomeRecoveryKnown) {
                return {
                    trigger: TownSceneTrigger.NPC_INTERACT,
                    placeId: 'mia_workroom',
                    actorId: 'herbalist',
                    targetId: null
                };
            }
            const pendingTargetId = farmlandComplete && !context.chapterOneFirstReportComplete
                ? 'south_gate_entry'
                : ChapterOneInvestigationOrder.find(id => !investigations[id]?.evidence);
            return {
                trigger: 'location_inspect',
                placeId: null,
                actorId: null,
                targetId: pendingTargetId || getSceneRegionBinding(sceneId)?.targetId || null
            };
        }

        if (sceneId === 'ch1_s11_roads_breathe_again') {
            const stage = context.chapterOneClosingReportStage || null;
            return {
                trigger: TownSceneTrigger.NPC_INTERACT,
                placeId: stage?.placeId || 'gate',
                actorId: stage?.actorId || 'standard_bearer_frey',
                targetId: null
            };
        }
        return null;
    }

    resolveSceneTrigger(sceneId, context = {}) {
        const chapterOneTrigger = this.resolveChapterOneTrigger(sceneId, context);
        if (chapterOneTrigger) return chapterOneTrigger;

        const townBinding = getTownSceneBinding(sceneId);
        if (townBinding) return townBinding;

        const regionBinding = getSceneRegionBinding(sceneId);
        if (regionBinding) {
            return {
                ...regionBinding,
                placeId: null,
                actorId: null
            };
        }
        return null;
    }

    createTownNpcAction(type, details = {}) {
        const directive = details.directive || null;
        const stage = details.stage || null;
        const authored = getTownNpcActionCopy(type);
        const title = stage?.title || directive?.title || authored?.title;
        const summary = stage?.text || directive?.text || authored?.text;
        if (!title || !summary) {
            throw new Error(`Town NPC action "${type}" is missing authored presentation copy`);
        }

        return Object.freeze({
            ...details,
            type,
            title,
            summary
        });
    }

    getCurrent(context = {}) {
        if (!GameManager.getFlag(GuildTutorialFlag.COMPLETE)
            || !GameManager.getFlag(PROLOGUE_TUTORIAL_RESOLVED_FLAG)) return null;

        const sceneId = storySceneManager.getNextAvailableSceneId();
        if (!sceneId) return null;

        const runtimeContext = {
            ...chapterOneProgressionManager.getObjectiveContext(),
            ...context
        };
        const hint = getStoryObjectiveHint(sceneId, runtimeContext);
        if (!hint) return null;
        const trigger = this.resolveSceneTrigger(sceneId, runtimeContext);
        if (!trigger) return null;

        const targetType = trigger.placeId
            ? 'town'
            : (trigger.targetId ? 'adventure' : hint.stageClass);

        return Object.freeze({
            ...hint,
            trigger: trigger.trigger || null,
            placeId: trigger.placeId || null,
            actorId: trigger.actorId || null,
            targetId: trigger.targetId || null,
            binding: trigger,
            targetType,
            route: targetType === 'town' ? 'lobby' : 'adventure'
        });
    }

    isActorTarget(actorId, context = {}) {
        return this.getInformationMarker({ actorId }, context).visible;
    }

    isPlaceTarget(placeId, context = {}) {
        return this.getInformationMarker({ placeId }, context).visible;
    }

    isAdventureTarget(targetId, context = {}) {
        return this.getInformationMarker({ targetId }, context).visible;
    }

    getInformationMarker(target = {}, context = {}) {
        const directive = this.getCurrent(context);
        const matchesDirective = Boolean(
            (target.actorId && directive?.actorId === target.actorId)
            || (target.placeId && directive?.placeId === target.placeId)
            || (target.targetId && directive?.targetId === target.targetId)
        );
        return Object.freeze({
            kind: 'new-information',
            visible: Boolean(
                matchesDirective
                || target.hasUnreadDialogue
                || target.hasUnreadInteraction
            )
        });
    }

    getTownNpcAction(npcId, context = {}) {
        const directive = this.getCurrent(context);
        if (directive?.actorId === npcId) {
            if (directive.sceneId === 'ch1_s11_roads_breathe_again') {
                const stage = chapterOneProgressionManager.getClosingReportStage();
                return this.createTownNpcAction('chapter-one-closing-report', { stage, directive });
            }
            if (npcId === 'standard_bearer_frey'
                && directive.sceneId === 'ch1_s06_three_landmarks'
                && chapterOneProgressionManager.isFirstReportPending()) {
                return this.createTownNpcAction('chapter-one-first-report', { directive });
            }
            if (npcId === 'herbalist'
                && directive.sceneId === 'ch1_s06_three_landmarks'
                && !chapterOneProgressionManager.hasCompletedHomeRecovery()) {
                return this.createTownNpcAction('chapter-one-home-recovery', { directive });
            }
            return this.createTownNpcAction('story-scene', { sceneId: directive.sceneId, directive });
        }

        if (npcId === 'herbalist' && chapterOneProgressionManager.needsMiaEmergencyPotionSupport()) {
            return this.createTownNpcAction('mia-emergency-potions');
        }
        return Object.freeze({ type: 'dialogue' });
    }

    getTownPlaceAction(placeId, context = {}) {
        const directive = this.getCurrent(context);
        if (!directive
            || directive.trigger !== TownSceneTrigger.PLACE_INTERACT
            || directive.placeId !== placeId) return null;
        return Object.freeze({
            type: 'story-scene',
            sceneId: directive.sceneId,
            id: directive.binding?.targetId || directive.sceneId,
            label: directive.binding?.label || directive.title,
            shortLabel: directive.binding?.shortLabel || directive.binding?.label || directive.title,
            icon: directive.binding?.icon || '!',
            imageId: directive.binding?.imageId || null,
            description: directive.binding?.description || directive.text,
            position: directive.binding?.position || null
        });
    }

    getSceneContinuation(completedSceneId, context = {}) {
        const directive = this.getCurrent(context);
        if (!directive
            || directive.trigger !== TownSceneTrigger.SCENE_CONTINUE
            || completedSceneId === directive.sceneId) return null;
        return Object.freeze({
            type: 'story-scene',
            sceneId: directive.sceneId,
            placeId: directive.placeId || null
        });
    }

    getInitialTownAction(context = {}) {
        if (!GameManager.getFlag(GuildTutorialFlag.COMPLETE)
            && storySceneManager.getNextAvailableSceneId() === 'ch1_s01_road_collapse') {
            return Object.freeze({ type: 'navigate', route: 'guild' });
        }
        if (chapterOneProgressionManager.shouldAutoStartFirstReport()) {
            return this.createTownNpcAction('chapter-one-first-report');
        }

        const sceneId = storySceneManager.getNextAvailableSceneId();
        if (sceneId === 'ch1_s01_road_collapse') {
            return Object.freeze({ type: 'navigate', route: 'adventure' });
        }
        if (sceneId === 'ch1_s02_wake_under_bitter_bottles'
            && storySceneManager.isPrologueWakeDialoguePending()) {
            const directive = getStoryObjectiveHint(sceneId, chapterOneProgressionManager.getObjectiveContext());
            return this.createTownNpcAction('story-scene', { sceneId, placeId: 'mia_workroom', directive });
        }
        const directive = this.getCurrent(context);
        if (directive?.trigger === TownSceneTrigger.TOWN_ARRIVAL) {
            const allowedReasons = directive.binding?.allowedArrivalReasons || [];
            if (!allowedReasons.length || allowedReasons.includes(context.townArrivalReason)) {
                return this.createTownNpcAction('story-scene', {
                    sceneId: directive.sceneId,
                    placeId: directive.placeId,
                    directive
                });
            }
        }
        return null;
    }
}

export const storyGuidanceManager = new StoryGuidanceManager();
export default storyGuidanceManager;
