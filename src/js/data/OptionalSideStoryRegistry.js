/**
 * OptionalSideStoryRegistry.js
 * Side stories deepen already-complete mainline characterization. They cannot
 * own a required fate, rescue clue, route key, villain proof, or service unlock.
 */

export const OptionalSideStoryStatus = Object.freeze({
    DEFERRED: 'deferred_until_map_owner'
});

export const OptionalSideStoryRegistry = Object.freeze([
    {
        id: 'outside_door_inside_desk',
        title: '門外與桌內',
        characterIds: ['village_elder', 'town_scholar'],
        chapterWindow: [2, 3],
        purpose: '深化村長與伊萊多年共事、互相照看卻都不肯先休息的友情。',
        mainlineBoundary: '不得承擔遠征真相、村長死亡或二周目攔阻證據。',
        futureOwner: 'crossroads_or_handbook',
        status: OptionalSideStoryStatus.DEFERRED,
        rewardBinding: null
    },
    {
        id: 'afternoon_without_case',
        title: '沒有病歷的下午',
        characterIds: ['herbalist'],
        chapterWindow: [2, 4],
        purpose: '讓米婭在沒有病人的時間練習休息、整理房間與接受陪伴。',
        mainlineBoundary: '不得提供四象手術解法、救命材料或替代死亡條件。',
        futureOwner: 'mia_workroom',
        status: OptionalSideStoryStatus.DEFERRED,
        rewardBinding: null
    },
    {
        id: 'flag_cannot_speak_for_lamp',
        title: '旗影不替燈說話',
        characterIds: ['standard_bearer_frey', 'lamplighter_tavi'],
        chapterWindow: [2, 4],
        purpose: '用巡線日常、工作默契與角色式幽默深化兩人的依賴與摩擦。',
        mainlineBoundary: '不得承擔灰脊分工、死亡或救援所需的必要鋪陳。',
        futureOwner: 'gate',
        status: OptionalSideStoryStatus.DEFERRED,
        rewardBinding: null
    },
    {
        id: 'repair_the_pot_first',
        title: '先修鍋',
        characterIds: ['blacksmith'],
        chapterWindow: [1, 5],
        purpose: '深化鐵匠把民生修復放在武器前，以及關心總藏在粗硬話語裡的習慣。',
        mainlineBoundary: '不得開啟鍛造、提供主線工具或替代四象反制裝備。',
        futureOwner: 'forge',
        status: OptionalSideStoryStatus.DEFERRED,
        rewardBinding: null
    },
    {
        id: 'useless_things',
        title: '沒有用的東西',
        characterIds: ['street_beggar'],
        chapterWindow: [2, 5],
        purpose: '讓垃圾、白花與破布在生活尺度上反覆出現，深化艾洛的殘破記憶。',
        mainlineBoundary: '不得揭露妮露、回聲哨用法、舊山路或第一輪死亡方向。',
        futureOwner: 'alley',
        status: OptionalSideStoryStatus.DEFERRED,
        rewardBinding: null
    },
    {
        id: 'night_without_betting',
        title: '不下注的夜晚',
        characterIds: ['casino_owner', 'casino_dealer'],
        chapterWindow: [3, 5],
        purpose: '透過沒有賭客時的桌邊關係，深化維斯珀的控制與洛恩的共犯沉默。',
        mainlineBoundary: '不得交出灌鉛骰子、空白抵契證據或契約反噬解法。',
        futureOwner: 'casino',
        status: OptionalSideStoryStatus.DEFERRED,
        rewardBinding: null
    },
    {
        id: 'ash_freight_marks',
        title: '灰燼貨號',
        characterIds: ['merchant', 'black_market'],
        chapterWindow: [4, 6],
        purpose: '從公開貨印與第三方來源的差異，深化城鎮交易制度與灰色選擇。',
        mainlineBoundary: '只能留下灰燼貨運的第一輪線索；不得在必經主線觸發灰燼男爵、開啟二周目外傳區域或提前提供超格 Boss 獎勵。',
        futureOwner: 'market_and_alley',
        status: OptionalSideStoryStatus.DEFERRED,
        rewardBinding: null
    }
]);

export function getOptionalSideStory(sideStoryId) {
    return OptionalSideStoryRegistry.find(entry => entry.id === sideStoryId) || null;
}
