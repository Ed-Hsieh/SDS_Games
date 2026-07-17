# Blacksmith Character Profile

Last updated: 2026-07-17

## Purpose

This file is the detailed character dossier for `blacksmith`. It records the
accepted direction that the blacksmith is not a death-route NPC, but the village
temperature gauge: his tone changes according to how many people the village
loses or saves.

Runtime JS/data remains the source of truth for shipped behavior. This file owns
the intended character canon until runtime dialogue, forge scenes, town-state
events, and relationship records are rewritten.

## Runtime Mapping

- Runtime id: `blacksmith`
- Current role label: blacksmith / forge service / equipment repair and crafting
- Current portrait path: `src/assets/images/art/characters/portraits/blacksmith.webp`
- Primary systems touched later: forge, repair, crafting, enhancement,
  equipment durability pressure, town mood reflection, first-run and second-run
  dialogue variants
- Canon status: in progress, accepted as a non-death NPC and town-emotion gauge

## Core Identity

The blacksmith is a local villager. He is direct, hot-tempered, and blunt enough
to sound rude even when he is helping.

He cares, but he wraps care in mockery when the village still has enough warmth
for jokes.

When grief piles up, that wrapping falls off.

His core role:

> He is the village's furnace. When people are still alive, he is loud. When the
> village loses people, he burns quieter and speaks too plainly to hide pain.

## What He Is Not

The blacksmith does not need a separate old-trauma route.

Rejected or retired direction:

- Do not give him a fixed past tragedy about failed weapons unless later
  explicitly reopened.
- Do not make him die as part of the first-run tragedy.
- Do not make him a saveable-death NPC.
- Do not make his arc depend on a personal relic or secret.

His strongest function is present-tense emotional reflection.

## Public Function

The player first sees him as the face of equipment pressure:

- Weapons break.
- Armor needs repair.
- Bad preparation can get someone killed.
- Crafting and maintenance are not optional flavor; they are survival habits.

He makes these systems feel human by insulting the player's bad choices while
quietly making sure the player's gear is less likely to fail.

He should not become only a forge menu.

## Private Desire

He wants people to come back with their gear.

Not just gear.

People.

He can repair blades, armor, hinges, flag fittings, lamp frames, and broken
handles. He cannot repair missing people. This simple limit is where his late
first-run pain comes from.

## Personality

He is:

- Local.
- Blunt.
- Irritable.
- Loud when the village still has life.
- Good-natured beneath the insults.
- Bad at gentle phrasing.
- Direct when grief strips away his joking armor.

He is not poetic. He is not elegant. He is the kind of person who says the
sentence wrong but means it right.

## Care Hidden In Mockery

When he has energy, care should appear as teasing or insult.

Examples of tone, not final runtime lines:

- "You call that a sword? I would not use it to pry open a stuck door."
- "You beat that monster with this thing? Then the monster should be ashamed."
- "Bring it here before you get yourself split open by your own bad judgment."

The player should learn that his mockery is how he worries.

## Care Without Armor

As first-run losses accumulate, he starts losing the ability to joke.

This is not dramatic eloquence. It is a straight person's grief becoming too
heavy to hide.

Examples of tone, not final runtime lines:

- "Do not save medicine. Do not save your life for later. Later may not come."
- "I can fix the metal. That is the easy part."
- "Bring yourself back. Gear I can repair."

This contrast is the point of the character.

## Village Temperature Gauge

The blacksmith is a town-state emotional indicator.

First-run fixed deaths and disappearances should gradually change his dialogue.

Second-run rescues should preserve more of his early warmth and foul-mouthed
energy.

The difference should be obvious to returning players:

- Same forge.
- Same man.
- Different village temperature.

If people are saved, he remains noisy enough to insult the protagonist after a
boss fight.

If people are lost, he becomes bluntly caring because he can no longer bear to
pretend everything is ordinary.

## First Run

Accepted direction: the blacksmith survives the first run.

He does not need a personal death route. His first-run arc is watching the village
thin out.

First-run tone stages:

1. Early: loud, funny, insulting, energetic.
2. Early-mid: still insulting, but shorter and less playful.
3. Mid-late: jokes fail; he starts directly warning the protagonist.
4. Late: he speaks with painful plainness.
5. Lowest point: a scene should show him unable to hide grief after a major NPC
   death or disappearance.

He may still work at the forge. The fact that he keeps working is part of the
pain.

His accepted proactive mainline choice occurs in Chapter 4. When weapon orders
compete with evacuation fittings, he moves new blades to the back and repairs
the route boards, hinges, lamp frames, and stretcher clasps first. His line is:
`今天先修能讓人回來的東西。想要新刃的，等路上的人都回來再排。爐子不是只替會打架的人燒。`
This keeps him from existing only as a reaction to other characters' losses.

