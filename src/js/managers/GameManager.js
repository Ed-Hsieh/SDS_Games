/**
 * GameManager.js
 * Singleton class for managing global game state.
 * Uses DataModel classes for robust state management.
 */
import { CharacterManager, Item, Equipment, Weapon, Armor, Accessory, Consumable } from '../models/DataModel.js';
import { ItemType, ItemRarity } from '../models/Enums.js';
import { EquipmentDatabase, SetDatabase } from '../data/Equipment.js';
import { createRuntimeItem } from '../models/ItemFactory.js';
import { ensureInstanceId, findMatchingStack, getSellPrice, isStackableItem } from '../models/ItemSchema.js';
import {
    DefaultUnlockedPassiveCombatEffectIds,
    getAllPassiveCombatEffects,
    getPassiveCombatEffect,
    getPassiveCombatEffectUnlockSource
} from '../data/PassiveCombatEffects.js';
import SaveManager from './SaveManager.js';

class GameManager {
    constructor() {
        if (GameManager.instance) {
            return GameManager.instance;
        }
        this.listeners = [];
        this.saveManager = new SaveManager(this);
        this.state = this.createInitialState();

        // Initialize with some items
        this.initInitialItems();

        GameManager.instance = this;
    }

    createInitialState() {
        return {
            character: new CharacterManager(),
            inventory: [], // Array of stacked items: { item: Item, quantity: number }
            inventoryCapacity: 10,
            warehouse: [], // Array of stacked items (Unlimited capacity)
            mapState: null,
            ui: {
                townNarrative: {
                    lines: [],
                    lastNarrativeAt: 0,
                    lastNarrativeTone: null,
                    resetOnNextLobby: false,
                    resetReason: null
                }
            },
            flags: {
                secretShopUnlocked: false
            }
        };
    }

    resetState() {
        this.state = this.createInitialState();
        this.initInitialItems();
        this.syncPassiveCombatEffectUnlocks('reset');
        this.notify('all');
        return this.state;
    }

    initInitialItems() {
        // Add initial items (using new stack system)
        // const oldSword = new Weapon('old_sword', '舊劍', ItemRarity.COMMON, '🗡️', '一把生鏽的舊劍。', 30, 5, 0, 0.08, 1.5, 1.0, 1.0);
        // const leatherArmor = new Armor('leather_armor', '皮甲', ItemRarity.COMMON, '🛡️', '普通的皮製護甲。', 50, 0, 2, 0.03, 1.2);
        
        // 直接裝備初始裝備
        // this.state.character.equip(oldSword);
        // this.state.character.equip(leatherArmor);
        
        this.addToInventory(new Consumable('health_potion_s', '小型生命藥水', ItemType.POTION, ItemRarity.COMMON, '🧪', '恢復少量生命值。', 20, { hp: 30 }), 3);
        
        // const coin = new Item('ancient_coin', '古代錢幣', ItemType.KEY, ItemRarity.LEGENDARY, '💸', '一枚古老的錢幣，似乎隱藏著秘密。', 500);
        // coin.isSecretKey = true;
        // this.addToInventory(coin);

        // this.addTest();
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
    }


