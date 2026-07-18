import { QuestDatabase } from '../src/js/data/Quests.js';
import { ChapterRegionRegistry } from '../src/js/data/ChapterRegionRegistry.js';
import { StorySceneRegistry } from '../src/js/data/StorySceneRegistry.js';
import {
    StoryActorRegistry,
    StoryExpressionIds
} from '../src/js/data/StoryActors.js';
import { TownPlaceDatabase } from '../src/js/data/TownPlaces.js';
import {
    AllOptionalSideStories,
    OptionalEnsembleStoryRegistry,
    OptionalSideStoryRegistry,
    OptionalSideStoryStatus,
    SideStoryLength,
    SideStoryRequiredCharacterIds
} from '../src/js/data/OptionalSideStoryRegistry.js';

const problems = [];
const push = (section, message) => problems.push({ section, message });
const ids = new Set();
const titles = new Set();
const townOwnerIds = new Set(TownPlaceDatabase.map(place => place.id));
const regionOwnerIds = new Set();
for (const region of Object.values(ChapterRegionRegistry)) {
    for (const location of region.locationNodes || []) regionOwnerIds.add(location.id);
}
const validOwnerIds = new Set([...townOwnerIds, ...regionOwnerIds]);

for (const story of AllOptionalSideStories) {
    if (!story.id || ids.has(story.id)) push('side-story-id', `missing or duplicate id: ${story.id}`);
    if (!story.title || titles.has(story.title)) push('side-story-title', `missing or duplicate title: ${story.title}`);
    ids.add(story.id);
    titles.add(story.title);

    if (story.status !== OptionalSideStoryStatus.APPROVED) {
        push('side-story-status', `${story.id} must remain approved-pending-production until implementation is complete`);
    }
    if (story.implementationGate !== 'formal_dialogue_assets_and_runtime') {
        push('side-story-gate', `${story.id} lacks the formal production implementation gate`);
    }
    if (!story.rewardBinding?.kind || !story.rewardBinding?.id || !story.rewardBinding?.role) {
        push('side-story-reward', `${story.id} has no reviewable reward definition`);
    }
    if (!String(story.purpose || '').trim()) push('side-story-purpose', `${story.id} has no deepening purpose`);
    if (!String(story.characterReveal || '').trim()) push('character-reveal', `${story.id} has no character reveal`);
    if (!String(story.mainlineBoundary || '').trim()) push('mainline-boundary', `${story.id} has no skip-safe boundary`);
    if (!validOwnerIds.has(story.futureOwner)) push('map-owner', `${story.id} references missing owner ${story.futureOwner}`);
    if (!StorySceneRegistry[story.unlockAfterSceneId]) push('unlock-scene', `${story.id} references missing unlock scene ${story.unlockAfterSceneId}`);
    if (story.expireBeforeSceneId && !StorySceneRegistry[story.expireBeforeSceneId]) {
        push('expiry-scene', `${story.id} references missing expiry scene ${story.expireBeforeSceneId}`);
    }
    if (!Array.isArray(story.chapterWindow)
        || story.chapterWindow.length !== 2
        || story.chapterWindow[0] < 1
        || story.chapterWindow[1] > 7
        || story.chapterWindow[0] > story.chapterWindow[1]) {
        push('chapter-window', `${story.id} has an invalid chapter window`);
    }
    if (!story.stagePlan.length) push('stage-plan', `${story.id} has no chapter stage`);
    const unlockScene = StorySceneRegistry[story.unlockAfterSceneId];
    if (unlockScene && story.stagePlan[0]?.chapter < unlockScene.chapter) {
        push('unlock-order', `${story.id} begins before its unlock scene chapter`);
    }
    const expiryScene = story.expireBeforeSceneId ? StorySceneRegistry[story.expireBeforeSceneId] : null;
    if (expiryScene && story.stagePlan.at(-1)?.chapter > expiryScene.chapter) {
        push('expiry-order', `${story.id} ends after its expiry scene chapter`);
    }
    let previousStageChapter = 0;
    for (const stage of story.stagePlan) {
        if (stage.chapter < story.chapterWindow[0] || stage.chapter > story.chapterWindow[1]) {
            push('stage-chapter', `${story.id} has stage outside its chapter window`);
        }
        if (!validOwnerIds.has(stage.ownerId)) push('stage-owner', `${story.id} stage references missing owner ${stage.ownerId}`);
        if (!String(stage.objective || '').trim()) push('stage-objective', `${story.id} has an empty objective`);
        if (stage.chapter < previousStageChapter) push('stage-order', `${story.id} stages are not in chapter order`);
        previousStageChapter = stage.chapter;
    }
    for (const locationId of story.regionLocationIds || []) {
        if (!regionOwnerIds.has(locationId)) push('region-location', `${story.id} references missing region location ${locationId}`);
    }
    for (const actorId of story.characterIds || []) {
        if (!StoryActorRegistry[actorId]) push('side-story-actor', `${story.id} references missing actor ${actorId}`);
    }
    if (story.dramaticArc.length !== 4) push('dramatic-arc', `${story.id} must define setup, resistance, turn, and resolution`);
    const expectedBeats = ['setup', 'resistance', 'turn', 'resolution'];
    story.dramaticArc.forEach((beat, index) => {
        if (beat.beat !== expectedBeats[index] || !String(beat.text || '').trim()) {
            push('dramatic-arc', `${story.id} has an invalid ${expectedBeats[index]} beat`);
        }
    });
    for (const [actorId, expressionIds] of Object.entries(story.performanceNeeds.expressionIdsByActor)) {
        if (!story.characterIds.includes(actorId)) push('performance-actor', `${story.id} stages non-participant ${actorId}`);
        for (const expressionId of expressionIds) {
            if (!StoryExpressionIds.includes(expressionId)) push('performance-expression', `${story.id} uses unknown expression ${expressionId}`);
        }
    }
    for (const ownerId of story.performanceNeeds.backgroundOwnerIds) {
        if (!validOwnerIds.has(ownerId)) push('performance-background', `${story.id} references missing background owner ${ownerId}`);
    }
    if (!['none', 'achievement_memory_only'].includes(story.runPolicy.crossRunPersistence)) {
        push('run-persistence', `${story.id} uses unsupported cross-run persistence ${story.runPolicy.crossRunPersistence}`);
    }
    if (story.offerPolicy.discovery !== 'character_or_place_interaction'
        || story.offerPolicy.visibleBeforeDiscovery !== false
        || story.offerPolicy.autoTrack !== false) {
        push('offer-policy', `${story.id} must remain discoverable and must not auto-fill the quest log`);
    }
}

