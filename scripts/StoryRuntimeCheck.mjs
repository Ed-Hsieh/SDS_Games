import GameManager from '../src/js/managers/GameManager.js';
import {
    StorySceneOrder,
    StorySceneRegistry
} from '../src/js/data/StorySceneRegistry.js';
import {
    MainlineCharacterContracts,
    StoryActorRegistry,
    StoryExpressionIds
} from '../src/js/data/StoryActors.js';
import {
    ChapterRegionOrder,
    ChapterRegionRegistry,
    getSceneRegionBinding
} from '../src/js/data/ChapterRegionRegistry.js';
import {
    OptionalSideStoryRegistry,
    OptionalSideStoryStatus,
    SideStoryRequiredCharacterIds
} from '../src/js/data/OptionalSideStoryRegistry.js';
import {
    StoryAchievementIds,
    StoryAchievementRegistry,
    getCurrentRunStoryFlagKeys,
    getStoryAchievementFlag
} from '../src/js/data/StoryStateContract.js';
import {
    StoryEncounterContracts,
    StoryEncounterPhase,
    StoryEncounterTransition,
    getStoryEncounterBeats,
    getStoryEncounterContract,
    hasPostBattlePresentation,
    validateStoryEncounterContract
} from '../src/js/data/StoryEncounterContracts.js';
import { TownPlaceDatabase } from '../src/js/data/TownPlaces.js';
import { CharacterProfileDatabase } from '../src/js/data/CharacterProfiles.js';
import { TownNPCDatabase } from '../src/js/data/NPCDialogues.js';
import { QuestDatabase } from '../src/js/data/Quests.js';
import { MonsterDatabase } from '../src/js/data/Monsters.js';
import { getTownRuntimeSummary } from '../src/js/managers/TownStateResolver.js';
import StorySceneManager from '../src/js/managers/StorySceneManager.js';
import WorldMap from '../src/js/utils/WorldMap.js';
import {
    OverworldMapConfig,
    SecondRunOvercapBossReserves,
    getOverworldHabitatAt
} from '../src/js/data/OverworldMapRegistry.js';
import { getStoryObjectiveHint } from '../src/js/data/StoryObjectiveHints.js';
import { storyJournalManager } from '../src/js/managers/StoryJournalManager.js';

const errors = [];
const warnings = [];
const error = (section, message) => errors.push({ section, message });
const warn = (section, message) => warnings.push({ section, message });

function sceneSupportsRun(scene, run) {
    const condition = run >= 2 ? 'second_run' : 'first_run';
    return scene.beats.some(beat => beat.condition === 'any' || beat.condition === condition);
}

function validateScenes() {
    if (StorySceneOrder.length !== 66) {
        error('scene-count', `Expected 66 scenes, got ${StorySceneOrder.length}`);
    }
    if (new Set(StorySceneOrder).size !== StorySceneOrder.length) {
        error('scene-id', 'Scene ids are not unique');
    }

    const mapSceneIds = [];
    for (const sceneId of StorySceneOrder) {
        const scene = StorySceneRegistry[sceneId];
        if (!scene) {
            error('scene-registry', `${sceneId} is missing from StorySceneRegistry`);
            continue;
        }
        if (!['regional_canvas', 'location_scene', 'town_scene', 'memory_or_ending'].includes(scene.stageClass)) {
            error('stage-class', `${sceneId} has invalid stage class ${scene.stageClass}`);
        }
        for (const beat of scene.beats || []) {
            if (beat.actorId && !StoryActorRegistry[beat.actorId]) {
                error('actor', `${sceneId} references missing actor ${beat.actorId}`);
            }
            if (beat.expression && !StoryExpressionIds.includes(beat.expression)) {
                error('expression', `${sceneId} references expression outside the closed vocabulary: ${beat.expression}`);
            }
        }
        if (scene.stageClass === 'regional_canvas' || scene.stageClass === 'location_scene') {
            mapSceneIds.push(sceneId);
        }
    }

    const firstRunCount = StorySceneOrder.filter(id => sceneSupportsRun(StorySceneRegistry[id], 1)).length;
    const secondRunCount = StorySceneOrder.filter(id => sceneSupportsRun(StorySceneRegistry[id], 2)).length;
    if (firstRunCount !== 65) error('run-scenes', `First run should skip one scene, got ${firstRunCount}`);
    if (secondRunCount !== 66) error('run-scenes', `Second run should contain all 66 scenes, got ${secondRunCount}`);
    if (sceneSupportsRun(StorySceneRegistry.ch7_s03_echo_memory, 1)) {
        error('run-scenes', 'ch7_s03_echo_memory must be second-run only');
    }

    const bindingIds = Object.values(ChapterRegionRegistry)
        .flatMap(region => region.sceneBindings.map(binding => binding.sceneId));
    const bindingCounts = new Map(bindingIds.map(id => [id, bindingIds.filter(entry => entry === id).length]));
    for (const sceneId of mapSceneIds) {
        const count = bindingCounts.get(sceneId) || 0;
        if (count !== 1) error('scene-binding', `${sceneId} has ${count} region bindings`);
    }
    for (const sceneId of bindingIds) {
        if (!mapSceneIds.includes(sceneId)) error('scene-binding', `${sceneId} is bound to the map but is not a map-stage scene`);
    }
}

