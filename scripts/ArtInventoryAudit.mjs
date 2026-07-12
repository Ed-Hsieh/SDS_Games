import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ChapterRegionRegistry } from '../src/js/data/ChapterRegionRegistry.js';
import { CasinoSpecialItems } from '../src/js/data/CasinoRewards.js';
import { CharacterProfileDatabase } from '../src/js/data/CharacterProfiles.js';
import { CombatEffectAssetRequirements } from '../src/js/data/CombatEffectAssetRequirements.js';
import { DungeonDatabase } from '../src/js/data/Dungeons.js';
import { EquipmentDatabase } from '../src/js/data/Equipment.js';
import { MaterialDatabase } from '../src/js/data/Materials.js';
import { MonsterDatabase } from '../src/js/data/Monsters.js';
import { QuestRewardItems } from '../src/js/data/Quests.js';
import { RecipeDatabase } from '../src/js/data/Recipes.js';
import { RecipeSeriesDatabase } from '../src/js/data/RecipeSeries.js';
import { TownPlaceDatabase } from '../src/js/data/TownPlaces.js';
import { WorldLandmarks } from '../src/js/data/WorldStories.js';
import { OverworldMapConfig } from '../src/js/data/OverworldMapRegistry.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtimeRoot = path.join(rootDir, 'src/assets/images/art');
const sourceRoot = path.join(rootDir, 'src/assets/images/art-source/originals');
const imageExtensions = new Set(['.webp', '.png', '.jpg', '.jpeg']);
const toPosix = value => value.split(path.sep).join('/');
const imageId = relativePath => path.basename(relativePath, path.extname(relativePath));

function walkFiles(directory) {
    if (!fs.existsSync(directory)) return [];
    const files = [];
    const visit = current => {
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const fullPath = path.join(current, entry.name);
            if (entry.isDirectory()) visit(fullPath);
            else if (imageExtensions.has(path.extname(entry.name).toLowerCase())) files.push(fullPath);
        }
    };
    visit(directory);
    return files.sort((left, right) => left.localeCompare(right));
}

function normalizedItemType(item = {}) {
    return String(item.type || '').trim().toLowerCase();
}

function collectNestedIds(value, ids = new Set()) {
    if (Array.isArray(value)) {
        value.forEach(entry => collectNestedIds(entry, ids));
        return ids;
    }
    if (!value || typeof value !== 'object') return ids;
    if (typeof value.id === 'string' && value.id.trim()) ids.add(value.id.trim());
    Object.values(value).forEach(entry => collectNestedIds(entry, ids));
    return ids;
}

const dungeonMonsterIds = new Set(Object.values(DungeonDatabase)
    .flatMap(dungeon => [...collectNestedIds(dungeon.monsters)]));

const active = {
    equipment: new Set(Object.keys(EquipmentDatabase).filter(id => !id.startsWith('tower_'))),
    materials: new Set(Object.keys(MaterialDatabase)),
    questItems: new Set(Object.keys(QuestRewardItems)),
    blueprints: new Set([
        ...Object.keys(RecipeDatabase),
        ...Object.keys(RecipeSeriesDatabase)
    ]),
    craftedResults: new Set(Object.values(RecipeDatabase)
        .map(recipe => String(recipe.result?.id || '').replace(/^crafted_/, ''))
        .filter(Boolean)),
    monsters: new Set([
        ...Object.keys(MonsterDatabase),
        ...dungeonMonsterIds
    ]),
    portraits: new Set(Object.keys(CharacterProfileDatabase)),
    townLocations: new Set(TownPlaceDatabase.map(place => place.id)),
    dungeons: new Set(Object.keys(DungeonDatabase).map(id => `dungeon_${id}`)),
    landmarks: new Set([
        ...Object.values(ChapterRegionRegistry)
            .flatMap(region => region.locationNodes || [])
            .map(location => location.legacyLandmarkId)
            .filter(Boolean),
        ...WorldLandmarks.map(landmark => landmark.id),
        ...OverworldMapConfig.routeGates.flatMap(gate => [gate.blockedImageId, gate.repairedImageId])
    ]),
    worldMaps: new Set(OverworldMapConfig.tiles.map(tile => tile.imageId)),
    backgrounds: new Set([
        'town-overview',
        'casino-hall',
        'casino-game-table',
        'casino-prize-wall'
    ]),
    combatEffects: new Set(CombatEffectAssetRequirements.map(requirement => requirement.id))
};

