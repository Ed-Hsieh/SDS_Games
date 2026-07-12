import { QuestDatabase } from '../src/js/data/Quests.js';
import { QuestStoryDatabase } from '../src/js/data/QuestStories.js';
import { MaterialDatabase } from '../src/js/data/Materials.js';
import { MonsterDatabase } from '../src/js/data/Monsters.js';
import { TownNPCDatabase } from '../src/js/data/NPCDialogues.js';
import { StoryProgressRules } from '../src/js/data/StoryProgressMap.js';
import { WorldStoryChains } from '../src/js/data/WorldStories.js';
import { findChapterLocation } from '../src/js/data/ChapterRegionRegistry.js';
import {
    MaterialClassificationPolicy,
    ResourceExpansionRequirement,
    StoryRebuildCleanupCandidates,
    StoryRebuildFoundation,
    StoryRebuildNarrativeTarget
} from '../src/js/data/StoryRebuildPlan.js';

const issues = [];
const warnings = [];

function addIssue(section, message, details = {}) {
    issues.push({ section, message, ...details });
}

function addWarning(section, message, details = {}) {
    warnings.push({ section, message, ...details });
}

function hasEntries(value) {
    return Array.isArray(value) && value.length > 0;
}

function countMainQuests() {
    return Array.isArray(QuestDatabase.main) ? QuestDatabase.main.length : 0;
}

function countStoryQuests() {
    return Object.keys(QuestStoryDatabase || {}).length;
}

function findLegacyZoneRules() {
    const legacyZones = new Set(['low', 'medium', 'high', 'death']);
    return (StoryProgressRules || [])
        .filter(rule => [...legacyZones].some(zoneId => JSON.stringify(rule).includes(`"${zoneId}"`)))
        .map(rule => rule.id || `${rule.event}:${rule?.conditions?.zoneId || 'unknown'}`);
}

function auditPlanShape() {
    if (StoryRebuildFoundation.mode !== 'reset_content_keep_systems') {
        addIssue('foundation', 'Story rebuild mode is not the accepted reset mode.', {
            mode: StoryRebuildFoundation.mode
        });
    }

    for (const [key, value] of Object.entries({
        retainedWorldPillars: StoryRebuildFoundation.retainedWorldPillars,
        retainedSystemPillars: StoryRebuildFoundation.retainedSystemPillars,
        retiredContentLayers: StoryRebuildFoundation.retiredContentLayers,
        rebuildOrder: StoryRebuildFoundation.rebuildOrder,
        requiredProposalFields: ResourceExpansionRequirement.requiredProposalFields,
        notMaterials: MaterialClassificationPolicy.notMaterials,
        cleanupCandidates: StoryRebuildCleanupCandidates
    })) {
        if (!hasEntries(value)) {
            addIssue('foundation', 'Required rebuild section is empty.', { key });
        }
    }

    for (const candidate of StoryRebuildCleanupCandidates) {
        if (!candidate.id || !candidate.status || !candidate.priority || !hasEntries(candidate.ownerPaths)) {
            addIssue('cleanup-candidate', 'Cleanup candidate is missing required fields.', {
                candidateId: candidate.id || '(missing)'
            });
        }
    }
}

