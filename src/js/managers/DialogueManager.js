/**
 * DialogueManager.js
 * Contextual NPC dialogue selector for the rebuilt town scripts.
 */

import GameManager from './GameManager.js';
import { questManager } from './QuestManager.js';
import { worldInteractionManager } from './WorldInteractionManager.js';
import { getTownNPC, getTownNPCDialogues } from '../data/NPCDialogues.js';
import { getQuestById, QuestStatus, QuestType } from '../data/Quests.js';
import { getWorldInteraction } from '../data/WorldInteractions.js';

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
        this.history[key] = this.getSeenCount(npcId, dialogueId) + 1;
        GameManager.markSaveDirty?.('dialogue');
    }

    getAvailableDialogue(npcId) {
        return this.getAvailableDialogues(npcId)[0] || null;
    }

    getAvailableDialogues(npcId) {
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

    getCompletedQuestReportDialogues(npcId) {
        const npc = getTownNPC(npcId);
        if (!npc || typeof questManager.getCompletedQuests !== 'function') return [];

        return questManager.getCompletedQuests()
            .filter(quest => this.isQuestReporter(npcId, quest))
            .filter(quest => !this.hasExplicitQuestReportDialogue(npcId, quest.id))
            .map(quest => this.createQuestReportDialogue(npc, quest));
    }

    hasExplicitQuestReportDialogue(npcId, questId) {
        return getTownNPCDialogues(npcId).some(dialogue => {
            const hasReportEffect = (dialogue.effects || [])
                .some(effect => effect.type === 'completeQuest' && effect.questId === questId);
            return hasReportEffect && this.canUseDialogue(npcId, dialogue);
        });
    }

    createQuestReportDialogue(npc, completedQuest) {
        const questName = completedQuest.name || completedQuest.id || '任務';
        return {
            id: `report_${completedQuest.id}`,
            priority: 86,
            tone: 'discovery',
            narrativeTitle: '回報完成事項',
            narrativeSummary: `${npc.name}把「${questName}」記進城鎮恢復紀錄。這類回報之後應該接到城鎮狀態、功能解鎖或後續劇情，而不是只給獎勵就結束。`,
            lines: [
                {
                    speaker: 'npc',
                    text: `我知道你完成了「${questName}」。這不只是清掉一件事，是讓城鎮少一處斷點。`
                },
                {
                    speaker: 'npc',
                    text: '之後相關的商店、地圖、情報或人物反應都應該跟著更新。沒有後續的回報，就只是比較漂亮的打勾。'
                }
            ],
            effects: [
                { type: 'completeQuest', questId: completedQuest.id, message: `已回報：${questName}` }
            ],
            route: 'quest',
            routeLabel: '查看任務'
        };
    }

    isQuestReporter(npcId, quest) {
        if (!quest) return false;
        if (quest.reportTo?.npcId) return quest.reportTo.npcId === npcId;
        if (quest.npc) return quest.npc === npcId;
        return false;
    }

    hasFreshDialogue(npcId) {
        return this.getAvailableDialogues(npcId).some(dialogue => {
            if (this.isFallbackDialogue(dialogue)) return false;
            if (dialogue.once && !this.hasSeen(npcId, dialogue.id)) return true;
            return this.dialogueChangesState(dialogue);
        });
    }

    dialogueChangesState(dialogue) {
        return (dialogue?.effects || []).some(effect => (
            ['worldInteraction', 'questProgress', 'unlockQuest', 'acceptQuest', 'completeQuest', 'setFlag']
                .includes(effect?.type)
        ));
    }

    canUseDialogue(npcId, dialogue) {
        if (!dialogue?.id) return false;
        if (dialogue.once && this.hasSeen(npcId, dialogue.id)) return false;
        if (!this.dialogueQuestPrerequisitesSatisfied(dialogue)) return false;
        return (dialogue.conditions || []).every(condition => this.checkCondition(condition));
    }

    dialogueQuestPrerequisitesSatisfied(dialogue = {}) {
        const questIds = new Set();
        for (const effect of dialogue.effects || []) {
            if ((effect.type === 'unlockQuest' || effect.type === 'acceptQuest') && effect.questId) {
                questIds.add(effect.questId);
            }
        }

        for (const questId of questIds) {
            if (!this.canStartQuestFromDialogue(questId).success) return false;
        }

        return true;
    }

    canStartQuestFromDialogue(questId) {
        const quest = getQuestById(questId);
        if (!quest) return { success: false, reason: 'missing_quest' };

        const status = questManager.getQuestState(questId)?.status || QuestStatus.LOCKED;
        if (![QuestStatus.LOCKED, QuestStatus.AVAILABLE].includes(status)) {
            return { success: true };
        }

        const character = GameManager.getCharacter?.();
        if (quest.requiredLevel && character?.level < quest.requiredLevel) {
            return { success: false, reason: 'level' };
        }

        const trigger = quest.trigger || {};
        if (trigger.afterFlag && !GameManager.getFlag(trigger.afterFlag)) {
            return { success: false, reason: 'flag' };
        }

        if (trigger.afterQuest && !this.isQuestAtLeastStarted(trigger.afterQuest)) {
            return { success: false, reason: 'after_quest' };
        }

        if (trigger.duringQuest && !this.isQuestAtLeastStarted(trigger.duringQuest)) {
            return { success: false, reason: 'during_quest' };
        }

        return { success: true };
    }

    isQuestAtLeastStarted(questId) {
        const status = questManager.getQuestState(questId)?.status || QuestStatus.LOCKED;
        return [QuestStatus.ACTIVE, QuestStatus.COMPLETED, QuestStatus.FINISHED].includes(status);
    }

    isFallbackDialogue(dialogue = {}) {
        const hasCondition = Array.isArray(dialogue.conditions) && dialogue.conditions.length > 0;
        const hasEffect = Array.isArray(dialogue.effects) && dialogue.effects.length > 0;
        const priority = Number(dialogue.priority) || 0;
        return priority <= 1 && !hasCondition && !hasEffect;
    }

    getDialogueTopic(dialogue = {}) {
        const type = this.getDialogueTopicType(dialogue);
        const category = this.getDialogueTopicCategory(dialogue, type);
        return {
            id: dialogue.id,
            type,
            category,
            categoryLabel: this.getDialogueCategoryLabel(category),
            label: this.getDialogueTopicLabel(dialogue, type),
            title: dialogue.narrativeTitle || this.getDialogueTopicLabel(dialogue, type),
            summary: this.getDialogueTopicSummary(dialogue, type),
            icon: this.getDialogueTopicIcon(dialogue, type),
            priority: Number(dialogue.priority) || 0
        };
    }

    getDialogueRelatedQuestIds(dialogue = {}) {
        const questIds = new Set();

        for (const effect of dialogue.effects || []) {
            if (effect?.questId) questIds.add(effect.questId);
            if (effect?.type === 'worldInteraction' && effect.interactionId) {
                const interaction = getWorldInteraction(effect.interactionId);
                for (const questId of interaction?.unlockQuests || []) questIds.add(questId);
            }
        }

        for (const condition of dialogue.conditions || []) {
            if (condition?.type === 'questStatus' && condition.questId) {
                questIds.add(condition.questId);
            }
        }

        return [...questIds];
    }

    getDialogueTopicCategory(dialogue = {}, type = 'status') {
        if (type === 'report') return 'report';

        const quests = this.getDialogueRelatedQuestIds(dialogue)
            .map(questId => getQuestById(questId))
            .filter(Boolean);

        if (quests.some(quest => quest.type === QuestType.MAIN)) return 'main';
        if (quests.length > 0) return 'side';
        if (type === 'request' || type === 'discovery') return 'town';
        if (type === 'destination' || type === 'guidance') return 'function';
        return 'chat';
    }

    getDialogueCategoryLabel(category = 'chat') {
        return {
            report: '回報',
            main: '主線',
            side: '支線',
            town: '城鎮',
            function: '功能',
            chat: '交談'
        }[category] || '交談';
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
            request: '請求',
            discovery: '發現',
            guidance: '指引',
            destination: '前往',
            status: '交談'
        };
        return title ? `${labelMap[type] || '交談'}：${title}` : (labelMap[type] || '交談');
    }

    getDialogueTopicSummary(dialogue = {}, type = 'status') {
        if (dialogue.topicSummary) return dialogue.topicSummary;
        if (dialogue.narrativeSummary) return dialogue.narrativeSummary;
        const firstLine = dialogue.lines?.find(line => line?.text)?.text || '';
        if (firstLine) return firstLine;

        return {
            report: '回報已完成的事項，並更新城鎮狀態。',
            request: '這段對話會打開新的任務或目標。',
            discovery: '這段對話會留下新的城鎮變化、線索或旗標。',
            guidance: '這段對話會指向可用功能或下一步。',
            destination: '前往相關功能。',
            status: '普通交談。'
        }[type] || '普通交談。';
    }

    getDialogueTopicIcon(dialogue = {}, type = 'status') {
        const iconMap = {
            report: '✓',
            request: '!',
            discovery: '*',
            guidance: '>',
            destination: '>',
            status: '•'
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
                const status = questManager.getQuestState(condition.questId)?.status || QuestStatus.LOCKED;
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
                effectMessages: ['找不到這位 NPC 的對話資料。']
            };
        }

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
                    text: '現在沒有可用的對話。'
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

    resolveDialogueNarrativeSummary(npc, dialogue = {}, effectMessages = []) {
        if (typeof dialogue.narrativeSummary === 'string' && dialogue.narrativeSummary.trim()) {
            return dialogue.narrativeSummary.trim();
        }

        if (effectMessages.length > 0) {
            return `${npc.name}讓城鎮狀態產生了新的變化。`;
        }

        if (dialogue.tone === 'discovery') {
            return `${npc.name}提供了新的線索。`;
        }

        return null;
    }

    resolveLine(line, npc) {
        if (line.speaker === 'player') {
            return {
                speaker: '玩家',
                avatar: '你',
                text: line.text || ''
            };
        }

        if (line.speaker === 'system') {
            return {
                speaker: line.name || '系統',
                avatar: line.avatar || '!',
                text: line.text || ''
            };
        }

        return {
            speaker: line.name || npc.name,
            avatar: line.avatar || npc.avatar,
            text: line.text || ''
        };
    }

    buildQuestCompletionFeedback(effect = {}, result = {}) {
        const quest = getQuestById(effect.questId);
        const questName = quest?.name || effect.questId || '任務';
        const messages = [];

        messages.push(effect.message || `已回報：${questName}`);

        const rewardText = questManager.getRewardToastText?.(result.rewards, result.blueprintUnlocks);
        if (rewardText) messages.push(`獲得獎勵：${rewardText.replace(/^獎勵\s*/, '')}`);

        if (result.storyOutcome?.finalReady?.length > 0) {
            messages.push('相關劇情已推進到下一個可回報階段。');
        } else if (result.storyOutcome?.progressUpdates?.length > 0) {
            messages.push('相關劇情進度已更新。');
        }

        return [...new Set(messages.filter(Boolean))];
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
                const gate = this.canStartQuestFromDialogue(effect.questId);
                if (!gate.success) {
                    if (effect.failMessage) messages.push(effect.failMessage);
                    continue;
                }
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
                    messages.push(...this.buildQuestCompletionFeedback(effect, result));
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

        const unlockedEffects = GameManager.consumePassiveCombatUnlocks?.() || [];
        if (unlockedEffects.length > 0) {
            const names = unlockedEffects.map(effect => effect.name).join('、');
            messages.push(`解鎖被動效果：${names}`);
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
