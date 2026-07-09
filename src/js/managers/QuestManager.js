/**
 * QuestManager.js
 * 任務管理器 - 管理任務狀態、進度追蹤、完成判定、連鎖觸發
 * (從 scenes/QuestSystem.js 搬移而來)
 */
import GameManager from './GameManager.js';
import { QuestDatabase, QuestStatus, QuestType, ObjectiveType, getQuestById, QuestRewardItems } from '../data/Quests.js';
import { MonsterDatabase, MonsterType } from '../data/Monsters.js';
import { getMaterial } from './MaterialManager.js';
import { resolveItemById } from '../utils/ItemResolver.js';
import { unlockRecipesForInteraction } from './BlueprintManager.js';
import { markItemKnown } from './EncyclopediaManager.js';
import { worldStoryManager } from './WorldStoryManager.js';
import { StoryEventTypes } from '../data/StoryProgressMap.js';
import { getChapterOneRouteGroupByTarget } from '../data/ChapterOneRoutePlan.js';
import { getQuestStory } from '../data/QuestStories.js';
import { showGlobalToast } from '../utils/UIFeedback.js';

const FinaleOutcome = {
    NAMED_TOMORROW: 'named_tomorrow',
    WOUNDED_DAWN: 'wounded_dawn',
    THIN_TOMORROW: 'thin_tomorrow'
};

const FinaleOutcomeConfigs = {
    [FinaleOutcome.NAMED_TOMORROW]: {
        id: FinaleOutcome.NAMED_TOMORROW,
        flag: 'town.ending.named_tomorrow',
        title: '有名字的明天',
        summary: '終戰後，城鎮不是只記得你擊敗魔王，也記得每一條被你保住的路、每一碗熱湯與每一個被點回來的名字。',
        reflection: '你看著城門下的名冊、湯鍋旁的隊伍與書記桌上的索引，忽然明白：所謂勝利不是世界恢復原狀，而是有人能把明天叫得出名字。',
        sceneLines: [
            '黑焰邊境的火光退下去時，城鎮沒有立刻歡呼。人們先點名，先確認誰回來，誰還在路上。',
            '村長把舊名冊攤在城門石階上，書記用發抖的手補上最後一行。鐵匠沒有說話，只把修好的門閂敲回去。',
            '直到湯鍋重新冒煙，第一個孩子問明天能不能去廣場玩，所有人才像忽然聽懂勝利是什麼。'
        ],
        townEcho: '城鎮開始用人的名字稱呼明天。',
        thoughtTitle: '我現在是否該回城看看那些被保住的人？'
    },
    [FinaleOutcome.WOUNDED_DAWN]: {
        id: FinaleOutcome.WOUNDED_DAWN,
        flag: 'town.ending.wounded_dawn',
        title: '帶傷的黎明',
        summary: '阿薩謝爾倒下後，城鎮撐住了。不是所有事情都被接回來，但你留下的準備足以讓人們從破口旁重新站起。',
        reflection: '黎明穿過城門裂縫時，你看見人們先清點傷口，再清點還剩下的名字。這個世界沒有被治好，但它拒絕立刻死去。',
        sceneLines: [
            '魔王倒下後，風還是很冷。城牆裂縫裡卡著灰，廣場上有人哭，有人睡著，有人站著不敢坐下。',
            '村長把撤退路線重新畫了一遍，書記把缺頁壓平。沒有誰說一切會好，只說今天先把火點起來。',
            '你聽見遠處有人喊你的名字，聲音沙啞，但確實穿過了黎明。'
        ],
        townEcho: '城鎮帶著傷口醒來，但火還沒有滅。',
        thoughtTitle: '我現在是否該確認城鎮還剩下哪些需要接回來的事？'
    },
    [FinaleOutcome.THIN_TOMORROW]: {
        id: FinaleOutcome.THIN_TOMORROW,
        flag: 'town.ending.thin_tomorrow',
        title: '單薄的明天',
        summary: '魔王被擊倒，終焉暫時退後。可城鎮準備得太少，勝利像薄紙一樣被人小心捧著，任何風都讓人緊張。',
        reflection: '你贏了最巨大的戰鬥，卻看見城鎮還在為名字、糧食與退路慌張。明天仍然存在，只是輕得讓人不敢鬆手。',
        sceneLines: [
            '終焉被你推回深處，但城鎮像被巨手攥過。人們知道魔王死了，卻不知道下一餐、下一班守衛、下一封信在哪裡。',
            '村長沒有責備任何人。他只是把手掌按在空白名冊上，像按住一張快被風吹走的紙。',
            '勝利存在，只是太薄。你第一次明白，打倒怪物不等於把世界接好。'
        ],
        townEcho: '城鎮活了下來，卻還不敢大聲說自己安全。',
        thoughtTitle: '我現在是否該回頭看看還有哪些明天太單薄？'
    }
};

