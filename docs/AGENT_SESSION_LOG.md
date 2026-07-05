# Agent Session Log

Last updated: 2026-07-04

This file records the working context that should be preserved across machines
and future Codex sessions. It is a distilled handoff, not a verbatim transcript.

## Design Direction Confirmed With User

- The game should focus on desktop development only.
- Asset rebuilding should use a clean `art` structure, not `art-v3`.
- The old `art-v2` folder remains only as a fallback while regeneration is
  incomplete.
- Original high-resolution generated PNG files should be kept locally in the
  project for re-export workflows, but ignored by Git.
- Runtime WebP files are the assets that should be referenced by the game.
- The user likes the current generated dark realistic fantasy style and wants
  it preserved.

## Combat And System Backlog

- Battle presentation should be an independent popup/overlay, not split into the
  lower screen area.
- Drop rates and durability should be reduced from the current too-easy balance.
- Slime Sword lifesteal should be stronger, around 3-5 HP instead of 1.
- Critical hits are too frequent and can trivialize fights.
- Weapon categories need differentiated special mechanisms so combat is not just
  waiting for bars.
- Monster stats may need to rise once weapon mechanics are added.
- Horizontal HP recovery currently showing as 0 needs correction.

## Casino And Reward Backlog

- Casino should motivate players through tickets, prize pools, and visible
  strong rewards, not just side-quest unlocks.
- Prize pools should expose probability tables:
  - Normal: 60%
  - Advanced: 25%
  - Rare: 10%
  - Super Rare: 4%
  - Jackpot: 1%
- Prize pools need unique equipment and legendary items, but strength should
  match chapter progression, not become endgame gear too early.
- Casino display cases should show powerful items. Approaching a case should
  trigger the casino owner long side quest. Completion allows selecting one
  display item.
- Casino interiors should feel like moving between places using multiple images,
  similar to the market-side-stall idea.

## Quest Reward Direction

- Side quests should have rewards matching their story content.
- Very short side quests can give ordinary rewards.
- Medium and long side quests should unlock meaningful systems, skills,
  equipment, items, maps, lobby functions, or other story-matched rewards.
- Existing main and side quests still need review for story-reward alignment.

## World And Element Direction

- Equipment and monster progression should be organized around Lv1-70 monster
  groups, then equipment clusters, then materials.
- Dungeon identity matters. Dungeons should drop special equipment, materials,
  and craftables, and should be difficult enough that players use crafting,
  enhancement, casino rewards, elite drops, or exploration to prepare.
- Light and Void are higher-tier elements.
- Fire, Ice, Thunder, and Poison are roughly equal lower-tier elements.
- `shadow` is the weaker precursor to `void`.
- `glimmer` is the weaker precursor to `light`.
- `shadow_shard` should not appear in Lv1-10. It belongs around Lv24-30 with the
  shadow soldier group.
- A Lv70 light dungeon is planned to counterbalance the Endless Tower and make
  light progression important before tower DLC.

## Asset Work Completed

The current asset resolver uses:

- `src/assets/images/art/` as primary generated output.
- `src/assets/images/art-v2/` as fallback.
- `src/assets/images/art-source/originals/` as local ignored original PNG store.

