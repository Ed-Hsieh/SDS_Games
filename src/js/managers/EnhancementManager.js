/**
 * EnhancementManager.js
 * 裝備強化系統 - 金幣強化、失敗保護、里程碑能力、套裝效果
 */
import GameManager from './GameManager.js';
import { AffixStat, ItemRarity } from '../models/Enums.js';
import { SetDatabase } from '../data/Equipment.js';
import { PrefixDatabase, SuffixDatabase } from '../data/Prefixes.js';
import {
    calculateActiveSetBonuses,
    createEmptyAffixBonuses,
    normalizeEquipmentKind
} from '../data/EquipmentBalance.js';
import { readItemStat, readNumber } from '../models/ItemSchema.js';

export const MAX_ENHANCEMENT_LEVEL = 10;

const BASE_STAT_GROWTH = 0.04;

const ENHANCEMENT_SUCCESS_RATES = {
    0: 1.00,
    1: 0.95,
    2: 0.90,
    3: 0.75,
    4: 0.65,
    5: 0.55,
    6: 0.40,
    7: 0.30,
    8: 0.20,
    9: 0.12
};

const ENHANCEMENT_COSTS = {
    0: 50,
    1: 90,
    2: 140,
    3: 220,
    4: 340,
    5: 520,
    6: 760,
    7: 1100,
    8: 1600,
    9: 2400
};

const RARITY_MULTIPLIER = {
    [ItemRarity.COMMON]: 1,
    [ItemRarity.UNCOMMON]: 1.25,
    [ItemRarity.RARE]: 1.65,
    [ItemRarity.EPIC]: 2.25,
    [ItemRarity.LEGENDARY]: 3.25
};

const STABILITY_BY_RARITY = {
    [ItemRarity.COMMON]: 2,
    [ItemRarity.UNCOMMON]: 3,
    [ItemRarity.RARE]: 4,
    [ItemRarity.EPIC]: 5,
    [ItemRarity.LEGENDARY]: 6
};

const MILESTONE_LEVELS = [3, 6, 9, 10];

const MILESTONE_POOLS = {
    3: [
        { stat: AffixStat.ATK, label: '攻擊強化', range: [2, 5] },
        { stat: AffixStat.DEF, label: '防禦強化', range: [2, 5] },
        { stat: AffixStat.HP, label: '生命強化', range: [15, 35] }
    ],
    6: [
        { stat: AffixStat.CRIT_DAMAGE, label: '爆傷強化', range: [5, 10] },
        { stat: AffixStat.BOSS_BONUS, label: '討伐強化', range: [4, 8] },
        { stat: AffixStat.ARMOR_PENETRATION, label: '穿甲強化', range: [4, 8] },
        { stat: AffixStat.CRIT_CHANCE, label: '精準強化', range: [1, 3] }
    ],
    9: [
        { stat: AffixStat.DODGE_CHANCE, label: '閃避強化', range: [1, 3] },
        { stat: AffixStat.LIFE_STEAL, label: '吸血強化', range: [1, 3] },
        { stat: AffixStat.DAMAGE_REDUCTION, label: '減傷強化', range: [1, 3] },
        { stat: AffixStat.STUN_CHANCE, label: '暈眩強化', range: [2, 5] },
        { stat: AffixStat.SLOW_CHANCE, label: '緩速強化', range: [2, 5] }
    ]
};

const STAT_LABELS = {
    [AffixStat.ATK]: '攻擊',
    [AffixStat.DEF]: '防禦',
    [AffixStat.HP]: '生命',
    [AffixStat.CRIT_DAMAGE]: '爆擊傷害',
    [AffixStat.BOSS_BONUS]: 'Boss 傷害',
    [AffixStat.ARMOR_PENETRATION]: '護甲穿透',
    [AffixStat.CRIT_CHANCE]: '爆擊率',
    [AffixStat.DODGE_CHANCE]: '閃避率',
    [AffixStat.LIFE_STEAL]: '吸血',
    [AffixStat.DAMAGE_REDUCTION]: '減傷',
    [AffixStat.STUN_CHANCE]: '暈眩機率',
    [AffixStat.SLOW_CHANCE]: '緩速機率',
    [AffixStat.ALL_STATS]: '全屬性',
    noDurabilityLoss: '不消耗耐久'
};

