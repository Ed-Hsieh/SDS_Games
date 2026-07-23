/**
 * StoryActors.js
 * Accepted screenplay identities used by layered story scenes. Chapter 1-2
 * actors share stable standing anchors. Expression art is declared explicitly
 * so the dialogue renderer never probes missing files.
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

const portrait = actorId => `src/assets/images/art/characters/portraits/${actorId}.webp`;
const standing = actorId => `src/assets/images/art/characters/dialogue/${actorId}/neutral-standing.webp`;
const expressionStanding = (actorId, expression) => (
    `src/assets/images/art/characters/dialogue/${actorId}/${expression}-standing.webp`
);

// Generated expression layers share a canvas, but their visible alpha bounds
// vary slightly. Keep each actor anchored to the neutral layer's apparent size.
const StoryExpressionScale = Object.freeze({
    village_elder: Object.freeze({ guarded: { scale: 1.023, offsetY: -2.304 }, resolute: { scale: 1.007, offsetY: -0.615 } }),
    town_scholar: Object.freeze({ pleased: { scale: 1.12, offsetY: -11.835 } }),
    herbalist: Object.freeze({ pleased: { scale: 1.005, offsetY: -0.449 }, resolute: { scale: 1.025, offsetY: -2.442 }, soft: { scale: 1.017, offsetY: -1.6 } }),
    standard_bearer_frey: Object.freeze({ pleased: { scale: 1.021, offsetY: -2.036 }, soft: { scale: 1.004, offsetY: -0.429 } }),
    lamplighter_tavi: Object.freeze({ guarded: { scale: 1.035, offsetY: -3.372 } }),
    blacksmith: Object.freeze({ guarded: { scale: 1.038, offsetY: -3.636 }, pleased: { scale: 1.027, offsetY: -2.56 } }),
    street_beggar: Object.freeze({ guarded: { scale: 1.008, offsetY: -0.743 } })
});

// Neutral standing files share a 1024x1536 canvas, but the generated figures
// occupy different widths inside it. Normalize the apparent half-body size
// here; expression corrections above remain small deltas on top of this base.
const StoryStandingPresentation = Object.freeze({
    black_market: Object.freeze({ standingScale: 1.071, standingOffsetY: -0.8 }),
    blacksmith: Object.freeze({ standingScale: 1, standingOffsetY: 0 }),
    casino_dealer: Object.freeze({ standingScale: 1.067, standingOffsetY: -0.2 }),
    casino_owner: Object.freeze({ standingScale: 1, standingOffsetY: 0 }),
    herbalist: Object.freeze({ standingScale: 1.343, standingOffsetY: -3.1 }),
    lamplighter_tavi: Object.freeze({ standingScale: 1.182, standingOffsetY: -1.1 }),
    merchant: Object.freeze({ standingScale: 1, standingOffsetY: 0 }),
    neelu: Object.freeze({ standingScale: 1.385, standingOffsetY: -4.4 }),
    standard_bearer_frey: Object.freeze({ standingScale: 1.095, standingOffsetY: -0.8 }),
    street_beggar: Object.freeze({ standingScale: 1, standingOffsetY: 0 }),
    town_scholar: Object.freeze({ standingScale: 1.154, standingOffsetY: -2.4 }),
    village_elder: Object.freeze({ standingScale: 1, standingOffsetY: 0 }),
    young_ailo: Object.freeze({ standingScale: 1, standingOffsetY: 0 })
});

export const StoryExpressionCoverage = Object.freeze({
    village_elder: Object.freeze(['neutral', 'guarded', 'resolute']),
    town_scholar: Object.freeze(['neutral', 'pleased', 'guarded']),
    herbalist: Object.freeze(['neutral', 'soft', 'pleased', 'guarded', 'resolute']),
    standard_bearer_frey: Object.freeze(['neutral', 'soft', 'pleased', 'resolute']),
    lamplighter_tavi: Object.freeze(['neutral', 'soft', 'guarded']),
    blacksmith: Object.freeze(['neutral', 'soft', 'pleased', 'guarded', 'resolute']),
    street_beggar: Object.freeze(['neutral', 'guarded'])
});

export const StoryActorRegistry = Object.freeze({
    player: { id: 'player', name: '玩家', role: '怪物獵人' },
    village_elder: { id: 'village_elder', name: '村長', role: '城鎮領導者', portrait: portrait('village_elder'), standing: standing('village_elder'), standingFacing: 'center', nameStatus: 'unresolved_personal_name' },
    town_scholar: { id: 'town_scholar', name: '伊萊', role: '城鎮書記', portrait: portrait('town_scholar'), standing: standing('town_scholar'), standingFacing: 'right' },
    herbalist: {
        id: 'herbalist',
        name: '米婭',
        role: '藥師與配方研究者',
        portrait: 'src/assets/images/art/characters/dialogue/herbalist/neutral.png',
        standing: standing('herbalist'),
        standingFacing: 'right'
    },
    standard_bearer_frey: { id: 'standard_bearer_frey', name: '芙蕾', role: '巡線持旗者', portrait: portrait('standard_bearer_frey'), standing: standing('standard_bearer_frey'), standingFacing: 'left' },
    lamplighter_tavi: { id: 'lamplighter_tavi', name: '塔維', role: '巡線點燈人', portrait: portrait('lamplighter_tavi'), standing: standing('lamplighter_tavi'), standingFacing: 'left' },
    blacksmith: { id: 'blacksmith', name: '鐵匠', role: '城鎮鐵匠', portrait: portrait('blacksmith'), standing: standing('blacksmith'), standingFacing: 'right', nameStatus: 'unresolved_personal_name' },
    street_beggar: {
        id: 'street_beggar',
        name: '艾洛',
        concealedName: '乞丐',
        revealFlag: 'story.ailo.name_revealed',
        role: '失去舊路的人',
        portrait: portrait('street_beggar'),
        standing: standing('street_beggar'),
        standingFacing: 'left'
    },
    young_ailo: { id: 'young_ailo', name: '艾洛', role: '記憶中的山村居民', standing: standing('young_ailo'), standingFacing: 'right' },
    neelu: { id: 'neelu', name: '妮露', role: '山村染補師', standing: standing('neelu'), standingFacing: 'right' },
    casino_owner: { id: 'casino_owner', name: '維斯珀', role: '賭場主人', portrait: portrait('casino_owner'), standing: standing('casino_owner'), standingFacing: 'left' },
    casino_dealer: { id: 'casino_dealer', name: '洛恩', role: '賭場荷官', portrait: portrait('casino_dealer'), standing: standing('casino_dealer'), standingFacing: 'right' },
    merchant: { id: 'merchant', name: '商人', role: '市集交易者', portrait: portrait('merchant'), standing: standing('merchant'), standingFacing: 'left' },
    black_market: { id: 'black_market', name: '黑市商人', role: '禁用品交易者', portrait: portrait('black_market'), standing: standing('black_market'), standingFacing: 'left' },
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
    return { ...actor, ...(StoryStandingPresentation[actorId] || {}), name };
}

export function getStoryExpressionLayer(actorId, expression = 'neutral') {
    if (!StoryActorRegistry[actorId] || !StoryExpressionIds.includes(expression)) return null;
    if (!StoryExpressionCoverage[actorId]?.includes(expression)) return null;
    const presentation = StoryExpressionScale[actorId]?.[expression] || {};
    return {
        actorId,
        expression,
        status: 'ready',
        scale: presentation.scale || 1,
        offsetY: presentation.offsetY || 0,
        image: expression === 'neutral'
            ? standing(actorId)
            : expressionStanding(actorId, expression)
    };
}
