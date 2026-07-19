import { AffixStat, EquipmentType, ItemRarity, WeaponForm } from '../models/Enums.js';

// Migration overrides for chapters not yet normalized into their owning data.
// Chapter 1 loot is canonical in Monsters.js and BlueprintDrops.js.
export const FirstRunMonsterLootOverrides = Object.freeze({
    orc_warrior: { drops: [{ itemId: 'orc_fang', chance: 0.38, quantity: [1, 1] }, { itemId: 'raw_meat', chance: 0.24, quantity: [1, 1] }] },
    ghost: { drops: [{ itemId: 'ectoplasm', chance: 0.36, quantity: [1, 1] }, { itemId: 'soul_fragment', chance: 0.12, quantity: [1, 1] }] },
    rune_wisp: { drops: [{ itemId: 'glimmer_shard', chance: 0.30, quantity: [1, 1] }, { itemId: 'rune_stone', chance: 0.18, quantity: [1, 1] }] },
    shadow_soldier: { drops: [{ itemId: 'shadow_shard', chance: 0.32, quantity: [1, 1] }, { itemId: 'expedition_steel_fragment', chance: 0.24, quantity: [1, 1] }] },
    shadow_archer: { drops: [{ itemId: 'shadow_arrow', chance: 0.30, quantity: [2, 4] }, { itemId: 'expedition_steel_fragment', chance: 0.20, quantity: [1, 1] }] },
    shadow_halberdier: { drops: [{ itemId: 'dark_steel', chance: 0.16, quantity: [1, 1] }, { itemId: 'expedition_steel_fragment', chance: 0.26, quantity: [1, 1] }] },
    shadow_mage: { drops: [{ itemId: 'cursed_shard', chance: 0.12, quantity: [1, 1] }, { itemId: 'magic_crystal', chance: 0.18, quantity: [1, 1] }] },
    rune_keeper: { drops: [{ itemId: 'ancient_rune', chance: 0.30, quantity: [1, 1] }, { itemId: 'rune_stone', chance: 0.20, quantity: [1, 1] }] },
    ancient_titan: { drops: [{ itemId: 'titan_heart', chance: 1, quantity: [1, 1] }, { itemId: 'primordial_stone', chance: 0.32, quantity: [1, 1] }, { itemId: 'earth_essence', chance: 0.12, quantity: [1, 1] }, { itemId: 'ember_stone', chance: 1, quantity: [1, 1] }] },
    crystal_golem: { drops: [{ itemId: 'crystal_shard', chance: 0.40, quantity: [1, 2] }, { itemId: 'mithril_ore', chance: 0.10, quantity: [1, 1] }] },
    ember_beast: { drops: [{ itemId: 'ember_stone', chance: 0.22, quantity: [1, 1] }, { itemId: 'lava_scale', chance: 0.08, quantity: [1, 1] }] },
    starvein_lurker: { drops: [{ itemId: 'vine_core', chance: 0.36, quantity: [1, 1] }, { itemId: 'primal_essence', chance: 0.14, quantity: [1, 1] }] },
    elemental_lord: { drops: [{ itemId: 'elemental_core', chance: 1, quantity: [1, 1] }, { itemId: 'primal_essence', chance: 0.45, quantity: [1, 1] }, { itemId: 'fire_essence', chance: 0.18, quantity: [1, 1] }, { itemId: 'molten_core', chance: 0.08, quantity: [1, 1] }] },
    drake: { drops: [{ itemId: 'drake_scale', chance: 0.42, quantity: [1, 2] }, { itemId: 'dragon_tooth', chance: 0.24, quantity: [1, 1] }] },
    elder_dragon: { drops: [{ itemId: 'dragon_heart', chance: 1, quantity: [1, 1] }, { itemId: 'elder_dragon_scale', chance: 0.55, quantity: [1, 1] }, { itemId: 'dragon_tooth', chance: 0.30, quantity: [1, 1] }] },
    lich: { drops: [{ itemId: 'lich_phylactery', chance: 1, quantity: [1, 1] }, { itemId: 'glimmer_shard', chance: 0.25, quantity: [1, 1] }, { itemId: 'frost_crystal', chance: 1, quantity: [1, 1] }] },
    drowned_oracle: { drops: [{ itemId: 'ancient_rune', chance: 0.25, quantity: [1, 1] }, { itemId: 'storm_crystal', chance: 1, quantity: [1, 1] }] },
    demon_lord_asariel: { drops: [{ itemId: 'demon_core', chance: 1, quantity: [1, 1] }, { itemId: 'world_shard', chance: 1, quantity: [1, 1] }] }
});