function validateMainlineCharacterContracts() {
    const contractEntries = Object.entries(MainlineCharacterContracts);
    if (contractEntries.length !== 9) {
        error('character-contract', `Expected nine core character contracts, got ${contractEntries.length}`);
    }

    for (const [actorId, contract] of contractEntries) {
        if (!StoryActorRegistry[actorId]) error('character-contract', `${actorId} is not a story actor`);
        if (!CharacterProfileDatabase[actorId]) error('character-contract', `${actorId} has no runtime character profile`);

        const actorSceneIds = StorySceneOrder.filter(sceneId =>
            StorySceneRegistry[sceneId]?.beats?.some(beat => beat.actorId === actorId)
        );
        const actorChapters = new Set(actorSceneIds.map(sceneId => StorySceneRegistry[sceneId].chapter));
        if (actorChapters.size < 4) {
            error('character-weight', `${actorId} only appears across ${actorChapters.size} chapters`);
        }

        const ownedSceneIds = [
            contract.introductionSceneId,
            ...(contract.decisiveSceneIds || []),
            contract.endpointSceneIds?.first_run,
            contract.endpointSceneIds?.second_run
        ].filter(Boolean);
        for (const sceneId of ownedSceneIds) {
            const scene = StorySceneRegistry[sceneId];
            if (!scene) {
                error('character-contract', `${actorId} references missing scene ${sceneId}`);
                continue;
            }
            if (!scene.beats.some(beat => beat.actorId === actorId)) {
                error('character-contract', `${actorId} does not participate in owned scene ${sceneId}`);
            }
        }

        const firstEndpoint = StorySceneRegistry[contract.endpointSceneIds?.first_run];
        const secondEndpoint = StorySceneRegistry[contract.endpointSceneIds?.second_run];
        if (firstEndpoint && !firstEndpoint.beats.some(beat =>
            beat.actorId === actorId && ['any', 'first_run'].includes(beat.condition)
        )) {
            error('character-endpoint', `${actorId} lacks a first-run endpoint performance`);
        }
        if (secondEndpoint && !secondEndpoint.beats.some(beat =>
            beat.actorId === actorId && ['any', 'second_run'].includes(beat.condition)
        )) {
            error('character-endpoint', `${actorId} lacks a second-run endpoint performance`);
        }
    }
}

function validateOptionalSideStories() {
    if (OptionalSideStoryRegistry.length !== SideStoryRequiredCharacterIds.length * 3) {
        error('optional-side-story', `Expected short, medium, and long stories for every core character, got ${OptionalSideStoryRegistry.length}`);
    }
    const ids = new Set();
    for (const entry of OptionalSideStoryRegistry) {
        if (ids.has(entry.id)) error('optional-side-story', `Duplicate side-story id ${entry.id}`);
        ids.add(entry.id);
        if (entry.status !== OptionalSideStoryStatus.APPROVED) {
            error('optional-side-story', `${entry.id} lost its approved production state`);
        }
        if (!entry.rewardBinding?.kind || !entry.rewardBinding?.id) {
            error('reward-definition', `${entry.id} lacks a reviewable reward definition`);
        }
        if (!entry.purpose || !entry.characterReveal || !entry.mainlineBoundary || !entry.futureOwner) {
            error('optional-side-story', `${entry.id} lacks purpose, character reveal, mainline boundary, or owner`);
        }
        if (!Array.isArray(entry.chapterWindow)
            || entry.chapterWindow.length !== 2
            || entry.chapterWindow[0] < 1
            || entry.chapterWindow[1] > 7
            || entry.chapterWindow[0] > entry.chapterWindow[1]) {
            error('optional-side-story', `${entry.id} has invalid chapter window`);
        }
        for (const actorId of entry.characterIds || []) {
            if (!StoryActorRegistry[actorId]) {
                error('optional-side-story', `${entry.id} references missing actor ${actorId}`);
            }
        }
    }
}

