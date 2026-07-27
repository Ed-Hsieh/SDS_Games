# Village Elder Character Profile

Last updated: 2026-07-27

## Purpose

This file is the detailed character dossier for `village_elder`. It expands the
main story bible with accepted background, emotional logic, first-run and
second-run direction, and future writing constraints.

Runtime JS/data remains the source of truth for shipped behavior. This file owns
the intended character canon until runtime dialogue and quest data are rewritten.

## Runtime Mapping

- Runtime id: `village_elder`
- Current role label: village elder / opening civic anchor
- Current portrait path: `src/assets/images/art/characters/portraits/village_elder.webp`
- Primary systems touched later: opening town state, main quest briefing,
  town-state changes, multi-speaker scenes, relationship records
- Canon status: in progress, accepted as a core first-run and second-run NPC

## Core Identity

The village elder is not a wise quest board and not a hidden villain. He is an
old man who once believed that courage and steel could protect ordinary people,
then watched that belief break in a place no ordinary person should have entered.

He is the first person the protagonist should learn to trust, but trust does not
mean comfort. He is careful, tired, and protective to a fault. He knows enough to
fear the outside, but not enough to solve the disaster alone.

His story is built around a quiet contradiction:

- He once urged people to advance.
- Now he keeps telling people to stop.
- Both choices came from the same wish: keep the village alive.

## Fixed Background

- Twenty years ago, he was a young militia captain.
- He and other nearby villages formed a joint force to repel monsters.
- The early campaign went well enough that people believed they could win.
- The campaign reached the dragon-sealed outer perimeter and mistook containment
  for another hostile obstruction.
- The force damaged the sealed line with ordinary tools and armed pressure,
  creating the scar represented by `seal_scar_shard`.
- The shard is a wedge of that boundary stone, not a dragon scale or magic key.
  Human chisel strikes remain on one face, dragon-fire vitrification on the
  other, and its broken edge still matches the missing section at the scar. He
  carried it back from the collapse without understanding the full structure.
- `elder_dragon`, the dragon defense, and curse pressure released through the
  damaged line destroyed the force in a one-sided slaughter.
- He survived by chance because retreat, terrain collapse, and separation left
  him outside the killing center, not because the enemy spared him.
- He lost his militia, friends, and the young certainty he once carried.
- After returning, he fell into long depression.
- His wife later left him. This is background pain, not an active plot branch.
- No wife search, reunion, revenge, or hidden-wife subplot should be added
  unless explicitly approved later.
- The villagers know he advocated the old attack.
- They also know many of them agreed with him at the time.
- He is not publicly condemned, but quiet gossip and unfinished grief still cut
  into him.
- He became village elder because nobody else wanted to inherit the ruined civic
  burden.

## Present-Day Situation

The village is not ignorant of danger. Everyone knows the situation is bad.
Roads are failing, young and able people have left, and too many elderly,
children, wounded, and weak residents remain.

He does not believe the village can simply evacuate. Even if he wanted to lead
everyone out, many people could not survive the road. The black mist and monsters
make departure a slow execution, not a clean solution.

He does not know the external adventurer guild has posted a rescue or
reconnaissance request. When the protagonist arrives and explains the situation,
the elder understands the guild's intent but also recognizes the danger: another
young armed outsider has walked into the same kind of disaster that destroyed his
old militia.

His instinct is to protect the protagonist, even when he also needs the
protagonist's help.

## Public Function

The elder is the opening civic anchor.

He should:

- Establish the town's survival pressure.
- Make the first town state feel sparse but human.
- Direct the protagonist toward the right person or place without sounding like a
  menu.
- Show that the village has leadership, but not control.
- Resist turning the opening into a simple heroic assignment.

He should not:

- Hand out abstract errands.
- Pretend the protagonist is a chosen hero.
- Know the full supernatural truth from the start.
- Speak in polished exposition.
- Become only a tragic confession machine.

## Private Desire

He wants the village and its remaining people to survive.

That desire is practical, not glorious. He wants children to wake up tomorrow,
old people to have water, wounded people to make it through the night, and the
road not to swallow another name.

He does not need everyone to call him brave. He needs them to still be alive.

## Wound And Fear

His central wound is survivor's guilt without a clean crime.

He did advocate the old campaign. He did lead people out. But the campaign was
not a private ambition; the villages believed they were protecting themselves.
The elder's grief is painful precisely because responsibility is shared and
there is no simple villain to blame.

His fear:

- Sending another young person to die because he needed help.
- Seeing the protagonist repeat his younger self's courage.
- Being forced to choose between truth that causes panic and silence that causes
  ignorance.
- Reaching the end and realizing all his caution only delayed the same slaughter.

## Belief

His current belief is:

> Courage is not enough. People also need time, shelter, and someone willing to
> carry ugly decisions.

This belief should make him cautious, but not cowardly.

He can be wrong. He can hesitate too long. But he is not selfishly hiding behind
the town.

## Useful Knowledge

He knows:

