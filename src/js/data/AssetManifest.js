const GENERATED_ASSET_BASE = 'src/assets/images/art';
const GENERATED_BACKGROUND_BASE = 'src/assets/images/art/scenes/backgrounds';
const LEGACY_ASSET_BASE = 'src/assets/images/art-v2';
const LEGACY_BACKGROUND_BASE = 'src/assets/images/art-v2/backgrounds';
const GENERATED_ASSET_EXTENSION = 'webp';

const ART_CATEGORY_PATHS = {
    equipment: 'items/equipment',
    materials: 'items/materials',
    blueprints: 'items/blueprints',
    shopItems: 'items/shop-items',
    'shop-items': 'items/shop-items',
    craftedItems: 'items/crafted-items',
    'crafted-items': 'items/crafted-items',
    clues: 'items/clues',
    'town-places': 'scenes/town/places',
    portraits: 'characters/portraits',
    monsters: 'entities/monsters',
    'dungeon-zone-scenes': 'scenes/dungeons/cards',
    'dungeon-zone-scenes-full': 'scenes/dungeons/full',
    'world-landmarks': 'scenes/world/landmarks',
    'world-landmarks-full': 'scenes/world/landmarks-full',
    'map-props': 'scenes/world/props',
    'story-relics': 'items/story-relics',
    'combat-effects': 'effects/combat',
    backgrounds: 'scenes/backgrounds'
};

const ART_READY = {
    equipment: new Set([]),
    materials: new Set([
        'slime_jelly', 'beast_hide', 'raw_meat', 'goblin_ear', 'iron_ore',
        'wolf_pelt', 'wolf_fang', 'spider_silk', 'poison_gland', 'ancient_bark',
        'life_seed', 'guardian_branch', 'forest_essence', 'bone_fragment', 'ectoplasm',
        'spirit_essence', 'golem_core', 'stone_fragment', 'lich_phylactery', 'goblin_coin',
        'orc_fang', 'rat_tail', 'bat_wing', 'iron_shard', 'high_ore',
        'rare_metal', 'forge_core', 'dark_crystal', 'shadow_shard', 'soul_fragment',
        'cursed_shard', 'dark_steel', 'shadow_arrow', 'shadow_essence', 'magic_crystal',
        'commander_blade', 'shadow_core', 'ancient_gear', 'mithril_ore', 'crystal_shard',
        'pure_crystal', 'ancient_rune', 'glimmer_shard', 'rune_stone', 'titan_heart',
        'ancient_artifact', 'fire_essence', 'ember_stone', 'ice_essence', 'frost_crystal',
        'frost_core', 'thunder_essence', 'storm_crystal', 'storm_essence', 'earth_essence'
    ]),
    blueprints: new Set([]),
    shopItems: new Set([]),
    'shop-items': new Set([]),
    craftedItems: new Set([]),
    'crafted-items': new Set([]),
    clues: new Set([]),
    'town-places': new Set([]),
    portraits: new Set([]),
    monsters: new Set([]),
    'dungeon-zone-scenes': new Set([]),
    'dungeon-zone-scenes-full': new Set([]),
    'world-landmarks': new Set([]),
    'world-landmarks-full': new Set([]),
    'map-props': new Set([]),
    'story-relics': new Set([]),
    'combat-effects': new Set([]),
    backgrounds: new Set([])
};

const ART_PATH_OVERRIDES = {
    monsters: {}
};

const LEGACY_CATEGORY_PATHS = {
    shopItems: 'shop-items',
    craftedItems: 'crafted-items'
};

