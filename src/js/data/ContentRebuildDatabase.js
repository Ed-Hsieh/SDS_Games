/**
 * ContentRebuildDatabase.js
 * Structured rebuild plan for the Lv.1-70 content pass.
 *
 * This is data, not documentation. It is the source table used before we
 * materialize new monsters, equipment, dungeon rewards, recipes, and image
 * queues into the live databases.
 */

import { AffixStat, EquipmentType, ItemRarity, ItemType } from '../models/Enums.js';
import { DungeonType } from './Dungeons.js';
import { MonsterType } from './Monsters.js';

export const ContentStatus = Object.freeze({
    EXISTING: 'existing',
    PARTIAL: 'partial',
    PLANNED: 'planned',
    NEEDS_REVIEW: 'needs_review'
});

export const RewardChannel = Object.freeze({
    STARTER: 'starter',
    SERIES_CRAFT: 'series_craft',
    MONSTER_DROP: 'monster_drop',
    ELITE_DROP: 'elite_drop',
    DUNGEON_DROP: 'dungeon_drop',
    BOSS_DROP: 'boss_drop',
    QUEST_REWARD: 'quest_reward',
    CASINO_POOL: 'casino_pool',
    TOWER_DROP: 'tower_drop'
});

export const WeaponForm = Object.freeze({
    SWORD: 'sword',
    DAGGER: 'dagger',
    CLAW: 'claw',
    HAMMER: 'hammer',
    AXE: 'axe',
    STAFF: 'staff',
    FOCUS: 'focus',
    SPEAR: 'spear',
    SHIELD: 'shield',
    ARMOR: 'armor',
    ACCESSORY: 'accessory'
});

export const ElementLine = Object.freeze({
    NONE: 'none',
    FIRE: AffixStat.FIRE,
    ICE: AffixStat.ICE,
    THUNDER: AffixStat.THUNDER,
    POISON: AffixStat.POISON,
    SHADOW: 'shadow',
    GLIMMER: 'glimmer',
    VOID: AffixStat.VOID,
    LIGHT: AffixStat.LIGHT,
    EARTH: 'earth',
    LIFE: 'life',
    DRAGON: 'dragon',
    DEMON: 'demon'
});

