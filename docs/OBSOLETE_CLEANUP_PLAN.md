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
  Safe when: The South Gate Canvas slice is accepted and all Chapter 1 scene, quest, encounter, return, and town transitions have been ported into the single Canvas core.
  Follow-up: Replace the old presentation directly; do not preserve it beside the accepted core.
  Validation: `scripts/HuntDemoCheck.mjs`, `scripts/StoryReachabilityCheck.mjs`, and one formal Chapter 1 no-skip playthrough.

- [deferred] [P2] [drop-schema-wrappers] Remove legacy-friendly drop-pool shapes
  Reason: `DropManager.js` still accepts more than one producer shape.
  Safe when: Every active drop producer uses the canonical schema.
  Follow-up: Perform this only during a dedicated drop-schema pass.
  Validation: `scripts/FirstRunLootCheck.mjs`, `scripts/DataConsistencyCheck.mjs`.

## Removed Guardrails

- [removed] [P0] [old-hunt-renderers] DOM, room, and four-region hunt prototypes
  Reason: They could not align character animation, visible terrain, collision, depth, and foreground occlusion as one game space.
  Safe when: `HuntDemoScene.js` renders only the Canvas core and no runtime imports `HuntDemoRegions.js`.
  Follow-up: Do not restore DOM world nodes, visible route polygons, room loaders, or separate open-world prototypes.
  Validation: `scripts/HuntDemoCheck.mjs` and reference scans.

- [removed] [P0] [old-hunt-assets] Superseded prototype maps, props, and sprites
  Reason: Their baked backgrounds, black-backed props, guessed sprite slicing, and incompatible anchors could not satisfy the accepted map package.
  Safe when: The South Gate package has valid base, foreground, walk, height, and material masks plus metadata-driven traveler animation.
  Follow-up: Generate later-region assets from approved spatial layouts; do not copy these deleted assets as templates.
  Validation: `scripts/AssetCoverageCheck.mjs`, `scripts/HuntDemoCheck.mjs`.

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
  before the accepted Canvas core is migrated into formal Chapter 1 runtime.
- The existing full-screen combat core, weapon profiles, monster records, drops,
  or Boss art. Exploration only hands encounters to those owners.
- Tower and second-run external Boss records. They are paused, not obsolete.
- Runtime WebP assets under `src/assets/images/art/` and original generated
  sources under `src/assets/images/art-source/originals/`.
- Registered reserve content solely because it is absent from first-run sampling.
