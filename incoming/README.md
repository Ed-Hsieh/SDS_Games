# Incoming Assets

`incoming/raw/` is the staging area for original or user-provided images before they are cropped into game-ready WebP assets.

## Current Folders

- `incoming/raw/art-v2/` - strict-grid source sheets for the current WebP art replacement pass.
- `incoming/raw/assets-index.json` - generated source index used by the browser cropper.
- `incoming/previews/` - temporary preview output for visual review.

Do not place runtime assets here. Final game images belong under:

```text
src/assets/images/art-v2/
```

## Workflow

1. Put source sheets in `incoming/raw/art-v2/`.
2. Refresh the source index:

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File scripts\inventory-raw-assets.ps1
   ```

3. Open the cropper:

   ```text
   scripts/tools-ui/asset-cropper.html
   ```

4. Update or generate the crop manifest.
5. Apply crops:

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File scripts\apply-asset-crops.ps1 `
     -Manifest scripts\asset-crops\art-v2\generated\combined.manifest.json
   ```

6. Verify coverage:

   ```powershell
   node scripts\AssetCoverageCheck.mjs
   ```

The current art pipeline does not keep old generated PNG imports, atlas files, or archived pre-Art-V2 runtime assets.
