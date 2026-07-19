/**
 * StoryRebuildPlan.js
 * Machine-readable guardrails for the clean main-story rebuild.
 *
 * This file does not change runtime flow by itself. It exists so future passes
 * can remove old quest/story/material patches without relying on memory.
 */

export const StoryRebuildMode = Object.freeze({
    RESET_CONTENT_KEEP_SYSTEMS: 'reset_content_keep_systems'
});

export const StoryRebuildStatus = Object.freeze({
    KEEP: 'keep',
    REPLACED: 'replaced',
    REWRITE: 'rewrite',
    REMOVE: 'remove',
    REVIEW: 'review',
    PAUSED: 'paused'
});

export const StoryRebuildFoundation = Object.freeze({
    mode: StoryRebuildMode.RESET_CONTENT_KEEP_SYSTEMS,
    decision: 'Current quest outline, route clues, and patchwork story content are scaffolding, not canon. Keep usable systems and world pillars, then rebuild the story cleanly.',
    retainedWorldPillars: [
        'A damaged frontier town that starts sparse and recovers through player action.',
        'Route-driven exploration with landmarks, watchposts, fog, fatigue pressure, and boss convergence.',
        'Equipment pressure: early survival depends on repair, crafting, drops, and durability.',
        'Monster ecology: drops and equipment should come from believable bodies, regions, or factions.',
        'Clue-led bosses: bosses are story convergence points, not only combat stat gates.',
        'Light and void stay high-tier forces; glimmer and shadow are weaker precursors.',
        'Dark realistic fantasy asset direction remains the visual baseline.'
    ],
    retainedSystemPillars: [
        'Quest runtime and objective tracking.',
        'Dialogue runtime, including multi-speaker presentation.',
        'Town state resolver and visible NPC/place gates.',
        'Traveler handbook shells: commissions, boss traces, world notes, relationships, and town memory.',
        'Adventure map, fog, fatigue, route nodes, and watchpost mechanics.',
        'Equipment, recipe, drop, encyclopedia, and validation infrastructure.',
        'Asset manifest and generated art folder structure.'
    ],
    retiredContentLayers: [
        'Current main quest chain as final story canon.',
        'Current quest spine plan as final seven-chapter canon.',
        'First-chapter route plan as final plot canon.',
        'Old low/medium/high/death route identity.',
        'Current world clue chains when they only support the old route structure.',
        'Talk-count-based relationship depth labels.',
        'Generic request/report dialogue bridges used as story placeholders.',
        'Reward/material overfeeding from older task-style quests.',
        'Records classified as materials when they are actually tokens, relics, usable items, memories, or currencies.'
    ],
    rebuildOrder: [
        'Define central mystery and final truth.',
        'Define major cast arcs, entry timing, absence, return, betrayal, death, or role change.',
        'Define seven chapter promises before rewriting runtime quests.',
        'Map Chapter 1 into scenes, NPC dialogue, town state, landmarks, boss clues, and handbook memory.',
        'Remove old quest/story patches that no longer serve the accepted structure.',
        'Redistribute rewards, recipes, drops, materials, and dungeon support after story beats are approved.',
        'Run validation and update only the authoritative docs that own the changed topic.'
    ]
});

