import { CharacterManager } from '../models/DataModel.js';
import { createRuntimeItem } from '../models/ItemFactory.js';
import { cloneData } from '../models/ItemSchema.js';

export const SAVE_SCHEMA_VERSION = 1;
export const SAVE_FILE_BASENAME = 'sds-save';

function safeClone(value, fallback = null) {
    try {
        const cloned = cloneData(value);
        return cloned === undefined ? fallback : cloned;
    } catch (error) {
        console.warn('[SaveManager] Failed to clone value:', error);
        return fallback;
    }
}

function readPositiveNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function formatTimestamp(date = new Date()) {
    const pad = value => String(value).padStart(2, '0');
    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate())
    ].join('')
        + '-'
        + [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join('');
}

function makeSaveFileName() {
    return `${SAVE_FILE_BASENAME}-${formatTimestamp()}.json`;
}

function serializeItem(item) {
    if (!item) return null;
    return safeClone(item, null);
}

function hydrateItem(itemData) {
    if (!itemData) return null;

    try {
        const item = createRuntimeItem(itemData);
        if (itemData.instanceId) item.instanceId = itemData.instanceId;
        if (itemData.acquiredTime) item.acquiredTime = itemData.acquiredTime;
        return item;
    } catch (error) {
        console.warn('[SaveManager] Failed to hydrate runtime item:', itemData?.id, error);
        return safeClone(itemData, null);
    }
}

function serializeStack(stack) {
    if (!stack?.item) return null;
    const item = serializeItem(stack.item);
    if (!item) return null;

    return {
        item,
        quantity: Math.max(1, Number(stack.quantity) || 1),
        instanceId: stack.instanceId || item.instanceId || stack.item.instanceId || null
    };
}

function hydrateStack(stack) {
    if (!stack?.item) return null;

    const item = hydrateItem(stack.item);
    if (!item) return null;

    const instanceId = stack.instanceId || item.instanceId || null;
    if (instanceId) item.instanceId = instanceId;

    return {
        item,
        quantity: Math.max(1, Number(stack.quantity) || 1),
        instanceId: item.instanceId || instanceId
    };
}

function serializeCharacter(character) {
    const data = safeClone(character, {});
    data.equipment = {
        weapon: serializeItem(character?.equipment?.weapon),
        armor: serializeItem(character?.equipment?.armor),
        accessory: serializeItem(character?.equipment?.accessory)
    };
    return data;
}

function hydrateCharacter(characterData) {
    const character = new CharacterManager();
    const data = safeClone(characterData, {});
    const savedEquipment = data.equipment || {};

    delete data.equipment;
    delete data.skills;
    ['_m' + 'p', '_maxM' + 'p', 'm' + 'p', 'maxM' + 'p', 'currentM' + 'P'].forEach(key => {
        delete data[key];
    });

    Object.assign(character, data);

    character.equipment = {
        weapon: hydrateItem(savedEquipment.weapon),
        armor: hydrateItem(savedEquipment.armor),
        accessory: hydrateItem(savedEquipment.accessory)
    };

    if (!Array.isArray(character.activeBuffs)) {
        character.activeBuffs = [];
    }
    if (typeof character.getActivePassiveCombatEffects === 'function') {
        character.getActivePassiveCombatEffects();
    }

    try {
        character.syncProperties();
    } catch (error) {
        console.warn('[SaveManager] Failed to sync hydrated character:', error);
    }

    return character;
}

export function serializeGameState(state) {
    return {
        character: serializeCharacter(state?.character),
        inventory: (state?.inventory || []).map(serializeStack).filter(Boolean),
        inventoryCapacity: readPositiveNumber(state?.inventoryCapacity, 10),
        warehouse: (state?.warehouse || []).map(serializeStack).filter(Boolean),
        mapState: safeClone(state?.mapState, null),
        flags: {
            secretShopUnlocked: false,
            ...safeClone(state?.flags, {})
        }
    };
}

export function hydrateGameState(gameData, createInitialState) {
    const baseState = typeof createInitialState === 'function'
        ? createInitialState()
        : {
            character: new CharacterManager(),
            inventory: [],
            inventoryCapacity: 10,
            warehouse: [],
            mapState: null,
            flags: { secretShopUnlocked: false }
        };
    const data = gameData || {};

    return {
        ...baseState,
        character: hydrateCharacter(data.character),
        inventory: (data.inventory || []).map(hydrateStack).filter(Boolean),
        inventoryCapacity: readPositiveNumber(data.inventoryCapacity, baseState.inventoryCapacity || 10),
        warehouse: (data.warehouse || []).map(hydrateStack).filter(Boolean),
        mapState: safeClone(data.mapState, null),
        flags: {
            ...(baseState.flags || {}),
            ...safeClone(data.flags, {})
        }
    };
}

