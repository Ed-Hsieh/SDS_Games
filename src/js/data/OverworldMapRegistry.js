import {
    getGeneratedLandmarkImage,
    getGeneratedTownPlaceImage,
    getGeneratedWorldMapImage
} from './AssetManifest.js';
import { getChapterLocation, getChapterRegion } from './ChapterRegionRegistry.js';

export const OVERWORLD_ID = 'frontier_overworld_v2';
export const WORLD_CELL_SIZE = 32;
export const WORLD_TILE_COLS = 48;
export const WORLD_TILE_ROWS = 32;
const READY_OVERWORLD_CHAPTERS = Object.freeze([1, 2, 3, 4, 5, 6, 7]);
export const WORLD_COLS = WORLD_TILE_COLS * Math.max(...READY_OVERWORLD_CHAPTERS);
export const WORLD_ROWS = 32;

function createOverworldTile(chapter) {
    const region = getChapterRegion(chapter);
    const visual = region?.visual;
    if (!region || !visual?.tileId || !visual?.backgroundId) {
        throw new Error(`Chapter ${chapter} has no playable overworld presentation`);
    }
    return Object.freeze({
        id: visual.tileId,
        chapter,
        regionId: region.regionId,
        title: visual.mapTitle || region.title,
        subtitle: visual.subtitle || `第 ${chapter} 區域`,
        x: (chapter - 1) * WORLD_TILE_COLS,
        y: 0,
        cols: WORLD_TILE_COLS,
        rows: WORLD_TILE_ROWS,
        imageId: visual.backgroundId,
        image: getGeneratedWorldMapImage(visual.backgroundId)
    });
}

export const OverworldMapTiles = Object.freeze(READY_OVERWORLD_CHAPTERS.map(createOverworldTile));

