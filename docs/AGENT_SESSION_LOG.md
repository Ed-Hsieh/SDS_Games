# Agent Session Log

Last updated: 2026-07-24

## Current Direction

The sole delivery priority is a complete first run. The supported target is
desktop. The immediate focus is no longer catalog-image cleanup: it is
validating the new player path from the guild tutorial through the prologue
combat tutorial and the complete Chapter 1 return loop before the same structure
is extended into later chapters.

The intended opening order is now:

1. Guild tutorial: movement, interaction, commission choice, clue review, and
   main-hand/off-hand/armor equipment conflict.
2. Prologue combat tutorial: main-hand attack, off-hand rhythm window, main-hand
   break with off-hand promotion, replacement off-hand selection, potion use,
   flee attempt, and scripted defeat.
3. Mia rescue and Chapter 1: town entry, field investigation, staged reports,
   forge recovery, optional dungeon introduction, Forest Guardian, and the
   visible town-state result.

Second-run external Bosses, tower rewrite, casino rewards, final numeric balance,
post-reveal DLC, and mobile UI remain paused or deferred. Do not let those areas
expand the current first-run validation scope.

Optional second-run external Bosses remain base-game content, but their routes,
combat, rewards, and art stay paused until the first run passes validation. The
first-run ending must continue to set `story.secondRunUnlocked`. Before any
second-run implementation resumes, complete the achievement/evidence
`persistent-flag audit` so later content connects without rewriting first-run
core logic.

## Completed In Recent Passes

- [done] [P0] [opening-tutorial] Add the guild tutorial before the prologue
  Owner file(s): `src/views/guild.html`, `src/style/guild-tutorial.css`, `src/js/scenes/GuildTutorialScene.js`
  Source of truth: `src/js/data/GuildTutorial.js`, `src/js/managers/StoryGuidanceManager.js`
  Validation: manual desktop browser smoke test and `scripts/CombatTutorialCheck.mjs`
  Notes: The tutorial requires real WASD movement, NPC interaction, commission acceptance, clue viewing, and equipment-slot actions before departure; the duplicate field onboarding was removed.

- [done] [P0] [combat-tutorial] Expand the prologue combat teaching sequence
  Owner file(s): `src/js/managers/CombatFlowController.js`, `src/js/scenes/CombatVfxLab.js`, `src/js/components/CombatStageView.js`
  Source of truth: `src/js/data/StorySceneRegistry.js`
  Validation: `scripts/CombatTutorialCheck.mjs`
  Notes: The sequence now teaches both hands, the rhythm window, main-hand breakage, automatic off-hand promotion, replacement off-hand selection, an actual potion action, and a flee attempt before the fixed defeat.

- [done] [P0] [first-loot-guidance] Teach the first normal battle settlement
  Owner file(s): `src/js/managers/CombatFlowController.js`, `src/style/combat-vfx-lab.css`
  Source of truth: live encounter drops and inventory capacity
  Validation: `scripts/BattleSettlementCheck.mjs`
  Notes: New drops use `拿取` / `放棄`; owned backpack stacks use `放下` during settlement and remain reclaimable from the loot side until departure. The inline guide remains stable through the first settlement.

- [done] [P0] [first-report-guidance] Teach the first quest report
  Owner file(s): `src/js/scenes/LobbyScene.js`, `src/js/managers/DialogueManager.js`
  Source of truth: completed quest data and `QuestStories.js` report ownership
  Validation: first completed quest returned to its actual reporting NPC
  Notes: The town narrative names the real quest and reporter, points to the NPC `!`, and tells the player to choose `回報任務`; no second report interface is introduced.

- [done] [P1] [flee] Set the common flee chance and expose cooldown feedback
  Owner file(s): `src/js/managers/CombatFlowController.js`, `src/js/managers/RealtimeCombatSession.js`, `src/js/scenes/CombatVfxLab.js`, `src/style/combat-vfx-lab.css`
  Source of truth: live combat runtime
  Validation: `scripts/CombatTutorialCheck.mjs`, manual combat UI review
  Notes: Standard flee chance is 50%; the flee control now displays cooldown progress instead of silently becoming unavailable.

