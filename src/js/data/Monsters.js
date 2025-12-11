/**
 * Monsters.js
 * 怪物資料庫 - 包含主線任務和無盡塔所有怪物
 * 難度線性設計，配合角色等級成長
 */

// 導入裝備資料庫（用於掉落判定）
// import { getEquipment } from './Equipment.js';

// 怪物類型
export const MonsterType = {
    NORMAL: 'normal',       // 普通怪物
    ELITE: 'elite',         // 精英怪物
    BOSS: 'boss',           // BOSS
    WORLD_BOSS: 'world_boss' // 世界BOSS
};

// 怪物元素屬性
export const MonsterElement = {
    NONE: 'none',
    FIRE: 'fire',
    ICE: 'ice',
    THUNDER: 'thunder',
    EARTH: 'earth',
    SHADOW: 'shadow',
    HOLY: 'holy'
};

/**
 * 怪物資料庫
 * 設計原則：
 * - HP = 基礎值 × 等級係數
 * - ATK = 基礎值 × 等級係數
 * - 玩家 HP = 100 + (等級 × 20)
 * - 玩家攻防依賴裝備
 */
export const MonsterDatabase = {
    // ==================== 第一章：初始之地 (Lv.1-3) ====================
    slime: {
        id: 'slime',
        name: '史萊姆',
        icon: '🟢',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 1,
        hp: 40,

        maxHp: 40,
        attack: 5,
        defense: 2,
        exp: 15,
        gold: 10,
        drops: [
            { itemId: 'slime_jelly', chance: 0.5, quantity: [1, 2] },
            { itemId: 'health_potion_s', chance: 0.1, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'slime_sword', chance: 0.02 }  // 2% 掉落史萊姆之劍
        ],
        skills: [],
        description: '最基礎的怪物，適合新手練習。'
    },
    
    // 低等級怪物 (Lv.1-3)
    goblin: {
        id: 'goblin',
        name: '哥布林',
        icon: '👺',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 2,
        hp: 50,
        maxHp: 50,
        attack: 8,
        defense: 3,
        exp: 20,
        gold: 15,
        drops: [
            { itemId: 'goblin_coin', chance: 0.5, quantity: [1, 3] },
            { itemId: 'health_potion_s', chance: 0.15, quantity: [1, 1] }
        ],
        skills: [],
        description: '矮小但狡猾的哥布林。'
    },
    
    wild_wolf: {
        id: 'wild_wolf',
        name: '野狼',
        icon: '🐺',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 2,
        hp: 45,
        maxHp: 45,
        attack: 10,
        defense: 2,
        exp: 18,
        gold: 12,
        drops: [
            { itemId: 'wolf_fang', chance: 0.4, quantity: [1, 2] },
            { itemId: 'wolf_pelt', chance: 0.25, quantity: [1, 1] }
        ],
        skills: [],
        description: '森林中的野狼，攻擊性強。'
    },
    
    skeleton: {
        id: 'skeleton',
        name: '骷髏兵',
        icon: '💀',
        type: MonsterType.NORMAL,
        element: MonsterElement.SHADOW,
        level: 3,
        hp: 60,
        maxHp: 60,
        attack: 12,
        defense: 5,
        exp: 25,
        gold: 20,
        drops: [
            { itemId: 'bone_fragment', chance: 0.5, quantity: [1, 3] },
            { itemId: 'iron_ore', chance: 0.2, quantity: [1, 1] }
        ],
        skills: [],
        description: '被黑暗力量復活的骷髏士兵。'
    },
    
    giant_rat: {
        id: 'giant_rat',
        name: '巨鼠',
        icon: '🐀',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 1,
        hp: 30,
        maxHp: 30,
        attack: 4,
        defense: 1,
        exp: 10,
        gold: 5,
        drops: [
            { itemId: 'rat_tail', chance: 0.6, quantity: [1, 1] }
        ],
        skills: [],
        description: '下水道中常見的巨型老鼠。'
    },
    
    // 中等級怪物 (Lv.4-6)
    orc_warrior: {
        id: 'orc_warrior',
        name: '獸人戰士',
        icon: '👹',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 4,
        hp: 90,
        maxHp: 90,
        attack: 18,
        defense: 8,
        exp: 40,
        gold: 30,
        drops: [
            { itemId: 'orc_fang', chance: 0.4, quantity: [1, 2] },
            { itemId: 'iron_ore', chance: 0.3, quantity: [1, 2] }
        ],
        skills: ['heavy_strike'],
        description: '強壯的獸人戰士。'
    },
    
    shadow_bat: {
        id: 'shadow_bat',
        name: '暗影蝙蝠',
        icon: '🦇',
        type: MonsterType.NORMAL,
        element: MonsterElement.SHADOW,
        level: 4,
        hp: 70,
        maxHp: 70,
        attack: 15,
        defense: 4,
        exp: 35,
        gold: 25,
        drops: [
            { itemId: 'bat_wing', chance: 0.5, quantity: [1, 2] },
            { itemId: 'shadow_shard', chance: 0.15, quantity: [1, 1] }
        ],
        skills: ['sonic_screech'],
        description: '在黑暗中飛行的蝙蝠。'
    },
    
    poison_spider: {
        id: 'poison_spider',
        name: '毒蜘蛛',
        icon: '🕷️',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 5,
        hp: 80,
        maxHp: 80,
        attack: 20,
        defense: 5,
        exp: 45,
        gold: 35,
        drops: [
            { itemId: 'spider_silk', chance: 0.5, quantity: [1, 2] },
            { itemId: 'poison_gland', chance: 0.3, quantity: [1, 1] }
        ],
        skills: ['poison_bite'],
        description: '會噴射毒液的巨型蜘蛛。'
    },
    
    stone_golem_mini: {
        id: 'stone_golem_mini',
        name: '小石像',
        icon: '🗿',
        type: MonsterType.NORMAL,
        element: MonsterElement.EARTH,
        level: 5,
        hp: 100,
        maxHp: 100,
        attack: 14,
        defense: 12,
        exp: 50,
        gold: 40,
        drops: [
            { itemId: 'stone_fragment', chance: 0.6, quantity: [2, 3] },
            { itemId: 'golem_core', chance: 0.1, quantity: [1, 1] }
        ],
        skills: ['stone_fist'],
        description: '由石頭構成的小型魔像。'
    },
    
    // NOTE: data module contains raw monster definitions in a local object.
    // Lookup and behavior functions (getMonster, getTowerMonster, createMonsterInstance, etc.)
    // have been moved to `src/js/managers/MonsterManager.js` to keep data files logic-free.
    
    treant: {
        id: 'treant',
        name: '樹人',
        icon: '🌳',
        type: MonsterType.NORMAL,
        element: MonsterElement.EARTH,
        level: 6,
        hp: 120,

        maxHp: 120,
        attack: 12,
        defense: 10,
        exp: 50,
        gold: 35,
        drops: [
            { itemId: 'ancient_bark', chance: 0.4, quantity: [1, 2] },
            { itemId: 'life_seed', chance: 0.15, quantity: [1, 1] }
        ],
        skills: ['root_bind'],
        description: '森林的守護者，防禦極高。'
    },
    
    // 第二章 BOSS
    forest_guardian: {
        id: 'forest_guardian',
        name: '森林守衛者',
        icon: '🌲',
        type: MonsterType.BOSS,
        element: MonsterElement.EARTH,
        level: 5,
        hp: 300,

        maxHp: 300,
        attack: 20,
        defense: 12,
        exp: 150,
        gold: 100,
        drops: [
            { itemId: 'guardian_branch', chance: 1.0, quantity: [1, 1] },
            { itemId: 'forest_essence', chance: 0.5, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'forest_guardian_staff', chance: 0.15 },
            { equipmentId: 'forest_guardian_crown', chance: 0.10 }
        ],
        skills: ['nature_wrath', 'root_bind', 'regeneration'],
        description: '守護森林的古老存在。'
    },

    // ==================== 第三章：廢墟遺跡 (Lv.6-10) ====================
    skeleton_warrior: {
        id: 'skeleton_warrior',
        name: '骷髏戰士',
        icon: '💀',
        type: MonsterType.NORMAL,
        element: MonsterElement.SHADOW,
        level: 7,
        hp: 100,

        maxHp: 100,
        attack: 18,
        defense: 8,
        exp: 55,
        gold: 40,
        drops: [
            { itemId: 'bone_fragment', chance: 0.6, quantity: [2, 4] },  // 提高掉落
            { itemId: 'iron_ore', chance: 0.4, quantity: [1, 3] }
        ],
        skills: ['sword_slash'],
        description: '被黑暗力量復活的骷髏。'
    },
    
    ghost: {
        id: 'ghost',
        name: '幽靈',
        icon: '👻',
        type: MonsterType.NORMAL,
        element: MonsterElement.SHADOW,
        level: 8,
        hp: 80,

        maxHp: 80,
        attack: 22,
        defense: 5,
        exp: 60,
        gold: 45,
        drops: [
            { itemId: 'ectoplasm', chance: 0.4, quantity: [1, 2] },
            { itemId: 'spirit_essence', chance: 0.2, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'ghost_cloak', chance: 0.05 }
        ],
        skills: ['phase_through', 'soul_drain'],
        description: '徘徊在遺跡中的亡魂。'
    },
    
    stone_golem: {
        id: 'stone_golem',
        name: '石像守衛',
        icon: '🗿',
        type: MonsterType.NORMAL,
        element: MonsterElement.EARTH,
        level: 9,
        hp: 180,

        maxHp: 180,
        attack: 16,
        defense: 18,
        exp: 70,
        gold: 50,
        drops: [
            { itemId: 'golem_core', chance: 0.3, quantity: [1, 1] },
            { itemId: 'stone_fragment', chance: 0.5, quantity: [2, 4] }
        ],
        skills: ['stone_fist', 'harden'],
        description: '守護遺跡的石像魔像。'
    },
    
    // 第三章 BOSS
    lich: {
        id: 'lich',
        name: '巫妖',
        icon: '☠️',
        type: MonsterType.BOSS,
        element: MonsterElement.SHADOW,
        level: 10,
        hp: 400,

        maxHp: 400,
        attack: 28,
        defense: 12,
        exp: 200,
        gold: 150,
        drops: [
            { itemId: 'lich_phylactery', chance: 1.0, quantity: [1, 1] },
            { itemId: 'dark_crystal', chance: 0.7, quantity: [1, 2] },
            { itemId: 'shadow_shard', chance: 0.5, quantity: [2, 3] }
        ],
        equipmentDrops: [
            { equipmentId: 'lich_staff', chance: 0.20 }
        ],
        skills: ['dark_bolt', 'summon_skeleton', 'life_drain'],
        description: '操控亡靈的邪惡法師。'
    },

    // ==================== 第四章：暗影入侵 (Lv.10-14) ====================
    shadow_soldier: {
        id: 'shadow_soldier',
        name: '暗影士兵',
        icon: '🗡️',
        type: MonsterType.NORMAL,
        element: MonsterElement.SHADOW,
        level: 11,
        hp: 150,

        maxHp: 150,
        attack: 26,
        defense: 14,
        exp: 80,
        gold: 55,
        drops: [
            { itemId: 'shadow_shard', chance: 0.4, quantity: [1, 2] },
            { itemId: 'dark_steel', chance: 0.25, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'shadow_blade_drop', chance: 0.04 },
            { equipmentId: 'shadow_armor_drop', chance: 0.03 }
        ],
        skills: ['shadow_strike'],
        description: '暗影軍團的先鋒部隊。'
    },
    
    shadow_archer: {
        id: 'shadow_archer',
        name: '暗影弓手',
        icon: '🏹',
        type: MonsterType.NORMAL,
        element: MonsterElement.SHADOW,
        level: 12,
        hp: 120,

        maxHp: 120,
        attack: 32,
        defense: 10,
        exp: 85,
        gold: 60,
        drops: [
            { itemId: 'shadow_shard', chance: 0.4, quantity: [1, 2] },
            { itemId: 'shadow_arrow', chance: 0.3, quantity: [3, 6] }
        ],
        skills: ['shadow_shot', 'multishot'],
        description: '遠程攻擊的暗影戰士。'
    },
    
    shadow_mage: {
        id: 'shadow_mage',
        name: '暗影法師',
        icon: '🧙',
        type: MonsterType.ELITE,
        element: MonsterElement.SHADOW,
        level: 13,
        hp: 140,

        maxHp: 140,
        attack: 38,
        defense: 8,
        exp: 100,
        gold: 70,
        drops: [
            { itemId: 'shadow_essence', chance: 0.35, quantity: [1, 1] },
            { itemId: 'magic_crystal', chance: 0.25, quantity: [1, 2] }
        ],
        equipmentDrops: [
            { equipmentId: 'shadow_boots', chance: 0.05 }
        ],
        skills: ['shadow_bolt', 'dark_curse'],
        description: '操控暗影魔法的法師。'
    },
    
    // 第4章 BOSS
    shadow_commander: {
        id: 'shadow_commander',
        name: '暗影指揮官',
        icon: '⚔️',
        type: MonsterType.BOSS,
        element: MonsterElement.SHADOW,
        level: 14,
        hp: 550,

        maxHp: 550,
        attack: 40,
        defense: 20,
        exp: 280,
        gold: 200,
        drops: [
            { itemId: 'commander_blade', chance: 1.0, quantity: [1, 1] },
            { itemId: 'shadow_core', chance: 0.8, quantity: [1, 2] },
            { itemId: 'shadow_essence', chance: 0.5, quantity: [2, 3] },
            { itemId: 'dark_steel', chance: 0.4, quantity: [2, 3] }
        ],
        equipmentDrops: [
            { equipmentId: 'shadow_commander_blade', chance: 0.25 }
        ],
        skills: ['shadow_slash', 'rally_troops', 'dark_aura'],
        description: '統領暗影軍團的指揮官。'
    },

    // ==================== 第五章：古代遺跡 (Lv.14-18) ====================
    ancient_guardian: {
        id: 'ancient_guardian',
        name: '遺跡守衛',
        icon: '🤖',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 15,
        hp: 220,

        maxHp: 220,
        attack: 36,
        defense: 22,
        exp: 110,
        gold: 75,
        drops: [
            { itemId: 'ancient_gear', chance: 0.4, quantity: [1, 2] },
            { itemId: 'mithril_ore', chance: 0.35, quantity: [1, 2] }
        ],
        equipmentDrops: [
            { equipmentId: 'ancient_sword', chance: 0.05 }
        ],
        skills: ['energy_beam', 'shield_bash'],
        description: '古代文明製造的機械守衛。'
    },
    
    crystal_golem: {
        id: 'crystal_golem',
        name: '水晶魔像',
        icon: '💎',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 16,
        hp: 280,

        maxHp: 280,
        attack: 32,
        defense: 28,
        exp: 120,
        gold: 80,
        drops: [
            { itemId: 'crystal_shard', chance: 0.45, quantity: [1, 3] },
            { itemId: 'pure_crystal', chance: 0.15, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'crystal_shield', chance: 0.05 }
        ],
        skills: ['crystal_strike', 'reflect'],
        description: '由純淨水晶構成的魔像。'
    },
    
    rune_keeper: {
        id: 'rune_keeper',
        name: '符文守護者',
        icon: '📜',
        type: MonsterType.ELITE,
        element: MonsterElement.HOLY,
        level: 17,
        hp: 200,

        maxHp: 200,
        attack: 45,
        defense: 18,
        exp: 140,
        gold: 90,
        drops: [
            { itemId: 'ancient_rune', chance: 0.35, quantity: [1, 1] },
            { itemId: 'rune_stone', chance: 0.3, quantity: [1, 2] },
            { itemId: 'mithril_ore', chance: 0.25, quantity: [1, 1] },
            { itemId: 'crystal_shard', chance: 0.2, quantity: [1, 2] }
        ],
        equipmentDrops: [
            { equipmentId: 'rune_gauntlet', chance: 0.06 }
        ],
        skills: ['rune_blast', 'rune_shield'],
        description: '守護古代符文的神秘存在。'
    },
    
    // 第5章 BOSS
    ancient_titan: {
        id: 'ancient_titan',
        name: '遠古泰坦',
        icon: '🗽',
        type: MonsterType.BOSS,
        element: MonsterElement.EARTH,
        level: 18,
        hp: 700,

        maxHp: 700,
        attack: 48,
        defense: 25,
        exp: 350,
        gold: 250,
        drops: [
            { itemId: 'titan_heart', chance: 1.0, quantity: [1, 1] },
            { itemId: 'ancient_artifact', chance: 0.6, quantity: [1, 1] },
            { itemId: 'primordial_stone', chance: 0.4, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'titan_hammer', chance: 0.20 }
        ],
        skills: ['titan_slam', 'earthquake', 'ancient_power'],
        description: '沉睡萬年的遠古巨人。'
    },

    // ==================== 第六章：元素試煉 (Lv.18-22) ====================
    fire_elemental: {
        id: 'fire_elemental',
        name: '火元素',
        icon: '🔥',
        type: MonsterType.NORMAL,
        element: MonsterElement.FIRE,
        level: 19,
        hp: 200,

        maxHp: 200,
        attack: 52,
        defense: 15,
        exp: 150,
        gold: 95,
        drops: [
            { itemId: 'fire_essence', chance: 0.45, quantity: [1, 2] },
            { itemId: 'ember_stone', chance: 0.25, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'flame_sword', chance: 0.05 }
        ],
        skills: ['fireball', 'flame_burst'],
        description: '純粹的火焰元素生物。'
    },
    
    ice_elemental: {
        id: 'ice_elemental',
        name: '冰元素',
        icon: '❄️',
        type: MonsterType.NORMAL,
        element: MonsterElement.ICE,
        level: 19,
        hp: 220,

        maxHp: 220,
        attack: 48,
        defense: 18,
        exp: 150,
        gold: 95,
        drops: [
            { itemId: 'ice_essence', chance: 0.45, quantity: [1, 2] },
            { itemId: 'frost_crystal', chance: 0.25, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'frost_blade', chance: 0.05 }
        ],
        skills: ['ice_spike', 'freeze'],
        description: '純粹的冰霜元素生物。'
    },
    
    thunder_elemental: {
        id: 'thunder_elemental',
        name: '雷元素',
        icon: '⚡',
        type: MonsterType.NORMAL,
        element: MonsterElement.THUNDER,
        level: 20,
        hp: 180,

        maxHp: 180,
        attack: 58,
        defense: 12,
        exp: 160,
        gold: 100,
        drops: [
            { itemId: 'thunder_essence', chance: 0.45, quantity: [1, 2] },
            { itemId: 'storm_crystal', chance: 0.25, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'thunder_axe', chance: 0.05 }
        ],
        skills: ['lightning_bolt', 'chain_lightning'],
        description: '純粹的雷電元素生物。'
    },
    
    earth_elemental: {
        id: 'earth_elemental',
        name: '土元素',
        icon: '🪨',
        type: MonsterType.NORMAL,
        element: MonsterElement.EARTH,
        level: 20,
        hp: 300,

        maxHp: 300,
        attack: 42,
        defense: 30,
        exp: 160,
        gold: 100,
        drops: [
            { itemId: 'earth_essence', chance: 0.45, quantity: [1, 2] },
            { itemId: 'geo_crystal', chance: 0.25, quantity: [1, 1] }
        ],
        skills: ['rock_throw', 'earth_wall'],
        description: '純粹的大地元素生物。'
    },
    
    // 第6章 BOSS
    elemental_lord: {
        id: 'elemental_lord',
        name: '元素之主',
        icon: '🌈',
        type: MonsterType.BOSS,
        element: MonsterElement.NONE,
        level: 22,
        hp: 900,

        maxHp: 900,
        attack: 55,
        defense: 28,
        exp: 450,
        gold: 350,
        drops: [
            { itemId: 'elemental_core', chance: 1.0, quantity: [1, 2] },
            { itemId: 'primal_essence', chance: 0.6, quantity: [1, 2] },
            { itemId: 'fire_essence', chance: 0.5, quantity: [2, 3] },
            { itemId: 'ice_essence', chance: 0.5, quantity: [2, 3] }
        ],
        equipmentDrops: [
            { equipmentId: 'elemental_crown', chance: 0.25 }
        ],
        skills: ['elemental_shift', 'primal_burst', 'elemental_storm'],
        description: '掌控四大元素的強大存在。'
    },

    // ==================== 第七章：龍之山脈 (Lv.22-26) ====================
    wyvern: {
        id: 'wyvern',
        name: '翼龍',
        icon: '🦅',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 23,
        hp: 280,

        maxHp: 280,
        attack: 58,
        defense: 22,
        exp: 180,
        gold: 110,
        drops: [
            { itemId: 'wyvern_scale', chance: 0.4, quantity: [1, 2] },
            { itemId: 'wyvern_wing', chance: 0.25, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'wyvern_lance', chance: 0.05 }
        ],
        skills: ['dive_attack', 'tail_swipe'],
        description: '龍族的遠親，會飛行攻擊。'
    },
    
    drake: {
        id: 'drake',
        name: '幼龍',
        icon: '🐉',
        type: MonsterType.NORMAL,
        element: MonsterElement.FIRE,
        level: 24,
        hp: 320,

        maxHp: 320,
        attack: 62,
        defense: 25,
        exp: 200,
        gold: 120,
        drops: [
            { itemId: 'drake_scale', chance: 0.5, quantity: [1, 3] },
            { itemId: 'dragon_tooth', chance: 0.35, quantity: [1, 2] },
            { itemId: 'dragon_heart', chance: 0.05, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'drake_scale_mail', chance: 0.05 }
        ],
        skills: ['fire_breath', 'claw_strike'],
        description: '年幼的龍族成員。'
    },
    
    dragon_knight: {
        id: 'dragon_knight',
        name: '龍騎士',
        icon: '🛡️',
        type: MonsterType.ELITE,
        element: MonsterElement.FIRE,
        level: 25,
        hp: 350,

        maxHp: 350,
        attack: 68,
        defense: 30,
        exp: 240,
        gold: 140,
        drops: [
            { itemId: 'dragon_scale_armor', chance: 0.2, quantity: [1, 1] },
            { itemId: 'dragon_knight_badge', chance: 0.35, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'dragon_knight_helm', chance: 0.08 }
        ],
        skills: ['dragon_charge', 'fire_lance'],
        description: '與龍共戰的精英騎士。'
    },
    
    // 第七章 BOSS
    elder_dragon: {
        id: 'elder_dragon',
        name: '古龍',
        icon: '🐲',
        type: MonsterType.BOSS,
        element: MonsterElement.FIRE,
        level: 26,
        hp: 1200,

        maxHp: 1200,
        attack: 72,
        defense: 35,
        exp: 600,
        gold: 500,
        drops: [
            { itemId: 'dragon_heart', chance: 1.0, quantity: [1, 1] },
            { itemId: 'elder_dragon_scale', chance: 0.8, quantity: [2, 3] },
            { itemId: 'dragon_tooth', chance: 0.6, quantity: [1, 2] }
        ],
        equipmentDrops: [
            { equipmentId: 'elder_dragon_fang', chance: 0.15 }
        ],
        skills: ['inferno_breath', 'dragon_fury', 'ancient_roar'],
        description: '統治龍之山脈的古老巨龍。'
    },

    // ==================== 第八章：王都危機 (Lv.26-28) ====================
    shadow_assassin: {
        id: 'shadow_assassin',
        name: '暗影刺客',
        icon: '🗡️',
        type: MonsterType.ELITE,
        element: MonsterElement.SHADOW,
        level: 27,
        hp: 300,

        maxHp: 300,
        attack: 78,
        defense: 20,
        exp: 260,
        gold: 150,
        drops: [
            { itemId: 'assassin_blade', chance: 0.25, quantity: [1, 1] },
            { itemId: 'shadow_cloak_fragment', chance: 0.35, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'assassin_blade', chance: 0.08 }
        ],
        skills: ['backstab', 'vanish', 'poison_dagger'],
        description: '王都中潛伏的暗殺者。'
    },
    
    shadow_general: {
        id: 'shadow_general',
        name: '暗影將領',
        icon: '⚔️',
        type: MonsterType.ELITE,
        element: MonsterElement.SHADOW,
        level: 28,
        hp: 450,

        maxHp: 450,
        attack: 82,
        defense: 35,
        exp: 300,
        gold: 180,
        drops: [
            { itemId: 'general_armor', chance: 0.3, quantity: [1, 1] },
            { itemId: 'shadow_insignia', chance: 0.4, quantity: [1, 1] }
        ],
        skills: ['commander_strike', 'shadow_army', 'dark_shield'],
        description: '暗影軍團的高級將領。'
    },
    
    // 第八章 BOSS
    shadow_overlord: {
        id: 'shadow_overlord',
        name: '暗影霸主',
        icon: '👹',
        type: MonsterType.BOSS,
        element: MonsterElement.SHADOW,
        level: 28,
        hp: 1500,

        maxHp: 1500,
        attack: 85,
        defense: 38,
        exp: 750,
        gold: 600,
        drops: [
            { itemId: 'overlord_crown', chance: 1.0, quantity: [1, 1] },
            { itemId: 'void_essence', chance: 0.5, quantity: [1, 2] }
        ],
        equipmentDrops: [
            { equipmentId: 'shadow_overlord_armor', chance: 0.20 }
        ],
        skills: ['void_slash', 'shadow_domain', 'dark_resurrection'],
        description: '暗影軍團的統帥。'
    },

    // ==================== 第九章：最終決戰 (Lv.28-30) ====================
    demon_soldier: {
        id: 'demon_soldier',
        name: '魔族士兵',
        icon: '😈',
        type: MonsterType.ELITE,
        element: MonsterElement.SHADOW,
        level: 29,
        hp: 400,

        maxHp: 400,
        attack: 88,
        defense: 32,
        exp: 320,
        gold: 200,
        drops: [
            { itemId: 'demon_horn', chance: 0.4, quantity: [1, 1] },
            { itemId: 'demonic_steel', chance: 0.3, quantity: [1, 2] }
        ],
        skills: ['demon_slash', 'hellfire'],
        description: '魔王麾下的精銳戰士。'
    },
    
    demon_general: {
        id: 'demon_general',
        name: '魔族將軍',
        icon: '👿',
        type: MonsterType.ELITE,
        element: MonsterElement.SHADOW,
        level: 30,
        hp: 600,

        maxHp: 600,
        attack: 95,
        defense: 40,
        exp: 400,
        gold: 250,
        drops: [
            { itemId: 'demon_general_helm', chance: 0.35, quantity: [1, 1] },
            { itemId: 'abyssal_shard', chance: 0.4, quantity: [1, 2] }
        ],
        equipmentDrops: [
            { equipmentId: 'demon_general_armor', chance: 0.10 }
        ],
        skills: ['infernal_strike', 'demon_summon', 'war_cry'],
        description: '統領魔族軍隊的將軍。'
    },
    
    // 最終 BOSS
    demon_lord_asariel: {
        id: 'demon_lord_asariel',
        name: '魔王阿薩謝爾',
        icon: '👑',
        type: MonsterType.BOSS,
        element: MonsterElement.SHADOW,
        level: 30,
        hp: 2500,

        maxHp: 2500,
        attack: 120,
        defense: 50,
        exp: 2000,
        gold: 2000,
        drops: [
            { itemId: 'demon_lord_sword', chance: 1.0, quantity: [1, 1] },
            { itemId: 'demon_lord_armor', chance: 0.5, quantity: [1, 1] },
            { itemId: 'world_shard', chance: 1.0, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'demon_lord_sword', chance: 0.30 },
            { equipmentId: 'demon_lord_crown', chance: 0.20 }
        ],
        skills: ['apocalypse', 'void_rupture', 'demon_transformation', 'soul_harvest'],
        description: '企圖毀滅世界的魔王，最終的敵人。'
    },
};

