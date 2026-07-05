/**
 * Dungeons.js
 * 副本資料庫 - 5個獨特副本的完整配置
 */

import { DungeonStoryDatabase } from './DungeonStories.js';
import { applyMonsterCombatBalance } from './CombatBalance.js';
import { applyLegacyLevelProgressionToDungeonDatabase } from './ProgressionLevels.js';

// ==================== 副本類型 ====================
export const DungeonType = {
    CAVE: 'cave',       // 洞窟
    SNOW: 'snow',       // 雪山
    RUINS: 'ruins',     // 遺跡
    JUNGLE: 'jungle',   // 叢林
    HELL: 'hell',       // 地獄
    RADIANT_CORRIDOR: 'radiant_corridor' // 黎明迴廊
};

// ==================== 副本難度 ====================
export const DungeonDifficulty = {
    EASY: 1,      // 洞窟
    NORMAL: 2,    // 雪山
    HARD: 3,      // 遺跡
    EXPERT: 4,    // 叢林
    NIGHTMARE: 5, // 地獄
    LEGEND: 6     // 黎明迴廊
};

// ==================== 副本狀態 ====================
export const DungeonState = {
    LOCKED: 'locked',
    AVAILABLE: 'available',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed'
};

// ==================== 副本入口配置 ====================
export const DungeonEntranceConfig = {
    cave: { 
        name: '幽暗洞窟', 
        icon: '🏔️', 
        color: '#8b7355',
        zones: ['low', 'medium'],
        description: '地脈斷裂後，黑色岩層開始蠕動重組的地下裂谷。'
    },
    snow: { 
        name: '冰封雪峰', 
        icon: '❄️', 
        color: '#87ceeb',
        zones: ['medium', 'high'],
        description: '山脊熱泉被寒潮封住後，暴風雪吞噬整座雪峰。'
    },
    ruins: { 
        name: '遠古遺跡', 
        icon: '🏛️', 
        color: '#daa520',
        zones: ['medium', 'high'],
        description: '仍在盲目執行防衛協定的地脈監測神殿。'
    },
    jungle: { 
        name: '迷霧叢林', 
        icon: '🌴', 
        color: '#228b22',
        zones: ['high'],
        description: '劇毒迷霧腐爛魔法生態後形成的移動迷宮。'
    },
    hell: { 
        name: '煉獄深淵', 
        icon: '🔥', 
        color: '#dc143c',
        zones: ['boss'],
        description: '魔王封印破裂後，地脈之血流出的深淵裂谷。'
    },
    radiant_corridor: {
        name: '黎明迴廊',
        icon: '☀️',
        color: '#f8d56b',
        zones: ['boss'],
        description: '光明系正式登場的 70 等副本，用來抗衡無盡塔的虛空壓力。'
    }
};

