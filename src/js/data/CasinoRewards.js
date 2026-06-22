import { ItemRarity, ItemType } from '../models/Enums.js';
import { MaterialDatabase } from './Materials.js';
import { QuestRewardItems } from './Quests.js';
import { ShopData, SecretShopItems } from './Items.js';

export const CasinoRewardRarityText = {
    common: '普通',
    uncommon: '優良',
    rare: '稀有',
    epic: '史詩',
    legendary: '傳說'
};

export const CasinoRewardTierOrder = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5
};

export const CasinoSpecialItems = {
    casino_chip_bundle: {
        id: 'casino_chip_bundle',
        name: '沉甸甸的籌碼袋',
        icon: '🪙',
        type: ItemType.CURRENCY,
        rarity: ItemRarity.UNCOMMON,
        price: 0,
        description: '裝著一把賭場籌碼的布袋。真正有價值的是袋口那股讓人想再押一次的重量。'
    },
    black_market_ticket: {
        id: 'black_market_ticket',
        name: '黑市籤',
        icon: '🎟️',
        type: ItemType.KEY,
        rarity: ItemRarity.RARE,
        price: 0,
        description: '用舊羊皮紙裁成的籤，背面有一行幾乎看不清的暗號。'
    },
    casino_prize_case: {
        id: 'casino_prize_case',
        name: '封蠟奇物匣',
        icon: '🎁',
        type: ItemType.KEY,
        rarity: ItemRarity.EPIC,
        price: 0,
        description: '匣蓋被暗紅封蠟鎖住，搖晃時會發出像骨骰碰撞的細響。'
    },
    blood_chip: {
        id: 'blood_chip',
        name: '血色籌碼',
        icon: '🔴',
        type: ItemType.KEY,
        rarity: ItemRarity.EPIC,
        price: 0,
        description: '紅得不太像染料的籌碼。帳房說最好不要問它是怎麼染上去的。'
    },
    relief_voucher: {
        id: 'relief_voucher',
        name: '避難補給券',
        icon: '🎫',
        type: ItemType.KEY,
        rarity: ItemRarity.RARE,
        price: 0,
        description: '賭場把一部分黑錢換成乾糧與藥品後留下的憑證。這可能是城裡最荒唐的善行。'
    },
    recipe_fragment: {
        id: 'recipe_fragment',
        name: '圖紙碎片',
        icon: '📜',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        price: 0,
        description: '從奇物櫃底層翻出的半張圖紙，邊角有酒漬和指印。'
    },
    forbidden_blueprint_fragment: {
        id: 'forbidden_blueprint_fragment',
        name: '禁售圖紙殘頁',
        icon: '📕',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        price: 0,
        description: '被撕掉署名的圖紙殘頁，黑市商人只承認它「曾經非常合法」。'
    }
};

const SHOP_ITEM_INDEX = Object.values(ShopData)
    .flatMap(shop => shop.items || [])
    .concat(SecretShopItems || [])
    .reduce((index, item) => {
        index[item.id] = item;
        return index;
    }, {});

export function resolveCasinoRewardItem(itemId) {
    return CasinoSpecialItems[itemId]
        || MaterialDatabase[itemId]
        || QuestRewardItems[itemId]
        || SHOP_ITEM_INDEX[itemId]
        || null;
}

