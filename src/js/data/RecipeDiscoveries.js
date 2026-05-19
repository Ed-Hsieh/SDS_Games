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
        source: '任務獎勵',
        clue: '完成城鎮委託後，藥師會交出一份更穩定的高階藥劑比例。',
        interactionId: 'main_002'
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
        source: '副本、菁英或首領掉落',
        clue: '九頭蛇毒牙匕首圖紙只會出現在高威脅戰鬥的戰利品中。',
        interactionId: 'strong_blueprint_drop'
    },

    shadow_blade: {
        source: '副本、菁英或首領掉落',
        clue: '暗影之劍圖紙會從副本或高階敵人手上掉落。',
        interactionId: 'strong_blueprint_drop'
    },
    shadow_armor: {
        source: '副本、菁英或首領掉落',
        clue: '暗影鎧甲圖紙需要挑戰副本、菁英或首領取得。',
        interactionId: 'strong_blueprint_drop'
    },
    shadow_ring: {
        source: '副本、菁英或首領掉落',
        clue: '暗影戒指圖紙藏在高階戰鬥戰利品裡。',
        interactionId: 'strong_blueprint_drop'
    },
    assassin_shadow_veil: {
        source: '副本、菁英或首領掉落',
        clue: '刺客影幕圖紙需要從副本或精銳敵人手中取得。',
        interactionId: 'strong_blueprint_drop'
    },
    void_reaver: {
        source: '副本、菁英或首領掉落',
        clue: '虛空裂刃圖紙只會在強力戰鬥掉落。',
        interactionId: 'strong_blueprint_drop'
    },

    mithril_sword: {
        source: '副本、菁英或首領掉落',
        clue: '秘銀長劍圖紙需要從高威脅戰鬥中取得。',
        interactionId: 'strong_blueprint_drop'
    },
    fire_sword: {
        source: '副本、菁英或首領掉落',
        clue: '烈焰之劍圖紙會在副本或強敵戰利品中出現。',
        interactionId: 'strong_blueprint_drop'
    },
    ice_sword: {
        source: '副本、菁英或首領掉落',
        clue: '霜寒之劍圖紙需要挑戰副本、菁英或首領取得。',
        interactionId: 'strong_blueprint_drop'
    },
    frostbound_scepter: {
        source: '副本、菁英或首領掉落',
        clue: '霜縛權杖圖紙只會從強力戰鬥戰利品中取得。',
        interactionId: 'strong_blueprint_drop'
    },
    nature_amulet: {
        source: '副本、菁英或首領掉落',
        clue: '自然護符圖紙需要從副本或精銳敵人身上取得。',
        interactionId: 'strong_blueprint_drop'
    },
    blood_moon_pendant: {
        source: '血月角鹿掉落',
        clue: '血月角墜圖紙只會在完成血月角鹿狩獵後掉落。',
        interactionId: 'strong_blueprint_drop'
    },
    primal_focus: {
        source: '副本、菁英或首領掉落',
        clue: '原初聚能器圖紙只會在高階戰鬥後掉落。',
        interactionId: 'strong_blueprint_drop'
    },
    earthwarden_aegis: {
        source: '副本、菁英或首領掉落',
        clue: '大地守衛盾圖紙藏在高階戰鬥戰利品裡。',
        interactionId: 'strong_blueprint_drop'
    },
    storm_spear: {
        source: '副本、菁英或首領掉落',
        clue: '雷霆長矛圖紙需要挑戰強敵取得。',
        interactionId: 'strong_blueprint_drop'
    },
    titan_blade: {
        source: '副本、菁英或首領掉落',
        clue: '泰坦之劍圖紙只會從高階首領或副本戰利品中掉落。',
        interactionId: 'strong_blueprint_drop'
    },
    titan_armor: {
        source: '副本、菁英或首領掉落',
        clue: '泰坦之鎧圖紙只會從高階首領或副本戰利品中掉落。',
        interactionId: 'strong_blueprint_drop'
    },
    titan_ring: {
        source: '副本、菁英或首領掉落',
        clue: '泰坦之戒圖紙只會從高階首領或副本戰利品中掉落。',
        interactionId: 'strong_blueprint_drop'
    },

    dragon_slayer: {
        source: '副本、菁英或首領掉落',
        clue: '屠龍劍圖紙需要從強力龍系戰鬥或首領戰利品中取得。',
        interactionId: 'strong_blueprint_drop'
    },
    dragon_scale_armor: {
        source: '副本、菁英或首領掉落',
        clue: '龍鱗鎧甲圖紙需要從高威脅戰鬥中取得。',
        interactionId: 'strong_blueprint_drop'
    },
    dragon_amulet: {
        source: '副本、菁英或首領掉落',
        clue: '龍之護符圖紙會在強力戰鬥後掉落。',
        interactionId: 'strong_blueprint_drop'
    },
    dragon_overlord_crown: {
        source: '副本、菁英或首領掉落',
        clue: '龍王霸主冠圖紙只會從首領級戰利品中取得。',
        interactionId: 'strong_blueprint_drop'
    },
    wyvern_scale_mail: {
        source: '副本、菁英或首領掉落',
        clue: '翼龍鱗鎧圖紙需要從強力怪物戰利品中取得。',
        interactionId: 'strong_blueprint_drop'
    },
    demonwar_helm: {
        source: '副本、菁英或首領掉落',
        clue: '魔戰指揮盔圖紙只會從高階副本或首領戰利品中掉落。',
        interactionId: 'strong_blueprint_drop'
    },
    slime_crown_ring: {
        source: '副本、菁英或首領掉落',
        clue: '史萊姆之冠戒圖紙需要從特殊強敵身上掉落。',
        interactionId: 'strong_blueprint_drop'
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
