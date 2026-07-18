# Image Generation Prompt Standards

Last updated: 2026-07-18

This is the authoritative prompt standard for future SDS_Games image generation.
Use this file together with `ART_STYLE_GUIDE.md`. Old sheet-generation prompts,
old art-v2 crop instructions, and generated queue markdown were removed so future
agents do not inherit the wrong pipeline.

First-run story image work is active. Generate only approved entries from the
`ART_STYLE_GUIDE.md` first-run asset ledger. Second-run external stories, tower
art, DLC light/Void art, and unapproved catalog expansion remain paused.

## Global Rules

- Generate one final subject per image unless the user explicitly requests a sheet.
- Keep the current dark realistic fantasy style.
- No text, no labels, no numbers, no watermark, no UI frame.
- Preserve readable silhouettes.
- Preserve object identity over decoration.
- Use desktop-first composition.
- Runtime WebP assets go under `src/assets/images/art/`.
- Original generated PNG sources go under
  `src/assets/images/art-source/originals/` and remain gitignored.
- Do not generate tower monsters, tower equipment, or tower reward art until the
  tower rewrite resumes.
- Generate in small review batches when the user is quality-checking, usually five
  images at a time.

## Standard Prompt Shell

Use this structure and fill every bracket.

```text
Use case: stylized-concept
Asset type: [material | weapon | armor | accessory | blueprint | normal monster | elite monster | side boss | main boss | portrait | town scene | dungeon scene | world landmark | casino showcase]
Primary request: [Chinese display name] ([asset_id])
Design note: [what this object/creature/place is, where it comes from, and what story or system it supports]
Style: [category style line from this document]
Composition: [category composition line from this document]
Identity constraints: [required silhouette, weapon posture, boss-drop match, element cue, or location state]
Negative constraints: no text, no labels, no numbers, no watermark, no UI frame, no cropped-off subject.
```

## Materials

Use for monster drops, crafting materials, quest objects, potions, elemental
fragments, casino tokens, and small loot.

Style line:

```text
Style: dark realistic fantasy RPG inventory material art, painterly tactile detail, premium loot feel, moody dark neutral background, readable silhouette.
```

Composition line:

```text
Composition: square inventory asset, single centered object, generous padding, no cropped edges, isolated from any UI frame.
```

Prompt template:

```text
Use case: stylized-concept
Asset type: material
Primary request: [name] ([id])
Design note: [material source, rarity, element, and crafting purpose]
Style: dark realistic fantasy RPG inventory material art, painterly tactile detail, premium loot feel, moody dark neutral background, readable silhouette.
Composition: square inventory asset, single centered object, generous padding, no cropped edges, isolated from any UI frame.
Identity constraints: make the material immediately identifiable as [ore / shard / hide / liquid / fang / rune / ticket / potion], with [element cue] as a supporting accent only.
Negative constraints: no text, no labels, no numbers, no watermark, no UI frame, no cropped-off subject.
```

Reference examples:

- `src/assets/images/art/items/materials/pure_crystal.webp`
- `src/assets/images/art/items/materials/ancient_rune.webp`
- `src/assets/images/art/items/materials/glimmer_shard.webp`
- `src/assets/images/art/items/materials/shadow_shard.webp`
- `src/assets/images/art/items/materials/lich_phylactery.webp`

## Weapons

Use for all standalone weapon art. Do not let special equipment become mostly
swords. Spread identity across blades, daggers, spears, hammers, staffs, focuses,
claws, bows, shields-as-weapons, and odd casino weapons.

Style line:

```text
Style: dark realistic fantasy RPG weapon render, painterly metal and material detail, collectible equipment presentation, moody dark neutral background.
```

Composition line:

```text
Composition: square inventory asset, single weapon centered diagonally or vertically as appropriate, full weapon visible with generous padding.
```

Prompt template:

```text
Use case: stylized-concept
Asset type: weapon
Primary request: [name] ([id])
Design note: [weapon type, source monster/boss/craft/casino, rarity, and intended combat identity]
Style: dark realistic fantasy RPG weapon render, painterly metal and material detail, collectible equipment presentation, moody dark neutral background.
Composition: square inventory asset, single weapon centered diagonally or vertically as appropriate, full weapon visible with generous padding.
Identity constraints: this must read as a real [sword / dagger / hammer / spear / staff / focus / claw / bow]; if it is a blade, include a clear cutting edge, not only a tooth or ornament.
Negative constraints: no text, no labels, no numbers, no watermark, no UI frame, no cropped-off subject.
```

Weapon-form scale must remain readable without a character model. A sword uses
a full battlefield blade, normally about 70-80 percent of the weapon's total
length, with a sword-scale guard and grip; it must be substantially longer and
broader than the same series' dagger. A heavy hammer or maul must have a rigid,
centered shaft joint and a head that remains symmetrical and perpendicular to
the shaft without perspective-induced bending or skew.

For a craft series built around an embedded substance, preserve the approved
`slime_series_sword.webp` construction language: the weapon has a deliberate
recessed central channel, and that channel is visibly filled from end to end by
the translucent series substance. The substance is structural and voluminous,
not a thin painted stripe, isolated gem, surface smear, or small decoration.
Carry the same readable construction rule across all five weapon forms while
keeping each form mechanically plausible.

Boss-drop addition:

```text
Boss-drop match: this item must visually match the [weapon/object] held by [boss_id] in the boss illustration. Keep the same silhouette, core ornament, material language, and element cue.
```

Reference examples:

- `src/assets/images/art/items/equipment/slime_series_sword.webp`
- `src/assets/images/art/items/equipment/wolf_fang_blade.webp`
- `src/assets/images/art/items/equipment/lich_staff.webp`
- `src/assets/images/art/items/equipment/dawnbrand_sword.webp`
- `src/assets/images/art/items/equipment/glimmer_lampstaff.webp`
- `src/assets/images/art/items/equipment/umbral_pike.webp`

## Armor

Use for body armor, robes, cloaks, plate, helmets, gloves, boots, and defensive
equipment when it is represented as a standalone item.

Style line:

```text
Style: dark realistic fantasy RPG armor render, tactile leather/cloth/metal detail, worn but powerful, moody dark neutral background.
```

Composition line:

```text
Composition: square inventory asset, single armor piece centered, full silhouette visible, no character model wearing it unless explicitly requested.
```

Prompt template:

```text
Use case: stylized-concept
Asset type: armor
Primary request: [name] ([id])
Design note: [armor slot, source, rarity, defensive theme, and story link]
Style: dark realistic fantasy RPG armor render, tactile leather/cloth/metal detail, worn but powerful, moody dark neutral background.
Composition: square inventory asset, single armor piece centered, full silhouette visible, no character model wearing it unless explicitly requested.
Identity constraints: emphasize [plate / cloak / robe / helm / gloves / boots / shield] form first, then add [element/source] accents.
Negative constraints: no text, no labels, no numbers, no watermark, no UI frame, no cropped-off subject.
```

Reference examples:

- `src/assets/images/art/items/equipment/aurora_ward_plate.webp`
- `src/assets/images/art/items/equipment/ghost_cloak.webp`
- `src/assets/images/art/items/equipment/wolf_pelt_armor.webp`
- `src/assets/images/art/items/equipment/demon_general_armor.webp`
- `src/assets/images/art/items/equipment/cave_ward_shield.webp`

## Accessories

Use for rings, charms, badges, crowns, masks, goggles, belts, talismans, and
casino oddities.

Style line:

```text
Style: dark realistic fantasy RPG accessory art, small object with premium detail, clear silhouette, moody dark neutral background.
```

Composition line:

```text
Composition: square inventory asset, single centered accessory, generous padding, object large enough to inspect.
```

Prompt template:

```text
Use case: stylized-concept
Asset type: accessory
Primary request: [name] ([id])
Design note: [accessory type, source, rarity, mechanical identity, story link]
Style: dark realistic fantasy RPG accessory art, small object with premium detail, clear silhouette, moody dark neutral background.
Composition: square inventory asset, single centered accessory, generous padding, object large enough to inspect.
Identity constraints: make the accessory read clearly as [ring / badge / crown / charm / mask / goggles / belt], with [source motif] integrated into the object.
Negative constraints: no text, no labels, no numbers, no watermark, no UI frame, no cropped-off subject.
```

Reference examples:

- `src/assets/images/art/items/equipment/forest_guardian_crown.webp`
- `src/assets/images/art/items/equipment/shadow_badge.webp`
- `src/assets/images/art/items/equipment/elemental_badge.webp`
- `src/assets/images/art/items/equipment/stormfeather_talisman.webp`

## Blueprints And Craft Plans

Blueprint art must show the same object that the recipe creates. This prevents
the blueprint from feeling like a generic scroll.

Baseline series are the exception to the single-object composition: one series
sheet must show the exact sword, dagger, heavy weapon, spear/lance, and
staff/focus unlocked by that series. Use `slime_series.webp` as the composition
reference. Do not generate five separate baseline blueprint sheets.

The shared sheet filename is the series id (`slime_series.webp`,
`bone_series.webp`, and so on). Individual finished-weapon files still use their
recipe ids. Generate the five individual weapons first or from the same locked
design description, then make the shared sheet reproduce those exact five
silhouettes, materials, and ornaments. Old per-form baseline blueprint files are
obsolete and must be removed rather than retained as fallbacks.

Style line:

```text
Style: dark fantasy forge blueprint on aged parchment, precise object sketch, soot, wax, metal clamps, no readable text.
```

Composition line:

```text
Composition: square inventory asset, parchment or drafting sheet centered, target item silhouette clearly sketched, no UI border.
```

Prompt template:

```text
Use case: stylized-concept
Asset type: blueprint
Primary request: [blueprint name] ([id])
Design note: blueprint used to craft [target_item_id], tied to [forge/NPC/dungeon/source]
Style: dark fantasy forge blueprint on aged parchment, precise object sketch, soot, wax, metal clamps, no readable text.
Composition: square inventory asset, parchment or drafting sheet centered, target item silhouette clearly sketched, no UI border.
Identity constraints: the sketch must match the final item [target_item_id] in silhouette, weapon/armor type, and core ornament.
Negative constraints: no readable writing, no labels, no numbers, no watermark, no UI frame, no cropped-off sheet.
```

Reference examples:

- `src/assets/images/art/items/blueprints/slime_series.webp`
- `src/assets/images/art/items/blueprints/bone_series.webp`
- `src/assets/images/art/items/blueprints/poison_dagger.webp`
- `src/assets/images/art/items/blueprints/glimmer_focus.webp`
- `src/assets/images/art/items/blueprints/shadow_armor.webp`

## Normal Monsters

Normal monsters should be readable game enemies, not boss posters.

Style line:

```text
Style: dark realistic fantasy normal monster portrait, creature clear and centered, practical enemy design, minimal or no background.
```

Composition line:

```text
Composition: square creature asset, full body or strong three-quarter body visible, simple dark background or transparent-feeling darkness, no cinematic scene.
```

Prompt template:

```text
Use case: stylized-concept
Asset type: normal monster
Primary request: [name] ([id])
Design note: Lv[level] [region/biome] monster, [drop/material/equipment role], [element if any]
Style: dark realistic fantasy normal monster portrait, creature clear and centered, practical enemy design, minimal or no background.
Composition: square creature asset, full body or strong three-quarter body visible, simple dark background or transparent-feeling darkness, no cinematic scene.
Identity constraints: show the monster's primary threat clearly: [claws / teeth / weapon / armor / poison gland / elemental core]. If it uses a weapon, pose must match that weapon type.
Negative constraints: no text, no labels, no numbers, no watermark, no UI frame, no ornate boss background.
```

Reference examples:

- `src/assets/images/art/entities/monsters/slime.webp`
- `src/assets/images/art/entities/monsters/goblin.webp`
- `src/assets/images/art/entities/monsters/wild_wolf.webp`
- `src/assets/images/art/entities/monsters/skeleton.webp`
- `src/assets/images/art/entities/monsters/poison_spider.webp`

