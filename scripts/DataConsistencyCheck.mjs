import { EquipmentDatabase, SetDatabase } from '../src/js/data/Equipment.js';
import { MaterialDatabase } from '../src/js/data/Materials.js';
import { MonsterDatabase, TowerMonsterData } from '../src/js/data/Monsters.js';
import { QuestDatabase, QuestRewardItems } from '../src/js/data/Quests.js';
import { RecipeDatabase } from '../src/js/data/Recipes.js';
import { RecipeDiscoveryDatabase } from '../src/js/data/RecipeDiscoveries.js';
import { BlueprintDropDatabase } from '../src/js/data/BlueprintDrops.js';
import { getRecipeSeries, getSeriesRecipeIds } from '../src/js/data/RecipeSeries.js';
import { ZoneDropPools, DungeonDropPools, MonsterUniqueDrops } from '../src/js/data/DropPools.js';
import { DungeonDatabase, DungeonEntranceConfig } from '../src/js/data/Dungeons.js';
import { ShopData, SecretShopItems } from '../src/js/data/Items.js';
import { TowerBossEquipment } from '../src/js/data/BossEquipment.js';
import { ItemRarity, ItemType } from '../src/js/models/Enums.js';
import { normalizeItemType, normalizeRarity } from '../src/js/models/ItemSchema.js';

const objectValues = Object.values;
const objectEntries = Object.entries;
const validItemTypes = new Set(Object.values(ItemType));
const validRarities = new Set(Object.values(ItemRarity));

function addIfPresent(set, id) {
    if (id) set.add(id);
}

function label(scope, id) {
    return `${scope}: ${id}`;
}

function collectKnownItemIds() {
    const ids = new Set();

    for (const id of Object.keys(MaterialDatabase)) addIfPresent(ids, id);
    for (const [key, item] of objectEntries(EquipmentDatabase)) {
        addIfPresent(ids, key);
        addIfPresent(ids, item.id);
    }
    for (const [key, item] of objectEntries(QuestRewardItems)) {
        addIfPresent(ids, key);
        addIfPresent(ids, item.id);
    }
    for (const [key, item] of objectEntries(TowerBossEquipment)) {
        addIfPresent(ids, key);
        addIfPresent(ids, item.id);
    }
    for (const shop of objectValues(ShopData)) {
        for (const item of shop.items || []) addIfPresent(ids, item.id);
    }
    for (const item of SecretShopItems || []) addIfPresent(ids, item.id);
    for (const recipe of objectValues(RecipeDatabase)) addIfPresent(ids, recipe.result?.id);
    for (const dungeon of objectValues(DungeonDatabase)) {
        addIfPresent(ids, dungeon.treasures?.guaranteed?.id);
        for (const item of dungeon.treasures?.random || []) addIfPresent(ids, item.id);
    }

    return ids;
}

function collectMonsterIds() {
    const ids = new Set();

    for (const [key, monster] of objectEntries(MonsterDatabase)) {
        addIfPresent(ids, key);
        addIfPresent(ids, monster.id);
    }
    for (const [key, monster] of objectEntries(TowerMonsterData)) {
        addIfPresent(ids, key);
        addIfPresent(ids, monster.id);
    }
    for (const dungeon of objectValues(DungeonDatabase)) {
        for (const monster of dungeon.monsters?.common || []) addIfPresent(ids, monster.id);
        for (const monster of dungeon.monsters?.elite || []) addIfPresent(ids, monster.id);
        addIfPresent(ids, dungeon.monsters?.boss?.id);
    }

    return ids;
}

function collectDungeonMonsterIdsByDungeon() {
    const byDungeon = new Map();

    for (const [dungeonId, dungeon] of objectEntries(DungeonDatabase)) {
        const ids = new Set();
        for (const monster of dungeon.monsters?.common || []) addIfPresent(ids, monster.id);
        for (const monster of dungeon.monsters?.elite || []) addIfPresent(ids, monster.id);
        addIfPresent(ids, dungeon.monsters?.boss?.id);
        byDungeon.set(dungeonId, ids);
    }

    return byDungeon;
}

