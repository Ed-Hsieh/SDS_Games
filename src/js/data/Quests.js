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
            id: 'story_chapter_01',
            name: '南門以外',
            type: QuestType.MAIN,
            chapter: 1,
            unlockFlag: 'story.scene.ch1_s02_wake_under_bitter_bottles.complete',
            icon: 'I',
            description: '確認南門外三處證據、銀絲伏道與森林反應，讓第一條回城路重新可讀。',
            objectives: [
                {
                    type: ObjectiveType.CUSTOM,
                    target: 'chapter_01_screenplay',
                    count: 1,
                    completionFlag: 'story.scene.ch1_s11_roads_breathe_again.complete',
                    description: '完成第一章主線場景'
                }
            ],
            rewards: {},
            autoProgress: true
        },
        {
            id: 'story_chapter_02',
            name: '斷路上的藥味',
            type: QuestType.MAIN,
            chapter: 2,
            icon: 'II',
            description: '沿舊撤離路找回失蹤者的名字，處理赫恩與被錯置的亡者職責。',
            objectives: [
                {
                    type: ObjectiveType.CUSTOM,
                    target: 'chapter_02_screenplay',
                    count: 1,
                    completionFlag: 'story.scene.ch2_s08_shadow_at_the_checkpoint.complete',
                    description: '完成第二章主線場景'
                }
            ],
            rewards: {},
            autoProgress: true
        },
        {
            id: 'story_chapter_03',
            name: '影子仍守夜',
            type: QuestType.MAIN,
            chapter: 3,
            icon: 'III',
            description: '辨認仍在執行舊命令的人類影子，並關閉凱德倫的左線命令。',
            objectives: [
                {
                    type: ObjectiveType.CUSTOM,
                    target: 'chapter_03_screenplay',
                    count: 1,
                    completionFlag: 'story.scene.ch3_s09_temptation_and_orders.complete',
                    description: '完成第三章主線場景'
                }
            ],
            rewards: {},
            autoProgress: true
        },
        {
            id: 'story_chapter_04',
            name: '石心與灰雨',
            type: QuestType.MAIN,
            chapter: 4,
            icon: 'IV',
            description: '在灰脊撤離中維持前旗與後燈，阻止遠古泰坦再次抬升道路。',
            objectives: [
                {
                    type: ObjectiveType.CUSTOM,
                    target: 'chapter_04_screenplay',
                    count: 1,
                    completionFlag: 'story.scene.ch4_s09_four_elements_one_report.complete',
                    description: '完成第四章主線場景'
                }
            ],
            rewards: {},
            autoProgress: true
        },
        {
            id: 'story_chapter_05',
            name: '元素失衡',
            type: QuestType.MAIN,
            chapter: 5,
            icon: 'V',
            description: '追查四條元素前線的共同壓力，完成米婭手術與二十年前遠征真相。',
            objectives: [
                {
                    type: ObjectiveType.CUSTOM,
                    target: 'chapter_05_screenplay',
                    count: 1,
                    completionFlag: 'story.scene.ch5_s11_town_loses_its_voice.complete',
                    description: '完成第五章主線場景'
                }
            ],
            rewards: {},
            autoProgress: true
        },
        {
            id: 'story_chapter_06',
            name: '龍守封痕',
            type: QuestType.MAIN,
            chapter: 6,
            icon: 'VI',
            description: '理解龍族守線與人類誤觸封痕的差別，並在回城後收束維斯珀賭局。',
            objectives: [
                {
                    type: ObjectiveType.CUSTOM,
                    target: 'chapter_06_screenplay',
                    count: 1,
                    completionFlag: 'story.scene.ch6_s09_the_old_note_answers.complete',
                    description: '完成第六章主線場景'
                }
            ],
            rewards: {},
            autoProgress: true
        },
        {
            id: 'story_chapter_07',
            name: '墜落之地',
            type: QuestType.MAIN,
            chapter: 7,
            icon: 'VII',
            description: '沿回聲哨找到舊山路、花田與魔王墜落地，完成當前周目的結局。',
            objectives: [
                {
                    type: ObjectiveType.CUSTOM,
                    target: 'chapter_07_screenplay',
                    count: 1,
                    completionFlag: 'story.scene.ch7_s09_first_or_second_epilogue.complete',
                    description: '完成第七章主線場景'
                }
            ],
            rewards: {},
            autoProgress: true
        }
    ],

    // ==================== 懸賞任務 ====================
    bounty: [
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
        }
    ],

    // ==================== 委託任務 ====================
    // Character-centered side stories stay outside the playable database until
    // their map owner, scene script, and reward source are approved together.
    commission: [],

    // ==================== 隱藏任務 ====================
    // Hidden story achievements are owned by StoryStateContract. Legacy
    // stat-triggered hidden quests are disabled during screenplay migration.
    hidden: []
};

/**
 * 獨特道具定義（任務獎勵專用）
 */
export const QuestRewardItems = {
    // 主線獎勵
    starter_sword: {
        id: 'starter_sword',
        name: '行路者短劍',
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
        name: '磨亮幸運幣',
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
        name: '岔路水晶',
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
        description: '枯魂法杖裡折出的杖芯。它仍會記得古墓裡那些錯誤命令的節奏。',
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
        name: '深淵先鋒印',
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
        name: '無聲匕首',
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
        name: '街角慧眼',
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
        name: '不熄羽',
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
        name: '黑焰契卷',
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
        name: '霜息冠',
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
        name: '守衛舊盾',
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
        name: '藤心墜',
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
        name: '斷焰刃',
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
        QuestDatabase.main[0]
    ];
}
