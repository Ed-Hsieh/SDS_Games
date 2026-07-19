# Chapter Quest Framework

Last updated: 2026-07-19

## Purpose

The game is being stretched toward Lv1-Lv70 content. Main quests, side quests,
town recovery, equipment sources, dungeons, and third-party sources need a shared
chapter spine before rewards are redistributed.

Final combat balance and tower rewrite are paused. This framework defines where
story, source structure, and systems should land without owning final values.

## Runtime Spine Files

- `src/js/data/StorySceneRegistry.js` owns the 66 mandatory scenes.
- `src/js/data/ChapterRegionRegistry.js` owns seven handcrafted regional maps,
  authored routes, fixed locations, and Boss convergence.
- `src/js/data/Quests.js` owns only optional quest runtime contracts. It is
  intentionally empty until an optional story has approved dialogue, ownership,
  interactions, rewards, and flags. Mandatory chapter progression is read
  directly from `StorySceneRegistry.js` and must not be duplicated as quest
  records.
- `src/js/data/RewardItems.js` owns shared special reward records that are still
  used by active systems. Reward definitions no longer live inside the quest
  database.
- `src/js/data/OptionalSideStoryRegistry.js` holds 33 approved personal
  stories (short, medium, and long for nine core characters plus the public
  merchant and black-market trader) and six ensemble shorts. Chapter placement,
  reward identity, mainline boundary, and
  derived-resource needs passed user review on 2026-07-19. No entry becomes
  playable before formal dialogue, assets, discovery interactions, runtime
  records, and end-to-end validation are complete.
- `scripts/StoryRuntimeCheck.mjs` validates scene, map, character, two-run, town,
  quest, and reward-deferral contracts.

`ChapterMapFramework.js`, `QuestSpineFramework.js`, `ChapterOneRoutePlan.js`, and
their two checks were removed. Do not recreate them through fallback adapters.

## Quest Display Rule

Quest count is not the design target. A chapter can surface as one large objective,
several quests, or a mixed clue log, but the underlying spine must still carry:

- A clear chapter-scale goal.
- Route exploration that makes landmarks matter.
- Non-linear information or clues.
- Equipment pressure before the boss.
- A town-state change or NPC/environment consequence.
- Boss convergence as the chapter payoff.
- Dungeon side-story support for the same level band.

Dungeons are not mandatory mainline fillers. They should exist across level bands
as side-story and equipment-support routes. If a dungeon is moved into the main
chapter route, the plan needs to say why before implementation.

## Causal Quest And Player-Knowledge Contract

Every mainline segment follows this causal structure, although its presentation,
length, location count, and dramatic rhythm may differ:

1. The previous segment produces a concrete result.
2. That result creates a new practical problem.
3. The player proposes or accepts a provisional hypothesis.
4. The player acts personally to test it.
5. The location reveals evidence the hypothesis cannot fully explain.
6. Characters reinterpret only the parts covered by their own expertise.
7. The player handles the immediate consequence.
8. The world changes visibly.
9. That visible change causes the next problem.

`A` must cause `B`; a prerequisite flag that merely prevents `B` from appearing
does not establish causality. Do not build a chapter as a chain of unrelated
orders joined only by objective completion.

Author truth, character knowledge, and player knowledge are separate states:

- Planning documents may record the complete cause.
- Runtime characters may state only observations and interpretations available
  to them at that moment.
- The player knows a conclusion only after a scene has shown its evidence or an
  authorized character has interpreted that evidence in front of the player.
- A quest objective, handbook entry, flag, or UI notification cannot teach a
  conclusion before its scene does.

### Required Performance Checkpoints

Quest progress must be dramatized. A silent objective update is never the sole
presentation of a new problem, hypothesis, contradiction, consequence, route,
or town-state change.

Create a scene checkpoint whenever one of these changes:

- The reason for acting.
- The current provisional explanation.
- The evidence that contradicts that explanation.
- The danger produced by the player's own action.
- The professional interpretation of collected evidence.
- The practical consequence the player must handle.
- The visible state of a route, location, service, NPC, or town function.
- The causal question that begins the next segment.

The runtime order is:

`trigger or discovery -> performed scene -> player-knowledge output -> state flag -> objective or handbook refresh`

The UI may summarize what the player has already experienced. It may not replace
the performance with text such as `任務已更新`, silently synthesize several
clues, or reveal the next destination without a witnessed reason.

Every checkpoint must define:

| Field | Requirement |
| --- | --- |
| `trigger` | The completed action, acquired evidence, return, encounter, or visible world change that starts the scene. |
| `priorPlayerKnowledge` | What the player has actually seen before the scene starts. |
| `participants` | Only people who can reasonably be present or receive the evidence. |
| `immediateWant` | What each speaking participant wants from the exchange. |
| `cannotSayDirectly` | What each participant withholds or cannot yet know. |
| `newObservation` | The concrete fact shown during the scene. |
| `provisionalInterpretation` | The limited current reading, including unresolved disagreement. |
| `playerAction` | What the player can now do because of the performed scene. |
| `visibleConsequence` | What changes in the world instead of only in UI text. |
| `outputs` | Flags, objective text, handbook entries, routes, and state changes applied after the scene. |

### Evidence Ownership By Character

No single NPC announces the complete truth. The player assembles it from limited
professional readings:

