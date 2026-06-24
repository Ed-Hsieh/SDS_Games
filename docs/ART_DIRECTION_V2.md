# Art Direction V2

This pass replaces the old PNG asset set with WebP assets under `src/assets/images/art-v2/`.

## Global Style

- Dark fantasy RPG, painterly semi-realistic.
- Moody blue shadows with warm lantern, ember, gold, poison, frost, or violet accents.
- Clear silhouettes first, texture second.
- No text, numbering, watermark, UI frame, rarity frame, or decorative border inside the artwork.
- Rarity is expressed by material and glow only. UI rarity frames are handled by CSS.

## Output Format

- Final in-game assets use `.webp`.
- Icon crops keep the current target resolution unless a manifest says otherwise.
- Default item, material, clue, effect, monster crops: `512x512 WebP`.
- Portrait crops: `768x768 WebP` when generated from new 3x3 sheets.
- Backgrounds and scenes keep their source aspect ratio and resolution.

## Sheet Rules

### Equipment, Materials, Items, Clues, Effects, Monsters

- Sheet grid: strict `5x5`.
- Cell size: fixed and equal across the sheet.
- Less than 25 entries: leave unused cells blank.
- More than 25 entries: continue on the next sheet.
- Each subject is centered inside its own cell.
- Subject should occupy roughly 70-82% of the cell.
- No subject may overlap, cross cell boundaries, or touch the cell edge.
- No compressed bottom row, perspective-warped row, or auto-filled extra objects.

### Portraits

- Sheet grid: strict `3x3`.
- Cell size: fixed and equal across the sheet.
- Less than 9 entries: leave unused cells blank.
- Each character must have a distinct silhouette, age, facial structure, hairstyle, clothing shape, posture, prop, and expression.
- Avoid same-face character variants.

### Backgrounds

- Generated as standalone scene images, not crop sheets.
- Composition must match the interactive location layout when possible.
- Do not mix background sheets with icon sheets.

## Folder Rules

- Raw generated source sheets: `incoming/raw/art-v2/`
- Crop manifests: `scripts/asset-crops/art-v2/`
- Final game assets: `src/assets/images/art-v2/`

## Replacement Rules

1. Generate raw source sheets with strict grids.
2. Crop to WebP using the shared crop tools.
3. Verify coverage with `scripts/AssetCoverageCheck.mjs`.
4. Update game references to `src/assets/images/art-v2/.../*.webp`.
5. Remove obsolete PNG, atlas, and conversion artifacts after WebP coverage passes.