export const OverworldHabitats = Object.freeze([
    Object.freeze({
        id: 'south_gate_verge',
        chapter: 1,
        name: '南門荒地',
        rect: Object.freeze({ x: 0, y: 0, width: 11, height: 32 }),
        levelRange: Object.freeze([1, 3]),
        threat: 'low',
        encounterRate: 0.07,
        safeSteps: 7,
        monsterIds: Object.freeze(['slime', 'goblin', 'giant_rat'])
    }),
    Object.freeze({
        id: 'abandoned_farmland',
        chapter: 1,
        name: '荒廢農田',
        rect: Object.freeze({ x: 11, y: 0, width: 13, height: 32 }),
        levelRange: Object.freeze([1, 4]),
        threat: 'low',
        encounterRate: 0.085,
        safeSteps: 6,
        monsterIds: Object.freeze(['slime', 'goblin', 'wild_wolf', 'giant_rat'])
    }),
    Object.freeze({
        id: 'wet_woodland',
        chapter: 1,
        name: '濕地林緣',
        rect: Object.freeze({ x: 24, y: 0, width: 11, height: 32 }),
        levelRange: Object.freeze([2, 4]),
        threat: 'guarded',
        encounterRate: 0.1,
        safeSteps: 5,
        monsterIds: Object.freeze(['giant_rat', 'goblin', 'wild_wolf'])
    }),
    Object.freeze({
        id: 'rotroot_woodland',
        chapter: 1,
        name: '腐根林地',
        rect: Object.freeze({ x: 35, y: 0, width: 13, height: 32 }),
        levelRange: Object.freeze([4, 9]),
        threat: 'dangerous',
        encounterRate: 0.12,
        safeSteps: 4,
        monsterIds: Object.freeze(['wild_wolf', 'poison_spider', 'stone_golem_mini', 'treant'])
    }),
    Object.freeze({
        id: 'broken_evacuation_road',
        chapter: 2,
        name: '斷裂撤離路',
        rect: Object.freeze({ x: 48, y: 0, width: 12, height: 32 }),
        levelRange: Object.freeze([11, 13]),
        threat: 'guarded',
        encounterRate: 0.09,
        safeSteps: 6,
        monsterIds: Object.freeze(['skeleton', 'skeleton_warrior', 'cave_bat'])
    }),
    Object.freeze({
        id: 'mist_tablet_country',
        chapter: 2,
        name: '霧碑丘地',
        rect: Object.freeze({ x: 60, y: 0, width: 12, height: 32 }),
        levelRange: Object.freeze([12, 18]),
        threat: 'guarded',
        encounterRate: 0.1,
        safeSteps: 5,
        monsterIds: Object.freeze(['ghost', 'cave_bat', 'glimmer_sprite'])
    }),
    Object.freeze({
        id: 'moon_moss_slope',
        chapter: 2,
        name: '月苔坡',
        rect: Object.freeze({ x: 72, y: 0, width: 10, height: 15 }),
        levelRange: Object.freeze([15, 19]),
        threat: 'dangerous',
        encounterRate: 0.105,
        safeSteps: 5,
        monsterIds: Object.freeze(['glimmer_sprite', 'ghost', 'rune_wisp'])
    }),
    Object.freeze({
        id: 'opened_tomb_country',
        chapter: 2,
        name: '掘開古墓地',
        rect: Object.freeze({ x: 72, y: 15, width: 24, height: 17 }),
        levelRange: Object.freeze([11, 19]),
        threat: 'dangerous',
        encounterRate: 0.125,
        safeSteps: 4,
        monsterIds: Object.freeze(['skeleton', 'skeleton_warrior', 'ghost', 'rune_wisp'])
    }),
    Object.freeze({
        id: 'north_tomb_ridge',
        chapter: 2,
        name: '古墓北脊',
        rect: Object.freeze({ x: 82, y: 0, width: 14, height: 15 }),
        levelRange: Object.freeze([13, 19]),
        threat: 'severe',
        encounterRate: 0.14,
        safeSteps: 4,
        monsterIds: Object.freeze(['skeleton_warrior', 'stone_golem', 'rune_wisp'])
    }),
    Object.freeze({
        id: 'dead_checkpoint_country',
        chapter: 3,
        name: '廢棄關卡地',
        rect: Object.freeze({ x: 96, y: 0, width: 16, height: 32 }),
        levelRange: Object.freeze([13, 24]),
        threat: 'guarded',
        encounterRate: 0.1,
        safeSteps: 5,
        monsterIds: Object.freeze(['ghost', 'skeleton_warrior', 'shadow_soldier'])
    }),
    Object.freeze({
        id: 'shadow_watch_country',
        chapter: 3,
        name: '霧中守夜線',
        rect: Object.freeze({ x: 112, y: 0, width: 16, height: 32 }),
        levelRange: Object.freeze([21, 27]),
        threat: 'dangerous',
        encounterRate: 0.115,
        safeSteps: 5,
        monsterIds: Object.freeze(['shadow_soldier', 'shadow_archer', 'shadow_halberdier'])
    }),
    Object.freeze({
        id: 'black_iron_command_country',
        chapter: 3,
        name: '黑鐵指揮線',
        rect: Object.freeze({ x: 128, y: 0, width: 16, height: 32 }),
        levelRange: Object.freeze([23, 29]),
        threat: 'severe',
        encounterRate: 0.13,
        safeSteps: 4,
        monsterIds: Object.freeze(['shadow_archer', 'shadow_halberdier', 'shadow_mage'])
    }),
    Object.freeze({
        id: 'gray_ridge_highlands',
        chapter: 4,
        name: '灰脊山路',
        rect: Object.freeze({ x: 144, y: 0, width: 48, height: 32 }),
        levelRange: Object.freeze([31, 37]),
        threat: 'dangerous',
        encounterRate: 0.11,
        safeSteps: 5,
        monsterIds: Object.freeze([
            'ancient_guardian',
            'crystal_golem',
            'earth_elemental',
            'rune_keeper'
        ])
    }),
    Object.freeze({
        id: 'four_front_fire',
        chapter: 5,
        name: '熾熱前線',
        rect: Object.freeze({ x: 192, y: 0, width: 12, height: 32 }),
        levelRange: Object.freeze([41, 46]),
        threat: 'dangerous',
        encounterRate: 0.115,
        safeSteps: 5,
        monsterIds: Object.freeze(['fire_elemental', 'ember_beast'])
    }),
    Object.freeze({
        id: 'four_front_ice',
        chapter: 5,
        name: '霜寒前線',
        rect: Object.freeze({ x: 204, y: 0, width: 12, height: 32 }),
        levelRange: Object.freeze([41, 47]),
        threat: 'dangerous',
        encounterRate: 0.115,
        safeSteps: 5,
        monsterIds: Object.freeze(['ice_elemental', 'frost_wolf'])
    }),
    Object.freeze({
        id: 'four_front_thunder',
        chapter: 5,
        name: '雷暴前線',
        rect: Object.freeze({ x: 216, y: 0, width: 12, height: 32 }),
        levelRange: Object.freeze([43, 49]),
        threat: 'dangerous',
        encounterRate: 0.12,
        safeSteps: 4,
        monsterIds: Object.freeze(['thunder_elemental', 'storm_raptor', 'starvein_lurker'])
    }),
    Object.freeze({
        id: 'four_front_poison',
        chapter: 5,
        name: '毒瘴前線',
        rect: Object.freeze({ x: 228, y: 0, width: 12, height: 32 }),
        levelRange: Object.freeze([44, 49]),
        threat: 'severe',
        encounterRate: 0.125,
        safeSteps: 4,
        monsterIds: Object.freeze(['poison_frog', 'vine_beast', 'starvein_lurker'])
    }),
    Object.freeze({
        id: 'northern_drake_country',
        chapter: 6,
        name: '北境龍哨',
        rect: Object.freeze({ x: 240, y: 0, width: 16, height: 32 }),
        levelRange: Object.freeze([51, 54]),
        threat: 'dangerous',
        encounterRate: 0.11,
        safeSteps: 5,
        monsterIds: Object.freeze(['cliffscale_hatchling', 'wyvern', 'sealstone_guardian'])
    }),
    Object.freeze({
        id: 'seal_scar_perimeter',
        chapter: 6,
        name: '封痕外圍',
        rect: Object.freeze({ x: 256, y: 0, width: 16, height: 32 }),
        levelRange: Object.freeze([52, 57]),
        threat: 'dangerous',
        encounterRate: 0.12,
        safeSteps: 4,
        monsterIds: Object.freeze(['wyvern', 'drake', 'dragon_seal_sentinel'])
    }),
    Object.freeze({
        id: 'dragon_held_line',
        chapter: 6,
        name: '龍族守線',
        rect: Object.freeze({ x: 272, y: 0, width: 16, height: 32 }),
        levelRange: Object.freeze([53, 59]),
        threat: 'severe',
        encounterRate: 0.135,
        safeSteps: 4,
        monsterIds: Object.freeze(['sealstone_guardian', 'dragon_seal_adept', 'dragon_knight'])
    })
]);

