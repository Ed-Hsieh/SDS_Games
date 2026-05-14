import { ItemRarity, ItemType } from './Enums.js';

export const DEFAULT_SELL_RATE = 0.5;
export const DEFAULT_DURABILITY = 50;

export const EQUIPMENT_DEFAULTS = {
    [ItemType.WEAPON]: {
        critChance: 0.08,
        critDamage: 1.5,
        weaponSpeed: 1.0,
        attackSpeed: 1.0,
        maxDurability: DEFAULT_DURABILITY
    },
    [ItemType.ARMOR]: {
        critChance: 0.03,
        critDamage: 1.2,
        maxDurability: DEFAULT_DURABILITY
    },
    [ItemType.ACCESSORY]: {
        critChance: 0.05,
        critDamage: 1.3,
        maxDurability: null
    }
};

const STACKABLE_TYPES = new Set([
    ItemType.POTION,
    ItemType.SCROLL,
    ItemType.MATERIAL,
    ItemType.CURRENCY
]);

export function cloneData(value) {
    if (value === undefined || value === null) return value;
    if (typeof structuredClone === 'function') {
        try {
            return structuredClone(value);
        } catch (error) {
            // Fall through to JSON cloning for simple data records.
        }
    }
    return JSON.parse(JSON.stringify(value));
}

export function readNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

export function normalizeItemType(type) {
    if (type === undefined || type === null) return type;

    const normalized = String(type).toLowerCase();
    if (normalized === 'equipment') return ItemType.ARMOR;
    if (normalized === 'armor') return ItemType.ARMOR;
    if (normalized === 'weapon') return ItemType.WEAPON;
    if (normalized === 'accessory') return ItemType.ACCESSORY;
    return normalized;
}

export function normalizeRarity(itemData, fallback = ItemRarity.COMMON) {
    if (!itemData) return fallback;
    if (typeof itemData === 'string') return itemData;
    return itemData.rarity ?? itemData.ItemRarity ?? fallback;
}

export function readItemStat(itemData, primaryKey, aliases = [], fallback = 0) {
    const aliasList = Array.isArray(aliases) ? aliases : [aliases].filter(Boolean);
    const stats = itemData?.stats || {};

    for (const key of [primaryKey, ...aliasList]) {
        const value = itemData?.[key];
        if (value !== undefined && value !== null) return value;
    }

    for (const key of [primaryKey, ...aliasList]) {
        const value = stats?.[key];
        if (value !== undefined && value !== null) return value;
    }

    return fallback;
}

export function readEquipmentStats(itemData, type = itemData?.type) {
    const itemType = normalizeItemType(type);
    const defaults = EQUIPMENT_DEFAULTS[itemType] || EQUIPMENT_DEFAULTS[ItemType.ARMOR];
    const rawMaxDurability = readItemStat(
        itemData,
        'maxDurability',
        ['max_durability'],
        defaults.maxDurability
    );
    const maxDurability = rawMaxDurability === null
        ? null
        : readNumber(rawMaxDurability, defaults.maxDurability ?? DEFAULT_DURABILITY);
    const rawDurability = readItemStat(itemData, 'durability', ['dur'], maxDurability);
    const durability = rawDurability === null
        ? null
        : readNumber(rawDurability, maxDurability ?? DEFAULT_DURABILITY);

    return {
        atk: readNumber(readItemStat(itemData, 'attack', ['atk'], 0), 0),
        def: readNumber(readItemStat(itemData, 'defense', ['def'], 0), 0),
        critChance: readNumber(
            readItemStat(itemData, 'critChance', ['crit_chance'], defaults.critChance),
            defaults.critChance
        ),
        critDamage: readNumber(
            readItemStat(itemData, 'critDamage', ['crit_damage'], defaults.critDamage),
            defaults.critDamage
        ),
        weaponSpeed: readNumber(
            readItemStat(itemData, 'weaponSpeed', ['weapon_speed'], defaults.weaponSpeed ?? 1.0),
            defaults.weaponSpeed ?? 1.0
        ),
        attackSpeed: readNumber(
            readItemStat(itemData, 'attackSpeed', ['attack_speed'], defaults.attackSpeed ?? 1.0),
            defaults.attackSpeed ?? 1.0
        ),
        maxDurability,
        durability
    };
}

