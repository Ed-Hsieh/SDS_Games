/**
 * Canonical equipment and set records.
 *
 * Records contain their final runtime metadata. Do not add post-load source,
 * rarity, durability, progression, or signature-item override tables.
 */

export const EquipmentDatabase = {
    "slime_sword": {
        "id": "slime_sword",
        "name": "青凝刃",
        "icon": "🗡️",
        "type": "weapon",
        "weaponForm": "dagger",
        "rarity": "epic",
        "level": 1,
        "stats": {"attack":6,"defense":0,"critChance":0.05,"critDamage":1.3,"weaponSpeed":1,"attackSpeed":1.2},
        "specialEffects": [{"type":"lifesteal","value":30}],
        "setId": null,
        "description": "由史萊姆凝膠包裹的短刃，命中時能吸取生命。",
        "balanceIntent": "early_chase_unique",
        "dropFrom": ["slime"],
        "maxDurability": 27,
        "durability": 27
    },

    "goblin_dagger": {
        "id": "goblin_dagger",
        "name": "哥布林短刀",
        "icon": "🔪",
        "type": "weapon",
        "weaponForm": "dagger",
        "rarity": "uncommon",
        "level": 3,
        "stats": {"attack":10,"defense":0,"critChance":0.15,"critDamage":1.6,"weaponSpeed":1,"attackSpeed":1.2},
        "specialEffects": [{"type":"critDamage","value":10}],
        "setId": null,
        "description": "哥布林首領的愛刀，鋒利無比。",
        "dropFrom": [],
        "maxDurability": 18,
        "durability": 18
    },

    "wolf_fang_blade": {
        "id": "wolf_fang_blade",
        "name": "狼牙刀",
        "icon": "⚔️",
        "type": "weapon",
        "weaponForm": "sword",
        "rarity": "uncommon",
        "level": 5,
        "stats": {"attack":14,"defense":0,"critChance":0.12,"critDamage":1.7,"weaponSpeed":1.1,"attackSpeed":1.3},
        "specialEffects": [{"type":"double_strike","value":10}],
        "setId": "wolf_hunter",
        "description": "由狼牙製成的武器，有機率造成雙重打擊。",
        "dropFrom": ["wild_wolf"],
        "maxDurability": 19,
        "durability": 19
    },

    "wolf_pelt_armor": {
        "id": "wolf_pelt_armor",
        "name": "狼皮護甲",
        "icon": "🥋",
        "type": "equipment",
        "rarity": "uncommon",
        "level": 5,
        "stats": {"attack":2,"defense":12,"critChance":0.03,"critDamage":1.2},
        "specialEffects": [],
        "setId": "wolf_hunter",
        "description": "由狼皮製成的護甲，輕便保暖。",
        "dropFrom": [],
        "maxDurability": 21,
        "durability": 21
    },

    "spider_silk_gloves": {
        "id": "spider_silk_gloves",
        "name": "蛛絲手套",
        "icon": "🧤",
        "type": "equipment",
        "rarity": "uncommon",
        "level": 8,
        "stats": {"attack":6,"defense":7,"critChance":0.08,"critDamage":1.45},
        "specialEffects": [{"type":"poison","value":5}],
        "setId": null,
        "description": "由蜘蛛絲編織的手套，帶有微量毒素。",
        "dropFrom": ["poison_spider","tower_poison_queen"],
        "maxDurability": 19,
        "durability": 19
    },

    "forest_guardian_staff": {
        "id": "forest_guardian_staff",
        "name": "森衛枝杖",
        "icon": "🌿",
        "type": "weapon",
        "weaponForm": "focus",
        "rarity": "legendary",
        "level": 13,
        "stats": {"attack":18,"defense":5,"critChance":0.1,"critDamage":1.5,"weaponSpeed":0.9,"attackSpeed":1},
        "specialEffects": [{"type":"lifesteal","value":5}],
        "setId": "forest_guardian",
        "description": "森林守護者的權杖，蘊含自然之力。",
        "dropFrom": ["forest_guardian"],
        "rewardRole": "boss_signature",
        "sourceChapter": 1,
        "maxDurability": 40,
        "durability": 40
    },

    "forest_guardian_crown": {
        "id": "forest_guardian_crown",
        "name": "森衛枝冠",
        "icon": "👑",
        "type": "equipment",
        "rarity": "rare",
        "level": 13,
        "stats": {"attack":3,"defense":15,"critChance":0.05,"critDamage":1.3},
        "specialEffects": [{"type":"damageReduction","value":5}],
        "setId": "forest_guardian",
        "description": "由樹枝與樹葉編織的王冠。",
        "dropFrom": [],
        "maxDurability": 28,
        "durability": 28
    },

    "undead_dagger": {
        "id": "undead_dagger",
        "name": "亡者短匕",
        "icon": "🗡️",
        "type": "weapon",
        "weaponForm": "dagger",
        "rarity": "uncommon",
        "level": 13,
        "stats": {"attack":16,"defense":0,"critChance":0.1,"critDamage":1.5,"weaponSpeed":1,"attackSpeed":1.2},
        "specialEffects": [{"type":"armorPenetration","value":10}],
        "setId": "undead_slayer",
        "description": "以亡者骨片與鏽鐵拼成的短匕，狹窄刃口擅長刺入護甲縫隙。",
        "dropFrom": ["skeleton_warrior"],
        "maxDurability": 23,
        "durability": 23
    },

    "ghost_cloak": {
        "id": "ghost_cloak",
        "name": "薄霧斗篷",
        "icon": "👻",
        "type": "equipment",
        "rarity": "rare",
        "level": 15,
        "stats": {"attack":5,"defense":10,"critChance":0.08,"critDamage":1.4},
        "specialEffects": [{"type":"dodgeChance","value":10}],
        "setId": "undead_slayer",
        "description": "由靈質編織的斗篷，能讓穿戴者隱匿身形。",
        "dropFrom": [],
        "maxDurability": 27,
        "durability": 27
    },

    "lich_staff": {
        "id": "lich_staff",
        "name": "枯魂法杖",
        "icon": "☠️",
        "type": "weapon",
        "weaponForm": "focus",
        "rarity": "legendary",
        "level": 20,
        "stats": {"attack":28,"defense":3,"critChance":0.15,"critDamage":2,"weaponSpeed":0.8,"attackSpeed":0.9},
        "specialEffects": [{"type":"lifesteal","value":10},{"type":"execute","value":20}],
        "setId": null,
        "description": "巫妖的權杖，蘊含死亡的力量。",
        "dropFrom": ["lich"],
        "rewardRole": "boss_signature",
        "sourceChapter": 2,
        "maxDurability": 42,
        "durability": 42
    },

    "shadow_blade_drop": {
        "id": "shadow_blade_drop",
        "name": "影縫刃",
        "icon": "🗡️",
        "type": "weapon",
        "weaponForm": "dagger",
        "rarity": "rare",
        "level": 23,
        "stats": {"attack":25,"defense":0,"critChance":0.18,"critDamage":1.9,"weaponSpeed":1.2,"attackSpeed":1.4},
        "specialEffects": [{"type":"critDamage","value":10}],
        "setId": "shadow_legion",
        "description": "暗影士兵的標準配刀。",
        "dropFrom": ["shadow_soldier"],
        "maxDurability": 30,
        "durability": 30
    },

    "shadow_armor_drop": {
        "id": "shadow_armor_drop",
        "name": "影縫護甲",
        "icon": "⚫",
        "type": "equipment",
        "rarity": "rare",
        "level": 25,
        "stats": {"attack":5,"defense":22,"critChance":0.05,"critDamage":1.3},
        "specialEffects": [{"type":"dodgeChance","value":15}],
        "setId": "shadow_legion",
        "description": "暗影軍團的制式護甲。",
        "dropFrom": [],
        "maxDurability": 33,
        "durability": 33
    },

    "shadow_badge": {
        "id": "shadow_badge",
        "name": "影徽",
        "icon": "🛑",
        "type": "accessory",
        "rarity": "rare",
        "level": 28,
        "stats": {"attack":3,"defense":3,"critChance":0.1,"critDamage":1.5},
        "specialEffects": [{"type":"double_strike","value":10}],
        "setId": "shadow_legion",
        "description": "暗影軍團的戰靴，輕盈無聲。",
        "dropFrom": ["shadow_mage"],
        "maxDurability": 29,
        "durability": 29
    },

    "shadow_commander_blade": {
        "id": "shadow_commander_blade",
        "name": "暮影令劍",
        "icon": "⚔️",
        "type": "weapon",
        "weaponForm": "sword",
        "rarity": "legendary",
        "level": 30,
        "stats": {"attack":38,"defense":5,"critChance":0.2,"critDamage":2.2,"weaponSpeed":1,"attackSpeed":1.1},
        "specialEffects": [{"type":"armorPenetration","value":15},{"type":"lifesteal","value":5}],
        "setId": "shadow_legion",
        "description": "暗影指揮官的佩劍，斬殺無數英雄。",
        "dropFrom": ["shadow_commander"],
        "rewardRole": "boss_signature",
        "sourceChapter": 3,
        "maxDurability": 46,
        "durability": 46
    },

    "ancient_sword": {
        "id": "ancient_sword",
        "name": "古刻長劍",
        "icon": "⚔️",
        "type": "weapon",
        "weaponForm": "sword",
        "rarity": "rare",
        "level": 33,
        "stats": {"attack":32,"defense":5,"critChance":0.12,"critDamage":1.8,"weaponSpeed":1,"attackSpeed":1.2},
        "specialEffects": [{"type":"armorPenetration","value":20}],
        "setId": "ancient_relic",
        "description": "古代文明遺留的武器。",
        "dropFrom": ["ancient_guardian"],
        "maxDurability": 34,
        "durability": 34
    },

    "crystal_shield": {
        "id": "crystal_shield",
        "name": "澄晶護盾",
        "icon": "💎",
        "type": "equipment",
        "rarity": "rare",
        "level": 35,
        "stats": {"attack":0,"defense":35,"critChance":0.05,"critDamage":1.2},
        "specialEffects": [{"type":"damage_reflect","value":10},{"type":"damageReduction","value":10}],
        "setId": "ancient_relic",
        "description": "純淨水晶製成的護盾。",
        "dropFrom": ["crystal_golem"],
        "maxDurability": 36,
        "durability": 36
    },

    "rune_badge": {
        "id": "rune_badge",
        "name": "刻符徽章",
        "icon": "🧤",
        "type": "accessory",
        "rarity": "rare",
        "level": 38,
        "stats": {"attack":15,"defense":12,"critChance":0.1,"critDamage":1.6},
        "specialEffects": [{"type":"critDamage","value":25}],
        "setId": "ancient_relic",
        "description": "刻滿符文的勳章。",
        "dropFrom": [],
        "maxDurability": 32,
        "durability": 32
    },

    "titan_hammer": {
        "id": "titan_hammer",
        "name": "巨神遺錘",
        "icon": "🔨",
        "type": "weapon",
        "weaponForm": "heavy",
        "rarity": "legendary",
        "level": 40,
        "stats": {"attack":50,"defense":10,"critChance":0.15,"critDamage":2.5,"weaponSpeed":0.6,"attackSpeed":0.7},
        "specialEffects": [{"type":"armorPenetration","value":25},{"type":"execute","value":30},{"type":"double_strike","value":20}],
        "setId": "titan",
        "description": "遠古泰坦的戰錘，蘊含毀滅之力。",
        "dropFrom": ["ancient_titan"],
        "rewardRole": "boss_signature",
        "sourceChapter": 4,
        "maxDurability": 49,
        "durability": 49
    },

    "flame_sword": {
        "id": "flame_sword",
        "name": "燼火劍",
        "icon": "🔥",
        "type": "weapon",
        "weaponForm": "sword",
        "rarity": "rare",
        "level": 43,
        "stats": {"attack":35,"defense":0,"critChance":0.15,"critDamage":1.8,"weaponSpeed":1.1,"attackSpeed":1.3},
        "specialEffects": [{"type":"fire","value":20}],
        "setId": "elemental_master",
        "description": "燃燒著永恆火焰的劍。",
        "dropFrom": [],
        "maxDurability": 37,
        "durability": 37
    },

    "frost_blade": {
        "id": "frost_blade",
        "name": "霜線刃",
        "icon": "❄️",
        "type": "weapon",
        "weaponForm": "sword",
        "rarity": "rare",
        "level": 43,
        "stats": {"attack":30,"defense":5,"critChance":0.12,"critDamage":1.7,"weaponSpeed":1,"attackSpeed":1.2},
        "specialEffects": [{"type":"ice","value":20}],
        "setId": "elemental_master",
        "description": "凝結著永恆寒冰的劍。",
        "dropFrom": [],
        "maxDurability": 38,
        "durability": 38
    },

    "thunder_axe": {
        "id": "thunder_axe",
        "name": "鳴雷斧",
        "icon": "⚡",
        "type": "weapon",
        "weaponForm": "heavy",
        "rarity": "rare",
        "level": 45,
        "stats": {"attack":40,"defense":0,"critChance":0.18,"critDamage":2,"weaponSpeed":0.75,"attackSpeed":0.9},
        "specialEffects": [{"type":"thunder","value":22}],
        "setId": "elemental_master",
        "description": "蘊含雷霆之力的戰斧。",
        "dropFrom": [],
        "maxDurability": 36,
        "durability": 36
    },

    "elemental_badge": {
        "id": "elemental_badge",
        "name": "四象徽心",
        "icon": "👑",
        "type": "accessory",
        "rarity": "epic",
        "level": 50,
        "stats": {"attack":10,"defense":10,"critChance":0.15,"critDamage":1.8},
        "specialEffects": [{"type":"fire","value":10},{"type":"ice","value":10},{"type":"thunder","value":10},{"type":"damageReduction","value":10}],
        "setId": "elemental_master",
        "description": "元素之主的護符，散發元素的光芒。",
        "dropFrom": [],
        "maxDurability": 43,
        "durability": 43
    },

    "elemental_crown": {
        "id": "elemental_crown",
        "name": "四象靜冠",
        "icon": "👑",
        "type": "equipment",
        "rarity": "legendary",
        "level": 50,
        "stats": {"attack":15,"defense":25,"critChance":0.15,"critDamage":1.8},
        "specialEffects": [{"type":"fire","value":10},{"type":"ice","value":10},{"type":"thunder","value":10},{"type":"damageReduction","value":10}],
        "setId": "elemental_master",
        "description": "元素之主的王冠，融合四大元素。",
        "dropFrom": [],
        "maxDurability": 54,
        "durability": 54
    },

    "wyvern_lance": {
        "id": "wyvern_lance",
        "name": "翼龍長槍",
        "icon": "🔱",
        "type": "weapon",
        "weaponForm": "lance",
        "rarity": "rare",
        "level": 53,
        "stats": {"attack":42,"defense":5,"critChance":0.16,"critDamage":1.9,"weaponSpeed":1.1,"attackSpeed":1.3},
        "specialEffects": [{"type":"armorPenetration","value":18},{"type":"double_strike","value":10}],
        "setId": "dragon_slayer",
        "description": "專門獵殺龍類的長槍。",
        "dropFrom": ["wyvern"],
        "maxDurability": 41,
        "durability": 41
    },

    "dragon_knight_helm": {
        "id": "dragon_knight_helm",
        "name": "龍騎灰盔",
        "icon": "⛑️",
        "type": "equipment",
        "rarity": "epic",
        "level": 58,
        "stats": {"attack":12,"defense":30,"critChance":0.12,"critDamage":1.7},
        "specialEffects": [{"type":"critDamage","value":30},{"type":"damageReduction","value":10}],
        "setId": "dragon_slayer",
        "description": "龍騎士的頭盔，象徵榮耀。",
        "dropFrom": [],
        "maxDurability": 47,
        "durability": 47
    },

    "elder_dragon_fang_badge": {
        "id": "elder_dragon_fang_badge",
        "name": "古龍牙墜",
        "icon": "🐲",
        "type": "accessory",
        "rarity": "legendary",
        "level": 60,
        "stats": {"attack":58,"defense":9,"critChance":0.2,"critDamage":2.5,"weaponSpeed":0.9,"attackSpeed":1},
        "specialEffects": [{"type":"fire","value":30},{"type":"armorPenetration","value":25},{"type":"execute","value":35},{"type":"lifesteal","value":12}],
        "setId": "dragon_slayer",
        "description": "由古龍之牙鍛造的傳說護符。",
        "dropFrom": [],
        "maxDurability": 55,
        "durability": 55
    },

    "assassin_blade": {
        "id": "assassin_blade",
        "name": "無聲刃",
        "icon": "🗡️",
        "type": "weapon",
        "weaponForm": "dagger",
        "rarity": "epic",
        "level": 63,
        "stats": {"attack":55,"defense":0,"critChance":0.3,"critDamage":2.5,"weaponSpeed":1.4,"attackSpeed":1.6},
        "specialEffects": [{"type":"critDamage","value":20},{"type":"poison","value":15},{"type":"double_strike","value":15}],
        "setId": null,
        "description": "暗影刺客的致命武器。",
        "dropFrom": ["shadow_assassin"],
        "maxDurability": 50,
        "durability": 50
    },

    "shadow_overlord_armor": {
        "id": "shadow_overlord_armor",
        "name": "夜影殘甲",
        "icon": "👹",
        "type": "equipment",
        "rarity": "legendary",
        "level": 65,
        "stats": {"attack":16,"defense":68,"critChance":0.13,"critDamage":1.6},
        "specialEffects": [{"type":"damageReduction","value":18},{"type":"damage_reflect","value":12},{"type":"hp","value":160}],
        "setId": null,
        "description": "暗影霸主的鎧甲，散發著邪惡氣息。",
        "dropFrom": ["shadow_overlord"],
        "maxDurability": 60,
        "durability": 60
    },

    "demon_blade": {
        "id": "demon_blade",
        "name": "黑焰戰刃",
        "icon": "😈",
        "type": "weapon",
        "weaponForm": "sword",
        "rarity": "epic",
        "level": 68,
        "stats": {"attack":60,"defense":5,"critChance":0.2,"critDamage":2.3,"weaponSpeed":1,"attackSpeed":1.2},
        "specialEffects": [{"type":"fire","value":25},{"type":"lifesteal","value":15},{"type":"execute","value":25}],
        "setId": "demon_lord",
        "description": "魔族士兵的戰刃，燃燒著地獄之火。",
        "dropFrom": ["demon_soldier"],
        "maxDurability": 49,
        "durability": 49
    },

    "demon_general_armor": {
        "id": "demon_general_armor",
        "name": "黑焰將甲",
        "icon": "👿",
        "type": "equipment",
        "rarity": "epic",
        "level": 70,
        "stats": {"attack":16,"defense":45,"critChance":0.13,"critDamage":1.7},
        "specialEffects": [{"type":"fire","value":15},{"type":"damageReduction","value":18},{"type":"hp","value":40}],
        "setId": "demon_lord",
        "description": "魔族將軍的鎧甲。",
        "dropFrom": ["demon_general"],
        "maxDurability": 52,
        "durability": 52
    },

    "demon_lord_sword": {
        "id": "demon_lord_sword",
        "name": "末焰刃",
        "icon": "👑",
        "type": "weapon",
        "weaponForm": "sword",
        "rarity": "legendary",
        "level": 70,
        "stats": {"attack":90,"defense":14,"critChance":0.22,"critDamage":3.3,"weaponSpeed":0.85,"attackSpeed":1},
        "specialEffects": [{"type":"fire","value":40},{"type":"lifesteal","value":20},{"type":"armorPenetration","value":30},{"type":"execute","value":50}],
        "setId": "demon_lord",
        "description": "魔王阿薩謝爾的佩劍，蘊含毀滅世界的力量。",
        "dropFrom": ["demon_lord_asariel"],
        "rewardRole": "boss_signature",
        "sourceChapter": 7,
        "maxDurability": 60,
        "durability": 60
    },

    "demon_lord_crown": {
        "id": "demon_lord_crown",
        "name": "末焰心核",
        "icon": "👑",
        "type": "accessory",
        "rarity": "legendary",
        "level": 70,
        "stats": {"attack":23,"defense":36,"critChance":0.18,"critDamage":2.3},
        "specialEffects": [{"type":"critDamage","value":50},{"type":"damageReduction","value":20},{"type":"revive","value":50}],
        "setId": "demon_lord",
        "description": "魔王的王冠，擁有復活的力量。",
        "dropFrom": [],
        "maxDurability": 60,
        "durability": 60
    },

    "tower_void_blade": {
        "id": "tower_void_blade",
        "name": "幽光裂刃",
        "icon": "🌑",
        "type": "weapon",
        "weaponForm": "sword",
        "rarity": "legendary",
        "level": 70,
        "stats": {"attack":72,"defense":9,"critChance":0.22,"critDamage":2.7,"weaponSpeed":1.2,"attackSpeed":1.3},
        "specialEffects": [{"type":"armorPenetration","value":30},{"type":"double_strike","value":20},{"type":"lifesteal","value":15}],
        "setId": "void_king",
        "description": "虛空之王的武器，能撕裂現實。",
        "dropFrom": ["tower_void_king"],
        "maxDurability": 58,
        "durability": 58
    },

    "tower_void_crown": {
        "id": "tower_void_crown",
        "name": "無光冠",
        "icon": "👑",
        "type": "equipment",
        "rarity": "legendary",
        "level": 70,
        "stats": {"attack":18,"defense":31,"critChance":0.16,"critDamage":2},
        "specialEffects": [{"type":"damageReduction","value":15},{"type":"revive","value":30}],
        "setId": "void_king",
        "description": "虛空之王的王冠。",
        "dropFrom": ["tower_void_king"],
        "maxDurability": 60,
        "durability": 60
    },

    "tower_abyss_armor": {
        "id": "tower_abyss_armor",
        "name": "沉淵甲",
        "icon": "🖤",
        "type": "equipment",
        "rarity": "epic",
        "level": 45,
        "stats": {"attack":12,"defense":40,"critChance":0.12,"critDamage":1.7},
        "specialEffects": [{"type":"damageReduction","value":12},{"type":"hpRegen","value":6}],
        "setId": null,
        "description": "深淵魔將的鎧甲。",
        "dropFrom": ["tower_abyss_general"],
        "maxDurability": 45,
        "durability": 45
    },

    "tower_hell_knight_lance": {
        "id": "tower_hell_knight_lance",
        "name": "獄火長槍",
        "icon": "🔥",
        "type": "weapon",
        "weaponForm": "lance",
        "rarity": "epic",
        "level": 33,
        "stats": {"attack":35,"defense":5,"critChance":0.15,"critDamage":2,"weaponSpeed":1,"attackSpeed":1.2},
        "specialEffects": [{"type":"fire","value":25},{"type":"armorPenetration","value":15}],
        "setId": null,
        "description": "地獄騎士的長槍，燃燒著地獄之火。",
        "dropFrom": ["tower_hell_knight"],
        "maxDurability": 41,
        "durability": 41
    },

    "tower_guardian_staff": {
        "id": "tower_guardian_staff",
        "name": "守衛短杖",
        "icon": "🪄",
        "type": "weapon",
        "weaponForm": "focus",
        "rarity": "uncommon",
        "stats": {"attack":12,"defense":5,"critChance":0.08,"critDamage":1.6,"weaponSpeed":0.9,"attackSpeed":0.9,"hp":30},
        "price": 250,
        "description": "森林守護者留下的法杖，充滿自然之力。",
        "setId": null,
        "canEnhance": true,
        "level": 8,
        "dropSource": "forest_guardian",
        "dropFrom": ["tower_forest_guardian"],
        "maxDurability": 18,
        "durability": 18
    },

    "shadow_commander_sword": {
        "id": "shadow_commander_sword",
        "name": "影令劍",
        "icon": "⚔️",
        "type": "weapon",
        "weaponForm": "sword",
        "rarity": "rare",
        "stats": {"attack":28,"defense":5,"critChance":0.14,"critDamage":1.9,"weaponSpeed":1.1,"attackSpeed":1.15},
        "price": 900,
        "description": "暗影指揮官的配劍，鋒利無比。",
        "setId": null,
        "canEnhance": true,
        "level": 25,
        "dropSource": "shadow_commander",
        "dropFrom": [],
        "maxDurability": 30,
        "durability": 30
    },

    "titan_gauntlet": {
        "id": "titan_gauntlet",
        "name": "巨神護手",
        "icon": "🧤",
        "type": "accessory",
        "rarity": "epic",
        "stats": {"attack":18,"defense":22,"critChance":0.08,"critDamage":1.6,"hp":80},
        "price": 1200,
        "description": "遠古泰坦的護手，蘊含遠古之力。",
        "setId": "titan",
        "canEnhance": true,
        "level": 35,
        "dropSource": "ancient_titan",
        "dropFrom": [],
        "maxDurability": 39,
        "durability": 39
    },

    "elemental_orb": {
        "id": "elemental_orb",
        "name": "四象珠",
        "icon": "🔮",
        "type": "accessory",
        "rarity": "legendary",
        "stats": {"attack":15,"defense":15,"critChance":0.1,"critDamage":1.7,"hp":80},
        "price": 1800,
        "description": "融合四大元素之力的神秘寶珠。",
        "setId": null,
        "canEnhance": true,
        "level": 45,
        "specialEffects": [{"type":"fire","value":8},{"type":"ice","value":8},{"type":"thunder","value":8}],
        "dropSource": "elemental_lord",
        "rewardRole": "boss_signature",
        "sourceChapter": 5,
        "dropFrom": ["elemental_lord"],
        "maxDurability": 52,
        "durability": 52
    },

    "elder_dragon_fang": {
        "id": "elder_dragon_fang",
        "name": "古龍牙刃",
        "icon": "🐲",
        "type": "weapon",
        "weaponForm": "sword",
        "rarity": "legendary",
        "stats": {"attack":56,"defense":0,"critChance":0.2,"critDamage":2.3,"weaponSpeed":1,"attackSpeed":1.1},
        "price": 2500,
        "description": "由古龍牙齒鍛造的神劍，燃燒著龍焰。",
        "setId": null,
        "canEnhance": true,
        "level": 55,
        "specialEffects": [{"type":"fire","value":22}],
        "dropSource": "elder_dragon",
        "rewardRole": "boss_signature",
        "sourceChapter": 6,
        "dropFrom": ["elder_dragon"],
        "maxDurability": 53,
        "durability": 53
    },

    "overlord_armor": {
        "id": "overlord_armor",
        "name": "黑影重甲",
        "icon": "🛡️",
        "type": "armor",
        "rarity": "epic",
        "stats": {"attack":12,"defense":60,"critChance":0.08,"critDamage":1.5,"hp":160},
        "price": 3000,
        "description": "暗影霸主的戰甲，堅不可摧。",
        "setId": null,
        "canEnhance": true,
        "level": 60,
        "specialEffects": [{"type":"damageReduction","value":10}],
        "dropSource": "shadow_overlord",
        "maxDurability": 49,
        "durability": 49
    },

    "demon_lord_armor": {
        "id": "demon_lord_armor",
        "name": "末焰甲",
        "icon": "😈",
        "type": "armor",
        "rarity": "legendary",
        "stats": {"attack":16,"defense":72,"critChance":0.09,"critDamage":1.5,"hp":240},
        "specialEffects": [{"type":"damageReduction","value":16}],
        "darkResist": 0.25,
        "price": 8000,
        "description": "魔王阿薩謝爾的戰甲，散發著邪惡的氣息。",
        "setId": null,
        "canEnhance": true,
        "level": 65,
        "dropSource": "demon_lord_asariel",
        "dropFrom": [],
        "maxDurability": 59,
        "durability": 59
    },

    "miners_pickhammer": {
        "id": "miners_pickhammer",
        "name": "礦脈破槌",
        "icon": "⛏️",
        "type": "weapon",
        "weaponForm": "heavy",
        "rarity": "uncommon",
        "level": 8,
        "stats": {"attack":17,"defense":3,"critChance":0.05,"critDamage":1.55,"weaponSpeed":0.78,"attackSpeed":0.78},
        "specialEffects": [{"type":"armorPenetration","value":6}],
        "setId": "cave_miner",
        "description": "洞窟礦工用來敲開礦脈與石殼的重槌，是早期副本第一批值得刷的武器。",
        "dropFrom": [],
        "maxDurability": 21,
        "durability": 21
    },

    "cave_ward_shield": {
        "id": "cave_ward_shield",
        "name": "洞燈護盾",
        "icon": "🛡️",
        "type": "equipment",
        "rarity": "uncommon",
        "level": 10,
        "stats": {"attack":4,"defense":20,"critChance":0.02,"critDamage":1.2},
        "specialEffects": [{"type":"damageReduction","value":5}],
        "setId": "cave_miner",
        "description": "盾面掛著礦燈，讓玩家能用更穩的節奏推進洞窟。",
        "dropFrom": ["cave:shadow_lurker","cave:rock_golem"],
        "maxDurability": 20,
        "durability": 20
    },

    "glimmer_lampstaff": {
        "id": "glimmer_lampstaff",
        "name": "微光燈杖",
        "icon": "🪄",
        "type": "weapon",
        "weaponForm": "focus",
        "rarity": "rare",
        "level": 18,
        "stats": {"attack":26,"defense":4,"critChance":0.11,"critDamage":1.65,"weaponSpeed":1.08,"attackSpeed":1.08},
        "specialEffects": [{"type":"attackSpeed","value":5}],
        "setId": "glimmer_initiate",
        "description": "用微光碎片穩住節奏的法杖，只是光明的前置影子，不提供正式光明壓制。",
        "dropFrom": [],
        "maxDurability": 28,
        "durability": 28
    },

    "rune_scriber_focus": {
        "id": "rune_scriber_focus",
        "name": "刻符焦鏡",
        "icon": "🔮",
        "type": "weapon",
        "weaponForm": "focus",
        "rarity": "rare",
        "level": 20,
        "stats": {"attack":44,"defense":14,"critChance":0.13,"critDamage":1.75,"weaponSpeed":1.15,"attackSpeed":1.15},
        "specialEffects": [{"type":"critChance","value":5}],
        "setId": "glimmer_initiate",
        "description": "符文微靈留下的聚焦器，讓玩家提前理解光明線的命中與節奏修正。",
        "dropFrom": ["rune_wisp"],
        "maxDurability": 29,
        "durability": 29
    },

    "frostbite_dueling_blade": {
        "id": "frostbite_dueling_blade",
        "name": "霜吻決鬥刃",
        "icon": "❄️",
        "type": "weapon",
        "weaponForm": "sword",
        "rarity": "rare",
        "level": 20,
        "stats": {"attack":29,"defense":3,"critChance":0.13,"critDamage":1.75,"weaponSpeed":1.05,"attackSpeed":1.05},
        "specialEffects": [{"type":"ice","value":10},{"type":"slowChance","value":6}],
        "setId": "early_frost",
        "description": "雪原副本的決鬥型武器，提供抗寒段落需要的控速能力。",
        "dropFrom": ["snow:frost_giant","snow:ice_dragon"],
        "maxDurability": 30,
        "durability": 30
    },

    "frostbound_scepter_drop": {
        "id": "frostbound_scepter_drop",
        "name": "縛霜權杖",
        "icon": "🧊",
        "type": "weapon",
        "weaponForm": "focus",
        "rarity": "rare",
        "level": 20,
        "stats": {"attack":27,"defense":7,"critChance":0.1,"critDamage":1.6,"weaponSpeed":0.92,"attackSpeed":0.92},
        "specialEffects": [{"type":"ice","value":12},{"type":"damageReduction","value":4}],
        "setId": "early_frost",
        "description": "雪原巫術凝成的權杖，讓法杖型玩家也能從副本直接取得追求目標。",
        "dropFrom": ["snow:ice_elemental","snow:frost_giant","snow:ice_dragon"],
        "maxDurability": 27,
        "durability": 27
    },

    "shadowneedle_dagger": {
        "id": "shadowneedle_dagger",
        "name": "影針匕首",
        "icon": "🗡️",
        "type": "weapon",
        "weaponForm": "dagger",
        "rarity": "rare",
        "level": 25,
        "stats": {"attack":36,"defense":0,"critChance":0.2,"critDamage":1.95,"weaponSpeed":1.35,"attackSpeed":1.35},
        "specialEffects": [{"type":"armorPenetration","value":8}],
        "setId": "shadow_legion",
        "description": "暗影弓手與法師攜帶的短刃，表現弱化虛空的削防輪廓。",
        "dropFrom": ["shadow_archer"],
        "maxDurability": 30,
        "durability": 30
    },

    "umbral_pike": {
        "id": "umbral_pike",
        "name": "暗幕長槍",
        "icon": "🔱",
        "type": "weapon",
        "weaponForm": "lance",
        "rarity": "epic",
        "level": 30,
        "stats": {"attack":43,"defense":6,"critChance":0.12,"critDamage":1.9,"weaponSpeed":0.95,"attackSpeed":0.95},
        "specialEffects": [{"type":"armorPenetration","value":12},{"type":"lifesteal","value":3}],
        "setId": "shadow_legion",
        "description": "暗影指揮官麾下的長槍型裝備，補上暗影套裝過去過度偏劍的問題。",
        "dropFrom": [],
        "maxDurability": 39,
        "durability": 39
    },

    "shade_focus": {
        "id": "shade_focus",
        "name": "幽影焦核",
        "icon": "🌑",
        "type": "weapon",
        "weaponForm": "focus",
        "rarity": "rare",
        "level": 28,
        "stats": {"attack":33,"defense":10,"critChance":0.1,"critDamage":1.7,"weaponSpeed":1.05,"attackSpeed":1.05},
        "specialEffects": [{"type":"damageReduction","value":7}],
        "setId": "shadow_legion",
        "description": "暗影法師使用的焦核，將暗影定位成虛空前置的防禦與壓制線。",
        "dropFrom": ["shadow_mage"],
        "maxDurability": 33,
        "durability": 33
    },

    "thornhook_claws": {
        "id": "thornhook_claws",
        "name": "棘鉤爪",
        "icon": "🪝",
        "type": "weapon",
        "weaponForm": "dagger",
        "rarity": "rare",
        "level": 50,
        "stats": {"attack":105,"defense":8,"critChance":0.19,"critDamage":2.05,"weaponSpeed":1.32,"attackSpeed":1.32},
        "specialEffects": [{"type":"poison","value":12},{"type":"lifesteal","value":4}],
        "setId": "jungle_life",
        "description": "叢林群落的爪型特殊武器，把毒與續戰綁在一起。",
        "dropFrom": [],
        "maxDurability": 37,
        "durability": 37
    },

    "hydra_spine_spear": {
        "id": "hydra_spine_spear",
        "name": "九頭脊槍",
        "icon": "🐍",
        "type": "weapon",
        "weaponForm": "lance",
        "rarity": "epic",
        "level": 53,
        "stats": {"attack":128,"defense":12,"critChance":0.14,"critDamage":2.15,"weaponSpeed":0.96,"attackSpeed":0.96},
        "specialEffects": [{"type":"poison","value":18},{"type":"bossBonus","value":8}],
        "setId": "jungle_life",
        "description": "由九頭蛇脊骨製成的長槍，是叢林副本的高追求掉落。",
        "dropFrom": ["jungle:jungle_hydra"],
        "maxDurability": 45,
        "durability": 45
    },

    "abyssal_needle": {
        "id": "abyssal_needle",
        "name": "深淵針刃",
        "icon": "🖤",
        "type": "weapon",
        "weaponForm": "dagger",
        "rarity": "epic",
        "level": 65,
        "stats": {"attack":206,"defense":6,"critChance":0.22,"critDamage":2.45,"weaponSpeed":1.28,"attackSpeed":1.28},
        "specialEffects": [{"type":"void","value":6},{"type":"armorPenetration","value":10}],
        "setId": "abyss_precursor",
        "description": "深淵前兆的匕首，只提供受控的低量虛空效果，完整虛空仍留給塔。",
        "dropFrom": ["void_walker"],
        "maxDurability": 50,
        "durability": 50
    },

    "seraph_void_focus": {
        "id": "seraph_void_focus",
        "name": "偽翼虛核",
        "icon": "🌀",
        "type": "weapon",
        "weaponForm": "focus",
        "rarity": "epic",
        "level": 68,
        "stats": {"attack":198,"defense":24,"critChance":0.16,"critDamage":2.2,"weaponSpeed":1.02,"attackSpeed":1.02},
        "specialEffects": [{"type":"void","value":8},{"type":"damageReduction","value":8}],
        "setId": "abyss_precursor",
        "description": "深淵偽翼凝出的焦點武器，作為進塔前理解虛空壓力的高階掉落。",
        "dropFrom": ["abyssal_seraph"],
        "maxDurability": 52,
        "durability": 52
    },

    "dawnbrand_sword": {
        "id": "dawnbrand_sword",
        "name": "黎印長劍",
        "icon": "☀️",
        "type": "weapon",
        "weaponForm": "sword",
        "rarity": "legendary",
        "level": 70,
        "stats": {"attack":250,"defense":18,"critChance":0.2,"critDamage":2.35,"weaponSpeed":1.12,"attackSpeed":1.12},
        "specialEffects": [{"type":"light","value":12},{"type":"attackSpeed","value":8}],
        "setId": "radiant_vow",
        "description": "黎明迴廊正式光明武器，提供抗衡無盡塔虛空壓力的高速節奏。",
        "dropFrom": ["dawn_sentinel","radiant_keeper","aurora_archon"],
        "maxDurability": 58,
        "durability": 58
    },

    "prism_focus": {
        "id": "prism_focus",
        "name": "棱光焦儀",
        "icon": "💠",
        "type": "weapon",
        "weaponForm": "focus",
        "rarity": "epic",
        "level": 70,
        "stats": {"attack":208,"defense":22,"critChance":0.18,"critDamage":2.15,"weaponSpeed":1.28,"attackSpeed":1.28},
        "specialEffects": [{"type":"light","value":10},{"type":"critChance","value":6}],
        "setId": "radiant_vow",
        "description": "鏡翼熾使掉落的焦點武器，讓光明線不只是一把劍。",
        "dropFrom": ["radiant_corridor:prism_wisp","radiant_corridor:mirror_seraph","radiant_corridor:aurora_archon"],
        "maxDurability": 51,
        "durability": 51
    },

    "aurora_ward_plate": {
        "id": "aurora_ward_plate",
        "name": "極光誓甲",
        "icon": "🌅",
        "type": "equipment",
        "rarity": "legendary",
        "level": 70,
        "stats": {"attack":44,"defense":250,"critChance":0.08,"critDamage":1.65,"hp":520},
        "specialEffects": [{"type":"light","value":8},{"type":"damageReduction","value":12}],
        "setId": "radiant_vow",
        "description": "極光執政官的防具掉落，作為塔 DLC 前的正式光明防線。",
        "dropFrom": ["radiant_keeper","aurora_archon"],
        "maxDurability": 61,
        "durability": 61
    },

    "dragonseal_forkstaff": {
        "id": "dragonseal_forkstaff",
        "name": "龍封叉杖",
        "icon": "⚔️",
        "type": "weapon",
        "weaponForm": "focus",
        "rarity": "epic",
        "level": 58,
        "stats": {"attack":66,"defense":18,"critChance":0.12,"critDamage":1.9,"weaponSpeed":1.02,"attackSpeed":1.02},
        "specialEffects": [{"type":"damageReduction","value":6}],
        "setId": null,
        "description": "龍封叉杖",
        "dropFrom": ["dragon_seal_adept"],
        "sourceChapter": 6,
        "balanceStatus": "source_locked_stats_provisional",
        "maxDurability": 49,
        "durability": 49
    },

    "frostwolf_mantle": {
        "id": "frostwolf_mantle",
        "name": "霜狼披肩",
        "icon": "◆",
        "type": "equipment",
        "rarity": "rare",
        "level": 44,
        "stats": {"attack":4,"defense":48,"hp":90,"critChance":0.04,"critDamage":1.4},
        "specialEffects": [{"type":"ice","value":8}],
        "setId": null,
        "description": "霜狼披肩",
        "dropFrom": ["frost_wolf"],
        "sourceChapter": 5,
        "balanceStatus": "source_locked_stats_provisional",
        "maxDurability": 36,
        "durability": 36
    },

    "stormfeather_talisman": {
        "id": "stormfeather_talisman",
        "name": "風暴羽符",
        "icon": "◉",
        "type": "accessory",
        "rarity": "rare",
        "level": 46,
        "stats": {"attack":18,"defense":18,"hp":55,"critChance":0.07,"critDamage":1.55},
        "specialEffects": [{"type":"thunder","value":8}],
        "setId": null,
        "description": "風暴羽符",
        "dropFrom": ["storm_raptor"],
        "sourceChapter": 5,
        "balanceStatus": "source_locked_stats_provisional",
        "maxDurability": 36,
        "durability": 36
    },

    "dragonseal_patrol_plate": {
        "id": "dragonseal_patrol_plate",
        "name": "龍封巡甲",
        "icon": "◆",
        "type": "equipment",
        "rarity": "epic",
        "level": 56,
        "stats": {"attack":9,"defense":72,"hp":125,"critChance":0.04,"critDamage":1.45},
        "specialEffects": [{"type":"damageReduction","value":7}],
        "setId": null,
        "description": "龍封巡甲",
        "dropFrom": ["dragon_seal_sentinel"],
        "sourceChapter": 6,
        "balanceStatus": "source_locked_stats_provisional",
        "maxDurability": 48,
        "durability": 48
    },

    "miasma_needle_focus": {
        "id": "miasma_needle_focus",
        "name": "瘴液針杖",
        "icon": "⚔️",
        "type": "weapon",
        "weaponForm": "focus",
        "rarity": "rare",
        "level": 47,
        "stats": {"attack":45,"defense":13,"critChance":0.11,"critDamage":1.75,"weaponSpeed":1.06,"attackSpeed":1.06},
        "specialEffects": [{"type":"poison","value":10}],
        "setId": null,
        "description": "瘴液針杖",
        "dropFrom": ["poison_frog"],
        "sourceChapter": 5,
        "balanceStatus": "source_locked_stats_provisional",
        "maxDurability": 39,
        "durability": 39
    }
};

