# Equipment Series Framework

Last updated: 2026-07-18

This document defines the intended equipment-series, weapon-form, and affinity
positioning for future combat and item passes. Runtime JS/data remains the
source of truth for current shipped behavior; this file records accepted design
direction before those systems are rewritten.

## Mainline, Second-Run External Story, And DLC Boundary

- The mandatory first-run and second-run chapter progression may distribute
  shadow and glimmer equipment only.
- Formal light and Void equipment, materials, creature groups, affinities, and
  combat routes belong to optional second-run external stories. They may reward
  exploration and make later challenges easier, but they never gate the base
  true ending or replace Lv1-Lv70 mainline rewards.
- Shadow and glimmer foreshadow those later affinities without naturally
  upgrading into them. Every physical external-story item is reacquired inside
  the current run; only achievement meaning persists across runs.
- The prologue stag rematch, 無名之咒, the expedition supreme commander, Ash
  Baron, 熵, the light trial, and the Void Boss are base-game second-run chase
  sources, not mainline convergence. Later DLC extends the light/Void and tower
  ecosystem after their first optional resolution.

## Core Rules

- Series-crafted equipment is the weak fallback path. It keeps a player's chosen
  weapon form playable, but it should not outshine monster, dungeon, elite, boss,
  casino, or special craft rewards.
- Special drops and non-series crafts are the chase path. They may be stronger,
  more distinctive, or mechanically specific because their sources ask for more
  exploration, risk, or preparation.
- Do not make every special weapon a sword. Every level band should include
  enough weapon-form support that a player is not forced out of a preferred form.
- Every ten-level band owns one complete baseline craft series with sword,
  dagger, heavy weapon, spear/lance, and staff/focus. This is the guaranteed
  continuation path for a player who wants to keep one preferred weapon form.
- A complete five-form baseline series counts as one series unlock and one
  source event. Its five finished weapons do not consume the special-craft,
  monster-drop, dungeon, Boss, or quest-unique quotas.
- Special gear selectively highlights monsters, dungeons, and bosses. It may
  favor particular forms because the complete baseline series already protects
  every form from an acquisition gap.
- `weaponSpeed` means rhythm-ring pointer speed. Higher values are harder to
  control.
- `attackSpeed` means attack cooldown/frequency. Higher values attack more
  often.
- Weapon-form effects should not duplicate affinity effects. For example, sword
  should not keep an attack-speed identity if glimmer/light already owns rhythm
  acceleration.

## Formal Weapon Distribution Contract

`src/js/data/WeaponProgression.js` is the machine-readable authority for the
seven Lv10 bands, five formal weapon forms, acquisition roles, source budgets,
and focus-element boundaries. `src/js/data/MonsterEcology.js` owns the monster
side of the same source graph. Neither file authorizes final stats or final drop
rates.

Every formal weapon is classified on four independent axes:

1. Level band: `1-10`, `11-20`, `21-30`, `31-40`, `41-50`, `51-60`, or `61-70`.
2. Form: sword, dagger, heavy, lance, or focus.
3. Acquisition role: starter, weak fallback, monster chase, special craft,
   dungeon reward, or Boss signature.
4. Source dispersion: which monster, habitat, dungeon, blueprint, and material
   sources participate in the acquisition chain.

Overall source coverage and craft-only continuity are different requirements.
Monster, dungeon, and Boss items may make all five forms visible in a band, but
they do not replace the baseline series. A player must be able to enter every
ten-level band and craft the next sword, dagger, heavy weapon, spear/lance, or
staff/focus without relying on random drops.

| Level band | Baseline craft obligation | Chapter material/group themes |
| --- | --- | --- |
| 1-10 | One complete five-form baseline series. | Woodland, beast, survival. |
| 11-20 | One complete five-form baseline series. | Undead, bone, glimmer. |
| 21-30 | One complete five-form baseline series. | Shadow, expedition, coast. |
| 31-40 | One complete five-form baseline series. | Stone, ancient, forge. |
| 41-50 | One complete five-form baseline series. | Fire, ice, thunder, poison. |
| 51-60 | One complete five-form baseline series. | Dragon, seal, cliff. |
| 61-70 | One complete five-form baseline series. | Demon, fall site, endgame. |

