# Town Rebuild Convergence

Last updated: 2026-07-18

## Purpose

The town should stop feeling like a static menu hub. It should begin as a broken
shelter with closed services, missing NPCs, dangerous routes, and incomplete
information. The player repairs function through story, supply, trust, and risky
third-party sources.

The scene-driven town foundation is now implemented. It does not generate images,
assign map-dependent rewards, redesign combat, or build tower content.

## Direct-Rewrite Policy

Town rebuild work may be incompatible with the old town, shop, market, casino, or
dialogue flow. If the old data or interface blocks the intended recovery network,
replace the core flow directly. Do not keep obsolete behavior alive through soft
fallback layers.

Stable systems that should not be disturbed in the first pass:

- Inventory and backpack.
- Commission helper.
- Existing save compatibility unless a future migration plan is explicitly made.

## Current Runtime State

- `TownPlaces.js` owns eight active places and colocated scene conditions.
- `TownStateResolver.js` evaluates scene, run, chapter, fate, resident, action,
  and visual-state conditions without legacy aliases.
- `StorySceneRegistry.js` and `StoryStateContract.js` own mandatory story order,
  first/second-run fate, and achievement memory.
- `MarketSupply.js` exposes one public merchant and baseline medicine only. Mia
  has no transaction surface; removed service NPCs no longer appear as vendors.
- `NPCDialogues.js` contains optional ambient dialogue only. Mandatory character
  development belongs to the screenplay registry.
- `TownRebuildPlan.js` was removed after the resolver and place data replaced it.
- Map-dependent stock, orders, exchanges, items, materials, equipment, and
  rewards remain unbound until map functionality is approved.

## Rebuild Phases

| Phase | Level | Title | Player Feeling |
| --- | ---: | --- | --- |
| `phase_00_broken_town` | Chapter 1 | Broken Services | I am making the town usable, not just opening menus. |
| `phase_01_first_network` | Chapter 2 | First Recovery Network | Gold, materials, routes, records, and trust become connected. |
| `phase_02_temptation_and_shadow` | Chapter 3 | Temptation And Shadow | Shortcuts appear, but they smell dangerous. |
| `phase_03_specialized_town` | Chapters 4-5 | Specialized Services | The town becomes a preparation network for hard content and then visibly absorbs first-run loss. |
| `phase_04_terminal_preparation` | Chapters 6-7 | Terminal Preparation | Earlier rescues and failures decide how ready and alive the town feels. |

## Facility Gates

| Gate | Initial State | Intended Unlock Logic |
| --- | --- | --- |
| Town map and hotspots | Available but sparse | Story flags change visible damage, access, resident presence, actions, and background state. |
| Mia's herb workroom | Opening story only | Private relationship/story location. Never a shop, clinic menu, apothecary, or market fallback. |
| Market | Closed or half-empty | Route safety and deliveries reopen public trade; Mia's completed research authorizes medicine recipes. |
| General shop | Basic stock only | Safe roads expand ordinary supplies. It remains distinct from the market's vendor scene. |
| Forge | Closed | Repair forge, recover the blacksmith's working route, then unlock recipes and blueprint contracts. |
| Casino | Rumor or locked door | Showcase curiosity opens Vesper's route; games feed ticket pools and chapter-bounded prize pools. |
| Black market | Hidden | Revealed through casino collateral, forbidden supply evidence, or approved story flags. It is not a normal market resident. |
| South Gate | Damaged but reachable | Patrol, lamplight, and chapter routes alter safety, return staging, and available departures. |

No radiant chapel is added to the mandatory town network. Formal light and Void
may open as optional second-run external map routes, but they do not create a
fallback healer, shop, or required town facility. Later DLC may extend those
routes beyond their first base-game resolution.

## Town Place Contract

Every town place resolves from story state before it renders. A place record owns
presentation and available actions; a character dossier owns personality and
dialogue; a service database owns transactions or crafting. These responsibilities
must not be merged back into one scene class.