## Elite Monsters

Elites can have scene dressing but should remain below boss grandeur.

Style line:

```text
Style: dark realistic fantasy elite monster portrait, stronger and more dangerous than normal enemies, modest environmental hints, not a main boss poster.
```

Composition line:

```text
Composition: square elite creature asset, creature dominant, limited background props, readable weapon or special body feature.
```

Prompt template:

```text
Use case: stylized-concept
Asset type: elite monster
Primary request: [name] ([id])
Design note: Lv[level] elite from [region], difficult monster with [drop/reward role]
Style: dark realistic fantasy elite monster portrait, stronger and more dangerous than normal enemies, modest environmental hints, not a main boss poster.
Composition: square elite creature asset, creature dominant, limited background props, readable weapon or special body feature.
Identity constraints: make this clearly tougher than normal mobs but less ornate than mainline bosses. Weapon posture must differ by weapon type.
Negative constraints: no text, no labels, no numbers, no watermark, no UI frame, no excessive cinematic background.
```

Reference examples:

- `src/assets/images/art/entities/monsters/stone_golem.webp`
- `src/assets/images/art/entities/monsters/skeleton_warrior.webp`
- `src/assets/images/art/entities/monsters/ancient_guardian.webp`
- `src/assets/images/art/entities/monsters/crystal_golem.webp`
- `src/assets/images/art/entities/monsters/shadow_general.webp`

## Side Bosses And Dungeon Bosses

Use for non-main bosses. They may be dramatic, but not more ornate than main story
bosses.

Style line:

```text
Style: dark realistic fantasy side boss illustration, creature dominant, dramatic but restrained, environmental dressing tied to its dungeon or region.
```

Composition line:

```text
Composition: boss-focused asset, full creature visible or powerful upper-body framing, modest scene, clear silhouette and drop object if relevant.
```

Prompt template:

```text
Use case: stylized-concept
Asset type: side boss
Primary request: [name] ([id])
Design note: [dungeon/region] boss, Lv[level], drops [signature_item/material], story role [role]
Style: dark realistic fantasy side boss illustration, creature dominant, dramatic but restrained, environmental dressing tied to its dungeon or region.
Composition: boss-focused asset, full creature visible or powerful upper-body framing, modest scene, clear silhouette and drop object if relevant.
Identity constraints: if this boss drops equipment, show the matching object held, worn, or embedded in the boss design.
Negative constraints: no text, no labels, no numbers, no watermark, no UI frame, do not exceed mainline boss grandeur.
```

Reference examples:

- `src/assets/images/art/entities/monsters/forest_guardian.webp`
- `src/assets/images/art/entities/monsters/lich.webp`
- `src/assets/images/art/entities/monsters/stone_golem.webp`
- `src/assets/images/art/entities/monsters/drowned_oracle.webp`
- `src/assets/images/art/entities/monsters/blood_moon_stag.webp`

## Main Bosses

Mainline bosses keep the most cinematic treatment.

Style line:

```text
Style: full-frame dark realistic fantasy main boss illustration, highest pressure and most ornate tier, cinematic chapter presence.
```

Composition line:

```text
Composition: large boss illustration, full boss or commanding upper-body silhouette, immersive environment, strong focal lighting, no UI.
```

Prompt template:

```text
Use case: stylized-concept
Asset type: main boss
Primary request: [name] ([id])
Design note: mainline boss for [chapter/region], Lv[level], story role [role], signature drops [items]
Style: full-frame dark realistic fantasy main boss illustration, highest pressure and most ornate tier, cinematic chapter presence.
Composition: large boss illustration, full boss or commanding upper-body silhouette, immersive environment, strong focal lighting, no UI.
Identity constraints: show the boss's signature held or worn objects clearly enough that future drop art can match them.
Negative constraints: no text, no labels, no numbers, no watermark, no UI frame.
```

Reference examples:

- `src/assets/images/art/entities/monsters/demon_lord_asariel.webp`
- `src/assets/images/art/entities/monsters/elemental_lord.webp`
- `src/assets/images/art/entities/monsters/elder_dragon.webp`
- `src/assets/images/art/entities/monsters/shadow_overlord.webp`
- `src/assets/images/art/entities/monsters/aurora_archon.webp`

## Character Portraits

Portraits should communicate role, personality, and town function.

Style line:

```text
Style: dark realistic fantasy NPC portrait, expressive face, grounded clothing, role-specific props, painterly detail.
```

Composition line:

```text
Composition: portrait asset, upper body or bust, character centered, readable face, subdued background that does not overpower the character.
```

Prompt template:

```text
Use case: stylized-concept
Asset type: portrait
Primary request: [npc name] ([npc_id])
Design note: [role in town/story], personality [tone], system function [shop/forge/casino/route/etc.]
Style: dark realistic fantasy NPC portrait, expressive face, grounded clothing, role-specific props, painterly detail.
Composition: portrait asset, upper body or bust, character centered, readable face, subdued background that does not overpower the character.
Identity constraints: personality should come from face, posture, clothing wear, and tools; avoid generic fantasy model posing.
Negative constraints: no text, no labels, no numbers, no watermark, no UI frame.
```

Reference examples:

- `src/assets/images/art/characters/portraits/casino_owner.webp`
- `src/assets/images/art/characters/portraits/blacksmith.webp`
- `src/assets/images/art/characters/portraits/herbalist.webp`
- `src/assets/images/art/characters/portraits/lamplighter_tavi.webp`
- `src/assets/images/art/characters/portraits/standard_bearer_frey.webp`

## Town Scenes

Town scenes should make players feel they physically reached a place. Use paired
broken/repaired states when a location changes through quests.

Style line:

```text
Style: desktop 2D RPG full-location scene, dark realistic fantasy, grounded town architecture, readable interactive area, no UI.
```

Composition line:

```text
Composition: landscape full-scene environment for desktop, clear foreground/midground/depth, enough open space for UI overlay without hiding the location identity.
```

Prompt template:

```text
Use case: stylized-concept
Asset type: town scene
Primary request: [place/state name] ([id])
Design note: [town place], state [broken / repaired / specialized], unlocked by [quest/recovery node]
Style: desktop 2D RPG full-location scene, dark realistic fantasy, grounded town architecture, readable interactive area, no UI.
Composition: landscape full-scene environment for desktop, clear foreground/midground/depth, enough open space for UI overlay without hiding the location identity.
Identity constraints: make this visibly the same place as [base place] but in [state] condition; show functional change through props, lighting, people, and repaired objects.
Negative constraints: no text, no labels, no numbers, no watermark, no UI frame, no abstract gradient background.
```

Reference examples:

- `src/assets/images/art/scenes/town/locations/crossroads.webp`
- `src/assets/images/art/scenes/town/locations/forge.webp`
- `src/assets/images/art/scenes/town/locations/market.webp`
- `src/assets/images/art/scenes/town/locations/casino.webp`
- `src/assets/images/art/scenes/town/locations/gate.webp`

## Casino Scenes And Showcase Items

Casino art must sell desire first, then story pressure.

Style line:

```text
Style: dark realistic fantasy casino scene or prize object, velvet shadow, glass, gold accents, controlled temptation, no modern neon.
```

Composition line for scenes:

```text
Composition: desktop full-location scene, clear table/showcase/floor identity, cinematic but usable as a game background.
```

Composition line for showcase items:

```text
Composition: square inventory or display-case asset, one desirable prize centered, readable silhouette, premium lighting, no UI frame.
```

Prompt template for showcase item:

```text
Use case: stylized-concept
Asset type: casino showcase
Primary request: [showcase item name] ([id])
Design note: legendary or unique casino prize, connected to [pool/owner route/final choice]
Style: dark realistic fantasy casino prize object, velvet shadow, glass reflection, gold accents, controlled temptation, no modern neon.
Composition: square inventory or display-case asset, one desirable prize centered, readable silhouette, premium lighting, no UI frame.
Identity constraints: this must match the final reward item exactly enough that the player recognizes it after claiming it.
Negative constraints: no text, no labels, no numbers, no watermark, no UI frame, no generic treasure chest replacement.
```