export const ContentLevelBandDatabase = Object.freeze([
    {
        id: 'lv01_04_border',
        label: 'Lv1-4 邊境生存',
        levelRange: [1, 4],
        purpose: '建立掉落、耐久、修復與第一批刷怪追求。',
        world: {
            normal: ['giant_rat', 'slime', 'goblin', 'wild_wolf', 'skeleton'],
            elite: [],
            boss: []
        },
        dungeons: [],
        tower: [],
        equipmentLines: ['starter_line', 'wolf_hunter'],
        materialGroups: ['border_basic', 'beast_basic'],
        blockedMaterials: ['shadow_shard', 'glimmer_shard', 'void_essence', 'light_essence']
    },
    {
        id: 'lv05_10_cave',
        label: 'Lv5-10 洞窟與森林門檻',
        levelRange: [5, 10],
        purpose: '第一個高風險高回報場；建立毒、石、蜘蛛與森林守衛裝備追求。',
        world: {
            normal: ['orc_warrior', 'poison_spider', 'stone_golem_mini', 'treant'],
            elite: [],
            boss: ['ambush_mantis', 'forest_guardian']
        },
        dungeons: [DungeonType.CAVE],
        tower: ['tower_slime_king', 'tower_skeleton_captain'],
        equipmentLines: ['slime_series', 'cave_miner', 'spider_venom', 'forest_guardian'],
        materialGroups: ['cave_ore', 'spider_venom', 'stone_golem', 'forest_life'],
        blockedMaterials: ['shadow_shard', 'void_essence', 'light_essence']
    },
    {
        id: 'lv11_16_undead_snow_entry',
        label: 'Lv11-16 亡靈與雪原前段',
        levelRange: [11, 16],
        purpose: '讓骨系、幽魂與寒冷壓力接上；暗影與虛空仍不開放。',
        world: {
            normal: ['skeleton_warrior', 'ghost'],
            elite: [],
            boss: ['blood_moon_stag']
        },
        dungeons: [DungeonType.SNOW],
        tower: ['tower_poison_queen', 'tower_alpha_wolf'],
        equipmentLines: ['bone_series', 'undead_slayer', 'early_frost'],
        materialGroups: ['bone_spirit', 'snow_pelt'],
        blockedMaterials: ['shadow_shard', 'void_essence', 'light_essence']
    },
    {
        id: 'lv17_23_glimmer_frost',
        label: 'Lv17-23 巫妖、冰系與微光前兆',
        levelRange: [17, 23],
        purpose: '第一個中期撞牆點；微光只提供弱化節奏效果，不給正式光明。',
        world: {
            normal: ['stone_golem'],
            elite: ['glimmer_sprite', 'rune_wisp'],
            boss: ['lich']
        },
        dungeons: [DungeonType.SNOW],
        tower: ['tower_goblin_chief', 'tower_gargoyle'],
        equipmentLines: ['frost_series', 'lich_relic', 'glimmer_initiate'],
        materialGroups: ['dark_relic', 'frost_core', 'glimmer_seed'],
        blockedMaterials: ['shadow_shard', 'void_essence', 'light_essence']
    },
    {
        id: 'lv24_30_shadow_legion',
        label: 'Lv24-30 暗影軍團正式登場',
        levelRange: [24, 30],
        purpose: 'shadow_shard 正式開放，暗影裝備作為虛空弱化前置。',
        world: {
            normal: ['shadow_soldier', 'shadow_archer'],
            elite: ['shadow_mage'],
            boss: ['drowned_oracle', 'shadow_commander']
        },
        dungeons: [DungeonType.RUINS],
        tower: ['tower_shadow_stalker', 'tower_flame_imp', 'tower_frost_giant'],
        equipmentLines: ['shadow_series', 'shadow_legion', 'sunken_oracle'],
        materialGroups: ['shadow_legion', 'oracle_deep'],
        blockedMaterials: ['void_essence', 'light_essence']
    },
    {
        id: 'lv31_37_ruins_glimmer',
        label: 'Lv31-37 遺跡、符文與微光穩定來源',
        levelRange: [31, 37],
        purpose: '補中期防禦、秘銀、水晶與符文流派；微光形成穩定前置。',
        world: {
            normal: ['ancient_guardian', 'crystal_golem'],
            elite: ['rune_keeper'],
            boss: ['thorn_witch']
        },
        dungeons: [DungeonType.RUINS],
        tower: ['tower_hell_knight', 'tower_man_eater'],
        equipmentLines: ['mithril_rune', 'ancient_relic', 'glimmer_warden'],
        materialGroups: ['ancient_ruins', 'crystal_mithril', 'glimmer_rune'],
        blockedMaterials: ['void_essence', 'light_essence']
    },
    {
        id: 'lv38_45_elements_titan',
        label: 'Lv38-45 泰坦、灰燼與基礎元素',
        levelRange: [38, 45],
        purpose: '火、冰、雷、地進入主力期；微光仍只是光明前置延伸。',
        world: {
            normal: ['fire_elemental', 'ice_elemental', 'earth_elemental', 'thunder_elemental'],
            elite: ['prism_wisp'],
            boss: ['ancient_titan', 'ash_baron']
        },
        dungeons: [],
        tower: ['tower_thunder_hawk', 'tower_abyss_general', 'tower_iron_golem'],
        equipmentLines: ['elemental_series', 'titan', 'ash_baron'],
        materialGroups: ['elemental_basic', 'titan_relic', 'ember_ash'],
        blockedMaterials: ['light_essence']
    },
    {
        id: 'lv46_52_jungle_life',
        label: 'Lv46-52 叢林、毒、生命與續戰',
        levelRange: [46, 52],
        purpose: '讓叢林成為毒、生命、快速攻擊與續戰裝備的高回報場。',
        world: {
            normal: ['starvein_lurker'],
            elite: [],
            boss: ['elemental_lord']
        },
        dungeons: [DungeonType.JUNGLE],
        tower: ['tower_hydra', 'tower_dark_dragon'],
        equipmentLines: ['jungle_series', 'hydra_venom', 'life_weave'],
        materialGroups: ['jungle_poison', 'life_vine', 'primal_seed'],
        blockedMaterials: ['light_essence']
    },
    {
        id: 'lv53_60_dragon',
        label: 'Lv53-60 龍族後期裝備',
        levelRange: [53, 60],
        purpose: '龍系材料、長柄、防具與屠龍套裝承接後期壓力。',
        world: {
            normal: ['wyvern', 'drake'],
            elite: ['dragon_knight'],
            boss: ['elder_dragon']
        },
        dungeons: [],
        tower: ['tower_primordial_titan'],
        equipmentLines: ['dragon_scale', 'dragon_slayer'],
        materialGroups: ['dragon_bone_scale', 'dragon_heart'],
        blockedMaterials: ['light_essence']
    },
    {
        id: 'lv61_70_abyss_demon',
        label: 'Lv61-70 惡魔、深淵與虛空前兆',
        levelRange: [61, 70],
        purpose: '暗影逼近虛空，但完整虛空仍由塔 DLC / 深淵線控制。',
        world: {
            normal: ['demon_soldier', 'void_walker'],
            elite: ['shadow_assassin', 'shadow_general', 'demon_general', 'abyssal_seraph'],
            boss: ['shadow_overlord', 'demon_lord_asariel']
        },
        dungeons: [DungeonType.HELL],
        tower: ['tower_void_king'],
        equipmentLines: ['abyss_series', 'demon_lord', 'void_precursor'],
        materialGroups: ['demon_core', 'abyss_void', 'world_shard'],
        blockedMaterials: ['light_essence']
    },
    {
        id: 'post70_radiant_corridor',
        label: 'Lv70 後 黎明迴廊與塔 DLC',
        levelRange: [70, 80],
        purpose: '正式解鎖光明系素材與抗塔壓力裝備；不讓微光自然升階。',
        world: {
            normal: [],
            elite: [],
            boss: []
        },
        dungeons: ['radiant_corridor'],
        tower: ['tower_void_king'],
        equipmentLines: ['radiant_series', 'radiant_towerguard', 'void_tower'],
        materialGroups: ['radiant_light', 'tower_void'],
        blockedMaterials: []
    }
]);

