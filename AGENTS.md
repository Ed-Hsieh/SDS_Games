# SDS_Games Agent Handoff

Last updated: 2026-07-11

This repository is being rebuilt as a desktop-focused 2D RPG. Future Codex or
agent sessions should read this file before editing content or asset systems.

## Current User Preferences

- Build for desktop only. Do not spend time on mobile UI unless the user asks.
- When a system or interface is wrong at its core, fix the core logic instead
  of piling workaround layers on top.
- Do not add legacy soft-compatibility layers for obsolete town, shop, market,
  casino, or dialogue systems. If the old code/data is stale, remove it and
  write the new core flow directly.
- The broken-town script, NPC dialogue, town map interactions, shop/market
  recovery, casino temptation loop, and later added town modules must progress
  together as one recovery network.
- Backpack and commission-helper systems are not part of the first town
  rebuild unless the user explicitly asks.
- Preserve the current dark realistic fantasy image style that was generated
  for materials and equipment.
- Do not make every special weapon a sword. Spread special drops across weapon
  types, armor, accessories, materials, and systems.
- During the clean story rebuild, do not silently add new NPCs, monsters,
  materials, items, locations, or assets. Propose the story reason, system
  function, acquisition/source, downstream data changes, asset needs, and
  validation plan first.
- The complete omniscient master screenplay and its runtime foundation are the
  current authority. Keep story causality, character placement, chapter flow,
  and scene scripts aligned before resuming combat, tower, or image work.
- Second-run external Boss expansion is now paused. Record its accepted boundary
  but do not add routes, lore, monsters, combat, rewards, flags, or art for it
  until the complete first-run story, playable systems, and required images are
  finished and validated.
- The active delivery order is first-run only: lock its screenplay, finish its
  playable story/system flow, produce all required backgrounds, half-body
  expression portraits, and critical CGs, then audit persistent achievements
  and first-run evidence flags as the stable interface for later second-run
  work. Do not make later second-run design reach back into first-run core logic.
- The master screenplay now contains 66/66 detailed scenes across seven chapters,
  each with stage class, background intent, participants, entry/exit, objective,
  inputs/outputs, asset notes, runtime-order prose, run conditions, and one of the
  closed nine expressions. It now compiles into the reviewable runtime scene,
  run-state, chapter-region, town, and quest foundation.
- The current dialogue portraits with baked-in backgrounds are temporary.
  After the screenplay is complete, rebuild dialogue presentation from
  independent scene backgrounds and transparent character expression layers.
  Until then, scripts should record background, participant, expression, and
  entrance/exit intent without blocking writing on missing art.
- Use one closed vocabulary of at most nine reusable dialogue expressions. Do
  not expand it with new portrait emotions; alias finer script emotions to the
  existing nine or use an approved story CG for a true climax. Do not generate
  either category before the screenplay is locked.
- The current screenplay implementation uses achievement-only cross-run story
  persistence. Do not mix achievement memory with inherited warehouse key items;
  every physical story object is reacquired inside the current run unless the
  user revises this proposal during review.
- Mia is the accepted 25-year-old healer. Her private herb workroom is a
  story/relationship location, never an apothecary, shop, clinic menu, or market
  fallback. Her only game-facing functions are recipe research that authorizes
  market stock and character/patient/town-relationship events. Baseline medicine
  trade survives her first-run death.
- Mia's fixed fate is the Chapter 5 four-element shard operation. She saves
  the protagonist in both runs. First run, fixed-ratchet forceps crush the
  extracted contracting shard and the point-blank release kills her immediately.
  Second run, remembered sound prompts current-run tests, ratchet removal, a
  spider-silk loop, and purified slime-gel receiving medium; she survives.
- 伊萊's first-run wound is a real part of that causal chain. He compresses four
  accurate separated-residue records into the unscoped field line
  `標準二格固定可安全處理`; the line helps make the standard procedure feel
  settled before Mia dies. He is neither reckless nor the sole culprit. In the
  second run he reopens the current-run source pages, rejects the generalization,
  and records a pressure-free test with its scope and unknowns intact.
