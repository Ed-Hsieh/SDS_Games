import { ItemRarity } from '../models/Enums.js';

export const ItemUseContext = Object.freeze({
    ADVENTURE_MAP: 'adventure_map'
});

export const ItemUseAction = Object.freeze({
    RETURN_TO_TOWN: 'return_to_town'
});

export const ItemDatabase = Object.freeze({
    wolf_smoke: Object.freeze({
        id: 'wolf_smoke',
        catalogId: 'ITM-001',
        name: '狼煙',
        icon: '▲',
        type: 'item',
        rarity: ItemRarity.COMMON,
        price: 0,
        sellPrice: 0,
        stackable: true,
        maxStack: 9,
        useContext: ItemUseContext.ADVENTURE_MAP,
        useAction: ItemUseAction.RETURN_TO_TOWN,
        description: '在冒險地圖點燃後返回城鎮。戰鬥與城鎮內無法使用。'
    })
});

export function getItemRecord(itemId) {
    return ItemDatabase[itemId] || null;
}
