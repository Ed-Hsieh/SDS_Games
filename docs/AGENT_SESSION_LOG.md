# Agent Session Log

Last updated: 2026-07-11

## Current Direction

The sole delivery priority is a complete first run. Do not expand second-run
external Boss stories, second-run gameplay, tower content, or post-reveal DLC
until the first-run story, playable systems, and every required image are
finished and validated.

First-run completion means:

- The complete first-run screenplay and character causality are approved.
- Chapter maps, town recovery, quests, market, casino, dialogue, combat-facing
  encounters, saves, and ending flow are playable from opening to false ending.
- Required full-screen location backgrounds, transparent half-body expression
  portraits, monsters, items, and critical first-run CGs are complete.
- The finished first run receives one final persistent-flag audit. Later
  second-run work must consume those stable achievement/evidence interfaces
  without changing first-run scene order, outputs, or core logic.

Recorded and paused:

- Optional second-run external Bosses remain base-game content and never gate
  the true ending.
- The five reserved route families are prologue overcap demon, Ash Baron,
  expedition supreme commander, Radiant Corridor, and Void revelation.
- Later DLC extends the post-reveal light, Void, and tower world; it does not own
  those routes' first resolutions.

## Completed In Recent Passes

- [done] [P0] [story-runtime] Compiled the complete screenplay foundation
  Owner file(s): `docs/MAIN_STORY_BIBLE.md`, `src/js/data/StorySceneRegistry.js`, `src/js/managers/StorySceneManager.js`
  Source of truth: `docs/MAIN_STORY_BIBLE.md`
  Validation: `scripts/StoryRuntimeCheck.mjs`, `scripts/ChapterStoryCompletenessCheck.mjs`
  Notes: All 66 scenes, seven chapters, nine expressions, run conditions, and nine core character contracts are machine-readable.

- [done] [P0] [map-town] Replaced old route and town scaffolding with the new foundation
  Owner file(s): `src/js/data/ChapterRegionRegistry.js`, `src/js/data/TownPlaces.js`, `src/js/managers/TownStateResolver.js`, `src/js/data/Quests.js`
  Source of truth: `docs/CHAPTER_QUEST_FRAMEWORK.md`, `docs/TOWN_REBUILD_CONVERGENCE.md`
  Validation: `scripts/TownRuntimeCheck.mjs`, `scripts/DataConsistencyCheck.mjs`
  Notes: Seven handcrafted regions, eight active town places, and seven reward-free scene-driven chapter quests replace the obsolete route and fifteen-quest layers.

- [done] [P0] [dialogue-direction] Accepted the layered dialogue presentation direction
  Owner file(s): `docs/NARRATIVE_WRITING_GUIDE.md`, `docs/MAIN_STORY_BIBLE.md`
  Source of truth: `docs/NARRATIVE_WRITING_GUIDE.md`
  Validation: manual user review
  Notes: Desktop 16:9 uses reusable full-screen backgrounds, transparent half-body portraits, five positions, nine script-selected expressions, speaker focus, left-click advance, Ctrl fast-forward, auto play, read skip, and history.

- [done] [P0] [second-run-boundary] Recorded and paused the external Boss layer
  Owner file(s): `docs/MAIN_STORY_BIBLE.md`, `docs/CHAPTER_QUEST_FRAMEWORK.md`, `src/js/data/ChapterQuestFramework.js`, `src/js/data/StoryRebuildPlan.js`
  Source of truth: `docs/MAIN_STORY_BIBLE.md`
  Validation: `scripts/StoryRebuildPlanCheck.mjs`, `scripts/BetaConvergenceCheck.mjs`
  Notes: External routes are loosely related world extensions with no shared mastermind or third ending; their expansion is blocked behind first-run completion.

- [done] [P0] [first-run-premise] Accepted the protagonist's official investigation role
  Owner file(s): `docs/MAIN_STORY_BIBLE.md`
  Source of truth: `docs/MAIN_STORY_BIBLE.md`
  Validation: manual premise review; detailed Chapter 1 scene synchronization remains pending
  Notes: The protagonist is a formally appointed royal frontier inspector sent after scheduled land, tax, and courier reports stop; the opening uses a mandatory tutorial fight and scripted defeat by a genuine high-tier Boss.

