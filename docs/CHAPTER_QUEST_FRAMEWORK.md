# Chapter Quest Framework

Last updated: 2026-07-11

## Purpose

The game is being stretched toward Lv1-Lv70 content. Main quests, side quests,
town recovery, equipment sources, dungeons, and third-party sources need a shared
chapter spine before rewards are redistributed.

Combat redesign and tower rewrite are paused. This framework only defines where
story and systems should land.

## Runtime Spine Files

- `src/js/data/StorySceneRegistry.js` owns the 66 mandatory scenes.
- `src/js/data/ChapterRegionRegistry.js` owns seven handcrafted regional maps,
  authored routes, fixed locations, and Boss convergence.
- `src/js/data/Quests.js` contains one reward-free scene-driven record per chapter.
- `src/js/data/OptionalSideStoryRegistry.js` holds seven deferred deepening
  concepts; none is a playable quest or reward owner yet.
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

## Optional Character-Deepening Side Stories V1

These stories pass the skip test: removing every row leaves all mainline deaths,
rescues, route keys, villain proof, and endings understandable. They add daily
life, affection, humor, or relationship texture. Exact objectives and rewards
remain deferred until the owning map or town function is implemented.

| Chapter Window | Working Side Story | Characters | Optional Deepening | Mainline Boundary | Future Location / Function Owner |
| --- | --- | --- | --- | --- | --- |
| 1-2 | 門外與桌內 / Outside The Door, Inside The Desk | `village_elder`, `town_scholar` | The two old friends process shelter changes and mutually correct each other's habits with the familiarity of people who survived from opposite sides of one gate. | Adds no expedition proof and cannot reveal or prevent the elder's departure. | Civic-room revisit and resident-notice interaction. |
| 2-3 | 沒有病歷的下午 / An Afternoon Without A Case | Mia | The protagonist helps with ordinary work while Mia repeatedly invents one more task instead of resting; affection and self-neglect appear without an emergency. | Contains no shard clue, surgery method, or rescue condition. | Mia workroom relationship revisit; never a shop or paid-heal menu. |
| 2-3 | 旗影不替燈說話 / A Flag Cannot Speak For A Lamp | Frey, Tavi | Route-marking banter and conflicting work habits show how well they know each other before Gray Ridge. | Tavi's far-marker measurement and wind guard remain mandatory mainline beats. | South Gate and an already discovered short patrol segment. |
| 2-4 | 先修鍋 / Repair The Pot First | `blacksmith` | Household repairs, resident priorities, and blunt jokes show what the forge protects when no Boss weapon is involved. | Does not unlock required forge tiers or provide required Boss equipment. | Forge revisit and visible household-repair queue. |
| 2-4 | 沒有用的東西 / Useless Things | Ailo | The player may watch or help Ailo sort scraps that carry tenderness only after the second-run memory recontextualizes them. | No whistle instruction, old-road turn, flower identity, or theft prevention is hidden here. | Town-edge scrap interaction and second-run dialogue variant. |
| 4-5 | 不下注的夜晚 / A Night Without Betting | Lorne, Vesper | Lorne helps an unnamed patron leave the public floor with something intact; Vesper treats the unclaimed loss as wasted value. | Loaded Dice, witness clauses, collateral rules, and Lorne's decisive refusal remain mainline. | Casino public floor and odds-visible table state; no new patron portrait. |
| 4-5 | 灰燼貨號 / Ash Freight Marks | `merchant`, `black_market`, `town_scholar` | Trade marks show how legal and illegal supply react differently to ash pressure and let the town feel economically inhabited. | Supplies no required elemental clue, contract proof, or black-market access key. | Market route record and black-market revisit after discovery. |

Future rewards must follow these owners. A civic or relationship revisit should
not casually award Boss equipment; a route interaction should not duplicate a
market or forge function. Reward definition remains outside the current pass.

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

Current checkpoint on 2026-07-11: steps 1-5 are implemented as a reviewable
runtime foundation. The user may still revise scene prose and details; the data
contract no longer depends on obsolete quest or route scaffolds.

1. Finish screenplay causality and synchronize accepted character dossiers into
   the master register. Mia's obsolete apothecary/notebook route is closed.
2. Assign all 66 scenes to the four stage classes and freeze the seven regional
   route graphs described above.
3. Lock the town-place and market contract so route returns have one destination
   and Mia's survival never owns transaction continuity.
4. Reorder the omniscient timeline against those locations, then write full
   dialogue, expressions, entrances, exits, and first/second-run staging.
5. Remove obsolete route/quest data and implement the new region database, scene
   registry, quest flags, town resolver, and handbook integration directly.
6. Redistribute existing quest rewards, monster/equipment sources, and dungeon
   tables only after the story and location graph are locked.
7. Produce missing backgrounds, expression layers, and story CGs after the
   screenplay and asset list are approved.

The old `main_001` chain, three-chapter quest values, random/ring geography, and
old route checks are removed from the active story flow. Internal encounter
balance, rewards, combat, and tower work remain deferred.
