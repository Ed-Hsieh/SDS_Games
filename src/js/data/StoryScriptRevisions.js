/**
 * StoryScriptRevisions.js
 * Focused script rewrites that sit above legacy quest/dialogue data.
 * Keep these entries small and actor-driven: they are the first pass of the
 * character-voice layer, not a replacement for quest logic.
 */

export const DialogueScriptRevisions = {
    village_elder: {
        elder_first_warning: {
            voiceStage: 'opening',
            actorNote: '村長先給安全規則，再把玩家推向書記；語氣像疲憊的管理者，不像系統教學。',
            narrativeTitle: '村長的第一條繩結',
            narrativeSummary: '你第一次與村長正式談話。他沒有把冒險說得很浪漫，只把順序講清楚：先找書記學會記錄，再出南門確認路線，最後活著回來回報。',
            lines: [
                { speaker: 'npc', text: '新來的冒險者？好。城鎮現在缺人，尤其缺那種願意先聽完話、再把自己丟進草叢的人。' },
                { speaker: 'npc', text: '先去找書記。他會教你怎麼把聽聞寫成能追的線索。別小看這件事，很多人第一天不是輸給怪物，是輸給「我大概知道路」。' },
                { speaker: 'npc', text: '弄清楚之後，到南門外近郊走一圈，確認三條還能通行的路。回來跟我說，不要急著往深處跑。英雄故事通常不會記錄第一天就摔進溝裡的人。' }
            ]
        },
        elder_main_001_active: {
            voiceStage: 'opening',
            narrativeSummary: '村長看得出你還沒去找書記。他沒有催促得很大聲，只把「先學會記錄」重新放回你面前。',
            lines: [
                { speaker: 'npc', text: '你還在廣場繞圈。很好，至少代表你還沒迷路。' },
                { speaker: 'npc', text: '先找書記。聽聞寫對了，再往草叢裡衝，這樣比較不像把自己寄給溝渠。' }
            ]
        },
        elder_main_001_report: {
            voiceStage: 'opening',
            narrativeTitle: '南門路線回報',
            narrativeSummary: '你把南門外近郊的路線交給村長。村長記下可通行道路，也第一次把你當成能被託付的人，而不是剛來的路人。',
            lines: [
                { speaker: 'npc', text: '你回來了。靴子上有南門外的濕土，袖口還沾著草籽。看來不是在廣場繞三圈假裝冒險。很好。' },
                { speaker: 'npc', text: '這三條路我會讓守衛重新標上去。接下來要確認的，就不是路能不能走，而是什麼東西開始靠近路了。' },
                { speaker: 'npc', text: '去找書記。他把城外聽聞整理成線索簿，哪裡有異常，你看那本就不會像在森林裡猜謎。' }
            ]
        }
    },
    town_scholar: {
        scholar_slime_request: {
            voiceStage: 'cataloguer',
            narrativeTitle: '書記打開第一頁',
            narrativeSummary: '書記替你打開旅人手札的第一頁。他不是要你背任務清單，而是教你把村民的聽聞、地點和時間排成可追蹤的紀錄。',
            lines: [
                { speaker: 'npc', text: '村長讓你來看旅人手札？很好，終於有人願意把「聽說」變成「可追蹤」。' },
                { speaker: 'npc', text: '我會依照你發現的順序留下紀錄，不會預先把未知線索寫滿。那樣很像作弊，也很像我以前的上司。' },
                { speaker: 'npc', text: '第一頁先開給南門外近郊。你確認三處路線後再回報，手札會把能通行的方向留下來。' }
            ]
        },
        scholar_main_002_available: {
            voiceStage: 'cataloguer',
            narrativeTitle: '農田邊的黏液紀錄',
            narrativeSummary: '書記把農田附近的史萊姆增生列成第一個可驗證症狀。這不是單純打怪，而是確認地脈異常是否正從土裡往外滲。',
            lines: [
                { speaker: 'npc', text: '村長把南門外的路線記回來了？很好，現在那些「聽說」終於可以排成順序。' },
                { speaker: 'npc', text: '最近農田邊史萊姆變多，不是因為牠們忽然熱愛農業。牠們靠近的方向很一致，像被什麼東西從地底推上來。' },
                { speaker: 'npc', text: '請你消滅五隻，順便記下牠們從哪一側靠近農田。數量是目標，方向才是線索。' }
            ]
        },
        scholar_first_leyline: {
            voiceStage: 'cataloguer',
            narrativeSummary: '書記用自己也不太安心的方式解釋地脈：它不是河，而像全大陸共用的繩結；北方一拉，石階鎮這邊也會斷出聲音。',
            lines: [
                { speaker: 'npc', text: '地脈不是河流，比較像全大陸共用的一團爛繩結。現在有人從北方猛拉，南邊自然會一起發出很不禮貌的聲音。' },
                { speaker: 'npc', text: '所以我們要記錄的不是「哪裡有怪物」而已，而是牠們為什麼在這個時間、這個方向出現。順序會說話，只是通常說得很小聲。' }
            ]
        },
        scholar_last_index_offer: {
            voiceStage: 'archivist',
            narrativeSummary: '魔王現身後，書記不再只整理怪物紀錄。他開始替活人編索引，因為終局最可怕的不是死亡，而是所有名字被壓成同一層灰。',
            lines: [
                { speaker: 'npc', text: '我以前以為，只要把怪物、地點、線索排清楚，世界就會比較像可以理解的東西。現在看來，我有點樂觀。' },
                { speaker: 'npc', text: '深淵黑印會讓紙頁上的名字散開。聽起來像書記的噩夢，實際上更糟，因為那些名字都還活著，或者曾經活著。' },
                { speaker: 'npc', text: '帶回黑印碎片和封皮。我想把活人的索引重新裝訂好。這不是漂亮文書，這是我們還沒把人交給末日的證明。' }
            ]
        }
    },
    blacksmith: {
        blacksmith_first_note: {
            voiceStage: 'working',
            narrativeTitle: '鍛造師看了你的劍',
            narrativeSummary: '鍛造師沒有用歡迎詞迎接你，而是先判斷你的武器還能撐多久。她的關心不柔軟，但很實用。',
            lines: [
                { speaker: 'npc', text: '你那把舊劍還能用，但我說「能用」的標準很寬。拿來烤肉也算能用。' },
                { speaker: 'npc', text: '城外帶回來的礦石、骨片、皮革和圖紙都別亂丟。那些東西會決定你下次是走回來，還是被人拖回來。' },
                { speaker: 'npc', text: '要鍛造就直接用爐子，不用每次先聽我罵你。不過你要是拿假礦石來，我還是會罵，這是工坊傳統。' }
            ]
        },
        blacksmith_main_003_available: {
            voiceStage: 'working',
            narrativeTitle: '斷鉤的切口',
            narrativeSummary: '鍛造師從斷裂誘餌鉤的切口判斷，獵人棧道上的東西不是普通野獸。她要你先把裝備整理好，再把誘餌鉤修成能反設陷阱的形狀。',
            lines: [
                { speaker: 'npc', text: '這枚斷鉤切口太乾淨了。不是狼，不是盜賊，除非盜賊最近開始用鐮刀修指甲。' },
                { speaker: 'npc', text: '我能把它修成誘餌，但你先把裝備強化一次。不是儀式感，是我不想把好鉤子交給一個會被風推倒的人。' },
                { speaker: 'npc', text: '修好後拿去獵人棧道。銀絲喜歡觀察路過的人，那就讓牠觀察一個會反咬的陷阱。' }
            ]
        },
        blacksmith_chimney_offer: {
            voiceStage: 'working',
            narrativeSummary: '鍛造師盯著倒灌白煙的煙囪。她嘴上說是修爐子，實際上是在確認城鎮夜裡還有一盞能穩住的火。',
            lines: [
                { speaker: 'npc', text: '看見那股白煙了嗎？正常煙應該往上，這股像喝醉的幽靈，非要回來跟我聊天。' },
                { speaker: 'npc', text: '帶五塊鐵礦石來，我要重新壓住爐膛。爐火不穩，鍛造鋪就只是很熱的倉庫。' },
                { speaker: 'npc', text: '還有，不要拿長得像鐵礦的石頭糊弄我。我被石頭騙過，經驗很豐富。' }
            ]
        },
        blacksmith_neelu_blueprint_offer: {
            voiceStage: 'remembering-neelu',
            narrativeSummary: '鍛造師認出殘缺圖紙邊角的名字：妮露。她仍然用粗話包住情緒，但這次爐火旁多了一個沒回來的人。',
            lines: [
                { speaker: 'npc', text: '這不是普通圖紙。邊角這個名字是妮露，我以前的學徒。她字很小，脾氣很大，敲錯一次鐵會氣自己三天。' },
                { speaker: 'npc', text: '缺口不是被燒掉的，是有人急著把比例撕走。帶鐵礦石和暗鋼回來，我要知道她最後到底在算什麼。' },
                { speaker: 'npc', text: '別用那種表情看我。我只是要修圖紙。順便把一個人的名字從灰裡撿出來。' }
            ]
        }
    },
    herbalist: {
        herbalist_bottles_offer: {
            voiceStage: 'caretaker',
            narrativeTitle: '藥師的空瓶',
            narrativeSummary: '蓮娜把被凝膠腐蝕的空瓶排在桌上。她不是在找生意，而是在確認農田邊的甜味黏液是否代表地脈異常正在滲出。',
            lines: [
                { speaker: 'npc', text: '你清掉史萊姆了？很好。現在我要說一件更噁心的事：牠們的凝膠味道變甜了。' },
                { speaker: 'npc', text: '別露出那個表情，我沒有嘗。藥師靠鼻子活著，雖然這份工作有時很不公平。' },
                { speaker: 'npc', text: '請帶五份凝膠樣本回來，瓶口朝上。我要確認這是普通變質，還是地脈把什麼東西推進農田。' }
            ]
        },
        herbalist_slime_hint: {
            voiceStage: 'caretaker',
            narrativeSummary: '蓮娜判斷史萊姆不是隨機靠近農田。她把異常說得很輕，卻讓你知道藥棚已經開始替下一批傷者做準備。',
            lines: [
                { speaker: 'npc', text: '史萊姆靠近農田不是因為牠們忽然熱愛農業。土裡的魔力味道變了。' },
                { speaker: 'npc', text: '如果凝膠變甜只是開始，下一個受影響的可能就是水、草藥，或者某個堅持「我沒事」的倒霉守衛。' }
            ]
        },
        herbalist_herb_basket_offer: {
            voiceStage: 'thorn-reader',
            narrativeSummary: '一只空採藥籃自己回到市集邊棚，提把上綁著荊棘。蓮娜不把它當怪談，而是把它當成某種交易規則正在靠近城鎮。',
            lines: [
                { speaker: 'npc', text: '這只籃子昨天自己回來了。別問我籃子怎麼走路，我也很想知道。' },
                { speaker: 'npc', text: '提把上的荊棘不是野生纏上去的，太整齊了。像簽名，也像價格標籤。' },
                { speaker: 'npc', text: '去毒霧林地確認。不要急著碰那些漂亮植物，漂亮到不合理的東西通常不是給人欣賞的。' }
            ]
        },
        herbalist_last_soup_offer: {
            voiceStage: 'soup-kitchen',
            narrativeSummary: '深淵裂口開啟後，蓮娜開始替避難者廚房張羅食材。藥水能救傷口，熱湯則讓人撐到明天還願意醒來。',
            lines: [
                { speaker: 'npc', text: '避難者越來越多。藥水能包傷口，但肚子空著的人很快會先吵起來。' },
                { speaker: 'npc', text: '帶肉和火焰精華回來。世界快燒起來的時候，一鍋湯聽起來不史詩，但它能讓人撐到明天。' },
                { speaker: 'npc', text: '如果火焰精華讓湯變辣，我會把責任推給你。這也是醫療倫理的一部分。' }
            ]
        }
    },
    street_beggar: {
        beggar_first_talk: {
            voiceStage: 'watcher',
            narrativeTitle: '巷口低語',
            narrativeSummary: '巷口流浪者像在閒聊，卻一直看著你的口袋、靴底和眼神。你離開時，感覺暗巷裡有人把你的名字放進了另一份清單。',
            lines: [
                { speaker: 'npc', text: '口袋空了，人才會看見路邊真正有用的東西。你現在口袋還不夠空，但眼神差不多了。' },
                { speaker: 'npc', text: '別只看地圖上的路。真正麻煩的地方，通常是大家都假裝沒看到的角落。' },
                { speaker: 'npc', text: '你要是撿到古代錢幣，別急著拿去買麵包。麵包會吃完，門可不是每天都願意開。' }
            ]
        },
        beggar_broke_wisdom: {
            voiceStage: 'watcher',
            narrativeSummary: '你身無分文時回到暗巷。巷口流浪者沒有嘲笑你，只把真正窮過的人才懂的眼力塞進你的手札。',
            lines: [
                { speaker: 'npc', text: '現在才像話。口袋空到連灰塵都搬家了，眼睛反而開始能看見東西。' },
                { speaker: 'npc', text: '有錢人看商店，沒錢人看縫隙。縫隙裡有掉下來的麵包屑，也有被人故意藏起來的路。' },
                { speaker: 'npc', text: '拿去，這不是施捨，是經驗。你以後真有錢了再假裝不記得我，我會很受傷，至少表面上會。' }
            ]
        },
        beggar_secret_shop: {
            voiceStage: 'broker',
            narrativeSummary: '暗巷的門已經開了。巷口流浪者沒有阻止你，只提醒你：會收古代錢幣的人，通常也會收更麻煩的代價。',
            lines: [
                { speaker: 'npc', text: '暗巷的門開了？那就記住，會收古代錢幣的人，通常也會收你不想付的東西。' },
                { speaker: 'npc', text: '進去時少說「我只是看看」。那句話在黑市裡的意思通常是「我準備被坑」。' }
            ]
        },
        beggar_casino_false_odds_offer: {
            voiceStage: 'broker',
            narrativeSummary: '巷口流浪者把賭場帳房瑪洛的勝率表交給你。這不是娛樂，而是有人把輸贏排成了灰燼男爵的黑市暗號。',
            lines: [
                { speaker: 'npc', text: '賭場帳房瑪洛算出一件很不浪漫的事：最近的勝率太整齊了。運氣如果這麼守規矩，早就該被王國徵稅。' },
                { speaker: 'npc', text: '去玩幾局，老虎機和骰子都要。別急著贏大錢，我們要看的不是你多幸運，是有人把幸運寫成了貨號。' },
                { speaker: 'npc', text: '你問為什麼是你？因為你看起來像會輸，也像會記得自己怎麼輸。這在賭場裡很稀有。' }
            ]
        }
    }
};

