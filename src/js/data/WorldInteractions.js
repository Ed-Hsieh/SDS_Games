/**
 * WorldInteractions.js
 * Clean interaction registry for town, map, vendor, dungeon, and story-object
 * discoveries.
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
        title: '野外藍圖匣',
        source: InteractionSource.MAP_EVENT,
        oneTime: true,
        flags: ['foundBlueprintCache'],
        unlockQuests: [],
        unlockRecipes: [],
        message: '你找到一只被泥土埋住的藍圖匣。紙頁缺了角，鉛灰沾滿指腹；它不像寶藏，更像有人把活路折起來藏進土裡。',
        repeatMessage: '藍圖匣已經被翻找過，只剩潮濕的紙屑和幾道看不懂的折痕。',
        imageKeys: ['world.blueprint_cache', 'item.blueprint_scroll']
    },
    crossroads_notice_board: {
        id: 'crossroads_notice_board',
        title: '破損公告板',
        source: InteractionSource.WORLD_OBJECT,
        oneTime: true,
        flags: ['readCrossroadsNoticeBoard', 'town.crossroads.notice_read'],
        unlockQuests: [],
        unlockRecipes: [],
        message: '你把公告板上的舊紙撕下，重新釘好。墨味很新，木板縫裡還卡著雨水。',
        repeatMessage: '公告板已經整理過。新紙在風裡沙沙響，像有人正在小聲點名。',
        imageKeys: ['world.notice_board']
    },
    special_bounty_notice: {
        id: 'special_bounty_notice',
        title: '精英懸賞告示',
        source: InteractionSource.MAP_EVENT,
        oneTime: true,
        flags: ['readSpecialBountyNotice', 'town.rumor.elite_warning_open'],
        unlockQuests: [],
        unlockRecipes: [],
        message: '你讀到一張重新釘上的精英懸賞。紙上沒有英雄話，只有幾行很冷的提醒：牠難纏，牠值錢，別空手去。',
        repeatMessage: '精英懸賞已經被記錄進書庫與情報板。',
        imageKeys: ['world.notice_board']
    },
    ruin_tablet_trace: {
        id: 'ruin_tablet_trace',
        title: '遺跡石板痕跡',
        source: InteractionSource.WORLD_OBJECT,
        oneTime: true,
        flags: ['foundRuinTabletTrace'],
        unlockQuests: [],
        unlockRecipes: [],
        message: '石板上的刻痕指向第一個副本入口。字縫裡有灰，像某個地方在地下悶了很久，等人把門重新摸出來。',
        repeatMessage: '石板痕跡已經被抄進書庫索引。',
        imageKeys: ['world.ruin_tablet']
    },
    tower_glyph_memory: {
        id: 'tower_glyph_memory',
        title: '封塔符文記憶',
        source: InteractionSource.TOWER,
        oneTime: true,
        flags: ['foundTowerGlyphMemory'],
        unlockQuests: [],
        unlockRecipes: [],
        message: '塔的符文仍在發亮。光貼著石縫慢慢爬，沒有溫度，只讓人想起某扇不該太早打開的門。',
        repeatMessage: '塔的符文記憶已經被記錄。石縫裡的光還在，只是暫時沒有人靠近。',
        imageKeys: ['world.tower_glyph']
    },
    dungeon_forge_relic: {
        id: 'dungeon_forge_relic',
        title: '副本中的鍛造遺物',
        source: InteractionSource.DUNGEON,
        oneTime: true,
        flags: ['foundDungeonForgeRelic'],
        unlockQuests: [],
        unlockRecipes: [],
        message: '你找到一件熄滅的鍛造核心。金屬裡還殘著焦味，像一座很久以前死去的爐子，牙根仍在發熱。',
        repeatMessage: '鍛造遺物已經被送回冷爐鐵匠鋪研究。',
        imageKeys: ['world.ancient_forge_core']
    },
    merchant_ancient_coin: {
        id: 'merchant_ancient_coin',
        title: '古幣暗號',
        source: InteractionSource.VENDOR_ITEM,
        oneTime: true,
        requiredItems: [{ id: 'ancient_coin', quantity: 1, name: '古幣' }],
        consumeRequiredItems: true,
        flags: ['secretShopUnlocked', 'merchantAncientCoinAccepted', 'town.black_market.contact_open'],
        unlockQuests: [],
        unlockRecipes: ['goblin_trickster_charm'],
        autoAcceptQuests: true,
        missingMessage: '你還沒有能作為暗號的古幣。',
        message: '古幣被收下後，背街的門不再假裝自己只是牆。黑市入口開放，但代價會被記在後面。',
        repeatMessage: '黑市入口已經打開，背街的交易不會再回到完全無害的狀態。',
        imageKeys: ['item.ancient_coin', 'world.black_market_door']
    },
    // Map-owned vendor exchanges are added only after route functionality and
    // reward sources are approved together.
};

export const ImageAssetRequests = [
    {
        key: 'world.blueprint_cache',
        type: 'object',
        usage: '野外藍圖匣',
        promptHint: 'weathered blacksmith notebook and loose workshop notes, transparent background'
    },
    {
        key: 'world.ruin_tablet',
        type: 'object',
        usage: '遺跡石板',
        promptHint: 'ancient carved stone tablet, glowing scratches, transparent background'
    },
    {
        key: 'world.notice_board',
        type: 'object',
        usage: '城鎮公告板',
        promptHint: 'fantasy town notice board with pinned bounty papers, transparent background'
    },
    {
        key: 'world.tower_glyph',
        type: 'object',
        usage: '封塔符文',
        promptHint: 'glowing tower wall glyph, magical inscription, transparent background'
    },
    {
        key: 'world.ancient_forge_core',
        type: 'object',
        usage: '副本鍛造核心',
        promptHint: 'extinguished ancient forge core, cracked metal and ember glow, transparent background'
    },
    {
        key: 'item.ancient_coin',
        type: 'item_icon',
        usage: '古幣暗號',
        promptHint: 'ancient fantasy coin icon, worn symbol, transparent background'
    },
    {
        key: 'world.black_market_door',
        type: 'object',
        usage: '黑市入口',
        promptHint: 'hidden black market doorway, subtle lantern light, transparent background'
    }
];

export function getWorldInteraction(interactionId) {
    return WorldInteractionDatabase[interactionId] || null;
}
