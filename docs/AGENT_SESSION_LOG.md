# Agent Session Log

Last updated: 2026-07-17

## Current Direction

The sole delivery priority is a complete first run. The supported target is
desktop. Chapters 1 and 2
are the active vertical slice and must pass one uninterrupted, no-skip browser
playthrough before their scene, dialogue, expression, combat, town, and map
pattern is copied into Chapters 3-7.

The immediate work thread has moved from Chapter 1-2 monster actions and combat
VFX into formal weapon-data normalization. This is a catalog cleanup and audit,
not permission to lock final balance or allocate final chapter rewards. Casino
inventory is still conceptual and excluded from the formal weapon audit. Tower
equipment remains paused with the tower rewrite.

Current delivery order:

1. Preserve the validated Chapter 1-2 runtime while finishing its text,
   expression, background, audio, and no-skip browser review.
2. Complete the formal weapon catalog audit by level band, weapon form, source,
   blueprint inclusion, and elemental focus coverage.
3. Review recipe-result identity before generating the remaining crafted-result
   images in small user-reviewed batches.
4. Apply the accepted Chapter 1-2 scene and combat pattern to Chapters 3-7.
5. Allocate first-run rewards, drops, materials, equipment, and market stock only
   after map and scene functions are approved.
6. Tune database values with the balance scripts; do not add runtime balancing
   multipliers or a second source of combat truth.
7. Finish the first-run hollow-victory playthrough and persistent-flag audit
   before resuming second-run external Bosses or DLC.

Optional second-run external Bosses remain base-game content, but their design
and implementation are paused until the complete first run passes validation.
The first-run ending must continue to set `story.secondRunUnlocked` through the
accepted scene-state contract.

Second-run external Boss expansion, second-run gameplay, casino prize
implementation, tower rewrite, final balance, post-reveal DLC, and mobile UI are
`paused` or `deferred` unless the user explicitly resumes them.

## Completed In Recent Passes

- [done] [P0] [story-runtime] Keep the seven-chapter screenplay foundation executable
  Owner file(s): `src/js/data/StorySceneRegistry.js`, `src/js/managers/StorySceneManager.js`, `src/js/data/StoryStateContract.js`
  Source of truth: `docs/MAIN_STORY_BIBLE.md`
  Validation: `scripts/StoryRuntimeCheck.mjs`
  Notes: Sixty-six scenes, nine expressions, nine mainline character contracts, seven regions, seven encounter contracts, eight town places, and seven scene-driven chapter quests pass.

- [done] [P0] [tutorial] Connect the prologue defeat, staged tutorial, and Mia wake-up
  Owner file(s): `src/js/scenes/AdventureScene.js`, `src/js/managers/CombatFlowController.js`, `src/js/managers/RealtimeCombatSession.js`
  Source of truth: `src/js/data/StorySceneRegistry.js`, `src/js/data/StoryEncounterContracts.js`
  Validation: `scripts/CombatTutorialCheck.mjs`, manual browser review
  Notes: Hit/crit, potion, and retreat teaching pauses hostile action; the defeat continues through the 1.5-second eye-closing transition into Mia's workroom.

- [done] [P1] [adventure-map] Lock the current fog and return-home rules
  Owner file(s): `src/js/utils/WorldMap.js`, `src/js/scenes/AdventureScene.js`, `src/js/data/UtilityItems.js`, `src/js/managers/GameManager.js`
  Source of truth: runtime map and utility-item data
  Validation: manual adventure-map check
  Notes: Radius 1 reveals the current cell plus eight neighbors; ordinary players return by walking to town or using Wolf Smoke. Wolf Smoke is adventure-map-only and remains granted once for testing without final art.

- [done] [P1] [town-ui] Consolidate town-place, quest-ledger, inventory, and codex presentation
  Owner file(s): `src/js/scenes/LobbyScene.js`, `src/js/scenes/QuestScene.js`, `src/style/hall.css`, `src/style/quest-handbook.css`, `src/style/inventory-grid.css`, `src/style/encyclopedia.css`
  Source of truth: `src/js/data/TownPlaces.js`, runtime quest and inventory data
  Validation: `scripts/TownRuntimeCheck.mjs`, `scripts/StructureConsistencyCheck.mjs`, manual desktop browser checks
  Notes: Town hotspots use consistent short two-line labels; backpack and warehouse share the same grid; quest-ledger spacing, return placement, status labels, and relationship detail hierarchy were cleaned up.

