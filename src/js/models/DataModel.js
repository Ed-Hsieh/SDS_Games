/**
 * DataModel.js
 * Core data models for the RPG.
 */

// 從 Enums.js 導入並重新導出（保持向後相容）
import { ItemRarity, ItemType, ItemCategory, SkillType } from './Enums.js';
export { ItemRarity, ItemType, ItemCategory, SkillType };

export class Skill {
    constructor(id, name, type, icon, description, mpCost, cooldown = 0) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.icon = icon;
        this.description = description;
        this.mpCost = mpCost;
        this.cooldown = cooldown;       // 冷卻回合數
        this.currentCooldown = 0;       // 當前剩餘冷卻
    }
    
    canUse(character) {
        return character.mp >= this.mpCost && this.currentCooldown === 0;
    }
    
    use(character, target) {
        if (!this.canUse(character)) return null;
        character.mp -= this.mpCost;
        this.currentCooldown = this.cooldown;
        return this.execute(character, target);
    }
    
    execute(character, target) {
        // 子類別覆寫
        return { damage: 0, heal: 0, message: '' };
    }
    
    reduceCooldown() {
        if (this.currentCooldown > 0) {
            this.currentCooldown--;
        }
    }
}

export class AttackSkill extends Skill {
    constructor(id, name, icon, description, mpCost, cooldown, damageMultiplier, bonusDamage = 0) {
        super(id, name, SkillType.ATTACK, icon, description, mpCost, cooldown);
        this.damageMultiplier = damageMultiplier;  // 傷害倍率
        this.bonusDamage = bonusDamage;            // 額外固定傷害
    }
    
    execute(character, target) {
        const baseDamage = character.getTotalAtk();
        const totalDamage = Math.floor(baseDamage * this.damageMultiplier) + this.bonusDamage;
        return { 
            damage: totalDamage, 
            heal: 0, 
            message: `使用 ${this.name}，造成 ${totalDamage} 點傷害！` 
        };
    }
}

export class HealSkill extends Skill {
    constructor(id, name, icon, description, mpCost, cooldown, healAmount, healPercent = 0) {
        super(id, name, SkillType.HEAL, icon, description, mpCost, cooldown);
        this.healAmount = healAmount;      // 固定治療量
        this.healPercent = healPercent;    // 百分比治療（基於最大HP）
    }
    
    execute(character, target) {
        const percentHeal = Math.floor(character.maxHp * this.healPercent);
        const totalHeal = this.healAmount + percentHeal;
        const actualHeal = Math.min(totalHeal, character.maxHp - character.hp);
        character.hp += actualHeal;
        return { 
            damage: 0, 
            heal: actualHeal, 
            message: `使用 ${this.name}，恢復 ${actualHeal} 點生命！` 
        };
    }
}

export class BuffSkill extends Skill {
    constructor(id, name, icon, description, mpCost, cooldown, buffType, buffValue, duration) {
        super(id, name, SkillType.BUFF, icon, description, mpCost, cooldown);
        this.buffType = buffType;    // 'atk', 'def', 'critChance' 等
        this.buffValue = buffValue;  // 增益值
        this.duration = duration;    // 持續回合數
    }
    
    execute(character, target) {
        // 返回 buff 資訊讓戰鬥系統處理
        return { 
            damage: 0, 
            heal: 0, 
            buff: {
                type: this.buffType,
                value: this.buffValue,
                duration: this.duration
            },
            message: `使用 ${this.name}，${this.getBuffDescription()}！` 
        };
    }
    
    getBuffDescription() {
        const buffNames = {
            'atk': '攻擊力',
            'def': '防禦力',
            'critChance': '爆擊率',
            'critDamage': '爆擊傷害'
        };
        return `${buffNames[this.buffType] || this.buffType} +${this.buffValue}`;
    }
}

