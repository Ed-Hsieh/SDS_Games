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
- Added `ChapterMapFramework.js` and wired the map away from visible
  low/medium/high/death route labels. Fogged unexplored movement now costs double
  fatigue, while town/watchpost reveal areas provide clear map anchors. Void rift
  teleport is retired.
- Added `QuestSpineFramework.js` plus `scripts/QuestSpineCheck.mjs` so the
  existing main quests are mapped into a seven-chapter planning spine before the
  playable quest chain is rewritten.
- Adjusted the quest spine rule away from quest-count balance. Chapters are now
  checked by meaning beats: large goal, exploration, clues, equipment pressure,
  town-state change, boss convergence, and dungeon side-story support.
- Landed the first chapter route plan in `ChapterOneRoutePlan.js`. `main_001`
  now progresses through first visits to the South Gate Farm, Hunter Boardwalk,
  and Old Campfire landmarks instead of generic low-zone steps.
- Adventure handbook quick records now surface first-chapter route progress, and
  the DEV panel has a First Chapter tab for route visits and boss-line setup.
- Added `TownStateResolver.js` and wired the lobby town map to runtime visibility
  rules. First-chapter initial town now shows only the opening places/residents,
  while black market, casino, tower, and later NPCs wait for town-state flags.
- Quest completion now applies `QuestStories.characterProfile.townState` when
  present, so side-story reports can visibly change the town.

## Current Runtime Status

- `TownRebuildPlan.js` is partially wired into lobby visibility through
  `TownStateResolver.js`. Shop, forge, market, and casino service gates still
  need to read the same resolver in later passes.
- Casino showcase UI and inspection flags exist, but the owner long side quest and
  final showcase choice are framework-only.
- Quest story placement exists, but reward redistribution across Lv1-Lv70 is still
  pending.
- The quest spine is validated separately from `Quests.js`; current playable
  quests still use the old chapter 1-3 data until the user approves the new route
  order.
- Art generation is intentionally deferred.
- Documentation updates should follow `AGENT_UPDATE_PROTOCOL.md`; runtime JS/data
  remains the source of truth for implemented behavior.

## Next Good Step

Review the seven-chapter quest spine in `QuestSpineFramework.js`. If approved,
start the runtime quest pass: retarget old low/medium/high/death objectives,
reorder `main_008`, rechapter `main_011` through `main_015`, and reduce quest
reward material overfeeding. Keep dungeon integration as side-story support unless
the user approves a concrete mainline dungeon plan. The first-chapter route is now
the reference pattern for later chapter route-node objectives.

## Next Resume Task

Continue by validating the first-chapter town state in-game, then wire shop,
forge, market, and casino service access to the same town-state resolver. The
quest-spine runtime pass remains pending after the first-chapter loop is approved.

Target result:

- Keep `Quests.js` playable while moving it toward the seven-chapter spine.
- Replace old route-layer objectives with landmark/clue-oriented objectives.
- Align main boss convergence with `ChapterBossPlan`.
- Leave new monsters, materials, and images out until the route plan is approved.

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
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\QuestSpineCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\ChapterOneRouteCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\TownRuntimeCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\SideStoryNarrativeTaxonomyCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\BetaConvergenceCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\AssetCoverageCheck.mjs
```
