/**
 * QuestScene.js
 * 任務公告板場景 - 顯示任務列表、接取/放棄/完成任務
 */
import { questManager, QuestStatus, QuestType, ObjectiveType } from '../managers/QuestManager.js';
import { escapeHtml, getItemVisualHtml, ITEM_RARITY_TEXT, ITEM_TYPE_TEXT } from '../utils/ItemDisplay.js';
import { attachItemTooltip } from '../utils/ItemTooltip.js';
import { getMaterial } from '../managers/MaterialManager.js';
import { resolveItemById } from '../utils/ItemResolver.js';
import { getQuestStory } from '../data/QuestStories.js';
import { getGeneratedPortraitImage } from '../data/AssetManifest.js';
import GameManager from '../managers/GameManager.js';
import { worldStoryManager } from '../managers/WorldStoryManager.js';
import { getWorldEventJournalRecords } from '../managers/EventManager.js';
import { WorldStoryChains, TerrainEffects, ZoneProfiles } from '../data/WorldStories.js';
import { getTownPlaces } from '../data/TownPlaces.js';
import { RecipeDatabase, getMissingMaterials } from '../managers/RecipeManager.js';
import { isRecipeBlueprintKnown } from '../managers/BlueprintManager.js';
import audioManager from '../utils/AudioManager.js';

const HANDBOOK_TABS = {
    commissions: {
        title: '委託',
        panelTitle: '委託清單',
        countLabel: '件委託',
        emptyIcon: '📭',
        emptyText: '目前沒有新的委託紀錄',
        ledger: records => `${records.length} 件委託`
    },
    boss: {
        title: '首領痕跡',
        panelTitle: '追蹤中的痕跡',
        countLabel: '條痕跡線',
        emptyIcon: '🧭',
        emptyText: '還沒有足夠的首領痕跡。去現場、聽傳聞或完成委託後，筆記會自己長出下一頁。',
        ledger: records => `${records.length} 條首領痕跡`
    },
    world: {
        title: '世界見聞',
        panelTitle: '最新紀錄',
        countLabel: '則見聞',
        emptyIcon: '🗺️',
        emptyText: '還沒有留下值得翻閱的地點紀錄。走進新的地標後，這裡會記下你親眼確認的事情。',
        ledger: records => `${records.length} 則世界見聞`
    },
    forge: {
        title: '鍛造備忘',
        panelTitle: '待準備配方',
        countLabel: '則備忘',
        emptyIcon: '⚒️',
        emptyText: '目前沒有需要追的鍛造備忘。取得圖紙、缺少素材或接到工坊委託時，這裡會整理成清單。',
        ledger: records => `${records.length} 則鍛造備忘`
    },
    town: {
        title: '城鎮記憶',
        panelTitle: '留下的變化',
        countLabel: '段記憶',
        emptyIcon: '🏘️',
        emptyText: '城鎮還沒有留下明顯變化。完成主線或支線後，居民與場所的改變會收在這裡。',
        ledger: records => `${records.length} 段城鎮記憶`
    }
};

