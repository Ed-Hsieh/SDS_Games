/**
 * CharacterLogic.js
 * Pure helpers for character combat stats, buffs, equipment, passive combat effects, and growth.
 *
 * This module intentionally does not import DataModel.js. DataModel owns the
 * concrete classes, while this file only operates on character-shaped objects.
 */
import { normalizeItemType, readItemStat, readNumber } from './ItemSchema.js';
import { SetDatabase } from '../data/Equipment.js';
import { calculateActiveSetBonuses } from '../data/EquipmentBalance.js';
import {
    DefaultEquippedPassiveCombatEffectIds,
    DefaultUnlockedPassiveCombatEffectIds,
    PassiveCombatEffectSlotCount,
    getPassiveCombatEffect,
    getPassiveCombatEffects
} from '../data/PassiveCombatEffects.js';

function toPercentInt(raw) {
    const number = readNumber(raw);
    if (number === 0) return 0;
    if (Math.abs(number) <= 1) return number * 100;
    return number;
}

function toFraction(raw) {
    const number = readNumber(raw);
    if (number === 0) return 0;
    if (Math.abs(number) > 1) return number / 100;
    return number;
}

function normalizeEquipmentSlot(item) {
    if (!item) return null;
    return normalizeItemType(item.type);
}

function getSetBonusTotals(character) {
    return calculateActiveSetBonuses(character, SetDatabase).bonuses;
}

function getEquipmentBonus(item, stat) {
    return readNumber(item?.affixBonuses?.[stat]) + readNumber(item?.enhancementBonuses?.[stat]);
}

function getPassiveBonus(character, stat) {
    return getActivePassiveCombatEffects(character).reduce((sum, effect) => {
        return sum + readNumber(effect?.bonuses?.[stat]);
    }, 0);
}

export function getTotalAtk(character) {
    let total = readNumber(character.baseAtk);
    const setBonuses = getSetBonusTotals(character);
    let enhancementAllStats = 0;
    Object.values(character.equipment || {}).forEach(item => {
        total += readItemStat(item, 'atk', 'attack');
        total += getEquipmentBonus(item, 'atk');
        enhancementAllStats += toFraction(item?.enhancementBonuses?.allStats);
    });
    total += readNumber(setBonuses.atk);
    total = Math.floor(total * (1 + toFraction(setBonuses.atkPercent) + toFraction(setBonuses.allStats) + enhancementAllStats + toFraction(getPassiveBonus(character, 'atkPercent'))));
    total += readNumber(getPassiveBonus(character, 'atk'));
    total += getBuffValue(character, 'atk');
    return total;
}

export function getTotalDef(character) {
    let total = readNumber(character.baseDef);
    const setBonuses = getSetBonusTotals(character);
    let enhancementAllStats = 0;
    Object.values(character.equipment || {}).forEach(item => {
        total += readItemStat(item, 'def', 'defense');
        total += getEquipmentBonus(item, 'def');
        enhancementAllStats += toFraction(item?.enhancementBonuses?.allStats);
    });
    total += readNumber(setBonuses.def);
    total = Math.floor(total * (1 + toFraction(setBonuses.defPercent) + toFraction(setBonuses.allStats) + enhancementAllStats + toFraction(getPassiveBonus(character, 'defPercent'))));
    total += readNumber(getPassiveBonus(character, 'def'));
    total += getBuffValue(character, 'def');
    return total;
}

export function getCritChance(character) {
    let totalCritChance = 0.05;
    const setBonuses = getSetBonusTotals(character);
    Object.values(character.equipment || {}).forEach(item => {
        totalCritChance += toFraction(readItemStat(item, 'critChance', 'crit_chance'));
        totalCritChance += toFraction(getEquipmentBonus(item, 'critChance'));
    });
    totalCritChance += toFraction(setBonuses.critChance);
    totalCritChance += toFraction(getPassiveBonus(character, 'critChance'));
    totalCritChance += toFraction(getBuffValue(character, 'critChance'));
    return Math.min(totalCritChance, 1.0);
}