### Ten-Level Allocation Contract

For every ten-level band:

- Baseline craft always provides exactly five form variants: sword, dagger,
  heavy weapon, spear/lance, and staff/focus. Unlocking the series opens all
  five variants together; the player crafts only the form they want.
- Boss and dungeon representative equipment contribute one or two items in
  total. A single Boss still follows its own one-representative-object limit.
- Special craft contributes one or two finished items. It excludes baseline
  five-form coverage, Boss/dungeon core crafts, and quest-unique weapons.
- Normal and elite monsters contribute two or three special finished-equipment
  drops in total. Materials do not count. A monster blueprint result counts as
  special craft, not as a direct monster special drop.
- Quest-unique weapons have no fixed quota. They exist only when a character,
  event, or story object logically produces that weapon. They use fixed,
  non-random acquisition, do not fill baseline form gaps, and do not count
  toward another allocation quota.

Every item belongs to one allocation category. Do not count the same finished
item as both a direct monster drop and a special craft merely because its recipe
or material also comes from a monster.

Chapter 1 uses six compact equipment-material groups: slime/alchemy,
beast/hunter, goblin/scrap, toxin/silk, stone/ore, and forest/nature. Junk and
food are tracked as non-progression loot and do not count as extra equipment
groups. This is broad enough to distinguish its nine monsters without making
the first forge layer demand six unrelated rare currencies.

### Drop And Craft Source Budgets

- Normal monster: one signature material, one common material, and at most one
  direct equipment candidate.
- Elite: one rare-material identity; equipment or blueprint is the primary
  reward, not both as a complete self-contained chain.
- Dungeon Boss: one core, at most one signature equipment object, and one
  special craft line.
- Main Boss: exactly one representative object that visibly matches the Boss;
  remaining output is material or system progression.
- Every regional ecology must have at least three monster species contributing
  material, direct-equipment, or blueprint sources. A region may not function as
  one monster carrying the entire acquisition graph.
- A non-unique material should normally have two or three sources. A rare
  material uses one primary source and one low-rate alternative. A Boss core may
  be unique, but a recipe may require at most one Boss core.
- A recipe combines two or three source layers in low quantities. One monster
  may not provide the blueprint, every ingredient, and the final item.
- A five-form series blueprint counts as one source event, not five separate
  weapon drops.

### Series Blueprint Contract

- Every ten-level band has one series blueprint id and five finished recipe ids.
- The series blueprint is a guaranteed forge or chapter unlock. It must never
  depend on a random monster drop, because it is the weapon-form safety net.
- One series blueprint image shows all five exact finished weapons together:
  sword, dagger, heavy weapon, spear/lance, and staff/focus.
- `slime_series.webp` is the approved composition reference. Future series
  sheets follow its five-object readability, but use their own chapter material
  identity and must match the final individual equipment images.
- Individual weapon blueprints are not required for baseline-series variants.
  Special crafts still use one blueprint image per finished item.
- Baseline strength stays below special drops and special crafts. Low material
  quantities and guaranteed access are its advantages, not superior power.

### Locked First-Run Baseline Series

These seven series are the complete Lv1-Lv70 craft-only continuation path. The
five ids in one row unlock together and share the row's single blueprint image.

