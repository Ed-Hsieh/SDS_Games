/**
 * QuestStories.js
 * Story-facing overlay for existing quest data. Objectives remain in Quests.js.
 */

export const QuestStoryDatabase = {
    main_001: {
        arc: '裂痕前夜',
        source: '村長的交代',
        location: '城鎮十字路',
        speaker: { name: '村長', avatar: '🏘️' },
        discovery: '村長說南門外的獵人還沒回來，要你先確認近郊道路是否仍能通行。',
        available: '村長請你先去南門外近郊走一圈，確認哪些路還能走，哪些路只是看起來能走。',
        active: '你記得村長的交代：先看路、再看怪物，活著回報比英勇失蹤有用。',
        completed: '你把近郊路線重新記下，城鎮終於知道南門外還有哪幾條路能用。',
        finished: '第一份路線紀錄完成後，村長開始把更深入的問題交給你。',
        nextLead: '前往南門外近郊，確認 3 處路線。',
        route: 'adventure',
        reportTo: {
            npcId: 'village_elder',
            name: '村長',
            route: 'lobby',
            label: '回去找村長'
        },
        objectives: [
            '村長請我先確認南門外近郊，記下 3 處還能通行的路線。'
        ]
    },
    main_002: {
        arc: '裂痕前夜',
        source: '巡守隊留下的血跡',
        location: '安全區邊緣',
        speaker: { name: '巡守隊筆記', avatar: '🛡️' },
        discovery: '巡守隊的標記在林邊中斷，旁邊散落著怪物留下的痕跡。',
        available: '筆記提醒你：如果連弱小怪物都無法處理，就不該再往外走。',
        active: '清掉附近徘徊的怪物，讓道路重新安全。',
        completed: '怪物數量被壓下來了，巡守隊留下的路標終於能看清。',
        finished: '你證明了自己不是只會整理地圖的人。',
        nextLead: '在冒險區擊敗怪物，確認你能承受實戰。',
        route: 'adventure',
        reportTo: {
            npcId: 'village_elder',
            name: '村長',
            route: 'lobby',
            label: '回去找村長'
        }
    },
    main_003: {
        arc: '裂痕前夜',
        source: '裂開的劍身',
        location: '城鎮鍛造鋪',
        speaker: { name: '鍛造筆記', avatar: '⚒️' },
        discovery: '你帶回來的舊武器出現細裂，普通保養已經不夠。',
        available: '鍛造鋪的桌上壓著一張便條：裝備會記住每一次戰鬥，也會在某天先你一步壞掉。',
        active: '用鍛造材料完成一次強化，確認裝備能跟上旅程。',
        completed: '強化完成後，劍身的裂紋被穩住了。',
        finished: '鍛造鋪開始願意讓你接觸更深的技術。',
        nextLead: '前往鑄造，完成一次裝備強化。',
        route: 'forge',
        reportTo: {
            npcId: 'blacksmith',
            name: '鍛造師',
            route: 'lobby',
            label: '回去找鍛造師'
        }
    },
    main_004: {
        arc: '城中暗流',
        source: '賭場傳聞',
        location: '賭場',
        speaker: { name: '酒館耳語', avatar: '🎲' },
        discovery: '酒館裡有人說，賭場最近用奇怪的籌碼吸引冒險者。',
        available: '你不必相信傳聞，但最好知道城裡的金幣都流向哪裡。',
        active: '去賭場試幾局，觀察那些籌碼是否只是普通遊戲。',
        completed: '你贏下幾局，也聽見莊家低聲提到一批失蹤的客人。',
        finished: '賭場不再只是消遣，它成了城中暗流的入口。',
        nextLead: '前往賭場，從遊戲中確認傳聞。',
        route: 'casino'
    },
    main_005: {
        arc: '危險區回聲',
        source: '被撕開的地圖',
        location: '普通區',
        speaker: { name: '破損地圖', avatar: '🗺️' },
        discovery: '舊地圖被撕掉了一角，缺口正好是普通區深處。',
        available: '安全區已不足以解釋最近的異變，你需要走進更危險的地帶。',
        active: '普通區的怪物開始帶著陌生材料，調查它們的來源。',
        completed: '你找到足夠跡象：危險正在從更深處向外擴散。',
        finished: '普通區的道路被重新標記，下一個線索指向事件本身。',
        nextLead: '探索普通區並擊敗那裡的怪物。',
        route: 'adventure'
    },
    main_006: {
        arc: '危險區回聲',
        source: '反覆出現的異象',
        location: '冒險途中',
        speaker: { name: '異象殘響', avatar: '🌟' },
        discovery: '你開始在不同地點看見相同的光紋，像是某種東西正在試探你。',
        available: '世界不再只用怪物阻擋你，它開始用選擇回應你。',
        active: '接受幾次事件考驗，觀察它們是否指向同一個源頭。',
        completed: '那些事件留下相同的符號，答案在 Boss 區域附近。',
        finished: '命運的線索被串起，真正的敵人終於露出輪廓。',
        nextLead: '在冒險中觸發並完成隨機事件。',
        route: 'adventure'
    },
    main_007: {
        arc: '巫妖之門',
        source: '枯萎的王冠印記',
        location: 'Boss 區域',
        speaker: { name: '古老警告', avatar: '👑' },
        discovery: '王冠形狀的印記出現在地面，周圍的草木一夜枯黑。',
        available: '巫妖不是突然出現的災厄，而是有人曾經留下的失敗答案。',
        active: '進入 Boss 區域，找到巫妖並結束它的儀式。',
        completed: '巫妖倒下，但死亡釋放出的黑霧並沒有散去。',
        finished: '你贏了第一場大戰，也打開了更深的裂口。',
        nextLead: '前往 Boss 區域，擊敗巫妖。',
        route: 'adventure'
    },
    bounty_001: {
        arc: '城鎮委託',
        source: '書記的求助',
        location: '舊書桌',
        speaker: { name: '書記', avatar: '📚' },
        discovery: '書記說最近城外史萊姆變多了，村民擔心牠們繼續往農田靠近。',
        available: '書記請你消滅 5 個史萊姆，先確認這是不是單純增生，還是地脈異常的前兆。',
        active: '書記已把這件事寫進線索簿：清掉靠近農田的史萊姆，再回來比對時間與地點。',
        completed: '史萊姆數量被壓下來，書記終於能把「黏糊糊的聲音」改寫成比較正式的紀錄。',
        finished: '書記在紀錄旁加了一行小字：史萊姆不是原因，只是第一個浮上來的症狀。',
        nextLead: '到南門外近郊，消滅靠近農田的史萊姆。',
        route: 'adventure',
        reportTo: {
            npcId: 'town_scholar',
            name: '書記',
            route: 'lobby',
            label: '回去找書記'
        },
        objectives: [
            '書記說最近城外史萊姆變多了，請我消滅 5 個靠近農田的史萊姆。'
        ]
    },
    commission_forge_001: {
        arc: '鍛造圖紙',
        source: '鍛造鋪委託',
        location: '鍛造鋪',
        speaker: { name: '鍛造師', avatar: '⚒️' },
        discovery: '鍛造師把一疊磨損的研究筆記推到你面前。',
        available: '這不是普通鐵匠筆記。圖紙提到一種需要大量鐵礦石校準的強化法。',
        active: '收集鐵礦石，讓鍛造師確認圖紙上的比例。',
        completed: '鐵礦石讓圖紙上的缺口被補齊，新的強化技術開始成形。',
        finished: '鍛造師把你的名字寫進了研究記錄。',
        nextLead: '收集鐵礦石，推進鍛造圖紙研究。',
        route: 'adventure'
    },
    commission_forge_002: {
        arc: '鍛造圖紙',
        source: '秘銀傳聞',
        location: '危險區',
        speaker: { name: '鍛造師', avatar: '⚒️' },
        discovery: '第一份圖紙解讀後，鍛造師提到秘銀可能是下一段技術的關鍵。',
        available: '秘銀不是單純稀有，它能承受更高階強化時的反噬。',
        active: '收集秘銀並累積強化經驗，證明這套技術可行。',
        completed: '秘銀在爐中穩定下來，強化技術跨過了第一道門檻。',
        finished: '鍛造鋪已不只是商店，而是你戰力成長的核心據點。',
        nextLead: '前往較危險區域取得秘銀，並持續強化裝備。',
        route: 'forge'
    },
    commission_merchant_001: {
        arc: '黑市收藏',
        source: '古代錢幣',
        location: '黑市入口',
        speaker: { name: '黑市商人', avatar: '🕵️' },
        discovery: '古代錢幣打開了某條窄巷，也讓一份收藏清單浮上檯面。',
        available: '商人不要普通貨物。他要的是被詛咒、被丟棄、但仍有力量的碎片。',
        active: '帶回詛咒碎片，確認黑市收藏真正指向什麼。',
        completed: '商人收下碎片後，巷子深處傳來像箱鎖打開的聲音。',
        finished: '黑市把你記成「能找到不該存在之物的人」。',
        nextLead: '取得詛咒碎片，回到黑市線索。',
        route: 'adventure'
    },
    commission_casino_001: {
        arc: '城中暗流',
        source: '賭場老闆的懷疑',
        location: '賭場',
        speaker: { name: '賭場老闆', avatar: '🎰' },
        discovery: '賭場老闆懷疑收益異常不是運氣問題。',
        available: '他需要一個能自然坐上賭桌的人，觀察機器和骰子的異常。',
        active: '在不同賭局中獲勝，找出規律是否被人動過。',
        completed: '你確認異常來自機器故障，但老闆的表情不像鬆了一口氣。',
        finished: '賭場的門向你開得更大，也更危險。',
        nextLead: '前往賭場，在不同遊戲中取得勝利。',
        route: 'casino'
    },
    dungeon_cave_001: {
        arc: '地下回聲',
        source: '洞窟調查委託',
        location: '幽暗洞窟',
        speaker: { name: '礦工日誌', avatar: '📕' },
        discovery: '染血日誌的最後幾頁標出一條通往封閉洞窟的舊路線。',
        available: '拓印背面有一行小字：若洞窟再度發聲，代表地下的東西已經醒來。',
        active: '進入幽暗洞窟，確認聲音從第幾層開始變得異常。',
        completed: '你深入洞窟後發現牆面有新的抓痕，某個更大的影子在下方移動。',
        finished: '洞窟入口被重新標記，下一段探索將通往更深處。',
        nextLead: '前往幽暗洞窟，抵達第 3 層。',
        route: 'dungeon-cave'
    },
    dungeon_cave_002: {
        arc: '地下回聲',
        source: '洞窟深處的振翅聲',
        location: '幽暗洞窟',
        speaker: { name: '洞窟回聲', avatar: '🦇' },
        discovery: '第 3 層以下傳來規律的振翅聲，像是某種巨大的東西正在巡視巢穴。',
        available: '普通探索已經不夠，洞窟主人必須被逼出來。',
        active: '通關幽暗洞窟並擊敗深處 Boss，讓地下道路重新安靜。',
        completed: '洞窟主人倒下後，冷風從更遠的雪線吹進地下。',
        finished: '洞窟的回聲消失，新的寒意卻從北方靠近。',
        nextLead: '通關幽暗洞窟，擊敗暗影蝙蝠王。',
        route: 'dungeon-cave'
    }
};

