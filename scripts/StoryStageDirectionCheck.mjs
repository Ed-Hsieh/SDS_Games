import fs from 'node:fs';

import { StorySceneRegistry } from '../src/js/data/StorySceneRegistry.js';
import { StoryActorRegistry } from '../src/js/data/StoryActors.js';

const failures = [];
const check = (condition, message) => {
    if (!condition) failures.push(message);
};

let actorStageActionCount = 0;
let flowDirectionCount = 0;
let chapterOneActorStageActionCount = 0;
const cutawayBeats = [];
const forbiddenVisibleTerms = [
    /本傳/u,
    /DLC/iu,
    /主線/u,
    /支線/u,
    /劇情指定/u,
    /場景轉到/u,
    /最後一幕/u,
    /Mia/u,
    /玩家/u,
    /教學/u,
    /Chapter/iu,
    /Boss/iu,
    /Unlock/iu,
    /Lock/iu,
    /achievement/iu,
    /first-run/iu,
    /second-run/iu
];

for (const scene of Object.values(StorySceneRegistry)) {
    for (const beat of scene.beats || []) {
        const isDirection = ['enter', 'exit'].includes(beat.beat);
        const actorIds = beat.actorIds || [];
        const isVisibleBeat = ['narration', 'speaker', 'cutaway'].includes(beat.beat);

        if (beat.beat === 'cutaway') {
            cutawayBeats.push({ sceneId: scene.id, ...beat });
            check(Boolean(beat.actorId), `${scene.id}/${beat.order} cutaway has no viewpoint actor`);
            check(Boolean(beat.text?.trim()), `${scene.id}/${beat.order} cutaway has no readable text`);
        }
        if (isVisibleBeat) {
            for (const pattern of forbiddenVisibleTerms) {
                check(
                    !pattern.test(beat.text || ''),
                    `${scene.id}/${beat.order} exposes production language: ${pattern}`
                );
            }
        }

        if (!isDirection) {
            check(!beat.stageAction, `${scene.id}/${beat.order} exposes a stage action on ${beat.beat}`);
            check(!actorIds.length, `${scene.id}/${beat.order} exposes actorIds on ${beat.beat}`);
            continue;
        }

        if (!actorIds.length) {
            flowDirectionCount += 1;
            check(!beat.stageAction, `${scene.id}/${beat.order} guesses a portrait action from flow prose`);
            continue;
        }

        actorStageActionCount += 1;
        if (scene.chapter === 1) chapterOneActorStageActionCount += 1;
        check(
            beat.stageAction === beat.beat,
            `${scene.id}/${beat.order} stage action does not match its beat`
        );
        check(
            beat.actorId === actorIds[0],
            `${scene.id}/${beat.order} primary actor is not the first stage actor`
        );
        for (const actorId of actorIds) {
            check(Boolean(StoryActorRegistry[actorId]), `${scene.id}/${beat.order} references unknown actor ${actorId}`);
        }
    }
}

const sceneManagerSource = fs.readFileSync(
    new URL('../src/js/managers/StorySceneManager.js', import.meta.url),
    'utf8'
);
const controllerSource = fs.readFileSync(
    new URL('../src/js/managers/StoryDialogueController.js', import.meta.url),
    'utf8'
);

check(
    sceneManagerSource.includes('beat.stageAction && beat.actorIds?.length'),
    'StorySceneManager does not gate portrait actions by explicit actor ids'
);
check(
    sceneManagerSource.includes("['narration', 'cutaway'].includes(beat.beat)"),
    'StorySceneManager does not present cutaways through the shared narration path'
);
check(
    (sceneManagerSource.match(/\['narration', 'speaker', 'cutaway'\]\.includes\(beat\.beat\)/g) || []).length === 4,
    'StorySceneManager does not include cutaways in both full-scene and checkpoint timelines'
);
check(
    controllerSource.includes('presentation.timeline || presentation.lines || []'),
    'StoryDialogueController does not use the shared presentation timeline'
);
check(
    controllerSource.includes('visibleActorIds'),
    'StoryDialogueController has no single-session cast presence state'
);
check(
    chapterOneActorStageActionCount === 12,
    `Expected 12 reviewed Chapter 1 actor stage actions, found ${chapterOneActorStageActionCount}`
);
check(actorStageActionCount >= chapterOneActorStageActionCount, 'Later chapter actor actions were lost');
check(flowDirectionCount > 0, 'All location and control flow directions were lost');
check(cutawayBeats.length === 4, `Expected 4 reviewed cutaways, found ${cutawayBeats.length}`);

