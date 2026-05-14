/**
 * RecipeDiscoveries.js
 * Story gates for forge recipes. Recipe stats/costs stay in Recipes.js.
 */

export const DefaultKnownRecipeIds = [
    'iron_sword',
    'leather_armor',
    'health_potion_basic'
];

export const RecipeDiscoveryDatabase = {
    bone_blade: {
        source: '殘破製作圖匣',
        clue: '圖紙邊角畫著骨片與鐵礦的固定比例。',
        interactionId: 'field_blueprint_cache'
    },
    wolf_cloak: {
        source: '殘破製作圖匣',
        clue: '圖紙用粗線標出獸皮縫合的受力點。',
        interactionId: 'field_blueprint_cache'
    },
    wolf_fang_necklace: {
        source: '殘破製作圖匣',
        clue: '圖紙背面記著以獸牙作為護符核心的做法。',
        interactionId: 'field_blueprint_cache'
    },
    greater_health_potion: {
        source: '殘破製作圖匣',
        clue: '夾頁裡有一份被藥水漬染開的高階藥劑比例。',
        interactionId: 'field_blueprint_cache'
    },

    guardian_armor: {
        source: '刻痕石碑',
        clue: '石碑拓印像是一副舊式守衛甲的結構圖。',
        interactionId: 'ruin_tablet_trace'
    },
    gargoyle_bulwark: {
        source: '刻痕石碑',
        clue: '碑面圖案描出石翼盾牌的折線與重心。',
        interactionId: 'ruin_tablet_trace'
    },
    bone_soul_staff: {
        source: '刻痕石碑',
        clue: '石碑底部刻著骨杖與靈魂碎片的符號。',
        interactionId: 'ruin_tablet_trace'
    },

    poison_dagger: {
        source: '古代錢幣',
        clue: '黑市收藏清單提到一把塗毒匕首。',
        interactionId: 'merchant_ancient_coin'
    },
    goblin_trickster_charm: {
        source: '古代錢幣',
        clue: '黑市暗號能換到哥布林護符的製作手記。',
        interactionId: 'merchant_ancient_coin'
    },
    hydra_fang_dagger: {
        source: '古代錢幣',
        clue: '黑市手記記載了多頭蛇牙的研磨角度。',
        interactionId: 'merchant_ancient_coin'
    },

    shadow_blade: {
        source: '遠古爐心',
        clue: '熄滅爐心裡殘留暗影鋼的鍛造溫度。',
        interactionId: 'dungeon_forge_relic'
    },
    shadow_armor: {
        source: '遠古爐心',
        clue: '爐心外殼上刻著暗影甲片的排列方式。',
        interactionId: 'dungeon_forge_relic'
    },
    shadow_ring: {
        source: '遠古爐心',
        clue: '灰燼中留下暗影戒指的內側符文。',
        interactionId: 'dungeon_forge_relic'
    },
    assassin_shadow_veil: {
        source: '遠古爐心',
        clue: '冷卻槽裡有一張殘缺的面紗圖紙。',
        interactionId: 'dungeon_forge_relic'
    },
    void_reaver: {
        source: '遠古爐心',
        clue: '爐心深處有一段關於虛空刃的禁用記錄。',
        interactionId: 'dungeon_forge_relic'
    },

    mithril_sword: {
        source: '秘銀研究',
        clue: '鍛造師需要先完成秘銀研究。',
        interactionId: 'commission_forge_002'
    },
    fire_sword: {
        source: '元素裂縫',
        clue: '火焰配方需要從高溫裂縫中取得。',
        interactionId: 'elemental_fire_trace'
    },
    ice_sword: {
        source: '冰封雪峰',
        clue: '霜寒配方藏在雪峰深處。',
        interactionId: 'dungeon_snow_trace'
    },
    frostbound_scepter: {
        source: '冰封雪峰',
        clue: '冰系法杖的圖紙需要雪峰線索。',
        interactionId: 'dungeon_snow_trace'
    },
    nature_amulet: {
        source: '迷霧叢林',
        clue: '自然護符的編織法藏在叢林支線。',
        interactionId: 'dungeon_jungle_trace'
    },
    primal_focus: {
        source: '迷霧叢林',
        clue: '原始聚焦器需要叢林深處的圖騰拓印。',
        interactionId: 'dungeon_jungle_trace'
    },
    earthwarden_aegis: {
        source: '塔壁符文',
        clue: '符文記錄了大地守護盾的結構。',
        interactionId: 'tower_glyph_memory'
    },
    storm_spear: {
        source: '塔壁符文',
        clue: '符文間隙有風暴長槍的雷紋。',
        interactionId: 'tower_glyph_memory'
    },
    titan_blade: {
        source: '塔壁符文',
        clue: '塔壁深處刻著泰坦之刃的比例。',
        interactionId: 'tower_glyph_memory'
    },
    titan_armor: {
        source: '塔壁符文',
        clue: '符文背後藏著泰坦甲的分層圖。',
        interactionId: 'tower_glyph_memory'
    },
    titan_ring: {
        source: '塔壁符文',
        clue: '塔壁圓環刻痕對應泰坦戒指。',
        interactionId: 'tower_glyph_memory'
    },

    dragon_slayer: {
        source: '古龍傳說',
        clue: '屠龍劍圖紙需要龍族故事線。',
        interactionId: 'dragon_trace'
    },
    dragon_scale_armor: {
        source: '古龍傳說',
        clue: '龍鱗甲圖紙需要龍族故事線。',
        interactionId: 'dragon_trace'
    },
    dragon_amulet: {
        source: '古龍傳說',
        clue: '龍牙護符圖紙需要龍族故事線。',
        interactionId: 'dragon_trace'
    },
    dragon_overlord_crown: {
        source: '古龍傳說',
        clue: '龍王冠冕圖紙需要龍族故事線終章。',
        interactionId: 'dragon_trace'
    },
    wyvern_scale_mail: {
        source: '古龍傳說',
        clue: '翼龍鱗甲圖紙需要龍族故事線。',
        interactionId: 'dragon_trace'
    },
    demonwar_helm: {
        source: '煉獄深淵',
        clue: '魔戰頭盔圖紙藏在煉獄戰場。',
        interactionId: 'dungeon_hell_trace'
    },
    slime_crown_ring: {
        source: '怪物異變',
        clue: '史萊姆王冠戒指需要特殊怪物線索。',
        interactionId: 'slime_crown_trace'
    }
};

export function getRecipeDiscovery(recipeId) {
    return RecipeDiscoveryDatabase[recipeId] || null;
}

export function getRecipeIdsForInteraction(interactionId) {
    return Object.entries(RecipeDiscoveryDatabase)
        .filter(([, discovery]) => discovery.interactionId === interactionId)
        .map(([recipeId]) => recipeId);
}
