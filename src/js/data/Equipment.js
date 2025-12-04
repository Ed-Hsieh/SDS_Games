/**
 * Equipment.js
 * 裝備資料庫 - 包含所有裝備、套裝效果和特殊效果
 */

// 裝備類型
export const EquipmentType = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    HELMET: 'helmet',
    GLOVES: 'gloves',
    BOOTS: 'boots',
    ACCESSORY: 'accessory',
    RING: 'ring',
    NECKLACE: 'necklace'
};

// 稀有度
export const Rarity = {
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary',
    MYTHIC: 'mythic'
};

// 稀有度顏色
export const RarityColors = {
    common: '#9d9d9d',
    uncommon: '#1eff00',
    rare: '#0070dd',
    epic: '#a335ee',
    legendary: '#ff8000',
    mythic: '#e6cc80'
};

// 特殊效果類型
export const SpecialEffectType = {
    // 攻擊類
    LIFE_STEAL: 'life_steal',           // 生命偷取
    CRITICAL_BOOST: 'critical_boost',   // 暴擊增強
    ARMOR_PIERCE: 'armor_pierce',       // 護甲穿透
    DOUBLE_STRIKE: 'double_strike',     // 雙重打擊
    EXECUTE: 'execute',                 // 斬殺（低HP額外傷害）
    
    // 元素類
    FIRE_DAMAGE: 'fire_damage',         // 火焰傷害
    ICE_DAMAGE: 'ice_damage',           // 冰霜傷害
    THUNDER_DAMAGE: 'thunder_damage',   // 雷電傷害
    POISON_DAMAGE: 'poison_damage',     // 毒素傷害
    SHADOW_DAMAGE: 'shadow_damage',     // 暗影傷害
    
    // 防禦類
    DAMAGE_REFLECT: 'damage_reflect',   // 傷害反彈
    SHIELD_BLOCK: 'shield_block',       // 格擋
    HP_REGEN: 'hp_regen',               // 生命回復
    DAMAGE_REDUCE: 'damage_reduce',     // 傷害減免
    
    // 特殊類
    GOLD_BONUS: 'gold_bonus',           // 金幣加成
    EXP_BONUS: 'exp_bonus',             // 經驗加成
    DROP_BONUS: 'drop_bonus',           // 掉落率加成
    REVIVE: 'revive'                    // 復活
};

/**
 * 特殊效果說明
 */
export const SpecialEffectDescriptions = {
    life_steal: (value) => `攻擊時回復 ${value}% 傷害的生命`,
    critical_boost: (value) => `暴擊傷害 +${value}%`,
    armor_pierce: (value) => `無視敵人 ${value}% 防禦`,
    double_strike: (value) => `${value}% 機率發動雙重打擊`,
    execute: (value) => `對低於 30% HP 的敵人造成額外 ${value}% 傷害`,
    
    fire_damage: (value) => `附加 ${value} 點火焰傷害`,
    ice_damage: (value) => `附加 ${value} 點冰霜傷害，${Math.floor(value/2)}% 機率減速`,
    thunder_damage: (value) => `附加 ${value} 點雷電傷害，${Math.floor(value/3)}% 機率麻痺`,
    poison_damage: (value) => `附加 ${value} 點毒素傷害，持續 3 回合`,
    shadow_damage: (value) => `附加 ${value} 點暗影傷害，降低敵人命中`,
    
    damage_reflect: (value) => `反彈 ${value}% 受到的傷害`,
    shield_block: (value) => `${value}% 機率完全格擋攻擊`,
    hp_regen: (value) => `每回合回復 ${value} 點生命`,
    damage_reduce: (value) => `受到的傷害減少 ${value}%`,
    
    gold_bonus: (value) => `金幣獲取 +${value}%`,
    exp_bonus: (value) => `經驗獲取 +${value}%`,
    drop_bonus: (value) => `掉落率 +${value}%`,
    revive: (value) => `死亡時 ${value}% 機率復活並回復 30% HP`
};

/**
 * 裝備資料庫
 */
