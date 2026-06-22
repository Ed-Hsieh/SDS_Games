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
import { worldStoryManager } from './WorldStoryManager.js';
import { StoryEventTypes } from '../data/StoryProgressMap.js';
import { showGlobalToast } from '../utils/UIFeedback.js';

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
        
        return { 
            success: true, 
            message: quest.dialogue?.start || `已接取任務：${quest.name}`,
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

        // 發放獎勵
        const rewards = this.giveRewards(quest.rewards);

        // 更新狀態
        this.questStates[questId] = {
            status: quest.repeatable ? QuestStatus.AVAILABLE : QuestStatus.FINISHED,
            progress: [],
            startTime: null
        };

        GameManager.setFlag?.(`quest.${questId}.finished`, true);

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

        this.notify('quest_completed', { quest, questId, rewards, blueprintUnlocks, storyOutcome });

        return {
            success: true,
            message: quest.dialogue?.complete || `完成任務：${quest.name}`,
            rewards,
            blueprintUnlocks,
            storyOutcome
        };
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
                    // 創建道具實例並加入背包
                    const item = this.createQuestRewardItem(itemData);
                    GameManager.addToInventory(item);
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

        if (eventType === 'quest_completed') {
            showGlobalToast('回報完成', this.getQuestCompletionToastText(questName, data), 'success');
            return;
        }

        if (eventType === 'hidden_quest_discovered') {
            showGlobalToast('新的聽聞', `「${questName}」已寫入旅人手札。`, 'quest');
        }
    }

    getQuestCompletionToastText(questName, data = {}) {
        const parts = [];
        const rewardText = this.getRewardToastText(data.rewards, data.blueprintUnlocks).replace(/^獲得\s*/, '');
        const newClues = Array.isArray(data.storyOutcome?.newClues) ? data.storyOutcome.newClues : [];
        const progressUpdates = Array.isArray(data.storyOutcome?.progressUpdates) ? data.storyOutcome.progressUpdates : [];
        const finalReady = Array.isArray(data.storyOutcome?.finalReady) ? data.storyOutcome.finalReady : [];

        if (rewardText) parts.push(`收穫：${rewardText}`);
        if (newClues.length > 0) parts.push(`手札新增 ${newClues.length} 段線索`);
        if (finalReady.length > 0) parts.push('首領痕跡已收束');
        else if (progressUpdates.length > 0) parts.push('首領痕跡有新推進');

        return parts.length > 0
            ? `「${questName}」已回報，${parts.join('；')}。`
            : `「${questName}」已回報，這段紀錄收進旅人手札。`;
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
