const GENERATED_ASSET_BASE = 'src/assets/images/art';
const GENERATED_ASSET_EXTENSION = 'webp';

const ART_CATEGORY_PATHS = Object.freeze({
    equipment: 'items/equipment',
    consumables: 'items/consumables',
    materials: 'items/materials',
    blueprints: 'items/blueprints',
    currencies: 'items/currencies',
    clues: 'items/key-items/clues',
    relics: 'items/key-items/relics',
    portraits: 'characters/portraits',
    monsters: 'entities/monsters',
    guildScenes: 'scenes/guild',
    townLocations: 'scenes/town/locations',
    dungeonAreas: 'scenes/dungeons/areas',
    worldLandmarks: 'scenes/world/landmarks',
    worldMaps: 'scenes/world/maps',
    mapProps: 'ui/map-props',
    combatEffects: 'effects/combat',
    backgrounds: 'scenes/backgrounds'
});

const CATEGORY_ALIASES = Object.freeze({
    'town-places': 'townLocations',
    'town-places-full': 'townLocations',
    'dungeon-zone-scenes': 'dungeonAreas',
    'dungeon-zone-scenes-full': 'dungeonAreas',
    'world-landmarks': 'worldLandmarks',
    'world-landmarks-full': 'worldLandmarks',
    'map-props': 'mapProps',
    'story-relics': 'relics',
    'combat-effects': 'combatEffects'
});

const readySet = ids => new Set(ids);

