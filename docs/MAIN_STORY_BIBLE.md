# Main Story Bible

Last updated: 2026-07-09

## Purpose

This is the authoritative story-development document for the mainline plot,
long-form suspense, character arcs, character entry/exit planning, and story-to-
system adaptation.

Runtime JS/data remains the source of truth for implemented behavior. This file
exists so future writing and implementation passes do not drift into disconnected
quest errands, random NPC additions, or unplanned lore.

## Current Narrative Reset

The current quest outline, route clues, and mainline text are now treated as
implementation scaffolding, not final canon. Keep the usable systems and world
pillars, then rebuild the plot cleanly from the central mystery, cast arcs, seven
chapter promises, and Chapter 1 scenes.

Keep:

- The wounded frontier-town premise.
- Route-driven exploration, fog, fatigue pressure, watchposts, and boss
  convergence.
- Equipment pressure through durability, crafting, repair, monster drops, and
  recipes.
- Monster ecology where drops and gear come from believable bodies, regions, or
  factions.
- The current dark realistic fantasy visual direction.

Reset or rewrite:

- The current main quest chain as final story.
- The current quest spine as final seven-chapter canon.
- The first-chapter route plan as final plot order.
- Low/medium/high/death route identity.
- Talk-count-based relationship depth.
- Generic request/report dialogue bridges.
- Reward and material overfeeding from older task-style quests.

New story resources are gated. If a beat needs a new NPC, monster, boss,
material, item, equipment, location, portrait, or scene asset, propose the story
reason, system function, acquisition/source, downstream data changes, asset
needs, and validation plan before implementation. The machine-readable version of
this rule lives in `src/js/data/StoryRebuildPlan.js`.

## Accepted Emotional Structure V1

This section supersedes any narrower interpretation that makes the whole story
only about repairing a broken town. The town, bell, roads, watchposts, and
services are important play spaces, but the main story is a dark fantasy
two-pass novel structure built around misunderstanding, sacrifice, and
understanding.

Core experience:

- First run: the player is an outsider who experiences a complete heroic
  adventure, defeats the final boss, and receives a false victory. The intended
  emotion is confusion, emptiness, and the sense that winning still left
  something wrong.
- Second run: the player returns with the ability to read old lines, town
  states, NPC behavior, route clues, and item records differently. The intended
  emotion is shock, grief, gratitude, and the desire to protect people the player
  did not understand the first time.
- Good end or radiant DLC route: the player cannot erase every wound or restore
  a perfect past. The point is to understand what was entrusted, save a limited
  number of people where possible, give meaning to irreversible sacrifices, and
  reach release instead of a hollow win.

First-run design rule:

- The first run must be fair and playable. NPC lines, objectives, bosses, and
  deaths need a clear surface meaning so players do not feel punished for not
  knowing hidden information.
- The first run should still contain real clues. They read as atmosphere or
  ordinary world detail at first, then become legible after later knowledge.
- The first ending is not a failure state. It is a bad end by incomplete
  understanding: the player wins the visible battle but has not understood what
  people carried, hid, or entrusted.

Second-run design rule:

- The second run opens the second meaning of first-run lines and objects. A line
  such as "the bell sounds far today" can be ordinary mood in run one, then a
  route-state warning in run two after the bell system has been understood.
- The second run may unlock new interactions, hidden routes, NPC rescue windows,
  relationship records, and handbook interpretations, but those additions must
  grow from first-run evidence.
- The second run should make the player feel that the loop is not meaningless.
  NPCs were not waiting to die for the protagonist; they moved forward according
  to their own beliefs and passed on what they could.

DLC or good-end rule:

- The radiant or light route can open after the bad-end knowledge loop. It should
  not cheaply undo the first run. Some people can be saved, some can only be
  understood or sent off properly, and some selfish or compromised characters may
  survive because survival is not moral proof.
- Good end release comes from carrying many entrusted flames forward, not from
  returning everyone to the opening state.

## Working Canon V0

This is the current rebuild target before runtime quest rewrite. It uses existing
town, NPC, monster, boss, dungeon, and system resources first.