export const StoryRebuildNarrativeTarget = Object.freeze({
    centralMystery: 'The damaged town sits near the safest remaining approach to the mountain-side disaster zone. Its roads, watchposts, old camps, and records preserve traces of the old sealed perimeter.',
    finalTruth: 'Demon Lord Asariel is the final pressure, but the disaster was made possible by broken routes, hidden bargains, fear, and abandoned records. The player must rebuild combat strength and information strength together.',
    acceptedCausalTimeline: Object.freeze({
        demonKingMountainIntent: 'The Demon King sought the mountain convergence because controlling it would let his power recover and spread through the region.',
        ancientConflict: 'The dragon clan fought to preserve its territory rather than save humanity. Both sides were severely wounded, and the Demon King fell near the mountain village without dying.',
        emergencyContainment: 'The dragon clan sealed the broad approaches and held the Demon King body in dormancy. The seal restrains the body but cannot stop all curse seepage through existing physical and human channels.',
        mountainVillageLoss: 'The fall destroyed Ailo and Neelu village. Neelu pushed Ailo down a mountain or valley drop, saving him but leaving him with head trauma, grief, fragmented memory, and the unfinished flower-field promise.',
        oldExpedition: 'Twenty years ago, a strong human joint expedition cleared outer threats, mistook the dragon containment for an obstruction, damaged the sealed line, and was destroyed by elder_dragon, dragon defense, and the released curse pressure.',
        elderSurvival: 'The future village elder survived by chance through retreat, terrain collapse, and separation. He was not spared and returned without understanding the dragon containment role.',
        presentSurge: 'The human-made seal scar widened for twenty years while the Demon King recovered, causing the present route failures, mutations, and elemental instability.',
        firstRunError: 'The player defeats real threats but repeats the expedition armed push, defeats or kills elder_dragon, removes the living containment authority, and then wins a hollow physical victory over the Demon King.',
        secondRunCorrection: 'The player preserves elder_dragon, uses seal_scar_shard and Echo Whistle route meaning to open non-war passage, enters through the narrow human route, and defeats the Demon King while dragon containment remains active.',
        echoWhistlePlacement: 'The Echo Whistle enters the mainline before the Chapter 6 dragon confrontation so both run outcomes remain causally possible.'
    }),
    finalBossId: 'demon_lord_asariel',
    secondRunExternalBossPolicy: Object.freeze({
        status: StoryRebuildStatus.PAUSED,
        unlock: 'first_run_false_ending_achievement',
        rollout: 'staggered_across_second_run',
        requiredForTrueEnding: false,
        physicalPersistence: 'current_run_only',
        resumeGate: 'complete_and_validate_first_run_story_systems_and_required_art_then_audit_persistent_evidence_flags',
        acceptedBaseGameFirstResolutions: [
            'prologue_blood_moon_stag_route_paused',
            'nameless_curse_route_paused',
            'expedition_supreme_commander_pending_design',
            'ash_baron',
            'entropy_balance_route_paused',
            'light_trial_aurora_archon_route_paused',
            'void_revelation_pending_route'
        ],
        dlcBoundary: 'DLC extends the post-reveal light, Void, and tower world; it does not own the first Ash Baron resolution, radiant trial, Void revelation, or prologue revenge.'
    }),
    chapterTargets: [
        {
            chapter: 1,
            levelRange: [1, 10],
            title: '南門以外 / Beyond The South Gate',
            bossId: 'forest_guardian',
            earlyThreatId: 'ambush_mantis',
            focus: 'Broken town, south gate, first route investigation, early equipment pressure.'
        },
        {
            chapter: 2,
            levelRange: [11, 20],
            title: '斷路上的藥味 / Medicine On The Broken Road',
            bossId: 'lich',
            focus: 'Supply, medicine, market recovery, and old evacuation records.'
        },
        {
            chapter: 3,
            levelRange: [21, 30],
            title: '影子仍守夜 / Shadows Still Keep Watch',
            bossId: 'shadow_commander',
            focus: 'Shadow precursor routes, old orders, rumor pressure.'
        },
        {
            chapter: 4,
            levelRange: [31, 40],
            title: '石心與灰雨 / Stone Heart, Ash Rain',
            bossId: 'ancient_titan',
            secondRunExternalHookId: 'ash_baron',
            focus: 'Stone routes, forge weight, and regional instability.'
        },
        {
            chapter: 5,
            levelRange: [41, 50],
            title: '元素失衡 / The Elements Lose Their Shape',
            bossId: 'elemental_lord',
            focus: 'Elemental fronts, dungeon preparation, and advanced forge planning.'
        },
        {
            chapter: 6,
            levelRange: [51, 60],
            title: '龍守封痕 / The Dragon Guards The Scar',
            bossId: 'elder_dragon',
            dialogueActorId: 'elder_dragon',
            reuseBossArtForDialogue: true,
            focus: 'Dragon route pressure, high-tier preparation, and the old seal-scar reveal.'
        },
        {
            chapter: 7,
            levelRange: [61, 70],
            title: '墜落之地 / Where The Demon Fell',
            bossId: 'demon_lord_asariel',
            focus: 'Final town network test, glimmer true-kill preparation, and optional exits into second-run external stories.'
        }
    ],
    chapterOneRuntimeTarget: {
        initialVisibleNpcIds: ['village_elder', 'town_scholar'],
        stagingNpcIds: ['standard_bearer_frey'],
        lockedOrAbsentEarly: ['blacksmith', 'herbalist', 'merchant', 'casino_dealer', 'black_market'],
        routeInvestigationGoal: 'Reach three nearby route landmarks and record whether roads still show footprints, smoke, or monster traces.',
        implementationGate: 'Do not rewrite playable quests until Chapter 1 dialogue, route nodes, boss clues, town state, and reward gates are accepted.',
        storyNodes: [
            {
                id: 'ch1_elder_south_gate_square',
                npcIds: ['village_elder'],
                purpose: 'The elder frames the problem as lost roads and a town that no longer knows which paths still answer.',
                systemOutput: ['unlock_town_scholar']
            },
            {
                id: 'ch1_scholar_route_brief',
                npcIds: ['town_scholar'],
                purpose: 'The scholar gives a concrete task: check three nearby landmarks for footprints, smoke, and monster traces.',
                systemOutput: ['start_route_investigation']
            },
            {
                id: 'ch1_south_gate_pressure',
                npcIds: ['standard_bearer_frey'],
                purpose: 'The south gate shows defense pressure and why route safety matters.',
                systemOutput: ['stage_south_gate_scene']
            },
            {
                id: 'ch1_three_landmarks',
                landmarkIds: ['south_gate_farmland', 'hunter_boardwalk', 'old_campfire_site'],
                purpose: 'The player reads the road through physical traces instead of following a pure task list.',
                systemOutput: ['record_route_findings']
            },
            {
                id: 'ch1_ambush_mantis_evidence',
                bossId: 'ambush_mantis',
                landmarkIds: ['hunter_boardwalk', 'old_campfire_site', 'silver_snare_pass'],
                purpose: 'The first boss-like threat teaches that monsters carry information.',
                systemOutput: ['unlock_early_boss_trace']
            },
            {
                id: 'ch1_forest_route_wound',
                bossId: 'forest_guardian',
                purpose: 'Evidence reframes the forest as a wounded responder to old route damage and perimeter pressure.',
                systemOutput: ['open_chapter_boss_convergence']
            },
            {
                id: 'ch1_after_forest_guardian',
                npcIds: ['village_elder', 'town_scholar'],
                purpose: 'The town is not safe, but roads, monsters, and old route damage are now connected.',
                systemOutput: ['seed_chapter_2', 'controlled_town_recovery']
            }
        ]
    }
});