export function getCritDamage(character) {
    let totalCritDamage = 1.5;
    let additionalCritDamage = 0;
    const setBonuses = getSetBonusTotals(character);
    Object.values(character.equipment || {}).forEach(item => {
        const critDamage = readItemStat(item, 'critDamage', 'crit_damage');
        if (critDamage) additionalCritDamage += critDamage - 1.5;
        additionalCritDamage += toFraction(getEquipmentBonus(item, 'critDamage'));
    });
    additionalCritDamage += toFraction(setBonuses.critDamage);
    additionalCritDamage += toFraction(getPassiveBonus(character, 'critDamage'));
    additionalCritDamage += toFraction(getBuffValue(character, 'critDamage'));
    return totalCritDamage + additionalCritDamage;
}

export function getWeaponSpeed(character) {
    const weapon = character.equipment?.weapon;
    return readNumber(weapon?.weaponSpeed, 1.0) || 1.0;
}

export function getAttackSpeed(character) {
    let baseSpeed = 1.0;
    const setBonuses = getSetBonusTotals(character);
    const weapon = character.equipment?.weapon;
    if (weapon?.attackSpeed) {
        baseSpeed = readNumber(weapon.attackSpeed, 1.0);
    }
    let speedBonus = 0;
    Object.values(character.equipment || {}).forEach(item => {
        speedBonus += toFraction(getEquipmentBonus(item, 'attackSpeed'));
    });
    speedBonus += toFraction(setBonuses.attackSpeed);
    speedBonus += toFraction(getPassiveBonus(character, 'attackSpeed'));
    speedBonus += toFraction(getBuffValue(character, 'attackSpeed'));
    return Math.max(0.1, baseSpeed * (1 + speedBonus));
}

export function getAttackInterval(character) {
    return 1 / getAttackSpeed(character);
}

export function getLifesteal(character) {
    let lifesteal = 0;
    const setBonuses = getSetBonusTotals(character);
    Object.values(character.equipment || {}).forEach(item => {
        if (!item) return;

        if (item.lifesteal !== undefined && item.lifesteal !== null) lifesteal += toPercentInt(item.lifesteal);
        if (item.lifeStealBonus !== undefined && item.lifeStealBonus !== null) lifesteal += toPercentInt(item.lifeStealBonus);

        if (item.affixBonuses) {
            if (item.affixBonuses.lifesteal !== undefined && item.affixBonuses.lifesteal !== null) lifesteal += toPercentInt(item.affixBonuses.lifesteal);
            if (item.affixBonuses.lifeStealBonus !== undefined && item.affixBonuses.lifeStealBonus !== null) lifesteal += toPercentInt(item.affixBonuses.lifeStealBonus);
        }
        if (item.enhancementBonuses) {
            if (item.enhancementBonuses.lifesteal !== undefined && item.enhancementBonuses.lifesteal !== null) lifesteal += toPercentInt(item.enhancementBonuses.lifesteal);
            if (item.enhancementBonuses.lifeStealBonus !== undefined && item.enhancementBonuses.lifeStealBonus !== null) lifesteal += toPercentInt(item.enhancementBonuses.lifeStealBonus);
        }

        if (Array.isArray(item.affixes)) {
            for (const affix of item.affixes) {
                if (!affix?.stats) continue;
                if (affix.stats.lifesteal !== undefined && affix.stats.lifesteal !== null) lifesteal += toPercentInt(affix.stats.lifesteal);
                if (affix.stats.lifeStealBonus !== undefined && affix.stats.lifeStealBonus !== null) lifesteal += toPercentInt(affix.stats.lifeStealBonus);
            }
        }

        if (Array.isArray(item.specialEffects)) {
            for (const effect of item.specialEffects) {
                const type = String(effect?.type || '').toLowerCase();
                if ((type.includes('life') && type.includes('steal')) || type === 'lifesteal' || type === 'life_steal') {
                    lifesteal += toPercentInt(effect.value);
                }
            }
        }
    });

    lifesteal += toPercentInt(setBonuses.lifesteal);
    return lifesteal;
}

export function getDamageReduction(character) {
    let reduction = 0;
    const setBonuses = getSetBonusTotals(character);
    Object.values(character.equipment || {}).forEach(item => {
        if (!item) return;
        if (item.damageReduction !== undefined && item.damageReduction !== null) reduction += toPercentInt(item.damageReduction) / 100;
        if (item.affixBonuses?.damageReduction !== undefined && item.affixBonuses.damageReduction !== null) {
            reduction += toPercentInt(item.affixBonuses.damageReduction) / 100;
        }
        if (item.enhancementBonuses?.damageReduction !== undefined && item.enhancementBonuses.damageReduction !== null) {
            reduction += toPercentInt(item.enhancementBonuses.damageReduction) / 100;
        }
    });
    reduction += toPercentInt(setBonuses.damageReduction) / 100;
    return Math.min(reduction, 0.75);
}