Note: the route-seal and broken-town material below remains useful scaffolding,
but any literal plot detail must be rechecked against `Accepted Emotional
Structure V1` before runtime rewrite.

Central mystery:

- The town did not merely survive an attack. It is part of an old route-seal
  network, and the broken bell in the square is the most visible wound in that
  network.
- Roads, watchposts, old camps, boss traces, and dungeon routes are pieces of the
  same mystery. Exploration should make the player feel they are restoring a map
  that someone deliberately broke.
- The deeper question is not "which monster did this?" but "who knew the routes
  were a lock, and why did the lock fail now?"

Final truth:

- The final pressure is `demon_lord_asariel`, but the route to the ending should
  reveal that brute force alone did not open the disaster. Fear, shortcuts,
  hidden bargains, and abandoned records weakened the town long before the final
  enemy appeared.
- The player wins by rebuilding combat strength and information strength at the
  same time: routes, town services, NPC trust, boss traces, equipment pressure,
  and dungeon preparation converge.
- `aurora_archon` is best reserved as a late light/radiant convergence or
  high-tier dungeon pressure, not the mainline final villain.

Story promise:

- Chapter 1 asks the player to prove which roads still breathe.
- Chapter 2 turns safe travel into supply, medicine, and civic recovery.
- Chapter 3 shows that shadow is not a random element; it remembers soldiers,
  debt, and old orders.
- Chapter 4 makes the land itself unstable through stone and elemental pressure.
- Chapter 5 makes strength expensive: dragons, advanced forge routes, and heavy
  choices force preparation.
- Chapter 6 makes forbidden help tempting enough to matter.
- Chapter 7 closes the bell-route mystery and tests whether the rebuilt town is
  strong enough to stand behind the player.

## Core Cast Arcs V0

- `village_elder`: Starts as the exhausted civic anchor. He was once a young
  militia captain who advocated the failed expedition twenty years ago, survived
  the one-sided slaughter, and now fears sending another armed young person into
  the same kind of ruin. See `docs/characters/VILLAGE_ELDER_PROFILE.md`.
- `town_scholar`: Better understood as the old village clerk 伊萊, not a
  historian or oracle. He searches broken tax, letter, route, funeral, and
  missing-person paperwork for possible clues, while learning with the player
  what the outside has become. See `docs/characters/TOWN_SCHOLAR_PROFILE.md`.
- `standard_bearer_frey`: Makes the south gate feel like a real wound through a
  humble patrol flag, youthful courage, and a first-run death that can only be
  prevented after Tavi grows in the second run. See
  `docs/characters/STANDARD_BEARER_FREY_PROFILE.md`.
- `blacksmith`: Gives equipment pressure a human voice and acts as the village
  temperature gauge. When people are alive, his care hides inside loud insults;
  when the village thins out, he cannot keep the concern wrapped. See
  `docs/characters/BLACKSMITH_PROFILE.md`.
- `herbalist`: Carries the body cost of the crisis and the emotional cost of
  care. Her father vanished with the old expedition, her mother died afterward,
  and her bond with the protagonist can become a major first-run tragedy and
  second-run rescue route. See `docs/characters/HERBALIST_PROFILE.md`.
- `merchant` and `supply_captain`: Make routes matter economically. Their
  presence should answer, "what changes when this road is safe?"
- `street_beggar`: In progress as an outside survivor from a lost settlement.
  He is not an oracle; his madness must have logic rooted in how the disaster
  broke the rules by which he understood the world. See
  `docs/characters/STREET_BEGGAR_PROFILE.md`.
- `rumor_broker`, `black_market`, and casino cast: Enter only when information,
  temptation, and shortcuts become systemically meaningful.
- `lamplighter_tavi`: Bridges route safety, ordinary lamplight, and the fear of
  standing in a place where someone might die. His second-run route is the key to
  saving Frey. See `docs/characters/LAMPLIGHTER_TAVI_PROFILE.md`.

## NPC Long-Arc Rules V1

