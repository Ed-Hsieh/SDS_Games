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
    RegionSceneTrigger
} = await import('../src/js/data/ChapterRegionRegistry.js');
const {
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
    default: StorySceneManager
} = await import('../src/js/managers/StorySceneManager.js');
const { default: GameManager } = await import('../src/js/managers/GameManager.js');

const failures = [];
const check = (condition, message) => {
    if (!condition) failures.push(message);
};

const sceneIds = Object.freeze([
    'ch5_s01_four_fronts_converge',
    'ch5_s02_forge_contracts',
    'ch5_s03_elemental_convergence',
    'ch5_s04_elemental_lord',
    'ch5_s05_fourfold_shrapnel',
    'ch5_s06_mia_operation',
    'ch5_s07_after_the_ratchet',
    'ch5_s08_expedition_list',
    'ch5_s09_whistle_cache',
    'ch5_s10_before_dawn',
    'ch5_s11_town_loses_its_voice'
]);

check(
    JSON.stringify(StorySceneOrder.filter(id => id.startsWith('ch5_'))) === JSON.stringify(sceneIds),
    'Chapter 5 scene order changed'
);

for (const sceneId of sceneIds) {
    const scene = getStoryScene(sceneId);
    check(Boolean(scene), `Missing ${sceneId}`);
    if (!scene) continue;
    check(scene.chapter === 5, `${sceneId} is not in Chapter 5`);
    check(Boolean(scene.title?.trim()), `${sceneId} has no player-facing title`);
    check(scene.beats.length > 0, `${sceneId} has no beats`);
    check(
        scene.beats.every((beat, index) => beat.order === index + 1),
        `${sceneId} beat order is broken`
    );
    check(
        scene.beats
            .filter(beat => ['narration', 'speaker'].includes(beat.beat))
            .every(beat => !/(?:場景功能|系統提示|任務目標|當前周目|解鎖|新增紀錄)/u.test(beat.text)),
        `${sceneId} exposes production labels in player-facing text`
    );
}

const region = ChapterRegionRegistry.chapter_05_four_fronts;
check(region?.chapter === 5, 'Chapter 5 region is missing');
check(region?.bossConvergence?.sceneId === 'ch5_s04_elemental_lord', 'Elemental Lord is not Chapter 5 convergence');
check(region?.bossConvergence?.locationId === 'elemental_core', 'Elemental Lord uses the wrong arena');
check(region?.returnState?.afterSceneId === 'ch5_s05_fourfold_shrapnel', 'Chapter 5 return does not follow the emergency route');

const bindingExpectations = Object.freeze({
    ch5_s03_elemental_convergence: ['convergence_road', RegionSceneTrigger.SEGMENT_ENTER],
    ch5_s04_elemental_lord: ['elemental_core', RegionSceneTrigger.BOSS_CONVERGENCE],
    ch5_s05_fourfold_shrapnel: ['emergency_return', RegionSceneTrigger.RETURN_ROUTE],
    ch5_s09_whistle_cache: ['old_waystation_cache', RegionSceneTrigger.LOCATION_INSPECT]
});
for (const [sceneId, [targetId, trigger]] of Object.entries(bindingExpectations)) {
    const binding = region?.sceneBindings?.find(entry => entry.sceneId === sceneId);
    check(Boolean(binding), `${sceneId} has no map binding`);
    check(binding?.targetId === targetId, `${sceneId} points to the wrong map target`);
    check(binding?.trigger === trigger, `${sceneId} uses the wrong map trigger`);
}

const encounter = getStoryEncounterContract('ch5_s04_elemental_lord', 1);
check(encounter?.monsterId === 'elemental_lord', 'Chapter 5 Boss is not elemental_lord');
check(
    validateStoryEncounterContract(getStoryScene('ch5_s04_elemental_lord'), encounter).length === 0,
    'Elemental Lord encounter contract is invalid'
);

const hintExpectations = Object.freeze({
    ch5_s01_four_fronts_converge: { placeId: 'handbook', actorId: 'town_scholar' },
    ch5_s02_forge_contracts: { placeId: 'forge', actorId: 'blacksmith' },
    ch5_s03_elemental_convergence: { targetId: 'convergence_road' },
    ch5_s04_elemental_lord: { targetId: 'elemental_core' },
    ch5_s05_fourfold_shrapnel: { targetId: 'emergency_return' },
    ch5_s06_mia_operation: { placeId: 'mia_workroom', actorId: 'herbalist' },
    ch5_s07_after_the_ratchet: { placeId: 'handbook', actorId: 'town_scholar' },
    ch5_s08_expedition_list: { placeId: 'handbook', actorId: 'town_scholar' },
    ch5_s09_whistle_cache: { targetId: 'old_waystation_cache' },
    ch5_s10_before_dawn: { placeId: 'handbook', actorId: 'town_scholar' },
    ch5_s11_town_loses_its_voice: { placeId: 'casino', actorId: 'casino_dealer' }
});
for (const [sceneId, expected] of Object.entries(hintExpectations)) {
    const binding = expected.placeId
        ? getTownSceneBinding(sceneId)
        : getSceneRegionBinding(sceneId);
    for (const [key, value] of Object.entries(expected)) {
        check(binding?.[key] === value, `${sceneId} has the wrong ${key}`);
    }
}

