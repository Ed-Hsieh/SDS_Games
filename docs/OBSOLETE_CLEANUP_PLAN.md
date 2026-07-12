# Obsolete Cleanup Plan

Last updated: 2026-07-13

This plan records obsolete project pieces that are still present after the docs and
image-prompt standard were consolidated. It is a cleanup plan, not an instruction
to delete everything immediately.

## Cleanup Policy

- Prefer removing obsolete systems cleanly instead of keeping compatibility layers.
- Do not delete paused gameplay systems just because they are paused.
- Do not mix high-risk data rewrites with low-risk asset-pipeline cleanup.
- After every cleanup pass, run the relevant validation scripts and search for
  stale references.
- During the clean story rebuild, new resources require a proposal first. Do not
  add NPCs, monsters, materials, items, locations, or assets just to make a
  temporary story beat work.

## Story And Quest Cleanup

These are cleanup candidates for the accepted narrative reset. Do not remove all
of them in one risky pass; remove each layer when its replacement story or schema
is approved.

### Completed: Current Main Quest Chain Replacement

Current status:

- The old fifteen-part main quest chain is removed as canonical progression.
- `src/js/data/Quests.js` and `src/js/data/QuestStories.js` now expose seven
  reward-free, scene-driven chapter records.
- `src/js/data/NPCDialogues.js` remains for ordinary topic dialogue; mandatory
  screenplay scenes are owned by `StorySceneRegistry.js` and
  `StorySceneManager.js`.

Validation:

- Run `scripts/StoryRuntimeCheck.mjs`.
- Run `scripts/DataConsistencyCheck.mjs`.

### Completed: Legacy Quest And Route Spine

Current status:

- `src/js/data/QuestSpineFramework.js` and
  `src/js/data/ChapterOneRoutePlan.js` are removed and must not be recreated.
- `ChapterRegionRegistry.js` owns all seven handcrafted chapter regions and
  their scene bindings.
- Remaining `low / medium / high` strings in `Events.js` are legacy event-zone
  classifications, not the active adventure-map route identity. Review them only
  during an event-system rewrite.

Validation:

- Confirm the removed framework files do not exist.
- Run `scripts/StoryRuntimeCheck.mjs` and `scripts/DataConsistencyCheck.mjs`.

### In Progress: Relationship And Dialogue Patch Layers

Current status:

- Mandatory screenplay dialogue now comes from `StorySceneRegistry.js` and the
  layered presentation path in `DialogueManager.js`.
- `QuestScene.js` and `NPCDialogues.js` still own optional topic/report behavior
  and must not override mainline character arcs or reintroduce talk-count-based
  relationship progression.
- Finish this cleanup only after the Chapter 1-2 no-skip playthrough confirms
  which ordinary dialogue bridges remain useful.

Validation:

- Verify relationship records unlock from story/dialogue flags, not talk count
  meters.
- Verify accepted quests have explicit NPC or multi-speaker scripts.

### Planned: Material Classification Drift

Current status:

- Some old records named as materials may actually be service objects, dungeon
  tokens, casino tickets, quest proof objects, repair kits, relationship
  keepsakes, or achievement/passive unlocks.
- A material should have stable acquisition, no direct use by itself, and a clear
  recipe or crafting destination.

Validation:

- Reclassify or remove drifted records only during the matching item/schema pass.
- Run `scripts/DataConsistencyCheck.mjs` and recipe/drop checks after changes.

## High-Confidence Cleanup

These files/folders belong to the old `art-v2` sheet/crop pipeline. The current
standard is one-subject image generation guided by `IMAGE_GENERATION_PROMPTS.md`.

### Completed: Old `art-v2` Sheet/Crop Pipeline

Current status:

- Removed on 2026-07-09.
- The old raw sheet inputs, crop manifests, cropper UI, queue JSON, batch image,
  and crop/build scripts are gone.