| Character | May interpret | Must not conveniently explain |
| --- | --- | --- |
| Mia | Bodies, symptoms, medicine, herbs, contamination, and survival conditions. | Route history, military intent, structural damage, or the complete supernatural cause. |
| Eli | Dates, names, route records, source boundaries, omissions, and contradictions between documents. | Medical certainty, material failure, field movement, or facts absent from the records. |
| Blacksmith | Equipment damage, force direction, tool marks, material residue, and repair feasibility. | Who acted, why they acted, or what an unknown organism intends. |
| Frey | Who departed, who returned, patrol practice, and how a road can currently be used. | Causes outside what she or the patrol witnessed. |
| Tavi | Lamps, glass, flame behavior, wind direction, visibility, and fog. | Medical diagnosis, archival conclusions, or underground causes he cannot observe. |
| Village elder | Which risk the town can bear, what must be protected, and which routes previously made people disappear. | A precise mechanism or historical certainty unsupported by surviving evidence. |

Their interpretations may overlap, disagree, or correct one another. The final
meaning belongs to the player's synthesis and later evidence, not to an NPC
briefing disguised as dialogue.

## Narrative Writing Authority

Use `docs/NARRATIVE_WRITING_GUIDE.md` before rewriting quest prose, NPC dialogue,
landmark descriptions, relationship records, or multi-speaker scenes. This
chapter framework owns placement and meaning beats; the narrative guide owns the
voice, scene rhythm, objective clarity, and staging rules.

Use `docs/MAIN_STORY_BIBLE.md` before changing the central mystery, chapter
reveals, character entry/exit, or long-form plot structure. This chapter
framework should follow the accepted story bible, not invent plot twists inside
reward or quest-placement tables.

## Chapter Spine

| Chapter | Level | Title | Core Focus |
| ---: | ---: | --- | --- |
| 1 | 1-10 | 南門以外 / Beyond The South Gate | Broken town, south gate, first route investigation, early equipment pressure, `forest_guardian` convergence. |
| 2 | 11-20 | 斷路上的藥味 / Medicine On The Broken Road | Supply, medicine, market recovery, old evacuation records, `lich` convergence. |
| 3 | 21-30 | 影子仍守夜 / Shadows Still Keep Watch | Shadow precursor routes, old orders, rumor pressure, `shadow_commander` convergence. |
| 4 | 31-40 | 石心與灰雨 / Stone Heart, Ash Rain | Stone routes, forge weight, regional instability, and `ancient_titan` convergence. `ash_baron` remains outside mandatory convergence and is reserved for an optional second-run external route. |
| 5 | 41-50 | 元素失衡 / The Elements Lose Their Shape | Elemental fronts, dungeon preparation, advanced forge planning, `elemental_lord` convergence, old expedition truth, elder death bridge. |
| 6 | 51-60 | 龍守封痕 / The Dragon Guards The Scar | Immediate elder pursuit, dragon route pressure, first-run war, second-run evidence-bound non-attack, `elder_dragon` convergence, then return-town casino settlement. |
| 7 | 61-70 | 墜落之地 / Where The Demon Fell | Echo Whistle route and corrected Ailo memory lead to Demon King convergence. First run achieves a genuine body kill but misses vitality, echo, and rooted core; second run closes all layers with current-run Life Seed, Ancient Rune, Forest Essence, and glimmer. Full light and Void remain outside mandatory mainline progression and may open only through optional second-run external routes. |

## Monster Ecology Authority

`src/js/data/MonsterEcology.js` is the runtime authority for campaign scope,
chapter ownership, first-run roster size, second-run capacity, affinity group,
and missing-art status. Level-only sampling must pass through that contract;
formal light/Void, tower, reserve, and second-run external monsters may not leak
into first-run random encounters.

### Population Contract

- First run contains 8-10 chapter-owned monsters including fixed route and main
  Bosses. Chapter 1 is deliberately fixed at nine because its ecology is simple.
- A normal habitat contains 3-4 normal monster types. A dangerous habitat may
  contain three normal types and one elite. Bosses are fixed scene encounters,
  never random habitat results.
- Returning monsters are allowed only when the geography and story explain the
  return. They do not count as a new image requirement.
- Second run has a final capacity of exactly 12 monsters per chapter, including
  exactly one chapter external Boss. This is a capacity interface only: it does
  not authorize second-run routes, drops, combat, lore, flags, or art yet.
- Formal light and Void creatures stay in optional second-run external areas and
  never enter the mandatory mainline habitat tables.

| Chapter | Level | First-run roster | Count | Second-run additions | External Boss reserve |
| ---: | ---: | --- | ---: | ---: | --- |
| 1 | 1-10 | `slime`, `giant_rat`, `goblin`, `wild_wolf`, `poison_spider`, `stone_golem_mini`, `treant` (elite), `ambush_mantis`, `forest_guardian` | 9 | 3 | `prologue_blood_moon_stag` |
| 2 | 11-20 | `skeleton`, `skeleton_warrior`, `ghost`, `cave_bat`, `stone_golem`, `glimmer_sprite`, `rune_wisp`, `lich` | 8 | 4 | `nameless_curse` |
| 3 | 21-30 | `ghost`, `skeleton_warrior`, `shadow_soldier`, `shadow_archer`, `shadow_halberdier`, `shadow_mage`, `drowned_oracle`, `shadow_commander` | 8 | 4 | `expedition_supreme_commander` |
| 4 | 31-40 | `stone_golem_mini`, `stone_golem`, `ancient_guardian`, `crystal_golem`, `earth_elemental`, `rune_keeper`, `thorn_witch`, `ancient_titan` | 8 | 4 | `ash_baron_external` |
| 5 | 41-50 | `fire_elemental`, `ember_beast`, `ice_elemental`, `frost_wolf`, `thunder_elemental`, `storm_raptor`, `poison_frog`, `vine_beast`, `starvein_lurker`, `elemental_lord` | 10 | 2 | `entropy_balance_external` |
| 6 | 51-60 | `wyvern`, `drake`, `cliffscale_hatchling`, `sealstone_guardian`, `dragon_seal_sentinel`, `dragon_seal_adept`, `dragon_knight`, `elder_dragon` | 8 | 4 | `light_trial_external` |
| 7 | 61-70 | `hell_hound`, `tormented_soul`, `lava_golem`, `demon_soldier`, `shadow_assassin`, `shadow_general`, `demon_general`, `demon_lord_asariel` | 8 | 4 | `void_revelation_external` |

