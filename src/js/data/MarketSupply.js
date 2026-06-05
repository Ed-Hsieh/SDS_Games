import { MaterialDatabase } from './Materials.js';

const A = (row, col) => ({ row, col });

export const MarketSceneAssets = {
    background: 'src/assets/images/scenes/market-stalls-v1.png',
    itemAtlas: 'src/assets/images/atlases/item-atlas-v1.png'
};

export const MarketItemCatalog = {
    health_potion_s: {
        ...MaterialDatabase.health_potion_s,
        atlas: A(0, 0),
        marketUse: '基礎補給'
    },
    antidote: {
        ...MaterialDatabase.antidote,
        atlas: A(1, 8),
        marketUse: '毒霧與叢林探索'
    },
    slime_jelly: {
        ...MaterialDatabase.slime_jelly,
        atlas: A(1, 4),
        marketUse: '藥水原料'
    },
    beast_hide: {
        ...MaterialDatabase.beast_hide,
        atlas: A(8, 0),
        marketUse: '修補與委託材料'
    },
    iron_ore: {
        ...MaterialDatabase.iron_ore,
        atlas: A(2, 1),
        marketUse: '鍛造原料'
    },
    iron_shard: {
        ...MaterialDatabase.iron_shard,
        atlas: A(2, 7),
        marketUse: '低階鍛造補洞'
    },
    spider_silk: {
        ...MaterialDatabase.spider_silk,
        atlas: A(8, 7),
        marketUse: '誘餌與防毒織物'
    },
    silver_thread_bait: {
        id: 'silver_thread_bait',
        name: '銀絲誘餌',
        icon: '🪝',
        type: 'quest',
        rarity: 'uncommon',
        price: 90,
        sellPrice: 20,
        stackable: true,
        maxStack: 9,
        atlas: A(7, 0),
        desc: '纏著細銀絲的小鉤，只有在銀絲最密的伏道設下，才可能把潛伏者引出來。',
        marketUse: '銀鐮伏獵者觸發道具'
    },
    map_fragment: {
        id: 'map_fragment',
        name: '地圖碎片',
        icon: '🗺️',
        type: 'quest',
        rarity: 'uncommon',
        price: 150,
        atlas: A(6, 2),
        desc: '一張破舊的地圖碎片，能拼出危險路徑的一角。',
        marketUse: '懸賞與路線情報'
    },
    ancient_coin: {
        id: 'ancient_coin',
        name: '古代錢幣',
        icon: '🪙',
        type: 'key',
        rarity: 'legendary',
        price: 1000,
        isSecretKey: true,
        atlas: A(7, 4),
        desc: '一枚古老的錢幣，暗巷裡的人會比你更清楚它的價格。',
        marketUse: '黑市入口'
    },
    sharp_focus_manual: {
        id: 'sharp_focus_manual',
        name: '銳利專注手記',
        icon: '🎯',
        type: 'book',
        rarity: 'uncommon',
        passiveEffectId: 'sharp_focus',
        price: 120,
        atlas: A(6, 4),
        desc: '記錄提高爆擊判讀的戰鬥心得。',
        marketUse: '戰術技能'
    },
    guard_memory_manual: {
        id: 'guard_memory_manual',
        name: '守勢記憶手記',
        icon: '🛡️',
        type: 'book',
        rarity: 'uncommon',
        passiveEffectId: 'guard_memory',
        price: 120,
        atlas: A(6, 5),
        desc: '記錄穩定防守姿態的戰鬥心得。',
        marketUse: '戰術技能'
    }
};

