/**
 * GameManager.js
 * Singleton class for managing global game state.
 * Uses DataModel classes for robust state management.
 */
import { CharacterManager, Consumable } from '../models/DataModel.js';
import { ItemType, ItemRarity } from '../models/Enums.js';
import { createRuntimeItem } from '../models/ItemFactory.js';
import { ensureInstanceId, findMatchingStack, getSellPrice, isStackableItem, normalizeItemType } from '../models/ItemSchema.js';
import {
    DefaultUnlockedPassiveCombatEffectIds,
    getAllPassiveCombatEffects,
    getPassiveCombatEffect,
    getPassiveCombatEffectUnlockSource
} from '../data/PassiveCombatEffects.js';
import SaveManager from './SaveManager.js';
import { ItemDatabase } from '../data/UtilityItems.js';

const WOLF_SMOKE_CODEX_FLAG = 'encyclopedia.item.wolf_smoke';

export const INVENTORY_UPGRADE_TIERS = [
    {
        level: 0,
        capacity: 10,
        label: '舊行囊',
        materials: []
    },
    {
        level: 1,
        capacity: 13,
        label: '加固行囊',
        materials: [
            { id: 'beast_hide', quantity: 3 },
            { id: 'slime_jelly', quantity: 4 }
        ]
    },
    {
        level: 2,
        capacity: 16,
        label: '獵人背包',
        materials: [
            { id: 'wolf_pelt', quantity: 3 },
            { id: 'spider_silk', quantity: 4 },
            { id: 'iron_shard', quantity: 4 }
        ]
    },
    {
        level: 3,
        capacity: 19,
        label: '遠行背架',
        materials: [
            { id: 'iron_ore', quantity: 4 },
            { id: 'ancient_bark', quantity: 3 },
            { id: 'rare_metal', quantity: 1 }
        ]
    },
    {
        level: 4,
        capacity: 22,
        label: '大探險背包',
        materials: [
            { id: 'rare_metal', quantity: 3 },
            { id: 'forge_core', quantity: 2 },
            { id: 'forest_essence', quantity: 1 }
        ]
    }
];

