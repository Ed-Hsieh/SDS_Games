import { SeriesRecipeDatabase } from './RecipeSeries.js';
import { StandaloneRecipeDatabase } from './RecipeCatalog.js';

const duplicateRecipeIds = Object.keys(StandaloneRecipeDatabase)
    .filter(recipeId => SeriesRecipeDatabase[recipeId]);
if (duplicateRecipeIds.length > 0) {
    throw new Error(`Recipe ids have more than one owner: ${duplicateRecipeIds.join(', ')}`);
}

export const RecipeDatabase = Object.freeze({
    ...StandaloneRecipeDatabase,
    ...SeriesRecipeDatabase
});
