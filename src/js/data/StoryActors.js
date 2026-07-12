/**
 * StoryActors.js
 * Accepted screenplay identities used by layered story scenes. Image layers are
 * intentionally unresolved until the final art pass.
 */

export const StoryExpressionIds = Object.freeze([
    'neutral',
    'soft',
    'pleased',
    'guarded',
    'resolute',
    'angry',
    'afraid',
    'grieving',
    'hurt'
]);

export const StoryActorRegistry = Object.freeze({
    village_elder: { id: 'village_elder', name: '村長', role: '城鎮領導者', nameStatus: 'unresolved_personal_name' },
    town_scholar: { id: 'town_scholar', name: '伊萊', role: '城鎮書記' },
    herbalist: { id: 'herbalist', name: '米婭', role: '藥師與配方研究者' },
    standard_bearer_frey: { id: 'standard_bearer_frey', name: '芙蕾', role: '巡線持旗者' },
    lamplighter_tavi: { id: 'lamplighter_tavi', name: '塔維', role: '巡線點燈人' },
    blacksmith: { id: 'blacksmith', name: '鐵匠', role: '城鎮鐵匠', nameStatus: 'unresolved_personal_name' },
    street_beggar: {
        id: 'street_beggar',
        name: '艾洛',
        concealedName: '乞丐',
        revealFlag: 'story.ailo.name_revealed',
        role: '失去舊路的人'
    },
    young_ailo: { id: 'young_ailo', name: '艾洛', role: '記憶中的山村居民' },
    neelu: { id: 'neelu', name: '妮露', role: '山村染補師' },
    casino_owner: { id: 'casino_owner', name: '維斯珀', role: '賭場主人' },
    casino_dealer: { id: 'casino_dealer', name: '洛恩', role: '賭場荷官' },
    merchant: { id: 'merchant', name: '商人', role: '市集交易者' },
    black_market: { id: 'black_market', name: '黑市商人', role: '禁用品交易者' },
    elder_dragon: { id: 'elder_dragon', name: '龍族長者', role: '封痕守線者' },
    demon_lord_asariel: { id: 'demon_lord_asariel', name: '魔王赫爾薩恩', role: '墜落的魔王' },
    lich: { id: 'lich', name: '守名者赫恩', role: '守名巫妖' },
    shadow_commander: { id: 'shadow_commander', name: '左線指揮凱德倫', role: '遠征殘響' },
    drowned_oracle: { id: 'drowned_oracle', name: '沉鐘神諭', role: '沉沒的預言者' },
    thorn_witch: { id: 'thorn_witch', name: '荊棘女巫', role: '荊棘交易者' }
});

/**
 * Core characters must become complete through mandatory mainline scenes.
 * Optional side stories may deepen these arcs, but cannot own any scene listed
 * here or replace its function.
 */
export const MainlineCharacterContracts = Object.freeze({
    village_elder: {
        introductionSceneId: 'ch1_s03_broken_crossroads',
        decisiveSceneIds: ['ch5_s10_before_dawn', 'ch6_s01_northern_drake_watch'],
        endpointSceneIds: {
            first_run: 'ch6_s01_northern_drake_watch',
            second_run: 'ch7_s08_return_to_town'
        }
    },
    town_scholar: {
        introductionSceneId: 'ch1_s04_elder_to_scholar',
        decisiveSceneIds: ['ch5_s02_forge_contracts', 'ch5_s07_after_the_ratchet'],
        endpointSceneIds: {
            first_run: 'ch5_s07_after_the_ratchet',
            second_run: 'ch7_s08_return_to_town'
        }
    },
    herbalist: {
        introductionSceneId: 'ch1_s01_road_collapse',
        decisiveSceneIds: ['ch3_s02_shadows_count_names', 'ch5_s06_mia_operation'],
        endpointSceneIds: {
            first_run: 'ch5_s06_mia_operation',
            second_run: 'ch7_s08_return_to_town'
        }
    },
    standard_bearer_frey: {
        introductionSceneId: 'ch1_s05_south_gate_introduction',
        decisiveSceneIds: ['ch3_s03_lamp_oil_in_fog', 'ch4_s06_flag_returns'],
        endpointSceneIds: {
            first_run: 'ch4_s06_flag_returns',
            second_run: 'ch7_s08_return_to_town'
        }
    },
    lamplighter_tavi: {
        introductionSceneId: 'ch1_s05_south_gate_introduction',
        decisiveSceneIds: ['ch4_s05_body_locks', 'ch4_s06_flag_returns'],
        endpointSceneIds: {
            first_run: 'ch4_s08_returned_objects',
            second_run: 'ch7_s08_return_to_town'
        }
    },
    blacksmith: {
        introductionSceneId: 'ch1_s08_cold_forge_smoke',
        decisiveSceneIds: ['ch4_s02_fourfold_countergear', 'ch5_s06_mia_operation'],
        endpointSceneIds: {
            first_run: 'ch7_s08_return_to_town',
            second_run: 'ch7_s08_return_to_town'
        }
    },
    street_beggar: {
        introductionSceneId: 'ch1_s03_broken_crossroads',
        decisiveSceneIds: ['ch6_s08_brush_past_or_invitation', 'ch7_s03_echo_memory'],
        endpointSceneIds: {
            first_run: 'ch7_s01_narrow_human_road',
            second_run: 'ch7_s03_echo_memory'
        }
    },
    casino_owner: {
        introductionSceneId: 'ch3_s04_showcase_glass',
        decisiveSceneIds: ['ch6_s06_settlement_throw', 'ch6_s07_house_changes_seats'],
        endpointSceneIds: {
            first_run: 'ch6_s06_settlement_throw',
            second_run: 'ch6_s07_house_changes_seats'
        }
    },
    casino_dealer: {
        introductionSceneId: 'ch3_s04_showcase_glass',
        decisiveSceneIds: ['ch6_s06_settlement_throw', 'ch6_s07_house_changes_seats'],
        endpointSceneIds: {
            first_run: 'ch6_s07_house_changes_seats',
            second_run: 'ch6_s07_house_changes_seats'
        }
    }
});

export function getStoryActor(actorId, { isFlagSet = () => false } = {}) {
    const actor = StoryActorRegistry[actorId];
    if (!actor) return null;
    const name = actor.revealFlag && !isFlagSet(actor.revealFlag)
        ? (actor.concealedName || actor.name)
        : actor.name;
    return { ...actor, name };
}

export function getStoryExpressionLayer(actorId, expression = 'neutral') {
    if (!StoryActorRegistry[actorId] || !StoryExpressionIds.includes(expression)) return null;
    return {
        actorId,
        expression,
        status: 'missing_until_art_pass',
        image: null
    };
}
