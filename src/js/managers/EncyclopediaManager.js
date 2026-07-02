/**
 * EncyclopediaManager.js
 * Read-only data composition and discovery flags for the encyclopedia scene.
 */

import GameManager from './GameManager.js';
import { MonsterDatabase, TowerMonsterData, MonsterType } from '../data/Monsters.js';
import { DungeonDatabase } from '../data/Dungeons.js';
import { MonsterUniqueDrops } from '../data/DropPools.js';
import { RecipeDatabase } from '../data/Recipes.js';
import { RecipeDiscoveryDatabase } from '../data/RecipeDiscoveries.js';
import { EquipmentDatabase } from '../data/Equipment.js';
import { MaterialDatabase } from '../data/Materials.js';
import { QuestRewardItems } from '../data/Quests.js';
import { CasinoSpecialItems } from '../data/CasinoRewards.js';
import {
    getReadableCodexType,
    getReadableSourceType
} from '../data/CodexCatalogClasses.js';
import {
    BlueprintDropDatabase,
    getBlueprintDropsForMonster,
    getBlueprintDropsForRecipe
} from '../data/BlueprintDrops.js';
import { resolveItemById } from '../utils/ItemResolver.js';
import { isRecipeBlueprintKnown } from './BlueprintManager.js';

const REVEAL_ALL_FLAG = 'encyclopedia.revealAll';
const MONSTER_FLAG_PREFIX = 'encyclopedia.monster.';
const ITEM_FLAG_PREFIX = 'encyclopedia.item.';
const BLUEPRINT_FLAG_PREFIX = 'encyclopedia.blueprint.';
const MonsterRankRarity = {
    normal: 'common',
    elite: 'rare',
    boss: 'epic',
    world_boss: 'legendary'
};

const TypeLabels = {
    normal: '普通',
    elite: '菁英',
    boss: 'BOSS',
    world_boss: '世界 BOSS',
    weapon: '武器',
    armor: '防具',
    equipment: '防具',
    accessory: '飾品',
    potion: '消耗品',
    material: '素材',
    key: '關鍵道具'
};

const ItemSourceLabels = {
    equipment: '裝備資料',
    material: '素材資料',
    questReward: '任務獎勵',
    casino: '賭場獎池'
};

const ElementLabels = {
    none: '無',
    fire: '火',
    ice: '冰',
    thunder: '雷',
    earth: '地',
    shadow: '暗',
    holy: '聖'
};

const ReadableItemSourceLabels = {
    equipment: '裝備資料',
    material: '素材資料',
    questReward: '任務獎勵',
    casino: '賭場',
    shop: '商店'
};

function setFlagSilently(flag, value) {
    GameManager.state.flags[flag] = value;
}

function notifyFlags() {
    GameManager.notify('flags');
}

function getMonsterRank(monster, fallback = 'normal') {
    if (monster?.type) return monster.type;
    return fallback;
}

function getMonsterRarity(monster, fallback = 'normal') {
    return MonsterRankRarity[getMonsterRank(monster, fallback)] || MonsterRankRarity[fallback] || 'common';
}

function normalizeMonster(monster, options = {}) {
    const rank = getMonsterRank(monster, options.rank || 'normal');
    const hp = monster?.maxHp ?? monster?.hp ?? 0;
    const attack = monster?.attack ?? monster?.atk ?? 0;
    const defense = monster?.defense ?? monster?.def ?? 0;

    return {
        ...monster,
        entryId: options.entryId,
        sourceType: options.sourceType,
        sourceLabel: options.sourceLabel,
        dungeonId: options.dungeonId || null,
        towerFloor: options.towerFloor || monster?.towerFloor || null,
        rank,
        rarity: MonsterRankRarity[rank] || getMonsterRarity(monster, rank),
        level: monster?.level ?? options.level ?? null,
        hp,
        maxHp: hp,
        attack,
        defense,
        attackSpeed: monster?.attackSpeed ?? monster?.attack_speed ?? 1.5,
        exp: monster?.exp || 0,
        gold: monster?.gold || 0,
        element: monster?.element || 'none',
        skills: monster?.skills || []
    };
}

function getDungeonMonsterEntries(dungeonId, dungeon) {
    const entries = [];
    const baseLevel = dungeon.recommendLevel || dungeon.difficulty || 1;
    const groups = [
        { key: 'common', rank: MonsterType.NORMAL, levelOffset: 0 },
        { key: 'elite', rank: MonsterType.ELITE, levelOffset: 1 }
    ];

    for (const group of groups) {
        for (const monster of dungeon.monsters?.[group.key] || []) {
            entries.push(normalizeMonster(monster, {
                entryId: `dungeon:${dungeonId}:${monster.id}`,
                sourceType: 'dungeon',
                sourceLabel: dungeon.name,
                dungeonId,
                rank: group.rank,
                level: baseLevel + group.levelOffset
            }));
        }
    }

    if (dungeon.monsters?.boss) {
        const monster = dungeon.monsters.boss;
        entries.push(normalizeMonster(monster, {
            entryId: `dungeon:${dungeonId}:${monster.id}`,
            sourceType: 'dungeon',
            sourceLabel: dungeon.name,
            dungeonId,
            rank: MonsterType.BOSS,
            level: baseLevel + 2
        }));
    }

    return entries;
}

