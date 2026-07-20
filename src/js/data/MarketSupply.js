/**
 * MarketSupply.js
 * Public trade belongs to the rebuilt market. Mia may authorize a formula in
 * the screenplay, but never owns a shelf, price, order, exchange, or fallback
 * shop. Map-dependent stock and rewards remain intentionally unbound.
 */

import { MaterialDatabase } from './Materials.js';
import { attachCharacterProfile } from './CharacterProfiles.js';

export const MarketSceneAssets = Object.freeze({
    background: 'src/assets/images/art/scenes/town/locations/market.webp'
});

export const MarketItemCatalog = Object.freeze({
    health_potion_s: {
        ...MaterialDatabase.health_potion_s,
        marketUse: '公開基礎醫藥'
    }
});

export const MarketVendors = Object.freeze([
    Object.freeze({
        id: 'merchant',
        name: '商人',
        role: '公開庫存與交易',
        icon: '$',
        portrait: 'src/assets/images/art/characters/portraits/merchant.webp',
        sceneImage: 'src/assets/images/art/scenes/town/locations/market.webp',
        sceneFocus: '50% 60%',
        sceneCaption: '你走近中央邊棚。來路、批次與剩餘數量都寫在貨架前，空位沒有被假裝成限量商品。',
        functionList: ['貨架：公開基礎醫藥'],
        position: Object.freeze({ x: 50, y: 60 }),
        place: '中央邊棚',
        summary: '公開市集只販售當前道路、研究與城鎮狀態真正支持的庫存。',
        dialogue: '米婭管配方能不能用，我管這裡還有幾瓶。兩件事分開，人才不會因為一個名字消失就買不到藥。',
        shelves: Object.freeze([
            Object.freeze({
                id: 'shelf_health_potion_s',
                itemId: 'health_potion_s',
                price: 25,
                stock: '基礎藥品',
                note: '第二章公開供應線建立後維持販售，不因米婭的當輪命運中斷。'
            })
        ])
    })
]);

export const DeferredMarketBindings = Object.freeze({
    status: 'deferred_until_map_function_and_reward_allocation',
    categories: Object.freeze([
        'chapter_material_stock',
        'map_key_items',
        'equipment_and_accessory_stock',
        'orders_and_exchanges',
        'black_market_gameplay_sources'
    ])
});

export function getMarketVendor(vendorId) {
    const vendor = MarketVendors.find(entry => entry.id === vendorId) || null;
    return vendor ? attachCharacterProfile(vendor) : null;
}

export function getAllMarketVendors() {
    return MarketVendors.map(vendor => attachCharacterProfile(vendor));
}

export function getMarketItem(itemId) {
    return MarketItemCatalog[itemId] || null;
}
