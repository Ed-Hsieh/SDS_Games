/**
 * CrossChapterStoryArcs.js
 * Long-form story arcs that connect chapter 1 seeds to chapter 2 expansion
 * and chapter 3 payoff.
 *
 * These records are design-facing data. They do not directly mutate quest
 * state; they exist so quests, NPC dialogue, map events, and UI notes can stay
 * aligned around the same dramatic through-lines.
 */

export const CrossChapterStoryArcs = [
    {
        id: 'leyline_collapse',
        title: '地脈崩毀',
        theme: '世界災變的主幹',
        chapters: {
            1: '玩家先看到小規模異常：史萊姆暴增、銀絲封路、神木被剝皮、角鹿失控。災難還像是地方事件。',
            2: '異常擴散成區域災害：女巫、神諭、巫妖、男爵各自被地脈斷裂推向失控或極端選擇。',
            3: '所有斷裂線索指向黑焰邊境。古龍巢與魔王封印成為同一場末日的兩端。'
        },
        firstChapterSeed: '第一章不要急著解釋全貌，只讓玩家確定「村外怪事不是普通魔物暴動」。',
        chapterTwoExpansion: '第二章把災害拆成多種社會與地形後果，讓玩家知道每個區域都被同一個根因牽動。',
        chapterThreePayoff: '第三章收束到古龍掠奪地脈精華與魔王封印碎裂，讓前面每個 BOSS 都像一張倒下的骨牌。',
        gameplayBridge: '主線 BOSS、地圖痕跡、地形效果、副本解鎖都應回到「地脈出了問題」這個原因。',
        riskIfMissing: '如果缺少這條線，玩家會覺得每個 BOSS 只是獨立怪物，世界不會像正在崩壞。',
        relatedQuests: ['main_002', 'main_004', 'main_005', 'main_006', 'main_007', 'main_011', 'main_015'],
        relatedSystems: ['boss_clues', 'world_map', 'dungeons', 'traveler_journal']
    },
    {
        id: 'traveler_notebook_memory',
        title: '旅人手札與世界記憶',
        theme: '把提示變成玩家的筆記',
        chapters: {
            1: '村長讓玩家去找書記，書記教玩家把城外異常記下來。手札從教學工具變成冒險者的第一本記錄。',
            2: '霧碑丘、海岸、古墓與黑市情報讓手札開始承載地名、傳聞、謎題與未確認消息。',
            3: '手札變成決戰前的世界索引，玩家能回看誰說過什麼、哪些地點已經改變。'
        },
        firstChapterSeed: '「先去找書記」不是單純跑腿，而是建立整個遊戲的記錄方式。',
        chapterTwoExpansion: '支線與地圖事件要陸續把未解釋的世界碎片塞進手札，而不是把答案直接寫在 UI 上。',
        chapterThreePayoff: '終局前讓手札像一本被玩家親手寫滿的旅行筆記，而不是任務清單。',
        gameplayBridge: '旅人手札分頁、委託狀態、首領痕跡、世界見聞、城鎮記憶都接在這條線上。',
        riskIfMissing: '如果缺少這條線，玩家會覺得提示是在教他玩遊戲，而不是角色真的在推理與記錄。',
        relatedQuests: ['main_001', 'main_002', 'commission_scholar_last_index'],
        relatedSystems: ['traveler_journal', 'dialogue_topics', 'quest_log']
    },
    {
        id: 'forge_weapon_route',
        title: '鍛造與裝備成長',
        theme: '凡人用工具追上災難',
        chapters: {
            1: '鐵匠煙囪讓玩家理解：裝備不是數值欄，而是活下去的工具。銀絲伏道則先用斷鉤證明準備有多重要。',
            2: '礦脈、副本圖紙、特殊素材讓鍛造開始分流，玩家為地形與 BOSS 壓力準備裝備。',
            3: '秘銀、終局素材與套裝效果成為對抗古龍與魔王的凡人答案。'
        },
        firstChapterSeed: '第一章只需讓玩家知道鐵匠是城鎮防線的一部分，不必塞太多強化系統。',
        chapterTwoExpansion: '第二章可以加入更多材料來源、保底圖紙、副本獎勵和支線工匠故事。',
        chapterThreePayoff: '第三章把裝備線收成決戰準備，而不是單純換更高數值的武器。',
        gameplayBridge: '圖紙、材料、怪物掉落、副本保底、套裝收集與裝備效果解析器都應對齊這條線。',
        riskIfMissing: '如果缺少這條線，鍛造會變成旁支功能，玩家不會覺得自己正在準備一場越來越大的戰爭。',
        relatedQuests: ['commission_blacksmith_chimney', 'commission_forge_001', 'commission_forge_002'],
        relatedSystems: ['forge', 'recipes', 'equipment_effects', 'sets', 'dungeon_rewards']
    },
    {
        id: 'herbalist_care_route',
        title: '藥師與生存照護',
        theme: '災難中的溫柔與實務',
        chapters: {
            1: '藥師用空瓶與史萊姆凝膠把第一個異常轉成可理解的生活問題。',
            2: '毒霧、荊棘交易、解毒與草藥短缺讓藥師線開始牽動主線災害。',
            3: '難民、最後一鍋湯與物資分配讓照護變成城鎮是否還像人的地方。'
        },
        firstChapterSeed: '第一章的藥師支線應該親切、清楚，讓玩家覺得她不是商店入口，而是照顧城鎮的人。',
        chapterTwoExpansion: '第二章可用中毒、草藥、荊棘女巫把她推進主線邊緣。',
        chapterThreePayoff: '第三章讓她面對資源不足與道德壓力，強化末日前夕的城鎮重量。',
        gameplayBridge: '補給、藥水、毒素減免戰術技能、特殊草藥、難民狀態都可以接入這條線。',
        riskIfMissing: '如果缺少這條線，藥師會只是賣藥 NPC，城鎮也少了日常崩壞的感覺。',
        relatedQuests: ['commission_apothecary_bottles', 'commission_herb_basket', 'commission_herb_basket_002', 'commission_last_soup'],
        relatedSystems: ['shop', 'status_resistance', 'town_state', 'side_stories']
    },
    {
        id: 'town_boundary_route',
        title: '城鎮邊界與守望',
        theme: '地圖探索回寫城鎮狀態',
        chapters: {
            1: '南門守衛的靴底把玩家走過的路變成巡守路線，第一次把地圖與城鎮連起來。',
            2: '公告欄、失蹤工人、海岸與霧碑丘消息讓邊界開始變成危機回報系統。',
            3: '斷旗、點名、撤離與北方消息讓城鎮從據點變成最後防線。'
        },
        firstChapterSeed: '第一章讓玩家覺得自己探索過的地方真的被城鎮拿來使用。',
        chapterTwoExpansion: '第二章開始把各區風險與 NPC 反應回填到城鎮場所。',
        chapterThreePayoff: '第三章用城鎮變化反映玩家推進到末日前線，避免只是換章節文字。',
        gameplayBridge: '城鎮場所、右側動態、公告欄、地點發現、NPC 對話優先權都應接在這條線。',
        riskIfMissing: '如果缺少這條線，世界地圖和大廳會像兩個不同遊戲。',
        relatedQuests: ['main_001', 'commission_guard_boots', 'commission_broken_standard', 'commission_broken_standard_002'],
        relatedSystems: ['town_places', 'world_map', 'activity_log', 'notice_board']
    },
    {
        id: 'gray_market_casino_route',
        title: '灰色交易與賭場',
        theme: '誘惑、情報與代價',
        chapters: {
            1: '乞丐與市集只露出小型灰色交易，讓玩家知道城鎮背面有人在看。',
            2: '黑市情報、走私煤印、賭場獎池與假賠率把灰色地帶變成可利用也可失控的系統。',
            3: '暗盤交易與末日籌碼讓玩家看見絕望如何被包裝成機會。'
        },
        firstChapterSeed: '第一章只要埋下「不是所有資訊都在公告欄上」的感覺。',
        chapterTwoExpansion: '第二章讓商店與賭場接入情報、特殊交易、支線材料與捷徑。',
        chapterThreePayoff: '第三章讓玩家明白賭場不是小遊戲，而是末日裡仍然有人想賺最後一枚金幣。',
        gameplayBridge: '商店定位、賭場獎池、情報交易、黑市任務、特殊道具都接在這條線上。',
        riskIfMissing: '如果缺少這條線，賭場會回到只有金幣回饋的雞肋狀態。',
        relatedQuests: ['hidden_dark_deal', 'commission_merchant_001', 'commission_casino_001', 'commission_casino_002'],
        relatedSystems: ['market', 'casino', 'special_trades', 'rumors']
    },
    {
        id: 'boss_clue_route',
        title: '首領痕跡與狩獵流程',
        theme: '玩家自己找到災難源頭',
        chapters: {
            1: '銀鐮伏獵者建立第一套「線索、地點、誘餌、伏擊」規則。',
            2: '女巫、神諭、巫妖、男爵用不同來源與不同推進方式打破可預測感。',
            3: '古龍與魔王不只是新 BOSS，而是前面所有首領痕跡的總結。'
        },
        firstChapterSeed: '第一章的首領流程要清楚，不追求複雜，重點是讓玩家懂得讀線索。',
        chapterTwoExpansion: '第二章加入交易、解謎、封印、狩獵、委託等不同入口。',
        chapterThreePayoff: '第三章把首領痕跡收成決戰前的完整推理鏈。',
        gameplayBridge: '首領痕跡分頁、地點綁定、誘餌、特殊觸發、BOSS 戰前風險說明都接在這條線。',
        riskIfMissing: '如果缺少這條線，BOSS 會退回紅色圖標讓玩家直接撞上，失去探索感。',
        relatedQuests: ['main_004', 'main_005', 'main_006', 'main_011', 'main_015'],
        relatedSystems: ['boss_progress', 'world_interactions', 'traveler_journal', 'battle']
    },
    {
        id: 'dungeon_mechanic_route',
        title: '副本機制與世界補完',
        theme: '主線之外的世界深度',
        chapters: {
            1: '幽暗洞窟作為第一個副本，讓玩家理解地脈斷裂也會吞掉普通人的生活。',
            2: '迷霧叢林、遠古遺跡、冰封雪峰用毒素、辨識、鍛造詞條等機制補出世界厚度。',
            3: '煉獄深淵把副本獎勵與終局準備接上黑焰邊境。'
        },
        firstChapterSeed: '第一章副本不該只是打怪，應該讓玩家第一次看見普通人被災難壓碎。',
        chapterTwoExpansion: '第二章副本各自提供獨特玩法、機制解鎖和裝備路線。',
        chapterThreePayoff: '第三章副本承接終局裝備、火焰壓力與魔王封印線。',
        gameplayBridge: '副本背景、進入風險、通關解鎖、圖紙保底、戰鬥 UI 一致性都接在這條線。',
        riskIfMissing: '如果缺少這條線，副本會像主線地圖外的孤島，玩法與敘事都會脫節。',
        relatedQuests: ['main_006'],
        relatedSystems: ['dungeons', 'battle_ui', 'recipes', 'mechanic_unlocks']
    }
];

export function getCrossChapterStoryArc(arcId) {
    return CrossChapterStoryArcs.find(arc => arc.id === arcId) || null;
}
