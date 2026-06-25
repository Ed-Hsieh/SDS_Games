/**
 * SideStoryNarrativeTaxonomy.js
 * Classification and expansion notes for side stories.
 *
 * This layer is intentionally story-facing. Quest objectives still live in
 * Quests.js and playable story text still lives in QuestStories.js.
 */

export const SideStoryTone = {
    EMOTIONAL: 'emotional',
    SUSPENSE: 'suspense',
    ADVENTURE: 'adventure',
    INTRIGUE: 'intrigue',
    DARK_HUMOR: 'dark_humor',
    SURVIVAL: 'survival',
    WORLD_LORE: 'world_lore',
    CRAFT: 'craft',
    MORAL_CHOICE: 'moral_choice',
    SECRET: 'secret'
};

export const SideStoryToneLabels = {
    [SideStoryTone.EMOTIONAL]: '感情',
    [SideStoryTone.SUSPENSE]: '懸疑',
    [SideStoryTone.ADVENTURE]: '冒險',
    [SideStoryTone.INTRIGUE]: '陰謀',
    [SideStoryTone.DARK_HUMOR]: '黑色幽默',
    [SideStoryTone.SURVIVAL]: '生存',
    [SideStoryTone.WORLD_LORE]: '世界觀補完',
    [SideStoryTone.CRAFT]: '工藝成長',
    [SideStoryTone.MORAL_CHOICE]: '道德抉擇',
    [SideStoryTone.SECRET]: '隱藏奇遇'
};

export const SideBossPotential = {
    NONE: 'none',
    ELITE: 'elite',
    SIDE_BOSS: 'side_boss'
};

