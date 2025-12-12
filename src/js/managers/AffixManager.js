/**
 * AffixManager.js
 * 裝備詞綴系統 - 前綴與後綴
 * 整合鍛造系統，裝備可獲得隨機詞綴
 */

import { ItemRarity } from '../models/DataModel.js';
import {PrefixDatabase, SuffixDatabase} from '../data/Prefixes.js';

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
 * 詞綴管理器類
 */
export class AffixManager {
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
            [AffixStat.ATK]: 0,
            [AffixStat.DEF]: 0,
            [AffixStat.HP]: 0,
            [AffixStat.MP]: 0,
            [AffixStat.CRIT_CHANCE]: 0,
            [AffixStat.CRIT_DAMAGE]: 0,
            [AffixStat.ATTACK_SPEED]: 0,
            [AffixStat.LIFESTEAL]: 0,
            [AffixStat.DAMAGE_REDUCTION]: 0,
            [AffixStat.HP_REGEN]: 0,
            [AffixStat.MP_REGEN]: 0,
            [AffixStat.FIRE_DAMAGE]: 0,
            [AffixStat.ICE_DAMAGE]: 0,
            [AffixStat.THUNDER_DAMAGE]: 0,
            [AffixStat.VOID_DAMAGE]: 0,
            [AffixStat.SLOW_CHANCE]: 0,
            [AffixStat.STUN_CHANCE]: 0,
            [AffixStat.DODGE_CHANCE]: 0,
            [AffixStat.ARMOR_PENETRATION]: 0,
            [AffixStat.BOSS_BONUS]: 0,
            [AffixStat.ALL_STATS]: 0
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
            
            // 累計加成（正規化 stat key）
            for (const [stat, value] of Object.entries(rolledValues)) {
                const norm = normalizeStatKey(stat) || stat;
                if (equipment.affixBonuses[norm] !== undefined) {
                    equipment.affixBonuses[norm] += value;
                } else {
                    // if unknown key, add it dynamically
                    equipment.affixBonuses[norm] = value;
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
        // 使用中央化常數以避免命名不一致
        const { AffixStat } = AffixConsts;
        const statNames = {
            [AffixStat.ATK]: '攻擊力', [AffixStat.DEF]: '防禦力', [AffixStat.HP]: '生命', [AffixStat.MP]: '魔力',
            [AffixStat.CRIT_CHANCE]: '暴擊率', [AffixStat.CRIT_DAMAGE]: '暴擊傷害', [AffixStat.ATTACK_SPEED]: '攻擊速度',
            [AffixStat.LIFESTEAL]: '生命偷取', [AffixStat.DAMAGE_REDUCTION]: '傷害減免',
            [AffixStat.HP_REGEN]: '生命回復', [AffixStat.MP_REGEN]: '魔力回復',
            [AffixStat.FIRE_DAMAGE]: '火焰傷害', [AffixStat.ICE_DAMAGE]: '冰霜傷害',
            [AffixStat.THUNDER_DAMAGE]: '雷電傷害', [AffixStat.VOID_DAMAGE]: '虛空傷害',
            [AffixStat.SLOW_CHANCE]: '減速機率', [AffixStat.STUN_CHANCE]: '暈眩機率',
            [AffixStat.DODGE_CHANCE]: '閃避率', [AffixStat.ARMOR_PENETRATION]: '穿甲',
            [AffixStat.BOSS_BONUS]: 'BOSS傷害加成', [AffixStat.ALL_STATS]: '全屬性'
        };
        
        const parts = [];
        for (const [stat, value] of Object.entries(affix.stats)) {
            const statName = statNames[stat] || stat;
            // 百分比屬性（使用中央化判斷）
            const percentStats = [
                AffixStat.CRIT_CHANCE, AffixStat.CRIT_DAMAGE, AffixStat.ATTACK_SPEED, AffixStat.LIFESTEAL,
                AffixStat.DAMAGE_REDUCTION, AffixStat.HP_REGEN, AffixStat.MP_REGEN, AffixStat.SLOW_CHANCE,
                AffixStat.STUN_CHANCE, AffixStat.DODGE_CHANCE, AffixStat.ARMOR_PENETRATION, AffixStat.BOSS_BONUS,
                AffixStat.ALL_STATS, AffixStat.FIRE_DAMAGE, AffixStat.ICE_DAMAGE, AffixStat.THUNDER_DAMAGE,
                AffixStat.VOID_DAMAGE
            ];
            if (percentStats.includes(stat)) {
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
            [AffixStat.ATK]: 0,
            [AffixStat.DEF]: 0,
            [AffixStat.HP]: 0,
            [AffixStat.MP]: 0,
            [AffixStat.CRIT_CHANCE]: 0,
            [AffixStat.CRIT_DAMAGE]: 0,
            [AffixStat.ATTACK_SPEED]: 0,
            [AffixStat.LIFESTEAL]: 0,
            [AffixStat.DAMAGE_REDUCTION]: 0,
            [AffixStat.HP_REGEN]: 0,
            [AffixStat.MP_REGEN]: 0,
            [AffixStat.FIRE_DAMAGE]: 0,
            [AffixStat.ICE_DAMAGE]: 0,
            [AffixStat.THUNDER_DAMAGE]: 0,
            [AffixStat.VOID_DAMAGE]: 0,
            [AffixStat.SLOW_CHANCE]: 0,
            [AffixStat.STUN_CHANCE]: 0,
            [AffixStat.DODGE_CHANCE]: 0,
            [AffixStat.ARMOR_PENETRATION]: 0,
            [AffixStat.BOSS_BONUS]: 0,
            [AffixStat.ALL_STATS]: 0
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
            [AffixStat.ATK]: 0,
            [AffixStat.DEF]: 0,
            [AffixStat.HP]: 0,
            [AffixStat.MP]: 0,
            [AffixStat.CRIT_CHANCE]: 0,
            [AffixStat.CRIT_DAMAGE]: 0,
            [AffixStat.ATTACK_SPEED]: 0,
            [AffixStat.LIFESTEAL]: 0,
            [AffixStat.DAMAGE_REDUCTION]: 0,
            [AffixStat.HP_REGEN]: 0,
            [AffixStat.MP_REGEN]: 0,
            [AffixStat.FIRE_DAMAGE]: 0,
            [AffixStat.ICE_DAMAGE]: 0,
            [AffixStat.THUNDER_DAMAGE]: 0,
            [AffixStat.VOID_DAMAGE]: 0,
            [AffixStat.SLOW_CHANCE]: 0,
            [AffixStat.STUN_CHANCE]: 0,
            [AffixStat.DODGE_CHANCE]: 0,
            [AffixStat.ARMOR_PENETRATION]: 0,
            [AffixStat.BOSS_BONUS]: 0,
            [AffixStat.ALL_STATS]: 0
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
export const affixManager = new AffixManager();

// 向後兼容
export { AffixManager as AffixSystem };
export const affixSystem = affixManager;
export default AffixManager;
