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
const { default: chapterOneProgressionManager } = await import('../src/js/managers/ChapterOneProgressionManager.js');
const { storySceneManager } = await import('../src/js/managers/StorySceneManager.js');
const { storyGuidanceManager } = await import('../src/js/managers/StoryGuidanceManager.js');
const { default: WorldMap } = await import('../src/js/utils/WorldMap.js');
const {
    createLocationEncounter,
    createPrologueTutorialEncounter
} = await import('../src/js/managers/AdventureEncounterManager.js');
const { MonsterDatabase } = await import('../src/js/data/Monsters.js');
const { FirstRunMonsterFixedLevels } = await import('../src/js/data/MonsterEcology.js');
const { OverworldHabitats, OverworldLandmarks, OverworldMapConfig } = await import('../src/js/data/OverworldMapRegistry.js');
const {
    ChapterRegionRegistry,
    getSceneRegionBinding
} = await import('../src/js/data/ChapterRegionRegistry.js');
const { RecipeSeriesDatabase, SeriesRecipeDatabase } = await import('../src/js/data/RecipeSeries.js');
const { RecipeDatabase } = await import('../src/js/data/Recipes.js');
const { FirstRunBandAllocationPlan } = await import('../src/js/data/FirstRunLootBalance.js');
const {
    ChapterOneClosingReportStages,
    ChapterOneProgressFlag,
    ChapterOneInvestigationOrder,
    ChapterOneInvestigations,
    ChapterOneMantisRecovery,
    ChapterOneRotrootTrials,
    ChapterOneSpecialGearIds
} = await import('../src/js/data/ChapterOneProgression.js');
const { GuildTutorialFlag, GuildTutorialSupply } = await import('../src/js/data/GuildTutorial.js');
const { getStoryScene } = await import('../src/js/data/StorySceneRegistry.js');
const { StoryRouteEncounterContracts, StoryEncounterContracts } = await import('../src/js/data/StoryEncounterContracts.js');
const { getStoryObjectiveHint } = await import('../src/js/data/StoryObjectiveHints.js');
const { getStoryDiscovery } = await import('../src/js/data/StoryDiscoveries.js');
const {
    PROLOGUE_TUTORIAL_RESOLVED_FLAG,
    getStorySceneEffects
} = await import('../src/js/data/StoryStateContract.js');
const {
    GuildTutorialCommissionId,
    QuestCompletionMode,
    QuestDatabase,
    ObjectiveType
} = await import('../src/js/data/Quests.js');
const { QuestStoryDatabase } = await import('../src/js/data/QuestStories.js');
const { TownDialogueDatabase, TownNPCDatabase } = await import('../src/js/data/NPCDialogues.js');
const { dialogueManager } = await import('../src/js/managers/DialogueManager.js');
const { WorldInteractionDatabase } = await import('../src/js/data/WorldInteractions.js');
const { DungeonDatabase } = await import('../src/js/data/Dungeons.js');

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
    prologueEncounter?.monster?.id === 'blood_moon_stag'
        && prologueEncounter?.visual?.concealIdentity === true
        && prologueEncounter?.visual?.level === '??'
        && prologueEncounter?.visual?.attacks?.length === 3,
    'Prologue tutorial visual or attack contract changed'
);
check(
    prologueEncounter?.visual?.attacks?.some(attack => attack.id === 'prologue_stag_charge')
        && prologueEncounter?.canFlee === false,
    'First-run Stag encounter is not locked as a scripted defeat'
);
check(
    Boolean(prologueEncounter?.loadout?.main)
        && Boolean(prologueEncounter?.loadout?.offhand)
        && prologueEncounter?.visual?.healthFloorRatio === 0.4,
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
const guildView = fs.readFileSync(new URL('../src/views/guild.html', import.meta.url), 'utf8');
const guildSource = fs.readFileSync(new URL('../src/js/scenes/GuildTutorialScene.js', import.meta.url), 'utf8');
const guildDataSource = fs.readFileSync(new URL('../src/js/data/GuildTutorial.js', import.meta.url), 'utf8');
const questDataSource = fs.readFileSync(new URL('../src/js/data/Quests.js', import.meta.url), 'utf8');
const guildStyles = fs.readFileSync(new URL('../src/style/guild-tutorial.css', import.meta.url), 'utf8');
const handbookStyles = fs.readFileSync(new URL('../src/style/quest-handbook.css', import.meta.url), 'utf8');
const foundationStyles = fs.readFileSync(new URL('../src/css/ui-foundation.css', import.meta.url), 'utf8');
const guidanceSource = fs.readFileSync(new URL('../src/js/managers/StoryGuidanceManager.js', import.meta.url), 'utf8');
const progressionManagerSource = fs.readFileSync(new URL('../src/js/managers/ChapterOneProgressionManager.js', import.meta.url), 'utf8');
const lobbySource = fs.readFileSync(new URL('../src/js/scenes/LobbyScene.js', import.meta.url), 'utf8');
const townPlacesSource = fs.readFileSync(new URL('../src/js/data/TownPlaces.js', import.meta.url), 'utf8');
const townStateResolverSource = fs.readFileSync(new URL('../src/js/managers/TownStateResolver.js', import.meta.url), 'utf8');
const worldMapSource = fs.readFileSync(new URL('../src/js/utils/WorldMap.js', import.meta.url), 'utf8');
const gameManagerSource = fs.readFileSync(new URL('../src/js/managers/GameManager.js', import.meta.url), 'utf8');
const devPanelSource = fs.readFileSync(new URL('../src/js/utils/DevPanel.js', import.meta.url), 'utf8');
const goblinDropIds = new Set((MonsterDatabase.goblin?.drops || []).map(drop => drop.itemId));
const mantisDropIds = new Set((MonsterDatabase.ambush_mantis?.drops || []).map(drop => drop.itemId));
const poisonDaggerMaterialIds = new Set((RecipeDatabase.poison_dagger?.materials || []).map(material => material.id));
const leatherArmorMaterialIds = new Set((RecipeDatabase.leather_armor?.materials || []).map(material => material.id));
check(goblinDropIds.has('iron_ore'), 'Chapter 1 goblins no longer provide their low-rate iron ore source');
check(
    mantisDropIds.has('iron_ore') && !mantisDropIds.has('rare_metal'),
    'Ambush Mantis must provide iron ore instead of premature rare metal'
);
check(
    leatherArmorMaterialIds.has('beast_hide')
        && leatherArmorMaterialIds.has('iron_ore')
        && !leatherArmorMaterialIds.has('iron_shard'),
    'Chapter 1 leather armor again depends on iron shards without an early source'
);
check(
    poisonDaggerMaterialIds.has('wolf_fang') && !poisonDaggerMaterialIds.has('spider_queen_fang'),
    'Poison Dagger recipe again depends on the unavailable tower fang'
);
check(
    adventureSource.includes("entry.sceneIds?.some(sceneId => !storySceneManager.isSceneComplete(sceneId))"),
    'Completed authored Boss landmarks no longer expose repeat challenges'
);
check(!adventureSource.includes('ArrowUp') && !adventureSource.includes('ArrowDown'), 'Arrow-key map movement returned');
check(!adventureView.includes('id="adventure-onboarding"'), 'Obsolete field onboarding surface returned');
check(
    guildView.includes('id="guild-room"')
        && guildView.includes('id="guild-interface-host"')
        && guildSource.includes("source.querySelector('.town-right-rail')")
        && guildSource.includes("source.querySelector('#lobby-prep-modal')"),
    'Guild onboarding surface is incomplete'
);
check(
    GuildTutorialFlag.COMPLETE === 'story.prologue.guildTutorialComplete'
        && GuildTutorialFlag.EVENT_MARK_SEEN === 'story.prologue.guildEventMarkSeen'
        && GuildTutorialFlag.OVERWORLD_MOVEMENT_LEARNED === 'story.prologue.overworldMovementLearned'
        && guildSource.includes('GuildTutorialFlag.COMMISSION_BOARD_READ')
        && guildSource.includes('isCommissionAccepted()')
        && guildSource.includes('GuildTutorialFlag.ARMOR_CONFLICT_SEEN')
        && guildSource.includes('GuildTutorialFlag.BATTLE_OFFHAND_READY')
        && GuildTutorialSupply.weaponRecipeIds.length === 5
        && GuildTutorialSupply.weaponRecipeIds.every(recipeId => RecipeDatabase[recipeId]?.result?.level === 5)
        && GuildTutorialSupply.armorRecipeId === 'leather_armor'
        && RecipeDatabase[GuildTutorialSupply.armorRecipeId]?.result?.level === 1
        && guildSource.includes('getRequiredSupplyResult')
        && !guildSource.includes('].filter(Boolean)')
        && !guildSource.includes('this.claimAllSupplyItems({ render: false })')
        && !guildView.includes('guild-supply-open-inventory')
        && !guildSource.includes('guild-supply-issued')
        && guildSource.includes("? '已領取' : '領取'")
        && guildSource.includes('tutorialLocked: true')
        && !guildSource.includes('GuildTutorialItems')
        && guildSource.includes("point.classList.toggle('is-ready'")
        && !guildSource.includes('requestAnimationFrame')
        && !guildSource.includes("['w', 'a', 's', 'd']"),
    'Guild onboarding flags or equipment lesson are incomplete'
);
check(
    guildSource.includes('scopeElement: this.room')
        && guildSource.includes('this.getDialogueOptions()'),
    'Guild dialogue is no longer scoped to the guild scene'
);
check(
    adventureSource.includes('isMovementTutorialPending()')
        && adventureSource.includes("'WASD'")
        && adventureSource.includes('GuildTutorialFlag.OVERWORLD_MOVEMENT_LEARNED')
        && adventureSource.includes("reason: 'prologue-overworld-first-move'"),
    'Guild departure does not hand off to the existing map hint for movement training'
);
check(
    worldMapSource.includes('arrivedInteractionIds: this.getInteractionsAtPlayer()')
        && adventureSource.includes("(result.arrivedInteractionIds || []).includes(binding.targetId)")
        && !adventureSource.includes("result.interaction?.id === binding.targetId"),
    'Location-enter scenes can still trigger from an adjacent interaction radius'
);
check(
    !guildDataSource.includes('GuildTutorialCommissionId')
        && (questDataSource.match(/GuildTutorialCommissionId\s*=/g) || []).length === 1,
    'Guild tutorial commission id has more than one data owner'
);
check(
    guildSource.includes('setPrepTutorialProvider(() => this.getEquipmentTutorialDirective())')
        && guildSource.includes("progress: '裝備教學 1 / 4'")
        && guildSource.includes("progress: '裝備教學 2 / 4'")
        && guildSource.includes("progress: '裝備教學 3 / 4'")
        && guildSource.includes("progress: '裝備教學 4 / 4'")
        && lobbySource.includes('renderPrepTutorial()')
        && lobbySource.includes("tutorial.targetSlot === 'weapon'")
        && lobbySource.includes("tutorial.targetSlot === 'armor'")
        && guildStyles.includes('.prep-tutorial-guide')
        && guildStyles.includes('.is-prep-tutorial-target'),
    'Guild equipment lesson is not connected to the shared backpack actions'
);
check(
    guildStyles.includes('@keyframes guild-breathe')
        && guildStyles.includes('animation: guild-breathe')
        && guildStyles.includes('.guild-map-stage .town-place-entry.is-ready .town-place-entry-mark')
        && guildSource.includes("getGeneratedGuildSceneImage('adventurers-guild-hall')"),
    'Guild tutorial target has no breathing emphasis'
);
check(
    lobbySource.includes("<span class=\"town-place-entry-mark\">${isReady ? '!' : ''}</span>")
        && !lobbySource.includes("hasFreshDialogue ? '新'"),
    'Town map still uses more than one event-marker language'
);
check(
    lobbySource.includes('dialogueManager.getAmbientDialogue(npcId)')
        && lobbySource.includes('.filter(dialogue => !dialogueManager.isFallbackDialogue(dialogue))')
        && lobbySource.includes("choiceTitle: '現在想談什麼？'")
        && lobbySource.includes('label: action.title')
        && lobbySource.includes('summary: action.summary')
        && guidanceSource.includes('const authored = getTownNpcActionCopy(type)')
        && guidanceSource.includes('throw new Error(`Town NPC action "${type}" is missing authored presentation copy`)')
        && !lobbySource.includes("'story-scene': '繼續目前事件'"),
    'Town NPC interactions do not play ambient conversation before presenting task choices'
);
const townNpcAmbientContracts = Object.keys(TownNPCDatabase).map(npcId => {
    const ambientDialogue = (TownDialogueDatabase[npcId] || [])
        .find(dialogue => dialogueManager.isFallbackDialogue(dialogue));
    const outcome = ambientDialogue
        ? dialogueManager.startDialogue(npcId, { dialogueId: ambientDialogue.id })
        : null;
    return { npcId, ambientDialogue, outcome };
});
check(
    townNpcAmbientContracts.every(({ ambientDialogue, outcome }) => (
        Boolean(ambientDialogue)
        && outcome?.success === true
        && outcome.dialogue?.id === ambientDialogue.id
        && outcome.participants?.length > 0
    )),
    `A town NPC is missing a resolvable ambient dialogue: ${townNpcAmbientContracts
        .filter(({ ambientDialogue, outcome }) => !ambientDialogue || !outcome?.success || !outcome?.participants?.length)
        .map(({ npcId }) => npcId)
        .join(', ')}`
);
const choiceContractProbe = dialogueManager.getDialogueTopic({
    id: 'choice_contract_probe',
    narrativeTitle: '測試委託',
    narrativeSummary: '確認玩家看得懂這個選項。',
    effects: [{ type: 'acceptQuest', questId: 'choice_contract_probe' }]
});
check(
    choiceContractProbe.title === '測試委託'
        && choiceContractProbe.label === '測試委託'
        && choiceContractProbe.kindLabel === '城鎮委託'
        && !choiceContractProbe.label.includes('請求'),
    'NPC choice cards still expose internal dialogue classifications'
);
check(
    !adventureSource.includes('this.tryStartPendingFieldStory()')
        && adventureSource.includes("sceneId === 'ch1_s01_road_collapse' && this.isPrologueInvestigationPending()")
        && adventureSource.includes("completionAction: 'prologue_combat'"),
    'Prologue combat must begin from the authored landmark investigation instead of scene entry'
);
const prologueRegion = ChapterRegionRegistry.chapter_01_south_gate;
const southGateEntry = prologueRegion.locationNodes.find(node => node.id === 'south_gate_entry');
const prologueSouthApproach = prologueRegion.locationNodes.find(node => node.id === 'prologue_south_approach');
const prologueImpactSite = prologueRegion.locationNodes.find(node => node.id === 'prologue_impact_site');
const prologueRoute = prologueRegion.routeSegments.find(segment => segment.id === 'prologue_mist_approach');
const prologueBinding = prologueRegion.sceneBindings.find(binding => binding.sceneId === 'ch1_s01_road_collapse');
check(
    southGateEntry?.sceneIds?.length === 0
        && prologueSouthApproach?.position?.x === 8
        && prologueSouthApproach?.position?.y === 29
        && prologueImpactSite?.name === '南路斷坡'
        && prologueImpactSite?.position?.x === 8
        && prologueImpactSite?.position?.y === 24
        && prologueRoute?.from === 'prologue_south_approach'
        && prologueRoute?.to === 'prologue_impact_site'
        && prologueBinding?.targetId === 'prologue_impact_site'
        && prologueBinding?.trigger === 'location_inspect',
    'Chapter 1 prologue is still sharing the South Gate return node'
);
check(
    /\.adventure-quest-tracker\s*\{[^}]*top:\s*92px;/.test(adventureStyles)
        && !/\.adventure-quest-tracker\s*\{[^}]*bottom:/.test(adventureStyles),
    'Quest tracker still shares the lower-left interaction-hint position'
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
        && progressionManagerSource.includes('completeHomeRecovery'),
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
check(
    adventureSource.includes("questManager.updateProgress(ObjectiveType.EVENT, 'prologue_investigation_report', 1)"),
    'Prologue rescue does not complete the guild investigation objective'
);
check(lobbySource.includes('傷勢已經處理好了'), 'Returning to town does not confirm recovery after it happens');
check(
    lobbySource.includes("sourceKey: 'town:arrival'")
        && lobbySource.includes('line?.message === safeMessage')
        && !lobbySource.includes('getReturnNarrative()')
        && townStateResolverSource.includes("arrivalText: crossroads?.description")
        && townPlacesSource.includes('把黑根出現的位置和失聯者最後經過的地方圈在圖上')
        && !townPlacesSource.includes('勝利口號'),
    'Town arrival and event-state narratives can duplicate or still use the rejected abstract copy'
);
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
    ChapterOneProgressFlag.FIRST_REPORT_AUTO_START === 'story.ch1.first_report_auto_start'
        && progressionManagerSource.includes('shouldAutoStartFirstReport()')
        && guidanceSource.includes('chapterOneProgressionManager.shouldAutoStartFirstReport()'),
    'Conscious return and defeat return still share the same first-report auto-start state'
);
check(
    adventureSource.includes("autoStart: reason === 'adventure-walk-return' || reason === 'adventure-wolf-smoke'")
        && !adventureSource.includes('queueFirstReportOnTownReturn();'),
    'Chapter 1 first report is still queued with unconditional auto-play on every town return'
);
check(
    guidanceSource.includes('getInformationMarker(target = {}, context = {})')
        && guidanceSource.includes('isAdventureTarget(targetId, context = {})')
        && adventureSource.includes('renderNewInformationMarker')
        && adventureSource.includes("ctx.fillText('!', 0, 1)")
        && lobbySource.includes("const alertText = hasNewInformation ? '!' : ''")
        && !lobbySource.includes("? `${readyCount} 動向`")
        && !lobbySource.includes("hasStoryObjective ? '主線'"),
    'Town and adventure targets do not share the single new-information marker contract'
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
const firstReportTrigger = storyGuidanceManager.resolveSceneTrigger('ch1_s06_three_landmarks', {
    chapterOneInvestigations: { south_gate_farmland: { evidence: true } },
    chapterOneFirstReportPending: false,
    chapterOneFirstReportComplete: false,
    chapterOneHomeRecoveryKnown: false
});
check(
    firstReportTrigger?.targetId === 'south_gate_entry'
        && firstReportTrigger?.placeId === null
        && firstReportTrigger?.actorId === null,
    'First farmland evidence does not guide the player back through South Gate before Mia'
);
const pendingReportHint = getStoryObjectiveHint('ch1_s06_three_landmarks', {
    chapterOneInvestigations: { south_gate_farmland: { evidence: true } },
    chapterOneFirstReportPending: true,
    chapterOneFirstReportComplete: false,
    chapterOneHomeRecoveryKnown: false
});
const pendingReportTrigger = storyGuidanceManager.resolveSceneTrigger('ch1_s06_three_landmarks', {
    chapterOneInvestigations: { south_gate_farmland: { evidence: true } },
    chapterOneFirstReportPending: true,
    chapterOneFirstReportComplete: false,
    chapterOneHomeRecoveryKnown: false
});
check(
    pendingReportTrigger?.placeId === 'gate'
        && pendingReportTrigger?.actorId === 'standard_bearer_frey'
        && guidanceSource.includes("npcId === 'standard_bearer_frey'")
        && guidanceSource.includes("createTownNpcAction('chapter-one-first-report'"),
    'Returned farmland evidence is not linked to Frey and the South Gate report checkpoint'
);
const miaRecoveryHint = getStoryObjectiveHint('ch1_s06_three_landmarks', {
    chapterOneInvestigations: { south_gate_farmland: { evidence: true } },
    chapterOneFirstReportComplete: true,
    chapterOneHomeRecoveryKnown: false
});
const miaRecoveryTrigger = storyGuidanceManager.resolveSceneTrigger('ch1_s06_three_landmarks', {
    chapterOneInvestigations: { south_gate_farmland: { evidence: true } },
    chapterOneFirstReportComplete: true,
    chapterOneHomeRecoveryKnown: false
});
check(
    miaRecoveryTrigger?.placeId === 'mia_workroom'
        && miaRecoveryTrigger?.actorId === 'herbalist'
        && lobbySource.includes('playChapterOneMiaRecovery')
        && guidanceSource.includes("createTownNpcAction('chapter-one-home-recovery'")
        && guidanceSource.indexOf("createTownNpcAction('chapter-one-home-recovery'")
            < guidanceSource.indexOf('needsMiaEmergencyPotionSupport()'),
    'Mia injury inspection is still gated behind emergency-potion quantity'
);
const closingScene = getStoryScene('ch1_s11_roads_breathe_again');
check(ChapterOneClosingReportStages.length === 5, 'Chapter 1 closing report must remain split into five town visits');
check(
    new Set(ChapterOneClosingReportStages.map(stage => stage.placeId)).size === 5,
    'Chapter 1 closing report stages collapsed back into the same town place'
);
for (const stage of ChapterOneClosingReportStages) {
    const hint = getStoryObjectiveHint('ch1_s11_roads_breathe_again', {
        chapterOneClosingReportStage: stage
    });
    const checkpoint = closingScene?.checkpoints?.[stage.checkpointId];
    const trigger = storyGuidanceManager.resolveSceneTrigger('ch1_s11_roads_breathe_again', {
        chapterOneClosingReportStage: stage
    });
    check(
        trigger?.placeId === stage.placeId && trigger?.actorId === stage.actorId,
        `Chapter 1 closing stage ${stage.id} is not linked to its town actor and place`
    );
    check(
        Array.isArray(checkpoint?.beatRange)
            && checkpoint.beatRange.length === 2
            && Boolean(checkpoint.backgroundImage),
        `Chapter 1 closing stage ${stage.id} has no isolated beat range or scene background`
    );
}
check(
    guidanceSource.includes("createTownNpcAction('chapter-one-closing-report'")
        && lobbySource.includes('completeClosingReportStage(stage.id)')
        && lobbySource.includes('storySceneManager.completeScene(sceneId)'),
    'Chapter 1 closing checkpoints are not connected to staged town interaction and final completion'
);
const originalClosingFlags = GameManager.state.flags;
GameManager.state.flags = {
    'story.run': 1,
    'story.chapter': 1,
    [GuildTutorialFlag.COMPLETE]: true,
    [PROLOGUE_TUTORIAL_RESOLVED_FLAG]: true
};
for (let index = 1; index <= 10; index += 1) {
    const sceneId = `ch1_s${String(index).padStart(2, '0')}_${[
        'road_collapse',
        'wake_under_bitter_bottles',
        'broken_crossroads',
        'elder_to_scholar',
        'south_gate_introduction',
        'three_landmarks',
        'silver_snare',
        'cold_forge_smoke',
        'rotroot_approach',
        'forest_guardian'
    ][index - 1]}`;
    GameManager.state.flags[`story.scene.${sceneId}.complete`] = true;
}
for (const [index, stage] of ChapterOneClosingReportStages.entries()) {
    const directive = storyGuidanceManager.getCurrent();
    check(
        directive?.sceneId === 'ch1_s11_roads_breathe_again'
            && directive?.placeId === stage.placeId
            && directive?.actorId === stage.actorId,
        `Chapter 1 closing runtime did not advance to ${stage.id}`
    );
    check(
        !storySceneManager.isSceneComplete('ch1_s11_roads_breathe_again'),
        `Chapter 1 completed before closing stage ${stage.id}`
    );
    const progress = chapterOneProgressionManager.completeClosingReportStage(stage.id);
    check(progress.success, `Chapter 1 closing stage ${stage.id} could not be completed in order`);
    check(progress.complete === (index === ChapterOneClosingReportStages.length - 1), `Chapter 1 closing stage ${stage.id} returned the wrong completion state`);
}
GameManager.state.flags = originalClosingFlags;
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
check(
    chapterOneRecipes.every(recipe => recipe.materials.some(material => material.id === 'iron_ore' && material.quantity === 2)),
    'Qingning baseline craft must consistently require two iron ore'
);

const chapterOneIronSources = ['stone_golem_mini']
    .filter(monsterId => (MonsterDatabase[monsterId]?.drops || []).some(drop => drop.itemId === 'iron_ore'));
check(
    chapterOneIronSources.length === 1,
    'Chapter 1 must provide a stable monster source for iron ore after its guaranteed investigation supply'
);
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
check(
    OverworldMapConfig.prologueStartPosition?.x === 8
        && OverworldMapConfig.prologueStartPosition?.y === 29
        && OverworldMapConfig.prologueRouteBounds?.length === 1
        && (OverworldMapConfig.prologueStartPosition.x !== OverworldMapConfig.startPosition.x
            || OverworldMapConfig.prologueStartPosition.y !== OverworldMapConfig.startPosition.y)
        && worldMapSource.includes("GameManager.saveOverworldMapProgress(state, 'guild-prologue-departure')")
        && !adventureSource.includes('migrateLegacyPrologueDeparture')
        && !worldMapSource.includes('migrateLegacyPrologueDeparture')
        && guildSource.includes('preparePrologueOverworldDeparture();'),
    'Guild departure still places the player at the town South Gate entry'
);
check(
    !guildSource.includes('syncLegacyTutorialFlags')
        && !guildSource.includes('syncCommissionFlag')
        && !guildSource.includes('RETIRED_GUILD_TUTORIAL_ITEM_IDS')
        && !guildSource.includes('getOwnedSupplyItems'),
    'Guild onboarding restored obsolete migration or ownership-based claim behavior'
);
check(
    adventureSource.includes("entry.id === 'prologue_impact_site'")
        && adventureSource.includes("this.showInteractionHint({ name: '濃霧封路' }")
        && adventureSource.includes('OverworldMapConfig.prologueRouteBounds || []')
        && adventureSource.includes("'is-prologue-route'")
        && adventureStyles.includes('.adventure-scene.is-prologue-route .adventure-quest-tracker'),
    'The prologue route neither exposes its required landmark nor blocks detours'
);
const chapterOneLocationIds = new Set(chapterOneRegion.locationNodes.map(entry => entry.id));
const overworldLandmarkIds = new Set(OverworldLandmarks.map(entry => entry.id));
for (const id of [...ChapterOneInvestigationOrder, 'silver_snare_pass', 'rotroot_ravine', 'split_vein_cave', 'old_wolf_den']) {
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
const silverSnareBinding = getSceneRegionBinding('ch1_s07_silver_snare');
check(
    silverSnareBinding?.targetId === 'silver_snare_pass'
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
    FirstRunMonsterFixedLevels.treant === 9
        && !chapterOneLocationIds.has('rootwatch_grove'),
    'Chapter 1 elite must remain Lv9 without returning as a fixed map location'
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
const boardwalkTrigger = storyGuidanceManager.resolveSceneTrigger('ch1_s06_three_landmarks', {
    chapterOneInvestigations: {
        south_gate_farmland: { victory: true, evidence: true },
        hunter_boardwalk: { victory: false, evidence: false },
        old_campfire_site: { victory: false, evidence: false }
    },
    chapterOneFirstReportComplete: true,
    chapterOneHomeRecoveryKnown: false
});
const gearHint = getStoryObjectiveHint('ch1_s09_rotroot_approach', {
    chapterOneGearReady: false,
    chapterOneGearEquipped: false
});
check(openingHint?.text.includes('東側') && openingHint.text.includes('未知地標'), 'Chapter 1 objective does not give executable first-landmark navigation');
check(
    boardwalkTrigger?.placeId === 'mia_workroom'
        && boardwalkTrigger?.actorId === 'herbalist'
        && boardwalkHint?.text.includes('不取決於目前生命值或藥水數量'),
    'The first field report does not lead into Mia\'s narrative injury inspection'
);
check(boardwalkAfterRecoveryHint?.text.includes('東北方') && boardwalkAfterRecoveryHint.text.includes('未知地標'), 'Boardwalk opens before the return-and-recovery lesson is complete');
check(
    gearHint?.text.includes('鐵匠鋪') && gearHint.text.includes('武器'),
    'Rotroot objective does not point the player back to the forge and a usable weapon'
);

const chapterOneCommissionIds = [
    'map_corners_never_lie',
    'one_blank_too_many',
    'patrol_soles',
    'lamp_glass_for_every_door',
    'pot_lid_is_not_a_shield',
    'vein_beneath_the_roots'
];
const chapterOneCommissions = new Map(QuestDatabase.commission.map(quest => [quest.id, quest]));
const guildTutorialCommission = chapterOneCommissions.get(GuildTutorialCommissionId);
check(
    guildTutorialCommission?.completionMode === QuestCompletionMode.AUTO_ARCHIVE
        && guildTutorialCommission?.objectives?.some(objective => objective.target === 'prologue_investigation_report')
        && !guildTutorialCommission?.description?.includes('帶回公會'),
    'The guild investigation still requires an inaccessible guild report after reaching town'
);
check(
    chapterOneCommissionIds.every(id => chapterOneCommissions.has(id) && QuestStoryDatabase[id]),
    'Chapter 1 side-story quest data or presentation data is incomplete'
);
check(
    TownDialogueDatabase.village_elder?.some(dialogue => dialogue.id === 'elder_offers_map_corners')
        && TownDialogueDatabase.town_scholar?.some(dialogue => dialogue.id === 'ilai_offers_blank_reports')
        && TownDialogueDatabase.standard_bearer_frey?.some(dialogue => dialogue.id === 'frey_offers_patrol_soles')
        && TownDialogueDatabase.lamplighter_tavi?.some(dialogue => dialogue.id === 'tavi_offers_lamp_clasps')
        && TownDialogueDatabase.blacksmith?.some(dialogue => dialogue.id === 'blacksmith_offers_pot_lid'),
    'A Chapter 1 character side story has no explicit NPC offer dialogue'
);
const caveQuest = chapterOneCommissions.get('vein_beneath_the_roots');
const caveLocation = ChapterRegionRegistry.chapter_01_south_gate.locationNodes
    .find(location => location.id === 'split_vein_cave');
const caveLandmark = OverworldLandmarks.find(landmark => landmark.id === 'split_vein_cave');
check(
    caveQuest?.objectives?.some(objective => objective.type === ObjectiveType.DUNGEON_CLEAR && objective.target === 'cave')
        && caveQuest?.trigger?.afterFlag === 'story.scene.ch1_s09_rotroot_approach.complete',
    'Chapter 1 dungeon side quest is not bound to the rotroot approach and cave clear event'
);
check(
    caveLocation?.dungeonId === 'cave'
        && caveLandmark?.dungeonId === 'cave'
        && caveLandmark?.storyFlag === 'quest.vein_beneath_the_roots.accepted'
        && Boolean(DungeonDatabase.cave),
    'Chapter 1 cave location, overworld landmark, or dungeon data is disconnected'
);
check(
    WorldInteractionDatabase.tavi_lamp_clasps?.progressObjectives?.some(entry => entry.target === 'tavi_lamp_clasps')
        && WorldInteractionDatabase.blacksmith_pot_lid?.progressObjectives?.some(entry => entry.target === 'blacksmith_pot_lid'),
    'Chapter 1 town-object side quests have no executable interaction progress hook'
);
check(
    adventureSource.includes('questManager.updateProgress(ObjectiveType.EXPLORE, entry.id, 1)')
        && adventureSource.includes('openDungeonEntrance(entry)')
        && adventureSource.includes('this.app?.enterDungeon?.(entry.dungeonId)'),
    'AdventureScene does not execute side-story exploration or dungeon entry'
);

if (failures.length) {
    console.error(`Chapter 1 gameplay check found ${failures.length} failure(s):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log('Chapter 1 gameplay check passed.');
