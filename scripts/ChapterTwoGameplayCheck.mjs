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
const { StoryActorRegistry, getStoryExpressionLayer } = await import('../src/js/data/StoryActors.js');
const { TownDialogueDatabase } = await import('../src/js/data/NPCDialogues.js');
const { ChapterRegionRegistry } = await import('../src/js/data/ChapterRegionRegistry.js');
const { getStoryObjectiveHint } = await import('../src/js/data/StoryObjectiveHints.js');
const { getStoryEncounterContract } = await import('../src/js/data/StoryEncounterContracts.js');
const { getStorySceneEffects } = await import('../src/js/data/StoryStateContract.js');
const { STORY_SCENE_BACKGROUNDS, storySceneManager } = await import('../src/js/managers/StorySceneManager.js');

const failures = [];
const check = (condition, message) => {
    if (!condition) failures.push(message);
};

const chapterTwoSceneIds = Object.freeze([
    'ch2_s01_empty_crates',
    'ch2_s02_name_under_basket',
    'ch2_s03_ledger_that_would_not_close',
    'ch2_s04_mist_and_tomb_route',
    'ch2_s05_moon_moss_trace',
    'ch2_s06_keeper_of_names',
    'ch2_s07_names_return_to_town',
    'ch2_s08_shadow_at_the_checkpoint'
]);

const orderedChapterTwoScenes = StorySceneOrder.filter(sceneId => sceneId.startsWith('ch2_'));
check(
    JSON.stringify(orderedChapterTwoScenes) === JSON.stringify(chapterTwoSceneIds),
    `Chapter 2 scene order changed: ${orderedChapterTwoScenes.join(', ')}`
);

for (const sceneId of chapterTwoSceneIds) {
    const scene = getStoryScene(sceneId);
    check(Boolean(scene), `Missing Chapter 2 scene: ${sceneId}`);
    if (!scene) continue;
    check(scene.chapter === 2, `${sceneId} is assigned to Chapter ${scene.chapter}`);
    check(Boolean(scene.title?.trim()), `${sceneId} has no player-facing title`);
    check(scene.beats.length > 0, `${sceneId} has no beats`);
    check(
        scene.beats.every((beat, index) => beat.order === index + 1),
        `${sceneId} beat order is not contiguous`
    );
    const hiddenDirections = scene.beats.filter(beat => ['enter', 'exit'].includes(beat.beat));
    const expectedHiddenDirections = sceneId === 'ch2_s06_keeper_of_names'
        ? ['exit', 'enter']
        : [];
    check(
        JSON.stringify(hiddenDirections.map(beat => beat.beat)) === JSON.stringify(expectedHiddenDirections),
        `${sceneId} contains unexpected hidden stage directions`
    );
    check(
        scene.beats
            .filter(beat => beat.beat === 'narration')
            .every(beat => !/(?:^|[^不])你(?:的|們|會|要|看|走|能|已|把)/u.test(beat.text)),
        `${sceneId} narration breaks the protagonist-limited first-person contract`
    );
    check(
        scene.beats.every(beat => !/(?:場景功能|玩家必須|本章|伏筆|系統提示|任務目標)/u.test(beat.text)),
        `${sceneId} exposes screenplay or system labels in player-facing prose`
    );

    const background = STORY_SCENE_BACKGROUNDS[sceneId];
    check(Boolean(background), `${sceneId} has no runtime background binding`);
    check(Boolean(background && fs.existsSync(background)), `${sceneId} background is missing: ${background || '(none)'}`);

    const presentation = storySceneManager.buildPresentation(sceneId);
    check(presentation?.backgroundImage === background, `${sceneId} does not resolve its bound background`);

    for (const beat of scene.beats.filter(beat => beat.beat === 'speaker' && beat.actorId && beat.actorId !== 'player')) {
        const actor = StoryActorRegistry[beat.actorId];
        check(Boolean(actor), `${sceneId} references unknown actor ${beat.actorId}`);
        if (!actor || beat.actorId === 'lich') continue;
        check(
            Boolean(getStoryExpressionLayer(beat.actorId, beat.expression || 'neutral')),
            `${sceneId} uses unavailable ${beat.expression || 'neutral'} art for ${beat.actorId}`
        );
    }
}

check(
    StoryActorRegistry.lich?.standing === 'src/assets/images/art/entities/monsters/lich.webp'
        && fs.existsSync(StoryActorRegistry.lich.standing),
    'Hern dialogue does not reuse the approved Lich Boss art'
);