function landmark(config) {
    return Object.freeze({
        kind: 'landmark',
        interactionRadius: 1,
        storyFlag: null,
        bossId: null,
        ...config,
        image: config.imageId ? getGeneratedLandmarkImage(config.imageId) : ''
    });
}

const ChapterOneLandmarkPresentation = Object.freeze({
    prologue_impact_site: {
        firstText: '霧停在斷坡上方，路邊只剩被撞碎的石塊與壓倒的草。',
        repeatText: '斷坡仍留著第一次調查時看不清全貌的撞擊痕跡。'
    },
    south_gate_farmland: {
        firstText: '田埂沒有荒到認不出路。半乾的泥裡，一串靴印走到水溝前又折回；獸爪則從四面踩進同一條溝，彼此沒有追逐。\n\n我蹲下比對深淺。人還走過這裡，怪物卻像在同一刻換了方向。',
        repeatText: '腳印仍留在原地。這裡屬於南門荒廢農田。'
    },
    hunter_boardwalk: {
        firstText: '濕木踩下去時發出空響，護欄內側黏著幾縷銀亮細線。它們繞過木樁，停在旅人膝後的高度。\n\n一處繩結被重新打過，結口朝著回城方向。這不是遺落的獵具。有人，或某種東西，在試著讀懂折返的人。',
        repeatText: '濕木仍承受得住重量，但更深處的繩結並非獵人留下。'
    },
    old_campfire_site: {
        firstText: '表層灰燼濕冷，手指撥開後，底下卻冒出一點不合時節的餘溫。黑色細根穿過火坑，焦亮汁痕一路留在北側。\n\n營火早就熄了。這道傷比營火更新，而且仍在往前。',
        repeatText: '營火沒有再燃起，旅人手札保留了灰燼的位置。'
    },
    silver_snare_pass: {
        storyFlag: 'story.ch1.silver_snare_active',
        firstText: '銀絲在林間收緊，伏獵者只會在劇情啟動後現身。'
    },
    rotroot_ravine: {
        storyFlag: 'story.ch1.rotroot_active',
        firstText: '發黑樹皮沿著溪谷向北收縮，森林深處的根心正承受不屬於此地的壓力。',
        repeatText: '黑根仍向北收縮，手札已把方向與古樹根心連在一起。'
    },
    split_vein_cave: {
        storyFlag: 'quest.vein_beneath_the_roots.accepted',
        firstText: '黑根從裂開的岩縫垂進地下，碰到石壁後傳回比根室更深的回音。舊木樁上留著礦工刻痕；這是一條被地脈震裂後重新露出的礦道。',
        repeatText: '幽暗洞窟入口仍在腐根側路下方。進入前應備妥火把、藥水與可長時間作戰的裝備。'
    },
    old_wolf_den: {
        storyFlag: 'story.ch1.forest_guardian_active',
        firstText: '森林守護者的聚合點只在主線收束時出現。'
    }
});