function expectedRuntimeForSource(sourceRelativePath) {
    return sourceRelativePath.replace(/\.[^.]+$/, '.webp');
}

const sourceFiles = walkFiles(sourceRoot).map(fullPath => ({
    fullPath,
    relativePath: toPosix(path.relative(sourceRoot, fullPath))
}));
const sourceBackedRuntime = new Set(sourceFiles
    .map(file => expectedRuntimeForSource(file.relativePath))
    .filter(Boolean));

function classifyRuntime(relativePath) {
    const id = imageId(relativePath);

    if (relativePath.startsWith('items/equipment/')) {
        return active.equipment.has(id) || active.craftedResults.has(id)
            ? { status: 'assigned', owner: 'equipment' }
            : { status: 'orphan', reason: 'no active equipment or crafted-result record' };
    }

    if (relativePath.startsWith('items/consumables/')) {
        return active.materials.has(id) || active.questItems.has(id) || active.craftedResults.has(id)
            ? { status: 'assigned', owner: 'consumable' }
            : { status: 'orphan', reason: 'no active consumable record' };
    }

    if (relativePath.startsWith('items/materials/')) {
        if (active.materials.has(id)) return { status: 'assigned', owner: 'material' };
        if (active.questItems.has(id)) return { status: 'assigned', owner: 'quest-material' };
        return { status: 'orphan', reason: 'no active material or quest-item record' };
    }

    if (relativePath.startsWith('items/blueprints/')) {
        return active.blueprints.has(id)
            ? { status: 'assigned', owner: 'blueprint' }
            : { status: 'orphan', reason: 'no active recipe or recipe-series record' };
    }

    if (relativePath.startsWith('items/currencies/')) {
        return active.questItems.has(id)
            ? { status: 'assigned', owner: 'currency' }
            : { status: 'orphan', reason: 'no active currency record' };
    }

    if (relativePath.startsWith('items/key-items/clues/')) {
        return active.questItems.has(id)
            ? { status: 'assigned', owner: 'story-clue' }
            : { status: 'orphan', reason: 'no active story-clue record' };
    }

    if (relativePath.startsWith('items/key-items/relics/')) {
        return active.questItems.has(id)
            ? { status: 'assigned', owner: 'story-relic' }
            : { status: 'orphan', reason: 'no active story-relic record' };
    }

    if (relativePath.startsWith('entities/monsters/')) {
        return active.monsters.has(id)
            ? { status: 'assigned', owner: 'monster' }
            : { status: 'orphan', reason: 'no active monster record' };
    }

    if (relativePath.startsWith('entities/reserve/')) {
        return { status: 'orphan', reason: 'isolated legacy monster has no current data owner' };
    }

    if (relativePath.startsWith('characters/portraits/')) {
        return active.portraits.has(id)
            ? { status: 'assigned', owner: 'active-character' }
            : { status: 'orphan', reason: 'reserve character is not in the active screenplay register' };
    }

    if (relativePath.startsWith('characters/reserve/')) {
        return { status: 'assigned', owner: 'user-kept-reserve-character' };
    }

    if (relativePath.startsWith('scenes/town/locations/')) {
        return active.townLocations.has(id)
            ? { status: 'assigned', owner: 'town-location' }
            : { status: 'orphan', reason: 'no active town-location record' };
    }

    if (relativePath.startsWith('scenes/dungeons/areas/')) {
        return active.dungeons.has(id)
            ? { status: 'assigned', owner: 'dungeon-area' }
            : { status: 'orphan', reason: 'old difficulty-zone card has no active runtime consumer' };
    }

    if (relativePath.startsWith('scenes/world/landmarks/')) {
        return active.landmarks.has(id)
            ? { status: 'assigned', owner: 'world-landmark' }
            : { status: 'orphan', reason: 'no active chapter-region landmark' };
    }

    if (relativePath.startsWith('scenes/world/maps/')) {
        return active.worldMaps.has(id)
            ? { status: 'assigned', owner: 'overworld-map' }
            : { status: 'orphan', reason: 'no active overworld tile record' };
    }

    if (relativePath.startsWith('scenes/backgrounds/')) {
        return active.backgrounds.has(id)
            ? { status: 'assigned', owner: 'screen-background' }
            : { status: 'orphan', reason: 'no active screen background record' };
    }

    if (relativePath.startsWith('effects/combat/')) {
        return active.combatEffects.has(id)
            ? { status: 'assigned', owner: 'combat-effect-requirement' }
            : { status: 'orphan', reason: 'effect id is absent from the current combat-effect requirement contract' };
    }
    if (relativePath.startsWith('ui/')) return { status: 'assigned', owner: 'ui' };
    return { status: 'orphan', reason: 'folder is outside the accepted art structure' };
}