export const FirstRunBlueprintDropOverrides = Object.freeze({
    skeleton: [],
    skeleton_warrior: [{ recipeId: 'bone_etched_lance' }],
    cave_bat: [],
    ghost: [],
    glimmer_sprite: [],
    rune_wisp: [{ recipeId: 'glimmer_focus' }],
    lich: [],
    shadow_soldier: [{ recipeId: 'shadow_armor' }],
    shadow_archer: [{ recipeId: 'curse_iron_warhammer' }],
    shadow_mage: [], shadow_commander: [], ancient_guardian: [],
    stone_golem: [],
    rune_keeper: [{ recipeId: 'leyline_wedge_lance' }],
    ancient_titan: [], ice_elemental: [],
    thunder_elemental: [{ recipeId: 'stormguide_focus' }],
    storm_raptor: [],
    fire_elemental: [{ recipeId: 'embercore_focus' }],
    poison_frog: [],
    vine_beast: [],
    starvein_lurker: [], elemental_lord: [],
    cliffscale_hatchling: [{ recipeId: 'cliffscale_skinner' }],
    crystal_golem: [],
    earth_elemental: [{ recipeId: 'earthwarden_aegis' }],
    thorn_witch: [],
    sealstone_guardian: [{ recipeId: 'sealstone_ram' }],
    dragon_seal_sentinel: [],
    wyvern: [],
    drake: [],
    dragon_knight: [], elder_dragon: [],
    lava_golem: [{ recipeId: 'molten_core_maul' }],
    hell_hound: [],
    tormented_soul: [{ recipeId: 'soul_lantern_focus' }],
    shadow_assassin: [],
    shadow_general: [],
    demon_general: [], demon_lord_asariel: []
});

const status = 'source_locked_stats_provisional';
const directWeapon = (id, name, form, rarity, level, stats, effects, dropFrom) => ({ id, name, icon: '⚔️', type: EquipmentType.WEAPON, weaponForm: form, rarity, level, stats, specialEffects: effects, setId: null, description: name, dropFrom: [dropFrom], sourceChapter: Math.ceil(level / 10), balanceStatus: status });
const directGear = (id, name, type, rarity, level, stats, effects, dropFrom) => ({ id, name, icon: type === EquipmentType.ACCESSORY ? '◉' : '◆', type, rarity, level, stats, specialEffects: effects, setId: null, description: name, dropFrom: [dropFrom], sourceChapter: Math.ceil(level / 10), balanceStatus: status });