Completed new material WebP assets: 55 / 95.

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
ancient_artifact, fire_essence, ember_stone, ice_essence, frost_crystal,
frost_core, thunder_essence, storm_crystal, storm_essence, earth_essence
```

Original PNGs for these 55 materials were copied to:

```text
src/assets/images/art-source/originals/materials/
```

This folder is intentionally ignored by Git.

## Next Asset Queue

Continue material generation from:

```text
geo_crystal, elemental_core, primal_essence, wyvern_scale, wyvern_wing
```

After that, continue through the remaining material queue from
`docs/generated/art-asset-queue.json`, then equipment, blueprints, crafted items,
shop items, monsters, town places, and scenes.

## Validation Commands

```powershell
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\AssetCoverageCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\DataConsistencyCheck.mjs
```

## 2026-07-05 Checkpoint - Monster / Weapon / Dungeon Data Fill

User requested: first fill monster shortages, then add weapons, complete dungeon settings, and finally check material image gaps. Work was interrupted intentionally after validation started; continue from this checkpoint.

Files changed in this pass:

- `src/js/data/Monsters.js`
- `src/js/data/Materials.js`
- `src/js/data/Equipment.js`
- `src/js/data/Dungeons.js`
- `src/js/data/AssetManifest.js`
- `src/js/data/ContentRebuildDatabase.js`

Completed data additions:

- Added monster elements `void` and `light`.
- Added 10 planned monsters into the live monster database:
  - `glimmer_sprite`
  - `rune_wisp`
  - `prism_wisp`
  - `starvein_lurker`
  - `void_walker`
  - `abyssal_seraph`
  - `dawn_sentinel`
  - `radiant_keeper`
  - `mirror_seraph`
  - `aurora_archon`
- Added 6 planned materials into the live material database:
  - `vine_core`
  - `demon_core`
  - `radiant_thread`
  - `light_essence`
  - `radiant_shard`
  - `radiant_core`
- Added 16 equipment entries, including 14 weapon / focus-type drops and 2 armor pieces:
  - `miners_pickhammer`
  - `cave_ward_shield`
  - `glimmer_lampstaff`
  - `rune_scriber_focus`
  - `frostbite_dueling_blade`
  - `frostbound_scepter_drop`
  - `shadowneedle_dagger`
  - `umbral_pike`
  - `shade_focus`
  - `thornhook_claws`
  - `hydra_spine_spear`
  - `abyssal_needle`
  - `seraph_void_focus`
  - `dawnbrand_sword`
  - `prism_focus`
  - `aurora_ward_plate`
- Added / expanded set definitions:
  - new `cave_miner`
  - new `early_frost`
  - new `glimmer_initiate`
  - expanded `shadow_legion`
  - new `jungle_life`
  - new `abyss_precursor`
  - new `radiant_vow`
- Added the sixth live dungeon:
  - `DungeonType.RADIANT_CORRIDOR`
  - entrance config `radiant_corridor`
  - dungeon data with floors, mechanics, environment, monster pools, boss, treasures, theme
  - spawn cooldown and boss-zone placement
- Updated `AssetManifest.js` indexes for new equipment, materials, monsters, and `dungeon_radiant_corridor`.
- Updated `ContentRebuildDatabase.js` so previously planned monsters/materials/dungeon now report as existing. `listPlannedContentGaps()` returned no planned gaps after this pass.

Validation already run:

```text
scripts\DataConsistencyCheck.mjs
Result: Data consistency check passed.
```

Runtime smoke test already run:

- `radiant_corridor` resolves via `getDungeonByType`.
- Recommendation level stretches to 70.
- Common, elite, and boss generation all returned valid combat instances.
- `radiant_vow` set resolves with `dawnbrand_sword`, `prism_focus`, `aurora_ward_plate`.

Latest counts after this pass:

```text
Monsters: 53
Equipment: 62
Weapons: 38
Materials: 101
Dungeons: 6
Live planned monsters: 10 / 10
Live planned materials: 6 / 6
Planned content gaps: none
```

Current material image gap after adding new materials:

```text
radiant_thread
light_essence
radiant_shard
radiant_core
demon_core
vine_core
```

Important unfinished follow-ups:

- New material images above still need to be generated / linked.
- New equipment and new monster images still need generation.
- `BlueprintDrops.js` was not yet updated for the new monsters/equipment.
- Dungeon monster reverse equipment drops are incomplete. `DataConsistencyCheck` passes, but `EquipmentBalanceCheck` warned that several new `dropFrom` references point to dungeon-only monsters that the balance checker does not understand, such as `rock_golem`, `shadow_lurker`, `frost_giant`, `ice_dragon`, `vine_beast`, and `jungle_hydra`.
- Decide whether to add explicit `equipmentDrops` onto dungeon monster entries or update the balance checker to understand dungeon-scoped IDs like `cave:rock_golem`.
- `EquipmentBalanceCheck.js` ran and reported many existing old balance warnings. New set pieces mostly read as weak by single-piece score, which may be acceptable because they are set-oriented, but this has not been tuned.
- `MonsterBalanceCheck_v4.js` ran. Many old normal monsters still read as too soft. New light dungeon normal/elite monsters were mostly OK, but `aurora_archon` reads too lethal by the current script and needs later tuning.
- Full `AssetCoverageCheck.mjs` was not run after this pass. Expect missing files for new materials, new equipment, new monsters, and `dungeon_radiant_corridor`.

Recommended next step:

1. Do not continue broad refactors first.
2. Fix / decide dungeon-scoped drop source handling.
3. Add blueprint drops or equivalent acquisition paths for new special equipment.
4. Generate missing material images first, then new weapon and monster images.
5. Re-run `DataConsistencyCheck.mjs`, `EquipmentBalanceCheck.js`, `MonsterBalanceCheck_v4.js`, and finally `AssetCoverageCheck.mjs`.

## 2026-07-05 Asset Continuation Checkpoint

Files updated in this continuation:

- `AGENTS.md`
- `docs/AGENT_SESSION_LOG.md`
- `docs/OPEN_TASKS.md`
- `scripts/EquipmentBalanceCheck.js`
- `src/js/data/AssetManifest.js`
- `src/js/data/BlueprintDrops.js`
- `src/js/data/Dungeons.js`
- `src/js/data/Equipment.js`
- `src/js/data/Monsters.js`
- `src/assets/images/art/items/materials/*.webp`
- `src/assets/images/art/items/equipment/*.webp`
- `src/assets/images/art/entities/monsters/*.webp`

Data/source-link work completed:

- Added dungeon-scoped equipment drop handling to `EquipmentBalanceCheck.js`.
- Added reverse `equipmentDrops` for dungeon-only monsters where needed.
- Added blueprint acquisition links for the new monsters and special equipment.
- Removed the high-level `rune_keeper` source from `rune_scriber_focus`.
- Moved `thornhook_claws` away from common `jungle:vine_beast` and onto
  `starvein_lurker` / `jungle:jungle_hydra`.
- Added `level: 52` to `jungle:jungle_hydra` so its boss drop timing matches
  the jungle dungeon end range.
- Tuned the new special equipment stats so the watched new items now grade OK
  in `EquipmentBalanceCheck.js`.

Image work completed:

- Generated and linked the 6 missing new material images:
  `vine_core`, `demon_core`, `radiant_thread`, `light_essence`,
  `radiant_shard`, `radiant_core`.
- Generated and linked all 16 content-rebuild equipment images:
  `miners_pickhammer`, `cave_ward_shield`, `glimmer_lampstaff`,
  `rune_scriber_focus`, `frostbite_dueling_blade`,
  `frostbound_scepter_drop`, `shadowneedle_dagger`, `umbral_pike`,
  `shade_focus`, `thornhook_claws`, `hydra_spine_spear`,
  `abyssal_needle`, `seraph_void_focus`, `dawnbrand_sword`,
  `prism_focus`, `aurora_ward_plate`.
- Generated and linked all 10 new content-rebuild monster images:
  `glimmer_sprite`, `rune_wisp`, `prism_wisp`, `starvein_lurker`,
  `void_walker`, `abyssal_seraph`, `dawn_sentinel`, `radiant_keeper`,
  `mirror_seraph`, `aurora_archon`.
- Two generated monster variants were intentionally not linked:
  the first `abyssal_seraph` and first `radiant_keeper` were too close to boss
  presentation. They remain only in the default Codex generated image folder.

Current art coverage:

```text
Materials: 101 / 101 MaterialDatabase ids have runtime WebP files.
Material runtime files: 104, with extra cold_resist_potion, enhance_stone, fire_resist_potion.
New rebuild equipment ready: 16 / 16.
All EquipmentDatabase runtime art files in new art folder: 16 / 62.
New rebuild monsters ready: 10 / 10.
All MonsterDatabase runtime art files in new art folder: 10 / 53.
Remaining legacy/live equipment art gaps: 46.
Remaining legacy/live monster art gaps: 43.
```

Validation run after this continuation:

```text
scripts\DataConsistencyCheck.mjs
Result: Data consistency check passed.

scripts\EquipmentBalanceCheck.js --json
Result: ran successfully.
Summary: items 62, issues 19, notes 34.
Coverage: equipmentWithKnownSource 61/62, monsterDropLinks 88,
craftedResultLinks 47, questRewardLinks 4, blueprintSourceLinks 110.

scripts\MonsterBalanceCheck_v4.js
Result: ran successfully.
Summary: Flagged 36 / 53.
New rebuild monsters mostly pass at the high end:
`starvein_lurker`, `void_walker`, `abyssal_seraph`, `dawn_sentinel`,
`radiant_keeper`, and `mirror_seraph` report OK.
Known new-monster follow-ups: `glimmer_sprite`, `rune_wisp`, and
`prism_wisp` are soft normal mobs; `aurora_archon` is still too lethal by the
current script.
```

Known remaining issues:

- The remaining `EquipmentBalanceCheck.js` issues are old/legacy items, not the
  newly added watched rebuild equipment.
- `old_armor` still has no traceable source.
- Some old tower or boss sources still make early weapons look too late/weak:
  `goblin_dagger`, `wolf_fang_blade`, and `frost_blade`.
- Several old high-tier items still grade weak and need a separate legacy
  equipment tuning pass.
- `MonsterBalanceCheck_v4.js` still reports 36 / 53 flagged monsters. Most are
  old soft normal mobs. `aurora_archon` remains a later boss tuning target.
- Full `AssetCoverageCheck.mjs` was not run because 46 equipment and 43 monster
  images are intentionally still missing from the new `art` folder.

Recommended next step:

1. Generate legacy/live monster images next, following the existing monster art
   rules.
2. Then generate the remaining 46 legacy/live equipment images.
3. Regenerate the radiant dungeon card/full scene image.
4. Run `AssetCoverageCheck.mjs` only after those remaining assets are linked.

## 2026-07-05 Legacy Art Replacement Pass 1

User reminder:

- Keep the dark realistic fantasy look from the reference crystal-armored
  figure.
- Monster pose/action should vary by weapon and creature type. Dagger, sword,
  axe, heavy body, flying, crawling, and root-walking enemies should not share
  the same posture.
- Monster art hierarchy remains:
  - Mainline bosses: full large illustration style, most oppressive and ornate.
  - Elites: may have scene dressing, but less ornate than mainline bosses.
  - Normal mobs: no background or extremely minimal dark background, clear body.

Generated and linked old monster replacements in this pass:

```text
slime, goblin, wild_wolf, skeleton, giant_rat,
orc_warrior, shadow_bat, poison_spider, stone_golem_mini, treant
```

Generated and linked old equipment replacements in this pass:

```text
old_sword, old_armor, slime_sword, goblin_dagger, wolf_fang_blade,
wolf_pelt_armor, spider_silk_gloves, forest_guardian_staff,
forest_guardian_crown, bone_sword
```

Current art coverage after this pass:

```text
All EquipmentDatabase runtime art files in new art folder: 26 / 62.
All MonsterDatabase runtime art files in new art folder: 20 / 53.
Remaining legacy/live equipment art gaps: 36.
Remaining legacy/live monster art gaps: 33.
```

Validation run after this pass:

```text
scripts\DataConsistencyCheck.mjs
Result: Data consistency check passed.

Manifest spot check:
badEquipment: []
badMonsters: []
```

Recommended next batch:

- Monsters:
  `forest_guardian`, `skeleton_warrior`, `ghost`, `stone_golem`, `lich`.
- Equipment:
  `ghost_cloak`, `lich_staff`, `shadow_blade_drop`, `shadow_armor_drop`,
  `shadow_badge`.
