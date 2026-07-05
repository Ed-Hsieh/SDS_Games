import fs from 'node:fs';
import path from 'node:path';

import { CasinoSpecialItems } from '../src/js/data/CasinoRewards.js';
import { DungeonDatabase } from '../src/js/data/Dungeons.js';
import { EquipmentDatabase } from '../src/js/data/Equipment.js';
import { MarketItemCatalog } from '../src/js/data/MarketSupply.js';
import { MaterialDatabase } from '../src/js/data/Materials.js';
import { MonsterDatabase, TowerMonsterData } from '../src/js/data/Monsters.js';
import { RecipeDatabase } from '../src/js/data/Recipes.js';
import { TownPlaceDatabase } from '../src/js/data/TownPlaces.js';

const projectRoot = process.cwd();
const outputDir = path.join(projectRoot, 'docs/generated');
const jsonPath = path.join(outputDir, 'art-asset-queue.json');
const mdPath = path.join(outputDir, 'art-asset-queue.md');

const mainBossIds = new Set([
    'forest_guardian',
    'lich',
    'shadow_commander',
    'ancient_titan',
    'elemental_lord',
    'elder_dragon',
    'shadow_overlord',
    'demon_lord_asariel',
    'tower_void_king'
]);

const folderMap = {
    materials: 'items/materials',
    equipment: 'items/equipment',
    craftedItems: 'items/crafted-items',
    blueprints: 'items/blueprints',
    shopItems: 'items/shop-items',
    clues: 'items/clues',
    townPlaces: 'scenes/town/places',
    dungeonCards: 'scenes/dungeons/cards',
    dungeonFull: 'scenes/dungeons/full',
    monsterNormal: 'entities/monsters/normal',
    monsterElite: 'entities/monsters/elite',
    monsterBossSide: 'entities/monsters/boss-side',
    monsterBossMain: 'entities/monsters/boss-main'
};

function values(object) {
    return Object.values(object || {});
}

function entries(object) {
    return Object.entries(object || {});
}

function normalizeId(id = '') {
    return String(id || '').replace(/^crafted_/, '');
}

