/**
 * QuestStories.js
 * Story-facing overlay for existing quest data. Objectives remain in Quests.js.
 */

import { getQuestStoryRevision } from './StoryScriptRevisions.js';
import { getSideStoryNarrativeMeta } from './SideStoryNarrativeTaxonomy.js';

export const QuestStoryDatabase = {
    main_001: {
        arc: '裂痕前夜',
        source: '村長的交代',
        location: '城鎮十字路',
        speaker: { name: '村長', avatar: '🏘️' },
        discovery: '村長說南門外的獵人還沒回來，但他要你先找書記學會怎麼記錄線索，再出城確認道路。',
        available: '村長請你先找書記確認旅人手札的記錄方式，再去南門外近郊走一圈。',
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
            '村長請我先找書記確認旅人手札的記錄方式。',
            '再前往南門外近郊，記下 3 處還能通行的路線。'
        ]
    },
    main_002: {
        arc: '裂痕前夜',
        source: '書記的異常紀錄',
        location: '舊書桌',
        speaker: { name: '書記', avatar: '📚' },
        discovery: '書記把村民的聽聞寫成第一份紀錄：農田邊的史萊姆正在變多。',
        available: '這件委託小到不像英雄故事，卻足以證明地脈異常已經靠近城鎮。',
        active: '清掉靠近農田的史萊姆，再回來讓書記比對時間、地點與黏液味道。最後一項聽起來很不體面，但他很堅持。',
        completed: '史萊姆數量被壓下來，書記終於能把「黏糊糊的聲音」改寫成比較正式的紀錄。',
        finished: '書記在紀錄旁加了一行小字：史萊姆只是第一個浮上來的症狀。',
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
        discovery: '獵人棧道旁的誘餌鉤被切得太乾淨，鍛造師看完後臉色沉下來：普通野獸留不出這種痕跡。',
        available: '鍛造師要你先把裝備整好。他嘴上說是為了方便收尾款，眼神卻一直往城外看。',
        active: '完成一次裝備強化，讓裝備能撐過接下來的伏擊測試。',
        completed: '強化完成後，鍛造師把誘餌鉤修成能反向設陷的形狀。',
        finished: '獵人棧道的封鎖露出真正輪廓：一隻會記住路線的怪物正在等你犯錯。',
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
        available: '銀絲集中在你可能回頭的位置。那裡沒有巢穴的安靜，只有等人踩進去的伏擊。',
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
        available: '森林的怒意像從傷口裡滲出來。它被剝掉一塊血肉後，痛到只剩防衛本能。',
        active: '擊退被污染痕跡驅趕的狼群，找出古樹守衛核心的位置。',
        completed: '古樹守衛倒下後，溪谷的燃燒藤蔓減弱，但污染已順著水流擴散。',
        finished: '線索補上最重要的一句：黑樹皮被北方更高威脅剝走，爪痕還留在神木身上。',
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
        discovery: '古樹守衛事件後，夜裡開始有折角巨獸撞碎巨石。污染溪流把第二道傷口推到了月光下。',
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
    main_008: {
        arc: '丘陵的執念',
        source: '荊棘交換珠',
        location: '霧碑丘陵',
        speaker: { name: '草藥傳聞', avatar: '🌿' },
        discovery: '村民提到一種會變色的交換珠，草藥、壽命與詛咒像被同一隻手秤過重量。',
        available: '女巫的溫室被奪走後，交易規則開始傷人。要找她，不能只找路，還要讀懂她留下的價碼。',
        active: '調查霧碑丘陵中的荊棘交易痕跡，最後直面荊棘女巫。',
        completed: '荊棘女巫倒下後，交易珠裂開，裡面滲出的不是血，而是被強行保存的藥草香。',
        finished: '女巫事件證明古龍掠奪沒有只傷害守護者，它讓每個倖存者都開始用自己的方式失控。',
        nextLead: '前往霧碑丘陵，追查荊棘交易痕跡。',
        route: 'adventure',
        reportTo: { npcId: 'town_scholar', name: '書記', route: 'lobby', label: '回去找書記' }
    },
    main_009: {
        arc: '丘陵的執念',
        source: '潮濕拓片',
        location: '沉鐘海岸',
        speaker: { name: '遠方鐘聲', avatar: '🔔' },
        discovery: '潮聲沿著石碑傳到內陸，像有人把海底祭壇的痛苦塞進地脈裂縫。',
        available: '沉鐘神諭不是在求救，而是在無法控制地把海嘯記憶往外推。',
        active: '追查水聲、拓片與浮出的祭壇，擊敗沉鐘神諭。',
        completed: '鐘聲停止後，祭壇下方露出被硬生生挖走的核心位置。',
        finished: '深海寶珠被奪走的證據，讓古龍巢穴的輪廓更清楚了一點。',
        nextLead: '沿著潮濕拓片追到沉鐘神諭。',
        route: 'adventure',
        reportTo: { npcId: 'town_scholar', name: '書記', route: 'lobby', label: '回去找書記' }
    },
    main_010: {
        arc: '丘陵的執念',
        source: '被掘開的古墓',
        location: '遠古墓道',
        speaker: { name: '亡靈火種', avatar: '💀' },
        discovery: '古墓不是自然開裂。墓門像被外力挖開，枯魂法杖留下的凹痕還帶著冷光。',
        available: '失去法杖的巫妖正在用最糟糕的方式尋物：把所有死者叫醒一起找。',
        active: '擊退被喚醒的骷髏兵，找出巫妖真正藏身的封印缺口。',
        completed: '巫妖被擊敗後，墓道深處留下灰燼帳冊的一角。',
        finished: '亡靈暴動不是終點，它把你帶到人類貴族自己的末日準備。',
        nextLead: '追查古墓與骷髏軍勢，擊敗巫妖。',
        route: 'adventure',
        reportTo: { npcId: 'town_scholar', name: '書記', route: 'lobby', label: '回去找書記' }
    },
    main_011: {
        arc: '丘陵的執念',
        source: '灰燼帳冊',
        location: '黑曜石地宮',
        speaker: { name: '走私帳冊', avatar: '🔥' },
        discovery: '帳冊沒有記錄利潤，只記錄鐵器、糧食、工匠與誰還能被迫工作。',
        available: '灰燼男爵相信世界要完了，所以他決定先替世界示範一下怎麼完。',
        active: '沿著煤印與走私帳冊追到黑曜石地宮，擊敗灰燼男爵。',
        completed: '男爵倒下後，地宮的鉛牆裂開，黑焰邊境的熱浪灌了進來。',
        finished: '第二章收束：守護者、神諭、亡靈與人類恐懼，全都被同一場地脈崩毀推倒。',
        nextLead: '追查灰燼帳冊，進入黑曜石地宮。',
        route: 'adventure',
        reportTo: { npcId: 'village_elder', name: '村長', route: 'lobby', label: '回去找村長' }
    },
    main_012: {
        arc: '諸神黃昏',
        source: '龍巢熱痕',
        location: '北方邊境',
        speaker: { name: '黑焰熱痕', avatar: '🐉' },
        discovery: '各地被奪走的核心像一串燒焦的路標，全部指向北方。',
        available: '古龍眷屬不需要站出來解釋。牠們留下的缺口，已經把路畫得夠清楚。',
        active: '擊退翼龍、幼龍與龍騎士前哨，逼近古龍巢穴。',
        completed: '北境前哨被擊破，焦黑方尖碑上的熱痕開始連成巢穴方向。',
        finished: '龍巢之路打開，古龍就在被掠奪來的魔力精華之上。',
        nextLead: '前往北方邊境，沿著熱痕追到古龍巢穴。',
        route: 'adventure',
        reportTo: { npcId: 'village_elder', name: '村長', route: 'lobby', label: '回去找村長' }
    },
    main_013: {
        arc: '諸神黃昏',
        source: '焦黑方尖碑',
        location: '古龍巢穴',
        speaker: { name: '古龍巢穴', avatar: '🐲' },
        discovery: '古龍巢穴像一座用全大陸核心堆成的爐心，任何靠近它的魔力都被拉向中心。',
        available: '古龍不是為了支配世界才危險。牠只是要睡覺，而牠的床剛好壓在世界命脈上。',
        active: '登上焦黑方尖碑，擊敗古龍。',
        completed: '古龍倒下後，龍巢魔力外露，深淵封印開始崩裂。',
        finished: '古龍不是終點。牠留下的魔力源讓阿薩謝爾真正看見了出口。',
        nextLead: '前往焦黑方尖碑，挑戰古龍。',
        route: 'adventure',
        reportTo: { npcId: 'village_elder', name: '村長', route: 'lobby', label: '回去找村長' }
    },
    main_014: {
        arc: '諸神黃昏',
        source: '碎裂封印',
        location: '黑焰邊境',
        speaker: { name: '深淵裂口', avatar: '😈' },
        discovery: '深淵沒有沉默，它只是在等龍巢把足夠多的魔力暴露出來。',
        available: '魔王阿薩謝爾北上，不是為了保護人類，也不是為了與古龍合作。他只是聞到了更大的力量。',
        active: '穿越黑焰邊境，擊退深淵先鋒，找出封印裂口。',
        completed: '深淵先鋒被擊退後，裂口裡傳來王座拖過石面的聲音。',
        finished: '決戰入口開啟。接下來不是探索，而是阻止世界被兩股毀滅力量分食。',
        nextLead: '在黑焰邊境確認封印裂口。',
        route: 'adventure',
        reportTo: { npcId: 'village_elder', name: '村長', route: 'lobby', label: '回去找村長' }
    },
    main_015: {
        arc: '諸神黃昏',
        source: '終焉之戰',
        location: '龍巢殘骸',
        speaker: { name: '阿薩謝爾', avatar: '👑' },
        discovery: '龍巢殘骸成了世界上最大的魔力源，阿薩謝爾的目光終於越過人類，落在那團光上。',
        available: '這場戰鬥不是神話裡的正邪對決，而是兩個災難搶同一個世界核心。你剛好必須把兩邊都拒絕。',
        active: '擊敗魔族將軍，直面魔王阿薩謝爾。',
        completed: '阿薩謝爾倒下後，龍巢魔力開始回流地脈。城鎮裡每一條被保住的線，開始決定這場勝利能承受多少重量。',
        finished: '艾瑟利亞沒有立刻恢復和平，但明天還存在。至於那個明天是有名字、帶傷，或薄得讓人不敢鬆手，旅人手札會替你記下。',
        nextLead: '擊敗魔族將軍，挑戰魔王阿薩謝爾。',
        route: 'adventure',
        reportTo: { npcId: 'village_elder', name: '村長', route: 'lobby', label: '回去找村長' }
    },
    bounty_001: {
        arc: '城鎮委託',
        source: '書記的求助',
        location: '舊書桌',
        speaker: { name: '書記', avatar: '📚' },
        discovery: '書記說最近城外史萊姆變多了，村民擔心牠們繼續往農田靠近。',
        available: '書記請你消滅 5 個史萊姆，先確認這是不是單純增生，還是地脈異常的前兆。',
        active: '書記已把這件事寫進旅人手札：清掉靠近農田的史萊姆，再回來比對時間與地點。',
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
        arc: '丘陵短篇',
        source: '圖紙邊角的名字',
        location: '鍛造鋪',
        speaker: { name: '鍛造師', avatar: '⚒️' },
        characterProfile: {
            cause: '妮露原本只是鍛造鋪裡手最穩的學徒。地脈震動後，她把一疊圖紙帶去丘陵測試，從此沒有回來。',
            choice: '鍛造師一直假裝那只是失敗研究，直到你把刻著妮露名字的圖紙帶回來，他才承認自己是在等消息。',
            mainThread: '第二章進入霧碑丘陵後，圖紙會承接裝備成長，也會揭露地脈崩壞如何吞掉小人物。',
            townState: 'town.blacksmith.neelu_blueprint_named'
        },
        discovery: '你把殘缺圖紙交給鍛造師。他看見邊角上的名字後，鐵鉗停在半空；爐火還在響，屋裡卻忽然安靜得只剩那個名字。',
        available: '妮露曾試著用礦材吸收地脈震動。鍛造師需要鐵礦石與暗鋼補回比例，確認她留下的是可用配方，還是一封燒焦前沒寄出的信。',
        active: '帶回 5 個鐵礦石與 1 個暗鋼。鍛造師會重新校準妮露的圖紙，把缺口補到能開爐測試。',
        completed: '礦材讓圖紙缺口被補齊。鍛造師沒有急著開爐，先用袖口把妮露的名字擦乾淨，像怕灰塵替他先下結論。',
        finished: '妮露的圖紙被收進鍛造鋪。城鎮第一次承認那些失蹤者留下的不只是空位，還有尚未完成的路。',
        nextLead: '帶回鐵礦石 5 個與暗鋼 1 個，回去找鍛造師。',
        route: 'adventure',
        reportTo: { npcId: 'blacksmith', name: '鍛造師', route: 'lobby', label: '回去找鍛造師' },
        objectives: [
            '鍛造師認出殘缺圖紙上的學徒名字，請你找回能補上配方缺口的礦材。'
        ]
    },
    commission_forge_002: {
        arc: '終局短篇',
        source: '逃匠奧倫的筆記',
        location: '北境路線',
        speaker: { name: '鍛造師', avatar: '⚒️' },
        characterProfile: {
            cause: '逃匠奧倫從北境回來時只剩半本筆記。他說秘銀存在，只是多數人還沒把它帶回城鎮就先被龍影追上。',
            choice: '鍛造師決定把妮露的圖紙接到奧倫的筆記上，等於承認這條技術路線要服務終局生存。',
            mainThread: '第三章北境壓力升高後，裝備成長與古龍、魔王帶來的戰力門檻接上。',
            townState: 'town.blacksmith.mithril_route_ready'
        },
        discovery: '鍛造師把逃匠奧倫的筆記攤開。第一頁被燒掉一半，只剩一句話：「秘銀會篩掉所有僥倖。」',
        available: '北境路線打開後，鍛造師需要秘銀與強化紀錄。妮露圖紙的高階段落要在戰場上活下來，不能只在紙上好看。',
        active: '帶回 3 個秘銀礦石，並累計完成 5 次強化測試。鍛造師會把妮露與奧倫的兩份筆記接上。',
        completed: '秘銀在爐中穩定下來。鍛造師第一次相信妮露曾追著一條能抵達北境的鍛造路線，而非單純迷路。',
        finished: '鍛造鋪多了一本新冊，封面寫著「妮露與奧倫」。它看起來像技術手冊，也像失蹤者名冊。',
        nextLead: '帶回秘銀礦石 3 個，並累計強化 5 次後回去找鍛造師。',
        route: 'forge',
        reportTo: { npcId: 'blacksmith', name: '鍛造師', route: 'lobby', label: '回去找鍛造師' },
        objectives: [
            '鍛造師要用秘銀與強化紀錄，把妮露圖紙接上逃匠奧倫的北境筆記。'
        ]
    },
    commission_merchant_001: {
        arc: '丘陵暗線',
        source: '黑市收藏家的標籤',
        location: '黑市入口',
        speaker: { name: '收藏家伊文', avatar: '🕵️' },
        characterProfile: {
            cause: '伊文曾替貴族清點失物。灰燼男爵開始囤積鐵器後，他發現黑市標籤上殘留的詛咒碎片能指向真正的運貨路線。',
            choice: '他不願當英雄，只願當收據。可在這個世界裡，能看懂收據的人也會被捲進戰爭。',
            mainThread: '灰燼男爵線沒有在主線裡詳細交代黑市如何運作，伊文的支線補上城鎮暗流與走私因果。',
            townState: 'town.black_market.ledger_tags_read'
        },
        discovery: '古代錢幣打開暗巷後，收藏家伊文把一枚焦黑標籤推給你，語氣像在賣舊貨，眼神卻像在報案。',
        available: '伊文需要 1 個詛咒碎片辨認黑市標籤。碎片上的殘咒會把貨號照出來，證明灰燼男爵的貨物流進城鎮。',
        active: '帶回詛咒碎片。伊文會用它讀出黑市標籤背後的運貨路線，前提是你不要問他為什麼連違法收據都能看得懂。',
        completed: '伊文收下碎片後，標籤上的焦痕浮出一串貨號。它不像藏寶圖，倒像一份準備殺人的收據。',
        finished: '黑市把你記成「能找到不該存在之物的人」。巷口流浪者說這稱號聽起來很酷，直到它真的開始找你。',
        nextLead: '取得詛咒碎片 1 個，回到暗巷線索。',
        route: 'adventure',
        reportTo: { npcId: 'street_beggar', name: '巷口流浪者', route: 'lobby', label: '回到暗巷入口' },
        objectives: [
            '收藏家伊文需要詛咒碎片辨認灰燼男爵黑市標籤。'
        ]
    },
    commission_blacksmith_chimney: {
        arc: '城鎮短篇',
        source: '鍛造鋪白煙',
        location: '鍛造鋪',
        speaker: { name: '鍛造師', avatar: '⚒️' },
        characterProfile: {
            cause: '他曾經把一枚獵人鉤索修得太輕，獵人再也沒有回來。',
            choice: '繼續只做生意，或把爐火穩住，讓城鎮夜裡仍有能支撐冒險者的地方。',
            mainThread: '斷裂誘餌鉤讓鍛造系統接上銀鐮伏獵者線。',
            townState: 'town.blacksmith.forge_open'
        },
        discovery: '鍛造鋪的白煙倒灌進屋裡，鍛造師把咳嗽壓回喉嚨，指節還停在那枚斷裂誘餌鉤上。那枚鉤太乾淨，像被某種懂得等候的東西切開。',
        available: '鍛造師要鐵礦石修爐。聽起來像雜活，實際上是替城鎮留住夜裡的火聲；火聲停了，很多人會開始相信門外的黑暗比較有道理。',
        active: '帶回 5 個鐵礦石。鍛造師會校準煙道與爐口，順便把壞脾氣敲進鐵裡，免得它溢出來砸到路人。',
        completed: '鐵礦石堆在砧旁，白煙終於有了往上的方向。鍛造師沒說謝謝，只把爐門開得更大，像在對城外宣告他還醒著。',
        finished: '鍛造鋪重新亮起穩定火光。這座城多了一個深夜仍會敲鐵的人，也多了一條通往更硬裝備的路。',
        nextLead: '收集鐵礦石 5 個，回去找鍛造師。',
        route: 'adventure',
        reportTo: { npcId: 'blacksmith', name: '鍛造師', route: 'lobby', label: '回去找鍛造師' },
        objectives: [
            '鍛造師需要 5 個鐵礦石校準爐火，讓鍛造鋪重新穩定運作。'
        ]
    },
    commission_apothecary_bottles: {
        arc: '城鎮短篇',
        source: '藥師的空瓶',
        location: '市集邊棚',
        speaker: { name: '藥師', avatar: '🌿' },
        characterProfile: {
            cause: '師父教她在混亂時先整理瓶子，因為可控的小事能讓人不至於崩潰。',
            choice: '把凝膠腐蝕當成普通缺貨，或承認農田土壤可能已經被地脈異常滲入。',
            mainThread: '史萊姆凝膠變甜是地脈異常浮上地表的早期症狀。',
            townState: 'town.apothecary.stock_basic_potion'
        },
        discovery: '藥師把被凝膠咬穿的空瓶排成一列，表情像在數一群很不聽話的病人。她說史萊姆變多可以處理，凝膠開始發甜才讓人背脊發涼。',
        available: '她要 5 份史萊姆凝膠比對農田土壤。甜味會把人騙近一點，地脈異常也一樣，通常等人察覺時已經沾到鞋底。',
        active: '帶回史萊姆凝膠。瓶口朝上，步伐放穩；藥師已經洗過一次棚子，不想再替冒險者的手抖寫病歷。',
        completed: '凝膠樣本足夠分瓶檢測。藥師把每一滴黏液標上時間與地點，像把混亂拆成能被理解的小格子。',
        finished: '基礎藥水重新上架。市集邊棚仍有苦草味，但那股味道讓受傷的人知道，回來時還有人準備接住他們。',
        nextLead: '收集史萊姆凝膠 5 份，回去找藥師。',
        route: 'adventure',
        reportTo: { npcId: 'herbalist', name: '藥師', route: 'lobby', label: '回去找藥師' },
        objectives: [
            '藥師需要 5 份史萊姆凝膠，確認農田附近的土壤是否被地脈異常滲入。'
        ]
    },
    commission_guard_boots: {
        arc: '城鎮短篇',
        source: '南門守衛的靴底',
        location: '城鎮十字路',
        speaker: { name: '村長', avatar: '🏘️' },
        characterProfile: {
            cause: '村長管理城鎮太久，知道城鎮靠日常巡查活著，不靠英雄詩活著。',
            choice: '只追主線災難，或替一個每天看路的人補好靴底。',
            mainThread: '南門外路線確認後，守衛必須把玩家發現的路變成每天可用的路。',
            townState: 'town.south_gate.guard_route_ready'
        },
        discovery: '村長提到南門守衛的靴底裂開了。那名守衛每天最早踩上城外路線，晚飯前又把鞋上的泥帶回來，像替城鎮量一遍今天還能活到哪裡。',
        available: '南門外路線剛重新標記，需要有人每天確認。村長要獸皮修靴底，這件小事會讓地圖從紙上落回地面。',
        active: '帶回 3 張獸皮。守衛明天還得站在門口，腳底如果先投降，城鎮就少了一雙替大家看路的眼睛。',
        completed: '獸皮足夠修補靴底。村長把皮料收進布袋時，動作很慢，像在替一段普通日子縫上邊。',
        finished: '南門守衛重新站穩。城外仍有怪物與未知，可城門口多了一個每天願意先看一眼的人。',
        nextLead: '收集獸皮 3 張，回去找村長。',
        route: 'adventure',
        reportTo: { npcId: 'village_elder', name: '村長', route: 'lobby', label: '回去找村長' },
        objectives: [
            '村長想替南門守衛修靴底，需要 3 張獸皮。'
        ]
    },
    commission_herb_basket: {
        arc: '丘陵短篇',
        source: '自己回來的採藥籃',
        location: '市集邊棚',
        speaker: { name: '藥師', avatar: '🌿' },
        characterProfile: {
            cause: '採藥人失蹤後，籃子卻自己回來，讓藥師無法再把毒霧當成遠方問題。',
            choice: '假裝這只是怪事，或承認荊棘女巫的交易規則已經靠近城鎮。',
            mainThread: '荊棘女巫線補充了龍族掠奪靈草後，地方如何被交易規則扭曲。',
            townState: 'town.apothecary.understands_thorn_trade'
        },
        discovery: '一只空採藥籃自己回到市集邊棚，提把上綁著新鮮荊棘。藥師盯著它很久，最後只說：籃子不會走路，會走路的是拿過它的人。',
        available: '荊棘女巫的交易規則開始靠近城鎮。村民怕得太久，已經有人願意照著荊棘標價交出草藥，只求今晚輪不到自己。',
        active: '調查毒霧林地，帶回 2 份毒腺並擊退 4 隻毒蛛。藥師需要知道那片霧正從哪裡往城鎮推進。',
        completed: '毒腺樣本與毒蛛痕跡都指向被扭曲的交易路線。女巫正在重建溫室，她索要的每一份草藥都像從村民身上拔下的日子。',
        finished: '藥師把採藥籃掛在棚邊。她盯著籃底縫線看了很久，像終於發現這不是怪事，而是一個人拼命送回來的求救。',
        nextLead: '回去找藥師。她想拆開籃底，確認縫線裡藏著什麼。',
        route: 'adventure',
        reportTo: { npcId: 'herbalist', name: '藥師', route: 'lobby', label: '回去找藥師' },
        objectives: [
            '藥師需要 2 份毒腺樣本，並請我擊退毒霧林地附近的毒蛛。'
        ]
    },
    commission_herb_basket_002: {
        arc: '丘陵短篇',
        source: '籃底縫著的名字',
        location: '市集邊棚',
        speaker: { name: '藥師', avatar: '🌿' },
        characterProfile: {
            cause: '採藥籃不是自己回來，而是失蹤採藥人把警告縫在籃底，讓它沿著舊路被人撿回城鎮。',
            choice: '藥師必須承認自己不是只在救傷，也在接住那些沒能自己回來的人。',
            mainThread: '荊棘女巫線透過失蹤採藥人的縫線，補上普通人如何被迫替女巫的溫室付代價。',
            townState: 'town.apothecary.remembers_lost_gatherer'
        },
        discovery: '藥師拆開籃底，縫線裡夾著一段名字。那位採藥人沒有留下遺言，只留下方向，像是知道自己回不來，也要讓警告先抵達。',
        available: '縫線上的氣息正在散掉。藥師需要森林精華穩住它，也需要你清掉那條路上的毒蛛，否則下一個撿到籃子的人可能不會有機會把它帶回來。',
        active: '帶回 2 份森林精華，並清掉縫線指向路線上的 3 隻毒蛛。這一次你追的不是怪物數量，而是一個名字留下的最後方向。',
        completed: '森林精華穩住了縫線。藥師讀出失蹤採藥人的名字，沉默了一會兒，才把它抄到藥棚門口。',
        finished: '藥棚多了一小塊木牌。上面沒有英雄稱號，只有一個採藥人的名字，以及一句很短的話：她把警告送回來了。',
        nextLead: '帶回森林精華 2 份，清掉毒蛛 3 隻後回去找藥師。',
        route: 'adventure',
        reportTo: { npcId: 'herbalist', name: '藥師', route: 'lobby', label: '回去找藥師' },
        objectives: [
            '藥師需要森林精華穩住籃底縫線，並請我清掉失蹤採藥人留下路線上的毒蛛。'
        ]
    },
    commission_grave_bookmark: {
        arc: '丘陵短篇',
        source: '古代學者的書籤',
        location: '舊書桌',
        speaker: { name: '書記', avatar: '📚' },
        characterProfile: {
            cause: '書記害怕自己有一天也會把所有恐懼寫成冰冷分類。',
            choice: '把巫妖只記成怪物，或把牠曾經是古代學者的名字補回紀錄。',
            mainThread: '巫妖線補充龍族奪走法杖後，亡靈暴動背後的恐慌。',
            townState: 'town.scholar.records_lich_name'
        },
        discovery: '書記在舊檔案裡找到一張書籤，上面寫著：「若我還在尋找法杖，請記住我曾經有名字。」墨跡很淡，求救卻很清楚。',
        available: '巫妖仍會殺人。書記沒有替牠辯解，只想知道那具怒火裡還殘留哪位學者的恐懼。',
        active: '從古墓附近帶回 5 份骨頭碎片，並擊退 3 名骷髏兵。書記要用墓道痕跡找回那個名字。',
        completed: '骨片上的刻痕補上了失落姓名。怪物仍是怪物，但旅人手札裡終於多了一個曾經活過的人。',
        finished: '書記把書籤夾進手札最安靜的一頁。邊緣那串縮寫被他圈起來，他說那不像名字，倒像古代御術師留下的懺悔。',
        nextLead: '回去找書記。他看懂了書籤邊緣的朱利安縮寫。',
        route: 'adventure',
        reportTo: { npcId: 'town_scholar', name: '書記', route: 'lobby', label: '回去找書記' },
        objectives: [
            '書記需要古墓附近的骨片與戰鬥紀錄，辨認巫妖生前的學者名字。'
        ]
    },
    commission_grave_bookmark_002: {
        arc: '丘陵短篇',
        source: '朱利安的邊註',
        location: '舊書桌',
        speaker: { name: '書記', avatar: '📚' },
        characterProfile: {
            cause: '書籤邊緣的縮寫指向大御術師朱利安，讓巫妖支線與遠古遺跡的盲目秩序接上。',
            choice: '書記可以把它當成學術註腳，也可以承認古代文明的錯誤仍在今天殺人。',
            mainThread: '遠古遺跡線透過朱利安邊註補足：秩序與防衛系統也可能在地脈崩毀後變成災難。',
            townState: 'town.scholar.julian_margin_read'
        },
        discovery: '書記把書籤翻到背面，看到一串縮寫：JUL。旁邊還有一句小到快看不見的字：「若守衛仍在運作，請先替活人道歉。」',
        available: '朱利安的邊註需要古代符文比對。書記懷疑遠古守衛不是惡意攻擊，而是太忠於一條早該停止的命令。',
        active: '帶回 2 份古代符文，並擊退 2 具遠古守衛。這能讓書記判斷朱利安留下的究竟是警告還是懺悔。',
        completed: '符文與邊註對上了。朱利安沒有預見今日的災難，卻早就害怕自己建造的秩序有一天不懂得停下。',
        finished: '書記把邊註抄到遠古遺跡紀錄旁：神靈的盾牌沒有慈悲，使用盾牌的人才必須有。',
        nextLead: '帶回古代符文 2 份，擊退遠古守衛 2 具後回去找書記。',
        route: 'adventure',
        reportTo: { npcId: 'town_scholar', name: '書記', route: 'lobby', label: '回去找書記' },
        objectives: [
            '書記需要古代符文與遠古守衛的戰鬥紀錄，判讀朱利安留下的邊註。'
        ]
    },
    commission_drowned_bell_insomnia: {
        arc: '丘陵短篇',
        source: '夜裡的沉鐘聲',
        location: '舊書桌',
        speaker: { name: '書記', avatar: '📚' },
        characterProfile: {
            cause: '居民連續幾夜聽見鐘聲，別人以為他失眠，書記卻發現節奏與海岸紀錄吻合。',
            choice: '把荒謬聽聞歸類成謠言，或把它當成沉鐘神諭影響城鎮的第一段回聲。',
            mainThread: '沉鐘神諭線補充海岸異常如何沿著地脈傳回城鎮。',
            townState: 'town.scholar.records_drowned_bell_rhythm'
        },
        discovery: '有居民連續幾夜聽見海底鐘聲。他把節奏敲在書記桌上，指尖抖得厲害；那一刻，失眠有了形狀。',
        available: '鐘聲像從地脈裂縫滲回城鎮。書記要回聲殘留比對節奏，讓那些醒著的人知道自己沒有被夢拖壞。',
        active: '擊退沉鐘異響附近的 3 名幽魂，帶回 3 份回聲殘留。每一份殘響都可能指向海岸的真正災變。',
        completed: '回聲節奏與沉鐘神諭的海岸紀錄對上了。那名失眠居民聽見的聲音，來自一座被拉上海面的祭壇。',
        finished: '書記把鐘聲紀錄補進手札。城鎮夜裡仍有人睡不好，可他們終於知道黑暗裡有另一個原因，而非自己孤單發瘋。',
        nextLead: '擊退幽魂 3 隻，帶回回聲殘留 3 份，回去找書記。',
        route: 'adventure',
        reportTo: { npcId: 'town_scholar', name: '書記', route: 'lobby', label: '回去找書記' },
        objectives: [
            '書記需要沉鐘異響附近的幽魂紀錄與回聲殘留。'
        ]
    },
    commission_ash_ledger_names: {
        arc: '丘陵短篇',
        source: '失蹤工匠名單',
        location: '城鎮十字路',
        speaker: { name: '村長', avatar: '🏘️' },
        characterProfile: {
            cause: '村長把失蹤工匠名單藏在抽屜裡，因為名字貼出去，家屬就不能再假裝人只是晚點回來。',
            choice: '維持城鎮表面安定，或把名字釘上公告欄，承認灰燼男爵的暴政已經靠近。',
            mainThread: '灰燼男爵線補充人類勢力在末日恐懼中如何變成另一種災難。',
            townState: 'town.notice_board.missing_workers_named'
        },
        discovery: '村長抽屜裡藏著一份失蹤工匠名單，紙角被摺得很平。那不像文件，像一張每天都被拿起又放回去的傷口。',
        available: '灰燼帳冊把那些名字連到黑曜石要塞。村長需要影徽作證，才敢把家屬已經猜到的答案釘上公告欄。',
        active: '擊退黑鐵倉道附近的 4 名影兵，帶回 2 枚影徽。這些徽記會告訴城鎮，人去了哪裡。',
        completed: '影徽足夠證明工匠去向。村長把名單攤平，像在練習如何把壞消息說得不會再傷人一次。',
        finished: '失蹤名單被釘上公告欄。廣場安靜下來，安靜得很重。當晚，有家屬把一柄舊工具交給村長，說上面的刻痕也許能說話。',
        nextLead: '回去找村長。失蹤工匠的家屬交出了一柄刻著路線的舊工具。',
        route: 'adventure',
        reportTo: { npcId: 'village_elder', name: '村長', route: 'lobby', label: '回去找村長' },
        objectives: [
            '村長需要黑鐵倉道附近的影徽，確認失蹤工匠名單。'
        ]
    },
    commission_ash_ledger_names_002: {
        arc: '丘陵短篇',
        source: '工匠最後的刻痕',
        location: '城鎮十字路',
        speaker: { name: '村長', avatar: '🏘️' },
        characterProfile: {
            cause: '失蹤名單公開後，家屬才敢把舊工具交出來，讓工匠不只是被奪走的人，也成為留下線索的人。',
            choice: '村長必須從安撫家屬轉向揭露男爵地宮的實際工事。',
            mainThread: '灰燼男爵線補強黑曜石地宮的來源：它不是突然出現，而是由被奪走的工匠一錘一錘挖出來。',
            townState: 'town.notice_board.worker_marks_mapped'
        },
        discovery: '家屬把舊工具柄放到村長桌上。木柄被磨得發亮，上面刻著短短幾道線，像路線，也像一個不敢寫完的求救。',
        available: '刻痕指向黑鐵倉道。村長需要暗鋼與戰鬥紀錄確認那裡是否就是工匠被迫運料的路。',
        active: '擊退 3 名影兵，帶回 1 份暗鋼。若材料吻合，黑曜石地宮的輪廓就不再只是男爵帳冊裡的傳聞。',
        completed: '暗鋼成分與刻痕方向吻合。那些工匠留下的不是完整地圖，卻足夠讓城鎮看見地宮的一角。',
        finished: '村長把工具刻痕拓片貼在失蹤名單旁。家屬沒有因此好過，但至少他們知道，親人曾把一條路刻回家。',
        nextLead: '擊退影兵 3 名、帶回暗鋼 1 份後回去找村長。',
        route: 'adventure',
        reportTo: { npcId: 'village_elder', name: '村長', route: 'lobby', label: '回去找村長' },
        objectives: [
            '村長要我依照工具柄刻痕追查黑鐵倉道，確認男爵地宮的工事材料。'
        ]
    },
    commission_northern_letter: {
        arc: '終局短篇',
        source: '焦邊家書',
        location: '城鎮十字路',
        speaker: { name: '村長', avatar: '🏘️' },
        characterProfile: {
            cause: '一名信使倒在城門口，懷裡不是軍令，而是一封抱怨豆子太硬的家書。',
            choice: '把北境只當成高階戰場，或承認那裡曾經有人生活、寫信、等回音。',
            mainThread: '古龍線讓北方不只是目的地，而是被龍焰撕開的家園。',
            townState: 'town.refugees.northern_letters'
        },
        discovery: '信使倒在城門口，懷裡那封信被熱風烤得捲邊。信裡沒有戰報，只抱怨北境天空變紅，豆子煮不軟，還問家裡的狗有沒有胖。',
        available: '那封家書教不了你屠龍，卻讓北方從地圖邊界變成有人等信、煮飯、抱怨日常的地方。',
        active: '擊退北境路線上的 2 隻飛龍斥候，帶回 2 片飛龍鱗。村長要確認信使穿越的是哪一段熱風路線。',
        completed: '飛龍鱗與焦邊信件對上了。那名信使帶回的不是命令，是一條快被龍焰燒斷的回家路。',
        finished: '村長把北境來信歸檔。城鎮第一次真正聽見北方。隔天，他從抽屜裡找出一封沒有寄出的回信，紙角被捏得皺巴巴。',
        nextLead: '回去找村長。他找到了一封沒有寄出的回信。',
        route: 'adventure',
        reportTo: { npcId: 'village_elder', name: '村長', route: 'lobby', label: '回去找村長' },
        objectives: [
            '村長需要北境路線上的飛龍鱗，確認信使穿越的熱風路線。'
        ]
    },
    commission_northern_letter_002: {
        arc: '終局短篇',
        source: '沒有寄出的回信',
        location: '城鎮十字路',
        speaker: { name: '村長', avatar: '🏘️' },
        characterProfile: {
            cause: '北境家書被收進紀錄後，城鎮裡等待消息的人才願意承認自己也寫過回信。',
            choice: '村長知道回信送不到，但仍選擇確認路線，讓等待不是被輕輕放棄。',
            mainThread: '古龍線把北境塑造成戰場，回信支線把戰場拉回城鎮裡那些仍想回應的人。',
            townState: 'town.refugees.unsent_reply_archived'
        },
        discovery: '村長拿出一封沒有寄出的回信。信裡只有一句「我知道了」，像短得可笑，卻重得讓人很難把它放回抽屜。',
        available: '回信不一定能送到北方，但路線能不能走必須被確認。村長要你追到熱痕最深處，看龍族是否已經徹底封住回音。',
        active: '擊退 2 隻幼龍，帶回 1 枚龍牙。這不是送信任務，而是確認城鎮的回答是否還有路可走。',
        completed: '龍牙證明熱痕路線已被封鎖。回信仍送不出去，但城鎮終於知道沉默不是因為沒人回應。',
        finished: '村長把未寄出的回信收進北境紀錄旁。紙上那句「我知道了」沒有抵達北方，卻抵達了所有等待的人心裡。',
        nextLead: '擊退幼龍 2 隻、帶回龍牙 1 枚後回去找村長。',
        route: 'adventure',
        reportTo: { npcId: 'village_elder', name: '村長', route: 'lobby', label: '回去找村長' },
        objectives: [
            '村長要我確認北境回信路線是否仍能通行。'
        ]
    },
    commission_last_soup: {
        arc: '終局短篇',
        source: '避難者廚房',
        location: '市集邊棚',
        speaker: { name: '藥師', avatar: '🌿' },
        characterProfile: {
            cause: '避難者湧入後，藥師發現傷口能包紮，人心餓裂了卻很難縫。',
            choice: '只管藥水，或承認補給、熱湯與傷患都是同一套生存系統。',
            mainThread: '魔王封印碎裂後，城鎮從冒險據點變成臨時避難所。',
            townState: 'town.refugees.soup_kitchen_warm'
        },
        discovery: '避難者擠進市集邊棚，孩子抱著空碗睡著。藥師說她不懂預言，只知道人餓到發抖時，連希望都拿不穩。',
        available: '一鍋熱湯寫不進英雄詩，卻能讓明天早上還有人願意排隊。藥師需要補給，也需要那條補給路線先安靜下來。',
        active: '帶回 6 份可食用肉與 1 份火焰精華，並擊退 3 名靠近補給路線的深淵士兵。',
        completed: '補給足夠讓廚房重新開火。避難者仍然害怕，但有人先把碗端穩，恐懼就少了一點地方可以坐下。',
        finished: '城鎮夜裡多了一點湯香。焦味仍在風裡，可熱氣升起時，棚下的人終於開始談明天。',
        nextLead: '帶回可食用肉 6 份、火焰精華 1 份，擊退深淵士兵 3 名後回去找藥師。',
        route: 'adventure',
        reportTo: { npcId: 'herbalist', name: '藥師', route: 'lobby', label: '回去找藥師' },
        objectives: [
            '藥師需要肉、火焰精華與安全補給路線，讓避難者廚房能撐過夜晚。'
        ]
    },
    commission_casino_001: {
        arc: '城中暗流',
        source: '帳房瑪洛的假勝率',
        location: '賭場',
        speaker: { name: '巷口流浪者', avatar: '🧥' },
        characterProfile: {
            cause: '瑪洛原本只是賭場帳房。她相信數字不會說謊，直到灰燼男爵的黑錢把每張賭桌的勝率都變成暗號。',
            choice: '她不敢直接報案，因為報案的人也可能在帳冊裡。她把假勝率交給巷口流浪者，再讓你去賭桌上驗證。',
            mainThread: '灰燼男爵線在主線裡處理暴政與要塞，賭場支線補上黑錢如何流進城鎮。',
            townState: 'town.casino.false_odds_exposed'
        },
        discovery: '巷口流浪者把一張沾著菸味的勝率表塞給你。帳房瑪洛算到半夜，發現骰子很會說謊，而且說得比人還整齊。',
        available: '瑪洛要你在老虎機與骰子局實測勝率。賭桌上的規律像暗號，灰燼男爵的黑錢可能就躲在那些太漂亮的輸贏裡。',
        active: '前往賭場，在老虎機與骰子局取得足夠勝場，記錄每一次被調整過的節奏。',
        completed: '勝率確實被人動過。瑪洛的帳冊邊緣寫著黑曜石要塞的貨號，字小得像在躲一把刀。',
        finished: '賭場暗流被翻到檯面上。巷口流浪者說，莊家永遠贏有時是俗語，有時是證詞。',
        nextLead: '到賭場完成老虎機 5 勝與骰子 5 勝，再回暗巷入口找巷口流浪者。',
        route: 'casino',
        reportTo: { npcId: 'street_beggar', name: '巷口流浪者', route: 'lobby', label: '回到暗巷入口' },
        objectives: [
            '巷口流浪者請你替帳房瑪洛驗證賭場勝率是否被灰燼男爵的人做成暗號。'
        ]
    },
    commission_casino_002: {
        arc: '終局短篇',
        source: '最後一夜的籌碼',
        location: '賭場',
        speaker: { name: '巷口流浪者', avatar: '🧥' },
        characterProfile: {
            cause: '深淵前鋒靠近後，賭場失去娛樂功能，卻還剩下城裡最快流動的金幣。',
            choice: '瑪洛把最後一夜改成避難籌款。她討厭把善意寫進帳冊，因為善意通常沒有發票，但她還是寫了。',
            mainThread: '第三章主線處理魔王壓力，這條支線補上城鎮如何把灰色產業轉成生存資源。',
            townState: 'town.casino.relief_fund_counted'
        },
        discovery: '巷口流浪者說，瑪洛把賭場最後一夜的籌碼改成補給券。她需要一個能贏錢，又不會被保鑣立刻扔出去的人。',
        available: '這次坐上賭桌是為了把黑錢逼出來，換成避難者明天的乾糧。運氣仍然會嘲笑你，但至少嘲笑得有用途。',
        active: '在賭場累計盈利 1000 枚籌碼，替避難補給湊出足夠資金。',
        completed: '補給基金湊齊了。瑪洛在帳冊最後寫下：如果明天還有賭桌，希望大家只是為了好玩。',
        finished: '賭場的燈比平常暗，卻第一次不像在引誘人。巷口流浪者說，這可能是城裡最荒唐、也最像勝利的一晚。',
        nextLead: '在賭場累計盈利 1000 枚籌碼，回暗巷入口找巷口流浪者。',
        route: 'casino',
        reportTo: { npcId: 'street_beggar', name: '巷口流浪者', route: 'lobby', label: '回到暗巷入口' },
        objectives: [
            '瑪洛把賭場最後一夜改成避難籌款，你需要把籌碼換成真正的補給。'
        ]
    },
    commission_coast_lamplighter: {
        arc: '丘陵短篇',
        source: '守燈人的油壺',
        location: '沉鐘海岸',
        speaker: { name: '書記', avatar: '📚' },
        characterProfile: {
            cause: '塔維是海岸守燈人。海嘯後他沒有離開，因為他怕自己一走，倖存者就再也找不到岸。',
            choice: '他聽不懂沉鐘聲，卻每晚把燈點得更亮。問題是燈也把亡魂引了回來。',
            mainThread: '沉鐘神諭線主線不適合細講海岸倖存者，塔維支線補上災後地點與小人物的後果。',
            townState: 'town.coast_refugee_lamp_lit'
        },
        discovery: '書記整理完沉鐘節奏後，才敢承認海岸還有一盞燈每晚亮著。那盞燈太固執，固執得像有人在黑暗裡一直說：我還在。',
        available: '守燈人塔維需要有人驅散被燈號引回岸邊的亡魂，再用靈質校正節奏。燈可以指路，也可能把錯的人叫回來。',
        active: '到沉鐘海岸驅散 2 名亡魂，帶回 2 份靈質，讓書記校正塔維的燈號。',
        completed: '靈質讓燈號不再錯拍。塔維的燈仍然亮著，這次只替活人指路，不再把死者一併叫回岸邊。',
        finished: '海岸紀錄旁多了一個名字：塔維。書記說那不算英雄，只是有人害怕到不敢熄燈；有時這已經很了不起。',
        nextLead: '驅散亡魂 2 名、收集靈質 2 份後回去找書記。',
        route: 'adventure',
        reportTo: { npcId: 'town_scholar', name: '書記', route: 'lobby', label: '回去找書記' },
        objectives: [
            '書記請你協助守燈人塔維修正海岸燈號，避免亡魂被錯誤光源引回岸邊。'
        ]
    },
    commission_broken_standard: {
        arc: '終局短篇',
        source: '斷旗手芙蕾',
        location: '城門與深淵前線',
        speaker: { name: '村長', avatar: '🏘️' },
        characterProfile: {
            cause: '芙蕾是北境撤退線的斷旗手。她負責把最後一面旗帶回來，表示撤退不是潰敗。',
            choice: '她明明害怕，卻把旗握到手指發紫。她不想被稱為勇敢，只希望倖存者知道自己不是被丟下。',
            mainThread: '魔王前鋒逼近時，主線聚焦戰場，芙蕾支線補上城鎮如何理解撤退與存活。',
            townState: 'town.gate.broken_standard_raised'
        },
        discovery: '村長收到一面斷旗，旗布焦黑，旗杆上還掛著惡魔角飾。送來的人說芙蕾握著它一路撤退，手指紫得像凍傷。',
        available: '芙蕾要奪回旗杆上的角飾。那面旗該代表撤退線仍有人指揮，不能被深淵做成嘲笑倖存者的裝飾。',
        active: '擊退 4 名深淵士兵，帶回 2 個惡魔角飾，修補斷旗。',
        completed: '斷旗被重新掛上城門。芙蕾沒有笑，她只是慢慢鬆開手，像終於把一口氣交回風裡。',
        finished: '城門上的旗殘破，卻比嶄新的旗更能讓人看懂此刻。芙蕾沒有接受英雄稱號，只把一份被汗水泡皺的點名冊交給村長。',
        nextLead: '回去找村長。芙蕾交出撤退名單，還有人需要被找回來。',
        route: 'adventure',
        reportTo: { npcId: 'village_elder', name: '村長', route: 'lobby', label: '回去找村長' },
        objectives: [
            '村長請你協助斷旗手芙蕾修補撤退旗，讓城鎮知道前線仍有秩序。'
        ]
    },
    commission_broken_standard_002: {
        arc: '終局短篇',
        source: '旗影下的點名',
        location: '城門與深淵前線',
        speaker: { name: '村長', avatar: '🏘️' },
        characterProfile: {
            cause: '斷旗掛回城門後，芙蕾才願意把撤退名單交出來。她怕那些名字被當成戰損數字。',
            choice: '城鎮可以只把旗當士氣象徵，也可以接住旗影下每一個還沒回來的人。',
            mainThread: '魔王前鋒線補上撤退後續，讓終局不是只有戰鬥壓力，也有城鎮如何辨認失散者。',
            townState: 'town.gate.retreat_names_called'
        },
        discovery: '芙蕾的撤退名單被汗水泡皺。她說自己不是英雄，也不想要英雄故事，只想知道那些沒回來的人有沒有被漏念。',
        available: '深淵追兵沿撤退線逼近。村長需要你截斷這批追兵，讓點名不會在下一次鐘聲裡又多出空白。',
        active: '擊退 5 名深淵士兵，帶回 1 個魔族角，確認追兵批次已被截斷。',
        completed: '追兵被截斷，芙蕾終於敢把名單從頭念到尾。每個名字都像一盞小燈，被人重新點了一次。',
        finished: '城門下多了一張尋人榜。旗仍在風裡，名單也在風裡；這一次，城鎮看見的不只是防線，還有防線後的人。',
        nextLead: '擊退深淵士兵 5 名、帶回魔族角 1 個後回去找村長。',
        route: 'adventure',
        reportTo: { npcId: 'village_elder', name: '村長', route: 'lobby', label: '回去找村長' },
        objectives: [
            '村長要我替芙蕾確認撤退線追兵，讓失散者名單能被完整點過。'
        ]
    },
    commission_scholar_last_index: {
        arc: '終局短篇',
        source: '書記的最後索引',
        location: '舊書桌',
        speaker: { name: '書記', avatar: '📚' },
        characterProfile: {
            cause: '書記一直用紀錄抵抗混亂。魔王現身後，他終於發現自己不是怕死，而是怕所有人死後連名字都排不好。',
            choice: '他決定先替活人編索引，不替死人寫墓誌銘。這很固執，也很像他。',
            mainThread: '終局主線不宜塞滿所有平民名冊，書記支線把世界末日前的記憶保存起來。',
            townState: 'town.scholar.last_index_bound'
        },
        discovery: '書記把最後索引的空白封皮拿給你，語氣平靜得反常。他說如果城鎮撐不過去，至少名字不能亂。',
        available: '他需要深淵碎片封住黑印，也需要奪回被深淵將領搶走的索引封皮。這本冊子記活人，因為他拒絕先替大家寫墓誌銘。',
        active: '擊退 1 名深淵將領，收集 2 份深淵碎片，讓書記完成最後索引。',
        completed: '索引封皮被取回，黑印被封住。書記放下筆時手還在抖，字跡卻比平常更穩。',
        finished: '最後索引被收進旅人手札旁。它無法讓世界變安全，卻讓明天醒來的人知道誰仍在，誰需要被找回。',
        nextLead: '擊退深淵將領 1 名、收集深淵碎片 2 份後回去找書記。',
        route: 'adventure',
        reportTo: { npcId: 'town_scholar', name: '書記', route: 'lobby', label: '回去找書記' },
        objectives: [
            '書記需要深淵碎片與索引封皮，完成活人名冊的最後整理。'
        ]
    },
    hidden_broke: {
        arc: '城中暗流',
        source: '一無所有時的眼力',
        location: '暗巷入口',
        speaker: { name: '巷口流浪者', avatar: '🧥' },
        discovery: '你在身無分文時回到城鎮。暗巷的風比平常冷，巷口流浪者卻像早就知道你會走到這裡。',
        available: '這不是委託，也不像好事。流浪者說，口袋空了以後，人才會看見被有錢人踩過去的小路。',
        active: '回到暗巷入口，聽巷口流浪者講完那套很不體面、卻很有用的生存法。',
        completed: '巷口流浪者把一無所有時的生存法則塞進你的手札。那幾句話聽起來像玩笑，卻每句都能在城裡換一口氣。',
        finished: '你仍然沒有變富，但至少知道自己不是唯一摔進坑裡的人。這在某些夜晚已經算一種資產。',
        nextLead: '回到暗巷入口，找巷口流浪者談談。',
        route: 'lobby',
        reportTo: { npcId: 'street_beggar', name: '巷口流浪者', route: 'lobby', label: '回到暗巷入口' },
        objectives: [
            '身無分文後，暗巷入口的巷口流浪者似乎有話要說。'
        ]
    },
    hidden_death_loop: {
        arc: '隱藏短篇',
        source: '反覆醒來的早晨',
        location: '城鎮十字路',
        speaker: { name: '村長', avatar: '🏘️' },
        discovery: '你又一次從城鎮醒來。鞋底的泥、身上的傷、還有村長看你的眼神都在說：這不是第一次。',
        available: '死亡沒有把你帶走，只把你送回來。村長不把這件事寫成神蹟，他只問你下一場戰鬥能不能活著結束。',
        active: '在下一場戰鬥中獲勝，確認這不是單純被世界拿來反覆摔打的惡作劇。',
        completed: '你贏下下一場戰鬥時，胸口那種被拉回城鎮的空洞感終於安靜了一點。',
        finished: '村長把這段紀錄夾進手札最裡面。不是每件怪事都該先講給大家聽，尤其是聽起來會讓人睡不著的那種。',
        nextLead: '贏下一場戰鬥後，回去找村長確認這段異常。',
        route: 'adventure',
        reportTo: { npcId: 'village_elder', name: '村長', route: 'lobby', label: '回去找村長' },
        objectives: [
            '死亡次數多到開始留下規律。下一場戰鬥若能獲勝，也許能確認這股異常。'
        ]
    },
    hidden_gambler_ruin: {
        arc: '城中暗流',
        source: '輸到規律浮上來',
        location: '賭場',
        speaker: { name: '巷口流浪者', avatar: '🧥' },
        discovery: '你在賭場輸到連莊家都懶得安慰。巷口流浪者說，連輸十次不是運氣差，而是有人想讓你看見底牌。',
        available: '他要你再回賭桌贏一次。不是為了翻本，而是確認那些失敗裡有沒有被安排好的節奏。',
        active: '回到賭場贏下一局，讓輸到發亮的規律露出真正輪廓。',
        completed: '你終於贏回一局。那一刻不像幸運，比較像有人把門縫開了一點點。',
        finished: '巷口流浪者把這段寫成「不要相信自己快轉運了」。他說這是對所有賭徒最善良、也最難聽的忠告。',
        nextLead: '到賭場贏下一局，再回暗巷入口找巷口流浪者。',
        route: 'casino',
        reportTo: { npcId: 'street_beggar', name: '巷口流浪者', route: 'lobby', label: '回到暗巷入口' },
        objectives: [
            '連續輸局後，巷口流浪者要你回賭場贏下一局，確認失敗是否藏著人為痕跡。'
        ]
    },
    hidden_dark_deal: {
        arc: '賭場暗流',
        source: '血籌碼落桌',
        location: '賭場暗桌',
        speaker: { name: '巷口流浪者', avatar: '🧥' },
        discovery: '暗桌輸局後，骨骰停在桌面中央。籌碼被收走，血也被收走，惡魔莊家的笑容像一張還沒簽名的契約。',
        available: '巷口流浪者看見你袖口的血印，說那不是傷口，是賭場留下的收據。他要你回去贏一局，逼莊家把真正的契約吐出來。',
        active: '回到賭場暗桌贏下一局。不要讓莊家繼續把你的血當成押金。',
        completed: '你在暗桌贏回一局。莊家的指甲敲了三下，契約正文從桌縫裡滑出來，像一封很不情願的道歉信。',
        finished: '巷口流浪者把契約收進油紙袋。他說這張紙有用，因為有些門只認貪婪的簽名，不認正經人的敲門聲。',
        nextLead: '到賭場暗桌贏下一局，再回暗巷入口找巷口流浪者。',
        route: 'casino',
        reportTo: { npcId: 'street_beggar', name: '巷口流浪者', route: 'lobby', label: '回到暗巷入口' },
        objectives: [
            '暗桌輸局留下血印。巷口流浪者要你回去贏下一局，把契約正文逼出來。'
        ]
    },
    hidden_lucky_seven: {
        arc: '城中暗流',
        source: '七次鈴聲',
        location: '賭場',
        speaker: { name: '巷口流浪者', avatar: '🧥' },
        discovery: '你連續撞見大獎後，賭場的鈴聲開始聽起來不像慶祝，比較像有人在後台敲暗號。',
        available: '巷口流浪者說，七是好數字，因為人們看到七就會暫時停止懷疑。這句話本身就很可疑。',
        active: '在老虎機累積 7 次勝利，把那串過分整齊的好運拆開來看。',
        completed: '第七次勝利響起時，鈴聲背後多了一拍。那不是祝福，是有人終於忍不住敲錯了。',
        finished: '巷口流浪者把幸運符交給你，然後補一句：真正的好運是知道什麼時候離桌。這句他大概對很多人說過，但沒幾個聽。',
        nextLead: '到賭場在老虎機累積 7 次勝利，再回暗巷入口。',
        route: 'casino',
        reportTo: { npcId: 'street_beggar', name: '巷口流浪者', route: 'lobby', label: '回到暗巷入口' },
        objectives: [
            '連續大獎引來暗巷注意。累積 7 次老虎機勝利，確認幸運背後是否有人為暗號。'
        ]
    },
    hidden_max_enhance: {
        arc: '鍛造短篇',
        source: '第十道裂光',
        location: '鍛造鋪',
        speaker: { name: '鍛造師', avatar: '⚒️' },
        discovery: '裝備強化到極限時，鍛造鋪的爐聲突然低了一拍。鍛造師沒有稱讚你，只把護目鏡戴得更緊。',
        available: '他說 +10 不是終點，只是表示這件東西已經開始懂得反抗。你需要拿傳說裝備再試一次，看看它願不願意繼續活下去。',
        active: '強化一件傳說裝備，讓鍛造師確認極限後的材料反應。',
        completed: '強化火花不是往外炸，而是往裝備內部縮回去。鍛造師安靜了很久，最後說：這東西現在有脾氣了。',
        finished: '超越石被放進你的手裡。鍛造師說它不是獎品，是警告：能跨過極限的東西，也常常比較難照顧。',
        nextLead: '強化一件傳說裝備後，回去找鍛造師。',
        route: 'forge',
        reportTo: { npcId: 'blacksmith', name: '鍛造師', route: 'lobby', label: '回去找鍛造師' },
        objectives: [
            '裝備強化達到極限後，鍛造師要你用傳說裝備測試第十道裂光。'
        ]
    },
    hidden_dungeon_master: {
        arc: '地下與邊境的總結',
        source: '五處回聲歸檔',
        location: '城鎮十字路',
        speaker: { name: '村長', avatar: '🏘️' },
        discovery: '五大副本的紀錄被攤在村長桌上：洞窟的哭聲、叢林的毒霧、遺跡的齒輪、雪峰的寒光、深淵的火。',
        available: '村長說這不是收藏清單。每個副本都是世界裂開後露出的側面，你若能全部走完，城鎮就能知道哪些地方還有路。',
        active: '通關五大副本，把每一處災害的結論帶回城鎮。',
        completed: '五處副本的紀錄被壓在同一本手札裡，厚到書記看了都皺眉。村長卻笑了一下，說至少這次厚度代表活路。',
        finished: '副本征服者徽章被交給你。它不代表你踩平了世界，只代表你願意把每個裂縫都走到能被記下的位置。',
        nextLead: '通關五大副本後，回去找村長歸檔。',
        route: 'adventure',
        reportTo: { npcId: 'village_elder', name: '村長', route: 'lobby', label: '回去找村長' },
        objectives: [
            '通關幽暗洞窟、冰封雪峰、遠古遺跡、迷霧叢林與煉獄深淵，完成副本總紀錄。'
        ]
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
    const baseStory = QuestStoryDatabase[questData?.id] || {};
    const story = {
        ...baseStory,
        ...(getQuestStoryRevision(questData?.id) || {})
    };
    const status = state?.status || 'available';
    const statusText = story[status] || story.available || questData?.dialogue?.start || questData?.description || '';

    return {
        arc: story.arc || getFallbackArc(questData),
        source: story.source || '任務紀錄',
        location: story.location || getFallbackLocation(questData),
        speaker: story.speaker || getFallbackSpeaker(questData),
        discovery: story.discovery || questData?.description || '',
        current: statusText,
        available: story.available || questData?.description || '',
        active: story.active || '',
        completed: story.completed || questData?.dialogue?.complete || '',
        finished: story.finished || '',
        nextLead: story.nextLead || getFallbackNextLead(questData),
        route: story.route || null,
        reportTo: story.reportTo || getFallbackReportTo(questData),
        objectives: Array.isArray(story.objectives) ? story.objectives : null,
        triggerGate: story.triggerGate || questData?.trigger || null,
        characterProfile: story.characterProfile || null,
        narrativeMeta: getSideStoryNarrativeMeta(questData?.id)
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
