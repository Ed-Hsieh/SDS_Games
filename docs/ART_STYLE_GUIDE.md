# Art Style Guide

Last updated: 2026-07-27

First-run story image work is active. Generate only assets listed in the
first-run ledger below, in small review batches. Second-run external stories,
tower art, DLC light/Void art, and unapproved resource expansion remain paused.

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

The current first-run town-state requirements are listed in the asset ledger
below. `TownAssetNeedDatabase` is not an authority and must not be recreated as a
parallel planning source.

## Current Story Asset Notes

- The previous `village_elder.webp` read too strongly as a casino-owner portrait.
  It is preserved as a casino-owner candidate while the village elder receives a
  grounded broken-town portrait.
- As the main story bible becomes concrete, town scenes may need more specific
  broken, recovering, and chapter-state images so the world does not feel staged
  with generic backgrounds.

## Deferred Layered Dialogue Assets

The screenplay is complete enough for the first-run dialogue-art pass. Rebuild
dialogue presentation as four independent layers:

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

Current accepted candidates include:

- Ailo's true-ending flower-field memory with Neelu.
- Frey's first-run final moment holding the standard.

Only accepted screenplay beats may create CG asset requirements. Do not use CGs
to illustrate ordinary conversation or every character death.

## First-Run Asset Requirement Ledger

Audit date: 2026-07-14.

Runtime owners:

- Scene order, participants, expressions, and asset intent:
  `src/js/data/StorySceneRegistry.js`
- Actor ids and ready expression mappings: `src/js/data/StoryActors.js`
- Chapter geography: `src/js/data/ChapterRegionRegistry.js`
- Existing image mappings: `src/js/data/AssetManifest.js`

Accounting rules:

- This ledger covers the complete mandatory first run only.
- Static Boss dialogue reuses the approved full Boss illustration. Do not create
  expression portraits for `lich`, `drowned_oracle`, `shadow_commander`,
  `thorn_witch`, `elder_dragon`, or `demon_lord_asariel` unless the user changes
  that presentation rule.
- A file is `ready` only when it exists under `src/assets/images/art/`. A scene
  description or an old baked-background portrait does not count as coverage.
- Existing landmark and Boss files may still need runtime binding or visual
  review; that is an integration task, not a missing-image count.

Current first-run narrative-art result:

| Category | Ready baseline | Missing | Notes |
| --- | ---: | ---: | --- |
| Human actor-expression combinations | 45 physical files | 8 | 53 unique first-run combinations after static Boss exclusions; newly generated Chapter 4-5 layers still require review and registration |
| Exploration map packages | 1 vertical slice | Chapters 2-7 deferred | South Gate currently owns the only accepted layered Canvas package; legacy chapter canvases are not forward requirements |
| Town overview/state backgrounds | existing partial set plus 13 generated review assets | 1 | Approved overview direction is fixed; generated state files still need visual review |
| Field/location backgrounds | existing Chapter 1-2 landmark set plus 10 generated review assets | 5 | Consolidated reusable scenes, not one image per screenplay scene |
| Mandatory first-run CGs | 2 | 0 | Frey's last stand and the surviving Demon King reveal exist pending review |
| Mandatory physical story-object icons | 2 | 1 | Loaded Dice and Echo Whistle exist; the seal-scar shard is absent |
| **Remaining first-run narrative images** |  | **map count deferred** | Recount after the South Gate exploration direction is accepted; do not combine legacy canvas counts with the new package format |

### Optional Side-Story Derived Art Ledger

Audit date: 2026-07-18. Source:
`src/js/data/OptionalSideStoryRegistry.js`. Reproduce this ledger with
`scripts/SideStoryAssetCheck.mjs`.

The 33 personal stories and six ensemble shorts create no new actor, monster,
map location, side-story-exclusive background, or mandatory CG. They reuse the
accepted cast, eight town places, rebuilt chapter-owned exploration regions, and
existing scene-owner vocabulary. Their current presentation footprint is:

- 58 unique actor-expression combinations are requested by the approved
  four-beat performance plans; 33 physical expression files are absent.
- Four existing neutral files need registration rather than generation:
  `casino_owner:neutral`, `casino_dealer:neutral`, `merchant:neutral`, and
  `black_market:neutral`.
- Seventeen background owners are reused. Four shared mainline owners still lack
  mappings: `night_watch_line`, `dead_checkpoint`, `old_waystation_cache`, and
  `center_span_marker`. These are not new side-story locations.
- Eight approved story-object icons remain absent: `return_tag`,
  `returning_season_tea`, `mia_emergency_kit`, `old_flag_knot`,
  `rear_lamp_clasp`, `returned_buckle`,
  `homebound_reinforcement_blueprint`, and `house_invitation_chip`.

Missing physical expression layers:

- Village elder: `pleased`, `soft`, `grieving`.
- Town scholar: `soft`, `afraid`, `grieving`.
- Mia: `grieving`.
- Frey: `guarded`, `hurt`.
- Tavi: `pleased`, `afraid`, `grieving`.
- Blacksmith: `grieving`, `angry`.
- Ailo: `angry`, `soft`, `grieving`, `afraid`, `pleased`.
- Vesper: `pleased`, `guarded`, `angry`.
- Lorne: `guarded`, `afraid`, `soft`, `grieving`.
- Public merchant: `guarded`, `pleased`, `soft`, `afraid`.
- Black-market trader: `guarded`, `pleased`, `angry`.

Story review passed on 2026-07-19. Write and lock each story's formal dialogue
before generating its remaining expression layers, because the final staging
may reduce the current performance estimate. Generate only combinations used by
the locked dialogue and register every ready layer in
`StoryExpressionCoverage`.

### Ready Dialogue Inventory

There are 31 `*-standing.webp` files in the dialogue folder. The user-described
21-image expression batch is included in this physical count. Twenty-six files
cover expressions used by the first run; five are useful neutral reserves that
are not currently called by a first-run beat. This is an image-availability
count, not a runtime-integration claim: `StoryExpressionCoverage` currently
registers the Chapter 1 cast only, so later ready files must still be declared
before `getStoryExpressionLayer()` can return them.

| Actor | Ready files |
| --- | --- |
| village_elder | `neutral`, `guarded`, `resolute` |
| town_scholar | `neutral`, `guarded`, `pleased` |
| herbalist | `neutral`, `soft`, `pleased`, `guarded`, `resolute` |
| standard_bearer_frey | `neutral`, `soft`, `pleased`, `resolute` |
| lamplighter_tavi | `neutral`, `soft`, `guarded` |
| blacksmith | `neutral`, `soft`, `pleased`, `guarded`, `resolute` |
| street_beggar | `neutral`, `guarded` |
| casino_owner | `neutral` |
| casino_dealer | `neutral` |
| merchant | `neutral` |
| black_market | `neutral` |
| young_ailo | `neutral` |
| neelu | `neutral` |

Chapter 1 is covered at 23/23 required combinations. Chapter 2 has 13/21 human
combinations ready and is the immediate expression priority.

### Missing First-Run Expressions

Every file uses
`src/assets/images/art/characters/dialogue/<actor>/<expression>-standing.webp`.

