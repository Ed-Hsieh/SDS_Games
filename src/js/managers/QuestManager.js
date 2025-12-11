/**
 * QuestManager.js
 * 任務管理器 - 管理任務狀態、進度追蹤、完成判定、連鎖觸發
 * (從 scenes/QuestSystem.js 搬移而來)
 */
import GameManager from './GameManager.js';
import { QuestDatabase, QuestStatus, QuestType, ObjectiveType, getQuestById, QuestRewardItems } from '../data/Quests.js';

class QuestManager {
    constructor() {
        // 任務狀態存儲
        this.questStates = {}; // { questId: { status, progress: [], startTime } }
        
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
    }

    init() {
        // 初始化第一個主線任務為可接取狀態
        this.questStates['main_001'] = {
            status: QuestStatus.AVAILABLE,
            progress: [],
            startTime: null
        };
        
        console.log('QuestManager initialized');
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

        this.notify('quest_accepted', { quest, questId });
        
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
     * 完成任務（領取獎勵）
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

        // 解鎖後續任務
        if (quest.unlocks && quest.unlocks.length > 0) {
            quest.unlocks.forEach(nextQuestId => {
                this.unlockQuest(nextQuestId);
            });
        }

        // 檢查是否觸發隱藏任務
        this.checkHiddenQuestTriggers('quest_complete', questId);

        this.notify('quest_completed', { quest, questId, rewards });

        return {
            success: true,
            message: quest.dialogue?.complete || `完成任務：${quest.name}`,
            rewards
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
            this.notify('quest_unlocked', { quest, questId });
        }
    }

    /**
     * 發放獎勵
     */
    giveRewards(rewards) {
        const result = { gold: 0, exp: 0, items: [] };

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
                const itemData = QuestRewardItems[itemId];
                if (itemData) {
                    // 創建道具實例並加入背包
                    const item = this.createQuestRewardItem(itemData);
                    GameManager.addToInventory(item);
                    result.items.push(item);
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
                this.notify('quest_ready', { questId, quest });
                // 顯示全局 Toast 通知
                this.showGlobalToast('🎉 任務完成！', `「${quest.name}」可以領取獎勵了！`, 'success');
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
    showGlobalToast(title, message, type = 'info') {
        const container = document.getElementById('global-toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `global-toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${this.getToastIcon(type)}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">×</button>
        `;
        
        // 關閉按鈕
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.add('toast-hiding');
            setTimeout(() => toast.remove(), 300);
        });
        
        container.appendChild(toast);
        
        // 觸發動畫
        requestAnimationFrame(() => {
            toast.classList.add('toast-show');
        });
        
        // 自動關閉
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.add('toast-hiding');
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
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
    isMonsterMatch(target, monsterType) {
        // 區域怪物匹配
        const zoneMonsters = {
            'low_monster': ['slime', 'rat', 'bat'],
            'medium_monster': ['goblin', 'skeleton', 'spider'],
            'high_monster': ['wolf', 'orc', 'ghost'],
            'boss': ['dragon', 'demon_lord', 'lich']
        };

        if (zoneMonsters[target]) {
            return zoneMonsters[target].includes(monsterType);
        }

        return target === monsterType;
    }

    /**
     * 檢查任務是否完成
     */
    checkQuestCompletion(questId) {
        const state = this.questStates[questId];
        if (!state || state.status !== QuestStatus.ACTIVE) return false;

        return state.progress.every(prog => prog.current >= prog.required);
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
                this.unlockQuest(quest.id);
                this.notify('hidden_quest_discovered', { quest });
            }
        });

        // 特殊：金幣為 0 時檢查
        if (triggerType === 'gold' || GameManager.getGold() === 0) {
            const brokeQuest = hiddenQuests.find(q => q.id === 'hidden_broke');
            if (brokeQuest && GameManager.getGold() === 0 &&
                (!this.questStates['hidden_broke'] || 
                 this.questStates['hidden_broke'].status === QuestStatus.LOCKED)) {
                this.unlockQuest('hidden_broke');
                this.notify('hidden_quest_discovered', { quest: brokeQuest });
            }
        }
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
     * 獲取待領獎的任務
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
        this.listeners.forEach(callback => {
            try {
                callback(eventType, data);
            } catch (e) {
                console.error('Quest event handler error:', e);
            }
        });
    }

    // ==================== 存檔/讀檔 ====================

    serialize() {
        return {
            questStates: this.questStates,
            stats: this.stats
        };
    }

    deserialize(data) {
        if (data.questStates) {
            this.questStates = data.questStates;
        }
        if (data.stats) {
            this.stats = data.stats;
        }
    }
}

// 單例
export const questManager = new QuestManager();
export default QuestManager;

// 重新導出常用的 enum，供 Scenes 使用（避免 Scenes 直接引用 Database）
export { QuestStatus, QuestType, ObjectiveType, QuestRewardItems };
