/**
 * NPCDialogues.js
 * Optional ambient town dialogue only. Mandatory story scenes are owned by
 * StorySceneRegistry and always take precedence in DialogueManager/LobbyScene.
 */

const portrait = id => `src/assets/images/art/characters/portraits/${id}.webp`;

export const TownNPCDatabase = {
    village_elder: {
        id: 'village_elder',
        portrait: portrait('village_elder'),
        name: '村長',
        avatar: '村',
        role: '城鎮決策者',
        location: '裂痕廣場'
    },
    town_scholar: {
        id: 'town_scholar',
        portrait: portrait('town_scholar'),
        name: '伊萊',
        avatar: '書',
        role: '城鎮書記',
        location: '檔案室',
        route: 'encyclopedia',
        routeLabel: '翻閱百科'
    },
    herbalist: {
        id: 'herbalist',
        portrait: portrait('herbalist'),
        name: '米婭',
        avatar: '藥',
        role: '藥師與配方研究者',
        location: '藥草工作室'
    },
    standard_bearer_frey: {
        id: 'standard_bearer_frey',
        portrait: portrait('standard_bearer_frey'),
        name: '芙蕾',
        avatar: '旗',
        role: '巡線持旗者',
        location: '南門殘階'
    },
    lamplighter_tavi: {
        id: 'lamplighter_tavi',
        portrait: portrait('lamplighter_tavi'),
        name: '塔維',
        avatar: '燈',
        role: '巡線點燈人',
        location: '南門殘階'
    },
    blacksmith: {
        id: 'blacksmith',
        portrait: portrait('blacksmith'),
        name: '鐵匠',
        avatar: '鍛',
        role: '城鎮鐵匠',
        location: '冷爐鐵匠鋪',
        route: 'forge',
        routeLabel: '使用鍛造'
    },
    street_beggar: {
        id: 'street_beggar',
        portrait: portrait('street_beggar'),
        name: '乞丐',
        avatar: '巷',
        role: '尋找回音的人',
        location: '背巷'
    },
    merchant: {
        id: 'merchant',
        portrait: portrait('merchant'),
        name: '商人',
        avatar: '商',
        role: '公開市集交易者',
        location: '市集邊棚',
        route: 'shop',
        routeLabel: '查看市集'
    },
    black_market: {
        id: 'black_market',
        portrait: portrait('black_market'),
        name: '黑市商人',
        avatar: '黑',
        role: '第三方來源交易者',
        location: '背巷黑市'
    },
    casino_dealer: {
        id: 'casino_dealer',
        portrait: portrait('casino_dealer'),
        name: '洛恩',
        avatar: '牌',
        role: '荷官',
        location: '玻璃櫃賭場',
        route: 'casino',
        routeLabel: '進入賭場'
    },
    casino_owner: {
        id: 'casino_owner',
        portrait: portrait('casino_owner'),
        name: '維斯珀',
        avatar: '主',
        role: '賭場主人',
        location: '玻璃櫃賭場',
        route: 'casino',
        routeLabel: '查看展示櫃'
    }
};

const ambient = (id, lines, options = {}) => ({
    id,
    priority: options.priority || 1,
    tone: options.tone || 'ambient',
    lines: lines.map(text => ({ speaker: 'npc', text })),
    route: options.route,
    routeLabel: options.routeLabel
});

export const TownDialogueDatabase = {
    village_elder: [
        ambient('elder_ordinary_paper', [
            '伊萊說這疊紙不能再壓杯子。我說如果它連一杯水都承受不了，可能也不適合承受城鎮。',
            '他沒有笑，只把杯子移到我的地圖上。這就是我們目前對休息的共識。'
        ])
    ],
    town_scholar: [
        ambient('ilai_margin_order', [
            '村長又把三種不同年份的紙疊在一起。我分開了，他又拿去壓桌腳。',
            '友情有很多形式。替某人保留錯誤原稿，大概是比較累的那一種。'
        ], { route: 'encyclopedia', routeLabel: '翻閱百科' })
    ],
    herbalist: [
        ambient('mia_water_first', [
            '先喝水。你今天沒有受傷也一樣。',
            '別露出那種表情。照顧活人不是只有快死的時候才開始。'
        ])
    ],
    standard_bearer_frey: [
        ambient('frey_flag_rope', [
            '塔維又把燈繩繫到旗繩上。她說這樣不會忘，我說這樣兩個人會一起摔。',
            '她改口說這叫團隊精神。我正在考慮把團隊精神剪斷。'
        ])
    ],
    lamplighter_tavi: [
        ambient('tavi_spare_lamp', [
            '我帶了三盞備燈。芙蕾說太多，我說她也帶了三段備繩。',
            '所以我們現在非常專業，而且誰都不能先笑對方。'
        ])
    ],
    blacksmith: [
        ambient('blacksmith_pot_queue', [
            '武器先放旁邊。那只鍋漏得比你的護甲有決心。',
            '等它不再把湯送回地板，我才處理你那些想把怪物送回地裡的東西。'
        ], { route: 'forge', routeLabel: '使用鍛造' })
    ],
    street_beggar: [
        ambient('ailo_scrap_bag', [
            '不是葉子。葉子會走。這個不會。',
            '她說沒用的要留下。能用的會被拿走。你袋子太乾淨，路不喜歡。'
        ])
    ],
    merchant: [
        ambient('merchant_finite_stock', [
            '貨架看起來空，不代表我不會做生意。代表我至少沒有把空氣標成限量。',
            '等路回來，貨才回來。這條規矩不華麗，但不會半夜來收利息。'
        ], { route: 'shop', routeLabel: '查看市集' })
    ],
    black_market: [
        ambient('black_market_one_contract', [
            '我說過，空白抵契只有一張。賣出去以後，空白和後果都不再是我的庫存。',
            '你可以不喜歡這個答案。來源不會因為你的喜好長出第二份。'
        ])
    ],
    casino_dealer: [
        ambient('lorne_guest_dice', [
            '桌面公開，不代表桌下沒有東西。我以前靠這句差別活著，也靠它害過人。',
            '別把這當道歉。先看客方骰，再決定要不要坐下。'
        ], { route: 'casino', routeLabel: '進入賭場' })
    ],
    casino_owner: [
        ambient('vesper_fairness', [
            '輸的人，總是比較會談公平。',
            '我從不逼人下注。我只是把他們真正想要的東西放到桌上。',
            '公平？當然公平。每個人都有輸光的權利。'
        ], { route: 'casino', routeLabel: '查看展示櫃' })
    ]
};

export function getTownNPC(npcId) {
    return TownNPCDatabase[npcId] || null;
}

export function getTownNPCDialogues(npcId) {
    return TownDialogueDatabase[npcId] || [];
}

export function getAllTownNPCs() {
    return Object.values(TownNPCDatabase);
}
