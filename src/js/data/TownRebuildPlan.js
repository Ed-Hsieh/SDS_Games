/**
 * TownRebuildPlan.js
 * Phase-one source data for the broken-town rebuild pass.
 *
 * This file is intentionally independent from the current town UI. The rebuild
 * is allowed to be incompatible with the old map/shop/market/casino flow, while
 * keeping backpack and commission helper systems outside the first pass.
 */

export const TownRebuildScope = Object.freeze({
    AFFECTED_SYSTEMS: ['town_map_interaction', 'shop', 'market', 'casino', 'future_town_modules'],
    STABLE_SYSTEMS: ['inventory', 'commission_helper'],
    COMPATIBILITY: 'breaking_allowed'
});

export const TownBranchImpact = Object.freeze({
    ENDING: 'ending',
    FUTURE_STORY: 'future_story',
    LOCAL_ECHO: 'local_echo',
    COSMETIC: 'cosmetic'
});

export const TownRebuildPillar = Object.freeze({
    NPC_RETURN: 'npc_return',
    FACILITY_REPAIR: 'facility_repair',
    SUPPLY_LINE: 'supply_line',
    INFORMATION_NETWORK: 'information_network',
    SECURITY_LEVEL: 'security_level',
    TRUST_REPUTATION: 'trust_reputation',
    THIRD_PARTY_SOURCE: 'third_party_source',
    VISIBLE_TOWN_STATE: 'visible_town_state',
    CRISIS_PRESSURE: 'crisis_pressure'
});

export const TownRewardChannel = Object.freeze({
    FEATURE_UNLOCK: 'feature_unlock',
    SHOP_STOCK: 'shop_stock',
    MARKET_EXCHANGE: 'market_exchange',
    CASINO_POOL: 'casino_pool',
    FORGE_RECIPE: 'forge_recipe',
    MAP_ROUTE: 'map_route',
    NPC_SERVICE: 'npc_service',
    STORY_EQUIPMENT: 'story_equipment',
    INFORMATION: 'information'
});

export const CharacterHumorMode = Object.freeze({
    DRY: 'dry',
    WARM: 'warm',
    OPTIMISTIC: 'optimistic',
    MERCHANT_BANTER: 'merchant_banter',
    DEADPAN: 'deadpan',
    MENACING_POLITE: 'menacing_polite',
    NONE: 'none'
});

export const TownBranchPolicy = Object.freeze({
    rule: 'Only add real branches when they affect an ending, later chapter state, or a durable faction/NPC relationship.',
    avoid: [
        'fake binary choices that only change one line',
        'branches that invite save/load without changing later content',
        'punishing players with hidden irreversible outcomes unless the story clearly telegraphs risk'
    ],
    allowedLocalBranches: [
        'minor price changes',
        'temporary NPC attitude lines',
        'different clue order',
        'cosmetic town-state wording',
        'one-time bonus item when it does not imply a major moral choice'
    ]
});

