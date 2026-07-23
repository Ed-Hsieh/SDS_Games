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
    lines: lines.map(line => typeof line === 'string'
        ? { speaker: 'npc', text: line }
        : line),
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
    decision: {
        title: options.decisionTitle || '你要怎麼回覆？',
        choices: [
            {
                id: 'accept',
                kind: 'accept',
                kindLabel: '接受',
                title: options.acceptTitle || '接下請求',
                summary: options.acceptSummary || '答應處理這件事',
                commitsEffects: true,
                responseLines: options.acceptLines || [
                    { actorId: 'player', text: '好，我去看看。' },
                    { actorId: options.npcId, text: '先確認情況。遇到危險就回來。' }
                ]
            },
            ...(options.questionLines?.length ? [{
                id: 'question',
                kind: 'question',
                kindLabel: '詢問',
                title: options.questionTitle || '詢問細節',
                summary: options.questionSummary || '先確認已知情況',
                returnsToDecision: true,
                responseLines: options.questionLines
            }] : []),
            {
                id: 'leave',
                kind: 'leave',
                kindLabel: '離開',
                title: '暫時離開',
                summary: '先不答應這件事'
            }
        ]
    },
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
            { actorId: 'village_elder', expression: 'neutral', text: '對。把他實際走到的位置也告訴伊萊，免得這份回報被用錯。' }
        ], 'talk', 'village_elder:blank_reports', {
            title: '回報者走到哪裡', summary: '第三名回報者沒有抵達現場；他的否定不能被當成不存在。'
        }),
        questRequest('elder_offers_map_corners', 'map_corners_never_lie', 'ch1_s04_elder_to_scholar', [
            { actorId: 'village_elder', expression: 'guarded', text: '先等一下。這張舊地圖的捲角下還有一道記號。' },
            { actorId: 'player', text: '你認得那道記號嗎？' },
            { actorId: 'village_elder', expression: 'neutral', text: '我有印象，但不想只憑印象下判斷。伊萊保留了以前的往來文件，他能幫忙核對。' }
        ], {
            title: '捲角下的舊記號', summary: '村長想請伊萊核對受潮地圖上的舊線。',
            acceptTitle: '帶去給伊萊', acceptSummary: '請伊萊核對舊記號',
            acceptLines: [
                { actorId: 'player', text: '好，我拿去請伊萊看看。' },
                { actorId: 'village_elder', text: '別把地圖壓平。捲角的位置也可能有用。' }
            ],
            questionTitle: '詢問地圖來歷', questionSummary: '確認這張地圖從哪裡來',
            questionLines: [
                { actorId: 'player', text: '這張地圖是誰留下的？' },
                { actorId: 'village_elder', expression: 'guarded', text: '二十年前巡路隊用過。其他資料不在我手上，伊萊那裡可能還有當年的收件紀錄。' }
            ]
        }),
        ambient('elder_ordinary_paper', [
            { actorId: 'player', text: '桌上那些都是今天要處理的？' },
            { actorId: 'village_elder', text: '伊萊剛送來的。有幾份要我簽，剩下的還得找人核對。' },
            { actorId: 'player', text: '看起來不少。' },
            { actorId: 'village_elder', text: '是啊。先放著吧，我晚一點會看。' }
        ])
    ],
    town_scholar: [
        questStep('ilai_reads_map_corner', 'map_corners_never_lie', [
            { actorId: 'town_scholar', expression: 'guarded', text: '先別壓平。墨線在紙纖維下面，不是後來沾上的污痕。' },
            { actorId: 'player', text: '是路？' },
            { actorId: 'town_scholar', expression: 'neutral', text: '是一段撤退線，年份是二十年前。其他部分已經糊掉了，我現在只能確認這些。' }
        ], 'talk', 'town_scholar:map_corners', {
            title: '捲角下的線', summary: '伊萊確認捲角下是二十年前的撤退線，但拒絕替空白補上答案。'
        }),
        questRequest('ilai_offers_blank_reports', 'one_blank_too_many', 'ch1_s04_elder_to_scholar', [
            { actorId: 'town_scholar', expression: 'guarded', text: '我這裡有三份回報。一個人寫沒看見，一個人寫沒有，第三個只寫不知道。' },
            { actorId: 'player', text: '差別在他們走到了哪裡。' },
            { actorId: 'town_scholar', expression: 'pleased', text: '對。至少你沒有先替空白填答案。第三份是村長收的，我需要知道那個人走過哪一段路。' }
        ], {
            title: '第三份回報', summary: '伊萊需要確認回報者實際走過的路。',
            acceptTitle: '去問村長', acceptSummary: '查清第三人的行程',
            acceptLines: [
                { actorId: 'player', text: '我去問村長。知道他走到哪裡，這三份回報才有辦法比較。' },
                { actorId: 'town_scholar', text: '正是。問路線就好，先別問他記不記得結論。' }
            ],
            questionTitle: '查看三份回報', questionSummary: '確認三人的原文',
            questionLines: [
                { actorId: 'player', text: '先讓我看看三份回報的原文。' },
                { actorId: 'town_scholar', text: '都在這裡。字很少，問題也正在這裡；我們不知道他們是不是看過同一處地方。' }
            ]
        }),
        questRequest('ilai_offers_cave_trace', 'vein_beneath_the_roots', 'ch1_s09_rotroot_approach', [
            { actorId: 'town_scholar', expression: 'guarded', text: '你從腐根溪谷帶回的聲音紀錄，有第二層回音。根室不會這樣響。' },
            { actorId: 'player', text: '地下還有空間。' },
            { actorId: 'town_scholar', expression: 'neutral', text: '可能是舊礦道。黑根把入口附近的土石撐開了，裡面也許還留著以前的礦材。' },
            { actorId: 'town_scholar', expression: 'guarded', text: '那裡不在我們原本要走的路上。你若進去，只能自己判斷什麼時候該回頭。' }
        ], {
            title: '根下的舊礦道', summary: '回音顯示腐根側路下方另有空間。',
            acceptTitle: '調查礦道', acceptSummary: '先查看入口是否能通行',
            acceptLines: [
                { actorId: 'player', text: '我先去看入口。裡面不對勁，我就撤回來。' },
                { actorId: 'town_scholar', text: '把回程的位置記清楚。地底的聲音很容易讓人判錯距離。' }
            ],
            questionTitle: '詢問舊礦紀錄', questionSummary: '確認礦道原本的用途',
            questionLines: [
                { actorId: 'player', text: '你手上有那條礦道的紀錄嗎？' },
                { actorId: 'town_scholar', text: '只有停採前的運送單。入口位置大致相符，裡面的狀況沒有人能保證。' }
            ]
        }),
        ambient('ilai_margin_order', [
            { actorId: 'player', text: '這三疊文件有什麼差別？' },
            { actorId: 'town_scholar', text: '年份不同。村長剛才順手疊在一起，我只好重新分開。' },
            { actorId: 'player', text: '需要幫忙嗎？' },
            { actorId: 'town_scholar', text: '先不用。我知道每一疊原本放在哪裡，只是得多花一點時間。' }
        ], { route: 'encyclopedia', routeLabel: '翻閱百科' })
    ],
    herbalist: [
        ambient('mia_water_first', [
            { actorId: 'herbalist', text: '先喝一口水。' },
            { actorId: 'player', text: '我今天沒有受傷。' },
            { actorId: 'herbalist', text: '我知道。你一路走回來，嘴唇都乾了。喝完再說。' }
        ])
    ],
    standard_bearer_frey: [
        questRequest('frey_offers_patrol_soles', 'patrol_soles', 'ch1_s05_south_gate_introduction', [
            { actorId: 'standard_bearer_frey', expression: 'neutral', text: '出去時看得到路標，回來時不一定。尤其是傍晚起霧以後。' },
            { actorId: 'player', text: '要我重走一次？' },
            { actorId: 'standard_bearer_frey', expression: 'guarded', text: '南門農田和獵人棧道。走到那裡後轉身，看看回城的人能不能找到下一個標記。' }
        ], {
            title: '返程路標', summary: '芙蕾想確認兩段回程路是否看得清楚。',
            acceptTitle: '重走兩段路', acceptSummary: '從返程方向檢查路標',
            acceptLines: [
                { actorId: 'player', text: '我會從回程方向再走一次，把看不見的標記記下來。' },
                { actorId: 'standard_bearer_frey', text: '好。天色不夠就明天再去，別摸黑走棧道。' }
            ],
            questionTitle: '詢問起霧時間', questionSummary: '確認何時該折返',
            questionLines: [
                { actorId: 'player', text: '這幾天大概什麼時候起霧？' },
                { actorId: 'standard_bearer_frey', text: '比以前早。太陽碰到西邊屋頂，你就該往回走了。' }
            ]
        }),
        ambient('frey_flag_rope', [
            { actorId: 'player', text: '這兩捆繩子要放在一起嗎？' },
            { actorId: 'standard_bearer_frey', text: '左邊的留在門上，右邊的拿去補路標。別混了。' },
            { actorId: 'player', text: '右邊這捆？' },
            { actorId: 'standard_bearer_frey', text: '對。幫我擺到門邊就好，等換班的人帶出去。' }
        ])
    ],
    lamplighter_tavi: [
        questRequest('tavi_offers_lamp_clasps', 'lamp_glass_for_every_door', 'ch1_s05_south_gate_introduction', [
            { actorId: 'lamplighter_tavi', expression: 'pleased', text: '三扇門的燈扣尺寸不一樣。我本來以為重新分一次就好。' },
            { actorId: 'player', text: '實際上呢？' },
            { actorId: 'lamplighter_tavi', expression: 'guarded', text: '我把巡線燈的備用扣也分出去了。現在南門少了一個能用的。' },
            { actorId: 'lamplighter_tavi', expression: 'soft', text: '你能陪我重新核對一次嗎？我一個人去說，可能會越說越亂。' }
        ], {
            title: '重新分配燈扣', summary: '塔維少算了一個南門巡線燈扣。',
            acceptTitle: '陪他核對', acceptSummary: '重新確認三扇門的尺寸',
            acceptLines: [
                { actorId: 'player', text: '走吧。我陪你把尺寸重新量一遍。' },
                { actorId: 'lamplighter_tavi', text: '好。先從南門開始，那一盞最不能少。' }
            ],
            questionTitle: '詢問缺少數量', questionSummary: '確認要補幾個燈扣',
            questionLines: [
                { actorId: 'player', text: '現在到底少了幾個？' },
                { actorId: 'lamplighter_tavi', text: '南門少一個。其他兩扇門有替代品，只是尺寸需要重新配。' }
            ]
        }),
        ambient('tavi_spare_lamp', [
            { actorId: 'player', text: '今天怎麼帶了這麼多燈？' },
            { actorId: 'lamplighter_tavi', text: '昨晚風大，北邊那盞滅了兩次。我想多帶一盞備用。' },
            { actorId: 'player', text: '可是這裡有三盞。' },
            { actorId: 'lamplighter_tavi', text: '嗯……我裝好第二盞後，又覺得只多一盞可能不夠。' }
        ])
    ],
    blacksmith: [
        questRequest('blacksmith_offers_pot_lid', 'pot_lid_is_not_a_shield', 'ch1_s08_cold_forge_smoke', [
            { actorId: 'blacksmith', expression: 'guarded', text: '看見那只鍋蓋了？先別笑，也別拿錘子。' },
            { actorId: 'player', text: '它像一面被砸壞的盾。' },
            { actorId: 'blacksmith', expression: 'neutral', text: '它不是盾。有人拿它替共用水桶擋了落石。直接敲平，裂口會一路跑到底。' },
            { actorId: 'blacksmith', expression: 'guarded', text: '先幫我看清楚三處凹痕是怎麼疊上去的。敲錯順序，這只鍋蓋就真的只能丟了。' }
        ], {
            title: '鍋蓋上的凹痕', summary: '鐵匠要先確認三處受力順序。',
            acceptTitle: '檢查凹痕', acceptSummary: '找出落石撞擊的先後',
            acceptLines: [
                { actorId: 'player', text: '我先把三處痕跡看清楚，再回來告訴你順序。' },
                { actorId: 'blacksmith', text: '這才對。別拿錘子，尤其別拿我的。' }
            ],
            questionTitle: '詢問修理方法', questionSummary: '確認為何不能直接敲平',
            questionLines: [
                { actorId: 'player', text: '從邊緣慢慢敲回去也不行？' },
                { actorId: 'blacksmith', text: '不行。裂口已經受過三次力，先敲錯那一面，裂縫會直接穿到底。' }
            ]
        }),
        ambient('blacksmith_pot_queue', [
            { actorId: 'blacksmith', text: '武器先放旁邊。那只鍋漏了兩天，今天得先補。' },
            { actorId: 'player', text: '我的護甲還能撐多久？' },
            { actorId: 'blacksmith', text: '照你現在這樣用，撐得到下午。要是又拿肩甲去撞東西，就早點回來。' }
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
