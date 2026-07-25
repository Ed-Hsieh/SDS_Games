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
        displayName: '裂痕廣場',
        icon: '#',
        tag: '城鎮中樞',
        displayTag: '城鎮中樞',
        mapClass: 'town-place-crossroads',
        cardImage: townScene('crossroads-broken'),
        sceneImage: townScene('crossroads-broken'),
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
            },
            {
                npcId: 'street_beggar',
                label: '乞丐',
                role: '看著錯誤方向的人',
                portrait: portrait('street_beggar'),
                position: { x: 69, y: 61 },
                when: {
                    all: [
                        sceneComplete('ch1_s10_forest_guardian'),
                        { flag: 'story.ch1.closing.forge_complete' },
                        { sceneIncomplete: 'ch1_s11_roads_breathe_again' }
                    ]
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
                text: '村長聽完南路的情況，把黑根出現的位置和失聯者最後經過的地方圈在圖上。'
            },
            {
                id: 'first_recovery',
                when: sceneComplete('ch1_s11_roads_breathe_again'),
                sceneImage: townScene('crossroads-recovery-1'),
                title: '路上重新有了回聲',
                text: '鐵匠鋪升起一線煙。空著的邊棚旁多了兩箱貨，還遠遠稱不上熱鬧。'
            },
            {
                id: 'names_returned',
                when: sceneComplete('ch2_s07_names_return_to_town'),
                title: '失蹤者有了確切去向',
                text: '伊萊把名單分成已確認、仍失聯與死亡三欄，沒有消息的人仍留著空位。'
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
                text: '村長的椅子還留在原位。伊萊每天照常把新的回報放在桌上。'
            },
            {
                id: 'true_return',
                when: {
                    all: [
                        { run: 2 },
                        sceneComplete('ch7_s08_return_to_town')
                    ]
                },
                title: '廣場重新有人商量事情',
                text: '村長和伊萊一起整理封痕紀錄，巡防與撤離的決定也開始交給更多人討論。'
            }
        ]
    },
    {
        id: 'mia_workroom',
        name: '米婭的藥草工作室',
        displayName: '藥草工作室',
        icon: '+',
        tag: '研究與人際',
        displayTag: '藥草研究',
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
                title: '醒來後先喝水',
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
                text: '米婭請人幫忙重排工作桌，也把一直關著的窗戶打開了。'
            }
        ]
    },
    {
        id: 'handbook',
        name: '檔案室',
        displayName: '檔案室',
        icon: '?',
        tag: '手札、百科與證據',
        displayTag: '手札百科',
        mapClass: 'town-place-handbook',
        cardImage: townScene('civic-room-working'),
        sceneImage: townScene('civic-room-working'),
        scenePosition: '50% 56%',
        description: '伊萊把濕紙、樣本和舊路線分開攤在桌上，一張一張核對日期與來源。',
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
                description: '那些無法裝進背包的經歷，仍會在下一次翻閱時留下痕跡。',
                position: { x: 22, y: 43 },
                when: { flag: 'story.secondRunUnlocked' }
            }
        ],
        states: [
            {
                id: 'first_index',
                when: sceneComplete('ch1_s04_elder_to_scholar'),
                title: '第一份索引整理好了',
                text: '伊萊把證據的來源和範圍分開記錄，沒有查清楚的地方仍標著未知。'
            },
            {
                id: 'expedition_reopened',
                when: sceneComplete('ch5_s08_expedition_list'),
                title: '二十年前的名單重新攤開',
                text: '伊萊在舊名單旁補上每個人抵達的位置、接觸過的東西，以及當年漏掉的紀錄。'
            },
            {
                id: 'honest_archive',
                when: {
                    all: [
                        { run: 2 },
                        sceneComplete('ch7_s08_return_to_town')
                    ]
                },
                title: '紀錄多了幾頁',
                text: '伊萊保留所有人的回報。彼此說法不同的地方，他沒有擅自合成一個答案。'
            }
        ]
    },
    {
        id: 'gate',
        name: '南門殘階',
        displayName: '南門殘階',
        icon: '>',
        tag: '出發與回城',
        displayTag: '城鎮出口',
        mapClass: 'town-place-gate',
        cardImage: townScene('gate-broken'),
        sceneImage: townScene('gate-broken'),
        scenePosition: '50% 55%',
        description: '南門掛著巡路的旗，門後留著回程燈。出城與回來的人都要在這裡登記。',
        when: sceneComplete('ch1_s01_road_collapse'),
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
                type: 'interaction',
                id: 'tavi_lamp_clasps',
                label: '整理燈罩扣',
                shortLabel: '扣件',
                icon: '+',
                imageId: 'road_sign',
                description: '三組尺寸不同的扣件被混在南門工具箱裡。',
                position: { x: 55, y: 72 },
                when: {
                    all: [
                        { flag: 'quest.lamp_glass_for_every_door.accepted' },
                        { not: { flag: 'quest.lamp_glass_for_every_door.finished' } }
                    ]
                }
            },
            {
                type: 'route',
                route: 'adventure',
                label: '離開城鎮',
                shortLabel: '出發',
                icon: '>',
                imageId: 'road_sign',
                description: '穿過南門，沿已經確認的道路繼續調查。',
                position: { x: 80, y: 69 },
                when: sceneComplete('ch1_s05_south_gate_introduction')
            }
        ],
        states: [
            {
                id: 'first_departure',
                when: sceneComplete('ch1_s05_south_gate_introduction'),
                title: '旗在前，燈在後',
                text: '芙蕾在門外標出安全方向，塔維則把回程燈固定在門內。'
            },
            {
                id: 'working_gate',
                when: sceneComplete('ch2_s08_shadow_at_the_checkpoint'),
                sceneImage: townScene('gate-working'),
                title: '門上的工作沒有停',
                text: '補過的門板重新承住巡防交接。旗與燈仍在各自的位置上。'
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
        displayName: '冷爐鐵匠鋪',
        icon: '+',
        tag: '修復與鍛造',
        displayTag: '修復鍛造',
        mapClass: 'town-place-forge',
        cardImage: townScene('forge-cold'),
        sceneImage: townScene('forge-cold'),
        scenePosition: '50% 58%',
        description: '鐵匠先修鍋子、門閂、擔架扣和回城工具，武器得等前面的活做完。',
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
                type: 'interaction',
                id: 'blacksmith_pot_lid',
                label: '檢查凹陷鍋蓋',
                shortLabel: '鍋蓋',
                icon: '+',
                imageId: 'ore_vein',
                description: '先辨認落石撞擊順序，再決定回火與敲擊位置。',
                position: { x: 58, y: 71 },
                when: {
                    all: [
                        { flag: 'quest.pot_lid_is_not_a_shield.accepted' },
                        { not: { flag: 'quest.pot_lid_is_not_a_shield.finished' } }
                    ]
                }
            },
            {
                type: 'route',
                route: 'forge',
                label: '使用鍛造',
                shortLabel: '鍛造',
                icon: '+',
                imageId: 'ore_vein',
                description: '爐火恢復後，鐵匠才能修理裝備，並製作已經取得圖紙的器物。',
                position: { x: 72, y: 64 },
                when: sceneComplete('ch1_s08_cold_forge_smoke')
            }
        ],
        states: [
            {
                id: 'fire_returns',
                when: sceneComplete('ch1_s08_cold_forge_smoke'),
                sceneImage: townScene('forge'),
                title: '第一爐先修回城的東西',
                text: '爐火重新升起來。鐵匠先把鍋底、門鉸和壞掉的扣件放進爐裡。'
            },
            {
                id: 'civilian_first',
                when: sceneComplete('ch4_s02_caravan_rear_missing'),
                title: '撤離工具排在武器前面',
                text: '撤離板、燈架和擔架扣先送進工坊，武器只能在後面排隊。'
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
                text: '工坊門口又排起日常修繕，最前面是一口漏水的鍋。'
            }
        ]
    },
    {
        id: 'market',
        name: '市集邊棚',
        displayName: '市集邊棚',
        icon: '$',
        tag: '公開交易',
        displayTag: '公開交易',
        mapClass: 'town-place-market',
        cardImage: townScene('market'),
        sceneImage: townScene('market'),
        scenePosition: '50% 60%',
        description: '基礎藥品和補給都在邊棚交易。米婭負責確認配方，商人負責價格和庫存。',
        when: sceneComplete('ch1_s11_roads_breathe_again'),
        residents: [
            {
                npcId: 'merchant',
                label: '商人',
                role: '公開庫存與交易',
                portrait: portrait('merchant'),
                position: { x: 48, y: 60 },
                when: sceneComplete('ch3_s09_temptation_and_orders')
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
                when: sceneComplete('ch3_s09_temptation_and_orders')
            }
        ],
        states: [
            {
                id: 'empty_crates',
                when: sceneComplete('ch2_s01_empty_crates'),
                sceneImage: townScene('market-closed'),
                title: '邊棚只剩空箱',
                text: '巡線的人拖回幾只空箱。貨印和送貨者姓名先交給伊萊核對，攤位仍沒有人經營。'
            },
            {
                id: 'medicine_authorized',
                when: sceneComplete('ch2_s07_names_return_to_town'),
                sceneImage: townScene('market-closed'),
                title: '配方已核對，貨架仍空著',
                text: '米婭整理好能公開調配的基礎藥品，斷路另一端的貨與商人還沒有回來。'
            },
            {
                id: 'caravan_returns',
                when: sceneComplete('ch3_s09_temptation_and_orders'),
                sceneImage: townScene('market-sparse'),
                title: '商隊回到邊棚',
                text: '返鄉商人重新掛起貨牌，外來商販也帶來第一批補給。米婭核過的藥品終於能擺上公開貨架。'
            }
        ]
    },
    {
        id: 'casino',
        name: '玻璃櫃賭場',
        displayName: '玻璃櫃賭場',
        icon: '$',
        tag: '票券、誘惑與契約',
        displayTag: '票券契約',
        mapClass: 'town-place-casino',
        cardImage: townScene('casino'),
        sceneImage: townScene('casino'),
        scenePosition: '50% 58%',
        description: '展示櫃擺著獎品，賭桌收票券與籌碼。維斯珀總能看出客人最想拿走哪一件。',
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
                description: '公開票券桌與展示櫃共用同一個入口；更深處的私人桌只接受維斯珀親自邀請。',
                position: { x: 64, y: 70 },
                when: sceneComplete('ch3_s04_showcase_glass')
            }
        ],
        states: [
            {
                id: 'showcase',
                when: sceneComplete('ch3_s04_showcase_glass'),
                title: '展示櫃換了新獎品',
                text: '維斯珀把客人最想要的東西放進展示櫃，再等他們自己走向賭桌。'
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
        displayName: '背巷黑市',
        icon: '*',
        tag: '第三方來源與代價',
        displayTag: '黑市交易',
        mapClass: 'town-place-alley',
        cardImage: townScene('alley'),
        sceneImage: townScene('alley'),
        scenePosition: '52% 60%',
        description: '公開市場不收的貨和不願留下名字的消息，都有人帶到這條背巷談。',
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
                title: '黑市賣過一張空白抵契',
                text: '黑市只承認曾把一張來歷不明的空白抵契賣給維斯珀；拿到錢後，它不再保有第二張。'
            },
            {
                id: 'ailo_gone',
                when: sceneComplete('ch6_s08_brush_past_or_invitation'),
                title: '艾洛離開了街角',
                text: '沒有人知道艾洛往哪裡走。原本坐人的地方只剩幾張被風吹動的紙。'
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

export function getTownPlaceDisplay(place = {}) {
    const fullName = place.name || '未命名場所';
    const fullTag = place.tag || '場所';
    return {
        name: place.displayName || fullName,
        tag: place.displayTag || fullTag,
        fullName,
        fullTag
    };
}

export const TownSceneTrigger = Object.freeze({
    NPC_INTERACT: 'npc_interact',
    PLACE_INTERACT: 'place_interact',
    TOWN_ARRIVAL: 'town_arrival',
    SCENE_CONTINUE: 'scene_continue'
});

function townBinding(sceneId, placeId, trigger, options = {}) {
    return Object.freeze({
        sceneId,
        placeId,
        trigger,
        actorId: options.actorId || null,
        targetId: options.targetId || null,
        label: options.label || null,
        shortLabel: options.shortLabel || null,
        icon: options.icon || null,
        imageId: options.imageId || null,
        description: options.description || null,
        position: options.position ? Object.freeze({ ...options.position }) : null,
        allowedArrivalReasons: Object.freeze(options.allowedArrivalReasons || [])
    });
}

/**
 * Canonical town-side story triggers.
 * Objective hints provide copy only; they must not redefine these routes.
 */
export const TownSceneBindings = Object.freeze([
    townBinding('ch1_s02_wake_under_bitter_bottles', 'mia_workroom', TownSceneTrigger.NPC_INTERACT, { actorId: 'herbalist' }),
    townBinding('ch1_s03_broken_crossroads', 'crossroads', TownSceneTrigger.NPC_INTERACT, { actorId: 'village_elder' }),
    townBinding('ch1_s04_elder_to_scholar', 'handbook', TownSceneTrigger.NPC_INTERACT, { actorId: 'town_scholar' }),
    townBinding('ch1_s05_south_gate_introduction', 'gate', TownSceneTrigger.NPC_INTERACT, { actorId: 'standard_bearer_frey' }),
    townBinding('ch1_s08_cold_forge_smoke', 'forge', TownSceneTrigger.NPC_INTERACT, { actorId: 'blacksmith' }),
    townBinding('ch1_s11_roads_breathe_again', 'gate', TownSceneTrigger.NPC_INTERACT, { actorId: 'standard_bearer_frey' }),

    townBinding('ch2_s01_empty_crates', 'market', TownSceneTrigger.PLACE_INTERACT, {
        targetId: 'empty_crates',
        label: '查看空箱',
        shortLabel: '空箱',
        icon: '□',
        description: '市場只剩幾只沒有送出去的空箱。'
    }),
    townBinding('ch2_s02_name_under_basket', 'mia_workroom', TownSceneTrigger.NPC_INTERACT, { actorId: 'herbalist' }),
    townBinding('ch2_s03_ledger_that_would_not_close', 'handbook', TownSceneTrigger.NPC_INTERACT, { actorId: 'town_scholar' }),
    townBinding('ch2_s07_names_return_to_town', 'handbook', TownSceneTrigger.NPC_INTERACT, { actorId: 'town_scholar' }),

    townBinding('ch3_s02_shadows_count_names', 'forge', TownSceneTrigger.NPC_INTERACT, { actorId: 'blacksmith' }),
    townBinding('ch3_s04_showcase_glass', 'casino', TownSceneTrigger.PLACE_INTERACT, {
        targetId: 'showcase_glass',
        label: '查看展示櫃',
        shortLabel: '展示櫃',
        icon: '$',
        imageId: 'random_event_spark',
        description: '玻璃櫃裡放著一件沒有標價的獎品。',
        position: { x: 64, y: 70 }
    }),
    townBinding('ch3_s05_blank_creditor_trace', 'alley', TownSceneTrigger.PLACE_INTERACT, {
        targetId: 'creditor_mark',
        label: '查看賣方記號',
        shortLabel: '賣方記號',
        icon: '◇',
        description: '牆角留著一枚沒有署名的賣方記號。',
        position: { x: 69, y: 62 }
    }),
    townBinding('ch3_s09_temptation_and_orders', 'crossroads', TownSceneTrigger.NPC_INTERACT, { actorId: 'village_elder' }),

    townBinding('ch4_s02_caravan_rear_missing', 'market', TownSceneTrigger.NPC_INTERACT, { actorId: 'merchant' }),
    townBinding('ch4_s08_returned_objects', 'forge', TownSceneTrigger.NPC_INTERACT, { actorId: 'blacksmith' }),
    townBinding('ch4_s09_four_elements_one_report', 'handbook', TownSceneTrigger.NPC_INTERACT, { actorId: 'town_scholar' }),

    townBinding('ch5_s01_four_fronts_converge', 'handbook', TownSceneTrigger.NPC_INTERACT, { actorId: 'town_scholar' }),
    townBinding('ch5_s02_forge_contracts', 'forge', TownSceneTrigger.NPC_INTERACT, { actorId: 'blacksmith' }),
    townBinding('ch5_s06_mia_operation', 'mia_workroom', TownSceneTrigger.NPC_INTERACT, { actorId: 'herbalist' }),
    townBinding('ch5_s07_after_the_ratchet', 'handbook', TownSceneTrigger.NPC_INTERACT, { actorId: 'town_scholar' }),
    townBinding('ch5_s08_expedition_list', 'handbook', TownSceneTrigger.NPC_INTERACT, { actorId: 'town_scholar' }),
    townBinding('ch5_s10_before_dawn', 'handbook', TownSceneTrigger.NPC_INTERACT, { actorId: 'town_scholar' }),
    townBinding('ch5_s11_town_loses_its_voice', 'casino', TownSceneTrigger.NPC_INTERACT, { actorId: 'casino_dealer' }),

    townBinding('ch6_s06_settlement_throw', 'casino', TownSceneTrigger.NPC_INTERACT, { actorId: 'casino_owner' }),
    townBinding('ch6_s07_house_changes_seats', 'casino', TownSceneTrigger.NPC_INTERACT, { actorId: 'casino_dealer' }),
    townBinding('ch6_s08_brush_past_or_invitation', 'alley', TownSceneTrigger.NPC_INTERACT, { actorId: 'street_beggar' }),

    townBinding('ch7_s08_return_to_town', 'crossroads', TownSceneTrigger.TOWN_ARRIVAL, {
        allowedArrivalReasons: ['adventure-walk-return', 'adventure-wolf-smoke']
    }),
    townBinding('ch7_s09_first_or_second_epilogue', 'crossroads', TownSceneTrigger.SCENE_CONTINUE)
]);

const TownSceneBindingIndex = new Map(
    TownSceneBindings.map(entry => [entry.sceneId, entry])
);

export function getTownSceneBinding(sceneId) {
    return TownSceneBindingIndex.get(sceneId) || null;
}

export function getTownSceneBindingsForPlace(placeId) {
    return TownSceneBindings.filter(entry => entry.placeId === placeId);
}
