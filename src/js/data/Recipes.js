/**
 * Recipes.js
 * 鍛造配方資料庫 - 定義所有可製作的裝備配方
 */

/**
 * 配方資料庫
 * 每個配方包含：
 * - id: 配方ID
 * - name: 配方名稱
 * - icon: 圖示
 * - type: 產出類型 (weapon/armor/accessory/potion)
 * - rarity: 稀有度
 * - materials: 所需材料 [{id, quantity}]
 * - cost: 製作費用
 * - successRate: 成功率 (0-100)
 * - result: 製作結果物品
 */
import { AffixStat, ItemRarity, EquipmentType, ItemType } from '../models/Enums.js';

export const RecipeDatabase = {
    // ==================== 基礎武器 ====================
    iron_sword: {
        id: 'iron_sword',
        name: '鐵劍',
        icon: '⚔️',
        type: EquipmentType.WEAPON,
        rarity: ItemRarity.COMMON,
        materials: [
            { id: 'iron_ore', quantity: 5 }
        ],
        cost: 50,
        successRate: 100,
        result: {
            id: 'crafted_iron_sword',
            name: '鐵劍',
            icon: '⚔️',
            type: EquipmentType.WEAPON,
            ItemRarity: ItemRarity.COMMON,
            stats: {
                attack: 8,
                defense: 0,
                critChance: 0.08,
                critDamage: 1.5
            },
            specialEffects: [],
            desc: '由鐵礦石鍛造而成的劍。'
        }
    },

    bone_blade: {
        id: 'bone_blade',
        name: '骨刃',
        icon: '🦴',
        type: EquipmentType.WEAPON,
        rarity: ItemRarity.UNCOMMON,
        materials: [
            { id: 'bone_fragment', quantity: 8 },
            { id: 'iron_ore', quantity: 3 }
        ],
        cost: 80,
        successRate: 95,
        result: {
            id: 'crafted_bone_blade',
            name: '骨刃',
            icon: '🦴',
            type: EquipmentType.WEAPON,
            ItemRarity: ItemRarity.UNCOMMON,
            stats: {
                attack: 8,
                defense: 0,
                critChance: 0.12,
                critDamage: 1.6
            },
            specialEffects: [],
            desc: '由骨頭碎片製成的鋒利刀刃。'
        }
    },

    poison_dagger: {
        id: 'poison_dagger',
        name: '毒刃匕首',
        icon: '🗡️',
        type: EquipmentType.WEAPON,
        rarity: ItemRarity.UNCOMMON,
        materials: [
            { id: 'poison_gland', quantity: 3 },
            { id: 'spider_queen_fang', quantity: 1 },
            { id: 'iron_ore', quantity: 2 }
        ],
        cost: 120,
        successRate: 90,
        result: {
            id: 'crafted_poison_dagger',
            name: '毒刃匕首',
            icon: '🗡️',
            type: EquipmentType.WEAPON,
            ItemRarity: ItemRarity.UNCOMMON,
            stats: {
                attack: 10,
                defense: 0,
                critChance: 0.18,
                critDamage: 1.8
            },
            specialEffects: [ { type: AffixStat.POISON, value: 5 } ],
            desc: '塗有蜘蛛毒液的匕首。'
        }
    },

    shadow_blade: {
        id: 'shadow_blade',
        name: '暗影之劍',
        icon: '⚔️',
        type: EquipmentType.WEAPON,
        rarity: ItemRarity.RARE,
        materials: [
            { id: 'shadow_shard', quantity: 5 },
            { id: 'dark_steel', quantity: 3 },
            { id: 'iron_ore', quantity: 5 }
        ],
        cost: 300,
        successRate: 80,
        result: {
            id: 'crafted_shadow_blade',
            name: '暗影之劍',
            icon: '⚔️',
            type: EquipmentType.WEAPON,
            ItemRarity: ItemRarity.RARE,
            stats: {
                attack: 30,
                defense: 0,
                critChance: 0.15,
                critDamage: 1.9
            },
            specialEffects: [],
            desc: '由暗影能量凝聚而成的劍。'
        }
    },

    mithril_sword: {
        id: 'mithril_sword',
        name: '秘銀長劍',
        icon: '⚔️',
        type: EquipmentType.WEAPON,
        rarity: ItemRarity.RARE,
        materials: [
            { id: 'mithril_ore', quantity: 5 },
            { id: 'crystal_shard', quantity: 3 }
        ],
        cost: 500,
        successRate: 75,
        result: {
            id: 'crafted_mithril_sword',
            name: '秘銀長劍',
            icon: '⚔️',
            type: EquipmentType.WEAPON,
            ItemRarity: ItemRarity.RARE,
            stats: {
                attack: 35,
                defense: 0,
                critChance: 0.18,
                critDamage: 2.0
            },
            specialEffects: [],
            desc: '輕盈而鋒利的秘銀劍。'
        }
    },

    fire_sword: {
        id: 'fire_sword',
        name: '烈焰之劍',
        icon: '🔥',
        type: EquipmentType.WEAPON,
        rarity: ItemRarity.RARE,
        materials: [
            { id: 'fire_essence', quantity: 5 },
            { id: 'ember_stone', quantity: 2 },
            { id: 'mithril_ore', quantity: 3 }
        ],
        cost: 600,
        successRate: 70,
        result: {
            id: 'crafted_fire_sword',
            name: '烈焰之劍',
            icon: '🔥',
            type: EquipmentType.WEAPON,
            ItemRarity: ItemRarity.RARE,
            stats: {
                attack: 35,
                defense: 0,
                critChance: 0.15,
                critDamage: 2.0
            },
            specialEffects: [ { type: AffixStat.FIRE, value: 10 } ],
            desc: '燃燒著永恆火焰的魔劍。'
        }
    },

    ice_sword: {
        id: 'ice_sword',
        name: '霜寒之劍',
        icon: '❄️',
        type: EquipmentType.WEAPON,
        rarity: ItemRarity.RARE,
        materials: [
            { id: 'ice_essence', quantity: 5 },
            { id: 'frost_crystal', quantity: 2 },
            { id: 'mithril_ore', quantity: 3 }
        ],
        cost: 600,
        successRate: 70,
        result: {
            id: 'crafted_ice_sword',
            name: '霜寒之劍',
            icon: '❄️',
            type: EquipmentType.WEAPON,
            ItemRarity: ItemRarity.RARE,
            stats: {
                attack: 35,
                defense: 5,
                critChance: 0.12,
                critDamage: 1.8
            },
            specialEffects: [ { type: AffixStat.ICE, value: 15 } ],
            desc: '凝結著永恆寒冰的魔劍。'
        }
    },

    dragon_slayer: {
        id: 'dragon_slayer',
        name: '龍心',
        icon: '🐉',
        type: EquipmentType.WEAPON,
        rarity: ItemRarity.EPIC,
        materials: [
            { id: 'dragon_heart', quantity: 1 },
            { id: 'dragon_tooth', quantity: 3 },
            { id: 'mithril_ore', quantity: 5 },
            { id: 'fire_essence', quantity: 3 }
        ],
        cost: 1500,
        successRate: 50,
        result: {
            id: 'crafted_dragon_slayer',
            name: '屠龍劍',
            icon: '🐉',
            type: EquipmentType.WEAPON,
            ItemRarity: ItemRarity.LEGENDARY,
            stats: {
                attack: 40,
                defense: 0,
                critChance: 0.22,
                critDamage: 2.5
            },
            specialEffects: [ { type: AffixStat.EXECUTE, value: 0 } ],
            desc: '傳說中能斬龍的神劍。'
        }
    },

    titan_blade: {
        id: 'titan_blade',
        name: '泰坦之劍',
        icon: '⚔️',
        type: EquipmentType.WEAPON,
        rarity: ItemRarity.LEGENDARY,
        materials: [
            { id: 'titan_heart', quantity: 1 },
            { id: 'primordial_stone', quantity: 2 },
            { id: 'legendary_shard', quantity: 1 },
            { id: 'mithril_ore', quantity: 10 }
        ],
        cost: 5000,
        successRate: 30,
        result: {
            id: 'crafted_titan_blade',
            name: '泰坦之劍',
            icon: '⚔️',
            type: EquipmentType.WEAPON,
            ItemRarity: ItemRarity.LEGENDARY,
            stats: {
                attack: 50,
                defense: 10,
                critChance: 0.25,
                critDamage: 3.0
            },
            specialEffects: [],
            desc: '蘊含泰坦之力的傳說神劍。'
        }
    },

    // ==================== 防具 ====================
    leather_armor: {
        id: 'leather_armor',
        name: '皮甲',
        icon: '🥋',
        type: EquipmentType.EQUIPMENT,
        rarity: ItemRarity.COMMON,
        materials: [
            { id: 'beast_hide', quantity: 5 }
        ],
        cost: 40,
        successRate: 100,
        result: {
            id: 'crafted_leather_armor',
            name: '皮甲',
            icon: '🥋',
            type: EquipmentType.EQUIPMENT,
            ItemRarity: ItemRarity.COMMON,
            stats: {
                attack: 0,
                defense: 4,
                critChance: 0,
                critDamage: 0
            },
            specialEffects: [],
            desc: '由獸皮製成的輕便護甲。'
        }
    },

    wolf_cloak: {
        id: 'wolf_cloak',
        name: '狼皮斗篷',
        icon: '🐺',
        type: EquipmentType.EQUIPMENT,
        rarity: ItemRarity.UNCOMMON,
        materials: [
            { id: 'wolf_pelt', quantity: 3 },
            { id: 'beast_hide', quantity: 2 }
        ],
        cost: 100,
        successRate: 90,
        result: {
            id: 'crafted_wolf_cloak',
            name: '狼皮斗篷',
            icon: '🐺',
            type: EquipmentType.EQUIPMENT,
            ItemRarity: ItemRarity.UNCOMMON,
            stats: {
                attack: 0,
                defense: 6,
                critChance: 0,
                critDamage: 0
            },
            specialEffects: [],
            desc: '由狼皮製成的保暖斗篷。'
        }
    },

    guardian_armor: {
        id: 'guardian_armor',
        name: '守護者之甲',
        icon: '🛡️',
        type: EquipmentType.EQUIPMENT,
        rarity: ItemRarity.RARE,
        materials: [
            { id: 'guardian_branch', quantity: 2 },
            { id: 'ancient_bark', quantity: 5 },
            { id: 'forest_essence', quantity: 3 }
        ],
        cost: 400,
        successRate: 70,
        result: {
            id: 'crafted_guardian_armor',
            name: '守護者之甲',
            icon: '🛡️',
            type: EquipmentType.EQUIPMENT,
            ItemRarity: ItemRarity.RARE,
            stats: {
                attack: 0,
                defense: 10,
                critChance: 0,
                critDamage: 0
            },
            specialEffects: [ { type: AffixStat.ALL_STATS, value: 0 } ],
            desc: '蘊含森林守護者之力的鎧甲。'
        }
    },

    shadow_armor: {
        id: 'shadow_armor',
        name: '暗影鎧甲',
        icon: '⚫',
        type: EquipmentType.EQUIPMENT,
        rarity: ItemRarity.RARE,
        materials: [
            { id: 'dark_steel', quantity: 5 },
            { id: 'shadow_essence', quantity: 3 },
            { id: 'shadow_cloak_fragment', quantity: 2 }
        ],
        cost: 500,
        successRate: 65,
        result: {
            id: 'crafted_shadow_armor',
            name: '暗影鎧甲',
            icon: '⚫',
            type: EquipmentType.EQUIPMENT,
            ItemRarity: ItemRarity.RARE,
            stats: {
                attack: 3,
                defense: 13,
                critChance: 0,
                critDamage: 0
            },
            specialEffects: [ { type: AffixStat.DODGE_CHANCE, value: 5 } ],
            desc: '被暗影籠罩的神秘鎧甲。'
        }
    },

    dragon_scale_armor: {
        id: 'dragon_scale_armor',
        name: '龍鱗鎧甲',
        icon: '🐲',
        type: EquipmentType.EQUIPMENT,
        rarity: ItemRarity.EPIC,
        materials: [
            { id: 'drake_scale', quantity: 5 },
            { id: 'elder_dragon_scale', quantity: 2 },
            { id: 'mithril_ore', quantity: 5 }
        ],
        cost: 1200,
        successRate: 50,
        result: {
            id: 'crafted_dragon_scale_armor',
            name: '龍鱗鎧甲',
            icon: '🐲',
            type: EquipmentType.EQUIPMENT,
            ItemRarity: ItemRarity.EPIC,
            stats: {
                attack: 8,
                defense: 18,
                critChance: 0.05,
                critDamage: 1.2
            },
            specialEffects: [ { type: AffixStat.FIRE, value: 20 } ],
            desc: '由龍鱗製成的傳說鎧甲。'
        }
    },

    titan_armor: {
        id: 'titan_armor',
        name: '泰坦之鎧',
        icon: '🛡️',
        type: EquipmentType.EQUIPMENT,
        rarity: ItemRarity.LEGENDARY,
        materials: [
            { id: 'titan_heart', quantity: 1 },
            { id: 'primordial_stone', quantity: 2 },
            { id: 'legendary_shard', quantity: 1 },
            { id: 'elder_dragon_scale', quantity: 3 }
        ],
        cost: 5000,
        successRate: 30,
        result: {
            id: 'crafted_titan_armor',
            name: '泰坦之鎧',
            icon: '🛡️',
            type: EquipmentType.EQUIPMENT,
            ItemRarity: ItemRarity.LEGENDARY,
            stats: {
                attack: 10,
                defense: 22,
                critChance: 0.1,
                critDamage: 1.3
            },
            specialEffects: [],
            desc: '蘊含泰坦之力的傳說鎧甲。'
        }
    },

    // ==================== 飾品 ====================
    wolf_fang_necklace: {
        id: 'wolf_fang_necklace',
        name: '狼牙項鍊',
        icon: '🦷',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.UNCOMMON,
        materials: [
            { id: 'wolf_fang', quantity: 3 },
            { id: 'spider_silk', quantity: 2 }
        ],
        cost: 80,
        successRate: 95,
        result: {
            id: 'crafted_wolf_fang_necklace',
            name: '狼牙項鍊',
            icon: '🦷',
            type: EquipmentType.ACCESSORY,
            ItemRarity: ItemRarity.UNCOMMON,
            stats: {
                attack: 1,
                defense: 1,
                critChance: 0,
                critDamage: 0
            },
            specialEffects: [],
            desc: '由狼牙串成的項鍊。'
        }
    },

    nature_amulet: {
        id: 'nature_amulet',
        name: '自然護符',
        icon: '🌿',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.RARE,
        materials: [
            { id: 'life_seed', quantity: 2 },
            { id: 'forest_essence', quantity: 2 },
            { id: 'ancient_bark', quantity: 3 }
        ],
        cost: 300,
        successRate: 75,
        result: {
            id: 'crafted_nature_amulet',
            name: '自然護符',
            icon: '🌿',
            type: EquipmentType.ACCESSORY,
            ItemRarity: ItemRarity.RARE,
            stats: {
                attack: 1,
                defense: 5,
                critChance: 0,
                critDamage: 0
            },
            specialEffects: [ { type: AffixStat.HP, value: 20 } ],
            desc: '蘊含自然之力的護符。'
        }
    },

    shadow_ring: {
        id: 'shadow_ring',
        name: '暗影戒指',
        icon: '💍',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.RARE,
        materials: [
            { id: 'shadow_core', quantity: 1 },
            { id: 'dark_crystal', quantity: 2 },
            { id: 'shadow_shard', quantity: 3 }
        ],
        cost: 400,
        successRate: 65,
        result: {
            id: 'crafted_shadow_ring',
            name: '暗影戒指',
            icon: '💍',
            type: EquipmentType.ACCESSORY,
            ItemRarity: ItemRarity.RARE,
            stats: {
                attack: 3,
                defense: 3,
                critChance: 0.05,
                critDamage: 0
            },
            specialEffects: [],
            desc: '籠罩暗影的神秘戒指。'
        }
    },

    dragon_amulet: {
        id: 'dragon_amulet',
        name: '龍之護符',
        icon: '🐉',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.EPIC,
        materials: [
            { id: 'dragon_knight_badge', quantity: 1 },
            { id: 'dragon_tooth', quantity: 2 },
            { id: 'fire_essence', quantity: 3 }
        ],
        cost: 800,
        successRate: 55,
        result: {
            id: 'crafted_dragon_amulet',
            name: '龍之護符',
            icon: '🐉',
            type: EquipmentType.ACCESSORY,
            ItemRarity: ItemRarity.EPIC,
            stats: {
                attack: 12,
                defense: 8,
                critChance: 0.10,
                critDamage: 1.2
            },
            specialEffects: [],
            desc: '蘊含龍之力的護符。'
        }
    },

    titan_ring: {
        id: 'titan_ring',
        name: '泰坦之戒',
        icon: '💍',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.LEGENDARY,
        materials: [
            { id: 'titan_heart', quantity: 1 },
            { id: 'elemental_core', quantity: 1 },
            { id: 'legendary_shard', quantity: 1 }
        ],
        cost: 3000,
        successRate: 35,
        result: {
            id: 'crafted_titan_ring',
            name: '泰坦之戒',
            icon: '💍',
            type: EquipmentType.ACCESSORY,
            ItemRarity: ItemRarity.LEGENDARY,
            stats: {
                attack: 15,
                defense: 15,
                critChance: 0.20,
                critDamage: 1.2
            },
            specialEffects: [],
            desc: '蘊含泰坦之力的傳說戒指。'
        }
    },

    // ==================== 藥水 ====================
    health_potion_basic: {
        id: 'health_potion_basic',
        name: '基礎生命藥水',
        icon: '🧪',
        type: ItemType.POTION,
        rarity: ItemRarity.COMMON,
        materials: [
            { id: 'slime_jelly', quantity: 3 }
        ],
        cost: 15,
        successRate: 100,
        result: {
            id: 'crafted_health_potion',
            name: '生命藥水',
            icon: '🧪',
            type: ItemType.POTION,
            ItemRarity: ItemRarity.COMMON,
            hp: 50,
            desc: '恢復 50 點生命值。'
        }
    },

    greater_health_potion: {
        id: 'greater_health_potion',
        name: '高級生命藥水',
        icon: '❤️',
        type: ItemType.POTION,
        rarity: ItemRarity.UNCOMMON,
        materials: [
            { id: 'life_seed', quantity: 1 },
            { id: 'slime_jelly', quantity: 5 },
            { id: 'forest_essence', quantity: 1 }
        ],
        cost: 80,
        successRate: 85,
        result: {
            id: 'crafted_greater_health_potion',
            name: '高級生命藥水',
            icon: '❤️',
            type: ItemType.POTION,
            ItemRarity: ItemRarity.UNCOMMON,
            hp: 120,
            desc: '恢復 120 點生命值。'
        }
    }

};

