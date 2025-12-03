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
    COMPLETED: 'completed', // 已完成（待領獎）
    FINISHED: 'finished'    // 已結束
};

// 任務目標類型
export const ObjectiveType = {
    KILL: 'kill',               // 擊殺怪物
    COLLECT: 'collect',         // 收集道具
    GOLD: 'gold',               // 累積金幣
    ENHANCE: 'enhance',         // 強化裝備
    GAMBLE_WIN: 'gamble_win',   // 賭場獲勝
    GAMBLE_PROFIT: 'gamble_profit', // 賭場盈利
    EXPLORE: 'explore',         // 探索區域
    EVENT: 'event',             // 觸發事件
    TALK: 'talk',               // 與 NPC 對話
    CUSTOM: 'custom'            // 自定義條件
};

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
            description: '你決定踏上冒險之旅。首先，去探索附近的安全區域，熟悉這個世界。',
            objectives: [
                { type: ObjectiveType.EXPLORE, target: 'low', count: 3, description: '探索安全區 3 次' }
            ],
            rewards: {
                gold: 100,
                exp: 50,
                items: ['starter_sword']
            },
            unlocks: ['main_002'], // 完成後解鎖
            dialogue: {
                start: '每個英雄都有起點。你的冒險，從這裡開始...',
                complete: '不錯！你已經掌握了基本的探索技巧。'
            }
        },
        {
            id: 'main_002',
            name: '初次戰鬥',
            type: QuestType.MAIN,
            chapter: 1,
            icon: '⚔️',
            description: '是時候面對你的第一場戰鬥了。擊敗幾隻弱小的怪物來證明自己。',
            objectives: [
                { type: ObjectiveType.KILL, target: 'any', count: 5, description: '擊敗任意怪物 5 隻' }
            ],
            rewards: {
                gold: 150,
                exp: 80,
                items: ['health_potion_s']
            },
            unlocks: ['main_003', 'bounty_001'],
            dialogue: {
                start: '戰鬥是冒險者的日常。不要害怕，勇敢面對！',
                complete: '做得好！你已經是個合格的戰士了。'
            }
        },
        {
            id: 'main_003',
            name: '裝備強化',
            type: QuestType.MAIN,
            chapter: 1,
            icon: '⚒️',
            description: '拜訪鍛造師，學習如何強化你的裝備。',
            objectives: [
                { type: ObjectiveType.ENHANCE, target: 'any', count: 1, description: '強化任意裝備 1 次' }
            ],
            rewards: {
                gold: 100,
                exp: 60,
                items: ['enhance_stone']
            },
            unlocks: ['main_004', 'commission_forge_001'],
            dialogue: {
                start: '好的裝備需要維護和強化。去找鍛造師吧！',
                complete: '現在你知道如何讓裝備更強了。'
            }
        },
        {
            id: 'main_004',
            name: '賭徒的誘惑',
            type: QuestType.MAIN,
            chapter: 1,
            icon: '🎰',
            description: '聽說城裡有個賭場...去看看吧，但要小心！',
            objectives: [
                { type: ObjectiveType.GAMBLE_WIN, target: 'any', count: 3, description: '在賭場獲勝 3 次' }
            ],
            rewards: {
                gold: 200,
                exp: 70,
                items: ['lucky_coin']
            },
            unlocks: ['main_005', 'commission_casino_001'],
            dialogue: {
                start: '賭場是個危險的地方...但也充滿機會。',
                complete: '看來運氣站在你這邊。但別太沉迷...'
            }
        },
        {
            id: 'main_005',
            name: '深入危險區',
            type: QuestType.MAIN,
            chapter: 2,
            icon: '💀',
            description: '你已經足夠強大了。是時候挑戰更危險的區域。',
            objectives: [
                { type: ObjectiveType.EXPLORE, target: 'medium', count: 5, description: '探索普通區 5 次' },
                { type: ObjectiveType.KILL, target: 'medium_monster', count: 3, description: '擊敗普通區怪物 3 隻' }
            ],
            rewards: {
                gold: 300,
                exp: 150,
                items: ['rare_gem_box']
            },
            unlocks: ['main_006', 'bounty_002'],
            dialogue: {
                start: '前方的路更加危險，但獎勵也更豐厚...',
                complete: '你的實力已經得到證明！'
            }
        },
        {
            id: 'main_006',
            name: '命運的抉擇',
            type: QuestType.MAIN,
            chapter: 2,
            icon: '🌟',
            description: '一個神秘的事件正在等待你。觸發並解決它！',
            objectives: [
                { type: ObjectiveType.EVENT, target: 'any', count: 3, description: '觸發並完成 3 個隨機事件' }
            ],
            rewards: {
                gold: 500,
                exp: 200,
                items: ['fate_crystal']
            },
            unlocks: ['main_007'],
            dialogue: {
                start: '命運的絲線正在交織...你的選擇將決定未來。',
                complete: '你已經學會了面對命運的考驗。'
            }
        },
        {
            id: 'main_007',
            name: '終極挑戰',
            type: QuestType.MAIN,
            chapter: 3,
            icon: '👑',
            description: '前往 Boss 區域，面對最強大的敵人！',
            objectives: [
                { type: ObjectiveType.EXPLORE, target: 'boss', count: 1, description: '進入 Boss 區域' },
                { type: ObjectiveType.KILL, target: 'boss', count: 1, description: '擊敗 Boss' }
            ],
            rewards: {
                gold: 2000,
                exp: 500,
                items: ['legendary_weapon_box']
            },
            unlocks: [],
            dialogue: {
                start: '這是最終的考驗。準備好了嗎？',
                complete: '恭喜你！你已經成為了真正的英雄！'
            }
        }
    ],

    // ==================== 懸賞任務 ====================
    bounty: [
        {
            id: 'bounty_001',
            name: '史萊姆獵人',
            type: QuestType.BOUNTY,
            icon: '🎯',
            description: '村民受到史萊姆的困擾。幫忙清除它們！',
            repeatable: true,
            objectives: [
                { type: ObjectiveType.KILL, target: 'slime', count: 10, description: '擊敗史萊姆 10 隻' }
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
                { type: ObjectiveType.KILL, target: 'wolf', count: 5, description: '擊敗野狼 5 隻' }
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
                { type: ObjectiveType.KILL, target: 'elite_assassin', count: 1, description: '擊敗暗影刺客' }
            ],
            rewards: {
                gold: 500,
                exp: 300,
                items: ['assassin_dagger']
            },
            unlocks: []
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
                gold: 100,
                items: ['enhance_scroll'] // 使用後下次強化必定成功
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
                items: ['master_hammer'] // 強化成功率 +10%
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
                items: ['vip_card'] // 賭場手續費減免
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
                items: ['loaded_dice'] // 骰子遊戲勝率 +5%
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
                { type: ObjectiveType.COLLECT, target: 'cursed_gem', count: 1, description: '獲得詛咒寶石 1 個' }
            ],
            rewards: {
                gold: 0,
                items: ['mystery_box'] // 開啟獲得隨機稀有道具
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
                items: ['beggars_wisdom'] // 金幣獲取 +10%
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
                items: ['phoenix_feather'] // 死亡時自動復活一次
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
                items: ['gamblers_fallacy'] // 連敗後勝率提升
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
                items: ['demon_contract'] // 所有屬性 +10，但每場戰鬥扣 5% HP
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
                items: ['lucky_charm_7'] // 所有機率判定 +7%
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
                items: ['transcend_stone'] // 突破強化上限
            },
            dialogue: {
                start: '+10 不是終點，只是新的起點...',
                complete: '你已經超越了凡人的境界。'
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
        type: 'weapon',
        rarity: 'uncommon',
        attack: 12,
        description: '每個英雄旅程的起點。',
        isQuestReward: true
    },
    enhance_stone: {
        id: 'enhance_stone',
        name: '強化石',
        icon: '💎',
        type: 'material',
        rarity: 'rare',
        description: '使用後，下次強化成功率 +20%。',
        isQuestReward: true
    },
    lucky_coin: {
        id: 'lucky_coin',
        name: '幸運金幣',
        icon: '🪙',
        type: 'accessory',
        rarity: 'rare',
        attack: 0,
        defense: 0,
        critChance: 0.05,
        description: '據說是從賭場贏來的第一枚金幣，會帶來好運。',
        isQuestReward: true
    },
    rare_gem_box: {
        id: 'rare_gem_box',
        name: '稀有寶石盒',
        icon: '📦',
        type: 'consumable',
        rarity: 'rare',
        description: '開啟獲得隨機稀有寶石。',
        isQuestReward: true
    },
    fate_crystal: {
        id: 'fate_crystal',
        name: '命運水晶',
        icon: '🔮',
        type: 'accessory',
        rarity: 'epic',
        attack: 5,
        defense: 5,
        description: '能夠影響命運的神秘水晶。隨機事件獎勵 +20%。',
        isQuestReward: true
    },
    legendary_weapon_box: {
        id: 'legendary_weapon_box',
        name: '傳說武器寶箱',
        icon: '👑',
        type: 'consumable',
        rarity: 'legendary',
        description: '開啟獲得隨機傳說武器！',
        isQuestReward: true
    },

    // 懸賞獎勵
    wolf_fang: {
        id: 'wolf_fang',
        name: '狼牙項鍊',
        icon: '🦷',
        type: 'accessory',
        rarity: 'uncommon',
        attack: 3,
        critChance: 0.08,
        description: '用狼牙製成的項鍊，散發著野性的氣息。',
        isQuestReward: true
    },
    assassin_dagger: {
        id: 'assassin_dagger',
        name: '刺客匕首',
        icon: '🗡️',
        type: 'weapon',
        rarity: 'epic',
        attack: 18,
        critChance: 0.25,
        critDamage: 2.0,
        weaponSpeed: 1.5,
        attackSpeed: 1.8,
        description: '暗影刺客的武器，追求一擊必殺。',
        isQuestReward: true
    },

    // 委託獎勵
    enhance_scroll: {
        id: 'enhance_scroll',
        name: '強化秘卷',
        icon: '📜',
        type: 'consumable',
        rarity: 'rare',
        description: '使用後，下次強化必定成功！',
        effect: { guaranteeEnhance: true },
        isQuestReward: true
    },
    master_hammer: {
        id: 'master_hammer',
        name: '大師之錘',
        icon: '🔨',
        type: 'accessory',
        rarity: 'epic',
        description: '裝備時，強化成功率永久 +10%。',
        effect: { enhanceBonus: 0.1 },
        isQuestReward: true
    },
    vip_card: {
        id: 'vip_card',
        name: '賭場 VIP 卡',
        icon: '💳',
        type: 'key',
        rarity: 'rare',
        description: '在賭場享有特殊待遇。',
        effect: { casinoBonus: 0.05 },
        isQuestReward: true
    },
    loaded_dice: {
        id: 'loaded_dice',
        name: '幸運骰子',
        icon: '🎲',
        type: 'accessory',
        rarity: 'epic',
        description: '「這骰子好像有點重...」骰子遊戲勝率 +5%。',
        effect: { diceBonus: 0.05 },
        isQuestReward: true
    },
    mystery_box: {
        id: 'mystery_box',
        name: '神秘寶盒',
        icon: '❓',
        type: 'consumable',
        rarity: 'epic',
        description: '不知道裡面是什麼...開啟看看？',
        isQuestReward: true
    },

    // 隱藏任務獎勵
    beggars_wisdom: {
        id: 'beggars_wisdom',
        name: '乞丐的智慧',
        icon: '📿',
        type: 'accessory',
        rarity: 'rare',
        description: '「一無所有，反而看得更清。」金幣獲取 +10%。',
        effect: { goldBonus: 0.1 },
        isQuestReward: true
    },
    phoenix_feather: {
        id: 'phoenix_feather',
        name: '鳳凰羽毛',
        icon: '🪶',
        type: 'accessory',
        rarity: 'legendary',
        description: '死亡時自動復活一次，HP 恢復 30%。每場戰鬥只能觸發一次。',
        effect: { autoRevive: true, reviveHp: 0.3 },
        isQuestReward: true
    },
    gamblers_fallacy: {
        id: 'gamblers_fallacy',
        name: '賭徒謬誤',
        icon: '🃏',
        type: 'accessory',
        rarity: 'epic',
        description: '「連輸這麼多次，下次一定會贏！」連敗後勝率大幅提升。',
        effect: { lossStreakBonus: true },
        isQuestReward: true
    },
    demon_contract: {
        id: 'demon_contract',
        name: '惡魔契約',
        icon: '📋',
        type: 'accessory',
        rarity: 'legendary',
        description: '攻擊力、防禦力 +15。但每場戰鬥開始時損失 5% HP。',
        attack: 15,
        defense: 15,
        effect: { battleHpCost: 0.05 },
        isQuestReward: true
    },
    lucky_charm_7: {
        id: 'lucky_charm_7',
        name: '七星護符',
        icon: '⭐',
        type: 'accessory',
        rarity: 'legendary',
        description: '幸運之神的眷顧。所有機率判定 +7%。',
        effect: { luckBonus: 0.07 },
        isQuestReward: true
    },
    transcend_stone: {
        id: 'transcend_stone',
        name: '超越之石',
        icon: '💠',
        type: 'consumable',
        rarity: 'legendary',
        description: '使用後，突破裝備的強化上限 (+10 → +15)。',
        effect: { transcendEnhance: true },
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
