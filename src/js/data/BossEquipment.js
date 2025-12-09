/**
 * BossEquipment.js
 * BOSS 掉落裝備資料庫 - 無盡塔與主線BOSS專屬裝備
 * 所有裝備都可強化、鑲嵌寶石
 */

import { ItemType, ItemRarity } from '../models/DataModel.js';

/**
 * 無盡塔 BOSS 裝備
 */
export const TowerBossEquipment = {
    // ===== 第5層 BOSS - 哥布林首領 =====
    goblin_dagger: {
        id: 'goblin_dagger',
        name: '哥布林首領匕首',
        icon: '🗡️',
        type: ItemType.WEAPON,
        rarity: ItemRarity.UNCOMMON,
        attack: 15,
        defense: 0,
        critChance: 0.12,
        critDamage: 1.8,
        weaponSpeed: 1.3,
        attackSpeed: 1.4,
        price: 300,
        description: '哥布林首領的匕首，輕巧且攻擊迅速。',
        setId: null,
        canEnhance: true,
        gemSlots: 1,
        requiredLevel: 5,
        dropSource: 'tower_goblin_chief'
    },
    
    // ===== 第10層 BOSS - 地獄騎士 =====
    hell_knight_armor: {
        id: 'hell_knight_armor',
        name: '地獄騎士鎧甲',
        icon: '🛡️',
        type: ItemType.ARMOR,
        rarity: ItemRarity.RARE,
        attack: 5,
        defense: 25,
        critChance: 0.05,
        critDamage: 1.3,
        hp: 50,
        fireResist: 0.15,
        price: 800,
        description: '來自地獄的騎士鎧甲，散發著灼熱的氣息。',
        setId: 'hell_knight_set',
        canEnhance: true,
        gemSlots: 2,
        requiredLevel: 10,
        dropSource: 'tower_hell_knight'
    },
    
    // ===== 第15層 BOSS - 深淵魔將 =====
    abyss_blade: {
        id: 'abyss_blade',
        name: '深淵之刃',
        icon: '⚔️',
        type: ItemType.WEAPON,
        rarity: ItemRarity.EPIC,
        attack: 35,
        defense: 0,
        critChance: 0.15,
        critDamage: 2.0,
        weaponSpeed: 1.2,
        attackSpeed: 1.3,
        lifesteal: 0.05,
        price: 1500,
        description: '深淵魔將的佩劍，帶有吸取生命的詛咒。',
        setId: 'abyss_set',
        canEnhance: true,
        gemSlots: 2,
        requiredLevel: 15,
        dropSource: 'tower_abyss_general'
    },
    
    // ===== 第20層 BOSS - 虛空之王 =====
    void_crown: {
        id: 'void_crown',
        name: '虛空王冠',
        icon: '👑',
        type: ItemType.ACCESSORY,
        rarity: ItemRarity.LEGENDARY,
        attack: 20,
        defense: 20,
        critChance: 0.12,
        critDamage: 1.8,
        hp: 80,
        mp: 50,
        allStatsBonus: 0.08,
        price: 5000,
        description: '虛空之王的王冠，蘊含扭曲現實的力量。',
        setId: 'void_set',
        canEnhance: true,
        gemSlots: 3,
        requiredLevel: 25,
        dropSource: 'tower_void_king'
    }
};

/**
 * 主線 BOSS 裝備
 */
