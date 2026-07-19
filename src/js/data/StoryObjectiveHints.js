import { getStoryScene } from './StorySceneRegistry.js';
import { getSceneRegionBinding } from './ChapterRegionRegistry.js';
import {
    ChapterOneInvestigationOrder,
    ChapterOneInvestigations,
    ChapterOneRotrootTrials
} from './ChapterOneProgression.js';

const STORY_OBJECTIVE_HINTS = Object.freeze({
    ch1_s01_road_collapse: {
        title: '南路沒有風',
        text: '沿南路前進，查明失聯村鎮外圍發生了什麼。'
    },
    ch1_s02_wake_under_bitter_bottles: {
        title: '先處理傷勢',
        text: '返回村鎮，讓救下你的米婭處理傷口。',
        placeId: 'mia_workroom',
        actorId: 'herbalist'
    },
    ch1_s03_broken_crossroads: {
        title: '回程板上的空行',
        text: '前往村鎮十字路口，向村長說明南路的情況。',
        placeId: 'crossroads',
        actorId: 'village_elder'
    },
    ch1_s04_elder_to_scholar: {
        title: '查清三條失聯路線',
        text: '前往書記小屋，向伊萊查問失聯人員最後使用的道路。',
        placeId: 'handbook',
        actorId: 'town_scholar'
    },
    ch1_s05_south_gate_introduction: {
        title: '從南門重新出發',
        text: '前往南門，與芙蕾確認外出路線與回程標記。',
        placeId: 'gate',
        actorId: 'standard_bearer_frey'
    },
    ch1_s06_three_landmarks: {
        title: ({
            chapterOneInvestigations = {},
            chapterOneHomeRecoveryKnown = false,
            chapterOneFirstReportComplete = false
        } = {}) => {
            const farmlandComplete = Boolean(chapterOneInvestigations.south_gate_farmland?.evidence);
            if (farmlandComplete && !chapterOneFirstReportComplete) return '把第一份紀錄帶回南門';
            if (farmlandComplete && !chapterOneHomeRecoveryKnown) return '讓米婭檢查傷勢';
            return '沿失聯者走過的路追查';
        },
        text: ({
            chapterOneInvestigations = {},
            chapterOneHomeRecoveryKnown = false,
            chapterOneFirstReportComplete = false
        } = {}) => {
            const farmlandComplete = Boolean(chapterOneInvestigations.south_gate_farmland?.evidence);
            if (farmlandComplete && !chapterOneFirstReportComplete) {
                return '沿原路走回南門入口，將田埂上的方向證據交給芙蕾。靠近南門入口後按 F 返回城鎮。';
            }
            if (farmlandComplete && !chapterOneHomeRecoveryKnown) {
                return '前往米婭的工作間。她要確認你能否繼續巡路；這項檢查不取決於目前生命值或藥水數量。';
            }
            const pendingId = ChapterOneInvestigationOrder.find(id => !chapterOneInvestigations[id]?.evidence);
            if (!pendingId) return '三份現場證據已齊，整理彼此無法解釋的矛盾。';
            const entry = ChapterOneInvestigations[pendingId];
            const state = chapterOneInvestigations[pendingId] || {};
            if (state.victory) return '留在目前地標完成戰後證據判讀；若演出中斷，靠近同一地標再按 F。';
            return entry.routeHint;
        },
        placeId: ({
            chapterOneInvestigations = {},
            chapterOneHomeRecoveryKnown = false,
            chapterOneFirstReportPending = false,
            chapterOneFirstReportComplete = false
        } = {}) => {
            const farmlandComplete = Boolean(chapterOneInvestigations.south_gate_farmland?.evidence);
            if (farmlandComplete && chapterOneFirstReportPending && !chapterOneFirstReportComplete) return 'gate';
            if (farmlandComplete && chapterOneFirstReportComplete && !chapterOneHomeRecoveryKnown) return 'mia_workroom';
            return null;
        },
        actorId: ({
            chapterOneInvestigations = {},
            chapterOneHomeRecoveryKnown = false,
            chapterOneFirstReportPending = false,
            chapterOneFirstReportComplete = false
        } = {}) => {
            const farmlandComplete = Boolean(chapterOneInvestigations.south_gate_farmland?.evidence);
            if (farmlandComplete && chapterOneFirstReportPending && !chapterOneFirstReportComplete) return 'standard_bearer_frey';
            if (farmlandComplete && chapterOneFirstReportComplete && !chapterOneHomeRecoveryKnown) return 'herbalist';
            return null;
        },
        targetId: ({
            chapterOneInvestigations = {},
            chapterOneFirstReportPending = false,
            chapterOneFirstReportComplete = false
        } = {}) => {
            const farmlandComplete = Boolean(chapterOneInvestigations.south_gate_farmland?.evidence);
            if (farmlandComplete && chapterOneFirstReportPending && !chapterOneFirstReportComplete) return null;
            if (farmlandComplete && !chapterOneFirstReportComplete) return 'south_gate_entry';
            return ChapterOneInvestigationOrder.find(id => !chapterOneInvestigations[id]?.evidence) || null;
        }
    },
    ch1_s07_silver_snare: {
        title: '回程路標轉向了',
        text: '追蹤被挪動的銀線，查明是誰改變了回程路標。線索從舊營火點往東北延伸，銀線會在靠近伏道時重新出現。',
        targetId: 'silver_snare_pass'
    },
    ch1_s08_cold_forge_smoke: {
        title: '把證據帶回冷爐',
        text: '返回鐵匠鋪，請鐵匠檢查銀線、甲殼與受損裝備。',
        placeId: 'forge',
        actorId: 'blacksmith'
    },
    ch1_s09_rotroot_approach: {
        title: '沿仍在搏動的黑根深入',
        text: ({ chapterOneGearReady = false, chapterOneGearEquipped = false, chapterOneRotrootTrialId = null } = {}) => {
            if (!chapterOneGearReady) {
                return '黑根汁已經蝕壞舊裝備。回到鐵匠鋪，請鐵匠處理銀線並整理一件能帶進林子的武器。';
            }
            if (!chapterOneGearEquipped) {
                return '鐵匠整理好的武器還在行囊裡。出發前先把它換到手上。';
            }
            const trial = ChapterOneRotrootTrials.find(entry => entry.id === chapterOneRotrootTrialId);
            if (trial) return `${trial.title}：${trial.text}`;
            return '兩段腐根實戰已完成，沿仍在向北搏動的根脈判讀森林匯流點。';
        }
    },
    ch1_s10_forest_guardian: {
        title: '進入古樹根心',
        text: '前往古樹根心，面對封鎖道路的森林守衛。'
    },
    ch1_s11_roads_breathe_again: {
        title: '帶回道路結果',
        text: '返回村鎮十字路口，交代森林守衛與道路恢復狀況。',
        placeId: 'crossroads',
        actorId: 'village_elder'
    },
    ch2_s01_empty_crates: {
        title: '檢查空箱與貨印',
        text: '前往市集邊棚，查問重新開通道路送回的空箱。',
        placeId: 'market',
        actorId: 'merchant'
    },
    ch2_s02_name_under_basket: {
        title: '藥草籃下的名字',
        text: '前往米婭的工作間，核對空箱上的舊貨印與人名。',
        placeId: 'mia_workroom',
        actorId: 'herbalist'
    },
    ch2_s03_ledger_that_would_not_close: {
        title: '核對未結的撤離帳',
        text: '前往書記小屋，與伊萊核對最後一份有效的撤離紀錄。',
        placeId: 'handbook',
        actorId: 'town_scholar'
    },
    ch2_s04_mist_and_tomb_route: {
        title: '沿名字追查撤離路',
        text: '前往霧碑丘。不要只看箭頭，沿死者姓名追查古墓方向。'
    },
    ch2_s06_keeper_of_names: {
        title: '進入掘開古墓',
        text: '前往掘開古墓，擊敗仍在驅使亡者送行的守名者赫恩。'
    },
    ch2_s07_names_return_to_town: {
        title: '讓名字回到帳冊',
        text: '返回書記小屋，將尋回的名冊交給伊萊核對。',
        placeId: 'handbook',
        actorId: 'town_scholar'
    },
    ch2_s08_shadow_at_the_checkpoint: {
        title: '調查北向廢棄關卡',
        text: '前往北向廢棄關卡，記下守在路標旁的影子陣形。'
    }
});