export const MIA_EMERGENCY_POTION_LIMIT = 3;

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
            inventoryUpgradeLevel: 0,
            warehouse: [], // Array of stacked items (Unlimited capacity)
            mapState: null,
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
        // Every new run starts with one explicit way to leave the field.
        this.addToInventory(ItemDatabase.wolf_smoke, 1, { persist: false, notify: false });
        this.state.flags[WOLF_SMOKE_CODEX_FLAG] = true;
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

    commitStateMutation(reason, notifyType = 'all', options = {}) {
        if (options.persist !== false) this.markSaveDirty(reason);
        if (options.notify !== false && notifyType) this.notify(notifyType);
    }

    createSaveData() {
        return this.saveManager.createSaveData();
    }

    exportSaveJson(spaces = 2) {
        return this.saveManager.exportJson(spaces);
    }

    loadSaveData(saveData) {
        return this.saveManager.loadSaveData(saveData);
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

    // ===== Helper Methods =====
    
    isStackable(item) {
        return isStackableItem(item);
    }
    
    isHighRarity(item) {
        return [ItemRarity.RARE, ItemRarity.EPIC, ItemRarity.LEGENDARY].includes(item.rarity);
    }

    resolvePassiveCombatEffectUnlockIds() {
        const unlocked = new Set(DefaultUnlockedPassiveCombatEffectIds);

        for (const effect of getAllPassiveCombatEffects()) {
            const source = getPassiveCombatEffectUnlockSource(effect.id);
            const questMatched = (source.questIds || []).some(questId => this.getFlag(`quest.${questId}.finished`));
            const achievementMatched = this.getFlag(`passiveEffects.achievement.${effect.id}`);
            const flagMatched = achievementMatched || (source.flags || []).some(flag => this.getFlag(flag));

            if (source.defaultUnlocked || questMatched || flagMatched) {
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
        const nextUnlockedSet = new Set(sourceUnlockedIds);

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

        const changed = unlockedChanged || equippedChanged;
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
            newlyUnlockedIds
        };
    }

    getPassiveCombatEffectLoadout() {
        const character = this.state.character;
        if (!character) {
            return {
                slotCount: 0,
                slots: [],
                catalog: [],
                hasUnread: false
            };
        }

        const slotCount = Math.max(1, Number(character.passiveEffectSlots) || 1);
        const equippedIds = Array.isArray(character.equippedPassiveEffectIds)
            ? character.equippedPassiveEffectIds.slice(0, slotCount)
            : [];
        const unlockedIds = new Set(Array.isArray(character.unlockedPassiveEffectIds)
            ? character.unlockedPassiveEffectIds
            : []);
        const effects = getAllPassiveCombatEffects();
        const effectById = new Map(effects.map(effect => [effect.id, effect]));

        return {
            slotCount,
            slots: Array.from({ length: slotCount }, (_, index) => effectById.get(equippedIds[index]) || null),
            catalog: effects.map(effect => ({
                effect,
                unlocked: unlockedIds.has(effect.id),
                equipped: equippedIds.includes(effect.id),
                unread: this.hasUnreadPassiveCombatEffect(effect.id),
                sourceText: getPassiveCombatEffectUnlockSource(effect.id).sourceText || ''
            })),
            hasUnread: this.hasUnreadPassiveCombatEffects()
        };
    }

    equipPassiveCombatEffect(effectId, slotIndex = 0) {
        const character = this.state.character;
        const effect = getPassiveCombatEffect(effectId);
        if (!character || !effect) {
            return { success: false, reason: 'unknown-effect', effect: null };
        }

        this.syncPassiveCombatEffectUnlocks('state');
        if (!character.unlockedPassiveEffectIds?.includes(effectId)) {
            return { success: false, reason: 'locked', effect };
        }

        const success = character.equipPassiveCombatEffect(effectId, slotIndex);
        if (!success) {
            return { success: false, reason: 'invalid-slot', effect };
        }

        this.markSaveDirty('passive-combat-effect');
        this.notify('all');
        return {
            success: true,
            reason: null,
            effect,
            loadout: this.getPassiveCombatEffectLoadout()
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

    hasPassiveCombatEffectAchievement(effectId) {
        if (!effectId) return false;
        return Boolean(this.getFlag(`passiveEffects.achievement.${effectId}`))
            || DefaultUnlockedPassiveCombatEffectIds.includes(effectId);
    }

    hasUnreadPassiveCombatEffects() {
        return getAllPassiveCombatEffects()
            .some(effect => this.getFlag(`passiveEffects.unread.${effect.id}`));
    }

    hasUnreadPassiveCombatEffect(effectId) {
        return Boolean(effectId && this.getFlag(`passiveEffects.unread.${effectId}`));
    }

    clearPassiveCombatEffectNotice(effectId) {
        if (!effectId) return false;
        const key = `passiveEffects.unread.${effectId}`;
        if (!this.getFlag(key)) return false;
        this.state.flags[key] = false;
        this.markSaveDirty?.('passive-effect-read');
        this.notify('flags');
        return true;
    }

    clearPassiveCombatEffectNotices() {
        let changed = false;
        for (const effect of getAllPassiveCombatEffects()) {
            const key = `passiveEffects.unread.${effect.id}`;
            if (this.getFlag(key)) {
                this.state.flags[key] = false;
                changed = true;
            }
        }
        if (changed) {
            this.markSaveDirty?.('passive-effects-read');
            this.notify('flags');
        }
    }

    unlockPassiveCombatEffectAchievement(effectId, sourceItem = null) {
        const effect = getPassiveCombatEffect(effectId);
        const character = this.state.character;
        if (!effect || !character) return { success: false, alreadyUnlocked: false, effect: null };

        const wasUnlocked = this.hasPassiveCombatEffectAchievement(effectId);
        this.state.flags[`passiveEffects.achievement.${effectId}`] = true;
        this.state.flags[`passiveEffects.unread.${effectId}`] = true;
        if (sourceItem?.id) this.state.flags[`passiveEffects.sourceItem.${sourceItem.id}`] = true;

        const syncResult = this.syncPassiveCombatEffectUnlocks('passive-achievement');
        this.markSaveDirty?.('passive-achievement');
        this.notify('all');

        return {
            success: true,
            alreadyUnlocked: wasUnlocked,
            effect,
            syncResult
        };
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

    addGold(amount, options = {}) {
        const delta = Number(amount) || 0;
        if (delta === 0) return this.state.character.gold;
        this.state.character.gold += delta;
        this.commitStateMutation(options.reason || 'gold-change', 'gold', options);
        return this.state.character.gold;
    }

    removeGold(amount, options = {}) {
        const cost = Math.max(0, Number(amount) || 0);
        if (cost === 0) return true;
        if (this.state.character.gold >= cost) {
            this.state.character.gold -= cost;
            this.commitStateMutation(options.reason || 'gold-change', 'gold', options);
            return true;
        }
        return false;
    }

    getInventory() {
        return this.state.inventory;
    }

    getInventoryCapacity() {
        return Math.max(0, Number(this.state.inventoryCapacity) || 0);
    }

    getWarehouse() {
        return this.state.warehouse;
    }

    getOverworldMapProgress() {
        const progress = this.state.mapState;
        if (!progress) return null;
        return {
            ...progress,
            playerPos: progress.playerPos ? { ...progress.playerPos } : null,
            exploredCells: [...(progress.exploredCells || [])],
            discoveredLandmarks: [...(progress.discoveredLandmarks || [])]
        };
    }

    saveOverworldMapProgress(progress, reason = 'overworld-map') {
        this.state.mapState = progress ? {
            ...progress,
            playerPos: progress.playerPos ? { ...progress.playerPos } : null,
            exploredCells: [...(progress.exploredCells || [])],
            discoveredLandmarks: [...(progress.discoveredLandmarks || [])]
        } : null;
        this.markSaveDirty(reason);
        return this.getOverworldMapProgress();
    }

    getEquipmentEntries({ includeWarehouse = false } = {}) {
        const entries = [];
        const add = (item, source, sourceLabel, details = {}) => {
            const type = normalizeItemType(item?.type);
            if (!['weapon', 'armor', 'accessory'].includes(type)) return;
            entries.push({
                item,
                source,
                sourceLabel,
                isEquipped: source === 'equipped',
                ...details
            });
        };

        for (const [slot, item] of Object.entries(this.state.character?.equipment || {})) {
            add(item, 'equipped', '穿戴中', { slot });
        }
        (this.state.inventory || []).forEach((stack, index) => {
            add(stack?.item, 'inventory', '背包', { index, instanceId: stack?.instanceId });
        });
        if (includeWarehouse) {
            (this.state.warehouse || []).forEach((stack, index) => {
                add(stack?.item, 'warehouse', '倉庫', { index, instanceId: stack?.instanceId });
            });
        }

        return entries;
    }

    restoreCharacterAtHome(reason = 'home-rest') {
        const character = this.state.character;
        if (!character) return null;

        if (Array.isArray(character.statusEffects)) {
            character.statusEffects = character.statusEffects.filter(effect => effect?.positive);
        }

        const fullHp = Math.max(1, Number(character.maxHp) || Number(character.calculateMaxHp?.()) || 100);
        character.hp = fullHp;
        character.syncProperties?.();

        this.markSaveDirty(reason);
        this.notify('all');
        return {
            hp: character.hp,
            maxHp: character.maxHp
        };
    }

    setCharacterHealth(value, options = {}) {
        const character = this.state.character;
        if (!character) return null;

        const before = Math.max(0, Number(character.hp) || 0);
        const minimumHp = Math.max(0, Math.floor(Number(options.minimumHp) || 0));
        const maximumHp = Math.max(
            minimumHp,
            Math.floor(Number(options.maximumHp) || Number(character.maxHp) || before || 1)
        );
        const hp = Math.min(maximumHp, Math.max(minimumHp, Math.floor(Number(value) || 0)));
        character.hp = hp;

        if (hp !== before) {
            this.commitStateMutation(options.reason || 'character-health', options.notifyType || 'all', options);
        }
        return Object.freeze({ before, hp, maxHp: character.maxHp, delta: hp - before });
    }

    changeCharacterHealth(amount, options = {}) {
        const character = this.state.character;
        if (!character) return null;
        return this.setCharacterHealth((Number(character.hp) || 0) + (Number(amount) || 0), options);
    }

    addCharacterExperience(amount, options = {}) {
        const character = this.state.character;
        const added = Math.max(0, Math.floor(Number(amount) || 0));
        if (!character || added <= 0) {
            return Object.freeze({ added: 0, level: character?.level || 0, exp: character?.exp || 0, leveledUp: false });
        }

        const previousLevel = Math.max(1, Number(character.level) || 1);
        character.gainExp?.(added);
        this.commitStateMutation(options.reason || 'character-experience', options.notifyType || 'all', options);
        return Object.freeze({
            added,
            level: character.level,
            exp: character.exp,
            leveledUp: character.level > previousLevel
        });
    }

    setCharacterProgress(progress = {}, options = {}) {
        const character = this.state.character;
        if (!character) return null;

        if (progress.level !== undefined) {
            character.level = Math.max(1, Math.floor(Number(progress.level) || 1));
            character.maxHp = character.calculateMaxHp?.() || character.maxHp;
            character.maxExp = character.calculateMaxExp?.() || character.maxExp;
        }
        if (progress.exp !== undefined) {
            character.exp = Math.max(0, Math.floor(Number(progress.exp) || 0));
            character.checkLevelUp?.();
        }
        character.syncProperties?.();
        if (progress.restoreHealth) character.hp = character.maxHp;

        this.commitStateMutation(options.reason || 'character-progress', options.notifyType || 'all', options);
        return Object.freeze({
            level: character.level,
            exp: character.exp,
            hp: character.hp,
            maxHp: character.maxHp
        });
    }

    getEmergencyPotionCount() {
        return (this.state.inventory || []).reduce((total, stack) => (
            stack?.item?.id === 'health_potion_s'
                ? total + Math.max(0, Number(stack.quantity) || 0)
                : total
        ), 0);
    }

    refillMiaEmergencyPotions() {
        const current = this.getEmergencyPotionCount();
        if (current >= MIA_EMERGENCY_POTION_LIMIT) {
            return { refilled: false, added: 0, current, limit: MIA_EMERGENCY_POTION_LIMIT };
        }

        const potion = new Consumable(
            'health_potion_s',
            '小型生命藥水',
            ItemType.POTION,
            ItemRarity.COMMON,
            '🧪',
            '恢復少量生命值。',
            20,
            { hp: 30 }
        );
        const missing = MIA_EMERGENCY_POTION_LIMIT - current;
        const refilled = this.addToInventory(potion, missing);
        return {
            refilled,
            added: refilled ? missing : 0,
            current: refilled ? MIA_EMERGENCY_POTION_LIMIT : current,
            limit: MIA_EMERGENCY_POTION_LIMIT
        };
    }

    getInventoryUpgradeTier(level = this.state.inventoryUpgradeLevel) {
        const safeLevel = Math.max(0, Number(level) || 0);
        return INVENTORY_UPGRADE_TIERS.find(tier => tier.level === safeLevel)
            || INVENTORY_UPGRADE_TIERS[0];
    }

    getNextInventoryUpgrade() {
        const currentLevel = Math.max(0, Number(this.state.inventoryUpgradeLevel) || 0);
        return INVENTORY_UPGRADE_TIERS.find(tier => tier.level === currentLevel + 1) || null;
    }

    getItemCountAcrossStorage(itemId) {
        const countIn = stacks => (stacks || [])
            .filter(stack => stack?.item?.id === itemId)
            .reduce((sum, stack) => sum + (Number(stack.quantity) || 1), 0);
        return countIn(this.state.inventory) + countIn(this.state.warehouse);
    }

    getInventoryUpgradeStatus() {
        const current = this.getInventoryUpgradeTier();
        const next = this.getNextInventoryUpgrade();
        const requirements = (next?.materials || []).map(material => ({
            ...material,
            owned: this.getItemCountAcrossStorage(material.id)
        }));

        return {
            current,
            next,
            requirements,
            canUpgrade: Boolean(next) && requirements.every(req => req.owned >= req.quantity)
        };
    }

    getRepairRequirement(item) {
        const maxDurability = Number(item?.maxDurability) || 0;
        const durability = Number(item?.durability);
        if (!item || maxDurability <= 0 || !Number.isFinite(durability) || durability >= maxDurability) {
            return null;
        }

        const missing = Math.max(1, maxDurability - durability);
        const rarity = String(item.rarity || ItemRarity.COMMON).toLowerCase();
        const freeRepair = Boolean(this.getFlag?.('forge.one_free_repair.available'))
            && (rarity === 'common' || rarity === 'uncommon');
        const materialByRarity = {
            common: 'iron_shard',
            uncommon: 'iron_shard',
            rare: 'high_ore',
            epic: 'forge_core',
            legendary: 'rare_metal'
        };
        const materialId = materialByRarity[rarity] || 'iron_shard';
        const repairMaterialDivisor = {
            common: 12,
            uncommon: 10,
            rare: 9,
            epic: 8,
            legendary: 7
        }[rarity] || 10;
        const goldMultiplier = (rarity === 'common' || rarity === 'uncommon') ? 1.35 : 2;
        const materialQuantity = Math.max(1, Math.ceil(missing / repairMaterialDivisor));

        return {
            gold: freeRepair ? 0 : Math.max(5, Math.ceil(missing * goldMultiplier)),
            materials: freeRepair ? [] : [{ id: materialId, quantity: materialQuantity }],
            missing,
            freeRepair
        };
    }

    getRepairStatus(item) {
        const requirement = this.getRepairRequirement(item);
        if (!requirement) {
            return { ok: false, reason: 'not-needed', requirement: null, hasGold: true, hasMaterials: true };
        }

        const hasGold = this.getGold() >= requirement.gold;
        const lacking = requirement.materials.find(material => (
            this.getItemCountAcrossStorage(material.id) < material.quantity
        ));
        return {
            ok: hasGold && !lacking,
            reason: !hasGold ? 'gold' : lacking ? 'materials' : null,
            requirement,
            hasGold,
            hasMaterials: !lacking,
            lacking: lacking || null
        };
    }

    repairEquipmentItem(item) {
        const status = this.getRepairStatus(item);
        if (!status.ok) return { ...status, success: false };
        const { requirement } = status;

        if (requirement.gold > 0 && !this.removeGold(requirement.gold)) {
            return { success: false, reason: 'gold', requirement };
        }

        for (const material of requirement.materials) {
            this.removeMaterial(material.id, material.quantity);
        }

        if (requirement.freeRepair) {
            this.setFlag?.('forge.one_free_repair.available', false, { reason: 'free-repair-used' });
            this.setFlag?.('forge.one_free_repair.used', true, { reason: 'free-repair-used' });
        }

        item.durability = Number(item.maxDurability) || item.durability;
        this.markSaveDirty('repair-equipment');
        this.notify('all');
        return { success: true, requirement };
    }

    upgradeInventoryCapacity() {
        const status = this.getInventoryUpgradeStatus();
        if (!status.next || !status.canUpgrade) return false;

        for (const requirement of status.requirements) {
            if (!this.removeMaterial(requirement.id, requirement.quantity)) return false;
        }

        this.state.inventoryUpgradeLevel = status.next.level;
        this.state.inventoryCapacity = status.next.capacity;
        this.markSaveDirty('inventory-upgrade');
        this.notify('all');
        return true;
    }

    addToInventory(itemData, quantity = 1, options = {}) {
        const sourceItem = itemData?.item || itemData;
        if (sourceItem?.passiveEffectId) {
            return this.unlockPassiveCombatEffectAchievement(sourceItem.passiveEffectId, sourceItem).success;
        }

        const item = createRuntimeItem(itemData);
        const safeQuantity = Math.max(1, Number(quantity) || 1);
        const stackable = this.isStackable(item);

        if (stackable) {
            const existingStack = findMatchingStack(this.state.inventory, item);
            if (existingStack) {
                existingStack.quantity += safeQuantity;
                this.syncPassiveCombatEffectUnlocks('inventory-stack');
                this.commitStateMutation('inventory-add', 'inventory', options);
                return true;
            }
        }

        if (this.state.inventory.length >= this.state.inventoryCapacity && options.ignoreCapacity !== true) {
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
        this.commitStateMutation('inventory-add', 'inventory', options);
        return true;
    }

    addToWarehouse(itemData, quantity = 1, options = {}) {
        const sourceItem = itemData?.item || itemData;
        if (sourceItem?.passiveEffectId) {
            return this.unlockPassiveCombatEffectAchievement(sourceItem.passiveEffectId, sourceItem).success;
        }

        const item = createRuntimeItem(itemData);
        const safeQuantity = Math.max(1, Number(quantity) || 1);
        const stackable = this.isStackable(item);

        if (stackable) {
            const existingStack = findMatchingStack(this.state.warehouse, item);
            if (existingStack) {
                existingStack.quantity += safeQuantity;
                this.syncPassiveCombatEffectUnlocks('warehouse-stack');
                this.commitStateMutation('warehouse-add', 'warehouse', options);
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
        this.commitStateMutation('warehouse-add', 'warehouse', options);
        return true;
    }
    
    removeFromInventory(itemId) {
        const index = this.state.inventory.findIndex(stack => stack.item.id === itemId);
        if (index > -1) {
            const removedStack = this.state.inventory.splice(index, 1)[0];
            this.commitStateMutation('inventory-remove', 'inventory');
            return removedStack.item;
        }
        return null;
    }
    
    removeItemByInstanceId(instanceId, fromWarehouse = false) {
        const source = fromWarehouse ? this.state.warehouse : this.state.inventory;
        const index = source.findIndex(stack => stack.instanceId === instanceId);
        
        if (index > -1) {
            const removedStack = source.splice(index, 1)[0];
            this.commitStateMutation(
                fromWarehouse ? 'warehouse-remove' : 'inventory-remove',
                fromWarehouse ? 'warehouse' : 'inventory'
            );
            return removedStack.item;
        }
        return null;
    }
    
    // Use consumable (decrements quantity)
    useConsumable(instanceId, fromWarehouse = false, options = {}) {
        const source = fromWarehouse ? this.state.warehouse : this.state.inventory;
        const stack = source.find(s => s.instanceId === instanceId);
        
        if (!stack || (!stack.item.effect && !stack.item.buff)) {
            return false;
        }
        
        if (options.applyEffect !== false) {
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
        }
        
        // Decrement quantity
        stack.quantity -= 1;
        
        // Remove if empty
        if (stack.quantity <= 0) {
            const index = source.findIndex(s => s.instanceId === instanceId);
            source.splice(index, 1);
        }
        
        this.markSaveDirty('use-consumable');
        if (options.notifyType !== false) {
            this.notify(options.notifyType || 'all');
        }
        return true;
    }

    updateFlags(values = {}, options = {}) {
        const removals = Array.isArray(options.remove) ? options.remove : [];
        let changed = false;

        for (const flag of removals) {
            if (!Object.hasOwn(this.state.flags, flag)) continue;
            delete this.state.flags[flag];
            changed = true;
        }
        for (const [flag, value] of Object.entries(values || {})) {
            if (this.state.flags[flag] === value) continue;
            this.state.flags[flag] = value;
            changed = true;
        }

        if (!changed) return false;
        if (options.syncPassive !== false) {
            this.syncPassiveCombatEffectUnlocks(options.reason || 'flags');
        }
        if (options.persist !== false) {
            this.markSaveDirty(options.reason || 'flags');
        }
        if (options.notify !== false) {
            this.notify('flags');
        }
        return true;
    }

    setFlag(flag, value, options = {}) {
        if (!flag) return false;
        return this.updateFlags({ [flag]: value }, {
            ...options,
            reason: options.reason || `flag:${flag}`
        });
    }

    getFlag(flag) {
        return this.state.flags[flag];
    }

    getFlagsByPrefix(prefix = '') {
        return Object.fromEntries(
            Object.entries(this.state.flags)
                .filter(([flag]) => !prefix || flag.startsWith(prefix))
        );
    }
    
    // ===== Item Transfer Methods =====
    
    moveToWarehouse(instanceId) {
        const index = this.state.inventory.findIndex(stack => stack.instanceId === instanceId);
        if (index === -1) return false;

        const stack = this.state.inventory[index];
        if (stack.item?.tutorialLocked) return false;
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

        this.markSaveDirty('move-to-warehouse');
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

        this.markSaveDirty('move-to-inventory');
        this.notify('all');
        return true;
    }

    moveAllMaterialsToWarehouse() {
        const materialStacks = this.state.inventory.filter(
            stack => String(stack.item?.type || '').toLowerCase() === 'material'
        );
        if (materialStacks.length === 0) {
            return { movedStacks: 0, movedQuantity: 0 };
        }

        let movedQuantity = 0;
        materialStacks.forEach(stack => {
            const quantity = Math.max(1, Number(stack.quantity) || 1);
            movedQuantity += quantity;
            const existingStack = this.isStackable(stack.item)
                ? findMatchingStack(this.state.warehouse, stack.item)
                : null;

            if (existingStack) {
                existingStack.quantity = Math.max(1, Number(existingStack.quantity) || 1) + quantity;
            } else {
                stack.quantity = quantity;
                this.state.warehouse.push(stack);
            }
        });

        const movedStackSet = new Set(materialStacks);
        this.state.inventory = this.state.inventory.filter(stack => !movedStackSet.has(stack));
        this.markSaveDirty('move-all-materials-to-warehouse');
        this.notify('all');

        return {
            movedStacks: materialStacks.length,
            movedQuantity
        };
    }

    getStoredItemTransactionPreview(instanceId, fromWarehouse = false) {
        const source = fromWarehouse ? this.state.warehouse : this.state.inventory;
        const stack = source.find(entry => entry.instanceId === instanceId);
        if (!stack) return null;

        return {
            item: stack.item,
            quantity: Math.max(1, Number(stack.quantity) || 1),
            sellPrice: getSellPrice(stack.item, stack.quantity),
            requiresDiscardConfirmation: this.isHighRarity(stack.item)
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
        
        this.markSaveDirty('sell-item');
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
        const required = Math.max(0, Math.floor(Number(quantity) || 0));
        if (required === 0) return true;
        if (this.getItemCountAcrossStorage(materialId) < required) return false;
        let remaining = required;
        
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
        
        this.commitStateMutation('material-remove', 'all');
        return true;
    }
    
    discardItem(instanceId, fromWarehouse = false, options = {}) {
        const source = fromWarehouse ? this.state.warehouse : this.state.inventory;
        const stack = source.find(s => s.instanceId === instanceId);
        
        if (!stack) return false;
        if (stack.item?.tutorialLocked) return false;
        
        // Check rarity for confirmation
        if (this.isHighRarity(stack.item) && !options?.force) {
            // Return false to trigger UI confirmation
            return 'confirm';
        }
        
        // Remove item
        const index = source.findIndex(s => s.instanceId === instanceId);
        source.splice(index, 1);
        
        this.markSaveDirty('discard-item');
        this.notify(fromWarehouse ? 'warehouse' : 'inventory');
        return true;
    }
    
    canEquipItemToSlot(item, slotType = null) {
        if (!item || typeof item.isEquipment !== 'function' || !item.isEquipment()) return false;
        const itemType = normalizeItemType(item.type);
        if (!slotType) return ['weapon', 'armor', 'accessory'].includes(itemType);
        if (slotType === itemType) return true;
        if (slotType === 'armor' && itemType === 'weapon') {
            return Boolean(this.state.character.equipment?.weapon);
        }
        return false;
    }

    equipItemToSlot(instanceId, slotType = null, fromWarehouse = false) {
        const source = fromWarehouse ? this.state.warehouse : this.state.inventory;
        const stack = source.find(s => s.instanceId === instanceId);
        
        if (!stack || !this.canEquipItemToSlot(stack.item, slotType)) return false;
        
        const item = stack.item;
        const targetSlot = slotType || normalizeItemType(item.type);
        const previousEquipment = { ...(this.state.character.equipment || {}) };
        const equipped = this.state.character.equip(item, targetSlot);
        if (!equipped) return false;

        const equippedSlot = Object.keys(this.state.character.equipment || {})
            .find(slotName => this.state.character.equipment[slotName] === item);
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

        this.markSaveDirty('equip-item');
        this.notify('all');
        return true;
    }

    consumeContextItem(instanceId, context, action) {
        const stack = this.state.inventory.find(entry => entry.instanceId === instanceId);
        if (!stack) return false;
        if (stack.item?.useContext !== context || stack.item?.useAction !== action) return false;

        stack.quantity -= 1;
        if (stack.quantity <= 0) {
            const index = this.state.inventory.findIndex(entry => entry.instanceId === instanceId);
            if (index >= 0) this.state.inventory.splice(index, 1);
        }
        this.markSaveDirty(`context-item:${action}`);
        this.notify('inventory');
        return true;
    }

    equipItem(instanceId, fromWarehouse = false) {
        return this.equipItemToSlot(instanceId, null, fromWarehouse);
    }

    breakEquippedWeapon(slotType = 'weapon') {
        const equipment = this.state.character?.equipment;
        if (!equipment) return null;
        const normalizedSlot = slotType || 'weapon';
        const weapon = equipment[normalizedSlot];
        if (!weapon || normalizeItemType(weapon.type) !== 'weapon') return null;

        weapon.durability = 0;
        const broken = { ...weapon };
        equipment[normalizedSlot] = null;
        this.markSaveDirty(`break-weapon:${normalizedSlot}`);
        this.notify('equipment');
        return broken;
    }

    promoteOffhandWeaponToMain() {
        const equipment = this.state.character?.equipment;
        if (!equipment || equipment.weapon) return null;
        const offhand = equipment.armor;
        if (!offhand || normalizeItemType(offhand.type) !== 'weapon') return null;

        equipment.weapon = offhand;
        equipment.armor = null;
        this.markSaveDirty('promote-offhand-weapon');
        this.notify('equipment');
        return offhand;
    }

    removeTutorialItemGroup(groupId, options = {}) {
        if (!groupId) return 0;
        let removed = 0;
        const equipment = this.state.character?.equipment || {};

        Object.keys(equipment).forEach(slot => {
            if (equipment[slot]?.tutorialGroup !== groupId) return;
            equipment[slot] = null;
            removed += 1;
        });
        for (const sourceName of ['inventory', 'warehouse']) {
            const source = this.state[sourceName] || [];
            const kept = source.filter(stack => {
                if (stack.item?.tutorialGroup !== groupId) return true;
                removed += 1;
                return false;
            });
            this.state[sourceName] = kept;
        }

        if (removed > 0) {
            this.markSaveDirty(`tutorial-items-removed:${groupId}`);
            if (options.notify !== false) this.notify('all');
        }
        return removed;
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
        
        this.markSaveDirty('unequip-item');
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
    reduceWeaponDurability(slotType = 'weapon') {
        const normalizedSlot = slotType || 'weapon';
        const weapon = this.state.character.equipment?.[normalizedSlot];
        if (!weapon || normalizeItemType(weapon.type) !== 'weapon') return null;
        
        // 檢查是否有「完美無瑕」詞綴
        if (this.hasNoDurabilityLossAffix(weapon)) {
            return null;
        }
        
        if (!Number.isFinite(Number(weapon.durability)) || !Number.isFinite(Number(weapon.maxDurability))) {
            throw new Error(`Weapon ${weapon.id || '(unknown)'} is missing durability data`);
        }
        
        weapon.durability = Math.max(0, weapon.durability - 1);
        
        // 耐久度歸零，交給唯一的損毀入口清除裝備。
        if (weapon.durability <= 0) {
            return this.breakEquippedWeapon(normalizedSlot);
        }

        this.markSaveDirty('weapon-durability');
        this.notify('equipment');
        return null;
    }
    
    /**
     * 減少防具耐久度（被攻擊時調用）
     * @returns {Object|null} 如果裝備損壞返回裝備資訊，否則返回 null
     */
    reduceArmorDurability() {
        const armor = this.state.character.equipment.armor;
        if (!armor) return null;
        if (normalizeItemType(armor.type) === 'weapon') return null;
        
        // 檢查是否有「完美無瑕」詞綴
        if (this.hasNoDurabilityLossAffix(armor)) {
            return null;
        }
        
        if (!Number.isFinite(Number(armor.durability)) || !Number.isFinite(Number(armor.maxDurability))) {
            throw new Error(`Armor ${armor.id || '(unknown)'} is missing durability data`);
        }
        
        armor.durability = Math.max(0, armor.durability - 1);
        this.markSaveDirty('armor-durability');
        
        // 耐久度歸零，裝備消失
        if (armor.durability <= 0) {
            const destroyedArmor = { ...armor };
            this.state.character.equipment.armor = null;
            this.notify('equipment');
            return destroyedArmor;
        }

        this.notify('equipment');
        return null;
    }
    
    /**
     * 獲取裝備耐久度資訊
     */
    getEquipmentDurability(slotType) {
        const equipment = this.state.character.equipment[slotType];
        if (!equipment) return null;
        
        if (!Number.isFinite(Number(equipment.durability)) || !Number.isFinite(Number(equipment.maxDurability))) {
            throw new Error(`Equipment ${equipment.id || '(unknown)'} is missing durability data`);
        }
        return { current: Number(equipment.durability), max: Number(equipment.maxDurability) };
    }
    
    // Character methods
    getCharacter() {
        return this.state.character;
    }
}

const gameManagerInstance = GameManager.getInstance();

export default gameManagerInstance;
