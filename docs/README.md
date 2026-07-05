# SDS Games Development Docs

Last updated: 2026-07-05

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
- `AGENT_SESSION_LOG.md` - latest checkpoint for continuing development.
- `generated/art-asset-queue.md` - generated asset queue reference. Do not treat it
  as design authority when it conflicts with the active docs above.

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
- Keep town map, shop, market, casino, and NPC story recovery moving as one network.
- Backpack and commission-helper systems are stable and outside the first town
  rebuild unless explicitly pulled in later.
