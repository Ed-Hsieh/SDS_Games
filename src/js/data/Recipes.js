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
export const RecipeDatabase = {
    // ==================== 基礎武器 ====================
    iron_sword: {
        id: 'iron_sword',
        name: '鐵劍',
        icon: '⚔️',
        type: 'weapon',
        rarity: 'common',
        materials: [
            { id: 'iron_ore', quantity: 5 }
        ],
        cost: 50,
        successRate: 100,
        result: {
            id: 'crafted_iron_sword',
            name: '鐵劍',
            icon: '⚔️',
            type: 'weapon',
            rarity: 'common',
            attack: 12,
            defense: 0,
            critChance: 0.08,
            critDamage: 1.5,
            desc: '由鐵礦石鍛造而成的劍。'
        }
    },

    bone_blade: {
        id: 'bone_blade',
        name: '骨刃',
        icon: '🦴',
        type: 'weapon',
        rarity: 'uncommon',
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
            type: 'weapon',
            rarity: 'uncommon',
            attack: 18,
            defense: 0,
            critChance: 0.12,
            critDamage: 1.6,
            desc: '由骨頭碎片製成的鋒利刀刃。'
        }
    },

    poison_dagger: {
        id: 'poison_dagger',
        name: '毒刃匕首',
        icon: '🗡️',
        type: 'weapon',
        rarity: 'uncommon',
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
            type: 'weapon',
            rarity: 'uncommon',
            attack: 15,
            defense: 0,
            critChance: 0.18,
            critDamage: 1.8,
            special: { poison: 5 },
            desc: '塗有蜘蛛毒液的匕首。'
        }
    },

    shadow_blade: {
        id: 'shadow_blade',
        name: '暗影之劍',
        icon: '⚔️',
        type: 'weapon',
        rarity: 'rare',
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
            type: 'weapon',
            rarity: 'rare',
            attack: 28,
            defense: 0,
            critChance: 0.15,
            critDamage: 1.9,
            desc: '由暗影能量凝聚而成的劍。'
        }
    },

    mithril_sword: {
        id: 'mithril_sword',
        name: '秘銀長劍',
        icon: '⚔️',
        type: 'weapon',
        rarity: 'rare',
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
            type: 'weapon',
            rarity: 'rare',
            attack: 32,
            defense: 0,
            critChance: 0.18,
            critDamage: 2.0,
            desc: '輕盈而鋒利的秘銀劍。'
        }
    },

    fire_sword: {
        id: 'fire_sword',
        name: '烈焰之劍',
        icon: '🔥',
        type: 'weapon',
        rarity: 'rare',
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
            type: 'weapon',
            rarity: 'rare',
            attack: 35,
            defense: 0,
            critChance: 0.15,
            critDamage: 2.0,
            special: { fireDamage: 10 },
            desc: '燃燒著永恆火焰的魔劍。'
        }
    },

    ice_sword: {
        id: 'ice_sword',
        name: '霜寒之劍',
        icon: '❄️',
        type: 'weapon',
        rarity: 'rare',
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
            type: 'weapon',
            rarity: 'rare',
            attack: 30,
            defense: 5,
            critChance: 0.12,
            critDamage: 1.8,
            special: { slow: 15 },
            desc: '凝結著永恆寒冰的魔劍。'
        }
    },

    dragon_slayer: {
        id: 'dragon_slayer',
        name: '屠龍劍',
        icon: '🐉',
        type: 'weapon',
        rarity: 'epic',
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
            type: 'weapon',
            rarity: 'epic',
            attack: 50,
            defense: 0,
            critChance: 0.22,
            critDamage: 2.5,
            special: { dragonSlayer: true },
            desc: '傳說中能斬龍的神劍。'
        }
    },

    titan_blade: {
        id: 'titan_blade',
        name: '泰坦之劍',
        icon: '⚔️',
        type: 'weapon',
        rarity: 'legendary',
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
            type: 'weapon',
            rarity: 'legendary',
            attack: 80,
            defense: 10,
            critChance: 0.25,
            critDamage: 3.0,
            desc: '蘊含泰坦之力的傳說神劍。'
        }
    },

    // ==================== 防具 ====================
    leather_armor: {
        id: 'leather_armor',
        name: '皮甲',
        icon: '🥋',
        type: 'armor',
        rarity: 'common',
        materials: [
            { id: 'beast_hide', quantity: 5 }
        ],
        cost: 40,
        successRate: 100,
        result: {
            id: 'crafted_leather_armor',
            name: '皮甲',
            icon: '🥋',
            type: 'armor',
            rarity: 'common',
            attack: 0,
            defense: 8,
            critChance: 0.02,
            critDamage: 1.2,
            desc: '由獸皮製成的輕便護甲。'
        }
    },

    wolf_cloak: {
        id: 'wolf_cloak',
        name: '狼皮斗篷',
        icon: '🐺',
        type: 'armor',
        rarity: 'uncommon',
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
            type: 'armor',
            rarity: 'uncommon',
            attack: 3,
            defense: 12,
            critChance: 0.05,
            critDamage: 1.4,
            desc: '由狼皮製成的保暖斗篷。'
        }
    },

    guardian_armor: {
        id: 'guardian_armor',
        name: '守護者之甲',
        icon: '🛡️',
        type: 'armor',
        rarity: 'rare',
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
            type: 'armor',
            rarity: 'rare',
            attack: 0,
            defense: 25,
            critChance: 0.05,
            critDamage: 1.3,
            special: { hpRegen: 2 },
            desc: '蘊含森林守護者之力的鎧甲。'
        }
    },

    shadow_armor: {
        id: 'shadow_armor',
        name: '暗影鎧甲',
        icon: '⚫',
        type: 'armor',
        rarity: 'rare',
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
            type: 'armor',
            rarity: 'rare',
            attack: 5,
            defense: 22,
            critChance: 0.08,
            critDamage: 1.5,
            special: { evasion: 5 },
            desc: '被暗影籠罩的神秘鎧甲。'
        }
    },

    dragon_scale_armor: {
        id: 'dragon_scale_armor',
        name: '龍鱗鎧甲',
        icon: '🐲',
        type: 'armor',
        rarity: 'epic',
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
            type: 'armor',
            rarity: 'epic',
            attack: 8,
            defense: 40,
            critChance: 0.10,
            critDamage: 1.6,
            special: { fireResist: 20 },
            desc: '由龍鱗製成的傳說鎧甲。'
        }
    },

    titan_armor: {
        id: 'titan_armor',
        name: '泰坦之鎧',
        icon: '🛡️',
        type: 'armor',
        rarity: 'legendary',
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
            type: 'armor',
            rarity: 'legendary',
            attack: 15,
            defense: 60,
            critChance: 0.12,
            critDamage: 1.8,
            desc: '蘊含泰坦之力的傳說鎧甲。'
        }
    },

    // ==================== 飾品 ====================
    wolf_fang_necklace: {
        id: 'wolf_fang_necklace',
        name: '狼牙項鍊',
        icon: '🦷',
        type: 'accessory',
        rarity: 'uncommon',
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
            type: 'accessory',
            rarity: 'uncommon',
            attack: 5,
            defense: 2,
            critChance: 0.08,
            critDamage: 1.5,
            desc: '由狼牙串成的項鍊。'
        }
    },

    nature_amulet: {
        id: 'nature_amulet',
        name: '自然護符',
        icon: '🌿',
        type: 'accessory',
        rarity: 'rare',
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
            type: 'accessory',
            rarity: 'rare',
            attack: 3,
            defense: 5,
            critChance: 0.05,
            critDamage: 1.3,
            special: { hpBonus: 30 },
            desc: '蘊含自然之力的護符。'
        }
    },

    shadow_ring: {
        id: 'shadow_ring',
        name: '暗影戒指',
        icon: '💍',
        type: 'accessory',
        rarity: 'rare',
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
            type: 'accessory',
            rarity: 'rare',
            attack: 8,
            defense: 3,
            critChance: 0.12,
            critDamage: 1.7,
            desc: '籠罩暗影的神秘戒指。'
        }
    },

    dragon_amulet: {
        id: 'dragon_amulet',
        name: '龍之護符',
        icon: '🐉',
        type: 'accessory',
        rarity: 'epic',
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
            type: 'accessory',
            rarity: 'epic',
            attack: 12,
            defense: 8,
            critChance: 0.15,
            critDamage: 1.9,
            special: { dragonPower: true },
            desc: '蘊含龍之力的護符。'
        }
    },

    titan_ring: {
        id: 'titan_ring',
        name: '泰坦之戒',
        icon: '💍',
        type: 'accessory',
        rarity: 'legendary',
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
            type: 'accessory',
            rarity: 'legendary',
            attack: 20,
            defense: 15,
            critChance: 0.20,
            critDamage: 2.2,
            desc: '蘊含泰坦之力的傳說戒指。'
        }
    },

    // ==================== 藥水 ====================
    health_potion_basic: {
        id: 'health_potion_basic',
        name: '基礎生命藥水',
        icon: '🧪',
        type: 'potion',
        rarity: 'common',
        materials: [
            { id: 'slime_jelly', quantity: 3 }
        ],
        cost: 15,
        successRate: 100,
        result: {
            id: 'crafted_health_potion',
            name: '生命藥水',
            icon: '🧪',
            type: 'potion',
            rarity: 'common',
            hp: 50,
            desc: '恢復 50 點生命值。'
        }
    },

    mana_potion_basic: {
        id: 'mana_potion_basic',
        name: '基礎魔力藥水',
        icon: '💙',
        type: 'potion',
        rarity: 'common',
        materials: [
            { id: 'ectoplasm', quantity: 2 },
            { id: 'slime_jelly', quantity: 2 }
        ],
        cost: 25,
        successRate: 95,
        result: {
            id: 'crafted_mana_potion',
            name: '魔力藥水',
            icon: '💙',
            type: 'potion',
            rarity: 'common',
            mp: 30,
            desc: '恢復 30 點魔力值。'
        }
    },

    greater_health_potion: {
        id: 'greater_health_potion',
        name: '高級生命藥水',
        icon: '❤️',
        type: 'potion',
        rarity: 'uncommon',
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
            type: 'potion',
            rarity: 'uncommon',
            hp: 120,
            desc: '恢復 120 點生命值。'
        }
    },

    antidote_potion: {
        id: 'antidote_potion',
        name: '解毒劑',
        icon: '💊',
        type: 'potion',
        rarity: 'common',
        materials: [
            { id: 'poison_gland', quantity: 1 },
            { id: 'slime_jelly', quantity: 2 }
        ],
        cost: 20,
        successRate: 100,
        result: {
            id: 'crafted_antidote',
            name: '解毒劑',
            icon: '💊',
            type: 'potion',
            rarity: 'common',
            cure: 'poison',
            desc: '解除中毒狀態。'
        }
    },

    strength_elixir: {
        id: 'strength_elixir',
        name: '力量藥劑',
        icon: '💪',
        type: 'potion',
        rarity: 'rare',
        materials: [
            { id: 'fire_essence', quantity: 2 },
            { id: 'demon_horn', quantity: 1 },
            { id: 'slime_jelly', quantity: 3 }
        ],
        cost: 150,
        successRate: 75,
        result: {
            id: 'crafted_strength_elixir',
            name: '力量藥劑',
            icon: '💪',
            type: 'potion',
            rarity: 'rare',
            buff: { type: 'atk', value: 20, duration: 5 },
            desc: '暫時提升攻擊力 +20，持續5回合。'
        }
    },

    dragon_elixir: {
        id: 'dragon_elixir',
        name: '龍血藥劑',
        icon: '🐲',
        type: 'potion',
        rarity: 'epic',
        materials: [
            { id: 'dragon_heart', quantity: 1 },
            { id: 'fire_essence', quantity: 3 },
            { id: 'life_seed', quantity: 2 }
        ],
        cost: 500,
        successRate: 60,
        result: {
            id: 'crafted_dragon_elixir',
            name: '龍血藥劑',
            icon: '🐲',
            type: 'potion',
            rarity: 'epic',
            hp: 200,
            mp: 100,
            buff: { type: 'all', value: 15, duration: 10 },
            desc: '傳說中的龍血藥劑，全屬性提升！'
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
