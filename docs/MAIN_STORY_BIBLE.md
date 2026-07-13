# Main Story Bible

Last updated: 2026-07-11

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

## Working Canon V0

This is the current rebuild target before runtime quest rewrite. It uses existing
town, NPC, monster, boss, dungeon, and system resources first.

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
- Chapter 2 turns safe travel into supply, medicine, and civic recovery.
- Chapter 3 shows that shadow is not a random element; it remembers soldiers,
  debt, and old orders.
- Chapter 4 makes the land itself unstable through stone and elemental pressure.
- Chapter 5 makes strength expensive: old expedition truth, advanced forge
  routes, and heavy choices force preparation.
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

1. The dragon seal restrains the Demon King's body and concentrates the disaster
   near the mountain. It does not perfectly stop curse seepage.
2. The curse follows existing physical and human channels: roots, water, soil,
   ruins, corpses, abandoned orders, roads, trade, fear, and violence. It twists
   what is already present instead of creating every evil in the story.
3. The dragon clan protects its territory and maintains containment. It does not
   protect humanity out of affection, and it does not explain itself patiently to
   armed trespassers.
4. Most chapter bosses are real dangers and may still need to be defeated. The
   first-run tragedy is not caused by fighting every monster; the decisive error
   is destroying the living dragon authority that is still holding the damaged
   containment together.
5. The Echo Whistle is an ordinary mountain-route tool. The
   `seal_scar_shard` is evidence of human damage. Neither object is a magical
   answer by itself.
6. The Demon King's existence at the mountain becomes common knowledge over
   time. What people do not understand is that the scattered mist, mutations,
   dead routes, and elemental failures all descend from the same fall and damaged
   containment.
7. After humans create the seal scar, the dragon clan can hold the remaining line
   from outside but cannot fully restore it while the Demon King continues
   pressing from within. If `elder_dragon` leaves the containment position to
   enter the core, the broad approaches fail first. This is why the dragons do
   not simply finish the Demon King themselves.

### Global Timeline

| Time | Omniscient Event | What People Know Then | Causal Result |
| --- | --- | --- | --- |
| Before the fall | The mountain region contains a natural convergence of underground pressure and routes. Ordinary mountain villagers, including 艾洛 and 妮露, use narrow local paths and the Echo Whistle. The dragon clan occupies and guards the greater mountain territory. | Villagers know dragons are dangerous and territorial. The old road and whistle are practical local knowledge, not sacred secrets. | The mountain has two kinds of access: broad approaches controlled by dragons and narrow human paths understood by locals. |
| More than twenty years ago | The Demon King attempts to seize or corrupt the mountain convergence so his power can recover and spread through the region. The dragon clan attacks because this would destroy its territory and make the mountain uninhabitable. | Humans nearby see signs of an enormous conflict but do not understand either side's purpose. | Dragon and Demon King enter a battle neither can win cleanly. The dragons are not fighting for humanity, but their territorial defense incidentally prevents immediate expansion. |
| The fall | `elder_dragon` and the dragon clan wound the Demon King badly enough to throw him from the high mountain route. The Demon King falls near the mountain-side village. The dragon side is also severely wounded and cannot finish the kill. | Surrounding settlements know a great enemy and dragons fought near the mountain. They do not yet understand where the curse begins or whether the Demon King survived. | Physical impact, monsters, and the first curse pressure destroy the mountain village. The Demon King enters sleep or partial dormancy instead of dying. |
| 艾洛 and 妮露's escape | The village is overwhelmed. 妮露 pushes 艾洛 down a valley or mountain drop so he survives. She dies; he suffers head trauma, grief, and fragmented memory. | No one outside receives a complete account. 艾洛 cannot tell one. | The only surviving human route knowledge remains inside a person nobody can understand. His promise, the flowers, the road, and the whistle survive as broken fragments. |
| Emergency containment | The wounded dragon clan cannot kill the dormant Demon King. It closes the broad approaches and binds the worst pressure inside the mountain perimeter. `elder_dragon` remains the living authority that maintains and judges passage at the damaged line. | Humans experience lost roads, dragon hostility, and an unreachable mountain. They interpret these as territorial blockade, disaster, or taboo. | The Demon King's body is contained. The curse still leaks slowly through roots, water, soil, ruins, dead bodies, and abandoned routes. The narrow local Echo Whistle path falls out of use because its villagers are dead. |
| The first years after the fall | Nearby villages lose trade, patrols, and contact in uneven waves. Monster behavior changes gradually rather than all at once. | People know the mountain is dangerous and eventually accept that the Demon King remains there. They still treat each failed road, poisoned field, or mutated monster as a local problem. | The region responds piecemeal. No one sees one cause, so no one builds one solution. |
| Twenty years ago: the joint expedition | The present village elder, then a young militia captain, helps nearby villages form a joint force. Its goal is to repel monsters, reopen routes, recover contact, and stop the spreading regional collapse. It is not initially a legendary Demon King assault. | The expedition knows a Demon King is associated with the mountain, but it does not know the seal structure, the dragon clan's containment role, or how the curse travels. | The expedition is strong by ordinary human standards: numbers, discipline, local weapons, supply, and courage let it clear outer monsters and several lost roads. Early victories create dangerous confidence. |
| The expedition reaches the perimeter | Following a route that appears blocked rather than sealed, the force finds the dragon-closed outer line. It interprets the barrier and dragon warnings as another hostile obstruction between the villages and the source of their suffering. | The elder and the force believe they must break through before the region dies. They do not possess Echo Whistle route knowledge, and the mountain villagers who knew the alternate path are gone. | Humans damage the sealed perimeter with ordinary force and tools. A fragment becomes the `seal_scar_shard`. The breach releases a violent pressure surge from inside. |
| The one-sided slaughter | In this proposal, `elder_dragon` and the dragon defenders counterattack while curse pressure and mutated creatures surge through the damaged line. The human force has enough strength to reach the perimeter but no strength that matters against a dragon authority and the released disaster together. | Survivors see heat, shadow, collapse, monsters, and broken formation. They cannot reconstruct a clean account. The dragon clan sees only armed humans repeating damage at a line they never understood. | The expedition is destroyed. The elder survives by chance because retreat, terrain collapse, and separation leave him outside the killing center; he is not spared. He returns with the shard but without the knowledge needed to interpret it. |
| The following twenty years | The dragon clan holds what remains of the perimeter, but the human-made scar widens under recurring pressure. The dormant Demon King slowly recovers. The town loses young people, services, supply, and confidence. | The elder knows courage was annihilated but not why the route was sealed. 伊萊 holds incomplete records. Mia grows up inside the expedition's family damage. Younger characters inherit fear without context. | Broken routes become the town's daily reality. Forest, dead, shadow, stone, ash, and elements begin showing different symptoms of the same pressure. |
| Present surge | The Demon King's recovering body and the widening seal scar reach a threshold. Mutations and route failures become frequent enough for an outside guild to issue rescue or reconnaissance work. | The town knows the situation is worsening but still lacks one causal map. | The protagonist arrives wounded near the village and is saved by Mia in her private workroom. The playable story begins. |

### Chapter Causality

The chapters move from symptoms to source. Boss identities remain the current
working set until the user revises them.

| Chapter | Visible Crisis | Hidden Cause | Why The Boss Matters | Causal Output |
| ---: | --- | --- | --- | --- |
| 1 | South-gate routes, forest behavior, fog, and weak equipment make even nearby travel unreliable. | Curse pressure has reached roots and old route wounds. The forest is reacting to pressure moving through the land. | `forest_guardian` is a dangerous responder at the first convergence; `ambush_mantis` teaches that monster bodies and behavior carry route evidence. | Defeating the threat makes nearby roads readable and proves that route failure and monster behavior are connected. It does not reveal the Demon King yet. |
| 2 | Medicine, supplies, old evacuation paths, and the dead stop behaving like separate civic problems. | Curse leakage has reached abandoned routes, corpses, and records left incomplete after earlier disasters. | `lich` concentrates the chapter's dead-route pressure. Its exact personal identity can be written later without changing the global cause. | The town recovers supply and medicine, while 伊萊 learns that an accurate old document may still be lethally outdated. |
| 3 | Shadow soldiers, old commands, casino temptation, black-market shortcuts, and debt all become useful and dangerous. | The curse can preserve fear, violence, and unfinished orders as shadow. Human exploitation such as 維斯珀's casino is not caused by the Demon King; it grows because the crisis creates desperate people. | `shadow_commander` proves shadow is an echo of command and conflict, not a random new element. | The player sees two responses to collapse: prepare honestly, or use shortcuts that convert desperation into power and debt. Shadow remains the mandatory mainline dark-affinity ceiling; an optional second-run route may later reveal its relation to Void. |
| 4 | Stone, ash, structures, mines, and roads begin failing together. 芙蕾 and 塔維 face the route crisis. | The damaged containment is no longer affecting only living things; pressure is moving through terrain and constructed routes. | `ancient_titan` is the main convergence. `ash_baron` is reserved as an optional second-run external Boss and does not occupy the mandatory chapter. | The map itself is revealed as part of containment. First run loses 芙蕾 because direction and light are not both held; second run changes this through 塔維. |
| 5 | Fire, ice, thunder, poison, and forge preparation stop looking like separate regional hazards. The old expedition record becomes readable. | All elemental fronts are different physical expressions of pressure escaping the same damaged mountain containment. | `elemental_lord` is the convergence proving one source lies behind the four ordinary elements. | 伊萊's records, the elder's memory, and the `seal_scar_shard` finally align. The Echo Whistle enters the mainline as an unidentified mountain tool before the dragon approach. |
| 6 | The broad mountain approach ends at the dragon-held perimeter. | The player has reached the living containment authority, not another servant of the Demon King. | `elder_dragon` is both Boss and dialogue actor. It warns the player from the existing Boss presentation. | First run has no decoded alternate route and crosses under immediate regional pressure. Second run leaves the shard, weapon, and player outside the line, demonstrates an outside echo route, and earns only non-attack while the dragon keeps holding the seal. |
| 7 | The obvious road still cannot reach the fall site. The lost local route and the Demon King's body become the final problem. | Dragon containment closed broad approaches; the only non-destructive human approach survived in 艾洛's fragmented memory. | The Echo Whistle route leads to the fall site. `demon_lord_asariel` is the current runtime final Boss id; the final script name remains revisable. | The Demon King is a genuine threat in both runs and must still be defeated. The ending changes according to whether the dragon containment and key characters survived the approach. |

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
- Whether "Asariel" remains the Demon King's final script name or only a legacy
  runtime id.
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

## Master Screenplay Review Proposal V1

Status: `complete_pending_user_review`. This proposal fills the remaining causal and
chapter gaps so the user can revise them before they become canon. It does not
authorize runtime quest rewrites, new images, or data migration yet.

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

| Route | Example Intervention Direction |
| --- | --- |
| Tavi and Frey | `燈不是只照前面。把後標先點起來，芙蕾就不用回頭。` |
| Mia and 伊萊 | `那把鉗子的卡榫會再咬一格。伊萊，四份紀錄證明的是分開的殘留，還是交會後的東西？` |
| Elder | `封痕碎片不是通行證。你帶著它一個人走，只會讓那條路再死一次。` |
| Vesper and dealer | `那顆骰子的重量不對。讓他用客人的骰子；既然公平，就不該怕換位置。` |
| Ailo | `你找的不是錢。是這支哨子，對嗎？帶我走你記得的那條路。` |

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
| Village elder | `split_limited`: trail pursuit cuts ahead to the elder alone at the scar, then returns to the protagonist. | Why he refuses to send another person and tries to replace the fragment himself. | Dragon containment purpose, non-attack proof, and the living handoff. |
| Ailo | `split_limited`: route traces cut ahead to his solitary climb without showing a corpse. | He is following the whistle and an unfinished promise, not stealing for profit. | Neelu's identity, marriage, fall, complete promise, and the accompanied route. |

The first-run ending may replay sensory fragments from these scenes, but it does
not convert their audience-only thoughts into protagonist knowledge retroactively.

### Proposed First-Run Fate Order

| Order | Chapter | Fixed Event | Immediate Consequence | Second-Run Correction |
| ---: | ---: | --- | --- | --- |
| 1 | 4 | Tavi freezes at the unmeasured rear route marker during the Ancient Titan evacuation. The protagonist is locked at the central civilian crossing; Frey returns to keep the flag visible and dies as the span rises between them. | The South Gate flag is returned without her. Tavi becomes quiet and mechanically functional; the blacksmith's humor first breaks; the elder identifies a route that depended on one person replacing another. | Revisit the childhood mist route, make Tavi personally measure the far lamp, complete his role admission and wind guard, then have him light the rear marker before the ground splits. |
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
- Chapter 3 has already shown the childhood mist, why the flag matters to Frey,
  and why the first-run wind guard cannot be built without Tavi's far-marker
  measurements.
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
| `ancient_titan` | A natural stone colossus whose sleeping ribs became the foundation of old roads and retaining walls. The builders never created or understood it. Curse pressure wakes the body beneath the route. It has no human personality. | Each movement changes routes, collapses bridges, and creates the Chapter 4 evacuation crisis. | `titan_heart`; proof that the map itself is part of containment. |
| `elemental_lord` | A new convergence consciousness formed during the present surge where fire, ice, thunder, and poison-bearing flows collide around the widening scar. It is neither an ancient god, a human, nor a Demon King general. | Changes phases because four regional symptoms are being pulled into one unstable body and cannot remain balanced. | `elemental_core`; physical proof that the four fronts share one mountain source. |
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
- The planned prologue tutorial antagonist is a unique high-rank demon and a
  future member of this layer. It defeats the trained royal frontier inspector,
  destroys the starting equipment, and later supports an optional second-run
  revenge route. Its exact identity, weapon, reason for appearing, and rematch
  timing remain under user review. Only its first-run tutorial identity and
  fixed-loss staging belong to the active first-run pass; do not design or
  implement its second-run revenge route yet.
- `aurora_archon`, `radiant_keeper`, `mirror_seraph`, and the Radiant Corridor
  provide the first optional formal-light route. `abyssal_seraph`, the unnamed
  contract creditor, and the rebuilt tower provide later Void interpretation.
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
- Second-run addition: no fate is changed yet. `未竟的弒王` makes the Moon Moss
  traces relevant to the later true-kill route without tying Life Seed to
  Mia's survival.

#### Chapter 2 - 斷路上的藥味 / Medicine On The Broken Road (Lv11-20)

- Opening image: the first repaired road brings empty crates, medicine requests,
  and names of people who never reached town.
- Opening question: why do old evacuation instructions and the dead still try to
  complete routes that no longer exist?
- Main movement: market recovery, herb-basket record, evacuation list, opened
  tomb route, Lich confrontation.
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
- Second-run addition: `blood_moon_stag` becomes a mandatory true-kill memory
  route. Its intact Life Seed is reserved only as the body anchor for the final
  execution.

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
  person. In the second run Tavi admits why he took the lamp and acts while
  afraid. Frey entrusts him with the rear marker and finally understands the
  elder's fear without abandoning courage.
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

### Omniscient Scene Timeline Review V2

Status: `complete_pending_user_review`. This timeline defines causality, order,
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
| `location_scene` | `ch1_s07_silver_snare`, `ch1_s10_forest_guardian`, `ch2_s05_blood_moon_hunt`, `ch2_s06_keeper_of_names`, `ch3_s01_dead_checkpoint`, `ch3_s06_drowned_voice`, `ch3_s07_old_command_post`, `ch3_s08_shadow_commander`, `ch4_s03_thorn_value_rule`, `ch4_s05_body_locks`, `ch4_s06_flag_returns`, `ch4_s07_titan_rises`, `ch5_s04_elemental_lord`, `ch5_s09_whistle_cache`, `ch6_s02_scar_aftermath`, `ch6_s03_stop_before_the_line`, `ch6_s04_dragon_convergence`, `ch6_s09_the_old_note_answers`, `ch7_s02_ruined_flower_field`, `ch7_s04_three_anchor_check`, `ch7_s05_fall_site_audience`, `ch7_s06_combat_body_falls`, `ch7_s07_last_core` | 23 |
| `town_scene` | `ch1_s02_wake_under_bitter_bottles`, `ch1_s03_broken_crossroads`, `ch1_s04_elder_to_scholar`, `ch1_s05_south_gate_introduction`, `ch1_s08_cold_forge_smoke`, `ch1_s11_roads_breathe_again`, `ch2_s01_empty_crates`, `ch2_s02_name_under_basket`, `ch2_s03_ledger_that_would_not_close`, `ch2_s07_names_return_to_town`, `ch3_s02_shadows_count_names`, `ch3_s04_showcase_glass`, `ch3_s05_blank_creditor_trace`, `ch3_s09_temptation_and_orders`, `ch4_s02_fourfold_countergear`, `ch4_s08_returned_objects`, `ch4_s09_four_elements_one_report`, `ch5_s01_four_fronts_converge`, `ch5_s02_forge_contracts`, `ch5_s06_mia_operation`, `ch5_s07_after_the_ratchet`, `ch5_s08_expedition_list`, `ch5_s10_before_dawn`, `ch6_s06_settlement_throw`, `ch6_s07_house_changes_seats`, `ch6_s08_brush_past_or_invitation` | 26 |
| `memory_or_ending` | `ch5_s11_town_loses_its_voice`, `ch7_s03_echo_memory`, `ch7_s08_return_to_town`, `ch7_s09_first_or_second_epilogue` | 4 |

Total: 66 scenes. A validator must later compare this index with scene data and
fail on missing, duplicated, or unplaced ids.

#### Chapter 1 Scene Order

| Scene | Working Location | Omniscient Event | First Run | Second Run | Character / Side-Story Work | Story-State Output |
| --- | --- | --- | --- | --- | --- | --- |
| `ch1_s01_road_collapse` | South road outside town | Present curse pressure drives ordinary monsters into an abnormal route cluster. The protagonist is injured and poisoned while trying to reach shelter. | The attack reads as a harsh opening encounter. | The event repeats; memory creates unease but no rescue branch yet. | Mia is established through action before introduction. | Protagonist reaches town alive; Mia's private care becomes personally meaningful. |
| `ch1_s02_wake_under_bitter_bottles` | Mia's herb workroom | Mia treats the protagonist with scarce stock, checks symptoms, and refuses to discuss payment before survival is certain. | First meeting. | Same knowledge on her side; the protagonist recognizes the room and ordinary care but cannot change a fate yet. | Opens `Bitter Bottles`; establishes care, fatigue, and restrained humor without a shop menu. | Mia relationship seed; first basic prescription is ready for later market authorization. |
| `ch1_s03_broken_crossroads` | Town crossroads | The protagonist sees closed forge, empty stalls, damaged gate traffic, shared water, reserved sickbeds, and too few residents before meeting the elder. | Town reads as a damaged place people are still using, not only a locked hub. | Empty positions carry remembered emotional weight. | Elder becomes civic anchor; Ailo may be seen handling scraps without a formal scene. | Town baseline recorded; later recovery has visible human contrast. |
| `ch1_s04_elder_to_scholar` | Civic room and scholar desk | The elder refuses a generic kill order and sends the protagonist to 伊萊 for a route investigation. | Trust begins cautiously. | The elder is alive and ordinary again; no future accusation is allowed. | Elder/伊萊 friendship appears through unfinished paperwork and familiar disagreement. | Traveler handbook and three-landmark objective open. |
| `ch1_s05_south_gate_introduction` | South Gate | 芙蕾 records who leaves; 塔維 checks an unreliable lamp behind her. The gate needs information more than heroics. | Their flag/lamp bond reads as local color. | Their positions foreshadow the later correction, but no intervention unlocks yet. | Opens `Patrol Soles`; blacksmith is named as the person who repairs fittings. | Gate route and fatigue warning become clear. |
| `ch1_s06_three_landmarks` | `south_gate_farmland`, `hunter_boardwalk`, `old_campfire_site` | Footprints, smoke, silver thread, and blackened root traces establish that the road is being read by predators and altered from below. | Exploration teaches the investigation grammar. | Same route; optional remembered observations can shorten explanation but not skip landmarks. | Scholar records evidence; Frey reacts to missing return marks. | Three route clues stored in handbook. |
| `ch1_s07_silver_snare` | `cut_roadsign`, `silver_snare_pass` | The Ambush Mantis has learned the player's return pattern and closes its trap. | First proof that a Boss can emerge from route behavior. | Same Boss; no alternate outcome is needed. | Supports hunter-route life without adding a hunter NPC. | `ambush_mantis` defeated; silver-thread clue points toward the forest wound. |
| `ch1_s08_cold_forge_smoke` | Forge | The blacksmith uses the protagonist's damaged gear to explain why town recovery must change survival, not only scenery. | Basic forge is reopened through `Cold Forge Smoke`. | Same service restoration; remembered losses make the blacksmith's loudness feel temporary. | Introduces his object-based care and his links to flag and lamp. | Basic repair and starter craft access. |
| `ch1_s09_rotroot_approach` | `broken_horn_camp`, `rotroot_ravine` | The party follows black bark, broken horn marks, and root pressure toward the forest core. | The forest seems hostile. | The protagonist notices the pressure is moving northward but cannot yet name the source. | Mia interprets symptoms in returned residents; scholar interprets route traces remotely. | Forest Guardian gate opens. |
| `ch1_s10_forest_guardian` | `old_wolf_den` / ancient root heart | The wounded guardian attacks every route disturbance because stripped bark and curse pressure have collapsed its discrimination. | Player kills or defeats a perceived regional threat. | Same necessary battle; understanding changes interpretation, not outcome. | No new speaker is added to humanize the Boss. | `forest_guardian` convergence cleared; root-direction evidence recovered. |
| `ch1_s11_roads_breathe_again` | Town crossroads | Nearby roads become readable, not safe. The town restores only the functions justified by the chapter. | A modest first victory includes Mia rechecking the return and the forge receiving household repairs before weapons. | The achievement-memory system remains quiet until the ending has been earned. | Elder, 伊萊, Mia, Frey, Tavi, and blacksmith receive short state reactions; Ailo mutters about a road that does not match the map. | Chapter 2 opens; Mia relationship records, forge, gate, and handbook enter stage one. Market medicine waits for a real supply route. |

#### Chapter 2 Scene Order

| Scene | Working Location | Omniscient Event | First Run | Second Run | Character / Side-Story Work | Story-State Output |
| --- | --- | --- | --- | --- | --- | --- |
| `ch2_s01_empty_crates` | Market edge | The reopened road delivers empty or damaged crates and names of carriers who never arrived. | Supply shortage appears to be a new task. | The protagonist recognizes the pattern of routes continuing after people are gone. | Merchant remains functional; no supply captain is introduced. | Market recovery objective and missing-carrier record open. |
| `ch2_s02_name_under_basket` | Mia's herb workroom | A name beneath an old herb basket connects Mia's family loss to the expedition and evacuation years. | Relationship deepens through shared work and the way Mia still looks up at every passing footstep. | The protagonist understands the emotional weight but gains no false foreknowledge about her later surgery. | `Name Under The Herb Basket`; Mia/伊萊 tension becomes visible without ending her ordinary work. | Mia's father record enters the handbook and town relationships. |
| `ch2_s03_ledger_that_would_not_close` | Scholar desk | 伊萊 and the elder compare evacuation lists, funeral tags, and one route instruction that was once correct. | The document is accepted as useful evidence. | The protagonist notices the missing revision layer but cannot yet prove the later terrain change. | `Ledger That Would Not Close`; elder guilt remains restrained. | Ancient tomb and mist-tablet route open. |
| `ch2_s04_mist_and_tomb_route` | `mist_tablet_hill`, `opened_ancient_tomb` | Funeral markers point toward a route whose dead still try to complete evacuation. | Horror and investigation converge. | Memory highlights that names, not necromancy alone, are binding the dead. | Mia names the human cost; blacksmith supplies practical anti-undead preparation. | Lich phylactery clues gathered. |
| `ch2_s05_blood_moon_hunt` | `moon_moss_slope`, `broken_horn_camp` | Blood Moon Stag follows an ancient migration cycle across newly readable paths. | Optional exploration Boss; Life Seed is a valuable ordinary material with no final-use explanation. | `未竟的弒王` makes this a mandatory true-kill route. The player preserves an intact Life Seed as a current-run execution key. | Builds the final body anchor without owning any part of Mia's rescue. | `life_seed_intact` execution state; normal `life_seed` economy remains separate. |
| `ch2_s06_keeper_of_names` | Opened tomb reliquary | Hern's records reveal that he bound tags, bodies, and route duty together when burial became impossible. | Player reads him as a tragic Lich after the battle. | Same battle; achievement memory makes the glimmer-bearing residue worth reserving. | 伊萊 confronts the danger of records surviving context. | `lich` defeated; `lich_phylactery` and reserved `glimmer_shard` acquired. |
| `ch2_s07_names_return_to_town` | Civic room | The dead are re-entered into an honest ledger rather than praised as a faceless sacrifice. | 伊萊's confidence grows because his records solved a real crisis; finite medicine visibly reaches waiting residents. | His confidence is tempered by the protagonist's insistence on revision dates. | Elder/Mia share the unresolved name; elder/伊萊 expose the old pattern of one waiting outside while the other writes; Ailo recognizes the useless dye flower. | Evacuation record closes; the market stocks Mia-authorized medicine; elder/Ilai friendship and Ailo flower breadcrumbs enter the mainline. |
| `ch2_s08_shadow_at_the_checkpoint` | Northbound road marker | A recovered route sign is found guarded by shadows using an old human formation. | New threat teaser. | The order pattern is immediately disturbing but still lacks a commander identity. | Tavi is assigned later lamp work; Frey volunteers for route marking. | Chapter 3 shadow investigation opens. |

#### Chapter 3 Scene Order