for (const story of AllOptionalSideStories) {
    for (const prerequisiteId of story.prerequisiteStoryIds || []) {
        if (!ids.has(prerequisiteId)) push('story-prerequisite', `${story.id} references missing prerequisite ${prerequisiteId}`);
        if (prerequisiteId === story.id) push('story-prerequisite', `${story.id} requires itself`);
    }
}

const requiredLengths = [SideStoryLength.SHORT, SideStoryLength.MEDIUM, SideStoryLength.LONG];
for (const actorId of SideStoryRequiredCharacterIds) {
    const ownedStories = OptionalSideStoryRegistry.filter(story => story.primaryCharacterId === actorId);
    for (const length of requiredLengths) {
        const matchingStories = ownedStories.filter(story => story.length === length);
        if (matchingStories.length !== 1) {
            push('side-story-coverage', `${actorId} must own exactly one personal ${length} story, got ${matchingStories.length}`);
        }
    }
}

const ailoOptionalText = OptionalSideStoryRegistry
    .filter(story => story.primaryCharacterId === 'street_beggar')
    .flatMap(story => [
        story.purpose,
        story.characterReveal,
        ...story.stagePlan.map(stage => stage.objective),
        ...story.dramaticArc.map(beat => beat.text)
    ])
    .join('\n');
for (const forbiddenTerm of ['回聲哨', '妮露', '白花', '舊山路', '山村原貌']) {
    if (ailoOptionalText.includes(forbiddenTerm)) {
        push('ailo-mainline-boundary', `Ailo optional story content leaks mandatory term ${forbiddenTerm}`);
    }
}

const miaWindowStory = OptionalSideStoryRegistry.find(story => story.id === 'window_that_did_not_open');
if (!miaWindowStory?.stagePlan.at(-1)?.objective.includes('窗仍保持關閉')
    || !miaWindowStory?.mainlineBoundary.includes('不得打開窗')) {
    push('mia-window-boundary', 'Mia medium story must preserve the closed window for second-run growth');
}
if (OptionalSideStoryRegistry.some(story => story.primaryCharacterId === 'herbalist'
    && story.rewardBinding.id === 'first_aid_potion')) {
    push('mia-market-boundary', 'optional Mia stories cannot gate baseline first-aid stock');
}

const freyLongStory = OptionalSideStoryRegistry.find(story =>
    story.primaryCharacterId === 'standard_bearer_frey' && story.length === SideStoryLength.LONG
);
if (freyLongStory?.unlockAfterSceneId !== 'ch3_s03_lamp_oil_in_fog') {
    push('frey-mainline-boundary', 'Frey long story must unlock after the mandatory childhood-mist scene');
}

if (OptionalSideStoryRegistry.length !== SideStoryRequiredCharacterIds.length * 3) {
    push('personal-story-count', `expected three personal stories per core character, got ${OptionalSideStoryRegistry.length}`);
}
if (OptionalEnsembleStoryRegistry.length < 1) push('ensemble-story-count', 'no ensemble short story is registered');

const activeOptionalQuests = [
    ...(QuestDatabase.commission || []),
    ...(QuestDatabase.hidden || [])
];
if (activeOptionalQuests.length > 0) {
    push('activation-gate', `${activeOptionalQuests.length} optional quests are active before user review`);
}

if (problems.length > 0) {
    console.error(`Side story flow check found ${problems.length} issue(s):`);
    for (const problem of problems) console.error(`- [${problem.section}] ${problem.message}`);
    process.exit(1);
}

console.log(`Side story flow check passed. Checked ${OptionalSideStoryRegistry.length} personal stories and ${OptionalEnsembleStoryRegistry.length} ensemble stories.`);
