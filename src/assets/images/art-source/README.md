# Art Source Originals

This directory documents local original image sources for regenerated SDS_Games
assets.

Original PNG files copied from Codex image generation are stored under:

```text
src/assets/images/art-source/originals/
```

That folder is intentionally ignored by Git because the files are large source
art. The committed runtime assets are the optimized WebP files under:

```text
src/assets/images/art/
```

Use the ignored originals when re-exporting multiple resolutions or replacing a
runtime WebP with a new compression/size target.

Use `docs/IMAGE_GENERATION_PROMPTS.md` when generating new originals.
