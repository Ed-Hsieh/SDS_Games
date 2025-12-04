/**
 * AffixSystem.js
 * 裝備詞綴系統 - 前綴與後綴
 * 整合鍛造系統，裝備可獲得隨機詞綴
 */

import { ItemRarity } from '../models/DataModel.js';

// 詞綴類型
export const AffixType = {
    PREFIX: 'prefix',   // 前綴
    SUFFIX: 'suffix'    // 後綴
};

// 詞綴稀有度權重（用於隨機選擇）
const AFFIX_RARITY_WEIGHTS = {
    [ItemRarity.COMMON]: { common: 70, uncommon: 25, rare: 5, epic: 0, legendary: 0 },
    [ItemRarity.UNCOMMON]: { common: 50, uncommon: 35, rare: 12, epic: 3, legendary: 0 },
    [ItemRarity.RARE]: { common: 30, uncommon: 35, rare: 25, epic: 8, legendary: 2 },
    [ItemRarity.EPIC]: { common: 10, uncommon: 25, rare: 35, epic: 25, legendary: 5 },
    [ItemRarity.LEGENDARY]: { common: 0, uncommon: 10, rare: 30, epic: 40, legendary: 20 }
};

// 根據裝備稀有度決定詞綴數量
const AFFIX_COUNT_BY_RARITY = {
    [ItemRarity.COMMON]: { min: 0, max: 1 },
    [ItemRarity.UNCOMMON]: { min: 1, max: 2 },
    [ItemRarity.RARE]: { min: 1, max: 3 },
    [ItemRarity.EPIC]: { min: 2, max: 4 },
    [ItemRarity.LEGENDARY]: { min: 3, max: 5 }
};

/**
 * 前綴資料庫
 * 主要影響攻擊/傷害相關屬性
 */
