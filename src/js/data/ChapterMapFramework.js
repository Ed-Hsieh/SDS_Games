/**
 * ChapterMapFramework.js
 * Runtime planning data for the adventure map route network.
 *
 * This file does not create new monsters, items, materials, or images. It
 * assigns existing landmarks and boss chains into a seven-chapter exploration
 * structure so the map can move away from visible low/medium/high/death layers.
 */

export const MapNodeType = Object.freeze({
    TOWN_ANCHOR: 'town_anchor',
    ROUTE_ENTRY: 'route_entry',
    ROUTE_CLUE: 'route_clue',
    WATCHPOST: 'watchpost',
    BOSS_GATE: 'boss_gate',
    BOSS_LAIR: 'boss_lair',
    DUNGEON_LINK: 'dungeon_link'
});

export const ChapterMapStatus = Object.freeze({
    LIVE_EXISTING: 'live_existing',
    NEEDS_REALLOCATION: 'needs_reallocation',
    PLANNED_GAP: 'planned_gap'
});

export const ChapterBossPlan = Object.freeze([
    {
        chapter: 1,
        levelRange: [1, 10],
        mainBossId: 'forest_guardian',
        optionalBossIds: ['ambush_mantis', 'blood_moon_stag'],
        status: ChapterMapStatus.LIVE_EXISTING,
        role: 'Early route pressure: the player learns that the broken south road is hiding a deeper predator chain.'
    },
    {
        chapter: 2,
        levelRange: [11, 20],
        mainBossId: 'drowned_oracle',
        optionalBossIds: ['lich'],
        status: ChapterMapStatus.LIVE_EXISTING,
        role: 'Route knowledge and old seals: the player follows bell, water, and ruin clues instead of a simple kill list.'
    },
    {
        chapter: 3,
        levelRange: [21, 30],
        mainBossId: 'ash_baron',
        optionalBossIds: [],
        status: ChapterMapStatus.LIVE_EXISTING,
        role: 'Supply-line pressure: contracts, black iron, and town access start to matter.'
    },
    {
        chapter: 4,
        levelRange: [31, 40],
        mainBossId: 'thorn_witch',
        optionalBossIds: [],
        status: ChapterMapStatus.NEEDS_REALLOCATION,
        role: 'Elemental bargain chapter. Existing boss can cover the slot, but its route should be reauthored before art expansion.'
    },
    {
        chapter: 5,
        levelRange: [41, 50],
        mainBossId: 'elder_dragon',
        optionalBossIds: [],
        status: ChapterMapStatus.LIVE_EXISTING,
        role: 'Advanced preparation and dragon-route identity. Existing dragon boss should become the convergence point.'
    },
    {
        chapter: 6,
        levelRange: [51, 60],
        mainBossId: 'demon_lord_asariel',
        optionalBossIds: [],
        status: ChapterMapStatus.LIVE_EXISTING,
        role: 'Abyss and void pressure. This can serve as the late forbidden-power boss before the final light bridge.'
    },
    {
        chapter: 7,
        levelRange: [61, 70],
        mainBossId: null,
        optionalBossIds: [],
        status: ChapterMapStatus.PLANNED_GAP,
        plannedBossSlot: 'glimmer_light_final',
        role: 'Final light/void convergence boss is intentionally uncreated. Add only after chapter seven route, drops, and art plan are approved.'
    }
]);

