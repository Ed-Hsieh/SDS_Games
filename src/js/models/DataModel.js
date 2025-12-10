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
    SOCKET_GEM: 'socket_gem',
    SCROLL: 'scroll',
    BOOK: 'book',
    QUEST: 'quest'
};

export const ItemCategory = {
    EQUIPMENT: 'equipment',
    ITEMS: 'items'
};

// ===== 技能系統 =====
export const SkillType = {
    ATTACK: 'attack',      // 攻擊技能
    HEAL: 'heal',          // 治療技能
    BUFF: 'buff',          // 增益技能
    DEBUFF: 'debuff'       // 減益技能
};

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

export class Character {
    constructor() {
        this.level = 1;
        this._hp = 120;  // 100 + (1 * 20) = 120
        this._maxHp = 120;
        this._mp = 50;
        this._maxMp = 50;
        this._exp = 0;
        this._maxExp = 100;
        this.gold = 100;
        this.baseAtk = 5;   // 基礎攻擊力（較低，主要靠裝備）
        this.baseDef = 2;   // 基礎防禦力（較低，主要靠裝備）
        this._attack = 5;
        this._defense = 2;
        
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };
        
        // 新增：技能系統
        this.skills = [];
        this.initDefaultSkills();
        
        // 新增：Buff 系統
        this.activeBuffs = [];  // { type, value, duration }
    }
    
    // 初始化預設技能
    initDefaultSkills() {
        // 創建技能的新實例，避免共用同一個物件
        this.skills = [
            new AttackSkill('fireball', '火球術', '🔥', '發射一顆火球攻擊敵人', 15, 0, 1.5, 10),
            new HealSkill('heal', '治療術', '💚', '恢復自身生命值', 20, 1, 30, 0.1),
            new BuffSkill('battle_cry', '戰吼', '📢', '提升自身攻擊力', 15, 3, 'atk', 20, 3)
        ];
    }
    
    // Getters and setters to keep properties in sync
    get hp() { return this._hp; }
    set hp(value) { 
        this._hp = Math.max(0, Math.min(value, this._maxHp)); 
        this.currentHP = this._hp;
    }
    
    get maxHp() { return this._maxHp; }
    set maxHp(value) { 
        this._maxHp = value;
    }
    
    get currentHP() { return this._hp; }
    set currentHP(value) { this._hp = Math.max(0, Math.min(value, this._maxHp)); }
    
    get mp() { return this._mp; }
    set mp(value) { this._mp = Math.max(0, Math.min(value, this._maxMp)); }
    
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
            // 加上詞綴加成
            if (item && item.affixBonuses && item.affixBonuses.atk) {
                total += item.affixBonuses.atk;
            }
        });
        // 加上 Buff 加成
        total += this.getBuffValue('atk');
        this._attack = total;
        return total;
    }

    getTotalDef() {
        let total = this.baseDef;
        Object.values(this.equipment).forEach(item => {
            if (item && item.def) total += item.def;
            // 加上詞綴加成
            if (item && item.affixBonuses && item.affixBonuses.def) {
                total += item.affixBonuses.def;
            }
        });
        // 加上 Buff 加成
        total += this.getBuffValue('def');
        this._defense = total;
        return total;
    }

    getCritChance() {
        let totalCritChance = 0.05;
        Object.values(this.equipment).forEach(item => {
            if (item && item.critChance) {
                totalCritChance += item.critChance;
            }
            // 加上詞綴加成
            if (item && item.affixBonuses && item.affixBonuses.critChance) {
                totalCritChance += item.affixBonuses.critChance;
            }
        });
        // 加上 Buff 加成
        totalCritChance += this.getBuffValue('critChance');
        return Math.min(totalCritChance, 1.0);
    }

    getCritDamage() {
        let totalCritDamage = 1.5;
        let additionalCritDamage = 0;
        Object.values(this.equipment).forEach(item => {
            if (item && item.critDamage) {
                additionalCritDamage += (item.critDamage - 1.5);
            }
            // 加上詞綴加成
            if (item && item.affixBonuses && item.affixBonuses.critDamage) {
                additionalCritDamage += item.affixBonuses.critDamage;
            }
        });
        // 加上 Buff 加成
        additionalCritDamage += this.getBuffValue('critDamage');
        return totalCritDamage + additionalCritDamage;
    }

    getWeaponSpeed() {
        const weapon = this.equipment.weapon;
        return (weapon && weapon.weaponSpeed) ? weapon.weaponSpeed : 1.0;
    }

    getAttackSpeed() {
        let baseSpeed = 1.0;
        const weapon = this.equipment.weapon;
        if (weapon && weapon.attackSpeed) {
            baseSpeed = weapon.attackSpeed;
        }
        // 加上詞綴攻擊速度加成
        Object.values(this.equipment).forEach(item => {
            if (item && item.affixBonuses && item.affixBonuses.attackSpeed) {
                baseSpeed += item.affixBonuses.attackSpeed;
            }
        });
        // 加上 Buff 攻擊速度（以小數表示，例如 0.1 = +10%）
        baseSpeed += this.getBuffValue('attackSpeed');
        return baseSpeed;
    }

    getAttackInterval() {
        return 1 / this.getAttackSpeed();
    }
    
    /**
     * 獲取生命偷取率
     */
    getLifesteal() {
        let lifesteal = 0;
        Object.values(this.equipment).forEach(item => {
            if (item && item.lifesteal) lifesteal += item.lifesteal;
            if (item && item.affixBonuses && item.affixBonuses.lifesteal) {
                lifesteal += item.affixBonuses.lifesteal;
            }
        });
        return lifesteal;
    }
    
    /**
     * 獲取傷害減免率
     */
    getDamageReduction() {
        let reduction = 0;
        Object.values(this.equipment).forEach(item => {
            if (item && item.damageReduction) reduction += item.damageReduction;
            if (item && item.affixBonuses && item.affixBonuses.damageReduction) {
                reduction += item.affixBonuses.damageReduction;
            }
        });
        return Math.min(reduction, 0.75); // 最大 75% 減傷
    }
    
    /**
     * 獲取詞綴帶來的額外生命值
     */
    getAffixHpBonus() {
        let bonus = 0;
        Object.values(this.equipment).forEach(item => {
            if (item && item.affixBonuses && item.affixBonuses.hp) {
                bonus += item.affixBonuses.hp;
            }
        });
        return bonus;
    }

    // ===== Buff 系統 =====
    
    addBuff(buffType, buffValue, duration) {
        // 檢查是否已有同類型 Buff，如果有則刷新
        const existingBuff = this.activeBuffs.find(b => b.type === buffType);
        if (existingBuff) {
            existingBuff.value = Math.max(existingBuff.value, buffValue);
            existingBuff.duration = Math.max(existingBuff.duration, duration);
        } else {
            this.activeBuffs.push({ type: buffType, value: buffValue, duration: duration });
        }
    }
    
    getBuffValue(buffType) {
        const buff = this.activeBuffs.find(b => b.type === buffType);
        return buff ? buff.value : 0;
    }
    
    tickBuffs() {
        // 每回合結束時減少 Buff 持續時間
        this.activeBuffs = this.activeBuffs.filter(buff => {
            buff.duration--;
            return buff.duration > 0;
        });
    }
    
    clearAllBuffs() {
        this.activeBuffs = [];
    }
    
    // ===== 技能系統 =====
    
    useSkill(skillIndex, target) {
        if (skillIndex < 0 || skillIndex >= this.skills.length) return null;
        const skill = this.skills[skillIndex];
        return skill.use(this, target);
    }
    
    tickSkillCooldowns() {
        this.skills.forEach(skill => skill.reduceCooldown());
    }

    equip(item) {
        if (!item.isEquipment()) return false;
        
        const slot = item.type;
        
        if (this.equipment.hasOwnProperty(slot)) {
             this.equipment[slot] = item;
             this.getTotalAtk();
             this.getTotalDef();
             return true;
        }
        return false;
    }

    unequip(slotType) {
        const item = this.equipment[slotType];
        this.equipment[slotType] = null;
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
            // 經驗需求遞增
            this.maxExp = Math.floor(100 * Math.pow(1.2, this.level - 1));
            // HP = 100 + (等級 × 20)
            this.maxHp = 100 + (this.level * 20);
            this.hp = this.maxHp;
            // MP 小幅成長
            this.maxMp = 50 + (this.level * 5);
            this.mp = this.maxMp;
            // 基礎攻防不變（依賴裝備）
            this.getTotalAtk();
            this.getTotalDef();
        }
    }
    
    /**
     * 獲得經驗值
     * @param {number} amount - 經驗值數量
     * @returns {boolean} 是否升級
     */
    gainExp(amount) {
        const oldLevel = this.level;
        this.exp += amount;
        this.checkLevelUp();
        return this.level > oldLevel;
    }
    
    /**
     * 計算當前等級的最大HP
     */
    calculateMaxHp() {
        return 100 + (this.level * 20);
    }

    syncProperties() {
        this._attack = this.getTotalAtk();
        this._defense = this.getTotalDef();
    }
}