export const MarketVendors = [
    {
        id: 'herbalist',
        name: '藥師',
        role: '補給與藥水',
        icon: '🌿',
        position: { x: 21, y: 58 },
        place: '市集左棚',
        summary: '她把玩家帶回來的凝膠、毒腺與藥草變成真正能上架的補給。',
        dialogue: '你帶回來的東西不只是材料。它們會決定下一個受傷的人有沒有藥喝。',
        shelves: [
            { id: 'shelf_health_potion_s', itemId: 'health_potion_s', price: 25, stock: '穩定供應', note: '最基礎也最常被低估的回城理由。' },
            {
                id: 'shelf_antidote',
                itemId: 'antidote',
                price: 35,
                stock: '叢林線',
                condition: { anyFlags: ['town.apothecary.understands_thorn_trade', 'world.story.thorn_witch.progress.deliver_herbs'] },
                lockedReason: '藥師還沒看懂荊棘交易，解毒劑只能少量保留。'
            }
        ],
        orders: [
            {
                id: 'order_slime_stock',
                title: '把凝膠熬成穩定藥水',
                story: '藥師需要史萊姆凝膠校準火候。完成後，市集的基礎藥水供應會更穩。',
                requirements: [{ itemId: 'slime_jelly', quantity: 3 }],
                rewards: { items: [{ itemId: 'health_potion_s', quantity: 2 }], flags: ['town.apothecary.stock_basic_potion'] },
                repeatable: false
            }
        ],
        exchanges: [
            {
                id: 'exchange_slime_potion',
                title: '凝膠換小型生命藥水',
                story: '不是每份凝膠都能熬成藥，但藥師願意把可用的部分先裝瓶。',
                requirements: [{ itemId: 'slime_jelly', quantity: 2 }],
                goldCost: 5,
                rewards: { items: [{ itemId: 'health_potion_s', quantity: 1 }] },
                repeatable: true
            }
        ]
    },
    {
        id: 'merchant',
        name: '旅行商人',
        role: '探索工具與情報',
        icon: '🧳',
        position: { x: 57, y: 57 },
        place: '中央貨桌',
        summary: '他販售的不是強度，而是通往事件、地點與麻煩的鑰匙。',
        dialogue: '買劍的人很多，買「麻煩的位置」的人比較少。你看起來像後者。',
        shelves: [
            { id: 'shelf_map_fragment', itemId: 'map_fragment', price: 150, stock: '路線殘片', note: '能把傳聞變成可追查的方向。' },
            {
                id: 'shelf_silver_thread_bait',
                itemId: 'silver_thread_bait',
                price: 90,
                stock: '伏獵者線',
                condition: { anyFlags: ['world.clue.silk_tripwire', 'world.clue.snapped_bait_hook', 'world.story.ambush_mantis.progress.craft_bait_hook', 'market.merchant.silver_thread_supply'] },
                lockedReason: '還沒有人把銀絲的規律講清楚，商人不會把危險道具擺到明面上。'
            }
        ],
        orders: [
            {
                id: 'order_silver_thread_supply',
                title: '試作銀絲誘餌',
                story: '商人要蜘蛛絲與鐵片固定鉤口。這不是買賣，是把怪物的習慣做成商品。',
                requirements: [
                    { itemId: 'spider_silk', quantity: 1 },
                    { itemId: 'iron_shard', quantity: 1 }
                ],
                rewards: {
                    items: [{ itemId: 'silver_thread_bait', quantity: 1 }],
                    flags: ['market.merchant.silver_thread_supply']
                },
                repeatable: true
            }
        ],
        exchanges: [
            {
                id: 'exchange_hide_map',
                title: '獸皮換路線拓片',
                story: '商人把獸皮裁成防潮封皮，順手把舊路線拓上去。',
                requirements: [{ itemId: 'beast_hide', quantity: 2 }],
                goldCost: 20,
                rewards: { items: [{ itemId: 'map_fragment', quantity: 1 }] },
                repeatable: true
            }
        ]
    },
    {
        id: 'blacksmith',
        name: '鍛造師',
        role: '低階補洞與修補',
        icon: '⚒️',
        position: { x: 43, y: 68 },
        place: '臨時砧台',
        summary: '他不在市集賣強裝，只把冒險帶回來的碎料變成能繼續製作的材料。',
        dialogue: '想要好裝備就去找圖紙和怪物。想把碎東西變得有用，就放到我桌上。',
        shelves: [
            { id: 'shelf_iron_shard', itemId: 'iron_shard', price: 24, stock: '低階補洞', note: '用來補足鍛造缺口，不替代真正採集。' }
        ],
        orders: [
            {
                id: 'order_gate_repair_stock',
                title: '整理南門修補料',
                story: '鐵礦石會先進城門與爐口，剩下的碎片才會流回鍛造台。',
                requirements: [{ itemId: 'iron_ore', quantity: 5 }],
                rewards: {
                    items: [{ itemId: 'iron_shard', quantity: 4 }],
                    flags: ['town.blacksmith.market_repair_stock']
                },
                repeatable: false
            }
        ],
        exchanges: [
            {
                id: 'exchange_ore_shards',
                title: '鐵礦石拆成鐵片',
                story: '不是優雅的工法，但缺材料時很好用。',
                requirements: [{ itemId: 'iron_ore', quantity: 1 }],
                goldCost: 10,
                rewards: { items: [{ itemId: 'iron_shard', quantity: 2 }] },
                repeatable: true
            }
        ]
    },
    {
        id: 'scholar',
        name: '書記',
        role: '手記與情報整理',
        icon: '📚',
        position: { x: 72, y: 48 },
        place: '臨時書攤',
        summary: '他把怪物、材料與路線整理成玩家能使用的手記。',
        dialogue: '你帶回來的不是雜物，是證據。證據只要排對順序，就會變成路。',
        shelves: [
            { id: 'shelf_sharp_focus_manual', itemId: 'sharp_focus_manual', price: 120, stock: '戰術手記', note: '可作為戰術技能收藏與替換來源。' },
            { id: 'shelf_guard_memory_manual', itemId: 'guard_memory_manual', price: 120, stock: '戰術手記', note: '穩定防守的常駐戰鬥思路。' }
        ],
        orders: [
            {
                id: 'order_first_route_archive',
                title: '整理近郊材料索引',
                story: '書記要幾種最普通的材料當作索引樣本。普通東西最能說明世界哪裡開始歪掉。',
                requirements: [
                    { itemId: 'slime_jelly', quantity: 1 },
                    { itemId: 'beast_hide', quantity: 1 },
                    { itemId: 'iron_ore', quantity: 1 }
                ],
                rewards: { gold: 60, flags: ['town.scholar.market_material_index'] },
                repeatable: false
            }
        ],
        exchanges: [
            {
                id: 'exchange_map_hint',
                title: '地圖碎片換路線註記',
                story: '書記不會直接把答案塞給你，但他會把地圖上不合理的地方圈起來。',
                requirements: [{ itemId: 'map_fragment', quantity: 1 }],
                rewards: { gold: 45, flags: ['town.scholar.map_hint_ready'] },
                repeatable: false
            }
        ]
    },
    {
        id: 'black_market',
        name: '黑市門縫',
        role: '風險交易',
        icon: '🕯️',
        portrait: '',
        position: { x: 88, y: 54 },
        place: '右側暗巷',
        lockedUnless: { flag: 'secretShopUnlocked' },
        lockedSummary: '暗巷那扇門還沒有承認你。真正的古代錢幣也許能讓它開口。',
        summary: '這裡不販售公平，只販售捷徑與代價。',
        dialogue: '別問東西從哪來。你付的不是金幣，是少問一句話的能力。',
        shelves: [
            { id: 'shelf_ancient_coin', itemId: 'ancient_coin', price: 1000, stock: '反向交易', note: '如果你還沒找到真正的入口，這東西會讓你開始懷疑入口也在找你。' }
        ],
        orders: [],
        exchanges: [
            {
                id: 'exchange_coin_to_black_market',
                title: '交出古代錢幣',
                story: '門縫裡有人笑了一聲，像是早就知道你會把它帶來。',
                requirements: [{ itemId: 'ancient_coin', quantity: 1 }],
                rewards: { interactionId: 'merchant_ancient_coin' },
                repeatable: false
            }
        ]
    }
];

export function getMarketVendor(vendorId) {
    return MarketVendors.find(vendor => vendor.id === vendorId) || MarketVendors[0];
}

export function getMarketItem(itemId) {
    return MarketItemCatalog[itemId] || MaterialDatabase[itemId] || null;
}
