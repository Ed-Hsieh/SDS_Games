import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { EquipmentDatabase } from '../src/js/data/Equipment.js';
import { MaterialDatabase } from '../src/js/data/Materials.js';
import { MonsterDatabase, TowerMonsterData } from '../src/js/data/Monsters.js';
import { RecipeDatabase } from '../src/js/data/Recipes.js';
import { TownPlaceDatabase } from '../src/js/data/TownPlaces.js';
import { MarketItemCatalog, MarketSceneAssets, MarketVendors } from '../src/js/data/MarketSupply.js';
import { CasinoSpecialItems } from '../src/js/data/CasinoRewards.js';
import { DungeonDatabase } from '../src/js/data/Dungeons.js';
import {
    getGeneratedBackgroundImage,
    getGeneratedDungeonImage,
    getGeneratedItemImage,
    getGeneratedMonsterImage,
    getGeneratedPortraitImage,
    getGeneratedTownPlaceImage
} from '../src/js/data/AssetManifest.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const report = {
    counts: {},
    missingMappings: [],
    missingFiles: [],
    dimensionWarnings: []
};

function entries(object) {
    return Object.entries(object || {});
}

function addCount(key) {
    report.counts[key] = (report.counts[key] || 0) + 1;
}

function toFsPath(assetPath) {
    return path.resolve(rootDir, String(assetPath || '').replace(/^\/+/, ''));
}

function readPngDimensions(filePath) {
    const buffer = fs.readFileSync(filePath);
    const pngSignature = '89504e470d0a1a0a';
    if (buffer.length < 24 || buffer.subarray(0, 8).toString('hex') !== pngSignature) {
        return null;
    }
    return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20)
    };
}

function readWebpDimensions(filePath) {
    const buffer = fs.readFileSync(filePath);
    if (
        buffer.length < 30
        || buffer.subarray(0, 4).toString('ascii') !== 'RIFF'
        || buffer.subarray(8, 12).toString('ascii') !== 'WEBP'
    ) {
        return null;
    }

    const chunk = buffer.subarray(12, 16).toString('ascii');
    if (chunk === 'VP8X' && buffer.length >= 30) {
        return {
            width: 1 + buffer.readUIntLE(24, 3),
            height: 1 + buffer.readUIntLE(27, 3)
        };
    }

    if (chunk === 'VP8L' && buffer.length >= 25) {
        const b0 = buffer[21];
        const b1 = buffer[22];
        const b2 = buffer[23];
        const b3 = buffer[24];
        return {
            width: 1 + (b0 | ((b1 & 0x3f) << 8)),
            height: 1 + (((b1 & 0xc0) >> 6) | (b2 << 2) | ((b3 & 0x0f) << 10))
        };
    }

    if (chunk === 'VP8 ' && buffer.length >= 30) {
        const dataStart = 20;
        if (
            buffer[dataStart + 3] === 0x9d
            && buffer[dataStart + 4] === 0x01
            && buffer[dataStart + 5] === 0x2a
        ) {
            return {
                width: buffer.readUInt16LE(dataStart + 6) & 0x3fff,
                height: buffer.readUInt16LE(dataStart + 8) & 0x3fff
            };
        }
    }

    return null;
}

function readImageDimensions(assetPath) {
    const filePath = toFsPath(assetPath);
    const extension = path.extname(filePath).toLowerCase();
    if (extension === '.png') {
        return readPngDimensions(filePath);
    }
    if (extension === '.webp') {
        return readWebpDimensions(filePath);
    }
    return null;
}

function checkDimensions(scope, id, assetPath, options = {}) {
    const dimensions = readImageDimensions(assetPath);
    if (!dimensions) return;

    const { width, height } = dimensions;
    if (options.square) {
        const ratio = width / Math.max(1, height);
        const tolerance = options.squareTolerance || 0.12;
        if (ratio < 1 - tolerance || ratio > 1 + tolerance) {
            report.dimensionWarnings.push({ scope, id, path: assetPath, width, height, expected: 'square' });
        }
    }

    if (options.minWidth && width < options.minWidth) {
        report.dimensionWarnings.push({ scope, id, path: assetPath, width, height, expected: `width >= ${options.minWidth}` });
    }
    if (options.minHeight && height < options.minHeight) {
        report.dimensionWarnings.push({ scope, id, path: assetPath, width, height, expected: `height >= ${options.minHeight}` });
    }
}

