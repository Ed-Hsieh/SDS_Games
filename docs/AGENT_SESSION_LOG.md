# Agent Session Log

Last updated: 2026-07-27

## Current Direction

The sole delivery priority remains the desktop first run.
The immediate review gate is the South Gate Canvas vertical slice at `#hunt-demo`.

There is one exploration direction:

- Canvas 2D renders the world, player, props, masks, shadows, and foregrounds.
- A layered map package owns visible terrain, collision, materials, height,
  occlusion, spawn points, interactions, danger zones, and exits.
- The map never displays monster bodies or calculates combat damage.
- Environmental danger zones hand off to the existing full-screen combat core.
- The prototype is memory-only and does not change formal story or save flags.

Only South Gate is in scope. Forest, Rotroot, mine, Chapters 2-7, formal
`AdventureScene` migration, second-run content, tower work, final balance,
casino expansion, audio, and mobile UI remain paused until this slice is
accepted.

## Completed In Recent Passes

- [done] [P0] [canvas-core] Replace the DOM exploration prototype
  Owner file(s): `src/js/scenes/HuntDemoScene.js`, `src/views/hunt-demo.html`, `src/style/hunt-demo.css`
  Source of truth: `src/js/data/SouthGateMapPackage.js`
  Validation: `scripts/HuntDemoCheck.mjs`
  Notes: Rendering, camera, movement, interaction, and calibration now share one Canvas 2D core; no second map renderer remains in the prototype.

- [done] [P0] [south-gate-package] Build the layered South Gate map
  Owner file(s): `src/assets/images/art/prototype/hunt-demo/south-gate/`
  Source of truth: `src/js/data/SouthGateMapPackage.js`
  Validation: `scripts/HuntDemoCheck.mjs`, manual desktop review
  Notes: The package includes base and foreground art, walk, height, and material masks, visible collision, exits, props, a rest point, a secret, and environmental danger zones.

- [done] [P0] [traveler-animation] Replace the old guessed sprite slicing
  Owner file(s): South Gate traveler atlas and metadata
  Source of truth: `ExplorationSpriteAtlas` data in the South Gate package
  Validation: atlas metadata checks and manual eight-direction movement review
  Notes: Idle, walk, and roll use explicit frame rectangles, pivots, durations, and loop rules. The prototype no longer mirrors directions or guesses frames by percentage.

- [done] [P0] [combat-handoff] Keep one combat core
  Owner file(s): `src/js/managers/HuntDemoCombatAdapter.js`
  Source of truth: the existing full-screen combat session and VFX runtime
  Validation: `scripts/HuntDemoCheck.mjs`
  Notes: Danger zones only create encounter handoff data. The map has no weapon, damage, monster-AI, or drop tables.

- [done] [P1] [prototype-cleanup] Remove superseded exploration prototypes
  Owner file(s): `src/js/scenes/HuntDemoScene.js`, South Gate prototype assets
  Source of truth: this log and `docs/CHAPTER_QUEST_FRAMEWORK.md`
  Validation: reference scan and `scripts/HuntDemoCheck.mjs`
  Notes: The old DOM map, room prototype, four-region prototype, visible route polygons, old player sprites, and obsolete prop packages were removed instead of retained as fallbacks.

- [done] [P1] [documentation-cleanup] Converge exploration documentation
  Owner file(s): `AGENTS.md`, `docs/README.md`, `docs/CHAPTER_QUEST_FRAMEWORK.md`, `docs/ART_STYLE_GUIDE.md`, `docs/OBSOLETE_CLEANUP_PLAN.md`
  Source of truth: current runtime plus the user-approved South Gate plan
  Validation: `scripts/BetaConvergenceCheck.mjs`
  Notes: The temporary Chapter 1 causal draft and obsolete map contracts were removed; accepted narrative causality remains in the story bible and chapter framework.

## Current Runtime Status

- [in_progress] [P0] [south-gate-acceptance] Validate the complete South Gate slice
  Owner file(s): `src/js/scenes/HuntDemoScene.js`, `src/js/data/SouthGateMapPackage.js`, `src/style/hunt-demo.css`
  Source of truth: the current `#hunt-demo` runtime
  Validation: manual desktop playtest at 1440x900, 1920x1080, and 2560x1440
  Notes: Validate animation order, foot anchoring, visible-terrain collision, wall sliding, foreground occlusion, prop interaction, danger-zone battle return, rest/reset behavior, and map exit.

- [done] [P0] [dev-calibration-boundary] Keep calibration out of the player view
  Owner file(s): `src/js/scenes/HuntDemoScene.js`
  Source of truth: DEV-only calibration controls
  Validation: compare DEV off and DEV on
  Notes: Masks, collision shapes, pivots, and ids are hidden by default and may appear only when calibration is explicitly enabled.

- [paused] [P0] [formal-adventure-migration] Replace formal exploration only after acceptance
  Owner file(s): future `AdventureScene.js` and chapter-region integration
  Source of truth: accepted South Gate behavior
  Validation: formal Chapter 1 no-skip playthrough after migration
  Notes: Do not keep `#hunt-demo` as a permanent parallel game mode. Once accepted, port the core into formal exploration and remove the prototype entry.

- [deferred] [P1] [later-region-production] Build Forest, Rotroot, mine, and Chapters 2-7
  Owner file(s): future map packages and assets
  Source of truth: `docs/CHAPTER_QUEST_FRAMEWORK.md`, `docs/MAIN_STORY_BIBLE.md`
  Validation: each region must pass the South Gate movement, collision, interaction, and combat-return contract
  Notes: Do not generate or wire later map packages before South Gate acceptance.

## Next Good Step

Run a focused South Gate acceptance pass. Record only concrete failures in
animation, terrain alignment, collision, occlusion, interaction, danger-zone
handoff, return position, or camera behavior. Fix those in the existing Canvas
core and map package rather than adding another renderer or compatibility path.

## Next Resume Task

- Continue the South Gate Canvas acceptance pass at `#hunt-demo`.
- Inspect all eight movement directions, walk and roll frame order, and foot
  stability.
- Walk every visible terrain boundary and verify that collision follows the art.
- Pass behind every foreground object and verify stable sorting.
- Trigger every interaction and danger zone, then verify victory, retreat, rest,
  reset, and exit return positions.
- Keep formal quests, save data, later regions, audio, and numeric balance out of
  this pass.

## Verification Commands

```powershell
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/HuntDemoCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/BetaConvergenceCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/AssetCoverageCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/DataConsistencyCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/MonsterEcologyCheck.mjs
```