- The old expedition existed.
- It was larger and more hopeful than present-day rumor makes it sound.
- The battle ended in a scale of violence ordinary people could not withstand.
- The final place contained overwhelming dragon heat, pressure, and a broken
  boundary, though he did not understand their containment function at the time.
- Some routes and areas became associated with loss, fear, and taboo afterward.
- The village is too weak to face the outside head-on.

He does not know:

- The complete Demon King truth.
- The ancient dragon-war context.
- The final structure of the black mist.
- The full second-run meaning of all route clues.

This boundary is important. He knows human consequences, not cosmic answers.

## Relationship With The Protagonist

First contact should read as cautious trust.

The protagonist is not a hero to him at first. The protagonist is a wounded
monster hunter who arrived because of an outside guild request, then collapsed at
the village edge after being poisoned and losing equipment.

The elder sees ability, but also danger.

He should gradually become someone the protagonist can rely on, not because he
always tells everything, but because his restraint comes from pain rather than
manipulation.

## Relationship With Town Scholar

The elder and `town_scholar` are old friends.

Twenty years ago, the elder went out with the militia. The scholar stayed behind
because his work was paperwork, supply records, outgoing documents, and village
administration.

Their shared pain is asymmetrical:

- The elder survived the slaughter.
- The scholar survived by never being there.

They both carry the same day, but from opposite sides of the gate.

Their scenes should have old-friend texture. They can interrupt each other, know
what the other avoids saying, and disagree without theatrical hostility.

Accepted Chapter 2 mainline beat: after the recovered-name ledger, 伊萊 says
that twenty years ago the elder waited outside while he rewrote the missing list
until dawn. The elder answers with weary humor; 伊萊 then asks him not to make an
empty chair the only notice of his next departure. The elder does not promise.
This gives the later first-run empty chair personal history without turning the
warning into a rescue flag.

## Relationship With Mia

Mia's father went out with the elder's expedition and did not return.

Mia understands that the elder did not murder her father. Her father
chose to go. The village believed the campaign was necessary.

But understanding does not remove the thorn.

Their relationship should carry quiet civility with an unresolved ache. She can
respect him and still hurt when his old caution sounds too much like the same
village logic that failed her family.

## First Run

In the first run, the elder should appear as:

- Reliable.
- Protective.
- Tired.
- A little withholding, but not malicious.
- A man trying to stop the protagonist from walking too quickly into danger.

The player should have a fair surface reading:

- The village is in trouble.
- The elder is cautious because roads are dangerous.
- He sends the protagonist to gather information and help stabilize the town.

The deeper reading should become legible later:

- Every warning is shaped by the old expedition.
- Every pause around western routes, missing patrols, or armed courage has a
  twenty-year wound behind it.
- He is not hiding a secret plan; he is trying not to relive a slaughter.

Accepted first-run end:

- `ch5_s08_expedition_list` makes the old geometry legible. In
  `ch5_s10_before_dawn`, he leaves before South Gate opens; Chapter 6 begins with
  the player pursuing him immediately rather than stopping for a town event.
- He goes because he recognizes that the protagonist is approaching the same kind
  of sealed outer route that the old expedition damaged twenty years ago.
- He does not fully understand the dragon clan's role, the Demon King's full
  truth, or the correct way to pass the sealed route.
- He carries the `seal_scar_shard` / 封痕碎片 and tries to answer the old
  expedition's mistake himself by fitting the fragment into the old break.
- During the pursuit, the audience briefly cuts ahead to him alone. He says
  `二十年前，是我叫他們跟上。這一次，不該再叫任何人來。` and
  `如果這真是我們敲下來的……至少讓我親手放回去。` The protagonist does
  not hear either line; the cutaway establishes motive without revealing the
  dragon's containment role.
- A real curse surge arrives while he is touching the line. Pressure from inside
  and `elder_dragon`'s sealing fire from outside cross through him. He is not
  tried, singled out for revenge, accepted, or rejected as a messenger; to the
  dragon he is another armed human creating an immediate containment risk.
- The player finds his body outside the warning line. The matching shard lies by
  his hand, and the fire mark continues in a straight seal across the stone
  behind him. This proves dragon fire killed him but not whether it targeted him
  or the breach.
- His death is not for the protagonist personally. It is his final attempt to
  stop the old expedition from repeating through another young armed outsider.
- The contrast should be clear: twenty years ago he led others forward; this time
  he steps forward alone so others do not have to repeat his ignorance.

## Second Run

In the second run, the elder's early caution should read differently.

The player should recognize that:

- His route warnings are not generic danger text.
- His distrust of heroic momentum comes from lived trauma.
- His care for the protagonist is partly fear of repeating himself.

Accepted second-run changes:

- The elder's first-run death is saveable in the second run.
- The player can stop him before he leaves alone by proving they understand the
  shape of the old mistake.
- The player needs the elder/scholar truth about the failed expedition and Ailo's
  Echo Whistle route truth. One proof is not enough.
- The elder can then give the `seal_scar_shard` willingly instead of leaving it
  as a corpse-side relic.