| Chapter / band | Series | Five weapon variants | Material language |
| --- | --- | --- | --- |
| 1 / Lv1-10 | `slime_series` / 青凝工藝 | `slime_series_sword`, `slime_series_dagger`, `slime_series_hammer`, `slime_series_spear`, `slime_series_staff` | Slime gel, scrap iron, bound wood. |
| 2 / Lv11-20 | `bone_series` / 白骨工藝 | `bone_series_sword`, `bone_series_dagger`, `bone_series_hammer`, `bone_series_spear`, `bone_series_staff` | Bone plates, teeth, crude iron. |
| 3 / Lv21-30 | `expedition_series` / 遠征工藝 | `expedition_series_sword`, `expedition_series_dagger`, `expedition_series_hammer`, `expedition_series_spear`, `expedition_series_staff` | Recovered expedition iron and standardized field fittings. |
| 4 / Lv31-40 | `runic_series` / 刻紋工藝 | `runic_series_sword`, `runic_series_dagger`, `runic_series_hammer`, `runic_series_spear`, `runic_series_staff` | Mithril, shallow runes, stabilized earth traces. |
| 5 / Lv41-50 | `fourfold_series` / 四象工藝 | `fourfold_series_sword`, `fourfold_series_dagger`, `fourfold_series_hammer`, `fourfold_series_spear`, `fourfold_series_staff` | Controlled low-density fire, ice, thunder, and poison treatment. |
| 6 / Lv51-60 | `sealstone_series` / 封脈工藝 | `sealstone_series_sword`, `sealstone_series_dagger`, `sealstone_series_hammer`, `sealstone_series_spear`, `sealstone_series_staff` | Seal stone, low-grade drake scale, restrained runes. |
| 7 / Lv61-70 | `helliron_series` / 獄鐵工藝 | `helliron_series_sword`, `helliron_series_dagger`, `helliron_series_hammer`, `helliron_series_spear`, `helliron_series_staff` | Hell iron, demon horn structure, insulated soul traces. |

The series names, ids, forms, and chapter bands are locked for blueprint and
equipment production. Provisional combat numbers may still change during the
later balance pass. Do not rename a variant after its individual equipment art
or shared series blueprint has been approved without updating both assets.

Material loot chance must stay proportional to recipe demand. The game does not
use inflated material quantities to manufacture playtime, so high source count
must not be paired with high per-kill quantities.

### Main Boss Equipment Contract

- Each mainline Boss owns exactly one direct representative equipment object.
- Every mainline Boss representative is Legendary, but its numerical power is
  constrained by the chapter where it appears. Legendary rarity does not turn
  an early Boss reward into an endgame item.
- The representative object remains exclusive to that Boss and must match the
  object held or worn in the approved Boss illustration.
- Existing secondary Boss equipment is obtained through a Boss-clear system
  unlock and a low-quantity Boss-core recipe. It is never reassigned to a normal
  monster merely to create another drop source.
- A Boss-core recipe returns the canonical existing equipment id. It must not
  create a second `crafted_*` copy of the same named equipment.
- Reuse an existing approved Boss core and material image by default. Generate a
  new Boss material only when the story and recipe function require a genuinely
  different object.

`life_seed` and `forest_essence` currently serve both ordinary loot language and
late story-object language. Before final reward allocation, those records must
be explicitly separated by purity/story identity or have the ordinary source
removed. Do not silently treat a generic Chapter 1 drop as the rooted true-ending
object.

### Focus Element Boundary

- Arcane Resonance supports fire, ice, thunder, and poison only.
- A focus has at most one primary element. A neutral focus uses `magic_bolt`.
- Baseline-series focuses are neutral when crafted and expose one replaceable
  element-attunement slot. Attunement never adds a separate magic-power stat;
  it writes the selected formal element directly into the equipment effects
  already read by Arcane Resonance.
- Attunement is deterministic. The player chooses fire, ice, thunder, or poison,
  spends one matching material plus the forge fee, and replaces the previous
  attunement in that same slot. There is no random result and no second element
  slot.
- A special focus with an authored fixed element cannot be overwritten. Shadow,
  glimmer, light, and Void cannot be produced by ordinary forge attunement.
- First-run access is deliberately staggered without an early-game element gap:
  poison begins in Chapter 1 from poison spiders, ice begins in Chapter 2 from
  the Lich route, thunder begins in Chapter 3 from the drowned-oracle route, and
  fire begins in Chapter 4 from the ancient-titan route. Later regional sources
  may improve availability without changing these first unlock chapters.
- Nature, undead, glimmer, and shadow are group affinities, not resonance
  elements. Formal light and Void remain external-story affinities.
- Current formal focus coverage includes separate fire, ice, thunder, and poison
  routes. `elemental_orb` remains an accessory/catalyst and must not become one
  universal four-element focus.