export const EquipmentLineDatabase = Object.freeze({
    starter_line: {
        id: 'starter_line',
        label: '起步與修復體驗',
        status: ContentStatus.EXISTING,
        role: 'starter',
        levelRange: [1, 4],
        channels: [RewardChannel.STARTER, RewardChannel.QUEST_REWARD],
        itemIds: ['old_sword', 'old_armor', 'starter_sword'],
        forms: [WeaponForm.SWORD, WeaponForm.ARMOR],
        elements: [ElementLine.NONE],
        purpose: '讓玩家理解耐久、修復和第一把任務武器。'
    },
    slime_series: {
        id: 'slime_series',
        label: '青凝工藝',
        status: ContentStatus.EXISTING,
        role: 'weak_fallback',
        levelRange: [5, 9],
        channels: [RewardChannel.SERIES_CRAFT],
        itemIds: ['slime_series_sword', 'slime_series_dagger', 'slime_series_hammer', 'slime_series_staff', 'slime_series_spear'],
        forms: [WeaponForm.SWORD, WeaponForm.DAGGER, WeaponForm.HAMMER, WeaponForm.STAFF, WeaponForm.SPEAR],
        elements: [ElementLine.NONE],
        materialIds: ['slime_jelly', 'iron_shard'],
        purpose: '弱保底，不承擔主要追求。'
    },
    cave_miner: {
        id: 'cave_miner',
        label: '洞窟礦工與石系裝備',
        status: ContentStatus.EXISTING,
        role: 'dungeon_reward',
        levelRange: [5, 10],
        channels: [RewardChannel.DUNGEON_DROP],
        itemIds: ['miners_charm', 'miners_pickhammer', 'cave_ward_shield'],
        forms: [WeaponForm.HAMMER, WeaponForm.SHIELD, WeaponForm.ACCESSORY],
        elements: [ElementLine.EARTH],
        materialIds: ['iron_ore', 'stone_fragment', 'golem_core'],
        sourceIds: ['cave_bat', 'cave_spider', 'cave_rat', 'rock_golem'],
        purpose: '讓洞窟不是教學副本，而是早期第一個刷裝點。'
    },
    spider_venom: {
        id: 'spider_venom',
        label: '蛛毒與敏捷裝備',
        status: ContentStatus.PARTIAL,
        role: 'monster_chase',
        levelRange: [5, 15],
        channels: [RewardChannel.MONSTER_DROP, RewardChannel.DUNGEON_DROP],
        itemIds: ['spider_silk_gloves', 'poison_dagger', 'silver_thread_hook'],
        forms: [WeaponForm.DAGGER, WeaponForm.ACCESSORY, WeaponForm.ARMOR],
        elements: [ElementLine.POISON],
        materialIds: ['spider_silk', 'poison_gland', 'spider_queen_fang'],
        sourceIds: ['poison_spider', 'cave_spider', 'tower_poison_queen', 'ambush_mantis'],
        purpose: '高速、毒、閃避與陷阱反制。'
    },
    forest_guardian: {
        id: 'forest_guardian',
        label: '森林守護者套裝',
        status: ContentStatus.EXISTING,
        role: 'boss_milestone',
        levelRange: [7, 12],
        channels: [RewardChannel.BOSS_DROP],
        itemIds: ['forest_guardian_staff', 'forest_guardian_crown', 'guardian_armor', 'nature_amulet'],
        forms: [WeaponForm.STAFF, WeaponForm.ARMOR, WeaponForm.ACCESSORY],
        elements: [ElementLine.LIFE, ElementLine.EARTH],
        materialIds: ['guardian_branch', 'forest_essence', 'life_seed', 'ancient_bark'],
        sourceIds: ['forest_guardian', 'treant'],
        setId: 'forest_guardian',
        purpose: '早期第一次明確 Boss 套裝與自然續戰。'
    },
    bone_series: {
        id: 'bone_series',
        label: '白骨工藝',
        status: ContentStatus.EXISTING,
        role: 'weak_fallback',
        levelRange: [10, 16],
        channels: [RewardChannel.SERIES_CRAFT],
        itemIds: ['bone_series_sword', 'bone_series_dagger', 'bone_series_hammer', 'bone_series_staff', 'bone_series_spear'],
        forms: [WeaponForm.SWORD, WeaponForm.DAGGER, WeaponForm.HAMMER, WeaponForm.STAFF, WeaponForm.SPEAR],
        elements: [ElementLine.NONE],
        materialIds: ['bone_fragment', 'iron_ore'],
        purpose: '補中前期武器型制空窗。'
    },
    undead_slayer: {
        id: 'undead_slayer',
        label: '亡靈獵人',
        status: ContentStatus.EXISTING,
        role: 'monster_chase',
        levelRange: [11, 18],
        channels: [RewardChannel.MONSTER_DROP, RewardChannel.ELITE_DROP],
        itemIds: ['bone_sword', 'ghost_cloak', 'bone_blade', 'bone_soul_staff'],
        forms: [WeaponForm.SWORD, WeaponForm.STAFF, WeaponForm.ARMOR],
        elements: [ElementLine.NONE],
        materialIds: ['bone_fragment', 'ectoplasm', 'spirit_essence', 'soul_fragment'],
        sourceIds: ['skeleton_warrior', 'ghost', 'tower_skeleton_captain'],
        setId: 'undead_slayer',
        purpose: '亡靈群落刷裝與骨系保底之間的橋。'
    },
    early_frost: {
        id: 'early_frost',
        label: '雪原前段抗寒裝備',
        status: ContentStatus.EXISTING,
        role: 'dungeon_counter',
        levelRange: [16, 23],
        channels: [RewardChannel.DUNGEON_DROP, RewardChannel.SERIES_CRAFT],
        itemIds: ['frostbite_dueling_blade', 'frostbound_scepter_drop', 'ice_sword', 'frostbound_scepter'],
        forms: [WeaponForm.SWORD, WeaponForm.STAFF, WeaponForm.ARMOR, WeaponForm.ACCESSORY],
        elements: [ElementLine.ICE],
        materialIds: ['frost_crystal', 'frost_core', 'ice_essence', 'cold_resist_potion'],
        sourceIds: ['frost_wolf', 'yeti_scout', 'ice_elemental', 'frost_giant', 'ice_dragon'],
        purpose: '雪原副本應提供抗寒與節奏控制，不只掉素材。'
    },
    lich_relic: {
        id: 'lich_relic',
        label: '巫妖法器',
        status: ContentStatus.PARTIAL,
        role: 'boss_milestone',
        levelRange: [17, 23],
        channels: [RewardChannel.BOSS_DROP, RewardChannel.SERIES_CRAFT],
        itemIds: ['lich_staff', 'tower_lich_staff', 'lich_staff_remnant', 'bone_soul_staff'],
        forms: [WeaponForm.STAFF, WeaponForm.FOCUS, WeaponForm.ACCESSORY],
        elements: [ElementLine.GLIMMER, ElementLine.SHADOW],
        materialIds: ['lich_phylactery', 'dark_crystal', 'rune_stone', 'glimmer_shard'],
        sourceIds: ['lich'],
        purpose: '亡靈與微光前置交界；不掉正式 shadow_shard。'
    },
    glimmer_initiate: {
        id: 'glimmer_initiate',
        label: '微光啟蒙',
        status: ContentStatus.EXISTING,
        role: 'high_tier_precursor',
        levelRange: [17, 37],
        channels: [RewardChannel.ELITE_DROP, RewardChannel.SERIES_CRAFT],
        itemIds: ['glimmer_focus', 'rune_badge', 'glimmer_lampstaff', 'rune_scriber_focus', 'prism_focus'],
        forms: [WeaponForm.FOCUS, WeaponForm.ACCESSORY, WeaponForm.STAFF],
        elements: [ElementLine.GLIMMER],
        materialIds: ['glimmer_shard', 'rune_stone', 'pure_crystal'],
        sourceIds: ['lich', 'rune_keeper', 'glimmer_sprite', 'rune_wisp'],
        precursorTo: ElementLine.LIGHT,
        purpose: '弱化光明：少量攻速、命中節奏修正、短暫專注。'
    },
    shadow_series: {
        id: 'shadow_series',
        label: '暗影工藝',
        status: ContentStatus.EXISTING,
        role: 'high_tier_precursor',
        levelRange: [24, 30],
        channels: [RewardChannel.SERIES_CRAFT, RewardChannel.MONSTER_DROP],
        itemIds: ['shadowneedle_dagger', 'umbral_pike', 'shade_focus', 'shadow_blade', 'shadow_armor', 'shadow_ring'],
        forms: [WeaponForm.DAGGER, WeaponForm.SPEAR, WeaponForm.FOCUS, WeaponForm.ARMOR],
        elements: [ElementLine.SHADOW],
        materialIds: ['shadow_shard', 'shadow_arrow', 'dark_steel'],
        sourceIds: ['shadow_soldier', 'shadow_archer', 'shadow_mage'],
        precursorTo: ElementLine.VOID,
        purpose: '弱化虛空：低量侵蝕、削防、暗影印記、短暫壓制。'
    },
    shadow_legion: {
        id: 'shadow_legion',
        label: '暗影軍團套裝',
        status: ContentStatus.EXISTING,
        role: 'monster_chase',
        levelRange: [24, 35],
        channels: [RewardChannel.MONSTER_DROP, RewardChannel.BOSS_DROP],
        itemIds: ['shadow_blade_drop', 'shadow_armor_drop', 'shadow_badge', 'shadow_commander_blade', 'shadowneedle_dagger', 'umbral_pike', 'shade_focus', 'shadow_blade', 'shadow_armor', 'shadow_ring'],
        forms: [WeaponForm.SWORD, WeaponForm.DAGGER, WeaponForm.SPEAR, WeaponForm.FOCUS, WeaponForm.ARMOR, WeaponForm.ACCESSORY],
        elements: [ElementLine.SHADOW],
        materialIds: ['shadow_shard', 'shadow_essence', 'shadow_core', 'dark_steel'],
        sourceIds: ['shadow_soldier', 'shadow_archer', 'shadow_mage', 'shadow_commander'],
        setId: 'shadow_legion',
        purpose: '正式暗影線，作為虛空流派前置而不是普通暴擊裝。'
    },
    mithril_rune: {
        id: 'mithril_rune',
        label: '秘銀與符文防禦流',
        status: ContentStatus.PARTIAL,
        role: 'dungeon_reward',
        levelRange: [31, 37],
        channels: [RewardChannel.DUNGEON_DROP, RewardChannel.ELITE_DROP],
        itemIds: ['mithril_sword', 'earthwarden_aegis', 'rune_badge', 'crystal_shield'],
        forms: [WeaponForm.SWORD, WeaponForm.SHIELD, WeaponForm.ACCESSORY],
        elements: [ElementLine.EARTH, ElementLine.GLIMMER],
        materialIds: ['mithril_ore', 'ancient_gear', 'crystal_shard', 'rune_stone'],
        sourceIds: ['stone_guardian', 'animated_armor', 'ancient_mage', 'ancient_guardian', 'rune_keeper'],
        purpose: '中期防禦、破甲與符文微光。'
    },
    elemental_series: {
        id: 'elemental_series',
        label: '元素大師線',
        status: ContentStatus.PARTIAL,
        role: 'elemental_chase',
        levelRange: [38, 45],
        channels: [RewardChannel.SERIES_CRAFT, RewardChannel.BOSS_DROP],
        itemIds: ['flame_sword', 'frost_blade', 'thunder_axe', 'storm_spear', 'elemental_badge', 'elemental_crown'],
        forms: [WeaponForm.SWORD, WeaponForm.AXE, WeaponForm.SPEAR, WeaponForm.ACCESSORY],
        elements: [ElementLine.FIRE, ElementLine.ICE, ElementLine.THUNDER, ElementLine.EARTH],
        materialIds: ['fire_essence', 'ice_essence', 'thunder_essence', 'earth_essence', 'elemental_core'],
        sourceIds: ['fire_elemental', 'ice_elemental', 'thunder_elemental', 'earth_elemental', 'elemental_lord'],
        setId: 'elemental_master',
        purpose: '基礎元素主力期，武器型制不可全部做成劍。'
    },
    titan: {
        id: 'titan',
        label: '泰坦重武器',
        status: ContentStatus.EXISTING,
        role: 'boss_milestone',
        levelRange: [38, 45],
        channels: [RewardChannel.BOSS_DROP],
        itemIds: ['titan_hammer', 'titan_gauntlet', 'titan_blade', 'titan_armor', 'titan_ring'],
        forms: [WeaponForm.HAMMER, WeaponForm.SWORD, WeaponForm.ARMOR, WeaponForm.ACCESSORY],
        elements: [ElementLine.EARTH],
        materialIds: ['titan_heart', 'ancient_artifact', 'primal_essence'],
        sourceIds: ['ancient_titan', 'tower_primordial_titan'],
        setId: 'titan',
        purpose: '慢速高傷、破甲與耐久壓力。'
    },
    jungle_series: {
        id: 'jungle_series',
        label: '叢林毒與生命續戰',
        status: ContentStatus.EXISTING,
        role: 'dungeon_reward',
        levelRange: [46, 52],
        channels: [RewardChannel.DUNGEON_DROP, RewardChannel.SERIES_CRAFT],
        itemIds: ['thornhook_claws', 'hydra_spine_spear', 'hydra_fang_dagger', 'primal_focus'],
        forms: [WeaponForm.CLAW, WeaponForm.SPEAR, WeaponForm.ARMOR, WeaponForm.ACCESSORY],
        elements: [ElementLine.POISON, ElementLine.LIFE],
        materialIds: ['poison_gland', 'life_seed', 'carnivore_seed', 'hydra_scale', 'vine_core'],
        sourceIds: ['jungle_panther', 'poison_frog', 'vine_beast', 'tribal_hunter', 'ancient_treant', 'starvein_lurker'],
        purpose: '讓叢林不是素材倉庫，而是毒、生命、續戰刷裝點。'
    },
    hydra_venom: {
        id: 'hydra_venom',
        label: '九頭蛇毒牙線',
        status: ContentStatus.PARTIAL,
        role: 'dungeon_boss_chase',
        levelRange: [46, 52],
        channels: [RewardChannel.DUNGEON_DROP, RewardChannel.BOSS_DROP],
        itemIds: ['hydra_fang_dagger', 'hydra_scale_mail', 'primal_focus'],
        forms: [WeaponForm.DAGGER, WeaponForm.ARMOR, WeaponForm.FOCUS],
        elements: [ElementLine.POISON, ElementLine.LIFE],
        materialIds: ['hydra_fang', 'hydra_scale', 'primal_essence'],
        sourceIds: ['jungle_hydra', 'tower_hydra'],
        purpose: '長戰、毒素處決與生命續航。'
    },
    dragon_scale: {
        id: 'dragon_scale',
        label: '龍鱗後期裝備',
        status: ContentStatus.PARTIAL,
        role: 'late_game_chase',
        levelRange: [53, 60],
        channels: [RewardChannel.MONSTER_DROP, RewardChannel.ELITE_DROP],
        itemIds: ['wyvern_lance', 'dragon_knight_helm', 'wyvern_scale_mail', 'dragon_scale_armor', 'dragon_amulet'],
        forms: [WeaponForm.SPEAR, WeaponForm.ARMOR, WeaponForm.ACCESSORY],
        elements: [ElementLine.DRAGON],
        materialIds: ['wyvern_scale', 'wyvern_wing', 'drake_scale', 'dragon_tooth', 'dragon_scale_armor'],
        sourceIds: ['wyvern', 'drake', 'dragon_knight'],
        purpose: '龍族後期壓力，長柄、防具與飾品都要有追求。'
    },
    dragon_slayer: {
        id: 'dragon_slayer',
        label: '屠龍者套裝',
        status: ContentStatus.EXISTING,
        role: 'boss_milestone',
        levelRange: [53, 60],
        channels: [RewardChannel.BOSS_DROP],
        itemIds: ['dragon_slayer', 'elder_dragon_fang', 'elder_dragon_fang_badge', 'dragon_overlord_crown'],
        forms: [WeaponForm.SWORD, WeaponForm.ACCESSORY],
        elements: [ElementLine.DRAGON],
        materialIds: ['dragon_heart', 'elder_dragon_scale', 'dragon_tooth'],
        sourceIds: ['elder_dragon'],
        setId: 'dragon_slayer',
        purpose: '古龍里程碑與對龍壓制，不把所有龍裝都做成劍。'
    },
    abyss_series: {
        id: 'abyss_series',
        label: '深淵工藝',
        status: ContentStatus.EXISTING,
        role: 'late_game_precursor',
        levelRange: [61, 70],
        channels: [RewardChannel.SERIES_CRAFT, RewardChannel.ELITE_DROP],
        itemIds: ['abyssal_needle', 'seraph_void_focus', 'void_reaver', 'tower_abyss_armor'],
        forms: [WeaponForm.DAGGER, WeaponForm.ARMOR, WeaponForm.FOCUS, WeaponForm.ACCESSORY],
        elements: [ElementLine.SHADOW, ElementLine.VOID],
        materialIds: ['abyssal_shard', 'void_essence', 'world_shard', 'demonic_steel', 'demon_core'],
        sourceIds: ['shadow_assassin', 'shadow_general', 'void_walker', 'abyssal_seraph'],
        precursorTo: ElementLine.VOID,
        purpose: '本篇終局前兆，只給可控虛空壓力，不完全取代塔 DLC。'
    },
    demon_lord: {
        id: 'demon_lord',
        label: '魔王套裝',
        status: ContentStatus.EXISTING,
        role: 'final_boss_chase',
        levelRange: [61, 70],
        channels: [RewardChannel.BOSS_DROP, RewardChannel.DUNGEON_DROP],
        itemIds: ['demon_blade', 'demon_general_armor', 'demon_lord_sword', 'demon_lord_crown', 'demon_slayer'],
        forms: [WeaponForm.SWORD, WeaponForm.ARMOR, WeaponForm.ACCESSORY],
        elements: [ElementLine.FIRE, ElementLine.DEMON],
        materialIds: ['demon_horn', 'demonic_steel', 'demon_general_helm', 'molten_core', 'demon_core'],
        sourceIds: ['demon_soldier', 'demon_general', 'demon_lord_asariel', 'demon_king'],
        setId: 'demon_lord',
        purpose: '火焰、惡魔、耐久與終局爆發。'
    },
    radiant_series: {
        id: 'radiant_series',
        label: '光明終局工藝',
        status: ContentStatus.EXISTING,
        role: 'postgame_counter',
        levelRange: [70, 80],
        channels: [RewardChannel.DUNGEON_DROP, RewardChannel.SERIES_CRAFT],
        itemIds: ['dawnbrand_sword', 'prism_focus', 'aurora_ward_plate'],
        forms: [WeaponForm.SWORD, WeaponForm.ARMOR, WeaponForm.FOCUS, WeaponForm.ACCESSORY],
        elements: [ElementLine.LIGHT],
        materialIds: ['radiant_thread', 'light_essence', 'radiant_shard', 'radiant_core'],
        sourceIds: ['prism_wisp', 'dawn_sentinel', 'radiant_keeper', 'mirror_seraph', 'aurora_archon'],
        purpose: '正式光明：高階攻速堆疊、節奏成長、抗塔壓力。'
    },
    void_tower: {
        id: 'void_tower',
        label: '虛空塔終局裝備',
        status: ContentStatus.PARTIAL,
        role: 'tower_endgame',
        levelRange: [70, 80],
        channels: [RewardChannel.TOWER_DROP],
        itemIds: ['tower_void_blade', 'tower_void_crown', 'tower_abyss_armor'],
        forms: [WeaponForm.SWORD, WeaponForm.ARMOR, WeaponForm.ACCESSORY],
        elements: [ElementLine.VOID],
        materialIds: ['void_essence', 'abyssal_shard', 'world_shard'],
        sourceIds: ['tower_void_king', 'tower_abyss_general'],
        setId: 'void_king',
        purpose: '完整虛空壓力與塔 DLC 終局追求。'
    }
});