const FinaleSupportFactors = [
    { flag: 'town.scholar.last_index_bound', label: '書記保住活人索引', role: 'memory' },
    { flag: 'town.gate.retreat_names_called', label: '撤退名單被完整點過', role: 'retreat' },
    { flag: 'town.refugees.soup_kitchen_warm', label: '避難者廚房升火', role: 'supply' },
    { flag: 'town.blacksmith.mithril_route_ready', label: '秘銀鍛造路線整理完成', role: 'gear' },
    { flag: 'town.refugees.unsent_reply_archived', label: '北境回信被歸檔', role: 'north' },
    { flag: 'town.casino.relief_fund_counted', label: '賭場籌碼換成補給', role: 'relief' },
    { flag: 'town.coast_refugee_lamp_lit', label: '海岸燈號被校正', role: 'route' },
    { flag: 'town.gate.broken_standard_raised', label: '斷旗重新掛上城門', role: 'retreat' }
];

class QuestManager {
    constructor() {
        // 任務狀態存儲
        this.questStates = {}; // { questId: { status, progress: [], startTime } }
        this.handleGameStateUpdate = this.handleGameStateUpdate.bind(this);
        
        // 統計數據（用於隱藏任務觸發）
        this.stats = {
            deathCount: 0,
            gambleLossStreak: 0,
            jackpotCount: 0,
            casinoPrizeDraws: 0,
            darkTableLossCount: 0,
            darkTableWinCount: 0,
            maxEnhanceLevel: 0,
            totalGambleProfit: 0
        };
        
        // 事件監聽器
        this.listeners = [];
        
        // 初始化
        this.init();
        GameManager.subscribe(this.handleGameStateUpdate);
        GameManager.registerSaveSystem('quests', this);
    }

    init() {
        // 任務由世界線索解鎖，避免一開始像清單任務一樣直接出現。
    }

    // ==================== 任務管理 ====================

    /**
     * 接取任務
     */
    acceptQuest(questId) {
        const quest = getQuestById(questId);
        if (!quest) {
            return { success: false, message: '任務不存在' };
        }

        const state = this.questStates[questId];
        if (!state || state.status !== QuestStatus.AVAILABLE) {
            return { success: false, message: '任務不可接取' };
        }

        // 初始化進度
        const progress = quest.objectives.map(obj => ({
            type: obj.type,
            target: obj.target,
            current: 0,
            required: obj.count
        }));

        this.questStates[questId] = {
            status: QuestStatus.ACTIVE,
            progress,
            startTime: Date.now()
        };

        const storyOutcome = worldStoryManager.applyStoryEvent(StoryEventTypes.QUEST_ACCEPTED, {
            questId,
            quest,
            source: 'quest_manager'
        });

        this.notify('quest_accepted', { quest, questId, storyOutcome });
        this.syncCollectObjectives(GameManager.state);
        this.syncExplorationObjectives();
        this.syncFlagObjectives();
        
        const questStory = getQuestStory(quest, this.questStates[questId]);

        return { 
            success: true, 
            message: questStory?.acceptMessage || `已接取：${quest.name}`,
            quest
        };
    }