export const EquipmentDatabase = {
    // ==================== 第一章掉落武器 ====================
    slime_sword: {
        id: 'slime_sword',
        name: '史萊姆之劍',
        icon: '🗡️',
        type: EquipmentType.WEAPON,
        rarity: Rarity.UNCOMMON,
        level: 1,
        stats: {
            attack: 8,
            defense: 0,
            critChance: 0.05,
            critDamage: 1.3,
            weaponSpeed: 1.0,    // 節奏條指針速度
            attackSpeed: 1.2     // 攻擊頻率（每秒）
        },
        specialEffects: [
            { type: SpecialEffectType.LIFE_STEAL, value: 3 }
        ],
        setId: null,
        description: '由史萊姆凝膠包裹的劍，攻擊時能吸取少量生命。',
        dropFrom: ['slime']
    },

    goblin_dagger: {
        id: 'goblin_dagger',
        name: '哥布林短刀',
        icon: '🔪',
        type: EquipmentType.WEAPON,
        rarity: Rarity.UNCOMMON,
        level: 3,
        stats: {
            attack: 10,
            defense: 0,
            critChance: 0.15,
            critDamage: 1.6,
            weaponSpeed: 1.0,    // 節奏條指針速度
            attackSpeed: 1.2     // 攻擊頻率（每秒）
        },
        specialEffects: [
            { type: SpecialEffectType.CRITICAL_BOOST, value: 15 }
        ],
        setId: null,
        description: '哥布林首領的愛刀，鋒利無比。',
        dropFrom: ['goblin', 'tower_goblin_chief']
    },

    // ==================== 第二章掉落裝備 ====================
    wolf_fang_blade: {
        id: 'wolf_fang_blade',
        name: '狼牙刀',
        icon: '⚔️',
        type: EquipmentType.WEAPON,
        rarity: Rarity.UNCOMMON,
        level: 4,
        stats: {
            attack: 14,
            defense: 0,
            critChance: 0.12,
            critDamage: 1.7,
            weaponSpeed: 1.1,
            attackSpeed: 1.3
        },
        specialEffects: [
            { type: SpecialEffectType.DOUBLE_STRIKE, value: 8 }
        ],
        setId: 'wolf_hunter',
        description: '由狼牙製成的武器，有機率造成雙重打擊。',
        dropFrom: ['forest_wolf', 'tower_alpha_wolf']
    },

    wolf_pelt_armor: {
        id: 'wolf_pelt_armor',
        name: '狼皮護甲',
        icon: '🥋',
        type: EquipmentType.ARMOR,
        rarity: Rarity.UNCOMMON,
        level: 4,
        stats: {
            attack: 2,
            defense: 12,
            critChance: 0.03,
            critDamage: 1.2
        },
        specialEffects: [
            { type: SpecialEffectType.HP_REGEN, value: 2 }
        ],
        setId: 'wolf_hunter',
        description: '由狼皮製成的護甲，輕便保暖。',
        dropFrom: ['forest_wolf']
    },

    spider_silk_gloves: {
        id: 'spider_silk_gloves',
        name: '蛛絲手套',
        icon: '🧤',
        type: EquipmentType.GLOVES,
        rarity: Rarity.UNCOMMON,
        level: 5,
        stats: {
            attack: 5,
            defense: 5,
            critChance: 0.08,
            critDamage: 1.4
        },
        specialEffects: [
            { type: SpecialEffectType.POISON_DAMAGE, value: 5 }
        ],
        setId: null,
        description: '由蜘蛛絲編織的手套，帶有微量毒素。',
        dropFrom: ['poison_spider', 'tower_poison_queen']
    },

    forest_guardian_staff: {
        id: 'forest_guardian_staff',
        name: '森林守護者之杖',
        icon: '🌿',
        type: EquipmentType.WEAPON,
        rarity: Rarity.RARE,
        level: 7,
        stats: {
            attack: 18,
            defense: 5,
            critChance: 0.10,
            critDamage: 1.5,
            weaponSpeed: 0.9,
            attackSpeed: 1.0
        },
        specialEffects: [
            { type: SpecialEffectType.HP_REGEN, value: 5 },
            { type: SpecialEffectType.LIFE_STEAL, value: 5 }
        ],
        setId: 'forest_guardian',
        description: '森林守護者的權杖，蘊含自然之力。',
        dropFrom: ['forest_guardian']
    },

    forest_guardian_crown: {
        id: 'forest_guardian_crown',
        name: '森林守護者之冠',
        icon: '👑',
        type: EquipmentType.HELMET,
        rarity: Rarity.RARE,
        level: 7,
        stats: {
            attack: 3,
            defense: 15,
            critChance: 0.05,
            critDamage: 1.3
        },
        specialEffects: [
            { type: SpecialEffectType.DAMAGE_REDUCE, value: 5 }
        ],
        setId: 'forest_guardian',
        description: '由樹枝與樹葉編織的王冠。',
        dropFrom: ['forest_guardian']
    },

    // ==================== 第三章掉落裝備 ====================
    bone_sword: {
        id: 'bone_sword',
        name: '骷髏戰士之劍',
        icon: '💀',
        type: EquipmentType.WEAPON,
        rarity: Rarity.UNCOMMON,
        level: 7,
        stats: {
            attack: 16,
            defense: 0,
            critChance: 0.10,
            critDamage: 1.5,
            weaponSpeed: 1.0,
            attackSpeed: 1.2
        },
        specialEffects: [
            { type: SpecialEffectType.ARMOR_PIERCE, value: 10 }
        ],
        setId: 'undead_slayer',
        description: '骷髏戰士使用的劍，能穿透護甲。',
        dropFrom: ['skeleton_warrior', 'tower_skeleton_captain']
    },

    ghost_cloak: {
        id: 'ghost_cloak',
        name: '幽靈斗篷',
        icon: '👻',
        type: EquipmentType.ARMOR,
        rarity: Rarity.RARE,
        level: 8,
        stats: {
            attack: 5,
            defense: 10,
            critChance: 0.08,
            critDamage: 1.4
        },
        specialEffects: [
            { type: SpecialEffectType.SHIELD_BLOCK, value: 8 },
            { type: SpecialEffectType.SHADOW_DAMAGE, value: 8 }
        ],
        setId: 'undead_slayer',
        description: '由靈質編織的斗篷，能讓穿戴者隱匿身形。',
        dropFrom: ['ghost']
    },

    lich_staff: {
        id: 'lich_staff',
        name: '巫妖法杖',
        icon: '☠️',
        type: EquipmentType.WEAPON,
        rarity: Rarity.EPIC,
        level: 10,
        stats: {
            attack: 28,
            defense: 3,
            critChance: 0.15,
            critDamage: 2.0,
            weaponSpeed: 0.8,
            attackSpeed: 0.9
        },
        specialEffects: [
            { type: SpecialEffectType.SHADOW_DAMAGE, value: 15 },
            { type: SpecialEffectType.LIFE_STEAL, value: 10 },
            { type: SpecialEffectType.EXECUTE, value: 20 }
        ],
        setId: null,
        description: '巫妖的權杖，蘊含死亡的力量。',
        dropFrom: ['lich']
    },

    // ==================== 第四章掉落裝備 ====================
    shadow_blade: {
        id: 'shadow_blade_drop',
        name: '暗影之刃',
        icon: '🗡️',
        type: EquipmentType.WEAPON,
        rarity: Rarity.RARE,
        level: 11,
        stats: {
            attack: 25,
            defense: 0,
            critChance: 0.18,
            critDamage: 1.9,
            weaponSpeed: 1.2,
            attackSpeed: 1.4
        },
        specialEffects: [
            { type: SpecialEffectType.SHADOW_DAMAGE, value: 12 },
            { type: SpecialEffectType.CRITICAL_BOOST, value: 20 }
        ],
        setId: 'shadow_legion',
        description: '暗影士兵的標準配刀。',
        dropFrom: ['shadow_soldier']
    },

    shadow_armor: {
        id: 'shadow_armor_drop',
        name: '暗影護甲',
        icon: '⚫',
        type: EquipmentType.ARMOR,
        rarity: Rarity.RARE,
        level: 12,
        stats: {
            attack: 5,
            defense: 22,
            critChance: 0.05,
            critDamage: 1.3
        },
        specialEffects: [
            { type: SpecialEffectType.DAMAGE_REDUCE, value: 8 },
            { type: SpecialEffectType.SHIELD_BLOCK, value: 5 }
        ],
        setId: 'shadow_legion',
        description: '暗影軍團的制式護甲。',
        dropFrom: ['shadow_soldier', 'shadow_archer']
    },

    shadow_boots: {
        id: 'shadow_boots',
        name: '暗影之靴',
        icon: '👢',
        type: EquipmentType.BOOTS,
        rarity: Rarity.RARE,
        level: 13,
        stats: {
            attack: 3,
            defense: 15,
            critChance: 0.10,
            critDamage: 1.5
        },
        specialEffects: [
            { type: SpecialEffectType.DOUBLE_STRIKE, value: 10 }
        ],
        setId: 'shadow_legion',
        description: '暗影軍團的戰靴，輕盈無聲。',
        dropFrom: ['shadow_mage']
    },

    shadow_commander_blade: {
        id: 'shadow_commander_blade',
        name: '暗影指揮官之劍',
        icon: '⚔️',
        type: EquipmentType.WEAPON,
        rarity: Rarity.EPIC,
        level: 14,
        stats: {
            attack: 38,
            defense: 5,
            critChance: 0.20,
            critDamage: 2.2,
            weaponSpeed: 1.0,
            attackSpeed: 1.1
        },
        specialEffects: [
            { type: SpecialEffectType.SHADOW_DAMAGE, value: 20 },
            { type: SpecialEffectType.ARMOR_PIERCE, value: 15 },
            { type: SpecialEffectType.LIFE_STEAL, value: 8 }
        ],
        setId: 'shadow_legion',
        description: '暗影指揮官的佩劍，斬殺無數英雄。',
        dropFrom: ['shadow_commander']
    },

    // ==================== 第五章掉落裝備 ====================
    ancient_sword: {
        id: 'ancient_sword',
        name: '遠古之劍',
        icon: '⚔️',
        type: EquipmentType.WEAPON,
        rarity: Rarity.RARE,
        level: 15,
        stats: {
            attack: 32,
            defense: 5,
            critChance: 0.12,
            critDamage: 1.8,
            weaponSpeed: 1.0,
            attackSpeed: 1.2
        },
        specialEffects: [
            { type: SpecialEffectType.ARMOR_PIERCE, value: 20 }
        ],
        setId: 'ancient_relic',
        description: '古代文明遺留的武器。',
        dropFrom: ['ancient_guardian']
    },

    crystal_shield: {
        id: 'crystal_shield',
        name: '水晶護盾',
        icon: '💎',
        type: EquipmentType.ARMOR,
        rarity: Rarity.RARE,
        level: 16,
        stats: {
            attack: 0,
            defense: 35,
            critChance: 0.05,
            critDamage: 1.2
        },
        specialEffects: [
            { type: SpecialEffectType.DAMAGE_REFLECT, value: 10 },
            { type: SpecialEffectType.SHIELD_BLOCK, value: 12 }
        ],
        setId: 'ancient_relic',
        description: '純淨水晶製成的護盾。',
        dropFrom: ['crystal_golem']
    },

    rune_gauntlet: {
        id: 'rune_gauntlet',
        name: '符文臂鎧',
        icon: '🧤',
        type: EquipmentType.GLOVES,
        rarity: Rarity.RARE,
        level: 17,
        stats: {
            attack: 15,
            defense: 12,
            critChance: 0.10,
            critDamage: 1.6
        },
        specialEffects: [
            { type: SpecialEffectType.CRITICAL_BOOST, value: 25 }
        ],
        setId: 'ancient_relic',
        description: '刻滿符文的臂鎧。',
        dropFrom: ['rune_keeper']
    },

    titan_hammer: {
        id: 'titan_hammer',
        name: '泰坦之錘',
        icon: '🔨',
        type: EquipmentType.WEAPON,
        rarity: Rarity.EPIC,
        level: 18,
        stats: {
            attack: 50,
            defense: 10,
            critChance: 0.15,
            critDamage: 2.5,
            weaponSpeed: 0.6,
            attackSpeed: 0.7
        },
        specialEffects: [
            { type: SpecialEffectType.ARMOR_PIERCE, value: 25 },
            { type: SpecialEffectType.EXECUTE, value: 30 },
            { type: SpecialEffectType.DOUBLE_STRIKE, value: 12 }
        ],
        setId: 'titan',
        description: '遠古泰坦的戰錘，蘊含毀滅之力。',
        dropFrom: ['ancient_titan']
    },

    // ==================== 第六章掉落裝備 ====================
    flame_sword: {
        id: 'flame_sword',
        name: '烈焰劍',
        icon: '🔥',
        type: EquipmentType.WEAPON,
        rarity: Rarity.RARE,
        level: 19,
        stats: {
            attack: 35,
            defense: 0,
            critChance: 0.15,
            critDamage: 1.8,
            weaponSpeed: 1.1,
            attackSpeed: 1.3
        },
        specialEffects: [
            { type: SpecialEffectType.FIRE_DAMAGE, value: 20 }
        ],
        setId: 'elemental_master',
        description: '燃燒著永恆火焰的劍。',
        dropFrom: ['fire_elemental', 'tower_flame_imp']
    },

    frost_blade: {
        id: 'frost_blade',
        name: '霜寒之刃',
        icon: '❄️',
        type: EquipmentType.WEAPON,
        rarity: Rarity.RARE,
        level: 19,
        stats: {
            attack: 30,
            defense: 5,
            critChance: 0.12,
            critDamage: 1.7,
            weaponSpeed: 1.0,
            attackSpeed: 1.2
        },
        specialEffects: [
            { type: SpecialEffectType.ICE_DAMAGE, value: 18 }
        ],
        setId: 'elemental_master',
        description: '凝結著永恆寒冰的劍。',
        dropFrom: ['ice_elemental', 'tower_frost_giant']
    },

    thunder_axe: {
        id: 'thunder_axe',
        name: '雷霆戰斧',
        icon: '⚡',
        type: EquipmentType.WEAPON,
        rarity: Rarity.RARE,
        level: 20,
        stats: {
            attack: 40,
            defense: 0,
            critChance: 0.18,
            critDamage: 2.0,
            weaponSpeed: 0.75,
            attackSpeed: 0.9
        },
        specialEffects: [
            { type: SpecialEffectType.THUNDER_DAMAGE, value: 22 }
        ],
        setId: 'elemental_master',
        description: '蘊含雷霆之力的戰斧。',
        dropFrom: ['thunder_elemental', 'tower_thunder_hawk']
    },

    elemental_crown: {
        id: 'elemental_crown',
        name: '元素之冠',
        icon: '👑',
        type: EquipmentType.HELMET,
        rarity: Rarity.EPIC,
        level: 22,
        stats: {
            attack: 15,
            defense: 25,
            critChance: 0.15,
            critDamage: 1.8
        },
        specialEffects: [
            { type: SpecialEffectType.FIRE_DAMAGE, value: 10 },
            { type: SpecialEffectType.ICE_DAMAGE, value: 10 },
            { type: SpecialEffectType.THUNDER_DAMAGE, value: 10 },
            { type: SpecialEffectType.DAMAGE_REDUCE, value: 10 }
        ],
        setId: 'elemental_master',
        description: '元素之主的王冠，融合四大元素。',
        dropFrom: ['elemental_lord']
    },

    // ==================== 第七章掉落裝備 ====================
    wyvern_lance: {
        id: 'wyvern_lance',
        name: '翼龍之槍',
        icon: '🔱',
        type: EquipmentType.WEAPON,
        rarity: Rarity.RARE,
        level: 23,
        stats: {
            attack: 42,
            defense: 5,
            critChance: 0.16,
            critDamage: 1.9,
            weaponSpeed: 1.1,
            attackSpeed: 1.3
        },
        specialEffects: [
            { type: SpecialEffectType.ARMOR_PIERCE, value: 18 },
            { type: SpecialEffectType.DOUBLE_STRIKE, value: 10 }
        ],
        setId: 'dragon_slayer',
        description: '專門獵殺龍類的長槍。',
        dropFrom: ['wyvern']
    },

    drake_scale_mail: {
        id: 'drake_scale_mail',
        name: '幼龍鱗甲',
        icon: '🐉',
        type: EquipmentType.ARMOR,
        rarity: Rarity.RARE,
        level: 24,
        stats: {
            attack: 8,
            defense: 38,
            critChance: 0.08,
            critDamage: 1.5
        },
        specialEffects: [
            { type: SpecialEffectType.FIRE_DAMAGE, value: 10 },
            { type: SpecialEffectType.DAMAGE_REDUCE, value: 12 }
        ],
        setId: 'dragon_slayer',
        description: '由幼龍鱗片製成的鎧甲。',
        dropFrom: ['drake']
    },

    dragon_knight_helm: {
        id: 'dragon_knight_helm',
        name: '龍騎士頭盔',
        icon: '⛑️',
        type: EquipmentType.HELMET,
        rarity: Rarity.EPIC,
        level: 25,
        stats: {
            attack: 12,
            defense: 30,
            critChance: 0.12,
            critDamage: 1.7
        },
        specialEffects: [
            { type: SpecialEffectType.CRITICAL_BOOST, value: 30 },
            { type: SpecialEffectType.DAMAGE_REDUCE, value: 10 }
        ],
        setId: 'dragon_slayer',
        description: '龍騎士的頭盔，象徵榮耀。',
        dropFrom: ['dragon_knight']
    },

    elder_dragon_fang: {
        id: 'elder_dragon_fang',
        name: '古龍之牙',
        icon: '🐲',
        type: EquipmentType.WEAPON,
        rarity: Rarity.LEGENDARY,
        level: 26,
        stats: {
            attack: 65,
            defense: 10,
            critChance: 0.22,
            critDamage: 2.8,
            weaponSpeed: 0.9,
            attackSpeed: 1.0
        },
        specialEffects: [
            { type: SpecialEffectType.FIRE_DAMAGE, value: 30 },
            { type: SpecialEffectType.ARMOR_PIERCE, value: 25 },
            { type: SpecialEffectType.EXECUTE, value: 35 },
            { type: SpecialEffectType.LIFE_STEAL, value: 12 }
        ],
        setId: 'dragon_slayer',
        description: '由古龍之牙鍛造的傳說武器。',
        dropFrom: ['elder_dragon']
    },

    // ==================== 第八章掉落裝備 ====================
    assassin_blade: {
        id: 'assassin_blade',
        name: '刺客之刃',
        icon: '🗡️',
        type: EquipmentType.WEAPON,
        rarity: Rarity.EPIC,
        level: 27,
        stats: {
            attack: 55,
            defense: 0,
            critChance: 0.30,
            critDamage: 2.5,
            weaponSpeed: 1.4,
            attackSpeed: 1.6
        },
        specialEffects: [
            { type: SpecialEffectType.CRITICAL_BOOST, value: 40 },
            { type: SpecialEffectType.POISON_DAMAGE, value: 15 },
            { type: SpecialEffectType.DOUBLE_STRIKE, value: 15 }
        ],
        setId: null,
        description: '暗影刺客的致命武器。',
        dropFrom: ['shadow_assassin']
    },

    shadow_overlord_armor: {
        id: 'shadow_overlord_armor',
        name: '暗影霸主鎧甲',
        icon: '👹',
        type: EquipmentType.ARMOR,
        rarity: Rarity.LEGENDARY,
        level: 28,
        stats: {
            attack: 15,
            defense: 55,
            critChance: 0.15,
            critDamage: 1.8
        },
        specialEffects: [
            { type: SpecialEffectType.SHADOW_DAMAGE, value: 25 },
            { type: SpecialEffectType.DAMAGE_REDUCE, value: 15 },
            { type: SpecialEffectType.DAMAGE_REFLECT, value: 10 },
            { type: SpecialEffectType.HP_REGEN, value: 10 }
        ],
        setId: null,
        description: '暗影霸主的鎧甲，散發著邪惡氣息。',
        dropFrom: ['shadow_overlord']
    },

    // ==================== 第九章掉落裝備 ====================
    demon_blade: {
        id: 'demon_blade',
        name: '魔族戰刃',
        icon: '😈',
        type: EquipmentType.WEAPON,
        rarity: Rarity.EPIC,
        level: 29,
        stats: {
            attack: 60,
            defense: 5,
            critChance: 0.20,
            critDamage: 2.3,
            weaponSpeed: 1.0,
            attackSpeed: 1.2
        },
        specialEffects: [
            { type: SpecialEffectType.FIRE_DAMAGE, value: 25 },
            { type: SpecialEffectType.LIFE_STEAL, value: 15 },
            { type: SpecialEffectType.EXECUTE, value: 25 }
        ],
        setId: 'demon_lord',
        description: '魔族士兵的戰刃，燃燒著地獄之火。',
        dropFrom: ['demon_soldier']
    },

    demon_general_armor: {
        id: 'demon_general_armor',
        name: '魔將鎧甲',
        icon: '👿',
        type: EquipmentType.ARMOR,
        rarity: Rarity.EPIC,
        level: 30,
        stats: {
            attack: 18,
            defense: 50,
            critChance: 0.15,
            critDamage: 1.9
        },
        specialEffects: [
            { type: SpecialEffectType.FIRE_DAMAGE, value: 15 },
            { type: SpecialEffectType.DAMAGE_REDUCE, value: 18 },
            { type: SpecialEffectType.HP_REGEN, value: 8 }
        ],
        setId: 'demon_lord',
        description: '魔族將軍的鎧甲。',
        dropFrom: ['demon_general']
    },

    demon_lord_sword: {
        id: 'demon_lord_sword',
        name: '魔王之劍',
        icon: '👑',
        type: EquipmentType.WEAPON,
        rarity: Rarity.MYTHIC,
        level: 30,
        stats: {
            attack: 100,
            defense: 15,
            critChance: 0.25,
            critDamage: 3.5,
            weaponSpeed: 0.85,
            attackSpeed: 1.0
        },
        specialEffects: [
            { type: SpecialEffectType.FIRE_DAMAGE, value: 40 },
            { type: SpecialEffectType.SHADOW_DAMAGE, value: 40 },
            { type: SpecialEffectType.LIFE_STEAL, value: 20 },
            { type: SpecialEffectType.ARMOR_PIERCE, value: 30 },
            { type: SpecialEffectType.EXECUTE, value: 50 }
        ],
        setId: 'demon_lord',
        description: '魔王阿薩謝爾的佩劍，蘊含毀滅世界的力量。',
        dropFrom: ['demon_lord_asariel']
    },

    demon_lord_crown: {
        id: 'demon_lord_crown',
        name: '魔王之冠',
        icon: '👑',
        type: EquipmentType.HELMET,
        rarity: Rarity.MYTHIC,
        level: 30,
        stats: {
            attack: 25,
            defense: 40,
            critChance: 0.20,
            critDamage: 2.5
        },
        specialEffects: [
            { type: SpecialEffectType.CRITICAL_BOOST, value: 50 },
            { type: SpecialEffectType.DAMAGE_REDUCE, value: 20 },
            { type: SpecialEffectType.REVIVE, value: 50 }
        ],
        setId: 'demon_lord',
        description: '魔王的王冠，擁有復活的力量。',
        dropFrom: ['demon_lord_asariel']
    },

    // ==================== 無盡塔特殊掉落 ====================
    void_blade: {
        id: 'void_blade',
        name: '虛空之刃',
        icon: '🌑',
        type: EquipmentType.WEAPON,
        rarity: Rarity.LEGENDARY,
        level: 30,
        stats: {
            attack: 80,
            defense: 10,
            critChance: 0.25,
            critDamage: 3.0,
            weaponSpeed: 1.2,
            attackSpeed: 1.3
        },
        specialEffects: [
            { type: SpecialEffectType.SHADOW_DAMAGE, value: 35 },
            { type: SpecialEffectType.ARMOR_PIERCE, value: 30 },
            { type: SpecialEffectType.DOUBLE_STRIKE, value: 20 },
            { type: SpecialEffectType.LIFE_STEAL, value: 15 }
        ],
        setId: 'void_king',
        description: '虛空之王的武器，能撕裂現實。',
        dropFrom: ['tower_void_king']
    },

    void_crown: {
        id: 'void_crown',
        name: '虛空之冠',
        icon: '👑',
        type: EquipmentType.HELMET,
        rarity: Rarity.LEGENDARY,
        level: 30,
        stats: {
            attack: 20,
            defense: 35,
            critChance: 0.18,
            critDamage: 2.2
        },
        specialEffects: [
            { type: SpecialEffectType.SHADOW_DAMAGE, value: 25 },
            { type: SpecialEffectType.DAMAGE_REDUCE, value: 15 },
            { type: SpecialEffectType.REVIVE, value: 30 }
        ],
        setId: 'void_king',
        description: '虛空之王的王冠。',
        dropFrom: ['tower_void_king']
    },

    abyss_armor: {
        id: 'abyss_armor',
        name: '深淵鎧甲',
        icon: '🖤',
        type: EquipmentType.ARMOR,
        rarity: Rarity.EPIC,
        level: 20,
        stats: {
            attack: 12,
            defense: 40,
            critChance: 0.12,
            critDamage: 1.7
        },
        specialEffects: [
            { type: SpecialEffectType.SHADOW_DAMAGE, value: 18 },
            { type: SpecialEffectType.DAMAGE_REDUCE, value: 12 },
            { type: SpecialEffectType.HP_REGEN, value: 6 }
        ],
        setId: null,
        description: '深淵魔將的鎧甲。',
        dropFrom: ['tower_abyss_general']
    },

    hell_knight_lance: {
        id: 'hell_knight_lance',
        name: '地獄騎士之槍',
        icon: '🔥',
        type: EquipmentType.WEAPON,
        rarity: Rarity.EPIC,
        level: 15,
        stats: {
            attack: 35,
            defense: 5,
            critChance: 0.15,
            critDamage: 2.0,
            weaponSpeed: 1.0,
            attackSpeed: 1.2
        },
        specialEffects: [
            { type: SpecialEffectType.FIRE_DAMAGE, value: 25 },
            { type: SpecialEffectType.ARMOR_PIERCE, value: 15 }
        ],
        setId: null,
        description: '地獄騎士的長槍，燃燒著地獄之火。',
        dropFrom: ['tower_hell_knight']
    }
};

