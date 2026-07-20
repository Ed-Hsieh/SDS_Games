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
import { ItemDatabase } from '../data/UtilityItems.js';
import { QuestDatabase } from '../data/Quests.js';
import { RewardItemDatabase } from '../data/RewardItems.js';
import { getQuestStory } from '../data/QuestStories.js';
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
    getBlueprintDropsForMonster,
    getBlueprintDropsForRecipe
} from '../data/BlueprintDrops.js';
import {
    RecipeSeriesDatabase,
    getRecipeSeries,
    getSeriesRecipeIds
} from '../data/RecipeSeries.js';
import { resolveItemById } from '../utils/ItemResolver.js';
import {
    isRecipeBlueprintKnown,
    isRecipeSeriesKnown
} from './BlueprintManager.js';
import { storyJournalManager } from './StoryJournalManager.js';
import {
    getMonsterEcologyProfile,
    MonsterCampaignScope
} from '../data/MonsterEcology.js';

const MONSTER_FLAG_PREFIX = 'encyclopedia.monster.';
const ITEM_FLAG_PREFIX = 'encyclopedia.item.';
let revealAllForDev = false;
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
    item: '一般物品',
    equipment: '裝備資料',
    material: '素材資料',
    rewardItem: '特殊物品',
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
    item: '一般物品',
    equipment: '裝備資料',
    material: '素材資料',
    rewardItem: '特殊物品',
    casino: '賭場',
    shop: '市集'
};

const SourceTypeIcons = {
    rewardItem: '📜',
    casino: '🎰',
    shop: '🛒',
    market: '🛒'
};

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
    const attack = monster?.attack ?? 0;
    const defense = monster?.defense ?? 0;

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

function getMonsterCatalogId(monsterOrId) {
    const value = typeof monsterOrId === 'string'
        ? monsterOrId
        : monsterOrId?.id || monsterOrId?.monsterId || monsterOrId?.entryId;
    if (!value) return '';
    let catalogId = String(value).trim();
    while (/^(monster:|world:|tower:|dungeon:[^:]+:)/.test(catalogId)) {
        catalogId = catalogId.replace(/^(monster:|world:|tower:|dungeon:[^:]+:)/, '');
    }
    return catalogId;
}

function getMonsterEntryId(monsterOrId) {
    const monsterId = getMonsterCatalogId(monsterOrId);
    return monsterId ? `monster:${monsterId}` : '';
}

