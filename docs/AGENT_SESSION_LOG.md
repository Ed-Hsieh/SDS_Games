# Agent Session Log

Last updated: 2026-07-09

## Current Direction

The project is being rebuilt as a desktop-focused 2D RPG. The current priority is
the clean story rebuild and major NPC profile pass before rewriting runtime
quests. The active design target is a dark fantasy two-run structure: first-run
false victory and loss, second-run understanding and limited rescue.

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
  `MAIN_STORY_BIBLE.md`, `NARRATIVE_WRITING_GUIDE.md`,
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
- Added `EQUIPMENT_SERIES_FRAMEWORK.md` to record equipment-series roles,
  weapon-form quadrants, affinity/group boundaries, and planned weapon ability
  replacements before combat implementation resumes.
- Added detailed character dossiers for `village_elder`, `herbalist`,
  `town_scholar`, `standard_bearer_frey`, `lamplighter_tavi`, and `blacksmith`.
  These files now own accepted background, first-run arc, second-run reading, and
  unresolved fate questions for those characters.
- Added in-progress `street_beggar` dossier. Accepted so far: he is an outside
  lost-settlement survivor, erratic but not omniscient, likely first-run
  disappearance; his original identity and madness logic are still unresolved.

## Current Runtime Status

- `TownRebuildPlan.js` is partially wired into lobby visibility through
  `TownStateResolver.js`. Shop, forge, market, and casino service gates still
  need to read the same resolver in later passes.
- Casino showcase UI and inspection flags exist, but the owner long side quest and
  final showcase choice are framework-only.
- Quest story placement exists, but reward redistribution across Lv1-Lv70 is still
  pending.
- Weapon-form positioning has been accepted in documentation, but runtime combat
  profiles still need a later pass to replace Blade Tempo, focus slow, and heavy
  armor-break behavior.
- The quest spine is validated separately from `Quests.js`; current playable
  quests still use the old chapter 1-3 data until the user approves the new route
  order.
- Art generation is intentionally deferred.
- Documentation updates should follow `AGENT_UPDATE_PROTOCOL.md`; runtime JS/data
  remains the source of truth for implemented behavior.
- Narrative prose, NPC voice, objective clarity, side-story tone, and
  multi-speaker scene staging should follow `NARRATIVE_WRITING_GUIDE.md`.
- Mainline suspense, long-form plot reveals, character arcs, and character
  entry/exit should follow `MAIN_STORY_BIBLE.md`.
- Character-specific accepted details now live under `docs/characters/*.md`.
  The current completed core profiles are village elder, herbalist, town scholar,
  Frey, Tavi, and blacksmith. Street beggar is in progress; casino owner remains
  unprofiled in this pass.

## Next Good Step

Continue the NPC profile pass before runtime quest rewriting. Next best step is
to finish the `street_beggar` route by defining what he was before the lost
settlement disaster, what rule of the world broke his mind, why he treats the
protagonist as story-centered, and when he disappears in the first run. After
that, profile the casino owner.

## Next Resume Task

Continue the story-design pass by resolving the street beggar's madness logic and
then drafting the casino owner's character dossier. Do not implement runtime
quest rewrites until the core NPC motivations and first-run/second-run roles are
accepted.

Target result:

- Finish the core NPC profile set before first-chapter runtime rewrite.
- Keep accepted character details in `docs/characters/*.md`.
- Preserve unresolved questions explicitly instead of inventing hidden lore.
- Leave new monsters, materials, locations, and images out until story reasons
  and resource needs are approved.

Parallel cleanup note:

- If the user asks for cleanup before the resolver, start with the high-confidence
  old art-v2 sheet/crop pipeline listed in `OBSOLETE_CLEANUP_PLAN.md`.

Suggested documentation files:

- `docs/characters/STREET_BEGGAR_PROFILE.md`
- `docs/characters/BLACKSMITH_PROFILE.md`
- `docs/characters/STANDARD_BEARER_FREY_PROFILE.md`
- `docs/characters/LAMPLIGHTER_TAVI_PROFILE.md`
- `docs/MAIN_STORY_BIBLE.md`

Out of scope:

- Runtime quest rewrite.
- Combat redesign.
- Tower rewrite.
- Image generation.

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