function validateRegions() {
    if (ChapterRegionOrder.length !== 7) {
        error('region-count', `Expected seven regions, got ${ChapterRegionOrder.length}`);
    }

    for (const regionId of ChapterRegionOrder) {
        const region = ChapterRegionRegistry[regionId];
        const locationIds = new Set(region.locationNodes.map(node => node.id));
        const segmentIds = new Set(region.routeSegments.map(segment => segment.id));
        if (!region.entryNodes.length || !region.exitNodes.length) error('region-entry', `${regionId} lacks entry or exit nodes`);
        if (!region.routeSegments.some(segment => segment.optional)) warn('optional-route', `${regionId} has no optional route segment`);
        if (!region.bossConvergence?.locationId || !locationIds.has(region.bossConvergence.locationId)) {
            error('boss-convergence', `${regionId} has no valid fixed boss convergence location`);
        }

        for (const segment of region.routeSegments) {
            if (!locationIds.has(segment.from)) error('segment-node', `${regionId}:${segment.id} missing from node ${segment.from}`);
            if (!locationIds.has(segment.to)) error('segment-node', `${regionId}:${segment.id} missing to node ${segment.to}`);
            if (!Array.isArray(segment.path) || segment.path.length < 2) error('segment-path', `${regionId}:${segment.id} has no authored path`);
            const from = region.locationNodes.find(node => node.id === segment.from)?.position;
            const to = region.locationNodes.find(node => node.id === segment.to)?.position;
            const first = segment.path?.[0];
            const last = segment.path?.[segment.path.length - 1];
            if (from && (first?.[0] !== from.x || first?.[1] !== from.y)) {
                error('segment-path', `${regionId}:${segment.id} path does not start at ${segment.from}`);
            }
            if (to && (last?.[0] !== to.x || last?.[1] !== to.y)) {
                error('segment-path', `${regionId}:${segment.id} path does not end at ${segment.to}`);
            }
        }
        for (const binding of region.sceneBindings) {
            const scene = StorySceneRegistry[binding.sceneId];
            if (!scene) continue;
            if (scene.stageClass !== binding.stageClass) {
                error('binding-class', `${binding.sceneId} is ${scene.stageClass}, binding says ${binding.stageClass}`);
            }
            if (!locationIds.has(binding.targetId) && !segmentIds.has(binding.targetId)) {
                error('binding-target', `${regionId}:${binding.sceneId} targets missing ${binding.targetId}`);
            }
            if (getSceneRegionBinding(binding.sceneId)?.regionId !== regionId) {
                error('binding-index', `${binding.sceneId} index does not point back to ${regionId}`);
            }
        }

    }

    validateOverworldPrototype();
}

