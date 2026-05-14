/**
 * WorldInteractionManager.js
 * Applies world discoveries from map events, objects, vendors, tower floors, and dungeons.
 */

import GameManager from './GameManager.js';
import { questManager, QuestStatus } from './QuestManager.js';
import { getQuestById } from '../data/Quests.js';
import { getWorldInteraction } from '../data/WorldInteractions.js';
import { showGlobalToast } from '../utils/UIFeedback.js';
import { unlockRecipeBlueprints } from './BlueprintManager.js';

class WorldInteractionManager {
    constructor() {
        this.journal = [];
    }

    getResolvedFlag(interactionId) {
        return `worldInteraction.${interactionId}.resolved`;
    }

    hasResolved(interactionId) {
        return Boolean(GameManager.getFlag(this.getResolvedFlag(interactionId)));
    }

    trigger(interactionId, context = {}) {
        const interaction = getWorldInteraction(interactionId);
        if (!interaction) {
            return {
                success: false,
                messages: [`未知的世界互動：${interactionId}`]
            };
        }

        if (interaction.oneTime && this.hasResolved(interactionId)) {
            return {
                success: false,
                interaction,
                messages: [interaction.repeatMessage || '這裡已經沒有新的線索。']
            };
        }

        const messages = [];
        const unlockedQuests = [];
        const recipeUnlocks = unlockRecipeBlueprints(interaction.unlockRecipes || []);

        for (const flag of interaction.flags || []) {
            GameManager.setFlag(flag, true);
        }

        if (interaction.oneTime) {
            GameManager.setFlag(this.getResolvedFlag(interactionId), true);
        }

        for (const questId of interaction.unlockQuests || []) {
            const before = questManager.getQuestState(questId);
            questManager.unlockQuest(questId);
            const after = questManager.getQuestState(questId);

            if (before.status === QuestStatus.LOCKED && after.status !== QuestStatus.LOCKED) {
                const quest = getQuestById(questId);
                unlockedQuests.push(quest || { id: questId, name: questId });
            }
        }

        if (interaction.message) messages.push(interaction.message);
        for (const quest of unlockedQuests) {
            messages.push(`新的任務線索已記錄：${quest.name}`);
        }
        for (const unlock of recipeUnlocks) {
            if (unlock.newlyUnlocked) messages.push(`取得製作圖：${unlock.recipe.name}`);
        }

        const entry = {
            id: interactionId,
            title: interaction.title,
            source: context.source || interaction.source,
            timestamp: Date.now(),
            unlockedQuests: unlockedQuests.map(quest => quest.id),
            unlockedRecipes: recipeUnlocks.filter(unlock => unlock.newlyUnlocked).map(unlock => unlock.recipeId)
        };
        this.journal.unshift(entry);

        if (context.toast !== false && typeof document !== 'undefined') {
            showGlobalToast('發現線索', interaction.title, 'info');
        }

        return {
            success: true,
            interaction,
            messages,
            unlockedQuests,
            unlockedRecipes: recipeUnlocks,
            entry
        };
    }

    getJournal() {
        return [...this.journal];
    }
}

export const worldInteractionManager = new WorldInteractionManager();
export default WorldInteractionManager;