// ==================== 副本資料庫 ====================
export const DungeonDatabase = {
    // ========== 1. 洞窟副本 (難度: ★☆☆☆☆) ==========
    [DungeonType.CAVE]: {
        id: DungeonType.CAVE,
        name: '幽暗洞窟',
        icon: '🏔️',
        description: '地脈斷裂後，黑色岩層開始蠕動重組的地下裂谷。礦工布蘭的日誌仍被白骨緊緊護在懷中。',
        story: DungeonStoryDatabase.cave,
        difficulty: DungeonDifficulty.EASY,
        recommendLevel: 3,
        contentPlan: {
            targetLevelRange: [5, 10],
            role: 'first_high_risk_reward',
            rewardLines: ['cave_miner', 'spider_venom'],
            materialGroups: ['cave_ore', 'spider_venom'],
            blockedDrops: ['shadow_shard', 'void_essence', 'light_essence']
        },
        challenge: {
            playstyle: '低光源探索：視野短、事件密度高，重點是用火把與補給換取穩定推進。',
            riskBrief: '黑暗會縮短可判斷距離，陷阱與突襲比同等級野外更常見。',
            rewardBrief: '早期防具線、礦工遺物與基礎鍛造素材。',
            preparation: ['帶火把可以擴大視野', '生命藥水能抵掉落石與伏擊失誤'],
            bossWarning: '岩石巨人守著出口，防禦很高，沒有足夠攻擊力會被拖進消耗戰。',
            completion: '布蘭的日誌被帶回地面，城鎮第一次知道地脈斷裂不是傳聞。'
        },
        floors: 3,
        bossFloor: 4,
        
        // 特殊機制：視野受限
        mechanic: {
            type: 'darkness',
            name: '黑暗籠罩',
            description: '洞窟內一片漆黑，視野範圍縮小為 3x3。',
            icon: '🌑',
            effect: {
                visionRange: 3,  // 視野範圍
                torchBonus: 2    // 火把增加視野
            },
            counterItem: 'torch'  // 火把可以擴大視野
        },
        
        // 環境效果
        environment: {
            ambiance: '水滴聲迴盪在洞窟中...',
            hazards: ['落石', '蝙蝠群'],
            events: [
                { type: 'trap', name: '落石陷阱', damage: 15, chance: 0.15 },
                { type: 'treasure', name: '礦石堆', goldRange: [20, 50], itemChance: 0.35, chance: 0.2 },
                { type: 'rest', name: '安全角落', healPercent: 0.2, chance: 0.1 }
            ]
        },
        
        // 怪物生態
        monsters: {
            common: [
                { id: 'cave_bat', name: '洞窟蝙蝠', icon: '🦇', hp: 30, attack: 8, defense: 2, exp: 15, gold: [5, 15] },
                { id: 'cave_spider', name: '穴居蜘蛛', icon: '🕷️', hp: 40, attack: 10, defense: 4, exp: 20, gold: [8, 20] },
                { id: 'cave_rat', name: '巨型洞鼠', icon: '🐀', hp: 25, attack: 12, defense: 1, exp: 12, gold: [3, 10] }
            ],
            elite: [
                {
                    id: 'shadow_lurker',
                    name: '暗影潛伏者',
                    icon: '👤',
                    hp: 80,
                    attack: 18,
                    defense: 8,
                    exp: 50,
                    gold: [30, 60],
                    equipmentDrops: [
                        { equipmentId: 'cave_ward_shield', chance: 0.055 }
                    ],
                    special: '偷襲：首次攻擊傷害翻倍'
                }
            ],
            boss: {
                id: 'rock_golem', name: '岩石巨人', icon: '🗿', 
                hp: 200, attack: 25, defense: 20, exp: 150, gold: [100, 200],
                equipmentDrops: [
                    { equipmentId: 'miners_pickhammer', chance: 0.14 },
                    { equipmentId: 'cave_ward_shield', chance: 0.12 }
                ],
                skills: [
                    { name: '地震', damage: 30, description: '對全體造成傷害' },
                    { name: '石化凝視', effect: 'stun', duration: 1, description: '使目標短暫僵住 1 秒' }
                ],
                dialogue: {
                    encounter: '入侵者...必須...消滅...',
                    defeat: '岩石...回歸...大地...'
                }
            }
        },
        
        // 獨特寶物
        treasures: {
            guaranteed: {
                id: 'miners_charm',
                name: '礦工護符',
                icon: '⛏️',
                type: 'accessory',
                rarity: 'rare',
                description: '古老礦工的護身符，能感應到金幣的氣息。',
                stats: { attack: 3, defense: 5 },
                special: { goldBonus: 0.25 },  // 金幣掉落 +25%
                price: 500
            },
            random: [
                { id: 'cave_crystal', name: '洞窟水晶', icon: '💎', type: 'material', rarity: 'uncommon', price: 100 },
                { id: 'bat_wing', name: '蝙蝠翅膀', icon: '🦇', type: 'material', rarity: 'common', price: 30 },
                { id: 'glowing_moss', name: '發光苔蘚', icon: '🌿', type: 'material', rarity: 'uncommon', price: 80 }
            ]
        },
        
        // 視覺主題
        theme: {
            primaryColor: '#4a3728',
            secondaryColor: '#2d2d2d',
            accentColor: '#8b7355',
            backgroundGradient: 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 50%, #4a3728 100%)'
        }
    },

    // ========== 2. 雪山副本 (難度: ★★☆☆☆) ==========
    [DungeonType.SNOW]: {
        id: DungeonType.SNOW,
        name: '冰封雪峰',
        icon: '❄️',
        description: '沉鐘神諭引發的氣候異變封住山脊熱泉，冰霜巨龍在魔力逆流中驚醒。',
        story: DungeonStoryDatabase.snow,
        difficulty: DungeonDifficulty.NORMAL,
        recommendLevel: 6,
        contentPlan: {
            targetLevelRange: [16, 23],
            role: 'cold_durability_pressure',
            rewardLines: ['early_frost', 'lich_relic'],
            materialGroups: ['frost_core', 'glimmer_seed'],
            blockedDrops: ['shadow_shard', 'void_essence', 'light_essence']
        },
        challenge: {
            playstyle: '補給壓力探索：移動本身就是消耗，重點是判斷何時深入、何時回撤。',
            riskBrief: '寒冷會累積並消耗補給；拖太久會把藥水以外的背包壓力放大。',
            rewardBrief: '冰寒鍛造校準、寒地材料與對抗冰系怪物的裝備路線。',
            preparation: ['保暖披風能降低寒冷壓力', '準備足夠補給再嘗試連續深入'],
            bossWarning: '冰霜巨龍會用寒意逼你失誤，拖長戰鬥會讓補給線先崩。',
            completion: '雪峰上的校準法被帶回鍛造鋪，鐵匠能更穩定地處理寒地材料。'
        },
        floors: 4,
        bossFloor: 5,
        
        // 特殊機制：寒冷值
        mechanic: {
            type: 'cold',
            name: '極寒環境',
            description: '移動會累積寒冷並定期消耗補給；寒冷達到 100 時會受到凍傷。',
            icon: '🥶',
            effect: {
                coldPerStep: 2,        // 每步增加寒冷值
                maxCold: 100,          // 最大寒冷值
                damagePerStep: 0.05,   // 滿寒冷時每步傷害
                warmthDecay: 5         // 靠近火堆時每步減少寒冷值
            },
            counterItem: 'warm_cloak'  // 保暖披風可減緩寒冷
        },
        
        environment: {
            ambiance: '刺骨的寒風呼嘯而過...',
            hazards: ['暴風雪', '冰裂縫'],
            events: [
                { type: 'trap', name: '冰裂縫', damage: 20, chance: 0.12 },
                { type: 'blizzard', name: '暴風雪', coldIncrease: 30, chance: 0.15 },
                { type: 'campfire', name: '篝火遺跡', coldReset: true, healPercent: 0.15, chance: 0.08 },
                { type: 'treasure', name: '冰凍寶箱', goldRange: [30, 80], itemChance: 0.3, chance: 0.15 }
            ]
        },
        
        monsters: {
            common: [
                { id: 'frost_wolf', name: '冰霜狼', icon: '🐺', hp: 50, attack: 14, defense: 6, exp: 25, gold: [10, 25] },
                { id: 'yeti_scout', name: '雪人斥候', icon: '⛄', hp: 60, attack: 12, defense: 10, exp: 30, gold: [15, 30] },
                {
                    id: 'ice_elemental',
                    name: '冰元素',
                    icon: '❄️',
                    hp: 45,
                    attack: 16,
                    defense: 4,
                    exp: 28,
                    gold: [12, 28],
                    equipmentDrops: [
                        { equipmentId: 'frostbound_scepter_drop', chance: 0.035 }
                    ],
                    special: '冰凍觸碰：攻擊時增加目標寒冷值'
                }
            ],
            elite: [
                {
                    id: 'frost_giant',
                    name: '霜巨人',
                    icon: '🧊',
                    hp: 120,
                    attack: 22,
                    defense: 15,
                    exp: 80,
                    gold: [50, 100],
                    equipmentDrops: [
                        { equipmentId: 'frostbite_dueling_blade', chance: 0.08 },
                        { equipmentId: 'frostbound_scepter_drop', chance: 0.06 }
                    ],
                    special: '寒冰護甲：受到傷害減少 20%'
                }
            ],
            boss: {
                id: 'ice_dragon', name: '冰霜巨龍', icon: '🐉',
                hp: 350, attack: 35, defense: 25, exp: 250, gold: [200, 400],
                equipmentDrops: [
                    { equipmentId: 'frostbite_dueling_blade', chance: 0.16 },
                    { equipmentId: 'frostbound_scepter_drop', chance: 0.12 }
                ],
                skills: [
                    { name: '冰息', damage: 40, effect: 'freeze', duration: 2, description: '噴出冰冷的龍息' },
                    { name: '暴風雪', aoe: true, damage: 25, coldIncrease: 50, description: '召喚暴風雪' },
                    { name: '冰晶護盾', effect: 'shield', value: 50, description: '生成冰盾抵擋傷害' }
                ],
                dialogue: {
                    encounter: '愚蠢的人類，你將永眠於冰雪之中！',
                    defeat: '不可能...我是永恆的冰霜...'
                }
            }
        },
        
        treasures: {
            guaranteed: {
                id: 'heart_of_ice',
                name: '永凍之心',
                icon: '💙',
                type: 'accessory',
                rarity: 'epic',
                description: '冰龍的心臟結晶，賦予持有者抵禦寒冷的能力。',
                stats: { attack: 5, defense: 10, hp: 30 },
                special: { iceResist: 0.5 },  // 冰系傷害 -50%
                price: 1200
            },
            random: [
                { id: 'frost_shard', name: '霜之碎片', icon: '🧊', type: 'material', rarity: 'rare', price: 150 },
                { id: 'yeti_fur', name: '雪人皮毛', icon: '🦣', type: 'material', rarity: 'uncommon', price: 80 },
                { id: 'frozen_tear', name: '冰凍淚珠', icon: '💧', type: 'material', rarity: 'rare', price: 200 }
            ]
        },
        
        theme: {
            primaryColor: '#a8d8ea',
            secondaryColor: '#1e3d59',
            accentColor: '#87ceeb',
            backgroundGradient: 'linear-gradient(180deg, #1e3d59 0%, #4a6fa5 50%, #a8d8ea 100%)'
        }
    },

    // ========== 3. 遺跡副本 (難度: ★★★☆☆) ==========
    [DungeonType.RUINS]: {
        id: DungeonType.RUINS,
        name: '遠古遺跡',
        icon: '🏛️',
        description: '千年前監測地脈的黃金神殿，如今仍以盲目的防衛協定清除所有活體。',
        story: DungeonStoryDatabase.ruins,
        difficulty: DungeonDifficulty.HARD,
        recommendLevel: 10,
        contentPlan: {
            targetLevelRange: [28, 37],
            role: 'rune_defense_and_glimmer_bridge',
            rewardLines: ['mithril_rune', 'glimmer_initiate', 'shadow_legion'],
            materialGroups: ['ancient_ruins', 'glimmer_seed', 'shadow_legion'],
            blockedDrops: ['void_essence', 'light_essence']
        },
        challenge: {
            playstyle: '辨識型探索：先收集石碑線索，再決定要不要啟動機關。',
            riskBrief: '沒有線索就硬闖會觸發陷阱；遺跡怪物不會理解你只是路過。',
            rewardBrief: '秘銀破防線、遺跡圖紙與機關素材。',
            preparation: ['古代典籍能降低判讀成本', '破防或高暴擊裝備能縮短守衛戰'],
            bossWarning: '遠古守衛者會依階段切換防衛協定，錯誤節奏會被機關連續壓制。',
            completion: '朱利安的絕筆補上遺跡失控的原因，書記能把地脈監測網接回主線索引。'
        },
        floors: 5,
        bossFloor: 6,
        
        // 特殊機制：解謎系統
        mechanic: {
            type: 'puzzle',
            name: '遺跡機關',
            description: '需要先收集石碑線索才能辨認壓力板順序；未辨認就啟動會觸發陷阱。',
            icon: '🧩',
            effect: {
                puzzleTypes: ['sequence', 'symbol', 'riddle'],
                wrongPenalty: 30,     // 答錯傷害
                perfectBonus: 1.5     // 完美解謎獎勵倍率
            },
            counterItem: 'ancient_codex'  // 古代典籍可提示答案
        },
        
        environment: {
            ambiance: '古老的齒輪聲在迴廊中迴響...',
            hazards: ['尖刺陷阱', '毒箭機關', '落石'],
            events: [
                { type: 'trap', name: '尖刺陷阱', damage: 25, chance: 0.18 },
                { type: 'trap', name: '毒箭機關', damage: 15, poison: { damage: 5, duration: 3 }, chance: 0.12 },
                { type: 'puzzle_bonus', name: '隱藏機關', rewardMultiplier: 2, chance: 0.1 },
                { type: 'lore', name: '壁畫記載', expBonus: 50, chance: 0.15 },
                { type: 'treasure', name: '祭壇寶箱', goldRange: [50, 120], itemChance: 0.35, chance: 0.12 }
            ]
        },
        
        monsters: {
            common: [
                { id: 'stone_guardian', name: '石像守衛', icon: '🗿', hp: 70, attack: 16, defense: 18, exp: 35, gold: [20, 40] },
                { id: 'animated_armor', name: '活化盔甲', icon: '⚔️', hp: 80, attack: 20, defense: 15, exp: 40, gold: [25, 50] },
                { id: 'phantom', name: '遺跡幽魂', icon: '👻', hp: 50, attack: 22, defense: 5, exp: 38, gold: [18, 35], special: '虛體：50% 機率閃避物理攻擊' }
            ],
            elite: [
                { id: 'ancient_mage', name: '遠古法師', icon: '🧙', hp: 100, attack: 30, defense: 10, exp: 100, gold: [70, 140], special: '魔法屏障：免疫首次攻擊' }
            ],
            boss: {
                id: 'ancient_guardian', name: '遠古守衛者', icon: '🤖',
                hp: 500, attack: 40, defense: 30, exp: 400, gold: [300, 600],
                skills: [
                    { name: '雷射光束', damage: 50, description: '發射致命的光束' },
                    { name: '機關召喚', effect: 'summon', count: 2, description: '召喚 2 個石像守衛' },
                    { name: '自我修復', heal: 80, description: '修復自身結構' },
                    { name: '能量過載', aoe: true, damage: 35, selfDamage: 50, description: '釋放所有能量' }
                ],
                phases: [
                    { hpThreshold: 0.7, message: '啟動防禦協議...' },
                    { hpThreshold: 0.3, message: '⚠️ 核心過載！進入狂暴模式！', atkBoost: 1.5 }
                ],
                dialogue: {
                    encounter: '【系統啟動】入侵者偵測...執行清除協議...',
                    defeat: '【系統關閉】守護任務...失敗...'
                }
            }
        },
        
        treasures: {
            guaranteed: {
                id: 'eye_of_wisdom',
                name: '智者之眼',
                icon: '👁️',
                type: 'accessory',
                rarity: 'epic',
                description: '遠古智者的遺物，能看穿一切隱藏。',
                stats: { attack: 8, defense: 8 },
                special: { revealHidden: true, trapDetect: 0.5, puzzleHint: true },
                price: 1500
            },
            random: [
                { id: 'ancient_gear', name: '遠古齒輪', icon: '⚙️', type: 'material', rarity: 'rare', price: 180 },
                { id: 'arcane_crystal', name: '星輝水晶', icon: '🔮', type: 'material', rarity: 'rare', price: 220 },
                { id: 'rune_fragment', name: '符文碎片', icon: '📜', type: 'material', rarity: 'uncommon', price: 100 }
            ]
        },
        
        theme: {
            primaryColor: '#c9a227',
            secondaryColor: '#2c2c2c',
            accentColor: '#ffd700',
            backgroundGradient: 'linear-gradient(180deg, #2c2c2c 0%, #4a4a4a 50%, #c9a227 100%)'
        }
    },

    // ========== 4. 叢林副本 (難度: ★★★★☆) ==========
    [DungeonType.JUNGLE]: {
        id: DungeonType.JUNGLE,
        name: '迷霧叢林',
        icon: '🌴',
        description: '靈草被飛龍奪走後，劇毒迷霧腐爛了叢林，也逼瘋了深處的九頭蛇。',
        story: DungeonStoryDatabase.jungle,
        difficulty: DungeonDifficulty.EXPERT,
        recommendLevel: 15,
        contentPlan: {
            targetLevelRange: [42, 52],
            role: 'poison_life_sustain_reward_route',
            rewardLines: ['jungle_series', 'hydra_venom'],
            materialGroups: ['jungle_poison'],
            blockedDrops: ['light_essence']
        },
        challenge: {
            playstyle: '路標與毒霧探索：不是跑得快就好，而是每次前進都要留下可回頭的記號。',
            riskBrief: '迷霧會讓路徑扭曲；毒素會把錯誤慢慢變成生命壓力。',
            rewardBrief: '毒素減免戰術、蛛絲防具線與叢林稀有材料。',
            preparation: ['毒素減免戰術能顯著降低壓力', '叢林指南針能降低迷失成本'],
            bossWarning: '九頭蛇會把毒霧變成戰鬥節奏，沒有抗毒準備會被持續傷害逼退。',
            completion: '古老織機重新發出聲音，毒素對策不再只是臨時喝藥硬撐。'
        },
        floors: 6,
        bossFloor: 7,
        
        // 特殊機制：迷路系統
        mechanic: {
            type: 'maze',
            name: '迷霧迷宮',
            description: '每走一段距離有機率迷路，回到該層起點。收集 3 個路標可免疫迷路。',
            icon: '🌫️',
            effect: {
                lostChance: 0.3,       // 迷路機率
                lostCheckInterval: 10, // 每幾步檢查一次
                markerRequired: 3,     // 需要的路標數量
                confusionDuration: 2   // 迷路後的混亂秒數
            },
            counterItem: 'jungle_compass'  // 叢林指南針可降低迷路機率
        },
        
        environment: {
            ambiance: '蟲鳴鳥叫混雜著不明的低吼聲...',
            hazards: ['毒沼澤', '藤蔓陷阱', '猛獸突襲'],
            events: [
                { type: 'trap', name: '毒沼澤', damage: 20, poison: { damage: 8, duration: 4 }, chance: 0.15 },
                { type: 'trap', name: '藤蔓陷阱', effect: 'bind', duration: 2, chance: 0.12 },
                { type: 'marker', name: '古老路標', markerCount: 1, chance: 0.18 },
                { type: 'ambush', name: '猛獸突襲', monsterType: 'elite', chance: 0.1 },
                { type: 'treasure', name: '探險家遺物', goldRange: [80, 180], itemChance: 0.3, chance: 0.1 },
                { type: 'herb', name: '稀有草藥', healPercent: 0.3, removePoisaon: true, chance: 0.12 }
            ]
        },
        
        monsters: {
            common: [
                { id: 'jungle_panther', name: '叢林黑豹', icon: '🐆', hp: 90, attack: 28, defense: 12, exp: 50, gold: [30, 60], special: '潛行突襲：首擊必爆擊' },
                { id: 'poison_frog', name: '劇毒蛙', icon: '🐸', hp: 40, attack: 15, defense: 5, exp: 35, gold: [20, 40], special: '劇毒：攻擊附帶中毒效果' },
                {
                    id: 'vine_beast',
                    name: '藤蔓獸',
                    icon: '🌿',
                    hp: 100,
                    attack: 20,
                    defense: 20,
                    exp: 55,
                    gold: [35, 70],
                    drops: [
                        { itemId: 'vine_core', chance: 0.28, quantity: [1, 1] }
                    ],
                    special: '纏繞：降低目標速度'
                },
                { id: 'tribal_hunter', name: '部落獵人', icon: '🏹', hp: 70, attack: 32, defense: 8, exp: 48, gold: [25, 55] }
            ],
            elite: [
                { id: 'ancient_treant', name: '遠古樹人', icon: '🌳', hp: 200, attack: 35, defense: 25, exp: 150, gold: [100, 200], special: '自然治癒：每 3 秒恢復 10% HP' }
            ],
            boss: {
                id: 'jungle_hydra', name: '叢林九頭蛇', icon: '🐍',
                level: 52, hp: 700, attack: 45, defense: 20, exp: 600, gold: [500, 1000],
                heads: 3,  // 多頭機制
                equipmentDrops: [
                    { equipmentId: 'hydra_spine_spear', chance: 0.16 },
                    { equipmentId: 'thornhook_claws', chance: 0.1 }
                ],
                skills: [
                    { name: '多重撕咬', hits: 3, damage: 20, description: '每個頭各攻擊一次' },
                    { name: '劇毒噴吐', aoe: true, damage: 30, poison: { damage: 10, duration: 5 }, description: '噴灑致命毒液' },
                    { name: '頭部再生', effect: 'regen_head', description: '若有頭被砍斷，長出兩個新頭' },
                    { name: '狂暴咆哮', effect: 'fear', duration: 2, description: '使目標陷入恐懼' }
                ],
                phases: [
                    { headsDestroyed: 1, message: '一個頭被砍斷了！但是...' },
                    { headsDestroyed: 2, message: '九頭蛇狂怒地咆哮，毒液四濺！' }
                ],
                dialogue: {
                    encounter: '*嘶嘶嘶* 新鮮的獵物...',
                    defeat: '*痛苦的哀嚎* 不...我的頭...'
                }
            }
        },
        
        treasures: {
            guaranteed: {
                id: 'pathfinder_boots',
                name: '尋路者之靴',
                icon: '👢',
                type: 'accessory',
                rarity: 'legendary',
                description: '傳說中探險家的遺物，穿上它永遠不會迷路。',
                stats: { attack: 10, defense: 12 },
                special: { mazeImmune: true, moveSpeed: 1.3, trapEvade: 0.3 },
                price: 2500
            },
            random: [
                { id: 'exotic_flower', name: '異域奇花', icon: '🌺', type: 'material', rarity: 'epic', price: 300 },
                { id: 'panther_fang', name: '黑豹獠牙', icon: '🦷', type: 'material', rarity: 'rare', price: 200 },
                { id: 'ancient_map', name: '古老地圖', icon: '🗺️', type: 'material', rarity: 'rare', price: 250 },
                { id: 'tribal_mask', name: '部落面具', icon: '🎭', type: 'accessory', rarity: 'rare', stats: { attack: 15 }, price: 400 }
            ]
        },
        
        theme: {
            primaryColor: '#228b22',
            secondaryColor: '#1a3a1a',
            accentColor: '#90ee90',
            backgroundGradient: 'linear-gradient(180deg, #1a3a1a 0%, #228b22 50%, #90ee90 100%)'
        }
    },

    // ========== 5. 地獄副本 (難度: ★★★★★) ==========
    [DungeonType.HELL]: {
        id: DungeonType.HELL,
        name: '煉獄深淵',
        icon: '🔥',
        description: '魔王封印破裂後，地底最暴虐的火元素意志從地脈傷口中湧出。',
        story: DungeonStoryDatabase.hell,
        difficulty: DungeonDifficulty.NIGHTMARE,
        recommendLevel: 20,
        contentPlan: {
            targetLevelRange: [56, 66],
            role: 'final_preparation_and_abyss_pressure',
            rewardLines: ['abyss_series', 'demon_lord'],
            materialGroups: ['abyss_void', 'elemental_basic'],
            blockedDrops: ['light_essence']
        },
        challenge: {
            playstyle: '終局耐壓探索：每一步都會消耗裝備與生命，重點是用最短路線完成目標。',
            riskBrief: '煉獄熱浪會磨耗耐久並壓低回復效率，拖延會把好裝備燒成代價。',
            rewardBrief: '終局決戰材料、黑焰裝備線與高階火抗資源。',
            preparation: ['烈焰護符或抗火藥水能保住探索節奏', '進入前確認武器與防具耐久'],
            bossWarning: '炎獄不是魔王眷屬，它只想把戰場燒穿。請把這場當成終局前的壓力測試。',
            completion: '深淵的火種被壓回裂縫，通往黑焰邊境的最後準備終於有了形狀。'
        },
        floors: 7,
        bossFloor: 8,
        
        // 特殊機制：灼燒傷害
        mechanic: {
            type: 'burn',
            name: '煉獄烈焰',
            description: '每步受到灼熱傷害，並定期加速武器與防具耐久消耗。裝備「烈焰護符」可免疫。',
            icon: '🔥',
            effect: {
                damagePerStep: 0.02,    // 每步傷害
                fireDamageBonus: 1.5,   // 火系怪物傷害加成
                healingReduction: 0.5  // 治療效果減半
            },
            counterItem: 'flame_amulet',  // 烈焰護符可免疫
            alternativeCounter: 'fire_resist_potion'  // 或使用抗火藥水
        },
        
        environment: {
            ambiance: '岩漿沸騰的聲音和亡魂的哀號交織...',
            hazards: ['岩漿噴發', '惡魔突襲', '詛咒領域'],
            events: [
                { type: 'lava', name: '岩漿噴發', damage: 50, chance: 0.15 },
                { type: 'trap', name: '惡魔突襲', monsterType: 'elite', chance: 0.12 },
                { type: 'curse', name: '詛咒領域', effect: 'curse', debuff: { attack: -10, defense: -10 }, duration: 10, chance: 0.1 },
                { type: 'soul_well', name: '靈魂之井', healPercent: 0.5, chance: 0.05 },
                { type: 'treasure', name: '惡魔寶庫', goldRange: [200, 500], itemChance: 0.45, chance: 0.08 },
                { type: 'contract', name: '惡魔契約', choice: true, itemChance: 0.55, chance: 0.1 }  // 可選擇簽訂或拒絕
            ]
        },
        
        monsters: {
            common: [
                { id: 'imp', name: '小惡魔', icon: '😈', hp: 80, attack: 35, defense: 10, exp: 70, gold: [50, 100], special: '火焰彈：遠程攻擊' },
                { id: 'hell_hound', name: '地獄犬', icon: '🐕‍🦺', hp: 120, attack: 40, defense: 15, exp: 85, gold: [60, 120], special: '烈焰吐息：附帶灼燒效果' },
                { id: 'tormented_soul', name: '受難亡魂', icon: '💀', hp: 60, attack: 45, defense: 5, exp: 75, gold: [40, 80], special: '生命汲取：傷害的 30% 轉為自身 HP' },
                { id: 'lava_golem', name: '熔岩巨像', icon: '🌋', hp: 180, attack: 30, defense: 30, exp: 100, gold: [80, 160], special: '熔岩濺射：攻擊時對攻擊者造成反傷' }
            ],
            elite: [
                {
                    id: 'pit_fiend',
                    name: '深淵領主',
                    icon: '👿',
                    hp: 300,
                    attack: 55,
                    defense: 25,
                    exp: 250,
                    gold: [200, 400],
                    drops: [
                        { itemId: 'demon_core', chance: 0.22, quantity: [1, 1] },
                        { itemId: 'abyssal_shard', chance: 0.18, quantity: [1, 1] }
                    ],
                    special: '地獄火：每 3 秒對全體造成 15 點傷害'
                }
            ],
            boss: {
                id: 'demon_king', name: '惡魔領主・炎獄', icon: '👹',
                hp: 1000, attack: 60, defense: 35, exp: 1000, gold: [1000, 2000],
                drops: [
                    { itemId: 'demon_core', chance: 0.7, quantity: [1, 2] },
                    { itemId: 'abyssal_shard', chance: 0.45, quantity: [1, 2] },
                    { itemId: 'void_essence', chance: 0.16, quantity: [1, 1] }
                ],
                skills: [
                    { name: '末日審判', aoe: true, damage: 80, description: '召喚地獄之火焚燒一切' },
                    { name: '深淵凝視', effect: 'fear', duration: 3, atkDebuff: 0.5, description: '凝視使目標陷入極度恐懼' },
                    { name: '惡魔召喚', effect: 'summon', monsterIds: ['imp', 'imp', 'hell_hound'], description: '召喚惡魔僕從' },
                    { name: '煉獄領域', effect: 'field', burnDamageBoost: 2, duration: 5, description: '強化煉獄環境' },
                    { name: '地脈怒焰', damage: 100, selfHeal: 200, cooldown: 5, description: '將地脈裂縫的烈焰凝成全力一擊，並修補自身熔岩外殼' }
                ],
                phases: [
                    { hpThreshold: 0.75, message: '炎獄拍擊裂谷，熔岩河開始逆流。' },
                    { hpThreshold: 0.5, message: '炎獄吞下深淵餘火，煉獄領域開始擴張。', summon: true },
                    { hpThreshold: 0.25, message: '地脈傷口被撕得更深，炎獄進入失控狀態。', atkBoost: 2, defBoost: 0.5 }
                ],
                dialogue: {
                    encounter: '地脈在流血，凡人。你只是下一撮灰。',
                    defeat: '火種...不會...熄滅...'
                }
            }
        },
        
        treasures: {
            guaranteed: {
                id: 'crown_of_hell',
                name: '煉獄王冠',
                icon: '👑',
                type: 'accessory',
                rarity: 'legendary',
                description: '從炎獄崩解的熔岩核心中冷卻出的冠冕，仍像地脈傷口一樣發燙。',
                stats: { attack: 30, defense: 20, hp: 100 },
                special: { 
                    burnImmune: true, 
                    fireAbsorb: 0.3,     // 吸收 30% 火系傷害轉為 HP
                    demonSlayer: 1.5,    // 對惡魔類傷害 +50%
                    intimidate: 0.1      // 10% 機率使敵人恐懼並短暫停手
                },
                price: 5000
            },
            random: [
                { id: 'demon_horn', name: '惡魔之角', icon: '🦯', type: 'material', rarity: 'legendary', price: 500 },
                { id: 'soul_essence', name: '靈魂精華', icon: '✨', type: 'material', rarity: 'epic', price: 350 },
                { id: 'lava_core', name: '熔岩核心', icon: '🔴', type: 'material', rarity: 'epic', price: 400 },
                { id: 'infernal_blade', name: '煉獄之刃', icon: '🗡️', type: 'weapon', rarity: 'legendary', stats: { attack: 50, critChance: 0.2, critDamage: 2.0 }, special: { burnOnHit: { damage: 10, duration: 3 } }, price: 3000 }
            ]
        },
        
        theme: {
            primaryColor: '#8b0000',
            secondaryColor: '#2d0000',
            accentColor: '#ff4500',
            backgroundGradient: 'linear-gradient(180deg, #2d0000 0%, #8b0000 50%, #ff4500 100%)'
        }
    },

    // ========== 6. 光明副本 (難度: ★★★★★★) ==========
    [DungeonType.RADIANT_CORRIDOR]: {
        id: DungeonType.RADIANT_CORRIDOR,
        name: '黎明迴廊',
        icon: '☀️',
        description: '被極光切開的高階迴廊。這裡不是微光的自然升階，而是玩家正式取得光明素材、準備抗衡無盡塔虛空壓力的門檻。',
        story: DungeonStoryDatabase.radiant_corridor || null,
        difficulty: DungeonDifficulty.LEGEND,
        recommendLevel: 30,
        contentPlan: {
            targetLevelRange: [70, 80],
            role: 'light_counter_to_tower_void',
            rewardLines: ['radiant_series'],
            materialGroups: ['radiant_light'],
            blockedDrops: [],
            requiredContext: ['glimmer_precursor', 'tower_void_pressure']
        },
        challenge: {
            playstyle: '節奏壓力副本：高攻速、高暴擊玩家若只追求爆發，會被鏡翼反制；穩定輸出與防禦節奏更重要。',
            riskBrief: '光明敵人會放大玩家的節奏失誤，拖太久會讓怪物累積曦光層數，輸出窗口會越來越短。',
            rewardBrief: '正式光明素材、光明誓約套裝與抗塔前置裝備。',
            preparation: ['微光或暗影前置裝備能降低入門壓力', '建議先準備可控攻速與防禦向裝備，不要只堆暴擊'],
            bossWarning: '極光執政官會鏡照玩家的輸出節奏。爆發越無腦，反制越痛。',
            completion: '黎明迴廊的光路被穩定下來，玩家終於能帶著正式光明裝備踏入塔的虛空壓力。'
        },
        floors: 5,
        bossFloor: 6,

        mechanic: {
            type: 'radiant_rhythm',
            name: '曦光節奏',
            description: '連續輸出會累積曦光層數，提高攻速但也提高被鏡翼反制的風險。光明誓約裝備可讓層數衰退更平滑。',
            icon: '☀️',
            effect: {
                rhythmStackMax: 5,
                attackSpeedPerStack: 0.04,
                mirrorPunishThreshold: 4,
                cleanseVoidPressure: 0.25
            },
            counterSet: 'radiant_vow',
            precursorSet: 'glimmer_initiate'
        },

        environment: {
            ambiance: '白金色光線沿著石柱流動，遠處傳來像玻璃互相摩擦的低鳴。',
            hazards: ['鏡面折返', '曦光過載', '虛空殘響'],
            events: [
                { type: 'trap', name: '鏡面折返', damage: 45, chance: 0.12 },
                { type: 'radiant_overload', name: '曦光過載', effect: 'attack_speed_up_damage_taken_up', duration: 4, chance: 0.12 },
                { type: 'void_echo', name: '虛空殘響', effect: 'void_pressure', damage: 35, chance: 0.08 },
                { type: 'rest', name: '黎明靜室', healPercent: 0.28, chance: 0.08 },
                { type: 'treasure', name: '光藏櫃', goldRange: [260, 620], itemChance: 0.5, chance: 0.1 }
            ]
        },

        monsters: {
            common: [
                {
                    id: 'prism_wisp',
                    name: '棱光微靈',
                    icon: '◇',
                    hp: 520,
                    attack: 86,
                    defense: 34,
                    exp: 360,
                    gold: [180, 320],
                    drops: [
                        { itemId: 'radiant_thread', chance: 0.38, quantity: [1, 1] },
                        { itemId: 'glimmer_shard', chance: 0.3, quantity: [1, 2] }
                    ],
                    equipmentDrops: [
                        { equipmentId: 'prism_focus', chance: 0.04 }
                    ],
                    special: '折光脈衝：短暫提高自身攻速。'
                },
                {
                    id: 'dawn_sentinel',
                    name: '黎明衛士',
                    icon: '☀',
                    hp: 720,
                    attack: 92,
                    defense: 48,
                    exp: 440,
                    gold: [220, 380],
                    drops: [
                        { itemId: 'radiant_thread', chance: 0.55, quantity: [1, 2] },
                        { itemId: 'light_essence', chance: 0.16, quantity: [1, 1] }
                    ],
                    equipmentDrops: [
                        { equipmentId: 'dawnbrand_sword', chance: 0.035 }
                    ],
                    special: '晨盾：低血量時提升防禦。'
                }
            ],
            elite: [
                {
                    id: 'radiant_keeper',
                    name: '光明守藏者',
                    icon: '✺',
                    hp: 980,
                    attack: 104,
                    defense: 58,
                    exp: 620,
                    gold: [360, 620],
                    drops: [
                        { itemId: 'light_essence', chance: 0.42, quantity: [1, 1] },
                        { itemId: 'radiant_shard', chance: 0.28, quantity: [1, 1] }
                    ],
                    equipmentDrops: [
                        { equipmentId: 'dawnbrand_sword', chance: 0.07 },
                        { equipmentId: 'aurora_ward_plate', chance: 0.045 }
                    ],
                    special: '光藏守勢：防禦越高，反擊越重。'
                },
                {
                    id: 'mirror_seraph',
                    name: '鏡翼熾使',
                    icon: '✧',
                    hp: 920,
                    attack: 112,
                    defense: 50,
                    exp: 650,
                    gold: [380, 680],
                    drops: [
                        { itemId: 'radiant_shard', chance: 0.38, quantity: [1, 1] },
                        { itemId: 'light_essence', chance: 0.32, quantity: [1, 1] }
                    ],
                    equipmentDrops: [
                        { equipmentId: 'prism_focus', chance: 0.075 }
                    ],
                    special: '鏡翼反制：玩家連續暴擊時觸發反傷窗口。'
                }
            ],
            boss: {
                id: 'aurora_archon',
                name: '極光執政官',
                icon: '✷',
                hp: 2400,
                attack: 118,
                defense: 62,
                exp: 1800,
                gold: [1500, 2600],
                drops: [
                    { itemId: 'radiant_core', chance: 1.0, quantity: [1, 1] },
                    { itemId: 'radiant_shard', chance: 0.85, quantity: [1, 2] },
                    { itemId: 'light_essence', chance: 0.6, quantity: [1, 2] }
                ],
                equipmentDrops: [
                    { equipmentId: 'dawnbrand_sword', chance: 0.18 },
                    { equipmentId: 'prism_focus', chance: 0.16 },
                    { equipmentId: 'aurora_ward_plate', chance: 0.14 }
                ],
                skills: [
                    { name: '極光裁定', damage: 130, description: '凝成一道高壓光束，對節奏層數過高的玩家追加傷害。' },
                    { name: '鏡照脈衝', effect: 'reflect', duration: 2, description: '短暫反射過高頻率的連續攻擊。' },
                    { name: '黎明重構', effect: 'cleanse', heal: 260, description: '清除自身負面狀態並修復光甲。' }
                ],
                phases: [
                    { hpThreshold: 0.7, message: '迴廊光柱開始旋轉，曦光節奏加快。' },
                    { hpThreshold: 0.4, message: '極光執政官張開鏡翼，反制窗口變得更短。', reflect: true },
                    { hpThreshold: 0.18, message: '白金色裂縫吞掉殘留虛空，最後的光壓落下。', atkBoost: 1.35 }
                ],
                dialogue: {
                    encounter: '能在黑塔前站穩的人，先證明你能掌握自己的節奏。',
                    defeat: '光路已開。別讓塔知道你仍在害怕。'
                }
            }
        },

        treasures: {
            guaranteed: {
                id: 'radiant_core',
                name: '極光核心',
                icon: '🌅',
                type: 'material',
                rarity: 'legendary',
                description: '極光執政官崩解後留下的光明核心。',
                price: 2400
            },
            random: [
                { id: 'radiant_thread', name: '輝光絲', icon: '🧵', type: 'material', rarity: 'rare', price: 520 },
                { id: 'light_essence', name: '光明精華', icon: '☀️', type: 'material', rarity: 'epic', price: 900 },
                { id: 'radiant_shard', name: '曦光碎晶', icon: '💠', type: 'material', rarity: 'epic', price: 1100 },
                { id: 'dawnbrand_sword', name: '黎印長劍', icon: '☀️', type: 'weapon', rarity: 'legendary', stats: { attack: 96, defense: 10 }, price: 5200 }
            ]
        },

        theme: {
            primaryColor: '#f8d56b',
            secondaryColor: '#2b2b34',
            accentColor: '#8ad7ff',
            backgroundGradient: 'linear-gradient(180deg, #1f2430 0%, #70613a 48%, #f8d56b 100%)'
        }
    }
};