function collectEquipmentIds() {
    const ids = new Set();

    for (const [key, item] of objectEntries(EquipmentDatabase)) {
        addIfPresent(ids, key);
        addIfPresent(ids, item.id);
    }
    for (const [key, item] of objectEntries(TowerBossEquipment)) {
        addIfPresent(ids, key);
        addIfPresent(ids, item.id);
    }

    return ids;
}

const knownItems = collectKnownItemIds();
const knownEquipment = collectEquipmentIds();
const knownMonsters = collectMonsterIds();
const dungeonMonsterIdsByDungeon = collectDungeonMonsterIdsByDungeon();
const problems = [];

function push(section, message) {
    problems.push({ section, message });
}

function checkMonsterDrops(scope, monster) {
    for (const drop of monster.drops || []) {
        if (!knownItems.has(drop.itemId)) push('drop-item', label(scope, drop.itemId));
    }
    for (const drop of monster.equipmentDrops || []) {
        if (!knownEquipment.has(drop.equipmentId)) push('drop-equipment', label(scope, drop.equipmentId));
    }
}

function checkDatabaseKeys(scope, database) {
    for (const [key, value] of objectEntries(database)) {
        if (value?.id && key !== value.id) push('database-key', `${scope}.${key} has id ${value.id}`);
    }
}

function checkItemShape(scope, item) {
    if (!item) return;

    if (Object.prototype.hasOwnProperty.call(item, 'ItemRarity')) {
        push('item-rarity-alias', `${scope} uses ItemRarity; use rarity instead`);
    }

    const type = normalizeItemType(item.type);
    if (item.type !== undefined && !validItemTypes.has(type)) {
        push('item-type', `${scope} has invalid type ${item.type}`);
    }

    const rarity = normalizeRarity(item, null);
    if (rarity && !validRarities.has(rarity)) {
        push('item-rarity', `${scope} has invalid rarity ${rarity}`);
    }

    if (item.stats) {
        if (Object.prototype.hasOwnProperty.call(item.stats, 'atk')) {
            push('item-stat-alias', `${scope}.stats uses atk; use attack instead`);
        }
        if (Object.prototype.hasOwnProperty.call(item.stats, 'def')) {
            push('item-stat-alias', `${scope}.stats uses def; use defense instead`);
        }
    }
}

function checkDungeonMonsterShape(scope, monster) {
    if (!monster) return;

    if (Object.prototype.hasOwnProperty.call(monster, 'atk')) {
        push('monster-stat-alias', `${scope} uses atk; use attack instead`);
    }
    if (Object.prototype.hasOwnProperty.call(monster, 'def')) {
        push('monster-stat-alias', `${scope} uses def; use defense instead`);
    }
    if (monster.attack === undefined) {
        push('monster-stat', `${scope} missing attack`);
    }
    if (monster.defense === undefined) {
        push('monster-stat', `${scope} missing defense`);
    }
}

checkDatabaseKeys('MaterialDatabase', MaterialDatabase);
checkDatabaseKeys('EquipmentDatabase', EquipmentDatabase);
checkDatabaseKeys('MonsterDatabase', MonsterDatabase);
checkDatabaseKeys('TowerMonsterData', TowerMonsterData);
checkDatabaseKeys('QuestRewardItems', QuestRewardItems);