| Field | Requirement |
| --- | --- |
| `placeId` | Stable id for lobby navigation and scene return. |
| `placeType` | `public_service`, `private_story`, `civic`, `route_gate`, `temptation`, or `hidden`. |
| `visibleWhen`, `enterWhen` | Explicit current-run story conditions. Visibility and access are separate. |
| `visualState` | One resolved broken, sparse, recovering, living, mourning, abandoned, or ending-specific state. |
| `residentIds` | Only approved characters currently present. A service does not require a resident invented for continuity. |
| `actionIds` | Commands available at this place; each action has one owning system. |
| `sceneBindings` | Dialogue/event scenes available here, including run and fate conditions. |
| `returnTarget` | Stable place or town-map destination after service or story exit. |

Mia's workroom uses `private_story`. Its accepted state sequence is:

| State | First Run | Second Run | Available Function |
| --- | --- | --- | --- |
| `opening_care` | Protagonist wakes under Mia's care. | Same physical opening; achievement memory changes interpretation, not the room. | Story scene only. |
| `working` | Chapters 1-5 before the operation. | Chapters 1-5 before the operation. | Recipe research/authorization and relationship events. |
| `operation` | Four-element shard surgery. | Same surgery with the pressure-free procedure. | Fixed mainline scene; no service UI. |
| `quiet_after_loss` | Mia dead; room remains accessible. | Not used. | Relationship tile `最後一頁`; no new research. |
| `living_after_rescue` | Not used. | Mia survives, opens the long-closed window, delegates, and accepts care. | Later relationship events and approved recipe research. |

No state turns the workroom into a public counter. The old
`apothecary_assistant` is not used to cover Mia's death.

## Market Ownership Contract

The market is rebuilt as the owner of public trade. It may display approved
vendors through portrait-backed function entries, but transactions, stock, and
route consequences belong to the market system rather than to an NPC dialogue
record.

Market stock has four additive layers:

1. `baseline`: ordinary consumables and materials available whenever the market
   is open.
2. `route_supply`: goods delivered because an authored adventure segment, carrier
   route, or dungeon source was made safe.
3. `recipe_authorization`: medicine the market is permitted to stock after
   Mia completes the relevant research event.
4. `chapter_specialization`: chapter-bounded preparation stock unlocked by forge,
   dungeon, market, or approved third-party story progress.

Rules:

- Mia never owns buy, sell, price, inventory, or vendor UI.
- Her death does not close the market and does not remove baseline medicine or
  recipes already authorized in the current run.
- In the first run, her death stops only future Mia research that has not yet
  happened. In the second run, her survival permits those later authorizations.
- Stock must respect chapter strength and route sources. A recipe flag cannot
  silently create a material supply line.
- Merchant presentation may remain functional until that character is fully
  authored. `apothecary_assistant`, `supply_captain`, `rumor_broker`, and `tinker`
  are not required for market continuity.
- Black-market transactions, casino prizes, forge crafting, and general-shop
  stock remain separate systems even if the town map links to them nearby.
- The rebuilt market interface opens one full place scene. Vendor portraits and
  function lists may select an action surface, but it must not reproduce the old
  stack of nested story cards and duplicate location headers.

## Town-State Resolver Contract

The resolver receives only current-run facts plus achievement memory where a
second-run intervention explicitly needs it.

Inputs:

- Chapter and mainline scene flags.
- Current-run route, delivery, dungeon, and Boss results.
- Current-run character presence, fate, and relationship state.
- Facility repair and service unlock state.
- First- or second-run identity and approved achievement-memory gates.

Outputs:

- Visible and enterable places.
- One visual state per place.
- Present residents and their scene/dialogue variants.
- Available actions and the owning system for each action.
- Market/forge/shop/casino stock profile ids, never raw duplicated stock logic.
- Town return scene, handbook update, and ambient town-temperature state.

