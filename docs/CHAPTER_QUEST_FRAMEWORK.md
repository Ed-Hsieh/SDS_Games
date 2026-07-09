# Chapter Quest Framework

Last updated: 2026-07-08

## Purpose

The game is being stretched toward Lv1-Lv70 content. Main quests, side quests,
town recovery, equipment sources, dungeons, and third-party sources need a shared
chapter spine before rewards are redistributed.

Combat redesign and tower rewrite are paused. This framework only defines where
story and systems should land.

## Runtime Spine Files

These files are current scaffolding for systems and validation, not approved
canon after the clean narrative reset. Do not treat their plot content as final
until `docs/MAIN_STORY_BIBLE.md` defines the central mystery, character arcs, and
seven chapter promises.

- `src/js/data/ChapterMapFramework.js` is the current map-route spine. It removes
  the old visible low/medium/high/death route identity and maps existing
  landmarks, watchposts, and boss routes into seven chapters.
- `src/js/data/QuestSpineFramework.js` is the current main-quest spine. It maps
  existing `main_001` through `main_015` into the planned seven-chapter route
  without changing the playable `Quests.js` chain yet.
- `src/js/data/ChapterOneRoutePlan.js` is the first landed chapter route. It maps
  the opening route, silver-thread ambush, forest guardian trace, and blood-moon
  side route to concrete landmarks.
- `scripts/QuestSpineCheck.mjs` validates that every current main quest is mapped,
  each planned boss has a convergence quest, and every chapter has the required
  meaning beats behind the surface quest display.
- `scripts/ChapterOneRouteCheck.mjs` validates first-chapter landmark routes,
  `main_001` route-target wiring, and first-chapter boss story chains.

## Quest Display Rule

Quest count is not the design target. A chapter can surface as one large objective,
several quests, or a mixed clue log, but the underlying spine must still carry:

- A clear chapter-scale goal.
- Route exploration that makes landmarks matter.
- Non-linear information or clues.
- Equipment pressure before the boss.
- A town-state change or NPC/environment consequence.
- Boss convergence as the chapter payoff.
- Dungeon side-story support for the same level band.

Dungeons are not mandatory mainline fillers. They should exist across level bands
as side-story and equipment-support routes. If a dungeon is moved into the main
chapter route, the plan needs to say why before implementation.

## Narrative Writing Authority

Use `docs/NARRATIVE_WRITING_GUIDE.md` before rewriting quest prose, NPC dialogue,
landmark descriptions, relationship records, or multi-speaker scenes. This
chapter framework owns placement and meaning beats; the narrative guide owns the
voice, scene rhythm, objective clarity, and staging rules.

Use `docs/MAIN_STORY_BIBLE.md` before changing the central mystery, chapter
reveals, character entry/exit, or long-form plot structure. This chapter
framework should follow the accepted story bible, not invent plot twists inside
reward or quest-placement tables.

## Chapter Spine

| Chapter | Level | Title | Core Focus |
| ---: | ---: | --- | --- |
| 1 | 1-10 | 不響的鐘 / The Bell That Would Not Ring | Broken town, south gate, first route investigation, early equipment pressure, `forest_guardian` convergence. |
| 2 | 11-20 | 斷路上的藥味 / Medicine On The Broken Road | Supply, medicine, market recovery, old evacuation records, `lich` convergence. |
| 3 | 21-30 | 影子仍守夜 / Shadows Still Keep Watch | Shadow precursor routes, old orders, rumor pressure, `shadow_commander` convergence. |
| 4 | 31-40 | 石心與灰雨 / Stone Heart, Ash Rain | Stone routes, forge weight, regional instability, `ancient_titan` or `ash_baron` convergence. |
| 5 | 41-50 | 元素失衡 / The Elements Lose Their Shape | Elemental fronts, dungeon preparation, advanced forge planning, `elemental_lord` convergence. |
| 6 | 51-60 | 龍看見舊約 / The Dragon Remembers The Pact | Dragon route pressure, high-tier preparation, old pact reveal, `elder_dragon` convergence. |
| 7 | 61-70 | 裂鐘回聲 / Echoes Of The Broken Bell | Final town network test, forbidden shortcuts, void/light pressure, `demon_lord_asariel` convergence. |