export const ResourceExpansionRequirement = Object.freeze({
    rule: 'Do not silently add new story resources during the rebuild.',
    appliesTo: [
        'npc',
        'monster',
        'boss',
        'material',
        'equipment',
        'blueprint',
        'usable_item',
        'quest_object',
        'currency_or_token',
        'location',
        'scene_asset',
        'portrait_asset',
        'monster_asset',
        'item_asset'
    ],
    requiredProposalFields: [
        'story_reason',
        'system_function',
        'chapter_or_level_band',
        'source_or_acquisition',
        'downstream_data_changes',
        'asset_needs',
        'validation_plan',
        'cleanup_or_replacement_target'
    ],
    approval: 'Ask the user before implementation when a rebuild beat needs a new resource.'
});

export const MaterialClassificationPolicy = Object.freeze({
    materialDefinition: 'A material has stable acquisition, no direct use by itself, and exists to become a crafted result or recipe input.',
    notMaterials: [
        'usable consumables',
        'equipment',
        'blueprints',
        'currencies',
        'casino tickets',
        'dungeon tokens',
        'quest proof objects',
        'relationship keepsakes',
        'service vouchers',
        'repair kits with direct use',
        'achievement or passive unlock objects'
    ],
    allowedMaterialRoles: [
        'monster body part',
        'regional resource',
        'ore or crystal',
        'hide, bone, fang, silk, gland, scale, bark, or similar craft input',
        'elemental precursor input',
        'boss or elite craft input with a clear downstream recipe'
    ],
    cleanupRule: 'If an old material does not satisfy the definition, reclassify or remove it during the matching item/schema pass.'
});

