/**
 * AffixManager.js
 * 裝備詞綴系統 - 前綴與後綴
 * 整合鍛造系統，裝備可獲得隨機詞綴
 */

import { AffixStat, ItemRarity } from '../models/Enums.js';
import GameManager from './GameManager.js';
import {PrefixDatabase, SuffixDatabase} from '../data/Prefixes.js';
import { formatAffixStats } from '../utils/ItemDisplay.js';
import {
    createEmptyAffixBonuses,
    getAffixCountRange,
    getAffixSlots,
    normalizeEquipmentKind,
    rollWeightedAffixRarity
} from '../data/EquipmentBalance.js';

const REROLL_GOLD_BY_RARITY = Object.freeze({
    common: 50,
    uncommon: 100,
    rare: 200,
    epic: 400,
    legendary: 800
});

const REROLL_MATERIALS_BY_RARITY = Object.freeze({
    common: Object.freeze([{ id: 'iron_shard', quantity: 1 }]),
    uncommon: Object.freeze([{ id: 'iron_shard', quantity: 2 }]),
    rare: Object.freeze([{ id: 'high_ore', quantity: 1 }]),
    epic: Object.freeze([{ id: 'forge_core', quantity: 1 }]),
    legendary: Object.freeze([{ id: 'rare_metal', quantity: 1 }])
});

const RARITY_ORDER = Object.freeze(['common', 'uncommon', 'rare', 'epic', 'legendary']);

// Normalize various stat key forms to central AffixStat values
function normalizeStatKey(stat) {
    if (!stat) return stat;
    // if already one of the AffixStat values, return as-is
    const allVals = Object.values(AffixStat);
    if (allVals.includes(stat)) return stat;

    const key = String(stat).toLowerCase();
    const map = {
        atk: AffixStat.ATK,
        attack: AffixStat.ATK,
        def: AffixStat.DEF,
        defense: AffixStat.DEF,
        hp: AffixStat.HP,
        critchance: AffixStat.CRIT_CHANCE,
        'crit_chance': AffixStat.CRIT_CHANCE,
        critdamage: AffixStat.CRIT_DAMAGE,
        attackspeed: AffixStat.ATTACK_SPEED,
        lifesteal: AffixStat.LIFE_STEAL || AffixStat.LIFESTEAL,
        'life_steal': AffixStat.LIFE_STEAL || AffixStat.LIFESTEAL,
        'damage_reduction': AffixStat.DAMAGE_REDUCTION,
        damagereduction: AffixStat.DAMAGE_REDUCTION,
        'dodge_chance': AffixStat.DODGE_CHANCE || AffixStat.DODGE_CHANCE,
        dodgetchance: AffixStat.DODGE_CHANCE || AffixStat.DODGE_CHANCE,
        'armor_penetration': AffixStat.ARMOR_PENETRATION,
        armorpen: AffixStat.ARMOR_PENETRATION,
        'allstats': AffixStat.ALL_STATS,
        all_stats: AffixStat.ALL_STATS,
        fire: AffixStat.FIRE || AffixStat.FIRE,
        ice: AffixStat.ICE || AffixStat.ICE,
        thunder: AffixStat.THUNDER || AffixStat.THUNDER,
        void: AffixStat.VOID
    };

    return map[key] || stat;
}

// 詞綴類型
export const AffixType = {
    PREFIX: 'prefix',   // 前綴
    SUFFIX: 'suffix'    // 後綴
};

/**
 * 詞綴管理器類
 */
export class AffixManager {
    constructor() {
        this.prefixes = PrefixDatabase;
        this.suffixes = SuffixDatabase;
        this.rerollHistory = [];
    }
    