/**
 * 根據ID獲取配方
 */
export function getRecipe(recipeId) {
    return RecipeDatabase[recipeId] || null;
}

/**
 * 根據類型獲取配方列表
 */
export function getRecipesByType(type) {
    if (type === 'all') {
        return Object.values(RecipeDatabase);
    }
    return Object.values(RecipeDatabase).filter(r => r.type === type);
}

/**
 * 根據稀有度獲取配方列表
 */
export function getRecipesByRarity(rarity) {
    return Object.values(RecipeDatabase).filter(r => r.rarity === rarity);
}

/**
 * 檢查是否有足夠材料製作（同時檢查背包和倉庫）
 */
export function canCraft(recipeId, inventory, warehouse = []) {
    const recipe = getRecipe(recipeId);
    if (!recipe) return false;

    // 合併背包和倉庫
    const allItems = [...inventory, ...warehouse];

    for (const mat of recipe.materials) {
        const owned = allItems.filter(item => item.item?.id === mat.id)
            .reduce((sum, stack) => sum + (stack.quantity || 1), 0);
        if (owned < mat.quantity) {
            return false;
        }
    }
    return true;
}

/**
 * 獲取缺少的材料
 */
export function getMissingMaterials(recipeId, inventory) {
    const recipe = getRecipe(recipeId);
    if (!recipe) return [];

    const missing = [];
    for (const mat of recipe.materials) {
        const owned = inventory.filter(item => item.item?.id === mat.id)
            .reduce((sum, stack) => sum + (stack.quantity || 1), 0);
        if (owned < mat.quantity) {
            missing.push({
                id: mat.id,
                required: mat.quantity,
                owned: owned,
                need: mat.quantity - owned
            });
        }
    }
    return missing;
}