function canonicalTarget(relativePath, classification) {
    return classification.status === 'assigned' ? relativePath : null;
}

const runtimeFiles = walkFiles(runtimeRoot).map(fullPath => {
    const relativePath = toPosix(path.relative(runtimeRoot, fullPath));
    const classification = classifyRuntime(relativePath);
    const targetPath = canonicalTarget(relativePath, classification);
    return {
        currentPath: relativePath,
        targetPath,
        sourceBacked: sourceBackedRuntime.has(relativePath),
        ...classification
    };
});

const runtimePaths = new Set(runtimeFiles.map(file => file.currentPath));
const runtimeByPath = new Map(runtimeFiles.map(file => [file.currentPath, file]));
const sourceWithoutRuntime = sourceFiles
    .map(file => ({
        sourcePath: file.relativePath,
        expectedRuntimePath: expectedRuntimeForSource(file.relativePath)
    }))
    .filter(file => file.expectedRuntimePath && !runtimePaths.has(file.expectedRuntimePath));

const sourceAssignments = sourceFiles.map(file => {
    const expectedRuntimePath = expectedRuntimeForSource(file.relativePath);
    const runtimeFile = runtimeByPath.get(expectedRuntimePath);
    const runtimeTarget = runtimeFile?.targetPath || null;
    const targetPath = runtimeTarget
        ? runtimeTarget.replace(/\.[^.]+$/, path.extname(file.relativePath).toLowerCase())
        : null;
    return {
        currentPath: file.relativePath,
        targetPath,
        runtimePath: expectedRuntimePath,
        status: targetPath ? 'assigned' : 'orphan'
    };
});

const expectedCraftedResults = Object.values(RecipeDatabase)
    .map(recipe => {
        const result = recipe.result || {};
        const id = String(result.id || '').replace(/^crafted_/, '');
        const type = normalizedItemType(result);
        const folder = ['potion', 'consumable'].includes(type) ? 'items/consumables' : 'items/equipment';
        return id ? `${folder}/${id}.webp` : null;
    })
    .filter(Boolean);

const expectedCasinoItems = Object.values(CasinoSpecialItems)
    .map(item => {
        const id = String(item.id || '').trim();
        const type = normalizedItemType(item);
        if (!id) return null;
        if (type === 'currency') return `items/currencies/${id}.webp`;
        if (['key', 'quest'].includes(type)) return `items/key-items/clues/${id}.webp`;
        if (['potion', 'consumable'].includes(type)) return `items/consumables/${id}.webp`;
        if (type === 'material') return `items/materials/${id}.webp`;
        return `items/equipment/${id}.webp`;
    })
    .filter(Boolean);

const canonicalExistingTargets = new Set(runtimeFiles.map(file => file.targetPath).filter(Boolean));
const pendingCombatEffects = CombatEffectAssetRequirements
    .filter(requirement => !canonicalExistingTargets.has(requirement.targetPath))
    .map(requirement => ({ ...requirement }));
const missingActiveDestinations = [
    ...expectedCraftedResults.filter(target => !canonicalExistingTargets.has(target)),
    ...expectedCasinoItems.filter(target => !canonicalExistingTargets.has(target)),
    ...[...active.townLocations]
        .map(id => `scenes/town/locations/${id}.webp`)
        .filter(target => !canonicalExistingTargets.has(target))
].sort();