const PERCENT_STATS = new Set([
    AffixStat.CRIT_DAMAGE,
    AffixStat.BOSS_BONUS,
    AffixStat.ARMOR_PENETRATION,
    AffixStat.CRIT_CHANCE,
    AffixStat.DODGE_CHANCE,
    AffixStat.LIFE_STEAL,
    AffixStat.DAMAGE_REDUCTION,
    AffixStat.STUN_CHANCE,
    AffixStat.SLOW_CHANCE,
    AffixStat.ALL_STATS
]);

const STAT_DISPLAY_LABELS = {
    [AffixStat.ATK]: '攻擊力',
    [AffixStat.DEF]: '防禦力',
    [AffixStat.HP]: '生命',
    [AffixStat.CRIT_DAMAGE]: '暴擊傷害',
    [AffixStat.BOSS_BONUS]: '首領傷害',
    [AffixStat.ARMOR_PENETRATION]: '穿甲',
    [AffixStat.CRIT_CHANCE]: '暴擊率',
    [AffixStat.DODGE_CHANCE]: '閃避率',
    [AffixStat.LIFE_STEAL]: '吸血',
    [AffixStat.DAMAGE_REDUCTION]: '傷害減免',
    [AffixStat.STUN_CHANCE]: '暈眩機率',
    [AffixStat.SLOW_CHANCE]: '緩速機率',
    [AffixStat.ALL_STATS]: '全屬性',
    noDurabilityLoss: '不消耗耐久'
};

const ENHANCEMENT_MILESTONE_DISPLAY = {
    3: [
        { stat: AffixStat.ATK, label: '攻擊校準', range: [2, 5] },
        { stat: AffixStat.DEF, label: '防禦加固', range: [2, 5] },
        { stat: AffixStat.HP, label: '生命補強', range: [15, 35] }
    ],
    6: [
        { stat: AffixStat.CRIT_DAMAGE, label: '暴擊打磨', range: [5, 10] },
        { stat: AffixStat.BOSS_BONUS, label: '討伐打磨', range: [4, 8] },
        { stat: AffixStat.ARMOR_PENETRATION, label: '穿甲打磨', range: [4, 8] },
        { stat: AffixStat.CRIT_CHANCE, label: '精準打磨', range: [1, 3] }
    ],
    9: [
        { stat: AffixStat.DODGE_CHANCE, label: '迴避打磨', range: [1, 3] },
        { stat: AffixStat.LIFE_STEAL, label: '汲取打磨', range: [1, 3] },
        { stat: AffixStat.DAMAGE_REDUCTION, label: '韌性打磨', range: [1, 3] },
        { stat: AffixStat.STUN_CHANCE, label: '震擊打磨', range: [2, 5] },
        { stat: AffixStat.SLOW_CHANCE, label: '牽制打磨', range: [2, 5] }
    ]
};

function rollInt([min, max]) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollStatValue(value) {
    if (Array.isArray(value)) return rollInt(value);
    return value;
}

function scaleLegendaryValue(stat, value) {
    if (stat === 'noDurabilityLoss') return value;
    if (typeof value !== 'number') return value;

    const dangerousStats = new Set([
        AffixStat.CRIT_CHANCE,
        AffixStat.LIFE_STEAL,
        AffixStat.DAMAGE_REDUCTION,
        AffixStat.ALL_STATS
    ]);
    const scale = dangerousStats.has(stat) ? 0.7 : 0.8;
    return Math.max(1, Math.round(value * scale));
}

function addBonus(target, stat, value) {
    if (value === undefined || value === null || value === 0) return;
    target[stat] = readNumber(target[stat]) + readNumber(value);
}

function isEquipment(item) {
    return ['weapon', 'armor', 'accessory', 'equipment'].includes(String(item?.type || '').toLowerCase());
}

export class EnhancementManager {
    constructor() {
        this.enhancementHistory = [];
    }