- The second-run dragon approach changes through three observable current-run
  facts:
  - the `seal_scar_shard` is placed at the matching break but remains outside;
  - one covered whistle hole produces an echo along the seal's outside edge;
  - the weapon is placed down and the player does not cross when the next surge
    moves the fragment toward the line.
- The dragon clan does not trust the player or grant passage. It has no current
  trespass to answer, so it conserves strength for the seal and does not attack.
  The player must still return for Ailo because neither proof reveals the blind-
  turn sequence.
- In the true-ending archive, the elder rejects a heroic correction narrative:
  `別寫成我終於做對。寫有人攔住我，而我這次肯停。` His endpoint is not
  vindication. It is accepting that shared responsibility includes allowing
  another person to stop him.

## Entrusted Flame

The elder's entrusted flame is not a weapon first. It is the burden of civic
survival: keep people standing without turning them into sacrifices.

Accepted relic:

- `seal_scar_shard` / 封痕碎片.

The shard is not a combat charm or generic equipment reward. Its tool marks,
vitrified face, and matching edge are physical story proof that the expedition
damaged the dragon-sealed perimeter without understanding it. In the first run,
it is found after the elder dies. In the second run, he hands it over before
repeating that death.

The shard alone cannot prevent war. Without Ailo's current-run Echo Whistle
reaction and the player's visible refusal to cross, it says only "humans know
they damaged something." Even all three facts open no road; they only remove the
dragon's immediate reason to attack.

## Dialogue Voice

The elder is restrained, not cold. He habitually places feeling behind the work
that must be done. His warmth appears through safer timing, better equipment,
food, route limits, remembered departures, and preparations made after he fails
to persuade someone to stay.

His emotional order is:

1. Name the immediate practical risk.
2. Offer the safer course without turning concern into a speech.
3. Respect the other person's decision when refusal would only become control.
4. Quietly improve their chance of returning.

He should sound:

- Plain.
- Older.
- Restrained.
- Slightly gentlemanly through habit, not luxury.
- Warm through practical attention rather than decorative reassurance.

He can use silence or stop mid-sentence when old fear or affection nearly becomes
explicit. Do not make every exchange hesitant. His silence must contain a choice,
memory, or withheld request rather than generic solemnity.

Good line shape:

- Short practical instruction.
- A reason grounded in weather, roads, supplies, light, names, or the condition
  of the person in front of him.
- A pause or object choice that reveals he almost said more.
- Concrete detail: road mud, bell rope, old names, a weapon left too clean.
- Concern converted into preparation: a better lamp, a delayed departure, an
  extra ration, a repaired strap, or a clearly marked return route.

Expression use:

- `neutral`: ordinary civic work, listening, and practical warmth. A neutral
  expression can accompany a protective action.
- `guarded`: a report touches an unknown route, a missing person, or the pattern
  of the old expedition. It is caution or masked fear, not permanent severity.
- `resolute`: he has made a decision, accepted responsibility, or must give a
  clear safety instruction. Do not use it for every order.

Accepted calibration examples:

- `明早再去。晚上會看不清路。`
- When the protagonist insists on leaving, he pauses and replaces the lamp:
  `那就帶這盞。舊的會滅。`
- `天黑以前回來。路斷了就記下，怪物太多就繞開。實在過不去，就回頭。`

Avoid:

- Grand speeches about destiny.
- Explaining the whole past early.
- Repeating "protect the village" in abstract terms.
- Treating the protagonist as chosen.
- Saying affection directly when a practical act can carry it.
- Polished maxims written to summarize his trauma.
- Turning restraint into a permanently cold face or clipped hostility.
- Explaining that a pause means worry after the action already shows it.

## Story-System Notes

- He belongs in the opening town state.
- He can direct the protagonist to `town_scholar`, but the scene must explain
  why the scholar matters.
- His route restrictions and warnings should connect to fog, fatigue, route
  danger, and known old roads.
- He should not be used as a generic quest board.
- If town state changes after main quests, he should react in a lived way rather
  than with reward-summary text.

## Resolved Decisions

- He remains publicly identified as the village elder. A personal name is not
  required for the base campaign.
- Before the late story, he knows that the western route destroyed his militia
  and that returning there carelessly will kill more people. He does not know
  the complete nest, seal, dragon, or mountain-vein structure.
- His restraint comes from witnessed danger, not secret cosmic knowledge.
- Final clothing and habitual gestures may refine the existing visual asset,
  but they are production details rather than unresolved character canon.

## Do Not Do

- Do not make him secretly responsible for the whole disaster.
- Do not make him knowingly send the protagonist to die.
- Do not reopen the wife subplot without approval.
- Do not give him full cosmic knowledge.
- Do not make the dragon clan trust him merely because he feels guilty.
- Do not write dragon dialogue with honor-contract language toward humans; to
  them humans are small, self-important seal-breakers who caused trouble.
- Do not make the `seal_scar_shard` alone solve the dragon route.
- Do not write second-run non-attack as permission, forgiveness, alliance, or a
  road opened by the dragon.