## Lowest-Point Event

The exact trigger depends on the final fixed first-run death order.

The event should happen when the player must find or visit the blacksmith before
leaving for a dangerous location.

Possible structure:

1. The protagonist arrives for repair, preparation, or a forged object.
2. The blacksmith is working, but the rhythm is wrong.
3. He names the kinds of things he can repair: weapons, armor, flag fittings,
   lamp parts.
4. He hits the limit: people do not come back as repairable things.
5. He gives the protagonist the gear anyway.
6. He asks, too directly, for the protagonist to come back alive.

Possible emotional line shape:

> "Swords, mail, flag rods, lamp frames. I can fix all of that. People keep
> bringing me things without the people attached. Do not make me add your gear to
> that pile."

This is not final prose. It is a direction marker.

## Second Run

In the second run, the blacksmith does not need to be saved. The village around
him changes.

If the player saves people who died or disappeared in the first run, the
blacksmith remains closer to his early self:

- Louder.
- Ruder.
- Funnier.
- More alive.
- Still worried, but capable of hiding it inside mockery.

The player should feel the reward emotionally, not only through UI flags.

Example tone after a boss when people are alive:

> "You beat that thing with gear like this? Maybe it was not as impressive as
> everyone said. Hand it over. I want to see what you ruined this time."

The same story stage after losses should have a different line shape:

> "Leave it here. I will fix it. Then you take it and come back with it. That is
> the whole instruction."

Accepted ending performances:

- First run: `裝備放下。你回來就好。剩下的……今天沒有東西修得好。`
  He survives, but the forge cannot translate every loss into repair.
- Second run: `先別把武器放爐邊。前面還有一只漏水的鍋。能排回這種東西，才算真的贏。`
  Ordinary household work returning to the front of the queue is his proof that
  the town is alive, not a larger weapon or personal reward.

## Relationship With The Protagonist

He treats the protagonist like a problem he has decided to maintain.

Early:

- Insults the protagonist's equipment.
- Complains about reckless preparation.
- Acts like the protagonist's survival is a matter of professional pride.

Later:

- Cannot fully hide that the protagonist is one of the people he is afraid to
  lose.

His affection should never become polished. It should remain blunt.

## Relationship With Frey

The blacksmith can connect strongly to Frey's route without needing a private
subplot.

Possible later detail:

- He repairs or reinforces the South Gate patrol flag's pole or metal fitting.

If Frey dies in the first run, a returned flag fitting or broken rod can become a
major low-temperature dialogue trigger.

Do not implement this until Frey's death scene is placed.

## Relationship With Tavi

The blacksmith may repair ordinary lantern parts:

- Bent handle.
- Cracked frame.
- Loose hinge.
- Scratched glass fitting.

This gives him a natural way to comment on Tavi's state without becoming part of
Tavi's emotional route directly.

If Tavi grows in the second run, the blacksmith can notice the lamp is being
maintained differently.

## Relationship With Mia

Mia handles bodies. The blacksmith handles gear and unfamiliar tools.

This contrast can support town scenes:

- Mia tries to keep people breathing.
- He tries to make sure their tools do not fail.

During the Chapter 5 operation, he is Mia's technical assistant, not a
surgeon. The standard fixed-ratchet forceps is correct for every known fragment.
伊萊's field summary also reports that four routine samples gathered separately
by route crews remain intact at ratchet setting two. They are not the fresh
four-front batch used for the second-run convergence test. When the extracted
four-element shard contracts and is
crushed, the failure is new material behavior combined with a summary whose
tested scope was not kept beside its conclusion, rather than negligence.

Mia asks about post-extraction behavior before the first-run operation. He
answers truthfully that none of the four existing pages records contraction and
that no alternative procedure has been tested. She chooses the lowest known
fixed pressure because the patient cannot wait. This keeps both crafts competent
while preserving the unprecedented failure.

In the first run, the broken forceps becomes the strongest object of Mia's
loss. His caring tone drops sharply because the town has lost one of the few
people who could mend what he cannot. He tells 伊萊 that he would have selected
the same forceps without the summary, preventing 伊萊 from claiming sole blame
without denying that the page helped make the procedure feel settled.

In the second run, the protagonist recognizes the ratchet click before departure.
伊萊 reopens the current-run source pages and rejects the generalized conclusion.
The blacksmith removes the ratchet, prepares a flexible spider-silk loop, and
provides a purified slime-gel receiving vessel after a scoped current-run test.
Mia still owns the procedure and medical judgment.

## Relationship With Village Elder And Town Scholar