- `cursed_shard` is reserved for a Lv24-40 cursed/shadow special craft. Its
  present drop source is not permission to leave it without a recipe.

### Expedition Series Material Boundary

- The Chapter 3 expedition series is neutral human military equipment, not a
  shadow series. Its shared rare component is `expedition_steel_fragment`.
- Expedition steel fragments are recovered from standardized fittings carried
  by shadow soldiers, archers, and halberdiers. Shadow residue explains the
  source encounter, but is cleaned away before forging and does not grant an
  element.
- The baseline expedition recipes use iron ore plus one expedition steel
  fragment. `shadow_shard` and `dark_steel` remain available to separate chase
  equipment and may not silently replace this series component.

## Weapon Form Quadrants

| Form | English ability | Chinese ability | Data id | Hit zone | Crit zone | `weaponSpeed` | `attackSpeed` | Damage | Durability | Role |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sword | Steady Stance | 穩定架勢 | `steady_stance` | High | Low | Standard, about `1.0` | Standard, about `1.0` | Medium | High | Stable output, low volatility, forgiving rhythm. |
| Dagger | Quick Chain | 迅捷連鎖 | `quick_chain` | Low | Medium-high | Fast, about `1.25-1.40` | Fast, about `1.25-1.45` | High through tempo/chain | Low | High-control, high-reward, high-miss-risk weapon. |
| Heavy | Bulwark Guard | 重勢守護 | `bulwark_guard` | Medium-low | Low | Slow, about `0.65-0.80` | Slow, about `0.70-0.85` | High | High | Heavy weapon plus armor becomes the tank identity. |
| Spear/Lance | Piercing Line | 貫穿線 | `piercing_line` | Medium | Medium-low | Medium-fast, about `1.00-1.15` | Medium, about `0.95-1.10` | Medium | Medium-high | Anti-armor, high-defense counterplay. |
| Staff/Focus | Arcane Resonance | 法術共鳴 | `arcane_resonance` | Medium | Medium | Medium-slow, about `0.90-1.05` | Medium-slow, about `0.90-1.10` | Medium | Medium | Element amplifier; has a magic-bolt fallback. |
| Unarmed | Unarmed | 徒手 | `unarmed` | Low | Low | Slightly slow, about `0.90` | Slow, about `0.85-0.95` | Low | None | Emergency fallback only. |

## Weapon Ability Direction

### Steady Stance

Sword should be the most stable weapon form. Replace the current sword
attack-speed trigger with `Steady Stance / 穩定架勢`.

Accepted direction:

- Hit or crit grants one stack of stance.
- Each stack widens the hit zone.
- A miss clears all stance stacks.
- The sword crit zone should stay modest; sword strength comes from stable hits,
  not burst or acceleration.

Suggested data shape:

```js
{
    id: 'sword',
    label: 'Steady Stance',
    name: '穩定架勢',
    triggerCondition: 'hitOrCritGainHitZone',
    hitZoneBonusPerStack: 0.06,
    maxStacks: 4,
    resetOnMiss: true
}
```

### Quick Chain

Dagger remains the high-speed, high-risk weapon.

- Fast ring speed and fast cooldown should both be part of the identity.
- It can keep chain or pursuit damage, but misses should be painful because the
  hit zone is narrow and durability is low.
- Shadow and poison equipment can naturally support dagger play, but dagger
  itself should not become the whole shadow identity.

### Bulwark Guard

Heavy weapons should no longer own the anti-armor role. That belongs to
spear/lance.

Accepted direction:

- Heavy weapon hit or crit can prepare one damage-reduction charge.
- The charge only applies if the armor slot contains armor, not an offhand
  weapon.
- The next incoming hit consumes the charge.
- This keeps the tank identity tied to heavy weapon plus armor, while preventing
  dual-weapon builds from receiving free mitigation.

### Piercing Line

Spear/lance keeps armor penetration or armor break.

- It is the clean high-defense answer.
- It should not also become the tank form.
- Its damage can stay medium because its value comes from ignoring or reducing
  enemy defense.

### Arcane Resonance