Chapter 1 habitat ownership is fixed for the first rebuild: the wet woodland
uses wolf, spider, and rat; the dangerous rotroot woodland uses wolf, small stone
golem, and the elite treant. `orc_warrior` is reserve content until `orc_fang`
has a real downstream use. `shadow_bat` was removed as an early shadow creature
and replaced at the core by neutral Chapter 2 `cave_bat`.

Thirteen first-run monster images remain deliberately unbound and must be
generated later: the ids are recorded in `RequiredFirstRunMonsterArtIds`. Runtime
must show a missing-asset state during development rather than borrow unrelated
monster art.

## Adventure Map Rebuild Contract

The adventure map is rebuilt as a desktop-first travel system. It is not a
random board with story labels placed on top. Each chapter owns a handcrafted
regional canvas whose roads, landmarks, scene triggers, dungeon entrances, and
Boss convergence have authored positions and causality.

### Retained Mechanisms

- Canvas player movement, camera follow and clamping, and fog of war.
- Fatigue accumulated from actual travel distance and chapter route conditions.
- Travel encounters selected from the current segment's authored encounter table.
- Landmark full-image presentation and scene backgrounds.
- The travel handbook as the durable record of places, clues, route conditions,
  and revisitable discoveries inside the current run.

These mechanisms may be rewritten internally, but their player-facing purpose is
retained. No mobile control layer is required.

### Removed Core

- Random, ring, or generic zone placement for roads, landmarks, and Bosses.
- Player-facing `low / medium / high / death` route categories.
- One generic landmark pool shared across chapters without story ownership.
- A road-sign card that opens another duplicate card at the top of the screen.
- Undiscovered locations that reveal their image or identity before contact.
- Random Boss placement, chance-based main-story convergence, and story scenes
  triggered only because the avatar touched an arbitrary generated marker.
- Compatibility fallbacks to the old route graph after the new region database
  becomes active.

### Region Data Contract

Every chapter region must define these fields before runtime implementation:

| Field | Requirement |
| --- | --- |
| `regionId` | Stable chapter-owned id; one active regional canvas at a time. |
| `chapter`, `levelBand` | Fixed chapter and Lv10 band ownership. |
| `worldBounds`, `cameraBounds` | Stable desktop canvas dimensions and camera limits. |
| `entryNodes`, `exitNodes` | Authored arrival, return, and chapter-transition points. |
| `routeSegments` | Fixed traversable corridors with distance, fatigue, encounter table, weather/time state, and prerequisite flags. |
| `locationNodes` | Fixed landmarks, camps, dungeon doors, side routes, Boss arenas, and story-only transition points. |
| `sceneBindings` | Scene id, trigger type, run condition, prerequisite, background id, participants, and resulting flags. |
| `fogMask` | Current-run discovery state; second run starts undiscovered unless a specific achievement changes interpretation, never physical map possession. |
| `bossConvergence` | One authored chapter payoff with explicit unlock conditions; never random. |
| `returnState` | Town entry, handbook update, route-state change, and NPC/town consequences after leaving the region. |

Route topology is fixed. Randomness is allowed only inside an authored travel
segment's encounter selection and must not move geography, story evidence, or
Bosses.

### Seven Regional Canvases

Working region names describe function, not final art filenames. They reuse
accepted geography from the master screenplay and may be renamed only while the
scene location registry is being locked.

| Chapter | Regional Canvas | Required Route Structure | Fixed Convergence |
| ---: | --- | --- | --- |
| 1 | South Gate woodland and broken approach | Town gate entry, three nearby evidence landmarks, Ambush Mantis side pressure, forest reaction route, safe return. | `forest_guardian` |
| 2 | Broken evacuation road and opened tomb country | Market supply approach, herb-basket/family record handoff in town, mist tablet hill, opened ancient tomb, optional Blood Moon migration branch. | `lich` |
| 3 | Abandoned checkpoints and shadow patrol line | Recovered route signs, lamplight branch, old human formations, shadow-material side access, casino/black-market town return hooks. | `shadow_commander` |
| 4 | Gray Ridge, stone routes, and ash crossing | Flag-and-lamp route, evacuation fork, stone pressure landmarks, ash freight branch, fixed causeway crisis. | `ancient_titan` |
| 5 | Four elemental fronts and convergence core | Four readable front approaches, countergear return loop, convergence core, Echo Whistle cache exposed after the pressure shift. | `elemental_lord` |
| 6 | Dragon-held seal-scar perimeter | Elder aftermath or living handoff, warning line, non-hostile stop point, first-run battle arena and second-run dialogue stage sharing one place; both runs then reach an unreadable outside blind collapse before returning to town. | `elder_dragon` battle or evidence-bound non-attack |
| 7 | Old mountain road, ruined flower field, and fall site | Echo-guided blind turns, Ailo trace/accompaniment states, memory location, final camp, fall-site arena. | Demon King's combat body; second-run core phase |

