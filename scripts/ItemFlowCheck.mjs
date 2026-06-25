import { RecipeDatabase } from '../src/js/data/Recipes.js';
import { MaterialDatabase } from '../src/js/data/Materials.js';
import { MonsterDatabase, TowerMonsterData } from '../src/js/data/Monsters.js';
import { ZoneDropPools, DungeonDropPools, MonsterUniqueDrops } from '../src/js/data/DropPools.js';
import { QuestDatabase, ObjectiveType } from '../src/js/data/Quests.js';
import { DungeonDatabase } from '../src/js/data/Dungeons.js';
import { resolveItemRecord } from '../src/js/utils/ItemResolver.js';

const DIRECT_PURPOSE_TYPES = new Set([
    'weapon',
    'armor',
    'equipment',
    'accessory',
    'potion',
    'scroll',
    'key',
    'currency',
    'book',
    'quest'
]);

function add(map, id, source) {
    if (!id) return;
    if (!map.has(id)) map.set(id, []);
    map.get(id).push(source);
}

function values(object) {
    return Object.values(object || {});
}

function entries(object) {
    return Object.entries(object || {});
}

function unique(items) {
    return [...new Set(items)];
}

function allQuests() {
    return values(QuestDatabase).flatMap(group => Array.isArray(group) ? group : []);
}

const obtainSources = new Map();
const dropSources = new Map();
const recipeUses = new Map();
const questCollectUses = new Map();
const dungeonUses = new Map();

function trackMonsterDrops(monsters, label) {
    for (const monster of values(monsters)) {
        for (const drop of monster.drops || []) {
            add(obtainSources, drop.itemId, `${label}.${monster.id}.drops`);
            add(dropSources, drop.itemId, `${label}.${monster.id}.drops`);
        }

        for (const drop of monster.equipmentDrops || []) {
            add(obtainSources, drop.equipmentId, `${label}.${monster.id}.equipmentDrops`);
            add(dropSources, drop.equipmentId, `${label}.${monster.id}.equipmentDrops`);
        }
    }
}

trackMonsterDrops(MonsterDatabase, 'MonsterDatabase');
trackMonsterDrops(TowerMonsterData, 'TowerMonsterData');

for (const [poolId, pool] of entries(ZoneDropPools)) {
    for (const item of pool.items || []) {
        add(obtainSources, item.id, `ZoneDropPools.${poolId}`);
        add(dropSources, item.id, `ZoneDropPools.${poolId}`);
    }
}

for (const [poolId, pool] of entries(DungeonDropPools)) {
    for (const item of pool.items || []) {
        add(obtainSources, item.id, `DungeonDropPools.${poolId}`);
        add(dropSources, item.id, `DungeonDropPools.${poolId}`);
    }
    for (const item of pool.guaranteed || []) {
        add(obtainSources, item.id, `DungeonDropPools.${poolId}.guaranteed`);
        add(dropSources, item.id, `DungeonDropPools.${poolId}.guaranteed`);
    }
}

for (const [monsterId, list] of entries(MonsterUniqueDrops)) {
    for (const item of list || []) {
        add(obtainSources, item.id, `MonsterUniqueDrops.${monsterId}`);
        add(dropSources, item.id, `MonsterUniqueDrops.${monsterId}`);
    }
}

for (const [recipeId, recipe] of entries(RecipeDatabase)) {
    for (const material of recipe.materials || []) {
        add(recipeUses, material.id, recipeId);
    }

    if (recipe.result?.id) add(obtainSources, recipe.result.id, `Recipe.${recipeId}.result`);
}

for (const quest of allQuests()) {
    for (const objective of quest.objectives || []) {
        if (objective.type === ObjectiveType.COLLECT || objective.type === 'collect') {
            add(questCollectUses, objective.target, quest.id);
        }
        if (objective.type === ObjectiveType.CRAFT || objective.type === 'craft') {
            add(dungeonUses, objective.target, `${quest.id}.craftObjective`);
        }
    }

    for (const itemId of quest.rewards?.items || []) {
        add(obtainSources, itemId, `Quest.${quest.id}.rewards.items`);
    }

    for (const entry of quest.rewards?.materials || []) {
        add(obtainSources, entry.id, `Quest.${quest.id}.rewards.materials`);
    }
}

