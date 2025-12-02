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
        
        // Debug: Log initial state
        console.log('GameManager initialized with state:', this.state);
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
