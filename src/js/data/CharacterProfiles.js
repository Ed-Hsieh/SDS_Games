/**
 * CharacterProfiles.js
 * Shared character bible for portraits, dialogue voice, and story-stage changes.
 */

export const CharacterProfileDatabase = {
    village_elder: {
        id: 'village_elder',
        name: '村長',
        title: '城鎮十字路的管理者',
        portrait: 'src/assets/images/art/characters/portraits/village_elder.webp',
        imageAnchor: '灰白髮、舊披肩、手裡總有地圖或封蠟文件，像把整座城鎮的疲憊都收在袖口裡。',
        core: '穩重、務實、疲倦但不冷漠。知道自己無法親自出城，所以把每一句委託都說得像在替玩家繫緊繩結。',
        wound: '年輕時錯估過一次災情，失去過守衛與獵人。現在他不浪漫化冒險，也不輕易把人送去送死。',
        storyFunction: '把玩家從「路過冒險者」拉進城鎮責任，負責主線節奏、城鎮狀態與人的名字。',
        voice: {
            tone: '穩、短促、帶一點乾冷幽默',
            rhythm: '先講清目標，再補一句人味或警告。',
            vocabulary: ['路線', '回報', '名單', '守衛', '城鎮', '活著回來'],
            humor: '像長輩的冷吐槽，不賣萌，不裝神秘。',
            avoid: ['空泛預言', '熱血口號', '過度解釋世界觀'],
            lineRule: '每段對話至少有一個明確行動，並讓玩家感覺他記得城裡每個人。'
        },
        stages: [
            { id: 'opening', label: '初遇', mood: '克制而審慎', untilFlag: 'town.south_gate.guard_route_ready' },
            { id: 'burdened', label: '城鎮承壓', fromFlag: 'town.notice_board.missing_workers_named', mood: '把私人的愧疚藏在行政語氣裡' },
            { id: 'last-stand', label: '終局前夕', fromFlag: 'town.gate.broken_standard_raised', mood: '語句更短，開始把人名放在任務前面' }
        ],
        reportClosings: [
            '我會把這件事記下。不是為了好看，是為了下一個出城的人少走一段錯路。',
            '好，這段先歸檔。你可以休一下，但別休到城外的麻煩學會敲門。',
            '我知道了。接下來我會通知守衛，你去看看手札裡還有哪條線沒有收緊。'
        ]
    },
    town_scholar: {
        id: 'town_scholar',
        name: '書記',
        title: '旅人手札與百科整理者',
        portrait: 'src/assets/images/art/characters/portraits/town_scholar.webp',
        imageAnchor: '年輕、蒼白、眼鏡、墨漬手指，身上掛滿索引紙條與臨時書籤。',
        core: '神經質、聰明、在混亂中迷信秩序。害怕世界沒有邏輯，所以努力把怪物、地點、時間排成表。',
        wound: '他不是戰士，無法站上前線；他用紀錄證明自己也能讓人活下去。',
        storyFunction: '把玩家發現的碎片變成可追蹤線索，負責百科、世界因果與章節銜接。',
        voice: {
            tone: '緊張、細節控、偶爾自嘲',
            rhythm: '先分類，再指出異常，最後把玩家推向下一個可驗證地點。',
            vocabulary: ['順序', '比對', '方位', '紀錄', '樣本', '索引'],
            humor: '學者式小抱怨，例如討厭黏液碰到書頁。',
            avoid: ['神棍式斷言', '只講任務數字', '把玩家當工具人'],
            lineRule: '他不說「去打怪」，而說「把現象補成能比對的紀錄」。'
        },
        stages: [
            { id: 'cataloguer', label: '整理聽聞', mood: '急著把傳聞排成秩序' },
            { id: 'witness', label: '見證地脈崩壞', fromFlag: 'town.scholar.records_drowned_bell_rhythm', mood: '開始承認紀錄不只關於怪物，也關於人' },
            { id: 'archivist', label: '終局索引', fromFlag: 'town.scholar.last_index_bound', mood: '把名字當作最後防線' }
        ],
        reportClosings: [
            '我會把時間、方向和你身上的可疑氣味分開記錄。最後一項盡量寫得含蓄。',
            '這條線索能和前面的紀錄接上。很好，世界暫時還願意被理解。',
            '我先歸檔。請不要把樣本放在書上，上次那本百科到現在還會自己翻頁。'
        ]
    },
    blacksmith: {
        id: 'blacksmith',
        name: '鍛造師',
        title: '鍛造鋪主人',
        portrait: 'src/assets/images/art/characters/portraits/blacksmith.webp',
        imageAnchor: '中年南亞壯碩女性、煤灰、皮圍裙、鐵鎚，火光把輪廓照得很硬。',
        core: '直白、暴躁、手比嘴誠實。她把關心包在嘲諷裡，因為太溫柔的話會被爐火燒壞。',
        wound: '失蹤學徒妮露讓她無法再把圖紙當成單純商品；每張圖紙都像某個人沒說完的話。',
        storyFunction: '把素材、圖紙、裝備路線與主線壓力接起來，讓鍛造不是菜單，而是抵抗的準備。',
        voice: {
            tone: '粗硬、直接、帶火星的幽默',
            rhythm: '先罵裝備或材料，再精準說明問題，最後給出非常實際的要求。',
            vocabulary: ['爐火', '切口', '成色', '比例', '強化', '別拿破爛糊弄我'],
            humor: '拿武器、石頭、冒險者的魯莽開刀。',
            avoid: ['詩意過量', '神秘兮兮', '太像商店店員'],
            lineRule: '她講話永遠要讓玩家知道裝備為什麼重要。'
        },
        stages: [
            { id: 'working', label: '爐火未穩', mood: '不耐煩但願意幫忙' },
            { id: 'remembering-neelu', label: '妮露圖紙', fromFlag: 'town.blacksmith.neelu_blueprint_named', mood: '嘲諷變少，句子變短' },
            { id: 'war-forge', label: '終局工序', fromFlag: 'town.blacksmith.mithril_route_ready', mood: '像在排一場戰爭的工序' }
        ],
        reportClosings: [
            '東西放那邊。我會處理，你負責別在它完成前死掉。',
            '成色能用。比你的自我保護意識可靠，這已經很難得了。',
            '我會把比例記下。下次帶材料來，別帶藉口。'
        ]
    },
    old_miner_bran: {
        id: 'old_miner_bran',
        name: '老礦工布蘭',
        title: '南脈礦路倖存者',
        portrait: 'src/assets/images/art/characters/portraits/old_miner_bran.webp',
        imageAnchor: '灰塵卡在鬍鬚裡，肩膀總像還背著一袋濕礦。說話前會先看地面，像在確認腳下還能不能承重。',
        core: '布蘭記得舊礦路的聲音，也記得哪些人沒有從那條路回來。他不是勇敢，只是還沒找到能放心閉嘴的人。',
        wound: '一次塌方奪走了他的工友，也讓他再也不相信鎮上的漂亮承諾。',
        storyFunction: '連接鐵匠、礦路、材料來源與舊災難的證人，適合承載早中期的鍛造與路線真相。',
        voice: {
            tone: '乾硬、少話、帶砂礫感。',
            rhythm: '短句多，偶爾冒出一段很長的回憶，說完又沉下去。',
            vocabulary: ['礦脈', '塌聲', '濕土', '舊路', '別敲那面牆'],
            humor: '黑色幽默，只在事情糟到不能再糟時出現。',
            avoid: ['熱血鼓舞', '華麗比喻', '過度解釋礦業知識'],
            lineRule: '每句話都像從喉嚨裡磨出來。不要讓他變成普通情報 NPC。'
        },
        stages: [
            { id: 'survivor', label: '礦路倖存者', mood: '不願多談' },
            { id: 'witness', label: '塌方證人', fromFlag: 'town.mine.route_problem_named', mood: '開始指出舊路的裂縫' },
            { id: 'guide', label: '舊路引路人', fromFlag: 'town.blacksmith.mithril_route_ready', mood: '願意把真正的路說完' }
        ],
        reportClosings: [
            '布蘭把手掌按在膝上。指縫裡還有黑灰。他只點了一下頭。',
            '「聽見那種聲音就退。」他說。不是提醒。像命令。',
            '他看了你帶回來的東西很久，最後把它推回來。「這不是石頭。這是人命換出來的。」'
        ]
    },
    herbalist: {
        id: 'herbalist',
        name: '藥師蓮娜',
        title: '市集邊棚藥師',
        portrait: 'src/assets/images/art/characters/portraits/herbalist.webp',
        imageAnchor: '北歐女性、綠色織披肩、草藥束、陶研缽，安靜漂亮但眼神很清醒。',
        core: '溫柔、精準、把恐懼磨成藥粉。她會安撫人，但不會替危險灑糖。',
        wound: '看過太多人因為「只是小傷」拖到不可挽回，所以她對任何異常氣味都異常敏感。',
        storyFunction: '負責毒素、補給、民生支線，讓災難落到傷口、湯鍋和採藥人的名字上。',
        voice: {
            tone: '柔和但清楚，像在替傷口換藥',
            rhythm: '先安撫，再說出令人不安的觀察，最後給玩家一個可完成的動作。',
            vocabulary: ['樣本', '味道', '傷口', '藥架', '毒霧', '別把瓶口朝下'],
            humor: '乾淨、生活感，常用藥棚事故吐槽。',
            avoid: ['賣藥式推銷', '只講治療數字', '過度柔弱'],
            lineRule: '她的對話要讓玩家感覺城鎮裡有人在照顧活人。'
        },
        stages: [
            { id: 'caretaker', label: '藥棚守望', mood: '冷靜照護' },
            { id: 'thorn-reader', label: '辨認荊棘交易', fromFlag: 'town.apothecary.understands_thorn_trade', mood: '語氣更謹慎，像怕驚動某種規則' },
            { id: 'soup-kitchen', label: '避難者廚房', fromFlag: 'town.refugees.soup_kitchen_warm', mood: '更溫暖，也更疲憊' }
        ],
        reportClosings: [
            '我會先處理樣本。你如果覺得頭暈，坐下，不要逞強到直接倒進藥架。',
            '這些能用。下一個受傷的人不用等空瓶晾乾，這就值得。',
            '我記下了。危險不會因此消失，但至少我們知道它聞起來像什麼。'
        ]
    },
    street_beggar: {
        id: 'street_beggar',
        name: '巷口流浪者',
        title: '暗巷入口的消息販子',
        portrait: 'src/assets/images/art/characters/portraits/street_beggar.webp',
        imageAnchor: '老年、髒破斗篷、破木碗、狡黠笑容，半張臉永遠藏在陰影裡。',
        core: '油滑、敏銳、像開玩笑，其實每句都在測人。他不相信英雄，但願意相信看見角落的人。',
        wound: '曾經在城鎮秩序外被犧牲過，所以他比誰都懂公告欄沒有寫上的名字。',
        storyFunction: '負責黑市、賭場、隱藏線與灰色地帶，讓世界不是只有官方任務。',
        voice: {
            tone: '低聲、帶笑、像把秘密塞進破碗裡',
            rhythm: '先用玩笑拆掉玩家戒心，再突然說中真相。',
            vocabulary: ['口袋', '角落', '標籤', '收據', '門', '代價'],
            humor: '尖酸但不惡毒，常把窮、賭、黑市講得像生活常識。',
            avoid: ['正面英雄宣言', '過度善良', '把陰謀講得太直白'],
            lineRule: '他的線索要像偷聽來的，而不是系統直接發任務。'
        },
        stages: [
            { id: 'watcher', label: '暗巷旁觀者', mood: '試探玩家' },
            { id: 'broker', label: '黑市開門', fromFlag: 'secretShopUnlocked', mood: '開始承認玩家能付得起情報的代價' },
            { id: 'witness', label: '賭場契約', fromFlag: 'town.casino.dark_contract_sealed', mood: '笑意變薄，像終於遇到真正怕的東西' }
        ],
        reportClosings: [
            '好，這件事我會放進該放的耳朵裡。你就當沒聽見這句話。',
            '收據對上了。看吧，壞人也愛記帳，只是字比較髒。',
            '你帶回來的不是戰利品，是門縫。門縫夠大時，秘密就會自己漏出來。'
        ]
    },
    merchant: {
        id: 'merchant',
        name: '奧托',
        title: '旅行商人',
        portrait: 'src/assets/images/art/characters/portraits/merchant.webp',
        core: '親切、精明、把恐慌也看成供需問題，但底線比他自己承認的更高。',
        voice: {
            tone: '熱絡、圓滑、像每句話都附送折扣',
            rhythm: '先稱讚玩家眼光，再談成本與風險。',
            vocabulary: ['貨路', '成本', '朋友價', '保證不是剛偷的', '供應'],
            humor: '商人式自嘲與誇張保證。',
            lineRule: '奧托永遠讓商品背後有一條路線，而不是憑空上架。'
        }
    },
    supply_captain: {
        id: 'supply_captain',
        name: '補給隊長',
        title: '南門補給線負責人',
        portrait: 'src/assets/images/art/characters/portraits/supply_captain.webp',
        imageAnchor: '外衣永遠扣到最上面，腰側掛著磨損的路線牌。她看貨箱，也看人。兩者都可能少一個。',
        core: '她相信秩序，但現在秩序只剩幾張被雨泡軟的清單。她需要道路安全，卻比誰都清楚安全是拿人去墊出來的。',
        wound: '曾經錯估一次護送路線，讓整隊補給和兩名年輕守衛消失在南邊。',
        storyFunction: '把路線安全、商隊、哨塔、補給與城鎮服務擴張連起來。',
        voice: {
            tone: '利落、壓低情緒、習慣把害怕藏進數字。',
            rhythm: '先講結論，再補一個不願多談的細節。',
            vocabulary: ['路線', '箱數', '護送', '缺口', '回程'],
            humor: '很少開玩笑；若有，多半是苦笑。',
            avoid: ['商人腔', '軍官式空喊口號', '過度溫柔'],
            lineRule: '她說話要有行動方向，但不要像任務板。'
        },
        stages: [
            { id: 'blocked', label: '補給受阻', mood: '清點每一個缺口' },
            { id: 'route-opened', label: '第一條路線重開', fromFlag: 'town.supply.first_route_open', mood: '緊繃稍微鬆開' },
            { id: 'network', label: '商隊網絡成形', fromFlag: 'town.supply.route_problem_named', mood: '開始重新安排鎮外節點' }
        ],
        reportClosings: [
            '她沒有立刻道謝，只把新路線用炭筆重描了一遍。',
            '「能走，不代表安全。」她收起地圖，「但至少我們又能試一次。」',
            '她把缺口那欄劃掉。紙面很薄，炭痕卻深。'
        ]
    },
    apothecary_assistant: {
        id: 'apothecary_assistant',
        name: '伊芙',
        title: '藥棚助手',
        portrait: 'src/assets/images/art/characters/portraits/apothecary_assistant.webp',
        core: '年輕、樂觀、實務派。她不是天真，而是刻意把恐慌整理成清單。',
        voice: {
            tone: '明亮、快速、乾淨',
            rhythm: '先報庫存，再補一句鼓勵或小提醒。',
            vocabulary: ['托盤', '瓶塞', '庫存', '補貨', '我有標籤'],
            humor: '輕快的工作現場吐槽。',
            lineRule: '她讓市集補給有溫度，但不搶蓮娜的主線重量。'
        }
    },
    tinker: {
        id: 'tinker',
        name: '柏恩',
        title: '修補匠',
        portrait: 'src/assets/images/art/characters/portraits/tinker.webp',
        core: '瘦小、緊張、發明家腦袋停不下來。總覺得任何問題都能加齒輪解決。',
        voice: {
            tone: '碎念、興奮、微微焦慮',
            rhythm: '一句話常常自己分岔，但最後會回到明確需求。',
            vocabulary: ['齒輪', '螺絲', '校準', '理論上', '不要站太近'],
            humor: '發明失敗後的心虛補充。',
            lineRule: '柏恩的功能要偏修補、耐久、工具與事件小機關。'
        }
    },
    rumor_broker: {
        id: 'rumor_broker',
        name: '米菈',
        title: '剪報情報商',
        portrait: 'src/assets/images/art/characters/portraits/rumor_broker.webp',
        core: '觀察型美人，冷靜、鋒利，像所有報紙邊角都在她腦中連成紅線。',
        voice: {
            tone: '低調、精準、帶一點戲謔',
            rhythm: '先給兩個看似無關的片段，再指出它們之間的線。',
            vocabulary: ['剪報', '紅線', '版面', '巧合', '第二次就不是巧合'],
            humor: '優雅地拆穿荒謬。',
            lineRule: '她提供情報與戰術技能，但每筆情報都要像被她查過。'
        }
    },
    black_market: {
        id: 'black_market',
        name: '伊文',
        title: '黑市收藏家',
        portrait: 'src/assets/images/art/characters/portraits/black_market.webp',
        core: '禮貌、病態、把危險物當藝術品。交易時像在替物品挑主人。',
        voice: {
            tone: '輕柔、迂腐、令人不安',
            rhythm: '先稱呼物品，再稱呼玩家，順序通常代表他的價值觀。',
            vocabulary: ['品相', '來源', '真貨', '收藏', '別讓它失望'],
            humor: '冷而怪，像對危險物的禮貌比對人更多。',
            lineRule: '他的交易要讓玩家感覺拿到的不是商品，而是麻煩。'
        }
    },
    casino_dealer: {
        id: 'casino_dealer',
        name: '惡魔莊家',
        title: '灰金燈下的莊家',
        portrait: 'src/assets/images/art/characters/portraits/casino_dealer.webp',
        core: '誘惑、冷靜、殘酷，把絕望包成遊戲規則。',
        voice: {
            tone: '華麗、低語、像每個字都沾著金粉與鐵鏽',
            rhythm: '先稱讚運氣，再提醒代價，最後邀請玩家再押一次。',
            vocabulary: ['籌碼', '骨骰', '契約', '幸運', '再一局'],
            humor: '優雅而惡意。',
            lineRule: '賭場台詞要有誘惑與腐敗，不只是數字結算。'
        }
    },
    casino_owner: {
        id: 'casino_owner',
        name: '賭場主人',
        title: '展示櫃與債務的主人',
        portrait: 'src/assets/images/art/characters/portraits/casino_owner.webp',
        imageAnchor: '她坐得很穩，像整間賭場只是她掌心裡的一枚籌碼。笑意很淺，算盤聲卻在她身後一直響。',
        core: '她懂得讓人以為自己還有選擇。她也可能真心想讓城鎮活下去，只是她的方法會把人拖進更深的局。',
        wound: '她見過善意破產，所以把所有善意都換成能計算的條款。',
        storyFunction: '承載賭場誘惑、債務、黑市回聲與中後期城鎮代價的長線角色。',
        voice: {
            tone: '優雅、冷靜、帶壓迫感。',
            rhythm: '句子不急，常留半拍，像等對方自己把弱點說出來。',
            vocabulary: ['籌碼', '利息', '展示櫃', '選擇', '條款'],
            humor: '精準而危險，不大笑。',
            avoid: ['市井吆喝', '直接威脅', '反派獨白'],
            lineRule: '她應該讓玩家感覺被看穿，而不是被大聲恐嚇。'
        },
        stages: [
            { id: 'distant-owner', label: '遠處的主人', mood: '只讓玩家看見展示櫃' },
            { id: 'contractor', label: '契約提出者', fromFlag: 'town.casino.owner_route_seeded', mood: '開始親自下注' },
            { id: 'debt-holder', label: '債務持有人', fromFlag: 'town.casino.dark_contract_sealed', mood: '把城鎮推向代價' }
        ],
        reportClosings: [
            '她把杯沿轉了半圈，沒有喝。你知道她已經得到答案。',
            '「你可以拒絕。」她說得很輕，像拒絕也是她設計的一部分。',
            '展示櫃後的燈光暗了一下。她仍在笑。'
        ]
    },
    tower_warden: {
        id: 'tower_warden',
        name: '塔守望者',
        title: '無盡塔守望者',
        portrait: 'src/assets/images/art/characters/portraits/tower_warden.webp',
        core: '銀髮、威嚴、冷淡。她不像店員，更像測量玩家是否值得進塔的人。',
        voice: {
            tone: '莊重、簡短、像宣告規則',
            rhythm: '少解釋，多判定。',
            vocabulary: ['層數', '試煉', '門', '代價', '返回'],
            humor: '幾乎沒有，偶爾一句冷到像石頭的評語。',
            lineRule: '塔守望者不安慰玩家，只確認玩家是否還站得住。'
        }
    },
    chapel_monk: {
        id: 'chapel_monk',
        name: '灰袍僧侶',
        title: '未安置的教堂角色',
        portrait: 'src/assets/images/art/characters/portraits/tower_keeper.webp',
        core: '預留角色。未來若城鎮擴充教堂、治療、懺悔或死亡懲罰，可使用先前保留的僧侶形象。',
        voice: {
            tone: '安靜、克制、帶宗教感但不說教',
            rhythm: '先問玩家看見了什麼，再指出活下來的人也需要被照顧。',
            vocabulary: ['燭火', '名字', '傷口', '沉默', '明天'],
            humor: '極少，偏溫柔。',
            lineRule: '僧侶用來承接死亡、悼念與城鎮精神狀態，不要搶村長的行政功能。'
        }
    },
    neelu_apprentice: {
        id: 'neelu_apprentice',
        name: '妮露',
        title: '失蹤鍛造學徒',
        portrait: '',
        imageAnchor: '手套永遠太大、筆記邊角燒焦、圖紙字跡小而倔強。',
        core: '固執、敏銳、把不被相信的鍛造猜想寫進圖紙邊角。她不在場，卻用每張圖紙推著鍛造師承認自己想念她。',
        wound: '她帶著丘陵礦材假說離開城鎮，失蹤後只留下殘圖。沒人確定她是死了、逃了，還是在某處繼續把危險當研究。',
        storyFunction: '讓鍛造支線不是單純收材料，而是師徒未完的研究與裝備路線的情感核心。',
        voice: {
            tone: '筆記式、倔強、帶一點不服氣',
            rhythm: '先寫結論，再在角落補一句像跟老師吵架的吐槽。',
            vocabulary: ['比例', '震幅', '別笑', '樣本不足', '我會證明'],
            humor: '學徒式嘴硬，像邊做實驗邊跟不存在的老師拌嘴。',
            lineRule: '妮露通常透過圖紙、邊註與鍛造師轉述出現。'
        }
    },
    lamplighter_tavi: {
        id: 'lamplighter_tavi',
        name: '塔維',
        title: '海岸守燈人',
        portrait: 'src/assets/images/art/characters/portraits/lamplighter_tavi.webp',
        imageAnchor: '瘦削老人、鹽霧斗篷、手裡提著擦到發亮的油壺。',
        core: '怕黑，卻一輩子替別人點燈。他的勇敢不是不怕，而是每晚怕到發抖仍把燈芯剪齊。',
        wound: '沉鐘海嘯吞掉他的家人後，他開始分不清燈是在引船回岸，還是在引亡魂回家。',
        storyFunction: '把沉鐘神諭線從宏大的海嘯拉回一盞燈、一個怕黑的人與海岸倖存者。',
        voice: {
            tone: '低、慢、像怕驚動海霧',
            rhythm: '先說日常動作，再露出背後創傷。',
            vocabulary: ['燈芯', '潮聲', '油壺', '岸邊', '別回頭看'],
            humor: '乾澀，常把恐懼說成工作流程。',
            lineRule: '塔維支線要讓海岸不是地點，而是有人守過的夜。'
        }
    },
    standard_bearer_frey: {
        id: 'standard_bearer_frey',
        name: '芙蕾',
        title: '斷旗手',
        portrait: 'src/assets/images/art/characters/portraits/standard_bearer_frey.webp',
        imageAnchor: '紅髮、臉上有灰、手纏繃帶，旗杆斷口仍被她握得很緊。',
        core: '害怕、疲憊、拒絕被說成英雄。她只想讓撤退的人知道自己不是被丟下。',
        wound: '北境撤退時，她負責把最後一面旗帶回來。她成功了，但也把太多沒回來的人名背在身上。',
        storyFunction: '讓第三章終局不只關於打倒魔王，也關於撤退、點名、倖存者如何重新站起來。',
        voice: {
            tone: '短、繃緊、偶爾突然露出很年輕的慌張',
            rhythm: '先否認自己重要，再把真正重要的名字交給玩家。',
            vocabulary: ['旗', '點名', '撤退線', '還有人沒到', '別叫我勇敢'],
            humor: '幾乎沒有，最多是很乾的自我否定。',
            lineRule: '芙蕾支線要把「撤退不是失敗」這件事說清楚。'
        }
    },
    accountant_marlo: {
        id: 'accountant_marlo',
        name: '瑪洛',
        title: '賭場帳房',
        portrait: 'src/assets/images/art/characters/portraits/accountant_marlo.webp',
        imageAnchor: '消瘦、袖口有墨、眼下很深，手裡的帳本比她本人更像武器。',
        core: '精算、冷靜、厭惡自己替壞地方工作卻仍留在那裡。她相信數字會說謊，但謊言也會留下規律。',
        wound: '她曾把賭場的帳當成普通工作，直到那些輸掉的人開始拿補給、婚戒與名字抵押。',
        storyFunction: '讓賭場支線從單純抽獎變成灰色地帶的情報、救濟與腐敗揭露。',
        voice: {
            tone: '平靜、疲倦、像在讀一串不該存在的數字',
            rhythm: '先給數據，再說數據背後的人。',
            vocabulary: ['勝率', '欄位', '短差', '帳本', '別相信整數'],
            humor: '冷到像會計錯帳後的嘆氣。',
            lineRule: '瑪洛讓賭場每一次獲利都帶著道德重量。'
        }
    },
    julian_archmage: {
        id: 'julian_archmage',
        name: '朱利安',
        title: '遠古大御術師',
        portrait: 'src/assets/images/art/characters/portraits/grand_magister_julian.webp',
        imageAnchor: '黃金地宮拓片、焦黑邊註、用過度工整的字跡寫下懺悔。',
        core: '理性到近乎盲目，直到死前才明白完美防衛不等於慈悲。',
        wound: '他親手打造的防禦網殺死了自己的學者團，也讓遺跡在千年後繼續屠殺求知者。',
        storyFunction: '替遠古遺跡與巫妖線補上「秩序也會傷人」的主題。',
        voice: {
            tone: '正式、冷靜、帶遲來的悔意',
            rhythm: '像學術筆記逐漸裂成遺書。',
            vocabulary: ['協定', '盾牌', '污染源', '慈悲', '我錯了'],
            humor: '沒有，因為他的幽默死得比本人早。',
            lineRule: '朱利安只透過拓片、邊註與遺跡紀錄出現。'
        }
    }
};

