# SDS_Games Agent Handoff

Last updated: 2026-07-06

This repository is being rebuilt as a desktop-focused 2D RPG. Future Codex or
agent sessions should read this file before editing content or asset systems.

## Current User Preferences

- Build for desktop only. Do not spend time on mobile UI unless the user asks.
- When a system or interface is wrong at its core, fix the core logic instead
  of piling workaround layers on top.
- Do not add legacy soft-compatibility layers for obsolete town, shop, market,
  casino, or dialogue systems. If the old code/data is stale, remove it and
  write the new core flow directly.
- The broken-town script, NPC dialogue, town map interactions, shop/market
  recovery, casino temptation loop, and later added town modules must progress
  together as one recovery network.
- Backpack and commission-helper systems are not part of the first town
  rebuild unless the user explicitly asks.
- Preserve the current dark realistic fantasy image style that was generated
  for materials and equipment.
- Do not make every special weapon a sword. Spread special drops across weapon
  types, armor, accessories, materials, and systems.

## Current Documentation Authority

Read these documents before continuing town, quest, casino, or asset-direction
work:

- `docs/TOWN_REBUILD_CONVERGENCE.md`
- `docs/CHAPTER_QUEST_FRAMEWORK.md`
- `docs/CASINO_ROUTE_FRAMEWORK.md`
- `docs/ART_STYLE_GUIDE.md`
- `docs/IMAGE_GENERATION_PROMPTS.md`
- `docs/OBSOLETE_CLEANUP_PLAN.md`
- `docs/AGENT_SESSION_LOG.md`
- `docs/AGENT_UPDATE_PROTOCOL.md`

Older broad planning docs were removed on 2026-07-05 so future sessions do not
inherit conflicting design directions. Runtime data remains the source of truth
when an MD file and JS data disagree.

When updating project documentation, follow `docs/AGENT_UPDATE_PROTOCOL.md`.
Do not invent new progress formats or new planning files when an authoritative
document already owns the topic.
Progress/checkpoint docs are manual handoffs: update them only when the user
explicitly asks to record progress, update a handoff, or change documentation
rules.

## Asset Structure

- Primary generated asset folder: `src/assets/images/art/`
- Legacy fallback folders should not be kept as a design strategy. Once a
  system or asset path is replaced, point data at `src/assets/images/art/` and
  remove obsolete references instead of layering fallbacks.
- Local original PNG sources copied from Codex image generation live under:
  `src/assets/images/art-source/originals/`
- The original PNG source folder is intentionally gitignored. Runtime WebP
  assets under `src/assets/images/art/` are the committed game assets.

## Image Generation Rules

- Use built-in image generation unless the user explicitly requests another
  path.
- Materials and equipment use dark realistic fantasy RPG inventory art:
  centered subject, readable silhouette, moody dark neutral background, no text,
  no UI frame, no watermark.
- Monster image rules:
  - Mainline bosses keep the full large illustration style.
  - Non-main bosses and elite monsters may have scene dressing, but should be
    less ornate than mainline bosses.
  - Normal mobs can have no background.
- Boss-dropped equipment should visually match the item held or worn by that
  boss. For example, `lich_staff` should look like the staff visible in the
  `lich` boss illustration, not a separate redesign.
- Keep light and void as high-tier elements:
  - `shadow` is the weak precursor to `void`.
  - `glimmer` is the weak precursor to `light`.
  - Shadow materials should begin around Lv24-30, not Lv1-10.

## Current Art Status

The new `art` folder is the active runtime asset source through
`AssetManifest.js`. Do not reintroduce `art-v2` fallback behavior; unfinished
assets should be listed as gaps and regenerated into `art`.

Image generation is paused during the current town-rebuild documentation pass.
Use `docs/ART_STYLE_GUIDE.md` for style direction and current example paths.
Use `docs/IMAGE_GENERATION_PROMPTS.md` for prompt templates and category
standards when image work resumes.

## Verification

Run these after asset or manifest changes:

```powershell
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\AssetCoverageCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\DataConsistencyCheck.mjs
```

Optional path spot check:

```powershell
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --input-type=module -e "import { MaterialDatabase } from './src/js/data/Materials.js'; import { getGeneratedItemImage } from './src/js/data/AssetManifest.js'; for (const id of ['pure_crystal','ancient_rune','glimmer_shard']) console.log(id + ' -> ' + getGeneratedItemImage({ ...MaterialDatabase[id], id }));"
```
