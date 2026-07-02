/**
 * Quests.js
 * 任務資料庫 - 主線/懸賞/委託/隱藏任務
 */

// 任務類型
export const QuestType = {
    MAIN: 'main',           // 主線任務
    BOUNTY: 'bounty',       // 懸賞任務（狩獵）
    COMMISSION: 'commission', // 委託任務（NPC）
    HIDDEN: 'hidden'        // 隱藏任務
};

// 任務狀態
export const QuestStatus = {
    LOCKED: 'locked',       // 未解鎖
    AVAILABLE: 'available', // 可接取
    ACTIVE: 'active',       // 進行中
    COMPLETED: 'completed', // 已完成（待回報）
    FINISHED: 'finished'    // 已結束
};

// 任務目標類型
export const ObjectiveType = {
    KILL: 'kill',               // 擊殺怪物
    COLLECT: 'collect',         // 收集道具
    GOLD: 'gold',               // 累積金幣
    CRAFT: 'craft',             // 鍛造製作
    ENHANCE: 'enhance',         // 強化裝備
    GAMBLE_WIN: 'gamble_win',   // 賭場獲勝
    GAMBLE_PROFIT: 'gamble_profit', // 賭場盈利
    EXPLORE: 'explore',         // 探索區域
    EVENT: 'event',             // 觸發事件
    TALK: 'talk',               // 與 NPC 對話
    DUNGEON_CLEAR: 'dungeon_clear', // 通關副本
    DUNGEON_BOSS: 'dungeon_boss',   // 擊敗副本 Boss
    DUNGEON_FLOOR: 'dungeon_floor', // 到達副本樓層
    CUSTOM: 'custom'            // 自定義條件
};

import { ItemRarity, ItemType, EquipmentType, AffixStat } from '../models/Enums.js';

/**
 * 任務資料庫
 */
