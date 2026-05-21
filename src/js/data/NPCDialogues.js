/**
 * NPCDialogues.js
 * First-pass town NPC dialogue data for Chapter 1.
 * Dialogue logic lives in DialogueManager; this file stays declarative.
 */

export const TownNPCDatabase = {
    village_elder: {
        id: 'village_elder',
        name: '村長',
        avatar: '🏘️',
        role: '城鎮十字路的管理者',
        location: '城鎮十字路',
        route: 'quest',
        routeLabel: '查看線索簿'
    },
    blacksmith: {
        id: 'blacksmith',
        name: '鍛造師',
        avatar: '⚒️',
        role: '負責修整武器與研究圖紙',
        location: '鍛造鋪',
        route: 'forge',
        routeLabel: '前往鍛造'
    },
    herbalist: {
        id: 'herbalist',
        name: '藥師',
        avatar: '🌿',
        role: '記錄草藥、毒霧與居民傷勢',
        location: '市集邊棚',
        route: 'shop',
        routeLabel: '前往市集'
    },
    street_beggar: {
        id: 'street_beggar',
        name: '巷口流浪者',
        avatar: '🧥',
        role: '知道太多小道消息的人',
        location: '暗巷入口'
    },
    town_scholar: {
        id: 'town_scholar',
        name: '書記',
        avatar: '📚',
        role: '整理地脈、石碑與怪物紀錄',
        location: '舊書桌',
        route: 'encyclopedia',
        routeLabel: '翻閱百科'
    }
};

