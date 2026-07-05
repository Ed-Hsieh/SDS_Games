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
- Boss-dropped equipment should visually match the item held or worn by that
  boss. For example, `lich_staff` should look like the staff visible in the
  `lich` boss illustration, not a separate redesign.
- Keep light and void as high-tier elements:
  - `shadow` is the weak precursor to `void`.
  - `glimmer` is the weak precursor to `light`.
  - Shadow materials should begin around Lv24-30, not Lv1-10.

## Current Art Progress

The new `art` folder is active through `AssetManifest.js`, with fallback to
`art-v2` for unfinished assets.

Current runtime WebP progress as of 2026-07-05:

- Materials: 101 / 101 database materials ready in `ART_READY.materials`.
  `src/assets/images/art/items/materials/` currently has 104 WebP files because
  `cold_resist_potion`, `enhance_stone`, and `fire_resist_potion` exist as
  extra runtime item art outside `MaterialDatabase`.
- New content-rebuild equipment: 16 / 16 ready in `ART_READY.equipment`:
  `miners_pickhammer`, `cave_ward_shield`, `glimmer_lampstaff`,
  `rune_scriber_focus`, `frostbite_dueling_blade`,
  `frostbound_scepter_drop`, `shadowneedle_dagger`, `umbral_pike`,
  `shade_focus`, `thornhook_claws`, `hydra_spine_spear`,
  `abyssal_needle`, `seraph_void_focus`, `dawnbrand_sword`,
  `prism_focus`, `aurora_ward_plate`.
- New content-rebuild monsters: 10 / 10 ready in `ART_READY.monsters`:
  `glimmer_sprite`, `rune_wisp`, `prism_wisp`, `starvein_lurker`,
  `void_walker`, `abyssal_seraph`, `dawn_sentinel`, `radiant_keeper`,
  `mirror_seraph`, `aurora_archon`.
- Legacy/live equipment replacement started. Additional ready equipment:
  `old_sword`, `old_armor`, `slime_sword`, `goblin_dagger`,
  `wolf_fang_blade`, `wolf_pelt_armor`, `spider_silk_gloves`,
  `forest_guardian_staff`, `forest_guardian_crown`, `bone_sword`.
- Legacy/live monster replacement started. Additional ready monsters:
  `slime`, `goblin`, `wild_wolf`, `skeleton`, `giant_rat`,
  `orc_warrior`, `shadow_bat`, `poison_spider`, `stone_golem_mini`,
  `treant`.
- Legacy/live replacement pass 2 ready equipment:
  `ghost_cloak`, `lich_staff`, `shadow_blade_drop`, `shadow_armor_drop`,
  `shadow_badge`. `wolf_fang_blade` was regenerated so it reads as a real
  cutting blade rather than a tooth mounted to a handle.
- Legacy/live replacement pass 2 ready monsters:
  `forest_guardian`, `skeleton_warrior`, `ghost`, `stone_golem`, `lich`.

Remaining new `art` gaps:

- Equipment still missing new WebP art: 31 legacy/live entries.
- Monsters still missing new WebP art: 28 legacy/live entries.
- The radiant dungeon scene/card art is still not regenerated.

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
