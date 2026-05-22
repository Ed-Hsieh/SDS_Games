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
        discovery: '村長說南門外的獵人還沒回來，但他要你先找書記學會怎麼記錄線索，再出城確認道路。',
        available: '村長請你先找書記確認線索簿的記錄方式，再去南門外近郊走一圈。',
        active: '你記得村長的交代：先找書記，讓聽聞有地方落筆；再看路、再看怪物。',
        completed: '你把近郊路線重新記下，城鎮終於知道南門外還有哪幾條路能用。',
        finished: '第一份路線紀錄完成後，村長開始把更深入的問題交給你。',
        nextLead: '先去找書記，再前往南門外近郊確認 3 處路線。',
        route: 'adventure',
        reportTo: {
            npcId: 'village_elder',
            name: '村長',
            route: 'lobby',
            label: '回去找村長'
        },
        objectives: [
            '村長請我先找書記確認線索簿的記錄方式。',
            '再前往南門外近郊，記下 3 處還能通行的路線。'
        ]
    },
    main_002: {
        arc: '裂痕前夜',
        source: '書記的異常紀錄',
        location: '舊書桌',
        speaker: { name: '書記', avatar: '📚' },
        discovery: '書記把村民的聽聞寫成第一份線索：農田邊的史萊姆正在變多。',
        available: '這不是英雄委託，只是一件夠小、卻足以證明地脈異常正在靠近城鎮的麻煩事。',
        active: '清掉靠近農田的史萊姆，再回來讓書記比對時間、地點與黏液味道。最後一項聽起來很不體面，但他很堅持。',
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
    main_003: {
        arc: '銀絲伏道',
        source: '斷裂誘餌鉤',
        location: '鍛造鋪',
        speaker: { name: '鍛造師', avatar: '⚒️' },
        discovery: '獵人棧道旁的誘餌鉤被切得太乾淨，鍛造師認為這不是普通野獸能留下的痕跡。',
        available: '鍛造師要你先把裝備整好。不是因為他突然關心你，是因為「顧客活著回來」比較方便收尾款。',
        active: '完成一次裝備強化，讓裝備能撐過接下來的伏擊測試。',
        completed: '強化完成後，鍛造師把誘餌鉤修成能反向設陷的形狀。',
        finished: '獵人棧道的問題不再只是道路封鎖，而是一隻會記住路線的怪物正在等你犯錯。',
        nextLead: '前往鍛造，完成一次裝備強化。',
        route: 'forge',
        reportTo: {
            npcId: 'blacksmith',
            name: '鍛造師',
            route: 'lobby',
            label: '回去找鍛造師'
        }
    },
    main_004: {
        arc: '銀絲伏道',
        source: '倖存者警告',
        location: '獵人棧道',
        speaker: { name: '倖存者警告', avatar: '🔥' },
        discovery: '舊營火點留下警告：不要在同一段路點燃第二次火，牠會記得光的位置。',
        available: '銀絲不在前路，而在你可能回頭的位置。這不是巢穴，是伏擊。',
        active: '沿著獵人棧道、舊營火與被割裂的木牌拼出銀絲收束的位置，再帶著銀絲誘餌回到伏道設陷。',
        completed: '銀鐮伏獵者被擊敗後，獵人棧道重新開放。你第一次看見地圖會因怪物行為而改變。',
        finished: '道路打通後，腐根溪谷的焦黑煙霧終於不再只是遠方的模糊陰影。',
        nextLead: '取得足夠線索後，帶著銀絲誘餌前往銀絲伏道設陷。',
        route: 'adventure',
        reportTo: {
            npcId: 'village_elder',
            name: '村長',
            route: 'lobby',
            label: '回去找村長'
        }
    },
    main_005: {
        arc: '腐根溪谷',
        source: '發黑樹皮',
        location: '腐根溪谷',
        speaker: { name: '書記', avatar: '📚' },
        discovery: '獵人棧道打通後，腐根溪谷的焦黑煙霧變得清楚。狼牙痕、霧碑拓印與發黑樹皮都指向神木核心。',
        available: '森林不是單純發怒。它像是被剝掉一塊血肉後，痛到只剩防衛本能。',
        active: '擊退被污染痕跡驅趕的狼群，找出古樹守衛核心的位置。',
        completed: '古樹守衛倒下後，溪谷的燃燒藤蔓減弱，但污染已順著水流擴散。',
        finished: '線索補上最重要的一句：搶走黑樹皮的不是人類，而是北方更高威脅留下的爪痕。',
        nextLead: '調查腐根溪谷與霧碑丘，追蹤古樹守衛。',
        route: 'adventure',
        reportTo: {
            npcId: 'town_scholar',
            name: '書記',
            route: 'lobby',
            label: '回去找書記'
        }
    },
    main_006: {
        arc: '血月回聲',
        source: '撕下的獵人告示',
        location: '月苔坡',
        speaker: { name: '獵人告示', avatar: '🌙' },
        discovery: '古樹守衛事件後，夜裡開始有折角巨獸撞碎巨石。這不是新的源頭，而是污染溪流造成的二次災害。',
        available: '血月角鹿不守巢穴。牠會沿著月苔、溪谷與林徑交界移動。',
        active: '用月苔痕跡縮小狩獵範圍，把角鹿逼向月苔坡。',
        completed: '角鹿倒下後，血月退去。石階鎮外暫時安靜，卻沒有人覺得事情真的結束了。',
        finished: '第一章收束：邊境災害被壓下，但線索都指向霧碑丘陵與更深的地脈斷裂。',
        nextLead: '追蹤月苔樣本與折角路線，完成血月角鹿狩獵。',
        route: 'adventure',
        reportTo: {
            npcId: 'village_elder',
            name: '村長',
            route: 'lobby',
            label: '回去找村長'
        }
    },
    main_007: {
        arc: '丘陵的執念',
        source: '霧碑丘陵',
        location: '高威脅區',
        speaker: { name: '霧碑拓印', avatar: '🪨' },
        discovery: '第一章的線索沒有終止，而是爬上霧碑丘陵。石碑、草藥、潮聲與亡靈開始指向不同方向。',
        available: '第二章不只是一條主線。支線、委託與副本會一起把地脈崩毀的深度打開。',
        active: '進入霧碑丘陵，確認哪些災害來自守護者失控，哪些來自人類自己的選擇。',
        completed: '丘陵的第一批痕跡被記下。接下來的事件會比第一章多，也比第一章更分散。',
        finished: '第二章開始展開：女巫、神諭、巫妖與灰燼男爵都會從不同入口推進。',
        nextLead: '探索霧碑丘陵並擊敗高威脅區怪物。',
        route: 'adventure',
        reportTo: {
            npcId: 'town_scholar',
            name: '書記',
            route: 'lobby',
            label: '回去找書記'
        }
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
