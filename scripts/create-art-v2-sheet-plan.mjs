import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const artRoot = path.join(projectRoot, 'src/assets/images/art-v2');
const outputRoot = path.join(projectRoot, 'scripts/asset-crops/art-v2/generated');

const categoryRules = {
    portraits: { columns: 3, rows: 3, outputSize: { width: 768, height: 768 } },
    equipment: { columns: 5, rows: 5, outputSize: { width: 512, height: 512 } },
    materials: { columns: 5, rows: 5, outputSize: { width: 512, height: 512 } },
    blueprints: { columns: 5, rows: 5, outputSize: { width: 512, height: 512 } },
    'shop-items': { columns: 5, rows: 5, outputSize: { width: 512, height: 512 } },
    'crafted-items': { columns: 5, rows: 5, outputSize: { width: 512, height: 512 } },
    clues: { columns: 5, rows: 5, outputSize: { width: 512, height: 512 } },
    monsters: { columns: 5, rows: 5, outputSize: { width: 512, height: 512 } },
    'town-places': { columns: 5, rows: 5, outputSize: { width: 512, height: 512 } },
    'dungeon-zone-scenes': { columns: 5, rows: 5, outputSize: { width: 512, height: 512 } },
    'world-landmarks': { columns: 5, rows: 5, outputSize: { width: 512, height: 512 } },
    'map-props': { columns: 5, rows: 5, outputSize: { width: 512, height: 512 } },
    'story-relics': { columns: 5, rows: 5, outputSize: { width: 512, height: 512 } },
    'combat-effects': { columns: 5, rows: 5, outputSize: { width: 512, height: 512 } }
};

function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

function createPrompt(category, ids, rule) {
    const grid = `${rule.columns} by ${rule.rows}`;
    const count = rule.columns * rule.rows;
    return [
        `Create a strict ${grid} grid source sheet for SDS_Games category "${category}".`,
        `The canvas must be square. Every cell must be exactly the same size. Use ${count} equal cells.`,
        'Place subjects in this exact left-to-right, top-to-bottom order:',
        ids.join(', '),
        'Leave unused cells blank. No text, no labels, no numbers, no watermark, no UI frames.',
        'No overlapping, no object crossing cell boundaries, no cropped-off subjects, no compressed bottom row.',
        'Style: polished dark fantasy RPG, painterly semi-realistic, clear silhouettes, moody blue shadows and warm accent light.',
        'Background: dark neutral flat background inside each cell, subtle grid separation allowed.'
    ].join('\n');
}

if (!fs.existsSync(artRoot)) {
    throw new Error(`Missing art-v2 directory: ${artRoot}`);
}

fs.mkdirSync(outputRoot, { recursive: true });

const index = [];
for (const [category, rule] of Object.entries(categoryRules)) {
    const categoryPath = path.join(artRoot, category);
    if (!fs.existsSync(categoryPath)) continue;

    const ids = fs.readdirSync(categoryPath)
        .filter(file => path.extname(file).toLowerCase() === '.webp')
        .map(file => path.basename(file, '.webp'))
        .sort((a, b) => a.localeCompare(b));

    const batchSize = rule.columns * rule.rows;
    const batches = chunk(ids, batchSize);
    batches.forEach((batchIds, batchIndex) => {
        const batchNo = String(batchIndex + 1).padStart(2, '0');
        const slug = `${category}-sheet-${batchNo}`;
        const config = {
            source: `incoming/raw/art-v2/${slug}.png`,
            category,
            columns: rule.columns,
            rows: rule.rows,
            outputSize: rule.outputSize,
            format: 'webp',
            ids: batchIds
        };
        const prompt = createPrompt(category, batchIds, rule);
        const configPath = path.join(outputRoot, `${slug}.grid.json`);
        const promptPath = path.join(outputRoot, `${slug}.prompt.txt`);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
        fs.writeFileSync(promptPath, prompt + '\n', 'utf8');
        index.push({
            category,
            slug,
            count: batchIds.length,
            source: config.source,
            config: path.relative(projectRoot, configPath).replace(/\\/g, '/'),
            prompt: path.relative(projectRoot, promptPath).replace(/\\/g, '/')
        });
    });
}

fs.writeFileSync(
    path.join(outputRoot, 'index.json'),
    JSON.stringify({ version: 1, batches: index }, null, 2) + '\n',
    'utf8'
);

console.log(`Wrote ${index.length} art-v2 sheet batch config(s) -> ${path.relative(projectRoot, outputRoot)}`);