function auditNarrativeTarget() {
    if (!StoryRebuildNarrativeTarget.centralMystery || !StoryRebuildNarrativeTarget.finalTruth) {
        addIssue('narrative-target', 'Central mystery and final truth are required before runtime quest rewrite.');
    }

    const externalPolicy = StoryRebuildNarrativeTarget.secondRunExternalBossPolicy;
    if (!externalPolicy || externalPolicy.requiredForTrueEnding !== false) {
        addIssue('external-boss-policy', 'Second-run external Bosses must remain optional for the true ending.');
    }
    if (externalPolicy?.status !== 'paused' || !externalPolicy?.resumeGate) {
        addIssue('external-boss-policy', 'External Boss expansion must stay paused behind the first-run completion gate.', {
            status: externalPolicy?.status,
            resumeGate: externalPolicy?.resumeGate
        });
    }
    if (externalPolicy?.unlock !== 'first_run_false_ending_achievement') {
        addIssue('external-boss-policy', 'External Boss interpretation must unlock from the first-run false ending.', {
            unlock: externalPolicy?.unlock
        });
    }
    for (const bossId of ['ash_baron', 'aurora_archon']) {
        if (!externalPolicy?.acceptedBaseGameFirstResolutions?.includes(bossId)) {
            addIssue('external-boss-policy', 'Accepted external Boss is missing from the base-game second-run policy.', { bossId });
        }
    }

    if (!Array.isArray(StoryRebuildNarrativeTarget.chapterTargets) || StoryRebuildNarrativeTarget.chapterTargets.length !== 7) {
        addIssue('narrative-target', 'Narrative target must cover seven chapters.', {
            chapters: StoryRebuildNarrativeTarget.chapterTargets?.length || 0
        });
        return;
    }

    const sorted = [...StoryRebuildNarrativeTarget.chapterTargets].sort((a, b) => a.chapter - b.chapter);
    for (let index = 0; index < sorted.length; index += 1) {
        const chapter = sorted[index];
        const expectedChapter = index + 1;
        const expectedStart = index === 0 ? 1 : sorted[index - 1].levelRange[1] + 1;

        if (chapter.chapter !== expectedChapter) {
            addIssue('narrative-target', 'Chapter numbering is not continuous.', {
                expected: expectedChapter,
                actual: chapter.chapter
            });
        }

        if (!Array.isArray(chapter.levelRange) || chapter.levelRange[0] !== expectedStart) {
            addIssue('narrative-target', 'Chapter level range has a gap or missing start.', {
                chapter: chapter.chapter,
                range: chapter.levelRange,
                expectedStart
            });
        }

        if (!chapter.bossId || !MonsterDatabase[chapter.bossId]) {
            addIssue('narrative-target', 'Chapter boss id does not exist in MonsterDatabase.', {
                chapter: chapter.chapter,
                bossId: chapter.bossId
            });
        }

        if (chapter.secondRunExternalHookId && !MonsterDatabase[chapter.secondRunExternalHookId]) {
            addIssue('narrative-target', 'Second-run external Boss hook does not exist in MonsterDatabase.', {
                chapter: chapter.chapter,
                bossId: chapter.secondRunExternalHookId
            });
        }
    }

    if (sorted[0].levelRange[0] !== 1 || sorted.at(-1).levelRange[1] !== 70) {
        addIssue('narrative-target', 'Narrative target should cover Lv1-Lv70.', {
            first: sorted[0].levelRange,
            last: sorted.at(-1).levelRange
        });
    }

    for (const npcId of StoryRebuildNarrativeTarget.chapterOneRuntimeTarget?.initialVisibleNpcIds || []) {
        if (!TownNPCDatabase[npcId]) {
            addIssue('narrative-target', 'Chapter 1 initial NPC id does not exist.', { npcId });
        }
    }

    for (const node of StoryRebuildNarrativeTarget.chapterOneRuntimeTarget?.storyNodes || []) {
        if (!node.id || !node.purpose) {
            addIssue('chapter-one-node', 'Chapter 1 story node is missing id or purpose.', {
                nodeId: node.id || '(missing)'
            });
        }

        for (const npcId of node.npcIds || []) {
            if (!TownNPCDatabase[npcId]) {
                addIssue('chapter-one-node', 'Chapter 1 story node references missing NPC.', {
                    nodeId: node.id,
                    npcId
                });
            }
        }

        for (const landmarkId of node.landmarkIds || []) {
            if (!findChapterLocation(landmarkId)) {
                addIssue('chapter-one-node', 'Chapter 1 story node references missing landmark.', {
                    nodeId: node.id,
                    landmarkId
                });
            }
        }

        if (node.bossId && !MonsterDatabase[node.bossId]) {
            addIssue('chapter-one-node', 'Chapter 1 story node references missing boss.', {
                nodeId: node.id,
                bossId: node.bossId
            });
        }
    }
}

function auditLegacyPresence() {
    const legacyZoneRules = findLegacyZoneRules();

    if (legacyZoneRules.length > 0) {
        addWarning('legacy-presence', 'Old zone story rules are still present and should be retargeted during the route rewrite.', {
            count: legacyZoneRules.length,
            ruleIds: legacyZoneRules.slice(0, 12)
        });
    }

    const main = QuestDatabase.main || [];
    if (main.length !== 7 || main.some(quest => !quest.id.startsWith('story_chapter_'))) {
        addIssue('legacy-presence', 'Main quest records do not match the seven scene-driven chapter records.', {
            questIds: main.map(quest => quest.id)
        });
    }
    if (main.some(quest => Object.keys(quest.rewards || {}).length > 0)) {
        addIssue('reward-deferral', 'A chapter quest received rewards before map-function allocation.');
    }
}

auditPlanShape();
auditNarrativeTarget();
auditLegacyPresence();

const summary = {
    mode: StoryRebuildFoundation.mode,
    retainedWorldPillars: StoryRebuildFoundation.retainedWorldPillars.length,
    retainedSystemPillars: StoryRebuildFoundation.retainedSystemPillars.length,
    retiredContentLayers: StoryRebuildFoundation.retiredContentLayers.length,
    cleanupCandidates: StoryRebuildCleanupCandidates.length,
    narrativeChapters: StoryRebuildNarrativeTarget.chapterTargets.length,
    chapterOneInitialNpcs: StoryRebuildNarrativeTarget.chapterOneRuntimeTarget.initialVisibleNpcIds.length,
    chapterOneStoryNodes: StoryRebuildNarrativeTarget.chapterOneRuntimeTarget.storyNodes.length,
    mainQuestRecords: countMainQuests(),
    questStoryRecords: countStoryQuests(),
    materialRecords: Object.keys(MaterialDatabase || {}).length,
    worldStoryChains: Object.keys(WorldStoryChains || {}).length,
    legacyZoneRules: findLegacyZoneRules().length
};

console.log('Story rebuild plan audit');
console.log(JSON.stringify(summary, null, 2));

if (warnings.length > 0) {
    console.log('\nWarnings');
    for (const warning of warnings) {
        console.log(`- [${warning.section}] ${warning.message}`);
        if (warning.count !== undefined) console.log(`  count: ${warning.count}`);
        if (warning.zoneIds) console.log(`  zoneIds: ${warning.zoneIds.join(', ')}`);
        if (warning.ruleIds) console.log(`  ruleIds: ${warning.ruleIds.join(', ')}`);
    }
}

if (issues.length > 0) {
    console.error('\nIssues');
    for (const issue of issues) {
        console.error(`- [${issue.section}] ${issue.message}`);
        if (issue.candidateId) console.error(`  candidate: ${issue.candidateId}`);
        if (issue.key) console.error(`  key: ${issue.key}`);
        if (issue.mode) console.error(`  mode: ${issue.mode}`);
    }
    process.exit(1);
}

console.log('\nStory rebuild guardrails are valid.');