function validateOverworldPrototype() {
    const originalFlags = { ...(GameManager.state.flags || {}) };
    const originalMapState = GameManager.state.mapState;
    const gate = OverworldMapConfig.routeGates[0];

    GameManager.state.flags = { 'story.run': 1 };
    GameManager.state.mapState = null;
    const map = new WorldMap(GameManager.getCharacter(), 1000, 600);

    if (OverworldMapConfig.tiles.length !== 2) {
        error('overworld-prototype', `Expected two ready map tiles, got ${OverworldMapConfig.tiles.length}`);
    }
    for (const tile of OverworldMapConfig.tiles) {
        const region = ChapterRegionRegistry[tile.regionId];
        if (!region || tile.imageId !== region.visual?.backgroundId || tile.title !== region.visual?.mapTitle) {
            error('overworld-authority', `${tile.id} presentation drifted from ChapterRegionRegistry`);
        }
    }
    for (const landmark of OverworldMapConfig.landmarks) {
        const tile = OverworldMapConfig.tiles.find(entry => (
            landmark.x >= entry.x
            && landmark.x < entry.x + entry.cols
            && landmark.y >= entry.y
            && landmark.y < entry.y + entry.rows
        ));
        const node = tile && ChapterRegionRegistry[tile.regionId]?.locationNodes
            .find(entry => entry.id === landmark.id);
        if (!tile || !node
            || landmark.name !== node.name
            || landmark.bossId !== node.bossId
            || landmark.x !== tile.x + node.position.x
            || landmark.y !== tile.y + node.position.y) {
            error('overworld-authority', `${landmark.id} drifted from ChapterRegionRegistry`);
        }
    }
    if (!map.isCellTraversable(map.playerPos.x, map.playerPos.y)) {
        error('overworld-prototype', 'Start position is not traversable');
    }
    if (!gate || !map.getBlockingGateAt(gate.x, gate.y)) {
        error('overworld-prototype', 'Closed route gate does not block the chapter seam');
    }

    if (gate) {
        map.setGateOpen(gate.id, true);
        if (!map.isCellTraversable(gate.x, gate.y)) {
            error('overworld-prototype', 'Resolved route gate does not open its passage');
        }
    }

    const chapterOneHabitat = getOverworldHabitatAt(15, 16);
    const chapterTwoHabitat = getOverworldHabitatAt(65, 16);
    if (!chapterOneHabitat?.monsterIds?.length || !chapterTwoHabitat?.monsterIds?.length) {
        error('overworld-prototype', 'Ready map habitats must own non-empty monster pools');
    }
    if (chapterOneHabitat?.id === chapterTwoHabitat?.id) {
        error('overworld-prototype', 'Chapter one and chapter two prototype cells share one habitat');
    }
    if (SecondRunOvercapBossReserves.length !== 7) {
        error('overworld-prototype', `Expected seven overcap Boss reserves, got ${SecondRunOvercapBossReserves.length}`);
    }

    GameManager.state.flags = originalFlags;
    GameManager.state.mapState = originalMapState;
}

function validateStoryEncounterContracts() {
    const entries = Object.values(StoryEncounterContracts);
    if (entries.length !== 7) {
        error('story-encounter', `Expected seven mainline encounter contracts, got ${entries.length}`);
    }

    const encounterIds = new Set();
    for (const entry of entries) {
        if (encounterIds.has(entry.id)) error('story-encounter', `Duplicate encounter id ${entry.id}`);
        encounterIds.add(entry.id);

        const scene = StorySceneRegistry[entry.sceneId];
        const binding = getSceneRegionBinding(entry.sceneId);
        for (const message of validateStoryEncounterContract(scene, entry)) {
            error('story-encounter', `${entry.id}: ${message}`);
        }
        if (binding?.regionId !== entry.regionId) {
            error('story-encounter', `${entry.id} region does not match its scene binding`);
        }
        if (binding?.targetId !== entry.locationId || binding?.trigger !== 'boss_convergence') {
            error('story-encounter', `${entry.id} is not bound to its Boss convergence location`);
        }
        const region = ChapterRegionRegistry[entry.regionId];
        if (region?.bossConvergence?.bossId !== entry.monsterId) {
            error('story-encounter', `${entry.id} monster does not match ChapterRegionRegistry`);
        }
        if (!MonsterDatabase[entry.monsterId]) {
            error('story-encounter', `${entry.id} references missing monster ${entry.monsterId}`);
        }

        for (const runCondition of entry.runConditions) {
            const accepts = beat => beat.condition === 'any' || beat.condition === runCondition;
            const preBattle = getStoryEncounterBeats(scene, entry, StoryEncounterPhase.PRE_BATTLE).filter(accepts);
            if (preBattle.length === 0) {
                error('story-encounter', `${entry.id} has no player-facing ${runCondition} pre-battle beats`);
            }
            if (hasPostBattlePresentation(entry)) {
                const postBattle = getStoryEncounterBeats(scene, entry, StoryEncounterPhase.POST_BATTLE).filter(accepts);
                if (postBattle.length === 0) {
                    error('story-encounter', `${entry.id} has no player-facing ${runCondition} post-battle beats`);
                }
            }
        }
    }

    if (getStoryEncounterContract('ch6_s04_dragon_convergence', 2)) {
        error('story-encounter', 'Second-run dragon convergence must not open combat');
    }
}

