/**
 * DataModel.js
 * Core data models for the RPG.
 */

// 從 Enums.js 導入並重新導出（保持向後相容）
import { ItemRarity, ItemType, ItemCategory } from './Enums.js';
import * as CharacterLogic from './CharacterLogic.js';
export { ItemRarity, ItemType, ItemCategory };

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
    constructor(id, name, type, rarity, icon, description, price, atk, def, critChance, critDamage, maxDurability, durability) {
        super(id, name, type, rarity, icon, description, price);

        // 基本屬性必填，避免默認值靜默帶入
        const required = { atk, def, critChance, critDamage };
        if (Object.values(required).some(v => v === undefined)) {
            throw new Error(`Equipment ${id} missing base stats (atk/def/critChance/critDamage)`);
        }

        this.atk = atk;
        this.def = def;
        this.critChance = critChance; // 所有裝備都有爆擊率
        this.critDamage = critDamage; // 所有裝備都有爆擊傷害

        // 耐久度系統 - 武器和防具才有；如果未提供則落在前期易耗的預設值
        const resolvedMaxDurability = Number.isFinite(maxDurability) ? maxDurability : 18;
        this.maxDurability = resolvedMaxDurability;
        this.durability = Number.isFinite(durability) ? durability : resolvedMaxDurability;
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
    constructor(id, name, rarity, icon, description, price, atk, def, critChance, critDamage, weaponSpeed = 1.0, attackSpeed = 1.0, maxDurability, durability) {
        super(id, name, ItemType.WEAPON, rarity, icon, description, price, atk, def, critChance, critDamage, maxDurability, durability);
        this.weaponSpeed = weaponSpeed;   // 只有武器有武器速度
        this.attackSpeed = attackSpeed;   // 只有武器有攻擊速度
    }
    
    getAttackInterval() {
        return 1 / this.attackSpeed;
    }
}

export class Armor extends Equipment {
    constructor(id, name, rarity, icon, description, price, atk, def, critChance, critDamage, maxDurability, durability) {
        super(id, name, ItemType.ARMOR, rarity, icon, description, price, atk, def, critChance, critDamage, maxDurability, durability);
    }
}

export class Accessory extends Equipment {
    constructor(id, name, rarity, icon, description, price, atk, def, critChance, critDamage, maxDurability = null, durability = null) {
        super(id, name, ItemType.ACCESSORY, rarity, icon, description, price, atk, def, critChance, critDamage, maxDurability, durability);
        // 飾品沒有耐久度
        this.maxDurability = maxDurability ?? null;
        this.durability = durability ?? null;
    }
}

export class Consumable extends Item {
    constructor(id, name, type, rarity, icon, description, price, effect) {
        super(id, name, type, rarity, icon, description, price);
        this.effect = effect; // { hp: 50, exp: 100 }
    }
}

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
        this._exp = 0;
        this._maxExp = CharacterLogic.calculateMaxExp(this);
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
        
        this.activeBuffs = [];
        this.unlockedPassiveEffectIds = [];
        this.equippedPassiveEffectIds = [];
        this.passiveEffectSlots = 1;
        
        // 初始化戰術技能
        CharacterLogic.initPassiveCombatEffects(this);
    }
    
    // ===== HP/EXP Getters/Setters =====
    get hp() { return Number.isFinite(this._hp) ? this._hp : 0; }
    set hp(v) { this._hp = Math.max(0, Number(v) || 0); }

    get maxHp() {
        const baseMaxHp = Number.isFinite(this._maxHp) ? this._maxHp : this.calculateMaxHp();
        return CharacterLogic.applyGlobalStatMultiplier(this, baseMaxHp + this.getAffixHpBonus(), { minimum: 1 });
    }
    set maxHp(v) { this._maxHp = Math.max(1, Number(v) || 1); }

    get exp() { return Number.isFinite(this._exp) ? this._exp : 0; }
    set exp(v) { this._exp = Math.max(0, Number(v) || 0); }

    get maxExp() { return Number.isFinite(this._maxExp) ? this._maxExp : this.calculateMaxExp(); }
    set maxExp(v) { this._maxExp = Math.max(1, Number(v) || 1); }

    // 向後相容別名
    get currentHP() { return this.hp; }
    set currentHP(v) { this.hp = v; }
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
    getCombatEffectTotals() { return CharacterLogic.getCombatEffectTotals(this); }
    
    // Buff 系統
    addBuff(type, value, duration) { return CharacterLogic.addBuff(this, type, value, duration); }
    getBuffValue(type) { return CharacterLogic.getBuffValue(this, type); }
    tickBuffs() { return CharacterLogic.tickBuffs(this); }
    clearAllBuffs() { return CharacterLogic.clearAllBuffs(this); }
    
    // 戰術技能
    getPassiveCombatBonus(stat) { return CharacterLogic.getPassiveCombatBonus(this, stat); }
    getActivePassiveCombatEffects() { return CharacterLogic.getActivePassiveCombatEffects(this); }
    unlockPassiveCombatEffect(effectId) { return CharacterLogic.unlockPassiveCombatEffect(this, effectId); }
    equipPassiveCombatEffect(effectId, slotIndex) { return CharacterLogic.equipPassiveCombatEffect(this, effectId, slotIndex); }

    // 裝備管理
    equip(item, slotOverride = null) { return CharacterLogic.equip(this, item, slotOverride); }
    unequip(slot) { return CharacterLogic.unequip(this, slot); }
    
    // 物品使用
    useItem(item) { return CharacterLogic.useItem(this, item); }
    
    // 等級與經驗
    checkLevelUp() { return CharacterLogic.checkLevelUp(this); }
    gainExp(amount) { return CharacterLogic.gainExp(this, amount); }
    calculateMaxHp() { return CharacterLogic.calculateMaxHp(this); }
    calculateMaxExp() { return CharacterLogic.calculateMaxExp(this); }
    
    // 同步
    syncProperties() { return CharacterLogic.syncProperties(this); }
}
