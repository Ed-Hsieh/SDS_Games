# Agent Session Log

Last updated: 2026-07-13

## Current Direction

The sole delivery priority is a complete first run. The active milestone is a
complete desktop first run. Chapters 1 and 2 are the
current vertical slice: finish their playable flow, layered dialogue assets,
scene backgrounds, audio, and end-to-end validation before copying the same
implementation pattern into Chapters 3-7.

Do not expand second-run external Boss routes, tower content, post-reveal DLC,
mobile UI, or final combat balance during this milestone. First-run rewards,
materials, equipment sources, and market stock remain deferred until map and
scene functions are validated.

Optional second-run external Bosses remain base-game content, but their design
and implementation are paused until the complete first run passes validation.
The first-run ending must continue to set `story.secondRunUnlocked` through the
accepted scene-state contract. A persistent-flag audit is the final first-run
gate before second-run work resumes.

The intended delivery order is now:

1. Complete and validate the Chapter 1-2 vertical slice.
2. Apply the validated scene/map/dialogue/combat/settlement pattern to Chapters
   3-7.
3. Connect required first-run backgrounds, expression layers, audio, and
   critical CGs.
4. Review map functions and then allocate first-run rewards, materials,
   equipment, stock, and encounter sources.
5. Run one complete first-run playthrough through the hollow-victory ending.
6. Audit stable first-run achievements and evidence flags before any second-run
   implementation resumes.

## Completed In Recent Passes

- [done] [P0] [story-runtime] Compiled the seven-chapter screenplay foundation
  Owner file(s): `src/js/data/StorySceneRegistry.js`, `src/js/managers/StorySceneManager.js`, `src/js/data/StoryStateContract.js`
  Source of truth: `docs/MAIN_STORY_BIBLE.md`
  Validation: `scripts/StoryRuntimeCheck.mjs`
  Notes: All 66 scenes, nine closed expressions, nine core character contracts, seven chapter regions, and seven mainline encounter contracts pass validation.

- [done] [P0] [chapter-1-2] Established the Chapter 1-2 runtime story structure
  Owner file(s): `src/js/data/ChapterRegionRegistry.js`, `src/js/data/StoryEncounterContracts.js`, `src/js/scenes/AdventureScene.js`, `src/js/scenes/LobbyScene.js`
  Source of truth: `src/js/data/StorySceneRegistry.js`
  Validation: `scripts/StoryRuntimeCheck.mjs`, manual trigger audit
  Notes: Nineteen ordered scenes, town-NPC entry points, map bindings, two mainline Bosses, two route Bosses, pre-battle dialogue, combat handoff, post-battle presentation, and chapter flags exist.

- [done] [P0] [opening] Connected the mandatory tutorial defeat and Mia wake-up flow
  Owner file(s): `src/js/scenes/AdventureScene.js`, `src/js/scenes/LobbyScene.js`, `src/js/data/StoryStateContract.js`
  Source of truth: `src/js/data/StorySceneRegistry.js`
  Validation: manual browser flow check
  Notes: A new game enters the overcap Demon General encounter, resolves the scripted defeat, returns home, and opens the Chapter 1 Mia scene.

- [done] [P0] [scene-flow] Unified field encounter, combat, result, and story continuation ownership
  Owner file(s): `src/js/managers/SceneCombatFlow.js`, `src/js/managers/CombatFlowController.js`, `src/js/managers/AdventureEncounterManager.js`, `src/js/components/CombatStageView.js`
  Source of truth: `src/js/data/StoryEncounterContracts.js`
  Validation: `scripts/StoryRuntimeCheck.mjs`, manual browser checks
  Notes: Wild and authored encounters share one transition contract; combat balance values are intentionally not locked.

- [done] [P0] [map] Replaced the broken adventure scene with the first two handcrafted chapter maps
  Owner file(s): `src/js/data/ChapterRegionRegistry.js`, `src/js/data/OverworldMapRegistry.js`, `src/js/utils/WorldMap.js`, `src/js/scenes/AdventureScene.js`
  Source of truth: `src/js/data/ChapterRegionRegistry.js`
  Validation: manual desktop browser map checks
  Notes: Canvas movement, camera, fog, fatigue, location-based encounters, image landmarks, route gates, and travel handbook remain; visible road drawing and old random/ring geography are retired.