export const CharacterVoiceDirectionDatabase = Object.freeze({
    village_elder: {
        npcId: 'village_elder',
        role: 'crisis_anchor',
        humorMode: CharacterHumorMode.DRY,
        humorUse: 'Only small weary jokes. He can sound human, but should not undercut the crisis.',
        branchRole: 'His choices should frame ending-state trust, not small errands.',
        addOrRemoveFreedom: 'keep'
    },
    blacksmith: {
        npcId: 'blacksmith',
        role: 'forge_recovery',
        humorMode: CharacterHumorMode.DEADPAN,
        humorUse: 'Tool-and-scar humor. He jokes like someone who has already lost too much time.',
        branchRole: 'Good branch target for forge philosophy, apprentice memory, and equipment access.',
        addOrRemoveFreedom: 'keep'
    },
    herbalist: {
        npcId: 'herbalist',
        role: 'care_and_supply',
        humorMode: CharacterHumorMode.WARM,
        humorUse: 'Gentle practical jokes, especially when trying to keep scared townsfolk moving.',
        branchRole: 'Can support recovery routes and refugee health, usually local echoes.'
    },
    merchant: {
        npcId: 'merchant',
        role: 'supply_route',
        humorMode: CharacterHumorMode.MERCHANT_BANTER,
        humorUse: 'Talks like every disaster has a shipping fee. Funny, but still self-interested.',
        branchRole: 'Good for supply-route deals, risky discounts, and third-party item sources.'
    },
    rumor_broker: {
        npcId: 'rumor_broker',
        role: 'information_network',
        humorMode: CharacterHumorMode.DRY,
        humorUse: 'Needle-like humor. Teases the player by pretending important truths are gossip.',
        branchRole: 'Branches should affect clue access, faction visibility, or black-market trust.'
    },
    black_market: {
        npcId: 'black_market',
        role: 'third_party_source',
        humorMode: CharacterHumorMode.MENACING_POLITE,
        humorUse: 'Never loud. His humor is a receipt with teeth.',
        branchRole: 'Use only for durable consequences: debt, forbidden stock, ending shadows.'
    },
    casino_dealer: {
        npcId: 'casino_dealer',
        role: 'risk_reward_source',
        humorMode: CharacterHumorMode.MERCHANT_BANTER,
        humorUse: 'Charming table banter that slowly reveals the house is not harmless.',
        branchRole: 'Best used for casino-owner route, showcase temptation, and debt flags.'
    },
    lamplighter_tavi: {
        npcId: 'lamplighter_tavi',
        role: 'route_safety',
        humorMode: CharacterHumorMode.OPTIMISTIC,
        humorUse: 'Uses light jokes to keep fear small enough to carry.',
        branchRole: 'Can unlock night routes, map clarity, and safer return paths.'
    },
    standard_bearer_frey: {
        npcId: 'standard_bearer_frey',
        role: 'security_memory',
        humorMode: CharacterHumorMode.NONE,
        humorUse: 'Rare humor. When it appears, it should feel like trust rather than relief.',
        branchRole: 'Good for gate defense, town safety, and future ending readiness.'
    },
    supply_captain: {
        npcId: 'supply_captain',
        role: 'new_supply_controller',
        humorMode: CharacterHumorMode.DEADPAN,
        humorUse: 'Counts arrows, coins, and excuses with the same bored precision.',
        branchRole: 'New NPC candidate for supply-line stock, defense gear, and ration choices.',
        addOrRemoveFreedom: 'add_when_needed',
        assetNeedId: null
    },
    chapel_monk: {
        npcId: 'chapel_monk',
        role: 'glimmer_to_light_bridge',
        humorMode: CharacterHumorMode.WARM,
        humorUse: 'Soft humor that makes the radiant route feel lived-in instead of holy and distant.',
        branchRole: 'Future route toward glimmer/light content and Lv70 radiant dungeon access.'
    }
});

