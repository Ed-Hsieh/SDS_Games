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
import {
    getRecipeSeries,
    getRecipeSeriesForRecipe,
    getSeriesRecipeIds
} from '../data/RecipeSeries.js';
import { resolveItemById } from '../utils/ItemResolver.js';

const BLUEPRINT_FLAG_PREFIX = 'recipeBlueprint.';
const BLUEPRINT_SERIES_FLAG_PREFIX = 'recipeBlueprintSeries.';
const defaultKnownRecipes = new Set(DefaultKnownRecipeIds);

function getMonsterIdFromContext(context = {}) {
    return context.monsterId || context.monster?.id || context.monster?.type || null;
}

export function getRecipeBlueprintFlag(recipeId) {
    return `${BLUEPRINT_FLAG_PREFIX}${recipeId}`;
}

export function getRecipeSeriesFlag(seriesId) {
    return `${BLUEPRINT_SERIES_FLAG_PREFIX}${seriesId}`;
}

export function isRecipeSeriesKnown(seriesId) {
    const series = getRecipeSeries(seriesId);
    if (!series) return false;
    if (series.defaultKnown) return true;
    return Boolean(GameManager.getFlag(getRecipeSeriesFlag(seriesId)));
}

export function isRecipeBlueprintKnown(recipeId) {
    if (defaultKnownRecipes.has(recipeId)) return true;
    const series = getRecipeSeriesForRecipe(recipeId);
    if (series && isRecipeSeriesKnown(series.id)) return true;
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

export function unlockRecipeSeries(seriesId) {
    const series = getRecipeSeries(seriesId);
    if (!series) return null;

    const recipeIds = getSeriesRecipeIds(seriesId);
    if (recipeIds.length === 0) return null;

    const wasKnown = isRecipeSeriesKnown(seriesId);
    GameManager.setFlag(getRecipeSeriesFlag(seriesId), true);
    for (const recipeId of recipeIds) {
        GameManager.setFlag(getRecipeBlueprintFlag(recipeId), true);
    }

    return {
        seriesId,
        series,
        recipeIds,
        recipeId: recipeIds[0],
        recipe: getRecipe(recipeIds[0]),
        wasKnown,
        newlyUnlocked: !wasKnown
    };
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
        if (entry?.seriesId) {
            if (isRecipeSeriesKnown(entry.seriesId)) continue;

            const chance = Number(options.rate ?? entry.chance ?? 0);
            if (chance <= 0) continue;
            if (rng() > chance) continue;

            const unlock = unlockRecipeSeries(entry.seriesId);
            if (!unlock?.newlyUnlocked) continue;

            unlocks.push({
                ...unlock,
                dropChance: chance,
                monsterId,
                dungeonId: context.dungeonId || null
            });
            continue;
        }

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
    if (unlock?.series) {
        const series = unlock.series;
        const recipe = unlock.recipe;
        const rarity = series.rarity || recipe?.rarity || recipe?.result?.rarity || 'uncommon';
        const count = unlock.recipeIds?.length || 0;

        return {
            id: `recipe_series_blueprint_${unlock.seriesId}`,
            name: `鍛造圖紙：${series.name}`,
            type: 'blueprint',
            rarity,
            icon: '📜',
            desc: series.description || `解鎖 ${count} 件${series.name}系列製作。`,
            autoUnlockedBlueprint: true,
            assetId: unlock.seriesId,
            seriesId: unlock.seriesId,
            recipeIds: unlock.recipeIds || [],
            recipeId: unlock.recipeId,
            recipeName: series.name,
            instanceId: `blueprint_series_${unlock.seriesId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        };
    }

    const recipe = unlock?.recipe;
    if (!recipe) return null;
    const resultId = recipe.result?.id || unlock.recipeId;
    const resultItem = resolveItemById(resultId, {
        order: ['equipment', 'bossEquipment', 'material', 'shop', 'questReward']
    });
    const rarity = resultItem?.rarity || recipe.result?.rarity || recipe.rarity || 'rare';

    return {
        id: `recipe_blueprint_${unlock.recipeId}`,
        name: `製作圖：${recipe.name}`,
        type: 'blueprint',
        rarity,
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
    getRecipeSeriesFlag,
    isRecipeBlueprintKnown,
    isRecipeSeriesKnown,
    unlockRecipeBlueprint,
    unlockRecipeBlueprints,
    unlockRecipeSeries,
    unlockRecipesForInteraction,
    getRecipeBlueprintInfo,
    rollRecipeBlueprintDrop,
    rollRecipeBlueprintDrops,
    createRecipeBlueprintDisplayItem,
    createRecipeBlueprintDisplayItems
};
