import fs from 'node:fs';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    innerWidth: 1920,
    innerHeight: 1080
};
globalThis.document = {
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => []
};
globalThis.requestAnimationFrame = () => 1;
globalThis.cancelAnimationFrame = () => {};

const { default: GameManager } = await import('../src/js/managers/GameManager.js');
const { default: WorldMap } = await import('../src/js/utils/WorldMap.js');
const {
    createLocationEncounter,
    createPrologueTutorialEncounter
} = await import('../src/js/managers/AdventureEncounterManager.js');
const { MonsterDatabase } = await import('../src/js/data/Monsters.js');
const { FirstRunMonsterFixedLevels } = await import('../src/js/data/MonsterEcology.js');
const { OverworldHabitats, OverworldLandmarks, OverworldMapConfig } = await import('../src/js/data/OverworldMapRegistry.js');
const { ChapterRegionRegistry } = await import('../src/js/data/ChapterRegionRegistry.js');
const { RecipeSeriesDatabase, SeriesRecipeDatabase } = await import('../src/js/data/RecipeSeries.js');
const { FirstRunBandAllocationPlan } = await import('../src/js/data/FirstRunLootBalance.js');
const {
    AdventureOnboardingFlag,
    AdventureOnboardingStep,
    ChapterOneProgressFlag,
    ChapterOneInvestigationOrder,
    ChapterOneInvestigations,
    ChapterOneMantisRecovery,
    ChapterOneOptionalRoutes,
    ChapterOneRotrootTrials,
    ChapterOneSpecialGearIds
} = await import('../src/js/data/ChapterOneProgression.js');
const { getStoryScene } = await import('../src/js/data/StorySceneRegistry.js');
const { StoryRouteEncounterContracts, StoryEncounterContracts } = await import('../src/js/data/StoryEncounterContracts.js');
const { getStoryObjectiveHint } = await import('../src/js/data/StoryObjectiveHints.js');
const { getStoryDiscovery } = await import('../src/js/data/StoryDiscoveries.js');
const { getStorySceneEffects } = await import('../src/js/data/StoryStateContract.js');

const failures = [];
const check = (condition, message) => {
    if (!condition) failures.push(message);
};

const prologueEncounter = createPrologueTutorialEncounter({
    id: 'prologue_contract_probe',
    name: 'Prologue Contract Probe',
    chapter: 1,
    threat: 'overcap'
}, { title: 'Prologue Contract Probe', image: '' });
check(Boolean(prologueEncounter), 'Prologue tutorial encounter cannot be created');
check(prologueEncounter?.canFlee === false, 'Prologue tutorial encounter allows escape');
check(
    prologueEncounter?.visual?.concealIdentity === true
        && prologueEncounter?.visual?.level === '??'
        && prologueEncounter?.visual?.attacks?.length === 3,
    'Prologue tutorial visual or attack contract changed'
);
check(
    prologueEncounter?.loadout?.main?.id === 'prologue_hunter_blade'
        && prologueEncounter?.loadout?.offhand?.enabled === false,
    'Prologue tutorial loadout contract changed'
);
check(
    prologueEncounter?.monster?.exp === 0
        && prologueEncounter?.monster?.gold === 0
        && prologueEncounter?.monster?.drops?.length === 0
        && prologueEncounter?.monster?.equipmentDrops?.length === 0,
    'Prologue tutorial encounter grants normal battle rewards'
);

