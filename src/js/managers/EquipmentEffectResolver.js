import { SetDatabase } from '../data/Equipment.js';
import { calculateActiveSetBonuses } from '../data/EquipmentBalance.js';
import { getPassiveCombatEffects } from '../data/PassiveCombatEffects.js';
import { AffixStat } from '../models/Enums.js';
import { normalizeItemType, readItemStat, readNumber } from '../models/ItemSchema.js';

const FLAT_KEYS = new Set(['atk', 'def', 'hp', 'void']);

const FRACTION_KEYS = new Set([
    'atkPercent',
    'defPercent',
    'hpPercent',
    'critChance',
    'critDamage',
    'attackSpeed',
    'allStats'
]);

const PERCENT_INT_KEYS = new Set([
    'lifesteal',
    'damageReduction',
    'armorPenetration',
    'dodgeChance',
    'double_strike',
    'execute',
    'damage_reflect',
    'gold_bonus',
    'exp_bonus',
    'drop_bonus',
    'revive',
    'hpRegen',
    'slowChance',
    'stunChance',
    'bossBonus',
    'fire',
    'ice',
    'thunder',
    'light',
    'poison'
]);

const STAT_ALIASES = {
    attack: 'atk',
    atk: 'atk',
    defense: 'def',
    def: 'def',
    hp: 'hp',
    hpbonus: 'hpPercent',
    hp_bonus: 'hpPercent',
    attackbonus: 'atkPercent',
    attack_bonus: 'atkPercent',
    atkbonus: 'atkPercent',
    defensebonus: 'defPercent',
    defense_bonus: 'defPercent',
    defbonus: 'defPercent',
    critchance: 'critChance',
    crit_chance: 'critChance',
    critdamage: 'critDamage',
    crit_damage: 'critDamage',
    attackspeed: 'attackSpeed',
    attack_speed: 'attackSpeed',
    attackspeedbonus: 'attackSpeed',
    attack_speed_bonus: 'attackSpeed',
    lifesteal: 'lifesteal',
    life_steal: 'lifesteal',
    lifestealbonus: 'lifesteal',
    life_steal_bonus: 'lifesteal',
    damagereduction: 'damageReduction',
    damage_reduction: 'damageReduction',
    damagereduce: 'damageReduction',
    damage_reduce: 'damageReduction',
    damagereducebonus: 'damageReduction',
    damage_reduce_bonus: 'damageReduction',
    dodgechance: 'dodgeChance',
    dodge_chance: 'dodgeChance',
    armorpenetration: 'armorPenetration',
    armor_penetration: 'armorPenetration',
    armorpierce: 'armorPenetration',
    armor_pierce: 'armorPenetration',
    armorpiercebonus: 'armorPenetration',
    armor_pierce_bonus: 'armorPenetration',
    doublestrike: 'double_strike',
    double_strike: 'double_strike',
    execute: 'execute',
    damagereflect: 'damage_reflect',
    damage_reflect: 'damage_reflect',
    goldbonus: 'gold_bonus',
    gold_bonus: 'gold_bonus',
    expbonus: 'exp_bonus',
    exp_bonus: 'exp_bonus',
    dropbonus: 'drop_bonus',
    drop_bonus: 'drop_bonus',
    revive: 'revive',
    allstats: 'allStats',
    all_stats: 'allStats',
    allstatsbonus: 'allStats',
    all_stats_bonus: 'allStats',
    hpregen: 'hpRegen',
    hp_regen: 'hpRegen',
    hpregenbonus: 'hpRegen',
    hp_regen_bonus: 'hpRegen',
    slowchance: 'slowChance',
    slow_chance: 'slowChance',
    stunchance: 'stunChance',
    stun_chance: 'stunChance',
    bossbonus: 'bossBonus',
    boss_bonus: 'bossBonus',
    voiddamage: 'void',
    void_damage: 'void',
    fire: 'fire',
    ice: 'ice',
    thunder: 'thunder',
    light: 'light',
    poison: 'poison',
    void: 'void',
    nodurabilityloss: 'noDurabilityLoss',
    no_durability_loss: 'noDurabilityLoss'
};

