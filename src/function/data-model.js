// ===== 資料模型定義 =====

/**
 * 物品稀有度類型
 */
const ItemRarity = {
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary'
};

/**
 * 物品類型
 */
const ItemType = {
    // 裝備類
    WEAPON: 'weapon',
    ARMOR: 'armor',
    ACCESSORY: 'accessory',
    // 道具類
    POTION: 'potion',
    MATERIAL: 'material'
};

/**
 * 物品類別（用於倉庫分類）
 */
const ItemCategory = {
    EQUIPMENT: 'equipment',  // 裝備（武器/防具/飾品）
    ITEMS: 'items'          // 道具（道具/材料）
};

/**
 * 遊戲場景
 */
const GameScene = {
    HALL: 'hall',
    ADVENTURE: 'adventure'
};

/**
 * 物品基礎類別
 */
class Item {
    constructor(id, name, type, rarity, icon, description, price) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.rarity = rarity;
        this.icon = icon;
        this.description = description;
        this.price = price;
        this.acquiredTime = Date.now(); // 獲得時間戳記
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

/**
 * 裝備類別
 */
class Equipment extends Item {
    constructor(id, name, type, rarity, icon, description, price, atk = 0, def = 0, critChance = 0.1, critDamage = 1.5, weaponSpeed = 1.0, attackSpeed = 1.0) {
        super(id, name, type, rarity, icon, description, price);
        this.atk = atk;
        this.def = def;
        this.critChance = critChance;   // 爆擊機率 (0.0 - 1.0)
        this.critDamage = critDamage;   // 爆擊倍率 (例如 1.5 或 2.0)
        this.weaponSpeed = weaponSpeed; // 武器速度 (影響節奏條指針速度)
        this.attackSpeed = attackSpeed; // 攻擊速度/頻率 (每秒攻擊次數)
    }
    
    /**
     * 獲取攻擊間隔時間（秒）
     */
    getAttackInterval() {
        return 1 / this.attackSpeed;
    }
}

/**
 * 道具類別
 */
class Consumable extends Item {
    constructor(id, name, type, rarity, icon, description, price, effect) {
        super(id, name, type, rarity, icon, description, price);
        this.effect = effect; // { hp: 50 } or { exp: 100 }
    }
}

/**
 * 角色類別
 */
class Character {
    constructor() {
        this.level = 1;
        this.hp = 100;
        this.maxHp = 100;
        this.exp = 0;
        this.maxExp = 100;
        this.gold = 1000;
        this.baseAtk = 10;
        this.baseDef = 5;
        
        // 裝備欄位
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };
    }

    // 計算總攻擊力（基礎 + 裝備）
    getTotalAtk() {
        let total = this.baseAtk;
        Object.values(this.equipment).forEach(item => {
            if (item && item.atk) total += item.atk;
        });
        return total;
    }

    // 計算總防禦力（基礎 + 裝備）
    getTotalDef() {
        let total = this.baseDef;
        Object.values(this.equipment).forEach(item => {
            if (item && item.def) total += item.def;
        });
        return total;
    }

    // 獲取武器爆擊機率
    getCritChance() {
        const weapon = this.equipment.weapon;
        return weapon ? weapon.critChance : 0.1; // 預設 10%
    }

    // 獲取武器爆擊倍率
    getCritDamage() {
        const weapon = this.equipment.weapon;
        return weapon ? weapon.critDamage : 1.5; // 預設 1.5 倍
    }

    // 獲取武器速度
    getWeaponSpeed() {
        const weapon = this.equipment.weapon;
        return weapon ? weapon.weaponSpeed : 1.0; // 預設 1.0
    }

    // 獲取攻擊速度
    getAttackSpeed() {
        const weapon = this.equipment.weapon;
        return weapon ? weapon.attackSpeed : 1.0; // 預設 1.0 次/秒
    }

    // 獲取攻擊間隔（冷卻時間）
    getAttackInterval() {
        return 1 / this.getAttackSpeed(); // 秒
    }

    // 裝備物品
    equip(item) {
        if (!item.isEquipment()) return false;
        
        const slot = item.type;
        this.equipment[slot] = item;
        return true;
    }

    // 卸下裝備
    unequip(slotType) {
        const item = this.equipment[slotType];
        this.equipment[slotType] = null;
        return item;
    }