// ==================== 副本入口生成配置 ====================
export const DungeonSpawnConfig = {
    // 每種副本只會在地圖上存在一個
    maxInstancesPerType: 1,
    
    // 副本入口重新生成間隔（完成後多久才會再出現）
    respawnCooldown: {
        [DungeonType.CAVE]: 0,        // 洞窟：立即可重複
        [DungeonType.SNOW]: 300000,   // 雪山：5分鐘
        [DungeonType.RUINS]: 600000,  // 遺跡：10分鐘
        [DungeonType.JUNGLE]: 900000, // 叢林：15分鐘
        [DungeonType.HELL]: 1800000,  // 地獄：30分鐘
        [DungeonType.RADIANT_CORRIDOR]: 1800000 // 黎明迴廊：30分鐘
    },
    
    // 副本在地圖上的生成區域
    spawnZones: {
        [DungeonType.CAVE]: ['low', 'medium'],      // 洞窟：安全/普通區
        [DungeonType.SNOW]: ['medium', 'high'],     // 雪山：普通/危險區
        [DungeonType.RUINS]: ['medium', 'high'],    // 遺跡：普通/危險區
        [DungeonType.JUNGLE]: ['high'],             // 叢林：危險區
        [DungeonType.HELL]: ['boss'],               // 地獄：Boss區
        [DungeonType.RADIANT_CORRIDOR]: ['boss']    // 黎明迴廊：終局區
    }
};

