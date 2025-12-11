/**
 * MaterialManager.js
 * 管理材料相關的查詢行為（從 data 中拆分而出）
 */

import { MaterialDatabase } from '../data/Materials.js';

export function getMaterial(materialId) {
    return MaterialDatabase[materialId] || null;
}

export function getMaterialsByRarity(rarity) {
    return Object.values(MaterialDatabase).filter(m => m.rarity === rarity);
}

export function getMaterialsForCraft(craftTarget) {
    return Object.values(MaterialDatabase).filter(
        m => m.craftUse && m.craftUse.includes(craftTarget)
    );
}

export default {
    getMaterial,
    getMaterialsByRarity,
    getMaterialsForCraft
};
