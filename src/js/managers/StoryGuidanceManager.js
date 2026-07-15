import { getStoryObjectiveHint } from '../data/StoryObjectiveHints.js';
import { storySceneManager } from './StorySceneManager.js?v=chapter1-art-20260713a';

class StoryGuidanceManager {
    getCurrent(context = {}) {
        const sceneId = storySceneManager.getNextAvailableSceneId();
        if (!sceneId) return null;

        const hint = getStoryObjectiveHint(sceneId, context);
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
}

export const storyGuidanceManager = new StoryGuidanceManager();
export default storyGuidanceManager;