Staff/focus should not rely on crit-trigger slow. That identity is too small and
too easy to replace with sword or dagger.

Accepted direction:

- Hit grants one resonance stack.
- At two stacks, the next hit consumes resonance.
- First priority: strengthen the strongest equipped element among fire, ice,
  thunder, and poison.
- If no element is present, trigger a magic bolt that deals direct damage.
- Do not include glimmer/light, shadow, or void in the weapon buff. Those are
  affinity or special-weapon identities and should have their own buffs.

Suggested data shape:

```js
{
    id: 'focus',
    label: 'Arcane Resonance',
    name: '法術共鳴',
    triggerCondition: 'hitBuildResonance',
    resonanceStacksRequired: 2,
    resonanceElements: ['fire', 'ice', 'thunder', 'poison'],
    fallbackEffect: 'magicBolt'
}
```

## Affinity And Group Lines

These are not all ordinary elements. Treat them as equipment-line identities or
monster-group affinities. Do not automatically feed them into `Arcane Resonance`.

| Affinity/group | Tier role | Intended identity | Notes |
| --- | --- | --- | --- |
| Fire | Element | Direct bonus damage, burn pressure, burst. | Valid `Arcane Resonance` target. |
| Ice | Element | Slow, control, cold pressure. | Valid `Arcane Resonance` target. |
| Thunder | Element | Stun checks, sharp tempo interruptions. | Valid `Arcane Resonance` target. |
| Poison | Element | Poison accumulation and execute pressure. | Valid `Arcane Resonance` target. |
| Glimmer | Light precursor | Minor rhythm correction, focus, route-light flavor. | Not an element target. Keep lower than formal light. |
| Light | High-tier affinity | Reliable rhythm acceleration, anti-void preparation, late counterplay. | Not an element target. Own special buffs. |
| Shadow | Void precursor | Low-tier lifesteal, crit, dodge, assassination. | Strengthen the connection to void through weak lifesteal. |
| Void | High-tier affinity | Devour, damage over time, damage converted into healing. | Strong and late. Do not give its full identity to shadow. |
| Earth/Stone | Group affinity | Guarding, endurance, shields, heavy bodies. | Can support heavy or defensive equipment lines. |
| Life/Nature | Group affinity | Regeneration, sustain, vines, forest protection. | Separate from poison unless a monster line explicitly joins them. |
| Undead/Bone | Group affinity | Bone weapons, soul traces, curses, anti-undead tools. | Good bridge into staff/focus and early eerie equipment. |
| Beast/Hunter | Group affinity | Pursuit, bleed-like pressure, hide/leather, hunting utility. | Supports early armor, accessories, and chase drops. |
| Dragon | High-tier monster group | Fire pressure, authority, boss-scale materials and anti-dragon gear. | Should include spear/armor/accessory support, not only swords. |
| Titan/Giant | High-tier monster group | Heavy blows, mitigation, resilience, colossal armor. | Heavy/tank identity belongs here more than armor-break. |
| Demon/Abyss | Late hostile group | Fire, forbidden power, endurance pressure, late risk. | Must not blur into full void unless explicitly designed. |
| Ancient/Relic | Special group | Runes, all-round utility, rule-bending craft hooks. | Use carefully to avoid becoming generic best-in-slot. |
| Casino | Source identity | Risk, odds, cheating, debt, conditional rewards. | Source identity, not an element. Requires strict item specs. |

## Equipment Series Roles

| Role | Meaning | Strength target |
| --- | --- | --- |
| `starter` | First equipment, durability learning, early survival. | Weak but necessary. |
| `weak_fallback` | Broad craft coverage across weapon forms. | Below special drops; easy to replace but reliable. |
| `monster_chase` | Monster or biome identity gear. | Stronger than fallback; should express the source. |
| `dungeon_reward` | Dungeon-exclusive or dungeon-skewed gear. | Strong draw for optional dungeons. |
| `dungeon_counter` | Gear that helps solve a dungeon or environment. | Useful and targeted, not universal. |
| `boss_milestone` | Boss or major line reward. | Noticeably powerful and story-matched. |
| `elemental_chase` | Fire/ice/thunder/poison build gear. | Enables elemental builds and staff resonance. |
| `high_tier_precursor` | Glimmer/shadow lead-ins to light/void. | Distinct but weaker than the high-tier affinity. |
| `late_game_chase` | Late monster or elite pursuit. | Strong and more specialized. |
| `late_game_precursor` | Pre-final route toward void/abyss/light pressure. | Strong but controlled. |
| `final_boss_chase` | Final mainline boss reward. | High power with clear identity. |
| `postgame_counter` | Late light/tower preparation. | Strong but gated by late route. |
| `tower_endgame` | Future tower endgame. | Paused until tower rewrite. |

