# Obsolete Cleanup Plan

Last updated: 2026-07-27

This file records only active cleanup boundaries and removals that future agents
must not restore. Runtime data remains the source of truth.

## Cleanup Policy

- Remove a superseded system at its ownership boundary.
- Do not add aliases, fallback asset paths, parallel renderers, or compatibility
  adapters for obsolete prototypes.
- Do not delete paused content merely because it is outside the current review
  gate.
- Require a reference scan and focused validation before removing live owners.
- Keep original generated PNG sources under the intentionally gitignored
  `src/assets/images/art-source/originals/`.

## Active Cleanup

- [planned] [P0] [formal-exploration-migration] Retire the old formal map presentation
  Reason: `AdventureScene.js` and `ChapterRegionRegistry.js` still support the formal story runtime, but their previous map presentation is no longer the accepted exploration design.
  Safe when: The Chapter 1 Three.js vertical slice is accepted and all required scene, quest, encounter, return, and town transitions have one formal 3D owner.
  Follow-up: Replace the old presentation directly; do not preserve it beside the accepted core.
  Validation: `scripts/ChapterOne3DDemoCheck.mjs`, `scripts/StoryReachabilityCheck.mjs`, and one formal Chapter 1 no-skip playthrough.

- [deferred] [P2] [drop-schema-wrappers] Remove legacy-friendly drop-pool shapes
  Reason: `DropManager.js` still accepts more than one producer shape.
  Safe when: Every active drop producer uses the canonical schema.
  Follow-up: Perform this only during a dedicated drop-schema pass.
  Validation: `scripts/FirstRunLootCheck.mjs`, `scripts/DataConsistencyCheck.mjs`.

## Removed Guardrails

- [removed] [P0] [canvas-hunt-demo] `#hunt-demo` Canvas South Gate prototype
  Reason: The project moved to direct third-person 3D exploration and combat; retaining the Canvas renderer, masks, sprite atlas, and combat handoff would create a second exploration truth.
  Safe when: `#combat-demo` owns the only active prototype entry and its memory-only route passes `ChapterOne3DDemoCheck.mjs`.
  Follow-up: Do not restore `HuntDemoScene.js`, `SouthGateMapPackage.js`, `HuntDemoCombatAdapter.js`, hunt-demo CSS/views, or their generated assets as fallbacks.
  Validation: reference scan plus `scripts/ChapterOne3DDemoCheck.mjs`.

- [removed] [P0] [old-hunt-renderers] DOM, room, and four-region hunt prototypes
  Reason: They could not align character animation, visible terrain, collision, depth, and foreground occlusion as one game space.
  Safe when: No active runtime imports their scene, region, room, or DOM-world owners.
  Follow-up: Do not restore DOM world nodes, visible route polygons, room loaders, or separate open-world prototypes.
  Validation: reference scans plus `scripts/ChapterOne3DDemoCheck.mjs`.

- [removed] [P0] [old-hunt-assets] Superseded prototype maps, props, and sprites
  Reason: Their baked backgrounds, black-backed props, guessed sprite slicing, and incompatible anchors could not satisfy the accepted map package.
  Safe when: No active runtime or asset manifest references the removed files.
  Follow-up: Build future regions as reviewed 3D environments; do not copy these deleted 2D assets as templates.
  Validation: `scripts/AssetCoverageCheck.mjs`, reference scans, and `scripts/ChapterOne3DDemoCheck.mjs`.

- [removed] [P1] [temporary-causal-draft] `docs/CHAPTER_1_CAUSAL_REBUILD_DRAFT.md`
  Reason: It was a temporary convergence document, and its accepted rules now live in `MAIN_STORY_BIBLE.md` and `CHAPTER_QUEST_FRAMEWORK.md`.
  Safe when: Chapter 1 causality, evidence ownership, staged reporting, and world-state consequences remain in authoritative documents.
  Follow-up: Edit the owning authority directly; do not recreate another Chapter 1 planning file.
  Validation: `scripts/BetaConvergenceCheck.mjs`.

- [removed] [P1] [legacy-art-pipeline] `art-v2` and crop-sheet fallbacks
  Reason: Runtime art uses one-subject files under `src/assets/images/art/`.
  Safe when: Active mappings resolve without missing files.
  Follow-up: Do not recreate `art-v2` or layered fallback resolution.
  Validation: `scripts/AssetCoverageCheck.mjs`.

- [removed] [P1] [duplicate-story-plans] Old quest-spine and route-plan compatibility files
  Reason: Mandatory progression compiles from the 66-scene registry and its formal bindings.
  Safe when: Each mandatory scene has one canonical trigger.
  Follow-up: Keep hints as presentation text, not a second routing authority.
  Validation: `scripts/StoryReachabilityCheck.mjs`, `scripts/StoryRuntimeCheck.mjs`.

## Do Not Remove

- `ChapterRegionRegistry.js`, formal story flags, town bindings, and quest data
  before the accepted 3D core is migrated into formal Chapter 1 runtime.
- Formal weapon profiles, monster records, drops, Boss art, and story text.
  The 3D prototype must adapt those owners rather than copy their data.
- Tower and second-run external Boss records. They are paused, not obsolete.
- Runtime WebP assets under `src/assets/images/art/` and original generated
  sources under `src/assets/images/art-source/originals/`.
- Registered reserve content solely because it is absent from first-run sampling.
