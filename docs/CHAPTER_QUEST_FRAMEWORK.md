# Chapter Quest Framework

Last updated: 2026-07-05

## Purpose

The game is being stretched toward Lv1-Lv70 content. Main quests, side quests,
town recovery, equipment sources, dungeons, and third-party sources need a shared
chapter spine before rewards are redistributed.

Combat redesign and tower rewrite are paused. This framework only defines where
story and systems should land.

## Chapter Spine

| Chapter | Level | Title | Core Focus |
| ---: | ---: | --- | --- |
| 1 | 1-10 | 破門之後 | Broken town, south gate, first NPC recovery, basic survival routes. |
| 2 | 11-20 | 霧碑與沉鐘 | Roads widen, market supply begins, coast/ruin clues introduce larger pressure. |
| 3 | 21-30 | 黑鐵與暗影前兆 | Shadow soldiers, black iron routes, first shadow precursor sources around Lv24-30. |
| 4 | 31-40 | 四相裂線 | Fire, ice, thunder, and poison fronts compete at similar strength. |
| 5 | 41-50 | 龍脈與遠征契約 | Advanced forge, elite preparation, dragon/northern route pressure. |
| 6 | 51-60 | 深淵交易 | Void pressure, forbidden sources, casino/black-market consequences become serious. |
| 7 | 61-70 | 微光成明 | Glimmer-to-light bridge, terminal town preparation, Lv70 radiant dungeon access. |

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

- Existing quests still need full reward redistribution by chapter.
- Existing monster/equipment data needs to be aligned with this chapter framework.
- Dungeon reward tables need a pass after equipment families are finalized.
- Combat changes are paused and should not be mixed into this pass.
- Tower content is paused and should not be used as a reward dependency.