const sets = {
    equipment: new Set([
        'old_sword', 'old_armor', 'slime_sword', 'goblin_dagger', 'wolf_fang_blade',
        'wolf_pelt_armor', 'spider_silk_gloves', 'forest_guardian_staff', 'forest_guardian_crown',
        'bone_sword', 'ghost_cloak', 'lich_staff', 'shadow_blade_drop', 'shadow_armor_drop',
        'shadow_badge', 'shadow_commander_blade', 'ancient_sword', 'crystal_shield',
        'rune_badge', 'titan_hammer', 'flame_sword', 'frost_blade', 'thunder_axe',
        'elemental_badge', 'elemental_crown', 'wyvern_lance', 'dragon_knight_helm',
        'elder_dragon_fang_badge', 'assassin_blade', 'shadow_overlord_armor',
        'demon_blade', 'demon_general_armor', 'demon_lord_sword', 'demon_lord_crown',
        'tower_void_blade', 'tower_void_crown', 'tower_abyss_armor', 'tower_hell_knight_lance',
        'tower_guardian_staff', 'tower_lich_staff', 'shadow_commander_sword', 'titan_gauntlet',
        'elemental_orb', 'elder_dragon_fang', 'overlord_armor', 'demon_lord_armor',
        'boss_goblin_dagger', 'hell_knight_armor', 'abyss_blade', 'boss_void_crown',
        'starter_sword', 'lucky_coin', 'fate_crystal', 'assassin_dagger', 'master_hammer',
        'loaded_dice', 'beggars_wisdom', 'phoenix_feather', 'gamblers_fallacy',
        'demon_contract', 'lucky_charm_7', 'torch', 'bat_wing_cloak', 'frost_crown',
        'guardian_shield', 'compass', 'jungle_heart', 'demon_slayer', 'dungeon_master_badge'
    ]),
    materials: new Set([
        'slime_jelly', 'beast_hide', 'raw_meat', 'goblin_ear', 'iron_ore', 'wolf_pelt',
        'wolf_fang', 'spider_silk', 'poison_gland', 'ancient_bark', 'life_seed',
        'guardian_branch', 'forest_essence', 'bone_fragment', 'ectoplasm', 'spirit_essence',
        'golem_core', 'stone_fragment', 'lich_phylactery', 'goblin_coin', 'orc_fang',
        'rat_tail', 'bat_wing', 'iron_shard', 'high_ore', 'rare_metal', 'forge_core',
        'dark_crystal', 'shadow_shard', 'soul_fragment', 'cursed_shard', 'dark_steel',
        'shadow_arrow', 'shadow_essence', 'magic_crystal', 'commander_blade', 'shadow_core',
        'ancient_gear', 'mithril_ore', 'crystal_shard', 'pure_crystal', 'ancient_rune',
        'glimmer_shard',
        'rune_stone', 'titan_heart', 'ancient_artifact', 'fire_essence', 'ember_stone',
        'ice_essence', 'frost_crystal', 'frost_core', 'thunder_essence', 'storm_crystal',
        'storm_essence', 'earth_essence', 'geo_crystal', 'elemental_core', 'primal_essence',
        'wyvern_scale', 'wyvern_wing', 'drake_scale', 'dragon_tooth', 'dragon_scale_armor',
        'dragon_knight_badge', 'dragon_heart', 'elder_dragon_scale', 'dark_dragon_scale',
        'shadow_cloak_fragment', 'general_armor', 'shadow_insignia', 'overlord_crown',
        'void_essence', 'demon_horn', 'demonic_steel', 'demon_general_helm', 'abyssal_shard',
        'world_shard', 'slime_crown', 'bone_sword', 'spider_queen_fang', 'alpha_fang', 'gargoyle_wing',
        'imp_horn', 'thunder_feather', 'lava_scale', 'molten_core', 'carnivore_seed',
        'hydra_scale', 'hydra_fang', 'spectral_staff', 'primordial_stone', 'legendary_shard',
        'health_potion_s', 'antidote', 'assassin_blade', 'enhance_stone',
        'cold_resist_potion', 'fire_resist_potion'
    ]),
    blueprints: new Set([
        'iron_sword', 'bone_blade', 'poison_dagger', 'shadow_blade', 'mithril_sword',
        'fire_sword', 'ice_sword', 'dragon_slayer', 'titan_blade', 'leather_armor',
        'wolf_cloak', 'guardian_armor', 'shadow_armor', 'dragon_scale_armor', 'titan_armor',
        'wolf_fang_necklace', 'silver_thread_hook', 'nature_amulet', 'blood_moon_pendant',
        'shadow_ring', 'dragon_amulet', 'titan_ring', 'health_potion_basic',
        'greater_health_potion', 'void_reaver', 'storm_spear', 'wyvern_scale_mail',
        'hydra_fang_dagger', 'bone_soul_staff', 'gargoyle_bulwark', 'goblin_trickster_charm',
        'glimmer_focus', 'demonwar_helm', 'dragon_overlord_crown', 'primal_focus', 'slime_crown_ring',
        'assassin_shadow_veil', 'earthwarden_aegis', 'frostbound_scepter',
        'slime_series', 'bone_series',
        'slime_series_sword', 'slime_series_dagger', 'slime_series_hammer',
        'slime_series_staff', 'slime_series_spear', 'bone_series_sword',
        'bone_series_dagger', 'bone_series_hammer', 'bone_series_staff',
        'bone_series_spear'
    ]),
    shopItems: new Set([
        'steel_armor', 'mithril_blade', 'health_potion', 'first_aid_potion', 'elixir',
        'strength_potion', 'defense_potion', 'lucky_potion', 'emergency_potion',
        'ancient_coin', 'map_fragment', 'silver_thread_bait', 'silver_ring', 'lucky_charm',
        'sharp_focus_manual', 'guard_memory_manual', 'ancient_tome', 'quick_rhythm_manual',
        'fatal_reading_manual', 'dragon_blade', 'phoenix_armor', 'time_amulet',
        'immortal_elixir', 'berserker_potion'
    ]),
    craftedItems: new Set([
        'iron_sword', 'bone_blade', 'poison_dagger', 'shadow_blade', 'mithril_sword',
        'fire_sword', 'ice_sword', 'dragon_slayer', 'titan_blade', 'leather_armor',
        'wolf_cloak', 'guardian_armor', 'shadow_armor', 'dragon_scale_armor', 'titan_armor',
        'wolf_fang_necklace', 'silver_thread_hook', 'nature_amulet', 'blood_moon_pendant',
        'shadow_ring', 'dragon_amulet', 'titan_ring', 'health_potion_basic',
        'greater_health_potion', 'void_reaver', 'storm_spear', 'wyvern_scale_mail',
        'hydra_fang_dagger', 'bone_soul_staff', 'gargoyle_bulwark', 'goblin_trickster_charm',
        'glimmer_focus', 'demonwar_helm', 'dragon_overlord_crown', 'primal_focus', 'slime_crown_ring',
        'assassin_shadow_veil', 'earthwarden_aegis', 'frostbound_scepter',
        'slime_series_sword', 'slime_series_dagger', 'slime_series_hammer',
        'slime_series_staff', 'slime_series_spear', 'bone_series_sword',
        'bone_series_dagger', 'bone_series_hammer', 'bone_series_staff',
        'bone_series_spear'
    ]),
    clues: new Set([
        'bloodied_arrow_pouch', 'wolf_fang_marks', 'mist_tablet_rubbing', 'black_bark_sample',
        'carved_stone_shard', 'dragon_heat_trace', 'hunter_board_notice', 'moon_moss_sample',
        'broken_horn_map', 'drowned_bell_rubbing', 'wet_treasure_fragment', 'oracle_shell',
        'sealed_wax_contract', 'ash_ledger_page', 'smuggled_coal_token', 'thorn_trade_bead',
        'villager_herb_request', 'green_bargain_mark', 'silk_tripwire', 'snapped_bait_hook',
        'survivor_warning', 'dragon_nest_resonance', 'abyss_vanguard_oath', 'cracked_crown_mark',
        'rare_material_box', 'legendary_weapon_box', 'enhance_scroll', 'vip_card',
        'mystery_box', 'transcend_stone', 'ancient_key', 'dungeon_token',
        'casino_chip_bundle', 'black_market_ticket', 'casino_prize_case', 'blood_chip',
        'relief_voucher', 'recipe_fragment', 'forbidden_blueprint_fragment'
    ]),
    'town-places': new Set([
        'crossroads', 'market', 'forge', 'handbook', 'alley', 'casino', 'tower', 'gate'
    ]),
    portraits: new Set([
        'village_elder', 'blacksmith', 'herbalist', 'town_scholar', 'street_beggar',
        'merchant', 'apothecary_assistant', 'tinker', 'rumor_broker', 'black_market',
        'casino_dealer', 'tower_warden', 'accountant_marlo', 'casino_owner',
        'collector_ivan', 'demon_croupier', 'gate_captain', 'grand_magister_julian',
        'herb_gatherer_leah', 'lamplighter_tavi', 'last_weaver_elara',
        'old_miner_bran', 'secret_vendor', 'standard_bearer_frey', 'supply_captain',
        'tower_keeper', 'winter_smith_karen'
    ]),
    monsters: new Set([
        'ambush_mantis', 'ancient_guardian', 'ancient_titan', 'ash_baron', 'blood_moon_stag',
        'crystal_golem', 'demon_general', 'demon_lord_asariel', 'demon_soldier', 'dragon_knight',
        'drake', 'drowned_oracle', 'earth_elemental', 'elder_dragon', 'elemental_lord',
        'fire_elemental', 'forest_guardian', 'ghost', 'giant_rat', 'goblin', 'ice_elemental',
        'lich', 'orc_warrior', 'poison_spider', 'rune_keeper', 'shadow_archer',
        'shadow_assassin', 'shadow_bat', 'shadow_commander', 'shadow_general', 'shadow_mage',
        'shadow_overlord', 'shadow_soldier', 'skeleton', 'skeleton_warrior', 'slime',
        'stone_golem', 'stone_golem_mini', 'thorn_witch', 'thunder_elemental',
        'tower_abyss_general', 'tower_alpha_wolf', 'tower_dark_dragon', 'tower_flame_imp',
        'tower_frost_giant', 'tower_gargoyle', 'tower_goblin_chief', 'tower_hell_knight',
        'tower_hydra', 'tower_iron_golem', 'tower_lava_lizard', 'tower_man_eater',
        'tower_poison_queen', 'tower_primordial_titan', 'tower_shadow_stalker',
        'tower_skeleton_captain', 'tower_slime_king', 'tower_spectral_mage',
        'tower_thunder_hawk', 'tower_void_king', 'treant', 'wild_wolf', 'wyvern',
        'cave_bat', 'cave_spider', 'cave_rat', 'shadow_lurker', 'rock_golem',
        'frost_wolf', 'yeti_scout', 'frost_giant', 'ice_dragon', 'stone_guardian',
        'animated_armor', 'phantom', 'ancient_mage', 'jungle_panther', 'poison_frog',
        'vine_beast', 'tribal_hunter', 'ancient_treant', 'jungle_hydra', 'imp',
        'hell_hound', 'tormented_soul', 'lava_golem', 'pit_fiend', 'demon_king'
    ]),
    'dungeon-zone-scenes': new Set([
        'dungeon_cave', 'dungeon_hell', 'dungeon_jungle', 'dungeon_ruins', 'dungeon_snow',
        'zone_death', 'zone_high', 'zone_low', 'zone_medium'
    ]),
    'dungeon-zone-scenes-full': new Set([
        'dungeon_cave', 'dungeon_hell', 'dungeon_jungle', 'dungeon_ruins', 'dungeon_snow',
        'zone_death', 'zone_high', 'zone_low', 'zone_medium'
    ]),
    'world-landmarks': new Set([
        'abyssal_seal_break', 'black_iron_storehouse', 'broken_horn_camp', 'charred_obelisk',
        'cut_roadsign', 'dragon_heat_crag', 'drowned_bell_coast', 'hunter_boardwalk',
        'mist_tablet_hill', 'moon_moss_slope', 'northern_drake_watch', 'obsidian_keep_gate',
        'old_campfire_site', 'old_wolf_den', 'opened_ancient_tomb', 'rotroot_ravine',
        'silver_snare_pass', 'south_gate_farmland', 'sunken_altar_reef', 'thorn_glasshouse_ruin'
    ]),
    'world-landmarks-full': new Set([
        'abyssal_seal_break', 'black_iron_storehouse', 'broken_horn_camp', 'charred_obelisk',
        'cut_roadsign', 'dragon_heat_crag', 'drowned_bell_coast', 'hunter_boardwalk',
        'mist_tablet_hill', 'moon_moss_slope', 'northern_drake_watch', 'obsidian_keep_gate',
        'old_campfire_site', 'old_wolf_den', 'opened_ancient_tomb', 'rotroot_ravine',
        'silver_snare_pass', 'south_gate_farmland', 'sunken_altar_reef', 'thorn_glasshouse_ruin'
    ]),
    'map-props': new Set([
        'abyss_crack', 'ancient_ruin_arch', 'blackflame_tile', 'boss_lair_silhouette',
        'broken_road_sign', 'campfire_ashes', 'carved_stone_tablet', 'cave_entrance',
        'charred_obelisk_mini', 'coast_wave', 'dark_forest_tile', 'dirt_road',
        'farmland_tile', 'grassland_tile', 'herb_patch', 'hidden_stash_mound',
        'merchant_wagon', 'mist_hill_tile', 'notice_board', 'obsidian_fortress_gate',
        'ore_vein', 'random_event_spark', 'river_bend', 'rotten_ravine_tile',
        'sealed_altar', 'shrine_bell', 'silver_silk_trap', 'snowfield_tile',
        'swamp_tile', 'tomb_entrance', 'treasure_map_marker', 'wooden_boardwalk'
    ]),
    'story-relics': new Set([
        'ancient_loom_shuttle', 'arcane_core_gear', 'black_bark_guardian_core',
        'black_flame_ash_vial', 'bran_bloodied_diary', 'burned_knight_diary',
        'deep_sea_orb', 'demon_seal_fragment', 'dragon_nest_mana_crystal',
        'frostbreaker_blueprint', 'frozen_anvil_inscription', 'julian_tablet_rubbing',
        'last_human_edge', 'lich_staff_remnant', 'living_black_rock', 'weaving_clan_scroll'
    ]),
    'combat-effects': new Set([
        'armor_break', 'attack_speed_down', 'attack_up', 'bleed', 'block', 'boss_warning',
        'burn', 'cold_resist', 'counter', 'critical', 'defense_up', 'dodge', 'double_strike',
        'dragon_burn', 'freeze', 'hit', 'kill_freeze', 'lifesteal', 'poison', 'poison_resist',
        'set_wolf_hunter', 'set_forest_guardian', 'set_undead_slayer', 'set_shadow_legion',
        'set_ancient_relic', 'set_titan', 'set_elemental_master', 'set_dragon_slayer',
        'set_demon_lord', 'set_void_king',
        'setbonus_wolf_hunter_2', 'setbonus_forest_guardian_2', 'setbonus_undead_slayer_2',
        'setbonus_shadow_legion_2', 'setbonus_shadow_legion_3',
        'setbonus_ancient_relic_2', 'setbonus_ancient_relic_3',
        'setbonus_titan_2', 'setbonus_elemental_master_2', 'setbonus_elemental_master_3',
        'setbonus_dragon_slayer_2', 'setbonus_dragon_slayer_3',
        'setbonus_demon_lord_2', 'setbonus_demon_lord_3', 'setbonus_void_king_2'
    ]),
    backgrounds: new Set([
        'town-overview', 'adventure-world-map', 'casino-hall', 'casino-game-table', 'casino-prize-wall'
    ])
};

