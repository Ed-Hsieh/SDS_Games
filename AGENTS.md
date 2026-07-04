# SDS_Games Agent Handoff

This repository is being rebuilt as a desktop-focused 2D RPG. Future Codex or
agent sessions should read this file before editing content or asset systems.

## Current User Preferences

- Build for desktop only. Do not spend time on mobile UI unless the user asks.
- When a system or interface is wrong at its core, fix the core logic instead
  of piling workaround layers on top.
- Preserve the current dark realistic fantasy image style that was generated
  for materials and equipment.
- Do not make every special weapon a sword. Spread special drops across weapon
  types, armor, accessories, materials, and systems.

## Asset Structure

- Primary generated asset folder: `src/assets/images/art/`
- Temporary legacy fallback folder: `src/assets/images/art-v2/`
- Do not delete `art-v2` until every referenced asset has been regenerated and
  marked ready in `src/js/data/AssetManifest.js`.
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
- Keep light and void as high-tier elements:
  - `shadow` is the weak precursor to `void`.
  - `glimmer` is the weak precursor to `light`.
  - Shadow materials should begin around Lv24-30, not Lv1-10.

## Current Art Progress

The new `art` folder is active through `AssetManifest.js`, with fallback to
`art-v2` for unfinished assets.

Completed new material WebP assets: 50 / 95.

Ready material IDs:

```text
slime_jelly, beast_hide, raw_meat, goblin_ear, iron_ore,
wolf_pelt, wolf_fang, spider_silk, poison_gland, ancient_bark,
life_seed, guardian_branch, forest_essence, bone_fragment, ectoplasm,
spirit_essence, golem_core, stone_fragment, lich_phylactery, goblin_coin,
orc_fang, rat_tail, bat_wing, iron_shard, high_ore,
rare_metal, forge_core, dark_crystal, shadow_shard, soul_fragment,
cursed_shard, dark_steel, shadow_arrow, shadow_essence, magic_crystal,
commander_blade, shadow_core, ancient_gear, mithril_ore, crystal_shard,
pure_crystal, ancient_rune, glimmer_shard, rune_stone, titan_heart,
ancient_artifact, fire_essence, ember_stone, ice_essence, frost_crystal
```

Suggested next material batch:

```text
frost_core, thunder_essence, storm_crystal, storm_essence, earth_essence
```

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
