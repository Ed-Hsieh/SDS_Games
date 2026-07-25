import { existsSync } from 'node:fs';

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
    getGeneratedBackgroundImage,
    getGeneratedLandmarkImage,
    getGeneratedWorldMapImage
} = await import('../src/js/data/AssetManifest.js');
const { STORY_SCENE_BACKGROUNDS } = await import('../src/js/managers/StorySceneManager.js');

const failures = [];
const check = (condition, message) => {
    if (!condition) failures.push(message);
};

const sceneIds = Object.freeze([
    'ch7_s01_narrow_human_road',
    'ch7_s02_ruined_flower_field',
    'ch7_s03_echo_memory',
    'ch7_s04_three_anchor_check',
    'ch7_s05_fall_site_audience',
    'ch7_s06_combat_body_falls',
    'ch7_s07_last_core',
    'ch7_s08_return_to_town',
    'ch7_s09_first_or_second_epilogue'
]);

const expectedTitles = Object.freeze([
    '舊山路',
    '約定之地',
    '花田回聲',
    '最後的準備',
    '墜落之地',
    '倒下的身體',
    '最後的核心',
    '回到城鎮',
    '回聲盡頭，花仍會開'
]);

check(
    JSON.stringify(StorySceneOrder.filter(id => id.startsWith('ch7_'))) === JSON.stringify(sceneIds),
    'Chapter 7 scene order changed'
);

const playerFacingText = [];
for (const [index, sceneId] of sceneIds.entries()) {
    const scene = getStoryScene(sceneId);
    check(Boolean(scene), `Missing ${sceneId}`);
    if (!scene) continue;

    check(scene.chapter === 7, `${sceneId} is not in Chapter 7`);
    check(scene.title === expectedTitles[index], `${sceneId} has the wrong player-facing title`);
    check(scene.beats.length > 0, `${sceneId} has no beats`);
    check(
        scene.beats.every((beat, beatIndex) => beat.order === beatIndex + 1),
        `${sceneId} beat order is broken`
    );
    check(Boolean(getStoryObjectiveHint(sceneId)?.text), `${sceneId} has no objective hint`);

    scene.beats
        .filter(beat => ['narration', 'speaker'].includes(beat.beat))
        .forEach(beat => playerFacingText.push(beat.text || ''));
}

const combinedText = playerFacingText.join('\n');
check(
    !/場景功能|系統提示|任務目標|當前周目|一般戰鬥判定|第二階段介面|系統保留|解鎖|DLC/u.test(combinedText),
    'Chapter 7 player-facing text contains production or system labels'
);
check(
    !/光明|虛空|\bVoid\b/iu.test(combinedText),
    'Mandatory Chapter 7 leaks formal Light or Void content'
);

const region = ChapterRegionRegistry.chapter_07_fall_site;
check(region?.chapter === 7, 'Chapter 7 region is missing');
check(region?.visual?.backgroundId === 'overworld_fall_site', 'Chapter 7 overworld art is not connected');
check(region?.bossConvergence?.bossId === 'demon_lord_asariel', 'Chapter 7 Boss is not demon_lord_asariel');
check(
    region?.bossConvergence?.secondRunCoreSceneId === 'ch7_s07_last_core',
    'Chapter 7 true-kill core scene is not connected'
);

const ruinedFlowerField = region?.locationNodes?.find(node => node.id === 'ruined_flower_field');
const finalMountainCamp = region?.locationNodes?.find(node => node.id === 'final_mountain_camp');
check(ruinedFlowerField?.imageId === 'ruined-flower-field', 'Ruined flower-field art is not connected');
check(finalMountainCamp?.imageId === 'final-mountain-camp', 'Final mountain camp art is not connected');
check(Boolean(getGeneratedWorldMapImage('overworld_fall_site')), 'Chapter 7 overworld art is not registered');
check(Boolean(getGeneratedLandmarkImage('ruined-flower-field')), 'Ruined flower-field art is not registered');
check(Boolean(getGeneratedLandmarkImage('final-mountain-camp')), 'Final mountain camp art is not registered');
check(Boolean(getGeneratedBackgroundImage('town-overview-hollow-victory')), 'Hollow-victory town art is not registered');
check(
    STORY_SCENE_BACKGROUNDS.ch7_s04_three_anchor_check?.endsWith('/final-mountain-camp.webp'),
    'Chapter 7 scene backgrounds are not connected'
);
check(
    existsSync('src/assets/images/art/scenes/story/cg/demon-survives-ending.webp'),
    'Surviving Demon King ending CG is missing'
);

