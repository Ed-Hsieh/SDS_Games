/**
 * BlueprintManager.js
 * Tracks recipe blueprints discovered through world interactions and monster drops.
 */

import GameManager from './GameManager.js';
import { getRecipe } from './RecipeManager.js';
import {
    DefaultKnownRecipeIds,
    getRecipeDiscovery,
    getRecipeIdsForInteraction
} from '../data/RecipeDiscoveries.js';
import {
    getBlueprintDropsForMonster,
    getBlueprintDropsForRecipe
} from '../data/BlueprintDrops.js';

const BLUEPRINT_FLAG_PREFIX = 'recipeBlueprint.';
const defaultKnownRecipes = new Set(DefaultKnownRecipeIds);

function getMonsterIdFromContext(context = {}) {
    return context.monsterId || context.monster?.id || context.monster?.type || null;
}

export function getRecipeBlueprintFlag(recipeId) {
    return `${BLUEPRINT_FLAG_PREFIX}${recipeId}`;
}

export function isRecipeBlueprintKnown(recipeId) {
    if (defaultKnownRecipes.has(recipeId)) return true;
    return Boolean(GameManager.getFlag(getRecipeBlueprintFlag(recipeId)));
}

export function unlockRecipeBlueprint(recipeId) {
    const recipe = getRecipe(recipeId);
    if (!recipe) return null;

    const wasKnown = isRecipeBlueprintKnown(recipeId);
    GameManager.setFlag(getRecipeBlueprintFlag(recipeId), true);
    return {
        recipeId,
        recipe,
        wasKnown,
        newlyUnlocked: !wasKnown
    };
}

export function unlockRecipeBlueprints(recipeIds = []) {
    return recipeIds
        .map(recipeId => unlockRecipeBlueprint(recipeId))
        .filter(Boolean);
}

export function unlockRecipesForInteraction(interactionId) {
    return unlockRecipeBlueprints(getRecipeIdsForInteraction(interactionId));
}

export function getRecipeBlueprintInfo(recipeId) {
    return {
        known: isRecipeBlueprintKnown(recipeId),
        defaultKnown: defaultKnownRecipes.has(recipeId),
        discovery: getRecipeDiscovery(recipeId),
        drops: getBlueprintDropsForRecipe(recipeId)
    };
}

export function rollRecipeBlueprintDrops(context = {}, options = {}) {
    const rng = options.rng || Math.random;
    const monsterId = getMonsterIdFromContext(context);
    const dropEntries = getBlueprintDropsForMonster(monsterId, {
        dungeonId: context.dungeonId || null
    });
    const unlocks = [];

    for (const entry of dropEntries) {
        if (!entry?.recipeId || isRecipeBlueprintKnown(entry.recipeId)) continue;

        const chance = Number(options.rate ?? entry.chance ?? 0);
        if (chance <= 0) continue;
        if (rng() > chance) continue;

        const unlock = unlockRecipeBlueprint(entry.recipeId);
        if (!unlock?.newlyUnlocked) continue;

        unlocks.push({
            ...unlock,
            dropChance: chance,
            monsterId,
            dungeonId: context.dungeonId || null
        });
    }

    return unlocks;
}

export function rollRecipeBlueprintDrop(context = {}, options = {}) {
    return rollRecipeBlueprintDrops(context, options)[0] || null;
}

export function createRecipeBlueprintDisplayItem(unlock) {
    const recipe = unlock?.recipe;
    if (!recipe) return null;

    return {
        id: `recipe_blueprint_${unlock.recipeId}`,
        name: `製作圖：${recipe.name}`,
        type: 'blueprint',
        rarity: recipe.rarity || 'rare',
        icon: '📜',
        desc: '已登錄到製作圖鑑，可在鍛造介面製作。',
        autoUnlockedBlueprint: true,
        recipeId: unlock.recipeId,
        recipeName: recipe.name,
        instanceId: `blueprint_${unlock.recipeId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    };
}

export function createRecipeBlueprintDisplayItems(unlocks = []) {
    return unlocks
        .map(unlock => createRecipeBlueprintDisplayItem(unlock))
        .filter(Boolean);
}

export default {
    getRecipeBlueprintFlag,
    isRecipeBlueprintKnown,
    unlockRecipeBlueprint,
    unlockRecipeBlueprints,
    unlockRecipesForInteraction,
    getRecipeBlueprintInfo,
    rollRecipeBlueprintDrop,
    rollRecipeBlueprintDrops,
    createRecipeBlueprintDisplayItem,
    createRecipeBlueprintDisplayItems
};