- Runtime assets continue to use `src/assets/images/art/` through
  `AssetManifest.js`.

Removed paths:

- `incoming/raw/art-v2/`
- `incoming/raw/assets-index.json`
- `scripts/asset-crops/art-v2/generated/`
- `scripts/create-art-v2-sheet-plan.mjs`
- `scripts/apply-asset-crops.ps1`
- `scripts/build-grid-crop-manifest.mjs`
- `scripts/inventory-raw-assets.ps1`
- `scripts/tools-ui/asset-cropper.html`
- `docs/generated/art-asset-queue.json`
- `scripts/BuildArtQueue.mjs`
- `tmp-art-batch-shadow-glimmer-contact.png`

Follow-up completed:

- Updated `scripts/tools-ui/index.html` so it no longer links to the cropper.
- Search for `asset-cropper`, `art-v2`, `art-asset-queue`, and `incoming/raw`.

Validation:

```powershell
rg "asset-cropper|art-v2|art-asset-queue|incoming/raw" -n .
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\BetaConvergenceCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\AssetCoverageCheck.mjs
```

## Medium-Confidence Cleanup

These look obsolete or temporary, but should be removed only as part of a matching
data rewrite.

### Completed: `src/js/data/ContentRebuildDatabase.js`

Current status:

- Removed on 2026-07-07.
- The file had no active imports and duplicated older Lv1-Lv70 planning.
- Current direction lives in `CHAPTER_QUEST_FRAMEWORK.md`,
  `EQUIPMENT_SERIES_FRAMEWORK.md`, `ChapterQuestFramework.js`, and live
  monster/equipment/material/dungeon databases.

Validation:

- Search for `ContentRebuildDatabase`.
- Run `scripts/BetaConvergenceCheck.mjs`.

### Completed: `src/js/data/ProgressionLevels.js`

Current status:

- Removed on 2026-07-07.
- The former Lv30-to-Lv70 stretch has been written back into live monster,
  equipment, recipe, boss-equipment, and dungeon recommendation data.
- Runtime data files should no longer import a level-stretch compatibility layer.

Validation:

- Search for `ProgressionLevels` and `applyLegacyLevelProgression`.
- Run `scripts/DataConsistencyCheck.mjs`.

### Completed: Legacy System Exports

Current status:

- Removed on 2026-07-07.
- `AffixSystem`, `affixSystem`, `DungeonSystem`, `DungeonSystemClass`,
  `EnhancementSystem`, and `enhancementSystem` had no active imports.

Validation:

- Search for the removed export names.
- Run `scripts/DataConsistencyCheck.mjs`.

### Drop And Effect Compatibility

Current status:

- `DropManager.js` has legacy-friendly wrappers for drop pool objects.
- `EquipmentEffectResolver.js` no longer reads item-level legacy direct-stat keys.
  Tower boss equipment was migrated to `specialEffects` on 2026-07-07.

Recommended action:

- Clean drop compatibility only during a dedicated item/drop schema pass.

## Do Not Remove Just Yet

- Tower runtime files such as `TowerScene.js`, `TowerManager.js`, and tower data.
  Tower is paused, not deleted.
- Generic `fallback` variables and defensive code. Most are normal runtime guards,
  not obsolete systems.
- `src/assets/images/art-source/originals/`. This is intentionally gitignored and
  used for local source PNGs.
- Runtime WebP assets under `src/assets/images/art/`.

## Recommended Cleanup Sequence

1. Finish the Chapter 1-2 scene and dialogue playthrough before removing any
   remaining dialogue bridge.
2. Audit the one unreferenced reserve image,
   `characters/reserve/apothecary_assistant.webp`, during the next approved asset
   cleanup; do not mix it with the 20 registered but currently reserved monster
   images.
3. Clean drop compatibility only during the later reward/item schema pass.
4. Revisit `Events.js` zone classification only when the event system is rebuilt.
5. Run reference scans and validation after each focused removal.