export function getAffixHpBonus(character) {
    let bonus = 0;
    const setBonuses = getSetBonusTotals(character);
    let enhancementAllStats = 0;
    Object.values(character.equipment || {}).forEach(item => {
        bonus += readNumber(readItemStat(item, 'hp', [], 0));
        bonus += getEquipmentBonus(item, 'hp');
        enhancementAllStats += toFraction(item?.enhancementBonuses?.allStats);
    });
    bonus += readNumber(setBonuses.hp);
    if (enhancementAllStats > 0) {
        bonus = Math.floor(bonus * (1 + enhancementAllStats));
    }
    return bonus;
}

export function addBuff(character, buffType, buffValue, duration) {
    if (!character.activeBuffs) character.activeBuffs = [];
    const existingBuff = character.activeBuffs.find(buff => buff.type === buffType);
    if (existingBuff) {
        existingBuff.value = Math.max(existingBuff.value, buffValue);
        existingBuff.duration = Math.max(existingBuff.duration, duration);
    } else {
        character.activeBuffs.push({ type: buffType, value: buffValue, duration });
    }
}

export function getBuffValue(character, buffType) {
    if (!character.activeBuffs) return 0;
    const buff = character.activeBuffs.find(item => item.type === buffType);
    return buff ? buff.value : 0;
}

export function tickBuffs(character) {
    if (!character.activeBuffs) return;
    character.activeBuffs = character.activeBuffs.filter(buff => {
        buff.duration--;
        return buff.duration > 0;
    });
}

export function clearAllBuffs(character) {
    character.activeBuffs = [];
}

export function initDefaultSkills(character, createDefaultSkills = null) {
    initPassiveCombatEffects(character);
    character.skills = [];
}

export function useSkill(character, skillIndex, target) {
    return null;
}

export function tickSkillCooldowns(character) {
    return;
}

export function initPassiveCombatEffects(character) {
    if (!Array.isArray(character.unlockedPassiveEffectIds)) {
        character.unlockedPassiveEffectIds = [...DefaultUnlockedPassiveCombatEffectIds];
    }
    if (!Array.isArray(character.equippedPassiveEffectIds)) {
        character.equippedPassiveEffectIds = [...DefaultEquippedPassiveCombatEffectIds];
    }
    character.passiveEffectSlots = Math.max(1, Number(character.passiveEffectSlots) || PassiveCombatEffectSlotCount);
    character.equippedPassiveEffectIds = character.equippedPassiveEffectIds
        .filter(effectId => character.unlockedPassiveEffectIds.includes(effectId))
        .slice(0, character.passiveEffectSlots);
}

export function getActivePassiveCombatEffects(character) {
    initPassiveCombatEffects(character);
    return getPassiveCombatEffects(character.equippedPassiveEffectIds);
}

export function unlockPassiveCombatEffect(character, effectId) {
    if (!getPassiveCombatEffect(effectId)) return false;
    initPassiveCombatEffects(character);
    if (!character.unlockedPassiveEffectIds.includes(effectId)) {
        character.unlockedPassiveEffectIds.push(effectId);
    }
    return true;
}

export function equipPassiveCombatEffect(character, effectId, slotIndex = 0) {
    const effect = getPassiveCombatEffect(effectId);
    if (!effect) return false;
    initPassiveCombatEffects(character);
    if (!character.unlockedPassiveEffectIds.includes(effectId)) return false;

    const index = Math.max(0, Math.min(character.passiveEffectSlots - 1, Number(slotIndex) || 0));
    const nextIds = [...character.equippedPassiveEffectIds];
    const duplicateIndex = nextIds.indexOf(effectId);
    if (duplicateIndex >= 0 && duplicateIndex !== index) nextIds[duplicateIndex] = null;
    nextIds[index] = effectId;
    character.equippedPassiveEffectIds = nextIds.filter(Boolean).slice(0, character.passiveEffectSlots);
    return true;
}

export function equip(character, item) {
    if (!item?.isEquipment || !item.isEquipment()) return false;
    const slot = normalizeEquipmentSlot(item);
    if (character.equipment && Object.prototype.hasOwnProperty.call(character.equipment, slot)) {
        character.equipment[slot] = item;
        return true;
    }
    return false;
}

