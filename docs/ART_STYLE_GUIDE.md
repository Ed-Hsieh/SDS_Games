# Art Style Guide

Last updated: 2026-07-10

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

These portraits are character and costume references only. Their baked-in
backgrounds are not the final dialogue presentation format.

Town scene direction:

- `src/assets/images/art/scenes/town/locations/crossroads.webp`
- `src/assets/images/art/scenes/town/locations/forge.webp`
- `src/assets/images/art/scenes/town/locations/market.webp`
- `src/assets/images/art/scenes/town/locations/casino.webp`
- `src/assets/images/art/scenes/town/locations/gate.webp`

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

## Current Story Asset Notes

- The previous `village_elder.webp` read too strongly as a casino-owner portrait.
  It is preserved as a casino-owner candidate while the village elder receives a
  grounded broken-town portrait.
- As the main story bible becomes concrete, town scenes may need more specific
  broken, recovering, and chapter-state images so the world does not feel staged
  with generic backgrounds.

## Deferred Layered Dialogue Assets

Do not generate or replace dialogue assets during the current screenplay pass.
After the complete master screenplay is accepted, rebuild dialogue presentation
as four independent layers:

1. A scene background with no speaking character baked into it.
2. One or more transparent character layers with stable framing and anchors.
3. Reusable expression variants selected by screenplay metadata.
4. The runtime dialogue UI above those visual layers.

Character variants must keep the same body scale, crop, costume, silhouette,
camera angle, and anchor point so expressions can swap without visual jumping.
Only create a chapter-specific costume, injury state, age, or pose when an
accepted scene requires it. Background variants should represent meaningful
location or world-state changes rather than duplicate near-identical images.

Generate expression coverage from the completed script, grouped by character
and stable costume/age state. The project uses one closed vocabulary of at most
nine reusable expression types: `neutral`, `soft`, `pleased`, `guarded`,
`resolute`, `angry`, `afraid`, `grieving`, and `hurt`. More precise script
emotions must map onto these slots. Do not add a tenth expression; use an
existing alias or an approved story CG for a true one-off climax. Supporting
characters may use fewer variants. Existing portraits remain visual references
until this replacement pass; they must not constrain the screenplay.

`elder_dragon` is an approved exception: it reuses the existing full Boss
illustration as its dialogue presentation and does not require a separate
portrait unless the story direction is changed later.

## Deferred Story CG Illustrations

The finished screenplay may mark a small number of major emotional or revelatory
beats for full-scene CG illustrations. These are intentionally composed images
with character, environment, action, lighting, and framing integrated into one
large illustration. They are separate from reusable dialogue backgrounds and
portrait expression layers.

Current future candidates include:

- Ailo's true-ending flower-field memory with Neelu.
- Frey's first-run final moment holding the standard.

Only accepted screenplay beats may create CG asset requirements. Do not produce
CGs during the current script pass, and do not use them to illustrate ordinary
conversation or every character death.