- [done] [P0] [dialogue-runtime] Preserve expressions while changing speaker emphasis
  Owner file(s): `src/js/components/StoryDialogueView.js`, `src/js/scenes/LobbyScene.js`
  Source of truth: `src/js/data/StorySceneRegistry.js`, `src/js/data/NPCDialogues.js`
  Validation: manual layered-dialogue smoke test
  Notes: Cast members begin bright before a speaker is selected; once dialogue begins, the speaker is emphasized and other actors dim without reverting to default expressions. Mainline and side-story NPC topics use explicit choices.

- [done] [P0] [mia-support] Make Mia's emergency potion support an actual claim
  Owner file(s): `src/js/scenes/LobbyScene.js`, `src/js/managers/ChapterOneProgressionManager.js`
  Source of truth: Chapter 1 runtime flags and inventory state
  Validation: `scripts/ChapterOneGameplayCheck.mjs`, manual inventory review
  Notes: When the player has fewer than three emergency potions, Mia offers a visible claim interaction that refills the count to three; a full inventory leaves the supply unclaimed instead of silently granting it.

- [done] [P0] [battle-settlement] Add inventory decisions to battle rewards
  Owner file(s): `src/js/managers/AdventureEncounterManager.js`, `src/js/managers/BlueprintManager.js`, `src/js/scenes/AdventureScene.js`, `src/style/inventory-grid.css`
  Source of truth: live encounter drops and player inventory
  Validation: `scripts/BattleSettlementCheck.mjs`, `scripts/ItemFlowCheck.mjs`, manual settlement review
  Notes: Physical rewards never bypass the decision surface or fall back to the warehouse. Matching stackable drops merge into one row; the five-column backpack can place a stack back on the loot side, and abandoned items remain reclaimable until the player leaves settlement.

- [done] [P0] [chapter-1-map] Remove obsolete fixed landmarks and join Rotroot investigation beats
  Owner file(s): `src/js/data/ChapterOneProgression.js`, `src/js/data/ChapterRegionRegistry.js`, `src/js/data/OverworldMapRegistry.js`, `src/js/scenes/AdventureScene.js`
  Source of truth: `src/js/managers/ChapterOneProgressionManager.js`, `docs/MAIN_STORY_BIBLE.md`
  Validation: `scripts/ChapterOneGameplayCheck.mjs`, `scripts/StructureConsistencyCheck.mjs`
  Notes: `rotroot_salvage` and the fixed `rootwatch_grove` landmark were removed; the Rotroot Ravine investigation now continues through staged story text, while the elite remains part of random regional ecology.

- [done] [P0] [chapter-1-report] Split the final Chapter 1 report across town locations
  Owner file(s): `src/js/data/StorySceneRegistry.js`, `src/js/data/TownPlaces.js`, `src/js/scenes/LobbyScene.js`
  Source of truth: `docs/MAIN_STORY_BIBLE.md`
  Validation: `scripts/StoryRuntimeCheck.mjs`, `scripts/TownRuntimeCheck.mjs`, manual town walk-through
  Notes: The single causal scene is presented as persistent South Gate, archive, Mia, forge, and crossroads checkpoints that the player must visit in order.

## Current Runtime Status

- [done] [P0] [story-reachability] Converge mandatory scene triggers
  Owner file(s): `src/js/data/ChapterRegionRegistry.js`, `src/js/data/TownPlaces.js`, `src/js/data/StoryObjectiveHints.js`, `src/js/managers/StoryGuidanceManager.js`, `src/js/scenes/AdventureScene.js`
  Source of truth: `src/js/data/StorySceneRegistry.js`, `docs/CHAPTER_QUEST_FRAMEWORK.md`
  Validation: `scripts/StoryReachabilityCheck.mjs`, `scripts/StructureConsistencyCheck.mjs`, `scripts/DataConsistencyCheck.mjs`
  Notes: All 66 mandatory scenes now have exactly one canonical trigger: 37 map triggers and 29 town triggers. Objective hints contain display copy only; Chapter 2 no longer depends on the hidden merchant, Chapter 5 has a map, shared landmarks resolve the next eligible scene, Chapter 7 owns explicit return/continuation triggers, and Chapter 6-7 current-run flags reset correctly.

