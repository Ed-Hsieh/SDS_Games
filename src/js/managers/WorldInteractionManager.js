/**
 * WorldInteractionManager.js
 * Applies world discoveries from town objects, map events, vendors, dungeons,
 * and future story hooks.
 */

import GameManager from './GameManager.js';
import { questManager } from './QuestManager.js';
import { QuestStatus, getQuestById } from '../data/Quests.js';
import { getWorldInteraction } from '../data/WorldInteractions.js';
import { showGlobalToast } from '../utils/UIFeedback.js';
import { unlockRecipeBlueprints } from './BlueprintManager.js';

class WorldInteractionManager {
    getResolvedFlag(interactionId) {
        return `worldInteraction.${interactionId}.resolved`;
    }

    hasResolved(interactionId) {
        return Boolean(GameManager.getFlag(this.getResolvedFlag(interactionId)));
    }

    getItemCount(itemId) {
        return GameManager.getItemCountAcrossStorage(itemId);
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
                messages: [interaction.repeatMessage || '這個互動已經完成。']
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
                messages: [interaction.missingMessage || `缺少必要物品：${missingText}`]
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
                messages: ['必要物品消耗失敗，互動未完成。']
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

            if ((before?.status || QuestStatus.LOCKED) === QuestStatus.LOCKED && after?.status !== QuestStatus.LOCKED) {
                const quest = getQuestById(questId);
                unlockedQuests.push(quest || { id: questId, name: questId });
            }

            const latest = questManager.getQuestState(questId);
            if (interaction.autoAcceptQuests === true && latest?.status === QuestStatus.AVAILABLE) {
                const accepted = questManager.acceptQuest(questId);
                if (accepted.success) {
                    acceptedQuests.push(accepted.quest || getQuestById(questId) || { id: questId, name: questId });
                }
            }
        }

        if (interaction.message) messages.push(interaction.message);
        if (interaction.showQuestUnlockMessages !== false) {
            for (const quest of unlockedQuests) {
                messages.push(`解鎖任務：${quest.name || quest.id}`);
            }
        }
        for (const unlock of recipeUnlocks) {
            if (unlock.newlyUnlocked) messages.push(`解鎖藍圖：${unlock.recipe.name}`);
        }
        for (const progress of interaction.progressObjectives || []) {
            if (!progress?.type || !progress?.target) continue;
            const changed = questManager.updateProgress(progress.type, progress.target, progress.amount || 1);
            if (changed && progress.message) messages.push(progress.message);
        }

        if (context.toast !== false && typeof document !== 'undefined') {
            showGlobalToast('發現', interaction.title, 'info');
        }

        return {
            success: true,
            interaction,
            messages,
            unlockedQuests,
            acceptedQuests,
            unlockedRecipes: recipeUnlocks
        };
    }
}

export const worldInteractionManager = new WorldInteractionManager();
export default WorldInteractionManager;