const ART_READY = Object.freeze({
    equipment: readySet([
        'abyssal_needle', 'ancient_sword', 'assassin_blade', 'aurora_ward_plate',
        'bone_etched_lance', 'blood_moon_pendant', 'cave_ward_shield', 'cliffscale_skinner',
        'crystal_shield', 'curse_iron_warhammer', 'dawnbrand_sword',
        'demon_blade', 'demon_general_armor', 'demon_lord_armor', 'demon_lord_crown',
        'demon_lord_sword', 'dragon_knight_helm', 'dragonseal_forkstaff',
        'dragonseal_patrol_plate', 'earthwarden_aegis', 'elder_dragon_fang',
        'elder_dragon_fang_badge', 'elemental_badge', 'elemental_crown', 'elemental_orb',
        'embercore_focus', 'flame_sword', 'forest_guardian_crown',
        'forest_guardian_staff', 'frost_blade', 'frostwolf_mantle',
        'frostbite_dueling_blade', 'frostbound_scepter_drop', 'ghost_cloak',
        'fourfold_series_dagger', 'fourfold_series_hammer', 'fourfold_series_spear',
        'fourfold_series_staff', 'fourfold_series_sword',
        'glimmer_focus', 'glimmer_lampstaff', 'goblin_dagger', 'goblin_trickster_charm',
        'helliron_series_dagger', 'helliron_series_hammer', 'helliron_series_spear',
        'helliron_series_staff', 'helliron_series_sword', 'hydra_spine_spear',
        'leather_armor', 'leyline_wedge_lance', 'lich_staff', 'miasma_needle_focus',
        'miners_pickhammer', 'molten_core_maul', 'overlord_armor', 'poison_dagger',
        'bone_series_dagger', 'bone_series_hammer', 'bone_series_spear',
        'bone_series_staff', 'bone_series_sword',
        'expedition_series_dagger', 'expedition_series_hammer', 'expedition_series_spear',
        'expedition_series_staff', 'expedition_series_sword',
        'prism_focus', 'rune_badge', 'rune_scriber_focus',
        'runic_series_dagger', 'runic_series_hammer', 'runic_series_spear',
        'runic_series_staff', 'runic_series_sword',
        'sealstone_series_dagger', 'sealstone_series_hammer', 'sealstone_series_spear',
        'sealstone_ram', 'sealstone_series_staff', 'sealstone_series_sword',
        'seraph_void_focus', 'silver_thread_hook', 'soul_lantern_focus',
        'shade_focus', 'shadow_armor', 'shadow_armor_drop', 'shadow_badge', 'shadow_blade_drop',
        'shadow_commander_blade', 'shadow_commander_sword', 'shadow_overlord_armor',
        'shadowneedle_dagger',
        'slime_series_dagger', 'slime_series_hammer', 'slime_series_spear',
        'slime_series_staff', 'slime_series_sword',
        'slime_sword', 'spider_silk_gloves', 'stormfeather_talisman',
        'stormguide_focus', 'thornhook_claws',
        'thunder_axe', 'titan_gauntlet', 'titan_hammer', 'umbral_pike',
        'undead_dagger', 'wolf_fang_blade', 'wolf_fang_necklace', 'wolf_pelt_armor', 'wyvern_lance'
    ]),
    consumables: readySet([
        'antidote', 'fire_resist_potion',
        'greater_health_potion', 'health_potion', 'health_potion_s'
    ]),
    materials: readySet([
        'abyssal_shard', 'alpha_fang', 'ancient_artifact', 'ancient_bark', 'ancient_gear',
        'ancient_rune', 'assassin_blade_fragment', 'bat_wing', 'beast_hide', 'bone_fragment',
        'bone_sword_fragment', 'carnivore_seed', 'commander_blade', 'crystal_shard', 'cursed_shard',
        'dark_crystal', 'dark_dragon_scale', 'dark_steel', 'demon_core',
        'demon_general_helm', 'demon_horn', 'demonic_steel', 'dragon_heart',
        'dragon_knight_badge', 'dragon_scale_armor', 'dragon_tooth', 'drake_scale',
        'earth_essence', 'ectoplasm', 'elder_dragon_scale', 'elemental_core',
        'ember_stone', 'fire_essence', 'forest_essence', 'forge_core',
        'expedition_steel_fragment',
        'frost_core', 'frost_crystal', 'gargoyle_wing', 'general_armor', 'geo_crystal',
        'glimmer_shard', 'goblin_coin', 'goblin_ear', 'golem_core', 'guardian_branch',
        'high_ore', 'hydra_fang', 'hydra_scale', 'ice_essence', 'imp_horn', 'iron_ore',
        'iron_shard', 'lava_scale', 'legendary_shard', 'lich_phylactery', 'life_seed',
        'light_essence', 'magic_crystal', 'mithril_ore', 'molten_core', 'orc_fang',
        'overlord_crown', 'poison_gland', 'primal_essence', 'primordial_stone',
        'pure_crystal', 'radiant_core', 'radiant_shard', 'radiant_thread', 'rare_metal',
        'rat_tail', 'raw_meat', 'rune_stone', 'shadow_arrow', 'shadow_cloak_fragment',
        'shadow_core', 'shadow_essence', 'shadow_insignia', 'shadow_shard', 'slime_crown',
        'slime_jelly', 'soul_fragment', 'spectral_staff', 'spider_queen_fang',
        'spider_silk', 'spirit_essence', 'stone_fragment', 'storm_crystal',
        'storm_essence', 'thunder_essence', 'thunder_feather', 'titan_heart',
        'vine_core', 'void_essence', 'wolf_fang', 'wolf_pelt', 'world_shard',
        'wyvern_scale', 'wyvern_wing'
    ]),
    blueprints: readySet([
        'blood_moon_pendant', 'bone_etched_lance', 'bone_series',
        'cliffscale_skinner', 'curse_iron_warhammer', 'embercore_focus',
        'expedition_series', 'fourfold_series', 'earthwarden_aegis',
        'glimmer_focus', 'goblin_trickster_charm', 'greater_health_potion',
        'health_potion_basic', 'leather_armor', 'poison_dagger',
        'forge_demon_lord_crown', 'forge_elder_dragon_badge',
        'forge_elemental_crown', 'forge_forest_guardian_crown', 'forge_titan_gauntlet',
        'helliron_series', 'leyline_wedge_lance', 'molten_core_maul',
        'runic_series', 'sealstone_ram', 'sealstone_series', 'soul_lantern_focus',
        'shadow_armor', 'silver_thread_hook', 'slime_series',
        'stormguide_focus', 'wolf_fang_necklace', 'wolf_pelt_armor'
    ]),
    currencies: readySet([]),
    clues: readySet([
        'loaded_dice'
    ]),
    relics: readySet([]),
    portraits: readySet([
        'black_market', 'blacksmith', 'casino_dealer', 'casino_owner', 'herbalist',
        'lamplighter_tavi', 'merchant', 'standard_bearer_frey', 'street_beggar',
        'town_scholar', 'village_elder'
    ]),
    monsters: readySet([
        'abyssal_seraph', 'ambush_mantis', 'ancient_guardian', 'ancient_mage',
        'ancient_titan', 'ancient_treant', 'ash_baron', 'aurora_archon',
        'blood_moon_stag', 'cliffscale_hatchling', 'crystal_golem', 'dawn_sentinel',
        'demon_general', 'demon_king', 'demon_lord_asariel', 'demon_soldier',
        'dragon_knight', 'drake',
        'dragon_seal_adept', 'dragon_seal_sentinel', 'drowned_oracle',
        'earth_elemental', 'elder_dragon', 'elemental_lord', 'ember_beast',
        'fire_elemental', 'forest_guardian', 'frost_giant', 'frost_wolf', 'ghost',
        'giant_rat',
        'glimmer_sprite', 'goblin', 'ice_dragon', 'ice_elemental', 'jungle_hydra',
        'hell_hound', 'lava_golem', 'lich', 'mirror_seraph', 'orc_warrior',
        'pit_fiend', 'poison_frog', 'poison_spider',
        'prism_wisp', 'radiant_keeper', 'rock_golem', 'rune_keeper', 'rune_wisp',
        'sealstone_guardian',
        'shadow_archer', 'shadow_assassin', 'cave_bat', 'shadow_commander',
        'shadow_general', 'shadow_lurker', 'shadow_mage', 'shadow_overlord',
        'shadow_halberdier', 'shadow_soldier', 'skeleton', 'skeleton_warrior',
        'slime', 'starvein_lurker', 'storm_raptor', 'stone_golem',
        'stone_golem_mini', 'thorn_witch', 'thunder_elemental', 'tormented_soul',
        'treant', 'vine_beast', 'void_walker', 'wild_wolf', 'wyvern'
    ]),
    guildScenes: readySet([
        'adventurers-guild-hall'
    ]),
    townLocations: readySet([
        'alley', 'casino', 'civic-room-working', 'crossroads',
        'crossroads-broken', 'crossroads-recovery-1', 'forge', 'forge-cold',
        'gate', 'gate-broken', 'gate-working', 'handbook', 'market',
        'market-closed', 'market-sparse'
    ]),
    dungeonAreas: readySet([
        'dungeon_cave', 'dungeon_hell', 'dungeon_jungle',
        'dungeon_radiant_corridor', 'dungeon_ruins', 'dungeon_snow'
    ]),
    worldLandmarks: readySet([
        'abyssal_seal_break', 'black_iron_storehouse', 'broken_horn_camp',
        'charred_obelisk', 'cut_roadsign', 'dragon_heat_crag', 'drowned_bell_coast',
        'hunter_boardwalk', 'mist_tablet_hill', 'moon_moss_slope',
        'northern_drake_watch', 'obsidian_keep_gate', 'old_campfire_site',
        'old_wolf_den', 'opened_ancient_tomb', 'rotroot_bridge_blocked',
        'rotroot_bridge_repaired', 'rotroot_ravine', 'silver_snare_pass',
        'south_gate_farmland', 'south-road-broken', 'sunken_altar_reef',
        'thorn_glasshouse_ruin'
    ]),
    worldMaps: readySet([
        'overworld_evacuation_basin', 'overworld_south_gate'
    ]),
    mapProps: readySet([]),
    combatEffects: readySet([]),
    backgrounds: readySet([
        'casino-game-table', 'casino-hall',
        'casino-prize-wall', 'town-overview', 'town-overview-broken',
        'town-overview-recovery'
    ])
});

