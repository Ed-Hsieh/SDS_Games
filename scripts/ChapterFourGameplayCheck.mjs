import fs from 'node:fs';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    innerWidth: 1920,
    innerHeight: 1080
};
globalThis.document = {
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => []
};
globalThis.requestAnimationFrame = () => 1;
globalThis.cancelAnimationFrame = () => {};

const { MonsterDatabase } = await import('../src/js/data/Monsters.js');
const { getGeneratedWorldMapImage } = await import('../src/js/data/AssetManifest.js');
const {
    OverworldHabitats,
    OverworldLandmarks,
    OverworldMapTiles,
    WORLD_TILE_COLS,
    WORLD_TILE_ROWS,
    getOverworldTileAt
} = await import('../src/js/data/OverworldMapRegistry.js');
const { StorySceneOrder, getStoryScene } = await import('../src/js/data/StorySceneRegistry.js');
const {
    ChapterRegionRegistry,
    RegionSceneTrigger,
    isOptionalStoryScene
} = await import('../src/js/data/ChapterRegionRegistry.js');
const {
    StoryEncounterPhase,
    StoryEncounterTransition,
    getStoryEncounterContract,
    validateStoryEncounterContract
} = await import('../src/js/data/StoryEncounterContracts.js');
const { getStoryObjectiveHint } = await import('../src/js/data/StoryObjectiveHints.js');
const { getTownSceneBinding } = await import('../src/js/data/TownPlaces.js');
const { getSceneRegionBinding } = await import('../src/js/data/ChapterRegionRegistry.js');
const {
    getCurrentRunStoryFlagKeys,
    getStorySceneEffects
} = await import('../src/js/data/StoryStateContract.js');
const {
    STORY_SCENE_BACKGROUNDS,
    storySceneManager,
    default: StorySceneManager
} = await import('../src/js/managers/StorySceneManager.js');
const { default: GameManager } = await import('../src/js/managers/GameManager.js');

const failures = [];
const check = (condition, message) => {
    if (!condition) failures.push(message);
};

const sceneIds = Object.freeze([
    'ch4_s01_road_moves_underfoot',
    'ch4_s02_caravan_rear_missing',
    'ch4_s03_thorn_value_rule',
    'ch4_s04_gray_ridge_evacuates',
    'ch4_s05_body_locks',
    'ch4_s06_flag_returns',
    'ch4_s07_titan_rises',
    'ch4_s08_returned_objects',
    'ch4_s09_four_elements_one_report'
]);

check(
    JSON.stringify(StorySceneOrder.filter(id => id.startsWith('ch4_'))) === JSON.stringify(sceneIds),
    'Chapter 4 scene order changed'
);

for (const sceneId of sceneIds) {
    const scene = getStoryScene(sceneId);
    check(Boolean(scene), `Missing ${sceneId}`);
    if (!scene) continue;
    check(scene.chapter === 4, `${sceneId} is not in Chapter 4`);
    check(Boolean(scene.title?.trim()), `${sceneId} has no player-facing title`);
    check(scene.beats.length > 0, `${sceneId} has no beats`);
    check(
        scene.beats.every((beat, index) => beat.order === index + 1),
        `${sceneId} beat order is broken`
    );
    check(
        scene.beats
            .filter(beat => ['narration', 'speaker'].includes(beat.beat))
            .every(beat => !/(?:場景功能|玩家必須|系統提示|任務目標|本章)/u.test(beat.text)),
        `${sceneId} exposes production labels in player-facing text`
    );
}

const region = ChapterRegionRegistry.chapter_04_gray_ridge;
check(region?.chapter === 4, 'Chapter 4 region is missing');
check(region?.visual?.tileId === 'gray_ridge_highlands', 'Chapter 4 map tile id is missing');
check(region?.visual?.backgroundId === 'overworld_gray_ridge', 'Chapter 4 map asset id is missing');
check(region?.visual?.renderRoutes === false, 'Chapter 4 map must not paint route lines');
check(region?.visual?.renderBoundary === false, 'Chapter 4 map must not paint region boundaries');
check(region?.bossConvergence?.sceneId === 'ch4_s07_titan_rises', 'Ancient Titan is not Chapter 4 convergence');
check(region?.bossConvergence?.locationId === 'titan_vein_ruins', 'Ancient Titan uses the wrong arena');
check(region?.returnState?.afterSceneId === 'ch4_s07_titan_rises', 'Chapter 4 return is not after the Titan');

