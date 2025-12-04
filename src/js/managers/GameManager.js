/**
 * GameManager.js
 * Singleton class for managing global game state.
 * Uses DataModel classes for robust state management.
 */
import { Character, Item, Equipment, Weapon, Armor, Accessory, Consumable, ItemType, ItemRarity } from '../models/DataModel.js';

class GameManager {
    constructor() {
        if (GameManager.instance) {
            return GameManager.instance;
        }
        this.listeners = [];
        
        this.state = {
            character: new Character(),
            inventory: [], // Array of stacked items: { item: Item, quantity: number }
            inventoryCapacity: 10,
            warehouse: [], // Array of stacked items (Unlimited capacity)
            flags: {
                secretShopUnlocked: false
            }
        };

        // Initialize with some items
        this.initInitialItems();

        GameManager.instance = this;
    }

    initInitialItems() {
        // Add initial items (using new stack system)
        this.addToInventory(new Weapon('old_sword', '舊劍', ItemRarity.COMMON, '🗡️', '一把生鏽的舊劍。', 30, 5, 0, 0.08, 1.5, 1.0, 1.0));
        this.addToInventory(new Armor('leather_armor', '皮甲', ItemRarity.COMMON, '🛡️', '普通的皮製護甲。', 50, 0, 8, 0.03, 1.2));
        this.addToInventory(new Consumable('health_potion_s', '小型生命藥水', ItemType.POTION, ItemRarity.COMMON, '🧪', '恢復少量生命值。', 20, { hp: 30 }), 3);
        
        const coin = new Item('ancient_coin', '古代錢幣', ItemType.KEY, ItemRarity.LEGENDARY, '🪙', '一枚古老的錢幣，似乎隱藏著秘密。', 500);
        coin.isSecretKey = true;
        this.addToInventory(coin);
        
        // Add some items to warehouse for testing
        this.addToWarehouse(new Consumable('mana_potion', '魔力藥水', ItemType.POTION, ItemRarity.UNCOMMON, '💙', '恢復魔力值。', 40, { mp: 50 }), 2);
        this.addToWarehouse(new Item('iron_ore', '鐵礦石', ItemType.MATERIAL, ItemRarity.COMMON, '⛏️', '用於鍛造的鐵礦石。', 10), 5);
        
        // === 測試材料：用於鍛造和套裝測試 ===
        this.addTestMaterials();
        
        // Debug: Log initial state
        console.log('GameManager initialized with state:', this.state);
    }
    
