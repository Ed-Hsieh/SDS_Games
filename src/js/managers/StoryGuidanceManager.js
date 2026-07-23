import { getStoryObjectiveHint, getTownNpcActionCopy } from '../data/StoryObjectiveHints.js';
import { storySceneManager } from './StorySceneManager.js';
import { chapterOneProgressionManager } from './ChapterOneProgressionManager.js';
import GameManager from './GameManager.js';
import { GuildTutorialFlag } from '../data/GuildTutorial.js';
import { PROLOGUE_TUTORIAL_RESOLVED_FLAG } from '../data/StoryStateContract.js';

class StoryGuidanceManager {
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

        const targetType = hint.placeId
            ? 'town'
            : (hint.targetId ? 'adventure' : hint.stageClass);

        return Object.freeze({
            ...hint,
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

    getInitialTownAction() {
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
        return null;
    }
}

export const storyGuidanceManager = new StoryGuidanceManager();
export default storyGuidanceManager;
