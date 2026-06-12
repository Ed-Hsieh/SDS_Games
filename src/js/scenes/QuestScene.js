/**
 * QuestScene.js
 * 任務公告板場景 - 顯示任務列表、接取/放棄/完成任務
 */
import { questManager, QuestStatus, QuestType, ObjectiveType } from '../managers/QuestManager.js';
import { escapeHtml, getItemVisualHtml } from '../utils/ItemDisplay.js';
import { attachItemTooltip } from '../utils/ItemTooltip.js';
import { getMaterial } from '../managers/MaterialManager.js';
import { resolveItemById } from '../utils/ItemResolver.js';
import { getQuestStory } from '../data/QuestStories.js';
import { getGeneratedPortraitImage } from '../data/AssetManifest.js';

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
            btnBackLobby: this.container.querySelector('#btn-back-lobby'),
            
            // 統計
            summaryActive: this.container.querySelector('#summary-active'),
            summaryCompleted: this.container.querySelector('#summary-completed'),
            summaryFinished: this.container.querySelector('#summary-finished'),
            
            // 旅人手札不使用彈跳通知
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
        if (this.dom.listTitle) this.dom.listTitle.textContent = '所有委託';
        if (this.dom.questCount) this.dom.questCount.textContent = `${quests.length} 件委託`;
        if (this.dom.ledgerSummary) {
            const completed = questManager.getCompletedQuests().length;
            this.dom.ledgerSummary.textContent = `${quests.length} 件委託 · ${activeCount} 紀錄中 · ${completed} 可回報`;
        }

        // 清空並渲染
        this.dom.questList.innerHTML = '';
        
        if (quests.length === 0) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'quest-empty';
            emptyEl.innerHTML = `
                <div class="empty-icon">📭</div>
                <p>目前沒有新的委託紀錄</p>
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
                statusIcon = '✎';
                break;
            case QuestStatus.COMPLETED:
                statusClass = 'completed';
                statusIcon = '📌';
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
            ${state.status === QuestStatus.COMPLETED ? '<div class="reward-indicator">📌</div>' : ''}
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
            [QuestStatus.AVAILABLE]: '已聽聞',
            [QuestStatus.ACTIVE]: '紀錄中',
            [QuestStatus.COMPLETED]: '可回報',
            [QuestStatus.FINISHED]: '已記錄'
        };
        return texts[status] || '待辨認';
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
        this.dom.npcAvatar.innerHTML = this.renderQuestSpeakerAvatar(questData, story);
        this.dom.npcName.textContent = story.speaker.name || '旅途記錄';

        this.dom.detailDialogue.textContent = story.current;
        const dialogueBox = this.dom.detailDialogue?.closest('.quest-dialogue-box');
        if (dialogueBox) dialogueBox.hidden = true;

        // 任務目標
        this.renderObjectives(questData.objectives, state.progress, story);

        // 任務獎勵
        this.renderRewards(questData.rewards);

        // 操作按鈕
        this.updateActionButtons(state.status, questData.type, story);
    }

    renderQuestSpeakerAvatar(questData = {}, story = {}) {
        const npcId = story?.speaker?.npcId || story?.speaker?.id || questData.npc || '';
        const image = npcId ? getGeneratedPortraitImage(npcId) : '';
        const label = story?.speaker?.name || questData.name || '';
        if (image) {
            return `<img src="${escapeHtml(image)}" alt="${escapeHtml(label)}">`;
        }
        return escapeHtml(story?.speaker?.avatar || questData.icon || '📜');
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
        const statusText = this.getStatusText(state.status);
        const questStory = story || getQuestStory(questData, state);
        const nextStep = this.getNextStepText(state.status, safeProgressInfo, questStory);
        const thought = this.getQuestThoughtText(state.status, nextStep, questStory, safeProgressInfo, questData);
        const progressText = safeProgressInfo.required > 0
            ? `${safeProgressInfo.current}/${safeProgressInfo.required}`
            : '0/0';
        summary.style.setProperty('--quest-progress', `${safeProgressInfo.percent}%`);

        summary.innerHTML = `
            <div class="quest-note-meta" aria-label="委託來源">
                <span><b>來源</b>${escapeHtml(questStory.source)}</span>
                <span><b>地點</b>${escapeHtml(questStory.location)}</span>
                <span><b>篇章</b>${escapeHtml(questStory.arc)}</span>
                <span><b>狀態</b>${escapeHtml(statusText)}</span>
            </div>
            <section class="quest-note-current" aria-label="目前紀錄">
                <div class="quest-note-speaker">
                    <span class="quest-note-avatar">${this.renderQuestSpeakerAvatar(questData, questStory)}</span>
                    <span>
                        <b>${escapeHtml(questStory.speaker?.name || '旅途記錄')}</b>
                        <small>目前紀錄</small>
                    </span>
                </div>
                <p>${escapeHtml(questStory.current)}</p>
            </section>
            <section class="quest-note-next" aria-label="玩家思考">
                <div class="quest-note-next-copy">
                    <span>我在想</span>
                    <strong>${escapeHtml(thought.title)}</strong>
                    <p>${escapeHtml(thought.description)}</p>
                </div>
                <div class="quest-note-progress" aria-label="任務補齊程度">
                    <strong>${escapeHtml(progressText)}</strong>
                    <span>${safeProgressInfo.percent}% 補齊</span>
                </div>
            </section>
            <div class="quest-note-meter" aria-label="任務總進度">
                <div class="quest-note-meter-fill"></div>
            </div>
        `;
    }

    getPlayerThoughtText(status, nextStep, story = null, progressInfo = null) {
        const lead = story?.nextLead || nextStep?.description || '';
        if (status === QuestStatus.AVAILABLE) {
            return {
                title: '我現在是否該先把這件事記下來？',
                description: '這還只是聽聞。先收入旅人手札，之後才知道哪些空白需要自己去補。'
            };
        }

        if (status === QuestStatus.ACTIVE) {
            if (progressInfo?.percent >= 100) {
                return {
                    title: '我現在是否可以回去整理結果？',
                    description: '手札裡該補的部分已經差不多了，接下來該讓相關的人知道發生了什麼。'
                };
            }

            return {
                title: '我現在是否可以去現場看看？',
                description: lead || '手札還有空白。與其等別人把答案送上門，不如自己去確認。'
            };
        }

        if (status === QuestStatus.COMPLETED) {
            const reportName = story?.reportTo?.name || '委託人';
            return {
                title: `我現在是否該回去找${reportName}？`,
                description: '事情已經有結果了。直接在手札裡結案太像自言自語，還是找當事人說清楚。'
            };
        }

        if (status === QuestStatus.FINISHED) {
            return {
                title: '這件事暫時告一段落了嗎？',
                description: '紀錄已經歸檔，但它造成的變化可能還留在城鎮、人物或下一段旅程裡。'
            };
        }

        return {
            title: '我現在是否該重新讀一遍？',
            description: lead || '先把這段紀錄看懂，再決定要往哪裡走。'
        };
    }

    getQuestThoughtText(status, nextStep, story = null, progressInfo = null, questData = null) {
        const speakerName = story?.speaker?.name || questData?.npcName || '對方';
        const reportName = story?.reportTo?.name || speakerName || '委託人';
        const lead = story?.nextLead || nextStep?.description || '';
        const nextObjective = progressInfo?.nextObjective || null;
        const objectiveText = nextObjective
            ? (this.getStoryObjectiveText(story, nextObjective.index) || nextObjective.description || this.getObjectiveText(nextObjective))
            : '';
        const cleanObjective = String(objectiveText || '').replace(/[。.]$/, '');

        if (status === QuestStatus.AVAILABLE) {
            return {
                title: '我現在是否該把這件事記下來？',
                description: `${speakerName}把事情說到這裡，剩下的部分得靠我親自確認。`
            };
        }

        if (status === QuestStatus.ACTIVE) {
            if (progressInfo?.percent >= 100) {
                return {
                    title: `我現在是否可以回去找${reportName}？`,
                    description: '手上的紀錄已經足夠，接下來該把現場看到的事交回給真正等消息的人。'
                };
            }

            switch (nextObjective?.type) {
                case ObjectiveType.KILL:
                    return {
                        title: '我現在是否該去處理那些怪物？',
                        description: cleanObjective
                            ? `${cleanObjective}。這不是單純狩獵，而是在確認異常從哪裡開始擴散。`
                            : lead || '現場還有怪物活動的痕跡，先把威脅壓下來比較穩。'
                    };
                case ObjectiveType.COLLECT:
                    return {
                        title: '我現在是否該先找齊需要的東西？',
                        description: cleanObjective
                            ? `${cleanObjective}。材料本身也許能說明委託人沒說出口的原因。`
                            : lead || '先把缺的東西帶回來，事情才會有下一段。'
                    };
                case ObjectiveType.EXPLORE:
                    return {
                        title: '我現在是否該去現場走一圈？',
                        description: cleanObjective
                            ? `${cleanObjective}。聽來的消息只能當方向，地上的痕跡才會說實話。`
                            : lead || '先去指定地點確認環境，別急著把傳聞當答案。'
                    };
                case ObjectiveType.TALK:
                    return {
                        title: '我現在是否該先找人問清楚？',
                        description: cleanObjective
                            ? `${cleanObjective}。這件事的重點也許藏在對方選擇不明說的地方。`
                            : lead || '回到城鎮問清楚，應該能少走一段冤枉路。'
                    };
                case ObjectiveType.CRAFT:
                case ObjectiveType.ENHANCE:
                    return {
                        title: '我現在是否可以回工坊準備？',
                        description: cleanObjective
                            ? `${cleanObjective}。裝備整理好，後面的路才不會只靠運氣。`
                            : lead || '先把裝備路線補上，下一場戰鬥會更有把握。'
                    };
                case ObjectiveType.DUNGEON_FLOOR:
                case ObjectiveType.DUNGEON_CLEAR:
                case ObjectiveType.DUNGEON_BOSS:
                    return {
                        title: '我現在是否該深入副本確認？',
                        description: cleanObjective
                            ? `${cleanObjective}。副本裡留下的東西，通常比城裡的傳聞更接近真相。`
                            : lead || '副本還有沒有被確認的部分，得親自走進去才知道。'
                    };
                default:
                    return {
                        title: '我現在是否該補上下一段紀錄？',
                        description: cleanObjective || lead || '這件事還沒有完整答案，先照目前的線索往前推。'
                    };
            }
        }

        if (status === QuestStatus.COMPLETED) {
            return {
                title: `我現在是否該回去找${reportName}？`,
                description: '事情已經有了結果，但它還沒有回到該聽見結果的人手上。'
            };
        }

        if (status === QuestStatus.FINISHED) {
            return {
                title: '這段紀錄已經收進手札。',
                description: story?.finished || '事情留下了結果，也讓城鎮多了一段能被回頭翻到的記憶。'
            };
        }

        return {
            title: '我現在是否該重新整理這件事？',
            description: lead || '目前紀錄還不完整，先看下一個能被確認的方向。'
        };
    }

    renderObjectives(objectives, progress = [], story = null) {
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
            const objectiveText = this.getStoryObjectiveText(story, index) || obj.description || this.getObjectiveText(obj);
            li.innerHTML = `
                <span class="objective-icon">${isComplete ? '✅' : '⬜'}</span>
                <span class="objective-text">${escapeHtml(objectiveText)}</span>
                <span class="objective-progress">紀錄 ${current}/${required}</span>
                <span class="objective-meter"><span class="objective-meter-fill"></span></span>
            `;
            this.dom.detailObjectives.appendChild(li);
        });
    }

    getStoryObjectiveText(story, index) {
        const entry = story?.objectives?.[index];
        if (typeof entry === 'string') return entry;
        if (entry && typeof entry.text === 'string') return entry.text;
        return '';
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
                        <span class="reward-icon">${getItemVisualHtml(itemData, '📦')}</span>
                        <span class="reward-name">${escapeHtml(itemData.name)}</span>
                    `;
                    attachItemTooltip(el, itemData, { hint: '任務獎勵' });
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
                    <span class="reward-icon">${material ? getItemVisualHtml(material, '◇') : '◇'}</span>
                    <span class="reward-name">${escapeHtml(material?.name || entry.id)} x${entry.quantity || 1}</span>
                `;
                if (material) attachItemTooltip(el, material, { quantity: entry.quantity || 1, hint: '任務獎勵' });
                else el.title = entry.id;
                this.dom.detailRewards.appendChild(el);
            });
        }
    }

    getTypeText(type) {
        const texts = {
            [QuestType.MAIN]: '主脈絡',
            [QuestType.BOUNTY]: '城鎮聽聞',
            [QuestType.COMMISSION]: '人物請託',
            [QuestType.HIDDEN]: '未明'
        };
        return texts[type] || '紀錄';
    }

    getObjectiveProgressInfo(objectives = [], progress = []) {
        const list = Array.isArray(objectives) ? objectives : [];
        let completed = 0;
        let current = 0;
        let required = 0;
        let nextObjective = null;

        list.forEach((obj, index) => {
            const prog = progress?.[index];
            const requiredCount = Number(obj.count || prog?.required || 1);
            const currentCount = Math.min(Number(prog?.current || 0), requiredCount);

            current += currentCount;
            required += requiredCount;
            if (currentCount >= requiredCount) completed++;
            if (!nextObjective && currentCount < requiredCount) {
                nextObjective = {
                    ...obj,
                    index,
                    current: currentCount,
                    required: requiredCount
                };
            }
        });

        return {
            total: list.length,
            completed,
            current,
            required,
            nextObjective,
            remaining: Math.max(0, list.length - completed),
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

    getNextStepText(status, progressInfo, story = null) {
        if (status === QuestStatus.AVAILABLE) {
            return {
                title: '開始記錄',
                description: '把這段聽聞收入旅人手札，之後的探索會逐步補上空白。'
            };
        }

        if (status === QuestStatus.ACTIVE) {
            if (progressInfo.percent >= 100) {
                return {
                    title: '回城回報',
                    description: '紀錄已補齊，現在可以回到城鎮整理結果。'
                };
            }

            return {
                title: '前往現場',
                description: `還有 ${Math.max(0, progressInfo.total - progressInfo.completed)} 段紀錄需要補上。`
            };
        }

        if (status === QuestStatus.COMPLETED) {
            const reportName = story?.reportTo?.name || null;
            return {
                title: reportName ? `回去找${reportName}` : '尋找委託來源',
                description: reportName
                    ? '紀錄已補齊，回到委託人身邊把事情說清楚。'
                    : '紀錄已補齊，回到相關人物或地點確認後續。'
            };
        }

        if (status === QuestStatus.FINISHED) {
            return {
                title: '已記錄',
                description: '這段委託已整理完成，可以查看其他聽聞。'
            };
        }

        return {
            title: '查看內容',
            description: '閱讀委託內容，找出下一步。'
        };
    }

    updateActionButtons(status, questType, story = null) {
        // 隱藏所有按鈕
        this.dom.btnAccept.classList.add('hidden');
        this.dom.btnAbandon.classList.add('hidden');
        this.dom.detailActions.querySelectorAll('.quest-travel-btn').forEach(btn => btn.remove());

        switch (status) {
            case QuestStatus.AVAILABLE:
                this.dom.btnAccept.classList.remove('hidden');
                break;
            case QuestStatus.ACTIVE:
                break;
            case QuestStatus.COMPLETED:
                break;
        }

        const routeInfo = this.getQuestRouteInfo(status, story);
        if (routeInfo?.route && status !== QuestStatus.FINISHED) {
            const travelBtn = document.createElement('button');
            travelBtn.className = 'quest-btn quest-travel-btn';
            travelBtn.innerHTML = `
                <span class="btn-icon">➜</span>
                ${escapeHtml(routeInfo.label)}
            `;
            travelBtn.addEventListener('click', () => this.app.loadScene(routeInfo.route));
            this.dom.detailActions.appendChild(travelBtn);
        }
    }

    getQuestRouteInfo(status, story = null) {
        if (status === QuestStatus.COMPLETED) {
            const report = story?.reportTo || {};
            if (!report.name && story?.route) {
                return {
                    route: story.route,
                    label: `回到${this.getRouteText(story.route)}確認`
                };
            }

            const name = report.name || '委託人';
            return {
                route: report.route || 'lobby',
                label: report.label || `回去找${name}`
            };
        }

        if (story?.route) {
            return {
                route: story.route,
                label: `前往${this.getRouteText(story.route)}`
            };
        }

        return null;
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
                this.showNotification('新的聽聞', `「${data.quest.name}」已寫入旅人手札。`);
                break;
            case 'quest_ready':
                this.showNotification('紀錄補齊', `「${data.quest.name}」可以回去找委託人。`);
                break;
        }
    }

    showNotification(title, message) {
        if (this.dom.ledgerSummary) {
            this.dom.ledgerSummary.textContent = message || title || '';
        }
    }

}