const ITEM_TYPE_CATEGORY = {
    material: 'materials',
    potion: 'materials',
    consumable: 'materials',
    weapon: 'equipment',
    armor: 'equipment',
    equipment: 'equipment',
    accessory: 'equipment',
    blueprint: 'blueprints',
    recipe: 'blueprints',
    quest: 'clues',
    key: 'clues'
};

const ASSET_ALIASES = {
    equipment: {
        casino_copper_luck_ring: 'lucky_coin',
        casino_green_felt_gloves: 'spider_silk_gloves',
        casino_table_cutter: 'assassin_dagger',
        casino_house_runner_boots: 'bat_wing_cloak',
        casino_cashier_lantern: 'torch',
        casino_last_lamp_token: 'lucky_coin',
        casino_red_chip_bracer: 'rune_badge',
        casino_weighted_dice_belt: 'loaded_dice',
        casino_velvet_dealer_vest: 'bat_wing_cloak',
        casino_moon_slot_blade: 'assassin_blade',
        casino_oddskeeper_goggles: 'compass',
        casino_loaded_dice_charm: 'loaded_dice',
        casino_jackpot_revolver: 'fate_crystal',
        casino_marlo_balance_chain: 'lucky_charm_7',
        casino_showcase_glass_key: 'compass',
        casino_silver_odds_mask: 'shadow_badge',
        casino_black_lamp_coat: 'bat_wing_cloak',
        casino_house_edge_ring: 'lucky_charm_7',
        casino_glass_case_keyblade: 'ancient_sword',
        casino_blood_chip_cuirass: 'demon_general_armor',
        casino_false_odds_orb: 'fate_crystal',
        casino_seventh_bell_crown: 'frost_crown',
        casino_last_lamp_blade: 'demon_slayer',
        casino_owner_contract_ring: 'demon_contract',
        casino_starlit_jackpot_armor: 'overlord_armor',
        casino_zero_number_dice: 'loaded_dice'
    },
    portraits: {
        supply_captain: 'merchant',
        secret_vendor: 'black_market',
        casino_owner: 'casino_dealer',
        tower_keeper: 'tower_warden'
    },
    'world-landmarks': {
        fog_tablet_hill: 'mist_tablet_hill',
        drowned_oracle_reef: 'sunken_altar_reef',
        obsidian_fortress: 'obsidian_keep_gate'
    },
    'combat-effects': {
        defense_break: 'armor_break',
        armor_down: 'armor_break',
        attack_down: 'attack_speed_down',
        speed_down: 'attack_speed_down'
    },
    clues: {
        casino_chip_bundle: 'dungeon_token',
        black_market_ticket: 'vip_card',
        casino_prize_case: 'mystery_box',
        blood_chip: 'thorn_trade_bead',
        relief_voucher: 'hunter_board_notice',
        recipe_fragment: 'wet_treasure_fragment',
        forbidden_blueprint_fragment: 'enhance_scroll'
    }
};

