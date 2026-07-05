/**
 * SideStoryNarrativeTaxonomy.js
 * Direct planning metadata for chapter 1-3 commission quests.
 *
 * This file is used by convergence checks, not as a runtime script overlay.
 * Keep it aligned with QuestStories.js and Quests.js when town or side-story
 * structure changes.
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

function meta(chapter, primaryTone, secondaryTones, narrativeRole, emotionalCore, playPromise, expansionBeats, sideBossPotential = SideBossPotential.NONE, sideBossSeed = '') {
    return {
        chapter,
        primaryTone,
        secondaryTones,
        narrativeRole,
        emotionalCore,
        playPromise,
        expansionBeats,
        sideBossPotential,
        sideBossSeed
    };
}

export const SideStoryNarrativeTaxonomy = {
    commission_blacksmith_chimney: meta(
        1,
        SideStoryTone.CRAFT,
        [SideStoryTone.SURVIVAL, SideStoryTone.EMOTIONAL],
        '讓破碎城鎮第一個重要功能點回到運作，鍛造鋪不是商店裝飾，而是玩家準備面對首領線的火口。',
        '鍛造師用冷硬語氣掩飾對失蹤獵人的愧疚，幽默來自他的笨拙嘴硬。',
        '修好煙囪後開啟穩定鍛造流程，讓玩家感覺自己修復了一座城鎮的夜燈。',
        [
            '玩家發現爐煙倒灌，鍛造師把擔心包成抱怨。',
            '收集鐵礦石校準爐口，順手補上獵人鉤索的危險線索。',
            '完成後鍛造鋪可作為裝備成長節點，也把銀絲伏獵者線推向準備階段。'
        ]
    ),
    commission_apothecary_bottles: meta(
        1,
        SideStoryTone.SUSPENSE,
        [SideStoryTone.SURVIVAL, SideStoryTone.EMOTIONAL],
        '用史萊姆凝膠的異常甜味說明地脈污染已經貼近農田與水源。',
        '藥師習慣用輕鬆話術安撫傷者，但她越輕描淡寫，污染越顯得不對勁。',
        '完成後恢復基礎藥品供應，並為後續草藥籃支線建立信任。',
        [
            '藥師發現空瓶被凝膠腐蝕，懷疑不是單純魔物增生。',
            '玩家採集樣本，確認污染尚未失控但已進入補給線。',
            '藥棚重新供應基礎藥水，城鎮生存感變得可見。'
        ]
    ),
    commission_guard_boots: meta(
        1,
        SideStoryTone.EMOTIONAL,
        [SideStoryTone.ADVENTURE, SideStoryTone.SURVIVAL],
        '用守衛靴底把地圖互動落回日常巡查，讓城鎮防線不是抽象數值。',
        '村長知道大事常從小物件斷裂開始，靴底是他維持秩序的笨重方式。',
        '完成後南門巡線更可信，後續防線與旗手支線有生活根基。',
        [
            '南門守衛每天踩出的路被破靴記住，村長要求補皮。',
            '獸皮修補讓巡線能持續，也讓玩家理解地圖不是自動存在。',
            '完成後南門狀態更新，為後續城門防衛與撤退線支線鋪路。'
        ]
    ),
    commission_forge_001: meta(
        2,
        SideStoryTone.CRAFT,
        [SideStoryTone.EMOTIONAL, SideStoryTone.WORLD_LORE],
        '妮露圖紙把工藝裝備線從功能升級推向人物失蹤與地脈實驗。',
        '鍛造師把學徒名字藏在技術問題裡，因為承認她失蹤比承認配方失敗更痛。',
        '完成後取得中階工藝線索，讓玩家願意用鍛造挑戰更難區域。',
        [
            '玩家帶回圖紙邊角名字，鍛造師第一次停下手。',
            '補齊礦材比例，確認妮露不是亂跑，而是在測試地脈吸收。',
            '圖紙入庫後開啟更高階工藝方向，並記錄妮露相關素材需求。'
        ],
        SideBossPotential.ELITE,
        '可以加入守圖紙的礦坑精英，掉落妮露試驗殘片。'
    ),
    commission_forge_002: meta(
        3,
        SideStoryTone.CRAFT,
        [SideStoryTone.SURVIVAL, SideStoryTone.EMOTIONAL],
        '秘銀線把鍛造推向終局準備，說明高階裝備不是單純數值，而是城鎮把倖存者筆記接起來。',
        '鍛造師承認自己不是只修武器，而是在替失蹤者把未完成的路走下去。',
        '完成後讓秘銀與強化系統具備故事重量，支撐後續終局戰裝備準備。',
        [
            '逃匠筆記指出秘銀會篩掉僥倖，要求玩家累計強化紀錄。',
            '玩家帶回秘銀礦石，驗證妮露圖紙能否跨到北境階段。',
            '完成後鍛造鋪新增終局冊頁，對應高階製作與強化需求。'
        ],
        SideBossPotential.ELITE,
        '北境秘銀路線可配置守脈精英，掉落高純秘銀與鍛造藍圖碎片。'
    ),
    commission_herb_basket: meta(
        2,
        SideStoryTone.SUSPENSE,
        [SideStoryTone.EMOTIONAL, SideStoryTone.WORLD_LORE],
        '採藥籃把荊棘女巫線拉回普通採藥人的失蹤。',
        '藥師的玩笑變少，因為籃子不會說謊，只會把失蹤者留下的位置暴露出來。',
        '完成後給玩家毒霧與草藥交易線索，連到荊棘交換珠。',
        [
            '玩家找到採藥籃，藥師辨認籃底磨痕。',
            '追查毒霧與藥草缺口，確認採藥人被迫靠近女巫溫室。',
            '完成後開啟荊棘交易線，為女巫支線或副本敵人補怪物需求。'
        ],
        SideBossPotential.SIDE_BOSS,
        '可設計荊棘溫室守衛作為支線 Boss，掉落藤心素材。'
    ),
    commission_herb_basket_002: meta(
        2,
        SideStoryTone.EMOTIONAL,
        [SideStoryTone.SUSPENSE, SideStoryTone.MORAL_CHOICE],
        '籃底縫名讓失蹤者從匿名事件變成具體人物。',
        '藥師一邊嫌線縫得醜，一邊不敢太快念出名字。',
        '完成後取得抗毒或治療相關獎勵，讓故事回到實際戰鬥準備。',
        [
            '玩家發現籃底縫名，確認失蹤採藥人的身份。',
            '追查毒腺與生命種子，判斷她曾試圖替自己留生路。',
            '完成後藥師補上人物紀錄，城鎮多一條不只是懸案的支線收束。'
        ],
        SideBossPotential.SIDE_BOSS,
        '可安排被藤蔓寄生的採藥影作為情感型支線 Boss。'
    ),
    commission_grave_bookmark: meta(
        2,
        SideStoryTone.WORLD_LORE,
        [SideStoryTone.EMOTIONAL, SideStoryTone.SUSPENSE],
        '墓園書籤把巫妖從單純亡靈怪物改回曾有名字的古代學者。',
        '書記不是替怪物辯解，而是不願讓恐懼抹掉曾經存在的人。',
        '完成後提供遺跡判讀或解謎輔助獎勵，支撐古墓路線。',
        [
            '玩家找到書籤，書記辨認上面的舊學院符號。',
            '追查骨片與符文，確認巫妖生前研究方向。',
            '完成後書記補上名字，後續巫妖道具與掉落更有一致性。'
        ],
        SideBossPotential.ELITE,
        '可配置墓園守頁者作為精英，掉落古代書頁與符文粉。'
    ),
    commission_grave_bookmark_002: meta(
        2,
        SideStoryTone.WORLD_LORE,
        [SideStoryTone.MORAL_CHOICE, SideStoryTone.SUSPENSE],
        '朱利安邊註讓遺跡線呈現古代學者的盲目秩序。',
        '書記害怕自己和朱利安一樣，把活人寫成分類標籤。',
        '完成後給予陷阱減傷或謎題提示，讓知識成為實際能力。',
        [
            '玩家找到朱利安邊註，內容比墓碑更冷靜。',
            '進一步追查石魔核心與古代符文，確認遺跡仍在照規則運作。',
            '完成後書記修正旅人手札索引，避免玩家只用怪物名理解世界。'
        ],
        SideBossPotential.SIDE_BOSS,
        '可安排邊註守護構裝作為支線 Boss，掉落索引核心。'
    ),
    commission_drowned_bell_insomnia: meta(
        2,
        SideStoryTone.SUSPENSE,
        [SideStoryTone.WORLD_LORE, SideStoryTone.EMOTIONAL],
        '沉鐘失眠線把海岸神諭的聲波災害帶回城鎮居民。',
        '書記把失眠者的節奏記成譜，因為他不想讓痛苦被說成只是多想。',
        '完成後提供抗寒、抗恐懼或節奏提示獎勵，連到沉鐘神諭。',
        [
            '居民在同一段鐘聲裡失眠，書記要求記錄節拍。',
            '玩家取得寒晶與符文，對照海岸濕拓片。',
            '完成後沉鐘節奏成為可追蹤線索，導向海岸副本與守燈人。'
        ],
        SideBossPotential.ELITE,
        '海岸可加入鐘潮殘響精英，掉落回聲貝與寒晶。'
    ),
    commission_coast_lamplighter: meta(
        2,
        SideStoryTone.ADVENTURE,
        [SideStoryTone.SUSPENSE, SideStoryTone.EMOTIONAL],
        '守燈人油壺把海岸擴張成可前往的實地路線。',
        '塔維用過度樂觀的語氣談燈塔，像每句玩笑都在替海裡的人留方向。',
        '完成後提供黑暗視野或地圖偵查，讓玩家感覺真的開了一段路。',
        [
            '玩家發現燈油不足，塔維仍假裝只是燈芯挑食。',
            '追查海岸殘響與寒晶，確認燈號被沉鐘節奏干擾。',
            '完成後燈塔路線穩定，海岸地點與後續圖片資產需求被記錄。'
        ],
        SideBossPotential.SIDE_BOSS,
        '可設計潮燈怨影作為海岸支線 Boss，掉落守燈油與回聲素材。'
    ),
    commission_ash_ledger_names: meta(
        2,
        SideStoryTone.INTRIGUE,
        [SideStoryTone.EMOTIONAL, SideStoryTone.MORAL_CHOICE],
        '灰燼帳冊讓失蹤工匠從背景數字變成村長不能再藏的名單。',
        '村長習慣把壞消息折好放回抽屜，這次他必須把它釘上公告欄。',
        '完成後解鎖黑市價格或金幣情報，將男爵黑錢與城鎮經濟接上。',
        [
            '玩家帶回帳冊線索，村長承認失蹤名單早已存在。',
            '追查影徽與黑鐵貨號，確認男爵強徵工匠。',
            '完成後公告欄更新，家屬線與黑市線開始互相咬合。'
        ],
        SideBossPotential.SIDE_BOSS,
        '可安排男爵收債官作為支線 Boss，掉落灰燼名牌。'
    ),
    commission_ash_ledger_names_002: meta(
        2,
        SideStoryTone.INTRIGUE,
        [SideStoryTone.ADVENTURE, SideStoryTone.EMOTIONAL],
        '工匠刻痕把男爵地宮的運料路線刻回城鎮。',
        '村長不再只宣布名單，他開始替那些名字找到曾經抵抗過的證據。',
        '完成後給予工藝或黑市相關獎勵，讓失蹤者留下實際推進力。',
        [
            '家屬交出刻痕工具，玩家辨認它像路線圖。',
            '追查暗鋼與影兵，確認黑鐵倉道存在。',
            '完成後工匠刻刀成為獎勵，也成為鍛造與黑市的共同線索。'
        ],
        SideBossPotential.SIDE_BOSS,
        '黑鐵倉道可加入影鑄監工，掉落暗鋼與工匠刻痕。'
    ),
    commission_merchant_001: meta(
        2,
        SideStoryTone.INTRIGUE,
        [SideStoryTone.DARK_HUMOR, SideStoryTone.WORLD_LORE],
        '黑市收藏家標籤補上灰燼男爵貨物流進城鎮的暗線。',
        '伊文不願當英雄，只願當收據；他的幽默來自把危險講得像估價單。',
        '完成後打開黑市籤或特殊交易來源，讓金幣與稀有物資更有重量。',
        [
            '古代錢幣帶玩家接觸伊文，他交出焦黑貨籤。',
            '玩家取得詛咒碎片，讀出貨號背後的路線。',
            '完成後黑市接入城鎮經濟，也為賭場與灰燼帳冊建立第三方來源。'
        ],
        SideBossPotential.ELITE,
        '可配置黑市押貨手作為精英，掉落黑市籤與詛咒碎片。'
    ),
    commission_casino_001: meta(
        2,
        SideStoryTone.INTRIGUE,
        [SideStoryTone.DARK_HUMOR, SideStoryTone.SUSPENSE],
        '假勝率把賭場從任務入口改成金幣與黑錢流向的核心場所。',
        '瑪洛相信數字不會說謊，直到她發現數字被迫講笑話。',
        '完成後提供勝率揭露或賭場情報獎勵，支撐玩家想進賭場的理由。',
        [
            '巷口流浪者交出瑪洛的勝率表，要求玩家實測賭桌。',
            '玩家在老虎機與骰子局取得勝場，辨認被調整的節奏。',
            '完成後賭場暗流露出貨號，連到灰燼男爵與黑市。'
        ],
        SideBossPotential.SIDE_BOSS,
        '可設計暗桌荷官作為支線 Boss 或特殊賭局，掉落修正勝率表。'
    ),
    commission_northern_letter: meta(
        3,
        SideStoryTone.EMOTIONAL,
        [SideStoryTone.ADVENTURE, SideStoryTone.WORLD_LORE],
        '北境來信讓終局壓力第一次透過普通信使抵達城鎮。',
        '村長把信讀得很慢，像怕字太快就會把人帶走。',
        '完成後提供北境偵查或事件線索獎勵，推動龍巢前哨。',
        [
            '北境信件抵達，紙邊有熱痕與龍鱗粉。',
            '玩家追查飛龍斥候，確認信使走過的熱風路線。',
            '完成後北境成為真實方向，城鎮開始準備終局。'
        ],
        SideBossPotential.ELITE,
        '可配置熱風信道獵手作為精英，掉落飛龍鱗與信封蠟印。'
    ),
    commission_northern_letter_002: meta(
        3,
        SideStoryTone.EMOTIONAL,
        [SideStoryTone.MORAL_CHOICE, SideStoryTone.SURVIVAL],
        '未寄出的回信讓等待本身成為一條需要被尊重的路線。',
        '村長知道信可能送不到，仍想確認路是否還能走。',
        '完成後提供首領減傷或事件線索，讓情感收束變成終局準備。',
        [
            '村長拿出未寄出的回信，承認自己拖了很久。',
            '玩家追查幼龍與龍牙，確認回信路線是否已被封死。',
            '完成後城鎮不一定得到好消息，但得到停止假裝的勇氣。'
        ],
        SideBossPotential.ELITE,
        '可設計龍巢信道守衛作為精英，掉落龍牙與未寄信件。'
    ),
    commission_last_soup: meta(
        3,
        SideStoryTone.SURVIVAL,
        [SideStoryTone.EMOTIONAL, SideStoryTone.DARK_HUMOR],
        '最後一鍋湯把終局避難從宏大戰爭拉回吃飯與補給。',
        '藥師用玩笑維持隊伍呼吸，因為如果她沉默，大家會開始數剩下幾碗。',
        '完成後提供治療增益或補給券，讓城鎮生存系統更明確。',
        [
            '藥師清點最後一鍋湯，要求玩家找回能維持補給的材料。',
            '玩家帶回生命種子與藥品，讓避難餐線不會斷。',
            '完成後補給站狀態更新，終局城鎮更像真的有人在努力活下來。'
        ],
        SideBossPotential.ELITE,
        '可加入搶奪補給的深淵斥候精英，掉落避難食材。'
    ),
    commission_broken_standard: meta(
        3,
        SideStoryTone.EMOTIONAL,
        [SideStoryTone.ADVENTURE, SideStoryTone.MORAL_CHOICE],
        '斷旗手芙蕾把前線撤退變成城鎮仍有秩序的證明。',
        '芙蕾拒絕英雄稱號，她只想讓還活著的人看見旗還在。',
        '完成後提供旗幟飾品或士氣相關能力，讓防線有實際效果。',
        [
            '村長收到焦黑斷旗，請玩家修補象徵與實用路標。',
            '玩家擊退深淵追兵並找回旗飾，確認撤退線仍可用。',
            '完成後城門升起斷旗，城鎮不是變完整，而是學會帶傷站著。'
        ],
        SideBossPotential.SIDE_BOSS,
        '撤退線可加入深淵旗獵者作為支線 Boss，掉落斷旗角飾。'
    ),
    commission_broken_standard_002: meta(
        3,
        SideStoryTone.EMOTIONAL,
        [SideStoryTone.SURVIVAL, SideStoryTone.ADVENTURE],
        '點名冊讓斷旗支線從象徵走向具體失散者。',
        '芙蕾不想被稱讚，只想確定名單沒有漏掉誰。',
        '完成後提供首領抗性或撤退秩序獎勵，支援終局連戰。',
        [
            '芙蕾交出汗水泡皺的點名冊，要求玩家確認撤退線追兵。',
            '玩家擊退深淵士兵並取得魔族角，證明追兵來源。',
            '完成後點名冊補齊，城鎮防線有了能被信任的撤退規則。'
        ],
        SideBossPotential.SIDE_BOSS,
        '可設計追名惡魔作為支線 Boss，掉落撤退點名冊。'
    ),
    commission_scholar_last_index: meta(
        3,
        SideStoryTone.WORLD_LORE,
        [SideStoryTone.EMOTIONAL, SideStoryTone.SURVIVAL],
        '書記最後索引把所有災害鏈壓進一本會呼吸的手札。',
        '書記害怕自己記不完，但更怕沒有記錄的人像從未存在。',
        '完成後提供首領抗性與解謎提示，讓知識成為終局防禦。',
        [
            '書記發現手札索引開始自行錯位，要求玩家取回核心證物。',
            '玩家追查世界碎片與終局怪物紀錄，讓索引穩定。',
            '完成後活索引成為獎勵，所有前期記錄被接到終局。'
        ],
        SideBossPotential.SIDE_BOSS,
        '可安排索引噬頁者作為支線 Boss，掉落活索引核心。'
    ),
    commission_casino_002: meta(
        3,
        SideStoryTone.DARK_HUMOR,
        [SideStoryTone.SURVIVAL, SideStoryTone.INTRIGUE],
        '最後一夜籌碼把賭場從誘惑資源轉成避難資金來源。',
        '瑪洛討厭把善意寫進帳冊，因為善意通常沒有發票，但她仍然寫了。',
        '完成後給予補給券或賭場轉化功能，讓金幣與生存直接連動。',
        [
            '巷口流浪者說賭場還有城裡最快流動的金幣。',
            '玩家累計籌碼盈利，讓瑪洛把賭場收益換成避難補給。',
            '完成後賭場功能從純抽獎延伸到城鎮救援。'
        ],
        SideBossPotential.SIDE_BOSS,
        '可加入末夜莊家作為特殊賭局 Boss，掉落補給籌碼。'
    )
};

export function getSideStoryNarrativeMeta(questId) {
    const entry = SideStoryNarrativeTaxonomy[questId] || null;
    if (!entry) return null;
    return {
        ...entry,
        primaryLabel: SideStoryToneLabels[entry.primaryTone] || entry.primaryTone,
        secondaryLabels: (entry.secondaryTones || []).map(tone => SideStoryToneLabels[tone] || tone)
    };
}