- The adventure-map review contract retains Canvas movement/camera/fog,
  fatigue/travel encounters, full-image landmarks, and the travel handbook. It
  replaces random/ring geography with seven handcrafted chapter canvases. Unknown
  places use a black `?` square until contact and then transition to one full-image
  scene without duplicate location cards.
- Public transactions and medicine stock belong to the rebuilt market. Vesper's
  casino route is linear: first-run escape and Loaded Dice evidence, second-run
  host/guest reversal, contract collection, and one immediate showcase prize.
  The creditor remains unnamed through the mandatory mainline. Its full Void
  identity may be revealed only through an optional second-run external story;
  later DLC may continue that route beyond the base-game reveal.
- The mandatory first-run and second-run true-ending mainline has a supernatural
  affinity ceiling of shadow and glimmer. Formal light/Void creatures,
  materials, equipment, affinities, and combat routes may appear only in
  optional second-run external stories and must never gate the true ending.
  Ash Baron, the expedition supreme commander, and the planned prologue
  overcap demon belong to that base-game second-run Boss layer. DLC extends the
  light/Void and tower world after those reveals instead of owning their first
  resolution.

## Current Documentation Authority

Route reading by task. For main-story or chapter writing, begin with
`docs/MAIN_STORY_BIBLE.md`; its master character register is the
production-facing source for accepted character facts. Use
`docs/NARRATIVE_WRITING_GUIDE.md` for prose and scene form, and
`docs/CHAPTER_QUEST_FRAMEWORK.md` for level, boss, reward, and placement
constraints.

The character dossiers remain source and audit records. Read the relevant dossier
when the master register marks a field unresolved, when changing that character,
or when checking how an accepted decision was reached. Any accepted dossier
change must be synchronized back into the master register.

Authoritative documents by topic:

- `docs/TOWN_REBUILD_CONVERGENCE.md`
- `docs/CHAPTER_QUEST_FRAMEWORK.md`
- `docs/MAIN_STORY_BIBLE.md`
- `docs/characters/VILLAGE_ELDER_PROFILE.md`
- `docs/characters/HERBALIST_PROFILE.md`
- `docs/characters/TOWN_SCHOLAR_PROFILE.md`
- `docs/characters/STANDARD_BEARER_FREY_PROFILE.md`
- `docs/characters/LAMPLIGHTER_TAVI_PROFILE.md`
- `docs/characters/BLACKSMITH_PROFILE.md`
- `docs/characters/STREET_BEGGAR_PROFILE.md`
- `docs/characters/CASINO_OWNER_PROFILE.md`
- `docs/NARRATIVE_WRITING_GUIDE.md`
- `docs/CASINO_ROUTE_FRAMEWORK.md`
- `docs/EQUIPMENT_SERIES_FRAMEWORK.md`
- `docs/ART_STYLE_GUIDE.md`
- `docs/IMAGE_GENERATION_PROMPTS.md`
- `docs/OBSOLETE_CLEANUP_PLAN.md`
- `docs/AGENT_SESSION_LOG.md`
- `docs/AGENT_UPDATE_PROTOCOL.md`

Older broad planning docs were removed on 2026-07-05 so future sessions do not
inherit conflicting design directions. Runtime data remains the source of truth
when an MD file and JS data disagree.

When updating project documentation, follow `docs/AGENT_UPDATE_PROTOCOL.md`.
Do not invent new progress formats or new planning files when an authoritative
document already owns the topic.
Progress/checkpoint docs are manual handoffs: update them only when the user
explicitly asks to record progress, update a handoff, or change documentation
rules.

## Asset Structure

- Primary generated asset folder: `src/assets/images/art/`
- Legacy fallback folders should not be kept as a design strategy. Once a
  system or asset path is replaced, point data at `src/assets/images/art/` and
  remove obsolete references instead of layering fallbacks.
- Local original PNG sources copied from Codex image generation live under:
  `src/assets/images/art-source/originals/`
