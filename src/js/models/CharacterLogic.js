/**
 * CharacterLogic.js
 * Pure helpers for character combat stats, buffs, equipment, passive combat effects, and growth.
 *
 * This module intentionally does not import DataModel.js. DataModel owns the
 * concrete classes, while this file only operates on character-shaped objects.
 */
import { normalizeItemType, readItemStat, readNumber } from './ItemSchema.js';
import {
    DefaultEquippedPassiveCombatEffectIds,
    DefaultUnlockedPassiveCombatEffectIds,
    PassiveCombatEffectSlotCount,
    getPassiveCombatEffect,
    getPassiveCombatEffects
} from '../data/PassiveCombatEffects.js';
import { getEquipmentEffectTotals } from '../managers/EquipmentEffectResolver.js';
import { getLevelExperienceRequirement } from '../data/MonsterProgressionBalance.js';

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

export function getGlobalStatMultiplier(_character) {
    return 1;
}

export function applyGlobalStatMultiplier(character, value, options = {}) {
    const { integer = true, minimum = 0 } = options;
    const scaled = readNumber(value) * getGlobalStatMultiplier(character);
    const next = integer ? Math.floor(scaled) : scaled;
    return Math.max(minimum, next);
}

function normalizeEquipmentSlot(item) {
    if (!item) return null;
    return normalizeItemType(item.type);
}

export function isOffhandWeaponSlot(slotType, item) {
    return slotType === 'armor' && normalizeItemType(item?.type) === 'weapon';
}

export function getCombatStatEquipmentEntries(character, options = {}) {
    const includeOffhandWeapon = Boolean(options.includeOffhandWeapon);
    return Object.entries(character?.equipment || {}).filter(([slotType, item]) => {
        if (!item) return false;
        return includeOffhandWeapon || !isOffhandWeaponSlot(slotType, item);
    });
}

function getPassiveBonus(character, stat) {
    return getActivePassiveCombatEffects(character).reduce((sum, effect) => {
        return sum + readNumber(effect?.bonuses?.[stat]);
    }, 0);
}

export function getPassiveCombatBonus(character, stat) {
    return getPassiveBonus(character, stat);
}

function getResolvedEquipmentEffects(character, options = {}) {
    initPassiveCombatEffects(character);
    return getEquipmentEffectTotals(character, options);
}

export function getCombatEffectTotals(character) {
    return getResolvedEquipmentEffects(character);
}

export function getTotalAtk(character) {
    let total = readNumber(character.baseAtk);
    const effects = getResolvedEquipmentEffects(character);
    getCombatStatEquipmentEntries(character).forEach(([, item]) => {
        total += readItemStat(item, 'attack');
    });
    total += readNumber(effects.atk);
    total = Math.floor(total * (1 + toFraction(effects.atkPercent) + toFraction(effects.allStats)));
    total += getBuffValue(character, 'atk');
    return applyGlobalStatMultiplier(character, total, { minimum: 1 });
}

export function getTotalDef(character) {
    let total = readNumber(character.baseDef);
    const effects = getResolvedEquipmentEffects(character);
    getCombatStatEquipmentEntries(character).forEach(([, item]) => {
        total += readItemStat(item, 'defense');
    });
    total += readNumber(effects.def);
    total = Math.floor(total * (1 + toFraction(effects.defPercent) + toFraction(effects.allStats)));
    total += getBuffValue(character, 'def');
    return applyGlobalStatMultiplier(character, total, { minimum: 0 });
}

export function getCritChance(character) {
    let totalCritChance = 0.04;
    const effects = getResolvedEquipmentEffects(character);
    getCombatStatEquipmentEntries(character).forEach(([, item]) => {
        totalCritChance += toFraction(readItemStat(item, 'critChance', 'crit_chance'));
    });
    totalCritChance += toFraction(effects.critChance);
    totalCritChance += toFraction(getBuffValue(character, 'critChance'));
    return Math.min(totalCritChance * getGlobalStatMultiplier(character), 0.45);
}

export function getCritDamage(character) {
    let totalCritDamage = 1.5;
    let additionalCritDamage = 0;
    const effects = getResolvedEquipmentEffects(character);
    getCombatStatEquipmentEntries(character).forEach(([, item]) => {
        const critDamage = readItemStat(item, 'critDamage', 'crit_damage');
        if (critDamage) additionalCritDamage += critDamage - 1.5;
    });
    additionalCritDamage += toFraction(effects.critDamage);
    additionalCritDamage += toFraction(getBuffValue(character, 'critDamage'));
    const rawCritDamage = totalCritDamage + additionalCritDamage;
    const scaledCritDamage = Math.max(1, rawCritDamage * getGlobalStatMultiplier(character));
    if (scaledCritDamage <= 2.0) return scaledCritDamage;
    return Math.min(2.45, 2.0 + (scaledCritDamage - 2.0) * 0.45);
}

export function getWeaponSpeed(character) {
    const weapon = character.equipment?.weapon;
    return readNumber(weapon?.weaponSpeed, 1.0) || 1.0;
}