    /**
     * 根據稀有度權重隨機選擇詞綴稀有度
     */
    rollAffixRarity(equipmentRarity) {
        return rollWeightedAffixRarity(equipmentRarity);
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
        
        const equipmentType = normalizeEquipmentKind(equipment.type);
        const equipmentRarity = equipment.rarity || ItemRarity.COMMON;
        
        // 確定詞綴數量
        const countRange = getAffixCountRange(equipmentRarity);
        const affixCount = Math.floor(Math.random() * (countRange.max - countRange.min + 1)) + countRange.min;
        
        if (affixCount === 0) return equipment;
        
        // 初始化詞綴數組
        equipment.affixes = [];
        equipment.affixBonuses = createEmptyAffixBonuses();
        
        const usedAffixIds = new Set();
        let prefixCount = 0;
        let suffixCount = 0;
        const slots = getAffixSlots(equipmentRarity);
        
        for (let i = 0; i < affixCount; i++) {
            // 決定生成前綴還是後綴
            const canUsePrefix = prefixCount < slots.prefix;
            const canUseSuffix = suffixCount < slots.suffix;
            if (!canUsePrefix && !canUseSuffix) break;

            const usePrefix = canUsePrefix && (!canUseSuffix || Math.random() < 0.5);
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
        const statsText = formatAffixStats(affix?.stats);
        return `${affix?.name || '詞綴'}${statsText ? `: ${statsText}` : ''}`;
    }
    
    /**
     * 根據裝備稀有度獲取可用的詞綴槽位數量
     */
    getAffixSlots(rarity) {
        const slotsByRarity = {
            [ItemRarity.COMMON]: getAffixSlots(ItemRarity.COMMON),
            [ItemRarity.UNCOMMON]: getAffixSlots(ItemRarity.UNCOMMON),
            [ItemRarity.RARE]: getAffixSlots(ItemRarity.RARE),
            [ItemRarity.EPIC]: getAffixSlots(ItemRarity.EPIC),
            [ItemRarity.LEGENDARY]: getAffixSlots(ItemRarity.LEGENDARY),
            // 字串對應（小寫）
            'common': getAffixSlots(ItemRarity.COMMON),
            'uncommon': getAffixSlots(ItemRarity.UNCOMMON),
            'rare': getAffixSlots(ItemRarity.RARE),
            'epic': getAffixSlots(ItemRarity.EPIC),
            'legendary': getAffixSlots(ItemRarity.LEGENDARY)
        };
        
        return slotsByRarity[rarity] || { prefix: 0, suffix: 0 };
    }
    
    /**
     * 計算裝備的總詞綴加成
     */
    getTotalAffixBonuses(equipment) {
        return equipment.affixBonuses || createEmptyAffixBonuses();
    }
    
    getRerollRequirements(equipment) {
        const rarity = equipment?.rarity || 'common';
        return {
            gold: REROLL_GOLD_BY_RARITY[rarity] || REROLL_GOLD_BY_RARITY.uncommon,
            materials: (REROLL_MATERIALS_BY_RARITY[rarity] || REROLL_MATERIALS_BY_RARITY.common)
                .map(material => ({ ...material }))
        };
    }

    getRerollStatus(equipment) {
        if (!equipment) return { ok: false, reason: 'equipment', requirement: null };
        const requirement = this.getRerollRequirements(equipment);
        const hasGold = GameManager.getGold() >= requirement.gold;
        const lacking = requirement.materials.find(material =>
            GameManager.getItemCountAcrossStorage(material.id) < material.quantity
        );
        return {
            ok: hasGold && !lacking,
            reason: !hasGold ? 'gold' : lacking ? 'materials' : null,
            requirement,
            hasGold,
            hasMaterials: !lacking,
            lacking: lacking || null
        };
    }

    rerollAffixes(equipment) {
        const status = this.getRerollStatus(equipment);
        if (!status.ok) return { ...status, success: false, equipment };

        if (!GameManager.removeGold(status.requirement.gold)) {
            return { ...status, success: false, reason: 'gold', equipment };
        }
        for (const material of status.requirement.materials) {
            GameManager.removeMaterial(material.id, material.quantity);
        }

        if (!equipment._baseName) equipment._baseName = equipment.name;
        if (!equipment._baseRarity) equipment._baseRarity = equipment.rarity || 'common';
        equipment.name = equipment._baseName;
        equipment.rarity = equipment._baseRarity;

        this.generateAffixes(equipment, true);
        equipment.rarity = (equipment.affixes || []).reduce((current, affix) => {
            return RARITY_ORDER.indexOf(affix.rarity) > RARITY_ORDER.indexOf(current)
                ? affix.rarity
                : current;
        }, equipment._baseRarity);

        GameManager.markSaveDirty?.('reroll-affixes');
        GameManager.notify?.('all');
        const result = {
            success: true,
            reason: null,
            requirement: status.requirement,
            equipment,
            affixes: equipment.affixes || [],
            message: `重鑄完成！獲得 ${(equipment.affixes || []).length} 個詞綴`
        };
        this.rerollHistory.unshift({ ...result, timestamp: Date.now() });
        this.rerollHistory.length = Math.min(this.rerollHistory.length, 20);
        return result;
    }

    getRerollHistory(limit = 10) {
        return this.rerollHistory.slice(0, Math.max(0, Number(limit) || 0));
    }
}

// 單例導出
export const affixManager = new AffixManager();