    /**
     * 放棄任務
     */
    abandonQuest(questId) {
        const quest = getQuestById(questId);
        if (!quest) return { success: false, message: '任務不存在' };

        const state = this.questStates[questId];
        if (!state || state.status !== QuestStatus.ACTIVE) {
            return { success: false, message: '任務未在進行中' };
        }

        // 主線任務不可放棄
        if (quest.type === QuestType.MAIN) {
            return { success: false, message: '主線任務無法放棄' };
        }

        // 重置為可接取（如果可重複）或鎖定
        this.questStates[questId] = {
            status: quest.repeatable ? QuestStatus.AVAILABLE : QuestStatus.LOCKED,
            progress: [],
            startTime: null
        };

        this.notify('quest_abandoned', { questId });
        return { success: true, message: '已放棄任務' };
    }

    /**
     * 完成任務（回報後發放獎勵）
     */
    completeQuest(questId) {
        const quest = getQuestById(questId);
        if (!quest) return { success: false, message: '任務不存在' };

        const state = this.questStates[questId];
        if (!state || state.status !== QuestStatus.COMPLETED) {
            return { success: false, message: '任務尚未完成' };
        }

        const completedStory = getQuestStory(quest, { ...state, status: QuestStatus.COMPLETED });

        // 發放獎勵
        const rewards = this.giveRewards(quest.rewards);

        // 更新狀態
        this.questStates[questId] = {
            status: quest.repeatable ? QuestStatus.AVAILABLE : QuestStatus.FINISHED,
            progress: [],
            startTime: null
        };

        GameManager.setFlag?.(`quest.${questId}.finished`, true);
        const townStateUpdate = this.applyQuestTownStateEffect(quest);

        // 解鎖後續任務
        if (quest.unlocks && quest.unlocks.length > 0) {
            quest.unlocks.forEach(nextQuestId => {
                this.unlockQuest(nextQuestId);
            });
        }

        // 檢查是否觸發隱藏任務
        this.checkHiddenQuestTriggers('quest_complete', questId);
        const blueprintUnlocks = unlockRecipesForInteraction(questId);

        const storyOutcome = worldStoryManager.applyStoryEvent(StoryEventTypes.QUEST_COMPLETED, {
            questId,
            quest,
            rewards,
            blueprintUnlocks,
            source: 'quest_manager'
        });
        const finaleOutcome = questId === 'main_015' ? this.recordFinaleOutcome() : null;

        this.notify('quest_completed', { quest, questId, rewards, blueprintUnlocks, storyOutcome, finaleOutcome, townStateUpdate });

        return {
            success: true,
            message: completedStory?.reportMessage || `完成任務：${quest.name}`,
            rewards,
            blueprintUnlocks,
            storyOutcome,
            townStateUpdate,
            finaleOutcome
        };
    }

    applyQuestTownStateEffect(quest) {
        const story = getQuestStory(quest);
        const townStateFlag = story?.characterProfile?.townState;
        if (!townStateFlag) {
            return null;
        }

        const wasActive = Boolean(GameManager.getFlag?.(townStateFlag));
        GameManager.setFlag?.(townStateFlag, true);
        GameManager.markSaveDirty?.('quest-town-state');

        return {
            flag: townStateFlag,
            changed: !wasActive,
            sourceQuestId: quest.id,
            title: story.characterProfile?.townDynamic?.title
                || story.characterProfile?.mainThread
                || story.finished
                || story.completed
                || quest.name,
            text: story.characterProfile?.townDynamic?.text
                || story.finished
                || story.completed
                || story.characterProfile?.mainThread
                || quest.name
        };
    }

    evaluateFinaleOutcome() {
        const matchedFactors = FinaleSupportFactors
            .filter(factor => Boolean(GameManager.getFlag(factor.flag)))
            .map(factor => ({ ...factor }));
        const roles = new Set(matchedFactors.map(factor => factor.role));
        const hasMemory = roles.has('memory');
        const hasRetreat = roles.has('retreat');
        const hasSupply = roles.has('supply') || roles.has('relief');
        const hasGear = roles.has('gear');
        const hasHumanThread = roles.has('north') || roles.has('route');

        let outcomeId = FinaleOutcome.THIN_TOMORROW;
        if (matchedFactors.length >= 5 && hasMemory && hasRetreat && hasSupply) {
            outcomeId = FinaleOutcome.NAMED_TOMORROW;
        } else if (matchedFactors.length >= 3 || (hasRetreat && hasSupply) || (hasMemory && hasGear && hasHumanThread)) {
            outcomeId = FinaleOutcome.WOUNDED_DAWN;
        }

        return {
            ...FinaleOutcomeConfigs[outcomeId],
            score: matchedFactors.length,
            factors: matchedFactors,
            roles: [...roles]
        };
    }