    enhance(equipment) {
        if (!equipment || !isEquipment(equipment)) {
            return { success: false, message: '請先選擇可強化的裝備。' };
        }

        if (equipment.canEnhance === false) {
            return { success: false, message: '這件裝備無法強化。' };
        }

        this.initializeEnhancementState(equipment);

        if (equipment.enhanceLevel >= MAX_ENHANCEMENT_LEVEL) {
            return { success: false, message: '裝備已達最高強化等級。' };
        }

        if (equipment.enhancementStability <= 0) {
            return { success: false, message: '裝備失敗保護已耗盡，無法繼續強化。' };
        }

        const cost = this.getEnhancementCost(equipment);
        if (GameManager.getGold() < cost) {
            return { success: false, message: `金幣不足，需要 ${cost} 金幣。` };
        }

        GameManager.removeGold(cost);

        const fromLevel = equipment.enhanceLevel;
        const successRate = this.getSuccessRate(equipment);
        const roll = Math.random();
        const success = roll < successRate;

        if (!success) {
            equipment.enhancementStability = Math.max(0, equipment.enhancementStability - 1);
            const result = {
                success: false,
                fromLevel,
                newLevel: equipment.enhanceLevel,
                stability: equipment.enhancementStability,
                cost,
                message: equipment.enhancementStability > 0
                    ? `強化失敗，失敗保護 -1。剩餘 ${equipment.enhancementStability}/${equipment.maxEnhancementStability}`
                    : '強化失敗，失敗保護已耗盡。'
            };
            this.recordHistory(equipment, result);
            return result;
        }

        equipment.enhanceLevel += 1;
        this.applyEnhancementBonus(equipment);

        const grantedMark = this.tryGrantMilestoneMark(equipment);
        this.rebuildEnhancementBonuses(equipment);

        const result = {
            success: true,
            fromLevel,
            newLevel: equipment.enhanceLevel,
            stability: equipment.enhancementStability,
            cost,
            milestoneMark: grantedMark,
            message: grantedMark
                ? `強化成功至 +${equipment.enhanceLevel}，獲得 ${this.getMarkDescription(grantedMark)}。`
                : `強化成功至 +${equipment.enhanceLevel}。`
        };

        this.recordHistory(equipment, result);
        return result;
    }

    initializeEnhancementState(equipment) {
        if (equipment.enhanceLevel === undefined) equipment.enhanceLevel = 0;
        if (!equipment.enhancementMarks) equipment.enhancementMarks = {};
        if (!equipment.maxEnhancementStability) {
            equipment.maxEnhancementStability = STABILITY_BY_RARITY[equipment.rarity] || STABILITY_BY_RARITY[ItemRarity.COMMON];
        }
        if (equipment.enhancementStability === undefined || equipment.enhancementStability === null) {
            equipment.enhancementStability = equipment.maxEnhancementStability;
        }
        if (!equipment.enhancementBonuses) {
            equipment.enhancementBonuses = createEmptyAffixBonuses(['noDurabilityLoss']);
        }
        this.captureBaseStats(equipment);
        this.applyEnhancementBonus(equipment);
        this.rebuildEnhancementBonuses(equipment);
    }

    captureBaseStats(equipment) {
        if (equipment._enhanceBaseStats) return equipment._enhanceBaseStats;

        equipment._enhanceBaseStats = {
            atk: readNumber(equipment._baseAtk ?? readItemStat(equipment, 'atk', 'attack', 0)),
            def: readNumber(equipment._baseDef ?? readItemStat(equipment, 'def', 'defense', 0)),
            hp: readNumber(readItemStat(equipment, 'hp', [], 0))
        };

        return equipment._enhanceBaseStats;
    }

    getEnhancementCost(equipment) {
        const level = equipment?.enhanceLevel || 0;
        const baseCost = ENHANCEMENT_COSTS[level] || ENHANCEMENT_COSTS[0];
        const multiplier = RARITY_MULTIPLIER[equipment?.rarity] || RARITY_MULTIPLIER[ItemRarity.COMMON];
        return Math.floor(baseCost * multiplier);
    }

    getSuccessRate(equipment) {
        const level = equipment?.enhanceLevel || 0;
        return ENHANCEMENT_SUCCESS_RATES[level] || 0;
    }

    applyEnhancementBonus(equipment) {
        const level = equipment.enhanceLevel || 0;
        const base = this.captureBaseStats(equipment);
        const multiplier = 1 + (level * BASE_STAT_GROWTH);

        if (base.atk > 0) {
            const atk = Math.floor(base.atk * multiplier);
            equipment.atk = atk;
            equipment.attack = atk;
        }

        if (base.def > 0) {
            const def = Math.floor(base.def * multiplier);
            equipment.def = def;
            equipment.defense = def;
        }

        if (base.hp > 0) {
            equipment.hp = Math.floor(base.hp * multiplier);
        }
    }

