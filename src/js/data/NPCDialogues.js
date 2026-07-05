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
        role: '百科與怪物紀錄',
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
            narrativeTitle: '裂鐘底下的第一句話',
            narrativeSummary: '奧倫沒有把你當成單純的跑腿。他直接指出城鎮真正壞掉的不是牆，而是人、路、貨源與情報全斷在一起。',
            lines: [
                { speaker: 'npc', text: '你回來得正好。別急著問哪裡需要殺怪，現在整座城鎮需要的不是一把劍，是能重新接上的手。' },
                { speaker: 'npc', text: '市場沒有貨，鐵匠鋪沒有火，南門沒有巡線，書庫只有半本索引。聽起來像四個問題，實際上是一個問題。' },
                { speaker: 'npc', text: '先從公告板開始。它很醜，但至少比我這張臉更會把壞消息排成順序。' }
            ],
            effects: [
                { type: 'setFlag', flag: 'town.elder.first_warning', value: true },
                { type: 'setFlag', flag: 'town.network.first_recovery_named', value: true },
                { type: 'unlockQuest', questId: 'main_001' },
                { type: 'acceptQuest', questId: 'main_001', message: '主線開始：先理解這座破碎城鎮缺了什麼。' }
            ],
            route: 'quest',
            routeLabel: '查看主線'
        },
        {
            id: 'elder_recovery_network',
            priority: 70,
            conditions: [{ type: 'flag', flag: 'town.network.first_recovery_named' }],
            narrativeTitle: '復興不是收集人名',
            lines: [
                { speaker: 'npc', text: '找回人很重要，但你要記得，人不是功能按鈕。布朗回來了，還要有礦線；瑪菈開櫃了，還要有藥草。' },
                { speaker: 'npc', text: '如果哪天你覺得自己只是把 NPC 一個個放回格子裡，那就是我們把劇本寫壞了。到時候把那段拆掉重寫。' }
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
            narrativeTitle: '第一份怪物索引',
            narrativeSummary: '伊萊把百科定位成戰鬥準備的一部分，而不是單純展示資料。',
            lines: [
                { speaker: 'npc', text: '我可以把你遇到的怪物整理成索引。別露出那種表情，這不是作業，這是少挨一爪子的技術。' },
                { speaker: 'npc', text: '普通怪、菁英、BOSS 的掉落邏輯要分開記。菁英怪難纏得像欠了牠錢，掉落也該有相應價值。' },
                { speaker: 'npc', text: '等索引完整一點，我會把副本準備、素材來源和裝備方向一起標上去。' }
            ],
            effects: [
                { type: 'setFlag', flag: 'town.scholar.first_index_open', value: true }
            ],
            route: 'encyclopedia',
            routeLabel: '翻閱百科'
        },
        {
            id: 'scholar_rumor_network',
            priority: 70,
            conditions: [{ type: 'flag', flag: 'market.rumor.material_index' }],
            narrativeTitle: '行情與情報開始合流',
            lines: [
                { speaker: 'npc', text: '科文的行情表很髒，蕾恩的傳聞很吵，但兩者合在一起就是玩家真正需要的路線提示。' },
                { speaker: 'npc', text: '我們之後要讓每個區間知道自己為什麼要打怪、買貨、賭票券或進副本。只是升等不夠。' }
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
            narrativeSummary: '布朗把鍛造功能的缺失說成劇情問題，而不是 UI 暫時鎖住。',
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
                { speaker: 'npc', text: '工藝系列可以當穩定基準，菁英怪和副本掉落則負責把你推去冒險。兩邊都要有理由存在。' }
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
                { speaker: 'npc', text: '如果後面怪物開始用毒，市場就要有解毒來源。不是每個危機都該靠玩家硬扛。' }
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
                { speaker: 'npc', text: '之後每條路線都可以對應一批素材、裝備、防具或副本補給。這樣金幣才會有重量。' }
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
                { speaker: 'npc', text: '城鎮互動以後應該有更多可修節點：門、燈、公告板、攤位、鍛造工具。這些都能讓地圖真的有變化。' }
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
                { speaker: 'npc', text: '補給線恢復後，商店和市集才能合理增加庫存，防具也能跟上怪物區間。' }
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
                { speaker: 'npc', text: '南門修復後，冒險地圖的路標、巡線、回城安全感都應該跟著變。' }
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
                { speaker: 'npc', text: '我能把怪物、素材、賭場獎池和黑市暗號整理成玩家看得懂的線索。別問來源，問了就漲價。' }
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
                { speaker: 'npc', text: '黑市不是支線裝飾。它該賣那些正常路線不敢碰、但玩家會心動的東西。代價要晚一點才有意思。' }
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
                { speaker: 'npc', text: '真正的分歧只應該放在這種地方：它會改變你後面能買什麼、誰信你、結局是否留下陰影。' }
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
                { speaker: 'npc', text: '賭場不是任務櫃台。它要讓玩家想要票券、想抽獎、想知道那個 1% 到底能不能砸出來。' }
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
                { speaker: 'npc', text: '如果賭場要做長支線，債務、展示櫃、票券來源和獎池更新都要接在同一張帳上。' }
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
                { speaker: 'npc', text: '你看見了玻璃後面的東西。很好。玩家不該為了支線進賭場，玩家該為了想拿那些東西進賭場。' },
                { speaker: 'npc', text: '等你陷得夠深，我會給你一個選擇。那個選擇如果不能影響後續，我寧可不給。' }
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
                { speaker: 'npc', text: '微光可以做成前置路線，讓玩家先理解光明的節奏，但不能直接進化成光明。那要等真正的光副本。' }
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
                { speaker: 'npc', text: '塔還在，但現在不要替它取新名字，也不要替它塞新怪物。壞掉的門先鎖著，比假裝能開更誠實。' },
                { speaker: 'npc', text: '等光明副本與後期反制做完，再來談塔。否則玩家會被塔反手教育，然後教育我們的設計。' }
            ]
        },
        {
            id: 'warden_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '有些門不開，是因為鑰匙還沒做好。有些門不開，是因為門後面的東西還沒被設計好。' }
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