    recordFinaleOutcome() {
        const existing = GameManager.getFlag('world.ending.outcome');
        if (existing?.id && FinaleOutcomeConfigs[existing.id]) {
            return existing;
        }

        const outcome = this.evaluateFinaleOutcome();
        Object.values(FinaleOutcomeConfigs).forEach(config => {
            GameManager.setFlag(config.flag, config.id === outcome.id);
        });
        GameManager.setFlag('world.ending.outcome', {
            id: outcome.id,
            title: outcome.title,
            summary: outcome.summary,
            reflection: outcome.reflection,
            sceneLines: outcome.sceneLines || [],
            townEcho: outcome.townEcho || '',
            thoughtTitle: outcome.thoughtTitle || '',
            score: outcome.score,
            factors: outcome.factors.map(factor => factor.label),
            recordedAt: Date.now()
        });
        GameManager.setFlag('world.ending.final_battle_reported', true);
        GameManager.markSaveDirty?.('finale-outcome');
        return outcome;
    }

    /**
     * 解鎖任務
     */
    unlockQuest(questId) {
        if (!this.questStates[questId] || this.questStates[questId].status === QuestStatus.LOCKED) {
            this.questStates[questId] = {
                status: QuestStatus.AVAILABLE,
                progress: [],
                startTime: null
            };
            
            const quest = getQuestById(questId);
            const storyOutcome = worldStoryManager.applyStoryEvent(StoryEventTypes.QUEST_UNLOCKED, {
                questId,
                quest,
                source: 'quest_manager'
            });
            this.notify('quest_unlocked', { quest, questId, storyOutcome });
        }
    }

    /**
     * 發放獎勵
     */
    giveRewards(rewards) {
        const result = { gold: 0, exp: 0, items: [], materials: [] };

        if (rewards.gold) {
            GameManager.addGold(rewards.gold);
            result.gold = rewards.gold;
        }

        if (rewards.exp) {
            const char = GameManager.getCharacter();
            char.exp += rewards.exp;
            char.checkLevelUp();
            result.exp = rewards.exp;
        }

        if (rewards.items && rewards.items.length > 0) {
            rewards.items.forEach(itemId => {
                const itemData = resolveItemById(itemId, {
                    order: ['questReward', 'material', 'equipment', 'shop', 'bossEquipment']
                });
                if (itemData) {
                    // Unique quest rewards should never disappear because the bag is full.
                    const item = this.createQuestRewardItem(itemData);
                    const addedToInventory = GameManager.addToInventory(item);
                    if (!addedToInventory) {
                        GameManager.addToWarehouse(item);
                    }
                    markItemKnown(item.id);
                    result.items.push(item);
                }
            });
        }

        if (rewards.materials && rewards.materials.length > 0) {
            rewards.materials.forEach(entry => {
                const material = getMaterial(entry.id);
                const quantity = Math.max(1, Number(entry.quantity) || 1);
                if (material) {
                    GameManager.addToInventory(material, quantity);
                    markItemKnown(material.id);
                    result.materials.push({ ...material, quantity });
                }
            });
        }

        return result;
    }

