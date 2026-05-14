/**
 * QuestScene.js
 * 任務公告板場景 - 顯示任務列表、接取/放棄/完成任務
 */
import { questManager, QuestStatus, QuestType, ObjectiveType } from '../managers/QuestManager.js';
import { escapeHtml } from '../utils/ItemDisplay.js';
import { getMaterial } from '../managers/MaterialManager.js';
import { resolveItemById } from '../utils/ItemResolver.js';
import { getQuestStory } from '../data/QuestStories.js';

export default class QuestScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.selectedQuestId = null;
        
        this.onQuestEvent = this.onQuestEvent.bind(this);
        this.updateSummary = this.updateSummary.bind(this);
    }

    init() {
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
    }

    cacheDOM() {
        this.dom = {
            ledgerSummary: this.container.querySelector('#ledger-summary'),

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
            
            // 線索簿不使用彈跳通知
        };
    }

    bindEvents() {
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

    renderQuestList() {
        const quests = this.getStoryQuestList();

        // 更新進行中數量
        const activeCount = questManager.getActiveQuests().length + 
                           questManager.getCompletedQuests().length;
        if (this.dom.listTitle) this.dom.listTitle.textContent = '所有線索';
        if (this.dom.questCount) this.dom.questCount.textContent = `${quests.length} 條線索`;
        if (this.dom.ledgerSummary) {
            const completed = questManager.getCompletedQuests().length;
            this.dom.ledgerSummary.textContent = `${quests.length} 條線索 · ${activeCount} 進行中 · ${completed} 可領取`;
        }

        // 清空並渲染
        this.dom.questList.innerHTML = '';
        
        if (quests.length === 0) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'quest-empty';
            emptyEl.innerHTML = `
                <div class="empty-icon">📭</div>
                <p>目前沒有新的故事線索</p>
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
        const progressInfo = this.getObjectiveProgressInfo(quest.objectives, state.progress);
        const rewardHint = this.getRewardSummary(quest.rewards);
        const story = getQuestStory(quest, state);
        
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
        if (quest.id === this.selectedQuestId) el.classList.add('selected');

        // 進度條（僅進行中顯示）
        let progressHTML = '';
        if (state.status === QuestStatus.ACTIVE && state.progress) {
            el.style.setProperty('--quest-list-progress', `${progressInfo.percent}%`);
            progressHTML = `
                <div class="quest-progress-bar">
                    <div class="progress-fill"></div>
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
                <div class="quest-item-meta">
                    <span>${this.getTypeText(quest.type)}</span>
                    <span>${escapeHtml(story.source)}</span>
                    <span>${rewardHint}</span>
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

    getStoryQuestList() {
        const visibleQuests = questManager.getVisibleQuests();
        const quests = Object.values(visibleQuests).flat();
        const statusRank = {
            [QuestStatus.COMPLETED]: 0,
            [QuestStatus.ACTIVE]: 1,
            [QuestStatus.AVAILABLE]: 2,
            [QuestStatus.FINISHED]: 3
        };

        return quests.sort((a, b) => {
            const stateA = a.state || questManager.getQuestState(a.id);
            const stateB = b.state || questManager.getQuestState(b.id);
            const rankDiff = (statusRank[stateA.status] ?? 9) - (statusRank[stateB.status] ?? 9);
            if (rankDiff !== 0) return rankDiff;

            const storyA = getQuestStory(a, stateA);
            const storyB = getQuestStory(b, stateB);
            const arcDiff = storyA.arc.localeCompare(storyB.arc, 'zh-Hant');
            if (arcDiff !== 0) return arcDiff;

            const chapterDiff = (Number(a.chapter) || 0) - (Number(b.chapter) || 0);
            if (chapterDiff !== 0) return chapterDiff;
            return String(a.name).localeCompare(String(b.name), 'zh-Hant');
        });
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
        let questData = this.getStoryQuestList().find(q => q.id === questId);

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
        const progressInfo = this.getObjectiveProgressInfo(questData.objectives, state.progress);
        const story = getQuestStory(questData, state);

        // 顯示詳情面板
        this.dom.detailPlaceholder.classList.add('hidden');
        this.dom.detailContent.classList.remove('hidden');
        this.dom.detailContent.dataset.status = state.status;
        this.dom.detailContent.style.setProperty('--quest-progress', `${progressInfo.percent}%`);

        // 基本資訊
        this.dom.detailIcon.textContent = questData.icon || '📜';
        this.dom.detailName.textContent = questData.name;
        this.dom.detailType.textContent = this.getTypeText(questData.type);
        this.dom.detailType.className = `quest-type-badge type-${questData.type}`;
        this.renderDetailSummary(questData, state, progressInfo, story);

        // 故事敘事者
        this.dom.npcAvatar.textContent = story.speaker.avatar || questData.icon || '📜';
        this.dom.npcName.textContent = story.speaker.name || '旅途記錄';

        this.dom.detailDialogue.textContent = story.current;

        // 任務目標
        this.renderObjectives(questData.objectives, state.progress);

        // 任務獎勵
        this.renderRewards(questData.rewards);

        // 操作按鈕
        this.updateActionButtons(state.status, questData.type, story);
    }

    renderDetailSummary(questData, state, progressInfo = null, story = null) {
        if (!this.dom.detailContent) return;

        let summary = this.dom.detailContent.querySelector('.quest-detail-summary');
        if (!summary) {
            summary = document.createElement('div');
            summary.className = 'quest-detail-summary';
            const header = this.dom.detailContent.querySelector('.detail-header');
            if (header) header.insertAdjacentElement('afterend', summary);
            else this.dom.detailContent.prepend(summary);
        }

        const safeProgressInfo = progressInfo || this.getObjectiveProgressInfo(questData.objectives, state.progress);
        const rewardSummary = this.getRewardSummary(questData.rewards);
        const statusText = this.getStatusText(state.status);
        const focusText = this.getQuestFocusText(state.status, safeProgressInfo);
        const nextStep = this.getNextStepText(state.status, safeProgressInfo);
        const questStory = story || getQuestStory(questData, state);
        summary.style.setProperty('--quest-progress', `${safeProgressInfo.percent}%`);

        summary.innerHTML = `
            <div class="quest-story-strip">
                <div class="quest-story-chip">
                    <span>篇章</span>
                    <strong>${escapeHtml(questStory.arc)}</strong>
                </div>
                <div class="quest-story-chip">
                    <span>線索來源</span>
                    <strong>${escapeHtml(questStory.source)}</strong>
                </div>
                <div class="quest-story-chip">
                    <span>地點</span>
                    <strong>${escapeHtml(questStory.location)}</strong>
                </div>
            </div>
            <div class="quest-story-brief">
                <span class="story-brief-label">發現</span>
                <p>${escapeHtml(questStory.discovery)}</p>
            </div>
            <div class="quest-readout">
                <div class="quest-readout-copy">
                    <span class="readout-label">下一步</span>
                    <strong>${escapeHtml(nextStep.title)}</strong>
                    <span>${escapeHtml(questStory.nextLead || nextStep.description)}</span>
                </div>
                <div class="quest-readout-progress" aria-label="任務完成度">
                    <strong>${safeProgressInfo.percent}%</strong>
                    <span>完成度</span>
                </div>
            </div>
            <div class="quest-summary-grid">
                <div class="quest-summary-card">
                    <span class="summary-label">狀態</span>
                    <strong>${escapeHtml(statusText)}</strong>
                    <span>${escapeHtml(this.getStatusActionText(state.status))}</span>
                </div>
                <div class="quest-summary-card">
                    <span class="summary-label">目標</span>
                    <strong>${safeProgressInfo.completed}/${safeProgressInfo.total || 0}</strong>
                    <span>${safeProgressInfo.required > 0 ? `總進度 ${safeProgressInfo.current}/${safeProgressInfo.required}` : '閱讀任務說明'}</span>
                </div>
                <div class="quest-summary-card">
                    <span class="summary-label">獎勵</span>
                    <strong>${escapeHtml(rewardSummary)}</strong>
                    <span>完成後可領取</span>
                </div>
            </div>
            <div class="quest-progress-meter" aria-label="任務總進度">
                <div class="quest-progress-meter-fill"></div>
            </div>
            <p class="quest-detail-why">${escapeHtml(focusText)}</p>
        `;
    }

    renderObjectives(objectives, progress = []) {
        this.dom.detailObjectives.innerHTML = '';

        const list = Array.isArray(objectives) ? objectives : [];
        if (list.length === 0) {
            const li = document.createElement('li');
            li.className = 'objective-item';
            li.innerHTML = `
                <span class="objective-icon">📖</span>
                <span class="objective-text">閱讀任務內容</span>
                <span class="objective-progress">0/1</span>
                <span class="objective-meter"><span class="objective-meter-fill"></span></span>
            `;
            this.dom.detailObjectives.appendChild(li);
            return;
        }

        list.forEach((obj, index) => {
            const prog = progress[index];
            const current = prog?.current || 0;
            const required = obj.count || prog?.required || 1;
            const isComplete = current >= required;
            const percentage = required > 0 ? Math.min(100, Math.floor((current / required) * 100)) : 0;

            const li = document.createElement('li');
            li.className = `objective-item ${isComplete ? 'completed' : ''}`;
            li.style.setProperty('--objective-progress', `${percentage}%`);
            const objectiveText = obj.description || this.getObjectiveText(obj);
            li.innerHTML = `
                <span class="objective-icon">${isComplete ? '✅' : '⬜'}</span>
                <span class="objective-text">${escapeHtml(objectiveText)}</span>
                <span class="objective-progress">${current}/${required}</span>
                <span class="objective-meter"><span class="objective-meter-fill"></span></span>
            `;
            this.dom.detailObjectives.appendChild(li);
        });
    }

    getObjectiveText(obj) {
        const typeTexts = {
            [ObjectiveType.KILL]: `擊敗 ${obj.target}`,
            [ObjectiveType.COLLECT]: `收集 ${obj.target}`,
            [ObjectiveType.GOLD]: `獲得 ${obj.count} 金幣`,
            [ObjectiveType.CRAFT]: `製作 ${obj.target === 'any' ? '任意物品' : obj.target}`,
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

        if (!rewards || (!rewards.gold && !rewards.exp && (!rewards.items || rewards.items.length === 0) && (!rewards.materials || rewards.materials.length === 0))) {
            const el = document.createElement('div');
            el.className = 'reward-item reward-empty';
            el.innerHTML = `
                <span class="reward-icon">📖</span>
                <span class="reward-value">推進劇情</span>
            `;
            this.dom.detailRewards.appendChild(el);
            return;
        }

        if (rewards.gold) {
            const el = document.createElement('div');
            el.className = 'reward-item';
            el.innerHTML = `
                <span class="reward-icon">💰</span>
                <span class="reward-value"><strong>${rewards.gold}</strong><small>金幣</small></span>
            `;
            this.dom.detailRewards.appendChild(el);
        }

        if (rewards.exp) {
            const el = document.createElement('div');
            el.className = 'reward-item';
            el.innerHTML = `
                <span class="reward-icon">⭐</span>
                <span class="reward-value"><strong>${rewards.exp}</strong><small>經驗</small></span>
            `;
            this.dom.detailRewards.appendChild(el);
        }

        if (rewards.items && rewards.items.length > 0) {
            rewards.items.forEach(itemId => {
                const itemData = resolveItemById(itemId, {
                    order: ['questReward', 'material', 'equipment', 'shop', 'bossEquipment']
                });
                if (itemData) {
                    const el = document.createElement('div');
                    el.className = `reward-item rarity-${itemData.rarity || 'common'}`;
                    el.innerHTML = `
                        <span class="reward-icon">${itemData.icon || '📦'}</span>
                        <span class="reward-name">${escapeHtml(itemData.name)}</span>
                    `;
                    el.title = itemData.description || itemData.name;
                    this.dom.detailRewards.appendChild(el);
                }
            });
        }

        if (rewards.materials && rewards.materials.length > 0) {
            rewards.materials.forEach(entry => {
                const material = getMaterial(entry.id);
                const el = document.createElement('div');
                el.className = `reward-item rarity-${material?.rarity || 'common'}`;
                el.innerHTML = `
                    <span class="reward-icon">${material?.icon || '◇'}</span>
                    <span class="reward-name">${escapeHtml(material?.name || entry.id)} x${entry.quantity || 1}</span>
                `;
                el.title = material?.description || material?.name || entry.id;
                this.dom.detailRewards.appendChild(el);
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

    getObjectiveProgressInfo(objectives = [], progress = []) {
        const list = Array.isArray(objectives) ? objectives : [];
        let completed = 0;
        let current = 0;
        let required = 0;

        list.forEach((obj, index) => {
            const prog = progress?.[index];
            const requiredCount = Number(obj.count || prog?.required || 1);
            const currentCount = Math.min(Number(prog?.current || 0), requiredCount);

            current += currentCount;
            required += requiredCount;
            if (currentCount >= requiredCount) completed++;
        });

        return {
            total: list.length,
            completed,
            current,
            required,
            percent: required > 0 ? Math.min(100, Math.floor((current / required) * 100)) : 0
        };
    }

    getRewardSummary(rewards = {}) {
        const parts = [];
        if (rewards.gold) parts.push(`💰 ${rewards.gold}`);
        if (rewards.exp) parts.push(`⭐ ${rewards.exp}`);
        if (Array.isArray(rewards.items) && rewards.items.length > 0) parts.push(`🎁 ${rewards.items.length} 件`);
        if (Array.isArray(rewards.materials) && rewards.materials.length > 0) parts.push(`⛏️ ${rewards.materials.length} 種素材`);
        return parts.join(' · ') || '劇情推進';
    }

    getQuestFocusText(status, progressInfo) {
        if (status === QuestStatus.AVAILABLE) return '目標與獎勵已整理在這裡，接取後會加入進行中清單。';
        if (status === QuestStatus.ACTIVE) return progressInfo.percent >= 100
            ? '目標已達成，回到公告板即可領取獎勵。'
            : `目前完成 ${progressInfo.completed}/${progressInfo.total || 0} 個目標，優先處理下方未完成項目。`;
        if (status === QuestStatus.COMPLETED) return '條件已達成，建議先領取獎勵避免後續被忽略。';
        if (status === QuestStatus.FINISHED) return '這項任務已完成，可能已解鎖新的委託或後續任務。';
        return '閱讀目標與獎勵後再決定下一步。';
    }

    getNextStepText(status, progressInfo) {
        if (status === QuestStatus.AVAILABLE) {
            return {
                title: '接受任務',
                description: '接取後會加入進行中清單，方便追蹤目標。'
            };
        }

        if (status === QuestStatus.ACTIVE) {
            if (progressInfo.percent >= 100) {
                return {
                    title: '回來領獎',
                    description: '所有目標已達成，現在可以交付任務。'
                };
            }

            return {
                title: '完成未達成目標',
                description: `還有 ${Math.max(0, progressInfo.total - progressInfo.completed)} 個目標需要處理。`
            };
        }

        if (status === QuestStatus.COMPLETED) {
            return {
                title: '領取獎勵',
                description: '任務已完成，獎勵尚未領取。'
            };
        }

        if (status === QuestStatus.FINISHED) {
            return {
                title: '已結案',
                description: '這項任務已完成，可查看其他任務。'
            };
        }

        return {
            title: '查看內容',
            description: '閱讀任務說明、目標與獎勵。'
        };
    }

    getStatusActionText(status) {
        const texts = {
            [QuestStatus.AVAILABLE]: '可以接取',
            [QuestStatus.ACTIVE]: '追蹤中',
            [QuestStatus.COMPLETED]: '可領獎',
            [QuestStatus.FINISHED]: '已結案'
        };
        return texts[status] || '待確認';
    }

    updateActionButtons(status, questType, story = null) {
        // 隱藏所有按鈕
        this.dom.btnAccept.classList.add('hidden');
        this.dom.btnAbandon.classList.add('hidden');
        this.dom.btnComplete.classList.add('hidden');
        this.dom.detailActions.querySelectorAll('.quest-travel-btn').forEach(btn => btn.remove());

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

        if (story?.route && status !== QuestStatus.FINISHED && status !== QuestStatus.COMPLETED) {
            const travelBtn = document.createElement('button');
            travelBtn.className = 'quest-btn quest-travel-btn';
            travelBtn.innerHTML = `
                <span class="btn-icon">➜</span>
                前往${this.getRouteText(story.route)}
            `;
            travelBtn.addEventListener('click', () => this.app.loadScene(story.route));
            this.dom.detailActions.appendChild(travelBtn);
        }
    }

    getRouteText(route) {
        const texts = {
            adventure: '冒險區',
            forge: '鑄造',
            casino: '賭場',
            shop: '市集',
            tower: '無盡塔',
            'dungeon-cave': '幽暗洞窟',
            'dungeon-snow': '冰封雪峰',
            'dungeon-ruins': '遠古遺跡',
            'dungeon-jungle': '迷霧叢林',
            'dungeon-hell': '煉獄深淵',
            quest: '任務板'
        };
        return texts[route] || '目的地';
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
        if (this.dom.ledgerSummary) {
            this.dom.ledgerSummary.textContent = message || title || '';
        }
    }

    showRewardNotification(result) {
        let message = '獲得：';
        if (result.rewards.gold) message += `💰${result.rewards.gold} `;
        if (result.rewards.exp) message += `⭐${result.rewards.exp} 經驗 `;
        if (result.rewards.items.length > 0) {
            message += result.rewards.items.map(i => i.name).join('、');
        }
        const blueprintUnlocks = (result.blueprintUnlocks || []).filter(entry => entry.newlyUnlocked);
        if (blueprintUnlocks.length > 0) {
            message += ` 製作圖：${blueprintUnlocks.map(entry => entry.recipe.name).join('、')}`;
        }
        
        this.showNotification('🎉 獎勵領取！', message);
    }
}