    /**
     * 添加測試材料 - 用於鍛造、詞綴和套裝測試
     */
    addTestMaterials() {
        // 基礎材料
        this.addToWarehouse(new Item('slime_jelly', '史萊姆凝膠', ItemType.MATERIAL, ItemRarity.COMMON, '🟢', '史萊姆的身體凝膠。', 5), 20);
        this.addToWarehouse(new Item('beast_hide', '獸皮', ItemType.MATERIAL, ItemRarity.COMMON, '🟤', '野獸的皮毛。', 8), 15);
        this.addToWarehouse(new Item('iron_ore', '鐵礦石', ItemType.MATERIAL, ItemRarity.COMMON, '⛏️', '基礎鍛造材料。', 15), 30);
        this.addToWarehouse(new Item('bone_fragment', '骨頭碎片', ItemType.MATERIAL, ItemRarity.COMMON, '🦴', '骷髏的骨頭碎片。', 12), 20);
        
        // 優秀材料
        this.addToWarehouse(new Item('wolf_pelt', '狼皮', ItemType.MATERIAL, ItemRarity.UNCOMMON, '🐺', '品質優良的狼皮。', 25), 10);
        this.addToWarehouse(new Item('spider_silk', '蜘蛛絲', ItemType.MATERIAL, ItemRarity.UNCOMMON, '🕸️', '堅韌的蜘蛛絲。', 18), 12);
        this.addToWarehouse(new Item('ancient_gear', '古代齒輪', ItemType.MATERIAL, ItemRarity.UNCOMMON, '⚙️', '古代機械的零件。', 60), 8);
        
        // 稀有材料
        this.addToWarehouse(new Item('forest_essence', '森林精華', ItemType.MATERIAL, ItemRarity.RARE, '✨', '森林的純淨精華。', 200), 5);
        this.addToWarehouse(new Item('dark_crystal', '暗黑水晶', ItemType.MATERIAL, ItemRarity.RARE, '🔮', '充滿黑暗能量的水晶。', 150), 5);
        this.addToWarehouse(new Item('mithril_ore', '秘銀礦', ItemType.MATERIAL, ItemRarity.RARE, '🔘', '珍貴的秘銀礦石。', 200), 5);
        this.addToWarehouse(new Item('dragon_tooth', '龍牙', ItemType.MATERIAL, ItemRarity.RARE, '🦷', '龍的牙齒。', 250), 3);
        
        // 史詩材料
        this.addToWarehouse(new Item('lich_phylactery', '巫妖命匣', ItemType.MATERIAL, ItemRarity.EPIC, '💀', '巫妖靈魂的容器。', 500), 2);
        this.addToWarehouse(new Item('ancient_rune', '古代符文', ItemType.MATERIAL, ItemRarity.EPIC, '📜', '記載古代力量的符文。', 350), 3);
        this.addToWarehouse(new Item('commander_blade', '指揮官之劍', ItemType.MATERIAL, ItemRarity.EPIC, '⚔️', '暗影指揮官的配劍碎片。', 600), 2);
        
        // 傳說材料
        this.addToWarehouse(new Item('titan_heart', '泰坦之心', ItemType.MATERIAL, ItemRarity.LEGENDARY, '❤️', '泰坦的心臟，蘊含遠古之力。', 1000), 1);
        this.addToWarehouse(new Item('dragon_heart', '龍心', ItemType.MATERIAL, ItemRarity.LEGENDARY, '💜', '龍的心臟，蘊含龍之力。', 1500), 1);
        this.addToWarehouse(new Item('legendary_shard', '傳說碎片', ItemType.MATERIAL, ItemRarity.LEGENDARY, '✨', '可用於製作任何傳說裝備。', 1500), 2);
        
        // 元素材料
        this.addToWarehouse(new Item('fire_essence', '火焰精華', ItemType.MATERIAL, ItemRarity.UNCOMMON, '🔥', '純粹的火焰能量。', 80), 8);
        this.addToWarehouse(new Item('ice_essence', '冰霜精華', ItemType.MATERIAL, ItemRarity.UNCOMMON, '❄️', '純粹的冰霜能量。', 80), 8);
        this.addToWarehouse(new Item('thunder_essence', '雷電精華', ItemType.MATERIAL, ItemRarity.UNCOMMON, '⚡', '純粹的雷電能量。', 80), 8);
        
        // 測試用金幣
        this.state.character.gold = 50000;
        
        // 測試用 BOSS 裝備（套裝測試）
        this.addBossEquipmentForTesting();
        
        console.log('Test materials added for forging and set bonus testing.');
    }
    
