# Casino Route Framework

Last updated: 2026-07-05

## Purpose

The casino should make players want gold, tickets, and rare outcomes before it asks
them to care about a side story. The route should begin with temptation: visible
display-case prizes, noisy ticket loops, and odds tables. Story pressure appears
after the player shows interest.

This pass only defines the framework. Full quest implementation and image
generation are deferred.

## Current Runtime Hooks

- `CasinoScene.js` already has casino venues, showcase selection, and showcase
  preview UI.
- `CasinoManager.js` tracks showcase inspection and sets `town.casino.showcase_seen`.
- `CasinoRewards.js` defines `CasinoShowcaseItems`, prize pools, and casino unique
  reward items.
- `EncyclopediaManager.js` indexes casino showcase sources.
- The future owner quest id is currently `commission_casino_showcase_001`.

## Route Stages

| Stage | Purpose | Implementation State |
| --- | --- | --- |
| Locked rumor | Casino is heard about before it becomes useful. | Planned through town phase. |
| Floor access | Games provide chips, tickets, and visible odds. | Partially live. |
| Showcase inspection | Player walks to cases and sees powerful unique items. | Partially live. |
| Owner attention | Owner notices repeated interest. | Flag/event hook exists. |
| Owner contract | Long side quest begins after enough inspection. | Framework only. |
| Final choice | Player chooses one display-case item after route resolution. | Framework only. |

## Showcase Principles

- Showcase items should be powerful, readable, and visually specific.
- If an item appears in a display case, its item art should match the displayed
  object. Do not use a generic replacement.
- The player should inspect items first, then receive story pressure.
- Final reward should be one selected item, not a vague box, unless the story is
  explicitly about the box.
- The route should not fake consequences. If owner debt, black-market ties, or
  relief-fund corruption are introduced, they must be used later.

## Owner Quest Skeleton

1. Player inspects at least two showcase items.
2. Owner or dealer starts a personalized conversation.
3. Player is asked to prove they understand the house: win tickets, check false
   odds, or trace a prize source.
4. Route reveals how the casino stabilizes or distorts the town economy.
5. Player chooses whether to expose, bargain with, or leverage the casino.
6. If resolved, one final showcase choice unlocks.

## Economy Role

- Casino games should generate ticket pressure, not replace normal progression.
- Prize pools should be random and clearly rate-listed.
- Gold should matter because it becomes the path into tickets, risks, and better
  preparation choices.
- Forge, market, dungeons, monster farming, and casino should feel like different
  preparation routes rather than one route invalidating the others.

## Future Connection Points

- Town phase: `casino_showcase_hook`.
- Flags: `town.casino.showcase_seen`,
  `town.casino.showcase_final_choice_unlocked`,
  `town.casino.showcase_final_choice_claimed`.
- Future side quest: `commission_casino_showcase_001`.
- Future black-market echo: false odds, debt, forbidden prize source.
- Future ending or late-story echo only if consequences are durable.
