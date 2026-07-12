# Casino Route Framework

Last updated: 2026-07-11

## Purpose

The casino first creates genuine desire through visible unique prizes, ticket
pressure, random pools, and published rates. Its long story then reveals how
Vesper converts desire and desperation into weighted games, debt, and Blank
Collateral. The story does not replace the casino's economy role; it exposes the
person who deliberately corrupted it.

Full runtime rewrite and image generation remain deferred until the 66-scene
screenplay is reviewed.

## Canon Authority

- Vesper's character and contract logic:
  `docs/characters/CASINO_OWNER_PROFILE.md`.
- Chapter placement and complete dialogue:
  `docs/MAIN_STORY_BIBLE.md`, scenes `ch3_s04_showcase_glass`,
  `ch3_s05_blank_creditor_trace`, `ch5_s11_town_loses_its_voice`,
  `ch6_s06_settlement_throw`, `ch6_s07_house_changes_seats`, and ending scenes.
- Chapter strength and reward placement:
  `docs/CHAPTER_QUEST_FRAMEWORK.md`.

The current runtime is inventory, not route authority. `CasinoScene.js`,
`CasinoManager.js`, `CasinoRewards.js`, and existing showcase flags may retain
useful mechanics or assets, but obsolete story choices and timings must be
removed rather than aliased.

## Fixed Character Roles

- `casino_owner`: Vesper, male, deliberately evil, no redemption.
- `casino_dealer`: compromised male dealer using the existing portrait. Accepted
  display name: `洛恩 / Lorne`. Runtime scene logic remains on the id
  `casino_dealer`.
- `black_market`: one-time source of the Blank Collateral Contract, not the
  casino mastermind and not an endless contract supplier.
- Unnamed creditor: receives losing collateral under the contract. Base content
  in the mandatory casino route does not name or depict it as Void. An optional
  second-run external route may reveal that identity after Vesper's punishment;
  later DLC may continue the creditor's wider origin.

## Route Stages

| Chapter / Stage | Player Experience | Fixed Story Result | Runtime State |
| --- | --- | --- | --- |
| Ch3 floor access | Rates are visible; games turn gold into tickets; prizes make the player want to participate. | No moral lecture precedes desire. | Rewrite required around retained game mechanics. |
| Ch3 showcase | Inspect at least two unique cases. | Vesper notices the player's desire; Lorne warns that unpriced tables use other collateral. | Existing inspection hooks are useful inventory. |
| Ch3 contract trace | Follow one acquisition record to the black market. | Contract was sold once to Vesper; creditor line is nonhuman and unnamed. | New screenplay flags required. |
| Ch4-5 pressure | Vesper personalizes temptation while Lorne makes small current-run acts of resistance. | Vesper decides to settle Lorne's remaining collateral. | New dialogue/town-state wiring required. |
| Ch6 first run | After the immediate elder pursuit, dragon confrontation, and failed old-road search, the returning player witnesses the rigged settlement and saves Lorne. | Vesper escapes; Lorne gives one current-run Loaded Die as cheating evidence; `莊家離席` unlocks. | Not implemented. |
| Ch6 second run | The same mountain-return placement occurs; achievement memory makes the current run's guest-die weight recognizable before settlement. | Lorne marks but never swaps the set. Vesper chooses one low-odds guest throw over certain surrender of collateral, owner seat, and ledger; equivalent stakes bind his ownership and fate. | Not implemented. |
| Ch6 restitution | Owner contract is removed, private collateral is frozen, and the debt ledger is exposed. | Player immediately selects one showcase grand prize; Lorne may assist transparent ticket games and claims review only as a supervised dealer, never owner or forgiven successor. | Not implemented. |

There is no branch where the player bargains with, forgives, leverages, or joins
Vesper. First-run failure and second-run punishment are both linear.

## Showcase And Prize Rules

- Showcase items are powerful, readable, visually specific, and distributed
  across weapon forms, armor, accessories, consumables, and special functions.
- Display art and awarded item art must represent the same object.
- The final reward is one freely selected display-case item, received immediately
  after the second-run Chapter 6 punishment so it remains useful before the final
  mountain route.
- The selected case remains visibly empty in the true-ending town montage. Other
  prizes remain in place and do not collapse into a generic reward box.
- Showcase strength follows chapter definitions. No unbounded graduation gear is
  inserted merely because an item is legendary.

## Random Pool Contract

Published rarity distribution remains:

| Tier | Rate |
| --- | ---: |
| Common | 60% |
| Advanced | 25% |
| Rare | 10% |
| Ultra Rare | 4% |
| Grand Prize | 1% |

- No pity meter is added.
- Every pool may contain unique equipment and every complete pool may contain a
  legendary result, but item power remains within the active chapter curve.
- Tickets are the casino play resource. Gold matters because it supports entry,
  preparation, and ticket acquisition, not because early mainline progress
  arbitrarily demands wealth.
- Clear rates do not make Vesper honest. Public ticket pools can be mathematically
  transparent while his private guest set and collateral table are rigged.

## Loaded Dice Contract

- No die crosses the run reset.
- First run: the current-run die is only cheating evidence after Vesper escapes.
- `莊家離席` preserves the remembered abnormal weight, not the object.
- Second run: the player identifies the new current-run loaded guest set before
  settlement. Lorne marks it in front of a witness.
- The dice are physically weighted, not magical or deterministic. They lower
  guest odds; the contract enforces only the witnessed result.
- Vesper's dispute rule offers two outcomes: refuse the same-set host/guest
  exchange and immediately void private collateral under civic audit, or accept
  one guest throw to preserve the house claim if he wins.
- Vesper knows the odds are bad. Control is his own temptation, so he chooses the
  throw over certain surrender and personally stakes ownership plus fate.
- He loses with the same marked, unswapped set he assigned to victims. Once he
  signs as guest, tearing the active page counts as withdrawal and immediate loss
  under his own anti-escape clauses.
- The contract collects Vesper because he personally confirmed his own fate and
  ownership as collateral. This is execution of his system, not random magic.

## Economy Boundary

- Casino games and ticket pools remain a distinct preparation path alongside
  forge, market, dungeons, and monster sources.
- Casino chips, tickets, and gold exchange need one explicit economic purpose and
  working conversion loop during runtime rewrite.
- Black-market stock, market trade, forge crafting, and casino prizes remain
  separate systems even when their stories intersect.
- After Vesper, transparent ticket games may continue. Lorne's continuity is
  restitution work, not absolution, ownership, or a replacement villain route.

## Runtime Rewrite Targets

1. Preserve only casino game mechanics that can support real animation, visible
   rates, ticket economy, and chapter-bounded pools.
2. Replace obsolete owner-choice branches with the fixed two-run sequence.
3. Replace inherited-die assumptions with current-run evidence plus achievement
   memory.
4. Bind showcase, settlement, contract collection, one-prize selection, and
   ending case state to the accepted scene ids.
5. Validate that Vesper cannot be redeemed, the black market is not blamed for
   his choices, and base content never names the creditor as Void.
