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

const questRequest = (id, questId, afterSceneId, lines, options = {}) => ({
    id,
    priority: options.priority || 82,
    tone: 'discovery',
    once: true,
    narrativeTitle: options.title,
    narrativeSummary: options.summary,
    conditions: [
        { type: 'flag', flag: `story.scene.${afterSceneId}.complete`, value: true },
        { type: 'questStatus', questId, status: 'locked' }
    ],
    lines,
    effects: [
        { type: 'unlockQuest', questId },
        { type: 'acceptQuest', questId, message: `已接取：${options.title}` }
    ],
    route: options.route || 'quest',
    routeLabel: options.routeLabel || '查看任務'
});

const questStep = (id, questId, lines, objectiveType, target, options = {}) => ({
    id,
    priority: options.priority || 88,
    tone: 'discovery',
    once: true,
    narrativeTitle: options.title,
    narrativeSummary: options.summary,
    conditions: [{ type: 'questStatus', questId, status: 'active' }],
    lines,
    effects: [{ type: 'questProgress', objectiveType, target, amount: 1, message: options.message }]
});

export const TownDialogueDatabase = {
    village_elder: [
        questStep('elder_checks_blank_report', 'one_blank_too_many', [
            { actorId: 'player', text: '伊萊要確認第三份回報的人走到哪裡。' },
            { actorId: 'village_elder', expression: 'guarded', text: '只到南門水溝。他沒進林，也沒看見那條棧道。' },
            { actorId: 'player', text: '所以他寫的「沒有」，其實只是「沒看見」。' },
            { actorId: 'village_elder', expression: 'neutral', text: '把這句帶回去。伊萊會很高興多出一種麻煩。' }
        ], 'talk', 'village_elder:blank_reports', {
            title: '回報者走到哪裡', summary: '第三名回報者沒有抵達現場；他的否定不能被當成不存在。'
        }),
        questRequest('elder_offers_map_corners', 'map_corners_never_lie', 'ch1_s04_elder_to_scholar', [
            { actorId: 'village_elder', expression: 'guarded', text: '別拿釘子。這張地圖底下還壓著一段舊記號。' },
            { actorId: 'player', text: '你看不清楚？' },
            { actorId: 'village_elder', expression: 'neutral', text: '我看得太清楚，才需要另一個人確認。拿去給伊萊。只問那是什麼，別替它補結局。' }
        ], { title: '地圖總是不平', summary: '村長交出受潮地圖，要伊萊只辨認捲角下的舊記號。' }),
        ambient('elder_ordinary_paper', [
            '伊萊說這疊紙不能再壓杯子。我說如果它連一杯水都承受不了，可能也不適合承受城鎮。',
            '他沒有笑，只把杯子移到我的地圖上。這就是我們目前對休息的共識。'
        ])
    ],
    town_scholar: [
        questStep('ilai_reads_map_corner', 'map_corners_never_lie', [
            { actorId: 'town_scholar', expression: 'guarded', text: '先別壓平。墨線在紙纖維下面，不是後來沾上的污痕。' },
            { actorId: 'player', text: '是路？' },
            { actorId: 'town_scholar', expression: 'neutral', text: '一段撤退線。年份是二十年前。其他部分我沒有證據，不替你猜。' }
        ], 'talk', 'town_scholar:map_corners', {
            title: '捲角下的線', summary: '伊萊確認捲角下是二十年前的撤退線，但拒絕替空白補上答案。'
        }),
        questRequest('ilai_offers_blank_reports', 'one_blank_too_many', 'ch1_s04_elder_to_scholar', [
            { actorId: 'town_scholar', expression: 'guarded', text: '三張回報。一張寫沒看見，一張寫沒有，一張寫不知道。村長要我整理成一欄。' },
            { actorId: 'player', text: '你不打算照做。' },
            { actorId: 'town_scholar', expression: 'pleased', text: '我打算先證明他為什麼不該這樣要求。去問他第三個人到底走到哪裡。' }
        ], { title: '空格不是答案', summary: '伊萊拒絕把三種未知壓成同一個答案。' }),
        questRequest('ilai_offers_cave_trace', 'vein_beneath_the_roots', 'ch1_s09_rotroot_approach', [
            { actorId: 'town_scholar', expression: 'guarded', text: '你從腐根溪谷帶回的聲音紀錄，有第二層回音。根室不會這樣響。' },
            { actorId: 'player', text: '地下還有空間。' },
            { actorId: 'town_scholar', expression: 'neutral', text: '舊礦道。入口被黑根頂開了。那不是森林守護者的必經路，但洞裡留下的礦材或裝備，可能讓那場戰鬥少一點勉強。' },
            { actorId: 'town_scholar', expression: 'guarded', text: '先說清楚：高價值通常只是高風險留下的另一種名字。要不要進去，由你決定。' }
        ], { title: '根下的斷脈', summary: '腐根側路顯露幽暗洞窟入口；它是可選的高風險準備路線。' }),
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
        questRequest('frey_offers_patrol_soles', 'patrol_soles', 'ch1_s05_south_gate_introduction', [
            { actorId: 'standard_bearer_frey', expression: 'neutral', text: '出發的人看得見前標。真正缺的是返程。' },
            { actorId: 'player', text: '要我重走一次？' },
            { actorId: 'standard_bearer_frey', expression: 'guarded', text: '南門農田和獵人棧道。到現場後轉身，從回城者的方向看。別只顧著往前。' }
        ], { title: '巡線靴底', summary: '芙蕾要求從返程者的視線檢查兩段既有道路。' }),
        ambient('frey_flag_rope', [
            '塔維又把燈繩繫到旗繩上。她說這樣不會忘，我說這樣兩個人會一起摔。',
            '她改口說這叫團隊精神。我正在考慮把團隊精神剪斷。'
        ])
    ],
    lamplighter_tavi: [
        questRequest('tavi_offers_lamp_clasps', 'lamp_glass_for_every_door', 'ch1_s05_south_gate_introduction', [
            { actorId: 'lamplighter_tavi', expression: 'pleased', text: '三扇門，三盞燈，三種尺寸。理論上非常簡單。' },
            { actorId: 'player', text: '實際上呢？' },
            { actorId: 'lamplighter_tavi', expression: 'guarded', text: '實際上每扇門都覺得自己的燈最急，而我可能把巡線燈的備用扣也分出去了。' },
            { actorId: 'lamplighter_tavi', expression: 'soft', text: '幫我在南門重新配一次。我負責在芙蕾發現以前承認錯誤。' }
        ], { title: '每扇門都嫌燈歪', summary: '塔維需要把居民燈與巡線燈的扣件重新分配。' }),
        ambient('tavi_spare_lamp', [
            '我帶了三盞備燈。芙蕾說太多，我說她也帶了三段備繩。',
            '所以我們現在非常專業，而且誰都不能先笑對方。'
        ])
    ],
    blacksmith: [
        questRequest('blacksmith_offers_pot_lid', 'pot_lid_is_not_a_shield', 'ch1_s08_cold_forge_smoke', [
            { actorId: 'blacksmith', expression: 'guarded', text: '看見那只鍋蓋了？先別笑，也別拿錘子。' },
            { actorId: 'player', text: '它像一面被砸壞的盾。' },
            { actorId: 'blacksmith', expression: 'neutral', text: '它不是盾。有人拿它替共用水桶擋了落石。直接敲平，裂口會一路跑到底。' },
            { actorId: 'blacksmith', expression: 'guarded', text: '先替我把三處受力順序找出來。要修東西，就先承認它經歷過什麼。' }
        ], { title: '鍋蓋不是盾', summary: '鐵匠要求先讀懂鍋蓋的受力痕跡，再開始修理。' }),
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