export function unequip(character, slotType) {
    if (!character.equipment) return null;
    const item = character.equipment[slotType];
    character.equipment[slotType] = null;
    return item;
}

export function useItem(character, item) {
    if (!item.effect) return false;

    if (item.effect.hp) {
        const maxHp = character.maxHp || calculateMaxHp(character);
        character.hp = Math.min(maxHp, (character.hp || 0) + item.effect.hp);
    }
    if (item.effect.exp) {
        character.exp = (character.exp || 0) + item.effect.exp;
        checkLevelUp(character);
    }
    return true;
}

export function calculateMaxHp(character) {
    return 100 + ((character.level || 1) * 20);
}

export function calculateMaxMp(character) {
    return 0;
}

export function calculateMaxExp(character) {
    return Math.floor(100 * Math.pow(1.2, (character.level || 1) - 1));
}

export function checkLevelUp(character) {
    const getMaxExp = () => calculateMaxExp(character);
    while ((character.exp || 0) >= getMaxExp()) {
        character.level = (character.level || 1) + 1;
        character.exp -= getMaxExp();
        character.maxHp = calculateMaxHp(character);
        character.hp = character.maxHp;
        character.maxExp = calculateMaxExp(character);
    }
}

export function gainExp(character, amount) {
    const oldLevel = character.level || 1;
    character.exp = (character.exp || 0) + amount;
    checkLevelUp(character);
    return character.level > oldLevel;
}

export function syncProperties(character) {
    character._attack = getTotalAtk(character);
    character._defense = getTotalDef(character);
}

export class CharacterHelper {
    constructor(characterData) {
        this.data = characterData;
    }

    getTotalAtk() { return getTotalAtk(this.data); }
    getTotalDef() { return getTotalDef(this.data); }
    getCritChance() { return getCritChance(this.data); }
    getCritDamage() { return getCritDamage(this.data); }
    getWeaponSpeed() { return getWeaponSpeed(this.data); }
    getAttackSpeed() { return getAttackSpeed(this.data); }
    getAttackInterval() { return getAttackInterval(this.data); }
    getLifesteal() { return getLifesteal(this.data); }
    getDamageReduction() { return getDamageReduction(this.data); }
    getAffixHpBonus() { return getAffixHpBonus(this.data); }
    getActivePassiveCombatEffects() { return getActivePassiveCombatEffects(this.data); }

    addBuff(type, value, duration) { return addBuff(this.data, type, value, duration); }
    getBuffValue(type) { return getBuffValue(this.data, type); }
    tickBuffs() { return tickBuffs(this.data); }
    clearAllBuffs() { return clearAllBuffs(this.data); }

    useSkill(index, target) { return useSkill(this.data, index, target); }
    tickSkillCooldowns() { return tickSkillCooldowns(this.data); }
    equipPassiveCombatEffect(effectId, slotIndex) { return equipPassiveCombatEffect(this.data, effectId, slotIndex); }
    unlockPassiveCombatEffect(effectId) { return unlockPassiveCombatEffect(this.data, effectId); }

    equip(item) { return equip(this.data, item); }
    unequip(slot) { return unequip(this.data, slot); }
    useItem(item) { return useItem(this.data, item); }

    checkLevelUp() { return checkLevelUp(this.data); }
    gainExp(amount) { return gainExp(this.data, amount); }
    calculateMaxHp() { return calculateMaxHp(this.data); }
    syncProperties() { return syncProperties(this.data); }
}

export default {
    getTotalAtk,
    getTotalDef,
    getCritChance,
    getCritDamage,
    getWeaponSpeed,
    getAttackSpeed,
    getAttackInterval,
    getLifesteal,
    getDamageReduction,
    getAffixHpBonus,
    addBuff,
    getBuffValue,
    tickBuffs,
    clearAllBuffs,
    initDefaultSkills,
    useSkill,
    tickSkillCooldowns,
    initPassiveCombatEffects,
    getActivePassiveCombatEffects,
    unlockPassiveCombatEffect,
    equipPassiveCombatEffect,
    equip,
    unequip,
    useItem,
    calculateMaxHp,
    calculateMaxMp,
    calculateMaxExp,
    checkLevelUp,
    gainExp,
    syncProperties,
    CharacterHelper
};
