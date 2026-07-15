/**
 * StoryDiscoveries.js
 * Authoritative first-run discovery catalog. A discovery is written once and
 * can be presented by both the traveler handbook and the encyclopedia.
 */

function discovery(config) {
    return Object.freeze({
        kind: 'event',
        icon: '✦',
        rarity: 'common',
        sourceLabel: '旅途紀錄',
        observation: '',
        inference: '',
        codexLinks: Object.freeze([]),
        ...config,
        codexLinks: Object.freeze(config.codexLinks || [])
    });
}

export const StoryDiscoveryRegistry = Object.freeze({
    ch1_road_collapse: discovery({
        id: 'ch1_road_collapse', chapter: 1, order: 10, sceneId: 'ch1_s01_road_collapse',
        title: '倒在城鎮看不見的彎道', kind: 'event', icon: '!',
        sourceLabel: '南方道路',
        observation: '怪物並非守在巢穴，而是在崩落道路上形成不自然的追擊群。米婭把失去行動能力的你帶回城鎮。',
        inference: '南路的異常不只來自怪物數量，牠們像被同一股壓力推向能攔截旅人的位置。'
    }),
    ch1_bitter_bottles: discovery({
        id: 'ch1_bitter_bottles', chapter: 1, order: 20, sceneId: 'ch1_s02_wake_under_bitter_bottles',
        title: '苦瓶底下的水', kind: 'relationship', icon: '+',
        sourceLabel: '米婭的藥草工作室',
        observation: '米婭先確認你能吞水、能坐起，再談藥材與報酬。工作室的存量遠比她表現得更緊。',
        inference: '她把病人放在自己之前；這份溫柔同時也是她最危險的習慣。'
    }),
    ch1_broken_crossroads: discovery({
        id: 'ch1_broken_crossroads', chapter: 1, order: 30, sceneId: 'ch1_s03_broken_crossroads',
        title: '仍有人使用的破城鎮', kind: 'town', icon: '#',
        sourceLabel: '裂痕廣場',
        observation: '冷爐、空攤、共用水與預留病床同時存在。這裡不是廢墟，而是一座功能逐項失去的城鎮。',
        inference: '修復必須改變居民如何活下去，不能只把建築重新點亮。'
    }),
    ch1_first_index: discovery({
        id: 'ch1_first_index', chapter: 1, order: 40, sceneId: 'ch1_s04_elder_to_scholar',
        title: '第一份索引保留未知', kind: 'clue', icon: '?', rarity: 'uncommon',
        sourceLabel: '檔案室',
        observation: '村長拒絕把任務寫成清除怪物。伊萊要求先確認三個固定地點，分開記錄來源與推論。',
        inference: '旅人手札從這裡開始只記錄主角真正知道的事。'
    }),
    ch1_gate_rule: discovery({
        id: 'ch1_gate_rule', chapter: 1, order: 50, sceneId: 'ch1_s05_south_gate_introduction',
        title: '旗在前，燈在後', kind: 'relationship', icon: '>',
        sourceLabel: '南門殘階',
        observation: '芙蕾記錄離城者，塔維維持回程燈。南門需要的是可讀的來回路線，不是更多英雄口號。',
        inference: '疲勞、回程標記與失聯名單從此成為同一個問題。'
    }),
    ch1_farmland_tracks: discovery({
        id: 'ch1_farmland_tracks', chapter: 1, order: 60, locationId: 'south_gate_farmland',
        title: '走到一半失去方向的腳印', kind: 'clue', icon: '✦',
        sourceLabel: '南門農田',
        observation: '腳印在濕泥中突然偏轉，像行走者發現原本的道路已經不存在。',
        inference: '失聯不完全是迷路；道路本身曾在短時間內變得不可判讀。'
    }),
    ch1_boardwalk_silver: discovery({
        id: 'ch1_boardwalk_silver', chapter: 1, order: 70, locationId: 'hunter_boardwalk',
        title: '被重新打過的繩結', kind: 'clue', icon: '✦',
        sourceLabel: '獵人棧道',
        observation: '棧道繩結中夾著不屬於獵具的銀色纖維，位置避開前路，反而貼近回程方向。',
        inference: '某種捕食者正在學習旅人的折返路線。'
    }),
    ch1_campfire_root: discovery({
        id: 'ch1_campfire_root', chapter: 1, order: 80, locationId: 'old_campfire_site',
        title: '冷灰下的新焦根', kind: 'clue', icon: '✦',
        sourceLabel: '舊營火點',
        observation: '營火早已熄滅，灰下根汁的焦痕卻很新，並沿土層向森林深處延伸。',
        inference: '黑根壓力比營火更新，來源不在這座廢棄營地。'
    }),
    ch1_silver_snare: discovery({
        id: 'ch1_silver_snare', chapter: 1, order: 90, sceneId: 'ch1_s07_silver_snare',
        title: '伏獵者讀過回程', kind: 'boss', icon: '!', rarity: 'rare',
        sourceLabel: '銀絲伏道',
        observation: '伏獵者把銀線設在你剛走過的路上。線端沾著與舊營火點相同的黑褐樹脂。',
        inference: '怪物正在把黑根造成的環境變化學成獵法；伏獵者不是源頭。',
        codexLinks: [{ category: 'monsters', id: 'world:ambush_mantis', label: '伏獵螳螂' }]
    }),
    ch1_cold_forge: discovery({
        id: 'ch1_cold_forge', chapter: 1, order: 100, sceneId: 'ch1_s08_cold_forge_smoke',
        title: '第一爐先修回城的東西', kind: 'town', icon: '+',
        sourceLabel: '冷爐鐵匠鋪',
        observation: '爐火恢復後，最先進爐的是鍋底、門鉸、擔架扣與回城工具。',
        inference: '鍛造恢復的意義是提高存活與返程能力，而不是只增加傷害。'
    }),
    ch1_rotroot_pressure: discovery({
        id: 'ch1_rotroot_pressure', chapter: 1, order: 110, locationId: 'rotroot_ravine',
        title: '向北收縮的黑根', kind: 'clue', icon: '✦', rarity: 'uncommon',
        sourceLabel: '腐根溪谷',
        observation: '發黑樹皮內層像被灼過，根脈的收縮方向卻一致朝北。',
        inference: '森林受到來自更遠處的壓力；古樹根心只是被穿過的節點。'
    }),
    ch1_guardian_truth: discovery({
        id: 'ch1_guardian_truth', chapter: 1, order: 120, sceneId: 'ch1_s10_forest_guardian',
        title: '守門者不是傷口', kind: 'boss', icon: '!', rarity: 'epic',
        sourceLabel: '古樹根心',
        observation: '守護者倒下後，根心仍沿同一方向收縮。黑色細根穿過此處，並不在此處生長。',
        inference: '森林守護者是被傷口逼瘋的守門者，不是詛咒源頭。',
        codexLinks: [{ category: 'monsters', id: 'world:forest_guardian', label: '森林守護者' }]
    }),
    ch1_roads_readable: discovery({
        id: 'ch1_roads_readable', chapter: 1, order: 130, sceneId: 'ch1_s11_roads_breathe_again',
        title: '道路重新可讀，不代表安全', kind: 'conclusion', icon: '✓', rarity: 'uncommon',
        sourceLabel: '第一章結案',
        observation: '城鎮能重新判讀附近道路，冷爐與手札恢復第一階段功能，市集仍缺少真正的供應線。',
        inference: '下一個問題不是再清除一批怪物，而是找回沒有抵達的貨物與名字。'
    }),
    ch2_empty_crates: discovery({
        id: 'ch2_empty_crates', chapter: 2, order: 210, sceneId: 'ch2_s01_empty_crates',
        title: '抵達的只有空箱', kind: 'event', icon: '$',
        sourceLabel: '市集邊棚',
        observation: '重新開放的道路送回損壞空箱與最後搬運位置，沒有送回搬運者。',
        inference: '供應問題與失蹤者名單是同一條路線留下的兩種缺口。'
    }),
    ch2_name_under_basket: discovery({
        id: 'ch2_name_under_basket', chapter: 2, order: 220, sceneId: 'ch2_s02_name_under_basket',
        title: '藥草籃下的名字', kind: 'relationship', icon: '+', rarity: 'uncommon',
        sourceLabel: '米婭的藥草工作室',
        observation: '舊藥草籃下的名字把米婭父親、二十年前的撤離與伊萊保留的紀錄接在一起。',
        inference: '米婭等待的不是抽象答案，而是一個始終沒有被誠實結案的家人。'
    }),
    ch2_unclosed_ledger: discovery({
        id: 'ch2_unclosed_ledger', chapter: 2, order: 230, sceneId: 'ch2_s03_ledger_that_would_not_close',
        title: '沒有修訂頁的撤離帳', kind: 'clue', icon: '?', rarity: 'uncommon',
        sourceLabel: '檔案室',
        observation: '撤離指令在發布當時可能正確，後續地形變動卻沒有被寫入同一份紀錄。',
        inference: '亡者可能仍在執行一條失去上下文、但從未正式撤回的路線。'
    }),
    ch2_mist_tablet: discovery({
        id: 'ch2_mist_tablet', chapter: 2, order: 240, locationId: 'mist_tablet_hill',
        title: '箭頭旁後補的名字', kind: 'clue', icon: '✦',
        sourceLabel: '霧碑丘',
        observation: '撤離箭頭旁逐筆補上死者姓名，方向標記與葬牌被當成同一套秩序使用。',
        inference: '古墓的異常不是單純喚屍，而是姓名、遺體與送達職責被綁在一起。'
    }),
    ch2_moon_migration: discovery({
        id: 'ch2_moon_migration', chapter: 2, order: 250, locationId: 'moon_moss_slope',
        title: '反覆長回的遷徙線', kind: 'clue', icon: '✦',
        sourceLabel: '月苔坡',
        observation: '新舊蹄印沿同一條線重疊，月苔在血月週期中反覆長回。',
        inference: '有大型生物被環境異變迫使遷徙，但留下的痕跡不足以確認牠的身分。'
    }),
    ch2_keeper_of_names: discovery({
        id: 'ch2_keeper_of_names', chapter: 2, order: 270, sceneId: 'ch2_s06_keeper_of_names',
        title: '守名者赫恩的末頁', kind: 'boss', icon: '!', rarity: 'epic',
        sourceLabel: '掘開古墓',
        observation: '赫恩在墓地無法容納新死者時，把姓名、屍體與送達職責綁進同一只靈匣。',
        inference: '那曾是照顧，卻在道路改變後成為拒絕停止的佔有。',
        codexLinks: [{ category: 'monsters', id: 'world:lich', label: '守名者赫恩' }]
    }),
    ch2_names_returned: discovery({
        id: 'ch2_names_returned', chapter: 2, order: 280, sceneId: 'ch2_s07_names_return_to_town',
        title: '名字回到活人的帳冊', kind: 'town', icon: '✓', rarity: 'uncommon',
        sourceLabel: '裂痕廣場',
        observation: '死者被分成確認、未確認與失蹤，不再被寫成沒有差別的犧牲。有限藥品開始送到等待者手中。',
        inference: '紀錄的價值不是保存命令，而是允許世界改變後重新修訂。'
    }),
    ch2_checkpoint_shadows: discovery({
        id: 'ch2_checkpoint_shadows', chapter: 2, order: 290, sceneId: 'ch2_s08_shadow_at_the_checkpoint',
        title: '像人一樣保持間距的影子', kind: 'clue', icon: '!', rarity: 'uncommon',
        sourceLabel: '北向廢棄關卡',
        observation: '影子守著重新找到的路牌，站位與換列方式不像魔物群，而像仍在執行命令的人。',
        inference: '下一條路的威脅可能來自二十年前遠征留下的秩序。'
    })
});

const SceneIndex = new Map();
const LocationIndex = new Map();

for (const entry of Object.values(StoryDiscoveryRegistry)) {
    if (entry.sceneId) {
        if (!SceneIndex.has(entry.sceneId)) SceneIndex.set(entry.sceneId, []);
        SceneIndex.get(entry.sceneId).push(entry);
    }
    if (entry.locationId) {
        if (!LocationIndex.has(entry.locationId)) LocationIndex.set(entry.locationId, []);
        LocationIndex.get(entry.locationId).push(entry);
    }
}

export function getStoryDiscovery(id) {
    return StoryDiscoveryRegistry[id] || null;
}

export function getSceneDiscoveries(sceneId) {
    return SceneIndex.get(sceneId) || [];
}

export function getLocationDiscoveries(locationId) {
    return LocationIndex.get(locationId) || [];
}

export function getStoryDiscoveryCatalog() {
    return Object.values(StoryDiscoveryRegistry).sort((a, b) => a.order - b.order);
}
