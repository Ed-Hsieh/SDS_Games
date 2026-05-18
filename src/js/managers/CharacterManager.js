/**
 * CharacterManager.js
 * Compatibility facade for older imports.
 *
 * Character behavior now lives in models/CharacterLogic.js so DataModel.js does
 * not depend on a manager module.
 */

import * as CharacterLogic from '../models/CharacterLogic.js';

export const getTotalAtk = CharacterLogic.getTotalAtk;
export const getTotalDef = CharacterLogic.getTotalDef;
export const getCritChance = CharacterLogic.getCritChance;
export const getCritDamage = CharacterLogic.getCritDamage;
export const getWeaponSpeed = CharacterLogic.getWeaponSpeed;
export const getAttackSpeed = CharacterLogic.getAttackSpeed;
export const getAttackInterval = CharacterLogic.getAttackInterval;
export const getLifesteal = CharacterLogic.getLifesteal;
export const getDamageReduction = CharacterLogic.getDamageReduction;
export const getAffixHpBonus = CharacterLogic.getAffixHpBonus;
export const getPassiveCombatBonus = CharacterLogic.getPassiveCombatBonus;
export const addBuff = CharacterLogic.addBuff;
export const getBuffValue = CharacterLogic.getBuffValue;
export const tickBuffs = CharacterLogic.tickBuffs;
export const clearAllBuffs = CharacterLogic.clearAllBuffs;
export const initPassiveCombatEffects = CharacterLogic.initPassiveCombatEffects;
export const getActivePassiveCombatEffects = CharacterLogic.getActivePassiveCombatEffects;
export const unlockPassiveCombatEffect = CharacterLogic.unlockPassiveCombatEffect;
export const equipPassiveCombatEffect = CharacterLogic.equipPassiveCombatEffect;
export const equip = CharacterLogic.equip;
export const unequip = CharacterLogic.unequip;
export const useItem = CharacterLogic.useItem;
export const calculateMaxHp = CharacterLogic.calculateMaxHp;
export const calculateMaxExp = CharacterLogic.calculateMaxExp;
export const checkLevelUp = CharacterLogic.checkLevelUp;
export const gainExp = CharacterLogic.gainExp;
export const syncProperties = CharacterLogic.syncProperties;
export const CharacterHelper = CharacterLogic.CharacterHelper;

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
