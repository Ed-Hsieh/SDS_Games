/**
 * EquipmentBalance.js
 * Central tuning table for equipment growth, rarity power, affix rolls, and set bonuses.
 */

import { AffixStat, EquipmentType, ItemRarity, ItemType } from '../models/Enums.js';

export const RARITY_SEQUENCE = [
    ItemRarity.COMMON,
    ItemRarity.UNCOMMON,
    ItemRarity.RARE,
    ItemRarity.EPIC,
    ItemRarity.LEGENDARY
];

export const RARITY_BALANCE = {
    [ItemRarity.COMMON]: {
        label: '普通',
        power: 1.00,
        price: 1.00,
        durabilityBase: 40,
        affixCount: { min: 0, max: 1 },
        affixSlots: { prefix: 0, suffix: 1 },
        affixWeights: { common: 70, uncommon: 25, rare: 5, epic: 0, legendary: 0 }
    },
    [ItemRarity.UNCOMMON]: {
        label: '優秀',
        power: 1.18,
        price: 1.35,
        durabilityBase: 50,
        affixCount: { min: 1, max: 2 },
        affixSlots: { prefix: 1, suffix: 1 },
        affixWeights: { common: 50, uncommon: 35, rare: 12, epic: 3, legendary: 0 }
    },
    [ItemRarity.RARE]: {
        label: '稀有',
        power: 1.42,
        price: 1.85,
        durabilityBase: 60,
        affixCount: { min: 1, max: 3 },
        affixSlots: { prefix: 1, suffix: 2 },
        affixWeights: { common: 30, uncommon: 35, rare: 25, epic: 8, legendary: 2 }
    },
    [ItemRarity.EPIC]: {
        label: '史詩',
        power: 1.72,
        price: 2.55,
        durabilityBase: 70,
        affixCount: { min: 2, max: 4 },
        affixSlots: { prefix: 2, suffix: 2 },
        affixWeights: { common: 10, uncommon: 25, rare: 35, epic: 25, legendary: 5 }
    },
    [ItemRarity.LEGENDARY]: {
        label: '傳說',
        power: 2.12,
        price: 3.60,
        durabilityBase: 80,
        affixCount: { min: 3, max: 5 },
        affixSlots: { prefix: 2, suffix: 3 },
        affixWeights: { common: 0, uncommon: 10, rare: 30, epic: 40, legendary: 20 }
    }
};

export const EQUIPMENT_LEVEL_BANDS = [
    {
        id: 'novice',
        label: '入門',
        min: 1,
        max: 4,
        expectedRarities: [ItemRarity.COMMON, ItemRarity.UNCOMMON],
        weaponAttack: [4, 13],
        armorDefense: [4, 13]
    },
    {
        id: 'apprentice',
        label: '成長',
        min: 5,
        max: 9,
        expectedRarities: [ItemRarity.UNCOMMON, ItemRarity.RARE],
        weaponAttack: [12, 24],
        armorDefense: [10, 22]
    },
    {
        id: 'veteran',
        label: '熟練',
        min: 10,
        max: 14,
        expectedRarities: [ItemRarity.RARE, ItemRarity.EPIC],
        weaponAttack: [22, 36],
        armorDefense: [20, 36]
    },
    {
        id: 'heroic',
        label: '英雄',
        min: 15,
        max: 22,
        expectedRarities: [ItemRarity.EPIC, ItemRarity.LEGENDARY],
        weaponAttack: [34, 58],
        armorDefense: [32, 54]
    },
    {
        id: 'mythic',
        label: '終局',
        min: 23,
        max: 30,
        expectedRarities: [ItemRarity.EPIC, ItemRarity.LEGENDARY],
        weaponAttack: [54, 82],
        armorDefense: [50, 78]
    }
];

export const EQUIPMENT_TYPE_BALANCE = {
    [ItemType.WEAPON]: {
        label: '武器',
        durabilityBonus: 8,
        attackBase: 3.5,
        attackPerLevel: 1.85,
        defenseBase: 0,
        defensePerLevel: 0.15,
        hpPerLevel: 0,
        priceBase: 32,
        statWeights: { attack: 1, defense: 0.45, hp: 0.08, critChance: 85, critDamage: 24 }
    },
    [ItemType.ARMOR]: {
        label: '防具',
        durabilityBonus: 12,
        attackBase: 0,
        attackPerLevel: 0.35,
        defenseBase: 4,
        defensePerLevel: 1.72,
        hpPerLevel: 4,
        priceBase: 36,
        statWeights: { attack: 0.85, defense: 1, hp: 0.10, critChance: 70, critDamage: 18 }
    },
    [ItemType.ACCESSORY]: {
        label: '飾品',
        durabilityBonus: 0,
        attackBase: 1,
        attackPerLevel: 0.75,
        defenseBase: 1,
        defensePerLevel: 0.65,
        hpPerLevel: 3,
        priceBase: 42,
        statWeights: { attack: 0.9, defense: 0.9, hp: 0.09, critChance: 95, critDamage: 28 }
    }
};