const adventureSource = fs.readFileSync(new URL('../src/js/scenes/AdventureScene.js', import.meta.url), 'utf8');
const adventureView = fs.readFileSync(new URL('../src/views/adventure.html', import.meta.url), 'utf8');
const lobbyView = fs.readFileSync(new URL('../src/views/lobby.html', import.meta.url), 'utf8');
const adventureStyles = fs.readFileSync(new URL('../src/style/adventure.css', import.meta.url), 'utf8');
const handbookStyles = fs.readFileSync(new URL('../src/style/quest-handbook.css', import.meta.url), 'utf8');
const foundationStyles = fs.readFileSync(new URL('../src/css/ui-foundation.css', import.meta.url), 'utf8');
const guidanceSource = fs.readFileSync(new URL('../src/js/managers/StoryGuidanceManager.js', import.meta.url), 'utf8');
const progressionManagerSource = fs.readFileSync(new URL('../src/js/managers/ChapterOneProgressionManager.js', import.meta.url), 'utf8');
const lobbySource = fs.readFileSync(new URL('../src/js/scenes/LobbyScene.js', import.meta.url), 'utf8');
const gameManagerSource = fs.readFileSync(new URL('../src/js/managers/GameManager.js', import.meta.url), 'utf8');
const devPanelSource = fs.readFileSync(new URL('../src/js/utils/DevPanel.js', import.meta.url), 'utf8');
check(!adventureSource.includes('ArrowUp') && !adventureSource.includes('ArrowDown'), 'Arrow-key map movement returned');
check(adventureView.includes('id="adventure-onboarding"'), 'Adventure onboarding surface is missing');
check(
    JSON.stringify(AdventureOnboardingFlag) === JSON.stringify({
        quest: 'tutorial.adventure.questOpened',
        inventory: 'tutorial.adventure.inventoryOpened',
        movement: 'tutorial.adventure.wasdMoved'
    }),
    'Adventure onboarding flags are no longer owned by ChapterOneProgression'
);
check(
    progressionManagerSource.indexOf('AdventureOnboardingStep.QUEST')
        < progressionManagerSource.indexOf('AdventureOnboardingStep.INVENTORY')
        && progressionManagerSource.indexOf('AdventureOnboardingStep.INVENTORY')
            < progressionManagerSource.indexOf('AdventureOnboardingStep.MOVEMENT'),
    'Initial field onboarding must open quests, then inventory, before movement'
);
check(
    adventureSource.includes('isInitialSystemOnboardingLocked()')
        && adventureSource.includes('if (this.isInitialSystemOnboardingLocked()) return;'),
    'Map movement and interaction are not locked during the system onboarding'
);
check(
    adventureSource.includes('chapterOneProgressionManager.getAdventureOnboardingStep')
        && adventureSource.includes('chapterOneProgressionManager.completeAdventureOnboardingStep')
        && progressionManagerSource.includes('getAdventureOnboardingStep')
        && progressionManagerSource.includes('completeAdventureOnboardingStep'),
    'AdventureScene still owns onboarding flag logic instead of delegating to ChapterOneProgressionManager'
);
check(
    adventureStyles.includes('@keyframes adventure-tutorial-breathe')
        && adventureStyles.includes('animation: adventure-tutorial-breathe'),
    'Quest and inventory tutorial targets have no breathing emphasis'
);
check(
    /\.adventure-quest-tracker\s*\{[^}]*top:\s*92px;/.test(adventureStyles)
        && !/\.adventure-quest-tracker\s*\{[^}]*bottom:/.test(adventureStyles),
    'Quest tracker still shares the lower-left interaction-hint position'
);
check(
    /\.adventure-onboarding\s*\{[^}]*bottom:\s*22px;/.test(adventureStyles),
    'Onboarding prompt is not anchored at the lower center'
);
check(
    guidanceSource.includes('chapterOneProgressionManager.getObjectiveContext()')
        && progressionManagerSource.includes('readChapterOneObjectiveContext')
        && progressionManagerSource.includes('chapterOneGearEquipped'),
    'Shared story guidance does not derive Chapter 1 runtime progress for the handbook'
);
check(
    progressionManagerSource.includes('settleGuaranteedRewards')
        && progressionManagerSource.includes('completeEvidence')
        && progressionManagerSource.includes('completeFirstReport')
        && progressionManagerSource.includes('completeHomeRecovery')
        && progressionManagerSource.includes('claimOptionalRewards'),
    'Chapter 1 progression does not have one runtime owner'
);
check(
    !adventureSource.includes('GameManager.setFlag(ChapterOneProgressFlag')
        && !lobbySource.includes('GameManager.setFlag(ChapterOneProgressFlag')
        && !gameManagerSource.includes('recordChapterOneGearPreparation')
        && !gameManagerSource.includes('ChapterOneProgressFlag'),
    'Scene or global game code still owns Chapter 1 progression rules'
);
for (const obsoleteFlag of [
    'story.ch1.gear_ready',
    'story.ch1.gear_ready_source',
    'story.ch1.core_craft_materials_secured',
    'story.ch1.rotroot_trials_complete'
]) {
    check(
        !adventureSource.includes(obsoleteFlag)
            && !lobbySource.includes(obsoleteFlag)
            && !gameManagerSource.includes(obsoleteFlag)
            && !progressionManagerSource.includes(obsoleteFlag),
        `Obsolete Chapter 1 flag returned: ${obsoleteFlag}`
    );
}
check(
    handbookStyles.includes('width: min(100%, 1120px)')
        && handbookStyles.includes('grid-template-columns: minmax(0, 1fr) auto'),
    'FHD handbook detail content has no bounded reading width or stable note layout'
);
check(
    !/(^|\n)\.detail-header\s*\{/.test(foundationStyles)
        && handbookStyles.includes('.quest-board-container .detail-header')
        && handbookStyles.includes('.quest-board-container .quest-title-group')
        && handbookStyles.includes('.quest-board-container .quest-type-badge')
        && !handbookStyles.includes('.scene-quest .detail-header')
        && !handbookStyles.includes('.scene-quest .quest-title-group')
        && !handbookStyles.includes('.scene-quest .quest-type-badge'),
    'Quest detail header ownership escaped quest-handbook.css or still targets the removed scene wrapper'
);
const farmlandClue = getStoryDiscovery('ch1_farmland_tracks');
const boardwalkClue = getStoryDiscovery('ch1_boardwalk_silver');
const campfireClue = getStoryDiscovery('ch1_campfire_root');
check(
    farmlandClue?.observation.includes('人類靴印繼續')
        && farmlandClue.observation.includes('獸爪卻'),
    'Farmland handbook clue drifted from the current investigation evidence'
);
check(
    boardwalkClue?.observation.includes('標記回程')
        && boardwalkClue.observation.includes('重新繃在'),
    'Boardwalk handbook clue drifted from the current investigation evidence'
);
check(
    campfireClue?.observation.includes('灰層下的黑根卻仍微溫')
        && campfireClue.observation.includes('向北收縮'),
    'Campfire handbook clue drifted from the current investigation evidence'
);
check(!adventureSource.includes('行路者短劍'), 'Removed starter-weapon tutorial returned');
check(!adventureSource.includes('weaponEquipped'), 'Removed starter-equipment onboarding flag returned');
check(!adventureSource.includes('fieldVictories'), 'Obsolete field-victory gate returned');
check(!adventureSource.includes('getChapterOneSurveyBlock'), 'Obsolete landmark survey gate returned');
check(adventureSource.includes('按 F 返回城鎮'), 'South Gate interaction does not expose the return action');
check(lobbySource.includes('生命已恢復'), 'Returning to town does not confirm recovery after it happens');
check(adventureSource.includes('把第一份證據帶回南門'), 'The first recovery lesson is not enforced as a gameplay step');
check(
    !adventureView.includes('adv-player-fatigue')
        && !lobbyView.includes('fatigue-text')
        && !lobbyView.includes('fatigue-bar')
        && !adventureSource.includes('consumeAdventureFatigue')
        && !lobbySource.includes('startFatigueRecoveryLoop')
        && !gameManagerSource.includes('getAdventureFatigueStatus')
        && !devPanelSource.includes('fatigue-full'),
    'Removed fatigue system still owns runtime logic or HUD controls'
);
check(
    ChapterOneProgressFlag.FIRST_REPORT_PENDING === 'story.ch1.first_report_pending',
    'First-evidence return report has no stable pending flag'
);
check(
    lobbySource.includes("'south_gate_farmland_report'")
        && lobbySource.includes('playChapterOneFirstReturnReport'),
    'Returning with the first evidence does not open its town report scene'
);
check(
    gameManagerSource.includes('MIA_EMERGENCY_POTION_LIMIT - current')
        && progressionManagerSource.includes('GameManager.getEmergencyPotionCount() < MIA_EMERGENCY_POTION_LIMIT'),
    'Mia still waits for zero potions instead of refilling every shortage to three'
);
const firstReport = getStoryScene('ch1_s06_three_landmarks')?.checkpoints?.south_gate_farmland_report;
const firstReportActors = new Set((firstReport?.beats || []).map(beat => beat.actorId).filter(Boolean));
const miaRecovery = getStoryScene('ch1_s06_three_landmarks')?.checkpoints?.south_gate_farmland_recovery;
const miaRecoveryActors = new Set((miaRecovery?.beats || []).map(beat => beat.actorId).filter(Boolean));
check(
    firstReportActors.has('standard_bearer_frey')
        && !firstReportActors.has('herbalist')
        && miaRecoveryActors.has('herbalist'),
    'First-evidence report and Mia injury inspection are not separate playable steps'
);
const firstReportHint = getStoryObjectiveHint('ch1_s06_three_landmarks', {
    chapterOneInvestigations: { south_gate_farmland: { evidence: true } },
    chapterOneFirstReportPending: false,
    chapterOneFirstReportComplete: false,
    chapterOneHomeRecoveryKnown: false
});
check(
    firstReportHint?.targetId === 'south_gate_entry'
        && firstReportHint?.placeId === null
        && firstReportHint?.actorId === null,
    'First farmland evidence does not guide the player back through South Gate before Mia'
);
const pendingReportHint = getStoryObjectiveHint('ch1_s06_three_landmarks', {
    chapterOneInvestigations: { south_gate_farmland: { evidence: true } },
    chapterOneFirstReportPending: true,
    chapterOneFirstReportComplete: false,
    chapterOneHomeRecoveryKnown: false
});
check(
    pendingReportHint?.placeId === 'gate'
        && pendingReportHint?.actorId === 'standard_bearer_frey'
        && guidanceSource.includes("npcId === 'standard_bearer_frey'")
        && guidanceSource.includes("type: 'chapter-one-first-report'"),
    'Returned farmland evidence is not linked to Frey and the South Gate report checkpoint'
);
const miaRecoveryHint = getStoryObjectiveHint('ch1_s06_three_landmarks', {
    chapterOneInvestigations: { south_gate_farmland: { evidence: true } },
    chapterOneFirstReportComplete: true,
    chapterOneHomeRecoveryKnown: false
});
check(
    miaRecoveryHint?.placeId === 'mia_workroom'
        && miaRecoveryHint?.actorId === 'herbalist'
        && lobbySource.includes('playChapterOneMiaRecovery')
        && guidanceSource.includes("type: 'chapter-one-home-recovery'")
        && guidanceSource.indexOf("type: 'chapter-one-home-recovery'")
            < guidanceSource.indexOf('needsMiaEmergencyPotionSupport()'),
    'Mia injury inspection is still gated behind emergency-potion quantity'
);
for (const forbidden of ['必要戰力驗收', '實戰比較完成', '平均命中', '主線通行費']) {
    check(!adventureSource.includes(forbidden), `Player-facing Chapter 1 text leaked system prose: ${forbidden}`);
}

const originalMapState = GameManager.state.mapState;
GameManager.state.mapState = null;
const map = new WorldMap(GameManager.getCharacter(), 1000, 600);
check(
    map.getNearbyInteraction()?.id === 'south_gate_entry',
    'The player must spawn on the visible South Gate Entrance location'
);
const sample = map.sampleCurrentMonster(() => 0);
check(sample?.monsterId === 'slime', 'Chapter 1 start habitat no longer begins with its fixed pool');
check(!Object.hasOwn(sample || {}, 'targetLevel'), 'World map still rerolls a monster target level');
const encounter = createLocationEncounter({ ...sample, targetLevel: 9 }, map.getCurrentTile());
check(encounter?.monster?.level === MonsterDatabase.slime.level, 'Encounter rescaled a fixed-level monster');
check(encounter?.monster?.maxHp === MonsterDatabase.slime.maxHp, 'Encounter rescaled monster combat stats');
const gatedLandmarkIds = new Set(['rotroot_salvage', 'rootwatch_grove']);
check(
    !map.getActiveLandmarks().some(entry => gatedLandmarkIds.has(entry.id)),
    'Chapter 1 prepared-gear landmarks opened before qualifying gear was owned'
);
const originalInventory = GameManager.state.inventory;
const baselineCraft = Object.values(SeriesRecipeDatabase).find(recipe => recipe.seriesId === 'slime_series');
GameManager.state.inventory = [{ item: baselineCraft.result, quantity: 1, instanceId: 'chapter-one-check-gear' }];
check(
    [...gatedLandmarkIds].every(id => map.getActiveLandmarks().some(entry => entry.id === id)),
    'Owning qualifying Chapter 1 gear does not open its prepared routes'
);
GameManager.state.inventory = originalInventory;
GameManager.state.mapState = originalMapState;

for (const habitat of OverworldHabitats) {
    for (const monsterId of habitat.monsterIds) {
        const monster = MonsterDatabase[monsterId];
        check(Boolean(monster), `${habitat.id} references missing ${monsterId}`);
        check(
            monster && monster.level >= habitat.levelRange[0] && monster.level <= habitat.levelRange[1],
            `${monsterId} is outside ${habitat.id}'s declared fixed range`
        );
    }
}

check(ChapterOneInvestigationOrder.length === 3, 'Chapter 1 must have exactly three investigation combats');
check(new Set(ChapterOneInvestigationOrder).size === 3, 'Chapter 1 investigation ids must be unique');
const expectedInvestigationLevels = [1, 3, 4];
const securedMaterials = new Map();
for (const [index, investigationId] of ChapterOneInvestigationOrder.entries()) {
    const entry = ChapterOneInvestigations[investigationId];
    check(Boolean(entry), `Missing investigation ${investigationId}`);
    check(entry?.previousId === (ChapterOneInvestigationOrder[index - 1] || null), `${investigationId} has a broken causal predecessor`);
    check(FirstRunMonsterFixedLevels[entry?.monsterId] === expectedInvestigationLevels[index], `${investigationId} has the wrong fixed monster level`);
    for (const reward of entry?.guaranteedRewards || []) {
        securedMaterials.set(reward.itemId, (securedMaterials.get(reward.itemId) || 0) + reward.quantity);
    }
}

const chapterOneRecipes = Object.values(SeriesRecipeDatabase).filter(recipe => recipe.seriesId === 'slime_series');
check(chapterOneRecipes.length === 5, 'Qingning baseline craft must cover five weapon forms');
check(new Set(chapterOneRecipes.map(recipe => recipe.weaponForm)).size === 5, 'Qingning baseline craft repeats or misses a weapon form');
for (const recipe of chapterOneRecipes) {
    for (const material of recipe.materials) {
        check(
            (securedMaterials.get(material.id) || 0) >= material.quantity,
            `Mandatory investigations do not guarantee ${material.quantity} ${material.id} for ${recipe.id}`
        );
    }
}
check(
    chapterOneRecipes.every(recipe => recipe.cost === chapterOneRecipes[0].cost),
    'Qingning forms must share one acquisition cost'
);
check(
    RecipeSeriesDatabase.slime_series.discovery?.source === '第一章鐵匠回報',
    'Qingning recipes must tell the player which Chapter 1 hand-in unlocks them'
);
check(
    new Set(FirstRunBandAllocationPlan[1].baselineCraft).size === 5
        && FirstRunBandAllocationPlan[1].baselineCraft.every(id => SeriesRecipeDatabase[id]),
    'Chapter 1 allocation does not point to all five Qingning recipes'
);
check(
    ChapterOneSpecialGearIds.every(id => FirstRunBandAllocationPlan[1].directEquipment.includes(id)),
    'Chapter 1 special-drop alternatives drifted from the formal allocation'
);

const chapterOneRegion = ChapterRegionRegistry.chapter_01_south_gate;
const chapterOneEntry = chapterOneRegion.locationNodes.find(entry => entry.id === 'south_gate_entry');
check(
    chapterOneEntry?.position?.x === OverworldMapConfig.startPosition.x
        && chapterOneEntry?.position?.y === OverworldMapConfig.startPosition.y,
    'The Chapter 1 region entry must match the overworld spawn position'
);
const chapterOneLocationIds = new Set(chapterOneRegion.locationNodes.map(entry => entry.id));
const overworldLandmarkIds = new Set(OverworldLandmarks.map(entry => entry.id));
for (const id of [...ChapterOneInvestigationOrder, 'silver_snare_pass', 'rotroot_ravine', 'rotroot_salvage', 'rootwatch_grove', 'old_wolf_den']) {
    check(chapterOneLocationIds.has(id), `Chapter region is missing ${id}`);
    check(overworldLandmarkIds.has(id), `Overworld landmark registry is missing ${id}`);
    const node = chapterOneRegion.locationNodes.find(entry => entry.id === id);
    const landmark = OverworldLandmarks.find(entry => entry.id === id);
    check(
        landmark?.name === node?.name
            && landmark?.x === node?.position?.x
            && landmark?.y === node?.position?.y
            && landmark?.bossId === node?.bossId,
        `${id} runtime data drifted from ChapterRegionRegistry`
    );
}
check(
    chapterOneRegion.routeSegments.find(entry => entry.id === 'silver_thread_branch')?.optional === false,
    'Ambush Mantis route must be mandatory'
);
check(
    StoryRouteEncounterContracts.ch1_s07_silver_snare?.monsterId === 'ambush_mantis',
    'Ambush Mantis story encounter contract is missing'
);
const rotrootLandmark = OverworldLandmarks.find(entry => entry.id === 'rotroot_ravine');
const mantisEffects = getStorySceneEffects('ch1_s07_silver_snare', 1)?.flags || {};
const forgeReturnEffects = getStorySceneEffects('ch1_s08_cold_forge_smoke', 1)?.flags || {};
check(
    rotrootLandmark?.storyFlag === 'story.ch1.rotroot_active'
        && !mantisEffects['story.ch1.rotroot_active']
        && forgeReturnEffects['story.ch1.rotroot_active'] === true,
    'Rotroot becomes available before the player returns and completes the forge hand-in'
);
check(
    adventureSource.includes('pendingEncounter?.monsterId === entry.bossId')
        && !adventureSource.includes('pendingEncounter?.bossId === entry.bossId'),
    'A pending route encounter cannot reconnect to its landmark after the story handoff'
);
const silverSnareHint = getStoryObjectiveHint('ch1_s07_silver_snare');
check(
    silverSnareHint?.targetId === 'silver_snare_pass'
        && silverSnareHint?.text.includes('東北'),
    'Silver Snare has no executable map target or direction'
);
check(
    ChapterOneMantisRecovery.guaranteedRewards.some(entry => entry.itemId === 'spider_silk'),
    'Ambush Mantis no longer returns the silver-thread material'
);

check(ChapterOneRotrootTrials.length === 2, 'Rotroot must contain two mandatory comparison combats');
check(
    ChapterOneRotrootTrials.every((entry, index) => FirstRunMonsterFixedLevels[entry.monsterId] === [7, 8][index]),
    'Rotroot comparison monsters must remain fixed at Lv7 and Lv8'
);
check(
    FirstRunMonsterFixedLevels[ChapterOneOptionalRoutes.rootwatch_grove.monsterId] === 9,
    'Optional Chapter 1 elite must remain Lv9'
);
check(
    StoryEncounterContracts.ch1_s10_forest_guardian?.monsterId === 'forest_guardian'
        && FirstRunMonsterFixedLevels.forest_guardian === 10,
    'Forest Guardian convergence must remain the fixed Lv10 mainline Boss'
);

const openingHint = getStoryObjectiveHint('ch1_s06_three_landmarks', {
    chapterOneInvestigations: Object.fromEntries(
        ChapterOneInvestigationOrder.map(id => [id, { victory: false, evidence: false }])
    )
});
const boardwalkHint = getStoryObjectiveHint('ch1_s06_three_landmarks', {
    chapterOneInvestigations: {
        south_gate_farmland: { victory: true, evidence: true },
        hunter_boardwalk: { victory: false, evidence: false },
        old_campfire_site: { victory: false, evidence: false }
    },
    chapterOneFirstReportComplete: true,
    chapterOneHomeRecoveryKnown: false
});
const boardwalkAfterRecoveryHint = getStoryObjectiveHint('ch1_s06_three_landmarks', {
    chapterOneInvestigations: {
        south_gate_farmland: { victory: true, evidence: true },
        hunter_boardwalk: { victory: false, evidence: false },
        old_campfire_site: { victory: false, evidence: false }
    },
    chapterOneFirstReportComplete: true,
    chapterOneHomeRecoveryKnown: true
});
const gearHint = getStoryObjectiveHint('ch1_s09_rotroot_approach', {
    chapterOneGearReady: false,
    chapterOneGearEquipped: false
});
check(openingHint?.text.includes('東側') && openingHint.text.includes('未知地標'), 'Chapter 1 objective does not give executable first-landmark navigation');
check(
    boardwalkHint?.placeId === 'mia_workroom'
        && boardwalkHint?.actorId === 'herbalist'
        && boardwalkHint?.text.includes('不取決於目前生命值或藥水數量'),
    'The first field report does not lead into Mia\'s narrative injury inspection'
);
check(boardwalkAfterRecoveryHint?.text.includes('東北方') && boardwalkAfterRecoveryHint.text.includes('未知地標'), 'Boardwalk opens before the return-and-recovery lesson is complete');
check(
    gearHint?.text.includes('鐵匠鋪') && gearHint.text.includes('武器'),
    'Rotroot objective does not point the player back to the forge and a usable weapon'
);

if (failures.length) {
    console.error(`Chapter 1 gameplay check found ${failures.length} failure(s):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log('Chapter 1 gameplay check passed.');
