/**
 * Authoritative weapon-distribution structure.
 *
 * This file owns bands, forms, acquisition roles, source budgets, and focus
 * element boundaries. It does not assign final stats or final drop rates.
 */

export const WeaponForm = Object.freeze({
    SWORD: 'sword',
    DAGGER: 'dagger',
    HEAVY: 'heavy',
    LANCE: 'lance',
    FOCUS: 'focus'
});

export const WeaponAcquisitionRole = Object.freeze({
    STARTER: 'starter',
    WEAK_FALLBACK: 'weak_fallback',
    MONSTER_CHASE: 'monster_chase',
    SPECIAL_CRAFT: 'special_craft',
    DUNGEON_REWARD: 'dungeon_reward',
    BOSS_SIGNATURE: 'boss_signature'
});

export const WeaponLevelBands = Object.freeze([
    Object.freeze({ chapter: 1, id: 'lv01_10', minLevel: 1, maxLevel: 10, missingForms: Object.freeze([]), themes: Object.freeze(['woodland', 'beast', 'survival']) }),
    Object.freeze({ chapter: 2, id: 'lv11_20', minLevel: 11, maxLevel: 20, missingForms: Object.freeze([]), themes: Object.freeze(['undead', 'bone', 'glimmer']) }),
    Object.freeze({ chapter: 3, id: 'lv21_30', minLevel: 21, maxLevel: 30, missingForms: Object.freeze([]), themes: Object.freeze(['shadow', 'expedition', 'coast']) }),
    Object.freeze({ chapter: 4, id: 'lv31_40', minLevel: 31, maxLevel: 40, missingForms: Object.freeze([]), themes: Object.freeze(['stone', 'ancient', 'forge']) }),
    Object.freeze({ chapter: 5, id: 'lv41_50', minLevel: 41, maxLevel: 50, missingForms: Object.freeze([]), themes: Object.freeze(['fire', 'ice', 'thunder', 'poison']) }),
    Object.freeze({ chapter: 6, id: 'lv51_60', minLevel: 51, maxLevel: 60, missingForms: Object.freeze([]), themes: Object.freeze(['dragon', 'seal', 'cliff']) }),
    Object.freeze({ chapter: 7, id: 'lv61_70', minLevel: 61, maxLevel: 70, missingForms: Object.freeze([]), themes: Object.freeze(['demon', 'fall-site', 'endgame']) })
]);

export const ChapterMaterialGroups = Object.freeze({
    1: Object.freeze({
        equipmentGroups: Object.freeze(['slime_alchemy', 'beast_hunter', 'goblin_scrap', 'toxin_silk', 'stone_ore', 'forest_nature']),
        nonProgressionGroups: Object.freeze(['junk', 'food'])
    }),
    2: Object.freeze({ equipmentGroups: Object.freeze(['undead_bone', 'relic_stone', 'glimmer']), nonProgressionGroups: Object.freeze(['junk']) }),
    3: Object.freeze({ equipmentGroups: Object.freeze(['shadow', 'expedition_metal', 'coast']), nonProgressionGroups: Object.freeze(['junk']) }),
    4: Object.freeze({ equipmentGroups: Object.freeze(['stone', 'ancient_relic', 'forge_metal']), nonProgressionGroups: Object.freeze(['junk']) }),
    5: Object.freeze({ equipmentGroups: Object.freeze(['fire', 'ice', 'thunder', 'poison']), nonProgressionGroups: Object.freeze([]) }),
    6: Object.freeze({ equipmentGroups: Object.freeze(['dragon', 'seal_stone', 'cliff_beast']), nonProgressionGroups: Object.freeze([]) }),
    7: Object.freeze({ equipmentGroups: Object.freeze(['demon', 'shadow', 'fall_site']), nonProgressionGroups: Object.freeze([]) })
});

export const WeaponDistributionContract = Object.freeze({
    allForms: Object.freeze(Object.values(WeaponForm)),
    gapFillCount: WeaponLevelBands.reduce((total, band) => total + band.missingForms.length, 0),
    completeSeriesCountsAsOneSourceEvent: true,
    monsterMayOwnWholeRecipeChain: false,
    maxPrimaryElementPerFocus: 1,
    unresolvedAllocationRules: Object.freeze([]),
    finalStatsLocked: false,
    finalDropRatesLocked: false
});

