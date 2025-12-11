/**
 * QuestScene.js
 * 任務公告板場景 - 顯示任務列表、接取/放棄/完成任務
 */
import GameManager from '../managers/GameManager.js';
import { questManager, QuestStatus, QuestType, ObjectiveType, QuestRewardItems } from '../managers/QuestManager.js';

export default class QuestScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.currentTab = 'main';
        this.selectedQuestId = null;
        
        this.onQuestEvent = this.onQuestEvent.bind(this);
        this.updateSummary = this.updateSummary.bind(this);
    }

    init() {
        console.log('Quest Scene Initialized');
        
        this.cacheDOM();
        this.bindEvents();
        
        // 訂閱任務系統事件
        questManager.subscribe(this.onQuestEvent);
        
        // 初始渲染
        this.renderQuestList();
        this.updateSummary();
    }

    cleanup() {
        questManager.unsubscribe(this.onQuestEvent);
        console.log('Quest Scene Cleaned up');
    }

    cacheDOM() {
        this.dom = {
            // 標籤
            tabs: this.container.querySelectorAll('.quest-tab'),
            activeCount: this.container.querySelector('#active-count'),
            
            // 列表
            listTitle: this.container.querySelector('#list-title'),
            questCount: this.container.querySelector('#quest-count'),
            questList: this.container.querySelector('#quest-list'),
            questEmpty: this.container.querySelector('#quest-empty'),
            
            // 詳情
            detailPlaceholder: this.container.querySelector('#detail-placeholder'),
            detailContent: this.container.querySelector('#detail-content'),
            detailIcon: this.container.querySelector('#detail-icon'),
            detailName: this.container.querySelector('#detail-name'),
            detailType: this.container.querySelector('#detail-type'),
            npcAvatar: this.container.querySelector('#npc-avatar'),
            npcName: this.container.querySelector('#npc-name'),
            detailDialogue: this.container.querySelector('#detail-dialogue-text'),
            detailObjectives: this.container.querySelector('#detail-objectives'),
            detailRewards: this.container.querySelector('#detail-rewards'),
            detailActions: this.container.querySelector('#detail-actions'),
            
            // 按鈕
            btnAccept: this.container.querySelector('#btn-accept'),
            btnAbandon: this.container.querySelector('#btn-abandon'),
            btnComplete: this.container.querySelector('#btn-complete'),
            btnBackLobby: this.container.querySelector('#btn-back-lobby'),
            
            // 統計
            summaryActive: this.container.querySelector('#summary-active'),
            summaryCompleted: this.container.querySelector('#summary-completed'),
            summaryFinished: this.container.querySelector('#summary-finished'),
            
            // 通知
            notification: this.container.querySelector('#quest-notification'),
            notificationTitle: this.container.querySelector('#notification-title'),
            notificationMessage: this.container.querySelector('#notification-message')
        };
    }

    bindEvents() {
        // 標籤切換
        this.dom.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.type);
            });
        });

        // 接取任務
        this.dom.btnAccept?.addEventListener('click', () => {
            if (this.selectedQuestId) {
                const result = questManager.acceptQuest(this.selectedQuestId);
                if (result.success) {
                    this.showNotification('任務接取', result.message);
                    this.renderQuestList();
                    this.renderQuestDetail(this.selectedQuestId);
                }
            }
        });

        // 放棄任務
        this.dom.btnAbandon?.addEventListener('click', () => {
            if (this.selectedQuestId) {
                const result = questManager.abandonQuest(this.selectedQuestId);
                if (result.success) {
                    this.showNotification('任務放棄', result.message);
                    this.renderQuestList();
                    this.clearDetail();
                }
            }
        });

        // 完成任務
        this.dom.btnComplete?.addEventListener('click', () => {
            if (this.selectedQuestId) {
                const result = questManager.completeQuest(this.selectedQuestId);
                if (result.success) {
                    this.showRewardNotification(result);
                    this.renderQuestList();
                    this.clearDetail();
                    this.updateSummary();
                }
            }
        });

        // 返回大廳
        this.dom.btnBackLobby?.addEventListener('click', () => {
            this.app.loadScene('lobby');
        });
    }

    switchTab(type) {
        this.currentTab = type;
        
        // 更新標籤樣式
        this.dom.tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.type === type);
        });

        // 更新標題
        const titles = {
            main: '主線任務',
            bounty: '懸賞任務',
            commission: '委託任務',
            hidden: '神秘任務',
            active: '進行中的任務'
        };
        this.dom.listTitle.textContent = titles[type];

        // 重新渲染列表
        this.renderQuestList();
        this.clearDetail();
    }

    renderQuestList() {
        const visibleQuests = questManager.getVisibleQuests();
        let quests = [];

        if (this.currentTab === 'active') {
            // 進行中 + 待完成
            quests = [
                ...questManager.getActiveQuests(),
                ...questManager.getCompletedQuests()
            ];
        } else {
            quests = visibleQuests[this.currentTab] || [];
        }

        // 更新進行中數量
        const activeCount = questManager.getActiveQuests().length + 
                           questManager.getCompletedQuests().length;
        this.dom.activeCount.textContent = activeCount;
        this.dom.questCount.textContent = `${quests.length} 任務`;

        // 清空並渲染
        this.dom.questList.innerHTML = '';
        
        if (quests.length === 0) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'quest-empty';
            emptyEl.innerHTML = `
                <div class="empty-icon">📭</div>
                <p>目前沒有任務</p>
            `;
            this.dom.questList.appendChild(emptyEl);
            return;
        }

        quests.forEach(quest => {
            const questEl = this.createQuestListItem(quest);
            this.dom.questList.appendChild(questEl);
        });
    }

    createQuestListItem(quest) {
        const el = document.createElement('div');
        el.className = 'quest-list-item';
        el.dataset.questId = quest.id;

        const state = quest.state || questManager.getQuestState(quest.id);
        
        // 狀態樣式
        let statusClass = '';
        let statusIcon = '';
        switch (state.status) {
            case QuestStatus.AVAILABLE:
                statusClass = 'available';
                statusIcon = '📜';
                break;
            case QuestStatus.ACTIVE:
                statusClass = 'active';
                statusIcon = '⚔️';
                break;
            case QuestStatus.COMPLETED:
                statusClass = 'completed';
                statusIcon = '🏆';
                break;
            case QuestStatus.FINISHED:
                statusClass = 'finished';
                statusIcon = '✓';
                break;
        }
        el.classList.add(statusClass);

        // 進度條（僅進行中顯示）
        let progressHTML = '';
        if (state.status === QuestStatus.ACTIVE && state.progress) {
            const current = state.progress.reduce((sum, p) => sum + p.current, 0);
            const total = state.progress.reduce((sum, p) => sum + p.required, 0);
            const percentage = Math.floor((current / total) * 100);
            progressHTML = `
                <div class="quest-progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            `;
        }

        el.innerHTML = `
            <div class="quest-item-icon">${quest.icon || '📜'}</div>
            <div class="quest-item-info">
                <div class="quest-item-name">${quest.name}</div>
                <div class="quest-item-status">
                    <span class="status-icon">${statusIcon}</span>
                    <span class="status-text">${this.getStatusText(state.status)}</span>
                </div>
                ${progressHTML}
            </div>
            ${state.status === QuestStatus.COMPLETED ? '<div class="reward-indicator">🎁</div>' : ''}
        `;

        el.addEventListener('click', () => {
            this.selectQuest(quest.id);
        });

        return el;
    }

    getStatusText(status) {
        const texts = {
            [QuestStatus.AVAILABLE]: '可接取',
            [QuestStatus.ACTIVE]: '進行中',
            [QuestStatus.COMPLETED]: '可領取',
            [QuestStatus.FINISHED]: '已完成'
        };
        return texts[status] || '未知';
    }

    selectQuest(questId) {
        this.selectedQuestId = questId;
        
        // 更新列表選中狀態
        this.dom.questList.querySelectorAll('.quest-list-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.questId === questId);
        });

        this.renderQuestDetail(questId);
    }

    renderQuestDetail(questId) {
        const quest = questManager.getVisibleQuests();
        let questData = null;
        
        // 從各類別尋找任務
        for (const category of Object.values(quest)) {
            questData = category.find(q => q.id === questId);
            if (questData) break;
        }

        if (!questData) {
            // 可能是 active 或 completed
            questData = questManager.getActiveQuests().find(q => q.id === questId) ||
                       questManager.getCompletedQuests().find(q => q.id === questId);
        }

        if (!questData) {
            this.clearDetail();
            return;
        }

        const state = questData.state || questManager.getQuestState(questId);

        // 顯示詳情面板
        this.dom.detailPlaceholder.classList.add('hidden');
        this.dom.detailContent.classList.remove('hidden');

        // 基本資訊
        this.dom.detailIcon.textContent = questData.icon || '📜';
        this.dom.detailName.textContent = questData.name;
        this.dom.detailType.textContent = this.getTypeText(questData.type);
        this.dom.detailType.className = `quest-type-badge type-${questData.type}`;

        // NPC 對話
        if (questData.npc) {
            this.dom.npcAvatar.textContent = questData.npc.avatar || '👨';
            this.dom.npcName.textContent = questData.npc.name || '???';
        }

        // 根據狀態顯示不同對話
        let dialogueText = questData.description;
        if (questData.dialogue) {
            if (state.status === QuestStatus.AVAILABLE) {
                dialogueText = questData.dialogue.start || questData.description;
            } else if (state.status === QuestStatus.ACTIVE) {
                dialogueText = questData.dialogue.progress || questData.description;
            } else if (state.status === QuestStatus.COMPLETED) {
                dialogueText = questData.dialogue.complete || '任務完成！請領取獎勵。';
            }
        }
        this.dom.detailDialogue.textContent = dialogueText;

        // 任務目標
        this.renderObjectives(questData.objectives, state.progress);

        // 任務獎勵
        this.renderRewards(questData.rewards);

        // 操作按鈕
        this.updateActionButtons(state.status, questData.type);
    }

    renderObjectives(objectives, progress = []) {
        this.dom.detailObjectives.innerHTML = '';

        objectives.forEach((obj, index) => {
            const prog = progress[index];
            const current = prog?.current || 0;
            const required = obj.count;
            const isComplete = current >= required;

            const li = document.createElement('li');
            li.className = `objective-item ${isComplete ? 'completed' : ''}`;
            li.innerHTML = `
                <span class="objective-icon">${isComplete ? '✅' : '⬜'}</span>
                <span class="objective-text">${obj.description || this.getObjectiveText(obj)}</span>
                <span class="objective-progress">${current}/${required}</span>
            `;
            this.dom.detailObjectives.appendChild(li);
        });
    }

    getObjectiveText(obj) {
        const typeTexts = {
            [ObjectiveType.KILL]: `擊敗 ${obj.target}`,
            [ObjectiveType.COLLECT]: `收集 ${obj.target}`,
            [ObjectiveType.GOLD]: `獲得 ${obj.count} 金幣`,
            [ObjectiveType.ENHANCE]: `強化裝備到 +${obj.count}`,
            [ObjectiveType.GAMBLE_WIN]: `賭博勝利 ${obj.count} 次`,
            [ObjectiveType.GAMBLE_PROFIT]: `賭博獲利 ${obj.count} 金幣`,
            [ObjectiveType.EXPLORE]: `探索 ${obj.target}`,
            [ObjectiveType.EVENT]: `觸發隨機事件`,
            [ObjectiveType.TALK]: `與 ${obj.target} 交談`,
            [ObjectiveType.CUSTOM]: obj.description
        };
        return typeTexts[obj.type] || obj.description;
    }

    renderRewards(rewards) {
        this.dom.detailRewards.innerHTML = '';

        if (rewards.gold) {
            const el = document.createElement('div');
            el.className = 'reward-item';
            el.innerHTML = `
                <span class="reward-icon">💰</span>
                <span class="reward-value">${rewards.gold}</span>
            `;
            this.dom.detailRewards.appendChild(el);
        }

        if (rewards.exp) {
            const el = document.createElement('div');
            el.className = 'reward-item';
            el.innerHTML = `
                <span class="reward-icon">⭐</span>
                <span class="reward-value">${rewards.exp} EXP</span>
            `;
            this.dom.detailRewards.appendChild(el);
        }

        if (rewards.items && rewards.items.length > 0) {
            rewards.items.forEach(itemId => {
                const itemData = QuestRewardItems[itemId];
                if (itemData) {
                    const el = document.createElement('div');
                    el.className = `reward-item rarity-${itemData.rarity || 'common'}`;
                    el.innerHTML = `
                        <span class="reward-icon">${itemData.icon || '📦'}</span>
                        <span class="reward-name">${itemData.name}</span>
                    `;
                    el.title = itemData.description || itemData.name;
                    this.dom.detailRewards.appendChild(el);
                }
            });
        }
    }

    getTypeText(type) {
        const texts = {
            [QuestType.MAIN]: '主線',
            [QuestType.BOUNTY]: '懸賞',
            [QuestType.COMMISSION]: '委託',
            [QuestType.HIDDEN]: '神秘'
        };
        return texts[type] || '任務';
    }

    updateActionButtons(status, questType) {
        // 隱藏所有按鈕
        this.dom.btnAccept.classList.add('hidden');
        this.dom.btnAbandon.classList.add('hidden');
        this.dom.btnComplete.classList.add('hidden');

        switch (status) {
            case QuestStatus.AVAILABLE:
                this.dom.btnAccept.classList.remove('hidden');
                break;
            case QuestStatus.ACTIVE:
                // 主線不可放棄
                if (questType !== QuestType.MAIN) {
                    this.dom.btnAbandon.classList.remove('hidden');
                }
                break;
            case QuestStatus.COMPLETED:
                this.dom.btnComplete.classList.remove('hidden');
                break;
        }
    }

    clearDetail() {
        this.selectedQuestId = null;
        this.dom.detailPlaceholder.classList.remove('hidden');
        this.dom.detailContent.classList.add('hidden');
    }

    updateSummary() {
        const active = questManager.getActiveQuests().length;
        const completed = questManager.getCompletedQuests().length;
        
        // 計算已完成數
        let finished = 0;
        for (const [_, state] of Object.entries(questManager.questStates)) {
            if (state.status === QuestStatus.FINISHED) finished++;
        }

        this.dom.summaryActive.textContent = active;
        this.dom.summaryCompleted.textContent = completed;
        this.dom.summaryFinished.textContent = finished;
    }

    onQuestEvent(eventType, data) {
        switch (eventType) {
            case 'quest_accepted':
            case 'quest_abandoned':
            case 'quest_completed':
            case 'quest_unlocked':
                this.renderQuestList();
                this.updateSummary();
                break;
            case 'progress_updated':
                if (data.questId === this.selectedQuestId) {
                    this.renderQuestDetail(this.selectedQuestId);
                }
                // 更新列表項進度條
                this.renderQuestList();
                break;
            case 'hidden_quest_discovered':
                this.showNotification('發現隱藏任務！', `「${data.quest.name}」已解鎖！`);
                break;
            case 'quest_ready':
                this.showNotification('任務完成！', `「${data.quest.name}」可以領取獎勵了！`);
                break;
        }
    }

    showNotification(title, message) {
        this.dom.notificationTitle.textContent = title;
        this.dom.notificationMessage.textContent = message;
        this.dom.notification.classList.remove('hidden');

        setTimeout(() => {
            this.dom.notification.classList.add('hidden');
        }, 3000);
    }

    showRewardNotification(result) {
        let message = '獲得：';
        if (result.rewards.gold) message += `💰${result.rewards.gold} `;
        if (result.rewards.exp) message += `⭐${result.rewards.exp}EXP `;
        if (result.rewards.items.length > 0) {
            message += result.rewards.items.map(i => i.name).join('、');
        }
        
        this.showNotification('🎉 獎勵領取！', message);
    }
}
