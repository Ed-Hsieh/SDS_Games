import GameManager from '../src/js/managers/GameManager.js';
import { questManager, QuestStatus, ObjectiveType } from '../src/js/managers/QuestManager.js';
import { dialogueManager } from '../src/js/managers/DialogueManager.js';
import {
    getTownRuntimeSummary,
    TownRuntimeStage,
    TownVisibility
} from '../src/js/managers/TownStateResolver.js';
import { TownPlaceDatabase } from '../src/js/data/TownPlaces.js';
import { QuestStoryDatabase } from '../src/js/data/QuestStories.js';

const issues = [];

function issue(section, message) {
    issues.push({ section, message });
}

function visiblePlaceIds(summary) {
    return new Set(summary.visiblePlaces.map(place => place.id));
}

function visibleResidentIds(summary) {
    return new Set(summary.visibleResidents.map(resident => resident.npcId));
}

function expectSetContains(set, id, section, message) {
    if (!set.has(id)) issue(section, message || `Expected ${id}`);
}

function expectSetOmits(set, id, section, message) {
    if (set.has(id)) issue(section, message || `Unexpected ${id}`);
}

function setFlags(flags, value) {
    for (const flag of flags) GameManager.setFlag(flag, value);
}

const initialSummary = getTownRuntimeSummary();
const initialPlaces = visiblePlaceIds(initialSummary);
const initialResidents = visibleResidentIds(initialSummary);

for (const placeId of ['crossroads', 'gate', 'handbook', 'market', 'forge']) {
    expectSetContains(initialPlaces, placeId, 'chapter1-initial-place', `${placeId} should be visible in the first chapter town.`);
}

for (const placeId of ['alley', 'casino', 'tower']) {
    expectSetOmits(initialPlaces, placeId, 'chapter1-initial-hidden-place', `${placeId} should not be visible in the first chapter initial town.`);
}

for (const npcId of ['village_elder', 'town_scholar']) {
    expectSetContains(initialResidents, npcId, 'chapter1-initial-resident', `${npcId} should support the first chapter opening loop.`);
}

for (const npcId of ['blacksmith', 'standard_bearer_frey', 'herbalist', 'merchant', 'tinker', 'supply_captain', 'lamplighter_tavi', 'old_miner_bran', 'rumor_broker', 'casino_dealer', 'black_market']) {
    expectSetOmits(initialResidents, npcId, 'chapter1-delayed-resident', `${npcId} should not appear before its town-state flag.`);
}

if (initialSummary.visibleResidents.length > 2) {
    issue('chapter1-density', `Initial town shows ${initialSummary.visibleResidents.length} residents; expected only the village elder and town scholar.`);
}

GameManager.setFlag('town.elder.first_warning', true);
GameManager.setFlag('town.network.first_recovery_named', true);
GameManager.setFlag('town.scholar.first_index_open', true);
dialogueManager.resetProgress();
dialogueManager.markSeen('village_elder', 'elder_broken_town_opening');
dialogueManager.markSeen('town_scholar', 'scholar_first_index');
questManager.questStates = {
    main_001: {
        status: QuestStatus.COMPLETED,
        progress: [
            { type: ObjectiveType.TALK, target: 'town_scholar', current: 1, required: 1 },
            { type: ObjectiveType.EXPLORE, target: 'chapter1_route_intro', current: 3, required: 3 }
        ],
        startTime: Date.now()
    }
};

const elderReportDialogues = dialogueManager.getAvailableDialogues('village_elder')
    .map(dialogue => dialogue.id);
if (!elderReportDialogues.includes('report_main_001')) {
    issue('quest-report-prompt', 'main_001 completed state should create a report dialogue on village_elder.');
}
if (!dialogueManager.hasFreshDialogue('village_elder')) {
    issue('quest-report-prompt', 'village_elder should show a fresh dialogue prompt when main_001 is ready to report.');
}
if (dialogueManager.hasFreshDialogue('town_scholar')) {
    issue('quest-report-prompt', 'town_scholar should not receive the main_001 report prompt.');
}

dialogueManager.resetProgress();
questManager.questStates = {
    commission_forge_001: {
        status: QuestStatus.AVAILABLE,
        progress: [],
        startTime: null
    }
};
const blacksmithRequestDialogues = dialogueManager.getAvailableDialogues('blacksmith')
    .map(dialogue => dialogue.id);
if (!blacksmithRequestDialogues.includes('request_commission_forge_001')) {
    issue('quest-request-prompt', 'commission_forge_001 available state should create a request dialogue on blacksmith.');
}
if (!dialogueManager.hasFreshDialogue('blacksmith')) {
    issue('quest-request-prompt', 'blacksmith should show a fresh dialogue prompt when a commission is available.');
}

const recoveryFlags = [
    'town.supply.route_problem_named',
    'town.supply.first_route_open',
    'town.south_gate.guard_route_ready',
    'market.rumor.material_index',
    'town.rumor.elite_warning_open',
    'town.tinker.repair_logic_named',
    'town.mine.route_problem_named'
];
setFlags(recoveryFlags, true);

const recoverySummary = getTownRuntimeSummary();
const recoveryResidents = visibleResidentIds(recoverySummary);

for (const npcId of ['merchant', 'tinker', 'supply_captain', 'lamplighter_tavi', 'old_miner_bran', 'rumor_broker']) {
    expectSetContains(recoveryResidents, npcId, 'chapter1-recovery-resident', `${npcId} should appear after first recovery flags.`);
}

const townStateFlags = new Set(
    TownPlaceDatabase.flatMap(place => (place.states || []).map(state => state.flag).filter(Boolean))
);

for (const [questId, story] of Object.entries(QuestStoryDatabase)) {
    const townState = story?.characterProfile?.townState;
    if (!townState) continue;
    if (!townStateFlags.has(townState)) {
        issue('quest-town-state', `${questId} references ${townState}, but no town place displays it.`);
    }
}

const hiddenPlaces = getTownRuntimeSummary().hiddenPlaces;
for (const place of hiddenPlaces) {
    if (place.runtimeVisibility !== TownVisibility.HIDDEN) {
        issue('visibility-state', `${place.id} should be marked hidden, got ${place.runtimeVisibility}.`);
    }
}

if (![TownRuntimeStage.CHAPTER_1_INITIAL, TownRuntimeStage.SHADOW_SOURCES].includes(recoverySummary.stage)) {
    issue('runtime-stage', `Unexpected runtime stage: ${recoverySummary.stage}`);
}

if (issues.length > 0) {
    console.error(`Town runtime check found ${issues.length} issue(s):`);
    for (const entry of issues) {
        console.error(`- [${entry.section}] ${entry.message}`);
    }
    process.exit(1);
}

console.log('Town runtime summary:');
console.log(`- initial visible places: ${[...initialPlaces].join(', ')}`);
console.log(`- initial visible residents: ${[...initialResidents].join(', ')}`);
console.log(`- recovery visible residents: ${[...recoveryResidents].join(', ')}`);
console.log('Town runtime check passed.');
