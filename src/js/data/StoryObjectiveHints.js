import { getStoryScene } from './StorySceneRegistry.js';
import { getSceneRegionBinding } from './ChapterRegionRegistry.js';

const CHAPTER_ONE_SURVEY_IDS = Object.freeze([
    'south_gate_farmland',
    'hunter_boardwalk',
    'old_campfire_site'
]);

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
        title: '先站穩，再追查道路',
        text: ({ discoveredLandmarkIds = [], chapterOneFieldVictories = 0 } = {}) => {
            const discovered = new Set(discoveredLandmarkIds);
            const current = CHAPTER_ONE_SURVEY_IDS.filter(id => discovered.has(id)).length;
            const victories = Math.max(0, Number(chapterOneFieldVictories) || 0);
            if (current === 0 && victories < 2) {
                return `先在南門荒地完成戰鬥（${victories}/2），再調查南門農田。`;
            }
            if (current === 0) return '前往南門農田，調查異常匯集的足跡。';
            if (current === 1 && victories < 5) {
                return `沿農田外圍累積實戰準備（${victories}/5），再前往獵人棧道。`;
            }
            if (current === 1) return '前往獵人棧道，檢查被重新打過的銀線繩結。';
            if (current === 2 && victories < 7) {
                return `在濕地林緣完成準備（${victories}/7），再調查舊營火點。`;
            }
            if (current === 2) return '前往舊營火點，確認灰燼下仍在延伸的黑根。';
            return '三處道路痕跡已齊，整理手札中的共同方向。';
        }
    },
    ch1_s07_silver_snare: {
        title: '追查銀線陷阱',
        text: '前往銀絲伏道，查明是什麼東西改動了路標。'
    },
    ch1_s08_cold_forge_smoke: {
        title: '把證據帶回冷爐',
        text: '返回鐵匠鋪，請鐵匠檢查銀線、甲殼與受損裝備。',
        placeId: 'forge',
        actorId: 'blacksmith'
    },
    ch1_s09_rotroot_approach: {
        title: '追蹤向北的根脈',
        text: '前往腐根溪谷，沿黑色根痕追查森林異常。'
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
        title: authored.title || scene.title || `第 ${scene.chapter} 章行動`,
        text: resolveHintText(authored.text, context),
        placeId: authored.placeId || null,
        actorId: authored.actorId || null,
        targetId: authored.targetId || getSceneRegionBinding(sceneId)?.targetId || null,
        stageClass: scene.stageClass
    });
}

export { CHAPTER_ONE_SURVEY_IDS };