    tryGrantMilestoneMark(equipment) {
        const level = equipment.enhanceLevel || 0;
        if (!MILESTONE_LEVELS.includes(level)) return null;
        if (equipment.enhancementMarks?.[level]) return null;

        const mark = level === 10
            ? this.rollLegendaryMark(equipment)
            : this.rollMilestoneMark(level);

        if (!mark) return null;
        equipment.enhancementMarks[level] = mark;
        return mark;
    }

    rollMilestoneMark(level) {
        const pool = MILESTONE_POOLS[level] || [];
        if (pool.length === 0) return null;

        const option = pool[Math.floor(Math.random() * pool.length)];
        const value = rollInt(option.range);
        const preview = (ENHANCEMENT_MILESTONE_DISPLAY[level] || [])
            .find(entry => entry.stat === option.stat);
        return {
            id: `enhance_${level}_${option.stat}`,
            milestone: level,
            label: preview?.label || option.label,
            stat: option.stat,
            value,
            rarity: level >= 9 ? ItemRarity.EPIC : ItemRarity.RARE
        };
    }

    rollLegendaryMark(equipment) {
        const equipmentType = normalizeEquipmentKind(equipment.type);
        const existingAffixIds = new Set((equipment.affixes || []).map(affix => affix.id));
        const legendaryAffixes = [...Object.values(PrefixDatabase), ...Object.values(SuffixDatabase)]
            .filter(affix => affix.rarity === ItemRarity.LEGENDARY)
            .filter(affix => affix.applicableTo?.includes(equipmentType))
            .filter(affix => !existingAffixIds.has(affix.id));

        const fallbackAffixes = [...Object.values(PrefixDatabase), ...Object.values(SuffixDatabase)]
            .filter(affix => affix.rarity === ItemRarity.LEGENDARY)
            .filter(affix => affix.applicableTo?.includes(equipmentType));

        const pool = legendaryAffixes.length > 0 ? legendaryAffixes : fallbackAffixes;
        if (pool.length === 0) return null;

        const selected = pool[Math.floor(Math.random() * pool.length)];
        const rolledStats = {};
        for (const [stat, value] of Object.entries(selected.stats || {})) {
            rolledStats[stat] = scaleLegendaryValue(stat, rollStatValue(value));
        }

        return {
            id: `enhance_10_${selected.id}`,
            milestone: 10,
            label: `傳說能力：${selected.name}`,
            affixId: selected.id,
            affixName: selected.name,
            type: selected.type,
            rarity: ItemRarity.LEGENDARY,
            stats: rolledStats
        };
    }

    rebuildEnhancementBonuses(equipment) {
        const bonuses = createEmptyAffixBonuses(['noDurabilityLoss']);
        const marks = Object.values(equipment.enhancementMarks || {});

        for (const mark of marks) {
            if (mark.stats) {
                for (const [stat, value] of Object.entries(mark.stats)) {
                    addBonus(bonuses, stat, value);
                }
            } else if (mark.stat) {
                addBonus(bonuses, mark.stat, mark.value);
            }
        }

        equipment.enhancementBonuses = bonuses;
        return bonuses;
    }

    recordHistory(equipment, result) {
        this.enhancementHistory.unshift({
            equipment: equipment.name,
            level: result.newLevel,
            success: result.success,
            message: result.message,
            timestamp: Date.now()
        });

        if (this.enhancementHistory.length > 20) {
            this.enhancementHistory.pop();
        }
    }

    calculateSetBonuses(character) {
        return calculateActiveSetBonuses(character, SetDatabase);
    }

    getDisplayName(equipment) {
        if (!equipment) return '';
        const level = equipment.enhanceLevel || 0;
        return level > 0 ? `${equipment.name} +${level}` : equipment.name;
    }

