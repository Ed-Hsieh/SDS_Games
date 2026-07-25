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

const { StorySceneOrder, getStoryScene } = await import('../src/js/data/StorySceneRegistry.js');
const {
    ChapterRegionRegistry,
    isOptionalStoryScene
} = await import('../src/js/data/ChapterRegionRegistry.js');
const {
    getStoryEncounterContract,
    validateStoryEncounterContract
} = await import('../src/js/data/StoryEncounterContracts.js');
const { getStoryObjectiveHint } = await import('../src/js/data/StoryObjectiveHints.js');
const { getTownSceneBinding } = await import('../src/js/data/TownPlaces.js');
const { getStorySceneEffects } = await import('../src/js/data/StoryStateContract.js');
const { StoryActorRegistry } = await import('../src/js/data/StoryActors.js');
const {
    OverworldHabitats,
    OverworldLandmarks,
    OverworldMapTiles,
    WORLD_TILE_COLS,
    WORLD_TILE_ROWS,
    getOverworldTileAt
} = await import('../src/js/data/OverworldMapRegistry.js');
const { getGeneratedWorldMapImage } = await import('../src/js/data/AssetManifest.js');
const {
    STORY_SCENE_BACKGROUNDS,
    storySceneManager
} = await import('../src/js/managers/StorySceneManager.js');

const adventureSource = fs.readFileSync('src/js/scenes/AdventureScene.js', 'utf8');
const failures = [];
const check = (condition, message) => {
    if (!condition) failures.push(message);
};

const sceneIds = Object.freeze([
    'ch3_s01_dead_checkpoint',
    'ch3_s02_shadows_count_names',
    'ch3_s03_lamp_oil_in_fog',
    'ch3_s04_showcase_glass',
    'ch3_s05_blank_creditor_trace',
    'ch3_s06_drowned_voice',
    'ch3_s07_old_command_post',
    'ch3_s08_shadow_commander',
    'ch3_s09_temptation_and_orders'
]);

check(
    JSON.stringify(StorySceneOrder.filter(id => id.startsWith('ch3_'))) === JSON.stringify(sceneIds),
    'Chapter 3 scene order changed'
);

for (const sceneId of sceneIds) {
    const scene = getStoryScene(sceneId);
    check(Boolean(scene), `Missing ${sceneId}`);
    if (!scene) continue;
    check(scene.chapter === 3, `${sceneId} is not in Chapter 3`);
    check(Boolean(scene.title?.trim()), `${sceneId} has no title`);
    check(scene.beats.every((beat, index) => beat.order === index + 1), `${sceneId} beat order is broken`);
    check(
        scene.beats
            .filter(beat => beat.beat === 'narration')
            .every(beat => !/(?:^|[^不])你(?:的|們|會|要|看|走|能|已|把)/u.test(beat.text)),
        `${sceneId} narration breaks first-person viewpoint`
    );
    check(
        scene.beats.every(beat => !/(?:場景功能|玩家必須|本章|伏筆|系統提示|任務目標)/u.test(beat.text)),
        `${sceneId} exposes production labels`
    );

    const background = STORY_SCENE_BACKGROUNDS[sceneId];
    check(Boolean(background), `${sceneId} has no background binding`);
    check(Boolean(background && fs.existsSync(background)), `${sceneId} background is missing`);
    check(
        storySceneManager.buildPresentation(sceneId)?.backgroundImage === background,
        `${sceneId} does not resolve its background`
    );
}

const optionalScenes = [
    'ch3_s04_showcase_glass',
    'ch3_s05_blank_creditor_trace',
    'ch3_s06_drowned_voice'
];
for (const sceneId of optionalScenes) {
    check(isOptionalStoryScene(sceneId), `${sceneId} is still mandatory`);
}
check(!isOptionalStoryScene('ch3_s07_old_command_post'), 'Old command post was made optional');

const region = ChapterRegionRegistry.chapter_03_shadow_watch;
check(region?.visual?.tileId === 'shadow_watch_borderland', 'Chapter 3 map tile id is missing');
check(region?.visual?.backgroundId === 'overworld_shadow_watch', 'Chapter 3 map asset id is missing');
check(region?.visual?.renderRoutes === false, 'Chapter 3 map must not paint route lines');
check(region?.visual?.renderBoundary === false, 'Chapter 3 map must not paint region boundaries');
check(region?.bossConvergence?.sceneId === 'ch3_s08_shadow_commander', 'Kaedren is not Chapter 3 convergence');
check(
    region?.locationNodes?.find(node => node.id === 'sunken_altar_reef')?.optional === true,
    'Drowned Oracle route is not optional'
);