Town interiors, casino floors, Mia's workroom, forge, market, and civic room
are scene locations but not regional-canvas nodes. They connect through explicit
town transitions instead of being scattered onto the adventure map.

### Landmark And Road-Sign Presentation

- Before first contact, a discoverable location appears only as a stable black
  square marker with a centered `?`. It exposes no name, thumbnail, or reward.
- Contact changes the node to `discovered`, records it in the current-run
  handbook, and replaces `?` with its approved thumbnail or location mark.
- Entering a discovered location transitions from the canvas to one full-image
  scene presentation. The title, narration, actions, and participants belong to
  that scene layer; a duplicate location card must not appear above it.
- A road sign is directional evidence, not a generic content card. Inspection can
  reveal route names, damage, erased destinations, or chapter clues and then
  update the handbook or nearby route segment.
- Revisited locations use their current `worldState` image and available actions.
  They do not replay first-contact narration unless a scene binding explicitly
  requires it.

### Scene Binding For The 66-Scene Screenplay

`docs/MAIN_STORY_BIBLE.md` currently contains 66 unique scene ids across seven
chapters. They are dramatic units, not a demand for 66 map markers or 66 unique
background paintings.

Each scene must bind to exactly one of four stage classes:

1. `regional_canvas`: movement, pursuit, discovery, or route-state events.
2. `location_scene`: a full-image landmark, dungeon threshold, camp, or Boss
   arena entered from the canvas.
3. `town_scene`: a town place such as Mia's workroom, forge, market, gate,
   casino, or civic room.
4. `memory_or_ending`: a staged memory, montage, ending, or approved story CG
   that is not represented as a permanent map node.

Several scenes may reuse one approved background when time, weather, damage,
participants, and scene action create the distinction. The registry must still
give every scene a location/stage id, run conditions, entry and exit, and output
flags. No scene may remain an unplaced prose block when full scripting begins.

### Travel, Fatigue, And Encounter Rules

- Fatigue is proportional to authored segment distance and modifiers, not the
  number of random markers generated.
- Encounter rolls occur only while traversing a segment and draw from that
  chapter/biome table. Story encounters and Bosses are fixed triggers.
- Cleared hazards may reduce encounter pressure or fatigue only when a quest,
  town repair, camp, or route action caused that change.
- Retreat returns the player along a valid known segment or to an authored camp;
  it does not teleport to a generic zone menu unless the story explicitly does.
- Discovery and handbook records persist during the current run. The second run
  repeats physical discovery while achievement memory may unlock new readings or
  scene choices.

### Map Acceptance Gates

Before runtime rewrite, verify:

- All 66 scenes have a stage class and location binding.
- Each chapter has at least one entry, one safe return, one optional branch, and
  one fixed convergence.
- Every fixed Boss and character fate occurs at an authored location.
- No mandatory chapter requires light, Void, tower, an external Boss, or DLC
  geography.
- No route node exists solely to expose a UI feature without story or travel
  function.
- The unknown `?` state, discovery transition, full-image scene, handbook entry,
  revisit state, and chapter return all have one owner in the data model.

### Second-Run External Boss Placement

- Status: `paused`. Preserve the interface rules below, but do not expand routes
  until every first-run chapter, system, and required image is complete.
- The first-run false ending unlocks optional external Boss interpretation in
  the second run. It does not add another mandatory ending route.
- External routes are staggered across the second run so replay is not limited
  to revised dialogue on identical geography. Exact route stories and authored
  map branches must be approved before placement.
- The accepted chapter identities are the prologue stag rematch, 無名之咒, the
  expedition supreme commander, `ash_baron`, 熵, the Chapter 6 light trial, and
  the Chapter 7 Void Boss. Their routes, rewards, combat, and art remain paused.
- Light/Void routes and their physical rewards may be discovered only in the
  current second run. They never replace the Life Seed, Ancient Rune, Forest
  Essence, and glimmer true-kill chain.
- Later DLC extends the light/Void and tower world after these first optional
  resolutions; it does not own the player's first revenge or first reveal.
- Before resuming, audit the completed first run for stable persistent
  achievement/evidence flags. Later external routes must consume those flags
  without changing first-run scene order or outputs.

## Chapter 1 Runtime Target

Chapter 1 should land before later chapter rewrites.

- Start town state: Mia's opening rescue is active as a story scene; after the
  protagonist can walk, only `village_elder`, `town_scholar`, and south gate
  access are clearly available as public town functions.
- First objective: investigate three nearby route landmarks and record whether
  the roads still show footprints, smoke, or monster traces.
- First pressure: fatigue, fog, weak equipment, and the need to survive with
  limited resources.
- First combat clue: `ambush_mantis` can teach that monsters are evidence, not
  only loot containers.
- First boss: `forest_guardian` is the convergence of broken route signal, forest
  reaction, and old perimeter pressure.
- First reward direction: route clarity, handbook records, modest survival
  supplies, and a controlled path toward forge/market recovery. Avoid excess
  material rewards.

## Early-Game Lived Recovery Contract

Chapters 1-3 keep the existing twenty-eight screenplay scenes. Recovery is
shown through ordinary use before it is treated as a system milestone; no new
named resident, service NPC, location, or reward is created for these beats.

- Chapter 1 damage uses shared water, reserved sickbeds, tied doors, an empty
  return board, and a cold forge. After the route return, the forge receives a
  pot, hinges, and a cart wheel before weapons. The market remains unavailable.
- Chapter 2 turns restored travel into finite public stock. Authorized medicine
  is wrapped for waiting residents at the market; Mia checks the batch and does
  not own pricing, sale, inventory, or a service counter.
