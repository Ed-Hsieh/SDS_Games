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
        routeLabel: '查看旅人手札'
    },
    blacksmith: {
        id: 'blacksmith',
        name: '鍛造師',
        avatar: '⚒️',
        role: '負責修整武器與研究圖紙',
        location: '鍛造鋪'
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
            narrativeTitle: '村長的交代',
            narrativeSummary: '你與村長對話完畢後，取得第一段行動順序：先找書記確認旅人手札的記錄方式，再前往南門外近郊確認路線。',
            lines: [
                { speaker: 'npc', text: '你是新來的冒險者吧。很好，城鎮現在缺人手，尤其缺那種會先聽完話再衝出去的人。' },
                { speaker: 'npc', text: '先去找書記。他把城外聽聞整理成旅人手札，誰需要幫忙、哪裡有異常，都得先有地方記下來。' },
                { speaker: 'npc', text: '等他教你怎麼記，再去南門外近郊走一圈。不要急著往深處跑，英雄故事通常不會記錄第一天就摔進溝裡的人。' }
            ],
            effects: [
                { type: 'worldInteraction', interactionId: 'village_elder_intro' }
            ]
        },
        {
            id: 'elder_main_001_active',
            priority: 80,
            conditions: [
                { type: 'questStatus', questId: 'main_001', status: 'active' },
                { type: 'notFlag', flag: 'metTownScholarForRoute' }
            ],
            narrativeTitle: '先找書記',
            narrativeSummary: '村長提醒你，第一件事不是出城，而是先找書記確認旅人手札的記錄方式。把聽聞寫對，比一頭撞進草叢更有用。',
            lines: [
                { speaker: 'npc', text: '別在廣場繞圈了，剛剛說的事還沒做完。先去找書記。' },
                { speaker: 'npc', text: '他會告訴你哪些東西該記、哪些只是酒館裡被講大的故事。記清楚再出門，比拿頭測路安全。' }
            ]
        },
        {
            id: 'elder_main_001_after_scholar',
            priority: 81,
            conditions: [
                { type: 'questStatus', questId: 'main_001', status: 'active' },
                { type: 'flag', flag: 'metTownScholarForRoute' }
            ],
            narrativeTitle: '南門外近郊',
            narrativeSummary: '你已經找過書記。村長現在只提醒你一件事：到南門外近郊確認 3 處可通行路線，然後活著回來回報。',
            lines: [
                { speaker: 'npc', text: '書記那邊弄好了？很好，現在可以出城了。' },
                { speaker: 'npc', text: '去南門外近郊確認 3 處路線。看到怪物痕跡就記下來，能打就打，不能打就回來。活著回報比英勇失蹤有用。' }
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
            narrativeTitle: '路線回報',
            narrativeSummary: '你把南門外近郊的路線交給村長。城鎮準備重新標記可通行道路，而村長的語氣暗示：真正要靠近道路的東西，才剛開始露出痕跡。',
            lines: [
                { speaker: 'npc', text: '你回來了。靴子上有南門外的濕土，袖口還沾著草籽，看來不是在廣場繞三圈假裝冒險。很好。' },
                { speaker: 'npc', text: '這些路線我會讓守衛重新標上去。接下來去找書記，他剛剛整理的下一份聽聞，應該可以正式動手了。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'main_001', message: '村長把你的近郊路線紀錄收進城鎮地圖。' }
            ],
            route: 'quest',
            routeLabel: '查看旅人手札'
        },
        {
            id: 'elder_main_002_ready',
            priority: 78,
            conditions: [
                { type: 'questStatus', questId: 'main_002', status: 'active' }
            ],
            narrativeTitle: '史萊姆聽聞',
            narrativeSummary: '你與村長確認了書記的委託。農田邊的史萊姆不是單純麻煩，而像是某種更深異常冒出地表前的試探。',
            lines: [
                { speaker: 'npc', text: '書記請你處理農田邊的史萊姆，先照他的紀錄走。小麻煩如果放著不管，通常會很努力地長成大麻煩。' },
                { speaker: 'npc', text: '等史萊姆清完，回去找書記。他會把時間和地點補進旅人手札，我只負責提醒你別在泥裡睡著。' }
            ]
        },
        {
            id: 'elder_main_004_available',
            priority: 94,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'main_004', status: 'available' }
            ],
            narrativeTitle: '銀絲伏道',
            narrativeSummary: '鍛造師修好的誘餌鉤被送回村長手上。村長要你沿著獵人棧道、舊營火點與被割裂的木牌確認銀絲收束的位置。',
            lines: [
                { speaker: 'npc', text: '鍛造師把誘餌鉤交回來了。他說這東西現在能用，語氣聽起來像是在替你寫遺書。' },
                { speaker: 'npc', text: '先沿著獵人棧道查。舊營火點、被割裂的木牌、銀絲最密的伏道，這三個位置應該能把牠的習慣拼出來。' },
                { speaker: 'npc', text: '記住，牠不是等你找到牠。牠是在等你變得可以預測。這點很討厭，也很像某些稅務員。' }
            ],
            effects: [
                { type: 'acceptQuest', questId: 'main_004', message: '村長把銀絲伏道列為下一段調查。' }
            ],
            route: 'adventure',
            routeLabel: '前往獵人棧道'
        },
        {
            id: 'elder_main_004_active',
            priority: 82,
            conditions: [
                { type: 'questStatus', questId: 'main_004', status: 'active' }
            ],
            narrativeTitle: '獵人棧道',
            narrativeSummary: '村長把獵人棧道的異常重新說了一遍。銀絲不像巢穴，更像一種觀察行人的陷阱；舊營火、木牌與誘餌鉤應該被一起追查。',
            lines: [
                { speaker: 'npc', text: '獵人棧道不是普通封路。銀絲會出現在回程方向，代表那東西在觀察人的習慣。' },
                { speaker: 'npc', text: '別把牠當成等在巢穴裡的怪物。照著舊營火、木牌和誘餌鉤去推，讓牠自己犯錯。' }
            ]
        },
        {
            id: 'elder_main_006_available',
            priority: 94,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'main_006', status: 'available' }
            ],
            narrativeTitle: '血月下的折角',
            narrativeSummary: '古樹守衛倒下後，溪谷污染順著水流擴散。村長要你追蹤月苔坡、斷角營地與夜裡被撞裂的石頭，找出血月角鹿的移動路線。',
            lines: [
                { speaker: 'npc', text: '古樹守衛倒下後，村外沒有真的安靜。夜裡有人聽見角撞石頭的聲音，一下、一下，像頭痛到快瘋的鐘。' },
                { speaker: 'npc', text: '去月苔坡看看。再比對斷角營地的路線，如果那頭角鹿是沿著污染溪水移動，我們就能把牠逼到正確位置。' },
                { speaker: 'npc', text: '別把牠當戰利品。牠是上一場災難留下的回聲，只是這回聲會把人撞成兩半。' }
            ],
            effects: [
                { type: 'acceptQuest', questId: 'main_006', message: '村長把血月角鹿狩獵列為第一章收束。' }
            ],
            route: 'adventure',
            routeLabel: '前往月苔坡'
        },
        {
            id: 'elder_main_006_active',
            priority: 82,
            conditions: [
                { type: 'questStatus', questId: 'main_006', status: 'active' }
            ],
            narrativeTitle: '血月回聲',
            narrativeSummary: '村長把血月角鹿視為森林污染的第二個傷口。接下來該追的不是公告文字，而是月苔、碎角與夜裡被撞裂的石頭。',
            lines: [
                { speaker: 'npc', text: '血月角鹿不是新的源頭，是森林污染順著溪流跑出去後留下的第二個傷口。' },
                { speaker: 'npc', text: '追牠時不要只看地圖。看月苔、碎角和夜裡被撞裂的石頭，它們比公告欄誠實得多。' }
            ]
        },
        {
            id: 'elder_after_notice',
            priority: 45,
            conditions: [
                { type: 'questStatus', questId: 'main_002', statuses: ['active', 'completed', 'finished'] }
            ],
            narrativeTitle: '城鎮提醒',
            narrativeSummary: '村長把城鎮裡幾個重要去處又念了一次。你記下南門外、書記、鍛造鋪與藥師的方向，這些地方會逐步把邊境異常串起來。',
            lines: [
                { speaker: 'npc', text: '你現在要記住三個地方：南門外、書記的旅人手札、鍛造鋪。前兩個讓你知道該去哪，第三個讓你去了以後比較不會被折成兩段。' },
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
            priority: 50,
            once: true,
            narrativeTitle: '鍛造鋪',
            narrativeSummary: '你與鍛造師打過照面。他對你的舊劍很不放心，也讓你明白：城外帶回來的礦石、怪物部件與圖紙，會直接影響你能走多遠。',
            lines: [
                { speaker: 'npc', text: '你那把舊劍還能用，但我說「能用」的標準很寬。拿來烤肉也算能用。' },
                { speaker: 'npc', text: '帶回鐵礦石、怪物部件或真正的圖紙，我就能讓你的裝備少一點像事故現場。' }
            ]
        },
        {
            id: 'blacksmith_main_003_available',
            priority: 94,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'main_003', status: 'available' }
            ],
            narrativeTitle: '斷裂誘餌鉤',
            narrativeSummary: '書記的紀錄把獵人棧道旁的斷鉤送到鍛造師桌上。鍛造師要你先完成一次裝備強化，才願意把誘餌鉤修成能反設陷阱的形狀。',
            lines: [
                { speaker: 'npc', text: '這枚斷鉤切口太乾淨了。不是狼，不是盜賊，除非盜賊最近開始用鐮刀修指甲。' },
                { speaker: 'npc', text: '你先完成一次裝備強化。誘餌鉤可以修，但拿著誘餌的人如果一碰就碎，整件事就只剩我幫你收屍。' },
                { speaker: 'npc', text: '放心，我說話一向很溫柔。只是鐵砧回音比較誠實。' }
            ],
            effects: [
                { type: 'acceptQuest', questId: 'main_003', message: '鍛造師要求你先完成一次裝備強化。' }
            ],
            route: 'forge',
            routeLabel: '前往鍛造'
        },
        {
            id: 'blacksmith_main_003_active',
            priority: 86,
            conditions: [
                { type: 'questStatus', questId: 'main_003', status: 'active' }
            ],
            narrativeTitle: '斷裂誘餌鉤',
            narrativeSummary: '鍛造師看過那枚斷鉤後，認為獵人棧道的切痕不像普通野獸。你需要先整理裝備，再帶著能反設陷阱的誘餌回到路上。',
            lines: [
                { speaker: 'npc', text: '這枚斷鉤的切口太乾淨，不像狼也不像盜賊。它比較像某種東西順手量了一下你的脖子寬度。' },
                { speaker: 'npc', text: '先完成一次強化。誘餌鉤可以修，問題是拿著誘餌的人也得撐得住第一下。' }
            ]
        },
        {
            id: 'blacksmith_forge_commission',
            priority: 70,
            conditions: [
                { type: 'questStatus', questId: 'commission_forge_001', statuses: ['available', 'active', 'completed'] }
            ],
            narrativeTitle: '圖紙研究',
            narrativeSummary: '鍛造師提醒你，真正有價值的圖紙多半藏在怪物、菁英與副本首領身上。鍛造鋪不只是商店，而會慢慢變成戰力成長的核心。',
            lines: [
                { speaker: 'npc', text: '那份鍛造筆記不是完整圖紙，只是方向。真正有價值的圖紙，多半黏在怪物、菁英或副本首領身上。' },
                { speaker: 'npc', text: '聽起來很不衛生？很好，代表你開始理解冒險者的經濟模型了。' }
            ]
        },
        {
            id: 'blacksmith_default',
            priority: 1,
            lines: [
                { speaker: 'npc', text: '城外的東西越來越硬，代表我的生意會變好，也代表大家的日子會變差。很不幸，兩件事通常一起發生。' }
            ]
        }
    ],

    herbalist: [
        {
            id: 'herbalist_slime_hint',
            priority: 70,
            conditions: [
                { type: 'questStatus', questId: 'main_002', statuses: ['active', 'completed'] }
            ],
            narrativeTitle: '藥師的判斷',
            narrativeSummary: '藥師認為史萊姆靠近農田不是偶然。土裡的魔力味道正在改變，凝膠樣本也許能讓她判斷異常是不是從地脈往外滲。',
            lines: [
                { speaker: 'npc', text: '史萊姆靠近農田不是因為牠們忽然熱愛農業。土裡的魔力味道變了。' },
                { speaker: 'npc', text: '如果你清掉牠們，順手帶回凝膠。我能做藥，村民能安心，史萊姆也終於不用被誤會成農夫。' }
            ]
        },
        {
            id: 'herbalist_witch_foreshadow',
            priority: 40,
            conditions: [
                { type: 'questStatus', questId: 'main_007', statuses: ['active', 'completed', 'finished'] },
                { type: 'flag', flag: 'readCrossroadsNoticeBoard' }
            ],
            narrativeTitle: '草藥失蹤',
            narrativeSummary: '藥師提到草藥像是被人照著清單拔走。這不像野獸行為，反而像某種懂得年份與價值的交換規則。',
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
            id: 'beggar_broke_wisdom',
            priority: 120,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'hidden_broke', status: 'active' }
            ],
            narrativeTitle: '一無所有',
            narrativeSummary: '你在身無分文時回到暗巷。巷口流浪者沒有嘲笑你，只把真正窮過的人才懂的生存方法塞進你的手札。這條聽聞不是委託，而是一種活下去的眼力。',
            lines: [
                { speaker: 'npc', text: '現在才像話。口袋空到連灰塵都搬家了，眼睛反而開始能看見東西。' },
                { speaker: 'npc', text: '記住，沒錢不是最糟。最糟的是明明沒錢，還相信自己很體面。你要找路，就先學會看別人不願看的角落。' },
                { speaker: 'npc', text: '拿去，這不是施捨。這叫做前輩把摔過的坑畫給你看。下次跌進去，至少可以挑個比較淺的。' }
            ],
            effects: [
                { type: 'questProgress', objectiveType: 'talk', target: 'beggar', amount: 1, message: '巷口流浪者把一無所有時的生存法則寫進你的手札。' },
                { type: 'completeQuest', questId: 'hidden_broke', message: '你從巷口流浪者那裡學到一種窮到發亮的生存智慧。' }
            ]
        },
        {
            id: 'beggar_first_talk',
            priority: 90,
            once: true,
            tone: 'discovery',
            narrativeTitle: '巷口低語',
            narrativeSummary: '你與巷口流浪者談完後，總覺得他不是單純在討生活。你轉身離開時，似乎有人在暗巷口停了一下；也許只是你多疑，也許不是。',
            lines: [
                { speaker: 'npc', text: '口袋空了，人才會看見路邊真正有用的東西。你現在口袋還不夠空，但眼神差不多了。' },
                { speaker: 'npc', text: '這算不算祝福？算便宜的預言。真正的預言通常要收訂金。' }
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
            narrativeTitle: '暗巷入口',
            narrativeSummary: '巷口流浪者知道暗巷的門已經開了。他沒有阻止你，只提醒你：會收古代錢幣的人，通常也會收更麻煩的代價。',
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
            id: 'scholar_main_002_available',
            priority: 98,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'main_002', status: 'available' }
            ],
            narrativeTitle: '書記的異常紀錄',
            narrativeSummary: '你與書記核對了南門外的聽聞。農田附近的史萊姆數量異常，書記把它視為地脈問題浮上地表前的第一個可追蹤症狀。',
            lines: [
                { speaker: 'npc', text: '村長把南門外的路線記回來了？很好，現在那些「聽說」終於可以排成順序。' },
                { speaker: 'npc', text: '最近城外史萊姆變多，尤其靠近農田那一帶。村民說夜裡會聽見黏糊糊的聲音，這句話我其實很不想寫進正式紀錄。' },
                { speaker: 'npc', text: '先清掉 5 個靠近農田的史萊姆。這不是原因本身，而是地脈異常浮上地表的第一個症狀。' }
            ],
            effects: [
                { type: 'worldInteraction', interactionId: 'scholar_slime_request' },
                { type: 'acceptQuest', questId: 'main_002', message: '書記把史萊姆調查列為下一步。' }
            ],
            route: 'quest',
            routeLabel: '查看旅人手札'
        },
        {
            id: 'scholar_main_002_active',
            priority: 84,
            conditions: [
                { type: 'questStatus', questId: 'main_002', status: 'active' }
            ],
            narrativeTitle: '農田邊的黏液聲',
            narrativeSummary: '書記提醒你，史萊姆的方向比數量更重要。若牠們都從同一側靠近農田，那就不是普通增生，而是地底某處正在把牠們往外推。',
            lines: [
                { speaker: 'npc', text: '農田邊的史萊姆要先清掉。記得看牠們從哪個方向靠近，旅人手札需要的是順序，不是單純的數量。' },
                { speaker: 'npc', text: '如果你聞到甜味，別靠太近。上次有人說那是青蘋果，後來我們花了一整天清洗他的靴子。' }
            ],
            route: 'adventure',
            routeLabel: '前往冒險區'
        },
        {
            id: 'scholar_slime_report',
            priority: 100,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'main_002', status: 'completed' }
            ],
            narrativeTitle: '史萊姆紀錄',
            narrativeSummary: '你把史萊姆增生的結果交給書記。書記把時間、方位與農田位置排在一起，判斷這更像地脈把某種異常往地表推。',
            lines: [
                { speaker: 'npc', text: '你回來得剛好。我已經把農田附近的時間、方位和黏液味道都留了空格。最後一項其實可以不用填得太詳細。' },
                { speaker: 'npc', text: '史萊姆數量被壓下去了，但牠們靠近農田這件事本身更重要。這不像普通增生，比較像地脈把某種東西往地表推。' },
                { speaker: 'npc', text: '我會把你的紀錄歸檔。之後如果同一方向又出現痕跡，我們就知道不是巧合。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'main_002', message: '書記把史萊姆增生紀錄補完，並標註為地脈異常的早期跡象。' }
            ],
            route: 'quest',
            routeLabel: '查看旅人手札'
        },
        {
            id: 'scholar_slime_request',
            priority: 95,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'flag', flag: 'metVillageElder' },
                { type: 'questStatus', questId: 'main_001', status: 'active' },
                { type: 'questStatus', questId: 'main_002', status: 'locked' },
                { type: 'questStatus', questId: 'bounty_001', status: 'locked' }
            ],
            narrativeTitle: '第一份記錄',
            narrativeSummary: '你找過書記後，知道旅人手札會依照發現順序留下紀錄。書記先替你開了一頁空白：南門外近郊，三處可通行路線。',
            lines: [
                { speaker: 'npc', text: '村長讓你來看旅人手札？很好，終於有人願意把「聽說」變成「可追蹤」。' },
                { speaker: 'npc', text: '今天先不談怪物。你要去南門外近郊，記下 3 處還能通行的路線。' },
                { speaker: 'npc', text: '路線、方向、看到的痕跡，都照順序寫。等你回來，我們再把那些真正會咬人的麻煩排進去。' }
            ],
            effects: [
                { type: 'setFlag', flag: 'metTownScholarForRoute', value: true },
                { type: 'questProgress', objectiveType: 'talk', target: 'town_scholar', amount: 1, message: '書記替你開啟了第一頁南門外近郊紀錄。' }
            ],
            route: 'adventure',
            routeLabel: '前往南門外'
        },
        {
            id: 'scholar_first_leyline',
            priority: 80,
            once: true,
            narrativeTitle: '地脈概念',
            narrativeSummary: '書記用很不安心的方式解釋了地脈：它不是一條河，而像全大陸共用的繩結。若北方有人猛拉，石階鎮這邊遲早也會斷出聲音。',
            lines: [
                { speaker: 'npc', text: '地脈不是河流，比較像全大陸共用的一條爛繩子。現在有人從北邊猛拉，南邊自然會一起斷。' },
                { speaker: 'npc', text: '這句話很學術，也很不安心。學術的作用之一，就是把不安心分類保存。' }
            ],
            route: 'encyclopedia',
            routeLabel: '查看紀錄'
        },
        {
            id: 'scholar_main_005_available',
            priority: 94,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'main_005', status: 'available' }
            ],
            narrativeTitle: '發黑樹皮',
            narrativeSummary: '獵人棧道重新打通後，書記終於能把遠處的焦黑煙霧連到腐根溪谷。狼群、霧碑拓印與發黑樹皮都指向神木核心。',
            lines: [
                { speaker: 'npc', text: '獵人棧道能走了，遠處那團焦黑煙霧就不再只是「看起來不妙」。它正式升級成「非常不妙」。' },
                { speaker: 'npc', text: '腐根溪谷有發黑樹皮，霧碑丘有舊文字，狼群牙痕也不是普通遷徙。三件事放在一起，像森林在喊疼。' },
                { speaker: 'npc', text: '先擊退被污染驅趕的狼群，再找出古樹守衛的核心。它不是敵人，但現在會把靠近的人都當成斧頭。' }
            ],
            effects: [
                { type: 'acceptQuest', questId: 'main_005', message: '書記把腐根溪谷與古樹守衛列為下一段調查。' }
            ],
            route: 'adventure',
            routeLabel: '前往腐根溪谷'
        },
        {
            id: 'scholar_main_005_active',
            priority: 82,
            conditions: [
                { type: 'questStatus', questId: 'main_005', status: 'active' }
            ],
            narrativeTitle: '發黑樹皮',
            narrativeSummary: '書記認為發黑樹皮不是普通燃燒，而像高熱力量剝離核心後留下的傷口。狼牙痕、霧碑拓印與溪谷煙霧應該一起追查。',
            lines: [
                { speaker: 'npc', text: '發黑樹皮不是燒焦，外層仍然潮濕。它像是被某種高熱力量剝走後，留下來的傷口。' },
                { speaker: 'npc', text: '狼牙痕、霧碑拓印和溪谷煙霧要一起看。只看其中一個，你會以為森林在發怒；三個放在一起，就像森林在喊疼。' }
            ],
            route: 'adventure',
            routeLabel: '前往腐根溪谷'
        },
        {
            id: 'scholar_chapter2_opening',
            priority: 82,
            conditions: [
                { type: 'questStatus', questId: 'main_007', statuses: ['available', 'active'] }
            ],
            narrativeTitle: '丘陵的執念',
            narrativeSummary: '書記把霧碑丘陵描述成多條跡象同時打開的地方。石碑、草藥、潮聲與亡靈不會立刻拼成答案，你需要先記清每個人說過什麼。',
            lines: [
                { speaker: 'npc', text: '霧碑丘陵會比邊境更麻煩。第一章像一條傷口，第二章比較像有人把整張繃帶撕開。' },
                { speaker: 'npc', text: '石碑、草藥、潮聲和亡靈會從不同方向冒出來。不要急著把它們塞成同一個答案，先把每個人說過的話記清楚。' }
            ],
            route: 'adventure',
            routeLabel: '前往霧碑丘陵'
        },
        {
            id: 'scholar_after_board',
            priority: 40,
            conditions: [
                { type: 'flag', flag: 'heardScholarSlimeRequest' }
            ],
            narrativeTitle: '線索排序',
            narrativeSummary: '書記提醒你，怪物本身只是表面。真正重要的是時間、地點與方向能不能排成順序；如果能，線索就會開始說話。',
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