const ChapterTwoLandmarkPresentation = Object.freeze({
    mist_tablet_hill: {
        firstText: '石碑指向撤離方向，名字卻被後來的人逐筆補在箭頭旁。',
        repeatText: '霧仍遮住遠方，石碑上的方向已被記進手札。'
    },
    moon_moss_slope: {
        firstText: '月苔沿著獸群遷徙留下的凹痕發亮。',
        repeatText: '坡面的微光沒有擴張，遷徙痕跡仍通往北側。'
    },
    opened_ancient_tomb: {
        storyFlag: 'story.ch2.lich_active',
        firstText: '古墓入口只有在第二章主線收束時顯露真正的守墓者。'
    },
    north_checkpoint_marker: {
        storyFlag: 'boss.lich.defeated',
        firstText: '找回的路牌被影子守著。牠們保持人類隊列的間距，並不像聚集在一起的魔物。',
        repeatText: '影子的站位仍像一條沒有收到撤回命令的巡查線。'
    }
});

const ChapterThreeLandmarkPresentation = Object.freeze({
    dead_checkpoint: {
        firstText: '關卡的門扇倒在路旁，地上還留著整齊站位的痕跡。守在這裡的影子沒有離開。',
        repeatText: '廢棄關卡仍維持著舊日隊列，通往北側的路已記入手札。'
    },
    night_watch_line: {
        firstText: '幾盞舊燈隔著霧排開，燈油早已乾涸，石座旁卻留著近期踩過的泥痕。',
        repeatText: '守夜線沿著霧地延伸，熄滅的燈座仍能辨認方向。'
    },
    sunken_altar_reef: {
        firstText: '退水露出半座石壇，濕泥裡傳來斷續的人聲。聲音沒有隨潮水退去。',
        repeatText: '石壇仍泡在淺水裡，回聲從裂開的基座下方傳出。'
    },
    old_command_post: {
        firstText: '黑鐵倉門半開，命令牌與空箭囊散在桌邊。最後一份調度令沒有寫下撤退。',
        repeatText: '舊指揮所保留著未完成的調度，前方就是仍被守住的缺口。'
    },
    shadow_command_yard: {
        firstText: '指揮場沒有屍體，只有被反覆踩實的隊列。甲片碰撞聲從霧後逐步靠近。',
        repeatText: '左線指揮場仍留著守軍站位，黑鐵地面沒有被風沙掩去。'
    }
});