export const MaterialGroupDatabase = Object.freeze({
    border_basic: {
        id: 'border_basic',
        levelRange: [1, 4],
        core: ['slime_jelly', 'goblin_coin', 'goblin_ear', 'rat_tail', 'raw_meat'],
        useLines: ['starter_line', 'slime_series'],
        purpose: '低階消耗、修復、入門鍛造。'
    },
    beast_basic: {
        id: 'beast_basic',
        levelRange: [1, 10],
        core: ['wolf_fang', 'wolf_pelt', 'beast_hide'],
        useLines: ['wolf_hunter'],
        purpose: '第一個刷怪套裝與獸皮裝備。'
    },
    cave_ore: {
        id: 'cave_ore',
        levelRange: [5, 10],
        core: ['iron_shard', 'iron_ore', 'stone_fragment'],
        rare: ['golem_core', 'forge_core'],
        useLines: ['slime_series', 'cave_miner'],
        purpose: '洞窟鍛造、石系防具與早期修復。'
    },
    spider_venom: {
        id: 'spider_venom',
        levelRange: [5, 15],
        core: ['spider_silk', 'poison_gland'],
        rare: ['spider_queen_fang'],
        useLines: ['spider_venom', 'jungle_series', 'hydra_venom'],
        purpose: '毒、敏捷、匕首與叢林毒線前置。'
    },
    bone_spirit: {
        id: 'bone_spirit',
        levelRange: [11, 18],
        core: ['bone_fragment', 'ectoplasm'],
        rare: ['spirit_essence', 'soul_fragment'],
        useLines: ['bone_series', 'undead_slayer', 'lich_relic'],
        purpose: '骨系保底、亡靈裝與法器。'
    },
    frost_core: {
        id: 'frost_core',
        levelRange: [16, 23],
        core: ['ice_essence', 'frost_crystal'],
        rare: ['frost_core'],
        useLines: ['early_frost'],
        purpose: '雪原抗性、冰系控制與耐久壓力。'
    },
    glimmer_seed: {
        id: 'glimmer_seed',
        levelRange: [17, 37],
        core: ['glimmer_shard', 'rune_stone'],
        rare: ['pure_crystal'],
        useLines: ['glimmer_initiate', 'mithril_rune'],
        precursorTo: ElementLine.LIGHT,
        purpose: '光明前置，不能自然升階成 light。'
    },
    shadow_legion: {
        id: 'shadow_legion',
        levelRange: [24, 35],
        core: ['shadow_shard', 'shadow_arrow', 'dark_steel'],
        rare: ['shadow_essence', 'shadow_core'],
        useLines: ['shadow_series', 'shadow_legion'],
        precursorTo: ElementLine.VOID,
        purpose: '虛空前置，不能直接給完整 void 終局效果。'
    },
    ancient_ruins: {
        id: 'ancient_ruins',
        levelRange: [31, 37],
        core: ['ancient_gear', 'crystal_shard', 'mithril_ore'],
        rare: ['ancient_rune', 'pure_crystal'],
        useLines: ['mithril_rune', 'ancient_relic'],
        purpose: '遺跡防禦、秘銀、符文與中期穩定裝備。'
    },
    elemental_basic: {
        id: 'elemental_basic',
        levelRange: [38, 45],
        core: ['fire_essence', 'ice_essence', 'thunder_essence', 'earth_essence'],
        rare: ['ember_stone', 'storm_crystal', 'geo_crystal', 'elemental_core'],
        useLines: ['elemental_series'],
        purpose: '四基礎元素主力期。'
    },
    jungle_poison: {
        id: 'jungle_poison',
        levelRange: [46, 52],
        core: ['poison_gland', 'carnivore_seed', 'life_seed', 'vine_core'],
        rare: ['hydra_scale', 'hydra_fang', 'primal_essence'],
        useLines: ['jungle_series', 'hydra_venom'],
        purpose: '毒、生命、續戰與九頭蛇裝備。'
    },
    life_vine: {
        id: 'life_vine',
        levelRange: [46, 52],
        core: ['vine_core', 'life_seed', 'ancient_bark'],
        rare: ['forest_essence', 'primal_essence'],
        useLines: ['jungle_series', 'forest_guardian'],
        purpose: '叢林生命、續戰與回復型裝備素材。'
    },
    primal_seed: {
        id: 'primal_seed',
        levelRange: [46, 60],
        core: ['primal_essence', 'primordial_stone'],
        rare: ['legendary_shard'],
        useLines: ['titan', 'hydra_venom', 'dragon_scale'],
        purpose: '中後期跨群落的原始力量素材，支撐副本挑戰前準備。'
    },
    dragon_bone_scale: {
        id: 'dragon_bone_scale',
        levelRange: [53, 60],
        core: ['wyvern_scale', 'wyvern_wing', 'drake_scale', 'dragon_tooth'],
        rare: ['dragon_heart', 'elder_dragon_scale', 'dragon_scale_armor'],
        useLines: ['dragon_scale', 'dragon_slayer'],
        purpose: '龍系長柄、防具、飾品與古龍 Boss 裝。'
    },
    abyss_void: {
        id: 'abyss_void',
        levelRange: [61, 70],
        core: ['demon_horn', 'demonic_steel', 'abyssal_shard', 'demon_core'],
        rare: ['void_essence', 'world_shard', 'demon_general_helm'],
        useLines: ['abyss_series', 'demon_lord', 'void_tower'],
        precursorTo: ElementLine.VOID,
        purpose: '深淵與虛空前兆，完整虛空仍由塔控制。'
    },
    demon_core: {
        id: 'demon_core',
        levelRange: [61, 70],
        core: ['demon_core', 'demon_horn', 'demonic_steel'],
        rare: ['demon_general_helm', 'abyssal_shard'],
        useLines: ['demon_lord', 'abyss_series'],
        purpose: '惡魔高階素材群，連接地獄副本與深淵前兆裝備。'
    },
    world_shard: {
        id: 'world_shard',
        levelRange: [61, 80],
        core: ['world_shard'],
        rare: ['void_essence', 'radiant_core'],
        useLines: ['abyss_series', 'void_tower', 'radiant_series'],
        purpose: '終局跨系統素材，作為深淵、光明與塔裝備的高門檻材料。'
    },
    radiant_light: {
        id: 'radiant_light',
        levelRange: [70, 80],
        status: ContentStatus.EXISTING,
        core: ['radiant_thread', 'light_essence'],
        rare: ['radiant_shard', 'radiant_core'],
        useLines: ['radiant_series'],
        purpose: '正式光明素材，只能由 Lv70 光明副本穩定取得。'
    },
    tower_void: {
        id: 'tower_void',
        levelRange: [70, 80],
        core: ['void_essence', 'abyssal_shard', 'world_shard'],
        rare: ['legendary_shard'],
        useLines: ['void_tower'],
        purpose: '完整虛空留在塔與 DLC 壓力線，避免本篇暗影自然升成畢業虛空。'
    }
});

