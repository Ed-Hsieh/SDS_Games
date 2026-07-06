/**
 * ChapterOneRoutePlan.js
 * First chapter route spine.
 *
 * The surface UI can show these as quests, clue records, or handbook entries.
 * The important part is that the chapter's large goals are backed by concrete
 * landmark exploration instead of generic low-zone step counting.
 */

export const ChapterOneRouteTarget = Object.freeze({
    INTRO: 'chapter1_route_intro',
    AMBUSH: 'chapter1_ambush_signs',
    FOREST: 'chapter1_forest_trace',
    BLOOD_MOON: 'chapter1_blood_moon_trace'
});

export const ChapterOneRouteGroups = Object.freeze([
    {
        id: 'intro',
        target: ChapterOneRouteTarget.INTRO,
        name: '南門初段路線',
        questIds: ['main_001'],
        landmarkIds: ['south_gate_farmland', 'hunter_boardwalk', 'old_campfire_site'],
        bossThreadIds: ['ambush_mantis'],
        summary: '確認南門外可以走的路、第一個安全停靠點，以及獵人舊路上的異常。'
    },
    {
        id: 'ambush',
        target: ChapterOneRouteTarget.AMBUSH,
        name: '銀絲伏道',
        questIds: ['main_004'],
        landmarkIds: ['hunter_boardwalk', 'old_campfire_site', 'cut_roadsign', 'silver_snare_pass'],
        bossThreadIds: ['ambush_mantis'],
        summary: '用銀絲、營火警告與誘餌鉤反推伏獵者的出手規律。'
    },
    {
        id: 'forest',
        target: ChapterOneRouteTarget.FOREST,
        name: '古樹守衛追蹤',
        questIds: ['main_005'],
        landmarkIds: ['broken_horn_camp', 'rotroot_ravine', 'mist_tablet_hill', 'old_wolf_den'],
        bossThreadIds: ['forest_guardian'],
        summary: '把營地、腐根溪谷、霧碑與根心接成古樹守衛的追蹤路線。'
    },
    {
        id: 'blood_moon',
        target: ChapterOneRouteTarget.BLOOD_MOON,
        name: '血月角鹿支線',
        questIds: ['main_006'],
        landmarkIds: ['broken_horn_camp', 'moon_moss_slope'],
        bossThreadIds: ['blood_moon_stag'],
        summary: '在古樹守衛後，用斷角路線與月苔痕跡縮小角鹿狩獵範圍。'
    }
]);

export function getChapterOneRouteGroups() {
    return [...ChapterOneRouteGroups];
}

export function getChapterOneRouteGroup(routeId) {
    return ChapterOneRouteGroups.find(group => group.id === routeId || group.target === routeId) || null;
}

export function getChapterOneRouteGroupByTarget(target) {
    return ChapterOneRouteGroups.find(group => group.target === target) || null;
}

export function getChapterOneRouteGroupsByQuest(questId) {
    if (!questId) return [];
    return ChapterOneRouteGroups.filter(group => (group.questIds || []).includes(questId));
}

export function getChapterOneRouteGroupsByLandmark(landmarkId) {
    if (!landmarkId) return [];
    return ChapterOneRouteGroups.filter(group => (group.landmarkIds || []).includes(landmarkId));
}

export function getChapterOneRouteProgressTargetsForLandmark(landmarkId) {
    return getChapterOneRouteGroupsByLandmark(landmarkId).map(group => group.target);
}

export function getChapterOneLandmarkIds() {
    return [...new Set(ChapterOneRouteGroups.flatMap(group => group.landmarkIds || []))];
}