## Chapter 1 Runtime Target

Chapter 1 should land before later chapter rewrites.

- Start town state: only `village_elder`, `town_scholar`, and south gate access
  are clearly active.
- First objective: investigate three nearby route landmarks and record whether
  the roads still show footprints, smoke, or monster traces.
- First pressure: fatigue, fog, weak equipment, and the need to survive with
  limited resources.
- First combat clue: `ambush_mantis` can teach that monsters are evidence, not
  only loot containers.
- First boss: `forest_guardian` is the convergence of broken route signal, forest
  reaction, and the cracked bell mystery.
- First reward direction: route clarity, handbook records, modest survival
  supplies, and a controlled path toward forge/market recovery. Avoid excess
  material rewards.

## Placement Rules

- Chapter rewards should match the story cause. Repairing a forge should unlock
  forge service, recipes, or craft identity. Repairing a route should change stock,
  map safety, or information flow.
- Short side quests can give ordinary rewards. Medium and long side quests need
  story-matched rewards: function unlocks, equipment, recipes, access, or unique
  information.
- Elite monsters and non-main bosses can drop stronger and more distinct rewards
  than normal monsters, but their drops should still fit the monster body, weapon,
  region, and chapter.
- Base material drop rates should stay controlled because crafting requirements are
  not intended to become heavy grind walls.
- Shadow is a weak precursor to void and should begin around Lv24-30.
- Glimmer is a weak precursor to light and should bridge into late radiant content.
- Void and light are high-tier forces. They should not replace the weaker precursor
  tiers too early.

## Town Recovery By Chapter

| Chapter | Town Direction |
| ---: | --- |
| 1 | Town is visibly damaged. Lobby, south gate, first NPCs, and basic shop access are unstable. |
| 2 | Market, apothecary, route safety, and information board begin to matter. |
| 3 | Casino temptation, black market contact, shadow precursor crafting, and rumor routes open. |
| 4 | Town services become preparation choices for elemental threats. |
| 5 | Advanced forge contracts and dungeon preparation become central. |
| 6 | Forbidden trading and casino consequences can start echoing into future story. |
| 7 | Radiant chapel and glimmer-to-light preparation support Lv70 content. |

## Reward Distribution Direction

- Normal mobs: basic materials, common equipment, small regional identity.
- Strong normal mobs: uncommon materials, occasional equipment with a clear body or
  tool connection.
- Elite monsters: better materials, unique equipment, recipes, or access keys.
- Non-main bosses: strong themed gear and dungeon-specific craft objects.
- Main bosses: signature equipment that visually matches the boss-held or boss-worn
  object.
- Casino: ticket-driven random pools with clear rates and unique items, but chapter
  strength must stay within the chapter's power curve.
- Forge: controlled targeted power through recipes, blueprints, and material routing.
- Black market: targeted but risky sources, especially forbidden or shadow-adjacent
  objects.

## Open Implementation Work

- Rebuild the seven-chapter story promises before rewriting the playable quest
  chain.
- Existing quests still need full reward redistribution by chapter.
- First-chapter `main_001` now uses `chapter1_route_intro` instead of generic
  low-zone exploration. Later chapter objectives still need the same route-node
  pass.
- Existing `Quests.js` chapter values still reflect the old 1-3 chapter runtime
  chain. Rechaptering should happen only after the spine is approved.
- Old route objectives such as low/medium/high/death need to be retargeted to
  route nodes or clue nodes.
- Existing monster/equipment data needs to be aligned with this chapter framework.
- Dungeon reward tables need a pass after equipment families are finalized.
- Combat changes are paused and should not be mixed into this pass.
- Tower content is paused and should not be used as a reward dependency.