| Actor | Missing expression | First-run scene use |
| --- | --- | --- |
| black_market | `guarded` | `ch3_s05_blank_creditor_trace` |
| blacksmith | `angry` | `ch4_s08_returned_objects` |
| blacksmith | `grieving` | `ch4_s08_returned_objects`, `ch5_s07_after_the_ratchet` |
| blacksmith | `hurt` | `ch5_s07_after_the_ratchet` |
| casino_dealer | `guarded` | `ch3_s04_showcase_glass`, `ch4_s09_four_elements_one_report`, `ch5_s11_town_loses_its_voice`, `ch6_s06_settlement_throw`, `ch6_s07_house_changes_seats` |
| casino_dealer | `pleased` | `ch3_s04_showcase_glass` |
| casino_dealer | `grieving` | `ch6_s07_house_changes_seats` |
| casino_owner | `soft` | `ch3_s04_showcase_glass`, `ch4_s09_four_elements_one_report`, `ch5_s11_town_loses_its_voice`, `ch6_s06_settlement_throw` |
| casino_owner | `pleased` | `ch3_s04_showcase_glass`, `ch3_s09_temptation_and_orders`, `ch4_s09_four_elements_one_report`, `ch5_s11_town_loses_its_voice`, `ch6_s06_settlement_throw` |
| casino_owner | `angry` | `ch6_s06_settlement_throw` |
| herbalist | `angry` | `ch3_s02_shadows_count_names` |
| herbalist | `grieving` | `ch2_s02_name_under_basket`, `ch4_s08_returned_objects` |
| herbalist | `hurt` | `ch3_s02_shadows_count_names`, `ch4_s08_returned_objects` |
| lamplighter_tavi | `afraid` | `ch2_s08_shadow_at_the_checkpoint`, `ch3_s03_lamp_oil_in_fog`, `ch4_s05_body_locks` |
| merchant | `guarded` | `ch2_s01_empty_crates` |
| standard_bearer_frey | `guarded` | `ch2_s08_shadow_at_the_checkpoint` |
| street_beggar | `soft` | `ch2_s07_names_return_to_town`, `ch7_s01_narrow_human_road` |
| town_scholar | `soft` | `ch2_s02_name_under_basket`, `ch2_s07_names_return_to_town` |
| town_scholar | `resolute` | `ch3_s02_shadows_count_names` |
| town_scholar | `grieving` | `ch5_s07_after_the_ratchet`, `ch7_s08_return_to_town` |
| town_scholar | `hurt` | `ch5_s07_after_the_ratchet` |
| town_scholar | `afraid` | `ch5_s10_before_dawn` |
| village_elder | `pleased` | `ch2_s07_names_return_to_town` |
| village_elder | `angry` | `ch3_s02_shadows_count_names` |
| village_elder | `grieving` | `ch2_s07_names_return_to_town`, `ch3_s07_old_command_post`, `ch3_s09_temptation_and_orders`, `ch4_s08_returned_objects`, `ch5_s01_four_fronts_converge`, `ch5_s08_expedition_list`, `ch6_s01_northern_drake_watch` |
| village_elder | `afraid` | `ch4_s04_gray_ridge_evacuates` |
| village_elder | `soft` | `ch5_s08_expedition_list` |

Immediate Chapter 2 batch: `herbalist/grieving`,
`lamplighter_tavi/afraid`, `merchant/guarded`,
`standard_bearer_frey/guarded`, `street_beggar/soft`,
`town_scholar/soft`, `village_elder/grieving`, and
`village_elder/pleased`.

### Exploration Map Art Contract

Do not generate another finished chapter illustration and then guess its
collision. Each exploration area begins with an approved playable layout and is
delivered as one aligned package:

- `base.webp`: terrain without foreground occluders.
- `foreground.webp`: transparent occluder pieces aligned to the base.
- `walk-mask.png`: walkable and blocked terrain.
- `height-mask.png`: height and sorting information.
- `material-mask.png`: mud, grass, stone, wood, and blocked material ownership.
- Transparent interactive props with foot anchors and explicit visual states.
- Map JSON/data containing spawn, exits, occluders, props, danger zones, return
  positions, and current-run state rules.

The South Gate 4096 x 2304 package is the only current reference. Its runtime
assets live under
`src/assets/images/art/prototype/hunt-demo/south-gate/`. Do not use the removed
48 x 32 canvas requirement, the deleted open-world DEMO art, or any visible
route-line map as a generation reference. Chapters 2-7 and the remaining Chapter
1 regions stay deferred until this vertical slice is accepted.

### Town Background Ledger

