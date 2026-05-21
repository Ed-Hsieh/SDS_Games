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
        const reportDialogue = this.getCompletedQuestReportDialogue(npcId);
        const dialogues = [
            ...(reportDialogue ? [reportDialogue] : []),
            ...getTownNPCDialogues(npcId)
        ]
            .filter(dialogue => this.canUseDialogue(npcId, dialogue))
            .sort((a, b) => (Number(b.priority) || 0) - (Number(a.priority) || 0));

        return dialogues[0] || null;
    }

    getCompletedQuestReportDialogue(npcId) {
        const npc = getTownNPC(npcId);
        if (!npc) return null;

        const completedQuest = questManager.getCompletedQuests()
            .find(quest => this.isQuestReporter(npcId, quest));
        if (!completedQuest) return null;

        const story = getQuestStory(completedQuest, completedQuest.state);
        const reportName = story.reportTo?.name || npc.name;
        const reportMessage = `${reportName}把「${completedQuest.name}」的紀錄歸檔。`;

        return {
            id: `report_${completedQuest.id}`,
            priority: 86,
            tone: 'discovery',
            lines: [
                {
                    speaker: 'npc',
                    text: story.completed || completedQuest.dialogue?.complete || `你帶回了「${completedQuest.name}」的結果。`
                },
                {
                    speaker: 'npc',
                    text: '這份紀錄我會收下。線索簿可以告訴你下一步往哪裡走，但回報這種事，還是得找到當初開口的人。'
                }
            ],
            effects: [
                { type: 'completeQuest', questId: completedQuest.id, message: reportMessage }
            ],
            route: 'quest',
            routeLabel: '查看線索簿'
        };
    }

    isQuestReporter(npcId, quest) {
        if (!quest) return false;
        const story = getQuestStory(quest, quest.state);
        if (story.reportTo?.npcId) return story.reportTo.npcId === npcId;
        return quest.npc === npcId;
    }

    hasFreshDialogue(npcId) {
        const dialogue = this.getAvailableDialogue(npcId);
        if (!dialogue) return false;
        if (dialogue.once && !this.hasSeen(npcId, dialogue.id)) return true;
        return this.dialogueChangesState(dialogue);
    }

    dialogueChangesState(dialogue) {
        return (dialogue?.effects || []).some(effect => {
            if (!effect?.type) return false;
            return ['worldInteraction', 'questProgress', 'completeQuest', 'setFlag'].includes(effect.type);
        });
    }

    canUseDialogue(npcId, dialogue) {
        if (!dialogue?.id) return false;
        if (dialogue.once && this.hasSeen(npcId, dialogue.id)) return false;
        return (dialogue.conditions || []).every(condition => this.checkCondition(condition));
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

        const dialogue = this.getAvailableDialogue(npcId);
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
            lines,
            effectMessages,
            tone: dialogue.tone || 'ambient',
            route: dialogue.route || npc.route || null,
            routeLabel: dialogue.routeLabel || npc.routeLabel || '前往'
        };
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
                speaker: line.name || '線索',
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