function cleanText(value = '') {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function outputPath(folder, id) {
    return `src/assets/images/art/${folder}/${id}.webp`;
}

function styleLine(kind) {
    if (kind === 'material') {
        return 'Style: match the current SDS_Games dark realistic fantasy item-icon style, painterly, tactile material detail, clear silhouette, moody dark neutral background, no text.';
    }
    if (kind === 'equipment') {
        return 'Style: match the current SDS_Games dark realistic fantasy equipment style, centered collectible item render, readable weapon or armor form, moody dark neutral background, no text.';
    }
    if (kind === 'blueprint') {
        return 'Style: aged parchment blueprint with dark fantasy drafting marks, clamps or table shadow, no readable text, no UI frame.';
    }
    if (kind === 'monster-normal') {
        return 'Style: dark realistic fantasy monster portrait, ordinary enemy tier, creature centered, transparent or extremely minimal dark background, no full scene, no boss poster lighting.';
    }
    if (kind === 'monster-elite') {
        return 'Style: dark realistic fantasy elite monster portrait, creature centered, low-key environmental hints allowed, less ornate than a main boss, no text.';
    }
    if (kind === 'monster-boss-side') {
        return 'Style: dark realistic fantasy side boss portrait, creature dominant with modest scene dressing, dramatic but clearly below main story boss grandeur, no text.';
    }
    if (kind === 'monster-boss-main') {
        return 'Style: preserve main story boss full-frame dark fantasy illustration style, cinematic chapter presence, no text.';
    }
    return 'Style: dark realistic fantasy game asset, clear silhouette, no text, no watermark.';
}

function promptFor(entry) {
    const lines = [
        'Use case: stylized-concept',
        `Asset type: ${entry.kind}`,
        `Primary request: ${entry.name || entry.id} (${entry.id})`,
        entry.description ? `Design note: ${entry.description}` : '',
        styleLine(entry.kind),
        'Composition: 512x512 square asset, centered subject, generous padding, no cropped edges.',
        'Constraints: no text, no labels, no numbers, no watermark, no UI frame.'
    ];
    return lines.filter(Boolean).join('\n');
}

function push(queue, entry) {
    const id = normalizeId(entry.id);
    if (!id) return;
    const full = {
        ...entry,
        id,
        output: outputPath(entry.folder, id)
    };
    full.prompt = promptFor(full);
    queue.push(full);
}

function monsterFolderAndKind(monster = {}) {
    const type = String(monster.type || '').toLowerCase();
    if (mainBossIds.has(monster.id) || type === 'world_boss') {
        return { folder: folderMap.monsterBossMain, kind: 'monster-boss-main' };
    }
    if (type === 'boss') return { folder: folderMap.monsterBossSide, kind: 'monster-boss-side' };
    if (type === 'elite') return { folder: folderMap.monsterElite, kind: 'monster-elite' };
    return { folder: folderMap.monsterNormal, kind: 'monster-normal' };
}

const queue = [];

for (const [id, material] of entries(MaterialDatabase)) {
    push(queue, {
        category: 'materials',
        folder: folderMap.materials,
        kind: 'material',
        source: 'MaterialDatabase',
        id,
        name: material.name,
        rarity: material.rarity,
        description: cleanText(material.description)
    });
}

for (const [id, equipment] of entries(EquipmentDatabase)) {
    push(queue, {
        category: 'equipment',
        folder: folderMap.equipment,
        kind: 'equipment',
        source: 'EquipmentDatabase',
        id,
        name: equipment.name,
        rarity: equipment.rarity,
        description: cleanText(equipment.description)
    });
}

for (const [id, recipe] of entries(RecipeDatabase)) {
    push(queue, {
        category: 'blueprints',
        folder: folderMap.blueprints,
        kind: 'blueprint',
        source: 'RecipeDatabase.blueprint',
        id,
        name: recipe.name,
        rarity: recipe.rarity,
        description: cleanText(recipe.description)
    });
    if (recipe.result?.id) {
        push(queue, {
            category: 'craftedItems',
            folder: folderMap.craftedItems,
            kind: 'equipment',
            source: 'RecipeDatabase.result',
            id: recipe.result.id,
            name: recipe.result.name || recipe.name,
            rarity: recipe.result.rarity || recipe.rarity,
            description: cleanText(recipe.result.description || recipe.description)
        });
    }
}

for (const [id, item] of entries(MarketItemCatalog)) {
    push(queue, {
        category: 'shopItems',
        folder: folderMap.shopItems,
        kind: 'equipment',
        source: 'MarketItemCatalog',
        id,
        name: item.name,
        rarity: item.rarity,
        description: cleanText(item.description)
    });
}

for (const [id, item] of entries(CasinoSpecialItems)) {
    push(queue, {
        category: 'equipment',
        folder: folderMap.equipment,
        kind: 'equipment',
        source: 'CasinoSpecialItems',
        id,
        name: item.name,
        rarity: item.rarity,
        description: cleanText(item.description)
    });
}

for (const [id, monster] of entries(MonsterDatabase)) {
    const { folder, kind } = monsterFolderAndKind({ ...monster, id: monster.id || id });
    push(queue, {
        category: 'monsters',
        folder,
        kind,
        source: 'MonsterDatabase',
        id,
        name: monster.name,
        level: monster.level,
        description: cleanText(monster.description)
    });
}

for (const [id, monster] of entries(TowerMonsterData)) {
    const { folder, kind } = monsterFolderAndKind({ ...monster, id: monster.id || id });
    push(queue, {
        category: 'monsters',
        folder,
        kind,
        source: 'TowerMonsterData',
        id,
        name: monster.name,
        level: monster.level,
        description: cleanText(monster.description)
    });
}

for (const place of TownPlaceDatabase || []) {
    push(queue, {
        category: 'town-places',
        folder: folderMap.townPlaces,
        kind: 'scene',
        source: 'TownPlaceDatabase',
        id: place.id,
        name: place.name,
        description: cleanText(place.description)
    });
}

for (const [id, dungeon] of entries(DungeonDatabase)) {
    push(queue, {
        category: 'dungeon-zone-scenes-full',
        folder: folderMap.dungeonFull,
        kind: 'scene',
        source: 'DungeonDatabase',
        id: `dungeon_${id}`,
        name: dungeon.name || id,
        description: cleanText(dungeon.description)
    });
}

const counts = queue.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + 1;
    return acc;
}, {});

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(jsonPath, JSON.stringify({ version: 1, generatedAt: '2026-07-04', counts, assets: queue }, null, 2) + '\n', 'utf8');

const md = [
    '# Art Asset Queue',
    '',
    '更新日期：2026-07-04',
    '',
    '這份清單由 `node scripts/BuildArtQueue.mjs` 產生，作為素材、裝備、怪物與場景圖片重生的執行隊列。',
    '',
    '## Counts',
    '',
    '| Category | Count |',
    '| --- | ---: |',
    ...Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).map(([category, count]) => `| ${category} | ${count} |`),
    '',
    '## First Priority',
    '',
    '- `materials`: 先全量重生素材圖片。',
    '- `equipment` / `craftedItems`: 第二批重生掉落裝備與製作成品。',
    '- `monsters`: 依普通怪、菁英、支線 BOSS、主線 BOSS 規格分批處理。',
    '',
    '完整 prompt 與輸出路徑見 `docs/generated/art-asset-queue.json`。'
].join('\n');

fs.writeFileSync(mdPath, md + '\n', 'utf8');

console.log(JSON.stringify({ counts, json: path.relative(projectRoot, jsonPath), markdown: path.relative(projectRoot, mdPath) }, null, 2));
