/**
 * CharacterManager.js
 * Compatibility facade for older imports.
 *
 * Character behavior now lives in models/CharacterLogic.js so DataModel.js does
 * not depend on a manager module.
 */

import * as CharacterLogic from '../models/CharacterLogic.js';
import { createDefaultSkills } from '../models/DataModel.js';

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
export const addBuff = CharacterLogic.addBuff;
export const getBuffValue = CharacterLogic.getBuffValue;
export const tickBuffs = CharacterLogic.tickBuffs;
export const clearAllBuffs = CharacterLogic.clearAllBuffs;
export const useSkill = CharacterLogic.useSkill;
export const tickSkillCooldowns = CharacterLogic.tickSkillCooldowns;
export const equip = CharacterLogic.equip;
export const unequip = CharacterLogic.unequip;
export const useItem = CharacterLogic.useItem;
export const calculateMaxHp = CharacterLogic.calculateMaxHp;
export const calculateMaxMp = CharacterLogic.calculateMaxMp;
export const calculateMaxExp = CharacterLogic.calculateMaxExp;
export const checkLevelUp = CharacterLogic.checkLevelUp;
export const gainExp = CharacterLogic.gainExp;
export const syncProperties = CharacterLogic.syncProperties;
export const CharacterHelper = CharacterLogic.CharacterHelper;

export function initDefaultSkills(character) {
    return CharacterLogic.initDefaultSkills(character, createDefaultSkills);
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