export const FirstRunEquipmentAdditions = Object.freeze({
    dragonseal_forkstaff: directWeapon('dragonseal_forkstaff', '龍封叉杖', WeaponForm.FOCUS, ItemRarity.EPIC, 58, { attack: 66, defense: 18, critChance: 0.12, critDamage: 1.9, weaponSpeed: 1.02, attackSpeed: 1.02 }, [{ type: AffixStat.DAMAGE_REDUCTION, value: 6 }], 'dragon_seal_adept'),
    frostwolf_mantle: directGear('frostwolf_mantle', '霜狼披肩', EquipmentType.EQUIPMENT, ItemRarity.RARE, 44, { attack: 4, defense: 48, hp: 90, critChance: 0.04, critDamage: 1.4 }, [{ type: AffixStat.ICE, value: 8 }], 'frost_wolf'),
    stormfeather_talisman: directGear('stormfeather_talisman', '風暴羽符', EquipmentType.ACCESSORY, ItemRarity.RARE, 46, { attack: 18, defense: 18, hp: 55, critChance: 0.07, critDamage: 1.55 }, [{ type: AffixStat.THUNDER, value: 8 }], 'storm_raptor'),
    dragonseal_patrol_plate: directGear('dragonseal_patrol_plate', '龍封巡甲', EquipmentType.EQUIPMENT, ItemRarity.EPIC, 56, { attack: 9, defense: 72, hp: 125, critChance: 0.04, critDamage: 1.45 }, [{ type: AffixStat.DAMAGE_REDUCTION, value: 7 }], 'dragon_seal_sentinel'),
    miasma_needle_focus: directWeapon('miasma_needle_focus', '瘴液針杖', WeaponForm.FOCUS, ItemRarity.RARE, 47, { attack: 45, defense: 13, critChance: 0.11, critDamage: 1.75, weaponSpeed: 1.06, attackSpeed: 1.06 }, [{ type: AffixStat.POISON, value: 10 }], 'poison_frog')
});

export const FirstRunBandAllocationPlan = Object.freeze({
    1: Object.freeze({ baselineCraft: Object.freeze(['slime_series_sword', 'slime_series_dagger', 'slime_series_hammer', 'slime_series_spear', 'slime_series_staff']), directEquipment: Object.freeze(['slime_sword', 'wolf_fang_blade', 'spider_silk_gloves']), specialCraft: Object.freeze(['poison_dagger', 'silver_thread_hook']), bossEquipment: Object.freeze(['forest_guardian_staff', 'forest_guardian_crown']), questUnique: Object.freeze(['wolf_fang_necklace']) }),
    2: Object.freeze({ baselineCraft: Object.freeze(['bone_series_sword', 'bone_series_dagger', 'bone_series_hammer', 'bone_series_spear', 'bone_series_staff']), directEquipment: Object.freeze(['undead_dagger', 'rune_scriber_focus']), specialCraft: Object.freeze(['bone_etched_lance', 'glimmer_focus']), bossEquipment: Object.freeze(['lich_staff']), questUnique: Object.freeze([]) }),
    3: Object.freeze({ baselineCraft: Object.freeze(['expedition_series_sword', 'expedition_series_dagger', 'expedition_series_hammer', 'expedition_series_spear', 'expedition_series_staff']), directEquipment: Object.freeze(['shadow_blade_drop', 'shadowneedle_dagger', 'shade_focus']), specialCraft: Object.freeze(['shadow_armor', 'curse_iron_warhammer']), bossEquipment: Object.freeze(['shadow_commander_blade']), questUnique: Object.freeze([]) }),
    4: Object.freeze({ baselineCraft: Object.freeze(['runic_series_sword', 'runic_series_dagger', 'runic_series_hammer', 'runic_series_spear', 'runic_series_staff']), directEquipment: Object.freeze(['ancient_sword', 'crystal_shield']), specialCraft: Object.freeze(['earthwarden_aegis', 'leyline_wedge_lance']), bossEquipment: Object.freeze(['titan_hammer', 'titan_gauntlet']), questUnique: Object.freeze([]) }),
    5: Object.freeze({ baselineCraft: Object.freeze(['fourfold_series_sword', 'fourfold_series_dagger', 'fourfold_series_hammer', 'fourfold_series_spear', 'fourfold_series_staff']), directEquipment: Object.freeze(['frostwolf_mantle', 'stormfeather_talisman', 'miasma_needle_focus']), specialCraft: Object.freeze(['embercore_focus', 'stormguide_focus']), bossEquipment: Object.freeze(['elemental_orb', 'elemental_crown']), questUnique: Object.freeze([]) }),
    6: Object.freeze({ baselineCraft: Object.freeze(['sealstone_series_sword', 'sealstone_series_dagger', 'sealstone_series_hammer', 'sealstone_series_spear', 'sealstone_series_staff']), directEquipment: Object.freeze(['wyvern_lance', 'dragonseal_patrol_plate', 'dragonseal_forkstaff']), specialCraft: Object.freeze(['cliffscale_skinner', 'sealstone_ram']), bossEquipment: Object.freeze(['elder_dragon_fang', 'elder_dragon_fang_badge']), questUnique: Object.freeze([]) }),
    7: Object.freeze({ baselineCraft: Object.freeze(['helliron_series_sword', 'helliron_series_dagger', 'helliron_series_hammer', 'helliron_series_spear', 'helliron_series_staff']), directEquipment: Object.freeze(['demon_blade', 'assassin_blade', 'demon_general_armor']), specialCraft: Object.freeze(['molten_core_maul', 'soul_lantern_focus']), bossEquipment: Object.freeze(['demon_lord_sword', 'demon_lord_crown']), questUnique: Object.freeze([]) })
});

