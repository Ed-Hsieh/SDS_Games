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
            { actorId: 'village_elder', expression: 'guarded', text: '他能確認是哪一年的嗎？' },
            { actorId: 'player', text: '二十年前。其他部分沒有足夠資料，他沒有往下猜。' },
            { actorId: 'village_elder', expression: 'neutral', text: '這樣就夠了。先照原樣收著，別把捲角壓死。以後找到別的紀錄，還要重新比對。' }
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
            { actorId: 'player', text: '第三個人只走到南門水溝，沒有進林，也沒到棧道。' },
            { actorId: 'town_scholar', expression: 'guarded', text: '那他寫的「沒有」，只能代表水溝附近沒有。' },
            { actorId: 'player', text: '另外兩份要一起改嗎？' },
            { actorId: 'town_scholar', expression: 'pleased', text: '先把每個人走過的範圍補上，再分開保存。這樣下次才不會把沒看到當成不存在。' }
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
            { actorId: 'player', text: '農田的標記被草擋住了。棧道那一面則只看得到木樁背面。' },
            { actorId: 'standard_bearer_frey', expression: 'guarded', text: '都是回城時才會遇到的角度。你把位置畫給我。' },
            { actorId: 'player', text: '農田這裡要移高，棧道最好補一塊朝南的牌。' },
            { actorId: 'standard_bearer_frey', expression: 'pleased', text: '好。我換班前先把農田那塊移好，棧道的木牌明早帶過去。' }
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
            { actorId: 'player', text: '三組扣件都重新配好了。南門巡線燈的那一個也留回來了。' },
            { actorId: 'lamplighter_tavi', expression: 'guarded', text: '三組都錯了，是不是？' },
            { actorId: 'player', text: '尺寸全錯。好在沒有一個真的壞掉。' },
            { actorId: 'lamplighter_tavi', expression: 'soft', text: '我會在盒子上寫門的位置。這次寫大一點，也不再把巡線燈的備件送出去。' }
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
            { actorId: 'player', text: '最深的凹痕是第一次落石，邊緣兩處是後來才壓上去的。' },
            { actorId: 'blacksmith', expression: 'guarded', text: '順序確定？敲錯第一下，裂口就會穿到底。' },
            { actorId: 'player', text: '確定。背面殘留的石粉也照這個順序疊著。' },
            { actorId: 'blacksmith', expression: 'pleased', text: '行。你把鍋蓋放下，接下來交給我。今晚至少不用拿木板蓋鍋了。' }
        ]
    }),
    vein_beneath_the_roots: Object.freeze({
        title: '根下的斷脈', arc: '第一章副本支線', source: '伊萊的地下回聲紀錄', location: '腐根側路／幽暗洞窟',
        route: 'adventure',
        speaker: npc('town_scholar', '伊萊'), requestFrom: npc('town_scholar', '伊萊'), reportTo: npc('town_scholar', '伊萊'),
        available: '腐根溪谷下方傳回規律空響。伊萊認為那是一條被地脈震裂、又被黑根重新頂開的舊礦道。',
        active: '腐根側路已出現洞窟入口。這條路不在前往根心的必經方向，但洞內可能留有舊礦材與裝備。',
        completed: '岩石巨人倒下後，布蘭的日誌與地脈斷裂紀錄被帶回地面。',
        finished: '城鎮確認舊礦道能獨立探索，也可能保存野外找不到的素材、圖紙與裝備。',
        nextLead: '從腐根溪谷北側岔路進入幽暗洞窟。',
        reportLines: [
            { actorId: 'player', text: '洞裡不是根室。礦道先被地脈震裂，黑根只是沿著裂口鑽進去。' },
            { actorId: 'town_scholar', expression: 'guarded', text: '你在裡面看見守護者留下的痕跡嗎？' },
            { actorId: 'player', text: '沒有。只有舊採礦痕跡、岩石巨人和後來鑽進去的黑根。' },
            { actorId: 'town_scholar', expression: 'soft', text: '那就分開記。入口的位置、裡面的危險和找到的礦材各寫一欄，別把它算成守護者的巢。' }
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