- [done] [P0] [journal-codex] Rebuilt first-run clues, journal discoveries, and encyclopedia intake
  Owner file(s): `src/js/data/StoryDiscoveries.js`, `src/js/managers/StoryJournalManager.js`, `src/js/managers/EncyclopediaManager.js`, `src/js/scenes/EncyclopediaScene.js`
  Source of truth: `src/js/data/StorySceneRegistry.js`
  Validation: `scripts/DataConsistencyCheck.mjs`, manual browser check
  Notes: Scene discoveries feed the unique journal and encyclopedia monster/item records; the redundant player-facing encyclopedia `Discovery` tab was removed.

- [done] [P1] [inventory-ui] Unified lobby storage and character preparation with the adventure UI
  Owner file(s): `src/views/lobby.html`, `src/js/scenes/LobbyScene.js`, `src/style/inventory-grid.css`, `src/css/ui-foundation.css`
  Source of truth: runtime inventory and equipment data
  Validation: manual desktop browser check
  Notes: Backpack and warehouse use the same five-column icon grid; item actions, character equipment, set state, attributes, and passive presentation share one visual language.

- [in_progress] [P0] [dialogue-ui] Establish the layered half-body dialogue presentation
  Owner file(s): `src/js/managers/DialogueManager.js`, `src/js/scenes/LobbyScene.js`, `src/css/ui-foundation.css`, `src/js/data/StoryActors.js`
  Source of truth: `docs/NARRATIVE_WRITING_GUIDE.md`, `src/js/data/StorySceneRegistry.js`
  Validation: pending complete Chapter 1-2 multi-speaker browser flow
  Notes: A Mia half-body visual prototype exists, but the layered dialogue system is not yet correctly integrated into the mainline scene flow and must not be treated as complete.

## Current Runtime Status

- The project contains 66 screenplay scenes, seven chapter regions, seven
  mainline encounter contracts, eight active town places, and seven scene-driven
  main quests. `StoryRuntimeCheck.mjs` and `DataConsistencyCheck.mjs` pass.
- Chapter 1 has 11 scenes and Chapter 2 has 8 scenes. Their runtime order and
  entry points exist, but the complete 19-scene path has not yet passed one
  uninterrupted browser playthrough.
- Chapter 1-2 scene structure and causal order are provisionally complete, but
  their player-facing prose is not final. Dialogue, narration, character voice,
  pacing, and transitions still require a focused rewrite against
  `NARRATIVE_WRITING_GUIDE.md` and the accepted character records before the
  scenes can be considered locked.
- Chapter 1 mainline Boss is `forest_guardian`; Chapter 2 is `lich`. Route Bosses
  are `ambush_mantis` and `blood_moon_stag`. All four images exist.
- Chapters 3-7 mainline Boss contracts and images exist:
  `shadow_commander`, `ancient_titan`, `elemental_lord`, `elder_dragon`, and
  `demon_lord_asariel`. Their full chapter runtime presentation is not yet built
  to the Chapter 1-2 standard.
- All seven mainline Boss images meet the current minimum 1024-pixel Boss rule.
- Scene registry backgrounds are still descriptive `working:` values rather
  than final asset paths. Existing Chapter 1-2 maps and landmark images must be
  connected before generating replacements. Dedicated Mia workroom and north
  checkpoint presentation remain clear first-pass gaps.
- Chapter 1-2 scripts use 34 actor-expression combinations across nine actors.
  Only `characters/dialogue/herbalist/neutral.png` exists, leaving 33 expression
  layers to produce or deliberately alias within the closed nine-expression
  vocabulary.