// Obsolete first-run rewards are removed from acquisition and recipe registries.
// Their art may remain until the dedicated asset cleanup decides whether it can be reused.
export const FirstRunRetiredRecipeIds = Object.freeze([
    'assassin_shadow_veil', 'bone_blade', 'bone_soul_staff', 'demonwar_helm',
    'dragon_amulet', 'dragon_overlord_crown',
    'dragon_scale_armor', 'dragon_slayer', 'frostbound_scepter', 'hellfire_blade_lance',
    'gargoyle_bulwark', 'guardian_armor', 'hydra_fang_dagger', 'ice_sword',
    'iron_sword', 'miasma_needle_focus',
    'mithril_sword', 'nature_amulet', 'primal_focus', 'shadow_blade',
    'shadow_ring', 'slime_crown_ring', 'storm_spear', 'titan_armor', 'titan_blade', 'titan_ring',
    'wolf_cloak', 'wyvern_scale_mail'
]);

export const FirstRunBossSignatureOverrides = Object.freeze({
    forest_guardian_staff: { rarity: ItemRarity.LEGENDARY, rewardRole: 'boss_signature', sourceChapter: 1 },
    lich_staff: { rarity: ItemRarity.LEGENDARY, rewardRole: 'boss_signature', sourceChapter: 2 },
    shadow_commander_blade: { rarity: ItemRarity.LEGENDARY, rewardRole: 'boss_signature', sourceChapter: 3 },
    titan_hammer: { rarity: ItemRarity.LEGENDARY, rewardRole: 'boss_signature', sourceChapter: 4 },
    elemental_orb: { rarity: ItemRarity.LEGENDARY, rewardRole: 'boss_signature', sourceChapter: 5 },
    elder_dragon_fang: { rarity: ItemRarity.LEGENDARY, rewardRole: 'boss_signature', sourceChapter: 6 },
    demon_lord_sword: { rarity: ItemRarity.LEGENDARY, rewardRole: 'boss_signature', sourceChapter: 7 }
});

export const FirstRunEquipmentSourceOverrides = Object.freeze({
    goblin_dagger: [],
    miners_pickhammer: [],
    ghost_cloak: [],
    glimmer_lampstaff: [],
    wolf_fang_blade: ['wild_wolf'],
    wolf_pelt_armor: [],
    forest_guardian_staff: ['forest_guardian'],
    forest_guardian_crown: [],
    tower_guardian_staff: ['tower_forest_guardian'],
    shadow_blade_drop: ['shadow_soldier'],
    shadow_armor_drop: [],
    shadowneedle_dagger: ['shadow_archer'],
    shade_focus: ['shadow_mage'],
    shadow_commander_blade: ['shadow_commander'],
    shadow_commander_sword: [],
    umbral_pike: [],
    rune_badge: [],
    titan_hammer: ['ancient_titan'],
    titan_gauntlet: [],
    flame_sword: [],
    frost_blade: [],
    thunder_axe: [],
    thornhook_claws: [],
    miasma_needle_focus: ['poison_frog'],
    elemental_orb: ['elemental_lord'],
    elemental_badge: [],
    elemental_crown: [],
    elder_dragon_fang: ['elder_dragon'],
    sealstone_bulwark: [],
    dragon_knight_helm: [],
    elder_dragon_fang_badge: [],
    demon_lord_sword: ['demon_lord_asariel'],
    hellhound_collar: [],
    demon_lord_crown: [],
    demon_lord_armor: []
});

