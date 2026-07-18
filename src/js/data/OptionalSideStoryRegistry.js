/**
 * OptionalSideStoryRegistry.js
 * Approved character stories pending formal production. Mainline scenes make each core character
 * complete; these optional stories deepen background, habits, relationships,
 * and contradictions without owning a required fate, route key, rescue clue,
 * villain proof, service unlock, or ending condition.
 */

export const OptionalSideStoryStatus = Object.freeze({
    DEFERRED: 'deferred_until_map_owner',
    APPROVED: 'approved_pending_production'
});

export const SideStoryLength = Object.freeze({
    SHORT: 'short',
    MEDIUM: 'medium',
    LONG: 'long',
    ENSEMBLE_SHORT: 'ensemble_short'
});

export const SideStoryRewardKind = Object.freeze({
    ORDINARY_SUPPLIES: 'ordinary_supplies',
    HANDBOOK_FUNCTION: 'handbook_function',
    MARKET_AUTHORIZATION: 'market_authorization',
    TRAVEL_FUNCTION: 'travel_function',
    FORGE_FUNCTION: 'forge_function',
    CASINO_FUNCTION: 'casino_function',
    UNIQUE_ACCESSORY: 'unique_accessory',
    UNIQUE_CONSUMABLE: 'unique_consumable',
    RELATIONSHIP_RECORD: 'relationship_record',
    ACHIEVEMENT: 'achievement'
});

export const SideStoryRequiredCharacterIds = Object.freeze([
    'village_elder',
    'town_scholar',
    'herbalist',
    'standard_bearer_frey',
    'lamplighter_tavi',
    'blacksmith',
    'street_beggar',
    'casino_owner',
    'casino_dealer',
    'merchant',
    'black_market'
]);

const approvedForProduction = Object.freeze({
    status: OptionalSideStoryStatus.APPROVED,
    implementationGate: 'formal_dialogue_assets_and_runtime'
});

function story(data) {
    const expressionIdsByActor = Object.fromEntries(Object.entries(data.performanceNeeds?.expressionIdsByActor || {})
        .map(([actorId, expressionIds]) => [actorId, Object.freeze(expressionIds)]));
    return Object.freeze({
        ...approvedForProduction,
        ...data,
        characterIds: Object.freeze(data.characterIds || [data.primaryCharacterId].filter(Boolean)),
        prerequisiteStoryIds: Object.freeze(data.prerequisiteStoryIds || []),
        chapterWindow: Object.freeze(data.chapterWindow),
        stagePlan: Object.freeze((data.stagePlan || []).map(stage => Object.freeze(stage))),
        dramaticArc: Object.freeze((data.dramaticArc || []).map(beat => Object.freeze(beat))),
        regionLocationIds: Object.freeze(data.regionLocationIds || []),
        runPolicy: Object.freeze(data.runPolicy || {
            firstRun: 'available_current_run',
            secondRun: 'replays_from_reset_with_contextual_dialogue_only',
            crossRunPersistence: 'none'
        }),
        offerPolicy: Object.freeze(data.offerPolicy || {
            discovery: 'character_or_place_interaction',
            visibleBeforeDiscovery: false,
            autoTrack: false,
            ownerChainOrder: 'short_then_medium_then_long'
        }),
        performanceNeeds: Object.freeze({
            expressionIdsByActor: Object.freeze(expressionIdsByActor),
            backgroundOwnerIds: Object.freeze(data.performanceNeeds?.backgroundOwnerIds || []),
            criticalCgIds: Object.freeze(data.performanceNeeds?.criticalCgIds || [])
        }),
        rewardBinding: Object.freeze(data.rewardBinding),
        resourceNeeds: Object.freeze({
            newItemIds: Object.freeze(data.resourceNeeds?.newItemIds || []),
            newIconIds: Object.freeze(data.resourceNeeds?.newIconIds || []),
            newBackgroundIds: Object.freeze(data.resourceNeeds?.newBackgroundIds || []),
            newSystemHooks: Object.freeze(data.resourceNeeds?.newSystemHooks || [])
        })
    });
}