    /**
     * 創建任務獎勵道具
     */
    createQuestRewardItem(itemData) {
        return {
            ...itemData,
            instanceId: `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            acquiredTime: Date.now()
        };
    }

    // ==================== 進度更新 ====================

    /**
     * 更新任務進度
     */
    updateProgress(type, target, amount = 1) {
        let updated = false;

        // 遍歷所有進行中的任務
        for (const [questId, state] of Object.entries(this.questStates)) {
            if (state.status !== QuestStatus.ACTIVE) continue;

            const quest = getQuestById(questId);
            if (!quest) continue;

            state.progress.forEach((prog, index) => {
                if (prog.type !== type) return;
                
                // 檢查目標是否匹配
                const targetMatch = prog.target === 'any' || 
                                   prog.target === target ||
                                   (type === ObjectiveType.KILL && this.isMonsterMatch(prog.target, target));

                if (targetMatch && prog.current < prog.required) {
                    prog.current = Math.min(prog.current + amount, prog.required);
                    updated = true;
                    
                    this.notify('progress_updated', { 
                        questId, 
                        quest,
                        objectiveIndex: index,
                        progress: prog 
                    });
                }
            });

            // 檢查是否所有目標都完成
            if (this.checkQuestCompletion(questId)) {
                state.status = QuestStatus.COMPLETED;
                const storyOutcome = worldStoryManager.applyStoryEvent(StoryEventTypes.QUEST_READY, {
                    questId,
                    quest,
                    source: 'quest_manager'
                });
                this.notify('quest_ready', { questId, quest, storyOutcome });
            }
        }

        return updated;
    }
    
    /**
     * 顯示全局 Toast 通知
     * @param {string} title - 標題
     * @param {string} message - 訊息內容
     * @param {string} type - 類型 (success, info, warning, error)
     */
    showGlobalToast(title, message, type = 'info', options = {}) {
        return showGlobalToast(title, message, type, options);
    }
    
    /**
     * 獲取 Toast 圖標
     */
    getToastIcon(type) {
        const icons = {
            success: '✅',
            info: 'ℹ️',
            warning: '⚠️',
            error: '❌'
        };
        return icons[type] || icons.info;
    }

    /**
     * 檢查怪物類型匹配
     */
    isMonsterMatch(target, monsterId) {
        if (target === monsterId) return true;

        const monster = MonsterDatabase[monsterId] || Object.values(MonsterDatabase).find(m => m.id === monsterId);
        if (!monster) return false;

        const isBoss = monster.type === MonsterType.BOSS || monster.type === MonsterType.WORLD_BOSS;
        const level = Number(monster.level) || 0;

        const zoneMatchers = {
            low_monster: () => level >= 1 && level <= 5 && !isBoss,
            medium_monster: () => level >= 6 && level <= 12 && !isBoss,
            high_monster: () => level >= 13 && level <= 20 && !isBoss,
            boss: () => isBoss
        };

        return zoneMatchers[target]?.() || false;
    }

    /**
     * 檢查任務是否完成
     */
    checkQuestCompletion(questId) {
        const state = this.questStates[questId];
        if (!state || state.status !== QuestStatus.ACTIVE) return false;

        return state.progress.every(prog => prog.current >= prog.required);
    }

    handleGameStateUpdate(state, type) {
        if (type === 'all' || type === 'gold') {
            this.checkHiddenQuestTriggers('gold', Number(state?.character?.gold ?? GameManager.getGold()) || 0);
        }

        if (!['all', 'inventory', 'warehouse'].includes(type)) return;
        this.syncCollectObjectives(state);
    }

    syncCollectObjectives(state = GameManager.state) {
        let updated = false;
        const countItem = itemId => {
            const countIn = stacks => (stacks || [])
                .filter(stack => stack?.item?.id === itemId)
                .reduce((sum, stack) => sum + (Number(stack.quantity) || 1), 0);
            return countIn(state?.inventory) + countIn(state?.warehouse);
        };

        for (const [questId, questState] of Object.entries(this.questStates)) {
            if (questState.status !== QuestStatus.ACTIVE) continue;

            const quest = getQuestById(questId);
            if (!quest) continue;

            questState.progress.forEach((prog, index) => {
                if (prog.type !== ObjectiveType.COLLECT) return;

                const owned = countItem(prog.target);
                const nextValue = Math.min(owned, prog.required);
                if (nextValue === prog.current) return;

                prog.current = nextValue;
                updated = true;
                this.notify('progress_updated', {
                    questId,
                    quest,
                    objectiveIndex: index,
                    progress: prog
                });
            });

            if (this.checkQuestCompletion(questId)) {
                questState.status = QuestStatus.COMPLETED;
                const storyOutcome = worldStoryManager.applyStoryEvent(StoryEventTypes.QUEST_READY, {
                    questId,
                    quest,
                    source: 'quest_manager'
                });
                this.notify('quest_ready', { questId, quest, storyOutcome });
            }
        }

        return updated;
    }

    syncExplorationObjectives() {
        let updated = false;

        for (const [questId, questState] of Object.entries(this.questStates)) {
            if (questState.status !== QuestStatus.ACTIVE) continue;

            const quest = getQuestById(questId);
            if (!quest) continue;

            questState.progress.forEach((prog, index) => {
                if (prog.type !== ObjectiveType.EXPLORE) return;

                const routeGroup = getChapterOneRouteGroupByTarget(prog.target);
                if (!routeGroup) return;

                const visited = (routeGroup.landmarkIds || []).filter(landmarkId =>
                    Boolean(GameManager.getFlag(worldStoryManager.getLandmarkVisitedFlag(landmarkId)))
                ).length;
                const nextValue = Math.min(visited, prog.required);
                if (nextValue <= prog.current) return;

                prog.current = nextValue;
                updated = true;
                this.notify('progress_updated', {
                    questId,
                    quest,
                    objectiveIndex: index,
                    progress: prog
                });
            });

            if (this.checkQuestCompletion(questId)) {
                questState.status = QuestStatus.COMPLETED;
                const storyOutcome = worldStoryManager.applyStoryEvent(StoryEventTypes.QUEST_READY, {
                    questId,
                    quest,
                    source: 'quest_manager'
                });
                this.notify('quest_ready', { questId, quest, storyOutcome });
            }
        }

        return updated;
    }

    syncFlagObjectives() {
        let updated = false;

        for (const [questId, questState] of Object.entries(this.questStates)) {
            if (questState.status !== QuestStatus.ACTIVE) continue;

            const quest = getQuestById(questId);
            if (!quest) continue;

            questState.progress.forEach((prog, index) => {
                const objective = quest.objectives?.[index];
                const flag = objective?.completionFlag;
                if (!flag || !GameManager.getFlag?.(flag)) return;

                const nextValue = Math.min(prog.required, Math.max(prog.current, prog.required));
                if (nextValue === prog.current) return;

                prog.current = nextValue;
                updated = true;
                this.notify('progress_updated', {
                    questId,
                    quest,
                    objectiveIndex: index,
                    progress: prog
                });
            });

            if (this.checkQuestCompletion(questId)) {
                questState.status = QuestStatus.COMPLETED;
                const storyOutcome = worldStoryManager.applyStoryEvent(StoryEventTypes.QUEST_READY, {
                    questId,
                    quest,
                    source: 'quest_manager'
                });
                this.notify('quest_ready', { questId, quest, storyOutcome });
            }
        }

        return updated;
    }

    // ==================== 隱藏任務觸發 ====================

    /**
     * 更新統計數據
     */
    updateStats(statType, value) {
        switch (statType) {
            case 'death':
                this.stats.deathCount++;
                this.checkHiddenQuestTriggers('death_count', this.stats.deathCount);
                break;
            case 'gamble_loss':
                this.stats.gambleLossStreak++;
                this.checkHiddenQuestTriggers('gamble_loss_streak', this.stats.gambleLossStreak);
                break;
            case 'gamble_win':
                this.stats.gambleLossStreak = 0; // 重置連敗
                break;
            case 'jackpot':
                this.stats.jackpotCount++;
                this.checkHiddenQuestTriggers('jackpot_count', this.stats.jackpotCount);
                break;
            case 'casino_prize_draw':
                this.stats.casinoPrizeDraws++;
                this.checkHiddenQuestTriggers('casino_prize_draw', this.stats.casinoPrizeDraws);
                break;
            case 'dark_table_loss':
                this.stats.darkTableLossCount++;
                this.checkHiddenQuestTriggers('dark_table_loss', this.stats.darkTableLossCount);
                break;
            case 'dark_table_win':
                this.stats.darkTableWinCount++;
                this.checkHiddenQuestTriggers('dark_table_win', this.stats.darkTableWinCount);
                break;
            case 'enhance_level':
                if (value > this.stats.maxEnhanceLevel) {
                    this.stats.maxEnhanceLevel = value;
                    this.checkHiddenQuestTriggers('enhance_level', value);
                }
                break;
            case 'gamble_profit':
                this.stats.totalGambleProfit += value;
                break;
        }
    }

    /**
     * 檢查隱藏任務觸發條件
     */
    checkHiddenQuestTriggers(triggerType, value) {
        const hiddenQuests = QuestDatabase.hidden;

        hiddenQuests.forEach(quest => {
            // 已解鎖或完成的跳過
            if (this.questStates[quest.id] && 
                this.questStates[quest.id].status !== QuestStatus.LOCKED) {
                return;
            }

            const trigger = quest.trigger;
            if (!trigger || trigger.type !== triggerType) return;

            let triggered = false;
            switch (trigger.condition) {
                case 'equal':
                    triggered = value === trigger.value;
                    break;
                case 'gte':
                    triggered = value >= trigger.value;
                    break;
                case 'lte':
                    triggered = value <= trigger.value;
                    break;
            }

            if (triggered) {
                if (quest.id === 'hidden_broke') {
                    this.ensureBrokeQuestActive({ announce: true });
                    return;
                }

                this.unlockQuest(quest.id);
                this.notify('hidden_quest_discovered', { quest });
            }
        });

        // 特殊：金幣為 0 時檢查
        if (triggerType === 'gold' || GameManager.getGold() === 0) {
            this.ensureBrokeQuestActive({ announce: true });
        }
    }

    ensureBrokeQuestActive({ announce = false } = {}) {
        const brokeQuest = getQuestById('hidden_broke');
        if (!brokeQuest || GameManager.getGold() !== 0) return null;

        const currentState = this.getQuestState('hidden_broke');
        const wasLocked = !this.questStates['hidden_broke'] || currentState.status === QuestStatus.LOCKED;

        if (wasLocked) {
            this.unlockQuest('hidden_broke');
            if (announce) {
                this.notify('hidden_quest_discovered', { quest: brokeQuest });
            }
        }

        const latestState = this.getQuestState('hidden_broke');
        if (latestState.status === QuestStatus.AVAILABLE) {
            const accepted = this.acceptQuest('hidden_broke');
            return accepted.success ? accepted.quest : brokeQuest;
        }

        return latestState.status === QuestStatus.ACTIVE ? brokeQuest : null;
    }

    // ==================== 查詢方法 ====================

    /**
     * 獲取所有可見任務（按類型分類）
     */
    getVisibleQuests() {
        const result = {
            main: [],
            bounty: [],
            commission: [],
            hidden: []
        };

        for (const [questId, state] of Object.entries(this.questStates)) {
            if (state.status === QuestStatus.LOCKED) continue;
            
            const quest = getQuestById(questId);
            if (!quest) continue;

            const questWithState = {
                ...quest,
                state: state
            };

            switch (quest.type) {
                case QuestType.MAIN:
                    result.main.push(questWithState);
                    break;
                case QuestType.BOUNTY:
                    result.bounty.push(questWithState);
                    break;
                case QuestType.COMMISSION:
                    result.commission.push(questWithState);
                    break;
                case QuestType.HIDDEN:
                    result.hidden.push(questWithState);
                    break;
            }
        }

        return result;
    }

    /**
     * 獲取進行中的任務
     */
    getActiveQuests() {
        return Object.entries(this.questStates)
            .filter(([_, state]) => state.status === QuestStatus.ACTIVE)
            .map(([questId, state]) => ({
                ...getQuestById(questId),
                state
            }));
    }

    /**
     * 獲取已解鎖但尚未接取的任務
     */
    getAvailableQuests() {
        return Object.entries(this.questStates)
            .filter(([_, state]) => state.status === QuestStatus.AVAILABLE)
            .map(([questId, state]) => {
                const quest = getQuestById(questId);
                return quest ? { ...quest, state } : null;
            })
            .filter(Boolean);
    }

    /**
     * 獲取待回報的任務
     */
    getCompletedQuests() {
        return Object.entries(this.questStates)
            .filter(([_, state]) => state.status === QuestStatus.COMPLETED)
            .map(([questId, state]) => ({
                ...getQuestById(questId),
                state
            }));
    }

    /**
     * 獲取任務狀態
     */
    getQuestState(questId) {
        return this.questStates[questId] || { status: QuestStatus.LOCKED };
    }

    /**
     * 獲取進行中任務的簡要進度（用於 HUD 顯示）
     */
    getActiveQuestSummary() {
        const activeQuests = this.getActiveQuests();
        return activeQuests.map(quest => {
            const totalProgress = quest.state.progress.reduce((sum, p) => sum + p.current, 0);
            const totalRequired = quest.state.progress.reduce((sum, p) => sum + p.required, 0);
            return {
                id: quest.id,
                name: quest.name,
                icon: quest.icon,
                progress: `${totalProgress}/${totalRequired}`,
                percentage: Math.floor((totalProgress / totalRequired) * 100)
            };
        });
    }

    // ==================== 事件系統 ====================

    subscribe(callback) {
        this.listeners.push(callback);
    }

    unsubscribe(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    notify(eventType, data) {
        this.showQuestToast(eventType, data);
        this.listeners.forEach(callback => {
            try {
                callback(eventType, data);
            } catch (e) {
                console.error('Quest event handler error:', e);
            }
        });
    }

    showQuestToast(eventType, data = {}) {
        if (typeof document === 'undefined') return;

        const questName = data.quest?.name || data.questId || '未知任務';

        if (eventType === 'quest_ready') {
            showGlobalToast('紀錄補齊', `「${questName}」可以回報。`, 'quest', { duration: 5200 });
            return;
        }

        if (eventType === 'hidden_quest_discovered') {
            showGlobalToast('新的聽聞', `「${questName}」已加入任務冊。`, 'quest');
        }
    }

    getRewardToastText(rewards = {}, blueprintUnlocks = []) {
        const parts = [];

        if (rewards.gold) parts.push(`${rewards.gold}G`);
        if (rewards.exp) parts.push(`${rewards.exp} 經驗`);

        const itemNames = [
            ...(rewards.items || []).map(item => item.name).filter(Boolean),
            ...(rewards.materials || []).map(item => `${item.name} x${item.quantity || 1}`).filter(Boolean)
        ];
        if (itemNames.length > 0) parts.push(itemNames.join('、'));

        const newBlueprints = (blueprintUnlocks || [])
            .filter(entry => entry.newlyUnlocked)
            .map(entry => entry.recipe?.name)
            .filter(Boolean);
        if (newBlueprints.length > 0) parts.push(`製作圖：${newBlueprints.join('、')}`);

        return parts.length > 0 ? `獲得 ${parts.join(' / ')}` : '';
    }

    // ==================== 存檔/讀檔 ====================

    serialize() {
        return {
            questStates: this.questStates,
            stats: this.stats
        };
    }

    deserialize(data) {
        this.questStates = data?.questStates || {};
        for (const [questId, state] of Object.entries(this.questStates)) {
            if (state?.status === QuestStatus.FINISHED) {
                GameManager.state.flags[`quest.${questId}.finished`] = true;
            }
        }
        this.stats = {
            deathCount: 0,
            gambleLossStreak: 0,
            jackpotCount: 0,
            casinoPrizeDraws: 0,
            darkTableLossCount: 0,
            darkTableWinCount: 0,
            maxEnhanceLevel: 0,
            totalGambleProfit: 0,
            ...(data?.stats || {})
        };
    }
}

// 單例
export const questManager = new QuestManager();
export default QuestManager;

// 重新導出常用的 enum，供 Scenes 使用（避免 Scenes 直接引用 Database）
export { QuestStatus, QuestType, ObjectiveType, QuestRewardItems };