export function getQuestStory(questData, state = null) {
    const story = QuestStoryDatabase[questData?.id] || {};
    const status = state?.status || 'available';
    const statusText = story[status] || story.available || questData?.dialogue?.start || questData?.description || '';

    return {
        arc: story.arc || getFallbackArc(questData),
        source: story.source || '任務線索',
        location: story.location || getFallbackLocation(questData),
        speaker: story.speaker || getFallbackSpeaker(questData),
        discovery: story.discovery || questData?.description || '',
        current: statusText,
        nextLead: story.nextLead || getFallbackNextLead(questData),
        route: story.route || null,
        reportTo: story.reportTo || getFallbackReportTo(questData),
        objectives: Array.isArray(story.objectives) ? story.objectives : null
    };
}

function getFallbackReportTo(questData = {}) {
    const npcMap = {
        blacksmith: { name: '鍛造師', route: 'lobby' },
        merchant: { name: '旅行商人', route: 'shop' },
        casino_owner: { name: '賭場老闆', route: 'casino' }
    };
    const reporter = npcMap[questData.npc];
    if (!reporter) return null;

    return {
        npcId: questData.npc,
        name: reporter.name,
        route: reporter.route,
        label: `回去找${reporter.name}`
    };
}

function getFallbackArc(questData) {
    const type = questData?.type || 'quest';
    if (type === 'main') return `第 ${questData?.chapter || 1} 章`;
    if (type === 'bounty') return '城鎮委託';
    if (type === 'commission') return '人物委託';
    if (type === 'hidden') return '隱藏線索';
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
        return {
            name: npc.name || '委託人',
            avatar: npc.avatar || questData?.icon || '📜'
        };
    }

    const npcNames = {
        blacksmith: { name: '鍛造師', avatar: '⚒️' },
        merchant: { name: '旅行商人', avatar: '🧳' },
        casino_owner: { name: '賭場老闆', avatar: '🎰' }
    };

    return npcNames[npc] || { name: '旅途記錄', avatar: questData?.icon || '📜' };
}

function getFallbackNextLead(questData) {
    const firstObjective = questData?.objectives?.[0];
    return firstObjective?.description || '閱讀任務內容，找出下一步。';
}