These are independent character-free scene backgrounds. Meaningful state changes
may share camera geometry, but must not be faked by stretching one unrelated
location image.

| Asset id | Status | Used by | Requirement |
| --- | --- | --- | --- |
| `town-overview-broken` | `in_progress` | Chapter 1 lobby/town entry | Generated from the accepted town topology; pending visual review and runtime binding |
| `town-overview-recovery` | `in_progress` | Chapters 2-4 town returns | User-approved visual direction and saved as the state/topology master; pending runtime binding |
| `town-overview-hollow-victory` | `generated_bound_pending_review` | `ch7_s08_return_to_town`, `ch7_s09_first_or_second_epilogue` | First-run victory with visible absences, not celebration spectacle |
| `crossroads-first-run-loss` | `generated_pending_review` | `ch5_s11_town_loses_its_voice`, Chapter 7 return montage | Same crossroads after the town has lost key people |
| `mia-workroom-operation` | `generated_pending_review` | `ch5_s06_mia_operation` | Character-free operation state; fixed-ratchet tools readable |
| `mia-workroom-after-loss` | `generated_pending_review` | `ch5_s07_after_the_ratchet`, `ch7_s08_return_to_town` | Same room after Mia's first-run death |
| `civic-room-working` | `in_progress` | `ch1_s04_elder_to_scholar` through `ch5_s08_expedition_list` | Generated dedicated damp-paper civic/archive room; pending visual review and binding |
| `civic-room-depleted` | `generated_pending_review` | `ch5_s11_town_loses_its_voice`, `ch7_s08_return_to_town` | Same room after cumulative first-run losses |
| `gate-working` | `in_progress` | `ch2_s08_shadow_at_the_checkpoint`, `ch3_s09_temptation_and_orders` | Generated ordinary repaired gate with plain flag and patrol lamp; pending visual review and binding |
| `gate-after-frey` | `generated_pending_review` | `ch4_s08_returned_objects`, `ch7_s08_return_to_town` | Old flag hardware and Tavi's lamp; no heroic monument |
| `forge-grief` | `generated_pending_review` | `ch4_s08_returned_objects`, `ch5_s07_after_the_ratchet`, `ch7_s08_return_to_town` | Same usable forge with reduced human warmth |
| `market-closed` | `in_progress` | `ch2_s01_empty_crates` | Generated closed public market with empty crates; pending visual review and binding |
| `market-sparse` | `in_progress` | `ch2_s07_names_return_to_town` | Generated as the same market with limited restored stock; pending visual review and binding |
| `market-service-alley` | `planned` | `ch3_s05_blank_creditor_trace` | Closed service passage to the retained black-market contact point |

Existing `crossroads-broken`, `crossroads-recovery-1`, `mia_workroom`,
`gate-broken`, `forge-cold`, `forge`, `market`, `alley`, and the casino hall/table/
prize-wall set remain reusable pending visual review.

### Missing Field And Location Backgrounds