export const TownDialogueDatabase = {
    village_elder: [
        {
            id: 'elder_first_warning',
            priority: 100,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'main_001', status: 'locked' }
            ],
            lines: [
                { speaker: 'npc', text: '你是新來的冒險者吧。很好，城鎮現在缺人手，尤其缺那種會先聽完話再衝出去的人。' },
                { speaker: 'npc', text: '先去南門外近郊走一圈，確認路還能不能通。不要急著往深處跑，英雄故事通常不會記錄第一天就摔進溝裡的人。' },
                { speaker: 'npc', text: '回來前也去找書記。他把城外聽聞整理成線索簿，誰需要幫忙、哪裡有異常，你看那本就不會像在森林裡猜謎。' }
            ],
            effects: [
                { type: 'worldInteraction', interactionId: 'village_elder_intro' }
            ]
        },
        {
            id: 'elder_main_001_active',
            priority: 80,
            conditions: [
                { type: 'questStatus', questId: 'main_001', status: 'active' }
            ],
            lines: [
                { speaker: 'npc', text: '別在廣場繞圈了，剛剛說的事還沒做完。先去南門外近郊確認 3 處路線。' },
                { speaker: 'npc', text: '看到怪物痕跡就記下來。能打就打，不能打就回來。活著回報比英勇失蹤有用。' }
            ]
        },
        {
            id: 'elder_main_001_report',
            priority: 92,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'main_001', status: 'completed' }
            ],
            lines: [
                { speaker: 'npc', text: '你回來了。靴子上有南門外的濕土，袖口還沾著草籽，看來不是在廣場繞三圈假裝冒險。很好。' },
                { speaker: 'npc', text: '這些路線我會讓守衛重新標上去。接下來要確認的，就不是路還能不能走，而是什麼東西開始靠近路了。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'main_001', message: '村長把你的近郊路線紀錄收進城鎮地圖。' }
            ],
            route: 'quest',
            routeLabel: '查看線索簿'
        },
        {
            id: 'elder_main_002_ready',
            priority: 92,
            conditions: [
                { type: 'questStatus', questId: 'main_002', status: 'completed' }
            ],
            lines: [
                { speaker: 'npc', text: '怪物被壓下去了？很好。這代表我們還有時間，也代表更深處的東西還沒正式走到門口。' },
                { speaker: 'npc', text: '把你看到的痕跡直接說給我聽。線索簿負責提醒你路在哪裡，不負責替我聽報告。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'main_002', message: '村長把近郊怪物的異常記入巡守紀錄。' }
            ],
            route: 'quest',
            routeLabel: '查看線索簿'
        },
        {
            id: 'elder_after_notice',
            priority: 45,
            conditions: [
                { type: 'flag', flag: 'metVillageElder' }
            ],
            lines: [
                { speaker: 'npc', text: '你現在要記住三個地方：南門外、書記的線索簿、鍛造鋪。前兩個讓你知道該去哪，第三個讓你去了以後比較不會被折成兩段。' },
                { speaker: 'npc', text: '藥師也需要人手。她說最近城外的凝膠味道變了，我不知道凝膠正常該是什麼味道，但她聽起來很認真。' }
            ]
        },
        {
            id: 'elder_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '我年輕時也想當冒險者。後來發現比怪物更可怕的是糧倉紀錄、村民會計，還有三天沒睡的鐵匠。' },
                { speaker: 'npc', text: '去吧。城外如果只是安靜，那才更需要擔心。' }
            ]
        }
    ],

    blacksmith: [
        {
            id: 'blacksmith_first_note',
            priority: 90,
            once: true,
            lines: [
                { speaker: 'npc', text: '你那把舊劍還能用，但我說「能用」的標準很寬。拿來烤肉也算能用。' },
                { speaker: 'npc', text: '帶回鐵礦石、怪物部件或真正的圖紙，我就能讓你的裝備少一點像事故現場。' }
            ],
            route: 'forge',
            routeLabel: '前往鍛造'
        },
        {
            id: 'blacksmith_forge_commission',
            priority: 70,
            conditions: [
                { type: 'questStatus', questId: 'commission_forge_001', statuses: ['available', 'active', 'completed'] }
            ],
            lines: [
                { speaker: 'npc', text: '那份鍛造筆記不是完整圖紙，只是方向。真正有價值的圖紙，多半黏在怪物、菁英或副本首領身上。' },
                { speaker: 'player', text: '聽起來很不衛生。' },
                { speaker: 'npc', text: '冒險者的經濟模型通常都不太衛生。' }
            ],
            route: 'forge',
            routeLabel: '整理圖紙'
        },
        {
            id: 'blacksmith_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '城外的東西越來越硬，代表我的生意會變好，也代表大家的日子會變差。很不幸，兩件事通常一起發生。' }
            ],
            route: 'forge',
            routeLabel: '前往鍛造'
        }
    ],

    herbalist: [
        {
            id: 'herbalist_slime_hint',
            priority: 70,
            conditions: [
                { type: 'questStatus', questId: 'bounty_001', statuses: ['available', 'active'] }
            ],
            lines: [
                { speaker: 'npc', text: '史萊姆靠近農田不是因為牠們忽然熱愛農業。土裡的魔力味道變了。' },
                { speaker: 'npc', text: '如果你清掉牠們，順手帶回凝膠。我能做藥，村民能安心，史萊姆也終於不用被誤會成農夫。' }
            ]
        },
        {
            id: 'herbalist_witch_foreshadow',
            priority: 40,
            conditions: [
                { type: 'flag', flag: 'readCrossroadsNoticeBoard' }
            ],
            lines: [
                { speaker: 'npc', text: '最近草藥像被人按清單拔走。不是野獸，野獸不會挑年份，也不會留下那種漂亮到讓人不舒服的切口。' },
                { speaker: 'npc', text: '如果有人向你索要大量特殊草藥，先問價，再問命。順序很重要。' }
            ]
        },
        {
            id: 'herbalist_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '藥水可以救命，但不能治療冒險者的自信。後者通常需要一次慘敗。' }
            ],
            route: 'shop',
            routeLabel: '購買補給'
        }
    ],

    street_beggar: [
        {
            id: 'beggar_first_talk',
            priority: 90,
            once: true,
            tone: 'discovery',
            lines: [
                { speaker: 'npc', text: '口袋空了，人才會看見路邊真正有用的東西。你現在口袋還不夠空，但眼神差不多了。' },
                { speaker: 'player', text: '這算祝福嗎？' },
                { speaker: 'npc', text: '算便宜的預言。真正的預言通常要收訂金。' }
            ],
            effects: [
                { type: 'worldInteraction', interactionId: 'crossroads_beggar' }
            ]
        },
        {
            id: 'beggar_secret_shop',
            priority: 70,
            conditions: [
                { type: 'flag', flag: 'secretShopUnlocked' }
            ],
            lines: [
                { speaker: 'npc', text: '暗巷的門開了？那就記住，會收古代錢幣的人，通常也會收你不想付的東西。' }
            ]
        },
        {
            id: 'beggar_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '別只看地圖上的路。真正麻煩的地方，通常是大家都假裝沒看到的角落。' }
            ]
        }
    ],

    town_scholar: [
        {
            id: 'scholar_slime_report',
            priority: 100,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'bounty_001', status: 'completed' }
            ],
            lines: [
                { speaker: 'npc', text: '你回來得剛好。我已經把農田附近的時間、方位和黏液味道都留了空格。最後一項其實可以不用填得太詳細。' },
                { speaker: 'npc', text: '史萊姆數量被壓下去了，但牠們靠近農田這件事本身更重要。這不像普通增生，比較像地脈把某種東西往地表推。' },
                { speaker: 'npc', text: '我會把你的紀錄歸檔。之後如果同一方向又出現痕跡，我們就知道不是巧合。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'bounty_001', message: '書記把史萊姆增生紀錄補完，並標註為地脈異常的早期跡象。' }
            ],
            route: 'quest',
            routeLabel: '查看線索簿'
        },
        {
            id: 'scholar_slime_request',
            priority: 95,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'flag', flag: 'metVillageElder' },
                { type: 'questStatus', questId: 'bounty_001', status: 'locked' }
            ],
            lines: [
                { speaker: 'npc', text: '村長讓你來看線索簿？很好，終於有人願意把「聽說」變成「可追蹤」。' },
                { speaker: 'npc', text: '最近城外史萊姆變多了，尤其靠近農田那一帶。村民說夜裡會聽見黏糊糊的聲音，這句話我其實很不想寫進正式紀錄。' },
                { speaker: 'npc', text: '先幫我消滅 5 個史萊姆。我會把這件事記在你的線索簿裡，至少它比「到處看看」更像一個開始。' }
            ],
            effects: [
                { type: 'worldInteraction', interactionId: 'scholar_slime_request' }
            ],
            route: 'quest',
            routeLabel: '查看線索簿'
        },
        {
            id: 'scholar_first_leyline',
            priority: 80,
            once: true,
            lines: [
                { speaker: 'npc', text: '地脈不是河流，比較像全大陸共用的一條爛繩子。現在有人從北邊猛拉，南邊自然會一起斷。' },
                { speaker: 'player', text: '你說得很學術，也很不安心。' },
                { speaker: 'npc', text: '學術的作用之一，就是把不安心分類保存。' }
            ],
            route: 'encyclopedia',
            routeLabel: '查看紀錄'
        },
        {
            id: 'scholar_after_board',
            priority: 40,
            conditions: [
                { type: 'flag', flag: 'heardScholarSlimeRequest' }
            ],
            lines: [
                { speaker: 'npc', text: '史萊姆只是最容易看見的異常。牠們往農田靠，不是因為突然開始關心收成。' },
                { speaker: 'npc', text: '把擊殺紀錄帶回來，我會比對農田、南門外和獵人棧道的時間。線索如果能排成順序，就會開始說話。' }
            ],
            route: 'encyclopedia',
            routeLabel: '翻閱百科'
        },
        {
            id: 'scholar_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '我正在整理怪物紀錄。請不要把沾滿黏液的樣本直接放在書上，上次那本百科到現在還會自己翻頁。' }
            ],
            route: 'encyclopedia',
            routeLabel: '翻閱百科'
        }
    ]
};

export function getTownNPC(npcId) {
    return TownNPCDatabase[npcId] || null;
}

export function getTownNPCDialogues(npcId) {
    return TownDialogueDatabase[npcId] || [];
}

export function getAllTownNPCs() {
    return Object.values(TownNPCDatabase);
}
