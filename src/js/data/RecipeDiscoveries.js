import {
    getRecipeSeriesForRecipe,
    SeriesRecipeDatabase
} from './RecipeSeries.js';
import {
    BossRecipeUnlocksByMonsterId,
    DefaultKnownRecipeIds,
    RecipeDiscoveryDatabase
} from './RecipeDiscoveryCatalog.js';

export {
    BossRecipeUnlocksByMonsterId,
    DefaultKnownRecipeIds,
    RecipeDiscoveryDatabase
};

export function getRecipeDiscovery(recipeId) {
    return RecipeDiscoveryDatabase[recipeId] || getRecipeSeriesForRecipe(recipeId)?.discovery || null;
}

export function getRecipeIdsForInteraction(interactionId) {
    const explicitRecipeIds = Object.entries(RecipeDiscoveryDatabase)
        .filter(([, discovery]) => discovery.interactionId === interactionId)
        .map(([recipeId]) => recipeId);
    const seriesRecipeIds = Object.values(SeriesRecipeDatabase)
        .filter(recipe => getRecipeSeriesForRecipe(recipe.id)?.discovery?.interactionId === interactionId)
        .map(recipe => recipe.id);
    return [...new Set([...explicitRecipeIds, ...seriesRecipeIds])];
}
