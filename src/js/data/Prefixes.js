/**
 * Prefixes.js
 * 前綴資料庫（已從 AffixManager.js 拆出，放入 data 目錄）
 */

import { AffixStat,ItemRarity } from '../models/Enums.js';

/**
 * 前綴資料庫
 * 主要影響基礎屬性
 */
export const PrefixDatabase = {
    // ===== 普通前綴 (Common) =====
    sharp: {
        id: 'sharp',
        name: '鋒利的',
        rarity: ItemRarity.COMMON,
        type: 'prefix',
        stats: { [AffixStat.ATK]: 1 },
        description: '攻擊力 +{atk}',
        applicableTo: ['weapon']
    },
    sturdy: {
        id: 'sturdy',
        name: '堅固的',
        rarity: ItemRarity.COMMON,
        type: 'prefix',
        stats: { [AffixStat.DEF]: 1 },
        description: '防禦力 +{def}',
        applicableTo: ['armor', 'accessory']
    },
    of_vitality: {
        id: 'of_vitality',
        name: '活力的',
        rarity: ItemRarity.COMMON,
        type: 'prefix',
        stats: { [AffixStat.HP]: [5, 15] },
        description: '生命 +{hp}',
        applicableTo: ['armor', 'accessory']
    },
    
    // ===== 優秀前綴 (Uncommon) =====
    keen: {
        id: 'keen',
        name: '銳利的',
        rarity: ItemRarity.UNCOMMON,
        type: 'prefix',
        stats: { [AffixStat.ATK]: [2, 4], [AffixStat.CRIT_CHANCE]: [5, 7] },
        description: '攻擊力 +{atk}，暴擊率 +{critChance}%',
        applicableTo: ['weapon']
    },
    reinforced: {
        id: 'reinforced',
        name: '強化的',
        rarity: ItemRarity.UNCOMMON,
        type: 'prefix',
        stats: { [AffixStat.DEF]: [2, 4], [AffixStat.HP]: [10, 20] },
        description: '防禦力 +{def}，生命 +{hp}',
        applicableTo: ['armor']
    },
    swift: {
        id: 'swift',
        name: '迅捷的',
        rarity: ItemRarity.UNCOMMON,
        type: 'prefix',
        stats: { [AffixStat.ATTACK_SPEED]: [5, 10] },
        description: '攻擊速度 +{attackSpeed}%',
        applicableTo: ['weapon', 'accessory']
    },
    
    // ===== 稀有前綴 (Rare) =====
    vicious: {
        id: 'vicious',
        name: '兇猛的',
        rarity: ItemRarity.RARE,
        type: 'prefix',
        stats: { [AffixStat.ATK]: [3, 6], [AffixStat.CRIT_DAMAGE]: [5, 10] },
        description: '攻擊力 +{atk}，暴擊傷害 +{critDamage}%',
        applicableTo: ['weapon']
    },
    guardian: {
        id: 'guardian',
        name: '守護的',
        rarity: ItemRarity.RARE,
        type: 'prefix',
        stats: { [AffixStat.DEF]: [3, 6], [AffixStat.HP]: [30, 40] },
        description: '防禦力 +{def}，生命 +{hp}',
        applicableTo: ['armor', 'accessory']
    },
    vampiric: {
        id: 'vampiric',
        name: '嗜血的',
        rarity: ItemRarity.RARE,
        type: 'prefix',
        stats: { [AffixStat.LIFE_STEAL]: [3, 6] },
        description: '生命偷取 +{lifesteal}%',
        applicableTo: ['weapon']
    },
    
    // ===== 史詩前綴 (Epic) =====
    brutal: {
        id: 'brutal',
        name: '殘暴的',
        rarity: ItemRarity.EPIC,
        type: 'prefix',
        stats: { [AffixStat.ATK]: [4, 8], [AffixStat.CRIT_CHANCE]: [5, 10], [AffixStat.CRIT_DAMAGE]: [10, 15] },
        description: '攻擊力 +{atk}，暴擊率 +{critChance}%，暴擊傷害 +{critDamage}%',
        applicableTo: ['weapon']
    },
    impenetrable: {
        id: 'impenetrable',
        name: '堅不可摧的',
        rarity: ItemRarity.EPIC,
        type: 'prefix',
        stats: { [AffixStat.DEF]: [4, 8], [AffixStat.HP]: [40, 60], [AffixStat.DAMAGE_REDUCTION]: [5, 10] },
        description: '防禦力 +{def}，生命 +{hp}，傷害減免 +{damageReduction}%',
        applicableTo: ['armor']
    },
    sanguine: {
        id: 'sanguine',
        name: '鮮血的',
        rarity: ItemRarity.EPIC,
        type: 'prefix',
        stats: { [AffixStat.LIFE_STEAL]: [6, 10], [AffixStat.ATK]: [5, 10] },
        description: '生命偷取 +{lifesteal}%，攻擊力 +{atk}',
        applicableTo: ['weapon']
    },
    
    // ===== 傳說前綴 (Legendary) =====
    godslayer: {
        id: 'godslayer',
        name: '弒神的',
        rarity: ItemRarity.LEGENDARY,
        type: 'prefix',
        stats: { [AffixStat.ATK]: [6, 10], [AffixStat.CRIT_CHANCE]: [10, 15], [AffixStat.CRIT_DAMAGE]: [20, 30], [AffixStat.BOSS_BONUS]: 10 },
        description: '攻擊力 +{atk}，暴擊率 +{critChance}%，暴擊傷害 +{critDamage}%，對BOSS傷害 +{bossBonus}%',
        applicableTo: ['weapon']
    },
    immortal: {
        id: 'immortal',
        name: '不朽的',
        rarity: ItemRarity.LEGENDARY,
        type: 'prefix',
        stats: { [AffixStat.DEF]: [6, 10], [AffixStat.HP]: [60, 100], [AffixStat.LIFE_STEAL]: 10, [AffixStat.DAMAGE_REDUCTION]: 10 },
        description: '防禦力 +{def}，生命 +{hp}，生命偷取 +{lifesteal}%，傷害減免 +{damageReduction}%',
        applicableTo: ['armor']
    },
    primordial: {
        id: 'primordial',
        name: '原始的',
        rarity: ItemRarity.LEGENDARY,
        type: 'prefix',
        stats: { [AffixStat.ATK]: [6, 10], [AffixStat.DEF]: [6, 10], [AffixStat.HP]: [50, 100], [AffixStat.ALL_STATS]: 20 },
        description: '攻擊力 +{atk}，防禦力 +{def}，生命 +{hp}，全屬性 +{allStats}%',
        applicableTo: ['weapon', 'armor', 'accessory']
    }
};