const recipe = (id, name, form, rarity, level, materials, stats, effects, cost) => ({
    id, name, icon: '⚔️', type: EquipmentType.WEAPON, weaponForm: form, rarity, materials, cost, successRate: 100,
    result: { id: `crafted_${id}`, name, icon: '⚔️', type: EquipmentType.WEAPON, weaponForm: form, rarity, stats, specialEffects: effects, setId: null, desc: name, sourceChapter: Math.ceil(level / 10), balanceStatus: status }
});

export const FirstRunRecipeLevels = Object.freeze({ bone_etched_lance: 19, curse_iron_warhammer: 28, leyline_wedge_lance: 38, embercore_focus: 45, stormguide_focus: 46, cliffscale_skinner: 53, sealstone_ram: 56, molten_core_maul: 65, soul_lantern_focus: 66 });
export const FirstRunRecipeDiscoveryAdditions = Object.freeze({
    bone_etched_lance: { source: '骷髏戰士掉落', clue: '骨甲接合處藏有長柄武器的骨紋配置。', interactionId: 'monster_blueprint_drop' },
    curse_iron_warhammer: { source: '暗影弓手掉落', clue: '暗影部隊攜帶的咒鐵鍛造頁能將暗影碎片用於重鎚。', interactionId: 'monster_blueprint_drop' },
    leyline_wedge_lance: { source: '符文看守掉落', clue: '看守者的地脈定位圖同時記錄了楔槍結構。', interactionId: 'strong_blueprint_drop' },
    embercore_focus: { source: '火元素掉落', clue: '穩定燼核的法器框架藏在火元素殘留的結晶層中。', interactionId: 'monster_blueprint_drop' },
    stormguide_focus: { source: '雷元素掉落', clue: '導引雷流的分叉結構可從雷元素核心紋路還原。', interactionId: 'monster_blueprint_drop' },
    cliffscale_skinner: { source: '崖鱗幼體掉落', clue: '鱗片剝離痕跡提供了短刃的正確刃角。', interactionId: 'monster_blueprint_drop' },
    sealstone_ram: { source: '封石守衛掉落', clue: '守衛內部的撞擊配重圖能重建封石重槌。', interactionId: 'monster_blueprint_drop' },
    molten_core_maul: { source: '熔岩魔像掉落', clue: '熔核外殼保留了重鎚頭的耐熱分層。', interactionId: 'monster_blueprint_drop' },
    soul_lantern_focus: { source: '受難魂靈掉落', clue: '殘缺燈架記錄了約束游離魂質的方法。', interactionId: 'monster_blueprint_drop' },
});

const bossRecipe = (id, name, resultId, bossId, level, materials, cost) => ({
    id, name, resultId, bossId, level, type: 'equipment', rarity: ItemRarity.LEGENDARY,
    materials, cost, successRate: 100, acquisitionRole: 'boss_dungeon_craft',
    unlockMethod: 'boss_clear_system_unlock', canonicalResult: true
});

