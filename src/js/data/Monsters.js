/**
 * Monsters.js
 * 怪物資料庫 - 包含主線任務和無盡塔所有怪物
 * 難度線性設計，配合角色等級成長
 */

// 導入裝備資料庫（用於掉落判定）
// import { getEquipment } from './Equipment.js';

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
    POISON: 'poison',
    EARTH: 'earth',
    SHADOW: 'shadow',
    VOID: 'void',
    LIGHT: 'light',
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
    // ==================== 第一章：南門外林地 (Lv.1-10) ====================
    slime: {
        id: 'slime',
        name: '史萊姆',
        icon: '🟢',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 1,
        hp: 20,
        maxHp: 20,
        attack: 4,
        attackSpeed: 1,
        defense: 1,
        exp: 20,
        gold: 5,
        drops: [
            { itemId: 'slime_jelly', chance: 0.5, quantity: [1, 2] },
            { itemId: 'health_potion_s', chance: 0.1, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'slime_sword', chance: 0.05 }
        ],
        skills: [],
        description: '最基礎的怪物，適合新手練習。'
    },
    
    goblin: {
        id: 'goblin',
        name: '哥布林',
        icon: '👺',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 2,
        hp: 30,
        maxHp: 30,
        attack: 6,
        attackSpeed: 1,
        defense: 2,
        exp: 25,
        gold: 7,
        drops: [
            { itemId: 'goblin_coin', chance: 0.5, quantity: [1, 3], sourceRole: 'junk' },
            { itemId: 'goblin_ear', chance: 0.35, quantity: [1, 1] },
            { itemId: 'iron_ore', chance: 0.2, quantity: [1, 1] },
            { itemId: 'health_potion_s', chance: 0.15, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'goblin_dagger', chance: 0.2 }
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
        level: 4,
        hp: 35,
        maxHp: 35,
        attack: 9,
        attackSpeed: 1.25,
        defense: 2,
        exp: 40,
        gold: 9,
        drops: [
            { itemId: 'wolf_fang', chance: 0.38, quantity: [1, 1] },
            { itemId: 'wolf_pelt', chance: 0.22, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'wolf_fang_blade', chance: 0.15 }
        ],
        skills: [],
        description: '森林中的野狼，攻擊性強。'
    },
    
    skeleton: {
        id: 'skeleton',
        name: '骷髏兵',
        icon: '💀',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 11,
        hp: 75,
        maxHp: 75,
        attack: 16,
        attackSpeed: 1,
        defense: 5,
        exp: 125,
        gold: 19,
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
        level: 3,
        hp: 25,
        maxHp: 25,
        attack: 7,
        attackSpeed: 1.2,
        defense: 1,
        exp: 35,
        gold: 8,
        drops: [
            { itemId: 'rat_tail', chance: 0.55, quantity: [1, 1] },
            { itemId: 'beast_hide', chance: 0.18, quantity: [1, 1] }
        ],
        skills: [],
        description: '下水道中常見的巨型老鼠。'
    },
    
    // 第一至二章外圍生態；獸人目前保留，不進入正式章節抽樣
    orc_warrior: {
        id: 'orc_warrior',
        name: '獸人戰士',
        icon: '👹',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 5,
        hp: 90,
        maxHp: 90,
        attack: 18,
        attackSpeed: 1.4,
        defense: 8,
        exp: 40,
        gold: 30,
        drops: [
            { itemId: 'orc_fang', chance: 0.38, quantity: [1, 1] },
            { itemId: 'raw_meat', chance: 0.24, quantity: [1, 1] }
        ],
        skills: ['heavy_strike'],
        description: '強壯的獸人戰士。'
    },
    
    cave_bat: {
        id: 'cave_bat',
        name: '洞窟蝙蝠',
        icon: '🦇',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 12,
        hp: 60,
        maxHp: 60,
        attack: 17,
        attackSpeed: 1.35,
        defense: 4,
        exp: 140,
        gold: 20,
        drops: [
            { itemId: 'bat_wing', chance: 0.5, quantity: [1, 2] }
        ],
        skills: ['sonic_screech'],
        description: '在洞窟暗處飛行的蝙蝠，薄翼可作為早期裁縫與鍛造材料。'
    },
    
    poison_spider: {
        id: 'poison_spider',
        name: '毒蜘蛛',
        icon: '🕷️',
        type: MonsterType.NORMAL,
        element: MonsterElement.POISON,
        level: 7,
        hp: 45,
        maxHp: 45,
        attack: 12,
        attackSpeed: 1.15,
        defense: 3,
        exp: 70,
        gold: 13,
        drops: [
            { itemId: 'spider_silk', chance: 0.5, quantity: [1, 2] },
            { itemId: 'poison_gland', chance: 0.3, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'spider_silk_gloves', chance: 0.15 }
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
        level: 8,
        hp: 75,
        maxHp: 75,
        attack: 12,
        attackSpeed: 0.82,
        defense: 7,
        exp: 80,
        gold: 15,
        drops: [
            { itemId: 'stone_fragment', chance: 0.6, quantity: [2, 3] },
            { itemId: 'iron_ore', chance: 0.45, quantity: [1, 2] }
        ],
        equipmentDrops: [],
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
        type: MonsterType.ELITE,
        element: MonsterElement.EARTH,
        level: 9,
        hp: 140,
        maxHp: 140,
        attack: 16,
        attackSpeed: 0.78,
        defense: 8,
        exp: 200,
        gold: 32,
        drops: [
            { itemId: 'ancient_bark', chance: 0.4, quantity: [1, 2] },
            { itemId: 'life_seed', chance: 0.15, quantity: [1, 1] }
        ],
        skills: ['root_bind'],
        description: '森林的守護者，防禦極高。'
    },
    
    // 第一章 BOSS
    forest_guardian: {
        id: 'forest_guardian',
        name: '古樹守衛',
        icon: '🌲',
        type: MonsterType.BOSS,
        element: MonsterElement.EARTH,
        level: 10,
        hp: 200,
        maxHp: 200,
        attack: 20,
        attackSpeed: 0.92,
        defense: 9,
        exp: 540,
        gold: 88,
        drops: [
            { itemId: 'guardian_branch', chance: 1.0, quantity: [1, 1] },
            { itemId: 'forest_essence', chance: 0.5, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'forest_guardian_staff', chance: 0.15 }
        ],
        skills: ['nature_wrath', 'root_bind', 'regeneration'],
        description: '腐根溪谷的千年神木，核心樹皮被剝離後陷入無意識防衛。'
    },

    // ==================== 第二章：斷裂撤離盆地 (Lv.11-20) ====================
    skeleton_warrior: {
        id: 'skeleton_warrior',
        name: '骷髏戰士',
        icon: '💀',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 13,
        hp: 95,
        maxHp: 95,
        attack: 20,
        attackSpeed: 1,
        defense: 7,
        exp: 155,
        gold: 22,
        drops: [
            { itemId: 'bone_fragment', chance: 0.6, quantity: [2, 4] },  // 提高掉落
            { itemId: 'iron_ore', chance: 0.4, quantity: [1, 3] }
        ],
        equipmentDrops: [
            { equipmentId: 'undead_dagger', chance: 0.15 }
        ],
        skills: ['sword_slash'],
        description: '被黑暗力量復活的骷髏。'
    },
    
    ghost: {
        id: 'ghost',
        name: '幽靈',
        icon: '👻',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 15,
        hp: 80,
        maxHp: 80,
        attack: 24,
        attackSpeed: 1.2,
        defense: 5,
        exp: 190,
        gold: 24,
        drops: [
            { itemId: 'ectoplasm', chance: 0.36, quantity: [1, 1] },
            { itemId: 'soul_fragment', chance: 0.12, quantity: [1, 1] }
        ],
        equipmentDrops: [],
        skills: ['phase_through', 'soul_drain'],
        description: '徘徊在遺跡中的亡魂。'
    },
    
    stone_golem: {
        id: 'stone_golem',
        name: '石像守衛',
        icon: '🗿',
        type: MonsterType.NORMAL,
        element: MonsterElement.EARTH,
        level: 17,
        hp: 155,
        maxHp: 155,
        attack: 22,
        attackSpeed: 0.8,
        defense: 13,
        exp: 230,
        gold: 27,
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
        element: MonsterElement.NONE,
        level: 20,
        hp: 525,
        maxHp: 525,
        attack: 39,
        attackSpeed: 1.1,
        defense: 13,
        exp: 1500,
        gold: 155,
        drops: [
            { itemId: 'lich_phylactery', chance: 1.0, quantity: [1, 1] },
            { itemId: 'glimmer_shard', chance: 0.25, quantity: [1, 1] },
            { itemId: 'frost_crystal', chance: 1.0, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'lich_staff', chance: 0.20 },
        ],
        skills: ['dark_bolt', 'summon_skeleton', 'life_drain'],
        description: '操控亡靈的邪惡法師。'
    },

    // ==================== 第三章：暗影前線 (Lv.21-30) ====================
    shadow_soldier: {
        id: 'shadow_soldier',
        name: '暗影士兵',
        icon: '🗡️',
        type: MonsterType.NORMAL,
        element: MonsterElement.SHADOW,
        level: 21,
        hp: 155,
        maxHp: 155,
        attack: 30,
        attackSpeed: 1,
        defense: 10,
        exp: 325,
        gold: 32,
        drops: [
            { itemId: 'shadow_shard', chance: 0.32, quantity: [1, 1] },
            { itemId: 'expedition_steel_fragment', chance: 0.24, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'shadow_blade_drop', chance: 0.10 }
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
        level: 23,
        hp: 135,
        maxHp: 135,
        attack: 35,
        attackSpeed: 1.25,
        defense: 8,
        exp: 375,
        gold: 35,
        drops: [
            { itemId: 'shadow_arrow', chance: 0.30, quantity: [2, 4] },
            { itemId: 'expedition_steel_fragment', chance: 0.20, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'shadowneedle_dagger', chance: 0.10 }
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
        level: 26,
        hp: 275,
        maxHp: 275,
        attack: 46,
        attackSpeed: 1.18,
        defense: 11,
        exp: 975,
        gold: 78,
        drops: [
            { itemId: 'cursed_shard', chance: 0.12, quantity: [1, 1] },
            { itemId: 'magic_crystal', chance: 0.18, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'shade_focus', chance: 0.10 }
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
        level: 30,
        hp: 910,
        maxHp: 910,
        attack: 58,
        attackSpeed: 1.1,
        defense: 21,
        exp: 2960,
        gold: 223,
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

    // ==================== 第四章：古代遺跡 (Lv.31-40) ====================
    ancient_guardian: {
        id: 'ancient_guardian',
        name: '遺跡守衛',
        icon: '🤖',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 31,
        hp: 280,
        maxHp: 280,
        attack: 40,
        attackSpeed: 0.9,
        defense: 18,
        exp: 625,
        gold: 46,
        drops: [
            { itemId: 'ancient_gear', chance: 0.4, quantity: [1, 2] },
            { itemId: 'mithril_ore', chance: 0.35, quantity: [1, 2] }
        ],
        equipmentDrops: [
            { equipmentId: 'ancient_sword', chance: 0.10 }
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
        level: 33,
        hp: 315,
        maxHp: 315,
        attack: 40,
        attackSpeed: 0.82,
        defense: 23,
        exp: 700,
        gold: 49,
        drops: [
            { itemId: 'crystal_shard', chance: 0.40, quantity: [1, 2] },
            { itemId: 'mithril_ore', chance: 0.10, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'crystal_shield', chance: 0.10 }
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
        level: 37,
        hp: 470,
        maxHp: 470,
        attack: 61,
        attackSpeed: 1.15,
        defense: 20,
        exp: 1795,
        gold: 108,
        drops: [
            { itemId: 'ancient_rune', chance: 0.30, quantity: [1, 1] },
            { itemId: 'rune_stone', chance: 0.20, quantity: [1, 1] }
        ],
        equipmentDrops: [],
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
        level: 40,
        hp: 1530,
        maxHp: 1530,
        attack: 70,
        attackSpeed: 0.85,
        defense: 32,
        exp: 4920,
        gold: 290,
        drops: [
            { itemId: 'titan_heart', chance: 1.0, quantity: [1, 1] },
            { itemId: 'primordial_stone', chance: 0.32, quantity: [1, 1] },
            { itemId: 'earth_essence', chance: 0.12, quantity: [1, 1] },
            { itemId: 'ember_stone', chance: 1.0, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'titan_hammer', chance: 0.20 }
        ],
        skills: ['titan_slam', 'earthquake', 'ancient_power'],
        description: '沉睡萬年的遠古巨人。'
    },

    // ==================== 第五章：元素失衡區 (Lv.41-50) ====================
    fire_elemental: {
        id: 'fire_elemental',
        name: '火元素',
        icon: '🔥',
        type: MonsterType.NORMAL,
        element: MonsterElement.FIRE,
        level: 41,
        hp: 315,
        maxHp: 315,
        attack: 58,
        attackSpeed: 1.15,
        defense: 15,
        exp: 1030,
        gold: 59,
        drops: [
            { itemId: 'fire_essence', chance: 0.45, quantity: [1, 2] },
            { itemId: 'ember_stone', chance: 0.25, quantity: [1, 1] }
        ],
        equipmentDrops: [],
        skills: ['fireball', 'flame_burst'],
        description: '純粹的火焰元素生物。'
    },
    
    ice_elemental: {
        id: 'ice_elemental',
        name: '冰元素',
        icon: '❄️',
        type: MonsterType.NORMAL,
        element: MonsterElement.ICE,
        level: 43,
        hp: 395,
        maxHp: 395,
        attack: 54,
        attackSpeed: 0.9,
        defense: 23,
        exp: 1120,
        gold: 62,
        drops: [
            { itemId: 'ice_essence', chance: 0.45, quantity: [1, 2] },
            { itemId: 'frost_crystal', chance: 0.25, quantity: [1, 1] }
        ],
        equipmentDrops: [],
        skills: ['ice_spike', 'freeze'],
        description: '純粹的冰霜元素生物。'
    },
    
    thunder_elemental: {
        id: 'thunder_elemental',
        name: '雷元素',
        icon: '⚡',
        type: MonsterType.NORMAL,
        element: MonsterElement.THUNDER,
        level: 45,
        hp: 325,
        maxHp: 325,
        attack: 68,
        attackSpeed: 1.25,
        defense: 15,
        exp: 1220,
        gold: 65,
        drops: [
            { itemId: 'thunder_essence', chance: 0.45, quantity: [1, 2] },
            { itemId: 'storm_crystal', chance: 0.25, quantity: [1, 1] }
        ],
        equipmentDrops: [],
        skills: ['lightning_bolt', 'chain_lightning'],
        description: '純粹的雷電元素生物。'
    },
    
    earth_elemental: {
        id: 'earth_elemental',
        name: '土元素',
        icon: '🪨',
        type: MonsterType.NORMAL,
        element: MonsterElement.EARTH,
        level: 35,
        hp: 315,
        maxHp: 315,
        attack: 47,
        attackSpeed: 0.9,
        defense: 20,
        exp: 775,
        gold: 51,
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
        level: 50,
        hp: 1800,
        maxHp: 1800,
        attack: 94,
        attackSpeed: 1.12,
        defense: 31,
        exp: 7380,
        gold: 358,
        drops: [
            { itemId: 'elemental_core', chance: 1.0, quantity: [1, 1] },
            { itemId: 'primal_essence', chance: 0.45, quantity: [1, 1] },
            { itemId: 'fire_essence', chance: 0.18, quantity: [1, 1] },
            { itemId: 'molten_core', chance: 0.08, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'elemental_orb', chance: 0.18 }
        ],
        skills: ['elemental_shift', 'primal_burst', 'elemental_storm'],
        description: '掌控四大元素的強大存在。'
    },

    // ==================== 第六章：龍封山脈 (Lv.51-60) ====================
    wyvern: {
        id: 'wyvern',
        name: '翼龍',
        icon: '🦅',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 52,
        hp: 440,
        maxHp: 440,
        attack: 73,
        attackSpeed: 1.25,
        defense: 19,
        exp: 1585,
        gold: 74,
        drops: [
            { itemId: 'wyvern_scale', chance: 0.4, quantity: [1, 2] },
            { itemId: 'wyvern_wing', chance: 0.25, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'wyvern_lance', chance: 0.10 }
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
        level: 54,
        hp: 540,
        maxHp: 540,
        attack: 73,
        attackSpeed: 1,
        defense: 25,
        exp: 1700,
        gold: 77,
        drops: [
            { itemId: 'drake_scale', chance: 0.42, quantity: [1, 2] },
            { itemId: 'dragon_tooth', chance: 0.24, quantity: [1, 1] }
        ],
        equipmentDrops: [
            // { equipmentId: 'drake_scale_mail', chance: 0.05 }
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
        level: 59,
        hp: 1080,
        maxHp: 1080,
        attack: 94,
        attackSpeed: 1.05,
        defense: 37,
        exp: 4210,
        gold: 167,
        drops: [
            { itemId: 'dragon_scale_armor', chance: 0.2, quantity: [1, 1] },
            { itemId: 'dragon_knight_badge', chance: 0.35, quantity: [1, 1] }
        ],
        equipmentDrops: [],
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
        level: 60,
        hp: 2555,
        maxHp: 2555,
        attack: 110,
        attackSpeed: 1.05,
        defense: 41,
        exp: 10340,
        gold: 425,
        drops: [
            { itemId: 'dragon_heart', chance: 1.0, quantity: [1, 1] },
            { itemId: 'elder_dragon_scale', chance: 0.55, quantity: [1, 1] },
            { itemId: 'dragon_tooth', chance: 0.30, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'elder_dragon_fang', chance: 0.15 }
        ],
        skills: ['inferno_breath', 'dragon_fury', 'ancient_roar'],
        description: '統治龍之山脈的古老巨龍。'
    },

    // ==================== 第七章：墜落地外圍 (Lv.61-67) ====================
    shadow_assassin: {
        id: 'shadow_assassin',
        name: '暗影刺客',
        icon: '🗡️',
        type: MonsterType.ELITE,
        element: MonsterElement.SHADOW,
        level: 61,
        hp: 795,
        maxHp: 795,
        attack: 105,
        attackSpeed: 1.4,
        defense: 21,
        exp: 4480,
        gold: 173,
        drops: [
            { itemId: 'assassin_blade_fragment', chance: 0.25, quantity: [1, 1] },
            { itemId: 'shadow_cloak_fragment', chance: 0.35, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'assassin_blade', chance: 0.05 }
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
        level: 67,
        hp: 1265,
        maxHp: 1265,
        attack: 110,
        attackSpeed: 1.12,
        defense: 37,
        exp: 5340,
        gold: 189,
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
        level: 65,
        hp: 1500,
        maxHp: 1500,
        attack: 85,
        attackSpeed: 2.2,
        defense: 38,
        exp: 750,
        gold: 600,
        drops: [
            { itemId: 'overlord_crown', chance: 1.0, quantity: [1, 1] },
            { itemId: 'void_essence', chance: 0.5, quantity: [1, 2] }
        ],
        equipmentDrops: [
            { equipmentId: 'shadow_overlord_armor', chance: 0.20 },
            { equipmentId: 'overlord_armor', chance: 0.12 }
        ],
        skills: ['void_slash', 'shadow_domain', 'dark_resurrection'],
        description: '暗影軍團的統帥。'
    },

    // ==================== 第七章：魔王終局 (Lv.66-70) ====================
    demon_soldier: {
        id: 'demon_soldier',
        name: '魔族士兵',
        icon: '😈',
        type: MonsterType.NORMAL,
        element: MonsterElement.SHADOW,
        level: 66,
        hp: 730,
        maxHp: 730,
        attack: 89,
        attackSpeed: 1,
        defense: 31,
        exp: 2470,
        gold: 93,
        drops: [
            { itemId: 'demon_horn', chance: 0.4, quantity: [1, 1] },
            { itemId: 'demonic_steel', chance: 0.3, quantity: [1, 2] }
        ],
        equipmentDrops: [
            { equipmentId: 'demon_blade', chance: 0.05 }
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
        level: 69,
        hp: 1450,
        maxHp: 1450,
        attack: 117,
        attackSpeed: 1.05,
        defense: 42,
        exp: 5640,
        gold: 194,
        drops: [
            { itemId: 'demon_general_helm', chance: 0.35, quantity: [1, 1] },
            { itemId: 'abyssal_shard', chance: 0.4, quantity: [1, 2] }
        ],
        equipmentDrops: [
            { equipmentId: 'demon_general_armor', chance: 0.05 }
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
        level: 70,
        hp: 3275,
        maxHp: 3275,
        attack: 132,
        attackSpeed: 1.08,
        defense: 48,
        exp: 13800,
        gold: 493,
        drops: [
            { itemId: 'demon_core', chance: 1.0, quantity: [1, 1] },
            { itemId: 'world_shard', chance: 1.0, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'demon_lord_sword', chance: 0.25 }
        ],
        skills: ['apocalypse', 'void_rupture', 'demon_transformation', 'soul_harvest'],
        description: '企圖毀滅世界的魔王，最終的敵人。'
    },

    // ==================== 微光前置與深淵/光明補強 ====================
    glimmer_sprite: {
        id: 'glimmer_sprite',
        name: '微光靈',
        icon: '✦',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 18,
        hp: 90,
        maxHp: 90,
        attack: 27,
        attackSpeed: 1.3,
        defense: 6,
        exp: 255,
        gold: 28,
        drops: [
            { itemId: 'glimmer_shard', chance: 0.38, quantity: [1, 1] },
            { itemId: 'rune_stone', chance: 0.16, quantity: [1, 1] }
        ],
        equipmentDrops: [],
        skills: ['lightning_bolt'],
        description: '只帶有微弱光明輪廓的靈體，讓玩家提前理解節奏型裝備，但不提供正式光明力量。'
    },

    rune_wisp: {
        id: 'rune_wisp',
        name: '符文微靈',
        icon: '◈',
        type: MonsterType.NORMAL,
        element: MonsterElement.NONE,
        level: 19,
        hp: 115,
        maxHp: 115,
        attack: 29,
        attackSpeed: 1.2,
        defense: 8,
        exp: 275,
        gold: 30,
        drops: [
            { itemId: 'glimmer_shard', chance: 0.30, quantity: [1, 1] },
            { itemId: 'rune_stone', chance: 0.18, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'rune_scriber_focus', chance: 0.10 }
        ],
        skills: ['lightning_bolt', 'harden'],
        description: '遺跡入口附近浮現的符文靈，掉落微光與符文材料。'
    },

    prism_wisp: {
        id: 'prism_wisp',
        name: '棱光微靈',
        icon: '◇',
        type: MonsterType.NORMAL,
        element: MonsterElement.LIGHT,
        level: 45,
        hp: 320,
        maxHp: 320,
        attack: 54,
        attackSpeed: 1.9,
        defense: 20,
        exp: 230,
        gold: 135,
        drops: [
            { itemId: 'glimmer_shard', chance: 0.34, quantity: [1, 2] },
            { itemId: 'rune_stone', chance: 0.22, quantity: [1, 1] },
            { itemId: 'pure_crystal', chance: 0.16, quantity: [1, 1] }
        ],
        equipmentDrops: [],
        skills: ['chain_lightning', 'harden'],
        description: '元素中後段才會出現的微光前兆，仍屬於弱化光明，不自然升階成光明系。'
    },

    starvein_lurker: {
        id: 'starvein_lurker',
        name: '星脈潛伏者',
        icon: '✹',
        type: MonsterType.ELITE,
        element: MonsterElement.NONE,
        level: 49,
        hp: 765,
        maxHp: 765,
        attack: 82,
        attackSpeed: 1.18,
        defense: 27,
        exp: 2985,
        gold: 140,
        drops: [
            { itemId: 'vine_core', chance: 0.36, quantity: [1, 1] },
            { itemId: 'primal_essence', chance: 0.14, quantity: [1, 1] }
        ],
        equipmentDrops: [],
        skills: ['poison_bite', 'regeneration'],
        description: '叢林深處吸收星脈的獵食者，提供生命、毒與微光交界的掉落。'
    },

    void_walker: {
        id: 'void_walker',
        name: '虛痕行者',
        icon: '◌',
        type: MonsterType.NORMAL,
        element: MonsterElement.VOID,
        level: 65,
        hp: 520,
        maxHp: 520,
        attack: 88,
        attackSpeed: 1.45,
        defense: 30,
        exp: 360,
        gold: 220,
        drops: [
            { itemId: 'abyssal_shard', chance: 0.34, quantity: [1, 1] },
            { itemId: 'void_essence', chance: 0.12, quantity: [1, 1] },
            { itemId: 'demon_core', chance: 0.08, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'abyssal_needle', chance: 0.06 }
        ],
        skills: ['void_slash', 'shadow_strike'],
        description: '深淵裂縫旁遊走的虛空前兆，只給低量虛空壓力，不取代塔的完整虛空線。'
    },

    abyssal_seraph: {
        id: 'abyssal_seraph',
        name: '深淵偽翼',
        icon: '☄',
        type: MonsterType.ELITE,
        element: MonsterElement.VOID,
        level: 68,
        hp: 780,
        maxHp: 780,
        attack: 104,
        attackSpeed: 1.65,
        defense: 42,
        exp: 480,
        gold: 320,
        drops: [
            { itemId: 'abyssal_shard', chance: 0.46, quantity: [1, 2] },
            { itemId: 'void_essence', chance: 0.2, quantity: [1, 1] },
            { itemId: 'demon_core', chance: 0.18, quantity: [1, 1] },
            { itemId: 'world_shard', chance: 0.04, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'seraph_void_focus', chance: 0.075 }
        ],
        skills: ['void_rupture', 'dark_shield'],
        description: '像天使卻由深淵拼成的菁英怪，是本篇通往塔前的虛空壓力預告。'
    },

    dawn_sentinel: {
        id: 'dawn_sentinel',
        name: '黎明衛士',
        icon: '☀',
        type: MonsterType.NORMAL,
        element: MonsterElement.LIGHT,
        level: 70,
        hp: 720,
        maxHp: 720,
        attack: 92,
        attackSpeed: 1.6,
        defense: 48,
        exp: 440,
        gold: 280,
        drops: [
            { itemId: 'radiant_thread', chance: 0.55, quantity: [1, 2] },
            { itemId: 'light_essence', chance: 0.16, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'dawnbrand_sword', chance: 0.045 }
        ],
        skills: ['lightning_bolt', 'harden'],
        description: '黎明迴廊的第一道正式光明檢查，逼玩家用穩定節奏處理戰鬥。'
    },

    radiant_keeper: {
        id: 'radiant_keeper',
        name: '光明守藏者',
        icon: '✺',
        type: MonsterType.ELITE,
        element: MonsterElement.LIGHT,
        level: 70,
        hp: 980,
        maxHp: 980,
        attack: 104,
        attackSpeed: 1.55,
        defense: 58,
        exp: 620,
        gold: 420,
        drops: [
            { itemId: 'light_essence', chance: 0.42, quantity: [1, 1] },
            { itemId: 'radiant_shard', chance: 0.28, quantity: [1, 1] },
            { itemId: 'radiant_thread', chance: 0.45, quantity: [1, 2] }
        ],
        equipmentDrops: [
            { equipmentId: 'dawnbrand_sword', chance: 0.08 },
            { equipmentId: 'aurora_ward_plate', chance: 0.055 }
        ],
        skills: ['dark_shield', 'lightning_bolt'],
        description: '守著光明裝備圖譜的菁英敵人，掉落正式光明素材。'
    },

    mirror_seraph: {
        id: 'mirror_seraph',
        name: '鏡翼熾使',
        icon: '✧',
        type: MonsterType.ELITE,
        element: MonsterElement.LIGHT,
        level: 70,
        hp: 920,
        maxHp: 920,
        attack: 112,
        attackSpeed: 1.85,
        defense: 50,
        exp: 650,
        gold: 450,
        drops: [
            { itemId: 'radiant_shard', chance: 0.38, quantity: [1, 1] },
            { itemId: 'light_essence', chance: 0.32, quantity: [1, 1] },
            { itemId: 'radiant_thread', chance: 0.35, quantity: [1, 2] }
        ],
        equipmentDrops: [
            { equipmentId: 'prism_focus', chance: 0.08 }
        ],
        skills: ['chain_lightning', 'damage_reflect'],
        description: '會懲罰無腦高暴擊與高攻速的鏡翼菁英，要求玩家控制輸出節奏。'
    },

    aurora_archon: {
        id: 'aurora_archon',
        name: '極光執政官',
        icon: '✷',
        type: MonsterType.BOSS,
        element: MonsterElement.LIGHT,
        level: 70,
        hp: 2400,
        maxHp: 2400,
        attack: 118,
        attackSpeed: 1.7,
        defense: 62,
        exp: 1800,
        gold: 1800,
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
        skills: ['annihilation', 'reality_tear', 'chain_lightning'],
        description: '黎明迴廊的核心首領。它不是主線滿版首領，但負責讓玩家取得抗衡無盡塔的光明裝備。'
    },

    // ==================== 世界故事 BOSS ====================
    blood_moon_stag: {
        id: 'blood_moon_stag',
        name: '血月角鹿',
        icon: '🦌',
        type: MonsterType.BOSS,
        element: MonsterElement.NONE,
        level: 15,
        hp: 420,
        maxHp: 420,
        attack: 30,
        attackSpeed: 1.7,
        defense: 10,
        exp: 220,
        gold: 180,
        drops: [
            { itemId: 'life_seed', chance: 0.7, quantity: [1, 2] },
            { itemId: 'forest_essence', chance: 0.45, quantity: [1, 1] },
            { itemId: 'rare_metal', chance: 0.18, quantity: [1, 1] }
        ],
        equipmentDrops: [],
        skills: ['dragon_charge', 'howl', 'regeneration'],
        description: '只在血月痕跡完整時現身的古老獵物。'
    },

    drowned_oracle: {
        id: 'drowned_oracle',
        name: '溺聲神諭',
        icon: '🔔',
        type: MonsterType.BOSS,
        element: MonsterElement.ICE,
        level: 28,
        hp: 505,
        maxHp: 505,
        attack: 49,
        attackSpeed: 1.08,
        defense: 14,
        exp: 1680,
        gold: 125,
        drops: [
            { itemId: 'ancient_rune', chance: 0.25, quantity: [1, 1] },
            { itemId: 'storm_crystal', chance: 1.0, quantity: [1, 1] }
        ],
        equipmentDrops: [],
        skills: ['sonic_screech', 'freeze', 'soul_drain'],
        description: '被水聲與鐘鳴困住的預言殘響。'
    },

    ash_baron: {
        id: 'ash_baron',
        name: '灰燼男爵',
        icon: '🔥',
        type: MonsterType.BOSS,
        element: MonsterElement.FIRE,
        level: 40,
        hp: 760,
        maxHp: 760,
        attack: 54,
        attackSpeed: 1.9,
        defense: 24,
        exp: 430,
        gold: 340,
        drops: [
            { itemId: 'ember_stone', chance: 0.75, quantity: [1, 2] },
            { itemId: 'rare_metal', chance: 0.35, quantity: [1, 1] },
            { itemId: 'cursed_shard', chance: 0.25, quantity: [1, 1] }
        ],
        equipmentDrops: [],
        skills: ['flame_burst', 'rally_troops', 'fire_shield'],
        description: '以契約與煤印維繫領地的灰燼貴族。'
    },

    thorn_witch: {
        id: 'thorn_witch',
        name: '荊棘女巫',
        icon: '🌿',
        type: MonsterType.BOSS,
        element: MonsterElement.EARTH,
        level: 38,
        hp: 710,
        maxHp: 710,
        attack: 68,
        attackSpeed: 1.15,
        defense: 18,
        exp: 2870,
        gold: 166,
        drops: [
            { itemId: 'poison_gland', chance: 0.65, quantity: [1, 2] },
            { itemId: 'spider_silk', chance: 0.45, quantity: [1, 2] },
            { itemId: 'forest_essence', chance: 0.3, quantity: [1, 1] }
        ],
        equipmentDrops: [],
        skills: ['poison_spore', 'root_bind', 'life_drain'],
        description: '只回應交易、草藥與顏色暗號的森林女巫。'
    },

    ambush_mantis: {
        id: 'ambush_mantis',
        name: '銀鐮伏獵者',
        icon: '🦗',
        type: MonsterType.BOSS,
        element: MonsterElement.NONE,
        level: 6,
        hp: 100,
        maxHp: 100,
        attack: 15,
        attackSpeed: 1.45,
        defense: 3,
        exp: 190,
        gold: 36,
        drops: [
            { itemId: 'poison_gland', chance: 0.7, quantity: [1, 2] },
            { itemId: 'spider_silk', chance: 0.55, quantity: [1, 2] },
            { itemId: 'iron_ore', chance: 0.35, quantity: [1, 2] }
        ],
        equipmentDrops: [],
        skills: ['ambush', 'poison_bite', 'vanish'],
        description: '被龍威驅離地底的遠古節肢巨獸，會記住玩家路線並主動伏擊。'
    },

    // First-run ecology additions. Combat values remain provisional until the
    // dedicated balance pass; chapter ownership lives in MonsterEcology.js.
    shadow_halberdier: {
        id: 'shadow_halberdier', name: '暗影戟兵', icon: '⚔',
        type: MonsterType.NORMAL, element: MonsterElement.SHADOW, level: 24,
        hp: 200, maxHp: 200, attack: 35, attackSpeed: 0.9, defense: 13,
        exp: 405, gold: 36,
        drops: [
            { itemId: 'dark_steel', chance: 0.16, quantity: [1, 1] },
            { itemId: 'expedition_steel_fragment', chance: 0.26, quantity: [1, 1] }
        ],
        equipmentDrops: [], skills: [],
        description: '以長戟維持封鎖線的暗影士兵。'
    },
    ember_beast: {
        id: 'ember_beast', name: '燼火獸', icon: '◆',
        type: MonsterType.NORMAL, element: MonsterElement.FIRE, level: 42,
        hp: 390, maxHp: 390, attack: 58, attackSpeed: 0.98, defense: 19,
        exp: 1075, gold: 61,
        drops: [
            { itemId: 'ember_stone', chance: 0.22, quantity: [1, 1] },
            { itemId: 'lava_scale', chance: 0.08, quantity: [1, 1] }
        ],
        equipmentDrops: [], skills: [],
        description: '由燼火與焦岩聚成的獵食獸。'
    },
    frost_wolf: {
        id: 'frost_wolf', name: '冰霜狼', icon: '◇',
        type: MonsterType.NORMAL, element: MonsterElement.ICE, level: 44,
        hp: 340, maxHp: 340, attack: 62, attackSpeed: 1.25, defense: 15,
        exp: 1170, gold: 63,
        drops: [
            { itemId: 'ice_essence', chance: 0.34, quantity: [1, 1] },
            { itemId: 'frost_crystal', chance: 0.18, quantity: [1, 1] }
        ],
        equipmentDrops: [{ equipmentId: 'frostwolf_mantle', chance: 0.10 }], skills: [],
        description: '皮毛結著霜晶的元素獵狼。'
    },
    poison_frog: {
        id: 'poison_frog', name: '劇毒蛙', icon: '●',
        type: MonsterType.NORMAL, element: MonsterElement.POISON, level: 47,
        hp: 405, maxHp: 405, attack: 58, attackSpeed: 1.05, defense: 18,
        exp: 1320, gold: 67,
        drops: [
            { itemId: 'poison_gland', chance: 0.34, quantity: [1, 1] },
            { itemId: 'spider_silk', chance: 0.12, quantity: [1, 1] }
        ],
        equipmentDrops: [{ equipmentId: 'miasma_needle_focus', chance: 0.10 }], skills: [],
        description: '在失衡濕地中積蓄元素毒液的巨蛙。'
    },
    storm_raptor: {
        id: 'storm_raptor', name: '風暴猛禽', icon: '▲',
        type: MonsterType.NORMAL, element: MonsterElement.THUNDER, level: 46,
        hp: 330, maxHp: 330, attack: 67, attackSpeed: 1.35, defense: 15,
        exp: 1265, gold: 66,
        drops: [
            { itemId: 'thunder_essence', chance: 0.34, quantity: [1, 1] },
            { itemId: 'storm_crystal', chance: 0.18, quantity: [1, 1] }
        ],
        equipmentDrops: [{ equipmentId: 'stormfeather_talisman', chance: 0.10 }], skills: [],
        description: '借雷流俯衝的高空猛禽。'
    },
    vine_beast: {
        id: 'vine_beast', name: '藤蔓獸', icon: '✤',
        type: MonsterType.NORMAL, element: MonsterElement.POISON, level: 48,
        hp: 500, maxHp: 500, attack: 59, attackSpeed: 0.9, defense: 26,
        exp: 1370, gold: 69,
        drops: [
            { itemId: 'vine_core', chance: 0.3, quantity: [1, 1] },
            { itemId: 'ancient_bark', chance: 0.18, quantity: [1, 1] }
        ],
        equipmentDrops: [], skills: [],
        description: '因元素失衡而具備獵食性的藤蔓聚合體。'
    },
    cliffscale_hatchling: {
        id: 'cliffscale_hatchling', name: '崖鱗幼龍', icon: '△',
        type: MonsterType.NORMAL, element: MonsterElement.FIRE, level: 51,
        hp: 430, maxHp: 430, attack: 68, attackSpeed: 1.15, defense: 20,
        exp: 1530, gold: 73,
        drops: [
            { itemId: 'wyvern_scale', chance: 0.3, quantity: [1, 1] },
            { itemId: 'wyvern_wing', chance: 0.12, quantity: [1, 1] }
        ],
        equipmentDrops: [], skills: [],
        description: '在封印峭壁外圍活動的幼年龍獸。'
    },
    sealstone_guardian: {
        id: 'sealstone_guardian', name: '封石守衛', icon: '▣',
        type: MonsterType.NORMAL, element: MonsterElement.EARTH, level: 53,
        hp: 595, maxHp: 595, attack: 63, attackSpeed: 0.85, defense: 34,
        exp: 1645, gold: 76,
        drops: [
            { itemId: 'stone_fragment', chance: 0.36, quantity: [1, 2] },
            { itemId: 'rune_stone', chance: 0.16, quantity: [1, 1] }
        ],
        equipmentDrops: [], skills: [],
        description: '由龍族封印石層自行喚醒的守衛。'
    },
    dragon_seal_sentinel: {
        id: 'dragon_seal_sentinel', name: '龍封哨衛', icon: '◆',
        type: MonsterType.NORMAL, element: MonsterElement.FIRE, level: 56,
        hp: 610, maxHp: 610, attack: 72, attackSpeed: 0.95, defense: 31,
        exp: 1820, gold: 80,
        drops: [
            { itemId: 'drake_scale', chance: 0.32, quantity: [1, 1] },
            { itemId: 'dragon_knight_badge', chance: 0.12, quantity: [1, 1] }
        ],
        equipmentDrops: [{ equipmentId: 'dragonseal_patrol_plate', chance: 0.05 }], skills: [],
        description: '巡守封印邊界、驅逐靠近者的龍族哨衛。'
    },
    dragon_seal_adept: {
        id: 'dragon_seal_adept', name: '龍封術士', icon: '◈',
        type: MonsterType.ELITE, element: MonsterElement.FIRE, level: 57,
        hp: 900, maxHp: 900, attack: 93, attackSpeed: 1.18, defense: 28,
        exp: 3950, gold: 162,
        drops: [
            { itemId: 'magic_crystal', chance: 0.26, quantity: [1, 1] },
            { itemId: 'glimmer_shard', chance: 0.12, quantity: [1, 1] }
        ],
        equipmentDrops: [{ equipmentId: 'dragonseal_forkstaff', chance: 0.05 }], skills: [],
        description: '維持古老封印術式的龍族施術者。'
    },
    hell_hound: {
        id: 'hell_hound', name: '地獄犬', icon: '◆',
        type: MonsterType.NORMAL, element: MonsterElement.FIRE, level: 62,
        hp: 570, maxHp: 570, attack: 88, attackSpeed: 1.28, defense: 22,
        exp: 2200, gold: 88,
        drops: [
            { itemId: 'demon_horn', chance: 0.25, quantity: [1, 1] },
            { itemId: 'demonic_steel', chance: 0.12, quantity: [1, 1] }
        ],
        equipmentDrops: [], skills: [],
        description: '追逐墜落地熱流與魔氣的獵犬。'
    },
    tormented_soul: {
        id: 'tormented_soul', name: '受難亡魂', icon: '◇',
        type: MonsterType.NORMAL, element: MonsterElement.SHADOW, level: 63,
        hp: 530, maxHp: 530, attack: 91, attackSpeed: 1.2, defense: 20,
        exp: 2265, gold: 89,
        drops: [
            { itemId: 'soul_fragment', chance: 0.3, quantity: [1, 1] },
            { itemId: 'cursed_shard', chance: 0.12, quantity: [1, 1] }
        ],
        equipmentDrops: [], skills: [],
        description: '被墜落地反覆牽引、無法離去的殘魂。'
    },
    lava_golem: {
        id: 'lava_golem', name: '熔岩巨像', icon: '▰',
        type: MonsterType.NORMAL, element: MonsterElement.FIRE, level: 64,
        hp: 830, maxHp: 830, attack: 76, attackSpeed: 0.82, defense: 43,
        exp: 2335, gold: 90,
        drops: [
            { itemId: 'lava_scale', chance: 0.3, quantity: [1, 1] },
            { itemId: 'molten_core', chance: 0.14, quantity: [1, 1] }
        ],
        equipmentDrops: [], skills: [],
        description: '受墜落地熱壓喚醒的熔岩巨像。'
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
        level: 8,
        hp: 100,
        maxHp: 100,
        attack: 8,
        attackSpeed: 2.2,
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
        level: 10,
        hp: 120,
        maxHp: 120,
        attack: 12,
        attackSpeed: 1.4,
        defense: 8,
        exp: 60,
        gold: 80,
        drops: [
            { itemId: 'iron_ore', chance: 1.0, quantity: [2, 2] },
            { itemId: 'bone_sword_fragment', chance: 0.3, quantity: [1, 1] }
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
        level: 13,
        hp: 100,
        maxHp: 100,
        attack: 15,
        attackSpeed: 1.2,
        defense: 6,
        exp: 70,
        gold: 100,
        drops: [
            { itemId: 'antidote', chance: 1.0, quantity: [2, 2] },
            { itemId: 'spider_queen_fang', chance: 0.6, quantity: [1, 1] },  // 提高掉落率
            { itemId: 'poison_gland', chance: 0.5, quantity: [2, 3] }        // 新增掉落
        ],
        equipmentDrops: [
            { equipmentId: 'spider_silk_gloves', chance: 0.06 }
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
        level: 15,
        hp: 150,
        maxHp: 150,
        attack: 18,
        attackSpeed: 1,
        defense: 10,
        exp: 80,
        gold: 120,
        drops: [
            { itemId: 'wolf_pelt', chance: 1.0, quantity: [2, 2] },
            { itemId: 'alpha_fang', chance: 0.3, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'wolf_fang_blade', chance: 0.06 }
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
        level: 20,
        hp: 250,
        maxHp: 250,
        attack: 22,
        attackSpeed: 2.2,
        defense: 12,
        exp: 150,
        gold: 200,
        drops: [
            { itemId: 'forge_core', chance: 1.0, quantity: [1, 1] },
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
        level: 23,
        hp: 200,
        maxHp: 200,
        attack: 20,
        attackSpeed: 1.2,
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
        level: 25,
        hp: 180,
        maxHp: 180,
        attack: 28,
        attackSpeed: 1.2,
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
        level: 28,
        hp: 220,
        maxHp: 220,
        attack: 25,
        attackSpeed: 1,
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
        level: 30,
        hp: 300,
        maxHp: 300,
        attack: 22,
        attackSpeed: 1.2,
        defense: 20,
        exp: 130,
        gold: 250,
        drops: [
            { itemId: 'ice_essence', chance: 1.0, quantity: [2, 2] },
            { itemId: 'frost_core', chance: 0.3, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'frost_blade', chance: 0.04 }
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
        level: 33,
        hp: 400,
        maxHp: 400,
        attack: 35,
        attackSpeed: 1.4,
        defense: 22,
        exp: 250,
        gold: 500,
        drops: [
            { itemId: 'molten_core', chance: 1.0, quantity: [1, 1] },
            { itemId: 'hell_knight_armor', chance: 1.0, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'tower_hell_knight_lance', chance: 0.25 }
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
        level: 35,
        hp: 280,
        maxHp: 280,
        attack: 30,
        attackSpeed: 1,
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
        level: 38,
        hp: 350,
        maxHp: 350,
        attack: 32,
        attackSpeed: 1,
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
        level: 40,
        hp: 300,
        maxHp: 300,
        attack: 38,
        attackSpeed: 1,
        defense: 18,
        exp: 170,
        gold: 400,
        drops: [
            { itemId: 'thunder_feather', chance: 1.0, quantity: [2, 2] },
            { itemId: 'storm_essence', chance: 0.3, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'thunder_axe', chance: 0.04 }
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
        level: 43,
        hp: 280,
        maxHp: 280,
        attack: 42,
        attackSpeed: 1.4,
        defense: 15,
        exp: 180,
        gold: 450,
        drops: [
            { itemId: 'magic_crystal', chance: 1.0, quantity: [2, 2] },
            { itemId: 'spectral_staff', chance: 0.3, quantity: [1, 1] }
        ],
        skills: ['soul_bolt', 'focus_break'],
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
        level: 45,
        hp: 600,
        maxHp: 600,
        attack: 45,
        attackSpeed: 2.2,
        defense: 28,
        exp: 400,
        gold: 800,
        drops: [
            { itemId: 'rare_metal', chance: 1.0, quantity: [1, 1] },
            { itemId: 'abyss_blade', chance: 1.0, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'tower_abyss_armor', chance: 0.25 }
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
        level: 48,
        hp: 500,
        maxHp: 500,
        attack: 35,
        attackSpeed: 1.4,
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
        level: 50,
        hp: 550,
        maxHp: 550,
        attack: 48,
        attackSpeed: 1,
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
        level: 55,
        hp: 700,
        maxHp: 700,
        attack: 50,
        attackSpeed: 1.2,
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
        level: 60,
        hp: 800,
        maxHp: 800,
        attack: 55,
        attackSpeed: 2.2,
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
        level: 70,
        hp: 1200,
        maxHp: 1200,
        attack: 65,
        attackSpeed: 2.2,
        defense: 45,
        exp: 1000,
        gold: 2000,
        drops: [
            { itemId: 'legendary_shard', chance: 1.0, quantity: [2, 3] },
            { itemId: 'boss_void_crown', chance: 1.0, quantity: [1, 1] },
            { itemId: 'elemental_core', chance: 0.5, quantity: [1, 1] },
            { itemId: 'titan_heart', chance: 0.3, quantity: [1, 1] }
        ],
        equipmentDrops: [
            { equipmentId: 'tower_void_blade', chance: 0.30 },
            { equipmentId: 'tower_void_crown', chance: 0.25 }
        ],
        skills: ['void_rupture', 'reality_tear', 'dimension_shift', 'annihilation'],
        description: '統治虛空的終極存在，無盡塔的最終守護者。',
        towerFloor: 20
    }
};

// Level groups: split into four logical groups used by map/manager code.
// - LowLevelMonster: levels 1-15 (excluding BOSS and WORLD_BOSS)
// - MediumLevelMonster: levels 16-35 (excluding BOSS and WORLD_BOSS)
// - HighLevelMonster: levels 36-55 (excluding BOSS and WORLD_BOSS)
// - DeathLevelMonster: levels 56-70 (excluding BOSS and WORLD_BOSS)
export const LowLevelMonster = Object.values(MonsterDatabase).filter(m => typeof m.level === 'number' && m.level >= 1 && m.level <= 15 && m.type !== MonsterType.BOSS && m.type !== MonsterType.WORLD_BOSS);
export const MediumLevelMonster = Object.values(MonsterDatabase).filter(m => typeof m.level === 'number' && m.level >= 16 && m.level <= 35 && m.type !== MonsterType.BOSS && m.type !== MonsterType.WORLD_BOSS);
export const HighLevelMonster = Object.values(MonsterDatabase).filter(m => typeof m.level === 'number' && m.level >= 36 && m.level <= 55 && m.type !== MonsterType.BOSS && m.type !== MonsterType.WORLD_BOSS);
export const DeathLevelMonster = Object.values(MonsterDatabase).filter(m => typeof m.level === 'number' && m.level >= 56 && m.level <= 70 && m.type !== MonsterType.BOSS && m.type !== MonsterType.WORLD_BOSS);

// 所有 BOSS 與 WORLD_BOSS 的 ID
export const BossMonsterIds = Object.values(MonsterDatabase)
    .filter(m => m && (m.type === MonsterType.BOSS || m.type === MonsterType.WORLD_BOSS))
    .map(m => m.id);

// 匯出所有怪物清單（陣列）供其他模組使用
export const AllMonsters = Object.values(MonsterDatabase);
export const TowerMonsters = Object.values(TowerMonsterData);