export const SideStoryNarrativeTaxonomy = {
    commission_blacksmith_chimney: {
        chapter: 1,
        primaryTone: SideStoryTone.CRAFT,
        secondaryTones: [SideStoryTone.SURVIVAL, SideStoryTone.EMOTIONAL],
        narrativeRole: '把鍛造鋪從功能按鈕變成城鎮夜裡仍在運作的爐火，為後續妮露、秘銀與終局裝備線打底。',
        emotionalCore: '鍛造師嘴上說只是煙囪倒灌，實際上她知道爐火一停，城鎮會先在心裡熄掉。',
        playPromise: '替鍛造鋪找回穩定爐火，讓玩家知道裝備成長會和城鎮生存綁在一起。',
        expansionBeats: [
            '鍛造師不承認自己擔心，只把煙道問題說成「爐子耍脾氣」。',
            '鐵礦石不是單純缺料，而是讓鍛造鋪能繼續修武器、修門栓、修人心的基本供應。',
            '完成後鍛造鋪可成為跨章節裝備線起點，後面接妮露圖紙、秘銀與終局反擊。'
        ],
        sideBossPotential: SideBossPotential.NONE,
        sideBossSeed: '',
        placeholderIcon: 'iron_ore'
    },
    commission_apothecary_bottles: {
        chapter: 1,
        primaryTone: SideStoryTone.SUSPENSE,
        secondaryTones: [SideStoryTone.SURVIVAL, SideStoryTone.EMOTIONAL],
        narrativeRole: '把史萊姆任務從新手擊殺轉成地脈異常的第一個可觀察症狀，並建立藥師蓮娜的照護線。',
        emotionalCore: '蓮娜不是要補貨，她是在確認農田、草藥與水源是不是已經開始被污染。',
        playPromise: '收集凝膠樣本，讓玩家第一次感覺怪物掉落物也能成為故事證據。',
        expansionBeats: [
            '史萊姆凝膠的甜味成為第一章最早的異常細節。',
            '蓮娜用空瓶建立基礎補給，後續才能自然接上毒霧、避難者與最後一鍋湯。',
            '完成後藥棚不只是商店或補給點，而是城鎮判讀災害的地方。'
        ],
        sideBossPotential: SideBossPotential.NONE,
        sideBossSeed: '',
        placeholderIcon: 'slime_jelly'
    },
    commission_guard_boots: {
        chapter: 1,
        primaryTone: SideStoryTone.EMOTIONAL,
        secondaryTones: [SideStoryTone.ADVENTURE, SideStoryTone.SURVIVAL],
        narrativeRole: '把玩家探索過的路線轉成城鎮每天要巡查的生活路線，建立地圖與城鎮狀態的連動。',
        emotionalCore: '守衛不是英雄，但他每天最早踩上城外路線；靴底破了，代表城鎮的邊界也開始破。',
        playPromise: '用獸皮修補靴底，讓玩家理解地圖不是只給玩家走，也是城鎮賴以生存的外緣。',
        expansionBeats: [
            '村長把靴底問題講得很小，卻讓玩家意識到南門外路線需要有人每天確認。',
            '獸皮來源讓玩家自然接觸野外基礎怪物與材料。',
            '完成後南門防線、巡守路線與後續難民/撤退線能有同一個起點。'
        ],
        sideBossPotential: SideBossPotential.NONE,
        sideBossSeed: '',
        placeholderIcon: 'beast_hide'
    },
    commission_forge_001: {
        chapter: 2,
        primaryTone: SideStoryTone.CRAFT,
        secondaryTones: [SideStoryTone.EMOTIONAL, SideStoryTone.WORLD_LORE],
        narrativeRole: '把妮露從「失蹤學徒」推成鍛造線的核心缺席者，讓裝備成長不只是數值。',
        emotionalCore: '鍛造師不願承認自己在等學徒回來，只能先把她留下的字當作配方校準。',
        playPromise: '找礦、補圖、確認妮露的研究方向。',
        expansionBeats: [
            '鍛造師第一次看見妮露署名時刻意罵她字醜，掩飾自己手抖。',
            '殘圖邊角能指出丘陵礦材比例，玩家不是交材料，而是在替失蹤者接一句沒說完的話。',
            '完成後鍛造鋪多出妮露的小工具，城鎮狀態顯示有人開始把她當成仍在參與反擊的人。'
        ],
        sideBossPotential: SideBossPotential.ELITE,
        sideBossSeed: '失控試作甲：妮露早期留下的自動護具，被地脈震動喚醒，可作為鍛造線小高潮。',
        placeholderIcon: 'blueprint'
    },
    commission_forge_002: {
        chapter: 3,
        primaryTone: SideStoryTone.CRAFT,
        secondaryTones: [SideStoryTone.SURVIVAL, SideStoryTone.EMOTIONAL],
        narrativeRole: '把妮露研究、奧倫筆記與終局裝備壓力收束在同一條鍛造線。',
        emotionalCore: '鍛造師終於承認鍛造不是修東西，而是在替還活著的人安排下一次反擊。',
        playPromise: '取得秘銀、完成強化，解釋終局裝備為什麼必要。',
        expansionBeats: [
            '鍛造師不再把秘銀叫傳說，而叫「夠晚才出現的麻煩」。',
            '奧倫筆記可以補出北境鍛造法，讓玩家知道高階裝備與古龍壓力直接相關。',
            '完成後鍛造鋪的語氣變得更像戰備室，爐火旁會出現反擊順序的暗示。'
        ],
        sideBossPotential: SideBossPotential.ELITE,
        sideBossSeed: '裂銀熔傀：秘銀測試失敗後生成的防衛傀儡，用來驗證終局裝備抗性。',
        placeholderIcon: 'mithril_ore'
    },
    commission_herb_basket: {
        chapter: 2,
        primaryTone: SideStoryTone.SUSPENSE,
        secondaryTones: [SideStoryTone.EMOTIONAL, SideStoryTone.WORLD_LORE],
        narrativeRole: '把荊棘女巫的交易規則從森林推到城鎮門口。',
        emotionalCore: '藥師蓮娜不是在研究怪談，她在判斷一個人是不是已經回不來了。',
        playPromise: '跟著採藥籃與毒蛛痕跡，理解女巫如何迫使普通人付出代價。',
        expansionBeats: [
            '採藥籃自己回到市集，蓮娜先檢查泥土方向，再檢查血跡。',
            '毒蛛不是單純怪物，而是被荊棘交易規則吸引到路線上的守門者。',
            '完成後藥棚開始掛起空籃，提醒玩家失蹤者並非只有一人。'
        ],
        sideBossPotential: SideBossPotential.SIDE_BOSS,
        sideBossSeed: '織籃毒蛛母：守在採藥人最後路線上的蛛母，能把荊棘和蛛絲編成陷阱。',
        placeholderIcon: 'herb_basket'
    },
    commission_herb_basket_002: {
        chapter: 2,
        primaryTone: SideStoryTone.EMOTIONAL,
        secondaryTones: [SideStoryTone.SUSPENSE, SideStoryTone.MORAL_CHOICE],
        narrativeRole: '把採藥籃從線索變成失蹤者留下的求救。',
        emotionalCore: '失蹤採藥人沒有英雄台詞，只把名字縫進籃底，讓警告比自己先回家。',
        playPromise: '穩住縫線氣息，清出失蹤者留下的最後路線。',
        expansionBeats: [
            '蓮娜拆線時不說話，因為她已經認出縫線手法。',
            '森林精華不是材料清單，而是讓籃底氣息多留一晚的辦法。',
            '完成後玩家能理解女巫線不是只在打 BOSS，而是在回收被規則吞掉的人。'
        ],
        sideBossPotential: SideBossPotential.SIDE_BOSS,
        sideBossSeed: '失名採藥人的影：可作為非殺戮式遭遇，玩家擊退纏身毒霧並保存他的名字。',
        placeholderIcon: 'threaded_basket'
    },
    commission_grave_bookmark: {
        chapter: 2,
        primaryTone: SideStoryTone.WORLD_LORE,
        secondaryTones: [SideStoryTone.EMOTIONAL, SideStoryTone.SUSPENSE],
        narrativeRole: '讓巫妖不只是亡靈怪物，而是曾害怕靈魂消散的古代學者。',
        emotionalCore: '書記害怕有一天自己也只會把人寫成分類，忘了名字。',
        playPromise: '找回骨片與書籤，還原巫妖生前名字。',
        expansionBeats: [
            '書籤文字像學者寫給未來自己的便條，不像遺言。',
            '骨片與骷髏兵記錄能讓書記判斷墓群不是亂醒，而是在尋找失物。',
            '完成後百科與手札可以把巫妖條目從「怪物」轉成「曾經的學者」。'
        ],
        sideBossPotential: SideBossPotential.ELITE,
        sideBossSeed: '守頁骸骨：守著書籤與墓道索引的菁英亡靈。',
        placeholderIcon: 'grave_bookmark'
    },
    commission_grave_bookmark_002: {
        chapter: 2,
        primaryTone: SideStoryTone.WORLD_LORE,
        secondaryTones: [SideStoryTone.MORAL_CHOICE, SideStoryTone.SUSPENSE],
        narrativeRole: '把巫妖支線接到朱利安與遠古遺跡，補出「盲目秩序」的因果。',
        emotionalCore: '朱利安不是壞人，但他留下的秩序仍在殺人。',
        playPromise: '解讀邊註，理解遠古守衛為什麼把活人當污染源。',
        expansionBeats: [
            '邊註不是謎語，而是朱利安對自己防衛系統的遲來恐懼。',
            '遠古守衛不需要仇恨就能殺人，這讓書記第一次害怕「正確紀錄」。',
            '完成後遠古遺跡入口提示可以改成帶有警告，而不是單純副本解鎖。'
        ],
        sideBossPotential: SideBossPotential.SIDE_BOSS,
        sideBossSeed: '朱利安防衛裁定者：人形機械審判體，透過石碑順序與戰鬥打開。',
        placeholderIcon: 'ancient_rune'
    },
    commission_drowned_bell_insomnia: {
        chapter: 2,
        primaryTone: SideStoryTone.SUSPENSE,
        secondaryTones: [SideStoryTone.WORLD_LORE, SideStoryTone.EMOTIONAL],
        narrativeRole: '讓沉鐘神諭的影響先以失眠、聲音與節奏滲進城鎮。',
        emotionalCore: '那名居民不是瘋了，他只是比別人先聽見海底祭壇浮起來。',
        playPromise: '收集回聲殘留，比對鐘聲節奏。',
        expansionBeats: [
            '居民把鐘聲敲在書記桌上，讓看不見的海嘯變成聽得見的規律。',
            '幽魂不是路邊遭遇，而是被錯誤節奏拉回來的東西。',
            '完成後城鎮夜晚文字可出現遠方低鐘，提示沉鐘線仍在推進。'
        ],
        sideBossPotential: SideBossPotential.ELITE,
        sideBossSeed: '回聲縫合者：由多段錯誤鐘聲拼出的幽魂菁英。',
        placeholderIcon: 'echo_shell'
    },
    commission_coast_lamplighter: {
        chapter: 2,
        primaryTone: SideStoryTone.EMOTIONAL,
        secondaryTones: [SideStoryTone.SUSPENSE, SideStoryTone.ADVENTURE],
        narrativeRole: '補上海岸災後小人物，讓沉鐘線有活人的恐懼與職責。',
        emotionalCore: '塔維怕黑，卻一輩子替海岸點燈；現在他害怕自己的燈把錯的人叫回來。',
        playPromise: '校正燈號、驅散亡魂，讓海岸不只是災難背景。',
        expansionBeats: [
            '塔維不求玩家打敗神諭，只求確認今晚該不該點燈。',
            '靈質校正能讓燈號從招魂變回指路。',
            '完成後城鎮可出現遠方一點穩定燈光，作為沉鐘線的溫柔收束。'
        ],
        sideBossPotential: SideBossPotential.SIDE_BOSS,
        sideBossSeed: '回岸燈亡：被錯誤燈號召回的海岸亡魂，可用燈號節奏削弱。',
        placeholderIcon: 'lantern'
    },
    commission_ash_ledger_names: {
        chapter: 2,
        primaryTone: SideStoryTone.INTRIGUE,
        secondaryTones: [SideStoryTone.EMOTIONAL, SideStoryTone.MORAL_CHOICE],
        narrativeRole: '讓灰燼男爵暴政從遠方要塞壓到城鎮公告欄。',
        emotionalCore: '名字公開後，家屬不能再假裝人只是晚點回家。',
        playPromise: '取得影徽，確認失蹤工匠與黑曜石要塞的關聯。',
        expansionBeats: [
            '村長把名單藏在抽屜裡，不是怕麻煩，而是怕真相讓家屬站不住。',
            '影徽成為證據後，公告欄第一次不是發布委託，而是承認失蹤。',
            '完成後男爵線會從「打暴君」變成「追查誰替暴君挖地宮」。'
        ],
        sideBossPotential: SideBossPotential.SIDE_BOSS,
        sideBossSeed: '黑鐵監工：押送工匠的男爵手下，人形支線 BOSS。',
        placeholderIcon: 'shadow_insignia'
    },
    commission_ash_ledger_names_002: {
        chapter: 2,
        primaryTone: SideStoryTone.ADVENTURE,
        secondaryTones: [SideStoryTone.INTRIGUE, SideStoryTone.EMOTIONAL],
        narrativeRole: '把失蹤名單推進成地宮工事線索。',
        emotionalCore: '工匠死前留下的不是遺物，而是能讓後來者找到路的刻痕。',
        playPromise: '沿刻痕追到黑鐵倉道，找出男爵地宮材料來源。',
        expansionBeats: [
            '家屬把舊工具拿出來，代表城鎮終於願意一起面對失蹤。',
            '刻痕可以和地圖地標互相對上，提升探索感。',
            '完成後黑曜石要塞不再只是主線地點，而是由一群被迫工作的人挖出來。'
        ],
        sideBossPotential: SideBossPotential.SIDE_BOSS,
        sideBossSeed: '男爵收稅官：以糧食與鐵器名義徵收平民，戰鬥中召喚影兵。',
        placeholderIcon: 'worker_marks'
    },
    commission_merchant_001: {
        chapter: 2,
        primaryTone: SideStoryTone.INTRIGUE,
        secondaryTones: [SideStoryTone.DARK_HUMOR, SideStoryTone.WORLD_LORE],
        narrativeRole: '讓黑市從商店功能變成灰燼男爵物流的情報切口。',
        emotionalCore: '伊文不想當英雄，只想當收據；可末日裡看懂收據的人也會被拖下水。',
        playPromise: '用詛咒碎片辨認黑市標籤，追出走私路線。',
        expansionBeats: [
            '伊文用像推銷古董的語氣說出危險情報，形成灰色幽默。',
            '標籤上的殘咒能讓玩家知道男爵貨物不是憑空出現。',
            '完成後商店與黑市可有更自然的情報交易定位。'
        ],
        sideBossPotential: SideBossPotential.ELITE,
        sideBossSeed: '標籤守貨人：黑市貨箱旁的契約傀儡，適合作為短遭遇。',
        placeholderIcon: 'black_market_ticket'
    },
    commission_casino_001: {
        chapter: 2,
        primaryTone: SideStoryTone.INTRIGUE,
        secondaryTones: [SideStoryTone.DARK_HUMOR, SideStoryTone.SUSPENSE],
        narrativeRole: '讓賭場接上灰燼男爵金流，不再只是賺金幣的小遊戲。',
        emotionalCore: '瑪洛不是突然變善良，她只是看懂了輸贏表裡藏著會害死人的貨號。',
        playPromise: '驗證假勝率，從賭桌找出黑市暗號。',
        expansionBeats: [
            '瑪洛把勝率表藏得像一把薄刀，玩家需要用賭局把刀刃磨出來。',
            '輸贏數字可以和男爵貨號呼應，讓賭場變情報節點。',
            '完成後賭場的語氣仍然貪婪，但玩家知道它開始漏出真相。'
        ],
        sideBossPotential: SideBossPotential.SIDE_BOSS,
        sideBossSeed: '暗桌代理人：介於賭局與戰鬥之間的人形對手，能作第二章賭場高潮。',
        placeholderIcon: 'casino_chip'
    },
    commission_northern_letter: {
        chapter: 3,
        primaryTone: SideStoryTone.EMOTIONAL,
        secondaryTones: [SideStoryTone.ADVENTURE, SideStoryTone.WORLD_LORE],
        narrativeRole: '讓北境不只是高階戰場，而是曾有人生活的地方。',
        emotionalCore: '家書裡抱怨豆子太硬，比任何戰報都更能證明北方曾經正常。',
        playPromise: '追蹤信使路線，確認熱風與飛龍斥候。',
        expansionBeats: [
            '信使懷裡不是軍令，而是家書，降低主線重量但加深人味。',
            '飛龍鱗證明那條路曾被人穿越，也證明現在被古龍壓住。',
            '完成後城鎮可出現北境難民談論家常，讓終局前世界更大。'
        ],
        sideBossPotential: SideBossPotential.ELITE,
        sideBossSeed: '截信飛龍斥候：不必是完整 BOSS，可作為北境路線菁英遭遇。',
        placeholderIcon: 'sealed_letter'
    },
    commission_northern_letter_002: {
        chapter: 3,
        primaryTone: SideStoryTone.EMOTIONAL,
        secondaryTones: [SideStoryTone.MORAL_CHOICE, SideStoryTone.SURVIVAL],
        narrativeRole: '把北境家書推成城鎮對遠方的回應。',
        emotionalCore: '回信可能送不到，但承認想回應本身就是抵抗。',
        playPromise: '確認回信路線是否已被龍族封鎖。',
        expansionBeats: [
            '村長拿出的回信短得可笑，卻讓玩家知道沉默不等於不在乎。',
            '龍牙證明路線封鎖，讓玩家明白終局不是單向冒險，而是通信斷裂。',
            '完成後城鎮可以把未寄出的回信收進手札或書記檔案。'
        ],
        sideBossPotential: SideBossPotential.ELITE,
        sideBossSeed: '熱痕幼龍：守著回信路線的龍族幼體，適合作為路線確認戰。',
        placeholderIcon: 'unsent_letter'
    },
    commission_last_soup: {
        chapter: 3,
        primaryTone: SideStoryTone.SURVIVAL,
        secondaryTones: [SideStoryTone.EMOTIONAL, SideStoryTone.DARK_HUMOR],
        narrativeRole: '讓終局壓力落到廚房、傷患與避難者身上。',
        emotionalCore: '藥水能救傷口，熱湯讓人明天願意醒來。',
        playPromise: '收集補給、保護路線，讓避難者廚房撐住。',
        expansionBeats: [
            '蓮娜把預言丟給書記，自己只管鍋底不要焦。',
            '補給路線上的深淵士兵讓玩家感覺城鎮被戰場逼近。',
            '完成後市集邊棚能變成避難廚房，直接改變場所氛圍。'
        ],
        sideBossPotential: SideBossPotential.ELITE,
        sideBossSeed: '熄爐掠食者：專門襲擊補給車的深淵菁英。',
        placeholderIcon: 'soup_pot'
    },
    commission_broken_standard: {
        chapter: 3,
        primaryTone: SideStoryTone.EMOTIONAL,
        secondaryTones: [SideStoryTone.ADVENTURE, SideStoryTone.MORAL_CHOICE],
        narrativeRole: '把撤退從失敗改寫成秩序與倖存。',
        emotionalCore: '芙蕾不是英雄，只是最後一個還抓著旗的人。',
        playPromise: '奪回角飾、修補斷旗，讓城門重新有集結象徵。',
        expansionBeats: [
            '芙蕾拒絕被讚美，因為她記得每個沒跑回來的人。',
            '惡魔角飾不是材料，而是深淵拿來嘲笑撤退者的裝飾。',
            '完成後城門掛起斷旗，讓玩家看見支線改變城鎮畫面。'
        ],
        sideBossPotential: SideBossPotential.SIDE_BOSS,
        sideBossSeed: '追旗魔將：專門追殺撤退旗手的人形惡魔軍官。',
        placeholderIcon: 'broken_standard'
    },
    commission_broken_standard_002: {
        chapter: 3,
        primaryTone: SideStoryTone.EMOTIONAL,
        secondaryTones: [SideStoryTone.SURVIVAL, SideStoryTone.ADVENTURE],
        narrativeRole: '把斷旗象徵推進到點名與失散者名單。',
        emotionalCore: '缺席不是數字，是每次點名時卡住的一口氣。',
        playPromise: '截斷追兵，讓撤退線能完成點名。',
        expansionBeats: [
            '芙蕾的點名冊比旗更重，因為它需要活人承認誰不在。',
            '追兵沿撤退線逼近，讓玩家保護的不只是城門，而是名單完整性。',
            '完成後城門狀態可以從「斷旗」變成「旗影下仍有人排隊」。'
        ],
        sideBossPotential: SideBossPotential.SIDE_BOSS,
        sideBossSeed: '點名獵手：追著失散者名字出現的深淵軍官，可接在追旗魔將後。',
        placeholderIcon: 'roll_call'
    },
    commission_scholar_last_index: {
        chapter: 3,
        primaryTone: SideStoryTone.WORLD_LORE,
        secondaryTones: [SideStoryTone.EMOTIONAL, SideStoryTone.SURVIVAL],
        narrativeRole: '把旅人手札與書記職責推到終局記憶保存。',
        emotionalCore: '書記不是在寫墓誌銘，他固執地替明天保留空白頁。',
        playPromise: '奪回索引封皮、封住黑印，保存活人名冊。',
        expansionBeats: [
            '書記語氣越平靜，越能讓玩家感覺他其實很害怕。',
            '深淵碎片能污染名字，讓「被遺忘」成為可戰鬥的威脅。',
            '完成後旅人手札可以多一層城鎮記憶意味，而不只是任務列表。'
        ],
        sideBossPotential: SideBossPotential.SIDE_BOSS,
        sideBossSeed: '刪名者：深淵書吏型人形 BOSS，會抹除名冊與戰鬥紀錄。',
        placeholderIcon: 'last_index'
    },
    commission_casino_002: {
        chapter: 3,
        primaryTone: SideStoryTone.DARK_HUMOR,
        secondaryTones: [SideStoryTone.SURVIVAL, SideStoryTone.INTRIGUE],
        narrativeRole: '把賭場從吞錢場所轉成終局避難補給的灰色渠道。',
        emotionalCore: '瑪洛沒有變成好人，只是終於讓貪婪替人做一件有用的事。',
        playPromise: '用賭場盈利換補給，讓灰色地帶也被迫參與城鎮生存。',
        expansionBeats: [
            '瑪洛仍然嘴硬，說這只是短差修正，不是良心發現。',
            '籌碼換成乾糧時，賭場的華麗與避難者的疲憊形成反差。',
            '完成後賭場可留下基金清單，讓玩家看到金幣第一次有故事重量。'
        ],
        sideBossPotential: SideBossPotential.SIDE_BOSS,
        sideBossSeed: '惡魔莊家：暗桌契約的正面化，可在第三章賭場收束成特殊 BOSS。',
        placeholderIcon: 'black_chip'
    },
    hidden_dark_deal: {
        chapter: null,
        primaryTone: SideStoryTone.SECRET,
        secondaryTones: [SideStoryTone.DARK_HUMOR, SideStoryTone.INTRIGUE],
        narrativeRole: '讓賭場黑暗面變成可追蹤的隱藏劇情。',
        emotionalCore: '輸掉的不只是籌碼，而是被惡魔莊家寫進契約的名字。',
        playPromise: '回到暗桌贏一局，逼出契約正文。',
        expansionBeats: [
            '暗桌輸局留下血印，讓玩家知道賭場的灰色地帶真的會咬人。',
            '巷口流浪者能看懂血印，把隱藏任務接回城鎮暗流。',
            '完成後可作為惡魔莊家支線 BOSS 的前置入口。'
        ],
        sideBossPotential: SideBossPotential.SIDE_BOSS,
        sideBossSeed: '惡魔莊家：用籌碼、血印與骨骰切換戰鬥規則。',
        placeholderIcon: 'bone_dice'
    }
};

export function getSideStoryNarrativeMeta(questId) {
    const meta = SideStoryNarrativeTaxonomy[questId] || null;
    if (!meta) return null;

    return {
        ...meta,
        primaryLabel: SideStoryToneLabels[meta.primaryTone] || meta.primaryTone,
        secondaryLabels: (meta.secondaryTones || []).map(tone => SideStoryToneLabels[tone] || tone)
    };
}
