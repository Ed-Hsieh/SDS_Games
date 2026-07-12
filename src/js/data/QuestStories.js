/**
 * QuestStories.js
 * Mainline display copy follows the seven screenplay chapters. Optional quests
 * use transparent fallbacks until each character-centered side story is locked.
 */

export const QuestStoryDatabase = {
    story_chapter_01: {
        arc: '南門以外',
        source: '南門路網',
        location: '南門外手工區域',
        available: '南路失聯、黑根擴散。先讓證據、角色與回城路落在同一條因果上。',
        active: '主線依序經過米婭、村長、伊萊、芙蕾、塔維與鐵匠，不用額外接取清單任務。',
        completed: '森林守衛倒下後，道路變得可讀；城鎮只恢復這一章真正接回來的功能。',
        finished: '第一章完成。市場仍要等一條真實補給路。',
        route: 'adventure',
        objectives: ['完成 ch1_s01 至 ch1_s11 的主線演出。']
    },
    story_chapter_02: {
        arc: '斷路上的藥味',
        source: '舊撤離名冊',
        location: '斷裂撤離路與掘開古墓',
        available: '空箱、藥草包與舊名冊把供應問題推向二十年前的撤離道路。',
        active: '找回名字與上下文，處理赫恩仍在重複的職責。',
        completed: '死者與失蹤者被分開記錄，北向關卡露出仍在守夜的影子。',
        finished: '第二章完成。公開醫藥與市集供應有了制度來源。',
        route: 'adventure',
        objectives: ['完成 ch2_s01 至 ch2_s08 的主線演出。']
    },
    story_chapter_03: {
        arc: '影子仍守夜',
        source: '廢棄關卡',
        location: '舊指揮線',
        available: '影子不是隨機入侵者，而是仍把名字與命令重複在錯誤時間的人類隊伍。',
        active: '辨認凱德倫的左線命令，同時讓賭場與黑市誘惑進入角色主線。',
        completed: '地方命令被關閉，四個區域的壓力開始同時擴大。',
        finished: '第三章完成。維斯珀已看見每個角色的缺口。',
        route: 'adventure',
        objectives: ['完成 ch3_s01 至 ch3_s09 的主線演出。']
    },
    story_chapter_04: {
        arc: '石心與灰雨',
        source: '灰脊撤離',
        location: '灰脊石路',
        available: '道路本身正在移動；前旗與後燈必須同時留在正確位置。',
        active: '撤離兩組人員並阻止遠古泰坦再次抬升道路。',
        completed: '第一輪失去芙蕾；第二輪由芙蕾與塔維共同守住兩個標記。',
        finished: '第四章完成。四象壓力被證明來自同一節奏。',
        route: 'adventure',
        objectives: ['完成 ch4_s01 至 ch4_s09 的主線演出。']
    },
    story_chapter_05: {
        arc: '元素失衡',
        source: '四線報告',
        location: '四象交會線與米婭工作室',
        available: '四種元素危機共享同一條山脈壓力，普通處理工具也被帶進同一條因果。',
        active: '擊敗元素領主、完成米婭手術並重開遠征名冊。',
        completed: '第一輪城鎮失去聲音；第二輪以當周目測試阻止同一連鎖。',
        finished: '第五章完成。村長與封痕碎片把故事推向龍族守線。',
        route: 'adventure',
        objectives: ['完成 ch5_s01 至 ch5_s11 的主線演出。']
    },
    story_chapter_06: {
        arc: '龍守封痕',
        source: '封痕警戒線',
        location: '龍族周界與玻璃櫃賭場',
        available: '龍族看見的是再次碰觸封痕的人類，不是值得信任的盟友。',
        active: '第一輪重演戰爭；第二輪以本周目證據停在線外，回城後收束維斯珀契約。',
        completed: '回聲哨指出一條不屬於龍族寬路的舊人類山路。',
        finished: '第六章完成。墜落地終於能被抵達。',
        route: 'adventure',
        objectives: ['完成 ch6_s01 至 ch6_s09 的主線演出。']
    },
    story_chapter_07: {
        arc: '墜落之地',
        source: '回聲哨與舊山路',
        location: '花田、終點營地與魔王墜落地',
        available: '艾洛的殘破話語、妮露的約定與魔王墜落真相在同一條舊路收束。',
        active: '第一輪殺死戰鬥身體；第二輪限制生命、回聲與地形核心後完成真殺。',
        completed: '當前周目的城鎮收尾與結局已演出。',
        finished: '主篇完成。物件不跨周目，只有成就記憶留下。',
        route: 'adventure',
        objectives: ['完成 ch7_s01 至 ch7_s09 的主線演出。']
    }
};

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
        reportMessage: story.reportMessage || null
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
