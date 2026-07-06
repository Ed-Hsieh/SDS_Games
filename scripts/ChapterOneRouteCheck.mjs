import { ChapterOneRouteGroups, ChapterOneRouteTarget } from '../src/js/data/ChapterOneRoutePlan.js';
import { QuestDatabase, ObjectiveType } from '../src/js/data/Quests.js';
import { LandmarkMapNodePlan } from '../src/js/data/ChapterMapFramework.js';
import { WorldLandmarks, WorldStoryChains } from '../src/js/data/WorldStories.js';

const errors = [];
const warnings = [];

function error(section, message) {
    errors.push({ section, message });
}

function warn(section, message) {
    warnings.push({ section, message });
}

function printRows(title, rows) {
    if (rows.length === 0) return;
    console.log(`\n${title}`);
    for (const row of rows) console.log(`- [${row.section}] ${row.message}`);
}

const landmarkIds = new Set(WorldLandmarks.map(landmark => landmark.id));
const routeTargets = new Set(Object.values(ChapterOneRouteTarget));
const mainQuests = new Map((QuestDatabase.main || []).map(quest => [quest.id, quest]));

for (const group of ChapterOneRouteGroups) {
    if (!group.id) error('route-id', 'route group is missing id');
    if (!routeTargets.has(group.target)) error('route-target', `${group.id} has unknown target ${group.target}`);
    if (!Array.isArray(group.landmarkIds) || group.landmarkIds.length === 0) {
        error('route-landmarks', `${group.id} has no landmarks`);
    }

    for (const landmarkId of group.landmarkIds || []) {
        if (!landmarkIds.has(landmarkId)) error('landmark-exists', `${group.id} references missing landmark ${landmarkId}`);
        const mapNode = LandmarkMapNodePlan[landmarkId];
        if (!mapNode) error('landmark-map-node', `${landmarkId} has no ChapterMapFramework node`);
        else if (mapNode.chapter !== 1) warn('landmark-chapter', `${landmarkId} is mapped to chapter ${mapNode.chapter}, not chapter 1`);
    }

    for (const questId of group.questIds || []) {
        if (!mainQuests.has(questId)) error('quest-exists', `${group.id} references missing main quest ${questId}`);
    }

    for (const chainId of group.bossThreadIds || []) {
        if (!WorldStoryChains[chainId]) error('boss-thread', `${group.id} references missing story chain ${chainId}`);
    }
}

const main001 = mainQuests.get('main_001');
const main001Explore = (main001?.objectives || []).find(objective => objective.type === ObjectiveType.EXPLORE);
if (!main001Explore) {
    error('main-001-objective', 'main_001 has no explore objective');
} else if (main001Explore.target !== ChapterOneRouteTarget.INTRO) {
    error('main-001-objective', `main_001 explore target is ${main001Explore.target}, expected ${ChapterOneRouteTarget.INTRO}`);
}

console.log('Chapter one route summary:');
for (const group of ChapterOneRouteGroups) {
    console.log(`- ${group.id}: target=${group.target}, landmarks=${group.landmarkIds.length}, quests=${(group.questIds || []).join(',')}, bosses=${(group.bossThreadIds || []).join(',')}`);
}

printRows('Warnings:', warnings);
printRows('Errors:', errors);

if (errors.length > 0) {
    process.exitCode = 1;
} else {
    console.log('\nChapter one route check passed.');
}
