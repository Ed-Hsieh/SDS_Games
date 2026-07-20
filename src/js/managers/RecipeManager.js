import { RecipeDatabase } from '../data/Recipes.js';
import GameManager from './GameManager.js';
import { affixManager } from './AffixManager.js';
import { isRecipeBlueprintKnown } from './BlueprintManager.js';
import { questManager } from './QuestManager.js';
import { ObjectiveType } from '../data/Quests.js';

const EQUIPMENT_TYPES = new Set(['weapon', 'armor', 'accessory']);
const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export function getRecipe(recipeId) {
    return RecipeDatabase[recipeId] || null;
}

export function getRecipesByType(type) {
    const recipes = Object.values(RecipeDatabase);
    return type === 'all' ? recipes : recipes.filter(recipe => recipe.type === type);
}

export function getRecipesByRarity(rarity) {
    return Object.values(RecipeDatabase).filter(recipe => recipe.rarity === rarity);
}

function countOwnedMaterial(materialId, inventory = [], warehouse = []) {
    return [...inventory, ...warehouse]
        .filter(stack => stack.item?.id === materialId)
        .reduce((sum, stack) => sum + (stack.quantity || 1), 0);
}

export function getMissingMaterials(recipeId, inventory = [], warehouse = []) {
    const recipe = getRecipe(recipeId);
    if (!recipe) return [];

    return (recipe.materials || []).flatMap(material => {
        const owned = countOwnedMaterial(material.id, inventory, warehouse);
        if (owned >= material.quantity) return [];
        return [{
            id: material.id,
            required: material.quantity,
            owned,
            need: material.quantity - owned
        }];
    });
}

export function canCraft(recipeId, inventory = [], warehouse = []) {
    return Boolean(getRecipe(recipeId))
        && getMissingMaterials(recipeId, inventory, warehouse).length === 0;
}

function applyCraftedEquipmentProperties(item) {
    if (!EQUIPMENT_TYPES.has(item?.type)) return item;

    if (item.durability === undefined) {
        item.durability = 18;
        item.maxDurability = 18;
    }

    affixManager.generateAffixes(item, true);
    item.rarity = (item.affixes || []).reduce((current, affix) => {
        return RARITY_ORDER.indexOf(affix.rarity) > RARITY_ORDER.indexOf(current)
            ? affix.rarity
            : current;
    }, item.rarity || 'common');
    return item;
}

export function getCraftStatus(recipeId) {
    const recipe = getRecipe(recipeId);
    if (!recipe) return { ok: false, reason: 'recipe', recipe: null };
    const inventory = GameManager.getInventory() || [];
    const warehouse = GameManager.getWarehouse() || [];
    const blueprintKnown = isRecipeBlueprintKnown(recipeId);
    const missingMaterials = getMissingMaterials(recipeId, inventory, warehouse);
    const materialStatus = (recipe.materials || []).map(material => {
        const owned = GameManager.getItemCountAcrossStorage(material.id);
        return { ...material, owned, enough: owned >= material.quantity };
    });
    const gold = GameManager.getGold();
    const base = {
        recipe,
        blueprintKnown,
        missingMaterials,
        materialStatus,
        gold,
        hasMaterials: missingMaterials.length === 0,
        hasGold: gold >= recipe.cost
    };

    if (!blueprintKnown) return { ...base, ok: false, reason: 'blueprint' };
    if (missingMaterials.length > 0) {
        return {
            ...base,
            ok: false,
            reason: 'materials'
        };
    }
    if (!base.hasGold) return { ...base, ok: false, reason: 'gold' };
    return { ...base, ok: true, reason: null };
}

export function craftRecipe(recipeId, options = {}) {
    const status = getCraftStatus(recipeId);
    if (!status.ok) return { ...status, success: false, consumed: false };

    const { recipe } = status;
    for (const material of recipe.materials || []) {
        GameManager.removeMaterial(material.id, material.quantity);
    }
    GameManager.addGold(-recipe.cost);
    GameManager.markSaveDirty?.('craft-recipe');
    GameManager.notify?.('all');

    const rng = typeof options.rng === 'function' ? options.rng : Math.random;
    if (rng() * 100 >= recipe.successRate) {
        return { success: false, consumed: true, reason: 'roll', recipe, item: null };
    }

    const item = applyCraftedEquipmentProperties({
        ...recipe.result,
        instanceId: `crafted_${Date.now()}`
    });
    const stored = GameManager.addItem(item) || GameManager.addToWarehouse(item);
    if (stored) questManager.updateProgress(ObjectiveType.CRAFT, recipe.type, 1);
    return {
        success: Boolean(stored),
        consumed: true,
        reason: stored ? null : 'storage',
        recipe,
        item
    };
}
