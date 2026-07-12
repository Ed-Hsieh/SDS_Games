# Equipment Series Framework

Last updated: 2026-07-11

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
- Ash Baron, the expedition supreme commander, radiant Bosses, Void Bosses, and
  the planned prologue overcap demon are base-game second-run chase sources, not
  mainline convergence. Later DLC extends the light/Void and tower ecosystem
  after their first optional resolution.

## Core Rules

- Series-crafted equipment is the weak fallback path. It keeps a player's chosen
  weapon form playable, but it should not outshine monster, dungeon, elite, boss,
  casino, or special craft rewards.
- Special drops and non-series crafts are the chase path. They may be stronger,
  more distinctive, or mechanically specific because their sources ask for more
  exploration, risk, or preparation.
- Do not make every special weapon a sword. Every level band should include
  enough weapon-form support that a player is not forced out of a preferred form.
- Do not multiply every level band into every weapon form. Use series crafts as
  coverage, and let special gear selectively highlight monsters, dungeons, and
  bosses.
- `weaponSpeed` means rhythm-ring pointer speed. Higher values are harder to
  control.
- `attackSpeed` means attack cooldown/frequency. Higher values attack more
  often.
- Weapon-form effects should not duplicate affinity effects. For example, sword
  should not keep an attack-speed identity if glimmer/light already owns rhythm
  acceleration.

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

- `slime_series` and `bone_series` should stay as weak fallback series. Their
  job is coverage, not excitement.
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
- `radiant_series` is formal light, not merely stronger glimmer.
- `void_tower` remains paused with tower rewrite. Do not expand it while tower
  systems are paused.

## Implementation Targets

- [done] [P1] [combat] Replace sword Blade Tempo with Steady Stance
  Owner file(s): `src/js/utils/WeaponCombatProfile.js`,
  `src/js/managers/FightManager.js`, `src/js/utils/RhythmBarSystem.js`,
  `src/js/scenes/AdventureScene.js`, `src/js/scenes/TowerScene.js`,
  `src/js/utils/ItemDisplay.js`
  Source of truth: `docs/EQUIPMENT_SERIES_FRAMEWORK.md`
  Validation: `node --check src/js/managers/FightManager.js`;
  `node scripts/DataConsistencyCheck.mjs`
  Notes: Remove attack-speed sword identity so glimmer/light owns rhythm
  acceleration.

- [done] [P1] [combat] Replace focus slow trigger with Arcane Resonance
  Owner file(s): `src/js/utils/WeaponCombatProfile.js`,
  `src/js/managers/FightManager.js`, `src/js/utils/ItemDisplay.js`
  Source of truth: `docs/EQUIPMENT_SERIES_FRAMEWORK.md`
  Validation: `node --check src/js/managers/FightManager.js`;
  `node scripts/DataConsistencyCheck.mjs`
  Notes: Two-hit resonance should amplify fire/ice/thunder/poison or fire a
  magic bolt when no element exists.

- [done] [P1] [combat] Move heavy weapon away from armor break
  Owner file(s): `src/js/utils/WeaponCombatProfile.js`,
  `src/js/managers/FightManager.js`
  Source of truth: `docs/EQUIPMENT_SERIES_FRAMEWORK.md`
  Validation: `node --check src/js/managers/FightManager.js`;
  `node scripts/DataConsistencyCheck.mjs`
  Notes: Bulwark Guard must require armor equipped in the armor slot.

- [in_progress] [P2] [data] Align equipment-line purposes with the new quadrant
  Owner file(s): `src/js/data/RecipeSeries.js`, `src/js/data/Equipment.js`
  Source of truth: `docs/EQUIPMENT_SERIES_FRAMEWORK.md`
  Validation: `node scripts/EquipmentBalanceCheck.js`
  Notes: This is a data pass after combat profile changes are approved.
