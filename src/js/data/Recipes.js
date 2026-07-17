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
import { AffixStat, ItemRarity, EquipmentType, ItemType, WeaponForm } from '../models/Enums.js';
import { MaterialDatabase } from './Materials.js';
import { SeriesRecipeDatabase } from './RecipeSeries.js';


export const RecipeDatabase = {
    // ==================== 基礎武器 ====================
    iron_sword: {
        id: 'iron_sword',
        name: '鐵劍',
        icon: '⚔️',
        type: EquipmentType.WEAPON,
        weaponForm: WeaponForm.SWORD,
        rarity: ItemRarity.COMMON,
        materials: [
            { id: 'iron_shard', quantity: 3 }
        ],
        cost: 25,
        successRate: 100,
        result: {
            id: 'crafted_iron_sword',
            name: '鐵劍',
            icon: '⚔️',
            type: EquipmentType.WEAPON,
            weaponForm: WeaponForm.SWORD,
            rarity: ItemRarity.COMMON,
            stats: {
                attack: 8,
                defense: 0,
                critChance: 0.08,
                critDamage: 1.5,
                weaponSpeed: 1.0,
                attackSpeed: 1.0
            },
            specialEffects: [],
            desc: '由鐵礦石鍛造而成的劍。'
        }
    },

    bone_blade: {
        id: 'bone_blade',
        name: '白骨刃',
        icon: '🦴',
        type: EquipmentType.WEAPON,
        weaponForm: WeaponForm.SWORD,
        rarity: ItemRarity.UNCOMMON,
        materials: [
            { id: 'bone_fragment', quantity: 8 },
            { id: 'iron_ore', quantity: 3 }
        ],
        cost: 80,
        successRate: 95,
        result: {
            id: 'crafted_bone_blade',
            name: '白骨刃',
            icon: '🦴',
            type: EquipmentType.WEAPON,
            weaponForm: WeaponForm.SWORD,
            rarity: ItemRarity.UNCOMMON,
            stats: {
                attack: 8,
                defense: 0,
                critChance: 0.12,
                critDamage: 1.6,
                weaponSpeed: 1.0,
                attackSpeed: 1.0
            },
            specialEffects: [],
            desc: '由骨頭碎片製成的鋒利刀刃。'
        }
    },

    poison_dagger: {
        id: 'poison_dagger',
        name: '毒牙匕首',
        icon: '🗡️',
        type: EquipmentType.WEAPON,
        weaponForm: WeaponForm.DAGGER,
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
            name: '毒牙匕首',
            icon: '🗡️',
            type: EquipmentType.WEAPON,
            weaponForm: WeaponForm.DAGGER,
            rarity: ItemRarity.UNCOMMON,
            stats: {
                attack: 10,
                defense: 0,
                critChance: 0.18,
                critDamage: 1.8,
                weaponSpeed: 1.2,
                attackSpeed: 1.2
            },
            specialEffects: [ { type: AffixStat.POISON, value: 5 } ],
            desc: '塗有蜘蛛毒液的匕首。'
        }
    },

    shadow_blade: {
        id: 'shadow_blade',
        name: '影縫劍',
        icon: '⚔️',
        type: EquipmentType.WEAPON,
        weaponForm: WeaponForm.SWORD,
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
            name: '影縫劍',
            icon: '⚔️',
            type: EquipmentType.WEAPON,
            weaponForm: WeaponForm.SWORD,
            rarity: ItemRarity.RARE,
            stats: {
                attack: 30,
                defense: 0,
                critChance: 0.15,
                critDamage: 1.9,
                weaponSpeed: 1.0,
                attackSpeed: 1.0
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
        weaponForm: WeaponForm.SWORD,
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
            weaponForm: WeaponForm.SWORD,
            rarity: ItemRarity.RARE,
            stats: {
                attack: 35,
                defense: 0,
                critChance: 0.18,
                critDamage: 2.0,
                weaponSpeed: 1.0,
                attackSpeed: 1.0
            },
            specialEffects: [],
            desc: '輕盈而鋒利的秘銀劍。'
        }
    },

    ice_sword: {
        id: 'ice_sword',
        name: '霜線劍',
        icon: '❄️',
        type: EquipmentType.WEAPON,
        weaponForm: WeaponForm.SWORD,
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
            name: '霜線劍',
            icon: '❄️',
            type: EquipmentType.WEAPON,
            weaponForm: WeaponForm.SWORD,
            rarity: ItemRarity.RARE,
            stats: {
                attack: 35,
                defense: 5,
                critChance: 0.12,
                critDamage: 1.8,
                weaponSpeed: 1.0,
                attackSpeed: 1.0
            },
            specialEffects: [ { type: AffixStat.ICE, value: 15 } ],
            desc: '凝結著永恆寒冰的魔劍。'
        }
    },

    dragon_slayer: {
        id: 'dragon_slayer',
        name: '龍心餘燼',
        icon: '🐉',
        type: EquipmentType.WEAPON,
        weaponForm: WeaponForm.SWORD,
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
            name: '龍心餘燼',
            icon: '🐉',
            type: EquipmentType.WEAPON,
            weaponForm: WeaponForm.SWORD,
            rarity: ItemRarity.LEGENDARY,
            stats: {
                attack: 40,
                defense: 0,
                critChance: 0.22,
                critDamage: 2.5,
                weaponSpeed: 0.95,
                attackSpeed: 0.9
            },
            specialEffects: [ { type: AffixStat.EXECUTE, value: 0 } ],
            desc: '傳說中能斬龍的神劍。'
        }
    },

    titan_blade: {
        id: 'titan_blade',
        name: '巨神遺刃',
        icon: '⚔️',
        type: EquipmentType.WEAPON,
        weaponForm: WeaponForm.HEAVY,
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
            name: '巨神遺刃',
            icon: '⚔️',
            type: EquipmentType.WEAPON,
            weaponForm: WeaponForm.HEAVY,
            rarity: ItemRarity.LEGENDARY,
            stats: {
                attack: 50,
                defense: 10,
                critChance: 0.25,
                critDamage: 3.0,
                weaponSpeed: 0.75,
                attackSpeed: 0.7
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
            { id: 'beast_hide', quantity: 2 },
            { id: 'iron_shard', quantity: 2 }
        ],
        cost: 25,
        successRate: 100,
        result: {
            id: 'crafted_leather_armor',
            name: '皮甲',
            icon: '🥋',
            type: EquipmentType.EQUIPMENT,
            rarity: ItemRarity.COMMON,
            stats: {
                attack: 0,
                defense: 8,
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
            rarity: ItemRarity.UNCOMMON,
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
        name: '森衛甲',
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
            name: '森衛甲',
            icon: '🛡️',
            type: EquipmentType.EQUIPMENT,
            rarity: ItemRarity.RARE,
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
        name: '影縫甲',
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
            name: '影縫甲',
            icon: '⚫',
            type: EquipmentType.EQUIPMENT,
            rarity: ItemRarity.RARE,
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
        name: '龍鱗戰鎧',
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
            name: '龍鱗戰鎧',
            icon: '🐲',
            type: EquipmentType.EQUIPMENT,
            rarity: ItemRarity.EPIC,
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
        name: '巨神遺甲',
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
            name: '巨神遺甲',
            icon: '🛡️',
            type: EquipmentType.EQUIPMENT,
            rarity: ItemRarity.LEGENDARY,
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
            rarity: ItemRarity.UNCOMMON,
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

    silver_thread_hook: {
        id: 'silver_thread_hook',
        name: '銀絲伏獵鉤',
        icon: '🪝',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.UNCOMMON,
        materials: [
            { id: 'spider_silk', quantity: 3 },
            { id: 'poison_gland', quantity: 1 },
            { id: 'iron_ore', quantity: 2 }
        ],
        cost: 160,
        successRate: 88,
        result: {
            id: 'crafted_silver_thread_hook',
            name: '銀絲伏獵鉤',
            icon: '🪝',
            type: EquipmentType.ACCESSORY,
            rarity: ItemRarity.UNCOMMON,
            stats: {
                attack: 2,
                defense: 1,
                critChance: 0.06,
                critDamage: 0
            },
            specialEffects: [ { type: AffixStat.DODGE_CHANCE, value: 5 } ],
            desc: '把銀絲反扣成鉤。它不保證你比較勇敢，只保證你逃跑時比較不會被自己絆倒。'
        }
    },

    nature_amulet: {
        id: 'nature_amulet',
        name: '森息護符',
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
            name: '森息護符',
            icon: '🌿',
            type: EquipmentType.ACCESSORY,
            rarity: ItemRarity.RARE,
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

    blood_moon_pendant: {
        id: 'blood_moon_pendant',
        name: '血月角墜',
        icon: '🦌',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.RARE,
        materials: [
            { id: 'life_seed', quantity: 1 },
            { id: 'forest_essence', quantity: 2 },
            { id: 'rare_metal', quantity: 1 }
        ],
        cost: 360,
        successRate: 72,
        result: {
            id: 'crafted_blood_moon_pendant',
            name: '血月角墜',
            icon: '🦌',
            type: EquipmentType.ACCESSORY,
            rarity: ItemRarity.RARE,
            stats: {
                attack: 4,
                defense: 2,
                critChance: 0.1,
                critDamage: 0
            },
            specialEffects: [ { type: AffixStat.CRIT_DAMAGE, value: 15 } ],
            desc: '由折斷鹿角磨成的吊墜。靠近耳邊時會聽見很小聲、很憤怒的撞牆聲。'
        }
    },

    shadow_ring: {
        id: 'shadow_ring',
        name: '影縫戒',
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
            name: '影縫戒',
            icon: '💍',
            type: EquipmentType.ACCESSORY,
            rarity: ItemRarity.RARE,
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
        name: '龍息護符',
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
            name: '龍息護符',
            icon: '🐉',
            type: EquipmentType.ACCESSORY,
            rarity: ItemRarity.EPIC,
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
        name: '巨神遺戒',
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
            name: '巨神遺戒',
            icon: '💍',
            type: EquipmentType.ACCESSORY,
            rarity: ItemRarity.LEGENDARY,
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
            rarity: ItemRarity.COMMON,
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
            rarity: ItemRarity.UNCOMMON,
            hp: 120,
            desc: '恢復 120 點生命值。'
        }
    },

    // ==================== 高階/新材料裝備 ====================
    storm_spear: {
        id: 'storm_spear',
        name: '鳴雷長矛',
        icon: '⚡',
        type: EquipmentType.WEAPON,
        weaponForm: WeaponForm.LANCE,
        rarity: ItemRarity.EPIC,
        materials: [
            { id: 'storm_essence', quantity: 2 },
            { id: 'storm_crystal', quantity: 2 },
            { id: 'thunder_essence', quantity: 2 },
            { id: 'thunder_feather', quantity: 3 },
            { id: 'geo_crystal', quantity: 1 }
        ],
        cost: 2600,
        successRate: 55,
        result: {
            id: 'crafted_storm_spear',
            name: '鳴雷長矛',
            icon: '⚡',
            type: EquipmentType.WEAPON,
            weaponForm: WeaponForm.LANCE,
            rarity: ItemRarity.EPIC,
            stats: {
                attack: 56,
                defense: 4,
                critChance: 0.20,
                critDamage: 2.1,
                weaponSpeed: 1.15,
                attackSpeed: 1.3
            },
            specialEffects: [ { type: AffixStat.THUNDER, value: 28 } ],
            desc: '凝聚風暴與雷羽的長矛，攻速與暴擊兼備。'
        }
    },

    wyvern_scale_mail: {
        id: 'wyvern_scale_mail',
        name: '翼龍鱗鎧',
        icon: '🛡️',
        type: EquipmentType.EQUIPMENT,
        rarity: ItemRarity.EPIC,
        materials: [
            { id: 'wyvern_scale', quantity: 4 },
            { id: 'wyvern_wing', quantity: 2 },
            { id: 'lava_scale', quantity: 2 },
            { id: 'molten_core', quantity: 1 },
            { id: 'dragon_scale_armor', quantity: 1 }
        ],
        cost: 3000,
        successRate: 50,
        result: {
            id: 'crafted_wyvern_scale_mail',
            name: '翼龍鱗鎧',
            icon: '🛡️',
            type: EquipmentType.EQUIPMENT,
            rarity: ItemRarity.EPIC,
            stats: {
                attack: 10,
                defense: 42,
                critChance: 0.08,
                critDamage: 1.5
            },
            specialEffects: [ { type: AffixStat.FIRE, value: 12 } ],
            desc: '由翼龍與熔岩之力鍛成的鎧甲，防禦與火抗兼備。'
        }
    },

    hydra_fang_dagger: {
        id: 'hydra_fang_dagger',
        name: '九頭毒牙',
        icon: '🦂',
        type: EquipmentType.WEAPON,
        weaponForm: WeaponForm.DAGGER,
        rarity: ItemRarity.EPIC,
        materials: [
            { id: 'hydra_fang', quantity: 3 },
            { id: 'hydra_scale', quantity: 2 },
            { id: 'imp_horn', quantity: 2 },
            { id: 'poison_gland', quantity: 2 }
        ],
        cost: 2400,
        successRate: 60,
        result: {
            id: 'crafted_hydra_fang_dagger',
            name: '九頭毒牙',
            icon: '🦂',
            type: EquipmentType.WEAPON,
            weaponForm: WeaponForm.DAGGER,
            rarity: ItemRarity.EPIC,
            stats: {
                attack: 48,
                defense: 0,
                critChance: 0.24,
                critDamage: 2.2,
                weaponSpeed: 1.3,
                attackSpeed: 1.45
            },
            specialEffects: [ { type: AffixStat.POISON, value: 25 } ],
            desc: '融合九頭蛇毒液的匕首，暴擊率極高。'
        }
    },

    bone_soul_staff: {
        id: 'bone_soul_staff',
        name: '骨靈權杖',
        icon: '☠️',
        type: EquipmentType.WEAPON,
        weaponForm: WeaponForm.FOCUS,
        rarity: ItemRarity.EPIC,
        materials: [
            { id: 'bone_sword_fragment', quantity: 1 },
            { id: 'spirit_essence', quantity: 2 },
            { id: 'ectoplasm', quantity: 3 },
            { id: 'lich_phylactery', quantity: 1 },
            { id: 'spectral_staff', quantity: 1 }
        ],
        cost: 2700,
        successRate: 55,
        result: {
            id: 'crafted_bone_soul_staff',
            name: '骨靈權杖',
            icon: '☠️',
            type: EquipmentType.WEAPON,
            weaponForm: WeaponForm.FOCUS,
            rarity: ItemRarity.EPIC,
            stats: {
                attack: 44,
                defense: 6,
                critChance: 0.18,
                critDamage: 2.0,
                weaponSpeed: 0.95,
                attackSpeed: 1.05
            },
            specialEffects: [ { type: AffixStat.EXECUTE, value: 15 } ],
            desc: '由亡靈與骨魂凝聚的杖，兼具攻擊與穿透。'
        }
    },

    gargoyle_bulwark: {
        id: 'gargoyle_bulwark',
        name: '灰翼壁壘',
        icon: '🪨',
        type: EquipmentType.EQUIPMENT,
        rarity: ItemRarity.RARE,
        materials: [
            { id: 'gargoyle_wing', quantity: 2 },
            { id: 'stone_fragment', quantity: 6 },
            { id: 'rune_stone', quantity: 2 },
            { id: 'magic_crystal', quantity: 1 }
        ],
        cost: 1400,
        successRate: 70,
        result: {
            id: 'crafted_gargoyle_bulwark',
            name: '灰翼壁壘',
            icon: '🪨',
            type: EquipmentType.EQUIPMENT,
            rarity: ItemRarity.RARE,
            stats: {
                attack: 4,
                defense: 28,
                critChance: 0.04,
                critDamage: 1.4
            },
            specialEffects: [ { type: AffixStat.DAMAGE_REDUCTION, value: 10 } ],
            desc: '以石像鬼之翼與符文加固的重甲。'
        }
    },

    glimmer_focus: {
        id: 'glimmer_focus',
        name: '微光調律符',
        icon: '✨',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.RARE,
        materials: [
            { id: 'glimmer_shard', quantity: 3 },
            { id: 'rune_stone', quantity: 2 },
            { id: 'crystal_shard', quantity: 2 },
            { id: 'magic_crystal', quantity: 1 }
        ],
        cost: 1200,
        successRate: 68,
        result: {
            id: 'crafted_glimmer_focus',
            name: '微光調律符',
            icon: '✨',
            type: EquipmentType.ACCESSORY,
            rarity: ItemRarity.RARE,
            stats: {
                attack: 8,
                defense: 6,
                critChance: 0.08,
                critDamage: 1.55
            },
            specialEffects: [
                { type: AffixStat.ATTACK_SPEED, value: 8 },
                { type: AffixStat.CRIT_CHANCE, value: 3 }
            ],
            desc: '用微光與符文校準出手節奏的護符，只提供光明系的弱化前兆。'
        }
    },

    goblin_trickster_charm: {
        id: 'goblin_trickster_charm',
        name: '哥布林詭符',
        icon: '🪙',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.UNCOMMON,
        materials: [
            { id: 'goblin_coin', quantity: 10 },
            { id: 'goblin_ear', quantity: 5 },
            { id: 'rat_tail', quantity: 5 },
            { id: 'raw_meat', quantity: 3 },
            { id: 'orc_fang', quantity: 2 }
        ],
        cost: 300,
        successRate: 90,
        result: {
            id: 'crafted_goblin_trickster_charm',
            name: '哥布林詭符',
            icon: '🪙',
            type: EquipmentType.ACCESSORY,
            rarity: ItemRarity.UNCOMMON,
            stats: {
                attack: 6,
                defense: 2,
                critChance: 0.08,
                critDamage: 1.4
            },
            specialEffects: [ { type: AffixStat.DODGE_CHANCE, value: 8 } ],
            desc: '集結哥布林戰利品製成的小護符，靈巧提升。'
        }
    },

    demonwar_helm: {
        id: 'demonwar_helm',
        name: '黑焰令盔',
        icon: '👹',
        type: EquipmentType.EQUIPMENT,
        rarity: ItemRarity.EPIC,
        materials: [
            { id: 'demon_general_helm', quantity: 1 },
            { id: 'demon_horn', quantity: 3 },
            { id: 'demonic_steel', quantity: 3 },
            { id: 'soul_fragment', quantity: 2 },
            { id: 'general_armor', quantity: 1 },
            { id: 'commander_blade', quantity: 1 }
        ],
        cost: 3200,
        successRate: 50,
        result: {
            id: 'crafted_demonwar_helm',
            name: '黑焰令盔',
            icon: '👹',
            type: EquipmentType.EQUIPMENT,
            rarity: ItemRarity.EPIC,
            stats: {
                attack: 8,
                defense: 36,
                critChance: 0.10,
                critDamage: 1.6
            },
            specialEffects: [ { type: AffixStat.DAMAGE_REDUCTION, value: 12 } ],
            desc: '由魔角與魔鋼打造的指揮官頭盔，穩固防禦。'
        }
    },

    dragon_overlord_crown: {
        id: 'dragon_overlord_crown',
        name: '黑鱗餘冕',
        icon: '👑',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.LEGENDARY,
        materials: [
            { id: 'overlord_crown', quantity: 1 },
            { id: 'dragon_scale_armor', quantity: 1 },
            { id: 'dark_dragon_scale', quantity: 2 },
            { id: 'pure_crystal', quantity: 2 }
        ],
        cost: 5200,
        successRate: 40,
        result: {
            id: 'crafted_dragon_overlord_crown',
            name: '黑鱗餘冕',
            icon: '👑',
            type: EquipmentType.ACCESSORY,
            rarity: ItemRarity.LEGENDARY,
            stats: {
                attack: 22,
                defense: 24,
                critChance: 0.16,
                critDamage: 2.0
            },
            specialEffects: [ { type: AffixStat.CRIT_DAMAGE, value: 35 } ],
            desc: '融合霸主王冠與龍鱗的冠冕，象徵至高權威。'
        }
    },

    primal_focus: {
        id: 'primal_focus',
        name: '原初聚心',
        icon: '✨',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.LEGENDARY,
        materials: [
            { id: 'primal_essence', quantity: 2 },
            { id: 'ancient_artifact', quantity: 1 },
            { id: 'ancient_gear', quantity: 2 },
            { id: 'ancient_rune', quantity: 2 },
            { id: 'pure_crystal', quantity: 1 }
        ],
        cost: 5400,
        successRate: 45,
        result: {
            id: 'crafted_primal_focus',
            name: '原初聚心',
            icon: '✨',
            type: EquipmentType.ACCESSORY,
            rarity: ItemRarity.LEGENDARY,
            stats: {
                attack: 18,
                defense: 18,
                critChance: 0.18,
                critDamage: 2.1
            },
            specialEffects: [ { type: AffixStat.ALL_STATS, value: 10 } ],
            desc: '以原始精華與遠古零件組成的聚能器，全屬性提升。'
        }
    },

    slime_crown_ring: {
        id: 'slime_crown_ring',
        name: '青凝冠戒',
        icon: '👑',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.RARE,
        materials: [
            { id: 'slime_crown', quantity: 1 },
            { id: 'carnivore_seed', quantity: 2 },
            { id: 'alpha_fang', quantity: 3 }
        ],
        cost: 900,
        successRate: 80,
        result: {
            id: 'crafted_slime_crown_ring',
            name: '青凝冠戒',
            icon: '👑',
            type: EquipmentType.ACCESSORY,
            rarity: ItemRarity.RARE,
            stats: {
                attack: 8,
                defense: 6,
                critChance: 0.12,
                critDamage: 1.6
            },
            specialEffects: [ { type: AffixStat.HP_REGEN ?? 'HP_REGEN', value: 6 } ],
            desc: '以史萊姆王冠與獸牙種子打造的戒指，增強再生。'
        }
    },

    assassin_shadow_veil: {
        id: 'assassin_shadow_veil',
        name: '無聲影幕',
        icon: '🗡️',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.EPIC,
        materials: [
            { id: 'assassin_blade_fragment', quantity: 1 },
            { id: 'shadow_arrow', quantity: 4 },
            { id: 'shadow_insignia', quantity: 2 },
            { id: 'void_essence', quantity: 1 }
        ],
        cost: 2600,
        successRate: 60,
        result: {
            id: 'crafted_assassin_shadow_veil',
            name: '無聲影幕',
            icon: '🗡️',
            type: EquipmentType.ACCESSORY,
            rarity: ItemRarity.EPIC,
            stats: {
                attack: 16,
                defense: 10,
                critChance: 0.22,
                critDamage: 2.0
            },
            specialEffects: [ { type: AffixStat.DODGE_CHANCE, value: 15 } ],
            desc: '暗影刺客遺留的影幕，暴擊與閃避並重。'
        }
    },

    earthwarden_aegis: {
        id: 'earthwarden_aegis',
        name: '地脈守盾',
        icon: '🌍',
        type: EquipmentType.EQUIPMENT,
        rarity: ItemRarity.RARE,
        materials: [
            { id: 'earth_essence', quantity: 3 },
            { id: 'golem_core', quantity: 1 },
            { id: 'molten_core', quantity: 1 },
            { id: 'stone_fragment', quantity: 4 }
        ],
        cost: 1500,
        successRate: 70,
        result: {
            id: 'crafted_earthwarden_aegis',
            name: '地脈守盾',
            icon: '🌍',
            type: EquipmentType.EQUIPMENT,
            rarity: ItemRarity.RARE,
            stats: {
                attack: 4,
                defense: 30,
                critChance: 0.04,
                critDamage: 1.3
            },
            specialEffects: [ { type: AffixStat.DAMAGE_REDUCTION, value: 10 } ],
            desc: '以大地精華與魔像核心鑄成的守護盾牌。'
        }
    },

    frostbound_scepter: {
        id: 'frostbound_scepter',
        name: '霜縛權杖',
        icon: '❄️',
        type: EquipmentType.WEAPON,
        weaponForm: WeaponForm.FOCUS,
        rarity: ItemRarity.RARE,
        materials: [
            { id: 'frost_core', quantity: 2 },
            { id: 'magic_crystal', quantity: 2 },
            { id: 'pure_crystal', quantity: 1 }
        ],
        cost: 1600,
        successRate: 70,
        result: {
            id: 'crafted_frostbound_scepter',
            name: '霜縛權杖',
            icon: '❄️',
            type: EquipmentType.WEAPON,
            weaponForm: WeaponForm.FOCUS,
            rarity: ItemRarity.RARE,
            stats: {
                attack: 32,
                defense: 4,
                critChance: 0.14,
                critDamage: 1.8,
                weaponSpeed: 0.95,
                attackSpeed: 1.05
            },
            specialEffects: [ { type: AffixStat.ICE, value: 18 } ],
            desc: '封印霜核能量的權杖，兼具控制與傷害。'
        }
    }

};

Object.assign(RecipeDatabase, SeriesRecipeDatabase);

const RECIPE_RESULT_LEVELS = Object.freeze({
    iron_sword: 1,
    leather_armor: 1,
    bone_blade: 3,
    health_potion_basic: 1,
    greater_health_potion: 5,
    wolf_cloak: 5,
    wolf_fang_necklace: 5,
    poison_dagger: 8,
    silver_thread_hook: 8,
    goblin_trickster_charm: 8,
    guardian_armor: 13,
    nature_amulet: 13,
    blood_moon_pendant: 15,
    bone_soul_staff: 18,
    gargoyle_bulwark: 20,
    glimmer_focus: 20,
    mithril_sword: 25,
    shadow_blade: 28,
    shadow_armor: 28,
    shadow_ring: 28,
    earthwarden_aegis: 33,
    frostbound_scepter: 33,
    hydra_fang_dagger: 33,
    ice_sword: 35,
    storm_spear: 45,
    titan_blade: 40,
    titan_armor: 40,
    titan_ring: 40,
    primal_focus: 48,
    wyvern_scale_mail: 55,
    dragon_scale_armor: 58,
    dragon_amulet: 58,
    dragon_slayer: 60,
    assassin_shadow_veil: 63,
    demonwar_helm: 68,
    dragon_overlord_crown: 70,
    slime_crown_ring: 8
});

Object.entries(RecipeDatabase).forEach(([recipeId, recipe]) => {
    const level = RECIPE_RESULT_LEVELS[recipeId];
    if (!level || !recipe.result) return;

    recipe.level ??= level;
    recipe.result.level ??= level;
    recipe.result.requiredLevel ??= level;
});


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
export function getMissingMaterials(recipeId, inventory, warehouse = []) {
    const recipe = getRecipe(recipeId);
    if (!recipe) return [];

    const allItems = [...(inventory || []), ...(warehouse || [])];
    const missing = [];
    for (const mat of recipe.materials) {
        const owned = allItems.filter(item => item.item?.id === mat.id)
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