export const SetDatabase = {
    "wolf_hunter": {
        "id": "wolf_hunter",
        "name": "狼獵套裝",
        "icon": "🐺",
        "pieces": ["wolf_fang_blade","wolf_pelt_armor"],
        "bonuses": [{"required":2,"name":"狼之本能","description":"攻擊速度 +10%，暴擊率 +5%","effects":{"attackSpeedBonus":10,"critChanceBonus":0.05}}]
    },

    "forest_guardian": {
        "id": "forest_guardian",
        "name": "森林守護者套裝",
        "icon": "🌲",
        "pieces": ["forest_guardian_staff","forest_guardian_crown"],
        "bonuses": [{"required":2,"name":"自然之力","description":"生命每 3 秒回復 +10，受到的傷害 -10%","effects":{"hpRegenBonus":10,"damageReduceBonus":10}}]
    },

    "undead_slayer": {
        "id": "undead_slayer",
        "name": "亡靈獵人套裝",
        "icon": "💀",
        "pieces": ["undead_dagger","ghost_cloak"],
        "bonuses": [{"required":2,"name":"亡靈剋星","description":"對亡靈類敵人傷害 +30%","effects":{"undeadDamageBonus":30}}]
    },

    "shadow_legion": {
        "id": "shadow_legion",
        "name": "暗影軍團套裝",
        "icon": "⚫",
        "pieces": ["shadow_blade_drop","shadow_armor_drop","shadow_badge","shadow_commander_blade","shadowneedle_dagger","umbral_pike","shade_focus"],
        "bonuses": [{"required":2,"name":"暗影之力","description":"暗影傷害 +15","effects":{"shadowDamageBonus":15}},{"required":3,"name":"暗影護體","description":"受到的傷害 -12%","effects":{"damageReduceBonus":12}}]
    },

    "cave_miner": {
        "id": "cave_miner",
        "name": "洞窟礦工套裝",
        "icon": "⛏️",
        "pieces": ["miners_pickhammer","cave_ward_shield"],
        "bonuses": [{"required":2,"name":"礦燈步伐","description":"防禦 +8%，破甲 +5%","effects":{"defenseBonus":8,"armorPierceBonus":5}}]
    },

    "early_frost": {
        "id": "early_frost",
        "name": "雪原抗寒套裝",
        "icon": "❄️",
        "pieces": ["frostbite_dueling_blade","frostbound_scepter_drop"],
        "bonuses": [{"required":2,"name":"霜線節奏","description":"冰屬性傷害 +12%，受到的傷害 -6%","effects":{"iceDamageBonus":12,"damageReduceBonus":6}}]
    },

    "glimmer_initiate": {
        "id": "glimmer_initiate",
        "name": "微光啟蒙套裝",
        "icon": "✦",
        "pieces": ["glimmer_lampstaff","rune_scriber_focus"],
        "bonuses": [{"required":2,"name":"短暫專注","description":"攻擊速度 +8%，暴擊率 +4%","effects":{"attackSpeedBonus":8,"critChanceBonus":0.04}}]
    },

    "ancient_relic": {
        "id": "ancient_relic",
        "name": "遠古遺物套裝",
        "icon": "🏛️",
        "pieces": ["ancient_sword","crystal_shield","rune_badge"],
        "bonuses": [{"required":2,"name":"遠古智慧","description":"經驗獲取 +20%","effects":{"expBonus":20}},{"required":3,"name":"遠古力量","description":"全屬性 +10%","effects":{"allStatsBonus":10}}]
    },

    "titan": {
        "id": "titan",
        "name": "泰坦套裝",
        "icon": "🗽",
        "pieces": ["titan_hammer","titan_gauntlet"],
        "bonuses": [{"required":2,"name":"泰坦之力","description":"攻擊力 +20%，但攻擊速度 -10%","effects":{"attackBonus":20,"attackSpeedPenalty":10}}]
    },

    "elemental_master": {
        "id": "elemental_master",
        "name": "元素套裝",
        "icon": "🌈",
        "pieces": ["flame_sword","frost_blade","thunder_axe","elemental_badge","elemental_crown"],
        "bonuses": [{"required":2,"name":"元素共鳴","description":"元素傷害 +15%","effects":{"elementalDamageBonus":15}},{"required":3,"name":"元素掌握","description":"元素傷害 +25%，元素抗性 +15%","effects":{"elementalDamageBonus":25,"elementalResistBonus":15}}]
    },

    "dragon_slayer": {
        "id": "dragon_slayer",
        "name": "屠龍者套裝",
        "icon": "🐲",
        "pieces": ["wyvern_lance","dragon_knight_helm","elder_dragon_fang_badge"],
        "bonuses": [{"required":2,"name":"龍之獵人","description":"對龍類敵人傷害 +25%","effects":{"dragonDamageBonus":25}},{"required":3,"name":"屠龍傳說","description":"對龍類敵人傷害 +50%，獲得龍之力量","effects":{"dragonDamageBonus":50,"dragonPower":true}}]
    },

    "jungle_life": {
        "id": "jungle_life",
        "name": "叢林獵命套裝",
        "icon": "🌿",
        "pieces": ["thornhook_claws","hydra_spine_spear"],
        "bonuses": [{"required":2,"name":"毒脈續戰","description":"毒屬性傷害 +15%，生命偷取 +4%","effects":{"poisonDamageBonus":15,"lifeStealBonus":4}}]
    },

    "abyss_precursor": {
        "id": "abyss_precursor",
        "name": "深淵前兆套裝",
        "icon": "🌀",
        "pieces": ["abyssal_needle","seraph_void_focus"],
        "bonuses": [{"required":2,"name":"裂隙預感","description":"破甲 +12%，受到的傷害 -8%","effects":{"armorPierceBonus":12,"damageReduceBonus":8}}]
    },

    "radiant_vow": {
        "id": "radiant_vow",
        "name": "光明誓約套裝",
        "icon": "☀️",
        "pieces": ["dawnbrand_sword","prism_focus","aurora_ward_plate"],
        "bonuses": [{"required":2,"name":"黎明節奏","description":"攻擊速度 +12%，光明傷害 +10%","effects":{"attackSpeedBonus":12,"lightDamageBonus":10}},{"required":3,"name":"抗塔誓約","description":"受到的傷害 -15%，破甲 +10%","effects":{"damageReduceBonus":15,"armorPierceBonus":10}}]
    },

    "demon_lord": {
        "id": "demon_lord",
        "name": "魔王套裝",
        "icon": "👑",
        "pieces": ["demon_blade","demon_general_armor","demon_lord_sword","demon_lord_crown"],
        "bonuses": [{"required":2,"name":"魔族之力","description":"攻擊力 +15%，生命偷取 +5%","effects":{"attackBonus":15,"lifeStealBonus":5}},{"required":3,"name":"魔王降臨","description":"攻擊力 +25%，暴擊傷害 +30%, 全屬性 +30%，死亡時有機率復活","effects":{"attackBonus":25,"critDamageBonus":30,"allStatsBonus":30,"guaranteedRevive":true}}]
    },

    "void_king": {
        "id": "void_king",
        "name": "虛空之王套裝",
        "icon": "🌑",
        "pieces": ["tower_void_blade","tower_void_crown"],
        "bonuses": [{"required":2,"name":"虛空支配","description":"暗影傷害 +50%，無視 20% 敵人防禦，15% 機率使敵人陷入虛空","effects":{"shadowDamageBonus":50,"armorPierceBonus":20,"voidChance":15}}]
    }
};
