# Agent Session Log

Last updated: 2026-07-18

## Current Direction

The sole delivery priority is a complete first run. The supported target is
desktop. Chapters 1 and 2 are the active vertical slice and still require one
uninterrupted no-skip browser playthrough before their accepted scene, dialogue,
expression, combat, town, and map pattern is copied into Chapters 3-7.

The formal first-run weapon catalog, seven baseline craft series, first-run
monster ecology, and the current approved weapon/blueprint image batch are now
implemented and validated. This does not authorize final combat values, final
drop rates, casino prize balance, tower equipment, or second-run expansion.

Current delivery order:

1. Preserve the completed first-run weapon and monster data contracts.
2. Review the remaining eleven non-casino image mappings before generating or
   deleting anything: six crafted results and five Boss craft blueprints.
3. Give `cursed_shard` one approved cursed, undead, or shadow craft destination
   without changing its current source prematurely.
4. Complete the Chapter 1-2 no-skip story and expression review.
5. Bind and review the remaining Chapter 1-2 backgrounds and audio.
6. Apply the accepted vertical-slice pattern to Chapters 3-7.
7. Allocate final rewards, stock, drop rates, and balance values only after map
   and scene functions are approved.

Second-run external Bosses, second-run gameplay, casino prize implementation,
tower rewrite, final balance, post-reveal DLC, and mobile UI remain `paused` or
`deferred` unless the user explicitly resumes them.

Optional second-run external Bosses remain base-game content, but their routes,
combat, rewards, and art stay paused until the first run passes validation. The
first-run ending must continue to set `story.secondRunUnlocked`. Before second-run
implementation resumes, complete the achievement/evidence persistent-flag audit
so later content connects without rewriting first-run core logic.

## Completed In Recent Passes

- [done] [P1] [weapon-catalog] Complete the formal first-run weapon matrix
  Owner file(s): `src/js/data/WeaponProgression.js`, `src/js/data/RecipeSeries.js`, `src/js/data/Equipment.js`, `src/js/data/BossEquipment.js`
  Source of truth: `docs/EQUIPMENT_SERIES_FRAMEWORK.md`, live runtime data
  Validation: `scripts/FormalWeaponCatalogAudit.mjs`, `scripts/DataConsistencyCheck.mjs`
  Notes: Seventy-six first-run weapons compile with 35 baseline-series weapons, 41 special weapons, no unknown forms, and no craft-blueprint gaps.

- [done] [P1] [baseline-craft] Implement seven complete five-form craft series
  Owner file(s): `src/js/data/RecipeSeries.js`, `src/js/data/RecipeDiscoveries.js`, `src/js/data/AssetManifest.js`
  Source of truth: `src/js/data/WeaponProgression.js`, `docs/EQUIPMENT_SERIES_FRAMEWORK.md`
  Validation: `scripts/FormalWeaponCatalogAudit.mjs`, `scripts/AssetCoverageCheck.mjs`
  Notes: Every Lv10 band provides sword, dagger, heavy, lance, and focus continuity through one shared series blueprint.

- [done] [P1] [staff-attunement] Add replaceable focus element attunement
  Owner file(s): `src/js/data/StaffAttunement.js`, `src/js/managers/StaffAttunementManager.js`, `src/js/scenes/ForgeScene.js`
  Source of truth: `docs/EQUIPMENT_SERIES_FRAMEWORK.md`
  Validation: `scripts/StaffAttunementCheck.mjs`, `scripts/DataConsistencyCheck.mjs`
  Notes: Neutral baseline focuses may use fire, ice, thunder, or poison materials without adding a separate magic-power stat; shadow, glimmer, light, and Void are excluded.

- [done] [P1] [monster-ecology] Complete the first-run monster roster and source graph
  Owner file(s): `src/js/data/MonsterEcology.js`, `src/js/data/Monsters.js`, `src/js/data/FirstRunLootBalance.js`
  Source of truth: `src/js/data/MonsterEcology.js`
  Validation: `scripts/MonsterEcologyCheck.mjs`, `scripts/FirstRunLootCheck.mjs`
  Notes: Chapter counts are 9, 8, 8, 8, 10, 8, 8; all required first-run monster images are mapped.