export const PrefixDatabase = {
    // ===== 普通前綴 (Common) =====
    sharp: {
        id: 'sharp',
        name: '鋒利的',
        rarity: ItemRarity.COMMON,
        type: AffixType.PREFIX,
        stats: { atk: [2, 5] },
        description: '攻擊力 +{atk}',
        applicableTo: ['weapon']
    },
    sturdy: {
        id: 'sturdy',
        name: '堅固的',
        rarity: ItemRarity.COMMON,
        type: AffixType.PREFIX,
        stats: { def: [2, 4] },
        description: '防禦力 +{def}',
        applicableTo: ['armor', 'accessory']
    },
    light: {
        id: 'light',
        name: '輕盈的',
        rarity: ItemRarity.COMMON,
        type: AffixType.PREFIX,
        stats: { attackSpeed: [0.03, 0.06] },
        description: '攻擊速度 +{attackSpeed}%',
        applicableTo: ['weapon']
    },
    
    // ===== 優秀前綴 (Uncommon) =====
    keen: {
        id: 'keen',
        name: '銳利的',
        rarity: ItemRarity.UNCOMMON,
        type: AffixType.PREFIX,
        stats: { atk: [5, 10], critChance: [0.02, 0.04] },
        description: '攻擊力 +{atk}，暴擊率 +{critChance}%',
        applicableTo: ['weapon']
    },
    reinforced: {
        id: 'reinforced',
        name: '強化的',
        rarity: ItemRarity.UNCOMMON,
        type: AffixType.PREFIX,
        stats: { def: [5, 10], hp: [10, 20] },
        description: '防禦力 +{def}，生命 +{hp}',
        applicableTo: ['armor']
    },
    swift: {
        id: 'swift',
        name: '迅捷的',
        rarity: ItemRarity.UNCOMMON,
        type: AffixType.PREFIX,
        stats: { attackSpeed: [0.08, 0.12] },
        description: '攻擊速度 +{attackSpeed}%',
        applicableTo: ['weapon', 'accessory']
    },
    
    // ===== 稀有前綴 (Rare) =====
    vicious: {
        id: 'vicious',
        name: '兇猛的',
        rarity: ItemRarity.RARE,
        type: AffixType.PREFIX,
        stats: { atk: [10, 18], critDamage: [0.1, 0.2] },
        description: '攻擊力 +{atk}，暴擊傷害 +{critDamage}%',
        applicableTo: ['weapon']
    },
    guardian: {
        id: 'guardian',
        name: '守護的',
        rarity: ItemRarity.RARE,
        type: AffixType.PREFIX,
        stats: { def: [10, 18], hp: [30, 50] },
        description: '防禦力 +{def}，生命 +{hp}',
        applicableTo: ['armor', 'accessory']
    },
    vampiric: {
        id: 'vampiric',
        name: '嗜血的',
        rarity: ItemRarity.RARE,
        type: AffixType.PREFIX,
        stats: { lifesteal: [0.03, 0.06] },
        description: '生命偷取 +{lifesteal}%',
        applicableTo: ['weapon']
    },
    
    // ===== 史詩前綴 (Epic) =====
    brutal: {
        id: 'brutal',
        name: '殘暴的',
        rarity: ItemRarity.EPIC,
        type: AffixType.PREFIX,
        stats: { atk: [18, 30], critChance: [0.05, 0.10], critDamage: [0.15, 0.25] },
        description: '攻擊力 +{atk}，暴擊率 +{critChance}%，暴擊傷害 +{critDamage}%',
        applicableTo: ['weapon']
    },
    impenetrable: {
        id: 'impenetrable',
        name: '堅不可摧的',
        rarity: ItemRarity.EPIC,
        type: AffixType.PREFIX,
        stats: { def: [20, 35], hp: [60, 100], damageReduction: [0.03, 0.06] },
        description: '防禦力 +{def}，生命 +{hp}，傷害減免 +{damageReduction}%',
        applicableTo: ['armor']
    },
    sanguine: {
        id: 'sanguine',
        name: '鮮血的',
        rarity: ItemRarity.EPIC,
        type: AffixType.PREFIX,
        stats: { lifesteal: [0.06, 0.10], atk: [10, 15] },
        description: '生命偷取 +{lifesteal}%，攻擊力 +{atk}',
        applicableTo: ['weapon']
    },
    
    // ===== 傳說前綴 (Legendary) =====
    godslayer: {
        id: 'godslayer',
        name: '弒神的',
        rarity: ItemRarity.LEGENDARY,
        type: AffixType.PREFIX,
        stats: { atk: [30, 50], critChance: [0.10, 0.15], critDamage: [0.25, 0.40], bossBonus: [0.10, 0.20] },
        description: '攻擊力 +{atk}，暴擊率 +{critChance}%，暴擊傷害 +{critDamage}%，對BOSS傷害 +{bossBonus}%',
        applicableTo: ['weapon']
    },
    immortal: {
        id: 'immortal',
        name: '不朽的',
        rarity: ItemRarity.LEGENDARY,
        type: AffixType.PREFIX,
        stats: { def: [35, 55], hp: [100, 150], hpRegen: [0.02, 0.04], damageReduction: [0.06, 0.10] },
        description: '防禦力 +{def}，生命 +{hp}，每秒回血 +{hpRegen}%，傷害減免 +{damageReduction}%',
        applicableTo: ['armor']
    },
    primordial: {
        id: 'primordial',
        name: '原始的',
        rarity: ItemRarity.LEGENDARY,
        type: AffixType.PREFIX,
        stats: { atk: [20, 35], def: [20, 35], hp: [50, 80], allStats: [0.05, 0.10] },
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
    of_strength: {
        id: 'of_strength',
        name: '力量',
        rarity: ItemRarity.COMMON,
        type: AffixType.SUFFIX,
        stats: { atk: [1, 4] },
        description: '攻擊力 +{atk}',
        applicableTo: ['weapon', 'armor', 'accessory']
    },
    of_protection: {
        id: 'of_protection',
        name: '守護',
        rarity: ItemRarity.COMMON,
        type: AffixType.SUFFIX,
        stats: { def: [1, 4] },
        description: '防禦力 +{def}',
        applicableTo: ['weapon', 'armor', 'accessory']
    },
    of_vitality: {
        id: 'of_vitality',
        name: '活力',
        rarity: ItemRarity.COMMON,
        type: AffixType.SUFFIX,
        stats: { hp: [5, 15] },
        description: '生命 +{hp}',
        applicableTo: ['armor', 'accessory']
    },
    
    // ===== 優秀後綴 (Uncommon) =====
    of_fire: {
        id: 'of_fire',
        name: '烈焰',
        rarity: ItemRarity.UNCOMMON,
        type: AffixType.SUFFIX,
        stats: { atk: [3, 8],critChance: [0.05, 0.10] },
        description: '攻擊力 +{atk}，暴擊率 +{critChance}%',
        applicableTo: ['weapon']
    },
    of_ice: {
        id: 'of_ice',
        name: '冰霜',
        rarity: ItemRarity.UNCOMMON,
        type: AffixType.SUFFIX,
        stats: { atk: [3, 8], attackSpeed: [0.05, 0.10] },
        description: '攻擊力 +{atk}，攻擊速度 +{attackSpeed}%',
        applicableTo: ['weapon']
    },
    of_thunder: {
        id: 'of_thunder',
        name: '迅雷',
        rarity: ItemRarity.UNCOMMON,
        type: AffixType.SUFFIX,
        stats: { atk: [3, 8], stunChance: [0.03, 0.06] },
        description: '攻擊力 +{atk}，暈眩機率 +{stunChance}%',
        applicableTo: ['weapon']
    },
    of_fortitude: {
        id: 'of_fortitude',
        name: '堅毅',
        rarity: ItemRarity.UNCOMMON,
        type: AffixType.SUFFIX,
        stats: { hp: [15, 30], def: [3, 6] },
        description: '生命 +{hp}，防禦力 +{def}',
        applicableTo: ['armor', 'accessory']
    },
    
    // ===== 稀有後綴 (Rare) =====
    of_fury: {
        id: 'of_fury',
        name: '狂怒',
        rarity: ItemRarity.RARE,
        type: AffixType.SUFFIX,
        stats: { critChance: [0.05, 0.08], attackSpeed: [0.05, 0.10] },
        description: '暴擊率 +{critChance}%，攻擊速度 +{attackSpeed}%',
        applicableTo: ['weapon', 'accessory']
    },
    of_the_titan: {
        id: 'of_the_titan',
        name: '泰坦',
        rarity: ItemRarity.RARE,
        type: AffixType.SUFFIX,
        stats: { hp: [40, 70], def: [8, 15] },
        description: '生命 +{hp}，防禦力 +{def}',
        applicableTo: ['armor']
    },
    of_precision: {
        id: 'of_precision',
        name: '精準',
        rarity: ItemRarity.RARE,
        type: AffixType.SUFFIX,
        stats: { critChance: [0.05, 0.10], critDamage: [0.10, 0.20] },
        description: '暴擊率 +{critChance}%，暴擊傷害 +{critDamage}%',
        applicableTo: ['weapon', 'accessory']
    },
    of_mana: {
        id: 'of_mana',
        name: '魔力',
        rarity: ItemRarity.RARE,
        type: AffixType.SUFFIX,
        stats: { mp: [20, 40], mpRegen: [0.01, 0.03] },
        description: '魔力 +{mp}，魔力回復 +{mpRegen}%/秒',
        applicableTo: ['armor', 'accessory']
    },
    
    // ===== 史詩後綴 (Epic) =====
    of_annihilation: {
        id: 'of_annihilation',
        name: '毀滅',
        rarity: ItemRarity.EPIC,
        type: AffixType.SUFFIX,
        stats: { critDamage: [0.20, 0.35], atk: [10, 20] },
        description: '暴擊傷害 +{critDamage}%，攻擊力 +{atk}',
        applicableTo: ['weapon']
    },
    of_the_dragon: {
        id: 'of_the_dragon',
        name: '龍威',
        rarity: ItemRarity.EPIC,
        type: AffixType.SUFFIX,
        stats: { atk: [10, 20], hp: [50, 80], def: [10, 18] },
        description: '攻擊力 +{atk}，生命 +{hp}，防禦力 +{def}',
        applicableTo: ['weapon', 'armor']
    },
    of_shadows: {
        id: 'of_shadows',
        name: '暗影',
        rarity: ItemRarity.EPIC,
        type: AffixType.SUFFIX,
        stats: { critChance: [0.08, 0.12], dodgeChance: [0.03, 0.06] },
        description: '暴擊率 +{critChance}%，閃避率 +{dodgeChance}%',
        applicableTo: ['weapon', 'accessory']
    },
    of_restoration: {
        id: 'of_restoration',
        name: '生機',
        rarity: ItemRarity.EPIC,
        type: AffixType.SUFFIX,
        stats: { hpRegen: [0.02, 0.04], mpRegen: [0.02, 0.04], hp: [30, 50] },
        description: '每秒回血 +{hpRegen}%，魔力回復 +{mpRegen}%，生命 +{hp}',
        applicableTo: ['armor', 'accessory']
    },
    
    // ===== 傳說後綴 (Legendary) =====
    of_the_void: {
        id: 'of_the_void',
        name: '虛空',
        rarity: ItemRarity.LEGENDARY,
        type: AffixType.SUFFIX,
        stats: { atk: [15, 30], armorPenetration: [0.10, 0.18], critChance: [0.08, 0.12] },
        description: '攻擊力 +{atk}，穿甲 +{armorPenetration}%，暴擊率 +{critChance}%',
        applicableTo: ['weapon']
    },
    of_eternity: {
        id: 'of_eternity',
        name: '永恆',
        rarity: ItemRarity.LEGENDARY,
        type: AffixType.SUFFIX,
        stats: { hp: [80, 120], def: [25, 40], hpRegen: [0.03, 0.05], damageReduction: [0.05, 0.08] },
        description: '生命 +{hp}，防禦力 +{def}，每秒回血 +{hpRegen}%，傷害減免 +{damageReduction}%',
        applicableTo: ['armor']
    },
    of_omnipotence: {
        id: 'of_omnipotence',
        name: '全能',
        rarity: ItemRarity.LEGENDARY,
        type: AffixType.SUFFIX,
        stats: { atk: [15, 25], def: [15, 25], hp: [40, 60], critChance: [0.05, 0.08], allStats: [0.03, 0.06] },
        description: '攻擊力 +{atk}，防禦力 +{def}，生命 +{hp}，暴擊率 +{critChance}%，全屬性 +{allStats}%',
        applicableTo: ['weapon', 'armor', 'accessory']
    },
    // 完美無瑕 - 不會消耗耐久度
    indestructible: {
        id: 'indestructible',
        name: '不朵',
        rarity: ItemRarity.LEGENDARY,
        type: AffixType.SUFFIX,
        stats: { def: [10, 20], hp: [30, 50], noDurabilityLoss: [1, 1] },
        description: '【完美無瑕】不會消耗耐久度，防禦力 +{def}，生命 +{hp}',
        applicableTo: ['weapon', 'armor']
    }
};

/**
 * 詞綴系統類
 */
export default class AffixSystem {
    constructor() {
        this.prefixes = PrefixDatabase;
        this.suffixes = SuffixDatabase;
    }
    
    /**
     * 根據稀有度權重隨機選擇詞綴稀有度
     */
    rollAffixRarity(equipmentRarity) {
        const weights = AFFIX_RARITY_WEIGHTS[equipmentRarity] || AFFIX_RARITY_WEIGHTS[ItemRarity.COMMON];
        const roll = Math.random() * 100;
        let cumulative = 0;
        
        for (const [rarity, weight] of Object.entries(weights)) {
            cumulative += weight;
            if (roll < cumulative) {
                return rarity;
            }
        }
        return ItemRarity.COMMON;
    }
    
    /**
     * 獲取適用於特定裝備類型的詞綴列表
     */
    getApplicableAffixes(affixDatabase, equipmentType, targetRarity = null) {
        return Object.values(affixDatabase).filter(affix => {
            const typeMatch = affix.applicableTo.includes(equipmentType);
            const rarityMatch = targetRarity ? affix.rarity === targetRarity : true;
            return typeMatch && rarityMatch;
        });
    }
    
    /**
     * 隨機生成詞綴的數值
     */
    rollAffixValues(affix) {
        const rolledStats = {};
        
        for (const [stat, range] of Object.entries(affix.stats)) {
            if (Array.isArray(range)) {
                const [min, max] = range;
                // 根據數值類型決定精度
                if (max <= 1) {
                    // 百分比類型，保留兩位小數
                    rolledStats[stat] = Math.round((Math.random() * (max - min) + min) * 100) / 100;
                } else {
                    // 整數類型
                    rolledStats[stat] = Math.floor(Math.random() * (max - min + 1)) + min;
                }
            } else {
                rolledStats[stat] = range;
            }
        }
        
        return rolledStats;
    }
    
    /**
     * 為裝備生成隨機詞綴
     * @param {Object} equipment - 裝備對象
     * @param {boolean} forceRegenerate - 是否強制重新生成（清除現有詞綴）
     * @returns {Object} 帶有詞綴的裝備
     */
    generateAffixes(equipment, forceRegenerate = false) {
        if (!equipment || !equipment.type) return equipment;
        
        // 如果不是強制重新生成且已有詞綴，直接返回
        if (!forceRegenerate && equipment.affixes && equipment.affixes.length > 0) {
            return equipment;
        }
        
        const equipmentType = equipment.type;
        const equipmentRarity = equipment.rarity || ItemRarity.COMMON;
        
        // 確定詞綴數量
        const countRange = AFFIX_COUNT_BY_RARITY[equipmentRarity] || { min: 0, max: 1 };
        const affixCount = Math.floor(Math.random() * (countRange.max - countRange.min + 1)) + countRange.min;
        
        if (affixCount === 0) return equipment;
        
        // 初始化詞綴數組
        equipment.affixes = [];
        equipment.affixBonuses = {
            atk: 0, def: 0, hp: 0, mp: 0,
            critChance: 0, critDamage: 0, attackSpeed: 0,
            lifesteal: 0, damageReduction: 0, hpRegen: 0, mpRegen: 0,
            fireDamage: 0, iceDamage: 0, thunderDamage: 0, voidDamage: 0,
            slowChance: 0, stunChance: 0, dodgeChance: 0, armorPenetration: 0,
            bossBonus: 0, allStats: 0
        };
        
        const usedAffixIds = new Set();
        let prefixCount = 0;
        let suffixCount = 0;
        
        for (let i = 0; i < affixCount; i++) {
            // 決定生成前綴還是後綴
            const usePrefix = prefixCount < 2 && (suffixCount >= 2 || Math.random() < 0.5);
            const affixDatabase = usePrefix ? this.prefixes : this.suffixes;
            
            // 決定詞綴稀有度
            const targetRarity = this.rollAffixRarity(equipmentRarity);
            
            // 獲取可用詞綴
            const applicableAffixes = this.getApplicableAffixes(affixDatabase, equipmentType, targetRarity)
                .filter(a => !usedAffixIds.has(a.id));
            
            if (applicableAffixes.length === 0) {
                // 如果目標稀有度沒有可用詞綴，降級查找
                const allApplicable = this.getApplicableAffixes(affixDatabase, equipmentType)
                    .filter(a => !usedAffixIds.has(a.id));
                if (allApplicable.length === 0) continue;
                applicableAffixes.push(...allApplicable);
            }
            
            // 隨機選擇一個詞綴
            const selectedAffix = applicableAffixes[Math.floor(Math.random() * applicableAffixes.length)];
            usedAffixIds.add(selectedAffix.id);
            
            // 生成數值
            const rolledValues = this.rollAffixValues(selectedAffix);
            
            // 添加到裝備
            equipment.affixes.push({
                id: selectedAffix.id,
                name: selectedAffix.name,
                type: selectedAffix.type,
                rarity: selectedAffix.rarity,
                stats: rolledValues
            });
            
            // 累計加成
            for (const [stat, value] of Object.entries(rolledValues)) {
                if (equipment.affixBonuses[stat] !== undefined) {
                    equipment.affixBonuses[stat] += value;
                }
            }
            
            if (usePrefix) prefixCount++;
            else suffixCount++;
        }
        
        // 更新裝備名稱
        this.updateEquipmentName(equipment);
        
        return equipment;
    }
    
    /**
     * 更新裝備名稱（加上詞綴）
     * 格式：「前綴」裝備名-後綴1、後綴2
     */
    updateEquipmentName(equipment) {
        if (!equipment.affixes || equipment.affixes.length === 0) return;
        
        // 保存原始名稱
        if (!equipment._baseName) {
            equipment._baseName = equipment.name;
        }
        
        // 找出前綴和後綴
        const prefixes = equipment.affixes.filter(a => a.type === AffixType.PREFIX);
        const suffixes = equipment.affixes.filter(a => a.type === AffixType.SUFFIX);
        
        let newName = equipment._baseName;
        
        // 前綴加在前面
        if (prefixes.length > 0) {
            newName = prefixes[0].name + newName;
        }
        
        // 後綴用減號開頭，頓號連接
        if (suffixes.length > 0) {
            const suffixNames = suffixes.map(s => s.name).join('、');
            newName = newName + '-' + suffixNames;
        }
        
        equipment.name = newName;
    }
    
    /**
     * 獲取詞綴加成的顯示描述
     */
    getAffixDescription(affix) {
        let desc = affix.name + ': ';
        const statNames = {
            atk: '攻擊力', def: '防禦力', hp: '生命', mp: '魔力',
            critChance: '暴擊率', critDamage: '暴擊傷害', attackSpeed: '攻擊速度',
            lifesteal: '生命偷取', damageReduction: '傷害減免',
            hpRegen: '生命回復', mpRegen: '魔力回復',
            fireDamage: '火焰傷害', iceDamage: '冰霜傷害',
            thunderDamage: '雷電傷害', voidDamage: '虛空傷害',
            slowChance: '減速機率', stunChance: '暈眩機率',
            dodgeChance: '閃避率', armorPenetration: '穿甲',
            bossBonus: 'BOSS傷害加成', allStats: '全屬性'
        };
        
        const parts = [];
        for (const [stat, value] of Object.entries(affix.stats)) {
            const statName = statNames[stat] || stat;
            // 百分比屬性
            if (['critChance', 'critDamage', 'attackSpeed', 'lifesteal', 'damageReduction',
                 'hpRegen', 'mpRegen', 'slowChance', 'stunChance', 'dodgeChance',
                 'armorPenetration', 'bossBonus', 'allStats'].includes(stat)) {
                parts.push(`${statName} +${(value * 100).toFixed(1)}%`);
            } else {
                parts.push(`${statName} +${value}`);
            }
        }
        
        return desc + parts.join(', ');
    }
    
    /**
     * 根據裝備稀有度獲取可用的詞綴槽位數量
     */
    getAffixSlots(rarity) {
        const slotsByRarity = {
            [ItemRarity.COMMON]: { prefix: 0, suffix: 0 },
            [ItemRarity.UNCOMMON]: { prefix: 1, suffix: 0 },
            [ItemRarity.RARE]: { prefix: 1, suffix: 1 },
            [ItemRarity.EPIC]: { prefix: 2, suffix: 1 },
            [ItemRarity.LEGENDARY]: { prefix: 2, suffix: 2 },
            // 字串對應（小寫）
            'common': { prefix: 0, suffix: 0 },
            'uncommon': { prefix: 1, suffix: 0 },
            'rare': { prefix: 1, suffix: 1 },
            'epic': { prefix: 2, suffix: 1 },
            'legendary': { prefix: 2, suffix: 2 }
        };
        
        return slotsByRarity[rarity] || { prefix: 0, suffix: 0 };
    }
    
    /**
     * 計算裝備的總詞綴加成
     */
    getTotalAffixBonuses(equipment) {
        return equipment.affixBonuses || {
            atk: 0, def: 0, hp: 0, mp: 0,
            critChance: 0, critDamage: 0, attackSpeed: 0,
            lifesteal: 0, damageReduction: 0, hpRegen: 0, mpRegen: 0,
            fireDamage: 0, iceDamage: 0, thunderDamage: 0, voidDamage: 0,
            slowChance: 0, stunChance: 0, dodgeChance: 0, armorPenetration: 0,
            bossBonus: 0, allStats: 0
        };
    }
    
    /**
     * 重新洗練詞綴（消耗材料）
     */
    rerollAffixes(equipment, keepCount = 0) {
        if (!equipment) return null;
        
        // 保留指定數量的詞綴
        const keptAffixes = keepCount > 0 && equipment.affixes 
            ? equipment.affixes.slice(0, keepCount) 
            : [];
        
        // 重置
        equipment.affixes = keptAffixes;
        equipment.affixBonuses = {
            atk: 0, def: 0, hp: 0, mp: 0,
            critChance: 0, critDamage: 0, attackSpeed: 0,
            lifesteal: 0, damageReduction: 0, hpRegen: 0, mpRegen: 0,
            fireDamage: 0, iceDamage: 0, thunderDamage: 0, voidDamage: 0,
            slowChance: 0, stunChance: 0, dodgeChance: 0, armorPenetration: 0,
            bossBonus: 0, allStats: 0
        };
        
        // 重新累計保留的詞綴
        for (const affix of keptAffixes) {
            for (const [stat, value] of Object.entries(affix.stats)) {
                if (equipment.affixBonuses[stat] !== undefined) {
                    equipment.affixBonuses[stat] += value;
                }
            }
        }
        
        // 恢復原始名稱
        if (equipment._baseName) {
            equipment.name = equipment._baseName;
        }
        
        // 重新生成詞綴
        return this.generateAffixes(equipment);
    }
}

// 單例導出
export const affixSystem = new AffixSystem();
