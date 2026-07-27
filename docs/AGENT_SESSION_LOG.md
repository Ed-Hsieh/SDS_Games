# Agent Session Log

Last updated: 2026-07-27

## Current Direction

The sole active exploration/combat prototype is the desktop Three.js vertical
slice at `#combat-demo`.

The current review boundary is Chapter 1 from South Gate camp through the three
landmarks to the silver-snare `ambush_mantis` route Boss. The slice is
memory-only and must continue reading formal monster, skill, item, drop, and
story data without writing formal save state.

The previous Canvas `#hunt-demo` and its South Gate package have been removed.
They must not return as a fallback or parallel exploration mode. Formal
`AdventureScene` migration, later Chapter 1 regions, Chapters 2-7, production
3D asset work, second-run content, tower work, final balance, audio, and mobile
UI remain outside the current gate.

## Completed In Recent Passes

- [done] [P0] [prototype-core] Replace the Canvas test with one Three.js scene
  Owner file(s): `src/js/scenes/ThreeCombatDemoScene.js`, `src/views/combat-demo.html`, `src/style/combat-demo.css`
  Source of truth: current `#combat-demo` runtime
  Validation: `scripts/ChapterOne3DDemoCheck.mjs`, manual browser load
  Notes: The prototype owns rendering, third-person camera, room loading, player and enemy presentation, interactions, loot, and town return in one runtime.

- [done] [P0] [chapter-one-route] Build the five-room Chapter 1 vertical slice
  Owner file(s): `src/js/combat-demo/ChapterOneDemoRoute.js`, `src/js/combat-demo/ChapterDemoSession.js`
  Source of truth: `ChapterOneDemoRooms` and the memory-only session contract
  Validation: `scripts/ChapterOne3DDemoCheck.mjs`
  Notes: South Gate camp, farmland, hunter boardwalk, old campfire, and silver-snare pass are connected; three evidence records gate the Boss route.

- [done] [P0] [direct-combat] Add direct third-person combat controls
  Owner file(s): `src/js/combat-demo/DemoInputController.js`, `src/js/combat-demo/DemoCombatController.js`
  Source of truth: formal monster data through `DemoDataAdapter.js`
  Validation: `scripts/ChapterOne3DDemoCheck.mjs`, `scripts/MonsterCombatCheck.mjs`
  Notes: The slice includes light combo, heavy charge, dodge invulnerability, stamina, lock-on, potions, enemy windups, death, and checkpoint reset.

- [done] [P0] [formal-data-bridge] Keep monster, action, item, drop, and story ownership canonical
  Owner file(s): `src/js/combat-demo/DemoDataAdapter.js`
  Source of truth: formal monster databases, `MonsterCombatProfiles.js`, item resolution, drop calculation, and `StorySceneRegistry.js`
  Validation: `scripts/ChapterOne3DDemoCheck.mjs`, `scripts/MonsterCombatCheck.mjs`
  Notes: Prototype route data stores ids and spatial requirements; it does not copy formal stats, skills, rewards, or prose.

- [done] [P1] [memory-boundary] Isolate prototype progress from the formal save
  Owner file(s): `src/js/combat-demo/ChapterDemoSession.js`
  Source of truth: in-memory `ChapterDemoSession`
  Validation: `scripts/ChapterOne3DDemoCheck.mjs`
  Notes: Room, checkpoint, evidence, shortcut, defeated enemies, potions, and demo backpack state are discarded when the prototype session ends.

- [done] [P1] [camera-facing] Correct third-person character orientation
  Owner file(s): `src/js/scenes/ThreeCombatDemoScene.js`
  Source of truth: the scene's single `playerFacing` contract
  Validation: syntax check, `scripts/ChapterOne3DDemoCheck.mjs`, manual browser inspection
  Notes: Idle camera turns, movement, attack/dodge alignment, lock-on facing, and the GLB model's 180-degree visual forward offset now share one orientation path.

- [done] [P1] [prototype-cleanup] Remove the superseded Canvas vertical slice
  Owner file(s): removed hunt-demo scene, view, CSS, map package, adapter, scripts, and assets
  Source of truth: `docs/OBSOLETE_CLEANUP_PLAN.md`
  Validation: reference scan and `scripts/ChapterOne3DDemoCheck.mjs`
  Notes: No Canvas exploration fallback should be restored beside the 3D prototype.

## Current Runtime Status

- [in_progress] [P0] [three-d-acceptance] Validate the complete Chapter 1 3D slice
  Owner file(s): `src/js/scenes/ThreeCombatDemoScene.js`, `src/js/combat-demo/`, `src/style/combat-demo.css`
  Source of truth: current `#combat-demo` runtime
  Validation: one uninterrupted desktop playthrough at 1920x1080 plus DEV performance review
  Notes: Camera and model-facing corrections pass focused checks, but the whole five-room route still needs a no-skip manual acceptance pass.