    static getInstance() {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    registerSaveSystem(key, system) {
        return this.saveManager.registerSystem(key, system);
    }

    markSaveDirty(reason = 'state') {
        this.saveManager.markDirty(reason);
    }

    createSaveData() {
        return this.saveManager.createSaveData();
    }

    exportSaveJson(spaces = 2) {
        return this.saveManager.exportJson(spaces);
    }

    loadSaveData(saveData) {
        const result = this.saveManager.loadSaveData(saveData);
        const syncResult = this.syncPassiveCombatEffectUnlocks('load-save');
        if (syncResult.changed) this.notify('all');
        return result;
    }

    downloadSaveFile(filename) {
        return this.saveManager.downloadSaveFile(filename);
    }

    writeSaveFile(filename) {
        return this.saveManager.writeSaveFile(filename);
    }

    importSaveFile(file) {
        return this.saveManager.importFromFile(file);
    }

    readSaveFile() {
        return this.saveManager.readSaveFile();
    }

    resetSaveData() {
        return this.saveManager.resetToNewGame();
    }

    saveToLocalStorage() {
        return this.saveManager.saveToLocalStorage();
    }

    loadFromLocalStorage() {
        return this.saveManager.loadFromLocalStorage();
    }

    hasLocalSave() {
        return this.saveManager.hasLocalSave();
    }

    startAutosave(intervalMs) {
        return this.saveManager.startAutosave(intervalMs);
    }

    getTownNarrativeState() {
        if (!this.state.ui || typeof this.state.ui !== 'object') {
            this.state.ui = {};
        }

        if (!this.state.ui.townNarrative || typeof this.state.ui.townNarrative !== 'object') {
            this.state.ui.townNarrative = {};
        }

        const townNarrative = this.state.ui.townNarrative;
        if (!Array.isArray(townNarrative.lines)) {
            townNarrative.lines = [];
        }
        if (!Number.isFinite(Number(townNarrative.lastNarrativeAt))) {
            townNarrative.lastNarrativeAt = 0;
        }
        if (!['ambient', 'discovery', 'warning'].includes(townNarrative.lastNarrativeTone)) {
            townNarrative.lastNarrativeTone = null;
        }

        return townNarrative;
    }

    resetTownNarrativeState() {
        const townNarrative = this.getTownNarrativeState();
        townNarrative.lines = [];
        townNarrative.lastNarrativeAt = 0;
        townNarrative.lastNarrativeTone = null;
        townNarrative.resetOnNextLobby = false;
        townNarrative.resetReason = null;
        return townNarrative;
    }

    requestTownNarrativeReset(reason = 'adventure_return') {
        const townNarrative = this.getTownNarrativeState();
        townNarrative.resetOnNextLobby = true;
        townNarrative.resetReason = reason;
        return townNarrative;
    }
    
    // ===== Helper Methods =====
    
    isStackable(item) {
        return isStackableItem(item);
    }
    
    isHighRarity(item) {
        return [ItemRarity.RARE, ItemRarity.EPIC, ItemRarity.LEGENDARY].includes(item.rarity);
    }

    getPassiveEffectSourceItemIds() {
        const itemIds = new Set();
        const collect = stack => {
            const item = stack?.item || stack;
            if (item?.id) itemIds.add(item.id);
            if (item?.passiveEffectId && item?.id) itemIds.add(item.id);
        };

        (this.state.inventory || []).forEach(collect);
        (this.state.warehouse || []).forEach(collect);
        Object.values(this.state.character?.equipment || {}).forEach(collect);
        return itemIds;
    }

    resolvePassiveCombatEffectUnlockIds() {
        const ownedItemIds = this.getPassiveEffectSourceItemIds();
        const unlocked = new Set(DefaultUnlockedPassiveCombatEffectIds);

        for (const effect of getAllPassiveCombatEffects()) {
            const source = getPassiveCombatEffectUnlockSource(effect.id);
            const itemMatched = (source.itemIds || []).some(itemId => ownedItemIds.has(itemId));
            const questMatched = (source.questIds || []).some(questId => this.getFlag(`quest.${questId}.finished`));
            const flagMatched = (source.flags || []).some(flag => this.getFlag(flag));

            if (source.defaultUnlocked || itemMatched || questMatched || flagMatched) {
                unlocked.add(effect.id);
            }
        }

        return unlocked;
    }

    syncPassiveCombatEffectUnlocks(reason = 'state') {
        const character = this.state.character;
        if (!character) return { changed: false, unlockedIds: [] };

        const allEffectIds = getAllPassiveCombatEffects().map(effect => effect.id);
        const sourceUnlockedIds = this.resolvePassiveCombatEffectUnlockIds();
        const previousUnlockedIds = Array.isArray(character.unlockedPassiveEffectIds)
            ? character.unlockedPassiveEffectIds.filter(effectId => allEffectIds.includes(effectId))
            : [];
        const hadBetaFullUnlock = allEffectIds.length > 0
            && allEffectIds.every(effectId => previousUnlockedIds.includes(effectId))
            && !this.getFlag('passiveEffects.sourceLocked');
        const nextUnlockedSet = hadBetaFullUnlock
            ? new Set(sourceUnlockedIds)
            : new Set([...previousUnlockedIds, ...sourceUnlockedIds]);

        DefaultUnlockedPassiveCombatEffectIds.forEach(effectId => nextUnlockedSet.add(effectId));

        const nextUnlockedIds = allEffectIds.filter(effectId => nextUnlockedSet.has(effectId));
        const previousUnlockedSet = new Set(previousUnlockedIds);
        const newlyUnlockedIds = nextUnlockedIds.filter(effectId => !previousUnlockedSet.has(effectId));
        const slotCount = Math.max(1, Number(character.passiveEffectSlots) || 1);
        const previousEquippedIds = Array.isArray(character.equippedPassiveEffectIds)
            ? character.equippedPassiveEffectIds
            : [];
        const fallbackEffectId = DefaultUnlockedPassiveCombatEffectIds.find(effectId => nextUnlockedSet.has(effectId)) || nextUnlockedIds[0] || null;
        const nextEquippedIds = Array.from({ length: slotCount }, (_, index) => {
            const effectId = previousEquippedIds[index];
            if (nextUnlockedSet.has(effectId)) return effectId;
            return index === 0 ? fallbackEffectId : null;
        });

        const unlockedChanged = nextUnlockedIds.join('|') !== previousUnlockedIds.join('|');
        const equippedChanged = nextEquippedIds.join('|') !== previousEquippedIds.slice(0, slotCount).join('|');

        character.unlockedPassiveEffectIds = nextUnlockedIds;
        character.equippedPassiveEffectIds = nextEquippedIds;
        character.passiveEffectSlots = slotCount;
        this.state.flags['passiveEffects.sourceLocked'] = true;

        const changed = unlockedChanged || equippedChanged || hadBetaFullUnlock;
        if (changed) {
            this.markSaveDirty?.(`passive-effects-${reason}`);
        }
        if (newlyUnlockedIds.length > 0 && !['reset', 'load-save', 'lobby-render', 'state'].includes(reason)) {
            const recent = Array.isArray(this._recentPassiveCombatUnlocks)
                ? this._recentPassiveCombatUnlocks
                : [];
            this._recentPassiveCombatUnlocks = Array.from(new Set([...recent, ...newlyUnlockedIds]));
        }

        return {
            changed,
            unlockedIds: nextUnlockedIds,
            newlyUnlockedIds,
            prunedBetaUnlocks: hadBetaFullUnlock
        };
    }

    consumePassiveCombatUnlocks() {
        const ids = Array.isArray(this._recentPassiveCombatUnlocks)
            ? this._recentPassiveCombatUnlocks
            : [];
        this._recentPassiveCombatUnlocks = [];
        return ids
            .map(effectId => getPassiveCombatEffect(effectId))
            .filter(Boolean);
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
        const scheduleFrame = typeof requestAnimationFrame === 'function'
            ? requestAnimationFrame
            : callback => setTimeout(callback, 0);

        scheduleFrame(() => {
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
        const item = createRuntimeItem(itemData);
        const safeQuantity = Math.max(1, Number(quantity) || 1);
        const stackable = this.isStackable(item);

        if (stackable) {
            const existingStack = findMatchingStack(this.state.inventory, item);
            if (existingStack) {
                existingStack.quantity += safeQuantity;
                this.syncPassiveCombatEffectUnlocks('inventory-stack');
                this.notify('inventory');
                return true;
            }
        }

        if (this.state.inventory.length >= this.state.inventoryCapacity) {
            console.warn('Inventory is full!');
            return false;
        }

        ensureInstanceId(item);
        this.state.inventory.push({
            item,
            quantity: stackable ? safeQuantity : 1,
            instanceId: item.instanceId
        });

        this.syncPassiveCombatEffectUnlocks('inventory');
        this.notify('inventory');
        return true;
    }

    addToWarehouse(itemData, quantity = 1) {
        const item = createRuntimeItem(itemData);
        const safeQuantity = Math.max(1, Number(quantity) || 1);
        const stackable = this.isStackable(item);

        if (stackable) {
            const existingStack = findMatchingStack(this.state.warehouse, item);
            if (existingStack) {
                existingStack.quantity += safeQuantity;
                this.syncPassiveCombatEffectUnlocks('warehouse-stack');
                this.notify('warehouse');
                return true;
            }
        }

        ensureInstanceId(item);
        this.state.warehouse.push({
            item,
            quantity: stackable ? safeQuantity : 1,
            instanceId: item.instanceId
        });

        this.syncPassiveCombatEffectUnlocks('warehouse');
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
        
        if (!stack || (!stack.item.effect && !stack.item.buff)) {
            return false;
        }
        
        // Apply effect
        const char = this.state.character;
        const effect = stack.item.effect || {};
        if (effect.hp) {
            const healingBonus = typeof char.getPassiveCombatBonus === 'function'
                ? Math.max(0, Number(char.getPassiveCombatBonus('healingReceived')) || 0)
                : 0;
            const healAmount = Math.max(1, Math.floor(effect.hp * (1 + healingBonus)));
            char.hp = Math.min(char.maxHp, char.hp + healAmount);
        }
        if (effect.exp) {
            char.exp += effect.exp;
            char.checkLevelUp();
        }
        if (stack.item.buff && typeof char.addBuff === 'function') {
            char.addBuff(stack.item.buff.type, stack.item.buff.value, stack.item.buff.duration);
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
        this.syncPassiveCombatEffectUnlocks(`flag-${flag}`);
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
        this.state.inventory.splice(index, 1);

        if (this.isStackable(stack.item)) {
            const existingStack = findMatchingStack(this.state.warehouse, stack.item);
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

        const stack = this.state.warehouse[index];
        const existingStack = this.isStackable(stack.item)
            ? findMatchingStack(this.state.inventory, stack.item)
            : null;

        if (!existingStack && this.state.inventory.length >= this.state.inventoryCapacity) {
            console.warn('Inventory is full!');
            return false;
        }

        this.state.warehouse.splice(index, 1);

        if (existingStack) {
            existingStack.quantity += stack.quantity;
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
        const equipment = EquipmentDatabase[equipmentId];
        if (!equipment) return false;

        return toWarehouse
            ? this.addToWarehouse(equipment, quantity)
            : this.addToInventory(equipment, quantity);
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

    grantSetEquipmentForTesting(setIds = ['wolf_hunter', 'ancient_relic'], equipSetId = 'wolf_hunter') {
        const ids = Array.isArray(setIds) ? setIds : [setIds];
        const added = [];
        const equipped = [];

        const hasItem = (itemId) => {
            const equippedItems = Object.values(this.state.character?.equipment || {}).filter(Boolean);
            return equippedItems.some(item => item?.id === itemId)
                || (this.state.inventory || []).some(stack => stack?.item?.id === itemId)
                || (this.state.warehouse || []).some(stack => stack?.item?.id === itemId);
        };

        for (const setId of ids) {
            const set = SetDatabase[setId];
            if (!set || !Array.isArray(set.pieces)) continue;

            for (const pieceId of set.pieces) {
                if (hasItem(pieceId)) continue;
                if (this.addEquipmentById(pieceId, true, 1)) {
                    added.push(pieceId);
                }
            }
        }

        const setToEquip = SetDatabase[equipSetId];
        if (setToEquip && Array.isArray(setToEquip.pieces)) {
            for (const pieceId of setToEquip.pieces) {
                const alreadyEquipped = Object.values(this.state.character?.equipment || {})
                    .some(item => item?.id === pieceId);
                if (alreadyEquipped) continue;

                let stack = (this.state.warehouse || []).find(entry => entry?.item?.id === pieceId);
                if (stack && this.equipItem(stack.instanceId, true)) {
                    equipped.push(pieceId);
                    continue;
                }

                stack = (this.state.inventory || []).find(entry => entry?.item?.id === pieceId);
                if (stack && this.equipItem(stack.instanceId, false)) {
                    equipped.push(pieceId);
                }
            }
        }

        this.markSaveDirty?.('test-set-equipment');
        this.notify('all');

        return {
            added,
            equipped,
            sets: ids
                .map(setId => SetDatabase[setId])
                .filter(Boolean)
                .map(set => ({
                    id: set.id,
                    name: set.name,
                    pieces: set.pieces
                }))
        };
    }
    
    sellItem(instanceId, fromWarehouse = false) {
        const source = fromWarehouse ? this.state.warehouse : this.state.inventory;
        const index = source.findIndex(stack => stack.instanceId === instanceId);
        
        if (index === -1) return false;
        
        const stack = source[index];
        const sellPrice = getSellPrice(stack.item, stack.quantity);
        
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
        const previousEquipment = { ...(this.state.character.equipment || {}) };
        const equipped = this.state.character.equip(item);
        if (!equipped) return false;

        const equippedSlot = Object.keys(this.state.character.equipment || {})
            .find(slotType => this.state.character.equipment[slotType] === item);
        if (!equippedSlot) {
            this.state.character.equipment = previousEquipment;
            return false;
        }

        const oldItem = previousEquipment[equippedSlot];
        
        // Remove from source
        const index = source.findIndex(s => s.instanceId === instanceId);
        if (index < 0) {
            this.state.character.equipment = previousEquipment;
            return false;
        }
        source.splice(index, 1);

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

        if (equipment.enhancementBonuses && equipment.enhancementBonuses.noDurabilityLoss) {
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

const gameManagerInstance = GameManager.getInstance();

export default gameManagerInstance;

// 重新導出常用的 Model 類型，供 Scenes 使用（避免 Scenes 直接引用 Model）
export { Item, Equipment, Weapon, Armor, Accessory, Consumable, ItemType, ItemRarity };