const ITEM_TYPE_CATEGORY = Object.freeze({
    material: 'materials',
    potion: 'consumables',
    consumable: 'consumables',
    currency: 'currencies',
    weapon: 'equipment',
    armor: 'equipment',
    equipment: 'equipment',
    accessory: 'equipment',
    blueprint: 'blueprints',
    recipe: 'blueprints',
    quest: 'clues',
    key: 'clues'
});

function normalizeId(id = '') {
    return String(id || '').trim();
}

function normalizeCategory(category = '') {
    return CATEGORY_ALIASES[category] || category;
}

function assetPath(category, id) {
    const normalizedCategory = normalizeCategory(category);
    const normalizedId = normalizeId(id);
    const folder = ART_CATEGORY_PATHS[normalizedCategory];
    if (!folder || !normalizedId) return '';
    return `${GENERATED_ASSET_BASE}/${folder}/${normalizedId}.${GENERATED_ASSET_EXTENSION}`;
}

function readyAssetPath(category, id) {
    const normalizedCategory = normalizeCategory(category);
    const normalizedId = normalizeId(id);
    return ART_READY[normalizedCategory]?.has(normalizedId)
        ? assetPath(normalizedCategory, normalizedId)
        : '';
}

export function getGeneratedAssetPath(category, id) {
    return readyAssetPath(category, id) || assetPath(category, id);
}