- [in_progress] [P1] [performance] Keep 1080p play near the 16.7 ms frame target
  Owner file(s): `src/js/scenes/ThreeCombatDemoScene.js`, `src/js/combat-demo/DemoHud.js`, `src/js/combat-demo/DemoWorldBuilder.js`
  Source of truth: DEV FPS, frame-time, draw-call, and triangle counters
  Validation: sustained room and combat measurements without screenshot or background-tab throttling
  Notes: Renderer DPR and shadow costs are capped and HUD updates are state-driven; each populated combat room still needs sustained measurement.

- [planned] [P1] [production-models] Replace temporary enemy geometry
  Owner file(s): future GLBs under `src/assets/models/combat-demo/`
  Source of truth: `wild_wolf`, `poison_spider`, and `ambush_mantis` formal monster identities
  Validation: animation, hitbox, silhouette, draw-call, and disposal review
  Notes: Player and environment kit GLBs exist; the three route monsters do not yet have approved Blender models or animation sets.

- [planned] [P1] [combat-feel] Review hit feedback and enemy readability
  Owner file(s): `src/js/combat-demo/DemoCombatController.js`, `src/js/scenes/ThreeCombatDemoScene.js`
  Source of truth: formal monster actions plus the accepted direct-combat control contract
  Validation: manual light/heavy/dodge/lock-on/potion/Boss playtest
  Notes: Tune presentation only after identifying concrete feel problems; do not introduce a second balance table.

- [paused] [P0] [formal-adventure-migration] Replace formal exploration after acceptance
  Owner file(s): future formal exploration integration
  Source of truth: accepted `#combat-demo` behavior and formal story bindings
  Validation: formal Chapter 1 no-skip playthrough with save-state comparison
  Notes: The prototype must not remain as a permanent parallel mode after migration.

- [deferred] [P2] [later-region-production] Build later Chapter 1 areas and Chapters 2-7
  Owner file(s): future 3D route, model, animation, and environment modules
  Source of truth: `docs/MAIN_STORY_BIBLE.md`, `docs/CHAPTER_QUEST_FRAMEWORK.md`
  Validation: each region must pass the accepted Chapter 1 camera, movement, combat, data, reset, and story-return contracts
  Notes: Do not expand before the first vertical slice is accepted.

## Next Good Step

Run one uninterrupted Chapter 1 3D acceptance pass. Start at South Gate camp,
collect all three evidence records, use the campfire and shortcut, defeat the
silver-snare Boss, collect its record, and return to town. Record concrete
failures in camera control, movement, collision, attack timing, enemy behavior,
loot interaction, checkpoint reset, route gating, or story handoff.

## Next Resume Task

Continue the `#combat-demo` acceptance pass.

Target result:

- Character and camera remain aligned through idle turning, movement, attacks,
  directionless dodge, and lock-on.
- Every room transition and evidence requirement works without DEV shortcuts.
- Death restores the latest checkpoint state correctly.
- Loot remains in the world when the demo backpack is full.
- The Boss route opens only after all three landmarks.
- Boss completion returns to the existing town story boundary without changing
  formal save data.
- Sustained 1080p combat remains close to the 16.7 ms target.

Suggested implementation files:

- `src/js/scenes/ThreeCombatDemoScene.js`
- `src/js/combat-demo/ChapterOneDemoRoute.js`
- `src/js/combat-demo/ChapterDemoSession.js`
- `src/js/combat-demo/DemoCombatController.js`
- `src/js/combat-demo/DemoInputController.js`
- `src/js/combat-demo/DemoWorldBuilder.js`
- `src/js/combat-demo/DemoHud.js`

Validation:

- `scripts/ChapterOne3DDemoCheck.mjs`
- `scripts/MonsterCombatCheck.mjs`
- `scripts/DataConsistencyCheck.mjs`
- Manual no-skip desktop playthrough at `#combat-demo`

Out of scope:

- Formal save migration
- Later Chapter 1 regions and Chapters 2-7
- Final numeric balance
- Second-run external Boss content
- Tower and casino expansion
- Audio and mobile UI

## Verification Commands

```powershell
& 'D:\Users\s494326\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --check src/js/scenes/ThreeCombatDemoScene.js
& 'D:\Users\s494326\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/ChapterOne3DDemoCheck.mjs
& 'D:\Users\s494326\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/MonsterCombatCheck.mjs
& 'D:\Users\s494326\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/DataConsistencyCheck.mjs
& 'D:\Users\s494326\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/MonsterEcologyCheck.mjs
```