Every recurring NPC should be designed before their death, survival, betrayal,
or rescue is assigned. They need a life beyond the scene that uses them.

Each major NPC profile should define:

- Public function: what the player sees first.
- Private desire: what the NPC wants when nobody is rewarding them.
- Wound or fear: what they cannot easily say.
- Belief: the personal rule that keeps them moving.
- Useful secret: what piece of the world only they can reveal.
- First-run surface: how their words and actions read before the player knows
  the deeper truth.
- Second-run reading: what the same words or actions mean after the player has
  later context.
- Possible fate: survives, dies, disappears, betrays, is rescued, profits, is
  changed, or becomes a DLC echo.
- Entrusted flame: what remains with the player if this NPC is lost or cannot be
  fully saved.

Death rules:

- Do not kill an NPC only to raise stakes. A death must complete or break that
  character's belief in a way that later content can remember.
- Not every important NPC should die. Greedy, compromised, cowardly, stubborn,
  or lucky people can survive to the end.
- A saveable death should have fair second-run evidence. An irreversible death
  should still gain understanding, farewell, or legacy in the second run.
- NPCs do not exist to sacrifice themselves for the player. They may protect the
  player, but the deeper reason should be their own belief, debt, love, fear,
  duty, or refusal to abandon something.

## Initial NPC Profile Workbench V1

These are not final plot fates. They are starting constraints so future chapter
writing does not turn characters into disposable plot tools.

| NPC | Public Function | Private Desire / Belief | First-Run Surface | Second-Run Reading | Fate Direction |
| --- | --- | --- | --- | --- | --- |
| `village_elder` | Opening civic anchor and town burden. | Keep ordinary people standing even when he cannot explain everything. | A tired leader giving cautious instructions. | His pauses and route warnings show he recognizes old patterns but lacks the full answer. | Should not default to confession or sacrifice; survival with guilt may be stronger. |
| `town_scholar` | Village clerk, handbook support, route and document lookup. | Help living people move through broken daily records without pretending to know more than he does. | Kind old clerk finding possible clues in old paperwork. | Future evidence lets him search a different document layer and avoid one first-run tragedy chain. | Current direction is survival with emotional collapse, not early death. |
| `standard_bearer_frey` | South gate patrol flag and route direction. | Keep the flag visible because a childhood flag once brought her and Tavi home. | Young, friendly, brave, and naive about the true cost of fear. | Tavi's growth lets her survive and teaches her that entrusting danger to someone loved is terrifying. | First-run death is accepted; second-run rescue depends on Tavi. |
| `blacksmith` | Forge recovery, equipment pressure, village temperature gauge. | Keep people coming back with their gear, not only send gear back out. | Loud, insulting, energetic care wrapped in mockery. | If the player saves people, he keeps more of that noisy warmth; if people die, he speaks direct concern because jokes fail. | Survives; no personal death route or failed-weapon trauma needed. |
| `herbalist` | Medicine, fatigue, wounds, poison, bodily cost. | Save people because the first people she loved could not be saved. | Gentle healer and gradually deepening emotional anchor. | Her notebook and early medicine route can prevent the desperate outing that dooms her in run one. | Major emotional branch: first-run loss or disappearance, second-run rescue and self-saving growth. |
| `merchant` / `supply_captain` | Routes, stock, economy, contracts. | Keep trade moving because hunger makes ideals collapse. | Practical supply unlock and price pressure. | Their ledgers can expose who was abandoned, supplied, or quietly profited. | May survive through pragmatism; not all greed is villainy, and not all profit is safety. |
| `street_beggar` | Outside lost-settlement survivor and low-place witness. | Speak from a broken inner world without caring who believes him. | Erratic beggar who seems like flavor or nonsense. | Some lines become legible after the player understands the disaster's rules. | Current direction is disappearance; original identity and madness logic remain unresolved. |
| `rumor_broker` | Rumor routes and underside information. | Be paid, believed, or useful before truth loses value. | Optional gossip and suspicious hints. | Rumors may expose overlooked civic rot or future shortcuts. | Later-route support; not part of the current core-eight profile pass. |
| `casino_owner` / casino cast | Temptation, odds, debt, display-case desire. | Turn fear and hope into a game they can control. | Stylish side route and reward temptation. | Casino odds may mirror the world's treatment of heroes, sacrifice, and acceptable loss. | Greedy survival is allowed; route can become unsettling without requiring death. |
| `lamplighter_tavi` | Ordinary patrol lamp, night route safety, Frey rescue route. | Stand beside Frey's flag with a light, even though he is afraid. | Timid childhood friend who freezes when death becomes real. | He admits his dependence on Frey and acts while still afraid, preventing her sacrifice. | Survives first run hollowed by grief; can grow in second run before the tragedy. |