export const QuestStoryRevisions = {
    main_001: {
        characterProfile: 'village_elder',
        discovery: '村長沒有把你當成傳說裡的英雄。他先把順序交代清楚：見書記、學會記錄、確認南門路線，最後活著回來。',
        available: '城鎮缺人手，但村長更缺能把話聽完的人。第一步不是衝進森林，而是先讓書記替你打開旅人手札。',
        active: '你已經接下村長的第一個安排。先找書記，再去南門外近郊確認三處可通行路線；這是城鎮重新看見外面世界的第一步。',
        completed: '南門外三條路線被你確認。村長會讓守衛重新標記道路，而書記也能把下一批聽聞排進手札。',
        finished: '城鎮重新有了第一份外圍路線紀錄。你不再只是路過的人，村長開始把「下一步」交到你手上。',
        nextLead: '村長讓你去找書記，確認農田邊史萊姆增生的聽聞。'
    },
    main_002: {
        characterProfile: 'town_scholar',
        discovery: '書記把村民口中的「史萊姆變多」改寫成可驗證紀錄：數量、方向、農田位置，缺一個就只能算傳聞。',
        available: '書記開了旅人手札的第一頁。農田邊的史萊姆不是普通麻煩，而是地脈異常浮出地表前最容易觀察的症狀。',
        active: '消滅五隻史萊姆，並記住牠們靠近農田的方向。書記要的是線索，不只是戰果。',
        completed: '你帶回史萊姆增生的紀錄。書記把時間和方位排在一起，發現牠們像是被同一股地底壓力推向農田。',
        finished: '第一份怪物紀錄完成。旅人手札開始像一本真正的調查簿，而不是一張空白清單。',
        nextLead: '書記建議你把異常樣本交給蓮娜，她能從凝膠味道判斷污染是否擴散。'
    },
    main_003: {
        characterProfile: 'blacksmith',
        discovery: '斷裂誘餌鉤被放上鍛造桌後，鍛造師只看一眼就知道：獵人棧道上的切口不像普通野獸。',
        available: '鍛造師能修好誘餌鉤，但她要求你先完成一次裝備強化。不是儀式，是她不想讓你拿著破爛去餵銀絲。',
        active: '整理裝備，修復誘餌鉤，再回到獵人棧道。鍛造師把關心說得像罵人，但鉤子的形狀已經替你留了退路。',
        completed: '誘餌鉤被修成能反設陷阱的形狀。鍛造師把它交給你時沒有祝福，只說了一句：別浪費好鐵。',
        finished: '銀絲伏道不再只是未知危險。你有了能主動觸發伏獵者的誘餌，也有了第一條由裝備準備推進的首領線。',
        nextLead: '帶著銀絲誘餌回到獵人棧道，尋找能設下反陷阱的位置。'
    },
    commission_blacksmith_chimney: {
        characterProfile: 'blacksmith',
        discovery: '鍛造師的煙囪開始倒灌白煙。她說這只是爐膛問題，但你聽得出來：爐火穩不穩，會影響整座城鎮夜裡還有沒有一盞醒著的燈。',
        active: '帶回五塊鐵礦石。鍛造師要重新壓住爐膛，也順便把鍛造系統真正打開。',
        completed: '鐵礦石送回後，白煙終於往上升。鍛造鋪不再只是場景，而是城鎮抵抗外界異常的火口。',
        finished: '爐火穩定，鍛造功能正式回到城鎮流程裡。鍛造師嘴上嫌麻煩，爐邊卻多留了一個給你的工作位置。'
    },
    commission_apothecary_bottles: {
        characterProfile: 'herbalist',
        discovery: '蓮娜發現史萊姆凝膠有不自然的甜味。她不是想補貨，而是想確認農田的污染是否已經滲進草藥與水源。',
        active: '帶回五份史萊姆凝膠樣本，瓶口朝上。蓮娜不想再洗一次整個藥棚。',
        completed: '蓮娜確認凝膠甜味異常，但尚未失控。基礎藥水重新上架，下一個受傷的人不用等空瓶晾乾。',
        finished: '藥棚重新運作，城鎮的補給線開始有了第一個穩定節點。'
    },
    hidden_broke: {
        characterProfile: 'street_beggar',
        discovery: '當你身無分文回到暗巷，巷口流浪者沒有嘲笑你。他知道口袋空掉後，人反而會看見平常忽略的縫隙。',
        active: '這不是正式委託，而是一種生存眼力。去看看那些不被公告欄承認的角落。',
        completed: '你學會從角落看路。巷口流浪者把這叫經驗，不叫施捨。',
        finished: '旅人手札多了一種灰色觀察法：不是所有線索都會站在地圖中央等你。'
    }
};