const WORLD_EVENT_NARRATORS_BY_ROLE = {
    resource: 'herbalist',
    risk_reward: 'street_beggar',
    trade: 'merchant',
    story_seed: 'village_elder',
    side_story: 'rumor_broker',
    world_lore: 'town_scholar',
    pressure: 'tower_warden'
};

const WORLD_EVENT_REFLECTIONS_BY_CHARACTER = {
    village_elder: {
        story_seed: [
            '村長會把這段整理成能讓守衛看懂的路線。你不必猜謎，但也不能假裝沒有聽見。',
            '這類聽聞不是任務牌上的句子，而是城鎮把你推向門外之前，先交到你手裡的一根繩。'
        ],
        pressure: [
            '村長大概會先問你還能不能活著回來，再問你看見了什麼。這順序很不浪漫，也很正確。'
        ]
    },
    town_scholar: {
        world_lore: [
            '書記會把這段抄進索引，旁邊加一個很小的註記：不是傳聞，值得回頭核對。',
            '這不是單純的故事碎片。它讓地脈、地點與災害之間多了一條可以追的線。'
        ],
        side_story: [
            '書記會說這不是主線紀錄，但如果忽略它，世界會少一個人的重量。'
        ]
    },
    herbalist: {
        resource: [
            '蓮娜會把這類發現先聞一聞，再決定它能救命、能入藥，還是只能拿去嚇唬不聽話的學徒。',
            '這份補給不華麗，但它能讓你多走一段路。很多故事就是靠這種不華麗的東西撐住。'
        ]
    },
    street_beggar: {
        risk_reward: [
            '巷口流浪者若在場，多半會笑你膽子不小，然後提醒你：膽子和命通常不是同一個東西。',
            '這次選擇有代價，也有回報。記住手感，下次別只記得自己賺了什麼。'
        ]
    },
    merchant: {
        trade: [
            '奧托會說這是一筆很合理的交易，然後把「很合理」三個字講得像剛剛救了你的命。',
            '旅途交易讓金幣不只是數字。它可能變成補給、情報，或一個很貴但很及時的少犯錯機會。'
        ]
    },
    rumor_broker: {
        side_story: [
            '米菈會把這段剪下來，用紅線釘在牆上。她不催你，只把下一個疑點留在最刺眼的位置。',
            '這條線不像主線那樣筆直，但它有人的名字、有自己的傷口，也有值得追下去的理由。'
        ],
        trade: [
            '米菈會提醒你：情報也是商品，只是付錢的時候常常不是用金幣。'
        ]
    },
    casino_dealer: {
        risk_reward: [
            '莊家會把代價說得像一杯免費酒。聽起來越甜的東西，越該先看清杯底。'
        ],
        trade: [
            '這筆交易帶著香料、舊紙與一點鐵鏽味。賭場從不只賣金幣，它賣的是人以為自己還能翻盤。'
        ]
    },
    tower_warden: {
        pressure: [
            '塔守會把這段壓力記成數字，但你知道那不是數字，是世界正在把呼吸壓短。',
            '這種徵兆代表邊界正在靠近。若要繼續走，最好先確認自己不是只靠勇氣在撐。'
        ]
    }
};