- [in_progress] [P0] [story-transition-playthrough] Validate canonical triggers in the browser
  Owner file(s): `src/js/scenes/AdventureScene.js`, `src/js/scenes/LobbyScene.js`, `src/js/managers/NavigationIntentManager.js`
  Source of truth: `src/js/data/ChapterRegionRegistry.js`, `src/js/data/TownPlaces.js`
  Validation: manual desktop Chapter 1-7 progression without DEV force-starts
  Notes: Static reachability passes. The next session must verify real clicks, shared-landmark ordering, Chapter 7 walk/wolf-smoke return, defeat-return exclusion, and automatic epilogue continuation. Town-arrival intent is persisted until its scene successfully opens, so reload or a busy dialogue layer cannot consume it prematurely.

- [in_progress] [P0] [opening-playthrough] Validate the complete new-game opening without skips
  Owner file(s): guild tutorial, prologue combat, lobby, adventure, dialogue, and settlement runtime modules
  Source of truth: `src/js/data/GuildTutorial.js`, `src/js/data/StorySceneRegistry.js`, `src/js/data/ChapterOneProgression.js`
  Validation: manual fresh-save desktop playthrough from `#guild` through Chapter 1 completion
  Notes: Individual smoke tests and automated checks pass, but the entire chain has not yet been completed in one uninterrupted run.

- [in_progress] [P0] [chapter-1-quests] Review Chapter 1 mainline, side stories, and dungeon introduction in play
  Owner file(s): `src/js/data/Quests.js`, `src/js/data/QuestStories.js`, `src/js/data/NPCDialogues.js`, `src/js/data/WorldInteractions.js`
  Source of truth: `docs/MAIN_STORY_BIBLE.md`, `docs/NARRATIVE_WRITING_GUIDE.md`
  Validation: scene-by-scene user review and `scripts/ChapterOneGameplayCheck.mjs`
  Notes: Runtime records exist, but optional quests remain pending user playtest approval and must not be treated as locked content.

- [in_progress] [P0] [dialogue-integration] Validate choices, multi-actor emphasis, and expression continuity
  Owner file(s): `src/js/components/StoryDialogueView.js`, `src/js/managers/StoryDialogueController.js`, `src/js/scenes/LobbyScene.js`
  Source of truth: `src/js/data/StorySceneRegistry.js`, `docs/NARRATIVE_WRITING_GUIDE.md`
  Validation: no-skip review covering narration, choices, speaker changes, auto-read, history, and expression persistence
  Notes: The core behavior is implemented; complete Chapter 1 integration remains unverified.

- [in_progress] [P1] [settlement-integration] Validate full-backpack and blueprint reward cases
  Owner file(s): `src/js/managers/AdventureEncounterManager.js`, `src/js/managers/BlueprintManager.js`, `src/js/scenes/AdventureScene.js`
  Source of truth: live encounter-drop records
  Validation: manual win with free capacity, full backpack, discarded item, and blueprint drop
  Notes: The new decision UI is implemented, but all capacity branches still need browser playtesting.

- [in_progress] [P1] [optional-quest-contract] Resolve the optional-quest review gate
  Owner file(s): `src/js/data/Quests.js`, `src/js/data/QuestStories.js`
  Source of truth: approved character side-story direction
  Validation: `scripts/StoryRuntimeCheck.mjs`, `scripts/SideStoryFlowCheck.mjs`
  Notes: Six optional quests are currently active before formal user review, so these two checks intentionally remain non-passing until the quest set is reviewed or returned to a deferred state.