for (const value of Object.values(AffixStat || {})) {
    const normalized = normalizeStatKey(value);
    if (normalized) STAT_ALIASES[String(value).toLowerCase()] = normalized;
}

export function normalizePercentInt(value) {
    const number = readNumber(value, 0);
    if (number === 0) return 0;
    return Math.abs(number) <= 1 ? number * 100 : number;
}

export function normalizePercentFraction(value) {
    const number = readNumber(value, 0);
    if (number === 0) return 0;
    return Math.abs(number) > 1 ? number / 100 : number;
}

export function normalizeStatKey(key) {
    if (!key) return null;
    const compact = String(key).replace(/[\s-]/g, '').toLowerCase();
    const underscored = String(key).replace(/[\s-]/g, '_').toLowerCase();
    return STAT_ALIASES[compact] || STAT_ALIASES[underscored] || String(key);
}

export function createEmptyEquipmentEffectTotals() {
    return {
        atk: 0,
        def: 0,
        hp: 0,
        atkPercent: 0,
        defPercent: 0,
        hpPercent: 0,
        critChance: 0,
        critDamage: 0,
        attackSpeed: 0,
        allStats: 0,
        lifesteal: 0,
        damageReduction: 0,
        armorPenetration: 0,
        dodgeChance: 0,
        doubleStrike: 0,
        execute: 0,
        damageReflect: 0,
        goldBonus: 0,
        expBonus: 0,
        dropBonus: 0,
        revive: 0,
        hpRegen: 0,
        slowChance: 0,
        stunChance: 0,
        bossBonus: 0,
        fire: 0,
        ice: 0,
        thunder: 0,
        light: 0,
        poison: 0,
        void: 0,
        noDurabilityLoss: false,
        passiveBonuses: {},
        extra: {},
        sources: []
    };
}

function canonicalOutputKey(key) {
    return {
        double_strike: 'doubleStrike',
        damage_reflect: 'damageReflect',
        gold_bonus: 'goldBonus',
        exp_bonus: 'expBonus',
        drop_bonus: 'dropBonus'
    }[key] || key;
}

function addStat(totals, rawKey, rawValue, source = {}) {
    const key = normalizeStatKey(rawKey);
    if (!key) return;

    if (key === 'noDurabilityLoss') {
        totals.noDurabilityLoss = totals.noDurabilityLoss || Boolean(readNumber(rawValue, rawValue === true ? 1 : 0));
        return;
    }

    const outputKey = canonicalOutputKey(key);
    let value = readNumber(rawValue, 0);
    if (!Number.isFinite(value) || value === 0) return;

    if (FLAT_KEYS.has(key)) {
        totals[outputKey] = (totals[outputKey] || 0) + value;
    } else if (FRACTION_KEYS.has(key)) {
        totals[outputKey] = (totals[outputKey] || 0) + normalizePercentFraction(value);
    } else if (PERCENT_INT_KEYS.has(key)) {
        totals[outputKey] = (totals[outputKey] || 0) + normalizePercentInt(value);
    } else {
        totals.extra[outputKey] = (totals.extra[outputKey] || 0) + value;
    }

    if (source.itemId || source.kind) {
        totals.sources.push({ key: outputKey, value, ...source });
    }
}

function collectStatMap(totals, statMap, source = {}) {
    if (!statMap || typeof statMap !== 'object') return;
    for (const [key, value] of Object.entries(statMap)) {
        addStat(totals, key, value, source);
    }
}

