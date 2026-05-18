/**
 * WorldInteractions.js
 * Central registry for discoveries that can unlock quests, flags, shops, or later world objects.
 */

export const InteractionSource = {
    MAP_EVENT: 'map_event',
    WORLD_OBJECT: 'world_object',
    VENDOR_ITEM: 'vendor_item',
    TOWER: 'tower',
    DUNGEON: 'dungeon',
    BATTLE_DROP: 'battle_drop'
};

export const WorldInteractionDatabase = {
    field_blueprint_cache: {
        id: 'field_blueprint_cache',
        title: '殘破製作圖匣',
        source: InteractionSource.MAP_EVENT,
        oneTime: true,
        flags: ['foundBlueprintCache'],
        unlockQuests: ['commission_forge_001'],
        unlockRecipes: ['wolf_cloak', 'wolf_fang_necklace', 'greater_health_potion'],
        message: '你整理出一份和鍛造有關的製作線索。',
        repeatMessage: '圖匣裡只剩無法辨識的碎紙。',
        imageKeys: ['world.blueprint_cache', 'item.blueprint_scroll']
    },
    crossroads_notice_board: {
        id: 'crossroads_notice_board',
        title: '冒險公告欄',
        source: InteractionSource.WORLD_OBJECT,
        oneTime: true,
        flags: ['readCrossroadsNoticeBoard'],
        unlockQuests: ['main_001', 'bounty_001'],
        message: '公告欄上貼著城外路標拓印與新的懸賞。有人把安全區的異常標成了第一條旅途線索。',
        repeatMessage: '公告欄上暫時沒有新的懸賞。',
        imageKeys: ['world.notice_board']
    },
    crossroads_beggar: {
        id: 'crossroads_beggar',
        title: '巷口流浪者',
        source: InteractionSource.WORLD_OBJECT,
        oneTime: false,
        flags: [],
        unlockQuests: [],
        unlockRecipes: [],
        progressObjectives: [
            { type: 'talk', target: 'beggar', amount: 1, message: '巷口流浪者的話被記入隱藏線索。' }
        ],
        message: '他低聲說：「口袋空了，人才會看見路邊真正有用的東西。」',
        repeatMessage: '巷口流浪者仍坐在陰影裡，像是在等下一個一無所有的人。',
        imageKeys: ['npc.beggar']
    },
    special_bounty_notice: {
        id: 'special_bounty_notice',
        title: '特殊懸賞單',
        source: InteractionSource.MAP_EVENT,
        oneTime: true,
        flags: ['readSpecialBountyNotice'],
        unlockQuests: ['bounty_elite_001'],
        unlockRecipes: [],
        message: '你記下了特殊懸賞單的目標，新的高危委託已加入任務列表。',
        repeatMessage: '這張特殊懸賞單的內容你已經記下了。',
        imageKeys: ['world.notice_board']
    },
    ruin_tablet_trace: {
        id: 'ruin_tablet_trace',
        title: '刻痕石碑',
        source: InteractionSource.WORLD_OBJECT,
        oneTime: true,
        flags: ['foundRuinTabletTrace'],
        unlockQuests: ['dungeon_cave_001'],
        unlockRecipes: [],
        message: '石碑上的刻痕不是文字，而是一條通往幽暗洞窟的舊路線。',
        repeatMessage: '你已經拓印過這座石碑。',
        imageKeys: ['world.ruin_tablet']
    },
    tower_glyph_memory: {
        id: 'tower_glyph_memory',
        title: '塔壁符文',
        source: InteractionSource.TOWER,
        oneTime: true,
        flags: ['foundTowerGlyphMemory'],
        unlockQuests: [],
        unlockRecipes: [],
        message: '符文記錄了一段關於高階裝備的古老規則。',
        repeatMessage: '符文的光已經沉寂。',
        imageKeys: ['world.tower_glyph']
    },
    dungeon_forge_relic: {
        id: 'dungeon_forge_relic',
        title: '熄滅的遠古爐心',
        source: InteractionSource.DUNGEON,
        oneTime: true,
        flags: ['foundDungeonForgeRelic'],
        unlockQuests: [],
        unlockRecipes: [],
        message: '爐心雖然熄滅，仍殘留能重鑄詞條的痕跡。',
        repeatMessage: '爐心已經沒有新的反應。',
        imageKeys: ['world.ancient_forge_core']
    },
    merchant_ancient_coin: {
        id: 'merchant_ancient_coin',
        title: '古代錢幣',
        source: InteractionSource.VENDOR_ITEM,
        oneTime: true,
        requiredItems: [{ id: 'ancient_coin', quantity: 1, name: '古代錢幣' }],
        consumeRequiredItems: true,
        flags: ['secretShopUnlocked', 'merchantAncientCoinAccepted'],
        unlockQuests: ['commission_merchant_001'],
        unlockRecipes: ['goblin_trickster_charm'],
        missingMessage: '商人端詳著你，等著那枚真正的古代錢幣。',
        message: '商人收下古代錢幣，暗巷裡的黑市入口被打開，也留下新的委託線索。',
        repeatMessage: '黑市入口已經被打開。',
        imageKeys: ['item.ancient_coin', 'world.black_market_door']
    },
    cartographer_map_fragment: {
        id: 'cartographer_map_fragment',
        title: '地圖碎片',
        source: InteractionSource.VENDOR_ITEM,
        oneTime: true,
        requiredItems: [{ id: 'map_fragment', quantity: 1, name: '地圖碎片' }],
        consumeRequiredItems: true,
        flags: ['mapFragmentDelivered'],
        unlockQuests: ['bounty_elite_001'],
        unlockRecipes: [],
        missingMessage: '這條線索需要一張可以辨認路徑的地圖碎片。',
        message: '你把地圖碎片交給旅行商人，他拼出一段危險路徑，特殊懸賞被記入線索簿。',
        repeatMessage: '這張地圖碎片已經被拼進商人的舊地圖。',
        imageKeys: ['item.map_fragment', 'world.notice_board']
    }
};

