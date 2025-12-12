/**
 * CharacterManager.js
 * 角色邏輯管理器 - 處理角色屬性計算、裝備、技能、Buff 等邏輯
 * 
 * 架構層級: Manager
 * 依賴: Model (Character), Database (Equipment)
 */

import { AttackSkill, HealSkill, BuffSkill } from '../models/DataModel.js';

/**
 * 角色屬性計算
 */
export function getTotalAtk(character) {
    let total = character.baseAtk || 0;
    Object.values(character.equipment || {}).forEach(item => {
        if (item && item.atk) total += item.atk;
        if (item && item.affixBonuses && item.affixBonuses.atk) {
            total += item.affixBonuses.atk;
        }
    });
    total += getBuffValue(character, 'atk');
    return total;
}

export function getTotalDef(character) {
    let total = character.baseDef || 0;
    Object.values(character.equipment || {}).forEach(item => {
        if (item && item.def) total += item.def;
        if (item && item.affixBonuses && item.affixBonuses.def) {
            total += item.affixBonuses.def;
        }
    });
    total += getBuffValue(character, 'def');
    return total;
}

export function getCritChance(character) {
    let totalCritChance = 0.05;
    Object.values(character.equipment || {}).forEach(item => {
        if (item && item.critChance) {
            totalCritChance += item.critChance;
        }
        if (item && item.affixBonuses && item.affixBonuses.critChance) {
            totalCritChance += item.affixBonuses.critChance;
        }
    });
    totalCritChance += getBuffValue(character, 'critChance');
    return Math.min(totalCritChance, 1.0);
}

export function getCritDamage(character) {
    let totalCritDamage = 1.5;
    let additionalCritDamage = 0;
    Object.values(character.equipment || {}).forEach(item => {
        if (item && item.critDamage) {
            additionalCritDamage += (item.critDamage - 1.5);
        }
        if (item && item.affixBonuses && item.affixBonuses.critDamage) {
            additionalCritDamage += item.affixBonuses.critDamage;
        }
    });
    additionalCritDamage += getBuffValue(character, 'critDamage');
    return totalCritDamage + additionalCritDamage;
}

export function getWeaponSpeed(character) {
    const weapon = character.equipment?.weapon;
    return (weapon && weapon.weaponSpeed) ? weapon.weaponSpeed : 1.0;
}

export function getAttackSpeed(character) {
    let baseSpeed = 1.0;
    const weapon = character.equipment?.weapon;
    if (weapon && weapon.attackSpeed) {
        baseSpeed = weapon.attackSpeed;
    }
    Object.values(character.equipment || {}).forEach(item => {
        if (item && item.affixBonuses && item.affixBonuses.attackSpeed) {
            baseSpeed += item.affixBonuses.attackSpeed;
        }
    });
    baseSpeed += getBuffValue(character, 'attackSpeed');
    return baseSpeed;
}

export function getAttackInterval(character) {
    return 1 / getAttackSpeed(character);
}

export function getLifesteal(character) {
    // Normalize to percent integer representation (e.g. 0.05 -> 5, 5 -> 5)
    const toPercentInt = (raw) => {
        const n = Number(raw || 0);
        if (n === 0) return 0;
        if (Math.abs(n) <= 1) return n * 100; // fraction -> percent
        return n; // already percent
    };

    let lifesteal = 0;
    Object.values(character.equipment || {}).forEach(item => {
        if (!item) return;

        if (item.lifesteal !== undefined && item.lifesteal !== null) lifesteal += toPercentInt(item.lifesteal);
        if (item.lifeStealBonus !== undefined && item.lifeStealBonus !== null) lifesteal += toPercentInt(item.lifeStealBonus);

        if (item.affixBonuses) {
            if (item.affixBonuses.lifesteal !== undefined && item.affixBonuses.lifesteal !== null) lifesteal += toPercentInt(item.affixBonuses.lifesteal);
            if (item.affixBonuses.lifeStealBonus !== undefined && item.affixBonuses.lifeStealBonus !== null) lifesteal += toPercentInt(item.affixBonuses.lifeStealBonus);
        }

        if (Array.isArray(item.affixes)) {
            for (const a of item.affixes) {
                if (!a || !a.stats) continue;
                if (a.stats.lifesteal !== undefined && a.stats.lifesteal !== null) lifesteal += toPercentInt(a.stats.lifesteal);
                if (a.stats.lifeStealBonus !== undefined && a.stats.lifeStealBonus !== null) lifesteal += toPercentInt(a.stats.lifeStealBonus);
            }
        }

        if (Array.isArray(item.specialEffects)) {
            for (const eff of item.specialEffects) {
                if (!eff || !eff.type) continue;
                const t = String(eff.type).toLowerCase();
                if (t.includes('life') && t.includes('steal') || t === 'lifesteal' || t === 'life_steal') {
                    lifesteal += toPercentInt(eff.value);
                }
            }
        }
    });

    return lifesteal; // percent integer (e.g. 5 means 5%)
}