/**
 * 後綴資料庫
 * 主要影響特殊效果/元素相關屬性
 */
export const SuffixDatabase = {
    // ===== 普通後綴 (Common) =====
    light: {
        id: 'light',
        name: '輕盈',
        rarity: ItemRarity.COMMON,
        type: 'suffix',
        stats: { [AffixStat.ATTACK_SPEED]: [3, 6] },
        description: '攻擊速度 +{attackSpeed}%',
        applicableTo: ['weapon']
    },
    violent: {
        id: 'violent',
        name: '暴力',
        rarity: ItemRarity.COMMON,
        type: 'suffix',
        stats: { [AffixStat.CRIT_CHANCE]: [3, 6] },
        description: '暴擊率 +{critChance}%',
        applicableTo: ['weapon']
    },
    break: {
        id: 'break',
        name: '破甲',
        rarity: ItemRarity.COMMON,
        type: 'suffix',
        stats: { [AffixStat.ARMOR_PENETRATION]: [3, 6] },
        description: '穿甲 +{armorPenetration}%',
        applicableTo: ['weapon']
    },
    
    // ===== 優秀後綴 (Uncommon) =====
    of_ice: {
        id: 'of_ice',
        name: '殘破',
        rarity: ItemRarity.UNCOMMON,
        type: 'suffix',
        stats: { [AffixStat.SLOW_CHANCE]: [8, 16], [AffixStat.HP]: [10, 30] },
        description: '有機率減速敵人 +{slowChance}%，並提供生命 +{hp}',
        applicableTo: ['weapon']
    },
    of_thunder: {
        id: 'of_thunder',
        name: '震源',
        rarity: ItemRarity.UNCOMMON,
        type: 'suffix',
        stats: { [AffixStat.ARMOR_PENETRATION]: [12, 25], [AffixStat.STUN_CHANCE]: [10, 20] },
        description: '提高穿甲 +{armorPenetration}%，並顯著提升暈眩機率 +{stunChance}%',
        applicableTo: ['weapon']
    },
    of_fortitude: {
        id: 'of_fortitude',
        name: '堅毅',
        rarity: ItemRarity.UNCOMMON,
        type: 'suffix',
        stats: { [AffixStat.HP]: [10, 20], [AffixStat.DEF]: [2, 4] },
        description: '生命 +{hp}，防禦力 +{def}',
        applicableTo: ['armor', 'accessory']
    },
    
    // ===== 稀有後綴 (Rare) =====
    of_fury: {
        id: 'of_fury',
        name: '狂怒',
        rarity: ItemRarity.RARE,
        type: 'suffix',
        stats: { [AffixStat.CRIT_CHANCE]: [5, 8], [AffixStat.ATTACK_SPEED]: [5, 10] },
        description: '暴擊率 +{critChance}%，攻擊速度 +{attackSpeed}%',
        applicableTo: ['weapon', 'accessory']
    },
    of_the_titan: {
        id: 'of_the_titan',
        name: '泰坦',
        rarity: ItemRarity.RARE,
        type: 'suffix',
        stats: { hp: [20, 40], def: [3, 6] },
        description: '生命 +{hp}，防禦力 +{def}',
        applicableTo: ['armor']
    },
    of_precision: {
        id: 'of_precision',
        name: '精準',
        rarity: ItemRarity.RARE,
        type: 'suffix',
        stats: { [AffixStat.CRIT_CHANCE]: [5, 10], [AffixStat.CRIT_DAMAGE]: [5, 10] },
        description: '暴擊率 +{critChance}%，暴擊傷害 +{critDamage}%',
        applicableTo: ['weapon', 'accessory']
    },
    
    // ===== 史詩後綴 (Epic) =====
    of_annihilation: {
        id: 'of_annihilation',
        name: '毀滅',
        rarity: ItemRarity.EPIC,
        type: 'suffix',
        stats: { [AffixStat.CRIT_DAMAGE]: [10, 20], [AffixStat.ATK]: [4, 8] },
        description: '暴擊傷害 +{critDamage}%，攻擊力 +{atk}',
        applicableTo: ['weapon']
    },
    of_the_dragon: {
        id: 'of_the_dragon',
        name: '龍威',
        rarity: ItemRarity.EPIC,
        type: 'suffix',
        stats: { [AffixStat.ATK]: [4, 8], [AffixStat.HP]: [40, 60], [AffixStat.DEF]: [10, 18] },
        description: '攻擊力 +{atk}，生命 +{hp}，防禦力 +{def}',
        applicableTo: ['weapon', 'armor']
    },
    of_shadows: {
        id: 'of_shadows',
        name: '暗影',
        rarity: ItemRarity.EPIC,
        type: 'suffix',
        stats: { [AffixStat.CRIT_CHANCE]: [8, 12], [AffixStat.DODGE_CHANCE]: [3, 6] },
        description: '暴擊率 +{critChance}%，閃避率 +{dodgeChance}%',
        applicableTo: ['weapon', 'accessory']
    },
    of_restoration: {
        id: 'of_restoration',
        name: '生機',
        rarity: ItemRarity.EPIC,
        type: 'suffix',
        stats: { [AffixStat.LIFE_STEAL]: [5, 10], [AffixStat.HP]: 40 },
        description: '吸血 +{lifesteal}%，生命 +{hp}',
        applicableTo: ['armor', 'accessory']
    },
    
    // ===== 傳說後綴 (Legendary) =====
    of_the_void: {
        id: 'of_the_void',
        name: '虛空',
        rarity: ItemRarity.LEGENDARY,
        type: 'suffix',
        stats: { [AffixStat.ATK]: [6, 10], [AffixStat.ARMOR_PENETRATION]: 20, [AffixStat.CRIT_CHANCE]: [10, 20] },
        description: '攻擊力 +{atk}，穿甲 +{armorPenetration}%，暴擊率 +{critChance}%',
        applicableTo: ['weapon']
    },
    of_eternity: {
        id: 'of_eternity',
        name: '永恆',
        rarity: ItemRarity.LEGENDARY,
        type: 'suffix',
        stats: { [AffixStat.HP]: [80, 120], [AffixStat.DEF]: [10, 15], [AffixStat.DAMAGE_REDUCTION]: [5, 10] },
        description: '生命 +{hp}，防禦力 +{def}，傷害減免 +{damageReduction}%',
        applicableTo: ['armor']
    },
    of_omnipotence: {
        id: 'of_omnipotence',
        name: '全能',
        rarity: ItemRarity.LEGENDARY,
        type: 'suffix',
        stats: { [AffixStat.ATK]: [6, 10], [AffixStat.DEF]: [6, 10], [AffixStat.HP]: [40, 60], [AffixStat.CRIT_CHANCE]: [10, 20], [AffixStat.ALL_STATS]: [10, 20] },
        description: '攻擊力 +{atk}，防禦力 +{def}，生命 +{hp}，暴擊率 +{critChance}%，全屬性 +{allStats}%',
        applicableTo: ['weapon', 'armor', 'accessory']
    },
    // 完美無瑕 - 不會消耗耐久度
    indestructible: {
        id: 'indestructible',
        name: '不朽',
        rarity: ItemRarity.LEGENDARY,
        type: 'suffix',
        stats: { [AffixStat.ATK]: 7, [AffixStat.DEF]: 7, [AffixStat.CRIT_CHANCE]: 7, [AffixStat.CRIT_DAMAGE]: 7, [AffixStat.HP]: 40, [AffixStat.ALL_STATS]: 7, noDurabilityLoss: [1, 1] },
        description: '【完美無瑕】不會消耗耐久度，攻擊力 +{atk}，防禦力 +{def}，生命 +{hp}，暴擊率 +{critChance}%，暴擊傷害 +{critDamage}%，全屬性 +{allStats}%',
        applicableTo: ['weapon', 'armor']
    }
};