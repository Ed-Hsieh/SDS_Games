/**
 * Authoritative monster availability and chapter-roster contract.
 *
 * Combat numbers and final drop rates are intentionally not owned here. This
 * module prevents campaign scope, chapter placement, affinity, and art status
 * from drifting while those systems are rebuilt.
 */

export const MonsterCampaignScope = Object.freeze({
    FIRST_RUN: 'first_run',
    SECOND_RUN_EXTERNAL: 'second_run_external',
    DUNGEON: 'dungeon',
    TOWER: 'tower',
    RESERVE: 'reserve'
});

export const MonsterAffinityGroup = Object.freeze({
    NONE: 'none',
    BEAST: 'beast',
    UNDEAD: 'undead',
    NATURE: 'nature',
    STONE: 'stone',
    GLIMMER: 'glimmer',
    SHADOW: 'shadow',
    ANCIENT: 'ancient',
    ELEMENTAL: 'elemental',
    DRAGON: 'dragon',
    DEMON: 'demon'
});

export const MonsterDropRole = Object.freeze({
    COMMON_MATERIAL: 'common_material',
    SIGNATURE_MATERIAL: 'signature_material',
    RARE_MATERIAL: 'rare_material',
    BLUEPRINT: 'blueprint',
    DIRECT_EQUIPMENT: 'direct_equipment',
    BOSS_CORE: 'boss_core'
});

export const MonsterDropRoleContract = Object.freeze({
    normal: Object.freeze([
        MonsterDropRole.SIGNATURE_MATERIAL,
        MonsterDropRole.COMMON_MATERIAL,
        MonsterDropRole.DIRECT_EQUIPMENT
    ]),
    elite: Object.freeze([
        MonsterDropRole.RARE_MATERIAL,
        MonsterDropRole.BLUEPRINT,
        MonsterDropRole.DIRECT_EQUIPMENT
    ]),
    dungeonBoss: Object.freeze([
        MonsterDropRole.BOSS_CORE,
        MonsterDropRole.BLUEPRINT,
        MonsterDropRole.DIRECT_EQUIPMENT
    ]),
    mainBoss: Object.freeze([
        MonsterDropRole.BOSS_CORE,
        MonsterDropRole.DIRECT_EQUIPMENT
    ])
});

const roster = (chapter, levelBand, monsterIds, mandatoryBossId, optionalBossIds = []) => Object.freeze({
    chapter,
    levelBand: Object.freeze(levelBand),
    targetMin: 8,
    targetMax: 10,
    monsterIds: Object.freeze(monsterIds),
    mandatoryBossId,
    optionalBossIds: Object.freeze(optionalBossIds)
});

export const FirstRunMonsterRosters = Object.freeze({
    1: roster(1, [1, 10], [
        'slime', 'giant_rat', 'goblin', 'wild_wolf', 'poison_spider',
        'stone_golem_mini', 'treant', 'ambush_mantis', 'forest_guardian'
    ], 'forest_guardian', ['ambush_mantis']),
    2: roster(2, [11, 20], [
        'skeleton', 'skeleton_warrior', 'ghost', 'cave_bat',
        'stone_golem', 'glimmer_sprite', 'rune_wisp', 'lich'
    ], 'lich'),
    3: roster(3, [21, 30], [
        'ghost', 'skeleton_warrior', 'shadow_soldier', 'shadow_archer',
        'shadow_halberdier', 'shadow_mage', 'drowned_oracle', 'shadow_commander'
    ], 'shadow_commander', ['drowned_oracle']),
    4: roster(4, [31, 40], [
        'stone_golem_mini', 'stone_golem', 'ancient_guardian', 'crystal_golem',
        'earth_elemental', 'rune_keeper', 'thorn_witch', 'ancient_titan'
    ], 'ancient_titan', ['thorn_witch']),
    5: roster(5, [41, 50], [
        'fire_elemental', 'ember_beast', 'ice_elemental', 'frost_wolf',
        'thunder_elemental', 'storm_raptor', 'poison_frog', 'vine_beast',
        'starvein_lurker', 'elemental_lord'
    ], 'elemental_lord'),
    6: roster(6, [51, 60], [
        'wyvern', 'drake', 'cliffscale_hatchling', 'sealstone_guardian',
        'dragon_seal_sentinel', 'dragon_seal_adept', 'dragon_knight', 'elder_dragon'
    ], 'elder_dragon'),
    7: roster(7, [61, 70], [
        'hell_hound', 'tormented_soul', 'lava_golem', 'demon_soldier',
        'shadow_assassin', 'shadow_general', 'demon_general', 'demon_lord_asariel'
    ], 'demon_lord_asariel')
});