    /**
     * 添加 BOSS 裝備用於套裝測試
     */
    addBossEquipmentForTesting() {
        // 地獄騎士套裝（2件套）- 用於測試套裝效果
        const hellKnightArmor = new Armor(
            'hell_knight_armor', '地獄騎士鎧甲', ItemRarity.RARE, '🛡️',
            '來自地獄的騎士鎧甲。', 800, 5, 25, 0.05, 1.3
        );
        hellKnightArmor.setId = 'hell_knight_set';
        hellKnightArmor.hp = 50;
        hellKnightArmor.fireResist = 0.15;
        hellKnightArmor.gemSlots = 2;
        
        const hellKnightSword = new Weapon(
            'hell_knight_sword', '地獄騎士之劍', ItemRarity.RARE, '⚔️',
            '地獄騎士的配劍，燃燒著地獄火焰。', 700, 22, 5, 0.12, 1.8, 1.1, 1.15
        );
        hellKnightSword.setId = 'hell_knight_set';
        hellKnightSword.fireDamage = 12;
        hellKnightSword.gemSlots = 2;
        
        this.addToWarehouse(hellKnightArmor);
        this.addToWarehouse(hellKnightSword);
        
        // 深淵套裝（用於生命偷取測試）
        const abyssBlade = new Weapon(
            'abyss_blade', '深淵之刃', ItemRarity.EPIC, '⚔️',
            '深淵魔將的佩劍，帶有吸取生命的詛咒。', 1500, 35, 0, 0.15, 2.0, 1.2, 1.3
        );
        abyssBlade.setId = 'abyss_set';
        abyssBlade.lifesteal = 0.05;
        abyssBlade.gemSlots = 2;
        
        const abyssArmor = new Armor(
            'abyss_armor', '深淵戰甲', ItemRarity.EPIC, '🛡️',
            '深淵的黑暗力量凝聚而成的戰甲。', 1400, 8, 30, 0.08, 1.5
        );
        abyssArmor.setId = 'abyss_set';
        abyssArmor.hp = 80;
        abyssArmor.lifesteal = 0.03;
        abyssArmor.gemSlots = 2;
        
        this.addToWarehouse(abyssBlade);
        this.addToWarehouse(abyssArmor);
        
        // 龍族套裝（用於元素傷害測試）
        const elderDragonFang = new Weapon(
            'elder_dragon_fang', '古龍牙劍', ItemRarity.EPIC, '🐲',
            '由古龍牙齒鍛造的神劍。', 2500, 45, 0, 0.18, 2.2, 1.0, 1.1
        );
        elderDragonFang.setId = 'dragon_set';
        elderDragonFang.fireDamage = 15;
        elderDragonFang.gemSlots = 3;
        
        const dragonScaleArmor = new Armor(
            'dragon_scale_armor', '龍鱗戰甲', ItemRarity.EPIC, '🐉',
            '以古龍鱗片打造的戰甲。', 2200, 12, 40, 0.10, 1.6
        );
        dragonScaleArmor.setId = 'dragon_set';
        dragonScaleArmor.hp = 100;
        dragonScaleArmor.fireResist = 0.20;
        dragonScaleArmor.gemSlots = 2;
        
        this.addToWarehouse(elderDragonFang);
        this.addToWarehouse(dragonScaleArmor);
        
        // 額外的測試裝備（不帶套裝，用於詞綴測試）
        const testWeapon = new Weapon(
            'test_sword', '測試之劍', ItemRarity.UNCOMMON, '🗡️',
            '用於測試詞綴系統的劍。', 100, 10, 0, 0.10, 1.6, 1.0, 1.0
        );
        testWeapon.canEnhance = true;
        testWeapon.gemSlots = 1;
        
        const testArmor = new Armor(
            'test_armor', '測試護甲', ItemRarity.UNCOMMON, '🛡️',
            '用於測試詞綴系統的護甲。', 100, 0, 10, 0.05, 1.3
        );
        testArmor.canEnhance = true;
        testArmor.gemSlots = 1;
        
        const testAccessory = new Accessory(
            'test_ring', '測試戒指', ItemRarity.RARE, '💍',
            '用於測試詞綴系統的戒指。', 150, 5, 5, 0.08, 1.5
        );
        testAccessory.canEnhance = true;
        testAccessory.gemSlots = 1;
        
        this.addToWarehouse(testWeapon);
        this.addToWarehouse(testArmor);
        this.addToWarehouse(testAccessory);
    }

    static getInstance() {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }
    
    // ===== Helper Methods =====
    
    isStackable(item) {
        const stackableTypes = [ItemType.POTION, ItemType.SCROLL, ItemType.MATERIAL];
        return stackableTypes.includes(item.type);
    }
    
