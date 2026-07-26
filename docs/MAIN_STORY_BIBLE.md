# Main Story Bible

Last updated: 2026-07-27

## Purpose

This is the authoritative story-development document for the mainline plot,
long-form suspense, character arcs, character entry/exit planning, and story-to-
system adaptation.

Runtime JS/data remains the source of truth for implemented behavior. This file
exists so future writing and implementation passes do not drift into disconnected
quest errands, random NPC additions, or unplanned lore.

The detailed character files under `docs/characters/` remain the source dossiers
used while building the cast. Once an accepted fact is compiled into the master
character register in this document, this file becomes the production-facing
reference for that fact. Future profile changes must be synchronized back into
the register instead of creating two competing versions of the same character.

The intended end state is one master screenplay that a future writer or agent can
follow from beginning to end. Character dossiers remain useful for audit and
development history, but downstream chapter writing should not need to reconstruct
canon by comparing many files.

## Authority And Review State

Use the following order whenever two sections appear to disagree:

1. The accepted causal timeline, master character register, and detailed
   66-scene screenplay are the production-facing story authority.
2. The seven-chapter spine, placement tables, and character-flow matrices are
   summaries. They must be corrected when they disagree with the detailed
   screenplay; they never override it.
3. Sections explicitly labeled archived, proposal, review history, or `V0`
   preserve design reasoning only. They are not alternate canon.
4. Runtime data describes currently shipped behavior. A disagreement between
   runtime and the accepted screenplay is an implementation defect to resolve in
   the existing owner file, not permission to create a second story path.

The screenplay is now the production baseline undergoing strict editorial
review. Review may rewrite prose, staging, objective flow, or an existing scene's
task structure. It must revise and recompile the current scene and quest owners
instead of adding parallel compatibility records.

Keep:

- The wounded frontier-town premise.
- Route-driven exploration, fog, return-route pressure, watchposts, and boss
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
only about repairing a broken town. The town, roads, watchposts, and services
are important play spaces, but the main story is a dark fantasy two-pass novel
structure built around misunderstanding, sacrifice, and understanding.

Core experience:

- First run: the player is an outsider who experiences a complete heroic
  adventure, defeats the final boss, and receives a false victory. The intended
  emotion is confusion, emptiness, and the sense that winning still left
  something wrong.
- Second run: the player returns with the ability to read old lines, town
  states, NPC behavior, route clues, and item records differently. The intended
  emotion is shock, grief, gratitude, and the desire to protect people the player
  did not understand the first time.
- Base good end: the player cannot erase every wound or restore a perfect past.
  The point is to understand what was entrusted, save a limited number of people
  where possible, give meaning to irreversible sacrifices, and reach release
  instead of a hollow win. This ending uses shadow and glimmer only.

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
  such as "the south road is quiet today" can be ordinary mood in run one, then a
  route-state warning in run two after the road and seal context has been
  understood.
- The second run may unlock new interactions, hidden routes, NPC rescue windows,
  relationship records, and handbook interpretations, but those additions must
  grow from first-run evidence.
- The second run should make the player feel that the loop is not meaningless.
  NPCs were not waiting to die for the protagonist; they moved forward according
  to their own beliefs and passed on what they could.

Mainline, second-run external story, and DLC boundary:

- The second-run good ending belongs to the base campaign and must not require
  full light, Void, the tower, or an optional overcap Boss.
- Good end release comes from carrying many entrusted flames forward, not from
  returning everyone to the opening state.
- The first-run false ending unlocks optional external Boss stories throughout
  the second run. These routes add new geography, combat, equipment, and world
  history so the replay is not only identical encounters with corrected prose.
- Formal light/Void creature groups, affinities, materials, equipment, the
  radiant dungeon, Ash Baron, and the expedition supreme commander may appear
  in that optional base-game second-run layer. Later DLC extends the tower and
  post-reveal world but cannot retroactively become a missing requirement for
  the base true ending.

## Archived Working Canon V0 (Summary Only)

This section preserves the early rebuild summary. It is not a competing source
of canon. Use the accepted causal timeline, master character register, and
detailed screenplay when wording below is incomplete or outdated.

Note: the route-seal and broken-town material below remains useful scaffolding,
but any literal plot detail must be rechecked against `Accepted Emotional
Structure V1` before runtime rewrite.

Central mystery:

- The town did not merely survive an attack. It sits near the safest remaining
  approach to the mountain-side disaster zone, and its roads, watchposts, old
  camps, and records preserve traces of the old sealed perimeter.
- Roads, watchposts, old camps, boss traces, and dungeon routes are pieces of the
  same mystery. Exploration should make the player feel they are rebuilding the
  map of an approach that people no longer understand.
- The deeper question is not "which monster did this?" but "who closed the old
  mountain route, why did humans damage the sealed perimeter twenty years ago,
  and what did they wake by mistake?"

Final truth:

- The final pressure is `demon_lord_asariel`, but the route to the ending should
  reveal that brute force alone did not open the disaster. Fear, shortcuts,
  hidden bargains, and abandoned records weakened the town long before the final
  enemy appeared.
- The player wins by rebuilding combat strength and information strength at the
  same time: routes, town services, NPC trust, boss traces, equipment pressure,
  and dungeon preparation converge.
- `aurora_archon` and full light/Void creature groups are optional second-run
  external content, not mandatory mainline convergence requirements. DLC may
  continue their world after the first base-game reveal.

Story promise:

- Chapter 1 asks the player to prove which roads still breathe.
- Chapter 2 follows missing deliveries, medicine needs, and civic records, but
  does not restore the market before a complete trade road exists.
- Chapter 3 shows that shadow is not a random element; it remembers soldiers,
  debt, and old orders. Ending that command reopens the first complete road and
  lets the stranded caravan return.
- Chapter 4 begins with the returned caravan, then breaks its rear half apart
  under earthquakes caused by an awakened Titan moving through ancient
  leyline-regulation ruins.
- Chapter 5 follows the damage left after that movement and proves that the four
  elemental fronts are losing balance because the Demon King is still draining
  the mountain veins.
- Chapter 6 brings the dragon clan into focus. First run turns into war because
  the player lacks a usable alternate route; second run earns non-attack because
  current evidence and behavior show the player will leave the sealed line
  untouched.
- Chapter 7 closes the mountain-route mystery and tests whether the rebuilt town is
  strong enough to stand behind the player.

### Accepted First-Run Protagonist Premise

- Each governed region must send scheduled land ledgers, tax remittance, and
  courier correspondence to the kingdom. This frontier region misses repeated
  reporting cycles.
- The kingdom initially treats the silence as a route, bandit, weather, or local
  administration problem and sends one formally appointed royal frontier
  inspector rather than an army.
- The protagonist has field-survival and combat training because the office
  inspects unsafe roads and monster incidents. The protagonist is not a chosen
  hero and never needs to accept that title.
- A genuine high-tier enemy becomes the opening combat tutorial. Completing the
  tutorial actions leads to a fixed story defeat, destruction of the inspector's
  equipment, and Mia's rescue. The exact Boss identity and first-run motive
  remain the next first-run review question.
- The protagonist cannot return through the distorted mist and continues the
  original investigation. Every mandatory Boss removes an obstruction, secures
  evidence, or prevents the regional failure from worsening; killing the Demon
  King is the final conclusion of the investigation, not a sudden career change
  into a legendary hero.

### Protagonist Dramatic Contract V1

The protagonist remains visually open enough for player identification, but is
not emotionally blank. This contract owns the choices that connect all seven
chapters.

- **Public role:** a trained royal frontier inspector. They are accustomed to
  returning with a verified answer, surviving hostile roads, and paying for
  help received.
- **Core desire:** complete the assignment without making local people carry the
  danger that arrived with it.
- **Core fear:** return empty-handed after someone else was hurt, or admit a need
  for help and make another person responsible for their survival.
- **False belief:** if evidence is accurate and the protagonist is personally
  strong enough to act on it, other people can be kept outside the cost.
- **Values:** verifiable facts, repayment, practical competence, and bringing
  people home.
- **Inner contradiction:** the protagonist wants to protect people, but hiding
  injuries, treating care as debt, and taking responsibility away from others
  prevents those people from choosing and preparing together.
- **Speech posture:** concise, observant, practical, and willing to ask about
  price, route, proof, or immediate risk. The protagonist does not summarize the
  theme, praise another character's arc, or speak with inherited omniscience.
  Emotional admission first appears as a concrete request: stay, check this,
  come with me, tell me what you need, or wait here until I return.

First-run movement:

1. **Chapters 1-2:** the protagonist treats Mia's care as a debt and the town as
   an investigation site, then gradually sees that evidence can repair ordinary
   life. They still expect a correct report and personal competence to be enough.
2. **Chapter 3:** the protagonist conceals a shadow wound to avoid delaying the
   route. Mia's anger makes the practical flaw explicit: collapsing alone would
   send everyone back after them. The protagonist begins reporting injury before
   departure, but still understands cooperation mainly as preparation for their
   own action.
3. **Chapter 4:** the Gray Ridge crossing proves that the protagonist cannot
   occupy the front flag, rear lamp, and civilian mechanism at once. Frey's death
   is not caused by cowardice or player delay; it exposes the limit of a plan
   that still depends on one person replacing every missing position.
4. **Chapter 5:** Mia saves the protagonist and dies because the entire known
   procedure protects the patient while nobody has yet defined protection for
   the operator. The protagonist survives through other people's work and can no
   longer describe that cost as a private debt.
5. **Chapter 6:** grief, visible pressure moving toward town, and the lack of an
   alternate route make the protagonist repeat the expedition's armed logic.
   Crossing the dragon line is rational under incomplete knowledge, but it is
   also the last expression of the false belief that one sufficiently capable
   person must force an answer.
6. **Chapter 7:** the protagonist destroys a genuine combat body and returns
   with a verifiable military victory. They refuse to let the official record
   call the region healed when the ground, missing people, and absent
   containment contradict that claim. The first run therefore closes a complete
   arc: personal strength solved the visible threat and proved its own limit.

Second-run movement:

1. Memory does not make the protagonist omniscient. It makes ordinary care,
   tool sounds, route habits, and incomplete records impossible to dismiss.
2. The protagonist asks people what they need before assigning them a role,
   reports injuries before collapse, and changes preparation rather than merely
   warning people of future deaths.
3. Frey, Tavi, Mia, Eli, the elder, and Ailo are not saved by obedience. Each
   receives enough evidence or practical support to make a different choice of
   their own.
4. At the dragon line, the protagonist gives up the direct broad road, places
   weapon and evidence outside the boundary, and accepts retreat without
   permission or praise.
5. The harder narrow route and three-anchor preparation replace the simple march
   through the dragons. The protagonist reaches the ending through distributed
   work and strikes the final blow without claiming sole ownership of the
   victory.
6. On returning, the protagonist visits people without needing injury,
   equipment, a report, or a reward as an excuse. This is the visible endpoint,
   not a spoken statement that they have learned to rely on others.

### Rescue Cost And Continuing-Life Contract

The second run does not cancel the first run's tragedies or restore everyone to
their opening state. A rescue exchanges irreversible death for a continuing
responsibility:

| Route | What changes the event | Continuing cost after survival |
| --- | --- | --- |
| 芙蕾 / 塔維 | Tavi measures and holds the rear light; Frey remains at the front instead of replacing him. | Tavi must keep taking visible duty while afraid. Frey must stop filling every missing position herself and share authority over the route. Their old argument continues because survival does not resolve it. |
| Mia / Eli / blacksmith | The current-run record keeps unknown scope visible; the ratchet is removed and the operator receives protection. | Mia must admit that her hands and life belong inside the treatment plan. Eli publishes the limits of his own earlier summary. The blacksmith accepts that asking another craft what it needs is part of making a tool. |
| Village elder | Eli and the protagonist recognize his preparations before he leaves; he hands over the shard alive. | The elder must place the expedition's damage into the public record, surrender the right to settle it alone, and continue governing while the dragon clan still despises humans. |
| Dragon clan | The protagonist stops outside the line, accepts non-passage, and follows the harder human route. | The dragons neither forgive nor assist humanity. The protagonist loses the broad road and must complete the narrow-route and execution-anchor preparation. |
| 艾洛 | The protagonist recognizes the attempted theft and accompanies him. | Recovered memory confirms that Neelu died. Ailo must release the mistaken scraps, choose whether to keep living, and later leave town by his own decision rather than remain as a rewarded resident. |
| 洛恩 | The protagonist interrupts collection and later exposes the weighted guest set. | Lorne publicly admits his participation, loses private authority, and remains under town oversight while repairing accounts he helped corrupt. |

These costs must appear through later work, changed relationships, restricted
authority, or difficult action. Do not explain them in a concluding speech.

## Accepted Omniscient Causal Timeline V1

This is the accepted causal foundation for the master screenplay. Exact years,
scene wording, final display names, and presentation details can still be
revised, but future chapter writing must preserve the cause-and-effect chain
unless the user explicitly changes it. The timeline adds no new faction,
character, monster, item, or location. It uses the Demon King, dragon clan,
`elder_dragon`, Echo Whistle, `seal_scar_shard`, the existing town, existing
chapter bosses, and accepted character routes.

### Causal Laws

These rules keep later chapters from inventing a different explanation for the
same disaster.

1. Ancient ruins beneath the mountain predate the Demon King. They regulate
   natural leyline pressure and keep four ordinary elemental flows from colliding.
   Titans are an ancient people tied to that deep terrain, not machines,
   guardians built by humans, or parts of the road.
2. The dragon seal restrains the Demon King's body and concentrates the disaster
   near the mountain. It does not perfectly stop curse seepage.
3. The curse follows existing physical and human channels: roots, water, soil,
   ruins, corpses, abandoned orders, roads, trade, fear, and violence. It twists
   what is already present instead of creating every evil in the story.
4. The Demon King's recovery drains the natural vein beneath the old ruins.
   This causes pressure loss, earthquakes, ruin collapse, and the Ancient
   Titan's awakening. The Titan moves toward the thief of that energy by instinct;
   it does not wake to punish humanity.
5. The dragon clan protects its territory and maintains containment. It does not
   protect humanity out of affection, and it does not explain itself patiently to
   armed trespassers.
6. Most chapter bosses are real dangers and may still need to be defeated. The
   first-run tragedy is not caused by fighting every monster; the decisive error
   is destroying the living dragon authority that is still holding the damaged
   containment together.
7. The Echo Whistle is an ordinary mountain-route tool. The
   `seal_scar_shard` is evidence of human damage. Neither object is a magical
   answer by itself.
8. The Demon King's existence at the mountain becomes common knowledge over
   time. What people do not understand is that the scattered mist, mutations,
   dead routes, and elemental failures all descend from the same fall and damaged
   containment.
9. After humans create the seal scar, the dragon clan can hold the remaining line
   from outside but cannot fully restore it while the Demon King continues
   pressing from within. If `elder_dragon` leaves the containment position to
   enter the core, the broad approaches fail first. This is why the dragons do
   not simply finish the Demon King themselves.

### Global Timeline

| Time | Omniscient Event | What People Know Then | Causal Result |
| --- | --- | --- | --- |
| Before the fall | Ancient ruins regulate the mountain's natural veins and keep fire, ice, thunder, and poison-bearing flows apart. Titans are one of the old peoples associated with that deep terrain. Ordinary mountain villagers, including 艾洛 and 妮露, use narrow local paths and the Echo Whistle. The dragon clan occupies and guards the greater mountain territory. | Humans know the ruins are old and the dragons are territorial. They use the roads and mines without understanding the complete regulation network. | The mountain has a stable elemental circulation, broad approaches controlled by dragons, and narrow human paths understood by locals. |
| More than twenty years ago | The Demon King attempts to seize the mountain convergence so his power can recover and spread through the region. The dragon clan attacks because this would destroy its territory and make the mountain uninhabitable. | Humans nearby see signs of an enormous conflict but do not understand either side's purpose. | Dragon and Demon King enter a battle neither can win cleanly. The dragons are not fighting for humanity, but their territorial defense incidentally prevents immediate expansion. |
| The fall | `elder_dragon` and the dragon clan wound the Demon King badly enough to throw him from the high mountain route. The Demon King falls near the mountain-side village. The dragon side is also severely wounded and cannot finish the kill. | Surrounding settlements know a great enemy and dragons fought near the mountain. They do not yet understand where the curse begins or whether the Demon King survived. | Physical impact, monsters, and the first curse pressure destroy the mountain village. The Demon King enters sleep or partial dormancy instead of dying. |
| 艾洛 and 妮露's escape | The village is overwhelmed. 妮露 pushes 艾洛 down a valley or mountain drop so he survives. She dies; he suffers head trauma, grief, and fragmented memory. | No one outside receives a complete account. 艾洛 cannot tell one. | The only surviving human route knowledge remains inside a person nobody can understand. His promise, the flowers, the road, and the whistle survive as broken fragments. |
| Emergency containment | The wounded dragon clan cannot kill the dormant Demon King. It closes the broad approaches and binds the worst pressure inside the mountain perimeter. `elder_dragon` remains the living authority that maintains and judges passage at the damaged line. | Humans experience lost roads, dragon hostility, and an unreachable mountain. They interpret these as territorial blockade, disaster, or taboo. | The Demon King's body is contained. The curse still leaks slowly through roots, water, soil, ruins, dead bodies, and abandoned routes. The narrow local Echo Whistle path falls out of use because its villagers are dead. |
| The first years after the fall | Nearby villages lose trade, patrols, and contact in uneven waves. Monster behavior changes gradually rather than all at once. | People know the mountain is dangerous and eventually accept that the Demon King remains there. They still treat each failed road, poisoned field, or mutated monster as a local problem. | The region responds piecemeal. No one sees one cause, so no one builds one solution. |
| Twenty years ago: the joint expedition | The present village elder, then a young militia captain, helps nearby villages form a joint force. Its goal is to repel monsters, reopen routes, recover contact, and stop the spreading regional collapse. It is not initially a legendary Demon King assault. | The expedition knows a Demon King is associated with the mountain, but it does not know the seal structure, the dragon clan's containment role, or how the curse travels. | The expedition is strong by ordinary human standards: numbers, discipline, local weapons, supply, and courage let it clear outer monsters and several lost roads. Early victories create dangerous confidence. |
| The expedition reaches the perimeter | Following a route that appears blocked rather than sealed, the force finds the dragon-closed outer line. It interprets the barrier and dragon warnings as another hostile obstruction between the villages and the source of their suffering. | The elder and the force believe they must break through before the region dies. They do not possess Echo Whistle route knowledge, and the mountain villagers who knew the alternate path are gone. | Humans damage the sealed perimeter with ordinary force and tools. A fragment becomes the `seal_scar_shard`. The breach releases a violent pressure surge from inside. |
| The one-sided slaughter | In this proposal, `elder_dragon` and the dragon defenders counterattack while curse pressure and mutated creatures surge through the damaged line. The human force has enough strength to reach the perimeter but no strength that matters against a dragon authority and the released disaster together. | Survivors see heat, shadow, collapse, monsters, and broken formation. They cannot reconstruct a clean account. The dragon clan sees only armed humans repeating damage at a line they never understood. | The expedition is destroyed. The elder survives by chance because retreat, terrain collapse, and separation leave him outside the killing center; he is not spared. He returns with the shard but without the knowledge needed to interpret it. |
| The following twenty years | The dragon clan holds what remains of the perimeter, but the human-made scar widens under recurring pressure. The dormant Demon King slowly recovers by drawing from the mountain vein. The town loses young people, services, supply, and confidence. | The elder knows courage was annihilated but not why the route was sealed. 伊萊 holds incomplete records. Mia grows up inside the expedition's family damage. Younger characters inherit fear without context. | Broken routes become the town's daily reality. Forest, dead, shadow, stone, ash, and elements begin showing different symptoms of the same pressure. Deep pressure loss remains too slow to identify until the present surge. |
| Present surge | The Demon King's recovering body and the widening seal scar reach a threshold. Mutations and route failures become frequent enough for an outside guild to issue rescue or reconnaissance work. | The town knows the situation is worsening but still lacks one causal map. | The protagonist arrives wounded near the village and is saved by Mia in her private workroom. The playable story begins. |

### Chapter Causality

The chapters move from symptoms to source. Boss identities remain the current
working set until the user revises them.

| Chapter | Visible Crisis | Hidden Cause | Why The Boss Matters | Causal Output |
| ---: | --- | --- | --- | --- |
| 1 | South-gate routes, forest behavior, fog, and weak equipment make even nearby travel unreliable. | Curse pressure has reached roots and old route wounds. The forest is reacting to pressure moving through the land. | `forest_guardian` is a dangerous responder at the first convergence; `ambush_mantis` teaches that monster bodies and behavior carry route evidence. | Defeating the threat makes nearby roads readable and proves that route failure and monster behavior are connected. It does not reveal the Demon King yet. |
| 2 | Missing deliveries, medicine needs, old evacuation paths, and the dead stop behaving like separate civic problems. | Curse leakage has reached abandoned routes, corpses, and records left incomplete after earlier disasters. | `lich` concentrates the chapter's dead-route pressure. Its exact personal identity can be written later without changing the global cause. | The town can authorize medicine and identify missing carriers, but the market stays closed because no complete trade road exists. 伊萊 learns that an accurate old document may still be lethally outdated. |
| 3 | Shadow soldiers and an unfinished command block the first complete trade road. Casino temptation, black-market shortcuts, and debt become useful and dangerous around the same scarcity. | The curse can preserve fear, violence, and unfinished orders as shadow. Human exploitation such as 維斯珀's casino is not caused by the Demon King; it grows because the crisis creates desperate people. | `shadow_commander` proves shadow is an echo of command and conflict, not a random new element. | Ending Kaedren's command lets the stranded caravan return. Familiar market traders and a few outside merchants reopen the public market; the caravan's rear half remains on the road when the first coordinated quake begins. |
| 4 | The returned caravan's rear half is trapped at Gray Ridge while earthquakes break retaining walls, roads, and an ancient ruin line. | The Demon King is drawing energy from the mountain vein. The pressure loss wakes an Ancient Titan, which moves toward the drain by instinct and causes the quakes through its scale. | `ancient_titan` is the main convergence. The player blocks it because its path will crush the caravan and destroy the remaining road, not because it serves the Demon King. `ash_baron` remains optional second-run external content. | The caravan's named and functional NPCs can return, while background drivers and guards may be lost. First run loses 芙蕾; second run changes this through 塔維. The collapsed ruins expose the four regulated flows and open Chapter 5. |
| 5 | Fire, ice, thunder, poison, and forge preparation stop looking like separate regional hazards. The old expedition record becomes readable. | The Titan's defeat ends the immediate quakes but not the Demon King's drain. Damage to the ancient regulation network lets four natural flows collide around one failing convergence. | `elemental_lord` is the new unstable body formed by that collision, not an ancient ruler or Demon general. | The four-front evidence, 伊萊's records, the elder's memory, and the `seal_scar_shard` finally align. The Echo Whistle enters the mainline as an unidentified mountain tool before the dragon approach. |
| 6 | The broad mountain approach ends at the dragon-held perimeter. | The player has reached the living containment authority, not another servant of the Demon King. | `elder_dragon` is both Boss and dialogue actor. It warns the player from the existing Boss presentation. | First run has no decoded alternate route and crosses under immediate regional pressure. Second run leaves the shard, weapon, and player outside the line, demonstrates an outside echo route, and earns only non-attack while the dragon keeps holding the seal. |
| 7 | The obvious road still cannot reach the fall site. The lost local route and the Demon King's body become the final problem. | Dragon containment closed broad approaches; the only non-destructive human approach survived in 艾洛's fragmented memory. | The Echo Whistle route leads to the fall site. `demon_lord_asariel` remains the internal runtime Boss id; the accepted display name is `魔王赫爾薩恩 / Helsarn`. | The Demon King is a genuine threat in both runs and must still be defeated. The ending changes according to whether the dragon containment and key characters survived the approach. |

### Echo Whistle Placement Proposal

To avoid the current Chapter 6 logic gap, the Echo Whistle should enter the
mainline at the end of Chapter 5 or the opening of Chapter 6, before the player
crosses the dragon perimeter.

First run:

1. The player reaches a mountain approach with no usable route.
2. A fixed existing-route event or battle yields the Echo Whistle.
3. The player carries both the whistle and, after the elder's death, the
   `seal_scar_shard`, but understands neither as a complete non-war proof.
4. `elder_dragon` orders the armed human to stop. The only route the player can
   currently read ends at that line, the same pressure rhythm is already moving
   back toward town, and the dragon offers retreat but no human solution. The
   player crosses with the weapon raised and the Boss battle begins.
5. After the dragon route, 艾洛 brushes past, steals the whistle, opens the old
   local road, disappears, and dies off-screen.

Second run:

1. Run memory makes the player recognize the whistle, 艾洛's intention, and the
   shard before the same fatal decisions occur.
2. The player stops the elder and receives the shard from him alive.
3. At the perimeter, the player stops before crossing, places the weapon and
   shard on the ground outside the line, and demonstrates the whistle's lateral
   echo without claiming to know the still-missing turn sequence.
4. `elder_dragon` does not trust the human or open a road. It observes three
   current facts: the old scar fragment remains outside the breach, the weapon
   is down, and the player does not cross even when the pressure rises. The
   dragon therefore has no territorial reason to attack while the player
   withdraws toward the outside echo. It remains at the broad containment.
5. The player later accompanies 艾洛 along the old road instead of allowing the
   theft-and-death sequence to repeat.

### First-Run Causal Ending

1. The player follows real evidence and defeats real threats. The adventure is
   not fake and the player is not foolish.
2. Incomplete context causes the player to repeat the expedition's armed push at
   the dragon perimeter.
3. `elder_dragon` and the remaining mountain seal-keeping clan are killed. The
   living authority maintaining the damaged containment is lost; this erases the
   local clan, not every dragon species elsewhere in the world.
4. 艾洛 opens the old road alone and dies unseen. The player reaches the fall
   site and defeats the Demon King's physical body.
5. The source is defeated, but containment has collapsed, curse residue remains
   embedded in the region, and the town has lost people whose tragedies were not
   understood in time.
6. The ending is a real military victory and a hollow human victory. This is why
   the first run may end successfully without being the complete ending.

### Second-Run Causal Ending

1. The player does not gain omniscience for free. First-run memory makes earlier
   evidence legible, while character routes still need to be completed.
2. 塔維 acts before 芙蕾's sacrifice. Mia's shard procedure is prepared for.
   The elder is stopped before his fatal departure. 艾洛 is accompanied.
3. The player reaches `elder_dragon` with acknowledged human damage, evidence of
   an outside route, and a non-hostile action. The dragon does not grant passage;
   it withholds attack because the player leaves its line untouched. The dragon
   authority survives and continues containment.
4. The player reaches the same genuine final enemy through the old human route
   and defeats the Demon King's physical body.
5. Because the living containment remains, the remaining curse pressure is held
   instead of bursting through the damaged broad approaches. Recovery can begin
   without pretending the past was restored.
6. The better ending comes from understanding cause, preserving people, and
   choosing the right route, not from simply gaining higher combat power.

### Open Detail Knobs

These details remain adjustable without changing the accepted causal spine:

- The exact emphasis of the Demon King's mountain objective: immediate recovery,
  long-term expansion, passage, or deliberate regional corruption. The accepted
  rule is that controlling the convergence would let its power recover and
  spread.
- Whether the original dragon battle happened only a few years before the
  expedition or much earlier. This draft uses "more than twenty years ago" and
  keeps the exact number open.
- Whether `elder_dragon` personally caused most expedition deaths or led a wider
  dragon counterattack. The accepted rule is that the elder dragon, dragon
  defense, and released curse pressure caused the one-sided destruction.
- `demon_lord_asariel` remains a legacy internal runtime id only. The accepted
  player-facing name is `魔王赫爾薩恩 / Helsarn`.
- The exact second-run memory tool. This timeline needs remembered meaning, but it
  does not name or design a new item.

### Resource Impact

- New NPCs: none.
- New monsters or bosses: none.
- New story items: none; uses Echo Whistle and `seal_scar_shard`.
- New portrait: none; `elder_dragon` reuses existing Boss art for dialogue.
- New location asset: none at this stage. Existing mountain, route, town, and
  Boss scenes can carry the structural draft until chapter scene coverage is
  approved.

## Accepted Screenplay Foundation V1

Status: `production_baseline_pending_strict_editorial_review`. This foundation
defines the accepted causal and chapter structure. Strict review may revise its
existing scenes and task flow, but must not preserve rejected material through a
parallel runtime path.

### Review Boundaries

- Both runs remain linear in their main result. The first run cannot prevent its
  tragedies. The second run cannot intentionally choose the same bad ending.
- NPCs reset completely at the beginning of the second run. They do not remember
  the first run and should not trust unexplained future knowledge.
- The protagonist retains first-run meaning only through achievement flags.
  There is no warehouse inheritance, retained key-item category, or mixed
  persistence rule.
- Every other character, including the Demon King and dragon clan, resets to the
  first-run starting state. `我記住你了，凡人。` belongs to the surviving
  Demon King in the first-run timeline, not to a cross-run memory exception.
- Existing mandatory bosses are reused for the second-run execution route. New
  external Boss identities remain optional and cannot become execution anchors.
- The mandatory campaign exposes only shadow and glimmer as playable
  supernatural affinity tiers. Formal light and Void creature groups,
  materials, equipment, and combat routes belong to optional second-run
  external stories.
- Vesper's collector may appear as an unnamed contract anomaly in the base story,
  but its Void identity is not explained during the mandatory casino route. An
  optional second-run external route may reveal it after Vesper's punishment.
- The five unresolved service characters (`supply_captain`, `rumor_broker`,
  `old_miner_bran`, `tinker`, and `accountant_marlo`) are not placed in this
  screenplay. They remain reserve candidates until a character-centered side
  story needs one. `apothecary_assistant` is obsolete and owns no continuity
  requirement.

### Two-Run Persistence Contract

Cross-run persistence is achievement-only. This keeps the rule consistent and
avoids future objects appearing physically in front of reset NPCs.

#### Achievement memory

The first ending reveals a set of previously hidden achievements. They are
guaranteed by the linear first run and become second-run script conditions.

| Proposed Achievement | First-Run Cause | Second-Run Function |
| --- | --- | --- |
| `旗沒有回來` | Frey dies holding the patrol standard. | Unlocks concrete intervention lines and the mandatory Tavi preparation scene before the same route crisis. |
| `醒來時，水已經涼了` | Mia removes the Elemental Lord shard and saves the protagonist, but the fixed-pressure forceps crush the extracted shard and the four-element burst kills her. | Preserves the ratchet-click memory that opens current-run material tests and a pressure-free extraction procedure. |
| `封痕前的老人` | The elder dies alone at the dragon perimeter. | Unlocks the confrontation that stops his departure and makes him give the shard alive. |
| `莊家離席` | Vesper escapes after his cheating is exposed. | Makes the player recognize the casino settlement procedure and identify the current run's Loaded Dice before settlement. |
| `先行的回聲` | Ailo steals the whistle, opens the road, disappears, and dies unseen. | Lets the protagonist recognize his intention and approach him before the theft. |
| `未竟的弒王` | The Demon King's combat body is defeated but survives the ending. | Activates the additional true-kill mainline and the three execution-material routes. |

These achievements are not optional build rewards. They are story memory flags,
cannot be discarded, and may appear in the first-run closing recap only after
the corresponding fate has occurred. The second run reads them directly to open
mandatory intervention beats.

No physical item crosses the reset. The Echo Whistle, `seal_scar_shard`, Loaded
Dice, Life Seed, Ancient Rune, and any flag fitting must all be found, earned, or
recognized again inside the second run. `藥師手記` is relationship-record text,
not an inventory object. Achievement memory changes when and how the protagonist
acts; it does not replace the current timeline's object.

### Second-Run Dialogue Contract

Second-run dialogue uses memory as intervention, not omniscient exposition.

1. The scene begins from the same NPC knowledge and emotional state as the first
   run.
2. A remembered gesture, phrase, route mark, or object unlocks a `memory`
   intervention beat.
3. The protagonist speaks only about a concrete action that can be taken now.
   They do not announce that the NPC died in another run.
4. The NPC may distrust the protagonist. Progress requires evidence,
   preparation, or changed behavior, not instant belief.
5. The intervention is part of the second-run mainline, not a fake choice. If the
   player initially closes the dialogue, the objective remains there until the
   correction is performed.
6. Ordinary flavor choices may remain, but they do not create extra endings.

Proposed intervention anchors:

| Route | Concrete Intervention Direction |
| --- | --- |
| Tavi and Frey | The protagonist holds the front marker while Tavi physically takes the measuring tape to the rear lamp; Frey takes over the unfinished front repair instead of explaining courage to him. |
| Mia and 伊萊 | The protagonist points to the four separated source pages and asks who has tested a converged sample. Eli must answer the scope question before anyone signs the summary. |
| Elder | Eli identifies the missing food and cleared shard entry before dawn. The protagonist waits at the closed gate and states exactly where they will stop and what they will do when challenged. |
| Vesper and dealer | Lorne marks the current guest dice in front of witnesses. The protagonist invokes the existing exchange clause and makes Vesper choose whether to sit in the guest position. |
| Ailo | The protagonist grips the whistle before the repeated brush-past theft can occur, asks whether Ailo knows the blind turns, and offers the whistle only together with accompaniment. |

The Demon King does not remember the first run. The second battle may feel
different because the protagonist acts differently, not because the enemy
acknowledges a time loop.

### Accepted Runtime Viewpoint Contract V1

The screenplay plan may track every cause, but runtime scenes use the closed
viewpoint vocabulary in `docs/NARRATIVE_WRITING_GUIDE.md`:

- `protagonist_limited`
- `character_limited:<id>`
- `split_limited`
- `witnessed_memory`
- `audience_montage`

Default playable narration is protagonist-limited and will use first-person `我`
in the final runtime prose. The current second-person `你` is review-draft
staging debt, not the accepted final narrative voice.

A first-run cutaway may let the audience witness why a character walks toward a
fixed tragedy even when the protagonist is absent or impaired. It may reveal
that character's motive and immediate perception only. It cannot reveal the
second-run correction, hidden cosmology, or information the character does not
know. Audience-only information creates no protagonist objective, handbook fact,
dialogue option, or route state until equivalent current-run evidence is found.

Required first-run tragedy coverage:

| Fate | Runtime Viewpoint Treatment | First-Run Audience Gain | Still Reserved For Second Run |
| --- | --- | --- | --- |
| Frey | `split_limited`: protagonist across the raised span, then one brief Frey close-up. | Why she chooses to keep the ordinary flag visible after rescue becomes impossible. | Tavi's measured rear-light intervention and shared survival. |
| Mia | `split_limited`: protagonist's broken hearing gives way to Mia's operation view. | Her questions, successful extraction, relief, and the unforeseeable post-extraction contraction. | Pressure-free preparation and operator protection. |
| Village elder | `protagonist_limited`: the protagonist follows his boot prints and reconstructs the failed replacement from his body, sheathed weapon, bloodied fragment, and opposing burn directions. His private departure and death are never shown. | Observable proof that he approached the scar without drawing his weapon and tried to return the fragment; his exact private thoughts remain unknown. | Dragon containment purpose, complete non-attack proof, and the living handoff. |
| Ailo | `split_limited`: route traces cut ahead to his solitary climb without showing a corpse. | He is following the whistle and an unfinished promise, not stealing for profit. | Neelu's identity, marriage, fall, complete promise, and the accompanied route. |

The first-run ending may replay sensory fragments from these scenes, but it does
not convert their audience-only thoughts into protagonist knowledge retroactively.

### Proposed First-Run Fate Order

| Order | Chapter | Fixed Event | Immediate Consequence | Second-Run Correction |
| ---: | ---: | --- | --- | --- |
| 1 | 4 | Tavi freezes at the unmeasured rear route marker during the Ancient Titan evacuation. The protagonist is locked at the central civilian crossing; Frey returns to keep the flag visible and dies as the span rises between them. | The South Gate flag is returned without her. Tavi becomes quiet and mechanically functional; the blacksmith's humor first breaks; the elder identifies a route that depended on one person replacing another. | During the Chapter 3 night inspection, make Tavi personally measure the far lamp while Frey and the protagonist take over the work he normally uses as a reason to remain at the front. The completed wind guard lets him light the rear marker before the ground splits. |
| 2 | 5 | The Elemental Lord dies in a four-element burst. An intact shard penetrates and disables the protagonist. Mia removes it in her herb workroom, but the standard forceps crush the extracted shard and its point-blank release kills her. | The protagonist survives; Mia's workroom remains physically present but loses all later research and relationship events. Beside the broken forceps is 伊萊's handling summary: four accurate separated-sample records compressed into the unscoped line `標準二格固定可安全處理`. | Achievement memory recognizes the forceps ratchet. 伊萊 reopens the current-run source pages, refuses to apply separated-sample safety to a converged object, and joins pressure-free tests so Mia survives the same surgery. |
| 3 | 5-to-6 bridge | The elder recognizes the old perimeter pattern, takes the scar shard, and leaves before dawn. At the seal scar he is caught between a curse surge and dragon sealing fire. | The player finds his body and the shard at the perimeter and interprets the dragon as his killer. | Use the expedition list and achievement memory to stop him at the town gate; he gives the shard alive and remains in town. |
| 4 | 6 | The player interrupts the dealer's rigged settlement throw and saves him, but Vesper tears open a contract escape and flees. | The dealer hands over the Loaded Dice and admits his part in the rigged house. The casino remains poisoned by an absent owner. | Remember the die's abnormal weight, identify the current run's guest set before settlement, turn the dealer, and force Vesper into the guest position under his own rule. |
| 5 | 6 | The player crosses the dragon warning line after finding the elder's body. The dragon clan is treated as the final obstruction and is erased by the protagonist. | Living containment collapses. The mountain opens by force, but leaked curse pressure accelerates. | Arrive with the living elder's shard, Ailo and the whistle's route meaning, and a visibly non-hostile stop. No dragon battle occurs. |
| 6 | 6-to-7 bridge | After the dragon battle, Ailo brushes past the protagonist, steals the Echo Whistle, opens the old local road, and disappears. | The route opens without explanation. Ailo dies unseen near the mountain; no corpse is shown. | Approach Ailo immediately after obtaining the whistle and accompany him through the old route. |
| 7 | 7 | The protagonist destroys the Demon King's combat body without execution anchors. | The town receives a victory, but the Demon King remains barely alive and the curse no longer has dragon containment. | Complete the three counter-Boss routes, preserve the dragon, and execute every remaining survival layer. |

#### Frey's fixed first-run scene

- Working location: the Gray Ridge stone causeway, an old constructed route
  shifting under the Ancient Titan's movement and ash-heavy wind.
- Immediate objective: evacuate trapped travelers and keep two route markers
  visible while the protagonist holds a central civilian footbridge open.
- Chapter 3 has already shown Tavi maintaining the front lamp, avoiding the
  fogged rear marker, and Frey covering the unfinished work. It also establishes
  why the first-run wind guard cannot be built without the missing measurements.
  Their childhood memory may deepen the relationship in optional material, but
  it does not explain the rescue condition or interrupt the mainline setup.
- Tavi is assigned the rear lamp. A violent ground break and the sound of people
  below make his body lock.
- Titan movement separates front flag, rear lamp, and protagonist into three
  heights. Leaving the central footbridge before the last evacuee crosses would
  drop civilians, so the protagonist cannot replace either marker.
- Frey realizes the rear group cannot see the return direction. She goes back,
  fixes the patrol flag into a cracked stone joint, and remains beside it until
  the last silhouettes cross.
- The protagonist moves only after the last person crosses. The Titan's next
  movement raises the span between them, so the protagonist sees her last moment
  with the flag but cannot reach her.
- This is an approved future `storyCg` candidate. The CG should show an ordinary
  patrol flag made enormous by circumstance, not turn Frey into a holy warrior.

#### Mia's fixed first-run scene

- The Elemental Lord dies in a four-element burst. One intact shard penetrates
  the protagonist between the ribs near a major blood vessel and disables them
  through cycling fire, ice, thunder, and poison pressure.
- The protagonist is carried directly to Mia's private herb workroom. This
  is the same room where they woke after the opening injury; it is not a clinic,
  shop, or market facility.
- Mia alone has the wound-treatment experience to operate. The blacksmith
  assists with the unfamiliar object and the known-safe embedded-object forceps.
- Before departure, 伊萊 compresses four accurate separated-residue records into
  one field summary. The source pages prove only that each residue remained
  intact under the standard forceps at ratchet setting two, but the practical
  summary says `標準二格固定可安全處理` without keeping that scope on the same
  line. It is not a lie or a reckless guess; it is an ordinary useful shortcut
  that gives everyone one less reason to question an unprecedented object.
- The protagonist remains sedated but retains broken hearing. Mia removes
  the intact shard, confirms the returning pulse, and says:
  `好了。你回來了。`
- The shard contracts after leaving the body. The forceps' fixed ratchet applies
  too much pressure and crushes it in Mia's grasp. The point-blank four-
  element release kills her immediately.
- This is the first known combined shard. The death is not a journey injury,
  delayed untreated wound, magical life exchange, or incompetence by Mia or
  the blacksmith. 伊萊 is not the sole culprit, but his unscoped summary is a
  real part of the causal chain and directly wounds his belief in useful paper.
- The second run recognizes the ratchet click. 伊萊 returns to the four source
  pages, states that they prove only separated-residue safety, and refuses to
  sign the old conclusion for a converged object. Current-run tests remove fixed
  pressure, support the shard with spider silk, and receive it in purified slime
  gel. The same surgery ends with Mia alive.

#### Elder's fixed first-run scene

- The expedition list and Elemental Lord evidence make the elder recognize the
  same perimeter geometry he helped damage twenty years earlier.
- He leaves before dawn because he believes the protagonist will follow if asked
  and that one old survivor should pay the debt alone.
- The `seal_scar_shard` is a wedge of the old boundary stone he carried back
  from the failed expedition. Human chisel strikes remain on one face, dragon
  fire vitrification on the other, and its broken edge still matches the missing
  section at the scar. It is evidence, not a dragon scale, key, or magic pass.
- He reaches the scar without the Echo Whistle route meaning. A curse surge opens
  as he tries to press the old fragment back into the break. `elder_dragon`
  seals the same surge with fire. Pressure from within and sealing fire from
  outside cross through him; he is killed as an incidental armed human touching
  the line, not personally judged, executed, or forgiven.
- The player's first view is the elder's body, scorched ground, dragon heat, and
  the `seal_scar_shard` beside the matching break. The scene proves that dragon
  fire struck him but does not yet prove whether the fire targeted him or the
  breach. Combined with an undecoded whistle, an accelerating pressure pulse,
  and the dragon's refusal to care about the town, this supplies an emotionally
  and strategically credible but incomplete reason to cross.

### Proposed Boss Story Identities

| Boss | Proposed Identity And Cause | Story Behavior | Key Output |
| --- | --- | --- | --- |
| `forest_guardian` | A real ancient forest defender driven into indiscriminate defense by curse pressure moving through roots and stripped core bark. | Attacks routes as wounds in its territory; it is not a Demon King lieutenant. | First proof that monster behavior and broken roads share a cause. |
| `lich` | Accepted record name: `守名者赫恩 / Hern`. Former evacuation mortuary registrar who bound name tags and unburied dead to one reliquary when the old road collapsed. Curse pressure preserved the refusal until care became possession. His crown-like frame, chains, and ornate outer shell are accumulated reliquary hardware, funeral tags, and dead belongings, not evidence that he was royalty in life. | Recites incomplete names, redirects corpses toward a route that no longer exists, and attacks anyone who disturbs the register. | `lich_phylactery`, dead-route evidence, and the scholar's first proof that accurate records can become lethal after the world changes. Existing Boss art remains valid through the reliquary-shell explanation. |
| `shadow_commander` | Accepted record name: `左線指揮凱德倫 / Kaedren`. He commanded one local line inside the twenty-year expedition, not the expedition's supreme commander. His last order was to hold one breach approach and allow no retreat. The present ornate shadow armor is assembled from the abandoned weapons, armor, chains, and banners of the whole line; it does not represent his living rank. | Shadow soldiers are not Demon King troops; they are one unfinished human command repeating without living judgment. | `commander_blade`, shadow precursor materials, and a direct emotional bridge into the elder's guilt without consuming the future supreme-commander Boss slot. Existing Boss art remains valid as a collective command echo. |
| `ancient_titan` | An ancient member of a nonhuman people sleeping near the mountain vein and its regulation ruins. The Demon King's energy drain wakes it. It moves toward the thief by instinct; it is neither a human-built guardian nor part of the road. | Its scale turns each step into an earthquake. The player blocks it only after its route threatens the trapped caravan and the sole remaining approach. | Guaranteed `titan_hammer` loot decision; collapse exposes the ancient regulation channels and the direction of the continuing drain. |
| `elemental_lord` | A new convergence consciousness formed when the damaged ancient regulation network can no longer keep fire, ice, thunder, and poison-bearing flows apart. It is neither an ancient god, a human, nor a Demon King general. | Changes phases because four natural flows are being pulled into one unstable body and cannot remain balanced. | `elemental_core`; physical proof that the four fronts share one mountain source and that the drain continues after the Titan falls. |
| `elder_dragon` | Dragon-clan authority and living seal keeper. It fought for territory and survival, never for humanity. | Uses short imperatives and concrete judgments. It knows the fall, the broad containment, the human scar, and that mountain villagers once used outside acoustic paths; it does not know Ailo, Neelu, Vesper, exact blind-turn sequences, or human private motives. | First-run local seal-keeping clan erased and containment collapse, or second-run non-attack while the player withdraws toward the old human route. |
| `demon_lord_asariel` | Accepted display name: `魔王赫爾薩恩 / Helsarn`. It sought the mountain convergence as a second heart: a way to recover, root its life into the region, and spread without depending on one body. | Patient, contemptuous, and economical. It does not explain cosmology during battle and resets with the rest of the world in the second run. | First-run surviving body; second-run true execution through remembered preparation. Runtime id remains `demon_lord_asariel`; obsolete display name `阿薩謝爾` is removed only during the approved runtime migration. |

#### Second-run counter Bosses

| Boss | Why Achievement Memory Reveals It | Guaranteed Story Material | Execution Function |
| --- | --- | --- | --- |
| `blood_moon_stag` | The remembered false victory makes the protagonist recognize that its intact seed preserves the boundary between living vitality and life stolen through the land. | Intact `life_seed`. | Forces borrowed vitality out of the Demon King's convergence-bound body and anchors it to one mortal form. |
| `drowned_oracle` | The first false victory makes its trapped voice meaningful: a body can fall while an echo continues elsewhere. | `ancient_rune`. | Pins the Demon King's escaping voice/soul echo so it cannot retreat through the curse network. |
| `thorn_witch` | The protagonist now understands that killing the body is insufficient; the hidden parasitic core must first be made visible and separable from its host terrain. | `forest_essence`, used with the mainline `glimmer_shard`. | Refines a glimmer revealing medium that exposes the pinned core without introducing full light affinity into the base campaign. |

These are three additional mandatory mainline Boss routes in the second run, but
they reuse existing base-game monsters, art, materials, and level identities.
Normal first-run encounters or drops from these bosses do not count as execution
materials; the second-run story states require intact, recognized versions.
Once recognized in the current run, these versions are quest keys: they cannot
be sold, discarded, gambled, or consumed by ordinary recipes. They may reuse the
existing material images rather than creating duplicate art.

Counter-Boss identity details:

- `blood_moon_stag` is an ancient migratory beast, not a sacred messenger. Its
  body repeatedly sheds and rebuilds vitality according to the blood-moon cycle,
  which is why an intact Life Seed can reveal borrowed life.
- `drowned_oracle` is the fused remnant of a coastal bell diviner and the ritual
  shell used to carry warning tones. Drowning and curse pressure left only a
  voice that continues after the body. It cannot distinguish warning, memory,
  and prediction.
- `thorn_witch` is a living forest alchemist who recognizes value only through
  exchange and biological consequence. She is not allied with the Demon King.
  The second-run battle is a forced trial: the player must prove they can
  separate parasite from host before she releases uncontaminated Forest Essence.

### Second-Run External Boss And DLC Extension

Status: `paused`. The accepted direction is recorded so later work can resume
without reopening the boundary, but no external route should be expanded until
the complete first-run story, playable systems, and required art are finished.
The first-run false ending will eventually unlock a staggered set of optional
external Boss stories in the second run. They make replay geography and combat
materially different, but never become a true-ending requirement.

- `ash_baron` becomes an optional overcap Boss whose ash contracts, freight
  rights, and regional exploitation can be discovered through a new second-run
  branch. Its current Lv40 stats, generic drops, and old Chapter 2 world-chain
  placement are scaffolding, not the approved overcap implementation.
- The twenty-year expedition's supreme commander is reserved as a separate
  overcap Boss identity. Kaedren does not fill this role. The commander's name,
  transformed state, location, and reward remain intentionally undefined.
- Chapter 1's opening overcap identity is accepted as `blood_moon_stag`, shown
  only as `迷霧中的巨影` during the first run. It is an ancient migratory beast
  driven mad by expanding curse pressure, not a Demon King emissary. Its charge
  breaks the protagonist's guild-issued hunting blade and throws them down the south-road
  slope, physically ending the encounter where Mia can find them. Only this
  first-run identity and fixed-loss staging belong to the active pass; its
  later hidden rematch remains paused.
- Chapter 2's reserved external identity is `無名之咒`: the curse-compressed
  remains of many dead people whose individual names and routes were lost. It
  must not be framed as a giant elephant, a single honored corpse, or a generic
  undead king. Its final body, route, reward, combat, and art remain paused.
- Chapter 5's reserved external identity is `熵`: a balancing response that
  emerges only after the four-element Boss dies and fire, ice, thunder, and
  poison lose their mutual restraint. It is not a fifth element and must not
  retroactively cause the Elemental Lord. Its final body, route, reward, combat,
  and art remain paused.
- Chapter 6 owns the first optional second-run formal-light Boss route and a
  current-run light weapon answer; Chapter 7 owns the paired optional second-run
  Void Boss route. Neither identity appears in the mandatory first-run chapters. Light must
  reveal, anchor, or make the Void target interactable rather than acting as a
  flat damage multiplier, and the reward must not force one weapon form. These
  routes remain optional and never gate the true ending.
- External stories unlock from first-run evidence plus achievement meaning, but
  all physical clues, tools, and rewards are reacquired in the current run.
- Routes are staggered rather than dumped after the ending. Exact chapter
  branches remain under review; high-tier light, Void, and tower conclusions may
  remain at Lv70 or after the true ending.
- Later DLC continues deeper expedition history, light/Void cosmology, and the
  post-tower world. The player's first Ash Baron resolution, first radiant trial,
  first Void revelation, and prologue revenge remain available in the base game.

Resume gate: finish and validate the complete first run, including story,
systems, map flow, dialogue presentation, backgrounds, half-body expression
layers, and critical CGs. Then audit the persistent achievement/evidence flag
contract before writing any second-run external scene.

The mandatory first run may leave environmental clues, records, freight marks,
or an unexplained contract collector as hooks. It must not make an unplayed
external Boss feel like a missing mainline chapter.

### Necessary Supporting Character Proposals

#### Neelu

- Status: accepted supporting character for screenplay use. No supernatural
  role.
- Occupation: mountain-village dye-mender (`山村染補師`). Repairing household
  cloth is her primary work; gathering dye plants and seasonal dye flowers is
  one part of the same craft rather than a second occupation. Ordinary work takes
  her through the narrow mountain paths.
- Core desire: finish one season with enough repaired cloth and stored dye that
  she and Ailo can visit the flower field without gathering, carrying, or
  hurrying home.
- Core fear: that every ordinary promise will be postponed until disaster makes
  `later` impossible.
- Values: useful work matters, but a life cannot be made only of surviving the
  next task.
- Inner contradiction: she wants to leave the dangerous mountain for a safer
  season, yet loves the home, paths, and flowers that make leaving difficult.
- External expression: close in age to young Ailo, practical mountain clothing,
  dark hair tied with a faded green cloth, dye-stained fingertips, and a mending
  needle usually kept at the collar. Exact facial design remains future art work.
- Relationship: she teases Ailo for mixing edible plants, dye flowers, and trail
  scraps in the same bag. Their marriage is affectionate, practical, and allowed
  to include small irritation.
- Speech: warm, direct, lightly amused, and never prophetic. She calls him 艾洛
  naturally so the second-run memory reveals his name without exposition.
- Memory line direction:
  `等忙完這一季，我們再一起來看一次。不是採花，也不是趕路。就只是看。`
- Response to Ailo's grief:
  `我知道。你有來。你一直都在來。`
- Presentation boundary: she appears only inside the accepted memory, not as a
  ghost who advises the protagonist or explains the Demon King.

#### Casino dealer 洛恩 / Lorne

- Status: accepted supporting character and display name. Uses the existing male
  `casino_dealer` portrait.
- Origin: a traveling professional dealer who believed cheating a rich house was
  a victimless skill. Vesper caught him altering a settlement table, converted
  the loss into a Blank Collateral debt, and made him operate the same kind of
  rigged games against desperate customers.
- Core fear: being collected by the contract's unknown creditor before anyone
  knows which harms were ordered and which he chose to commit himself.
- Core desire: survive long enough to leave one honest account and stop another
  person from taking his place at the table.
- Values: technique, readable rules, and the belief that a game can be fair even
  though he has spent years proving otherwise.
- Inner contradiction: he wants freedom and partial atonement, but every shift he
  works to stay alive creates another victim.
- External expression: use the existing male dealer image as the facial and
  costume anchor. His hands remain precise even when frightened; a thumb checks
  card edges or die weight before he answers difficult questions.
- Voice: polished table banter, exact descriptions of hands and odds, humor as a
  shield, and no jokes once collection begins.
- First-run rescue: Vesper orders a `settlement throw` using the guest dice. The
  result will collect Lorne's remaining life. The protagonist interrupts the
  table anchor and saves him, but Vesper escapes through a torn contract slit.
- First-run action: Lorne hands over one Loaded Die, identifies it as house
  evidence, and admits that he helped weight the set.
- Second-run action: achievement memory makes the protagonist notice the current
  run's die weight early. Lorne marks the guest set before settlement. The
  protagonist invokes the house rule requiring an accused host to swap positions
  and prove fairness. Vesper accepts, uses his own losing set, and becomes the
  named collateral under his contract.
- Final fate: survives, opens the display case so the player may choose one grand
  prize, turns over the debt ledger, and keeps the casino operating only as a
  transparent ticket game under town oversight. This is restitution work, not
  instant absolution.

#### Black-market boundary

- No full recurring profile is required for this screenplay draft.
- The trader acquired one Blank Collateral Contract in a bundle of unrecoverable
  debts and sold it once to Vesper after warning that its creditor line was not
  human.
- The trader no longer possesses another blank contract and does not care what
  happened to Vesper. This keeps the source credible without moving villain
  responsibility away from him.

### Seven-Chapter Contract Proposal

#### Chapter 1 - 南門以外 / Beyond The South Gate (Lv1-10)

- Opening image: the protagonist collapses near the south road and wakes under
  Mia's care in a town with too many closed doors.
- Opening question: why have nearby roads and ordinary monsters become
  unreliable at the same time?
- Main movement: elder introduction, scholar route brief, Frey at the South Gate,
  three-landmark investigation, Ambush Mantis evidence, Forest Guardian route.
- Character work: establish Mia's care and return checks, the elder/scholar
  trust engine, Frey's flag, Tavi's lamp, and blacksmith object-based care
  without finishing anyone's arc or presenting the cast as a roll call.
- Side-story support: Bitter Bottles, Cold Forge Smoke, and Patrol Soles.
- Boss convergence: `forest_guardian` proves the forest is reacting to pressure
  entering through roots and damaged routes.
- Chapter answer: route failure and monster behavior are connected.
- New question: why do the wounded roots and black residue point north?
- Town change: Mia records the protagonist's recovery and authorizes one basic
  prescription for the future market; basic forge repair, South Gate records,
  and the first handbook route become active. Shared water and reserved beds
  remain scarce, while the relit forge first receives pots, hinges, and a cart
  wheel before weapons.
- Second-run addition: memory identifies the opening giant as
  `blood_moon_stag`. Following its charge route instead of being thrown from it
  opens the hidden rematch; its intact Life Seed remains an execution anchor and
  has no role in Mia's survival.

#### Chapter 2 - 斷路上的藥味 / Medicine On The Broken Road (Lv11-20)

- Opening image: the first repaired road brings empty crates, medicine requests,
  and names of people who never reached town.
- Opening question: why do old evacuation instructions and the dead still try to
  complete routes that no longer exist?
- Main movement: recovered cargo records, herb-basket record, evacuation list,
  opened tomb route, Lich confrontation. The market remains closed until the
  Chapter 3 road and caravan return.
- Character work: deepen Mia's relationship through her father's unresolved
  record, shared herb sorting, and her involuntary attention to returning
  footsteps; show the scholar's useful confidence without turning the elder
  into a murderer.
- Boss convergence: Hern the Lich embodies care and record keeping preserved past
  the point where they protect anyone.
- Chapter answer: the curse can preserve unfinished human purpose, not only
  mutate bodies.
- New question: if the dead still obey, whose orders are the shadows following?
- Town change: market stalls and Mia-authorized medicine stock reopen; limited
  medicine is visibly wrapped and received by residents, and the handbook gains
  named evacuation records. Mia checks the authorization batch, then leaves all
  prices and transactions to the merchant.
- Paused external layer: `無名之咒` grows from bodies whose names, funeral
  records, and evacuation routes were compressed into one anonymous command.
  This is a chapter-two consequence and interpretation route, not a replacement
  for Hern's first-run convergence.

#### Chapter 3 - 影子仍守夜 / Shadows Still Keep Watch (Lv21-30)

- Opening image: shadow soldiers repeat patrols at abandoned checkpoints while
  the repaired town begins offering tempting shortcuts.
- Opening question: are the shadows servants of the Demon King or the remains of
  a human command?
- Main movement: shadow patrol investigation, Tavi's lamp-oil route, casino
  showcase introduction, black-market contact, Shadow Commander convergence.
- Character work: Tavi admits practical fear without completing his growth;
  Mia and the protagonist clash over concealed injury and her own self-neglect,
  then repair the conflict through one voluntary return; Vesper studies the
  protagonist's desires; the elder recognizes Kaedren's command pattern and
  withdraws.
- Boss convergence: Kaedren continues ordering a dead expedition to seal the breach
  and forbid retreat.
- Chapter answer: shadow is a preserved human violence pattern, not proof of
  allegiance to the Demon King. It is the mandatory mainline dark-affinity
  ceiling; its deeper relation to Void remains an optional second-run external
  reveal.
- New question: what kind of wound can preserve commands, debt, and fear in the
  same region?
- Town change: night-route markers, casino floor, first shadow crafting, and
  controlled black-market access open. The finite oil, coal, stock, and care of
  the honest town network are staged against a casino that appears never to lack
  anything.
- Second-run addition: `drowned_oracle` becomes a mandatory resonance route. The
  Ancient Rune proves the Demon King can survive as an escaping echo.

#### Chapter 4 - 石心與灰雨 / Stone Heart, Ash Rain (Lv31-40)

- Opening image: roads shift under standing buildings while ash falls without a
  nearby fire.
- Opening question: is the land itself attacking, or is something below forcing
  every structure out of place?
- Main movement: childhood-mist route meaning, measured or unmeasured rear-lamp
  preparation, evacuation through stone routes, fourfold countergear, Frey/Tavi
  route crisis, and Ancient Titan battle.
- Character work: Frey dies in the first run after the causeway physically locks
  the protagonist at the civilian crossing; Tavi survives hollowed; the elder
  lowers the flag and recognizes another route built around one expendable
  person. In the second run Tavi has already completed the rear-marker work and
  acts while afraid. Frey entrusts him with the rear marker and finally
  understands the elder's fear without abandoning courage.
- Boss convergence: `ancient_titan` turns terrain failure into a visible body.
- Chapter answer: constructed roads and deep stone are part of the damaged
  containment network.
- New question: why are four different elemental fronts now changing together?
- Town change: first run South Gate becomes quiet and its flag is lowered;
  second run retains a living patrol pair and stronger route morale.
- Second-run addition: Tavi personally measures and rehearses the rear route;
  his lamp intervention prevents Frey's death. A separate mandatory Thorn Witch
  route yields Forest Essence and teaches the scholar how glimmer can expose a
  hidden parasitic core.

#### Chapter 5 - 元素失衡 / The Elements Lose Their Shape (Lv41-50)

- Opening image: heat, frost, thunder, and poison symptoms appear in one route
  report instead of separate regions.
- Opening question: what single source can force four ordinary elements into one
  failure pattern?
- Main movement: elemental-front evidence, advanced forge preparation, 伊萊's
  field handling summary, Elemental Lord battle, four-element shard injury,
  Mia's surgery, expedition list, Echo Whistle discovery, elder departure bridge.
- Character work: the first run loses Mia after 伊萊's accurate separated-sample
  records are compressed into an unscoped `標準二格固定可安全處理` line; he finds
  `安全` beside the broken forceps and then loses the elder. The second run
  recognizes the ratchet sound, restores the evidence boundary, proves a scoped
  pressure-free procedure, saves Mia, and separately stops the elder.
- Boss convergence: `elemental_lord` physically joins the four fronts and leaves
  an Elemental Core whose flow points toward the mountain scar.
- Chapter answer: the regional crises are symptoms of one damaged containment.
- New question: are the dragons guarding the source, causing it, or preventing
  something worse?
- Town change: advanced forge contracts open, but first-run town warmth sharply
  drops after two losses.
- Second-run addition: prepare the pressure-free shard procedure before the Boss
  return, save Mia during the same surgery, stop the elder at the gate,
  receive the scar shard alive, and approach Ailo after the whistle cache is
  exposed.
- Paused external layer: `熵` appears after the Elemental Lord's death removes
  the restraint among four ordinary elements. It is a balancing mechanism made
  violent by the sudden vacancy, not a new affinity and not the cause of Mia's
  operation crisis.

#### Chapter 6 - 龍守封痕 / The Dragon Guards The Scar (Lv51-60)

- Opening image: first run follows the elder's patched-sole tracks out of the
  dawn gate until they end at scorched warning stones; second run walks the same
  route carrying the shard he placed in the player's hand alive.
- Opening question: is the dragon clan the last enemy, or the last living part of
  containment?
- Main movement: immediate elder pursuit, outer seal evidence, dragon warning,
  first-run war or second-run non-attack, failed broad-road search, return-town
  casino settlement, then Echo Whistle theft or invitation with Ailo.
- Character work: first run saves Lorne but loses Vesper, kills the dragon clan,
  and lets Ailo leave alone. Second run punishes Vesper, preserves the dragon,
  and accompanies Ailo.
- Boss convergence: `elder_dragon` is a mandatory first-run battle and a
  mandatory second-run dialogue confrontation using the same full Boss art.
- Chapter answer: dragons held the broad line for territorial survival; humans
  damaged it twenty years earlier.
- New question: even with the route understood, why did the first killing blow
  fail to end the Demon King?
- Town change: first run casino and civic leadership remain wounded; second run
  casino debt contracts end and the elder remains the town anchor.
- Second-run addition: the matched scar fragment, one-hole outside echo, weapon
  placed down, and refusal to cross remove the dragon's reason to attack. They do
  not open the narrow road; Ailo's still-fragmented route memory remains required.

#### Chapter 7 - 墜落之地 / Where The Demon Fell (Lv61-70)

- Opening image: the old local route enters the destroyed flower field and the
  physical wound where the Demon King fell.
- Opening question: can defeating the same body end a life rooted through the
  land, echo, and curse?
- Main movement first run: follow Ailo's opened road, find only traces, defeat the
  Demon King's combat body, return to town for the hollow victory.
- Main movement second run: accompany Ailo, witness the Neelu memory, assemble
  the Life Seed, Ancient Rune, Forest Essence, and Glimmer Shard into three
  execution anchors, and fight the true final battle while the dragon maintains
  containment.
- Character work: first run leaves Ailo dead and the town without explanation;
  second run lets Ailo release the promise without being consumed by it.
- Boss convergence: the extra Blood Moon Stag, Drowned Oracle, and Thorn Witch
  routes prepare the execution; Helsarn remains the genuine final enemy in both
  runs.
- Chapter answer: the Demon King used the mountain convergence as a second heart.
- Final result first run: body destroyed, life remains, dragon containment gone.
- Final result second run: borrowed life returned, echo pinned, glimmer exposes
  the core for physical destruction, and dragon containment remains preserved.
- Town change: first run ends in public victory and private emptiness; second run
  begins actual regional recovery.

### Accepted Omniscient Scene Timeline V2

Status: `production_baseline_pending_strict_editorial_review`. This timeline defines causality, order,
participation, side-story placement, first/second-run differences, and working
location bindings for all 66 scenes. The detailed screenplay below now supplies
runtime-order dialogue and staging for every scene. The screenplay now compiles
into a reviewable runtime registry; final asset production, reward assignment,
external-region implementation, and post-reveal DLC design remain outside this
screenplay pass.

The `Working Location` column is the authoritative dramatic location binding for
this draft. It is not automatically an asset filename. Every scene also belongs
to exactly one stage class below; sequences using more than one background remain
inside that class and must record their internal transition during full scripting.

#### Scene Stage-Class Index

| Stage Class | Bound Scene Ids | Count |
| --- | --- | ---: |
| `regional_canvas` | `ch1_s01_road_collapse`, `ch1_s06_three_landmarks`, `ch1_s09_rotroot_approach`, `ch2_s04_mist_and_tomb_route`, `ch2_s08_shadow_at_the_checkpoint`, `ch3_s03_lamp_oil_in_fog`, `ch4_s01_road_moves_underfoot`, `ch4_s04_gray_ridge_evacuates`, `ch5_s03_elemental_convergence`, `ch5_s05_fourfold_shrapnel`, `ch6_s01_northern_drake_watch`, `ch6_s05_after_the_broad_road`, `ch7_s01_narrow_human_road` | 13 |
| `location_scene` | `ch1_s07_silver_snare`, `ch1_s10_forest_guardian`, `ch2_s05_moon_moss_trace`, `ch2_s06_keeper_of_names`, `ch3_s01_dead_checkpoint`, `ch3_s06_drowned_voice`, `ch3_s07_old_command_post`, `ch3_s08_shadow_commander`, `ch4_s03_thorn_value_rule`, `ch4_s05_body_locks`, `ch4_s06_flag_returns`, `ch4_s07_titan_rises`, `ch5_s04_elemental_lord`, `ch5_s09_whistle_cache`, `ch6_s02_scar_aftermath`, `ch6_s03_stop_before_the_line`, `ch6_s04_dragon_convergence`, `ch6_s09_the_old_note_answers`, `ch7_s02_ruined_flower_field`, `ch7_s04_three_anchor_check`, `ch7_s05_fall_site_audience`, `ch7_s06_combat_body_falls`, `ch7_s07_last_core` | 23 |
| `town_scene` | `ch1_s02_wake_under_bitter_bottles`, `ch1_s03_broken_crossroads`, `ch1_s04_elder_to_scholar`, `ch1_s05_south_gate_introduction`, `ch1_s08_cold_forge_smoke`, `ch1_s11_roads_breathe_again`, `ch2_s01_empty_crates`, `ch2_s02_name_under_basket`, `ch2_s03_ledger_that_would_not_close`, `ch2_s07_names_return_to_town`, `ch3_s02_shadows_count_names`, `ch3_s04_showcase_glass`, `ch3_s05_blank_creditor_trace`, `ch3_s09_temptation_and_orders`, `ch4_s02_caravan_rear_missing`, `ch4_s08_returned_objects`, `ch4_s09_four_elements_one_report`, `ch5_s01_four_fronts_converge`, `ch5_s02_forge_contracts`, `ch5_s06_mia_operation`, `ch5_s07_after_the_ratchet`, `ch5_s08_expedition_list`, `ch5_s10_before_dawn`, `ch6_s06_settlement_throw`, `ch6_s07_house_changes_seats`, `ch6_s08_brush_past_or_invitation` | 26 |
| `memory_or_ending` | `ch5_s11_town_loses_its_voice`, `ch7_s03_echo_memory`, `ch7_s08_return_to_town`, `ch7_s09_first_or_second_epilogue` | 4 |

Total: 66 scenes. A validator must later compare this index with scene data and
fail on missing, duplicated, or unplaced ids.

#### Chapter 1 Scene Order

| Scene | Working Location | Omniscient Event | First Run | Second Run | Character / Side-Story Work | Story-State Output |
| --- | --- | --- | --- | --- | --- | --- |
| `ch1_s01_road_collapse` | South road outside town | Present curse pressure drives ordinary monsters into an abnormal route cluster. The protagonist is injured and poisoned while trying to reach shelter. | The attack reads as a harsh opening encounter. | The event repeats; memory creates unease but no rescue branch yet. | Mia is established through action before introduction. | Protagonist reaches town alive; Mia's private care becomes personally meaningful. |
| `ch1_s02_wake_under_bitter_bottles` | Mia's herb workroom | Mia treats the protagonist with scarce stock, checks symptoms, and refuses to discuss payment before survival is certain. | First meeting. | Same knowledge on her side; the protagonist recognizes the room and ordinary care but cannot change a fate yet. | Opens `Bitter Bottles`; establishes care, injury recovery, and restrained humor without a shop menu. | Mia relationship seed; first basic prescription is ready for later market authorization. |
| `ch1_s03_broken_crossroads` | Town crossroads | The protagonist sees closed forge, empty stalls, damaged gate traffic, shared water, reserved sickbeds, and too few residents before meeting the elder. | Town reads as a damaged place people are still using, not only a locked hub. | Empty positions carry remembered emotional weight. | Elder becomes civic anchor; Ailo may be seen handling scraps without a formal scene. | Town baseline recorded; later recovery has visible human contrast. |
| `ch1_s04_elder_to_scholar` | Civic room and scholar desk | The elder directs the protagonist to Eli, who compares the south-road report with the last patrol records. | Trust begins through a limited, practical investigation. | The same records are consulted; remembered context does not grant an early answer. | Eli is established by how he separates confirmed facts from missing information, not by explaining his personal theme. | Traveler handbook and three-landmark objective open. |
| `ch1_s05_south_gate_introduction` | South Gate | Frey limits the still-wounded protagonist to one route segment at a time. Tavi adds the last ordinary observation of the missing patrol's route. | Both characters are working at the gate; no symbolic reading is supplied. | The protagonist recognizes the scene but receives no intervention or explanation. | Their equipment remains ordinary workplace detail. Personal history is reserved for later character stories. | Gate route, staged reporting, return procedure, and free town recovery become clear. |
| `ch1_s06_three_landmarks` | `south_gate_farmland`, `hunter_boardwalk`, `old_campfire_site` | Footprints, a displaced silver line, warm black roots, and missing tracks give three incomplete pieces of physical evidence. | Exploration teaches the investigation grammar without naming a culprit. | The same landmarks remain mandatory; memory changes attention, not evidence. | Frey receives the first field report; Mia performs a concrete symptom check before the next departure. | Three route records are stored in the handbook. |
| `ch1_s07_silver_snare` | `cut_roadsign`, `silver_snare_pass` | A turned route marker and tensioned silver line lead into an Ambush Mantis attack. Resin on the recovered line matches residue near the black roots. | The player can connect two observations but still cannot identify the larger cause. | Same Boss and same evidence; no alternate outcome is needed. | No new hunter or explanatory witness is added. | `ambush_mantis` defeated; the forest route becomes the next investigation direction. |
| `ch1_s08_cold_forge_smoke` | Forge | Eli limits what the silver line proves. The elder sends the protagonist to repair damaged gear, and the protagonist helps restore the forge bellows. | Basic forge access follows a visible repair task. | The same service restoration occurs without commentary about future losses. | The blacksmith reacts to damaged equipment and the stuck bellows; his care stays inside practical instructions. | Basic repair and starter craft access. |
| `ch1_s09_rotroot_approach` | `broken_horn_camp`, `rotroot_ravine` | The protagonist follows visible black-root exposure, animal avoidance, and the route shown on the old map toward the ravine. | The route is dangerous and its cause remains unknown. | The protagonist checks the same terrain more carefully but gains no early conclusion. | No remote character explanation interrupts the field investigation. | Forest Guardian gate opens. |
| `ch1_s10_forest_guardian` | `old_wolf_den` / ancient root heart | The Forest Guardian blocks access to the root heart. After the battle, the ground still shakes and fine roots continue into deeper soil. | Defeating the regional threat does not resolve the missing patrols or identify the source. | Same necessary battle; remembered context changes attention, not outcome. | The Boss is understood through visible wounds and behavior, without a new explanatory speaker. | `forest_guardian` convergence cleared; deeper-root evidence recovered. |
| `ch1_s11_roads_breathe_again` | Town crossroads | Nearby roads become readable, not safe. The town restores only the functions justified by the chapter. | A modest first victory includes Mia rechecking the return and the forge receiving household repairs before weapons. | The achievement-memory system remains quiet until the ending has been earned. | The player physically carries the result through gate registration, archive review, treatment, and civilian repair work. Character change is shown through those tasks rather than a round of chapter-closing speeches. | Chapter 2 opens; the treatment baseline, forge, gate, and handbook enter stage one. Market medicine waits for a real supply route. |

#### Chapter 2 Scene Order

| Scene | Working Location | Omniscient Event | First Run | Second Run | Character / Side-Story Work | Story-State Output |
| --- | --- | --- | --- | --- | --- | --- |
| `ch2_s01_empty_crates` | Empty market edge | Patrols recover damaged crates and names of carriers who never arrived. The merchants remain stranded beyond the broken trade road. | Supply shortage appears as a civic problem with no shop solution. | The protagonist recognizes the pattern of routes continuing after people are gone. | Existing town workers inspect the evidence; no merchant or supply captain is inserted early. | Missing-carrier record and medicine-authorization work open; market remains closed. |
| `ch2_s02_name_under_basket` | Mia's herb workroom | A name beneath an old herb basket connects Mia's family loss to the expedition and evacuation years. | Mia recognizes the name, waits for the supply number to be verified, and returns to sorting medicine before she is ready to say more. | The protagonist recognizes the same pause but gains no false foreknowledge about her later surgery. | `Name Under The Herb Basket` exposes one unresolved family record through an ordinary work task. It is evidence and observed behavior, not an automatic relationship milestone. | Mia's father remains listed as missing; the expedition link and prescription-supply need enter the handbook. |
| `ch2_s03_ledger_that_would_not_close` | Scholar desk | 伊萊 and the elder compare evacuation lists, funeral tags, and one route instruction that was once correct. | The document is accepted as useful evidence. | The protagonist notices the missing revision layer but cannot yet prove the later terrain change. | `Ledger That Would Not Close`; elder guilt remains restrained. | Ancient tomb and mist-tablet route open. |
| `ch2_s04_mist_and_tomb_route` | `mist_tablet_hill`, `opened_ancient_tomb` | Funeral markers point toward a route whose dead still try to complete evacuation. | Horror and investigation converge. | Memory highlights that names, not necromancy alone, are binding the dead. | Mia names the human cost; blacksmith supplies practical anti-undead preparation. | Lich phylactery clues gathered. |
| `ch2_s05_moon_moss_trace` | `moon_moss_slope` | Repeated hoof marks cross the reopened route, but the animal itself has already moved west. | Optional environmental evidence only; no Boss, reward, or required detour. | The same current-run trace remains environmental evidence; paused second-run Boss work does not enter this scene. | Establishes that large wildlife is being displaced without identifying the prologue attacker. | Moon-moss route observation only. |
| `ch2_s06_keeper_of_names` | Opened tomb reliquary | Hern's records reveal that he bound tags, bodies, and route duty together when burial became impossible. | Player reads him as a tragic Lich after the battle. | Same battle; achievement memory makes the glimmer-bearing residue worth reserving. | 伊萊 confronts the danger of records surviving context. | `lich` defeated; `lich_phylactery` and reserved `glimmer_shard` acquired. |
| `ch2_s07_names_return_to_town` | Civic room | The dead are re-entered into an honest ledger rather than praised as a faceless sacrifice. | 伊萊's records resolve two missing carriers while Mia's father remains honestly unresolved. Medicine formulas are ready, but there is still no delivery route or public stock. | Revision dates are added because the protagonist has seen what obsolete instructions can do. | Mia keeps the unresolved tag available for later checks. The elder and 伊萊 show long familiarity only through how they divide the remaining work; Ailo recognizes the useless dye flower. | Evacuation record closes; public medicine is authorized but unavailable until the caravan returns; unresolved family evidence and Ailo's flower breadcrumb remain active. |
| `ch2_s08_shadow_at_the_checkpoint` | Northbound road marker | A recovered route sign is found guarded by shadows using an old human formation. | New threat teaser. | The order pattern is immediately disturbing but still lacks a commander identity. | Tavi is assigned later lamp work; Frey volunteers for route marking. | Chapter 3 shadow investigation opens. |

#### Chapter 3 Scene Order

| Scene | Working Location | Omniscient Event | First Run | Second Run | Character / Side-Story Work | Story-State Output |
| --- | --- | --- | --- | --- | --- | --- |
| `ch3_s01_dead_checkpoint` | Reauthored `obsidian_keep_gate` | Shadow soldiers continue inspection, formation, and denial procedures from the old expedition. | They initially resemble Demon King troops. | The protagonist notices human equipment habits and command spacing. | 伊萊 and elder disagree over whether to publish the resemblance. | Shadow-command evidence chain opens. |
| `ch3_s02_shadows_count_names` | Blacksmith and scholar work table, then Mia's workroom | The commander's blade fragments and old fittings match expedition issue patterns. The protagonist's concealed shadow wound makes the same chapter cost personal. | The enemy is reframed through physical evidence. Mia treats a wound the protagonist delayed reporting, but neither person turns the treatment into a declaration about their relationship. | The player asks for the comparison before another patrol is destroyed and still receives the same treatment because Mia has no inherited memory. | Blacksmith/伊萊 evidence chain; Mia notices the delayed report and the protagonist notices her fatigue through concrete actions; shadow craft remains weaker than future optional Void. | Shadow equipment and the command-post route unlock; the delayed wound becomes a behavior the protagonist can correct later. |
| `ch3_s03_lamp_oil_in_fog` | Night watch route | A routine night inspection exposes an unmeasured rear marker. Tavi repairs the front lamp while avoiding the fogged rear route, and Frey quietly covers the part he leaves unfinished. | Frey can report direction, but no one records the rear frame, intake, or fastener measurements; no safe wind guard can be built. | The protagonist keeps the front marker under watch, Frey takes over Tavi's repair, and Tavi completes the rear measurement while still visibly afraid. No childhood explanation or confession is required. | Repeated work behavior, not symbolic dialogue, establishes that Tavi can function under fear and that Frey has a habit of filling his gaps. | First run records `rear_marker_unmeasured`; second run records only the completed physical state `rear_marker_ready`. |
| `ch3_s04_showcase_glass` | Casino display hall | Visible unique prizes tempt the player before Vesper becomes a quest target. Lorne operates the table and studies reactions. | The casino feels useful and dangerous. | `莊家離席` makes the player watch Lorne's hands and die selection, but proof is not yet available. | Vesper and Lorne enter; `Showcase Glass` begins their long route. | Casino floor, ticket pools, and showcase inspection open. |
| `ch3_s05_blank_creditor_trace` | Black-market contact point | One contract record has no human creditor line. The trader confirms it was sold once and has no duplicate. | Ominous side evidence; base story does not name Void. | The player understands this will become Vesper's escape route and presses Lorne earlier. | Black market remains functional, unnamed, and separate from Vesper's guilt. | Blank Collateral clue enters handbook. |
| `ch3_s06_drowned_voice` | `drowned_bell_coast`, `sunken_altar_reef` | Bell tones continue after the diviner's body and ritual shell should be silent. | Optional exploration Boss with an Ancient Rune reward. | Mandatory memory route because `未竟的弒王` makes bodiless continuation legible. | No new coastal NPC is required; route is carried by environment and Boss. | `ancient_rune_bound` current-run quest state. |
| `ch3_s07_old_command_post` | Reauthored `black_iron_storehouse` | Expedition supply marks identify Kaedren as one local line commander, not the supreme commander. His last signal never arrived. | Elder finally admits he knew the formation. | The player separates Kaedren's local order from the still-unknown supreme command. | Seeds a future overcap commander without occupying that identity. | Kaedren record and command phrase verified. |
| `ch3_s08_shadow_commander` | Old line-command yard | Kaedren repeats the order to hold one breach approach and refuses all retreat. | Battle ends the local command echo. | Same battle; the protagonist preserves evidence more deliberately. | Elder reacts off-screen through the returned blade; blacksmith sees human wear. | `shadow_commander` defeated; command route closes. |
| `ch3_s09_temptation_and_orders` | Town night state and reopened trade road | Kaedren's order ends and the first complete road reopens. The stranded caravan reaches town in sections while the town still has both honest preparation and seductive shortcuts. | The protagonist brings the wound back to Mia before it worsens. Returning town merchants reopen the public market; outside traders arrive with them. The caravan rear remains on the road when the first quake report arrives. | The player has begun several corrections through current-run actions, but none is complete. | Mia sees a changed reporting habit rather than receiving a relationship speech. Frey and Tavi prepare to guide the remaining caravan section. Vesper appears only if the player entered his optional route. | Market and authorized medicine stock open; Chapter 4 begins with a real caravan still exposed at Gray Ridge. |

#### Chapter 4 Scene Order

| Scene | Working Location | Omniscient Event | First Run | Second Run | Character / Side-Story Work | Story-State Output |
| --- | --- | --- | --- | --- | --- | --- |
| `ch4_s01_road_moves_underfoot` | Gray Ridge approach | The first returning caravan reports repeating quakes. Retaining walls and exposed ruin channels fail in a line leading toward the mountain. | Terrain failure is treated as an escalating natural disaster. | The protagonist remembers the Titan but must still establish the current evacuation route from present evidence. | Elder orders the rear caravan located; Frey takes route marking; Tavi handles lamps. | Gray Ridge rescue and ancient-ruin investigation open. |
| `ch4_s02_caravan_rear_missing` | Market and forge | The recently reopened market is counting its first caravan when the ledger shows that the rear wagons and escorts never arrived. | The brief return celebration ends as a rescue preparation. | The same people return; prior knowledge changes readiness, not who exists. | The merchant identifies the missing cargo section. Blacksmith places bridge plates, lamp guards, stretchers, and wagon fittings before new weapons. | Public trade remains active; chapter-four baseline craft arrives; Gray Ridge evacuation equipment and second-run wind guard are issued. |
| `ch4_s03_thorn_value_rule` | `thorn_glasshouse_ruin` after `ch4_s08` | The collapsed ruin line exposes a separate overgrown glasshouse only after the Gray Ridge evacuation and town aftermath. | Optional combat route; ordinary Forest Essence enters normal craft stock without interrupting the rescue. | Mandatory confrontation. She withholds uncontaminated essence until the player proves parasite and host must be separated. | Mia interprets the returned symptoms inside a story scene; no material-identification menu, chapel, or light NPC appears. | `forest_essence_pure` and glimmer-refinement knowledge. |
| `ch4_s04_gray_ridge_evacuates` | Gray Ridge causeway | The rear caravan is found among broken wagons. Another quake splits survivors and cargo across the causeway. Two visible markers are required while the protagonist holds the central crossing open. | Frey takes the front flag; Tavi is assigned the rear lamp; collapse physically prevents the protagonist from replacing either marker. | Same assignment and separation, but Tavi has rehearsed and repaired the wind guard. | Named and functional NPCs are accounted for; unnamed drivers or guards may already be dead or lost without becoming disposable dramatic props. `Flag And Lamp` enters its irreversible crisis. | Evacuation timer, protagonist central-hold state, and marker states begin. |
| `ch4_s05_body_locks` | Rear causeway marker | A ground break and trapped voices trigger Tavi's physical freeze. | Lamp remains unlit; Frey sees the rear group lose direction. | Tavi is still terrified but lights the marker before the break reaches him. | His difference is action under fear, not cured fear. | First run `rear_marker_failed`; second run `rear_marker_lit`. |
| `ch4_s06_flag_returns` | Cracked center span | Frey chooses whether she must return to hold direction while the protagonist remains trapped across the central break. | She fixes the patrol flag into stone and remains until the last figures cross; the span rises as the protagonist finally moves toward her. | She sees Tavi's light and stays at the front marker; neither abandons the other group. | First-run final Frey CG candidate; second-run shared courage payoff. | First run Frey death; second run both survive. |
| `ch4_s07_titan_rises` | Ancient vein-regulation ruins | The awakened Titan crosses the exposed ruins toward the mountain drain. Its next steps will crush the remaining caravan route. | The protagonist fights immediately after witnessing Frey's death. | The protagonist fights after the successful evacuation. | Boss emotion differs without changing its nonhuman motive. The Titan does not serve the Demon King and is not judged as evil. | `ancient_titan` defeated; `titan_hammer` enters the normal loot decision; the collapsed ruins expose four regulation channels and the direction of the drain. |
| `ch4_s08_returned_objects` | Forge, South Gate, and Mia's workroom | The flag fitting and lamp return to town, then the evacuation's bodily cost reaches Mia's workroom. | Blacksmith cannot restore Frey; Tavi becomes hollowed; the elder lowers the gate flag and identifies the route's one-person dependency as the failure. Mia overworks after treating evacuees. | Frey and Tavi argue because both were frightened for the other. Frey admits that seeing Tavi in danger made her want to call him back; the elder names that as the fear behind every opened gate. Mia still confronts how narrowly everyone returned. | Blacksmith remains the town-temperature gauge; Frey finally understands the elder without abandoning courage; Mia's Chapter 4 relationship beat deepens without stealing the flag/lamp climax. | Run-specific gate, forge, Tavi, Frey/elder, and Mia relationship states lock. |
| `ch4_s09_four_elements_one_report` | Scholar desk and town night | Survey marks from the collapsed ruins align four old channels with new reports of heat, frost, thunder, and poison. Ailo hears a lower road opening; Vesper turns the Gray Ridge result into a personalized offer. | New crisis begins after a personal loss; Vesper prices grief. | The living patrol pair helps gather complete timings; Vesper prices fear of the next near-loss. | 伊萊 identifies an old regulation network rather than a magic heart rhythm. Ailo supplies a second whistle breadcrumb, and Lorne refuses to open the private table despite Vesper's pressure. | Chapter 5 opens with four-front evidence, the continuing mountain drain, Ailo continuity, and the casino dealer's first costly defiance recorded. |

#### Chapter 5 Scene Order

| Scene | Working Location | Omniscient Event | First Run | Second Run | Character / Side-Story Work | Story-State Output |
| --- | --- | --- | --- | --- | --- | --- |
| `ch5_s01_four_fronts_converge` | Civic room with ruin survey and four route reports | Fire, ice, thunder, and poison symptoms follow four damaged regulation channels toward one mountain drain. | The town treats them as linked emergencies only after comparing current evidence. | Reserved materials and prior evidence let the protagonist ask for scoped residue tests earlier. | Mia reads patient records; blacksmith reads gear; 伊萊 maps route time and ruin channels. | Elemental Lord route opens without relying on a removed Titan-heart clock. |
| `ch5_s02_forge_contracts` | Advanced forge | The blacksmith turns elite materials into deliberate preparation rather than grind. | Stronger gear supports the required Boss. 伊萊 turns four accurate separated-residue records into a field summary whose line `標準二格固定可安全處理` omits its tested scope; the standard forceps therefore carries documentary as well as technical confidence. | The ratchet click triggers `醒來時，水已經涼了`. The protagonist cannot cite the future, but asks what the summary actually proves. 伊萊 reopens the source pages, refuses to sign a combined-object conclusion, and joins pressure tests before departure. The neutral execution housings are also completed from current-run true-kill materials. | `Forge Contracts`; useful paperwork becomes character causality rather than a miracle warning or a reckless mistake. | Advanced forge; first run records `unscoped_handling_summary`; second run records `ratchet_memory_triggered`, `summary_scope_challenged`, and `execution_housings_ready`. |
| `ch5_s03_elemental_convergence` | Handcrafted four-front regional canvas | Each element is traced to one widening mountain pressure line. | The answer arrives through danger; no combined-shard handling record exists, and 伊萊's concise separated-sample summary is treated as the best available field rule. | Small current-run residues from the four fronts are brought together and tested without crushing: the ratchet is removed, spider silk spreads contact, and purified slime gel receives the unstable residue. The result cannot predict the exact wound, but proves fixed pressure is unsafe. 伊萊 writes the tested scope on the same line as the result. | Elder recognizes geometry from the old expedition; 伊萊 owns the evidence boundary, the blacksmith modifies the tool, and Mia owns the procedure decision. | Boss convergence unlocked; second run records `pressure_free_handling_proven` and `scoped_handling_record`. |
| `ch5_s04_elemental_lord` | Convergence core | Four unstable flows form one temporary consciousness and attack in phase changes. Its death produces the first combined shard burst. | The nearest intact shard penetrates the protagonist during the victory collapse. | Same Boss and same injury; true-kill materials remain reserved for the final route rather than acting as medicine. | No human villain or random infection is inserted. | `elemental_lord` defeated; protagonist disabled; intact four-element shard embedded. |
| `ch5_s05_fourfold_shrapnel` | Authored return segment from convergence core to town | The intact shard cycles fire, ice, thunder, and poison pressure while remaining lodged near a major vessel. The protagonist survives transport because the shard disables and destabilizes without completing the vessel tear while it remains braced between rib and tissue; movement and removal, not elapsed minutes alone, are the immediate lethal risk. | Mia stabilizes the protagonist for one immediate operation using the only known procedure. | The pressure-free receiving setup has already been proven and is waiting in the workroom; no rescue errand interrupts transport. | Mia's core fear and the protagonist relationship become immediate without a gathering quest. | First run standard procedure; second run prepared procedure. |
| `ch5_s06_mia_operation` | Mia's herb workroom | Mia removes the shard while the blacksmith assists with the unfamiliar object. | The blacksmith follows the technically sound standard tool and 伊萊's separated-residue summary. The shard contracts, the fixed ratchet crushes it, and the point-blank release kills Mia after `好了。你回來了。` | The ratchet is removed; a spider-silk loop distributes force and purified slime gel receives the shard intact. Mia survives the same line and scene. | First-run hidden achievement or second-run rescue achievement; romance remains restrained; the causal chain belongs to several ordinary decisions rather than one villain. | First run Mia death and `最後一頁`; second run Mia alive and pressure-free procedure proven. |
| `ch5_s07_after_the_ratchet` | Workroom and scholar desk | The broken forceps, contraction timing, and handling pages are interpreted without inventing a second cure. | 伊萊 finds `安全` in his own handwriting beside the broken tool and understands that his concise summary erased the boundary between four separate facts and one untested conclusion. The blacksmith refuses to let him claim sole blame, but cannot remove his real contribution. | The source pages were reopened before departure, the generalized summary was rejected, and the scoped current-run handling record reached the room in time. Mia accepts that the operator must also be protected. | 伊萊's central fear becomes concrete: ordinary paperwork can harm or save according to how honestly it carries uncertainty. | First run `醒來時，水已經涼了`; second run `醒來時，水仍溫著`. |
| `ch5_s08_expedition_list` | Civic archive | Elder, 伊萊, and protagonist reconstruct the twenty-year expedition: Kaedren's local line, the unknown supreme commander, early victories, and seal damage. | Elder recognizes the present route and decides to pay the debt alone. | `封痕前的老人` makes the protagonist notice his preparations and refuse secrecy. | `Expedition List`; no supreme-commander Boss encounter is created. | Seal-scar context completed. |
| `ch5_s09_whistle_cache` | Newly exposed old waystation cache | Elemental movement opens a mountain villagers' storage recess containing the Echo Whistle. | It is logged as an unidentified route tool and placed in the protagonist's pack. | The protagonist recognizes Ailo's repeated sound fragments, shows him the whistle before leaving, and records his involuntary practical reaction to its tone. Ailo does not yet join the expedition. | Ailo route moves from background to mainline key while preserving the later choice to steal or accompany. | Echo Whistle acquired in the current run; second run records `ailo_recognized_whistle`. |
| `ch5_s10_before_dawn` | Town gate | Elder leaves with the scar shard before dawn. | His empty room is discovered too late. | The protagonist confronts him with the expedition list and the memory of his departure; he admits his intent and gives the shard alive. | Elder arc branches without NPC memory. | First run `elder_departed`; second run `elder_alive_shard_given`. |
| `ch5_s11_town_loses_its_voice` | Town montage | Losses alter ordinary sound before the dragon chapter. | Mia dead, Frey dead, elder absent, Tavi hollow, blacksmith quiet, 伊萊 slowed. Mia's workroom remains accessible but no later research occurs. | All remain alive but strained; preparation feels communal rather than triumphant. | Town-temperature midpoint payoff. | Chapter 6 run-specific town and relationship states lock. |

#### Chapter 6 Scene Order

| Scene | Working Location | Omniscient Event | First Run | Second Run | Character / Side-Story Work | Story-State Output |
| --- | --- | --- | --- | --- | --- | --- |
| `ch6_s01_northern_drake_watch` | `northern_drake_watch`, `dragon_heat_crag` | The player pursues the elder immediately. Tracks, sheathed travel, inward-facing scorch marks, and dragon patrol distance establish observable facts without leaving the protagonist's viewpoint. | The elder's patched-sole tracks pull the player toward the warning line while the undecoded whistle yields only overlapping echoes. | The living elder's shard and Ailo's current-run one-hole reaction let the player demonstrate an outside echo without knowing the route sequence. | 伊萊 remains in town interpreting reports; Ailo remains in town rather than becoming a convenient dragon interpreter. | Dragon warning-line objective and observed containment evidence. |
| `ch6_s02_scar_aftermath` | Planned seal warning line near `charred_obelisk` | The protagonist reconstructs the elder's last action from the body, the sheathed weapon, the matched fragment, and the direction of the burn. | Player can establish that the elder came alone and tried to return the shard, but cannot read a farewell, certainty of survival, or complete inner motive into the scene. | No corpse exists; the shard remains in the player's hand outside the line and the recorded whistle reaction proves only that another route exists. | Elder first-run exit or second-run survival becomes undeniable without an audience-only death cutaway. | First-run anger/urgency or second-run proof chain complete. |
| `ch6_s03_stop_before_the_line` | Dragon perimeter | `elder_dragon` orders the armed human to stop and offers retreat, not aid. | With pressure already traveling toward town and no readable alternate road, the player crosses armed; combat becomes unavoidable. | Player stops, puts weapon and shard down outside the line, demonstrates the outside echo, and does not cross during the next surge. | Dragon speaks for its clan using Boss art; no spokesperson NPC. | First-run war gate / second-run evidence-bound non-attack. |
| `ch6_s04_dragon_convergence` | Broad sealed approach | Dragon clan defends the line it has held since the fall. | The protagonist kills `elder_dragon` and erases the remaining local seal-keeping clan. | No battle occurs; `elder_dragon` keeps holding containment while the player withdraws to search outside its line. | The dragon does not forgive, ally, thank, open a road, or grant human passage. | First-run containment collapse / second-run containment preserved. |
| `ch6_s05_after_the_broad_road` | Mountain base / town return point | The obvious approach cannot reach the fall site after either dragon result. | With the clan dead, the ruined broad verge still ends at a blind collapse. | The player follows the outside boundary without crossing the seal and reaches the same unreadable blind turns. | The whistle needs local human memory; dragon victory or restraint cannot replace Ailo. | Return to town with old-road objective unresolved. |
| `ch6_s06_settlement_throw` | Casino main table after the mountain return | Vesper uses a rigged guest set to settle Lorne's remaining collateral once the required witness returns. | Player interrupts the table anchor and saves Lorne, but cannot prove the full reversal before Vesper escapes. | `莊家離席` makes the protagonist identify the current run's abnormal die weight before settlement; Lorne marks the set. | Loaded Dice route reaches confrontation without delaying the urgent elder pursuit. | First run Vesper escape / Loaded Dice evidence; second run final wager opens. |
| `ch6_s07_house_changes_seats` | Same table and display hall | Contract rules decide who occupies host and guest positions. | Vesper tears a contract slit and leaves; Lorne gives the die after failure. | Vesper accepts the fairness challenge, rolls from the guest set, loses his own collateral, and is taken by the unnamed creditor. | Lorne survives both; only second run begins restitution. | First run casino poisoned; second run showcase choice and contract removal. |
| `ch6_s08_brush_past_or_invitation` | Town edge after the failed broad-road return | The protagonist tests the Echo Whistle again after leaving the casino; its short and long notes make Ailo react before anyone explains the mountain failure to him. | He approaches the sound, brushes past without explanation, steals the whistle, and disappears. Inventory inspection reveals the loss; no one else understands his destination. | The protagonist recognizes the remembered approach before contact, names the whistle, asks Ailo to lead, and refuses to let him go alone. | Ailo becomes active companion only here in the second run. | First run whistle lost and Ailo missing; second run Ailo companion state. |
| `ch6_s09_the_old_note_answers` | Old route mouth | The whistle activates an acoustic route marker hidden by collapsed terrain. | The road opens after Ailo has already gone ahead. | Ailo uses it beside the protagonist and explains only practical fragments. | No new magical guide or chosen-one lore. | Chapter 7 old mountain route opens. |

#### Chapter 7 Scene Order

| Scene | Working Location | Omniscient Event | First Run | Second Run | Character / Side-Story Work | Story-State Output |
| --- | --- | --- | --- | --- | --- | --- |
| `ch7_s01_narrow_human_road` | Planned old mountain road | Local path logic avoids the broad containment line and follows whistle echoes between blind rock turns. | Ailo's fresh traces prove someone went ahead; he is never found alive. | Ailo walks with the protagonist, sometimes certain and sometimes lost inside memory. | `Echo Whistle` main-support route. | Fall-village approach opens. |
| `ch7_s02_ruined_flower_field` | Planned destroyed flower field | The promise place survives only as terrain, scattered flowers, and household remnants. | Player sees an unexplained human ruin and cannot trigger the full memory. | Ailo reaches the emphasized flower and the whistle/memory alignment begins. | Neelu enters only as memory; no ghost or lore oracle. | First run incomplete handbook entry / second run memory event. |
| `ch7_s03_echo_memory` | Full-scene old-photo-filter memory | Young Ailo and Neelu work, tease, flee, separate at the fall, and return in memory to their ordinary promise. | Absent. | Full performance ends with Neelu receiving Ailo's grief; protagonist wakes beside surviving Ailo. | `Flower At The Echo's End`; future large CG sequence. | Ailo releases the compulsive solo route and survives. |
| `ch7_s04_three_anchor_check` | Final mountain camp / prepared forge housings | The true-kill preparation is verified without creating a special sword. | No anchor knowledge exists even if ordinary materials were found. | Life Seed, Ancient Rune, and refined glimmer medium are locked into three neutral housings usable with any weapon form. | Blacksmith and 伊萊 contribute through prior work rather than appearing at the final arena. | `true_kill_ready` only in second run. |
| `ch7_s05_fall_site_audience` | Planned Demon King fall site | The Demon King occupies the mountain wound and treats the protagonist as a short-lived intruder. | It does not reveal that its life extends beyond the body. | It still does not remember the first run; the protagonist's preparation is the difference. | Demon King receives no sympathetic dossier or exposition monologue. | Final Boss begins. |
| `ch7_s06_combat_body_falls` | Same arena | The visible combat form is defeated. | The game truthfully records a military kill while hidden life remains in body, land, and echo. | Life Seed forces stolen vitality back, Ancient Rune prevents echo escape, and glimmer exposes the remaining core. | `elder_dragon` holds pressure off-screen only in second run. | First run false kill / second run exposed-core phase. |
| `ch7_s07_last_core` | Core phase / ending transition | The remaining survival layer determines the ending. | Player has no valid target; the scene ends on apparent death. | Player destroys the revealed core using currently equipped gear. | No light, Void, external Boss reward, or DLC power is required. | First run hollow-victory state / second run true-death state. |
| `ch7_s08_return_to_town` | Town sequence | The same streets display who was lost or saved. | Tavi records the return, the blacksmith admits what cannot be repaired, 伊萊 refuses to overstate the victory, and every absence remains visible. | Frey/Tavi signal together, Mia welcomes a return without injury, elder/伊萊 speak the shared-responsibility record, the blacksmith places a household repair before weapons, and Lorne exposes the ledger. | Every core town NPC receives an action, line, or deliberate absence that completes the owned arc. | Ending montage begins with explicit endpoint performances rather than summary-only closure. |
| `ch7_s09_first_or_second_epilogue` | Ending-specific scenes | The run's emotional contract closes. | Tragedy memories and `未竟的弒王` lead to the surviving-Demon CG and `我記住你了，凡人。` | Ailo later leaves voluntarily; an unsigned flower letter confirms life; clean mountain wind replaces the black pulse. | No material reward for Ailo; one showcase prize for Vesper route. | First ending unlocks second run; true ending closes base campaign. |

### Character Placement And Side-Story Matrix V1

The protagonist remains a player vessel and appears wherever the playable scene
requires. This matrix does not create a fixed protagonist portrait, biography,
or personality dossier.

| Character | Entry And Early Function | Middle-Chapter Movement | First-Run Exit / End | Second-Run End | Owned Side Stories And System Links |
| --- | --- | --- | --- | --- | --- |
| Village elder | Chapter 1 civic anchor; sends player to 伊萊 and limits unsafe town access. | Ch2 evacuation ledger exposes the twenty-year pattern between him and 伊萊; Ch3 recognizes Kaedren's formation; Ch4 coordinates evacuation; Ch5 reconstructs expedition and plans solitary departure. | Leaves before dawn at Ch5 close, dies at seal scar in Ch6, body found before dragon battle. | Stopped at town gate, gives shard alive, remains civic anchor, and explicitly asks the true-ending record to say he was stopped and finally agreed to share responsibility. | `Patrol Soles`, `Ledger That Would Not Close`, `Expedition List`, `Outside The Seal Scar`; town-state authority and dragon proof. |
| 伊萊 | Chapter 1 route investigator and handbook owner. | Ch2 Lich/name records and private friendship with the elder; Ch3 command identification; Ch4 terrain timing; Ch5 four-front, handling-summary, shard-contraction, and expedition reconstruction. | Compresses four accurate separated-residue records into an unscoped `標準二格固定可安全處理` field line. Mia's death leaves that word in his handwriting beside the broken forceps; later he loses the elder and writes the first ending without claiming more than can be proven. | Reopens the source pages, refuses unsafe generalization, supports Mia's survival, helps stop the elder, and closes by recording that the town finally stopped making one person answer for everyone. | `Name Under The Herb Basket`, `Ledger That Would Not Close`, `Shadows Still Count Names`, `After The Ratchet`, `Expedition List`, `Glimmer Reveals The Core`. |
| Mia / 米婭 | Saves the protagonist in her private herb workroom before town introduction; owns no shop. | Ch2 family record and market prescription authorization; Ch3 treats the concealed shadow wound and later sees the protagonist return before it worsens; Ch4 countergear research; Ch5 Elemental Lord shard surgery. | Removes the shard and saves the protagonist, then dies when fixed-pressure forceps crush it in her grasp. Her workroom and final relationship tile remain; baseline market medicine continues. | The remembered ratchet click opens a pressure-free procedure. She survives, accepts shared protection, changes the inherited workroom, and completes the romance when the protagonist returns without an injury. | `Bitter Bottles`, `Name Under The Herb Basket`, `Fourfold Countergear`, `After The Ratchet`; recipe authorization, patient records, and town relationships only. |
| 芙蕾 | Appears at South Gate in Ch1 as ordinary patrol flag bearer. | Ch2 tracks who returns; Ch3 covers Tavi's unmeasured rear marker as part of their ordinary work; Ch4 evacuation places her at the fatal route decision while the protagonist is physically isolated. | Dies holding the flag at Gray Ridge; later appears only through returned object and town absence. | Tavi's measured rear light lets her remain at the front; she survives, understands the elder's fear of watching others leave, and shares route duty without surrendering courage. | `Patrol Soles`, `Lamp Oil In Fog`, `Flag And Lamp`; South Gate, morale, route readability, future Frey CG. |
| 塔維 | Seeded behind Frey's Ch1 gate scene as practical lamplighter. | Ch2 maintains reopened route lights; Ch3 repairs the front marker in both runs, leaves the rear measurement unfinished in the first, and physically completes it in the second; Ch4 tests whether the prepared rear marker can be lit under real danger. | Freezes, survives Frey's death, becomes hollow but functional through Ch5-7, and lights the final bad-ending gate lamp. | Acts while afraid, saves Frey, remains an ordinary lamplighter, and signals beside her in the true ending. | `Lamp Oil In Fog`, `Flag And Lamp`; night-route safety, `rear_marker_ready`, and the run-specific rescue condition. |
| Blacksmith | Ch1 Cold Forge reopens basic repair and makes equipment pressure human. | Ch2 undead preparation; Ch3 shadow fittings; Ch4 places evacuation fittings before new weapons and handles flag/lamp returns; Ch5 modifies the surgery tools and completes anchor housings. | Survives as town-temperature gauge; after the false victory he values the protagonist's return but admits the day's human losses cannot be repaired. | Living cast preserves his loud warmth; he resumes full forge rhythm and places a leaking pot before the hero's weapon because ordinary repair is his proof of victory. | `Cold Forge Smoke`, `Shadows Still Count Names`, `Flag And Lamp`, `Fourfold Countergear`, `Forge Contracts`, `Glimmer Reveals The Core`. |
| 艾洛 | Visible but unexplained in Ch1; searches scraps and route sounds. | Ch2 separates the useless dye flower from market packing; Ch3 mistakes commands for road fragments; Ch4 hears a lower road and names the missing whistle; Ch5 recognizes its sound. | Steals whistle after dragon war, opens old road, dies unseen near mountain; no body or letter. | Approached before theft, accompanies player, witnesses Neelu memory, survives, later leaves voluntarily and sends unsigned flower. | `Echo Whistle`, `Flower At The Echo's End`; old-road access, memory scene, achievement without material reward. |
| 維斯珀 | Absent from early broken town; first appears through Ch3 showcase temptation. | Ch4 directly prices Frey's death or the fear created by her near-loss; Ch5 converts Lorne's repeated interference into a settlement; Ch6 forces the wager. | Cheating exposed but escapes; remains an unresolved predator in the hollow ending. | Current-run loaded set is exposed; he loses from guest position and is collected by the unnamed creditor; no redemption. | `Showcase Glass`, `Loaded Dice`, `Blank Collateral`; ticket pools, display case, contract removal, one prize choice. |
| 洛恩 | Enters in Ch3 as polished dealer and compromised casino operator. | Ch4 refuses a private table in front of Vesper after Gray Ridge, making his resistance visible and costly; Ch5 invokes the witness clause as Vesper tightens his contract. | Saved in Ch6; gives Loaded Dice after Vesper escapes; survives with guilt and watches the empty owner door. | Marks the loaded set, survives collection, opens the display case, publishes the ledger, and operates transparent ticket games only under oversight. | Casino table scenes, dealer rescue, loaded-dice proof, post-Vesper system continuity. |
| 妮露 | No living present-day entry. Exists as broken nouns and sensory fragments in Ailo's Ch1-6 speech. | Her dye-mending work, flower, and promise remain deliberately incomplete. | Never appears in first-run explanatory form. | Appears only in Ch7 memory as a mountain-village dye-mender who gathers seasonal dye plants as part of the same craft, calls Ailo by name, receives his grief, and repeats the ordinary promise. | `Flower At The Echo's End`; memory and future CG only, no ghost guidance or system shop. |
| `elder_dragon` | Environmental heat, route closure, and records seed it from Ch1-5 without a speaking portrait. | Ch5 expedition evidence reframes dragon blockade; Ch6 is its only direct chapter. | Warns once, fights, and is erased with the local seal-keeping clan; containment collapses. | Judges current action, withholds attack without trust or passage grant, survives, and holds pressure during final execution. | `Outside The Seal Scar`; Boss art doubles as dialogue presentation. |
| Demon King Helsarn / 魔王赫爾薩恩 | Physical cause remains hidden behind symptoms; no direct speech Ch1-6. | Its pressure creates roots, dead routes, shadows, terrain movement, and elemental convergence without turning every human evil into its plan. | Combat body falls; surviving post-credit body speaks `我記住你了，凡人。` | Resets without run memory; body, echo, and land survival are severed by preparation and it dies without redemption. | Final Boss, first false victory, second true execution; no base light/Void dependency. |
| Merchant | Enters with the first returned caravan at the end of Chapter 3. | Reopens finite public stock in Ch3, supplies countergear inputs in Ch4, and supports forge contracts in Ch5. | Remains functional in both endings; reacts to road losses and owns no mandatory mainline arc. | Same function with safer supply state. | `Empty Crates` establishes his absence and delayed stock; `Forge Contracts` uses his later supply role. An optional long story may deepen his public-supply ethics without promoting him into the mandatory cast or requiring a supply captain. |
| Black-market trader | Enters as a controlled Ch3 contact after casino/route pressure. | Confirms one Blank Collateral sale and can provide risky shadow-adjacent stock without owning Vesper's crime. | Survives and remains indifferent after Vesper escapes. | Contract source is closed after Vesper collection; trader still has no duplicate blank contract. | `Blank Collateral`; optional second-run creditor reveal only, with later DLC continuation. |

Reserve cast placement:

- `supply_captain`, `rumor_broker`, `old_miner_bran`, `tinker`, and
  `accountant_marlo` receive no scene, side story, service dependency, portrait
  requirement, or dialogue obligation in this draft. `apothecary_assistant` is
  removed from the dependency graph rather than held as continuity scaffolding.
- Ash Baron and the expedition supreme commander receive clues only inside the
  mandatory 66 scenes. Their optional second-run external stories are designed
  separately and cannot be inserted as missing mainline chapters.

### Mainline Character Minimum And Optional Deepening V1

Status: `accepted_direction`. Core characters must be fully understandable from
the mandatory 66-scene screenplay. Optional side stories may make the player
closer to them, but cannot explain a death, rescue, betrayal, route key, or final
choice that the mainline failed to establish.

| Character | Mandatory Mainline Ownership | Optional Side-Story Deepening |
| --- | --- | --- |
| Village elder / 伊萊 | Their opposite sides of the old gate, the danger of solitary responsibility, the empty-chair payoff, the Chapter 5-6 divergence, and their spoken true-ending answer. | Civic routines, resident notices, old-friend irritation, quiet meals, damp-paper humor, and additional memories that do not supply expedition proof. |
| Mia | Rescue, family wound, delayed wound report, voluntary medical return, Chapter 4 fear, operation, death/rescue, and final invitation without an injury. | Workroom routine, romance, ordinary rest, recipe research, and relationships not needed to discover the pressure-free procedure. |
| Frey / Tavi | Flag/lamp workplace introduction, Tavi's repeated front-position habit, Frey covering the unmeasured rear marker, the second-run measurement, Gray Ridge separation, death/rescue, aftermath, and final shared signal. | Childhood mist, patrol banter, route-marking habits, friendship, and humor that does not own the wind-guard rescue condition. |
| Blacksmith | Civilian-first forge choice, object-based care, flag/lamp aftermath, surgery-tool responsibility, anchor housings, and both ending performances. | Household repair stories, blunt humor, resident relationships, and forge life that does not gate required equipment progression. |
| Ailo / Neelu | Recurring flower, road, and whistle fragments; theft/accompaniment; old-road operation; fatal route inversion; memory; survival result; and unsigned flower. | Scrap sorting, strange daily behavior, tenderness, and second-run reinterpretations that reveal no required road instruction. |
| Vesper / Lorne | Showcase temptation, Chapter 4 trauma-targeted offer and refusal, witness settlement, loaded-die proof, escape/reversal, collection, restitution limit, and public ledger ending. | Public-floor patrons, Lorne's smaller acts of guilt, Vesper's varied temptation methods, and casino life that does not hide proof needed for punishment. |

The skip test is binding: a player who ignores every optional character story
must still understand each core NPC's identity, contradiction, decisive choice,
and two-run endpoint. Optional completion should increase affection, anger,
grief, or intimacy, not basic comprehension.

Reward assignment is explicitly deferred. First lock each optional story to a
real map revisit, town place, or dialogue function; only then choose relationship
records, stock changes, items, equipment, currency, or other rewards.

### Chapters 1-3 Pacing And Lived-Town Review V1

Status: `complete_pending_user_review`. This review does not add scene ids,
named residents, service NPCs, locations, rewards, or asset obligations. It
uses ordinary props, distant resident silhouettes, and the accepted cast inside
the existing twenty-eight Chapter 1-3 scenes.

The early-game rhythm is fixed as `damage -> one useful return -> ordinary use
of that return -> next pressure`. A facility is never considered restored only
because an action surface opens. The following town scene must show what a
resident can now do that was impossible before.

| Chapter | Town Life Before Progress | Visible Recovery | Character And Relationship Work | End Pressure |
| ---: | --- | --- | --- | --- |
| 1 | Shared water, reserved sickbeds, tied doors, an empty return board, a cold forge, and unusable stalls establish scarcity without a lore speech. | The gate records one real return, the forge first repairs household objects, and Mia can authorize a prescription even though no supply exists yet. | Mia rescues and rechecks the protagonist; elder, Ailo, 伊萊, Frey/Tavi, and blacksmith enter one at a time through the route the protagonist physically walks. Nobody receives an introductory roll call. | Empty crates and a broken delivery rope turn the modest victory into Chapter 2's supply problem. |
| 2 | Recovered crates are empty and obsolete instructions still move cargo and dead people along the wrong route. | Names regain context and Mia authorizes a medicine formula, but the closed stalls, empty bottles, and waiting residents make the missing supply route visible. No merchant or transaction opens yet. | Mia's father remains honestly missing. The protagonist helps her sort leaves and notices that every passing footstep still draws her eyes to the door. | Human inspection spacing at the north checkpoint turns incomplete travel into a question about the old expedition. |
| 3 | The town can now prepare honestly, but shadow equipment, private contracts, and the casino offer faster power. | The forge, market, gate lamps, records, and Mia's care form one modest working network. Their limited light is contrasted with a casino that appears to have no shortage. | Mia's concealed-wound conflict becomes mutual when the protagonist names her own self-neglect; before the chapter closes, the protagonist returns to her voluntarily and reports the next wound before being discovered. | Stone movement interrupts the town at the moment honest preparation and seductive shortcuts are both available. |

The Chapter 1 cast density is intentional but controlled. Mia enters through
rescue, the elder through civic responsibility, Ailo as an unanswered street
image, 伊萊 through evidence, Frey and Tavi through departure, and the blacksmith
only after damaged equipment returns. Later chapters deepen these functions;
Chapter 1 does not explain their complete histories.

Life-centered side stories remain character consequences, not detached errand
padding. `Bitter Bottles`, `Cold Forge Smoke`, `Name Under The Herb Basket`,
`Ledger That Would Not Close`, `Lamp Oil In Fog`, and the Mia wound conflict all
change a relationship, public routine, route state, or later tragedy condition.
Small humor comes from the speaker's personality and work habits, never from
mocking grief or suspending the crisis.

### Scope Deferred To The Next Round

Current follow-on scope after the 66-scene foundation:

7. Dialogue presentation is being specified from reusable backgrounds,
   transparent half-body expression layers, five stage positions, and desktop
   playback controls. Final art remains deferred until story locks.
8. The complete normal/hidden achievement catalogue and UI presentation beyond
   the six story-memory conditions remain deferred.
9. Second-run external Boss story design is paused at its recorded boundary.
   Resume only after first-run story, systems, and required art are complete;
   special-region runtime, combat, rewards, and art remain deferred.
10. The scene, run-state, chapter-region, town, and seven-quest foundation is
    implemented. Reward, inventory, achievement, asset, and encounter migration
    still follow map-function review.

### Second-Run True-Kill Mainline

The additional route is linear and mandatory after `未竟的弒王` activates.

1. `未竟的弒王` makes the Moon Moss route meaningful. Defeating the Blood Moon
   Stag yields the intact Life Seed, whose living pattern becomes the body
   anchor. It has no Mia-rescue function.
2. The remembered false victory makes the Drowned Oracle's trapped voice
   relevant. Defeating it yields the Ancient Rune, which the scholar identifies
   as an echo-binding form.
3. The Thorn Witch route yields Forest Essence through a dangerous confrontation
   or trial. Combined with the mainline Glimmer Shard, it produces a revealing
   medium that can distinguish the Demon King's core from the mountain terrain.
4. The blacksmith does not forge a new legendary sword. He builds three plain
   anchor housings so any weapon class can finish the battle. This avoids making
   every special story reward a sword.
5. During the final battle, the Life Seed returns stolen vitality to the land,
   the Ancient Rune pins the escaping echo, and refined glimmer exposes the core
   for the player's ordinary equipped weapon to destroy. `elder_dragon` holds the
   broad pressure outside.

The base true ending therefore depends on understanding and correct containment,
not on importing full light power. Light and Void remain stronger optional
second-run external affinities beyond the mandatory shadow/glimmer ceiling.

### First-Run Ending Staging

1. The Demon King's combat body falls and the game presents the victory as real.
2. The protagonist returns to town. Bells or crowd noise acknowledge the kill,
   but the camera moves through absences rather than celebration alone.
3. Closing order:
   - Tavi lights the South Gate lamp beneath Frey's lowered or repaired flag.
   - Mia's private herb workroom remains arranged as her mother left it. A
     cold cup and the relationship record `最後一頁` replace any empty-shop shot.
   - The elder's chair and the scholar's unfinished record remain in the civic
     room.
   - The blacksmith works without jokes and stops after one hammer strike.
   - The casino owner's chair is empty; Lorne watches the door Vesper used.
   - Ailo's street place is vacant and no flower letter arrives.
4. The result screen replays the five tragedy achievements as short sensory
   memories, not a score penalty. `未竟的弒王` appears last.
5. Credits or the first ending title appear.
6. Post-credit full-screen CG: the apparently destroyed Demon King lies charred
   and broken at the fall site. One hand moves. Black pressure continues beneath
   the skin; an eye opens.
7. Final line direction: `我記住你了，凡人。`
8. Cut to black. The second run and its achievement-memory interventions unlock.

### Second-Run Ending Staging

1. The true final battle completes all three execution steps. The Demon King
   cannot retreat into body, echo, or land. Its last recognition line is brief;
   it receives no redemption speech.
2. `elder_dragon` remains outside the narrow road and continues containment. It
   does not thank humanity or become an ally. Its final acknowledgment can be no
   more than: `這一次，你沒有碰那道線。`
3. Ailo survives the flower-field memory. He does not settle into a tidy town
   role. After the crisis he leaves voluntarily to discover what remains of his
   own life.
4. Town return order:
   - Frey's flag and Tavi's lamp signal together at the South Gate.
   - Mia welcomes the protagonist without requiring an injury, lets another
     person help reset the workroom, and opens the long-closed window.
   - The elder and scholar archive the scar shard with an honest account of the
     expedition rather than a heroic legend.
   - The blacksmith's full hammer rhythm and bad equipment joke return.
   - The display case chosen in Chapter 6 remains visibly empty; the player has
     already received one grand prize before the final route. The remaining
     prizes stay visible rather than turning into generic loot.
   - The casino reopens later only as an odds-visible ticket game without soul or
     debt contracts.
5. Several days later, an unsigned envelope reaches town. It contains the exact
   flower emphasized in Ailo and Neelu's memory. There is no written message.
6. The protagonist understands that Ailo is alive somewhere. The achievement
   `回聲盡頭，花仍會開` resolves without a material reward.
7. Final town image: evening light, a living gate signal, forge sound, open civic
   room, and ordinary movement. Recovery has begun; the past is not restored.
8. Final mountain image: the flower field moves in clean wind. There is no black
   pulse and no Demon King voice.

### Runtime Foundation And Remaining Resource Impact

The scene, run-state, town, quest, and chapter-region foundation now uses direct
replacement rather than compatibility fallbacks. Remaining resource work must
follow these constraints:

- Use achievement flags as the only cross-run persistence system. Do not add a
  warehouse keepsake category or carry any physical key item across reset.
- Rework `loaded_dice` from a generic casino bonus item into current-run story
  evidence; ordinary casino balance must not depend on possessing it.
- Add mandatory second-run objective gates driven by the six memory achievements.
- Reassign `blood_moon_stag`, `drowned_oracle`, and `thorn_witch` to recognized
  second-run execution states without duplicating their images.
- Do not restore `ChapterMapFramework.js`, `QuestSpineFramework.js`, or
  `ChapterOneRoutePlan.js`; `ChapterRegionRegistry.js` now owns all seven maps.
- Remove the six reserve service characters from active screenplay placement;
  later runtime cleanup should remove visible residents and dialogue routes that
  have no approved story need rather than hiding them behind compatibility flags.
- New Boss art: none.
- New material art: none; reuse `life_seed`, `ancient_rune`, `forest_essence`,
  `glimmer_shard`, and `loaded_dice` only after their story roles are approved.
- Keep full light/Void creature and affinity implementation outside mandatory
  mainline migration. Their existing records belong to optional second-run
  external routes under current review; post-reveal tower and DLC work remains
  later.
- Future scene backgrounds: Gray Ridge causeway, Mia's workroom in opening,
  operation, first-run empty, and second-run living states, dragon warning line,
  old flower field, and final fall site states.
- Future story CGs: Frey's flag death, Ailo/Neelu flower-field memory, first-run
  surviving Demon King, and an optional true-execution climax if the final script
  proves it needs one.
- Dialogue expression generation remains deferred and uses the closed nine-
  expression vocabulary.

### User Review Gates

Accepted review areas are Chapter 4's Frey/Tavi route, Chapter 5's
Mia/伊萊/blacksmith chain, Chapter 6's elder/dragon evidence-bound non-attack,
the runtime viewpoint contract, and the Hern, Kaedren, Helsarn, Neelu, and Lorne
identities.

All formerly missing review material is now written. The following three
bundles remain completed drafts rather than accepted canon until the user gives
direct approval:

1. Chapters 1-3 lived-town pacing, Mia relationship groundwork, sequential
   character entries, and character-centered life beats.
2. Vesper/Lorne temptation, physical Loaded Dice proof, escape, seat reversal,
   contract collection, and Lorne's supervised restitution boundary.
3. Chapter 7 Ailo/Neelu memory and survival, Demon King false victory and true
   execution, both endings, and the final town-return order.

No causality section remains unwritten. Exact scene and run flags now exist in
the reviewable runtime foundation. Final prose polish, the full normal/hidden
achievement catalogue, external-region implementation, post-reveal DLC design,
rewards, and art remain subject to later review and map-function allocation.

### Runtime Foundation Status - 2026-07-11

- `StorySceneRegistry.js` contains all 66 scenes and the closed nine expressions.
- `StoryActors.js` records nine core mainline character contracts: introduction,
  decisive scenes, and visible first/second-run endpoints.
- `StoryStateContract.js` and `StorySceneManager.js` implement achievement-only
  cross-run memory and clear current-run fates before the second run.
- `ChapterRegionRegistry.js` binds every map-stage scene exactly once across seven
  handcrafted regions.
- `Quests.js` contains no mandatory chapter wrappers. The seven-chapter mainline
  is derived directly from the 66-scene registry. It currently owns the approved
  guild tutorial commission and six Chapter 1 optional runtime commissions;
  future optional stories enter only after their existing production gates pass.
- `OptionalSideStoryRegistry.js` keeps 33 skip-safe personal stories (short,
  medium, and long for every recurring town character with an accepted runtime
  profile) plus six ensemble shorts. Their
  chapter placement, reward identity, and derived-resource needs passed user
  review on 2026-07-19. They remain non-playable until formal dialogue, assets,
  discovery interactions, runtime records, and end-to-end validation are done.
- Runtime implementation does not make every line immutable. User story review
  may still revise a scene; the generated registry must then be recompiled and
  validated rather than patched through an alternate story path.

## Master Character Register V2

This register is Stage 1 of the master screenplay build. It collects accepted
character canon before chapter placement and scene writing begin. It does not
lock chapter numbers that are still under discussion.

### Character Construction Standard

Every recurring story character must eventually define all of the following:

- Inner world: core fear, core desire, and personal values.
- Past: the experience that formed the character's present behavior.
- Character arc: the difference between who the character is at the beginning
  and who they become by the end of each run.
- External expression: appearance, clothing, habitual movement, speech rhythm,
  vocabulary, and character-specific humor.
- Inner contradiction: two incompatible things the character wants at once.
- Relationship web: at least one relationship that does not exist only through
  the protagonist.
- Off-screen life: what the character is doing when the player is elsewhere.
- First-run surface and second-run reading.
- Entry, absence, exit, survival, death, disappearance, or role change.
- Story-system link: what route, service, object, town state, or gameplay result
  makes the character's story visible in play.

During the later master-timeline pass, every chapter state for a recurring
character must record location, immediate goal, known information,
misunderstanding, physical/emotional condition, current relationships, visible
action, off-screen action, and run-specific difference.

### Character-Centered Side Story Rule

Side stories grow outward from people, not from a need to increase quest count.
They may be romantic, funny, domestic, awkward, frightening, mysterious, or
quiet. They do not all need to reveal the main mystery or unlock a system.

A valid character side story should do at least one of these:

- Reveal how a character lives when the main crisis is not speaking for them.
- Change or deepen a relationship.
- Expose a desire, fear, contradiction, habit, or private failure.
- Give the town a lived event: work, food, illness, debt, celebration, rumor,
  affection, quarrel, grief, or repair.
- Reframe a later mainline choice without becoming mandatory exposition.
- Produce a local or durable consequence that the game can remember.

Humor follows the character's personality. A lighthearted character may joke in
danger; a severe character may remain severe during a peaceful meal. Do not make
the situation assign one shared voice to the entire cast.

### Cast Coverage

| Group | Characters | Current Use |
| --- | --- | --- |
| Core accepted cast | Village elder, 伊萊, 米婭, 芙蕾, 塔維, blacksmith, 艾洛, 維斯珀 | Their core identities and long-run directions are accepted below. Remaining gaps are listed rather than invented. |
| Essential supporting cast | 妮露, casino dealer | Neelu is the accepted mountain-village dye-mender; 洛恩 / Lorne is the accepted male dealer. Their remaining review belongs to Chapter 7 performance and casino-route execution, not identity selection. |
| Mainline non-human roles | Demon King Helsarn, `elder_dragon` | `魔王赫爾薩恩 / Helsarn` is the accepted display name; `elder_dragon` is the accepted dragon-clan dialogue actor and reuses its boss illustration. Their confrontation and ending performances remain under review. |
| Functional placeholders | Merchant, supply captain, rumor broker, black-market trader, old miner Bran, tinker, accountant Marlo | Runtime names, portraits, or service functions exist. Their old personalities are not accepted automatically. The old apothecary assistant has no approved service dependency. |
| Deferred cast | Tower warden; future radiant-route and tower-related cast TBD | Do not place while tower and radiant expansion remain deferred. No chapel NPC is currently approved. |

### Village Elder

- Status: `in_progress`; accepted core and fate, with name and some external
  details still unresolved.
- Public function: opening civic anchor and first trusted burden. He makes the
  damaged town feel led but not controlled.
- Core fear: sending another young person to die because the town needed help;
  watching the protagonist repeat his younger courage; discovering that caution
  only delayed the same slaughter.
- Core desire: keep ordinary people alive through tomorrow, even if survival
  requires ugly restraint rather than glory.
- Values: courage matters, but courage without time, shelter, information, and
  responsibility is not enough.
- Past: twenty years ago he was a young militia captain who advocated the joint
  expedition. The early advance created confidence; a boss-level threat then
  destroyed the force in a one-sided slaughter. He survived by chance, became
  depressed, was later left by his wife, and inherited village leadership because
  nobody else wanted the ruined civic burden.
- Inner contradiction: he once urged everyone forward and now urges everyone to
  stop; he needs the protagonist's ability while wanting to protect the
  protagonist from being used.
- External expression: elderly, restrained, plain, and slightly gentlemanly by
  habit. He uses silence and unfinished sentences. Exact name, clothing, repeated
  gestures, and body-language anchors are not yet canonically locked beyond the
  current portrait.
- Speech and humor: short practical instruction, concrete road or civic detail,
  rare weary humor, no destiny speech or polished exposition.
- Performance contract: restraint is not emotional absence. He places feeling
  behind the work: recommend safer timing, name a concrete risk, respect the
  other person's decision, then improve their chance of returning with a better
  lamp, food, equipment, or route instruction. `neutral` may carry warmth;
  `guarded` is reserved for uncertainty or old-pattern pressure, and `resolute`
  for a decision that must hold. Do not turn every pause into solemnity or every
  protective thought into a polished maxim.
- Relationship web: old friendship and asymmetric survivor guilt with 伊萊;
  civil but painful connection with Mia because her father joined his
  expedition; initially underestimated by 芙蕾, whose view of his fear changes.
- Off-screen life: manages water, shelter, wounded residents, route reports,
  missing names, and the consequences of decisions the player does not see.
- First-run arc: trusted cautious leader becomes increasingly alarmed by the old
  route pattern, leaves alone with the `seal_scar_shard`, and dies at the dragon
  perimeter when pressure from inside and sealing fire from outside cross through
  him as he tries to fit the fragment into the old break.
- Second-run arc: the player combines the expedition truth with 艾洛's Echo
  Whistle route truth, stops his departure, and receives the shard from him alive.
  His growth is accepting that responsibility can be shared without repeating
  blind heroism.
- Entrusted flame: civic survival without turning people into sacrifices.
- Story-system link: opening town state, route restrictions, elder-scholar
  evidence, dragon non-war proof chain, and town reactions.
- Unresolved: accepted name, clothing/gesture anchors, and final knowledge
  boundary regarding the Demon King. Departure, aftermath, shard evidence, and
  second-run prevention are now specified in Chapters 5-6.

### Town Scholar 伊萊

- Status: `in_progress`; accepted identity and arc, with appearance and final fate
  still partly open.
- Public function: village clerk, records keeper, and investigation partner. He
  handles letters, taxes, repair notices, route records, delivery receipts,
  funeral documents, and missing-person lists.
- Core fear: that a reasonable but outdated document will send another living
  person to die; that the protagonist will trust his page and never return.
- Core desire: make broken daily life readable enough that the living can move
  forward without erasing the missing.
- Values: incomplete records can still help when uncertainty is stated honestly
  and evidence is handled patiently.
- Past: local lifelong clerk and old friend of the elder. Twenty years ago he
  stayed behind to handle paperwork and supplies while the expedition left. He
  survived the disaster from the desk and watched names become absences.
- Inner contradiction: he must offer routes from incomplete records, yet fears
  the act of handing anyone the paper that sends them out.
- External expression: elderly, approachable, kind, a little fussy, surrounded by
  damp paper, ink, string, ledgers, and improvised bookmarks. Exact clothing and
  stable habitual gestures remain to be fixed; the old runtime version portraying
  him as a young nervous academic is rejected.
- Speech and humor: warm, patient, slightly talkative, with dry complaints about
  paper, ink, damp corners, and handwriting. He explains the basis of a clue and
  never speaks as an oracle.
- Performance contract: slight talkativeness means answering first and adding
  one useful half-step, not making every line long. He may qualify evidence,
  recall one relevant civic detail, speak while searching, notice a tangent and
  return, or correct a term for precision. `pleased` belongs to object-grounded
  welcome or humor, `neutral` to ordinary comparison, and `guarded` to evidence
  limits that may endanger a living person. Tangents without evidence or human
  texture, constant paper jokes, and rambling exposition are prohibited. As the
  first run wounds him, the extra helpful sentence and humor disappear before
  his kindness does.
- Relationship web: old friendship with the elder; quiet knowledge of Mia's
  father in the expedition records; investigation partnership with
  the protagonist.
- Off-screen life: re-files incoming evidence, compares ordinary documents,
  writes notices, answers residents, and notices which civic routines have
  stopped.
- First-run arc: begins as safe, useful support. He correctly records four
  routine elemental residues gathered separately by route crews before the
  convergence survey, then compresses their common result into the
  field line `標準二格固定可安全處理` without preserving `分離樣本` beside the
  conclusion. The line is accurate inside its evidence and dangerously broad
  outside it. Mia's death leaves `安全` in his handwriting beside the broken
  forceps. He is not the sole culprit, but his ordinary paperwork removed one
  reason to question the unprecedented combined shard. His jokes disappear and
  his hand slows. He spends the night rebuilding the page scope and therefore
  notices the elder's departure too late, yet keeps working and later refuses to
  describe the Demon King as more dead than the evidence proves.
- Second-run arc: the protagonist's remembered ratchet click makes him reopen
  the routine source pages before the operation. He states that they prove only
  separated-residue safety, refuses to sign the generalized conclusion, records
  a fresh current-run combined-residue test with its scope on the same line,
  supports the pressure-free procedure, finishes the record early enough to
  notice the elder's preparations, and archives the expedition truth without
  pretending the page knew first.
- Entrusted flame: keeping ordinary human traces readable.
- Story-system link: traveler handbook, route evidence, encyclopedia framing,
  expedition list, Mia's shard-analysis chain, and dragon-proof
  interpretation.
- Unresolved: final visual details, final fate after the true ending, and an
  approved personal relic if the finished screenplay proves one is needed.

### Mia / 米婭

- Status: `accepted`; the detailed dossier is authoritative for scene writing.
- Age and appearance: 25. Reuse
  `src/assets/images/art/characters/portraits/herbalist.webp` until the later
  layered-expression pass.
- Public function: healer and recipe researcher working from the private
  `米婭的藥草工作間` behind her residence. The workroom is a story location, not
  a clinic, public apothecary, shop, or transaction counter.
- System boundary: she has exactly two game-facing functions: research recipes
  that authorize medicine stock in the market, and provide character stories,
  patient records, and town-relationship events. She does not buy, sell, charge
  for healing, diagnose statuses through a service menu, identify materials, or
  own the market's medicine inventory.
- Core fear: watching another important person die beside a bed while her hands
  and knowledge remain insufficient.
- Core desire: save everyone she can reach and turn each preserved life into an
  answer to childhood helplessness.
- Values: care is a repeated decision, not sainthood. Her final belief expands so
  accepting help and protecting the caregiver are part of care.
- Past: her father joined the expedition twenty years ago when she was five and
  never returned. Her mother, the village healer, trained her before declining
  and dying when Mia was fifteen. Mia inherited the private workroom and
  has ten years of practical experience when the story begins.
- Inner contradiction: she asks the protagonist not to spend life carelessly
  while treating her own life as the most expendable resource in the room.
- External expression: gentle without fragility, tired, attentive, and exact
  around wounds. Warm water, bitter herbs, glass bottles, folded cloth, and the
  pause before touching an old scar carry more emotion than speeches.
- Speech and humor: warm, observant, medically concrete, and direct when someone
  is hurt. Affection appears through care, anger, pauses, and relief. She may joke
  softly because of who she is, not because a scene requires comic relief.
- Performance contract: she normally moves from observed condition, to one
  manageable instruction, to a reliable recovery threshold, then lets water,
  cloth, medicine, touch, or a domestic action carry unspoken care. Reassurance
  must be supported by symptoms; avoid repeated `沒事的`, `不要怕`, and promises
  that everything will improve. `soft` requires danger to have receded,
  `pleased` requires measurable improvement or treatment-grounded humor,
  `guarded` requires an unexplained symptom, and `resolute` is procedural focus.
- Relationship progression: Chapter 1 patient and healer, followed by one return
  check; Chapter 2 shared family wound and quiet work while Mia watches passing
  footsteps; Chapter 3 mutual conflict after the protagonist hides an injury and
  names Mia's self-neglect, followed by one voluntary honest return; Chapter 4
  mutual fear becomes visible after Frey's death; Chapter 5 affection is clear
  but remains unconfessed before the operation. In the second-run return she can
  say, `下次回來，別再拿傷口當理由。`
- First-run fate: the Elemental Lord's death burst drives an intact four-element
  shard between the protagonist's ribs near a major vessel. Mia asks what is
  known about post-extraction behavior; only the four routine separated-sample
  records exist, and no tested alternative can save the patient in time. She
  deliberately chooses the lowest known fixed pressure, removes the shard, and
  says `好了。你回來了。` The shard contracts after extraction; the standard
  forceps ratchet crushes it in her grasp, and the point-blank four-element
  release kills her immediately.
- Second-run correction: achievement memory preserves the ratchet click. A
  current-run test removes the ratchet, uses a flexible spider-silk loop to spread
  force, and receives the shard in purified slime gel. The same injury and
  operation occur; the shard remains intact and Mia survives.
- First-run aftermath: the workroom remains accessible as a quiet relationship
  location. Baseline market medicine continues because transactions and stock do
  not belong to Mia. `藥師手記` is not an item; only the relationship tile
  `最後一頁` quotes its last line: `醒來後先給他水。別讓他立刻起身。`
- Second-run aftermath: Mia opens the long-closed window in her mother's room,
  delegates work, and accepts care. The final relationship tile is
  `沒有傷也能回來`: `今天沒有新增病歷。她只多準備了一只杯子。`
- Achievement pair: first run `醒來時，水已經涼了`; rescued second run
  `醒來時，水仍溫著`.
- Entrusted flame: care that includes the self.
- Story-system link: recipe authorization, market medicine availability, patient
  records, town relationships, four-element shard evidence, and romance.
- Prohibited regressions: no solo herb-gathering death, Moon Moss cure, Life Seed
  rescue, replacement apothecary, physical inherited notebook, magical sacrifice,
  or delayed untreated wound. Do not make 伊萊 or the blacksmith reckless killers
  or sole culprits; 伊萊's unscoped summary and the blacksmith's standard-tool
  choice remain real, shared causal contributions made from limited evidence.

### Standard Bearer 芙蕾

- Status: `accepted`; Chapter 3-4 route, two-run fate, emotional progression,
  and elder payoff are approved. Full visual specification remains deferred.
- Public function: young South Gate patrol flag bearer in a makeshift village
  defense, not an elite soldier.
- Core fear: losing the return direction and discovering that people were left
  outside without anyone visibly waiting for them.
- Core desire: become the sign that tells frightened or lost people that home has
  not disappeared.
- Values: someone must keep direction visible even when they cannot defeat the
  danger themselves.
- Past: as children, she and 塔維 became lost in the mist. She was afraid but kept
  him moving until a distant patrol flag led them home. That ordinary rescue
  became the belief behind her adult role.
- Inner contradiction: she wants everyone to return together, but habitually
  stands in front and carries danger alone; she dismisses the elder's caution
  until she must watch someone she loves step into danger.
- External expression: young, direct, energetic, friendly, and visibly tied to a
  plain weathered South Gate patrol flag carrying the village emblem. Exact hair,
  clothing, body type, repeated gestures, and final art anchor remain to be
  confirmed; old northern-war and broken-standard biography is rejected.
- Speech and humor: brief encouragement, practical gate or watch instructions,
  youthful confidence, light teasing when trust permits, no formal military
  rhetoric.
- Performance contract: strangers receive friendly, businesslike registration
  and necessary route warnings; familiar travelers may receive an immediately
  understandable complaint; only trusted companions are teased about harmless
  repeated habits. Injury, death, disappearance, trauma, Tavi's fear, and the
  elder's old defeat are never jokes. All humor stops under real danger.
  `neutral` owns public duty, `pleased` a safe familiar exchange, `soft` private
  relief or admitted dependence, and `resolute` an active hazard requiring
  immediate action.
- Relationship web: childhood dependence and unspoken affection with 塔維;
  comradeship with the protagonist; youthful underestimation of the elder;
  physical flag repairs can connect her naturally to the blacksmith.
- Off-screen life: holds gate shifts, passes or stores the shared patrol flag,
  checks who left and who returned, and tries to keep the thin defense from
  looking abandoned.
- First-run arc: naive courage becomes real sacrifice at the Gray Ridge causeway.
  塔維 freezes; the protagonist is locked at the central civilian footbridge;
  she takes the fatal center position, fixes the flag as visible direction, and
  dies after the last evacuee crosses.
- Second-run arc: after 塔維 personally measures the rear marker, he acts first
  while still afraid. She remains at the front flag, survives, and tells the
  elder that seeing 塔維 in danger made her want to call him back. Her courage
  becomes shared rather than solitary.
- Entrusted flame: direction.
- Story-system link: South Gate state, route safety, fog readability, patrol flag,
  watchposts, morale, and 塔維 rescue condition.
- Unresolved: full visual design, exact flag/clasp damage after the first run,
  later gate dialogue, and whether a shared relic is eventually approved.

### Lamplighter 塔維

- Status: `accepted`; Chapter 3 rehearsal, Chapter 4 failure/rescue, and core
  admission are approved. Visual design and final ordinary town duty remain
  unresolved.
- Public function: ordinary patrol lamplighter and route-safety support, not a
  heroic fighter or mystical light bearer.
- Core fear: immediate mortal danger, the old mist, and the moment his body may
  fail to move when someone depends on him.
- Core desire: stand beside 芙蕾's flag with a light so she does not have to hold
  the road alone.
- Values: courage is acting while afraid, not becoming fearless.
- Past: he was lost in the childhood mist with 芙蕾. She kept him moving and the
  patrol flag led them home. He later took the lamp because she took the flag.
- Inner contradiction: he wants to stand beside her, yet his fear keeps placing
  him behind her; his dependence expresses love but also makes her carry too much.
- External expression: a timid young man, soft-spoken, practical with lamp oil,
  soot, glass, wind, hinges, and wicks. He apologizes, checks small details, and
  may physically hesitate. Exact clothing, face, body type, and repeated gestures
  remain to be confirmed; the old elderly coastal-lamplighter biography is
  rejected.
- Speech and humor: hesitant, gentle, concrete, and awkwardly honest when
  cornered. Humor must never turn him into a coward joke.
- Performance contract: hesitation concerns his right to insist, not his ability
  to observe lamp evidence. He may retreat verbally, recheck glass, soot, wick,
  oil, or wind, then state the fact he can still prove without enlarging the
  conclusion. Fear can shake his hands or slow his speech while useful work
  continues. `neutral` owns ordinary maintenance and factual reports, `guarded`
  the expectation of disbelief or an unexplained failure, and `soft` a concrete
  offer of safety or private trust. Do not turn every line into an apology or
  ellipsis. His fixed first-run freeze is a bodily threshold failure during the
  Gray Ridge crisis, not evidence that he was cognitively or practically
  incompetent beforehand.
- Relationship web: childhood bond and unspoken affection with 芙蕾; shame,
  admiration, and eventual honesty around the protagonist; practical lamp repair
  link with the blacksmith.
- Off-screen life: checks patrol lamps, cleans glass, measures oil, avoids the
  farthest dangerous points, and watches 芙蕾 take responsibilities he wishes he
  could share.
- First-run arc: avoids measuring the far marker, leaving the forge without safe
  wind-guard dimensions. He freezes when the Gray Ridge crisis becomes real,
  survives 芙蕾's sacrifice, and becomes quieter and more functional because
  grief numbs part of his fear. This is emotional hollowing, not healthy growth.
- Second-run arc: walks the old mist route, supplies exact wind-guard dimensions,
  and admits he took the lamp only to remain where 芙蕾's flag could see him. At
  the crisis he remains terrified but holds the rear marker first, saving her and
  becoming a true lamplighter without becoming a warrior.
- Entrusted flame: ordinary light carried by a frightened person who does not
  step back.
- Story-system link: night routes, fog, watchposts, ordinary lamplight, route
  safety, and the mandatory condition for 芙蕾's rescue.
- Unresolved: full visual design, final ordinary South Gate duty, any later
  route-safety system unlock beyond the rescue, and shared relic decision.

### Blacksmith

- Status: `in_progress`; accepted function and emotional arc, with name, complete
  visual identity, and service timing unresolved.
- Public function: face of equipment repair, durability, crafting, and the fact
  that preparation is a survival habit rather than a menu.
- Core fear: people returning only as abandoned equipment, or not returning at
  all; reaching the limit where metal can be repaired and people cannot.
- Core desire: see people come back with their gear, not merely keep producing
  gear for departures.
- Values: practical maintenance, honest preparation, and care expressed through
  useful work.
- Past: local villager and working blacksmith. No fixed failed-weapon trauma,
  missing-apprentice tragedy, secret relic, or personal death route is accepted.
- Inner contradiction: he cares intensely but hides care inside ridicule; the
  more the town needs warmth, the less able he becomes to disguise grief with
  jokes.
- External expression: blunt, loud when the town is alive, irritable, physically
  work-focused, and defined by hammer rhythm, damaged fittings, metal condition,
  and hands that repair what can still be repaired. Accepted name, gendered visual
  description, clothing, and stable gestures require confirmation against the
  approved portrait; old apprentice-centered biography is rejected.
- Speech and humor: insults equipment, gives exact practical advice, and reveals
  care accidentally. As losses accumulate, jokes shorten and eventually fail.
- Performance contract: he observes a gait, wound, chipped edge, loose clasp, or
  other concrete fault before speaking. He may curse the equipment, explain how
  it was mistreated, and mock the user, but attacks the method, neglect, and
  recklessness rather than the person's worth. Comparisons must be immediate and
  easy to understand, never polished symbolic constructions. `neutral` owns
  inspection, `guarded` an immediate safety concern, `pleased` a successful
  repair or safe object-grounded joke, `soft` care whose mocking cover has
  failed, and `resolute` urgent technical direction. Reusing Mia's permission as
  a forge-scene gate, joking about injury or disappearance, and replacing repair
  information with personality display are prohibited.
- Relationship web: repairs 芙蕾's flag fitting and 塔維's lamp parts; shares the
  town's bodily-survival front with Mia; respects the elder's burden and
  understands that 伊萊's paper can send people out as surely as weapons.
- Off-screen life: repairs hinges, tools, weapons, armor, flag fittings, and lamp
  frames; notices losses through objects that return without owners.
- First-run arc: survives and becomes the village-temperature gauge. During
  Mia's operation he assists with a standard tool that is correct for every
  known fragment; the broken forceps becomes the strongest object of the loss
  without making him culpable. He moves from loud mockery to painfully direct
  concern as 芙蕾, Mia, the elder, and 艾洛 are lost or disappear.
- Second-run arc: he is not rescued; the town around him is. Successful rescues
  preserve his noisy warmth. He removes the forceps ratchet, prepares the
  spider-silk loop and slime-gel receiving vessel, and remains Mia's technical
  assistant rather than becoming a surgeon.
- Entrusted flame: keep the furnace human while accepting that not everything can
  be repaired.
- Story-system link: forge repair, crafting, enhancement, durability, surgery
  tool modification, boss-return reactions, and town-state dialogue variants.
- Unresolved: accepted name and appearance, forge unlock stages, loss-order
  triggers, and whether rescues restore specific jokes or a general warm-town
  state.

### Street Beggar 艾洛 / Ailo

- Status: `in_progress`; accepted identity and route, with first-run timing and
  visual details for young 艾洛 and 妮露 unresolved.
- Public function: strange street beggar whose broken speech initially feels like
  uncomfortable local color, then becomes the human key to the lost mountain
  road.
- Core fear: the accepted dossier does not express this as a clean conscious
  sentence because his memory is damaged. His emotional terror is failing 妮露
  again and never reaching the promise place.
- Core desire: complete the broken promise to return with 妮露 to the mountain
  flower field, even though he can no longer hold the full memory together.
- Values: love, memory, and the stubborn importance of an ordinary promise.
- Past: ordinary gatherer or hunter from a mountain-side village near the Demon
  King's
  fall. He and his wife 妮露 used the old local route and promised to return to
  the flower field. During the destruction, she pushed him down a valley or
  mountain drop to save him. The fall caused head trauma; grief and survivor
  shock fragmented his memory.
- Inner contradiction: he knows he must return but cannot explain where or why;
  the action that keeps the promise also sends him alone toward death.
- External expression: present 艾洛 is ragged, abrupt, strange, tactile, and
  tender toward scraps he mistakes for 妮露. His current portrait is accepted as
  the beggar form. Young appearance, clothing before the disaster, repeated hand
  movements, and 妮露's appearance remain to be designed.
- Speech and humor: warped comparisons, rude familiarity, uncomfortable comedy,
  sensory fragments, and broken memory rather than polished prophecy. Recurring
  line direction: `我得送她去看花。`
- Relationship web: marriage with 妮露 is the emotional center; nobody in town
  understands his goal; the protagonist moves from dismissal to late witness and
  second-run companion.
- Off-screen life: searches for the Echo Whistle without understanding how to
  explain it, handles scraps as if they were 妮露, and repeatedly circles the
  mountain promise in broken speech.
- First-run arc: steals the briefly acquired Echo Whistle, opens the old mountain
  road alone, disappears, and dies off-screen. No corpse is shown.
- Second-run arc: the protagonist recognizes his intention and accompanies him.
  They use the whistle, reach the ruined promise place, witness the full memory,
  and prevent his death. He later disappears voluntarily; an unsigned flower
  letter confirms he is alive somewhere.
- Entrusted flame: the human meaning of the old mountain road and the promise
  `以後再一起來看一次。`
- Story-system link: Echo Whistle inventory event, old mountain route, run-memory
  recognition, memory-scene presentation, achievement
  `回聲盡頭，花仍會開`, and unsigned flower letter.
- Unresolved: exact young-couple facial anatomy and final CG composition. Whistle
  placement, brush-past UI, old-cliff death cause, second-run correction, and the
  white-petaled/pale-green-centered flower anchor are now specified.

### Casino Owner 維斯珀 / Vesper

- Status: `in_progress`; accepted villain core, origin, two-run fate, male
  portrait, and final three-die wager logic; reward roster and collection visual
  production remain unresolved.
- Public function: elegant casino host who presents temptation, visible prizes,
  odds, and consent as proof of fairness.
- Core fear: loss of control, loss of ownership, and being treated as collateral
  under rules he believed only applied to others.
- Core desire: discover what every person can be made to risk, then turn desire,
  debt, memory, fate, bodies, and souls into owned value.
- Values: everyone has a price; kindness is exploitable; losers have no right to
  complain about rules.
- Past: fallen financier, debt buyer, or ruined aristocratic contract man. He
  acquired a Blank Collateral Contract in a bundle of unrecoverable debts,
  followed its trail through the black market, learned its creditor line was not
  human, and deliberately commercialized it through the casino. An optional
  second-run external story may later identify that creditor as Void; the
  mandatory casino route does not.
- Inner contradiction: he calls desperate signatures voluntary and rigged games
  fair, yet refuses consent, fairness, and collection the moment he loses.
- External expression: male, elegant, expensive, composed, predatory, red-black
  clothing, wine or glass-table imagery, and an aristocratic posture. The
  accepted portrait is `casino_owner.webp`; the removed female owner image is not
  維斯珀.
- Speech and humor: measured, observant, menacingly polite, and never loud. He
  waits for others to reveal weakness. Accepted tonal anchors:
  `我從不逼人下注。我只是把他們真正想要的東西放到桌上。`,
  `輸的人，總是比較會談公平。`, and
  `公平？當然公平。每個人都有輸光的權利。`
- Relationship web: sees the protagonist as a valuable soul with exploitable
  kindness and desire; controls and compromises the casino dealer; uses the black
  market as a source but remains fully responsible for his system.
- Off-screen life: studies customers, changes offers to match private desires,
  manages debt layers, and turns display-case longing into personalized traps.
- First-run arc: notices the protagonist through showcase interest and the rescue
  of the dealer. His cheating and contract abuse are exposed, but he escapes. The
  dealer gives the protagonist the Loaded Dice as cheating evidence.
- Second-run arc: run knowledge exposes the physically weighted current guest
  set. Lorne marks rather than swaps it. 維斯珀 knowingly chooses one low-odds
  guest throw over certain surrender of the collateral pages, owner seat, and
  ledger, then stakes ownership and fate as equivalent collateral. He loses by
  chance under his own bias, accuses the player of cheating, discovers his anti-
  escape clauses now bind him, and is taken by the unnamed creditor. No
  redemption is offered. A later optional second-run external route may reveal
  the creditor's Void identity; DLC may continue its wider origin.
- Entrusted flame: none. His route leaves evidence, punishment, and a reclaimed
  display-case choice rather than a noble legacy.
- Story-system link: casino games, ticket pools, showcase inspection, Loaded
  Dice, Blank Collateral Contract, dealer witness, black-market clue, final
  wager, unnamed contract collection, optional external recontextualization,
  and one chosen showcase grand prize.
- Unresolved: eligible showcase prize roster, exact contract-collection visuals,
  and implementation timing. Dealer rescue, achievement-memory recognition,
  fixed dice game, Vesper's reason to accept, and Lorne's restitution boundary
  are now specified.

### Essential Supporting Characters

#### 妮露 / Neelu

- Accepted role: 艾洛's wife and the emotional center of the flower-field
  promise. She is an ordinary woman, not a sage, chosen guardian, royal, or lore
  source.
- Accepted occupation: mountain-village dye-mender (`山村染補師`). She repairs
  household cloth and seasonally gathers dye plants and dye flowers as part of
  the same craft. The work naturally teaches her the narrow mountain paths.
- Core desire: finish one season with enough repaired cloth and stored dye that
  she and 艾洛 can visit the flower field without gathering, carrying, or
  hurrying home.
- Core fear: every ordinary promise will be postponed until disaster makes
  `later` impossible.
- Inner contradiction: wants to leave the dangerous mountain for a safer season,
  yet loves the home, paths, and flowers that make leaving difficult.
- Values and actions: useful work, ordinary rest, warmth, practical courage, and
  gentleness. During the destruction she pushes 艾洛 down the mountain or valley
  so he survives.
- Accepted visual anchor: close in age to young 艾洛, practical mountain clothes,
  dark hair tied with faded green cloth, dye-stained fingertips, and a mending
  needle kept at the collar.
- Voice: warm, direct, lightly amused, and never prophetic. She calls him 艾洛
  naturally and can tease him for mixing edible plants, dye flowers, and trail
  scraps in one bag.
- First-run presence: only broken traces inside 艾洛's speech; no explanatory
  apparition.
- Second-run presence: full memory event. She calls him 艾洛, receives his grief
  without condemnation, and repeats the ordinary promise.
- Art boundary: exact facial anatomy remains for the later character-art pass;
  the dye-mender craft, practical clothing, faded green cloth, stained fingers,
  and collar needle are accepted anchors. Her present-day role remains memory
  only, with no town portrait, shop, or ghost function.
- Conflict warning: the unrelated blacksmith-apprentice use of 妮露 was removed
  from runtime data and must not be reintroduced.

#### Casino Dealer

- Accepted name: 洛恩 / Lorne. Scene logic remains on runtime id
  `casino_dealer`.
- Role: compromised witness, survival-minded participant, and guide into
  維斯珀's contract system.
- Appearance: male in his early forties; reuse the existing dark-skinned,
  shaved-head, scarred, black-and-gold `casino_dealer.webp` portrait. Precise
  hands reveal fear through repeated card-edge and die-weight checks.
- Origin and debt: a traveling professional dealer who tried to cheat a wealthy
  house. Vesper converted the caught loss into Blank Collateral debt and made him
  operate rigged tables against desperate customers.
- Core contradiction: wants to survive long enough to leave one honest account,
  but every shift that preserves him helps create another victim.
- Voice: polished table banter, exact hand/odds language, dry humor as a shield,
  and no jokes during collection.
- First run: the protagonist interrupts a rigged settlement that would collect
  his remaining life. After 維斯珀 escapes, Lorne gives over one Loaded Die,
  admits he helped weight it, and points toward the truth without asking
  forgiveness.
- Second run: marks the current run's loaded guest set before settlement and
  supports the host/guest rule reversal. After 維斯珀 is collected, he opens the
  display case, turns over the debt ledger, and runs only transparent ticket games
  under town oversight as restitution work, not absolution.
- Runtime warning: `賽菈` and `惡魔莊家` are conflicting scaffold names and are
  not accepted canon yet.

### Mainline Non-Human Roles

#### Demon King Helsarn / 魔王赫爾薩恩

- Accepted plot function: the final pressure whose fall destroyed 艾洛 and
  妮露's mountain village, spread the curse, and waits beyond the old route.
- Accepted historical fact: the Demon King fought a dragon in the distant past;
  the battle ended without a clean victor, and the Demon King fell near the
  mountain settlement before entering sleep or partial sealing.
- Current runtime mapping: `demon_lord_asariel`. The internal id remains for
  migration stability, but the accepted screenplay display name is
  `魔王赫爾薩恩 / Helsarn`. Obsolete display name `阿薩謝爾` is not canon.
- Accepted survival structure: its visible combat body, borrowed regional
  vitality, escaping voice/soul echo, and convergence-rooted core are separate
  failure points. Ordinary combat can destroy the body but cannot target the
  other three without current-run execution preparation.
- First-run performance: the body genuinely loses combat function. Helsarn does
  not stage a theatrical fake death; the remaining layers withdraw below every
  available target and detection rule. The post-ending line `我記住你了，凡人。`
  occurs before the world reset and proves survival to the audience. It does not
  give the reset second-run Demon King memory of the first battle.
- Second-run performance: Helsarn recognizes the Life Seed, echo-binding rune,
  and glimmer separation method as immediate threats, but never recognizes a
  prior timeline. Its line uses the mountain's age, not `輪迴` terminology.
- Accepted true-death proof: after the final strike, the rune has no voice left
  to bind, the Life Seed stops reversing stolen vitality, glimmer shows ordinary
  rock with no parasitic boundary, and the distant black pulse ceases. No single
  legendary weapon, full light, Void, external Boss reward, or DLC power
  receives credit.
- Speech posture: patient, contemptuous, economical, and hostile. It does not
  explain cosmology, plead for sympathy, praise the protagonist, or receive a
  redemption monologue.

#### Elder Dragon / `elder_dragon`

- Accepted plot function: Chapter 6 final boss, dragon-clan authority, seal-
  keeper, and the character who speaks for the dragon side during the route.
- Accepted presentation: reuse the existing `elder_dragon` full boss illustration
  for dialogue and confrontation. Do not add a separate dragon spokesperson or
  new portrait.
- Accepted motive: it holds the broad seal because the Demon King's pressure
  would destroy dragon territory. It is neither humanity's protector nor the
  Demon King's jailer by moral duty. Leaving the line to attack the core would
  open the scar before it could finish the fight.
- Accepted knowledge boundary: it knows the fall, broad containment, human-made
  scar, Demon King pressure, and that old mountain villagers used acoustic paths
  outside the seal. It does not know Ailo, Neelu, exact blind-turn sequences,
  Vesper, or private human motives.
- Accepted speech posture: short imperatives and concrete observations. It does
  not explain itself to earn sympathy, use honor-contract language, or speak as a
  friendly quest giver.
- Accepted run difference: first run, the player crosses because the pressure is
  advancing, the whistle remains unreadable, and the dragon offers only retreat;
  `elder_dragon` and the remaining local seal-keeping clan are killed. Second
  run, the shard stays outside, the weapon is placed down, a one-hole echo proves
  an outside direction, and the player does not cross during the next surge.
- Boundary: the second-run result is non-attack, not trust, forgiveness,
  alliance, permission, or a dragon-opened road. The player withdraws and still
  needs Ailo to find the old route.

### Functional Placeholder Cast

These records may retain a runtime id, portrait, service, or useful image. They
are not safe for long-form story writing until their character construction is
approved.

| Runtime Role | Existing Function | Canon Boundary |
| --- | --- | --- |
| `merchant` | Route-based stock and trade. | Personality, accepted name, background, values, and arc are not locked. |
| `supply_captain` | Supply lines, defense gear, and road consequences. | Existing lost-convoy background is scaffold only. Visibility and portrait use require later approval. |
| `rumor_broker` | Information network and elite warnings. | Existing names and stylish information-broker personality are not automatically canon. |
| `black_market` | Forbidden stock and source of the Blank Collateral Contract. | Must remain separate from 維斯珀's responsibility. Existing collector identity is not yet accepted. |
| `old_miner_bran` | Mine routes and forge materials. | Existing collapse-survivor story is usable only after a chapter need and user approval. |
| `tinker` | Tools, durability, and repair mechanisms. | No accepted story need or arc yet. |
| `accountant_marlo` | Casino records. | May overlap the dealer's witness function; do not keep both without a distinct dramatic need. |
| `apothecary_assistant` | Obsolete apothecary support. | No approved dependency remains. Do not place this role, preserve it for market continuity, or require a portrait. It may return only through a separately approved character-centered need. |

### Character Relationship Spine

| Relationship | Beginning Pressure | First-Run Movement | Second-Run Potential |
| --- | --- | --- | --- |
| Elder and 伊萊 | Same old disaster carried from opposite sides of the gate. | Their incomplete lived memory and records lead toward the seal truth but cannot prevent every loss. | Combined evidence can stop the elder's fatal departure. |
| Elder and Mia | Her father joined his expedition. Both know blame is not simple. | Civility keeps the thorn buried; the expedition list and Mia's death make the cost of silence visible. | Stopping the elder's solitary departure permits understanding without erasing the wound. |
| 伊萊 and Mia | Her father's name survives in his records; she reads bodies where he reads pages. | They identify the four fronts together. 伊萊's accurate source records become an unscoped field summary that helps make the standard forceps feel settled; after her death he finds `安全` in his handwriting beside the tool. | He reopens the source pages, names what they do not prove, and writes the current-run test with its scope intact. His paper reaches her procedure early enough to help keep her alive. |
| Mia and protagonist | Patient and healer become personally important to each other. | Affection and conflict culminate in Mia saving the protagonist and dying after the shard is removed. | The protagonist protects the operator as well as the patient; Mia survives and accepts a return that needs no wound as an excuse. |
| 芙蕾 and 塔維 | Childhood friends shaped differently by the same mist and flag. | He freezes; she takes his place and dies; he survives hollowed. | He acts while afraid; she survives and learns to share the burden. |
| 芙蕾, 塔維, and blacksmith | Flag, lamp, and the person who repairs their ordinary fittings. | Returned objects let the forge register loss physically. | Maintained objects and living owners preserve the forge's warmth. |
| 艾洛 and 妮露 | Ordinary marriage and an ordinary flower-field promise. | Broken memory drives him alone toward an unseen death. | Accompaniment restores the full memory and lets him survive. |
| 維斯珀 and dealer | Owner and compromised operator inside a rigged system. | Dealer is saved, betrays part of the house truth, and hands over the dice after 維斯珀 escapes. | Dealer turns early enough for 維斯珀's own contract to collect him. |
| 維斯珀 and protagonist | Predator studies kindness and desire as collateral. | The player exposes cheating but cannot finish the punishment. | The player's understanding turns his doctrine of fairness against him. |

### Runtime Conflict Quarantine

The following old runtime character concepts are implementation residue, not
story canon. Do not copy them into the master screenplay or use them to fill an
unspecified field.

| Runtime Conflict | Accepted Direction |
| --- | --- |
| 伊萊 as a young, pale, nervous academic who believes in perfect indexing. | 伊萊 is an elderly local clerk and warm investigation partner surrounded by interrupted civic paperwork. |
| Blacksmith defined by a missing apprentice named 妮露 and a failed-research wound. | Blacksmith has no accepted apprentice trauma; 妮露 is 艾洛's deceased wife. |
| 塔維 as an elderly coastal keeper tied to bells, tides, and a drowned family. | 塔維 is 芙蕾's timid young childhood friend and ordinary South Gate lamplighter. |
| 芙蕾 as a northern retreat survivor carrying a broken war standard. | 芙蕾 is a young local patrol flag bearer whose belief comes from a childhood mist rescue. |
| 艾洛 as a sly black-market broker who knowingly tests the protagonist. | 艾洛 is a head-injured mountain-village survivor whose apparent nonsense is broken memory. |
| 維斯珀 as a woman, gray protector, or person who might sincerely save the town. | 維斯珀 is male and deliberately evil; no redemption or noble motive. |
| Herbalist runtime names, shop behavior, shallow poison-sensitivity biography, solo gathering death, and notebook-item rescue. | The accepted character is Mia / 米婭, age 25, working in a private story-only herb workroom. She dies in the first-run four-element shard operation and is saved in the second run by a pressure-free extraction procedure. |
| `casino_dealer` names `賽菈` and `惡魔莊家`. | Both scaffold names are obsolete. The accepted identity is the male dealer `洛恩 / Lorne`. |
| Runtime names `村長奧倫`, `鐵匠布朗`, `草藥師瑪菈`, and `藥師蓮娜`. | The first two remain implementation-only names. Both old herbalist names must be replaced by accepted Mia / 米婭 during runtime rewrite. |

### Fate And Death Rules

- Do not kill a character only to raise stakes. Death must complete, expose, or
  break the character's belief in a way later scenes remember.
- Not every important character should die. Survival is not proof of moral worth,
  and death is not proof of importance.
- A saveable death requires fair first-run evidence and a second-run change based
  on understanding, relationship, or preparation rather than arbitrary item use.
- An irreversible death still needs later understanding, farewell, consequence,
  or legacy.
- Characters do not exist to sacrifice themselves for the protagonist. Any
  protection must also arise from their own love, fear, duty, debt, value, or
  refusal to abandon something.
- A character who is absent from the player's current scene still has a location,
  goal, knowledge state, and off-screen action in the master timeline.

## Dragon Non-War Bridge V1

The dragon clan should not be written as suddenly trusting the protagonist.

First-run logic:

- The dragon clan are seal-keepers around the old mountain approach, not friendly
  quest givers.
- The dragon clan do not see humans as participants in any mutual agreement. To
  them, humans are small, short-lived, self-important creatures who mistook fear
  for permission and damaged a seal they did not understand.
- Twenty years ago, the human expedition disturbed or broke part of the sealed
  perimeter. To the dragon clan, human armed groups approaching the route are a
  proven nuisance and risk.
- The village elder goes alone with the `seal_scar_shard`, trying to answer the
  old expedition's mistake by pressing the fragment into the matching break.
  This fails because a pressure surge and sealing fire meet while he is touching
  the line. The dragon does not hold a trial or choose to believe him; it treats
  one more armed human at the scar as an immediate containment event.
- The first-run protagonist can observe that dragon fire points inward, but still
  has an elder killed by that fire, an undecoded two-hole whistle, no usable
  alternate road, and the four-front pressure already traveling back toward
  town. The dragon offers only retreat and explicitly does not care how many
  humans die outside. Crossing is a defensible decision under incomplete
  knowledge, not a fake choice or sudden stupidity. War follows.

Second-run non-war conditions:

- Elder/scholar line: the `seal_scar_shard` / 封痕碎片 is physically legible.
  Human chisel strikes mark one face, dragon vitrification marks the other, and
  its broken edge matches the scar. It proves human damage and nothing about
  human virtue.
- Ailo line: his current-run reaction teaches the player to cover one hole and
  produce an echo along the seal's outside edge. It proves an alternate direction
  exists, but does not reveal the blind-turn sequence or replace Ailo's memory.
- Player action: the player stops outside the line, places the weapon behind them,
  leaves the shard outside the matching break, and does not reach across when a
  real pressure surge moves the fragment. This is observable behavior, not a
  dialogue claim.

Result:

- The dragon clan does not become an ally by sentiment.
- `elder_dragon` states that it does not trust the player. It sees only that the
  shard, weapon, and player all remain outside while the echo travels elsewhere.
  Because no trespass is occurring, killing the player would waste strength
  needed for containment.
- The dragon neither grants passage nor opens a path. It does not pursue when the
  player withdraws along the outside boundary. The same blind collapse still
  forces a return to Ailo before the old road can open.

## Seven Chapter Story Spine (Accepted Summary)

| Chapter | Level | Working Title | Boss Convergence | Suspense Function |
| ---: | ---: | --- | --- | --- |
| 1 | 1-10 | 南門以外 / Beyond The South Gate | `forest_guardian` with `ambush_mantis` as early route threat | The player proves which roads still exist and learns the woods are reacting to route damage, not ordinary monster movement. |
| 2 | 11-20 | 斷路上的藥味 / Medicine On The Broken Road | `lich` | Empty supplies and medicine demand expose a failed route; old records reveal that the dead still follow an obsolete evacuation. |
| 3 | 21-30 | 影子仍守夜 / Shadows Still Keep Watch | `shadow_commander` | Shadow enemies look less like invaders and more like orders that never ended. |
| 4 | 31-40 | 石心與灰雨 / Stone Heart, Ash Rain | `ancient_titan` | The ground, forge routes, and old structures reveal that the map itself is part of a lock. `ash_baron` remains an optional second-run external Boss outside mandatory convergence. |
| 5 | 41-50 | 元素失衡 / The Elements Lose Their Shape | `elemental_lord` | Fire, ice, thunder, poison, and craft routes stop feeling separate; old expedition truth surfaces and drives the elder's first-run death bridge. |
| 6 | 51-60 | 龍守封痕 / The Dragon Guards The Scar | `elder_dragon` | Dragon pressure reveals the old seal damage; first run becomes war, while second run earns evidence-bound non-attack without dragon trust or a granted road. |
| 7 | 61-70 | 墜落之地 / Where The Demon Fell | `demon_lord_asariel` | The final enemy waits beyond the old mountain route; the ending tests whether the rebuilt town network and second-run understanding can stand behind the player. |

## Integrated Mainline And Character Flow (Accepted Summary)

This section connects the mainline spine with long character routes. It should be
used before inventing or placing side stories, so the game does not become seven
isolated chapter stories.

Design rule:

- The main story carries the road toward the Demon King's fall.
- Character stories explain why the town can or cannot survive that road.
- Side stories should either repair a town function, reveal a missing layer of a
  character, prepare a chapter boss, or create a second-run re-read.
- A side story that does none of those things should be cut or reduced to a
  short ordinary reward.

### First Run Flow

| Chapter | Mainline Movement | Character Movement | Side-Story Function | Chapter End Pressure |
| ---: | --- | --- | --- | --- |
| 1 | The protagonist survives the opening collapse, wakes in Mia's private workroom, enters the damaged town, and proves which roads beyond the south gate still answer. | Mia saves the protagonist; the elder and scholar become the first trusted civic anchors; Frey appears at the gate; Tavi and the blacksmith are seeded as people tied to route safety and equipment pressure. | Short side stories repair immediate survival: Mia's first recipe authorization, south gate patrol, cold forge, and first route records. No apothecary shop opens. | The town is not safe, but the player understands that roads, monsters, and old route damage are connected. |
| 2 | Empty crates, medicine demand, and old evacuation evidence prove that one repaired local road is not a complete supply route. The `lich` route shows that old records and old dead do not stay quiet. | 伊萊's paperwork becomes useful but visibly incomplete; Mia's father's record deepens her family wound; the blacksmith can prepare locally while the market remains visibly empty. | Medium side stories attach names to missing supplies, prescriptions, route notices, and graves. Rewards should be authorization, information, or modest story-matched gear rather than nonexistent market stock. | The player learns that a correct-looking record can still be incomplete enough to outlive its context. |
| 3 | Shadow pressure enters around Lv24-30. Old orders, black iron, rumor routes, casino display cases, and black-market access make shortcuts tempting. | Vesper notices desire through the casino showcase; the dealer becomes a compromised witness; Ailo's first-run nonsense starts feeling less disposable; Tavi's lamp route begins. | Side stories introduce temptation and risk: casino odds, black-market receipts, shadow soldier traces, lamplight route checks. | The game asks whether the player wants stable preparation or faster, uglier sources of power. |
| 4 | Stone routes, ash pressure, and the first broad elemental instability show that the map itself is part of a lock. | Frey and Tavi's first-run route crisis lands here: Tavi freezes, Frey holds direction, and Frey dies. The blacksmith's village-temperature role sharply changes afterward. | Side stories prepare elemental countergear and make the flag/lamp route feel earned before the death scene. | Courage is proven real, but the first run shows courage alone can still leave someone dead. |
| 5 | Elemental fronts stop feeling separate. The old expedition truth surfaces through elder and scholar records while advanced forge and dungeon preparation become necessary. | 伊萊 compresses four safe separated-residue records into one unscoped handling line. The Elemental Lord's death burst embeds a combined shard in the protagonist; Mia saves the protagonist during surgery, then dies when the trusted fixed-pressure procedure crushes it. The elder recognizes the old sealed route pattern. | Long side stories establish countergear, advanced forge contracts, evidence scope, current-run fragment behavior, Mia's relationship record, and the old expedition list. | Mia's death concretely breaks 伊萊's confidence in useful paper; the elder's solitary departure then removes his oldest friend and makes the town lose its ordinary voice. |
| 6 | The dragon clan blocks the damaged sealed perimeter. First run becomes war because the player lacks proof and continues like a stronger old expedition. | The elder's aftermath yields `seal_scar_shard`; the scholar can identify what the shard means but not solve the route alone. Vesper's first-run casino route exposes loaded dice and contract abuse, but he escapes. | Side stories now carry durable consequences: dragon-perimeter proof, loaded dice, blank collateral contracts, forbidden stock, and risky preparation. | The player can win by force, but the victory feels wrong because the route was misunderstood. |
| 7 | The mountain route fails until the Echo Whistle opens the lost local path. Ailo steals it, disappears, and the old road opens. The player defeats the Demon King's combat body and receives a false victory. | Ailo's first-run truth is almost understood too late. The town network can support the final push, but first-run losses leave the ending hollow. | Side stories should be sparse and heavy: Echo Whistle aftermath, final town preparation, and mandatory glimmer interpretation. Formal light remains a second-run external hook. | The visible final boss is defeated, but the player understands that victory without understanding has left too much ruined. |

### Second Run Reframing Flow

| Chapter Window | Reframed Action | Characters Saved Or Re-read | Result |
| --- | --- | --- | --- |
| Chapters 1-2 | The player notices that route warnings, Mia's care, and 伊萊's paperwork were not generic tutorial text. | The ratchet memory does not solve anything early; it makes the player attend to ordinary tools and the distinction between a recipe record and a material-handling record. | Early town recovery becomes emotionally precise without granting false foreknowledge. |
| Chapters 3-4 | The player changes the division of work during Tavi's night route, allowing him to measure the rear marker before the flag crisis. | Tavi acts while still afraid; Frey no longer has to leave the front marker and die. The rescue follows from completed work, not from a required confession. | The south gate becomes a living proof that second-run understanding can change a fate without making the first run meaningless. |
| Chapter 5 | The player recognizes the forceps ratchet click and asks what 伊萊's field summary actually proves. He reopens the current-run source pages, rejects the generalized conclusion, joins the combined-residue test, and uses old expedition evidence to help stop the elder before he leaves alone. | Mia performs the same operation with pressure-free handling and survives; 伊萊's scoped record reaches the room in time; the elder gives `seal_scar_shard` alive. | Two losses are prevented through present-run preparation rather than inherited objects, and 伊萊 corrects the exact documentary habit that wounded him. |
| Chapter 6 | The player approaches the dragon perimeter with `seal_scar_shard`, the Echo Whistle route meaning, and a non-hostile choice. The casino route can also be reversed with the Loaded Dice. | The dragon sees that no trespass is occurring and withholds attack without granting a road; Vesper is punished by his own contract logic instead of escaping. | The second run turns two first-run frustrations into earned reversals: no dragon slaughter and no escaped casino predator. |
| Chapter 7 | The player accompanies Ailo rather than letting him vanish alone. The memory event reveals Neelu, the flower-field promise, and the old mountain road's human meaning. | Ailo survives somewhere beyond the town; Neelu's memory restores the promise without turning her into a lore machine. | The final route is no longer only a stronger march to the Demon King. It is a road understood through people, tools, and losses carried correctly. |

### Character Interlock Rules

- Elder and scholar are one truth engine: the elder carries lived guilt, while
  the scholar carries records. Neither alone should know the full answer.
- Mia, 伊萊, and the blacksmith form the shard-handling chain. Mia owns the
  operation, 伊萊 owns evidence scope, timing, and record comparison, and the
  blacksmith owns tool modification. The first run fails because four accurate
  separated-sample facts are compressed into one unscoped field rule before the
  new material behavior exists to challenge it. The second succeeds because the
  source boundary is restored and all three roles meet before surgery.
- Frey, Tavi, and the blacksmith form the route-safety wound. The flag, lamp,
  and repaired fittings should make the death or rescue feel physical.
- Ailo is the mountain-road key, not a lore oracle. His route should explain a
  human path that survived inside broken memory.
- Vesper is the temptation and punishment route. The casino should first make the
  player want rewards, then reveal what desire costs under his rules.
- The blacksmith survives as the town-temperature gauge. His dialogue should
  measure how many people the first run lost or the second run saved.

## Chapter 1 Detailed Screenplay V1

Status: `complete_pending_user_review`. This chapter uses the fixed screenplay
block format in `docs/NARRATIVE_WRITING_GUIDE.md`. Runtime flags remain
descriptive outputs until the complete screenplay is accepted.

### Prologue And Chapter 1 Information Boundary

This table is the authority for what the opening may tell the player. It exists
to stop the commission, dialogue, objective UI, and field scenes from repeating
the same exposition or leaking a later answer.

| Surface / Character | May State Now | Must Not State Yet |
| --- | --- | --- |
| Guild commission | The southern town has missed one month of tax records; two guild messengers did not return; the assignment is reconnaissance and permits retreat. | The cause of the mist, the stag's identity, the town patrols, black roots, the old expedition, or any Boss conclusion. |
| Protagonist on the south road | The road is washed out, the fog hides tracks, lesser monsters are abnormal, and the protagonist is injured. | Why the creatures changed, what the roots mean, or which later event this foreshadows. |
| Mia | The protagonist's immediate injuries, what treatment was performed, where they were found, and when it is safe to move. | A diagnosis of the whole region, the old expedition, her future operation, or why an ordinary tool will matter later. |
| Village elder | Three local patrol members did not return and their routes must be checked. | A complete theory of the threat, his private history, later sacrifice, or a claim that the new evidence repeats the past. |
| Eli | Old route records, where the patrol routes overlap, what evidence can be verified, and what remains unknown. | Answers absent from the documents, future documentary failure, or a lesson stated as a character theme. |
| Frey and Tavi | Gate registration, current road condition, last observed departure, daylight limits, and practical return procedure. | The symbolic meaning of flag or lamp, either character's childhood, future death, rescue, or relationship outcome. |
| Field evidence | Footprints, damaged objects, residue, displaced markers, monster behavior, and routes that can or cannot be crossed. | A narrator-provided culprit, motive, ecosystem theory, or final source. |

Information moves forward only when new evidence changes the next decision. A
later scene may refer to an earlier fact without restating its explanation.
Character history belongs to a scene where it changes a present choice or to an
optional character story that supplies the missing viewpoint.

### `ch1_s01_road_collapse`

- `title`: 南路沒有風
- `stageClass`: `regional_canvas`
- `background`: `south-road-broken.webp; south road outside town, broken verge, blackened roots, steep downhill shoulder`
- `worldState`: Chapter 1 opening; overcast; protagonist already wounded by abnormal lesser monsters; town remains out of sight behind the bend
- `viewpoint`: `protagonist_limited`
- `participants`: Mia enters only after the opening encounter
- `entry`: player reaches the last south-road bend with a damaged guild-issued hunting blade and torn field leathers; the event layer interrupts when the mist stops moving
- `exit`: fade through loss of consciousness into Mia's workroom
- `objective`: break through the unknown giant and reach the reported village
- `inputs`: new game or new-run Chapter 1 start
- `outputs`: opening rhythm tutorial completed; guild-issued hunting blade broken and field leathers ruined; protagonist thrown down the slope, poisoned, and found alive by Mia; workroom opening state
- `assetNotes`: use `south-road-broken.webp`; conceal the stag image as a silhouette; after the downhill impact, close the visible scene with the `eyes-closing` transition before the post-impact blackout; neither state uses a protagonist portrait

| Order | Condition | Beat | Speaker | Expression | Presentation Phase | Visual Mode | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | `pre_battle` | - | 第三天下午，南路只剩一條被雨沖窄的車轍。上一個公會路標倒在泥裡，往小鎮的箭頭被踩斷了。 |
| 2 | any | narration | - | - | `pre_battle` | - | 霧從林間壓到路面以後，我再也沒看見車輪印。偶爾有枯枝折斷，聲音都離得很近。 |
| 3 | any | narration | - | - | `pre_battle` | - | 我已經放倒三隻從霧裡撲出的怪物。公會獵刀崩了一角，皮甲左肩也被抓開；傷口沒有流多少血，手指卻越來越麻。 |
| 4 | any | narration | - | - | `pre_battle` | - | 霧停了。兩道巨角先從灰白裡抬起，接著才是比馬背更高的肩胛；牠胸前的毛被黑根黏成硬塊，每一次喘息都帶著腐葉與鐵鏽的味道。 |
| 5 | any | narration | - | - | `pre_battle` | - | 牠沒有看路。只看我。 |
| 6 | any | exit | - | - | - | - | 收起事件層，進入前導戰鬥。怪物行動先被教學鎖定；玩家依序完成主手命中、副手追擊、看見主手耐久耗盡與副手自動遞補、補上新的副武器、實際使用應急藥劑，再嘗試撤離。撤離嘗試完成後才解除鎖定，立即固定觸發斷坡衝撞。 |
| 7 | any | narration | - | - | `post_battle` | `eyes-closing` | 巨角撞上刀脊。刀身在手裡折斷，我連退兩步，腳後跟踩空了。 |
| 8 | any | narration | - | - | `post_battle` | `blackout` | 天空翻了半圈。我摔出路肩，碎石一路撞著背脊，濕土灌進領口。 |
| 9 | any | narration | - | - | `post_battle` | `blackout` | 坡頂傳來一聲嘶鳴。碎石又落了幾次，那頭怪物沒有跟著下來。 |
| 10 | any | narration | - | - | `post_battle` | `blackout` | 枯枝忽然連響幾聲。腳步很急，卻沒有亂；有人跪進濕土，先按住我伸向傷口的手。 |
| 11 | any | speaker | `herbalist` | `resolute` | `post_battle` | `blackout` | 手先放鬆。還有一片碎屑沒有取出來。 |
| 12 | any | narration | - | - | `post_battle` | `blackout` | 她撐開我的眼皮，又摸過頸側。冷水淋過傷口，鑷子碰到金屬時發出很輕的一聲。 |
| 13 | any | speaker | `herbalist` | `resolute` | `post_battle` | `blackout` | 聽得見就眨一下眼。對，就是這樣。剩下的交給我。 |
| 14 | any | narration | - | - | `post_battle` | `blackout` | 苦藥灌進嘴裡。她朝遠處喊人；我只聽見有人跑近，之後便失去了知覺。 |

### `ch1_s02_wake_under_bitter_bottles`

- `title`: 醒在藥草工作間
- `stageClass`: `town_scene`
- `background`: `working: Mia's herb workroom / opening_care`
- `worldState`: Chapter 1 morning after rescue; shelves sparse; one long-closed inner window
- `viewpoint`: `protagonist_limited`
- `participants`: Mia
- `entry`: protagonist wakes on the workroom cot; Mia is preparing water within view
- `exit`: workroom door opens toward the damaged crossroads
- `objective`: recover enough to meet the village elder
- `inputs`: completion of `ch1_s01_road_collapse`
- `outputs`: Mia relationship seed; `Bitter Bottles` opened; basic prescription research prepared but not stocked
- `assetNotes`: new independent workroom background required later; no shop counter or service UI

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 先回來的是味道：苦葉、煮過的布，還有一點蓋不住的甜膠。木杯放在床邊，水面已經不再晃。 |
| 2 | second_run | narration | - | - | 米婭正背對著我倒水。看到她轉身，我才發現自己一直沒有呼吸。 |
| 3 | any | speaker | `herbalist` | `neutral` | 醒了先別坐。左手抬給我看，慢一點。 |
| 4 | any | narration | - | - | 我照她說的抬起手。指尖仍麻，但已經能感覺到她掌心的溫度。 |
| 5 | any | speaker | `herbalist` | `pleased` | 今天看起來好多了。至少不用我提醒你怎麼喝水了。 |
| 6 | any | speaker | `player` | `neutral` | 這裡是哪裡？是你把我帶回來的？ |
| 7 | any | speaker | `herbalist` | `neutral` | 這裡是我的工作間。我叫米婭。你倒在南路的斷坡下，我和守門的人把你抬了回來。 |
| 8 | any | speaker | `player` | `neutral` | 那頭長角的怪物呢？ |
| 9 | any | speaker | `herbalist` | `guarded` | 沒有追下來。你身上的毒和金屬碎屑比較急，我先處理了傷口。 |
| 10 | any | speaker | `herbalist` | `guarded` | 傷口不深，麻痺還沒有完全退。今晚如果又發燒，立刻叫我。 |
| 11 | any | speaker | `player` | `neutral` | 藥和治療要多少錢？ |
| 12 | any | narration | - | - | 米婭把換下的染血布折好，放進一旁的木盆。 |
| 13 | any | speaker | `herbalist` | `neutral` | 先不用談錢。等今晚沒有再發燒，你能站穩了，我們再說。 |
| 14 | any | speaker | `herbalist` | `neutral` | 能走以後去十字路口。村長在等南路的消息。慢慢來，頭暈就坐下。 |
| 15 | any | speaker | `player` | `neutral` | 知道了。謝謝你。 |
| 16 | any | exit | - | - | Mia 拉開外門；控制權回到城鎮，工作間保留為故事地點。 |

### `ch1_s03_broken_crossroads`

- `title`: 回程板上的空行
- `stageClass`: `town_scene`
- `background`: existing town crossroads scene, future broken-state full background
- `worldState`: Chapter 1 broken town; forge cold; stalls empty; South Gate traffic sparse
- `viewpoint`: `protagonist_limited`
- `participants`: village elder, street beggar as a brief background entrant
- `entry`: protagonist steps from Mia's lane into the crossroads
- `exit`: elder leads the protagonist toward the civic room
- `objective`: report the south-road collapse
- `inputs`: Mia permits the protagonist to leave the workroom
- `outputs`: broken-town baseline; elder introduction; Ailo visual seed without route explanation
- `assetNotes`: crossroads broken-state background exists in principle; damaged daily life uses props and distant silhouettes, with no new resident or Ailo portrait required

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 十字路口很安靜。鐵匠鋪沒有生火，市集棚布被收在柱邊，南門旁的回程板空了大半。 |
| 2 | any | narration | - | - | 井邊排著幾只共用水桶。有人把一袋乾糧拆開，照門牌分成更小的份量；排隊的人看了一眼，沒有人多拿。 |
| 3 | second_run | narration | - | - | 我認得這條街，也認得此刻還在街上的人。我站了一會兒，直到身後有人要我讓路。 |
| 4 | any | enter | `street_beggar` | - | 一名衣衫破舊的乞丐從廢木箱後探出手，把一段爛繩貼到耳邊。 |
| 5 | any | speaker | `street_beggar` | `guarded` | 不響了。她吹過的……這條不響。路塌了。花在上面。 |
| 6 | any | exit | `street_beggar` | - | 乞丐抱著爛繩離開畫面，不等待回答。 |
| 7 | any | narration | - | - | 我還沒來得及追問，一名老人已從公務室走來。他看了看我的包紮，停在兩步外。 |
| 8 | any | enter | `village_elder` | - | Village elder 進入；公務室的門留在他身後。 |
| 9 | any | speaker | `village_elder` | `neutral` | 你是公會派來的人？ |
| 10 | any | speaker | `player` | `neutral` | 是。我在南路遭到襲擊，路邊還有一大片黑色樹根。 |
| 11 | any | speaker | `village_elder` | `guarded` | 你有看見三個巡路的人嗎？ |
| 12 | any | speaker | `player` | `neutral` | 沒有。路上只剩怪物，斷坡那裡還有一頭長角的東西。 |
| 13 | any | narration | - | - | 老人看向回程板。最下面三行只有出發時間，後面都是空的。 |
| 14 | any | speaker | `player` | `neutral` | 我得把失聯和斷坡回報公會。鎮上還有別的路能出去嗎？ |
| 15 | any | speaker | `village_elder` | `guarded` | 沒有。南路是唯一還接著外面的路。那三個人出去，就是要找出哪一段還能讓人通過。 |
| 16 | any | speaker | `player` | `neutral` | 那就是同一件事。路不通，我送不出回報；找不到他們，也沒人知道路斷在哪裡。把最後紀錄給我。 |
| 17 | any | speaker | `village_elder` | `neutral` | 伊萊管紀錄，在公務室靠窗那張桌子。舊圖只能告訴你他們原本要去哪裡，不能替你決定現在怎麼走。 |
| 18 | any | speaker | `player` | `neutral` | 我先把能確認的路找出來。 |
| 19 | any | exit | - | - | Elder 留在 crossroads；開啟公務室與伊萊的事件標記。 |

### `ch1_s04_elder_to_scholar`

- `title`: 三處最後紀錄
- `stageClass`: `town_scene`
- `background`: working civic room connected to 伊萊's damp-paper desk
- `worldState`: Chapter 1; repair notices and missing-person lists interrupt ordinary records
- `viewpoint`: `protagonist_limited`
- `participants`: town scholar
- `entry`: protagonist enters while 伊萊 is moving papers away from a damp wall
- `exit`: traveler handbook opens with three fixed unknown `?` location nodes
- `objective`: identify the three overlapping route records, then let South Gate assign the first safe survey segment
- `inputs`: south-road report
- `outputs`: traveler handbook; three-landmark objective; uncertainty rule established
- `assetNotes`: civic/scholar background may reuse one room with desk-focused staging

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 伊萊用三只杯子壓住同一張路圖。牆角受潮，墨線在南側暈成一片。 |
| 2 | any | enter | `town_scholar` | - | Town scholar 把椅上的卷宗抱到桌角，示意我坐下。 |
| 3 | any | speaker | `town_scholar` | `neutral` | 村長讓你來找巡路紀錄？ |
| 4 | any | speaker | `player` | `neutral` | 三個人沒有回來。我在南路也沒看見他們。 |
| 5 | any | speaker | `town_scholar` | `guarded` | 南路現在是什麼情況？從你還能確定的地方說。 |
| 6 | any | speaker | `player` | `neutral` | 車轍進霧後就斷了。路邊有黑色樹根，怪物比外圍密得多，斷坡附近還有一頭長角的怪物。 |
| 7 | any | narration | - | - | 伊萊從架上抽出巡線簿，又找來一張邊角受潮的舊路圖。 |
| 8 | any | speaker | `town_scholar` | `neutral` | 三個人不是同一天出去的，但路線有重疊。田埂、獵人棧道、舊營地——過了這三處，紀錄就接不上了。 |
| 9 | any | speaker | `player` | `neutral` | 三處都在不同方向。天黑以前走不完。 |
| 10 | any | speaker | `town_scholar` | `neutral` | 先找人。找不到，就記腳印、血跡、遺落物，還有道路哪裡不能走。別只帶猜測回來。 |
| 11 | any | speaker | `player` | `neutral` | 路上的怪物呢？ |
| 12 | any | speaker | `town_scholar` | `neutral` | 能避就避。路不對就回來，別為了把三個地方都走完去冒險。 |
| 13 | any | narration | - | - | 他把三處位置圈在手札上，停了一下，又把最外側那條模糊的線擦掉。 |
| 14 | any | speaker | `town_scholar` | `neutral` | 這張圖是舊的。芙蕾和塔維看過最後一個人出門，先讓他們決定從哪一段開始。每查完一段就帶紀錄回來，別把三張舊線當成一條新路。 |
| 15 | any | speaker | `player` | `neutral` | 我先去南門。 |
| 16 | any | exit | - | - | 開啟旅途手札與南門探索；玩家依田埂、圍籬、足跡與遺留物辨認方向，不顯示任務地標。控制權回到公務室出口。 |

### `ch1_s05_south_gate_introduction`

- `title`: 南門的回程板
- `stageClass`: `town_scene`
- `background`: existing South Gate scene, future broken-state full background
- `worldState`: Chapter 1 daylight; damaged gate; patrol flag visible; lamp unlit but maintained
- `viewpoint`: `protagonist_limited`
- `participants`: standard_bearer_frey, lamplighter_tavi
- `entry`: protagonist approaches the closed gate action after receiving the handbook
- `exit`: gate opens onto the Chapter 1 regional canvas
- `objective`: survey the farmland segment, then return to South Gate with the first record
- `inputs`: three-landmark objective active
- `outputs`: Frey and Tavi introduced; staged reporting and free town recovery made diegetic; farmland departure opened
- `assetNotes`: reuse current portraits; future layered background must show ordinary flag and ordinary patrol lamp

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 南門外側補了兩層木板，門洞只夠一輛車通過。芙蕾站在回程板前，塔維正在把一捆繩索搬進門房。 |
| 2 | any | enter | `standard_bearer_frey,lamplighter_tavi` | - | Frey 進入前景；Tavi 放下繩索後留在門房旁。 |
| 3 | any | speaker | `standard_bearer_frey` | `neutral` | 出城先登記。名字、目的地，還有預計回來的時間。 |
| 4 | any | speaker | `player` | `neutral` | 伊萊找出三段接不上的紀錄。最後一個巡路人從哪裡開始？ |
| 5 | any | narration | - | - | 芙蕾接過手札，逐一看完伊萊圈出的地方。 |
| 6 | any | speaker | `standard_bearer_frey` | `guarded` | 你才剛能站穩，就想把三段路一次走完？ |
| 7 | any | speaker | `player` | `neutral` | 伊萊要我先來問你們，哪一段最接近最後一次目擊。 |
| 8 | any | speaker | `lamplighter_tavi` | `neutral` | 田埂。最後一個人清晨從這裡出去，說先看水溝，再決定要不要往棧道走。中午前本來就該回來。 |
| 9 | any | speaker | `player` | `neutral` | 他出門時有受傷，或帶回過異常的東西嗎？ |
| 10 | any | speaker | `lamplighter_tavi` | `neutral` | 沒有。他走路正常，裝備也完整。 |
| 11 | any | speaker | `standard_bearer_frey` | `neutral` | 今天先查田埂，查完就回來。城裡能讓你把傷養到能再出門，米婭也會重新看過你的手；我確認回程時間後，才開下一段。 |
| 12 | any | speaker | `player` | `neutral` | 先查田埂，帶紀錄回南門。其他兩段等你重新放行。 |
| 13 | second_run | narration | - | - | 我簽完名字，筆尖在回程欄上停了一下。芙蕾伸手把筆抽走，繼續登記下一項。 |
| 14 | any | speaker | `standard_bearer_frey` | `neutral` | 回來就在同一行補時間。別讓我們猜外面少了誰。 |
| 15 | any | speaker | `player` | `neutral` | 我會回來報到。 |
| 16 | any | exit | - | - | South Gate 開啟；切回區域 Canvas，僅開放田埂調查段。 |

### `ch1_s06_three_landmarks`

- `title`: 三處失聯地點
- `stageClass`: `regional_canvas`
- `background`: layered South Gate exploration area with visible terrain, evidence props, and authored danger zones
- `worldState`: Chapter 1 route survey; fog density rises with travel time
- `viewpoint`: `protagonist_limited`
- `participants`: none
- `entry`: each landmark has already presented and recorded its own evidence; the third record opens an in-field comparison
- `exit`: the survey closes and the altered return route becomes active
- `objective`: compare the three pieces of evidence and return with the unresolved pattern
- `inputs`: South Gate departure; traveler handbook
- `outputs`: farmland footprint, hunter-boardwalk silver thread, and old-campfire black-root entries; return-route trigger
- `assetNotes`: each discovered location needs a full scene image later; no image or name appears before contact

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 我把三處紀錄攤在膝上。田埂的靴印走向棧道；棧道上的銀線被人拆過；舊營地的灰底下，黑根仍有溫度。 |
| 2 | any | narration | - | - | 三名巡路人都沒有找到。我只能把看見的東西逐項記下，等回去再和舊紀錄核對。 |
| 3 | second_run | narration | - | - | 三頁紀錄都沒有三名巡路人員的下落。我把它們照原樣收好，準備帶回去核對。 |
| 4 | any | narration | - | - | 起身時，棧道方向傳來木板斷裂的聲音。來路上的銀線已經換了位置。 |
| 5 | any | exit | - | - | Return to the South Gate exploration area and arm the silver-snare danger state on the route the player has just used. |

#### Checkpoint `south_gate_farmland`: 靴印離開田埂

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 水溝裡的史萊姆散開後，田埂終於露出完整的泥面。我在靠近棧道的一側找到一排靴印。 |
| 2 | any | narration | - | - | 靴印沒有停留，也沒有拖行的痕跡。旁邊幾道獸爪印走到黑根前便折向林邊，泥裡看不見血。 |
| 3 | any | narration | - | - | 我量下靴印的方向，把黏在廢農具上的凝膠分開裝好，沿原路回南門。 |

#### Checkpoint `south_gate_farmland_report`: 第一份回報

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 芙蕾闔上門，等我把手札翻到田埂那一頁。 |
| 2 | any | speaker | `standard_bearer_frey` | `neutral` | 找到人了嗎？ |
| 3 | any | speaker | `player` | `neutral` | 沒有。靴印還往棧道走，田埂上沒有血，也沒有拖痕。手只是握久了，有點不聽使喚。 |
| 4 | any | speaker | `standard_bearer_frey` | `neutral` | 所以先不開門。你握筆時一直在抖。去給米婭看過，再回來查棧道。 |
| 5 | any | exit | - | - | 芙蕾在回程板補上時間，將下一個事件標記放到米婭的工作間。 |

#### Checkpoint `south_gate_farmland_recovery`: 再確認一次傷勢

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | speaker | `herbalist` | `neutral` | 左手給我。握緊，再放開。 |
| 2 | any | speaker | `player` | `neutral` | 路上沒有再麻，只是握武器久了會抖。 |
| 3 | any | narration | - | - | 米婭摸過我的指尖，又按了按舊傷周圍。她等了一會兒，才鬆開手。 |
| 4 | any | speaker | `herbalist` | `neutral` | 傷口沒有腫，手也還有力。可以繼續走；麻痺若再出現，直接回來。 |
| 5 | any | exit | - | - | 傷勢檢查完成；下一段環境調查與可互動證據恢復作用。 |

#### Checkpoint `hunter_boardwalk`: 被拆下的銀線

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 棧道下的巨鼠逃進草叢。我沿護欄往前找，在兩塊木板之間看見一截銀線。 |
| 2 | any | narration | - | - | 線的一端還繫在回程標記上，另一端被拉到膝蓋高度。附近木面有反覆踩過的亮痕，不像偶然勾住。 |
| 3 | any | narration | - | - | 我沒有解開銀線，只畫下位置。靴印在這裡變得混亂，再往前便看不清了。 |

#### Checkpoint `old_campfire_site`: 冷灰下的黑根

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 舊營地只剩倒塌的遮棚和一圈濕灰。野狼退進林邊，始終不肯跨過火坑旁的黑根。 |
| 2 | any | narration | - | - | 灰燼表面是冷的，埋在下面的根卻帶著熱。我用刀背撥開泥土，看見它穿過石縫繼續往林子裡延伸。 |
| 3 | any | narration | - | - | 巡路人的痕跡到這裡完全斷了。我記下根的位置，收起手札。 |

### `ch1_s07_silver_snare`

- `title`: 箭頭轉向灌木
- `stageClass`: `location_scene`
- `background`: working `silver_snare_pass` with cut road sign and taut silver thread
- `worldState`: Chapter 1 return route; fog rising; route behind player partially closed
- `viewpoint`: `protagonist_limited`
- `participants`: none; Ambush Mantis uses monster presentation rather than dialogue portrait
- `entry`: player reaches a road sign rotated away from town
- `exit`: return path opens after the encounter and evidence inspection
- `objective`: survive the Ambush Mantis trap and inspect how it was built
- `inputs`: all three landmark records
- `outputs`: Ambush Mantis cleared; silver-thread evidence; forest-wound route clue
- `assetNotes`: reuse approved Boss image; location background remains a later asset need

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 回程路標被轉了半圈，箭頭指向沒有腳印的灌木。我停下時，膝後傳來一聲極輕的繃響。 |
| 2 | any | narration | - | - | 銀線不只攔在前方。它沿著我剛才走過的路逐段收緊，連折返的路也封住了。 |
| 3 | any | enter | - | - | Ambush Mantis 從棧道下方翻上路面；切入固定遭遇演出。 |
| 4 | any | exit | - | - | 收起事件層，進入 Ambush Mantis 戰鬥。 |
| 5 | any | enter | - | - | 戰鬥結束後回到路標近景。 |
| 6 | any | narration | - | - | 伏獵者的前肢纏著幾圈銀線，打結的位置沾滿黑褐樹脂。我從斷裂的前肢上割下一小段線，氣味和舊營地的黑根相同。 |
| 7 | any | narration | - | - | 路標旁有幾道新刮痕，架在路上的銀線也被反覆拉動過。我只記下位置，沒有拆掉仍留在現場的陷阱。 |
| 8 | any | exit | - | - | 路障解除；開啟回城與 `Cold Forge Smoke`。 |

### `ch1_s08_cold_forge_smoke`

- `title`: 冷爐重新點火
- `stageClass`: `town_scene`
- `background`: existing forge scene in cold-to-relit transition
- `worldState`: Chapter 1 return; route evidence under review; bellows linkage jammed; basic furnace recoverable
- `viewpoint`: `protagonist_limited`
- `participants`: village elder, town scholar, blacksmith
- `entry`: South Gate's return signal gathers the elder and Eli beside a route map laid on a crate outside the cold forge
- `exit`: forge actions open and the evidence-backed forest route becomes the next objective
- `objective`: report the evidence, restore damaged equipment, and decide whether the shared residue justifies entering the forest
- `inputs`: Ambush Mantis cleared; protagonist equipment damaged
- `outputs`: three clues synthesized; forest investigation chosen; basic repair and starter crafting opened; blacksmith relationship seed
- `assetNotes`: reuse forge background with cold/relit state treatment; no apprentice asset or new NPC

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 南門的回程鈴響過一次。等我走到冷爐前，伊萊已把舊路圖攤在木箱上，村長站在一旁；鐵匠鋪的門仍只開了一半。 |
| 2 | any | speaker | `town_scholar` | `neutral` | 這個結不是公會常用的打法。你在哪裡找到的？ |
| 3 | any | speaker | `player` | `neutral` | 回程路標旁。伏獵者用它封住棧道，線上的樹脂和舊營地黑根一樣。 |
| 4 | any | speaker | `village_elder` | `guarded` | 黑根到舊營地就停了嗎？ |
| 5 | any | speaker | `player` | `neutral` | 沒有。它穿過石縫，繼續往林子裡。巡路人的痕跡也在那附近斷掉。 |
| 6 | any | speaker | `town_scholar` | `neutral` | 銀線只能證明伏獵者碰過黑根。要查源頭，還得沿根走。 |
| 7 | any | speaker | `village_elder` | `neutral` | 先去鐵匠鋪。你的刀口裂了，別拿它進林子。 |
| 8 | any | narration | - | - | 村長把地圖留給伊萊，轉身讓出門口。爐膛有煤，風箱卻卡在最低處，拉桿每動一下就撞回原位。 |
| 9 | any | enter | `blacksmith` | - | Blacksmith 從風箱後抬頭，先看裝備裂口，再看主角的包紮。 |
| 10 | any | speaker | `blacksmith` | `guarded` | 先站好。你那把刀給我。 |
| 11 | any | speaker | `player` | `neutral` | 爐子不是還沒點起來？ |
| 12 | any | speaker | `blacksmith` | `neutral` | 煤有，風箱的接帶脫槽了。你拉住那邊，我把線穿回去。手別鬆，它彈回來很疼。 |
| 13 | any | narration | - | - | 他扯了扯回收的銀線，確認韌度，再把它繞過脫槽的接帶。我照他指的位置壓住拉桿。 |
| 14 | any | narration | - | - | 風箱第一次完整抬起時，冷灰往煙道深處退了一截。第二次，火星終於點著煤面。 |
| 15 | any | speaker | `blacksmith` | `pleased` | 行，火回來了。現在說說看，你是拿這把刀砍怪物，還是一路拿它敲石頭？ |
| 16 | any | speaker | `player` | `neutral` | 兩樣都有。它還能修嗎？ |
| 17 | any | speaker | `blacksmith` | `neutral` | 能。基本修補我現在就能做。要換更好的材料，得等庫房有東西。 |
| 18 | second_run | narration | - | - | 風箱抬起時，鐵匠罵了一聲鬆掉的接帶。我聽完才把壓著拉桿的手放開。 |
| 19 | any | narration | - | - | 他把修好的裝備推回來，又重新扣緊鬆掉的護面。 |
| 20 | any | speaker | `blacksmith` | `neutral` | 護面的扣環也換了。路上若又鬆開，別硬撐著穿。 |
| 21 | any | speaker | `player` | `neutral` | 我會回來。林子裡的事查清楚後，這把刀可能還得麻煩你。 |
| 22 | any | speaker | `blacksmith` | `pleased` | 那就少拿它敲石頭。去吧。 |
| 23 | any | exit | - | - | Basic forge actions unlock; protagonist returns to crossroads with forest route objective. |

### `ch1_s09_rotroot_approach`

- `title`: 腐根裂谷
- `stageClass`: `regional_canvas`
- `background`: handcrafted route from `broken_horn_camp` into `rotroot_ravine`
- `worldState`: Chapter 1 forest pressure; bark damage and northbound root pulse intensify
- `viewpoint`: `protagonist_limited`
- `participants`: none
- `entry`: handbook aligns Ambush Mantis resin with black-root traces
- `exit`: player reaches the ancient root-heart threshold
- `objective`: follow the shared residue, record the second underground echo, and decide whether to challenge the root heart now or prepare through the optional mine route
- `inputs`: silver-thread evidence recorded; basic forge available
- `outputs`: Forest Guardian convergence opened; northbound pressure and cracked-mine echo recorded; optional dungeon preparation route justified
- `assetNotes`: regional route and root-heart threshold backgrounds required later

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 斷角營地的骨片都朝同一側散開，像有什麼從地底抬起過整片土。樹皮上的剝痕很新，傷口裡卻沒有啃咬留下的齒印。 |
| 2 | any | narration | - | - | 越接近腐根裂谷，野獸的足跡越少。幾條足跡在黑根露出地面的地方轉彎，沒有再靠近。 |
| 3 | any | narration | - | - | 我用刀背壓住一截露出地面的根。破損的手套沾到滲出的黑汁，指尖很快開始發麻，和南路受傷時一樣。 |
| 4 | any | narration | - | - | 舊圖把裂谷畫成死路，黑根卻從岩縫穿了過去。我繞到高處，才找到一條能下去的坡。 |
| 5 | any | narration | - | - | 坡下傳來兩次震動：一次來自根心，另一次隔著側面的裂縫回響。裂縫後有舊支架和鑿痕，像一條被封住的礦道。我把位置另記給伊萊。 |
| 6 | second_run | narration | - | - | 岩縫的位置和記憶裡一樣。我沒有直接下去，先確認兩側沒有新的足跡。 |
| 7 | any | narration | - | - | 前方傳來沉重的抓地聲。被剝去大片樹皮的守護者堵在根心之前，對所有靠近者做出同一個驅離動作。 |
| 8 | any | exit | - | - | 開啟 Forest Guardian 固定地點與 Chapter 1 Boss gate；玩家也可先回城，向伊萊追查裂縫後的斷脈礦道。 |

### `ch1_s10_forest_guardian`

- `title`: 古樹根心的守衛
- `stageClass`: `location_scene`
- `background`: working ancient root heart within the old wolf-den route
- `worldState`: Chapter 1 Boss convergence; roots constricted by external black pressure
- `viewpoint`: `protagonist_limited`
- `participants`: none; Forest Guardian uses full monster presentation
- `entry`: guardian blocks the only safe inspection angle at the root heart
- `exit`: after battle, player inspects the surviving root pulse and returns to town
- `objective`: defeat the Forest Guardian and determine whether it caused the route failures
- `inputs`: Forest Guardian gate opened
- `outputs`: Forest Guardian cleared; guardian ruled out as root cause; northern pressure evidence recovered
- `assetNotes`: reuse current mainline Boss illustration; arena background is a later location asset

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 守護者的前肢沾滿黑汁，肩背缺了幾塊樹皮。牠擋在根心前方，爪痕一路留到我腳邊。 |
| 2 | any | narration | - | - | 我退回坡口，牠沒有追；我換到另一側靠近，牠立刻拖著傷腿再次封住根心。牠守的不是整片森林，只有這個位置。 |
| 3 | any | narration | - | - | 牠停下時，身後的黑根仍在收縮。地面的震動先傳過來，牠才跟著抬頭。要看清根心，只能先讓牠失去阻攔的能力。 |
| 4 | any | enter | - | - | Forest Guardian 進入滿版 Boss 演出；鏡頭保留受傷根心作為因果背景。 |
| 5 | any | exit | - | - | 收起事件層，進入 Forest Guardian 戰鬥。 |
| 6 | any | enter | - | - | 戰鬥結束；守護者倒下，根心仍繼續朝北收縮。 |
| 7 | any | narration | - | - | 黑汁從守護者被撐裂的舊傷滲出，並不是從牠體內長出。黑色細根穿過根心下方的土層，震動仍從更遠的地方傳來。 |
| 8 | any | narration | - | - | 我記下震動的間隔和根伸出的方向。回程路已經打開，三名巡路人仍沒有下落。 |
| 9 | any | exit | - | - | Chapter 1 regional Boss state clears; return-to-town sequence begins. |

### `ch1_s11_roads_breathe_again`

- `title`: 南門重新開放
- `stageClass`: `town_scene`
- `background`: five staged town visits: South Gate, archive, Mia's workroom, relit forge, then the recovering crossroads
- `worldState`: Chapter 1 close; nearby roads readable but unsafe; market still lacks a supply route
- `viewpoint`: `protagonist_limited`
- `participants`: village elder, town scholar, Mia, Frey, Tavi, blacksmith, street beggar
- `entry`: the player must first walk to South Gate; each completed report points to the next town place instead of auto-playing one long return sequence
- `exit`: Chapter 2 objective opens at the empty market edge
- `objective`: report the forest result and identify what town function can honestly recover
- `inputs`: Forest Guardian cleared; northern pressure evidence held
- `outputs`: Chapter 2 opened; first town recovery state; basic forge/gate/handbook retained; Mia's basic recipe authorized but unavailable until market supply returns
- `assetNotes`: one recovery-state crossroads background plus existing character portraits and ordinary repair props; no new resident portrait and no generation before screenplay lock

This remains one mainline scene for chapter causality, but runtime presentation is
split into five persistent checkpoints. The player must walk to each location and
trigger its resident; `ch1_s11_roads_breathe_again` completes only after the final
crossroads checkpoint.

| Checkpoint | Title | Beat Range | Background | Background Image |
| --- | --- | --- | --- | --- |
| `gate_return` | 名字重新劃回回程欄 | `1-7` | South Gate after the Forest Guardian route | `src/assets/images/art/scenes/town/locations/gate-broken.webp` |
| `archive_report` | 守護者與源頭是兩件事 | `8-15` | the civic archive desk | `src/assets/images/art/scenes/town/locations/civic-room-working.webp` |
| `mia_check` | 冷水與溫杯 | `16-21` | Mia's herb workroom | `src/assets/images/art/scenes/town/locations/mia_workroom.webp` |
| `forge_recovery` | 第一爐先修普通東西 | `22-27` | the relit forge and its civilian repair queue | `src/assets/images/art/scenes/town/locations/forge.webp` |
| `crossroads_hint` | 北邊不是北邊 | `28-31` | the recovering crossroads beside empty freight crates | `src/assets/images/art/scenes/town/locations/crossroads-recovery-1.webp` |

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 我敲了兩下門。芙蕾認出我後叫人抬閂，塔維把回程板從牆上取了下來。 |
| 2 | any | enter | `standard_bearer_frey,lamplighter_tavi` | - | Frey 與 Tavi 進入門房前景。 |
| 3 | any | speaker | `standard_bearer_frey` | `neutral` | 三個人呢？ |
| 4 | any | speaker | `player` | `neutral` | 沒找到。棧道有伏擊，林子裡還有一頭守護者。 |
| 5 | any | speaker | `lamplighter_tavi` | `guarded` | 他們的路線就在那一帶。你找到衣物或公會標記了嗎？ |
| 6 | any | speaker | `player` | `neutral` | 沒有。我先把現場和黑根的位置帶回來了。 |
| 7 | any | speaker | `standard_bearer_frey` | `neutral` | 去找村長和伊萊。我替你補回程時間，今晚不再放人出去。 |
| 8 | any | narration | - | - | 伊萊把新紀錄壓在舊路圖旁。村長沒有坐，視線一直停在巡路人失去痕跡的位置。 |
| 9 | any | enter | `village_elder,town_scholar` | - | Elder 與 town scholar 進入桌邊場景。 |
| 10 | any | speaker | `town_scholar` | `guarded` | 守護者倒下以後，地面還在震？ |
| 11 | any | speaker | `player` | `neutral` | 還在震。黑色細根穿過根心，延伸到更深的土層裡。守護者不是源頭。 |
| 12 | any | speaker | `town_scholar` | `neutral` | 我會把守護者和黑根分開記。三條路先標成可以通行，旁邊保留怪物位置。 |
| 13 | any | speaker | `village_elder` | `neutral` | 巡路的人還沒找到，不能說安全。讓南門照這份圖安排人手。 |
| 14 | any | speaker | `player` | `neutral` | 南路的麻痺也和黑根有關。我想再去問米婭，她可能認得症狀。 |
| 15 | any | speaker | `village_elder` | `neutral` | 去吧。也讓她看看你的手。你在林子裡待得太久了。 |
| 16 | any | enter | `herbalist` | - | Mia 在工作桌旁放下剛寫完的配方。 |
| 17 | any | speaker | `herbalist` | `neutral` | 先坐下。手給我。 |
| 18 | any | speaker | `player` | `neutral` | 林子裡的黑根會讓人先麻木，再發熱。和我在南路中的毒很像。 |
| 19 | any | speaker | `herbalist` | `guarded` | 先不下結論。我要確認你現在還能不能分辨冷熱。閉上眼睛。 |
| 20 | any | narration | - | - | 米婭依序碰過我的指尖，先用冷水，再換成溫杯。她等我回答完才把手放開。 |
| 21 | any | speaker | `herbalist` | `pleased` | 都分得出來。今晚不再發麻，就不用重新換藥。配方我已經寫好，等貨路恢復才有材料能做。 |
| 22 | any | narration | - | - | 遠處的鐵匠鋪傳來風箱聲。鐵匠走到門邊，手上仍沾著冷灰。 |
| 23 | any | enter | `blacksmith` | - | Blacksmith 短暫進入 crossroads 邊緣。 |
| 24 | any | speaker | `blacksmith` | `pleased` | 你的刀還在。看來這次沒拿它敲石頭。 |
| 25 | any | speaker | `player` | `neutral` | 接下來能做新裝備了？ |
| 26 | any | speaker | `blacksmith` | `neutral` | 先別急。煤和鐵還運不進來。我現在先修鍋、門鉸和車輪，這些東西每天都有人等。 |
| 27 | any | narration | - | - | 爐前排起的第一批東西沒有一把武器：漏水的鍋、鬆掉的門鉸、裂開的手推車輪。鐵匠一邊抱怨數量，一邊把漏水的鍋放到最前面。 |
| 28 | second_run | narration | - | - | 我在回程欄簽名時停了一下。芙蕾在後面催我別擋著門，我才把筆放回去。 |
| 29 | any | enter | `street_beggar` | - | Street beggar 從空市集棚後探出身，手裡換成一片彎曲木屑。 |
| 30 | any | speaker | `street_beggar` | `guarded` | 畫反了。不是往北走……要從下面繞。花在上面，她在等。 |
| 31 | any | exit | `street_beggar` | - | 乞丐離開。鏡頭停在空箱與斷掉的運貨繩；Chapter 2 market-supply objective opens. |

## Chapter 2 Detailed Screenplay V1

Status: `complete_pending_user_review`. Chapter 2 joins recovered cargo records,
Mia's family wound, the evacuation ledger, and the Lich route into one causal
line. Medicine supply is authorized here, but public trade waits for the
Chapter 3 caravan return.

### `ch2_s01_empty_crates`

- `title`: 空箱先回來了
- `stageClass`: `town_scene`
- `background`: empty market edge with recovered crates and no active stalls
- `worldState`: Chapter 2 opening; first nearby road reopened; recovered crates damaged or empty
- `viewpoint`: `protagonist_limited`
- `participants`: player, town scholar
- `entry`: protagonist follows the Chapter 1 return camera toward the empty market stalls
- `exit`: market remains non-transactional while the missing delivery route becomes active
- `objective`: inspect the recovered cargo marks and trace where the carriers stopped
- `inputs`: Chapter 1 complete; nearby road readable
- `outputs`: carrier names recorded; empty-crate route source identified; medicine supply need opened while market remains closed
- `assetNotes`: reuse closed-market background; merchant does not appear before the Chapter 3 caravan return

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 空攤前擺著三只貨箱。第一只裂了底，第二只只剩幾塊濕布，第三只的繩結還綁得好好的，裡面卻是空的。 |
| 2 | any | narration | - | - | 巡線的人在南路邊找到箱子，只能把它們拖回空著的邊棚。伊萊把運貨牌攤在箱蓋上，手指停在最後兩個名字旁。 |
| 3 | any | speaker | `town_scholar` | `neutral` | 貨牌上有兩名送貨人。他們沒有回來，箱子也不是在原定路線上找到的。 |
| 4 | any | speaker | `player` | `neutral` | 他們原本走哪一條路？ |
| 5 | second_run | narration | - | - | 我記得這兩個名字。上一回，我只查了貨去了哪裡。 |
| 6 | any | speaker | `town_scholar` | `neutral` | 照舊路程，他們傍晚前該經過霧碑丘。米婭等著這批乾布和瓶子。先讓她看看貨印，我再查兩人的登記。 |
| 7 | any | narration | - | - | 我翻過箱底。縫裡卡著一層發白的濕泥，側板還留著石頭擦過的粉末；粉末裡混著淡淡的防腐香。 |
| 8 | any | narration | - | - | 我記下失聯者的姓名，帶著貨牌與箱底的泥痕離開市集。 |

### `ch2_s02_name_under_basket`

- `title`: 籃底的木牌
- `stageClass`: `town_scene`
- `background`: Mia's herb workroom / working state
- `worldState`: Chapter 2; recovered empty crate and old herb baskets being checked for usable supply
- `viewpoint`: `protagonist_limited`
- `participants`: Mia, town scholar
- `entry`: protagonist brings an old supply mark from the empty crate to Mia's workroom
- `exit`: 伊萊 carries the discovered name tag to the civic archive; the protagonist remains briefly while Mia finishes one prescription record
- `objective`: identify the expedition-era name and connect it to the broken delivery road
- `inputs`: empty-crate inspection complete
- `outputs`: Mia's father remains listed as missing; expedition link opened; one later market prescription researched; Mia's work habit and response to the name are observed without assigning a relationship milestone
- `assetNotes`: workroom working-state background; no missing gatherer or notebook item

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 米婭把舊藥籃裡的乾葉一片片挑出來。籃底受了潮，補上去的藤條翹開一角，下面壓著一塊薄木牌。 |
| 2 | any | narration | - | - | 她把木牌翻過來。看清上面的名字後，手指停住了。 |
| 3 | any | speaker | `herbalist` | `guarded` | 這是我父親的名字。這只籃子是他出發前帶走的。 |
| 4 | any | speaker | `player` | `neutral` | 背面還有一排數字。伊萊也許認得。 |
| 5 | any | narration | - | - | 伊萊來得很快。他向米婭點了點頭，接過木牌，湊到窗邊的光下。 |
| 6 | any | speaker | `town_scholar` | `guarded` | 是遠征補給的編號。物資出城時有登記，返還那一欄是空的。這只籃子應該是後來單獨送回來的。 |
| 7 | any | speaker | `herbalist` | `guarded` | 誰送的？ |
| 8 | any | speaker | `town_scholar` | `neutral` | 這張木牌上沒有寫。我回去找當年的收件簿，也只能先從同一批編號查起。 |
| 9 | any | speaker | `herbalist` | `guarded` | 名冊上呢？ |
| 10 | any | speaker | `town_scholar` | `neutral` | 還是失蹤。沒有遺骨，也沒有最後見到他的人。我不能替那一格改字。 |
| 11 | any | narration | - | - | 伊萊拓下木牌上的編號，帶著貨牌回去查帳。米婭把木牌留在桌邊。 |
| 12 | any | narration | - | - | 我留下來幫她分乾葉。巷子裡有人踩過積水，她抬了一次頭，聽見腳步走遠，才重新低下眼睛。 |
| 13 | any | speaker | `herbalist` | `pleased` | 左邊能用，右邊丟掉。這片發黑了，別因為捨不得就留下。 |
| 14 | any | narration | - | - | 她把那片乾葉從我手裡抽走，又推來一只空籃。窗邊的處方紙上，補了乾布、甜膠和乾淨瓶子的數量。 |
| 15 | any | narration | - | - | 我帶著處方離開工作間。木牌仍留在米婭桌邊，伊萊帶走的拓印已經送回公務室。 |

### `ch2_s03_ledger_that_would_not_close`

- `title`: 沒有人改過的路
- `stageClass`: `town_scene`
- `background`: three staged town views: scholar desk, Mia's workroom, then the forge
- `worldState`: Chapter 2; expedition and evacuation records spread across an ordinary civic table
- `viewpoint`: `protagonist_limited`
- `participants`: town scholar, village elder, Mia, blacksmith
- `entry`: 伊萊 lays the herb-basket tag beside evacuation lists and funeral markers
- `exit`: route preparation is completed at town level; player returns to the Chapter 2 canvas
- `objective`: verify the last valid evacuation instruction and prepare for the opened-tomb route
- `inputs`: Mia's father tag; empty-crate white mud and burial-stone traces
- `outputs`: mist tablet hill and opened tomb route opened; anti-undead preparation justified; ledger uncertainty recorded
- `assetNotes`: use existing civic-room, Mia-workroom, and forge backgrounds as beat-range switches; no new scene id or location is added

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 伊萊把遠征補給單、撤離名冊和無人領取的葬牌分成三排。米婭父親的木牌放在中間，邊角正好壓住一條褪色的路線。 |
| 2 | any | narration | - | - | 村長坐在桌子另一側。伊萊翻到最後一張有日期的撤離指示，把紙轉向他。 |
| 3 | any | enter | `town_scholar,village_elder` | - | 伊萊與村長在公務桌兩側就位。 |
| 4 | any | speaker | `town_scholar` | `neutral` | 當年霧丘東邊還能走。這張指示本身沒有錯，但後面找不到改路的通知。 |
| 5 | any | speaker | `village_elder` | `guarded` | 那幾天沒人顧得上通知。能動的人都在找失蹤的隊伍。 |
| 6 | any | speaker | `town_scholar` | `guarded` | 我不是要追究誰漏了這張紙。現在還有人照著它走，才是麻煩。 |
| 7 | second_run | narration | - | - | 我翻過名冊後幾頁。沒有修訂日期，也沒有新的路線。我請伊萊把這一點另外記下。 |
| 8 | any | speaker | `player` | - | 兩名送貨的人很可能看過這張指示。我要從霧碑丘開始查。 |
| 9 | any | speaker | `village_elder` | `resolute` | 先看路標和葬牌，別跟著霧裡的聲音走。開墓地就在更北邊；路不對就回來，別硬闖。 |
| 10 | any | exit | `town_scholar,village_elder` | - | 伊萊留下舊路圖，村長回到尚未結束的失蹤名單前。 |
| 11 | any | narration | - | - | 出門前，我去了一趟米婭的工作間。她把乾布和清水包好，又檢查了一次瓶塞。 |
| 12 | any | enter | `herbalist` | - | 米婭把包好的乾布與清水推到桌邊。 |
| 13 | any | speaker | `herbalist` | `guarded` | 喉嚨一發麻就往回走。回來先讓我看手指，不要自己判斷有沒有中毒。 |
| 14 | any | exit | `herbalist` | - | 米婭回到工作桌，繼續補寫尚未有材料可做的配方。 |
| 15 | any | narration | - | - | 鐵匠替我收緊護具，把會勾住布條的扣環換掉。金屬在鉗口裡響了兩聲。 |
| 16 | any | enter | `blacksmith` | - | 鐵匠放下鉗子，重新確認護具的受力位置。 |
| 17 | any | speaker | `blacksmith` | `neutral` | 碰到掛在路上的布就繞開。真躲不掉再動手，別拿肩甲往裡撞。 |
| 18 | any | exit | `blacksmith` | - | 鐵匠收回鉗具，我也扣好護具。 |
| 19 | any | narration | - | - | 我收好霧丘的舊路圖，從城鎮北側出發。 |

### `ch2_s04_mist_and_tomb_route`

- `title`: 葬牌指向的方向
- `stageClass`: `regional_canvas`
- `background`: handcrafted route through `mist_tablet_hill` to `opened_ancient_tomb`
- `worldState`: Chapter 2; white ground mist; funeral markers still aligned to an obsolete evacuation road
- `viewpoint`: `protagonist_limited`
- `participants`: none
- `entry`: player reaches the first black `?` marker at mist tablet hill
- `exit`: opened-tomb reliquary becomes visible after the route pattern is understood
- `objective`: follow the names rather than the obsolete arrows and locate the force directing the dead
- `inputs`: ledger route; Mia/blacksmith preparation
- `outputs`: dead-route behavior recorded; Lich phylactery clues; missing carriers found among the latest route victims without adding a new NPC
- `assetNotes`: mist hill and opened tomb require separate full-image location backgrounds later

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 我抵達霧碑丘。迷霧裡的黑色方標退去，石碑和周圍的葬牌露了出來。 |
| 2 | any | narration | - | - | 石碑上的箭頭還看得清楚。箭頭旁多了許多姓名，最新幾筆的墨尚未完全褪色。 |
| 3 | any | narration | - | - | 白霧裡傳來拖行聲。幾具屍體背著空貨繩，走到塌壁前，又轉身回到石碑旁。 |
| 4 | any | narration | - | - | 我避開箭頭指的斷路，按葬牌編號往回找。越靠北，泥土裡的防腐香越重，兩名送貨人的貨牌也出現在路邊。 |
| 5 | any | narration | - | - | 霧後的山壁裂開一道入口。掘開的古墓就在裡面。 |
| 6 | any | narration | - | - | 墓門的石塊整齊堆在兩側，不像被人硬砸開。門內有新泥，拖痕一條接著一條。 |
| 7 | second_run | narration | - | - | 我先看葬牌，再看那些屍體。每一具都繫著姓名和去處；拔掉其中一塊，整列腳步便停了一瞬。 |
| 8 | any | narration | - | - | 墓道兩側留著一排空釘孔。拆下的葬牌全被帶往深處，細線在地上拖出同一個方向。 |
| 9 | any | narration | - | - | 我在手札記下兩名送貨人的最後位置。他們不是在路上被搶，而是跟著屍群走進了墓裡。 |
| 10 | any | narration | - | - | 古墓深處傳來翻頁聲。我收起手札，沿著細線繼續往裡走。 |

### `ch2_s05_moon_moss_trace`

- `title`: 月苔上的蹄印
- `stageClass`: `location_scene`
- `background`: moon-moss slope beside the reopened evacuation road
- `worldState`: Chapter 2 optional environmental branch; displaced wildlife has crossed the road and moved on
- `viewpoint`: `protagonist_limited`
- `participants`: none
- `entry`: the optional moon-moss path becomes reachable after the mist-tablet route is understood
- `exit`: the player records the westbound trace and returns to the tomb route
- `objective`: inspect the repeated hoof marks without turning the side route into another Boss arena
- `inputs`: Chapter 2 regional route open
- `outputs`: moon-moss route observation only; no item, reward, Boss flag, or cross-run execution state
- `assetNotes`: reuse the moon-moss slope location background; do not show or identify the prologue giant

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 西坡的月苔全朝同一邊伏倒。泥裡疊著幾列蹄印，新痕壓著舊痕，沒有一列轉向古墓。 |
| 2 | any | narration | - | - | 樹皮上的刮痕高過我的肩。那頭大型生物曾在這裡停留，後來繼續往西；林子裡只剩草葉摩擦的聲音。 |
| 3 | any | narration | - | - | 我量了蹄印的寬度和步距，記下日期。附近沒有血，也沒有新鮮糞便，現在追上去只會離古墓更遠。 |
| 4 | any | narration | - | - | 西邊的蹄印還在延伸，但它們和古墓裡的拖痕沒有交會。我把這條未追完的路另外記下，回到霧碑丘。 |

### `ch2_s06_keeper_of_names`

- `title`: 守名者赫恩
- `stageClass`: `location_scene`
- `background`: opened tomb reliquary filled with route tags, unclosed registers, and displaced dead
- `worldState`: Chapter 2 Boss convergence; curse pressure preserves an obsolete duty
- `viewpoint`: `protagonist_limited`
- `participants`: Lich / Keeper of Names Hern through Boss presentation
- `entry`: player reaches the reliquary that owns the empty nail pattern found outside
- `exit`: phylactery, records, and glimmer residue are separated after combat; dead route ceases
- `objective`: defeat the Lich and recover the register that keeps redirecting the dead
- `inputs`: tomb route clues complete
- `outputs`: Lich cleared; `lich_phylactery`; evacuation records; Glimmer Shard, reserved deliberately in second run
- `assetNotes`: reuse Lich full Boss art and matching staff; crown-like frame and ornate shell read as accumulated reliquary hardware, funeral tags, and dead belongings rather than royal history; reliquary background remains an asset need

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 靈匣外纏滿葬牌。每一塊木牌都用細線接回同一本名冊，翻動的紙頁帶起一股乾冷的灰味。 |
| 2 | any | narration | - | - | 墓室中央傳來乾裂的聲音。它念出三個死者的姓名，接著報出一條早已塌毀的撤離路。 |
| 3 | any | narration | - | - | 守名者赫恩從葬牌與遺物堆成的冠架下抬起頭。細鏈繞過靈匣，另一端全繫在死者身上。 |
| 4 | any | speaker | `lich` | `neutral` | 名列未清。道路未閉。未抵達者，回到隊列。 |
| 5 | any | speaker | `player` | `neutral` | 那條路已經斷了。你送出去的人，只會走回同一面塌壁。 |
| 6 | any | speaker | `lich` | `guarded` | 名列未清。不得停留。不得遺失。 |
| 7 | any | narration | - | - | 赫恩舉起法杖。墓道裡所有腳步同時轉向我。 |
| 8 | any | exit | - | - | 收起事件層，進入守名者赫恩戰鬥。 |
| 9 | any | enter | - | - | 戰鬥結束後回到墓室。 |
| 10 | any | narration | - | - | 法杖落地，繃緊的細線一根根鬆開，屍群也停了下來。 |
| 11 | any | narration | - | - | 名冊末頁是赫恩自己的筆跡。墓地再也容不下死者後，他把姓名、屍體和送達紀錄一同繫進靈匣，日期停在舊路塌毀之前。 |
| 12 | any | narration | - | - | 靈匣裂縫裡卡著一片微弱發亮的碎屑。我用布包起來；靠近它時，紙上的墨和黑色污痕變得更容易分辨。 |
| 13 | second_run | narration | - | - | 我認得這片微光。上一回它被當成普通材料用掉了；這次我把它另外收好，沒有交給工坊。 |
| 14 | any | narration | - | - | 我取走赫恩的名冊與靈匣殘片，沿著安靜下來的墓道返回城鎮。 |

### `ch2_s07_names_return_to_town`

- `title`: 名字回到鎮上
- `stageClass`: `town_scene`
- `background`: civic room, then the still-empty market edge
- `worldState`: Chapter 2 close; recovered names replace anonymous loss; medicine is authorized but delivery has not resumed
- `viewpoint`: `protagonist_limited`
- `participants`: town scholar, village elder, Mia, street_beggar
- `entry`: recovered register is placed beside the village's incomplete evacuation ledger
- `exit`: medicine authorization is filed; northbound checkpoint route becomes the next investigation
- `objective`: reconcile the dead and missing without converting uncertainty into heroic propaganda
- `inputs`: Lich defeated; records recovered; Chapter 2 supply route cleared
- `outputs`: honest evacuation ledger; Mia's unresolved family tag retained; elder and 伊萊 divide the remaining work; Ailo flower breadcrumb; authorized medicine formula waiting for supply; Chapter 3 seed
- `assetNotes`: civic and closed-market states; Ailo reuses his existing portrait and the flower remains a deferred prop; no apothecary location, assistant portrait, or early merchant

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 伊萊把赫恩的名冊拆成幾疊，逐一核對姓名、出發日和最後可確認的位置。我報出墓道裡看見的貨牌，他便在兩名送貨人的名字旁補上日期。 |
| 2 | any | narration | - | - | 村長和米婭站在長桌旁。米婭父親的木牌單獨放在一角，沒有混進已確認的死者名單。 |
| 3 | first_run | speaker | `town_scholar` | `pleased` | 兩名送貨人的紀錄補上了。其他名字還得慢慢核對，但至少家屬不必再等一張空白回條。 |
| 4 | second_run | speaker | `town_scholar` | `guarded` | 我會把道路修訂日期寫在每一頁上。往後若路又變了，舊指示不能繼續留在最上面。 |
| 5 | any | speaker | `herbalist` | `guarded` | 這本名冊也沒有他？ |
| 6 | any | speaker | `town_scholar` | `neutral` | 沒有。這至少能排除一件事：他沒有被赫恩編進霧丘的撤離隊列。人仍是失蹤，但我們不用再往這座墓裡找。 |
| 7 | any | narration | - | - | 米婭看向村長。她沒有移開木牌，村長也沒有伸手去碰。 |
| 8 | any | speaker | `village_elder` | `guarded` | 先留著。沒有找到人，也沒有找到遺骨，不能只為了把帳寫完就改掉。 |
| 9 | any | speaker | `herbalist` | `guarded` | 那塊木牌先留在這裡。下一次，我要查遠征隊離開霧丘後走的路。 |
| 10 | any | speaker | `village_elder` | `neutral` | 好。找到能確認的紀錄以前，不改。 |
| 11 | any | narration | - | - | 米婭用乾布包好木牌，放回失蹤名單旁。伊萊換了一張紙，從兩名送貨人的紀錄重新抄起。 |
| 12 | any | speaker | `town_scholar` | `neutral` | 這頁我重抄。前兩頁還要你的簽名。 |
| 13 | any | speaker | `village_elder` | `neutral` | 現在簽。你抄完這頁就停。 |
| 14 | any | speaker | `town_scholar` | `guarded` | 我會停。明早你再來核一次日期。 |
| 15 | any | narration | - | - | 村長應了一聲。我們把名冊帶到空著的邊棚，將能公開調配的藥品另外列成一頁。 |
| 16 | any | narration | - | - | 米婭寫下保存天數與調配份量。清單有了，乾布、瓶子和甜膠仍在斷路另一端。 |
| 17 | any | speaker | `herbalist` | `neutral` | 等貨真的到了，再照這張配。現在先別把空架子算成庫存。 |
| 18 | any | narration | - | - | 伊萊在清單上加註日期，將它收進市集檔案。邊棚沒有開門，至少下一批貨不必再從頭確認。 |
| 19 | any | narration | - | - | 艾洛蹲在空箱旁，從填縫的乾草裡撿出一朵外白、花心淡綠的小花。 |
| 20 | any | speaker | `street_beggar` | `neutral` | 這朵不能染。她說沒用，所以要留下。不是這裡……上面才多。 |
| 21 | any | narration | - | - | 我還沒來得及問他在說誰，艾洛已把花塞進袖口，穿過空攤走了。北向關卡的路標排進下一次巡查，市集仍等著一條完整的路。 |

### `ch2_s08_shadow_at_the_checkpoint`

- `title`: 關卡前的隊列
- `stageClass`: `regional_canvas`
- `background`: northbound road marker and abandoned checkpoint at the edge of the Chapter 3 region
- `worldState`: Chapter 2 epilogue; dusk; recovered sign guarded by shadow figures using human spacing
- `viewpoint`: `protagonist_limited`
- `participants`: standard_bearer_frey, lamplighter_tavi
- `entry`: protagonist joins a short route-marking check after the carrier ledger closes
- `exit`: party withdraws rather than pursuing the formation into Chapter 3 early
- `objective`: observe and record the shadow formation; do not mistake the teaser for a random invasion
- `inputs`: Chapter 2 ledger closed; north route readable
- `outputs`: shadow-command evidence; Frey route-marking duty; Tavi Chapter 3 lamp assignment; Chapter 3 opened
- `assetNotes`: checkpoint background needed later; reuse Frey/Tavi portraits and normal shadow-soldier assets

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 北向路標剛從泥裡扶正，箭面上卻多了五道等距的黑手印。關卡前的影子沒有撲過來，只分成兩列站著。 |
| 2 | any | narration | - | - | 芙蕾放低旗桿，示意我停下。塔維抱著沒有點燃的提燈，跟在她身後。 |
| 3 | any | speaker | `standard_bearer_frey` | `neutral` | 先別過去。前面那兩列不是亂站的。 |
| 4 | any | narration | - | - | 最前面的影子抬起一隻手。後排同時轉身，彼此間距和南門換哨時一樣。 |
| 5 | any | speaker | `lamplighter_tavi` | `guarded` | 剛才那個動作……我看過。巡線的人要後隊轉向，也會這樣抬手。 |
| 6 | second_run | narration | - | - | 我知道這些影子會照著留下的命令行動，卻還看不出命令是誰下的。 |
| 7 | any | narration | - | - | 一道黑色刃痕落在路標前。影子沒有追擊，只守著那條刻痕不動。 |
| 8 | any | speaker | `standard_bearer_frey` | `resolute` | 今天先回去。這不是三個人能摸清的地方。塔維，明晚巡線前把燈準備好。 |
| 9 | any | speaker | `lamplighter_tavi` | `guarded` | 好。我先來量風，再決定燈放哪一邊。 |
| 10 | any | narration | - | - | 我們退回路標後方。影子沒有追趕，只在通行線上重新列隊。要穿過這道關卡，得先弄清牠們究竟還在服從誰的命令。 |

## Chapter 3 Detailed Screenplay V1

Status: `complete_pending_user_review`. `洛恩 / Lorne` is the accepted display
name; all scene logic remains bound to runtime id `casino_dealer` until migration.

### `ch3_s01_dead_checkpoint`

- `title`: 廢棄關卡仍有人守著
- `stageClass`: `location_scene`
- `background`: abandoned checkpoint at the old obsidian keep gate
- `worldState`: Chapter 3 opening; a shadow patrol repeats an old inspection route
- `viewpoint`: `protagonist_limited`
- `participants`: player; shadow soldiers use monster presentation
- `entry`: player approaches the north checkpoint opened at Chapter 2 close
- `exit`: recovered fittings return to town for comparison
- `objective`: pass the checkpoint and determine why the patrol never leaves its assigned line
- `inputs`: Chapter 3 open; checkpoint formation recorded
- `outputs`: expedition fittings; command spacing; old checkpoint discovered
- `assetNotes`: reuse obsidian keep gate and normal shadow-soldier assets

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 關卡的木門只剩半扇。三道黑影仍在門前來回，停步、轉身，再逐一查看空無一人的道路。 |
| 2 | any | narration | - | - | 我伏在倒塌的石牆後看了兩輪。牠們每次都踩進相同的腳印，連轉身的位置也沒有偏過。 |
| 3 | second_run | narration | - | - | 這一次我先看地面。石縫裡留著舊靴釘的刮痕，隊形早在影子出現以前就被人走過。 |
| 4 | any | narration | - | - | 我等牠們轉身後踏進通行線。最前面的影子立刻橫起武器，後排同時封住側門；我退回線外，牠們才恢復原位。這道關卡仍在拒絕所有通行者。 |
| 5 | any | exit | - | - | Begin the shadow-soldier checkpoint encounter. |
| 6 | any | enter | - | - | Resume after the shadow patrol is defeated. |
| 7 | any | narration | - | - | 最後一具黑影散去，幾枚肩扣掉在門邊。背面的皮墊磨得很薄，尺寸也只適合人穿戴。 |
| 8 | any | speaker | `player` | `neutral` | 先帶回去。伊萊可能認得上面的配發印。 |
| 9 | any | narration | - | - | 我收起肩扣和一截斷刃。門後的道路空了，關卡上的巡查卻沒有因此變得合理。 |

### `ch3_s02_shadows_count_names`

- `title`: 影子留下的人用痕跡
- `stageClass`: `town_scene`
- `background`: blacksmith and scholar work table, then a visible cut to Mia's workroom
- `worldState`: Chapter 3; first shadow evidence in town; protagonist conceals a fresh side wound
- `viewpoint`: `protagonist_limited`
- `participants`: player, town scholar, blacksmith, village elder, Mia
- `entry`: fittings and blade fragment are placed beside expedition records
- `exit`: old command-post search opens after Mia treats the concealed wound
- `objective`: identify the equipment and prepare to follow its former command route
- `inputs`: dead-checkpoint evidence
- `outputs`: expedition resemblance; old command-post route; concealed wound treated; delayed reporting established as a behavior that can change through later action
- `assetNotes`: use existing forge background for beats 1-9 and Mia-workroom background for beats 10-17

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 鐵匠把肩扣翻到背面。伊萊從舊箱裡找出一張發黃的配發單，壓在旁邊。兩個印記少了一角，位置卻完全相同。 |
| 2 | any | enter | `blacksmith,town_scholar,village_elder` | - | 鐵匠、伊萊與村長圍到放著肩扣與配發單的工作桌旁。 |
| 3 | any | speaker | `blacksmith` | `guarded` | 不是怪物做的。皮墊換過兩次，扣眼也有人重新鑿過。穿它的人很愛惜這副甲。 |
| 4 | any | speaker | `town_scholar` | `guarded` | 二十年前的遠征裝備。我只能確認配發批次，不能只憑這幾塊東西認人。 |
| 5 | any | speaker | `player` | `neutral` | 關卡外的影子一直照同一條路巡查。舊紀錄裡有附近的指揮所嗎？ |
| 6 | any | narration | - | - | 伊萊翻了幾頁，停在一張補給路線上。墨跡已經淡了，北側倉庫的圈記還看得清楚。 |
| 7 | any | speaker | `town_scholar` | `neutral` | 有。從關卡往東北走，先經過守夜線，再到舊指揮所。後面的頁不在這裡。 |
| 8 | any | speaker | `village_elder` | `guarded` | 先查到那裡。別再往前猜。二十年前死的人夠多了，不必替他們補一個方便的答案。 |
| 9 | any | narration | - | - | 我伸手收起斷刃，腰側忽然抽痛。血從內襯滲出來，滴在桌腳旁。 |
| 10 | any | speaker | `blacksmith` | `neutral` | 先別碰。你把地板弄髒以前，去找米婭。 |
| 11 | any | exit | `blacksmith,town_scholar,village_elder` | - | 鐵匠按住桌上的斷刃，伊萊與村長留在原地整理指揮所路線。 |
| 12 | any | narration | - | - | 米婭剪開黏住傷口的布。黑色細痕沿著皮膚往外爬了半指，她沒有立刻說話。 |
| 13 | any | enter | `herbalist` | - | 米婭在工作台前接過沾血的繃帶。 |
| 14 | any | speaker | `herbalist` | `guarded` | 這不是擦傷。你什麼時候發現的？ |
| 15 | any | speaker | `player` | `neutral` | 回程才開始痛。我不想讓整條路再停下來等我。 |
| 16 | any | speaker | `herbalist` | `guarded` | 你倒在半路，他們還是得回頭找你。下次先說。 |
| 17 | any | narration | - | - | 她把浸過藥的布按上去。刺痛很快變成麻木，黑痕也停在原處。 |
| 18 | any | speaker | `player` | `neutral` | 妳的手在抖。 |
| 19 | any | narration | - | - | 米婭看了一眼握著鑷子的手，把工具放下，活動幾次手指，再換另一隻手拿起來。 |
| 20 | any | speaker | `herbalist` | `neutral` | 我換手。你先別動，剩下這一點很快。 |

### `ch3_s03_lamp_oil_in_fog`

- `title`: 守夜線少了一個位置
- `stageClass`: `regional_canvas`
- `background`: Chapter 3 night watch route with front and rear markers across fog
- `worldState`: Chapter 3 night; crosswind exposes an unmeasured rear marker
- `viewpoint`: `protagonist_limited`
- `participants`: player, lamplighter_tavi, standard_bearer_frey
- `entry`: player joins the first full night-route check
- `exit`: the old command road opens; optional casino and coastal branches become available
- `objective`: verify the night route before crossing toward the old command post
- `inputs`: shadow checkpoint route; flag did not return only in second run
- `outputs`: first-run rear marker unmeasured or second-run rear marker ready; command road open
- `assetNotes`: reuse gate-working as temporary town-side background until the night-route asset exists

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 天黑後，霧從低地漫上守夜線。前標的火被風吹偏，塔維蹲在燈架旁，用細繩重新綁住鬆動的進風片。 |
| 2 | any | narration | - | - | 風把後標短暫遮住時，他的手停了一下。火還在，他重新拉緊繩結，直到前標不再晃動。 |
| 3 | any | speaker | `standard_bearer_frey` | `neutral` | 前標好了嗎？後面那盞還沒量。 |
| 4 | any | speaker | `lamplighter_tavi` | `guarded` | 這裡的進風口還會鬆。我先守著，免得兩盞一起滅。 |
| 5 | any | speaker | `player` | `neutral` | 指揮所的路從後標旁通過。我們至少要知道燈架能不能擋住這個風。 |
| 6 | first_run | speaker | `lamplighter_tavi` | `guarded` | 我知道。等霧薄一點，我再帶量尺過去。 |
| 7 | first_run | speaker | `standard_bearer_frey` | `neutral` | 我先去看風從哪裡灌進來。看不清就退，不往前走。 |
| 8 | first_run | narration | - | - | 芙蕾沿著路標走進霧裡，不久便折返回來。她記下風向，靴底全是濕泥；後標的燈罩、進風口和固定扣仍沒有尺寸。 |
| 9 | second_run | speaker | `player` | `neutral` | 前標我看著。塔維，帶量尺去後標。 |
| 10 | second_run | speaker | `lamplighter_tavi` | `guarded` | 這裡的繩還沒綁牢。 |
| 11 | second_run | speaker | `standard_bearer_frey` | `neutral` | 交給我。你去量，起霧就回來。 |
| 12 | second_run | narration | - | - | 塔維握著量尺站了一會兒，才把細繩交給芙蕾。他走到後標，依序量下燈罩、進風口和固定扣，途中兩次回頭確認前標仍亮著。 |
| 13 | any | narration | - | - | 霧散開一小段。往舊指揮所的石路露了出來，另一條濕冷的小徑則沿低地轉向海岸。 |

### `ch3_s04_showcase_glass`

- `title`: 玻璃櫃裡的價碼
- `stageClass`: `town_scene`
- `background`: existing casino hall and prize-wall backgrounds
- `worldState`: optional Chapter 3 casino branch; public rates visible; showcase prizes inspectable
- `viewpoint`: `protagonist_limited`
- `participants`: player, casino dealer, casino owner
- `entry`: player enters the newly opened casino by choice
- `exit`: casino games remain available and a seller mark points toward the black market
- `objective`: inspect the display cases and learn how ordinary tickets differ from private collateral
- `inputs`: night watch route complete; casino open
- `outputs`: showcase inspected; Vesper notices player; black-market seller mark
- `assetNotes`: reuse casino hall, prize wall, owner, and dealer assets

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 賭場裡比街上暖得多。票價與賠率寫在每張桌旁，只有最深處的玻璃櫃沒有標價。 |
| 2 | any | speaker | `casino_dealer` | `neutral` | 第一次來？公開桌只收票券。桌邊寫多少，就是多少。 |
| 3 | any | speaker | `player` | `neutral` | 那些展示品呢？ |
| 4 | any | speaker | `casino_dealer` | `guarded` | 不在公開獎池。真想問，得等主人願意談。 |
| 5 | second_run | narration | - | - | 洛恩收回骰子時，拇指在客方那顆的邊角停了一下。我記下那個動作，沒有當場拆穿。 |
| 6 | any | narration | - | - | 我看完第二只櫃子，維斯珀才從內側走出來。他沒有催洛恩，也沒有先介紹自己。 |
| 7 | any | speaker | `casino_owner` | `soft` | 公開桌給人消遣。玻璃櫃裡的東西，要看客人願意拿什麼來談。 |
| 8 | any | speaker | `player` | `neutral` | 金幣不算？ |
| 9 | any | speaker | `casino_owner` | `pleased` | 有時候算。等你真的想拿走其中一件，我們再談價錢。 |
| 10 | any | narration | - | - | 櫃底壓著一張舊收據。賣方沒有名字，只留下一個背巷商人的記號。 |

### `ch3_s05_blank_creditor_trace`

- `title`: 沒有名字的債權欄
- `stageClass`: `town_scene`
- `background`: hidden black-market contact point in the market service passage
- `worldState`: optional Chapter 3 black-market branch; one old receipt traces to a single contract sale
- `viewpoint`: `protagonist_limited`
- `participants`: player, black market trader
- `entry`: player follows the seller mark from the casino receipt
- `exit`: the only known blank contract remains with Vesper; branch returns to the command-road investigation
- `objective`: identify what was sold and whether another copy exists
- `inputs`: showcase inspected; seller mark recorded
- `outputs`: Blank Collateral clue; no duplicate contract; creditor remains unnamed
- `assetNotes`: reuse alley and black-market portrait; do not reveal Void

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 背巷盡頭只有一扇半開的木窗。我把收據放上窄桌，裡面的人看過記號，才把燈往前推。 |
| 2 | any | speaker | `black_market` | `guarded` | 這張紙我賣過。買主是維斯珀。 |
| 3 | any | speaker | `player` | `neutral` | 它原本是什麼？ |
| 4 | any | speaker | `black_market` | `neutral` | 一份空白抵契。債權欄沒有名字，抵押人簽下去才會生效。 |
| 5 | any | speaker | `player` | `neutral` | 還有第二張嗎？ |
| 6 | any | speaker | `black_market` | `guarded` | 沒有。我只收過一張，也只賣過一次。 |
| 7 | any | narration | - | - | 商人把收據推回來。紙角留著一行警告：簽約以前，先確認桌邊誰是主人，誰是客人。 |
| 8 | second_run | narration | - | - | 我把那行字抄進手札。現在還不足以扳倒維斯珀，但這次不會等到契約打開才想起它。 |

### `ch3_s06_drowned_voice`

- `title`: 退潮後仍有鐘聲
- `stageClass`: `location_scene`
- `background`: drowned bell coast leading to sunken altar reef
- `worldState`: optional Chapter 3 route Boss; a waterlogged ritual shell continues sounding after death
- `viewpoint`: `protagonist_limited`
- `participants`: player, Drowned Oracle through Boss presentation
- `entry`: player follows a coastal sound by choice; second run recognizes it as unfinished work
- `exit`: Ancient Rune is recovered and the branch returns to the old command road
- `objective`: silence the Drowned Oracle and inspect the object carrying its voice
- `inputs`: coastal side route; unfinished regicide only in second run
- `outputs`: Ancient Rune discovery; ancient rune bound in second run
- `assetNotes`: reuse drowned coast, sunken altar, and Drowned Oracle Boss art

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 退潮後，礁石下傳來一聲沉響。水裡看不見鐘，聲音卻一次比一次靠近岸邊。 |
| 2 | first_run | narration | - | - | 我沿著聲音走到浮出的祭壇。碎裂的石殼裡還有東西在呼吸。 |
| 3 | second_run | narration | - | - | 我認得這種沒有肉身仍能留下的聲音。這次我沒有從海岸離開。 |
| 4 | any | speaker | `drowned_oracle` | `grieving` | 潮水退了。受問的人還沒有回來。 |
| 5 | any | exit | - | - | Begin the Drowned Oracle route-Boss encounter. |
| 6 | any | enter | - | - | Resume after the Drowned Oracle is defeated. |
| 7 | any | narration | - | - | 祭殼裂開，聲音終於停下。底部卡著一枚古代符文，入水多年仍沒有被磨平。 |
| 8 | first_run | speaker | `player` | `neutral` | 先帶回去。伊萊也許能找到相同的刻法。 |
| 9 | second_run | narration | - | - | 我用布把符文分層包好。它不是前往舊指揮所的必需品，但之後會用得上。 |

### `ch3_s07_old_command_post`

- `title`: 舊指揮所的最後一頁
- `stageClass`: `location_scene`
- `background`: black iron storehouse and old line-command yard threshold
- `worldState`: Chapter 3; local expedition records remain under shadow residue
- `viewpoint`: `protagonist_limited`
- `participants`: player, village elder
- `entry`: elder joins only after the storehouse approach is secured
- `exit`: elder stays behind while player enters Kaedren's command yard
- `objective`: identify the local commander and the order still holding the yard
- `inputs`: expedition fitting match; old command road open
- `outputs`: Kaedren identified; missing final signal; supreme commander reserved but unnamed
- `assetNotes`: reuse black iron storehouse; no supreme-commander art or encounter

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 舊倉庫的門被黑色鏽層黏住。我撬開一道縫，裡面仍按隊列堆著補給箱，只是布料和木頭早已腐爛。 |
| 2 | any | narration | - | - | 村長在入口等到四周安靜才走進來。他停在牆上一枚刻痕前，用袖口擦掉灰。 |
| 3 | any | speaker | `village_elder` | `guarded` | 凱德倫。左線指揮。這是他的記號。 |
| 4 | any | speaker | `player` | `neutral` | 關卡的巡查路線也是他安排的？ |
| 5 | any | speaker | `village_elder` | `neutral` | 是。他守這條缺口，收到撤令才會退。 |
| 6 | any | narration | - | - | 伊萊抄給我的補給表停在同一天。最後一欄寫著「等候總隊訊號」，下面沒有簽收。 |
| 7 | any | speaker | `player` | `neutral` | 訊號沒有送到。 |
| 8 | any | speaker | `village_elder` | `guarded` | 沒有。凱德倫只管左線，前面的總隊出了什麼事，我也不知道。 |
| 9 | any | narration | - | - | 指揮場就在倉庫後方。村長沒有跟進去，只把通往側門的路讓開。 |
| 10 | any | speaker | `village_elder` | `guarded` | 我留在這裡。你若能把他的刀帶回來，別先磨掉握柄上的痕跡。 |

### `ch3_s08_shadow_commander`

- `title`: 左線仍未撤退
- `stageClass`: `location_scene`
- `background`: old line-command yard with a permanently held breach
- `worldState`: Chapter 3 Boss convergence; Kaedren repeats his last local order
- `viewpoint`: `protagonist_limited`
- `participants`: player, Shadow Commander Kaedren through Boss presentation
- `entry`: player crosses the unchanged hold line
- `exit`: the local command echo ends and Kaedren's blade returns to town
- `objective`: defeat Kaedren and end the order still holding the breach
- `inputs`: Kaedren identified; command yard open
- `outputs`: Shadow Commander defeated; commander blade recovered; local command closed
- `assetNotes`: reuse approved Shadow Commander art and matching commander blade

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 指揮場中央立著一副黑甲。不同尺寸的肩片、鎖鏈和破旗纏在一起，握刀的右手卻仍停在同一個備戰位置。 |
| 2 | any | narration | - | - | 我跨過地面的界線。空著的甲片同時轉向，像整支隊伍一起聽見了腳步。 |
| 3 | any | speaker | `shadow_commander` | `resolute` | 左線守住。不得後退。 |
| 4 | any | speaker | `player` | `neutral` | 這裡已經沒有需要你攔下的人了。 |
| 5 | any | exit | - | - | Begin the Shadow Commander Boss encounter. |
| 6 | any | enter | - | - | Resume after Shadow Commander Kaedren is defeated. |
| 7 | any | narration | - | - | 黑甲從接縫處散開。破旗落在石地上，凱德倫的刀最後才鬆手。 |
| 8 | any | narration | - | - | 握柄內側磨出五道深痕，和關卡肩扣上的使用痕跡一樣，都是活人長年留下的。 |
| 9 | second_run | narration | - | - | 我把站位刻線與沒有送達的訊號一併抄下。結束凱德倫的命令，仍沒有回答前線究竟發生了什麼。 |

### `ch3_s09_temptation_and_orders`

- `title`: 刀回來了，命令沒有
- `stageClass`: `town_scene`
- `background`: five staged town views: civic table, Mia's workroom, South Gate, market edge, then the civic map during the quake report
- `worldState`: the local shadow command is closed; optional casino evidence depends on player exploration
- `viewpoint`: `protagonist_limited`
- `participants`: player, village elder, town scholar, blacksmith, Mia, lamplighter Tavi, standard bearer Frey, merchant
- `entry`: commander blade is returned to the civic table
- `exit`: the caravan front reaches town; a quake cuts off the rear section at Gray Ridge and opens Chapter 4
- `objective`: close Kaedren's record and decide the next route from the evidence now available
- `inputs`: Shadow Commander defeated; optional casino, black-market, and Drowned Oracle branches may be complete
- `outputs`: Chapter 3 closed; shadow crafting stage one; Mia honest-return state; merchant and public market return; rear caravan trapped; Chapter 4 open
- `assetNotes`: switch existing civic-room, Mia-workroom, gate-working, and market backgrounds by beat range; merchant uses the existing canonical profile

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 凱德倫的刀橫放在公務桌上。鐵匠沒有先碰刀刃，只用炭筆拓下握柄內側的磨痕。 |
| 2 | any | enter | `town_scholar,village_elder,blacksmith` | - | 伊萊、村長與鐵匠圍到放著凱德倫武器的公務桌旁。 |
| 3 | any | speaker | `town_scholar` | `guarded` | 左線的配發記錄能對上。撤令那一頁仍是空的，總隊的去向也沒有資料。 |
| 4 | any | speaker | `village_elder` | `guarded` | 那就照空白寫。不要替死人補話。 |
| 5 | any | speaker | `blacksmith` | `neutral` | 刀上的黑層可以分離。我先做小片測試，能用再談裝備。 |
| 6 | any | speaker | `player` | `neutral` | 關卡和指揮場都清了。明天我再看前面的路。 |
| 7 | any | exit | `town_scholar,village_elder,blacksmith` | - | 伊萊收起配發記錄，村長留下空白撤令，鐵匠則帶走刀上的測試薄片。 |
| 8 | any | narration | - | - | 我主動去了米婭的工作間。她指了指椅子，等我自己拆開繃帶。黑痕沒有再往外長。 |
| 9 | any | enter | `herbalist` | - | 米婭洗過手，在工作椅旁等我拆完繃帶。 |
| 10 | any | speaker | `herbalist` | `neutral` | 傷口很乾淨。這次不用重新上藥。 |
| 11 | any | speaker | `player` | `neutral` | 我想先讓妳看過，再決定明天能不能出門。 |
| 12 | any | narration | - | - | 米婭把繃帶收好。桌邊的湯沒有動過，表面已經結了一層薄膜。 |
| 13 | any | speaker | `player` | `neutral` | 妳還沒吃？ |
| 14 | any | narration | - | - | 她看了一眼空著的門口，拉開椅子坐下，把湯碗挪到面前。 |
| 15 | any | speaker | `herbalist` | `pleased` | 現在吃。你不趕時間的話，坐一下。 |
| 16 | any | exit | `herbalist` | - | 米婭留下我喝完半碗冷湯，自己回到仍未寫完的病歷前。 |
| 17 | any | narration | - | - | 南門的前標已重新掛起，塔維抱著量尺站在後標旁，芙蕾正核對天亮前的值勤欄。 |
| 18 | any | enter | `lamplighter_tavi,standard_bearer_frey` | - | 塔維與芙蕾在南門標記旁會合。 |
| 19 | first_run | speaker | `lamplighter_tavi` | `guarded` | 前標修好了，後標還沒量。我明早帶量尺過去。 |
| 20 | first_run | speaker | `standard_bearer_frey` | `neutral` | 天亮前我守前標。你去後面，別再等風自己停。 |
| 21 | second_run | speaker | `lamplighter_tavi` | `soft` | 後標的尺寸都在這裡。鐵匠說天亮後能先做一個擋風扣。 |
| 22 | second_run | speaker | `standard_bearer_frey` | `pleased` | 好。明早一起裝。 |
| 23 | any | exit | `lamplighter_tavi,standard_bearer_frey` | - | 兩人帶著各自的標記工具回到南門兩端。 |
| 24 | any | narration | - | - | 入夜後，北門外先傳來車輪聲。第一輛貨車進門時，市集原本空著的攤主從車板上跳下來，還沒站穩便回頭數後面的燈。 |
| 25 | any | enter | `merchant` | - | The canonical merchant enters with the first caravan section; outside traders remain background figures until separately approved. |
| 26 | any | speaker | `merchant` | `guarded` | 前面的車到了。後面還有三輛貨車和護衛，他們在灰脊換輪，照理不該差這麼久。 |
| 27 | any | narration | - | - | 米婭核過的藥品清單終於能交給攤主。有人卸乾布，有人搬瓶子；長久空著的邊棚第一次重新亮燈。 |
| 28 | any | exit | `merchant` | - | 攤主轉身清點先到的貨箱，讓人立即去北門等後車。 |
| 29 | any | narration | - | - | 第二聲車輪沒有來。桌上的杯水先起了細紋，接著整棟房子往同一側晃了一下。 |
| 30 | any | narration | - | - | 午夜前，東邊送回三份報告。相隔很遠的石牆在同一刻裂開，灰塵都朝山裡落。 |
| 31 | any | enter | `town_scholar,standard_bearer_frey` | - | 伊萊與趕回來的芙蕾站到重新攤開的城外地圖前。 |
| 32 | any | speaker | `town_scholar` | `guarded` | 不是一處塌方。灰脊剛好在三條裂線中間，後面的車隊可能還在那裡。 |
| 33 | any | speaker | `standard_bearer_frey` | `resolute` | 我去南門叫人。天亮前先把入口和回程標記好。 |
| 34 | any | narration | - | - | 伊萊把三處裂點和商隊最後回報的位置圈在同一張圖上，筆尖停在灰脊。 |
| 35 | any | exit | `town_scholar,standard_bearer_frey` | - | 芙蕾帶著圈好的位置趕往南門，伊萊留下核對三份報告的時間。 |

## Chapter 4 Detailed Screenplay V1

Status: `accepted`. The fixed Gray Ridge crisis owns Frey's death or rescue;
childhood mist, wind-guard causality, Tavi's admission, protagonist isolation,
and the elder/Frey aftermath are approved. Thorn Witch remains a separate
preparation route and Ash Baron stays outside the base chapter.

### `ch4_s01_road_moves_underfoot`

- `title`: 灰脊的路在移動
- `stageClass`: `regional_canvas`
- `background`: handcrafted Gray Ridge approach with cracked retaining walls and exposed ancient channel stones
- `worldState`: Chapter 4 opening; rear caravan overdue; coordinated earthquakes and ash-bearing wind begin
- `viewpoint`: `protagonist_limited`
- `participants`: village elder, standard_bearer_frey, lamplighter_tavi
- `entry`: player joins the search for the missing rear caravan after several roads shift in the same interval
- `exit`: the caravan position, evacuation route, and ancient-ruin disturbance are identified
- `objective`: find where the rear caravan stopped and map which structures will fail in the next quake
- `inputs`: Chapter 4 open; merchant's rear-caravan ledger; coordinated quake report
- `outputs`: rear caravan located at Gray Ridge; ancient regulation channels exposed; evacuation order; flag/lamp assignments
- `assetNotes`: regional stone/ash canvas and moving-wall state required later

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 第一面擋土牆向外移了半尺。遠處第二面牆在同一瞬間裂開，埋在土裡的刻槽石板露出一長段。 |
| 2 | second_run | narration | - | - | 我記得地震之後會有更大的東西醒來。眼前能確認的，仍只有商隊留下的輪痕、倒向山裡的灰和正在擴大的裂縫。 |
| 3 | any | enter | `village_elder,standard_bearer_frey,lamplighter_tavi` | - | Elder、Frey 與 Tavi 進入區域事件層；Frey marks the front route while Tavi checks lamp positions. |
| 4 | any | speaker | `village_elder` | `guarded` | 先找車隊。裂縫往哪裡走、哪座橋還能過，一起記。下一次再震，跑得快也未必跑得出去。 |
| 5 | any | narration | - | - | 芙蕾把旗插在仍穩定的高點，塔維則逐一測試低處燈位。灰風從山脊壓下，後方標記最先消失。 |
| 6 | any | speaker | `standard_bearer_frey` | `resolute` | 灰脊還有人。前旗帶隊，後燈確認尾端，兩邊都看見才能走。 |
| 7 | any | speaker | `lamplighter_tavi` | `guarded` | 低地的風比昨晚更硬。普通燈罩撐不住。先找到他們，我再沿回程放燈。 |
| 8 | any | speaker | `village_elder` | `resolute` | 那就別等它斷。芙蕾標撤離線，塔維標燈位。其餘人回鎮準備。 |
| 9 | any | narration | - | - | 地底傳來低沉的摩擦聲。刻槽石板一段接一段錯位，槽裡殘留的礦光朝四個方向分開；更深處則留下一道持續往山裡延伸的空痕。 |
| 10 | any | exit | - | - | Open Chapter 4 Gray Ridge rescue, caravan preparation, and ancient-ruin investigation. |

### `ch4_s02_caravan_rear_missing`

- `title`: 回來的只到前半
- `stageClass`: `town_scene`
- `background`: reopened market edge, then a visible cut to the forge in evacuation-preparation state
- `worldState`: Chapter 4; front caravan section has returned; rear wagons and escorts remain at Gray Ridge
- `viewpoint`: `protagonist_limited`
- `participants`: merchant, blacksmith, standard bearer Frey, lamplighter Tavi
- `entry`: the merchant compares arrived wagons with the caravan ledger while the search party reports the Gray Ridge break
- `exit`: rescue equipment, route markers, and chapter-four baseline craft access are issued
- `objective`: identify who and what remain behind, then prepare a real evacuation rather than a vague rescue order
- `inputs`: rear caravan located; public market reopened; forge active
- `outputs`: missing caravan ledger; evacuation equipment; blacksmith civilian-first priority; second-run wind guard completed
- `assetNotes`: use existing market background for beats 1-5 and forge background for beats 6-12; no new named trader, driver, guard, material, or portrait

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 商隊名冊上有六輛車。三輛已停在市集外，一輛在灰脊入口翻覆，最後兩輛和護衛沒有通過斷口。 |
| 2 | any | enter | `merchant,blacksmith,standard_bearer_frey,lamplighter_tavi` | - | Merchant owns the ledger; blacksmith, Frey, and Tavi enter only after the missing section is concrete. |
| 3 | any | speaker | `merchant` | `guarded` | 後車有藥材、礦料和兩個返鄉的人。車可以不要，人得先帶回來。 |
| 4 | any | speaker | `standard_bearer_frey` | `resolute` | 我帶前隊走高處。塔維從低地放回程燈，兩邊都能看見再動。 |
| 5 | any | speaker | `lamplighter_tavi` | `guarded` | 灰脊後段有側風。前標的燈罩撐得住，後標那一盞不一定。 |
| 6 | any | narration | - | - | 爐前排著新武器、橋板扣、燈框、擔架環和兩只待補的車輪鐵箍。鐵匠把武器單整疊移到最後。 |
| 7 | any | speaker | `blacksmith` | `resolute` | 先修能把人帶回來的東西。要新武器的，等路上的人都進門再排。 |
| 8 | any | narration | - | - | 商隊帶回的圖樣與礦料重新補上工坊缺了很久的幾種做法。這些東西一路跟著車隊回來，不是誰臨時變出來的。 |
| 9 | second_run | enter | `lamplighter_tavi` | - | Tavi enters carrying the measured dimensions for the rear-marker wind guard. |
| 10 | second_run | speaker | `lamplighter_tavi` | `guarded` | 風口在這裡。不要封死，燈也得進氣。我……會自己拿去試。 |
| 11 | second_run | speaker | `blacksmith` | `neutral` | 知道會進氣，表示你終於沒只顧著怕它滅。半天後來拿。 |
| 12 | any | exit | - | - | Unlock Chapter 4 baseline craft and public stock; issue evacuation equipment; record blacksmith civilian-first priority; second run records wind guard ready. |

### `ch4_s03_thorn_value_rule`

- `title`: 荊棘溫室
- `stageClass`: `location_scene`
- `background`: `thorn_glasshouse_ruin`, where host vines and black parasitic growth share one structure
- `worldState`: Chapter 4 post-evacuation optional first-run trial; mandatory second-run execution-material route after the Titan aftermath
- `viewpoint`: `protagonist_limited`
- `participants`: Thorn Witch through elite/Boss presentation
- `entry`: after the Gray Ridge evacuation, Titan battle, and town aftermath, the player follows biological contamination signs exposed by the collapsed ruin line
- `exit`: ordinary or pure Forest Essence resolves according to run understanding
- `objective`: survive the Thorn Witch's trial and determine whether parasite can be separated from host
- `inputs`: `story.ch4.town_aftermath_recorded`; Glimmer Shard; `未竟的弒王` in second run
- `outputs`: ordinary Forest Essence in first run; `forest_essence_pure` and core-revealing method in second run
- `assetNotes`: reuse Thorn Witch art; no chapel, light NPC, or material-identification service

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 溫室骨架被兩種藤蔓共用。綠色主藤仍在輸送水分，黑色寄生刺卻把每一次生長都導向自己的囊核。 |
| 2 | any | enter | `thorn_witch` | - | Thorn Witch emerges from the living structure; her scene dressing remains below mainline Boss spectacle. |
| 3 | any | speaker | `thorn_witch` | `guarded` | 你要精華，還是要這座溫室活著？別說兩個都要。想拿兩個的人，通常連差別都看不見。 |
| 4 | first_run | narration | - | - | 溫室裡沒有可用的交換物。要帶走精華，只能先讓纏住出口的黑刺停下來。 |
| 5 | second_run | narration | - | - | `未竟的弒王` 與微光碎片讓寄生刺的邊界短暫顯形。要取得完整精華，必須切斷黑囊而不燒毀主藤。 |
| 6 | second_run | speaker | `thorn_witch` | `pleased` | 這次看見了？好。那就別用「力量太大」替手笨找理由。把不屬於它的東西分出去。 |
| 7 | any | exit | - | - | 收起事件層，進入 Thorn Witch trial/Boss encounter; second-run objective marks parasite nodes separately. |
| 8 | any | enter | - | - | Encounter ends; the host vines either survive the separation or collapse with ordinary extraction according to run state. |
| 9 | first_run | narration | - | - | 黑刺倒下後，仍有幾段主藤保持濕潤。我從斷口收起普通森林精華，剩下的根很快縮回溫室深處。 |
| 10 | second_run | narration | - | - | 純淨森林精華保留宿主自身的生命邊界。與微光結合後，它能讓藏在地形裡的寄生核心顯出輪廓。 |
| 11 | any | speaker | `thorn_witch` | `neutral` | 這一份能帶走。別再碰剩下的根。 |
| 12 | any | exit | - | - | Return to Chapter 4 canvas; preserve the appropriate current-run essence state. |

### `ch4_s04_gray_ridge_evacuates`

- `title`: 灰脊撤離
- `stageClass`: `regional_canvas`
- `background`: handcrafted Gray Ridge stone causeway before the central span breaks
- `worldState`: Chapter 4 crisis; rear caravan found among broken wagons; ash-heavy crosswind and repeated quakes separate survivors
- `viewpoint`: `protagonist_limited`
- `participants`: village elder, standard_bearer_frey, lamplighter_tavi
- `entry`: the rescue party reaches the rear caravan before the next major quake
- `exit`: camera splits toward front flag and rear lamp; irreversible marker crisis starts
- `objective`: move survivors from both sides of the broken caravan line while keeping two independent direction markers visible
- `inputs`: Gray Ridge mapped; evacuation equipment issued; second-run wind guard when prepared
- `outputs`: evacuation timer; Frey front assignment; Tavi rear assignment; run-specific marker readiness
- `assetNotes`: Gray Ridge full background required; future Frey death CG is recorded but not generated

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 第一輛後車側翻在橋頭，貨箱一路滾到斷面。活著的人分在兩側，前方能看見南門旗，後方只能在灰風裡等一盞尚未點亮的燈。 |
| 2 | any | enter | `village_elder,standard_bearer_frey,lamplighter_tavi` | - | Elder remains at the stable entry; Frey takes the front flag; Tavi carries the rear lamp toward the low marker. |
| 3 | any | speaker | `village_elder` | `resolute` | 前後都要有方向。芙蕾帶前隊，塔維守後標。誰看不見自己的標記，就停，不准往聲音裡擠。 |
| 4 | any | speaker | `standard_bearer_frey` | `resolute` | 前隊看旗，不看裂縫。走到下一塊白石再停。 |
| 5 | any | speaker | `lamplighter_tavi` | `guarded` | 後標到位以後我會連遮三次。看見三次再走，不要猜。 |
| 6 | any | speaker | `village_elder` | `guarded` | 你守中央白石。先清落石，再壓住臨時踏板；標記有人負責，別讓所有人都去做同一件事。 |
| 7 | any | speaker | `player` | `neutral` | 我守白石和踏板。芙蕾、塔維，聽見我喊也別離開自己的標記。 |
| 8 | second_run | narration | - | - | 修好的風擋扣在燈罩外，塔維也已走過這段低地。準備沒有消除恐懼，只讓他的身體多記得一次正確動作。 |
| 9 | any | narration | - | - | 巨響從橋下傳來。中央橋面整段抬升，兩隊視線同時被灰幕切斷。我壓住的踏板下方裂開，正在通過的人只能踩著它繼續走。 |
| 10 | any | speaker | `village_elder` | `afraid` | 標記別滅！兩邊都別動！ |
| 11 | any | narration | - | - | 前旗、後燈與中央白石被抬到三個互不相通的高度。我若離開踏板，中央的人會先墜下；我不能替代任何一端的標記。 |
| 12 | any | exit | - | - | Split crisis state; continue immediately to rear marker `body_locks`. |

### `ch4_s05_body_locks`

- `title`: 後標燈位
- `stageClass`: `location_scene`
- `background`: Gray Ridge rear causeway marker under ash wind and rising stone
- `worldState`: Chapter 4 irreversible crisis; rear group cannot see front flag
- `viewpoint`: `protagonist_limited`
- `participants`: lamplighter_tavi
- `entry`: Tavi reaches the rear marker as the ground break exposes voices below the span
- `exit`: first run leaves the lamp dark; second run sends a visible rear signal to Frey
- `objective`: light and hold the rear marker before the group loses direction
- `inputs`: Gray Ridge crisis; second-run wind guard and rehearsal when available
- `outputs`: first-run `rear_marker_failed` or second-run `rear_marker_lit`
- `assetNotes`: rear-marker background must support the same framing in both runs; no magical lamp effect

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 後標石就在三步外。橋下先傳來碎石，再傳來被困者的喊聲。塔維停住，手裡的火摺已經打開。 |
| 2 | any | enter | `lamplighter_tavi` | - | Tavi fills the foreground; the lamp and marker remain visible behind his locked stance. |
| 3 | first_run | narration | - | - | 他知道要做什麼。拇指抵著火輪，肩膀朝前，腿卻像被聲音釘在原地。第一道火星掉進灰裡。 |
| 4 | first_run | speaker | `lamplighter_tavi` | `afraid` | 動……快動。拜託。 |
| 5 | first_run | narration | - | - | 第二次地裂把後隊的影子吞進灰幕。燈仍沒有亮，前方也再看不見他們。 |
| 6 | second_run | narration | - | - | 同樣的喊聲讓他的身體再次鎖住。這次手掌先碰到預演時留下的風擋扣痕。 |
| 7 | second_run | speaker | `lamplighter_tavi` | `afraid` | 手別停。火摺、燈芯、風擋……照做過的來。 |
| 8 | second_run | narration | - | - | 他沒有跨過裂縫，也沒有變成戰士。他只完成自己的位置：護住火根、扣緊風擋、把後標連遮三次。 |
| 9 | second_run | speaker | `lamplighter_tavi` | `resolute` | 看燈！三次！現在往前走！ |
| 10 | any | exit | - | - | First run cuts to a dark rear marker; second run carries the lamp signal into Frey's front-marker scene. |

### `ch4_s06_flag_returns`

- `title`: 前旗與後燈
- `stageClass`: `location_scene`
- `background`: Gray Ridge cracked center span with front flag and rear-marker sightline
- `worldState`: Chapter 4 crisis resolution; run state determines whether rear light is visible
- `viewpoint`: `split_limited` (`protagonist_limited` -> `character_limited:standard_bearer_frey` -> `protagonist_limited`)
- `knowledgeBoundary`: Audience hears Frey's final self-talk; the protagonist sees her across the raised span but gains no new intervention state.
- `participants`: standard_bearer_frey, lamplighter_tavi only as distant second-run voice/light
- `entry`: Frey reaches the front marker and looks back for the rear signal
- `exit`: first run ends on Frey's death and recovered flag; second run ends with both markers holding until evacuation completes
- `objective`: keep direction visible until the final group crosses
- `inputs`: `rear_marker_failed` or `rear_marker_lit`
- `outputs`: first-run Frey death and `旗沒有回來`; second-run Frey survival and shared marker state
- `assetNotes`: first-run final moment is an approved future CG candidate; reusable causeway aftermath still required

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 芙蕾把前旗推到最高處。前隊已過，最後幾人卻在中央停住，回頭尋找後方的光。 |
| 2 | first_run | narration | - | - | 灰幕裡沒有燈。芙蕾只看了一次，便拔起前旗往中央跨度回去。 |
| 3 | first_run | speaker | `standard_bearer_frey` | `resolute` | 看旗走。不要找人，先把路走完。 |
| 4 | first_run | narration | - | - | 她把旗桿楔進裂開的石縫，用全身重量壓住。旗布重新出現在兩隊都看得見的位置。 |
| 5 | first_run | speaker | `player` | `afraid` | 芙蕾，留在那裡！最後一個人過去，我就去找妳！ |
| 6 | first_run | narration | - | - | 最後一人越過白石時，我放開踏板朝她起步；中央跨度在同一瞬間再次抬升，把兩人隔在裂縫兩側。 |
| 7 | first_run | cutaway | `standard_bearer_frey` | `afraid` | 裂縫另一側，主角的身影仍在朝這裡奔跑，卻被抬升的石面越推越遠。芙蕾聽不見呼喊，只聽見自己的喘息與旗繩在風裡繃緊。 |
| 8 | first_run | speaker | `standard_bearer_frey` | `resolute` | 再走幾步！看著旗，別停！ |
| 9 | first_run | narration | - | - | 她把繩尾再纏過手腕，沒有回答我。灰幕吞掉人影以前，旗仍在最高處。 |
| 10 | first_run | exit | - | - | Deferred story CG: Frey holds the ordinary patrol flag as the span breaks. Return on the fixed flag and her still body after evacuation. |
| 11 | second_run | narration | - | - | 灰幕裡亮起一次、兩次、三次。塔維的後燈沒有靠近，卻穩定待在它該在的位置。 |
| 12 | second_run | speaker | `standard_bearer_frey` | `afraid` | 塔維……我看見了。別過來。守住那裡！ |
| 13 | second_run | speaker | `lamplighter_tavi` | `resolute` | 妳也別回來！前面看旗，後面看我！ |
| 14 | second_run | narration | - | - | 芙蕾的視線在後燈停了一瞬。她沒有拔起前旗，只把旗桿重新壓進石縫，留在原位。 |
| 15 | second_run | speaker | `standard_bearer_frey` | `resolute` | 最後一列，走！兩邊都有人，不准往回擠！ |
| 16 | second_run | exit | - | - | Evacuation completes with both markers visible; Frey and Tavi survive without leaving their assigned positions. |

### `ch4_s07_titan_rises`

- `title`: 地脈遺跡甦醒
- `stageClass`: `location_scene`
- `background`: collapsed Gray Ridge approach opening into ancient vein-regulation ruins
- `worldState`: Chapter 4 Boss convergence; evacuation result carries into tone, not Boss identity
- `viewpoint`: `protagonist_limited`
- `participants`: none; Ancient Titan uses full mainline Boss presentation
- `entry`: after the last evacuation state resolves, the Ancient Titan climbs from the exposed ruin line and turns toward the mountain
- `exit`: the Titan falls away from the road; its hammer enters loot selection and the exposed regulation channels are recorded
- `objective`: stop the Ancient Titan before its route crushes the remaining caravan approach
- `inputs`: Gray Ridge evacuation complete; Frey fate locked
- `outputs`: Ancient Titan cleared; guaranteed `titan_hammer` loot decision; proof of an ancient regulation network and a continuing energy drain toward the mountain
- `assetNotes`: retain mainline full Boss style; equipment drop must match Titan-held/worn form

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | first_run | narration | - | - | 旗仍在身後，持旗的人已不再動。下一次地震從更深處傳來，斷橋外的遺跡整片向上崩開。 |
| 2 | second_run | narration | - | - | 最後一列離開時，前旗與後燈仍同時可見。兩人剛撤出灰脊，斷橋外的遺跡便整片向上崩開。 |
| 3 | any | narration | - | - | 一隻覆滿岩層與舊礦痕的巨手撐出地面。泰坦沒有看向車隊；它轉向山裡那道失去光澤的礦脈，一步便讓剩下的橋墩全部傾斜。 |
| 4 | any | narration | - | - | 它若繼續往前，灰脊與商隊唯一能退回城鎮的路都會被踩斷。我走到遺跡出口，擋在它與山路之間。 |
| 5 | any | speaker | `player` | `resolute` | 把傷者和車先送回去。這裡我擋。 |
| 6 | any | enter | - | - | Ancient Titan enters full-screen Boss presentation; the cracked ruin channel and remaining caravan road stay visible. |
| 7 | any | exit | - | - | 收起事件層，進入 Ancient Titan 戰鬥。 |
| 8 | any | enter | - | - | 戰鬥結束；Titan collapses away from the evacuation line. Its stone hammer breaks free and enters the normal loot-decision panel. |
| 9 | any | narration | - | - | 泰坦倒下後，遺跡底部露出四條分離的刻槽。火色、霜白、雷痕與帶毒的綠光都在變淡；四條槽的空缺則一起指向山裡。 |
| 10 | any | narration | - | - | 它是在追逐被抽走的力量。眼前的道路只是擋在它與山之間。 |
| 11 | any | exit | - | - | Offer `titan_hammer` through loot selection; return to town with run-specific survivors, route objects, and the ruin survey. |

### `ch4_s08_returned_objects`

- `title`: 回來的物件
- `stageClass`: `town_scene`
- `background`: forge, South Gate, and Mia's workroom in run-specific aftermath states
- `worldState`: Chapter 4 aftermath; first run mourning or second run exhausted relief
- `viewpoint`: `protagonist_limited`
- `participants`: blacksmith, lamplighter_tavi, standard_bearer_frey in second run, village elder, Mia
- `entry`: flag fitting and lamp are placed on the forge table
- `exit`: Mia/protagonist relationship beat closes before the Titan report moves to 伊萊
- `objective`: return the route objects, account for who came home, and treat the evacuation cost
- `inputs`: Ancient Titan cleared; Frey fate state; ruin survey returned
- `outputs`: run-specific forge/gate/Tavi states; Frey/elder fear understanding in second run; elder guilt pressure in first run; Mia Chapter 4 emotional admission; town-temperature change
- `assetNotes`: forge and workroom aftermath variants; no death reward item implemented yet

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 鐵匠先接過旗扣，再接過燈。兩件東西都有刮痕。他把旗扣放在左邊，燈放在右邊，沒有先問誰要說話。 |
| 2 | first_run | enter | `blacksmith,lamplighter_tavi` | - | Blacksmith and Tavi enter; Tavi stands too straight and keeps the lamp lit indoors. |
| 3 | first_run | speaker | `blacksmith` | `grieving` | 扣子能修。旗桿也能。別問我剩下那個。 |
| 4 | first_run | narration | - | - | 塔維把燈罩擦了一遍，又翻過來擦裡側。布已經沾不到灰，他仍沿著同一圈慢慢擦。 |
| 5 | first_run | speaker | `lamplighter_tavi` | `neutral` | 後標以後我來。每次都來。這樣就不會再缺人。 |
| 6 | first_run | speaker | `blacksmith` | `angry` | 燈先放下。手給我看。你今晚不用接後標。 |
| 7 | first_run | exit | `blacksmith,lamplighter_tavi` | - | 鐵匠把塔維留在爐邊處理擦傷，主角帶著撤離令前往南門。 |
| 8 | first_run | enter | `village_elder` | - | Elder enters at South Gate after the forge exchange; no one asks Tavi to carry the flag outside again. |
| 9 | first_run | narration | - | - | 老人親手把南門旗降到半高，將灰脊撤離令折回自己簽名的那一面。 |
| 10 | first_run | speaker | `village_elder` | `grieving` | 撤離令是我簽的。下一次，前後標都要另外留人接手。 |
| 11 | second_run | enter | `blacksmith,standard_bearer_frey,lamplighter_tavi` | - | Blacksmith, Frey and Tavi enter together; Frey holds the flag clasp while Tavi protects the lamp glass. |
| 12 | second_run | speaker | `standard_bearer_frey` | `angry` | 你點了燈就該退，不是站在裂口旁等它證明你有膽。 |
| 13 | second_run | speaker | `lamplighter_tavi` | `angry` | 妳回頭就比較合理嗎？我至少待在自己的位置！ |
| 14 | second_run | speaker | `blacksmith` | `pleased` | 很好，都活著，才有力氣互相嫌。東西放下，我只修金屬，不修你們的吵架。 |
| 15 | second_run | enter | `village_elder` | - | Elder enters at the forge threshold after hearing both assigned markers returned. |
| 16 | second_run | speaker | `standard_bearer_frey` | `guarded` | 我看見他的燈時，第一個念頭不是放心，是叫他回來。 |
| 17 | second_run | speaker | `village_elder` | `soft` | 我每次看你們走出南門，都在想同一句。 |
| 18 | second_run | speaker | `standard_bearer_frey` | `hurt` | 我以前以為那只是膽小。 |
| 19 | second_run | speaker | `village_elder` | `neutral` | 下一張值勤表拆成三個位置。芙蕾，缺人的地方不能再全填妳的名字。 |
| 20 | first_run | exit | `village_elder` | - | 村長把降下的旗留在南門，獨自回到公務室。 |
| 21 | second_run | exit | `blacksmith,standard_bearer_frey,lamplighter_tavi,village_elder` | - | 值勤表留在爐邊，四人各自去處理尚未結束的撤離善後。 |
| 22 | any | narration | - | - | 米婭的工作間裡，傷者已經離開。她仍在重排藥瓶，將已經整齊的布又折了一次。 |
| 23 | any | enter | `herbalist` | - | Mia enters with visible exhaustion; protagonist remains through second-person narration. |
| 24 | first_run | speaker | `herbalist` | `grieving` | 她早上還問我灰進眼睛怎麼洗。我給了她一小瓶水。瓶子回來了。 |
| 25 | second_run | speaker | `herbalist` | `hurt` | 我知道他們都回來了。把這瓶放回去，我的手還是停不下來。 |
| 26 | any | narration | - | - | 我叫她坐下。她先想拒絕，最後只把手撐在桌邊，沒有再拿下一只藥瓶。 |
| 27 | any | speaker | `herbalist` | `hurt` | 我一閉上眼，還是會先數少了誰。 |
| 28 | any | speaker | `herbalist` | `soft` | 陪我坐一下。只要一下。今天先別拿傷口當理由。 |
| 29 | any | exit | `herbalist` | - | 米婭留在工作間休息，我把遺跡拓圖送往伊萊的桌上。 |

### `ch4_s09_four_elements_one_report`

- `title`: 四條刻槽
- `stageClass`: `town_scene`
- `background`: scholar desk with the exposed-ruin survey, caravan timings, and four regional reports
- `worldState`: Chapter 4 close; first run town quiet after Frey's death, second run patrol pair contributes complete timings; casino remains unnaturally bright in both states
- `viewpoint`: `protagonist_limited`
- `participants`: town scholar, village elder, blacksmith, Mia, street_beggar, casino_owner, casino_dealer; Frey and Tavi enter only in second run
- `entry`: four ancient channel markings are compared with heat, frost, thunder, and poison reports
- `exit`: Chapter 5 four-front investigation and advanced preparation open
- `objective`: prove whether the four elemental crises share one timing source
- `inputs`: ancient regulation channels exposed; caravan and quake timings; patient/equipment records
- `outputs`: four-channel regulation hypothesis and continuing mountain drain; Ailo whistle breadcrumb; Vesper personalized temptation; Lorne visible defiance; Chapter 5 opened; character participation reflects run state
- `assetNotes`: reuse scholar/civic, retaining-wall, and casino backgrounds; no new elemental creature, material, patron, or reward authorized here

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 伊萊把遺跡拓圖攤在桌上。四條刻槽各自通向火災、霜裂、雷擊與毒斑最嚴重的地區，中央缺口則朝向山裡。 |
| 2 | any | enter | `town_scholar,village_elder,blacksmith,herbalist` | - | Town scholar, elder, blacksmith and Mia enter around the civic table. |
| 3 | any | speaker | `town_scholar` | `guarded` | 這些槽原本把四種流向分開。現在每一條都在往中央失去力量，流動時間也一天比一天接近。 |
| 4 | any | speaker | `blacksmith` | `neutral` | 遺跡旁的舊固定件不是拿來鎖住泰坦，是替這四條槽分擔震動。現在多半斷了。 |
| 5 | any | speaker | `herbalist` | `guarded` | 四種症狀目前還出現在不同病人身上。照這個速度靠近，下一次未必會分開。 |
| 6 | any | exit | `blacksmith,herbalist` | - | 鐵匠帶走拓下的固定件尺寸，米婭也回去核對四類病人的症狀時間。 |
| 7 | first_run | narration | - | - | 芙蕾的位置空著。塔維送來的後標時間筆直、完整，字卻像從一個已經不允許自己害怕的人手裡寫出來。 |
| 8 | second_run | enter | `standard_bearer_frey,lamplighter_tavi` | - | Frey and Tavi enter with separate front/rear timing sheets; both are tired and visibly alive. |
| 9 | second_run | speaker | `standard_bearer_frey` | `neutral` | 前旗先晃，後燈晚兩息。地震是從山的方向一路傳到灰脊。 |
| 10 | second_run | speaker | `lamplighter_tavi` | `guarded` | 我記了三次。每次都一樣。我怕記錯，所以……多記了一次。 |
| 11 | second_run | exit | `standard_bearer_frey,lamplighter_tavi` | - | 芙蕾帶塔維回南門補完值勤紀錄，兩張時間表留在桌上。 |
| 12 | any | speaker | `village_elder` | `guarded` | 二十年前也有不同地方接連出事。我們一處一處處理，沒有人把地下的走向疊在一起看。 |
| 13 | any | narration | - | - | 老人把現在的四條線與遠征路形重疊。所有缺口都朝山邊同一片區域靠攏。 |
| 14 | any | exit | `town_scholar,village_elder` | - | 伊萊留下重疊後的路圖，村長回到灰脊善後名單前。 |
| 15 | any | narration | - | - | 公務室外，艾洛蹲在從遺跡帶回的斷石旁，把耳朵貼近新露出的槽口。 |
| 16 | any | enter | `street_beggar` | - | Ailo enters at the retaining wall without joining the evidence table. |
| 17 | any | speaker | `street_beggar` | `guarded` | 石頭走了。下面要開一口。哨子呢？山聽不見。她說我太快……又太快。 |
| 18 | any | exit | `street_beggar` | - | Ailo leaves before the wall settles; the protagonist records only the repeated words `下面` and `哨子`. |
| 19 | any | narration | - | - | 我離開公務室時，市集與鐵匠鋪都已減燈，賭場卻亮得像城鎮從未缺過油、煤或人。維斯珀在門內等著，不需要別人通知他灰脊的結果。 |
| 20 | any | enter | `casino_owner,casino_dealer` | - | Vesper enters beside the showcase corridor; Lorne remains between him and the private table. |
| 21 | first_run | speaker | `casino_owner` | `soft` | 失去一個人以後，金幣突然顯得很便宜。你若想讓下一次不同，展示櫃還在。 |
| 22 | second_run | speaker | `casino_owner` | `soft` | 把兩個人都帶回來，只會更清楚「差一點」值多少。你若想讓下一次也不同，展示櫃還在。 |
| 23 | any | speaker | `casino_dealer` | `guarded` | 公開桌已經結算。今晚不接私人抵押。 |
| 24 | any | speaker | `casino_owner` | `pleased` | 你開始替我決定，哪一種恐懼不值錢了？ |
| 25 | any | narration | - | - | 洛恩沒有重開桌面。維斯珀也沒有當場責罵，只將洛恩的抵押頁折出一個新的角。 |
| 26 | any | exit | `casino_owner,casino_dealer` | - | 維斯珀收起抵押頁，洛恩留下關閉的桌面；四象路圖則在公務室等到天亮。 |

## Chapter 5 Detailed Screenplay V1

Status: `accepted`. This chapter fixes the ratchet test before
injury, preserves the same Boss wound in both runs, and separates Mia's fate
from every true-kill material route.

### `ch5_s01_four_fronts_converge`

- `title`: 四條異常指向同一處
- `stageClass`: `town_scene`
- `background`: civic room with four route reports, patient records, and damaged equipment arranged around one map
- `worldState`: Chapter 5 opening; fire, ice, thunder, and poison fronts now peak on one rhythm
- `viewpoint`: `protagonist_limited`
- `participants`: town scholar, Mia, blacksmith, village elder
- `entry`: the exposed ruin-channel survey is placed beside four current route reports
- `exit`: four-front regional canvas and required preparation open
- `objective`: prove whether four regional hazards are expressions of one mountain pressure line
- `inputs`: Chapter 4 four-channel hypothesis; ruin survey; patient and equipment records
- `outputs`: Elemental Lord route hypothesis; role division among Mia, 伊萊, blacksmith, and elder
- `assetNotes`: reuse civic background; no new NPC, affinity, or material introduced

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 四張地圖壓在遺跡拓圖四周。火線焦痕、冰層裂口、雷擊金屬與毒斑病例各自不同，位置卻正好沿著四條受損刻槽向山裡靠攏。 |
| 2 | any | enter | `town_scholar,herbalist,blacksmith,village_elder` | - | Town scholar, Mia, blacksmith and elder enter around the evidence table. |
| 3 | any | speaker | `town_scholar` | `guarded` | 四處回報的時間對不上同一場地震，位置卻都沿著遺跡的刻槽。先別把它們當成四個源頭；我們得去現場確認這些力量最後流向哪裡。 |
| 4 | any | speaker | `herbalist` | `guarded` | 症狀會輪替。先灼熱，再失溫，接著抽搐，最後出現毒性麻痺。現在還分散在人身上，不能假設永遠如此。 |
| 5 | any | speaker | `blacksmith` | `neutral` | 裝備也照這順序壞。先軟、再脆、再被雷沿著裂口走一遍，最後連皮帶都發黑。 |
| 6 | any | speaker | `village_elder` | `grieving` | 遠征時也看過。當時我們只顧著一處一處打過去，以為麻煩變多代表快到源頭。 |
| 7 | any | narration | - | - | 老人把四條線延長。它們沒有停在各自的區域，而是在山邊同一處尚未標名的壓力帶交會。 |
| 8 | second_run | narration | - | - | 我記得交會處會產生第一塊四象裂片，卻不能拿尚未發生的事說服眾人。這一次，每種殘留都會留下可比較的處理紀錄。 |
| 9 | any | speaker | `herbalist` | `resolute` | 先準備能準備的。任何人接觸殘留都要記時間、溫度和症狀，不准只寫「撐得住」。 |
| 10 | any | exit | - | - | Open four-front routes, advanced forge preparation, and evidence-return requirements. |

### `ch5_s02_forge_contracts`

- `title`: 鍛爐前的準備
- `stageClass`: `town_scene`
- `background`: advanced forge with blueprint table, standard extraction tools, and neutral anchor housings
- `worldState`: Chapter 5 preparation; first run ordinary Boss gear; second run achievement-informed tool audit and true-kill housings
- `viewpoint`: `protagonist_limited`
- `participants`: blacksmith, Mia, town scholar
- `entry`: elite materials and four routine separated-residue records collected by route crews before the convergence survey arrive at the forge
- `exit`: first run leaves with prepared gear; second run also opens pressure tests before departure
- `objective`: prepare chapter-appropriate equipment and inspect every tool that may touch unstable residue
- `inputs`: four-front route hypothesis; advanced forge route; second-run achievements/materials when applicable
- `outputs`: advanced forge; first-run `unscoped_handling_summary`; second-run ratchet memory, `summary_scope_challenged`, and neutral execution housings
- `assetNotes`: blueprint art remains deferred; no special sword, miracle tool, or new material

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 鐵匠把委託分成三疊：能用現有材料完成的、必須等菁英來源的，以及寫得再漂亮也不會憑空長出材料的。 |
| 2 | any | enter | `blacksmith,herbalist,town_scholar` | - | Blacksmith enters at the blueprint table; Mia checks tongs and forceps intended for sample handling while town scholar opens the four source records. |
| 3 | any | speaker | `blacksmith` | `neutral` | 能用的料放左邊，還缺的放右邊。先說你要它擋火、抗寒，還是撐住雷擊。別指著一塊礦要我什麼都做。 |
| 4 | any | speaker | `herbalist` | `guarded` | 先讓我看接觸紀錄。有些殘留會讓手指發麻，別直接送上砧台。 |
| 5 | any | narration | - | - | 米婭把標準取物鉗交回。鐵匠壓下固定棘輪，金屬發出清楚的一聲喀響。 |
| 6 | any | narration | - | - | 伊萊攤開四份原始頁。每頁紙角都註有採樣地點、鉗具編號與棘輪格數。他另取一張空白紙，準備整理成能貼在工具箱裡的現場摘要。 |
| 7 | first_run | speaker | `town_scholar` | `neutral` | 原頁都留著。現場先看這行就好：標準二格固定，可安全處理。短一點，才有人真的會看。 |
| 8 | first_run | narration | - | - | 米婭核對鉗具編號，鐵匠核對棘輪格數。伊萊等兩人簽過名字，才把原頁收回夾冊，將摘要貼到工具箱內側。 |
| 9 | second_run | narration | - | - | 棘輪再次發出喀響。我想起那杯冷水，立刻阻止鐵匠繼續收緊鉗口，並指向伊萊手邊尚未簽定的摘要。 |
| 10 | second_run | speaker | `blacksmith` | `guarded` | 哪裡不對？這棘輪每一格我都量過。四份紀錄也都說撐得住。 |
| 11 | second_run | speaker | `player` | `neutral` | 這四頁都是分開的殘留。交會以後呢？有誰試過？ |
| 12 | second_run | speaker | `town_scholar` | `guarded` | 等等。四頁證明的是分開，不是交會。這張摘要不能簽；我把不知道的地方抄掉了。 |
| 13 | second_run | speaker | `herbalist` | `resolute` | 那就先拆棘輪，再找能分散力道的接觸方式。真有人帶著這類東西回來時，不會有時間臨場爭論；我們現在還有時間試。 |
| 14 | second_run | speaker | `town_scholar` | `neutral` | 我記樣本狀態、壓力與收縮時間。結論和適用範圍寫在同一行，誰也不准替紙猜。 |
| 15 | second_run | narration | - | - | 另一側，生命種子、古代符文與純淨森林精華／微光媒介被裝入三個中性外殼。它們不綁定劍、槍、斧或任何單一武器。 |
| 16 | second_run | speaker | `blacksmith` | `neutral` | 三個外殼，接你當時拿的裝備。最後一下由你自己打，別讓哪把名劍替人決定怎麼贏。 |
| 17 | any | exit | - | - | Open advanced forge actions; first run carries the unscoped field summary, while second run records ratchet memory, challenged scope, and execution housings ready. |

### `ch5_s03_elemental_convergence`

- `title`: 四象交會
- `stageClass`: `regional_canvas`
- `background`: handcrafted four-front approaches converging on one widening mountain pressure line
- `worldState`: Chapter 5; cycling fire, ice, thunder, and poison conditions
- `viewpoint`: `protagonist_limited`
- `participants`: village elder at the final survey point; Mia, scholar, and blacksmith appear only in second-run test insert before Boss commitment
- `entry`: player completes each authored front and returns a fresh current-run residue batch distinct from the earlier routine separated samples
- `exit`: Elemental Lord core opens after evidence and second-run pressure test resolve
- `objective`: trace all four flows to one core and, in the second run, prove a pressure-free handling method
- `inputs`: countergear; forge preparation; ratchet memory in second run
- `outputs`: convergence core opened; second-run `pressure_free_handling_proven`
- `assetNotes`: four-front regional states and one test-table insert; reuse spider silk and slime gel

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 四條前線沒有在地圖中心相撞，而是依序被同一條山脈裂線吸入。火熄後結霜，霜裂後引雷，雷痕最後滲出毒色。 |
| 2 | any | enter | `village_elder` | - | Elder enters at the final survey marker, comparing the geometry with expedition memory. |
| 3 | any | speaker | `village_elder` | `guarded` | 二十年前，我們也是沿著四處異常一路往裡走。每處都清掉了一些怪物，卻沒發現它們正把我們帶到同一個地方。 |
| 4 | first_run | narration | - | - | 工具箱裡只夾著伊萊整理過的單元素處理頁，最上方寫著「標準二格固定，可安全處理」。四種殘留尚未在盤中相遇，沒有人見過它們離體後會如何變化。 |
| 5 | second_run | narration | - | - | 出發前，我從四條前線帶回少量殘留，讓它們在同一只耐熱盤中接觸。這不是伊萊先前紀錄的分離樣本。四者相遇後，開始依固定節拍收縮。 |
| 6 | second_run | enter | `herbalist,town_scholar,blacksmith` | - | Mia, town scholar and blacksmith enter the test insert; the fixed ratchet has been removed. |
| 7 | second_run | speaker | `town_scholar` | `guarded` | 第一次收縮在接觸後兩息。第二次更快。固定鉗口會在第三次前把壓力全部留在同一點。這次的頁首寫「交會樣本」，不准省。 |
| 8 | second_run | narration | - | - | 鐵匠以柔韌蛛絲環托住殘留，米婭只控制方向，不夾緊。樣本落入淨化史萊姆凝膠後仍保持完整。 |
| 9 | second_run | speaker | `blacksmith` | `pleased` | 好。它要縮就讓它縮，別給它一個能撞碎自己的硬角。 |
| 10 | second_run | speaker | `herbalist` | `guarded` | 這套東西留在我這裡，紀錄也別拿走。真用得上時，我沒空等誰回公務室翻原頁。 |
| 11 | any | narration | - | - | 最後一道壓力線打開。四種元素在核心處反覆塑成同一具身體，每次轉換都讓周圍的地面再次裂開。 |
| 12 | any | exit | - | - | Open Elemental Lord Boss location; lock second-run pressure-free setup in Mia's workroom. |

### `ch5_s04_elemental_lord`

- `title`: 元素之主
- `stageClass`: `location_scene`
- `background`: convergence core where four elemental flows form one unstable body
- `worldState`: Chapter 5 mainline Boss; same battle and same fatal-risk burst in both runs
- `viewpoint`: `protagonist_limited`
- `participants`: none; Elemental Lord uses full mainline Boss presentation
- `entry`: player reaches the core after all four fronts are traced
- `exit`: victory collapse embeds one intact four-element shard in the protagonist
- `objective`: defeat the Elemental Lord and survive the convergence collapse
- `inputs`: Elemental Lord location open; chapter preparation complete
- `outputs`: Elemental Lord cleared; protagonist disabled; intact shard embedded; immediate return-to-workroom state
- `assetNotes`: reuse full Boss art; death-burst staging needs effects later, not a new creature

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 核心先以火站起，下一息又被冰從內側撐裂。雷沿著裂口縫合形體，毒霧則填滿每一次失敗的呼吸。 |
| 2 | any | enter | - | - | Elemental Lord enters full-screen Boss presentation with readable phase changes. |
| 3 | any | narration | - | - | 它沒有名字、信仰或軍隊。四股壓力在同一處被迫成為一個會反擊的暫時意識。 |
| 4 | any | exit | - | - | 收起事件層，進入 Elemental Lord 戰鬥。 |
| 5 | any | enter | - | - | 戰鬥結束；四相形體失去平衡，核心向內塌縮。 |
| 6 | any | narration | - | - | 第一次爆裂是火，第二次把熱全部抽走。雷光緊接著穿過碎片，最後一層毒色把所有裂口推向外側。 |
| 7 | any | narration | - | - | 一塊尚未分裂的核心碎片穿過護具，斜插進肋骨間。它停在大血管旁，被骨與組織暫時卡住；拔出與位移比單純等待更快致命。 |
| 8 | any | narration | - | - | 四種能量沿碎片循環。肌肉失去控制，視野卻沒有立刻消失。這份延遲只夠一次穩定運送與一次手術。 |
| 9 | any | exit | - | - | Lock combat controls; transition directly into authored return segment `fourfold_shrapnel`. |

### `ch5_s05_fourfold_shrapnel`

- `title`: 肋間的四象裂片
- `stageClass`: `regional_canvas`
- `background`: authored emergency return segment from convergence core to town, then workroom threshold
- `worldState`: Chapter 5 emergency; travel encounters suppressed by fixed mainline transport; four symptoms cycle visibly
- `viewpoint`: `protagonist_limited`
- `participants`: Mia enters at the workroom threshold
- `entry`: protagonist is placed on a return litter without moving the embedded shard
- `exit`: sedation and operation scene begin immediately
- `objective`: reach Mia's workroom without dislodging the shard
- `inputs`: Elemental Lord defeated; protagonist disabled
- `outputs`: immediate surgery; first-run standard setup or second-run prepared pressure-free setup
- `assetNotes`: emergency route treatment and workroom operation threshold; no rescue errand

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 回程架每一次傾斜都讓碎片邊緣貼近脈搏。固定帶只限制身體，不碰那塊仍在肋間循環變色的核心。 |
| 2 | any | narration | - | - | 灼熱過後是幾乎感覺不到自己的寒冷；雷相讓手指抽動，毒相則把下一次呼吸拖得更長。 |
| 3 | first_run | narration | - | - | 城裡只有米婭具備足夠的傷口與取物經驗。標準鉗具、止血與鎮靜已備妥，沒有人知道體外收縮才是真正的新風險。 |
| 4 | second_run | narration | - | - | 工作間裡，拆掉棘輪的工具、蛛絲環與淨化凝膠都已就位。出發前完成的測試，現在成了唯一能立刻採用的處理方式。 |
| 5 | any | enter | `herbalist` | - | Mia opens the workroom door, checks the shard angle before anyone crosses the threshold. |
| 6 | any | speaker | `herbalist` | `resolute` | 不要拔。整張架一起進來，右邊先抬。有人去叫鐵匠，工具照我說的位置放。 |
| 7 | any | narration | - | - | 我被抬上工作台。米婭的聲音比視野清楚，她逐一要我辨認呼吸、手指與疼痛位置。 |
| 8 | any | speaker | `herbalist` | `soft` | 聽著我。你不用幫忙，也不用證明清醒。把下一口氣交給我就好。 |
| 9 | any | narration | - | - | 鎮靜藥壓低了光線，沒有完全帶走聲音。門栓落下，手術開始。 |
| 10 | any | exit | - | - | Transition directly to `mia_operation`; no map, market, or gathering action is available. |

### `ch5_s06_mia_operation`

- `title`: 米婭的手
- `stageClass`: `town_scene`
- `background`: Mia's herb workroom / operation state
- `worldState`: Chapter 5 fixed surgery; protagonist sedated with broken hearing; run state changes only shard handling and Mia's survival
- `viewpoint`: `split_limited` (`protagonist_limited` with broken hearing -> `character_limited:herbalist`)
- `knowledgeBoundary`: Audience follows Mia after the protagonist's senses fragment; the protagonist learns the causal details only from the later workroom review.
- `participants`: Mia, blacksmith
- `entry`: workroom is sealed and the embedded shard exposed without moving it
- `exit`: first run cuts to white elemental release and loss; second run cuts to intact shard resting in gel
- `objective`: remove the shard without tearing the nearby vessel
- `inputs`: embedded shard; first-run standard forceps plus `unscoped_handling_summary`, or second-run pressure-free setup plus `scoped_handling_record`
- `outputs`: protagonist saved in both runs; Mia death/achievement first run or Mia survival/achievement second run
- `assetNotes`: operation background/state required; no CG mandated unless later review proves ordinary layered staging insufficient

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 鎮靜把房間切成不連續的聲音。水盆、剪開布料、米婭報出脈搏，鐵匠把工具放到她伸手就能碰到的位置。 |
| 2 | any | cutaway | `herbalist` | `guarded` | 主角最後能連續辨認的，只剩米婭報出的脈搏。視野沉入黑暗後，她的手仍穩穩停在傷口上方；鐵匠守在工具台後，依她伸手的方向遞上器具。 |
| 3 | first_run | speaker | `herbalist` | `guarded` | 離體以後呢？第二格還在安全範圍？ |
| 4 | first_run | speaker | `blacksmith` | `guarded` | 四種紀錄都在安全範圍，沒有一份出現收縮。處理摘要也是標準鉗、第二格固定。 |
| 5 | first_run | speaker | `herbalist` | `resolute` | 好。沒有替代流程。照已知最低壓力托住，不拉；我先把黏連分開。 |
| 6 | first_run | narration | - | - | 碎片離開肋間時沒有撕開血管。米婭穩住手腕，把完整核心帶到體外。手術本身成功了。 |
| 7 | first_run | speaker | `herbalist` | `soft` | 好了。你回來了。 |
| 8 | first_run | narration | - | - | 體外失去組織支撐的碎片突然收縮。棘輪把鉗口固定在同一格，所有變化都擠回米婭掌前的一點。金屬發出第二聲喀響。 |
| 9 | first_run | narration | - | - | 碎片被壓碎。火、冰、雷與毒光在她掌中同時迸開，距離近得沒有反應或告別的時間。 |
| 10 | first_run | exit | `herbalist` | - | Mia dies immediately in the point-blank release. Cut sound before impact finishes; fade to protagonist waking later. |
| 11 | second_run | speaker | `blacksmith` | `guarded` | 棘輪已拆。蛛絲環受力均勻，凝膠在下方。沒有硬角。 |
| 12 | second_run | speaker | `herbalist` | `resolute` | 我控制方向，你只托住環。它縮就跟著縮，不准夾。 |
| 13 | second_run | narration | - | - | 碎片沿同一角度離開肋間。蛛絲環隨第一次收縮讓出空間，核心沒有撞上任何固定鉗口。 |
| 14 | second_run | speaker | `herbalist` | `soft` | 好了。你回來了。 |
| 15 | second_run | narration | - | - | 米婭把蛛絲環整體降入淨化史萊姆凝膠。第二、第三、第四次收縮都在柔軟介質裡完成，碎片保持完整。 |
| 16 | second_run | narration | - | - | 她的手直到工具放下後才開始發抖。鐵匠沒有碰她，只把水杯推到她能看見的位置。 |
| 17 | second_run | speaker | `blacksmith` | `soft` | 人和東西都在。先坐。這句妳平常很會說。 |
| 18 | second_run | exit | - | - | Mia survives; cut to warm water and post-operation review. |

### `ch5_s07_after_the_ratchet`

- `title`: 第二聲喀響之後
- `stageClass`: `town_scene`
- `background`: run-specific Mia workroom aftermath, then scholar desk review
- `worldState`: first run quiet loss or second run exhausted survival
- `viewpoint`: `protagonist_limited`
- `participants`: town scholar, blacksmith, Mia only in second run
- `entry`: protagonist wakes after the operation
- `exit`: achievement and relationship record resolve; expedition-list scene opens
- `objective`: trace shared responsibility without inventing one reckless culprit or creating a second cure
- `inputs`: operation result
- `outputs`: first-run `醒來時，水已經涼了` and `最後一頁`; second-run `醒來時，水仍溫著` and protected-operator principle
- `assetNotes`: quiet-after-loss and living-after-rescue workroom treatments; `藥師手記` remains text only

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | first_run | narration | - | - | 醒來時，床邊的水已經涼了。工作台清空，窗仍關著，米婭平常坐的椅子被推到牆邊。 |
| 2 | first_run | narration | - | - | 米婭的手記停在最後一頁。上面只留下兩句話：「醒來後先給他水。別讓他立刻起身。」 |
| 3 | first_run | enter | `town_scholar,blacksmith` | - | Scene shifts to scholar desk; town scholar and blacksmith enter with the broken forceps and 伊萊's field summary sealed on the same cloth. |
| 4 | first_run | speaker | `town_scholar` | `grieving` | 摘要是我寫的。原頁都在這裡。我把它們抄短了。 |
| 5 | first_run | speaker | `blacksmith` | `grieving` | 鉗口沒滑，棘輪也沒壞。我看過那行字，沒有再問。 |
| 6 | first_run | speaker | `town_scholar` | `hurt` | 她問了。我們卻拿四份分開的紀錄，回答了交會以後的問題。 |
| 7 | first_run | narration | - | - | 伊萊把摘要拆下來，與四份原頁並排放好。筆尖停在「安全」兩字旁，許久沒有落下。 |
| 8 | first_run | speaker | `blacksmith` | `hurt` | 鉗子先放這裡。今天別修。 |
| 9 | first_run | exit | - | - | Unlock hidden achievement `醒來時，水已經涼了`; Mia research stops, baseline market medicine remains; 伊萊 enters the first-run confidence-collapse state. |
| 10 | second_run | narration | - | - | 醒來時，水仍溫著。米婭坐在床邊，兩手捧著自己的杯子，沒有假裝那只是一次普通手術。 |
| 11 | second_run | enter | `herbalist,town_scholar,blacksmith` | - | Mia enters foreground; later transition includes town scholar and blacksmith with the intact shard, four source pages, and the revised record. |
| 12 | second_run | speaker | `herbalist` | `pleased` | 先喝水。這次我可以親自確定你沒有立刻起身。 |
| 13 | second_run | speaker | `player` | `neutral` | 妳的手呢？ |
| 14 | second_run | speaker | `herbalist` | `guarded` | 在發抖。會停。下一次準備裡要寫操作者的位置，不只寫病人。 |
| 15 | second_run | narration | - | - | 完整碎片放在凝膠中央。四份分離樣本原頁壓在左側，新頁把「交會樣本、無固定壓力、柔性承托」寫在同一欄；鐵匠補上接觸結構，米婭補上醫療角度與人員防護。 |
| 16 | second_run | speaker | `town_scholar` | `soft` | 這頁只寫今天做過的：交會樣本、沒有固定壓力、柔性承托。沒試過的，我留白。 |
| 17 | second_run | speaker | `blacksmith` | `pleased` | 總算肯把空白留著了。下次那聲喀響不對，有人先開口。 |
| 18 | second_run | speaker | `herbalist` | `soft` | 也先問動刀的人缺什麼。不要等病人躺上來才補。 |
| 19 | second_run | exit | - | - | Unlock `醒來時，水仍溫著`; Mia survives, 伊萊's scoped-record correction resolves, and later recipe/relationship states remain available. |

### `ch5_s08_expedition_list`

- `title`: 二十年前的遠征名冊
- `stageClass`: `town_scene`
- `background`: civic archive with twenty-year expedition lists, Kaedren evidence, and the old seal-scar shard record
- `worldState`: Chapter 5 late; run-specific town loss affects who is absent, not the historical evidence
- `viewpoint`: `protagonist_limited`
- `participants`: village elder, town scholar
- `entry`: four-front geometry is laid over the expedition route and local command records
- `exit`: first run seeds elder's secret departure; second run exposes his preparations early
- `objective`: reconstruct how the expedition reached and damaged the dragon-held perimeter
- `inputs`: four-front convergence; Kaedren record; Mia father tag; current run operation aftermath
- `outputs`: expedition truth; seal-scar context; elder departure/prevention chain
- `assetNotes`: reuse archive/civic room; supreme commander remains clue-only inside mandatory scenes and receives no external-route art before approval

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 伊萊把遠征分成三層：村鎮自發的隊伍、凱德倫等地方線指揮，以及更前方尚未具名的總隊長。沒有一張紙能把三者簡化成同一個人。 |
| 2 | any | enter | `village_elder,town_scholar` | - | Elder and town scholar enter; the protagonist remains through narration and questions. |
| 3 | first_run | narration | - | - | 他把預先印好的「安全通路」抬頭裁掉，只留下「最後可證實位置」，又將四份原頁、摘要與碎片收縮時間全部攤開，決定在天亮前重建每一處被省略的範圍。從米婭死後，那個字必須比他的手更慢。 |
| 4 | second_run | narration | - | - | 新的處理頁在入夜前便完成歸檔，把樣本狀態、測試方法、適用範圍與未知項目留在同一欄。伊萊把它釘在舊摘要上，不讓修正抹掉曾經的錯。 |
| 5 | any | speaker | `town_scholar` | `neutral` | 前段確實有勝利。路上的怪物被清掉，失聯點逐一往山裡推。這也是他們相信自己能處理下一道阻礙的原因。 |
| 6 | any | speaker | `player` | `neutral` | 到外圍時，你們已經知道後面的人死了。為什麼還往前？ |
| 7 | any | speaker | `village_elder` | `grieving` | 故鄉就在後面壞掉。我們只看見龍、火和一條不讓人過的線，以為前面每個阻擋都在害它。 |
| 8 | any | narration | - | - | 人類用工具與武力破壞外圍。封痕碎片從那次損傷落下，內側壓力與龍火同時爆發，遠征在兩者之間被摧毀。 |
| 9 | any | speaker | `village_elder` | `guarded` | 龍沒有救我們，也不在乎為什麼來。牠們只看見一群拿武器的人把封住的地方再打開。 |
| 10 | any | speaker | `town_scholar` | `guarded` | 這能證明人類造成過傷口，不能證明龍會相信下一個人類。還缺一條不去破壞寬路的辦法。 |
| 11 | any | narration | - | - | 米婭父親的補給編次停在外圍以前。他的最後位置仍不明，名冊沒有把個人失蹤硬塞進封痕答案。 |
| 12 | first_run | narration | - | - | 老人把封痕碎片的收存欄默默合上。他的手停在米婭與芙蕾的名字旁，過了一會兒才把名冊推回伊萊面前。 |
| 13 | first_run | speaker | `village_elder` | `soft` | 夠了。今天先到這裡。你們都該睡。 |
| 14 | second_run | narration | - | - | 我注意到村長的靴底剛補過，乾糧少了一份，封痕碎片的收存欄也被提前清空。他正在準備獨自離開。 |
| 15 | second_run | speaker | `town_scholar` | `guarded` | 你又想一個人去。二十年前是大家太相信人多，現在別用人少重演一次。 |
| 16 | any | exit | - | - | Seal-scar truth locks; open whistle cache and before-dawn town gate sequence. |

### `ch5_s09_whistle_cache`

- `title`: 舊驛站的雙孔哨
- `stageClass`: `location_scene`
- `background`: newly exposed old waystation cache built by the destroyed mountain settlement
- `worldState`: Chapter 5 after elemental movement; acoustic route tool preserved in a dry stone recess
- `viewpoint`: `protagonist_limited`
- `participants`: street_beggar only in second run
- `entry`: pressure shift exposes a storage seam on the old mountain approach
- `exit`: Echo Whistle enters current-run inventory; second run records Ailo's practical recognition
- `objective`: identify the recovered route tool without turning it into magic or inherited knowledge
- `inputs`: Elemental Lord cleared; expedition route context
- `outputs`: current-run Echo Whistle; second-run `ailo_recognized_whistle`
- `assetNotes`: Echo Whistle item art required later only if absent; cache background later; no new guide NPC

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 新裂縫後方不是墓室，而是一處乾燥路站。牆上刻著兩短一長的音紋，石架放著一只磨舊的雙孔哨。 |
| 2 | any | narration | - | - | 哨子不打開門，也不召喚道路。兩個固定音高會在山中盲彎產生不同回聲，熟悉地形的人能用回音長短判斷藏在崩壁後的轉向。 |
| 3 | first_run | narration | - | - | 沒有人能完整讀懂音紋。它被登記為山地路具，放進我的背包等待實際用途。 |
| 4 | second_run | narration | - | - | 我依艾洛長期重複的聲音碎片帶他來到路站。乞丐看見哨子時，先用手遮住其中一孔。 |
| 5 | second_run | enter | `street_beggar` | - | Street beggar enters; he does not become a lucid lore guide. |
| 6 | second_run | speaker | `street_beggar` | `afraid` | 不能一起吹。山會把兩條路疊起來。她討厭我吹錯，說花都被我嚇跑。 |
| 7 | second_run | narration | - | - | 我問「她」是誰。他立刻把哨子推回，答案又碎成摸得到卻排不好的片段。 |
| 8 | second_run | speaker | `street_beggar` | `guarded` | 先上去，再回來。她在上面等，不在這塊爛石頭裡。 |
| 9 | second_run | narration | - | - | 哨聲在兩處封死的盲彎後傳回不同長度的回音。這足以證明山邊另有本地人使用的窄路；至於艾洛為何認得聲音，他只抱緊破布，不肯回答。 |
| 10 | any | exit | - | - | Add Echo Whistle to current-run inventory; return to town before the dragon departure. |

### `ch5_s10_before_dawn`

- `title`: 天亮以前
- `stageClass`: `town_scene`
- `background`: civic room and South Gate before dawn
- `worldState`: Chapter 5-to-6 bridge; first run elder already gone when discovered, second run intercepted alive
- `viewpoint`: `protagonist_limited`
- `participants`: village elder in second run, town scholar in both aftermaths
- `entry`: seal-scar storage is found empty before the morning departure check
- `exit`: first run starts elder search; second run receives the shard alive and keeps elder in town
- `objective`: determine where the elder went or stop him before he crosses South Gate
- `inputs`: expedition list; Echo Whistle; `封痕前的老人` in second run
- `outputs`: first-run `elder_departed`; second-run `elder_alive_shard_given`
- `assetNotes`: dawn gate state; no new relic beyond current-run seal-scar shard

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | first_run | narration | - | - | 伊萊整夜在副桌重抄四份原頁與那張摘要。等他從「安全」兩字抬頭，村長的椅子已冷。 |
| 2 | first_run | enter | `town_scholar` | - | Town scholar crosses from the record-covered side table into the empty civic room and reads the omissions rather than a farewell note. |
| 3 | first_run | speaker | `town_scholar` | `afraid` | 封痕碎片不在。乾糧少一份。南門也沒有登記。 |
| 4 | first_run | narration | - | - | 桌上沒有命令或告別。補過的靴印從南門外開始，沿著二十年前遠征留下的舊路往北。 |
| 5 | first_run | exit | - | - | Lock elder departed; open Chapter 6 pursuit and seal-scar aftermath. |
| 6 | second_run | narration | - | - | 處理紀錄在入夜前完成。伊萊有時間發現封痕收存欄提早清空，並把靴底、乾糧與缺頁交給我。清晨，我們在南門開啟前等著；老人沒有料到兩個人已讀懂他的準備。 |
| 7 | second_run | enter | `village_elder,town_scholar` | - | Elder enters at the closed gate; town scholar arrives after the confrontation begins. |
| 8 | second_run | speaker | `village_elder` | `angry` | 讓開。這不是你該替我付的東西。 |
| 9 | second_run | speaker | `player` | `neutral` | 碎片留在我這裡。到警戒線前我會停下；牠要我放下武器，我就放。艾洛認得哨聲，我不必再闖那條寬路。 |
| 10 | second_run | speaker | `village_elder` | `guarded` | 知道另一條路，不代表龍會信你。牠們二十年前不在乎我們為什麼來，現在也一樣。 |
| 11 | second_run | speaker | `town_scholar` | `resolute` | 你昨晚少拿了一份乾糧。二十年前出發前，你也把自己的名字漏在最後。這次不行。 |
| 12 | second_run | narration | - | - | 老人沉默很久，最後把封痕碎片放進我的手裡，而不是當成死後遺物留下。 |
| 13 | second_run | speaker | `village_elder` | `grieving` | 到線前停。牠叫你放下武器，就放。別替我解釋二十年前的人為什麼害怕，牠不欠我們那份耐心。 |
| 14 | second_run | speaker | `village_elder` | `soft` | 牠看了未必讓你過。你只要讓牠知道，這道傷是人打開的，我們沒有再裝作不知道。 |
| 15 | second_run | exit | - | - | Elder returns to town; add current-run seal-scar shard and open the evidence-bound non-attack chain. |

### `ch5_s11_town_loses_its_voice`

- `title`: 城鎮少了幾種聲音
- `stageClass`: `memory_or_ending`
- `background`: fixed town montage across workroom, South Gate, forge, civic room, and casino table
- `worldState`: Chapter 5 close; first-run losses or second-run strained survival
- `viewpoint`: `audience_montage`
- `knowledgeBoundary`: Audience sees simultaneous town absences and the casino table being prepared; the protagonist receives no hidden motive or contract knowledge.
- `participants`: Mia by state, Frey by state, Tavi, blacksmith, town scholar, village elder by state, casino_dealer, casino_owner
- `entry`: montage begins after elder departure/prevention
- `exit`: Chapter 6 opens on immediate elder pursuit; the prepared casino
  settlement remains unresolved until the player returns from the perimeter
- `objective`: no player task; register the human cost that will shape the next chapter
- `inputs`: all Chapter 4-5 character fates
- `outputs`: run-specific town temperature; Vesper settlement setup; Chapter 6 open
- `assetNotes`: montage reuses accepted place states; no unique CG required

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | first_run | narration | - | - | 米婭的工作間仍能進去，卻不再有新處方。市集照舊出售已授權的基礎藥，沒有人被推上她的位置假裝一切沒變。 |
| 2 | first_run | narration | - | - | 南門的旗降到半高。塔維準時點燈，動作比從前穩，臉上卻沒有「回來」這件事。 |
| 3 | first_run | narration | - | - | 鐵匠鋪只響一次錘。伊萊翻頁變慢，村長的椅子空著，沒有人願意先說下一條路仍得有人走。 |
| 4 | second_run | narration | - | - | 米婭的窗仍關著，但她把母親房間堆在門前的一只箱子移開。芙蕾與塔維各自守著旗和燈，村長則第一次把封痕紀錄留在公務桌上。 |
| 5 | second_run | narration | - | - | 鐵匠的笑罵仍能越過街道，伊萊把新處理紀錄釘在舊頁旁。所有人都疲倦，卻沒有人被迫用缺席完成自己的弧線。 |
| 6 | any | narration | - | - | 賭場深處，維斯珀翻開洛恩的抵押頁。沒有人記得另一段人生；他的懷疑只來自眼前累積的細小違抗。 |
| 7 | any | enter | `casino_owner,casino_dealer` | - | Casino owner and dealer enter at the main table; Vesper places the guest dice beside Lorne's contract. |
| 8 | any | speaker | `casino_owner` | `pleased` | 你最近讓太多人帶著尚未輸完的東西離桌。洛恩，我想我們該重新結算你的忠誠。 |
| 9 | any | speaker | `casino_dealer` | `guarded` | 規則寫明結算需要見證人。你不會反對自己的規則。 |
| 10 | any | speaker | `casino_owner` | `soft` | 當然不會。公平，是這間屋子最昂貴的表演。 |
| 11 | any | exit | - | - | Cut from the guest dice to South Gate opening before sunrise. Begin the Chapter 6 elder pursuit immediately; Vesper keeps the witnessed settlement staged until the player returns. |

## Chapter 6 Detailed Screenplay V1

Status: `complete_pending_user_review`. The elder/dragon section is accepted and
distinguishes non-attack from permission. The completed casino settlement review
now follows the urgent elder pursuit. Every reversal relies on current-run
evidence plus achievement memory; no NPC remembers the first run.

### `ch6_s01_northern_drake_watch`

- `title`: 北境龍哨
- `stageClass`: `regional_canvas`
- `background`: handcrafted `northern_drake_watch` and `dragon_heat_crag` approach
- `worldState`: Chapter 6 dawn pursuit; dragon heat marks form a containment boundary rather than an invasion path
- `viewpoint`: `protagonist_limited`
- `knowledgeBoundary`: The protagonist sees tracks, carried weight, scorch direction, and patrol behavior. The elder's private thoughts, expectation of survival, and exact final words remain unknown.
- `participants`: none
- `entry`: player leaves South Gate immediately after discovering or preventing the elder's solitary departure
- `exit`: seal warning line becomes visible
- `objective`: follow the elder while distinguishing deliberate dragon containment from outward conquest
- `inputs`: elder departed or elder alive; current-run Echo Whistle; current-run seal-scar shard only in second run
- `outputs`: protagonist-observed elder route and inward-fire evidence; unresolved or demonstrated outside echo; warning-line objective
- `assetNotes`: regional dragon approach backgrounds; no elder death cutaway or new dragon spokesperson

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | first_run | narration | - | - | 濕土裡只有一行腳印。村長補過的右靴壓得較淺，半月形的鞋紋從南門一路朝焦黑山坡延伸。 |
| 2 | first_run | narration | - | - | 腳印沒有折返，也沒有第二個人跟上。幾處較深的落腳旁留著細小石屑，像是他一路握著某件有重量的東西。 |
| 3 | second_run | narration | - | - | 濕土上沒有老人的鞋印。封痕碎片仍在我的行囊裡，山路只留下昨夜巡防與獸群踩過的痕跡。 |
| 4 | any | narration | - | - | 越接近高處，燒痕越密。焦黑草葉全朝山內倒伏，高處的飛影只驅趕靠近警戒石的生物，沒有追下山坡。 |
| 5 | first_run | narration | - | - | 我試吹雙孔。兩個回音在崩壁前撞在一起，分不出哪一聲來自前方，哪一聲貼著山壁折返。 |
| 6 | second_run | narration | - | - | 依艾洛聽見哨聲時的動作，我遮住一孔，只吹一短音。回聲沿焦界外側返回，仍沒有給出第一個盲彎的轉向。 |
| 7 | second_run | narration | - | - | 碎片一面保留鑿痕，另一面被高熱熔成黑亮的薄層。靠近警戒石時，它隔著布袋開始發熱。 |
| 8 | any | narration | - | - | 前方忽然亮了一次。熱風從山內壓下來，霧裡短暫露出一塊焦黑石碑，以及停在碑前的最後一段路。 |
| 9 | any | exit | - | - | Mark inward fire and run-specific echo evidence; open the seal-scar investigation without resolving the road. |

### `ch6_s02_scar_aftermath`

- `title`: 封痕前的老人
- `stageClass`: `location_scene`
- `background`: seal warning line near the charred obelisk, where dragon fire meets recurring scar pressure
- `worldState`: first-run elder death aftermath or second-run empty warning line before the same recurring surge
- `viewpoint`: `protagonist_limited`
- `participants`: none
- `entry`: player reaches the point where the elder attempted to return the shard
- `exit`: Elder Dragon becomes visible beyond the line
- `objective`: read what killed the elder without granting the player knowledge the scene cannot prove
- `inputs`: dragon approach complete; elder fate state
- `outputs`: first-run elder body, seal-scar shard, and `封痕前的老人`; second-run three-part observable proof prepared
- `assetNotes`: warning-line background needs body/no-body variants; no death CG required

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | first_run | narration | - | - | 村長倒在警戒石外。身上沒有爪痕，腰側的武器也沒有出鞘；最後幾枚鞋印停在石碑前，旁邊壓著一處清楚的膝痕。 |
| 2 | first_run | narration | - | - | 封痕碎片落在他伸出的手前。斷面與石碑缺口相合，碎片邊緣還沾著掌心擦破留下的血；他曾用手把它往前推。 |
| 3 | first_run | narration | - | - | 缺口內側覆著向外鼓起的黑痕，外側則有一道龍火灼痕迎面壓回。兩股力量在村長倒下的位置交會，又沿他身後的石面燒成直線。 |
| 4 | first_run | narration | - | - | 沒有遺書。收在鞘裡的武器、只有一人的腳印，以及被推向缺口的碎片，已經留下他最後做過的事。我把碎片收回行囊。 |
| 5 | first_run | narration | - | - | 我在手札記下三件事：武器未出鞘、碎片被推向缺口、龍火只落在封線內側。 |
| 6 | second_run | narration | - | - | 同一位置沒有屍體，也沒有新填補痕。碎片仍在我手中；我看清相合的斷面，沒有把它推進缺口。 |
| 7 | any | narration | - | - | 封痕再次向外鼓起，巨大陰影落在警戒線內側。龍火沿缺口壓回黑流，沒有越線追擊。牠停下來看我下一步把腳放在哪裡。 |
| 8 | any | exit | - | - | Open the direct Elder Dragon warning at the same location; first run carries physical evidence and urgency, second run carries observable restraint. |

### `ch6_s03_stop_before_the_line`

- `title`: 停在線外
- `stageClass`: `location_scene`
- `background`: same seal warning line with Elder Dragon occupying the full depth beyond it
- `worldState`: Chapter 6 confrontation under a recurring pressure pulse; first-run armed crossing or second-run evidence-bound stop
- `viewpoint`: `protagonist_limited`
- `participants`: elder_dragon through the existing full Boss illustration
- `entry`: Elder Dragon issues one direct stop order before any attack
- `exit`: first run opens battle; second run proves only that immediate attack is unnecessary
- `objective`: make the two linear runs diverge through knowledge and observable action, not sudden dragon trust
- `inputs`: matched seal-scar evidence; run-specific Echo Whistle understanding; elder fate; advancing regional pressure
- `outputs`: first-run war gate or second-run `dragon_non_attack_observed`
- `assetNotes`: reuse Elder Dragon Boss art for dialogue; no separate dragon portrait or spokesperson

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | enter | `elder_dragon` | - | Elder Dragon enters in the existing full Boss illustration; other dragons remain distant silhouettes, not new speaking characters. |
| 2 | any | speaker | `elder_dragon` | `resolute` | 停下。 |
| 3 | any | narration | - | - | 聲音不是邀請。龍爪停在封線內側，沒有越過牠自己守的界；牠只看我的腳、武器與那塊相合的碎片。 |
| 4 | first_run | narration | - | - | 我在警戒石前短暫停下，指向村長與山內正在搏動的黑壓。背包裡的哨子吹不出可走的順序，眼前也沒有第二條看得見的路。 |
| 5 | first_run | speaker | `elder_dragon` | `guarded` | 二十年前，人類用鐵器打開這道缺口。放下武器，退回去。 |
| 6 | first_run | narration | - | - | 我舉起碎片。它能承認人類造成損傷，不能說明如何繞開；腳下同一個四相節律沿來路震回，下一輪外洩已朝村鎮方向延伸。 |
| 7 | first_run | speaker | `elder_dragon` | `angry` | 山外的死傷與我無關。再往前，我會動手。 |
| 8 | first_run | speaker | `player` | `resolute` | 山下還有人。我退回去，這股東西也不會停。你不讓我過，也不肯說怎麼停它。 |
| 9 | first_run | exit | - | - | Lock the armed crossing as a rational decision under incomplete knowledge; open Elder Dragon battle. |
| 10 | second_run | narration | - | - | 我在線外停下，把武器完整放在身後地面，再將碎片放到相合缺口前方、仍屬警戒線外的位置。我沒有把它塞回傷口。 |
| 11 | second_run | speaker | `elder_dragon` | `guarded` | 那是你們留下的傷。帶回來，不是贖清。 |
| 12 | second_run | speaker | `player` | `neutral` | 我不碰封線。我只找山民留下的路。 |
| 13 | second_run | narration | - | - | 我依艾洛本輪的反應遮住一孔，吹出一短音；回聲沿封火外側返回，不穿過封痕。 |
| 14 | second_run | speaker | `elder_dragon` | `guarded` | 山民的窄聲。它在我們的火外。墜落者來時，那些聲音停了。 |
| 15 | second_run | narration | - | - | 黑壓再次撞上缺口，碎片被震得向線內滑動。我退後一步，沒有伸手越線；龍火從面前落下，把碎片推回外側。 |
| 16 | second_run | speaker | `elder_dragon` | `resolute` | 撿起你的鐵，沿外面的回聲走。別越線。 |
| 17 | second_run | narration | - | - | 龍爪重新壓住缺口。牠沒有讓路，也沒有再向我逼近。 |
| 18 | second_run | exit | - | - | Lock evidence-bound non-attack; continue to dragon convergence without combat or passage grant. |

### `ch6_s04_dragon_convergence`

- `title`: 龍守封痕
- `stageClass`: `location_scene`
- `background`: broad sealed approach held by Elder Dragon and distant clan silhouettes
- `worldState`: Chapter 6 convergence; first-run destruction of the local seal-keeping clan or second-run preserved containment
- `viewpoint`: `protagonist_limited`
- `participants`: elder_dragon
- `entry`: resolves directly from the warning-line choice
- `exit`: broad road remains unusable in both runs; dragon containment survives only in second run
- `objective`: first run survive and destroy the defenders after crossing; second run leave the dragon line without mistaking non-attack for permission or alliance
- `inputs`: war gate or evidence-bound non-attack gate
- `outputs`: first-run local elder dragon/clan destroyed and containment collapse; second-run dragon alive, broad seal untouched, outside-route search
- `assetNotes`: reuse Elder Dragon full Boss art; no new clan portraits; battle and dialogue share one arena

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | first_run | speaker | `elder_dragon` | `angry` | 你跨了線。那就死在線內。 |
| 2 | first_run | exit | - | - | 收起事件層，進入 Elder Dragon mainline Boss battle. Arena phases represent the remaining mountain seal-keeping clan joining through wing shadows and containment fire; no new speaking dragon or portrait is created. |
| 3 | first_run | enter | - | - | Battle ends. Elder Dragon falls; the last answering silhouettes crash or vanish from the perimeter. The protagonist has erased this mountain's remaining seal-keeping clan, not every dragon species in the world. |
| 4 | first_run | narration | - | - | 最後一道龍火熄滅。石碑缺口立刻向外鼓起，黑色裂紋越過原本停住的位置，沿地面爬向山下。 |
| 5 | first_run | narration | - | - | 警戒線兩側的飛影不再出現。寬路沒有因此打開；前方只有崩塌的石壁，身後則傳來第二次更深的震動。 |
| 6 | first_run | exit | - | - | Lock `dragon_clan_erased` and containment collapse; open the ruined broad-verge search. |
| 7 | second_run | speaker | `elder_dragon` | `guarded` | 你們的窄聲在封火之外。那條路不歸我開，也不歸我准。離開我的線，自己去找。 |
| 8 | second_run | narration | - | - | 我先後退，再拾回仍在線外的碎片與武器。龍沒有側身讓路，沒有露出一條門，也沒有派同族領行；牠只是沒有追擊。 |
| 9 | second_run | speaker | `elder_dragon` | `resolute` | 我離開一步，裡面的東西就把傷口撐開一步。我不替你走。你也別回來碰。 |
| 10 | second_run | narration | - | - | 龍把前爪重新壓回裂口旁。黑痕退了一寸，牠身後的寬路也隨著山壁再次崩落；封火外側仍傳回另一道較窄的回音。 |
| 11 | second_run | exit | - | - | Preserve dragon containment and lock `broad_seal_untouched`; withdraw along the outside boundary toward the same unresolved old-route objective. |

### `ch6_s05_after_the_broad_road`

- `title`: 寬路盡頭
- `stageClass`: `regional_canvas`
- `background`: mountain base where the obvious constructed approach ends in collapsed stone
- `worldState`: Chapter 6 middle; dragon result changes containment ambience but not the missing human path
- `viewpoint`: `protagonist_limited`
- `participants`: none
- `entry`: first run follows the ruined broad verge after battle; second run withdraws and follows the perimeter's outside edge
- `exit`: return-to-town objective opens and the staged casino settlement waits there before Ailo acts
- `objective`: verify that military victory or dragon non-attack cannot reveal the old local route
- `inputs`: dragon convergence resolved; Echo Whistle in inventory
- `outputs`: broad road failed; Ailo action trigger; second-run anchor housings confirmed carried
- `assetNotes`: mountain-base canvas and collapsed-road state required later

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | first_run | narration | - | - | 失去封火後，寬路仍在三面崩壁前結束。最外層石板已被震鬆，再往前敲一次，頭頂整片岩層都會落下來。 |
| 2 | second_run | narration | - | - | 我沿龍火外側退出警戒地。山壁在前方分成三處盲彎，每一處都像死路；龍仍守在身後，沒有替我指出其中任何一條。 |
| 3 | any | narration | - | - | 回聲哨吹出的兩種音都會返回，但回音重疊，無法判斷哪一孔該在第一個盲彎使用。工具存在，使用記憶不在我身上。 |
| 4 | second_run | narration | - | - | 三個中性錨具仍固定在行囊裡，證明最終準備已到位；缺少的不是戰力，而是一個理解本地路聲的人。 |
| 5 | any | narration | - | - | 我記下三處回音，把哨子收回行囊。山上已沒有能確認的人，只能先把聲音與地形帶回城裡。 |
| 6 | any | exit | - | - | Open the witnessed casino settlement on town return; `brush_past_or_invitation` follows that fixed confrontation without another mountain detour. |

### `ch6_s06_settlement_throw`

- `title`: 未結清的賭局
- `stageClass`: `town_scene`
- `background`: casino main table with guest dice, Lorne's collateral page, and one visible contract anchor
- `worldState`: Chapter 6 town return after the unresolved old-road search; Vesper settles suspected disloyalty under house rules
- `viewpoint`: `protagonist_limited`
- `participants`: casino_owner, casino_dealer
- `entry`: the player returns from the perimeter; Vesper immediately calls the witnessed settlement held since the Chapter 5 montage
- `exit`: first run saves Lorne but lets Vesper escape; second run opens host/guest reversal
- `objective`: prevent Lorne's life from being collected and expose the current-run loaded guest set
- `inputs`: casino showcase route; Blank Collateral clue; `莊家離席` only in second run
- `outputs`: first-run Vesper escape and Loaded Dice evidence; second-run marked guest set and final wager gate
- `assetNotes`: reuse casino table/portrait assets; contract collection has no named Void creature or asset

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 我把山上的紀錄交給伊萊。村長的外套留在椅背，沒有人把它收走。入夜後，洛恩派人來找我；主桌仍只留兩個位置，抵押頁壓在骰盅下，客方骰也仍比公開桌的同款稍重。 |
| 2 | any | enter | `casino_owner,casino_dealer` | - | Casino owner and dealer enter; Lorne's usual table smile is absent. |
| 3 | any | speaker | `casino_owner` | `soft` | 我們不談背叛，只談未結清的債。你想活著離桌，當然可以。贏一次就好。 |
| 4 | any | speaker | `casino_dealer` | `guarded` | 客方要求見證人。規則第七行。 |
| 5 | any | narration | - | - | 維斯珀沒有反對我站在桌側，甚至把見證位置往前推了一步。被動過手腳的骰子仍留在客方，見證只讓結果看起來更像自願。 |
| 6 | any | speaker | `casino_owner` | `pleased` | 公平？當然公平。每個人都有輸光的權利。 |
| 7 | first_run | narration | - | - | 洛恩握住骰盅。我看見他拇指掂過重量，卻不知道那與契約如何相連。骰子離手前，我撞開桌側錨釘，結算線中斷。 |
| 8 | first_run | speaker | `casino_owner` | `angry` | 你救下的只是一筆會重新到期的債。別把延後當成勝利。 |
| 9 | first_run | narration | - | - | 維斯珀撕開抵押頁邊緣。紙後不是門，只是一道吞掉深度的黑縫；他帶著主契約離開，空白債權人沒有顯形。 |
| 10 | first_run | exit | - | - | Vesper escapes; Lorne survives; continue to house aftermath and Loaded Die handoff. |
| 11 | second_run | narration | - | - | 我在骰盅落桌前認出那組異常重量，要求依公開規則驗骰；洛恩把客方骰逐一轉到有細小刻痕的一面。 |
| 12 | second_run | speaker | `casino_dealer` | `resolute` | 客方組，三枚，全重。不是每次都輸；只是每一次，都比莊家更接近輸。 |
| 13 | second_run | speaker | `player` | `guarded` | 第七行：拒換客位，私人抵押失效。你可以不賭——先把主人席的鑰匙交出來。 |
| 14 | second_run | speaker | `casino_owner` | `pleased` | 要我為三顆重一點的骰子交出整間屋子？不。一局而已。我只需要贏一次。 |
| 15 | second_run | exit | - | - | Lock marked guest set; open `house_changes_seats` final wager with Vesper unable to remove the witnessed dice. |

### `ch6_s07_house_changes_seats`

- `title`: 莊家換位
- `stageClass`: `town_scene`
- `background`: same casino table, then display hall after owner removal
- `worldState`: first-run poisoned aftermath or second-run witnessed final wager and contract collection
- `viewpoint`: `protagonist_limited`
- `participants`: casino_owner, casino_dealer
- `entry`: first run resumes after Vesper escapes; second run begins after host/guest seats swap
- `exit`: first run awards cheating evidence/achievement; second run removes Vesper, grants one showcase choice, and begins restitution
- `objective`: first run preserve proof; second run make Vesper accept and lose under his own written rules
- `inputs`: settlement throw result
- `outputs`: `莊家離席` first run; Vesper collected and one showcase prize selected second run
- `assetNotes`: reuse table/display backgrounds; unnamed creditor uses abstract contract staging, not full Void art

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | first_run | narration | - | - | 主人座空了。洛恩把桌下卡住的一枚骰子撿起，沒有擦掉上面的血與蠟。 |
| 2 | first_run | speaker | `casino_dealer` | `grieving` | 這顆是客方骰。我親手加的鉛。你再碰到他，先驗這一組。 |
| 3 | first_run | narration | - | - | 他承認自己參與配重、換骰與引導賭客，沒有把所有罪推給維斯珀，也沒有要求原諒。 |
| 4 | first_run | speaker | `casino_dealer` | `guarded` | 這只證明作弊。契約怎麼讓作弊變成債，我還沒找到能把他留住的那一條。下次……如果真有下次，先看客方骰。 |
| 5 | first_run | exit | - | - | Add current-run Loaded Die as evidence; unlock `莊家離席`; casino owner route remains unresolved for the hollow ending. |
| 6 | second_run | narration | - | - | 兩張椅子交換。維斯珀坐上客方位，洛恩將已標記的重骰原封放回他面前。見證人、器具與規則都沒有改變；沒有任何人偷換一顆骰子。 |
| 7 | second_run | speaker | `casino_owner` | `guarded` | 一局。我的所有權與命運，對你的主張。你若輸，今後不再干涉這裡。 |
| 8 | second_run | narration | - | - | 維斯珀在對等抵押欄簽下名字，又用拇指掂過客骰。發現重量不對時，他的手停了一瞬，最後仍把骰盅扣上。 |
| 9 | second_run | speaker | `casino_owner` | `pleased` | 輸的人，總是比較會談公平。開始吧。 |
| 10 | second_run | narration | - | - | 重骰離手。三顆骰子沿著熟悉的偏心軌跡撞過桌沿，最後停在維斯珀替無數客人準備的輸面。 |
| 11 | second_run | speaker | `casino_owner` | `afraid` | 不算。你們動過骰子。這是作弊。 |
| 12 | second_run | speaker | `casino_dealer` | `guarded` | 是。骰子一直都是這樣。你剛才親口接受同一組。 |
| 13 | second_run | narration | - | - | 維斯珀的手指沿著重開、換桌與撤回抵押的條文一路往下，卻在每一行都碰到自己的簽名。紙頁邊緣向內折疊，把他按住的退路一條條封死。 |
| 14 | second_run | speaker | `casino_owner` | `afraid` | 等一下。我還有別的抵押。名字、帳冊、整座賭場——拿別的！ |
| 15 | second_run | narration | - | - | 沒有生物從縫裡伸手。契約只把輸家的名字填進抵押欄，然後收走它所代表的人。維斯珀的聲音與身影一起被紙面壓平；空白債權欄依舊沒有留下姓名。 |
| 16 | second_run | exit | - | - | Vesper is collected with no redemption; transition to display hall. |
| 17 | second_run | narration | - | - | 洛恩交出債務總帳，打開所有展示櫃的主鎖。他指向仍亮著燈的那一排，要我在上山以前拿走一件。 |
| 18 | second_run | speaker | `casino_dealer` | `guarded` | 展示櫃的鎖開了。你拿一件。剩下的先別動，我得把總帳搬到公務室。 |
| 19 | second_run | narration | - | - | 公務室的人封住私人桌，把總帳一箱箱搬到廣場核對。洛恩的主人席被撤走，只能坐在公開票券桌旁逐筆清帳；沒有人因此稱他無罪。 |
| 20 | second_run | exit | - | - | Unlock one showcase selection, contract removal, transparent ticket games, and Lorne restitution state. |

### `ch6_s08_brush_past_or_invitation`

- `title`: 哨聲引來的人
- `stageClass`: `town_scene`
- `background`: town edge after the failed mountain return and fixed casino confrontation
- `worldState`: Chapter 6 dusk; Ailo hears the Echo Whistle after neither force nor dragon restraint revealed a usable human continuation
- `viewpoint`: `protagonist_limited`
- `participants`: street_beggar
- `entry`: protagonist leaves the resolved casino scene and tests the Echo Whistle again at the town edge
- `exit`: first run loses the whistle and Ailo; second run gains Ailo as an active companion
- `objective`: first run discover the theft; second run recognize and interrupt the same intention
- `inputs`: broad road failed; `先行的回聲` only in second run
- `outputs`: first-run whistle stolen/Ailo missing or second-run Ailo companion state
- `assetNotes`: reuse present Ailo portrait; brush-past interaction needs no new dialogue image

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 離開賭場後，我在鎮邊再次吹響回聲哨。短音剛停，蹲在牆根的艾洛便抬起頭；長音還沒散去，他已經站了起來。 |
| 2 | first_run | enter | `street_beggar` | - | Street beggar approaches. Dialogue UI opens with his portrait and name label `乞丐`, but the text field remains empty. |
| 3 | first_run | narration | - | - | 他與我擦身而過，沒有一句對話。對話框立刻闔上，人也混進轉角後的陰影。 |
| 4 | first_run | narration | - | - | 他走遠後，我才摸到鬆開的格袋。回聲哨已不在，地上只留著一小片被揉爛的花瓣。 |
| 5 | first_run | exit | - | - | Lock Ailo missing and Echo Whistle stolen; open old route mouth after a short delay. |
| 6 | second_run | narration | - | - | 艾洛靠近前，我先握住哨子，問他是不是知道山上的盲彎該怎麼走。 |
| 7 | second_run | enter | `street_beggar` | - | Street beggar stops at arm's length; expression shifts from guarded to afraid. |
| 8 | second_run | speaker | `street_beggar` | `angry` | 不是偷。那是我們的。你吹錯了，山把路藏起來，她還在等。 |
| 9 | second_run | narration | - | - | 我沒有追問他口中的「她」，只說既然只有他知道先吹哪一孔，就由他帶路，而我不會讓他一個人去。 |
| 10 | second_run | speaker | `street_beggar` | `afraid` | 你走太重，會把花踩爛。也可能死。她不喜歡我帶死人去。 |
| 11 | second_run | narration | - | - | 我把哨子交到他手上，卻沒有放開同行的決定。艾洛把它收進衣內，第一次朝我點頭。 |
| 12 | second_run | speaker | `street_beggar` | `guarded` | 跟緊。聽見兩次就停，三次才轉。別相信眼睛，石頭會撒謊。 |
| 13 | second_run | exit | - | - | Add Ailo companion state; current-run whistle remains under shared route use. |

### `ch6_s09_the_old_note_answers`

- `title`: 舊路回音
- `stageClass`: `location_scene`
- `background`: old route mouth hidden by collapsed terrain and acoustic blind turns
- `worldState`: Chapter 6-to-7 bridge; first run path already opened by Ailo, second run opened beside him
- `viewpoint`: `protagonist_limited`
- `participants`: street_beggar only in second run
- `entry`: player reaches the route mouth after theft or invitation
- `exit`: Chapter 7 old mountain road becomes the active regional canvas
- `objective`: use the Echo Whistle's real acoustic sequence to reveal the traversable turn
- `inputs`: first-run Ailo ahead or second-run Ailo companion
- `outputs`: old mountain route open; first-run Ailo traces or second-run shared passage
- `assetNotes`: route-mouth background and whistle audio required later; no magical guide effect

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | first_run | narration | - | - | 崩壁前出現新的腳印。第一個盲彎留有一短音的粉塵震落痕，第二處則是遮住右孔後的長音。艾洛已經先走。 |
| 2 | first_run | narration | - | - | 回音沒有移開石頭。它讓人辨認哪一道看似封死的裂隙後方仍有空腔；沿著新鮮刮痕側身進入，舊路便從視線死角出現。 |
| 3 | first_run | exit | - | - | Open Chapter 7 route with Ailo fresh traces and no living companion. |
| 4 | second_run | enter | `street_beggar` | - | Ailo enters at the route mouth, covering one whistle hole with a scarred fingertip. |
| 5 | second_run | speaker | `street_beggar` | `neutral` | 第一聲問石頭還在不在。第二聲問後面有沒有空。它們不回答人，只回答形狀。 |
| 6 | second_run | narration | - | - | 他吹一短一長。左側回音重疊，右側長音晚半息返回，指出崩壁後仍有可走的窄腔。 |
| 7 | second_run | speaker | `street_beggar` | `guarded` | 三次才轉。以前她會數，我老是搶第二次。不要笑，走錯的人沒資格笑。 |
| 8 | second_run | narration | - | - | 艾洛先側身進入，又在石縫另一端停下。等我跟進視線，他才繼續往下一個盲彎走。 |
| 9 | second_run | exit | - | - | Open Chapter 7 old mountain canvas with Ailo companion and Echo Whistle route rules. |

## Chapter 7 Detailed Screenplay V1

Status: `complete_pending_user_review`. `魔王赫爾薩恩 / Helsarn`, Neelu's
mountain-village dye-mender identity, and `洛恩 / Lorne` are accepted. Chapter 7
performance, route logic, Ailo's survival result, true execution, and both
endings now form one completed review draft awaiting user approval.

### `ch7_s01_narrow_human_road`

- `title`: 舊山路
- `stageClass`: `regional_canvas`
- `background`: handcrafted old mountain road with blind rock turns, acoustic notches, and destroyed settlement traces
- `worldState`: Chapter 7 opening; first run follows Ailo ahead, second run travels beside him
- `viewpoint`: `split_limited` (`protagonist_limited` -> `character_limited:street_beggar` -> `protagonist_limited`)
- `knowledgeBoundary`: Audience learns Ailo follows the whistle and a promise; the protagonist sees only traces. Neelu, the marriage, the fall, and the death cause remain hidden.
- `participants`: street_beggar in the first-run audience cutaway and throughout second-run travel
- `entry`: old route mouth opens from Chapter 6 whistle sequence
- `exit`: ruined flower-field location becomes visible
- `objective`: follow the correct echo sequence without returning to the dragon-held broad line
- `inputs`: old road open; Ailo ahead or companion
- `outputs`: fall-village approach; audience-only first-run promise motive plus protagonist-observed fresh traces, or second-run Ailo relationship progression
- `assetNotes`: full Chapter 7 regional canvas required; reuse present Ailo portrait for the cutaway and second-run travel

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | first_run | narration | - | - | 艾洛的腳印總在正確轉角前突然消失，再從看似封死的石縫後出現。我追得上路，追不上走在前面的人。 |
| 2 | first_run | cutaway | `street_beggar` | `guarded` | 更高處的盲彎後，艾洛獨自貼著石壁。主角還隔著兩段看不見的轉角；他手裡只有剛取回的哨子。 |
| 3 | first_run | speaker | `street_beggar` | `soft` | 找到了。兩聲停，三聲轉。她還在等。這次不會吹錯。 |
| 4 | first_run | narration | - | - | 他遮住右孔吹出長音，等回聲晚半息才側身進入裂縫。嘴裡反覆念著沒有名字的「她」，沒有回頭。 |
| 5 | first_run | cutaway | `player` | `guarded` | 長音在岩層裡散盡。我趕到下一處盲彎時，只看見新落的碎石與一點血。 |
| 6 | first_run | narration | - | - | 幾處血痕落在尖石上，沒有拖行或屍體。手札只能寫下：有人帶傷繼續往墜落地前進。 |
| 7 | second_run | enter | `street_beggar` | - | Ailo enters at the first blind turn, listening to the return echo before moving. |
| 8 | second_run | speaker | `street_beggar` | `neutral` | 兩次停，三次轉。以前我總搶快，她就在後面罵我把路走得像逃命。 |
| 9 | second_run | narration | - | - | 有時他準確指出石縫，有時又蹲在一片普通苔痕前叫錯名字。我不替他把破碎記憶整理成預言，只等他重新聽見路。 |
| 10 | second_run | speaker | `street_beggar` | `guarded` | 別扶。我會忘記腳要放哪。你站近一點就好。 |
| 11 | any | narration | - | - | 路旁開始出現生活留下的東西：染色用的碎陶碗、獵繩固定孔、被熏黑的屋樑。石縫裡還卡著燒焦的門閂與半塊孩童木碗。 |
| 12 | first_run | narration | - | - | 新鮮腳印越過倒塌屋基，朝一片仍有花梗的高地去。沒有回程足跡。 |
| 13 | second_run | speaker | `street_beggar` | `afraid` | 快到了。她會生氣。我太久了。花都換了好多次。 |
| 14 | any | exit | - | - | Discover ruined flower-field node and open its full-image scene. |

### `ch7_s02_ruined_flower_field`

- `title`: 約定之地
- `stageClass`: `location_scene`
- `background`: present-day ruined flower field and remains of Ailo/Neelu's settlement edge
- `worldState`: first run silent ruin; second run Echo Whistle and emphasized flower align memory
- `viewpoint`: `protagonist_limited`
- `participants`: street_beggar only in second run
- `entry`: player reaches the promise place
- `exit`: first run records an incomplete human ruin; second run dissolves into the full memory event
- `objective`: inspect the flower and determine what Ailo came here to complete
- `inputs`: Chapter 7 road traversal; Ailo state
- `outputs`: first-run old-cliff fatal trace or second-run memory gate and corrected route meaning
- `assetNotes`: ruined flower-field background required; one white-petaled, pale-green-centered flower must remain visually identifiable in the deferred memory CG and later letter

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 高地沒有完整花海。焦土間只剩零散野花，舊田界則被墜落衝擊推成向外傾斜的圓弧。 |
| 2 | first_run | narration | - | - | 一朵外白、花心淡綠的小花被刻意留在倒石中央，旁邊有剛放下的爛布與木屑。艾洛來過，之後的痕跡沒有回城，而是朝當年逃生的舊崖口往上。 |
| 3 | first_run | narration | - | - | 最後一枚帶血手印停在崖口新裂的岩面，下面只有被黑霧遮住的深谷。我沒有找到屍體，也沒有聽見告別；手札只能留下「有人把這裡當成約定地，之後仍往上走」。 |
| 4 | first_run | exit | - | - | Lock incomplete flower-field entry; continue to final camp without revealing Neelu or Ailo's name. |
| 5 | second_run | enter | `street_beggar` | - | Ailo enters and kneels beside the white-petaled, pale-green-centered flower; the Echo Whistle slips from his hand but does not sound by itself. |
| 6 | second_run | speaker | `street_beggar` | `grieving` | 不是這樣。這裡以前很多。她說不准採，今天不用工作……我還帶了袋子。 |
| 7 | second_run | narration | - | - | 我把空袋放到一旁，只留下花與哨子。山風穿過雙孔，回出一短一長，與舊田界的形狀重合。 |
| 8 | second_run | speaker | `street_beggar` | `afraid` | 她要叫我了。別回答，那是我的名字。 |
| 9 | second_run | exit | - | - | Fade present ruin into old-photo-filter memory; open `echo_memory`. |

### `ch7_s03_echo_memory`

- `title`: 花田回聲
- `stageClass`: `memory_or_ending`
- `background`: full-scene old-photo-filter sequence blending remembered flower field, village work, disaster, valley fall, and present ruin
- `worldState`: second run only; memory performance, not a ghost encounter or lore vision
- `viewpoint`: `witnessed_memory`
- `knowledgeBoundary`: The protagonist and surviving Ailo witness the bounded memory together; its revealed past becomes current-run protagonist knowledge.
- `participants`: young Ailo, Neelu, present Ailo
- `entry`: whistle echo and emphasized flower open the memory
- `exit`: protagonist wakes beside surviving present Ailo
- `objective`: no combat task; witness the complete promise and keep Ailo from continuing alone into death
- `inputs`: second-run Ailo companion; ruined flower-field memory gate
- `outputs`: Ailo name revealed; Neelu relationship truth; old-cliff direction corrected; Ailo releases compulsive solo route; future flower-letter state
- `assetNotes`: approved future large CG sequence; Neelu's dye-mender visual anchor is locked, but young Ailo/Neelu layered art and CG generation remain deferred until the full screenplay review closes

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | second_run | narration | - | - | 焦土先恢復顏色，接著是田界、屋頂與曬在繩上的布。褪色的往事像舊照片浸入清水，一點一點顯出原貌。 |
| 2 | second_run | enter | `young_ailo` | - | Young Ailo enters carrying one bag mixed with edible herbs, dye flowers, and useless trail scraps. |
| 3 | second_run | enter | `neelu` | - | Neelu enters with dark hair tied by faded green cloth, dye-stained fingertips, and a mending needle at her collar. |
| 4 | second_run | speaker | `neelu` | `pleased` | 艾洛，你又把能吃的、能染的和路邊撿來騙我的東西塞在一起。這片木頭到底要做什麼？ |
| 5 | second_run | speaker | `young_ailo` | `pleased` | 它長得像一只鳥。等我削完，妳就會承認。 |
| 6 | second_run | speaker | `neelu` | `neutral` | 等你削完，它會像一只被你害死的鳥。先把花分出來，我明天要交染布。 |
| 7 | second_run | narration | - | - | 她說著抱怨，仍替他把袋口重新縫牢，又把一朵外白、花心淡綠的小花從染料堆挑出來。那朵花染不出顏色，艾洛卻把它放到袋子最上面。 |
| 8 | second_run | speaker | `young_ailo` | `soft` | 沒用正好。不是每朵花都得拿去做事。妳每次來都在採、在趕；下次我們就坐著看。 |
| 9 | second_run | speaker | `neelu` | `soft` | 等忙完這一季，我們再一起來看一次。不是採花，也不是趕路。就只是看。 |
| 10 | second_run | narration | - | - | 記憶向前跳。兩人已成夫妻：她在門邊補獵衣，他把回聲哨掛回牆上；爭論晚飯、漏雨與誰忘了收染布，比任何傳說都更佔生活。 |
| 11 | second_run | speaker | `neelu` | `guarded` | 冬天前搬去低一點的地方吧。只一季。這裡的路最近連回音都不對。 |
| 12 | second_run | speaker | `young_ailo` | `neutral` | 好。看完花就搬。這次不帶袋子。 |
| 13 | second_run | narration | - | - | 遠方天空被龍火與黑影撕開。沒有誰向村民解釋那是魔王與龍的兩敗俱傷；他們只看見某個龐大存在墜向山邊。 |
| 14 | second_run | narration | - | - | 衝擊先壓平屋頂，黑霧隨後沿谷地灌入。村落被屠殺與崩塌吞沒，回聲哨成了在煙裡找盲路的唯一工具。 |
| 15 | second_run | speaker | `neelu` | `resolute` | 艾洛，看我。下一聲走右邊，不是左邊。到崖口先下去，我在後面。 |
| 16 | second_run | narration | - | - | 逃路在崖口斷裂。黑影逼近，能承受的岩面只夠一個人落到下方斜坡。妮露看見得比他早。 |
| 17 | second_run | speaker | `young_ailo` | `afraid` | 一起。妳說一起。 |
| 18 | second_run | speaker | `neelu` | `soft` | 所以你要活著，艾洛。到下面等我。 |
| 19 | second_run | narration | - | - | 她把他推下山谷。艾洛撞上岩面，頭部重創；最後看見的是妮露轉回斷路，而不是一場可被英雄改寫的告別。 |
| 20 | second_run | narration | - | - | 完整花田逐漸褪回今日的焦土。年老的艾洛仍站在原處，手中抱著多年來誤認成她的破布。 |
| 21 | second_run | enter | `street_beggar` | - | Present Ailo enters; Neelu remains a memory participant, not a living ghost in the current world. |
| 22 | second_run | speaker | `street_beggar` | `grieving` | 我沒等到妳。我一直往崖口上面走，以為妳還在那裡。我把路忘了，把妳的臉也弄丟了。 |
| 23 | second_run | narration | - | - | 記憶沒有讓死者回答現在。約定那天，年輕的艾洛被田埂絆得向後一倒，妮露從後面接住他，笑著把人推回站穩；年老的身影恰好與他重疊。 |
| 24 | second_run | speaker | `neelu` | `soft` | 慢一點，艾洛。真走丟了，就在下面等我。我會去找你。等忙完這一季，我們再一起來看。 |
| 25 | second_run | speaker | `street_beggar` | `hurt` | 我一直往上走。妳明明叫我在下面等。 |
| 26 | second_run | narration | - | - | 妮露只是扶著記憶中那個還年輕的他，並不知道多年後有人終於聽懂。艾洛伸手去碰，指尖卻落在現今石縫裡一片乾掉的花瓣上。 |
| 27 | second_run | narration | - | - | 舊照片般的顏色退去。我在焦土上醒來，艾洛仍坐在身旁；他沒有往崖口上方走。 |
| 28 | second_run | speaker | `street_beggar` | `hurt` | 她叫我艾洛。原來是這個。 |
| 29 | second_run | narration | - | - | 他把懷裡的破布放在倒石旁，沒有再往崖口上方走。下一陣風來時，他轉身朝下山的路看去。 |
| 30 | second_run | exit | - | - | Lock Ailo survived, old-cliff misreading corrected, and memory complete; open final camp with him resting outside the combat route. |

### `ch7_s04_three_anchor_check`

- `title`: 最後的準備
- `stageClass`: `location_scene`
- `background`: final mountain camp with three neutral forge housings and the equipped weapon visible only as the player's current gear
- `worldState`: first run ordinary final preparation; second run true-kill assembly
- `viewpoint`: `protagonist_limited`
- `participants`: street_beggar only as a resting background presence in second run; no blacksmith/scholar teleport
- `entry`: player makes the last camp before the fall site
- `exit`: first run enters combat without execution anchors; second run locks all three anchors to current gear
- `objective`: verify whether the Demon King's remaining life layers can be targeted after its body falls
- `inputs`: current-run counter-Boss materials and housings in second run
- `outputs`: first-run no true-kill state; second-run `true_kill_ready`
- `assetNotes`: camp background required; do not create a story-exclusive sword

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | first_run | narration | - | - | 營地只剩磨刀石、繃帶與最後一份補給。我檢查武器的刃口與扣帶；眼前能準備的，仍只有一場正面戰鬥。 |
| 2 | second_run | narration | - | - | 我把完整生命種子放進第一只外殼。種子貼上金屬後規律收縮，像在回應山裡緩慢的搏動。 |
| 3 | second_run | narration | - | - | 古代符文嵌入第二只外殼。敲定最後一角時，營地裡散開的回音忽然短了一截。 |
| 4 | second_run | narration | - | - | 純淨森林精華流進第三只外殼，微光沿刻槽停在邊緣，沒有向外擴散。三只外殼依序接上我正在使用的武器。 |
| 5 | second_run | narration | - | - | 接合處不改變武器原本的握法與重量。鐵匠留下的扣件只在三只外殼同時啟動時閉合。 |
| 6 | second_run | narration | - | - | 伊萊的紙條壓在工具底下。上面只有三行：先還生命，再鎖回聲，最後照出核心。末尾沾著鐵匠按過的黑指印。 |
| 7 | second_run | speaker | `street_beggar` | `neutral` | 上面那個不是她。別聽它拿死人說話。它不認識我們。 |
| 8 | any | exit | - | - | Lock final preparation state and open Demon King fall-site audience. |

### `ch7_s05_fall_site_audience`

- `title`: 墜落之地
- `stageClass`: `location_scene`
- `background`: Demon King fall site, a mountain wound where body, land, and curse converge
- `worldState`: Chapter 7 final confrontation; dragon containment absent first run or active beyond the narrow route second run
- `viewpoint`: `protagonist_limited`
- `participants`: Demon King through existing full Boss presentation
- `entry`: player reaches the center of the ancient fall scar
- `exit`: Demon King combat begins in both runs
- `objective`: defeat the visible combat body; second run keeps the execution sequence armed
- `inputs`: final camp state
- `outputs`: final Boss combat open; run-specific containment ambience
- `assetNotes`: reuse existing final Boss art and runtime id; script display name is `魔王赫爾薩恩`

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 岩層向內塌成巨大的凹地。黑色脈絡從中央鑽入四周石壁，每隔數息便同時鼓起一次；碎石也跟著輕顫。 |
| 2 | any | enter | `demon_lord_asariel` | - | 魔王赫爾薩恩 enters in the existing full mainline Boss illustration; no sympathetic human portrait or alternate form is added. |
| 3 | first_run | speaker | `demon_lord_asariel` | `pleased` | 翼火熄了。你替我撕開最後一道封線，還以為自己是來殺我的。 |
| 4 | second_run | speaker | `demon_lord_asariel` | `guarded` | 翼火仍在。你繞過封線，還帶著三件想把我釘回肉身的東西。這次終於知道該怕什麼了。 |
| 5 | any | speaker | `player` | `resolute` | 山下的人還活著。今天停在這裡的是你。 |
| 6 | any | speaker | `demon_lord_asariel` | `resolute` | 那就把你替他們留下的命也帶過來。 |
| 7 | any | exit | - | - | 收起事件層，進入 Demon King combat-body Boss battle. |

### `ch7_s06_combat_body_falls`

- `title`: 倒下的身體
- `stageClass`: `location_scene`
- `background`: same fall-site arena during combat-body collapse
- `worldState`: first run false kill or second-run three-anchor execution transition
- `viewpoint`: `protagonist_limited`
- `participants`: Demon King
- `entry`: visible health/combat body reaches defeat state
- `exit`: first run apparent death; second run exposed-core phase
- `objective`: determine whether anything remains after the body falls
- `inputs`: combat body defeated; `true_kill_ready` only in second run
- `outputs`: first-run false-kill state or second-run exposed, pinned core
- `assetNotes`: no new weapon or full-light effect; glimmer remains base-game precursor scale

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 魔王單膝砸進碎石，胸口裂開。手臂垂下後再也沒有抬起，武器也從指間滑落。 |
| 2 | first_run | narration | - | - | 黑色脈絡沒有停止。它們只把搏動壓低，從屍體退回岩層與遠處尚未封住的回聲。我找不到能下手的第二個目標。 |
| 3 | first_run | speaker | `demon_lord_asariel` | `hurt` | ……很好。 |
| 4 | first_run | exit | - | - | Body appears dead; no valid core target exists. Continue to first-run ending transition. |
| 5 | second_run | narration | - | - | 第一錨啟動。完整生命種子的節律反轉，山中被借走的活力沿黑脈退回土地，迫使剩餘生命集中到倒下的身體。 |
| 6 | second_run | speaker | `demon_lord_asariel` | `afraid` | 你拿走了我的根。 |
| 7 | second_run | narration | - | - | 魔王的聲音脫離喉嚨，試圖沿山壁向外擴散。第二錨的古代符文閉合，將魂響釘在倒地形體上方。 |
| 8 | second_run | speaker | `demon_lord_asariel` | `angry` | 放開。你不懂自己鎖住了什麼。 |
| 9 | second_run | narration | - | - | 第三錨釋放微光媒介。純淨森林精華標出宿主土地與寄生生命的邊界，一枚原本與岩層同色的核心逐漸顯形。 |
| 10 | second_run | narration | - | - | 遠處龍火保持壓力，阻止封痕再次張開。龍沒有進場替我戰鬥，只完成牠原本就在做的鎮壓。 |
| 11 | second_run | exit | - | - | Open exposed-core phase; current equipped weapon remains active for the final strike. |

### `ch7_s07_last_core`

- `title`: 最後的核心
- `stageClass`: `location_scene`
- `background`: fall-site core phase transitioning into run-specific ending light
- `worldState`: first run no target or second run true execution
- `viewpoint`: `protagonist_limited`
- `participants`: Demon King; elder_dragon only in the second-run return coda
- `entry`: immediately follows combat-body collapse
- `exit`: first run hollow victory return; second run irreversible true death
- `objective`: destroy every remaining survival layer when a valid target exists
- `inputs`: false-kill state or exposed-core state
- `outputs`: first-run Demon King survives barely; second-run Demon King truly dead and curse pressure ceases
- `assetNotes`: optional true-execution CG remains review-only; ordinary current weapon must stay visually valid

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | first_run | narration | - | - | 屍體沒有再動。胸口的裂縫裡只有冷掉的黑灰，四周岩層也安靜下來；我找不到另一個能下手的位置。 |
| 2 | first_run | narration | - | - | 我離開時，最後一道黑脈縮進岩下，隨後再沒有可見搏動。刃口碰過胸腔與周圍岩縫，沒有任何東西再對攻擊產生反應。 |
| 3 | first_run | exit | - | - | Lock hollow-victory state and return to town; surviving-Demon reveal is held for the final post-ending image. |
| 4 | second_run | narration | - | - | 三只外殼同時閉合。原本散進岩層的黑脈被拉回胸口，凝成一枚不斷收縮的核心。我手中的武器仍維持原本的重量。 |
| 5 | second_run | speaker | `demon_lord_asariel` | `angry` | 你只是山上一瞬的灰。它會比你活得久。 |
| 6 | second_run | narration | - | - | 我用一路帶到這裡的武器擊中核心。刀刃、短鋒、重擊、槍尖或法器留下的傷口不同，核心碎裂的聲音只有一次。 |
| 7 | second_run | narration | - | - | 核心破裂後，古代符文先失去需要鎖住的聲音，生命種子停止反向搏動，微光則照見岩層重新只屬於岩層。 |
| 8 | second_run | speaker | `demon_lord_asariel` | `hurt` | 不—— |
| 9 | second_run | narration | - | - | 聲音沒有逃往別處。三個錨具依序失去反應，岩層也不再替核心搏動。等了很久，黑脈沒有再亮；乾淨的山風第一次穿過墜落地。 |
| 10 | second_run | narration | - | - | 下山時，寬封線的龍火仍在原位。守線者沒有迎接，也沒有離開崗位，只在我從外側經過時抬起頭。 |
| 11 | second_run | speaker | `elder_dragon` | `guarded` | 這一次，你沒有碰那道線。 |
| 12 | second_run | exit | - | - | Lock true-death state, preserve dragon containment, and begin true-ending return sequence without alliance or thanks. |

### `ch7_s08_return_to_town`

- `title`: 回到城鎮
- `stageClass`: `memory_or_ending`
- `background`: fixed town return montage using the same places in first-run loss and second-run survival states
- `worldState`: run-specific ending; first run celebrates a false military kill, second run feels quiet rather than triumphant
- `viewpoint`: `audience_montage`
- `knowledgeBoundary`: The montage shows visible public aftermath only; no private motive or off-screen fact becomes a gameplay flag.
- `participants`: Tavi, Frey only second run, Mia by fate, village elder by fate, town scholar, blacksmith, casino_dealer
- `entry`: protagonist crosses South Gate after the final battle
- `exit`: ending-specific epilogue and final reveal/flower letter open
- `objective`: no task; let ordinary places show who was lost, saved, or made accountable
- `inputs`: all character and final-Boss fate states
- `outputs`: first- or second-run town closure; Mia final relationship tile second run; elder/Ilai shared-responsibility closure; blacksmith endpoint performance; Lorne public-accountability closure
- `assetNotes`: reuse place-state backgrounds; layered expressions later; no duplicate showcase-choice scene

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | first_run | narration | - | - | 南門只亮著塔維的燈。旗桿換了新木，芙蕾留下的旗扣仍是舊的。塔維沒有問戰鬥，只先確認我的影子是一個人。 |
| 2 | first_run | enter | `lamplighter_tavi` | - | 塔維拿著回程板走到南門燈下。 |
| 3 | first_run | speaker | `lamplighter_tavi` | `neutral` | 回來了。好。我把名字劃回去。 |
| 4 | first_run | exit | `lamplighter_tavi` | - | 塔維把我的名字劃回去，繼續守著只剩燈的南門。 |
| 5 | first_run | narration | - | - | 米婭的工作間維持原樣。床邊的水杯已經乾了，最後一頁病歷仍壓在桌角。 |
| 6 | first_run | narration | - | - | 公務室裡，村長的外套還掛在椅背。伊萊沒有收走它，也沒有把空位改成任何人的名字。 |
| 7 | first_run | narration | - | - | 鐵匠鋪裡，我的損壞裝備仍原封留在工作桌上。 |
| 8 | first_run | enter | `blacksmith` | - | Blacksmith enters at the forge table with the protagonist's damaged gear still untouched. |
| 9 | first_run | speaker | `blacksmith` | `neutral` | 裝備放下。你回來就好。剩下的……今天沒有東西修得好。 |
| 10 | first_run | exit | `blacksmith` | - | 鐵匠把裝備留在桌上，沒有點起第二座爐。 |
| 11 | first_run | narration | - | - | 賭場主人席仍空著，但不是因正義完成。維斯珀逃走，洛恩看著他離開的那道門，灌鉛骰只能證明一部分罪。艾洛也沒有回來。 |
| 12 | first_run | narration | - | - | 最後我回到公務室。伊萊把戰鬥紀錄攤在村長留下的空位旁，等我確認能寫下多少。 |
| 13 | first_run | enter | `town_scholar` | - | 伊萊站在尚未完成的勝利告示前。 |
| 14 | first_run | speaker | `town_scholar` | `grieving` | 我會寫你擊倒了魔王。這是我們現在能證明的事。其餘的空白……我不會替勝利填滿。 |
| 15 | first_run | speaker | `player` | `neutral` | 寫我擊倒了牠。別寫道路已經安全；回來時，山裡還有東西在動。 |
| 16 | first_run | exit | `town_scholar` | - | 伊萊停在「魔王的身體已被擊倒」一行，不再往下補寫。 |
| 17 | second_run | narration | - | - | 南門同時有旗與燈。芙蕾先舉旗，塔維晚半拍遮燈三次；這次只是他們約好的回程信號。 |
| 18 | second_run | enter | `standard_bearer_frey,lamplighter_tavi` | - | 芙蕾與塔維一起走到回程板前。 |
| 19 | second_run | speaker | `standard_bearer_frey` | `pleased` | 塔維，回程板。這次兩個名字都在。 |
| 20 | second_run | speaker | `lamplighter_tavi` | `pleased` | 我看見了。妳不用再念一次。 |
| 21 | second_run | exit | `standard_bearer_frey,lamplighter_tavi` | - | 兩人一個收旗、一個護燈，並肩回到門房。 |
| 22 | second_run | narration | - | - | 米婭的工作間開著。她先找血、灰與不自然的步子，直到確定我真的沒有帶傷。 |
| 23 | second_run | enter | `herbalist` | - | Mia enters in the living-after-rescue workroom state; the long-closed inner window is now open. |
| 24 | second_run | speaker | `herbalist` | `guarded` | 哪裡受傷？不要先說沒事。 |
| 25 | second_run | speaker | `player` | `neutral` | 沒有傷。我先來看妳，再去交報告。 |
| 26 | second_run | speaker | `herbalist` | `soft` | 那就進來。門口不是給沒受傷的人站的。 |
| 27 | second_run | narration | - | - | 今天沒有新增病歷。米婭把藥箱推回牆邊，在桌上多放了一只乾淨的杯子。 |
| 28 | second_run | exit | `herbalist` | - | 米婭留下那只杯子，催我先把該交的報告交完。 |
| 29 | second_run | narration | - | - | 公務室裡，村長與伊萊把遠征、龍族與封痕攤在同一張不再避開彼此的桌上。 |
| 30 | second_run | enter | `village_elder,town_scholar` | - | Village elder and town scholar enter together at the archive table. |
| 31 | second_run | speaker | `village_elder` | `soft` | 那一頁先別寫結論。誰攔住我、我在哪裡停下，都記清楚。 |
| 32 | second_run | speaker | `town_scholar` | `pleased` | 我先寫經過。龍那邊沒有給我們口供，結論就留著。 |
| 33 | second_run | exit | `village_elder,town_scholar` | - | 村長與伊萊留在公務室，重新核對二十年前沒有寫明的經過。 |
| 34 | second_run | narration | - | - | 鐵匠鋪恢復完整節奏。我把武器放上桌時，前面仍排著生活用具。 |
| 35 | second_run | enter | `blacksmith` | - | Blacksmith enters with soot on both hands and a repaired pot cooling beside the anvil. |
| 36 | second_run | speaker | `blacksmith` | `pleased` | 武器先放旁邊。前面還有一只漏水的鍋。 |
| 37 | second_run | exit | `blacksmith` | - | 鐵匠把我的武器挪到一旁，先去接那只仍在滴水的鍋。 |
| 38 | second_run | narration | - | - | 賭場展示牆已有一格空位，那是我先前取回的獎品。洛恩把債務總帳放在公開桌上，所有剩餘票券遊戲列出真實機率。 |
| 39 | second_run | enter | `casino_dealer` | - | 洛恩站在公開桌旁，手沒有再碰主人席。 |
| 40 | second_run | speaker | `casino_dealer` | `guarded` | 帳在這裡。你先看。桌要不要再開，等鎮上核完再說。 |
| 41 | second_run | exit | `casino_dealer` | - | 洛恩留下總帳，回到等候清查的公開桌旁。 |

### `ch7_s09_first_or_second_epilogue`

- `title`: 回聲盡頭，花仍會開
- `stageClass`: `memory_or_ending`
- `background`: first-run civic remembrance and surviving-Demon image, or second-run clean mountain wind and unsigned flower letter
- `worldState`: final run-specific ending
- `viewpoint`: `split_limited` (run-specific protagonist closure -> audience-only ending image)
- `knowledgeBoundary`: First-run Demon survival is audience-only until achievement memory opens the second run; `我記住你了` occurs before reset and does not give the second-run Demon loop memory. Second-run flower-letter knowledge belongs to the protagonist.
- `participants`: Demon King only in first-run post-ending image; street_beggar appears only through second-run absence and flower
- `entry`: follows town return montage
- `exit`: first run unlocks second run; second run closes base campaign
- `objective`: no task; deliver the run's final emotional and causal truth
- `inputs`: final Boss state and all fixed character outcomes
- `outputs`: first-run memory achievements/`未竟的弒王` or true-ending achievement/flower confirmation
- `assetNotes`: first-run surviving Demon King CG and second-run flower-letter still life; Ailo/Neelu memory CG already recorded

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | first_run | narration | - | - | 廣場沒有凱歌。居民在伊萊寫好的告示前停留，把「魔王的身體已被擊倒」一行念得很慢。 |
| 2 | first_run | narration | - | - | 有人把酒放在芙蕾的舊旗扣旁，有人替米婭工作間換了水。村長的外套仍掛在那張沒人坐的椅背。 |
| 3 | first_run | narration | - | - | 我站在人群外，聽見他們第一次敢談明天。山風卻從南門吹來，帶著一點尚未散盡的黑灰。 |
| 4 | first_run | narration | - | - | 墜落地深處，魔王殘破的戰鬥身體仍伏在岩層中。黑脈以極慢的速度明滅，繼續把生命送進沒有閉合的傷口。 |
| 5 | first_run | enter | `demon_lord_asariel` | - | Deferred surviving-Demon full image appears after the apparent ending. |
| 6 | first_run | speaker | `demon_lord_asariel` | `hurt` | 我記住你了，凡人。 |
| 7 | first_run | exit | - | - | Fade to black; unlock second run with achievement-only story persistence. |
| 8 | second_run | narration | - | - | 山裡的黑脈停止後，艾洛沒有成為城鎮居民。他在某個清晨自行離開，這次沒有偷走工具，也沒有留下死亡方向。 |
| 9 | second_run | narration | - | - | 幾日後，我收到一封沒有署名、沒有文字的信。信裡只有那朵外白、花心淡綠、在記憶中被妮露挑出染料堆的花，壓得很平，仍保留一點顏色。 |
| 10 | second_run | narration | - | - | 信封裡沒有其他東西。花莖壓得有些歪，邊緣還沾著路上的細灰。 |
| 11 | second_run | narration | - | - | 我把花收進信紙裡，沒有替它補上文字。 |
| 12 | second_run | narration | - | - | 山邊的花梗在乾淨風裡輕輕移動。封痕仍有龍火守著，岩下不再傳來黑色搏動。 |
| 13 | second_run | narration | - | - | 清晨的市集先響起搬箱聲。鐵匠在巷口催人把漏鍋拿走，米婭推開窗，讓藥草的氣味散進街上。 |
| 14 | second_run | exit | - | - | Close the base campaign true ending and return control to the completed-campaign title state. |

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

Use this order before changing the runtime screenplay:

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

## Character Admission Policy

The master screenplay uses the accepted core cast first, but existing runtime ids
and portraits are not permission to insert a person into a scene.

- The eight accepted core NPCs are the elder, 伊萊, Mia, 芙蕾, 塔維,
  blacksmith, 艾洛, and 維斯珀.
- 妮露 and the casino dealer are already structurally necessary supporting
  characters. Complete their missing fields before locking their detailed scenes.
- `elder_dragon` is the dragon-clan dialogue actor. Do not add a separate
  spokesperson or portrait.
- The Demon King's causal timeline must be fixed before the final chapter is
  locked; a full human-style character profile is not automatically required.
- Merchant, supply captain, rumor broker, black-market trader, old miner, tinker,
  and accountant remain functional placeholders until a character-centered story
  need is approved. The obsolete apothecary assistant is not retained as a
  service dependency.
- Do not retain two supporting characters when they perform the same dramatic
  function. Merge, remove, or differentiate them during the relevant line pass.
- Tower warden and tower-linked characters remain deferred with the tower rewrite.
- Chapel and radiant-route characters remain deferred until the light-route story
  requires them.
- Asset-only portraits may be reused later, but reuse requires a new accepted
  identity and does not revive old biography automatically.
- A new recurring character must define story reason, inner world, past, arc,
  external expression, contradiction, relationships, entry/exit, system function,
  downstream data changes, asset needs, and validation before implementation.

## Story-To-System Adaptation

Do not write the final story directly into runtime data first.

Recommended workflow:

1. Draft or update this story bible.
2. Map accepted beats into `docs/CHAPTER_QUEST_FRAMEWORK.md` if level, boss, or
   reward placement changes.
3. Convert accepted beats into the existing runtime owners:
   - `StorySceneRegistry.js` and `StorySceneManager.js` for mandatory scene order,
     conditions, dialogue, and completion state.
   - `Quests.js` and `QuestStories.js` for approved optional quest contracts and
     their player-facing story states.
   - `NPCDialogues.js` for town actor entry points that invoke the accepted scene
     or optional-quest flow.
   - `TownPlaces.js` and `TownStateResolver.js` for visible town changes.
   - `ChapterRegionRegistry.js` for landmark, route, and Boss bindings.
   - `StoryObjectiveHints.js` and the traveler handbook owner for objective copy
     and persistent discoveries.
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
