import { ItemRarity, ItemType } from '../models/Enums.js';
import { RewardItemDatabase } from './RewardItems.js';

export const CasinoRewardRarityText = Object.freeze({
    common: '普通獎',
    uncommon: '進階獎',
    rare: '稀有獎',
    epic: '超稀有獎',
    legendary: '大獎'
});

export const CasinoRewardTierOrder = Object.freeze({
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5
});

// Casino equipment, crafting materials, showcases, and prize pools were
// removed as obsolete content. Only non-equipment story credentials remain.
export const CasinoSpecialItems = Object.freeze({
    casino_chip_bundle: Object.freeze({
        id: 'casino_chip_bundle',
        name: '籌碼束',
        icon: '🎟️',
        type: ItemType.CURRENCY,
        rarity: ItemRarity.UNCOMMON,
        price: 0,
        description: '由賭場兌換處捆好的籌碼。'
    }),
    black_market_ticket: Object.freeze({
        id: 'black_market_ticket',
        name: '黑市票券',
        icon: '🎫',
        type: ItemType.KEY,
        rarity: ItemRarity.RARE,
        price: 0,
        description: '通往賭場暗桌的憑證。'
    }),
    casino_prize_case: Object.freeze({
        id: 'casino_prize_case',
        name: '獎品匣憑證',
        icon: '🗝️',
        type: ItemType.KEY,
        rarity: ItemRarity.EPIC,
        price: 0,
        description: '記錄展示櫃領取權的封存憑證。'
    }),
    blood_chip: Object.freeze({
        id: 'blood_chip',
        name: '血籌碼',
        icon: '🔴',
        type: ItemType.KEY,
        rarity: ItemRarity.EPIC,
        price: 0,
        description: '維斯珀用來標記高風險賭局的憑證。'
    }),
    relief_voucher: Object.freeze({
        id: 'relief_voucher',
        name: '救濟金憑單',
        icon: '📜',
        type: ItemType.KEY,
        rarity: ItemRarity.RARE,
        price: 0,
        description: '記錄賭場救濟金流向的憑單。'
    })
});

export function resolveCasinoRewardItem(itemId) {
    return CasinoSpecialItems[itemId] || RewardItemDatabase[itemId] || null;
}

export const CasinoShowcaseItems = Object.freeze([]);
export const CasinoPrizePools = Object.freeze({});

export function getCasinoShowcaseItems() {
    return [];
}

export function getCasinoPrizePools() {
    return [];
}

export function getCasinoPrizePool(poolId) {
    return CasinoPrizePools[poolId] || null;
}
