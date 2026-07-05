# Art Style Guide

Last updated: 2026-07-05

Image generation is paused for this pass. This guide records the current style so
future generated assets stay consistent.

Use this file for style direction and reference examples. Use
`IMAGE_GENERATION_PROMPTS.md` for copy-ready prompt templates and category
standards.

## Global Style

- Dark realistic fantasy.
- Clear silhouettes and readable object identity.
- Moody neutral backgrounds for inventory art.
- No text, no UI frames, no watermarks.
- Desktop-first full scenes; do not spend effort on mobile variants.
- Generated runtime assets belong under `src/assets/images/art/`.
- Original source PNGs belong under `src/assets/images/art-source/originals/` and
  remain gitignored.

## Existing Reference Examples

Portrait direction:

- `src/assets/images/art/characters/portraits/casino_owner.webp`
- `src/assets/images/art/characters/portraits/blacksmith.webp`
- `src/assets/images/art/characters/portraits/herbalist.webp`
- `src/assets/images/art/characters/portraits/lamplighter_tavi.webp`
- `src/assets/images/art/characters/portraits/standard_bearer_frey.webp`

Town scene direction:

- `src/assets/images/art/scenes/town/places-full/crossroads.webp`
- `src/assets/images/art/scenes/town/places-full/forge.webp`
- `src/assets/images/art/scenes/town/places-full/market.webp`
- `src/assets/images/art/scenes/town/places-full/casino.webp`
- `src/assets/images/art/scenes/town/places-full/gate.webp`

Casino scene direction:

- `src/assets/images/art/scenes/backgrounds/casino-hall.webp`
- `src/assets/images/art/scenes/backgrounds/casino-prize-wall.webp`
- `src/assets/images/art/scenes/backgrounds/casino-game-table.webp`

Equipment direction:

- `src/assets/images/art/items/equipment/glimmer_lampstaff.webp`
- `src/assets/images/art/items/equipment/aurora_ward_plate.webp`
- `src/assets/images/art/items/equipment/wolf_fang_blade.webp`
- `src/assets/images/art/items/equipment/lich_staff.webp`
- `src/assets/images/art/items/equipment/dawnbrand_sword.webp`

## Monster Hierarchy

- Mainline bosses keep the full large illustration style and the highest pressure.
- Non-main bosses and elite monsters may have scene dressing, but should not look
  more ornate than mainline bosses.
- Normal mobs can have no background or only a very minimal dark background.
- Weapon users should show weapon-specific posture and action. A sword, hammer,
  staff, spear, claw, and dagger user should not share the same pose.

## Boss-Drop Matching

Boss-dropped equipment should look like the object held or worn by that boss. If a
boss carries a staff, the dropped staff art should clearly be that staff. If a boss
wears a crown, the dropped crown should read as the same crown.

## Town Rebuild Assets

Future town images should use paired state design:

- Broken state: closed doors, damaged tools, cold light, missing people.
- Repaired state: same place, visibly restored function, but not suddenly luxurious.
- Transition assets should help the player feel that story actions changed the
  location.

Planned gaps are listed in `TownAssetNeedDatabase`. Do not generate them during the
current documentation pass.