export const DungeonProgressionDatabase = Object.freeze({
    [DungeonType.CAVE]: {
        id: DungeonType.CAVE,
        targetLevelRange: [5, 10],
        role: 'first_high_risk_reward',
        mechanics: ['darkness', 'ambush', 'ore_pressure'],
        commonMonsters: ['cave_bat', 'cave_spider', 'cave_rat'],
        eliteMonsters: ['shadow_lurker'],
        bossMonsters: ['rock_golem'],
        rewardLines: ['cave_miner', 'spider_venom'],
        materialGroups: ['cave_ore', 'spider_venom'],
        blockedDrops: ['shadow_shard', 'void_essence', 'light_essence'],
        dataActions: [
            'Raise gameplay pressure from tutorial cave to real Lv5-10 farm route.',
            'Add cave equipment rewards before generating cave art.'
        ]
    },
    [DungeonType.SNOW]: {
        id: DungeonType.SNOW,
        targetLevelRange: [16, 23],
        role: 'cold_durability_pressure',
        mechanics: ['cold', 'supply_pressure', 'slow_control'],
        commonMonsters: ['frost_wolf', 'yeti_scout', 'ice_elemental'],
        eliteMonsters: ['frost_giant'],
        bossMonsters: ['ice_dragon'],
        rewardLines: ['early_frost', 'lich_relic'],
        materialGroups: ['frost_core', 'glimmer_seed'],
        blockedDrops: ['shadow_shard', 'void_essence', 'light_essence'],
        dataActions: [
            'Keep cold-resist rewards useful beyond a single quest.',
            'Add frost equipment and blueprint routes.'
        ]
    },
    [DungeonType.RUINS]: {
        id: DungeonType.RUINS,
        targetLevelRange: [28, 37],
        role: 'rune_defense_and_glimmer_bridge',
        mechanics: ['puzzle', 'trap', 'defense_protocol'],
        commonMonsters: ['stone_guardian', 'animated_armor', 'phantom'],
        eliteMonsters: ['ancient_mage'],
        bossMonsters: ['ancient_guardian'],
        rewardLines: ['mithril_rune', 'glimmer_initiate', 'shadow_legion'],
        materialGroups: ['ancient_ruins', 'glimmer_seed', 'shadow_legion'],
        blockedDrops: ['void_essence', 'light_essence'],
        dataActions: [
            'Move ruins to the Lv28-37 pressure band.',
            'Add glimmer/rune equipment without using full light effects.'
        ]
    },
    [DungeonType.JUNGLE]: {
        id: DungeonType.JUNGLE,
        targetLevelRange: [42, 52],
        role: 'poison_life_sustain_reward_route',
        mechanics: ['maze', 'poison', 'marking_route'],
        commonMonsters: ['jungle_panther', 'poison_frog', 'vine_beast', 'tribal_hunter'],
        eliteMonsters: ['ancient_treant'],
        bossMonsters: ['jungle_hydra'],
        rewardLines: ['jungle_series', 'hydra_venom'],
        materialGroups: ['jungle_poison'],
        blockedDrops: ['light_essence'],
        dataActions: [
            'Add dungeon-specific equipment so jungle is not only a material warehouse.',
            'Tie poison and life sustain rewards to maze/poison pressure.'
        ]
    },
    [DungeonType.HELL]: {
        id: DungeonType.HELL,
        targetLevelRange: [56, 66],
        role: 'final_preparation_and_abyss_pressure',
        mechanics: ['burn', 'durability_pressure', 'curse'],
        commonMonsters: ['imp', 'hell_hound', 'tormented_soul', 'lava_golem'],
        eliteMonsters: ['pit_fiend'],
        bossMonsters: ['demon_king'],
        rewardLines: ['abyss_series', 'demon_lord'],
        materialGroups: ['abyss_void', 'elemental_basic'],
        blockedDrops: ['light_essence'],
        dataActions: [
            'Retarget hell from old Lv45 endpoint to Lv56-66.',
            'Use abyss rewards as controlled void precursor, not full tower void.'
        ]
    },
    radiant_corridor: {
        id: 'radiant_corridor',
        status: ContentStatus.EXISTING,
        targetLevelRange: [70, 80],
        role: 'light_counter_to_tower_void',
        mechanics: ['rhythm_growth', 'void_cleanse', 'mirror_counter'],
        commonMonsters: ['prism_wisp', 'dawn_sentinel'],
        eliteMonsters: ['radiant_keeper', 'mirror_seraph'],
        bossMonsters: ['aurora_archon'],
        rewardLines: ['radiant_series'],
        materialGroups: ['radiant_light'],
        blockedDrops: [],
        dataActions: [
            'Add as postgame dungeon before Tower DLC pressure becomes normal.',
            'Do not convert glimmer into light automatically.'
        ]
    }
});