export function getItemDescription(itemData) {
    return itemData?.description ?? itemData?.desc ?? '';
}

export function getItemPrice(itemData) {
    return readNumber(itemData?.price, 0);
}

export function getSellPrice(item, quantity = 1, rate = DEFAULT_SELL_RATE) {
    const count = readNumber(quantity, 1);
    const normalizedCount = count > 0 ? count : 1;
    const hasExplicitSellPrice = item?.sellPrice !== undefined
        && item?.sellPrice !== null
        && Number.isFinite(Number(item.sellPrice));
    const unitSellPrice = hasExplicitSellPrice
        ? Number(item.sellPrice)
        : Math.floor(getItemPrice(item) * rate);

    return Math.floor(unitSellPrice * normalizedCount);
}

export function isStackableItem(item) {
    if (!item) return false;
    return Boolean(item.stackable)
        || readNumber(item.maxStack, 0) > 1
        || STACKABLE_TYPES.has(normalizeItemType(item.type));
}

export function isSameStackItem(a, b) {
    return Boolean(a && b)
        && a.id === b.id
        && normalizeItemType(a.type) === normalizeItemType(b.type)
        && normalizeRarity(a) === normalizeRarity(b);
}

export function findMatchingStack(stacks, item) {
    return (stacks || []).find(stack => isSameStackItem(stack.item, item));
}

export function ensureInstanceId(item) {
    if (item && !item.instanceId) {
        item.instanceId = `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    }
    return item?.instanceId;
}

export function copyRuntimeMetadata(item, itemData) {
    if (!item || !itemData) return item;

    const stats = itemData.stats || {};
    if (itemData.image) item.image = itemData.image;
    if (itemData.setId) item.setId = itemData.setId;
    if (itemData.dropFrom) item.dropFrom = Array.isArray(itemData.dropFrom) ? [...itemData.dropFrom] : [itemData.dropFrom];
    if (itemData.dropSource) item.dropSource = itemData.dropSource;
    if (itemData.canEnhance !== undefined) item.canEnhance = itemData.canEnhance;
    if (itemData.gemSlots !== undefined) item.gemSlots = itemData.gemSlots;
    if (itemData.socketedGems) item.socketedGems = cloneData(itemData.socketedGems);
    if (itemData.isSecretKey) item.isSecretKey = true;
    if (itemData.isQuestReward) item.isQuestReward = true;
    if (itemData.stackable !== undefined) item.stackable = itemData.stackable;
    if (itemData.maxStack !== undefined) item.maxStack = itemData.maxStack;
    if (itemData.special !== undefined) item.special = itemData.special;
    if (itemData.stats) item.stats = cloneData(itemData.stats);

    for (const key of ['hp', 'mp', 'exp']) {
        const value = itemData[key] ?? stats[key];
        if (value !== undefined && value !== null) item[key] = value;
    }

    if (item.atk !== undefined) item.attack = item.atk;
    if (item.def !== undefined) item.defense = item.def;

    if (itemData.specialEffects) {
        item.specialEffects = cloneData(itemData.specialEffects);
        for (const effect of item.specialEffects || []) {
            if (!effect || !effect.type) continue;

            const type = String(effect.type).toLowerCase();
            const value = readNumber(effect.value, 0);
            if ((type.includes('life') && type.includes('steal')) || type === 'lifesteal' || type === 'life_steal') {
                item.lifesteal = (item.lifesteal || 0) + value;
            }
            if ((type.includes('damage') && type.includes('reduction')) || type === 'damage_reduction') {
                item.damageReduction = (item.damageReduction || 0) + value;
            }
        }
    }

    if (itemData.affixes) item.affixes = cloneData(itemData.affixes);
    if (itemData.affixBonuses) item.affixBonuses = cloneData(itemData.affixBonuses);

    return item;
}