export const TownPhaseDatabase = Object.freeze([
    {
        id: 'phase_00_broken_town',
        chapterRange: [1, 1],
        levelRange: [1, 6],
        title: 'Broken Services',
        storyPromise: 'The town is not a menu hub yet. It is a damaged shelter with closed doors, missing people, and unreliable supply.',
        defaultUnlockedFeatures: ['inventory', 'commission_helper', 'basic_lobby', 'south_gate_exit'],
        lockedFeatures: ['full_market', 'forge', 'casino', 'black_market', 'advanced_shop_stock', 'radiant_chapel'],
        pillars: [
            TownRebuildPillar.NPC_RETURN,
            TownRebuildPillar.FACILITY_REPAIR,
            TownRebuildPillar.SECURITY_LEVEL,
            TownRebuildPillar.VISIBLE_TOWN_STATE
        ],
        targetPlayerFeeling: 'I am not just accepting quests; I am making the town usable again.'
    },
    {
        id: 'phase_01_first_network',
        chapterRange: [1, 2],
        levelRange: [7, 18],
        title: 'First Recovery Network',
        storyPromise: 'The player restores enough people and routes that shops, forge service, and early map intelligence begin to matter.',
        defaultUnlockedFeatures: ['market_stalls', 'basic_forge', 'apothecary_stock', 'rumor_board'],
        lockedFeatures: ['casino_showcase_route', 'black_market_full_stock', 'glimmer_light_route'],
        pillars: [
            TownRebuildPillar.SUPPLY_LINE,
            TownRebuildPillar.INFORMATION_NETWORK,
            TownRebuildPillar.TRUST_REPUTATION
        ],
        targetPlayerFeeling: 'Gold, materials, and NPC trust are becoming a real resource web.'
    },
    {
        id: 'phase_02_temptation_and_shadow',
        chapterRange: [2, 3],
        levelRange: [19, 35],
        title: 'Temptation And Shadow',
        storyPromise: 'Casino, black market, shadow precursor gear, and uncertain third-party help appear together.',
        defaultUnlockedFeatures: ['casino_floor', 'casino_prize_showcase', 'black_market_contact', 'shadow_precursor_sources'],
        lockedFeatures: ['casino_owner_resolution', 'radiant_chapel', 'void_light_terminal_sources'],
        pillars: [
            TownRebuildPillar.THIRD_PARTY_SOURCE,
            TownRebuildPillar.CRISIS_PRESSURE,
            TownRebuildPillar.TRUST_REPUTATION
        ],
        targetPlayerFeeling: 'Every shortcut has a smell, but some shortcuts are too useful to ignore.'
    },
    {
        id: 'phase_03_specialized_town',
        chapterRange: [3, 5],
        levelRange: [36, 60],
        title: 'Specialized Services',
        storyPromise: 'Town facilities become specialized preparation tools for dungeons, elite monsters, and boss routes.',
        defaultUnlockedFeatures: ['advanced_forge', 'elemental_stock', 'dungeon_supply_contracts', 'casino_rotating_pools'],
        lockedFeatures: ['radiant_corridor_access', 'tower_countermeasures'],
        pillars: [
            TownRebuildPillar.FACILITY_REPAIR,
            TownRebuildPillar.SUPPLY_LINE,
            TownRebuildPillar.INFORMATION_NETWORK,
            TownRebuildPillar.THIRD_PARTY_SOURCE
        ],
        targetPlayerFeeling: 'I choose how to prepare: forge, farm, buy, gamble, or chase dangerous clues.'
    },
    {
        id: 'phase_04_terminal_preparation',
        chapterRange: [5, 6],
        levelRange: [61, 70],
        title: 'Terminal Preparation',
        storyPromise: 'The town becomes the last staging ground before void/light pressure and the future tower rewrite.',
        defaultUnlockedFeatures: ['void_precursor_preparation', 'glimmer_light_bridge', 'final_supply_line'],
        lockedFeatures: ['tower_rewrite_content'],
        pillars: [
            TownRebuildPillar.CRISIS_PRESSURE,
            TownRebuildPillar.SECURITY_LEVEL,
            TownRebuildPillar.VISIBLE_TOWN_STATE
        ],
        targetPlayerFeeling: 'The town survived because of earlier choices, and now it can prepare me for the late game.'
    }
]);

