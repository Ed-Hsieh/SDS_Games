import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = path.join(projectRoot, 'docs', 'MAIN_STORY_BIBLE.md');
const outputPath = path.join(projectRoot, 'src', 'js', 'data', 'StorySceneRegistry.js');

const source = fs.readFileSync(sourcePath, 'utf8');
const detailStart = source.indexOf('## Chapter 1 Detailed Screenplay V1');

if (detailStart < 0) {
    throw new Error('Could not find the detailed screenplay in MAIN_STORY_BIBLE.md.');
}

const detailSource = source.slice(detailStart);
const headingPattern = /^### `(ch([1-7])_s(\d{2})_[a-z0-9_]+)`\s*$/gm;
const matches = [...detailSource.matchAll(headingPattern)];

if (matches.length !== 66) {
    throw new Error(`Expected 66 detailed scenes, found ${matches.length}.`);
}

function stripTicks(value = '') {
    return String(value).trim().replace(/^`|`$/g, '');
}

function parseMetadata(block) {
    const metadata = {};
    for (const match of block.matchAll(/^- `([A-Za-z]+)`: (.+)$/gm)) {
        metadata[match[1]] = stripTicks(match[2]);
    }
    return metadata;
}

function parseBeats(block, sceneId) {
    const beats = [];
    const lines = block.split(/\r?\n/);
    const headerIndex = lines.findIndex(line => /^\|\s*Order\s*\|/.test(line));
    const headerLine = headerIndex >= 0 ? lines[headerIndex] : null;
    const headers = headerLine
        ? headerLine.slice(1, -1).split('|').map(cell => cell.trim())
        : [];
    const column = label => headers.indexOf(label);
    const orderColumn = column('Order');
    const conditionColumn = column('Condition');
    const beatColumn = column('Beat');
    const speakerColumn = column('Speaker');
    const expressionColumn = column('Expression');
    const phaseColumn = column('Presentation Phase');
    const visualColumn = column('Visual Mode');
    const textColumn = column('Runtime Text / Stage Action');

    for (const line of lines.slice(headerIndex + 2)) {
        if (!/^\|/.test(line)) break;
        if (!/^\|\s*\d+\s*\|/.test(line)) continue;
        const cells = line.slice(1, -1).split('|').map(cell => cell.trim());
        if (cells.length < headers.length || textColumn < 0) {
            throw new Error(`Malformed beat row in ${sceneId}: ${line}`);
        }
        const speaker = cells[speakerColumn];
        const expression = cells[expressionColumn];
        const phase = phaseColumn >= 0 ? stripTicks(cells[phaseColumn]) : '';
        const visualMode = visualColumn >= 0 ? stripTicks(cells[visualColumn]) : '';
        const beat = stripTicks(cells[beatColumn]);
        const actorIds = stripTicks(speaker) === '-'
            ? []
            : stripTicks(speaker).split(',').map(value => value.trim()).filter(Boolean);
        const entry = {
            order: Number(cells[orderColumn]),
            condition: stripTicks(cells[conditionColumn]),
            beat,
            actorId: actorIds[0] || null,
            expression: stripTicks(expression) === '-' ? null : stripTicks(expression),
            text: cells.slice(textColumn).join('|').trim()
        };
        if (['enter', 'exit'].includes(beat) && actorIds.length) {
            entry.actorIds = actorIds;
            entry.stageAction = beat;
        }
        if (phase && phase !== '-') entry.presentationPhase = phase;
        if (visualMode && visualMode !== '-') entry.visualMode = visualMode;
        beats.push(entry);
    }

    if (!beats.length || beats.some((entry, index) => entry.order !== index + 1)) {
        throw new Error(`Scene ${sceneId} must have consecutive beat order from 1.`);
    }
    return beats;
}

