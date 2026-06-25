import { CrossChapterStoryArcs } from '../src/js/data/CrossChapterStoryArcs.js';

const problems = [];

function push(section, message) {
    problems.push({ section, message });
}

const requiredFields = [
    'id',
    'title',
    'theme',
    'chapters',
    'firstChapterSeed',
    'chapterTwoExpansion',
    'chapterThreePayoff',
    'gameplayBridge',
    'riskIfMissing',
    'relatedQuests',
    'relatedSystems'
];

const ids = new Set();

for (const arc of CrossChapterStoryArcs) {
    const label = arc.id || '(missing id)';

    if (ids.has(arc.id)) {
        push('duplicate-id', `${label} is duplicated`);
    }
    ids.add(arc.id);

    for (const field of requiredFields) {
        if (field === 'chapters') continue;
        if (Array.isArray(arc[field])) {
            if (arc[field].length === 0) {
                push('empty-field', `${label} has empty ${field}`);
            }
            continue;
        }
        if (!String(arc[field] || '').trim()) {
            push('missing-field', `${label} is missing ${field}`);
        }
    }

    for (const chapter of [1, 2, 3]) {
        if (!String(arc.chapters?.[chapter] || '').trim()) {
            push('missing-chapter', `${label} is missing chapter ${chapter} bridge text`);
        }
    }
}

if (CrossChapterStoryArcs.length < 6) {
    push('thin-arc-count', `expected at least 6 cross-chapter arcs, found ${CrossChapterStoryArcs.length}`);
}

if (problems.length > 0) {
    console.error(`Cross chapter story arcs check found ${problems.length} issue(s):`);
    for (const problem of problems) {
        console.error(`- [${problem.section}] ${problem.message}`);
    }
    process.exit(1);
}

console.log(`Cross chapter story arcs check passed. Checked ${CrossChapterStoryArcs.length} arcs.`);
console.log(JSON.stringify({
    arcs: CrossChapterStoryArcs.map(arc => ({
        id: arc.id,
        title: arc.title,
        relatedQuests: arc.relatedQuests.length,
        relatedSystems: arc.relatedSystems.length
    }))
}, null, 2));