export const TownFunctionalGateDatabase = Object.freeze({
    town_map_hotspots: {
        id: 'town_map_hotspots',
        affectedSystem: 'town_map_interaction',
        initialState: 'available_but_sparse',
        unlockModel: 'Each hotspot should have visual town-state stages and optional resident/action focus.',
        keepOutOfScope: ['inventory', 'commission_helper']
    },
    market_stalls: {
        id: 'market_stalls',
        affectedSystem: 'market',
        initialState: 'locked_or_half_empty',
        unlockModel: 'Restored by supply routes, vendor rescue, and material-route clues.',
        rewardChannels: [TownRewardChannel.SHOP_STOCK, TownRewardChannel.MARKET_EXCHANGE, TownRewardChannel.INFORMATION]
    },
    general_shop: {
        id: 'general_shop',
        affectedSystem: 'shop',
        initialState: 'basic_stock_only',
        unlockModel: 'Stock expands through safe roads, quartermaster contracts, and dungeon clear flags.',
        rewardChannels: [TownRewardChannel.SHOP_STOCK]
    },
    forge: {
        id: 'forge',
        affectedSystem: 'shop',
        initialState: 'closed',
        unlockModel: 'Repair the forge, recover blacksmith/apprentice memory, then add blueprints and advanced services.',
        rewardChannels: [TownRewardChannel.FEATURE_UNLOCK, TownRewardChannel.FORGE_RECIPE, TownRewardChannel.STORY_EQUIPMENT]
    },
    casino: {
        id: 'casino',
        affectedSystem: 'casino',
        initialState: 'rumor_or_locked_door',
        unlockModel: 'Showcase curiosity opens the owner route; games feed ticket pools; branch consequences only matter when future story uses them.',
        rewardChannels: [TownRewardChannel.CASINO_POOL, TownRewardChannel.STORY_EQUIPMENT, TownRewardChannel.INFORMATION]
    },
    black_market: {
        id: 'black_market',
        affectedSystem: 'market',
        initialState: 'hidden',
        unlockModel: 'Revealed through rumor, debt, casino, or forbidden material routes.',
        rewardChannels: [TownRewardChannel.MARKET_EXCHANGE, TownRewardChannel.STORY_EQUIPMENT, TownRewardChannel.INFORMATION]
    },
    radiant_chapel: {
        id: 'radiant_chapel',
        affectedSystem: 'future_town_modules',
        initialState: 'planned',
        unlockModel: 'Late glimmer-to-light bridge that prepares the Lv70 radiant dungeon and future tower counterplay.',
        rewardChannels: [TownRewardChannel.FEATURE_UNLOCK, TownRewardChannel.MAP_ROUTE, TownRewardChannel.STORY_EQUIPMENT]
    }
});