function completeStorySceneLifecycle(manager, sceneId) {
    const started = manager.startScene(sceneId);
    if (!started.success) return { success: false, stage: 'start', result: started };

    let result = manager.completeScene(sceneId, { phase: started.scenePhase });
    if (result.transition !== StoryEncounterTransition.ENCOUNTER_REQUIRED) {
        return { success: Boolean(result.success && result.completed), stage: 'complete', result };
    }

    const began = manager.beginEncounter(result.encounter.id);
    if (!began.success) return { success: false, stage: 'encounter-start', result: began };

    result = manager.resolveEncounter(result.encounter.id, { victory: true });
    if (result.transition === StoryEncounterTransition.POST_BATTLE) {
        result = manager.completeScene(sceneId, {
            phase: result.presentation?.scenePhase
        });
    }

    return { success: Boolean(result.success && result.completed), stage: 'encounter-complete', result };
}

function validateStoryState() {
    const firstRunAchievements = [
        StoryAchievementIds.FLAG_DID_NOT_RETURN,
        StoryAchievementIds.WATER_WAS_COLD,
        StoryAchievementIds.ELDER_BEFORE_SCAR,
        StoryAchievementIds.DEALER_LEFT_SEAT,
        StoryAchievementIds.ECHO_WENT_AHEAD,
        StoryAchievementIds.UNFINISHED_REGICIDE
    ];
    for (const achievementId of firstRunAchievements) {
        if (!StoryAchievementRegistry[achievementId]) error('achievement', `Missing ${achievementId}`);
    }

    const flags = {
        'story.scene.ch1_s01_road_collapse.complete': true,
        'story.fate.mia': 'dead',
        'story.ailo.name_revealed': true,
        [getStoryAchievementFlag(StoryAchievementIds.WATER_WAS_COLD)]: true,
        'story.secondRunUnlocked': true,
        'story.run': 1
    };
    const clearedFlags = new Set(getCurrentRunStoryFlagKeys(flags));
    if (!clearedFlags.has('story.scene.ch1_s01_road_collapse.complete')) error('run-reset', 'Scene completion was not selected for run reset');
    if (!clearedFlags.has('story.fate.mia')) error('run-reset', 'Character fate was not selected for run reset');
    if (!clearedFlags.has('story.ailo.name_revealed')) error('run-reset', 'Ailo current-run reveal was not selected for run reset');
    if (clearedFlags.has(getStoryAchievementFlag(StoryAchievementIds.WATER_WAS_COLD))) error('run-reset', 'Achievement memory was selected for clearing');
    if (clearedFlags.has('story.secondRunUnlocked')) error('run-reset', 'Second-run unlock was selected for clearing');
}

function validateEncounterGateLifecycle() {
    const originalFlags = GameManager.state.flags;
    GameManager.state.flags = { 'story.run': 1, 'story.chapter': 1 };
    const manager = new StorySceneManager();
    const sceneId = 'ch1_s10_forest_guardian';

    const started = manager.startScene(sceneId, { force: true });
    const gated = manager.completeScene(sceneId, { phase: started.scenePhase, force: true });
    if (gated.transition !== StoryEncounterTransition.ENCOUNTER_REQUIRED) {
        error('story-encounter-gate', 'Boss scene presentation did not stop at the encounter gate');
    }
    if (manager.isSceneComplete(sceneId)) {
        error('story-encounter-gate', 'Boss scene completed before combat');
    }

    const began = manager.beginEncounter(gated.encounter?.id);
    if (!began.success) error('story-encounter-gate', 'Prepared encounter could not begin');
    const defeated = manager.resolveEncounter(gated.encounter?.id, { victory: false });
    if (defeated.transition !== StoryEncounterTransition.RETRY_REQUIRED || manager.isSceneComplete(sceneId)) {
        error('story-encounter-gate', 'Defeat did not leave the Boss scene available for retry');
    }

    const retryStarted = manager.startScene(sceneId, { force: true });
    const retryGate = manager.completeScene(sceneId, { phase: retryStarted.scenePhase });
    manager.beginEncounter(retryGate.encounter?.id);
    const victory = manager.resolveEncounter(retryGate.encounter?.id, { victory: true });
    if (victory.transition !== StoryEncounterTransition.POST_BATTLE || manager.isSceneComplete(sceneId)) {
        error('story-encounter-gate', 'Victory did not open the post-battle phase before completion');
    }
    const completed = manager.completeScene(sceneId, { phase: victory.presentation?.scenePhase });
    if (!completed.completed || !manager.isSceneComplete(sceneId)) {
        error('story-encounter-gate', 'Post-battle presentation did not complete the Boss scene');
    }

    GameManager.state.flags = originalFlags;
}