function collectBaseStats(totals, item) {
    addStat(totals, 'atk', readItemStat(item, 'attack', [], 0), { kind: 'base', itemId: item.id });
    addStat(totals, 'def', readItemStat(item, 'defense', [], 0), { kind: 'base', itemId: item.id });
    addStat(totals, 'hp', readItemStat(item, 'hp', [], 0), { kind: 'base', itemId: item.id });
    addStat(totals, 'critChance', readItemStat(item, 'critChance', ['crit_chance'], 0), { kind: 'base', itemId: item.id });

    const critDamage = readItemStat(item, 'critDamage', ['crit_damage'], 0);
    if (critDamage) {
        const extraCritDamage = Math.abs(critDamage) > 1 ? critDamage - 1.5 : critDamage;
        addStat(totals, 'critDamage', extraCritDamage, { kind: 'base', itemId: item.id });
    }
}

function collectItemEffects(totals, item, options = {}) {
    if (!item) return;
    const sourceBase = { itemId: item.id || item.name || 'unknown' };

    if (options.includeBaseStats) {
        collectBaseStats(totals, item);
    }

    collectStatMap(totals, item.affixBonuses, { ...sourceBase, kind: 'affixBonuses' });
    collectStatMap(totals, item.enhancementBonuses, { ...sourceBase, kind: 'enhancementBonuses' });

    if (Array.isArray(item.affixes)) {
        item.affixes.forEach(affix => {
            collectStatMap(totals, affix?.stats, {
                ...sourceBase,
                kind: 'affix',
                affixId: affix?.id,
                affixName: affix?.name
            });
        });
    }

    if (Array.isArray(item.specialEffects)) {
        item.specialEffects.forEach(effect => {
            addStat(totals, effect?.type, effect?.value, {
                ...sourceBase,
                kind: 'specialEffect'
            });
        });
    }

}

function collectSetEffects(totals, character) {
    const setData = calculateActiveSetBonuses(character, SetDatabase);
    collectStatMap(totals, setData.bonuses, { kind: 'setBonus' });
    return setData;
}

function collectPassiveEffects(totals, character) {
    const equippedIds = Array.isArray(character?.equippedPassiveEffectIds)
        ? character.equippedPassiveEffectIds
        : [];
    const passiveEffects = getPassiveCombatEffects(equippedIds);

    passiveEffects.forEach(effect => {
        for (const [key, value] of Object.entries(effect?.bonuses || {})) {
            const normalizedKey = normalizeStatKey(key);
            if (
                FLAT_KEYS.has(normalizedKey)
                || FRACTION_KEYS.has(normalizedKey)
                || PERCENT_INT_KEYS.has(normalizedKey)
            ) {
                addStat(totals, normalizedKey, value, {
                    kind: 'passiveCombatEffect',
                    effectId: effect.id
                });
            } else {
                totals.passiveBonuses[key] = (totals.passiveBonuses[key] || 0) + readNumber(value, 0);
            }
        }
    });

    return passiveEffects;
}

export function getEquippedItems(character) {
    return Object.entries(character?.equipment || {})
        .filter(([slotType, item]) => {
            if (!item) return false;
            return !(slotType === 'armor' && normalizeItemType(item.type) === 'weapon');
        })
        .map(([, item]) => item);
}

export function getEquipmentEffectTotals(character, options = {}) {
    const totals = createEmptyEquipmentEffectTotals();

    getEquippedItems(character).forEach(item => {
        collectItemEffects(totals, item, options);
    });

    if (options.includeSetBonuses !== false) {
        collectSetEffects(totals, character);
    }

    if (options.includePassiveEffects !== false) {
        collectPassiveEffects(totals, character);
    }

    return totals;
}

export function getRewardEffectTotals(character) {
    const totals = getEquipmentEffectTotals(character);
    return {
        goldBonus: totals.goldBonus,
        expBonus: totals.expBonus,
        dropBonus: totals.dropBonus
    };
}

export default {
    createEmptyEquipmentEffectTotals,
    getEquippedItems,
    getEquipmentEffectTotals,
    getRewardEffectTotals,
    normalizePercentFraction,
    normalizePercentInt,
    normalizeStatKey
};