const portraitCapable = actorId => Boolean(
    StoryActorRegistry[actorId]?.standing
    || StoryActorRegistry[actorId]?.portrait
    || StoryActorRegistry[actorId]?.image
);
const auditCastRange = (scene, beats, label, runCondition) => {
    const activeBeats = beats.filter(beat => ['any', runCondition].includes(beat.condition));
    const stagedActors = new Set(activeBeats
        .filter(beat => beat.stageAction === 'enter')
        .flatMap(beat => beat.actorIds || []));
    const usedActors = new Set(activeBeats
        .flatMap(beat => beat.actorIds?.length ? beat.actorIds : [beat.actorId])
        .filter(Boolean));
    const visibleActors = new Set(
        [...usedActors].filter(actorId => !stagedActors.has(actorId) && portraitCapable(actorId))
    );

    for (const beat of activeBeats) {
        if (beat.stageAction === 'enter') {
            for (const actorId of beat.actorIds || []) {
                if (portraitCapable(actorId)) visibleActors.add(actorId);
            }
        }
        check(
            visibleActors.size <= 4,
            `${scene.id}/${label}/${runCondition}/${beat.order} exceeds the four-portrait stage with ${visibleActors.size} actors`
        );
        if (beat.stageAction === 'exit') {
            for (const actorId of beat.actorIds || []) visibleActors.delete(actorId);
        }
    }
};

for (const scene of Object.values(StorySceneRegistry)) {
    for (const runCondition of ['first_run', 'second_run']) {
        const checkpoints = Object.entries(scene.checkpoints || {});
        if (checkpoints.length) {
            for (const [checkpointId, checkpoint] of checkpoints) {
                const [from, to] = checkpoint.beatRange || [];
                auditCastRange(
                    scene,
                    scene.beats.filter(beat => beat.order >= from && beat.order <= to),
                    checkpointId,
                    runCondition
                );
            }
        } else {
            auditCastRange(scene, scene.beats || [], 'full', runCondition);
        }
    }
}

for (const sceneId of [
    'ch2_s03_ledger_that_would_not_close',
    'ch3_s02_shadows_count_names',
    'ch3_s09_temptation_and_orders',
    'ch4_s08_returned_objects',
    'ch4_s09_four_elements_one_report',
    'ch5_s03_elemental_convergence',
    'ch5_s05_fourfold_shrapnel',
    'ch6_s07_house_changes_seats',
    'ch7_s08_return_to_town',
    'ch7_s09_first_or_second_epilogue'
]) {
    check(
        sceneManagerSource.includes(`${sceneId}: Object.freeze({`),
        `${sceneId} declares multiple dramatic locations without a beat background binding`
    );
}

globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};
globalThis.window = {
    addEventListener: () => {},
    removeEventListener: () => {}
};
globalThis.document = {
    getElementById: () => null,
    addEventListener: () => {},
    removeEventListener: () => {}
};

const { default: storyDialogueController } = await import('../src/js/managers/StoryDialogueController.js');
const castFrames = [];
const fakeView = {
    hideChoices: () => {},
    show: () => {},
    hide: () => {},
    setAutoPlay: () => {},
    renderChoices: () => {},
    renderLine: ({ castState }) => {
        castFrames.push({
            visible: [...castState.visibleActorIds],
            entering: [...castState.enteringActorIds],
            exiting: [...castState.exitingActorIds]
        });
    },
    renderStage: ({ castState }) => {
        castFrames.push({
            visible: [...castState.visibleActorIds],
            entering: [...castState.enteringActorIds],
            exiting: [...castState.exitingActorIds]
        });
    }
};
storyDialogueController.view = fakeView;
storyDialogueController.mount = () => fakeView;

const testPresentation = {
    participants: [
        { id: 'street_beggar', name: 'street_beggar', standing: 'beggar.webp' },
        { id: 'village_elder', name: 'village_elder', standing: 'elder.webp' }
    ],
    timeline: [
        { text: '路口。', isNarration: true },
        { stageAction: 'enter', actorIds: ['street_beggar'] },
        { text: '一句話。', actorId: 'street_beggar' },
        { stageAction: 'exit', actorIds: ['street_beggar'] },
        { stageAction: 'enter', actorIds: ['village_elder'] },
        { text: '另一句話。', actorId: 'village_elder' }
    ]
};
const playback = storyDialogueController.play(testPresentation);
storyDialogueController.completeCurrentLine();
storyDialogueController.advance();
await new Promise(resolve => setTimeout(resolve, 270));
check(
    castFrames.some(frame => frame.entering.includes('street_beggar')),
    'Actor enter never reaches the shared dialogue view'
);
storyDialogueController.completeCurrentLine();
storyDialogueController.advance();
await new Promise(resolve => setTimeout(resolve, 270));
check(
    castFrames.some(frame => frame.exiting.includes('street_beggar')),
    'Actor exit never reaches the shared dialogue view'
);
check(
    castFrames.some(frame => !frame.visible.includes('street_beggar')),
    'Exited actor remains in the shared cast state'
);
await new Promise(resolve => setTimeout(resolve, 270));
check(
    castFrames.some(frame => frame.entering.includes('village_elder')),
    'Later actor enter never reaches the shared dialogue view'
);
storyDialogueController.completeCurrentLine();
storyDialogueController.advance();
await playback;

if (failures.length) {
    console.error(`Story stage direction check failed (${failures.length}):`);
    failures.forEach(message => console.error(`- ${message}`));
    process.exit(1);
}

console.log(
    `Story stage direction check passed: ${actorStageActionCount} actor actions, `
    + `${flowDirectionCount} flow directions remain isolated.`
);
