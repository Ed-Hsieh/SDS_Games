import { QuestDatabase, QuestType } from '../src/js/data/Quests.js';
import {
    LandmarkMapNodePlan,
    getBossChapterPlanByBossId
} from '../src/js/data/ChapterMapFramework.js';
import {
    MainQuestSpineNodes,
    DungeonSpineMode,
    QuestMeaningBeat,
    QuestSpineChapters,
    QuestSpineRole,
    QuestSpineStatus,
    getQuestSpineCoverageSummary
} from '../src/js/data/QuestSpineFramework.js';

const errors = [];
const warnings = [];

function error(section, message) {
    errors.push({ section, message });
}

function warn(section, message) {
    warnings.push({ section, message });
}

function assertUnique(scope, values) {
    const seen = new Set();
    for (const value of values) {
        if (!value) continue;
        if (seen.has(value)) error('duplicate', `${scope} contains duplicate ${value}`);
        seen.add(value);
    }
}

function printList(title, rows) {
    if (rows.length === 0) return;
    console.log(`\n${title}`);
    for (const row of rows) {
        console.log(`- [${row.section}] ${row.message}`);
    }
}

const validStatuses = new Set(Object.values(QuestSpineStatus));
const validRoles = new Set(Object.values(QuestSpineRole));
const validMeaningBeats = new Set(Object.values(QuestMeaningBeat));
const validDungeonModes = new Set(Object.values(DungeonSpineMode));
const requiredChapterBeats = [
    QuestMeaningBeat.BIG_GOAL,
    QuestMeaningBeat.ROUTE_EXPLORATION,
    QuestMeaningBeat.INFORMATION_CLUES,
    QuestMeaningBeat.EQUIPMENT_PRESSURE,
    QuestMeaningBeat.TOWN_STATE_SHIFT,
    QuestMeaningBeat.BOSS_CONVERGENCE,
    QuestMeaningBeat.SIDE_STORY_DUNGEON
];
const mainQuests = QuestDatabase.main || [];
const mainQuestIds = new Set(mainQuests.map(quest => quest.id));
const implementedSpineNodes = MainQuestSpineNodes.filter(node => node.questId);
const implementedSpineIds = new Set(implementedSpineNodes.map(node => node.questId));
const plannedChapterNumbers = QuestSpineChapters.map(chapter => chapter.chapter);

assertUnique('QuestSpineChapters.chapter', plannedChapterNumbers);
assertUnique('MainQuestSpineNodes.questId', implementedSpineNodes.map(node => node.questId));
assertUnique('MainQuestSpineNodes.plannedQuestId', MainQuestSpineNodes.map(node => node.plannedQuestId));

for (const expectedChapter of [1, 2, 3, 4, 5, 6, 7]) {
    if (!plannedChapterNumbers.includes(expectedChapter)) {
        error('chapter-range', `missing chapter ${expectedChapter}`);
    }
}

for (const quest of mainQuests) {
    if (quest.type !== QuestType.MAIN) {
        error('quest-type', `${quest.id} is inside QuestDatabase.main but has type ${quest.type}`);
    }
    if (!implementedSpineIds.has(quest.id)) {
        error('quest-spine-coverage', `${quest.id} is not mapped in MainQuestSpineNodes`);
    }
}

for (const node of MainQuestSpineNodes) {
    const nodeId = node.questId || node.plannedQuestId || '(missing id)';

    if (!validRoles.has(node.role)) {
        error('spine-role', `${nodeId} has invalid role ${node.role}`);
    }
    if (!validStatuses.has(node.status)) {
        error('spine-status', `${nodeId} has invalid status ${node.status}`);
    }
    if (!plannedChapterNumbers.includes(node.plannedChapter)) {
        error('spine-chapter', `${nodeId} points at missing chapter ${node.plannedChapter}`);
    }
    if (node.questId && !mainQuestIds.has(node.questId)) {
        error('quest-exists', `${node.questId} is mapped in the spine but does not exist in QuestDatabase.main`);
    }
    if (!node.questId && node.status !== QuestSpineStatus.PLANNED_GAP) {
        error('planned-node-status', `${nodeId} has no real questId but is not marked planned_gap`);
    }

    for (const mapNodeId of node.mapNodeIds || []) {
        const mapNode = LandmarkMapNodePlan[mapNodeId];
        if (!mapNode) {
            error('map-node', `${nodeId} points at unknown landmark node ${mapNodeId}`);
            continue;
        }
        if (mapNode.chapter !== node.plannedChapter) {
            warn('map-node-chapter', `${nodeId} uses ${mapNodeId} from chapter ${mapNode.chapter} while planned for chapter ${node.plannedChapter}`);
        }
    }

    if (node.linkedBossId) {
        const bossPlan = getBossChapterPlanByBossId(node.linkedBossId);
        if (!bossPlan) {
            error('boss-plan', `${nodeId} links boss ${node.linkedBossId}, but ChapterBossPlan does not include it`);
        } else if (bossPlan.chapter !== node.plannedChapter) {
            error('boss-chapter', `${nodeId} links boss ${node.linkedBossId} planned for chapter ${bossPlan.chapter}, not ${node.plannedChapter}`);
        }
    }
}