function normalizeId(id = '') {
    return String(id || '').trim();
}

function getCategoryBase(category, legacy = false) {
    if (legacy) {
        return category === 'backgrounds'
            ? LEGACY_BACKGROUND_BASE
            : `${LEGACY_ASSET_BASE}/${LEGACY_CATEGORY_PATHS[category] || category}`;
    }
    return category === 'backgrounds'
        ? GENERATED_BACKGROUND_BASE
        : `${GENERATED_ASSET_BASE}/${ART_CATEGORY_PATHS[category] || category}`;
}

function assetPath(category, id, options = {}) {
    const normalizedId = normalizeId(id);
    if (!normalizedId) return '';
    const overridePath = !options.legacy ? ART_PATH_OVERRIDES[category]?.[normalizedId] : '';
    const base = overridePath
        ? `${GENERATED_ASSET_BASE}/${overridePath}`
        : getCategoryBase(category, Boolean(options.legacy));
    return `${base}/${normalizedId}.${GENERATED_ASSET_EXTENSION}`;
}

function preferredAssetPath(category, id) {
    const normalizedId = normalizeId(id);
    if (!normalizedId) return '';
    return ART_READY[category]?.has(normalizedId)
        ? assetPath(category, normalizedId)
        : assetPath(category, normalizedId, { legacy: true });
}