Reference examples:

- `src/assets/images/art/scenes/backgrounds/casino-hall.webp`
- `src/assets/images/art/scenes/backgrounds/casino-prize-wall.webp`
- `src/assets/images/art/scenes/backgrounds/casino-game-table.webp`
- `src/assets/images/art/characters/portraits/casino_owner.webp`
- `src/assets/images/art/items/key-items/clues/loaded_dice.webp`

## Dungeon Scenes

Dungeon scenes should represent preparation targets and unique mechanics, not only
generic fantasy rooms.

Style line:

```text
Style: desktop 2D RPG dungeon environment, dark realistic fantasy, mechanic-driven location identity, no UI.
```

Composition line:

```text
Composition: landscape full dungeon scene, strong readable route, environmental hazard visible, enough depth for exploration mood.
```

Prompt template:

```text
Use case: stylized-concept
Asset type: dungeon scene
Primary request: [dungeon name] ([id])
Design note: dungeon mechanic [mechanic], reward focus [reward], chapter/level [range]
Style: desktop 2D RPG dungeon environment, dark realistic fantasy, mechanic-driven location identity, no UI.
Composition: landscape full dungeon scene, strong readable route, environmental hazard visible, enough depth for exploration mood.
Identity constraints: show the dungeon mechanic visually through [darkness/cold/puzzle/maze/burn/radiant rhythm/etc.] without adding text.
Negative constraints: no text, no labels, no numbers, no watermark, no UI frame.
```

Reference examples:

- `src/assets/images/art/scenes/dungeons/areas/dungeon_cave.webp`
- `src/assets/images/art/scenes/dungeons/areas/dungeon_snow.webp`
- `src/assets/images/art/scenes/dungeons/areas/dungeon_ruins.webp`
- `src/assets/images/art/scenes/dungeons/areas/dungeon_hell.webp`
- `src/assets/images/art/scenes/dungeons/areas/dungeon_radiant_corridor.webp`

## World Landmarks

World landmarks should help the adventure map feel like a journey, not a menu.

Style line:

```text
Style: desktop 2D RPG world landmark scene, dark realistic fantasy, strong location identity, atmospheric but inspectable.
```

Composition line:

```text
Composition: landscape location scene, clear landmark silhouette, foreground travel cue, readable depth, no UI.
```

Prompt template:

```text
Use case: stylized-concept
Asset type: world landmark
Primary request: [landmark name] ([id])
Design note: adventure map location for [chapter/level/biome], connected to [quest/material/monster group]
Style: desktop 2D RPG world landmark scene, dark realistic fantasy, strong location identity, atmospheric but inspectable.
Composition: landscape location scene, clear landmark silhouette, foreground travel cue, readable depth, no UI.
Identity constraints: show why this place matters: [route danger / monster territory / resource source / story clue].
Negative constraints: no text, no labels, no numbers, no watermark, no UI frame, no vague stock landscape.
```

Reference examples:

- `src/assets/images/art/scenes/world/landmarks/silver_snare_pass.webp`
- `src/assets/images/art/scenes/world/landmarks/drowned_bell_coast.webp`
- `src/assets/images/art/scenes/world/landmarks/obsidian_keep_gate.webp`
- `src/assets/images/art/scenes/world/landmarks/south_gate_farmland.webp`

## Quality Checklist

Before accepting generated art:

- The object or creature identity is readable at inventory/card size.
- The asset follows the correct category hierarchy.
- Normal monsters do not look like bosses.
- Main bosses look more impressive than elites and side bosses.
- Boss-dropped equipment matches the boss object.
- Blueprints show the target item, not a generic scroll.
- Weapons are distributed across weapon types.
- Casino showcase items match final rewards.
- No tower content was generated while tower is paused.
- No text or UI-like framing appears in the image.