He likely respects the elder's burden but does not speak gently about it.

He may treat the scholar's papers with impatience, but not contempt. He knows
paper can send people outside just as surely as weapons can.

Use this sparingly. His main emotional language is work.

## Dialogue Voice

The blacksmith notices before he performs personality. A bad step, reopened
wound, chipped edge, loose clasp, bent plate, or careless repair gives him the
reason to speak. Do not open his scenes with a crafted insult that could have
been delivered to anyone.

His usual movement is:

1. Notice one concrete fault in the person, equipment, or way it was used.
2. Criticize the method, neglect, or unnecessary risk.
3. Take the object, adjust it, or give one direct instruction.
4. Let care appear through the work rather than a declaration.

He may talk more than a clipped stereotype. He can curse the equipment, explain
what damaged it, and mock the user in the same exchange. The target remains the
bad method, ruined tool, or reckless choice. He does not reduce the person to
worthlessness.

He should sound:

- Blunt.
- Local.
- Direct.
- Irritable.
- Alive when the town is alive.
- Painfully honest when the town is hollowed.

Good line shape:

- Insult the equipment.
- Tie the damage to how it was probably used.
- Give practical advice or physically correct the fault.
- Reveal care accidentally.

His comparisons must be immediate and easy to understand. A crooked blade may
be compared to the road outside the gate because both are visibly crooked. Do
not build a complete literary metaphor in which equipment and people become a
matched symbolic pair before he can speak.

Expression use:

- `neutral`: inspecting ordinary damage, explaining a repair, or giving direct
  maintenance advice.
- `guarded`: the person's gait, wound, or equipment condition shows an immediate
  safety problem. He observes first and speaks plainly; this is not a cue for an
  elaborate character-introduction insult.
- `pleased`: a repair catches, the forge works again, or a simple object-grounded
  joke lands while everyone is presently safe.
- `soft`: concern can no longer hide behind mockery. He remains blunt and
  work-focused rather than becoming a gentle mentor.
- `resolute`: someone must stop using unsafe gear, leave the work area, or follow
  a technical instruction immediately.

Accepted calibration examples:

- `劍崩了三個口。你是拿它砍東西，還是拿它跟石頭吵架？`
- `站都站不穩，還帶著這東西亂跑。` He holds out his hand, then says only:
  `拿來。`
- `還知道回來。` He glances at the person, returns to the clasp, and adds:
  `行。東西放那邊，先去休息吧。`
- `裝備壞了就丟了，我能做出更好的。` He fastens the shoulder plate and
  lowers his voice: `人不一樣。別丟在外面。`
- `這把刀的刃口比村口那條路還歪。`
- `誰補的？算了，別告訴我。我怕我認識他。`

Avoid:

- Elegant grief speeches.
- Long philosophical monologues.
- Too much backstory exposition.
- Softening him into a gentle mentor too early.
- Making every line only a joke.
- Reusing another NPC's permission, such as whether Mia allowed the protagonist
  outside, as a routine forge-scene opener.
- Insulting a person's worth, intelligence, body, injury, grief, or trauma.
- Treating near-death, disappearance, or a person who failed to return as joke
  material.
- Writing a polished metaphor before he has observed a physical fault.
- Letting mockery replace the practical repair information the player needs.

Tone follows town state. While people are safe, mockery and hammer rhythm make
the forge feel alive. Under growing concern, jokes shorten and direct
instructions take over. After fixed first-run losses, he may be unable to insult
the equipment at all; he says what he is afraid of plainly. This is not a new
soft personality. It is the loss of the verbal cover that once protected his
care.

## Story-System Notes

- Forge UI and repair systems should eventually use him as the human face of
  durability pressure.
- His dialogue should have town-state variants keyed to fixed first-run losses
  and second-run rescues.
- He can comment after boss fights, especially when equipment condition is bad.
- Chapter 5 uses him as the technical owner of forceps modification and anchor
  housings without turning the forge into a clinic.
- He should not become a quest board.
- He should not require a personal relationship meter to function as village
  temperature.

## Open Questions

- Which boss-return scenes should have blacksmith variant dialogue?
- Does saving multiple NPCs in the second run restore specific jokes, or simply
  use a general "warmer village" state?
- At what chapter should the blacksmith fully unlock forge, repair, enhancement,
  and advanced crafting in the new story pacing?

## Do Not Do

- Do not kill him.
- Do not give him a separate failed-weapon trauma unless explicitly reopened.
- Do not make him a formal master-smith archetype.
- Do not make his caring speech elegant.
- Do not make his second-run value depend on rescuing him.
- Do not let forge service erase the fact that he is a person reacting to the
  village's losses.
