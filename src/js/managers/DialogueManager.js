/**
 * DialogueManager.js
 * Picks contextual NPC dialogue and applies lightweight dialogue effects.
 */

import GameManager from './GameManager.js';
import { questManager } from './QuestManager.js';
import { worldInteractionManager } from './WorldInteractionManager.js';
import { getTownNPC, getTownNPCDialogues } from '../data/NPCDialogues.js';
import { getQuestStory } from '../data/QuestStories.js';

class DialogueManager {
    constructor() {
        this.history = {};
        GameManager.registerSaveSystem('dialogues', this);
    }

    getSeenKey(npcId, dialogueId) {
        return `${npcId}:${dialogueId}`;
    }

    getSeenCount(npcId, dialogueId) {
        return Number(this.history[this.getSeenKey(npcId, dialogueId)] || 0);
    }

    hasSeen(npcId, dialogueId) {
        return this.getSeenCount(npcId, dialogueId) > 0;
    }

    markSeen(npcId, dialogueId) {
        const key = this.getSeenKey(npcId, dialogueId);
        this.history[key] = Number(this.history[key] || 0) + 1;
        GameManager.markSaveDirty?.('dialogue');
    }

    getAvailableDialogue(npcId) {
        return this.getAvailableDialogues(npcId)[0] || null;
    }

    getAvailableDialogues(npcId) {
        this.prepareContextualDialogue(npcId);
        const dialogues = [
            ...this.getCompletedQuestReportDialogues(npcId),
            ...getTownNPCDialogues(npcId)
        ]
            .filter(dialogue => this.canUseDialogue(npcId, dialogue))
            .sort((a, b) => {
                const priorityDiff = (Number(b.priority) || 0) - (Number(a.priority) || 0);
                if (priorityDiff !== 0) return priorityDiff;
                return String(a.id).localeCompare(String(b.id), 'zh-Hant');
            });

        const storyDialogues = dialogues.filter(dialogue => !this.isFallbackDialogue(dialogue));
        return storyDialogues.length > 0 ? storyDialogues : dialogues;
    }

    getCompletedQuestReportDialogue(npcId) {
        return this.getCompletedQuestReportDialogues(npcId)[0] || null;
    }

    getCompletedQuestReportDialogues(npcId) {
        const npc = getTownNPC(npcId);
        if (!npc) return [];

        return questManager.getCompletedQuests()
            .filter(quest => this.isQuestReporter(npcId, quest))
            .filter(quest => !this.hasExplicitQuestReportDialogue(npcId, quest.id))
            .map(completedQuest => this.createQuestReportDialogue(npc, completedQuest));
    }

    hasExplicitQuestReportDialogue(npcId, questId) {
        return getTownNPCDialogues(npcId).some(dialogue => {
            const hasReportEffect = (dialogue.effects || [])
                .some(effect => effect.type === 'completeQuest' && effect.questId === questId);
            return hasReportEffect && this.canUseDialogue(npcId, dialogue);
        });
    }

    createQuestReportDialogue(npc, completedQuest) {
        const story = getQuestStory(completedQuest, completedQuest.state);
        const reportName = story.reportTo?.name || npc.name;
        const reportMessage = `${reportName}把「${completedQuest.name}」的紀錄歸檔。`;
        const nextLead = story.finished || story.nextLead || '城鎮裡的下一段動向正在浮上來。';

        return {
            id: `report_${completedQuest.id}`,
            priority: 86,
            tone: 'discovery',
            narrativeTitle: '回報完成',
            narrativeSummary: `你向${reportName}回報了「${completedQuest.name}」。這段紀錄被收進旅人手札，${nextLead}`,
            lines: [
                {
                    speaker: 'npc',
                    text: story.completed || completedQuest.dialogue?.complete || `你帶回了「${completedQuest.name}」的結果。`
                },
                {
                    speaker: 'npc',
                    text: '這份紀錄我會收下。接下來如果有新動向，城鎮裡會先有人露出那種「我有麻煩要交給你」的表情。'
                }
            ],
            effects: [
                { type: 'completeQuest', questId: completedQuest.id, message: reportMessage }
            ],
            route: 'quest',
            routeLabel: '查看旅人手札'
        };
    }

    isQuestReporter(npcId, quest) {
        if (!quest) return false;
        const story = getQuestStory(quest, quest.state);
        if (story.reportTo?.npcId) return story.reportTo.npcId === npcId;
        return quest.npc === npcId;
    }

    hasFreshDialogue(npcId) {
        this.prepareContextualDialogue(npcId);
        const dialogues = this.getAvailableDialogues(npcId);
        return dialogues.some(dialogue => {
            if (this.isFallbackDialogue(dialogue)) return false;
            if (dialogue.once && !this.hasSeen(npcId, dialogue.id)) return true;
            return this.dialogueChangesState(dialogue);
        });
    }