export function getDamageReduction(character) {
    let reduction = 0;
    Object.values(character.equipment || {}).forEach(item => {
        if (item && item.damageReduction) reduction += item.damageReduction;
        if (item && item.affixBonuses && item.affixBonuses.damageReduction) {
            reduction += item.affixBonuses.damageReduction;
        }
    });
    return Math.min(reduction, 0.75);
}

export function getAffixHpBonus(character) {
    let bonus = 0;
    Object.values(character.equipment || {}).forEach(item => {
        if (item && item.affixBonuses && item.affixBonuses.hp) {
            bonus += item.affixBonuses.hp;
        }
    });
    return bonus;
}

/**
 * Buff 系統
 */
export function addBuff(character, buffType, buffValue, duration) {
    if (!character.activeBuffs) character.activeBuffs = [];
    const existingBuff = character.activeBuffs.find(b => b.type === buffType);
    if (existingBuff) {
        existingBuff.value = Math.max(existingBuff.value, buffValue);
        existingBuff.duration = Math.max(existingBuff.duration, duration);
    } else {
        character.activeBuffs.push({ type: buffType, value: buffValue, duration: duration });
    }
}

export function getBuffValue(character, buffType) {
    if (!character.activeBuffs) return 0;
    const buff = character.activeBuffs.find(b => b.type === buffType);
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

/**
 * 技能系統
 */
export function initDefaultSkills(character) {
    character.skills = [
        new AttackSkill('fireball', '火球術', '🔥', '發射一顆火球攻擊敵人', 15, 0, 1.5, 10),
        new HealSkill('heal', '治療術', '💚', '恢復自身生命值', 20, 1, 30, 0.1),
        new BuffSkill('battle_cry', '戰吼', '📢', '提升自身攻擊力', 15, 3, 'atk', 20, 3)
    ];
}

export function useSkill(character, skillIndex, target) {
    if (!character.skills || skillIndex < 0 || skillIndex >= character.skills.length) return null;
    const skill = character.skills[skillIndex];
    return skill.use(character, target);
}

export function tickSkillCooldowns(character) {
    if (!character.skills) return;
    character.skills.forEach(skill => skill.reduceCooldown());
}

/**
 * 裝備管理
 */
export function equip(character, item) {
    if (!item.isEquipment || !item.isEquipment()) return false;
    const slot = item.type;
    if (character.equipment && character.equipment.hasOwnProperty(slot)) {
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

/**
 * 物品使用
 */
export function useItem(character, item) {
    if (!item.effect) return false;
    
    if (item.effect.hp) {
        const maxHp = character.maxHp || calculateMaxHp(character);
        character.hp = Math.min(maxHp, (character.hp || 0) + item.effect.hp);
    }
    if (item.effect.mp) {
        const maxMp = character.maxMp || 50;
        character.mp = Math.min(maxMp, (character.mp || 0) + item.effect.mp);
    }
    if (item.effect.exp) {
        character.exp = (character.exp || 0) + item.effect.exp;
        checkLevelUp(character);
    }
    return true;
}

/**
 * 等級與經驗
 */
export function calculateMaxHp(character) {
    return 100 + ((character.level || 1) * 20);
}

export function calculateMaxMp(character) {
    return 50 + ((character.level || 1) * 5);
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
        character.maxMp = calculateMaxMp(character);
        character.mp = character.maxMp;
        character.maxExp = calculateMaxExp(character);
    }
}

export function gainExp(character, amount) {
    const oldLevel = character.level || 1;
    character.exp = (character.exp || 0) + amount;
    checkLevelUp(character);
    return character.level > oldLevel;
}

/**
 * 同步屬性（用於向後相容）
 */
export function syncProperties(character) {
    character._attack = getTotalAtk(character);
    character._defense = getTotalDef(character);
}

/**
 * 建立角色輔助類別 - 包裝純資料角色物件，提供方法呼叫介面
 * 用於向後相容舊的 character.getTotalAtk() 呼叫方式
 */
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
    
    addBuff(type, value, duration) { return addBuff(this.data, type, value, duration); }
    getBuffValue(type) { return getBuffValue(this.data, type); }
    tickBuffs() { return tickBuffs(this.data); }
    clearAllBuffs() { return clearAllBuffs(this.data); }
    
    useSkill(index, target) { return useSkill(this.data, index, target); }
    tickSkillCooldowns() { return tickSkillCooldowns(this.data); }
    
    equip(item) { return equip(this.data, item); }
    unequip(slot) { return unequip(this.data, slot); }
    useItem(item) { return useItem(this.data, item); }
    
    checkLevelUp() { return checkLevelUp(this.data); }
    gainExp(amount) { return gainExp(this.data, amount); }
    calculateMaxHp() { return calculateMaxHp(this.data); }
    syncProperties() { return syncProperties(this.data); }
}

// 預設匯出所有函式
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
