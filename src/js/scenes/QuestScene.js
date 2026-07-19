/**
 * QuestScene.js
 * 任務冊場景 - 顯示任務列表、接取/放棄/完成任務
 */
import { questManager, QuestStatus, QuestType, ObjectiveType } from '../managers/QuestManager.js?v=dialogue-flow-20260712w';
import { escapeHtml, getItemVisualHtml } from '../utils/ItemDisplay.js';
import { attachItemTooltip } from '../utils/ItemTooltip.js';
import { getMaterial } from '../managers/MaterialManager.js';
import { resolveItemById } from '../utils/ItemResolver.js';
import { getQuestStory } from '../data/QuestStories.js?v=dialogue-flow-20260712w';
import { getGeneratedPortraitImage } from '../data/AssetManifest.js';
import { getAllCharacterProfiles } from '../data/CharacterProfiles.js';
import { dialogueManager } from '../managers/DialogueManager.js?v=chapter1-art-20260713a';
import GameManager from '../managers/GameManager.js';
import { storyJournalManager } from '../managers/StoryJournalManager.js';
import { ChapterRegionOrder, ChapterRegionRegistry, findChapterLocation, getChapterRegion } from '../data/ChapterRegionRegistry.js';
import { MonsterDatabase } from '../data/Monsters.js';
import { getResolvedTownPlaces } from '../managers/TownStateResolver.js';
import audioManager from '../utils/AudioManager.js';
import { storyGuidanceManager } from '../managers/StoryGuidanceManager.js';

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
    relationships: {
        title: '城鎮人際',
        panelTitle: '認識的人',
        countLabel: '位人物',
        emptyIcon: '👥',
        emptyText: '還沒有真正認識任何人。和城鎮角色對話後，這裡才會留下很少的第一印象。',
        ledger: records => `${records.length} 位已認識的人`
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
            const active = button.dataset.handbookTab === this.activeTab;
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
            return `${records.length} 筆紀錄 · ${activeCount} 件委託追蹤中 · ${completed} 件待回報`;
        }

        const tab = HANDBOOK_TABS[tabId] || HANDBOOK_TABS.commissions;
        return tab.ledger(records);
    }

    updateHandbookCounts() {
        const counts = {
            commissions: this.getHandbookRecords('commissions').length,
            boss: this.getBossTraceRecords().length,
            world: this.getWorldNoteRecords().length,
            relationships: this.getRelationshipRecords().length,
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
            case 'relationships':
                return this.getRelationshipRecords();
            case 'town':
                return this.getTownMemoryRecords();
            case 'commissions':
            default:
                return [
                    this.getCurrentMainlineRecord(),
                    ...this.getStoryQuestList().map(quest => ({
                    key: `quest:${quest.id}`,
                    kind: 'quest',
                    quest
                    }))
                ].filter(Boolean);
        }
    }

    getCurrentMainlineRecord() {
        const directive = storyGuidanceManager.getCurrent();
        if (!directive) return null;
        const region = getChapterRegion(directive.chapter);
        const fieldTarget = directive.targetId
            ? findChapterLocation(directive.targetId, directive.chapter)
            : null;
        const destination = directive.placeId
            ? (getResolvedTownPlaces().find(place => place.id === directive.placeId)?.name || '城鎮')
            : (fieldTarget?.name || region?.title || '冒險地圖');

        return {
            key: `mainline:${directive.sceneId}`,
            kind: 'mainline',
            icon: String(directive.chapter),
            title: directive.title,
            typeLabel: `第 ${directive.chapter} 章`,
            statusIcon: '',
            statusText: '目前主線',
            statusTone: 'active',
            summaryMode: 'compact',
            summaryLabel: region?.title || `第 ${directive.chapter} 章`,
            summaryHint: destination,
            current: directive.text,
            listMeta: [destination, directive.targetType === 'town' ? '城鎮' : '野外'],
            sections: [{ title: '下一步', lines: [directive.text] }],
            route: directive.route,
            routeLabel: directive.targetType === 'town' ? `返回${destination}` : '前往冒險地圖',
            routeDescription: directive.text,
            npcId: directive.actorId || ''
        };
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
                    ${record.statusIcon ? `<span class="status-icon">${escapeHtml(record.statusIcon)}</span>` : ''}
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
        if (record.image) {
            return `<img src="${escapeHtml(record.image)}" alt="${escapeHtml(record.title || '')}" class="${escapeHtml(extraClass)}">`;
        }

        const item = record.visualItem
            || record.item
            || (record.itemId ? resolveItemById(record.itemId) : null);

        if (item) {
            return getItemVisualHtml(item, record.icon || '◆', extraClass);
        }

        return escapeHtml(record.icon || '◆');
    }

    getBossTraceRecords() {
        const visited = new Set(
            storyJournalManager.getRecords()
                .map(record => record.locationId || record.meta?.locationId)
                .filter(Boolean)
        );

        return ChapterRegionOrder.flatMap(regionId => {
            const region = ChapterRegionRegistry[regionId];
            return (region?.locationNodes || [])
                .filter(node => node.bossId)
                .map(node => {
                    const sceneId = node.sceneIds?.[0] || null;
                    const sceneComplete = Boolean(sceneId && GameManager.getFlag(`story.scene.${sceneId}.complete`));
                    if (!visited.has(node.id) && !sceneComplete) return null;

                    const monster = MonsterDatabase[node.bossId] || {};
                    const title = monster.name || node.name;
                    const optionalLabel = node.optional ? '可選首領' : '章節首領';
                    return {
                        key: `boss:${region.regionId}:${node.id}`,
                        kind: 'boss',
                        icon: monster.icon || '!',
                        image: monster.image || null,
                        title,
                        typeLabel: optionalLabel,
                        hideSummaryMeta: true,
                        summaryLabel: '固定地點',
                        summaryHint: region.title,
                        statusIcon: sceneComplete ? '✓' : '!',
                        statusText: sceneComplete ? '已處理' : '已發現',
                        statusTone: sceneComplete ? 'finished' : 'active',
                        listMeta: [
                            `第 ${region.chapter} 章`,
                            region.title,
                            node.name
                        ],
                        cues: [sceneComplete ? '此處的事件已結束' : '首領位置已確認'],
                        current: sceneComplete
                            ? `${node.name}的事件已被寫入當前周目。`
                            : (node.arrival || node.mapHint || '你已找到首領所在的位置。'),
                        thoughtTitle: sceneComplete ? '這裡還留下了什麼？' : '現在要踏進去嗎？',
                        thoughtText: sceneComplete
                            ? '道路與事件結果已經寫進手札。'
                            : '位置已經確認；是否進入，取決於目前狀態與準備。',
                        progress: {
                            current: sceneComplete ? 1 : 0,
                            required: 1,
                            percent: sceneComplete ? 100 : 0
                        },
                        sections: [
                            {
                                title: '所在位置',
                                lines: [`${region.title}：${node.name}`]
                            },
                            {
                                title: sceneComplete ? '當前結果' : '現場痕跡',
                                lines: [sceneComplete ? '事件已完成。' : (node.mapHint || '首領仍在固定地點等待。')]
                            }
                        ],
                        route: 'adventure',
                        routeLabel: sceneComplete ? '回到冒險地圖' : '前往固定地點'
                    };
                })
                .filter(Boolean);
        });
    }

    getWorldNoteRecords() {
        const kindLabels = {
            clue: '現場線索',
            boss: '首領結論',
            relationship: '人物紀錄',
            town: '城鎮變化',
            conclusion: '章節結論',
            event: '劇情事件'
        };

        return storyJournalManager.getRecords().map(record => {
            const isFieldRecord = Boolean(record.locationId || record.meta?.locationId);
            const typeLabel = kindLabels[record.kind] || '旅途發現';
            return {
                key: `story-discovery:${record.id}`,
                kind: 'world',
                icon: record.icon || '✦',
                title: record.title,
                typeLabel,
                summaryMode: 'compact',
                hideSummaryMeta: true,
                summaryLabel: `第 ${record.chapter} 章`,
                summaryHint: record.sourceLabel,
                statusIcon: '✎',
                statusText: `紀錄 ${record.notebookIndex}`,
                statusTone: record.kind === 'boss' || record.kind === 'conclusion' ? 'finished' : 'active',
                listMeta: [
                    `第 ${record.chapter} 章`,
                    record.sourceLabel,
                    typeLabel
                ],
                current: record.observation,
                thoughtTitle: '目前能得出的結論',
                thoughtText: record.inference,
                sections: [
                    { title: '親眼確認', lines: [record.observation] },
                    { title: '手札推論', lines: [record.inference || '目前沒有足夠證據繼續推論。'] }
                ],
                route: isFieldRecord ? 'adventure' : 'lobby',
                routeLabel: isFieldRecord ? '回到冒險地圖' : '回到城鎮'
            };
        });
    }

    getRelationshipRecords() {
        return getAllCharacterProfiles()
            .map(profile => this.createRelationshipRecord(profile))
            .filter(Boolean)
            .sort((a, b) => {
                const depthDiff = (b.relationship?.depth || 0) - (a.relationship?.depth || 0);
                if (depthDiff !== 0) return depthDiff;
                return String(a.title).localeCompare(String(b.title), 'zh-Hant');
            });
    }

    createRelationshipRecord(profile = {}) {
        const npcId = this.getRelationshipNpcId(profile);
        const talkCount = dialogueManager.getNpcTalkCount?.(npcId) || 0;
        if (talkCount <= 0) return null;

        const stages = this.getUnlockedRelationshipStages(profile);
        const currentStage = stages.at(-1) || profile.stages?.[0] || null;
        const depth = this.getRelationshipDepth(profile, talkCount, stages);
        const portrait = profile.portrait || getGeneratedPortraitImage(npcId) || getGeneratedPortraitImage(profile.id);
        const statusText = depth >= 3
            ? '慢慢看清'
            : depth >= 2 ? '有些印象' : '初識';

        return {
            key: `relationship:${profile.id}`,
            kind: 'relationship',
            icon: '👥',
            image: portrait,
            title: profile.name || npcId,
            typeLabel: '城鎮人際',
            summaryLabel: profile.name || '城鎮人物',
            summaryHint: statusText,
            statusIcon: depth >= 3 ? '◆' : depth >= 2 ? '◇' : '·',
            statusText,
            statusTone: depth >= 3 ? 'completed' : depth >= 2 ? 'active' : 'available',
            meta: [profile.title, statusText, `${talkCount} 次交流`],
            metaLabels: ['身分', '印象'],
            listMeta: [
                profile.title || '城鎮居民',
                statusText,
                `${talkCount} 次交流`
            ],
            current: this.getRelationshipCurrentText(profile, talkCount, currentStage),
            thoughtTitle: depth >= 3 ? '這個人好像不只是名字了。' : '這個人現在留給我的感覺。',
            thoughtText: depth >= 3
                ? '有些語氣、停頓和選擇開始連在一起，但這仍然只是旅途中留下的感受。'
                : '目前只是第一印象。這頁只記下已經發生過的交會，不替未來標路。',
            sections: this.getRelationshipSections(profile, talkCount, stages, depth),
            relationship: {
                profile,
                npcId,
                talkCount,
                depth,
                stage: currentStage,
                stages,
                statusText
            }
        };
    }

    getRelationshipNpcId(profile = {}) {
        return profile.id;
    }

    getRelationshipDepth(profile = {}, talkCount = 0, stages = []) {
        let depth = 1;
        const storyStageCount = stages.filter(stage => stage.fromFlag && GameManager.getFlag(stage.fromFlag)).length;
        if (talkCount >= 3 || (talkCount >= 2 && storyStageCount >= 1)) depth += 1;
        if (talkCount >= 5 || (talkCount >= 3 && storyStageCount >= 2)) depth += 1;
        return Math.min(3, depth);
    }

    getUnlockedRelationshipStages(profile = {}) {
        return (profile.stages || []).filter(stage => {
            if (!stage.fromFlag) return true;
            return Boolean(GameManager.getFlag(stage.fromFlag));
        });
    }

    getRelationshipCurrentText(profile = {}, talkCount = 0, currentStage = null) {
        const name = profile.name || '這個人';
        if (talkCount <= 1) {
            return `你只和${name}說過幾句話。目前留下的是第一印象，還談不上真正理解。`;
        }
        if (currentStage?.fromFlag && GameManager.getFlag(currentStage.fromFlag)) {
            return `${name}身上多了一點和城鎮變化相連的痕跡。你記得那次交會，也記得他當時的語氣。`;
        }
        return `${name}不再只是街上的一個名字。你開始記得他的說話方式，和他看待事情的角度。`;
    }

    getRelationshipSections(profile = {}, talkCount = 0, stages = [], depth = 1) {
        const sections = [
            {
                title: '初步印象',
                lines: [
                    profile.title || '城鎮居民',
                    profile.imageAnchor || profile.core || '目前只留下很模糊的第一印象。'
                ].filter(Boolean)
            }
        ];

        if (depth >= 2) {
            sections.push({
                title: '性格輪廓',
                lines: [
                    profile.core || '仍需要更多對話才能看清他的性格。',
                    profile.voice?.tone ? `說話方式：${profile.voice.tone}` : null
                ].filter(Boolean)
            });
        }

        if (depth >= 3) {
            sections.push({
                title: '藏起來的傷口',
                lines: [profile.wound || '他身上應該還有故事，只是目前沒有被任何事件真正碰到。']
            });
            if (profile.storyFunction) {
                sections.push({
                    title: '在城鎮裡的位置',
                    lines: [profile.storyFunction]
                });
            }
        }

        const flaggedStages = stages.filter(stage => stage.fromFlag && GameManager.getFlag(stage.fromFlag));
        if (flaggedStages.length > 0) {
            sections.push({
                title: '關係推進',
                lines: flaggedStages.map(stage => `${stage.label || stage.id}：${stage.mood || '這段關係因事件有了新的理解。'}`)
            });
        }

        return sections;
    }

    renderRelationshipDetail(record = {}) {
        this.renderRelationshipSummary(record);
        this.renderRelationshipSections(record);
        if (this.dom.detailRewards) this.dom.detailRewards.innerHTML = '';
    }

    renderRelationshipSummary(record = {}) {
        if (!this.dom.detailContent) return;

        let summary = this.dom.detailContent.querySelector('.quest-detail-summary');
        if (!summary) {
            summary = document.createElement('div');
            summary.className = 'quest-detail-summary';
            const header = this.dom.detailContent.querySelector('.detail-header');
            if (header) header.insertAdjacentElement('afterend', summary);
            else this.dom.detailContent.prepend(summary);
        }

        const rel = record.relationship || {};
        const profile = rel.profile || {};
        const talkCount = Number(rel.talkCount || 0);
        const stageLabel = rel.stage?.label || '初次交會';

        summary.innerHTML = `
            <section class="relationship-profile-card" aria-label="人物檔案">
                <div class="relationship-portrait">
                    ${record.image ? `<img src="${escapeHtml(record.image)}" alt="${escapeHtml(record.title || '')}">` : `<span>${escapeHtml(record.icon || '人')}</span>`}
                </div>
                <div class="relationship-profile-copy">
                    <div class="relationship-kicker">${escapeHtml(profile.title || record.typeLabel || '城鎮人物')}</div>
                    <div class="relationship-name-row">
                        <strong>${escapeHtml(record.title || profile.name || '未命名人物')}</strong>
                        <span>${escapeHtml(record.statusText || '初識')}</span>
                    </div>
                    <p>${escapeHtml(record.current || '這段人際還需要更多接觸。')}</p>
                    <div class="relationship-feeling-row" aria-label="人物印象">
                        <span>目前印象</span>
                        <strong>${escapeHtml(record.statusText || '初識')}</strong>
                        <small>${escapeHtml(`${talkCount} 次交流 · ${stageLabel}`)}</small>
                    </div>
                </div>
            </section>
        `;
    }

    renderRelationshipSections(record = {}) {
        if (!this.dom.detailObjectives) return;

        const rel = record.relationship || {};
        const sections = Array.isArray(record.sections) ? record.sections : [];
        const cards = sections.map(section => ({ ...section, locked: false }));

        this.dom.detailObjectives.classList.add('relationship-lore-grid');
        this.dom.detailObjectives.innerHTML = cards.map(card => `
            <li class="relationship-lore-card ${card.locked ? 'is-locked' : ''}">
                <div class="relationship-lore-head">
                    <span>${escapeHtml(card.locked ? '未解鎖' : '已記錄')}</span>
                    <strong>${escapeHtml(card.title || '側記')}</strong>
                </div>
                ${(card.lines || ['尚未留下內容。']).map(line => `<p>${escapeHtml(line)}</p>`).join('')}
            </li>
        `).join('');
    }

    getTownMemoryRecords() {
        const townRecords = getResolvedTownPlaces()
            .flatMap(place => (place.states || [])
                .map(state => ({
                    key: `town:${place.id}:${state.id || state.flag || state.title}`,
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
        this.dom.detailContent.classList.toggle('is-relationship-detail', record.kind === 'relationship');
        const detailHeader = this.dom.detailContent.querySelector('.detail-header');
        if (detailHeader) detailHeader.hidden = record.kind === 'relationship';
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
        if (record.kind === 'relationship') {
            this.renderRelationshipDetail(record);
            this.updateHandbookActions(record);
            return;
        }

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
            case 'mainline':
                return {
                    objectivesTitle: '目前方向',
                    showRewards: false
                };
            case 'relationship':
                return {
                    objectivesTitle: '人物側記',
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
        this.dom.detailObjectives.classList.remove('relationship-lore-grid');
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
            case 'relationship':
                return '這頁只記下你真正接觸過的人；更多背景要靠對話、主線與支線慢慢補齊。';
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
        this.dom.detailActions.hidden = true;

        if (record.route) {
            this.dom.detailActions.hidden = false;
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
        this.dom.detailContent.classList.remove('is-relationship-detail');
        const detailHeader = this.dom.detailContent.querySelector('.detail-header');
        if (detailHeader) detailHeader.hidden = false;
        this.dom.detailActions.hidden = false;
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

            const activeStoryStep = this.getActiveStoryStep(story);
            if (activeStoryStep) {
                return {
                    title: activeStoryStep.title,
                    description: activeStoryStep.description
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
        const activeStoryStep = this.getActiveStoryStep(story);
        if (index === 0 && activeStoryStep?.objective) return activeStoryStep.objective;
        const entry = story?.objectives?.[index];
        if (typeof entry === 'string') return entry;
        if (entry && typeof entry.text === 'string') return entry.text;
        return '';
    }

    getActiveStoryStep(story = null) {
        return (story?.steps || []).find(step => (
            !step.completeFlag || !GameManager.getFlag(step.completeFlag)
        )) || null;
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
                    order: ['rewardItem', 'material', 'equipment', 'shop', 'bossEquipment']
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
            quest: '任務冊'
        };
        return texts[route] || '目的地';
    }

    clearDetail() {
        this.selectedQuestId = null;
        this.selectedRecordKey = null;
        this.dom.detailContent?.classList.remove('is-relationship-detail');
        this.dom.detailObjectives?.classList.remove('relationship-lore-grid');
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