## Current Runtime Status

- The 66-scene registry, achievement-only run reset, chapter regions, town
  resolver, seven chapter quests, public one-merchant market, and validation
  foundation exist and pass their current checks.
- `StoryStateContract.js` already writes `story.secondRunUnlocked`,
  `story.achievement.unfinished_regicide`, and five first-run tragedy-memory
  achievements. Physical objects are never inherited across runs.
- The five-track `SecondRunExternalBossFramework` exists only as a paused design
  boundary. No prologue Boss identity, external route, reward, flag, or art was
  added.
- The first run is not yet a finished playable release slice. Detailed scene
  execution, the layered dialogue UI, final map interactions, first-run reward
  allocation, encounter/combat integration, and required art still need work.
- Current dialogue portraits with baked-in backgrounds are temporary. No final
  first-run expression sheets or approved critical CG set has been produced.
- Existing Ash Baron Lv40 placement and full light/Void/tower records are
  scaffolding; they must not be pulled into first-run implementation.

## Next Good Step

Finish first-run story review only, beginning with the opening:

1. Lock the royal frontier inspector mission, tutorial Boss identity, reason for
   the attack, fair tutorial completion, fixed defeat, equipment destruction,
   Mia rescue, and retained proof of office.
2. Finish first-run Chapters 1-3 town pacing and character groundwork.
3. Lock the first-run Vesper escape and Lorne evidence outcome.
4. Lock Chapter 7's first-run Ailo disappearance, false victory, surviving Demon
   King reveal, and return-town ending order.
5. Recompile the 66-scene registry after every accepted first-run revision.

Do not design the tutorial Boss's second-run rematch while completing its
first-run opening role.

## Next Resume Task

Continue the complete first-run delivery in this order.

Target result:

- Approve every first-run scene and causal transition from the south-road
  tutorial through the hollow-victory ending.
- Implement first-run scene execution, dialogue presentation, seven chapter
  routes, town recovery, quests, market, casino, encounters, saves, and ending.
- Review map functions, then allocate first-run rewards, materials, equipment,
  stock, and encounter sources without linking second-run external content.
- Produce and integrate every required first-run background, half-body
  expression layer, monster/item image, and critical CG.
- Complete an end-to-end first-run playthrough and validation pass.
- Audit the final first-run persistence contract. Keep
  `story.secondRunUnlocked`, `story.achievement.unfinished_regicide`, and the
  accepted tragedy-memory achievements; add only stable first-run evidence
  achievements whose source scenes are already final. Do not inherit physical
  items.

Suggested implementation files:

- `docs/MAIN_STORY_BIBLE.md`
- `src/js/data/StorySceneRegistry.js`
- `src/js/data/StoryStateContract.js`
- `src/js/managers/StorySceneManager.js`
- `src/js/managers/DialogueManager.js`
- `src/js/data/ChapterRegionRegistry.js`
- `src/js/managers/TownStateResolver.js`
- `src/js/data/Quests.js`
- `src/js/data/AssetManifest.js`
- `src/assets/images/art/`

Validation:

- `scripts/StoryRuntimeCheck.mjs`
- `scripts/ChapterStoryCompletenessCheck.mjs`
- `scripts/TownRuntimeCheck.mjs`
- `scripts/DataConsistencyCheck.mjs`
- `scripts/BetaConvergenceCheck.mjs`
- `scripts/AssetCoverageCheck.mjs`
- One complete first-run browser playthrough after implementation.

Out of scope:

- Further second-run external Boss story expansion.
- Second-run route, rescue, combat, reward, map, dialogue, or art implementation.
- Tower rewrite and post-reveal DLC.
- Mobile interface work.

## Verification Commands

```powershell
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\StoryRuntimeCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\StoryRebuildPlanCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\DataConsistencyCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\BetaConvergenceCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\AssetCoverageCheck.mjs
git diff --check
```
