/**
 * BlueprintManager.js
 * Tracks recipe blueprints discovered through world interactions.
 */

import GameManager from './GameManager.js';
import { getRecipe } from './RecipeManager.js';
import {
    DefaultKnownRecipeIds,
    getRecipeDiscovery,
    getRecipeIdsForInteraction
} from '../data/RecipeDiscoveries.js';

const BLUEPRINT_FLAG_PREFIX = 'recipeBlueprint.';
const defaultKnownRecipes = new Set(DefaultKnownRecipeIds);

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
        discovery: getRecipeDiscovery(recipeId)
    };
}

export default {
    getRecipeBlueprintFlag,
    isRecipeBlueprintKnown,
    unlockRecipeBlueprint,
    unlockRecipeBlueprints,
    unlockRecipesForInteraction,
    getRecipeBlueprintInfo
};