export const PlannedMonsterDatabase = Object.freeze({
    glimmer_sprite: {
        id: 'glimmer_sprite',
        status: ContentStatus.EXISTING,
        name: '微光靈',
        type: MonsterType.NORMAL,
        element: ElementLine.GLIMMER,
        targetLevel: 19,
        role: 'early_glimmer_source',
        drops: ['glimmer_shard', 'rune_stone'],
        artTier: 'normal'
    },
    rune_wisp: {
        id: 'rune_wisp',
        status: ContentStatus.EXISTING,
        name: '符文微靈',
        type: MonsterType.NORMAL,
        element: ElementLine.GLIMMER,
        targetLevel: 22,
        role: 'rune_bridge',
        drops: ['glimmer_shard', 'pure_crystal'],
        artTier: 'normal'
    },
    prism_wisp: {
        id: 'prism_wisp',
        status: ContentStatus.EXISTING,
        name: '棱光微靈',
        type: MonsterType.NORMAL,
        element: ElementLine.GLIMMER,
        targetLevel: 40,
        role: 'late_glimmer_hint',
        drops: ['glimmer_shard', 'rune_stone'],
        artTier: 'normal'
    },
    starvein_lurker: {
        id: 'starvein_lurker',
        status: ContentStatus.EXISTING,
        name: '星脈潛伏者',
        type: MonsterType.ELITE,
        element: ElementLine.GLIMMER,
        targetLevel: 49,
        role: 'jungle_glimmer_elite',
        drops: ['glimmer_shard', 'primal_essence'],
        artTier: 'elite'
    },
    void_walker: {
        id: 'void_walker',
        status: ContentStatus.EXISTING,
        name: '虛痕行者',
        type: MonsterType.NORMAL,
        element: ElementLine.SHADOW,
        targetLevel: 64,
        role: 'void_precursor_normal',
        drops: ['abyssal_shard', 'void_essence'],
        artTier: 'normal'
    },
    abyssal_seraph: {
        id: 'abyssal_seraph',
        status: ContentStatus.EXISTING,
        name: '深淵偽翼',
        type: MonsterType.ELITE,
        element: ElementLine.VOID,
        targetLevel: 68,
        role: 'void_precursor_elite',
        drops: ['abyssal_shard', 'world_shard'],
        artTier: 'elite'
    },
    dawn_sentinel: {
        id: 'dawn_sentinel',
        status: ContentStatus.EXISTING,
        name: '黎明衛士',
        type: MonsterType.NORMAL,
        element: ElementLine.LIGHT,
        targetLevel: 70,
        role: 'radiant_defense_check',
        drops: ['radiant_thread', 'light_essence'],
        artTier: 'normal'
    },
    radiant_keeper: {
        id: 'radiant_keeper',
        status: ContentStatus.EXISTING,
        name: '光明守藏者',
        type: MonsterType.ELITE,
        element: ElementLine.LIGHT,
        targetLevel: 72,
        role: 'radiant_blueprint_source',
        drops: ['light_essence', 'radiant_shard'],
        artTier: 'elite'
    },
    mirror_seraph: {
        id: 'mirror_seraph',
        status: ContentStatus.EXISTING,
        name: '鏡翼熾使',
        type: MonsterType.ELITE,
        element: ElementLine.LIGHT,
        targetLevel: 74,
        role: 'crit_speed_counter',
        drops: ['radiant_shard', 'light_essence'],
        artTier: 'elite'
    },
    aurora_archon: {
        id: 'aurora_archon',
        status: ContentStatus.EXISTING,
        name: '極光執政官',
        type: MonsterType.BOSS,
        element: ElementLine.LIGHT,
        targetLevel: 76,
        role: 'radiant_corridor_boss',
        drops: ['radiant_core', 'radiant_shard'],
        artTier: 'boss-side'
    }
});