export const ChapterScaleDialogueRevisions = {
    village_elder: {
        elder_ash_ledger_offer: {
            voiceStage: 'burdened',
            narrativeTitle: '名單不能再躲進抽屜',
            narrativeSummary: '灰燼帳冊把失蹤工匠連到黑曜石地宮。村長不再把名單藏起來，因為家屬其實早就知道，只是在等有人願意把答案說出口。',
            lines: [
                { speaker: 'npc', text: '這份名單我收在抽屜裡很久。每天拿出來一次，再放回去一次，像這樣就能讓人晚一點死心。' },
                { speaker: 'npc', text: '灰燼帳冊把他們連到黑曜石地宮。男爵不是徵工，是把人塞進他自己的末日地窖。' },
                { speaker: 'npc', text: '帶回影徽。我要有足夠證據把名字釘上公告欄，不是為了宣布壞消息，是為了讓等待有個終點。' }
            ]
        },
        elder_northern_letter_offer: {
            voiceStage: 'last-stand',
            narrativeTitle: '北境來信',
            narrativeSummary: '北境終於不只是地圖上的危險方向。信使帶回的家書讓城鎮第一次聽見遠方普通人的生活被龍焰切斷。',
            lines: [
                { speaker: 'npc', text: '信使倒在城門口時，抓著這封信。不是軍令，不是預言，只是一封抱怨豆子煮不軟的家書。' },
                { speaker: 'npc', text: '這比戰報難看。戰報會把人變成數字，家書會讓你知道數字原本會嫌飯難吃。' },
                { speaker: 'npc', text: '去北境路線帶回飛龍鱗。我需要知道他是從哪段熱風裡撐回來，也需要知道還有沒有路能讓其他信回家。' }
            ]
        },
        elder_broken_standard_offer: {
            voiceStage: 'last-stand',
            narrativeTitle: '斷旗手芙蕾',
            narrativeSummary: '芙蕾帶回斷旗，卻拒絕被稱作英雄。這條支線把第三章的戰場壓力收回城門：撤退不是潰敗，點名也不是形式。',
            lines: [
                { speaker: 'npc', text: '送旗的人叫芙蕾。她手抖得像剛從冰河裡撈出來，嘴上卻一直說她只是照規矩撤退。' },
                { speaker: 'npc', text: '深淵士兵把角飾掛在旗杆上，想讓撤退變成笑話。人心有時候比城牆薄，這招很低劣，也很有效。' },
                { speaker: 'npc', text: '把角飾奪回來。那面旗要重新掛上去，不是為了好看，是為了讓還在路上的人知道城門仍在等。' }
            ]
        }
    },
    town_scholar: {
        scholar_chapter2_opening: {
            voiceStage: 'witness',
            narrativeTitle: '第二章不是一條線',
            narrativeSummary: '書記把第二章整理成多條同時展開的災害鏈：荊棘交易、沉鐘回聲、亡靈恐慌與男爵地宮。它們不必同時完成，但都會把地脈崩毀推向更完整的輪廓。',
            lines: [
                { speaker: 'npc', text: '霧碑丘陵會比邊境難整理。第一章像一條傷口，第二章像有人把整張繃帶撕開，還順手把標籤撕掉。' },
                { speaker: 'npc', text: '草藥、潮聲、亡靈、走私帳冊會從不同方向冒出來。不要急著把它們塞成同一個答案，先讓每個人的話都有地方落筆。' },
                { speaker: 'npc', text: '我會把手札分成幾條線。你只要記得：第二章真正可怕的不是怪物變多，是所有人開始用自己的方式應對災難。' }
            ]
        },
        scholar_drowned_bell_offer: {
            voiceStage: 'witness',
            narrativeTitle: '失眠不是病名',
            narrativeSummary: '沉鐘聲沿著地脈回到城鎮。書記第一次把居民的失眠當成世界異常，而不是可笑傳聞。',
            lines: [
                { speaker: 'npc', text: '有人說他每晚聽見海底鐘聲。村民叫他失眠，我本來也想這樣寫，直到他把節奏敲在桌上。' },
                { speaker: 'npc', text: '那節奏和沉鐘海岸的紀錄對得太整齊。失眠通常不會這麼有禮貌地押拍。' },
                { speaker: 'npc', text: '去沉鐘異響附近帶回回聲殘留。我要確認那不是他的夢，而是祭壇正在把痛苦推回城鎮。' }
            ]
        },
        scholar_grave_bookmark_offer: {
            voiceStage: 'witness',
            narrativeTitle: '怪物曾經有名字',
            narrativeSummary: '巫妖支線讓書記面對自己的恐懼：如果紀錄只剩分類，那活人與怪物之間的界線會被他親手擦掉。',
            lines: [
                { speaker: 'npc', text: '我找到一張書籤。上面寫著：若我還在尋找法杖，請不要把我只記成怪物。' },
                { speaker: 'npc', text: '我知道巫妖仍然危險。這不是替牠開脫，只是如果我把所有恐懼都寫成分類，那我和遺跡核心也差不多了。' },
                { speaker: 'npc', text: '帶回骨片與骷髏兵痕跡。我要找回那位學者的名字，至少讓手札知道自己正在面對誰。' }
            ]
        },
        scholar_last_index_offer: {
            voiceStage: 'archivist',
            narrativeTitle: '最後索引',
            narrativeSummary: '阿薩謝爾現身後，書記不再只是整理怪物與地點。他開始替活人編索引，因為終局最可怕的是所有名字被壓成同一層灰。',
            lines: [
                { speaker: 'npc', text: '我以前以為只要把怪物、地點、線索排清楚，世界就會比較像可以理解的東西。現在看來，我有點樂觀。' },
                { speaker: 'npc', text: '我要先替活人編索引。不是墓誌銘，是索引。差別很重要，請你假裝同意。' },
                { speaker: 'npc', text: '深淵將領搶走了封皮，黑印也滲進紙頁。幫我取回來。我不想讓明天醒來的人連誰少了都不知道。' }
            ]
        }
    },
    blacksmith: {
        blacksmith_neelu_blueprint_offer: {
            voiceStage: 'remembering-neelu',
            narrativeTitle: '妮露的邊角字',
            narrativeSummary: '鍛造師認出殘圖上的小字。這不是單純解鎖圖紙，而是失蹤學徒留下的研究開始牽回鍛造鋪。',
            lines: [
                { speaker: 'npc', text: '這不是普通圖紙。邊角這個名字是妮露，我以前的學徒。字很小，脾氣很大，敲錯一次鐵會氣自己三天。' },
                { speaker: 'npc', text: '她說丘陵礦材能吃下地脈震動，我當時叫她別把石頭想得比人聰明。看來石頭至少比我有耐心。' },
                { speaker: 'npc', text: '帶回鐵礦石和暗鋼。我想知道這是圖紙、求救，還是她留給我的道歉信。' }
            ]
        },
        blacksmith_mithril_route_offer: {
            voiceStage: 'war-forge',
            narrativeTitle: '秘銀不是傳說',
            narrativeSummary: '第三章的鍛造支線把妮露研究收束到終局裝備路線。鍛造師不再只是修東西，而是在替城鎮安排反擊順序。',
            lines: [
                { speaker: 'npc', text: '妮露的圖紙和奧倫筆記對上了。秘銀不是傳說，是一堆很麻煩、很貴、很會挑時候出現的金屬。' },
                { speaker: 'npc', text: '黑焰會讓普通鋼材像餅乾一樣脆。別問我怎麼知道，我剛剛心情不好，拿樣本試了。' },
                { speaker: 'npc', text: '帶回秘銀礦和熔岩鱗。這不是強化菜單，這是我們還想打到終局的工序表。' }
            ]
        }
    },
    herbalist: {
        herbalist_herb_basket_offer: {
            voiceStage: 'thorn-reader',
            narrativeTitle: '採藥籃不會走路',
            narrativeSummary: '荊棘女巫線透過一只自己回來的採藥籃靠近城鎮。蓮娜不把它當怪談，而是當成失蹤者最後留下的秩序。',
            lines: [
                { speaker: 'npc', text: '這只籃子昨天自己回來了。別問我籃子怎麼走路，我也很想知道。' },
                { speaker: 'npc', text: '提把上的荊棘切得太整齊，像有人故意打了一個漂亮的結。漂亮到讓人想把它丟進火裡。' },
                { speaker: 'npc', text: '去毒霧林地帶回毒腺樣本，清掉附近毒蛛。我要知道那片霧是不是已經把女巫的標價吹到城鎮門口。' }
            ]
        },
        herbalist_last_soup_offer: {
            voiceStage: 'soup-kitchen',
            narrativeTitle: '最後一鍋湯',
            narrativeSummary: '第三章不只需要藥水。避難者湧入後，蓮娜把補給、熱湯與傷患視為同一套生存系統。',
            lines: [
                { speaker: 'npc', text: '避難者越來越多。藥水能包傷口，但肚子空著的人很快會先吵起來。' },
                { speaker: 'npc', text: '掌廚說他不懂地脈、古龍或魔王，只懂人餓了會罵人，罵人會讓守衛分心，守衛分心就會死人。很樸素，也很正確。' },
                { speaker: 'npc', text: '帶可食用肉和火焰精華回來，順手清掉補給路線上的深淵士兵。這不是史詩，但今晚有人需要熱湯。' }
            ]
        }
    },
    street_beggar: {
        beggar_casino_false_odds_offer: {
            voiceStage: 'broker',
            narrativeTitle: '假勝率與真帳冊',
            narrativeSummary: '瑪洛發現賭場勝率曲線藏著灰燼男爵的貨號。這條支線讓賭場成為第二章的情報市場，而不是單純花錢娛樂。',
            lines: [
                { speaker: 'npc', text: '瑪洛說骰桌最近輸得太整齊。你聽懂了嗎？沒有？很好，代表你還沒窮到會研究輸法。' },
                { speaker: 'npc', text: '她在勝率表裡看到灰燼男爵的貨號。賭場把走私帳藏進輸贏曲線裡，真有品味，壞得很有會計精神。' },
                { speaker: 'npc', text: '去賭場驗一輪假勝率。你不是去發財，你是去讓帳本露出尾巴。當然，能發財也不用太道德緊張。' }
            ]
        },
        beggar_casino_last_chips_offer: {
            voiceStage: 'witness',
            narrativeTitle: '最後一夜的籌碼',
            narrativeSummary: '終局前夕，瑪洛把賭場籌碼改成避難補給基金。貪婪不會變善良，但可以被迫做一件有用的事。',
            lines: [
                { speaker: 'npc', text: '瑪洛把最後一夜的籌碼改成補給基金。這主意聽起來像慈善，其實更像把賭場的牙拔下來磨成湯匙。' },
                { speaker: 'npc', text: '贏到足夠籌碼，換成乾糧。你看，連貪婪偶爾都能被拴去拉車，只要繩子夠結實。' },
                { speaker: 'npc', text: '別把這事說得太高尚。賭場還是賭場，只是今晚有人會因為它少餓一頓。' }
            ]
        }
    }
};