- The dialogue presentation currently does not reliably assemble the intended
  full-screen background, half-body participants, speaker focus, expression,
  and dialogue box for every mainline scene. Do not generate the remaining
  expression set until the Chapter 1-2 text pass and participant/expression
  assignments are stable.
- Asset coverage finds zero missing physical files for existing mappings. It
  reports 82 missing image mappings: 49 crafted-result items and 33 casino
  special items.
- Asset coverage reports 30 dimension warnings across 26 unique files: eight
  equipment images, fourteen normal monster images, and four 512-pixel dungeon
  Boss images.
- Of 341 runtime art files, only
  `characters/reserve/apothecary_assistant.webp` is fully unreferenced. Twenty
  monster images are registered but not used by the current encounter, dungeon,
  or story-Boss routes; treat them as reserved until their chapter or external
  role is reviewed, not as automatic deletion candidates.
- Reward assignment, material/drop tuning, encounter balance, and final combat
  values are still intentionally deferred. Existing values should not be treated
  as approved balance.

## Next Good Step

Finish the Chapter 1-2 vertical slice before extending the remaining chapters:

- [in_progress] [P0] [chapter-1-2-writing] Rewrite Chapter 1-2 player-facing text
  Owner file(s): `docs/MAIN_STORY_BIBLE.md`, `src/js/data/StorySceneRegistry.js`
  Source of truth: `docs/NARRATIVE_WRITING_GUIDE.md`, relevant character dossiers and the master character register
  Validation: manual scene-by-scene narrative review followed by `scripts/StoryRuntimeCheck.mjs`
  Notes: Preserve accepted causality and scene order while improving character voice, natural conversation, narration, pacing, emotional buildup, and transitions; do not add new plot branches as a prose workaround.

- [in_progress] [P0] [dialogue-runtime] Correctly integrate the layered dialogue system
  Owner file(s): `src/js/managers/DialogueManager.js`, `src/js/managers/StorySceneManager.js`, `src/js/scenes/LobbyScene.js`, `src/js/scenes/AdventureScene.js`, `src/css/ui-foundation.css`
  Source of truth: `docs/NARRATIVE_WRITING_GUIDE.md`, `src/js/data/StorySceneRegistry.js`, `src/js/data/StoryActors.js`
  Validation: manual Chapter 1-2 single-speaker, multi-speaker, narration, expression, focus, advance, fast-forward, auto-play, read-skip, and history checks
  Notes: The current Mia prototype proves only the visual direction; town and field story scenes still need one shared, correctly connected presentation path.

- [in_progress] [P0] [chapter-1-2] Connect every scene to a real presentation source
  Owner file(s): `src/js/data/StorySceneRegistry.js`, `src/js/data/ChapterRegionRegistry.js`, `src/js/data/AssetManifest.js`, `src/js/managers/DialogueManager.js`
  Source of truth: `src/js/data/StorySceneRegistry.js`
  Validation: manual Chapter 1-2 scene-by-scene browser audit
  Notes: Reuse approved maps, town scenes, landmark images, and Boss art first; record only genuinely missing backgrounds for generation.

- [planned] [P0] [dialogue-art] Produce the missing Chapter 1-2 expression layers
  Owner file(s): `src/assets/images/art/characters/dialogue/`, `src/js/data/StoryActors.js`
  Source of truth: expressions used by `src/js/data/StorySceneRegistry.js`
  Validation: transparent-layer visual check in all five dialogue positions
  Notes: Keep half-body composition and the closed nine-expression vocabulary; do not create new emotion ids.

- [planned] [P0] [playthrough] Validate the complete Chapter 1-2 route without developer skips
  Owner file(s): `src/js/scenes/AdventureScene.js`, `src/js/scenes/LobbyScene.js`, `src/js/managers/StorySceneManager.js`, `src/js/managers/SceneCombatFlow.js`
  Source of truth: `src/js/data/StorySceneRegistry.js`, `src/js/data/StoryEncounterContracts.js`
  Validation: reset save and play from tutorial defeat through `ch2_s08_shadow_at_the_checkpoint`
  Notes: Verify town actor entry, map fog/discovery, both route Bosses, both mainline Bosses, settlement take/discard, chapter flags, save/load, and Chapter 3 unlock.

