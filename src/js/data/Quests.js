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
                    { id: 'slime_jelly', quantity: 3 },
                    { id: 'beast_hide', quantity: 3 }
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
                items: ['health_potion_s'],
                materials: [
                    { id: 'iron_ore', quantity: 5 }
                ]
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
                exp: 60,
                items: ['old_armor'],
                materials: [
                    { id: 'wolf_pelt', quantity: 3 },
                    { id: 'wolf_fang', quantity: 3 }
                ]
            },
            unlocks: ['main_004', 'commission_forge_001'],
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
                materials: [
                    { id: 'spider_silk', quantity: 2 },
                    { id: 'poison_gland', quantity: 1 }
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
                materials: [
                    { id: 'ancient_bark', quantity: 3 },
                    { id: 'forest_essence', quantity: 1 },
                    { id: 'life_seed', quantity: 1 }
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
                materials: [
                    { id: 'life_seed', quantity: 2 },
                    { id: 'forest_essence', quantity: 1 },
                    { id: 'rare_metal', quantity: 1 }
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
                materials: [
                    { id: 'dark_crystal', quantity: 2 },
                    { id: 'ancient_rune', quantity: 1 }
                ]
            },
            unlocks: [],
            requiredLevel: 8,
            dialogue: {
                start: '霧碑丘陵不是單一事件。女巫、神諭、巫妖與人類貴族的問題會從這裡逐步展開。',
                complete: '你跨過第一章的邊境災害，開始看見整片大陸如何一起斷裂。'
            }
        },
        // ==================== 第四章：暗影入侵 (Lv.10-14) ====================
        {
            id: 'main_008',
            name: '暗影的氣息',
            type: QuestType.MAIN,
            chapter: 4,
            icon: '🌑',
            description: '巫妖的死亡引發了更大的危機。暗影軍團開始入侵...',
            objectives: [
                { type: ObjectiveType.KILL, target: 'shadow_soldier', count: 10, description: '擊敗暗影士兵 10 隻' }
            ],
            rewards: {
                gold: 400,
                exp: 250
            },
            unlocks: ['main_009'],
            requiredLevel: 10,
            dialogue: {
                start: '暗影軍團的先鋒部隊已經出現！阻止他們！',
                complete: '這只是前鋒...更多的敵人正在接近。'
            }
        },
        {
            id: 'main_009',
            name: '調查暗影據點',
            type: QuestType.MAIN,
            chapter: 4,
            icon: '🔍',
            description: '找出暗影軍團的據點，收集情報。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'shadow_archer', count: 8, description: '擊敗暗影弓手 8 隻' },
                { type: ObjectiveType.COLLECT, target: 'shadow_shard', count: 5, description: '收集暗影碎片 5 個' }
            ],
            rewards: {
                gold: 500,
                exp: 300,
                materials: [
                    { id: 'dark_steel', quantity: 2 },
                ]
            },
            unlocks: ['main_010'],
            requiredLevel: 11,
            dialogue: {
                start: '敵人的弓手正在掩護主力...先清除他們！',
                complete: '根據收集的情報，暗影軍團的指揮官就在前方。'
            }
        },
        {
            id: 'main_010',
            name: '擊敗暗影指揮官',
            type: QuestType.MAIN,
            chapter: 4,
            icon: '⚔️',
            description: '暗影軍團的指揮官必須被消滅！',
            objectives: [
                { type: ObjectiveType.KILL, target: 'shadow_mage', count: 3, description: '擊敗暗影法師 3 隻' },
                { type: ObjectiveType.KILL, target: 'shadow_commander', count: 1, description: '擊敗暗影指揮官' }
            ],
            rewards: {
                gold: 800,
                exp: 400
            },
            unlocks: ['main_011'],
            requiredLevel: 13,
            dialogue: {
                start: '指揮官就在前方...這將是一場硬仗！',
                complete: '指揮官被擊敗了，但暗影軍團還有更強大的存在...'
            }
        },
        // ==================== 第五章：古代遺跡 (Lv.14-18) ====================
        {
            id: 'main_011',
            name: '遺跡的秘密',
            type: QuestType.MAIN,
            chapter: 5,
            icon: '🏛️',
            description: '為了找到對抗暗影的力量，你必須深入古代遺跡。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'ancient_guardian', count: 5, description: '擊敗遺跡守衛 5 隻' },
                { type: ObjectiveType.EXPLORE, target: 'ruins', count: 3, description: '探索古代遺跡 3 次' }
            ],
            rewards: {
                gold: 600,
                exp: 350,
                materials: [
                    { id: 'mithril_ore', quantity: 2 },
                ]
            },
            unlocks: ['main_012'],
            requiredLevel: 14,
            dialogue: {
                start: '傳說古代文明留下了強大的力量...去尋找它！',
                complete: '這些機械守衛保護著什麼秘密？'
            }
        },
        {
            id: 'main_012',
            name: '符文的智慧',
            type: QuestType.MAIN,
            chapter: 5,
            icon: '📜',
            description: '破解古代符文，獲取遠古知識。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'crystal_golem', count: 5, description: '擊敗水晶魔像 5 隻' },
                { type: ObjectiveType.KILL, target: 'rune_keeper', count: 3, description: '擊敗符文守護者 3 隻' }
            ],
            rewards: {
                gold: 700,
                exp: 400,
                materials: [
                    { id: 'ancient_rune', quantity: 1 },
                    { id: 'pure_crystal', quantity: 1 }
                ]
            },
            unlocks: ['main_013'],
            requiredLevel: 16,
            dialogue: {
                start: '符文守護者掌握著古代的秘密...',
                complete: '古代符文揭示了泰坦的存在！'
            }
        },
        {
            id: 'main_013',
            name: '喚醒泰坦',
            type: QuestType.MAIN,
            chapter: 5,
            icon: '🗽',
            description: '遠古泰坦被喚醒了！這是獲取力量的考驗。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'ancient_titan', count: 1, description: '擊敗遠古泰坦' }
            ],
            rewards: {
                gold: 1200,
                exp: 600
            },
            unlocks: ['main_014'],
            requiredLevel: 17,
            dialogue: {
                start: '泰坦甦醒了...這是你的考驗！',
                complete: '你獲得了泰坦的認可，以及遠古的力量！'
            }
        },
        // ==================== 第六章：元素試煉 (Lv.18-22) ====================
        {
            id: 'main_014',
            name: '火之試煉',
            type: QuestType.MAIN,
            chapter: 6,
            icon: '🔥',
            description: '要對抗暗影，你需要掌握四大元素。首先是火焰。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'fire_elemental', count: 5, description: '擊敗火元素 5 隻' },
                { type: ObjectiveType.COLLECT, target: 'fire_essence', count: 3, description: '收集火焰精華 3 個' }
            ],
            rewards: {
                gold: 600,
                exp: 400,
                materials: [
                    { id: 'ember_stone', quantity: 2 }
                ]
            },
            unlocks: ['main_015'],
            requiredLevel: 18,
            dialogue: {
                start: '火焰代表著力量與毀滅。掌握它！',
                complete: '火之試煉通過！'
            }
        },
        {
            id: 'main_015',
            name: '冰與雷的試煉',
            type: QuestType.MAIN,
            chapter: 6,
            icon: '❄️',
            description: '繼續元素試煉：冰霜與雷電。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'ice_elemental', count: 5, description: '擊敗冰元素 5 隻' },
                { type: ObjectiveType.KILL, target: 'thunder_elemental', count: 5, description: '擊敗雷元素 5 隻' }
            ],
            rewards: {
                gold: 700,
                exp: 450,
                materials: [
                    { id: 'frost_crystal', quantity: 2 },
                    { id: 'storm_crystal', quantity: 2 }
                ]
            },
            unlocks: ['main_016'],
            requiredLevel: 19,
            dialogue: {
                start: '冰霜代表冷靜，雷電代表迅速。兩者缺一不可。',
                complete: '冰與雷的試煉通過！'
            }
        },
        {
            id: 'main_016',
            name: '元素之主',
            type: QuestType.MAIN,
            chapter: 6,
            icon: '🌈',
            description: '四大元素的考驗結束，面對元素之主！',
            objectives: [
                { type: ObjectiveType.KILL, target: 'earth_elemental', count: 5, description: '擊敗土元素 5 隻' },
                { type: ObjectiveType.KILL, target: 'elemental_lord', count: 1, description: '擊敗元素之主' }
            ],
            rewards: {
                gold: 1500,
                exp: 700,
                materials: [
                    { id: 'elemental_core', quantity: 1 },
                ]
            },
            unlocks: ['main_017'],
            requiredLevel: 21,
            dialogue: {
                start: '元素之主將測試你是否配得上這份力量...',
                complete: '你已經掌握了元素之力！現在，前往龍之山脈！'
            }
        },
        // ==================== 第七章：龍之山脈 (Lv.22-26) ====================
        {
            id: 'main_017',
            name: '龍的領域',
            type: QuestType.MAIN,
            chapter: 7,
            icon: '🏔️',
            description: '傳說中的龍族居住在高山之上。踏入他們的領域。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'wyvern', count: 5, description: '擊敗翼龍 5 隻' },
                { type: ObjectiveType.KILL, target: 'drake', count: 5, description: '擊敗幼龍 5 隻' }
            ],
            rewards: {
                gold: 800,
                exp: 500,
                items: ['wyvern_scale', 'drake_scale']
            },
            unlocks: ['main_018'],
            requiredLevel: 22,
            dialogue: {
                start: '龍之山脈充滿危險，但也藏著巨大的寶藏。',
                complete: '你已經證明了自己有資格面對真正的龍！'
            }
        },
        {
            id: 'main_018',
            name: '龍騎士的考驗',
            type: QuestType.MAIN,
            chapter: 7,
            icon: '🛡️',
            description: '龍騎士是龍族的守護者。擊敗他們才能見到古龍。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'dragon_knight', count: 3, description: '擊敗龍騎士 3 隻' },
                { type: ObjectiveType.COLLECT, target: 'dragon_knight_badge', count: 2, description: '收集龍騎士徽章 2 個' }
            ],
            rewards: {
                gold: 1000,
                exp: 600,
                items: ['dragon_scale_armor']
            },
            unlocks: ['main_019'],
            requiredLevel: 24,
            dialogue: {
                start: '龍騎士是龍族信任的戰士。擊敗他們是見到古龍的條件。',
                complete: '你獲得了龍騎士的認可！'
            }
        },
        {
            id: 'main_019',
            name: '古龍之戰',
            type: QuestType.MAIN,
            chapter: 7,
            icon: '🐲',
            description: '終於，你將面對古龍。這是獲取龍之力的最終考驗。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'elder_dragon', count: 1, description: '擊敗古龍' }
            ],
            rewards: {
                gold: 2500,
                exp: 1000
            },
            unlocks: ['main_020'],
            requiredLevel: 25,
            dialogue: {
                start: '古龍是這片山脈的霸主...準備好最終決戰！',
                complete: '古龍被擊敗了！你獲得了龍之力！但王都傳來緊急消息...'
            }
        },
        // ==================== 第八章：王都危機 (Lv.26-28) ====================
        {
            id: 'main_020',
            name: '王都告急',
            type: QuestType.MAIN,
            chapter: 8,
            icon: '🏰',
            description: '暗影軍團趁你在龍之山脈時進攻了王都！快回去！',
            objectives: [
                { type: ObjectiveType.KILL, target: 'shadow_assassin', count: 5, description: '擊敗暗影刺客 5 隻' },
                { type: ObjectiveType.KILL, target: 'shadow_soldier', count: 10, description: '擊敗暗影士兵 10 隻' }
            ],
            rewards: {
                gold: 1000,
                exp: 650,
                items: ['assassin_blade']
            },
            unlocks: ['main_021'],
            requiredLevel: 26,
            dialogue: {
                start: '王都被攻擊了！那裡有無數無辜的人民！',
                complete: '前線穩住了，但敵人的將領還在前方！'
            }
        },
        {
            id: 'main_021',
            name: '暗影將領',
            type: QuestType.MAIN,
            chapter: 8,
            icon: '⚔️',
            description: '擊敗暗影軍團的將領，保衛王都！',
            objectives: [
                { type: ObjectiveType.KILL, target: 'shadow_general', count: 3, description: '擊敗暗影將領 3 隻' },
                { type: ObjectiveType.COLLECT, target: 'shadow_insignia', count: 3, description: '收集暗影徽記 3 個' }
            ],
            rewards: {
                gold: 1500,
                exp: 800,
                items: ['general_armor']
            },
            unlocks: ['main_022'],
            requiredLevel: 27,
            dialogue: {
                start: '將領們正在指揮進攻...必須阻止他們！',
                complete: '將領被擊敗了！但暗影霸主本人出現了...'
            }
        },
        {
            id: 'main_022',
            name: '暗影霸主',
            type: QuestType.MAIN,
            chapter: 8,
            icon: '👹',
            description: '暗影軍團的統帥親自出馬。這是保衛王都的最後一戰！',
            objectives: [
                { type: ObjectiveType.KILL, target: 'shadow_overlord', count: 1, description: '擊敗暗影霸主' }
            ],
            rewards: {
                gold: 3000,
                exp: 1200,
                items: ['overlord_crown', 'overlord_armor']
            },
            unlocks: ['main_023'],
            requiredLevel: 28,
            dialogue: {
                start: '暗影霸主...暗影軍團的真正統帥！',
                complete: '暗影霸主被擊敗了！但他臨死前說...魔王即將降臨！'
            }
        },
        // ==================== 第九章：最終決戰 (Lv.28-30) ====================
        {
            id: 'main_023',
            name: '魔王的軍團',
            type: QuestType.MAIN,
            chapter: 9,
            icon: '😈',
            description: '魔族軍團開始入侵！為最終決戰做準備！',
            objectives: [
                { type: ObjectiveType.KILL, target: 'demon_soldier', count: 15, description: '擊敗魔族士兵 15 隻' }
            ],
            rewards: {
                gold: 1200,
                exp: 800,
                items: ['demon_horn', 'demonic_steel']
            },
            unlocks: ['main_024'],
            requiredLevel: 28,
            dialogue: {
                start: '魔族軍團來了...這是真正的最終決戰！',
                complete: '魔族士兵被擊退了，但魔族將軍正在接近！'
            }
        },
        {
            id: 'main_024',
            name: '魔族將軍',
            type: QuestType.MAIN,
            chapter: 9,
            icon: '👿',
            description: '魔族將軍是魔王的左右手。必須先消滅他們！',
            objectives: [
                { type: ObjectiveType.KILL, target: 'demon_general', count: 2, description: '擊敗魔族將軍 2 隻' }
            ],
            rewards: {
                gold: 2000,
                exp: 1000,
                items: ['demon_general_helm', 'abyssal_shard']
            },
            unlocks: ['main_025'],
            requiredLevel: 29,
            dialogue: {
                start: '魔族將軍...他們是魔王最信任的部下！',
                complete: '將軍們被擊敗了！前往魔王的王座！'
            }
        },
        {
            id: 'main_025',
            name: '最終決戰：魔王阿薩謝爾',
            type: QuestType.MAIN,
            chapter: 9,
            icon: '👑',
            description: '這是最終的決戰。面對魔王阿薩謝爾，拯救世界！',
            objectives: [
                { type: ObjectiveType.KILL, target: 'demon_lord_asariel', count: 1, description: '擊敗魔王阿薩謝爾' }
            ],
            rewards: {
                gold: 10000,
                exp: 5000,
                items: ['demon_lord_sword', 'demon_lord_armor', 'world_shard']
            },
            unlocks: [],
            requiredLevel: 30,
            dialogue: {
                start: '魔王阿薩謝爾...世界的命運就在這一戰！',
                complete: '恭喜你，英雄！魔王被擊敗了，世界恢復了和平！你的傳說將永遠流傳...'
            }
        }
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
                exp: 120,
                items: ['wolf_fang']
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
                exp: 300
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
                // items: ['torch']
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
                // items: ['bat_wing_cloak']
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
                exp: 400
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
                // items: ['ancient_key']
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
                exp: 500
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
                // items: ['compass']
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
                exp: 600
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
                // items: ['fire_resist_potion']
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
                // items: ['demon_slayer']
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
                // items: ['dungeon_token']
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
            name: '鍛造師的請求',
            type: QuestType.COMMISSION,
            npc: 'blacksmith',
            icon: '⚒️',
            description: '鍛造師需要你收集一些礦石來研究新技術。',
            objectives: [
                { type: ObjectiveType.COLLECT, target: 'iron_ore', count: 5, description: '收集鐵礦石 5 個' }
            ],
            rewards: {
                gold: 100
            },
            unlocks: ['commission_forge_002'],
            dialogue: {
                start: '唔...我正在研究新的強化技術，需要一些鐵礦石。能幫我嗎？',
                complete: '太好了！作為感謝，這卷強化秘卷給你。'
            }
        },
        {
            id: 'commission_forge_002',
            name: '傳說材料',
            type: QuestType.COMMISSION,
            npc: 'blacksmith',
            icon: '⚒️',
            description: '鍛造師聽說危險區有稀有礦石...',
            objectives: [
                { type: ObjectiveType.COLLECT, target: 'mithril_ore', count: 3, description: '收集秘銀礦石 3 個' },
                { type: ObjectiveType.ENHANCE, target: 'any', count: 5, description: '累計強化 5 次' }
            ],
            rewards: {
                gold: 300,
                // items: ['master_hammer'] // 強化成功率 +10%
            },
            unlocks: [],
            dialogue: {
                start: '傳說中的秘銀...如果能得到它，我就能打造出更強的武器！',
                complete: '難以置信！這是我鍛造生涯的巔峰！拿去，這把大師之錘是我的心意。'
            }
        },

        // 賭場老闆委託
        {
            id: 'commission_casino_001',
            name: '賭場的麻煩',
            type: QuestType.COMMISSION,
            npc: 'casino_owner',
            icon: '🎰',
            description: '賭場老闆懷疑有人在作弊，需要你幫忙調查。',
            objectives: [
                { type: ObjectiveType.GAMBLE_WIN, target: 'slots', count: 5, description: '在老虎機獲勝 5 次' },
                { type: ObjectiveType.GAMBLE_WIN, target: 'dice', count: 5, description: '在骰子獲勝 5 次' }
            ],
            rewards: {
                gold: 200,
                // items: ['vip_card'] // 賭場手續費減免
            },
            unlocks: ['commission_casino_002'],
            dialogue: {
                start: '最近賭場收益下降了...我懷疑有人在作弊。你能幫我玩幾局，觀察一下嗎？',
                complete: '原來是機器故障...謝謝你的幫助！這張 VIP 卡給你。'
            }
        },
        {
            id: 'commission_casino_002',
            name: '豪賭之夜',
            type: QuestType.COMMISSION,
            npc: 'casino_owner',
            icon: '🎰',
            description: '賭場要舉辦特別活動，需要一個「托」來炒熱氣氛。',
            objectives: [
                { type: ObjectiveType.GAMBLE_PROFIT, target: 'any', count: 1000, description: '在賭場累計盈利 1000G' }
            ],
            rewards: {
                gold: 500,
                // items: ['loaded_dice'] // 骰子遊戲勝率 +5%
            },
            unlocks: [],
            dialogue: {
                start: '下週有個大活動，我需要有人來展示「贏錢是可能的」...你懂的吧？',
                complete: '完美的表演！這對「幸運骰子」送給你，別告訴別人。'
            }
        },

        // 神秘商人委託
        {
            id: 'commission_merchant_001',
            name: '神秘商人的收藏',
            type: QuestType.COMMISSION,
            npc: 'merchant',
            icon: '🎭',
            description: '神秘商人正在尋找一些...特殊的物品。',
            objectives: [
                { type: ObjectiveType.COLLECT, target: 'cursed_shard', count: 1, description: '獲得詛咒碎片 1 個' }
            ],
            rewards: {
                gold: 0,
                items: ['mystery_box']
            },
            unlocks: ['hidden_dark_deal'],
            dialogue: {
                start: '我在尋找一些...被世人遺忘的東西。你有興趣幫忙嗎？',
                complete: '很好很好...這是你的報酬。別問裡面是什麼。'
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
            name: '黑暗交易',
            type: QuestType.HIDDEN,
            icon: '😈',
            description: '神秘商人似乎還有更多秘密...',
            trigger: {
                type: 'quest_complete',
                condition: 'equal',
                value: 'commission_merchant_001'
            },
            objectives: [
                { type: ObjectiveType.COLLECT, target: 'soul_fragment', count: 3, description: '收集靈魂碎片 3 個' }
            ],
            rewards: {
                items: ['demon_contract']
            },
            dialogue: {
                start: '你已經踏入了深淵...願意走得更深嗎？',
                complete: '契約已成。歡迎來到黑暗的一側。'
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
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.EPIC,
        description: '裝備時，強化成功率永久 +10%。',
        specialEffects: [
            { type: 'enhanceBonus', value: 0.1 }
        ],
        isQuestReward: true
    },
    vip_card: {
        id: 'vip_card',
        name: '賭場 VIP 卡',
        icon: '💳',
        type: ItemType.KEY,
        rarity: ItemRarity.RARE,
        description: '在賭場享有特殊待遇。',
        specialEffects: [
            { type: 'casinoBonus', value: 0.05 }
        ],
        isQuestReward: true
    },
    loaded_dice: {
        id: 'loaded_dice',
        name: '幸運骰子',
        icon: '🎲',
        type: EquipmentType.ACCESSORY,
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
            { type: AffixStat.ICE, value: 0.15 },
            { type: 'coldImmune', value: true }
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
        type: EquipmentType.ACCESSORY,
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