export const FirstRunBossRecipeAdditions = Object.freeze({
    forge_forest_guardian_crown: bossRecipe('forge_forest_guardian_crown', '森衛枝冠工藝', 'forest_guardian_crown', 'forest_guardian', 13, [{ id: 'guardian_branch', quantity: 1 }, { id: 'forest_essence', quantity: 1 }, { id: 'spider_silk', quantity: 2 }], 360),
    forge_titan_gauntlet: bossRecipe('forge_titan_gauntlet', '巨神護手工藝', 'titan_gauntlet', 'ancient_titan', 40, [{ id: 'titan_heart', quantity: 1 }, { id: 'primordial_stone', quantity: 1 }, { id: 'mithril_ore', quantity: 2 }], 1050),
    forge_elemental_crown: bossRecipe('forge_elemental_crown', '四象靜冠工藝', 'elemental_crown', 'elemental_lord', 50, [{ id: 'elemental_core', quantity: 1 }, { id: 'primal_essence', quantity: 1 }, { id: 'magic_crystal', quantity: 2 }], 1450),
    forge_elder_dragon_badge: bossRecipe('forge_elder_dragon_badge', '古龍牙墜工藝', 'elder_dragon_fang_badge', 'elder_dragon', 60, [{ id: 'dragon_heart', quantity: 1 }, { id: 'elder_dragon_scale', quantity: 1 }, { id: 'drake_scale', quantity: 2 }], 1850),
    forge_demon_lord_crown: bossRecipe('forge_demon_lord_crown', '末焰心核工藝', 'demon_lord_crown', 'demon_lord_asariel', 70, [{ id: 'demon_core', quantity: 1 }, { id: 'demonic_steel', quantity: 2 }, { id: 'molten_core', quantity: 1 }], 2600)
});

export const FirstRunBossRecipeDiscoveries = Object.freeze({
    forge_forest_guardian_crown: { source: '森林守護者擊破', clue: '守護者倒下後，鐵匠能依枝杖結構還原枝冠。', interactionId: 'boss_clear_forest_guardian' },
    forge_titan_gauntlet: { source: '遠古泰坦擊破', clue: '泰坦之心與護腕殘構共同解鎖巨神護手工藝。', interactionId: 'boss_clear_ancient_titan' },
    forge_elemental_crown: { source: '元素領主擊破', clue: '穩定四象核心後，鐵匠能重建四象靜冠。', interactionId: 'boss_clear_elemental_lord' },
    forge_elder_dragon_badge: { source: '上古龍擊破', clue: '龍心與完整古龍鱗能重建古龍牙墜。', interactionId: 'boss_clear_elder_dragon' },
    forge_demon_lord_crown: { source: '魔王擊破', clue: '末焰核心穩定後，才能鍛成與末焰刃成套的心核。', interactionId: 'boss_clear_demon_lord_asariel' }
});