export const WeaponBandAllocationContract = Object.freeze({
    baselineCraft: Object.freeze({
        policy: 'complete_five_form_series',
        forms: Object.freeze(Object.values(WeaponForm)),
        fixedItemCount: true,
        finishedItemsPerBand: 5,
        seriesUnlocksPerBand: 1,
        consumesSpecialCraftQuota: false
    }),
    specialCraft: Object.freeze({
        min: 1,
        max: 2,
        countsFinishedItems: true,
        excludes: Object.freeze(['baseline_craft', 'boss_dungeon_craft', 'quest_unique'])
    }),
    normalEliteSpecialDrops: Object.freeze({
        min: 2,
        max: 3,
        finishedDirectEquipmentOnly: true,
        blueprintResultsCountAs: 'special_craft'
    }),
    bossDungeonRepresentativeEquipment: Object.freeze({ min: 1, max: 2 }),
    questUniqueWeapon: Object.freeze({
        fixedQuota: false,
        requiresNarrativeCausality: true,
        acquisition: 'fixed_non_random',
        mayFillBaselineGap: false,
        countsTowardOtherQuotas: false
    }),
    countScope: 'per_ten_level_band'
});

export const BossRewardContract = Object.freeze({
    signatureEquipmentPerMainBoss: 1,
    signatureRarity: 'legendary',
    signatureMustMatchBossImage: true,
    secondaryEquipmentSource: 'boss_core_craft',
    craftResultUsesCanonicalEquipmentId: true,
    unlockMethod: 'boss_clear_system_unlock',
    generateNewCoreMaterialByDefault: false
});

export const MonsterSourceBudget = Object.freeze({
    normal: Object.freeze({ signatureMaterials: 1, commonMaterials: 1, maxDirectEquipment: 1 }),
    elite: Object.freeze({ rareMaterials: 1, primaryRewardChoices: Object.freeze(['equipment', 'blueprint']) }),
    dungeonBoss: Object.freeze({ bossCores: 1, maxSignatureEquipment: 1, specialCraftLines: 1 }),
    mainBoss: Object.freeze({ matchingRepresentativeObjects: 1, remainingOutput: Object.freeze(['material', 'system']) })
});

// equipmentDrops[].chance is the final baseline independent probability.
// Runtime code must not apply hidden chapter, zone, rarity, or level scaling;
// only an explicit player-facing drop bonus may modify the roll.
export const EquipmentDropRateContract = Object.freeze({
    chanceSemantics: 'final_baseline_probability',
    migratedChapters: Object.freeze([1, 2, 3, 4, 5, 6, 7]),
    standardByRarity: Object.freeze({
        common: 0.20,
        uncommon: 0.15,
        rare: 0.10,
        epic: 0.05
    }),
    mainBossLegendaryRange: Object.freeze([0.15, 0.25]),
    standardRarities: Object.freeze(['common', 'uncommon', 'rare', 'epic'])
});

export const RegionSourceContract = Object.freeze({
    minimumContributingMonsterSpecies: 3,
    contributionTypes: Object.freeze(['material', 'direct_equipment', 'blueprint']),
    oneMonsterMayNotOwnCompleteChain: true
});

export const MaterialSourceContract = Object.freeze({
    ordinarySourceTarget: Object.freeze([2, 3]),
    rareSourcePattern: 'primary_plus_low_rate_alternative',
    bossCoreMayBeUnique: true,
    maxBossCoresPerRecipe: 1,
    recipeSourceLayers: Object.freeze([2, 3]),
    recipeQuantityPolicy: 'low'
});

export const FocusElementContract = Object.freeze({
    resonanceElements: Object.freeze(['fire', 'ice', 'thunder', 'poison']),
    neutralFallback: 'magic_bolt',
    groupAffinitiesExcluded: Object.freeze(['nature', 'undead', 'glimmer', 'shadow']),
    externalAffinitiesExcluded: Object.freeze(['light', 'void']),
    currentCoverage: Object.freeze({
        ice: Object.freeze(['frostbound_scepter_drop', 'frostbound_scepter']),
        fire: Object.freeze(['crafted_embercore_focus']),
        thunder: Object.freeze(['crafted_stormguide_focus']),
        poison: Object.freeze(['miasma_needle_focus'])
    })
});

export function getWeaponLevelBand(level) {
    const normalized = Number(level);
    return WeaponLevelBands.find(band => normalized >= band.minLevel && normalized <= band.maxLevel) || null;
}
