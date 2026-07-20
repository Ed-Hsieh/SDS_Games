/**
 * QuestStories.js
 * Mainline display copy follows the seven screenplay chapters. Optional quests
 * use transparent fallbacks until each character-centered side story is locked.
 */

const npc = (npcId, name, route = 'lobby') => Object.freeze({ npcId, name, route });

export const QuestStoryDatabase = Object.freeze({
    map_corners_never_lie: Object.freeze({
        title: '地圖總是不平', arc: '第一章人物支線', source: '村長的受潮地圖', location: '裂痕廣場與檔案室',
        route: 'lobby',
        speaker: npc('village_elder', '村長'), requestFrom: npc('village_elder', '村長'), reportTo: npc('village_elder', '村長'),
        available: '村長反覆壓平同一個捲角，卻不准任何東西永久蓋住底下的舊記號。',
        active: '伊萊看得懂舊紀錄的筆勢。先讓他確認捲角下究竟是污痕，還是一段撤退線。',
        completed: '伊萊確認那是二十年前的回程記號。把沒有被證實的部分原樣帶回村長。',
        finished: '地圖被容易移開的鎮紙壓平，尚未確認的回程欄仍保留空白。',
        nextLead: '到檔案室找伊萊辨認舊記號。',
        reportLines: [
            { actorId: 'player', text: '伊萊說那不是污痕。是一段被紙角蓋住的撤退線。' },
            { actorId: 'village_elder', expression: 'guarded', text: '那就別把它修漂亮。錯過一次的路，留著難看一點比較有用。' },
            { actorId: 'village_elder', expression: 'pleased', text: '鎮紙用這個。能隨手搬開。空格可比好看的答案安全。' }
        ]
    }),
    one_blank_too_many: Object.freeze({
        title: '空格不是答案', arc: '第一章人物支線', source: '伊萊的三份回報', location: '檔案室與裂痕廣場',
        route: 'lobby',
        speaker: npc('town_scholar', '伊萊'), requestFrom: npc('town_scholar', '伊萊'), reportTo: npc('town_scholar', '伊萊'),
        available: '「沒看見」、「沒有」與「不知道」被寫進同一欄，伊萊寧可讓表格難看，也不肯把它們當成同一件事。',
        active: '村長知道第三名回報者實際走到哪裡。確認他的觀察範圍，再回來分類。',
        completed: '第三名回報者根本沒有抵達現場。這份回報只能記成「未看見」，不能寫成「不存在」。',
        finished: '三種未知被分開保存，手札可以依證據範圍檢視紀錄。',
        nextLead: '到裂痕廣場向村長確認回報者的行程。',
        reportLines: [
            { actorId: 'town_scholar', expression: 'guarded', text: '所以不是「沒有」。他只是沒走到。很好，表格更難看了。' },
            { actorId: 'player', text: '你聽起來反而放心了。' },
            { actorId: 'town_scholar', expression: 'pleased', text: '整齊很誘人。誠實通常比較佔位置。' }
        ]
    }),
    patrol_soles: Object.freeze({
        title: '巡線靴底', arc: '第一章人物支線', source: '芙蕾的巡線', location: '南門農田與獵人棧道',
        route: 'adventure',
        speaker: npc('standard_bearer_frey', '芙蕾'), requestFrom: npc('standard_bearer_frey', '芙蕾'), reportTo: npc('standard_bearer_frey', '芙蕾'),
        available: '芙蕾要補的不是出發標記，而是讓返程者在霧裡也看得見的方向牌。',
        active: '到南門農田與獵人棧道，從回城方向各看一次路標。',
        completed: '兩段路都留下了返程者的視線缺口。把位置帶回南門。',
        finished: '方向牌被補在最後一列也看得見的位置。', nextLead: '實際走訪兩處地標並調查。',
        reportLines: [
            { actorId: 'standard_bearer_frey', expression: 'guarded', text: '你標的位置都在出發者背後。' },
            { actorId: 'player', text: '但回來的人正好看得見。' },
            { actorId: 'standard_bearer_frey', expression: 'pleased', text: '很好。這次你沒有只顧著往前。' }
        ]
    }),
    lamp_glass_for_every_door: Object.freeze({
        title: '每扇門都嫌燈歪', arc: '第一章人物支線', source: '塔維的備用扣', location: '南門殘階',
        route: 'lobby',
        speaker: npc('lamplighter_tavi', '塔維'), requestFrom: npc('lamplighter_tavi', '塔維'), reportTo: npc('lamplighter_tavi', '塔維'),
        available: '三戶居民都拿到了塔維的備用燈罩扣，巡線燈反而少了固定件。',
        active: '在南門把三組尺寸不同的燈罩扣重新配回去。',
        completed: '居民燈與巡線燈都重新分到適合的扣件。', finished: '塔維答應至少先替自己的巡線燈留一份備件。',
        nextLead: '調查南門場景中的燈罩扣。',
        reportLines: [
            { actorId: 'lamplighter_tavi', expression: 'pleased', text: '我就說每盞燈只是角度稍微有個性。' },
            { actorId: 'player', text: '三種扣件全被你放錯了。' },
            { actorId: 'lamplighter_tavi', expression: 'soft', text: '好吧。下次我會先替自己留一份，再去拯救那些很有個性的門。' }
        ]
    }),
    pot_lid_is_not_a_shield: Object.freeze({
        title: '鍋蓋不是盾', arc: '第一章人物支線', source: '鐵匠的修理長隊', location: '冷爐鐵匠鋪',
        route: 'lobby',
        speaker: npc('blacksmith', '鐵匠'), requestFrom: npc('blacksmith', '鐵匠'), reportTo: npc('blacksmith', '鐵匠'),
        available: '一只替共用水桶擋過落石的鍋蓋凹得像盾。直接敲平只會讓裂口擴大。',
        active: '在爐邊依照三處受力痕跡安排回火與敲擊順序。', completed: '鍋蓋已恢復能蓋住鍋子的形狀。',
        finished: '鐵匠沒有把它掛成紀念品。今晚的鍋終於能正常煮飯。', nextLead: '調查鐵匠鋪中的凹陷鍋蓋。',
        reportLines: [
            { actorId: 'blacksmith', expression: 'guarded', text: '鍋蓋不是盾。下次再有人這樣用，我先罵他。' },
            { actorId: 'player', text: '它保住了共用水桶。' },
            { actorId: 'blacksmith', expression: 'soft', text: '所以我才把每道凹痕都修好。城裡要的是晚餐，不是第二面盾。' }
        ]
    }),
    vein_beneath_the_roots: Object.freeze({
        title: '根下的斷脈', arc: '第一章副本支線', source: '伊萊的地下回聲紀錄', location: '腐根側路／幽暗洞窟',
        route: 'adventure',
        speaker: npc('town_scholar', '伊萊'), requestFrom: npc('town_scholar', '伊萊'), reportTo: npc('town_scholar', '伊萊'),
        available: '腐根溪谷下方傳回規律空響。伊萊認為那是一條被地脈震裂、又被黑根重新頂開的舊礦道。',
        active: '腐根側路已出現洞窟入口。這條路不是森林 Boss 的必要門檻，但洞內可能留有更適合迎戰強敵的素材與裝備。',
        completed: '岩石巨人倒下後，布蘭的日誌與地脈斷裂紀錄被帶回地面。',
        finished: '城鎮確認副本是高風險的獨立探索區，也可能保存野外找不到的素材、圖紙與裝備。',
        nextLead: '從腐根溪谷北側岔路進入幽暗洞窟。',
        reportLines: [
            { actorId: 'player', text: '洞裡不是根室。礦道先被地脈震裂，黑根只是沿著裂口鑽進去。' },
            { actorId: 'town_scholar', expression: 'guarded', text: '那就不能把洞窟寫成森林守護者的巢。兩件事相連，不代表其中一件製造了另一件。' },
            { actorId: 'town_scholar', expression: 'soft', text: '我會把入口、風險和可能取得的東西分開記。下次你進副本，是因為你選擇承擔風險，不是主線替你關上其他路。' }
        ]
    })
});

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