export const PlannedMaterialDatabase = Object.freeze({
    vine_core: {
        id: 'vine_core',
        status: ContentStatus.EXISTING,
        name: '藤心核心',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        targetLevelRange: [46, 52],
        sourceIds: ['vine_beast', 'ancient_treant'],
        useLines: ['jungle_series', 'hydra_venom'],
        purpose: '叢林生命與續戰裝備核心素材。'
    },
    demon_core: {
        id: 'demon_core',
        status: ContentStatus.EXISTING,
        name: '魔族核心',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        targetLevelRange: [61, 70],
        sourceIds: ['demon_general', 'demon_king'],
        useLines: ['demon_lord', 'abyss_series'],
        purpose: '地獄與惡魔裝備的高階轉化素材。'
    },
    radiant_thread: {
        id: 'radiant_thread',
        status: ContentStatus.EXISTING,
        name: '輝光絲',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        targetLevelRange: [70, 80],
        sourceIds: ['prism_wisp', 'dawn_sentinel'],
        useLines: ['radiant_series'],
        purpose: '光明副本低階配方與微光裝備修復前置。'
    },
    light_essence: {
        id: 'light_essence',
        status: ContentStatus.EXISTING,
        name: '光明精華',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        targetLevelRange: [70, 80],
        sourceIds: ['radiant_keeper', 'mirror_seraph'],
        useLines: ['radiant_series'],
        purpose: '正式光明系武器、防具與飾品主要素材。'
    },
    radiant_shard: {
        id: 'radiant_shard',
        status: ContentStatus.EXISTING,
        name: '曦光碎晶',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        targetLevelRange: [70, 80],
        sourceIds: ['radiant_keeper', 'mirror_seraph', 'aurora_archon'],
        useLines: ['radiant_series'],
        purpose: '光明系強化、重鑄與抗塔詞綴。'
    },
    radiant_core: {
        id: 'radiant_core',
        status: ContentStatus.EXISTING,
        name: '極光核心',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.LEGENDARY,
        targetLevelRange: [70, 80],
        sourceIds: ['aurora_archon'],
        useLines: ['radiant_series'],
        purpose: '光明副本 Boss 素材，用於終局光明裝備。'
    }
});