export const TownRecoveryNodeDatabase = Object.freeze([
    {
        id: 'south_gate_first_repair',
        phaseId: 'phase_00_broken_town',
        title: 'South Gate First Repair',
        pillars: [TownRebuildPillar.SECURITY_LEVEL, TownRebuildPillar.VISIBLE_TOWN_STATE],
        ownerNpcIds: ['village_elder', 'standard_bearer_frey'],
        unlocks: ['safer_south_gate_exit', 'gate_notice_board_stage_1'],
        rewardChannels: [TownRewardChannel.MAP_ROUTE, TownRewardChannel.INFORMATION],
        meaningfulBranches: [],
        localEchoes: ['guards_comment_on_material_quality', 'refugees_move_closer_to_gate'],
        assetNeeds: ['scene_town_gate_broken', 'scene_town_gate_repaired_stage_1'],
        notes: 'Early town flavor: the player repairs a route, not just completes a kill quest.'
    },
    {
        id: 'apothecary_counter_reopens',
        phaseId: 'phase_01_first_network',
        title: 'Apothecary Counter Reopens',
        pillars: [TownRebuildPillar.NPC_RETURN, TownRebuildPillar.FACILITY_REPAIR, TownRebuildPillar.SUPPLY_LINE],
        ownerNpcIds: ['herbalist', 'apothecary_assistant'],
        unlocks: ['basic_potion_stock', 'antidote_stock_after_poison_route', 'refugee_health_state'],
        rewardChannels: [TownRewardChannel.SHOP_STOCK, TownRewardChannel.MARKET_EXCHANGE],
        meaningfulBranches: [],
        localEchoes: ['herbalist_uses_warm_humor_under_pressure'],
        assetNeeds: ['scene_apothecary_closed', 'scene_apothecary_reopened'],
        notes: 'Good place to show personality-based humor: the herbalist can joke gently even during a crisis.'
    },
    {
        id: 'forge_relighted',
        phaseId: 'phase_01_first_network',
        title: 'Forge Relighted',
        pillars: [TownRebuildPillar.NPC_RETURN, TownRebuildPillar.FACILITY_REPAIR],
        ownerNpcIds: ['blacksmith', 'neelu_apprentice'],
        unlocks: ['basic_forge', 'starter_repair', 'first_blueprint_discussion'],
        rewardChannels: [TownRewardChannel.FEATURE_UNLOCK, TownRewardChannel.FORGE_RECIPE, TownRewardChannel.STORY_EQUIPMENT],
        meaningfulBranches: [],
        localEchoes: ['blacksmith_deadpan_about_bad_metal', 'apprentice_memory_changes_forge_line'],
        assetNeeds: ['scene_forge_cold', 'scene_forge_relighted', 'portrait_neelu_apprentice'],
        notes: 'This is the model for story-matched systems: restoring the blacksmith should actually reopen forging.'
    },
    {
        id: 'market_supply_line',
        phaseId: 'phase_01_first_network',
        title: 'Market Supply Line',
        pillars: [TownRebuildPillar.SUPPLY_LINE, TownRebuildPillar.TRUST_REPUTATION],
        ownerNpcIds: ['merchant', 'supply_captain'],
        unlocks: ['rotating_material_stock', 'route_based_discounts', 'defense_item_supply'],
        rewardChannels: [TownRewardChannel.SHOP_STOCK, TownRewardChannel.MARKET_EXCHANGE],
        meaningfulBranches: [],
        localEchoes: ['merchant_banter_about_shipping_disaster', 'quartermaster_tracks_player_reliability'],
        assetNeeds: ['scene_market_empty_stalls', 'scene_market_supply_crates'],
        notes: 'Adds a non-NPC-collection flavor: the road itself becomes a town upgrade.'
    },
    {
        id: 'rumor_board_network',
        phaseId: 'phase_01_first_network',
        title: 'Rumor Board Network',
        pillars: [TownRebuildPillar.INFORMATION_NETWORK],
        ownerNpcIds: ['town_scholar', 'rumor_broker'],
        unlocks: ['monster_route_hints', 'elite_warning_tags', 'dungeon_preparation_notes'],
        rewardChannels: [TownRewardChannel.INFORMATION, TownRewardChannel.MAP_ROUTE],
        meaningfulBranches: [],
        localEchoes: ['rumor_broker_reframes_truth_as_gossip'],
        assetNeeds: ['scene_notice_board_blank', 'scene_notice_board_threaded'],
        notes: 'Turns story discovery into gameplay prep without touching the commission helper.'
    },
    {
        id: 'casino_showcase_hook',
        phaseId: 'phase_02_temptation_and_shadow',
        title: 'Casino Showcase Hook',
        pillars: [TownRebuildPillar.THIRD_PARTY_SOURCE, TownRebuildPillar.CRISIS_PRESSURE],
        ownerNpcIds: ['casino_dealer', 'accountant_marlo'],
        unlocks: ['casino_floor', 'showcase_inspection', 'ticket_prize_pools'],
        rewardChannels: [TownRewardChannel.CASINO_POOL, TownRewardChannel.STORY_EQUIPMENT, TownRewardChannel.INFORMATION],
        meaningfulBranches: [],
        localEchoes: ['dealer_charm_lines', 'bookkeeper_tracks_debt_without_moral_branch'],
        assetNeeds: ['scene_casino_locked', 'scene_casino_showcase_wall'],
        notes: 'The showcase should tempt first. The owner route can become a real branch only if it changes late story or ending state.'
    },
    {
        id: 'black_market_contact',
        phaseId: 'phase_02_temptation_and_shadow',
        title: 'Black Market Contact',
        pillars: [TownRebuildPillar.THIRD_PARTY_SOURCE, TownRebuildPillar.TRUST_REPUTATION],
        ownerNpcIds: ['street_beggar', 'black_market'],
        unlocks: ['hidden_stock', 'forbidden_material_exchange', 'risky_equipment_source'],
        rewardChannels: [TownRewardChannel.MARKET_EXCHANGE, TownRewardChannel.STORY_EQUIPMENT],
        meaningfulBranches: ['black_market_debt_future_story'],
        localEchoes: ['street_beggar_knows_more_than_he_admits'],
        assetNeeds: ['scene_black_market_door', 'scene_black_market_table'],
        notes: 'This is allowed to branch because debt/forbidden stock can matter later.'
    },
    {
        id: 'lamplighter_routes',
        phaseId: 'phase_02_temptation_and_shadow',
        title: 'Lamplighter Routes',
        pillars: [TownRebuildPillar.SECURITY_LEVEL, TownRebuildPillar.INFORMATION_NETWORK],
        ownerNpcIds: ['lamplighter_tavi'],
        unlocks: ['night_route_markers', 'safer_return_events', 'glimmer_route_hints'],
        rewardChannels: [TownRewardChannel.MAP_ROUTE, TownRewardChannel.INFORMATION],
        meaningfulBranches: [],
        localEchoes: ['tavi_optimistic_humor_under_fear'],
        assetNeeds: ['scene_lamplight_route'],
        notes: 'Connects glimmer precursor flavor to navigation before light becomes a high-tier element.'
    },
    {
        id: 'advanced_forge_contracts',
        phaseId: 'phase_03_specialized_town',
        title: 'Advanced Forge Contracts',
        pillars: [TownRebuildPillar.FACILITY_REPAIR, TownRebuildPillar.SUPPLY_LINE],
        ownerNpcIds: ['blacksmith', 'supply_captain'],
        unlocks: ['advanced_forge', 'dungeon_preparation_gear', 'elite_material_requests'],
        rewardChannels: [TownRewardChannel.FORGE_RECIPE, TownRewardChannel.STORY_EQUIPMENT, TownRewardChannel.SHOP_STOCK],
        meaningfulBranches: [],
        localEchoes: ['blacksmith_reacts_to_elite_materials'],
        assetNeeds: ['scene_forge_contract_board', 'blueprint_contract_sheet'],
        notes: 'Forge progression should be a stable alternative to casino and elite farming.'
    },
    {
        id: 'radiant_chapel_foundation',
        phaseId: 'phase_04_terminal_preparation',
        title: 'Radiant Chapel Foundation',
        pillars: [TownRebuildPillar.FACILITY_REPAIR, TownRebuildPillar.CRISIS_PRESSURE],
        ownerNpcIds: ['chapel_monk', 'town_scholar'],
        unlocks: ['glimmer_to_light_story_bridge', 'radiant_corridor_route'],
        rewardChannels: [TownRewardChannel.FEATURE_UNLOCK, TownRewardChannel.MAP_ROUTE, TownRewardChannel.STORY_EQUIPMENT],
        meaningfulBranches: ['radiant_route_tower_countermeasure'],
        localEchoes: ['chapel_monk_soft_humor_about_bad_prayers'],
        assetNeeds: ['scene_chapel_ruined', 'scene_chapel_lit', 'portrait_chapel_monk'],
        notes: 'Do not build tower content yet. This only prepares the Lv70 light dungeon counter-route.'
    }
]);