    dialogueChangesState(dialogue) {
        return (dialogue?.effects || []).some(effect => {
            if (!effect?.type) return false;
            return ['worldInteraction', 'questProgress', 'unlockQuest', 'acceptQuest', 'completeQuest', 'setFlag'].includes(effect.type);
        });
    }

    canUseDialogue(npcId, dialogue) {
        if (!dialogue?.id) return false;
        if (dialogue.once && this.hasSeen(npcId, dialogue.id)) return false;
        return (dialogue.conditions || []).every(condition => this.checkCondition(condition));
    }

    isFallbackDialogue(dialogue = {}) {
        const hasCondition = Array.isArray(dialogue.conditions) && dialogue.conditions.length > 0;
        const hasEffect = Array.isArray(dialogue.effects) && dialogue.effects.length > 0;
        const priority = Number(dialogue.priority) || 0;
        return priority <= 1 && !hasCondition && !hasEffect;
    }

    getDialogueTopic(dialogue = {}) {
        const type = this.getDialogueTopicType(dialogue);
        return {
            id: dialogue.id,
            type,
            label: this.getDialogueTopicLabel(dialogue, type),
            title: dialogue.narrativeTitle || this.getDialogueTopicLabel(dialogue, type),
            summary: this.getDialogueTopicSummary(dialogue, type),
            icon: this.getDialogueTopicIcon(dialogue, type),
            priority: Number(dialogue.priority) || 0
        };
    }

    getDialogueTopicType(dialogue = {}) {
        const effects = dialogue.effects || [];
        if (dialogue.id?.startsWith?.('report_') || effects.some(effect => effect.type === 'completeQuest')) return 'report';
        if (effects.some(effect => effect.type === 'unlockQuest' || effect.type === 'acceptQuest')) return 'request';
        if (effects.some(effect => effect.type === 'worldInteraction' || effect.type === 'questProgress' || effect.type === 'setFlag')) return 'discovery';
        if (dialogue.once || dialogue.tone === 'discovery') return 'discovery';
        if (dialogue.route) {
            const hasConditions = Array.isArray(dialogue.conditions) && dialogue.conditions.length > 0;
            return hasConditions ? 'guidance' : 'destination';
        }
        return 'status';
    }

    getDialogueTopicLabel(dialogue = {}, type = 'status') {
        const title = dialogue.narrativeTitle || dialogue.topicTitle || dialogue.id || '';
        const labelMap = {
            report: '回報',
            request: '詢問',
            discovery: '聽聞',
            guidance: '提醒',
            destination: '前往',
            status: '近況'
        };
        return title ? `${labelMap[type] || '話題'}：${title}` : (labelMap[type] || '話題');
    }

    getDialogueTopicSummary(dialogue = {}, type = 'status') {
        if (dialogue.topicSummary) return dialogue.topicSummary;
        const firstLine = dialogue.lines?.find(line => line?.text)?.text || '';
        if (firstLine) return firstLine;
        const fallbackMap = {
            report: '把已完成的紀錄交給對方歸檔。',
            request: '聽聽對方想請你處理的事。',
            discovery: '確認剛出現的新聽聞。',
            guidance: '確認目前該往哪裡推進。',
            destination: '前往對應地點或開啟相關功能。',
            status: '聽聽對方目前注意到的狀況。'
        };
        return fallbackMap[type] || '選擇這個話題。';
    }

    getDialogueTopicIcon(dialogue = {}, type = 'status') {
        const iconMap = {
            report: '📌',
            request: '📜',
            discovery: '✦',
            guidance: '☞',
            destination: '➜',
            status: '…'
        };
        return dialogue.topicIcon || iconMap[type] || '•';
    }

    checkCondition(condition = {}) {
        switch (condition.type) {
            case 'flag':
                return Boolean(GameManager.getFlag(condition.flag)) === (condition.value ?? true);
            case 'notFlag':
                return !Boolean(GameManager.getFlag(condition.flag));
            case 'questStatus': {
                const status = questManager.getQuestState(condition.questId)?.status || 'locked';
                if (Array.isArray(condition.statuses)) return condition.statuses.includes(status);
                return status === condition.status;
            }
            case 'interactionResolved':
                return worldInteractionManager.hasResolved(condition.interactionId) === (condition.value ?? true);
            case 'seen':
                return this.getSeenCount(condition.npcId, condition.dialogueId) >= (condition.count || 1);
            default:
                return true;
        }
    }