function checkAsset(scope, id, assetPath, options = {}) {
    addCount(scope);
    const required = options.required !== false;
    if (!assetPath) {
        if (required) report.missingMappings.push({ scope, id });
        return;
    }
    if (!fs.existsSync(toFsPath(assetPath))) {
        report.missingFiles.push({ scope, id, path: assetPath });
        return;
    }
    checkDimensions(scope, id, assetPath, options);
}

for (const [id, item] of entries(EquipmentDatabase)) {
    checkAsset('equipment', id, getGeneratedItemImage({ ...item, id: item.id || id }), { square: true, minWidth: 96, minHeight: 96 });
}

for (const [id, item] of entries(MaterialDatabase)) {
    checkAsset('material', id, getGeneratedItemImage({ ...item, id: item.id || id }), { square: true, minWidth: 96, minHeight: 96 });
}

for (const [id, recipe] of entries(RecipeDatabase)) {
    checkAsset('blueprint', id, getGeneratedItemImage({ id, name: recipe.name, type: 'blueprint' }, { blueprint: true }), { square: true, minWidth: 96, minHeight: 96 });
    if (recipe.result?.id) {
        checkAsset(
            'crafted-result',
            recipe.result.id,
            getGeneratedItemImage({ ...recipe.result, id: recipe.result.id }),
            { square: true, minWidth: 96, minHeight: 96 }
        );
    }
}

for (const [id, item] of entries(MarketItemCatalog)) {
    checkAsset('market-item', id, getGeneratedItemImage({ ...item, id: item.id || id }), { square: true, minWidth: 96, minHeight: 96 });
}

for (const [id, item] of entries(CasinoSpecialItems)) {
    checkAsset('casino-special-item', id, getGeneratedItemImage({ ...item, id: item.id || id }), { square: true, minWidth: 96, minHeight: 96 });
}

for (const [id, monster] of entries(MonsterDatabase)) {
    checkAsset('monster', id, monster.image || getGeneratedMonsterImage(monster.id || id), { square: true, minWidth: 96, minHeight: 96 });
}

for (const [id, monster] of entries(TowerMonsterData)) {
    checkAsset('tower-monster', id, monster.image || getGeneratedMonsterImage(monster.id || id), { minWidth: 96, minHeight: 96 });
}

for (const place of TownPlaceDatabase || []) {
    checkAsset('town-place', place.id, place.sceneImage || getGeneratedTownPlaceImage(place.id), {
        square: !place.sceneImage,
        minWidth: place.sceneImage ? 1024 : 256,
        minHeight: place.sceneImage ? 576 : 256
    });
    for (const resident of place.residents || []) {
        checkAsset('town-resident', resident.npcId || resident.label, resident.portrait || getGeneratedPortraitImage(resident.npcId), { square: true, minWidth: 256, minHeight: 256 });
    }
}

for (const vendor of MarketVendors || []) {
    checkAsset('market-vendor', vendor.id, vendor.portrait || getGeneratedPortraitImage(vendor.id), { square: true, minWidth: 256, minHeight: 256 });
}

for (const [id, dungeon] of entries(DungeonDatabase)) {
    checkAsset('dungeon', id, dungeon.image || getGeneratedDungeonImage(id), { minWidth: 480, minHeight: 300 });
}

checkAsset('background', 'town-overview', getGeneratedBackgroundImage('town-overview'), { minWidth: 1024, minHeight: 640 });
checkAsset('background', 'adventure-world-map', getGeneratedBackgroundImage('adventure-world-map'), { minWidth: 1024, minHeight: 640 });
checkAsset('background', 'casino-hall', getGeneratedBackgroundImage('casino-hall'), { minWidth: 1024, minHeight: 640 });
checkAsset('background', 'casino-game-table', getGeneratedBackgroundImage('casino-game-table'), { minWidth: 1024, minHeight: 640 });
checkAsset('background', 'casino-prize-wall', getGeneratedBackgroundImage('casino-prize-wall'), { minWidth: 1024, minHeight: 640 });
checkAsset('market-background', 'market', MarketSceneAssets.background, { square: true, minWidth: 256, minHeight: 256 });

console.log(JSON.stringify(report, null, 2));

if (report.missingMappings.length || report.missingFiles.length) {
    process.exitCode = 1;
}
