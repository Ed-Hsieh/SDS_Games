/**
 * BossEquipment.js
 * BOSS 掉落裝備資料庫 - 無盡塔與主線BOSS專屬裝備
 * 所有裝備都可強化
 */

import { AffixStat, ItemType, ItemRarity, WeaponForm } from '../models/Enums.js';

/**
 * 無盡塔 BOSS 裝備
 */
export const TowerBossEquipment = {
    // ===== 第5層 BOSS - 哥布林首領 =====
    goblin_dagger: {
        id: 'boss_goblin_dagger',
        name: '哥布林頭目匕首',
        icon: '🗡️',
        type: ItemType.WEAPON,
        weaponForm: WeaponForm.DAGGER,
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
        requiredLevel: 8,
        dropSource: 'tower_goblin_chief'
    },
    
    // ===== 第10層 BOSS - 地獄騎士 =====
    hell_knight_armor: {
        id: 'hell_knight_armor',
        name: '獄火騎甲',
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
        requiredLevel: 20,
        dropSource: 'tower_hell_knight'
    },
    
    // ===== 第15層 BOSS - 深淵魔將 =====
    abyss_blade: {
        id: 'abyss_blade',
        name: '沉淵刃',
        icon: '⚔️',
        type: ItemType.WEAPON,
        weaponForm: WeaponForm.SWORD,
        rarity: ItemRarity.EPIC,
        attack: 35,
        defense: 0,
        critChance: 0.15,
        critDamage: 2.0,
        weaponSpeed: 1.2,
        attackSpeed: 1.3,
        specialEffects: [
            { type: AffixStat.LIFE_STEAL, value: 5 }
        ],
        price: 1500,
        description: '深淵魔將的佩劍，帶有吸取生命的詛咒。',
        setId: 'abyss_set',
        canEnhance: true,
        requiredLevel: 33,
        dropSource: 'tower_abyss_general'
    },
    
    // ===== 第20層 BOSS - 虛空之王 =====
    void_crown: {
        id: 'boss_void_crown',
        name: '無光餘冠',
        icon: '👑',
        type: ItemType.ACCESSORY,
        rarity: ItemRarity.LEGENDARY,
        attack: 20,
        defense: 20,
        critChance: 0.12,
        critDamage: 1.8,
        hp: 130,
        specialEffects: [
            { type: AffixStat.ALL_STATS, value: 0.08 }
        ],
        price: 5000,
        description: '虛空之王的王冠，蘊含扭曲現實的力量。',
        setId: 'void_set',
        canEnhance: true,
        requiredLevel: 58,
        dropSource: 'tower_void_king'
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