function resolveHintText(value, context) {
    return typeof value === 'function' ? value(context) : value;
}

function getFallbackHint(scene) {
    const binding = getSceneRegionBinding(scene.id);
    const title = scene.title || `第 ${scene.chapter} 章行動`;
    if (scene.stageClass === 'town_scene') {
        return { title, text: `返回城鎮，繼續處理「${title}」。` };
    }
    if (binding?.trigger === 'boss_convergence') {
        return { title, text: '前往地圖上的首領標記，完成戰鬥前的準備。' };
    }
    if (binding?.targetId) {
        return { title, text: '前往地圖上的任務標記，調查該處並推進事件。' };
    }
    return { title, text: '沿目前開放的道路探索，尋找下一個劇情地點。' };
}

export function getStoryObjectiveHint(sceneId, context = {}) {
    const scene = getStoryScene(sceneId);
    if (!scene) return null;
    const authored = STORY_OBJECTIVE_HINTS[sceneId] || getFallbackHint(scene);
    return Object.freeze({
        sceneId,
        chapter: scene.chapter,
        title: resolveHintText(authored.title, context) || scene.title || `第 ${scene.chapter} 章行動`,
        text: resolveHintText(authored.text, context),
        placeId: resolveHintText(authored.placeId, context) || null,
        actorId: resolveHintText(authored.actorId, context) || null,
        targetId: Object.prototype.hasOwnProperty.call(authored, 'targetId')
            ? (resolveHintText(authored.targetId, context) || null)
            : (getSceneRegionBinding(sceneId)?.targetId || null),
        stageClass: scene.stageClass
    });
}