- Chapter 3 contrasts finite honest preparation with manufactured abundance.
  Gate oil, forge coal, medicine, and records visibly require work; the casino
  presents itself as the one place that never lacks power or prizes.
- Core cast entry remains sequential: Mia through rescue, elder through civic
  duty, Ailo as an unanswered street image, 伊萊 through evidence, Frey/Tavi
  through departure, and blacksmith through returned damage. Chapter 1 gives no
  cast roll call or full biography.
- Mia's early relationship chain is fixed: return check in Chapter 1, shared
  herb sorting and returning-footstep observation in Chapter 2, mutual
  concealed-wound conflict and one voluntary honest return in Chapter 3.

These are staging obligations inside existing town returns, not additional
fetch quests. Humor remains character-based and cannot erase grief, scarcity,
or route pressure.

## Placement Rules

- Chapter rewards should match the story cause. Repairing a forge should unlock
  forge service, recipes, or craft identity. Repairing a route should change stock,
  map safety, or information flow.
- Short side quests can give ordinary rewards. Medium and long side quests need
  story-matched rewards: function unlocks, equipment, recipes, access, or unique
  information.
- Elite monsters and non-main bosses can drop stronger and more distinct rewards
  than normal monsters, but their drops should still fit the monster body, weapon,
  region, and chapter.
- Base material drop rates should stay controlled because crafting requirements are
  not intended to become heavy grind walls.
- Shadow begins around Lv24-30 and is the base campaign's dark affinity ceiling.
- Glimmer is the base campaign's bright affinity ceiling and supports the true
  ending without becoming full light.
- Full Void and light creature groups, materials, equipment, affinities, and
  combat routes are optional second-run external progression. Their precursor
  relationship may be foreshadowed in mandatory lore, but they are not a
  Lv1-Lv70 mainline progression tier or true-ending requirement.

## Dragon Bridge Placement

- Chapter 5 should expose enough of the old expedition truth that the elder can
  recognize the dragon-sealed perimeter before the player does.
- First run: the elder leaves alone at the Chapter 5 to Chapter 6 bridge, dies at
  the dragon perimeter when pressure and sealing fire meet while he tries to fit
  the `seal_scar_shard` / 封痕碎片 into the old break. The player pursues him
  immediately; no casino scene delays the search.
- Second run: the player can stop the elder by combining the elder/scholar
  expedition truth with Ailo's Echo Whistle route truth.
- Chapter 6 first run: the player can observe containment but still has no
  decoded alternate route, sees that dragon fire killed the elder, and watches
  the same pressure rhythm move back toward town. The dragon offers only retreat.
  Crossing remains a rational incomplete-information decision, and the dragon
  clan responds with war.
- Chapter 6 second run: with both proofs and a non-hostile perimeter choice, the
  player opens dialogue with `elder_dragon`, which speaks for the dragon side.
  The shard stays outside, the weapon is placed down, the one-hole echo travels
  outside the seal, and the player does not cross during a real pressure surge.
  This does not mean the dragon trusts the player or grants passage; it means no
  current trespass exists, so the dragon conserves its strength and does not
  attack. Reuse the existing boss illustration; do not create a separate dragon
  spokesperson portrait.

## Mandatory Main-Support Route Placement V1

This matrix was previously mislabeled as general side-story placement. Nearly
every row carries a mainline clue, fixed character fate, service recovery, or
second-run correction and therefore cannot be optional. Names remain working
titles. Runtime ids, exact rewards, enemy lists, and item data are assigned only
after the route and map function are accepted.

Placement rule:

- Short side stories can solve immediate town needs and give ordinary rewards.
- Medium side stories should change town state, stock, route information,
  recipes, or preparation options.
- Long side stories should carry character fate, second-run keys, unique
  equipment, system access, or durable story consequences.
- If a side story needs a new NPC, monster, item, location, or asset, record the
  resource need before implementation.