export const ImageAssetRequests = [
    {
        key: 'scene.lobby_crossroads',
        type: 'background',
        usage: '大廳主場景，用於承接任務、鍛造、冒險入口與世界切換感。',
        promptHint: '2D fantasy town crossroads, readable paths to forge, market, gate, and tower, warm but not cluttered'
    },
    {
        key: 'scene.forge_workshop',
        type: 'background',
        usage: '鍛造、強化、詞條重鑄畫面背景。',
        promptHint: 'fantasy forge workshop, anvil, furnace, material shelves, usable UI-friendly composition'
    },
    {
        key: 'scene.market_stalls',
        type: 'background',
        usage: '市集與黑市交易場景背景。',
        promptHint: 'fantasy marketplace stalls, item displays, side area for hidden black market entrance'
    },
    {
        key: 'scene.adventure_lowlands',
        type: 'background',
        usage: '低階冒險區背景與轉場。',
        promptHint: 'fantasy lowland road, grass, small ruins, clear central path'
    },
    {
        key: 'scene.adventure_ruins',
        type: 'background',
        usage: '中高階冒險區、石碑與遺跡觸發點。',
        promptHint: 'ancient fantasy ruins, stone tablets, readable interactive points'
    },
    {
        key: 'scene.endless_tower',
        type: 'background',
        usage: '無盡塔入口與塔內樓層轉場。',
        promptHint: 'tower interior, vertical depth, glowing glyphs, combat-ready layout'
    },
    {
        key: 'world.blueprint_cache',
        type: 'object',
        usage: '地圖事件：殘破製作圖匣。',
        promptHint: 'small broken scroll case with blueprint fragments, transparent background'
    },
    {
        key: 'item.blueprint_scroll',
        type: 'item_icon',
        usage: '製作圖、配方碎片、任務線索圖示。',
        promptHint: 'fantasy blueprint scroll icon, readable silhouette, transparent background'
    },
    {
        key: 'world.ruin_tablet',
        type: 'object',
        usage: '地圖物件：刻痕石碑，可觸發探索線索。',
        promptHint: 'ancient carved stone tablet, glowing scratches, transparent background'
    },
    {
        key: 'world.notice_board',
        type: 'object',
        usage: '大廳世界物件：冒險公告欄，觸發懸賞與城鎮委託線索。',
        promptHint: 'fantasy town notice board with pinned bounty papers, transparent background'
    },
    {
        key: 'world.tower_glyph',
        type: 'object',
        usage: '無盡塔符文互動點。',
        promptHint: 'glowing tower wall glyph, magical inscription, transparent background'
    },
    {
        key: 'world.ancient_forge_core',
        type: 'object',
        usage: '副本物件：遠古爐心，連到重鑄/鍛造系統。',
        promptHint: 'extinguished ancient forge core, cracked metal and ember glow, transparent background'
    },
    {
        key: 'item.ancient_coin',
        type: 'item_icon',
        usage: '特殊物品：古代錢幣，開啟黑市與商人委託。',
        promptHint: 'ancient fantasy coin icon, worn symbol, transparent background'
    },
    {
        key: 'world.black_market_door',
        type: 'object',
        usage: '黑市入口/解鎖視覺。',
        promptHint: 'hidden black market doorway, subtle lantern light, transparent background'
    },
    {
        key: 'npc.blacksmith',
        type: 'portrait',
        usage: '只在鍛造師相關任務或關鍵互動時顯示。',
        promptHint: 'fantasy blacksmith portrait, practical gear, warm forge light'
    },
    {
        key: 'npc.secret_vendor',
        type: 'portrait',
        usage: '黑市或特殊交易事件顯示。',
        promptHint: 'mysterious fantasy vendor portrait, masked, dim lantern, not cartoonish'
    }
];

export function getWorldInteraction(interactionId) {
    return WorldInteractionDatabase[interactionId] || null;
}
