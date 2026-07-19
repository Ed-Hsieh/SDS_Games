import {
    getGeneratedLandmarkImage,
    getGeneratedTownPlaceImage,
    getGeneratedWorldMapImage
} from './AssetManifest.js';

export const OVERWORLD_ID = 'frontier_overworld_v2';
export const WORLD_CELL_SIZE = 32;
export const WORLD_TILE_COLS = 48;
export const WORLD_TILE_ROWS = 32;
export const WORLD_COLS = 96;
export const WORLD_ROWS = 32;

export const OverworldMapTiles = Object.freeze([
    Object.freeze({
        id: 'south_gate_borderland',
        chapter: 1,
        regionId: 'chapter_01_south_gate',
        title: '南門外林地',
        subtitle: '第一區域',
        x: 0,
        y: 0,
        cols: WORLD_TILE_COLS,
        rows: WORLD_TILE_ROWS,
        imageId: 'overworld_south_gate',
        image: getGeneratedWorldMapImage('overworld_south_gate')
    }),
    Object.freeze({
        id: 'broken_evacuation_basin',
        chapter: 2,
        regionId: 'chapter_02_broken_evacuations',
        title: '斷裂撤離盆地',
        subtitle: '第二區域',
        x: WORLD_TILE_COLS,
        y: 0,
        cols: WORLD_TILE_COLS,
        rows: WORLD_TILE_ROWS,
        imageId: 'overworld_evacuation_basin',
        image: getGeneratedWorldMapImage('overworld_evacuation_basin')
    })
]);

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
        fatigueCost: 1,
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
        fatigueCost: 1,
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
        fatigueCost: 1,
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
        fatigueCost: 2,
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
        fatigueCost: 2,
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
        fatigueCost: 2,
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
        fatigueCost: 2,
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
        fatigueCost: 2,
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
        fatigueCost: 3,
        monsterIds: Object.freeze(['skeleton_warrior', 'stone_golem', 'rune_wisp'])
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

export const OverworldLandmarks = Object.freeze([
    landmark({
        id: 'south_gate_farmland',
        name: '南門農田',
        x: 15,
        y: 16,
        imageId: 'south_gate_farmland',
        firstText: '田埂沒有荒到認不出路。半乾的泥裡，一串靴印走到水溝前又折回；獸爪則從四面踩進同一條溝，彼此沒有追逐。\n\n我蹲下比對深淺。人還走過這裡，怪物卻像在同一刻換了方向。',
        repeatText: '腳印仍留在原地。這裡屬於南門荒廢農田。'
    }),
    landmark({
        id: 'hunter_boardwalk',
        name: '獵人棧道',
        x: 28,
        y: 8,
        imageId: 'hunter_boardwalk',
        firstText: '濕木踩下去時發出空響，護欄內側黏著幾縷銀亮細線。它們繞過木樁，停在旅人膝後的高度。\n\n一處繩結被重新打過，結口朝著回城方向。這不是遺落的獵具。有人，或某種東西，在試著讀懂折返的人。',
        repeatText: '濕木仍承受得住重量，但更深處的繩結並非獵人留下。'
    }),
    landmark({
        id: 'old_campfire_site',
        name: '舊營火點',
        x: 29,
        y: 24,
        imageId: 'old_campfire_site',
        firstText: '表層灰燼濕冷，手指撥開後，底下卻冒出一點不合時節的餘溫。黑色細根穿過火坑，焦亮汁痕一路留在北側。\n\n營火早就熄了。這道傷比營火更新，而且仍在往前。',
        repeatText: '營火沒有再燃起，旅人手札保留了灰燼的位置。'
    }),
    landmark({
        id: 'silver_snare_pass',
        name: '銀絲伏道',
        x: 39,
        y: 9,
        imageId: 'silver_snare_pass',
        storyFlag: 'story.ch1.silver_snare_active',
        bossId: 'ambush_mantis',
        firstText: '銀絲在林間收緊，伏獵者只會在劇情啟動後現身。'
    }),
    landmark({
        id: 'rotroot_ravine',
        name: '腐根溪谷',
        x: 35,
        y: 19,
        imageId: 'rotroot_ravine',
        storyFlag: 'story.ch1.silver_snare_cleared',
        firstText: '發黑樹皮沿著溪谷向北收縮，森林深處的根心正承受不屬於此地的壓力。',
        repeatText: '黑根仍向北收縮，手札已把方向與古樹根心連在一起。'
    }),
    landmark({
        id: 'old_wolf_den',
        name: '古樹根心',
        x: 42,
        y: 19,
        imageId: 'old_wolf_den',
        storyFlag: 'story.ch1.forest_guardian_active',
        bossId: 'forest_guardian',
        firstText: '森林守護者的聚合點只在主線收束時出現。'
    }),
    landmark({
        id: 'mist_tablet_hill',
        name: '霧碑丘',
        x: 65,
        y: 17,
        imageId: 'mist_tablet_hill',
        firstText: '石碑指向撤離方向，名字卻被後來的人逐筆補在箭頭旁。',
        repeatText: '霧仍遮住遠方，石碑上的方向已被記進手札。'
    }),
    landmark({
        id: 'moon_moss_slope',
        name: '月苔坡',
        x: 74,
        y: 8,
        imageId: 'moon_moss_slope',
        firstText: '月苔沿著獸群遷徙留下的凹痕發亮。',
        repeatText: '坡面的微光沒有擴張，遷徙痕跡仍通往北側。'
    }),
    landmark({
        id: 'opened_ancient_tomb',
        name: '掘開古墓',
        x: 89,
        y: 17,
        imageId: 'opened_ancient_tomb',
        storyFlag: 'story.ch2.lich_active',
        bossId: 'lich',
        firstText: '古墓入口只有在第二章主線收束時顯露真正的守墓者。'
    }),
    landmark({
        id: 'north_checkpoint_marker',
        name: '北向廢棄關卡',
        x: 93,
        y: 25,
        imageId: 'cut_roadsign',
        storyFlag: 'boss.lich.defeated',
        firstText: '找回的路牌被影子守著。牠們保持人類隊列的間距，並不像聚集在一起的魔物。',
        repeatText: '影子的站位仍像一條沒有收到撤回命令的巡查線。'
    })
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
        mapPlan: Object.freeze({ column: 1, row: 6 }),
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

export const OverworldMapConfig = Object.freeze({
    id: OVERWORLD_ID,
    cols: WORLD_COLS,
    rows: WORLD_ROWS,
    cellSize: WORLD_CELL_SIZE,
    startPosition: Object.freeze({ x: 6, y: 16 }),
    tiles: OverworldMapTiles,
    habitats: OverworldHabitats,
    landmarks: OverworldLandmarks,
    routeGates: OverworldRouteGates,
    townReturn: Object.freeze({
        kind: 'town_return',
        id: 'south_gate_entry',
        name: '南門入口',
        x: 3,
        y: 17,
        interactionRadius: 1,
        image: getGeneratedTownPlaceImage('gate'),
        text: '沿著南門殘階往回走，就能回到城鎮。'
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