const ChapterFourLandmarkPresentation = Object.freeze({
    stone_route_entry: {
        firstText: '石路在腳下輕輕震動。碎石沿著坡面滑落，前方的車轍被新裂縫截斷。',
        repeatText: '裂縫還在擴大。灰脊方向不時傳來石塊落下的聲音。'
    },
    thorn_glasshouse_ruin: {
        firstText: '傾倒的溫室被荊棘封住。玻璃後方仍有枝條摩擦的聲音。',
        repeatText: '荊棘纏住破裂的窗架，溫室內部仍然無法看清。'
    },
    gray_ridge_entry: {
        firstText: '入口旁有翻倒的貨車，輪軸還沾著新泥。灰脊後段傳來斷續的呼喊。',
        repeatText: '貨車仍堵在入口旁。撤離的人正沿著灰脊往回走。'
    },
    rear_marker: {
        firstText: '後標木樁倒在路邊。貨車堵住窄口，還有人困在另一側。',
        repeatText: '窄口尚未清空。後方的人只能依序穿過貨車留下的空隙。'
    },
    center_span_marker: {
        firstText: '橋面不斷落石，中央跨度已經裂開。撤離隊伍正從兩側通過。',
        repeatText: '橋上的裂口繼續加深。留在後方的人正在加快腳步。'
    },
    titan_vein_ruins: {
        firstText: '地面向上抬起，埋在山腹裡的古代石構露了出來。城鎮的退路就在遺跡前方。',
        repeatText: '古代石構仍在震動，裸露的刻槽一路延伸進山裡。'
    }
});

const ChapterFiveLandmarkPresentation = Object.freeze({
    four_front_nexus: {
        firstText: '四條路在裸露的岩盤上交會。熱氣、霜痕、焦痕與腐蝕留下的色澤彼此壓在一起。',
        repeatText: '四線仍在這裡交會，岩縫間的震動沒有停下。'
    },
    elemental_core: {
        firstText: '前方的地面不斷隆起又落下。四股力量都朝同一處擠壓，連站穩都變得困難。',
        repeatText: '元素核心留下的裂口仍在發熱，周圍沒有恢復平靜。'
    },
    emergency_return_marker: {
        firstText: '回程線上散著剛崩落的碎石。原本平直的路被截成兩段，只剩側邊還能勉強通過。',
        repeatText: '崩落處已經不再擴大，碎石下仍傳來細小的摩擦聲。'
    },
    old_waystation_cache: {
        firstText: '廢棄驛站的牆根有一塊石板被人重新挪過。灰塵很厚，縫裡卻留著新鮮刮痕。',
        repeatText: '石板下的藏庫已經打開，舊驛站又只剩風聲。'
    }
});

const ChapterSixLandmarkPresentation = Object.freeze({
    northern_drake_watch: {
        firstText: '龍哨的圍欄多處燒黑，守望台仍朝著封痕方向。山風帶來焦石與硫磺的氣味。',
        repeatText: '北境龍哨仍能辨認封痕方向，沿途沒有新的撤回標記。'
    },
    dragon_heat_crag: {
        firstText: '裂脊下方冒著熱氣，幼龍留下的抓痕停在岩縫前。這條支路不通往封痕主線。',
        repeatText: '熱氣仍從岩縫升起，龍類活動的痕跡沒有越過裂脊。'
    },
    seal_warning_line: {
        firstText: '成排封石攔在山路中央。碎片散落在界線外側，沒有爪痕，也沒有拔出武器的痕跡。',
        repeatText: '封石界線仍在原地，散落碎片的位置已被完整記下。'
    },
    elder_dragon_line: {
        firstText: '寬路在龍族守線前停住。焦黑石面沒有衝鋒痕跡，只有長久駐守留下的磨損。',
        repeatText: '龍族守線仍封住寬路，界線後方的地面持續震動。'
    },
    broad_road_collapse: {
        firstText: '寬路在前方整片坍塌，斷面露出被抽空的岩層。繼續前進已經不可能。',
        repeatText: '坍塌沒有停止，能走的只剩折回山腹的舊路。'
    },
    old_route_mouth: {
        firstText: '狹窄舊路藏在倒石後方。風穿過彎道，帶回比腳步更早抵達的回聲。',
        repeatText: '舊路回音口仍通往更高處，手札已記下入口的位置。'
    }
});

const ChapterSevenLandmarkPresentation = Object.freeze({
    old_mountain_road: {
        firstText: '舊山路沿著岩壁往上。轉角太窄，前方的腳印總會先消失一段。',
        repeatText: '山路仍沿著岩壁向上，碎石間留著通往高處的足跡。'
    },
    ruined_flower_field: {
        firstText: '焦土間還留著一朵白瓣淡綠花心的小花。有人剛來過，卻沒有留下回程腳印。',
        repeatText: '倒石中央仍留著那朵花，山風穿過崩壞的舊田界。'
    },
    final_mountain_camp: {
        firstText: '營地只剩磨刀石、繃帶與最後一份補給。再往前就是墜落地。',
        repeatText: '三只外殼與工具仍放在桌上，前方的黑色脈絡緩慢鼓動。'
    },
    demon_fall_site: {
        firstText: '岩層向內塌成巨大的凹地。黑色脈絡從中央鑽入四周石壁。',
        repeatText: '墜落地深處仍傳來低沉的搏動。'
    }
});