export const MainQuestBossEquipment = {
    // ===== 第2章 BOSS - 森林守衛者 =====
    guardian_staff: {
        id: 'guardian_staff',
        name: '守護者之杖',
        icon: '🪄',
        type: ItemType.WEAPON,
        rarity: ItemRarity.UNCOMMON,
        attack: 12,
        defense: 5,
        critChance: 0.08,
        critDamage: 1.6,
        weaponSpeed: 0.9,
        attackSpeed: 0.9,
        mp: 30,
        price: 250,
        description: '森林守護者留下的法杖，充滿自然之力。',
        setId: 'nature_set',
        canEnhance: true,
        gemSlots: 1,
        requiredLevel: 5,
        dropSource: 'forest_guardian'
    },
    
    // ===== 第3章 BOSS - 巫妖 =====
    lich_staff: {
        id: 'lich_staff',
        name: '巫妖法杖',
        icon: '☠️',
        type: ItemType.WEAPON,
        rarity: ItemRarity.RARE,
        attack: 22,
        defense: 0,
        critChance: 0.12,
        critDamage: 1.8,
        weaponSpeed: 0.8,
        attackSpeed: 0.85,
        mp: 50,
        darkDamage: 10,
        price: 600,
        description: '巫妖的法杖，充滿死亡的氣息。',
        setId: 'undead_set',
        canEnhance: true,
        gemSlots: 2,
        requiredLevel: 8,
        dropSource: 'lich'
    },
    
    // ===== 第4章 BOSS - 暗影指揮官 =====
    shadow_commander_sword: {
        id: 'shadow_commander_sword',
        name: '暗影指揮官之劍',
        icon: '⚔️',
        type: ItemType.WEAPON,
        rarity: ItemRarity.RARE,
        attack: 28,
        defense: 5,
        critChance: 0.14,
        critDamage: 1.9,
        weaponSpeed: 1.1,
        attackSpeed: 1.15,
        price: 900,
        description: '暗影指揮官的配劍，鋒利無比。',
        setId: 'shadow_commander_set',
        canEnhance: true,
        gemSlots: 2,
        requiredLevel: 12,
        dropSource: 'shadow_commander'
    },
    
    // ===== 第5章 BOSS - 遠古泰坦 =====
    titan_gauntlet: {
        id: 'titan_gauntlet',
        name: '泰坦護手',
        icon: '🧤',
        type: ItemType.ACCESSORY,
        rarity: ItemRarity.EPIC,
        attack: 18,
        defense: 22,
        critChance: 0.08,
        critDamage: 1.6,
        hp: 80,
        price: 1200,
        description: '遠古泰坦的護手，蘊含遠古之力。',
        setId: 'titan_set',
        canEnhance: true,
        gemSlots: 2,
        requiredLevel: 16,
        dropSource: 'ancient_titan'
    },
    
    // ===== 第6章 BOSS - 元素之主 =====
    elemental_orb: {
        id: 'elemental_orb',
        name: '元素寶珠',
        icon: '🔮',
        type: ItemType.ACCESSORY,
        rarity: ItemRarity.EPIC,
        attack: 15,
        defense: 15,
        critChance: 0.10,
        critDamage: 1.7,
        mp: 80,
        fireDamage: 8,
        iceDamage: 8,
        thunderDamage: 8,
        price: 1800,
        description: '融合四大元素之力的神秘寶珠。',
        setId: 'elemental_set',
        canEnhance: true,
        gemSlots: 2,
        requiredLevel: 20,
        dropSource: 'elemental_lord'
    },
    
    // ===== 第7章 BOSS - 古龍 =====
    elder_dragon_fang: {
        id: 'elder_dragon_fang',
        name: '古龍牙劍',
        icon: '🐲',
        type: ItemType.WEAPON,
        rarity: ItemRarity.EPIC,
        attack: 45,
        defense: 0,
        critChance: 0.18,
        critDamage: 2.2,
        weaponSpeed: 1.0,
        attackSpeed: 1.1,
        fireDamage: 15,
        price: 2500,
        description: '由古龍牙齒鍛造的神劍，燃燒著龍焰。',
        setId: 'dragon_set',
        canEnhance: true,
        gemSlots: 3,
        requiredLevel: 24,
        dropSource: 'elder_dragon'
    },
    
    // ===== 第8章 BOSS - 暗影霸主 =====
    overlord_armor: {
        id: 'overlord_armor',
        name: '霸主戰甲',
        icon: '🛡️',
        type: ItemType.ARMOR,
        rarity: ItemRarity.EPIC,
        attack: 10,
        defense: 45,
        critChance: 0.08,
        critDamage: 1.5,
        hp: 120,
        damageReduction: 0.08,
        price: 3000,
        description: '暗影霸主的戰甲，堅不可摧。',
        setId: 'overlord_set',
        canEnhance: true,
        gemSlots: 3,
        requiredLevel: 26,
        dropSource: 'shadow_overlord'
    },
    
    // ===== 第9章 BOSS - 魔王阿薩謝爾 =====
    demon_lord_sword: {
        id: 'demon_lord_sword',
        name: '魔王之劍',
        icon: '👑',
        type: ItemType.WEAPON,
        rarity: ItemRarity.LEGENDARY,
        attack: 65,
        defense: 10,
        critChance: 0.22,
        critDamage: 2.5,
        weaponSpeed: 1.2,
        attackSpeed: 1.3,
        lifesteal: 0.08,
        darkDamage: 25,
        bossBonus: 0.15,
        price: 8000,
        description: '魔王阿薩謝爾的配劍，擁有毀滅世界的力量。',
        setId: 'demon_lord_set',
        canEnhance: true,
        gemSlots: 3,
        requiredLevel: 28,
        dropSource: 'demon_lord_asariel'
    },
    
    demon_lord_armor: {
        id: 'demon_lord_armor',
        name: '魔王戰甲',
        icon: '😈',
        type: ItemType.ARMOR,
        rarity: ItemRarity.LEGENDARY,
        attack: 15,
        defense: 60,
        critChance: 0.10,
        critDamage: 1.6,
        hp: 200,
        damageReduction: 0.12,
        darkResist: 0.25,
        price: 8000,
        description: '魔王阿薩謝爾的戰甲，散發著邪惡的氣息。',
        setId: 'demon_lord_set',
        canEnhance: true,
        gemSlots: 3,
        requiredLevel: 28,
        dropSource: 'demon_lord_asariel'
    }
};

