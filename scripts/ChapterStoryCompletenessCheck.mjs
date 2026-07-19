import { CharacterProfileDatabase } from '../src/js/data/CharacterProfiles.js';
import {
    MainlineCharacterContracts,
    StoryActorRegistry
} from '../src/js/data/StoryActors.js';
import {
    StorySceneOrder,
    StorySceneRegistry
} from '../src/js/data/StorySceneRegistry.js';
import { QuestDatabase } from '../src/js/data/Quests.js';

const problems = [];
const push = (section, message) => problems.push({ section, message });

const expectedSceneCounts = Object.freeze({
    1: 11,
    2: 8,
    3: 9,
    4: 9,
    5: 11,
    6: 9,
    7: 9
});

for (const [chapterText, expectedCount] of Object.entries(expectedSceneCounts)) {
    const chapter = Number(chapterText);
    const sceneIds = StorySceneOrder.filter(sceneId => StorySceneRegistry[sceneId]?.chapter === chapter);
    if (sceneIds.length !== expectedCount) {
        push('chapter-scenes', `chapter ${chapter} has ${sceneIds.length} scenes; expected ${expectedCount}`);
    }

}

const requiredProfileFields = [
    'innerWorld',
    'past',
    'arc',
    'contradiction',
    'external',
    'core',
    'voice',
    'stages'
];

for (const [actorId, contract] of Object.entries(MainlineCharacterContracts)) {
    const actor = StoryActorRegistry[actorId];
    const profile = CharacterProfileDatabase[actorId];
    if (!actor) push('character-actor', `${actorId} is missing from StoryActorRegistry`);
    if (!profile) {
        push('character-profile', `${actorId} is missing from CharacterProfileDatabase`);
        continue;
    }
    for (const field of requiredProfileFields) {
        if (!profile[field] || (Array.isArray(profile[field]) && profile[field].length === 0)) {
            push('character-profile', `${actorId} is missing ${field}`);
        }
    }
    for (const field of ['fear', 'desire', 'values']) {
        if (!String(profile.innerWorld?.[field] || '').trim()) {
            push('character-inner-world', `${actorId} is missing innerWorld.${field}`);
        }
    }

    const ownedScenes = [
        contract.introductionSceneId,
        ...(contract.decisiveSceneIds || []),
        contract.endpointSceneIds?.first_run,
        contract.endpointSceneIds?.second_run
    ].filter(Boolean);
    if (ownedScenes.some(sceneId => !StorySceneRegistry[sceneId])) {
        push('character-mainline', `${actorId} has a mainline contract with a missing scene`);
    }
}

if (Object.values(QuestDatabase).some(group => !Array.isArray(group) || group.length > 0)) {
    push('side-story-gate', 'Optional quests became playable before their complete runtime contracts were approved');
}

if (problems.length > 0) {
    console.error(`Chapter story completeness check found ${problems.length} issue(s):`);
    for (const problem of problems) console.error(`- [${problem.section}] ${problem.message}`);
    process.exit(1);
}

console.log('Chapter story completeness check passed.');
console.log(`- chapters: ${Object.keys(expectedSceneCounts).length}`);
console.log(`- screenplay scenes: ${StorySceneOrder.length}`);
console.log(`- core character contracts: ${Object.keys(MainlineCharacterContracts).length}`);