- [planned] [P1] [chapter-2-playthrough] Revalidate Chapter 2 after the opening flow is accepted
  Owner file(s): Chapter 2 story, town, map, combat, and quest runtime modules
  Source of truth: `src/js/data/StorySceneRegistry.js`
  Validation: manual no-skip Chapter 2 run
  Notes: Do not propagate Chapter 1 tutorial prompts into Chapter 2; Chapter 2 should use the already learned systems normally.

- [planned] [P1] [chapter-1-2-art-audio] Finish missing presentation assets
  Owner file(s): `src/js/data/StoryActors.js`, `src/js/data/AssetManifest.js`, `src/assets/images/art/scenes/`, `src/assets/audio/`
  Source of truth: `docs/ART_STYLE_GUIDE.md`, live scene requirements
  Validation: `scripts/AssetCoverageCheck.mjs` and manual scene review
  Notes: Remaining backgrounds, expression layers, and scene audio should be produced only after text and flow are accepted.

- [deferred] [P1] [balance] Resume final combat and drop-value tuning after flow validation
  Owner file(s): `src/js/data/Monsters.js`, `src/js/data/Equipment.js`, `src/js/data/Recipes.js`
  Source of truth: live databases and user playtest feedback
  Validation: `scripts/DifficultyProgressionCheck.mjs`
  Notes: Keep the current data-first rule; do not add runtime multipliers or compatibility patches.

- [deferred] [P1] [wolf-smoke-onboarding] Introduce return travel through a merchant
  Owner file(s): future market stock, merchant dialogue, and `src/js/data/UtilityItems.js`
  Source of truth: approved merchant story event
  Validation: merchant grants the first wolf smoke before it becomes purchasable
  Notes: Do not teach wolf smoke during the opening. Its first copy will be a merchant gift explained in story, followed by normal shop availability.

- [deferred] [P2] [material-classification] Give `cursed_shard` an approved use
  Owner file(s): `src/js/data/Materials.js`, `src/js/data/Recipes.js`, `src/js/data/FirstRunLootBalance.js`
  Source of truth: `docs/EQUIPMENT_SERIES_FRAMEWORK.md`
  Validation: `scripts/ItemFlowCheck.mjs`, `scripts/DataConsistencyCheck.mjs`
  Notes: It has a source but no destination; reserve it for an appropriate cursed, undead, or shadow craft.

- [paused] [P2] [tower-second-run-casino-mobile] Preserve paused boundaries
  Owner file(s): tower, second-run, casino-reward, and mobile runtime modules
  Source of truth: `AGENTS.md`, `docs/MAIN_STORY_BIBLE.md`, `docs/CASINO_ROUTE_FRAMEWORK.md`
  Validation: scope review
  Notes: Do not expand tower, second-run external Bosses, formal light/Void content, casino prizes, DLC, or mobile UI during this milestone.

Current validation snapshot:

- `BetaConvergenceCheck.mjs`: blocked only by the six optional quests being active before review.
- `DataConsistencyCheck.mjs`: pass.
- `MonsterEcologyCheck.mjs`: pass.
- `AssetCoverageCheck.mjs`: pass for missing mappings and physical files; existing dimension warnings remain.
- `StructureConsistencyCheck.mjs`: pass.
- `ChapterOneGameplayCheck.mjs`: pass.
- `CombatTutorialCheck.mjs`: pass.
- `ItemFlowCheck.mjs`: pass with the known no-source warnings for `spirit_essence`, `dark_crystal`, and `ancient_artifact`.
- `TownRuntimeCheck.mjs`: pass.
- `FirstRunLootCheck.mjs`: pass.
- `StoryReachabilityCheck.mjs`: pass; 66 scenes, 37 map triggers, 29 town triggers, and seven chapter maps.
- `StoryRuntimeCheck.mjs`: the mandatory-scene checks pass; the command remains non-passing only because six optional quests are active before review.
- `SideStoryFlowCheck.mjs`: blocked by the same optional-quest review gate.

## Next Good Step