- [done] [P1] [equipment-art] Connect the approved formal weapon and blueprint batch
  Owner file(s): `src/assets/images/art/items/equipment/`, `src/assets/images/art/items/blueprints/`, `src/js/data/AssetManifest.js`
  Source of truth: approved live recipes and `docs/IMAGE_GENERATION_PROMPTS.md`
  Validation: `scripts/AssetCoverageCheck.mjs`, mechanical PNG/WebP dimension check
  Notes: The completed batch contains 53 equipment images, 21 formal blueprint images, and the expedition-steel material image; obsolete per-form baseline blueprint files were removed.

## Current Runtime Status

- [in_progress] [P0] [chapter-1-2-writing] Finish text and expression review
  Owner file(s): `docs/MAIN_STORY_BIBLE.md`, `src/js/data/StorySceneRegistry.js`, character dossiers
  Source of truth: `docs/NARRATIVE_WRITING_GUIDE.md`
  Validation: scene-by-scene user review and one no-skip Chapter 1-2 playthrough
  Notes: The causal structure and runtime bindings exist, but player-facing text and expression timing are not locked.

- [in_progress] [P0] [dialogue-runtime] Validate the layered dialogue view end to end
  Owner file(s): `src/js/components/StoryDialogueView.js`, `src/js/managers/StoryDialogueController.js`, `src/style/story-dialogue.css`, `src/js/data/StoryActors.js`
  Source of truth: `src/js/data/StorySceneRegistry.js`, `docs/NARRATIVE_WRITING_GUIDE.md`
  Validation: complete Chapter 1-2 single-speaker, multi-speaker, narration, choice, auto-read, manual-scroll, expression, mirror, and blackout review
  Notes: Implementation exists; full no-skip integration remains unverified.

- [planned] [P1] [remaining-catalog-art] Resolve eleven non-casino image mappings
  Owner file(s): `src/js/data/Recipes.js`, `src/js/data/AssetManifest.js`, `src/assets/images/art/items/`
  Source of truth: live recipe results and Boss craft definitions
  Validation: `scripts/AssetCoverageCheck.mjs`, user visual approval
  Notes: Six crafted results and five Boss craft blueprints remain; inspect identity before generation.

- [planned] [P0] [chapter-1-2-playthrough] Complete one uninterrupted vertical-slice run
  Owner file(s): story, town, adventure, dialogue, and combat runtime modules
  Source of truth: `src/js/data/StorySceneRegistry.js`
  Validation: manual new-save playthrough from prologue through Chapter 2 completion
  Notes: Confirm guidance ownership, NPC entry order, field triggers, combat continuation, quest state, encyclopedia unlocks, death recovery, and return-home behavior.

- [deferred] [P1] [balance] Replace failed balance assumptions with approved database values
  Owner file(s): `src/js/data/Monsters.js`, `src/js/data/Equipment.js`, `src/js/data/Recipes.js`, `scripts/DifficultyProgressionCheck.mjs`
  Source of truth: live databases and user playtest feedback
  Validation: `scripts/DifficultyProgressionCheck.mjs`
  Notes: Do not add runtime multipliers; adjust source data only when the balance pass resumes.

- [deferred] [P2] [material-classification] Give `cursed_shard` an approved use
  Owner file(s): `src/js/data/Materials.js`, `src/js/data/Recipes.js`, `src/js/data/FirstRunLootBalance.js`
  Source of truth: `docs/EQUIPMENT_SERIES_FRAMEWORK.md`, live item-flow data
  Validation: `scripts/ItemFlowCheck.mjs`, `scripts/DataConsistencyCheck.mjs`
  Notes: It has a source but no destination; reserve it for a level-appropriate cursed, undead, or shadow special craft.

- [paused] [P2] [casino] Keep casino rewards and weapons conceptual
  Owner file(s): `src/js/data/CasinoRewards.js`, `docs/CASINO_ROUTE_FRAMEWORK.md`
  Source of truth: accepted casino route framework
  Validation: pending design approval
  Notes: Thirty-three casino-special mappings remain and are excluded from the active art pass.

