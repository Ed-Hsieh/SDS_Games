/**
 * TownPlaces.js
 * Screenplay-driven town locations. Visibility conditions live with the place,
 * resident, action, or state they control; TownStateResolver evaluates them.
 */

const townScene = id => `src/assets/images/art/scenes/town/locations/${id}.webp`;
const portrait = id => `src/assets/images/art/characters/portraits/${id}.webp`;
const sceneComplete = sceneId => ({ sceneComplete: sceneId });

export const TownPlaceDatabase = [
    {
        id: 'crossroads',
        name: '裂痕廣場',
        icon: '#',
        tag: '城鎮中樞',
        mapClass: 'town-place-crossroads',
        cardImage: townScene('crossroads'),
        sceneImage: townScene('crossroads'),
        scenePosition: '50% 56%',
        description: '火盆燒得很低，泡過雨的公告紙貼在裂牆旁。每次有人從路上回來，廣場都先安靜一瞬。',
        when: { always: true },
        residents: [
            {
                npcId: 'village_elder',
                label: '村長',
                role: '危機決策與遠征舊事',
                portrait: portrait('village_elder'),
                position: { x: 31, y: 58 },
                when: {
                    not: {
                        all: [
                            { run: 1 },
                            sceneComplete('ch5_s10_before_dawn')
                        ]
                    }
                }
            }
        ],
        actions: [
            {
                type: 'interaction',
                id: 'crossroads_notice_board',
                label: '查看公告板',
                shortLabel: '公告',
                icon: '#',
                imageId: 'notice_board',
                description: '失聯道路、回城名字與尚未處理的公共問題都留在這裡。',
                position: { x: 67, y: 48 },
                when: sceneComplete('ch1_s03_broken_crossroads')
            }
        ],
        states: [
            {
                id: 'first_report',
                when: sceneComplete('ch1_s03_broken_crossroads'),
                title: '南路的斷裂有了名字',
                text: '村長沒有把黑根與失聯寫成勝利口號，只把下一個需要確認的人與地方圈出來。'
            },
            {
                id: 'names_returned',
                when: sceneComplete('ch2_s07_names_return_to_town'),
                title: '失蹤者不再只是一個數字',
                text: '伊萊把確認、未確認與死亡分開記錄。廣場第一次承認不知道也是一種誠實。'
            },
            {
                id: 'elder_absent',
                when: {
                    all: [
                        { run: 1 },
                        sceneComplete('ch6_s02_scar_aftermath')
                    ]
                },
                title: '椅子沒有被收走',
                text: '村長的椅子仍在原位。伊萊沒有讓任何人把它移去紀念牆，因為事情還沒有被寫完。'
            },
            {
                id: 'true_return',
                when: {
                    all: [
                        { run: 2 },
                        sceneComplete('ch7_s08_return_to_town')
                    ]
                },
                title: '這次沒有人替所有人負責',
                text: '村長與伊萊一起整理封痕紀錄。廣場仍然破舊，卻不再靠一個人扛住所有決定。'
            }
        ]
    },
    {
        id: 'mia_workroom',
        name: '米婭的藥草工作室',
        icon: '+',
        tag: '研究與人際',
        mapClass: 'town-place-mia-workroom',
        cardImage: townScene('mia_workroom'),
        sceneImage: townScene('mia_workroom'),
        scenePosition: '42% 58%',
        description: '瓶架、母親留下的工具與尚未整理的藥草都擠在一間小屋裡。這裡處理配方與病歷，不進行交易。',
        when: sceneComplete('ch1_s01_road_collapse'),
        residents: [
            {
                npcId: 'herbalist',
                label: '米婭',
                role: '藥師與配方研究者',
                portrait: portrait('herbalist'),
                position: { x: 38, y: 60 },
                when: {
                    not: {
                        all: [
                            { run: 1 },
                            sceneComplete('ch5_s06_mia_operation')
                        ]
                    }
                }
            }
        ],
        actions: [],
        states: [
            {
                id: 'opening_care',
                when: sceneComplete('ch1_s02_wake_under_bitter_bottles'),
                title: '苦瓶底下的人醒了',
                text: '米婭先把水放到手能碰到的位置，再阻止剛醒的人立刻起身。'
            },
            {
                id: 'last_page',
                when: {
                    all: [
                        { run: 1 },
                        sceneComplete('ch5_s06_mia_operation')
                    ]
                },
                title: '最後一頁',
                text: '冷掉的水仍在桌邊。城鎮人際紀錄最後只留下一句：「醒來後先給他水。別讓他立刻起身。」'
            },
            {
                id: 'open_window',
                when: {
                    all: [
                        { run: 2 },
                        sceneComplete('ch7_s08_return_to_town')
                    ]
                },
                title: '窗戶終於打開',
                text: '米婭讓別人幫忙重排工作桌。風吹進母親留下的房間，沒有任何人因此消失。'
            }
        ]
    },
    {
        id: 'handbook',
        name: '檔案室',
        icon: '?',
        tag: '手札、百科與證據',
        mapClass: 'town-place-handbook',
        cardImage: townScene('handbook'),
        sceneImage: townScene('handbook'),
        scenePosition: '50% 56%',
        description: '伊萊把濕紙、樣本、路線與不知道如何分類的人命放在同一張桌上，直到上下文重新接回來。',
        when: sceneComplete('ch1_s03_broken_crossroads'),
        residents: [
            {
                npcId: 'town_scholar',
                label: '伊萊',
                role: '城鎮書記',
                portrait: portrait('town_scholar'),
                position: { x: 35, y: 58 },
                when: { always: true }
            }
        ],
        actions: [
            {
                type: 'route',
                route: 'encyclopedia',
                label: '查看百科',
                shortLabel: '百科',
                icon: '?',
                imageId: 'encyclopedia_tome',
                description: '已確認的怪物、素材與地點會按來源寫入。',
                position: { x: 72, y: 66 },
                when: sceneComplete('ch1_s04_elder_to_scholar')
            },
            {
                type: 'achievement',
                id: 'scholar_achievements',
                label: '查看成就與記憶',
                shortLabel: '記憶',
                icon: '*',
                imageId: 'notice_board',
                description: '第一輪結束後，無法跨周目攜帶的物件會退去，只留下成就記憶。',
                position: { x: 22, y: 43 },
                when: { flag: 'story.secondRunUnlocked' }
            }
        ],
        states: [
            {
                id: 'first_index',
                when: sceneComplete('ch1_s04_elder_to_scholar'),
                title: '第一份索引保留了未知',
                text: '伊萊沒有替證據補上漂亮答案。來源、範圍與不知道的部分被分開寫下。'
            },
            {
                id: 'expedition_reopened',
                when: sceneComplete('ch5_s08_expedition_list'),
                title: '二十年前的名單重新攤開',
                text: '遠征不再只剩英雄或失敗兩種說法。誰抵達哪裡、碰了什麼、又漏看了什麼，都重新有了位置。'
            },
            {
                id: 'honest_archive',
                when: {
                    all: [
                        { run: 2 },
                        sceneComplete('ch7_s08_return_to_town')
                    ]
                },
                title: '紀錄變得更麻煩，也更完整',
                text: '伊萊寫下這次沒有人替所有人負責，並把不確定之處原封保留。'
            }
        ]
    },
    {
        id: 'gate',
        name: '南門殘階',
        icon: '>',
        tag: '出發與回城',
        mapClass: 'town-place-gate',
        cardImage: townScene('gate'),
        sceneImage: townScene('gate'),
        scenePosition: '50% 55%',
        description: '破旗與低燈分別守著前後方向。這裡不保證路安全，只確認出去與回來的人仍能彼此看見。',
        when: sceneComplete('ch1_s04_elder_to_scholar'),
        residents: [
            {
                npcId: 'standard_bearer_frey',
                label: '芙蕾',
                role: '巡線持旗者',
                portrait: portrait('standard_bearer_frey'),
                position: { x: 31, y: 58 },
                when: {
                    not: {
                        all: [
                            { run: 1 },
                            sceneComplete('ch4_s06_flag_returns')
                        ]
                    }
                }
            },
            {
                npcId: 'lamplighter_tavi',
                label: '塔維',
                role: '巡線點燈人',
                portrait: portrait('lamplighter_tavi'),
                position: { x: 66, y: 59 },
                when: sceneComplete('ch1_s05_south_gate_introduction')
            }
        ],
        actions: [
            {
                type: 'route',
                route: 'adventure',
                label: '離開城鎮',
                shortLabel: '出發',
                icon: '>',
                imageId: 'road_sign',
                description: '進入目前章節的手工區域地圖。',
                position: { x: 80, y: 69 },
                when: sceneComplete('ch1_s05_south_gate_introduction')
            }
        ],
        states: [
            {
                id: 'first_departure',
                when: sceneComplete('ch1_s05_south_gate_introduction'),
                title: '旗在前，燈在後',
                text: '芙蕾負責讓人看見方向；塔維把燈留在回頭時仍能找到的位置。'
            },
            {
                id: 'flag_did_not_return',
                when: {
                    all: [
                        { run: 1 },
                        sceneComplete('ch4_s06_flag_returns')
                    ]
                },
                title: '旗沒有回來',
                text: '塔維仍按時點亮後燈。門階前的人不再問前旗什麼時候出現。'
            },
            {
                id: 'two_markers',
                when: {
                    all: [
                        { run: 2 },
                        sceneComplete('ch4_s06_flag_returns')
                    ]
                },
                title: '兩個標記都留在位置上',
                text: '芙蕾沒有替塔維回頭，塔維也沒有為證明勇敢而離開後標。'
            }
        ]
    },
    {
        id: 'forge',
        name: '冷爐鐵匠鋪',
        icon: '+',
        tag: '修復與鍛造',
        mapClass: 'town-place-forge',
        cardImage: townScene('forge'),
        sceneImage: townScene('forge'),
        scenePosition: '50% 58%',
        description: '爐子先替鍋、門閂、擔架扣與回城工具生火，武器排在能讓人回來的東西後面。',
        when: sceneComplete('ch1_s07_silver_snare'),
        residents: [
            {
                npcId: 'blacksmith',
                label: '鐵匠',
                role: '修復與鍛造',
                portrait: portrait('blacksmith'),
                position: { x: 37, y: 62 },
                when: { always: true }
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
                description: '爐火恢復後，裝備修復與章節內已授權的製作才會開放。',
                position: { x: 72, y: 64 },
                when: sceneComplete('ch1_s08_cold_forge_smoke')
            }
        ],
        states: [
            {
                id: 'fire_returns',
                when: sceneComplete('ch1_s08_cold_forge_smoke'),
                title: '第一爐先修回城的東西',
                text: '風箱重新咬住火。最先進爐的不是新劍，而是鍋底、門鉸與壞掉的扣件。'
            },
            {
                id: 'civilian_first',
                when: sceneComplete('ch4_s02_fourfold_countergear'),
                title: '爐子不是只替會打架的人燒',
                text: '撤離板、燈架與擔架扣排在武器前。鐵匠不再讓急迫等同於殺傷力。'
            },
            {
                id: 'ordinary_queue',
                when: {
                    all: [
                        { run: 2 },
                        sceneComplete('ch7_s08_return_to_town')
                    ]
                },
                title: '漏水的鍋重新排回第一位',
                text: '能再次為普通麻煩排隊，比一把傳說武器更像真正的勝利。'
            }
        ]
    },
    {
        id: 'market',
        name: '市集邊棚',
        icon: '$',
        tag: '公開交易',
        mapClass: 'town-place-market',
        cardImage: townScene('market'),
        sceneImage: townScene('market'),
        scenePosition: '50% 60%',
        description: '公共交易、基礎藥品與補給都在邊棚完成。米婭只研究配方並授權品項，不持有價格、庫存或櫃台。',
        when: sceneComplete('ch1_s11_roads_breathe_again'),
        residents: [
            {
                npcId: 'merchant',
                label: '商人',
                role: '公開庫存與交易',
                portrait: portrait('merchant'),
                position: { x: 48, y: 60 },
                when: { always: true }
            }
        ],
        actions: [
            {
                type: 'route',
                route: 'shop',
                label: '查看公開市集',
                shortLabel: '交易',
                icon: '$',
                imageId: 'merchant_wagon',
                description: '只顯示由道路、研究與城鎮狀態實際支持的庫存。',
                position: { x: 72, y: 67 },
                when: sceneComplete('ch2_s07_names_return_to_town')
            }
        ],
        states: [
            {
                id: 'empty_crates',
                when: sceneComplete('ch2_s01_empty_crates'),
                title: '空箱先證明路真的斷了',
                text: '貨印與最後搬運位置被攤在棚下。商人第一次有了可以追查、而不是只能抱怨的缺口。'
            },
            {
                id: 'public_medicine',
                when: sceneComplete('ch2_s07_names_return_to_town'),
                title: '藥品回到公開貨架',
                text: '米婭核對配方批次，商人負責價格與數量。基礎醫藥不會因她的個人命運消失。'
            }
        ]
    },
    {
        id: 'casino',
        name: '玻璃櫃賭場',
        icon: '$',
        tag: '票券、誘惑與契約',
        mapClass: 'town-place-casino',
        cardImage: townScene('casino'),
        sceneImage: townScene('casino'),
        scenePosition: '50% 58%',
        description: '展示櫃先把想要的東西放到眼前，賭桌再把每個人的缺口換算成一場自願的下注。',
        when: { minChapter: 3 },
        residents: [
            {
                npcId: 'casino_dealer',
                label: '洛恩',
                role: '荷官',
                portrait: portrait('casino_dealer'),
                position: { x: 35, y: 61 },
                when: { always: true }
            },
            {
                npcId: 'casino_owner',
                label: '維斯珀',
                role: '賭場主人',
                portrait: portrait('casino_owner'),
                position: { x: 75, y: 59 },
                when: { sceneIncomplete: 'ch6_s07_house_changes_seats' }
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
                description: '公開票券桌與展示櫃共用同一個入口；私人抵押只屬維斯珀主線。',
                position: { x: 64, y: 70 },
                when: sceneComplete('ch3_s04_showcase_glass')
            }
        ],
        states: [
            {
                id: 'showcase',
                when: sceneComplete('ch3_s04_showcase_glass'),
                title: '展示櫃讓資源有了慾望',
                text: '維斯珀不逼任何人下注。他只把每個人真正想要的東西放到桌上。'
            },
            {
                id: 'vesper_escaped',
                when: {
                    all: [
                        { run: 1 },
                        sceneComplete('ch6_s07_house_changes_seats')
                    ]
                },
                title: '主人席空了',
                text: '洛恩留下灌鉛骰子作為作弊證據。它還不能讓契約反噬，只證明維斯珀從來沒有靠運氣贏。'
            },
            {
                id: 'transparent_tables',
                when: {
                    all: [
                        { run: 2 },
                        sceneComplete('ch6_s07_house_changes_seats')
                    ]
                },
                title: '每張桌都必須寫出機率',
                text: '維斯珀被自己的契約收走。洛恩只能在監督下清帳，不能取得主人席、契約權限或所有權。'
            }
        ]
    },
    {
        id: 'alley',
        name: '背巷黑市',
        icon: '*',
        tag: '第三方來源與代價',
        mapClass: 'town-place-alley',
        cardImage: townScene('alley'),
        sceneImage: townScene('alley'),
        scenePosition: '52% 60%',
        description: '背巷提供公開市場不願承擔的來源、情報與代價。它不替任何人證明交易值得。',
        when: sceneComplete('ch3_s04_showcase_glass'),
        residents: [
            {
                npcId: 'street_beggar',
                label: '乞丐',
                role: '尋找回音的人',
                portrait: portrait('street_beggar'),
                position: { x: 29, y: 65 },
                when: {
                    all: [
                        sceneComplete('ch1_s03_broken_crossroads'),
                        { sceneIncomplete: 'ch6_s08_brush_past_or_invitation' }
                    ]
                }
            },
            {
                npcId: 'black_market',
                label: '黑市商人',
                role: '禁貨與空白抵契來源',
                portrait: portrait('black_market'),
                position: { x: 69, y: 62 },
                when: sceneComplete('ch3_s05_blank_creditor_trace')
            }
        ],
        actions: [],
        states: [
            {
                id: 'blank_contract',
                when: sceneComplete('ch3_s05_blank_creditor_trace'),
                title: '空白抵契不是黑市的神話',
                text: '黑市只承認曾把一張來歷不明的空白抵契賣給維斯珀；拿到錢後，它不再保有第二張。'
            },
            {
                id: 'ailo_gone',
                when: sceneComplete('ch6_s08_brush_past_or_invitation'),
                title: '街角少了一個沒人聽懂的人',
                text: '沒有人知道艾洛去了哪裡。第一輪只少了哨子與一個身影；第二輪則是兩個人一起離開。'
            }
        ]
    }
];

export function getTownPlaces() {
    return TownPlaceDatabase;
}

export function getTownPlace(placeId) {
    return TownPlaceDatabase.find(place => place.id === placeId) || null;
}
