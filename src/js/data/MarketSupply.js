import { MaterialDatabase } from './Materials.js';
import { attachCharacterProfile } from './CharacterProfiles.js';


export const MarketSceneAssets = {
    background: 'src/assets/images/art-v2/town-places/market.webp',
};

export const MarketItemCatalog = {
    health_potion_s: {
        ...MaterialDatabase.health_potion_s,
        marketUse: '基礎補給'
    },
    antidote: {
        ...MaterialDatabase.antidote,
        marketUse: '毒霧與叢林探索'
    },
    slime_jelly: {
        ...MaterialDatabase.slime_jelly,
        marketUse: '藥水原料'
    },
    beast_hide: {
        ...MaterialDatabase.beast_hide,
        marketUse: '修補與委託材料'
    },
    iron_ore: {
        ...MaterialDatabase.iron_ore,
        marketUse: '鍛造原料'
    },
    iron_shard: {
        ...MaterialDatabase.iron_shard,
        marketUse: '低階鍛造補洞'
    },
    spider_silk: {
        ...MaterialDatabase.spider_silk,
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
        desc: '記錄穩定防守姿態的戰鬥心得。',
        marketUse: '戰術技能'
    },
    quick_rhythm_manual: {
        id: 'quick_rhythm_manual',
        name: '迅捷節奏手記',
        icon: '⚡',
        type: 'book',
        rarity: 'rare',
        passiveEffectId: 'quick_rhythm',
        price: 250,
        desc: '記錄提高攻擊頻率的戰鬥心得。',
        marketUse: '第二章以後的攻擊節奏戰術'
    },
    fatal_reading_manual: {
        id: 'fatal_reading_manual',
        name: '致命判讀手記',
        icon: '💥',
        type: 'book',
        rarity: 'rare',
        passiveEffectId: 'fatal_reading',
        price: 180,
        desc: '記錄提高爆擊傷害的戰鬥心得。',
        marketUse: '黑市勝率線索後的爆擊戰術'
    }
};