function normalizeSaveData(rawData) {
    const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    if (!parsed || typeof parsed !== 'object') {
        throw new Error('Save data must be a JSON object.');
    }

    if (parsed.schemaVersion && parsed.game) {
        return parsed;
    }

    return {
        schemaVersion: SAVE_SCHEMA_VERSION,
        savedAt: parsed.savedAt || null,
        game: parsed.game || parsed.state || parsed,
        systems: parsed.systems || {}
    };
}

export default class SaveManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.systems = new Map();
        this.dirty = false;
        this.lastChangeReason = null;
    }

    registerSystem(key, system) {
        if (!key || !system) return system;
        this.systems.set(key, system);
        return system;
    }

    markDirty(reason = 'state') {
        this.dirty = true;
        this.lastChangeReason = reason;
    }

    createSaveData() {
        const systems = {};
        for (const [key, system] of this.systems.entries()) {
            if (typeof system.serialize !== 'function') continue;
            try {
                systems[key] = safeClone(system.serialize(), {});
            } catch (error) {
                console.warn(`[SaveManager] Failed to serialize system "${key}":`, error);
            }
        }

        return {
            schemaVersion: SAVE_SCHEMA_VERSION,
            savedAt: new Date().toISOString(),
            game: serializeGameState(this.gameManager.state),
            systems
        };
    }

    loadSaveData(rawData) {
        const saveData = normalizeSaveData(rawData);
        const createInitialState = () => this.gameManager.createInitialState();

        this.gameManager.state = hydrateGameState(saveData.game, createInitialState);

        const systemData = saveData.systems || {};
        for (const [key, system] of this.systems.entries()) {
            if (typeof system.deserialize !== 'function') continue;

            try {
                system.deserialize(systemData[key] || {});
            } catch (error) {
                console.warn(`[SaveManager] Failed to deserialize system "${key}":`, error);
            }
        }

        this.dirty = false;
        this.gameManager.notify('all');
        return saveData;
    }

    resetToNewGame() {
        this.gameManager.resetState();

        for (const system of this.systems.values()) {
            try {
                if (typeof system.resetProgress === 'function') {
                    system.resetProgress();
                } else if (typeof system.reset === 'function') {
                    system.reset();
                } else if (typeof system.deserialize === 'function') {
                    system.deserialize({});
                }
            } catch (error) {
                console.warn('[SaveManager] Failed to reset registered system:', error);
            }
        }

        this.dirty = true;
        this.lastChangeReason = 'reset';
        this.gameManager.notify('all');
    }

    exportJson(spaces = 2) {
        return JSON.stringify(this.createSaveData(), null, spaces);
    }

    downloadSaveFile(filename = makeSaveFileName()) {
        if (typeof document === 'undefined') {
            throw new Error('downloadSaveFile is only available in a browser.');
        }

        const blob = new Blob([this.exportJson()], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');

        anchor.href = url;
        anchor.download = filename;
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();

        setTimeout(() => URL.revokeObjectURL(url), 0);
        this.dirty = false;
        return filename;
    }

    async writeSaveFile(filename = makeSaveFileName()) {
        const json = this.exportJson();

        if (typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function') {
            const handle = await window.showSaveFilePicker({
                suggestedName: filename,
                types: [{
                    description: 'SDS JSON Save',
                    accept: { 'application/json': ['.json'] }
                }]
            });
            const writable = await handle.createWritable();
            await writable.write(json);
            await writable.close();
            this.dirty = false;
            return { mode: 'file-system', filename: handle.name || filename };
        }

        return { mode: 'download', filename: this.downloadSaveFile(filename) };
    }

    async importFromFile(file) {
        if (!file) throw new Error('No save file selected.');
        const text = typeof file.text === 'function'
            ? await file.text()
            : await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(reader.error);
                reader.readAsText(file);
            });

        return this.loadSaveData(text);
    }

    async readSaveFile() {
        if (typeof window === 'undefined' || typeof window.showOpenFilePicker !== 'function') {
            throw new Error('File picker is not available in this browser.');
        }

        const [handle] = await window.showOpenFilePicker({
            multiple: false,
            types: [{
                description: 'SDS JSON Save',
                accept: { 'application/json': ['.json'] }
            }]
        });
        const file = await handle.getFile();
        return this.importFromFile(file);
    }
}