export const ChapterScaleQuestRevisions = {
    main_007: {
        characterProfile: 'town_scholar',
        discovery: '第一章的線索沒有結束，只是從邊境爬上霧碑丘陵。書記把石碑、草藥、潮聲與亡靈分成四條線，提醒你第二章不是單一路線，而是一整片被扯開的地脈傷口。',
        available: '第二章會比第一章更寬。支線、委託、副本與 BOSS 線會一起打開，但它們都指向同一件事：古龍掠奪核心後，整片大陸開始用不同方式失控。',
        active: '探索霧碑丘陵，擊敗高威脅區怪物，先建立第二章的地圖邏輯。不要急著找最終答案，先把每條災害鏈的起點記清楚。',
        completed: '霧碑丘陵的第一批痕跡被記下。草藥價格、海岸鐘聲、古墓裂口與走私帳冊開始在手札上各自發亮。',
        finished: '第二章正式展開：荊棘女巫、沉鐘神諭、巫妖與灰燼男爵會從不同入口推進，支線則負責讓那些災害落到城鎮裡的人身上。',
        nextLead: '先從霧碑丘陵確認地形與異常，再依手札追查荊棘、沉鐘、古墓與灰燼帳冊四條線。'
    },
    main_008: {
        characterProfile: 'herbalist',
        discovery: '荊棘交換珠不是單純道具，而是一套正在逼近城鎮的交易規則。蓮娜開始意識到，失蹤採藥人與女巫溫室之間隔著的不是距離，是被迫標價的生命。',
        available: '女巫的溫室被掠奪後，她把失去壽命的恐懼轉嫁給村民。追查她不能只找坐標，還要看懂草藥、毒霧與交換珠背後的代價。',
        active: '調查荊棘交易痕跡，推進採藥籃支線，最後直面荊棘女巫。',
        completed: '荊棘女巫倒下後，交易珠裂開。裡面不是單純魔力，而是被她強行保存、也被她親手扭壞的生存本能。',
        finished: '荊棘線讓第二章第一次說清楚：古龍奪走核心後，受害者也可能把痛苦變成新的壓迫。',
        nextLead: '回城找蓮娜，確認採藥籃與荊棘交易是否還有未收束的名字。'
    },
    main_009: {
        characterProfile: 'town_scholar',
        discovery: '沉鐘聲沿著地脈裂縫傳回城鎮。有人失眠，有人以為自己瘋了，書記則把那段節奏與海岸紀錄對上。',
        available: '沉鐘神諭不是在給你謎語。祂失去深海寶珠後，痛苦像潮汐一樣外推，海岸與城鎮都只是被捲進聲波的人。',
        active: '追查潮濕拓片、回聲殘留與守燈人塔維的燈號，最後擊敗沉鐘神諭。',
        completed: '鐘聲停止後，祭壇下方露出被硬生生挖走的核心位置。塔維的燈第一次照向活人，而不是把亡魂引回岸邊。',
        finished: '沉鐘線把第二章的尺度拉到海岸，也把海岸縮回一盞燈。世界觀變大，人的故事不能變小。',
        nextLead: '回去找書記，整理沉鐘節奏與海岸燈號；若塔維支線未完成，先把那盞燈校正。'
    },
    main_010: {
        characterProfile: 'town_scholar',
        discovery: '古墓不是自然裂開。枯魂法杖被奪走後，古代學者的恐慌變成亡靈暴動，朱利安的邊註則讓遺跡線開始露出另一種盲目的秩序。',
        available: '巫妖仍是威脅，但牠不是憑空誕生的怪物。牠曾經有名字，有法杖，也有害怕消散的理由。',
        active: '追查古墓、骷髏軍勢與墓園書籤，找出巫妖藏身的封印缺口。',
        completed: '巫妖被擊敗後，墓道深處留下灰燼帳冊的一角。亡靈暴動把你帶向另一種更清醒、更人為的暴政。',
        finished: '巫妖線收束了「失去核心後的恐慌」，並把故事推向灰燼男爵：不是所有災難都長著怪物的臉。',
        nextLead: '把墓園書籤與朱利安邊註交回書記，再追查灰燼帳冊。'
    },
    main_011: {
        characterProfile: 'village_elder',
        discovery: '灰燼帳冊沒有記錄利潤，只記錄糧食、鐵器、工匠與誰還能被迫工作。村長終於不能再把失蹤名單藏在抽屜裡。',
        available: '灰燼男爵相信世界要完了，所以他選擇先替世界示範暴政。這條線讓第二章從超自然災害收束到人類自己的恐懼。',
        active: '沿著煤印、黑市標籤與工匠刻痕追到黑曜石地宮，擊敗灰燼男爵。',
        completed: '男爵倒下後，地宮鉛牆裂開，黑焰邊境的熱浪灌入。那些被強徵的人名也終於能被貼上公告欄。',
        finished: '第二章收束：守護者、神諭、亡靈與男爵都不是孤立事件。古龍掠奪扯斷地脈，而每個倖存者都用自己的方式回答恐懼。',
        nextLead: '回城整理灰燼帳冊與失蹤名單。北方熱痕已經開始出現在地圖邊緣。'
    },
    main_012: {
        characterProfile: 'village_elder',
        discovery: '各地被奪走的核心像一串燒焦路標，全部指向北方。第三章不再展開更多謎團，而是把前兩章所有缺口收成一條通往龍巢的路。',
        available: '古龍眷屬不需要站出來說明。黑樹皮、深海寶珠、枯魂法杖與各地熱痕已經替牠們畫好罪證。',
        active: '沿著北境熱痕推進，擊退龍族前哨，同時處理北境來信與鍛造終局裝備準備。',
        completed: '北境前哨被擊破，焦黑方尖碑方向變得明確。城鎮第一次真正理解：古龍巢穴不是遠方傳說，而是所有掠奪匯流的地方。',
        finished: '龍巢之路打開。第三章開始把每條支線都推向同一個問題：當終局靠近，城鎮還能記住誰、保住誰、送誰回來？',
        nextLead: '前往焦黑方尖碑前，確認北境來信與秘銀鍛造支線是否已準備好。'
    },
    main_013: {
        characterProfile: 'blacksmith',
        discovery: '古龍巢穴像一座用全大陸核心堆成的爐心。鍛造師看見的不是神話，是一堆被錯誤集中、隨時會炸開的材料。',
        available: '古龍不是為了支配世界才危險。牠只是要睡覺，而牠的床剛好壓在世界命脈上。',
        active: '登上焦黑方尖碑，擊敗古龍。這場戰鬥會讓龍巢魔力外露，也會逼出真正的終局。',
        completed: '古龍倒下後，龍巢魔力外露。勝利沒有帶來安靜，只讓深淵封印聽見了一聲更響的裂縫。',
        finished: '古龍不是終點。牠留下的魔力源讓阿薩謝爾真正看見出口，也讓第三章從屠龍轉為阻止魔王奪巢。',
        nextLead: '回城確認撤退線、補給與索引。龍巢魔力外露後，阿薩謝爾會很快行動。'
    },
    main_014: {
        characterProfile: 'village_elder',
        discovery: '深淵沒有沉默，它只是在等龍巢把足夠多的魔力暴露出來。芙蕾的斷旗、蓮娜的湯鍋與書記的索引都在同一晚變得重要。',
        available: '阿薩謝爾北上不是為了保護人類，也不是為了與古龍合作。他只是聞到更大的力量，而城鎮必須先確定自己撐得到決戰。',
        active: '穿越黑焰邊境，擊退深淵先鋒，並處理斷旗、避難廚房與賭場補給基金等終局支線。',
        completed: '深淵先鋒被擊退後，裂口裡傳來王座拖過石面的聲音。城門上的斷旗、廚房的熱湯與名冊上的名字同時穩住了一小段明天。',
        finished: '決戰入口開啟。接下來不是探索，而是在兩股毀滅力量分食世界前，替凡人把最後的防線綁緊。',
        nextLead: '挑戰阿薩謝爾前，確認斷旗手、最後一鍋湯與書記索引是否完成。'
    },
    main_015: {
        characterProfile: 'town_scholar',
        discovery: '龍巢殘骸成了世界上最大的魔力源，阿薩謝爾的目光越過人類，落在那團光上。終戰不是正邪對決，而是凡人拒絕成為兩個災難之間的燃料。',
        available: '這場戰鬥會收束前三章：被奪走的核心、被迫害的人名、被修起的裝備、被端起的湯碗，全都決定城鎮能否承受勝利後的明天。',
        active: '擊敗魔族將軍，直面魔王阿薩謝爾。這不是為了讓故事漂亮結束，而是為了讓手札還能寫下一頁。',
        completed: '阿薩謝爾倒下後，龍巢魔力開始回流地脈。那些被你完成或錯過的支線，會決定城鎮如何解讀這場勝利。',
        finished: '艾瑟利亞沒有立刻恢復和平，但明天還存在。它可能有名字、帶著傷，或薄得讓人不敢鬆手；至少，它不是空白。',
        nextLead: '回到城鎮，查看旅人手札與城鎮記憶，確認這場勝利留下了什麼。'
    },
    commission_forge_001: {
        characterProfile: {
            cause: '妮露留下的殘圖讓鍛造師不得不面對失蹤學徒，也讓丘陵礦材第一次接進裝備路線。',
            choice: '把殘圖當材料配方處理，或承認那是失蹤者還在說話。',
            mainThread: '第二章裝備路線從災害素材轉向地脈抗性，替後續高威脅區做準備。',
            townState: 'town.blacksmith.neelu_blueprint_named'
        },
        discovery: '殘缺圖紙邊角寫著妮露的名字。鍛造師把它拿得很用力，像只要握緊一點，失蹤的人就不會再遠一點。',
        active: '帶回鐵礦石與暗鋼，驗證妮露的丘陵礦材假說。',
        completed: '材料讓圖紙缺口補上。妮露沒有回來，但她的研究第一次在爐火裡發出聲音。',
        finished: '鍛造鋪多了一份等待歸來的紀錄。裝備路線也從「能打」開始轉向「能承受地脈異常」。'
    },
    commission_forge_002: {
        characterProfile: {
            cause: '妮露圖紙與奧倫筆記對上，秘銀從傳說變成終局前必須整理的工序。',
            choice: '把秘銀當稀有素材炫耀，或把它當成城鎮仍能反擊的證據。',
            mainThread: '第三章鍛造支線把裝備強化直接接到古龍與魔王壓力。',
            townState: 'town.blacksmith.mithril_route_ready'
        },
        discovery: '鍛造師把妮露圖紙與奧倫筆記壓在爐邊。她不再罵圖紙幼稚，只罵秘銀挑時間出現。',
        active: '帶回秘銀礦與熔岩鱗，完成終局裝備工序。',
        completed: '秘銀路線被整理出來。這不是一件神兵，而是一條讓凡人撐到決戰的工序表。',
        finished: '鍛造鋪進入戰時節奏。爐火沒有變溫柔，但它開始替城鎮往北方延伸。'
    },
    commission_coast_lamplighter: {
        characterProfile: {
            cause: '塔維怕黑，卻一輩子替海岸點燈。沉鐘神諭失控後，他怕自己的燈把亡魂引回岸邊。',
            choice: '熄燈讓恐懼安靜，或重新校正燈號讓活人知道岸還在。',
            mainThread: '沉鐘神諭線補上海岸倖存者視角。',
            townState: 'town.coast_refugee_lamp_lit'
        },
        discovery: '塔維的油壺送到書記桌上，壺口還有鹽霧。他說燈不是壞了，是他不確定該不該再點。',
        active: '帶回燈油與潮汐殘留，校正海岸燈號。',
        completed: '燈號重新亮起。塔維仍然怕黑，但那盞燈終於不再只照向亡魂。',
        finished: '海岸紀錄多了一個人的名字。沉鐘線也不再只是祭壇與海嘯，而是一盞被重新點起的燈。'
    },
    commission_casino_001: {
        characterProfile: {
            cause: '瑪洛發現勝率曲線藏著灰燼男爵的貨號，賭場因此成為黑市情報節點。',
            choice: '繼續替賭場記帳，或把謊言的規律交給能追查的人。',
            mainThread: '灰燼男爵線補充城鎮灰色地帶如何流通情報。',
            townState: 'town.casino.false_odds_exposed'
        },
        discovery: '瑪洛把一張勝率表塞進暗巷。那不是求救信，更像一把很薄的刀，刀刃藏在過分整齊的輸贏裡。',
        active: '前往賭場驗證假勝率，找出灰燼男爵貨號藏在哪一段曲線。',
        completed: '假勝率被揭穿。賭場仍然腐敗，但它第一次替城鎮吐出一條有用的黑市線索。',
        finished: '瑪洛把帳本翻到下一頁。她沒有變成好人，只是開始把壞地方的數字往外遞。'
    },
    commission_casino_002: {
        characterProfile: {
            cause: '終局前夕，瑪洛把最後一夜的籌碼轉成避難補給基金。',
            choice: '讓賭場繼續吞人，或強迫貪婪替人拉一次補給車。',
            mainThread: '第三章賭場支線把灰色地帶收束成避難資源。',
            townState: 'town.casino.relief_fund_counted'
        },
        discovery: '瑪洛說賭場今晚照常開燈，但帳本最後一欄改成避難補給。她說這不是善良，只是遲來的短差修正。',
        active: '在賭場累計盈利 1000 枚籌碼，換成避難補給。',
        completed: '籌碼被換成乾糧。賭場仍然有笑聲與謊話，但今晚有人會因為那堆謊話少餓一頓。',
        finished: '最後一夜的籌碼收進城鎮記憶。貪婪沒有被救贖，只是短暫被迫做對一件事。'
    },
    commission_broken_standard: {
        characterProfile: {
            cause: '芙蕾帶回斷旗，卻把太多沒回來的人名背在身上。',
            choice: '把撤退當成恥辱藏起來，或把斷旗掛上城門承認倖存也是戰果。',
            mainThread: '第三章補上前線撤退與城鎮士氣。',
            townState: 'town.gate.broken_standard_raised'
        },
        discovery: '芙蕾帶回斷旗，手指握到發紫。她說自己不是英雄，只是最後一個還抓著旗的人。',
        active: '擊退深淵士兵，奪回掛在旗杆上的惡魔角飾。',
        completed: '斷旗重新掛上城門。它不漂亮，但比漂亮更重要：它讓撤退線看起來仍有人指揮。',
        finished: '芙蕾把一份點名冊交給村長。她不想被讚美，只想知道還有誰沒到。'
    },
    commission_broken_standard_002: {
        characterProfile: {
            cause: '芙蕾的點名冊讓撤退從抽象戰報變成一排缺席的名字。',
            choice: '讓缺席留在混亂裡，或一個一個喊回來。',
            mainThread: '終局前的人名收束，影響城鎮結局質感。',
            townState: 'town.gate.retreat_names_called'
        },
        discovery: '點名冊被汗水泡皺。芙蕾說名冊不重，但村長接過去時像接住一面更重的旗。',
        active: '確認撤退名單與路線殘留，找回仍可能生還的人。',
        completed: '撤退名單被完整點過。城門內側多了一張尋人榜，名字不再只在芙蕾手裡發抖。',
        finished: '城門開始按名等待歸來者。這不會讓戰爭變小，但會讓被戰爭吞掉的人少一點沉默。'
    },
    commission_scholar_last_index: {
        characterProfile: {
            cause: '書記害怕終局後連活人名單都排不好，所以先替活人編索引。',
            choice: '替未來寫墓誌銘，或固執地替明天保留空白頁。',
            mainThread: '第三章把世界末日前的記憶保存起來。',
            townState: 'town.scholar.last_index_bound'
        },
        discovery: '書記拿出空白封皮，平靜得反常。他說這本不是墓誌銘，是索引，差別很重要。',
        active: '擊退深淵將領，取回封皮並用深淵碎片封住黑印。',
        completed: '最後索引被重新裝訂。書記放下筆時手還在抖，字跡卻比平常更穩。',
        finished: '活人的名字被排好，空白頁留給明天。這本冊子不能殺死魔王，但能讓勝利後的人知道誰仍在。'
    }
};

export function getDialogueScriptRevision(npcId, dialogueId) {
    return ChapterScaleDialogueRevisions[npcId]?.[dialogueId]
        || DialogueScriptRevisions[npcId]?.[dialogueId]
        || null;
}

export function applyDialogueScriptRevision(npcId, dialogue = {}) {
    const revision = getDialogueScriptRevision(npcId, dialogue.id);
    if (!revision) return dialogue;
    return {
        ...dialogue,
        ...revision,
        lines: Array.isArray(revision.lines) ? revision.lines : dialogue.lines
    };
}

export function getQuestStoryRevision(questId) {
    const baseRevision = QuestStoryRevisions[questId] || null;
    const chapterRevision = ChapterScaleQuestRevisions[questId] || null;
    if (!baseRevision && !chapterRevision) return null;
    return {
        ...(baseRevision || {}),
        ...(chapterRevision || {})
    };
}
