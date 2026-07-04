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

Completed new material WebP assets: 50 / 95.

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

Original PNGs for these 50 materials were copied to:

```text
src/assets/images/art-source/originals/materials/
```

This folder is intentionally ignored by Git.

## Next Asset Queue

Continue material generation from:

```text
frost_core, thunder_essence, storm_crystal, storm_essence, earth_essence
```

After that, continue through the remaining material queue from
`docs/generated/art-asset-queue.json`, then equipment, blueprints, crafted items,
shop items, monsters, town places, and scenes.

## Validation Commands

```powershell
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\AssetCoverageCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\DataConsistencyCheck.mjs
```