for (const chapter of QuestSpineChapters) {
    if (!Array.isArray(chapter.levelRange) || chapter.levelRange.length !== 2) {
        error('chapter-level-range', `chapter ${chapter.chapter} has invalid levelRange`);
    } else if (chapter.levelRange[0] > chapter.levelRange[1]) {
        error('chapter-level-range', `chapter ${chapter.chapter} levelRange is reversed`);
    }

    const nodes = MainQuestSpineNodes.filter(node => node.plannedChapter === chapter.chapter);
    const mainBossNodes = nodes.filter(node =>
        node.role === QuestSpineRole.BOSS_CONVERGENCE && node.linkedBossId === chapter.mainBossId
    );
    const chapterBeatSet = new Set(chapter.meaningBeats || []);

    if (!Array.isArray(chapter.meaningBeats) || chapter.meaningBeats.length === 0) {
        error('chapter-meaning', `chapter ${chapter.chapter} has no meaningBeats`);
    }
    for (const beat of chapter.meaningBeats || []) {
        if (!validMeaningBeats.has(beat)) {
            error('chapter-meaning', `chapter ${chapter.chapter} has invalid meaning beat ${beat}`);
        }
    }
    for (const beat of requiredChapterBeats) {
        if (!chapterBeatSet.has(beat)) {
            error('chapter-meaning', `chapter ${chapter.chapter} is missing required meaning beat ${beat}`);
        }
    }

    const dungeonMode = chapter.dungeonIntegration?.mode;
    if (!dungeonMode) {
        error('chapter-dungeon-mode', `chapter ${chapter.chapter} has no dungeonIntegration.mode`);
    } else if (!validDungeonModes.has(dungeonMode)) {
        error('chapter-dungeon-mode', `chapter ${chapter.chapter} has invalid dungeon mode ${dungeonMode}`);
    }

    if (chapter.mainBossId && mainBossNodes.length === 0) {
        error('chapter-boss-convergence', `chapter ${chapter.chapter} has no convergence node for ${chapter.mainBossId}`);
    }

    if (!chapter.mainBossId && chapter.status !== QuestSpineStatus.PLANNED_GAP) {
        error('chapter-boss-slot', `chapter ${chapter.chapter} has no mainBossId but is not a planned gap`);
    }

    for (const bossId of chapter.optionalBossIds || []) {
        const optionalNodes = nodes.filter(node => node.linkedBossId === bossId || (node.bossThreadIds || []).includes(bossId));
        if (optionalNodes.length === 0) {
            error('chapter-optional-boss', `chapter ${chapter.chapter} has optional boss ${bossId} without a spine node`);
        }
    }
}

console.log('Quest spine coverage summary:');
for (const entry of getQuestSpineCoverageSummary()) {
    const bossLabel = entry.mainBossId || 'planned_gap';
    const meaningLabel = entry.meaningBeats.join('|') || 'missing';
    console.log(`- Chapter ${entry.chapter} ${entry.titleKey}: boss=${bossLabel}, dungeon=${entry.dungeonMode}, meaning=${meaningLabel}, runtimeNodes=${entry.implementedCount}`);
}

printList('Warnings:', warnings);
printList('Errors:', errors);

if (errors.length > 0) {
    process.exitCode = 1;
} else {
    console.log('\nQuest spine check passed.');
}
