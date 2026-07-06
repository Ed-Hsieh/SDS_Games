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
import { QuestDatabase, QuestRewardItems } from '../data/Quests.js';
import {
    CasinoPrizePools,
    CasinoShowcaseItems,
    CasinoSpecialItems
} from '../data/CasinoRewards.js';
import { MarketItemCatalog, MarketVendors } from '../data/MarketSupply.js';
import { getCharacterProfile } from '../data/CharacterProfiles.js';
import { getGeneratedPortraitImage } from '../data/AssetManifest.js';
import {
    getReadableCodexType,
    getReadableSourceType
} from '../data/CodexCatalogClasses.js';
import {
    BlueprintDropDatabase,
    getBlueprintDropsForMonster,
    getBlueprintDropsForRecipe
} from '../data/BlueprintDrops.js';
import {
    RecipeSeriesDatabase,
    getRecipeSeries,
    getSeriesRecipeIds
} from '../data/RecipeSeries.js';
import { resolveItemById } from '../utils/ItemResolver.js';
import { getRecipeBlueprintFlag, getRecipeSeriesFlag } from './BlueprintManager.js';

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
    shop: '市集'
};

const SourceTypeIcons = {
    questReward: '📜',
    casino: '🎰',
    shop: '🛒',
    market: '🛒'
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

function getRecipeResultRarity(recipe = {}) {
    const resultId = recipe?.result?.id || recipe?.id;
    const resolvedResult = resultId
        ? resolveItemById(resultId, {
            order: ['equipment', 'bossEquipment', 'material', 'shop', 'questReward']
        })
        : null;
    return resolvedResult?.rarity || recipe?.result?.rarity || recipe?.rarity || 'rare';
}

function getRecipeResultForCodex(recipe = {}) {
    const result = recipe?.result || {};
    return {
        ...result,
        rarity: getRecipeResultRarity(recipe)
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
        if (drop.seriesId) {
            const series = getRecipeSeries(drop.seriesId);
            return {
                id: drop.seriesId,
                seriesId: drop.seriesId,
                name: series?.name || drop.seriesId,
                icon: '📜',
                type: 'blueprint',
                rarity: series?.rarity || 'uncommon',
                chance: drop.chance,
                sourceLabel: '系列圖紙'
            };
        }

        const recipe = RecipeDatabase[drop.recipeId];
        return {
            id: drop.recipeId,
            recipeId: drop.recipeId,
            name: recipe?.name || drop.recipeId,
            icon: recipe?.icon || recipe?.result?.icon || '▧',
            type: recipe?.type || recipe?.result?.type || 'blueprint',
            rarity: getRecipeResultRarity(recipe),
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
        || Boolean(GameManager.getFlag(getRecipeBlueprintFlag(recipeId)))
        || Boolean(GameManager.getFlag(`${BLUEPRINT_FLAG_PREFIX}${recipeId}`));
}

export function isBlueprintSeriesKnownInEncyclopedia(seriesId) {
    return isEncyclopediaRevealAll()
        || Boolean(GameManager.getFlag(getRecipeSeriesFlag(seriesId)))
        || Boolean(GameManager.getFlag(`${BLUEPRINT_FLAG_PREFIX}${seriesId}`));
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
        for (const key of [
            'chance',
            'quantity',
            'sourceLabel',
            'icon',
            'image',
            'npcId',
            'npcName',
            'portrait',
            'chapter',
            'price',
            'weight',
            'rarity'
        ]) {
            if (sourceRef[key] != null) existing[key] = sourceRef[key];
        }
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
        const resultType = recipe.result?.type || recipe.type || null;
        if (resultType === 'potion') continue;
        refs.push({
            id: recipeId,
            type: 'recipe',
            label: recipe.name || recipe.result?.name || recipeId,
            resultId: recipe.result?.id || recipeId,
            resultType,
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

const QuestGiverOverrides = {
    main_001: 'village_elder',
    main_002: 'town_scholar',
    main_003: 'blacksmith'
};

const QuestNpcKeywords = [
    { pattern: /書記|學者|手札|資料|見聞/, npcId: 'town_scholar' },
    { pattern: /鍛造|鐵匠|修復|強化/, npcId: 'blacksmith' },
    { pattern: /藥師|藥水|草藥|瓶/, npcId: 'herbalist' },
    { pattern: /賭場|骰|籌碼|瑪洛|帳本/, npcId: 'malo_bookkeeper' },
    { pattern: /暗巷|黑市|流浪|乞丐/, npcId: 'street_beggar' },
    { pattern: /村長|守衛|南門|村莊/, npcId: 'village_elder' }
];

function getQuestTextBlob(quest = {}) {
    return [
        quest.name,
        quest.description,
        quest.dialogue?.start,
        quest.dialogue?.complete,
        quest.trigger?.reason,
        ...(quest.objectives || []).map(objective => objective.description)
    ].filter(Boolean).join(' ');
}

function findQuestTalkTarget(quest = {}) {
    return (quest.objectives || []).find(objective => objective.type === 'talk')?.target || null;
}

function getQuestGiverId(quest = {}) {
    if (QuestGiverOverrides[quest.id]) return QuestGiverOverrides[quest.id];
    if (quest.npc || quest.client || quest.giver || quest.npcId) {
        return quest.npc || quest.client || quest.giver || quest.npcId;
    }

    const text = getQuestTextBlob(quest);
    const keywordMatch = QuestNpcKeywords.find(entry => entry.pattern.test(text));
    if (keywordMatch) return keywordMatch.npcId;

    return findQuestTalkTarget(quest) || 'village_elder';
}

function getQuestGiverPresentation(quest = {}) {
    const npcId = getQuestGiverId(quest);
    const profile = getCharacterProfile(npcId);
    return {
        npcId,
        npcName: profile?.name || npcId || '委託人',
        portrait: profile?.portrait || getGeneratedPortraitImage(npcId) || ''
    };
}

function getReadableQuestSourceType(type) {
    const labels = {
        main: '主線任務',
        bounty: '懸賞',
        commission: '委託',
        hidden: '隱藏任務'
    };
    return labels[type] || '任務獎勵';
}

function normalizeQuestReward(reward, rewardType) {
    if (!reward) return null;
    if (typeof reward === 'string') {
        return { id: reward, quantity: 1, rewardType };
    }

    const id = reward.id || reward.itemId || reward.equipmentId || reward.materialId;
    if (!id) return null;

    return {
        id,
        quantity: reward.quantity ?? reward.count ?? 1,
        rewardType
    };
}

function collectQuestRewards(quest = {}) {
    const rewards = quest.rewards || {};
    return [
        ...(rewards.items || []).map(reward => normalizeQuestReward(reward, 'item')),
        ...(rewards.materials || []).map(reward => normalizeQuestReward(reward, 'material')),
        ...(rewards.equipment || []).map(reward => normalizeQuestReward(reward, 'equipment'))
    ].filter(Boolean);
}

function getAllQuestRecords() {
    const quests = [];
    const walk = node => {
        if (Array.isArray(node)) {
            for (const quest of node) {
                if (quest?.id && quest?.rewards) quests.push(quest);
            }
            return;
        }
        if (!node || typeof node !== 'object') return;
        for (const value of Object.values(node)) walk(value);
    };
    walk(QuestDatabase);
    return quests;
}

function collectQuestRewardSourceIndex() {
    const index = new Map();
    for (const quest of getAllQuestRecords()) {
        const rewardEntries = collectQuestRewards(quest);
        if (rewardEntries.length === 0) continue;

        const giver = getQuestGiverPresentation(quest);
        for (const reward of rewardEntries) {
            if (!index.has(reward.id)) index.set(reward.id, []);
            index.get(reward.id).push({
                id: quest.id,
                type: 'quest',
                label: quest.name || quest.id,
                sourceLabel: '任務獎勵',
                questType: quest.type || null,
                questTypeLabel: getReadableQuestSourceType(quest.type),
                chapter: quest.chapter ?? null,
                icon: quest.icon || '📜',
                description: quest.description || quest.dialogue?.complete || quest.dialogue?.start || '',
                quantity: reward.quantity,
                rewardType: reward.rewardType,
                ...giver
            });
        }
    }
    return index;
}

function addSourceIndexRef(index, itemId, sourceRef) {
    if (!itemId || !sourceRef?.id) return;
    if (!index.has(itemId)) index.set(itemId, []);
    index.get(itemId).push(sourceRef);
}

function collectRewardItems(rewards = {}, rewardType = 'item') {
    return [
        ...(rewards.items || []).map(reward => normalizeQuestReward(reward, rewardType)),
        ...(rewards.materials || []).map(reward => normalizeQuestReward(reward, 'material')),
        ...(rewards.equipment || []).map(reward => normalizeQuestReward(reward, 'equipment'))
    ].filter(Boolean);
}

function collectMarketSourceIndex() {
    const index = new Map();
    for (const vendor of MarketVendors || []) {
        const vendorIcon = vendor.icon || SourceTypeIcons.shop;
        const portrait = vendor.portrait || getGeneratedPortraitImage(vendor.id) || '';
        const vendorBase = {
            type: 'shop',
            icon: vendorIcon,
            npcId: vendor.id,
            npcName: vendor.name || vendor.id,
            portrait
        };

        for (const shelf of vendor.shelves || []) {
            addSourceIndexRef(index, shelf.itemId, {
                ...vendorBase,
                id: `market:shelf:${shelf.id || shelf.itemId}`,
                label: shelf.stock || vendor.place || vendor.name || '市集貨架',
                sourceLabel: '市集購買',
                price: shelf.price ?? null
            });
        }

        for (const order of vendor.orders || []) {
            for (const reward of collectRewardItems(order.rewards || {})) {
                addSourceIndexRef(index, reward.id, {
                    ...vendorBase,
                    id: `market:order:${order.id}`,
                    label: order.title || vendor.name || '市集訂單',
                    sourceLabel: '市集訂單',
                    quantity: reward.quantity
                });
            }
        }

        for (const exchange of vendor.exchanges || []) {
            for (const reward of collectRewardItems(exchange.rewards || {})) {
                addSourceIndexRef(index, reward.id, {
                    ...vendorBase,
                    id: `market:exchange:${exchange.id}`,
                    label: exchange.title || vendor.name || '市集交換',
                    sourceLabel: '市集交換',
                    quantity: reward.quantity
                });
            }
        }
    }
    return index;
}

function collectCasinoSourceIndex() {
    const index = new Map();

    for (const pool of Object.values(CasinoPrizePools || {})) {
        for (const reward of pool.rewards || []) {
            if (reward.kind !== 'item' || !reward.itemId) continue;
            addSourceIndexRef(index, reward.itemId, {
                id: `casino:pool:${pool.id}`,
                type: 'casino',
                label: pool.name || '賭場獎池',
                sourceLabel: '賭場獎池',
                icon: SourceTypeIcons.casino,
                quantity: reward.quantity ?? 1,
                weight: reward.weight ?? null,
                rarity: reward.rarity || 'common'
            });
        }
    }

    for (const showcase of CasinoShowcaseItems || []) {
        addSourceIndexRef(index, showcase.itemId, {
            id: `casino:showcase:${showcase.id}`,
            type: 'casino',
            label: showcase.cabinetTitle || showcase.displayTag || '賭場展示櫃',
            sourceLabel: '賭場展示櫃',
            icon: SourceTypeIcons.casino,
            rarity: showcase.rarity || 'legendary'
        });
    }

    return index;
}

function addItemEntry(index, rawItem, sourceType) {
    if (!rawItem) return;
    const id = rawItem.id;
    if (!id) return;
    if (rawItem.codexHidden || rawItem.codexCategory === 'achievement') return;
    if (rawItem.passiveEffectId) return;
    const exposeSourceCard = !['equipment', 'material', 'shop'].includes(sourceType);

    const source = {
        type: sourceType,
        label: ReadableItemSourceLabels[sourceType] || ItemSourceLabels[sourceType] || getReadableSourceType(sourceType)
    };

    const existing = index.get(id);
    if (existing) {
        if (!existing.sources.some(entry => entry.type === source.type)) {
            existing.sources.push(source);
        }
        if (exposeSourceCard) {
            addUniqueSourceRef(existing, {
                id: sourceType,
                type: sourceType,
                label: source.label,
                sourceLabel: source.label,
                icon: SourceTypeIcons[sourceType] || '◆'
            });
        }
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
    if (exposeSourceCard) {
        addUniqueSourceRef(index.get(id), {
            id: sourceType,
            type: sourceType,
            label: source.label,
            sourceLabel: source.label,
            icon: SourceTypeIcons[sourceType] || '◆'
        });
    }
}

export function getItemEntries() {
    const index = new Map();

    for (const [id, item] of Object.entries(EquipmentDatabase || {})) {
        addItemEntry(index, { ...item, id: item.id || id }, 'equipment');
    }

    for (const [id, item] of Object.entries(MaterialDatabase || {})) {
        addItemEntry(index, { ...item, id: item.id || id }, 'material');
    }

    for (const [id, item] of Object.entries(MarketItemCatalog || {})) {
        addItemEntry(index, { ...item, id: item.id || id }, 'shop');
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

    const questRewardSourceIndex = collectQuestRewardSourceIndex();
    for (const [itemId, sourceRefs] of questRewardSourceIndex.entries()) {
        const entry = index.get(itemId);
        if (!entry) continue;
        sourceRefs.forEach(sourceRef => addUniqueSourceRef(entry, sourceRef));
    }

    const marketSourceIndex = collectMarketSourceIndex();
    for (const [itemId, sourceRefs] of marketSourceIndex.entries()) {
        const entry = index.get(itemId);
        if (!entry) continue;
        sourceRefs.forEach(sourceRef => addUniqueSourceRef(entry, sourceRef));
    }

    const casinoSourceIndex = collectCasinoSourceIndex();
    for (const [itemId, sourceRefs] of casinoSourceIndex.entries()) {
        const entry = index.get(itemId);
        if (!entry) continue;
        sourceRefs.forEach(sourceRef => addUniqueSourceRef(entry, sourceRef));
    }

    return [...index.values()];
}

export function getBlueprintEntries() {
    const recipeEntries = Object.entries(RecipeDiscoveryDatabase).map(([recipeId, discovery]) => {
        const recipe = RecipeDatabase[recipeId];
        const result = getRecipeResultForCodex(recipe);
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
            rarity: getRecipeResultRarity(recipe),
            cost: recipe?.cost || 0,
            successRate: recipe?.successRate ?? null,
            result,
            materials: recipe?.materials || [],
            discovery,
            drops,
            known: isBlueprintKnownInEncyclopedia(recipeId)
        };
    });

    const seriesEntries = Object.values(RecipeSeriesDatabase).map(series => {
        const recipeIds = getSeriesRecipeIds(series.id);
        const recipes = recipeIds.map(recipeId => RecipeDatabase[recipeId]).filter(Boolean);
        const results = recipes.map(recipe => getRecipeResultForCodex(recipe));
        const seenDropKeys = new Set();
        const drops = recipeIds
            .flatMap(recipeId => getBlueprintDropsForRecipe(recipeId))
            .filter(drop => {
                const key = `${drop.sourceKey || ''}:${drop.seriesId || drop.recipeId || ''}`;
                if (seenDropKeys.has(key)) return false;
                seenDropKeys.add(key);
                return true;
            })
            .map(drop => ({
                ...drop,
                monster: findMonsterByBlueprintSource(drop.sourceKey)
            }));

        return {
            id: series.id,
            seriesId: series.id,
            recipeIds,
            name: series.name,
            icon: '📜',
            type: 'blueprint',
            rarity: series.rarity || results[0]?.rarity || 'uncommon',
            cost: 0,
            successRate: null,
            result: results[0] || {},
            results,
            materials: [],
            discovery: series.discovery,
            drops,
            known: isBlueprintSeriesKnownInEncyclopedia(series.id)
        };
    });

    return [...recipeEntries, ...seriesEntries];
}

export function unlockAllEncyclopediaEntries() {
    for (const monster of getMonsterEntries()) {
        setFlagSilently(`${MONSTER_FLAG_PREFIX}${monster.entryId}`, true);
        for (const drop of monster.itemDrops || []) setFlagSilently(`${ITEM_FLAG_PREFIX}${drop.id}`, true);
        for (const drop of monster.blueprintDrops || []) {
            setFlagSilently(`${BLUEPRINT_FLAG_PREFIX}${drop.recipeId || drop.seriesId || drop.id}`, true);
        }
    }

    for (const sourceEntries of Object.values(BlueprintDropDatabase)) {
        for (const drop of sourceEntries || []) {
            setFlagSilently(`${BLUEPRINT_FLAG_PREFIX}${drop.recipeId || drop.seriesId}`, true);
        }
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