export const LandmarkMapNodePlan = Object.freeze({
    south_gate_farmland: {
        chapter: 1,
        type: MapNodeType.ROUTE_ENTRY,
        revealRadius: 0,
        routeRole: 'starting_route',
        bossThreadIds: ['ambush_mantis']
    },
    hunter_boardwalk: {
        chapter: 1,
        type: MapNodeType.ROUTE_CLUE,
        revealRadius: 0,
        routeRole: 'hunter_trace',
        bossThreadIds: ['ambush_mantis', 'forest_guardian']
    },
    old_campfire_site: {
        chapter: 1,
        type: MapNodeType.WATCHPOST,
        revealRadius: 2,
        routeRole: 'early_safe_shelter',
        bossThreadIds: ['ambush_mantis']
    },
    cut_roadsign: {
        chapter: 1,
        type: MapNodeType.ROUTE_CLUE,
        revealRadius: 0,
        routeRole: 'route_damage_clue',
        bossThreadIds: ['ambush_mantis']
    },
    silver_snare_pass: {
        chapter: 1,
        type: MapNodeType.BOSS_GATE,
        revealRadius: 0,
        routeRole: 'ambush_gate',
        bossThreadIds: ['ambush_mantis']
    },
    broken_horn_camp: {
        chapter: 1,
        type: MapNodeType.WATCHPOST,
        revealRadius: 2,
        routeRole: 'hunter_watch_shelter',
        bossThreadIds: ['forest_guardian', 'blood_moon_stag']
    },
    rotroot_ravine: {
        chapter: 1,
        type: MapNodeType.ROUTE_CLUE,
        revealRadius: 0,
        routeRole: 'forest_guardian_route',
        bossThreadIds: ['forest_guardian']
    },
    mist_tablet_hill: {
        chapter: 2,
        type: MapNodeType.ROUTE_CLUE,
        revealRadius: 0,
        routeRole: 'mist_seal_chapter_entry',
        bossThreadIds: ['lich', 'drowned_oracle']
    },
    old_wolf_den: {
        chapter: 1,
        type: MapNodeType.BOSS_LAIR,
        revealRadius: 0,
        routeRole: 'forest_guardian_lair',
        bossThreadIds: ['forest_guardian']
    },
    moon_moss_slope: {
        chapter: 1,
        type: MapNodeType.ROUTE_CLUE,
        revealRadius: 0,
        routeRole: 'optional_blood_moon_thread',
        bossThreadIds: ['blood_moon_stag']
    },
    drowned_bell_coast: {
        chapter: 2,
        type: MapNodeType.ROUTE_CLUE,
        revealRadius: 0,
        routeRole: 'drowned_oracle_route',
        bossThreadIds: ['drowned_oracle']
    },
    sunken_altar_reef: {
        chapter: 2,
        type: MapNodeType.BOSS_LAIR,
        revealRadius: 0,
        routeRole: 'drowned_oracle_lair',
        bossThreadIds: ['drowned_oracle']
    },
    opened_ancient_tomb: {
        chapter: 2,
        type: MapNodeType.BOSS_GATE,
        revealRadius: 0,
        routeRole: 'lich_seal_route',
        bossThreadIds: ['lich']
    },
    obsidian_keep_gate: {
        chapter: 3,
        type: MapNodeType.BOSS_GATE,
        revealRadius: 0,
        routeRole: 'ash_baron_gate',
        bossThreadIds: ['ash_baron']
    },
    black_iron_storehouse: {
        chapter: 3,
        type: MapNodeType.BOSS_LAIR,
        revealRadius: 0,
        routeRole: 'ash_baron_lair',
        bossThreadIds: ['ash_baron']
    },
    thorn_glasshouse_ruin: {
        chapter: 4,
        type: MapNodeType.BOSS_GATE,
        revealRadius: 0,
        routeRole: 'thorn_witch_route',
        bossThreadIds: ['thorn_witch']
    },
    northern_drake_watch: {
        chapter: 5,
        type: MapNodeType.WATCHPOST,
        revealRadius: 2,
        routeRole: 'dragon_route_watch',
        bossThreadIds: ['elder_dragon']
    },
    dragon_heat_crag: {
        chapter: 5,
        type: MapNodeType.ROUTE_CLUE,
        revealRadius: 0,
        routeRole: 'dragon_heat_trace',
        bossThreadIds: ['elder_dragon']
    },
    charred_obelisk: {
        chapter: 5,
        type: MapNodeType.BOSS_LAIR,
        revealRadius: 0,
        routeRole: 'elder_dragon_lair',
        bossThreadIds: ['elder_dragon']
    },
    abyssal_seal_break: {
        chapter: 6,
        type: MapNodeType.BOSS_GATE,
        revealRadius: 0,
        routeRole: 'asariel_breach',
        bossThreadIds: ['demon_lord_asariel']
    }
});

export function getChapterBossPlan(chapter) {
    const numericChapter = Number(chapter);
    return ChapterBossPlan.find(plan => plan.chapter === numericChapter) || null;
}

export function getBossChapterPlanByBossId(bossId) {
    if (!bossId) return null;
    return ChapterBossPlan.find(plan =>
        plan.mainBossId === bossId || (plan.optionalBossIds || []).includes(bossId)
    ) || null;
}

export function getLandmarkMapNode(landmarkId) {
    return LandmarkMapNodePlan[landmarkId] || null;
}

export function getLandmarkMapChapter(landmark = {}) {
    const planned = getLandmarkMapNode(landmark.id);
    return planned?.chapter || landmark.chapter || 1;
}

export function getLandmarkRevealRadius(landmarkOrId) {
    const landmarkId = typeof landmarkOrId === 'string'
        ? landmarkOrId
        : landmarkOrId?.id;
    const node = getLandmarkMapNode(landmarkId);
    return Math.max(0, Number(node?.revealRadius) || 0);
}

export function isWatchpostNode(landmarkOrId) {
    const landmarkId = typeof landmarkOrId === 'string'
        ? landmarkOrId
        : landmarkOrId?.id;
    return getLandmarkMapNode(landmarkId)?.type === MapNodeType.WATCHPOST;
}
