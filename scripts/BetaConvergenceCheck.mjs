import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CasinoPrizePools, getCasinoPrizePools, resolveCasinoRewardItem } from '../src/js/data/CasinoRewards.js';
import { CasinoRouteFramework, CasinoShowcaseQuestFrame } from '../src/js/data/CasinoRouteFramework.js';
import {
    ChapterQuestFramework,
    ChapterQuestPausedSystems,
    LevelBandQuestFramework
} from '../src/js/data/ChapterQuestFramework.js';
import { CrossChapterStoryArcs } from '../src/js/data/CrossChapterStoryArcs.js';
import { DungeonDatabase } from '../src/js/data/Dungeons.js';
import { EventDatabase, EventRole } from '../src/js/data/Events.js';
import {
    PassiveCombatEffectDatabase,
    PassiveCombatEffectSlotCount,
    PassiveCombatEffectUnlockSources
} from '../src/js/data/PassiveCombatEffects.js';
import { QuestDatabase } from '../src/js/data/Quests.js';
import { SideStoryNarrativeTaxonomy } from '../src/js/data/SideStoryNarrativeTaxonomy.js';
import {
    ResourceExpansionRequirement,
    StoryRebuildCleanupCandidates,
    StoryRebuildFoundation,
    StoryRebuildNarrativeTarget
} from '../src/js/data/StoryRebuildPlan.js';
import { TownPlaceDatabase } from '../src/js/data/TownPlaces.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const issues = [];
const warnings = [];
const summary = {};

function rel(...parts) {
    return path.join(rootDir, ...parts);
}