function getSourceKeyForMonster(monster, context = {}) {
    const monsterId = monster?.id || context.monsterId;
    if (!monsterId) return null;
    if (context.dungeonId) return `dungeon:${context.dungeonId}:${monsterId}`;
    if (context.towerFloor || monster?.towerFloor) return `tower:${monsterId}`;
    return `world:${monsterId}`;
}

function getItemDropRecord(itemId, rawDrop, sourceLabel) {
    const item = resolveItemById(itemId, {
        order: ['material', 'equipment', 'bossEquipment', 'shop', 'questReward']
    });
    const rarity = item?.rarity || 'common';

    return {
        id: itemId,
        name: item?.name || itemId,
        icon: item?.icon || '◆',
        type: item?.type || 'material',
        rarity,
        chance: rawDrop?.chance ?? null,
        quantity: rawDrop?.quantity ?? [1, 1],
        sourceLabel
    };
}

function collectMonsterItemDrops(monster) {
    const drops = [];

    for (const drop of monster?.drops || []) {
        drops.push(getItemDropRecord(drop.itemId, drop, '怪物掉落'));
    }

    for (const drop of monster?.equipmentDrops || []) {
        drops.push(getItemDropRecord(drop.equipmentId, drop, '裝備掉落'));
    }

    for (const drop of MonsterUniqueDrops[monster?.id] || []) {
        drops.push(getItemDropRecord(drop.id, drop, '特殊掉落'));
    }

    return drops;
}

function collectMonsterBlueprintDrops(monster) {
    return getBlueprintDropsForMonster(monster?.id, {
        dungeonId: monster?.dungeonId || null
    }).map(drop => {
        const recipe = RecipeDatabase[drop.recipeId];
        return {
            id: drop.recipeId,
            recipeId: drop.recipeId,
            name: recipe?.name || drop.recipeId,
            icon: recipe?.icon || recipe?.result?.icon || '▧',
            type: recipe?.type || recipe?.result?.type || 'blueprint',
            rarity: recipe?.rarity || recipe?.result?.rarity || 'rare',
            chance: drop.chance,
            sourceLabel: '圖紙掉落'
        };
    });
}

export function isEncyclopediaRevealAll() {
    return GameManager.getFlag(REVEAL_ALL_FLAG) !== false;
}

export function setEncyclopediaRevealAll(value) {
    GameManager.setFlag(REVEAL_ALL_FLAG, Boolean(value));
}

export function isMonsterKnown(entryId) {
    return isEncyclopediaRevealAll() || Boolean(GameManager.getFlag(`${MONSTER_FLAG_PREFIX}${entryId}`));
}

export function isItemKnown(itemId) {
    return isEncyclopediaRevealAll() || Boolean(GameManager.getFlag(`${ITEM_FLAG_PREFIX}${itemId}`));
}

export function isBlueprintKnownInEncyclopedia(recipeId) {
    return isEncyclopediaRevealAll()
        || isRecipeBlueprintKnown(recipeId)
        || Boolean(GameManager.getFlag(`${BLUEPRINT_FLAG_PREFIX}${recipeId}`));
}

export function markMonsterKnown(monster, context = {}) {
    const sourceKey = getSourceKeyForMonster(monster, context);
    if (!sourceKey) return;
    setFlagSilently(`${MONSTER_FLAG_PREFIX}${sourceKey}`, true);
    notifyFlags();
}

export function markItemKnown(itemId) {
    if (!itemId) return;
    setFlagSilently(`${ITEM_FLAG_PREFIX}${itemId}`, true);
    notifyFlags();
}

export function markBlueprintKnown(recipeId) {
    if (!recipeId) return;
    setFlagSilently(`${BLUEPRINT_FLAG_PREFIX}${recipeId}`, true);
    notifyFlags();
}