    isHighRarity(item) {
        return [ItemRarity.RARE, ItemRarity.EPIC, ItemRarity.LEGENDARY].includes(item.rarity);
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    unsubscribe(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    notify(eventType) {
        this.listeners.forEach(listener => listener(this.state, eventType));
    }

    // ===== State Modifiers =====

    getGold() {
        return this.state.character.gold;
    }

    addGold(amount) {
        this.state.character.gold += amount;
        this.notify('gold');
    }

    removeGold(amount) {
        if (this.state.character.gold >= amount) {
            this.state.character.gold -= amount;
            this.notify('gold');
            return true;
        }
        return false;
    }

    getInventory() {
        return this.state.inventory;
    }

    addToInventory(itemData, quantity = 1) {
        // Check inventory capacity
        if (this.state.inventory.length >= this.state.inventoryCapacity) {
            console.warn('Inventory is full!');
            return false;
        }
        
        let item;
        // Check if it's already an instance of Item
        if (itemData instanceof Item) {
            item = itemData;
        } else {
            // Convert plain object to Item instance
            if (itemData.type === ItemType.WEAPON) {
                // 武器：包含所有屬性
                item = new Weapon(
                    itemData.id, itemData.name, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price, 
                    itemData.attack || itemData.atk || 0, 
                    itemData.defense || itemData.def || 0,
                    itemData.critChance || 0.08, 
                    itemData.critDamage || 1.5, 
                    itemData.weaponSpeed || 1.0, 
                    itemData.attackSpeed || 1.0
                );
                // 保留圖片路徑
                if (itemData.image) item.image = itemData.image;
            } else if (itemData.type === ItemType.ARMOR) {
                // 防具：無 weaponSpeed 和 attackSpeed
                item = new Armor(
                    itemData.id, itemData.name, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price, 
                    itemData.attack || itemData.atk || 0, 
                    itemData.defense || itemData.def || 0,
                    itemData.critChance || 0.03, 
                    itemData.critDamage || 1.2
                );
                if (itemData.image) item.image = itemData.image;
            } else if (itemData.type === ItemType.ACCESSORY) {
                // 飾品：無 weaponSpeed 和 attackSpeed
                item = new Accessory(
                    itemData.id, itemData.name, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price, 
                    itemData.attack || itemData.atk || 0, 
                    itemData.defense || itemData.def || 0,
                    itemData.critChance || 0.05, 
                    itemData.critDamage || 1.3
                );
                if (itemData.image) item.image = itemData.image;
            } else if (itemData.type === ItemType.POTION) {
                item = new Consumable(
                    itemData.id, itemData.name, itemData.type, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price, 
                    { hp: itemData.hp, mp: itemData.mp, exp: itemData.exp }
                );
            } else {
                item = new Item(
                    itemData.id, itemData.name, itemData.type, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price
                );
            }
            
            // Preserve special flags
            if (itemData.isSecretKey) item.isSecretKey = true;
        }

        // Ensure unique instance ID
        if (!item.instanceId) {
             item.instanceId = Date.now() + Math.random().toString(36).substr(2, 9);
        }

        // Check if stackable
        if (this.isStackable(item)) {
            // Try to find existing stack
            const existingStack = this.state.inventory.find(stack => 
                stack.item.id === item.id && stack.item.rarity === item.rarity
            );
            
            if (existingStack) {
                existingStack.quantity += quantity;
                this.notify('inventory');
                return true;
            }
        }
        
        // Add as new stack (or non-stackable item)
        this.state.inventory.push({
            item: item,
            quantity: this.isStackable(item) ? quantity : 1,
            instanceId: item.instanceId
        });
        
        this.notify('inventory');
        return true;
    }

    addToWarehouse(itemData, quantity = 1) {
        let item;
        if (itemData instanceof Item) {
            item = itemData;
        } else {
            // Convert plain object to Item instance (same logic as inventory)
            if (itemData.type === ItemType.WEAPON) {
                item = new Weapon(
                    itemData.id, itemData.name, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price, 
                    itemData.attack || itemData.atk || 0, 
                    itemData.defense || itemData.def || 0,
                    itemData.critChance || 0.08, 
                    itemData.critDamage || 1.5, 
                    itemData.weaponSpeed || 1.0, 
                    itemData.attackSpeed || 1.0
                );
                if (itemData.image) item.image = itemData.image;
            } else if (itemData.type === ItemType.ARMOR) {
                item = new Armor(
                    itemData.id, itemData.name, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price, 
                    itemData.attack || itemData.atk || 0, 
                    itemData.defense || itemData.def || 0,
                    itemData.critChance || 0.03, 
                    itemData.critDamage || 1.2
                );
                if (itemData.image) item.image = itemData.image;
            } else if (itemData.type === ItemType.ACCESSORY) {
                item = new Accessory(
                    itemData.id, itemData.name, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price, 
                    itemData.attack || itemData.atk || 0, 
                    itemData.defense || itemData.def || 0,
                    itemData.critChance || 0.05, 
                    itemData.critDamage || 1.3
                );
                if (itemData.image) item.image = itemData.image;
            } else if (itemData.type === ItemType.POTION) {
                item = new Consumable(
                    itemData.id, itemData.name, itemData.type, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price, 
                    { hp: itemData.hp, mp: itemData.mp, exp: itemData.exp }
                );
            } else {
                item = new Item(
                    itemData.id, itemData.name, itemData.type, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price
                );
            }
            if (itemData.isSecretKey) item.isSecretKey = true;
        }
        
        if (!item.instanceId) {
             item.instanceId = Date.now() + Math.random().toString(36).substr(2, 9);
        }
        
        // Check if stackable and merge with existing
        if (this.isStackable(item)) {
            const existingStack = this.state.warehouse.find(stack => 
                stack.item.id === item.id && stack.item.rarity === item.rarity
            );
            
            if (existingStack) {
                existingStack.quantity += quantity;
                this.notify('warehouse');
                return true;
            }
        }
        
        // Add as new stack
        this.state.warehouse.push({
            item: item,
            quantity: this.isStackable(item) ? quantity : 1,
            instanceId: item.instanceId
        });
        
        this.notify('warehouse');
        return true;
    }
    
    removeFromInventory(itemId) {
        const index = this.state.inventory.findIndex(stack => stack.item.id === itemId);
        if (index > -1) {
            const removedStack = this.state.inventory.splice(index, 1)[0];
            this.notify('inventory');
            return removedStack.item;
        }
        return null;
    }
    
    removeItemByInstanceId(instanceId, fromWarehouse = false) {
        const source = fromWarehouse ? this.state.warehouse : this.state.inventory;
        const index = source.findIndex(stack => stack.instanceId === instanceId);
        
        if (index > -1) {
            const removedStack = source.splice(index, 1)[0];
            this.notify(fromWarehouse ? 'warehouse' : 'inventory');
            return removedStack.item;
        }
        return null;
    }
    
    // Use consumable (decrements quantity)
    useConsumable(instanceId, fromWarehouse = false) {
        const source = fromWarehouse ? this.state.warehouse : this.state.inventory;
        const stack = source.find(s => s.instanceId === instanceId);
        
        if (!stack || !stack.item.effect) {
            return false;
        }
        
        // Apply effect (no HP/MP check required)
        const char = this.state.character;
        if (stack.item.effect.hp) {
            char.hp = Math.min(char.maxHp, char.hp + stack.item.effect.hp);
        }
        if (stack.item.effect.mp) {
            char.mp = Math.min(char.maxMp, char.mp + stack.item.effect.mp);
        }
        if (stack.item.effect.exp) {
            char.exp += stack.item.effect.exp;
            char.checkLevelUp();
        }
        
        // Decrement quantity
        stack.quantity -= 1;
        
        // Remove if empty
        if (stack.quantity <= 0) {
            const index = source.findIndex(s => s.instanceId === instanceId);
            source.splice(index, 1);
        }
        
        this.notify('all');
        return true;
    }

    setFlag(flag, value) {
        this.state.flags[flag] = value;
        this.notify('flags');
    }

    getFlag(flag) {
        return this.state.flags[flag];
    }
    
    // ===== Item Transfer Methods =====
    
    moveToWarehouse(instanceId) {
        const index = this.state.inventory.findIndex(stack => stack.instanceId === instanceId);
        if (index === -1) return false;
        
        const stack = this.state.inventory[index];
        
        // Remove from inventory
        this.state.inventory.splice(index, 1);
        
        // Add to warehouse (will merge if stackable)
        if (this.isStackable(stack.item)) {
            const existingStack = this.state.warehouse.find(s => 
                s.item.id === stack.item.id && s.item.rarity === stack.item.rarity
            );
            
            if (existingStack) {
                existingStack.quantity += stack.quantity;
            } else {
                this.state.warehouse.push(stack);
            }
        } else {
            this.state.warehouse.push(stack);
        }
        
        this.notify('all');
        return true;
    }
    
    moveToInventory(instanceId) {
        const index = this.state.warehouse.findIndex(stack => stack.instanceId === instanceId);
        if (index === -1) return false;
        
        // Check capacity
        if (this.state.inventory.length >= this.state.inventoryCapacity) {
            console.warn('Inventory is full!');
            return false;
        }
        
        const stack = this.state.warehouse[index];
        
        // Remove from warehouse
        this.state.warehouse.splice(index, 1);
        
        // Add to inventory (will merge if stackable)
        if (this.isStackable(stack.item)) {
            const existingStack = this.state.inventory.find(s => 
                s.item.id === stack.item.id && s.item.rarity === stack.item.rarity
            );
            
            if (existingStack) {
                existingStack.quantity += stack.quantity;
            } else {
                this.state.inventory.push(stack);
            }
        } else {
            this.state.inventory.push(stack);
        }
        
        this.notify('all');
        return true;
    }
    
    sellItem(instanceId, fromWarehouse = false) {
        const source = fromWarehouse ? this.state.warehouse : this.state.inventory;
        const index = source.findIndex(stack => stack.instanceId === instanceId);
        
        if (index === -1) return false;
        
        const stack = source[index];
        const sellPrice = Math.floor(stack.item.price * 0.5) * stack.quantity;
        
        // Remove item
        source.splice(index, 1);
        
        // Add gold
        this.state.character.gold += sellPrice;
        
        this.notify('all');
        return sellPrice;
    }
    
    /**
     * 添加物品到背包（通用方法，用於鍛造等系統）
     */
    addItem(itemData, quantity = 1) {
        return this.addToInventory(itemData, quantity);
    }
    
    /**
     * 移除指定數量的材料（從背包和倉庫中）
     * @param {string} materialId - 材料ID
     * @param {number} quantity - 數量
     * @returns {boolean} 是否成功移除
     */
    removeMaterial(materialId, quantity) {
        let remaining = quantity;
        
        // 先從背包移除
        for (let i = this.state.inventory.length - 1; i >= 0 && remaining > 0; i--) {
            const stack = this.state.inventory[i];
            if (stack.item.id === materialId) {
                if (stack.quantity <= remaining) {
                    remaining -= stack.quantity;
                    this.state.inventory.splice(i, 1);
                } else {
                    stack.quantity -= remaining;
                    remaining = 0;
                }
            }
        }
        
        // 如果背包不夠，從倉庫移除
        for (let i = this.state.warehouse.length - 1; i >= 0 && remaining > 0; i--) {
            const stack = this.state.warehouse[i];
            if (stack.item.id === materialId) {
                if (stack.quantity <= remaining) {
                    remaining -= stack.quantity;
                    this.state.warehouse.splice(i, 1);
                } else {
                    stack.quantity -= remaining;
                    remaining = 0;
                }
            }
        }
        
        if (remaining === 0) {
            this.notify('all');
            return true;
        }
        
        return false;
    }
    
    discardItem(instanceId, fromWarehouse = false) {
        const source = fromWarehouse ? this.state.warehouse : this.state.inventory;
        const stack = source.find(s => s.instanceId === instanceId);
        
        if (!stack) return false;
        
        // Check rarity for confirmation
        if (this.isHighRarity(stack.item)) {
            // Return false to trigger UI confirmation
            return 'confirm';
        }
        
        // Remove item
        const index = source.findIndex(s => s.instanceId === instanceId);
        source.splice(index, 1);
        
        this.notify(fromWarehouse ? 'warehouse' : 'inventory');
        return true;
    }
    
    equipItem(instanceId, fromWarehouse = false) {
        const source = fromWarehouse ? this.state.warehouse : this.state.inventory;
        const stack = source.find(s => s.instanceId === instanceId);
        
        if (!stack || !stack.item.isEquipment()) return false;
        
        const item = stack.item;
        const slotType = item.type;
        const oldItem = this.state.character.equipment[slotType];
        
        // Remove from source
        const index = source.findIndex(s => s.instanceId === instanceId);
        source.splice(index, 1);
        
        // Equip new item
        this.state.character.equip(item);
        
        // Return old item to source
        if (oldItem) {
            source.push({
                item: oldItem,
                quantity: 1,
                instanceId: oldItem.instanceId
            });
        }
        
        this.notify('all');
        return true;
    }
    
    // Character methods
    getCharacter() {
        return this.state.character;
    }
}

export default GameManager.getInstance();