## Current Series Positioning Notes

- All seven baseline series stay weak fallback series. Their job is guaranteed
  form continuity, not excitement or best-in-band power.
- `spider_venom`, `jungle_series`, and `hydra_venom` should form the poison and
  fast-weapon pressure path.
- `glimmer_initiate` should express minor rhythm/focus support, not replace
  formal light.
- `shadow_series` and `shadow_legion` should move toward weak lifesteal, crit,
  dodge, and assassination so shadow feels like a real precursor to void.
- `titan` should move away from armor break and toward heavy weapon, armor,
  mitigation, and resilience.
- `elemental_series` should be the first major home for staff/focus resonance
  builds using fire, ice, thunder, or poison.
- `dragon_scale` and `dragon_slayer` must keep spear, armor, and accessory
  support visible so dragon content does not collapse into another sword line.
- `cursed_shard` already has a drop source but no current use. Reserve it for
  the formal weapon rebuild and assign it only when a matching cursed, undead,
  or shadow recipe has a clear level band and acquisition role.
- `radiant_series` is formal light, not merely stronger glimmer.
- `void_tower` remains paused with tower rewrite. Do not expand it while tower
  systems are paused.

## Current Implementation Checkpoint

Validated first-run state:

- The formal catalog contains 76 first-run weapons: 35 baseline-series weapons
  and 41 special weapons.
- All seven Lv10 bands have one complete sword, dagger, heavy, lance, and focus
  baseline series. The formal audit reports no unknown forms or blueprint gaps.
- The five formal combat identities are implemented: Steady Stance, Quick
  Chain, Bulwark Guard, Piercing Line, and Arcane Resonance.
- Neutral baseline focuses support one replaceable fire, ice, thunder, or poison
  attunement without a separate magic-power stat.
- `assassin_blade`, `wolf_fang`, canonical forge materials, and obsolete starter
  equipment have completed normalization.
- The approved current batch contains 53 equipment images and 21 formal
  blueprint images. Baseline series use one shared five-object blueprint instead
  of obsolete per-form blueprint files.

Open work:

- [planned] [P1] [catalog-art] Review the remaining non-casino mappings
  Owner file(s): `src/js/data/Recipes.js`, `src/js/data/BossEquipment.js`, `src/js/data/AssetManifest.js`
  Source of truth: live recipe and Boss craft identities
  Validation: `scripts/AssetCoverageCheck.mjs`, manual user approval
  Notes: Six crafted results and five Boss craft blueprints remain; the 33 casino-special mappings are paused and excluded.

- [deferred] [P2] [material-use] Give `cursed_shard` one formal destination
  Owner file(s): `src/js/data/Materials.js`, `src/js/data/Recipes.js`, `src/js/data/FirstRunLootBalance.js`
  Source of truth: the Lv24-40 cursed, undead, and shadow source graph
  Validation: `scripts/ItemFlowCheck.mjs`, `scripts/DataConsistencyCheck.mjs`
  Notes: Preserve its current source until a level-appropriate special craft is approved; do not let one monster own every source layer.

- [deferred] [P1] [balance] Assign final values and rates only after map-function review
  Owner file(s): `src/js/data/Equipment.js`, `src/js/data/Recipes.js`, `src/js/data/Monsters.js`
  Source of truth: live databases and user playtest feedback
  Validation: `scripts/DifficultyProgressionCheck.mjs`
  Notes: Do not add runtime multipliers or make this framework a second source of numeric truth.
