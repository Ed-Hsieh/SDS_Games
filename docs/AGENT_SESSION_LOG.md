# Agent Session Log

Last updated: 2026-07-06

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
  `CASINO_ROUTE_FRAMEWORK.md`, `ART_STYLE_GUIDE.md`, and
  `IMAGE_GENERATION_PROMPTS.md`.
- Removed old image-generation influence docs from the sheet/crop/art-v2 pipeline.
  Future image generation should use `IMAGE_GENERATION_PROMPTS.md` as the prompt
  standard and `ART_STYLE_GUIDE.md` as the visual reference guide.
- Added `OBSOLETE_CLEANUP_PLAN.md` to record remaining obsolete pipeline and
  compatibility cleanup targets.
- Added `AGENT_UPDATE_PROTOCOL.md` so future agents use fixed document, progress,
  cleanup, image prompt, and handoff formats instead of inventing new ones.

## Current Runtime Status

- `TownRebuildPlan.js` is not fully wired into UI/runtime gates yet.
- Casino showcase UI and inspection flags exist, but the owner long side quest and
  final showcase choice are framework-only.
- Quest story placement exists, but reward redistribution across Lv1-Lv70 is still
  pending.
- Art generation is intentionally deferred.
- Documentation updates should follow `AGENT_UPDATE_PROTOCOL.md`; runtime JS/data
  remains the source of truth for implemented behavior.

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

Parallel cleanup note:

- If the user asks for cleanup before the resolver, start with the high-confidence
  old art-v2 sheet/crop pipeline listed in `OBSOLETE_CLEANUP_PLAN.md`.

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