    // 使用道具
    useItem(item) {
        if (!item.effect) return false;
        
        if (item.effect.hp) {
            this.hp = Math.min(this.maxHp, this.hp + item.effect.hp);
        }
        if (item.effect.exp) {
            this.exp += item.effect.exp;
            this.checkLevelUp();
        }
        return true;
    }

    // 檢查升級
    checkLevelUp() {
        while (this.exp >= this.maxExp) {
            this.level++;
            this.exp -= this.maxExp;
            this.maxExp = Math.floor(this.maxExp * 1.5);
            this.maxHp += 20;
            this.hp = this.maxHp;
            this.baseAtk += 2;
            this.baseDef += 1;
        }
    }

    // 增加金錢
    addGold(amount) {
        this.gold += amount;
    }

    // 扣除金錢
    removeGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    }
}

/**
 * 倉庫類別
 */
class Warehouse {
    constructor() {
        this.items = [];
    }

    addItem(item) {
        this.items.push(item);
    }

    removeItem(itemId) {
        const index = this.items.findIndex(item => item.id === itemId);
        if (index !== -1) {
            return this.items.splice(index, 1)[0];
        }
        return null;
    }

    getItemsByCategory(category) {
        return this.items.filter(item => item.getCategory() === category);
    }

    hasItem(itemId) {
        return this.items.some(item => item.id === itemId);
    }
}

/**
 * 背包類別
 */
class Inventory {
    constructor(maxSlots = 10) {
        this.items = [];
        this.maxSlots = maxSlots;
    }

    isFull() {
        return this.items.length >= this.maxSlots;
    }

    addItem(item) {
        if (this.isFull()) return false;
        this.items.push(item);
        return true;
    }

    removeItem(itemId) {
        const index = this.items.findIndex(item => item.id === itemId);
        if (index !== -1) {
            return this.items.splice(index, 1)[0];
        }
        return null;
    }

    hasItem(itemId) {
        return this.items.some(item => item.id === itemId);
    }

    getUsedSlots() {
        return this.items.length;
    }
}

/**
 * 遊戲狀態管理
 */
class GameState {
    constructor() {
        this.character = new Character();
        this.warehouse = new Warehouse();
        this.inventory = new Inventory(10);
        this.currentScene = GameScene.HALL;
    }

    setScene(scene) {
        this.currentScene = scene;
    }

    isInHall() {
        return this.currentScene === GameScene.HALL;
    }

    isInAdventure() {
        return this.currentScene === GameScene.ADVENTURE;
    }
    
    /**
     * 保存遊戲狀態到 localStorage
     */
    save() {
        const saveData = {
            character: this.serializeCharacter(),
            warehouse: this.serializeWarehouse(),
            inventory: this.serializeInventory(),
            currentScene: this.currentScene
        };
        localStorage.setItem('sds_game_state', JSON.stringify(saveData));
        console.log('遊戲狀態已保存');
    }
    
    /**
     * 從 localStorage 載入遊戲狀態
     */
    load() {
        const savedData = localStorage.getItem('sds_game_state');
        if (!savedData) {
            console.log('沒有找到保存的遊戲狀態');
            return false;
        }
        
        try {
            const data = JSON.parse(savedData);
            this.deserializeCharacter(data.character);
            this.deserializeWarehouse(data.warehouse);
            this.deserializeInventory(data.inventory);
            this.currentScene = data.currentScene || GameScene.HALL;
            console.log('遊戲狀態已載入');
            return true;
        } catch (error) {
            console.error('載入遊戲狀態失敗:', error);
            return false;
        }
    }
    
    /**
     * 序列化角色數據
     */
    serializeCharacter() {
        return {
            level: this.character.level,
            hp: this.character.hp,
            maxHp: this.character.maxHp,
            exp: this.character.exp,
            maxExp: this.character.maxExp,
            gold: this.character.gold,
            baseAtk: this.character.baseAtk,
            baseDef: this.character.baseDef,
            equipment: {
                weapon: this.character.equipment.weapon ? this.serializeItem(this.character.equipment.weapon) : null,
                armor: this.character.equipment.armor ? this.serializeItem(this.character.equipment.armor) : null,
                accessory: this.character.equipment.accessory ? this.serializeItem(this.character.equipment.accessory) : null
            }
        };
    }
    