- [planned] [P0] [fresh-save-review] Run the opening as a player, not as isolated systems
  Owner file(s): all opening and Chapter 1 runtime modules
  Source of truth: the live game flow
  Validation: fresh save from guild entry through Chapter 1 completion
  Notes: Record only concrete blockers such as a dead end, missing choice, inaccessible location, incorrect flag, broken reward decision, or duplicated tutorial.

- [planned] [P0] [quest-review] Approve or revise the six active optional quests
  Owner file(s): `src/js/data/Quests.js`, `src/js/data/QuestStories.js`, `src/js/data/NPCDialogues.js`
  Source of truth: approved side-story character intentions
  Validation: `scripts/StoryRuntimeCheck.mjs`, `scripts/SideStoryFlowCheck.mjs`
  Notes: Once reviewed, either keep them as playable records or return unfinished entries to deferred data; do not bypass the checks.

- [planned] [P1] [presentation-review] Lock Chapter 1 dialogue and reward presentation
  Owner file(s): dialogue, scene, and settlement modules
  Source of truth: runtime player experience
  Validation: manual review at HD and FHD desktop sizes
  Notes: Confirm speaker emphasis, persistent expressions, choice clarity, blueprint visibility, and inventory tradeoffs before creating missing art.

## Next Resume Task

Run the canonical story path in the browser and repair only concrete transition
failures. Do not add route fields back to objective hints or introduce a second
trigger resolver.

Target result:

- Complete Chapters 1-7 without DEV scene starts or manual flag injection.
- Confirm every `!` leads to the same target named by the current objective.
- Confirm shared landmarks play all eligible bound scenes in registry order.
- Confirm Chapter 2 begins from the market's empty crates without requiring the
  merchant to be visible.
- Confirm Chapter 5 opens its registered map and all four required landmarks.
- Confirm Chapter 7 starts its town-return scene only after walking back or
  using wolf smoke, never after defeat.
- Confirm Chapter 7 epilogue follows its return scene automatically.
- Preserve the single routing contract if a defect is found: map routing belongs
  to `ChapterRegionRegistry`, town routing belongs to `TownPlaces`, and
  `StoryObjectiveHints` remains copy-only.

Suggested implementation files:

- `src/js/data/ChapterRegionRegistry.js`
- `src/js/data/TownPlaces.js`
- `src/js/managers/StoryGuidanceManager.js`
- `src/js/managers/NavigationIntentManager.js`
- `src/js/scenes/AdventureScene.js`
- `src/js/scenes/LobbyScene.js`
- `scripts/StoryReachabilityCheck.mjs`

Validation:

- `scripts/StoryReachabilityCheck.mjs`
- `scripts/StoryRuntimeCheck.mjs`
- Chapter 1-7 gameplay checks
- Manual desktop Chapter 1-7 no-force progression, including reload during a
  pending town-arrival scene

Out of scope:

- Final numeric combat balance
- Six optional quests awaiting review
- Additional second-run Bosses or routes
- Tower and formal light/Void content
- Casino prize implementation
- New image batches before scene-flow approval
- Mobile UI

## Verification Commands

```powershell
$node = "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

& $node scripts\DataConsistencyCheck.mjs
& $node scripts\MonsterEcologyCheck.mjs
& $node scripts\AssetCoverageCheck.mjs
& $node scripts\StructureConsistencyCheck.mjs
& $node scripts\StoryReachabilityCheck.mjs
& $node scripts\ChapterOneGameplayCheck.mjs
& $node scripts\CombatTutorialCheck.mjs
& $node scripts\ItemFlowCheck.mjs
& $node scripts\TownRuntimeCheck.mjs
& $node scripts\FirstRunLootCheck.mjs
& $node scripts\StoryRuntimeCheck.mjs
& $node scripts\SideStoryFlowCheck.mjs
```

Expected exception:

- `StoryRuntimeCheck.mjs` and `SideStoryFlowCheck.mjs` remain non-passing until
  the six active optional quests complete user review or return to deferred data.