export default class QuestScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.selectedQuestId = null;
        this.selectedRecordKey = null;
        this.activeTab = 'commissions';
        
        this.onQuestEvent = this.onQuestEvent.bind(this);
        this.onGameEvent = this.onGameEvent.bind(this);
        this.updateSummary = this.updateSummary.bind(this);
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        
        // 訂閱任務系統事件
        questManager.subscribe(this.onQuestEvent);
        GameManager.subscribe(this.onGameEvent);
        
        // 初始渲染
        this.renderQuestList();
        this.updateSummary();
    }

    cleanup() {
        questManager.unsubscribe(this.onQuestEvent);
        GameManager.unsubscribe(this.onGameEvent);
    }

    cacheDOM() {
        this.dom = {
            ledgerSummary: this.container.querySelector('#ledger-summary'),
            handbookTabs: this.container.querySelector('#handbook-tabs'),
            handbookTabButtons: Array.from(this.container.querySelectorAll('[data-handbook-tab]')),
            handbookCountBadges: Array.from(this.container.querySelectorAll('[data-handbook-count]')),

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
            detailObjectivesPanel: this.container.querySelector('.quest-objectives'),
            detailObjectivesTitle: this.container.querySelector('#detail-objectives-title'),
            detailObjectives: this.container.querySelector('#detail-objectives'),
            detailRewardsPanel: this.container.querySelector('.quest-rewards'),
            detailRewardsTitle: this.container.querySelector('#detail-rewards-title'),
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
        this.dom.handbookTabButtons?.forEach(button => {
            button.addEventListener('click', () => {
                this.selectHandbookTab(button.dataset.handbookTab);
            });
        });

        // 接取任務
        this.dom.btnAccept?.addEventListener('click', () => {
            if (this.selectedQuestId) {
                const result = questManager.acceptQuest(this.selectedQuestId);
                if (result.success) {
                    audioManager.play('page', { throttleKey: 'quest-accept', throttleMs: 180 });
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
                    audioManager.play('toast-warning', { throttleKey: 'quest-abandon', throttleMs: 180 });
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

    selectHandbookTab(tabId) {
        if (!HANDBOOK_TABS[tabId] || tabId === this.activeTab) return;
        audioManager.play('page', { throttleKey: 'quest-tab-page', throttleMs: 140 });
        this.activeTab = tabId;
        this.selectedRecordKey = null;
        this.selectedQuestId = null;

        this.dom.handbookTabButtons?.forEach(button => {
            const active = button.dataset.handbookTab === tabId;
            button.classList.toggle('active', active);
            button.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        this.renderQuestList();
        this.clearDetail();
    }

    renderQuestList() {
        const records = this.getHandbookRecords(this.activeTab);
        const tab = HANDBOOK_TABS[this.activeTab] || HANDBOOK_TABS.commissions;

        this.updateHandbookCounts();
        if (this.dom.listTitle) this.dom.listTitle.textContent = tab.panelTitle || '紀錄清單';
        if (this.dom.questCount) this.dom.questCount.textContent = records.length > 0 ? `${records.length} 筆` : '空白';
        if (this.dom.ledgerSummary) {
            this.dom.ledgerSummary.textContent = this.getLedgerSummary(this.activeTab, records);
        }

        this.dom.questList.innerHTML = '';
        
        if (records.length === 0) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'quest-empty';
            emptyEl.innerHTML = `
                <div class="empty-icon">${tab.emptyIcon}</div>
                <p>${escapeHtml(tab.emptyText)}</p>
            `;
            this.dom.questList.appendChild(emptyEl);
            return;
        }

        records.forEach(record => {
            const recordEl = record.kind === 'quest'
                ? this.createQuestListItem(record.quest)
                : this.createHandbookRecordItem(record);
            this.dom.questList.appendChild(recordEl);
        });
    }

    refreshHandbook(options = {}) {
        const preserveDetail = options.preserveDetail !== false;
        const selectedKey = this.selectedRecordKey;
        const selectedQuestId = this.selectedQuestId;

        this.renderQuestList();
        this.updateSummary();

        if (!preserveDetail) return;

        if (selectedQuestId) {
            const exists = this.getStoryQuestList().some(quest => quest.id === selectedQuestId);
            if (exists) this.renderQuestDetail(selectedQuestId);
            else this.clearDetail();
            return;
        }

        if (selectedKey) {
            const record = this.getHandbookRecords(this.activeTab).find(item => item.key === selectedKey);
            if (record) {
                this.selectedRecordKey = selectedKey;
                this.renderHandbookRecordDetail(record);
                this.dom.questList?.querySelectorAll('.quest-list-item').forEach(item => {
                    item.classList.toggle('selected', item.dataset.recordKey === selectedKey);
                });
            } else {
                this.clearDetail();
            }
        }
    }

    getLedgerSummary(tabId, records) {
        if (tabId === 'commissions') {
            const activeCount = questManager.getActiveQuests().length + questManager.getCompletedQuests().length;
            const completed = questManager.getCompletedQuests().length;
            return `${records.length} 件委託 · ${activeCount} 追蹤中 · ${completed} 待回報`;
        }

        const tab = HANDBOOK_TABS[tabId] || HANDBOOK_TABS.commissions;
        return tab.ledger(records);
    }

    updateHandbookCounts() {
        const counts = {
            commissions: this.getStoryQuestList().length,
            boss: this.getBossTraceRecords().length,
            world: this.getWorldNoteRecords().length,
            forge: this.getForgeMemoRecords().length,
            town: this.getTownMemoryRecords().length
        };

        this.dom.handbookCountBadges?.forEach(badge => {
            const key = badge.dataset.handbookCount;
            badge.textContent = counts[key] ?? 0;
        });
    }

    getHandbookRecords(tabId) {
        switch (tabId) {
            case 'boss':
                return this.getBossTraceRecords();
            case 'world':
                return this.getWorldNoteRecords();
            case 'forge':
                return this.getForgeMemoRecords();
            case 'town':
                return this.getTownMemoryRecords();
            case 'commissions':
            default:
                return this.getStoryQuestList().map(quest => ({
                    key: `quest:${quest.id}`,
                    kind: 'quest',
                    quest
                }));
        }
    }

    createQuestListItem(quest) {
        const el = document.createElement('button');
        el.type = 'button';
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
        el.setAttribute('aria-pressed', quest.id === this.selectedQuestId ? 'true' : 'false');

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

    createHandbookRecordItem(record) {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = `quest-list-item handbook-record-item ${record.statusTone || 'available'}`;
        el.dataset.recordKey = record.key;
        if (record.key === this.selectedRecordKey) el.classList.add('selected');
        el.setAttribute('aria-pressed', record.key === this.selectedRecordKey ? 'true' : 'false');

        const listMeta = Array.isArray(record.listMeta) ? record.listMeta : record.meta;
        const meta = Array.isArray(listMeta)
            ? listMeta.filter(Boolean).slice(0, 3)
            : [];
        const progressHTML = record.progress
            ? `
                <div class="quest-progress-bar">
                    <div class="progress-fill"></div>
                </div>
            `
            : '';
        if (record.progress) {
            el.style.setProperty('--quest-list-progress', `${record.progress.percent || 0}%`);
        }

        el.innerHTML = `
            <div class="quest-item-icon">${this.renderHandbookRecordIcon(record, 'handbook-list-image')}</div>
            <div class="quest-item-info">
                <div class="quest-item-name">${escapeHtml(record.title)}</div>
                <div class="quest-item-status">
                    <span class="status-icon">${escapeHtml(record.statusIcon || '✎')}</span>
                    <span class="status-text">${escapeHtml(record.statusText || '已記錄')}</span>
                </div>
                <div class="quest-item-meta">
                    ${meta.map(text => `<span>${escapeHtml(text)}</span>`).join('')}
                </div>
                ${progressHTML}
            </div>
        `;

        el.addEventListener('click', () => {
            this.selectHandbookRecord(record.key);
        });

        return el;
    }

    renderHandbookRecordIcon(record = {}, extraClass = 'handbook-icon-image') {
        const item = record.visualItem
            || record.item
            || (record.itemId ? resolveItemById(record.itemId) : null);

        if (item) {
            return getItemVisualHtml(item, record.icon || '◆', extraClass);
        }

        return escapeHtml(record.icon || '◆');
    }

    getBossTraceRecords() {
        return Object.keys(WorldStoryChains)
            .map(chainId => worldStoryManager.getBossFlowStatus(chainId))
            .filter(status => status && (
                status.discoveredClues?.length > 0 ||
                status.completedProgress > 0 ||
                status.finalReady
            ))
            .sort((a, b) => {
                const readyDiff = Number(b.finalReady) - Number(a.finalReady);
                if (readyDiff !== 0) return readyDiff;
                const progressDiff = (b.discoveredClues.length + b.completedProgress) - (a.discoveredClues.length + a.completedProgress);
                if (progressDiff !== 0) return progressDiff;
                return String(a.title).localeCompare(String(b.title), 'zh-Hant');
            })
            .map(status => {
                const required = Math.max(1, (status.requiredClues || 0) + (status.requiredProgress || 0));
                const current = Math.min(status.discoveredClues.length, status.requiredClues || status.discoveredClues.length) +
                    Math.min(status.completedProgress || 0, status.requiredProgress || 0);
                const nextProgress = status.progressMethods?.find(method => !method.completed);
                const lastClue = status.discoveredClues?.[status.discoveredClues.length - 1];
                const finalLabel = status.finalTrigger?.label || '確認首領現身方式';
                const traceType = status.archetype || status.method || '痕跡型';
                const currentText = status.finalReady
                    ? `痕跡已足夠清楚。現在可以嘗試「${finalLabel}」。`
                    : lastClue?.lead || lastClue?.text || status.text || '痕跡還不完整，需要更多現場確認。';

                return {
                    key: `boss:${status.id}`,
                    kind: 'boss',
                    icon: '🧭',
                    title: status.title,
                    typeLabel: traceType,
                    hideSummaryMeta: true,
                    summaryLabel: '首領痕跡',
                    summaryHint: status.finalReady ? '決戰就緒' : '線索未收束',
                    statusIcon: status.finalReady ? '⚠' : '✎',
                    statusText: status.finalReady ? '決戰就緒' : `${status.discoveredClues.length} 段痕跡`,
                    statusTone: status.finalReady ? 'completed' : 'active',
                    listMeta: [
                        traceType,
                        `痕跡 ${status.discoveredClues.length}/${status.requiredClues || '?'}`,
                        status.finalReady ? finalLabel : nextProgress?.label || '回現場確認'
                    ],
                    cues: [
                        status.finalReady ? '痕跡已收束' : nextProgress ? `下一步：${nextProgress.label}` : '回現場確認',
                        `行動 ${status.completedProgress || 0}/${status.requiredProgress || '?'}`
                    ],
                    current: currentText,
                    thoughtTitle: status.finalReady
                        ? `我現在是否可以${finalLabel}？`
                        : nextProgress
                            ? `我現在是否該先${nextProgress.label}？`
                            : '我現在是否該再回現場確認？',
                    thoughtText: status.finalReady
                        ? '危險已經收束到一個方向；要不要踏進去，取決於你現在的裝備與狀態。'
                        : '線索還沒有收束。先補上下一個能確認的行動，讓這條筆記不只是猜測。',
                    progress: {
                        current,
                        required,
                        percent: Math.min(100, Math.floor((current / required) * 100))
                    },
                    sections: [
                        {
                            title: `${traceType}輪廓`,
                            lines: [status.text || '這條痕跡還在整理。']
                        },
                        {
                            title: '掌握的痕跡',
                            lines: status.discoveredClues.length > 0
                                ? status.discoveredClues.map(clue => `${clue.title}：${clue.lead || clue.text}`)
                                : ['還沒有可靠痕跡。']
                        },
                        {
                            title: status.finalReady ? '可踏入的地方' : '下一步',
                            lines: [status.finalReady ? finalLabel : nextProgress?.label || '回到冒險區尋找新的痕跡。']
                        }
                    ],
                    route: 'adventure',
                    routeLabel: '前往冒險區確認痕跡'
                };
            });
    }

    getWorldNoteRecords() {
        const landmarkRecords = worldStoryManager.getVisitedLandmarks()
            .sort((a, b) => (Number(a.chapter) || 0) - (Number(b.chapter) || 0) || String(a.name).localeCompare(String(b.name), 'zh-Hant'))
            .map(landmark => {
                const zones = (landmark.zones || [])
                    .map(zoneId => ZoneProfiles[zoneId]?.name || zoneId)
                    .filter(Boolean);
                const effects = (landmark.effectIds || [])
                    .map(effectId => TerrainEffects[effectId])
                    .filter(Boolean);
                const storyChains = (landmark.storyChainIds || [])
                    .map(chainId => WorldStoryChains[chainId]?.title)
                    .filter(Boolean);

                return {
                    key: `landmark:${landmark.id}`,
                    kind: 'world',
                    icon: landmark.icon || '🗺️',
                    title: landmark.name,
                    typeLabel: '世界見聞',
                    summaryMode: 'compact',
                    hideSummaryMeta: true,
                    summaryLabel: '地點札記',
                    summaryHint: zones[0] || `第 ${landmark.chapter || '?'} 章`,
                    statusIcon: '✓',
                    statusText: '已造訪',
                    statusTone: 'finished',
                    listMeta: [
                        `第 ${landmark.chapter || '?'} 章`,
                        zones.join(' / ') || '未知區域',
                        effects[0]?.name || storyChains[0] || '已造訪'
                    ],
                    current: landmark.repeat || landmark.arrival || landmark.mapHint || '你在這裡留下了一段地點紀錄。',
                    sections: [
                        {
                            title: '地點印象',
                            lines: [landmark.arrival || landmark.mapHint || '此處仍缺少初次到達文字。']
                        },
                        {
                            title: '環境特徵',
                            lines: effects.length > 0
                                ? effects.map(effect => `${effect.name}：${effect.summary}`)
                                : ['沒有特別標記的地形。']
                        },
                        {
                            title: '牽動的線',
                            lines: storyChains.length > 0 ? storyChains : ['這裡暫時只是一段單純的旅途記憶。']
                        }
                    ],
                    route: 'adventure',
                    routeLabel: '回到冒險地圖'
                };
            });

        const clueRecords = worldStoryManager.getDiscoveredClues()
            .sort((a, b) => (Number(a.notebookIndex) || 0) - (Number(b.notebookIndex) || 0))
            .map(clue => {
                const chainTitle = WorldStoryChains[clue.chainId]?.title || '未歸檔痕跡';
                return {
                    key: `world-clue:${clue.id}`,
                    kind: 'world',
                    icon: '✦',
                    title: clue.title,
                    typeLabel: '現場紀錄',
                    summaryMode: 'compact',
                    hideSummaryMeta: true,
                    summaryLabel: '現場札記',
                    summaryHint: `線索 ${clue.notebookIndex}`,
                    statusIcon: '✎',
                    statusText: `線索 ${clue.notebookIndex}`,
                    statusTone: 'active',
                    listMeta: [
                        `線索 ${clue.notebookIndex}`,
                        clue.source || '現場',
                        chainTitle
                    ],
                    current: clue.text || clue.lead || '這段紀錄還需要補上內容。',
                    sections: [
                        {
                            title: '看見的事',
                            lines: [clue.text || '沒有留下原始文字。']
                        },
                        {
                            title: '記下的方向',
                            lines: [clue.lead || chainTitle || '這段見聞還沒有被串回更大的脈絡。']
                        }
                    ],
                    route: 'adventure',
                    routeLabel: '回到冒險地圖'
                };
            });

        const eventRecords = getWorldEventJournalRecords()
            .map((entry, index) => ({
                key: `world-event:${entry.key || `${entry.eventId}:${index}`}`,
                kind: 'world',
                icon: entry.icon || '✦',
                title: entry.title || '旅途事件',
                typeLabel: '旅途事件',
                summaryMode: 'compact',
                hideSummaryMeta: true,
                summaryLabel: '旅途片段',
                summaryHint: entry.roleLabel || entry.zoneLabel || '已記錄',
                statusIcon: '✎',
                statusText: entry.count > 1 ? `${entry.roleLabel || '已記錄'} x${entry.count}` : entry.roleLabel || '已記錄',
                statusTone: entry.role === 'pressure' ? 'active' : 'available',
                listMeta: [
                    entry.zoneLabel || '未知地帶',
                    entry.choiceText || '未記錄選擇',
                    entry.resultSummary || '沒有明顯變化'
                ],
                current: entry.description || '你在旅途中遇到一段值得回頭看的小事。',
                sections: [
                    {
                        title: '當時的選擇',
                        lines: [
                            entry.choiceText || '沒有記下選擇。',
                            entry.intent || '沒有留下選擇意圖。'
                        ]
                    },
                    {
                        title: '遭遇之後',
                        lines: (entry.resultMessages || []).length > 0
                            ? entry.resultMessages
                            : [entry.resultSummary || '沒有明顯變化。']
                    },
                    {
                        title: '下次路過',
                        lines: [entry.reflection || '這段經驗先放在手札裡，等到相似的路口再翻出來。']
                    }
                ],
                route: 'adventure',
                routeLabel: '回到冒險地圖'
            }));

        return [...eventRecords, ...clueRecords, ...landmarkRecords];
    }

    getForgeMemoRecords() {
        const craftQuestRecords = this.getStoryQuestList()
            .filter(quest => (quest.objectives || []).some(obj => [ObjectiveType.CRAFT, ObjectiveType.ENHANCE].includes(obj.type)))
            .map(quest => {
                const state = quest.state || questManager.getQuestState(quest.id);
                const progressInfo = this.getObjectiveProgressInfo(quest.objectives, state.progress);
                const story = getQuestStory(quest, state);
                const routeInfo = this.getQuestRouteInfo(state.status, story) || {
                    route: 'forge',
                    label: '前往鑄造'
                };
                return {
                    key: `forge-quest:${quest.id}`,
                    kind: 'forge',
                    icon: quest.icon || '⚒️',
                    title: quest.name,
                    typeLabel: '工坊委託',
                    statusIcon: state.status === QuestStatus.COMPLETED ? '📌' : '✎',
                    statusText: this.getStatusText(state.status),
                    statusTone: state.status === QuestStatus.COMPLETED ? 'completed' : 'active',
                    meta: [story.source, story.location, this.getTypeText(quest.type)],
                    cues: [
                        story.location || '工坊',
                        this.getStatusText(state.status),
                        progressInfo.nextObjective
                            ? this.getStoryObjectiveText(story, progressInfo.nextObjective.index) || progressInfo.nextObjective.description || '下一段準備'
                            : '可整理結果'
                    ],
                    current: story.current,
                    thoughtTitle: this.getQuestThoughtText(state.status, this.getNextStepText(state.status, progressInfo, story), story, progressInfo, quest).title,
                    thoughtText: this.getQuestThoughtText(state.status, this.getNextStepText(state.status, progressInfo, story), story, progressInfo, quest).description,
                    progress: {
                        current: progressInfo.current,
                        required: Math.max(1, progressInfo.required),
                        percent: progressInfo.percent
                    },
                    sections: [
                        {
                            title: '工坊目標',
                            lines: (quest.objectives || []).map((obj, index) => this.getStoryObjectiveText(story, index) || obj.description || this.getObjectiveText(obj))
                        }
                    ],
                    route: routeInfo.route,
                    routeLabel: routeInfo.label,
                    routeDescription: routeInfo.description,
                    reportToName: routeInfo.reportToName,
                    npcId: routeInfo.npcId
                };
            });

        const inventory = GameManager.getInventory?.() || [];
        const warehouse = GameManager.state?.warehouse || [];
        const gold = Number(GameManager.getGold?.() || 0);
        const recipeRecords = Object.values(RecipeDatabase)
            .filter(recipe => isRecipeBlueprintKnown(recipe.id))
            .map(recipe => {
                const missing = getMissingMaterials(recipe.id, inventory, warehouse);
                const cost = Number(recipe.cost || 0);
                const successRate = Number(recipe.successRate || 100);
                const recipeType = ITEM_TYPE_TEXT[recipe.type] || (recipe.type === 'equipment' ? '裝備' : recipe.type) || '裝備';
                const resultRarity = recipe.result?.rarity || recipe.rarity;
                const recipeRarity = ITEM_RARITY_TEXT[resultRarity] || resultRarity || '普通';
                const costReady = gold >= cost;
                const craftReady = missing.length === 0 && costReady;
                const goldShortage = Math.max(0, cost - gold);
                const recipeResultItem = recipe.result
                    || resolveItemById(recipe.result?.id || recipe.id)
                    || {
                        id: recipe.result?.id || recipe.id,
                        name: recipe.name,
                        icon: recipe.icon,
                        type: recipe.type,
                        rarity: resultRarity
                    };
                const missingLines = missing.map(entry => {
                    const material = getMaterial(entry.id);
                    return `${material?.name || entry.id} ${entry.owned}/${entry.required}`;
                });
                const statusText = craftReady
                    ? '可以製作'
                    : missing.length > 0 ? '素材不足' : '金幣不足';
                const statusSummary = craftReady
                    ? '材料與費用齊備'
                    : missing.length > 0 ? `缺 ${missing.length} 種素材` : `缺 ${goldShortage}G`;
                const progressRequired = Math.max(1, (recipe.materials || []).length + 1);
                const progressCurrent = Math.max(0, (recipe.materials || []).length - missing.length + (costReady ? 1 : 0));

                return {
                    key: `recipe:${recipe.id}`,
                    kind: 'forge',
                    icon: recipe.icon || '⚒️',
                    visualItem: recipeResultItem,
                    title: recipe.name,
                    typeLabel: '製作圖',
                    summaryMode: 'compact',
                    hideSummaryMeta: true,
                    summaryLabel: '鍛造備忘',
                    summaryHint: craftReady ? '可製作' : '材料缺口',
                    statusIcon: craftReady ? '✓' : '⛏',
                    statusText,
                    statusTone: craftReady ? 'completed' : 'available',
                    meta: [recipeType, recipeRarity, statusSummary],
                    metaLabels: ['類型', '稀有度'],
                    cues: [
                        statusSummary,
                        `成功率 ${successRate}%`
                    ],
                    current: craftReady
                        ? `可以前往鍛造鋪製作「${recipe.name}」。`
                        : missing.length > 0 ? `還缺 ${missing.length} 種素材，詳細缺口列在下方。` : `素材已齊，還缺製作費 ${goldShortage}G。`,
                    thoughtTitle: craftReady
                        ? '是否前往鍛造？'
                        : missing.length > 0 ? '先補哪一種素材？' : '先準備金幣',
                    thoughtText: craftReady
                        ? '材料、金幣與圖紙都在手上；這裡保留行動入口，不再重複列素材。'
                        : missing.length > 0 ? '看下方缺口後，優先去能掉落該素材的怪物、委託或副本補齊。' : '素材已足夠，先透過委託或戰鬥補足製作費。',
                    progress: {
                        current: progressCurrent,
                        required: progressRequired,
                        percent: Math.min(100, Math.floor((progressCurrent / progressRequired) * 100))
                    },
                    sections: [
                        {
                            title: craftReady ? '狀態' : '缺口',
                            lines: craftReady
                                ? ['材料與金幣已齊備。']
                                : missingLines.length > 0 ? missingLines : [`製作費 ${gold}/${cost}G`]
                        },
                        {
                            title: '配方資訊',
                            lines: [`${recipeType} / ${recipeRarity}`, `費用 ${cost}G`, `成功率 ${successRate}%`]
                        }
                    ],
                    route: 'forge',
                    routeLabel: '前往鑄造'
                };
            })
            .sort((a, b) => {
                const readyDiff = Number(b.statusTone === 'completed') - Number(a.statusTone === 'completed');
                if (readyDiff !== 0) return readyDiff;
                return String(a.title).localeCompare(String(b.title), 'zh-Hant');
            });

        return [...craftQuestRecords, ...recipeRecords];
    }

    getTownMemoryRecords() {
        const townRecords = getTownPlaces()
            .flatMap(place => (place.states || [])
                .filter(state => GameManager.getFlag(state.flag))
                .map(state => ({
                    key: `town:${place.id}:${state.flag}`,
                    kind: 'town',
                    icon: place.icon || '🏘️',
                    title: state.title,
                    typeLabel: '城鎮記憶',
                    summaryMode: 'compact',
                    hideSummaryMeta: true,
                    summaryLabel: '回城所感',
                    summaryHint: place.name,
                    statusIcon: '✓',
                    statusText: place.name,
                    statusTone: 'finished',
                    listMeta: [
                        place.name,
                        place.tag || '城鎮',
                        '回城所見'
                    ],
                    current: this.buildTownMemoryStory(place, state)[0],
                    sections: [
                        {
                            title: '城鎮變化',
                            lines: this.buildTownMemoryStory(place, state).slice(1)
                        }
                    ],
                    route: 'lobby',
                    routeLabel: '回到城鎮'
                })));
        const finale = GameManager.getFlag('world.ending.outcome');
        if (!finale?.id) return townRecords;

        const sceneLines = Array.isArray(finale.sceneLines) && finale.sceneLines.length > 0
            ? finale.sceneLines
            : [finale.summary].filter(Boolean);

        return [
            {
                key: `town:ending:${finale.id}`,
                kind: 'town',
                icon: '🌅',
                title: finale.title || '終局之後',
                typeLabel: '終局記憶',
                summaryMode: 'compact',
                hideSummaryMeta: true,
                summaryLabel: '終局回望',
                summaryHint: '終局之後',
                statusIcon: '✓',
                statusText: finale.townEcho || '終戰已留下痕跡',
                statusTone: 'finished',
                listMeta: [
                    '終局之後',
                    finale.townEcho || finale.summary || '終局已被記錄',
                    '街上仍有聲音'
                ],
                current: this.buildFinaleTownStory(finale, sceneLines)[0],
                sections: [
                    {
                        title: '城鎮變化',
                        lines: this.buildFinaleTownStory(finale, sceneLines)
                    }
                ],
                route: 'lobby',
                routeLabel: '回到城鎮'
            },
            ...townRecords
        ];
    }

    buildTownMemoryStory(place = {}, state = {}) {
        const placeName = place.name || '城裡某處';
        const tone = this.getTownMemoryTone(placeName, place);
        const placeText = tone.trace;
        const sceneText = this.buildTownMemoryEventText(place, state, tone);
        return [
            placeText,
            sceneText
        ].filter(Boolean);
    }

    buildTownMemoryEventText(place = {}, state = {}, tone = {}) {
        const title = state.title ? `「${state.title}」` : '那件事';
        const text = state.text || '街角多了一點不熟悉的痕跡。';
        const lead = String(tone.memoryLead || '{title}之後，').replace('{title}', title);
        return `${lead}${text}`;
    }

    getTownMemoryTone(placeName, place = {}) {
        const key = String(place.tag || place.id || placeName || '');
        const variants = [
            {
                match: ['中心', 'crossroads'],
                trace: '廣場石板仍被腳步磨得發亮，只是公告欄前的人停得比從前久。',
                memoryLead: '{title}貼上公告欄後，'
            },
            {
                match: ['補給', 'market'],
                trace: '帆布棚下多了湯氣與藥草味，空瓶被整齊倒扣在木架邊。',
                memoryLead: '{title}傳到棚下後，'
            },
            {
                match: ['裝備', 'forge'],
                trace: '爐火映在門縫裡，鐵砧聲比記憶裡更沉。',
                memoryLead: '{title}留在爐邊後，'
            },
            {
                match: ['紀錄', 'handbook'],
                trace: '小屋裡的紙頁疊得更高，頁角被翻出淡淡的毛邊。',
                memoryLead: '{title}被寫進頁面後，'
            },
            {
                match: ['暗流', 'alley'],
                trace: '暗巷仍窄，牆邊卻多了幾道新刮痕，像有人把消息留在陰影裡。',
                memoryLead: '{title}傳進巷尾後，'
            },
            {
                match: ['金流', 'casino'],
                trace: '賭場門縫透出暖光，桌上的笑聲短了一拍。',
                memoryLead: '{title}在桌邊被提起後，'
            },
            {
                match: ['挑戰', 'tower'],
                trace: '塔影壓在城邊，裂縫裡的風聲仍像沒停過。',
                memoryLead: '{title}之後，'
            },
            {
                match: ['出城', 'gate'],
                trace: '城門的鐵釘沾著灰，旗繩在風裡輕輕敲著木柱。',
                memoryLead: '{title}掛到門邊後，'
            }
        ];

        return variants.find(variant => variant.match.some(token => key.includes(token))) || {
            trace: `${placeName}還保留著記憶裡的輪廓，細節卻安靜地換了位置。`,
            memoryLead: '{title}之後，'
        };
    }

    buildFinaleTownStory(finale = {}, sceneLines = []) {
        const lines = Array.isArray(sceneLines) && sceneLines.length > 0
            ? sceneLines.filter(Boolean)
            : [finale.summary].filter(Boolean);
        const echo = finale.townEcho || finale.summary || '城裡的人仍然照常走過街口。';
        return [
            ...lines,
            echo
        ].filter(Boolean);
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
        this.selectedRecordKey = `quest:${questId}`;
        
        // 更新列表選中狀態
        this.dom.questList.querySelectorAll('.quest-list-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.questId === questId);
        });

        this.renderQuestDetail(questId);
    }

    selectHandbookRecord(recordKey) {
        const record = this.getHandbookRecords(this.activeTab).find(item => item.key === recordKey);
        if (!record) {
            this.clearDetail();
            return;
        }

        if (record.kind === 'quest') {
            this.selectQuest(record.quest.id);
            return;
        }

        this.selectedQuestId = null;
        this.selectedRecordKey = recordKey;
        this.dom.questList.querySelectorAll('.quest-list-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.recordKey === recordKey);
        });
        this.renderHandbookRecordDetail(record);
    }

    renderHandbookRecordDetail(record) {
        this.dom.detailPlaceholder.classList.add('hidden');
        this.dom.detailContent.classList.remove('hidden');
        this.dom.detailContent.dataset.status = record.statusTone || 'active';
        if (record.progress) {
            this.dom.detailContent.style.setProperty('--quest-progress', `${record.progress.percent || 0}%`);
        }

        this.dom.detailIcon.innerHTML = this.renderHandbookRecordIcon(record, 'handbook-detail-image');
        this.dom.detailName.textContent = record.title;
        this.dom.detailType.textContent = record.typeLabel || '旅人手札';
        this.dom.detailType.className = `quest-type-badge type-${record.kind}`;

        const dialogueBox = this.dom.detailDialogue?.closest('.quest-dialogue-box');
        if (dialogueBox) dialogueBox.hidden = true;

        this.applyDetailSectionLabels(this.getHandbookSectionLabels(record));
        this.renderHandbookSummary(record);
        this.renderHandbookSections(record);
        this.renderHandbookRecordRewards(record);
        this.updateHandbookActions(record);
    }

    applyDetailSectionLabels(config = {}) {
        const {
            objectivesTitle = '📋 紀錄內容',
            rewardsTitle = '🎁 回報',
            showObjectives = true,
            showRewards = true
        } = config;

        if (this.dom.detailObjectivesPanel) {
            this.dom.detailObjectivesPanel.hidden = !showObjectives;
        }
        if (this.dom.detailRewardsPanel) {
            this.dom.detailRewardsPanel.hidden = !showRewards;
        }
        if (this.dom.detailObjectivesTitle) {
            this.dom.detailObjectivesTitle.textContent = objectivesTitle;
        }
        if (this.dom.detailRewardsTitle) {
            this.dom.detailRewardsTitle.textContent = rewardsTitle;
        }
    }

    getHandbookSectionLabels(record = {}) {
        const hasRouteAction = Boolean(record.route);

        switch (record.kind) {
            case 'forge':
                return {
                    objectivesTitle: '🧾 配方準備',
                    showRewards: false
                };
            case 'boss':
                return {
                    objectivesTitle: '🧭 痕跡整理',
                    rewardsTitle: '✎ 手札註記',
                    showRewards: !hasRouteAction
                };
            case 'world':
                return {
                    objectivesTitle: '📍 見聞整理',
                    rewardsTitle: '✎ 手札註記',
                    showRewards: !hasRouteAction
                };
            case 'town':
                return {
                    objectivesTitle: '🏘 城鎮變化',
                    rewardsTitle: '✎ 手札註記',
                    showRewards: !hasRouteAction
                };
            default:
                return {
                    objectivesTitle: '📋 紀錄內容',
                    rewardsTitle: '✎ 手札註記',
                    showRewards: !hasRouteAction
                };
        }
    }

    getQuestSectionLabels(status) {
        switch (status) {
            case QuestStatus.AVAILABLE:
                return {
                    objectivesTitle: '📋 委託內容',
                    rewardsTitle: '🎁 預期報酬'
                };
            case QuestStatus.ACTIVE:
                return {
                    objectivesTitle: '📋 目前目標',
                    rewardsTitle: '🎁 完成回報'
                };
            case QuestStatus.COMPLETED:
                return {
                    objectivesTitle: '📋 回報事項',
                    rewardsTitle: '🎁 回報獎勵'
                };
            case QuestStatus.FINISHED:
                return {
                    objectivesTitle: '📚 已歸檔紀錄',
                    rewardsTitle: '🎁 已取得報酬'
                };
            default:
                return {
                    objectivesTitle: '📋 紀錄內容',
                    rewardsTitle: '🎁 回報'
                };
        }
    }

    renderHandbookSummary(record) {
        if (!this.dom.detailContent) return;

        let summary = this.dom.detailContent.querySelector('.quest-detail-summary');
        if (!summary) {
            summary = document.createElement('div');
            summary.className = 'quest-detail-summary';
            const header = this.dom.detailContent.querySelector('.detail-header');
            if (header) header.insertAdjacentElement('afterend', summary);
            else this.dom.detailContent.prepend(summary);
        }

        const isCompact = record.summaryMode === 'compact';
        const meta = Array.isArray(record.meta) ? record.meta.filter(Boolean) : [];
        const metaLabels = Array.isArray(record.metaLabels) ? record.metaLabels.filter(Boolean) : [];
        const cues = !isCompact && Array.isArray(record.cues) ? record.cues.filter(Boolean).slice(0, 3) : [];
        const progress = record.progress || null;
        const progressText = progress
            ? `${progress.current}/${progress.required}`
            : '已記錄';
        const showMeta = record.hideSummaryMeta !== true
            && !isCompact
            && (Boolean(record.typeLabel) || Boolean(record.statusText) || meta.length > 0);
        const summaryLabel = record.summaryLabel || record.typeLabel || '旅人手札';
        const summaryHint = record.summaryHint || '目前紀錄';
        summary.style.setProperty('--quest-progress', `${progress?.percent || 100}%`);

        summary.innerHTML = `
            ${showMeta ? `
                <div class="quest-note-meta" aria-label="手札分類">
                    <span><b>分類</b>${escapeHtml(record.typeLabel || '手札')}</span>
                    <span><b>狀態</b>${escapeHtml(record.statusText || '已記錄')}</span>
                    ${meta.slice(0, 2).map((text, index) => `<span><b>${escapeHtml(metaLabels[index] || (index === 0 ? '來源' : '關聯'))}</b>${escapeHtml(text)}</span>`).join('')}
                </div>
            ` : ''}
            ${cues.length > 0 ? `
                <div class="quest-note-cues" aria-label="手札摘要">
                    ${cues.map(text => `<span>${escapeHtml(text)}</span>`).join('')}
                </div>
            ` : ''}
            <section class="quest-note-current" aria-label="目前紀錄">
                <div class="quest-note-speaker">
                    <span class="quest-note-avatar">${this.renderHandbookRecordIcon(record, 'handbook-avatar-image')}</span>
                    <span>
                        <b>${escapeHtml(summaryLabel)}</b>
                        <small>${escapeHtml(summaryHint)}</small>
                    </span>
                </div>
                <p>${escapeHtml(record.current || '這段紀錄還需要補充。')}</p>
            </section>
            ${!isCompact ? `
                <section class="quest-note-next" aria-label="玩家思考">
                    <div class="quest-note-next-copy">
                        <span>我在想</span>
                        <strong>${escapeHtml(record.thoughtTitle || '我現在是否該翻到下一頁？')}</strong>
                        <p>${escapeHtml(record.thoughtText || '手札把線索收在一起，剩下要靠我決定下一步。')}</p>
                    </div>
                    <div class="quest-note-progress" aria-label="紀錄補齊程度">
                        <strong>${escapeHtml(progressText)}</strong>
                        <span>${progress ? `${progress.percent || 0}% 補齊` : '收錄'}</span>
                    </div>
                </section>
                <div class="quest-note-meter" aria-label="紀錄總進度">
                    <div class="quest-note-meter-fill"></div>
                </div>
            ` : ''}
        `;
    }

    renderHandbookSections(record) {
        this.dom.detailObjectives.innerHTML = '';
        const sections = Array.isArray(record.sections) ? record.sections : [];
        if (sections.length === 0) {
            const li = document.createElement('li');
            li.className = 'objective-item handbook-section-item';
            li.innerHTML = `
                <span class="objective-icon">📖</span>
                <span class="objective-text">這段紀錄暫時沒有更多細節。</span>
            `;
            this.dom.detailObjectives.appendChild(li);
            return;
        }

        sections.forEach(section => {
            const lines = Array.isArray(section.lines) && section.lines.length > 0
                ? section.lines
                : ['尚未留下內容。'];
            const li = document.createElement('li');
            li.className = 'objective-item handbook-section-item';
            li.innerHTML = `
                <span class="objective-icon">▣</span>
                <span class="objective-text">
                    <strong>${escapeHtml(section.title || '紀錄')}</strong>
                    ${lines.map(line => `<small>${escapeHtml(line)}</small>`).join('')}
                </span>
            `;
            this.dom.detailObjectives.appendChild(li);
        });
    }

    renderHandbookRecordRewards(record) {
        this.dom.detailRewards.innerHTML = '';
        if (this.dom.detailRewardsPanel?.hidden || record.route) {
            return;
        }

        const action = this.getHandbookRecordAction(record);
        const el = document.createElement('div');
        el.className = 'reward-item reward-empty handbook-record-footnote';
        el.innerHTML = `
            <span class="reward-icon">${escapeHtml(action.icon)}</span>
            <span class="reward-value">
                <strong>${escapeHtml(action.title)}</strong>
                <small>${escapeHtml(action.description)}</small>
            </span>
        `;
        this.dom.detailRewards.appendChild(el);
    }

    getHandbookRecordAction(record = {}) {
        if (record.route) {
            return {
                icon: record.statusIcon || '➜',
                title: record.routeLabel || `前往${this.getRouteText(record.route)}`,
                description: record.routeDescription || this.getRecordRouteDescription(record)
            };
        }

        return {
            icon: record.statusIcon || '✎',
            title: record.statusText || '已記錄',
            description: this.getRecordRouteDescription(record)
        };
    }

    getRecordRouteDescription(record = {}) {
        if (record.reportToName) {
            return `手札只整理你知道的事，真正的回報要交給${record.reportToName}。`;
        }

        switch (record.kind) {
            case 'boss':
                return '手札只整理痕跡，真正觸發仍要回到對應地點與條件。';
            case 'world':
                return '這是親眼確認過的見聞，之後遇到相關委託或首領線時會派上用場。';
            case 'forge':
                return '材料、圖紙與成功率都收在這裡，準備好再回工坊處理。';
            case 'town':
                return '這頁只記下一幕城裡的日常；回城時可以再路過看看。';
            default:
                return '這段紀錄已收入手札，之後可回來重新整理脈絡。';
        }
    }

    updateHandbookActions(record) {
        this.dom.btnAccept.classList.add('hidden');
        this.dom.btnAbandon.classList.add('hidden');
        this.dom.detailActions.querySelectorAll('.quest-travel-btn').forEach(btn => btn.remove());

        if (record.route) {
            const travelBtn = document.createElement('button');
            travelBtn.className = 'quest-btn quest-travel-btn';
            travelBtn.innerHTML = `
                <span class="btn-icon">➜</span>
                ${escapeHtml(record.routeLabel || `前往${this.getRouteText(record.route)}`)}
            `;
            travelBtn.addEventListener('click', () => {
                this.rememberHandbookRouteIntent({
                    route: record.route,
                    label: record.routeLabel,
                    description: record.routeDescription,
                    reportToName: record.reportToName,
                    npcId: record.npcId
                }, record);
                this.app.loadScene(record.route);
            });
            this.dom.detailActions.appendChild(travelBtn);
        }
    }

    rememberHandbookRouteIntent(routeInfo = {}, source = {}) {
        if (!routeInfo.route) return;

        if (!GameManager.state.ui || typeof GameManager.state.ui !== 'object') {
            GameManager.state.ui = {};
        }

        GameManager.state.ui.handbookRouteIntent = {
            route: routeInfo.route,
            label: routeInfo.label || source.routeLabel || `前往${this.getRouteText(routeInfo.route)}`,
            title: source.title || source.name || '旅人手札',
            kind: source.kind || 'quest',
            reportToName: routeInfo.reportToName || source.reportToName || '',
            npcId: routeInfo.npcId || source.npcId || '',
            description: routeInfo.description || source.routeDescription || '',
            createdAt: Date.now()
        };
        GameManager.markSaveDirty?.('handbook-route-intent');
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
        this.applyDetailSectionLabels(this.getQuestSectionLabels(state.status));
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
        this.updateActionButtons(state.status, questData.type, story, questData);
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
        const questStory = story || getQuestStory(questData, state);
        const nextStep = this.getNextStepText(state.status, safeProgressInfo, questStory);
        const thought = this.getQuestThoughtText(state.status, nextStep, questStory, safeProgressInfo, questData);
        const progressText = safeProgressInfo.required > 0
            ? `${safeProgressInfo.current}/${safeProgressInfo.required}`
            : '0/0';
        const chapterText = questStory.arc || '';
        summary.style.setProperty('--quest-progress', `${safeProgressInfo.percent}%`);

        summary.innerHTML = `
            ${chapterText ? `
                <div class="quest-note-meta" aria-label="委託篇章">
                    <span><b>篇章</b>${escapeHtml(chapterText)}</span>
                </div>
            ` : ''}
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

    updateActionButtons(status, questType, story = null, questData = null) {
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
            travelBtn.addEventListener('click', () => {
                this.rememberHandbookRouteIntent(routeInfo, {
                    kind: 'quest',
                    title: questData?.name || story?.title || '委託紀錄',
                    name: questData?.name || ''
                });
                this.app.loadScene(routeInfo.route);
            });
            this.dom.detailActions.appendChild(travelBtn);
        }
    }

    getQuestRouteInfo(status, story = null) {
        if (status === QuestStatus.COMPLETED) {
            const report = story?.reportTo || {};
            if (!report.name && story?.route) {
                return {
                    route: story.route,
                    label: `回到${this.getRouteText(story.route)}確認`,
                    description: '紀錄已補齊，但還需要回到事情發生的地方確認後續。'
                };
            }

            const name = report.name || '委託人';
            return {
                route: report.route || 'lobby',
                label: report.label || `回去找${name}`,
                description: `紀錄已補齊，下一步是親自把結果交回給${name}。`,
                reportToName: name,
                npcId: report.npcId || ''
            };
        }

        if (story?.route) {
            return {
                route: story.route,
                label: `前往${this.getRouteText(story.route)}`,
                description: story.nextLead || '手札提供方向，剩下要到現場確認。'
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
        this.selectedRecordKey = null;
        this.dom.detailPlaceholder.classList.remove('hidden');
        this.dom.detailContent.classList.add('hidden');
        this.dom.questList?.querySelectorAll('.quest-list-item').forEach(item => item.classList.remove('selected'));
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
                this.refreshHandbook();
                break;
            case 'progress_updated':
                this.refreshHandbook();
                break;
            case 'hidden_quest_discovered':
                this.showNotification('新的聽聞', `「${data.quest.name}」已寫入旅人手札。`);
                this.refreshHandbook();
                break;
            case 'quest_ready':
                this.showNotification('紀錄補齊', `「${data.quest.name}」可以回去找委託人。`);
                this.refreshHandbook();
                break;
        }
    }

    onGameEvent(_state, eventType) {
        const refreshEvents = new Set(['all', 'flags', 'inventory', 'warehouse', 'gold', 'equipment']);
        if (!refreshEvents.has(eventType)) return;
        this.refreshHandbook();
    }

    showNotification(title, message) {
        if (this.dom.ledgerSummary) {
            this.dom.ledgerSummary.textContent = message || title || '';
        }
    }

}
