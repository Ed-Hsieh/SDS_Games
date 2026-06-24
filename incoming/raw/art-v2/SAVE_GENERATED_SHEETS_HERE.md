# Save Generated Sheets Here

Save each generated image into this folder with the exact filename shown in the generation message.

Rules:

- Do not rename files.
- Keep the generated image as PNG if possible.
- Do not crop manually.
- Do not resize manually.
- Do not save screenshots if the original image download is available.
- If the tool only lets you save as `.webp`, tell Codex before cropping.

After all sheets are saved, tell Codex:

`已經全部放入 incoming/raw/art-v2`

Codex will then:

1. Build crop manifests from the grid configs.
2. Validate every source image.
3. Crop into `src/assets/images/art-v2/**/*.webp`.
4. Run `AssetCoverageCheck`.
