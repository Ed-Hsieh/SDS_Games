# Asset Crop Manifests

This folder contains crop manifests and helper metadata for rebuilding Art V2 WebP assets.

## Manifest Shape

```json
{
  "version": 1,
  "entries": [
    {
      "group": "equipment-sheet-01",
      "id": "old_sword",
      "category": "equipment",
      "source": "incoming/raw/art-v2/equipment-sheet-01.png",
      "crop": { "x": 0, "y": 0, "width": 512, "height": 512 },
      "resize": { "width": 512, "height": 512 },
      "note": "Optional editor note."
    }
  ]
}
```

Required fields are `id`, `category`, `source`, `crop`, and `resize`.

## Current Batch

The active replacement batch lives in:

```text
scripts/asset-crops/art-v2/generated/
```

Important files:

- `index.json` lists every source sheet.
- `combined.manifest.json` contains every current crop entry.
- `*.grid.json` files describe strict sheet grids.
- `*.manifest.json` files are generated from the grid configs.

## Apply Crops

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\apply-asset-crops.ps1 `
  -Manifest scripts\asset-crops\art-v2\generated\combined.manifest.json
```

Dry run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\apply-asset-crops.ps1 `
  -Manifest scripts\asset-crops\art-v2\generated\combined.manifest.json `
  -DryRun
```

## Validate

```powershell
node scripts\AssetCoverageCheck.mjs
```

Do not keep references to old generated PNG folders, old atlas sheets, or old conversion manifests in crop manifests.