| Scene | Working Location | Omniscient Event | First Run | Second Run | Character / Side-Story Work | Story-State Output |
| --- | --- | --- | --- | --- | --- | --- |
| `ch3_s01_dead_checkpoint` | Reauthored `obsidian_keep_gate` | Shadow soldiers continue inspection, formation, and denial procedures from the old expedition. | They initially resemble Demon King troops. | The protagonist notices human equipment habits and command spacing. | 伊萊 and elder disagree over whether to publish the resemblance. | Shadow-command evidence chain opens. |
| `ch3_s02_shadows_count_names` | Blacksmith and scholar work table, then Mia's workroom | The commander's blade fragments and old fittings match expedition issue patterns. The protagonist's concealed shadow wound makes the same chapter cost personal. | `Shadows Still Count Names` reframes the enemy late; Mia confronts the protagonist, who in turn names her refusal to count herself among people needing care. | The player asks for the comparison before another patrol is destroyed, but the relationship conflict still occurs because NPCs do not inherit future memory. | Blacksmith/伊萊 evidence chain; mutual Mia/protagonist conflict; shadow craft remains weaker than future optional Void. | Shadow equipment, command-post route, and explicit Mia relationship state unlock. |
| `ch3_s03_lamp_oil_in_fog` | Night watch route | The childhood mist and patrol flag explain why Frey became direction while Tavi retained the freeze. Tavi avoids the far rear marker and lets Frey cover it. | Frey can report wind direction, but without Tavi standing at the lamp the forge lacks frame, intake, and fastener measurements; no safe wind guard can be built. | `旗沒有回來` makes the player require Tavi to walk the route. He measures the lamp, admits he took the light only to remain where Frey's flag could see him, and is told to stand where she cannot. | Mandatory Tavi route seed becomes a relationship decision rather than an equipment errand. | First run records `rear_marker_unmeasured`; second run records `rear_marker_ready` and `tavi_role_admitted`. |
| `ch3_s04_showcase_glass` | Casino display hall | Visible unique prizes tempt the player before Vesper becomes a quest target. Lorne operates the table and studies reactions. | The casino feels useful and dangerous. | `莊家離席` makes the player watch Lorne's hands and die selection, but proof is not yet available. | Vesper and Lorne enter; `Showcase Glass` begins their long route. | Casino floor, ticket pools, and showcase inspection open. |
| `ch3_s05_blank_creditor_trace` | Black-market contact point | One contract record has no human creditor line. The trader confirms it was sold once and has no duplicate. | Ominous side evidence; base story does not name Void. | The player understands this will become Vesper's escape route and presses Lorne earlier. | Black market remains functional, unnamed, and separate from Vesper's guilt. | Blank Collateral clue enters handbook. |
| `ch3_s06_drowned_voice` | `drowned_bell_coast`, `sunken_altar_reef` | Bell tones continue after the diviner's body and ritual shell should be silent. | Optional exploration Boss with an Ancient Rune reward. | Mandatory memory route because `未竟的弒王` makes bodiless continuation legible. | No new coastal NPC is required; route is carried by environment and Boss. | `ancient_rune_bound` current-run quest state. |
| `ch3_s07_old_command_post` | Reauthored `black_iron_storehouse` | Expedition supply marks identify Kaedren as one local line commander, not the supreme commander. His last signal never arrived. | Elder finally admits he knew the formation. | The player separates Kaedren's local order from the still-unknown supreme command. | Seeds a future overcap commander without occupying that identity. | Kaedren record and command phrase verified. |
| `ch3_s08_shadow_commander` | Old line-command yard | Kaedren repeats the order to hold one breach approach and refuses all retreat. | Battle ends the local command echo. | Same battle; the protagonist preserves evidence more deliberately. | Elder reacts off-screen through the returned blade; blacksmith sees human wear. | `shadow_commander` defeated; command route closes. |
| `ch3_s09_temptation_and_orders` | Town night state | The town now has both honest preparation and seductive shortcuts. | The protagonist voluntarily reports to Mia before discovery; Vesper notices the protagonist; Tavi remains unready. | The player has begun all future corrections but none is complete. | Mia conflict receives a small behavioral repair; finite market/forge/gate light contrasts with the casino; no reserve service NPCs enter. | Chapter 4 opens; casino, night routes, shadow craft, and Mia's honest-return state reach stage one. |

#### Chapter 4 Scene Order

| Scene | Working Location | Omniscient Event | First Run | Second Run | Character / Side-Story Work | Story-State Output |
| --- | --- | --- | --- | --- | --- | --- |
| `ch4_s01_road_moves_underfoot` | Stone-route approach | Retaining walls shift together and expose surfaces that resemble one enormous rib cage. | Terrain failure is treated as an escalating disaster. | The protagonist recognizes a containment body, not a random quake. | Elder orders evacuation; Frey takes route marking; Tavi handles lamps. | Ancient Titan investigation opens. |
| `ch4_s02_fourfold_countergear` | Forge and Mia's workroom | Blacksmith and Mia prepare ordinary protection against ash, heat, venom, and shock. | Preparation improves survival but cannot predict the first combined shard. | Same preparation plus Tavi's completed wind guard. | `Fourfold Countergear`; Mia/blacksmith act as parallel caretakers, while the blacksmith actively places evacuation and household fittings before new weapons. | Controlled prescriptions are authorized, evacuation gear is issued, and the blacksmith's civilian-first priority becomes mainline character evidence. |
| `ch4_s03_thorn_value_rule` | `thorn_glasshouse_ruin` | Thorn Witch tests whether the player understands exchange, contamination, and biological cost. | Optional Boss/bargain route; Forest Essence is useful craft stock. | Mandatory confrontation. She withholds uncontaminated essence until the player proves parasite and host must be separated. | Mia interprets the returned symptoms inside a story scene; no material-identification menu, chapel, or light NPC appears. | `forest_essence_pure` and glimmer-refinement knowledge. |
| `ch4_s04_gray_ridge_evacuates` | Planned Gray Ridge causeway | Titan movement splits the route while ash-heavy wind hides the rear group. Two visible markers are required, while the protagonist must hold the central civilian踏板 open. | Frey takes the front flag; Tavi is assigned the rear lamp; rising stone physically prevents the protagonist from replacing either marker. | Same assignment and separation, but Tavi has rehearsed and repaired the wind guard. | `Flag And Lamp` enters its irreversible crisis without creating a false question about why the protagonist did not simply save Frey. | Evacuation timer, protagonist central-hold state, and marker states begin. |
| `ch4_s05_body_locks` | Rear causeway marker | A ground break and trapped voices trigger Tavi's physical freeze. | Lamp remains unlit; Frey sees the rear group lose direction. | Tavi is still terrified but lights the marker before the break reaches him. | His difference is action under fear, not cured fear. | First run `rear_marker_failed`; second run `rear_marker_lit`. |
| `ch4_s06_flag_returns` | Cracked center span | Frey chooses whether she must return to hold direction while the protagonist remains trapped across the central break. | She fixes the patrol flag into stone and remains until the last figures cross; the span rises as the protagonist finally moves toward her. | She sees Tavi's light and stays at the front marker; neither abandons the other group. | First-run final Frey CG candidate; second-run shared courage payoff. | First run Frey death; second run both survive. |
| `ch4_s07_titan_rises` | Causeway foundation / Titan body | The natural colossus stands, destroying the road built on its sleeping ribs. | The protagonist fights immediately after witnessing Frey's death. | The protagonist fights after the successful evacuation. | Boss emotion differs without changing combat identity. | `ancient_titan` defeated; `titan_heart` recovered. |
| `ch4_s08_returned_objects` | Forge, South Gate, and Mia's workroom | The flag fitting and lamp return to town, then the evacuation's bodily cost reaches Mia's workroom. | Blacksmith cannot restore Frey; Tavi becomes hollowed; the elder lowers the gate flag and identifies the route's one-person dependency as the failure. Mia overworks after treating evacuees. | Frey and Tavi argue because both were frightened for the other. Frey admits that seeing Tavi in danger made her want to call him back; the elder names that as the fear behind every opened gate. Mia still confronts how narrowly everyone returned. | Blacksmith remains the town-temperature gauge; Frey finally understands the elder without abandoning courage; Mia's Chapter 4 relationship beat deepens without stealing the flag/lamp climax. | Run-specific gate, forge, Tavi, Frey/elder, and Mia relationship states lock. |
| `ch4_s09_four_elements_one_report` | Scholar desk and town night | Titan-heart pressure aligns with reports of heat, frost, thunder, and poison. Ailo hears a lower road opening; Vesper turns the Gray Ridge result into a personalized offer. | New crisis begins after a personal loss; Vesper prices grief. | The living patrol pair helps gather complete timings; Vesper prices fear of the next near-loss. | 伊萊 finds the elemental pattern, Ailo supplies a second whistle breadcrumb, and Lorne refuses to open the private table despite Vesper's pressure. | Chapter 5 opens with four-front evidence, Ailo continuity, and the casino dealer's first costly defiance recorded. |

#### Chapter 5 Scene Order