// Canonical runtime levels. Encounter regions select a species; they never
// reroll or rescale that species' level. Later chapters may retain explicitly
// listed weaker carryovers as ecological continuity, but cannot promote them.
export const FirstRunMonsterFixedLevels = Object.freeze({
    slime: 1,
    goblin: 2,
    giant_rat: 3,
    wild_wolf: 4,
    ambush_mantis: 6,
    poison_spider: 7,
    stone_golem_mini: 8,
    treant: 9,
    forest_guardian: 10,
    skeleton: 11,
    cave_bat: 12,
    skeleton_warrior: 13,
    ghost: 15,
    stone_golem: 17,
    glimmer_sprite: 18,
    rune_wisp: 19,
    lich: 20,
    shadow_soldier: 21,
    shadow_archer: 23,
    shadow_halberdier: 24,
    shadow_mage: 26,
    drowned_oracle: 28,
    shadow_commander: 30,
    ancient_guardian: 31,
    crystal_golem: 33,
    earth_elemental: 35,
    rune_keeper: 37,
    thorn_witch: 38,
    ancient_titan: 40,
    fire_elemental: 41,
    ember_beast: 42,
    ice_elemental: 43,
    frost_wolf: 44,
    thunder_elemental: 45,
    storm_raptor: 46,
    poison_frog: 47,
    vine_beast: 48,
    starvein_lurker: 49,
    elemental_lord: 50,
    cliffscale_hatchling: 51,
    wyvern: 52,
    sealstone_guardian: 53,
    drake: 54,
    dragon_seal_sentinel: 56,
    dragon_seal_adept: 57,
    dragon_knight: 59,
    elder_dragon: 60,
    shadow_assassin: 61,
    hell_hound: 62,
    tormented_soul: 63,
    lava_golem: 64,
    demon_soldier: 66,
    shadow_general: 67,
    demon_general: 69,
    demon_lord_asariel: 70
});

export const FirstRunMonsterCarryovers = Object.freeze({
    3: Object.freeze({ ghost: 2, skeleton_warrior: 2 }),
    4: Object.freeze({ stone_golem_mini: 1, stone_golem: 2 })
});

export function getFixedFirstRunMonsterLevel(monsterId) {
    return FirstRunMonsterFixedLevels[monsterId] || null;
}

const secondRunCapacity = (chapter, externalBossKey, runtimeBossId = null) => {
    const firstRunCount = FirstRunMonsterRosters[chapter].monsterIds.length;
    return Object.freeze({
        chapter,
        targetTotal: 12,
        externalBossSlots: 1,
        additionalSlots: 12 - firstRunCount,
        externalBossKey,
        runtimeBossId
    });
};

// Capacity only. These records do not authorize second-run spawning, rewards,
// routes, lore, or art before the first-run vertical slice is complete.
export const SecondRunMonsterCapacity = Object.freeze({
    1: secondRunCapacity(1, 'prologue_blood_moon_stag', 'blood_moon_stag'),
    2: secondRunCapacity(2, 'nameless_curse'),
    3: secondRunCapacity(3, 'expedition_supreme_commander'),
    4: secondRunCapacity(4, 'ash_baron_external', 'ash_baron'),
    5: secondRunCapacity(5, 'entropy_balance_external'),
    6: secondRunCapacity(6, 'light_trial_external', 'aurora_archon'),
    7: secondRunCapacity(7, 'void_revelation_external')
});

