/**
 * Canonical non-series forge recipes.
 *
 * Baseline five-form recipes remain defined once in RecipeSeries.js. This
 * catalog owns every other recipe without post-load additions or removals.
 */

export const StandaloneRecipeDatabase = {
    "poison_dagger": {
        "id": "poison_dagger",
        "name": "毒牙匕首",
        "icon": "🗡️",
        "type": "weapon",
        "weaponForm": "dagger",
        "rarity": "uncommon",
        "materials": [{"id":"poison_gland","quantity":3},{"id":"wolf_fang","quantity":1},{"id":"iron_ore","quantity":2}],
        "cost": 120,
        "successRate": 90,
        "result": {"id":"crafted_poison_dagger","name":"毒牙匕首","icon":"🗡️","type":"weapon","weaponForm":"dagger","rarity":"uncommon","stats":{"attack":10,"defense":0,"critChance":0.18,"critDamage":1.8,"weaponSpeed":1.2,"attackSpeed":1.2},"specialEffects":[{"type":"poison","value":5}],"desc":"塗有蜘蛛毒液的匕首。","level":8,"requiredLevel":8},
        "level": 8
    },

    "leather_armor": {
        "id": "leather_armor",
        "name": "皮甲",
        "icon": "🥋",
        "type": "equipment",
        "rarity": "common",
        "materials": [{"id":"beast_hide","quantity":2},{"id":"iron_ore","quantity":2}],
        "cost": 25,
        "successRate": 100,
        "result": {"id":"crafted_leather_armor","name":"皮甲","icon":"🥋","type":"equipment","rarity":"common","stats":{"attack":0,"defense":8,"critChance":0,"critDamage":0},"specialEffects":[],"desc":"由獸皮製成的輕便護甲。","level":1,"requiredLevel":1},
        "level": 1
    },

    "wolf_pelt_armor": {
        "id": "wolf_pelt_armor",
        "name": "狼皮護甲",
        "icon": "🛡️",
        "type": "equipment",
        "rarity": "uncommon",
        "materials": [{"id":"wolf_pelt","quantity":2},{"id":"iron_ore","quantity":1}],
        "cost": 70,
        "successRate": 100,
        "acquisitionRole": "basic_monster_craft",
        "canonicalResult": true,
        "result": {"id":"wolf_pelt_armor","name":"狼皮護甲","icon":"🛡️","type":"equipment","rarity":"uncommon","level":5,"stats":{"attack":2,"defense":12,"critChance":0.03,"critDamage":1.2},"specialEffects":[],"setId":"wolf_hunter","description":"由狼皮製成的護甲，輕便保暖。","maxDurability":21,"durability":21},
        "level": 5
    },

    "shadow_armor": {
        "id": "shadow_armor",
        "name": "影縫甲",
        "icon": "⚫",
        "type": "equipment",
        "rarity": "rare",
        "materials": [{"id":"dark_steel","quantity":5},{"id":"shadow_essence","quantity":3},{"id":"shadow_cloak_fragment","quantity":2}],
        "cost": 500,
        "successRate": 65,
        "result": {"id":"crafted_shadow_armor","name":"影縫甲","icon":"⚫","type":"equipment","rarity":"rare","stats":{"attack":3,"defense":13,"critChance":0,"critDamage":0},"specialEffects":[{"type":"dodgeChance","value":5}],"desc":"被暗影籠罩的神秘鎧甲。","level":28,"requiredLevel":28},
        "level": 28
    },

    "wolf_fang_necklace": {
        "id": "wolf_fang_necklace",
        "name": "狼牙項鍊",
        "icon": "🦷",
        "type": "accessory",
        "rarity": "uncommon",
        "materials": [{"id":"wolf_fang","quantity":3},{"id":"spider_silk","quantity":2}],
        "cost": 80,
        "successRate": 95,
        "result": {"id":"crafted_wolf_fang_necklace","name":"狼牙項鍊","icon":"🦷","type":"accessory","rarity":"uncommon","stats":{"attack":1,"defense":1,"critChance":0,"critDamage":0},"specialEffects":[],"desc":"由狼牙串成的項鍊。","level":5,"requiredLevel":5},
        "level": 5
    },

    "silver_thread_hook": {
        "id": "silver_thread_hook",
        "name": "銀絲伏獵鉤",
        "icon": "🪝",
        "type": "accessory",
        "rarity": "uncommon",
        "materials": [{"id":"spider_silk","quantity":3},{"id":"poison_gland","quantity":1},{"id":"iron_ore","quantity":2}],
        "cost": 160,
        "successRate": 88,
        "result": {"id":"crafted_silver_thread_hook","name":"銀絲伏獵鉤","icon":"🪝","type":"accessory","rarity":"uncommon","stats":{"attack":2,"defense":1,"critChance":0.06,"critDamage":0},"specialEffects":[{"type":"dodgeChance","value":5}],"desc":"把銀絲反扣成鉤。它不保證你比較勇敢，只保證你逃跑時比較不會被自己絆倒。","level":8,"requiredLevel":8},
        "level": 8
    },

    "blood_moon_pendant": {
        "id": "blood_moon_pendant",
        "name": "血月角墜",
        "icon": "🦌",
        "type": "accessory",
        "rarity": "rare",
        "materials": [{"id":"life_seed","quantity":1},{"id":"forest_essence","quantity":2},{"id":"rare_metal","quantity":1}],
        "cost": 360,
        "successRate": 72,
        "result": {"id":"crafted_blood_moon_pendant","name":"血月角墜","icon":"🦌","type":"accessory","rarity":"rare","stats":{"attack":4,"defense":2,"critChance":0.1,"critDamage":0},"specialEffects":[{"type":"critDamage","value":15}],"desc":"由折斷鹿角磨成的吊墜。靠近耳邊時會聽見很小聲、很憤怒的撞牆聲。","level":15,"requiredLevel":15},
        "level": 15
    },

    "health_potion_basic": {
        "id": "health_potion_basic",
        "name": "基礎生命藥水",
        "icon": "🧪",
        "type": "potion",
        "rarity": "common",
        "materials": [{"id":"slime_jelly","quantity":3}],
        "cost": 15,
        "successRate": 100,
        "result": {"id":"crafted_health_potion","name":"生命藥水","icon":"🧪","type":"potion","rarity":"common","hp":50,"desc":"恢復 50 點生命值。","level":1,"requiredLevel":1},
        "level": 1
    },

    "greater_health_potion": {
        "id": "greater_health_potion",
        "name": "高級生命藥水",
        "icon": "❤️",
        "type": "potion",
        "rarity": "uncommon",
        "materials": [{"id":"life_seed","quantity":1},{"id":"slime_jelly","quantity":5},{"id":"forest_essence","quantity":1}],
        "cost": 80,
        "successRate": 85,
        "result": {"id":"crafted_greater_health_potion","name":"高級生命藥水","icon":"❤️","type":"potion","rarity":"uncommon","hp":120,"desc":"恢復 120 點生命值。","level":5,"requiredLevel":5},
        "level": 5
    },

    "glimmer_focus": {
        "id": "glimmer_focus",
        "name": "微光調律符",
        "icon": "✨",
        "type": "accessory",
        "rarity": "rare",
        "materials": [{"id":"glimmer_shard","quantity":3},{"id":"rune_stone","quantity":2},{"id":"crystal_shard","quantity":2},{"id":"magic_crystal","quantity":1}],
        "cost": 1200,
        "successRate": 68,
        "result": {"id":"crafted_glimmer_focus","name":"微光調律符","icon":"✨","type":"accessory","rarity":"rare","stats":{"attack":8,"defense":6,"critChance":0.08,"critDamage":1.55},"specialEffects":[{"type":"attackSpeed","value":8},{"type":"critChance","value":3}],"desc":"用微光與符文校準出手節奏的護符，只提供光明系的弱化前兆。","level":20,"requiredLevel":20},
        "level": 20
    },

    "goblin_trickster_charm": {
        "id": "goblin_trickster_charm",
        "name": "哥布林詭符",
        "icon": "🪙",
        "type": "accessory",
        "rarity": "uncommon",
        "materials": [{"id":"goblin_coin","quantity":10},{"id":"goblin_ear","quantity":5},{"id":"rat_tail","quantity":5},{"id":"raw_meat","quantity":3},{"id":"orc_fang","quantity":2}],
        "cost": 300,
        "successRate": 90,
        "result": {"id":"crafted_goblin_trickster_charm","name":"哥布林詭符","icon":"🪙","type":"accessory","rarity":"uncommon","stats":{"attack":6,"defense":2,"critChance":0.08,"critDamage":1.4},"specialEffects":[{"type":"dodgeChance","value":8}],"desc":"集結哥布林戰利品製成的小護符，靈巧提升。","level":8,"requiredLevel":8},
        "level": 8
    },

    "earthwarden_aegis": {
        "id": "earthwarden_aegis",
        "name": "地脈守盾",
        "icon": "🌍",
        "type": "equipment",
        "rarity": "rare",
        "materials": [{"id":"earth_essence","quantity":3},{"id":"golem_core","quantity":1},{"id":"molten_core","quantity":1},{"id":"stone_fragment","quantity":4}],
        "cost": 1500,
        "successRate": 70,
        "result": {"id":"crafted_earthwarden_aegis","name":"地脈守盾","icon":"🌍","type":"equipment","rarity":"rare","stats":{"attack":4,"defense":30,"critChance":0.04,"critDamage":1.3},"specialEffects":[{"type":"damageReduction","value":10}],"desc":"以大地精華與魔像核心鑄成的守護盾牌。","level":33,"requiredLevel":33},
        "level": 33
    },

    "bone_etched_lance": {
        "id": "bone_etched_lance",
        "name": "骨紋長槍",
        "icon": "⚔️",
        "type": "weapon",
        "weaponForm": "lance",
        "rarity": "rare",
        "materials": [{"id":"bone_fragment","quantity":5},{"id":"iron_ore","quantity":2},{"id":"rune_stone","quantity":1}],
        "cost": 260,
        "successRate": 100,
        "result": {"id":"crafted_bone_etched_lance","name":"骨紋長槍","icon":"⚔️","type":"weapon","weaponForm":"lance","rarity":"rare","stats":{"attack":26,"defense":4,"critChance":0.1,"critDamage":1.75,"weaponSpeed":0.94,"attackSpeed":0.94},"specialEffects":[{"type":"armorPenetration","value":5}],"setId":null,"desc":"骨紋長槍","sourceChapter":2,"balanceStatus":"source_locked_stats_provisional","level":19,"requiredLevel":19},
        "level": 19
    },

    "curse_iron_warhammer": {
        "id": "curse_iron_warhammer",
        "name": "咒鐵戰鎚",
        "icon": "⚔️",
        "type": "weapon",
        "weaponForm": "heavy",
        "rarity": "rare",
        "materials": [{"id":"cursed_shard","quantity":1},{"id":"dark_steel","quantity":3},{"id":"iron_ore","quantity":2}],
        "cost": 520,
        "successRate": 100,
        "result": {"id":"crafted_curse_iron_warhammer","name":"咒鐵戰鎚","icon":"⚔️","type":"weapon","weaponForm":"heavy","rarity":"rare","stats":{"attack":38,"defense":7,"critChance":0.08,"critDamage":1.9,"weaponSpeed":0.76,"attackSpeed":0.76},"specialEffects":[{"type":"armorPenetration","value":7}],"setId":null,"desc":"咒鐵戰鎚","sourceChapter":3,"balanceStatus":"source_locked_stats_provisional","level":28,"requiredLevel":28},
        "level": 28
    },

    "leyline_wedge_lance": {
        "id": "leyline_wedge_lance",
        "name": "地脈楔槍",
        "icon": "⚔️",
        "type": "weapon",
        "weaponForm": "lance",
        "rarity": "epic",
        "materials": [{"id":"mithril_ore","quantity":3},{"id":"rune_stone","quantity":2},{"id":"earth_essence","quantity":1}],
        "cost": 820,
        "successRate": 100,
        "result": {"id":"crafted_leyline_wedge_lance","name":"地脈楔槍","icon":"⚔️","type":"weapon","weaponForm":"lance","rarity":"epic","stats":{"attack":49,"defense":9,"critChance":0.1,"critDamage":1.9,"weaponSpeed":0.92,"attackSpeed":0.92},"specialEffects":[{"type":"stunChance","value":7}],"setId":null,"desc":"地脈楔槍","sourceChapter":4,"balanceStatus":"source_locked_stats_provisional","level":38,"requiredLevel":38},
        "level": 38
    },

    "embercore_focus": {
        "id": "embercore_focus",
        "name": "燼核法器",
        "icon": "⚔️",
        "type": "weapon",
        "weaponForm": "focus",
        "rarity": "rare",
        "materials": [{"id":"ember_stone","quantity":2},{"id":"fire_essence","quantity":3},{"id":"magic_crystal","quantity":1}],
        "cost": 1100,
        "successRate": 100,
        "result": {"id":"crafted_embercore_focus","name":"燼核法器","icon":"⚔️","type":"weapon","weaponForm":"focus","rarity":"rare","stats":{"attack":49,"defense":12,"critChance":0.12,"critDamage":1.8,"weaponSpeed":1.04,"attackSpeed":1.04},"specialEffects":[{"type":"fire","value":14}],"setId":null,"desc":"燼核法器","sourceChapter":5,"balanceStatus":"source_locked_stats_provisional","level":45,"requiredLevel":45},
        "level": 45
    },

    "stormguide_focus": {
        "id": "stormguide_focus",
        "name": "鳴雷導杖",
        "icon": "⚔️",
        "type": "weapon",
        "weaponForm": "focus",
        "rarity": "rare",
        "materials": [{"id":"storm_crystal","quantity":2},{"id":"thunder_essence","quantity":3},{"id":"magic_crystal","quantity":1}],
        "cost": 1100,
        "successRate": 100,
        "result": {"id":"crafted_stormguide_focus","name":"鳴雷導杖","icon":"⚔️","type":"weapon","weaponForm":"focus","rarity":"rare","stats":{"attack":47,"defense":11,"critChance":0.15,"critDamage":1.8,"weaponSpeed":1.08,"attackSpeed":1.08},"specialEffects":[{"type":"thunder","value":14}],"setId":null,"desc":"鳴雷導杖","sourceChapter":5,"balanceStatus":"source_locked_stats_provisional","level":46,"requiredLevel":46},
        "level": 46
    },

    "cliffscale_skinner": {
        "id": "cliffscale_skinner",
        "name": "崖鱗剖刃",
        "icon": "⚔️",
        "type": "weapon",
        "weaponForm": "dagger",
        "rarity": "rare",
        "materials": [{"id":"wyvern_scale","quantity":3},{"id":"dragon_tooth","quantity":1},{"id":"mithril_ore","quantity":2}],
        "cost": 1450,
        "successRate": 100,
        "result": {"id":"crafted_cliffscale_skinner","name":"崖鱗剖刃","icon":"⚔️","type":"weapon","weaponForm":"dagger","rarity":"rare","stats":{"attack":59,"defense":4,"critChance":0.2,"critDamage":2,"weaponSpeed":1.28,"attackSpeed":1.28},"specialEffects":[{"type":"armorPenetration","value":9}],"setId":null,"desc":"崖鱗剖刃","sourceChapter":6,"balanceStatus":"source_locked_stats_provisional","level":53,"requiredLevel":53},
        "level": 53
    },

    "sealstone_ram": {
        "id": "sealstone_ram",
        "name": "封石撞槌",
        "icon": "⚔️",
        "type": "weapon",
        "weaponForm": "heavy",
        "rarity": "epic",
        "materials": [{"id":"stone_fragment","quantity":4},{"id":"rune_stone","quantity":2},{"id":"drake_scale","quantity":1}],
        "cost": 1600,
        "successRate": 100,
        "result": {"id":"crafted_sealstone_ram","name":"封石撞槌","icon":"⚔️","type":"weapon","weaponForm":"heavy","rarity":"epic","stats":{"attack":73,"defense":16,"critChance":0.07,"critDamage":2.05,"weaponSpeed":0.74,"attackSpeed":0.74},"specialEffects":[{"type":"stunChance","value":10}],"setId":null,"desc":"封石撞槌","sourceChapter":6,"balanceStatus":"source_locked_stats_provisional","level":56,"requiredLevel":56},
        "level": 56
    },

    "molten_core_maul": {
        "id": "molten_core_maul",
        "name": "熔核重鎚",
        "icon": "⚔️",
        "type": "weapon",
        "weaponForm": "heavy",
        "rarity": "epic",
        "materials": [{"id":"lava_scale","quantity":3},{"id":"molten_core","quantity":1},{"id":"demonic_steel","quantity":2}],
        "cost": 2100,
        "successRate": 100,
        "result": {"id":"crafted_molten_core_maul","name":"熔核重鎚","icon":"⚔️","type":"weapon","weaponForm":"heavy","rarity":"epic","stats":{"attack":84,"defense":18,"critChance":0.08,"critDamage":2.15,"weaponSpeed":0.72,"attackSpeed":0.72},"specialEffects":[{"type":"fire","value":12}],"setId":null,"desc":"熔核重鎚","sourceChapter":7,"balanceStatus":"source_locked_stats_provisional","level":65,"requiredLevel":65},
        "level": 65
    },

    "soul_lantern_focus": {
        "id": "soul_lantern_focus",
        "name": "縛魂燈杖",
        "icon": "⚔️",
        "type": "weapon",
        "weaponForm": "focus",
        "rarity": "epic",
        "materials": [{"id":"soul_fragment","quantity":3},{"id":"cursed_shard","quantity":1},{"id":"magic_crystal","quantity":2}],
        "cost": 2200,
        "successRate": 100,
        "result": {"id":"crafted_soul_lantern_focus","name":"縛魂燈杖","icon":"⚔️","type":"weapon","weaponForm":"focus","rarity":"epic","stats":{"attack":74,"defense":22,"critChance":0.13,"critDamage":1.95,"weaponSpeed":1.02,"attackSpeed":1.02},"specialEffects":[{"type":"lifesteal","value":5}],"setId":null,"desc":"縛魂燈杖","sourceChapter":7,"balanceStatus":"source_locked_stats_provisional","level":66,"requiredLevel":66},
        "level": 66
    },

    "forge_forest_guardian_crown": {
        "id": "forge_forest_guardian_crown",
        "name": "森衛枝冠工藝",
        "resultId": "forest_guardian_crown",
        "bossId": "forest_guardian",
        "level": 13,
        "type": "equipment",
        "rarity": "legendary",
        "materials": [{"id":"guardian_branch","quantity":1},{"id":"forest_essence","quantity":1},{"id":"spider_silk","quantity":2}],
        "cost": 360,
        "successRate": 100,
        "acquisitionRole": "boss_dungeon_craft",
        "unlockMethod": "boss_clear_system_unlock",
        "canonicalResult": true,
        "result": {"id":"forest_guardian_crown","name":"森衛枝冠","icon":"👑","type":"equipment","rarity":"rare","level":13,"stats":{"attack":3,"defense":15,"critChance":0.05,"critDamage":1.3},"specialEffects":[{"type":"damageReduction","value":5}],"setId":"forest_guardian","description":"由樹枝與樹葉編織的王冠。","dropFrom":[],"maxDurability":28,"durability":28}
    },

    "forge_titan_gauntlet": {
        "id": "forge_titan_gauntlet",
        "name": "巨神護手工藝",
        "resultId": "titan_gauntlet",
        "bossId": "ancient_titan",
        "level": 40,
        "type": "equipment",
        "rarity": "legendary",
        "materials": [{"id":"primordial_stone","quantity":2},{"id":"mithril_ore","quantity":2},{"id":"earth_essence","quantity":2}],
        "cost": 1050,
        "successRate": 100,
        "acquisitionRole": "boss_dungeon_craft",
        "unlockMethod": "boss_clear_system_unlock",
        "canonicalResult": true,
        "result": {"id":"titan_gauntlet","name":"巨神護手","icon":"🧤","type":"accessory","rarity":"epic","stats":{"attack":18,"defense":22,"critChance":0.08,"critDamage":1.6,"hp":80},"price":1200,"description":"遠古泰坦的護手，蘊含遠古之力。","setId":"titan","canEnhance":true,"level":35,"dropSource":"ancient_titan","dropFrom":[],"maxDurability":39,"durability":39}
    },

    "forge_elemental_crown": {
        "id": "forge_elemental_crown",
        "name": "四象靜冠工藝",
        "resultId": "elemental_crown",
        "bossId": "elemental_lord",
        "level": 50,
        "type": "equipment",
        "rarity": "legendary",
        "materials": [{"id":"elemental_core","quantity":1},{"id":"primal_essence","quantity":1},{"id":"magic_crystal","quantity":2}],
        "cost": 1450,
        "successRate": 100,
        "acquisitionRole": "boss_dungeon_craft",
        "unlockMethod": "boss_clear_system_unlock",
        "canonicalResult": true,
        "result": {"id":"elemental_crown","name":"四象靜冠","icon":"👑","type":"equipment","rarity":"legendary","level":50,"stats":{"attack":15,"defense":25,"critChance":0.15,"critDamage":1.8},"specialEffects":[{"type":"fire","value":10},{"type":"ice","value":10},{"type":"thunder","value":10},{"type":"damageReduction","value":10}],"setId":"elemental_master","description":"元素之主的王冠，融合四大元素。","dropFrom":[],"maxDurability":54,"durability":54}
    },

    "forge_elder_dragon_badge": {
        "id": "forge_elder_dragon_badge",
        "name": "古龍牙墜工藝",
        "resultId": "elder_dragon_fang_badge",
        "bossId": "elder_dragon",
        "level": 60,
        "type": "equipment",
        "rarity": "legendary",
        "materials": [{"id":"dragon_heart","quantity":1},{"id":"elder_dragon_scale","quantity":1},{"id":"drake_scale","quantity":2}],
        "cost": 1850,
        "successRate": 100,
        "acquisitionRole": "boss_dungeon_craft",
        "unlockMethod": "boss_clear_system_unlock",
        "canonicalResult": true,
        "result": {"id":"elder_dragon_fang_badge","name":"古龍牙墜","icon":"🐲","type":"accessory","rarity":"legendary","level":60,"stats":{"attack":58,"defense":9,"critChance":0.2,"critDamage":2.5,"weaponSpeed":0.9,"attackSpeed":1},"specialEffects":[{"type":"fire","value":30},{"type":"armorPenetration","value":25},{"type":"execute","value":35},{"type":"lifesteal","value":12}],"setId":"dragon_slayer","description":"由古龍之牙鍛造的傳說護符。","dropFrom":[],"maxDurability":55,"durability":55}
    },

    "forge_demon_lord_crown": {
        "id": "forge_demon_lord_crown",
        "name": "末焰心核工藝",
        "resultId": "demon_lord_crown",
        "bossId": "demon_lord_asariel",
        "level": 70,
        "type": "equipment",
        "rarity": "legendary",
        "materials": [{"id":"demon_core","quantity":1},{"id":"demonic_steel","quantity":2},{"id":"molten_core","quantity":1}],
        "cost": 2600,
        "successRate": 100,
        "acquisitionRole": "boss_dungeon_craft",
        "unlockMethod": "boss_clear_system_unlock",
        "canonicalResult": true,
        "result": {"id":"demon_lord_crown","name":"末焰心核","icon":"👑","type":"accessory","rarity":"legendary","level":70,"stats":{"attack":23,"defense":36,"critChance":0.18,"critDamage":2.3},"specialEffects":[{"type":"critDamage","value":50},{"type":"damageReduction","value":20},{"type":"revive","value":50}],"setId":"demon_lord","description":"魔王的王冠，擁有復活的力量。","dropFrom":[],"maxDurability":60,"durability":60}
    }
};
