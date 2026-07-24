import fs from 'node:fs';

const { StorySceneOrder, getStoryScene } = await import('../src/js/data/StorySceneRegistry.js');
const {
    ChapterRegionRegistry,
    RegionSceneTrigger
} = await import('../src/js/data/ChapterRegionRegistry.js');
const {
    getStoryEncounterContract,
    validateStoryEncounterContract
} = await import('../src/js/data/StoryEncounterContracts.js');
const { getStoryObjectiveHint } = await import('../src/js/data/StoryObjectiveHints.js');
const { getStorySceneEffects } = await import('../src/js/data/StoryStateContract.js');
const {
    OverworldHabitats,
    OverworldLandmarks,
    OverworldMapTiles,
    WORLD_TILE_COLS,
    WORLD_TILE_ROWS,
    getOverworldTileAt
} = await import('../src/js/data/OverworldMapRegistry.js');
const { getGeneratedWorldMapImage } = await import('../src/js/data/AssetManifest.js');

const failures = [];
const check = (condition, message) => {
    if (!condition) failures.push(message);
};

const sceneIds = Object.freeze([
    'ch6_s01_northern_drake_watch',
    'ch6_s02_scar_aftermath',
    'ch6_s03_stop_before_the_line',
    'ch6_s04_dragon_convergence',
    'ch6_s05_after_the_broad_road',
    'ch6_s06_settlement_throw',
    'ch6_s07_house_changes_seats',
    'ch6_s08_brush_past_or_invitation',
    'ch6_s09_the_old_note_answers'
]);

check(
    JSON.stringify(StorySceneOrder.filter(id => id.startsWith('ch6_'))) === JSON.stringify(sceneIds),
    'Chapter 6 scene order changed'
);

for (const sceneId of sceneIds) {
    const scene = getStoryScene(sceneId);
    check(Boolean(scene), `Missing ${sceneId}`);
    if (!scene) continue;
    check(scene.chapter === 6, `${sceneId} is not in Chapter 6`);
    check(Boolean(scene.title?.trim()), `${sceneId} has no player-facing title`);
    check(scene.beats.length > 0, `${sceneId} has no beats`);
    check(
        scene.beats.every((beat, index) => beat.order === index + 1),
        `${sceneId} beat order is broken`
    );
    check(Boolean(getStoryObjectiveHint(sceneId)?.text), `${sceneId} has no objective hint`);
}

const pursuit = getStoryScene('ch6_s01_northern_drake_watch');
check(pursuit?.viewpoint === 'protagonist_limited', 'Elder pursuit is not protagonist-limited');
check(
    !pursuit?.beats.some(beat => beat.actorId === 'village_elder'),
    'Elder pursuit still contains an audience-only elder performance'
);

const aftermath = getStoryScene('ch6_s02_scar_aftermath');
const aftermathText = aftermath?.beats
    .filter(beat => ['narration', 'speaker'].includes(beat.beat))
    .map(beat => beat.text)
    .join('\n') || '';
check(/沒有爪痕/u.test(aftermathText), 'Aftermath does not expose the no-claw-wound evidence');
check(/沒有出鞘/u.test(aftermathText), 'Aftermath does not expose the sheathed-weapon evidence');
check(/碎片/u.test(aftermathText), 'Aftermath does not expose the matched fragment');
check(
    !/遺書|最後的話|告別/u.test(aftermathText.replaceAll('沒有遺書', '')),
    'Aftermath invents a farewell or private confession'
);

const region = ChapterRegionRegistry.chapter_06_dragon_scar;
check(region?.chapter === 6, 'Chapter 6 region is missing');
check(region?.visual?.tileId === 'dragon_scar_perimeter', 'Chapter 6 map tile id is missing');
check(region?.visual?.backgroundId === 'overworld_dragon_scar', 'Chapter 6 map asset id is missing');
check(region?.visual?.renderRoutes === false, 'Chapter 6 map must not paint route lines');
check(region?.visual?.renderBoundary === false, 'Chapter 6 map must not paint region boundaries');
check(region?.bossConvergence?.bossId === 'elder_dragon', 'Chapter 6 Boss is not elder_dragon');
check(
    region?.bossConvergence?.secondRunResolution === 'evidence_bound_non_attack',
    'Chapter 6 second-run resolution is not evidence-bound non-attack'
);