for (const [dungeonId, dungeon] of entries(DungeonDatabase)) {
    for (const itemId of [dungeon.mechanic?.counterItem, dungeon.mechanic?.alternativeCounter]) {
        if (itemId) add(dungeonUses, itemId, `Dungeon.${dungeonId}.counterItem`);
    }

    if (dungeon.treasures?.guaranteed?.id) {
        add(obtainSources, dungeon.treasures.guaranteed.id, `Dungeon.${dungeonId}.treasure.guaranteed`);
    }

    for (const item of dungeon.treasures?.random || []) {
        add(obtainSources, item.id, `Dungeon.${dungeonId}.treasure.random`);
    }
}

const craftMaterialIds = unique(values(RecipeDatabase).flatMap(recipe => (recipe.materials || []).map(material => material.id)));
const dropIds = unique([...dropSources.keys()]);
const rewardItemIds = unique(allQuests().flatMap(quest => quest.rewards?.items || []));
const collectTargetIds = unique([...questCollectUses.keys()]);

function hasNonQuestSource(itemId) {
    return (obtainSources.get(itemId) || []).some(source => !source.startsWith('Quest.'));
}

function hasAnySource(itemId) {
    return (obtainSources.get(itemId) || []).length > 0;
}

function hasDirectPurpose(itemId) {
    const resolved = resolveItemRecord(itemId, { preferBossEquipment: true });
    const type = String(resolved?.item?.type || '').toLowerCase();
    return DIRECT_PURPOSE_TYPES.has(type);
}

const critical = {
    craftMaterialsWithoutDefinition: craftMaterialIds.filter(itemId => !resolveItemRecord(itemId, { preferBossEquipment: true })),
    craftMaterialsWithoutSource: craftMaterialIds.filter(itemId => !hasNonQuestSource(itemId)),
    collectTargetsWithoutDefinition: collectTargetIds.filter(itemId => !resolveItemRecord(itemId, { preferBossEquipment: true })),
    collectTargetsWithoutSource: collectTargetIds.filter(itemId => !hasNonQuestSource(itemId)),
    rewardItemsWithoutDefinition: rewardItemIds.filter(itemId => !resolveItemRecord(itemId, { preferBossEquipment: true })),
    dropsWithoutDefinition: dropIds.filter(itemId => !resolveItemRecord(itemId, { preferBossEquipment: true }))
};

const warnings = {
    droppedMaterialsWithoutCurrentUse: dropIds.filter(itemId => {
        const material = MaterialDatabase[itemId];
        if (!material) return false;
        if (hasDirectPurpose(itemId)) return false;
        return !recipeUses.has(itemId)
            && !questCollectUses.has(itemId)
            && !dungeonUses.has(itemId)
            && !(material.craftUse || []).length;
    }),
    declaredMaterialsWithoutSource: Object.keys(MaterialDatabase).filter(itemId => !hasAnySource(itemId)),
    declaredMaterialsWithoutCurrentUse: Object.keys(MaterialDatabase).filter(itemId => {
        const material = MaterialDatabase[itemId];
        if (hasDirectPurpose(itemId)) return false;
        return !recipeUses.has(itemId)
            && !questCollectUses.has(itemId)
            && !dungeonUses.has(itemId)
            && !(material.craftUse || []).length;
    })
};

const criticalCount = Object.values(critical).reduce((sum, list) => sum + list.length, 0);
const warningCount = unique(Object.values(warnings).flat()).length;

const report = {
    counts: {
        recipes: Object.keys(RecipeDatabase).length,
        craftMaterials: craftMaterialIds.length,
        droppedIds: dropIds.length,
        questRewardItems: rewardItemIds.length,
        questCollectTargets: collectTargetIds.length
    },
    critical,
    warnings
};

console.log(JSON.stringify(report, null, 2));

if (criticalCount > 0) {
    console.error(`Item flow check failed with ${criticalCount} critical issue(s).`);
    process.exit(1);
}

if (warningCount > 0) {
    console.warn(`Item flow check passed with ${warningCount} design warning(s).`);
}