for (const [id, item] of objectEntries(MaterialDatabase)) checkItemShape(`MaterialDatabase.${id}`, item);
for (const [id, item] of objectEntries(EquipmentDatabase)) checkItemShape(`EquipmentDatabase.${id}`, item);
for (const [id, item] of objectEntries(QuestRewardItems)) checkItemShape(`QuestRewardItems.${id}`, item);
for (const [id, item] of objectEntries(TowerBossEquipment)) checkItemShape(`TowerBossEquipment.${id}`, item);
for (const [shopId, shop] of objectEntries(ShopData)) {
    for (const item of shop.items || []) checkItemShape(`ShopData.${shopId}.${item.id}`, item);
}
for (const item of SecretShopItems || []) checkItemShape(`SecretShopItems.${item.id}`, item);
for (const [id, recipe] of objectEntries(RecipeDatabase)) {
    checkItemShape(`RecipeDatabase.${id}`, recipe);
    checkItemShape(`RecipeDatabase.${id}.result`, recipe.result);
}
for (const [dungeonId, dungeon] of objectEntries(DungeonDatabase)) {
    for (const [index, monster] of (dungeon.monsters?.common || []).entries()) {
        checkDungeonMonsterShape(`DungeonDatabase.${dungeonId}.monsters.common[${index}]`, monster);
    }
    for (const [index, monster] of (dungeon.monsters?.elite || []).entries()) {
        checkDungeonMonsterShape(`DungeonDatabase.${dungeonId}.monsters.elite[${index}]`, monster);
    }
    checkDungeonMonsterShape(`DungeonDatabase.${dungeonId}.monsters.boss`, dungeon.monsters?.boss);
    checkItemShape(`DungeonDatabase.${dungeonId}.treasures.guaranteed`, dungeon.treasures?.guaranteed);
    for (const [index, item] of (dungeon.treasures?.random || []).entries()) {
        checkItemShape(`DungeonDatabase.${dungeonId}.treasures.random[${index}]`, item);
    }
}

for (const [id, monster] of objectEntries(MonsterDatabase)) checkMonsterDrops(`Monster.${id}`, monster);
for (const [id, monster] of objectEntries(TowerMonsterData)) checkMonsterDrops(`TowerMonster.${id}`, monster);

function checkPool(scope, pool) {
    const entries = [
        ...(pool?.items || []),
        ...(pool?.common || []),
        ...(pool?.uncommon || []),
        ...(pool?.rare || []),
        ...(pool?.epic || []),
        ...(pool?.legendary || []),
        ...(pool?.guaranteed || [])
    ];

    for (const entry of entries) {
        const id = entry.id || entry.itemId || entry.equipmentId;
        if (id && !knownItems.has(id)) push('drop-pool', label(scope, id));
    }
}

for (const [id, pool] of objectEntries(ZoneDropPools)) checkPool(`ZonePool.${id}`, pool);
for (const [id, pool] of objectEntries(DungeonDropPools)) checkPool(`DungeonPool.${id}`, pool);
for (const [id, pool] of objectEntries(MonsterUniqueDrops)) checkPool(`UniqueDrop.${id}`, pool);

for (const [id, recipe] of objectEntries(RecipeDatabase)) {
    for (const material of recipe.materials || []) {
        if (!MaterialDatabase[material.id]) push('recipe-material', label(id, material.id));
    }
}

const knownRecipeIds = new Set(Object.keys(RecipeDatabase));
const blueprintDropRecipeIds = new Set();
const directDropInteractionIds = new Set(['monster_blueprint_drop', 'strong_blueprint_drop']);

for (const [sourceKey, entries] of objectEntries(BlueprintDropDatabase)) {
    if (!Array.isArray(entries) || entries.length === 0) {
        push('blueprint-drop-source', `${sourceKey} has no drop entries`);
        continue;
    }

    const sourceParts = sourceKey.split(':');
    const dungeonId = sourceParts.length === 2 ? sourceParts[0] : null;
    const monsterId = sourceParts.length === 2 ? sourceParts[1] : sourceParts[0];

    if (sourceParts.length > 2 || !monsterId) {
        push('blueprint-drop-source', `${sourceKey} is not monsterId or dungeonId:monsterId`);
    } else if (dungeonId) {
        const dungeonMonsterIds = dungeonMonsterIdsByDungeon.get(dungeonId);
        if (!dungeonMonsterIds) {
            push('blueprint-drop-source', `${sourceKey} references missing dungeon ${dungeonId}`);
        } else if (!dungeonMonsterIds.has(monsterId)) {
            push('blueprint-drop-source', `${sourceKey} references missing dungeon monster ${monsterId}`);
        }
    } else if (!knownMonsters.has(monsterId)) {
        push('blueprint-drop-source', `${sourceKey} references missing monster ${monsterId}`);
    }

    entries.forEach((entry, index) => {
        const referencedRecipeIds = entry.seriesId
            ? getSeriesRecipeIds(entry.seriesId)
            : [entry.recipeId].filter(Boolean);

        if (!entry.recipeId && !entry.seriesId) {
            push('blueprint-drop-recipe', `${sourceKey}[${index}] has no recipeId or seriesId`);
        }

        if (entry.seriesId && !getRecipeSeries(entry.seriesId)) {
            push('blueprint-drop-series', `${sourceKey}[${index}] references missing series ${entry.seriesId}`);
        }

        if (entry.seriesId && referencedRecipeIds.length === 0) {
            push('blueprint-drop-series', `${sourceKey}[${index}] series ${entry.seriesId} has no recipes`);
        }

        for (const recipeId of referencedRecipeIds) {
            if (!knownRecipeIds.has(recipeId)) {
                push('blueprint-drop-recipe', `${sourceKey}[${index}] references missing recipe ${recipeId}`);
            }
            blueprintDropRecipeIds.add(recipeId);
        }

        if (!Number.isFinite(entry.chance) || entry.chance <= 0 || entry.chance > 1) {
            push('blueprint-drop-chance', `${sourceKey}[${index}] has invalid chance ${entry.chance}`);
        }
    });
}