export const AFFIX_STAT_KEYS = [
    AffixStat.ATK,
    AffixStat.DEF,
    AffixStat.HP,
    AffixStat.CRIT_CHANCE,
    AffixStat.CRIT_DAMAGE,
    AffixStat.ATTACK_SPEED,
    AffixStat.LIFE_STEAL,
    AffixStat.DAMAGE_REDUCTION,
    AffixStat.DODGE_CHANCE,
    AffixStat.ARMOR_PENETRATION,
    AffixStat.DOUBLE_STRIKE,
    AffixStat.EXECUTE,
    AffixStat.DAMAGE_REFLECT,
    AffixStat.GOLD_BONUS,
    AffixStat.EXP_BONUS,
    AffixStat.DROP_BONUS,
    AffixStat.REVIVE,
    AffixStat.ALL_STATS,
    AffixStat.HP_REGEN,
    AffixStat.SLOW_CHANCE,
    AffixStat.STUN_CHANCE,
    AffixStat.BOSS_BONUS,
    AffixStat.FIRE,
    AffixStat.ICE,
    AffixStat.THUNDER,
    AffixStat.LIGHT,
    AffixStat.POISON,
    AffixStat.VOID,
    AffixStat.VOID_DAMAGE
].filter(Boolean);

export function normalizeEquipmentKind(type) {
    const normalized = String(type || '').toLowerCase();
    if (normalized === EquipmentType.WEAPON || normalized === ItemType.WEAPON) return ItemType.WEAPON;
    if (normalized === EquipmentType.ACCESSORY || normalized === ItemType.ACCESSORY) return ItemType.ACCESSORY;
    if (normalized === EquipmentType.ARMOR || normalized === EquipmentType.EQUIPMENT || normalized === ItemType.ARMOR) {
        return ItemType.ARMOR;
    }
    return normalized || ItemType.ARMOR;
}

export function getRarityBalance(rarity = ItemRarity.COMMON) {
    return RARITY_BALANCE[rarity] || RARITY_BALANCE[ItemRarity.COMMON];
}

export function getRarityPower(rarity = ItemRarity.COMMON) {
    return getRarityBalance(rarity).power;
}

export function getAffixCountRange(rarity = ItemRarity.COMMON) {
    return getRarityBalance(rarity).affixCount;
}

export function getAffixSlots(rarity = ItemRarity.COMMON) {
    return getRarityBalance(rarity).affixSlots;
}

export function getAffixRarityWeights(rarity = ItemRarity.COMMON) {
    return getRarityBalance(rarity).affixWeights;
}

export function rollWeightedAffixRarity(equipmentRarity = ItemRarity.COMMON, rng = Math.random) {
    const weights = getAffixRarityWeights(equipmentRarity);
    const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    if (total <= 0) return ItemRarity.COMMON;

    const roll = rng() * total;
    let cumulative = 0;

    for (const [rarity, weight] of Object.entries(weights)) {
        cumulative += weight;
        if (roll < cumulative) return rarity;
    }

    return ItemRarity.COMMON;
}

export function getLevelBand(level = 1) {
    const resolvedLevel = Math.max(1, Number(level) || 1);
    return EQUIPMENT_LEVEL_BANDS.find(band => resolvedLevel >= band.min && resolvedLevel <= band.max)
        || EQUIPMENT_LEVEL_BANDS[EQUIPMENT_LEVEL_BANDS.length - 1];
}

export function createEmptyAffixBonuses(extraKeys = []) {
    const bonuses = {};
    for (const key of [...AFFIX_STAT_KEYS, ...extraKeys].filter(Boolean)) {
        bonuses[key] = 0;
    }
    return bonuses;
}

export function getDurabilityForEquipment(item, index = 0) {
    const rarity = item?.rarity || ItemRarity.COMMON;
    const level = Math.max(1, Number(item?.level || item?.requiredLevel) || 1);
    const kind = normalizeEquipmentKind(item?.type);
    const rarityBase = getRarityBalance(rarity).durabilityBase;
    const typeBonus = EQUIPMENT_TYPE_BALANCE[kind]?.durabilityBonus ?? 0;

    return rarityBase + typeBonus + Math.max(0, Math.floor(level / 2)) + (index % 7);
}

