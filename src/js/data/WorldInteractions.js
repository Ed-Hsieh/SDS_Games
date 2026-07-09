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
    village_elder_intro: {
        id: 'village_elder_intro',
        title: '村長的第一個警告',
        source: InteractionSource.WORLD_OBJECT,
        oneTime: true,
        flags: ['metVillageElder', 'town.elder.first_warning', 'town.network.first_recovery_named'],
        unlockQuests: ['main_001'],
        unlockRecipes: [],
        autoAcceptQuests: true,
        showQuestUnlockMessages: false,
        message: '奧倫把濕紙攤在桌上。手指停在南門外三個小記號上，指節沾著乾泥。',
        repeatMessage: '南門外的三個記號仍壓在公告板下。紙角發皺，像路還沒完全睡穩。',
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
        message: '你把公告板上的舊紙撕下，重新釘好。墨味很新，木板縫裡還卡著雨水。',
        repeatMessage: '公告板已經整理過。新紙在風裡沙沙響，像有人正在小聲點名。',
        imageKeys: ['world.notice_board']
    },
    scholar_slime_request: {
        id: 'scholar_slime_request',
        title: '伊萊的路線索引',
        source: InteractionSource.WORLD_OBJECT,
        oneTime: true,
        flags: ['heardScholarSlimeRequest', 'town.scholar.first_index_open'],
        unlockQuests: [],
        unlockRecipes: [],
        autoAcceptQuests: false,
        showQuestUnlockMessages: false,
        message: '伊萊把第一頁索引壓平。南門農田、獵人棧道、舊營火點，三個地名被寫成一條能走的線。',
        repeatMessage: '第一份路線索引已經攤在書桌上。泥味和墨味黏在同一頁。',
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
        unlockQuests: ['dungeon_cave_001'],
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
        message: '蕾恩把一段荒唐的節奏傳聞壓低聲音念完。聽起來像玩笑，末尾卻準確指向一條不該有回聲的路。',
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
        message: '黑市商人交出一枚黑煤籌碼。它不燙，卻把掌心染得發黑，像某種還沒開始討債的名字。',
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
        message: '瑪菈把荊棘放進小碗裡碾碎。苦味先冒出來，接著是很淡的青草氣。她沒有笑，但眼神亮了一下。',
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
        message: '地圖碎片被壓平、對齊、重新描線。幾個紅圈落在邊角，像有人終於承認那裡不是空白。',
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