    /**
     * 反序列化角色數據
     */
    deserializeCharacter(data) {
        this.character.level = data.level;
        this.character.hp = data.hp;
        this.character.maxHp = data.maxHp;
        this.character.exp = data.exp;
        this.character.maxExp = data.maxExp;
        this.character.gold = data.gold;
        this.character.baseAtk = data.baseAtk;
        this.character.baseDef = data.baseDef;
        
        // 恢復裝備
        this.character.equipment.weapon = data.equipment.weapon ? this.deserializeItem(data.equipment.weapon) : null;
        this.character.equipment.armor = data.equipment.armor ? this.deserializeItem(data.equipment.armor) : null;
        this.character.equipment.accessory = data.equipment.accessory ? this.deserializeItem(data.equipment.accessory) : null;
    }
    
    /**
     * 序列化倉庫數據
     */
    serializeWarehouse() {
        return this.warehouse.items.map(item => this.serializeItem(item));
    }
    
    /**
     * 反序列化倉庫數據
     */
    deserializeWarehouse(data) {
        this.warehouse.items = data.map(itemData => this.deserializeItem(itemData));
    }
    
    /**
     * 序列化背包數據
     */
    serializeInventory() {
        return {
            maxSlots: this.inventory.maxSlots,
            items: this.inventory.items.map(item => this.serializeItem(item))
        };
    }
    
    /**
     * 反序列化背包數據
     */
    deserializeInventory(data) {
        this.inventory.maxSlots = data.maxSlots;
        this.inventory.items = data.items.map(itemData => this.deserializeItem(itemData));
    }
    
    /**
     * 序列化單個物品
     */
    serializeItem(item) {
        const baseData = {
            className: item.constructor.name,
            id: item.id,
            name: item.name,
            type: item.type,
            rarity: item.rarity,
            icon: item.icon,
            description: item.description,
            price: item.price
        };
        
        if (item instanceof Equipment) {
            return {
                ...baseData,
                atk: item.atk,
                def: item.def,
                critChance: item.critChance,
                critDamage: item.critDamage,
                weaponSpeed: item.weaponSpeed,
                attackSpeed: item.attackSpeed
            };
        } else if (item instanceof Consumable) {
            return {
                ...baseData,
                effect: item.effect
            };
        }
        
        return baseData;
    }
    
    /**
     * 反序列化單個物品
     */
    deserializeItem(data) {
        if (data.className === 'Equipment') {
            return new Equipment(
                data.id,
                data.name,
                data.type,
                data.rarity,
                data.icon,
                data.description,
                data.price,
                data.atk,
                data.def,
                data.critChance,
                data.critDamage,
                data.weaponSpeed,
                data.attackSpeed
            );
        } else if (data.className === 'Consumable') {
            return new Consumable(
                data.id,
                data.name,
                data.type,
                data.rarity,
                data.icon,
                data.description,
                data.price,
                data.effect
            );
        }
        
        return new Item(
            data.id,
            data.name,
            data.type,
            data.rarity,
            data.icon,
            data.description,
            data.price
        );
    }
}

// ===== 測試資料 =====

/**
 * 創建測試裝備
 */