// 預設技能列表
export const DefaultSkills = {
    // 攻擊技能
    fireball: new AttackSkill('fireball', '火球術', '🔥', '發射一顆火球攻擊敵人', 15, 0, 1.5, 10),
    powerStrike: new AttackSkill('power_strike', '重擊', '💥', '用全力發動一次強力攻擊', 10, 1, 2.0, 0),
    thunderBolt: new AttackSkill('thunder_bolt', '雷電術', '⚡', '召喚雷電攻擊敵人', 25, 2, 2.5, 20),
    
    // 治療技能
    heal: new HealSkill('heal', '治療術', '💚', '恢復自身生命值', 20, 1, 30, 0.1),
    firstAid: new HealSkill('first_aid', '急救', '🩹', '快速恢復少量生命', 8, 0, 15, 0),
    
    // 增益技能
    battleCry: new BuffSkill('battle_cry', '戰吼', '📢', '提升自身攻擊力', 15, 3, 'atk', 20, 3),
    ironSkin: new BuffSkill('iron_skin', '鐵皮術', '🛡️', '提升自身防禦力', 12, 3, 'def', 15, 3),
    sharpEye: new BuffSkill('sharp_eye', '銳眼', '👁️', '提升爆擊率', 18, 4, 'critChance', 0.2, 3)
};

export class Item {
    constructor(id, name, type, rarity, icon, description, price) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.rarity = rarity;
        this.icon = icon;
        this.description = description;
        this.price = price;
        this.acquiredTime = Date.now();
        // Add instanceId for unique identification in inventory
        this.instanceId = Date.now() + Math.random().toString(36).substr(2, 9);
    }

    getCategory() {
        if ([ItemType.WEAPON, ItemType.ARMOR, ItemType.ACCESSORY].includes(this.type)) {
            return ItemCategory.EQUIPMENT;
        }
        return ItemCategory.ITEMS;
    }

    isEquipment() {
        return this.getCategory() === ItemCategory.EQUIPMENT;
    }
}

export class Equipment extends Item {
    constructor(id, name, type, rarity, icon, description, price, atk = 0, def = 0, critChance = 0.05, critDamage = 1.5) {
        super(id, name, type, rarity, icon, description, price);
        this.atk = atk;
        this.def = def;
        this.critChance = critChance; // 所有裝備都有爆擊率
        this.critDamage = critDamage; // 所有裝備都有爆擊傷害
        // 耐久度系統 - 武器和防具才有
        this.maxDurability = 50;      // 最大耐久度
        this.durability = 50;          // 當前耐久度
    }
    
    // 檢查是否有完美無瑕詞綴（不消耗耐久度）
    hasIndestructible() {
        if (!this.affixes) return false;
        return this.affixes.some(affix => affix.id === 'indestructible');
    }
    
    // 消耗耐久度
    reduceDurability(amount = 1) {
        if (this.hasIndestructible()) return false; // 不消耗
        this.durability = Math.max(0, this.durability - amount);
        return this.durability <= 0; // 返回是否損壞
    }
    
    // 檢查是否損壞
    isBroken() {
        return this.durability <= 0;
    }
}

export class Weapon extends Equipment {
    constructor(id, name, rarity, icon, description, price, atk = 0, def = 0, critChance = 0.1, critDamage = 1.5, weaponSpeed = 1.0, attackSpeed = 1.0) {
        super(id, name, ItemType.WEAPON, rarity, icon, description, price, atk, def, critChance, critDamage);
        this.weaponSpeed = weaponSpeed;   // 只有武器有武器速度
        this.attackSpeed = attackSpeed;   // 只有武器有攻擊速度
        // 武器耐久度
        this.maxDurability = 50;
        this.durability = 50;
    }
    
    getAttackInterval() {
        return 1 / this.attackSpeed;
    }
}

export class Armor extends Equipment {
    constructor(id, name, rarity, icon, description, price, atk = 0, def = 0, critChance = 0.03, critDamage = 1.2) {
        super(id, name, ItemType.ARMOR, rarity, icon, description, price, atk, def, critChance, critDamage);
        // 防具耐久度
        this.maxDurability = 50;
        this.durability = 50;
    }
}

export class Accessory extends Equipment {
    constructor(id, name, rarity, icon, description, price, atk = 0, def = 0, critChance = 0.05, critDamage = 1.3) {
        super(id, name, ItemType.ACCESSORY, rarity, icon, description, price, atk, def, critChance, critDamage);
        // 飾品沒有耐久度
        this.maxDurability = null;
        this.durability = null;
    }
}

export class Consumable extends Item {
    constructor(id, name, type, rarity, icon, description, price, effect) {
        super(id, name, type, rarity, icon, description, price);
        this.effect = effect; // { hp: 50, mp: 30, exp: 100 }
    }
}

// 引入 CharacterManager 邏輯函式
import * as CharacterLogic from '../managers/CharacterManager.js';

