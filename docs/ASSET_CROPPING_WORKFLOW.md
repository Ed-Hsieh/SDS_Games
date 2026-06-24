# Asset Cropping Workflow

This project now uses the Art V2 WebP asset pipeline only.

## Current Output

All runtime images should live under:

```text
src/assets/images/art-v2/
```

Common categories:

| Category | Output folder |
| --- | --- |
| Equipment | `src/assets/images/art-v2/equipment/` |
| Materials | `src/assets/images/art-v2/materials/` |
| Blueprints | `src/assets/images/art-v2/blueprints/` |
| Shop items | `src/assets/images/art-v2/shop-items/` |
| Crafted items | `src/assets/images/art-v2/crafted-items/` |
| Clues | `src/assets/images/art-v2/clues/` |
| Town places | `src/assets/images/art-v2/town-places/` |
| Portraits | `src/assets/images/art-v2/portraits/` |
| Monsters | `src/assets/images/art-v2/monsters/` |
| Dungeon scenes | `src/assets/images/art-v2/dungeon-zone-scenes/` |
| World landmarks | `src/assets/images/art-v2/world-landmarks/` |
| Map props | `src/assets/images/art-v2/map-props/` |
| Story relics | `src/assets/images/art-v2/story-relics/` |
| Combat effects | `src/assets/images/art-v2/combat-effects/` |
| Backgrounds | `src/assets/images/art-v2/backgrounds/` |

The game should not reference old generated PNG folders, atlas images, or conversion manifests.

## Raw Sheets

Place new source sheets in:

```text
incoming/raw/art-v2/
```

Then rebuild the raw index:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\inventory-raw-assets.ps1
```

## Grid Rules

- Equipment, materials, items, clues, monsters, and effects use strict `5x5` sheets.
- Portraits use strict `3x3` sheets.
- Empty cells stay empty.
- Cropped runtime files are encoded as WebP.

## Build A Manifest

Each generated grid config lives in:

```text
scripts/asset-crops/art-v2/generated/
```

Build one crop manifest:

```powershell
node scripts\build-grid-crop-manifest.mjs `
  scripts\asset-crops\art-v2\generated\equipment-sheet-01.grid.json `
  scripts\asset-crops\art-v2\generated\equipment-sheet-01.manifest.json
```

Preview it:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\apply-asset-crops.ps1 `
  -Manifest scripts\asset-crops\art-v2\generated\equipment-sheet-01.manifest.json `
  -DryRun
```

Apply it:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\apply-asset-crops.ps1 `
  -Manifest scripts\asset-crops\art-v2\generated\equipment-sheet-01.manifest.json
```

## Build All Current Crops

The combined manifest is:

```text
scripts/asset-crops/art-v2/generated/combined.manifest.json
```

Apply every current crop:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\apply-asset-crops.ps1 `
  -Manifest scripts\asset-crops\art-v2\generated\combined.manifest.json
```

## Verify Coverage

Run this before removing or replacing assets:

```powershell
node scripts\AssetCoverageCheck.mjs
```

The check must report no missing mappings, no missing files, and no dimension warnings.