function scanLiteralReferences() {
    const roots = ['combat-vfx-lab.html', 'src'];
    const allowedExtensions = new Set(['.js', '.html', '.css']);
    const files = [];
    for (const root of roots) {
        const fullPath = path.join(rootDir, root);
        if (!fs.existsSync(fullPath)) continue;
        if (fs.statSync(fullPath).isFile()) files.push(fullPath);
        else {
            const visit = directory => {
                for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
                    const entryPath = path.join(directory, entry.name);
                    if (entry.isDirectory()) {
                        if (!entryPath.startsWith(path.join(rootDir, 'src/assets/images'))) visit(entryPath);
                    } else if (allowedExtensions.has(path.extname(entry.name).toLowerCase())) files.push(entryPath);
                }
            };
            visit(fullPath);
        }
    }

    const pattern = /\/?src\/assets\/images\/art\/[A-Za-z0-9_./${}-]+\.(?:webp|png|jpg|jpeg)/g;
    const references = new Map();
    for (const filePath of files) {
        const contents = fs.readFileSync(filePath, 'utf8');
        for (const match of contents.matchAll(pattern)) {
            if (match[0].includes('${')) continue;
            const assetPath = match[0].replace(/^\//, '');
            if (!references.has(assetPath)) references.set(assetPath, []);
            references.get(assetPath).push(toPosix(path.relative(rootDir, filePath)));
        }
    }
    return [...references.entries()]
        .filter(([assetPath]) => !fs.existsSync(path.join(rootDir, assetPath)))
        .map(([assetPath, owners]) => ({ assetPath, owners: [...new Set(owners)].sort() }))
        .sort((left, right) => left.assetPath.localeCompare(right.assetPath));
}

const assigned = runtimeFiles.filter(file => file.status === 'assigned');
const orphans = runtimeFiles.filter(file => file.status === 'orphan');
const relocations = assigned.filter(file => file.currentPath !== file.targetPath);
const activeWithoutSource = assigned.filter(file => !file.sourceBacked);
const sourceRelocations = sourceAssignments.filter(file => file.targetPath && file.currentPath !== file.targetPath);
const missingLiteralReferences = scanLiteralReferences();

const report = {
    summary: {
        runtimeImages: runtimeFiles.length,
        sourceOriginals: sourceFiles.length,
        sourceRelocationRequired: sourceRelocations.length,
        sourceBackedRuntime: runtimeFiles.filter(file => file.sourceBacked).length,
        assigned: assigned.length,
        canonicalAlready: assigned.length - relocations.length,
        relocationRequired: relocations.length,
        activeWithoutSource: activeWithoutSource.length,
        orphans: orphans.length,
        sourceWithoutRuntime: sourceWithoutRuntime.length,
        missingActiveDestinations: missingActiveDestinations.length,
        missingLiteralReferences: missingLiteralReferences.length,
        missingCurrentTotal: missingActiveDestinations.length + missingLiteralReferences.length,
        pendingCombatEffects: pendingCombatEffects.length,
        pendingCombatEffectsCurrent: pendingCombatEffects.filter(effect => effect.scope === 'current_runtime').length,
        pendingCombatEffectsPaused: pendingCombatEffects.filter(effect => effect.scope === 'paused_external').length
    },
    targetStructure: [
        'characters/portraits/',
        'characters/reserve/',
        'entities/monsters/',
        'entities/reserve/',
        'items/equipment/',
        'items/currencies/',
        'items/consumables/',
        'items/materials/',
        'items/blueprints/',
        'items/key-items/clues/',
        'items/key-items/relics/',
        'scenes/backgrounds/',
        'scenes/town/locations/',
        'scenes/world/landmarks/',
        'scenes/world/maps/',
        'scenes/dungeons/areas/',
        'effects/combat/',
        'ui/'
    ],
    orphans,
    relocations,
    activeWithoutSource,
    sourceWithoutRuntime,
    sourceAssignments,
    sourceRelocations,
    pendingCombatEffects,
    missingActiveDestinations,
    missingLiteralReferences,
    assignments: assigned
};

if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
} else {
    console.log(JSON.stringify({
        summary: report.summary,
        targetStructure: report.targetStructure,
        orphanPaths: report.orphans.map(file => file.currentPath),
        relocationPaths: report.relocations.map(file => `${file.currentPath} -> ${file.targetPath}`),
        pendingCombatEffectCounts: {
            total: report.summary.pendingCombatEffects,
            currentRuntime: report.summary.pendingCombatEffectsCurrent,
            pausedExternal: report.summary.pendingCombatEffectsPaused
        },
        missingActiveDestinations: report.missingActiveDestinations,
        missingLiteralReferences: report.missingLiteralReferences
    }, null, 2));
}

if (orphans.length || sourceWithoutRuntime.length || missingActiveDestinations.length || missingLiteralReferences.length) {
    process.exitCode = 1;
}