function validateTwoRunLifecycle() {
    const originalFlags = GameManager.state.flags;
    GameManager.state.flags = { 'story.run': 1, 'story.chapter': 1 };
    const manager = new StorySceneManager();

    const firstRunOrder = manager.getAvailableSceneOrder();
    if (firstRunOrder.length !== 65) error('run-lifecycle', `First-run lifecycle has ${firstRunOrder.length} scenes`);
    for (const sceneId of firstRunOrder) {
        const lifecycle = completeStorySceneLifecycle(manager, sceneId);
        if (!lifecycle.success) {
            error('run-lifecycle', `First run could not complete ${sceneId} at ${lifecycle.stage}: ${lifecycle.result?.reason || 'unknown'}`);
            break;
        }
    }
    if (!GameManager.getFlag?.('story.secondRunUnlocked')) {
        error('run-lifecycle', 'First-run ending did not unlock second run');
    }
    for (const achievementId of [
        StoryAchievementIds.FLAG_DID_NOT_RETURN,
        StoryAchievementIds.WATER_WAS_COLD,
        StoryAchievementIds.ELDER_BEFORE_SCAR,
        StoryAchievementIds.DEALER_LEFT_SEAT,
        StoryAchievementIds.ECHO_WENT_AHEAD,
        StoryAchievementIds.UNFINISHED_REGICIDE
    ]) {
        if (!GameManager.getFlag?.(getStoryAchievementFlag(achievementId))) {
            error('run-lifecycle', `First run did not preserve achievement ${achievementId}`);
        }
    }

    const secondRunStart = manager.beginSecondRun();
    if (!secondRunStart.success) error('run-lifecycle', `Second run did not begin: ${secondRunStart.reason}`);
    if (manager.getNextAvailableSceneId() !== StorySceneOrder[0]) {
        error('run-lifecycle', 'Second run did not reset to the first screenplay scene');
    }
    if (GameManager.getFlag?.('story.fate.mia')) error('run-lifecycle', 'First-run fate survived into second run');
    if (!GameManager.getFlag?.(getStoryAchievementFlag(StoryAchievementIds.WATER_WAS_COLD))) {
        error('run-lifecycle', 'Achievement memory was lost when second run began');
    }

    const secondRunOrder = manager.getAvailableSceneOrder();
    if (secondRunOrder.length !== 66) error('run-lifecycle', `Second-run lifecycle has ${secondRunOrder.length} scenes`);
    for (const sceneId of secondRunOrder) {
        const lifecycle = completeStorySceneLifecycle(manager, sceneId);
        if (!lifecycle.success) {
            error('run-lifecycle', `Second run could not complete ${sceneId} at ${lifecycle.stage}: ${lifecycle.result?.reason || 'unknown'}`);
            break;
        }
    }
    if (GameManager.getFlag?.('story.ending') !== 'true_ending') {
        error('run-lifecycle', 'Second-run lifecycle did not reach the true ending');
    }
    if (!GameManager.getFlag?.(getStoryAchievementFlag(StoryAchievementIds.FLOWERS_BLOOM_AT_ECHO_END))) {
        error('run-lifecycle', 'True ending achievement was not applied');
    }

    GameManager.state.flags = originalFlags;
}

