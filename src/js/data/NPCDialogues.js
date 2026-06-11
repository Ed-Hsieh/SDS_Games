/**
 * NPCDialogues.js
 * First-pass town NPC dialogue data for Chapter 1.
 * Dialogue logic lives in DialogueManager; this file stays declarative.
 */

export const TownNPCDatabase = {
    village_elder: {
        id: 'village_elder',
        portrait: 'src/assets/images/generated/2026-06-10/cropped/portraits/village_elder.png',
        name: '村長',
        avatar: '🏘️',
        role: '城鎮十字路的管理者',
        location: '城鎮十字路',
        route: 'quest',
        routeLabel: '查看旅人手札'
    },
    blacksmith: {
        id: 'blacksmith',
        portrait: 'src/assets/images/generated/2026-06-10/cropped/portraits/blacksmith.png',
        name: '鍛造師',
        avatar: '⚒️',
        role: '負責修整武器與研究圖紙',
        location: '鍛造鋪'
    },
    herbalist: {
        id: 'herbalist',
        portrait: 'src/assets/images/generated/2026-06-10/cropped/portraits/herbalist.png',
        name: '藥師',
        avatar: '🌿',
        role: '記錄草藥、毒霧與居民傷勢',
        location: '市集邊棚',
        route: 'shop',
        routeLabel: '前往市集'
    },
    street_beggar: {
        id: 'street_beggar',
        portrait: 'src/assets/images/generated/2026-06-10/cropped/portraits/street_beggar.png',
        name: '巷口流浪者',
        avatar: '🧥',
        role: '知道太多小道消息的人',
        location: '暗巷入口'
    },
    town_scholar: {
        id: 'town_scholar',
        portrait: 'src/assets/images/generated/2026-06-10/cropped/portraits/town_scholar.png',
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
            narrativeSummary: '村長要你先找書記確認旅人手札的記錄方式。聽聞寫對了，再往草叢裡衝才比較不像把自己寄給溝渠。',
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
            narrativeSummary: '你與村長確認了書記的委託。農田邊的史萊姆透出更深的異常，像地底有什麼東西先把黏液推上來探路。',
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
                { speaker: 'npc', text: '記住，牠不會乖乖坐在那裡等你找到。牠等的是你的習慣變得可以預測。這點很討厭，也很像某些稅務員。' }
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
                { speaker: 'npc', text: '獵人棧道的封路太乾淨了。銀絲會出現在回程方向，代表那東西正在觀察人的習慣。' },
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
            narrativeSummary: '村長把血月角鹿視為森林污染的第二個傷口。接下來要追月苔、碎角，以及夜裡被撞裂的石頭。',
            lines: [
                { speaker: 'npc', text: '血月角鹿更像森林污染順著溪流跑出去後留下的第二個傷口。' },
                { speaker: 'npc', text: '追牠時不要只看地圖。看月苔、碎角和夜裡被撞裂的石頭，它們比公告欄誠實得多。' }
            ]
        },
        {
            id: 'elder_guard_boots_offer',
            priority: 64,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'main_001', status: 'finished' },
                { type: 'questStatus', questId: 'commission_guard_boots', status: 'locked' }
            ],
            narrativeTitle: '南門守衛的靴底',
            narrativeSummary: '村長提到南門守衛的靴底被黏液和碎石磨穿。這不夠像英雄任務，卻是城鎮每天能不能繼續看路的小事。',
            lines: [
                { speaker: 'npc', text: '南門外路線重新標回來後，守衛每天都得多走一段。結果他的靴底先向命運投降了。' },
                { speaker: 'npc', text: '別露出那種「這也算委託嗎」的表情。世界末日前，大家還是得穿鞋。' },
                { speaker: 'npc', text: '帶 3 張獸皮回來。靴底補好，明天才有人能站在門口看路，不用赤腳跟黏液搏鬥。' }
            ],
            effects: [
                { type: 'unlockQuest', questId: 'commission_guard_boots' },
                { type: 'acceptQuest', questId: 'commission_guard_boots', message: '村長把南門守衛的靴底交給你處理。' }
            ],
            route: 'adventure',
            routeLabel: '收集獸皮'
        },
        {
            id: 'elder_guard_boots_active',
            priority: 54,
            conditions: [
                { type: 'questStatus', questId: 'commission_guard_boots', status: 'active' }
            ],
            narrativeTitle: '守衛仍在站崗',
            narrativeSummary: '村長提醒你帶回獸皮。守衛那雙快裂開的靴子很小，卻能證明城鎮每天仍有人站在門口看路。',
            lines: [
                { speaker: 'npc', text: '獸皮 3 張。別挑太漂亮的，靴底不需要參加宴會。' },
                { speaker: 'npc', text: '守衛能站穩，南門的路線紀錄才會繼續更新。小事堆起來，城鎮才像城鎮。' }
            ]
        },
        {
            id: 'elder_guard_boots_report',
            priority: 108,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_guard_boots', status: 'completed' }
            ],
            narrativeTitle: '南門重新站穩',
            narrativeSummary: '你把獸皮交給村長。南門守衛的靴底被補好，城鎮每天看路的人也重新站穩。',
            lines: [
                { speaker: 'npc', text: '獸皮夠了。守衛聽到以後非常感動，感動到問我能不能順便補另一隻。' },
                { speaker: 'npc', text: '我拒絕了。做人要懂得保留後續委託。' },
                { speaker: 'npc', text: '玩笑歸玩笑，南門有人站穩，路線紀錄才不會斷。這種事不會進英雄詩，但城鎮靠它活。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'commission_guard_boots', message: '南門守衛的靴底被補好，城鎮路線巡查恢復穩定。' },
                { type: 'setFlag', flag: 'town.south_gate.guard_route_ready', value: true }
            ]
        },
        {
            id: 'elder_ash_ledger_offer',
            priority: 88,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'main_011', status: 'active' },
                { type: 'questStatus', questId: 'commission_ash_ledger_names', status: 'locked' }
            ],
            narrativeTitle: '帳冊上的名字',
            narrativeSummary: '村長把失蹤工匠名單從抽屜裡拿出來。灰燼男爵的帳冊讓這些名字不再只是傳聞，而是城鎮必須面對的傷口。',
            lines: [
                { speaker: 'npc', text: '這份名單我藏了很久。藏起來不是因為我不在乎，是因為名字一貼出去，家屬就不能再假裝人只是晚點回家。' },
                { speaker: 'npc', text: '灰燼男爵的帳冊上有同樣的記號。去黑鐵倉道附近擊退影兵，帶回 2 枚影徽。我要知道那些工匠是不是真的被帶往要塞。' },
                { speaker: 'npc', text: '有些真相不會讓城鎮變安全，但會讓我們停止對自己說謊。這也是一種修補，只是比較疼。' }
            ],
            effects: [
                { type: 'unlockQuest', questId: 'commission_ash_ledger_names' },
                { type: 'acceptQuest', questId: 'commission_ash_ledger_names', message: '村長把失蹤工匠名單交給你追查。' }
            ],
            route: 'adventure',
            routeLabel: '前往黑鐵倉道'
        },
        {
            id: 'elder_ash_ledger_active',
            priority: 74,
            conditions: [
                { type: 'questStatus', questId: 'commission_ash_ledger_names', status: 'active' }
            ],
            narrativeTitle: '黑鐵倉道',
            narrativeSummary: '村長提醒你帶回影徽。這不是為了討伐名聲，而是為了確認那些被灰燼帳冊吞掉的名字。',
            lines: [
                { speaker: 'npc', text: '影兵 4 名，影徽 2 枚。數量我寫得很清楚，因為這種事不能靠猜。' },
                { speaker: 'npc', text: '如果真是男爵的人帶走了工匠，我會把名單貼上公告欄。城鎮會很安靜，但至少那不是假裝沒事的安靜。' }
            ]
        },
        {
            id: 'elder_ash_ledger_report',
            priority: 110,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_ash_ledger_names', status: 'completed' }
            ],
            narrativeTitle: '失蹤名單',
            narrativeSummary: '你把影徽交給村長。失蹤工匠的名字被釘上公告欄，城鎮變得很安靜，卻終於不再假裝。',
            lines: [
                { speaker: 'npc', text: '影徽對上了。那些工匠不是走丟，不是晚歸，也不是去遠方找更好的工錢。' },
                { speaker: 'npc', text: '我會把名單貼出去。有人會哭，有人會罵我為什麼現在才說。兩種我都該聽。' },
                { speaker: 'npc', text: '男爵怕世界燒掉，所以先把別人的明天挖空。這種人比怪物麻煩，因為他還會替自己找理由。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'commission_ash_ledger_names', message: '失蹤工匠名單被釘上公告欄。' },
                { type: 'setFlag', flag: 'town.notice_board.missing_workers_named', value: true }
            ]
        },
        {
            id: 'elder_worker_marks_offer',
            priority: 88,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_ash_ledger_names', status: 'finished' },
                { type: 'questStatus', questId: 'commission_ash_ledger_names_002', statuses: ['locked', 'available'] }
            ],
            narrativeTitle: '工匠最後的刻痕',
            narrativeSummary: '失蹤名單公開後，家屬交出工匠舊工具。工具柄上的刻痕將灰燼男爵的地宮工程從傳聞變成可追查路線。',
            lines: [
                { speaker: 'npc', text: '名單貼出去後，有人把這柄舊工具交給我。她說丈夫失蹤前每晚都磨它，像怕刻痕不夠深。' },
                { speaker: 'npc', text: '你看這幾道線，不像裝飾。像路線，也像一個人不能寫信時，用木頭留下的方向。' },
                { speaker: 'npc', text: '去黑鐵倉道擊退 3 名影兵，帶回 1 份暗鋼。如果材料對上，男爵的地宮就不是傳聞，是我們腳下的傷口。' }
            ],
            effects: [
                { type: 'unlockQuest', questId: 'commission_ash_ledger_names_002' },
                { type: 'acceptQuest', questId: 'commission_ash_ledger_names_002', message: '村長把工匠工具柄上的刻痕交給你追查。' }
            ]
        },
        {
            id: 'elder_worker_marks_active',
            priority: 75,
            conditions: [
                { type: 'questStatus', questId: 'commission_ash_ledger_names_002', status: 'active' }
            ],
            narrativeTitle: '黑鐵倉道',
            narrativeSummary: '村長提醒你依照工具柄刻痕追查黑鐵倉道。這段支線讓工匠從失蹤名單變成留下線索的人。',
            lines: [
                { speaker: 'npc', text: '影兵 3 名，暗鋼 1 份。不要只看敵人，也看倉道牆面。工匠留下的東西通常比帳冊誠實。' },
                { speaker: 'npc', text: '家屬問我這能不能帶人回來。我不敢答應，只能先把路找出來。' }
            ]
        },
        {
            id: 'elder_worker_marks_report',
            priority: 112,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_ash_ledger_names_002', status: 'completed' }
            ],
            narrativeTitle: '刻回家的路',
            narrativeSummary: '你帶回暗鋼與戰鬥紀錄。村長把工具刻痕拓片貼在失蹤名單旁，讓工匠留下的方向成為追查男爵地宮的證據。',
            lines: [
                { speaker: 'npc', text: '暗鋼對上了。那些工匠確實被迫替男爵挖地下工程。' },
                { speaker: 'npc', text: '我會把刻痕拓片貼在名單旁。那些人不是只被帶走，他們也把路刻回來了。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'commission_ash_ledger_names_002', message: '工匠刻痕被貼上公告欄，黑曜石地宮的方向更清楚了。' },
                { type: 'setFlag', flag: 'town.notice_board.worker_marks_mapped', value: true }
            ]
        },
        {
            id: 'elder_northern_letter_offer',
            priority: 90,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'main_012', status: 'active' },
                { type: 'questStatus', questId: 'commission_northern_letter', status: 'locked' }
            ],
            narrativeTitle: '北境來信',
            narrativeSummary: '一名信使倒在城門口，懷裡不是戰報，而是一封寫給母親的家書。北境第一次不只是地圖上的危險區。',
            lines: [
                { speaker: 'npc', text: '信使倒在城門口時，懷裡抓著這封信。不是軍令，不是王都密件，只是一封家書。' },
                { speaker: 'npc', text: '他寫北境天空變紅，也寫軍糧豆子硬得能拿來修牆。你看，世界末日前，還是有人在抱怨豆子。' },
                { speaker: 'npc', text: '去北境路線擊退 2 隻飛龍斥候，帶回 2 片飛龍鱗。我要確認他是從哪條熱風路上撐回來的。' }
            ],
            effects: [
                { type: 'unlockQuest', questId: 'commission_northern_letter' },
                { type: 'acceptQuest', questId: 'commission_northern_letter', message: '村長把北境信使的家書交給你追查。' }
            ],
            route: 'adventure',
            routeLabel: '前往北境路線'
        },
        {
            id: 'elder_northern_letter_active',
            priority: 76,
            conditions: [
                { type: 'questStatus', questId: 'commission_northern_letter', status: 'active' }
            ],
            narrativeTitle: '焦邊家書',
            narrativeSummary: '村長提醒你追查飛龍斥候與熱風路線。那封信不會教你屠龍，卻會讓北境變成有人等過回信的地方。',
            lines: [
                { speaker: 'npc', text: '飛龍斥候 2 隻，飛龍鱗 2 片。帶回來，我們才能把信使的路線標上去。' },
                { speaker: 'npc', text: '別小看家書。戰報讓人知道哪裡失守，家書讓人知道那裡原本有人生活。' }
            ]
        },
        {
            id: 'elder_northern_letter_report',
            priority: 112,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_northern_letter', status: 'completed' }
            ],
            narrativeTitle: '北方的聲音',
            narrativeSummary: '你把飛龍鱗交給村長。北境來信被收進城鎮紀錄，那不是戰報，卻讓所有人第一次真的聽見北方。',
            lines: [
                { speaker: 'npc', text: '鱗片有熱裂紋。信使穿過的不是普通山路，是被龍焰掃過的風口。' },
                { speaker: 'npc', text: '我會把信收進紀錄，也會找人替他念完。不能送到的信，至少不該再被風吃掉。' },
                { speaker: 'npc', text: '北方不只是古龍所在的地方。那裡有人寫信，有人抱怨豆子，也有人還在等。這比預言更難放下。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'commission_northern_letter', message: '北境來信被收進城鎮紀錄。' },
                { type: 'setFlag', flag: 'town.refugees.northern_letters', value: true }
            ]
        },
        {
            id: 'elder_unsent_reply_offer',
            priority: 89,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_northern_letter', status: 'finished' },
                { type: 'questStatus', questId: 'commission_northern_letter_002', statuses: ['locked', 'available'] }
            ],
            narrativeTitle: '沒有寄出的回信',
            narrativeSummary: '北境家書被收進紀錄後，村長找到一封沒有寄出的回信。這段支線把古龍壓力拉回城鎮裡等待消息的人。',
            lines: [
                { speaker: 'npc', text: '我找到一封回信，沒寄出去。信上只有一句：「我知道了。」短得像偷懶，重得像石頭。' },
                { speaker: 'npc', text: '送不到也得確認路還在不在。等待的人最怕的不是壞消息，是永遠不知道自己有沒有被聽見。' },
                { speaker: 'npc', text: '去熱痕路線擊退 2 隻幼龍，帶回 1 枚龍牙。我要知道北境的回音是不是已經被龍族咬斷。' }
            ],
            effects: [
                { type: 'unlockQuest', questId: 'commission_northern_letter_002' },
                { type: 'acceptQuest', questId: 'commission_northern_letter_002', message: '村長把沒有寄出的北境回信交給你追查。' }
            ]
        },
        {
            id: 'elder_unsent_reply_active',
            priority: 76,
            conditions: [
                { type: 'questStatus', questId: 'commission_northern_letter_002', status: 'active' }
            ],
            narrativeTitle: '回信路線',
            narrativeSummary: '村長提醒你追查熱痕路線。這不是送信任務，而是確認城鎮的回答還有沒有抵達北境的可能。',
            lines: [
                { speaker: 'npc', text: '幼龍 2 隻，龍牙 1 枚。只要確認路線是否被封住，不必真的把信塞進龍嘴裡。' },
                { speaker: 'npc', text: '這封信送不到也沒關係。至少我們要證明，城鎮不是沒有回話。' }
            ]
        },
        {
            id: 'elder_unsent_reply_report',
            priority: 113,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_northern_letter_002', status: 'completed' }
            ],
            narrativeTitle: '回音被留下',
            narrativeSummary: '你確認北境回信路線已被龍族封鎖。村長把未寄出的回信收進紀錄，讓等待的人知道沉默不是沒人在乎。',
            lines: [
                { speaker: 'npc', text: '龍牙上的熱痕很新。路線被封住了，這封信確實送不到。' },
                { speaker: 'npc', text: '我會把它收在來信旁邊。它沒抵達北方，但至少抵達了城鎮裡那些一直等著回話的人。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'commission_northern_letter_002', message: '沒有寄出的北境回信被收進城鎮紀錄。' },
                { type: 'setFlag', flag: 'town.refugees.unsent_reply_archived', value: true }
            ]
        },
        {
            id: 'elder_broken_standard_offer',
            priority: 91,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'main_014', statuses: ['active', 'completed', 'finished'] },
                { type: 'questStatus', questId: 'commission_broken_standard', statuses: ['locked', 'available'] }
            ],
            narrativeTitle: '斷旗手芙蕾',
            narrativeSummary: '深淵前鋒逼近後，村長收到北境斷旗手芙蕾送回的殘旗。這條支線讓第三章的前線撤退與城鎮士氣接上。',
            lines: [
                { speaker: 'npc', text: '北境送回一面斷旗。送旗的人叫芙蕾，手抖得厲害，卻一路沒有把旗放下。' },
                { speaker: 'npc', text: '深淵士兵把惡魔角飾掛在旗杆上，想讓撤退看起來像羞辱。這招很幼稚，也很有效。人心有時候比城門薄。' },
                { speaker: 'npc', text: '幫她奪回角飾。城門需要那面旗，不是為了漂亮，是為了讓大家知道撤退不是被拋下。' }
            ],
            effects: [
                { type: 'unlockQuest', questId: 'commission_broken_standard' },
                { type: 'acceptQuest', questId: 'commission_broken_standard', message: '村長把斷旗手芙蕾的請求交給你。' }
            ],
            route: 'adventure',
            routeLabel: '前往深淵前線'
        },
        {
            id: 'elder_broken_standard_active',
            priority: 77,
            conditions: [
                { type: 'questStatus', questId: 'commission_broken_standard', status: 'active' }
            ],
            narrativeTitle: '城門上的旗',
            narrativeSummary: '村長提醒你，斷旗需要惡魔角飾作為反證；把羞辱物取回來，才能讓城鎮把撤退重新讀成秩序。',
            lines: [
                { speaker: 'npc', text: '深淵士兵四名，角飾兩個。數字不複雜，麻煩的是路上那些想讓你變成數字的東西。' },
                { speaker: 'npc', text: '芙蕾還在城門旁站著。她說自己只是等風向，我看她是在等自己不再發抖。' }
            ]
        },
        {
            id: 'elder_broken_standard_report',
            priority: 113,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_broken_standard', status: 'completed' }
            ],
            narrativeTitle: '撤退不是潰敗',
            narrativeSummary: '你取回惡魔角飾並修補斷旗。村長把旗掛上城門，芙蕾終於放開旗杆，城鎮獲得一個新的防線狀態。',
            lines: [
                { speaker: 'npc', text: '角飾取回來了。好，讓它掛在公告欄旁邊，讓大家知道那不是我們的羞辱，是敵人的證據。' },
                { speaker: 'npc', text: '芙蕾剛剛終於坐下。她說腿麻了。我沒有拆穿她，今天城鎮需要一點善意的謊話。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'commission_broken_standard', message: '斷旗被重新掛上城門，撤退線的士氣穩住了。' },
                { type: 'setFlag', flag: 'town.gate.broken_standard_raised', value: true }
            ]
        },
        {
            id: 'elder_retreat_names_offer',
            priority: 90,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_broken_standard', status: 'finished' },
                { type: 'questStatus', questId: 'commission_broken_standard_002', statuses: ['locked', 'available'] }
            ],
            narrativeTitle: '旗影下的點名',
            narrativeSummary: '斷旗重新掛上城門後，芙蕾交出撤退名單。這段後續讓旗幟象徵落到每個尚未歸隊的人身上。',
            lines: [
                { speaker: 'npc', text: '芙蕾把撤退名單交給我了。她說旗掛上去就夠了，不必寫她。這句話通常代表很需要寫。' },
                { speaker: 'npc', text: '名單上有幾個人還沒回來。深淵追兵沿撤退線靠近，如果不截斷，他們會把空白變成更多空白。' },
                { speaker: 'npc', text: '擊退 5 名深淵士兵，帶回 1 個魔族角。我們要確認追兵批次被切斷，讓點名不再一直往下漏。' }
            ],
            effects: [
                { type: 'unlockQuest', questId: 'commission_broken_standard_002' },
                { type: 'acceptQuest', questId: 'commission_broken_standard_002', message: '村長把芙蕾的撤退名單交給你確認。' }
            ]
        },
        {
            id: 'elder_retreat_names_active',
            priority: 77,
            conditions: [
                { type: 'questStatus', questId: 'commission_broken_standard_002', status: 'active' }
            ],
            narrativeTitle: '撤退名單',
            narrativeSummary: '村長提醒你截斷深淵追兵。這次不是為旗幟，而是為了讓撤退名單上的人有機會被找回。',
            lines: [
                { speaker: 'npc', text: '深淵士兵 5 名，魔族角 1 個。這是追兵批次確認，不是戰利品收藏。' },
                { speaker: 'npc', text: '芙蕾站在城門下，看起來像在看旗，其實一直在看名單。' }
            ]
        },
        {
            id: 'elder_retreat_names_report',
            priority: 114,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_broken_standard_002', status: 'completed' }
            ],
            narrativeTitle: '名字被點亮',
            narrativeSummary: '你截斷追兵後，芙蕾把撤退名單念完。城門從士氣象徵延展成尋人與保護撤退者的場所。',
            lines: [
                { speaker: 'npc', text: '追兵批次斷了。好，今晚可以點名。' },
                { speaker: 'npc', text: '芙蕾剛才把名單念完，聲音很小，但每個名字都被聽見了。這比戰報有用。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'commission_broken_standard_002', message: '芙蕾的撤退名單被完整點過，城門旁新增尋人紀錄。' },
                { type: 'setFlag', flag: 'town.gate.retreat_names_called', value: true }
            ]
        },
        {
            id: 'elder_after_notice',
            priority: 45,
            conditions: [
                { type: 'questStatus', questId: 'main_002', statuses: ['active', 'completed', 'finished'] }
            ],
            narrativeTitle: '城鎮提醒',
            narrativeSummary: '村長把城鎮裡幾個重要地點又念了一次。你記下南門外、書記、鍛造鋪與藥師的方向，這些地方會逐步把邊境異常串起來。',
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
            id: 'blacksmith_chimney_offer',
            priority: 76,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'main_003', status: 'finished' },
                { type: 'questStatus', questId: 'commission_blacksmith_chimney', status: 'locked' }
            ],
            narrativeTitle: '鐵匠的煙囪',
            narrativeSummary: '鍛造師沒有直接談生意，而是盯著倒灌白煙的煙囪。你聽出那不是單純修爐子的請求，而是他想讓城鎮夜裡還有一盞火能穩穩亮著。',
            lines: [
                { speaker: 'npc', text: '看見那股白煙了嗎？正常煙應該往上，這股像喝醉的幽靈，非要回來跟我聊天。' },
                { speaker: 'npc', text: '別笑，爐火不穩，鍛造就只能靠運氣。靠運氣鍛造的人，通常最後都改行賣湯。' },
                { speaker: 'npc', text: '帶 5 個鐵礦石回來。我把煙道和爐口重新校準，之後你要把自己送去更危險的地方，至少裝備不會先背叛你。' }
            ],
            effects: [
                { type: 'unlockQuest', questId: 'commission_blacksmith_chimney' },
                { type: 'acceptQuest', questId: 'commission_blacksmith_chimney', message: '鍛造師把倒灌白煙的麻煩交給你。' }
            ],
            route: 'adventure',
            routeLabel: '收集鐵礦石'
        },
        {
            id: 'blacksmith_chimney_active',
            priority: 66,
            conditions: [
                { type: 'questStatus', questId: 'commission_blacksmith_chimney', status: 'active' }
            ],
            narrativeTitle: '爐火校準',
            narrativeSummary: '鍛造師提醒你先帶回鐵礦石。只要爐火穩住，鍛造鋪就不只是商店，而是城鎮能繼續抵抗城外異常的地方。',
            lines: [
                { speaker: 'npc', text: '5 個鐵礦石。不要拿長得像鐵礦的石頭來糊弄我，我被石頭騙過，經驗很豐富。' },
                { speaker: 'npc', text: '爐火穩了，裝備才穩。裝備穩了，你才有機會把城外那些不穩的東西敲回去。' }
            ]
        },
        {
            id: 'blacksmith_chimney_report',
            priority: 108,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_blacksmith_chimney', status: 'completed' }
            ],
            narrativeTitle: '爐火重燃',
            narrativeSummary: '你把鐵礦石交給鍛造師。白煙終於往上升，鍛造鋪的爐聲重新變得穩定；這座城鎮夜裡多了一個還醒著的人。',
            lines: [
                { speaker: 'npc', text: '礦石成色不錯。至少它們不像某些冒險者，一敲就叫。' },
                { speaker: 'npc', text: '煙往上了。聽見沒有？爐子開始像爐子，不像一口在抱怨命運的鍋。' },
                { speaker: 'npc', text: '以後要鍛造就來。別說我沒提醒你，城外那些東西不會等你把鞋帶綁好。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'commission_blacksmith_chimney', message: '鍛造鋪的爐火重新穩定。' },
                { type: 'setFlag', flag: 'town.blacksmith.forge_open', value: true }
            ],
            route: 'forge',
            routeLabel: '前往鍛造'
        },
        {
            id: 'blacksmith_neelu_blueprint_offer',
            priority: 84,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'flag', flag: 'foundBlueprintCache' },
                { type: 'questStatus', questId: 'main_007', statuses: ['active', 'completed', 'finished'] },
                { type: 'questStatus', questId: 'commission_forge_001', statuses: ['locked', 'available'] }
            ],
            narrativeTitle: '圖紙邊角的名字',
            narrativeSummary: '你把野外找到的殘缺圖紙拿給鍛造師。他認出邊角刻著失蹤學徒妮露的名字，請你帶回礦材補齊她留下的研究。',
            lines: [
                { speaker: 'npc', text: '這不是普通圖紙。邊角這個名字是妮露，我以前的學徒。她字很小，脾氣很大，敲錯一次鐵會氣自己三天。' },
                { speaker: 'npc', text: '她說丘陵的礦能吃下地脈震動，然後就再也沒回來。你把這張紙帶回來，代表她至少沒有把問題想錯。' },
                { speaker: 'npc', text: '幫我帶回鐵礦石和暗鋼。我想知道這是圖紙，還是她留給我的道歉信。' }
            ],
            effects: [
                { type: 'unlockQuest', questId: 'commission_forge_001' },
                { type: 'acceptQuest', questId: 'commission_forge_001', message: '鍛造師把妮露留下的圖紙研究交給你。' }
            ],
            route: 'adventure',
            routeLabel: '前往丘陵'
        },
        {
            id: 'blacksmith_neelu_blueprint_active',
            priority: 68,
            conditions: [
                { type: 'questStatus', questId: 'commission_forge_001', status: 'active' }
            ],
            narrativeTitle: '妮露的圖紙',
            narrativeSummary: '鍛造師提醒你，妮露的圖紙需要鐵礦石與暗鋼補上比例；他嘴上說只是技術問題，眼神卻一直往門口看。',
            lines: [
                { speaker: 'npc', text: '鐵礦石是基礎，暗鋼是檢查地脈震動的。缺一個，圖紙就只是好看的火種。' },
                { speaker: 'npc', text: '別擔心，我不是在期待她突然回來。我只是把門開著而已，鍛造鋪通風比較好。' }
            ]
        },
        {
            id: 'blacksmith_neelu_blueprint_report',
            priority: 109,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_forge_001', status: 'completed' }
            ],
            narrativeTitle: '妮露的名字',
            narrativeSummary: '你把礦材交給鍛造師，妮露圖紙上的缺口被補齊。鍛造師把她的名字重新刻在圖紙邊角，鍛造鋪多了一份不是商品的紀錄。',
            lines: [
                { speaker: 'npc', text: '礦材對上了。這套比例能用，而且不是她亂寫。' },
                { speaker: 'npc', text: '那孩子以前總說，鍛造不是把鐵敲硬，是讓人有勇氣拿著它走出去。真煩，講得好像她才是師傅。' },
                { speaker: 'npc', text: '我會把圖紙收好。不是收藏，是等她哪天回來罵我改錯。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'commission_forge_001', message: '妮露圖紙被補齊，鍛造鋪開始記錄丘陵礦材路線。' },
                { type: 'setFlag', flag: 'town.blacksmith.neelu_blueprint_named', value: true }
            ]
        },
        {
            id: 'blacksmith_mithril_route_offer',
            priority: 86,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_forge_001', status: 'finished' },
                { type: 'questStatus', questId: 'main_012', statuses: ['active', 'completed', 'finished'] },
                { type: 'questStatus', questId: 'commission_forge_002', statuses: ['locked', 'available'] }
            ],
            narrativeTitle: '秘銀不是傳說',
            narrativeSummary: '北境路線打開後，鍛造師拿出逃匠奧倫的筆記。妮露圖紙的下一段需要秘銀，這條支線開始接上終局裝備壓力。',
            lines: [
                { speaker: 'npc', text: '北境回來的逃匠留下半本筆記。第一頁就寫：秘銀不是傳說，是很多人還沒帶回來就死了。很有鼓勵性，對吧。' },
                { speaker: 'npc', text: '妮露的圖紙到這裡斷掉，奧倫的筆記從這裡開始。我要把兩份接起來。' },
                { speaker: 'npc', text: '帶回秘銀，再完成幾次強化測試。這次不是為了漂亮，是為了你真的能走到北邊。' }
            ],
            effects: [
                { type: 'unlockQuest', questId: 'commission_forge_002' },
                { type: 'acceptQuest', questId: 'commission_forge_002', message: '鍛造師把秘銀路線交給你測試。' }
            ],
            route: 'adventure',
            routeLabel: '前往北境'
        },
        {
            id: 'blacksmith_mithril_route_active',
            priority: 70,
            conditions: [
                { type: 'questStatus', questId: 'commission_forge_002', status: 'active' }
            ],
            narrativeTitle: '北境礦材',
            narrativeSummary: '鍛造師要你帶回秘銀並完成強化測試。他把妮露與奧倫的名字寫在同一張紙上，像是在替失蹤者排隊。',
            lines: [
                { speaker: 'npc', text: '秘銀三塊，強化五次。數字很無情，但戰場比數字更無情。' },
                { speaker: 'npc', text: '別把命拿去賭礦石。命比秘銀貴，雖然市場上目前沒人這樣標價。' }
            ]
        },
        {
            id: 'blacksmith_mithril_route_report',
            priority: 111,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_forge_002', status: 'completed' }
            ],
            narrativeTitle: '妮露與奧倫',
            narrativeSummary: '秘銀在爐中穩定下來。鍛造師把妮露圖紙與逃匠奧倫筆記裝訂在一起，城鎮獲得通往終局裝備的明確路線。',
            lines: [
                { speaker: 'npc', text: '秘銀穩了。這代表妮露的圖紙不是夢話，奧倫的筆記也不是遺言。至少不完全是。' },
                { speaker: 'npc', text: '我會把這本冊子放在爐邊。以後你要打造更硬的東西，就從這裡開始。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'commission_forge_002', message: '秘銀鍛造路線被整理完成。' },
                { type: 'setFlag', flag: 'town.blacksmith.mithril_route_ready', value: true }
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
            id: 'herbalist_bottles_offer',
            priority: 82,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'main_002', status: 'finished' },
                { type: 'questStatus', questId: 'commission_apothecary_bottles', status: 'locked' }
            ],
            narrativeTitle: '藥師的空瓶',
            narrativeSummary: '藥師把被凝膠腐蝕的空瓶排在桌上。她沒有把這當成生意，而是把史萊姆凝膠的甜味視為地脈異常滲入農田的徵兆。',
            lines: [
                { speaker: 'npc', text: '你清掉史萊姆了？很好。現在我要說一件更噁心的事：牠們的凝膠味道變甜了。' },
                { speaker: 'npc', text: '自然界裡甜甜的危險通常很會騙人靠近。你可以把這句話記下來，尤其不要用舌頭驗證。' },
                { speaker: 'npc', text: '帶 5 份史萊姆凝膠回來。我得確認農田土壤是不是已經被地脈異常滲進去了。' }
            ],
            effects: [
                { type: 'unlockQuest', questId: 'commission_apothecary_bottles' },
                { type: 'acceptQuest', questId: 'commission_apothecary_bottles', message: '藥師把凝膠樣本的調查交給你。' }
            ],
            route: 'adventure',
            routeLabel: '收集凝膠'
        },
        {
            id: 'herbalist_bottles_active',
            priority: 72,
            conditions: [
                { type: 'questStatus', questId: 'commission_apothecary_bottles', status: 'active' }
            ],
            narrativeTitle: '凝膠樣本',
            narrativeSummary: '藥師提醒你帶回史萊姆凝膠。她真正想確認的不是藥水配方，而是農田邊的異常是否正在擴散。',
            lines: [
                { speaker: 'npc', text: '史萊姆凝膠 5 份。拿回來時瓶口朝上，拜託。我不想再洗一次整個棚子。' },
                { speaker: 'npc', text: '如果甜味變重，就代表問題不是史萊姆，是土裡的東西開始不對。' }
            ]
        },
        {
            id: 'herbalist_bottles_report',
            priority: 108,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_apothecary_bottles', status: 'completed' }
            ],
            narrativeTitle: '藥架重新整理',
            narrativeSummary: '藥師收下凝膠樣本後，把基礎藥水重新整理上架。她沒有說情況變好了，只說至少下一個受傷的人不用等空瓶晾乾。',
            lines: [
                { speaker: 'npc', text: '樣本夠了。甜味確實不正常，但還沒到能讓人長出第二張嘴的程度，暫時算好消息。' },
                { speaker: 'npc', text: '我會先把基礎藥水補起來。你們冒險者很擅長受傷，城鎮總得有人擅長善後。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'commission_apothecary_bottles', message: '藥師補上了基礎藥水的製備紀錄。' },
                { type: 'setFlag', flag: 'town.apothecary.stock_basic_potion', value: true }
            ],
            route: 'shop',
            routeLabel: '購買補給'
        },
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
            id: 'herbalist_herb_basket_offer',
            priority: 88,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'main_008', status: 'active' },
                { type: 'questStatus', questId: 'commission_herb_basket', status: 'locked' }
            ],
            narrativeTitle: '採藥籃不會說謊',
            narrativeSummary: '一只空採藥籃自己回到市集邊棚，提把上綁著荊棘。藥師要你確認毒霧林地發生了什麼，因為她不想讓村民開始相信女巫的交易規則。',
            lines: [
                { speaker: 'npc', text: '這只籃子昨天自己回來了。別問我籃子怎麼走路，我也很想知道。' },
                { speaker: 'npc', text: '提把上的荊棘切得太整齊，像是有人故意打了一個漂亮的結。漂亮到讓人想把它丟進火裡。' },
                { speaker: 'npc', text: '去毒霧林地帶回 2 份毒腺樣本，順手清掉附近的毒蛛。我要知道那片霧是不是被女巫的交易推過來的。' }
            ],
            effects: [
                { type: 'unlockQuest', questId: 'commission_herb_basket' },
                { type: 'acceptQuest', questId: 'commission_herb_basket', message: '藥師把自己回來的採藥籃寫進你的手札。' }
            ],
            route: 'adventure',
            routeLabel: '前往毒霧林地'
        },
        {
            id: 'herbalist_herb_basket_active',
            priority: 73,
            conditions: [
                { type: 'questStatus', questId: 'commission_herb_basket', status: 'active' }
            ],
            narrativeTitle: '毒霧林地',
            narrativeSummary: '藥師要你帶回毒腺並擊退毒蛛。這條支線不是為了採藥，而是為了辨認荊棘女巫的交易規則是否已經靠近城鎮。',
            lines: [
                { speaker: 'npc', text: '毒腺 2 份，毒蛛 4 隻。數字很清楚，因為模糊的委託通常會害死人。' },
                { speaker: 'npc', text: '如果你看到另一只籃子，先別撿。能自己回來的東西，通常也會自己帶麻煩回來。' }
            ]
        },
        {
            id: 'herbalist_herb_basket_report',
            priority: 108,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_herb_basket', status: 'completed' }
            ],
            narrativeTitle: '荊棘交易',
            narrativeSummary: '藥師從毒腺樣本裡確認毒霧並非自然擴散。女巫不是亂抓人，而是在用失控的交易規則重建失去的溫室。',
            lines: [
                { speaker: 'npc', text: '樣本裡的毒性很穩，穩到不像自然霧氣。有人在引導它，或者至少很懂得利用它。' },
                { speaker: 'npc', text: '那只籃子不是恐嚇，是價格標籤。女巫失去溫室後，開始把整片丘陵都當成她的藥櫃。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'commission_herb_basket', message: '藥師確認荊棘交易正在靠近城鎮。' },
                { type: 'setFlag', flag: 'town.apothecary.understands_thorn_trade', value: true }
            ],
            route: 'quest',
            routeLabel: '查看手札'
        },
        {
            id: 'herbalist_herb_basket_thread_offer',
            priority: 89,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_herb_basket', status: 'finished' },
                { type: 'questStatus', questId: 'commission_herb_basket_002', statuses: ['locked', 'available'] }
            ],
            narrativeTitle: '籃底縫著的名字',
            narrativeSummary: '藥師拆開採藥籃底，發現縫線裡藏著失蹤採藥人的名字與方向。這段支線從怪事轉成一個人留下的求救。',
            lines: [
                { speaker: 'npc', text: '我剛剛把籃底拆開。好消息是，籃子真的不會走路。壞消息是，有人知道自己走不回來。' },
                { speaker: 'npc', text: '縫線裡藏著名字，還有一段方向。那不是女巫的恐嚇，是採藥人把警告縫進籃底，想讓它先回城鎮。' },
                { speaker: 'npc', text: '帶 2 份森林精華回來穩住縫線，再清掉那條路上的 3 隻毒蛛。我想把她的名字寫在棚門口，不是寫在失蹤名單最後。' }
            ],
            effects: [
                { type: 'unlockQuest', questId: 'commission_herb_basket_002' },
                { type: 'acceptQuest', questId: 'commission_herb_basket_002', message: '藥師把籃底縫線裡的名字交給你追查。' }
            ]
        },
        {
            id: 'herbalist_herb_basket_thread_active',
            priority: 74,
            conditions: [
                { type: 'questStatus', questId: 'commission_herb_basket_002', status: 'active' }
            ],
            narrativeTitle: '縫線路線',
            narrativeSummary: '藥師提醒你，這次不是單純清怪，而是沿著失蹤採藥人留下的縫線方向，把警告完整帶回來。',
            lines: [
                { speaker: 'npc', text: '森林精華 2 份，毒蛛 3 隻。精華穩住線，毒蛛讓下一個人不要也變成線上的名字。' },
                { speaker: 'npc', text: '如果那條路上還有第二只籃子，拜託先不要說「好可愛」。很多麻煩就是從這種句子開始的。' }
            ]
        },
        {
            id: 'herbalist_herb_basket_thread_report',
            priority: 111,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_herb_basket_002', status: 'completed' }
            ],
            narrativeTitle: '採藥人的名字',
            narrativeSummary: '你帶回森林精華並清掉毒蛛。藥師讀出失蹤採藥人的名字，將她從怪談裡拉回城鎮記憶。',
            lines: [
                { speaker: 'npc', text: '縫線穩住了。名字我看得清楚。她不是「那個採藥人」，她叫莉雅。' },
                { speaker: 'npc', text: '我會把名字寫在棚門口。她把警告送回來了，至少城鎮要把她接回來。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'commission_herb_basket_002', message: '藥師把失蹤採藥人的名字寫在藥棚門口。' },
                { type: 'setFlag', flag: 'town.apothecary.remembers_lost_gatherer', value: true }
            ]
        },
        {
            id: 'herbalist_last_soup_offer',
            priority: 90,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'main_014', status: 'active' },
                { type: 'questStatus', questId: 'commission_last_soup', status: 'locked' }
            ],
            narrativeTitle: '最後一鍋湯',
            narrativeSummary: '深淵裂口開啟後，城鎮廚房開始收留避難者。藥師說藥水能救傷口，但熱湯能先阻止人心裂開。',
            lines: [
                { speaker: 'npc', text: '避難者越來越多。藥水能包傷口，但肚子空著的人很快會先吵起來。' },
                { speaker: 'npc', text: '掌廚說他不懂地脈、古龍或魔王，只懂人餓了會罵人，罵人會讓守衛分心，守衛分心就會死人。很樸素，也很正確。' },
                { speaker: 'npc', text: '帶 6 份可食用肉、1 份火焰精華回來，順手擊退補給路線上的 3 名深淵士兵。這不是史詩，但今晚有人需要熱湯。' }
            ],
            effects: [
                { type: 'unlockQuest', questId: 'commission_last_soup' },
                { type: 'acceptQuest', questId: 'commission_last_soup', message: '藥師把避難者廚房的補給交給你處理。' }
            ],
            route: 'adventure',
            routeLabel: '保護補給路線'
        },
        {
            id: 'herbalist_last_soup_active',
            priority: 76,
            conditions: [
                { type: 'questStatus', questId: 'commission_last_soup', status: 'active' }
            ],
            narrativeTitle: '避難者廚房',
            narrativeSummary: '藥師提醒你帶回食材與火焰精華。世界快燒起來時，一鍋湯不是史詩，卻可能讓人撐到明天。',
            lines: [
                { speaker: 'npc', text: '肉 6 份，火焰精華 1 份，深淵士兵 3 名。順序不重要，活著帶回來比較重要。' },
                { speaker: 'npc', text: '我知道這聽起來不像終局任務。但人要先吃得下東西，才有力氣相信明天。' }
            ]
        },
        {
            id: 'herbalist_last_soup_report',
            priority: 112,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_last_soup', status: 'completed' }
            ],
            narrativeTitle: '爐火與湯碗',
            narrativeSummary: '你把補給帶回市集邊棚。城鎮的夜裡多了一點湯香，壓不過深淵的焦味，卻足夠提醒人們明天還值得煮。',
            lines: [
                { speaker: 'npc', text: '補給夠了。掌廚已經開始把鍋架起來，他剛剛還問我火焰精華會不會讓湯變辣。' },
                { speaker: 'npc', text: '我說不會，但最好不要用來煮甜湯。世界末日可以很荒謬，不必在味覺上也一起毀滅。' },
                { speaker: 'npc', text: '今晚城鎮會有熱湯。這不能打敗魔王，但能讓人明天醒來時，還記得自己不是只剩下恐懼。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'commission_last_soup', message: '避難者廚房的爐火重新亮起。' },
                { type: 'setFlag', flag: 'town.refugees.soup_kitchen_warm', value: true }
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
            id: 'beggar_merchant_active',
            priority: 73,
            conditions: [
                { type: 'questStatus', questId: 'commission_merchant_001', status: 'active' }
            ],
            narrativeTitle: '黑市標籤',
            narrativeSummary: '巷口流浪者提醒你，收藏家伊文需要的是詛咒碎片，不是漂亮收藏；那東西能讓灰燼男爵的黑市標籤浮出貨號。',
            lines: [
                { speaker: 'npc', text: '伊文要詛咒碎片？那他不是在收藏，他是在驗貨。收藏家都這樣，說自己愛歷史，其實愛的是標籤。' },
                { speaker: 'npc', text: '帶回一片就好。太多片會讓你開始相信暗巷裡的東西都在對你眨眼。' }
            ]
        },
        {
            id: 'beggar_merchant_report',
            priority: 109,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_merchant_001', status: 'completed' }
            ],
            narrativeTitle: '收藏家的收據',
            narrativeSummary: '你把詛咒碎片帶回暗巷，伊文辨認出灰燼男爵的黑市標籤。巷口流浪者說，能把走私做成收據的人，通常也會把人命做成成本。',
            lines: [
                { speaker: 'npc', text: '標籤亮了？很好，伊文的手還沒抖到看不懂貨號。' },
                { speaker: 'npc', text: '灰燼男爵把鐵器、口糧、工匠都當庫存。現在我們至少知道他把哪條路當貨架了。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'commission_merchant_001', message: '黑市標籤被辨認出來，灰燼男爵的走私線更清楚了。' },
                { type: 'setFlag', flag: 'town.black_market.ledger_tags_read', value: true }
            ]
        },
        {
            id: 'beggar_casino_false_odds_offer',
            priority: 87,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'main_011', statuses: ['active', 'completed', 'finished'] },
                { type: 'questStatus', questId: 'commission_casino_001', statuses: ['locked', 'available'] }
            ],
            narrativeTitle: '帳房瑪洛的假勝率',
            narrativeSummary: '灰燼男爵線開啟後，巷口流浪者把賭場帳房瑪洛的勝率表交給你。這條支線從賭桌切入城鎮黑錢與走私暗號。',
            lines: [
                { speaker: 'npc', text: '賭場帳房瑪洛算出一件很不浪漫的事：最近的勝率太整齊了。運氣如果這麼守規矩，早就該被王國徵稅。' },
                { speaker: 'npc', text: '她懷疑有人把灰燼男爵的貨號藏在派彩節奏裡。你去老虎機和骰子桌贏幾輪，記下節奏。' },
                { speaker: 'npc', text: '別真的上癮。故事需要你回來，不需要你在賭桌上完成角色退場。' }
            ],
            effects: [
                { type: 'unlockQuest', questId: 'commission_casino_001' },
                { type: 'acceptQuest', questId: 'commission_casino_001', message: '巷口流浪者把瑪洛的假勝率調查交給你。' }
            ],
            route: 'casino',
            routeLabel: '前往賭場'
        },
        {
            id: 'beggar_casino_false_odds_active',
            priority: 72,
            conditions: [
                { type: 'questStatus', questId: 'commission_casino_001', status: 'active' }
            ],
            narrativeTitle: '賭桌暗號',
            narrativeSummary: '巷口流浪者提醒你，老虎機與骰子局都要記錄；瑪洛看的不是你贏多少，是勝率是否被人寫成暗號。',
            lines: [
                { speaker: 'npc', text: '老虎機五勝，骰子五勝。瑪洛看的不是你有多神，是那些機器有沒有神得太規律。' },
                { speaker: 'npc', text: '如果有人問你為什麼一直記帳，就說你想學會理財。這謊話很爛，但賭場裡更爛的謊話多的是。' }
            ],
            route: 'casino',
            routeLabel: '前往賭場'
        },
        {
            id: 'beggar_casino_false_odds_report',
            priority: 110,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_casino_001', status: 'completed' }
            ],
            narrativeTitle: '勝率後面的貨號',
            narrativeSummary: '你把賭桌節奏帶回暗巷。瑪洛確認勝率被做成黑市貨號，灰燼男爵的走私網不只在要塞，也伸進城鎮娛樂與恐慌。',
            lines: [
                { speaker: 'npc', text: '瑪洛說你記的節奏對上了。恭喜，你證明了骰子也能成為犯罪工具。這句話聽起來居然不荒謬，真糟。' },
                { speaker: 'npc', text: '貨號指向黑曜石要塞。灰燼男爵不只收鐵，他連人的貪念都收。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'commission_casino_001', message: '賭場假勝率被確認為灰燼男爵的黑市暗號。' },
                { type: 'setFlag', flag: 'town.casino.false_odds_exposed', value: true }
            ],
            route: 'quest',
            routeLabel: '翻閱手札'
        },
        {
            id: 'beggar_casino_last_chips_offer',
            priority: 88,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_casino_001', status: 'finished' },
                { type: 'questStatus', questId: 'main_014', statuses: ['active', 'completed', 'finished'] },
                { type: 'questStatus', questId: 'commission_casino_002', statuses: ['locked', 'available'] }
            ],
            narrativeTitle: '最後一夜的籌碼',
            narrativeSummary: '深淵前鋒靠近城鎮後，巷口流浪者帶來瑪洛的新帳冊。賭場被臨時改成避難籌款所，灰色金流轉成補給。',
            lines: [
                { speaker: 'npc', text: '瑪洛把賭場今晚的籌碼全換成補給券。她說這叫資金流向修正，我說這叫終於把賭場拿來做點人事。' },
                { speaker: 'npc', text: '你去贏一筆，越多人看見越好。有人會為了面子加注，有人會為了愧疚捐錢，兩種都能買乾糧。' },
                { speaker: 'npc', text: '這次贏錢不是表演。是讓明天早上還有人能罵湯太淡。' }
            ],
            effects: [
                { type: 'unlockQuest', questId: 'commission_casino_002' },
                { type: 'acceptQuest', questId: 'commission_casino_002', message: '巷口流浪者把賭場避難補給籌款交給你。' }
            ],
            route: 'casino',
            routeLabel: '前往賭場'
        },
        {
            id: 'beggar_casino_last_chips_active',
            priority: 73,
            conditions: [
                { type: 'questStatus', questId: 'commission_casino_002', status: 'active' }
            ],
            narrativeTitle: '避難補給基金',
            narrativeSummary: '巷口流浪者提醒你，賭場這次需要的是累計盈利，金幣會被瑪洛換成避難補給。',
            lines: [
                { speaker: 'npc', text: '累計盈利一千。聽起來很多，但比起讓一群人餓到開始討論誰比較適合當晚餐，這已經很便宜了。' }
            ],
            route: 'casino',
            routeLabel: '前往賭場'
        },
        {
            id: 'beggar_casino_last_chips_report',
            priority: 112,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_casino_002', status: 'completed' }
            ],
            narrativeTitle: '籌碼換成乾糧',
            narrativeSummary: '你湊齊避難補給基金。瑪洛把帳冊最後一頁交給巷口流浪者，城鎮第一次把賭場的金流寫成救命物資。',
            lines: [
                { speaker: 'npc', text: '瑪洛算完了。金幣夠買乾糧、繃帶，還有一點點很必要的甜點。人在末日前也需要甜點，這不是奢侈，是防止暴動。' },
                { speaker: 'npc', text: '你今天贏了賭場，也贏了幾張明天的早餐券。聽起來不像史詩，但我比較喜歡這種勝利。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'commission_casino_002', message: '賭場籌碼被換成避難補給基金。' },
                { type: 'setFlag', flag: 'town.casino.relief_fund_counted', value: true }
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
                { speaker: 'npc', text: '先清掉 5 個靠近農田的史萊姆。牠們只是地脈異常浮上地表的第一個症狀。' }
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
            narrativeSummary: '書記提醒你，史萊姆的方向比數量更重要。若牠們都從同一側靠近農田，地底某處很可能正在把牠們往外推。',
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
            id: 'scholar_drowned_bell_offer',
            priority: 89,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'main_009', status: 'active' },
                { type: 'questStatus', questId: 'commission_drowned_bell_insomnia', status: 'locked' }
            ],
            narrativeTitle: '沉鐘下的失眠人',
            narrativeSummary: '城鎮有人連續幾夜聽見海底鐘聲。書記原本想寫成失眠，直到他把節奏敲在桌上，發現和海岸紀錄吻合。',
            lines: [
                { speaker: 'npc', text: '有人說他每晚都聽見鐘聲。村民叫他失眠，我原本也想這樣寫，直到他把節奏敲在桌上。' },
                { speaker: 'npc', text: '那節奏和沉鐘海岸的紀錄對得太整齊。失眠通常不會這麼有禮貌地押拍。' },
                { speaker: 'npc', text: '去沉鐘異響附近擊退 3 隻幽魂，帶回 3 份回聲殘留。我需要確認鐘聲是不是沿著地脈傳回城鎮。' }
            ],
            effects: [
                { type: 'unlockQuest', questId: 'commission_drowned_bell_insomnia' },
                { type: 'acceptQuest', questId: 'commission_drowned_bell_insomnia', message: '書記把夜裡沉鐘聲寫進你的手札。' }
            ],
            route: 'adventure',
            routeLabel: '追查沉鐘聲'
        },
        {
            id: 'scholar_drowned_bell_active',
            priority: 74,
            conditions: [
                { type: 'questStatus', questId: 'commission_drowned_bell_insomnia', status: 'active' }
            ],
            narrativeTitle: '夜裡的節奏',
            narrativeSummary: '書記提醒你帶回回聲殘留。這不是為了證明某個人失眠，而是確認沉鐘神諭的影響是否已經沿地脈回到城鎮。',
            lines: [
                { speaker: 'npc', text: '幽魂 3 隻，回聲殘留 3 份。別只帶故事回來，故事不能放進比對表。' },
                { speaker: 'npc', text: '如果鐘聲真的從海岸傳回城鎮，那代表神諭線不是遠方事件，而是我們腳下的地脈也在回音。' }
            ]
        },
        {
            id: 'scholar_drowned_bell_report',
            priority: 110,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_drowned_bell_insomnia', status: 'completed' }
            ],
            narrativeTitle: '鐘聲入冊',
            narrativeSummary: '你把回聲殘留交給書記。鐘聲節奏和沉鐘神諭紀錄對上，城鎮裡那位失眠的人終於不是唯一醒著的人。',
            lines: [
                { speaker: 'npc', text: '回聲殘留裡有規律震動。不是自然潮聲，更不像某個人睡前想太多。' },
                { speaker: 'npc', text: '我會把這段寫進手札：沉鐘神諭的影響已經能透過地脈回到城鎮。' },
                { speaker: 'npc', text: '至於那位失眠的人，我會告訴他他不是瘋了。這應該能讓他睡好一點，或者更睡不著。很難說。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'commission_drowned_bell_insomnia', message: '書記把沉鐘節奏補進海岸紀錄。' },
                { type: 'setFlag', flag: 'town.scholar.records_drowned_bell_rhythm', value: true }
            ],
            route: 'quest',
            routeLabel: '查看手札'
        },
        {
            id: 'scholar_lamplighter_offer',
            priority: 87,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_drowned_bell_insomnia', status: 'finished' },
                { type: 'questStatus', questId: 'commission_coast_lamplighter', statuses: ['locked', 'available'] }
            ],
            narrativeTitle: '守燈人的油壺',
            narrativeSummary: '沉鐘節奏被記錄後，書記才敢提起海岸守燈人塔維。這條支線補上海岸災後的小人物故事。',
            lines: [
                { speaker: 'npc', text: '沉鐘節奏整理完後，有件事就不能裝作沒看見了。海岸還有一盞燈，每晚都亮得像在求救。' },
                { speaker: 'npc', text: '守燈人塔維怕黑，這本來沒什麼。問題是他怕到把燈號點錯，亡魂也跟著光回岸。' },
                { speaker: 'npc', text: '替我驅散那些亡魂，再帶回靈質。我可以把燈號校正成只引活人，不引回憶。' }
            ],
            effects: [
                { type: 'unlockQuest', questId: 'commission_coast_lamplighter' },
                { type: 'acceptQuest', questId: 'commission_coast_lamplighter', message: '書記把守燈人塔維的燈號寫進你的手札。' }
            ],
            route: 'adventure',
            routeLabel: '前往沉鐘海岸'
        },
        {
            id: 'scholar_lamplighter_active',
            priority: 75,
            conditions: [
                { type: 'questStatus', questId: 'commission_coast_lamplighter', status: 'active' }
            ],
            narrativeTitle: '錯誤的燈號',
            narrativeSummary: '書記提醒你，塔維需要的不是英勇演說，而是有人把跟著光回岸的亡魂處理掉。',
            lines: [
                { speaker: 'npc', text: '幽魂 2 隻，靈質 2 份。塔維的燈號會一直亮到你回來。' },
                { speaker: 'npc', text: '他怕黑這件事不要笑。城鎮裡很多人也怕，只是大家比較會假裝。' }
            ]
        },
        {
            id: 'scholar_lamplighter_report',
            priority: 111,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_coast_lamplighter', status: 'completed' }
            ],
            narrativeTitle: '燈號校正',
            narrativeSummary: '你把靈質交給書記。海岸燈號被重新校正，塔維仍然怕黑，但那盞燈終於不再把亡魂引回家。',
            lines: [
                { speaker: 'npc', text: '靈質足夠了。我會把燈號節奏重新寫給塔維。' },
                { speaker: 'npc', text: '他剛剛派人送來一張紙，上面只寫「謝謝」，字還歪。這比很多豪華報告都可靠。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'commission_coast_lamplighter', message: '守燈人塔維的燈號被校正，海岸紀錄更新了。' },
                { type: 'setFlag', flag: 'town.coast_refugee_lamp_lit', value: true }
            ],
            route: 'quest',
            routeLabel: '查看手札'
        },
        {
            id: 'scholar_grave_bookmark_offer',
            priority: 88,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'main_010', status: 'active' },
                { type: 'questStatus', questId: 'commission_grave_bookmark', status: 'locked' }
            ],
            narrativeTitle: '墓園書籤',
            narrativeSummary: '書記找到一張古代學者的書籤。它不能讓巫妖變得無害，卻讓你知道這場戰鬥背後曾經有一個害怕被忘記的人。',
            lines: [
                { speaker: 'npc', text: '我找到一張書籤。上面寫著：「若我還在尋找法杖，請不要把我只記成怪物。」' },
                { speaker: 'npc', text: '我知道，巫妖仍然危險。這不是替牠開脫，只是我不想讓所有紀錄最後都變成冷冰冰的分類。' },
                { speaker: 'npc', text: '去古墓附近帶回 5 份骨片，擊退 3 隻骷髏兵。我要確認那位學者的名字。' }
            ],
            effects: [
                { type: 'unlockQuest', questId: 'commission_grave_bookmark' },
                { type: 'acceptQuest', questId: 'commission_grave_bookmark', message: '書記把古代學者的書籤交給你追查。' }
            ],
            route: 'adventure',
            routeLabel: '前往古墓'
        },
        {
            id: 'scholar_grave_bookmark_active',
            priority: 73,
            conditions: [
                { type: 'questStatus', questId: 'commission_grave_bookmark', status: 'active' }
            ],
            narrativeTitle: '古墓名字',
            narrativeSummary: '書記提醒你帶回骨片與戰鬥紀錄。他不是要讓玩家同情巫妖，而是要讓城鎮別把所有失控者都壓成同一個怪物標籤。',
            lines: [
                { speaker: 'npc', text: '骨片 5 份，骷髏兵 3 隻。帶回來後我能比對墓道年代。' },
                { speaker: 'npc', text: '如果紀錄只剩「怪物」，那有一天我們也可能被別人這樣寫。這句話很沉重，所以我決定不押韻。' }
            ]
        },
        {
            id: 'scholar_grave_bookmark_report',
            priority: 108,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_grave_bookmark', status: 'completed' }
            ],
            narrativeTitle: '被記住的名字',
            narrativeSummary: '書記把古代學者的名字補進巫妖紀錄旁。怪物仍是怪物，但旅人手札多了一行提醒：災難會吞掉人，也會吞掉名字。',
            lines: [
                { speaker: 'npc', text: '骨片年代吻合。這個名字可以補回去了。' },
                { speaker: 'npc', text: '巫妖仍然必須被阻止，但至少我們知道牠曾經不是一場暴動，而是一個人。' },
                { speaker: 'npc', text: '有時候紀錄不能救誰，只能讓世界不要第二次殺死他。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'commission_grave_bookmark', message: '書記把古代學者的名字補進巫妖紀錄旁。' },
                { type: 'setFlag', flag: 'town.scholar.records_lich_name', value: true }
            ],
            route: 'quest',
            routeLabel: '查看手札'
        },
        {
            id: 'scholar_julian_margin_offer',
            priority: 89,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_grave_bookmark', status: 'finished' },
                { type: 'questStatus', questId: 'commission_grave_bookmark_002', statuses: ['locked', 'available'] }
            ],
            narrativeTitle: '朱利安的邊註',
            narrativeSummary: '書記看懂書籤邊緣的縮寫，將巫妖生前紀錄接到遠古遺跡與朱利安的防衛術式。',
            lines: [
                { speaker: 'npc', text: '書籤邊緣還有一串縮寫：JUL。不是普通塗鴉，除非古代學者很喜歡把求救寫得像文獻註腳。' },
                { speaker: 'npc', text: '這指向大御術師朱利安。他造了遠古遺跡的防衛網，也可能第一個發現那套東西不懂得停下。' },
                { speaker: 'npc', text: '帶 2 份古代符文回來，再擊退 2 具還在執行舊命令的遠古守衛。我要知道這是警告，還是懺悔。' }
            ],
            effects: [
                { type: 'unlockQuest', questId: 'commission_grave_bookmark_002' },
                { type: 'acceptQuest', questId: 'commission_grave_bookmark_002', message: '書記把朱利安的邊註交給你追查。' }
            ]
        },
        {
            id: 'scholar_julian_margin_active',
            priority: 74,
            conditions: [
                { type: 'questStatus', questId: 'commission_grave_bookmark_002', status: 'active' }
            ],
            narrativeTitle: '盲目的秩序',
            narrativeSummary: '書記需要古代符文與遠古守衛的戰鬥紀錄，判斷朱利安留下的邊註如何接上遺跡失控。',
            lines: [
                { speaker: 'npc', text: '古代符文 2 份，遠古守衛 2 具。這不是收藏，是證詞。' },
                { speaker: 'npc', text: '如果遠古守衛一邊攻擊你一邊發出規律光芒，請記錄節奏。若沒有，也請先活著回來，我比較好整理。' }
            ]
        },
        {
            id: 'scholar_julian_margin_report',
            priority: 111,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_grave_bookmark_002', status: 'completed' }
            ],
            narrativeTitle: '神靈的盾牌',
            narrativeSummary: '朱利安邊註被解讀完成。遠古遺跡不是單純敵方地點，而是一套太忠於命令的古代防衛系統。',
            lines: [
                { speaker: 'npc', text: '符文對上了。朱利安確實知道防衛術式可能失控，只是他沒能留下關閉方法。' },
                { speaker: 'npc', text: '「我們建造了神靈的盾牌，卻忘記了神靈不具備慈悲。」這句我要抄進手札，很痛，但很準。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'commission_grave_bookmark_002', message: '書記把朱利安邊註補進遠古遺跡紀錄。' },
                { type: 'setFlag', flag: 'town.scholar.julian_margin_read', value: true }
            ]
        },
        {
            id: 'scholar_last_index_offer',
            priority: 92,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'main_015', statuses: ['active', 'completed', 'finished'] },
                { type: 'questStatus', questId: 'commission_scholar_last_index', statuses: ['locked', 'available'] }
            ],
            narrativeTitle: '書記的最後索引',
            narrativeSummary: '魔王阿薩謝爾現身後，書記不再只整理怪物紀錄。他開始替活人編索引，避免終局把所有名字都壓成灰。',
            lines: [
                { speaker: 'npc', text: '我以前以為，只要把怪物、地點、線索排清楚，世界就會比較像可以理解的東西。現在看來，我有點樂觀。' },
                { speaker: 'npc', text: '魔王現身後，我想先替活人編索引。不是墓誌銘，是索引。差別很重要，請你假裝同意。' },
                { speaker: 'npc', text: '深淵將領搶走了封皮，黑印也滲進紙頁。幫我取回來。我不想讓明天醒來的人連誰少了都不知道。' }
            ],
            effects: [
                { type: 'unlockQuest', questId: 'commission_scholar_last_index' },
                { type: 'acceptQuest', questId: 'commission_scholar_last_index', message: '書記把最後索引的封皮與黑印問題交給你。' }
            ],
            route: 'adventure',
            routeLabel: '前往深淵裂口'
        },
        {
            id: 'scholar_last_index_active',
            priority: 78,
            conditions: [
                { type: 'questStatus', questId: 'commission_scholar_last_index', status: 'active' }
            ],
            narrativeTitle: '活人的索引',
            narrativeSummary: '書記提醒你帶回深淵黑印與封皮。這不是為了整理得漂亮，而是讓城鎮在終局時還能知道誰需要被找回來。',
            lines: [
                { speaker: 'npc', text: '深淵將領 1 名，黑印碎片 2 份。封皮被它拿走後，紙頁上的名字開始自己散開。' },
                { speaker: 'npc', text: '如果我說這只是文書工作，你會比較不緊張嗎？不會也沒關係，我自己也不信。' }
            ]
        },
        {
            id: 'scholar_last_index_report',
            priority: 114,
            once: true,
            tone: 'discovery',
            conditions: [
                { type: 'questStatus', questId: 'commission_scholar_last_index', status: 'completed' }
            ],
            narrativeTitle: '名字沒有散開',
            narrativeSummary: '你把封皮與黑印帶回。書記把活人的索引重新裝訂，城鎮在終局裡多了一種很安靜的抵抗。',
            lines: [
                { speaker: 'npc', text: '封皮還能用。黑印我會用鉛盒封起來，放在最底層，旁邊貼一張很大的「不要碰」。' },
                { speaker: 'npc', text: '這本索引不能打敗魔王，但能讓我們知道誰還沒回來。對我來說，這已經很像武器了。' }
            ],
            effects: [
                { type: 'completeQuest', questId: 'commission_scholar_last_index', message: '書記的最後索引被重新裝訂，城鎮名冊穩住了。' },
                { type: 'setFlag', flag: 'town.scholar.last_index_bound', value: true }
            ],
            route: 'quest',
            routeLabel: '查看手札'
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
