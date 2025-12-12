/**
 * ShopManager.js
 * 管理商店相關的查詢行為（從 data/Items.js 中拆分而出）
 */

import { ShopData, SecretShopItems } from '../data/Items.js';

// 重新導出，供 Scenes 使用（避免 Scenes 直接引用 Database）
export { ShopData, SecretShopItems };

/**
 * 取得商店資料
 */
export function getShop(shopId) {
    return ShopData[shopId] || null;
}

/**
 * 取得所有商店
 */
export function getAllShops() {
    return Object.keys(ShopData);
}

/**
 * 取得商店物品
 */
export function getShopItems(shopId) {
    const shop = ShopData[shopId];
    return shop ? shop.items : [];
}

/**
 * 取得秘密商店物品
 */
export function getSecretShopItems() {
    return SecretShopItems;
}

export default {
    ShopData,
    SecretShopItems,
    getShop,
    getAllShops,
    getShopItems,
    getSecretShopItems
};
