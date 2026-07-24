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

for (const scene of Object.values(StorySceneRegistry)) {
    for (const beat of scene.beats || []) {
        const isDirection = ['enter', 'exit'].includes(beat.beat);
        const actorIds = beat.actorIds || [];

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
check(flowDirectionCount > actorStageActionCount, 'Flow directions were unexpectedly converted into portrait actions');

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