| Chapter | Working Side Story | Length | Core NPCs | Story Role | Gameplay / Reward Role | Resource Gate |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | 巡線靴底 / Patrol Soles | Short | `village_elder`, `standard_bearer_frey` | Grounds the south gate as a real patrol route rather than a menu exit. | South gate safety text, first route hint, modest supplies. | No new NPC; can use existing south gate assets. |
| 1 | 苦瓶與甜膠 / Bitter Bottles | Short | Mia | Shows Mia naming wounds, poison, fatigue, and the difference between treating a person and stocking a stall. | Authorizes one basic medicine recipe for the market; no apothecary or transaction UI opens in her workroom. | Uses existing slime/early material sources; no assistant NPC. |
| 1 | 冷爐回煙 / Cold Forge Smoke | Medium | `blacksmith` | Makes equipment pressure human before the first boss. | Basic repair, starter forge, first simple recipe. | No new blacksmith trauma; avoid new apprentice asset here. |
| 2 | 藥籃底的名字 / Name Under The Herb Basket | Medium | Mia, `town_scholar` | Connects Mia's father to the expedition and shows the difference between a family memory and an incomplete civic record. Shared herb sorting and her reaction to passing footsteps deepen the relationship without a confession. | Relationship record, expedition name entry, and one researched market prescription. | No missing gatherer, notebook item, or new NPC is required. |
| 2 | 未結的名冊 / Ledger That Would Not Close | Medium | `town_scholar`, `village_elder` | Shows ordinary paperwork breaking after the old expedition and evacuation failures. | Handbook records, old route hints, `lich` route context. | No conspiracy or stolen-record plot unless approved later. |
| 2 | 空箱到貨 / Empty Crates Arrive | Short / Medium | `merchant` | Makes market recovery depend on route safety rather than an abstract UI unlock. | Market stalls, basic material/medicine delivery state, and route-based stock changes. | No supply captain is required; crate and carrier consequences may remain environmental records. |
| 3 | 霧裡的燈油 / Lamp Oil In Fog | Medium | `lamplighter_tavi`, `standard_bearer_frey`, `blacksmith` | Places the childhood mist before the fatal flag crisis. First run leaves the far marker unmeasured, so no safe wind guard can be built. Second run makes Tavi walk the route, provide exact dimensions, and admit why he took the lamp. | Night route markers, fog readability, first-run `rear_marker_unmeasured`, or second-run wind guard plus `tavi_role_admitted`. | No magic lamp or new material; use ordinary oil, glass, and a measured metal guard. |
| 3 | 展櫃玻璃 / Showcase Glass | Medium | `casino_dealer`, `casino_owner` | Lets desire come first: the player sees prizes before Vesper becomes a story target. | Casino floor, showcase inspection, ticket pools, odds visibility. | Uses existing casino UI; no final owner punishment yet. |
| 3 | 仍在點名的影 / Shadows Still Count Names | Medium | `town_scholar`, `blacksmith`, Mia | Shadow soldiers become old orders, not random dark enemies. The protagonist's concealed wound creates a mutual Mia conflict, then one honest-return beat repairs behavior without resolving the romance. | Shadow material source around Lv24-30, first shadow gear clue, and Mia relationship state. | Void remains an optional second-run external reveal, not a mainline progression requirement. |
| 4 | 旗與燈 / Flag And Lamp | Long | `standard_bearer_frey`, `lamplighter_tavi`, `village_elder`, `blacksmith` | First run: Tavi freezes, the protagonist is physically committed to the civilian crossing, and Frey dies holding direction. Second run: Tavi acts from the measured rear marker, Frey trusts his light, and later understands the elder's fear of opening the gate. | Route crisis, south gate morale, Frey/elder relationship state, possible shared flag-lamp relic later. | Death/rescue staging needs Gray Ridge background and Frey CG planning; no new NPC, magical flag, or alternate rescue path. |
| 4 | 四相備裝 / Fourfold Countergear | Short / Medium | `blacksmith`, Mia | Makes fire, ice, thunder, and poison threats readable in gear damage and patient records before they converge. | Elemental counter recipes, controlled material requests, dungeon prep. | Do not overfeed materials; keep requirements low. |
| 5 | 棘輪之後 / After The Ratchet | Long | Mia, `town_scholar`, `blacksmith` | First run: 伊萊 compresses four accurate separated-residue records into the unscoped line `標準二格固定可安全處理`; Mia removes the combined shard and dies when the trusted fixed-pressure procedure crushes it after extraction. Second run: remembered sound makes him reopen the source pages, reject the generalization, and join current-run pressure-free tests. | First/second-run achievement pair, Mia fate, 伊萊 confidence collapse/correction, relationship record, and scoped shard-handling method. | Reuse source pages, standard forceps, spider silk, and purified slime gel; no new miracle material, gather route, inherited document, or notebook item. |
| 5 | 遠征名冊 / Expedition List | Long | `village_elder`, `town_scholar` | Reveals enough old expedition truth for the elder to recognize the dragon-sealed perimeter. | Unlocks `seal_scar_shard` context and Chapter 6 non-war proof chain. | Do not add a new expedition boss silently. |
| 5 | 爐契與菁英素材 / Forge Contracts | Medium | `blacksmith`, `town_scholar`, Mia | Moves forging from repair into deliberate preparation for elite routes and dungeons while establishing the handling summary that matters in `After The Ratchet`. | Advanced forge, blueprint contracts, elite material requests, and run-specific evidence-scope state. | Blueprint art and exact equipment list are later asset/data work; no supply-captain dependency is introduced. |
| 6 | 封痕外圍 / Outside The Seal Scar | Main-support Long | `village_elder`, `town_scholar`, `elder_dragon` | First run immediately pursues the elder, finds an ambiguous pressure-and-fire death, crosses under advancing danger, and erases the local seal-keeping clan. Second run receives the shard alive, keeps shard/weapon/body outside the line, and earns non-attack without a granted road. | Dragon war or `dragon_non_attack_observed`, broad-seal state, old-route search, handbook memory. | Reuse `elder_dragon` boss art; no spokesperson, honor contract, dragon trust, passage grant, or new route asset is implied. |
| 6 | 灌鉛骰子 / Loaded Dice | Long | `casino_owner`, `casino_dealer` | First run exposes cheating but Vesper escapes. Second run uses achievement memory to identify the current run's loaded set and turn the contract against him. | Loaded Dice current-run key item, final showcase choice after second-run punishment. | Final game UI and unnamed contract-collection staging need later implementation planning. |
| 6 | 空白抵契 / Blank Collateral | Medium | `casino_dealer`, `black_market` | Explains how Vesper commercialized a contract with a nonhuman creditor without making black market the mastermind. | Forbidden information, risky stock, casino route proof. | The mandatory casino route does not name the creditor as Void or give the black market endless contracts; a later optional second-run route may reveal its nature. |
| 7 | 回聲哨 / Echo Whistle | Main-support Long | `street_beggar` / Ailo | First run: Ailo steals the whistle, opens the old mountain road, and an audience-only cutaway reveals an unfinished promise before his bloody trail ends at the upper escape cliff. Second run: accompaniment and memory correct his fatal inversion of Neelu's last order. | Old mountain road access, second-run dragon-route meaning, `先行的回聲`, Ailo survival state. | Young Ailo, Neelu, whistle, and memory scene art are deferred; no corpse or death CG. |
| 7 | 回聲盡頭，花仍會開 / Flower At The Echo's End | Long epilogue | Ailo, Neelu memory | Resolves the flower-field promise and restores `往下活著` without turning Neelu into a lore machine. The white-petaled, pale-green-centered flower is separated from dye work in memory and later arrives alone. | Achievement, unsigned flower letter, final handbook memory; no material reward. | The same flower must remain visually consistent across memory and letter; no explanatory tooltip or dialogue. |
| 7 | 微光顯核 / Glimmer Reveals The Core | Medium / Late | `town_scholar`, `blacksmith`, `thorn_witch` route | Uses pure Forest Essence and the mainline Glimmer Shard only after Life Seed returns borrowed vitality and Ancient Rune pins the escaping echo. The combination exposes the rooted core without importing full light. | Three neutral anchor housings usable by every weapon form; true death is confirmed when all three cease reacting and the black pulse ends. | Full light, radiant dungeon access, a required legendary sword, and loop-aware Demon dialogue remain excluded from mandatory mainline; optional external progress never receives credit for the true kill. |

