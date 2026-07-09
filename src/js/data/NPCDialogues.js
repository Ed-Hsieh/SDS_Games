/**
 * NPCDialogues.js
 * Clean dialogue data for the broken-town rebuild.
 *
 * Old dialogue overlays were removed. These entries are actor-driven scripts
 * aligned with the new town recovery flow.
 */

const portrait = id => `src/assets/images/art/characters/portraits/${id}.webp`;

export const TownNPCDatabase = {
    village_elder: {
        id: 'village_elder',
        portrait: portrait('village_elder'),
        name: '村長奧倫',
        avatar: '村',
        role: '臨時指揮者',
        location: '裂鐘廣場',
        route: 'quest',
        routeLabel: '整理任務'
    },
    town_scholar: {
        id: 'town_scholar',
        portrait: portrait('town_scholar'),
        name: '學者伊萊',
        avatar: '書',
        role: '手札與線索整理',
        location: '殘頁書庫',
        route: 'encyclopedia',
        routeLabel: '翻閱百科'
    },
    blacksmith: {
        id: 'blacksmith',
        portrait: portrait('blacksmith'),
        name: '鐵匠布朗',
        avatar: '鍛',
        role: '鍛造核心',
        location: '冷爐鐵匠鋪',
        route: 'forge',
        routeLabel: '查看鍛造'
    },
    old_miner_bran: {
        id: 'old_miner_bran',
        portrait: portrait('old_miner_bran'),
        name: '老礦工布蘭',
        avatar: '礦',
        role: '礦線與藍圖',
        location: '冷爐鐵匠鋪'
    },
    herbalist: {
        id: 'herbalist',
        portrait: portrait('herbalist'),
        name: '草藥師瑪菈',
        avatar: '藥',
        role: '治療與解毒',
        location: '空棚市集',
        route: 'shop',
        routeLabel: '查看藥品'
    },
    merchant: {
        id: 'merchant',
        portrait: portrait('merchant'),
        name: '行商科文',
        avatar: '商',
        role: '路線貨物',
        location: '空棚市集',
        route: 'shop',
        routeLabel: '查看商店'
    },
    tinker: {
        id: 'tinker',
        portrait: portrait('tinker'),
        name: '修補匠皮普',
        avatar: '修',
        role: '零件與工具',
        location: '空棚市集'
    },
    supply_captain: {
        id: 'supply_captain',
        portrait: portrait('supply_captain'),
        name: '補給隊長瑟菈',
        avatar: '補',
        role: '補給與防具流通',
        location: '南門殘壘',
        route: 'shop',
        routeLabel: '查看補給'
    },
    standard_bearer_frey: {
        id: 'standard_bearer_frey',
        portrait: portrait('standard_bearer_frey'),
        name: '旗手弗雷',
        avatar: '旗',
        role: '南門防線',
        location: '南門殘壘'
    },
    rumor_broker: {
        id: 'rumor_broker',
        portrait: portrait('rumor_broker'),
        name: '情報販子蕾恩',
        avatar: '聞',
        role: '傳聞與精英警告',
        location: '殘頁書庫'
    },
    street_beggar: {
        id: 'street_beggar',
        portrait: portrait('street_beggar'),
        name: '街角乞者',
        avatar: '巷',
        role: '黑市入口',
        location: '背街暗巷'
    },
    black_market: {
        id: 'black_market',
        portrait: portrait('black_market'),
        name: '黑市商人',
        avatar: '黑',
        role: '禁貨交易',
        location: '背街暗巷'
    },
    casino_dealer: {
        id: 'casino_dealer',
        portrait: portrait('casino_dealer'),
        name: '荷官賽菈',
        avatar: '牌',
        role: '票券與獎池',
        location: '封燈賭場',
        route: 'casino',
        routeLabel: '前往賭場'
    },
    accountant_marlo: {
        id: 'accountant_marlo',
        portrait: portrait('accountant_marlo'),
        name: '帳房馬洛',
        avatar: '帳',
        role: '賭場帳本',
        location: '封燈賭場'
    },
    casino_owner: {
        id: 'casino_owner',
        portrait: portrait('casino_owner'),
        name: '賭場老闆',
        avatar: '主',
        role: '展示櫃支線',
        location: '封燈賭場'
    },
    lamplighter_tavi: {
        id: 'lamplighter_tavi',
        portrait: portrait('lamplighter_tavi'),
        name: '掌燈人塔薇',
        avatar: '燈',
        role: '夜路與微光',
        location: '南門殘壘'
    },
    tower_warden: {
        id: 'tower_warden',
        portrait: portrait('tower_warden'),
        name: '守塔人',
        avatar: '塔',
        role: '塔改版前伏筆',
        location: '遠塔封影',
        route: 'tower',
        routeLabel: '查看封塔'
    }
};