// ==================== 輔助函數 ====================

/**
 * 根據類型獲取副本資料
 */
applyLegacyLevelProgressionToDungeonDatabase(DungeonDatabase);

export function getDungeonByType(type) {
    return DungeonDatabase[type] || null;
}

/**
 * 獲取所有副本列表
 */
export function getAllDungeons() {
    return Object.values(DungeonDatabase);
}

/**
 * 根據難度獲取副本列表
 */
export function getDungeonsByDifficulty(difficulty) {
    return Object.values(DungeonDatabase).filter(d => d.difficulty === difficulty);
}

/**
 * 獲取副本的推薦等級範圍
 */
export function getRecommendedDungeons(playerLevel) {
    return Object.values(DungeonDatabase).filter(d => {
        return playerLevel >= d.recommendLevel - 3 && playerLevel <= d.recommendLevel + 5;
    });
}

/**
 * 生成副本隨機怪物
 */
export function generateDungeonMonster(dungeonType, floor, isElite = false) {
    const dungeon = DungeonDatabase[dungeonType];
    if (!dungeon) return null;
    
    const pool = isElite ? dungeon.monsters.elite : dungeon.monsters.common;
    const monster = pool[Math.floor(Math.random() * pool.length)];
    
    // 根據樓層調整屬性
    const floorMultiplier = 1 + (floor - 1) * 0.15;
    const attack = Math.floor((monster.attack ?? monster.atk ?? 0) * floorMultiplier);
    const defense = Math.floor((monster.defense ?? monster.def ?? 0) * floorMultiplier);
    const level = Math.max(1, (Number(dungeon.recommendLevel) || 1) + floor - 1 + (isElite ? 2 : 0));
    
    return applyMonsterCombatBalance({
        ...monster,
        level,
        hp: Math.floor(monster.hp * floorMultiplier),
        maxHp: Math.floor(monster.hp * floorMultiplier),
        attack,
        defense,
        atk: attack,
        def: defense,
        exp: Math.floor(monster.exp * floorMultiplier),
        gold: monster.gold.map(g => Math.floor(g * floorMultiplier))
    });
}

/**
 * 生成副本 Boss
 */
export function generateDungeonBoss(dungeonType) {
    const dungeon = DungeonDatabase[dungeonType];
    if (!dungeon) return null;
    const boss = dungeon.monsters.boss;
    const attack = boss.attack ?? boss.atk ?? 0;
    const defense = boss.defense ?? boss.def ?? 0;
    const level = Math.max(1, (Number(dungeon.recommendLevel) || 1) + 3);
    
    return applyMonsterCombatBalance({
        ...boss,
        level,
        maxHp: boss.hp,
        attack,
        defense,
        atk: attack,
        def: defense,
        isBoss: true
    });
}

/**
 * 生成樓層事件
 */
export function generateFloorEvent(dungeonType) {
    const dungeon = DungeonDatabase[dungeonType];
    if (!dungeon) return null;
    
    const events = dungeon.environment.events;
    const roll = Math.random();
    let cumulative = 0;
    
    for (const event of events) {
        cumulative += event.chance;
        if (roll < cumulative) {
            return { ...event };
        }
    }
    
    return null; // 沒有事件
}
