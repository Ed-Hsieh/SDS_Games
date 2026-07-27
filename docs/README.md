# SDS Games Development Docs

Last updated: 2026-07-27

This folder is now the compact handoff layer for the desktop RPG rebuild. Runtime
data files remain the source of truth for shipped behavior; these documents keep
the design direction readable for future Codex sessions.

## Authoritative Documents

- `TOWN_REBUILD_CONVERGENCE.md` - broken-town rebuild scope, phases, feature gates,
  and current wiring status.
- `CHAPTER_QUEST_FRAMEWORK.md` - chapter titles, level bands, quest placement,
  reward direction, the current Chapter 1 third-person 3D vertical slice, and
  the 66-scene location-binding boundary from Lv1 to Lv70.
- `MAIN_STORY_BIBLE.md` - production-facing story source for accepted character
  canon, mainline suspense, the complete 66-scene review screenplay, character
  entry/exit, first/second-run dialogue and staging, and story-to-system
  adaptation. Its 66 scenes now compile into the reviewable runtime registry.
- `characters/*.md` - source dossiers used to audit unresolved character details
  and the decisions that built the master register. Accepted changes must be
  synchronized into `MAIN_STORY_BIBLE.md`; downstream chapter writing should not
  reconstruct canon by comparing every dossier.
- `NARRATIVE_WRITING_GUIDE.md` - prose rules, NPC voice, dialogue staging,
  side-story tone, and multi-speaker scene direction.
- `CASINO_ROUTE_FRAMEWORK.md` - fixed Vesper/Lorne two-run route, ticket and pool
  economy, Loaded Dice reversal, contract boundary, showcase reward, and runtime
  rewrite targets.
- `EQUIPMENT_SERIES_FRAMEWORK.md` - seven baseline craft series, weapon-form
  contracts, source budgets, focus attunement, affinity boundaries, and open
  item-flow work.
- `ART_STYLE_GUIDE.md` - current image style rules and reference assets already in
  the project.
- `IMAGE_GENERATION_PROMPTS.md` - authoritative prompt templates for every
  generated asset category.
- `OBSOLETE_CLEANUP_PLAN.md` - only currently active cleanup and explicit
  guardrails against restoring removed map or compatibility systems.
- `AGENT_SESSION_LOG.md` - latest checkpoint for continuing development.
- `AGENT_UPDATE_PROTOCOL.md` - required formatting and update rules for future
  agent documentation changes.

## Paused This Cycle

- Second-run external Boss expansion is paused at its recorded boundary until
  first-run story, systems, and required art are complete. Later routes must use
  stable first-run achievements/evidence flags without rewriting first-run core.
- Final combat balance and broad combat redesign are paused; the current five
  weapon identities and combat VFX test path remain the implemented baseline.
- Tower rewrite is paused.
- Approved first-run story and catalog image work follows the concrete ledger in
  `ART_STYLE_GUIDE.md`. Second-run external story art, tower art, DLC light/Void
  art, casino prize art, and unapproved catalog expansion remain paused.

## Current Exploration Foundation

- `src/js/scenes/ThreeCombatDemoScene.js`
- `src/js/combat-demo/`
- `src/views/combat-demo.html`
- `src/style/combat-demo.css`
- `src/assets/models/combat-demo/`

`#combat-demo` is the sole active exploration/combat prototype. It uses Three.js
for a desktop third-person Chapter 1 vertical slice with direct movement,
camera-relative facing, lock-on combat, light and heavy attacks, dodge, stamina,
potions, room collision, evidence, loot, checkpoints, a shortcut, and a route
Boss. `ChapterDemoSession` keeps all prototype progress in memory and does not
write formal save data.

Five rooms currently cover South Gate camp, farmland, hunter boardwalk, old
campfire, and the silver-snare Boss route. Player and environment kit GLBs exist;
the three route monsters still use temporary geometry. Forest, Rotroot, mine,
production models and terrain, formal story migration, and Chapters 2-7 remain
deferred until this slice's camera, movement, combat, collision, interaction,
reset, and town-return flow is accepted.

The removed Canvas `#hunt-demo`, its layered South Gate package, old DOM map,
four-region prototype, and duplicate map/combat adapters are not valid
fallbacks.

## Runtime Story Foundation

- `src/js/data/StorySceneRegistry.js`
- `src/js/data/StoryActors.js`
- `src/js/data/StoryStateContract.js`
- `src/js/data/ChapterRegionRegistry.js`
- `src/js/data/OptionalSideStoryRegistry.js`
- `src/js/managers/StorySceneManager.js`

The current new-game entry now starts in the guild tutorial before the prologue
combat and Chapter 1. The guild teaches movement, interaction, commission and
clue review, and equipment-slot conflict through real player actions. The
prologue then owns combat controls, weapon break, potion use, flee feedback, and
the fixed defeat. The old duplicate field onboarding has been removed.

Battle settlement now includes the live five-column backpack, full-capacity
discard decisions, and visible blueprint reward art. Chapter 1 Rotroot
investigation beats continue through staged story text instead of repeated use
of the same landmark, and the obsolete fixed salvage and elite landmarks are
removed. See `AGENT_SESSION_LOG.md` for the exact validation gate and unfinished
work.

The old town plan, quest spine, first-chapter route plan, random geography,
fifteen-part main quest chain, DOM hunt map, and old room/open-world DEMO assets
are removed rather than retained as compatibility layers. Main-chapter rewards
and numeric stock remain deliberately unassigned.
Optional character stories carry approved reward identities and resource needs.
Their direction passed user review on 2026-07-19, but they stay outside playable
quest groups until formal dialogue, required assets, discovery interactions,
runtime records, and end-to-end validation are complete.

## Working Rules

- Build desktop first.
- If an old system is structurally wrong, replace the core flow instead of adding
  compatibility padding.
- Follow `AGENT_UPDATE_PROTOCOL.md` before creating or editing planning docs.
- Use `MAIN_STORY_BIBLE.md` as the production-facing source before changing
  mainline structure, chapter suspense, character arcs, character entry/exit, or
  cross-character continuity. Consult an individual character dossier only when
  resolving a field that the master register still marks as undecided.
- Use `NARRATIVE_WRITING_GUIDE.md` before rewriting quest copy, NPC dialogue,
  landmark prose, relationship records, or multi-speaker scenes.
- Do not update progress/checkpoint docs during ordinary implementation unless
  the user explicitly asks for a handoff or current-state record.
- During the clean story rebuild, do not silently add new NPCs, monsters,
  materials, items, locations, or assets. Follow the resource gate in
  `src/js/data/StoryRebuildPlan.js` first.
- Keep town map, shop, market, casino, and NPC story recovery moving as one network.
- Backpack and commission-helper systems are stable and outside the first town
  rebuild unless explicitly pulled in later.