function knownAssetPath(category, id) {
    const normalizedId = normalizeId(id);
    if (!normalizedId) return '';
    const resolvedId = sets[category]?.has(normalizedId)
        ? normalizedId
        : ASSET_ALIASES[category]?.[normalizedId];
    return resolvedId && sets[category]?.has(resolvedId) ? preferredAssetPath(category, resolvedId) : '';
}

export function getGeneratedAssetPath(category, id) {
    return knownAssetPath(category, id) || assetPath(category, id);
}

export function getGeneratedTownPlaceImage(placeId) {
    return knownAssetPath('town-places', placeId);
}

export function getGeneratedPortraitImage(npcId) {
    return knownAssetPath('portraits', npcId);
}

export function getGeneratedMonsterImage(monsterId) {
    return knownAssetPath('monsters', monsterId);
}

export function getGeneratedDungeonImage(dungeonId) {
    const imageId = `dungeon_${dungeonId}`;
    return knownAssetPath('dungeon-zone-scenes-full', imageId)
        || knownAssetPath('dungeon-zone-scenes', imageId);
}

export function getGeneratedZoneImage(zoneId) {
    const imageId = `zone_${zoneId}`;
    return knownAssetPath('dungeon-zone-scenes-full', imageId)
        || knownAssetPath('dungeon-zone-scenes', imageId);
}

