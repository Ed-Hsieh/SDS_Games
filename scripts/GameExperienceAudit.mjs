import { QuestDatabase } from '../src/js/data/Quests.js';
import { getQuestStory } from '../src/js/data/QuestStories.js';
import { EventDatabase, EventRole, isEventAllowedInChapter } from '../src/js/data/Events.js';
import { DungeonDatabase } from '../src/js/data/Dungeons.js';
import { getCasinoPrizePools, resolveCasinoRewardItem } from '../src/js/data/CasinoRewards.js';
import { MarketVendors } from '../src/js/data/MarketSupply.js';
import { getCharacterProfile } from '../src/js/data/CharacterProfiles.js';
import { getEquipmentPowerBudget } from '../src/js/data/EquipmentBalance.js';

const issues = [];
const warnings = [];
const summary = {};

const CASINO_POOL_POWER_LIMITS = {
    1: { common: 14, uncommon: 22, rare: 32, epic: 42, legendary: 52 },
    2: { common: 24, uncommon: 42, rare: 64, epic: 88, legendary: 98 },
    3: { common: 36, uncommon: 60, rare: 92, epic: 128, legendary: 165 }
};

function hasText(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function addIssue(message, details = {}) {
    issues.push({ message, ...details });
}

function addWarning(message, details = {}) {
    warnings.push({ message, ...details });
}

function isEquipmentReward(item) {
    const type = String(item?.type || '').toLowerCase();
    return Boolean(item && (
        item.stats
        || item.attack !== undefined
        || item.defense !== undefined
        || ['weapon', 'equipment', 'armor', 'accessory'].includes(type)
    ));
}

function getCasinoPowerLimit(poolChapter, rarity) {
    const chapter = Math.max(1, Math.min(3, Number(poolChapter) || 1));
    return CASINO_POOL_POWER_LIMITS[chapter]?.[rarity] || null;
}

function flattenQuestGroups() {
    return Object.entries(QuestDatabase)
        .flatMap(([group, quests]) => Array.isArray(quests)
            ? quests.map(quest => ({ ...quest, _group: group }))
            : []);
}

function auditMainStory() {
    const main = Array.isArray(QuestDatabase.main) ? QuestDatabase.main : [];
    const chapterCounts = main.reduce((acc, quest) => {
        const chapter = Number(quest.chapter) || 0;
        acc[chapter] = (acc[chapter] || 0) + 1;
        return acc;
    }, {});

    const expectedCounts = { 1: 6, 2: 5, 3: 4 };
    for (const [chapter, expected] of Object.entries(expectedCounts)) {
        if ((chapterCounts[chapter] || 0) !== expected) {
            addIssue('主線章節段數與目前三章正史不一致', {
                chapter: Number(chapter),
                expected,
                actual: chapterCounts[chapter] || 0
            });
        }
    }

    for (let index = 0; index < main.length; index += 1) {
        const quest = main[index];
        const story = getQuestStory(quest, { status: 'active' }) || {};
        const requiredStoryFields = ['discovery', 'current', 'active', 'completed', 'finished', 'nextLead', 'route'];

        for (const field of requiredStoryFields) {
            if (!hasText(story[field])) {
                addIssue('主線缺少故事欄位', { questId: quest.id, field });
            }
        }

        if (!story.reportTo?.npcId) {
            addIssue('主線缺少回報 NPC', { questId: quest.id });
        }

        if (!Array.isArray(quest.objectives) || quest.objectives.length === 0) {
            addIssue('主線缺少可驗收目標', { questId: quest.id });
        }

        const nextQuest = main[index + 1];
        if (nextQuest && !(quest.unlocks || []).includes(nextQuest.id)) {
            addIssue('主線解鎖鏈斷裂', { questId: quest.id, expectedNext: nextQuest.id });
        }
    }

    const chapterRewardAverages = Object.entries(chapterCounts).reduce((acc, [chapter]) => {
        const quests = main.filter(quest => Number(quest.chapter) === Number(chapter));
        const exp = quests.reduce((total, quest) => total + Number(quest.rewards?.exp || 0), 0) / Math.max(1, quests.length);
        const gold = quests.reduce((total, quest) => total + Number(quest.rewards?.gold || 0), 0) / Math.max(1, quests.length);
        acc[chapter] = { exp: Math.round(exp), gold: Math.round(gold) };
        return acc;
    }, {});

    if ((chapterRewardAverages[2]?.exp || 0) <= (chapterRewardAverages[1]?.exp || 0)) {
        addWarning('第二章主線平均經驗沒有明顯高於第一章', { chapterRewardAverages });
    }
    if ((chapterRewardAverages[3]?.exp || 0) <= (chapterRewardAverages[2]?.exp || 0)) {
        addWarning('第三章主線平均經驗沒有明顯高於第二章', { chapterRewardAverages });
    }

    summary.mainStory = {
        total: main.length,
        chapterCounts,
        chapterRewardAverages
    };
}

function auditSideStories() {
    const sideQuests = flattenQuestGroups().filter(quest => ['commission', 'hidden'].includes(quest._group));
    const byChapter = sideQuests.reduce((acc, quest) => {
        const chapter = Number(quest.chapter || quest.unlockConditions?.chapter || 1);
        acc[chapter] = (acc[chapter] || 0) + 1;
        return acc;
    }, {});

    for (const quest of sideQuests) {
        const story = getQuestStory(quest, { status: 'active' }) || {};
        if (!hasText(story.current) || !hasText(story.completed)) {
            addIssue('支線缺少基本敘事狀態', { questId: quest.id, group: quest._group });
        }
        if (quest._group === 'commission' && !story.reportTo?.npcId && !quest.reportTo) {
            addWarning('委託沒有明確回報人', { questId: quest.id });
        }
        if (typeof story.characterProfile === 'string' && story.characterProfile && !getCharacterProfile(story.characterProfile)) {
            addWarning('支線綁定的角色設定不存在', { questId: quest.id, characterProfile: story.characterProfile });
        }
    }

    if ((byChapter[2] || 0) < (byChapter[1] || 0)) {
        addWarning('第二章支線量少於第一章，可能不足以承接世界擴張', { byChapter });
    }
    if ((byChapter[3] || 0) < Math.ceil((byChapter[2] || 0) * 0.65)) {
        addWarning('第三章支線量偏薄，可能不足以支撐終局前鋪墊', { byChapter });
    }

    summary.sideStories = {
        total: sideQuests.length,
        byChapter
    };
}

function auditWorldEvents() {
    const expectedRoles = Object.values(EventRole);
    const chapterZoneMatrix = {
        1: ['low'],
        2: ['low', 'medium', 'high'],
        3: ['medium', 'high', 'death', 'boss']
    };
    const coverage = {};

    for (const [chapter, zones] of Object.entries(chapterZoneMatrix)) {
        coverage[chapter] = {};
        for (const zone of zones) {
            const events = EventDatabase.filter(event => {
                const zones = Array.isArray(event.zones) ? event.zones : [];
                return isEventAllowedInChapter(event, Number(chapter))
                    && (zones.length === 0 || zones.includes(zone));
            });
            const roles = [...new Set(events.map(event => event.eventRole).filter(Boolean))];
            coverage[chapter][zone] = { count: events.length, roles };

            if (events.length < 4) {
                addWarning('區域事件池偏少，探索時可能容易重複', { chapter: Number(chapter), zone, count: events.length });
            }
            if (roles.length < 3) {
                addWarning('區域事件角色太集中，事件期待感可能不足', { chapter: Number(chapter), zone, roles });
            }
        }
    }

    const allRoles = [...new Set(Object.values(coverage).flatMap(zones => Object.values(zones).flatMap(entry => entry.roles)))];
    const missingRoles = expectedRoles.filter(role => !allRoles.includes(role));
    if (missingRoles.length > 0) {
        addIssue('地圖事件缺少必要事件分類', { missingRoles });
    }

    summary.worldEvents = {
        roles: allRoles,
        coverage
    };
}

function auditDungeons() {
    const dungeons = Object.values(DungeonDatabase);
    const mechanicTypes = new Set();
    const dungeonSummary = [];

    for (const dungeon of dungeons) {
        const challenge = dungeon.challenge || {};
        const requiredChallengeFields = ['playstyle', 'riskBrief', 'rewardBrief', 'preparation', 'bossWarning', 'completion'];
        for (const field of requiredChallengeFields) {
            const value = challenge[field];
            const ok = Array.isArray(value) ? value.length > 0 : hasText(value);
            if (!ok) {
                addIssue('副本缺少挑戰前資訊', { dungeonId: dungeon.id, field });
            }
        }

        const mechanicType = dungeon.mechanic?.type;
        if (!hasText(mechanicType)) {
            addIssue('副本缺少獨特玩法類型', { dungeonId: dungeon.id });
        } else if (mechanicTypes.has(mechanicType)) {
            addIssue('副本玩法類型重複', { dungeonId: dungeon.id, mechanicType });
        } else {
            mechanicTypes.add(mechanicType);
        }

        if ((dungeon.environment?.events || []).length < 3) {
            addWarning('副本環境事件偏少', { dungeonId: dungeon.id, count: dungeon.environment?.events?.length || 0 });
        }
        if (!dungeon.treasures?.guaranteed?.id) {
            addIssue('副本缺少保底獎勵', { dungeonId: dungeon.id });
        }
        const mechanicUnlock = dungeon.story?.mechanicUnlock;
        const hasMechanicUnlock = hasText(mechanicUnlock)
            || (mechanicUnlock && typeof mechanicUnlock === 'object' && hasText(mechanicUnlock.description));
        if (!hasText(dungeon.story?.rewardFocus) || !hasMechanicUnlock) {
            addIssue('副本故事缺少獎勵定位或解鎖定位', { dungeonId: dungeon.id });
        }

        dungeonSummary.push({
            id: dungeon.id,
            mechanicType,
            events: dungeon.environment?.events?.length || 0,
            rewardFocus: dungeon.story?.rewardFocus || ''
        });
    }

    summary.dungeons = dungeonSummary;
}

function auditCasino() {
    const pools = getCasinoPrizePools();
    if (pools.length < 3) {
        addIssue('賭場獎池不足，章節定位會顯得單薄', { count: pools.length });
    }

    const sortedByChapter = [...pools].sort((a, b) => (a.minChapter || 1) - (b.minChapter || 1));
    for (let index = 1; index < sortedByChapter.length; index += 1) {
        if (Number(sortedByChapter[index].cost || 0) <= Number(sortedByChapter[index - 1].cost || 0)) {
            addWarning('賭場獎池費用沒有隨章節提高', {
                previous: sortedByChapter[index - 1].id,
                current: sortedByChapter[index].id
            });
        }
    }

    for (const pool of pools) {
        if (!hasText(pool.description) || !hasText(pool.atmosphere)) {
            addWarning('賭場獎池缺少氛圍或用途描述', { poolId: pool.id });
        }
        if (pool.pityAfter || pool.pityMinRarity) {
            addIssue('賭場獎池仍保留保底規則，與純隨機設計不一致', { poolId: pool.id });
        }
        if (!Array.isArray(pool.rewards) || pool.rewards.length < 6) {
            addWarning('賭場獎池獎項偏少，抽獎期待感可能不足', { poolId: pool.id });
        }

        const totalWeight = (pool.rewards || [])
            .reduce((sum, reward) => sum + Math.max(0, Number(reward.weight) || 0), 0);
        if (totalWeight <= 0) {
            addIssue('賭場獎池缺少可公開換算的機率權重', { poolId: pool.id });
        }

        for (const reward of pool.rewards || []) {
            const rewardItem = reward.kind === 'item' ? resolveCasinoRewardItem(reward.itemId) : null;
            if (!Number.isFinite(Number(reward.weight)) || Number(reward.weight) <= 0) {
                addIssue('賭場獎項缺少正權重，無法公開機率', { poolId: pool.id, rewardId: reward.id });
            }
            if (reward.kind === 'item' && !rewardItem) {
                addIssue('賭場獎池指向不存在的道具', { poolId: pool.id, rewardId: reward.id, itemId: reward.itemId });
            }
            if (isEquipmentReward(rewardItem)) {
                const powerBudget = getEquipmentPowerBudget(rewardItem);
                const powerLimit = getCasinoPowerLimit(pool.minChapter, reward.rarity);
                if (powerLimit !== null && powerBudget.score > powerLimit) {
                    addIssue('賭場裝備獎勵超出章節強度曲線', {
                        poolId: pool.id,
                        rewardId: reward.id,
                        itemId: reward.itemId,
                        chapter: pool.minChapter || 1,
                        rarity: reward.rarity,
                        score: powerBudget.score,
                        limit: powerLimit
                    });
                }
            }
        }
    }

    summary.casino = pools.map(pool => ({
        id: pool.id,
        chapter: pool.minChapter || 1,
        cost: pool.cost,
        rewards: pool.rewards?.length || 0
    }));
}

function auditMarket() {
    if (MarketVendors.length < 5) {
        addWarning('市集可互動角色偏少', { count: MarketVendors.length });
    }

    const vendorSummary = [];
    for (const vendor of MarketVendors) {
        if (!hasText(vendor.portrait)) {
            addIssue('商店角色缺少立繪', { vendorId: vendor.id });
        }
        if (!hasText(vendor.summary) || !hasText(vendor.dialogue)) {
            addWarning('商店角色缺少敘事定位', { vendorId: vendor.id });
        }

        const shelves = vendor.shelves || [];
        const orders = vendor.orders || [];
        const exchanges = vendor.exchanges || [];
        const offeringCount = shelves.length + orders.length + exchanges.length;
        if (offeringCount === 0) {
            addIssue('商店角色沒有任何功能入口', { vendorId: vendor.id });
        }
        if (vendor.lockedUnless && !hasText(vendor.lockedSummary)) {
            addIssue('鎖定商店角色缺少鎖定說明', { vendorId: vendor.id });
        }

        vendorSummary.push({
            id: vendor.id,
            shelves: shelves.length,
            orders: orders.length,
            exchanges: exchanges.length
        });
    }

    summary.market = vendorSummary;
}

auditMainStory();
auditSideStories();
auditWorldEvents();
auditDungeons();
auditCasino();
auditMarket();

const result = {
    ok: issues.length === 0,
    issues,
    warnings,
    summary
};

console.log(JSON.stringify(result, null, 2));

if (issues.length > 0) {
    process.exit(1);
}