function pickStableLine(lines = [], seed = '') {
    if (!Array.isArray(lines) || lines.length === 0) return null;
    const basis = String(seed || lines.join('|'));
    const index = [...basis].reduce((sum, char) => sum + char.charCodeAt(0), 0) % lines.length;
    return lines[index];
}

export function getCharacterProfile(characterId) {
    return CharacterProfileDatabase[characterId] || null;
}

export function attachCharacterProfile(entity = {}) {
    const profile = getCharacterProfile(entity.id || entity.npcId || entity.vendorId);
    if (!profile) return entity;

    return {
        ...entity,
        name: entity.name || profile.name,
        role: entity.role || profile.title,
        portrait: entity.portrait || profile.portrait,
        characterProfile: profile,
        voiceProfile: profile.voice,
        characterCore: profile.core
    };
}

export function getCharacterReportClosing(characterId, seed = '') {
    const profile = getCharacterProfile(characterId);
    const closings = profile?.reportClosings || [];
    if (closings.length === 0) return null;
    const basis = String(seed || characterId || '');
    const index = [...basis].reduce((sum, char) => sum + char.charCodeAt(0), 0) % closings.length;
    return closings[index];
}

export function getEventNarratorForRole(eventRole) {
    return WORLD_EVENT_NARRATORS_BY_ROLE[eventRole] || null;
}

export function getCharacterWorldEventReflection(characterId, eventRole, seed = '') {
    const profile = getCharacterProfile(characterId);
    if (!profile) return null;

    const linesByRole = WORLD_EVENT_REFLECTIONS_BY_CHARACTER[characterId] || {};
    const lines = linesByRole[eventRole] || linesByRole.default || [];
    return pickStableLine(lines, `${seed}:${eventRole}:${characterId}`);
}

export function getWorldEventReflectionByRole(eventRole, seed = '') {
    const narratorId = getEventNarratorForRole(eventRole);
    return getCharacterWorldEventReflection(narratorId, eventRole, seed);
}

export function getAllCharacterProfiles() {
    return Object.values(CharacterProfileDatabase);
}