const dragonScarTile = OverworldMapTiles.find(tile => tile.chapter === 6);
const dragonScarMapPath = getGeneratedWorldMapImage('overworld_dragon_scar');
check(Boolean(dragonScarTile), 'Chapter 6 has no playable overworld tile');
check(dragonScarTile?.cols === WORLD_TILE_COLS, 'Chapter 6 map width is not 48 cells');
check(dragonScarTile?.rows === WORLD_TILE_ROWS, 'Chapter 6 map height is not 32 cells');
check(Boolean(dragonScarMapPath && fs.existsSync(dragonScarMapPath)), 'Chapter 6 map image is missing');
check(
    getOverworldTileAt(dragonScarTile?.x + 3, dragonScarTile?.y + 18)?.chapter === 6,
    'Chapter 6 drake-watch entry is outside its map tile'
);
check(
    getOverworldTileAt(dragonScarTile?.x + 44, dragonScarTile?.y + 15)?.chapter === 6,
    'Chapter 6 dragon line is outside its map tile'
);
const chapterSixHabitats = OverworldHabitats.filter(entry => entry.chapter === 6);
check(chapterSixHabitats.length === 3, 'Chapter 6 does not have three encounter habitats');
check(
    !chapterSixHabitats.some(entry => entry.monsterIds.includes('elder_dragon')),
    'Elder Dragon leaked into random Chapter 6 encounters'
);
for (const locationId of region?.locationNodes?.map(node => node.id) || []) {
    const mapLandmark = OverworldLandmarks.find(entry => entry.id === locationId);
    check(Boolean(mapLandmark), `Chapter 6 map is missing landmark ${locationId}`);
    check(
        getOverworldTileAt(mapLandmark?.x, mapLandmark?.y)?.chapter === 6,
        `Chapter 6 landmark ${locationId} is outside the Dragon Scar tile`
    );
}

const bindingExpectations = Object.freeze({
    ch6_s01_northern_drake_watch: ['elder_pursuit', RegionSceneTrigger.REGION_ENTRY],
    ch6_s02_scar_aftermath: ['seal_warning_line', RegionSceneTrigger.LOCATION_ENTER],
    ch6_s03_stop_before_the_line: ['seal_warning_line', RegionSceneTrigger.LOCATION_INSPECT],
    ch6_s04_dragon_convergence: ['elder_dragon_line', RegionSceneTrigger.BOSS_CONVERGENCE],
    ch6_s05_after_the_broad_road: ['blind_collapse_return', RegionSceneTrigger.RETURN_ROUTE],
    ch6_s09_the_old_note_answers: ['old_route_mouth', RegionSceneTrigger.LOCATION_INSPECT]
});
for (const [sceneId, [targetId, trigger]] of Object.entries(bindingExpectations)) {
    const binding = region?.sceneBindings?.find(entry => entry.sceneId === sceneId);
    check(binding?.targetId === targetId, `${sceneId} points to the wrong map target`);
    check(binding?.trigger === trigger, `${sceneId} uses the wrong map trigger`);
}

const encounter = getStoryEncounterContract('ch6_s04_dragon_convergence', 1);
check(encounter?.monsterId === 'elder_dragon', 'Chapter 6 encounter uses the wrong monster');
check(
    validateStoryEncounterContract(getStoryScene('ch6_s04_dragon_convergence'), encounter).length === 0,
    'Elder Dragon encounter contract is invalid'
);
check(
    getStoryEncounterContract('ch6_s04_dragon_convergence', 2) === null,
    'Elder Dragon battle leaks into the second run'
);

check(
    getStorySceneEffects('ch6_s04_dragon_convergence', 1)?.flags?.['boss.elder_dragon.defeated'] === true,
    'First-run Elder Dragon defeat state is missing'
);
check(
    getStorySceneEffects('ch6_s04_dragon_convergence', 2)?.flags?.['story.ch6.dragon_non_attack_observed'] === true,
    'Second-run non-attack evidence state is missing'
);
check(
    getStorySceneEffects('ch6_s08_brush_past_or_invitation', 1)?.flags?.['story.ch6.echo_whistle'] === 'stolen',
    'First-run Echo Whistle loss is missing'
);
check(
    getStorySceneEffects('ch6_s08_brush_past_or_invitation', 2)?.flags?.['story.ch6.ailo_companion'] === true,
    'Second-run Ailo companion state is missing'
);
for (const runNumber of [1, 2]) {
    check(
        getStorySceneEffects('ch6_s09_the_old_note_answers', runNumber)?.flags?.['story.chapter_07.open'] === true,
        `Run ${runNumber} does not open Chapter 7`
    );
}

if (failures.length) {
    console.error(`Chapter 6 gameplay check failed (${failures.length})`);
    failures.forEach(failure => console.error(`- ${failure}`));
    process.exit(1);
}

console.log('Chapter 6 gameplay check passed');
console.log(`- scenes: ${sceneIds.length}`);
console.log(`- overworld: ${dragonScarTile.cols} x ${dragonScarTile.rows} cells`);
console.log('- first run: Elder Dragon battle and containment collapse');
console.log('- second run: evidence-bound non-attack');
console.log('- handoff: old route opens Chapter 7');