- [done] [P1] [monster-combat] Give Chapter 1-2 monsters explicit action ownership
  Owner file(s): `src/js/data/MonsterCombatProfiles.js`, `src/js/data/MonsterSkills.js`, `src/js/managers/RealtimeCombatSession.js`
  Source of truth: `src/js/data/MonsterCombatProfiles.js`
  Validation: `scripts/MonsterCombatCheck.mjs`
  Notes: Seventeen Chapter 1-2 monsters pass; ordinary monsters no longer inherit arbitrary skills, self-buffs stay on monsters, and only player-targeted effects appear as player debuffs.

- [done] [P1] [weapon-mechanics] Implement the five formal weapon identities
  Owner file(s): `src/js/utils/WeaponCombatProfile.js`, `src/js/managers/RealtimeCombatSession.js`, `src/js/models/Enums.js`
  Source of truth: `docs/EQUIPMENT_SERIES_FRAMEWORK.md`
  Validation: `scripts/EquipmentEffectCheck.mjs`, `scripts/DataConsistencyCheck.mjs`
  Notes: Sword uses Steady Stance, dagger Quick Chain, heavy Bulwark Guard, lance Piercing Line, and focus two-stack Arcane Resonance.

- [done] [P1] [combat-vfx] Establish the combat VFX test and runtime path
  Owner file(s): `src/js/utils/CombatVfxEngine.js`, `src/js/scenes/CombatVfxLab.js`, `combat-vfx-lab.html`, `src/js/managers/CombatFlowController.js`
  Source of truth: runtime combat action and skill ids
  Validation: `scripts/MonsterCombatCheck.mjs`, manual VFX-lab review
  Notes: Physical attacks use readable weapon traces instead of particle clutter; element, shadow, glimmer, monster-skill, damage-number, and target-layer routing are connected. Further visual tuning is review-driven, not a new system rewrite.

- [done] [P1] [equipment-data] Resolve confirmed duplicate weapon sources
  Owner file(s): `src/js/data/Equipment.js`, `src/js/data/Materials.js`, `src/js/data/Monsters.js`, `src/js/data/Recipes.js`, `src/js/data/AssetManifest.js`
  Source of truth: live equipment, material, monster, and recipe databases
  Validation: `scripts/DataConsistencyCheck.mjs`, `scripts/ItemFlowCheck.mjs`
  Notes: Shop Iron Sword, tower duplicate Lich Staff, crafted Fire Sword, and crafted Void Reaver were removed; dropped White Bone Sword became the distinct `undead_dagger`, with a replacement runtime image.

- [done] [P1] [item-data] Resolve the latest id and canonical-data collisions
  Owner file(s): `src/js/data/Equipment.js`, `src/js/data/Materials.js`, `src/js/data/Items.js`, `src/js/data/Quests.js`, `src/js/data/Recipes.js`
  Source of truth: runtime databases
  Validation: `scripts/DataConsistencyCheck.mjs`, `scripts/ItemFlowCheck.mjs`, reference scans
  Notes: Equipment keeps `assassin_blade`; material uses `assassin_blade_fragment`. `wolf_fang` is material-only and its necklace remains a craft. Four forge materials derive shop identity from `MaterialDatabase`. `old_sword` and `old_armor` are removed without aliases.

## Current Runtime Status

- [in_progress] [P0] [chapter-1-2-writing] Finish first-pass text and expression review
  Owner file(s): `docs/MAIN_STORY_BIBLE.md`, `src/js/data/StorySceneRegistry.js`, character dossiers
  Source of truth: `docs/NARRATIVE_WRITING_GUIDE.md`
  Validation: scene-by-scene user review and one no-skip Chapter 1-2 playthrough
  Notes: Mia, the elder, Eli, Frey, Tavi, and the blacksmith have updated natural-dialogue rules and a first Chapter 1 pass. The text is not locked; remaining awkward metaphor, expression timing, and transition issues must be found through play.

- [in_progress] [P0] [dialogue-runtime] Validate the unified layered dialogue view end to end
  Owner file(s): `src/js/components/StoryDialogueView.js`, `src/js/managers/StoryDialogueController.js`, `src/style/story-dialogue.css`, `src/js/data/StoryActors.js`
  Source of truth: `src/js/data/StorySceneRegistry.js`, `docs/NARRATIVE_WRITING_GUIDE.md`
  Validation: complete Chapter 1-2 single-speaker, multi-speaker, narration, choice, auto-read, manual-scroll, expression, mirror, and blackout review
  Notes: The current view has stable two-line copy, manual scrolling, read-more indication, auto-read, choices that do not resize the base box, multi-actor half-body staging, non-selectable game text, and eye-closing presentation. Full integration remains unverified.