## Detailed Character Profile Files V1

Accepted major-character details that are too specific for this overview live in
the character dossier folder:

- `docs/characters/VILLAGE_ELDER_PROFILE.md`
- `docs/characters/HERBALIST_PROFILE.md`
- `docs/characters/TOWN_SCHOLAR_PROFILE.md`
- `docs/characters/STANDARD_BEARER_FREY_PROFILE.md`
- `docs/characters/LAMPLIGHTER_TAVI_PROFILE.md`
- `docs/characters/BLACKSMITH_PROFILE.md`
- `docs/characters/STREET_BEGGAR_PROFILE.md`

When these files and this story bible disagree, treat the detailed profile file
as the stronger source for that character's background, wound, first-run arc,
second-run reading, and unresolved fate questions. Runtime JS/data still remains
the source of truth for currently shipped behavior.

## Seven Chapter Story Spine V0

| Chapter | Level | Working Title | Boss Convergence | Suspense Function |
| ---: | ---: | --- | --- | --- |
| 1 | 1-10 | 不響的鐘 / The Bell That Would Not Ring | `forest_guardian` with `ambush_mantis` as early route threat | The player proves which roads still exist and learns the woods are reacting to a broken town signal. |
| 2 | 11-20 | 斷路上的藥味 / Medicine On The Broken Road | `lich` | Supply and medicine return, but old records imply the town has hidden a previous evacuation. |
| 3 | 21-30 | 影子仍守夜 / Shadows Still Keep Watch | `shadow_commander` | Shadow enemies look less like invaders and more like orders that never ended. |
| 4 | 31-40 | 石心與灰雨 / Stone Heart, Ash Rain | `ancient_titan` or `ash_baron` | The ground, forge routes, and old structures reveal that the map itself is part of a lock. |
| 5 | 41-50 | 元素失衡 / The Elements Lose Their Shape | `elemental_lord` | Fire, ice, thunder, poison, and craft routes stop feeling separate; the seal is distorting forces beneath the region. |
| 6 | 51-60 | 龍看見舊約 / The Dragon Remembers The Pact | `elder_dragon` | Dragon pressure reframes the old pact; the town was protected by an agreement, not only by walls. |
| 7 | 61-70 | 裂鐘回聲 / Echoes Of The Broken Bell | `demon_lord_asariel` | The final enemy uses every unrepaired shortcut, hidden debt, and broken route; the ending tests the rebuilt town network. |

## Chapter 1 Target Flow V0

Chapter 1 should be rebuilt as one continuous investigation, not a chain of
errands.

Initial town state:

- Visible: `village_elder`, `town_scholar`, south gate exit.
- Hidden or absent: forge, market, casino, black market, most later service NPCs.
- The town feels usable but thin. Too many closed doors. Too much quiet.

Scene flow:

1. `village_elder` sends the player to `town_scholar` because the town needs
   routes, not another notice pinned to a board.
2. `town_scholar` gives a concrete first investigation: reach three nearby
   landmarks and mark which roads still carry footprints, smoke, or monster
   traces.
3. South gate staging introduces `standard_bearer_frey` as a visible defense
   pressure, but she should not become a full service NPC too early unless the
   route scene needs it.
4. The player explores route nodes under fatigue pressure. Fog, watchpost logic,
   and landmark text carry the investigation.