/**
 * 套裝資料庫
 */
export const SetDatabase = {
    wolf_hunter: {
        id: 'wolf_hunter',
        name: '狼獵套裝',
        icon: '🐺',
        pieces: ['wolf_fang_blade', 'wolf_pelt_armor'],
        bonuses: [
            {
                required: 2,
                name: '狼之本能',
                description: '攻擊速度 +10%，暴擊率 +5%',
                effects: {
                    attackSpeedBonus: 10,
                    critChanceBonus: 0.05
                }
            }
        ]
    },

    forest_guardian: {
        id: 'forest_guardian',
        name: '森林守護者套裝',
        icon: '🌲',
        pieces: ['forest_guardian_staff', 'forest_guardian_crown'],
        bonuses: [
            {
                required: 2,
                name: '自然之力',
                description: '生命回復 +10/回合，受到的傷害 -10%',
                effects: {
                    hpRegenBonus: 10,
                    damageReduceBonus: 10
                }
            }
        ]
    },

    undead_slayer: {
        id: 'undead_slayer',
        name: '亡靈獵人套裝',
        icon: '💀',
        pieces: ['bone_sword', 'ghost_cloak'],
        bonuses: [
            {
                required: 2,
                name: '亡靈剋星',
                description: '對亡靈類敵人傷害 +30%',
                effects: {
                    undeadDamageBonus: 30
                }
            }
        ]
    },

    shadow_legion: {
        id: 'shadow_legion',
        name: '暗影軍團套裝',
        icon: '⚫',
        pieces: ['shadow_blade_drop', 'shadow_armor_drop', 'shadow_boots', 'shadow_commander_blade'],
        bonuses: [
            {
                required: 2,
                name: '暗影之力',
                description: '暗影傷害 +15',
                effects: {
                    shadowDamageBonus: 15
                }
            },
            {
                required: 3,
                name: '暗影護體',
                description: '受到的傷害 -12%',
                effects: {
                    damageReduceBonus: 12
                }
            },
            {
                required: 4,
                name: '暗影支配',
                description: '攻擊時 15% 機率使敵人陷入恐懼',
                effects: {
                    fearChance: 15
                }
            }
        ]
    },

    ancient_relic: {
        id: 'ancient_relic',
        name: '遠古遺物套裝',
        icon: '🏛️',
        pieces: ['ancient_sword', 'crystal_shield', 'rune_gauntlet'],
        bonuses: [
            {
                required: 2,
                name: '遠古智慧',
                description: '經驗獲取 +20%',
                effects: {
                    expBonus: 20
                }
            },
            {
                required: 3,
                name: '遠古力量',
                description: '全屬性 +10%',
                effects: {
                    allStatsBonus: 10
                }
            }
        ]
    },

    titan: {
        id: 'titan',
        name: '泰坦套裝',
        icon: '🗽',
        pieces: ['titan_hammer'],
        bonuses: [
            {
                required: 1,
                name: '泰坦之力',
                description: '攻擊力 +20%，但攻擊速度 -10%',
                effects: {
                    attackBonus: 20,
                    attackSpeedPenalty: 10
                }
            }
        ]
    },

    elemental_master: {
        id: 'elemental_master',
        name: '元素大師套裝',
        icon: '🌈',
        pieces: ['flame_sword', 'frost_blade', 'thunder_axe', 'elemental_crown'],
        bonuses: [
            {
                required: 2,
                name: '雙元素',
                description: '元素傷害 +15%',
                effects: {
                    elementalDamageBonus: 15
                }
            },
            {
                required: 3,
                name: '三元素',
                description: '元素傷害 +25%，元素抗性 +15%',
                effects: {
                    elementalDamageBonus: 25,
                    elementalResistBonus: 15
                }
            },
            {
                required: 4,
                name: '元素支配',
                description: '元素傷害 +40%，攻擊時隨機觸發元素爆發',
                effects: {
                    elementalDamageBonus: 40,
                    elementalBurst: true
                }
            }
        ]
    },

    dragon_slayer: {
        id: 'dragon_slayer',
        name: '屠龍者套裝',
        icon: '🐲',
        pieces: ['wyvern_lance', 'drake_scale_mail', 'dragon_knight_helm', 'elder_dragon_fang'],
        bonuses: [
            {
                required: 2,
                name: '龍之獵人',
                description: '對龍類敵人傷害 +25%',
                effects: {
                    dragonDamageBonus: 25
                }
            },
            {
                required: 3,
                name: '龍之剋星',
                description: '對龍類敵人傷害 +40%，火焰抗性 +20%',
                effects: {
                    dragonDamageBonus: 40,
                    fireResistBonus: 20
                }
            },
            {
                required: 4,
                name: '屠龍傳說',
                description: '對龍類敵人傷害 +60%，獲得龍之力量',
                effects: {
                    dragonDamageBonus: 60,
                    dragonPower: true
                }
            }
        ]
    },

    demon_lord: {
        id: 'demon_lord',
        name: '魔王套裝',
        icon: '👑',
        pieces: ['demon_blade', 'demon_general_armor', 'demon_lord_sword', 'demon_lord_crown'],
        bonuses: [
            {
                required: 2,
                name: '魔族之力',
                description: '攻擊力 +15%，生命偷取 +5%',
                effects: {
                    attackBonus: 15,
                    lifeStealBonus: 5
                }
            },
            {
                required: 3,
                name: '魔族支配',
                description: '攻擊力 +25%，暴擊傷害 +30%',
                effects: {
                    attackBonus: 25,
                    critDamageBonus: 30
                }
            },
            {
                required: 4,
                name: '魔王降臨',
                description: '全屬性 +30%，死亡時 100% 復活一次',
                effects: {
                    allStatsBonus: 30,
                    guaranteedRevive: true
                }
            }
        ]
    },

    void_king: {
        id: 'void_king',
        name: '虛空之王套裝',
        icon: '🌑',
        pieces: ['void_blade', 'void_crown'],
        bonuses: [
            {
                required: 2,
                name: '虛空支配',
                description: '暗影傷害 +50%，無視 20% 敵人防禦，15% 機率使敵人陷入虛空',
                effects: {
                    shadowDamageBonus: 50,
                    armorPierceBonus: 20,
                    voidChance: 15
                }
            }
        ]
    }
};

