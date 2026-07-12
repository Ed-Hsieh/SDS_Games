import { QuestDatabase } from '../src/js/data/Quests.js';
import {
    MainlineCharacterContracts,
    StoryActorRegistry
} from '../src/js/data/StoryActors.js';
import {
    OptionalSideStoryRegistry,
    OptionalSideStoryStatus
} from '../src/js/data/OptionalSideStoryRegistry.js';

const problems = [];
const push = (section, message) => problems.push({ section, message });
const ids = new Set();
const titles = new Set();
const coveredCoreActors = new Set();

for (const story of OptionalSideStoryRegistry) {
    if (!story.id || ids.has(story.id)) push('side-story-id', `missing or duplicate id: ${story.id}`);
    if (!story.title || titles.has(story.title)) push('side-story-title', `missing or duplicate title: ${story.title}`);
    ids.add(story.id);
    titles.add(story.title);

    if (story.status !== OptionalSideStoryStatus.DEFERRED) {
        push('side-story-status', `${story.id} is active before its map owner is approved`);
    }
    if (story.rewardBinding !== null) {
        push('reward-deferral', `${story.id} has a reward binding before map functionality is final`);
    }
    if (!String(story.purpose || '').trim()) push('side-story-purpose', `${story.id} has no deepening purpose`);
    if (!String(story.mainlineBoundary || '').trim()) push('mainline-boundary', `${story.id} has no skip-safe boundary`);
    if (!String(story.futureOwner || '').trim()) push('map-owner', `${story.id} has no future map/town owner`);
    if (!Array.isArray(story.chapterWindow)
        || story.chapterWindow.length !== 2
        || story.chapterWindow[0] < 1
        || story.chapterWindow[1] > 7
        || story.chapterWindow[0] > story.chapterWindow[1]) {
        push('chapter-window', `${story.id} has an invalid chapter window`);
    }

    for (const actorId of story.characterIds || []) {
        if (!StoryActorRegistry[actorId]) push('side-story-actor', `${story.id} references missing actor ${actorId}`);
        if (MainlineCharacterContracts[actorId]) coveredCoreActors.add(actorId);
    }
}

for (const actorId of Object.keys(MainlineCharacterContracts)) {
    if (!coveredCoreActors.has(actorId)) {
        push('side-story-coverage', `${actorId} has no optional deepening concept`);
    }
}

const activeOptionalQuests = [
    ...(QuestDatabase.commission || []),
    ...(QuestDatabase.hidden || [])
];
if (activeOptionalQuests.length > 0) {
    push('activation-gate', `${activeOptionalQuests.length} optional quests are active before map ownership is final`);
}

if (problems.length > 0) {
    console.error(`Side story flow check found ${problems.length} issue(s):`);
    for (const problem of problems) console.error(`- [${problem.section}] ${problem.message}`);
    process.exit(1);
}

console.log(`Side story flow check passed. Checked ${OptionalSideStoryRegistry.length} deferred concepts.`);