export function getMonsterEntries() {
    const entries = [];

    for (const monster of Object.values(MonsterDatabase)) {
        entries.push(normalizeMonster(monster, {
            entryId: `world:${monster.id}`,
            sourceType: 'world',
            sourceLabel: '野外'
        }));
    }

    for (const [dungeonId, dungeon] of Object.entries(DungeonDatabase)) {
        entries.push(...getDungeonMonsterEntries(dungeonId, dungeon));
    }

    for (const monster of Object.values(TowerMonsterData)) {
        entries.push(normalizeMonster(monster, {
            entryId: `tower:${monster.id}`,
            sourceType: 'tower',
            sourceLabel: `無盡塔 ${monster.towerFloor || '?'}F`,
            towerFloor: monster.towerFloor || null
        }));
    }

    return entries.map(entry => ({
        ...entry,
        known: isMonsterKnown(entry.entryId),
        itemDrops: collectMonsterItemDrops(entry),
        blueprintDrops: collectMonsterBlueprintDrops(entry)
    }));
}

function findMonsterByBlueprintSource(sourceKey) {
    const [maybeDungeonId, maybeMonsterId] = String(sourceKey).split(':');
    if (maybeMonsterId) {
        const dungeon = DungeonDatabase[maybeDungeonId];
        const dungeonEntries = dungeon ? getDungeonMonsterEntries(maybeDungeonId, dungeon) : [];
        const match = dungeonEntries.find(entry => entry.id === maybeMonsterId);
        return match
            ? { name: match.name, sourceLabel: match.sourceLabel, entryId: match.entryId }
            : { name: maybeMonsterId, sourceLabel: maybeDungeonId, entryId: `dungeon:${sourceKey}` };
    }

    const worldMonster = MonsterDatabase[sourceKey];
    if (worldMonster) {
        return { name: worldMonster.name, sourceLabel: '野外', entryId: `world:${sourceKey}` };
    }

    const towerMonster = TowerMonsterData[sourceKey];
    if (towerMonster) {
        return {
            name: towerMonster.name,
            sourceLabel: `無盡塔 ${towerMonster.towerFloor || '?'}F`,
            entryId: `tower:${sourceKey}`
        };
    }

    return { name: sourceKey, sourceLabel: '未知來源', entryId: sourceKey };
}

function addUniqueSourceRef(entry, sourceRef) {
    if (!entry || !sourceRef?.id) return;
    if (!Array.isArray(entry.sourceRefs)) entry.sourceRefs = [];
    const existing = entry.sourceRefs.find(source => source.id === sourceRef.id && source.type === sourceRef.type);
    if (existing) {
        if (sourceRef.chance != null) existing.chance = sourceRef.chance;
        if (sourceRef.quantity != null) existing.quantity = sourceRef.quantity;
        return;
    }
    entry.sourceRefs.push(sourceRef);
}

function addUniqueUsageRef(entry, usageRef) {
    if (!entry || !usageRef?.id) return;
    if (!Array.isArray(entry.usageRefs)) entry.usageRefs = [];
    if (entry.usageRefs.some(usage => usage.id === usageRef.id && usage.type === usageRef.type)) return;
    entry.usageRefs.push(usageRef);
}

function collectRecipeUsageRefs(itemId) {
    const refs = [];
    for (const [recipeId, recipe] of Object.entries(RecipeDatabase || {})) {
        const used = (recipe.materials || []).some(material => material.id === itemId);
        if (!used) continue;
        refs.push({
            id: recipeId,
            type: 'recipe',
            label: recipe.name || recipe.result?.name || recipeId,
            resultId: recipe.result?.id || recipeId,
            resultType: recipe.result?.type || recipe.type || null,
            result: recipe.result || null
        });
    }
    return refs;
}

function collectItemDropSourceIndex() {
    const index = new Map();
    for (const monster of getMonsterEntries()) {
        for (const drop of monster.itemDrops || []) {
            const id = drop.id;
            if (!id) continue;
            if (!index.has(id)) index.set(id, []);
            index.get(id).push({
                id: monster.entryId,
                type: 'monster',
                label: monster.name || monster.id,
                sourceLabel: monster.sourceLabel,
                icon: monster.icon,
                image: monster.image,
                rarity: monster.rarity,
                rank: monster.rank,
                level: monster.level ?? null,
                chance: drop.chance ?? null,
                quantity: drop.quantity ?? null
            });
        }
    }
    return index;
}