- [in_progress] [P1] [equipment-catalog] Audit formal weapon distribution
  Owner file(s): `src/js/data/Equipment.js`, `src/js/data/Recipes.js`, `src/js/data/RecipeSeries.js`, `src/js/data/BossEquipment.js`
  Source of truth: `docs/EQUIPMENT_SERIES_FRAMEWORK.md`, live runtime data
  Validation: level-band/form/source matrix plus `scripts/DataConsistencyCheck.mjs` and `scripts/EquipmentEffectCheck.mjs`
  Notes: The next audit must include blueprint results. It must report sword, dagger, heavy, lance, and focus coverage plus fire, ice, thunder, and poison focus support. Do not include casino concepts or redesign tower equipment.

- [planned] [P1] [crafted-art] Review and generate crafted-result inventory art
  Owner file(s): `src/assets/images/art/items/equipment/`, `src/js/data/AssetManifest.js`
  Source of truth: accepted recipe results, their blueprints, `docs/ART_STYLE_GUIDE.md`
  Validation: `scripts/AssetCoverageCheck.mjs`, manual small-batch visual approval
  Notes: Forty-six crafted-result mappings remain. Blueprint and result must depict the same object; series gear must remain visibly weak fallback equipment. Do not mass-generate the backlog.

- [planned] [P0] [chapter-1-2-playthrough] Complete one uninterrupted vertical-slice run
  Owner file(s): story, town, adventure, dialogue, and combat runtime modules
  Source of truth: `src/js/data/StorySceneRegistry.js`
  Validation: manual new-save playthrough from prologue through Chapter 2 completion
  Notes: Confirm guidance ownership, NPC entry order, field scene triggers, combat continuation, quest-ledger state, encyclopedia unlocks, death recovery, and return-home behavior.

- [deferred] [P1] [balance] Replace failed balance assumptions with approved database values
  Owner file(s): `src/js/data/Monsters.js`, `src/js/data/Equipment.js`, `src/js/data/Recipes.js`, `scripts/DifficultyProgressionCheck.mjs`
  Source of truth: live databases and user playtest feedback
  Validation: `scripts/DifficultyProgressionCheck.mjs`
  Notes: The script executes but currently fails eleven survival and matchup gates. Do not add runtime multipliers; adjust source data only when the balance pass resumes.

- [deferred] [P2] [material-classification] Continue the remaining item/material audit
  Owner file(s): `src/js/data/Materials.js`, `src/js/data/UtilityItems.js`, `src/js/data/Quests.js`, `src/js/data/CasinoRewards.js`
  Source of truth: item schema and stable acquisition/use rules
  Validation: `scripts/ItemFlowCheck.mjs`, `scripts/DataConsistencyCheck.mjs`
  Notes: `cursed_shard` is the only current item-flow design warning. Larger orphan-material, service-item, token, quest-proof, and casino classification decisions remain intentionally unmodified.

- [paused] [P2] [casino] Keep casino rewards and weapons conceptual
  Owner file(s): `src/js/data/CasinoRewards.js`, `docs/CASINO_ROUTE_FRAMEWORK.md`
  Source of truth: accepted casino route framework
  Validation: pending design approval
  Notes: Thirty-three casino-special image mappings remain; do not normalize their weapon balance or generate their art before casino gameplay and prize identity are approved.

- [paused] [P2] [tower-second-run-mobile] Preserve paused boundaries
  Owner file(s): tower runtime, second-run contracts, mobile styles
  Source of truth: `AGENTS.md`, `docs/MAIN_STORY_BIBLE.md`
  Validation: scope review
  Notes: Do not expand tower, second-run external Bosses, light/Void routes, DLC, or mobile UI during the current milestone.

Current validation snapshot:

- `StoryRuntimeCheck.mjs`: pass; 66 scenes, 9 expressions, 9 character contracts,
  7 regions, 7 encounter contracts, 8 town places.
- `TownRuntimeCheck.mjs`: pass.
- `CombatTutorialCheck.mjs`: pass.
- `MonsterCombatCheck.mjs`: pass; 17 Chapter 1-2 monsters.
- `EquipmentEffectCheck.mjs`: pass.
- `StructureConsistencyCheck.mjs`: pass.
- `DataConsistencyCheck.mjs`: pass.
- `ItemFlowCheck.mjs`: pass with one design warning, `cursed_shard`.
- `AssetCoverageCheck.mjs`: expected nonzero while backlog exists; 0 missing
  physical files, 46 crafted-result mappings, 33 casino-special mappings, and
  30 dimension warnings.