export function getRecommendedEquipmentStats(itemLike = {}) {
    const kind = normalizeEquipmentKind(itemLike.type);
    const typeBalance = EQUIPMENT_TYPE_BALANCE[kind] || EQUIPMENT_TYPE_BALANCE[ItemType.ARMOR];
    const rarityPower = getRarityPower(itemLike.rarity);
    const level = Math.max(1, Number(itemLike.level || itemLike.requiredLevel) || 1);

    return {
        attack: Math.round((typeBalance.attackBase + level * typeBalance.attackPerLevel) * rarityPower),
        defense: Math.round((typeBalance.defenseBase + level * typeBalance.defensePerLevel) * rarityPower),
        hp: Math.round(level * typeBalance.hpPerLevel * rarityPower),
        price: Math.round(typeBalance.priceBase * level * rarityPower * getRarityBalance(itemLike.rarity).price)
    };
}

export function getEquipmentPowerBudget(itemLike = {}) {
    const kind = normalizeEquipmentKind(itemLike.type);
    const typeBalance = EQUIPMENT_TYPE_BALANCE[kind] || EQUIPMENT_TYPE_BALANCE[ItemType.ARMOR];
    const stats = itemLike.stats || {};
    const attack = Number(itemLike.attack ?? itemLike.atk ?? stats.attack ?? stats.atk ?? 0) || 0;
    const defense = Number(itemLike.defense ?? itemLike.def ?? stats.defense ?? stats.def ?? 0) || 0;
    const hp = Number(itemLike.hp ?? stats.hp ?? 0) || 0;
    const critChance = Number(itemLike.critChance ?? stats.critChance ?? 0) || 0;
    const critDamage = Number(itemLike.critDamage ?? stats.critDamage ?? 1.5) || 1.5;
    const weights = typeBalance.statWeights;
    const recommended = getRecommendedEquipmentStats(itemLike);
    const score = attack * weights.attack
        + defense * weights.defense
        + hp * weights.hp
        + critChance * weights.critChance
        + Math.max(0, critDamage - 1.5) * weights.critDamage
        + (Array.isArray(itemLike.specialEffects) ? itemLike.specialEffects.length * 3 : 0);

    return {
        level: Math.max(1, Number(itemLike.level || itemLike.requiredLevel) || 1),
        band: getLevelBand(itemLike.level || itemLike.requiredLevel).id,
        rarity: itemLike.rarity || ItemRarity.COMMON,
        kind,
        score: Math.round(score * 10) / 10,
        recommended
    };
}

export function getEquipmentBalanceGrade(itemLike = {}) {
    const budget = getEquipmentPowerBudget(itemLike);
    const targetBudget = getEquipmentPowerBudget({
        ...itemLike,
        specialEffects: [],
        stats: {
            attack: budget.recommended.attack,
            defense: budget.recommended.defense,
            hp: budget.recommended.hp,
            critChance: itemLike.stats?.critChance ?? itemLike.critChance ?? 0,
            critDamage: itemLike.stats?.critDamage ?? itemLike.critDamage ?? 1.5
        }
    });
    const targetScore = Math.max(1, targetBudget.score);
    const ratio = budget.score / targetScore;
    let grade = 'OK';
    let severity = 'normal';

    if (ratio >= 1.65) {
        grade = '超標';
        severity = 'high';
    } else if (ratio >= 1.35) {
        grade = '偏強';
        severity = 'medium';
    } else if (ratio <= 0.65) {
        grade = '過弱';
        severity = 'high';
    } else if (ratio <= 0.85) {
        grade = '偏弱';
        severity = 'medium';
    }

    return {
        ...budget,
        targetScore: Math.round(targetScore * 10) / 10,
        ratio: Math.round(ratio * 100) / 100,
        grade,
        severity
    };
}

export function normalizePercentFraction(value) {
    const number = Number(value || 0);
    if (number === 0) return 0;
    return Math.abs(number) > 1 ? number / 100 : number;
}

export function normalizePercentInt(value) {
    const number = Number(value || 0);
    if (number === 0) return 0;
    return Math.abs(number) <= 1 ? number * 100 : number;
}

function emptySetBonuses() {
    return {
        atk: 0,
        atkPercent: 0,
        def: 0,
        defPercent: 0,
        hp: 0,
        hpPercent: 0,
        critChance: 0,
        critDamage: 0,
        attackSpeed: 0,
        lifesteal: 0,
        damageReduction: 0,
        armorPenetration: 0,
        expBonus: 0,
        goldBonus: 0,
        dropBonus: 0,
        elementalDamage: 0,
        shadowDamage: 0,
        undeadDamage: 0,
        dragonDamage: 0,
        allStats: 0,
        flags: {}
    };
}

