# Art V2 Crop Workflow

This folder contains strict-grid crop configs for the WebP art replacement pass.

## Current Rules

- Equipment, materials, items, clues, monsters, effects: strict `5x5`.
- Portraits: strict `3x3`.
- Empty cells stay empty.
- Output format is WebP.
- Existing in-game references point to `src/assets/images/art-v2/`.

## Generated Batch Index

`generated/index.json` lists every source sheet needed to rebuild the current game asset set.

Each batch has:

- `source` - where the generated raw sheet should be saved.
- `prompt` - prompt to generate that raw sheet.
- `config` - grid config used to build a crop manifest.

## Applying One Sheet

Example for the first equipment sheet:

```powershell
# 1. Save the generated sheet here:
# incoming/raw/art-v2/equipment-sheet-01.png

# 2. Build a crop manifest from the sheet dimensions.
node scripts\build-grid-crop-manifest.mjs `
  scripts\asset-crops\art-v2\generated\equipment-sheet-01.grid.json `
  scripts\asset-crops\art-v2\generated\equipment-sheet-01.manifest.json

# 3. Validate the crop.
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\apply-asset-crops.ps1 `
  -Manifest scripts\asset-crops\art-v2\generated\equipment-sheet-01.manifest.json `
  -DryRun

# 4. Apply WebP crops into src/assets/images/art-v2/equipment.
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\apply-asset-crops.ps1 `
  -Manifest scripts\asset-crops\art-v2\generated\equipment-sheet-01.manifest.json
```

## Verifying Game Coverage

```powershell
node scripts\AssetCoverageCheck.mjs
```

The check must have no missing mappings, missing files, or dimension warnings before old assets are removed.

## Cleanup Rule

Runtime code should reference only files under `src/assets/images/art-v2/`.
Do not add old generated PNG paths, atlas fallback paths, or conversion manifest paths back into the project.
