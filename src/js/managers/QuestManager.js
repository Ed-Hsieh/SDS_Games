/**
 * QuestManager.js
 * 任務管理器 - 管理任務狀態、進度追蹤、完成判定、連鎖觸發
 * (從 scenes/QuestSystem.js 搬移而來)
 */
import GameManager from './GameManager.js';
import {
    QuestCompletionMode,
    QuestDatabase,
    QuestStatus,
    QuestType,
    ObjectiveType,
    getQuestById
} from '../data/Quests.js';
import { MonsterDatabase, MonsterType } from '../data/Monsters.js';
import { getMaterial } from '../data/Materials.js';
import { resolveItemById } from '../utils/ItemResolver.js';
import { unlockRecipesForInteraction } from './BlueprintManager.js';
import { markItemKnown } from './EncyclopediaManager.js';
import { getQuestStory } from '../data/QuestStories.js';
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
            casinoPrizeDraws: 0,
            darkTableLossCount: 0,
            darkTableWinCount: 0,
            maxEnhanceLevel: 0,
            totalGambleProfit: 0
        };
        
        // 事件監聽器
        this.listeners = [];
        
        GameManager.subscribe(this.handleGameStateUpdate);
        GameManager.registerSaveSystem('quests', this);
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
        GameManager.setFlag?.(`quest.${questId}.accepted`, true, { reason: 'quest-accepted' });

        this.notify('quest_accepted', { quest, questId });
        this.syncCollectObjectives();
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
        for (const flag of quest.completionFlags || []) {
            GameManager.setFlag?.(flag, true, { reason: `quest-complete:${questId}` });
        }

        // 解鎖後續任務
        if (quest.unlocks && quest.unlocks.length > 0) {
            quest.unlocks.forEach(nextQuestId => {
                this.unlockQuest(nextQuestId);
            });
        }

        // 檢查是否觸發隱藏任務
        this.checkHiddenQuestTriggers('quest_complete', questId);
        const blueprintUnlocks = unlockRecipesForInteraction(questId);

        this.notify('quest_completed', { quest, questId, rewards, blueprintUnlocks });

        return {
            success: true,
            message: completedStory?.reportMessage || `完成任務：${quest.name}`,
            rewards,
            blueprintUnlocks
        };
    }

    resolveObjectiveCompletion(questId, quest, state) {
        if (quest.completionMode === QuestCompletionMode.AUTO_ARCHIVE) {
            state.status = QuestStatus.FINISHED;
            state.progress = [];
            state.startTime = null;

            GameManager.setFlag?.(`quest.${questId}.finished`, true, { reason: 'quest-auto-archived' });
            GameManager.setFlag?.(`quest.${questId}.archived`, true, { reason: 'quest-auto-archived' });
            for (const flag of quest.completionFlags || []) {
                GameManager.setFlag?.(flag, true, { reason: `quest-auto-archived:${questId}` });
            }
            GameManager.markSaveDirty('quest-auto-archived');
            this.notify('quest_archived', { questId, quest });
            return QuestStatus.FINISHED;
        }

        state.status = QuestStatus.COMPLETED;
        GameManager.markSaveDirty('quest-ready');
        this.notify('quest_ready', { questId, quest });
        return QuestStatus.COMPLETED;
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
            this.notify('quest_unlocked', { quest, questId });
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
            GameManager.addCharacterExperience(rewards.exp, { reason: 'quest-reward' });
            result.exp = rewards.exp;
        }

        if (rewards.items && rewards.items.length > 0) {
            rewards.items.forEach(itemId => {
                const itemData = resolveItemById(itemId, {
                    order: ['rewardItem', 'material', 'equipment', 'shop', 'bossEquipment']
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
                this.resolveObjectiveCompletion(questId, quest, state);
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

    handleGameStateUpdate(_state, type) {
        if (type === 'all' || type === 'gold') {
            this.checkHiddenQuestTriggers('gold', Number(GameManager.getGold()) || 0);
        }

        if (!['all', 'inventory', 'warehouse'].includes(type)) return;
        this.syncCollectObjectives();
    }

    syncCollectObjectives() {
        let updated = false;

        for (const [questId, questState] of Object.entries(this.questStates)) {
            if (questState.status !== QuestStatus.ACTIVE) continue;

            const quest = getQuestById(questId);
            if (!quest) continue;

            questState.progress.forEach((prog, index) => {
                if (prog.type !== ObjectiveType.COLLECT) return;

                const owned = GameManager.getItemCountAcrossStorage(prog.target);
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
                this.resolveObjectiveCompletion(questId, quest, questState);
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
                this.resolveObjectiveCompletion(questId, quest, questState);
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
                this.unlockQuest(quest.id);
                this.notify('hidden_quest_discovered', { quest });
            }
        });

        // 特殊：金幣為 0 時檢查
    }

    // ==================== 查詢方法 ====================

    /**
     * 獲取所有可見任務（按類型分類）
     */
    getVisibleQuests() {
        const result = {
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
            .map(([questId, state]) => {
                const quest = getQuestById(questId);
                return quest ? { ...quest, state } : null;
            })
            .filter(Boolean);
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
            .map(([questId, state]) => {
                const quest = getQuestById(questId);
                return quest ? { ...quest, state } : null;
            })
            .filter(Boolean);
    }

    getQuestCounts() {
        const counts = { active: 0, completed: 0, finished: 0 };
        for (const state of Object.values(this.questStates)) {
            if (state.status === QuestStatus.ACTIVE) counts.active += 1;
            if (state.status === QuestStatus.COMPLETED) counts.completed += 1;
            if (state.status === QuestStatus.FINISHED) counts.finished += 1;
        }
        return counts;
    }

    completeQuestObjectives(questId) {
        const quest = getQuestById(questId);
        const state = this.questStates[questId];
        if (!quest || !state || state.status !== QuestStatus.ACTIVE) {
            return { success: false, message: '任務需先處於進行中才能補滿' };
        }

        for (const progress of state.progress || []) {
            progress.current = progress.required;
        }
        const status = this.resolveObjectiveCompletion(questId, quest, state);
        return { success: true, quest, status };
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
            if (!getQuestById(questId)) {
                delete this.questStates[questId];
                continue;
            }
            if (state?.status === QuestStatus.FINISHED) {
                GameManager.setFlag(`quest.${questId}.finished`, true, {
                    persist: false,
                    notify: false,
                    syncPassive: false,
                    reason: 'quest-deserialize'
                });
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