| Scene | Working Location | Omniscient Event | First Run | Second Run | Character / Side-Story Work | Story-State Output |
| --- | --- | --- | --- | --- | --- | --- |
| `ch5_s01_four_fronts_converge` | Civic room with four route reports | Fire, ice, thunder, and poison symptoms are shown to pulse in one rhythm. | The town treats them as simultaneous emergencies. | Reserved materials and prior evidence let the protagonist see one pattern earlier. | Mia reads patient records; blacksmith reads gear; 伊萊 reads route time. | Elemental Lord route opens. |
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
| `ch6_s01_northern_drake_watch` | `northern_drake_watch`, `dragon_heat_crag` | The player pursues the elder immediately. Dragon heat and warning marks show deliberate containment rather than invasion. | Patched-sole tracks pull the player toward the body while the undecoded whistle yields only overlapping echoes. | The living elder's shard and Ailo's current-run one-hole reaction let the player demonstrate an outside echo without knowing the route sequence. | 伊萊 remains in town interpreting reports; Ailo remains in town rather than becoming a convenient dragon interpreter. | Dragon warning-line objective and observed containment evidence. |
| `ch6_s02_scar_aftermath` | Planned seal warning line near `charred_obelisk` | A scar surge meets sealing fire at the fragment's matching break. | Player finds the elder's body and `seal_scar_shard`, then sees the dragon beyond it; fire has struck him, but its target remains ambiguous. | No corpse exists; the shard remains in the player's hand outside the line and the recorded whistle reaction proves only that another route exists. | Elder first-run exit or second-run survival becomes undeniable. | First-run anger/urgency or second-run proof chain complete. |
| `ch6_s03_stop_before_the_line` | Dragon perimeter | `elder_dragon` orders the armed human to stop and offers retreat, not aid. | With pressure already traveling toward town and no readable alternate road, the player crosses armed; combat becomes unavoidable. | Player stops, puts weapon and shard down outside the line, demonstrates the outside echo, and does not cross during the next surge. | Dragon speaks for its clan using Boss art; no spokesperson NPC. | First-run war gate / second-run evidence-bound non-attack. |
| `ch6_s04_dragon_convergence` | Broad sealed approach | Dragon clan defends the line it has held since the fall. | The protagonist kills `elder_dragon` and erases the remaining local seal-keeping clan. | No battle occurs; `elder_dragon` keeps holding containment while the player withdraws to search outside its line. | The dragon does not forgive, ally, thank, open a road, or grant human passage. | First-run containment collapse / second-run containment preserved. |
| `ch6_s05_after_the_broad_road` | Mountain base / town return point | The obvious approach cannot reach the fall site after either dragon result. | With the clan dead, the ruined broad verge still ends at a blind collapse. | The player follows the outside boundary without crossing the seal and reaches the same unreadable blind turns. | The whistle needs local human memory; dragon victory or restraint cannot replace Ailo. | Return to town with old-road objective unresolved. |
| `ch6_s06_settlement_throw` | Casino main table after the mountain return | Vesper uses a rigged guest set to settle Lorne's remaining collateral once the required witness returns. | Player interrupts the table anchor and saves Lorne, but cannot prove the full reversal before Vesper escapes. | `莊家離席` makes the protagonist identify the current run's abnormal die weight before settlement; Lorne marks the set. | Loaded Dice route reaches confrontation without delaying the urgent elder pursuit. | First run Vesper escape / Loaded Dice evidence; second run final wager opens. |
| `ch6_s07_house_changes_seats` | Same table and display hall | Contract rules decide who occupies host and guest positions. | Vesper tears a contract slit and leaves; Lorne gives the die after failure. | Vesper accepts the fairness challenge, rolls from the guest set, loses his own collateral, and is taken by the unnamed creditor. | Lorne survives both; only second run begins restitution. | First run casino poisoned; second run showcase choice and contract removal. |
| `ch6_s08_brush_past_or_invitation` | Town edge after the failed broad-road return | Ailo acts on the whistle after the protagonist reports that the mountain has no usable human road. | He brushes past without dialogue, steals it, and disappears. Inventory inspection reveals the loss; no one else understands his destination. | The protagonist recognizes the remembered theft before contact, names the whistle, asks Ailo to lead, and refuses to let him go alone. | Ailo becomes active companion only here in the second run. | First run whistle lost and Ailo missing; second run Ailo companion state. |
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
| Mia / 米婭 | Saves the protagonist in her private herb workroom before town introduction; owns no shop. | Ch2 family record and market prescription authorization; Ch3 bodily cost and relationship conflict; Ch4 countergear research; Ch5 Elemental Lord shard surgery. | Removes the shard and saves the protagonist, then dies when fixed-pressure forceps crush it in her grasp. Her workroom and final relationship tile remain; baseline market medicine continues. | The remembered ratchet click opens a pressure-free procedure. She survives, accepts shared protection, changes the inherited workroom, and completes the romance when the protagonist returns without an injury. | `Bitter Bottles`, `Name Under The Herb Basket`, `Fourfold Countergear`, `After The Ratchet`; recipe authorization, patient records, and town relationships only. |
| 芙蕾 | Appears at South Gate in Ch1 as ordinary patrol flag bearer. | Ch2 tracks who returns; Ch3 names the childhood flag rescue and covers Tavi's unmeasured rear marker; Ch4 evacuation places her at the fatal route decision while the protagonist is physically isolated. | Dies holding the flag at Gray Ridge; later appears only through returned object and town absence. | Tavi's measured rear light lets her remain at the front; she survives, understands the elder's fear of watching others leave, and shares route duty without surrendering courage. | `Patrol Soles`, `Lamp Oil In Fog`, `Flag And Lamp`; South Gate, morale, route readability, future Frey CG. |
| 塔維 | Seeded behind Frey's Ch1 gate scene as practical lamplighter. | Ch2 maintains reopened route lights; Ch3 revisits the childhood mist, personally measures the far marker only in the second run, and admits why he took the lamp; Ch4 rear-marker crisis tests that admission. | Freezes, survives Frey's death, becomes hollow but functional through Ch5-7, and lights the final bad-ending gate lamp. | Acts while afraid, saves Frey, remains an ordinary lamplighter, and signals beside her in the true ending. | `Lamp Oil In Fog`, `Flag And Lamp`; night-route safety, `tavi_role_admitted`, and run-specific rescue condition. |
| Blacksmith | Ch1 Cold Forge reopens basic repair and makes equipment pressure human. | Ch2 undead preparation; Ch3 shadow fittings; Ch4 places evacuation fittings before new weapons and handles flag/lamp returns; Ch5 modifies the surgery tools and completes anchor housings. | Survives as town-temperature gauge; after the false victory he values the protagonist's return but admits the day's human losses cannot be repaired. | Living cast preserves his loud warmth; he resumes full forge rhythm and places a leaking pot before the hero's weapon because ordinary repair is his proof of victory. | `Cold Forge Smoke`, `Shadows Still Count Names`, `Flag And Lamp`, `Fourfold Countergear`, `Forge Contracts`, `Glimmer Reveals The Core`. |
| 艾洛 | Visible but unexplained in Ch1; searches scraps and route sounds. | Ch2 separates the useless dye flower from market packing; Ch3 mistakes commands for road fragments; Ch4 hears a lower road and names the missing whistle; Ch5 recognizes its sound. | Steals whistle after dragon war, opens old road, dies unseen near mountain; no body or letter. | Approached before theft, accompanies player, witnesses Neelu memory, survives, later leaves voluntarily and sends unsigned flower. | `Echo Whistle`, `Flower At The Echo's End`; old-road access, memory scene, achievement without material reward. |
| 維斯珀 | Absent from early broken town; first appears through Ch3 showcase temptation. | Ch4 directly prices Frey's death or the fear created by her near-loss; Ch5 converts Lorne's repeated interference into a settlement; Ch6 forces the wager. | Cheating exposed but escapes; remains an unresolved predator in the hollow ending. | Current-run loaded set is exposed; he loses from guest position and is collected by the unnamed creditor; no redemption. | `Showcase Glass`, `Loaded Dice`, `Blank Collateral`; ticket pools, display case, contract removal, one prize choice. |
| 洛恩 | Enters in Ch3 as polished dealer and compromised casino operator. | Ch4 refuses a private table in front of Vesper after Gray Ridge, making his resistance visible and costly; Ch5 invokes the witness clause as Vesper tightens his contract. | Saved in Ch6; gives Loaded Dice after Vesper escapes; survives with guilt and watches the empty owner door. | Marks the loaded set, survives collection, opens the display case, publishes the ledger, and operates transparent ticket games only under oversight. | Casino table scenes, dealer rescue, loaded-dice proof, post-Vesper system continuity. |
| 妮露 | No living present-day entry. Exists as broken nouns and sensory fragments in Ailo's Ch1-6 speech. | Her dye-mending work, flower, and promise remain deliberately incomplete. | Never appears in first-run explanatory form. | Appears only in Ch7 memory as a mountain-village dye-mender who gathers seasonal dye plants as part of the same craft, calls Ailo by name, receives his grief, and repeats the ordinary promise. | `Flower At The Echo's End`; memory and future CG only, no ghost guidance or system shop. |
| `elder_dragon` | Environmental heat, route closure, and records seed it from Ch1-5 without a speaking portrait. | Ch5 expedition evidence reframes dragon blockade; Ch6 is its only direct chapter. | Warns once, fights, and is erased with the local seal-keeping clan; containment collapses. | Judges current action, withholds attack without trust or passage grant, survives, and holds pressure during final execution. | `Outside The Seal Scar`; Boss art doubles as dialogue presentation. |
| Demon King Helsarn / 魔王赫爾薩恩 | Physical cause remains hidden behind symptoms; no direct speech Ch1-6. | Its pressure creates roots, dead routes, shadows, terrain movement, and elemental convergence without turning every human evil into its plan. | Combat body falls; surviving post-credit body speaks `我記住你了，凡人。` | Resets without run memory; body, echo, and land survival are severed by preparation and it dies without redemption. | Final Boss, first false victory, second true execution; no base light/Void dependency. |
| Merchant | Enters when Chapter 2 market route becomes usable. | Supplies route stock in Ch2, countergear inputs in Ch4, and forge contract stock in Ch5. | Remains functional in both endings; reacts to road losses but owns no long arc. | Same function with safer supply state. | `Empty Crates`, `Forge Contracts`; no supply captain needed. |
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
| Mia | Rescue, family wound, mutual self-neglect conflict, honest return, Chapter 4 fear, operation, death/rescue, and final invitation without an injury. | Workroom routine, romance, ordinary rest, recipe research, and relationships not needed to discover the pressure-free procedure. |
| Frey / Tavi | Flag/lamp introduction, childhood mist, Tavi's required measurement, Gray Ridge separation, death/rescue, aftermath, and final shared signal. | Patrol banter, route-marking habits, friendship, and humor that does not own the wind-guard rescue condition. |
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
| 2 | Recovered crates are empty and obsolete instructions still move cargo and dead people along the wrong route. | Names regain context; dry cloth, sweet gel, bottles, and already-authorized medicine reach the public market. Residents visibly receive finite wrapped stock rather than celebrating an abstract reopening. | Mia's father remains honestly missing. The protagonist helps her sort leaves and notices that every passing footstep still draws her eyes to the door. | Human inspection spacing at the north checkpoint turns restored travel into a question about the old expedition. |
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
- `Quests.js` exposes seven scene-driven chapter records with empty rewards.
- `OptionalSideStoryRegistry.js` keeps seven character-deepening concepts
  deferred, skip-safe, and reward-free until map owners are approved.
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
- Second-run arc: after 塔維 personally measures the rear marker and admits why
  he took the lamp, he acts first while still afraid. She remains at the front
  flag, survives, and tells the elder that seeing 塔維 in danger made her want to
  call him back. Her courage becomes shared rather than solitary.
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
| `casino_dealer` names `賽菈` and `惡魔莊家`. | Dealer identity is still unresolved; neither scaffold name is canon. |
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

## Seven Chapter Story Spine V0

| Chapter | Level | Working Title | Boss Convergence | Suspense Function |
| ---: | ---: | --- | --- | --- |
| 1 | 1-10 | 南門以外 / Beyond The South Gate | `forest_guardian` with `ambush_mantis` as early route threat | The player proves which roads still exist and learns the woods are reacting to route damage, not ordinary monster movement. |
| 2 | 11-20 | 斷路上的藥味 / Medicine On The Broken Road | `lich` | Supply and medicine return, but old records imply the town has hidden a previous evacuation. |
| 3 | 21-30 | 影子仍守夜 / Shadows Still Keep Watch | `shadow_commander` | Shadow enemies look less like invaders and more like orders that never ended. |
| 4 | 31-40 | 石心與灰雨 / Stone Heart, Ash Rain | `ancient_titan` | The ground, forge routes, and old structures reveal that the map itself is part of a lock. `ash_baron` remains an optional second-run external Boss outside mandatory convergence. |
| 5 | 41-50 | 元素失衡 / The Elements Lose Their Shape | `elemental_lord` | Fire, ice, thunder, poison, and craft routes stop feeling separate; old expedition truth surfaces and drives the elder's first-run death bridge. |
| 6 | 51-60 | 龍守封痕 / The Dragon Guards The Scar | `elder_dragon` | Dragon pressure reveals the old seal damage; first run becomes war, while second run earns evidence-bound non-attack without dragon trust or a granted road. |
| 7 | 61-70 | 墜落之地 / Where The Demon Fell | `demon_lord_asariel` | The final enemy waits beyond the old mountain route; the ending tests whether the rebuilt town network and second-run understanding can stand behind the player. |

## Integrated Mainline And Character Flow V0

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
| 2 | Restored routes become supply, market medicine, trade flow, and old evacuation evidence. The `lich` route shows that old records and old dead do not stay quiet. | 伊萊's paperwork becomes useful but visibly incomplete; Mia's father's record deepens her family wound; the blacksmith and market turn town recovery into gameplay preparation. | Medium side stories attach names to supplies, prescriptions, route notices, and graves. Rewards should be stock authorization, information, or modest story-matched gear. | The player learns that a correct-looking record can still be incomplete enough to outlive its context. |
| 3 | Shadow pressure enters around Lv24-30. Old orders, black iron, rumor routes, casino display cases, and black-market access make shortcuts tempting. | Vesper notices desire through the casino showcase; the dealer becomes a compromised witness; Ailo's first-run nonsense starts feeling less disposable; Tavi's lamp route begins. | Side stories introduce temptation and risk: casino odds, black-market receipts, shadow soldier traces, lamplight route checks. | The game asks whether the player wants stable preparation or faster, uglier sources of power. |
| 4 | Stone routes, ash pressure, and the first broad elemental instability show that the map itself is part of a lock. | Frey and Tavi's first-run route crisis lands here: Tavi freezes, Frey holds direction, and Frey dies. The blacksmith's village-temperature role sharply changes afterward. | Side stories prepare elemental countergear and make the flag/lamp route feel earned before the death scene. | Courage is proven real, but the first run shows courage alone can still leave someone dead. |
| 5 | Elemental fronts stop feeling separate. The old expedition truth surfaces through elder and scholar records while advanced forge and dungeon preparation become necessary. | 伊萊 compresses four safe separated-residue records into one unscoped handling line. The Elemental Lord's death burst embeds a combined shard in the protagonist; Mia saves the protagonist during surgery, then dies when the trusted fixed-pressure procedure crushes it. The elder recognizes the old sealed route pattern. | Long side stories establish countergear, advanced forge contracts, evidence scope, current-run fragment behavior, Mia's relationship record, and the old expedition list. | Mia's death concretely breaks 伊萊's confidence in useful paper; the elder's solitary departure then removes his oldest friend and makes the town lose its ordinary voice. |
| 6 | The dragon clan blocks the damaged sealed perimeter. First run becomes war because the player lacks proof and continues like a stronger old expedition. | The elder's aftermath yields `seal_scar_shard`; the scholar can identify what the shard means but not solve the route alone. Vesper's first-run casino route exposes loaded dice and contract abuse, but he escapes. | Side stories now carry durable consequences: dragon-perimeter proof, loaded dice, blank collateral contracts, forbidden stock, and risky preparation. | The player can win by force, but the victory feels wrong because the route was misunderstood. |
| 7 | The mountain route fails until the Echo Whistle opens the lost local path. Ailo steals it, disappears, and the old road opens. The player defeats the Demon King's combat body and receives a false victory. | Ailo's first-run truth is almost understood too late. The town network can support the final push, but first-run losses leave the ending hollow. | Side stories should be sparse and heavy: Echo Whistle aftermath, final town preparation, and mandatory glimmer interpretation. Formal light remains a second-run external hook. | The visible final boss is defeated, but the player understands that victory without understanding has left too much ruined. |

### Second Run Reframing Flow

| Chapter Window | Reframed Action | Characters Saved Or Re-read | Result |
| --- | --- | --- | --- |
| Chapters 1-2 | The player notices that route warnings, Mia's care, and 伊萊's paperwork were not generic tutorial text. | The ratchet memory does not solve anything early; it makes the player attend to ordinary tools and the distinction between a recipe record and a material-handling record. | Early town recovery becomes emotionally precise without granting false foreknowledge. |
| Chapters 3-4 | The player completes Tavi's route before the flag crisis. | Tavi admits why he became the lamplighter and acts while still afraid; Frey no longer has to die. | The south gate becomes a living proof that second-run understanding can change a fate without making the first run meaningless. |
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

### `ch1_s01_road_collapse`

- `stageClass`: `regional_canvas`
- `background`: `working: south road outside town, broken verge and blackened root pressure`
- `worldState`: Chapter 1 opening; overcast; town still out of sight behind the bend
- `viewpoint`: `protagonist_limited`
- `participants`: Mia enters only after the opening encounter
- `entry`: player control begins on the south road; the event layer interrupts when route behavior changes
- `exit`: fade through loss of consciousness into Mia's workroom
- `objective`: survive the opening encounter and reach shelter
- `inputs`: new game or new-run Chapter 1 start
- `outputs`: protagonist wounded but alive; Mia opening rescue; workroom opening state
- `assetNotes`: missing regional opening background; reuse Mia's current portrait until layered expressions exist

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 0 | any | narration | - | - | 王國的巡查令在外套內袋磨著肋骨。這片邊境已錯過數次稅簿與信使回報，我奉命確認道路為何失去消息，以及還有沒有人能把答覆送出去。 |
| 1 | any | narration | - | - | 南路沒有風，草卻一叢接一叢向北伏倒。泥上的爪印彼此重疊，像原本互不相近的東西忽然都在追同一條路。 |
| 2 | any | narration | - | - | 路肩裂開一線黑色。細根在土下鼓動，前方的動靜也同時停了。 |
| 3 | any | exit | - | - | 收起事件層，進入開場途中遭遇。 |
| 4 | any | enter | - | - | 戰鬥結束後重新開啟事件層；鏡頭停在路面與主角失去力氣的手。 |
| 5 | any | narration | - | - | 傷口沒有立刻流出多少血，麻木卻沿著手臂往上爬。遠處的南門只剩一小塊灰色輪廓。 |
| 6 | any | narration | - | - | 腳步從城鎮方向逼近。有人先按住你的手，阻止你去摸傷口。 |
| 7 | any | enter | - | - | Mia 進入近景，跪在主角身側，先檢查瞳孔與呼吸。 |
| 8 | any | speaker | `herbalist` | `resolute` | 手離開那裡。能聽見就眨一下眼。 |
| 9 | any | speaker | `herbalist` | `guarded` | 很好。現在別證明你能站。活著就夠了。 |
| 10 | any | narration | - | - | 苦澀的氣味壓過潮土。布帶收緊時，黑色的細根仍在道路另一側朝北顫動。 |
| 11 | any | exit | - | - | Mia 扶住主角；畫面失焦並轉入工作間。 |

### `ch1_s02_wake_under_bitter_bottles`

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
| 2 | second_run | narration | - | - | 杯子的位置熟悉得讓人胸口發緊。米婭還活著，窗仍關著，一切都尚未走到那聲棘輪。 |
| 3 | any | speaker | `herbalist` | `neutral` | 醒了先別坐。左手抬給我看，慢一點。 |
| 4 | any | narration | - | - | 你照做。指尖仍麻，但已能分辨冷熱。 |
| 5 | any | speaker | `herbalist` | `pleased` | 很好。至少你沒有把「醒了」誤會成「痊癒」。很多人分不清。 |
| 6 | any | narration | - | - | 你問起地點與救命的人。她把杯子遞近，沒有先談價錢。 |
| 7 | any | speaker | `herbalist` | `soft` | 我叫米婭。這是我的工作間，不是旅店，也不是店鋪。先喝水。 |
| 8 | any | speaker | `herbalist` | `guarded` | 南路的傷不深，麻痺卻不對。苦葉壓得住，甜膠能讓藥留在傷口上。我會把比例寫給市集，可他們得先有貨。 |
| 9 | any | narration | - | - | 你提到報酬。米婭把換下的染血布折到看不見的一面。 |
| 10 | any | speaker | `herbalist` | `pleased` | 等你活得久一點，再找機會欠我。這一筆不收。 |
| 11 | any | speaker | `herbalist` | `neutral` | 能走以後去十字路口。村長在等南路的消息。慢慢走，不准把暈倒算成捷徑。 |
| 12 | any | exit | - | - | Mia 拉開外門；控制權回到城鎮，工作間保留為故事地點。 |

### `ch1_s03_broken_crossroads`

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
| 1 | any | narration | - | - | 十字路口比一座正常城鎮安靜太多。鐵匠鋪沒有煙，市集棚布只剩繩子，南門旁的回程板空了大半。 |
| 2 | any | narration | - | - | 井邊排著共用水桶；一塊木牌輪流記著哪戶今天能點爐、哪張床必須留給傷者。連抱怨都說得很小聲，像怕浪費別人的力氣。 |
| 3 | second_run | narration | - | - | 那些空位都還只是空位。記憶知道誰會消失，街道卻尚未失去任何人。 |
| 4 | any | enter | - | - | 一名衣衫破舊的乞丐從廢木箱後探出手，把一段爛繩貼到耳邊。 |
| 5 | any | speaker | `street_beggar` | `guarded` | 這條沒聲音。路把嘴咬掉了。花也聽不見。 |
| 6 | any | exit | - | - | 乞丐抱著爛繩離開畫面，不等待回答。 |
| 7 | any | narration | - | - | 你還沒追問，一名老人已從公務室的方向走來。他先看你的步子，再看包紮。 |
| 8 | any | enter | - | - | Village elder 進入；站位刻意留出通往米婭工作間的路。 |
| 9 | any | speaker | `village_elder` | `guarded` | 米婭讓你出門，表示你至少聽得懂勸。南路發生了什麼？ |
| 10 | any | narration | - | - | 你說明聚集的怪物、土下的黑根，以及所有痕跡朝北偏去。老人聽到「朝北」時停了一瞬。 |
| 11 | any | speaker | `village_elder` | `neutral` | 能走，不等於路能走。跟我來。伊萊有舊圖，也有本事在承認圖不可靠之後繼續查。 |
| 12 | any | exit | - | - | Elder 轉向 civic room；開啟跟隨與下一場景。 |

### `ch1_s04_elder_to_scholar`

- `stageClass`: `town_scene`
- `background`: working civic room connected to 伊萊's damp-paper desk
- `worldState`: Chapter 1; repair notices and missing-person lists interrupt ordinary records
- `viewpoint`: `protagonist_limited`
- `participants`: village elder, town scholar
- `entry`: elder and protagonist enter while 伊萊 is moving papers away from a damp wall
- `exit`: traveler handbook opens with three fixed unknown `?` location nodes
- `objective`: inspect the farmland, hunter boardwalk, and old campfire site, then return with physical evidence
- `inputs`: south-road report
- `outputs`: traveler handbook; three-landmark objective; uncertainty rule established
- `assetNotes`: civic/scholar background may reuse one room with desk-focused staging

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 伊萊用三只杯子壓住同一張路圖。牆角受潮，墨線在南側暈成一片。 |
| 2 | any | enter | - | - | Town scholar 抬頭；elder 留在桌側，不替他說明。 |
| 3 | any | speaker | `town_scholar` | `pleased` | 你就是米婭從路邊撿回來的那位。請坐。那張椅子沒有斷，只是很有自己的看法。 |
| 4 | any | speaker | `village_elder` | `guarded` | 人先別坐壞。南路的東西聚在一起，根往北走。 |
| 5 | any | narration | - | - | 伊萊把一張舊稅路、一份巡線記錄與今天的空白回程板並排。 |
| 6 | any | speaker | `town_scholar` | `neutral` | 舊圖只告訴我們路以前在哪裡。現在得看三處：南門外田埂的腳印、獵人棧道的繩結、舊營火地的煙灰。順序隨你。 |
| 7 | any | speaker | `town_scholar` | `guarded` | 看見什麼就記什麼。沒有腳印也算答案，別替紙補上它想要的東西。 |
| 8 | any | speaker | `village_elder` | `resolute` | 天色變前回來。遇到堵路的，不必為了證明勇敢硬闖。 |
| 9 | any | narration | - | - | 你問為何不直接清掉沿路怪物。老人看向那塊被潮氣抹去的北線。 |
| 10 | any | speaker | `village_elder` | `neutral` | 因為我們缺的不是怪物的數量。我得先知道哪條路還能把人送回來。 |
| 11 | any | speaker | `town_scholar` | `pleased` | 手札拿好。紙怕水、怕火，也怕自信過頭的人。第三樣最常見。 |
| 12 | any | exit | - | - | 開啟旅途手札與三個黑色 `?` 地標；控制權回到 civic room 出口。 |

### `ch1_s05_south_gate_introduction`

- `stageClass`: `town_scene`
- `background`: existing South Gate scene, future broken-state full background
- `worldState`: Chapter 1 daylight; damaged gate; patrol flag visible; lamp unlit but maintained
- `viewpoint`: `protagonist_limited`
- `participants`: standard_bearer_frey, lamplighter_tavi
- `entry`: protagonist approaches the closed gate action after receiving the handbook
- `exit`: gate opens onto the Chapter 1 regional canvas
- `objective`: leave through South Gate and return before visibility fails
- `inputs`: three-landmark objective active
- `outputs`: Frey and Tavi introduced; fatigue and return-route warning made diegetic; South Gate departure opened
- `assetNotes`: reuse current portraits; future layered background must show ordinary flag and ordinary patrol lamp

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 南門的木料換過幾種顏色，最新的補板也已裂開。芙蕾把巡線旗靠在肩上，正逐筆核對空蕩的回程板。 |
| 2 | any | enter | - | - | Frey 進入前景；Tavi 留在後方拆開一盞普通巡燈的玻璃罩。 |
| 3 | any | speaker | `standard_bearer_frey` | `pleased` | 要出門？名字留一下。出去一個，回來也得一個，別逼我把你寫成兩行。 |
| 4 | any | narration | - | - | 你出示伊萊的手札。芙蕾看完三處標記，收起笑意。 |
| 5 | any | speaker | `standard_bearer_frey` | `resolute` | 田埂最近，棧道最窄，舊營火地回程最容易起霧。累了就折返，手札不值得拿命補完。 |
| 6 | any | enter | - | - | Tavi 把玻璃罩裝回燈框，向前半步又停住。 |
| 7 | any | speaker | `lamplighter_tavi` | `guarded` | 如果霧提早下來，看路左邊的燈。火很小，但玻璃還沒裂。應該……還看得見。 |
| 8 | any | speaker | `standard_bearer_frey` | `pleased` | 他說「應該」的時候，通常已經檢查過三次。這點可以信。 |
| 9 | any | speaker | `lamplighter_tavi` | `neutral` | 四次。剛才風向變了。 |
| 10 | second_run | narration | - | - | 旗在前，燈在後。位置與記憶完全相同，但現在還沒有任何理由要求他們交換責任。 |
| 11 | any | speaker | `standard_bearer_frey` | `soft` | 去吧。回來時喊一聲。我不喜歡只看見影子走近門。 |
| 12 | any | exit | - | - | South Gate 開啟；切回區域 Canvas 與疲勞系統。 |

### `ch1_s06_three_landmarks`

- `stageClass`: `regional_canvas`
- `background`: handcrafted Chapter 1 canvas with three fixed discovery nodes
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
| 1 | any | narration | - | - | 三頁紀錄沒有指向同一種怪物。田埂留下突然改向的獸爪，棧道有人為回程準備的銀線，冷灰下則有仍在向北收縮的根。 |
| 2 | any | narration | - | - | 我把觀察與猜測分開寫下。能確定的只有一件事：這三處不是三場互不相干的麻煩。 |
| 3 | second_run | narration | - | - | 記憶知道北方藏著什麼，此刻的證據卻還不夠。我沒有替這一頁補上答案。 |
| 4 | any | narration | - | - | 我收起手札。來時看過的那段銀線，已經不在原來的位置。 |
| 5 | any | exit | - | - | Return to the regional canvas and activate the fixed silver-snare route. |

### `ch1_s07_silver_snare`

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
| 1 | any | narration | - | - | 回程路標被轉了半圈，箭頭指向沒有腳印的灌木。你停下時，膝後傳來一聲極輕的繃響。 |
| 2 | any | narration | - | - | 銀線不只攔在前方。它沿著你剛才走過的路逐段收緊，把折返也算進陷阱。 |
| 3 | any | enter | - | - | Ambush Mantis 從棧道下方翻上路面；切入固定遭遇演出。 |
| 4 | any | exit | - | - | 收起事件層，進入 Ambush Mantis 戰鬥。 |
| 5 | any | enter | - | - | 戰鬥結束後回到路標近景。 |
| 6 | any | narration | - | - | 銀線末端纏著黑褐樹脂與細碎焦皮，和舊營火地的根汁相同。伏擊者不是源頭；牠只是把那股變化學成了獵法。 |
| 7 | any | narration | - | - | 手札追加：怪物會讀取人的路線；黑根壓力正改變捕食行為。線索指向更深的林地。 |
| 8 | any | exit | - | - | 路障解除；開啟回城與 `Cold Forge Smoke`。 |

### `ch1_s08_cold_forge_smoke`

- `stageClass`: `town_scene`
- `background`: existing forge scene in cold-to-relit transition
- `worldState`: Chapter 1 return; route evidence under review; bellows linkage jammed; basic furnace recoverable
- `viewpoint`: `protagonist_limited`
- `participants`: village elder, town scholar, blacksmith
- `entry`: protagonist reports the three records and Ambush Mantis evidence before taking damaged gear to the forge
- `exit`: forge actions open and the evidence-backed forest route becomes the next objective
- `objective`: report the evidence, restore damaged equipment, and decide whether the shared residue justifies entering the forest
- `inputs`: Ambush Mantis cleared; protagonist equipment damaged
- `outputs`: three clues synthesized; forest investigation chosen; basic repair and starter crafting opened; blacksmith relationship seed
- `assetNotes`: reuse forge background with cold/relit state treatment; no apprentice asset or new NPC

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 南門在我身後重新落閂。公務室裡，伊萊把三頁紀錄排開，又在旁邊留了一塊位置給伏獵者身上的銀線與黑褐樹脂。 |
| 2 | any | speaker | `town_scholar` | `guarded` | 腳印告訴我們牠們改了方向，銀線告訴我們有東西學會守回程，樹脂則把兩件事接回那道黑根。這還不是答案，但已經不是巧合。 |
| 3 | any | speaker | `village_elder` | `guarded` | 你親眼走過。告訴我，你認為該停在這裡，還是沿著根往林子裡查？ |
| 4 | any | narration | - | - | 我指向三頁上共同朝北的痕跡。伏獵者會死，陷阱也能拆掉；只要地下那股壓力還在，下一種東西仍會學會利用它。 |
| 5 | any | speaker | `village_elder` | `resolute` | 那就查到能證明它從哪裡來為止。先把裝備處理好。我不會一面叫你別逞強，一面把你拿去餵林子。 |
| 6 | any | narration | - | - | 鐵匠鋪的門只開一半。爐膛有煤，風箱卻卡在最低處，拉桿每動一下就撞回原位。 |
| 7 | any | enter | - | - | Blacksmith 從風箱後抬頭，先看裝備裂口，再看主角的包紮。 |
| 8 | any | speaker | `blacksmith` | `guarded` | 米婭放你出來，不代表你該把自己磨成第二件廢鐵。武器給我。 |
| 9 | any | narration | - | - | 他扯了扯回收的銀線，確認韌度，再指向脫槽的風箱接帶。 |
| 10 | any | speaker | `blacksmith` | `neutral` | 爐子沒死，關節卡了。你拉住那邊，我把線穿回去。別鬆手，鬆了它先打我，再打你。 |
| 11 | any | narration | - | - | 風箱第一次完整抬起時，冷灰往煙道深處退了一截。第二次，火星終於咬住煤面。 |
| 12 | any | speaker | `blacksmith` | `pleased` | 看吧，還會喘。比你剛送來的裝備有出息。 |
| 13 | second_run | narration | - | - | 他的大嗓門仍在。記憶知道這間鋪子日後會只剩一聲沉默的錘響，但現在火才剛回來。 |
| 14 | any | speaker | `blacksmith` | `resolute` | 基本修補我能做。更好的東西得等路、料和圖都回來。別拿金幣問爐子為什麼不吃空氣。 |
| 15 | any | narration | - | - | 他把修好的裝備推回來，手指停在那塊染血的護面上。 |
| 16 | any | speaker | `blacksmith` | `soft` | 下次把人帶回來。裝備怎樣都行。 |
| 17 | any | exit | - | - | Basic forge actions unlock; protagonist returns to crossroads with forest route objective. |

### `ch1_s09_rotroot_approach`

- `stageClass`: `regional_canvas`
- `background`: handcrafted route from `broken_horn_camp` into `rotroot_ravine`
- `worldState`: Chapter 1 forest pressure; bark damage and northbound root pulse intensify
- `viewpoint`: `protagonist_limited`
- `participants`: none
- `entry`: handbook aligns Ambush Mantis resin with black-root traces
- `exit`: player reaches the ancient root-heart threshold
- `objective`: follow the shared residue without treating every forest creature as the source
- `inputs`: silver-thread evidence recorded; basic forge available
- `outputs`: Forest Guardian convergence opened; northbound pressure recorded
- `assetNotes`: regional route and root-heart threshold backgrounds required later

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 斷角營地的骨片都朝同一側散開，像有什麼從地底抬起過整片土。樹皮上的剝痕很新，傷口裡卻沒有啃咬留下的齒印。 |
| 2 | any | narration | - | - | 越接近腐根裂谷，野獸的足跡越少。牠們不是聚向這裡，而是在繞開一條會搏動的地下根脈。 |
| 3 | any | narration | - | - | 米婭在手札邊角留下的症狀記錄與眼前一致：先麻木，再發熱；接觸時間越長，方向感越差。這不是可供交易的鑑定，只是她不想再看見同一種傷。 |
| 4 | any | narration | - | - | 伊萊的舊圖把裂谷畫成死路。現況卻顯示根脈穿過岩縫，繼續朝北。 |
| 5 | second_run | narration | - | - | 你知道北方的答案遠比這一章殘酷，仍只能記下此刻能證明的事：森林正在承受從別處傳來的壓力。 |
| 6 | any | narration | - | - | 前方傳來沉重的抓地聲。被剝去大片樹皮的守護者堵在根心之前，對所有靠近者做出同一個驅離動作。 |
| 7 | any | exit | - | - | 開啟 Forest Guardian 固定地點與 Chapter 1 Boss gate。 |

### `ch1_s10_forest_guardian`

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
| 1 | any | narration | - | - | 守護者的前肢沾滿黑汁，肩背的舊木甲卻留下人為剝取的痕跡。牠守著受傷的根心，也把每一個靠近者當成下一把刀。 |
| 2 | any | narration | - | - | 根心在牠身後收縮。每一次搏動都比牠的呼吸早半拍，壓力並不由牠發出。 |
| 3 | any | enter | - | - | Forest Guardian 進入滿版 Boss 演出；鏡頭保留受傷根心作為因果背景。 |
| 4 | any | exit | - | - | 收起事件層，進入 Forest Guardian 戰鬥。 |
| 5 | any | enter | - | - | 戰鬥結束；守護者倒下，根心仍繼續朝北收縮。 |
| 6 | any | narration | - | - | 沒有守護者阻擋後，黑色細根反而更清楚。它們穿過根心，不在此處生長；像某種更遠的脈動借森林傳遞。 |
| 7 | any | narration | - | - | 手札結論：守護者是被傷口逼瘋的守門者，不是傷口本身。附近道路可重新判讀，但北向壓力仍在。 |
| 8 | any | exit | - | - | Chapter 1 regional Boss state clears; return-to-town sequence begins. |

### `ch1_s11_roads_breathe_again`

- `stageClass`: `town_scene`
- `background`: town crossroads in first recovery state, with South Gate, forge smoke, and empty market edge visible in sequence
- `worldState`: Chapter 1 close; nearby roads readable but unsafe; market still lacks a supply route
- `viewpoint`: `protagonist_limited`
- `participants`: village elder, town scholar, Mia, Frey, Tavi, blacksmith, street beggar
- `entry`: South Gate records the protagonist's return and the scene follows evidence into town
- `exit`: Chapter 2 objective opens at the empty market edge
- `objective`: report the forest result and identify what town function can honestly recover
- `inputs`: Forest Guardian cleared; northern pressure evidence held
- `outputs`: Chapter 2 opened; first town recovery state; basic forge/gate/handbook retained; Mia's basic recipe authorized but unavailable until market supply returns
- `assetNotes`: one recovery-state crossroads background plus existing character portraits and ordinary repair props; no new resident portrait and no generation before screenplay lock

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 南門先看見的是人影，接著才是手札。芙蕾在回程板上把同一個名字劃回原欄。 |
| 2 | any | enter | - | - | Frey 與 Tavi 進入；旗回到門側，Tavi 點亮一盞供晚歸者辨認的燈。 |
| 3 | any | speaker | `standard_bearer_frey` | `pleased` | 一行出去，一行回來。很好，我今天不用改規矩。 |
| 4 | any | speaker | `lamplighter_tavi` | `soft` | 左邊那盞有亮到嗎？我把燈芯剪短了，霧裡比較不會亂跳。 |
| 5 | any | narration | - | - | 報告在公務室攤開。伊萊把「守護者」與「源頭」分成兩欄，村長盯著那條北向根線。 |
| 6 | any | enter | - | - | Elder、town scholar 與 Mia 進入桌邊場景。 |
| 7 | any | speaker | `town_scholar` | `guarded` | 三處路況、伏擊方式、根心搏動都對得上。附近會安靜一陣，但「安靜」不能寫成「安全」。 |
| 8 | any | speaker | `village_elder` | `neutral` | 就這樣寫。明天有人看見這頁，得知道自己能走多遠，也得知道哪裡不能信。 |
| 9 | any | speaker | `herbalist` | `neutral` | 我把南路傷口的配方整理好了。貨路一通，市集可以照方備藥；現在只有紙，別把紙當成瓶子。 |
| 10 | any | speaker | `herbalist` | `guarded` | 手給我。你回來了，不代表南路那種麻痺有禮貌到一起離開。 |
| 11 | any | narration | - | - | 米婭依序碰過指尖，讓你閉眼分辨冷水與溫杯。她確認答案後才把手放開。 |
| 12 | any | speaker | `herbalist` | `pleased` | 冷熱分得出來。很好。今天至少是你自己走回來的。 |
| 13 | any | narration | - | - | 遠處的鐵匠鋪傳來風箱聲。鐵匠走到門邊，手上仍沾著冷灰。 |
| 14 | any | enter | - | - | Blacksmith 短暫進入 crossroads 邊緣。 |
| 15 | any | speaker | `blacksmith` | `pleased` | 爐子會燒，門也還站著。先別替我慶祝，等你們把能運煤和鐵的路找回來再說。 |
| 16 | any | narration | - | - | 爐前排起的第一批東西沒有一把武器：漏水的鍋、鬆掉的門鉸、裂開的手推車輪。鐵匠嘴上罵著順序，卻把鍋放到最前面。 |
| 17 | second_run | narration | - | - | 這些聲音都回到了原位：旗布、燈罩、風箱、紙頁。記憶沒有讓任何人知道未來，只讓你聽見它們將來可能缺席。 |
| 18 | any | enter | - | - | Street beggar 從空市集棚後探出身，手裡換成一片彎曲木屑。 |
| 19 | any | speaker | `street_beggar` | `guarded` | 北邊不是北邊。花在上面，路在下面。你們的紙走反了。 |
| 20 | any | exit | - | - | 乞丐離開。鏡頭停在空箱與斷掉的運貨繩；Chapter 2 market-supply objective opens. |

## Chapter 2 Detailed Screenplay V1

Status: `complete_pending_user_review`. Chapter 2 joins market recovery, Mia's
family wound, the evacuation ledger, and the Lich route into one causal line.

### `ch2_s01_empty_crates`

- `stageClass`: `town_scene`
- `background`: market edge in closed-to-sparse recovery state
- `worldState`: Chapter 2 opening; first nearby road reopened; recovered crates damaged or empty
- `viewpoint`: `protagonist_limited`
- `participants`: merchant as a functional role only
- `entry`: protagonist follows the Chapter 1 return camera toward the empty market stalls
- `exit`: market remains non-transactional while the missing delivery route becomes active
- `objective`: inspect the recovered cargo marks and trace where the carriers stopped
- `inputs`: Chapter 1 complete; nearby road readable
- `outputs`: market recovery objective; carrier names recorded; empty-crate route source identified
- `assetNotes`: reuse market background in sparse state; merchant personality and final portrait remain unresolved

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 三只貨箱排在空攤前。第一只裂了底，第二只只剩濕布，第三只的繩結仍完整，裡面卻什麼也沒有。 |
| 2 | any | enter | - | - | Merchant 站在箱後，將運貨牌依序攤開；不建立私人角色弧線。 |
| 3 | any | speaker | `merchant` | `guarded` | 箱子在路邊找到了。送箱的人沒有。要開市，先得知道貨是在哪一段變成空箱。 |
| 4 | any | narration | - | - | 每張運貨牌都有姓名、出發日與預定回程。最後一筆仍照舊路寫著「傍晚前抵達」。 |
| 5 | second_run | narration | - | - | 這種字句已經出現過太多次：事情照規則繼續，人卻沒有回到規則裡。 |
| 6 | any | speaker | `merchant` | `neutral` | 米婭的方子我收到了。沒有甜膠、乾布和乾淨瓶子，紙再好也賣不了藥。把路找回來，攤子才有東西可放。 |
| 7 | any | narration | - | - | 箱底黏著霧丘的白泥，側板則擦過刻有葬名的石角。兩種痕跡不該同時出現在正常貨路上。 |
| 8 | any | exit | - | - | Market remains sparse; open the carrier-record handoff to Mia and 伊萊. |

### `ch2_s02_name_under_basket`

- `stageClass`: `town_scene`
- `background`: Mia's herb workroom / working state
- `worldState`: Chapter 2; recovered empty crate and old herb baskets being checked for usable supply
- `viewpoint`: `protagonist_limited`
- `participants`: Mia, town scholar
- `entry`: protagonist brings an old supply mark from the empty crate to Mia's workroom
- `exit`: 伊萊 carries the discovered name tag to the civic archive; the protagonist remains briefly while Mia finishes one prescription record
- `objective`: identify the expedition-era name and connect it to the broken delivery road
- `inputs`: empty-crate inspection complete
- `outputs`: Mia's father entered into handbook relationship record; expedition link opened; one later market prescription researched; shared-work relationship beat
- `assetNotes`: workroom working-state background; no missing gatherer or notebook item

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 米婭把舊籃裡能用的乾葉一一挑出。籃底的補片受潮翹起，露出一塊被編進藤條裡的薄木牌。 |
| 2 | any | enter | - | - | Mia 翻過木牌；看見姓名後，手指停在磨平的邊角。 |
| 3 | any | speaker | `herbalist` | `guarded` | 這是我父親的名字。母親把籃子留著，卻從沒拆過底。 |
| 4 | any | narration | - | - | 木牌背面不是藥材記號，而是二十年前遠征的補給編次。你去請伊萊辨認那排褪色數字。 |
| 5 | any | enter | - | - | Town scholar 進入工作間，先向 Mia 點頭，再把眼鏡推近木牌。 |
| 6 | any | speaker | `town_scholar` | `guarded` | 是我寫的編次。出發物資收了回條，返還欄……沒有。這只籃子後來被當成遺物送回來。 |
| 7 | any | speaker | `herbalist` | `grieving` | 籃子回來了。人沒有。你們很擅長讓物件知道回家的路。 |
| 8 | any | narration | - | - | 伊萊沒有辯解。米婭也沒有要求他替二十年前的人回答。工作間只剩藤條被輕輕壓回桌面的聲音。 |
| 9 | any | speaker | `town_scholar` | `soft` | 名冊裡仍是失蹤。我沒有證據替他死，也不會替你把那一格劃掉。 |
| 10 | any | speaker | `herbalist` | `neutral` | 那就先留著。把同一批的路牌找出來，我要知道他們當時被送去哪裡。 |
| 11 | any | exit | - | - | 伊萊帶走木牌拓記。米婭把情緒收進一次深呼吸，轉身寫完一張以現有材料為限的處方授權。 |
| 12 | any | narration | - | - | 你留下幫她把乾葉分回兩只籃子。巷口每次有腳步經過，她都先抬頭，等聲音走遠才繼續寫。 |
| 13 | any | speaker | `herbalist` | `pleased` | 左邊能用，右邊丟掉。分錯一片，我就讓你親自確認藥效。 |
| 14 | any | narration | - | - | 門其實關得很緊。你沒有拆穿她，只把下一把乾葉放到左邊。照顧沒有抹掉傷口，傷口也沒有取消她的工作。 |
| 15 | any | exit | - | - | Open `Ledger That Would Not Close`, Mia relationship record, and the researched prescription state. |

### `ch2_s03_ledger_that_would_not_close`

- `stageClass`: `town_scene`
- `background`: scholar desk, then short town-stage preparation inserts within the same class
- `worldState`: Chapter 2; expedition and evacuation records spread across an ordinary civic table
- `viewpoint`: `protagonist_limited`
- `participants`: town scholar, village elder, Mia, blacksmith
- `entry`: 伊萊 lays the herb-basket tag beside evacuation lists and funeral markers
- `exit`: route preparation is completed at town level; player returns to the Chapter 2 canvas
- `objective`: verify the last valid evacuation instruction and prepare for the opened-tomb route
- `inputs`: Mia's father tag; empty-crate white mud and burial-stone traces
- `outputs`: mist tablet hill and opened tomb route opened; anti-undead preparation justified; ledger uncertainty recorded
- `assetNotes`: civic desk is primary background; brief workroom/forge inserts use existing town states

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 同一張長桌上放著三種紙：遠征補給、撤離名冊、無人領取的葬牌。它們原本不該屬於同一件事。 |
| 2 | any | enter | - | - | Elder 與 town scholar 分坐兩側；Mia's father's tag stays between them. |
| 3 | any | speaker | `town_scholar` | `neutral` | 這條指示在當年沒有錯。霧丘東側能繞過塌方，開墓地也還沒有開。問題是後來沒有人補上「道路已改」。 |
| 4 | any | speaker | `village_elder` | `guarded` | 因為後來的人都在搬屍體、找活人。紙排在最後。 |
| 5 | any | speaker | `town_scholar` | `guarded` | 我知道。可紙留得比我們久。它現在還在叫人往那裡走。 |
| 6 | second_run | narration | - | - | 你指出名冊日期後缺少任何修訂頁。伊萊接受這個疑問，卻不假裝已知道墓裡發生了什麼。 |
| 7 | any | narration | - | - | 你問那些運貨人是否照著同一條舊指示前進。老人把手壓在路線轉折處。 |
| 8 | any | speaker | `village_elder` | `resolute` | 去霧碑丘，先找路標，不追聲音。抵達開墓地以前，每一塊葬牌都當成有人在用。 |
| 9 | any | narration | - | - | 場景短暫切到米婭工作間。她交出處理屍霧與擦傷的普通布包，沒有開啟診斷或交易介面。 |
| 10 | any | speaker | `herbalist` | `guarded` | 霧進到喉嚨就退。那不是逞強能咳掉的東西。回來以後，先讓我看手指顏色。 |
| 11 | any | narration | - | - | 場景再切到冷爐。鐵匠收緊護具縫隙，把鬆動的扣件全換到不會勾住葬布的位置。 |
| 12 | any | speaker | `blacksmith` | `neutral` | 活人的裝備別去勾死人的東西。看見布就繞，非得砍再砍。 |
| 13 | any | exit | - | - | Route preparation completes; open mist-tablet and tomb regional nodes. |

### `ch2_s04_mist_and_tomb_route`

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
| 1 | any | enter | - | - | Discover `mist_tablet_hill`; replace the unknown `?` with its location record. |
| 2 | any | narration | - | - | 石碑上的箭頭仍清楚，名字卻被一筆筆補在箭頭旁。最晚的字跡不是二十年前，而是這幾天。 |
| 3 | any | narration | - | - | 白霧裡有拖行聲。幾具屍體背著空貨繩，沿著舊箭頭反覆走到塌壁，再轉回起點。 |
| 4 | any | narration | - | - | 你沒有跟著箭頭，而是依照葬牌姓名的編次往反方向查找。編次越早，泥土與防腐香的氣味越重。 |
| 5 | any | enter | - | - | Discover `opened_ancient_tomb`; transition to the tomb threshold image. |
| 6 | any | narration | - | - | 墓門不是從外面破開。石塊被整齊推向兩側，像有人仍按一套早已無人監督的程序出入。 |
| 7 | second_run | narration | - | - | 記憶讓你先看名字，再看屍體。綁住牠們的不是單純死氣，而是「尚未送達」的職責。 |
| 8 | any | narration | - | - | 墓內每隔一段便有一只空釘孔。某件承載所有葬牌的核心物被移進更深處，死者的路也跟著它移動。 |
| 9 | any | narration | - | - | 手札追加：運貨人並未被單一怪物獵殺；他們走入一條仍在執行舊撤離程序的死路。 |
| 10 | any | exit | - | - | Open tomb reliquary and `keeper_of_names` Boss convergence; optional Blood Moon branch remains available before commitment. |

### `ch2_s05_blood_moon_hunt`

- `stageClass`: `location_scene`
- `background`: moon-moss slope crossing into the broken-horn migration ground
- `worldState`: Chapter 2 optional branch; blood-moon migration pressure; no sacred or divine framing
- `viewpoint`: `protagonist_limited`
- `participants`: none; Blood Moon Stag uses full Boss presentation
- `entry`: first run opens as an optional dangerous track; second run marks it mandatory through `未竟的弒王`
- `exit`: migration ground quiets and Life Seed handling resolves before return to the tomb route
- `objective`: defeat the Blood Moon Stag; in the second run preserve its Life Seed intact
- `inputs`: Chapter 2 regional route open; second-run true-kill achievement when applicable
- `outputs`: ordinary Life Seed in first run; `life_seed_intact` current-run execution anchor in second run
- `assetNotes`: reuse approved Blood Moon Stag Boss art; no Mia rescue connection or new material art

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 月苔坡的草不是被踩倒，而是沿著同一條遷徙線反覆長回。斷角、舊蹄印與新蹄印疊在一起，年份彼此咬合。 |
| 2 | first_run | narration | - | - | 這是一條可避開的危險支路。手札只知道血月鹿會在此更換角質與生命組織，不知道那份再生與最終敵人有何關係。 |
| 3 | second_run | narration | - | - | `未竟的弒王` 讓你理解第一輪缺少的不是更大傷害，而是把借來的生命逼回一具可死之身的辦法。這次必須取得完整種核。 |
| 4 | any | narration | - | - | 黑鹿從林線走出。舊傷在血色月光下閉合，脫落的組織又被胸腔深處的搏動拉回。牠不是神使，只是一頭把古老週期活得太久的獸。 |
| 5 | any | enter | - | - | Blood Moon Stag 進入滿版 Boss 演出；切入戰鬥。 |
| 6 | any | exit | - | - | 收起事件層，進入 Blood Moon Stag 戰鬥。 |
| 7 | any | enter | - | - | 戰鬥結束；鏡頭落在胸腔內仍有節律的種核。 |
| 8 | first_run | narration | - | - | 你依普通素材方式取下生命種子。它仍有價值，但完整週期被切斷，沒有顯示更深用途。 |
| 9 | second_run | narration | - | - | 你沒有切開種核。沿著自然脫離的膜層整體取下後，搏動仍保持原來節律。當前周目的完整生命種子被封存為最終身體錨。 |
| 10 | any | exit | - | - | Return to Chapter 2 route; mark branch cleared and reopen tomb convergence. |

### `ch2_s06_keeper_of_names`

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
| 1 | any | narration | - | - | 靈匣外纏滿葬牌。每一塊木牌都用細線接回同一本名冊，頁角磨得像被翻過數千次。 |
| 2 | any | narration | - | - | 乾裂的聲音從墓室中央響起。它沒有先問你是誰，只念出三個已死者的姓名與一條不再存在的撤離路。 |
| 3 | any | enter | - | - | 守名者赫恩以滿版 Boss 形象進入；冠架由靈匣構件、葬牌細鏈與死者遺物層層聚合，不是生前王冠。固定法杖與裝備外觀保持一致。 |
| 4 | any | speaker | `lich` | `neutral` | 名列未清。道路未閉。未抵達者，回到隊列。 |
| 5 | any | narration | - | - | 你指出前路早已塌毀。赫恩翻過空白的修訂頁，像那句話從未進入它的程序。 |
| 6 | any | speaker | `lich` | `guarded` | 名列未清。不得停留。不得遺失。 |
| 7 | any | exit | - | - | 收起事件層，進入 Lich Boss 戰鬥。 |
| 8 | any | enter | - | - | 戰鬥結束；法杖落地，所有葬牌同時失去拉力。 |
| 9 | any | narration | - | - | 名冊末頁留下赫恩自己的筆跡：墓地容不下新死者時，他把姓名、屍體與送達職責綁進同一只靈匣。那是照顧，也是在世界改變後仍拒絕停下的佔有。 |
| 10 | any | narration | - | - | 靈匣裂縫裡留著一片微弱發亮的碎屑。它不灼傷皮膚，只讓墨跡與附著其上的暗痕分得更清楚。 |
| 11 | second_run | narration | - | - | 你依 `未竟的弒王` 保存這片微光碎片，不把它耗在一般製作上。它日後必須協助顯露魔王藏在地形與詛咒裡的核心。 |
| 12 | any | exit | - | - | Dead-route pressure ends; return to town with the phylactery and honest records. |

### `ch2_s07_names_return_to_town`

- `stageClass`: `town_scene`
- `background`: civic room and market edge in first-network recovery state
- `worldState`: Chapter 2 close; recovered names replace anonymous loss; basic delivery resumes
- `viewpoint`: `protagonist_limited`
- `participants`: town scholar, village elder, Mia, merchant, street_beggar
- `entry`: recovered register is placed beside the village's incomplete evacuation ledger
- `exit`: basic market actions open; northbound checkpoint route becomes the next investigation
- `objective`: reconcile the dead and missing without converting uncertainty into heroic propaganda
- `inputs`: Lich defeated; records recovered; Chapter 2 supply route cleared
- `outputs`: honest evacuation ledger; elder/Ilai friendship beat; Mia/elder relationship beat; Ailo flower breadcrumb; market baseline and authorized medicine stock; Chapter 3 seed
- `assetNotes`: civic and sparse-market recovery states; Ailo reuses his existing portrait and the flower remains a deferred prop; no apothecary location or assistant portrait

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 伊萊把赫恩的名冊拆開，不是為了銷毀，而是把每個名字重新放回家屬、出發日與最後可證實的位置。 |
| 2 | any | enter | - | - | Town scholar、elder 與 Mia 圍在長桌旁；Mia's father tag remains separate from confirmed dead. |
| 3 | first_run | speaker | `town_scholar` | `pleased` | 至少這一次，紙把人帶回來了。不是身體……但名字不必再替一條死路工作。 |
| 4 | second_run | speaker | `town_scholar` | `guarded` | 名字回來了。現在把修訂日期也寫上。今天正確的路，不該再假裝永遠正確。 |
| 5 | any | speaker | `herbalist` | `neutral` | 我父親那一格呢？ |
| 6 | any | speaker | `town_scholar` | `soft` | 仍是失蹤。沒有遺骨，沒有最後位置。我不替你結束他。 |
| 7 | any | narration | - | - | 米婭看向村長。老人沒有要求原諒，也沒有把遠征說成值得歌頌的犧牲。 |
| 8 | any | speaker | `village_elder` | `grieving` | 留著。那一格是我們欠他的，不是你欠這本名冊的。 |
| 9 | any | speaker | `herbalist` | `guarded` | 我知道他自己選擇出發。知道，和不痛，是兩回事。 |
| 10 | any | speaker | `village_elder` | `neutral` | 是。 |
| 11 | any | narration | - | - | 伊萊把標記筆放回老人手邊。兩人都認得對方沉默時會把手停在哪一頁。 |
| 12 | any | speaker | `town_scholar` | `soft` | 二十年前你站在門外，我在裡面把名冊改到天亮。你沒進來，我也沒出去。到今天還是一樣。 |
| 13 | any | speaker | `village_elder` | `pleased` | 你現在說話比那扇門更難開。 |
| 14 | any | speaker | `town_scholar` | `guarded` | 那就別再讓我只從一張空椅子知道你走了。 |
| 15 | any | narration | - | - | 老人沒有答應，也沒有把話推開。沒有更完整的回答，場景轉到市集，第一批乾布、甜膠與普通瓶罐被放回攤位。 |
| 16 | any | enter | - | - | Merchant 進入 market action stage；Mia is not presented as a vendor. |
| 17 | any | speaker | `merchant` | `neutral` | 路通一段，先賣一段能送到的東西。米婭核過的基礎藥也在這裡，價錢和庫存問我，不必去敲她的工作間。 |
| 18 | any | narration | - | - | 第一批藥沒有堆成漂亮陳列，而是依傷勢與可用天數包成有限的小份。米婭只核對封瓶與批次，隨即把櫃台交還商人。 |
| 19 | any | narration | - | - | 一只空貨箱被翻成凳子。等候的人抱著包好的藥坐下，這次不必再空手回去。 |
| 20 | any | enter | - | - | Ailo 從包貨用的乾草裡撿起一朵外白、花心淡綠的小花，將它與能染色的碎葉分開。 |
| 21 | any | speaker | `street_beggar` | `soft` | 這朵不能染。她說沒用，所以要留下。不是這裡……上面才多。 |
| 22 | any | exit | - | - | Ailo leaves with the flower before anyone can ask who `她` is. Open market baseline, route-supply layer, Mia-authorized medicine, and the northbound marker. |

### `ch2_s08_shadow_at_the_checkpoint`

- `stageClass`: `regional_canvas`
- `background`: northbound road marker and abandoned checkpoint at the edge of the Chapter 3 region
- `worldState`: Chapter 2 epilogue; dusk; recovered sign guarded by shadow figures using human spacing
- `viewpoint`: `protagonist_limited`
- `participants`: standard_bearer_frey, lamplighter_tavi
- `entry`: protagonist joins a short route-marking check after market recovery
- `exit`: party withdraws rather than pursuing the formation into Chapter 3 early
- `objective`: observe and record the shadow formation; do not mistake the teaser for a random invasion
- `inputs`: Chapter 2 ledger closed; north route readable
- `outputs`: shadow-command evidence; Frey route-marking duty; Tavi Chapter 3 lamp assignment; Chapter 3 opened
- `assetNotes`: checkpoint background needed later; reuse Frey/Tavi portraits and normal shadow-soldier assets

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 北向路標被人從泥裡扶正，箭面卻留下五道等距的黑手印。前方影子沒有散開獵食，而是兩列站在關卡兩側。 |
| 2 | any | enter | - | - | Frey enters with the patrol flag lowered; Tavi follows carrying an unlit lamp to inspect reflected edges. |
| 3 | any | speaker | `standard_bearer_frey` | `guarded` | 別越線。牠們不是堵路，是在等我們進到檢查的位置。 |
| 4 | any | narration | - | - | 最前方的影子抬手。後排同時轉身，間距與南門換哨時幾乎一致。 |
| 5 | any | speaker | `lamplighter_tavi` | `afraid` | 那個動作……像巡線。不是像怪物，是像有人教過牠們。 |
| 6 | second_run | narration | - | - | 你已知道影子會保留人的命令，但眼前仍沒有足夠證據指出命令來自哪一支隊伍。 |
| 7 | any | narration | - | - | 一道影刃落在路標前，沒有追擊。它只把「未經檢查不得通行」的界線重新刻深。 |
| 8 | any | speaker | `standard_bearer_frey` | `resolute` | 今天不追。我回去補路標，塔維，明晚這一線需要燈。 |
| 9 | any | speaker | `lamplighter_tavi` | `guarded` | 我會先量風。燈放錯邊，霧會把影子照成兩倍。 |
| 10 | any | exit | - | - | Withdraw to town; open Chapter 3 dead-checkpoint investigation and lamp-oil side route. |

## Chapter 3 Detailed Screenplay V1

Status: `complete_pending_user_review`. `洛恩 / Lorne` is the accepted display
name; all scene logic remains bound to runtime id `casino_dealer` until migration.

### `ch3_s01_dead_checkpoint`

- `stageClass`: `location_scene`
- `background`: reauthored abandoned checkpoint at the old `obsidian_keep_gate`
- `worldState`: Chapter 3 opening; shadow patrol active; barrier markings use old human spacing
- `viewpoint`: `protagonist_limited`
- `participants`: none; shadow soldiers use monster presentation
- `entry`: player approaches the north checkpoint opened at Chapter 2 close
- `exit`: after a limited patrol encounter, recovered fittings return to town for comparison
- `objective`: pass the checkpoint and determine whether the shadows are invaders or a repeating guard line
- `inputs`: Chapter 3 open; checkpoint formation recorded
- `outputs`: expedition-issue fitting fragments; command spacing; old checkpoint location discovered
- `assetNotes`: reauthor the checkpoint background; reuse normal shadow-soldier assets

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 關卡沒有旗，地上卻留著旗座。兩列影兵站在磨平的腳印上，連空缺的位置都刻意保留。 |
| 2 | any | narration | - | - | 第一名影兵抬手，第二列同時轉向你的武器。動作不是撲擊，而是檢查、等待、拒絕通行。 |
| 3 | second_run | narration | - | - | 你記得這些動作屬於人類隊伍，但記憶沒有告訴你是哪一隊。證據仍得在這一輪取得。 |
| 4 | any | narration | - | - | 你把武器放低一步。影兵沒有放行，只把拒絕線往前推了一格，像命令裡從來沒有「交涉」。 |
| 5 | any | exit | - | - | 收起事件層，進入固定 shadow patrol encounter。 |
| 6 | any | enter | - | - | 遭遇結束；一塊黑化肩扣與半截刀柄留在舊檢查桌旁。 |
| 7 | any | narration | - | - | 肩扣背面有被人手反覆磨亮的凹處，刀柄纏法也為戴手套的五指預留了固定間隔。這些不是為影子打造的裝備。 |
| 8 | any | exit | - | - | Mark checkpoint discovered; return evidence to scholar and blacksmith. |

### `ch3_s02_shadows_count_names`

- `stageClass`: `town_scene`
- `background`: blacksmith and scholar shared work table, followed by Mia's workroom
- `worldState`: Chapter 3; first shadow evidence in town; protagonist conceals a fresh side wound
- `viewpoint`: `protagonist_limited`
- `participants`: town scholar, blacksmith, village elder, Mia
- `entry`: fittings and blade fragment are placed beside expedition issue records
- `exit`: shadow equipment preparation opens; Mia relationship conflict closes the scene
- `objective`: identify the human source of the formation and receive treatment before returning outside
- `inputs`: dead-checkpoint evidence
- `outputs`: shadow equipment clue; old expedition resemblance; Mia/protagonist Chapter 3 conflict; command-post route
- `assetNotes`: town work-table and workroom backgrounds; no new NPC or shadow/void tier

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 鐵匠把肩扣上的黑層刮到露出底金。伊萊從櫃底抽出二十年前的配發尺寸，兩道孔位完全重合。 |
| 2 | any | enter | - | - | Blacksmith、town scholar 與 elder 進入工作桌場景。 |
| 3 | any | speaker | `blacksmith` | `guarded` | 這東西先被人穿舊，後來才變成影子。虎口這裡磨得最深，活著的時候用的是右手刀。 |
| 4 | any | speaker | `town_scholar` | `guarded` | 配發批次屬於遠征左線。名冊缺了指揮頁，只留下補充數量和一個未結案的訊號。 |
| 5 | any | speaker | `village_elder` | `angry` | 先別把「遠征」寫上公告。像，不等於就是。村裡已經怕了二十年，不必再拿猜測餵它。 |
| 6 | any | speaker | `town_scholar` | `resolute` | 我不寫結論。我寫孔位、磨痕和批次。讓證據先比我們活得久一點。 |
| 7 | any | narration | - | - | 鐵匠接過你卸下的護具，手指碰到內側仍濕的血。他沒有問，只朝米婭的巷子抬了抬下巴。 |
| 8 | any | speaker | `blacksmith` | `neutral` | 護具會漏，是因為裡面那個人先漏了。去。這次別讓她從血跡猜。 |
| 9 | any | narration | - | - | 場景轉入米婭工作間。你把傷說成擦到，米婭掀開衣料，看見影刃留下的深口。 |
| 10 | any | enter | - | - | Mia 進入近景；先處理出血，再抬眼。 |
| 11 | any | speaker | `herbalist` | `angry` | 這不是擦到。你什麼時候打算告訴我？等它替你開口嗎？ |
| 12 | any | narration | - | - | 你提起鎮外仍需要有人查路，也表示傷沒有妨礙行動。她收緊最後一道繃帶。 |
| 13 | any | speaker | `herbalist` | `hurt` | 我知道你得出去。我沒有叫你別走。我要你別把「回不來」當成一種效率。 |
| 14 | any | narration | - | - | 你反問她，上一次把自己算進「需要被照顧的人」是什麼時候。她手上的繃帶停了一瞬。 |
| 15 | any | speaker | `herbalist` | `guarded` | 這不是同一件事。現在受傷的是你。 |
| 16 | any | narration | - | - | 你指出正因為不是同一件事，她才總把自己排到最後。這次輪到米婭沒有能讓答案變輕。 |
| 17 | any | speaker | `herbalist` | `hurt` | 別在我生氣的時候說對的話。很不公平。 |
| 18 | any | narration | - | - | 她沒有要求承諾，只把下一卷乾淨繃帶塞進你手裡。 |
| 19 | any | speaker | `herbalist` | `guarded` | 下次在你決定「沒事」以前，先讓我看。這不是命令，是我不想總當最後一個知道的人。 |
| 20 | any | exit | - | - | Treatment ends; open shadow command-post route and explicit Mia relationship flag. |

### `ch3_s03_lamp_oil_in_fog`

- `stageClass`: `regional_canvas`
- `background`: Chapter 3 night watch route with front and rear markers visible across fog
- `worldState`: Chapter 3 night; ordinary lamp oil; crosswind exposes rear-marker weakness
- `viewpoint`: `protagonist_limited`
- `participants`: lamplighter_tavi, standard_bearer_frey
- `entry`: player joins Tavi's first full night-route check
- `exit`: first run records incomplete preparation; second run opens wind-guard repair and rehearsal
- `objective`: verify marker visibility and learn why Tavi avoids the far rear position
- `inputs`: shadow checkpoint route; `旗沒有回來` only in second run
- `outputs`: childhood-mist meaning; Tavi fear seed; first-run rear marker unmeasured/unprepared or second-run `rear_marker_ready` and role-admission chain
- `assetNotes`: night-route background required; ordinary lamp and flag only

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 前標燈能從南門看見，後標燈卻隔著一段受風的低地。霧每次掠過，火光就像被推離原位。 |
| 2 | any | enter | - | - | Tavi kneels beside the nearer lamp; Frey checks the farther marker with the patrol flag rolled under one arm. |
| 3 | any | speaker | `lamplighter_tavi` | `neutral` | 油夠，芯也夠。問題是後面那盞沒有擋風。風從石縫上來，正好打在火根。 |
| 4 | any | speaker | `standard_bearer_frey` | `pleased` | 所以我們替它加一片鐵。你說得像它欠你道歉一樣。 |
| 5 | any | narration | - | - | 芙蕾要塔維一起走到遠標。他抬頭看了一眼低地，手仍按在燈蓋上。 |
| 6 | any | speaker | `standard_bearer_frey` | `soft` | 我們小時候就是在這片霧裡走丟的。巡隊先把旗舉過霧面，我才知道家還在。 |
| 7 | any | speaker | `lamplighter_tavi` | `guarded` | 妳先看到。我只記得抓著妳，連腳要怎麼走都忘了。 |
| 8 | any | speaker | `standard_bearer_frey` | `pleased` | 現在至少記得修燈。走吧，遠標不會自己量。 |
| 9 | first_run | speaker | `lamplighter_tavi` | `afraid` | 我在這邊看火。妳過去喊一聲，我就知道位置。這樣……比較不會兩盞一起滅。 |
| 10 | first_run | speaker | `standard_bearer_frey` | `soft` | 好。我去。你別把燈盯到害它緊張。 |
| 11 | first_run | narration | - | - | 芙蕾帶回風向，卻沒有燈框高度、進氣縫與扣件尺寸。鐵匠不能憑「加一片鐵」打造風擋；做窄會熄火，做鬆會被風掀走。第一輪只留下「需要修」的紀錄，沒有能安裝的部件。 |
| 12 | second_run | narration | - | - | `旗沒有回來` 讓你知道這份分工日後會留下致命空隙。你指出後標必須由塔維親自測風，不能只靠芙蕾替他喊位置。 |
| 13 | second_run | speaker | `lamplighter_tavi` | `afraid` | 我知道該去。每次都知道。只是路一變窄，腿就會先替我決定。 |
| 14 | second_run | speaker | `standard_bearer_frey` | `guarded` | 那就先走一次。不是危險來了才第一次站過去。 |
| 15 | second_run | narration | - | - | 塔維沒有變勇敢。他帶著抖動的燈走完低地，量下風口高度、燈框進氣與扣件尺寸，將完整規格交給鐵匠。 |
| 16 | second_run | speaker | `lamplighter_tavi` | `soft` | 我不是因為想守路才拿這盞燈。我只是想站在妳的旗還看得見我的地方。 |
| 17 | second_run | speaker | `standard_bearer_frey` | `soft` | 那就別只站在我旁邊。去站我不能站的位置，讓我也看得見你。 |
| 18 | any | exit | - | - | Return to town; first run closes with an unmeasured marker and no buildable guard, while second run opens wind-guard crafting with Tavi's role admission recorded. |

### `ch3_s04_showcase_glass`

- `stageClass`: `town_scene`
- `background`: existing casino hall and prize-wall backgrounds
- `worldState`: Chapter 3 casino opening; rates visible; showcase inaccessible but fully inspectable
- `viewpoint`: `protagonist_limited`
- `participants`: casino_dealer, casino_owner
- `entry`: casino floor opens through visible prize curiosity rather than an urgent quest order
- `exit`: ticket pools and inspection remain available; owner-attention route begins after two cases are viewed
- `objective`: inspect the display cases and understand the difference between ordinary ticket play and personalized collateral
- `inputs`: Chapter 3 town state; casino floor access
- `outputs`: showcase inspections; ticket pools and published rates; Vesper attention; dealer-hand/die observation in second run
- `assetNotes`: reuse casino hall, game-table, prize-wall, owner and dealer portraits; future expression layers deferred

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 賭場先讓你看見獎品，再讓你看見賭桌。不死鳥羽、七星護符與封蠟武器匣各有獨立展櫃，玻璃乾淨得像從沒有人真正碰過。 |
| 2 | any | enter | - | - | Casino dealer enters at the table; his thumb checks the edge of the guest dice before he smiles. |
| 3 | any | speaker | `casino_dealer` | `pleased` | 展櫃不用籌碼，看多久都行。想帶走才需要運氣。或者，比運氣更昂貴的東西。 |
| 4 | any | narration | - | - | 每個公開獎池旁都列著機率。普通桌只收籌碼與票券，最深處的私人桌沒有任何價目。 |
| 5 | any | speaker | `casino_dealer` | `neutral` | 公開桌照表走。輸贏難看，但至少寫得出來。沒有標價的桌，先問清楚你拿什麼結帳。 |
| 6 | second_run | narration | - | - | `莊家離席` 讓你注意他的手。荷官每次發客方骰前都會先用拇指掂一次重量，隨後若無其事地換回桌面。現在還不是證據。 |
| 7 | any | enter | - | - | Vesper enters from the display-hall side after the second case is inspected. The dealer's smile becomes fixed. |
| 8 | any | speaker | `casino_owner` | `soft` | 喜歡哪一件？不必急著回答。人對自己真正想要的東西，通常會多看第二次。 |
| 9 | any | narration | - | - | 你問展示櫃最終如何取得。維斯珀沒有看獎品，只看你。 |
| 10 | any | speaker | `casino_owner` | `pleased` | 我從不逼人下注。我只是把他們真正想要的東西放到桌上。 |
| 11 | any | speaker | `casino_dealer` | `guarded` | 先從票券桌開始。至少那裡輸光時，失去的東西還能數。 |
| 12 | any | exit | - | - | Open casino games, rate tables, ticket pools, showcase inspection, and Vesper owner-attention flag. |

### `ch3_s05_blank_creditor_trace`

- `stageClass`: `town_scene`
- `background`: hidden black-market contact point reached from the market's closed service passage
- `worldState`: Chapter 3; one old casino acquisition receipt traces to a seller mark, not an active contract supply
- `viewpoint`: `protagonist_limited`
- `participants`: black_market as an unnamed functional trader
- `entry`: protagonist follows the seller mark from a showcase acquisition record
- `exit`: contact closes after one answer; black market remains controlled and separate from ordinary market trade
- `objective`: identify who sold the contract paper and whether more blank contracts exist
- `inputs`: two showcase inspections; acquisition record clue
- `outputs`: Blank Collateral origin clue; unnamed nonhuman creditor line; confirmation that Vesper owns the only known contract
- `assetNotes`: reuse black-market portrait/background if retained; no new recurring profile or Void presentation

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 展櫃的舊進貨頁有一筆不像獎品的支出：沒有品名，只有「空白抵押」與一個已被刮掉的人名。賣方記號指向市集後方的封閉通道。 |
| 2 | any | enter | - | - | Black-market trader appears behind a narrow counter; no personal name is shown. |
| 3 | any | speaker | `black_market` | `guarded` | 那張紙我賣過一次。買主是維斯珀。你要第二張，沒有。你要我替他負責，也沒有。 |
| 4 | any | narration | - | - | 你指出契約沒有債權人姓名。對方把燈移近，紙背拓印顯出一條不屬於任何人類商會的空欄。 |
| 5 | any | speaker | `black_market` | `neutral` | 我警告過他，債權那一格不是空著等人填。是有東西不肯把名字寫給我們看。 |
| 6 | any | narration | - | - | 你問維斯珀如何使用它。商人把拓印推回，不替賭場編造神祕儀式。 |
| 7 | any | speaker | `black_market` | `guarded` | 我賣危險的東西。他把危險做成生意。後面的帳，問他。 |
| 8 | second_run | narration | - | - | 你知道契約將成為維斯珀的逃路，因此更早記下賣方警告與客方位置規則；這仍不能在當下直接定罪或反噬他。 |
| 9 | any | exit | - | - | Close contact; add Blank Collateral clue to handbook and retain one controlled black-market route. |

### `ch3_s06_drowned_voice`

- `stageClass`: `location_scene`
- `background`: `drowned_bell_coast` leading to `sunken_altar_reef`
- `worldState`: Chapter 3 optional branch; waterlogged ritual shell continues carrying warning tones after bodily death
- `viewpoint`: `protagonist_limited`
- `participants`: Drowned Oracle through full Boss presentation
- `entry`: first run follows an optional coastal resonance; second run marks it mandatory through `未竟的弒王`
- `exit`: Ancient Rune is recovered after the lingering voice is bound
- `objective`: silence the Drowned Oracle and determine how a voice persists without its original body
- `inputs`: Chapter 3 regional side route; true-kill achievement when applicable
- `outputs`: Ancient Rune ordinary discovery in first run; `ancient_rune_bound` current-run execution anchor in second run
- `assetNotes`: reuse Drowned Oracle Boss art; coastal bells belong only to this route, not the village

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 海水退去後，礁面仍傳出一段沉鐘聲。鐘體早已陷在水下，聲音卻從更靠岸的祭殼裡回答。 |
| 2 | first_run | narration | - | - | 手札把它列為異常殘響：危險、可追查，但尚未與最終敵人的存續方式相連。 |
| 3 | second_run | narration | - | - | `未竟的弒王` 讓你聽懂第一輪忽略的事：肉身沉沒不代表聲音已停止移動。這條路成為必要的真殺準備。 |
| 4 | any | enter | - | - | Drowned Oracle rises in the ritual shell, using the approved full Boss image. |
| 5 | any | speaker | `drowned_oracle` | `grieving` | 鐘已沉。人已走。警告仍未送達。 |
| 6 | any | narration | - | - | 它抬起手，水珠在指間倒流。下一句同時像預言、回憶與二十年前沒能傳出的警報。 |
| 7 | any | speaker | `drowned_oracle` | `afraid` | 身體倒下……聲音往更深處去。不要讓它回山裡。不要讓它—— |
| 8 | any | exit | - | - | 收起事件層，進入 Drowned Oracle 戰鬥。 |
| 9 | any | enter | - | - | 戰鬥結束；祭殼破裂，殘響聚進一枚刻有閉合回路的古代符文。 |
| 10 | first_run | narration | - | - | 符文能約束殘響，是罕見而實用的古物。它與魔王假死之間的關係仍不可見。 |
| 11 | second_run | narration | - | - | 你在當前周目封存古代符文。它日後必須釘住魔王離開肉身的聲音與魂響。 |
| 12 | any | exit | - | - | Return to Chapter 3 route with the Ancient Rune state resolved. |

### `ch3_s07_old_command_post`

- `stageClass`: `location_scene`
- `background`: reauthored black-iron storehouse and old line-command yard threshold
- `worldState`: Chapter 3; local expedition command records preserved in shadow residue
- `viewpoint`: `protagonist_limited`
- `participants`: village elder
- `entry`: after the route is cleared, the elder joins at the secured storehouse to identify the recovered formation
- `exit`: elder withdraws before the Boss yard; protagonist carries the evidence forward
- `objective`: identify the local commander without confusing him with the expedition supreme commander
- `inputs`: shadow fitting match; command-post route open
- `outputs`: Kaedren identified as local line commander; last signal missing; supreme commander reserved for later optional content
- `assetNotes`: storehouse/yard background required; no supreme-commander art or encounter

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 黑鐵庫門內的物資沒有被搶走。每一箱都按左線編次堆好，只是領用人早已成了影子。 |
| 2 | any | enter | - | - | Elder enters only after the approach is secured; he stops at a carved line-command mark. |
| 3 | any | speaker | `village_elder` | `grieving` | 凱德倫。左線指揮。他總說隊伍一亂，死得比怪物動手還快。 |
| 4 | any | narration | - | - | 你問他是否是二十年前遠征的總隊長。老人立刻搖頭。 |
| 5 | any | speaker | `village_elder` | `resolute` | 不是。凱德倫只管一條線。總隊長在更前面，我最後一次看見他時，命令還沒傳回來。別把兩個人寫成一個。 |
| 6 | any | narration | - | - | 訊號簿最後一頁寫著「守住缺口，等待撤回令」。撤回欄空白，傳令標記也從未抵達。 |
| 7 | second_run | narration | - | - | 你知道未完成命令會繼續殺人，卻沒有虛構一張撤退令。這一輪仍必須終止凱德倫本身。 |
| 8 | any | speaker | `village_elder` | `guarded` | 他會把每個靠近的人當成要穿過缺口的東西。我留在這裡。你回來時，把他的刀帶回，不是帶戰利品，是帶磨痕。 |
| 9 | any | exit | - | - | Elder leaves active stage; open the old line-command yard Boss node. |

### `ch3_s08_shadow_commander`

- `stageClass`: `location_scene`
- `background`: old line-command yard with a permanently held breach approach
- `worldState`: Chapter 3 Boss convergence; shadow repeats Kaedren's final local order
- `viewpoint`: `protagonist_limited`
- `participants`: Shadow Commander Kaedren through Boss presentation
- `entry`: protagonist crosses the unchanged hold line
- `exit`: command echo ends and the commander's blade returns to town as evidence
- `objective`: defeat Kaedren and close the local order without inventing a peaceful override
- `inputs`: Kaedren identified; line-command yard open
- `outputs`: Shadow Commander cleared; `commander_blade`; shadow precursor source; local command route closed
- `assetNotes`: reuse approved Shadow Commander art; its ornate armor and banners are the collective shadow shell of the whole left line, not Kaedren's living rank; blade image must match the Boss-held weapon

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 凱德倫站在缺口中央。黑甲上混著不同配發批次的肩片、鏈條與破旗，那是整條左線被暗影縫成的外殼，不是他生前的軍階。身後沒有仍需保護的隊伍，身前也沒有二十年前的敵人；只有一條命令保持完整。 |
| 2 | any | enter | - | - | Shadow Commander enters with the approved weapon and a less ornate scene than mainline final Bosses. |
| 3 | any | speaker | `shadow_commander` | `resolute` | 左線守住。未得撤令，不准後退。 |
| 4 | any | narration | - | - | 你出示空白的撤回欄。影子沒有閱讀，只再次把刀尖放回同一處。 |
| 5 | any | speaker | `shadow_commander` | `angry` | 不准後退。 |
| 6 | any | exit | - | - | 收起事件層，進入 Shadow Commander 戰鬥。 |
| 7 | any | enter | - | - | 戰鬥結束；影子散去，刀仍保持人手長年磨出的握痕。 |
| 8 | first_run | narration | - | - | 你帶回刀與訊號簿。戰鬥終止了命令，卻沒有回答誰讓整場遠征走到需要這道命令。 |
| 9 | second_run | narration | - | - | 你額外保存刀柄纏法、站位刻線與未抵達的訊號記號，避免證據只剩一把看似強力的掉落武器。 |
| 10 | any | exit | - | - | Close local shadow-command route; return to town night state. |

### `ch3_s09_temptation_and_orders`

- `stageClass`: `town_scene`
- `background`: Chapter 3 town at night, moving between civic table, South Gate lamps, and casino entrance
- `worldState`: honest shadow preparation and seductive casino/black-market shortcuts now coexist
- `viewpoint`: `protagonist_limited`
- `participants`: village elder, town scholar, blacksmith, Mia, lamplighter_tavi, standard_bearer_frey, casino_owner, street_beggar
- `entry`: commander's blade is returned to the civic table
- `exit`: town camera settles on stone-route reports that open Chapter 4
- `objective`: close the local command record and choose how to prepare for the widening regional pressure
- `inputs`: Shadow Commander cleared; casino and black-market routes introduced
- `outputs`: Chapter 3 town state; shadow crafting stage one; Mia relationship repair; Tavi remains unready in first run; Vesper begins personalized observation; Chapter 4 opened
- `assetNotes`: reuse existing civic, workroom, gate, market, and casino backgrounds; no reserve service NPCs

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 凱德倫的刀橫放在公務桌上。鐵匠沒有先磨刃，伊萊也沒有把它列成戰利品；兩人先拓下握痕與配發印。 |
| 2 | any | enter | - | - | Elder、town scholar and blacksmith enter the civic-stage foreground. |
| 3 | any | speaker | `town_scholar` | `guarded` | 凱德倫的命令結束了，但總隊長、撤令和前線發生了什麼仍是空白。這一頁只能寫到這裡。 |
| 4 | any | speaker | `village_elder` | `grieving` | 空白就留白。二十年前已經有太多人用勇氣把不知道的地方填滿。 |
| 5 | any | speaker | `blacksmith` | `neutral` | 暗影碎片能做裝備，強度也夠。但它記得的是一個死人不肯放手的動作。穿上以前，先知道你拿的是什麼。 |
| 6 | any | narration | - | - | 離開公務室後，你先敲了米婭工作間的門，沒有等血跡或鐵匠替你報到。 |
| 7 | any | enter | - | - | Mia 進入門邊近景；你主動卸下護具，說明哪裡擦到、哪裡沒有發麻。 |
| 8 | any | speaker | `herbalist` | `guarded` | 這次是你自己來的，還是鐵匠又用眼神把你趕過來？ |
| 9 | any | narration | - | - | 你把回程時間、影刃接觸與目前感覺依序說完。她檢查舊傷，肩膀才慢慢放下一點。 |
| 10 | any | speaker | `herbalist` | `soft` | 我沒有要你每次都平安。我只是不想每次都最後一個知道。 |
| 11 | any | speaker | `herbalist` | `pleased` | 今天算你有進步。標準很低，但進步還是進步。 |
| 12 | any | narration | - | - | 場景轉到南門。塔維依舊站在較近的燈旁，芙蕾替遠標補上新的路線布條。 |
| 13 | first_run | speaker | `lamplighter_tavi` | `guarded` | 後標的風擋……我還沒做好。先用舊的也能亮，只是風大時得有人看著。 |
| 14 | second_run | speaker | `lamplighter_tavi` | `resolute` | 風擋尺寸交了。明天我再走一次低地，不等真的需要才去。 |
| 15 | any | narration | - | - | 市集逐攤收燈，鐵匠鋪仍在替路標敲扣件。這些光都有限，必須有人補油、添煤、計算存貨。 |
| 16 | any | narration | - | - | 賭場門在同一晚亮起，明亮得像從來沒有缺過任何東西。維斯珀站在玻璃後，看見你先看刀的磨痕，再看展示櫃裡完美無缺的獎品。 |
| 17 | any | enter | - | - | Casino owner enters alone; the dealer remains at the table in the background. |
| 18 | any | speaker | `casino_owner` | `pleased` | 外面的力量總帶著前任主人的傷。我的獎品乾淨得多。你只需要決定，願意為哪一種結果付錢。 |
| 19 | any | narration | - | - | 你沒有下注。維斯珀仍像已經得到一部分答案。 |
| 20 | any | narration | - | - | 空市集棚旁，乞丐把一片黑鐵當成彎曲的路牌，對著石路方向反覆比劃。 |
| 21 | any | speaker | `street_beggar` | `guarded` | 他們叫石頭站住。石頭聽太久，就要起來走了。 |
| 22 | any | exit | - | - | Camera follows new retaining-wall movement report; open Chapter 4 stone-route investigation. |

## Chapter 4 Detailed Screenplay V1

Status: `accepted`. The fixed Gray Ridge crisis owns Frey's death or rescue;
childhood mist, wind-guard causality, Tavi's admission, protagonist isolation,
and the elder/Frey aftermath are approved. Thorn Witch remains a separate
preparation route and Ash Baron stays outside the base chapter.

### `ch4_s01_road_moves_underfoot`

- `stageClass`: `regional_canvas`
- `background`: handcrafted stone-route approach with retaining walls exposing rib-like strata
- `worldState`: Chapter 4 opening; coordinated terrain movement; ash-bearing wind begins
- `viewpoint`: `protagonist_limited`
- `participants`: village elder, standard_bearer_frey, lamplighter_tavi
- `entry`: player joins the first inspection after several roads shift in the same interval
- `exit`: evacuation routes and Ancient Titan investigation open simultaneously
- `objective`: map which structures are moving together and mark people who must be evacuated
- `inputs`: Chapter 4 open; Chapter 3 stone-route warning
- `outputs`: Titan-body hypothesis; Gray Ridge evacuation order; flag/lamp assignments
- `assetNotes`: regional stone/ash canvas and moving-wall state required later

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 第一面擋土牆向外移了半尺。遠處第二面牆在同一瞬間回縮，埋在土裡的弧形石層一節接一節露出。 |
| 2 | second_run | narration | - | - | 你記得這不是零散崩塌，而是一具巨大身體的動作；仍必須用當前周目的測量證明道路如何連在它身上。 |
| 3 | any | enter | - | - | Elder、Frey 與 Tavi 進入區域事件層；Frey marks the front route while Tavi checks lamp positions. |
| 4 | any | speaker | `village_elder` | `guarded` | 不追裂縫。先看哪些屋、橋和路會跟著一起動。地面要起來，跑得快的人也會被自己的路摔死。 |
| 5 | any | narration | - | - | 芙蕾把旗插在仍穩定的高點，塔維則逐一測試低處燈位。灰風從山脊壓下，後方標記最先消失。 |
| 6 | any | speaker | `standard_bearer_frey` | `resolute` | 灰脊還有人。前旗帶隊，後燈確認尾端，兩邊都看見才能走。 |
| 7 | any | speaker | `lamplighter_tavi` | `guarded` | 低地的風比昨晚更硬。普通燈罩撐不住，我需要風擋，也需要先知道哪一段會斷。 |
| 8 | any | speaker | `village_elder` | `resolute` | 那就別等它斷。芙蕾標撤離線，塔維標燈位。其餘人回鎮準備。 |
| 9 | any | narration | - | - | 地底傳來一聲不像岩石的低沉摩擦。弧形石層整體抬高，第一次顯出完整肋骨的輪廓。 |
| 10 | any | exit | - | - | Open Chapter 4 regional routes, Gray Ridge evacuation preparation, and Ancient Titan investigation. |

### `ch4_s02_fourfold_countergear`

- `stageClass`: `town_scene`
- `background`: forge and Mia's workroom in active preparation states
- `worldState`: Chapter 4; ash, heat, shock, frost, and poison symptoms arriving from separate routes
- `viewpoint`: `protagonist_limited`
- `participants`: blacksmith, Mia, lamplighter_tavi in second-run preparation insert
- `entry`: damaged gear and patient records are compared before the evacuation
- `exit`: market prescription authorizations and evacuation equipment are issued by their owning systems
- `objective`: prepare ordinary protection for known hazards without pretending to predict the combined shard
- `inputs`: stone-route investigation; market and forge active
- `outputs`: fourfold countergear; controlled market prescriptions; blacksmith civilian-first priority; second-run wind guard completed
- `assetNotes`: reuse forge/workroom; no new miracle material or light/Void equipment

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 同一張清單被分成兩半：鐵匠記錄焦裂、脆化與扣件熔痕；米婭記錄灼痛、失溫、抽搐與毒斑。 |
| 2 | any | enter | - | - | Blacksmith and Mia enter on opposite sides of the shared preparation table. |
| 3 | any | speaker | `blacksmith` | `neutral` | 火就隔熱，冰就留活動縫，雷別讓金屬一路連到骨頭。毒交給她，我不替血管打鐵。 |
| 4 | any | speaker | `herbalist` | `pleased` | 謝謝。你上次替血管提出的建議是「別流出來」，我還沒找到能授權市集販售的做法。 |
| 5 | any | speaker | `blacksmith` | `pleased` | 很實用。病人都聽得懂。 |
| 6 | any | narration | - | - | 玩笑只停一瞬。米婭把四種症狀排列後，發現出現時間正在逐日靠近。 |
| 7 | any | speaker | `herbalist` | `guarded` | 它們還是四種傷，暫時。處方只能降低已知風險，不能保證下一次不會一起來。 |
| 8 | any | narration | - | - | 她完成可由市集調配的處方授權；交易、庫存與價格仍由市集處理。 |
| 9 | any | narration | - | - | 爐前同時排著新武器、撤離踏板、門鉸、燈框與擔架扣。鐵匠把武器單整疊移到最後。 |
| 10 | any | speaker | `blacksmith` | `resolute` | 今天先修能讓人回來的東西。想要新刃的，等路上的人都回來再排。爐子不是只替會打架的人燒。 |
| 11 | second_run | enter | - | - | Tavi enters carrying the measured dimensions for the rear-marker wind guard. |
| 12 | second_run | speaker | `lamplighter_tavi` | `guarded` | 風口在這裡。不要封死，燈也得進氣。我……會自己拿去試。 |
| 13 | second_run | speaker | `blacksmith` | `neutral` | 知道會進氣，表示你終於沒只顧著怕它滅。半天後來拿。 |
| 14 | any | exit | - | - | Unlock countergear and approved market stock; record blacksmith civilian-first priority; second run records wind guard ready. |

### `ch4_s03_thorn_value_rule`

- `stageClass`: `location_scene`
- `background`: `thorn_glasshouse_ruin`, where host vines and black parasitic growth share one structure
- `worldState`: Chapter 4 optional first-run trial; mandatory second-run execution-material route
- `viewpoint`: `protagonist_limited`
- `participants`: Thorn Witch through elite/Boss presentation
- `entry`: player follows biological contamination signs separate from the Titan route
- `exit`: ordinary or pure Forest Essence resolves according to run understanding
- `objective`: survive the Thorn Witch's trial and determine whether parasite can be separated from host
- `inputs`: Chapter 4 regional access; Glimmer Shard; `未竟的弒王` in second run
- `outputs`: ordinary Forest Essence in first run; `forest_essence_pure` and core-revealing method in second run
- `assetNotes`: reuse Thorn Witch art; no chapel, light NPC, or material-identification service

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 溫室骨架被兩種藤蔓共用。綠色主藤仍在輸送水分，黑色寄生刺卻把每一次生長都導向自己的囊核。 |
| 2 | any | enter | - | - | Thorn Witch emerges from the living structure; her scene dressing remains below mainline Boss spectacle. |
| 3 | any | speaker | `thorn_witch` | `guarded` | 你要精華，還是要這座溫室活著？別說兩個都要。想拿兩個的人，通常連差別都看不見。 |
| 4 | first_run | narration | - | - | 你能擊敗她、完成交換或取走普通森林精華，但尚未理解純淨宿主與寄生核心在最終戰的用途。 |
| 5 | second_run | narration | - | - | `未竟的弒王` 與微光碎片讓寄生刺的邊界短暫顯形。要取得完整精華，必須切斷黑囊而不燒毀主藤。 |
| 6 | second_run | speaker | `thorn_witch` | `pleased` | 這次看見了？好。那就別用「力量太大」替手笨找理由。把不屬於它的東西分出去。 |
| 7 | any | exit | - | - | 收起事件層，進入 Thorn Witch trial/Boss encounter; second-run objective marks parasite nodes separately. |
| 8 | any | enter | - | - | Encounter ends; the host vines either survive the separation or collapse with ordinary extraction according to run state. |
| 9 | first_run | narration | - | - | 取得的森林精華可供正常製作。它混有宿主與寄生反應，沒有保持顯核所需的單一性。 |
| 10 | second_run | narration | - | - | 純淨森林精華保留宿主自身的生命邊界。與微光結合後，它能讓藏在地形裡的寄生核心顯出輪廓。 |
| 11 | any | speaker | `thorn_witch` | `neutral` | 拿走你看得懂的那一份。其餘的代價，留給還活著的根自己結算。 |
| 12 | any | exit | - | - | Return to Chapter 4 canvas; preserve the appropriate current-run essence state. |

### `ch4_s04_gray_ridge_evacuates`

- `stageClass`: `regional_canvas`
- `background`: handcrafted Gray Ridge stone causeway before the central span breaks
- `worldState`: Chapter 4 crisis; ash-heavy crosswind; Titan movement; front and rear civilian groups separated
- `viewpoint`: `protagonist_limited`
- `participants`: village elder, standard_bearer_frey, lamplighter_tavi
- `entry`: evacuation begins before the Titan fully rises
- `exit`: camera splits toward front flag and rear lamp; irreversible marker crisis starts
- `objective`: move both groups across while keeping two independent direction markers visible
- `inputs`: Gray Ridge mapped; countergear issued; second-run wind guard when prepared
- `outputs`: evacuation timer; Frey front assignment; Tavi rear assignment; run-specific marker readiness
- `assetNotes`: Gray Ridge full background required; future Frey death CG is recorded but not generated

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 灰脊橋面每隔數息便向上拱起。前方的人能看見南門旗，後方的人只能在灰風裡等一盞尚未點亮的燈。 |
| 2 | any | enter | - | - | Elder remains at the stable entry; Frey takes the front flag; Tavi carries the rear lamp toward the low marker. |
| 3 | any | speaker | `village_elder` | `resolute` | 前後都要有方向。芙蕾帶前隊，塔維守後標。誰看不見自己的標記，就停，不准往聲音裡擠。 |
| 4 | any | speaker | `standard_bearer_frey` | `resolute` | 前隊看旗，不看裂縫。走到下一塊白石再停。 |
| 5 | any | speaker | `lamplighter_tavi` | `guarded` | 後標到位以後我會連遮三次。看見三次再走，不要猜。 |
| 6 | any | speaker | `village_elder` | `guarded` | 你守中央白石。先清落石，再壓住臨時踏板；標記有人負責，別讓所有人都去做同一件事。 |
| 7 | second_run | narration | - | - | 修好的風擋扣在燈罩外，塔維也已走過這段低地。準備沒有消除恐懼，只讓他的身體多記得一次正確動作。 |
| 8 | any | narration | - | - | 巨響從橋下傳來。中央石肋抬升，兩隊視線同時被灰幕切斷。你壓住的踏板下方裂開，正在通過的人只能踩著它繼續走。 |
| 9 | any | speaker | `village_elder` | `afraid` | 標記別滅！兩邊都別動！ |
| 10 | any | narration | - | - | 前旗、後燈與中央白石被抬到三個互不相通的高度。你若離開踏板，中央的人會先墜下；主角不能替代任何一端的標記。 |
| 11 | any | exit | - | - | Split crisis state; continue immediately to rear marker `body_locks`. |

### `ch4_s05_body_locks`

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
| 2 | any | enter | - | - | Tavi fills the foreground; the lamp and marker remain visible behind his locked stance. |
| 3 | first_run | narration | - | - | 他知道要做什麼。拇指抵著火輪，肩膀朝前，腿卻像被聲音釘在原地。第一道火星掉進灰裡。 |
| 4 | first_run | speaker | `lamplighter_tavi` | `afraid` | 動……快動。拜託。 |
| 5 | first_run | narration | - | - | 第二次地裂把後隊的影子吞進灰幕。燈仍沒有亮，前方也再看不見他們。 |
| 6 | second_run | narration | - | - | 同樣的喊聲讓他的身體再次鎖住。這次手掌先碰到預演時留下的風擋扣痕。 |
| 7 | second_run | speaker | `lamplighter_tavi` | `afraid` | 我怕。我知道。先點燈……怕可以等一下。 |
| 8 | second_run | narration | - | - | 他沒有跨過裂縫，也沒有變成戰士。他只完成自己的位置：護住火根、扣緊風擋、把後標連遮三次。 |
| 9 | second_run | speaker | `lamplighter_tavi` | `resolute` | 看燈！三次！現在往前走！ |
| 10 | any | exit | - | - | First run cuts to a dark rear marker; second run carries the lamp signal into Frey's front-marker scene. |

### `ch4_s06_flag_returns`

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
| 5 | first_run | narration | - | - | 最後一人越過白石時，你放開踏板朝她起步；中央跨度在同一瞬間再次抬升，把兩人隔在裂縫兩側。畫面切入芙蕾抱住旗桿的最後一刻；她沒有力量阻止道路，只拒絕讓方向先消失。 |
| 6 | first_run | cutaway | - | - | Audience-only Frey close-up: the camera crosses the raised span while the protagonist remains visible and unreachable on the far side. Wind strips every sound except her breath and the flag rope. |
| 7 | first_run | speaker | `standard_bearer_frey` | `soft` | 小時候，是那面旗把我們帶回去。這一次，換我把它留到最後。 |
| 8 | first_run | narration | - | - | 她把繩尾再纏過手腕，沒有再看裂縫另一端。灰幕吞掉人影以前，旗仍在最高處。 |
| 9 | first_run | exit | - | - | Deferred story CG: Frey holds the ordinary patrol flag as the span breaks. Return on the fixed flag and her still body after evacuation. |
| 10 | second_run | narration | - | - | 灰幕裡亮起一次、兩次、三次。塔維的後燈沒有靠近，卻穩定待在它該在的位置。 |
| 11 | second_run | speaker | `standard_bearer_frey` | `afraid` | 塔維……我看見了。別過來。守住那裡！ |
| 12 | second_run | speaker | `lamplighter_tavi` | `resolute` | 妳也別回來！前面看旗，後面看我！ |
| 13 | second_run | narration | - | - | 芙蕾第一次必須把一群人的生死交給害怕的人。她握緊旗桿，留在前標，沒有替他回頭。 |
| 14 | second_run | speaker | `standard_bearer_frey` | `resolute` | 最後一列，走！兩邊都有人，不准往回擠！ |
| 15 | second_run | exit | - | - | Evacuation completes with both markers visible; Frey and Tavi survive without leaving their assigned positions. |

### `ch4_s07_titan_rises`

- `stageClass`: `location_scene`
- `background`: Gray Ridge foundation revealed as part of the Ancient Titan's rib cage
- `worldState`: Chapter 4 Boss convergence; evacuation result carries into tone, not Boss identity
- `viewpoint`: `protagonist_limited`
- `participants`: none; Ancient Titan uses full mainline Boss presentation
- `entry`: Titan stands after the last evacuation state resolves
- `exit`: Titan Heart is recovered and the changed route is recorded
- `objective`: defeat the Ancient Titan before its next movement destroys the remaining approach
- `inputs`: Gray Ridge evacuation complete; Frey fate locked
- `outputs`: Ancient Titan cleared; `titan_heart`; proof that constructed roads are part of a living containment body
- `assetNotes`: retain mainline full Boss style; equipment drop must match Titan-held/worn form

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | first_run | narration | - | - | 旗仍在身後，持旗的人已不再動。你沒有時間把死亡整理成一句話；整座灰脊正從她腳下站起來。 |
| 2 | second_run | narration | - | - | 最後一列離開時，前旗與後燈仍同時可見。下一次抬升來臨前，兩人都已撤出石肋。 |
| 3 | any | narration | - | - | 擋土牆、橋墩與路基被同一具身體撐開。人類在它沉睡的肋骨上築了道路，從未知道腳下有東西正在呼吸。 |
| 4 | any | enter | - | - | Ancient Titan enters full-screen Boss presentation; cracked causeway remains visible as environmental cause. |
| 5 | any | exit | - | - | 收起事件層，進入 Ancient Titan 戰鬥。 |
| 6 | any | enter | - | - | 戰鬥結束；Titan collapses away from the evacuation line and exposes the heart core. |
| 7 | any | narration | - | - | 泰坦心核仍按固定間隔震動。每一次震動，都與遠處某條火、冰、雷或毒害路線的報告時間相近。 |
| 8 | any | exit | - | - | Recover Titan Heart; return to town with run-specific survivors and objects. |

### `ch4_s08_returned_objects`

- `stageClass`: `town_scene`
- `background`: forge, South Gate, and Mia's workroom in run-specific aftermath states
- `worldState`: Chapter 4 aftermath; first run mourning or second run exhausted relief
- `viewpoint`: `protagonist_limited`
- `participants`: blacksmith, lamplighter_tavi, standard_bearer_frey in second run, village elder, Mia
- `entry`: flag fitting and lamp are placed on the forge table
- `exit`: Mia/protagonist relationship beat closes before the Titan report moves to 伊萊
- `objective`: return the route objects, account for who came home, and treat the evacuation cost
- `inputs`: Ancient Titan cleared; Frey fate state
- `outputs`: run-specific forge/gate/Tavi states; Frey/elder fear understanding in second run; elder guilt pressure in first run; Mia Chapter 4 emotional admission; town-temperature change
- `assetNotes`: forge and workroom aftermath variants; no death reward item implemented yet

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 鐵匠先接過旗扣，再接過燈。兩件東西都有刮痕，只有第一輪的旗扣沒有主人伸手要回。 |
| 2 | first_run | enter | - | - | Blacksmith and Tavi enter; Tavi stands too straight and keeps the lamp lit indoors. |
| 3 | first_run | speaker | `blacksmith` | `grieving` | 扣子能修。旗桿也能。別問我剩下那個。 |
| 4 | first_run | narration | - | - | 塔維把燈罩擦得一塵不留。他的手不再抖，像恐懼連同某一部分人一起被壓死在橋上。 |
| 5 | first_run | speaker | `lamplighter_tavi` | `neutral` | 後標以後我來。每次都來。這樣就不會再缺人。 |
| 6 | first_run | speaker | `blacksmith` | `angry` | 那不是補班。你別拿自己剩下的東西替她填洞。 |
| 7 | first_run | enter | - | - | Elder enters at South Gate after the forge exchange; no one asks Tavi to carry the flag outside again. |
| 8 | first_run | narration | - | - | 老人親手把南門旗降到半高，將灰脊撤離令折回自己簽名的那一面。 |
| 9 | first_run | speaker | `village_elder` | `grieving` | 她守住了自己的位置。錯的是我們又把一條路做成只能靠一個人補上。 |
| 10 | second_run | enter | - | - | Blacksmith, Frey and Tavi enter together; Frey holds the flag clasp while Tavi protects the lamp glass. |
| 11 | second_run | speaker | `standard_bearer_frey` | `angry` | 你點了燈就該退，不是站在裂口旁等它證明你有膽。 |
| 12 | second_run | speaker | `lamplighter_tavi` | `angry` | 妳回頭就比較合理嗎？我至少待在自己的位置！ |
| 13 | second_run | speaker | `blacksmith` | `pleased` | 很好，都活著，才有力氣互相嫌。東西放下，我只修金屬，不修你們的吵架。 |
| 14 | second_run | enter | - | - | Elder enters at the forge threshold after hearing both assigned markers returned. |
| 15 | second_run | speaker | `standard_bearer_frey` | `guarded` | 我看見他的燈時，第一個念頭不是放心，是叫他回來。 |
| 16 | second_run | speaker | `village_elder` | `soft` | 我每次看你們走出南門，都在想同一句。 |
| 17 | second_run | speaker | `standard_bearer_frey` | `hurt` | 我以前以為那只是膽小。 |
| 18 | second_run | speaker | `village_elder` | `neutral` | 有時是。有時只是還記得誰沒回來。別只學會怕，也別再把整條路交給一個人。 |
| 19 | any | narration | - | - | 場景轉到米婭工作間。傷者離開後，她仍在重排藥瓶，將已經整齊的布又折一次。 |
| 20 | any | enter | - | - | Mia enters with visible exhaustion; protagonist remains through second-person narration. |
| 21 | first_run | speaker | `herbalist` | `grieving` | 芙蕾早上還在門口。她問我灰進眼睛要怎麼洗。我給了她水，像那會保證她晚上回來。 |
| 22 | second_run | speaker | `herbalist` | `hurt` | 他們都回來了，我還是停不下來。差一點，跟失去之間只隔著一盞燈。 |
| 23 | any | narration | - | - | 你叫她坐下。她先想拒絕，最後只把手撐在桌邊，沒有再拿下一只藥瓶。 |
| 24 | any | speaker | `herbalist` | `hurt` | 每次你們走出去，我都會想，這是不是最後一次。不是因為我不信你們，是因為我太清楚「來不及」長什麼樣子。 |
| 25 | any | speaker | `herbalist` | `soft` | 陪我坐一下。只要一下。今天先別拿傷口當理由。 |
| 26 | any | exit | - | - | Lock run-specific town aftermath, Frey/elder understanding, and Mia Chapter 4 relationship state; move Titan Heart to scholar analysis. |

### `ch4_s09_four_elements_one_report`

- `stageClass`: `town_scene`
- `background`: scholar desk with Titan Heart and four regional reports
- `worldState`: Chapter 4 close; first run town quiet after Frey's death, second run patrol pair contributes complete timings; casino remains unnaturally bright in both states
- `viewpoint`: `protagonist_limited`
- `participants`: town scholar, village elder, blacksmith, Mia, street_beggar, casino_owner, casino_dealer; Frey and Tavi enter only in second run
- `entry`: Titan Heart pulse is timed against heat, frost, thunder, and poison reports
- `exit`: Chapter 5 four-front investigation and advanced preparation open
- `objective`: prove whether the four elemental crises share one timing source
- `inputs`: Titan Heart recovered; fourfold patient/equipment records
- `outputs`: one-rhythm hypothesis; Ailo whistle breadcrumb; Vesper personalized temptation; Lorne visible defiance; Chapter 5 opened; character participation reflects run state
- `assetNotes`: reuse scholar/civic, retaining-wall, and casino backgrounds; no new elemental creature, material, patron, or reward authorized here

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 泰坦心核每隔四十七息震動一次。伊萊把四條路的報告移到同一刻度上，火、冰、雷與毒斑都在那一息惡化。 |
| 2 | any | enter | - | - | Town scholar, elder, blacksmith and Mia enter around the civic table. |
| 3 | any | speaker | `town_scholar` | `guarded` | 不是四場災害互相碰巧。它們在回應同一個節拍，只是經過不同的地和東西，才長成不同症狀。 |
| 4 | any | speaker | `blacksmith` | `neutral` | 裝備也是。四種裂法，開始時間一樣。有人在山裡敲一下，整片地方各壞各的。 |
| 5 | any | speaker | `herbalist` | `guarded` | 病人也是同一刻惡化。下次如果四種一起出現在一個人身上，我們現在的處方不夠。 |
| 6 | first_run | narration | - | - | 芙蕾的位置空著。塔維送來的後標時間筆直、完整，字卻像從一個已經不允許自己害怕的人手裡寫出來。 |
| 7 | second_run | enter | - | - | Frey and Tavi enter with separate front/rear timing sheets; both are tired and visibly alive. |
| 8 | second_run | speaker | `standard_bearer_frey` | `neutral` | 前旗先晃，後燈晚兩息。不是風，是地底的動作從前面傳過去。 |
| 9 | second_run | speaker | `lamplighter_tavi` | `guarded` | 我記了三次。每次都一樣。我怕記錯，所以……多記了一次。 |
| 10 | any | speaker | `village_elder` | `guarded` | 二十年前也有不同地方同時出事。我們把它們當成一路上的麻煩，沒有想過它們在替同一個東西呼吸。 |
| 11 | any | narration | - | - | 老人第一次把現在的四條線與遠征路形重疊。所有線都朝山邊同一片壓力區靠攏。 |
| 12 | any | narration | - | - | 公務室外，艾洛蹲在被泰坦推歪的擋土石旁，把耳朵貼向新露出的縫。 |
| 13 | any | enter | - | - | Ailo enters at the retaining wall without joining the evidence table. |
| 14 | any | speaker | `street_beggar` | `guarded` | 石頭開始走了。下面那條路會露一口。哨子不在，山聽不見。她又要說我吹太快。 |
| 15 | any | exit | - | - | Ailo leaves before the wall settles; the protagonist records only the repeated words `下面` and `哨子`. |
| 16 | any | narration | - | - | 你離開公務室時，市集與鐵匠鋪都已減燈，賭場卻亮得像城鎮從未缺過油、煤或人。維斯珀在門內等著，不需要別人通知他灰脊的結果。 |
| 17 | any | enter | - | - | Vesper enters beside the showcase corridor; Lorne remains between him and the private table. |
| 18 | first_run | speaker | `casino_owner` | `soft` | 失去一個人以後，金幣突然顯得很便宜。你若想讓下一次不同，展示櫃還在。 |
| 19 | second_run | speaker | `casino_owner` | `soft` | 把兩個人都帶回來，只會更清楚「差一點」值多少。你若想讓下一次也不同，展示櫃還在。 |
| 20 | any | speaker | `casino_dealer` | `guarded` | 公開桌已經結算。今晚不接私人抵押。 |
| 21 | any | speaker | `casino_owner` | `pleased` | 你開始替我決定，哪一種恐懼不值錢了？ |
| 22 | any | narration | - | - | 洛恩沒有重開桌面。維斯珀也沒有當場責罵，只將洛恩的抵押頁折出一個新的角。 |
| 23 | any | exit | - | - | Record Ailo Chapter 4 breadcrumb, Vesper trauma-targeted offer, and Lorne defiance. Open Chapter 5 four-front canvas, advanced forge contracts, and shared-source investigation. |

## Chapter 5 Detailed Screenplay V1

Status: `accepted`. This chapter fixes the ratchet test before
injury, preserves the same Boss wound in both runs, and separates Mia's fate
from every true-kill material route.

### `ch5_s01_four_fronts_converge`

- `stageClass`: `town_scene`
- `background`: civic room with four route reports, patient records, and damaged equipment arranged around one map
- `worldState`: Chapter 5 opening; fire, ice, thunder, and poison fronts now peak on one rhythm
- `viewpoint`: `protagonist_limited`
- `participants`: town scholar, Mia, blacksmith, village elder
- `entry`: Titan Heart pulse is used as the shared clock for all reports
- `exit`: four-front regional canvas and required preparation open
- `objective`: prove whether four regional hazards are expressions of one mountain pressure line
- `inputs`: Chapter 4 one-rhythm hypothesis; Titan Heart
- `outputs`: Elemental Lord route hypothesis; role division among Mia, 伊萊, blacksmith, and elder
- `assetNotes`: reuse civic background; no new NPC, affinity, or material introduced

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 四張地圖疊在泰坦心核周圍。火線焦痕、冰層裂口、雷擊金屬與毒斑病例各自不同，惡化時間卻落在同一個刻度。 |
| 2 | any | enter | - | - | Town scholar, Mia, blacksmith and elder enter around the evidence table. |
| 3 | any | speaker | `town_scholar` | `guarded` | 每四十七息一次。路程距離不同，傳到各處的延遲也固定。這不是四個源頭，是一個節拍經過四種環境。 |
| 4 | any | speaker | `herbalist` | `guarded` | 症狀會輪替。先灼熱，再失溫，接著抽搐，最後出現毒性麻痺。現在還分散在人身上，不能假設永遠如此。 |
| 5 | any | speaker | `blacksmith` | `neutral` | 裝備也照這順序壞。先軟、再脆、再被雷沿著裂口走一遍，最後連皮帶都發黑。 |
| 6 | any | speaker | `village_elder` | `grieving` | 遠征時也看過。當時我們只顧著一處一處打過去，以為麻煩變多代表快到源頭。 |
| 7 | any | narration | - | - | 老人把四條線延長。它們沒有停在各自的區域，而是在山邊同一處尚未標名的壓力帶交會。 |
| 8 | second_run | narration | - | - | 你知道交會處會產生第一塊四象裂片，卻不能用未發生的死亡當證據。能做的是要求每種殘留都在當前周目留下可比較的處理紀錄。 |
| 9 | any | speaker | `herbalist` | `resolute` | 先準備能準備的。任何人接觸殘留都要記時間、溫度和症狀，不准只寫「撐得住」。 |
| 10 | any | exit | - | - | Open four-front routes, advanced forge preparation, and evidence-return requirements. |

### `ch5_s02_forge_contracts`

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
| 2 | any | enter | - | - | Blacksmith enters at the blueprint table; Mia checks tongs and forceps intended for sample handling. |
| 3 | any | speaker | `blacksmith` | `neutral` | 這章的料做這章的裝備。別拿一塊稀有礦就問我能不能打出畢業用的東西，礦也會覺得丟臉。 |
| 4 | any | speaker | `herbalist` | `pleased` | 它如果會說話，我先問它接觸後有沒有麻。 |
| 5 | any | narration | - | - | 米婭把標準取物鉗交回。鐵匠壓下固定棘輪，金屬發出清楚的一聲喀響。 |
| 6 | any | narration | - | - | 伊萊攤開四份原始頁。那是巡路人員在交會調查前分別帶回的少量殘留，每頁只記一種元素，也都在標準鉗第二格下保持完整。它們不是接下來由你從四條前線取得的新鮮測試批次。現場不可能同時翻四本，他準備把共同結果濃縮成一張處理摘要。 |
| 7 | first_run | speaker | `town_scholar` | `neutral` | 原頁都留著。現場先看這行就好：標準二格固定，可安全處理。短一點，才有人真的會看。 |
| 8 | first_run | narration | - | - | 四份原頁都寫著「分離樣本」；摘要的結論卻沒有把這四個字留在同一行。資料沒有造假，也沒有人見過需要懷疑它的交會物。 |
| 9 | second_run | narration | - | - | `醒來時，水已經涼了` 把同一聲喀響從記憶深處拉回來。你立刻阻止鐵匠再次收緊鉗口，並指向伊萊手邊尚未簽定的摘要。 |
| 10 | second_run | speaker | `blacksmith` | `guarded` | 哪裡不對？這棘輪每一格我都量過。四份紀錄也都說撐得住。 |
| 11 | second_run | narration | - | - | 你無法說明未發生的手術，只問了一件現在就能回答的事：那四頁證明的是四種分開的殘留，還是四種元素交會後的同一件東西。 |
| 12 | second_run | speaker | `town_scholar` | `guarded` | 等等。四頁證明的是分開，不是交會。這張摘要不能簽；我把不知道的地方抄掉了。 |
| 13 | second_run | speaker | `herbalist` | `resolute` | 那就先拆棘輪，再找能分散力道的接觸方式。真有人帶著這類東西回來時，不會有時間臨場爭論；我們現在還有時間試。 |
| 14 | second_run | speaker | `town_scholar` | `neutral` | 我記樣本狀態、壓力與收縮時間。結論和適用範圍寫在同一行，誰也不准替紙猜。 |
| 15 | second_run | narration | - | - | 另一側，生命種子、古代符文與純淨森林精華／微光媒介被裝入三個中性外殼。它們不綁定劍、槍、斧或任何單一武器。 |
| 16 | second_run | speaker | `blacksmith` | `neutral` | 三個外殼，接你當時拿的裝備。最後一下由人打，不由一把劇情指定的劍替你打。 |
| 17 | any | exit | - | - | Open advanced forge actions; first run carries the unscoped field summary, while second run records ratchet memory, challenged scope, and execution housings ready. |

### `ch5_s03_elemental_convergence`

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
| 2 | any | enter | - | - | Elder enters at the final survey marker, comparing the geometry with expedition memory. |
| 3 | any | speaker | `village_elder` | `guarded` | 二十年前我們也走過這個形狀。每一線都像勝利，合起來卻是在替裡面的東西開口。 |
| 4 | first_run | narration | - | - | 現有工具能安全收集分離的單元素殘留。伊萊的摘要把共同結果寫成 `標準二格固定可安全處理`；沒有任何樣本曾在體外同時收縮四次，隊伍卻還沒有一件實物能迫使那句話接受更窄的範圍。 |
| 5 | second_run | narration | - | - | 場景切入出發前的當前周目測試。你從四條前線新帶回的少量殘留被引到同一只耐熱盤中；這不是伊萊先前摘要使用的分離批次。四者接觸後開始依固定節拍收縮。 |
| 6 | second_run | enter | - | - | Mia, town scholar and blacksmith enter the test insert; the fixed ratchet has been removed. |
| 7 | second_run | speaker | `town_scholar` | `guarded` | 第一次收縮在接觸後兩息。第二次更快。固定鉗口會在第三次前把壓力全部留在同一點。這次的頁首寫「交會樣本」，不准省。 |
| 8 | second_run | narration | - | - | 鐵匠以柔韌蛛絲環托住殘留，米婭只控制方向，不夾緊。樣本落入淨化史萊姆凝膠後仍保持完整。 |
| 9 | second_run | speaker | `blacksmith` | `pleased` | 好。它要縮就讓它縮，別給它一個能撞碎自己的硬角。 |
| 10 | second_run | speaker | `herbalist` | `guarded` | 把這套東西和那張寫清楚範圍的紀錄一起留在工作間。不是因為一定會用到，是因為需要時不會有時間重做。 |
| 11 | any | narration | - | - | 最後一道壓力線打開。四種元素在核心處輪流取得形體，像一個尚未學會維持自身的意識。 |
| 12 | any | exit | - | - | Open Elemental Lord Boss location; lock second-run pressure-free setup in Mia's workroom. |

### `ch5_s04_elemental_lord`

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
| 4 | second_run | narration | - | - | 工作間裡，拆掉棘輪的工具、蛛絲環與淨化凝膠都已就位。這不是預知帶來的奇蹟，而是當前周目已完成的測試。 |
| 5 | any | enter | - | - | Mia opens the workroom door, checks the shard angle before anyone crosses the threshold. |
| 6 | any | speaker | `herbalist` | `resolute` | 不要拔。整張架一起進來，右邊先抬。有人去叫鐵匠，工具照我說的位置放。 |
| 7 | any | narration | - | - | 你被抬上工作台。米婭的聲音比視野清楚，她逐一要求你辨認呼吸、手指與疼痛位置。 |
| 8 | any | speaker | `herbalist` | `soft` | 聽著我。你不用幫忙，也不用證明清醒。把下一口氣交給我就好。 |
| 9 | any | narration | - | - | 鎮靜藥壓低了光線，沒有完全帶走聲音。門栓落下，手術開始。 |
| 10 | any | exit | - | - | Transition directly to `mia_operation`; no map, market, or gathering action is available. |

### `ch5_s06_mia_operation`

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
| 2 | any | cutaway | - | - | 主角最後能連續辨認的是米婭報出的脈搏。視野失焦後，鏡頭留在她的手與工具台；玩家繼續看見手術，主角只保留斷續聲音。鐵匠在後方進入技術協助位置。 |
| 3 | first_run | speaker | `herbalist` | `guarded` | 離體以後呢？第二格還在安全範圍？ |
| 4 | first_run | speaker | `blacksmith` | `guarded` | 四種紀錄都在安全範圍，沒有一份出現收縮。處理摘要也是標準鉗、第二格固定。 |
| 5 | first_run | speaker | `herbalist` | `resolute` | 好。沒有替代流程。照已知最低壓力托住，不拉；我先把黏連分開。 |
| 6 | first_run | narration | - | - | 碎片離開肋間時沒有撕開血管。米婭穩住手腕，把完整核心帶到體外。手術本身成功了。 |
| 7 | first_run | speaker | `herbalist` | `soft` | 好了。你回來了。 |
| 8 | first_run | narration | - | - | 體外失去組織支撐的碎片突然收縮。棘輪把鉗口固定在同一格，所有變化都擠回米婭掌前的一點。金屬發出第二聲喀響。 |
| 9 | first_run | narration | - | - | 碎片被壓碎。火、冰、雷與毒光在她掌中同時迸開，距離近得沒有反應或告別的時間。 |
| 10 | first_run | exit | - | - | Mia dies immediately in the point-blank release. Cut sound before impact finishes; fade to protagonist waking later. |
| 11 | second_run | speaker | `blacksmith` | `guarded` | 棘輪已拆。蛛絲環受力均勻，凝膠在下方。沒有硬角。 |
| 12 | second_run | speaker | `herbalist` | `resolute` | 我控制方向，你只托住環。它縮就跟著縮，不准夾。 |
| 13 | second_run | narration | - | - | 碎片沿同一角度離開肋間。蛛絲環隨第一次收縮讓出空間，核心沒有撞上任何固定鉗口。 |
| 14 | second_run | speaker | `herbalist` | `soft` | 好了。你回來了。 |
| 15 | second_run | narration | - | - | 米婭把蛛絲環整體降入淨化史萊姆凝膠。第二、第三、第四次收縮都在柔軟介質裡完成，碎片保持完整。 |
| 16 | second_run | narration | - | - | 她的手直到工具放下後才開始發抖。鐵匠沒有碰她，只把水杯推到她能看見的位置。 |
| 17 | second_run | speaker | `blacksmith` | `soft` | 人和東西都在。先坐。這句妳平常很會說。 |
| 18 | second_run | exit | - | - | Mia survives; cut to warm water and post-operation review. |

### `ch5_s07_after_the_ratchet`

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
| 2 | first_run | narration | - | - | 城鎮人際紀錄新增 `最後一頁`。它不是物品：`《藥師手記》最後一頁只寫著：「醒來後先給他水。別讓他立刻起身。」` |
| 3 | first_run | enter | - | - | Scene shifts to scholar desk; town scholar and blacksmith enter with the broken forceps and 伊萊's field summary sealed on the same cloth. |
| 4 | first_run | speaker | `town_scholar` | `grieving` | 那個「安全」是我寫的。四份原頁說的是四種殘留各自安全，我把它們抄成一句現場能看的話。紙沒有說謊……是我把不知道的地方抄掉了。 |
| 5 | first_run | speaker | `blacksmith` | `grieving` | 就算沒有那張紙，我也會拿這把鉗。棘輪沒滑，鉗口沒壞。別把所有死人都抄到自己名下。 |
| 6 | first_run | speaker | `town_scholar` | `hurt` | 可她看見那張紙，就少了一個再問一次的理由。那個理由是我拿走的。 |
| 7 | first_run | narration | - | - | 伊萊沒有離開書桌，但從這一天起，他的玩笑停了，手也不再先於證據寫下「安全」。這不是全部責任，卻是他無法推回工具上的那一部分。 |
| 8 | first_run | speaker | `blacksmith` | `hurt` | 我能修這把鉗。沒有意義。 |
| 9 | first_run | exit | - | - | Unlock hidden achievement `醒來時，水已經涼了`; Mia research stops, baseline market medicine remains; 伊萊 enters the first-run confidence-collapse state. |
| 10 | second_run | narration | - | - | 醒來時，水仍溫著。米婭坐在床邊，兩手捧著自己的杯子，沒有假裝那只是一次普通手術。 |
| 11 | second_run | enter | - | - | Mia enters foreground; later transition includes town scholar and blacksmith with the intact shard, four source pages, and the revised record. |
| 12 | second_run | speaker | `herbalist` | `pleased` | 先喝水。這次我可以親自確定你沒有立刻起身。 |
| 13 | second_run | narration | - | - | 你問她的手。她看了一眼掌心，沒有用「沒事」敷衍。 |
| 14 | second_run | speaker | `herbalist` | `guarded` | 在發抖。會停。下一次準備裡要寫操作者的位置，不只寫病人。 |
| 15 | second_run | narration | - | - | 場景轉到完整碎片。四份分離樣本原頁壓在左側，新頁把「交會樣本、無固定壓力、柔性承托」寫在同一欄；鐵匠補上接觸結構，米婭補上醫療角度與人員防護。 |
| 16 | second_run | speaker | `town_scholar` | `soft` | 這頁只證明我們今天試過的事。其他仍是未知。這樣就夠了；夠讓普通工作在事情發生前碰到一起。 |
| 17 | second_run | speaker | `blacksmith` | `pleased` | 還有一個很吵的人堅持那聲喀響不對。下次可以早點吵。 |
| 18 | second_run | speaker | `herbalist` | `soft` | 可以。只要下次不是用傷口開場。 |
| 19 | second_run | exit | - | - | Unlock `醒來時，水仍溫著`; Mia survives, 伊萊's scoped-record correction resolves, and later recipe/relationship states remain available. |

### `ch5_s08_expedition_list`

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
| 2 | any | enter | - | - | Elder and town scholar enter; the protagonist remains through narration and questions. |
| 3 | first_run | narration | - | - | 他把預先印好的「安全通路」抬頭裁掉，只留下「最後可證實位置」，又將四份原頁、摘要與碎片收縮時間全部攤開，決定在天亮前重建每一處被省略的範圍。從米婭死後，那個字必須比他的手更慢。 |
| 4 | second_run | narration | - | - | 新的處理頁在入夜前便完成歸檔，把樣本狀態、測試方法、適用範圍與未知項目留在同一欄。伊萊把它釘在舊摘要上，不讓修正抹掉曾經的錯。 |
| 5 | any | speaker | `town_scholar` | `neutral` | 前段確實有勝利。路上的怪物被清掉，失聯點逐一往山裡推。這也是他們相信自己能處理下一道阻礙的原因。 |
| 6 | any | speaker | `village_elder` | `grieving` | 我們到最外圍時，只看見龍、火和一條不讓人過的線。故鄉在後面壞掉，我們以為前面每個阻擋都在害它。 |
| 7 | any | narration | - | - | 人類用工具與武力破壞外圍。封痕碎片從那次損傷落下，內側壓力與龍火同時爆發，遠征在兩者之間被摧毀。 |
| 8 | any | speaker | `village_elder` | `guarded` | 龍沒有救我們，也不在乎為什麼來。牠們只看見一群拿武器的人把封住的地方再打開。 |
| 9 | any | speaker | `town_scholar` | `guarded` | 這能證明人類造成過傷口，不能證明龍會相信下一個人類。還缺一條不去破壞寬路的辦法。 |
| 10 | any | narration | - | - | Mia 父親的補給編次停在外圍以前。他的最後位置仍不明，名冊沒有把個人失蹤硬塞進封痕答案。 |
| 11 | first_run | narration | - | - | 老人把封痕碎片的收存欄默默合上。米婭與芙蕾的死讓他確信，下一個走到外圍的人不能再替他的錯誤付代價。 |
| 12 | first_run | speaker | `village_elder` | `soft` | 夠了。今天先到這裡。你們都該睡。 |
| 13 | second_run | narration | - | - | `封痕前的老人` 讓你注意到他的靴底已補、乾糧少了一份，封痕碎片收存欄也被提前清空。這些都是當前周目的準備。 |
| 14 | second_run | speaker | `town_scholar` | `guarded` | 你又想一個人去。二十年前是大家太相信人多，現在別用人少重演一次。 |
| 15 | any | exit | - | - | Seal-scar truth locks; open whistle cache and before-dawn town gate sequence. |

### `ch5_s09_whistle_cache`

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
| 3 | first_run | narration | - | - | 沒有人能完整讀懂音紋。它被登記為山地路具，放進你的背包等待實際用途。 |
| 4 | second_run | narration | - | - | 你依艾洛長期重複的聲音碎片帶他來到路站。乞丐看見哨子時，先用手遮住其中一孔。 |
| 5 | second_run | enter | - | - | Street beggar enters; he does not become a lucid lore guide. |
| 6 | second_run | speaker | `street_beggar` | `afraid` | 不能一起吹。山會把兩條路疊起來。她討厭我吹錯，說花都被我嚇跑。 |
| 7 | second_run | narration | - | - | 你問「她」是誰。他立刻把哨子推回，答案又碎成摸得到卻排不好的片段。 |
| 8 | second_run | speaker | `street_beggar` | `guarded` | 先上去，再回來。她在上面等，不在這塊爛石頭裡。 |
| 9 | second_run | narration | - | - | 反應足以證明山邊居民曾有不同於封印寬路的本地路線，仍不足以讓艾洛此刻同行或解釋全部過去。 |
| 10 | any | exit | - | - | Add Echo Whistle to current-run inventory; return to town before the dragon departure. |

### `ch5_s10_before_dawn`

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
| 1 | first_run | narration | - | - | 伊萊整夜在副桌重抄四份原頁與那張摘要。等他從「安全」兩字抬頭，村長的椅子已冷；封痕碎片、補過的靴與一份乾糧同時不見，南門記錄沒有他的名字。 |
| 2 | first_run | enter | - | - | Town scholar crosses from the record-covered side table into the empty civic room and reads the omissions rather than a farewell note. |
| 3 | first_run | speaker | `town_scholar` | `afraid` | 他不是去查路。他是去把自己放回二十年前那個缺口。 |
| 4 | first_run | narration | - | - | 追蹤路線指向龍守外圍。老人沒有留下命令，因為他不想任何人跟去，也不認為自己值得被阻止。 |
| 5 | first_run | exit | - | - | Lock elder departed; open Chapter 6 pursuit and seal-scar aftermath. |
| 6 | second_run | narration | - | - | 同一輪裡，處理紀錄在入夜前完成。伊萊有時間發現封痕收存欄提早清空，並把靴底、乾糧與缺頁交給你。清晨，你在南門開啟前等著；老人沒有料到兩個人已讀懂他的準備。 |
| 7 | second_run | enter | - | - | Elder enters at the closed gate; town scholar arrives after the confrontation begins. |
| 8 | second_run | speaker | `village_elder` | `angry` | 讓開。這不是你該替我付的東西。 |
| 9 | second_run | narration | - | - | 你提出三項當前證據：遠征破壞過封痕、龍守的是寬路、艾洛認得回聲哨所代表的另一條人路。你也表明到警戒線前會先停下。 |
| 10 | second_run | speaker | `village_elder` | `guarded` | 知道另一條路，不代表龍會信你。牠們二十年前不在乎我們為什麼來，現在也一樣。 |
| 11 | second_run | speaker | `town_scholar` | `resolute` | 所以更不能只送一個帶著舊傷的人去。碎片能承認人類做錯，哨子能證明你們不必再打同一條線。剩下的是他到那裡怎麼做。 |
| 12 | second_run | narration | - | - | 老人沉默很久，最後把封痕碎片放進你的手裡，而不是當成死後遺物留下。 |
| 13 | second_run | speaker | `village_elder` | `grieving` | 到線前停。牠叫你放下武器，就放。牠不會因為我活著而喜歡人類，你也別要求。 |
| 14 | second_run | speaker | `village_elder` | `soft` | 把這個帶去。不是通行證，是我們欠下的證據。 |
| 15 | second_run | exit | - | - | Elder returns to town; add current-run seal-scar shard and open the evidence-bound non-attack chain. |

### `ch5_s11_town_loses_its_voice`

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
| 6 | any | narration | - | - | 賭場深處，維斯珀在兩周目都翻開洛恩的抵押頁。角色不記得上一輪，懷疑仍由本輪相同的細小違抗累積。 |
| 7 | any | enter | - | - | Casino owner and dealer enter at the main table; Vesper places the guest dice beside Lorne's contract. |
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

- `stageClass`: `regional_canvas`
- `background`: handcrafted `northern_drake_watch` and `dragon_heat_crag` approach
- `worldState`: Chapter 6 dawn pursuit; dragon heat marks form a containment boundary rather than an invasion path
- `viewpoint`: `split_limited` (`protagonist_limited` -> `character_limited:village_elder` -> `protagonist_limited`)
- `knowledgeBoundary`: Audience learns why the elder acts and sees only what he perceives; the protagonist follows tracks and later finds aftermath, while the dragon's containment role remains unresolved.
- `participants`: village_elder only in the first-run audience cutaway
- `entry`: player leaves South Gate immediately after discovering or preventing the elder's solitary departure
- `exit`: seal warning line becomes visible
- `objective`: follow the elder while distinguishing deliberate dragon containment from outward conquest
- `inputs`: elder departed or elder alive; current-run Echo Whistle; current-run seal-scar shard only in second run
- `outputs`: audience-only elder motive; protagonist-observed inward-fire evidence; unresolved or demonstrated outside echo; warning-line objective
- `assetNotes`: regional dragon approach backgrounds; reuse the seal-scar approach for the elder cutaway; no new dragon spokesperson

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | first_run | narration | - | - | 村長補過的右靴在濕土留下較淺的半月紋。腳印沒有繞往賭場或市集，從南門一路直上龍火留下的焦界；你沒有被任何城內事件拖住。 |
| 2 | first_run | cutaway | - | - | 鏡頭沿腳印先行。村長已獨自抵達焦黑警戒石，主角仍在更低的山路上；風裡只有他的呼吸與碎片碰到石面的聲音。 |
| 3 | first_run | speaker | `village_elder` | `grieving` | 二十年前，是我叫他們跟上。這一次，不該再叫任何人來。 |
| 4 | first_run | narration | - | - | 他跪下比對斷面。人類鑿痕朝外，龍火熔痕朝內；缺口與碎片只差他把手再往前伸一段。 |
| 5 | first_run | speaker | `village_elder` | `resolute` | 如果這真是我們敲下來的……至少讓我親手放回去。 |
| 6 | first_run | narration | - | - | 他把碎片推向缺口。內側黑壓先鼓起，龍影隨後覆住石面；封火落下時畫面切白，沒有回答火是衝著老人，還是衝著他碰到的傷口。 |
| 7 | first_run | cutaway | - | - | 畫面回到主角。最後一枚半月靴印停在焦界下方，前面只剩剛被火照亮的山霧。 |
| 8 | second_run | narration | - | - | 同一條路沒有老人的足跡。封痕碎片在你行囊裡，乾糧與補靴仍留在城內，證明改變不是龍忽然仁慈，而是老人根本沒有獨自走到這裡。 |
| 9 | any | narration | - | - | 龍火沒有向村鎮蔓延。所有焦痕都朝山內彎折；高處飛影只驅離接近封痕的生物，從不追出警戒距離。牠們守的是邊界，不是人類。 |
| 10 | first_run | narration | - | - | 你試吹雙孔，兩個回音在崩壁前重疊。哨子或許屬於山路，卻沒有告訴你先遮哪一孔、在哪裡轉；眼前唯一讀得懂的仍是寬路與老人的足跡。 |
| 11 | second_run | narration | - | - | 依艾洛本輪的反應，你遮住一孔，只吹一短音。回聲沒有穿過焦界，而是沿山壁外側晚半息返回；它證明別路存在，仍未給出第一個盲彎的完整順序。 |
| 12 | second_run | narration | - | - | 碎片一面保留人類鑿痕，另一面被龍火熔成黑玻璃。它靠近前方缺口時發熱，斷面輪廓與遠征圖上遺失的一角一致。 |
| 13 | any | exit | - | - | Mark inward fire and run-specific echo evidence; open the authored seal-scar aftermath without resolving the road. |

### `ch6_s02_scar_aftermath`

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
| 1 | first_run | narration | - | - | 村長倒在警戒石外，沒有龍爪撕裂。他曾把碎片壓向相合的缺口；人類鑿痕朝外，熔黑的一面朝內，位置正確，力量卻不足以承受下一次湧動。 |
| 2 | first_run | narration | - | - | 內側黑壓把碎片和老人一起推出，外側龍火同時灌進缺口。灼痕穿過他的身體，也在身後石面封成一條直線。你能確定龍火殺了他，不能確定牠瞄準的是人還是傷口。 |
| 3 | first_run | narration | - | - | 他的隨身武器仍留在衣側，手卻伸向碎片。龍沒有救他，也沒有收走屍體；對守線者而言，他只是又一個碰了封痕的人類。 |
| 4 | first_run | narration | - | - | 你取回碎片。老人最後理解了傷口，卻沒有找到不碰傷口的路。隱藏成就 `封痕前的老人` 解鎖。 |
| 5 | second_run | narration | - | - | 同一位置沒有屍體，也沒有新填補痕。碎片仍在你手中；你把相合斷面看清，卻不替老人重做那個動作。 |
| 6 | any | narration | - | - | 封痕再次向外鼓起，巨大陰影落在警戒線內側。龍火沿缺口壓回黑流，沒有越線追擊。牠停下來看你下一步把腳放在哪裡。 |
| 7 | any | exit | - | - | Open the direct Elder Dragon warning at the same location; first run carries ambiguity and urgency, second run carries observable restraint. |

### `ch6_s03_stop_before_the_line`

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
| 1 | any | enter | - | - | Elder Dragon enters in the existing full Boss illustration; other dragons remain distant silhouettes, not new speaking characters. |
| 2 | any | speaker | `elder_dragon` | `resolute` | 停下。 |
| 3 | any | narration | - | - | 聲音不是邀請。龍爪停在封線內側，沒有越過牠自己守的界；牠只看你的腳、武器與那塊相合的碎片。 |
| 4 | first_run | narration | - | - | 你在警戒石前短暫停下，指向村長與山內正在搏動的黑壓。背包裡的哨子吹不出可走的順序，眼前也沒有第二條看得見的路。 |
| 5 | first_run | speaker | `elder_dragon` | `guarded` | 又是鐵。又是傷口。二十年前，你們撕開這裡；今天仍拿著它往前。 |
| 6 | first_run | narration | - | - | 你舉起碎片。它能承認人類造成損傷，不能說明如何繞開；腳下同一個四相節律沿來路震回，下一輪外洩已朝村鎮方向延伸。 |
| 7 | first_run | speaker | `elder_dragon` | `angry` | 你們受苦，便以為山該讓路。外面死多少，不歸我。退回去。 |
| 8 | first_run | narration | - | - | 退回去代表帶著村長的屍體和一支無法使用的哨子等待下一次外洩。你沒有龍族知道的答案，也沒有第二條可執行的路；你跨過警戒線，武器沒有放下。 |
| 9 | first_run | exit | - | - | Lock the armed crossing as a rational decision under incomplete knowledge; open Elder Dragon battle. |
| 10 | second_run | narration | - | - | 你在線外停下，把武器完整放在身後地面，再將碎片放到相合缺口前方、仍屬警戒線外的位置。你沒有把它塞回傷口。 |
| 11 | second_run | speaker | `elder_dragon` | `guarded` | 那是你們留下的傷。帶回來，不是贖清。 |
| 12 | second_run | narration | - | - | 你沒有替人類辯解。依艾洛本輪的反應遮住一孔，吹出一短音；回聲沿封火外側返回，不穿過封痕。 |
| 13 | second_run | speaker | `elder_dragon` | `guarded` | 山民的窄聲。它在我們的火外。墜落者來時，那些聲音停了。 |
| 14 | second_run | narration | - | - | 黑壓再次撞上缺口，碎片被震得向線內滑動。你退後一步，沒有伸手越線；龍火從你面前落下，把碎片推回外側並封住湧動。 |
| 15 | second_run | speaker | `elder_dragon` | `resolute` | 我不信你。碎片在外，鐵在地上，你也還在線外。這就夠了。 |
| 16 | second_run | narration | - | - | 牠判斷的不是你的善意，而是當前沒有入侵：舊傷被承認、替代方向可觀察、命令後也沒有跨線。 |
| 17 | second_run | exit | - | - | Lock evidence-bound non-attack; continue to dragon convergence without combat or passage grant. |

### `ch6_s04_dragon_convergence`

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
| 4 | first_run | narration | - | - | 龍火熄滅後，沒有門、階梯或勝利道路出現。封痕內的黑壓第一次向外完整搏動，沿著第五章四相裂線回灌。 |
| 5 | first_run | narration | - | - | 這不是因龍族愛護人類而顯得悲劇。牠們不在乎人族；牠們死後，魔王壓力失去的卻是實際存在的鎮壓。你贏了這場戰爭，也真的殺錯了維持局面的對象。 |
| 6 | first_run | exit | - | - | Lock `dragon_clan_erased` and containment collapse; open the ruined broad-verge search. |
| 7 | second_run | speaker | `elder_dragon` | `guarded` | 你們的窄聲在封火之外。那條路不歸我開，也不歸我准。離開我的線，自己去找。 |
| 8 | second_run | narration | - | - | 你先後退，再拾回仍在線外的碎片與武器。龍沒有側身讓路，沒有露出一條門，也沒有派同族領行；牠只是沒有追擊。 |
| 9 | second_run | speaker | `elder_dragon` | `resolute` | 我離開一步，裡面的東西就把傷口撐開一步。我不替你走。你也別回來碰。 |
| 10 | second_run | narration | - | - | 這回答了龍為何不親自進入核心：牠的力量與位置正被用來壓住寬線。玩家的窄路若存在，只能從封火外側自行找到。 |
| 11 | second_run | exit | - | - | Preserve dragon containment and lock `broad_seal_untouched`; withdraw along the outside boundary toward the same unresolved old-route objective. |

### `ch6_s05_after_the_broad_road`

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
| 1 | first_run | narration | - | - | 龍族已死，失去封火的寬路仍在三面崩壁前結束。沒有守衛、沒有門，也沒有能繼續擊碎而不讓整座山塌下的方向。殺光守線者沒有把地形變成答案。 |
| 2 | second_run | narration | - | - | 你沒有穿過寬線，而是沿龍火外側退出警戒地。那條自然邊界同樣停在三面盲崩壁前；龍沒有攻擊，和龍替你開路，是兩件完全不同的事。 |
| 3 | any | narration | - | - | 回聲哨吹出的兩種音都會返回，但回音重疊，無法判斷哪一孔該在第一個盲彎使用。工具存在，使用記憶不在你身上。 |
| 4 | second_run | narration | - | - | 三個中性錨具仍固定在行囊裡，證明最終準備已到位；缺少的不是戰力，而是一個理解本地路聲的人。 |
| 5 | any | narration | - | - | 你只能先回城找懂聲音的人。第一輪這像勝利後的小挫折；第二輪則清楚指向早已對哨聲有反應的艾洛。 |
| 6 | any | exit | - | - | Open the witnessed casino settlement on town return; `brush_past_or_invitation` follows that fixed confrontation without another mountain detour. |

### `ch6_s06_settlement_throw`

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
| 1 | any | narration | - | - | 你從山路返城時，主桌仍只留兩個位置。維斯珀坐在莊家側，洛恩站在客方，抵押頁壓在骰盅下；契約要求的見證人終於回來，客方骰仍比公開桌的同款稍重。 |
| 2 | any | enter | - | - | Casino owner and dealer enter; Lorne's usual table smile is absent. |
| 3 | any | speaker | `casino_owner` | `soft` | 我們不談背叛，只談未結清的債。你想活著離桌，當然可以。贏一次就好。 |
| 4 | any | speaker | `casino_dealer` | `guarded` | 客方要求見證人。規則第七行。 |
| 5 | any | narration | - | - | 維斯珀允許你站在桌側。他知道見證不會改變被動過手腳的骰子，反而讓結果更像自願。 |
| 6 | any | speaker | `casino_owner` | `pleased` | 公平？當然公平。每個人都有輸光的權利。 |
| 7 | first_run | narration | - | - | 洛恩握住骰盅。你看見他拇指掂過重量，卻不知道那與契約如何相連。骰子離手前，你撞開桌側錨釘，結算線中斷。 |
| 8 | first_run | speaker | `casino_owner` | `angry` | 你救下的只是一筆會重新到期的債。別把延後當成勝利。 |
| 9 | first_run | narration | - | - | 維斯珀撕開抵押頁邊緣。紙後不是門，只是一道吞掉深度的黑縫；他帶著主契約離開，空白債權人沒有顯形。 |
| 10 | first_run | exit | - | - | Vesper escapes; Lorne survives; continue to house aftermath and Loaded Die handoff. |
| 11 | second_run | narration | - | - | `莊家離席` 讓你在骰盅落桌前認出異常重量。你要求依公開規則驗骰；洛恩把客方骰逐一轉到有細小刻痕的一面。 |
| 12 | second_run | speaker | `casino_dealer` | `resolute` | 客方組，三枚，全重。不是每次都輸；只是每一次，都比莊家更接近輸。 |
| 13 | second_run | narration | - | - | 你引用維斯珀自己寫下的爭議條款：莊家若拒絕以同一組器具交換客位證明公平，所有私人抵押立即失效，主人席與總帳交由城鎮清查。接受交換，才能保住屋子與契約主張。 |
| 14 | second_run | speaker | `casino_owner` | `pleased` | 要我為三顆重一點的骰子交出整間屋子？不。一局而已。我只需要贏一次。 |
| 15 | second_run | exit | - | - | Lock marked guest set; open `house_changes_seats` final wager with Vesper unable to remove the witnessed dice. |

### `ch6_s07_house_changes_seats`

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
| 2 | first_run | speaker | `casino_dealer` | `grieving` | 我知道它不夠。它什麼都還不了。但如果你還想追他，拿著。他從來沒有靠運氣贏過。 |
| 3 | first_run | narration | - | - | 他承認自己參與配重、換骰與引導賭客，沒有把所有罪推給維斯珀，也沒有要求原諒。 |
| 4 | first_run | speaker | `casino_dealer` | `guarded` | 這只證明作弊。契約怎麼讓作弊變成債，我還沒找到能把他留住的那一條。下次……如果真有下次，先看客方骰。 |
| 5 | first_run | exit | - | - | Add current-run Loaded Die as evidence; unlock `莊家離席`; casino owner route remains unresolved for the hollow ending. |
| 6 | second_run | narration | - | - | 兩張椅子交換。維斯珀坐上客方位，洛恩將已標記的重骰原封放回他面前。見證人、器具與規則都沒有改變；沒有任何人偷換一顆骰子。 |
| 7 | second_run | speaker | `casino_owner` | `guarded` | 一局。我的所有權與命運，對你的主張。你若輸，今後不再干涉這裡。 |
| 8 | second_run | narration | - | - | 契約要求莊客抵押對等，接受了他的親筆確認。維斯珀也用拇指掂過客骰；他知道勝率被壓低，卻更不能接受不賭就立刻失去抵押頁、主人席與總帳。 |
| 9 | second_run | speaker | `casino_owner` | `pleased` | 輸的人，總是比較會談公平。開始吧。 |
| 10 | second_run | narration | - | - | 重骰離手。沒有人碰桌沿，契約也沒有改變點數；三顆骰子沿著被設計好的偏心軌跡滾過客方長年被迫承受的低勝率，最後停在輸面。 |
| 11 | second_run | speaker | `casino_owner` | `afraid` | 不算。你們動過骰子。這是作弊。 |
| 12 | second_run | speaker | `casino_dealer` | `guarded` | 是。骰子一直都是這樣。你剛才親口接受同一組。 |
| 13 | second_run | narration | - | - | 維斯珀尋找重開、換桌與撤回抵押的條文。交換條款已把這一頁升為當前主契，撕頁等同棄權；每一條退路，都是他為阻止別人逃走而親手封死的。空白債權欄開始向內折疊。 |
| 14 | second_run | speaker | `casino_owner` | `afraid` | 等一下。我還有別的抵押。名字、帳冊、整座賭場——拿別的！ |
| 15 | second_run | narration | - | - | 沒有生物從縫裡伸手。契約只把輸家的名字填進抵押欄，然後收走它所代表的人。維斯珀的聲音與身影一起被紙面壓平，本傳不說出債權者名稱。 |
| 16 | second_run | exit | - | - | Vesper is collected with no redemption; transition to display hall. |
| 17 | second_run | narration | - | - | 洛恩交出債務總帳，打開所有展示櫃的主鎖。你可立即任選一件大獎，讓獎勵在最終章前仍有實際用途。 |
| 18 | second_run | speaker | `casino_dealer` | `guarded` | 拿一件。不是他送的，是從他手裡拿回來的。剩下的帳，我會一筆一筆攤在鎮上看得見的地方。 |
| 19 | second_run | narration | - | - | 私人抵押立即凍結，總帳公開核對；往後只保留公開機率與票券桌，並接受城鎮監督。洛恩只能以受監督荷官身分協助清帳，不得到赦免、主人席、契約權限或賭場所有權。 |
| 20 | second_run | exit | - | - | Unlock one showcase selection, contract removal, transparent ticket games, and Lorne restitution state. |

### `ch6_s08_brush_past_or_invitation`

- `stageClass`: `town_scene`
- `background`: town edge after the failed mountain return and fixed casino confrontation
- `worldState`: Chapter 6 dusk; Ailo hears that neither force nor dragon restraint revealed a usable human continuation
- `viewpoint`: `protagonist_limited`
- `participants`: street_beggar
- `entry`: protagonist leaves the resolved casino scene and crosses the town edge with the Echo Whistle still in current-run inventory
- `exit`: first run loses the whistle and Ailo; second run gains Ailo as an active companion
- `objective`: first run discover the theft; second run recognize and interrupt the same intention
- `inputs`: broad road failed; `先行的回聲` only in second run
- `outputs`: first-run whistle stolen/Ailo missing or second-run Ailo companion state
- `assetNotes`: reuse present Ailo portrait; brush-past interaction needs no new dialogue image

| Order | Condition | Beat | Speaker | Expression | Runtime Text / Stage Action |
| ---: | --- | --- | --- | --- | --- |
| 1 | any | narration | - | - | 你在鎮邊提到山上沒有路。艾洛原本蹲在牆根，聽見「沒有路」後第一次完整抬頭。 |
| 2 | first_run | enter | - | - | Street beggar approaches. Dialogue UI opens with his portrait and name label `乞丐`, but the text field remains empty. |
| 3 | first_run | narration | - | - | 他與你擦身而過，沒有一句對話。介面立刻關閉，人也混進轉角後的陰影。 |
| 4 | first_run | narration | - | - | 系統提示檢查背包。回聲哨已不在原格，地上只留著一小片被揉爛的花瓣。 |
| 5 | first_run | exit | - | - | Lock Ailo missing and Echo Whistle stolen; open old route mouth after a short delay. |
| 6 | second_run | narration | - | - | `先行的回聲` 讓你在他靠近前握住哨子，直接指出他打算拿走它並獨自上山。 |
| 7 | second_run | enter | - | - | Street beggar stops at arm's length; expression shifts from guarded to afraid. |
| 8 | second_run | speaker | `street_beggar` | `angry` | 不是偷。那是我們的。你吹錯了，山把路藏起來，她還在等。 |
| 9 | second_run | narration | - | - | 你不要求他解釋妻子、村落或魔王，只說既然只有他知道先吹哪一孔，就由他帶路，而你不會讓他一個人去。 |
| 10 | second_run | speaker | `street_beggar` | `afraid` | 你走太重，會把花踩爛。也可能死。她不喜歡我帶死人去。 |
| 11 | second_run | narration | - | - | 你把哨子交到他手上，卻沒有放開同行的決定。艾洛把它收進衣內，第一次朝你點頭。 |
| 12 | second_run | speaker | `street_beggar` | `guarded` | 跟緊。聽見兩次就停，三次才轉。別相信眼睛，石頭會撒謊。 |
| 13 | second_run | exit | - | - | Add Ailo companion state; current-run whistle remains under shared route use. |

### `ch6_s09_the_old_note_answers`

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
| 4 | second_run | enter | - | - | Ailo enters at the route mouth, covering one whistle hole with a scarred fingertip. |
| 5 | second_run | speaker | `street_beggar` | `neutral` | 第一聲問石頭還在不在。第二聲問後面有沒有空。它們不回答人，只回答形狀。 |
| 6 | second_run | narration | - | - | 他吹一短一長。左側回音重疊，右側長音晚半息返回，指出崩壁後仍有可走的窄腔。 |
| 7 | second_run | speaker | `street_beggar` | `guarded` | 三次才轉。以前她會數，我老是搶第二次。不要笑，走錯的人沒資格笑。 |
| 8 | second_run | narration | - | - | 艾洛先側身進入，又停在能看見你的地方。這個微小等待就是兩周目真正改變的第一步。 |
| 9 | second_run | exit | - | - | Open Chapter 7 old mountain canvas with Ailo companion and Echo Whistle route rules. |

## Chapter 7 Detailed Screenplay V1

Status: `complete_pending_user_review`. `魔王赫爾薩恩 / Helsarn`, Neelu's
mountain-village dye-mender identity, and `洛恩 / Lorne` are accepted. Chapter 7
performance, route logic, Ailo's survival result, true execution, and both
endings now form one completed review draft awaiting user approval.

### `ch7_s01_narrow_human_road`

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
| 1 | first_run | narration | - | - | 艾洛的腳印總在正確轉角前突然消失，再從看似封死的石縫後出現。你追得上路，追不上走在前面的人。 |
| 2 | first_run | cutaway | - | - | 鏡頭沿下一次哨聲切到更高的盲彎。艾洛獨自貼著石壁，主角仍隔著兩段看不見的轉角；他手裡只有剛取回的哨子。 |
| 3 | first_run | speaker | `street_beggar` | `soft` | 找到了。兩聲停，三聲轉。她還在等。這次不會吹錯。 |
| 4 | first_run | narration | - | - | 他遮住右孔吹出長音，等回聲晚半息才側身進入裂縫。嘴裡反覆念著沒有名字的「她」，沒有回頭。 |
| 5 | first_run | cutaway | - | - | 鏡頭回到主角。長音已在岩層裡散掉，只剩前方新落的碎石與一點血。 |
| 6 | first_run | narration | - | - | 幾處血痕落在尖石上，沒有拖行或屍體。手札只能寫下：有人帶傷繼續往墜落地前進。 |
| 7 | second_run | enter | - | - | Ailo enters at the first blind turn, listening to the return echo before moving. |
| 8 | second_run | speaker | `street_beggar` | `neutral` | 兩次停，三次轉。以前我總搶快，她就在後面罵我把路走得像逃命。 |
| 9 | second_run | narration | - | - | 有時他準確指出石縫，有時又蹲在一片普通苔痕前叫錯名字。你不替他把破碎記憶整理成預言，只等他重新聽見路。 |
| 10 | second_run | speaker | `street_beggar` | `guarded` | 別扶。我會忘記腳要放哪。你站近一點就好。 |
| 11 | any | narration | - | - | 路旁開始出現生活留下的東西：染色用的碎陶碗、獵繩固定孔、被熏黑的屋樑。這裡曾是村落，不是祕密教團或古代神殿。 |
| 12 | first_run | narration | - | - | 新鮮腳印越過倒塌屋基，朝一片仍有花梗的高地去。沒有回程足跡。 |
| 13 | second_run | speaker | `street_beggar` | `afraid` | 快到了。她會生氣。我太久了。花都換了好多次。 |
| 14 | any | exit | - | - | Discover ruined flower-field node and open its full-image scene. |

### `ch7_s02_ruined_flower_field`

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
| 3 | first_run | narration | - | - | 最後一枚帶血手印停在崖口新裂的岩面，下面只有被黑霧遮住的深谷。你沒有找到屍體，也沒有聽見告別；手札只能留下「有人把這裡當成約定地，之後仍往上走」。 |
| 4 | first_run | exit | - | - | Lock incomplete flower-field entry; continue to final camp without revealing Neelu or Ailo's name. |
| 5 | second_run | enter | - | - | Ailo enters and kneels beside the white-petaled, pale-green-centered flower; the Echo Whistle slips from his hand but does not sound by itself. |
| 6 | second_run | speaker | `street_beggar` | `grieving` | 不是這樣。這裡以前很多。她說不准採，今天不用工作……我還帶了袋子。 |
| 7 | second_run | narration | - | - | 你把空袋放到一旁，只留下花與哨子。山風穿過雙孔，回出一短一長，與舊田界的形狀重合。 |
| 8 | second_run | speaker | `street_beggar` | `afraid` | 她要叫我了。別回答，那是我的名字。 |
| 9 | second_run | exit | - | - | Fade present ruin into old-photo-filter memory; open `echo_memory`. |

### `ch7_s03_echo_memory`

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
| 1 | second_run | narration | - | - | 焦土先恢復顏色，接著是田界、屋頂與曬在繩上的布。畫面像舊照片被水慢慢洗回原貌。 |
| 2 | second_run | enter | - | - | Young Ailo enters carrying one bag mixed with edible herbs, dye flowers, and useless trail scraps. |
| 3 | second_run | enter | - | - | Neelu enters with dark hair tied by faded green cloth, dye-stained fingertips, and a mending needle at her collar. |
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
| 20 | second_run | narration | - | - | 畫面重新疊回現在。年老的艾洛站在完整花田記憶裡，手中仍抱著多年來誤認成她的破布。 |
| 21 | second_run | enter | - | - | Present Ailo enters; Neelu remains a memory participant, not a living ghost in the current world. |
| 22 | second_run | speaker | `street_beggar` | `grieving` | 我沒等到妳。我一直往崖口上面走，以為妳還在那裡。我把路忘了，把妳的臉也弄丟了。我恨那座山，也恨活下來的是我。 |
| 23 | second_run | speaker | `neelu` | `soft` | 我知道。你有來。你一直都在來。 |
| 24 | second_run | speaker | `street_beggar` | `grieving` | 花都死了。約定也被我拖爛了。 |
| 25 | second_run | speaker | `neelu` | `soft` | 我叫你往下，是要你活，不是叫你回頭找我。約定也不是要你死在這裡。艾洛，看我——現在你已經來了。 |
| 26 | second_run | narration | - | - | 她接過記憶裡那只永遠混亂的袋子，將花與廢木分開，像過去無數次一樣。畫面沒有提供魔王弱點，只把一段人生還給他。 |
| 27 | second_run | exit | - | - | Old-photo image fades; protagonist wakes in present ruin beside living Ailo. |
| 28 | second_run | speaker | `street_beggar` | `hurt` | 她叫我艾洛。原來是這個。 |
| 29 | second_run | narration | - | - | 他沒有恢復成完全正常的人，也沒有立刻走回城鎮生活。他只是終於知道妮露當年指的是下山方向，不再把舊崖口上方當成她仍在等待的地方。 |
| 30 | second_run | exit | - | - | Lock Ailo survived, old-cliff misreading corrected, and memory complete; open final camp with him resting outside the combat route. |

### `ch7_s04_three_anchor_check`

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
| 1 | first_run | narration | - | - | 行囊裡有足以完成戰鬥的裝備與補給，卻沒有任何方法證明敵人的生命只留在可見身體。你只能按第一次遠征的邏輯前進：找到，擊倒。 |
| 2 | second_run | narration | - | - | 第一只中性外殼裝入完整生命種子。它會把借用大地的活力逼回一具可死的身體。 |
| 3 | second_run | narration | - | - | 第二只外殼固定古代符文。它不增加傷害，只在肉身崩潰時釘住企圖離開的聲音與魂響。 |
| 4 | second_run | narration | - | - | 第三只外殼承載純淨森林精華與微光媒介。宿主與寄生核心的邊界將在最後一刻顯形。 |
| 5 | second_run | narration | - | - | 鐵匠的結構可以接在任何現有武器形式上。劍、斧、槍、弓、法器或其他裝備都由玩家當前選擇完成最後一擊。 |
| 6 | second_run | narration | - | - | 伊萊留下的順序只有三行：先還生命，再鎖回聲，最後照出核心。紙沒有替你戰鬥，只確保證據在正確時刻相遇。 |
| 7 | second_run | speaker | `street_beggar` | `neutral` | 上面那個不是她。別聽它拿死人說話。它不認識我們。 |
| 8 | any | exit | - | - | Lock final preparation state and open Demon King fall-site audience. |

### `ch7_s05_fall_site_audience`

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
| 1 | any | narration | - | - | 墜落地不是王座。岩層向內凹陷，黑色脈絡從中央伸進整座山，像一顆外來心臟把自己縫進土地。 |
| 2 | any | enter | - | - | 魔王赫爾薩恩 enters in the existing full mainline Boss illustration; no sympathetic human portrait or alternate form is added. |
| 3 | first_run | speaker | `demon_lord_asariel` | `pleased` | 翼火熄了。你替我除掉守在傷口上的東西，現在又帶著武器來索取勝利。人類的順序總是方便。 |
| 4 | second_run | speaker | `demon_lord_asariel` | `guarded` | 翼火仍在。你從死村的小路爬進來，還帶著幾件不屬於你的生命。這次學會準備了。 |
| 5 | any | narration | - | - | 你沒有要求它解釋龍、村落或詛咒。所有答案已由活人、死者、道路與當前周目材料拼出；眼前只剩必須被終止的敵人。 |
| 6 | any | speaker | `demon_lord_asariel` | `resolute` | 短命者總把抵達誤認成資格。來。讓我記住你能留下多久。 |
| 7 | any | exit | - | - | 收起事件層，進入 Demon King combat-body Boss battle. |

### `ch7_s06_combat_body_falls`

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
| 1 | any | narration | - | - | 魔王的可見身體跪下，胸口裂開。一般戰鬥判定已完成：敵方軍事形體失去行動能力。 |
| 2 | first_run | narration | - | - | 黑色脈絡沒有停止。它們只把搏動壓低，從屍體退回岩層與遠處尚未封住的回聲。你沒有能標記的第二個目標。 |
| 3 | first_run | speaker | `demon_lord_asariel` | `hurt` | ……很好。 |
| 4 | first_run | exit | - | - | Body appears dead; no valid core target exists. Continue to first-run ending transition. |
| 5 | second_run | narration | - | - | 第一錨啟動。完整生命種子的節律反轉，山中被借走的活力沿黑脈退回土地，迫使剩餘生命集中到倒下的身體。 |
| 6 | second_run | speaker | `demon_lord_asariel` | `afraid` | 你拿走了我的根。 |
| 7 | second_run | narration | - | - | 魔王的聲音脫離喉嚨，試圖沿山壁向外擴散。第二錨的古代符文閉合，將魂響釘在倒地形體上方。 |
| 8 | second_run | speaker | `demon_lord_asariel` | `angry` | 放開。你不懂自己鎖住了什麼。 |
| 9 | second_run | narration | - | - | 第三錨釋放微光媒介。純淨森林精華標出宿主土地與寄生生命的邊界，一枚原本與岩層同色的核心逐漸顯形。 |
| 10 | second_run | narration | - | - | 遠處龍火保持壓力，阻止封痕再次張開。龍沒有進場幫你戰鬥，只完成牠原本就在做的鎮壓。 |
| 11 | second_run | exit | - | - | Open exposed-core phase; current equipped weapon remains active for the final strike. |

### `ch7_s07_last_core`

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
| 1 | first_run | narration | - | - | 沒有第二階段介面，也沒有可攻擊核心。屍體停止反應，山中搏動低到手札與戰鬥系統都只能記為勝利。 |
| 2 | first_run | narration | - | - | 你離開時，最後一道黑脈縮進岩下，隨後再沒有可見搏動。手札、戰鬥判定與現場感知都找不到能繼續攻擊的目標。 |
| 3 | first_run | exit | - | - | Lock hollow-victory state and return to town; surviving-Demon reveal is held for the final post-ending image. |
| 4 | second_run | narration | - | - | 核心被生命、回聲與微光三重限制在一個可攻擊位置。系統保留玩家當前武器、技能與戰鬥身份。 |
| 5 | second_run | speaker | `demon_lord_asariel` | `angry` | 你只是山上一瞬的灰。它會比你活得久。 |
| 6 | second_run | narration | - | - | 最後一擊由玩家現有裝備完成。沒有指定神劍替代選擇，也沒有光明、虛空、外傳 Boss 獎勵或 DLC 力量介入本傳結局。 |
| 7 | second_run | narration | - | - | 核心破裂後，古代符文先失去需要鎖住的聲音，生命種子停止反向搏動，微光則照見岩層重新只屬於岩層。 |
| 8 | second_run | speaker | `demon_lord_asariel` | `hurt` | 不—— |
| 9 | second_run | narration | - | - | 聲音沒有逃往別處。三個錨具依序失去反應，岩層也不再替核心搏動；魔王在當前世界中真正死亡，乾淨的山風第一次穿過墜落地。 |
| 10 | second_run | narration | - | - | 下山時，寬封線的龍火仍在原位。守線者沒有迎接，也沒有離開崗位，只在你從外側經過時抬起頭。 |
| 11 | second_run | speaker | `elder_dragon` | `guarded` | 這一次，你沒有碰那道線。 |
| 12 | second_run | exit | - | - | Lock true-death state, preserve dragon containment, and begin true-ending return sequence without alliance or thanks. |

### `ch7_s08_return_to_town`

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
| 1 | first_run | narration | - | - | 南門只亮著塔維的燈。旗桿換了新木，芙蕾留下的旗扣仍是舊的。塔維沒有問戰鬥，只先確認你的影子是一個人。 |
| 2 | first_run | speaker | `lamplighter_tavi` | `neutral` | 回來了。好。我把名字劃回去。 |
| 3 | first_run | narration | - | - | 米婭的工作間維持原樣，床邊沒有新的水。村長的椅子空著，鐵匠鋪只響了一次錘。 |
| 4 | first_run | enter | - | - | Blacksmith enters at the forge table with the protagonist's damaged gear still untouched. |
| 5 | first_run | speaker | `blacksmith` | `neutral` | 裝備放下。你回來就好。剩下的……今天沒有東西修得好。 |
| 6 | first_run | narration | - | - | 賭場主人席仍空著，但不是因正義完成。維斯珀逃走，洛恩看著他離開的那道門，灌鉛骰只能證明一部分罪。艾洛也沒有回來。 |
| 7 | first_run | speaker | `town_scholar` | `grieving` | 我會寫你擊倒了魔王。這是我們現在能證明的事。其餘的空白……我不會替勝利填滿。 |
| 8 | first_run | exit | - | - | Move into hollow-victory civic ending and post-ending surviving-Demon reveal. |
| 9 | second_run | narration | - | - | 南門同時有旗與燈。芙蕾先舉旗，塔維晚半拍遮燈三次；這次只是他們約好的回程信號。 |
| 10 | second_run | speaker | `standard_bearer_frey` | `pleased` | 一行出去，一行回來。規矩還是很好用。 |
| 11 | second_run | speaker | `lamplighter_tavi` | `pleased` | 我看見了。這次不是「應該」。 |
| 12 | second_run | narration | - | - | 米婭的工作間開著。她先找血、灰與不自然的步子，直到確定你真的沒有帶傷。 |
| 13 | second_run | enter | - | - | Mia enters in the living-after-rescue workroom state; the long-closed inner window is now open. |
| 14 | second_run | speaker | `herbalist` | `guarded` | 哪裡受傷？不要先說沒事。 |
| 15 | second_run | narration | - | - | 你讓她檢查，確實沒有需要治療的傷。你仍留在門口，沒有拿病歷當成見她的理由。 |
| 16 | second_run | speaker | `herbalist` | `soft` | 下次回來，別再拿傷口當理由。 |
| 17 | second_run | narration | - | - | 城鎮人際紀錄新增 `沒有傷也能回來`：`今天沒有新增病歷。她只多準備了一只杯子。` |
| 18 | second_run | narration | - | - | 場景轉到公務室。村長與伊萊把遠征、龍族與封痕攤在同一張不再避開彼此的桌上。 |
| 19 | second_run | enter | - | - | Village elder and town scholar enter together at the archive table. |
| 20 | second_run | speaker | `village_elder` | `soft` | 別寫成我終於做對。寫有人攔住我，而我這次肯停。 |
| 21 | second_run | speaker | `town_scholar` | `pleased` | 我會寫得更麻煩一點：我們終於沒有讓一個人替所有人負責。 |
| 22 | second_run | narration | - | - | 鐵匠鋪恢復完整節奏。主角把武器放上桌時，前面仍排著生活用具。 |
| 23 | second_run | enter | - | - | Blacksmith enters with soot on both hands and a repaired pot cooling beside the anvil. |
| 24 | second_run | speaker | `blacksmith` | `pleased` | 先別把武器放爐邊。前面還有一只漏水的鍋。能排回這種東西，才算真的贏。 |
| 25 | second_run | narration | - | - | 賭場展示牆已有一格空位，那是你在第六章取回的獎品。洛恩把債務總帳放在公開桌上，所有剩餘票券遊戲列出真實機率。 |
| 26 | second_run | speaker | `casino_dealer` | `guarded` | 帳在這裡。看完再決定要不要坐下。這句話以前應該更早說。 |
| 27 | second_run | exit | - | - | Lock core NPC endpoint performances and true-ending town closure; move to Ailo/flower-letter epilogue. |

### `ch7_s09_first_or_second_epilogue`

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
| 1 | first_run | narration | - | - | 城鎮為戰鬥結果點起有限的燈。結算依序回看：沒有回來的旗、涼掉的水、封痕前的老人、逃走的莊家、先行的回聲。 |
| 2 | first_run | narration | - | - | 每段回想都只顯示玩家當時能理解的表面，再留下不完整細節：後標沒亮、棘輪第二聲、老人補過的靴、客方骰重量、艾洛空白的對話框。 |
| 3 | first_run | narration | - | - | `未竟的弒王` 解鎖。第二周目將只保留成就記憶；所有哨子、碎片、骰子、錨具與實體材料都必須在新周目重新取得。 |
| 4 | first_run | narration | - | - | 最後一幕離開城鎮，回到墜落地深處。魔王的戰鬥身體殘破地伏在岩層中，黑脈仍以極慢速度為它輸送生命。 |
| 5 | first_run | enter | - | - | Deferred surviving-Demon full image appears after the apparent ending. |
| 6 | first_run | speaker | `demon_lord_asariel` | `hurt` | 我記住你了，凡人。 |
| 7 | first_run | exit | - | - | Fade to black; unlock second run with achievement-only story persistence. |
| 8 | second_run | narration | - | - | 真結局後，艾洛沒有成為城鎮居民。他在某個清晨自行離開，這次沒有偷走工具，也沒有留下死亡方向。 |
| 9 | second_run | narration | - | - | 幾日後，主角收到一封沒有署名、沒有文字的信。信裡只有那朵外白、花心淡綠、在記憶中被妮露挑出染料堆的花，壓得很平，仍保留一點顏色。 |
| 10 | second_run | narration | - | - | 沒有人替它加上解說。看過記憶的人會明白：艾洛活在某個地方，也終於能把花當成花寄回來。 |
| 11 | second_run | narration | - | - | `回聲盡頭，花仍會開` 解鎖。沒有金幣、裝備或額外系統獎勵。 |
| 12 | second_run | narration | - | - | 畫面回到山邊。花梗在乾淨的風裡移動，封痕仍有龍火守著，岩下不再傳來黑色搏動。 |
| 13 | second_run | narration | - | - | 城鎮沒有被恢復成災難前的樣子。它只終於能讓修復、爭吵、工作、愛與休息繼續發生。 |
| 14 | second_run | exit | - | - | Close the base campaign true ending; unfinished external routes remain optional, and later DLC stays separate. |

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