export const TownDialogueDatabase = {
    village_elder: [
        {
            id: 'elder_broken_town_opening',
            priority: 120,
            once: true,
            tone: 'discovery',
            conditions: [{ type: 'notFlag', flag: 'town.elder.first_warning' }],
            narrativeTitle: '南門巡路未歸',
            narrativeSummary: '廣場的鐘沒有響。奧倫站在裂鐘下，把南門外那張斷掉的路線交給我。',
            lines: [
                { speaker: 'narration', text: '廣場的鐘沒有響。' },
                { speaker: 'narration', text: '它裂在高處，裂口裡卡著一點灰。風吹過去，只帶出細細的金屬聲，像有人用指甲刮過鐵皮。' },
                { speaker: 'narration', text: '奧倫站在鐘下，外衣扣得很整齊，袖口卻磨白了。他看見我時沒有立刻開口。南門那邊有人低聲說話，又很快停下。' },
                { speaker: 'npc', text: '昨夜的巡路人沒回來。' },
                { speaker: 'narration', text: '他把一張潮軟的紙遞給我。紙上只畫了幾條短線，到了南門外就斷開。' },
                { speaker: 'npc', text: '外頭的路不是壞了一段。是每一段都沒人敢說還能走。' },
                { speaker: 'npc', text: '你不是我的兵，也不是牆上會被人畫下來的英雄。你只是現在還願意出門的冒險家。這就夠了。' },
                { speaker: 'npc', text: '我不需要你現在去逞勇。先去找伊萊。他會把你能確認的地方標進手札。' },
                { speaker: 'narration', text: '奧倫停了一下，聲音壓低。' },
                { speaker: 'npc', text: '農田、棧道、舊營火點。看它們還在不在。看路上有沒有新腳印、煙，或者不該出現的痕跡。' }
            ],
            effects: [
                { type: 'setFlag', flag: 'town.elder.first_warning', value: true },
                { type: 'setFlag', flag: 'town.network.first_recovery_named', value: true },
                { type: 'unlockQuest', questId: 'main_001' },
                { type: 'acceptQuest', questId: 'main_001', message: '主線開始：確認南門外第一段巡路是否還能通行。' }
            ],
            route: 'quest',
            routeLabel: '查看主線'
        },
        {
            id: 'report_main_001',
            priority: 112,
            conditions: [{ type: 'questStatus', questId: 'main_001', status: 'completed' }],
            narrativeTitle: '第一張沾泥的路線',
            narrativeSummary: '我把三處地標帶回廣場。奧倫沒有慶祝，他先確認哪一段能讓人回城，哪一段還會咬人。',
            lines: [
                { speaker: 'narration', text: '我把三處地標帶回廣場。手札邊角沾著泥，舊營火點的灰卡在紙縫裡，怎麼拍都拍不乾淨。' },
                { speaker: 'narration', text: '奧倫沒有慶祝。他先看農田，再看棧道，最後停在舊營火點那一行。' },
                { speaker: 'npc', text: '三處都看過了？好。把手札放這裡。別擦泥，泥比口供可靠。' },
                { speaker: 'npc', text: '農田還能到，棧道有拖痕，舊營火點有人停過。這不是好消息，但至少不是黑紙一張。' },
                { speaker: 'narration', text: '他從桌旁取出一把短劍。劍鞘舊得發灰，握柄上的皮早被汗磨平。' },
                { speaker: 'npc', text: '拿著。你接下來會遇到的，不一定只是路。別嫌它醜，能撐過第一趟就值了。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'main_001' }
            ],
            route: 'quest',
            routeLabel: '查看任務'
        },
        {
            id: 'report_main_004',
            priority: 110,
            conditions: [{ type: 'questStatus', questId: 'main_004', status: 'completed' }],
            narrativeTitle: '銀絲伏道重新透風',
            narrativeSummary: '銀鐮伏獵者倒下後，獵人舊路重新透風。更遠處的腐根溪谷也第一次露出黑煙。',
            participants: ['village_elder', 'town_scholar'],
            lines: [
                { speaker: 'narration', text: '我把斷鉤和一小片鐮足放在桌上。金屬還帶著冷味。奧倫沒有伸手，伊萊先把它們推到路線圖邊。' },
                { actorId: 'village_elder', text: '獵人舊路能走了。短一點的回程，能救命。這句話今天是真的。' },
                { actorId: 'town_scholar', text: '也讓遠處的東西露出來了。棧道那邊的黑煙，以前被樹線擋住，現在看得很清楚。太直了，不像普通營火。' },
                { actorId: 'village_elder', text: '別把它貼成公告。先標出腐根溪谷。讓他去看煙、樹皮、震動。活著帶回來，再談那是不是森林自己的聲音。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'main_004' }
            ],
            route: 'adventure',
            routeLabel: '前往腐根溪谷'
        },
        {
            id: 'report_main_006',
            priority: 96,
            conditions: [{ type: 'questStatus', questId: 'main_006', status: 'completed' }],
            narrativeTitle: '血月退到林後',
            narrativeSummary: '角鹿倒下後，南門外少了一種夜裡撞石的聲音。安靜不是結束，只是能讓人睡一下。',
            lines: [
                { speaker: 'narration', text: '角鹿倒下後，夜裡少了一種聲音。南門火盆旁的人抬頭聽了很久，像不太相信安靜也會是真的。' },
                { speaker: 'npc', text: '夜裡安靜了。守門的人反而更不習慣，總覺得少聽見什麼就會漏掉什麼。' },
                { speaker: 'npc', text: '這件事記下來。不是主路上的門鎖，但它是森林傷口的一圈裂紋。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'main_006' }
            ],
            route: 'quest',
            routeLabel: '查看任務'
        },
        {
            id: 'elder_recovery_network',
            priority: 70,
            conditions: [{ type: 'flag', flag: 'town.network.first_recovery_named' }],
            narrativeTitle: '復興不是收集人名',
            lines: [
                { speaker: 'npc', text: '找回人很重要，但人回來以後還要有能做事的路。布朗需要礦線，瑪菈需要藥草，守衛需要每天能走完的巡線。' },
                { speaker: 'npc', text: '城鎮不是把名字填回名冊就會好。你每帶回一條路、一份材料、一個消息，這裡才會多一點明天。' }
            ],
            route: 'quest',
            routeLabel: '查看任務'
        },
        {
            id: 'elder_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '先讓城鎮能呼吸。其他雄心壯志可以等到我們不再用雨水煮湯。' }
            ],
            route: 'quest',
            routeLabel: '查看任務'
        }
    ],
    town_scholar: [
        {
            id: 'scholar_first_index',
            priority: 100,
            once: true,
            conditions: [{ type: 'notFlag', flag: 'town.scholar.first_index_open' }],
            narrativeTitle: '南門外的三個記號',
            narrativeSummary: '伊萊把第一段巡路拆成三個可確認的地點。這不是學者的興趣，是讓出城的人知道該看什麼。',
            lines: [
                { speaker: 'narration', text: '伊萊的書桌比廣場更窄，也更亂。線繩繞過墨瓶，幾張濕紙壓在書脊下，油燈太小，火光只能照亮一半地圖。' },
                { speaker: 'narration', text: '他沒有問我是不是準備好了。那種問題對一張斷掉的路線沒有用。' },
                { speaker: 'npc', text: '奧倫讓你來？好。那我少講兩句他那種會讓人背脊發冷的話，直接講路。' },
                { speaker: 'narration', text: '伊萊把三枚小釘壓在紙上。南門農田、獵人棧道、舊營火點。三個點靠得很近，近到不像冒險，反而像城鎮門口裂了一道縫。' },
                { speaker: 'npc', text: '三個地方，很近，也因此更糟。近處如果說不清，遠處就不用談。' },
                { speaker: 'npc', text: '農田看水溝和腳印。棧道看木板邊緣。營火點看灰。冷灰被翻過，就代表那裡有人停過，或有東西學會等人。' },
                { speaker: 'npc', text: '你這趟不是去證明自己不怕死。看到怪物，不確定就退。帶回來的消息要能被讀，人才要能回來。' },
                { speaker: 'npc', text: '三處都記下來，我們才知道下一個問題該落在哪裡。事情要一段一段接上，不然只是把人推進霧裡。' }
            ],
            effects: [
                { type: 'setFlag', flag: 'town.scholar.first_index_open', value: true },
                { type: 'setFlag', flag: 'town.gate.defense_problem_named', value: true },
                { type: 'questProgress', objectiveType: 'talk', target: 'town_scholar', amount: 1, message: '伊萊已標出南門農田、獵人棧道與舊營火點。' }
            ],
            route: 'adventure',
            routeLabel: '前往南門外'
        },
        {
            id: 'report_main_002',
            priority: 111,
            conditions: [{ type: 'questStatus', questId: 'main_002', status: 'completed' }],
            narrativeTitle: '甜膩黏液裡的銀光',
            narrativeSummary: '農田史萊姆被壓下去後，伊萊才有樣本能看。銀絲不是從史萊姆身上長出來的，它是被黏液帶回來的。',
            lines: [
                { speaker: 'narration', text: '瓶子放到桌上時，裡面的凝膠還在慢慢滑動。甜味貼著玻璃口往外滲，混著水溝泥和草根的腥氣。' },
                { speaker: 'npc', text: '瓶子放桌上。別擦瓶口，甜味也算證據。' },
                { speaker: 'narration', text: '伊萊沒有立刻碰它。他先把油燈拉近，燈火壓下去，黏液深處浮出一條極細的銀線。' },
                { speaker: 'narration', text: '很細。卻沒有斷。' },
                { speaker: 'npc', text: '看見沒有？史萊姆沒有織線的本事，牠只是把路上的東西黏回農田。' },
                { speaker: 'npc', text: '所以下一步不是再殺幾隻。沿著獵人棧道和舊營火點回查，找它從哪裡黏上來。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'main_002' }
            ],
            route: 'quest',
            routeLabel: '查看任務'
        },
        {
            id: 'report_main_003',
            priority: 110,
            conditions: [{ type: 'questStatus', questId: 'main_003', status: 'completed' }],
            narrativeTitle: '銀絲不是偶然',
            narrativeSummary: '獵人棧道、舊營火點與被割裂的木牌連成一條回程路。伏擊不是隨機發生，它挑的是人最想回家的時候。',
            lines: [
                { speaker: 'narration', text: '誘餌鉤斷在桌上。切口很平。沒有牙痕，也不像被石頭磨斷。伊萊用鑷子夾起它，鉤尖晃了一下，發出很短的聲音。' },
                { speaker: 'npc', text: '舊營火、斷牌、誘餌鉤。三個點落在同一條回程上。這不是亂抓人，是等人放鬆。' },
                { speaker: 'npc', text: '牠知道人會在哪裡回頭，哪裡會停下喝水。很聰明。聰明到讓人想罵。' },
                { speaker: 'narration', text: '他把斷鉤放到銀線旁，兩樣東西一靠近，紙上的回程路忽然變得清楚。' },
                { speaker: 'npc', text: '我用你帶回來的銀絲和斷鉤做了一個粗糙誘餌。別把它當武器，它比較像一句挑釁。去銀絲最密的地方，把牠引出來。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'main_003' }
            ],
            route: 'adventure',
            routeLabel: '前往伏道'
        },
        {
            id: 'report_main_005',
            priority: 112,
            conditions: [{ type: 'questStatus', questId: 'main_005', status: 'completed' }],
            narrativeTitle: '證據排到廣場',
            narrativeSummary: '古樹守衛倒下後，伊萊先把所有證據排開：回程路、黑煙、樹根震動。裂鐘不再是謎語，而是新的懷疑。',
            participants: ['town_scholar', 'village_elder'],
            lines: [
                { speaker: 'narration', text: '伊萊把焦黑核心包在乾布裡帶到廣場。奧倫站在桌旁，手沒有碰它，只看灰落在紙上。' },
                { actorId: 'town_scholar', text: '我先說看得見的。棧道重新通了，黑煙才露出來。黑煙往腐根溪谷走，根心附近的震動最強。這些都接得上。' },
                { actorId: 'village_elder', text: '然後接到鐘？' },
                { actorId: 'town_scholar', text: '還不是答案。只是懷疑。古樹守衛像是在回應某種訊號，可那個訊號應該從城裡出去。現在城裡最沉默的東西，就是廣場那口裂鐘。' },
                { actorId: 'village_elder', text: '懷疑先收好。別貼公告板。人會怕怪物，也會怕一句還沒證實的真話。' },
                { actorId: 'town_scholar', text: '下一步往霧碑丘陵。那裡有舊路標，石碑也許能告訴我們，鐘以前到底拿來做什麼。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'main_005' }
            ],
            route: 'quest',
            routeLabel: '查看主線'
        },
        {
            id: 'scholar_rumor_network',
            priority: 70,
            conditions: [{ type: 'flag', flag: 'market.rumor.material_index' }],
            narrativeTitle: '行情與情報開始合流',
            lines: [
                { speaker: 'npc', text: '科文的行情表很髒，蕾恩的傳聞很吵。但髒紙和吵話放在一起，偶爾會露出真正的路。' },
                { speaker: 'npc', text: '我會把怪物、貨價、傳聞和地名排在同一頁。你不用相信每一句話，只要知道哪一句值得去驗。' }
            ],
            route: 'encyclopedia',
            routeLabel: '翻閱百科'
        },
        {
            id: 'scholar_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '如果你帶回來的東西看起來沒用，先別丟。很多偉大的研究都從「這坨東西很可疑」開始。' }
            ],
            route: 'encyclopedia',
            routeLabel: '翻閱百科'
        }
    ],
    blacksmith: [
        {
            id: 'blacksmith_cold_forge',
            priority: 100,
            once: true,
            conditions: [{ type: 'notFlag', flag: 'town.blacksmith.forge_open' }],
            narrativeTitle: '冷爐不是商店',
            narrativeSummary: '布朗把冷爐說成一條斷掉的生路：沒有礦線、火候與工具，再多金幣也只是在買失望。',
            lines: [
                { speaker: 'npc', text: '爐子冷了，工具缺了，礦線斷了。你現在就算把錢塞給我，我也只能替你打造一把非常昂貴的失望。' },
                { speaker: 'npc', text: '想開爐，先找回可用的鐵、煤、藍圖，還有一點別把手伸進火裡的常識。最後那個最難。' }
            ],
            effects: [
                { type: 'setFlag', flag: 'town.forge.problem_named', value: true }
            ],
            route: 'forge',
            routeLabel: '查看冷爐'
        },
        {
            id: 'blacksmith_forge_open',
            priority: 80,
            conditions: [{ type: 'flag', flag: 'town.blacksmith.forge_open' }],
            narrativeTitle: '爐火回來了',
            lines: [
                { speaker: 'npc', text: '火回來了。別感動太早，火不會替你挑好材料。' },
                { speaker: 'npc', text: '我能替你做出可靠的東西，但真正稀奇的材料不會自己滾進爐裡。想要更好的，就去把麻煩拆回來。' }
            ],
            route: 'forge',
            routeLabel: '使用鍛造'
        },
        {
            id: 'blacksmith_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '好鐵不會自己變成好劍。壞劍倒是常常自己跑到我桌上。' }
            ],
            route: 'forge',
            routeLabel: '查看鍛造'
        }
    ],
    old_miner_bran: [
        {
            id: 'miner_route_note',
            priority: 80,
            once: true,
            narrativeTitle: '礦線的壞消息',
            lines: [
                { speaker: 'npc', text: '礦坑不是空了，是路斷了。路斷了就沒有鐵，沒有鐵就沒有鍛造，沒有鍛造就只能靠運氣活。' },
                { speaker: 'npc', text: '我不反對運氣，但運氣通常不會幫你修盔甲。' }
            ],
            effects: [
                { type: 'setFlag', flag: 'town.mine.route_problem_named', value: true }
            ]
        },
        {
            id: 'miner_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '聽石頭說話不是瘋，是經驗。石頭至少不會謊報庫存。' }
            ]
        }
    ],
    herbalist: [
        {
            id: 'herbalist_empty_shelves',
            priority: 90,
            once: true,
            conditions: [{ type: 'notFlag', flag: 'town.apothecary.stock_basic_potion' }],
            narrativeTitle: '空藥櫃',
            lines: [
                { speaker: 'npc', text: '藥櫃空得很乾淨。乾淨到我差點想拿它當鏡子，但我今天不想被現實打第二次。' },
                { speaker: 'npc', text: '幫我找回基礎材料，我能先把小藥水恢復。解毒、抗性和特殊藥品要等路線更穩。' }
            ],
            effects: [
                { type: 'setFlag', flag: 'town.apothecary.problem_named', value: true }
            ],
            route: 'shop',
            routeLabel: '查看藥品'
        },
        {
            id: 'herbalist_stock_open',
            priority: 80,
            conditions: [{ type: 'flag', flag: 'town.apothecary.stock_basic_potion' }],
            narrativeTitle: '藥櫃重新開張',
            lines: [
                { speaker: 'npc', text: '有藥了。還不多，但至少大家受傷時不用再喝一碗「看起來像湯的勇氣」。' },
                { speaker: 'npc', text: '要是城外開始冒毒，先來找我。用牙齒咬過去很英勇，也很容易讓我多洗一張裹屍布。' }
            ],
            route: 'shop',
            routeLabel: '查看藥品'
        },
        {
            id: 'herbalist_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '我會笑，不代表事情不糟。只是如果連笑都沒有，藥效會被心情扣防。' }
            ],
            route: 'shop',
            routeLabel: '查看藥品'
        }
    ],
    merchant: [
        {
            id: 'merchant_supply_route',
            priority: 90,
            once: true,
            conditions: [{ type: 'notFlag', flag: 'town.supply.first_route_open' }],
            narrativeTitle: '貨物不是從空氣裡長出來',
            lines: [
                { speaker: 'npc', text: '你問為什麼我沒賣好東西？因為貨車不會憑信念穿過怪物。信念很輕，貨箱很重。' },
                { speaker: 'npc', text: '打通路線後，我能穩定補基礎素材、防具和消耗品。想要稀奇貨，就得找更稀奇的麻煩。' }
            ],
            effects: [
                { type: 'setFlag', flag: 'town.supply.route_problem_named', value: true }
            ],
            route: 'shop',
            routeLabel: '查看商店'
        },
        {
            id: 'merchant_route_open',
            priority: 80,
            conditions: [{ type: 'flag', flag: 'town.supply.first_route_open' }],
            narrativeTitle: '第一條路線打通',
            lines: [
                { speaker: 'npc', text: '貨到了。你看，商業奇蹟的本質就是有人替貨車清掉路上的牙齒和爪子。' },
                { speaker: 'npc', text: '哪條路穩了，哪批貨才敢進來。金幣不是魔法，它只是讓願意冒險的人多走一趟。' }
            ],
            route: 'shop',
            routeLabel: '查看商店'
        },
        {
            id: 'merchant_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '我不是貪財，我只是對「大家都活下來」這件事收一點搬運費。' }
            ],
            route: 'shop',
            routeLabel: '查看商店'
        }
    ],
    tinker: [
        {
            id: 'tinker_parts',
            priority: 70,
            once: true,
            narrativeTitle: '修補匠的零件箱',
            lines: [
                { speaker: 'npc', text: '我能把壞掉的東西修到能用。不能保證好看，好看通常是另一筆預算。' },
                { speaker: 'npc', text: '門軸、燈座、公告板、攤位腳，壞起來都很小聲。小聲不代表不重要，很多路就是從一顆螺絲開始斷的。' }
            ],
            effects: [
                { type: 'setFlag', flag: 'town.tinker.repair_logic_named', value: true }
            ]
        },
        {
            id: 'tinker_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '只要螺絲還在，事情就還有商量。螺絲不在也行，我會假裝它在。' }
            ]
        }
    ],
    supply_captain: [
        {
            id: 'quartermaster_first_route',
            priority: 90,
            once: true,
            conditions: [{ type: 'notFlag', flag: 'town.supply.first_route_open' }],
            narrativeTitle: '補給隊長的清單',
            lines: [
                { speaker: 'npc', text: '我缺三樣東西：可走的路、可搬的人、可活著回來的你。第三項目前看起來最不穩定。' },
                { speaker: 'npc', text: '路穩了，貨箱才敢出去；貨箱敢出去，盔甲、繃帶和箭才會回來。這不是生意，是呼吸。' }
            ],
            effects: [
                { type: 'setFlag', flag: 'town.supply.route_problem_named', value: true, message: '補給線問題已被標記，真正打通需要後續任務。' }
            ],
            route: 'shop',
            routeLabel: '查看補給'
        },
        {
            id: 'quartermaster_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '少一箱貨，我會知道。少一個藉口，我也會知道。' }
            ],
            route: 'shop',
            routeLabel: '查看補給'
        }
    ],
    standard_bearer_frey: [
        {
            id: 'frey_gate_line',
            priority: 90,
            once: true,
            narrativeTitle: '殘旗升起',
            lines: [
                { speaker: 'npc', text: '旗不是給敵人看的，是給回頭的人看的。只要還看得到它，就還知道家在哪。' },
                { speaker: 'npc', text: '南門能站穩，路標才有人巡，回來的人才知道哪一盞火是家。' }
            ],
            effects: [
                { type: 'setFlag', flag: 'town.gate.defense_problem_named', value: true }
            ],
            route: 'adventure',
            routeLabel: '前往冒險'
        },
        {
            id: 'frey_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '我不太會說笑。能回來的人越多，我也許會慢慢想起來。' }
            ],
            route: 'adventure',
            routeLabel: '前往冒險'
        }
    ],
    rumor_broker: [
        {
            id: 'rumor_material_index',
            priority: 90,
            once: true,
            conditions: [{ type: 'notFlag', flag: 'market.rumor.material_index' }],
            narrativeTitle: '傳聞也能救命',
            lines: [
                { speaker: 'npc', text: '你要真相？真相很貴。傳聞便宜一點，而且有時候比較準，因為真相會害羞。' },
                { speaker: 'npc', text: '怪物掉什麼，商人缺什麼，賭場藏什麼，黑市怕什麼。我能把它們串成一條線。別問來源，問了就漲價。' }
            ],
            effects: [
                { type: 'setFlag', flag: 'market.rumor.material_index', value: true },
                { type: 'setFlag', flag: 'town.rumor.elite_warning_open', value: true }
            ]
        },
        {
            id: 'rumor_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '我說的是傳聞，不是謊言。差別是傳聞會自己走路，謊言通常要人推。' }
            ]
        }
    ],
    street_beggar: [
        {
            id: 'beggar_black_market_hint',
            priority: 90,
            conditions: [{ type: 'notFlag', flag: 'secretShopUnlocked' }],
            narrativeTitle: '暗巷裡的入口',
            lines: [
                { speaker: 'npc', text: '你以為我在乞討？也對，我確實在乞討。只是我討的不是錢，是有人終於聽懂暗號。' },
                { speaker: 'npc', text: '黑市賣的不是便宜貨，是正常路線不敢碰的東西。你會心動，店主會記帳，代價通常比收據晚到。' }
            ]
        },
        {
            id: 'beggar_after_black_market',
            priority: 80,
            conditions: [{ type: 'flag', flag: 'secretShopUnlocked' }],
            narrativeTitle: '門已經開了',
            lines: [
                { speaker: 'npc', text: '門開了。記得，黑市商人不怕你沒錢，他們怕你沒有什麼能失去。' }
            ]
        },
        {
            id: 'beggar_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '好人會把秘密藏起來，壞人會把秘密賣出去。我只是剛好坐在中間。' }
            ]
        }
    ],
    black_market: [
        {
            id: 'black_market_locked',
            priority: 90,
            conditions: [{ type: 'notFlag', flag: 'secretShopUnlocked' }],
            narrativeTitle: '尚未承認存在的商人',
            lines: [
                { speaker: 'npc', text: '你走錯門了。或者說，你還沒有證明自己走錯得很有價值。' }
            ]
        },
        {
            id: 'black_market_open',
            priority: 80,
            once: true,
            conditions: [{ type: 'flag', flag: 'secretShopUnlocked' }],
            narrativeTitle: '禁貨不是免費答案',
            lines: [
                { speaker: 'npc', text: '我賣的是選擇。裝備、素材、消息、債務。有些東西標價，有些東西記名。' },
                { speaker: 'npc', text: '真正的交易不只換走金幣。它會換走誰願意信你，誰開始怕你，還有某些夜裡你能不能睡穩。' }
            ],
            effects: [
                { type: 'setFlag', flag: 'town.black_market.rules_explained', value: true }
            ]
        },
        {
            id: 'black_market_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '放心，我很公平。我對每個人都收不同的價格。' }
            ]
        }
    ],
    casino_dealer: [
        {
            id: 'dealer_locked_floor',
            priority: 90,
            once: true,
            conditions: [{ type: 'notFlag', flag: 'town.casino.showcase_seen' }],
            narrativeTitle: '封燈賭場的第一眼',
            lines: [
                { speaker: 'npc', text: '現在還不能上桌，但你可以看展示櫃。看是免費的，想要就開始變貴。' },
                { speaker: 'npc', text: '賭場不是公告板。這裡不催你做事，只把想要的東西放亮一點，讓你自己靠近。' }
            ],
            effects: [
                { type: 'setFlag', flag: 'town.casino.showcase_seen', value: true }
            ],
            route: 'casino',
            routeLabel: '查看賭場'
        },
        {
            id: 'dealer_prize_pool',
            priority: 80,
            conditions: [{ type: 'flag', flag: 'town.casino.showcase_seen' }],
            narrativeTitle: '獎池該讓人心動',
            lines: [
                { speaker: 'npc', text: '普通獎、進階獎、稀有獎、超稀有獎、大獎。表格要清楚，欲望才會自己算數。' },
                { speaker: 'npc', text: '別擔心，沒有保底。希望是最貴的籌碼。' }
            ],
            route: 'casino',
            routeLabel: '查看賭場'
        },
        {
            id: 'dealer_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '上桌前先想清楚。當然，想太清楚的人通常不會上桌，所以我建議你想一半就好。' }
            ],
            route: 'casino',
            routeLabel: '查看賭場'
        }
    ],
    accountant_marlo: [
        {
            id: 'marlo_ledger',
            priority: 80,
            narrativeTitle: '帳本不笑',
            lines: [
                { speaker: 'npc', text: '籌碼會笑，帳本不會。帳本只記得誰以為自己快贏了。' },
                { speaker: 'npc', text: '債務、展示櫃、票券來源、獎池變動，全都要寫在同一張帳上。少一筆，麻煩就會裝成沒發生。' }
            ]
        },
        {
            id: 'marlo_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '我不阻止任何人下注。我只負責確定他們下注後還記得自己的名字。' }
            ]
        }
    ],
    casino_owner: [
        {
            id: 'owner_showcase_route',
            priority: 90,
            once: true,
            conditions: [{ type: 'flag', flag: 'town.casino.showcase_seen' }],
            narrativeTitle: '展示櫃後面的支線',
            lines: [
                { speaker: 'npc', text: '你看見了玻璃後面的東西。很好。人不是為了委託走進賭場，是為了那件隔著玻璃還會發亮的東西。' },
                { speaker: 'npc', text: '等你陷得夠深，我會給你一個選擇。它不一定公平，但一定會留下痕跡。' }
            ],
            effects: [
                { type: 'setFlag', flag: 'town.casino.owner_route_seeded', value: true }
            ],
            route: 'casino',
            routeLabel: '查看展示櫃'
        },
        {
            id: 'owner_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '玻璃是很誠實的東西。它告訴你距離，也告訴你慾望。' }
            ],
            route: 'casino',
            routeLabel: '查看賭場'
        }
    ],
    lamplighter_tavi: [
        {
            id: 'tavi_glimmer_route',
            priority: 80,
            once: true,
            narrativeTitle: '微光不是光明',
            lines: [
                { speaker: 'npc', text: '我點的是微光，不是奇蹟。奇蹟通常不準時，燈至少會在我手上。' },
                { speaker: 'npc', text: '微光只是光的前聲。它能教你看見節奏，不能替你把黑夜全部撕開。真正的光，現在還太遠。' }
            ],
            effects: [
                { type: 'setFlag', flag: 'town.lamplighter.glimmer_route_named', value: true }
            ]
        },
        {
            id: 'tavi_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '怕黑很正常。怕黑還硬說自己不怕，才比較需要我多帶一盞燈。' }
            ]
        }
    ],
    tower_warden: [
        {
            id: 'warden_tower_hold',
            priority: 80,
            narrativeTitle: '塔先不要碰',
            lines: [
                { speaker: 'npc', text: '塔還在。名字不要急著改，門也不要急著開。壞掉的門先鎖著，比假裝能通行更誠實。' },
                { speaker: 'npc', text: '等外頭的光與影都有了答案，再來碰塔。現在進去，只會把人的影子折回來。' }
            ]
        },
        {
            id: 'warden_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '有些門不開，是因為鑰匙還沒做好。有些門不開，是因為門後還沒有活人該聽的答案。' }
            ]
        }
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