function validateTownAndCharacters() {
    const forbiddenResidents = new Set([
        'supply_captain',
        'rumor_broker',
        'old_miner_bran',
        'tinker',
        'accountant_marlo',
        'tower_warden',
        'apothecary_assistant'
    ]);
    const residentIds = TownPlaceDatabase.flatMap(place => place.residents || []).map(entry => entry.npcId);
    for (const id of forbiddenResidents) {
        if (residentIds.includes(id)) error('town-resident', `${id} remains active in TownPlaces`);
        if (CharacterProfileDatabase[id]) error('character-profile', `${id} remains in active CharacterProfiles`);
        if (TownNPCDatabase[id]) error('npc-dialogue', `${id} remains in active TownNPCDatabase`);
    }
    if (TownPlaceDatabase.some(place => place.id === 'tower')) error('town-place', 'Paused tower remains an active town place');

    const miaPlace = TownPlaceDatabase.find(place => place.id === 'mia_workroom');
    if (!miaPlace) error('mia-workroom', 'Mia workroom is missing');
    if ((miaPlace?.actions || []).some(action => action.route === 'shop')) error('mia-workroom', 'Mia workroom exposes shop functionality');
    const market = TownPlaceDatabase.find(place => place.id === 'market');
    if ((market?.residents || []).some(resident => resident.npcId === 'herbalist')) {
        error('market', 'Mia is still a market resident');
    }

    const originalFlags = GameManager.state.flags;
    GameManager.state.flags = { 'story.run': 1, 'story.chapter': 1 };
    let summary = getTownRuntimeSummary();
    if (summary.visiblePlaces.map(place => place.id).join(',') !== 'crossroads') {
        error('town-opening', `Unexpected initial places: ${summary.visiblePlaces.map(place => place.id).join(',')}`);
    }
    GameManager.state.flags['story.scene.ch1_s01_road_collapse.complete'] = true;
    GameManager.state.flags['story.scene.ch1_s03_broken_crossroads.complete'] = true;
    GameManager.state.flags['story.scene.ch1_s04_elder_to_scholar.complete'] = true;
    summary = getTownRuntimeSummary();
    for (const id of ['crossroads', 'mia_workroom', 'handbook', 'gate']) {
        if (!summary.visiblePlaces.some(place => place.id === id)) error('town-opening', `${id} should be visible after ch1_s04`);
    }
    GameManager.state.flags = originalFlags;
}

function validateQuests() {
    if (Object.hasOwn(QuestDatabase, 'main')) error('main-quests', 'Legacy main quest group must remain removed');
    const expectedGroups = ['bounty', 'commission', 'hidden'];
    const actualGroups = Object.keys(QuestDatabase).sort();
    if (actualGroups.join(',') !== expectedGroups.sort().join(',')) {
        error('optional-quests', `Unexpected quest groups: ${actualGroups.join(',')}`);
    }
    for (const [group, quests] of Object.entries(QuestDatabase)) {
        if (!Array.isArray(quests) || quests.length > 0) {
            error('optional-quests', `${group} must remain empty until an optional quest runtime contract is approved`);
        }
    }
}

function validateRelationshipJournal() {
    const originalGetFlag = GameManager.getFlag;
    const flags = new Map();
    GameManager.getFlag = flag => flags.get(flag);

    try {
        if (storyJournalManager.getRelationshipRecords().length !== 0) {
            error('relationship-journal', 'Character records appear before their mainline introduction');
        }

        const actorId = 'herbalist';
        const contract = MainlineCharacterContracts[actorId];
        const profile = CharacterProfileDatabase[actorId];
        flags.set(`story.scene.${contract.introductionSceneId}.complete`, true);

        let records = storyJournalManager.getRelationshipRecords();
        const initial = records.find(record => record.relationship?.npcId === actorId);
        if (!initial) error('relationship-journal', 'Introduced character is missing from the journal');
        if (initial && ('talkCount' in initial.relationship || 'depth' in initial.relationship)) {
            error('relationship-journal', 'Relationship journal restored talk-count familiarity state');
        }

        const laterStage = profile.stages.find(stage => stage.fromFlag);
        flags.set(laterStage.fromFlag, true);
        records = storyJournalManager.getRelationshipRecords();
        const progressed = records.find(record => record.relationship?.npcId === actorId);
        if (progressed?.relationship?.stage?.id !== laterStage.id) {
            error('relationship-journal', 'Accepted character-stage flag did not advance the journal record');
        }
        if (!(progressed?.sections || []).some(section =>
            (section.lines || []).some(line => String(line).includes(laterStage.label))
        )) {
            error('relationship-journal', 'Unlocked character stage is absent from the journal presentation');
        }
    } finally {
        GameManager.getFlag = originalGetFlag;
    }
}