## Optional Character-Deepening Side Stories V2

The optional-story definition is character-first. Every recurring town character
with an accepted runtime profile owns one short, one medium, and one long story.
Short stories reveal habits and ordinary
relationships; medium stories expose background or contradiction; long stories
let the player understand the character's life and carry a story-matched durable
reward. Positive, humorous, romantic, investigative, and painful stories are all
valid when they follow the character's established worldview.

All 33 personal stories pass the skip test: removing every optional entry leaves
all mandatory deaths, rescues, route keys, villain proof, and endings legible.
Shared stories may count as relationship depth, but each core character still
owns three personal entries. Exact stage objectives, scene prerequisites, reward
bindings, map owners, and resource needs live in
`OptionalSideStoryRegistry.js`.

| Character | Short | Medium | Long | Chapter Coverage | Durable Reward Direction |
| --- | --- | --- | --- | --- | --- |
| Village elder | 地圖總是不平 | 門外與桌內 | 沒有回程的名單 | 1-5 | Civic records and `return_tag` travel accessory. |
| 伊萊 | 空格不是答案 | 雨水走過的字 | 原頁不必闔上 | 1-5 | Source/scope labels, cross-reference, and open-source index. |
| Mia | 沒有病歷的下午 | 沒有打開的窗 | 沒有傷也能回來 | 2-5 | Market-authorized medicine, relationship record, emergency prescription. |
| Frey | 巡線靴底 | 旗影不替燈說話 | 旗也有看不見的地方 | 1-4 | Route readability and `old_flag_knot` travel accessory. |
| Tavi | 每扇門都嫌燈歪 | 沒人聽時也要報數 | 最後一盞也是位置 | 1-4 | Camp/return-light utility and `rear_lamp_clasp` accessory. |
| Blacksmith | 鍋蓋不是盾 | 沒人領走的東西 | 爐火不只為刀刃 | 1-5 | Repair utility, `returned_buckle`, optional armor reinforcement. |
| Ailo | 沒有用的東西 | 總要多留一份 | 屋簷下的一晚 | 2-6 | Relationship records and an achievement; no fixed scrap token, route clue, or forced equipment. |
| Vesper | 先看價碼，再問名字 | 每種渴望都有一張桌 | 莊家從不靠意外 | 3-6 | Tickets, odds history, and a non-mainline high-risk pool invitation. |
| Lorne | 認得骰子的手 | 不下注的夜晚 | 總帳上的空白列 | 3-6 | Handling tutorial, voluntary cashout visibility, public loss ledger. |
| Public merchant | 空箱也得點數 | 貨印不替人說謊 | 空貨架也要明碼 | 2-5 | Source labels and finite-stock reservation view. |
| Black-market trader | 我不替你保證 | 灰燼貨號 | 交易結束以後 | 3-6 | Risk clauses, source comparison, and batch warnings. |

Six additional ensemble shorts establish relationships without replacing those
personal lines: `苦茶與彎湯匙`, `到底是誰把燈掛歪`, `替沒用的東西取名字`,
`三個人命令一個人休息`, `收攤後才開始分貨`, and `沒有主人的桌`.

The 33 personal stories and six ensemble shorts passed user review on
2026-07-19. They now remain `approved_pending_production`: their character
direction, chapter placement, reward ownership, and derived-resource scope are
locked, but they are not playable until formal dialogue, required assets,
runtime quest records, discovery interactions, and end-to-end validation exist.
Approval does not assign final stats, quantities, prices, or activate entries in
the quest list.

Chapter placement is an availability window, not an automatic quest dump.
Stories remain hidden until the player speaks to the owning character or
interacts with the owning place; they never auto-track, and each personal chain
advances short -> medium -> long. This lets Chapters 2-3 contain the largest
relationship network without placing every available story in the quest list at
once.

Current chapter cadence is derived from `OptionalSideStoryChapterPlacement`:

| Chapter | Newly discoverable stories | Total story stages | Pacing function |
| ---: | ---: | ---: | --- |
| 1 | 5 | 5 | Five personal shorts introduce work habits after each character's mandatory entrance. |
| 2 | 13 | 13 | The repaired road and market create the first broad relationship layer; prerequisites and direct interaction prevent simultaneous presentation. |
| 3 | 14 | 22 | Peak town-life chapter: personal long stories, casino observation, and three ensemble scenes become discoverable across separate town returns. |
| 4 | 6 | 18 | Few new starts; existing Frey/Tavi, forge, Ailo, casino, market, and black-market lines reach their decisive middle stages. |
| 5 | 0 | 12 | No new side story begins. Existing long stories either close before fixed tragedies or continue through their consequences. |
| 6 | 1 | 5 | Only the post-casino ensemble short begins; Ailo, casino, and black-market lines close around mandatory outcomes. |
| 7 | 0 | 0 | The final mountain route, memory, Demon King battle, return, and ending remain uninterrupted by optional quest stages. |