- [paused] [P2] [tower-second-run-mobile] Preserve paused boundaries
  Owner file(s): tower runtime, second-run contracts, mobile styles
  Source of truth: `AGENTS.md`, `docs/MAIN_STORY_BIBLE.md`
  Validation: scope review
  Notes: Do not expand tower, second-run external Bosses, light/Void routes, DLC, or mobile UI during the current milestone.

Current validation snapshot:

- `BetaConvergenceCheck.mjs`: pass; 20 framework documents.
- `StoryRuntimeCheck.mjs`: pass; 66 scenes, 9 expressions, 9 character contracts,
  7 regions, and 7 encounter contracts.
- `DataConsistencyCheck.mjs`: pass.
- `MonsterEcologyCheck.mjs`: pass; no required first-run monster art gaps.
- `FirstRunLootCheck.mjs`: pass for 55 monsters.
- `StaffAttunementCheck.mjs`: pass.
- `FormalWeaponCatalogAudit.mjs`: no unknown forms or craft-blueprint gaps.
- `AssetCoverageCheck.mjs`: expected nonzero; 44 missing mappings, 0 missing
  physical files, and 37 dimension warnings. Missing mappings are 6 crafted
  results, 5 Boss craft blueprints, and 33 paused casino-special items.

## Next Good Step

- [planned] [P1] [catalog-review] Review the eleven non-casino mappings
  Owner file(s): `src/js/data/Recipes.js`, `src/js/data/BossEquipment.js`, `src/js/data/AssetManifest.js`
  Source of truth: live crafted-result and Boss craft identities
  Validation: explicit user approval of keep, regenerate, reclassify, or remove decisions
  Notes: Do not touch the 33 paused casino items in this pass.

- [planned] [P1] [material-use] Define the `cursed_shard` destination
  Owner file(s): `src/js/data/Recipes.js`, `src/js/data/Materials.js`
  Source of truth: the Lv24-40 shadow/undead source graph
  Validation: `scripts/ItemFlowCheck.mjs`, `scripts/DataConsistencyCheck.mjs`
  Notes: The new recipe must not make one monster own the material, blueprint, and finished item.

- [planned] [P0] [vertical-slice] Return to the Chapter 1-2 no-skip playthrough
  Owner file(s): Chapter 1-2 runtime modules
  Source of truth: `src/js/data/StorySceneRegistry.js`
  Validation: manual new-save desktop run
  Notes: This remains the product milestone after the focused catalog cleanup.

## Next Resume Task

Review the remaining non-casino catalog gaps before any further image batch.

Target result:

- List the six crafted-result and five Boss-blueprint mapping ids from the live
  checker.
- Confirm whether each record is active, visually defined, and still belongs to
  the first-run data model.
- Remove obsolete records cleanly or approve exact item/blueprint identity before
  generating replacements.
- Keep the 33 casino-special records untouched and visibly out of scope.
- Preserve the completed seven-series weapon contract and existing approved art.

Suggested implementation files:

- `src/js/data/Recipes.js`
- `src/js/data/BossEquipment.js`
- `src/js/data/AssetManifest.js`
- `src/assets/images/art/items/`
- `docs/ART_STYLE_GUIDE.md`

Validation:

- `scripts/AssetCoverageCheck.mjs`
- `scripts/DataConsistencyCheck.mjs`
- `scripts/FormalWeaponCatalogAudit.mjs`

Out of scope:

- Casino weapon and prize implementation
- Tower equipment redesign
- Final combat balance and drop-rate tuning
- New second-run monsters, routes, rewards, or art
- DLC and mobile UI

## Verification Commands

```powershell
$node = "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

& $node scripts\BetaConvergenceCheck.mjs
& $node scripts\StoryRuntimeCheck.mjs
& $node scripts\DataConsistencyCheck.mjs
& $node scripts\MonsterEcologyCheck.mjs
& $node scripts\FirstRunLootCheck.mjs
& $node scripts\StaffAttunementCheck.mjs
& $node scripts\FormalWeaponCatalogAudit.mjs
& $node scripts\AssetCoverageCheck.mjs
```

Expected exception:

- `AssetCoverageCheck.mjs` remains nonzero until the 44 explicitly listed
  mappings and 37 specification warnings are resolved.