function createTestEquipment() {
    return [
        // 武器 (id, name, type, rarity, icon, desc, price, atk, def, critChance, critDmg, weaponSpeed, attackSpeed)
        new Equipment('weapon_001', '新手之劍', ItemType.WEAPON, ItemRarity.COMMON, '⚔️', '一把普通的鐵劍', 100, 5, 0, 0.1, 1.5, 1.0, 1.0),
        new Equipment('weapon_002', '精鋼大劍', ItemType.WEAPON, ItemRarity.UNCOMMON, '🗡️', '精心打造的鋼劍，鋒利無比', 300, 12, 0, 0.15, 1.6, 0.9, 0.8),
        new Equipment('weapon_003', '火焰之劍', ItemType.WEAPON, ItemRarity.RARE, '🔥', '蘊含火焰力量的魔劍', 800, 20, 0, 0.2, 1.8, 1.2, 1.2),
        new Equipment('weapon_004', '龍牙劍', ItemType.WEAPON, ItemRarity.EPIC, '🐉', '以龍牙打造的傳說之劍', 2000, 35, 5, 0.25, 2.0, 0.8, 0.7),
        new Equipment('weapon_005', '神聖之劍', ItemType.WEAPON, ItemRarity.LEGENDARY, '✨', '神話中的聖劍', 5000, 50, 10, 0.3, 2.5, 1.5, 1.5),
        
        // 防具和飾品 (攻擊速度對非武器無意義，設為 1.0)
        new Equipment('armor_001', '布甲', ItemType.ARMOR, ItemRarity.COMMON, '👕', '簡單的布製防具', 80, 0, 3, 0, 1.0, 1.0, 1.0),
        new Equipment('armor_002', '鐵甲', ItemType.ARMOR, ItemRarity.UNCOMMON, '🛡️', '堅固的鐵製盔甲', 250, 0, 8, 0, 1.0, 1.0, 1.0),
        new Equipment('armor_003', '騎士鎧甲', ItemType.ARMOR, ItemRarity.RARE, '⚔️', '騎士專用的重型鎧甲', 700, 0, 15, 0, 1.0, 1.0, 1.0),
        new Equipment('armor_004', '龍鱗甲', ItemType.ARMOR, ItemRarity.EPIC, '🐲', '以龍鱗製作的強力鎧甲', 1800, 0, 25, 0, 1.0, 1.0, 1.0),
        
        new Equipment('acc_001', '銅戒指', ItemType.ACCESSORY, ItemRarity.COMMON, '💍', '普通的銅戒指', 50, 1, 1, 0, 1.0, 1.0, 1.0),
        new Equipment('acc_002', '力量護符', ItemType.ACCESSORY, ItemRarity.UNCOMMON, '🔮', '提升力量的魔法護符', 200, 5, 0, 0.05, 1.2, 1.0, 1.0),
        new Equipment('acc_003', '守護項鍊', ItemType.ACCESSORY, ItemRarity.RARE, '📿', '提供強大防護的項鍊', 600, 0, 10, 0, 1.0, 1.0, 1.0),
        new Equipment('acc_004', '鳳凰羽毛', ItemType.ACCESSORY, ItemRarity.LEGENDARY, '🪶', '傳說中的鳳凰羽毛', 3000, 15, 15, 0.1, 1.5, 1.0, 1.0)
    ];
}

/**
 * 創建測試道具
 */
function createTestConsumables() {
    return [
        new Consumable('potion_001', '小血瓶', ItemType.POTION, ItemRarity.COMMON, '🧪', '恢復 50 HP', 30, { hp: 50 }),
        new Consumable('potion_002', '中血瓶', ItemType.POTION, ItemRarity.UNCOMMON, '💊', '恢復 100 HP', 60, { hp: 100 }),
        new Consumable('potion_003', '大血瓶', ItemType.POTION, ItemRarity.RARE, '🍷', '恢復 200 HP', 120, { hp: 200 }),
        new Consumable('potion_004', '經驗藥水', ItemType.POTION, ItemRarity.UNCOMMON, '✨', '獲得 50 經驗值', 100, { exp: 50 }),
        
        new Consumable('mat_001', '鐵礦石', ItemType.MATERIAL, ItemRarity.COMMON, '⛏️', '用於打造裝備的基礎材料', 20, {}),
        new Consumable('mat_002', '魔法水晶', ItemType.MATERIAL, ItemRarity.RARE, '💎', '珍貴的魔法材料', 150, {}),
        new Consumable('mat_003', '龍鱗碎片', ItemType.MATERIAL, ItemRarity.EPIC, '🐉', '龍鱗的碎片，極為珍貴', 500, {})
    ];
}

/**
 * 初始化測試資料
 */
function initTestData(gameState) {
    // 添加測試裝備到倉庫
    const testEquipment = createTestEquipment();
    testEquipment.forEach(item => gameState.warehouse.addItem(item));
    
    // 添加測試道具到倉庫
    const testConsumables = createTestConsumables();
    testConsumables.forEach(item => gameState.warehouse.addItem(item));
    
    // 添加一些物品到背包進行測試
    gameState.inventory.addItem(new Equipment('weapon_test', '測試劍', ItemType.WEAPON, ItemRarity.COMMON, '⚔️', '測試用劍', 50, 3, 0, 0.1, 1.5, 1.0, 1.0));
    gameState.inventory.addItem(new Consumable('potion_test', '測試藥水', ItemType.POTION, ItemRarity.COMMON, '🧪', '測試用藥水', 20, { hp: 30 }));
}