export function getGeneratedLandmarkImage(landmarkId) {
    return knownAssetPath('world-landmarks', landmarkId);
}

export function getGeneratedLandmarkFullImage(landmarkId) {
    return knownAssetPath('world-landmarks-full', landmarkId)
        || knownAssetPath('world-landmarks', landmarkId);
}

export function getGeneratedCombatEffectImage(effectId) {
    return knownAssetPath('combat-effects', effectId);
}

export function getGeneratedMapPropImage(propId) {
    return knownAssetPath('map-props', propId);
}

export function getGeneratedStoryRelicImage(relicId) {
    return knownAssetPath('story-relics', relicId);
}

export function getGeneratedBackgroundImage(backgroundId) {
    return knownAssetPath('backgrounds', backgroundId);
}

export function getGeneratedItemImage(item = {}, options = {}) {
    item = item || {};
    options = options || {};
    const rawId = normalizeId(options.id || item.assetId || item.id || item.recipeId);
    if (!rawId) return '';

    const id = rawId.replace(/^crafted_/, '');
    if (options.category) return knownAssetPath(options.category, id) || assetPath(options.category, id);
    if (options.blueprint || item.type === 'blueprint' || item.autoUnlockedBlueprint) {
        return sets.blueprints.has(id) ? knownAssetPath('blueprints', id) : '';
    }

    const type = String(item.type || '').toLowerCase();
    if (
        sets.craftedItems.has(id)
        && ['weapon', 'armor', 'equipment', 'accessory', 'potion', 'consumable'].includes(type)
    ) {
        return knownAssetPath('craftedItems', id);
    }

    const preferredCategory = ITEM_TYPE_CATEGORY[type];
    if (preferredCategory && sets[preferredCategory]?.has(id)) {
        return knownAssetPath(preferredCategory, id);
    }

    if (sets.equipment.has(id)) return knownAssetPath('equipment', id);
    if (sets.materials.has(id)) return knownAssetPath('materials', id);
    if (sets.shopItems.has(id)) return knownAssetPath('shopItems', id);
    if (sets.craftedItems.has(id)) return knownAssetPath('craftedItems', id);
    if (sets.clues.has(id)) return knownAssetPath('clues', id);
    if (sets.blueprints.has(id)) return knownAssetPath('blueprints', id);

    for (const category of ['equipment', 'materials', 'shopItems', 'craftedItems', 'clues', 'blueprints']) {
        const aliasedPath = knownAssetPath(category, id);
        if (aliasedPath) return aliasedPath;
    }

    return '';
}