for (const [recipeId, discovery] of objectEntries(RecipeDiscoveryDatabase)) {
    if (directDropInteractionIds.has(discovery.interactionId) && !blueprintDropRecipeIds.has(recipeId)) {
        push('blueprint-drop-coverage', `${recipeId} uses ${discovery.interactionId} but has no direct monster drop`);
    }
}

const quests = objectValues(QuestDatabase).flat();
const questIds = new Set(quests.map(quest => quest.id));
const wildcardQuestTargets = new Set(['any', 'low', 'medium', 'high', 'boss', 'low_monster', 'medium_monster', 'high_monster']);

for (const quest of quests) {
    for (const itemId of quest.rewards?.items || []) {
        if (!knownItems.has(itemId)) push('quest-item', label(quest.id, itemId));
    }
    for (const material of quest.rewards?.materials || []) {
        if (!MaterialDatabase[material.id]) push('quest-material', label(quest.id, material.id));
    }
    for (const questId of quest.unlocks || []) {
        if (!questIds.has(questId)) push('quest-unlock', label(quest.id, questId));
    }
    for (const objective of quest.objectives || []) {
        if (objective.type !== 'kill' && objective.type !== 'collect') continue;

        const isKnownTarget =
            wildcardQuestTargets.has(objective.target) ||
            knownMonsters.has(objective.target) ||
            knownItems.has(objective.target);

        if (!isKnownTarget) push('quest-target', label(quest.id, `${objective.type}:${objective.target}`));
    }
}

for (const [setId, set] of objectEntries(SetDatabase)) {
    for (const pieceId of set.pieces || []) {
        if (!knownEquipment.has(pieceId)) push('set-piece', label(setId, pieceId));
    }
}

for (const [equipmentId, equipment] of objectEntries(EquipmentDatabase)) {
    if (equipment.setId && !SetDatabase[equipment.setId]) {
        push('equipment-set', label(equipmentId, equipment.setId));
        continue;
    }

    if (equipment.setId) {
        const pieces = SetDatabase[equipment.setId].pieces || [];
        if (!pieces.includes(equipmentId) && !pieces.includes(equipment.id)) {
            push('equipment-set-piece', `${equipmentId} points to ${equipment.setId} but is not listed in that set`);
        }
    }
}

for (const dungeonId of Object.keys(DungeonDatabase)) {
    if (!DungeonEntranceConfig[dungeonId]) push('dungeon-entrance', label(dungeonId, 'missing entrance'));
}
for (const entranceId of Object.keys(DungeonEntranceConfig)) {
    if (!DungeonDatabase[entranceId]) push('dungeon-entrance', label(entranceId, 'missing dungeon'));
}

if (problems.length === 0) {
    console.log('Data consistency check passed.');
} else {
    console.error(`Data consistency check found ${problems.length} issue(s):`);
    for (const problem of problems) console.error(`- [${problem.section}] ${problem.message}`);
    process.exitCode = 1;
}