- The original PNG source folder is intentionally gitignored. Runtime WebP
  assets under `src/assets/images/art/` are the committed game assets.

## Image Generation Rules

- Use built-in image generation unless the user explicitly requests another
  path.
- Materials and equipment use dark realistic fantasy RPG inventory art:
  centered subject, readable silhouette, moody dark neutral background, no text,
  no UI frame, no watermark.
- Monster image rules:
  - Mainline bosses keep the full large illustration style.
  - Non-main bosses and elite monsters may have scene dressing, but should be
    less ornate than mainline bosses.
  - Normal mobs can have no background.
- Boss-dropped equipment should visually match the item held or worn by that
  boss. For example, `lich_staff` should look like the staff visible in the
  `lich` boss illustration, not a separate redesign.
- Keep light and void as high-tier elements:
  - `shadow` is the weak precursor to `void`.
  - `glimmer` is the weak precursor to `light`.
  - Shadow materials should begin around Lv24-30, not Lv1-10.
- Use `docs/EQUIPMENT_SERIES_FRAMEWORK.md` before changing weapon abilities,
  weapon-form balance, equipment-line roles, or affinity/group positioning.
- Use `docs/MAIN_STORY_BIBLE.md` before changing mainline story structure,
  chapter suspense, character entry/exit, or long-form plot reveals.
- Use `src/js/data/StoryRebuildPlan.js` before removing or reclassifying old
  story, quest, route, material, or item records during the clean reset.

## Current Art Status

The new `art` folder is the active runtime asset source through
`AssetManifest.js`. Do not reintroduce `art-v2` fallback behavior; unfinished
assets should be listed as gaps and regenerated into `art`.

Image generation is paused during the current town-rebuild documentation pass.
Use `docs/ART_STYLE_GUIDE.md` for style direction and current example paths.
Use `docs/IMAGE_GENERATION_PROMPTS.md` for prompt templates and category
standards when image work resumes.

## Current Review Gate

As of 2026-07-11, the user has authorized the first four foundation tasks:

- Mainline scenes must make nine core characters complete; side stories only
  deepen them. `MainlineCharacterContracts` locks introductions, decisive scenes,
  and visible first/second-run endpoints.
- All 66 scenes compile into `StorySceneRegistry.js`; achievement-only run reset
  is implemented through `StoryStateContract.js` and `StorySceneManager.js`.
- Seven handcrafted maps and all 36 map-stage scene bindings live in
  `ChapterRegionRegistry.js`. Random/ring geography is removed from `WorldMap`.
- Eight active town places, public market ownership, and scene-driven visibility
  live in `TownPlaces.js` and `TownStateResolver.js`.
- The old fifteen-part main quest chain is replaced by seven reward-free chapter
  records. Old town-plan, quest-spine, route-plan, cross-arc, and side-taxonomy
  compatibility files are removed.
- Seven optional character stories are registered but remain deferred, skip-safe,
  and reward-free until their map or town owner is finalized.

The runtime foundation is reviewable, not immutable. If the user revises a scene,
edit the story bible and recompile the authoritative registry; do not add a second
story path as a workaround.

Do not begin reward, material, equipment, or stock-layer assignment before the
map-function review. First-run screenplay, runtime, and required-art completion
are the only active delivery scope. Second-run external Boss expansion, second-
run gameplay implementation, combat redesign, the tower rewrite, post-reveal
DLC, and mobile UI remain paused. Image production resumes only for approved
first-run backgrounds, half-body expression layers, and critical CGs after the
matching first-run scenes lock.

## Verification

Run these after asset or manifest changes:

```powershell
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\AssetCoverageCheck.mjs
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\DataConsistencyCheck.mjs
```

Optional path spot check:

```powershell
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --input-type=module -e "import { MaterialDatabase } from './src/js/data/Materials.js'; import { getGeneratedItemImage } from './src/js/data/AssetManifest.js'; for (const id of ['pure_crystal','ancient_rune','glimmer_shard']) console.log(id + ' -> ' + getGeneratedItemImage({ ...MaterialDatabase[id], id }));"
```
