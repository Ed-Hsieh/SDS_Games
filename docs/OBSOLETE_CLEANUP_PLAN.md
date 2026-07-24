# Obsolete Cleanup Plan

Last updated: 2026-07-24

This file tracks only cleanup that is still active or whose completed removal is
important enough to prevent accidental restoration. Runtime JS/data remains the
source of truth.

## Cleanup Policy

- Remove obsolete systems at their ownership boundary; do not add compatibility
  aliases merely to preserve stale ids.
- Do not delete paused gameplay systems because they are paused.
- Require a concrete reference scan and validation command for every removal.
- Keep local source PNGs under `src/assets/images/art-source/originals/`; that
  folder is intentionally gitignored.

## Story And Quest Cleanup

- [in_progress] [P0] story trigger routing duplicated across hints, map nodes,
  region bindings, and Chapter 1 special handling
  Reason: `StoryObjectiveHints.js` currently carries routing ids,
  `AdventureScene.js` starts `locationNodes[].sceneIds[0]`, and
  `ChapterRegionRegistry.sceneBindings` is not the sole runtime map authority.
  This permits a marker, declared binding, and clickable scene to disagree.
  Safe when: Every mandatory scene resolves through one town or region binding,
  shared landmarks select the first startable incomplete scene, and Chapter 1
  special checkpoints do not become a second chapter engine.
  Follow-up: Remove actor/place/target routing from objective hints, remove
  direct `sceneIds[0]` progression, and keep only reusable Chapter 1 checkpoint
  mechanics after the opening flow remains equivalent.
  Validation: `scripts/StoryReachabilityCheck.mjs`,
  `scripts/StoryRuntimeCheck.mjs`, and one no-skip Chapter 1-7 progression run.

- [in_progress] [P0] `QuestScene.js`, `NPCDialogues.js`, relationship bridges
  Reason: Mandatory screenplay dialogue now belongs to `StorySceneRegistry.js`
  and the layered dialogue runtime, while optional topic/report dialogue still
  has legitimate ownership.
  Safe when: A complete Chapter 1-2 no-skip playthrough identifies which ordinary
  dialogue bridges remain useful and confirms relationship unlocks come from
  explicit story/dialogue flags rather than talk counts.
  Follow-up: Remove only obsolete bridge records; do not replace optional topic
  dialogue with mandatory screenplay duplicates.
  Validation: `scripts/StoryRuntimeCheck.mjs`, manual Chapter 1-2 playthrough.

- [planned] [P2] material, token, service-object, and quest-proof classification
  Reason: Some legacy material-shaped records may actually be service objects,
  dungeon tokens, casino tickets, repair objects, keepsakes, or passive unlocks.
  Safe when: Each candidate has a stable acquisition source and an approved use
  or destination category.
  Follow-up: Reclassify or remove candidates only during their owning schema pass.
  Validation: `scripts/ItemFlowCheck.mjs`, `scripts/DataConsistencyCheck.mjs`.

Completed story/data removals retained as guardrails:

- The old fifteen-part main quest chain, `QuestSpineFramework.js`,
  `ChapterOneRoutePlan.js`, and obsolete route adapters are removed.
- `assassin_blade` equipment and `assassin_blade_fragment` material are separate.
- `wolf_fang` is material-only; its necklace is a crafted result.
- Forge material identity comes from `Materials.js`; shop records own price only.
- `old_sword` and `old_armor` are removed without compatibility aliases.

## High-Confidence Cleanup

- [removed] [P1] old `art-v2` sheet/crop pipeline
  Reason: Runtime assets use one-subject files under `src/assets/images/art/` and
  generation rules in `IMAGE_GENERATION_PROMPTS.md`.
  Safe when: The cropper, queue, raw sheet input, crop manifests, and build scripts
  have no active references.
  Follow-up: Do not recreate `art-v2` or an image-fallback layer.
  Validation: `rg "asset-cropper|art-v2|art-asset-queue|incoming/raw" -n .`,
  `scripts/BetaConvergenceCheck.mjs`.

- [removed] [P1] obsolete per-form baseline blueprint files
  Reason: Every ten-level baseline craft series now uses one shared blueprint that
  depicts sword, dagger, heavy, lance, and focus together.
  Safe when: Recipe discovery resolves through the series blueprint id and the
  formal audit has zero blueprint gaps.
  Follow-up: Preserve individual finished-weapon images; do not restore
  `*_series_sword.webp`, `*_series_dagger.webp`, and similar blueprint fallbacks.
  Validation: `scripts/FormalWeaponCatalogAudit.mjs`,
  `scripts/AssetCoverageCheck.mjs`.

## Medium-Confidence Cleanup

- [removed] [P2] `src/js/data/ContentRebuildDatabase.js`
  Reason: It duplicated older Lv1-Lv70 planning and had no active imports.
  Safe when: Live chapter, monster, weapon, material, and dungeon data own the
  implemented structure.
  Follow-up: Do not recreate a second broad progression database.
  Validation: `scripts/BetaConvergenceCheck.mjs`.

- [removed] [P2] `src/js/data/ProgressionLevels.js`
  Reason: The compatibility level-stretch layer was replaced by live database
  values. Removed on 2026-07-07.
  Safe when: No runtime file imports `ProgressionLevels.js` or
  `applyLegacyLevelProgression`.
  Follow-up: Edit owning databases directly when balance resumes.
  Validation: `rg "ProgressionLevels|applyLegacyLevelProgression" src scripts`,
  `scripts/DataConsistencyCheck.mjs`.

- [removed] [P2] unused legacy system exports
  Reason: `AffixSystem`, `DungeonSystem`, and `EnhancementSystem` compatibility
  exports had no active imports. Removed on 2026-07-07.
  Safe when: Reference scans remain empty.
  Follow-up: Do not restore aliases without an approved runtime owner.
  Validation: `scripts/DataConsistencyCheck.mjs`.

- [deferred] [P2] drop-pool compatibility wrappers
  Reason: `DropManager.js` still accepts legacy-friendly drop-pool object shapes.
  Safe when: All active drop producers use one canonical schema.
  Follow-up: Remove wrappers only during a dedicated drop-schema pass.
  Validation: `scripts/FirstRunLootCheck.mjs`, `scripts/DataConsistencyCheck.mjs`.

## Do Not Remove Just Yet

- Tower runtime files. Tower is paused, not deleted.
- Second-run external Boss capacity and achievement interfaces. They are reserved,
  not active content.
- Generic fallback variables and defensive guards that serve live runtime code.
- `src/assets/images/art-source/originals/` and runtime WebP assets under
  `src/assets/images/art/`.
- Registered reserve monsters merely because they are absent from first-run
  sampling.
- `characters/reserve/apothecary_assistant.webp` until the next explicit reserve
  character asset decision.

## Recommended Cleanup Sequence

1. Finish the Chapter 1-2 no-skip dialogue and relationship review.
2. Review the six crafted-result and five Boss-blueprint mapping gaps; remove only
   records proven obsolete.
3. Give `cursed_shard` an approved destination during the item-flow pass.
4. Clean drop wrappers only after every active producer uses one schema.
5. Revisit `Events.js` zone classifications only during the event-system rewrite.
6. Run reference scans and focused validation after every removal.
