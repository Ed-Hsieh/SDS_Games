# Obsolete Cleanup Plan

Last updated: 2026-07-09

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

### Planned: Current Main Quest Chain As Canon

Current status:

- `src/js/data/Quests.js`, `src/js/data/QuestStories.js`, and
  `src/js/data/NPCDialogues.js` still contain playable scaffolding.
- The chain should be rewritten after the central mystery, Chapter 1 scenes,
  objective flow, and reward gates are approved.

Validation:

- Run `scripts/StoryRebuildPlanCheck.mjs`.
- Run quest, town, and data consistency checks after the replacement lands.

### Planned: Legacy Quest And Route Spine

Current status:

- `src/js/data/QuestSpineFramework.js` and `src/js/data/ChapterOneRoutePlan.js`
  may still provide useful structure, but their plot content is not final canon.
- Old low/medium/high/death route identity still appears in route, story, and DEV
  test code and should be retargeted to chapter or route-node ids.

Validation:

- Search for `low`, `medium`, `high`, and `death` only in route identity contexts.
- Run `scripts/StoryRebuildPlanCheck.mjs`.

### Planned: Relationship And Dialogue Patch Layers

Current status:

- `src/js/scenes/QuestScene.js` still has relationship depth behavior that can
  drift into artificial familiarity labels.
- `src/js/managers/DialogueManager.js` still has generic request/report dialogue
  bridges that should be replaced by explicit character scripts when quests are
  rebuilt.

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

1. Remove the old image sheet/crop pipeline.
2. Update tool UI links and any script references to the removed pipeline.
3. Run reference scans and validation.
4. Clean compatibility exports and legacy drop/effect wrappers during focused schema
   passes.