5. `ambush_mantis` works as the first route-threat lesson: monsters can be clues,
   not only drops.
6. Evidence points to the forest reacting to a broken signal from town. The
   `forest_guardian` becomes the chapter convergence.
7. After the boss, the town does not become safe. It becomes legible: the player
   has proven that roads, monsters, and the broken bell are connected.

Chapter 1 implementation gates:

- Rewrite `main_001` through the first boss route only after this flow is
  accepted.
- Replace abstract dialogue with concrete directions in character.
- Store discovered route/boss traces in the traveler handbook.
- Do not feed the player excess materials through quest rewards.
- Do not add new monsters, materials, NPCs, or assets for Chapter 1 unless the
  resource gate is approved.

## Chapter 1 Scene Nodes V0

These are implementation-facing story nodes. They should become explicit
dialogue, quest, route, town-state, or handbook records in the next pass.

| Node | Existing Resources | Player-Facing Purpose | System Output |
| --- | --- | --- | --- |
| `ch1_elder_bell_square` | `village_elder`, cracked bell square premise | The elder does not give a kill list. He admits the town needs to know which roads still answer. | Opens `town_scholar`; keeps town sparse. |
| `ch1_scholar_route_brief` | `town_scholar`, traveler handbook | The scholar gives a concrete route task: check three nearby landmarks for footprints, smoke, and monster traces. | Starts route investigation objective. |
| `ch1_south_gate_pressure` | `standard_bearer_frey`, south gate exit | The south gate feels guarded, tired, and real. The player sees why fatigue and route safety matter. | Optional scene staging; no full service unlock yet. |
| `ch1_three_landmarks` | `south_gate_farmland`, `hunter_boardwalk`, `old_campfire_site` | The player reads the road through physical traces instead of following a checklist. | Records route findings in handbook. |
| `ch1_ambush_mantis_evidence` | `ambush_mantis`, silver-snare route clues | The first boss-like threat teaches that monsters carry information. | Unlocks early boss trace and route danger logic. |
| `ch1_forest_signal` | `forest_guardian`, forest clue chain | Evidence reframes the forest as a wounded responder to the broken bell-route signal. | Opens first chapter boss convergence. |
| `ch1_after_forest_guardian` | `village_elder`, `town_scholar`, town-state resolver | The town is not safe, but it becomes more legible. Roads, monsters, and the broken bell are now connected. | Chapter 2 seed; controlled town/service recovery. |

## Story Ambition

Design the main story like a long film or serialized drama, not a simple quest
chain.

The mainline must:

- Begin with memorable characters, a wounded town, and a clear survival pressure.
- Establish a central mystery early.
- Let each chapter solve an immediate crisis while opening a deeper question.
- Keep suspense alive until the final chapter.
- Make bosses feel like story convergence points, not only combat gates.
- Let side stories enrich people, history, rumors, relationships, and future
  payoffs.
- Bring early clues back later so the ending feels earned rather than sudden.

## Screenwriting Rules

- Start from characters, secrets, relationships, and conflict before writing
  task lists.
- Every major NPC should have a desire, fear, wound, useful secret, and pressure
  point.
- Dialogue should carry personality, conflict, or withheld information. Do not
  use dialogue only to explain mechanics.
- A chapter can answer one question, but it should usually introduce another.
- Twists should reframe earlier information instead of appearing from nowhere.
- Do not reveal the full truth too early. Give the player enough to act, not
  enough to close the mystery.
- Avoid fake mystery. If a secret is teased, it needs either a later payoff or a
  clearly local resolution.

## Mainline Design Order

Use this order before runtime implementation:

1. Define the central mystery and final truth.
2. Define the major cast and each character's arc.
3. Define seven chapter promises: question, pressure, reveal, twist, and boss
   convergence.
4. Define character entry, temporary absence, return, betrayal, death, recovery,
   or role change where relevant.
5. Define which side stories support each chapter's emotional or factual gaps.
6. Define required locations, scenes, portraits, monsters, items, and system
   changes.