export const MarketVendors = [
    {
        id: 'apothecary_assistant',
        name: '伊芙',
        role: '藥棚助手',
        icon: '🧪',
        portrait: 'src/assets/images/art-v2/portraits/apothecary_assistant.webp',
        position: { x: 24, y: 62 },
        place: '左側藥棚',
        summary: '伊芙負責把蓮娜整理好的配方、凝膠與草藥變成真正能賣給冒險者的補給。',
        dialogue: '蓮娜負責看懂怪事，我負責把怪事熬成你喝得下去的東西。先說好，味道不保證，活著比較重要。',
        shelves: [
            { id: 'shelf_health_potion_s', itemId: 'health_potion_s', price: 25, stock: '穩定供應', note: '最基礎也最常被低估的回城理由。' },
            {
                id: 'shelf_antidote',
                itemId: 'antidote',
                price: 35,
                stock: '叢林線',
                condition: { anyFlags: ['town.apothecary.understands_thorn_trade', 'world.story.thorn_witch.progress.deliver_herbs'] },
                lockedReason: '蓮娜還沒看懂荊棘交易，伊芙不敢把解毒劑擺到明面上。'
            }
        ],
        orders: [
            {
                id: 'order_slime_stock',
                title: '把凝膠熬成穩定藥水',
                story: '伊芙照著蓮娜的筆記熬煮史萊姆凝膠。完成後，市集的基礎藥水供應會更穩。',
                requirements: [{ itemId: 'slime_jelly', quantity: 3 }],
                rewards: { items: [{ itemId: 'health_potion_s', quantity: 2 }], flags: ['town.apothecary.stock_basic_potion'] },
                repeatable: false
            }
        ],
        exchanges: [
            {
                id: 'exchange_slime_potion',
                title: '凝膠換小型生命藥水',
                story: '不是每份凝膠都能熬成藥，但伊芙會把可用的部分先裝瓶，順便抱怨瓶子比怪物還難洗。',
                requirements: [{ itemId: 'slime_jelly', quantity: 2 }],
                goldCost: 5,
                rewards: { items: [{ itemId: 'health_potion_s', quantity: 1 }] },
                repeatable: true
            },
            {
                id: 'exchange_poison_gland_antidote',
                title: '毒腺調成解毒劑',
                story: '伊芙把毒腺切得非常小心。她說毒物最怕的不是勇氣，是比例。',
                condition: { anyFlags: ['town.apothecary.understands_thorn_trade', 'dungeon.jungle.cleared'] },
                lockedReason: '藥棚還沒掌握毒霧與荊棘交易的規律，不能把毒腺直接拿來調配。',
                requirements: [{ itemId: 'poison_gland', quantity: 1 }],
                goldCost: 12,
                rewards: { items: [{ itemId: 'antidote', quantity: 2 }] },
                repeatable: true
            }
        ]
    },
    {
        id: 'merchant',
        name: '奧托',
        role: '行腳貨商',
        icon: '🧳',
        portrait: 'src/assets/images/art-v2/portraits/merchant.webp',
        position: { x: 56, y: 59 },
        place: '中央貨車',
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
                lockedReason: '還沒有人把銀絲的規律講清楚，奧托不會把危險道具擺到明面上。'
            }
        ],
        orders: [
            {
                id: 'order_silver_thread_supply',
                title: '試作銀絲誘餌',
                story: '奧托要蜘蛛絲與鐵片固定鉤口。這不是買賣，是把怪物的習慣做成商品。',
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
                story: '奧托把獸皮裁成防潮封皮，順手把舊路線拓上去。',
                requirements: [{ itemId: 'beast_hide', quantity: 2 }],
                goldCost: 20,
                rewards: { items: [{ itemId: 'map_fragment', quantity: 1 }] },
                repeatable: true
            }
        ]
    },
    {
        id: 'tinker',
        name: '柏恩',
        role: '修補雜貨商',
        icon: '🧰',
        portrait: 'src/assets/images/art-v2/portraits/tinker.webp',
        position: { x: 36, y: 76 },
        place: '修補木桌',
        summary: '他把零散金屬、皮繩和補洞材料整理成能繼續使用的物資。',
        dialogue: '缺一片鐵、少一條皮繩、包裡全是尷尬的零件，就來找我。',
        shelves: [
            { id: 'shelf_iron_shard', itemId: 'iron_shard', price: 24, stock: '補洞材料', note: '用來補足鍛造缺口，不替代真正採集。' }
        ],
        orders: [
            {
                id: 'order_gate_repair_stock',
                title: '整理南門修補料',
                story: '柏恩要先把鐵礦石分給城門、爐口與臨時修補箱；碎片才會回到市集。',
                requirements: [{ itemId: 'iron_ore', quantity: 5 }],
                rewards: {
                    items: [{ itemId: 'iron_shard', quantity: 4 }],
                    flags: ['market.tinker.repair_stock']
                },
                repeatable: false
            }
        ],
        exchanges: [
            {
                id: 'exchange_ore_shards',
                title: '鐵礦石拆成鐵片',
                story: '不是優雅的工法，但缺材料時很好用。柏恩堅稱這叫「務實」。',
                requirements: [{ itemId: 'iron_ore', quantity: 1 }],
                goldCost: 10,
                rewards: { items: [{ itemId: 'iron_shard', quantity: 2 }] },
                repeatable: true
            }
        ]
    },
    {
        id: 'rumor_broker',
        name: '米菈',
        role: '傳聞剪報人',
        icon: '🗞️',
        portrait: 'src/assets/images/art-v2/portraits/rumor_broker.webp',
        position: { x: 72, y: 52 },
        place: '布告角落',
        summary: '她不寫正式紀錄，只把布告、碎紙和酒杯旁的閒話剪成能用的路線提示。',
        dialogue: '正式紀錄總是慢半拍，我負責把事情寫得來得及。兩者都很重要，尤其是後者比較便宜。',
        shelves: [
            { id: 'shelf_sharp_focus_manual', itemId: 'sharp_focus_manual', price: 120, stock: '戰術手記', note: '可作為戰術技能收藏與替換來源。' },
            { id: 'shelf_guard_memory_manual', itemId: 'guard_memory_manual', price: 120, stock: '戰術手記', note: '穩定防守的常駐戰鬥思路。' },
            {
                id: 'shelf_quick_rhythm_manual',
                itemId: 'quick_rhythm_manual',
                price: 250,
                stock: '第二章手記',
                condition: { anyFlags: ['town.casino.false_odds_exposed', 'market.rumor.material_index', 'secretShopUnlocked'] },
                lockedReason: '米菈還沒有足夠的戰鬥剪報，不敢把進階攻擊節奏手記拿出來。'
            },
            {
                id: 'shelf_fatal_reading_manual',
                itemId: 'fatal_reading_manual',
                price: 180,
                stock: '黑市判讀',
                condition: { anyFlags: ['town.casino.false_odds_exposed', 'market.black_market.coal_token_traded'] },
                lockedReason: '勝率與黑市帳冊還沒有接上，這份判讀手記暫時只是一張危險的空白紙。'
            }
        ],
        orders: [
            {
                id: 'order_first_route_archive',
                title: '整理近郊材料索引',
                story: '米菈要幾種最普通的材料當作剪報樣本。普通東西最能說明世界哪裡開始歪掉。',
                requirements: [
                    { itemId: 'slime_jelly', quantity: 1 },
                    { itemId: 'beast_hide', quantity: 1 },
                    { itemId: 'iron_ore', quantity: 1 }
                ],
                rewards: { gold: 60, flags: ['market.rumor.material_index'] },
                repeatable: false
            }
        ],
        exchanges: [
            {
                id: 'exchange_map_hint',
                title: '地圖碎片換路線註記',
                story: '米菈不會直接把答案塞給你，但她會把地圖上不合理的地方圈得很難忽視。',
                requirements: [{ itemId: 'map_fragment', quantity: 1 }],
                rewards: { gold: 45, flags: ['market.rumor.map_hint_ready'] },
                repeatable: false
            },
            {
                id: 'exchange_echo_rhythm',
                title: '回聲殼節奏比對',
                story: '你描述回聲殼裡那段不屬於水流的節奏。米菈聽完只說：「這不是傳聞，這是順序。」',
                condition: { anyFlags: ['world.clue.oracle_shell'] },
                lockedReason: '你還沒有帶著會回聲的殼。沒有節奏，米菈也只能聳肩。',
                requirements: [],
                goldCost: 40,
                rewards: { interactionId: 'rumor_echo_rhythm' },
                repeatable: false
            }
        ]
    },
    {
        id: 'black_market',
        name: '門縫掌櫃',
        role: '風險交易',
        icon: '🕯️',
        portrait: 'src/assets/images/art-v2/portraits/black_market.webp',
        position: { x: 85, y: 62 },
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
            },
            {
                id: 'exchange_coal_token',
                title: '買下走私煤印',
                story: '你提到帳冊缺頁上的貨號。門縫後沉默了一會兒，然後一枚煤印被推了出來，價格寫在沉默裡。',
                condition: { anyFlags: ['world.clue.ash_ledger_page'] },
                lockedReason: '沒看過灰燼帳冊的人，掌櫃不會承認煤印這種東西存在。',
                requirements: [],
                goldCost: 220,
                rewards: { interactionId: 'black_market_coal_token' },
                repeatable: false
            }
        ]
    }
];

export function getMarketVendor(vendorId) {
    const vendor = MarketVendors.find(entry => entry.id === vendorId) || MarketVendors[0];
    return vendor ? attachCharacterProfile(vendor) : null;
}

export function getAllMarketVendors() {
    return MarketVendors.map(vendor => attachCharacterProfile(vendor));
}

export function getMarketItem(itemId) {
    return MarketItemCatalog[itemId] || MaterialDatabase[itemId] || null;
}