function getPlayableLocation(chapter, locationId) {
    const region = getChapterRegion(chapter);
    const tile = OverworldMapTiles.find(entry => entry.chapter === chapter);
    if (!region || !tile) throw new Error(`Chapter ${chapter} has no playable overworld tile`);
    const node = getChapterLocation(chapter, locationId);
    if (!node) throw new Error(`Chapter ${chapter} is missing location ${locationId}`);
    return Object.freeze({
        node,
        x: tile.x + node.position.x,
        y: tile.y + node.position.y
    });
}

function createChapterLandmarks(chapter, presentations) {
    return Object.entries(presentations).map(([locationId, presentation]) => {
        const { node, x, y } = getPlayableLocation(chapter, locationId);
        return landmark({
            ...presentation,
            id: node.id,
            name: node.name,
            x,
            y,
            imageId: node.imageId || null,
            bossId: node.bossId,
            dungeonId: node.dungeonId || null,
            sceneIds: node.sceneIds,
            prerequisites: node.prerequisites
        });
    });
}

export const OverworldLandmarks = Object.freeze([
    ...createChapterLandmarks(1, ChapterOneLandmarkPresentation),
    ...createChapterLandmarks(2, ChapterTwoLandmarkPresentation),
    ...createChapterLandmarks(3, ChapterThreeLandmarkPresentation),
    ...createChapterLandmarks(4, ChapterFourLandmarkPresentation),
    ...createChapterLandmarks(5, ChapterFiveLandmarkPresentation),
    ...createChapterLandmarks(6, ChapterSixLandmarkPresentation),
    ...createChapterLandmarks(7, ChapterSevenLandmarkPresentation)
]);

export const OverworldRouteGates = Object.freeze([
    Object.freeze({
        id: 'rotroot_broken_bridge',
        name: '腐根斷橋',
        kind: 'route_gate',
        x: 47,
        y: 16,
        interactionRadius: 1,
        discoveryFlag: 'map.landmarks.rotroot_broken_bridge.discovered',
        openFlag: 'map.gates.rotroot_broken_bridge.open',
        blockedRect: Object.freeze({ x: 47, y: 0, width: 2, height: 32 }),
        passageRect: Object.freeze({ x: 47, y: 13, width: 2, height: 7 }),
        blockedImageId: 'rotroot_bridge_blocked',
        blockedImage: getGeneratedLandmarkImage('rotroot_bridge_blocked'),
        repairedImageId: 'rotroot_bridge_repaired',
        repairedImage: getGeneratedLandmarkImage('rotroot_bridge_repaired'),
        blockedText: '腐根壓垮了舊橋。裂谷另一側可以看見撤離隊留下的木樁，但目前沒有任何安全通路。',
        repeatText: '橋仍然斷著。主線處理森林壓力並完成修復前，這裡無法通行。',
        resolvedText: '腐根被清除後，城鎮重新架起橋面。這裡不再是地標，只是一段可以通過的道路。'
    })
]);