export const CasinoPrizePools = {
    daily_curios: {
        id: 'daily_curios',
        name: '日常奇物櫃',
        subtitle: '小賭客也碰得到的桌邊雜貨',
        minChapter: 1,
        cost: 80,
        pityAfter: 7,
        pityMinRarity: ItemRarity.UNCOMMON,
        description: '補給、基礎素材與少量圖紙碎片。這裡不會改變命運，但很適合把零碎金幣換成冒險準備。',
        atmosphere: '骨骰在木桌上跳了兩下，帳房沒有抬頭，只用指尖把籌碼推回光裡。',
        rewards: [
            { id: 'daily_chips', kind: 'chips', rarity: ItemRarity.COMMON, name: '籌碼回流', icon: '🪙', amount: [25, 55], weight: 26 },
            { id: 'daily_gold', kind: 'gold', rarity: ItemRarity.COMMON, name: '散落金幣', icon: '💰', amount: [45, 90], weight: 18 },
            { id: 'daily_potion', kind: 'item', itemId: 'health_potion_s', rarity: ItemRarity.COMMON, quantity: [1, 2], weight: 18 },
            { id: 'daily_ore', kind: 'item', itemId: 'iron_ore', rarity: ItemRarity.COMMON, quantity: [1, 3], weight: 16 },
            { id: 'daily_fragment', kind: 'item', itemId: 'recipe_fragment', rarity: ItemRarity.UNCOMMON, quantity: [1, 2], weight: 11 },
            { id: 'daily_manual_focus', kind: 'item', itemId: 'sharp_focus_manual', rarity: ItemRarity.UNCOMMON, quantity: 1, weight: 7, limit: 1 },
            { id: 'daily_black_ticket', kind: 'item', itemId: 'black_market_ticket', rarity: ItemRarity.RARE, quantity: 1, weight: 4, minChapter: 2 }
        ]
    },
    black_market_curios: {
        id: 'black_market_curios',
        name: '黑市奇物櫃',
        subtitle: '勝率表背後的暗格',
        minChapter: 2,
        unlockFlag: 'town.casino.false_odds_exposed',
        cost: 180,
        pityAfter: 9,
        pityMinRarity: ItemRarity.RARE,
        description: '稀有素材、戰術手記、黑市籤與賭場限定道具。瑪洛說這不是抽獎，是把髒錢變成可追蹤的形狀。',
        atmosphere: '櫃門打開時有股焚香和鐵鏽味，角落有人笑了一聲，又立刻安靜下來。',
        rewards: [
            { id: 'black_rare_metal', kind: 'item', itemId: 'rare_metal', rarity: ItemRarity.RARE, quantity: [1, 2], weight: 22 },
            { id: 'black_forge_core', kind: 'item', itemId: 'forge_core', rarity: ItemRarity.RARE, quantity: 1, weight: 18 },
            { id: 'black_quick_manual', kind: 'item', itemId: 'quick_rhythm_manual', rarity: ItemRarity.RARE, quantity: 1, weight: 14, limit: 1 },
            { id: 'black_fatal_manual', kind: 'item', itemId: 'fatal_reading_manual', rarity: ItemRarity.RARE, quantity: 1, weight: 12, limit: 1 },
            { id: 'black_ticket', kind: 'item', itemId: 'black_market_ticket', rarity: ItemRarity.RARE, quantity: [1, 2], weight: 12 },
            { id: 'black_prize_case', kind: 'item', itemId: 'casino_prize_case', rarity: ItemRarity.EPIC, quantity: 1, weight: 8, limit: 2 },
            { id: 'black_loaded_dice', kind: 'item', itemId: 'loaded_dice', rarity: ItemRarity.EPIC, quantity: 1, weight: 6, limit: 1 },
            { id: 'black_blood_chip', kind: 'item', itemId: 'blood_chip', rarity: ItemRarity.EPIC, quantity: 1, weight: 5, limit: 2 },
            { id: 'black_legendary_shard', kind: 'item', itemId: 'legendary_shard', rarity: ItemRarity.LEGENDARY, quantity: 1, weight: 3, minChapter: 3 }
        ]
    },
    last_lamp_jackpot: {
        id: 'last_lamp_jackpot',
        name: '最後燈火獎池',
        subtitle: '末日前仍亮著的金色誘惑',
        minChapter: 3,
        unlockFlag: 'town.casino.relief_fund_counted',
        cost: 520,
        pityAfter: 18,
        pityMinRarity: ItemRarity.EPIC,
        description: '第三章才開放的限量獎池。它會吐出終局材料、賭場限定飾品與少量傳說獎，但不能取代副本與 BOSS 路線。',
        atmosphere: '惡魔莊家的影子貼在牆上，像是有人在低聲提醒：再押一次，也許這次就是奇蹟。',
        rewards: [
            { id: 'lamp_world_shard', kind: 'item', itemId: 'world_shard', rarity: ItemRarity.EPIC, quantity: 1, weight: 18 },
            { id: 'lamp_forbidden_page', kind: 'item', itemId: 'forbidden_blueprint_fragment', rarity: ItemRarity.EPIC, quantity: 1, weight: 16 },
            { id: 'lamp_relief_voucher', kind: 'item', itemId: 'relief_voucher', rarity: ItemRarity.RARE, quantity: [1, 2], weight: 16 },
            { id: 'lamp_legendary_shard', kind: 'item', itemId: 'legendary_shard', rarity: ItemRarity.LEGENDARY, quantity: [1, 2], weight: 10 },
            { id: 'lamp_gamblers_fallacy', kind: 'item', itemId: 'gamblers_fallacy', rarity: ItemRarity.EPIC, quantity: 1, weight: 10, limit: 1 },
            { id: 'lamp_lucky_charm', kind: 'item', itemId: 'lucky_charm_7', rarity: ItemRarity.LEGENDARY, quantity: 1, weight: 4, limit: 1 },
            { id: 'lamp_demon_contract', kind: 'item', itemId: 'demon_contract', rarity: ItemRarity.LEGENDARY, quantity: 1, weight: 2, limit: 1 }
        ]
    }
};

export function getCasinoPrizePools() {
    return Object.values(CasinoPrizePools);
}

export function getCasinoPrizePool(poolId) {
    return CasinoPrizePools[poolId] || null;
}
