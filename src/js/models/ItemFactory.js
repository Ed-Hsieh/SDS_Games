import { Accessory, Armor, Consumable, Item, Weapon } from './DataModel.js';
import { ItemRarity, ItemType } from './Enums.js';
import {
    cloneData,
    copyRuntimeMetadata,
    ensureInstanceId,
    getItemDescription,
    getItemPrice,
    normalizeItemType,
    normalizeRarity,
    readEquipmentStats,
    readItemStat
} from './ItemSchema.js';

export function createRuntimeItem(itemData) {
    if (itemData instanceof Item) {
        ensureInstanceId(itemData);
        return itemData;
    }

    if (!itemData) {
        throw new Error('Cannot create runtime item from empty data.');
    }

    const type = normalizeItemType(itemData.type);
    const rarity = normalizeRarity(itemData, ItemRarity.COMMON);
    const description = getItemDescription(itemData);
    const price = getItemPrice(itemData);
    let item;

    if (type === ItemType.WEAPON) {
        const stats = readEquipmentStats(itemData, type);
        item = new Weapon(
            itemData.id,
            itemData.name,
            rarity,
            itemData.icon || '',
            description,
            price,
            stats.atk,
            stats.def,
            stats.critChance,
            stats.critDamage,
            stats.weaponSpeed,
            stats.attackSpeed,
            stats.maxDurability,
            stats.durability
        );
    } else if (type === ItemType.ARMOR) {
        const stats = readEquipmentStats(itemData, type);
        item = new Armor(
            itemData.id,
            itemData.name,
            rarity,
            itemData.icon || '',
            description,
            price,
            stats.atk,
            stats.def,
            stats.critChance,
            stats.critDamage,
            stats.maxDurability,
            stats.durability
        );
    } else if (type === ItemType.ACCESSORY) {
        const stats = readEquipmentStats(itemData, type);
        item = new Accessory(
            itemData.id,
            itemData.name,
            rarity,
            itemData.icon || '',
            description,
            price,
            stats.atk,
            stats.def,
            stats.critChance,
            stats.critDamage,
            stats.maxDurability,
            stats.durability
        );
    } else if (type === ItemType.POTION) {
        const effect = cloneData(itemData.effect || {});
        for (const key of ['hp', 'mp', 'exp']) {
            const value = readItemStat(itemData, key, [], undefined);
            if (value !== undefined && value !== null) effect[key] = value;
        }
        item = new Consumable(
            itemData.id,
            itemData.name,
            type,
            rarity,
            itemData.icon || '',
            description,
            price,
            effect
        );
    } else {
        item = new Item(
            itemData.id,
            itemData.name,
            type,
            rarity,
            itemData.icon || '',
            description,
            price
        );
    }

    item.type = type;
    item.rarity = rarity;
    copyRuntimeMetadata(item, itemData);
    ensureInstanceId(item);
    return item;
}