export const SecondRunOvercapBossReserves = Object.freeze([
    Object.freeze({
        chapter: 1,
        key: 'prologue_blood_moon_stag',
        workingName: '迷霧中的巨影',
        runtimeBossId: 'blood_moon_stag',
        anchor: '南路斷坡與開場衝撞留下的角痕',
        mapPlan: Object.freeze({ column: 8, row: 24 }),
        revealWindow: '第二輪；路線與挑戰時機暫緩',
        purpose: '讓玩家循著開場的衝撞路徑辨認受詛咒影響的血月角鹿。'
    }),
    Object.freeze({
        chapter: 2,
        key: 'nameless_curse',
        workingName: '無名之咒',
        anchor: '掘開古墓北側、撤離名冊未曾記錄的埋葬盆地',
        mapPlan: Object.freeze({ column: 5, row: 6 }),
        revealWindow: '第二輪第二至第三章',
        purpose: '讓大量遺體與遺失姓名被壓成同一個詛咒，而不是再造一位亡者之王。'
    }),
    Object.freeze({
        chapter: 3,
        key: 'expedition_supreme_commander',
        workingName: '遠征總隊長',
        anchor: '舊指揮所下方封死的總隊作戰層',
        mapPlan: Object.freeze({ column: 7, row: 4 }),
        revealWindow: '第二輪第五至第六章',
        purpose: '揭露地方線指揮之外，遠征最前端如何決定繼續深入。'
    }),
    Object.freeze({
        chapter: 4,
        key: 'ash_baron_external',
        workingName: '灰燼男爵',
        runtimeBossId: 'ash_baron',
        anchor: '灰脊東側的封閉灰燼貨運領',
        mapPlan: Object.freeze({ column: 8, row: 3 }),
        revealWindow: '第二輪第三至第四章',
        purpose: '揭露貨運權、煤印契約與區域剝削。'
    }),
    Object.freeze({
        chapter: 5,
        key: 'entropy_balance_external',
        workingName: '熵',
        anchor: '元素領主死亡後失去互相制衡的四象高原',
        mapPlan: Object.freeze({ column: 7, row: 1 }),
        revealWindow: '第二輪第五章後；路線暫緩',
        purpose: '呈現四項能量失衡後出現的暴烈平衡機制；熵不是第五元素。'
    }),
    Object.freeze({
        chapter: 6,
        key: 'light_trial_external',
        workingName: '光明試煉者',
        runtimeBossId: 'aurora_archon',
        anchor: '龍族守線之外、由微光痕跡顯露的黎明迴廊',
        mapPlan: Object.freeze({ column: 3, row: 1 }),
        revealWindow: '第二輪第六章',
        purpose: '完成正式光明路線，讓玩家以自己選擇的武器形式取得對抗虛空的方法。'
    }),
    Object.freeze({
        chapter: 7,
        key: 'void_revelation_external',
        workingName: '虛空債主化身',
        anchor: '真結局後由賭場契約打開的獨立空間，不佔普通地表',
        mapPlan: Object.freeze({ layer: 'contract_void_pocket' }),
        revealWindow: '第二輪真結局後',
        purpose: '用第六章取得的光明揭露並錨定虛空目標，再銜接賭場債主、塔與 DLC。'
    })
]);

const SouthGateEntry = getPlayableLocation(1, 'south_gate_entry');
const PrologueMistApproach = Object.freeze({ x: 8, y: 29 });
const PrologueRouteBounds = Object.freeze([
    Object.freeze({ x: 7, y: 23, width: 3, height: 7 })
]);

export const OverworldMapConfig = Object.freeze({
    id: OVERWORLD_ID,
    cols: WORLD_COLS,
    rows: WORLD_ROWS,
    cellSize: WORLD_CELL_SIZE,
    startPosition: Object.freeze({ x: SouthGateEntry.x, y: SouthGateEntry.y }),
    prologueStartPosition: PrologueMistApproach,
    prologueRouteBounds: PrologueRouteBounds,
    tiles: OverworldMapTiles,
    habitats: OverworldHabitats,
    landmarks: OverworldLandmarks,
    routeGates: OverworldRouteGates,
    townReturn: Object.freeze({
        kind: 'town_return',
        id: SouthGateEntry.node.id,
        name: SouthGateEntry.node.name,
        x: SouthGateEntry.x,
        y: SouthGateEntry.y,
        interactionRadius: 1,
        image: getGeneratedTownPlaceImage('gate'),
        text: '沿著南門殘階返回城鎮。'
    }),
    secondRunBossReserves: SecondRunOvercapBossReserves
});

function contains(rect, x, y) {
    return x >= rect.x
        && y >= rect.y
        && x < rect.x + rect.width
        && y < rect.y + rect.height;
}

export function getOverworldTileAt(x, y) {
    return OverworldMapTiles.find(tile => contains({
        x: tile.x,
        y: tile.y,
        width: tile.cols,
        height: tile.rows
    }, x, y)) || null;
}

export function getOverworldHabitatAt(x, y) {
    return OverworldHabitats.find(habitat => contains(habitat.rect, x, y)) || null;
}

export function isPointInsideRect(rect, x, y) {
    return contains(rect, x, y);
}
