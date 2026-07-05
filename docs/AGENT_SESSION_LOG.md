# Agent Session Log

Last updated: 2026-07-05

## Current Direction

The project is being rebuilt as a desktop-focused 2D RPG. The current priority is
the town rebuild framework: broken town state, NPC return, facility repair, market
and shop recovery, casino temptation route, third-party sources, and chapter story
placement.

Paused for now:

- Combat redesign.
- Tower rewrite.
- Image generation.

## Completed In Recent Passes

- Added direct-rewrite preference to `AGENTS.md`.
- Rebuilt town/NPC/world interaction data around the broken-town direction.
- Removed `StoryScriptRevisions.js`; `QuestStories.js` is the direct story source.
- Added `TownRebuildPlan.js` with phases, gates, recovery nodes, character voice,
  branch policy, third-party sources, and future asset needs.
- Added `ChapterQuestFramework.js` and `CasinoRouteFramework.js` as data skeletons
  for future implementation.
- Consolidated docs into a smaller authoritative set:
  `TOWN_REBUILD_CONVERGENCE.md`, `CHAPTER_QUEST_FRAMEWORK.md`,
  `CASINO_ROUTE_FRAMEWORK.md`, and `ART_STYLE_GUIDE.md`.

## Current Runtime Status

- `TownRebuildPlan.js` is not fully wired into UI/runtime gates yet.
- Casino showcase UI and inspection flags exist, but the owner long side quest and
  final showcase choice are framework-only.
- Quest story placement exists, but reward redistribution across Lv1-Lv70 is still
  pending.
- Art generation is intentionally deferred.

## Next Good Step

Implement a town-state resolver that reads quest/town flags and returns the current
town phase, active facility gates, visible town-state labels, and locked/unlocked
actions. Then connect Lobby/Town hotspots, shop stock, market stock, forge service,
and casino access to the same resolver.

## Next Resume Task

Continue with the town-state resolver. This is the next concrete development step
and should be picked up before adding more story copy or images.

Target result:

- Add a resolver data/API layer that converts quest flags and town flags into the
  current town phase.
- Return facility gate states for lobby/town map, shop, market, forge, casino, and
  future town modules.
- Make locked/unlocked actions come from the resolver instead of scattered scene
  checks.
- Wire Lobby/Town hotspots first, then shop/market/forge/casino access.
- Keep combat, tower, and image generation paused while this resolver pass is in
  progress.

Suggested implementation files:

- `src/js/data/TownRebuildPlan.js`
- `src/js/data/TownPlaces.js`
- `src/js/managers/TownStateResolver.js` or another clearly named resolver module
- `src/js/scenes/LobbyScene.js`
- `src/js/scenes/ShopScene.js`
- `src/js/scenes/ForgeScene.js`
- `src/js/scenes/CasinoScene.js`

## Verification Commands

```powershell
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\DataConsistencyCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\SideStoryNarrativeTaxonomyCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\BetaConvergenceCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\AssetCoverageCheck.mjs
```