export const TowerMonsterData = {

    // ==================== 無盡塔怪物 ====================
    // 第1層
    tower_slime_king: {
        id: 'tower_slime_king',
        name: '史萊姆王',
        icon: '👑',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 5,
        hp: 100,

        maxHp: 100,
        attack: 8,
        defense: 5,
        exp: 50,
        gold: 50,
        drops: [
            { itemId: 'health_potion_s', chance: 1.0, quantity: [1, 1] },
            { itemId: 'slime_crown', chance: 0.3, quantity: [1, 1] }
        ],
        skills: ['split'],
        description: '統領所有史萊姆的王者。',
        towerFloor: 1
    },
    
    // 第2層
    tower_skeleton_captain: {
        id: 'tower_skeleton_captain',
        name: '骷髏隊長',
        icon: '💀',
        type: MonsterType.NORMAL,
        element: MonsterElement.SHADOW,
        level: 6,
        hp: 120,

        maxHp: 120,
        attack: 12,
        defense: 8,
        exp: 60,
        gold: 80,
        drops: [
            { itemId: 'iron_ore', chance: 1.0, quantity: [2, 2] },
            { itemId: 'bone_sword', chance: 0.3, quantity: [1, 1] }
        ],
        skills: ['command'],
        description: '骷髏士兵的指揮官。',
        towerFloor: 2
    },
    
    // 第3層
    tower_poison_queen: {
        id: 'tower_poison_queen',
        name: '毒蜘蛛女王',
        icon: '🕸️',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 7,
        hp: 100,

        maxHp: 100,
        attack: 15,
        defense: 6,
        exp: 70,
        gold: 100,
        drops: [
            { itemId: 'antidote', chance: 1.0, quantity: [2, 2] },
            { itemId: 'spider_queen_fang', chance: 0.6, quantity: [1, 1] },  // 提高掉落率
            { itemId: 'poison_gland', chance: 0.5, quantity: [2, 3] }        // 新增掉落
        ],
        skills: ['poison_spray'],
        description: '毒蜘蛛的統領者。',
        towerFloor: 3
    },
    
    // 第4層
    tower_alpha_wolf: {
        id: 'tower_alpha_wolf',
        name: '狂狼首領',
        icon: '🐺',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 8,
        hp: 150,

        maxHp: 150,
        attack: 18,
        defense: 10,
        exp: 80,
        gold: 120,
        drops: [
            { itemId: 'wolf_pelt', chance: 1.0, quantity: [2, 2] },
            { itemId: 'alpha_fang', chance: 0.3, quantity: [1, 1] }
        ],
        skills: ['howl', 'pack_attack'],
        description: '狼群的領袖。',
        towerFloor: 4
    },
    
    // 第5層 - BOSS
    tower_goblin_chief: {
        id: 'tower_goblin_chief',
        name: '哥布林首領',
        icon: '👺',
        type: MonsterType.BOSS,
        element: MonsterElement.NONE,
        level: 10,
        hp: 250,

        maxHp: 250,
        attack: 22,
        defense: 12,
        exp: 150,
        gold: 200,
        drops: [
            { itemId: 'atk_gem_1', chance: 1.0, quantity: [1, 1] },
            { itemId: 'goblin_dagger', chance: 1.0, quantity: [1, 1] }  // BOSS武器
        ],
        skills: ['goblin_rage', 'summon_goblins'],
        description: '統領哥布林部落的首領。',
        towerFloor: 5
    },
    
    // 第6層
    tower_gargoyle: {
        id: 'tower_gargoyle',
        name: '石像鬼',
        icon: '🗿',
        type: MonsterType.NORMAL,
        element: MonsterElement.EARTH,
        level: 11,
        hp: 200,

        maxHp: 200,
        attack: 20,
        defense: 18,
        exp: 100,
        gold: 150,
        drops: [
            { itemId: 'stone_fragment', chance: 1.0, quantity: [3, 3] },
            { itemId: 'gargoyle_wing', chance: 0.3, quantity: [1, 1] }
        ],
        skills: ['stone_form'],
        description: '守護塔樓的石像怪物。',
        towerFloor: 6
    },
    
    // 第7層
    tower_shadow_stalker: {
        id: 'tower_shadow_stalker',
        name: '暗影潛伏者',
        icon: '👤',
        type: MonsterType.NORMAL,
        element: MonsterElement.SHADOW,
        level: 12,
        hp: 180,

        maxHp: 180,
        attack: 28,
        defense: 12,
        exp: 110,
        gold: 180,
        drops: [
            { itemId: 'shadow_shard', chance: 1.0, quantity: [2, 2] },
            { itemId: 'shadow_essence', chance: 0.3, quantity: [1, 1] }
        ],
        skills: ['ambush'],
        description: '在暗影中潛行的殺手。',
        towerFloor: 7
    },
    
    // 第8層
    tower_flame_imp: {
        id: 'tower_flame_imp',
        name: '火焰小惡魔',
        icon: '😈',
        type: MonsterType.NORMAL,
        element: MonsterElement.FIRE,
        level: 13,
        hp: 220,

        maxHp: 220,
        attack: 25,
        defense: 14,
        exp: 120,
        gold: 200,
        drops: [
            { itemId: 'fire_essence', chance: 1.0, quantity: [2, 2] },
            { itemId: 'imp_horn', chance: 0.3, quantity: [1, 1] }
        ],
        skills: ['fireball', 'fire_shield'],
        description: '來自地獄的小惡魔。',
        towerFloor: 8
    },
    
    // 第9層
    tower_frost_giant: {
        id: 'tower_frost_giant',
        name: '冰霜巨人',
        icon: '🧊',
        type: MonsterType.NORMAL,
        element: MonsterElement.ICE,
        level: 14,
        hp: 300,

        maxHp: 300,
        attack: 22,
        defense: 20,
        exp: 130,
        gold: 250,
        drops: [
            { itemId: 'ice_essence', chance: 1.0, quantity: [2, 2] },
            { itemId: 'frost_core', chance: 0.3, quantity: [1, 1] }
        ],
        skills: ['ice_smash', 'freeze'],
        description: '來自極北之地的巨人。',
        towerFloor: 9
    },
    
    // 第10層 - BOSS
    tower_hell_knight: {
        id: 'tower_hell_knight',
        name: '地獄騎士',
        icon: '🔥',
        type: MonsterType.BOSS,
        element: MonsterElement.FIRE,
        level: 15,
        hp: 400,

        maxHp: 400,
        attack: 35,
        defense: 22,
        exp: 250,
        gold: 500,
        drops: [
            { itemId: 'def_gem_2', chance: 1.0, quantity: [1, 1] },
            { itemId: 'hell_knight_armor', chance: 1.0, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'hell_knight_lance', chance: 0.25 }
        ],
        skills: ['hellfire_slash', 'flame_charge'],
        description: '來自地獄的騎士。',
        towerFloor: 10
    },
    
    // 第11層
    tower_man_eater: {
        id: 'tower_man_eater',
        name: '食人花',
        icon: '🌸',
        type: MonsterType.NORMAL,
        element: MonsterElement.EARTH,
        level: 16,
        hp: 280,

        maxHp: 280,
        attack: 30,
        defense: 16,
        exp: 150,
        gold: 300,
        drops: [
            { itemId: 'poison_gland', chance: 1.0, quantity: [2, 2] },
            { itemId: 'carnivore_seed', chance: 0.3, quantity: [1, 1] }
        ],
        skills: ['devour', 'poison_spore'],
        description: '以血肉為食的巨大植物。',
        towerFloor: 11
    },
    
    // 第12層
    tower_lava_lizard: {
        id: 'tower_lava_lizard',
        name: '熔岩蜥蜴',
        icon: '🦎',
        type: MonsterType.NORMAL,
        element: MonsterElement.FIRE,
        level: 17,
        hp: 350,

        maxHp: 350,
        attack: 32,
        defense: 24,
        exp: 160,
        gold: 350,
        drops: [
            { itemId: 'lava_scale', chance: 1.0, quantity: [2, 2] },
            { itemId: 'molten_core', chance: 0.3, quantity: [1, 1] }
        ],
        skills: ['lava_spit', 'heat_aura'],
        description: '生活在熔岩中的蜥蜴。',
        towerFloor: 12
    },
    
    // 第13層
    tower_thunder_hawk: {
        id: 'tower_thunder_hawk',
        name: '雷鷹',
        icon: '🦅',
        type: MonsterType.NORMAL,
        element: MonsterElement.THUNDER,
        level: 18,
        hp: 300,

        maxHp: 300,
        attack: 38,
        defense: 18,
        exp: 170,
        gold: 400,
        drops: [
            { itemId: 'thunder_feather', chance: 1.0, quantity: [2, 2] },
            { itemId: 'storm_essence', chance: 0.3, quantity: [1, 1] }
        ],
        skills: ['lightning_dive', 'thunder_screech'],
        description: '翱翔於雷雲中的猛禽。',
        towerFloor: 13
    },
    
    // 第14層
    tower_spectral_mage: {
        id: 'tower_spectral_mage',
        name: '幽靈法師',
        icon: '👻',
        type: MonsterType.ELITE,
        element: MonsterElement.SHADOW,
        level: 19,
        hp: 280,

        maxHp: 280,
        attack: 42,
        defense: 15,
        exp: 180,
        gold: 450,
        drops: [
            { itemId: 'magic_crystal', chance: 1.0, quantity: [2, 2] },
            { itemId: 'spectral_staff', chance: 0.3, quantity: [1, 1] }
        ],
        skills: ['soul_bolt', 'mana_drain'],
        description: '死後仍追求魔法的亡靈法師。',
        towerFloor: 14
    },
    
    // 第15層 - BOSS
    tower_abyss_general: {
        id: 'tower_abyss_general',
        name: '深淵魔將',
        icon: '👹',
        type: MonsterType.BOSS,
        element: MonsterElement.SHADOW,
        level: 20,
        hp: 600,

        maxHp: 600,
        attack: 45,
        defense: 28,
        exp: 400,
        gold: 800,
        drops: [
            { itemId: 'crit_gem', chance: 1.0, quantity: [1, 1] },
            { itemId: 'abyss_blade', chance: 1.0, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'abyss_armor', chance: 0.25 }
        ],
        skills: ['abyss_strike', 'dark_summon', 'void_armor'],
        description: '來自深淵的強大魔將。',
        towerFloor: 15
    },
    
    // 第16層
    tower_iron_golem: {
        id: 'tower_iron_golem',
        name: '鋼鐵傀儡',
        icon: '🤖',
        type: MonsterType.ELITE,
        element: MonsterElement.NONE,
        level: 21,
        hp: 500,

        maxHp: 500,
        attack: 35,
        defense: 40,
        exp: 220,
        gold: 500,
        drops: [
            { itemId: 'golem_core', chance: 1.0, quantity: [2, 2] },
            { itemId: 'mithril_ore', chance: 0.6, quantity: [2, 3] },  // 提高掉落
            { itemId: 'crystal_shard', chance: 0.4, quantity: [1, 2] } // 新增水晶掉落
        ],
        skills: ['steel_fist', 'iron_defense'],
        description: '以秘銀打造的戰鬥傀儡。',
        towerFloor: 16
    },
    
    // 第17層
    tower_hydra: {
        id: 'tower_hydra',
        name: '九頭蛇',
        icon: '🐍',
        type: MonsterType.ELITE,
        element: MonsterElement.NONE,
        level: 22,
        hp: 550,

        maxHp: 550,
        attack: 48,
        defense: 25,
        exp: 250,
        gold: 600,
        drops: [
            { itemId: 'hydra_scale', chance: 1.0, quantity: [3, 3] },
            { itemId: 'hydra_fang', chance: 0.5, quantity: [1, 1] }
        ],
        skills: ['multi_bite', 'regeneration'],
        description: '傳說中的多頭巨蛇。',
        towerFloor: 17
    },
    
    // 第18層
    tower_dark_dragon: {
        id: 'tower_dark_dragon',
        name: '暗黑龍',
        icon: '🐉',
        type: MonsterType.ELITE,
        element: MonsterElement.SHADOW,
        level: 24,
        hp: 700,

        maxHp: 700,
        attack: 50,
        defense: 32,
        exp: 300,
        gold: 700,
        drops: [
            { itemId: 'dark_dragon_scale', chance: 1.0, quantity: [2, 2] },
            { itemId: 'dragon_heart', chance: 0.5, quantity: [1, 1] },    // 提高龍心掉落
            { itemId: 'elder_dragon_scale', chance: 0.3, quantity: [1, 1] }, // 新增古龍鱗
            { itemId: 'shadow_core', chance: 0.25, quantity: [1, 1] }     // 新增暗影核心
        ],
        skills: ['shadow_breath', 'dragon_claw'],
        description: '被暗影腐化的龍。',
        towerFloor: 18
    },
    
    // 第19層
    tower_primordial_titan: {
        id: 'tower_primordial_titan',
        name: '原始泰坦',
        icon: '🗽',
        type: MonsterType.ELITE,
        element: MonsterElement.EARTH,
        level: 26,
        hp: 800,

        maxHp: 800,
        attack: 55,
        defense: 38,
        exp: 350,
        gold: 900,
        drops: [
            { itemId: 'titan_heart', chance: 1.0, quantity: [1, 1] },       // 100% 保底
            { itemId: 'primordial_stone', chance: 0.7, quantity: [1, 2] }, // 提高掉落
            { itemId: 'legendary_shard', chance: 0.15, quantity: [1, 1] }   // 稀有掉落傳說碎片
        ],
        skills: ['titan_smash', 'earthquake', 'stone_skin'],
        description: '世界初創時的古老巨人。',
        towerFloor: 19
    },
    
    // 第20層 - 最終BOSS
    tower_void_king: {
        id: 'tower_void_king',
        name: '虛空之王',
        icon: '🌑',
        type: MonsterType.WORLD_BOSS,
        element: MonsterElement.SHADOW,
        level: 30,
        hp: 1200,

        maxHp: 1200,
        attack: 65,
        defense: 45,
        exp: 1000,
        gold: 2000,
        drops: [
            { itemId: 'legendary_shard', chance: 1.0, quantity: [2, 3] },
            { itemId: 'void_crown', chance: 1.0, quantity: [1, 1] },
            { itemId: 'elemental_core', chance: 0.5, quantity: [1, 1] },
            { itemId: 'titan_heart', chance: 0.3, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'void_blade', chance: 0.30 },
            { equipmentId: 'void_crown', chance: 0.25 }
        ],
        skills: ['void_rupture', 'reality_tear', 'dimension_shift', 'annihilation'],
        description: '統治虛空的終極存在，無盡塔的最終守護者。',
        towerFloor: 20
    }
};