const expectedTownObjectives = Object.freeze({
    ch2_s01_empty_crates: ['market', 'merchant'],
    ch2_s02_name_under_basket: ['mia_workroom', 'herbalist'],
    ch2_s03_ledger_that_would_not_close: ['handbook', 'town_scholar'],
    ch2_s07_names_return_to_town: ['handbook', 'town_scholar']
});
for (const [sceneId, [placeId, actorId]] of Object.entries(expectedTownObjectives)) {
    const hint = getStoryObjectiveHint(sceneId);
    check(hint?.placeId === placeId, `${sceneId} points to ${hint?.placeId || 'no place'} instead of ${placeId}`);
    check(hint?.actorId === actorId, `${sceneId} points to ${hint?.actorId || 'no actor'} instead of ${actorId}`);
}

const region = ChapterRegionRegistry.chapter_02_broken_evacuations;
const expectedBindings = Object.freeze({
    ch2_s04_mist_and_tomb_route: ['opened_tomb_road', 'segment_enter'],
    ch2_s05_moon_moss_trace: ['moon_moss_slope', 'location_enter'],
    ch2_s06_keeper_of_names: ['opened_ancient_tomb', 'boss_convergence'],
    ch2_s08_shadow_at_the_checkpoint: ['north_checkpoint_exit', 'return_route']
});
for (const [sceneId, [targetId, trigger]] of Object.entries(expectedBindings)) {
    const binding = region.sceneBindings.find(entry => entry.sceneId === sceneId);
    check(Boolean(binding), `${sceneId} has no Chapter 2 map binding`);
    check(binding?.targetId === targetId, `${sceneId} targets ${binding?.targetId || 'nothing'} instead of ${targetId}`);
    check(binding?.trigger === trigger, `${sceneId} uses ${binding?.trigger || 'no trigger'} instead of ${trigger}`);
}

const encounter = getStoryEncounterContract('ch2_s06_keeper_of_names', 1);
check(encounter?.monsterId === 'lich', 'Chapter 2 main Boss is not Lich');
check(encounter?.locationId === 'opened_ancient_tomb', 'Chapter 2 Boss is not bound to the opened tomb');
check(
    encounter?.combatStartBeatIndex === 7 && encounter?.postBattleBeatIndex === 8,
    'Hern battle handoff no longer occurs between beats 8 and 9'
);

const firstRunBossEffects = getStorySceneEffects('ch2_s06_keeper_of_names', 1)?.flags || {};
const secondRunBossEffects = getStorySceneEffects('ch2_s06_keeper_of_names', 2)?.flags || {};
check(firstRunBossEffects['boss.lich.defeated'] === true, 'First-run Lich defeat flag is missing');
check(firstRunBossEffects['story.ch2.lich_phylactery_recovered'] === true, 'First-run phylactery evidence flag is missing');
check(!('story.execution.glimmer_shard_reserved' in firstRunBossEffects), 'Second-run glimmer knowledge leaks into the first run');
check(secondRunBossEffects['story.execution.glimmer_shard_reserved'] === true, 'Second-run glimmer reserve flag is missing');
check(
    getStorySceneEffects('ch2_s07_names_return_to_town', 1)?.flags?.['town.market.public_medicine_authorized'] === true,
    'Chapter 2 return does not authorize public medicine'
);
check(
    !getStorySceneEffects('ch2_s07_names_return_to_town', 1)?.flags?.['town.market.public_medicine'],
    'Chapter 2 opens market stock before the Chapter 3 caravan returns'
);
check(
    getStorySceneEffects('ch2_s08_shadow_at_the_checkpoint', 1)?.flags?.['story.chapter_03.open'] === true,
    'Chapter 2 ending does not open Chapter 3'
);

for (const [npcId, dialogues] of Object.entries(TownDialogueDatabase)) {
    if (npcId === 'street_beggar') continue;
    const ambient = dialogues.find(dialogue => dialogue.tone === 'ambient');
    check(Boolean(ambient), `${npcId} has no ambient opening`);
    check(ambient?.lines?.length === 1, `${npcId} ambient opening is staged like a full event`);
    check(
        ambient?.lines?.every(line => line.actorId !== 'player' && line.speaker !== 'player'),
        `${npcId} ambient opening authors a player reply`
    );
}

if (failures.length) {
    console.error(`Chapter 2 gameplay check failed (${failures.length})`);
    failures.forEach(failure => console.error(`- ${failure}`));
    process.exit(1);
}

console.log('Chapter 2 gameplay check passed');
console.log(`- scenes: ${chapterTwoSceneIds.length}`);
console.log(`- map bindings: ${Object.keys(expectedBindings).length}`);
console.log(`- backgrounds: ${chapterTwoSceneIds.length}`);
console.log('- Boss handoff: ch2_s06 beat 8 -> combat -> beat 9');