7. Only then translate the plan into quests, dialogue, town flags, landmarks,
   boss routes, encyclopedia unlocks, and traveler-handbook records.

## Chapter Suspense Template

Every chapter should eventually have:

```markdown
## Chapter N - Working Title

Level band:

Opening question:

Immediate survival pressure:

Core NPCs:

New or returning NPCs:

NPC exits or absences:

Main landmarks:

Side-story support:

Boss convergence:

What the player learns:

What remains unanswered:

End-of-chapter twist or pressure shift:

Town-state change:

Asset needs:
```

## Character Entry And Exit Rules

- Characters should not all appear at the start. The broken town should begin
  sparse.
- Entry should usually be tied to story cause: rescue, reopened route, rumor,
  service recovery, debt, danger, or a returned supply line.
- Exit should matter. Temporary absence, injury, fear, debt, concealment, or
  relocation should change town feeling, available services, dialogue, or clues.
- Do not add a character only because a scene needs another speaking head.
- New characters require a clear reason:
  - what secret they hold,
  - what system or location they affect,
  - when they enter,
  - when they leave or transform,
  - what asset they need,
  - what future payoff they support.

## Current Character Pool Policy

Use the existing cast first. The current pool is enough for Chapter 1 and early
midgame, but not enough to carry the entire seven-chapter story without planned
expansion.

Current core candidates:

- `village_elder` - opening town burden, civic pressure, early mainline anchor.
- `town_scholar` - clue structure, records, monster/boss interpretation.
- `standard_bearer_frey` - south gate, defense pressure, battlefield memory.
- `blacksmith` - forge recovery, equipment pressure, craft identity.
- `herbalist` - survival, medicine, care, body cost of the crisis.
- `street_beggar` - rumor, underside of town, black-market bridge.
- `merchant`, `supply_captain`, `lamplighter_tavi`, `rumor_broker`,
  `black_market`, `casino_dealer`, `accountant_marlo`, `casino_owner`,
  `tower_warden` - system-linked cast for later routes.

Planned or late-use profiles such as `chapel_monk`, `neelu_apprentice`, and
`julian_archmage` should not be forced into the story until their chapter role is
defined.

## Story-To-System Adaptation

Do not write the final story directly into runtime data first.

Recommended workflow:

1. Draft or update this story bible.
2. Map accepted beats into `docs/CHAPTER_QUEST_FRAMEWORK.md` if level, boss, or
   reward placement changes.
3. Convert accepted beats into runtime data:
   - `QuestStories.js` for quest-facing story states.
   - `NPCDialogues.js` for actor-driven dialogue and multi-speaker scripts.
   - `TownPlaces.js` and `TownStateResolver.js` for visible town changes.
   - `WorldStories.js` and route plans for landmark clues and boss convergence.
   - Traveler handbook records for persistent memory.
4. Validate with route, town, story, and data consistency scripts.

## Asset And Scene Coverage Rules

Story expansion must account for art needs.

- If a chapter requires a new town state, landmark, dungeon, portrait, monster, or
  story object, list the asset need before implementation.
- Do not invent new story nouns that imply assets without recording the gap.
- Town scenes may need replacement as the story becomes more specific. The first
  pass can use existing scenes, but final polish should generate location images
  that match the approved chapter and town-state beats.
- The current `village_elder` portrait was too suited to a casino-owner identity.
  It has been preserved as a casino-owner candidate while a grounded village
  elder portrait is regenerated.

## Relationship To Other Documents

- Use `docs/NARRATIVE_WRITING_GUIDE.md` for prose rhythm, NPC voice, scene
  writing, and multi-speaker presentation.
- Use `docs/CHAPTER_QUEST_FRAMEWORK.md` for chapter level bands, quest placement,
  boss convergence, and reward/source planning.
- Use `docs/TOWN_REBUILD_CONVERGENCE.md` for town-state recovery, facility gates,
  and service wiring.
- Use `docs/ART_STYLE_GUIDE.md` and `docs/IMAGE_GENERATION_PROMPTS.md` for image
  style and prompt standards.