export function getAttackSpeed(character) {
    let baseSpeed = 1.0;
    const effects = getResolvedEquipmentEffects(character);
    const weapon = character.equipment?.weapon;
    if (weapon?.attackSpeed) {
        baseSpeed = readNumber(weapon.attackSpeed, 1.0);
    }
    let speedBonus = toFraction(effects.attackSpeed);
    speedBonus += toFraction(getBuffValue(character, 'attackSpeed'));
    return Math.max(0.1, baseSpeed * (1 + speedBonus) * getGlobalStatMultiplier(character));
}

export function getAttackInterval(character) {
    return 1 / getAttackSpeed(character);
}

export function getLifesteal(character) {
    return getResolvedEquipmentEffects(character).lifesteal;
}

export function getDamageReduction(character) {
    const reduction = getResolvedEquipmentEffects(character).damageReduction / 100;
    return Math.min(reduction, 0.75);
}

export function getAffixHpBonus(character) {
    const effects = getResolvedEquipmentEffects(character, { includeBaseStats: true });
    let bonus = readNumber(effects.hp);
    if (effects.allStats > 0) bonus = Math.floor(bonus * (1 + toFraction(effects.allStats)));
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
        if (buff.persistent) return true;
        buff.duration--;
        return buff.duration > 0;
    });
}

export function clearAllBuffs(character) {
    character.activeBuffs = [];
}

export function initPassiveCombatEffects(character) {
    const unlockedIds = Array.isArray(character.unlockedPassiveEffectIds)
        ? character.unlockedPassiveEffectIds
        : [];
    character.unlockedPassiveEffectIds = Array.from(new Set([
        ...unlockedIds,
        ...DefaultUnlockedPassiveCombatEffectIds
    ])).filter(effectId => Boolean(getPassiveCombatEffect(effectId)));

    if (!Array.isArray(character.equippedPassiveEffectIds) || character.equippedPassiveEffectIds.length === 0) {
        character.equippedPassiveEffectIds = [...DefaultEquippedPassiveCombatEffectIds];
    }
    character.passiveEffectSlots = PassiveCombatEffectSlotCount;
    character.equippedPassiveEffectIds = Array.from({ length: character.passiveEffectSlots }, (_, index) => {
        const effectId = character.equippedPassiveEffectIds[index];
        return character.unlockedPassiveEffectIds.includes(effectId) ? effectId : null;
    });
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
    const nextIds = Array.from({ length: character.passiveEffectSlots }, (_, slot) => character.equippedPassiveEffectIds[slot] || null);
    const duplicateIndex = nextIds.indexOf(effectId);
    if (duplicateIndex >= 0 && duplicateIndex !== index) nextIds[duplicateIndex] = null;
    nextIds[index] = effectId;
    character.equippedPassiveEffectIds = nextIds.slice(0, character.passiveEffectSlots);
    return true;
}

export function equip(character, item, slotOverride = null) {
    if (!item?.isEquipment || !item.isEquipment()) return false;
    const slot = slotOverride || normalizeEquipmentSlot(item);
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
    return 100 + ((character.level || 1) * 10);
}

export function calculateMaxExp(character) {
    return getLevelExperienceRequirement(character.level || 1);
}

export function checkLevelUp(character) {
    const getMaxExp = () => calculateMaxExp(character);
    while ((character.exp || 0) >= getMaxExp()) {
        const requiredExp = getMaxExp();
        const previousMaxHp = character.maxHp || calculateMaxHp(character);
        const previousHp = character.hp || 0;
        character.level = (character.level || 1) + 1;
        character.exp -= requiredExp;
        character.maxHp = calculateMaxHp(character);
        const maxHpGain = Math.max(0, character.maxHp - previousMaxHp);
        const levelHeal = Math.max(maxHpGain, Math.floor(character.maxHp * 0.35));
        character.hp = Math.min(character.maxHp, previousHp + levelHeal);
        character.lastLevelUpHeal = character.hp - previousHp;
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
    getCombatEffectTotals() { return getCombatEffectTotals(this.data); }
    getPassiveCombatBonus(stat) { return getPassiveCombatBonus(this.data, stat); }
    getActivePassiveCombatEffects() { return getActivePassiveCombatEffects(this.data); }

    addBuff(type, value, duration) { return addBuff(this.data, type, value, duration); }
    getBuffValue(type) { return getBuffValue(this.data, type); }
    tickBuffs() { return tickBuffs(this.data); }
    clearAllBuffs() { return clearAllBuffs(this.data); }

    equipPassiveCombatEffect(effectId, slotIndex) { return equipPassiveCombatEffect(this.data, effectId, slotIndex); }
    unlockPassiveCombatEffect(effectId) { return unlockPassiveCombatEffect(this.data, effectId); }

    equip(item, slotOverride = null) { return equip(this.data, item, slotOverride); }
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
    getGlobalStatMultiplier,
    applyGlobalStatMultiplier,
    getCombatEffectTotals,
    getPassiveCombatBonus,
    addBuff,
    getBuffValue,
    tickBuffs,
    clearAllBuffs,
    initPassiveCombatEffects,
    getActivePassiveCombatEffects,
    unlockPassiveCombatEffect,
    equipPassiveCombatEffect,
    equip,
    unequip,
    useItem,
    calculateMaxHp,
    calculateMaxExp,
    checkLevelUp,
    gainExp,
    syncProperties,
    CharacterHelper
};