export const FirstRunBossCraftUnlocks = Object.freeze({
    forest_guardian: Object.freeze(['forge_forest_guardian_crown']),
    ancient_titan: Object.freeze(['forge_titan_gauntlet']),
    elemental_lord: Object.freeze(['forge_elemental_crown']),
    elder_dragon: Object.freeze(['forge_elder_dragon_badge']),
    demon_lord_asariel: Object.freeze(['forge_demon_lord_crown'])
});
export const FirstRunRecipeAdditions = Object.freeze({
    bone_etched_lance: recipe('bone_etched_lance', '骨紋長槍', WeaponForm.LANCE, ItemRarity.RARE, 19, [{ id: 'bone_fragment', quantity: 5 }, { id: 'iron_ore', quantity: 2 }, { id: 'rune_stone', quantity: 1 }], { attack: 26, defense: 4, critChance: 0.10, critDamage: 1.75, weaponSpeed: 0.94, attackSpeed: 0.94 }, [{ type: AffixStat.ARMOR_PENETRATION, value: 5 }], 260),
    curse_iron_warhammer: recipe('curse_iron_warhammer', '咒鐵戰鎚', WeaponForm.HEAVY, ItemRarity.RARE, 28, [{ id: 'cursed_shard', quantity: 1 }, { id: 'dark_steel', quantity: 3 }, { id: 'iron_ore', quantity: 2 }], { attack: 38, defense: 7, critChance: 0.08, critDamage: 1.9, weaponSpeed: 0.76, attackSpeed: 0.76 }, [{ type: AffixStat.ARMOR_PENETRATION, value: 7 }], 520),
    leyline_wedge_lance: recipe('leyline_wedge_lance', '地脈楔槍', WeaponForm.LANCE, ItemRarity.EPIC, 38, [{ id: 'mithril_ore', quantity: 3 }, { id: 'rune_stone', quantity: 2 }, { id: 'earth_essence', quantity: 1 }], { attack: 49, defense: 9, critChance: 0.10, critDamage: 1.9, weaponSpeed: 0.92, attackSpeed: 0.92 }, [{ type: AffixStat.STUN_CHANCE, value: 7 }], 820),
    embercore_focus: recipe('embercore_focus', '燼核法器', WeaponForm.FOCUS, ItemRarity.RARE, 45, [{ id: 'ember_stone', quantity: 2 }, { id: 'fire_essence', quantity: 3 }, { id: 'magic_crystal', quantity: 1 }], { attack: 49, defense: 12, critChance: 0.12, critDamage: 1.8, weaponSpeed: 1.04, attackSpeed: 1.04 }, [{ type: AffixStat.FIRE, value: 14 }], 1100),
    stormguide_focus: recipe('stormguide_focus', '鳴雷導杖', WeaponForm.FOCUS, ItemRarity.RARE, 46, [{ id: 'storm_crystal', quantity: 2 }, { id: 'thunder_essence', quantity: 3 }, { id: 'magic_crystal', quantity: 1 }], { attack: 47, defense: 11, critChance: 0.15, critDamage: 1.8, weaponSpeed: 1.08, attackSpeed: 1.08 }, [{ type: AffixStat.THUNDER, value: 14 }], 1100),
    cliffscale_skinner: recipe('cliffscale_skinner', '崖鱗剖刃', WeaponForm.DAGGER, ItemRarity.RARE, 53, [{ id: 'wyvern_scale', quantity: 3 }, { id: 'dragon_tooth', quantity: 1 }, { id: 'mithril_ore', quantity: 2 }], { attack: 59, defense: 4, critChance: 0.20, critDamage: 2.0, weaponSpeed: 1.28, attackSpeed: 1.28 }, [{ type: AffixStat.ARMOR_PENETRATION, value: 9 }], 1450),
    sealstone_ram: recipe('sealstone_ram', '封石撞槌', WeaponForm.HEAVY, ItemRarity.EPIC, 56, [{ id: 'stone_fragment', quantity: 4 }, { id: 'rune_stone', quantity: 2 }, { id: 'drake_scale', quantity: 1 }], { attack: 73, defense: 16, critChance: 0.07, critDamage: 2.05, weaponSpeed: 0.74, attackSpeed: 0.74 }, [{ type: AffixStat.STUN_CHANCE, value: 10 }], 1600),
    molten_core_maul: recipe('molten_core_maul', '熔核重鎚', WeaponForm.HEAVY, ItemRarity.EPIC, 65, [{ id: 'lava_scale', quantity: 3 }, { id: 'molten_core', quantity: 1 }, { id: 'demonic_steel', quantity: 2 }], { attack: 84, defense: 18, critChance: 0.08, critDamage: 2.15, weaponSpeed: 0.72, attackSpeed: 0.72 }, [{ type: AffixStat.FIRE, value: 12 }], 2100),
    soul_lantern_focus: recipe('soul_lantern_focus', '縛魂燈杖', WeaponForm.FOCUS, ItemRarity.EPIC, 66, [{ id: 'soul_fragment', quantity: 3 }, { id: 'cursed_shard', quantity: 1 }, { id: 'magic_crystal', quantity: 2 }], { attack: 74, defense: 22, critChance: 0.13, critDamage: 1.95, weaponSpeed: 1.02, attackSpeed: 1.02 }, [{ type: AffixStat.LIFE_STEAL, value: 5 }], 2200),
});
