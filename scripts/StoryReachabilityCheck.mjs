import {
    StorySceneOrder,
    StorySceneRegistry
} from '../src/js/data/StorySceneRegistry.js';
import {
    ChapterRegionRegistry,
    getSceneRegionBinding,
    RegionSceneTrigger
} from '../src/js/data/ChapterRegionRegistry.js';
import {
    TownPlaceDatabase,
    TownSceneBindings,
    TownSceneTrigger,
    getTownSceneBinding
} from '../src/js/data/TownPlaces.js';
import {
    OverworldLandmarks,
    OverworldMapTiles
} from '../src/js/data/OverworldMapRegistry.js';
import { getCurrentRunStoryFlagKeys } from '../src/js/data/StoryStateContract.js';

const errors = [];
const error = message => errors.push(message);
const regionBindings = Object.values(ChapterRegionRegistry)
    .flatMap(region => region.sceneBindings.map(binding => ({
        ...binding,
        chapter: region.chapter,
        regionId: region.regionId
    })));
const landmarkIds = new Set(OverworldLandmarks.map(entry => entry.id));
const routeSegmentIds = new Set(
    Object.values(ChapterRegionRegistry)
        .flatMap(region => region.routeSegments.map(entry => entry.id))
);
const townPlaceIds = new Set(TownPlaceDatabase.map(entry => entry.id));

for (const sceneId of StorySceneOrder) {
    const regionBinding = getSceneRegionBinding(sceneId);
    const townBinding = getTownSceneBinding(sceneId);
    const count = Number(Boolean(regionBinding)) + Number(Boolean(townBinding));
    if (count !== 1) {
        error(`${sceneId} has ${count} canonical triggers`);
        continue;
    }

    if (regionBinding) {
        const isChapterOneSurvey = sceneId === 'ch1_s06_three_landmarks';
        const usesRouteTarget = [
            RegionSceneTrigger.SEGMENT_ENTER,
            RegionSceneTrigger.RETURN_ROUTE
        ].includes(regionBinding.trigger);
        const targetExists = regionBinding.trigger === RegionSceneTrigger.REGION_ENTRY
            ? routeSegmentIds.has(regionBinding.targetId) || landmarkIds.has(regionBinding.targetId)
            : usesRouteTarget
                ? routeSegmentIds.has(regionBinding.targetId)
                : landmarkIds.has(regionBinding.targetId);
        if (!isChapterOneSurvey && !targetExists) {
            error(`${sceneId} targets non-interactive map id ${regionBinding.targetId}`);
        }
        if (regionBinding.stageClass !== StorySceneRegistry[sceneId]?.stageClass) {
            error(`${sceneId} binding stage ${regionBinding.stageClass} does not match scene stage`);
        }
    }

    if (townBinding) {
        if (!townPlaceIds.has(townBinding.placeId)) {
            error(`${sceneId} targets missing town place ${townBinding.placeId}`);
        }
        if (townBinding.actorId) {
            const place = TownPlaceDatabase.find(entry => entry.id === townBinding.placeId);
            if (!(place?.residents || []).some(entry => entry.npcId === townBinding.actorId)) {
                error(`${sceneId} targets ${townBinding.actorId}, who is not registered at ${townBinding.placeId}`);
            }
        }
        if (townBinding.trigger === TownSceneTrigger.PLACE_INTERACT && !townBinding.targetId) {
            error(`${sceneId} place interaction has no target id`);
        }
    }
}

for (let chapter = 1; chapter <= 7; chapter += 1) {
    if (!OverworldMapTiles.some(entry => entry.chapter === chapter)) {
        error(`Chapter ${chapter} has no overworld tile`);
    }
    const region = Object.values(ChapterRegionRegistry).find(entry => entry.chapter === chapter);
    const chapterLocationIds = new Set((region?.locationNodes || []).map(entry => entry.id));
    if (!OverworldLandmarks.some(entry => chapterLocationIds.has(entry.id))) {
        error(`Chapter ${chapter} has no interactive landmark`);
    }
}

const ch7Arrival = getTownSceneBinding('ch7_s08_return_to_town');
if (ch7Arrival?.trigger !== TownSceneTrigger.TOWN_ARRIVAL) {
    error('ch7_s08_return_to_town must trigger from an authored town arrival');
}
const ch7Ending = getTownSceneBinding('ch7_s09_first_or_second_epilogue');
if (ch7Ending?.trigger !== TownSceneTrigger.SCENE_CONTINUE) {
    error('ch7_s09_first_or_second_epilogue must continue from the preceding scene');
}

const resetKeys = new Set(getCurrentRunStoryFlagKeys({
    'story.ch6.reached': true,
    'story.ch7.reached': true
}));
if (!resetKeys.has('story.ch6.reached') || !resetKeys.has('story.ch7.reached')) {
    error('Chapter 6-7 current-run flags are missing from reset selection');
}

if (regionBindings.length + TownSceneBindings.length !== StorySceneOrder.length) {
    error('Canonical trigger total does not match the 66-scene screenplay');
}

if (errors.length) {
    console.error(`Story reachability check found ${errors.length} error(s):`);
    errors.forEach(message => console.error(`- ${message}`));
    process.exit(1);
}

console.log('Story reachability check passed.');
console.log(`- scenes: ${StorySceneOrder.length}`);
console.log(`- map triggers: ${regionBindings.length}`);
console.log(`- town triggers: ${TownSceneBindings.length}`);
console.log('- chapter maps: 7/7');
