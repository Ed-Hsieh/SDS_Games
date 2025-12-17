/**
 * GameManager.js
 * Singleton class for managing global game state.
 * Uses DataModel classes for robust state management.
 */
import { CharacterManager, Item, Equipment, Weapon, Armor, Accessory, Consumable, ItemType, ItemRarity } from '../models/DataModel.js';
import { EquipmentDatabase, SetDatabase } from '../data/Equipment.js';

class GameManager {
    constructor() {
        if (GameManager.instance) {
            return GameManager.instance;
        }
        this.listeners = [];
        
        this.state = {
            character: new CharacterManager(),
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
        // const oldSword = new Weapon('old_sword', '舊劍', ItemRarity.COMMON, '🗡️', '一把生鏽的舊劍。', 30, 5, 0, 0.08, 1.5, 1.0, 1.0);
        // const leatherArmor = new Armor('leather_armor', '皮甲', ItemRarity.COMMON, '🛡️', '普通的皮製護甲。', 50, 0, 2, 0.03, 1.2);
        
        // 直接裝備初始裝備
        // this.state.character.equip(oldSword);
        // this.state.character.equip(leatherArmor);
        
        this.addToInventory(new Consumable('health_potion_s', '小型生命藥水', ItemType.POTION, ItemRarity.COMMON, '🧪', '恢復少量生命值。', 20, { hp: 30 }), 3);
        
        const coin = new Item('ancient_coin', '古代錢幣', ItemType.KEY, ItemRarity.LEGENDARY, '💸', '一枚古老的錢幣，似乎隱藏著秘密。', 500);
        coin.isSecretKey = true;
        this.addToInventory(coin);

        this.addTest();
    }
    
    /**
     * 添加測試材料 - 用於鍛造、詞綴和套裝測試
     */
    addTest() {
     
        // 測試用金幣
        this.state.character.gold = 50000;
        
        // 加入所有套裝到倉庫以便測試套裝效果
        for (const setId of Object.keys(SetDatabase)) {
            try {
                this.addSetToWarehouse(setId, true);
            } catch (e) {
                console.warn('Failed to add set for testing:', setId, e);
            }
        }

        this.notify('all');
        console.log('Test materials and all sets added for forging and set bonus testing.');
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

    // Batch/throttle notify to avoid flooding UI with rapid updates.
    // Collect event types and schedule a single dispatch on next animation frame.
    notify(eventType) {
        if (!this._pendingNotifyTypes) this._pendingNotifyTypes = new Set();
        if (!this._notifyScheduled) this._pendingNotifyTypes.clear();

        this._pendingNotifyTypes.add(eventType);

        if (this._notifyScheduled) return;

        this._notifyScheduled = true;
        requestAnimationFrame(() => {
            this._notifyScheduled = false;

            // If multiple different event types accumulated, send a single 'all' update
            // so listeners can choose to refresh fully. If only one type, forward it.
            let dispatchedType = 'all';
            if (this._pendingNotifyTypes.size === 1) {
                dispatchedType = Array.from(this._pendingNotifyTypes)[0];
            }

            this.listeners.forEach(listener => {
                try {
                    listener(this.state, dispatchedType);
                } catch (e) {
                    console.error('Error in listener during notify:', e);
                }
            });

            this._pendingNotifyTypes.clear();
        });
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
                // 支援從 itemData.stats 讀取欄位以兼容新資料結構
                const stats = itemData.stats || {};
                const atk = itemData.attack || itemData.atk || stats.attack || stats.atk || 0;
                const def = itemData.defense || itemData.def || stats.defense || stats.def || 0;
                const critChance = itemData.critChance || stats.critChance || 0.08;
                const critDamage = itemData.critDamage || stats.critDamage || 1.5;
                const weaponSpeed = itemData.weaponSpeed || stats.weaponSpeed || 1.0;
                const attackSpeed = itemData.attackSpeed || stats.attackSpeed || 1.0;

                item = new Weapon(
                    itemData.id, itemData.name, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price, 
                    atk, def, critChance, critDamage, weaponSpeed, attackSpeed
                );
                if (itemData.image) item.image = itemData.image;
            } else if (itemData.type === ItemType.ARMOR) {
                // 支援從 itemData.stats 讀取欄位以兼容新資料結構
                const stats = itemData.stats || {};
                const atk = itemData.attack || itemData.atk || stats.attack || stats.atk || 0;
                const def = itemData.defense || itemData.def || stats.defense || stats.def || 0;
                const critChance = itemData.critChance || stats.critChance || 0.03;
                const critDamage = itemData.critDamage || stats.critDamage || 1.2;

                item = new Armor(
                    itemData.id, itemData.name, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price, 
                    atk, def, critChance, critDamage
                );
                if (itemData.image) item.image = itemData.image;
            } else if (itemData.type === ItemType.ACCESSORY) {
                const stats = itemData.stats || {};
                const atk = itemData.attack || itemData.atk || stats.attack || stats.atk || 0;
                const def = itemData.defense || itemData.def || stats.defense || stats.def || 0;
                const critChance = itemData.critChance || stats.critChance || 0.05;
                const critDamage = itemData.critDamage || stats.critDamage || 1.3;

                item = new Accessory(
                    itemData.id, itemData.name, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price, 
                    atk, def, critChance, critDamage
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

            // 如果原始資料提供了 specialEffects 或 affixes，保留到實例上
            if (itemData.specialEffects) {
                try { item.specialEffects = JSON.parse(JSON.stringify(itemData.specialEffects)); } catch (e) { item.specialEffects = itemData.specialEffects; }
                // 同時為向後相容複製常用特效到頂層屬性（例如 lifesteal, damageReduction）
                for (const eff of item.specialEffects) {
                    if (!eff || !eff.type) continue;
                    const t = String(eff.type).toLowerCase();
                    const v = eff.value;
                    if (t.includes('life') && t.includes('steal') || t === 'lifesteal' || t === 'life_steal') {
                        item.lifesteal = (item.lifesteal || 0) + v;
                    }
                    if (t.includes('damage') && t.includes('reduction') || t === 'damage_reduction') {
                        item.damageReduction = (item.damageReduction || 0) + v;
                    }
                }
            }

            // 若存在舊式 affix 列表或 affixBonuses，保留
            if (itemData.affixes) item.affixes = itemData.affixes;
            if (itemData.affixBonuses) item.affixBonuses = itemData.affixBonuses;
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

    /**
     * Create a runtime Item instance from `EquipmentDatabase` entry and add it to warehouse or inventory.
     * Preserves stats, setId, specialEffects and affixes where present.
     */
    addEquipmentById(equipmentId, toWarehouse = true, quantity = 1) {
        const equip = EquipmentDatabase[equipmentId];
        if (!equip) return false;

        const stats = equip.stats || {};
        const price = equip.price || 0;

        // Normalize type mapping: Equipment entries use 'weapon'|'equipment'|'accessory'
        let targetType = ItemType.ARMOR; // default
        if (equip.type === 'weapon') targetType = ItemType.WEAPON;
        else if (equip.type === 'accessory') targetType = ItemType.ACCESSORY;

        let instance;
        if (targetType === ItemType.WEAPON) {
            instance = new Weapon(
                equip.id,
                equip.name,
                equip.rarity || ItemRarity.COMMON,
                equip.icon || '',
                equip.description || '',
                price,
                stats.attack || 0,
                stats.defense || 0,
                stats.critChance || 0.08,
                stats.critDamage || 1.5,
                stats.weaponSpeed || 1.0,
                stats.attackSpeed || 1.0
            );
        } else if (targetType === ItemType.ACCESSORY) {
            instance = new Accessory(
                equip.id,
                equip.name,
                equip.rarity || ItemRarity.COMMON,
                equip.icon || '',
                equip.description || '',
                price,
                stats.attack || 0,
                stats.defense || 0,
                stats.critChance || 0.05,
                stats.critDamage || 1.3
            );
        } else {
            instance = new Armor(
                equip.id,
                equip.name,
                equip.rarity || ItemRarity.COMMON,
                equip.icon || '',
                equip.description || '',
                price,
                stats.attack || 0,
                stats.defense || 0,
                stats.critChance || 0.03,
                stats.critDamage || 1.2
            );
        }

        // Preserve metadata
        if (equip.setId) instance.setId = equip.setId;
        if (equip.dropFrom) instance.dropFrom = Array.isArray(equip.dropFrom) ? [...equip.dropFrom] : [equip.dropFrom];
        if (equip.specialEffects) {
            instance.specialEffects = JSON.parse(JSON.stringify(equip.specialEffects));
            // also copy common convenience fields for backward compatibility
            for (const eff of instance.specialEffects) {
                if (!eff || !eff.type) continue;
                const t = String(eff.type).toLowerCase();
                const v = eff.value;
                if (t.includes('life') && t.includes('steal') || t === 'lifesteal' || t === 'life_steal') {
                    instance.lifesteal = (instance.lifesteal || 0) + v;
                }
                if (t.includes('damage') && t.includes('reduction') || t === 'damage_reduction') {
                    instance.damageReduction = (instance.damageReduction || 0) + v;
                }
            }
        }
        if (equip.durability !== undefined) instance.durability = equip.durability;
        if (equip.maxDurability !== undefined) instance.maxDurability = equip.maxDurability;
        if (equip.affixes) instance.affixes = JSON.parse(JSON.stringify(equip.affixes));

        // Add to target
        if (toWarehouse) return this.addToWarehouse(instance, quantity);
        return this.addToInventory(instance, quantity);
    }

    /**
     * Add all pieces of a set (by setId) into warehouse or inventory for testing.
     */
    addSetToWarehouse(setId, toWarehouse = true) {
        const set = SetDatabase[setId];
        if (!set || !Array.isArray(set.pieces)) return false;

        for (const pieceId of set.pieces) {
            this.addEquipmentById(pieceId, toWarehouse, 1);
        }

        this.notify('warehouse');
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
    
    /**
     * 卸下裝備並放入背包或倉庫
     * @param {string} slotType - 裝備槽位類型 (weapon, armor, accessory)
     * @param {boolean} toWarehouse - 是否放入倉庫（預設放入背包）
     * @returns {boolean} 是否成功卸下
     */
    unequipItem(slotType, toWarehouse = false) {
        const item = this.state.character.equipment[slotType];
        if (!item) return false;
        
        const target = toWarehouse ? this.state.warehouse : this.state.inventory;
        
        // 檢查背包容量（倉庫無限）
        if (!toWarehouse && this.state.inventory.length >= this.state.inventoryCapacity) {
            console.warn('背包已滿，無法卸下裝備');
            return false;
        }
        
        // 卸下裝備
        this.state.character.equipment[slotType] = null;
        
        // 放入目標位置
        target.push({
            item: item,
            quantity: 1,
            instanceId: item.instanceId || `unequipped_${Date.now()}`
        });
        
        this.notify('all');
        return true;
    }
    
    // ===== 耐久度系統 =====
    
    /**
     * 檢查裝備是否有「完美無瑕」詞綴（不會損失耐久度）
     */
    hasNoDurabilityLossAffix(equipment) {
        if (!equipment) return false;
        
        // 檢查 affixBonuses
        if (equipment.affixBonuses && equipment.affixBonuses.noDurabilityLoss) {
            return true;
        }
        
        // 檢查 affixes 數組
        if (equipment.affixes) {
            return equipment.affixes.some(affix => 
                affix.stats && (affix.stats.noDurabilityLoss === 1 || affix.stats.noDurabilityLoss === true || affix.stats.noDurabilityLoss >= 1)
            );
        }
        
        return false;
    }
    
    /**
     * 減少武器耐久度（攻擊時調用）
     * @returns {Object|null} 如果裝備損壞返回裝備資訊，否則返回 null
     */
    reduceWeaponDurability() {
        const weapon = this.state.character.equipment.weapon;
        if (!weapon) return null;
        
        // 檢查是否有「完美無瑕」詞綴
        if (this.hasNoDurabilityLossAffix(weapon)) {
            return null;
        }
        
        // 如果沒有耐久度屬性，初始化
        if (weapon.durability === undefined) {
            weapon.durability = 50;
            weapon.maxDurability = 50;
        }
        
        weapon.durability = Math.max(0, weapon.durability - 1);
        
        // 耐久度歸零，裝備消失
        if (weapon.durability <= 0) {
            const destroyedWeapon = { ...weapon };
            this.state.character.equipment.weapon = null;
            this.notify('equipment');
            return destroyedWeapon;
        }
        
        return null;
    }
    
    /**
     * 減少防具耐久度（被攻擊時調用）
     * @returns {Object|null} 如果裝備損壞返回裝備資訊，否則返回 null
     */
    reduceArmorDurability() {
        const armor = this.state.character.equipment.armor;
        if (!armor) return null;
        
        // 檢查是否有「完美無瑕」詞綴
        if (this.hasNoDurabilityLossAffix(armor)) {
            return null;
        }
        
        // 如果沒有耐久度屬性，初始化
        if (armor.durability === undefined) {
            armor.durability = 50;
            armor.maxDurability = 50;
        }
        
        armor.durability = Math.max(0, armor.durability - 1);
        
        // 耐久度歸零，裝備消失
        if (armor.durability <= 0) {
            const destroyedArmor = { ...armor };
            this.state.character.equipment.armor = null;
            this.notify('equipment');
            return destroyedArmor;
        }
        
        return null;
    }
    
    /**
     * 獲取裝備耐久度資訊
     */
    getEquipmentDurability(slotType) {
        const equipment = this.state.character.equipment[slotType];
        if (!equipment) return null;
        
        return {
            current: equipment.durability ?? 50,
            max: equipment.maxDurability ?? 50
        };
    }
    
    // Character methods
    getCharacter() {
        return this.state.character;
    }
}

export default GameManager.getInstance();

// 重新導出常用的 Model 類型，供 Scenes 使用（避免 Scenes 直接引用 Model）
export { Item, Equipment, Weapon, Armor, Accessory, Consumable, ItemType, ItemRarity };