- [planned] [P1] [audio] Bind Chapter 1-2 dialogue, travel, combat, and result audio cues
  Owner file(s): audio manager and scene presentation modules selected during implementation
  Source of truth: `src/js/data/StorySceneRegistry.js`
  Validation: manual volume-separated BGM/SFX playthrough
  Notes: Preserve separate BGM and SFX controls and avoid per-scene duplicate audio systems.

- [deferred] [P1] [chapters-3-7] Extend the validated vertical-slice pattern
  Owner file(s): `src/js/data/ChapterRegionRegistry.js`, `src/js/data/StoryEncounterContracts.js`, `src/js/scenes/AdventureScene.js`, `src/js/scenes/LobbyScene.js`
  Source of truth: `src/js/data/StorySceneRegistry.js`
  Validation: chapter-by-chapter browser playthrough
  Notes: Begin only after Chapter 1-2 presentation and flow are stable.

- [deferred] [P2] [asset-gaps] Resolve item mappings and image specification warnings
  Owner file(s): `src/js/data/AssetManifest.js`, `src/assets/images/art/`, item and casino data owners
  Source of truth: live item databases and `scripts/AssetCoverageCheck.mjs`
  Validation: `scripts/AssetCoverageCheck.mjs`
  Notes: Handle 49 crafted results, 33 casino items, and 26 unique dimension problems after first-run scene art priorities are clear.

## Next Resume Task

Continue by revising the Chapter 1-2 player-facing text and correctly connecting
the layered dialogue runtime. After dialogue ownership is stable, connect the
scenes to actual backgrounds and approved existing art, then perform a complete
no-skip Chapter 1-2 playthrough.

Target result:

- Every one of the 19 Chapter 1-2 scenes opens from its intended town actor,
  regional trigger, landmark, or Boss convergence.
- Every line follows the accepted narrative voice and the speaking character's
  established personality instead of reading like a system summary or temporary
  implementation prose.
- Single-speaker, multi-speaker, and narration beats all use the same layered
  dialogue runtime with correct participant placement, expression, speaker
  focus, dialogue controls, and history.
- Dialogue shows a valid full-screen background and actor presentation instead
  of a `working:` description or blank layer.
- The tutorial defeat, four authored Boss encounters, unified result flow,
  scene completion, Chapter 2 opening, and Chapter 3 unlock all survive save/load.
- A precise generation list remains for only the backgrounds and expression
  layers that cannot reuse approved assets.

Suggested implementation files:

- `docs/NARRATIVE_WRITING_GUIDE.md`
- `docs/MAIN_STORY_BIBLE.md`
- `src/js/data/StorySceneRegistry.js`
- `src/js/data/ChapterRegionRegistry.js`
- `src/js/data/StoryActors.js`
- `src/js/data/AssetManifest.js`
- `src/js/managers/DialogueManager.js`
- `src/js/managers/StorySceneManager.js`
- `src/js/scenes/LobbyScene.js`
- `src/js/scenes/AdventureScene.js`
- `src/assets/images/art/characters/dialogue/`
- `src/assets/images/art/scenes/`

Validation:

- `scripts/StoryRuntimeCheck.mjs`
- `scripts/DataConsistencyCheck.mjs`
- `scripts/AssetCoverageCheck.mjs`
- Reset-save browser playthrough through `ch2_s08_shadow_at_the_checkpoint`.

Out of scope:

- Combat balance, reward tables, drop rates, and final equipment strength.
- Further second-run external Boss design or implementation.
- Tower rewrite, formal light/Void DLC, and post-reveal content.
- Mobile interface work.
- Deleting reserved monster art without a separate role audit.
- Generating all 33 remaining Chapter 1-2 expression layers before the revised
  text and expression assignments are approved.

## Verification Commands

```powershell
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\StoryRuntimeCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\DataConsistencyCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\AssetCoverageCheck.mjs
git diff --check
```