export const SecondRunExternalMonsterIds = Object.freeze([
    'blood_moon_stag', 'ash_baron', 'prism_wisp', 'shadow_overlord',
    'void_walker', 'abyssal_seraph', 'dawn_sentinel', 'radiant_keeper',
    'mirror_seraph', 'aurora_archon'
]);

export const ReserveMonsterIds = Object.freeze(['orc_warrior']);

export const RequiredFirstRunMonsterArtIds = Object.freeze([]);

const chapterByMonsterId = new Map();
for (const chapter of Object.keys(FirstRunMonsterRosters).map(Number)) {
    for (const monsterId of FirstRunMonsterRosters[chapter].monsterIds) {
        const chapters = chapterByMonsterId.get(monsterId) || [];
        chapters.push(chapter);
        chapterByMonsterId.set(monsterId, chapters);
    }
}

const affinityOverrides = Object.freeze({
    skeleton: MonsterAffinityGroup.UNDEAD,
    skeleton_warrior: MonsterAffinityGroup.UNDEAD,
    ghost: MonsterAffinityGroup.UNDEAD,
    lich: MonsterAffinityGroup.UNDEAD,
    cave_bat: MonsterAffinityGroup.BEAST,
    glimmer_sprite: MonsterAffinityGroup.GLIMMER,
    rune_wisp: MonsterAffinityGroup.GLIMMER,
    starvein_lurker: MonsterAffinityGroup.GLIMMER,
    treant: MonsterAffinityGroup.NATURE,
    forest_guardian: MonsterAffinityGroup.NATURE,
    shadow_soldier: MonsterAffinityGroup.SHADOW,
    shadow_archer: MonsterAffinityGroup.SHADOW,
    shadow_halberdier: MonsterAffinityGroup.SHADOW,
    shadow_mage: MonsterAffinityGroup.SHADOW,
    shadow_commander: MonsterAffinityGroup.SHADOW,
    drowned_oracle: MonsterAffinityGroup.UNDEAD,
    rune_keeper: MonsterAffinityGroup.ANCIENT,
    ancient_guardian: MonsterAffinityGroup.ANCIENT,
    ancient_titan: MonsterAffinityGroup.ANCIENT,
    dragon_knight: MonsterAffinityGroup.DRAGON,
    elder_dragon: MonsterAffinityGroup.DRAGON,
    demon_lord_asariel: MonsterAffinityGroup.DEMON
});

export function getFirstRunRoster(chapter) {
    return FirstRunMonsterRosters[Number(chapter)] || null;
}

export function getMonsterEcologyProfile(monsterId) {
    const chapters = chapterByMonsterId.get(monsterId) || [];
    let scope = chapters.length > 0 ? MonsterCampaignScope.FIRST_RUN : MonsterCampaignScope.RESERVE;
    if (SecondRunExternalMonsterIds.includes(monsterId)) scope = MonsterCampaignScope.SECOND_RUN_EXTERNAL;
    if (ReserveMonsterIds.includes(monsterId)) scope = MonsterCampaignScope.RESERVE;

    return Object.freeze({
        monsterId,
        scope,
        chapters: Object.freeze([...chapters]),
        affinityGroup: affinityOverrides[monsterId] || MonsterAffinityGroup.NONE,
        assetStatus: RequiredFirstRunMonsterArtIds.includes(monsterId) ? 'required' : 'ready'
    });
}

export function isMonsterAvailableInRun(monsterId, { runNumber = 1, chapter = null, includeExternal = false } = {}) {
    const profile = getMonsterEcologyProfile(monsterId);
    if (profile.scope === MonsterCampaignScope.RESERVE || profile.scope === MonsterCampaignScope.TOWER) return false;
    if (profile.scope === MonsterCampaignScope.SECOND_RUN_EXTERNAL) {
        return runNumber >= 2 && includeExternal;
    }
    return chapter == null || profile.chapters.includes(Number(chapter));
}
