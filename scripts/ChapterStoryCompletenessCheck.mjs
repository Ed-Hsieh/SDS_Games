import { QuestDatabase } from '../src/js/data/Quests.js';
import { QuestStoryDatabase } from '../src/js/data/QuestStories.js';
import { TownDialogueDatabase } from '../src/js/data/NPCDialogues.js';
import { TownPlaceDatabase } from '../src/js/data/TownPlaces.js';

const problems = [];

const minimums = {
    2: {
        main: 5,
        commission: 4,
        townStates: 6
    },
    3: {
        main: 4,
        commission: 5,
        townStates: 8
    }
};

const internalFlags = new Set([
    'metTownScholarForRoute'
]);

function push(section, message) {
    problems.push({ section, message });
}

function allQuests() {
    return Object.values(QuestDatabase).flat();
}

const quests = allQuests();
const townStateFlags = new Set(
    TownPlaceDatabase.flatMap(place => (place.states || []).map(state => state.flag))
);

for (const [chapterText, requirement] of Object.entries(minimums)) {
    const chapter = Number(chapterText);
    const chapterQuests = quests.filter(quest => quest.chapter === chapter);
    const mainCount = chapterQuests.filter(quest => quest.type === 'main').length;
    const commissionQuests = chapterQuests.filter(quest => quest.type === 'commission');
    const commissionCount = commissionQuests.length;

    if (mainCount < requirement.main) {
        push('chapter-main-count', `chapter ${chapter} has ${mainCount} main quests; expected at least ${requirement.main}`);
    }

    if (commissionCount < requirement.commission) {
        push('chapter-commission-count', `chapter ${chapter} has ${commissionCount} commissions; expected at least ${requirement.commission}`);
    }

    const chapterTownStates = new Set();
    for (const quest of commissionQuests) {
        const story = QuestStoryDatabase[quest.id];
        if (!story) {
            push('quest-story-missing', `${quest.id} (${quest.name}) has no QuestStoryDatabase entry`);
            continue;
        }
        if (!story.characterProfile) {
            push('character-profile-missing', `${quest.id} (${quest.name}) has no characterProfile`);
        }
        const townState = story.characterProfile?.townState;
        if (!townState) {
            push('town-state-missing', `${quest.id} (${quest.name}) has no characterProfile.townState`);
        } else {
            chapterTownStates.add(townState);
            if (!townStateFlags.has(townState)) {
                push('town-place-state-missing', `${quest.id} (${quest.name}) references ${townState}, but no town place displays it`);
            }
        }
    }

    if (chapterTownStates.size < requirement.townStates) {
        push('chapter-town-state-count', `chapter ${chapter} has ${chapterTownStates.size} unique commission town states; expected at least ${requirement.townStates}`);
    }
}

for (const [npcId, dialogues] of Object.entries(TownDialogueDatabase)) {
    for (const dialogue of dialogues) {
        for (const effect of dialogue.effects || []) {
            if (effect.type !== 'setFlag' || internalFlags.has(effect.flag)) continue;
            if (!townStateFlags.has(effect.flag)) {
                push('dialogue-flag-unshown', `${npcId}.${dialogue.id} sets ${effect.flag}, but no town place displays it`);
            }
        }
    }
}

if (problems.length > 0) {
    console.error(`Chapter story completeness check found ${problems.length} issue(s):`);
    for (const problem of problems) {
        console.error(`- [${problem.section}] ${problem.message}`);
    }
    process.exit(1);
}

console.log('Chapter story completeness check passed.');