const bindingExpectations = Object.freeze({
    ch7_s01_narrow_human_road: ['echo_blind_turns', RegionSceneTrigger.REGION_ENTRY],
    ch7_s02_ruined_flower_field: ['ruined_flower_field', RegionSceneTrigger.LOCATION_ENTER],
    ch7_s04_three_anchor_check: ['final_mountain_camp', RegionSceneTrigger.LOCATION_INSPECT],
    ch7_s05_fall_site_audience: ['demon_fall_site', RegionSceneTrigger.BOSS_CONVERGENCE],
    ch7_s06_combat_body_falls: ['demon_fall_site', RegionSceneTrigger.BOSS_CONVERGENCE],
    ch7_s07_last_core: ['demon_fall_site', RegionSceneTrigger.BOSS_CONVERGENCE]
});

for (const [sceneId, [targetId, trigger]] of Object.entries(bindingExpectations)) {
    const binding = region?.sceneBindings?.find(entry => entry.sceneId === sceneId);
    check(binding?.targetId === targetId, `${sceneId} points to the wrong map target`);
    check(binding?.trigger === trigger, `${sceneId} uses the wrong map trigger`);
}

for (const runNumber of [1, 2]) {
    const encounter = getStoryEncounterContract('ch7_s05_fall_site_audience', runNumber);
    check(encounter?.monsterId === 'demon_lord_asariel', `Run ${runNumber} uses the wrong final Boss`);
    check(
        validateStoryEncounterContract(getStoryScene('ch7_s05_fall_site_audience'), encounter).length === 0,
        `Run ${runNumber} final Boss encounter contract is invalid`
    );
}

check(
    getStorySceneEffects('ch7_s04_three_anchor_check', 1)?.flags?.['story.ch7.true_kill_ready'] === false,
    'First run incorrectly prepares the true kill'
);
check(
    getStorySceneEffects('ch7_s04_three_anchor_check', 2)?.flags?.['story.ch7.true_kill_ready'] === true,
    'Second run does not prepare the true kill'
);
check(
    getStorySceneEffects('ch7_s06_combat_body_falls', 1)?.flags?.['story.ch7.core'] === 'unseen',
    'First-run hidden core state is missing'
);
check(
    getStorySceneEffects('ch7_s06_combat_body_falls', 2)?.flags?.['story.ch7.core'] === 'exposed',
    'Second-run exposed core state is missing'
);
check(
    getStorySceneEffects('ch7_s07_last_core', 1)?.flags?.['story.fate.demonKing'] === 'surviving',
    'First-run Demon King survival state is missing'
);
check(
    getStorySceneEffects('ch7_s07_last_core', 2)?.flags?.['story.fate.demonKing'] === 'dead',
    'Second-run Demon King death state is missing'
);
check(
    getStorySceneEffects('ch7_s08_return_to_town', 1)?.flags?.['story.ch7.town_return'] === 'hollow',
    'First-run hollow town return is missing'
);
check(
    getStorySceneEffects('ch7_s08_return_to_town', 2)?.flags?.['story.ch7.town_return'] === 'true',
    'Second-run true town return is missing'
);
check(
    getStorySceneEffects('ch7_s09_first_or_second_epilogue', 1)?.flags?.['story.ending'] === 'hollow_victory',
    'First-run hollow ending is missing'
);
check(
    getStorySceneEffects('ch7_s09_first_or_second_epilogue', 1)?.flags?.['story.secondRunUnlocked'] === true,
    'First run does not unlock the second run'
);
check(
    getStorySceneEffects('ch7_s09_first_or_second_epilogue', 2)?.flags?.['story.ending'] === 'true_ending',
    'Second-run true ending is missing'
);
check(
    getStorySceneEffects('ch7_s09_first_or_second_epilogue', 2)?.flags?.['story.campaignComplete'] === true,
    'Second run does not complete the base campaign'
);

if (failures.length) {
    console.error(`Chapter 7 gameplay check failed (${failures.length})`);
    failures.forEach(failure => console.error(`- ${failure}`));
    process.exit(1);
}

console.log('Chapter 7 gameplay check passed');
console.log(`- scenes: ${sceneIds.length}`);
console.log('- first run: apparent victory and surviving Demon King');
console.log('- second run: exposed core and true ending');
console.log('- mandatory route: no formal Light or Void dependency');