check(
    getStorySceneEffects('ch5_s04_elemental_lord', 1)?.flags?.['boss.elemental_lord.defeated'] === true,
    'Elemental Lord defeat state is missing'
);
check(
    getStorySceneEffects('ch5_s06_mia_operation', 1)?.flags?.['story.fate.mia'] === 'dead',
    'First-run Mia fate is missing'
);
check(
    getStorySceneEffects('ch5_s06_mia_operation', 2)?.flags?.['story.fate.mia'] === 'alive',
    'Second-run Mia fate is missing'
);
check(
    getStorySceneEffects('ch5_s10_before_dawn', 1)?.flags?.['story.ch5.elder_departed'] === true,
    'First-run elder departure is missing'
);
check(
    getStorySceneEffects('ch5_s10_before_dawn', 2)?.flags?.['story.ch5.elder_departure_prevented'] === true,
    'Second-run elder interception is missing'
);
check(
    getStorySceneEffects('ch5_s11_town_loses_its_voice', 1)?.flags?.['story.chapter_06.open'] === true,
    'Chapter 5 ending does not open Chapter 6'
);
check(
    getCurrentRunStoryFlagKeys({
        'story.ch5.echo_whistle_recovered': true,
        'story.chapter_06.open': true
    }).length === 2,
    'Chapter 5 or Chapter 6 flags would leak across run reset'
);

for (const sceneId of [
    'ch5_s01_four_fronts_converge',
    'ch5_s02_forge_contracts',
    'ch5_s04_elemental_lord',
    'ch5_s06_mia_operation',
    'ch5_s07_after_the_ratchet',
    'ch5_s08_expedition_list',
    'ch5_s10_before_dawn',
    'ch5_s11_town_loses_its_voice'
]) {
    const background = STORY_SCENE_BACKGROUNDS[sceneId];
    check(Boolean(background && fs.existsSync(background)), `${sceneId} existing background binding is missing`);
}

const originalFlags = GameManager.state.flags;
for (const runNumber of [1, 2]) {
    GameManager.state.flags = {
        'story.run': runNumber,
        'story.chapter': 5,
        'story.chapter_05.open': true
    };
    const manager = new StorySceneManager();
    const townLossPresentation = manager.buildPresentation('ch5_s11_town_loses_its_voice');
    if (runNumber === 1) {
        check(
            townLossPresentation?.timeline?.find(beat => beat.order === 6)?.backgroundImage
                === 'src/assets/images/art/scenes/town/locations/crossroads-first-run-loss.webp',
            'First-run town loss does not keep the depleted crossroads background'
        );
    } else {
        check(
            !townLossPresentation?.timeline?.some(beat => (
                beat.backgroundImage?.endsWith('/crossroads-first-run-loss.webp')
            )),
            'First-run town loss background leaks into the second run'
        );
    }
    for (const sceneId of sceneIds) {
        const started = manager.startScene(sceneId, { force: true });
        check(started?.success, `${sceneId} cannot start in run ${runNumber}`);
        if (!started?.success) continue;

        let result = manager.completeScene(sceneId, { phase: started.scenePhase });
        if (result.transition === StoryEncounterTransition.ENCOUNTER_REQUIRED) {
            const began = manager.beginEncounter(result.encounter?.id);
            check(began?.success, `${sceneId} encounter cannot begin in run ${runNumber}`);
            result = manager.resolveEncounter(result.encounter?.id, { victory: true });
            if (result.transition === StoryEncounterTransition.POST_BATTLE) {
                result = manager.completeScene(sceneId, {
                    phase: result.presentation?.scenePhase
                });
            }
        }
        check(Boolean(result?.success && result?.completed), `${sceneId} cannot complete in run ${runNumber}`);
    }
    check(GameManager.getFlag('story.chapter_06.open') === true, `Run ${runNumber} did not open Chapter 6`);
}
GameManager.state.flags = originalFlags;

if (failures.length) {
    console.error(`Chapter 5 gameplay check failed (${failures.length})`);
    failures.forEach(failure => console.error(`- ${failure}`));
    process.exit(1);
}

const deferredDedicatedBackgrounds = [
    'ch5_s03_elemental_convergence',
    'ch5_s05_fourfold_shrapnel',
    'ch5_s09_whistle_cache'
].filter(sceneId => !STORY_SCENE_BACKGROUNDS[sceneId]);

console.log('Chapter 5 gameplay check passed');
console.log(`- scenes: ${sceneIds.length}`);
console.log('- encounter: Elemental Lord');
console.log(`- dedicated field backgrounds deferred: ${deferredDedicatedBackgrounds.length}`);