export const ThirdPartySourceDatabase = Object.freeze({
    casino_house: {
        id: 'casino_house',
        label: 'Casino House',
        sourceRole: 'uncontrolled_reward_sink',
        playerNeed: 'Tickets and unique gear with clear probability tables.',
        risk: 'Debt, temptation, or hidden owner route only when later story uses it.',
        preferredRewards: ['accessories', 'defense_items', 'odd_weapons', 'casino_signature_materials']
    },
    black_market_ring: {
        id: 'black_market_ring',
        label: 'Black Market Ring',
        sourceRole: 'forbidden_targeted_source',
        playerNeed: 'Specific rare materials or gear alternatives when normal routes are too slow.',
        risk: 'Reputation and future debt.',
        preferredRewards: ['shadow_precursor_items', 'forbidden_materials', 'risk_trade_accessories']
    },
    supply_caravans: {
        id: 'supply_caravans',
        label: 'Supply Caravans',
        sourceRole: 'stability_and_shop_growth',
        playerNeed: 'Reliable stock and defense gear after map routes become safer.',
        risk: 'Route attacks and stock shortages.',
        preferredRewards: ['consumables', 'basic_materials', 'defense_gear', 'map_tools']
    },
    scholar_network: {
        id: 'scholar_network',
        label: 'Scholar Network',
        sourceRole: 'information_to_power',
        playerNeed: 'Monster hints, dungeon warnings, boss-object drop clues.',
        risk: 'Incomplete or biased information.',
        preferredRewards: ['codex_entries', 'map_hints', 'blueprint_clues']
    }
});