export function normalizeSetEffects(effects = {}) {
    const normalized = emptySetBonuses();

    for (const [key, rawValue] of Object.entries(effects || {})) {
        const value = rawValue === true ? true : Number(rawValue || 0);

        switch (key) {
            case 'atk':
            case 'attack':
                normalized.atk += Number(value) || 0;
                break;
            case 'attackBonus':
                normalized.atkPercent += normalizePercentFraction(value);
                break;
            case 'def':
            case 'defense':
                normalized.def += Number(value) || 0;
                break;
            case 'defenseBonus':
                normalized.defPercent += normalizePercentFraction(value);
                break;
            case 'hp':
                normalized.hp += Number(value) || 0;
                break;
            case 'hpBonus':
                normalized.hpPercent += normalizePercentFraction(value);
                break;
            case 'critChance':
            case 'critChanceBonus':
                normalized.critChance += normalizePercentFraction(value);
                break;
            case 'critDamage':
            case 'critDamageBonus':
                normalized.critDamage += normalizePercentFraction(value);
                break;
            case 'attackSpeed':
            case 'attackSpeedBonus':
                normalized.attackSpeed += normalizePercentFraction(value);
                break;
            case 'attackSpeedPenalty':
                normalized.attackSpeed -= normalizePercentFraction(value);
                break;
            case 'lifesteal':
            case 'lifeStealBonus':
                normalized.lifesteal += normalizePercentInt(value);
                break;
            case 'damageReduction':
            case 'damageReduceBonus':
                normalized.damageReduction += normalizePercentInt(value);
                break;
            case 'armorPenetration':
            case 'armorPierceBonus':
                normalized.armorPenetration += normalizePercentInt(value);
                break;
            case 'expBonus':
                normalized.expBonus += normalizePercentInt(value);
                break;
            case 'goldBonus':
                normalized.goldBonus += normalizePercentInt(value);
                break;
            case 'dropBonus':
                normalized.dropBonus += normalizePercentInt(value);
                break;
            case 'elementalDamageBonus':
                normalized.elementalDamage += normalizePercentInt(value);
                break;
            case 'shadowDamageBonus':
                normalized.shadowDamage += normalizePercentInt(value);
                break;
            case 'undeadDamageBonus':
                normalized.undeadDamage += normalizePercentInt(value);
                break;
            case 'dragonDamageBonus':
                normalized.dragonDamage += normalizePercentInt(value);
                break;
            case 'allStatsBonus':
                normalized.allStats += normalizePercentFraction(value);
                break;
            default:
                if (value === true) normalized.flags[key] = true;
                else if (Number.isFinite(value)) normalized.flags[key] = value;
                break;
        }
    }

    return normalized;
}

function mergeSetBonuses(target, source) {
    for (const [key, value] of Object.entries(source)) {
        if (key === 'flags') {
            target.flags = { ...target.flags, ...value };
        } else if (typeof value === 'number') {
            target[key] = (target[key] || 0) + value;
        }
    }
    return target;
}

function normalizeBonusEntries(setInfo) {
    if (Array.isArray(setInfo?.bonuses)) {
        return setInfo.bonuses
            .map(bonus => ({
                required: Number(bonus.required) || 0,
                name: bonus.name || '',
                description: bonus.description || '',
                effects: bonus.effects || {}
            }))
            .sort((a, b) => a.required - b.required);
    }

    return Object.entries(setInfo?.bonuses || {})
        .map(([required, bonus]) => ({
            required: Number(required) || 0,
            name: bonus.name || '',
            description: bonus.description || '',
            effects: Object.fromEntries(Object.entries(bonus).filter(([key]) => key !== 'description' && key !== 'name'))
        }))
        .sort((a, b) => a.required - b.required);
}

export function calculateActiveSetBonuses(character, setDatabase = {}) {
    const equippedItems = Object.values(character?.equipment || {}).filter(Boolean);
    const equippedIds = new Set(equippedItems.map(item => item.id).filter(Boolean));
    const bonuses = emptySetBonuses();
    const descriptions = [];
    const active = [];

    for (const setInfo of Object.values(setDatabase || {})) {
        const pieces = Array.isArray(setInfo.pieces) ? setInfo.pieces : [];
        const equippedPieces = pieces.filter(pieceId => equippedIds.has(pieceId)).length;
        if (equippedPieces <= 0) continue;

        for (const entry of normalizeBonusEntries(setInfo)) {
            if (equippedPieces < entry.required) continue;

            const normalizedEffects = normalizeSetEffects(entry.effects);
            mergeSetBonuses(bonuses, normalizedEffects);

            const description = entry.description || entry.name;
            if (description) descriptions.push(`${setInfo.name} (${entry.required}件): ${description}`);
            active.push({
                setId: setInfo.id,
                setName: setInfo.name,
                required: entry.required,
                equippedPieces,
                name: entry.name,
                description,
                effects: normalizedEffects
            });
        }
    }

    return { bonuses, descriptions, active };
}