function getItemDropRecord(itemId, rawDrop, sourceLabel) {
    const item = resolveItemById(itemId, {
        order: ['material', 'equipment', 'bossEquipment', 'shop', 'rewardItem']
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
            order: ['equipment', 'bossEquipment', 'material', 'shop', 'rewardItem']
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

export function isMonsterKnown(monsterOrId) {
    const monsterId = getMonsterCatalogId(monsterOrId);
    return revealAllForDev || Boolean(monsterId && GameManager.getFlag(`${MONSTER_FLAG_PREFIX}${monsterId}`));
}

export function isItemKnown(itemId) {
    return revealAllForDev || Boolean(GameManager.getFlag(`${ITEM_FLAG_PREFIX}${itemId}`));
}

export function isBlueprintKnownInEncyclopedia(recipeId) {
    return revealAllForDev || isRecipeBlueprintKnown(recipeId);
}

export function isBlueprintSeriesKnownInEncyclopedia(seriesId) {
    return revealAllForDev || isRecipeSeriesKnown(seriesId);
}

export function isEncyclopediaRevealAll() {
    return revealAllForDev;
}

export function setEncyclopediaRevealAll(value) {
    revealAllForDev = Boolean(value);
    GameManager.notify('flags');
}

export function unlockAllEncyclopediaEntries() {
    revealAllForDev = true;
    const flags = {};
    for (const monster of getMonsterEntries()) {
        const monsterId = getMonsterCatalogId(monster);
        if (monsterId) flags[`${MONSTER_FLAG_PREFIX}${monsterId}`] = true;
        for (const drop of monster.itemDrops || []) {
            if (drop.id) flags[`${ITEM_FLAG_PREFIX}${drop.id}`] = true;
        }
    }

    for (const item of getItemEntries()) {
        if (item.id) flags[`${ITEM_FLAG_PREFIX}${item.id}`] = true;
    }
    GameManager.updateFlags(flags, { reason: 'encyclopedia-dev-unlock' });
}

export function markMonsterKnown(monster) {
    const monsterId = getMonsterCatalogId(monster);
    if (!monsterId) return false;
    if (GameManager.getFlag(`${MONSTER_FLAG_PREFIX}${monsterId}`)) return false;
    return GameManager.setFlag(`${MONSTER_FLAG_PREFIX}${monsterId}`, true, {
        reason: 'encyclopedia-monster'
    });
}

export function syncMonsterKnowledge() {
    const flags = GameManager.getFlagsByPrefix(MONSTER_FLAG_PREFIX);
    const updates = {};
    const removals = [];

    for (const [flag, known] of Object.entries(flags)) {
        if (!known || !flag.startsWith(MONSTER_FLAG_PREFIX)) continue;
        const storedId = flag.slice(MONSTER_FLAG_PREFIX.length);
        const monsterId = getMonsterCatalogId(storedId);
        if (!monsterId) continue;
        const canonicalFlag = `${MONSTER_FLAG_PREFIX}${monsterId}`;
        if (!flags[canonicalFlag]) {
            updates[canonicalFlag] = true;
        }
        if (canonicalFlag !== flag) {
            removals.push(flag);
        }
    }

    return GameManager.updateFlags(updates, {
        remove: removals,
        reason: 'encyclopedia-monster-migration'
    });
}

export function markItemKnown(itemId) {
    if (!itemId) return false;
    const flag = `${ITEM_FLAG_PREFIX}${itemId}`;
    if (GameManager.getFlag(flag)) return false;
    return GameManager.setFlag(flag, true, { reason: 'encyclopedia-item' });
}

export function syncOwnedItemKnowledge() {
    const character = GameManager.getCharacter?.();
    const ownedItems = [
        ...(GameManager.getInventory?.() || []).map(stack => stack?.item),
        ...(GameManager.getWarehouse?.() || []).map(stack => stack?.item),
        ...Object.values(character?.equipment || {})
    ].filter(item => item?.id);
    const flags = {};

    for (const item of ownedItems) {
        const flag = `${ITEM_FLAG_PREFIX}${item.id}`;
        if (GameManager.getFlag(flag)) continue;
        flags[flag] = true;
    }

    return GameManager.updateFlags(flags, { reason: 'encyclopedia-owned-items' });
}

export function getDiscoveryEntries() {
    return storyJournalManager.getCatalogEntries();
}

export function getMonsterEntries() {
    const candidates = [];

    for (const monster of Object.values(MonsterDatabase)) {
        const scope = getMonsterEcologyProfile(monster.id).scope;
        const belongsToFirstRun = scope === MonsterCampaignScope.FIRST_RUN;
        if (!belongsToFirstRun && !isMonsterKnown(monster.id)) continue;
        candidates.push(normalizeMonster(monster, {
            entryId: getMonsterEntryId(monster),
            sourceType: 'world',
            sourceLabel: '野外'
        }));
    }

    for (const [dungeonId, dungeon] of Object.entries(DungeonDatabase)) {
        const dungeonEntries = getDungeonMonsterEntries(dungeonId, dungeon)
            .filter(monster => {
                const scope = getMonsterEcologyProfile(monster.id).scope;
                return scope === MonsterCampaignScope.FIRST_RUN || isMonsterKnown(monster.id);
            });
        candidates.push(...dungeonEntries);
    }

    const index = new Map();
    for (const candidate of candidates) {
        const monsterId = getMonsterCatalogId(candidate);
        if (!monsterId) continue;
        const sourceLabel = candidate.sourceLabel || '未知來源';
        const itemDrops = collectMonsterItemDrops(candidate);
        const blueprintDrops = collectMonsterBlueprintDrops(candidate);
        const existing = index.get(monsterId);

        if (!existing) {
            index.set(monsterId, {
                ...candidate,
                id: monsterId,
                entryId: getMonsterEntryId(monsterId),
                sourceLabels: [sourceLabel],
                itemDrops,
                blueprintDrops
            });
            continue;
        }

        if (!existing.sourceLabels.includes(sourceLabel)) existing.sourceLabels.push(sourceLabel);
        for (const drop of itemDrops) {
            const key = `${drop.id}:${drop.sourceLabel}:${drop.chance ?? ''}`;
            if (!existing.itemDrops.some(current => `${current.id}:${current.sourceLabel}:${current.chance ?? ''}` === key)) {
                existing.itemDrops.push(drop);
            }
        }
        for (const drop of blueprintDrops) {
            const key = `${drop.recipeId || drop.seriesId || drop.id}:${drop.sourceLabel}:${drop.chance ?? ''}`;
            if (!existing.blueprintDrops.some(current => `${current.recipeId || current.seriesId || current.id}:${current.sourceLabel}:${current.chance ?? ''}` === key)) {
                existing.blueprintDrops.push(drop);
            }
        }
    }

    return [...index.values()].map(entry => ({
        ...entry,
        sourceLabel: entry.sourceLabels.join(' / '),
        known: isMonsterKnown(entry.id)
    }));
}

function findMonsterByBlueprintSource(sourceKey) {
    const [maybeDungeonId, maybeMonsterId] = String(sourceKey).split(':');
    if (maybeMonsterId) {
        const dungeon = DungeonDatabase[maybeDungeonId];
        const dungeonEntries = dungeon ? getDungeonMonsterEntries(maybeDungeonId, dungeon) : [];
        const match = dungeonEntries.find(entry => entry.id === maybeMonsterId);
        return match
            ? { name: match.name, sourceLabel: match.sourceLabel, entryId: getMonsterEntryId(match.id) }
            : { name: maybeMonsterId, sourceLabel: maybeDungeonId, entryId: getMonsterEntryId(maybeMonsterId) };
    }

    const worldMonster = MonsterDatabase[sourceKey];
    if (worldMonster) {
        return { name: worldMonster.name, sourceLabel: '野外', entryId: getMonsterEntryId(sourceKey) };
    }

    const towerMonster = TowerMonsterData[sourceKey];
    if (towerMonster) {
        return {
            name: towerMonster.name,
            sourceLabel: `無盡塔 ${towerMonster.towerFloor || '?'}F`,
            entryId: getMonsterEntryId(sourceKey)
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

const QuestNpcKeywords = [
    { pattern: /書記|學者|手札|資料|見聞/, npcId: 'town_scholar' },
    { pattern: /鍛造|鐵匠|修復|強化/, npcId: 'blacksmith' },
    { pattern: /藥師|藥水|草藥|瓶/, npcId: 'herbalist' },
    { pattern: /賭場|骰|籌碼|帳本/, npcId: 'casino_dealer' },
    { pattern: /暗巷|黑市|流浪|乞丐/, npcId: 'street_beggar' },
    { pattern: /村長|守衛|南門|村莊/, npcId: 'village_elder' }
];

function getQuestTextBlob(quest = {}) {
    const story = getQuestStory(quest);
    return [
        quest.name,
        quest.description,
        story.discovery,
        story.available,
        story.active,
        story.completed,
        story.finished,
        story.nextLead,
        quest.trigger?.reason,
        ...(quest.objectives || []).map(objective => objective.description)
    ].filter(Boolean).join(' ');
}

function getQuestNarrativeDescription(quest = {}) {
    const story = getQuestStory(quest);
    return story.finished
        || story.completed
        || story.discovery
        || quest.description
        || '';
}

function findQuestTalkTarget(quest = {}) {
    return (quest.objectives || []).find(objective => objective.type === 'talk')?.target || null;
}

function getQuestGiverId(quest = {}) {
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
                description: getQuestNarrativeDescription(quest),
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
    const exposeSourceCard = !['equipment', 'material', 'item', 'shop'].includes(sourceType);

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

    for (const [id, item] of Object.entries(ItemDatabase || {})) {
        addItemEntry(index, { ...item, id: item.id || id }, 'item');
    }

    for (const [id, item] of Object.entries(MarketItemCatalog || {})) {
        addItemEntry(index, { ...item, id: item.id || id }, 'shop');
    }

    for (const [id, item] of Object.entries(RewardItemDatabase || {})) {
        addItemEntry(index, { ...item, id: item.id || id }, 'rewardItem');
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
