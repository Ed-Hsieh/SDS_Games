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
        message: '你找到一只被泥土埋住的藍圖匣。裡面的紙不完整，但足夠提醒玩家：鍛造不是裝飾，而是一條穩定成長路線。',
        repeatMessage: '藍圖匣已經被翻找過，只剩潮濕的紙屑和幾道看不懂的折痕。',
        imageKeys: ['world.blueprint_cache', 'item.blueprint_scroll']
    },
    village_elder_intro: {
        id: 'village_elder_intro',
        title: '村長的第一個警告',
        source: InteractionSource.WORLD_OBJECT,
        oneTime: true,
        flags: ['metVillageElder', 'town.network.first_recovery_named'],
        unlockQuests: ['main_001'],
        unlockRecipes: [],
        autoAcceptQuests: true,
        showQuestUnlockMessages: false,
        message: '奧倫把城鎮目前的斷點攤開：南門、藥櫃、冷爐、書庫與市集都需要重新接上。',
        repeatMessage: '奧倫已經把第一批復興方向交代清楚。',
        imageKeys: ['npc.village_elder', 'world.notice_board']
    },
    crossroads_notice_board: {
        id: 'crossroads_notice_board',
        title: '破損公告板',
        source: InteractionSource.WORLD_OBJECT,
        oneTime: true,
        flags: ['readCrossroadsNoticeBoard', 'town.crossroads.notice_read'],
        unlockQuests: [],
        unlockRecipes: [],
        message: '你把公告板上殘留的紙條重新排好：藥櫃缺材料、鐵匠鋪冷爐、南門缺巡線、市集沒有穩定貨源。',
        repeatMessage: '公告板已經整理過，第一批城鎮復興節點清楚地釘在上面。',
        imageKeys: ['world.notice_board']
    },
    scholar_slime_request: {
        id: 'scholar_slime_request',
        title: '學者的第一份怪物索引',
        source: InteractionSource.WORLD_OBJECT,
        oneTime: true,
        flags: ['heardScholarSlimeRequest', 'town.scholar.first_index_open'],
        unlockQuests: ['main_002'],
        unlockRecipes: [],
        autoAcceptQuests: true,
        showQuestUnlockMessages: false,
        message: '伊萊開始建立第一份怪物索引。這會把怪物掉落、素材用途與戰鬥準備接回同一個系統。',
        repeatMessage: '第一份怪物索引已經建立，接下來要靠更多戰鬥紀錄補齊。',
        imageKeys: ['npc.scholar', 'world.notice_board']
    },
    crossroads_beggar: {
        id: 'crossroads_beggar',
        title: '街角乞者的暗示',
        source: InteractionSource.WORLD_OBJECT,
        oneTime: false,
        flags: [],
        unlockQuests: [],
        unlockRecipes: [],
        progressObjectives: [
            {
                type: 'talk',
                target: 'beggar',
                amount: 1,
                message: '你和街角乞者交談過，他似乎知道黑市入口不只是一扇門。'
            }
        ],
        message: '街角乞者把話說得像玩笑，但他的暗示很明確：背街有第三方來源，只是還沒輪到你進門。',
        repeatMessage: '街角乞者依舊坐在原處，像是在等你拿出真正的暗號。',
        imageKeys: ['npc.beggar']
    },
    special_bounty_notice: {
        id: 'special_bounty_notice',
        title: '精英懸賞告示',
        source: InteractionSource.MAP_EVENT,
        oneTime: true,
        flags: ['readSpecialBountyNotice', 'town.rumor.elite_warning_open'],
        unlockQuests: ['bounty_elite_001'],
        unlockRecipes: [],
        message: '你讀到一張被重新釘上的精英懸賞。它提醒玩家：菁英怪不只是更硬的小怪，而是高風險、高價值的重複挑戰目標。',
        repeatMessage: '精英懸賞已經被記錄進書庫與情報板。',
        imageKeys: ['world.notice_board']
    },
    ruin_tablet_trace: {
        id: 'ruin_tablet_trace',
        title: '遺跡石板痕跡',
        source: InteractionSource.WORLD_OBJECT,
        oneTime: true,
        flags: ['foundRuinTabletTrace'],
        unlockQuests: ['dungeon_cave_001'],
        unlockRecipes: [],
        message: '石板上的刻痕指向第一個副本入口。副本應該提供更特殊的素材、裝備和藍圖，而不是只當怪物房。',
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
        message: '塔的符文仍在發亮，但目前只保留為壓迫感與未來重做伏筆。相關怪物、裝備與圖像先不新增。',
        repeatMessage: '塔的符文記憶已經被記錄；真正重做會等光明副本與後期反制完成後再接上。',
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
        message: '你找到一件熄滅的鍛造核心。它證明鍛造進階不該憑空開放，而該由副本素材與藍圖推動。',
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
        unlockQuests: ['commission_merchant_001'],
        unlockRecipes: ['goblin_trickster_charm'],
        autoAcceptQuests: true,
        missingMessage: '你還沒有能作為暗號的古幣。',
        message: '古幣被收下後，背街的門不再假裝自己只是牆。黑市入口開放，但代價會被記在後面。',
        repeatMessage: '黑市入口已經打開，背街的交易不會再回到完全無害的狀態。',
        imageKeys: ['item.ancient_coin', 'world.black_market_door']
    },
    rumor_echo_rhythm: {
        id: 'rumor_echo_rhythm',
        title: '回聲節奏傳聞',
        source: InteractionSource.VENDOR_ITEM,
        oneTime: true,
        flags: ['market.rumor.echo_rhythm_matched'],
        unlockQuests: [],
        unlockRecipes: [],
        message: '蕾恩把一段看似荒唐的節奏傳聞轉成可用線索。這類情報之後應該服務副本準備、怪物弱點或特殊路線。',
        repeatMessage: '回聲節奏已經被記錄，傳聞不會重複變成新的線索。',
        imageKeys: ['world.notice_board']
    },
    black_market_coal_token: {
        id: 'black_market_coal_token',
        title: '黑煤籌碼',
        source: InteractionSource.VENDOR_ITEM,
        oneTime: true,
        flags: ['market.black_market.coal_token_traded', 'town.black_market.debt_marked'],
        unlockQuests: [],
        unlockRecipes: [],
        message: '黑市商人交出一枚黑煤籌碼。它不是立即懲罰，而是未來庫存、債務與結局陰影的記名點。',
        repeatMessage: '黑煤籌碼已經登記，黑市不會把這筆交易忘掉。',
        imageKeys: ['world.black_market_door']
    },
    thorn_bargain_choice: {
        id: 'thorn_bargain_choice',
        title: '荊棘交易',
        source: InteractionSource.WORLD_OBJECT,
        oneTime: true,
        flags: ['town.apothecary.understands_thorn_trade'],
        unlockQuests: [],
        unlockRecipes: [],
        message: '瑪菈理解了荊棘素材的用途。這會讓市場的解毒、抗性與毒系素材交易開始有劇情理由。',
        repeatMessage: '荊棘交易已經被藥櫃記錄。',
        imageKeys: ['npc.herbalist']
    },
    cartographer_map_fragment: {
        id: 'cartographer_map_fragment',
        title: '地圖碎片交付',
        source: InteractionSource.VENDOR_ITEM,
        oneTime: true,
        requiredItems: [{ id: 'map_fragment', quantity: 1, name: '地圖碎片' }],
        consumeRequiredItems: true,
        flags: ['mapFragmentDelivered'],
        unlockQuests: ['bounty_elite_001'],
        unlockRecipes: [],
        missingMessage: '你還沒有可交付的地圖碎片。',
        message: '地圖碎片被整理成可用路線。新的精英懸賞與冒險目標被標到地圖上。',
        repeatMessage: '這份地圖碎片已經交付並被整理。',
        imageKeys: ['item.map_fragment', 'world.notice_board']
    }
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
