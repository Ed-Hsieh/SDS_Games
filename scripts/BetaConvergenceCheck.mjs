import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CasinoPrizePools, getCasinoPrizePools, resolveCasinoRewardItem } from '../src/js/data/CasinoRewards.js';
import { DungeonDatabase } from '../src/js/data/Dungeons.js';
import { EventDatabase, EventRole } from '../src/js/data/Events.js';
import {
    PassiveCombatEffectDatabase,
    PassiveCombatEffectSlotCount,
    PassiveCombatEffectUnlockSources
} from '../src/js/data/PassiveCombatEffects.js';
import { QuestDatabase } from '../src/js/data/Quests.js';
import { MainlineCharacterContracts } from '../src/js/data/StoryActors.js';
import { OptionalSideStoryRegistry, OptionalSideStoryStatus } from '../src/js/data/OptionalSideStoryRegistry.js';
import { StorySceneOrder } from '../src/js/data/StorySceneRegistry.js';
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

function assertDocExcludes(section, file, terms) {
    const text = readText(file);
    for (const term of terms) {
        if (text.includes(term)) {
            addIssue(section, 'Convergence document still contains obsolete direction text.', { file, term });
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
        'scripts/StoryRuntimeCheck.mjs',
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
        'src/js/data/Events.js',
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
    if (Object.hasOwn(QuestDatabase, 'main')) {
        addIssue('story-content', 'Legacy chapter quest wrappers returned after story guidance consolidation.', {
            questIds: (Reflect.get(QuestDatabase, 'main') || []).map(quest => quest.id)
        });
    }

    if (StorySceneOrder.length !== 66) {
        addIssue('story-content', 'The accepted screenplay must retain all 66 scenes.', {
            scenes: StorySceneOrder.length
        });
    }

    const activeOptionalQuests = flattenQuestGroups()
        .filter(quest => ['commission', 'hidden'].includes(quest._group));
    if (activeOptionalQuests.length > 0) {
        addIssue('story-content', 'Optional quests became playable before map ownership and rewards were approved.', {
            questIds: activeOptionalQuests.map(quest => quest.id)
        });
    }

    for (const story of OptionalSideStoryRegistry) {
        if (story.status !== OptionalSideStoryStatus.APPROVED || !story.rewardBinding?.id) {
            addIssue('story-content', 'A side-story plan is missing its approved production state or reward definition.', {
                sideStoryId: story.id,
                status: story.status,
                rewardBinding: story.rewardBinding
            });
        }
    }

    summary.mainStoryChapters = new Set(
        StorySceneOrder.map(sceneId => Number(sceneId.match(/^ch(\d+)_/)?.[1])).filter(Boolean)
    ).size;
    summary.screenplayScenes = StorySceneOrder.length;
    summary.mainlineCharacterContracts = Object.keys(MainlineCharacterContracts).length;
    summary.approvedOptionalSideStoriesPendingProduction = OptionalSideStoryRegistry.length;
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
        'docs/characters/CASINO_OWNER_PROFILE.md',
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

    for (const file of docs) {
        assertDocExcludes('framework-docs', file, [
            'Mirelle',
            '米蕾',
            'mirelle_operation',
            'Oran',
            '歐蘭'
        ]);
    }

    assertDocContains('framework-docs', 'docs/TOWN_REBUILD_CONVERGENCE.md', [
        'Direct-Rewrite Policy',
        'TownStateResolver.js',
        'Lived Recovery Signals',
        'redesign combat',
        'tower content'
    ]);
    assertDocContains('framework-docs', 'docs/CHAPTER_QUEST_FRAMEWORK.md', [
        'Lv1-Lv70',
        'Adventure Map Rebuild Contract',
        'Scene Binding For The 66-Scene Screenplay',
        'Early-Game Lived Recovery Contract',
        'stable black',
        "Shadow begins around Lv24-30 and is the base campaign's dark affinity ceiling",
        "Glimmer is the base campaign's bright affinity ceiling",
        'Full Void and light creature groups',
        'tower rewrite are paused'
    ]);
    assertDocContains('framework-docs', 'docs/MAIN_STORY_BIBLE.md', [
        'Design the main story like a long film or serialized drama',
        'Current Narrative Reset',
        'Working Canon V0',
        'Accepted Omniscient Causal Timeline V1',
        'Master Screenplay Review Proposal V1',
        'Two-Run Persistence Contract',
        'achievement-only',
        'Proposed First-Run Fate Order',
        'Proposed Boss Story Identities',
        'Second-Run External Boss And DLC Extension',
        'Seven-Chapter Contract Proposal',
        'Omniscient Scene Timeline Review V2',
        'Chapter 1 Scene Order',
        'Chapter 7 Scene Order',
        'Chapter 1 Detailed Screenplay V1',
        'Chapter 7 Detailed Screenplay V1',
        'Mia / 米婭',
        'ch5_s06_mia_operation',
        '標準二格固定可安全處理',
        'unscoped_handling_summary',
        'rear_marker_unmeasured',
        'tavi_role_admitted',
        '我不是因為想守路才拿這盞燈',
        '主角不能替代任何一端的標記',
        '左線指揮凱德倫 / Kaedren',
        '魔王赫爾薩恩 / Helsarn',
        'mountain-village dye-mender',
        'Accepted name: 洛恩 / Lorne',
        '醒來時，水已經涼了',
        '醒來時，水仍溫著',
        'Character Placement And Side-Story Matrix V1',
        'Accepted Runtime Viewpoint Contract V1',
        'Chapters 1-3 Pacing And Lived-Town Review V1',
        'character_limited:village_elder',
        '二十年前，是我叫他們跟上',
        '別在我生氣的時候說對的話',
        'Scope Deferred To The Next Round',
        'Second-Run True-Kill Mainline',
        'First-Run Ending Staging',
        'Second-Run Ending Staging',
        'Seven Chapter Story Spine V0',
        'central mystery and final truth',
        'Master Character Register V2',
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
        'First-Run Surgery And Death',
        'Second-Run Correction',
        'Mia / 米婭',
        '標準二格固定可安全處理',
        '藥師手記'
    ]);
    assertDocContains('framework-docs', 'docs/characters/TOWN_SCHOLAR_PROFILE.md', [
        'Runtime Mapping',
        'First Run',
        'Second Run',
        '標準二格固定可安全處理',
        'sole blame',
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
    assertDocContains('framework-docs', 'docs/characters/CASINO_OWNER_PROFILE.md', [
        'Runtime Mapping',
        'Accepted Direction',
        'Blank Collateral Contract',
        'Loaded Dice',
        'Second Run Punishment',
        'Do Not Do'
    ]);
    assertDocContains('framework-docs', 'docs/NARRATIVE_WRITING_GUIDE.md', [
        'Write as a novelist',
        'Quest And Objective Clarity',
        'Layered Dialogue Scene Metadata',
        'Master Screenplay Block Format',
        'Runtime Viewpoint Contract',
        'protagonist_limited',
        'character_limited:<id>',
        'knowledgeBoundary',
        'poseOrLightingNote',
        'closed vocabulary of at most nine reusable expressions',
        'storyCg',
        'Multi-Speaker Scene Rules',
        'Do not physically move a town or map NPC icon for every scene'
    ]);
    assertDocContains('framework-docs', 'docs/CASINO_ROUTE_FRAMEWORK.md', [
        'Fixed Character Roles',
        'Loaded Dice Contract',
        'There is no branch where the player bargains with',
        'one freely selected display-case item'
    ]);
    assertDocContains('framework-docs', 'docs/EQUIPMENT_SERIES_FRAMEWORK.md', [
        'Steady Stance',
        'Arcane Resonance',
        'Bulwark Guard',
        'weaponSpeed',
        'Mainline, Second-Run External Story, And DLC Boundary',
        'The mandatory first-run and second-run chapter progression may distribute',
        'shadow feels like a real precursor to void'
    ]);
    assertDocContains('framework-docs', 'docs/ART_STYLE_GUIDE.md', [
        'Dark realistic fantasy',
        'Boss-dropped equipment',
        'Deferred Layered Dialogue Assets',
        'transparent character layers',
        'Deferred Story CG Illustrations',
        'closed vocabulary of at most',
        'Do not add a tenth expression',
        'src/assets/images/art/scenes/town/locations/casino.webp'
    ]);
    assertDocContains('framework-docs', 'docs/AGENT_SESSION_LOG.md', [
        'The sole delivery priority is a complete first run.',
        'Optional second-run external Bosses remain base-game content',
        'story.secondRunUnlocked',
        'persistent-flag audit',
        'Next Resume Task'
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

function auditMasterScreenplay() {
    const file = 'docs/MAIN_STORY_BIBLE.md';
    const text = readText(file);
    const timelineStart = text.indexOf('#### Chapter 1 Scene Order');
    const timelineEnd = text.indexOf('### Character Placement And Side-Story Matrix');
    const detailStart = text.indexOf('## Chapter 1 Detailed Screenplay V1');
    const detailEnd = text.indexOf('## Story Ambition');

    if ([timelineStart, timelineEnd, detailStart, detailEnd].some(index => index < 0)) {
        addIssue('master-screenplay', 'Required timeline or detailed-screenplay boundary is missing.');
        return;
    }

    const timelineBlock = text.slice(timelineStart, timelineEnd);
    const detailBlock = text.slice(detailStart, detailEnd);
    const timelineIds = [...new Set(timelineBlock.match(/ch[1-7]_s\d{2}_[a-z0-9_]+/g) || [])].sort();
    const detailIds = [...detailBlock.matchAll(/^### `(ch[1-7]_s\d{2}_[a-z0-9_]+)`/gm)]
        .map(match => match[1]);
    const uniqueDetailIds = [...new Set(detailIds)].sort();

    if (timelineIds.length !== 66) {
        addIssue('master-screenplay', 'Omniscient timeline must contain 66 unique scene ids.', {
            actual: timelineIds.length
        });
    }
    if (detailIds.length !== 66 || uniqueDetailIds.length !== 66) {
        addIssue('master-screenplay', 'Detailed screenplay must contain exactly 66 unique scene blocks.', {
            blocks: detailIds.length,
            unique: uniqueDetailIds.length
        });
    }

    const missingDetails = timelineIds.filter(id => !uniqueDetailIds.includes(id));
    const extraDetails = uniqueDetailIds.filter(id => !timelineIds.includes(id));
    if (missingDetails.length || extraDetails.length) {
        addIssue('master-screenplay', 'Timeline and detailed screenplay scene ids do not match.', {
            missingDetails,
            extraDetails
        });
    }

    const requiredMetadata = [
        'stageClass',
        'background',
        'worldState',
        'viewpoint',
        'participants',
        'entry',
        'exit',
        'objective',
        'inputs',
        'outputs',
        'assetNotes'
    ];
    for (let index = 0; index < detailIds.length; index += 1) {
        const id = detailIds[index];
        const start = detailBlock.indexOf(`### \`${id}\``);
        const nextId = detailIds[index + 1];
        const end = nextId ? detailBlock.indexOf(`### \`${nextId}\``, start + 1) : detailBlock.length;
        const scene = detailBlock.slice(start, end);
        for (const field of requiredMetadata) {
            if (!scene.includes(`- \`${field}\`:`)) {
                addIssue('master-screenplay', 'Detailed scene is missing required metadata.', {
                    sceneId: id,
                    field
                });
            }
        }

        const beatOrders = [...scene.matchAll(/^\|\s*(\d+)\s*\|/gm)]
            .map(match => Number(match[1]));
        if (!beatOrders.length || beatOrders.some((order, beatIndex) => order !== beatIndex + 1)) {
            addIssue('master-screenplay', 'Detailed scene beat order must be consecutive from 1.', {
                sceneId: id,
                beatOrders
            });
        }

        const viewpointMatch = scene.match(/^- `viewpoint`: (.+)$/m);
        if (viewpointMatch) {
            const viewpoint = viewpointMatch[1].replaceAll('`', '').trim();
            const approvedViewpoint = viewpoint === 'protagonist_limited'
                || viewpoint.startsWith('character_limited:')
                || viewpoint.startsWith('split_limited')
                || viewpoint === 'witnessed_memory'
                || viewpoint === 'audience_montage';
            if (!approvedViewpoint) {
                addIssue('master-screenplay', 'Detailed scene uses a viewpoint outside the closed vocabulary.', {
                    sceneId: id,
                    viewpoint
                });
            }
            if (viewpoint !== 'protagonist_limited' && !scene.includes('- `knowledgeBoundary`:')) {
                addIssue('master-screenplay', 'Non-protagonist viewpoint is missing a knowledge boundary.', {
                    sceneId: id,
                    viewpoint
                });
            }
        }
    }

    const allowedExpressions = new Set([
        '-',
        'neutral',
        'soft',
        'pleased',
        'guarded',
        'resolute',
        'angry',
        'afraid',
        'grieving',
        'hurt'
    ]);
    const allowedBeats = new Set(['narration', 'speaker', 'enter', 'cutaway', 'exit']);
    for (const line of detailBlock.split(/\r?\n/)) {
        if (!/^\|\s*\d+\s*\|/.test(line)) continue;
        const cells = line.slice(1, -1).split('|').map(cell => cell.trim().replaceAll('`', ''));
        const beat = cells[2];
        const expression = cells[4];
        if (!allowedBeats.has(beat)) {
            addIssue('master-screenplay', 'Detailed scene uses a beat outside the closed vocabulary.', {
                beat,
                line
            });
        }
        if (!allowedExpressions.has(expression)) {
            addIssue('master-screenplay', 'Detailed scene uses an expression outside the closed vocabulary.', {
                expression,
                line
            });
        }
    }

    const stageClasses = [...detailBlock.matchAll(/- `stageClass`: `(regional_canvas|location_scene|town_scene|memory_or_ending)`/g)]
        .map(match => match[1]);
    if (stageClasses.length !== 66) {
        addIssue('master-screenplay', 'Every detailed scene must declare exactly one approved stage class.', {
            actual: stageClasses.length
        });
    }

    summary.masterScreenplayScenes = uniqueDetailIds.length;
    summary.masterScreenplayStageClasses = stageClasses.reduce((acc, stageClass) => {
        acc[stageClass] = (acc[stageClass] || 0) + 1;
        return acc;
    }, {});
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
        'src/js/data/StoryRebuildPlan.js',
        'src/js/data/QuestStories.js',
        'src/js/data/StoryActors.js',
        'src/js/data/StorySceneRegistry.js',
        'src/js/data/StoryStateContract.js',
        'src/js/data/ChapterRegionRegistry.js',
        'src/js/data/OptionalSideStoryRegistry.js',
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
auditMasterScreenplay();
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