export function getGeneratedAssetIds(category) {
    const normalizedCategory = normalizeCategory(category);
    return [...(ART_READY[normalizedCategory] || [])];
}

export function getGeneratedTownPlaceImage(placeId) {
    return readyAssetPath('townLocations', placeId);
}

export function getGeneratedGuildSceneImage(sceneId) {
    return readyAssetPath('guildScenes', sceneId);
}

export function getGeneratedPortraitImage(npcId) {
    return readyAssetPath('portraits', npcId);
}

export function getGeneratedMonsterImage(monsterId) {
    return readyAssetPath('monsters', monsterId);
}

export function getGeneratedDungeonImage(dungeonId) {
    return readyAssetPath('dungeonAreas', `dungeon_${normalizeId(dungeonId)}`);
}

export function getGeneratedZoneImage() {
    return '';
}

export function getGeneratedLandmarkImage(landmarkId) {
    return readyAssetPath('worldLandmarks', landmarkId);
}

export function getGeneratedLandmarkFullImage(landmarkId) {
    return getGeneratedLandmarkImage(landmarkId);
}

export function getGeneratedWorldMapImage(mapId) {
    return readyAssetPath('worldMaps', mapId);
}

export function getGeneratedCombatEffectImage(effectId) {
    return readyAssetPath('combatEffects', effectId);
}

export function getGeneratedMapPropImage(propId) {
    return readyAssetPath('mapProps', propId);
}

export function getGeneratedStoryRelicImage(relicId) {
    return readyAssetPath('relics', relicId);
}

export function getGeneratedBackgroundImage(backgroundId) {
    return readyAssetPath('backgrounds', backgroundId);
}

export function getGeneratedItemImage(item = {}, options = {}) {
    item = item || {};
    options = options || {};
    const rawId = normalizeId(options.id || item.assetId || item.id || item.recipeId);
    if (!rawId) return '';

    const id = rawId.replace(/^crafted_/, '');
    if (options.blueprint || item.type === 'blueprint' || item.autoUnlockedBlueprint) {
        const blueprintId = normalizeId(
            options.blueprintId
            || item.blueprintGroupId
            || item.seriesId
            || id
        );
        return readyAssetPath('blueprints', blueprintId);
    }

    const type = String(options.type || item.type || '').toLowerCase();
    const explicitCategory = normalizeCategory(options.category || '');
    if (explicitCategory && ART_CATEGORY_PATHS[explicitCategory]) {
        return readyAssetPath(explicitCategory, id);
    }

    const preferredCategory = ITEM_TYPE_CATEGORY[type];
    if (preferredCategory) {
        const preferred = readyAssetPath(preferredCategory, id);
        if (preferred) return preferred;
        if (['key', 'quest'].includes(type)) return readyAssetPath('relics', id);
        return '';
    }

    for (const category of ['equipment', 'consumables', 'materials', 'currencies', 'clues', 'relics', 'blueprints']) {
        const candidate = readyAssetPath(category, id);
        if (candidate) return candidate;
    }

    return '';
}