export function getContentLevelBandForLevel(level) {
    const numeric = Number(level) || 1;
    return ContentLevelBandDatabase.find(band => numeric >= band.levelRange[0] && numeric <= band.levelRange[1]) || null;
}

export function getEquipmentLinesForBand(bandId) {
    const band = ContentLevelBandDatabase.find(entry => entry.id === bandId);
    if (!band) return [];
    return band.equipmentLines.map(lineId => EquipmentLineDatabase[lineId]).filter(Boolean);
}

export function getMaterialGroupsForBand(bandId) {
    const band = ContentLevelBandDatabase.find(entry => entry.id === bandId);
    if (!band) return [];
    return band.materialGroups.map(groupId => MaterialGroupDatabase[groupId]).filter(Boolean);
}

export function getDungeonProgression(dungeonId) {
    return DungeonProgressionDatabase[dungeonId] || null;
}

export function getPlannedMonster(monsterId) {
    return PlannedMonsterDatabase[monsterId] || null;
}

export function getPlannedMaterial(materialId) {
    return PlannedMaterialDatabase[materialId] || null;
}

export function listPlannedContentGaps() {
    return {
        equipmentLines: Object.values(EquipmentLineDatabase).filter(entry => entry.status === ContentStatus.PLANNED),
        monsters: Object.values(PlannedMonsterDatabase).filter(entry => entry.status !== ContentStatus.EXISTING),
        materials: Object.values(PlannedMaterialDatabase).filter(entry => entry.status !== ContentStatus.EXISTING),
        dungeons: Object.values(DungeonProgressionDatabase).filter(entry => entry.status === ContentStatus.PLANNED)
    };
}
