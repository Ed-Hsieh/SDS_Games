/**
 * RecipeDiscoveries.js
 * Story gates for forge recipes. Recipe stats/costs stay in Recipes.js.
 */

import { getDefaultKnownSeriesRecipeIds, getRecipeSeriesForRecipe } from './RecipeSeries.js';

export const DefaultKnownRecipeIds = [
    'iron_sword',
    'leather_armor',
    'health_potion_basic',
    ...getDefaultKnownSeriesRecipeIds()
];

export const RecipeDiscoveryDatabase = {
    bone_blade: {
        source: '怪物掉落',
        clue: '低階怪物身上可能帶著粗糙但可用的武器圖紙。',
        interactionId: 'monster_blueprint_drop'
    },
    wolf_cloak: {
        source: '野狼掉落',
        clue: '野狼身上偶爾會帶著獵人遺失的獸皮斗篷圖紙。',
        interactionId: 'monster_blueprint_drop'
    },
    wolf_fang_necklace: {
        source: '野狼掉落',
        clue: '擊退野狼時，可能從牠們拖回巢穴的雜物裡找到獸牙護符圖紙。',
        interactionId: 'monster_blueprint_drop'
    },
    greater_health_potion: {
        source: '待配置',
        clue: '等待米婭的配方研究與市集藥品庫存連動定案。',
        interactionId: null
    },

    guardian_armor: {
        source: '幽暗洞窟任務',
        clue: '完成洞窟特殊調查後，才能解出守衛甲圖紙。',
        interactionId: 'dungeon_cave_001'
    },
    gargoyle_bulwark: {
        source: '幽暗洞窟任務',
        clue: '完成洞窟深處調查後，才能拼出壁壘圖紙。',
        interactionId: 'dungeon_cave_002'
    },
    bone_soul_staff: {
        source: '幽暗洞窟任務',
        clue: '洞窟任務的後續紀錄能拼出骨杖圖紙。',
        interactionId: 'dungeon_cave_002'
    },

    poison_dagger: {
        source: '怪物掉落',
        clue: '帶毒的怪物可能掉落薄刃匕首的破損圖紙。',
        interactionId: 'monster_blueprint_drop'
    },
    silver_thread_hook: {
        source: '銀鐮伏獵者掉落',
        clue: '銀絲伏獵鉤圖紙會在銀鐮伏獵者戰利品中出現。',
        interactionId: 'monster_blueprint_drop'
    },
    goblin_trickster_charm: {
        source: '古代錢幣',
        clue: '黑市暗號能換到哥布林護符的製作手記。',
        interactionId: 'merchant_ancient_coin'
    },
    hydra_fang_dagger: {
        source: '叢林副本：蛛絲的遺贈',
        clue: '擊敗叢林九頭蛇後，從艾拉拉的染血織機殘卷中解出毒牙匕首圖紙。',
        interactionId: 'dungeon_jungle_002'
    },

    shadow_blade: {
        source: '副本、菁英或首領掉落',
        clue: '影縫劍圖紙會從副本或高階敵人手上掉落。',
        interactionId: 'strong_blueprint_drop'
    },
    shadow_armor: {
        source: '副本、菁英或首領掉落',
        clue: '影縫甲圖紙需要挑戰副本、菁英或首領取得。',
        interactionId: 'strong_blueprint_drop'
    },
    shadow_ring: {
        source: '副本、菁英或首領掉落',
        clue: '影縫戒圖紙藏在高階戰鬥戰利品裡。',
        interactionId: 'strong_blueprint_drop'
    },
    assassin_shadow_veil: {
        source: '副本、菁英或首領掉落',
        clue: '無聲影幕圖紙需要從副本或精銳敵人手中取得。',
        interactionId: 'strong_blueprint_drop'
    },
    void_reaver: {
        source: '副本、菁英或首領掉落',
        clue: '幽光裂刃圖紙只會在強力戰鬥掉落。',
        interactionId: 'strong_blueprint_drop'
    },

    mithril_sword: {
        source: '遺跡副本：盲目的秩序',
        clue: '通過守護者的考驗後，從朱利安的防衛紀錄中拼出秘銀長劍圖紙。',
        interactionId: 'dungeon_ruins_002'
    },
    fire_sword: {
        source: '地獄副本：絕望的火種',
        clue: '在終焉之戰擊倒炎獄後，先遣隊日記裡的鍛造觀測能解出燼火劍圖紙。',
        interactionId: 'dungeon_hell_002'
    },
    ice_sword: {
        source: '雪山副本：寒地校準法',
        clue: '登上冰霜王座後，凱倫的鐵砧刻字能解出破霜兵刃圖紙。',
        interactionId: 'dungeon_snow_002'
    },
    frostbound_scepter: {
        source: '雪山副本：寒地校準法',
        clue: '凱倫留下的寒地校準法被帶回鍛造鋪後，雪峰專屬鍛造線才會交出霜縛權杖圖紙。',
        interactionId: 'dungeon_snow_002'
    },
    nature_amulet: {
        source: '副本、菁英或首領掉落',
        clue: '森息護符圖紙需要從副本或精銳敵人身上取得。',
        interactionId: 'strong_blueprint_drop'
    },
    blood_moon_pendant: {
        source: '血月角鹿掉落',
        clue: '血月角墜圖紙只會在完成血月角鹿狩獵後掉落。',
        interactionId: 'strong_blueprint_drop'
    },
    primal_focus: {
        source: '副本、菁英或首領掉落',
        clue: '原初聚心圖紙只會在高階戰鬥後掉落。',
        interactionId: 'strong_blueprint_drop'
    },
    earthwarden_aegis: {
        source: '遺跡副本：盲目的秩序',
        clue: '遠古守衛者停機後，神殿防禦網絡的核心構造能拼出地脈守盾圖紙。',
        interactionId: 'dungeon_ruins_002'
    },
    storm_spear: {
        source: '副本、菁英或首領掉落',
        clue: '鳴雷長矛圖紙需要挑戰強敵取得。',
        interactionId: 'strong_blueprint_drop'
    },
    titan_blade: {
        source: '副本、菁英或首領掉落',
        clue: '巨神遺刃圖紙只會從高階首領或副本戰利品中掉落。',
        interactionId: 'strong_blueprint_drop'
    },
    titan_armor: {
        source: '副本、菁英或首領掉落',
        clue: '巨神遺甲圖紙只會從高階首領或副本戰利品中掉落。',
        interactionId: 'strong_blueprint_drop'
    },
    titan_ring: {
        source: '副本、菁英或首領掉落',
        clue: '巨神遺戒圖紙只會從高階首領或副本戰利品中掉落。',
        interactionId: 'strong_blueprint_drop'
    },

    dragon_slayer: {
        source: '副本、菁英或首領掉落',
        clue: '龍心餘燼圖紙需要從強力龍系戰鬥或首領戰利品中取得。',
        interactionId: 'strong_blueprint_drop'
    },
    dragon_scale_armor: {
        source: '副本、菁英或首領掉落',
        clue: '龍鱗戰鎧圖紙需要從高威脅戰鬥中取得。',
        interactionId: 'strong_blueprint_drop'
    },
    dragon_amulet: {
        source: '副本、菁英或首領掉落',
        clue: '龍息護符圖紙會在強力戰鬥後掉落。',
        interactionId: 'strong_blueprint_drop'
    },
    dragon_overlord_crown: {
        source: '副本、菁英或首領掉落',
        clue: '黑鱗餘冕圖紙只會從首領級戰利品中取得。',
        interactionId: 'strong_blueprint_drop'
    },
    wyvern_scale_mail: {
        source: '副本、菁英或首領掉落',
        clue: '翼龍鱗鎧圖紙需要從強力怪物戰利品中取得。',
        interactionId: 'strong_blueprint_drop'
    },
    demonwar_helm: {
        source: '地獄副本：絕望的火種',
        clue: '炎獄被擊倒後，熔毀鎧甲裡倖存的指揮盔構型能被重新鍛出。',
        interactionId: 'dungeon_hell_002'
    },
    slime_crown_ring: {
        source: '副本、菁英或首領掉落',
        clue: '青凝冠戒圖紙需要從特殊強敵身上掉落。',
        interactionId: 'strong_blueprint_drop'
    }
};

export function getRecipeDiscovery(recipeId) {
    return RecipeDiscoveryDatabase[recipeId] || getRecipeSeriesForRecipe(recipeId)?.discovery || null;
}

export function getRecipeIdsForInteraction(interactionId) {
    return Object.entries(RecipeDiscoveryDatabase)
        .filter(([, discovery]) => discovery.interactionId === interactionId)
        .map(([recipeId]) => recipeId);
}