| Proposed asset id | Scene ids | Required content |
| --- | --- | --- |
| `north-checkpoint-abandoned` | `ch2_s08_shadow_at_the_checkpoint`, `ch3_s01_dead_checkpoint` | Reauthor the old checkpoint; no grand keep presentation |
| `night-watch-route` | `ch3_s03_lamp_oil_in_fog` | Front and rear markers readable through fog |
| `old-command-yard` | `ch3_s07_old_command_post` | Black-iron storehouse and held-breach threshold |
| `stone-route-moving-wall` | `ch4_s01_road_moves_underfoot` | Retaining walls exposing rib-like strata |
| `gray-ridge-causeway` | `ch4_s04_gray_ridge_evacuates` | Causeway before the central span breaks |
| `gray-ridge-rear-marker` | `ch4_s05_body_locks` | Rear marker under ash wind |
| `gray-ridge-center-span-aftermath` | `ch4_s06_flag_returns` | Reusable aftermath background; separate from the Frey CG |
| `titan-vein-ruins-awakened` | `ch4_s07_titan_rises` | Collapsed regulation ruins exposed beneath Gray Ridge; separate from the existing Ancient Titan Boss image |
| `four-front-convergence` | `ch5_s03_elemental_convergence` | Four physical elemental fronts converging on one pressure line |
| `four-front-emergency-return` | `ch5_s05_fourfold_shrapnel` | Exposed return route from the convergence core |
| `old-waystation-cache` | `ch5_s09_whistle_cache` | Cache built by the destroyed mountain settlement |
| `seal-warning-line-body` | `ch6_s02_scar_aftermath` | First-run investigation composition only: the elder lies outside the warning line, his weapon remains sheathed, the bloodied fragment rests near his hand, and opposing black pressure / dragon-fire marks remain readable. Do not depict his departure, private decision, or moment of death; no second-run variant yet |
| `mountain-base-collapsed-road` | `ch6_s05_after_the_broad_road` | Constructed broad road ending in collapsed stone |
| `old-route-mouth` | `ch6_s09_the_old_note_answers` | Acoustic blind turns and concealed human route mouth |
| `ruined-flower-field` | `ch7_s02_ruined_flower_field` | Generated and bound: present ruin with one identifiable white/pale-green flower |
| `final-mountain-camp` | `ch7_s04_three_anchor_check` | Generated and bound: three neutral forge housings; no story-exclusive sword |

Chapter 1 landmark art and the Chapter 2 mist hill, moon-moss slope, opened tomb,
drowned coast, and sunken altar already exist. Bind and review those files before
requesting replacements.

### Missing First-Run CGs And Story Objects

| Proposed asset id | Type | Scene ids | Requirement |
| --- | --- | --- | --- |
| `frey-last-standard` | CG | `ch4_s06_flag_returns` | Frey's final first-run moment still holding the ordinary village standard |
| `demon-survives-ending` | CG | `ch7_s09_first_or_second_epilogue` | Generated and bound: post-ending reveal, with the broken combat body still fed by a slow black pulse |
| `echo_whistle` | key-item icon | `ch5_s09_whistle_cache` onward | Ordinary acoustic route tool, not a magical guide artifact |
| `seal_scar_shard` | key-item icon | `ch6_s02_scar_aftermath` onward | Current-run physical evidence; no formal light/Void styling |

### Chapter 4 Generated Image Review Batch

Chapter 4's locked batch contains exactly 18 chapter-specific image files.
All 18 were generated on 2026-07-24 and placed under
`src/assets/images/art/`. They remain `generated_pending_review`: physical
file coverage is complete, but none of these files count as visually accepted
or runtime-bound until the user reviews them.

- Eight scene/CG files: `stone-route-moving-wall`,
  `gray-ridge-causeway`, `gray-ridge-rear-marker`,
  `gray-ridge-center-span-aftermath`, `titan-vein-ruins-awakened`,
  `gate-after-frey`, `forge-grief`, and `frey-last-standard`.
- Ten expression files: `blacksmith/angry`,
  `blacksmith/grieving`, `casino_dealer/guarded`,
  `casino_owner/soft`, `casino_owner/pleased`,
  `herbalist/grieving`, `herbalist/hurt`,
  `lamplighter_tavi/afraid`, `village_elder/grieving`, and
  `village_elder/afraid`.

The existing `overworld_gray_ridge`, `thorn_glasshouse_ruin`,
`thorn_witch`, and `ancient_titan` files remain valid assets and are not part of
this review batch.

### Chapter 5 Generated Image Review Batch

Chapter 5's locked batch contains exactly 24 chapter-specific image references.
All 24 were generated on 2026-07-24 and placed under
`src/assets/images/art/`. They remain `generated_pending_review`: physical
file coverage is complete, but none of these files count as visually accepted
or runtime-bound until the user reviews them. Temporary bindings to ordinary
town states still do not count as accepted chapter-specific art.