export const StoryRebuildCleanupCandidates = Object.freeze([
    {
        id: 'legacy_main_quest_chain',
        status: StoryRebuildStatus.REPLACED,
        priority: 'P0',
        ownerPaths: ['src/js/data/StorySceneRegistry.js', 'src/js/data/Quests.js', 'src/js/data/QuestStories.js'],
        reason: 'The fifteen legacy main quests were removed. Mandatory progression now reads the 66-scene screenplay directly; Quests.js is reserved for approved optional runtime quests.',
        safeWhen: 'Already replaced; do not restore main_001 through main_015.'
    },
    {
        id: 'legacy_quest_spine_framework',
        status: StoryRebuildStatus.REPLACED,
        priority: 'P0',
        ownerPaths: ['src/js/data/StorySceneRegistry.js', 'src/js/data/ChapterRegionRegistry.js'],
        reason: 'Scene order and location binding now come directly from the screenplay and handcrafted region registry.',
        safeWhen: 'Already replaced; do not recreate QuestSpineFramework.js.'
    },
    {
        id: 'legacy_chapter_one_route_plan',
        status: StoryRebuildStatus.REPLACED,
        priority: 'P0',
        ownerPaths: ['src/js/data/ChapterRegionRegistry.js', 'src/js/utils/WorldMap.js'],
        reason: 'All seven chapters now use authored route topology, fixed locations, and fixed Boss convergence.',
        safeWhen: 'Already replaced; do not recreate ChapterOneRoutePlan.js or ChapterMapFramework.js.'
    },
    {
        id: 'legacy_zone_identity',
        status: StoryRebuildStatus.REPLACED,
        priority: 'P0',
        ownerPaths: ['src/js/data/WorldStories.js', 'src/js/data/StoryProgressMap.js', 'src/js/scenes/AdventureScene.js'],
        reason: 'Player-facing map identity now comes from seven chapter regions, fixed nodes, and scene bindings. EventManager may retain private selection tiers until encounter rewards are allocated.',
        safeWhen: 'Already replaced; route objectives, handbook entries, and DEV map controls use chapter or route-node ids.'
    },
    {
        id: 'relationship_talk_count_depth',
        status: StoryRebuildStatus.REWRITE,
        priority: 'P1',
        ownerPaths: ['src/js/scenes/QuestScene.js', 'src/js/data/CharacterProfiles.js'],
        reason: 'The user wants relationship notes to feel like remembered interactions, not visible familiarity meters or artificial labels.',
        safeWhen: 'Relationship records are unlocked by story/dialogue flags.'
    },
    {
        id: 'generic_quest_dialogue_bridges',
        status: StoryRebuildStatus.REWRITE,
        priority: 'P1',
        ownerPaths: ['src/js/managers/DialogueManager.js'],
        reason: 'Fallback request/report bridges keep the game playable but can dilute character-specific voice and objective clarity.',
        safeWhen: 'Accepted quests have explicit NPC or multi-speaker scripts.'
    },
    {
        id: 'material_classification_drift',
        status: StoryRebuildStatus.REVIEW,
        priority: 'P1',
        ownerPaths: ['src/js/data/Materials.js', 'src/js/data/Items.js', 'src/js/data/Recipes.js', 'src/js/data/Quests.js'],
        reason: 'Some records called materials may be service objects, tokens, relics, or one-off story objects.',
        safeWhen: 'Material schema and recipe tree are approved.'
    },
    {
        id: 'legacy_external_boss_routes',
        status: StoryRebuildStatus.REWRITE,
        priority: 'P1',
        ownerPaths: ['src/js/data/WorldStories.js', 'src/js/data/Monsters.js', 'src/js/data/Dungeons.js'],
        reason: 'Ash Baron still uses an old chapter route and placeholder Lv40 rewards, while formal light and Void records lack the approved staggered second-run external-story ownership.',
        safeWhen: 'Each external Boss has an approved story cause, second-run unlock, authored map branch, optional true-ending boundary, current-run acquisition path, and reward specification.'
    }
]);

export function getStoryRebuildFoundation() {
    return StoryRebuildFoundation;
}

export function getStoryRebuildNarrativeTarget() {
    return StoryRebuildNarrativeTarget;
}

export function getStoryRebuildCleanupCandidates(status = null) {
    if (!status) return [...StoryRebuildCleanupCandidates];
    return StoryRebuildCleanupCandidates.filter(candidate => candidate.status === status);
}

export function getStoryRebuildAuditScope() {
    return {
        retiredContentLayers: StoryRebuildFoundation.retiredContentLayers,
        narrativeTarget: StoryRebuildNarrativeTarget,
        cleanupCandidates: StoryRebuildCleanupCandidates,
        resourceExpansionRequirement: ResourceExpansionRequirement,
        materialClassificationPolicy: MaterialClassificationPolicy
    };
}
