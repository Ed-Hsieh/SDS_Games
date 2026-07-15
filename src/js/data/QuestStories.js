/**
 * QuestStories.js
 * Mainline display copy follows the seven screenplay chapters. Optional quests
 * use transparent fallbacks until each character-centered side story is locked.
 */

export const QuestStoryDatabase = {};

export function getQuestStory(questData, state = null) {
    const story = QuestStoryDatabase[questData?.id] || {};
    const status = state?.status || 'available';
    const statusText = story[status] || story.available || questData?.description || '';

    return {
        title: story.title || story.source || getFallbackTitle(questData),
        arc: story.arc || getFallbackArc(questData),
        source: story.source || questData?.name || '任務紀錄',
        location: story.location || getFallbackLocation(questData),
        speaker: story.speaker || getFallbackSpeaker(questData),
        discovery: story.discovery || questData?.description || '',
        current: statusText,
        available: story.available || questData?.description || '',
        active: story.active || questData?.description || '',
        completed: story.completed || '',
        finished: story.finished || '',
        nextLead: story.nextLead || getFallbackNextLead(questData),
        route: story.route || null,
        requestFrom: story.requestFrom || questData?.requestFrom || null,
        reportTo: story.reportTo || getFallbackReportTo(questData),
        objectives: Array.isArray(story.objectives) ? story.objectives : null,
        triggerGate: story.triggerGate || questData?.trigger || null,
        characterProfile: story.characterProfile || null,
        narrativeMeta: story.narrativeMeta || null,
        requestTitle: story.requestTitle || null,
        requestSummary: story.requestSummary || null,
        requestLines: Array.isArray(story.requestLines) ? story.requestLines : null,
        acceptMessage: story.acceptMessage || null,
        reportTitle: story.reportTitle || null,
        reportSummary: story.reportSummary || null,
        reportLines: Array.isArray(story.reportLines) ? story.reportLines : null,
        reportMessage: story.reportMessage || null,
        steps: Array.isArray(story.steps) ? story.steps : []
    };
}

function getFallbackTitle(questData) {
    if (questData?.type === 'main') return questData?.name || `第 ${questData?.chapter || 1} 章`;
    if (questData?.type === 'bounty') return '公告欄委託';
    if (questData?.type === 'commission') return '人物委託';
    if (questData?.type === 'hidden') return '隱藏線索';
    return '任務紀錄';
}

function getFallbackReportTo(questData = {}) {
    if (!questData.npc || typeof questData.npc !== 'string') return null;
    return {
        npcId: questData.npc,
        name: '委託人',
        route: 'lobby',
        label: '回去找委託人'
    };
}

function getFallbackArc(questData) {
    if (questData?.type === 'main') return `第 ${questData?.chapter || 1} 章`;
    if (questData?.type === 'bounty') return '城鎮委託';
    if (questData?.type === 'commission') return '人物委託';
    if (questData?.type === 'hidden') return '隱藏線索';
    return '旅途記錄';
}

function getFallbackLocation(questData) {
    if (questData?.type === 'bounty') return '公告欄';
    if (questData?.type === 'commission') return '城鎮';
    if (questData?.type === 'hidden') return '未知';
    return '冒險途中';
}

function getFallbackSpeaker(questData) {
    const npc = questData?.npc;
    if (npc && typeof npc === 'object') {
        return { name: npc.name || '委託人', avatar: npc.avatar || questData?.icon || '?' };
    }
    return { name: '旅途記錄', avatar: questData?.icon || '?' };
}

function getFallbackNextLead(questData) {
    return questData?.objectives?.[0]?.description || '閱讀任務內容，確認下一步。';
}