    startDialogue(npcId, context = {}) {
        const npc = getTownNPC(npcId);
        if (!npc) {
            return {
                success: false,
                npc: null,
                lines: [],
                effectMessages: ['這裡暫時沒有可對話的對象。']
            };
        }

        this.prepareContextualDialogue(npcId);
        const dialogues = this.getAvailableDialogues(npcId);
        const requestedDialogueId = context.dialogueId || context.topicId || null;
        const dialogue = requestedDialogueId
            ? dialogues.find(entry => entry.id === requestedDialogueId)
            : dialogues[0];
        if (!dialogue) {
            return {
                success: false,
                npc,
                lines: [{
                    speaker: npc.name,
                    avatar: npc.avatar,
                    text: '他暫時沒有新的話要說。'
                }],
                effectMessages: []
            };
        }

        this.markSeen(npcId, dialogue.id);
        const lines = (dialogue.lines || []).map(line => this.resolveLine(line, npc));
        const effectMessages = this.applyEffects(dialogue.effects || [], {
            ...context,
            npcId,
            dialogueId: dialogue.id
        });

        return {
            success: true,
            npc,
            dialogue,
            topic: this.getDialogueTopic(dialogue),
            lines,
            effectMessages,
            narrativeTitle: dialogue.narrativeTitle || null,
            narrativeSummary: this.resolveDialogueNarrativeSummary(npc, dialogue, effectMessages),
            tone: dialogue.tone || 'ambient',
            route: dialogue.route || npc.route || null,
            routeLabel: dialogue.routeLabel || npc.routeLabel || '前往'
        };
    }

    prepareContextualDialogue(npcId) {
        if (npcId === 'street_beggar') {
            questManager.ensureBrokeQuestActive?.({ announce: true });
        }
    }

    resolveDialogueNarrativeSummary(npc, dialogue = {}, effectMessages = []) {
        if (typeof dialogue.narrativeSummary === 'string' && dialogue.narrativeSummary.trim()) {
            return dialogue.narrativeSummary.trim();
        }

        if (effectMessages.length > 0) {
            return `你與${npc.name}交談完畢，新的情況被整理成旅人手札裡的一段紀錄。城鎮的下一步，不再只是廣場上的閒聊。`;
        }

        if (dialogue.tone === 'discovery') {
            return `你與${npc.name}談完後，城鎮裡多了一條值得追蹤的動向。`;
        }

        return null;
    }

    resolveLine(line, npc) {
        if (line.speaker === 'player') {
            return {
                speaker: '冒險者',
                avatar: '🧭',
                text: line.text || ''
            };
        }

        if (line.speaker === 'system') {
            return {
                speaker: line.name || '紀錄',
                avatar: line.avatar || '📌',
                text: line.text || ''
            };
        }

        return {
            speaker: line.name || npc.name,
            avatar: line.avatar || npc.avatar,
            text: line.text || ''
        };
    }

    applyEffects(effects = [], context = {}) {
        const messages = [];

        for (const effect of effects) {
            if (!effect?.type) continue;

            if (effect.type === 'worldInteraction') {
                const outcome = worldInteractionManager.trigger(effect.interactionId, {
                    source: `dialogue:${context.npcId}`,
                    toast: false
                });
                messages.push(...(outcome.messages || []));
                continue;
            }

            if (effect.type === 'questProgress') {
                const changed = questManager.updateProgress(effect.objectiveType, effect.target, effect.amount || 1);
                if (changed && effect.message) messages.push(effect.message);
                continue;
            }

            if (effect.type === 'unlockQuest') {
                questManager.unlockQuest(effect.questId);
                if (effect.message) messages.push(effect.message);
                continue;
            }

            if (effect.type === 'acceptQuest') {
                const result = questManager.acceptQuest(effect.questId);
                if (result.success && effect.message) messages.push(effect.message);
                continue;
            }

            if (effect.type === 'completeQuest') {
                const result = questManager.completeQuest(effect.questId);
                if (result.success) {
                    if (effect.message) messages.push(effect.message);
                    const rewardText = questManager.getRewardToastText?.(result.rewards, result.blueprintUnlocks);
                    if (rewardText) messages.push(rewardText);
                } else if (effect.failMessage) {
                    messages.push(effect.failMessage);
                }
                continue;
            }

            if (effect.type === 'setFlag') {
                GameManager.setFlag(effect.flag, effect.value ?? true);
                GameManager.markSaveDirty?.('dialogue-flag');
                if (effect.message) messages.push(effect.message);
            }
        }

        return messages;
    }

    serialize() {
        return {
            history: { ...this.history }
        };
    }

    deserialize(data = {}) {
        this.history = { ...(data.history || {}) };
    }

    resetProgress() {
        this.history = {};
    }
}

export const dialogueManager = new DialogueManager();
export default DialogueManager;