export const QuestDatabase = {
    // ==================== 主線任務 ====================
    main: [
        {
            id: 'main_001',
            name: '冒險的起點',
            type: QuestType.MAIN,
            chapter: 1,
            icon: '📖',
            description: '村長請你先找書記確認旅人手札的記錄方式，再到南門外近郊確認哪些路還能走。',
            objectives: [
                { type: ObjectiveType.TALK, target: 'town_scholar', count: 1, description: '先找書記確認旅人手札的記錄方式' },
                { type: ObjectiveType.EXPLORE, target: 'low', count: 3, description: '再確認南門外近郊 3 處路線' }
            ],
            rewards: {
                gold: 100,
                exp: 50,
                items: ['old_sword'],
                materials: [
                    { id: 'slime_jelly', quantity: 1 },
                    { id: 'beast_hide', quantity: 1 }
                ]
            },
            unlocks: ['main_002'], // 完成後解鎖
            dialogue: {
                start: '村長請你先找書記，再出城確認南門外的路線。',
                complete: '你把第一份近郊路線帶回城鎮。'
            }
        },
        {
            id: 'main_002',
            name: '農田邊的黏液聲',
            type: QuestType.MAIN,
            chapter: 1,
            icon: '📚',
            description: '書記把村民的聽聞整理成第一份紀錄：城外史萊姆正在靠近農田，這不是普通增生。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'slime', count: 5, description: '消滅靠近農田的史萊姆 5 個' }
            ],
            rewards: {
                gold: 150,
                exp: 80,
                items: ['health_potion_s']
            },
            unlocks: ['main_003'],
            dialogue: {
                start: '書記把農田附近的異常寫進旅人手札。',
                complete: '史萊姆增生被壓下來，但這更像地脈異常的第一個症狀。'
            }
        },
        {
            id: 'main_003',
            name: '斷裂誘餌鉤',
            type: QuestType.MAIN,
            chapter: 1,
            icon: '⚒️',
            description: '獵人棧道旁出現被整齊切斷的誘餌鉤。鍛造師認為那不是刀痕，而是某種會記住路線的東西留下的。',
            objectives: [
                { type: ObjectiveType.ENHANCE, target: 'any', count: 1, description: '強化任意裝備 1 次' }
            ],
            rewards: {
                gold: 100,
                exp: 60
            },
            unlocks: ['main_004'],
            dialogue: {
                start: '鍛造師要你先把裝備整好，再去試探獵人棧道。',
                complete: '誘餌鉤被修成能反向設陷的形狀。獵人棧道的銀絲開始有了脈絡。'
            }
        },
        {
            id: 'main_004',
            name: '銀絲伏道',
            type: QuestType.MAIN,
            chapter: 1,
            icon: '🕸️',
            description: '獵人棧道的銀絲不是隨機陷阱，而是在丈量回程路。讀懂線索後，帶著銀絲誘餌到伏道反設陷阱。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'ambush_mantis', count: 1, description: '在銀絲伏道設置誘餌並擊敗銀鐮伏獵者' }
            ],
            rewards: {
                gold: 220,
                exp: 140,
                items: ['silver_thread_hook'],
                materials: [
                    { id: 'spider_silk', quantity: 1 }
                ]
            },
            unlocks: ['main_005'],
            dialogue: {
                start: '銀絲伏道沒有首領等在原地。牠會等你犯下可預測的錯。',
                complete: '銀鐮伏獵者倒下後，獵人棧道終於能重新通行。'
            }
        },
        {
            id: 'main_005',
            name: '發黑樹皮',
            type: QuestType.MAIN,
            chapter: 1,
            icon: '🪵',
            description: '獵人棧道重新打通後，腐根溪谷的焦黑煙霧變得清楚。狼群、霧碑與發黑樹皮都指向同一個核心。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'wild_wolf', count: 5, description: '擊敗被污染痕跡驅趕的野狼 5 隻' },
                { type: ObjectiveType.KILL, target: 'forest_guardian', count: 1, description: '追蹤並擊敗古樹守衛' }
            ],
            rewards: {
                gold: 320,
                exp: 220,
                items: ['black_bark_guardian_core'],
                materials: [
                    { id: 'ancient_bark', quantity: 1 }
                ]
            },
            unlocks: ['main_006'],
            dialogue: {
                start: '森林不是主動攻擊人類。有人剝走了它的核心，讓守衛者痛到只剩防衛本能。',
                complete: '古樹守衛倒下後，溪谷火勢減弱，污染卻順著水流擴散。'
            }
        },
        {
            id: 'main_006',
            name: '血月下的折角',
            type: QuestType.MAIN,
            chapter: 1,
            icon: '🦌',
            description: '神木污染滲入溪流後，血月角鹿開始在夜裡撞碎巨石。這不是新的災難，而是上一場災難的回聲。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'blood_moon_stag', count: 1, description: '完成月苔誘導並擊敗血月角鹿' }
            ],
            rewards: {
                gold: 420,
                exp: 260,
                items: ['blood_moon_pendant'],
                materials: [
                    { id: 'life_seed', quantity: 1 }
                ]
            },
            unlocks: ['main_007', 'dungeon_cave_001'],
            dialogue: {
                start: '角鹿不是守門人，而是喝下污染溪水後失控的受害者。追上牠，第一章才算收束。',
                complete: '血月退去後，石階鎮外暫時穩定，但所有跡象都指向更高處的霧碑丘陵。'
            }
        },
        {
            id: 'main_007',
            name: '丘陵的執念',
            type: QuestType.MAIN,
            chapter: 2,
            icon: '🪨',
            description: '第一章的災害沒有真正結束，只是讓你看見更深的裂縫。霧碑丘陵的石碑、草藥與亡靈開始把事件推向第二章。',
            objectives: [
                { type: ObjectiveType.EXPLORE, target: 'high', count: 3, description: '探索霧碑丘陵 3 處地點' },
                { type: ObjectiveType.KILL, target: 'high_monster', count: 3, description: '擊敗高威脅區怪物 3 隻' }
            ],
            rewards: {
                gold: 520,
                exp: 300,
                items: ['mist_tablet_rubbing'],
                materials: [
                    { id: 'dark_crystal', quantity: 2 },
                    { id: 'ancient_rune', quantity: 1 }
                ]
            },
            unlocks: ['main_008'],
            requiredLevel: 8,
            dialogue: {
                start: '霧碑丘陵不是單一事件。女巫、神諭、巫妖與人類貴族的問題會從這裡逐步展開。',
                complete: '你跨過第一章的邊境災害，開始看見整片大陸如何一起斷裂。'
            }
        },
        // ==================== 第二章：丘陵的執念 (Lv.10-18) ====================
        {
            id: 'main_008',
            name: '荊棘交換珠',
            type: QuestType.MAIN,
            chapter: 2,
            icon: '🌿',
            description: '女巫的溫室被掠奪後，荊棘交換珠開始在村民之間流通。她不是單純攔路，而是在用交易重建失去的生命線。',
            objectives: [
                { type: ObjectiveType.EXPLORE, target: 'high', count: 2, description: '調查霧碑丘陵中的荊棘交易痕跡' },
                { type: ObjectiveType.KILL, target: 'thorn_witch', count: 1, description: '擊敗荊棘女巫' }
            ],
            rewards: {
                gold: 620,
                exp: 360,
                items: ['thorn_trade_bead'],
                materials: [
                    { id: 'forest_essence', quantity: 1 },
                    { id: 'poison_gland', quantity: 2 }
                ]
            },
            unlocks: ['main_009', 'dungeon_jungle_001'],
            requiredLevel: 10,
            dialogue: {
                start: '霧碑丘陵的草藥價格變得荒謬，荒謬到像有人把整片森林當作當鋪。',
                complete: '荊棘交易被打斷後，女巫留下的珠子指向更深處的潮聲。'
            }
        },
        {
            id: 'main_009',
            name: '沉鐘浮聲',
            type: QuestType.MAIN,
            chapter: 2,
            icon: '🔔',
            description: '海底祭壇失去深海寶珠後浮上海面，沉鐘神諭的聲音開始沿著霧碑丘陵回盪。',
            objectives: [
                { type: ObjectiveType.EXPLORE, target: 'medium', count: 2, description: '追查水聲與潮濕拓片的來源' },
                { type: ObjectiveType.KILL, target: 'drowned_oracle', count: 1, description: '擊敗沉鐘神諭' }
            ],
            rewards: {
                gold: 760,
                exp: 430,
                items: ['deep_sea_orb'],
                materials: [
                    { id: 'dark_crystal', quantity: 2 },
                    { id: 'ancient_rune', quantity: 1 }
                ]
            },
            unlocks: ['main_010', 'dungeon_snow_001'],
            requiredLevel: 12,
            dialogue: {
                start: '鐘聲不是從海邊傳來，而是從地脈裂縫裡往上冒。這句話聽起來很不合理，偏偏每個證人都這麼說。',
                complete: '神諭沉默後，浮出的祭壇證明古龍已經拿走了不該被移動的核心。'
            }
        },
        {
            id: 'main_010',
            name: '被掘開的古墓',
            type: QuestType.MAIN,
            chapter: 2,
            icon: '💀',
            description: '遠古古墓被龍族眷屬掘開，巫妖的法杖被奪走。失去靈魂火種錨點的古代學者，正在把整片原野叫醒。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'skeleton', count: 6, description: '擊退被喚醒的骷髏兵 6 隻' },
                { type: ObjectiveType.KILL, target: 'lich', count: 1, description: '擊敗巫妖' }
            ],
            rewards: {
                gold: 940,
                exp: 520,
                items: ['lich_staff_remnant'],
                materials: [
                    { id: 'lich_phylactery', quantity: 1 },
                    { id: 'dark_crystal', quantity: 2 }
                ]
            },
            unlocks: ['main_011', 'dungeon_ruins_001'],
            requiredLevel: 14,
            dialogue: {
                start: '那些骷髏不是來攻城的，它們像是在找東西。問題是，牠們翻箱倒櫃的方式很傷人。',
                complete: '巫妖倒下後，古墓沒有安靜太久。你找到的帳冊把下一個名字推到火光裡。'
            }
        },
        {
            id: 'main_011',
            name: '灰燼男爵的地宮',
            type: QuestType.MAIN,
            chapter: 2,
            icon: '🔥',
            description: '黑曜石要塞的男爵預見末日後選擇背叛。他不是要拯救領民，而是要把所有糧食與鐵器都帶進自己的地宮。',
            objectives: [
                { type: ObjectiveType.EXPLORE, target: 'death', count: 2, description: '沿著煤印與走私帳冊追到黑曜石地宮' },
                { type: ObjectiveType.KILL, target: 'ash_baron', count: 1, description: '擊敗灰燼男爵' }
            ],
            rewards: {
                gold: 1120,
                exp: 620,
                items: ['ash_ledger_page'],
                materials: [
                    { id: 'ember_stone', quantity: 2 },
                    { id: 'rare_metal', quantity: 1 }
                ]
            },
            unlocks: ['main_012'],
            requiredLevel: 16,
            dialogue: {
                start: '男爵說他是在保存文明。村民則說，他保存文明的方式主要是先搶走大家的鍋子。',
                complete: '地宮被打開後，你終於確認：古龍的掠奪已經把人類自己的恐懼也點燃了。'
            }
        },
        // ==================== 第三章：諸神黃昏 (Lv.18-30) ====================
        {
            id: 'main_012',
            name: '龍巢之路',
            type: QuestType.MAIN,
            chapter: 3,
            icon: '🐉',
            description: '各地核心被奪的證據都指向北方。古龍眷屬不必特別登場，牠們留下的缺口已經足夠讓你追上龍巢。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'wyvern', count: 3, description: '擊敗在北境盤旋的翼龍 3 隻' },
                { type: ObjectiveType.KILL, target: 'drake', count: 3, description: '擊敗守著熱痕的幼龍 3 隻' },
                { type: ObjectiveType.KILL, target: 'dragon_knight', count: 1, description: '擊敗龍騎士前哨' }
            ],
            rewards: {
                gold: 1400,
                exp: 760,
                items: ['dragon_nest_resonance'],
                materials: [
                    { id: 'elder_dragon_scale', quantity: 1 },
                    { id: 'rare_metal', quantity: 1 }
                ]
            },
            unlocks: ['main_013'],
            requiredLevel: 20,
            dialogue: {
                start: '你不需要有人告訴你龍在哪裡。被偷走的黑樹皮、寶珠與法杖，自己排成了路標。',
                complete: '北方的熱痕匯到焦黑方尖碑，龍巢就在上方。'
            }
        },
        {
            id: 'main_013',
            name: '古龍之巢',
            type: QuestType.MAIN,
            chapter: 3,
            icon: '🐲',
            description: '古龍不是魔王的盟友。牠只是把全大陸的魔力精華堆成自己的冬眠巢穴，而這足以讓世界一起垮掉。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'elder_dragon', count: 1, description: '擊敗古龍' }
            ],
            rewards: {
                gold: 2600,
                exp: 1200,
                items: ['elder_dragon_fang'],
                materials: [
                    { id: 'elder_dragon_scale', quantity: 3 },
                    { id: 'world_shard', quantity: 1 }
                ]
            },
            unlocks: ['main_014'],
            requiredLevel: 24,
            dialogue: {
                start: '古龍盤踞在所有失竊核心之上。牠沒有統治世界的興趣，這反而更糟。',
                complete: '古龍倒下後，龍巢的集中魔力暴露在黑焰下。深淵裡有東西醒了。'
            }
        },
        {
            id: 'main_014',
            name: '封印碎裂',
            type: QuestType.MAIN,
            chapter: 3,
            icon: '😈',
            description: '地脈全面斷裂，魔王阿薩謝爾掙脫深淵封印。他沒有先攻王都，而是盯上古龍留下的龍巢魔力。',
            objectives: [
                { type: ObjectiveType.EXPLORE, target: 'death', count: 3, description: '穿越黑焰邊境確認封印裂口' },
                { type: ObjectiveType.KILL, target: 'demon_soldier', count: 8, description: '擊退深淵先鋒 8 名' }
            ],
            rewards: {
                gold: 1700,
                exp: 900,
                items: ['abyss_vanguard_oath'],
                materials: [
                    { id: 'soul_fragment', quantity: 2 },
                    { id: 'dark_crystal', quantity: 2 }
                ]
            },
            unlocks: ['main_015'],
            requiredLevel: 27,
            dialogue: {
                start: '魔王北上不是為了救世界。這點值得先釐清，免得有人把他寫進感謝名單。',
                complete: '深淵先鋒被擊退後，方尖碑下的黑焰開始向內旋轉。決戰入口打開了。'
            }
        },
        {
            id: 'main_015',
            name: '終焉之戰：阿薩謝爾',
            type: QuestType.MAIN,
            chapter: 3,
            icon: '👑',
            description: '魔王阿薩謝爾要吞下龍巢的魔力，發動毀滅人類文明的終焉之戰。你必須在兩股毀滅力量的殘骸之間結束這一切。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'demon_general', count: 2, description: '擊敗魔族將軍 2 名' },
                { type: ObjectiveType.KILL, target: 'demon_lord_asariel', count: 1, description: '擊敗魔王阿薩謝爾' }
            ],
            rewards: {
                gold: 10000,
                exp: 5000,
                materials: [
                    { id: 'world_shard', quantity: 1 }
                ],
                items: ['demon_lord_sword', 'demon_lord_armor']
            },
            unlocks: [],
            requiredLevel: 30,
            dialogue: {
                start: '這不是神魔合作，是兩個災難搶同一座魔力倉庫。你剛好是倉庫門口唯一還站著的人。',
                complete: '阿薩謝爾被擊倒後，龍巢魔力開始回流地脈。艾瑟利亞沒有恢復和平，而城鎮能留下什麼樣的明天，會由你一路保住的人、道路與紀錄決定。'
            }
        },
    ],

    // ==================== 懸賞任務 ====================
    bounty: [
        {
            id: 'bounty_001',
            name: '書記的史萊姆紀錄',
            type: QuestType.BOUNTY,
            icon: '🎯',
            description: '書記記下村民的聽聞：城外史萊姆靠近農田，需要先清掉一小批確認狀況。',
            repeatable: true,
            objectives: [
                { type: ObjectiveType.KILL, target: 'slime', count: 5, description: '消滅靠近農田的史萊姆 5 個' }
            ],
            rewards: {
                gold: 80,
                exp: 40
            },
            unlocks: []
        },
        {
            id: 'bounty_002',
            name: '哥布林威脅',
            type: QuestType.BOUNTY,
            icon: '🎯',
            description: '哥布林在普通區出沒，消滅它們！',
            repeatable: true,
            objectives: [
                { type: ObjectiveType.KILL, target: 'goblin', count: 8, description: '擊敗哥布林 8 隻' }
            ],
            rewards: {
                gold: 150,
                exp: 80
            },
            unlocks: ['bounty_003']
        },
        {
            id: 'bounty_003',
            name: '狼群狩獵',
            type: QuestType.BOUNTY,
            icon: '🎯',
            description: '危險區的狼群正在威脅旅人安全。',
            repeatable: true,
            objectives: [
                { type: ObjectiveType.KILL, target: 'wild_wolf', count: 5, description: '擊敗野狼 5 隻' }
            ],
            rewards: {
                gold: 250,
                exp: 120
            },
            unlocks: []
        },
        {
            id: 'bounty_elite_001',
            name: '精英狩獵：暗影刺客',
            type: QuestType.BOUNTY,
            icon: '💀',
            description: '一個精英怪物正在危險區域徘徊...',
            repeatable: false,
            objectives: [
                { type: ObjectiveType.KILL, target: 'shadow_assassin', count: 1, description: '擊敗暗影刺客' }
            ],
            rewards: {
                gold: 500,
                exp: 300,
                items: ['assassin_dagger']
            },
            unlocks: []
        }
    ],

    // ==================== 副本任務 ====================
    dungeon: [
        // 幽暗洞窟系列
        {
            id: 'dungeon_cave_001',
            name: '洞窟初探',
            type: QuestType.BOUNTY,
            icon: '🕯️',
            description: '幽暗洞窟傳出了奇怪的聲音，去探索一下吧。',
            objectives: [
                { type: ObjectiveType.DUNGEON_FLOOR, target: 'cave', count: 3, description: '在幽暗洞窟到達第 3 層' }
            ],
            rewards: {
                gold: 200,
                exp: 100,
                items: ['torch']
            },
            unlocks: ['dungeon_cave_002'],
            dialogue: {
                start: '那個洞窟裡住著什麼呢？小心黑暗中的危險。',
                complete: '你成功深入了洞窟！這個火把應該能幫到你。'
            }
        },
        {
            id: 'dungeon_cave_002',
            name: '洞窟征服者',
            type: QuestType.BOUNTY,
            icon: '🦇',
            description: '征服整個幽暗洞窟，擊敗深處的 Boss！',
            objectives: [
                { type: ObjectiveType.DUNGEON_CLEAR, target: 'cave', count: 1, description: '通關幽暗洞窟' },
                { type: ObjectiveType.DUNGEON_BOSS, target: 'cave_boss', count: 1, description: '擊敗洞窟主人：暗影蝙蝠王' }
            ],
            rewards: {
                gold: 500,
                exp: 250,
                items: ['bat_wing_cloak']
            },
            unlocks: ['dungeon_snow_001'],
            dialogue: {
                start: '洞窟深處有一個強大的存在...準備好了嗎？',
                complete: '太厲害了！你征服了幽暗洞窟！'
            }
        },
        
        // 冰封雪峰系列
        {
            id: 'dungeon_snow_001',
            name: '雪山試煉',
            type: QuestType.BOUNTY,
            icon: '❄️',
            description: '冰封雪峰的寒氣非常致命，帶好保暖裝備再去。',
            objectives: [
                { type: ObjectiveType.DUNGEON_FLOOR, target: 'snow', count: 3, description: '在冰封雪峰到達第 3 層' }
            ],
            rewards: {
                gold: 300,
                exp: 150,
                items: ['cold_resist_potion']
            },
            unlocks: ['dungeon_snow_002'],
            dialogue: {
                start: '那座雪山常年被冰雪覆蓋，寒氣會逐漸侵蝕你的身體。',
                complete: '你成功抵禦了寒冷！這瓶抗寒藥劑應該有用。'
            }
        },
        {
            id: 'dungeon_snow_002',
            name: '冰霜王座',
            type: QuestType.BOUNTY,
            icon: '🏔️',
            description: '傳說雪山頂有一座冰霜王座，那裡住著冰霜巨人。',
            objectives: [
                { type: ObjectiveType.DUNGEON_CLEAR, target: 'snow', count: 1, description: '通關冰封雪峰' },
                { type: ObjectiveType.DUNGEON_BOSS, target: 'snow_boss', count: 1, description: '擊敗冰霜領主' }
            ],
            rewards: {
                gold: 800,
                exp: 400,
                items: ['frost_crown']
            },
            unlocks: ['dungeon_ruins_001'],
            dialogue: {
                start: '冰霜領主已經統治那座山數百年了...',
                complete: '難以置信！你打敗了冰霜領主！'
            }
        },
        
        // 遠古遺跡系列
        {
            id: 'dungeon_ruins_001',
            name: '遺跡探索者',
            type: QuestType.BOUNTY,
            icon: '🏛️',
            description: '遠古遺跡中充滿了謎題和陷阱，考驗你的智慧。',
            objectives: [
                { type: ObjectiveType.DUNGEON_FLOOR, target: 'ruins', count: 3, description: '在遠古遺跡到達第 3 層' }
            ],
            rewards: {
                gold: 400,
                exp: 200,
                items: ['ancient_key']
            },
            unlocks: ['dungeon_ruins_002'],
            dialogue: {
                start: '那些遺跡是古代文明留下的，充滿了智慧的結晶。',
                complete: '你的智慧令人佩服！這把古老鑰匙或許能派上用場。'
            }
        },
        {
            id: 'dungeon_ruins_002',
            name: '守護者的考驗',
            type: QuestType.BOUNTY,
            icon: '🗿',
            description: '遺跡深處的守護者正在等待挑戰者。',
            objectives: [
                { type: ObjectiveType.DUNGEON_CLEAR, target: 'ruins', count: 1, description: '通關遠古遺跡' },
                { type: ObjectiveType.DUNGEON_BOSS, target: 'ruins_boss', count: 1, description: '擊敗遺跡守護者' }
            ],
            rewards: {
                gold: 1000,
                exp: 500,
                items: ['guardian_shield']
            },
            unlocks: ['dungeon_jungle_001'],
            dialogue: {
                start: '守護者會考驗所有闖入者，證明你有資格獲得古老的力量！',
                complete: '你通過了守護者的考驗！'
            }
        },
        
        // 迷霧叢林系列
        {
            id: 'dungeon_jungle_001',
            name: '叢林迷途',
            type: QuestType.BOUNTY,
            icon: '🌿',
            description: '迷霧叢林讓無數冒險者迷失了方向，小心前進。',
            objectives: [
                { type: ObjectiveType.DUNGEON_FLOOR, target: 'jungle', count: 3, description: '在迷霧叢林到達第 3 層' }
            ],
            rewards: {
                gold: 500,
                exp: 250,
                items: ['compass']
            },
            unlocks: ['dungeon_jungle_002'],
            dialogue: {
                start: '那片叢林的迷霧會讓人失去方向感，要仔細尋找路標。',
                complete: '你找到了穿越迷霧的方法！這個指南針能幫你指引方向。'
            }
        },
        {
            id: 'dungeon_jungle_002',
            name: '叢林之心',
            type: QuestType.BOUNTY,
            icon: '🌺',
            description: '叢林深處有一朵傳說中的花，守護著整片叢林。',
            objectives: [
                { type: ObjectiveType.DUNGEON_CLEAR, target: 'jungle', count: 1, description: '通關迷霧叢林' },
                { type: ObjectiveType.DUNGEON_BOSS, target: 'jungle_boss', count: 1, description: '擊敗叢林女王' }
            ],
            rewards: {
                gold: 1200,
                exp: 600,
                items: ['jungle_heart']
            },
            unlocks: ['dungeon_hell_001'],
            dialogue: {
                start: '叢林女王會用自然的力量考驗你...',
                complete: '你征服了迷霧叢林！'
            }
        },
        
        // 煉獄深淵系列
        {
            id: 'dungeon_hell_001',
            name: '地獄之門',
            type: QuestType.BOUNTY,
            icon: '🔥',
            description: '煉獄深淵的入口被打開了，灼熱的火焰正在蔓延。',
            objectives: [
                { type: ObjectiveType.DUNGEON_FLOOR, target: 'hell', count: 3, description: '在煉獄深淵到達第 3 層' }
            ],
            rewards: {
                gold: 600,
                exp: 300,
                items: ['fire_resist_potion']
            },
            unlocks: ['dungeon_hell_002'],
            dialogue: {
                start: '那裡是地獄的入口，火焰會持續灼燒你的身體。',
                complete: '你承受住了地獄的炙烤！這瓶抗火藥劑能減輕傷害。'
            }
        },
        {
            id: 'dungeon_hell_002',
            name: '終焉之戰',
            type: QuestType.BOUNTY,
            icon: '👿',
            description: '煉獄深淵的最深處，惡魔領主正在等待最強的挑戰者。',
            objectives: [
                { type: ObjectiveType.DUNGEON_CLEAR, target: 'hell', count: 1, description: '通關煉獄深淵' },
                { type: ObjectiveType.DUNGEON_BOSS, target: 'hell_boss', count: 1, description: '擊敗煉獄領主' }
            ],
            rewards: {
                gold: 2000,
                exp: 1000,
                items: ['demon_slayer']
            },
            unlocks: ['hidden_dungeon_master'],
            dialogue: {
                start: '這是最終的試煉...只有真正的英雄才能擊敗煉獄領主！',
                complete: '不可思議！你擊敗了煉獄領主，成為了傳奇！'
            }
        },
        
        // 每週副本挑戰（可重複）
        {
            id: 'dungeon_weekly_challenge',
            name: '每週副本挑戰',
            type: QuestType.BOUNTY,
            icon: '🏆',
            description: '每週完成一次任意副本，獲得額外獎勵！',
            repeatable: true,
            objectives: [
                { type: ObjectiveType.DUNGEON_CLEAR, target: 'any', count: 1, description: '通關任意副本' }
            ],
            rewards: {
                gold: 300,
                exp: 150,
                items: ['dungeon_token']
            },
            unlocks: [],
            dialogue: {
                start: '每週都有新的副本挑戰等著你！',
                complete: '本週挑戰完成！繼續保持！'
            }
        }
    ],

    // ==================== 委託任務 ====================
    commission: [
        // 鍛造師委託
        {
            id: 'commission_forge_001',
            name: '圖紙邊角的名字',
            type: QuestType.COMMISSION,
            npc: 'blacksmith',
            chapter: 2,
            icon: '⚒️',
            trigger: {
                type: 'npc_story',
                npc: 'blacksmith',
                afterFlag: 'foundBlueprintCache',
                afterQuest: 'main_007',
                reason: '你在野外找到殘缺圖紙後，鍛造師認出邊角上刻著失蹤學徒妮露的名字。'
            },
            description: '野外圖紙不是單純配方，而是鍛造師失蹤學徒留下的工作記錄。要補回缺頁，必須到丘陵帶回能承受地脈震動的礦材。',
            objectives: [
                { type: ObjectiveType.COLLECT, target: 'iron_ore', count: 5, description: '收集鐵礦石 5 個，用來校準妮露筆記的基礎比例' },
                { type: ObjectiveType.COLLECT, target: 'dark_steel', count: 1, description: '取得暗鋼 1 個，確認圖紙能承受丘陵地脈震動' }
            ],
            rewards: {
                gold: 180,
                exp: 120,
                items: ['enhance_scroll'],
                materials: [
                    { id: 'rare_metal', quantity: 1 }
                ]
            },
            unlocks: [],
            dialogue: {
                start: '鍛造師請你帶回礦材，補齊失蹤學徒妮露留下的圖紙。',
                complete: '妮露的名字被重新刻回圖紙邊角。鍛造鋪不再把這件事當成單純技術研究。'
            }
        },
        {
            id: 'commission_forge_002',
            name: '秘銀不是傳說',
            type: QuestType.COMMISSION,
            npc: 'blacksmith',
            chapter: 3,
            icon: '⚒️',
            trigger: {
                type: 'npc_story',
                npc: 'blacksmith',
                afterQuest: 'commission_forge_001',
                duringQuest: 'main_012',
                reason: '北境路線打開後，一名逃匠的筆記證明妮露圖紙的下一段需要秘銀。'
            },
            description: '逃匠奧倫留下的筆記說，秘銀不是傳說，只是很多人還沒把它帶回城鎮就死在路上。鍛造師要用它驗證妮露圖紙的高階段落。',
            objectives: [
                { type: ObjectiveType.COLLECT, target: 'mithril_ore', count: 3, description: '收集秘銀礦石 3 個' },
                { type: ObjectiveType.ENHANCE, target: 'any', count: 5, description: '累計強化 5 次，測試秘銀的穩定性' }
            ],
            rewards: {
                gold: 420,
                exp: 260,
                items: ['master_hammer'],
                materials: [
                    { id: 'rare_metal', quantity: 1 },
                    { id: 'dark_steel', quantity: 1 }
                ]
            },
            unlocks: [],
            dialogue: {
                start: '鍛造師請你帶回秘銀，讓妮露圖紙與逃匠奧倫的筆記接上。',
                complete: '秘銀在爐中穩定下來。鍛造師第一次承認，妮露可能不是失蹤，而是追著真相往北去了。'
            }
        },
        {
            id: 'commission_blacksmith_chimney',
            name: '鐵匠的煙囪',
            type: QuestType.COMMISSION,
            npc: 'blacksmith',
            chapter: 1,
            icon: '⚒️',
            trigger: {
                type: 'npc_story',
                npc: 'blacksmith',
                afterQuest: 'main_003',
                reason: '斷裂誘餌鉤讓鍛造師想起過去失手的獵人鉤索，他才願意把爐火與煙道問題交給玩家。'
            },
            description: '鍛造師的爐煙開始倒灌。這不是單純修煙囪，而是讓城鎮夜裡重新有一盞敢亮著的爐火。',
            objectives: [
                { type: ObjectiveType.COLLECT, target: 'iron_ore', count: 5, description: '帶回鐵礦石 5 個，讓鍛造師校準爐火' }
            ],
            rewards: {
                gold: 90,
                exp: 45
            },
            unlocks: [],
            dialogue: {
                start: '鍛造師請你帶回鐵礦石，讓他把倒灌的爐火穩住。',
                complete: '鐵匠鋪的煙終於往上走，不再像一頭被嗆醒的老牛。'
            }
        },
        {
            id: 'commission_apothecary_bottles',
            name: '藥師的空瓶',
            type: QuestType.COMMISSION,
            npc: 'herbalist',
            chapter: 1,
            icon: '🧪',
            trigger: {
                type: 'npc_story',
                npc: 'herbalist',
                afterQuest: 'main_002',
                reason: '史萊姆增生被壓下後，藥師才有樣本理由追查凝膠甜味與農田土壤異常。'
            },
            description: '藥師的空瓶被異常凝膠腐蝕。她需要更多樣本，確認農田土壤是不是已經被地脈污染滲入。',
            objectives: [
                { type: ObjectiveType.COLLECT, target: 'slime_jelly', count: 5, description: '帶回史萊姆凝膠 5 份' }
            ],
            rewards: {
                gold: 70,
                exp: 50,
                items: ['health_potion_s']
            },
            unlocks: [],
            dialogue: {
                start: '藥師請你帶回史萊姆凝膠，她要確認那股甜味到底從哪裡來。',
                complete: '藥師把凝膠樣本分瓶封好，市集邊棚的藥味終於壓過了黏液味。'
            }
        },
        {
            id: 'commission_guard_boots',
            name: '南門守衛的靴底',
            type: QuestType.COMMISSION,
            npc: 'village_elder',
            chapter: 1,
            icon: '🥾',
            trigger: {
                type: 'npc_story',
                npc: 'village_elder',
                afterQuest: 'main_001',
                reason: '南門外路線被玩家確認後，守衛必須重新巡查那些路，靴底問題才浮上檯面。'
            },
            description: '南門守衛的靴底被黏液和碎石磨穿。這不是英雄傳說，但有人得明天繼續站在門口看路。',
            objectives: [
                { type: ObjectiveType.COLLECT, target: 'beast_hide', count: 3, description: '帶回獸皮 3 張，修補南門守衛的靴底' }
            ],
            rewards: {
                gold: 80,
                exp: 45,
                items: ['gate_patrol_map']
            },
            unlocks: [],
            dialogue: {
                start: '村長請你帶回幾張獸皮，讓南門守衛明天還能站崗。',
                complete: '守衛的靴底被補好，南門的路線紀錄也變得更可靠。'
            }
        },
        {
            id: 'commission_herb_basket',
            name: '採藥籃不會說謊',
            type: QuestType.COMMISSION,
            npc: 'herbalist',
            chapter: 2,
            icon: '🧺',
            trigger: {
                type: 'npc_story',
                npc: 'herbalist',
                duringQuest: 'main_008',
                reason: '荊棘女巫線開啟後，自己回來的採藥籃才有意義，否則只是孤立怪事。'
            },
            description: '一只空採藥籃自己回到城鎮，提把上綁著荊棘。藥師不相信籃子會走路，但她更不相信這只是惡作劇。',
            objectives: [
                { type: ObjectiveType.COLLECT, target: 'poison_gland', count: 2, description: '帶回毒腺 2 份，辨認毒霧林地的變化' },
                { type: ObjectiveType.KILL, target: 'poison_spider', count: 4, description: '擊退毒霧林地附近的毒蛛 4 隻' }
            ],
            rewards: {
                gold: 180,
                exp: 110,
                items: ['field_medic_notes'],
                materials: [
                    { id: 'forest_essence', quantity: 1 }
                ]
            },
            unlocks: ['commission_herb_basket_002'],
            requiredLevel: 10,
            dialogue: {
                start: '藥師請你調查那只自己回來的採藥籃，看看荊棘交易到底留下了什麼。',
                complete: '藥師確認毒霧不是亂飄，而是被某種交易規則一步步推向城鎮。'
            }
        },
        {
            id: 'commission_herb_basket_002',
            name: '籃底縫著的名字',
            type: QuestType.COMMISSION,
            npc: 'herbalist',
            chapter: 2,
            icon: '🧵',
            trigger: {
                type: 'npc_story',
                npc: 'herbalist',
                afterQuest: 'commission_herb_basket',
                duringQuest: 'main_008',
                reason: '採藥籃被確認與荊棘交易有關後，藥師才會拆開籃底，發現失蹤採藥人留下的縫線暗記。'
            },
            description: '藥師拆開採藥籃底，發現縫線不是補丁，而是一段名字與方向。那位失蹤採藥人不是單純被抓走，她曾經試著把毒霧的來源縫回城鎮。',
            objectives: [
                { type: ObjectiveType.COLLECT, target: 'forest_essence', count: 2, description: '帶回森林精華 2 份，穩定籃底縫線上的殘留氣息' },
                { type: ObjectiveType.KILL, target: 'poison_spider', count: 3, description: '清掉縫線指向路線上的毒蛛 3 隻' }
            ],
            rewards: {
                gold: 230,
                exp: 145,
                items: ['leah_stitched_name'],
                materials: [
                    { id: 'poison_gland', quantity: 1 },
                    { id: 'life_seed', quantity: 1 }
                ]
            },
            unlocks: [],
            requiredLevel: 11,
            dialogue: {
                start: '藥師請你沿著籃底縫線追查失蹤採藥人的路線。這一次要找的不是怪物，而是一個曾經想把警告送回來的人。',
                complete: '藥師把採藥人的名字寫在藥棚門口。城鎮第一次知道，那只籃子回來不是怪事，是求救。'
            }
        },
        {
            id: 'commission_grave_bookmark',
            name: '墓園書籤',
            type: QuestType.COMMISSION,
            npc: 'town_scholar',
            chapter: 2,
            icon: '🔖',
            trigger: {
                type: 'npc_story',
                npc: 'town_scholar',
                duringQuest: 'main_010',
                reason: '巫妖線進入古墓後，書記才會把古代學者書籤拿出來，讓名字成為戰鬥之外的重量。'
            },
            description: '書記找到一張古代學者的書籤。它不能讓巫妖變得無害，卻能讓城鎮記得牠曾經有名字。',
            objectives: [
                { type: ObjectiveType.COLLECT, target: 'bone_fragment', count: 5, description: '從古墓附近帶回骨頭碎片 5 份' },
                { type: ObjectiveType.KILL, target: 'skeleton_warrior', count: 3, description: '擊退墓道骷髏兵 3 隻' }
            ],
            rewards: {
                gold: 210,
                exp: 130,
                items: ['julian_bookmark'],
                materials: [
                    { id: 'ancient_rune', quantity: 1 }
                ]
            },
            unlocks: ['commission_grave_bookmark_002'],
            requiredLevel: 12,
            dialogue: {
                start: '書記請你去古墓附近找回能辨認學者名字的碎片。',
                complete: '書記把巫妖的名字補進紀錄旁，怪物仍是怪物，但不再只是一行分類。'
            }
        },
        {
            id: 'commission_grave_bookmark_002',
            name: '朱利安的邊註',
            type: QuestType.COMMISSION,
            npc: 'town_scholar',
            chapter: 2,
            icon: '📝',
            trigger: {
                type: 'npc_story',
                npc: 'town_scholar',
                afterQuest: 'commission_grave_bookmark',
                duringQuest: 'main_010',
                reason: '巫妖生前姓名被補回後，書記才看懂書籤邊緣的縮寫，將它連到古代御術師朱利安的防衛紀錄。'
            },
            description: '書籤邊緣寫著朱利安的縮寫。那不是求救，而像一句遲到很久的道歉：他們打造了秩序，卻沒替活人留下關閉它的方法。',
            objectives: [
                { type: ObjectiveType.COLLECT, target: 'ancient_rune', count: 2, description: '帶回古代符文 2 份，讓書記比對朱利安的縮寫' },
                { type: ObjectiveType.KILL, target: 'ancient_guardian', count: 2, description: '擊退仍在執行舊命令的遠古守衛 2 具' }
            ],
            rewards: {
                gold: 260,
                exp: 170,
                items: ['julian_margin_notes'],
                materials: [
                    { id: 'golem_core', quantity: 1 }
                ]
            },
            unlocks: [],
            requiredLevel: 14,
            dialogue: {
                start: '書記請你確認朱利安邊註中的防衛符文。這能讓遠古遺跡不只是副本，也成為巫妖線背後的錯誤秩序。',
                complete: '書記把朱利安的邊註補進紀錄：秩序若不懂得停下，也會變成另一種怪物。'
            }
        },
        {
            id: 'commission_drowned_bell_insomnia',
            name: '沉鐘下的失眠人',
            type: QuestType.COMMISSION,
            npc: 'town_scholar',
            chapter: 2,
            icon: '🔔',
            trigger: {
                type: 'npc_story',
                npc: 'town_scholar',
                duringQuest: 'main_009',
                reason: '沉鐘神諭線開始後，城鎮失眠居民聽見的鐘聲才會和海岸紀錄產生因果連結。'
            },
            description: '城鎮有人連續幾夜聽見海底鐘聲。書記不想把這只寫成失眠，因為鐘聲節奏和沉鐘神諭的海岸紀錄對得太整齊。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'ghost', count: 3, description: '擊退沉鐘異響附近的幽魂 3 隻' },
                { type: ObjectiveType.COLLECT, target: 'ectoplasm', count: 3, description: '帶回回聲殘留 3 份，讓書記比對鐘聲節奏' }
            ],
            rewards: {
                gold: 190,
                exp: 120,
                items: ['bell_rhythm_charm'],
                materials: [
                    { id: 'frost_crystal', quantity: 1 },
                    { id: 'ancient_rune', quantity: 1 }
                ]
            },
            unlocks: [],
            requiredLevel: 12,
            dialogue: {
                start: '書記請你調查夜裡的沉鐘聲。聽起來像失眠，但太有節奏的失眠通常不是失眠。',
                complete: '書記把鐘聲節奏補進海岸紀錄，城鎮裡那位失眠的人終於能證明自己不是在跟枕頭吵架。'
            }
        },
        {
            id: 'commission_ash_ledger_names',
            name: '帳冊上的名字',
            type: QuestType.COMMISSION,
            npc: 'village_elder',
            chapter: 2,
            icon: '📒',
            trigger: {
                type: 'npc_story',
                npc: 'village_elder',
                duringQuest: 'main_011',
                reason: '灰燼男爵線進入黑曜石要塞後，失蹤工匠名單才從村長抽屜裡被迫拿出來。'
            },
            description: '村長手上有一份失蹤工匠名單，卻一直沒有貼上公告欄。灰燼男爵的帳冊讓這些名字再也不能只躺在抽屜裡。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'shadow_soldier', count: 4, description: '擊退黑鐵倉道附近的影兵 4 名' },
                { type: ObjectiveType.COLLECT, target: 'shadow_insignia', count: 2, description: '帶回影徽 2 枚，確認工匠被帶往黑曜石要塞' }
            ],
            rewards: {
                gold: 260,
                exp: 160,
                items: ['ash_nameplate'],
                materials: [
                    { id: 'rare_metal', quantity: 1 },
                    { id: 'dark_steel', quantity: 1 }
                ]
            },
            unlocks: ['commission_ash_ledger_names_002'],
            requiredLevel: 16,
            dialogue: {
                start: '村長請你查清灰燼帳冊上的工匠去向。有些名字藏久了，就不只是名字，還會變成整座城鎮的沉默。',
                complete: '失蹤工匠的名字被釘上公告欄。城鎮很安靜，但那種安靜終於不再是假裝。'
            }
        },
        {
            id: 'commission_ash_ledger_names_002',
            name: '工匠最後的刻痕',
            type: QuestType.COMMISSION,
            npc: 'village_elder',
            chapter: 2,
            icon: '🪓',
            trigger: {
                type: 'npc_story',
                npc: 'village_elder',
                afterQuest: 'commission_ash_ledger_names',
                duringQuest: 'main_011',
                reason: '失蹤名單公開後，村長才收到家屬交出的舊工具柄；上面刻著黑曜石要塞地下工程的方向。'
            },
            description: '公告欄貼出名單後，一位家屬交出工匠留下的工具柄。那上面的刻痕不是紀念，而是一條通往黑曜石地宮的工作路線。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'shadow_soldier', count: 3, description: '擊退守在倉道刻痕旁的影兵 3 名' },
                { type: ObjectiveType.COLLECT, target: 'dark_steel', count: 1, description: '帶回暗鋼 1 份，確認地宮工事使用的材料' }
            ],
            rewards: {
                gold: 300,
                exp: 190,
                items: ['craftsman_gouge'],
                materials: [
                    { id: 'rare_metal', quantity: 1 }
                ]
            },
            unlocks: [],
            requiredLevel: 17,
            dialogue: {
                start: '村長請你查明工具柄上的刻痕。名單讓人知道誰不見了，刻痕則可能告訴城鎮他們被迫做了什麼。',
                complete: '村長把刻痕拓片貼在名單旁。失蹤工匠不再只是受害者，他們也留下了指向男爵地宮的路。'
            }
        },
        {
            id: 'commission_northern_letter',
            name: '北境來信',
            type: QuestType.COMMISSION,
            npc: 'village_elder',
            chapter: 3,
            icon: '✉️',
            trigger: {
                type: 'npc_story',
                npc: 'village_elder',
                duringQuest: 'main_012',
                reason: '龍巢之路開啟後，北境信使的家書才把古龍威脅從高階地圖拉回普通人的生活。'
            },
            description: '一名信使倒在城門口，懷裡的家書被熱風烤到捲邊。信裡沒有英雄口吻，只有北境天空變紅與軍糧豆子太硬。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'wyvern', count: 2, description: '擊退北境路線上的飛龍斥候 2 隻' },
                { type: ObjectiveType.COLLECT, target: 'wyvern_scale', count: 2, description: '帶回飛龍鱗 2 片，確認信使穿越的熱風路線' }
            ],
            rewards: {
                gold: 340,
                exp: 220,
                items: ['north_letter_seal'],
                materials: [
                    { id: 'dragon_tooth', quantity: 1 },
                    { id: 'rare_metal', quantity: 1 }
                ]
            },
            unlocks: ['commission_northern_letter_002'],
            requiredLevel: 20,
            dialogue: {
                start: '村長請你確認北境信使走過的路。那封家書不會告訴你怎麼屠龍，但會告訴你北方真的有人在失去明天。',
                complete: '村長把北境家書收進城鎮紀錄。那不是戰報，卻讓所有人第一次真的聽見北方。'
            }
        },
        {
            id: 'commission_northern_letter_002',
            name: '沒有寄出的回信',
            type: QuestType.COMMISSION,
            npc: 'village_elder',
            chapter: 3,
            icon: '📮',
            trigger: {
                type: 'npc_story',
                npc: 'village_elder',
                afterQuest: 'commission_northern_letter',
                duringQuest: 'main_012',
                reason: '北境家書被歸檔後，村長才找到城裡沒寄出的回信，讓古龍線從戰場再回到城鎮裡等待的人。'
            },
            description: '村長找到一封沒有寄出的回信。寫信的人沒有要求你復仇，只請你確認北境路線是否還能把一句「我知道了」送回去。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'drake', count: 2, description: '擊退守著熱痕路線的幼龍 2 隻' },
                { type: ObjectiveType.COLLECT, target: 'dragon_tooth', count: 1, description: '帶回龍牙 1 枚，證明回信路線已被龍族封鎖' }
            ],
            rewards: {
                gold: 380,
                exp: 250,
                items: ['unsent_reply'],
                materials: [
                    { id: 'wyvern_wing', quantity: 1 }
                ]
            },
            unlocks: [],
            requiredLevel: 22,
            dialogue: {
                start: '村長請你追查那封沒有寄出的回信。北境的故事不能只停在「他們求救」，也要讓城鎮承認「我們聽見了」。',
                complete: '回信被收進城鎮紀錄。它仍然送不到北方，但等待的人終於知道，沉默不是沒人在乎。'
            }
        },
        {
            id: 'commission_last_soup',
            name: '最後一鍋湯',
            type: QuestType.COMMISSION,
            npc: 'herbalist',
            chapter: 3,
            icon: '🍲',
            trigger: {
                type: 'npc_story',
                npc: 'herbalist',
                duringQuest: 'main_014',
                reason: '封印碎裂後避難者湧入城鎮，藥師才會把補給與熱湯視為另一種治療。'
            },
            description: '深淵裂口開啟後，城鎮廚房開始收留避難者。藥師說藥水能救傷口，但熱湯能先阻止人心裂開。',
            objectives: [
                { type: ObjectiveType.COLLECT, target: 'raw_meat', count: 6, description: '帶回可食用肉 6 份，補上避難者廚房' },
                { type: ObjectiveType.COLLECT, target: 'fire_essence', count: 1, description: '帶回火焰精華 1 份，維持廚房爐火' },
                { type: ObjectiveType.KILL, target: 'demon_soldier', count: 3, description: '擊退靠近補給路線的深淵士兵 3 名' }
            ],
            rewards: {
                gold: 300,
                exp: 240,
                items: ['last_soup_ladle'],
                materials: [
                    { id: 'life_seed', quantity: 1 },
                    { id: 'health_potion_s', quantity: 2 }
                ]
            },
            unlocks: [],
            requiredLevel: 27,
            dialogue: {
                start: '藥師請你替避難者廚房找補給。這不是史詩，但世界快燒起來時，一碗熱湯很可能比預言有用。',
                complete: '廚房的爐火重新亮起。避難者沒有因此不害怕，但至少有人先把碗端穩了。'
            }
        },
        {
            id: 'commission_coast_lamplighter',
            name: '守燈人的油壺',
            type: QuestType.COMMISSION,
            npc: 'town_scholar',
            chapter: 2,
            icon: '🕯️',
            trigger: {
                type: 'npc_story',
                npc: 'town_scholar',
                afterQuest: 'commission_drowned_bell_insomnia',
                duringQuest: 'main_009',
                reason: '沉鐘聲被記錄後，書記才敢說海岸守燈人塔維一直用錯拍子的燈號引導倖存者。'
            },
            description: '守燈人塔維在海嘯後沒有離開燈塔。他怕黑，也怕承認自己聽不懂沉鐘聲，所以把每晚的燈號都點得很亮，亮到亡魂也跟著回岸。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'ghost', count: 2, description: '驅散跟著燈號回岸的亡魂 2 名' },
                { type: ObjectiveType.COLLECT, target: 'spirit_essence', count: 2, description: '收集靈質 2 份，讓書記校正燈號節奏' }
            ],
            rewards: {
                gold: 240,
                exp: 150,
                items: ['lamplighter_oil'],
                materials: [
                    { id: 'frost_crystal', quantity: 1 }
                ]
            },
            unlocks: [],
            requiredLevel: 12,
            dialogue: {
                start: '書記請你替守燈人塔維校正海岸燈號。這不是英雄傳說，只是一個怕黑的人還在硬撐。',
                complete: '塔維的燈號終於不再把亡魂引回岸邊。書記把他的名字寫進海岸紀錄，旁邊畫了一盞很小的燈。'
            }
        },
        {
            id: 'commission_broken_standard',
            name: '斷旗手芙蕾',
            type: QuestType.COMMISSION,
            npc: 'village_elder',
            chapter: 3,
            icon: '🏳️',
            trigger: {
                type: 'npc_story',
                npc: 'village_elder',
                duringQuest: 'main_014',
                reason: '深淵前鋒抵達後，北境斷旗手芙蕾把殘旗送回城鎮，證明前線不是傳聞。'
            },
            description: '芙蕾曾負責把撤退旗舉到最後一刻。她不是不害怕，只是手抖得太厲害時，旗反而會看起來很用力。她請你奪回旗杆上的惡魔角飾，讓倖存者知道撤退不是潰逃。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'demon_soldier', count: 4, description: '擊退奪旗的深淵士兵 4 名' },
                { type: ObjectiveType.COLLECT, target: 'demon_horn', count: 2, description: '取回惡魔角飾 2 個，修補斷旗' }
            ],
            rewards: {
                gold: 380,
                exp: 280,
                items: ['frey_broken_standard'],
                materials: [
                    { id: 'soul_fragment', quantity: 1 }
                ]
            },
            unlocks: ['commission_broken_standard_002'],
            requiredLevel: 27,
            dialogue: {
                start: '村長請你協助斷旗手芙蕾。她帶回的不是捷報，而是一面還沒承認自己輸掉的旗。',
                complete: '斷旗被重新掛上城門。芙蕾沒有笑，但她終於把手從旗杆上放開。'
            }
        },
        {
            id: 'commission_broken_standard_002',
            name: '旗影下的點名',
            type: QuestType.COMMISSION,
            npc: 'village_elder',
            chapter: 3,
            icon: '📜',
            trigger: {
                type: 'npc_story',
                npc: 'village_elder',
                afterQuest: 'commission_broken_standard',
                duringQuest: 'main_014',
                reason: '斷旗重新掛上城門後，芙蕾才願意把撤退名單交出來，讓士氣不只停在象徵物上。'
            },
            description: '斷旗掛回城門後，芙蕾交出一份被汗水泡皺的撤退名單。她不想被稱作英雄，只想確認那些沒回來的人不是被旗影蓋住。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'demon_soldier', count: 5, description: '擊退追著撤退線而來的深淵士兵 5 名' },
                { type: ObjectiveType.COLLECT, target: 'demon_horn', count: 1, description: '帶回魔族角 1 個，確認追兵批次已被截斷' }
            ],
            rewards: {
                gold: 430,
                exp: 310,
                items: ['retreat_rollcall'],
                materials: [
                    { id: 'soul_fragment', quantity: 1 },
                    { id: 'demonic_steel', quantity: 1 }
                ]
            },
            unlocks: [],
            requiredLevel: 28,
            dialogue: {
                start: '村長請你替芙蕾確認撤退名單。旗掛起來能穩住人心，點名則能讓失散的人不被戰報吃掉。',
                complete: '芙蕾把名單念完。城門下沒有人鼓掌，但所有人都知道，有些名字接下來要被找回來。'
            }
        },
        {
            id: 'commission_scholar_last_index',
            name: '書記的最後索引',
            type: QuestType.COMMISSION,
            npc: 'town_scholar',
            chapter: 3,
            icon: '📚',
            trigger: {
                type: 'npc_story',
                npc: 'town_scholar',
                duringQuest: 'main_015',
                reason: '魔王阿薩謝爾現身後，書記決定先把活人的名字編成索引，而不是替所有人寫墓誌銘。'
            },
            description: '書記一直相信只要把事情記清楚，世界就不會完全失控。直到深淵裂開，他才發現自己最害怕的不是死亡，而是大家死後只剩一堆沒有順序的紙。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'demon_general', count: 1, description: '擊退深淵將領 1 名，取回被奪走的索引封皮' },
                { type: ObjectiveType.COLLECT, target: 'abyssal_shard', count: 2, description: '收集深淵碎片 2 份，封住索引上的黑印' }
            ],
            rewards: {
                gold: 520,
                exp: 360,
                items: ['living_index'],
                materials: [
                    { id: 'world_shard', quantity: 1 }
                ]
            },
            unlocks: [],
            requiredLevel: 30,
            dialogue: {
                start: '書記請你替他取回最後索引的封皮。他說這不是為了歷史，是為了明天醒來的人還能知道誰少了。',
                complete: '最後索引被封好。書記把筆放下時手還在抖，但字跡比平常更穩。'
            }
        },

        // 賭場老闆委託
        {
            id: 'commission_casino_001',
            name: '帳房瑪洛的假勝率',
            type: QuestType.COMMISSION,
            npc: 'street_beggar',
            chapter: 2,
            icon: '🎰',
            trigger: {
                type: 'npc_story',
                npc: 'street_beggar',
                duringQuest: 'main_011',
                reason: '灰燼男爵的走私帳冊流入城鎮後，賭場帳房瑪洛發現勝率被人做成洗錢暗號。'
            },
            description: '賭場帳房瑪洛不相信運氣。她說最近每張賭桌的勝率都像被某隻看不見的手拉直，巷口流浪者把這件事當成灰燼帳冊的延伸線索交給你。',
            objectives: [
                { type: ObjectiveType.GAMBLE_WIN, target: 'slots', count: 5, description: '在老虎機獲勝 5 次，記錄被調整過的派彩節奏' },
                { type: ObjectiveType.GAMBLE_WIN, target: 'dice', count: 5, description: '在骰子獲勝 5 次，比對瑪洛帳冊上的假勝率' }
            ],
            rewards: {
                gold: 240,
                exp: 140,
                items: ['vip_card', 'marlo_odds_sheet']
            },
            unlocks: [],
            dialogue: {
                start: '巷口流浪者把瑪洛的帳冊暗記交給你，要你去賭場確認勝率是否被人動過。',
                complete: '你確認賭桌勝率被做成暗號。瑪洛沒有鬆一口氣，因為暗號指向黑曜石要塞。'
            }
        },
        {
            id: 'commission_casino_002',
            name: '最後一夜的籌碼',
            type: QuestType.COMMISSION,
            npc: 'street_beggar',
            chapter: 3,
            icon: '🎰',
            trigger: {
                type: 'npc_story',
                npc: 'street_beggar',
                afterQuest: 'commission_casino_001',
                duringQuest: 'main_014',
                reason: '深淵前鋒抵達後，賭場被臨時改成避難籌款所，瑪洛需要把最後一夜的籌碼換成補給。'
            },
            description: '深淵裂口打開後，賭場不再只是賭場。瑪洛把籌碼換成補給券，請你在賭桌上把人心穩住，順便把黑錢逼出來。',
            objectives: [
                { type: ObjectiveType.GAMBLE_PROFIT, target: 'any', count: 1000, description: '在賭場累計盈利 1000 枚籌碼，作為避難補給基金' }
            ],
            rewards: {
                gold: 500,
                exp: 320,
                items: ['relief_voucher']
            },
            unlocks: [],
            dialogue: {
                start: '巷口流浪者說，瑪洛把賭場最後一夜的帳冊留給你，這一次贏錢不是表演，而是讓人明天還有乾糧。',
                complete: '補給基金湊齊了。瑪洛在帳冊最後寫了一行：如果明天還有賭桌，希望大家只是為了好玩。'
            }
        },

        // 神秘商人委託
        {
            id: 'commission_merchant_001',
            name: '黑市收藏家的標籤',
            type: QuestType.COMMISSION,
            npc: 'street_beggar',
            chapter: 2,
            icon: '🎭',
            trigger: {
                type: 'vendor_item',
                interactionId: 'merchant_ancient_coin',
                reason: '你交出古代錢幣後，暗巷裡的收藏家伊文承認自己在追一批灰燼男爵的黑市標籤。'
            },
            description: '黑市收藏家伊文不是單純收破爛。他要詛咒碎片，是因為那種碎片會附在走私標籤上，能證明灰燼男爵的貨從哪裡流進城鎮。',
            objectives: [
                { type: ObjectiveType.COLLECT, target: 'cursed_shard', count: 1, description: '取得詛咒碎片 1 個，讓伊文辨認黑市標籤' }
            ],
            rewards: {
                gold: 0,
                items: ['mystery_box', 'black_market_ticket']
            },
            unlocks: [],
            dialogue: {
                start: '暗巷收藏家伊文請你帶回詛咒碎片，確認灰燼男爵的走私標籤。',
                complete: '伊文收下碎片後，黑市門後傳來箱鎖打開的聲音。他說這不是報酬，是下一個麻煩的押金。'
            }
        }
    ],

    // ==================== 隱藏任務 ====================
    hidden: [
        {
            id: 'hidden_broke',
            name: '一無所有',
            type: QuestType.HIDDEN,
            npc: 'street_beggar',
            icon: '💸',
            description: '當你失去一切時，或許能發現新的可能...',
            trigger: {
                type: 'gold',
                condition: 'equal',
                value: 0
            },
            objectives: [
                { type: ObjectiveType.TALK, target: 'beggar', count: 1, description: '與乞丐對話' }
            ],
            rewards: {
                items: ['beggars_wisdom']
            },
            dialogue: {
                start: '你也淪落到這個地步了嗎？來，我教你一些生存的智慧...',
                complete: '記住，真正的財富不在口袋裡。'
            }
        },
        {
            id: 'hidden_death_loop',
            name: '死亡輪迴',
            type: QuestType.HIDDEN,
            icon: '💀',
            description: '在無盡的死亡中，你發現了某些規律...',
            trigger: {
                type: 'death_count',
                condition: 'gte',
                value: 10
            },
            objectives: [
                { type: ObjectiveType.KILL, target: 'any', count: 1, description: '在下次戰鬥中獲勝' }
            ],
            rewards: {
                items: ['phoenix_feather']
            },
            dialogue: {
                start: '死亡...不是終點。你開始明白了。',
                complete: '從灰燼中重生，這就是你的命運。'
            }
        },
        {
            id: 'hidden_gambler_ruin',
            name: '賭徒的末路',
            type: QuestType.HIDDEN,
            icon: '🎲',
            description: '連續的失敗讓你看清了賭博的本質...',
            trigger: {
                type: 'gamble_loss_streak',
                condition: 'gte',
                value: 10
            },
            objectives: [
                { type: ObjectiveType.GAMBLE_WIN, target: 'any', count: 1, description: '再贏一次' }
            ],
            rewards: {
                items: ['gamblers_fallacy']
            },
            dialogue: {
                start: '都說賭博害人...但你還是要繼續嗎？',
                complete: '有時候，堅持到底也是一種勝利。'
            }
        },
        {
            id: 'hidden_dark_deal',
            name: '暗桌契約',
            type: QuestType.HIDDEN,
            icon: '😈',
            description: '你在賭場暗桌付出血價後，惡魔莊家的契約開始浮出字跡。',
            trigger: {
                type: 'dark_table_loss',
                condition: 'gte',
                value: 1
            },
            objectives: [
                { type: ObjectiveType.GAMBLE_WIN, target: 'dark_table', count: 1, description: '回到暗桌贏下一局，逼莊家交出契約正文' }
            ],
            rewards: {
                items: ['demon_contract']
            },
            dialogue: {
                start: '暗桌已經記住你的血。巷口流浪者要你回去贏下一局，把契約正文逼出來。',
                complete: '契約被你拿回來了。它不像戰利品，比較像一封很不禮貌的邀請函。'
            }
        },
        {
            id: 'hidden_lucky_seven',
            name: '幸運七',
            type: QuestType.HIDDEN,
            icon: '7️⃣',
            description: '連續中大獎的你，引起了某人的注意...',
            trigger: {
                type: 'jackpot_count',
                condition: 'gte',
                value: 3
            },
            objectives: [
                { type: ObjectiveType.GAMBLE_WIN, target: 'slots', count: 7, description: '在老虎機連續獲勝 7 次' }
            ],
            rewards: {
                items: ['lucky_charm_7']
            },
            dialogue: {
                start: '七...這個數字似乎與你有緣。',
                complete: '幸運之神眷顧著你。'
            }
        },
        {
            id: 'hidden_max_enhance',
            name: '鍛造大師',
            type: QuestType.HIDDEN,
            icon: '🔨',
            description: '當裝備達到極限時，新的境界將會展開...',
            trigger: {
                type: 'enhance_level',
                condition: 'gte',
                value: 10
            },
            objectives: [
                { type: ObjectiveType.ENHANCE, target: 'legendary', count: 1, description: '強化傳說裝備 1 次' }
            ],
            rewards: {
                items: ['transcend_stone']
            },
            dialogue: {
                start: '+10 不是終點，只是新的起點...',
                complete: '你已經超越了凡人的境界。'
            }
        },
        {
            id: 'hidden_dungeon_master',
            name: '副本征服者',
            type: QuestType.HIDDEN,
            icon: '🏆',
            description: '當你征服了所有副本，傳說中的稱號將屬於你...',
            trigger: {
                type: 'dungeon_clear_all',
                condition: 'equal',
                value: true
            },
            objectives: [
                { type: ObjectiveType.DUNGEON_CLEAR, target: 'cave', count: 1, description: '通關幽暗洞窟' },
                { type: ObjectiveType.DUNGEON_CLEAR, target: 'snow', count: 1, description: '通關冰封雪峰' },
                { type: ObjectiveType.DUNGEON_CLEAR, target: 'ruins', count: 1, description: '通關遠古遺跡' },
                { type: ObjectiveType.DUNGEON_CLEAR, target: 'jungle', count: 1, description: '通關迷霧叢林' },
                { type: ObjectiveType.DUNGEON_CLEAR, target: 'hell', count: 1, description: '通關煉獄深淵' }
            ],
            rewards: {
                gold: 5000,
                exp: 2000,
                items: ['dungeon_master_badge']
            },
            dialogue: {
                start: '五大副本的征服者...這是屬於真正英雄的稱號。',
                complete: '你已經證明了自己的實力！副本征服者的稱號實至名歸！'
            }
        }
    ]
};

