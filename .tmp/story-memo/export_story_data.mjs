import fs from 'node:fs';
import path from 'node:path';

import {
    StorySceneOrder,
    StorySceneOrderByChapter,
    StorySceneRegistry
} from '../../src/js/data/StorySceneRegistry.js';
import {
    OptionalSideStoryRegistry,
    OptionalEnsembleStoryRegistry,
    AllOptionalSideStories
} from '../../src/js/data/OptionalSideStoryRegistry.js';
import {
    MainlineCharacterContracts
} from '../../src/js/data/StoryActors.js';

const outputPath = path.resolve('.tmp/story-memo/story-data.json');
const data = {
    generatedAt: new Date().toISOString(),
    sceneOrder: StorySceneOrder,
    sceneOrderByChapter: StorySceneOrderByChapter,
    scenes: StorySceneOrder.map((id) => StorySceneRegistry[id]),
    sideStories: AllOptionalSideStories,
    personalSideStoryIds: OptionalSideStoryRegistry.map((story) => story.id),
    ensembleSideStoryIds: OptionalEnsembleStoryRegistry.map((story) => story.id),
    mainlineCharacterContracts: MainlineCharacterContracts
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Wrote ${data.scenes.length} scenes and ${data.sideStories.length} side stories to ${outputPath}`);
