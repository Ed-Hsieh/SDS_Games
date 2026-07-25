import GameManager from '../src/js/managers/GameManager.js';
import { storySceneManager } from '../src/js/managers/StorySceneManager.js';
import {
    StorySceneOrder,
    StorySceneRegistry
} from '../src/js/data/StorySceneRegistry.js';
import {
    ChapterRegionRegistry,
    RegionSceneTrigger,
    getSceneRegionBinding,
    isOptionalStoryScene
} from '../src/js/data/ChapterRegionRegistry.js';
import { getTownSceneBinding } from '../src/js/data/TownPlaces.js';
import {
    OverworldMapTiles,
    getOverworldRouteSegmentsAt
} from '../src/js/data/OverworldMapRegistry.js';
import {
    StoryEncounterTransition,
    getStoryEncounterContract
} from '../src/js/data/StoryEncounterContracts.js';

const failures = [];
const check = (condition, message) => {
    if (!condition) failures.push(message);
};

GameManager.resetState();
GameManager.updateFlags({
    'story.run': 1,
    'story.chapter': 1
}, { reason: 'campaign-flow-check' });
storySceneManager.resetProgress();

const expectedScenes = StorySceneOrder.filter(sceneId => (
    !isOptionalStoryScene(sceneId)
    && StorySceneRegistry[sceneId]?.beats?.some(beat => (
        beat.condition === 'any' || beat.condition === 'first_run'
    ))
));
const completedScenes = [];
const completedEncounters = [];

for (let guard = 0; guard < StorySceneOrder.length + 5; guard += 1) {
    const sceneId = storySceneManager.getNextAvailableSceneId();
    if (!sceneId) break;

    const regionBinding = getSceneRegionBinding(sceneId);
    const townBinding = getTownSceneBinding(sceneId);
    check(
        Number(Boolean(regionBinding)) + Number(Boolean(townBinding)) === 1,
        `${sceneId} does not have exactly one runtime entry`
    );

    const presentation = storySceneManager.startScene(sceneId);
    check(presentation?.success, `${sceneId} could not start: ${presentation?.reason || 'unknown'}`);
    if (!presentation?.success) break;
    check(
        presentation.lines?.length > 0,
        `${sceneId} starts without player-facing dialogue or narration`
    );

    let completion = storySceneManager.completeScene(sceneId);
    const encounter = getStoryEncounterContract(sceneId, 1);
    if (encounter) {
        check(
            completion?.transition === StoryEncounterTransition.ENCOUNTER_REQUIRED,
            `${sceneId} did not hand off to its encounter`
        );
        const started = storySceneManager.beginEncounter(encounter.id);
        check(started?.success, `${sceneId} encounter could not start`);
        const victory = storySceneManager.resolveEncounter(encounter.id, { victory: true });
        check(victory?.success && victory?.victory, `${sceneId} encounter victory did not resolve`);
        if (victory?.transition === StoryEncounterTransition.POST_BATTLE) {
            check(
                victory.presentation?.lines?.length > 0,
                `${sceneId} has no post-battle presentation`
            );
            completion = storySceneManager.completeScene(sceneId, { phase: 'post_battle' });
        } else {
            completion = victory;
        }
        completedEncounters.push(encounter.id);
    }

    check(completion?.completed, `${sceneId} did not finalize after its presentation`);
    if (!completion?.completed) break;
    completedScenes.push(sceneId);
}

check(
    JSON.stringify(completedScenes) === JSON.stringify(expectedScenes),
    `Sequential first-run flow completed ${completedScenes.length}/${expectedScenes.length} mandatory scenes`
);
check(
    storySceneManager.getNextAvailableSceneId() === null,
    'A mandatory scene remains after the first-run ending'
);

for (const region of Object.values(ChapterRegionRegistry)) {
    const tile = OverworldMapTiles.find(entry => entry.chapter === region.chapter);
    for (const binding of region.sceneBindings.filter(entry => [
        RegionSceneTrigger.SEGMENT_ENTER,
        RegionSceneTrigger.RETURN_ROUTE
    ].includes(entry.trigger))) {
        const route = region.routeSegments.find(entry => entry.id === binding.targetId);
        const point = route?.path?.[1] || route?.path?.[0];
        check(Boolean(tile && route && point), `${binding.sceneId} has no usable route geometry`);
        if (!tile || !route || !point) continue;
        const matches = getOverworldRouteSegmentsAt(
            tile.x + point[0],
            tile.y + point[1],
            region.chapter
        );
        check(
            matches.some(entry => entry.id === binding.targetId),
            `${binding.sceneId} route ${binding.targetId} cannot be reached by map movement`
        );
    }
}

if (failures.length) {
    console.error(`Campaign flow check found ${failures.length} error(s):`);
    failures.forEach(message => console.error(`- ${message}`));
    process.exit(1);
}

console.log('Campaign flow check passed.');
console.log(`- mandatory first-run scenes: ${completedScenes.length}`);
console.log(`- story encounters resolved: ${completedEncounters.length}`);
console.log('- chapter route movement targets: reachable');