- `DifficultyProgressionCheck.mjs`: runs but fails 11 accepted-gate assertions;
  balance is not approved.
- `BetaConvergenceCheck.mjs`: failed before this checkpoint because
  `ART_STYLE_GUIDE.md` lacked two required deferred-section headings; the headings
  were restored in this documentation pass and must be rerun.

The current weapon-data changes and generated `undead_dagger` asset are present
in the working tree and are not committed by this checkpoint. Do not discard
them when resuming.

## Next Good Step

- [in_progress] [P1] [equipment-audit] Produce the formal weapon coverage matrix
  Owner file(s): `src/js/data/Equipment.js`, `src/js/data/Recipes.js`, `src/js/data/RecipeSeries.js`, `src/js/data/BossEquipment.js`
  Source of truth: `docs/EQUIPMENT_SERIES_FRAMEWORK.md`
  Validation: scripted or documented matrix showing level band, form, source, rarity, and affinity
  Notes: Include blueprints and recipe results; exclude casino and paused tower content. Identify gaps before adding or changing weapons.

- [planned] [P1] [equipment-decision] Review the matrix with the user
  Owner file(s): `docs/EQUIPMENT_SERIES_FRAMEWORK.md`
  Source of truth: audit output and user preference
  Validation: explicit approval of which gaps should be filled
  Notes: Do not silently create monsters, materials, recipes, equipment, or images to fill a gap.

- [planned] [P1] [crafted-art] Resume only approved small image batches
  Owner file(s): `src/assets/images/art/items/equipment/`, `src/js/data/AssetManifest.js`
  Source of truth: approved recipe and blueprint identity
  Validation: visual approval plus `scripts/AssetCoverageCheck.mjs`
  Notes: `undead_dagger.webp` is the latest accepted replacement direction; remaining crafted art is separate work.

- [planned] [P0] [vertical-slice] Return to the Chapter 1-2 no-skip playthrough
  Owner file(s): Chapter 1-2 runtime modules
  Source of truth: `src/js/data/StorySceneRegistry.js`
  Validation: manual new-save desktop run
  Notes: This remains the product milestone even while the focused equipment audit is active.

## Next Resume Task

Continue the formal weapon catalog audit from the normalized data state.

Target result:

- List every formal weapon from equipment drops, Boss drops, special crafts, and
  blueprint/series results.
- Group by practical level band and source.
- Show coverage for sword, dagger, heavy, lance, and focus.
- For focus weapons, show fire, ice, thunder, poison, and neutral resonance
  availability.
- Mark duplicate identity, missing form coverage, source imbalance, or level-band
  crowding without implementing speculative replacements.
- Present the smallest coherent data plan for user approval.

Suggested implementation files:

- `src/js/data/Equipment.js`
- `src/js/data/BossEquipment.js`
- `src/js/data/Recipes.js`
- `src/js/data/RecipeSeries.js`
- `src/js/data/BlueprintDrops.js`
- `src/js/data/Monsters.js`
- `docs/EQUIPMENT_SERIES_FRAMEWORK.md`

Validation:

- `scripts/DataConsistencyCheck.mjs`
- `scripts/EquipmentEffectCheck.mjs`
- `scripts/ItemFlowCheck.mjs`
- A generated level-band / form / source audit with zero unresolved id collisions

Out of scope:

- Casino weapon and prize implementation
- Tower equipment redesign
- Final combat balance and difficulty-value changes
- Mass generation of the 46 crafted-result images
- New monsters, materials, locations, NPCs, or story branches
- Second-run external Bosses, DLC, and mobile UI

## Verification Commands

```powershell
$node = 'D:\Users\s494326\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'

& $node scripts\StoryRuntimeCheck.mjs
& $node scripts\TownRuntimeCheck.mjs
& $node scripts\CombatTutorialCheck.mjs
& $node scripts\MonsterCombatCheck.mjs
& $node scripts\EquipmentEffectCheck.mjs
& $node scripts\StructureConsistencyCheck.mjs
& $node scripts\DataConsistencyCheck.mjs
& $node scripts\ItemFlowCheck.mjs
& $node scripts\AssetCoverageCheck.mjs
& $node scripts\BetaConvergenceCheck.mjs
& $node scripts\DifficultyProgressionCheck.mjs
```

Expected exceptions at this checkpoint:

- `AssetCoverageCheck.mjs` remains nonzero for 46 crafted-result and 33 casino
  mappings plus 30 dimension warnings; it must still report zero missing files.
- `DifficultyProgressionCheck.mjs` remains nonzero until the deferred database
  balance pass.
