# SDS Games Development Docs

Last updated: 2026-07-06

This folder is now the compact handoff layer for the desktop RPG rebuild. Runtime
data files remain the source of truth for shipped behavior; these documents keep
the design direction readable for future Codex sessions.

## Authoritative Documents

- `TOWN_REBUILD_CONVERGENCE.md` - broken-town rebuild scope, phases, feature gates,
  and current wiring status.
- `CHAPTER_QUEST_FRAMEWORK.md` - chapter titles, level bands, quest placement, and
  reward direction from Lv1 to Lv70.
- `CASINO_ROUTE_FRAMEWORK.md` - casino showcase route, owner quest hook, ticket
  reward loop, and future integration points.
- `ART_STYLE_GUIDE.md` - current image style rules and reference assets already in
  the project.
- `IMAGE_GENERATION_PROMPTS.md` - authoritative prompt templates for every
  generated asset category.
- `OBSOLETE_CLEANUP_PLAN.md` - cleanup sequence for old art-v2, sheet/crop,
  temporary progression, and compatibility leftovers.
- `AGENT_SESSION_LOG.md` - latest checkpoint for continuing development.
- `AGENT_UPDATE_PROTOCOL.md` - required formatting and update rules for future
  agent documentation changes.

## Paused This Cycle

- Combat redesign is paused.
- Tower rewrite is paused.
- Image generation is paused. Missing art can be listed, but should not be filled
  during this town-rebuild documentation pass.

## Data Sources Added For This Pass

- `src/js/data/TownRebuildPlan.js`
- `src/js/data/ChapterQuestFramework.js`
- `src/js/data/CasinoRouteFramework.js`

## Working Rules

- Build desktop first.
- If an old system is structurally wrong, replace the core flow instead of adding
  compatibility padding.
- Follow `AGENT_UPDATE_PROTOCOL.md` before creating or editing planning docs.
- Do not update progress/checkpoint docs during ordinary implementation unless
  the user explicitly asks for a handoff or current-state record.
- Keep town map, shop, market, casino, and NPC story recovery moving as one network.
- Backpack and commission-helper systems are stable and outside the first town
  rebuild unless explicitly pulled in later.