function parseCheckpoints(block, sceneId) {
    const checkpoints = {};
    const lines = block.split(/\r?\n/);
    const headerLine = lines.find(line => /^\|\s*Checkpoint\s*\|/.test(line));
    if (headerLine) {
        const headers = headerLine.slice(1, -1).split('|').map(cell => cell.trim());
        const column = label => headers.indexOf(label);
        const checkpointColumn = column('Checkpoint');
        const titleColumn = column('Title');
        const rangeColumn = column('Beat Range');
        const backgroundColumn = column('Background');
        const imageColumn = column('Background Image');

        for (const line of lines) {
            if (!/^\|\s*`[a-z0-9_]+`\s*\|/.test(line)) continue;
            const cells = line.slice(1, -1).split('|').map(cell => cell.trim());
            if (cells.length < headers.length) continue;
            const checkpointId = stripTicks(cells[checkpointColumn]);
            const range = stripTicks(cells[rangeColumn]).match(/^(\d+)-(\d+)$/);
            if (!checkpointId || !range) {
                throw new Error(`Malformed checkpoint row in ${sceneId}: ${line}`);
            }
            checkpoints[checkpointId] = {
                title: stripTicks(cells[titleColumn]),
                beatRange: [Number(range[1]), Number(range[2])],
                background: stripTicks(cells[backgroundColumn]),
                backgroundImage: stripTicks(cells[imageColumn])
            };
        }
    }

    const checkpointHeadingPattern = /^#### Checkpoint `([a-z0-9_]+)`: (.+)$/gm;
    const checkpointMatches = [...block.matchAll(checkpointHeadingPattern)];
    checkpointMatches.forEach((match, index) => {
        const checkpointId = match[1];
        const start = match.index;
        const end = checkpointMatches[index + 1]?.index ?? block.length;
        const checkpointBlock = block.slice(start, end);
        checkpoints[checkpointId] = {
            ...(checkpoints[checkpointId] || {}),
            id: checkpointId,
            title: match[2].trim(),
            beats: parseBeats(checkpointBlock, `${sceneId}/${checkpointId}`)
        };
    });

    return checkpoints;
}

const scenes = matches.map((match, index) => {
    const start = match.index;
    const end = matches[index + 1]?.index ?? detailSource.length;
    const block = detailSource.slice(start, end);
    const metadata = parseMetadata(block);
    const id = match[1];
    const checkpoints = parseCheckpoints(block, id);

    return {
        id,
        ...(metadata.title ? { title: metadata.title } : {}),
        chapter: Number(match[2]),
        chapterOrder: Number(match[3]),
        stageClass: metadata.stageClass,
        background: metadata.background,
        worldState: metadata.worldState,
        viewpoint: metadata.viewpoint,
        knowledgeBoundary: metadata.knowledgeBoundary || null,
        participantsRaw: metadata.participants,
        entry: metadata.entry,
        exit: metadata.exit,
        objective: metadata.objective,
        inputsRaw: metadata.inputs,
        outputsRaw: metadata.outputs,
        assetNotes: metadata.assetNotes,
        ...(Object.keys(checkpoints).length ? { checkpoints } : {}),
        beats: parseBeats(block, id)
    };
});

const stageClasses = [...new Set(scenes.map(scene => scene.stageClass))].sort();
const viewpoints = [...new Set(scenes.map(scene => scene.viewpoint))].sort();
const registry = Object.fromEntries(scenes.map(scene => [scene.id, scene]));
const chapterOrder = Object.fromEntries(
    Array.from({ length: 7 }, (_, index) => {
        const chapter = index + 1;
        return [chapter, scenes.filter(scene => scene.chapter === chapter).map(scene => scene.id)];
    })
);

const output = `/**
 * StorySceneRegistry.js
 * Generated by scripts/CompileStorySceneRegistry.mjs from the accepted-format
 * detailed screenplay. After runtime migration this structured registry is the
 * system owner; rewards remain deliberately absent.
 */

export const StoryStageClasses = Object.freeze(${JSON.stringify(stageClasses, null, 4)});

export const StoryViewpoints = Object.freeze(${JSON.stringify(viewpoints, null, 4)});

export const StorySceneOrder = Object.freeze(${JSON.stringify(scenes.map(scene => scene.id), null, 4)});

export const StorySceneOrderByChapter = Object.freeze(${JSON.stringify(chapterOrder, null, 4)});

export const StorySceneRegistry = Object.freeze(${JSON.stringify(registry, null, 4)});

export function getStoryScene(sceneId) {
    return StorySceneRegistry[sceneId] || null;
}

export function getStoryScenesByChapter(chapter) {
    const ids = StorySceneOrderByChapter[Number(chapter)] || [];
    return ids.map(getStoryScene).filter(Boolean);
}

export function getNextStorySceneId(sceneId) {
    const index = StorySceneOrder.indexOf(sceneId);
    return index >= 0 ? (StorySceneOrder[index + 1] || null) : null;
}

export function getPreviousStorySceneId(sceneId) {
    const index = StorySceneOrder.indexOf(sceneId);
    return index > 0 ? StorySceneOrder[index - 1] : null;
}
`;

fs.writeFileSync(outputPath, output, 'utf8');
console.log(`Wrote ${scenes.length} scenes to ${path.relative(projectRoot, outputPath)}.`);
