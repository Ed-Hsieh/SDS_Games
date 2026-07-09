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
    REWRITE: 'rewrite',
    REMOVE: 'remove',
    REVIEW: 'review'
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
    centralMystery: 'The damaged town is part of an old route-seal network. The broken bell in the square is the visible wound, and exploration rebuilds the map of what failed.',
    finalTruth: 'Demon Lord Asariel is the final pressure, but the disaster was made possible by broken routes, hidden bargains, fear, and abandoned records. The player must rebuild combat strength and information strength together.',
    finalBossId: 'demon_lord_asariel',
    lateRadiantPressureId: 'aurora_archon',
    chapterTargets: [
        {
            chapter: 1,
            levelRange: [1, 10],
            title: '不響的鐘 / The Bell That Would Not Ring',
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
            alternateBossId: 'ash_baron',
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
            title: '龍看見舊約 / The Dragon Remembers The Pact',
            bossId: 'elder_dragon',
            focus: 'Dragon route pressure, high-tier preparation, and the old pact reveal.'
        },
        {
            chapter: 7,
            levelRange: [61, 70],
            title: '裂鐘回聲 / Echoes Of The Broken Bell',
            bossId: 'demon_lord_asariel',
            focus: 'Final town network test, forbidden shortcuts, and void/light pressure.'
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
                id: 'ch1_elder_bell_square',
                npcIds: ['village_elder'],
                purpose: 'The elder frames the problem as lost roads and a town signal that no longer answers.',
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
                id: 'ch1_forest_signal',
                bossId: 'forest_guardian',
                purpose: 'Evidence reframes the forest as a wounded responder to the broken bell-route signal.',
                systemOutput: ['open_chapter_boss_convergence']
            },
            {
                id: 'ch1_after_forest_guardian',
                npcIds: ['village_elder', 'town_scholar'],
                purpose: 'The town is not safe, but roads, monsters, and the broken bell are now connected.',
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
        status: StoryRebuildStatus.REWRITE,
        priority: 'P0',
        ownerPaths: ['src/js/data/Quests.js', 'src/js/data/QuestStories.js', 'src/js/data/NPCDialogues.js'],
        reason: 'Existing main quests were built as playable scaffolding and no longer satisfy the new suspense-led story direction.',
        safeWhen: 'Central mystery, Chapter 1 scenes, and reward gates are approved.'
    },
    {
        id: 'legacy_quest_spine_framework',
        status: StoryRebuildStatus.REVIEW,
        priority: 'P0',
        ownerPaths: ['src/js/data/QuestSpineFramework.js', 'docs/CHAPTER_QUEST_FRAMEWORK.md'],
        reason: 'The spine may still be useful structurally, but its plot is not final canon after the clean reset decision.',
        safeWhen: 'Seven chapter promises have been rewritten in the story bible.'
    },
    {
        id: 'legacy_chapter_one_route_plan',
        status: StoryRebuildStatus.REVIEW,
        priority: 'P0',
        ownerPaths: ['src/js/data/ChapterOneRoutePlan.js', 'src/js/data/WorldStories.js'],
        reason: 'The route tech is useful, but specific clue order and plot content must follow the new Chapter 1 script.',
        safeWhen: 'Chapter 1 route scenes and boss convergence are approved.'
    },
    {
        id: 'legacy_zone_identity',
        status: StoryRebuildStatus.REMOVE,
        priority: 'P0',
        ownerPaths: ['src/js/data/WorldStories.js', 'src/js/data/StoryProgressMap.js', 'src/js/scenes/AdventureScene.js'],
        reason: 'The old low/medium/high/death map identity conflicts with chapter routes, watchposts, and fog/fatigue exploration.',
        safeWhen: 'All route objectives and DEV test buttons use chapter or route-node ids.'
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
