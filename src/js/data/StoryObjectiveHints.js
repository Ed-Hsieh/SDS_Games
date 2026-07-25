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
        text: '沿南路前進，找到迷霧中的未知地點並按 F 調查。'
    },
    ch1_s02_wake_under_bitter_bottles: {
        title: '先處理傷勢',
        text: '返回村鎮，讓救下你的米婭處理傷口。',
    },
    ch1_s03_broken_crossroads: {
        title: '回程板上的空行',
        text: '前往村鎮十字路口，向村長說明南路的情況。',
    },
    ch1_s04_elder_to_scholar: {
        title: '找出紀錄重疊的位置',
        text: '前往書記小屋，向伊萊核對三名巡路人最後留下的路線紀錄。',
    },
    ch1_s05_south_gate_introduction: {
        title: '先查第一段路',
        text: '前往南門登記。芙蕾與塔維會依最後目擊，替你確認第一段安全調查路線。',
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
        }
    },
    ch1_s07_silver_snare: {
        title: '回程路標轉向了',
        text: '追蹤被挪動的銀線，查明是誰改變了回程路標。線索從舊營火點往東北延伸，銀線會在靠近伏道時重新出現。',
    },
    ch1_s08_cold_forge_smoke: {
        title: '把證據帶回冷爐',
        text: '返回鐵匠鋪。伊萊與村長會在冷爐前核對道路證據，鐵匠則需要你留下的銀線修復風箱。',
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
            return '兩段腐根實戰已完成。沿根脈前進，記下裂縫後的第二道震動；你可以直接深入根心，也可以先回城請伊萊追查舊礦道。';
        }
    },
    ch1_s10_forest_guardian: {
        title: '確認守護者在保護什麼',
        text: '前往古樹根心。先觀察守護者會阻止哪些動作，再決定如何取得根心證據。'
    },
    ch1_s11_roads_breathe_again: {
        title: ({ chapterOneClosingReportStage = null } = {}) => (
            chapterOneClosingReportStage?.title || '第一章道路結案'
        ),
        text: ({ chapterOneClosingReportStage = null } = {}) => (
            chapterOneClosingReportStage?.text || '道路調查結果已分別交給需要處理的人。'
        )
    },
    ch2_s01_empty_crates: {
        title: '檢查空箱與貨印',
        text: '前往市集邊棚，查問重新開通道路送回的空箱。',
    },
    ch2_s02_name_under_basket: {
        title: '藥草籃下的名字',
        text: '前往米婭的工作間，核對空箱上的舊貨印與人名。',
    },
    ch2_s03_ledger_that_would_not_close: {
        title: '核對未結的撤離帳',
        text: '前往書記小屋，與伊萊核對最後一份有效的撤離紀錄。',
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
    },
    ch2_s08_shadow_at_the_checkpoint: {
        title: '調查北向廢棄關卡',
        text: '前往北向廢棄關卡，記下守在路標旁的影子陣形。'
    },
    ch3_s01_dead_checkpoint: {
        title: '穿過仍在巡查的關卡',
        text: '前往廢棄關卡，查明黑影為何反覆巡查同一條路。',
    },
    ch3_s02_shadows_count_names: {
        title: '核對影子留下的裝備',
        text: '把關卡取得的肩扣與斷刃帶回鐵匠鋪，請鐵匠與伊萊核對配發印。',
    },
    ch3_s03_lamp_oil_in_fog: {
        title: '檢查前往指揮所的守夜線',
        text: '入夜後前往霧中守夜線，與芙蕾、塔維確認回程標記。',
    },
    ch3_s04_showcase_glass: {
        title: '看看玻璃櫃裡的獎品',
        text: '可選：進入玻璃櫃賭場，查看沒有標價的展示品。',
    },
    ch3_s05_blank_creditor_trace: {
        title: '追查收據上的賣方記號',
        text: '可選：前往背巷黑市，詢問展示櫃收據上的記號。',
    },
    ch3_s06_drowned_voice: {
        title: '追查退潮後的鐘聲',
        text: '可選：沿海岸支路前往浮出祭壇，查明聲音從何而來。',
    },
    ch3_s07_old_command_post: {
        title: '進入舊指揮所',
        text: '沿黑鐵舊路前往舊指揮所，找出仍在支配關卡影子的命令。',
    },
    ch3_s08_shadow_commander: {
        title: '終止左線的命令',
        text: '進入左線指揮場，擊敗仍在守住缺口的凱德倫。',
    },
    ch3_s09_temptation_and_orders: {
        title: '把凱德倫的刀帶回城鎮',
        text: '返回公務桌，讓伊萊、村長與鐵匠核對刀上的使用痕跡。',
    },
    ch4_s01_road_moves_underfoot: {
        title: '追上失聯的商隊後段',
        text: '前往移動石路，沿車轍與同步裂開的擋土牆追查後段商隊。',
    },
    ch4_s02_caravan_rear_missing: {
        title: '核對商隊名冊',
        text: '前往市集邊棚，確認沒有通過灰脊的車輛、人員與撤離器材。',
    },
    ch4_s03_thorn_value_rule: {
        title: '荊棘溫室的交換',
        text: '可選：前往荊棘溫室遺址，查明黑刺如何侵入仍然存活的主藤。',
    },
    ch4_s04_gray_ridge_evacuates: {
        title: '趕到灰脊後段',
        text: '前往灰脊入口。先把受困者分成能看見前旗與後燈的兩隊，再開始撤離。',
    },
    ch4_s05_body_locks: {
        title: '點亮後標',
        text: '前往後標燈位。後隊看不見前旗，燈一旦熄滅就會失去移動方向。',
    },
    ch4_s06_flag_returns: {
        title: '守住中央跨度',
        text: '前往中央跨度，讓最後一批受困者在道路再次抬升前通過。',
    },
    ch4_s07_titan_rises: {
        title: '阻止泰坦踏斷退路',
        text: '前往地脈遺跡。泰坦正朝山中流失力量的方向前進，剩下的商隊退路就在它腳下。',
    },
    ch4_s08_returned_objects: {
        title: '清點回城的人與物',
        text: '前往鐵匠鋪，交回前旗扣與後燈，確認灰脊撤離後仍需要處理的傷勢。',
    },
    ch4_s09_four_elements_one_report: {
        title: '比對遺跡的四條刻槽',
        text: '前往書記小屋，把遺跡拓圖與火災、霜裂、雷擊和毒斑的紀錄疊在一起。',
    },
    ch5_s01_four_fronts_converge: {
        title: '比對四條異常',
        text: '前往書記小屋。四處回報都指向山裡，需要把路線、傷勢與損壞裝備放在一起確認。',
    },
    ch5_s02_forge_contracts: {
        title: '準備四線裝備',
        text: '前往鐵匠鋪，依火、冰、雷與毒的實際紀錄準備裝備，並檢查會接觸殘留的工具。',
    },
    ch5_s03_elemental_convergence: {
        title: '追查四線交會',
        text: '前往四象交會線，沿四條前線留下的痕跡找出它們共同流向的位置。',
    },
    ch5_s04_elemental_lord: {
        title: '進入元素核心',
        text: '前往元素收束核心。四種力量正在同一處反覆成形。',
    },
    ch5_s05_fourfold_shrapnel: {
        title: '沿緊急回程線撤離',
        text: '保持碎片原位，沿固定路線返回城鎮。途中不進行採集或其他戰鬥。',
    },
    ch5_s06_mia_operation: {
        title: '送往米婭的工作間',
        text: '立即前往米婭的工作間。傷者不能自行移動，也不能先拔出碎片。',
    },
    ch5_s07_after_the_ratchet: {
        title: '核對手術留下的紀錄',
        text: '前往書記小屋，把工具、原始頁與處理摘要放在一起，確認哪一步超出了原有證據。',
    },
    ch5_s08_expedition_list: {
        title: '重建二十年前的路線',
        text: '留在書記小屋，核對遠征名冊、補給編次與封痕碎片的收存紀錄。',
    },
    ch5_s09_whistle_cache: {
        title: '查看新露出的藏庫',
        text: '前往舊驛站藏庫。山體移動後，原本封住的石縫已經露出入口。',
    },
    ch5_s10_before_dawn: {
        title: '確認村長的去向',
        text: '前往書記小屋。封痕碎片與一份乾糧同時不見，需要先確認村長留下的行蹤。',
    },
    ch5_s11_town_loses_its_voice: {
        title: '看看城鎮留下的變化',
        text: '前往賭場。城鎮各處的聲音已經改變，維斯珀也正在準備一場尚未結束的清算。',
    },
    ch6_s01_northern_drake_watch: {
        title: '沿村長的腳印上山',
        text: '前往北境龍哨，沿補過的鞋印追上獨自離城的村長。',
    },
    ch6_s02_scar_aftermath: {
        title: '調查封痕警戒線',
        text: '檢查警戒石外的腳印、武器、碎片與灼痕方向。',
    },
    ch6_s03_stop_before_the_line: {
        title: '面對守線的龍',
        text: '留在警戒線外，聽完龍族長者的警告再決定下一步。',
    },
    ch6_s04_dragon_convergence: {
        title: '處理封痕前的衝突',
        text: '前往龍族守線。留意警戒線、碎片與武器會讓對方作出什麼反應。',
    },
    ch6_s05_after_the_broad_road: {
        title: '查看寬路盡頭',
        text: '沿封火外側前進，確認崩壁後是否仍有可通行的空腔。',
    },
    ch6_s06_settlement_throw: {
        title: '回城見證賭桌清算',
        text: '前往賭場。維斯珀正用一場賭局處理洛恩留下的抵押。',
    },
    ch6_s07_house_changes_seats: {
        title: '看完未結清的賭局',
        text: '留在主桌，確認誰帶走契約、骰子與尚未清償的責任。',
    },
    ch6_s08_brush_past_or_invitation: {
        title: '在鎮邊試吹回聲哨',
        text: '離開賭場後試吹長短音，留意誰認得這種哨聲。',
    },
    ch6_s09_the_old_note_answers: {
        title: '循回音找到舊路',
        text: '前往舊路回音口，利用盲彎返回的聲音辨認石壁後的空腔。',
    },
    ch7_s01_narrow_human_road: {
        title: '舊山路',
        text: '沿著岩壁間的窄路前進。轉彎前先聽哨聲，別踏回崩落的正面山道。',
    },
    ch7_s02_ruined_flower_field: {
        title: '約定之地',
        text: '調查毀壞的花田，確認先行者留下的痕跡通往哪裡。',
    },
    ch7_s03_echo_memory: {
        title: '花田回聲',
        text: '留在花田，聽完艾洛終於想起的那段往事。',
    },
    ch7_s04_three_anchor_check: {
        title: '最後的準備',
        text: '前往山路盡頭的營地，檢查武器、補給與一路帶來的三份證據。',
    },
    ch7_s05_fall_site_audience: {
        title: '墜落之地',
        text: '進入山腹凹地，找到仍在岩層中央呼吸的魔王。',
    },
    ch7_s06_combat_body_falls: {
        title: '倒下的身體',
        text: '確認魔王的身體是否真的停止活動。',
    },
    ch7_s07_last_core: {
        title: '最後的核心',
        text: '檢查胸口裂縫與周圍黑脈，不要在仍有搏動時離開。',
    },
    ch7_s08_return_to_town: {
        title: '回到城鎮',
        text: '穿過南門回到廣場。留下的人正在等這場戰鬥的消息。',
    },
    ch7_s09_first_or_second_epilogue: {
        title: '回聲盡頭，花仍會開',
        text: '看完這一趟留下的結果。',
    }
});

const TOWN_NPC_ACTION_COPY = Object.freeze({
    'chapter-one-first-report': Object.freeze({
        title: '回報道路調查',
        text: '把南路調查的結果交給守門人。'
    }),
    'chapter-one-home-recovery': Object.freeze({
        title: '檢查傷勢',
        text: '讓米婭確認你目前的身體狀況。'
    }),
    'chapter-one-closing-report': Object.freeze({
        title: '交付道路結果',
        text: '向目前負責的人交代道路調查結果。'
    }),
    'mia-emergency-potions': Object.freeze({
        title: '補充應急藥',
        text: '請米婭補足外出所需的應急藥水。'
    })
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
        return { title, text: '前往手札標出的地點，確認那裡留下了什麼。' };
    }
    return { title, text: '沿目前能通行的道路探索，留意尚未記錄的地點。' };
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
        stageClass: scene.stageClass
    });
}

export function getTownNpcActionCopy(type) {
    return TOWN_NPC_ACTION_COPY[type] || null;
}
