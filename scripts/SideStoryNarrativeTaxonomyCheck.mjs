import { QuestDatabase } from '../src/js/data/Quests.js';
import {
    SideBossPotential,
    SideStoryNarrativeTaxonomy,
    SideStoryToneLabels
} from '../src/js/data/SideStoryNarrativeTaxonomy.js';

const problems = [];
const warnings = [];

function push(list, section, message) {
    list.push({ section, message });
}

function allQuests() {
    return Object.values(QuestDatabase).flat();
}

const sideQuests = allQuests().filter(quest => quest.type === 'commission' && [1, 2, 3].includes(Number(quest.chapter)));
const knownTones = new Set(Object.keys(SideStoryToneLabels));
const knownBossPotential = new Set(Object.values(SideBossPotential));

for (const quest of sideQuests) {
    const label = `${quest.id} (${quest.name})`;
    const meta = SideStoryNarrativeTaxonomy[quest.id];

    if (!meta) {
        push(problems, 'missing-taxonomy', `${label} has no side-story narrative taxonomy`);
        continue;
    }

    if (Number(meta.chapter) !== Number(quest.chapter)) {
        push(problems, 'chapter-mismatch', `${label} taxonomy chapter ${meta.chapter} does not match quest chapter ${quest.chapter}`);
    }

    if (!knownTones.has(meta.primaryTone)) {
        push(problems, 'invalid-primary-tone', `${label} has invalid primary tone ${meta.primaryTone}`);
    }

    for (const tone of meta.secondaryTones || []) {
        if (!knownTones.has(tone)) {
            push(problems, 'invalid-secondary-tone', `${label} has invalid secondary tone ${tone}`);
        }
    }

    for (const field of ['narrativeRole', 'emotionalCore', 'playPromise']) {
        if (!String(meta[field] || '').trim()) {
            push(problems, 'missing-core-field', `${label} is missing ${field}`);
        }
    }

    if (!Array.isArray(meta.expansionBeats) || meta.expansionBeats.length < 3) {
        push(problems, 'thin-expansion-beats', `${label} should have at least 3 expansion beats`);
    }

    if (!knownBossPotential.has(meta.sideBossPotential)) {
        push(problems, 'invalid-boss-potential', `${label} has invalid sideBossPotential ${meta.sideBossPotential}`);
    }

    if (meta.sideBossPotential === SideBossPotential.SIDE_BOSS && !String(meta.sideBossSeed || '').trim()) {
        push(problems, 'missing-boss-seed', `${label} is marked as side boss but has no sideBossSeed`);
    }
}

const chapterToneCounts = {};
for (const quest of sideQuests) {
    const meta = SideStoryNarrativeTaxonomy[quest.id];
    if (!meta) continue;
    const chapter = Number(quest.chapter);
    chapterToneCounts[chapter] ||= {};
    chapterToneCounts[chapter][meta.primaryTone] = (chapterToneCounts[chapter][meta.primaryTone] || 0) + 1;
}

if ((chapterToneCounts[2]?.adventure || 0) === 0) {
    push(warnings, 'chapter-2-tone-gap', 'chapter 2 has no primary adventure side story; keep exploration beats inside secondary tones or future events');
}

if ((chapterToneCounts[3]?.survival || 0) === 0) {
    push(warnings, 'chapter-3-tone-gap', 'chapter 3 has no primary survival side story');
}

if (problems.length > 0) {
    console.error(`Side story narrative taxonomy check found ${problems.length} issue(s):`);
    for (const problem of problems) {
        console.error(`- [${problem.section}] ${problem.message}`);
    }
    process.exit(1);
}

console.log(`Side story narrative taxonomy check passed. Checked ${sideQuests.length} chapter 1/2/3 commissions.`);
if (warnings.length > 0) {
    console.log(`Warnings: ${warnings.length}`);
    for (const warning of warnings) {
        console.log(`- [${warning.section}] ${warning.message}`);
    }
}
console.log(JSON.stringify({ chapterToneCounts }, null, 2));
