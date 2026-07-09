# Town Rebuild Convergence

Last updated: 2026-07-08

## Purpose

The town should stop feeling like a static menu hub. It should begin as a broken
shelter with closed services, missing NPCs, dangerous routes, and incomplete
information. The player repairs function through story, supply, trust, and risky
third-party sources.

This pass is a framework and documentation pass only. It does not generate images.
Combat redesign is paused, and this pass does not build tower content.

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

- `TownPlaces.js` now represents a damaged town map instead of a purely neutral hub.
- `NPCDialogues.js` and `DialogueManager.js` were rewritten around cleaner NPC
  dialogue and flag handling.
- `WorldInteractions.js` and `WorldInteractionManager.js` were rewritten around
  direct interaction data.
- `QuestStories.js` is now the direct story source. `StoryScriptRevisions.js` was
  removed.
- `TownRebuildPlan.js` defines phases, facility gates, recovery nodes, branch
  policy, character voice direction, third-party sources, and future asset needs.
- `TownStateResolver.js` now maps town-state flags to lobby-visible places,
  residents, and actions. The first chapter starts with a sparse broken-town
  cast; later NPCs, black market, casino, and tower wait for explicit flags.
- Shop, forge, market, and casino service gates are not fully wired to the
  resolver yet.

## Rebuild Phases

| Phase | Level | Title | Player Feeling |
| --- | ---: | --- | --- |
| `phase_00_broken_town` | 1-6 | Broken Services | I am making the town usable, not just opening menus. |
| `phase_01_first_network` | 7-18 | First Recovery Network | Gold, materials, routes, and trust become connected. |
| `phase_02_temptation_and_shadow` | 19-35 | Temptation And Shadow | Shortcuts appear, but they smell dangerous. |
| `phase_03_specialized_town` | 36-60 | Specialized Services | The town becomes a preparation machine for hard content. |
| `phase_04_terminal_preparation` | 61-70 | Terminal Preparation | Earlier recovery choices decide how ready the town feels. |

## Facility Gates

| Gate | Initial State | Intended Unlock Logic |
| --- | --- | --- |
| Town hotspots | Available but sparse | Each hotspot should gain visual and action states. |
| Market | Locked or half-empty | Vendor rescue, route safety, and supply contracts. |
| General shop | Basic stock only | Safe roads and quartermaster contracts expand stock. |
| Forge | Closed | Repair forge, recover blacksmith path, then unlock blueprints. |
| Casino | Rumor or locked door | Showcase curiosity opens owner route; games feed ticket pools. |
| Black market | Hidden | Revealed through rumor, debt, casino, or forbidden materials. |
| Radiant chapel | Planned | Late glimmer-to-light bridge for Lv70 radiant dungeon access. |

## Recovery Nodes

The current first set of recovery nodes is defined in `TownRebuildPlan.js`:

- South Gate First Repair.
- Apothecary Counter Reopens.
- Forge Relighted.
- Market Supply Line.
- Rumor Board Network.
- Casino Showcase Hook.
- Black Market Contact.
- Lamplighter Routes.
- Advanced Forge Contracts.
- Radiant Chapel Foundation.

Each node should eventually connect story flags to one or more real gameplay
changes: visible town state, stock, route access, recipe access, information, or a
third-party source.

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

Resume priority: build the town-state resolver first. Do not add more image work,
combat work, or tower work before this resolver pass is in place.

1. Gate shop, market, forge, and casino entry/stock from the same resolver.
2. Give every recovery node at least one story flag and one gameplay result.
3. Audit first-chapter town staging after real playtesting: opening cast,
   delayed NPC returns, and route-to-town feedback.
4. Add UI copy only after the data shape is stable.

Image asset gaps are listed through `TownAssetNeedDatabase`, but image generation
is intentionally deferred.