function validateStoryObjectiveHints() {
    for (const sceneId of StorySceneOrder) {
        const hint = getStoryObjectiveHint(sceneId);
        if (!hint?.title?.trim()) error('objective-hint', `${sceneId} has no tracker title`);
        if (!hint?.text?.trim()) error('objective-hint', `${sceneId} has no tracker instruction`);
    }

    const survey = getStoryObjectiveHint('ch1_s06_three_landmarks', {
        chapterOneInvestigations: {
            south_gate_farmland: { victory: true, evidence: true },
            hunter_boardwalk: { victory: true, evidence: true },
            old_campfire_site: { victory: false, evidence: false }
        },
        chapterOneFirstReportComplete: true,
        chapterOneHomeRecoveryKnown: true
    });
    if (!survey?.text.includes('東南方') || !survey.text.includes('未知地標')) {
        error('objective-hint', 'Chapter 1 survey hint does not reflect evidence-combat progress');
    }
    if (StorySceneRegistry.ch2_s05_blood_moon_hunt) {
        error('objective-hint', 'Removed Chapter 2 Blood Moon Stag route remains in the scene registry');
    }
    if (!StorySceneRegistry.ch2_s05_moon_moss_trace) {
        error('objective-hint', 'Chapter 2 moon-moss observation scene is missing');
    }
    for (const sceneId of [
        'ch1_s02_wake_under_bitter_bottles',
        'ch1_s03_broken_crossroads',
        'ch1_s04_elder_to_scholar',
        'ch1_s05_south_gate_introduction',
        'ch1_s08_cold_forge_smoke',
        'ch1_s11_roads_breathe_again',
        'ch2_s01_empty_crates',
        'ch2_s02_name_under_basket',
        'ch2_s03_ledger_that_would_not_close',
        'ch2_s07_names_return_to_town'
    ]) {
        const hint = getStoryObjectiveHint(sceneId);
        if (!hint?.placeId || !hint?.actorId) error('objective-entry', `${sceneId} has no explicit town entry contract`);
    }

    const scholarHandoff = getStoryObjectiveHint('ch1_s04_elder_to_scholar');
    if (scholarHandoff?.actorId !== 'town_scholar' || scholarHandoff?.placeId !== 'handbook') {
        error('objective-entry', 'Chapter 1 scholar handoff must only target the scholar at the handbook');
    }
    const southGate = getStoryObjectiveHint('ch1_s05_south_gate_introduction');
    if (southGate?.placeId !== 'gate') {
        error('objective-entry', 'Chapter 1 south-gate introduction targets an unknown town place');
    }
}

validateScenes();
validateMainlineCharacterContracts();
validateRelationshipJournal();
validateOptionalSideStories();
validateRegions();
validateStoryEncounterContracts();
validateStoryState();
validateEncounterGateLifecycle();
validateTwoRunLifecycle();
validateTownAndCharacters();
validateQuests();
validateStoryObjectiveHints();

console.log('Story runtime summary:');
console.log(`- screenplay scenes: ${StorySceneOrder.length}`);
console.log(`- closed expressions: ${StoryExpressionIds.length}`);
console.log(`- core mainline character contracts: ${Object.keys(MainlineCharacterContracts).length}`);
console.log('- relationship journal authority: mainline introduction + character-stage flags');
console.log(`- approved personal side stories pending production: ${OptionalSideStoryRegistry.length}`);
console.log(`- chapter regions: ${ChapterRegionOrder.length}`);
console.log(`- mainline encounter contracts: ${Object.keys(StoryEncounterContracts).length}`);
console.log(`- active town places: ${TownPlaceDatabase.length}`);
console.log(`- legacy main quest group: ${Object.hasOwn(QuestDatabase, 'main') ? 'present' : 'removed'}`);

if (warnings.length > 0) {
    console.log('\nWarnings:');
    for (const entry of warnings) console.log(`- [${entry.section}] ${entry.message}`);
}

if (errors.length > 0) {
    console.error(`\nStory runtime check found ${errors.length} error(s):`);
    for (const entry of errors) console.error(`- [${entry.section}] ${entry.message}`);
    process.exit(1);
}

console.log('\nStory runtime check passed.');