const bindingExpectations = Object.freeze({
    ch4_s01_road_moves_underfoot: ['moving_stone_road', RegionSceneTrigger.REGION_ENTRY],
    ch4_s03_thorn_value_rule: ['thorn_glasshouse_ruin', RegionSceneTrigger.LOCATION_ENTER],
    ch4_s04_gray_ridge_evacuates: ['gray_ridge_causeway', RegionSceneTrigger.SEGMENT_ENTER],
    ch4_s05_body_locks: ['rear_marker', RegionSceneTrigger.LOCATION_ENTER],
    ch4_s06_flag_returns: ['center_span_marker', RegionSceneTrigger.LOCATION_ENTER],
    ch4_s07_titan_rises: ['titan_vein_ruins', RegionSceneTrigger.BOSS_CONVERGENCE]
});
for (const [sceneId, [targetId, trigger]] of Object.entries(bindingExpectations)) {
    const binding = region?.sceneBindings?.find(entry => entry.sceneId === sceneId);
    check(Boolean(binding), `${sceneId} has no map binding`);
    check(binding?.targetId === targetId, `${sceneId} points to the wrong map target`);
    check(binding?.trigger === trigger, `${sceneId} uses the wrong map trigger`);
}
check(isOptionalStoryScene('ch4_s03_thorn_value_rule'), 'First-run Thorn Witch route is not optional');
check(!isOptionalStoryScene('ch4_s04_gray_ridge_evacuates'), 'Gray Ridge evacuation became optional');
const thornPrerequisite = 'story.ch4.town_aftermath_recorded';
const thornSegment = region?.routeSegments?.find(entry => entry.id === 'thorn_trial_branch');
const thornLocation = region?.locationNodes?.find(entry => entry.id === 'thorn_glasshouse_ruin');
const thornBinding = region?.sceneBindings?.find(entry => entry.sceneId === 'ch4_s03_thorn_value_rule');
check(thornSegment?.prerequisites?.includes(thornPrerequisite), 'Thorn route opens before the town aftermath');
check(thornLocation?.prerequisites?.includes(thornPrerequisite), 'Thorn location opens before the town aftermath');
check(thornBinding?.prerequisites?.includes(thornPrerequisite), 'Thorn scene binding opens before the town aftermath');

const grayRidgeTile = OverworldMapTiles.find(tile => tile.chapter === 4);
const grayRidgeMapPath = getGeneratedWorldMapImage('overworld_gray_ridge');
check(Boolean(grayRidgeTile), 'Chapter 4 has no playable overworld tile');
check(grayRidgeTile?.cols === WORLD_TILE_COLS, 'Chapter 4 map width is not 48 cells');
check(grayRidgeTile?.rows === WORLD_TILE_ROWS, 'Chapter 4 map height is not 32 cells');
check(Boolean(grayRidgeMapPath && fs.existsSync(grayRidgeMapPath)), 'Chapter 4 map image is missing');
check(
    getOverworldTileAt(grayRidgeTile?.x + 3, grayRidgeTile?.y + 18)?.chapter === 4,
    'Chapter 4 stone-route entry is outside its map tile'
);
check(
    getOverworldTileAt(grayRidgeTile?.x + 43, grayRidgeTile?.y + 14)?.chapter === 4,
    'Chapter 4 Titan ruin is outside its map tile'
);
const grayRidgeHabitat = OverworldHabitats.find(entry => entry.id === 'gray_ridge_highlands');
check(grayRidgeHabitat?.chapter === 4, 'Chapter 4 has no overworld habitat');
check(
    JSON.stringify(grayRidgeHabitat?.monsterIds) === JSON.stringify([
        'ancient_guardian',
        'crystal_golem',
        'earth_elemental',
        'rune_keeper'
    ]),
    'Chapter 4 overworld ecology pool changed'
);
check(
    !grayRidgeHabitat?.monsterIds?.some(id => ['thorn_witch', 'ancient_titan'].includes(id)),
    'Chapter 4 route or main Boss leaked into random encounters'
);
for (const locationId of region?.locationNodes?.map(node => node.id) || []) {
    const landmark = OverworldLandmarks.find(entry => entry.id === locationId);
    check(Boolean(landmark), `Chapter 4 map is missing landmark ${locationId}`);
    check(
        getOverworldTileAt(landmark?.x, landmark?.y)?.chapter === 4,
        `Chapter 4 landmark ${locationId} is outside the Gray Ridge tile`
    );
}
const thornLandmark = OverworldLandmarks.find(entry => entry.id === 'thorn_glasshouse_ruin');
check(thornLandmark?.prerequisites?.includes(thornPrerequisite), 'Thorn landmark dropped its prerequisite');