function addItemEntry(index, rawItem, sourceType) {
    if (!rawItem) return;
    const id = rawItem.id;
    if (!id) return;
    if (rawItem.codexHidden || rawItem.codexCategory === 'achievement') return;
    if (rawItem.passiveEffectId) return;

    const source = {
        type: sourceType,
        label: ReadableItemSourceLabels[sourceType] || ItemSourceLabels[sourceType] || getReadableSourceType(sourceType)
    };

    const existing = index.get(id);
    if (existing) {
        if (!existing.sources.some(entry => entry.type === source.type)) {
            existing.sources.push(source);
        }
        addUniqueSourceRef(existing, {
            id: sourceType,
            type: sourceType,
            label: source.label
        });
        if (sourceType === 'casino') {
            existing.item = { ...rawItem };
            existing.sourceType = sourceType;
            existing.sourceLabel = source.label;
        }
        return;
    }

    const item = { ...rawItem, id };
    index.set(id, {
        id,
        entryId: `item:${id}`,
        item,
        name: item.name || id,
        icon: item.icon || '◆',
        type: item.type || 'material',
        rarity: item.rarity || 'common',
        level: item.level ?? null,
        price: item.price ?? null,
        description: item.description || item.desc || '',
        stats: item.stats || {},
        specialEffects: item.specialEffects || [],
        sourceRefs: [],
        usageRefs: collectRecipeUsageRefs(id),
        sourceType,
        sourceLabel: source.label,
        sources: [source],
        known: isItemKnown(id)
    });
    addUniqueSourceRef(index.get(id), {
        id: sourceType,
        type: sourceType,
        label: source.label
    });
}

export function getItemEntries() {
    const index = new Map();

    for (const [id, item] of Object.entries(EquipmentDatabase || {})) {
        addItemEntry(index, { ...item, id: item.id || id }, 'equipment');
    }

    for (const [id, item] of Object.entries(MaterialDatabase || {})) {
        addItemEntry(index, { ...item, id: item.id || id }, 'material');
    }

    for (const [id, item] of Object.entries(QuestRewardItems || {})) {
        addItemEntry(index, { ...item, id: item.id || id }, 'questReward');
    }

    for (const [id, item] of Object.entries(CasinoSpecialItems || {})) {
        addItemEntry(index, { ...item, id: item.id || id }, 'casino');
    }

    const dropSourceIndex = collectItemDropSourceIndex();
    for (const [itemId, sourceRefs] of dropSourceIndex.entries()) {
        const entry = index.get(itemId);
        if (!entry) continue;
        sourceRefs.forEach(sourceRef => addUniqueSourceRef(entry, sourceRef));
    }

    return [...index.values()];
}

export function getBlueprintEntries() {
    return Object.entries(RecipeDiscoveryDatabase).map(([recipeId, discovery]) => {
        const recipe = RecipeDatabase[recipeId];
        const drops = getBlueprintDropsForRecipe(recipeId).map(drop => ({
            ...drop,
            monster: findMonsterByBlueprintSource(drop.sourceKey)
        }));

        return {
            id: recipeId,
            recipeId,
            name: recipe?.name || recipeId,
            icon: recipe?.icon || recipe?.result?.icon || '▧',
            type: recipe?.type || recipe?.result?.type || 'blueprint',
            rarity: recipe?.rarity || recipe?.result?.rarity || 'rare',
            cost: recipe?.cost || 0,
            successRate: recipe?.successRate ?? null,
            result: recipe?.result || null,
            materials: recipe?.materials || [],
            discovery,
            drops,
            known: isBlueprintKnownInEncyclopedia(recipeId)
        };
    });
}

export function unlockAllEncyclopediaEntries() {
    for (const monster of getMonsterEntries()) {
        setFlagSilently(`${MONSTER_FLAG_PREFIX}${monster.entryId}`, true);
        for (const drop of monster.itemDrops || []) setFlagSilently(`${ITEM_FLAG_PREFIX}${drop.id}`, true);
        for (const drop of monster.blueprintDrops || []) setFlagSilently(`${BLUEPRINT_FLAG_PREFIX}${drop.recipeId}`, true);
    }

    for (const sourceEntries of Object.values(BlueprintDropDatabase)) {
        for (const drop of sourceEntries || []) setFlagSilently(`${BLUEPRINT_FLAG_PREFIX}${drop.recipeId}`, true);
    }

    for (const recipeId of Object.keys(RecipeDiscoveryDatabase)) {
        setFlagSilently(`${BLUEPRINT_FLAG_PREFIX}${recipeId}`, true);
    }

    for (const item of getItemEntries()) {
        setFlagSilently(`${ITEM_FLAG_PREFIX}${item.id}`, true);
    }

    notifyFlags();
}

export function getReadableType(type) {
    return TypeLabels[type] || getReadableCodexType(type) || type || '未知';
}

export function getReadableElement(element) {
    return ElementLabels[element] || element || '無';
}

export function formatChance(chance) {
    if (chance == null) return '-';
    const percent = Number(chance) * 100;
    if (!Number.isFinite(percent)) return '-';
    return `${percent >= 10 ? percent.toFixed(0) : percent.toFixed(1).replace(/\.0$/, '')}%`;
}

export function formatQuantity(quantity) {
    if (Array.isArray(quantity)) {
        const [min, max] = quantity;
        return min === max ? String(min) : `${min}-${max}`;
    }
    return quantity == null ? '1' : String(quantity);
}