/**
 * 套裝效果
 */
export const EquipmentSets = {
    hell_knight_set: {
        id: 'hell_knight_set',
        name: '地獄騎士套裝',
        pieces: ['hell_knight_armor', 'hell_knight_sword', 'hell_knight_helm'],
        bonuses: {
            2: { fireDamage: 10, fireResist: 0.10, description: '火焰傷害+10, 火焰抗性+10%' },
            3: { fireDamage: 25, fireResist: 0.20, hp: 100, description: '火焰傷害+25, 火焰抗性+20%, HP+100' }
        }
    },
    
    abyss_set: {
        id: 'abyss_set',
        name: '深淵套裝',
        pieces: ['abyss_blade', 'abyss_armor', 'abyss_ring'],
        bonuses: {
            2: { lifesteal: 0.05, atk: 15, description: '生命偷取+5%, 攻擊力+15' },
            3: { lifesteal: 0.12, atk: 35, critDamage: 0.3, description: '生命偷取+12%, 攻擊力+35, 暴擊傷害+30%' }
        }
    },
    
    void_set: {
        id: 'void_set',
        name: '虛空套裝',
        pieces: ['void_crown', 'void_robe', 'void_staff'],
        bonuses: {
            2: { mp: 50, critChance: 0.08, description: '魔力+50, 暴擊率+8%' },
            3: { mp: 120, critChance: 0.15, allStatsBonus: 0.10, description: '魔力+120, 暴擊率+15%, 全屬性+10%' }
        }
    },
    
    nature_set: {
        id: 'nature_set',
        name: '自然套裝',
        pieces: ['guardian_staff', 'nature_armor', 'nature_ring'],
        bonuses: {
            2: { hpRegen: 0.02, hp: 30, description: '每秒回血+2%, HP+30' },
            3: { hpRegen: 0.05, hp: 80, def: 15, description: '每秒回血+5%, HP+80, 防禦+15' }
        }
    },
    
    dragon_set: {
        id: 'dragon_set',
        name: '龍族套裝',
        pieces: ['elder_dragon_fang', 'dragon_scale_armor', 'dragon_ring'],
        bonuses: {
            2: { fireDamage: 15, atk: 20, description: '火焰傷害+15, 攻擊力+20' },
            3: { fireDamage: 35, atk: 50, critDamage: 0.35, description: '火焰傷害+35, 攻擊力+50, 暴擊傷害+35%' }
        }
    },
    
    demon_lord_set: {
        id: 'demon_lord_set',
        name: '魔王套裝',
        pieces: ['demon_lord_sword', 'demon_lord_armor', 'demon_lord_ring'],
        bonuses: {
            2: { darkDamage: 20, bossBonus: 0.10, description: '暗黑傷害+20, BOSS傷害+10%' },
            3: { darkDamage: 50, bossBonus: 0.25, lifesteal: 0.10, allStatsBonus: 0.08, 
                 description: '暗黑傷害+50, BOSS傷害+25%, 生命偷取+10%, 全屬性+8%' }
        }
    }
};

/**
 * 根據 BOSS ID 獲取掉落裝備
 */
export function getBossEquipment(bossId) {
    // 查找無盡塔裝備
    for (const equip of Object.values(TowerBossEquipment)) {
        if (equip.dropSource === bossId) {
            return equip;
        }
    }
    
    // 查找主線裝備
    for (const equip of Object.values(MainQuestBossEquipment)) {
        if (equip.dropSource === bossId) {
            return equip;
        }
    }
    
    return null;
}

/**
 * 根據裝備 ID 獲取裝備
 */
export function getEquipmentById(equipmentId) {
    return TowerBossEquipment[equipmentId] || MainQuestBossEquipment[equipmentId] || null;
}

/**
 * 獲取套裝效果
 */
export function getSetBonus(setId) {
    return EquipmentSets[setId] || null;
}

/**
 * 獲取所有 BOSS 裝備列表
 */
export function getAllBossEquipment() {
    return {
        tower: Object.values(TowerBossEquipment),
        mainQuest: Object.values(MainQuestBossEquipment)
    };
}
