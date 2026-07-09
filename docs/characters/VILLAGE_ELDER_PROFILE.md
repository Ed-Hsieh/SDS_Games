# Village Elder Character Profile

Last updated: 2026-07-09

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
- The campaign eventually encountered a boss-level threat that wiped them out in
  a one-sided slaughter.
- The exact boss is not assigned yet. Do not silently add a new boss for this.
- He survived by chance, not because the enemy spared him.
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

## Relationship With Herbalist

The herbalist's father went out with the elder's militia and did not return.

The herbalist understands that the elder did not murder her father. Her father
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

Possible first-run end direction is not final. Current strongest direction:

- He may eventually go out to delay or hold back a threat.
- If he dies, it should be self-redemption and civic duty, not a cheap noble
  sacrifice.
- The contrast should be clear: twenty years ago he led others forward; this time
  he goes last so others can remain behind.

## Second Run

In the second run, the elder's early caution should read differently.

The player should recognize that:

- His route warnings are not generic danger text.
- His distrust of heroic momentum comes from lived trauma.
- His care for the protagonist is partly fear of repeating himself.

Potential second-run changes:

- The player may present evidence or an inherited object that shows the elder his
  future choice.
- Certain warnings can unlock more concrete route information because the player
  already understands what kind of danger to ask about.
- If his death is made saveable, the save condition must grow from fair first-run
  evidence.
- If his death is not saveable, second-run content should still provide
  understanding, farewell, or a way to honor what he was trying to protect.

## Entrusted Flame

The elder's entrusted flame is not a weapon first. It is the burden of civic
survival: keep people standing without turning them into sacrifices.

Potential relics, not yet approved:

- A cracked militia badge.
- The hilt of an old short sword.
- A worn route seal from the failed expedition.

Do not choose or implement the relic until his first-run fate is accepted.

## Dialogue Voice

He should sound:

- Plain.
- Older.
- Restrained.
- Slightly gentlemanly through habit, not luxury.
- Capable of warmth, but rarely decorative.

He can use silence. He can stop mid-sentence. He should not preach.

Good line shape:

- Short practical instruction.
- A pause that reveals he almost said more.
- Concrete detail: road mud, bell rope, old names, a weapon left too clean.

Avoid:

- Grand speeches about destiny.
- Explaining the whole past early.
- Repeating "protect the village" in abstract terms.
- Treating the protagonist as chosen.

## Story-System Notes

- He belongs in the opening town state.
- He can direct the protagonist to `town_scholar`, but the scene must explain
  why the scholar matters.
- His route restrictions and warnings should connect to fog, fatigue, route
  danger, and known old roads.
- He should not be used as a generic quest board.
- If town state changes after main quests, he should react in a lived way rather
  than with reward-summary text.

## Open Questions

- Which boss-level threat destroyed the old expedition?
- Does the elder die, survive with guilt, or become saveable in the second run?
- What is his accepted relic, if any?
- Which chapter reveals the fullest version of the twenty-year expedition?
- How much does he know about the Demon King's sleeping nest before the late
  story?

## Do Not Do

- Do not make him secretly responsible for the whole disaster.
- Do not make him knowingly send the protagonist to die.
- Do not reopen the wife subplot without approval.
- Do not give him full cosmic knowledge.
- Do not make his death automatic before his belief and chapter placement are
  settled.