The resolver must not infer canon from old NPC ids, create substitute residents,
or translate obsolete `town.apothecary.*` flags. Those flags are no longer part
of the active town, market, or passive-effect flow.

## Recovery Nodes

The accepted recovery nodes are:

- South Gate First Repair.
- Mia's First Recipe Authorization. This is a story/research node, not a
  facility opening.
- Forge Relighted.
- Market Supply Line.
- Civic Records And Handbook Recovery.
- Casino Showcase Hook.
- Black Market Contact.
- Lamplighter Routes.
- Advanced Forge Contracts.
- Final Glimmer Preparation. This uses base-campaign systems and does not create a
  radiant chapel.

Each node should eventually connect story flags to one or more real gameplay
changes: visible town state, stock, route access, recipe access, information, or a
third-party source.

## Lived Recovery Signals

A recovery node is not complete when it only exposes a button or action surface.
The next authored town return must show one ordinary consequence using accepted
places, props, and distant resident silhouettes rather than introducing a new
service NPC.

| Recovery Node | Required Human Signal |
| --- | --- |
| South Gate First Repair | A departure and the same person's return are written on the board; the lamp and flag remain ordinary working tools. |
| Forge Relighted | The first visible queue contains a leaking pot, loose hinges, and a cracked cart wheel before weapon work. |
| Mia's First Recipe Authorization | Mia rechecks the returning protagonist, but the written prescription remains unavailable until a supply route exists. |
| Market Supply Line | Finite medicine is wrapped for waiting residents. Mia checks the batch and leaves every transaction to the merchant. |
| Civic Records And Handbook Recovery | Names receive dates and last known places; uncertainty remains visible instead of becoming heroic closure. |
| Casino Showcase Hook | Its apparent abundance is staged against finite oil, coal, medicine, and repair work elsewhere in town. |

Chapter 1 introduces the core cast sequentially through movement and work, not a
roll call. Chapter 2 shows goods and names circulating again. Chapter 3 makes the
working recovery network emotionally valuable before the casino offers a faster,
cleaner-looking alternative.

## Branch Policy

NPC branches should only become real branches when they affect an ending, later
chapter state, durable faction state, or a future NPC relationship. Local flavor can
change small lines, prices, or clue order, but should not trick players into save
loading for fake consequences.

Humor is character-based, not situation-based. A warm NPC may use humor in crisis;
a severe NPC may not. Dialogue should preserve each character's personality instead
of forcing one tone onto every scene.

Use `docs/NARRATIVE_WRITING_GUIDE.md` for prose rhythm, NPC voice, objective
clarity, relationship records, and multi-speaker event staging. This town document
owns town-state recovery and facility gates; the narrative guide owns how those
changes are written and presented.

Use `docs/MAIN_STORY_BIBLE.md` before changing major NPC entry/exit timing,
long-form character arcs, or mainline reveals that affect town staging.

## Next Integration Order

Current checkpoint on 2026-07-18: screenplay bindings, town places,
`TownStateResolver`, public market ownership, forge entry, and obsolete
apothecary/reserve-service removal are implemented as a reviewable runtime
foundation. They are protected by `StoryRuntimeCheck.mjs`,
`TownRuntimeCheck.mjs`, and `GameExperienceAudit.mjs`.

Remaining order:

1. Complete the Chapter 1-2 no-skip town-return review, including market
   reopening, Mia's recipe authorization, forge recovery, and character absence
   states.
2. Finalize map and scene functions before assigning final rewards, stock layers,
   drop rates, and optional-side-story owners.
3. Bind approved town-state backgrounds to the resolver states and review them
   in the same camera geometry; image production has started, but runtime binding
   is incomplete.
4. Add final ambient copy only after state, stock, and scene ownership agree.

Do not recreate an apothecary, reserve vendor, market-card compatibility layer,
or alternate town-state resolver while completing these steps.