const encounterExpectations = Object.freeze({
    ch4_s03_thorn_value_rule: ['thorn_witch', 6, 7],
    ch4_s07_titan_rises: ['ancient_titan', 6, 7]
});
for (const [sceneId, [monsterId, combatIndex, postIndex]] of Object.entries(encounterExpectations)) {
    const scene = getStoryScene(sceneId);
    const encounter = getStoryEncounterContract(sceneId, 1);
    check(encounter?.monsterId === monsterId, `${sceneId} does not fight ${monsterId}`);
    check(encounter?.combatStartBeatIndex === combatIndex, `${sceneId} combat boundary moved`);
    check(encounter?.postBattleBeatIndex === postIndex, `${sceneId} post-battle boundary moved`);
    const errors = validateStoryEncounterContract(scene, encounter);
    check(errors.length === 0, `${sceneId} encounter contract: ${errors.join(', ')}`);
}

const hintExpectations = Object.freeze({
    ch4_s01_road_moves_underfoot: { targetId: 'moving_stone_road' },
    ch4_s02_caravan_rear_missing: { placeId: 'market', actorId: 'merchant' },
    ch4_s03_thorn_value_rule: { targetId: 'thorn_glasshouse_ruin' },
    ch4_s04_gray_ridge_evacuates: { targetId: 'gray_ridge_causeway' },
    ch4_s05_body_locks: { targetId: 'rear_marker' },
    ch4_s06_flag_returns: { targetId: 'center_span_marker' },
    ch4_s07_titan_rises: { targetId: 'titan_vein_ruins' },
    ch4_s08_returned_objects: { placeId: 'forge', actorId: 'blacksmith' },
    ch4_s09_four_elements_one_report: { placeId: 'handbook', actorId: 'town_scholar' }
});
for (const [sceneId, expected] of Object.entries(hintExpectations)) {
    const binding = expected.placeId
        ? getTownSceneBinding(sceneId)
        : getSceneRegionBinding(sceneId);
    for (const [key, value] of Object.entries(expected)) {
        check(binding?.[key] === value, `${sceneId} has the wrong ${key}`);
    }
}

const firstMarker = getStorySceneEffects('ch4_s05_body_locks', 1)?.flags || {};
const secondMarker = getStorySceneEffects('ch4_s05_body_locks', 2)?.flags || {};
check(firstMarker['story.ch4.rear_marker'] === 'failed', 'First-run rear marker does not fail');
check(secondMarker['story.ch4.rear_marker'] === 'lit', 'Second-run rear marker does not light');
check(
    getStorySceneEffects('ch4_s06_flag_returns', 1)?.flags?.['story.fate.frey'] === 'dead',
    'First-run Frey fate is missing'
);
check(
    getStorySceneEffects('ch4_s06_flag_returns', 2)?.flags?.['story.fate.frey'] === 'alive',
    'Second-run Frey fate is missing'
);
check(
    getStorySceneEffects('ch4_s07_titan_rises', 1)?.flags?.['boss.ancient_titan.defeated'] === true,
    'Ancient Titan defeat state is missing'
);
check(
    getStorySceneEffects('ch4_s09_four_elements_one_report', 1)?.flags?.['story.chapter_05.open'] === true,
    'Chapter 4 ending does not open Chapter 5'
);
check(
    getCurrentRunStoryFlagKeys({
        'story.chapter_05.open': true,
        'story.ch4.evacuation_complete': true
    }).length === 2,
    'Chapter unlock or Chapter 4 flags would leak across run reset'
);