The Chapter 2-3 numbers are review inventory, not UI badges. No global quest
prompt appears at chapter start. A player discovers only the story belonging to
the character or place they deliberately revisit; unfinished undiscovered
stories remain hidden rather than becoming tracked objectives.

### Derived Side-Story Resources

The current 39-story review draft reuses the eight accepted town places and the
existing seven chapter maps. It creates no new character, monster, map location,
side-story-exclusive background, or mandatory CG request. Four background
owners reused from the mandatory screenplay still lack runtime mappings:
`night_watch_line`, `dead_checkpoint`, `old_waystation_cache`, and
`center_span_marker`.

- New item/data ids: `return_tag`, `returning_season_tea`,
  `mia_emergency_kit`, `old_flag_knot`, `rear_lamp_clasp`, `returned_buckle`,
  `homebound_reinforcement_blueprint`, `house_invitation_chip`.
- New image ids: the eight item ids above. These eight images remain
  ungenerated until their stories pass review. The casino public ledger is a
  mandatory mainline result and reuses the dialogue/handbook presentation; it
  is not an optional-story icon reward.
- New UI/system hooks: handbook return filters, civic resident records,
  uncertainty filters, record cross-reference, open-source index, Mia emergency
  market stock, patrol-marker readability, rear-light camp utility, one-use
  repair credit, optional armor reinforcement, casino odds history, high-risk
  pool access, voluntary cashout, Lorne responsibility indexing, and casino
  restitution-status filtering.
  Public-market source labels and reservation view, black-market risk clauses,
  third-party source comparison, and black-market batch warnings complete the
  20-hook review ledger.
- Dialogue uses the closed nine-expression vocabulary. The current performance
  plans request 58 unique actor-expression combinations: 33 physical files are
  absent, while four existing neutral files need registration only. This is a
  review ledger, not generation approval; final dialogue may reduce the count,
  and no new emotion name may be invented to solve a missing performance.

`OptionalSideStoryDerivedResources` and `OptionalSideStoryChapterPlacement` are
the runtime-facing ledgers for these needs and chapter stages.
`scripts/SideStoryAssetCheck.mjs` is the reproducible physical-file and mapping
audit; `docs/ART_STYLE_GUIDE.md` owns the human-readable exact gap list.

## Town Recovery By Chapter

| Chapter | Town Direction |
| ---: | --- |
| 1 | Town is visibly damaged through shared water, reserved beds, tied doors, and empty return spaces. Mia's private workroom appears only through rescue/relationship scenes. South Gate records, the handbook, and the relit basic forge recover; household repairs visibly precede weapon demand. The market remains closed. |
| 2 | The rebuilt market owns transactions and finite medicine stock; Mia authorizes and checks prescription batches. Route safety, named losses, and the information board begin to matter. Waiting residents visibly receive stock. No apothecary facility exists. |
| 3 | Gate lamps, market stock, forge work, records, and Mia's care form one limited honest network. Casino temptation, black market contact, and shadow precursor crafting open as faster alternatives; no separate rumor-service NPC is required. |
| 4 | Town services become preparation choices for elemental threats. |
| 5 | Advanced forge contracts and dungeon preparation become central. |
| 6 | Forbidden trading and casino consequences can start echoing into future story. |
| 7 | Glimmer completes the mandatory true-kill preparation. No radiant chapel or full light progression is required by the mainline; optional second-run external routes remain separate map branches. |

## Reward Distribution Direction

- Normal mobs: basic materials, common equipment, small regional identity.
- Strong normal mobs: uncommon materials, occasional equipment with a clear body or
  tool connection.
- Elite monsters: better materials, unique equipment, recipes, or access keys.
- Non-main bosses: strong themed gear and dungeon-specific craft objects.
- Main bosses: signature equipment that visually matches the boss-held or boss-worn
  object.
- Casino: ticket-driven random pools with clear rates and unique items, but chapter
  strength must stay within the chapter's power curve.
- Forge: controlled targeted power through recipes, blueprints, and material routing.
- Black market: targeted but risky sources, especially forbidden or shadow-adjacent
  objects.

## Ordered Implementation Work

Current checkpoint on 2026-07-18:

- Screenplay causality, 66 scene records, four stage classes, seven regional
  graphs, town ownership, quest flags, resolver state, and handbook integration
  are implemented as a reviewable foundation.
- First-run monster ecology and formal weapon source structure are implemented.
  Chapter monster counts are `9, 8, 8, 8, 10, 8, 8`; every Lv10 weapon band has
  five-form baseline craft coverage.
- Monster and weapon source structure is not final reward balance. Exact quest
  rewards, drop rates, material quantities, stock layers, and numeric combat
  values remain deferred until map and scene functions are approved.
- Chapter 1-2 dialogue, expression timing, backgrounds, audio, and one complete
  no-skip playthrough remain the current review gate.
- Chapters 3-7 narrative art should be produced only after the Chapter 1-2
  presentation pattern passes review.

The old `main_001` chain, three-chapter quest values, random/ring geography, and
old route checks are removed from the active story flow. Internal encounter
balance, rewards, combat, and tower work remain deferred.