/**
 * Character - 純資料模型
 * 只包含屬性定義和基本的 getter/setter
 * 所有邏輯方法委派給 managers/CharacterManager.js
 */
export class CharacterManager {
    constructor() {
        // ===== 純資料屬性 =====
        this.level = 1;
        this._hp = 120;      // 100 + (1 * 20) = 120
        this._maxHp = 120;
        this._mp = 50;
        this._maxMp = 50;
        this._exp = 0;
        this._maxExp = 100;
        this.gold = 100;
        this.baseAtk = 5;    // 基礎攻擊力
        this.baseDef = 2;    // 基礎防禦力
        this._attack = 5;
        this._defense = 2;
        
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };
        
        this.skills = [];
        this.activeBuffs = [];
        
        // 初始化技能
        CharacterLogic.initDefaultSkills(this);
    }
    
    // ===== HP/MP/EXP Getters/Setters =====
    get hp() { return Number.isFinite(this._hp) ? this._hp : 0; }
    set hp(v) { this._hp = Math.max(0, Number(v) || 0); }

    get maxHp() { return Number.isFinite(this._maxHp) ? this._maxHp : this.calculateMaxHp(); }
    set maxHp(v) { this._maxHp = Math.max(1, Number(v) || 1); }

    get mp() { return Number.isFinite(this._mp) ? this._mp : 0; }
    set mp(v) { this._mp = Math.max(0, Number(v) || 0); }

    get maxMp() { return Number.isFinite(this._maxMp) ? this._maxMp : 50; }
    set maxMp(v) { this._maxMp = Math.max(0, Number(v) || 0); }

    get exp() { return Number.isFinite(this._exp) ? this._exp : 0; }
    set exp(v) { this._exp = Math.max(0, Number(v) || 0); }

    get maxExp() { return Number.isFinite(this._maxExp) ? this._maxExp : 100; }
    set maxExp(v) { this._maxExp = Math.max(1, Number(v) || 1); }

    // 向後相容別名
    get currentHP() { return this.hp; }
    set currentHP(v) { this.hp = v; }
    get currentMP() { return this.mp; }
    set currentMP(v) { this.mp = v; }
    get currentEXP() { return this.exp; }
    set currentEXP(v) { this.exp = v; }
    get maxEXP() { return this.maxExp; }
    set maxEXP(v) { this.maxExp = v; }

    // ===== 委派方法到 CharacterManager =====
    getTotalAtk() { return CharacterLogic.getTotalAtk(this); }
    getTotalDef() { return CharacterLogic.getTotalDef(this); }
    getCritChance() { return CharacterLogic.getCritChance(this); }
    getCritDamage() { return CharacterLogic.getCritDamage(this); }
    getWeaponSpeed() { return CharacterLogic.getWeaponSpeed(this); }
    getAttackSpeed() { return CharacterLogic.getAttackSpeed(this); }
    getAttackInterval() { return CharacterLogic.getAttackInterval(this); }
    getLifesteal() { return CharacterLogic.getLifesteal(this); }
    getDamageReduction() { return CharacterLogic.getDamageReduction(this); }
    getAffixHpBonus() { return CharacterLogic.getAffixHpBonus(this); }
    
    // Buff 系統
    addBuff(type, value, duration) { return CharacterLogic.addBuff(this, type, value, duration); }
    getBuffValue(type) { return CharacterLogic.getBuffValue(this, type); }
    tickBuffs() { return CharacterLogic.tickBuffs(this); }
    clearAllBuffs() { return CharacterLogic.clearAllBuffs(this); }
    
    // 技能系統
    useSkill(index, target) { return CharacterLogic.useSkill(this, index, target); }
    tickSkillCooldowns() { return CharacterLogic.tickSkillCooldowns(this); }
    
    // 裝備管理
    equip(item) { return CharacterLogic.equip(this, item); }
    unequip(slot) { return CharacterLogic.unequip(this, slot); }
    
    // 物品使用
    useItem(item) { return CharacterLogic.useItem(this, item); }
    
    // 等級與經驗
    checkLevelUp() { return CharacterLogic.checkLevelUp(this); }
    gainExp(amount) { return CharacterLogic.gainExp(this, amount); }
    calculateMaxHp() { return CharacterLogic.calculateMaxHp(this); }
    
    // 同步
    syncProperties() { return CharacterLogic.syncProperties(this); }
}
