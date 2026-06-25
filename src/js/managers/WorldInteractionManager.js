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
import { worldStoryManager } from './WorldStoryManager.js';
import { StoryEventTypes } from '../data/StoryProgressMap.js';

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

    getItemCount(itemId) {
        const countIn = stacks => (stacks || [])
            .filter(stack => stack?.item?.id === itemId)
            .reduce((sum, stack) => sum + (Number(stack.quantity) || 1), 0);
        return countIn(GameManager.state?.inventory) + countIn(GameManager.state?.warehouse);
    }

    getMissingRequiredItems(interaction) {
        return (interaction.requiredItems || []).filter(item => {
            const required = Math.max(1, Number(item.quantity) || 1);
            return this.getItemCount(item.id) < required;
        });
    }

    consumeRequiredItems(interaction, context = {}) {
        if (!interaction.consumeRequiredItems) return true;

        for (const requirement of interaction.requiredItems || []) {
            let remaining = Math.max(1, Number(requirement.quantity) || 1);

            if (context.providedInstanceId && context.providedItemId === requirement.id && remaining > 0) {
                const removed = GameManager.removeItemByInstanceId(context.providedInstanceId, Boolean(context.fromWarehouse));
                if (removed) remaining -= 1;
            }

            while (remaining > 0) {
                const removed = GameManager.removeMaterial(requirement.id, 1);
                if (!removed) return false;
                remaining -= 1;
            }
        }

        return true;
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
                messages: [interaction.repeatMessage || '這裡已經沒有新的紀錄。']
            };
        }

        const missingItems = this.getMissingRequiredItems(interaction);
        if (missingItems.length > 0) {
            const missingText = missingItems
                .map(item => `${item.name || item.id} x${item.quantity || 1}`)
                .join('、');
            return {
                success: false,
                interaction,
                missingItems,
                messages: [interaction.missingMessage || `缺少特殊道具：${missingText}`]
            };
        }

        const messages = [];
        const unlockedQuests = [];
        const acceptedQuests = [];
        const recipeUnlocks = unlockRecipeBlueprints(interaction.unlockRecipes || []);

        if (!this.consumeRequiredItems(interaction, context)) {
            return {
                success: false,
                interaction,
                messages: ['特殊道具交付失敗，請確認物品仍在背包或倉庫中。']
            };
        }

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

            const latest = questManager.getQuestState(questId);
            if (interaction.autoAcceptQuests === true && latest.status === QuestStatus.AVAILABLE) {
                const accepted = questManager.acceptQuest(questId);
                if (accepted.success) {
                    acceptedQuests.push(accepted.quest || getQuestById(questId) || { id: questId, name: questId });
                }
            }
        }

        if (interaction.message) messages.push(interaction.message);
        if (interaction.showQuestUnlockMessages !== false) {
            for (const quest of unlockedQuests) {
                messages.push(`新的委託紀錄已寫入：${quest.name}`);
            }
        }
        for (const unlock of recipeUnlocks) {
            if (unlock.newlyUnlocked) messages.push(`取得製作圖：${unlock.recipe.name}`);
        }
        for (const progress of interaction.progressObjectives || []) {
            if (!progress?.type || !progress?.target) continue;
            const changed = questManager.updateProgress(progress.type, progress.target, progress.amount || 1);
            if (changed && progress.message) messages.push(progress.message);
        }

        const storyOutcome = worldStoryManager.applyStoryEvent(StoryEventTypes.WORLD_INTERACTION, {
            interactionId,
            interaction,
            unlockedQuestIds: unlockedQuests.map(quest => quest.id),
            unlockedRecipeIds: recipeUnlocks.filter(unlock => unlock.newlyUnlocked).map(unlock => unlock.recipeId),
            source: context.source || interaction.source
        });

        const entry = {
            id: interactionId,
            title: interaction.title,
            source: context.source || interaction.source,
            timestamp: Date.now(),
            unlockedQuests: unlockedQuests.map(quest => quest.id),
            unlockedRecipes: recipeUnlocks.filter(unlock => unlock.newlyUnlocked).map(unlock => unlock.recipeId),
            storyEvents: storyOutcome.appliedRules || []
        };
        this.journal.unshift(entry);

        if (context.toast !== false && typeof document !== 'undefined') {
            showGlobalToast('發現聽聞', interaction.title, 'info');
        }

        return {
            success: true,
            interaction,
            messages,
            unlockedQuests,
            acceptedQuests,
            unlockedRecipes: recipeUnlocks,
            storyOutcome,
            entry
        };
    }

    getJournal() {
        return [...this.journal];
    }
}

export const worldInteractionManager = new WorldInteractionManager();
export default WorldInteractionManager;
