import { QuestDatabase } from '../src/js/data/Quests.js';
import { QuestStoryDatabase } from '../src/js/data/QuestStories.js';
import { TownPlaceDatabase } from '../src/js/data/TownPlaces.js';

const problems = [];

const sideQuestTypes = new Set(['commission', 'hidden']);
const storyRequiredFields = ['discovery', 'available', 'active', 'completed', 'finished', 'nextLead'];
const characterProfileFields = ['cause', 'choice', 'mainThread', 'townState'];

function push(section, message) {
    problems.push({ section, message });
}

function allQuests() {
    return Object.values(QuestDatabase).flat();
}

function hasTriggerGate(quest) {
    const trigger = quest.trigger || {};
    return Boolean(
        trigger.type
        || trigger.afterQuest
        || trigger.duringQuest
        || trigger.afterFlag
        || trigger.interactionId
        || quest.requiredLevel
    );
}

const quests = allQuests();
const questsById = new Map(quests.map(quest => [quest.id, quest]));
const townStateFlags = new Set(
    TownPlaceDatabase.flatMap(place => (place.states || []).map(state => state.flag))
);
const sideQuests = quests.filter(quest => sideQuestTypes.has(quest.type));

for (const quest of sideQuests) {
    const label = `${quest.id} (${quest.name})`;
    const story = QuestStoryDatabase[quest.id];

    if (!story) {
        push('story-missing', `${label} has no QuestStoryDatabase entry`);
        continue;
    }

    if (!hasTriggerGate(quest)) {
        push('trigger-missing', `${label} has no trigger, level gate, or interaction gate`);
    }

    for (const field of storyRequiredFields) {
        if (!String(story[field] || '').trim()) {
            push('story-field-missing', `${label} is missing story.${field}`);
        }
    }

    if (!story.reportTo?.npcId || !story.reportTo?.name) {
        push('report-to-missing', `${label} has no story.reportTo npc`);
    }

    if (!Array.isArray(story.objectives) || story.objectives.length === 0) {
        push('story-objectives-missing', `${label} has no story-facing objective summary`);
    }

    if (quest.type === 'commission') {
        if (!story.characterProfile) {
            push('character-profile-missing', `${label} has no characterProfile`);
        } else {
            for (const field of characterProfileFields) {
                if (!String(story.characterProfile[field] || '').trim()) {
                    push('character-profile-field-missing', `${label} is missing characterProfile.${field}`);
                }
            }
            const townState = story.characterProfile.townState;
            if (townState && !townStateFlags.has(townState)) {
                push('town-state-unshown', `${label} references ${townState}, but no town place displays it`);
            }
        }
    }

    for (const unlockedId of quest.unlocks || []) {
        if (!questsById.has(unlockedId)) {
            push('unlock-missing', `${label} unlocks ${unlockedId}, but that quest does not exist`);
        }
    }

    for (const ref of ['afterQuest', 'duringQuest']) {
        const refId = quest.trigger?.[ref];
        if (refId && !questsById.has(refId)) {
            push('trigger-reference-missing', `${label} trigger.${ref} references ${refId}, but that quest does not exist`);
        }
    }
}

if (problems.length > 0) {
    console.error(`Side story flow check found ${problems.length} issue(s):`);
    for (const problem of problems) {
        console.error(`- [${problem.section}] ${problem.message}`);
    }
    process.exit(1);
}

console.log(`Side story flow check passed. Checked ${sideQuests.length} side/hidden quests.`);