const shadowWatchTile = OverworldMapTiles.find(tile => tile.chapter === 3);
const shadowWatchMapPath = getGeneratedWorldMapImage('overworld_shadow_watch');
check(Boolean(shadowWatchTile), 'Chapter 3 has no playable overworld tile');
check(shadowWatchTile?.cols === WORLD_TILE_COLS, 'Chapter 3 map width is not 48 cells');
check(shadowWatchTile?.rows === WORLD_TILE_ROWS, 'Chapter 3 map height is not 32 cells');
check(Boolean(shadowWatchMapPath && fs.existsSync(shadowWatchMapPath)), 'Chapter 3 map image is missing');
check(
    getOverworldTileAt(shadowWatchTile?.x + 4, shadowWatchTile?.y + 18)?.chapter === 3,
    'Chapter 3 checkpoint entry is outside its map tile'
);
check(
    getOverworldTileAt(shadowWatchTile?.x + 43, shadowWatchTile?.y + 16)?.chapter === 3,
    'Chapter 3 command yard is outside its map tile'
);
const chapterThreeHabitats = OverworldHabitats.filter(entry => entry.chapter === 3);
check(chapterThreeHabitats.length === 3, 'Chapter 3 does not have three encounter habitats');
check(
    !chapterThreeHabitats.some(entry => entry.monsterIds.some(id => (
        ['drowned_oracle', 'shadow_commander'].includes(id)
    ))),
    'Chapter 3 route or main Boss leaked into random encounters'
);
for (const locationId of region?.locationNodes?.map(node => node.id) || []) {
    const mapLandmark = OverworldLandmarks.find(entry => entry.id === locationId);
    check(Boolean(mapLandmark), `Chapter 3 map is missing landmark ${locationId}`);
    check(
        getOverworldTileAt(mapLandmark?.x, mapLandmark?.y)?.chapter === 3,
        `Chapter 3 landmark ${locationId} is outside the Shadow Watch tile`
    );
}

const encounterExpectations = Object.freeze({
    ch3_s01_dead_checkpoint: ['shadow_soldier', 4, 5],
    ch3_s06_drowned_voice: ['drowned_oracle', 4, 5],
    ch3_s08_shadow_commander: ['shadow_commander', 4, 5]
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
check(
    adventureSource.includes('pendingEncounter?.locationId === entry.id'),
    'A non-Boss story encounter cannot reconnect to its map location'
);
check(
    adventureSource.includes('options.storyContract?.monsterId || entry.bossId'),
    'A non-Boss story encounter still depends on a Boss marker'
);

const hintExpectations = Object.freeze({
    ch3_s02_shadows_count_names: ['forge', 'blacksmith'],
    ch3_s04_showcase_glass: ['casino', null],
    ch3_s05_blank_creditor_trace: ['alley', null],
    ch3_s09_temptation_and_orders: ['crossroads', 'village_elder']
});
for (const [sceneId, [placeId, actorId]] of Object.entries(hintExpectations)) {
    const binding = getTownSceneBinding(sceneId);
    check(binding?.placeId === placeId, `${sceneId} points to the wrong town place`);
    check(binding?.actorId === actorId, `${sceneId} points to the wrong actor`);
}

check(
    getStorySceneEffects('ch3_s08_shadow_commander', 1)?.flags?.['boss.shadow_commander.defeated'] === true,
    'Kaedren defeat state is missing'
);
check(
    getStorySceneEffects('ch3_s09_temptation_and_orders', 1)?.flags?.['story.chapter_04.open'] === true,
    'Chapter 3 ending does not open Chapter 4'
);
check(
    !('story.execution.ancient_rune_bound' in (getStorySceneEffects('ch3_s06_drowned_voice', 1)?.flags || {})),
    'Second-run Ancient Rune knowledge leaks into first run'
);
check(
    getStorySceneEffects('ch3_s06_drowned_voice', 2)?.flags?.['story.execution.ancient_rune_bound'] === true,
    'Second-run Ancient Rune state is missing'
);

for (const actorId of ['shadow_commander', 'drowned_oracle']) {
    const standing = StoryActorRegistry[actorId]?.standing;
    check(Boolean(standing && fs.existsSync(standing)), `${actorId} does not reuse approved Boss art`);
}

if (failures.length) {
    console.error(`Chapter 3 gameplay check failed (${failures.length})`);
    failures.forEach(failure => console.error(`- ${failure}`));
    process.exit(1);
}

console.log('Chapter 3 gameplay check passed');
console.log(`- scenes: ${sceneIds.length}`);
console.log(`- overworld: ${shadowWatchTile.cols} x ${shadowWatchTile.rows} cells`);
console.log(`- optional branches: ${optionalScenes.length}`);
console.log('- encounters: shadow checkpoint, Drowned Oracle, Kaedren');