function hasText(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function readText(relativePath) {
    return fs.readFileSync(rel(relativePath), 'utf8');
}

function addIssue(section, message, details = {}) {
    issues.push({ section, message, ...details });
}

function addWarning(section, message, details = {}) {
    warnings.push({ section, message, ...details });
}

function flattenQuestGroups() {
    return Object.entries(QuestDatabase)
        .flatMap(([group, quests]) => Array.isArray(quests)
            ? quests.map(quest => ({ ...quest, _group: group }))
            : []);
}

function assertFiles(section, files) {
    for (const file of files) {
        if (!fs.existsSync(rel(file))) {
            addIssue(section, 'Required convergence file is missing.', { file });
        }
    }
}

function assertDocContains(section, file, terms) {
    const text = readText(file);
    for (const term of terms) {
        if (!text.includes(term)) {
            addIssue(section, 'Convergence document is missing required direction text.', { file, term });
        }
    }
}

function auditValidationGates() {
    const scripts = [
        'scripts/DataConsistencyCheck.mjs',
        'scripts/StructureConsistencyCheck.mjs',
        'scripts/ItemFlowCheck.mjs',
        'scripts/AssetCoverageCheck.mjs',
        'scripts/EventPoolCheck.mjs',
        'scripts/EquipmentEffectCheck.mjs',
        'scripts/SideStoryFlowCheck.mjs',
        'scripts/ChapterStoryCompletenessCheck.mjs',
        'scripts/GameExperienceAudit.mjs',
        'scripts/CrossChapterStoryArcsCheck.mjs',
        'scripts/SideStoryNarrativeTaxonomyCheck.mjs',
        'scripts/EquipmentBalanceCheck.js',
        'scripts/StoryRebuildPlanCheck.mjs'
    ];

    assertFiles('validation-gates', scripts);
    summary.validationScripts = scripts.length;
}

function auditSharedSystems() {
    const commonFiles = [
        'src/js/utils/ItemDisplay.js',
        'src/js/utils/ItemTooltip.js',
        'src/js/components/ItemDetailModal.js',
        'src/js/utils/CombatUI.js',
        'src/js/utils/DevPanel.js',
        'src/js/utils/WorldMap.js',
        'src/js/managers/SaveManager.js',
        'src/js/managers/QuestManager.js',
        'src/js/managers/WorldInteractionManager.js',
        'src/js/managers/EventManager.js',
        'src/js/managers/DungeonManager.js',
        'src/js/managers/CasinoManager.js',
        'src/js/managers/EquipmentEffectResolver.js',
        'src/js/scenes/LobbyScene.js',
        'src/js/scenes/QuestScene.js',
        'src/js/scenes/AdventureScene.js',
        'src/js/scenes/DungeonScene.js',
        'src/js/scenes/ForgeScene.js',
        'src/js/scenes/ShopScene.js',
        'src/js/scenes/CasinoScene.js'
    ];

    assertFiles('shared-systems', commonFiles);

    const casinoScene = readText('src/js/scenes/CasinoScene.js');
    const casinoManager = readText('src/js/managers/CasinoManager.js');
    if (/casinoSystem/.test(casinoScene) || /casinoSystem/.test(casinoManager)) {
        addIssue('shared-systems', 'Legacy casinoSystem reference is still present.');
    }

    const forgeScene = readText('src/js/scenes/ForgeScene.js');
    if (!/ItemTooltip|attachItemTooltip|buildItemTooltipAttrs/.test(forgeScene)) {
        addWarning('shared-systems', 'Forge scene does not appear to use shared item tooltip helpers.');
    }

    summary.sharedSystemFiles = commonFiles.length;
}

function auditTravelerJournal() {
    const questScene = readText('src/js/scenes/QuestScene.js');
    const requiredTabs = ['委託', '首領痕跡', '世界見聞', '城鎮人際', '城鎮記憶'];

    for (const tab of requiredTabs) {
        if (!questScene.includes(tab)) {
            addIssue('traveler-journal', 'Traveler journal tab is missing.', { tab });
        }
    }

    if (!questScene.includes('真正的回報要交給') && !questScene.includes('回去找')) {
        addWarning('traveler-journal', 'Journal may not clearly route quest reports back to NPCs.');
    }

    summary.travelerJournalTabs = requiredTabs.length;
}

function auditStoryContent() {
    const main = Array.isArray(QuestDatabase.main) ? QuestDatabase.main : [];
    const sideQuests = flattenQuestGroups()
        .filter(quest => ['commission', 'hidden'].includes(quest._group))
        .map(quest => ({
            ...quest,
            _resolvedChapter: Number(quest.chapter || quest.unlockConditions?.chapter || 1)
        }))
        .filter(quest => [1, 2, 3].includes(quest._resolvedChapter));
    const sideByChapter = sideQuests.reduce((acc, quest) => {
        const chapter = quest._resolvedChapter;
        acc[chapter] = (acc[chapter] || 0) + 1;
        return acc;
    }, {});

    const expectedMainCounts = { 1: 6, 2: 5, 3: 4 };
    for (const [chapter, expected] of Object.entries(expectedMainCounts)) {
        const actual = main.filter(quest => Number(quest.chapter) === Number(chapter)).length;
        if (actual !== expected) {
            addIssue('story-content', 'Main story chapter count changed from the accepted three-chapter spine.', {
                chapter: Number(chapter),
                expected,
                actual
            });
        }
    }

    for (const chapter of [1, 2, 3]) {
        if ((sideByChapter[chapter] || 0) < 6) {
            addIssue('story-content', 'A chapter has too few side stories for the current beta story density.', {
                chapter,
                sideStories: sideByChapter[chapter] || 0
            });
        }
    }

    const taxonomyMissing = sideQuests
        .filter(quest => quest._group === 'commission')
        .filter(quest => !SideStoryNarrativeTaxonomy[quest.id])
        .map(quest => quest.id);
    if (taxonomyMissing.length > 0) {
        addIssue('story-content', 'Side story taxonomy is missing for commission quests.', {
            questIds: taxonomyMissing
        });
    }

    if (!Array.isArray(CrossChapterStoryArcs) || CrossChapterStoryArcs.length < 6) {
        addIssue('story-content', 'Cross-chapter arcs are too thin for systemic story alignment.', {
            arcs: CrossChapterStoryArcs.length
        });
    }

    summary.mainStoryChapters = expectedMainCounts;
    summary.sideStoriesByChapter = sideByChapter;
    summary.crossChapterArcs = CrossChapterStoryArcs.length;
}

function auditWorldEvents() {
    const roleCounts = Object.values(EventRole).reduce((acc, role) => {
        acc[role] = 0;
        return acc;
    }, {});

    for (const event of EventDatabase) {
        if (event.eventRole && roleCounts[event.eventRole] !== undefined) {
            roleCounts[event.eventRole] += 1;
        }

        if (!Array.isArray(event.zones) || event.zones.length === 0) {
            addIssue('world-events', 'Event has no zone scope.', { eventId: event.id });
        }
    }

    for (const [role, count] of Object.entries(roleCounts)) {
        if (count === 0) {
            addIssue('world-events', 'Event role has no events.', { role });
        }
    }

    summary.eventRoles = roleCounts;
    summary.worldEvents = EventDatabase.length;
}

function auditDungeonsAndCasino() {
    const dungeons = Object.values(DungeonDatabase);
    const mechanics = new Set();

    for (const dungeon of dungeons) {
        if (!dungeon.mechanic?.type) {
            addIssue('dungeons', 'Dungeon is missing a unique mechanic type.', { dungeonId: dungeon.id });
        } else {
            mechanics.add(dungeon.mechanic.type);
        }

        if (!hasText(dungeon.story?.rewardFocus)) {
            addIssue('dungeons', 'Dungeon story is missing reward focus.', { dungeonId: dungeon.id });
        }

        const mechanicUnlock = dungeon.story?.mechanicUnlock;
        if (!hasText(mechanicUnlock) && !(mechanicUnlock && hasText(mechanicUnlock.description))) {
            addIssue('dungeons', 'Dungeon story is missing mechanic unlock.', { dungeonId: dungeon.id });
        }
    }

    if (mechanics.size !== dungeons.length) {
        addIssue('dungeons', 'Dungeon mechanics are not unique enough.', {
            dungeonCount: dungeons.length,
            uniqueMechanics: mechanics.size
        });
    }

    const pools = getCasinoPrizePools();
    const poolIds = new Set();
    for (const pool of pools) {
        if (poolIds.has(pool.id)) {
            addIssue('casino', 'Casino prize pool id is duplicated.', { poolId: pool.id });
        }
        poolIds.add(pool.id);

        if (!Number.isFinite(Number(pool.cost)) || Number(pool.cost) <= 0) {
            addIssue('casino', 'Casino prize pool has invalid cost.', { poolId: pool.id });
        }

        for (const reward of pool.rewards || []) {
            if (reward.kind === 'item' && !resolveCasinoRewardItem(reward.itemId)) {
                addIssue('casino', 'Casino reward item cannot be resolved.', {
                    poolId: pool.id,
                    rewardId: reward.id,
                    itemId: reward.itemId
                });
            }
        }
    }

    summary.dungeons = dungeons.length;
    summary.dungeonMechanics = [...mechanics];
    summary.casinoPrizePools = Object.keys(CasinoPrizePools).length;
}

function auditPassiveCombatEffects() {
    if (PassiveCombatEffectSlotCount !== 1) {
        addIssue('passive-effects', 'Passive combat effect slot count must stay at one.', {
            actual: PassiveCombatEffectSlotCount
        });
    }

    const effects = Object.values(PassiveCombatEffectDatabase);
    const unlockedByProgress = [];

    for (const effect of effects) {
        const source = PassiveCombatEffectUnlockSources[effect.id];
        if (!source) {
            addIssue('passive-effects', 'Passive combat effect has no unlock source.', { effectId: effect.id });
            continue;
        }

        if (source.questIds?.length || source.flags?.length || source.itemIds?.length) {
            unlockedByProgress.push(effect.id);
        }
    }

    if (unlockedByProgress.length < 6) {
        addWarning('passive-effects', 'Too few passive effects are tied to progression sources.', {
            unlockedByProgress: unlockedByProgress.length
        });
    }

    summary.passiveEffects = effects.length;
    summary.progressionLockedPassiveEffects = unlockedByProgress.length;
}

function auditTownAndPlaces() {
    const places = Array.isArray(TownPlaceDatabase) ? TownPlaceDatabase : [];
    for (const place of places) {
        if (!hasText(place.id) || !hasText(place.name)) {
            addIssue('town-places', 'Town place is missing id or name.', { placeId: place.id });
        }
        const visibleEntries = [
            ...(Array.isArray(place.residents) ? place.residents : []),
            ...(Array.isArray(place.actions) ? place.actions : [])
        ];
        if (visibleEntries.length === 0) {
            addWarning('town-places', 'Town place has no visible residents or actions.', { placeId: place.id });
        }
    }

    summary.townPlaces = places.length;
}

function auditFrameworkDocs() {
    const docs = [
        'docs/README.md',
        'docs/TOWN_REBUILD_CONVERGENCE.md',
        'docs/CHAPTER_QUEST_FRAMEWORK.md',
        'docs/MAIN_STORY_BIBLE.md',
        'docs/characters/VILLAGE_ELDER_PROFILE.md',
        'docs/characters/HERBALIST_PROFILE.md',
        'docs/characters/TOWN_SCHOLAR_PROFILE.md',
        'docs/characters/STANDARD_BEARER_FREY_PROFILE.md',
        'docs/characters/LAMPLIGHTER_TAVI_PROFILE.md',
        'docs/characters/BLACKSMITH_PROFILE.md',
        'docs/characters/STREET_BEGGAR_PROFILE.md',
        'docs/NARRATIVE_WRITING_GUIDE.md',
        'docs/CASINO_ROUTE_FRAMEWORK.md',
        'docs/EQUIPMENT_SERIES_FRAMEWORK.md',
        'docs/ART_STYLE_GUIDE.md',
        'docs/IMAGE_GENERATION_PROMPTS.md',
        'docs/OBSOLETE_CLEANUP_PLAN.md',
        'docs/AGENT_SESSION_LOG.md',
        'docs/AGENT_UPDATE_PROTOCOL.md'
    ];
    assertFiles('framework-docs', docs);

    assertDocContains('framework-docs', 'docs/TOWN_REBUILD_CONVERGENCE.md', [
        'Direct-Rewrite Policy',
        'TownRebuildPlan.js',
        'Combat redesign',
        'tower content'
    ]);
    assertDocContains('framework-docs', 'docs/CHAPTER_QUEST_FRAMEWORK.md', [
        'Lv1-Lv70',
        'Shadow is a weak precursor to void',
        'Glimmer is a weak precursor to light',
        'Tower content is paused'
    ]);
    assertDocContains('framework-docs', 'docs/MAIN_STORY_BIBLE.md', [
        'Design the main story like a long film or serialized drama',
        'Current Narrative Reset',
        'Working Canon V0',
        'Seven Chapter Story Spine V0',
        'central mystery and final truth',
        'Detailed Character Profile Files V1',
        'Character Entry And Exit Rules',
        'Story-To-System Adaptation'
    ]);
    assertDocContains('framework-docs', 'docs/characters/VILLAGE_ELDER_PROFILE.md', [
        'Runtime Mapping',
        'First Run',
        'Second Run',
        'Do Not Do'
    ]);
    assertDocContains('framework-docs', 'docs/characters/HERBALIST_PROFILE.md', [
        'Runtime Mapping',
        'First Run',
        'Second Run',
        '藥師手記'
    ]);
    assertDocContains('framework-docs', 'docs/characters/TOWN_SCHOLAR_PROFILE.md', [
        'Runtime Mapping',
        'First Run',
        'Second Run',
        '伊萊'
    ]);
    assertDocContains('framework-docs', 'docs/characters/STANDARD_BEARER_FREY_PROFILE.md', [
        'Runtime Mapping',
        'First Run',
        'Second Run',
        '芙蕾'
    ]);
    assertDocContains('framework-docs', 'docs/characters/LAMPLIGHTER_TAVI_PROFILE.md', [
        'Runtime Mapping',
        'First Run',
        'Second Run',
        '塔維'
    ]);
    assertDocContains('framework-docs', 'docs/characters/BLACKSMITH_PROFILE.md', [
        'Runtime Mapping',
        'Village Temperature Gauge',
        'First Run',
        'Second Run'
    ]);
    assertDocContains('framework-docs', 'docs/characters/STREET_BEGGAR_PROFILE.md', [
        'Runtime Mapping',
        'Accepted Direction',
        'Possible Origin Models Under Discussion',
        'Do Not Do'
    ]);
    assertDocContains('framework-docs', 'docs/NARRATIVE_WRITING_GUIDE.md', [
        'Write as a novelist',
        'Quest And Objective Clarity',
        'Multi-Speaker Scene Rules',
        'Do not physically move a town or map NPC icon for every scene'
    ]);
    assertDocContains('framework-docs', 'docs/CASINO_ROUTE_FRAMEWORK.md', [
        'commission_casino_showcase_001',
        'Final choice',
        'display-case prizes'
    ]);
    assertDocContains('framework-docs', 'docs/EQUIPMENT_SERIES_FRAMEWORK.md', [
        'Steady Stance',
        'Arcane Resonance',
        'Bulwark Guard',
        'weaponSpeed',
        'shadow feels like a real precursor to void'
    ]);
    assertDocContains('framework-docs', 'docs/ART_STYLE_GUIDE.md', [
        'Dark realistic fantasy',
        'Boss-dropped equipment',
        'src/assets/images/art/scenes/town/places-full/casino.webp'
    ]);
    assertDocContains('framework-docs', 'docs/IMAGE_GENERATION_PROMPTS.md', [
        'Standard Prompt Shell',
        'Materials',
        'Weapons',
        'Normal Monsters',
        'Main Bosses',
        'Town Scenes',
        'Casino Scenes And Showcase Items'
    ]);
    assertDocContains('framework-docs', 'docs/OBSOLETE_CLEANUP_PLAN.md', [
        'Story And Quest Cleanup',
        'High-Confidence Cleanup',
        'Medium-Confidence Cleanup',
        'ProgressionLevels.js',
        'Removed on 2026-07-07',
        'Do Not Remove Just Yet'
    ]);
    assertDocContains('framework-docs', 'docs/AGENT_UPDATE_PROTOCOL.md', [
        'Manual Documentation Trigger',
        'Do Not Create New Planning Docs By Default',
        'Fixed Progress Item Format',
        'Fixed Session Log Format',
        'Update Workflow'
    ]);

    summary.frameworkDocs = docs.length;
}

function auditChapterQuestFramework() {
    if (!Array.isArray(ChapterQuestFramework) || ChapterQuestFramework.length !== 7) {
        addIssue('chapter-framework', 'Chapter quest framework must cover seven Lv1-Lv70 chapters.', {
            chapters: ChapterQuestFramework.length
        });
    }

    if (!Array.isArray(LevelBandQuestFramework) || LevelBandQuestFramework.length !== 7) {
        addIssue('chapter-framework', 'Level band framework must cover seven 10-level bands.', {
            levelBands: LevelBandQuestFramework.length
        });
    }

    const sorted = [...ChapterQuestFramework].sort((a, b) => a.levelRange[0] - b.levelRange[0]);
    if (sorted[0]?.levelRange?.[0] !== 1 || sorted.at(-1)?.levelRange?.[1] !== 70) {
        addIssue('chapter-framework', 'Chapter quest framework does not cover Lv1-Lv70 cleanly.', {
            first: sorted[0]?.levelRange,
            last: sorted.at(-1)?.levelRange
        });
    }

    for (let index = 1; index < sorted.length; index += 1) {
        const previous = sorted[index - 1];
        const current = sorted[index];
        if (previous.levelRange[1] + 1 !== current.levelRange[0]) {
            addIssue('chapter-framework', 'Chapter level ranges have a gap or overlap.', {
                previous: previous.id,
                previousRange: previous.levelRange,
                current: current.id,
                currentRange: current.levelRange
            });
        }
    }

    if (ChapterQuestPausedSystems.combat?.status !== 'paused') {
        addIssue('chapter-framework', 'Combat must remain paused during the town rebuild framework pass.');
    }
    if (ChapterQuestPausedSystems.tower?.status !== 'paused') {
        addIssue('chapter-framework', 'Tower must remain paused during the town rebuild framework pass.');
    }

    summary.chapterFrameworks = ChapterQuestFramework.length;
    summary.levelBandFrameworks = LevelBandQuestFramework.length;
}

function auditCasinoRouteFramework() {
    if (!Array.isArray(CasinoRouteFramework) || CasinoRouteFramework.length < 6) {
        addIssue('casino-framework', 'Casino route framework must include the full showcase-owner route.', {
            stages: CasinoRouteFramework.length
        });
    }

    const stageIds = new Set(CasinoRouteFramework.map(stage => stage.id));
    for (const stageId of ['showcase_inspection', 'owner_contract', 'final_showcase_choice']) {
        if (!stageIds.has(stageId)) {
            addIssue('casino-framework', 'Casino route framework is missing a required stage.', { stageId });
        }
    }

    if (CasinoShowcaseQuestFrame.questId !== 'commission_casino_showcase_001') {
        addIssue('casino-framework', 'Casino showcase quest frame must keep the planned quest id.', {
            questId: CasinoShowcaseQuestFrame.questId
        });
    }

    summary.casinoRouteStages = CasinoRouteFramework.length;
}

function auditStoryRebuildPlan() {
    if (StoryRebuildFoundation.mode !== 'reset_content_keep_systems') {
        addIssue('story-rebuild-plan', 'Story rebuild mode must keep the accepted clean-reset policy.', {
            mode: StoryRebuildFoundation.mode
        });
    }

    if (!Array.isArray(StoryRebuildFoundation.retiredContentLayers) || StoryRebuildFoundation.retiredContentLayers.length < 5) {
        addIssue('story-rebuild-plan', 'Story rebuild plan must list retired content layers.');
    }

    if (!Array.isArray(ResourceExpansionRequirement.requiredProposalFields) || ResourceExpansionRequirement.requiredProposalFields.length < 6) {
        addIssue('story-rebuild-plan', 'Resource expansion gate is too thin.');
    }

    if (!Array.isArray(StoryRebuildCleanupCandidates) || StoryRebuildCleanupCandidates.length < 5) {
        addIssue('story-rebuild-plan', 'Story rebuild cleanup candidates are missing.');
    }

    if (!Array.isArray(StoryRebuildNarrativeTarget.chapterTargets) || StoryRebuildNarrativeTarget.chapterTargets.length !== 7) {
        addIssue('story-rebuild-plan', 'Story rebuild narrative target must cover seven chapters.', {
            chapters: StoryRebuildNarrativeTarget.chapterTargets?.length || 0
        });
    }

    if (StoryRebuildNarrativeTarget.finalBossId !== 'demon_lord_asariel') {
        addIssue('story-rebuild-plan', 'Mainline final boss target changed unexpectedly.', {
            finalBossId: StoryRebuildNarrativeTarget.finalBossId
        });
    }

    summary.storyRebuildCleanupCandidates = StoryRebuildCleanupCandidates.length;
    summary.storyRebuildNarrativeChapters = StoryRebuildNarrativeTarget.chapterTargets?.length || 0;
}

function auditDataBacklog() {
    const dataFiles = [
        'AGENTS.md',
        'src/js/data/TownRebuildPlan.js',
        'src/js/data/StoryRebuildPlan.js',
        'src/js/data/ChapterQuestFramework.js',
        'src/js/data/CasinoRouteFramework.js',
        'src/js/data/QuestStories.js',
        'src/js/data/SideStoryNarrativeTaxonomy.js',
        'src/js/data/CrossChapterStoryArcs.js',
        'src/js/data/DungeonStories.js'
    ];
    assertFiles('data-backlog', dataFiles);
    summary.convergenceDataFiles = dataFiles.length;
}

auditValidationGates();
auditSharedSystems();
auditTravelerJournal();
auditStoryContent();
auditWorldEvents();
auditDungeonsAndCasino();
auditPassiveCombatEffects();
auditTownAndPlaces();
auditFrameworkDocs();
auditChapterQuestFramework();
auditCasinoRouteFramework();
auditStoryRebuildPlan();
auditDataBacklog();

const result = {
    ok: issues.length === 0,
    issues,
    warnings,
    summary
};

console.log(JSON.stringify(result, null, 2));

if (!result.ok) {
    process.exit(1);
}
