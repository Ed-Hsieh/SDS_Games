/**
 * Materials.js
 * 材料與掉落物資料庫 - 所有怪物掉落的素材都可用於鍛造/強化
 */

import { ItemType, ItemRarity } from '../models/Enums.js';

/**
 * 材料資料庫
 * 所有材料都有明確用途：
 * - 鍛造新裝備
 * - 強化裝備（降低費用或提高成功率）
 * - 製作消耗品
 */
export const MaterialDatabase = {
    // ==================== 基礎材料 ====================
    slime_jelly: {
        id: 'slime_jelly',
        name: '史萊姆凝膠',
        icon: '🟢',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.COMMON,
        price: 5,
        description: '史萊姆的身體凝膠，可用於製作基礎藥水。',
        craftUse: ['health_potion_s', 'mana_potion_s']
    },
    
    beast_hide: {
        id: 'beast_hide',
        name: '獸皮',
        icon: '🟤',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.COMMON,
        price: 8,
        description: '野獸的皮毛，可用於製作皮甲。',
        craftUse: ['leather_armor', 'leather_boots']
    },
    
    raw_meat: {
        id: 'raw_meat',
        name: '生肉',
        icon: '🥩',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.COMMON,
        price: 5,
        description: '新鮮的肉，可以烹飪或出售。',
        craftUse: ['cooked_meat']
    },
    
    goblin_ear: {
        id: 'goblin_ear',
        name: '哥布林耳朵',
        icon: '👂',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.COMMON,
        price: 10,
        description: '哥布林的耳朵，可作為任務證明。',
        craftUse: ['bounty_item']
    },
    
    iron_ore: {
        id: 'iron_ore',
        name: '鐵礦石',
        icon: '⛏️',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.COMMON,
        price: 15,
        description: '基礎鍛造材料。',
        craftUse: ['iron_sword', 'iron_armor', 'enhancement_material']
    },
    
    // ==================== 森林材料 ====================
    wolf_pelt: {
        id: 'wolf_pelt',
        name: '狼皮',
        icon: '🐺',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        price: 25,
        description: '品質優良的狼皮。',
        craftUse: ['wolf_cloak', 'leather_armor_plus']
    },
    
    wolf_fang: {
        id: 'wolf_fang',
        name: '狼牙',
        icon: '🦷',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        price: 20,
        description: '鋒利的狼牙，可製作飾品。',
        craftUse: ['fang_necklace']
    },
    
    spider_silk: {
        id: 'spider_silk',
        name: '蜘蛛絲',
        icon: '🕸️',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        price: 18,
        description: '堅韌的蜘蛛絲。',
        craftUse: ['silk_robe', 'bow_string']
    },
    
    poison_gland: {
        id: 'poison_gland',
        name: '毒腺',
        icon: '☠️',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        price: 30,
        description: '含有劇毒的腺體。',
        craftUse: ['poison_dagger', 'antidote']
    },
    
    ancient_bark: {
        id: 'ancient_bark',
        name: '古樹皮',
        icon: '🌳',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        price: 35,
        description: '古老樹人的樹皮。',
        craftUse: ['nature_staff', 'bark_shield']
    },
    
    life_seed: {
        id: 'life_seed',
        name: '生命種子',
        icon: '🌱',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 80,
        description: '蘊含生命力的種子。',
        craftUse: ['life_potion', 'nature_amulet']
    },
    
    guardian_branch: {
        id: 'guardian_branch',
        name: '守護者樹枝',
        icon: '🌿',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 150,
        description: '森林守護者的樹枝，蘊含自然之力。',
        craftUse: ['guardian_staff', 'nature_armor']
    },
    
    forest_essence: {
        id: 'forest_essence',
        name: '森林精華',
        icon: '✨',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 200,
        description: '森林的純淨精華。',
        craftUse: ['vitality_reforge', 'enhancement_boost']
    },
    
    // ==================== 遺跡材料 ====================
    bone_fragment: {
        id: 'bone_fragment',
        name: '骨頭碎片',
        icon: '🦴',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.COMMON,
        price: 12,
        description: '骷髏的骨頭碎片。',
        craftUse: ['bone_weapon', 'bone_armor']
    },
    
    ectoplasm: {
        id: 'ectoplasm',
        name: '靈質',
        icon: '👻',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        price: 40,
        description: '幽靈留下的神秘物質。',
        craftUse: ['ghost_cloak', 'spirit_potion']
    },
    
    spirit_essence: {
        id: 'spirit_essence',
        name: '靈魂精華',
        icon: '💫',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 100,
        description: '純淨的靈魂能量。',
        craftUse: ['focus_reforge', 'soul_weapon']
    },
    
    golem_core: {
        id: 'golem_core',
        name: '魔像核心',
        icon: '⚙️',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 120,
        description: '驅動魔像的核心。',
        craftUse: ['golem_armor', 'mechanical_weapon']
    },
    
    stone_fragment: {
        id: 'stone_fragment',
        name: '石材',
        icon: '🪨',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.COMMON,
        price: 10,
        description: '堅硬的石材。',
        craftUse: ['stone_shield', 'foundation']
    },
    
    lich_phylactery: {
        id: 'lich_phylactery',
        name: '巫妖命匣',
        icon: '💀',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        price: 500,
        description: '巫妖靈魂的容器，蘊含黑暗力量。',
        craftUse: ['dark_staff', 'lich_robe']
    },
    
    // ==================== Missing / Stub Materials (added by validation fix) ====================
    goblin_coin: {
        id: 'goblin_coin',
        name: '哥布林硬幣',
        icon: '🪙',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.COMMON,
        price: 1,
        description: '哥布林掉落的小硬幣，可用於任務或小額交易。',
        craftUse: []
    },

    orc_fang: {
        id: 'orc_fang',
        name: '獸人牙齒',
        icon: '🦷',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.COMMON,
        price: 8,
        description: '獸人的獠牙，用於製作簡易飾品或任務。',
        craftUse: []
    },

    rat_tail: {
        id: 'rat_tail',
        name: '老鼠尾巴',
        icon: '🐀',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.COMMON,
        price: 2,
        description: '常見的小型素材，常被鍊金或任務使用。',
        craftUse: []
    },

    bat_wing: {
        id: 'bat_wing',
        name: '蝙蝠翅膀',
        icon: '🦇',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.COMMON,
        price: 30,
        description: '暗影蝙蝠掉落的薄翼，可作為裁縫與鍛造材料。',
        craftUse: ['bat_wing_cloak']
    },

    // Pool materials referenced from active drop and reroll systems.
    iron_shard: { id: 'iron_shard', name: '鐵片', icon: '⛓️', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON, price: 6, description: '鐵製碎片，可作為低階鍛造材料。', craftUse: ['weapon_craft_pool', 'affix_reroll_pool'] },
    high_ore: { id: 'high_ore', name: '高級礦石', icon: '⛏️', type: ItemType.MATERIAL, rarity: ItemRarity.RARE, price: 120, description: '富含礦物質的礦石，用於高階製作。', craftUse: ['advanced_craft_pool', 'affix_reroll_pool'] },
    rare_metal: { id: 'rare_metal', name: '稀有金屬', icon: '🔧', type: ItemType.MATERIAL, rarity: ItemRarity.RARE, price: 200, description: '稀有且昂貴的金屬，用於特殊裝備。', craftUse: ['advanced_craft_pool', 'legendary_reforge_pool'] },
    forge_core: { id: 'forge_core', name: '鍛造核心', icon: '🔥', type: ItemType.MATERIAL, rarity: ItemRarity.RARE, price: 300, description: '鍛造過程中的能量核心。', craftUse: ['advanced_craft_pool', 'legendary_reforge_pool'] },

    dark_crystal: {
        id: 'dark_crystal',
        name: '暗黑水晶',
        icon: '🔮',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 150,
        description: '充滿黑暗能量的水晶。',
        craftUse: ['shadow_weapon', 'dark_catalyst']
    },
    
    // ==================== 暗影材料 ====================
    shadow_shard: {
        id: 'shadow_shard',
        name: '暗影碎片',
        icon: '🌑',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        price: 45,
        description: '凝固的暗影能量。',
        craftUse: ['shadow_blade', 'shadow_cloak']
    },

    soul_fragment: {
        id: 'soul_fragment',
        name: '靈魂碎片',
        icon: '🕯️',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 120,
        description: '被黑暗交易污染的靈魂殘片。',
        craftUse: []
    },

    cursed_shard: {
        id: 'cursed_shard',
        name: '詛咒碎片',
        icon: '🔮',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 180,
        description: '帶有詛咒氣息的碎片，商人會特別留意這種稀有物。',
        craftUse: []
    },
    
    dark_steel: {
        id: 'dark_steel',
        name: '暗鋼',
        icon: '⚫',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 100,
        description: '被暗影侵蝕的鋼鐵。',
        craftUse: ['dark_sword', 'dark_armor']
    },
    
    shadow_arrow: {
        id: 'shadow_arrow',
        name: '暗影箭矢',
        icon: '➤',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        price: 15,
        description: '暗影弓手使用的箭矢。',
        craftUse: ['shadow_bow']
    },
    
    shadow_essence: {
        id: 'shadow_essence',
        name: '暗影精華',
        icon: '🌒',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 180,
        description: '純粹的暗影能量。',
        craftUse: ['shadow_reforge', 'shadow_enhancement']
    },
    
    magic_crystal: {
        id: 'magic_crystal',
        name: '魔力結晶',
        icon: '💎',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 120,
        description: '凝聚的魔力結晶。',
        craftUse: ['focus_reforge', 'magic_weapon']
    },
    
    commander_blade: {
        id: 'commander_blade',
        name: '指揮官之劍',
        icon: '⚔️',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        price: 600,
        description: '暗影指揮官的配劍，可用於鍛造。',
        craftUse: ['shadow_commander_weapon']
    },
    
    shadow_core: {
        id: 'shadow_core',
        name: '暗影核心',
        icon: '⬛',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        price: 400,
        description: '暗影的核心能量。',
        craftUse: ['shadow_legendary']
    },
    
    // ==================== 古代遺跡材料 ====================
    ancient_gear: {
        id: 'ancient_gear',
        name: '古代齒輪',
        icon: '⚙️',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        price: 60,
        description: '古代機械的零件。',
        craftUse: ['mechanical_armor', 'clockwork_weapon']
    },
    
    mithril_ore: {
        id: 'mithril_ore',
        name: '秘銀礦',
        icon: '🔘',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 200,
        description: '珍貴的秘銀礦石。',
        craftUse: ['mithril_weapon', 'mithril_armor']
    },
    
    crystal_shard: {
        id: 'crystal_shard',
        name: '水晶碎片',
        icon: '💠',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        price: 50,
        description: '純淨的水晶碎片。',
        craftUse: ['crystal_accessory', 'crystal_reforge']
    },
    
    pure_crystal: {
        id: 'pure_crystal',
        name: '純淨水晶',
        icon: '✨',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 180,
        description: '完美無瑕的水晶。',
        craftUse: ['guard_reforge', 'crystal_weapon']
    },
    
    ancient_rune: {
        id: 'ancient_rune',
        name: '古代符文',
        icon: '📜',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        price: 350,
        description: '記載古代力量的符文。',
        craftUse: ['rune_weapon', 'rune_armor']
    },
    
    rune_stone: {
        id: 'rune_stone',
        name: '符文石',
        icon: '🪨',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 150,
        description: '刻有符文的石頭。',
        craftUse: ['rune_accessory']
    },
    
    titan_heart: {
        id: 'titan_heart',
        name: '泰坦之心',
        icon: '❤️',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.LEGENDARY,
        price: 1000,
        description: '泰坦的心臟，蘊含遠古之力。',
        craftUse: ['titan_weapon', 'titan_armor']
    },
    
    ancient_artifact: {
        id: 'ancient_artifact',
        name: '古代神器碎片',
        icon: '🏺',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        price: 500,
        description: '失落文明的神器碎片。',
        craftUse: ['artifact_weapon']
    },
    
    // ==================== 元素材料 ====================
    fire_essence: {
        id: 'fire_essence',
        name: '火焰精華',
        icon: '🔥',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        price: 80,
        description: '純粹的火焰能量。',
        craftUse: ['fire_weapon', 'fire_catalyst']
    },
    
    ember_stone: {
        id: 'ember_stone',
        name: '餘燼石',
        icon: '⛏️',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 150,
        description: '永不熄滅的火焰之石。',
        craftUse: ['power_reforge', 'fire_weapon_plus']
    },
    
    ice_essence: {
        id: 'ice_essence',
        name: '冰霜精華',
        icon: '❄️',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        price: 80,
        description: '純粹的冰霜能量。',
        craftUse: ['ice_weapon', 'ice_catalyst']
    },
    
    frost_crystal: {
        id: 'frost_crystal',
        name: '霜晶',
        icon: '🧊',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 150,
        description: '永不融化的冰晶。',
        craftUse: ['guard_reforge', 'ice_weapon_plus']
    },
    
    frost_core: {
        id: 'frost_core',
        name: '冰霜核心',
        icon: '💙',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 200,
        description: '冰霜巨人的核心。',
        craftUse: ['frost_armor', 'ice_legendary']
    },
    
    thunder_essence: {
        id: 'thunder_essence',
        name: '雷電精華',
        icon: '⚡',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        price: 80,
        description: '純粹的雷電能量。',
        craftUse: ['thunder_weapon', 'thunder_catalyst']
    },
    
    storm_crystal: {
        id: 'storm_crystal',
        name: '風暴水晶',
        icon: '🌩️',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 150,
        description: '蘊含風暴之力的水晶。',
        craftUse: ['precision_reforge', 'thunder_weapon_plus']
    },
    
    storm_essence: {
        id: 'storm_essence',
        name: '風暴精華',
        icon: '🌪️',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 180,
        description: '凝聚的風暴能量。',
        craftUse: ['storm_weapon']
    },
    
    earth_essence: {
        id: 'earth_essence',
        name: '大地精華',
        icon: '🌍',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        price: 80,
        description: '純粹的大地能量。',
        craftUse: ['earth_weapon', 'earth_catalyst']
    },
    
    geo_crystal: {
        id: 'geo_crystal',
        name: '岩晶',
        icon: '💎',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 150,
        description: '來自大地深處的水晶。',
        craftUse: ['vitality_reforge', 'earth_weapon_plus']
    },
    
    elemental_core: {
        id: 'elemental_core',
        name: '元素核心',
        icon: '🌈',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.LEGENDARY,
        price: 800,
        description: '四大元素融合的核心。',
        craftUse: ['elemental_weapon', 'elemental_armor']
    },
    
    primal_essence: {
        id: 'primal_essence',
        name: '原始精華',
        icon: '✨',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.LEGENDARY,
        price: 1000,
        description: '世界初創時的原始能量。',
        craftUse: ['legendary_weapon', 'legendary_armor']
    },
    
    // ==================== 龍族材料 ====================
    wyvern_scale: {
        id: 'wyvern_scale',
        name: '翼龍鱗片',
        icon: '🦎',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        price: 100,
        description: '翼龍的鱗片。',
        craftUse: ['scale_armor', 'dragon_accessory']
    },
    
    wyvern_wing: {
        id: 'wyvern_wing',
        name: '翼龍翅膀',
        icon: '🦅',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 200,
        description: '翼龍的翅膀膜。',
        craftUse: ['wing_cloak', 'flight_boots']
    },
    
    drake_scale: {
        id: 'drake_scale',
        name: '幼龍鱗片',
        icon: '🐉',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 180,
        description: '幼龍的鱗片，比翼龍更堅硬。',
        craftUse: ['dragon_armor', 'dragon_shield']
    },
    
    dragon_tooth: {
        id: 'dragon_tooth',
        name: '龍牙',
        icon: '🦷',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 250,
        description: '龍的牙齒，鋒利無比。',
        craftUse: ['dragon_dagger', 'dragon_necklace']
    },
    
    dragon_scale_armor: {
        id: 'dragon_scale_armor',
        name: '龍鱗甲片',
        icon: '🛡️',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        price: 400,
        description: '龍騎士的鎧甲碎片。',
        craftUse: ['dragon_knight_armor']
    },
    
    dragon_knight_badge: {
        id: 'dragon_knight_badge',
        name: '龍騎士徽章',
        icon: '🎖️',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        price: 350,
        description: '龍騎士的榮譽徽章。',
        craftUse: ['dragon_knight_accessory']
    },
    
    dragon_heart: {
        id: 'dragon_heart',
        name: '龍心',
        icon: '💜',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.LEGENDARY,
        price: 1500,
        description: '龍的心臟，蘊含龍之力。',
        craftUse: ['dragon_weapon', 'dragon_legendary']
    },
    
    elder_dragon_scale: {
        id: 'elder_dragon_scale',
        name: '古龍鱗片',
        icon: '🐲',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.LEGENDARY,
        price: 1200,
        description: '古龍的鱗片，極其珍貴。',
        craftUse: ['elder_dragon_armor', 'dragon_legendary']
    },
    
    dark_dragon_scale: {
        id: 'dark_dragon_scale',
        name: '暗龍鱗片',
        icon: '⬛',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        price: 500,
        description: '被暗影腐化的龍鱗。',
        craftUse: ['dark_dragon_armor']
    },
    
    // ==================== 暗影軍團材料 ====================
    assassin_blade: {
        id: 'assassin_blade',
        name: '刺客之刃',
        icon: '🗡️',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        price: 450,
        description: '暗影刺客的武器。',
        craftUse: ['assassin_weapon']
    },
    
    shadow_cloak_fragment: {
        id: 'shadow_cloak_fragment',
        name: '暗影斗篷碎片',
        icon: '🧥',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 200,
        description: '暗影斗篷的碎片。',
        craftUse: ['shadow_cloak']
    },
    
    general_armor: {
        id: 'general_armor',
        name: '將軍鎧甲碎片',
        icon: '🛡️',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        price: 550,
        description: '暗影將領的鎧甲碎片。',
        craftUse: ['shadow_general_armor']
    },
    
    shadow_insignia: {
        id: 'shadow_insignia',
        name: '暗影徽記',
        icon: '🏴',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        price: 400,
        description: '暗影軍團的徽記。',
        craftUse: ['shadow_accessory']
    },
    
    overlord_crown: {
        id: 'overlord_crown',
        name: '霸主王冠碎片',
        icon: '👑',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.LEGENDARY,
        price: 1000,
        description: '暗影霸主的王冠碎片。',
        craftUse: ['overlord_helm']
    },
    
    void_essence: {
        id: 'void_essence',
        name: '虛空精華',
        icon: '🌑',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.LEGENDARY,
        price: 1200,
        description: '來自虛空的純粹能量。',
        craftUse: ['void_weapon', 'void_armor']
    },
    
    // ==================== 魔族材料 ====================
    demon_horn: {
        id: 'demon_horn',
        name: '魔族角',
        icon: '📛',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 300,
        description: '魔族的角。',
        craftUse: ['demon_helm', 'demon_weapon']
    },
    
    demonic_steel: {
        id: 'demonic_steel',
        name: '魔鋼',
        icon: '🔩',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        price: 450,
        description: '來自地獄的鋼鐵。',
        craftUse: ['demon_weapon', 'demon_armor']
    },
    
    demon_general_helm: {
        id: 'demon_general_helm',
        name: '魔將頭盔碎片',
        icon: '⛑️',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        price: 600,
        description: '魔族將軍的頭盔碎片。',
        craftUse: ['demon_general_armor']
    },
    
    abyssal_shard: {
        id: 'abyssal_shard',
        name: '深淵碎片',
        icon: '🌀',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.LEGENDARY,
        price: 800,
        description: '來自深淵的神秘碎片。',
        craftUse: ['abyss_weapon', 'abyss_armor']
    },
    
    world_shard: {
        id: 'world_shard',
        name: '世界碎片',
        icon: '🌍',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.LEGENDARY,
        price: 2000,
        description: '據說是世界本源的碎片，極其珍貴。',
        craftUse: ['world_weapon', 'world_armor']
    },
    
    // ==================== 無盡塔專屬材料 ====================
    slime_crown: {
        id: 'slime_crown',
        name: '史萊姆王冠',
        icon: '👑',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        price: 50,
        description: '史萊姆王的王冠。',
        craftUse: ['slime_accessory']
    },
    
    bone_sword: {
        id: 'bone_sword',
        name: '骨劍碎片',
        icon: '🦴',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        price: 60,
        description: '骷髏隊長的武器碎片。',
        craftUse: ['bone_weapon']
    },
    
    spider_queen_fang: {
        id: 'spider_queen_fang',
        name: '蜘蛛女王毒牙',
        icon: '🕷️',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 100,
        description: '蜘蛛女王的毒牙。',
        craftUse: ['poison_weapon']
    },
    
    alpha_fang: {
        id: 'alpha_fang',
        name: '首領獠牙',
        icon: '🐺',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 120,
        description: '狼群首領的獠牙。',
        craftUse: ['fang_weapon']
    },
    
    gargoyle_wing: {
        id: 'gargoyle_wing',
        name: '石像鬼翅膀',
        icon: '🦇',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 150,
        description: '石像鬼的翅膀。',
        craftUse: ['stone_accessory']
    },
    
    imp_horn: {
        id: 'imp_horn',
        name: '小惡魔角',
        icon: '😈',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 180,
        description: '火焰小惡魔的角。',
        craftUse: ['fire_accessory']
    },
    
    thunder_feather: {
        id: 'thunder_feather',
        name: '雷羽',
        icon: '🪶',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 200,
        description: '雷鷹的羽毛，帶有電流。',
        craftUse: ['thunder_accessory', 'speed_boots']
    },
    
    lava_scale: {
        id: 'lava_scale',
        name: '熔岩鱗片',
        icon: '🔥',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 220,
        description: '熔岩蜥蜴的鱗片。',
        craftUse: ['fire_armor']
    },
    
    molten_core: {
        id: 'molten_core',
        name: '熔岩核心',
        icon: '🌋',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        price: 400,
        description: '熔岩蜥蜴的核心。',
        craftUse: ['fire_legendary']
    },
    
    carnivore_seed: {
        id: 'carnivore_seed',
        name: '食人花種子',
        icon: '🌱',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        price: 180,
        description: '食人花的種子，危險！',
        craftUse: ['nature_weapon']
    },
    
    hydra_scale: {
        id: 'hydra_scale',
        name: '九頭蛇鱗',
        icon: '🐍',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        price: 350,
        description: '九頭蛇的鱗片。',
        craftUse: ['hydra_armor']
    },
    
    hydra_fang: {
        id: 'hydra_fang',
        name: '九頭蛇毒牙',
        icon: '🦷',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        price: 400,
        description: '九頭蛇的毒牙。',
        craftUse: ['hydra_weapon']
    },
    
    spectral_staff: {
        id: 'spectral_staff',
        name: '幽靈法杖碎片',
        icon: '🪄',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        price: 380,
        description: '幽靈法師的法杖碎片。',
        craftUse: ['spectral_weapon']
    },
    
    primordial_stone: {
        id: 'primordial_stone',
        name: '原始之石',
        icon: '🪨',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.LEGENDARY,
        price: 1000,
        description: '原始泰坦的結晶。',
        craftUse: ['primordial_weapon']
    },
    
    legendary_shard: {
        id: 'legendary_shard',
        name: '傳說碎片',
        icon: '✨',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.LEGENDARY,
        price: 1500,
        description: '可用於製作任何傳說裝備的神秘碎片。',
        craftUse: ['any_legendary']
    },
    
    // ==================== 消耗品 ====================
    health_potion_s: {
        id: 'health_potion_s',
        name: '小型生命藥水',
        icon: '🧪',
        type: ItemType.POTION,
        rarity: ItemRarity.COMMON,
        price: 20,
        description: '恢復 30 點生命值。',
        effect: { hp: 30 }
    },
    
    antidote: {
        id: 'antidote',
        name: '解毒劑',
        icon: '💊',
        type: ItemType.POTION,
        rarity: ItemRarity.COMMON,
        price: 25,
        description: '解除中毒狀態。',
        effect: { cure: 'poison' }
    }
};

// NOTE: data module should not contain logic. Material lookups (getMaterial, getMaterialsByRarity,
// getMaterialsForCraft) have been moved to `src/js/managers/MaterialManager.js`.
