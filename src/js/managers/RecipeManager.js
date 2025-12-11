/**
 * RecipeManager.js
 * 管理配方相關的查詢行為（從 data/Recipes.js 中拆分而出）
 */

import { 
    RecipeDatabase, 
    getRecipe as _getRecipe, 
    getRecipesByType as _getRecipesByType, 
    getRecipesByRarity as _getRecipesByRarity,
    canCraft as _canCraft, 
    getMissingMaterials as _getMissingMaterials 
} from '../data/Recipes.js';

// 重新導出，供 Scenes 使用（避免 Scenes 直接引用 Database）
export { RecipeDatabase };

/**
 * 取得配方
 */
export function getRecipe(recipeId) {
    return _getRecipe(recipeId);
}

/**
 * 取得指定類型的配方
 */
export function getRecipesByType(type) {
    return _getRecipesByType(type);
}

/**
 * 取得指定稀有度的配方
 */
export function getRecipesByRarity(rarity) {
    return _getRecipesByRarity(rarity);
}

/**
 * 檢查是否可以製作配方
 */
export function canCraft(recipeId, inventory, warehouse = []) {
    return _canCraft(recipeId, inventory, warehouse);
}

/**
 * 取得缺少的材料
 */
export function getMissingMaterials(recipeId, inventory) {
    return _getMissingMaterials(recipeId, inventory);
}

export default {
    RecipeDatabase,
    getRecipe,
    getRecipesByType,
    getRecipesByRarity,
    canCraft,
    getMissingMaterials
};
