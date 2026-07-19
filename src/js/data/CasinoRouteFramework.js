/**
 * CasinoRouteFramework.js
 * Framework data for the casino showcase and owner-route rebuild.
 *
 * This file does not implement the full quest. It records the route contract so
 * future town/casino work can wire the same flow without inventing a parallel
 * system.
 */

export const CasinoRouteImplementationState = Object.freeze({
    LIVE: 'live',
    PARTIAL: 'partial',
    FRAMEWORK_ONLY: 'framework_only'
});

export const CasinoRouteFlag = Object.freeze({
    SHOWCASE_SEEN: 'town.casino.showcase_seen',
    FINAL_CHOICE_UNLOCKED: 'town.casino.showcase_final_choice_unlocked',
    FINAL_CHOICE_CLAIMED: 'town.casino.showcase_final_choice_claimed',
    OWNER_ATTENTION: 'town.casino.owner_attention',
    OWNER_CONTRACT_STARTED: 'town.casino.owner_contract_started',
    FALSE_ODDS_EXPOSED: 'town.casino.false_odds_exposed',
    RELIEF_FUND_COUNTED: 'town.casino.relief_fund_counted'
});

export const CasinoRouteFramework = Object.freeze([
    {
        id: 'locked_rumor',
        order: 1,
        title: 'Locked Rumor',
        implementationState: CasinoRouteImplementationState.FRAMEWORK_ONLY,
        townPhaseId: 'phase_01_first_network',
        playerPromise: 'The player hears about the casino before it becomes a useful system.',
        requiredState: [],
        unlocks: ['casino_rumor_lines'],
        notes: 'Use this only as anticipation. Do not make the casino a quest chore before it has rewards.'
    },
    {
        id: 'floor_access',
        order: 2,
        title: 'Floor Access',
        implementationState: CasinoRouteImplementationState.PARTIAL,
        townPhaseId: 'phase_02_temptation_and_shadow',
        playerPromise: 'Games, chips, tickets, and prize pools give gold a stronger purpose.',
        requiredState: ['casino_floor_unlocked'],
        unlocks: ['casino_games', 'ticket_prize_pools'],
        notes: 'Random rewards should have visible rate tables and chapter-controlled strength.'
    },
    {
        id: 'showcase_inspection',
        order: 3,
        title: 'Showcase Inspection',
        implementationState: CasinoRouteImplementationState.PARTIAL,
        townPhaseId: 'phase_02_temptation_and_shadow',
        playerPromise: 'The player walks to display cases and sees rare objects worth wanting.',
        requiredState: ['casino_floor_unlocked'],
        setsFlags: [CasinoRouteFlag.SHOWCASE_SEEN],
        unlocks: ['owner_attention_seed'],
        notes: 'Showcase item art should match the item itself and future final-choice reward.'
    },
    {
        id: 'owner_attention',
        order: 4,
        title: 'Owner Attention',
        implementationState: CasinoRouteImplementationState.PARTIAL,
        townPhaseId: 'phase_02_temptation_and_shadow',
        playerPromise: 'The owner reacts because the player demonstrated desire, not because a quest marker demanded it.',
        requiredState: [CasinoRouteFlag.SHOWCASE_SEEN],
        setsFlags: [CasinoRouteFlag.OWNER_ATTENTION],
        unlocks: ['vesper_showcase_route_seed'],
        notes: 'Currently represented by inspection flags/deep-event hooks.'
    },
    {
        id: 'owner_contract',
        order: 5,
        title: 'Owner Contract',
        implementationState: CasinoRouteImplementationState.FRAMEWORK_ONLY,
        townPhaseId: 'phase_02_temptation_and_shadow',
        playerPromise: 'The player learns how the casino stabilizes or distorts the town economy.',
        requiredState: [CasinoRouteFlag.OWNER_ATTENTION],
        setsFlags: [CasinoRouteFlag.OWNER_CONTRACT_STARTED],
        unlocks: ['false_odds_investigation', 'relief_fund_route', 'black_market_echo'],
        notes: 'Only add real branch consequences if later story or ending state uses them.'
    },
    {
        id: 'final_showcase_choice',
        order: 6,
        title: 'Final Showcase Choice',
        implementationState: CasinoRouteImplementationState.FRAMEWORK_ONLY,
        townPhaseId: 'phase_03_specialized_town',
        playerPromise: 'After resolution, the player selects one display-case prize as a concrete unique reward.',
        requiredState: [CasinoRouteFlag.FINAL_CHOICE_UNLOCKED],
        setsFlags: [CasinoRouteFlag.FINAL_CHOICE_CLAIMED],
        unlocks: ['one_showcase_item_reward'],
        notes: 'One selected item only. Do not replace it with a generic box unless the route is rewritten around that box.'
    }
]);

export const CasinoShowcaseRouteFrame = Object.freeze({
    routeId: 'vesper_showcase_route',
    title: '展示櫃後的莊家',
    trigger: {
        inspectAtLeast: 2,
        requiredFlag: CasinoRouteFlag.SHOWCASE_SEEN
    },
    beats: [
        'Inspect at least two display-case items.',
        'Dealer or owner notices the player returning to the glass.',
        'Player proves interest through tickets, odds, or prize-source investigation.',
        'Route exposes the casino economy: temptation, relief money, debt, or black-market supply.',
        'Resolution unlocks one final showcase choice if the branch has durable consequences.'
    ],
    allowedConsequences: [
        'future_story_echo',
        'ending_state_echo',
        'black_market_debt',
        'casino_owner_trust',
        'relief_fund_state'
    ],
    disallowedConsequences: [
        'fake moral choice with one-line payoff',
        'hidden irreversible punishment without story warning',
        'reward that does not match the displayed item'
    ],
    finalRewardRule: 'The selected reward must visually and mechanically match the inspected showcase item.'
});

export const CasinoRouteIntegrationPoints = Object.freeze([
    {
        system: 'town_rebuild',
        data: 'StorySceneRegistry.ch3_s04_showcase_glass',
        status: CasinoRouteImplementationState.PARTIAL,
        needed: 'Town-state resolver should decide when casino floor and showcase are available.'
    },
    {
        system: 'casino_scene',
        data: 'CasinoScene.renderShowcase',
        status: CasinoRouteImplementationState.PARTIAL,
        needed: 'Final choice button should read route flags after the owner quest exists.'
    },
    {
        system: 'casino_manager',
        data: 'CasinoManager.inspectShowcaseItem',
        status: CasinoRouteImplementationState.PARTIAL,
        needed: 'Inspection count should become a quest trigger source.'
    },
    {
        system: 'quest_database',
        data: 'vesper_showcase_route',
        status: CasinoRouteImplementationState.FRAMEWORK_ONLY,
        needed: 'Add the long side quest only after town phase and economy hooks are ready.'
    }
]);

export function getCasinoRouteStage(stageId) {
    return CasinoRouteFramework.find(stage => stage.id === stageId) || null;
}

export function getCasinoRouteStagesByState(implementationState) {
    return CasinoRouteFramework.filter(stage => stage.implementationState === implementationState);
}