/**
 * 獲取裝備
 */
export function getEquipment(equipmentId) {
    return EquipmentDatabase[equipmentId] || null;
}

/**
 * 獲取套裝
 */
export function getSet(setId) {
    return SetDatabase[setId] || null;
}

/**
 * 計算當前激活的套裝效果
 */
export function calculateSetBonuses(equippedItems) {
    const setBonuses = [];
    const setPieceCounts = {};

    // 計算每個套裝裝備的數量
    for (const item of equippedItems) {
        if (item && item.setId) {
            setPieceCounts[item.setId] = (setPieceCounts[item.setId] || 0) + 1;
        }
    }

    // 檢查每個套裝的獎勵
    for (const [setId, count] of Object.entries(setPieceCounts)) {
        const set = getSet(setId);
        if (!set) continue;

        for (const bonus of set.bonuses) {
            if (count >= bonus.required) {
                setBonuses.push({
                    setId: setId,
                    setName: set.name,
                    bonusName: bonus.name,
                    description: bonus.description,
                    effects: bonus.effects,
                    piecesEquipped: count,
                    piecesRequired: bonus.required
                });
            }
        }
    }

    return setBonuses;
}

/**
 * 獲取裝備的完整特效描述
 */
export function getEquipmentEffectDescription(equipment) {
    if (!equipment.specialEffects || equipment.specialEffects.length === 0) {
        return '無特殊效果';
    }

    return equipment.specialEffects
        .map(effect => {
            const descFn = SpecialEffectDescriptions[effect.type];
            return descFn ? descFn(effect.value) : `${effect.type}: ${effect.value}`;
        })
        .join('\n');
}

/**
 * 根據稀有度獲取裝備列表
 */
export function getEquipmentByRarity(rarity) {
    return Object.values(EquipmentDatabase).filter(e => e.rarity === rarity);
}

/**
 * 根據類型獲取裝備列表
 */
export function getEquipmentByType(type) {
    return Object.values(EquipmentDatabase).filter(e => e.type === type);
}

/**
 * 獲取怪物可能掉落的裝備
 */
export function getEquipmentDropsForMonster(monsterId) {
    return Object.values(EquipmentDatabase).filter(
        e => e.dropFrom && e.dropFrom.includes(monsterId)
    );
}