export const OptionalSideStoryRegistry = Object.freeze([
    // Village elder
    story({
        id: 'map_corners_never_lie',
        title: '地圖總是不平',
        primaryCharacterId: 'village_elder',
        length: SideStoryLength.SHORT,
        chapterWindow: [1, 1],
        unlockAfterSceneId: 'ch1_s04_elder_to_scholar',
        futureOwner: 'handbook',
        purpose: '用受潮地圖、回程標記與乾冷玩笑呈現村長對「有人回來」的執著。',
        characterReveal: '他把二十年前一次被捲角遮住的撤退記號，變成今日反覆壓平紙角的習慣。',
        tone: '正面、生活、帶乾冷幽默。',
        stagePlan: [
            { chapter: 1, ownerId: 'handbook', objective: '協助分類新巡線紀錄，保留尚未確認的回程欄。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '主角交回巡線紙時，村長一面問回程，一面反覆壓住總會翹起的地圖角。' },
            { beat: 'resistance', text: '玩家提出固定紙角的方法，他卻拒絕任何會蓋住舊記號的處理，只肯用容易移開的重物。' },
            { beat: 'turn', text: '捲角下露出二十年前一截幾乎被遮住的撤退線；村長只承認那次錯誤改變了他的工作習慣，不交代遠征核心。' },
            { beat: 'resolution', text: '新地圖被壓平，尚未確認的回程欄被保留下來；村長以乾冷玩笑提醒玩家，空格比好看的答案安全。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: { village_elder: ['neutral', 'guarded', 'pleased'] },
            backgroundOwnerIds: ['handbook']
        },
        mainlineBoundary: '不揭露遠征真相、龍族封痕或村長後來的獨行決定。',
        rewardBinding: { kind: SideStoryRewardKind.ORDINARY_SUPPLIES, id: 'elder_route_sorting_supplies', role: '少量既有補給與手札回程分類。' },
        resourceNeeds: { newSystemHooks: ['handbook_return_marker_filter'] }
    }),
    story({
        id: 'outside_door_inside_desk',
        title: '門外與桌內',
        primaryCharacterId: 'village_elder',
        characterIds: ['village_elder', 'town_scholar'],
        length: SideStoryLength.MEDIUM,
        prerequisiteStoryIds: ['map_corners_never_lie'],
        chapterWindow: [2, 3],
        unlockAfterSceneId: 'ch2_s07_names_return_to_town',
        futureOwner: 'crossroads',
        purpose: '讓玩家看見兩位老友如何用公文、空椅與不承認的陪伴照顧彼此。',
        characterReveal: '兩人熟悉到能看出對方哪一種整理習慣代表疲倦，卻仍把照顧包裝成提高行政效率。',
        tone: '溫暖、克制、老朋友式幽默。',
        stagePlan: [
            { chapter: 2, ownerId: 'crossroads', objective: '重新安排擋住門口的公文桌；兩人各自指出對方多年沒改的壞習慣。' },
            { chapter: 3, ownerId: 'handbook', objective: '協助兩人共同寫一份保留未知、也讓居民看得懂的避難公告。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '避難公文堆到堵住門口，村長與伊萊都堅稱問題出在對方的整理方式。' },
            { beat: 'resistance', text: '交換位置後，兩人都能熟練完成對方一半的工作，卻也各自留下只有老朋友才看得懂的休息提醒。' },
            { beat: 'turn', text: '一份新公告在「居民看得懂」與「未知不能省略」之間卡住，玩家必須保留兩人的要求，而不是選一邊。' },
            { beat: 'resolution', text: '公告以清楚文字公開已知與未知；桌子離開門口，兩人仍不承認重新安排其實是為了能看見對方有沒有倒下。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: {
                village_elder: ['neutral', 'guarded', 'pleased', 'soft'],
                town_scholar: ['neutral', 'guarded', 'pleased', 'soft']
            },
            backgroundOwnerIds: ['crossroads', 'handbook']
        },
        mainlineBoundary: '不提供遠征證據、阻止獨行的方法或龍族非戰條件。',
        rewardBinding: { kind: SideStoryRewardKind.HANDBOOK_FUNCTION, id: 'civic_resident_record', role: '開放居民狀態與城鎮修復紀錄的交叉檢視。' },
        resourceNeeds: { newSystemHooks: ['civic_resident_record_view'] }
    }),
    story({
        id: 'names_without_return',
        title: '沒有回程的名單',
        primaryCharacterId: 'village_elder',
        characterIds: ['village_elder', 'town_scholar'],
        length: SideStoryLength.LONG,
        prerequisiteStoryIds: ['outside_door_inside_desk'],
        chapterWindow: [3, 5],
        unlockAfterSceneId: 'ch3_s08_shadow_commander',
        expireBeforeSceneId: 'ch5_s10_before_dawn',
        futureOwner: 'handbook',
        regionLocationIds: ['old_command_post'],
        purpose: '透過遠征者留下的普通物件，揭開村長二十年來不敢結束任何名字的罪惡感。',
        characterReveal: '他能立刻說出每件遺物的主人，卻把情緒藏成行政格式；他的生還早已記錄，只有本人交回後混在無主遺物裡的返程牌始終沒被領走。',
        tone: '沉重但不絕望，結尾是一次真正完成的小修正。',
        stagePlan: [
            { chapter: 3, ownerId: 'old_command_post', objective: '尋回第一件沒有戰略價值的遠征遺物。' },
            { chapter: 4, ownerId: 'handbook', objective: '比對三件遺物與無主返程牌，保留仍無法證實的空格。' },
            { chapter: 5, ownerId: 'crossroads', objective: '陪村長領回自己的返程牌，承認生還者也不能把自己永遠放進死者的箱子。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '舊指揮所留下三件沒有戰力與秘密的日用品，村長卻能不看名單就說出物主。' },
            { beat: 'resistance', text: '他用公務格式描述每件遺物，拒絕談那枚刻著自己名字、卻在歸來當夜被他和死者遺物一起交回的牌。' },
            { beat: 'turn', text: '伊萊確認生還名冊從未寫錯；真正被擱置的是村長本人不肯領回的返程牌，以及他把倖存當成虧欠的二十年。' },
            { beat: 'resolution', text: '村長親手從無主遺物箱領回自己的牌，沒有赦免自己，也第一次承認活著回來不是冒領死者的位置。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: {
                village_elder: ['neutral', 'guarded', 'grieving', 'soft'],
                town_scholar: ['neutral', 'guarded', 'soft']
            },
            backgroundOwnerIds: ['old_command_post', 'handbook', 'crossroads']
        },
        mainlineBoundary: '只深化責任創傷；不說明封痕、龍族立場、封痕碎片或第五章黎明事件。',
        rewardBinding: { kind: SideStoryRewardKind.UNIQUE_ACCESSORY, id: 'return_tag', role: '撤退與旅途保全取向的獨特飾品，不提供直接高階戰力。' },
        resourceNeeds: { newItemIds: ['return_tag'], newIconIds: ['return_tag'] }
    }),

    // Ilai
    story({
        id: 'one_blank_too_many',
        title: '空格不是答案',
        primaryCharacterId: 'town_scholar',
        length: SideStoryLength.SHORT,
        chapterWindow: [1, 2],
        unlockAfterSceneId: 'ch1_s04_elder_to_scholar',
        futureOwner: 'handbook',
        purpose: '讓伊萊教玩家區分「不存在」、「未找到」與「尚未證明」。',
        characterReveal: '他需要秩序才能工作，卻已知道整齊不能凌駕誠實。',
        tone: '輕巧、神經質、自嘲。',
        stagePlan: [
            { chapter: 1, ownerId: 'handbook', objective: '把三份互相矛盾的居民回報分進不同未知類別。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '三張回報分別寫著沒看見、沒有與不知道，伊萊拒絕把它們塞進同一個空格。' },
            { beat: 'resistance', text: '玩家第一次分類得太整齊，伊萊用自嘲承認整齊很誘人，再逐張指出證據差異。' },
            { beat: 'turn', text: '其中一張看似否定的回報其實只代表報告者從未去過現場。' },
            { beat: 'resolution', text: '三種未知被保留，伊萊接受一張看起來不漂亮、卻不會誤導巡線人的表格。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: { town_scholar: ['neutral', 'guarded', 'pleased'] },
            backgroundOwnerIds: ['handbook']
        },
        mainlineBoundary: '不產出任何主線路線答案或第二輪證據。',
        rewardBinding: { kind: SideStoryRewardKind.HANDBOOK_FUNCTION, id: 'uncertainty_filter', role: '依「未看見、未找到、尚未證明」篩選既有紀錄；主線必需的來源與證據範圍始終預設可見。' },
        resourceNeeds: { newSystemHooks: ['handbook_uncertainty_filter'] }
    }),
    story({
        id: 'ink_that_ran_in_rain',
        title: '雨水走過的字',
        primaryCharacterId: 'town_scholar',
        length: SideStoryLength.MEDIUM,
        prerequisiteStoryIds: ['one_blank_too_many'],
        chapterWindow: [2, 3],
        unlockAfterSceneId: 'ch2_s07_names_return_to_town',
        futureOwner: 'handbook',
        regionLocationIds: ['mist_tablet_hill', 'old_command_post'],
        purpose: '重建一封與英雄無關的撤離家書，讓紙頁重新連回活人的日常。',
        characterReveal: '伊萊不是迷戀歷史真相；他害怕普通人的名字被空白吞掉。',
        tone: '安靜、溫柔，允許一點整理錯字的幽默。',
        stagePlan: [
            { chapter: 2, ownerId: 'mist_tablet_hill', objective: '辨認被雨洗散的家書殘句與貨印。' },
            { chapter: 3, ownerId: 'handbook', objective: '用市場舊帳確認收信人曾安全返城，而不是替空白編結局。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '霧碑丘的濕紙只剩稱呼、貨印與一句沒寫完的回家時間。' },
            { beat: 'resistance', text: '伊萊幾次想依常見格式補句，卻逐一刪掉自己無法證明的溫柔推測。' },
            { beat: 'turn', text: '市集舊帳證明收信人後來曾親自領貨，確認他活著回城，但信中缺字仍沒有答案。' },
            { beat: 'resolution', text: '家書被登記為一次確實抵達的普通通信；伊萊讓缺字留下，不再把完整感誤認成真相。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: { town_scholar: ['neutral', 'guarded', 'soft', 'pleased'] },
            backgroundOwnerIds: ['mist_tablet_hill', 'handbook']
        },
        mainlineBoundary: '家書不含遠征核心、封痕、元素裂片或魔王來源。',
        rewardBinding: { kind: SideStoryRewardKind.HANDBOOK_FUNCTION, id: 'record_cross_reference', role: '百科與手札可互相顯示相關人物、地點和物件來源。' },
        resourceNeeds: { newSystemHooks: ['record_cross_reference'] }
    }),
    story({
        id: 'original_pages_stay_open',
        title: '原頁不必闔上',
        primaryCharacterId: 'town_scholar',
        characterIds: ['town_scholar'],
        length: SideStoryLength.LONG,
        prerequisiteStoryIds: ['ink_that_ran_in_rain'],
        chapterWindow: [3, 5],
        unlockAfterSceneId: 'ch3_s09_temptation_and_orders',
        expireBeforeSceneId: 'ch5_s06_mia_operation',
        futureOwner: 'handbook',
        regionLocationIds: ['old_command_post'],
        purpose: '一批受潮原頁開始發霉，迫使伊萊在「什麼都留下」與「留下可追查的來源」之間做選擇。',
        characterReveal: '他害怕丟棄紙頁等同再次遺棄死者，直到理解保存不等於讓所有東西永遠堆在桌上。',
        tone: '調查、正向成長、帶整理工作的自嘲。',
        stagePlan: [
            { chapter: 3, ownerId: 'old_command_post', objective: '找回可用來辨識發霉頁次的舊索引角。' },
            { chapter: 4, ownerId: 'handbook', objective: '逐頁決定保留原件、建立副本或只留下來源位置，不刪除不確定性。' },
            { chapter: 5, ownerId: 'handbook', objective: '建立能回到原始來源、但容許破損頁離開桌面的索引。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '檔案室受潮，伊萊試圖同時攤開所有發霉原頁，工作桌很快失去可用空間。' },
            { beat: 'resistance', text: '他把丟棄無法辨讀的紙等同再次遺棄死者，寧願讓霉斑繼續擴散也不肯決定。' },
            { beat: 'turn', text: '舊指揮所的索引角證明保存來源位置不等於保存每一張腐爛紙；玩家協助分開原件、可靠副本與僅存索引。' },
            { beat: 'resolution', text: '部分破損頁終於離開桌面，但每個可追查來源仍在；伊萊第一次在沒有完成全部工作的情況下闔上檔案室門。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: { town_scholar: ['neutral', 'guarded', 'afraid', 'grieving', 'soft'] },
            backgroundOwnerIds: ['old_command_post', 'handbook']
        },
        mainlineBoundary: '不得討論安全摘要、交會元素、棘輪鉗、封痕碎片或任何第二輪救援流程。',
        rewardBinding: { kind: SideStoryRewardKind.HANDBOOK_FUNCTION, id: 'open_source_index', role: '怪物、素材與裝備頁面顯示已發現的原始來源鏈。' },
        resourceNeeds: { newSystemHooks: ['open_source_index'] }
    }),

    // Mia
    story({
        id: 'afternoon_without_case',
        title: '沒有病歷的下午',
        primaryCharacterId: 'herbalist',
        length: SideStoryLength.SHORT,
        chapterWindow: [2, 2],
        unlockAfterSceneId: 'ch2_s02_name_under_basket',
        futureOwner: 'mia_workroom',
        purpose: '讓玩家陪米婭完成沒有病人的普通工作，並看見她如何替休息發明更多工作。',
        characterReveal: '她的溫柔與幽默可以出現在無危機的日常，但她不會把自己列入需要照顧的人。',
        tone: '明亮、親密、帶輕微笨拙。',
        stagePlan: [
            { chapter: 2, ownerId: 'mia_workroom', objective: '整理乾葉、清空一張椅子，最後說服她一起坐下喝完水。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '工作室難得沒有病人，主角來訪時米婭卻立刻找出一籃乾葉當作必須現在完成的工作。' },
            { beat: 'resistance', text: '每完成一件事，她就發現下一件，甚至把休息用的椅子拿來堆空瓶。' },
            { beat: 'turn', text: '主角清空椅子並把她平常推給病人的水推回去；米婭一時找不到可以拒絕的醫療理由。' },
            { beat: 'resolution', text: '兩人坐著喝完已經不熱的水，談的只是葉子、天氣與一個沒有病歷的下午。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: { herbalist: ['neutral', 'guarded', 'pleased', 'soft'] },
            backgroundOwnerIds: ['mia_workroom']
        },
        mainlineBoundary: '沒有四象裂片、手術工具、救援素材或死亡替代條件。',
        rewardBinding: { kind: SideStoryRewardKind.ORDINARY_SUPPLIES, id: 'mia_sorted_first_aid_bundle', role: '整理工作剩下的少量既有急救補給；不控制任何基礎藥品上架。' },
        resourceNeeds: {}
    }),
    story({
        id: 'window_that_did_not_open',
        title: '沒有打開的窗',
        primaryCharacterId: 'herbalist',
        characterIds: ['herbalist', 'town_scholar'],
        length: SideStoryLength.MEDIUM,
        prerequisiteStoryIds: ['afternoon_without_case'],
        chapterWindow: [2, 4],
        unlockAfterSceneId: 'ch2_s07_names_return_to_town',
        futureOwner: 'mia_workroom',
        purpose: '透過工作室二十年未變的位置，理解父母死後米婭停住的時間；第一輪只容許新的生活靠近，不能提前打開第二輪才會開啟的窗。',
        characterReveal: '她想和主角走向未來，卻仍把改動母親留下的位置視為背叛；此時她只能接受新增，而不能接受移動。',
        tone: '溫柔、哀傷，結尾有很小的正面改變，但刻意保留尚未跨過的門檻。',
        stagePlan: [
            { chapter: 2, ownerId: 'mia_workroom', objective: '找出窗扣並未損壞；真正擋住窗的是母親留下、從未移位的藥架。' },
            { chapter: 3, ownerId: 'market', objective: '從公開貨源取得另一座小型乾燥架材料，不把工作室變成商店。' },
            { chapter: 4, ownerId: 'mia_workroom', objective: '不移動舊陳設，在門邊裝上一座屬於現在的新乾燥架；窗仍保持關閉。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '乾燥架開始受潮，窗扣其實完好，真正擋住窗的是母親留下、二十年沒有換位的藥架。' },
            { beat: 'resistance', text: '米婭願意檢查每個零件，卻拒絕移動任何舊位置；她寧願承認房間不好用，也無法承認自己害怕改動。' },
            { beat: 'turn', text: '伊萊帶來父親名下的一則普通採購紀錄，證明父母也曾替生活添置新東西；這沒有迫使她搬動舊架，只讓「新增」不再等同背叛。' },
            { beat: 'resolution', text: '主角在門邊裝上一座新的小乾燥架，舊陳設與窗都沒有移動。第一輪的她只允許現在靠近一步；第二輪才真正打開窗。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: {
                herbalist: ['neutral', 'guarded', 'grieving', 'soft'],
                town_scholar: ['neutral', 'guarded', 'soft']
            },
            backgroundOwnerIds: ['mia_workroom', 'market']
        },
        mainlineBoundary: '第一輪不得打開窗或移動母親留下的舊陳設；不提供任何手術解法。',
        rewardBinding: { kind: SideStoryRewardKind.UNIQUE_CONSUMABLE, id: 'returning_season_tea', role: '由市集販售的疲勞恢復飲品，配方來自米婭研究。' },
        resourceNeeds: { newItemIds: ['returning_season_tea'], newIconIds: ['returning_season_tea'] }
    }),
    story({
        id: 'return_even_without_a_wound',
        title: '沒有傷也能回來',
        primaryCharacterId: 'herbalist',
        length: SideStoryLength.LONG,
        prerequisiteStoryIds: ['window_that_did_not_open'],
        chapterWindow: [3, 5],
        unlockAfterSceneId: 'ch3_s02_shadows_count_names',
        expireBeforeSceneId: 'ch5_s04_elemental_lord',
        futureOwner: 'mia_workroom',
        purpose: '把主角與米婭的關係從病人與照護者推向願意為彼此留下普通時間的人。',
        characterReveal: '米婭希望主角回來，卻害怕直接承認自己需要的不是下一份病歷。',
        tone: '愛情、生活、克制，不用正式告白完成關係。',
        stagePlan: [
            { chapter: 3, ownerId: 'mia_workroom', objective: '在主線的誠實回報之後，主角隔日沒有傷也再次回來，讓米婭找不到病歷作為談話藉口。' },
            { chapter: 4, ownerId: 'mia_workroom', objective: '在沒有治療工作的晚上留下，替她分裝市集授權藥包。' },
            { chapter: 5, ownerId: 'mia_workroom', objective: '出發前帶兩杯水，不用傷口作為進門理由。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '主線衝突修復後，主角隔日沒有傷也回到工作室；米婭下意識尋找症狀，兩人都發現病歷不再能替他們說明關係。' },
            { beat: 'resistance', text: '米婭用分裝藥包延長工作，主角則用幫忙留下，兩人都在迴避直接承認「希望你在」。' },
            { beat: 'turn', text: '芙蕾事件後，米婭承認每一次離開都像在練習永久失去；主角沒有許下不可能的安全承諾，只承諾不再用沉默替對方決定。' },
            { beat: 'resolution', text: '第五章出發前，桌上出現兩杯水。第一輪它成為最後一段普通時間；第二輪只讓玩家理解這個習慣仍在，不新增或取代第七章主線邀請。' }
        ],
        runPolicy: {
            firstRun: 'available_before_ch5_operation_then_closes_as_last_relationship_record',
            secondRun: 'replays_from_reset_with_pre_operation_two_cup_context_only',
            crossRunPersistence: 'achievement_memory_only'
        },
        performanceNeeds: {
            expressionIdsByActor: { herbalist: ['neutral', 'guarded', 'grieving', 'soft', 'pleased'] },
            backgroundOwnerIds: ['mia_workroom']
        },
        mainlineBoundary: '不能取消或替代四象手術，也不能擁有第二輪第七章的無傷返城邀請；跳過支線仍需讓主線感情、死亡與救援完整成立。',
        rewardBinding: { kind: SideStoryRewardKind.RELATIONSHIP_RECORD, id: 'mia_emergency_prescription', role: '關係紀錄與市集急救藥包授權；兩輪都只保存第五章前的普通相處，不提供結局邀請。' },
        resourceNeeds: { newItemIds: ['mia_emergency_kit'], newIconIds: ['mia_emergency_kit'], newSystemHooks: ['market_mia_emergency_kit'] }
    }),

    // Frey
    story({
        id: 'patrol_soles',
        title: '巡線靴底',
        primaryCharacterId: 'standard_bearer_frey',
        length: SideStoryLength.SHORT,
        chapterWindow: [1, 2],
        unlockAfterSceneId: 'ch1_s05_south_gate_introduction',
        futureOwner: 'gate',
        regionLocationIds: ['south_gate_farmland', 'hunter_boardwalk'],
        purpose: '透過靴底磨痕與巡線口令，讓芙蕾先成為一名具體的工作者。',
        characterReveal: '她不是追求英勇，而是執著讓每個人都看得見方向。',
        tone: '俐落、正面、帶工作競賽感。',
        stagePlan: [
            { chapter: 1, ownerId: 'gate', objective: '依靴底泥痕判斷她今日走過的兩條巡線，補上漏掉的方向牌。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '芙蕾回到南門後先檢查靴底，不是為了清潔，而是在確認今天哪段路改變了泥質。' },
            { beat: 'resistance', text: '兩條巡線留下相似痕跡，玩家若只看目的地就會把倒下的方向牌補反。' },
            { beat: 'turn', text: '芙蕾要求從返程者的視線倒著看標記，讓玩家理解方向牌不是替出發者設計的。' },
            { beat: 'resolution', text: '漏掉的牌被放回能讓最後一列看見的位置；她承認玩家這次沒有只顧著往前。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: { standard_bearer_frey: ['neutral', 'guarded', 'pleased'] },
            backgroundOwnerIds: ['gate', 'south_gate_farmland', 'hunter_boardwalk']
        },
        mainlineBoundary: '不涉及灰脊危機、死亡、後標尺寸或第二輪救援。',
        rewardBinding: { kind: SideStoryRewardKind.ORDINARY_SUPPLIES, id: 'frey_patrol_pack', role: '普通補給與一則可靠的區域方向提示。' },
        resourceNeeds: {}
    }),
    story({
        id: 'flag_cannot_speak_for_lamp',
        title: '旗影不替燈說話',
        primaryCharacterId: 'standard_bearer_frey',
        characterIds: ['standard_bearer_frey', 'lamplighter_tavi'],
        length: SideStoryLength.MEDIUM,
        prerequisiteStoryIds: ['patrol_soles'],
        chapterWindow: [2, 3],
        unlockAfterSceneId: 'ch2_s08_shadow_at_the_checkpoint',
        futureOwner: 'gate',
        regionLocationIds: ['night_watch_line'],
        purpose: '以巡線爭執與熟練默契，表現芙蕾和塔維相知卻不會替對方說出恐懼。',
        characterReveal: '芙蕾相信分工，但常在塔維沉默時擅自把責任一起拿走。',
        tone: '友情、幽默、帶未說破的摩擦。',
        stagePlan: [
            { chapter: 2, ownerId: 'gate', objective: '替兩人重排一條短巡邏線，觀察他們對同一標記的不同理解。' },
            { chapter: 3, ownerId: 'night_watch_line', objective: '在霧裡只依旗影與燈號完成一次不危及主線的巡線演練。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '芙蕾認為旗位已經說得夠清楚，塔維則堅稱看不見旗面時光線才是唯一方向。' },
            { beat: 'resistance', text: '兩人在短巡線上不停替對方補充指令，默契反而讓每個標記都變得重複。' },
            { beat: 'turn', text: '霧起後，玩家必須讓芙蕾只管前標、塔維只管回程燈，任何人越位都會讓路線變得更難讀。' },
            { beat: 'resolution', text: '演練完成，兩人仍互相嫌棄，但第一次承認熟悉對方不等於有權替對方說話。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: {
                standard_bearer_frey: ['neutral', 'guarded', 'pleased'],
                lamplighter_tavi: ['neutral', 'pleased', 'guarded']
            },
            backgroundOwnerIds: ['gate', 'night_watch_line']
        },
        mainlineBoundary: '塔維的遠端尺寸、風擋與明確承諾仍只屬主線。',
        rewardBinding: { kind: SideStoryRewardKind.TRAVEL_FUNCTION, id: 'patrol_marker_readability', role: '已探索路段的方向標記在霧與夜間更清楚。' },
        resourceNeeds: { newSystemHooks: ['patrol_marker_readability'] }
    }),
    story({
        id: 'places_the_flag_cannot_reach',
        title: '旗也有看不見的地方',
        primaryCharacterId: 'standard_bearer_frey',
        characterIds: ['standard_bearer_frey', 'village_elder'],
        length: SideStoryLength.LONG,
        prerequisiteStoryIds: ['flag_cannot_speak_for_lamp'],
        chapterWindow: [3, 4],
        unlockAfterSceneId: 'ch3_s03_lamp_oil_in_fog',
        expireBeforeSceneId: 'ch4_s04_gray_ridge_evacuates',
        futureOwner: 'gate',
        regionLocationIds: ['dead_checkpoint'],
        purpose: '讓芙蕾與村長正面討論「只要旗還看得見，人就能回來」的限度，深化她對上一代的誤解而不重播主線童年迷霧。',
        characterReveal: '她把方向視為對抗恐懼的答案，卻尚未理解道路本身崩毀時，清楚可見的勇氣仍可能無法救人。',
        tone: '世代摩擦、實地驗證與不失明亮的成長。',
        stagePlan: [
            { chapter: 3, ownerId: 'dead_checkpoint', objective: '在旗位仍清楚可見的舊關卡，確認一條已被地形切斷的返程線。' },
            { chapter: 4, ownerId: 'gate', objective: '由村長與芙蕾共同修訂巡線規則，區分「看得見旗」和「道路仍可通行」。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '芙蕾不滿村長因地面回報不完整而縮短巡線，直言只要旗還在，隊伍就不該畏縮。' },
            { beat: 'resistance', text: '她要求在舊關卡實測；旗從入口到終點始終可見，玩家卻在半途遇見已經斷掉、無法靠方向跨越的路床。' },
            { beat: 'turn', text: '村長只說出自己確實知道的人類後果：二十年前的旗與命令沒有突然消失，但看得見方向仍救不了被壓力、火與崩地切開的人。' },
            { beat: 'resolution', text: '芙蕾沒有放棄旗，而是在巡線規則補上路床確認與交接者；她承認方向需要有人維持，也需要一條真的能走回來的路。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: {
                standard_bearer_frey: ['neutral', 'guarded', 'hurt', 'soft', 'pleased'],
                village_elder: ['neutral', 'guarded', 'soft']
            },
            backgroundOwnerIds: ['dead_checkpoint', 'gate']
        },
        mainlineBoundary: '只談人類可觀察的道路失效；不產出灰脊雙標、風擋、遠標尺寸或任何第一輪免死條件。',
        rewardBinding: { kind: SideStoryRewardKind.UNIQUE_ACCESSORY, id: 'old_flag_knot', role: '以練習繩製成的方向、撤離與疲勞管理飾品，不拆取共用巡線旗。' },
        resourceNeeds: { newItemIds: ['old_flag_knot'], newIconIds: ['old_flag_knot'] }
    }),

    // Tavi
    story({
        id: 'lamp_glass_for_every_door',
        title: '每扇門都嫌燈歪',
        primaryCharacterId: 'lamplighter_tavi',
        length: SideStoryLength.SHORT,
        chapterWindow: [1, 2],
        unlockAfterSceneId: 'ch1_s05_south_gate_introduction',
        futureOwner: 'gate',
        purpose: '讓塔維替居民修幾盞根本不歸巡線人管的燈，展現樂觀和過度答應的習慣。',
        characterReveal: '他的幽默是真性格，也是一種避免承認自己已經太累的方法。',
        tone: '正面、生活喜劇。',
        stagePlan: [
            { chapter: 1, ownerId: 'gate', objective: '找回三個錯放的燈罩扣，聽塔維替每扇門編不同理由。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '三戶居民都說自己的門燈最急，塔維則聲稱每盞燈都只是角度「稍微有個性」。' },
            { beat: 'resistance', text: '找回的燈罩扣尺寸不同，他為了不承認記錯而替每扇門編出愈來愈荒唐的用途。' },
            { beat: 'turn', text: '真正的問題只是塔維把自己的備用扣分給所有人，導致巡線燈反而沒有零件。' },
            { beat: 'resolution', text: '居民燈與巡線燈都被重新分配；塔維接受不是每件事都需要他偷偷多做一份。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: { lamplighter_tavi: ['neutral', 'pleased', 'guarded', 'soft'] },
            backgroundOwnerIds: ['gate']
        },
        mainlineBoundary: '不涉及霧中童年、後標恐懼或灰脊救援。',
        rewardBinding: { kind: SideStoryRewardKind.ORDINARY_SUPPLIES, id: 'field_lamp_refill', role: '既有旅途燈油補給。' },
        resourceNeeds: {}
    }),
    story({
        id: 'counting_when_no_one_listens',
        title: '沒人聽時也要報數',
        primaryCharacterId: 'lamplighter_tavi',
        length: SideStoryLength.MEDIUM,
        prerequisiteStoryIds: ['lamp_glass_for_every_door'],
        chapterWindow: [2, 3],
        unlockAfterSceneId: 'ch2_s08_shadow_at_the_checkpoint',
        futureOwner: 'gate',
        regionLocationIds: ['night_watch_line'],
        purpose: '玩家陪塔維走一段無人的回程線，理解他為什麼即使獨自一人也會報數。',
        characterReveal: '報數不是可愛口癖，而是他在看不見任何人時維持位置與呼吸的方法。',
        tone: '先輕鬆，逐漸安靜，最後仍保留他的明亮。',
        stagePlan: [
            { chapter: 2, ownerId: 'gate', objective: '修復一盞不影響主線的回程燈。' },
            { chapter: 3, ownerId: 'night_watch_line', objective: '在彎道自然隔絕聲音的短路段，用固定燈號陪他完成一次報數。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '塔維修燈時始終輕聲報數，即使附近根本沒有隊伍回應。' },
            { beat: 'resistance', text: '他把原因說成檢查燈油節奏；玩家轉過彎道後聲音自然傳不回來，他仍立刻亂掉拍子。' },
            { beat: 'turn', text: '隔音彎道讓他承認，報數最初是為了確認自己還沒有被留在最後方；玩家沒有設局，只是第一次看見聲音消失後的反應。' },
            { beat: 'resolution', text: '兩人約定每輪結束以一次普通燈號表示位置。塔維完成巡線，也保留自己的報數節奏；這不是灰脊遠標或風擋方案。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: { lamplighter_tavi: ['neutral', 'pleased', 'afraid', 'soft'] },
            backgroundOwnerIds: ['gate', 'night_watch_line']
        },
        mainlineBoundary: '不讓他提前說出灰脊核心恐懼，也不建立風擋尺寸。',
        rewardBinding: { kind: SideStoryRewardKind.TRAVEL_FUNCTION, id: 'rear_light_camp_bonus', role: '已點亮營地的疲勞恢復功能得到非數值性的強化入口，數值後定。' },
        resourceNeeds: { newSystemHooks: ['rear_light_camp_bonus'] }
    }),
    story({
        id: 'last_light_is_a_position',
        title: '最後一盞也是位置',
        primaryCharacterId: 'lamplighter_tavi',
        characterIds: ['lamplighter_tavi', 'standard_bearer_frey'],
        length: SideStoryLength.LONG,
        prerequisiteStoryIds: ['counting_when_no_one_listens'],
        chapterWindow: [3, 4],
        unlockAfterSceneId: 'ch3_s03_lamp_oil_in_fog',
        expireBeforeSceneId: 'ch4_s04_gray_ridge_evacuates',
        futureOwner: 'gate',
        regionLocationIds: ['night_watch_line'],
        purpose: '從塔維視角補足幼年迷霧與長年守最後方的孤獨，讓他的害怕被理解而非治癒。',
        characterReveal: '他想證明自己不拖累人，所以最難說出口的恰好是「我需要你知道我害怕」。',
        tone: '友情、脆弱與尚未完成的承認，不把第一次失敗寫成笑話。',
        stagePlan: [
            { chapter: 3, ownerId: 'night_watch_line', objective: '找出一盞被他刻意放得太近的舊燈位。' },
            { chapter: 4, ownerId: 'gate', objective: '塔維向主角承認最後方不是次要位置，卻仍無法把真正的依賴親口告訴芙蕾。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '守夜線有一盞舊燈比規格靠前，塔維堅稱只是前任測量失誤。' },
            { beat: 'resistance', text: '每次嘗試把燈移回正確位置，他都用玩笑拖延，因為那裡正是幼年迷霧中最後一次看見前隊的距離。' },
            { beat: 'turn', text: '塔維承認自己成為點燈人，不是因為不怕最後方，而是想讓下一個孩子不必在那裡猜人還在不在。' },
            { beat: 'resolution', text: '燈被移回正確位置。塔維對主角說自己會告訴芙蕾，真正見到她時卻只交代燈位已修正；玩家理解了他，第一輪的他仍沒有跨過那一步。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: {
                lamplighter_tavi: ['neutral', 'pleased', 'afraid', 'grieving', 'soft'],
                standard_bearer_frey: ['neutral', 'guarded', 'soft']
            },
            backgroundOwnerIds: ['night_watch_line', 'gate']
        },
        mainlineBoundary: '第一輪支線必須保留他沒能向芙蕾說出口的失敗；不能替代第二輪主線告白、測量遠標或完成風擋。',
        rewardBinding: { kind: SideStoryRewardKind.UNIQUE_ACCESSORY, id: 'rear_lamp_clasp', role: '營地、霧區與回程管理取向的獨特飾品。' },
        resourceNeeds: { newItemIds: ['rear_lamp_clasp'], newIconIds: ['rear_lamp_clasp'] }
    }),

    // Blacksmith
    story({
        id: 'pot_lid_is_not_a_shield',
        title: '鍋蓋不是盾',
        primaryCharacterId: 'blacksmith',
        length: SideStoryLength.SHORT,
        chapterWindow: [1, 2],
        unlockAfterSceneId: 'ch1_s08_cold_forge_smoke',
        futureOwner: 'forge',
        purpose: '一只曾被居民拿來擋碎石的鍋蓋回到爐邊，鐵匠一面嘲笑它不是盾，一面把每道凹痕修好。',
        characterReveal: '他會先罵器物使用方式，再從痕跡精確說出它保住了誰；粗硬玩笑就是他的照顧語言。',
        tone: '正面、粗口式幽默、熱鬧。',
        stagePlan: [
            { chapter: 1, ownerId: 'forge', objective: '找出鍋蓋三處受力痕跡，協助鐵匠修回能正常煮飯的形狀。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '一只凹得像盾的鍋蓋被送進爐邊，鐵匠先罵使用者，再逐道辨認碎石撞擊。' },
            { beat: 'resistance', text: '玩家若只把它敲平會讓裂口擴大，鐵匠要求先理解每道凹痕保住了哪個方向。' },
            { beat: 'turn', text: '最深的凹痕不是戰鬥留下，而是居民用它遮住共用水桶時承受的落石。' },
            { beat: 'resolution', text: '鍋蓋重新能蓋鍋，鐵匠拒絕把它掛成紀念品，說城鎮需要的是晚餐而不是第二面盾。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: { blacksmith: ['neutral', 'pleased', 'guarded', 'soft'] },
            backgroundOwnerIds: ['forge']
        },
        mainlineBoundary: '只以普通鍋蓋預示他的民生價值；不提前執行第四章修理長隊取捨，也不解鎖必需鍛造階段或 Boss 對策。',
        rewardBinding: { kind: SideStoryRewardKind.FORGE_FUNCTION, id: 'one_free_repair', role: '一次免費普通維修，不提供永久戰力。' },
        resourceNeeds: { newSystemHooks: ['one_free_repair_token'] }
    }),
    story({
        id: 'things_never_collected',
        title: '沒人領走的東西',
        primaryCharacterId: 'blacksmith',
        length: SideStoryLength.MEDIUM,
        prerequisiteStoryIds: ['pot_lid_is_not_a_shield'],
        chapterWindow: [2, 4],
        unlockAfterSceneId: 'ch2_s07_names_return_to_town',
        futureOwner: 'forge',
        purpose: '整理長年沒被取走的旗扣、護具和生活器物，讓鐵匠的失落從物件而非演說出現。',
        characterReveal: '他能修好器物，卻無法接受物件回來而主人沒有。',
        tone: '懷念、粗糙溫柔，結尾讓一件普通物品重新被使用。',
        stagePlan: [
            { chapter: 2, ownerId: 'forge', objective: '分辨哪些東西能退料、哪些必須等待主人。' },
            { chapter: 3, ownerId: 'market', objective: '找到一件舊門扣真正所屬的公共建築。' },
            { chapter: 4, ownerId: 'forge', objective: '把門扣裝回去，而不是把它熔成武器。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '爐後堆著沒人領走的旗扣、護具與門件，鐵匠每次清理都只把它們移到另一個角落。' },
            { beat: 'resistance', text: '他願意退掉無名金屬，卻能從磨損認出每件有主人的東西，因而拒絕承認等待已經沒有期限。' },
            { beat: 'turn', text: '一枚被當成護具扣的零件其實屬於公共糧門；物件沒有等失蹤主人，而是一直在等城鎮重新使用。' },
            { beat: 'resolution', text: '門扣被裝回公共建築，鐵匠保留其他仍有姓名的物件，也第一次允許一件東西離開等待堆。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: { blacksmith: ['neutral', 'guarded', 'grieving', 'soft'] },
            backgroundOwnerIds: ['forge', 'market']
        },
        mainlineBoundary: '不使用芙蕾死亡遺物、米婭手術工具或任何主線必需器材。',
        rewardBinding: { kind: SideStoryRewardKind.UNIQUE_ACCESSORY, id: 'returned_buckle', role: '以修門剩料仿製的小型扣件，偏耐久與裝備維護；公共糧門原件留在原處。' },
        resourceNeeds: { newItemIds: ['returned_buckle'], newIconIds: ['returned_buckle'] }
    }),
    story({
        id: 'forge_is_not_only_for_blades',
        title: '爐火不只為刀刃',
        primaryCharacterId: 'blacksmith',
        characterIds: ['blacksmith', 'herbalist', 'lamplighter_tavi'],
        length: SideStoryLength.LONG,
        prerequisiteStoryIds: ['things_never_collected'],
        chapterWindow: [3, 5],
        unlockAfterSceneId: 'ch3_s09_temptation_and_orders',
        expireBeforeSceneId: 'ch5_s04_elemental_lord',
        futureOwner: 'forge',
        purpose: '主線已證明鐵匠會把民生排在武器前；支線追蹤這個選擇造成的修理長隊，並讓他學會把工作交給別人。',
        characterReveal: '他用工作照顧所有人，卻不願承認自己也害怕失敗，需要別人分擔測試與決定。',
        tone: '熱鬧、正向、逐步轉為真誠。',
        stagePlan: [
            { chapter: 3, ownerId: 'forge', objective: '建立不由鐵匠一人記在腦中的公共修理長隊。' },
            { chapter: 4, ownerId: 'gate', objective: '主線民生優先決定後，實地確認修好的配件並把返工交回不同使用者。' },
            { chapter: 5, ownerId: 'forge', objective: '讓米婭檢查返程護具的身體受力、塔維檢查行走與掛燈干涉，迫使鐵匠接受使用者分工。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '鐵匠把整條修理長隊記在腦中，任何人問進度都只能得到一句不耐煩的「我知道」。' },
            { beat: 'resistance', text: '武器、燈框、藥架與民生配件同時返工，他仍拒絕寫下或分派，因為每件失敗都像自己的責任。' },
            { beat: 'turn', text: '主線民生優先決定後，玩家把實際使用者帶回檢查；塔維和米婭指出只有他們能看見的使用問題。' },
            { beat: 'resolution', text: '修理長隊改成公開分工，鐵匠仍做最難的部分，卻不再假裝一雙手能替整座城鎮承擔所有失敗。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: {
                blacksmith: ['neutral', 'angry', 'guarded', 'soft', 'pleased'],
                herbalist: ['neutral', 'guarded', 'pleased'],
                lamplighter_tavi: ['neutral', 'pleased', 'guarded']
            },
            backgroundOwnerIds: ['forge', 'gate']
        },
        mainlineBoundary: '不提供四象裂片工具、救米婭的方法或主線鍛造解鎖。',
        rewardBinding: { kind: SideStoryRewardKind.FORGE_FUNCTION, id: 'homebound_reinforcement', role: '可選防具耐久／撤退取向強化，不高於章節特殊裝備。' },
        resourceNeeds: { newItemIds: ['homebound_reinforcement_blueprint'], newIconIds: ['homebound_reinforcement_blueprint'], newSystemHooks: ['optional_armor_reinforcement'] }
    }),

    // Ailo
    story({
        id: 'useless_things',
        title: '沒有用的東西',
        primaryCharacterId: 'street_beggar',
        length: SideStoryLength.SHORT,
        chapterWindow: [2, 3],
        unlockAfterSceneId: 'ch2_s01_empty_crates',
        futureOwner: 'crossroads',
        purpose: '讓玩家幫艾洛撿回真正的垃圾，從每次都會改變的分類看見受傷記憶如何把情感暫時附著在任何廢物上。',
        characterReveal: '他不是故弄玄虛，也沒有藏著固定信物；今天被他珍惜的垃圾，明天可能就失去意義。',
        tone: '古怪、生活、偶爾好笑，不把他寫成笑話。',
        stagePlan: [
            { chapter: 2, ownerId: 'crossroads', objective: '把散落垃圾逐件遞回，觀察他的分類如何隨一句破碎記憶改變。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '艾洛的袋子裂開，布條、枯草、破木與瓶塞散滿地；他先護住一塊破木，轉眼又說那只是會咬人的門。' },
            { beat: 'resistance', text: '玩家按用途分類時，他不斷改變每件垃圾代表的東西，沒有一套能被破解或重複驗證的順序。' },
            { beat: 'turn', text: '一塊稍早被他稱作「她的杯子」的木片被風吹走，他沒有追，只改把一截布條放到原本的位置；情感是真的，物件不是信物。' },
            { beat: 'resolution', text: '袋口被重新綁好。艾洛把大半垃圾收回、幾件隨手丟掉，仍對其中一件輕聲道歉；玩家只留下生活觀察，不取得物件。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: { street_beggar: ['neutral', 'guarded', 'angry', 'soft'] },
            backgroundOwnerIds: ['crossroads']
        },
        mainlineBoundary: '不出現妮露姓名、回聲哨、舊山路方向或白花真義。',
        rewardBinding: { kind: SideStoryRewardKind.RELATIONSHIP_RECORD, id: 'ailo_scrap_memory', role: '人物紀錄新增一段無解釋的生活觀察。' },
        resourceNeeds: {}
    }),
    story({
        id: 'one_portion_left_over',
        title: '總要多留一份',
        primaryCharacterId: 'street_beggar',
        length: SideStoryLength.MEDIUM,
        prerequisiteStoryIds: ['useless_things'],
        chapterWindow: [2, 4],
        unlockAfterSceneId: 'ch2_s07_names_return_to_town',
        futureOwner: 'crossroads',
        purpose: '透過城鎮分食讓玩家看見艾洛總會替缺席的人多留一份，卻已說不清那個人是誰。',
        characterReveal: '他的記憶會錯置物件與時間，但照顧另一個人的身體習慣仍殘留在手上。',
        tone: '生活、溫柔、略帶尷尬幽默，不提供可解碼的主線線索。',
        stagePlan: [
            { chapter: 2, ownerId: 'market', objective: '替城鎮分裝普通餐食，注意艾洛每次都把自己的份量拆成兩份。' },
            { chapter: 3, ownerId: 'crossroads', objective: '把沒有被取走的一份交還給他，不替缺席者命名。' },
            { chapter: 4, ownerId: 'crossroads', objective: '在他忘記預留時仍多放一只空碗，觀察他是否接受。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '城鎮分食時，艾洛把自己的麵包與湯都分成兩份，一份留在身旁的空位。' },
            { beat: 'resistance', text: '有人催他趁熱吃完，他卻用三種互相矛盾的稱呼解釋空位，最後連自己也不記得在等誰。' },
            { beat: 'turn', text: '隔天他忘了分食，主角仍多放一只空碗；艾洛先嘲笑碗不會餓，然後把較完整的一半推過去。' },
            { beat: 'resolution', text: '食物最後仍由艾洛吃完，空位沒有變成祭壇或線索。玩家理解他曾長期習慣先照顧另一個人，但不知道姓名與故事。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: { street_beggar: ['neutral', 'guarded', 'soft', 'pleased'] },
            backgroundOwnerIds: ['market', 'crossroads']
        },
        mainlineBoundary: '不出現白花、妮露、山村、回聲哨或任何能辨認缺席者的固定物件。',
        rewardBinding: { kind: SideStoryRewardKind.RELATIONSHIP_RECORD, id: 'ailo_shared_meal', role: '人物紀錄新增一則日常觀察；沒有可攜道具。' },
        resourceNeeds: {}
    }),
    story({
        id: 'one_night_under_the_eaves',
        title: '屋簷下的一晚',
        primaryCharacterId: 'street_beggar',
        length: SideStoryLength.LONG,
        prerequisiteStoryIds: ['one_portion_left_over'],
        chapterWindow: [4, 6],
        unlockAfterSceneId: 'ch4_s09_four_elements_one_report',
        expireBeforeSceneId: 'ch6_s08_brush_past_or_invitation',
        futureOwner: 'crossroads',
        purpose: '讓城鎮試著替艾洛保留一處臨時遮蔽，理解接受照顧不等於恢復記憶，也不把垃圾與瘋話變成謎底。',
        characterReveal: '他渴望有人替自己留位置，卻無法把現在任何地方和記憶中的「回去」穩定連在一起。',
        tone: '正向照顧、反覆退縮、帶一點不好意思承認舒服的幽默。',
        stagePlan: [
            { chapter: 4, ownerId: 'crossroads', objective: '在不拿走袋子、不要求固定作息的前提下，整理一處能避雨的角落。' },
            { chapter: 5, ownerId: 'crossroads', objective: '接受他數次離開又返回，不把使用遮蔽寫成服從或康復。' },
            { chapter: 6, ownerId: 'crossroads', objective: '讓艾洛自己決定是否在離開城鎮前完整睡過一晚。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '連日下雨後，城鎮替艾洛清出一處靠近街口的乾燥角落；他看過位置，仍說那不是「回去的地方」。' },
            { beat: 'resistance', text: '他反覆把袋子搬進去又拖出來，還替漏雨處取荒唐名字；玩家不能丟垃圾、規定作息或把留宿當成服從。' },
            { beat: 'turn', text: '第五章夜裡，主角只在角落留下中篇曾使用的空碗與乾布，沒有守著勸說。艾洛離開數次後，第一次自己走回被保留的位置。' },
            { beat: 'resolution', text: '第六章前，他完整睡過一晚，醒來便嘲笑這地方連屋子都算不上。第一輪他仍會獨自離城；這一晚只證明他曾短暫接受活人的照顧。' }
        ],
        runPolicy: {
            firstRun: 'available_before_ailo_disappearance_then_closes_without_explanation',
            secondRun: 'replays_from_reset_with_recognized_object_context_but_no_route_skip',
            crossRunPersistence: 'achievement_memory_only'
        },
        performanceNeeds: {
            expressionIdsByActor: { street_beggar: ['neutral', 'guarded', 'grieving', 'afraid', 'soft', 'pleased'] },
            backgroundOwnerIds: ['crossroads']
        },
        mainlineBoundary: '不把垃圾變成舊家遺物，也不指明回聲哨、舊路、妮露、白花或第一輪偷竊時點。',
        rewardBinding: { kind: SideStoryRewardKind.ACHIEVEMENT, id: 'one_night_was_enough', role: '只留下城鎮人際紀錄與成就；不給物質獎勵。' },
        resourceNeeds: {}
    }),

    // Vesper
    story({
        id: 'price_before_name',
        title: '先看價碼，再問名字',
        primaryCharacterId: 'casino_owner',
        length: SideStoryLength.SHORT,
        chapterWindow: [3, 3],
        unlockAfterSceneId: 'ch3_s04_showcase_glass',
        futureOwner: 'casino',
        purpose: '讓玩家看見維斯珀如何先讀裝備、傷勢與猶豫，再選擇稱呼與誘惑。',
        characterReveal: '他的禮貌不是魅力，而是一套把人估價的程序。',
        tone: '不安、尖銳，允許玩家短暫享受看穿他的快感。',
        stagePlan: [
            { chapter: 3, ownerId: 'casino', objective: '檢視三個展示櫃，觀察維斯珀如何依玩家目前缺口改變推銷順序。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '維斯珀不先問主角姓名，而是依磨損裝備、藥水數量與停留目光調整展示櫃順序。' },
            { beat: 'resistance', text: '每次玩家移開視線，他就換上更貼近當前缺口的說法，始終宣稱只是提供選擇。' },
            { beat: 'turn', text: '主角故意在不需要的展品前停留，維斯珀第一次判斷錯誤，卻立刻把錯誤包裝成免費娛樂。' },
            { beat: 'resolution', text: '他終於詢問姓名，不是出於尊重，而是要把新的觀察寫進顧客紀錄；玩家看見禮貌背後的估價程序。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: { casino_owner: ['neutral', 'pleased', 'guarded'] },
            backgroundOwnerIds: ['casino']
        },
        mainlineBoundary: '不揭露灌鉛骰子、空白抵契條款或最終反噬。',
        rewardBinding: { kind: SideStoryRewardKind.ORDINARY_SUPPLIES, id: 'showcase_sample_tickets', role: '少量賭場票券；不包含展示櫃大獎。' },
        resourceNeeds: {}
    }),
    story({
        id: 'every_desire_has_a_table',
        title: '每種渴望都有一張桌',
        primaryCharacterId: 'casino_owner',
        characterIds: ['casino_owner', 'casino_dealer'],
        length: SideStoryLength.MEDIUM,
        prerequisiteStoryIds: ['price_before_name'],
        chapterWindow: [3, 5],
        unlockAfterSceneId: 'ch3_s09_temptation_and_orders',
        futureOwner: 'casino',
        purpose: '透過三次不同桌面陳列，展示維斯珀如何對力量、救命與失而復得分別下餌。',
        characterReveal: '他不相信所有人有同一種弱點；控制力來自願意耐心尋找每個人的缺口。',
        tone: '誘惑、黑色幽默、令人厭惡但具可讀性。',
        stagePlan: [
            { chapter: 3, ownerId: 'casino', objective: '觀看力量桌，不必下注也能完成觀察。' },
            { chapter: 4, ownerId: 'casino', objective: '觀看救命桌，洛恩首次對展示順序遲疑。' },
            { chapter: 5, ownerId: 'casino', objective: '觀看失而復得桌，拒絕或下注只改變台詞，不改主線因果。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '維斯珀依章節把同一張桌改造成力量、救命與失而復得三種誘惑，獎品本身不必改變。' },
            { beat: 'resistance', text: '他讓玩家自己說出缺少什麼，再把回答換算成可接受的損失；洛恩只負責準確陳列。' },
            { beat: 'turn', text: '救命桌出現時，洛恩在放置抵押格前停頓，維斯珀卻把這份遲疑也解釋成賭局的戲劇效果。' },
            { beat: 'resolution', text: '第三張桌證明維斯珀從不相信單一誘惑；玩家可拒絕或下注，但得到的核心認識都是他如何利用渴望，而非新的主線證據。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: {
                casino_owner: ['neutral', 'pleased', 'guarded'],
                casino_dealer: ['neutral', 'guarded', 'afraid']
            },
            backgroundOwnerIds: ['casino']
        },
        mainlineBoundary: '不提供作弊證據、客方骰規則、維斯珀逃跑路線或契約反擊方案。',
        rewardBinding: { kind: SideStoryRewardKind.CASINO_FUNCTION, id: 'odds_history_view', role: '開放獎池歷史與公開機率比較，不提高中獎率。' },
        resourceNeeds: { newSystemHooks: ['casino_odds_history_view'] }
    }),
    story({
        id: 'house_never_loses_by_accident',
        title: '莊家從不靠意外',
        primaryCharacterId: 'casino_owner',
        characterIds: ['casino_owner', 'casino_dealer', 'merchant'],
        length: SideStoryLength.LONG,
        prerequisiteStoryIds: ['every_desire_has_a_table'],
        chapterWindow: [4, 6],
        unlockAfterSceneId: 'ch4_s09_four_elements_one_report',
        expireBeforeSceneId: 'ch6_s06_settlement_throw',
        futureOwner: 'casino',
        purpose: '沿著公開獎率、採購變化與早期賭桌痕跡，確認維斯珀在接觸超自然抵契以前就已主動設計剝削。',
        characterReveal: '契約放大了他的控制力，卻沒有創造他的邪惡；他從一開始就選擇讓退出比下注困難。',
        tone: '調查、厭惡、制度性邪惡。',
        stagePlan: [
            { chapter: 4, ownerId: 'market', objective: '比對賭場公開採購與獎率變化，找出他刻意縮小兌回出口的時期。' },
            { chapter: 5, ownerId: 'casino', objective: '查看契約出現前的舊桌規則，確認操控早已存在。' },
            { chapter: 6, ownerId: 'casino', objective: '從舊桌改造痕跡確認維斯珀早在契約前就會操控器具。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '商人保存的公開採購顯示，賭場早年曾同時擴大展示櫃、縮小兌回窗口。' },
            { beat: 'resistance', text: '維斯珀把一切稱為營運改善，並邀請主角用新的高風險桌證明自己只是輸不起。' },
            { beat: 'turn', text: '契約出現前的舊規則已包含拖延兌回、輪替器具與不對稱離桌條款，證明超自然力量只放大既有選擇。' },
            { beat: 'resolution', text: '玩家得到進入高風險獎池的憑證，也更加清楚接受誘惑並不會替維斯珀洗去責任；主線仍需另一條證據鏈處理他。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: {
                casino_owner: ['neutral', 'pleased', 'guarded', 'angry'],
                casino_dealer: ['neutral', 'guarded'],
                merchant: ['neutral', 'guarded']
            },
            backgroundOwnerIds: ['market', 'casino']
        },
        mainlineBoundary: '不能取得灌鉛骰子、空白抵契、見證條款或反噬勝法。',
        rewardBinding: { kind: SideStoryRewardKind.CASINO_FUNCTION, id: 'house_invitation_chip', role: '開放非主線高風險獎池的入場憑證，不得兌換展示櫃最終大獎。' },
        resourceNeeds: { newItemIds: ['house_invitation_chip'], newIconIds: ['house_invitation_chip'], newSystemHooks: ['casino_high_risk_pool_access'] }
    }),

    // Lorne
    story({
        id: 'hands_that_know_the_dice',
        title: '認得骰子的手',
        primaryCharacterId: 'casino_dealer',
        length: SideStoryLength.SHORT,
        chapterWindow: [3, 3],
        unlockAfterSceneId: 'ch3_s04_showcase_glass',
        futureOwner: 'casino',
        purpose: '讓洛恩示範公開、公平的驗骰程序，同時讓玩家注意他在客方骰盒前的一瞬停頓。',
        characterReveal: '他熟悉正確規則，也正因如此更清楚自己參與了什麼。',
        tone: '技術性、壓抑、帶一點桌面手藝的趣味。',
        stagePlan: [
            { chapter: 3, ownerId: 'casino', objective: '完成一次不下注的驗骰教學，辨識磨損但不取得作弊證據。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '洛恩用一組公開練習骰示範稱重、旋轉與桌面檢查，每一步都比賭場宣傳更誠實。' },
            { beat: 'resistance', text: '玩家問起客方骰盒時，他的手停了一瞬，隨即退回只談磨損與流程的安全回答。' },
            { beat: 'turn', text: '一顆正常但磨損不均的骰子讓玩家理解「看起來可疑」和「可證明作弊」的差別。' },
            { beat: 'resolution', text: '洛恩讓玩家完成公平驗骰，卻親手把客方盒鎖回櫃中；他的知識與共犯位置同時成立。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: { casino_dealer: ['neutral', 'guarded', 'afraid'] },
            backgroundOwnerIds: ['casino']
        },
        mainlineBoundary: '停頓不能讓玩家提前取得灌鉛骰子或指控維斯珀。',
        rewardBinding: { kind: SideStoryRewardKind.ORDINARY_SUPPLIES, id: 'dealer_practice_tickets', role: '少量練習票券與賭局操作教學完成標記。' },
        resourceNeeds: {}
    }),
    story({
        id: 'night_without_betting',
        title: '不下注的夜晚',
        primaryCharacterId: 'casino_dealer',
        characterIds: ['casino_dealer', 'casino_owner'],
        length: SideStoryLength.MEDIUM,
        prerequisiteStoryIds: ['hands_that_know_the_dice'],
        chapterWindow: [4, 5],
        unlockAfterSceneId: 'ch4_s09_four_elements_one_report',
        futureOwner: 'casino',
        purpose: '洛恩幫一位不需立繪的無名客人帶回尚未抵押的東西，維斯珀把未成交視為浪費。',
        characterReveal: '洛恩仍先求自保，但已開始用很小、很不英雄的方式阻止下一筆傷害。',
        tone: '克制、緊張，結尾留下微小正面行動。',
        stagePlan: [
            { chapter: 4, ownerId: 'casino', objective: '不驚動維斯珀地把一件尚未登記的抵押退回出口。' },
            { chapter: 5, ownerId: 'casino', objective: '洛恩承認自己只敢救下這一件，而且不要求被稱為好人。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '一名始終留在背景的客人把最後一件私物放上桌，卻在登記前失去繼續下注的勇氣。' },
            { beat: 'resistance', text: '維斯珀把未成交視為浪費，洛恩只能利用換桌與清點間隙讓物件離開公開樓面。' },
            { beat: 'turn', text: '玩家替物件走完最後一段路時，洛恩沒有跟上；他承認自己只敢把規則推開一條縫，仍優先留在能活命的位置。' },
            { beat: 'resolution', text: '物件回到客人手中。洛恩不接受感謝，也不把一次小救援當成抵銷多年共犯行為。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: {
                casino_dealer: ['neutral', 'guarded', 'afraid', 'soft'],
                casino_owner: ['neutral', 'pleased', 'guarded']
            },
            backgroundOwnerIds: ['casino']
        },
        mainlineBoundary: '無名客人不提供新角色形象，也不持有主線證據或契約解法。',
        rewardBinding: { kind: SideStoryRewardKind.CASINO_FUNCTION, id: 'voluntary_cashout', role: '每次進入賭場可清楚看到離桌與兌回入口；不改賭率。' },
        resourceNeeds: { newSystemHooks: ['casino_voluntary_cashout'] }
    }),
    story({
        id: 'blank_line_in_the_ledger',
        title: '總帳上的空白列',
        primaryCharacterId: 'casino_dealer',
        characterIds: ['casino_dealer', 'town_scholar', 'merchant'],
        length: SideStoryLength.LONG,
        prerequisiteStoryIds: ['night_without_betting'],
        chapterWindow: [4, 6],
        unlockAfterSceneId: 'ch4_s09_four_elements_one_report',
        futureOwner: 'casino',
        purpose: '從市集退貨、空白姓名與被刪去的賭桌編號，理解洛恩如何替制度執行傷害；主線先完成公開總帳，支線只補上他的個人責任。',
        characterReveal: '他既受控制也確實是共犯；想活與想救人一直同時存在。',
        tone: '調查、內疚、有限度的贖罪，不給赦免。',
        stagePlan: [
            { chapter: 4, ownerId: 'market', objective: '比對退回市集的抵押物與賭場缺號。' },
            { chapter: 5, ownerId: 'handbook', objective: '伊萊將受害者姓名與推測分開，不替洛恩減罪。' },
            { chapter: 6, ownerId: 'casino', objective: '主線已公開總帳後，洛恩在既有帳頁標出自己操作、協助與刪除過的桌號。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '市集退貨記錄出現沒有姓名、只有賭桌編號的抵押物；總帳對應列被刻意留白。' },
            { beat: 'resistance', text: '洛恩先聲稱空白是保護受害者，伊萊則指出沒有來源與責任的保護同樣能替執行者遮蔽。' },
            { beat: 'turn', text: '洛恩承認哪些空白由自己刪去、哪些由維斯珀命令，但不把命令當成免責理由。' },
            { beat: 'resolution', text: '第六章主線已把總帳交給公共監督後，他再補回自己參與過的桌號與動作，接受責任可被逐項查閱；這是贖罪行動的開始，不是赦免。' }
        ],
        runPolicy: {
            firstRun: 'early_stages_available_then_final_stage_after_loaded_dice_handoff',
            secondRun: 'replays_from_reset_then_final_stage_after_contract_collection',
            crossRunPersistence: 'none'
        },
        performanceNeeds: {
            expressionIdsByActor: {
                casino_dealer: ['neutral', 'guarded', 'afraid', 'grieving', 'soft'],
                town_scholar: ['neutral', 'guarded', 'soft'],
                merchant: ['neutral', 'guarded']
            },
            backgroundOwnerIds: ['market', 'handbook', 'casino']
        },
        mainlineBoundary: '長篇可在主線後補註責任，但不能擁有公開總帳、城鎮監督，也不能提前交出灌鉛骰子、勝局條款或維斯珀位置。',
        rewardBinding: { kind: SideStoryRewardKind.HANDBOOK_FUNCTION, id: 'lorne_responsibility_index', role: '在主線已公開的總帳中增加洛恩個人行為索引；不解鎖總帳本身，也不代表原諒。' },
        resourceNeeds: { newSystemHooks: ['casino_lorne_responsibility_index'] }
    }),

    // Public merchant
    story({
        id: 'empty_crates_still_count',
        title: '空箱也得點數',
        primaryCharacterId: 'merchant',
        length: SideStoryLength.SHORT,
        chapterWindow: [2, 2],
        unlockAfterSceneId: 'ch2_s01_empty_crates',
        futureOwner: 'market',
        purpose: '商人堅持連空箱、斷封與沒到的貨都要寫進公開帳，讓缺貨也有可追查的形狀。',
        characterReveal: '他害怕的不只是沒貨可賣，而是城鎮再次只能靠沒有來源的承諾活下去。',
        tone: '正面、精明、帶缺貨商人的自嘲。',
        stagePlan: [
            { chapter: 2, ownerId: 'market', objective: '清點空箱、斷封與實際到貨，留下任何人都看得懂的數量。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '市集收到的第一批貨大半只剩空箱與斷封，商人仍要求全部搬到公開清點處。' },
            { beat: 'resistance', text: '居民只想知道能買什麼，他卻連沒到的數量都寫出來，讓貨架看上去比實際更加難堪。' },
            { beat: 'turn', text: '其中一只空箱保留完整路線印，證明貨物是在斷路前就未裝入，而不是被怪物搶走。' },
            { beat: 'resolution', text: '商人公開實到、空箱與未裝貨三種數字，再從真正到貨中分出少量補給；缺貨第一次有了可信來源。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: { merchant: ['neutral', 'guarded', 'pleased'] },
            backgroundOwnerIds: ['market']
        },
        mainlineBoundary: '不解鎖主線市場庫存，也不憑空補充缺少貨物。',
        rewardBinding: { kind: SideStoryRewardKind.ORDINARY_SUPPLIES, id: 'honest_crate_leftovers', role: '從實際到貨中分出的少量普通補給。' },
        resourceNeeds: {}
    }),
    story({
        id: 'freight_marks_do_not_lie',
        title: '貨印不替人說謊',
        primaryCharacterId: 'merchant',
        characterIds: ['merchant', 'town_scholar'],
        length: SideStoryLength.MEDIUM,
        prerequisiteStoryIds: ['empty_crates_still_count'],
        chapterWindow: [2, 4],
        unlockAfterSceneId: 'ch2_s07_names_return_to_town',
        futureOwner: 'market',
        regionLocationIds: ['north_checkpoint_marker', 'dead_checkpoint'],
        purpose: '沿三個章節比對公開貨印，讓道路修復、延誤與價格變化成為玩家能讀懂的城鎮生活。',
        characterReveal: '商人想讓貨架顯得充足，卻選擇承認有限庫存，因為漂亮謊言無法讓下一車貨回來。',
        tone: '調查、城鎮復甦、帶交易實務的幽默。',
        stagePlan: [
            { chapter: 2, ownerId: 'north_checkpoint_marker', objective: '記下第一組斷路貨印，不把預定貨量當成實際到貨。' },
            { chapter: 3, ownerId: 'dead_checkpoint', objective: '辨識重新使用的舊貨印，排除來源不明的箱子。' },
            { chapter: 4, ownerId: 'market', objective: '把三條路線的到貨差異公開在市集，而不是用平均數掩蓋斷路。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '商人發現同一貨印跨越三條道路重複出現，若照帳面平均，市集會誤以為供應已恢復。' },
            { beat: 'resistance', text: '每條路的泥、水與灰改變印記，玩家必須把物理痕跡和伊萊的日期一起比對，不能只認圖案。' },
            { beat: 'turn', text: '廢棄關卡的一批箱子只是重用舊印，來源其實無法證實；商人選擇拒收能讓貨架更好看的貨。' },
            { beat: 'resolution', text: '市集分路顯示到貨與中斷，不再用平均數掩蓋危險；商人接受公開誠實也可能讓顧客暫時離開。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: {
                merchant: ['neutral', 'guarded', 'pleased', 'soft'],
                town_scholar: ['neutral', 'guarded', 'pleased']
            },
            backgroundOwnerIds: ['north_checkpoint_marker', 'dead_checkpoint', 'market']
        },
        mainlineBoundary: '不提供灰燼男爵路線、黑市入口、元素主線線索或必要庫存。',
        rewardBinding: { kind: SideStoryRewardKind.HANDBOOK_FUNCTION, id: 'market_source_labels', role: '市集物品顯示已知貨源與目前路線狀態。' },
        resourceNeeds: { newSystemHooks: ['market_source_labels'] }
    }),
    story({
        id: 'honest_price_of_an_empty_shelf',
        title: '空貨架也要明碼',
        primaryCharacterId: 'merchant',
        characterIds: ['merchant', 'herbalist', 'blacksmith'],
        length: SideStoryLength.LONG,
        prerequisiteStoryIds: ['freight_marks_do_not_lie'],
        chapterWindow: [3, 5],
        unlockAfterSceneId: 'ch3_s09_temptation_and_orders',
        futureOwner: 'market',
        purpose: '賭場展示無限獎品時，商人仍必須公開有限藥品、煤與修理料的真實缺口。',
        characterReveal: '他並非不想賺錢；他的成長是接受可信的有限供應比看起來繁榮更能保住市集。',
        tone: '正面、制度建設、在匱乏中保留人情。',
        stagePlan: [
            { chapter: 3, ownerId: 'market', objective: '公開一張會讓生意難看的缺貨表，對照賭場的無限展示。' },
            { chapter: 4, ownerId: 'market', objective: '與米婭、鐵匠分開授權藥品與修理料，不混成無來源套裝。' },
            { chapter: 5, ownerId: 'market', objective: '建立可預留但不能超賣的公開訂單，讓居民知道何時真的能取貨。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '賭場展示櫃永遠滿著，市集卻必須在藥品、煤與修理料之間留下大片空格。' },
            { beat: 'resistance', text: '商人考慮把不同來源綁成看似充足的套裝，米婭與鐵匠分別指出這會讓配方授權與材料責任消失。' },
            { beat: 'turn', text: '玩家協助建立可預留、不可超賣的訂單；空貨架不再等於無人負責，而是清楚標示下一批從哪裡來。' },
            { beat: 'resolution', text: '商人公開一張不漂亮但可信的補貨表，承認市集的價值不是永遠有貨，而是沒有貨時也不說謊。' }
        ],
        runPolicy: {
            firstRun: 'final_market_stage_survives_mia_death_using_only_prior_authorizations',
            secondRun: 'replays_from_reset_with_mia_present_but_market_remaining_publicly_owned',
            crossRunPersistence: 'none'
        },
        performanceNeeds: {
            expressionIdsByActor: {
                merchant: ['neutral', 'guarded', 'afraid', 'soft', 'pleased'],
                herbalist: ['neutral', 'guarded'],
                blacksmith: ['neutral', 'guarded']
            },
            backgroundOwnerIds: ['market']
        },
        mainlineBoundary: '不取代主線市集解鎖、米婭配方判斷或鐵匠鍛造階段。',
        rewardBinding: { kind: SideStoryRewardKind.HANDBOOK_FUNCTION, id: 'market_reservation_view', role: '開放有限庫存的來源、預留與預計補貨檢視，不增加產量。' },
        resourceNeeds: { newSystemHooks: ['market_reservation_view'] }
    }),

    // Black-market trader
    story({
        id: 'no_guarantee_after_sale',
        title: '我不替你保證',
        primaryCharacterId: 'black_market',
        length: SideStoryLength.SHORT,
        chapterWindow: [3, 3],
        unlockAfterSceneId: 'ch3_s05_blank_creditor_trace',
        futureOwner: 'alley',
        purpose: '黑市商人讓玩家在兩件自有舊貨與一件第三方寄售危險品中，找出唯一不足以成立交易的含糊標籤。',
        characterReveal: '他沒有道德承諾，卻厭惡條件寫得不準確；精確是保護交易距離的工具。',
        tone: '冷淡、機鋒、沒有善意包裝。',
        stagePlan: [
            { chapter: 3, ownerId: 'alley', objective: '比較來源、缺陷與拒保條件，拒絕一件描述故意含糊的貨。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '黑市商人擺出兩件自有舊貨與一件剛送到的第三方寄售品，聲稱自己只保證標籤寫下的部分。' },
            { beat: 'resistance', text: '兩件自有貨明確列出裂痕與來源，寄售標籤只寫「使用後果自負」；價格最低的恰好是資訊最少的。' },
            { beat: 'turn', text: '玩家拒絕含糊寄售品後，他沒有稱讚謹慎，只把它撤下，承認模糊條件連他也無法隔開自己的交易責任。' },
            { beat: 'resolution', text: '黑市介面開始顯示已知缺陷與拒保範圍；他仍不替玩家安全背書，也不因此成為可信朋友。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: { black_market: ['neutral', 'guarded', 'pleased'] },
            backgroundOwnerIds: ['alley']
        },
        mainlineBoundary: '不出現第二張空白抵契，也不提供契約內容或維斯珀解法。',
        rewardBinding: { kind: SideStoryRewardKind.HANDBOOK_FUNCTION, id: 'risk_clause_labels', role: '額外顯示賣家聲明的來源可信度與拒保範圍；物品實際機械效果與已知危險始終預設可見。' },
        resourceNeeds: { newSystemHooks: ['black_market_risk_clause_labels'] }
    }),
    story({
        id: 'ash_freight_marks',
        title: '灰燼貨號',
        primaryCharacterId: 'black_market',
        characterIds: ['black_market', 'merchant', 'town_scholar'],
        length: SideStoryLength.MEDIUM,
        prerequisiteStoryIds: ['no_guarantee_after_sale'],
        chapterWindow: [4, 5],
        unlockAfterSceneId: 'ch4_s01_road_moves_underfoot',
        futureOwner: 'alley',
        regionLocationIds: ['center_span_marker'],
        purpose: '同一批灰燼貨在公開市集與黑市留下不同記號，呈現合法與非法供應如何利用災害。',
        characterReveal: '黑市不在乎居民是否得救，只在乎來源責任別沿貨號追到自己；這份冷漠仍能留下真實世界痕跡。',
        tone: '經濟調查、灰色、沒有突然贖罪。',
        stagePlan: [
            { chapter: 4, ownerId: 'center_span_marker', objective: '辨認被磨掉一半的灰燼貨號，分清自然損壞與刻意遮蔽。' },
            { chapter: 5, ownerId: 'market', objective: '將公開貨印與黑市記號並列，確認兩邊都只知道自己的交易段。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '灰脊中央跨度留下半枚貨號，市集說貨沒到，黑市則堅稱自己只接手後半段。' },
            { beat: 'resistance', text: '自然灰蝕與刻意磨除疊在同一記號上，任何一方都能把缺失推給看不見的上一手。' },
            { beat: 'turn', text: '伊萊把公開貨印與黑市批次並列後，證明兩邊陳述各自正確但都不完整；沒有人掌握整條供應。' },
            { beat: 'resolution', text: '手札開放第三方來源比較。黑市商人只修正自己的交易段，不關心貨最終救了誰，也不偽裝成善意。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: {
                black_market: ['neutral', 'guarded'],
                merchant: ['neutral', 'guarded'],
                town_scholar: ['neutral', 'guarded', 'pleased']
            },
            backgroundOwnerIds: ['center_span_marker', 'market', 'alley']
        },
        mainlineBoundary: '不觸發灰燼男爵、外傳區域、契約證據或任何必需元素素材。',
        rewardBinding: { kind: SideStoryRewardKind.HANDBOOK_FUNCTION, id: 'third_party_source_compare', role: '手札可比較同一物資的公開與第三方來源。' },
        resourceNeeds: { newSystemHooks: ['third_party_source_compare'] }
    }),
    story({
        id: 'after_the_trade_ends',
        title: '交易結束以後',
        primaryCharacterId: 'black_market',
        characterIds: ['black_market', 'town_scholar'],
        length: SideStoryLength.LONG,
        prerequisiteStoryIds: ['ash_freight_marks'],
        chapterWindow: [4, 6],
        unlockAfterSceneId: 'ch4_s09_four_elements_one_report',
        futureOwner: 'alley',
        regionLocationIds: ['old_waystation_cache', 'old_route_mouth'],
        purpose: '一批已賣出的通用扣件造成連鎖退貨；玩家追查來源時，黑市只在責任逼近門口後承認自己曾用拒保文字掩蓋未查明的來源缺口。',
        characterReveal: '他不會變善良；他只被迫承認逐字精確也能成為逃避，交易結束不能真的切斷物件留下的後果。',
        tone: '冷峻、因果調查，收束不是贖罪而是被迫承擔精確責任。',
        stagePlan: [
            { chapter: 4, ownerId: 'alley', objective: '確認危險來自賣家已知但未寫清的缺陷，而非超自然陰謀。' },
            { chapter: 5, ownerId: 'old_waystation_cache', objective: '找回同批器具的包裝，鎖定來源批次而不新增供應商角色。' },
            { chapter: 6, ownerId: 'handbook', objective: '伊萊記下黑市承認到哪裡、拒絕到哪裡，保留責任邊界。' }
        ],
        dramaticArc: [
            { beat: 'setup', text: '一批已售出的加熱扣在不同裝備上同時崩裂，黑市商人起初以交易早已結束為由拒絕處理。' },
            { beat: 'resistance', text: '玩家追到舊驛站包裝，確認賣家早知扣件不能接觸反覆冷熱，卻只留下空泛拒保文字。' },
            { beat: 'turn', text: '批次責任沿包裝追回背巷，黑市商人才提供完整缺陷，動機是阻止來源繼續追到自己，不是悔悟。' },
            { beat: 'resolution', text: '伊萊把他承認與拒絕的範圍並列，黑市高風險貨開始顯示批次警告；他仍冷漠，但不能再用「已賣出」刪除後果。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: {
                black_market: ['neutral', 'guarded', 'angry'],
                town_scholar: ['neutral', 'guarded', 'soft']
            },
            backgroundOwnerIds: ['alley', 'old_waystation_cache', 'handbook']
        },
        mainlineBoundary: '器具不能是空白抵契、回聲哨、封痕碎片、四象手術工具或主線裝備。',
        rewardBinding: { kind: SideStoryRewardKind.HANDBOOK_FUNCTION, id: 'black_market_batch_warning', role: '黑市高風險貨物顯示已知批次警告，不解鎖新禁品。' },
        resourceNeeds: { newSystemHooks: ['black_market_batch_warning'] }
    })
]);

export const OptionalEnsembleStoryRegistry = Object.freeze([
    story({
        id: 'bitter_tea_bent_spoon',
        title: '苦茶與彎湯匙',
        length: SideStoryLength.ENSEMBLE_SHORT,
        characterIds: ['herbalist', 'blacksmith'],
        chapterWindow: [2, 2],
        unlockAfterSceneId: 'ch2_s02_name_under_basket',
        futureOwner: 'mia_workroom',
        purpose: '鐵匠堅稱湯匙是被藥苦彎的，米婭堅稱是他手太重；透過玩笑呈現兩種修復工作的尊重。',
        characterReveal: '兩人都照顧脆弱之物，只是語言完全不同。',
        tone: '正面、生活喜劇。',
        stagePlan: [{ chapter: 2, ownerId: 'mia_workroom', objective: '找出彎曲原因並把湯匙留作量藥工具。' }],
        dramaticArc: [
            { beat: 'setup', text: '米婭拿出一把彎湯匙要求修理，鐵匠堅稱是藥太苦把金屬嚇彎。' },
            { beat: 'resistance', text: '兩人用各自專業互相證明對方使用錯誤，主角只能重現湯匙平常量藥與攪拌的受力方式。' },
            { beat: 'turn', text: '真正原因是鐵匠上次喝藥時用它撬開黏死的瓶塞，兩人同時沉默。' },
            { beat: 'resolution', text: '湯匙被修成更適合量藥的角度，鐵匠拒絕道歉但帶走所有黏死的瓶蓋。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: {
                herbalist: ['neutral', 'pleased', 'guarded'],
                blacksmith: ['neutral', 'pleased', 'guarded']
            },
            backgroundOwnerIds: ['mia_workroom']
        },
        mainlineBoundary: '不涉及手術器材。',
        rewardBinding: { kind: SideStoryRewardKind.ORDINARY_SUPPLIES, id: 'measured_herb_bundle', role: '少量既有藥草。' },
        resourceNeeds: {}
    }),
    story({
        id: 'whose_lamp_is_crooked',
        title: '到底是誰把燈掛歪',
        length: SideStoryLength.ENSEMBLE_SHORT,
        characterIds: ['standard_bearer_frey', 'lamplighter_tavi', 'blacksmith'],
        chapterWindow: [2, 3],
        unlockAfterSceneId: 'ch2_s08_shadow_at_the_checkpoint',
        futureOwner: 'gate',
        purpose: '三人用不同專業互相指責一盞歪燈，最後發現牆本身是斜的。',
        characterReveal: '芙蕾看方向、塔維看光、鐵匠看受力；沒有人能單獨描述完整問題。',
        tone: '正面、工作喜劇。',
        stagePlan: [{ chapter: 2, ownerId: 'gate', objective: '讓三人各自檢查後重新安裝燈架。' }],
        dramaticArc: [
            { beat: 'setup', text: '塔維說燈掛歪，芙蕾說方向線沒歪，鐵匠則認為兩人都不懂牆。' },
            { beat: 'resistance', text: '三人分別調整光、旗線與金屬架，每次修正都讓另一項看起來更斜。' },
            { beat: 'turn', text: '玩家從地面裂痕確認整面牆在災後傾斜，三種判斷其實各自在自己的基準上正確。' },
            { beat: 'resolution', text: '燈架依新牆面重裝，三人一致同意把錯怪在牆上，然後繼續爭論誰最先發現。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: {
                standard_bearer_frey: ['neutral', 'guarded', 'pleased'],
                lamplighter_tavi: ['neutral', 'pleased'],
                blacksmith: ['neutral', 'pleased', 'guarded']
            },
            backgroundOwnerIds: ['gate']
        },
        mainlineBoundary: '不產出風擋、遠標尺寸或灰脊救援條件。',
        rewardBinding: { kind: SideStoryRewardKind.ORDINARY_SUPPLIES, id: 'lamp_oil_and_fasteners', role: '既有燈油與普通工藝素材。' },
        resourceNeeds: {}
    }),
    story({
        id: 'names_for_useless_things',
        title: '替沒用的東西取名字',
        length: SideStoryLength.ENSEMBLE_SHORT,
        characterIds: ['town_scholar', 'street_beggar'],
        chapterWindow: [3, 4],
        unlockAfterSceneId: 'ch3_s01_dead_checkpoint',
        futureOwner: 'crossroads',
        purpose: '伊萊試圖替艾洛的垃圾建立分類，艾洛不斷用錯誤但具體的名字推翻他。',
        characterReveal: '伊萊學會不是所有混亂都需要立刻整理；艾洛則短暫允許別人碰他的世界。',
        tone: '古怪、溫柔、帶喜劇。',
        stagePlan: [{ chapter: 3, ownerId: 'crossroads', objective: '完成一張沒有實際用途、但兩人都接受的垃圾清單。' }],
        dramaticArc: [
            { beat: 'setup', text: '伊萊試圖替艾洛散落的垃圾建立分類，第一欄才寫完就被一句「那個會唱」推翻。' },
            { beat: 'resistance', text: '物件在材質、用途與艾洛記憶中的稱呼之間不停換類，伊萊愈整理愈焦躁。' },
            { beat: 'turn', text: '玩家建議讓分類同時保留物件外觀與艾洛稱呼；清單第一次不要求其中一方放棄自己的理解。' },
            { beat: 'resolution', text: '完成的清單沒有實務用途，伊萊仍把它收進關係紀錄；艾洛允許他替一件垃圾畫上歪斜小記號。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: {
                town_scholar: ['neutral', 'guarded', 'pleased', 'soft'],
                street_beggar: ['neutral', 'guarded', 'pleased']
            },
            backgroundOwnerIds: ['crossroads']
        },
        mainlineBoundary: '不解碼艾洛話語或提供主線線索。',
        rewardBinding: { kind: SideStoryRewardKind.RELATIONSHIP_RECORD, id: 'useless_catalogue', role: '多人關係紀錄。' },
        resourceNeeds: {}
    }),
    story({
        id: 'three_people_order_one_rest',
        title: '三個人命令一個人休息',
        length: SideStoryLength.ENSEMBLE_SHORT,
        characterIds: ['village_elder', 'town_scholar', 'herbalist'],
        chapterWindow: [3, 3],
        unlockAfterSceneId: 'ch3_s09_temptation_and_orders',
        futureOwner: 'crossroads',
        purpose: '米婭與伊萊聯手逼村長吃飯，村長以行政程序反擊，最後三人一起被迫停工。',
        characterReveal: '他們都擅長照顧別人，也都不擅長接受同一件事。',
        tone: '溫暖、乾冷幽默。',
        stagePlan: [{ chapter: 3, ownerId: 'crossroads', objective: '把一頓飯送到桌上，並讓三人真的坐到吃完。' }],
        dramaticArc: [
            { beat: 'setup', text: '米婭發現村長沒吃飯，伊萊帶著證據加入，村長則引用工作順序拒絕休息。' },
            { beat: 'resistance', text: '兩人輪流堵住他的行政理由，卻也各自在把自己的飯推遠；村長立刻抓住這個漏洞反擊。' },
            { beat: 'turn', text: '玩家把三份工作一起移出桌面，宣布任何人先起身就得替另外兩人完成剩餘公文。' },
            { beat: 'resolution', text: '三人被迫吃完一頓不算熱的飯，並一致把主角的做法記成一次程序濫用。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: {
                village_elder: ['neutral', 'guarded', 'pleased'],
                town_scholar: ['neutral', 'guarded', 'pleased'],
                herbalist: ['neutral', 'guarded', 'pleased']
            },
            backgroundOwnerIds: ['crossroads']
        },
        mainlineBoundary: '不觸及遠征證據或米婭手術。',
        rewardBinding: { kind: SideStoryRewardKind.ORDINARY_SUPPLIES, id: 'shared_meal', role: '一次既有疲勞恢復補給。' },
        resourceNeeds: {}
    }),
    story({
        id: 'market_after_closing',
        title: '收攤後才開始分貨',
        length: SideStoryLength.ENSEMBLE_SHORT,
        characterIds: ['merchant', 'herbalist', 'blacksmith'],
        chapterWindow: [3, 4],
        unlockAfterSceneId: 'ch3_s09_temptation_and_orders',
        futureOwner: 'market',
        purpose: '市集收攤後，三人把有限貨物重新分給病人、修路隊與一般居民。',
        characterReveal: '公共供應不是神奇補貨，而是不同價值觀在有限資源下協商。',
        tone: '正面、城鎮生活、帶實務摩擦。',
        stagePlan: [{ chapter: 3, ownerId: 'market', objective: '依來源與用途重新分配一批有限貨物。' }],
        dramaticArc: [
            { beat: 'setup', text: '收攤後只剩一批不足以同時供應病人、修路隊與一般居民的貨。' },
            { beat: 'resistance', text: '商人看路線與數量、米婭看病情、鐵匠看工具失效，每個排序都合理也都會犧牲另一邊。' },
            { beat: 'turn', text: '玩家把可拆分物資與不可拆分物資分開，讓三人不再試圖用同一套優先順序處理所有東西。' },
            { beat: 'resolution', text: '貨物仍然有限，但每一份都有清楚去向；三人留下明日缺口，而不是假裝今晚已解決所有問題。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: {
                merchant: ['neutral', 'guarded', 'pleased'],
                herbalist: ['neutral', 'guarded', 'soft'],
                blacksmith: ['neutral', 'guarded', 'pleased']
            },
            backgroundOwnerIds: ['market']
        },
        mainlineBoundary: '不解鎖必需市場庫存或鍛造階段。',
        rewardBinding: { kind: SideStoryRewardKind.ORDINARY_SUPPLIES, id: 'market_leftovers', role: '少量正常庫存，不創造新貨源。' },
        resourceNeeds: {}
    }),
    story({
        id: 'table_without_an_owner',
        title: '沒有主人的桌',
        length: SideStoryLength.ENSEMBLE_SHORT,
        characterIds: ['casino_dealer', 'town_scholar', 'merchant'],
        chapterWindow: [6, 6],
        unlockAfterSceneId: 'ch6_s07_house_changes_seats',
        futureOwner: 'casino',
        purpose: '維斯珀離席且主線已交出總帳後，洛恩、伊萊與商人整理公開、隱私與追責欄位，讓監督能實際運作。',
        characterReveal: '移除惡人不會自動修好制度，留下的人必須接受監督與難看的紀錄。',
        tone: '收束、務實，帶一點重新學會普通工作的希望。',
        stagePlan: [{ chapter: 6, ownerId: 'casino', objective: '在既有公開總帳中分開價格、受保護姓名與未結清追責，不替任何人美化。' }],
        dramaticArc: [
            { beat: 'setup', text: '維斯珀離席後，主線已把總帳交給城鎮；賭場中央仍留下一批不知道該公開到什麼程度的細項。' },
            { beat: 'resistance', text: '洛恩想先保護姓名、商人要求公開價格、伊萊要求保留來源，三種正當需求彼此衝突。' },
            { beat: 'turn', text: '玩家將帳分成公開價格、受保護姓名與仍須追責的桌號，避免公開透明再次傷害受害者。' },
            { beat: 'resolution', text: '主人桌不再屬於任何人，既有公開帳新增可追蹤的清償狀態；洛恩坐回荷官位置，但第一次不能關上總帳。' }
        ],
        performanceNeeds: {
            expressionIdsByActor: {
                casino_dealer: ['neutral', 'guarded', 'grieving', 'soft'],
                town_scholar: ['neutral', 'guarded', 'soft'],
                merchant: ['neutral', 'guarded', 'pleased']
            },
            backgroundOwnerIds: ['casino']
        },
        mainlineBoundary: '只能在主線賭場結算與公開總帳後出現，不改變維斯珀逃跑、反噬或監督成立的結果。',
        rewardBinding: { kind: SideStoryRewardKind.HANDBOOK_FUNCTION, id: 'casino_restitution_status', role: '在既有公共帳頁增加清償與未結案件篩選，不解鎖帳頁本身。' },
        resourceNeeds: { newSystemHooks: ['casino_restitution_status_filter'] }
    })
]);

export const AllOptionalSideStories = Object.freeze([
    ...OptionalSideStoryRegistry,
    ...OptionalEnsembleStoryRegistry
]);

function uniqueResourceIds(resourceKey) {
    return Object.freeze([...new Set(AllOptionalSideStories.flatMap(entry => entry.resourceNeeds[resourceKey] || []))]);
}

const requiredExpressionLayerIds = Object.freeze([...new Set(AllOptionalSideStories.flatMap(entry =>
    Object.entries(entry.performanceNeeds.expressionIdsByActor)
        .flatMap(([actorId, expressionIds]) => expressionIds.map(expressionId => `${actorId}:${expressionId}`))
))]);
const requiredBackgroundOwnerIds = Object.freeze([...new Set(AllOptionalSideStories.flatMap(entry =>
    entry.performanceNeeds.backgroundOwnerIds
))]);

export const OptionalSideStoryDerivedResources = Object.freeze({
    newItemIds: uniqueResourceIds('newItemIds'),
    newIconIds: uniqueResourceIds('newIconIds'),
    newBackgroundIds: uniqueResourceIds('newBackgroundIds'),
    newSystemHooks: uniqueResourceIds('newSystemHooks'),
    newCharacterIds: Object.freeze([]),
    newMonsterIds: Object.freeze([]),
    newLocationIds: Object.freeze([]),
    requiredExpressionLayerIds,
    requiredBackgroundOwnerIds,
    expressionRule: 'closed_nine_vocabulary_reuse_then_physical_layer_audit_after_dialogue_review',
    criticalCgIds: Object.freeze([])
});

export const OptionalSideStoryCharacterContracts = Object.freeze(Object.fromEntries(
    SideStoryRequiredCharacterIds.map(characterId => [characterId, Object.freeze({
        short: OptionalSideStoryRegistry.find(entry => entry.primaryCharacterId === characterId && entry.length === SideStoryLength.SHORT)?.id || null,
        medium: OptionalSideStoryRegistry.find(entry => entry.primaryCharacterId === characterId && entry.length === SideStoryLength.MEDIUM)?.id || null,
        long: OptionalSideStoryRegistry.find(entry => entry.primaryCharacterId === characterId && entry.length === SideStoryLength.LONG)?.id || null
    })])
));

export const OptionalSideStoryChapterPlacement = Object.freeze(Object.fromEntries(
    Array.from({ length: 7 }, (_, index) => {
        const chapter = index + 1;
        const stages = AllOptionalSideStories.flatMap(entry => entry.stagePlan
            .map((stage, stageIndex) => ({ entry, stage, stageIndex }))
            .filter(({ stage }) => stage.chapter === chapter)
            .map(({ entry, stage, stageIndex }) => Object.freeze({
                storyId: entry.id,
                title: entry.title,
                length: entry.length,
                stageIndex,
                ownerId: stage.ownerId,
                objective: stage.objective,
                unlockAfterSceneId: entry.unlockAfterSceneId,
                expireBeforeSceneId: entry.expireBeforeSceneId || null,
                prerequisiteStoryIds: entry.prerequisiteStoryIds,
                prerequisiteStageIndex: stageIndex > 0 ? stageIndex - 1 : null,
                offerPolicy: entry.offerPolicy,
                activationState: 'approved_pending_production'
            })));
        return [chapter, Object.freeze(stages)];
    })
));

export function getOptionalSideStory(sideStoryId) {
    return AllOptionalSideStories.find(entry => entry.id === sideStoryId) || null;
}

export function getOptionalSideStoriesForChapter(chapter) {
    const numericChapter = Number(chapter);
    return AllOptionalSideStories.filter(entry =>
        numericChapter >= entry.chapterWindow[0] && numericChapter <= entry.chapterWindow[1]
    );
}

export function getOptionalSideStoriesForCharacter(characterId) {
    return AllOptionalSideStories.filter(entry => entry.characterIds.includes(characterId));
}
