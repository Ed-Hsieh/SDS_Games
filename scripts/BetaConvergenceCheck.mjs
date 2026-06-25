import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CasinoPrizePools, getCasinoPrizePools, resolveCasinoRewardItem } from '../src/js/data/CasinoRewards.js';
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
        'scripts/EquipmentBalanceCheck.js'
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
    const requiredTabs = ['委託', '首領痕跡', '世界見聞', '鍛造備忘', '城鎮記憶'];

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

function auditDocsAndBacklog() {
    const docs = [
        'docs/GAME_CONVERGENCE_PLAN.md',
        'docs/BETA_CONVERGENCE_AUDIT.md',
        'docs/RELATIONSHIP_ARCS_BACKLOG.md',
        'docs/CROSS_CHAPTER_STORY_ARCS.md',
        'docs/SIDE_STORY_NARRATIVE_TAXONOMY.md'
    ];
    assertFiles('docs-backlog', docs);
    summary.convergenceDocs = docs.length;
}

auditValidationGates();
auditSharedSystems();
auditTravelerJournal();
auditStoryContent();
auditWorldEvents();
auditDungeonsAndCasino();
auditPassiveCombatEffects();
auditTownAndPlaces();
auditDocsAndBacklog();

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