- One chapter canvas: `overworld_four_fronts`.
- Eight scene backgrounds: `four-front-convergence`,
  `four-front-emergency-return`, `old-waystation-cache`,
  `mia-workroom-operation`, `mia-workroom-after-loss`,
  `crossroads-first-run-loss`, `civic-room-depleted`, and `forge-grief`.
- One story-object icon: `echo_whistle`.
- Fourteen expression files: `blacksmith/grieving`, `blacksmith/hurt`,
  `casino_dealer/guarded`, `casino_owner/pleased`, `casino_owner/soft`,
  `street_beggar/afraid`, `town_scholar/afraid`,
  `town_scholar/grieving`, `town_scholar/hurt`,
  `town_scholar/resolute`, `town_scholar/soft`,
  `village_elder/angry`, `village_elder/grieving`, and
  `village_elder/soft`.

Six Chapter 5 references are shared with the Chapter 4 review batch:
`forge-grief`, `blacksmith/grieving`, `casino_dealer/guarded`,
`casino_owner/pleased`, `casino_owner/soft`, and
`village_elder/grieving`. Chapters 4 and 5 therefore contain 42 chapter
references but require 36 unique image files. All 36 unique files now exist and
await visual review.

The existing Elemental Lord Boss image, ordinary forge, Mia workroom, working
civic room, working gate, and recovery crossroads remain valid temporary or
shared assets. They do not satisfy the dedicated Chapter 5 state images listed
above.

The six generated town files use the accepted blue-gray recovering frontier-town
direction. Their runtime WebP files are committed under `src/assets/images/art/`;
their original PNGs are kept under the gitignored
`src/assets/images/art-source/originals/scenes/town/` directory.

`loaded_dice.webp` already exists. `藥師手記` remains text-only and must not
become an inventory item. Mia's operation is currently staged with the operation
background and layered actors; it is not a mandatory CG.

### Separate Data-Catalog Art Backlog

`scripts/AssetCoverageCheck.mjs` currently reports 44 missing image mappings:
six crafted-result records, five Boss craft blueprints, and 33 casino-special
records. It reports zero missing physical files for existing mappings and 37
dimension warnings across 33 unique files. These catalog issues are separate
from the 59-image first-run narrative queue.

Do not generate those 44 mappings merely to silence the checker. Review the
eleven non-casino identities against live recipe and Boss craft data first. The
33 casino-special mappings remain paused until casino gameplay and prize
identity are approved. Always take the exact ids from the live checker output.

### Execution Order

- [in_progress] [P0] [dialogue-art] Complete Chapter 2 expressions
  Owner file(s): `src/assets/images/art/characters/dialogue/`, `src/js/data/StoryActors.js`
  Source of truth: `src/js/data/StorySceneRegistry.js`
  Validation: `scripts/StoryRuntimeCheck.mjs`, full Chapter 2 dialogue browser review
  Notes: Generate the eight-item immediate batch above without adding expression ids.

- [planned] [P0] [scene-art] Complete Chapter 1-2 background binding and review
  Owner file(s): `src/js/managers/StorySceneManager.js`, `src/js/data/AssetManifest.js`, `src/assets/images/art/scenes/`
  Source of truth: `src/js/data/StorySceneRegistry.js`
  Validation: no-skip Chapter 1-2 desktop playthrough
  Notes: Existing landmark and Boss art must be reused before replacements are approved.

- [planned] [P1] [first-run-art] Generate Chapters 3-7 assets chapter by chapter
  Owner file(s): `src/assets/images/art/characters/dialogue/`, `src/assets/images/art/scenes/`, `src/js/data/AssetManifest.js`
  Source of truth: `src/js/data/StorySceneRegistry.js`, `src/js/data/ChapterRegionRegistry.js`
  Validation: chapter-specific browser playthrough plus `scripts/AssetCoverageCheck.mjs`
  Notes: Fifty-nine first-run narrative images remain after the approved six-image town batch; generate small review batches rather than all at once.
