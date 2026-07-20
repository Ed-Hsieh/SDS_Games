import { getStoryObjectiveHint } from '../data/StoryObjectiveHints.js';
import { storySceneManager } from './StorySceneManager.js';
import { chapterOneProgressionManager } from './ChapterOneProgressionManager.js';

class StoryGuidanceManager {
    getCurrent(context = {}) {
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
        const directive = this.getCurrent(context);
        return Boolean(actorId && directive?.actorId === actorId);
    }

    isPlaceTarget(placeId, context = {}) {
        const directive = this.getCurrent(context);
        return Boolean(placeId && directive?.placeId === placeId);
    }

    getTownNpcAction(npcId, context = {}) {
        const directive = this.getCurrent(context);
        if (directive?.actorId === npcId) {
            if (npcId === 'standard_bearer_frey'
                && directive.sceneId === 'ch1_s06_three_landmarks'
                && chapterOneProgressionManager.isFirstReportPending()) {
                return Object.freeze({ type: 'chapter-one-first-report', directive });
            }
            if (npcId === 'herbalist'
                && directive.sceneId === 'ch1_s06_three_landmarks'
                && !chapterOneProgressionManager.hasCompletedHomeRecovery()) {
                return Object.freeze({ type: 'chapter-one-home-recovery', directive });
            }
            return Object.freeze({ type: 'story-scene', sceneId: directive.sceneId, directive });
        }

        if (npcId === 'herbalist' && chapterOneProgressionManager.needsMiaEmergencyPotionSupport()) {
            return Object.freeze({ type: 'mia-emergency-potions' });
        }
        return Object.freeze({ type: 'dialogue' });
    }

    getInitialTownAction() {
        if (chapterOneProgressionManager.shouldStartFirstReport()) {
            return Object.freeze({ type: 'chapter-one-first-report' });
        }

        const sceneId = storySceneManager.getNextAvailableSceneId();
        if (sceneId === 'ch1_s01_road_collapse') {
            return Object.freeze({ type: 'navigate', route: 'adventure' });
        }
        if (sceneId === 'ch1_s02_wake_under_bitter_bottles'
            && storySceneManager.isPrologueWakeDialoguePending()) {
            return Object.freeze({ type: 'story-scene', sceneId, placeId: 'mia_workroom' });
        }
        return null;
    }
}

export const storyGuidanceManager = new StoryGuidanceManager();
export default storyGuidanceManager;