export const TownAssetNeedDatabase = Object.freeze({
    scene_town_gate_broken: {
        id: 'scene_town_gate_broken',
        category: 'town_scene',
        targetFolder: 'src/assets/images/art/scenes/town/places-full',
        description: 'Broken south gate, damaged barricades, dark realistic fantasy, full desktop scene.'
    },
    scene_town_gate_repaired_stage_1: {
        id: 'scene_town_gate_repaired_stage_1',
        category: 'town_scene',
        targetFolder: 'src/assets/images/art/scenes/town/places-full',
        description: 'South gate with rough first repairs, still damaged but usable.'
    },
    scene_apothecary_closed: {
        id: 'scene_apothecary_closed',
        category: 'town_scene',
        targetFolder: 'src/assets/images/art/scenes/town/places-full',
        description: 'Closed apothecary counter with covered shelves and cold lamp.'
    },
    scene_apothecary_reopened: {
        id: 'scene_apothecary_reopened',
        category: 'town_scene',
        targetFolder: 'src/assets/images/art/scenes/town/places-full',
        description: 'Reopened apothecary with warm practical lighting and modest stock.'
    },
    scene_forge_cold: {
        id: 'scene_forge_cold',
        category: 'town_scene',
        targetFolder: 'src/assets/images/art/scenes/town/places-full',
        description: 'Cold forge, ash-filled hearth, broken tools, no flame.'
    },
    scene_forge_relighted: {
        id: 'scene_forge_relighted',
        category: 'town_scene',
        targetFolder: 'src/assets/images/art/scenes/town/places-full',
        description: 'Forge relit with controlled orange light, repaired anvil and active workbench.'
    },
    scene_market_empty_stalls: {
        id: 'scene_market_empty_stalls',
        category: 'town_scene',
        targetFolder: 'src/assets/images/art/scenes/town/places-full',
        description: 'Market with closed stalls, empty crates, and survival tension.'
    },
    scene_market_supply_crates: {
        id: 'scene_market_supply_crates',
        category: 'town_scene',
        targetFolder: 'src/assets/images/art/scenes/town/places-full',
        description: 'Market after supply route recovery, crates and guarded goods visible.'
    },
    scene_notice_board_blank: {
        id: 'scene_notice_board_blank',
        category: 'town_prop',
        targetFolder: 'src/assets/images/art/props/town',
        description: 'Blank damaged notice board for early town state.'
    },
    scene_notice_board_threaded: {
        id: 'scene_notice_board_threaded',
        category: 'town_prop',
        targetFolder: 'src/assets/images/art/props/town',
        description: 'Notice board filled with string, pins, routes, and monster warnings; no readable text.'
    },
    scene_casino_locked: {
        id: 'scene_casino_locked',
        category: 'town_scene',
        targetFolder: 'src/assets/images/art/scenes/town/places-full',
        description: 'Locked casino entrance, dim gold through cracks, temptation before access.'
    },
    scene_casino_showcase_wall: {
        id: 'scene_casino_showcase_wall',
        category: 'town_scene',
        targetFolder: 'src/assets/images/art/scenes/town/places-full',
        description: 'Casino showcase wall with powerful unique items behind glass.'
    },
    scene_black_market_door: {
        id: 'scene_black_market_door',
        category: 'town_scene',
        targetFolder: 'src/assets/images/art/scenes/town/places-full',
        description: 'Hidden black-market door in alley, subtle illegal signal, no text.'
    },
    scene_black_market_table: {
        id: 'scene_black_market_table',
        category: 'town_scene',
        targetFolder: 'src/assets/images/art/scenes/town/places-full',
        description: 'Black-market trade table with covered rare goods and threatening elegance.'
    },
    scene_lamplight_route: {
        id: 'scene_lamplight_route',
        category: 'town_scene',
        targetFolder: 'src/assets/images/art/scenes/town/places-full',
        description: 'Night route marked by glimmering lamps, safe path feeling, dark fantasy.'
    },
    scene_forge_contract_board: {
        id: 'scene_forge_contract_board',
        category: 'town_prop',
        targetFolder: 'src/assets/images/art/props/town',
        description: 'Forge contract board with blueprint silhouettes and pinned material bundles; no readable text.'
    },
    blueprint_contract_sheet: {
        id: 'blueprint_contract_sheet',
        category: 'blueprint',
        targetFolder: 'src/assets/images/art/items/blueprints',
        description: 'Generic advanced forge contract blueprint; object sketch should match the target item when specialized.'
    },
    scene_chapel_ruined: {
        id: 'scene_chapel_ruined',
        category: 'town_scene',
        targetFolder: 'src/assets/images/art/scenes/town/places-full',
        description: 'Ruined chapel foundation, faint glimmer traces, not yet radiant.'
    },
    scene_chapel_lit: {
        id: 'scene_chapel_lit',
        category: 'town_scene',
        targetFolder: 'src/assets/images/art/scenes/town/places-full',
        description: 'Restored radiant chapel foundation, controlled light, no tower imagery.'
    },
    portrait_neelu_apprentice: {
        id: 'portrait_neelu_apprentice',
        category: 'portrait',
        targetFolder: 'src/assets/images/art/characters/portraits',
        description: 'Blacksmith apprentice memory/return NPC, soot, nervous focus, craft identity.'
    },
    portrait_chapel_monk: {
        id: 'portrait_chapel_monk',
        category: 'portrait',
        targetFolder: 'src/assets/images/art/characters/portraits',
        description: 'Warm chapel monk NPC, glimmer-to-light route, calm but not overly holy.'
    }
});

export function getTownPhase(phaseId) {
    return TownPhaseDatabase.find(phase => phase.id === phaseId) || null;
}

export function getTownFunctionalGate(gateId) {
    return TownFunctionalGateDatabase[gateId] || null;
}

export function getTownRecoveryNode(nodeId) {
    return TownRecoveryNodeDatabase.find(node => node.id === nodeId) || null;
}

export function getTownRecoveryNodesByPhase(phaseId) {
    return TownRecoveryNodeDatabase.filter(node => node.phaseId === phaseId);
}

export function getMeaningfulTownBranches() {
    return TownRecoveryNodeDatabase.flatMap(node =>
        (node.meaningfulBranches || []).map(branchId => ({
            branchId,
            nodeId: node.id,
            phaseId: node.phaseId
        }))
    );
}

export function getTownAssetNeeds() {
    const referenced = new Set(TownRecoveryNodeDatabase.flatMap(node => node.assetNeeds || []));
    return Object.values(TownAssetNeedDatabase).filter(asset => referenced.has(asset.id));
}