    getEnhancementPreview(equipment) {
        if (!equipment) {
            return {
                currentLevel: 0,
                nextLevel: null,
                cost: 0,
                successRate: 0,
                canEnhance: false,
                stability: 0,
                maxStability: 0
            };
        }

        this.initializeEnhancementState(equipment);
        const currentLevel = equipment.enhanceLevel || 0;
        const nextLevel = currentLevel + 1;

        return {
            currentLevel,
            nextLevel: nextLevel <= MAX_ENHANCEMENT_LEVEL ? nextLevel : null,
            cost: this.getEnhancementCost(equipment),
            successRate: Math.round(this.getSuccessRate(equipment) * 100),
            canEnhance: currentLevel < MAX_ENHANCEMENT_LEVEL
                && equipment.enhancementStability > 0
                && equipment.canEnhance !== false,
            stability: equipment.enhancementStability,
            maxStability: equipment.maxEnhancementStability,
            nextMilestone: MILESTONE_LEVELS.find(level => level > currentLevel) || null
        };
    }

    getMilestonePreviews(equipment) {
        const currentLevel = equipment?.enhanceLevel || 0;
        return MILESTONE_LEVELS.map(level => {
            const options = level === 10
                ? this.getLegendaryMilestoneOptions(equipment)
                : (ENHANCEMENT_MILESTONE_DISPLAY[level] || []).map(option => ({
                    id: `enhance_preview_${level}_${option.stat}`,
                    label: option.label,
                    statsText: this.formatStatBonus(option.stat, option.range),
                    rarity: level >= 9 ? ItemRarity.EPIC : ItemRarity.RARE
                }));

            return {
                level,
                unlocked: currentLevel >= level,
                granted: equipment?.enhancementMarks?.[level] || null,
                options
            };
        });
    }

    getLegendaryMilestoneOptions(equipment) {
        const equipmentType = normalizeEquipmentKind(equipment?.type);
        const pool = [...Object.values(PrefixDatabase), ...Object.values(SuffixDatabase)]
            .filter(affix => affix.rarity === ItemRarity.LEGENDARY)
            .filter(affix => !equipmentType || affix.applicableTo?.includes(equipmentType));

        if (pool.length === 0) {
            return [{
                id: 'enhance_preview_10_legendary',
                label: '傳說能力',
                statsText: '從可用傳說詞綴中抽取',
                rarity: ItemRarity.LEGENDARY
            }];
        }

        return pool.map(affix => ({
            id: `enhance_preview_10_${affix.id}`,
            label: affix.name || '傳說能力',
            statsText: this.formatStatsPreview(affix.stats || {}),
            rarity: ItemRarity.LEGENDARY
        }));
    }

    getMarkDisplay(mark) {
        if (!mark) return { label: '', statsText: '', rarity: ItemRarity.RARE };

        if (mark.stats) {
            return {
                label: mark.affixName ? `傳說能力：${mark.affixName}` : (mark.label || '強化能力'),
                statsText: this.formatStatsPreview(mark.stats),
                rarity: mark.rarity || ItemRarity.LEGENDARY
            };
        }

        const preview = (ENHANCEMENT_MILESTONE_DISPLAY[mark.milestone] || [])
            .find(option => option.stat === mark.stat);

        return {
            label: preview?.label || mark.label || '強化能力',
            statsText: this.formatStatBonus(mark.stat, mark.value),
            rarity: mark.rarity || ItemRarity.RARE
        };
    }

    getMarkDescription(mark) {
        if (!mark) return '';
        const display = this.getMarkDisplay(mark);
        return display.statsText ? `${display.label}：${display.statsText}` : display.label;
    }

    formatStatBonus(stat, value) {
        const label = STAT_DISPLAY_LABELS[stat] || STAT_LABELS[stat] || stat;
        if (stat === 'noDurabilityLoss') return label;
        if (Array.isArray(value)) {
            const [min, max] = value;
            const suffix = PERCENT_STATS.has(stat) ? '%' : '';
            return `${label} +${min}-${max}${suffix}`;
        }
        const suffix = PERCENT_STATS.has(stat) ? '%' : '';
        return `${label} +${value}${suffix}`;
    }

    formatStatsPreview(stats = {}) {
        const entries = Object.entries(stats);
        if (entries.length === 0) return '傳說詞綴效果';
        return entries
            .map(([stat, value]) => this.formatStatBonus(stat, value))
            .join('、');
    }
}

export const enhancementManager = new EnhancementManager();

export { EnhancementManager as EnhancementSystem };
export const enhancementSystem = enhancementManager;
export default EnhancementManager;
