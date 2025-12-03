/**
 * DataModel.js
 * Core data models for the RPG.
 */

export const ItemRarity = {
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary'
};

export const ItemType = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    ACCESSORY: 'accessory',
    POTION: 'potion',
    MATERIAL: 'material',
    KEY: 'key',
    GEM: 'gem',
    SCROLL: 'scroll',
    BOOK: 'book',
    QUEST: 'quest'
};

export const ItemCategory = {
    EQUIPMENT: 'equipment',
    ITEMS: 'items'
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
    }
}

export class Weapon extends Equipment {
    constructor(id, name, rarity, icon, description, price, atk = 0, def = 0, critChance = 0.1, critDamage = 1.5, weaponSpeed = 1.0, attackSpeed = 1.0) {
        super(id, name, ItemType.WEAPON, rarity, icon, description, price, atk, def, critChance, critDamage);
        this.weaponSpeed = weaponSpeed;   // 只有武器有武器速度
        this.attackSpeed = attackSpeed;   // 只有武器有攻擊速度
    }
    
    getAttackInterval() {
        return 1 / this.attackSpeed;
    }
}

export class Armor extends Equipment {
    constructor(id, name, rarity, icon, description, price, atk = 0, def = 0, critChance = 0.03, critDamage = 1.2) {
        super(id, name, ItemType.ARMOR, rarity, icon, description, price, atk, def, critChance, critDamage);
        // 防具沒有 weaponSpeed 和 attackSpeed
    }
}

export class Accessory extends Equipment {
    constructor(id, name, rarity, icon, description, price, atk = 0, def = 0, critChance = 0.05, critDamage = 1.3) {
        super(id, name, ItemType.ACCESSORY, rarity, icon, description, price, atk, def, critChance, critDamage);
        // 飾品沒有 weaponSpeed 和 attackSpeed
    }
}

export class Consumable extends Item {
    constructor(id, name, type, rarity, icon, description, price, effect) {
        super(id, name, type, rarity, icon, description, price);
        this.effect = effect; // { hp: 50, mp: 30, exp: 100 }
    }
}

export class Character {
    constructor() {
        this.level = 1;
        this._hp = 100;
        this._maxHp = 100;
        this._mp = 50;
        this._maxMp = 50;
        this._exp = 0;
        this._maxExp = 100;
        this.gold = 1250;
        this.baseAtk = 100;
        this.baseDef = 5;
        this._attack = 10;
        this._defense = 5;
        
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };
    }
    
    // Getters and setters to keep properties in sync
    get hp() { return this._hp; }
    set hp(value) { 
        this._hp = value; 
        this.currentHP = value;
    }
    
    get maxHp() { return this._maxHp; }
    set maxHp(value) { 
        this._maxHp = value;
    }
    
    get currentHP() { return this._hp; }
    set currentHP(value) { this._hp = value; }
    
    get mp() { return this._mp; }
    set mp(value) { this._mp = value; }
    
    get maxMp() { return this._maxMp; }
    set maxMp(value) { this._maxMp = value; }
    
    get exp() { return this._exp; }
    set exp(value) { 
        this._exp = value;
        this.currentEXP = value;
    }
    
    get currentEXP() { return this._exp; }
    set currentEXP(value) { this._exp = value; }
    
    get maxExp() { return this._maxExp; }
    set maxExp(value) { 
        this._maxExp = value;
        this.maxEXP = value;
    }
    
    get maxEXP() { return this._maxExp; }
    set maxEXP(value) { this._maxExp = value; }
    
    get attack() { return this._attack; }
    set attack(value) { this._attack = value; }
    
    get defense() { return this._defense; }
    set defense(value) { this._defense = value; }

    getTotalAtk() {
        let total = this.baseAtk;
        Object.values(this.equipment).forEach(item => {
            if (item && item.atk) total += item.atk;
        });
        this._attack = total; // Keep attack in sync
        return total;
    }

    getTotalDef() {
        let total = this.baseDef;
        Object.values(this.equipment).forEach(item => {
            if (item && item.def) total += item.def;
        });
        this._defense = total; // Keep defense in sync
        return total;
    }

    getCritChance() {
        // 累加所有裝備的爆擊率（影響節奏條上的爆擊區域大小）
        let totalCritChance = 0.05; // 基礎爆擊率
        Object.values(this.equipment).forEach(item => {
            if (item && item.critChance) {
                totalCritChance += item.critChance;
            }
        });
        return Math.min(totalCritChance, 1.0); // 最高100%
    }

    getCritDamage() {
        // 累加所有裝備的爆擊傷害倍率
        let totalCritDamage = 1.5; // 基礎爆擊傷害
        let additionalCritDamage = 0;
        Object.values(this.equipment).forEach(item => {
            if (item && item.critDamage) {
                additionalCritDamage += (item.critDamage - 1.5); // 額外的爆傷加成
            }
        });
        return totalCritDamage + additionalCritDamage;
    }

    getWeaponSpeed() {
        const weapon = this.equipment.weapon;
        // 只有武器有 weaponSpeed，防具和飾品沒有
        return (weapon && weapon.weaponSpeed) ? weapon.weaponSpeed : 1.0;
    }

    getAttackSpeed() {
        const weapon = this.equipment.weapon;
        // 只有武器有 attackSpeed，防具和飾品沒有
        return (weapon && weapon.attackSpeed) ? weapon.attackSpeed : 1.0;
    }

    getAttackInterval() {
        return 1 / this.getAttackSpeed();
    }

    equip(item) {
        if (!item.isEquipment()) return false;
        
        const slot = item.type; // Assumes type matches slot name (weapon, armor, accessory)
        // If type is 'weapon', slot is 'weapon'.
        // If type is 'armor', slot is 'armor'.
        // If type is 'accessory', slot is 'accessory'.
        
        if (this.equipment.hasOwnProperty(slot)) {
             this.equipment[slot] = item;
             // Update attack/defense after equipping
             this.getTotalAtk();
             this.getTotalDef();
             return true;
        }
        return false;
    }

    unequip(slotType) {
        const item = this.equipment[slotType];
        this.equipment[slotType] = null;
        // Update attack/defense after unequipping
        this.getTotalAtk();
        this.getTotalDef();
        return item;
    }

    useItem(item) {
        if (!item.effect) return false;
        
        if (item.effect.hp) {
            this.hp = Math.min(this.maxHp, this.hp + item.effect.hp);
        }
        if (item.effect.mp) {
            this.mp = Math.min(this.maxMp, this.mp + item.effect.mp);
        }
        if (item.effect.exp) {
            this.exp += item.effect.exp;
            this.checkLevelUp();
        }
        return true;
    }

    checkLevelUp() {
        while (this.exp >= this.maxExp) {
            this.level++;
            this.exp -= this.maxExp;
            this.maxExp = Math.floor(this.maxExp * 1.5);
            this.maxHp += 20;
            this.hp = this.maxHp;
            this.maxMp += 10;
            this.mp = this.maxMp;
            this.baseAtk += 2;
            this.baseDef += 1;
            this.getTotalAtk(); // Update total attack
            this.getTotalDef(); // Update total defense
        }
    }

    // Method to keep properties in sync when hp/exp is modified externally
    syncProperties() {
        this._attack = this.getTotalAtk();
        this._defense = this.getTotalDef();
    }
}