/**
 * 獨特道具定義（任務獎勵專用）
 */
export const QuestRewardItems = {
    // 主線獎勵
    starter_sword: {
        id: 'starter_sword',
        name: '冒險者之劍',
        icon: '🗡️',
        type: EquipmentType.WEAPON,
        rarity: ItemRarity.UNCOMMON,
        stats: {
            attack: 12
        },
        description: '每個英雄旅程的起點。',
        isQuestReward: true
    },
    enhance_stone: {
        id: 'enhance_stone',
        name: '強化石',
        icon: '💎',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        description: '使用後，下次強化成功率 +20%。',
        isQuestReward: true
    },
    lucky_coin: {
        id: 'lucky_coin',
        name: '幸運金幣',
        icon: '🪙',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.RARE,
        stats: {
            attack: 0,
            defense: 0,
            critChance: 0.05
        },
        description: '據說是從賭場贏來的第一枚金幣，會帶來好運。',
        isQuestReward: true
    },
    rare_material_box: {
        id: 'rare_material_box',
        name: '稀有素材盒',
        icon: '📦',
        type: ItemType.KEY,
        rarity: ItemRarity.RARE,
        description: '開啟後可獲得隨機稀有素材。',
        isQuestReward: true
    },
    fate_crystal: {
        id: 'fate_crystal',
        name: '命運水晶',
        icon: '🔮',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.EPIC,
        stats: {
            attack: 5,
            defense: 5
        },
        description: '能夠影響命運的神秘水晶。隨機事件獎勵 +20%。',
        isQuestReward: true
    },
    legendary_weapon_box: {
        id: 'legendary_weapon_box',
        name: '傳說武器寶箱',
        icon: '👑',
        type: ItemType.KEY,
        rarity: ItemRarity.LEGENDARY,
        description: '開啟獲得隨機傳說武器！',
        isQuestReward: true
    },
    silver_thread_hook: {
        id: 'silver_thread_hook',
        name: '銀絲反鉤',
        icon: '🪝',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.RARE,
        stats: {
            attack: 4,
            critChance: 0.06
        },
        description: '用銀鐮伏獵者的陷絲反製成的鉤飾。它提醒你，讀懂陷阱的人也能把陷阱變成武器。',
        specialEffects: [
            { type: AffixStat.DODGE_CHANCE, value: 0.04 }
        ],
        isQuestReward: true
    },
    black_bark_guardian_core: {
        id: 'black_bark_guardian_core',
        name: '黑樹守衛核心',
        icon: '🪵',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.RARE,
        stats: {
            defense: 6
        },
        description: '古樹守衛胸口留下的焦黑核心。仍有微弱生命力，能讓傷口慢慢合攏。',
        specialEffects: [
            { type: AffixStat.HP_REGEN, value: 0.01 },
            { type: 'natureBonus', value: 0.08 }
        ],
        isQuestReward: true
    },
    blood_moon_pendant: {
        id: 'blood_moon_pendant',
        name: '血月折角墜',
        icon: '🌙',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.EPIC,
        stats: {
            attack: 7,
            critChance: 0.07
        },
        description: '血月角鹿斷角磨成的墜飾。它不像戰利品，更像把失控痛覺繫在胸口的提醒。',
        specialEffects: [
            { type: AffixStat.LIFESTEAL, value: 0.02 }
        ],
        isQuestReward: true
    },
    mist_tablet_rubbing: {
        id: 'mist_tablet_rubbing',
        name: '霧碑拓片',
        icon: '🪨',
        type: ItemType.KEY,
        rarity: ItemRarity.RARE,
        description: '從霧碑丘陵拓下的石紋。它無法替你打贏戰鬥，卻能讓高威脅區的路線少一點盲走。',
        specialEffects: [
            { type: 'mapScout', value: 1 },
            { type: 'eventClueBonus', value: 0.08 }
        ],
        isQuestReward: true
    },
    thorn_trade_bead: {
        id: 'thorn_trade_bead',
        name: '荊棘交換珠',
        icon: '🌿',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.RARE,
        stats: {
            defense: 4
        },
        description: '女巫交易網裡流通的綠色珠子。握著它時，毒霧像認得你一樣退開半步。',
        specialEffects: [
            { type: 'poisonMitigation', value: 0.18 }
        ],
        isQuestReward: true
    },
    deep_sea_orb: {
        id: 'deep_sea_orb',
        name: '沉鐘海珠',
        icon: '🔵',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.EPIC,
        stats: {
            defense: 8
        },
        description: '沉鐘神諭失去的深海寶珠殘光。它讓冰冷與恐懼都慢一拍抵達。',
        specialEffects: [
            { type: 'coldMitigation', value: 0.16 },
            { type: AffixStat.ICE, value: 0.08 }
        ],
        isQuestReward: true
    },
    lich_staff_remnant: {
        id: 'lich_staff_remnant',
        name: '巫妖杖芯殘片',
        icon: '🦴',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.EPIC,
        stats: {
            attack: 8,
            critDamage: 0.18
        },
        description: '巫妖法杖裡折出的杖芯。它仍會記得古墓裡那些錯誤命令的節奏。',
        specialEffects: [
            { type: 'undeadBonus', value: 0.18 }
        ],
        isQuestReward: true
    },
    ash_ledger_page: {
        id: 'ash_ledger_page',
        name: '灰燼帳冊頁',
        icon: '📒',
        type: ItemType.KEY,
        rarity: ItemRarity.RARE,
        description: '灰燼男爵地宮裡撕下的帳頁。黑市商人討厭它，因為它知道太多價格的真相。',
        specialEffects: [
            { type: 'blackMarketPriceReduction', value: 0.08 },
            { type: 'casinoOddsReveal', value: true }
        ],
        isQuestReward: true
    },
    dragon_nest_resonance: {
        id: 'dragon_nest_resonance',
        name: '龍巢共鳴石',
        icon: '🐉',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.EPIC,
        stats: {
            attack: 5,
            defense: 5
        },
        description: '追上龍巢之路後留下的熱痕石。面對菁英與首領時，它會先替你穩住呼吸。',
        specialEffects: [
            { type: 'bossDamageReduction', value: 0.04 }
        ],
        isQuestReward: true
    },
    abyss_vanguard_oath: {
        id: 'abyss_vanguard_oath',
        name: '深淵先鋒誓痕',
        icon: '😈',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.EPIC,
        stats: {
            attack: 6,
            defense: 10
        },
        description: '從深淵先鋒身上剝下的誓痕。它像一塊戰前警告，提醒你終局不是單純更大的怪物。',
        specialEffects: [
            { type: 'demonMitigation', value: 0.12 },
            { type: 'bossDamageReduction', value: 0.05 }
        ],
        isQuestReward: true
    },

    // 懸賞獎勵
    wolf_fang: {
        id: 'wolf_fang',
        name: '狼牙項鍊',
        icon: '🦷',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.UNCOMMON,
        stats: {
            attack: 3,
            critChance: 0.08
        },
        description: '用狼牙製成的項鍊，散發著野性的氣息。',
        isQuestReward: true
    },
    assassin_dagger: {
        id: 'assassin_dagger',
        name: '刺客匕首',
        icon: '🗡️',
        type: EquipmentType.WEAPON,
        rarity: ItemRarity.EPIC,
        stats: {
            attack: 18,
            critChance: 0.25,
            critDamage: 2.0,
            weaponSpeed: 1.5,
            attackSpeed: 1.8
        },
        description: '暗影刺客的武器，追求一擊必殺。',
        isQuestReward: true
    },

    // 委託獎勵
    enhance_scroll: {
        id: 'enhance_scroll',
        name: '強化秘卷',
        icon: '📜',
        type: ItemType.SCROLL,
        rarity: ItemRarity.RARE,
        description: '使用後，下次強化必定成功！',
        specialEffects: [
            { type: 'guaranteeEnhance', value: true }
        ],
        isQuestReward: true
    },
    master_hammer: {
        id: 'master_hammer',
        name: '大師之錘',
        icon: '🔨',
        type: ItemType.KEY,
        rarity: ItemRarity.EPIC,
        description: '裝備時，強化成功率永久 +10%。',
        specialEffects: [],
        isQuestReward: true
    },
    vip_card: {
        id: 'vip_card',
        name: '賭場 VIP 卡',
        icon: '💳',
        type: ItemType.KEY,
        rarity: ItemRarity.RARE,
        description: '在賭場享有特殊待遇。',
        specialEffects: [],
        isQuestReward: true
    },
    loaded_dice: {
        id: 'loaded_dice',
        name: '幸運骰子',
        icon: '🎲',
        type: ItemType.KEY,
        rarity: ItemRarity.EPIC,
        description: '「這骰子好像有點重...」骰子遊戲勝率 +5%。',
        specialEffects: [
            { type: 'diceBonus', value: 0.05 }
        ],
        isQuestReward: true
    },
    mystery_box: {
        id: 'mystery_box',
        name: '神秘寶盒',
        icon: '❓',
        type: ItemType.KEY,
        rarity: ItemRarity.EPIC,
        description: '不知道裡面是什麼...開啟看看？',
        isQuestReward: true
    },
    gate_patrol_map: {
        id: 'gate_patrol_map',
        name: '南門巡路圖',
        icon: '🗺️',
        type: ItemType.KEY,
        rarity: ItemRarity.UNCOMMON,
        description: '守衛把磨破靴底時走過的路線畫在羊皮紙上。短任務的報酬不華麗，但讓近郊路標更像有人真的巡過。',
        specialEffects: [
            { type: 'mapScout', value: 1 }
        ],
        isQuestReward: true
    },
    field_medic_notes: {
        id: 'field_medic_notes',
        name: '野戰醫術手記',
        icon: '📗',
        type: ItemType.BOOK,
        rarity: ItemRarity.RARE,
        passiveEffectId: 'field_medic',
        description: '藥師把採藥籃與毒霧症狀整理成手記。取得後可解鎖野戰醫術戰術。',
        specialEffects: [
            { type: 'healingReceived', value: 0.08 }
        ],
        isQuestReward: true
    },
    leah_stitched_name: {
        id: 'leah_stitched_name',
        name: '莉雅縫名帶',
        icon: '🧵',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.RARE,
        stats: {
            defense: 3
        },
        description: '失蹤採藥人莉雅縫在籃底的名字。毒霧靠近時，線結會微微收緊。',
        specialEffects: [
            { type: 'poisonMitigation', value: 0.12 }
        ],
        isQuestReward: true
    },
    julian_bookmark: {
        id: 'julian_bookmark',
        name: '朱利安書籤',
        icon: '🔖',
        type: ItemType.KEY,
        rarity: ItemRarity.UNCOMMON,
        description: '墓園找到的舊書籤，上面夾著一行未寫完的索引。它不強大，但讓書記的失蹤研究重新有了頁碼。',
        specialEffects: [
            { type: 'puzzleClueBonus', value: 1 }
        ],
        isQuestReward: true
    },
    julian_margin_notes: {
        id: 'julian_margin_notes',
        name: '朱利安邊註',
        icon: '📖',
        type: ItemType.BOOK,
        rarity: ItemRarity.RARE,
        passiveEffectId: 'ruin_literacy',
        description: '朱利安在書頁邊緣留下的遺跡讀法。取得後可解鎖碑文識讀戰術。',
        specialEffects: [
            { type: 'trapDamageReduction', value: 0.1 }
        ],
        isQuestReward: true
    },
    bell_rhythm_charm: {
        id: 'bell_rhythm_charm',
        name: '沉鐘節拍符',
        icon: '🔔',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.RARE,
        stats: {
            defense: 4
        },
        description: '從海邊沉鐘的節拍裡校出的護符。它不能讓海安靜，但能讓冰冷與恐懼慢一點纏上來。',
        specialEffects: [
            { type: 'coldMitigation', value: 0.1 },
            { type: 'fearResist', value: 0.12 }
        ],
        isQuestReward: true
    },
    ash_nameplate: {
        id: 'ash_nameplate',
        name: '灰燼名牌',
        icon: '🏷️',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.RARE,
        stats: {
            defense: 5
        },
        description: '灰燼帳冊裡被找回名字的人留下的舊名牌。它讓黑市價格和犧牲成本都不再只是數字。',
        specialEffects: [
            { type: 'blackMarketPriceReduction', value: 0.04 },
            { type: AffixStat.GOLD_BONUS, value: 0.04 }
        ],
        isQuestReward: true
    },
    craftsman_gouge: {
        id: 'craftsman_gouge',
        name: '工匠刻刀',
        icon: '🪛',
        type: ItemType.KEY,
        rarity: ItemRarity.RARE,
        stats: {
            attack: 3,
            defense: 3
        },
        description: '帳冊名單裡一位工匠最後留下的刻刀。強化時握著它，失手的線條會少一點。',
        specialEffects: [],
        isQuestReward: true
    },
    north_letter_seal: {
        id: 'north_letter_seal',
        name: '北境信封蠟印',
        icon: '✉️',
        type: ItemType.KEY,
        rarity: ItemRarity.RARE,
        description: '北境來信上被保留下來的蠟印。它證明遠方不是傳聞，而是一條真的會把人帶走的路。',
        specialEffects: [
            { type: 'eventClueBonus', value: 0.08 }
        ],
        isQuestReward: true
    },
    unsent_reply: {
        id: 'unsent_reply',
        name: '未寄出的回信',
        icon: '💌',
        type: ItemType.BOOK,
        rarity: ItemRarity.RARE,
        description: '一封寫到一半的回信，紙上沒有豪言壯語，只有讓人面對北境時不再發抖的句子。',
        specialEffects: [
            { type: 'bossDamageReduction', value: 0.03 }
        ],
        isQuestReward: true
    },
    last_soup_ladle: {
        id: 'last_soup_ladle',
        name: '最後一鍋湯杓',
        icon: '🥄',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.UNCOMMON,
        stats: {
            defense: 2
        },
        passiveEffectId: 'field_medic',
        description: '救濟廚房留下的湯杓。它很普通，但普通到足以提醒你治療不是奇蹟，而是有人願意多煮一鍋。',
        specialEffects: [
            { type: 'healingReceived', value: 0.1 }
        ],
        isQuestReward: true
    },
    lamplighter_oil: {
        id: 'lamplighter_oil',
        name: '守燈人油瓶',
        icon: '🛢️',
        type: ItemType.KEY,
        rarity: ItemRarity.RARE,
        description: '海岸守燈人省下的最後一瓶燈油。夜路、霧路和潮聲都會因此少一點惡意。',
        specialEffects: [
            { type: 'darkVision', value: 0.16 },
            { type: 'eventClueBonus', value: 0.06 }
        ],
        isQuestReward: true
    },
    frey_broken_standard: {
        id: 'frey_broken_standard',
        name: '弗雷斷旗',
        icon: '🚩',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.RARE,
        stats: {
            attack: 4,
            defense: 4
        },
        description: '一面被折斷後仍被帶回來的旗。它不再指揮隊伍，只提醒你別把撤退看成失敗。',
        specialEffects: [],
        isQuestReward: true
    },
    retreat_rollcall: {
        id: 'retreat_rollcall',
        name: '撤退點名冊',
        icon: '📋',
        type: ItemType.BOOK,
        rarity: ItemRarity.RARE,
        passiveEffectId: 'boss_composure',
        description: '弗雷隊伍撤退時的點名冊。每一個名字都讓下一次面對強敵時更穩一點。',
        specialEffects: [
            { type: 'bossDamageReduction', value: 0.04 }
        ],
        isQuestReward: true
    },
    living_index: {
        id: 'living_index',
        name: '活索引',
        icon: '📚',
        type: ItemType.BOOK,
        rarity: ItemRarity.EPIC,
        passiveEffectId: 'boss_composure',
        description: '書記把最後索引裝訂回活人的順序裡。取得後可解鎖王敵定心戰術。',
        specialEffects: [
            { type: 'bossDamageReduction', value: 0.06 },
            { type: 'puzzleClueBonus', value: 1 }
        ],
        isQuestReward: true
    },
    marlo_odds_sheet: {
        id: 'marlo_odds_sheet',
        name: '瑪洛修正勝率表',
        icon: '📈',
        type: ItemType.KEY,
        rarity: ItemRarity.RARE,
        description: '瑪洛偷偷塞來的勝率表。它不能保證你贏，但能讓你看懂賭場暗藏的規律。',
        specialEffects: [
            { type: 'casinoOddsReveal', value: true }
        ],
        isQuestReward: true
    },
    black_market_ticket: {
        id: 'black_market_ticket',
        name: '黑市籤',
        icon: '🎟️',
        type: ItemType.KEY,
        rarity: ItemRarity.RARE,
        description: '用舊羊皮紙裁成的籤，背面有一行幾乎看不清的暗號。',
        specialEffects: [
            { type: 'blackMarketAccess', value: true }
        ],
        isQuestReward: true
    },
    relief_voucher: {
        id: 'relief_voucher',
        name: '避難補給券',
        icon: '🎫',
        type: ItemType.KEY,
        rarity: ItemRarity.RARE,
        description: '賭場把一部分黑錢換成乾糧與藥品後留下的憑證。這可能是城裡最荒唐的善行。',
        specialEffects: [
            { type: 'healingReceived', value: 0.06 },
            { type: 'townReliefCredit', value: true }
        ],
        isQuestReward: true
    },

    // 隱藏任務獎勵
    beggars_wisdom: {
        id: 'beggars_wisdom',
        name: '乞丐的智慧',
        icon: '📿',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.RARE,
        description: '「一無所有，反而看得更清。」金幣獲取 +10%。',
        specialEffects: [
            { type: AffixStat.GOLD_BONUS, value: 0.1 }
        ],
        isQuestReward: true
    },
    phoenix_feather: {
        id: 'phoenix_feather',
        name: '鳳凰羽毛',
        icon: '🪶',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.LEGENDARY,
        description: '死亡時自動復活一次，HP 恢復 30%。每場戰鬥只能觸發一次。',
        specialEffects: [
            { type: 'autoRevive', value: true },
            { type: 'reviveHp', value: 0.3 }
        ],
        isQuestReward: true
    },
    gamblers_fallacy: {
        id: 'gamblers_fallacy',
        name: '賭徒謬誤',
        icon: '🃏',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.EPIC,
        description: '「連輸這麼多次，下次一定會贏！」連敗後勝率大幅提升。',
        specialEffects: [
            { type: 'lossStreakBonus', value: true }
        ],
        isQuestReward: true
    },
    demon_contract: {
        id: 'demon_contract',
        name: '惡魔契約',
        icon: '📋',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.LEGENDARY,
        stats: {
            attack: 15,
            defense: 15
        },
        description: '攻擊力、防禦力 +15。但每場戰鬥開始時損失 5% HP。',
        specialEffects: [
            { type: 'battleHpCost', value: 0.05 }
        ],
        isQuestReward: true
    },
    lucky_charm_7: {
        id: 'lucky_charm_7',
        name: '七星護符',
        icon: '⭐',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.LEGENDARY,
        description: '幸運之神的眷顧。所有機率判定 +7%。',
        specialEffects: [
            { type: 'luckBonus', value: 0.07 }
        ],
        isQuestReward: true
    },
    transcend_stone: {
        id: 'transcend_stone',
        name: '超越之石',
        icon: '💠',
        type: ItemType.KEY,
        rarity: ItemRarity.LEGENDARY,
        description: '使用後，突破裝備的強化上限 (+10 → +15)。',
        specialEffects: [
            { type: 'transcendEnhance', value: true }
        ],
        isQuestReward: true
    },

    // ==================== 副本任務獎勵 ====================
    
    // 幽暗洞窟獎勵
    torch: {
        id: 'torch',
        name: '永恆火炬',
        icon: '🔥',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.UNCOMMON,
        description: '在黑暗副本中提供額外視野，降低被突襲機率。',
        specialEffects: [
            { type: 'darkVision', value: 0.3 }
        ],
        isQuestReward: true
    },
    bat_wing_cloak: {
        id: 'bat_wing_cloak',
        name: '蝙蝠翼披風',
        icon: '🦇',
        type: EquipmentType.EQUIPMENT,
        rarity: ItemRarity.RARE,
        stats: {
            defense: 8,
            critChance: 0.1
        },
        description: '由洞窟蝙蝠王的翅膀製成，在黑暗中更加敏捷。',
        specialEffects: [
            { type: AffixStat.DODGE_CHANCE, value: 0.05 },
            { type: 'darkBonus', value: 0.15 }
        ],
        isQuestReward: true
    },
    
    // 冰封雪峰獎勵
    cold_resist_potion: {
        id: 'cold_resist_potion',
        name: '抗寒藥劑',
        icon: '🧪',
        type: ItemType.POTION,
        rarity: ItemRarity.RARE,
        stackable: true,
        maxStack: 10,
        description: '使用後減緩寒氣累積速度 50%，持續整個副本。',
        specialEffects: [
            { type: 'coldResist', value: 0.5 }
        ],
        isQuestReward: true
    },
    frost_crown: {
        id: 'frost_crown',
        name: '冰霜王冠',
        icon: '👑',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.EPIC,
        stats: {
            attack: 10,
            defense: 5
        },
        description: '冰霜領主的王冠，賦予冰霜之力。攻擊時有機率凍結敵人。',
        specialEffects: [
            { type: AffixStat.ICE, value: 0.15 }
        ],
        isQuestReward: true
    },
    
    // 遠古遺跡獎勵
    ancient_key: {
        id: 'ancient_key',
        name: '古代鑰匙',
        icon: '🗝️',
        type: ItemType.KEY,
        rarity: ItemRarity.RARE,
        description: '可以開啟遺跡中的隱藏寶箱，獲得額外獎勵。',
        specialEffects: [
            { type: 'secretChest', value: true }
        ],
        isQuestReward: true
    },
    guardian_shield: {
        id: 'guardian_shield',
        name: '守護者之盾',
        icon: '🛡️',
        type: EquipmentType.EQUIPMENT,
        rarity: ItemRarity.EPIC,
        stats: {
            defense: 20
        },
        description: '遺跡守護者的古老盾牌，能夠抵擋強大的攻擊。',
        specialEffects: [
            { type: 'blockChance', value: 0.2 },
            { type: 'puzzleBonus', value: 0.2 }
        ],
        isQuestReward: true
    },
    
    // 迷霧叢林獎勵
    compass: {
        id: 'compass',
        name: '迷途指南針',
        icon: '🧭',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.RARE,
        description: '在迷霧叢林中不會迷路，總是指向正確的方向。',
        specialEffects: [
            { type: 'mazeNavigate', value: true }
        ],
        isQuestReward: true
    },
    jungle_heart: {
        id: 'jungle_heart',
        name: '叢林之心',
        icon: '💚',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.EPIC,
        stats: {
            attack: 8,
            defense: 8
        },
        description: '叢林女王的心臟結晶，蘊含自然的力量。',
        specialEffects: [
            { type: 'hpRegen', value: 0.02 },
            { type: 'natureBonus', value: 0.15 }
        ],
        isQuestReward: true
    },
    
    // 煉獄深淵獎勵
    fire_resist_potion: {
        id: 'fire_resist_potion',
        name: '抗火藥劑',
        icon: '🧪',
        type: ItemType.POTION,
        rarity: ItemRarity.RARE,
        stackable: true,
        maxStack: 10,
        description: '使用後減少灼燒傷害 50%，持續整個副本。',
        specialEffects: [
            { type: 'fireResist', value: 0.5 }
        ],
        isQuestReward: true
    },
    demon_slayer: {
        id: 'demon_slayer',
        name: '弒魔者',
        icon: '⚔️',
        type: EquipmentType.WEAPON,
        rarity: ItemRarity.LEGENDARY,
        stats: {
            attack: 35,
            critChance: 0.2,
            critDamage: 2.5,
            weaponSpeed: 1.2
        },
        description: '傳說中能夠斬殺惡魔的神劍。對惡魔類敵人傷害 +50%。',
        specialEffects: [
            { type: 'demonSlayer', value: 0.5 },
            { type: 'burnImmune', value: true }
        ],
        isQuestReward: true
    },
    
    // 每週挑戰獎勵
    dungeon_token: {
        id: 'dungeon_token',
        name: '副本代幣',
        icon: '🎖️',
        type: ItemType.CURRENCY,
        rarity: ItemRarity.UNCOMMON,
        stackable: true,
        maxStack: 999,
        description: '累積足夠的代幣可以兌換稀有道具。',
        isQuestReward: true
    },
    
    // 隱藏任務獎勵 - 副本征服者
    dungeon_master_badge: {
        id: 'dungeon_master_badge',
        name: '副本征服者徽章',
        icon: '🏆',
        type: ItemType.KEY,
        rarity: ItemRarity.LEGENDARY,
        stats: {
            attack: 20,
            defense: 20,
            critChance: 0.15
        },
        description: '征服五大副本的證明。全屬性大幅提升，所有副本獎勵 +25%。',
        specialEffects: [
            { type: AffixStat.ALL_STATS, value: 0.1 },
            { type: 'dungeonReward', value: 0.25 },
            { type: 'titleUnlock', value: 'dungeon_master' }
        ],
        isQuestReward: true
    }
};

/**
 * 根據 ID 獲取任務
 */
export function getQuestById(questId) {
    for (const category of Object.values(QuestDatabase)) {
        const quest = category.find(q => q.id === questId);
        if (quest) return quest;
    }
    return null;
}

/**
 * 獲取所有可用的初始任務
 */
export function getInitialQuests() {
    return [
        QuestDatabase.main[0] // main_001
    ];
}