const thornEssence = MonsterDatabase.thorn_witch?.drops?.find(drop => drop.itemId === 'forest_essence');
const titanHammer = MonsterDatabase.ancient_titan?.equipmentDrops?.find(drop => drop.equipmentId === 'titan_hammer');
check(thornEssence?.chance === 1, 'Thorn Witch does not guarantee ordinary Forest Essence');
check(titanHammer?.chance === 0.2, 'Ancient Titan titan_hammer chance is outside the Boss equipment rule');
check(
    !JSON.stringify(MonsterDatabase.ancient_titan || {}).includes('titan_heart'),
    'Ancient Titan still drops titan_heart'
);

for (const sceneId of [
    'ch4_s02_caravan_rear_missing',
    'ch4_s03_thorn_value_rule',
    'ch4_s08_returned_objects',
    'ch4_s09_four_elements_one_report'
]) {
    const background = STORY_SCENE_BACKGROUNDS[sceneId];
    check(Boolean(background && fs.existsSync(background)), `${sceneId} existing background binding is missing`);
    check(
        storySceneManager.buildPresentation(sceneId)?.backgroundImage === background,
        `${sceneId} does not resolve its existing background`
    );
}

const originalFlags = GameManager.state.flags;
GameManager.state.flags = {
    'story.run': 1,
    'story.chapter': 4,
    'story.chapter_04.open': true
};
const lifecycleManager = new StorySceneManager();
const firstRunFlagScene = lifecycleManager.buildPresentation('ch4_s06_flag_returns');
check(
    firstRunFlagScene?.timeline?.find(beat => beat.order === 8)?.backgroundImage
        === 'src/assets/images/art/scenes/story/cg/frey-last-standard.webp',
    'First-run Frey climax does not resolve the approved story CG'
);
for (const sceneId of sceneIds) {
    const started = lifecycleManager.startScene(sceneId, { force: true });
    check(started?.success, `${sceneId} cannot start in the first run`);
    if (!started?.success) continue;

    let result = lifecycleManager.completeScene(sceneId, { phase: started.scenePhase });
    if (result.transition === StoryEncounterTransition.ENCOUNTER_REQUIRED) {
        const began = lifecycleManager.beginEncounter(result.encounter?.id);
        check(began?.success, `${sceneId} encounter cannot begin`);
        result = lifecycleManager.resolveEncounter(result.encounter?.id, { victory: true });
        if (result.transition === StoryEncounterTransition.POST_BATTLE) {
            result = lifecycleManager.completeScene(sceneId, {
                phase: result.presentation?.scenePhase || StoryEncounterPhase.POST_BATTLE
            });
        }
    }
    check(Boolean(result?.success && result?.completed), `${sceneId} cannot complete its first-run lifecycle`);
}
check(GameManager.getFlag('boss.ancient_titan.defeated') === true, 'First-run lifecycle did not record the Titan defeat');
check(GameManager.getFlag('story.chapter_05.open') === true, 'First-run lifecycle did not open Chapter 5');
GameManager.state.flags = {
    'story.run': 2,
    'story.chapter': 4,
    'story.chapter_04.open': true
};
const secondRunFlagScene = new StorySceneManager().buildPresentation('ch4_s06_flag_returns');
check(
    !secondRunFlagScene?.timeline?.some(beat => beat.backgroundImage?.endsWith('/frey-last-standard.webp')),
    'First-run Frey climax CG leaks into the second run'
);
GameManager.state.flags = originalFlags;

if (failures.length) {
    console.error(`Chapter 4 gameplay check failed (${failures.length})`);
    failures.forEach(failure => console.error(`- ${failure}`));
    process.exit(1);
}

const missingGrayRidgeBackgrounds = [
    'ch4_s01_road_moves_underfoot',
    'ch4_s04_gray_ridge_evacuates',
    'ch4_s05_body_locks',
    'ch4_s06_flag_returns',
    'ch4_s07_titan_rises'
].filter(sceneId => !STORY_SCENE_BACKGROUNDS[sceneId]);

console.log('Chapter 4 gameplay check passed');
console.log(`- scenes: ${sceneIds.length}`);
console.log(`- overworld: ${grayRidgeTile.cols} x ${grayRidgeTile.rows} cells`);
console.log('- encounters: Thorn Witch, Ancient Titan');
console.log('- state chain: caravan rescue -> marker fate -> Titan -> Chapter 5');
console.log(`- deferred Gray Ridge backgrounds: ${missingGrayRidgeBackgrounds.length}`);
