import { MaterialDatabase } from '../data/Materials.js';
import { EquipmentDatabase } from '../data/Equipment.js';
import { QuestRewardItems } from '../data/Quests.js';
import { TowerBossEquipment } from '../data/BossEquipment.js';
import { ShopData, SecretShopItems } from '../data/Items.js';

function cloneItemData(item) {
    if (!item) return null;
    if (typeof structuredClone === 'function') {
        try {
            return structuredClone(item);
        } catch (error) {
            // Fall through for simple object records.
        }
    }
    return JSON.parse(JSON.stringify(item));
}

function findShopItem(itemId) {
    for (const shop of Object.values(ShopData || {})) {
        const item = (shop.items || []).find(entry => entry.id === itemId);
        if (item) return item;
    }

    return (SecretShopItems || []).find(entry => entry.id === itemId) || null;
}

function findBossEquipment(itemId) {
    if (TowerBossEquipment[itemId]) return TowerBossEquipment[itemId];
    return Object.values(TowerBossEquipment || {}).find(entry => entry.id === itemId) || null;
}

export function resolveItemRecord(itemId, options = {}) {
    if (!itemId) return null;

    const preferBossEquipment = options.preferBossEquipment === true;
    const order = options.order || (preferBossEquipment
        ? ['questReward', 'material', 'bossEquipment', 'equipment', 'shop']
        : ['questReward', 'material', 'equipment', 'bossEquipment', 'shop']);

    const resolvers = {
        questReward: () => QuestRewardItems[itemId] || null,
        material: () => MaterialDatabase[itemId] || null,
        equipment: () => EquipmentDatabase[itemId] || null,
        bossEquipment: () => findBossEquipment(itemId),
        shop: () => findShopItem(itemId)
    };

    for (const source of order) {
        const item = resolvers[source]?.();
        if (item) {
            return {
                item: cloneItemData(item),
                source
            };
        }
    }

    return null;
}

export function resolveItemById(itemId, options = {}) {
    return resolveItemRecord(itemId, options)?.item || null;
}
