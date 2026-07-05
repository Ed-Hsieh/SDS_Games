# Obsolete Cleanup Plan

Last updated: 2026-07-06

This plan records obsolete project pieces that are still present after the docs and
image-prompt standard were consolidated. It is a cleanup plan, not an instruction
to delete everything immediately.

## Cleanup Policy

- Prefer removing obsolete systems cleanly instead of keeping compatibility layers.
- Do not delete paused gameplay systems just because they are paused.
- Do not mix high-risk data rewrites with low-risk asset-pipeline cleanup.
- After every cleanup pass, run the relevant validation scripts and search for
  stale references.

## High-Confidence Cleanup

These files/folders belong to the old `art-v2` sheet/crop pipeline. The current
standard is one-subject image generation guided by `IMAGE_GENERATION_PROMPTS.md`.

Remove in the next asset-pipeline cleanup pass:

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

Follow-up after removing `scripts/tools-ui/asset-cropper.html`:

- Update `scripts/tools-ui/index.html` so it no longer links to the cropper.
- Search for `asset-cropper`, `art-v2`, `art-asset-queue`, and `incoming/raw`.

Suggested checks:

```powershell
rg "asset-cropper|art-v2|art-asset-queue|incoming/raw" -n .
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\BetaConvergenceCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\AssetCoverageCheck.mjs
```

## Medium-Confidence Cleanup

These look obsolete or temporary, but should be removed only as part of a matching
data rewrite.

### `src/js/data/ContentRebuildDatabase.js`

Current status:

- No active imports were found during the 2026-07-06 scan.
- It still contains older Lv1-Lv70 planning, tower lines, and stale/generated text.
- The newer direction now lives in `CHAPTER_QUEST_FRAMEWORK.md`,
  `ChapterQuestFramework.js`, and live database work.

Recommended action:

- Remove after confirming no unique data still needs to be migrated into the live
  monster/equipment/material/dungeon databases.

### `src/js/data/ProgressionLevels.js`

Current status:

- It stretches old Lv30 data into a Lv70 curve.
- It is still imported by `Equipment.js`, `Monsters.js`, `Recipes.js`,
  `Dungeons.js`, and `BossEquipment.js`.

Recommended action:

- Do not delete directly.
- First rewrite monster, equipment, recipe, boss-equipment, and dungeon data so
  their levels are native Lv1-Lv70.
- Then remove `ProgressionLevels.js` and its imports.

### Legacy System Exports

Current status:

- `AffixManager.js` exports `AffixSystem`.
- `DungeonManager.js` exports `DungeonSystem` / `DungeonSystemClass`.
- `EnhancementManager.js` exports `EnhancementSystem`.
- Several manager headers still mention that they were moved from old
  `*System.js` files.

Recommended action:

- Remove compatibility exports only after searching for active imports.
- Rename comments when the old migration history is no longer useful.

### Drop And Effect Compatibility

Current status:

- `DropManager.js` has legacy-friendly wrappers for drop pool objects.
- `EquipmentEffectResolver.js` still reads legacy direct-stat keys.

Recommended action:

- Clean these only during a dedicated item/drop schema pass.
- Do not remove while old item records still depend on direct stat keys.

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
4. Audit `ContentRebuildDatabase.js` for any unique data, then remove it if fully
   superseded.
5. Rewrite live level data to native Lv1-Lv70.
6. Remove `ProgressionLevels.js` and legacy level-stretch imports.
7. Clean compatibility exports and legacy drop/effect wrappers during focused schema
   passes.