// Level groups: split into four logical groups used by map/manager code.
// - LowLevelMonster: levels 1-5 (excluding BOSS and WORLD_BOSS)
// - MediumLevelMonster: levels 6-12 (excluding BOSS and WORLD_BOSS)
// - HighLevelMonster: levels 13-20 (excluding BOSS and WORLD_BOSS)
// - DeathLevelMonster: levels 21-30 (excluding BOSS and WORLD_BOSS)
export const LowLevelMonster = Object.values(MonsterDatabase).filter(m => typeof m.level === 'number' && m.level >= 1 && m.level <= 5 && m.type !== MonsterType.BOSS && m.type !== MonsterType.WORLD_BOSS);
export const MediumLevelMonster = Object.values(MonsterDatabase).filter(m => typeof m.level === 'number' && m.level >= 6 && m.level <= 12 && m.type !== MonsterType.BOSS && m.type !== MonsterType.WORLD_BOSS);
export const HighLevelMonster = Object.values(MonsterDatabase).filter(m => typeof m.level === 'number' && m.level >= 13 && m.level <= 20 && m.type !== MonsterType.BOSS && m.type !== MonsterType.WORLD_BOSS);
export const DeathLevelMonster = Object.values(MonsterDatabase).filter(m => typeof m.level === 'number' && m.level >= 21 && m.level <= 30 && m.type !== MonsterType.BOSS && m.type !== MonsterType.WORLD_BOSS);

// 所有 BOSS 與 WORLD_BOSS 的 ID
export const BossMonsterIds = Object.values(MonsterDatabase)
    .filter(m => m && (m.type === MonsterType.BOSS || m.type === MonsterType.WORLD_BOSS))
    .map(m => m.id);

// 匯出所有怪物清單（陣列）供其他模組使用
export const AllMonsters = Object.values(MonsterDatabase);
export const TowerMonsters = Object.values(TowerMonsterData);
