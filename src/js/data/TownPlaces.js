/**
 * TownPlaces.js
 * Rebuilt town map data for the broken-town progression.
 *
 * The old town-place copy was replaced instead of patched around. This file is
 * the current source for town hotspots, residents, actions, and visible recovery
 * states.
 */

const townScene = id => `src/assets/images/art/scenes/town/places/${id}.webp`;
const townSceneFull = id => `src/assets/images/art/scenes/town/places-full/${id}.webp`;
const portrait = id => `src/assets/images/art/characters/portraits/${id}.webp`;

export const TownPlaceDatabase = [
    {
        id: 'crossroads',
        name: '裂痕廣場',
        icon: '#',
        tag: '城鎮中樞',
        mapClass: 'town-place-crossroads',
        cardImage: townScene('crossroads'),
        sceneImage: townSceneFull('crossroads'),
        scenePosition: '50% 56%',
        description: '廣場仍保留避難所的凌亂感。公告板、手札、難民火盆與巡邏路線都在這裡交會，玩家能直接看見城鎮是否真的恢復。',
        residents: [
            {
                npcId: 'village_elder',
                label: '村長',
                role: '危機錨點',
                portrait: portrait('village_elder'),
                position: { x: 30, y: 58 }
            },
            {
                npcId: 'town_scholar',
                label: '城鎮書記',
                role: '記錄與線索',
                portrait: portrait('town_scholar'),
                position: { x: 46, y: 50 }
            }
        ],
        actions: [
            {
                type: 'interaction',
                id: 'crossroads_notice_board',
                label: '查看公告板',
                shortLabel: '公告',
                icon: '!',
                imageId: 'notice_board',
                description: '公告板記錄委託、失蹤名單、路線警告與居民留下的短訊。',
                position: { x: 62, y: 61 }
            },
            {
                type: 'route',
                route: 'quest',
                label: '查看任務與手札',
                shortLabel: '任務',
                icon: '?',
                imageId: 'carved_stone_tablet',
                description: '旅人手札把主線、支線與城鎮變化串成可追蹤的記錄。',
                position: { x: 77, y: 70 }
            }
        ],
        states: [
            {
                flag: 'town.elder.first_warning',
                title: '村長點出第一個警訊',
                text: '村長把城外異變說得很短，像怕話說太滿會把人壓垮。廣場因此多了一層緊張。'
            },
            {
                flag: 'town.crossroads.notice_read',
                title: '公告板開始有人停留',
                text: '居民會在公告板前讀字，然後裝作只是路過。至少恐慌有了可以被釘住的位置。'
            },
            {
                flag: 'town.network.first_recovery_named',
                title: '恢復網路被命名',
                text: '書記把修路、找人、補給與鍛造都畫在同一張圖上，城鎮第一次像一個系統。'
            },
            {
                flag: 'town.trust.reputation_opened',
                title: '信任開始被記錄',
                text: '居民不再只問你殺了多少怪，而是開始問哪條路能走、誰能回家。'
            },
            {
                flag: 'town.refugees.northern_letters',
                title: '北境來信貼上牆角',
                text: '幾封濕掉的信被晾在火盆旁，難民們讀得很慢，像怕錯過每一個名字。'
            },
            {
                flag: 'town.refugees.unsent_reply_archived',
                title: '沒有寄出的回信被收好',
                text: '書記把回信夾進手札。它們還沒有目的地，但至少不再只是遺失物。'
            },
            {
                flag: 'town.refugees.soup_kitchen_warm',
                title: '最後一鍋湯留下熱氣',
                text: '火盆邊排起短短的隊伍。湯不稀奇，但每個人都假裝它很豪華。'
            },
            {
                flag: 'town.coast_refugee_lamp_lit',
                title: '海岸難民點起油燈',
                text: '一盞從海邊帶回來的燈被掛在廣場邊，提醒大家還有人從沉鐘那邊活著走回來。'
            }
        ]
    },
    {
        id: 'gate',
        name: '南門防線',
        icon: '>',
        tag: '城鎮邊界',
        mapClass: 'town-place-gate',
        cardImage: townScene('gate'),
        sceneImage: townSceneFull('gate'),
        scenePosition: '52% 58%',
        description: '南門是玩家第一次感到城鎮真的會失守的地方。木樁、旗影、補給箱與守衛輪值都會隨旗標改變。',
        residents: [
            {
                npcId: 'standard_bearer_frey',
                label: '掌旗者弗雷',
                role: '防線與記憶',
                portrait: portrait('standard_bearer_frey'),
                position: { x: 35, y: 61 }
            },
            {
                npcId: 'supply_captain',
                label: '補給隊長',
                role: '路線與庫存',
                portrait: portrait('supply_captain'),
                position: { x: 57, y: 59 }
            },
            {
                npcId: 'lamplighter_tavi',
                label: '點燈人塔薇',
                role: '夜路與微光',
                portrait: portrait('lamplighter_tavi'),
                position: { x: 73, y: 58 }
            }
        ],
        actions: [
            {
                type: 'route',
                route: 'adventure',
                label: '前往冒險地圖',
                shortLabel: '冒險',
                icon: '>',
                imageId: 'dirt_road',
                description: '南門外的路不一定安全，但每一次修復都會讓城鎮更敢往外呼吸。',
                position: { x: 72, y: 64 }
            }
        ],
        states: [
            {
                flag: 'town.gate.defense_problem_named',
                title: '防線問題被說清楚',
                text: '弗雷把缺口、輪值與撤退路線全標出來。這不是士氣演說，是活下去的清單。'
            },
            {
                flag: 'town.south_gate.guard_route_ready',
                title: '南門巡守路線穩定',
                text: '守衛開始按時換班，玩家離開城鎮時不再像是把所有人丟在身後。'
            },
            {
                flag: 'town.gate.broken_standard_raised',
                title: '破旗重新升起',
                text: '破旗沒有變新，只是重新被綁緊。它看起來不像勝利，比勝利更適合現在。'
            },
            {
                flag: 'town.gate.retreat_names_called',
                title: '旗影下的名單被念完',
                text: '弗雷把撤退那晚的名字一個一個念出來。守門的人都沉默地站直了。'
            },
            {
                flag: 'town.supply.first_route_open',
                title: '第一條補給路線打通',
                text: '幾只箱子被推進門內。數量不多，但商人看見箱子時眼神明顯亮了一點。'
            },
            {
                flag: 'town.supply.route_problem_named',
                title: '補給問題被釘在地圖上',
                text: '補給隊長把失聯路段標成紅線，語氣平得像在數硬幣。至少問題有了形狀。'
            },
            {
                flag: 'town.lamplighter.glimmer_route_named',
                title: '微光路線第一次被提起',
                text: '塔薇把小燈放在門邊，笑著說路不是變安全了，只是比較不會把人吞掉。'
            }
        ]
    },
    {
        id: 'market',
        name: '市集邊棚',
        icon: '$',
        tag: '補給與交易',
        mapClass: 'town-place-market',
        cardImage: townScene('market'),
        sceneImage: townSceneFull('market'),
        scenePosition: '50% 60%',
        description: '市集最能表現金幣與素材是否有價值。攤位從空棚、半開、補給進場到專門交易，應該隨故事慢慢變得可用。',
        residents: [
            {
                npcId: 'herbalist',
                label: '藥師',
                role: '照護與藥材',
                portrait: portrait('herbalist'),
                position: { x: 25, y: 61 }
            },
            {
                npcId: 'merchant',
                label: '商人',
                role: '庫存與路線',
                portrait: portrait('merchant'),
                position: { x: 54, y: 60 }
            },
            {
                npcId: 'tinker',
                label: '修補匠',
                role: '零件與小工具',
                portrait: portrait('tinker'),
                position: { x: 74, y: 66 }
            }
        ],
        actions: [
            {
                type: 'route',
                route: 'shop',
                label: '進入商店',
                shortLabel: '商店',
                icon: '$',
                imageId: 'merchant_wagon',
                description: '商店庫存應該跟路線、安全、補給與 NPC 狀態連動。',
                position: { x: 65, y: 48 }
            }
        ],
        states: [
            {
                flag: 'town.apothecary.problem_named',
                title: '藥棚缺貨原因被說出',
                text: '藥師不再只說沒有貨，而是指出哪條採藥路、哪種人手、哪個箱子出了問題。'
            },
            {
                flag: 'town.apothecary.stock_basic_potion',
                title: '基礎藥品重新上架',
                text: '架上多了幾瓶不漂亮但可靠的藥。藥師說它們至少不會在你最痛時講道理。'
            },
            {
                flag: 'town.apothecary.understands_thorn_trade',
                title: '藥師看懂荊棘交易',
                text: '她把荊棘商路的記號重新排開，終於分清楚哪些是藥材，哪些是陷阱。'
            },
            {
                flag: 'town.apothecary.remembers_lost_gatherer',
                title: '籃底的名字被記住',
                text: '藥籃被掛在棚柱旁。藥師嘴上說佔空間，卻沒有把它收進倉庫。'
            },
            {
                flag: 'town.supply.first_route_open',
                title: '補給箱進入市集',
                text: '攤位不再只賣希望，開始有繃帶、燈油、簡單材料與商人的小聲抱怨。'
            },
            {
                flag: 'market.rumor.material_index',
                title: '素材流向被記錄',
                text: '商人把素材來源寫成一張很會賺錢的圖，並堅稱那不是偷學書記。'
            },
            {
                flag: 'town.tinker.repair_logic_named',
                title: '修補邏輯被整理出來',
                text: '修補匠把能救的零件和該丟的廢鐵分開。她對廢鐵道歉，語氣相當真誠。'
            }
        ]
    },
    {
        id: 'forge',
        name: '冷爐鐵匠鋪',
        icon: '+',
        tag: '鍛造與藍圖',
        mapClass: 'town-place-forge',
        cardImage: townScene('forge'),
        sceneImage: townSceneFull('forge'),
        scenePosition: '50% 58%',
        description: '鐵匠鋪是故事獎勵和系統解鎖應該最直觀結合的地方。修好它，就應該真的打開修理、鍛造、藍圖與進階契約。',
        residents: [
            {
                npcId: 'blacksmith',
                label: '鐵匠',
                role: '鍛造與裝備成長',
                portrait: portrait('blacksmith'),
                position: { x: 34, y: 62 }
            },
            {
                npcId: 'old_miner_bran',
                label: '老礦工布蘭',
                role: '礦路與礦脈記憶',
                portrait: portrait('old_miner_bran'),
                position: { x: 58, y: 57 }
            }
        ],
        actions: [
            {
                type: 'route',
                route: 'forge',
                label: '使用鍛造',
                shortLabel: '鍛造',
                icon: '+',
                imageId: 'ore_vein',
                description: '鍛造服務應該隨任務逐步開啟，成為賭場與掉落之外的穩定成長路線。',
                position: { x: 70, y: 63 }
            }
        ],
        states: [
            {
                flag: 'town.forge.problem_named',
                title: '冷爐問題被確認',
                text: '鐵匠敲了敲爐壁，說問題不在火，而在沒人敢把火重新交給它。'
            },
            {
                flag: 'town.blacksmith.forge_open',
                title: '鐵匠鋪重新開爐',
                text: '火光回到砧台上。它不華麗，但玩家終於能把材料變成選擇。'
            },
            {
                flag: 'town.blacksmith.neelu_blueprint_named',
                title: '妮露的藍圖被提起',
                text: '鐵匠把一張舊圖紙壓在砧台下，像怕它被風吹走，也怕自己真的看懂。'
            },
            {
                flag: 'town.blacksmith.mithril_route_ready',
                title: '秘銀路線準備完成',
                text: '布蘭把礦路講得像老朋友的壞脾氣。鐵匠聽完，只說這次要帶好鎬。'
            },
            {
                flag: 'town.mine.route_problem_named',
                title: '礦路問題被點出',
                text: '老礦工指出塌方、濕氣與失蹤點。每個標記都像曾經有人站在那裡。'
            },
            {
                flag: 'town.forge.advanced_contracts_open',
                title: '進階鍛造契約開放',
                text: '牆上開始掛起契約板。它不保證成功，只保證你知道自己缺什麼。'
            }
        ]
    },
    {
        id: 'handbook',
        name: '手札書桌',
        icon: '?',
        tag: '線索與百科',
        mapClass: 'town-place-handbook',
        cardImage: townScene('handbook'),
        sceneImage: townSceneFull('handbook'),
        scenePosition: '50% 56%',
        description: '書桌與公告板負責把玩家做過的事變成世界記憶。這裡不只是百科入口，也是支線成果被城鎮吸收的地方。',
        residents: [
            {
                npcId: 'town_scholar',
                label: '城鎮書記',
                role: '記錄與怪物索引',
                portrait: portrait('town_scholar'),
                position: { x: 32, y: 58 }
            },
            {
                npcId: 'rumor_broker',
                label: '情報販子',
                role: '謠言與黑線索',
                portrait: portrait('rumor_broker'),
                position: { x: 62, y: 60 }
            }
        ],
        actions: [
            {
                type: 'route',
                route: 'encyclopedia',
                label: '查看百科',
                shortLabel: '百科',
                icon: '?',
                imageId: 'carved_stone_tablet',
                description: '百科應該反映玩家發現的怪物、物品、地點與來源。',
                position: { x: 76, y: 67 }
            },
            {
                type: 'achievement',
                id: 'scholar_achievements',
                label: '查看成就與記錄',
                shortLabel: '記錄',
                icon: '*',
                imageId: 'notice_board',
                description: '書記保存支線痕跡，讓玩家感覺做過的事沒有消失。',
                position: { x: 21, y: 42 }
            }
        ],
        states: [
            {
                flag: 'town.scholar.first_index_open',
                title: '第一份索引完成',
                text: '書記把怪物、地點與居民口供放在同一頁，終於不像一堆散亂紙片。'
            },
            {
                flag: 'town.scholar.records_lich_name',
                title: '巫妖名字被記錄',
                text: '墓園書籤被壓進索引。書記說名字很危險，但忘記名字更危險。'
            },
            {
                flag: 'town.scholar.julian_margin_read',
                title: '朱利安的邊註被讀懂',
                text: '邊註被重新抄寫，字跡比原稿整齊，內容卻讓整張桌子更冷。'
            },
            {
                flag: 'town.scholar.records_drowned_bell_rhythm',
                title: '沉鐘節奏被記下',
                text: '書桌旁多了一串敲擊記號。它看起來像樂譜，讀起來像失眠。'
            },
            {
                flag: 'town.notice_board.missing_workers_named',
                title: '失蹤工人的名字貼上公告板',
                text: '名字被公開後，公告板前安靜了很久。沒有人再叫他們失蹤者。'
            },
            {
                flag: 'town.notice_board.worker_marks_mapped',
                title: '工匠刻痕被標在地圖上',
                text: '刻痕連成路線，像一群人最後留下的求救，也像一份尚未完成的工程圖。'
            },
            {
                flag: 'town.rumor.elite_warning_open',
                title: '菁英怪警告開放',
                text: '情報販子把最危險的消息說得像閒聊。可惜每句閒聊都很有用。'
            },
            {
                flag: 'town.scholar.last_index_bound',
                title: '末頁索引被裝訂',
                text: '書記把新的頁碼壓平，像是正在替城鎮保留最後的證詞。'
            }
        ]
    },
    {
        id: 'alley',
        name: '背巷黑市',
        icon: '*',
        tag: '灰色交易',
        mapClass: 'town-place-alley',
        cardImage: townScene('alley'),
        sceneImage: townSceneFull('alley'),
        scenePosition: '52% 60%',
        description: '背巷不是單純隱藏商店，而是第三方來源。它可以提供稀有材料與捷徑，但必須帶著債、情報或未來代價。',
        residents: [
            {
                npcId: 'street_beggar',
                label: '街角乞者',
                role: '入口與暗號',
                portrait: portrait('street_beggar'),
                position: { x: 30, y: 65 }
            },
            {
                npcId: 'black_market',
                label: '黑市商',
                role: '禁貨與債務',
                portrait: portrait('black_market'),
                position: { x: 68, y: 62 }
            }
        ],
        actions: [
            {
                type: 'interaction',
                id: 'merchant_ancient_coin',
                label: '查看舊幣暗號',
                shortLabel: '舊幣',
                icon: '*',
                imageId: 'hidden_stash_mound',
                description: '黑市入口應該由線索、債務或特殊材料路線慢慢打開。',
                position: { x: 74, y: 70 }
            }
        ],
        states: [
            {
                flag: 'secretShopUnlocked',
                title: '秘密交易入口開放',
                text: '背巷的門沒有變亮，只是開始有人承認它是一扇門。'
            },
            {
                flag: 'town.black_market.rules_explained',
                title: '黑市規則說明完畢',
                text: '黑市商把規則講得很禮貌。禮貌到你懷疑每個字都能算利息。'
            },
            {
                flag: 'town.black_market.ledger_tags_read',
                title: '黑市標籤被讀懂',
                text: '收藏標籤不像價格，更像來源。越看越能理解為什麼有人不想它被看見。'
            },
            {
                flag: 'town.black_market.debt_marked',
                title: '債務記號留下',
                text: '背巷帳冊多了一筆沒有期限的記錄。它暫時安靜，但不像會忘。'
            }
        ]
    },
    {
        id: 'casino',
        name: '玻璃櫃賭場',
        icon: '$',
        tag: '票券與誘惑',
        mapClass: 'town-place-casino',
        cardImage: townScene('casino'),
        sceneImage: townSceneFull('casino'),
        scenePosition: '50% 58%',
        description: '賭場應該先用展示櫃與獎池讓玩家想要資源，再把玩家的慾望牽進老闆支線。',
        residents: [
            {
                npcId: 'casino_dealer',
                label: '荷官',
                role: '遊戲與票券',
                portrait: portrait('casino_dealer'),
                position: { x: 34, y: 61 }
            },
            {
                npcId: 'accountant_marlo',
                label: '帳房馬洛',
                role: '賬目與機率',
                portrait: portrait('accountant_marlo'),
                position: { x: 59, y: 58 }
            },
            {
                npcId: 'casino_owner',
                label: '賭場老闆',
                role: '展示櫃與契約',
                portrait: portrait('casino_owner'),
                position: { x: 78, y: 60 }
            }
        ],
        actions: [
            {
                type: 'route',
                route: 'casino',
                label: '進入賭場',
                shortLabel: '賭場',
                icon: '$',
                imageId: 'random_event_spark',
                description: '賭場流程應該接上票券、獎池、展示櫃、機率表與老闆支線。',
                position: { x: 64, y: 70 }
            }
        ],
        states: [
            {
                flag: 'town.casino.showcase_seen',
                title: '展示櫃吸住玩家視線',
                text: '玻璃後的物品不是裝飾。它們像是在說，金幣和票券終於有了真正目的。'
            },
            {
                flag: 'town.casino.owner_route_seeded',
                title: '老闆注意到展示櫃前的人',
                text: '老闆沒有靠近，只是換了個站姿。你知道自己已經被放進他的帳目裡。'
            },
            {
                flag: 'town.casino.false_odds_exposed',
                title: '假機率被拆穿',
                text: '馬洛把帳冊合上，賭場短暫安靜。那種安靜比輸光還貴。'
            },
            {
                flag: 'town.casino.relief_fund_counted',
                title: '最後一夜的籌碼被清點',
                text: '救濟金與籌碼被排在同一張桌上。每個人都看見了，卻不是每個人都敢說話。'
            },
            {
                flag: 'town.casino.dark_contract_sealed',
                title: '暗色契約完成',
                text: '契約沒有火焰、沒有雷聲，只有老闆把筆收回去的聲音。'
            }
        ]
    },
    {
        id: 'tower',
        name: '封鎖塔影',
        icon: '!',
        tag: '暫緩內容',
        mapClass: 'town-place-tower',
        cardImage: townScene('tower'),
        sceneImage: townSceneFull('tower'),
        scenePosition: '50% 56%',
        description: '塔仍在城鎮邊緣投下陰影，但塔重做暫緩。此處只保留現有入口與世界存在感，不新增塔怪物、裝備或獎勵。',
        residents: [
            {
                npcId: 'tower_warden',
                label: '守塔人',
                role: '暫緩的警告',
                portrait: portrait('tower_warden'),
                position: { x: 48, y: 58 }
            }
        ],
        actions: [
            {
                type: 'route',
                route: 'tower',
                label: '查看塔入口',
                shortLabel: '塔',
                icon: '!',
                imageId: 'charred_obelisk_mini',
                description: '入口保留，但新的塔內容暫緩，等後續重做。',
                position: { x: 65, y: 64 }
            }
        ],
        states: []
    }
];

export function getTownPlaces() {
    return TownPlaceDatabase;
}

export function getTownPlace(placeId) {
    return TownPlaceDatabase.find(place => place.id === placeId) || null;
}
