/**
 * RecipeManager.js
 * Compatibility facade for recipe data and lookup helpers.
 */

import {
    RecipeDatabase,
    getRecipe,
    getRecipesByType,
    getRecipesByRarity,
    canCraft,
    getMissingMaterials
} from '../data/Recipes.js?v=equipment-atlas-20260605b';

export {
    RecipeDatabase,
    getRecipe,
    getRecipesByType,
    getRecipesByRarity,
    canCraft,
    getMissingMaterials
};

export default {
    RecipeDatabase,
    getRecipe,
    getRecipesByType,
    getRecipesByRarity,
    canCraft,
    getMissingMaterials
};
