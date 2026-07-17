# Herbalist Character Profile

Last updated: 2026-07-16

## Purpose

This file is the detailed character dossier for `herbalist`, whose accepted
story name is Mia / 米婭. It owns her family wound, protagonist relationship,
first-run death, second-run rescue, relationship records, and recipe-research
boundary.

Runtime JS/data remains the source of truth for shipped behavior. Current
runtime shop names, apothecary flags, dialogue, and market ownership are obsolete
scaffolding until the clean story and market rewrite lands.

## Runtime Mapping

- Runtime id: `herbalist`
- Accepted display name: Mia / 米婭
- Age: 25
- Current portrait path:
  `src/assets/images/art/characters/portraits/herbalist.webp`
- Accepted portrait anchor: young adult woman, long blond braid, green embroidered
  clothing, herb mortar, capable hands, tired but attentive expression
- Accepted story location: 米婭的藥草工作間 / Mia's herb workroom
- Canon status: accepted for character construction and two-run fate; final scene
  prose and runtime implementation remain deferred

## Core Identity

Mia is an idealistic romantic whose gentleness survived grief but never
fully moved beyond it.

She is warm, attentive, observant, and professionally decisive. She is not
fragile and should never read as a passive saint. Her danger is that she can
recognize the value of every life except her own.

Her core sentence:

> She learned to keep other people alive before she learned that her own life
> also belongs among the lives worth protecting.

## Fixed Background

- Mia is 25 in the present story.
- Her father joined the village elder's expedition twenty years ago, when she
  was five.
- Her father never returned.
- Her mother was the village's working healer. She continued teaching Mia
  herbs, stitching, wound cleaning, childbirth assistance, and embedded-object
  removal while grief and illness gradually weakened her.
- Mia could not save her mother. Her mother died when Mia was fifteen.
- Mia inherited the herb workroom and has ten years of practical experience
  treating hunters, patrol members, workers, and ordinary residents.
- Her daily life continued after fifteen, but her inner sense of time did not.
  She kept the workroom arranged almost exactly as her mother left it.

This history makes her surgical competence earned without introducing a living
mentor, apprentice, or replacement healer.

## Private Desire, Fear, And Contradiction

Mia wants to save everyone she can reach. Each person who survives is a
small answer to the childhood moment when medicine was not enough.

Her core fear is watching another important person die beside a bed while her
hands remain useful but insufficient.

Her contradiction:

- She asks the protagonist not to treat their life as expendable.
- She treats her own life as the first resource that can be spent.
- She wants intimacy, but knows how to receive people most easily when they are
  injured and need her.
- She wants the protagonist to return safely, yet fears that without a wound
  there may be no reason for them to return to her.

Her first belief:

> If I can still treat someone, I have not completely lost.

Her end-route growth:

> Care includes protecting the person who provides it, and love does not need
> an injury to justify returning.

## Story And System Boundary

Mia is not a shopkeeper and owns no buy, sell, exchange, paid-heal, status
diagnosis, or material-identification menu.

She owns exactly two game-facing functions:

1. Research prescriptions and authorize the rebuilt market to add medicine
   stock.
2. Provide character story, patient records, and town-relationship events.

Ordinary healing items, antidotes, and later medicines are traded through the
market. Stock already authorized before Mia's first-run death remains
available. Her death removes later research and relationship scenes without
breaking the player's basic supply economy.

The runtime `apothecary_assistant` is not required for Mia's story or for
market continuity. Keep that id outside active screenplay placement unless a
future character-centered story independently justifies it.

## Herb Workroom

Mia works in a private room behind her residence. It is not a public clinic,
shop, or market stall.

- The protagonist wakes here after the opening injury.
- Medicine research and relationship scenes return here across Chapters 1-5.
- The Elemental Lord surgery occurs at the same worktable, turning the opening
  place of rescue into the first-run place of loss.
- In the first run, the room remains accessible after her death as a quiet
  relationship location, not a replacement shop or memorial museum.
- In the second run, survival lets Mia move her mother's old arrangement for
  the first time, open the long-closed window, and make space for present life.

The current portrait's herb-filled interior is the approved visual reference for
the future independent background asset.

## Relationship With The Protagonist

The protagonist begins as a patient and becomes Mia's present emotional
center. The relationship grows through ordinary care before romance is named.

### Chapter progression

1. Chapter 1: Mia saves the collapsed protagonist. Her attention is
   professional, concrete, and gently humorous. After the first route return she
   checks the protagonist's fingers again before accepting the victory report.
2. Chapter 2: the protagonist learns that her father entered the old expedition,
   remains to sort dry leaves beside her, and notices that she looks up at every
   passing footstep before returning to work.
3. Chapter 3: the protagonist conceals an injury. Mia accuses them of treating
   life cheaply; the protagonist points out that she never counts herself among
   the people who deserve care. This is their first major conflict. At the
   chapter close, the protagonist returns voluntarily, removes the armor, and
   reports contact and symptoms before Mia or the blacksmith discovers them.
   This is a behavioral repair, not a completed romance or a promise of safety.
4. Chapter 4: after Frey's first-run death, Mia works without rest. The
   protagonist stays to help and she admits that every departure now feels like
   practice for another permanent absence.
5. Chapter 5: their affection is clear but not formally confessed before the
   Elemental Lord route and surgery.
6. Second-run Chapter 7: the protagonist returns without an injury. Mia lets
   them enter anyway and completes the romance through ordinary invitation, not
   a reward screen.

Accepted final line direction:

> 下次回來，別再拿傷口當理由。

## Relationship With The Village Elder

Mia knows the elder did not privately murder her father and that the old
expedition answered a real regional threat. The relationship remains civil but
contains a quiet thorn.

- She pauses when he speaks about sending people outside for the common good.
- He remembers her as the child of someone who did not return under his command.
- Neither uses melodramatic blame or easy forgiveness.
- Saving both characters in the second run permits understanding, not erasure of
  the old wound.

## Relationship With Town Scholar 伊萊

伊萊 preserves Mia's father's name in the expedition records. She trusts his
work because he normally distinguishes proof from absence instead of closing a
painful blank for convenience.

First-run function:

- He correctly compares four routine separated-residue records collected by
  route crews before the convergence survey, then shortens their common result
  into the field line `標準二格固定可安全處理` without keeping `分離樣本`
  beside the conclusion. These pages are not the fresh residues used for the
  second-run combined test.
- The summary does not order Mia to use the forceps, but it gives the known
  procedure documentary confidence and removes one ordinary reason to question
  it during an emergency.
- After Mia dies, he finds `安全` in his handwriting beside the broken forceps.
  This is a real causal contribution, not an outdated gathering route, hidden
  warning, or attempt to make him the sole culprit.

Second-run function:

- The protagonist's remembered sound prompts a question about what the current-
  run summary actually proves.
- 伊萊 reopens the four source pages, refuses to generalize separated-residue
  safety to a converged object, and records a current-run combined-residue test
  with its scope and unknowns intact.
- The scoped record reaches Mia before the operation while the blacksmith changes
  the physical handling procedure.

## Relationship With The Blacksmith

Mia and the blacksmith care for the same vulnerable body from different
sides: she repairs flesh and he repairs the objects that keep flesh alive.

- He provides the known-safe embedded-object forceps for the first-run surgery.
- The tool is correct for every previously known fragment. Its failure does not
  make him negligent or secretly responsible for Mia's death.
- 伊萊's field summary supports the same selection, but the blacksmith states
  afterward that he would have chosen the forceps without it. Responsibility is
  shared without being flattened into equal blame.
- He serves as the visible technical assistant during the surgery; Mia alone
  performs the medical operation.
- The forceps ratchet click becomes the protagonist's cross-run sensory memory.
- In the second run, he removes the fixed-pressure ratchet and prepares the
  flexible extraction support and gel container.

## First-Run Surgery And Death

The Elemental Lord dies in a four-element burst. One intact shard penetrates the
protagonist between the ribs near a major blood vessel and disables them through
cycling fire, ice, thunder, and poison pressure.

The protagonist is carried directly to Mia's workroom. Medicine can keep the
patient stable long enough for one operation, but cannot remove the foreign
object. Mia is the only person with the wound and extraction experience to
operate.

Accepted scene sequence:

1. The protagonist is sedated but retains broken hearing and blurred awareness.
   Runtime presentation then becomes Mia-limited for the audience: her questions,
   hands, successful extraction, and relief remain visible while the protagonist
   keeps only fragmented sound until the later review.
2. The blacksmith assists with the unfamiliar material and known extraction
   tools.
3. Mia explicitly asks whether the material remains safe after leaving the body.
   The blacksmith can only report that all four existing separated-residue pages
   stayed within the standard pressure range and showed no contraction. With no
   tested alternative and the patient's vessel at immediate risk, she chooses
   the lowest known fixed pressure rather than accepting the summary blindly.
4. Mia successfully removes the intact shard.
5. She confirms that the protagonist's pulse has stabilized and says:
   `好了。你回來了。`
6. The shard contracts after leaving the body. The standard forceps ratchet
   applies too much fixed pressure and crushes it in Mia's grasp.
7. Fire, ice, thunder, and toxic energy erupt at point-blank range. Mia dies
   immediately; there is no untreated return wound, delayed rescue gap, or
   unexplained magical life exchange.
8. The protagonist wakes after the event and learns that only one person came
   back from the operation.

This perspective switch does not grant the protagonist the full causal sequence
early. The audience witnesses Mia's decision and unforeseeable failure; the
protagonist learns usable evidence only when the broken forceps and records are
examined afterward.

This is the first known four-element shard. Mia's death is not clumsiness. The
four source records describe only separated residues; 伊萊's shortened field
summary accidentally makes their safe handling sound general. No existing test
shows that an intact converged object contracts and becomes fragile after
extraction.

## Second-Run Correction

No physical story object crosses the reset. The hidden first-run achievement
preserves one sensory fact: the forceps ratchet click immediately before the
burst.

In the second run, hearing the blacksmith test the same mechanism prompts a
concrete intervention. Current-run tests establish the safe procedure:

- Reopen the four older routine-sample pages and reject their use as proof for a
  combined object; gather a fresh current-run batch from the four fronts for the
  controlled convergence test.
- Remove the forceps' self-tightening ratchet.
- Place a flexible spider-silk loop around the exposed base so extraction force
  is distributed rather than concentrated on the crystal body.
- Let the freed shard slide directly into a container of purified slime gel.
- Use the gel to absorb impact and rapid thermal expansion without adding a new
  legendary material or inherited key item.

The same injury and surgery occur. Mia again says `好了。你回來了。`, but
the shard remains intact and she survives.

The correction is a shared procedure, not an item hand-in. Mia must allow
the protagonist, 伊萊, and the blacksmith to protect the operator as deliberately
as she protects the patient.

## Second-Run Growth And Ending

Survival does not instantly cure Mia's self-neglect.

- She is shaken by learning that the preparation was designed to bring both the
  patient and healer through the operation.
- She begins delegating market distribution instead of personally carrying
  research, supply, and care.
- She accepts rest and lets another person clean the workroom after a difficult
  treatment.
- She changes the room inherited from her mother instead of preserving grief as
  furniture.
- The true-ending relationship closes when the protagonist returns without an
  injury and Mia welcomes them for their own sake.

## Town Relationship Records

`藥師手記` is not an inventory item, quest item, inherited object, or second-run
unlock condition.

First-run final relationship tile:

- Title: `最後一頁`
- Text: `《藥師手記》最後一頁只寫著：「醒來後先給他水。別讓他立刻起身。」`

Second-run final relationship tile:

- Title: `沒有傷也能回來`
- Text: `今天沒有新增病歷。她只多準備了一只杯子。`

Accepted hidden achievements:

- First-run memory achievement: `醒來時，水已經涼了`
- Second-run rescue achievement: `醒來時，水仍溫著`

## Dialogue Voice

Mia sounds warm, grounded, observant, medically concrete, and more direct
when someone is injured. She is capable of gentle humor under pressure but does
not sound holy, mystical, or endlessly patient.

Her warmth must remain professionally credible. She does not soothe by promising
an outcome she cannot know. She names what she has observed, gives the patient
one manageable action, and offers reassurance supported by the body in front of
her.

Her usual spoken order is:

1. State a concrete observation or treatment status.
2. Give one short instruction at the patient's pace.
3. Name the next reliable threshold or limit.
4. Let water, cloth, medicine, touch, or a small domestic action carry the care
   she does not announce.

Good line behavior:

- Names a symptom before naming an emotion.
- Places water, cloth, or medicine into someone's hands instead of announcing
  care.
- Uses low-pressure guidance such as `慢一點`, `手放鬆`, `不用急著回答`, or
  `先喝一口`, but varies the wording instead of repeating a comfort template.
- Gives measurable reassurance: bleeding has stopped, bone is intact, fever has
  lowered, sensation has returned, or tomorrow's movement depends on tonight's
  temperature.
- Nearly says something intimate, then returns to a practical instruction.
- Becomes sharper when the protagonist lies about pain.
- Lets quiet domestic humor return in the second-run ending.

Expression use:

- `neutral`: routine examination, ordinary instruction, and attentive listening.
- `soft`: danger has receded enough for warmth or physical care to become
  visible. Do not use it simply because she is kind.
- `pleased`: a measurable improvement, a small joke grounded in treatment, or
  visible relief.
- `guarded`: a symptom does not match expectation or she is containing concern
  while gathering more evidence.
- `resolute`: an immediate procedure requires steady control and concise
  direction. It is professional focus, not harshness.

Accepted calibration examples:

- `手先放鬆。還有一片碎屑沒有取出來。` The following narration shows her
  using the forceps at the wound edge.
- `今天看起來好多了。至少不用我提醒你怎麼喝水了。` She passes the water
  and only then lets the corner of her mouth lift.
- `這裡是我的工作間。傷口已經處理好了，你很安全。先休息一會兒。` The
  following narration shows her pulling the slipped blanket back into place.

Avoid:

- Repeating generic assurances such as `沒事的`, `不要怕`, or `一切都會好起來`.
- Promising recovery before symptoms support it.
- Turning medical care into saintly patience, mystical intuition, or constant
  softness.
- Writerly jokes, aphorisms, or system-boundary exposition that a patient would
  not need to hear.
- Saying `我在這裡` casually in every scene; reserve it for real pain, fear, or
  unstable consciousness so it keeps its weight.

Avoid immediate confession, destiny language, saintly speeches, and jokes that
make injury feel consequence-free.

## Story-System Notes

- Her recipe research may unlock market stock, but the market owns every
  transaction.
- Her relationship route must use explicit story flags, not talk-count depth.
- Her death must not disable baseline medicine acquisition.
- Her survival may authorize later prescriptions and relationship scenes, but it
  is not required to import full light, Void, tower, or DLC systems.
- The workroom requires one future independent background and two run-specific
  state treatments. Dialogue expression and story-CG production remain deferred
  until the screenplay is locked.

## Do Not Do

- Do not restore the Moon Moss gathering death or Life Seed rescue route.
- Do not make Mia a market vendor, paid healer, material-identification UI,
  or apothecary shop owner.
- Do not add `藥師手記` as a physical key item.
- Do not make her death a journey injury, delayed untreated wound, poison
  rebound, life-transfer ritual, or unexplained magical price.
- Do not make the first-run forceps failure incompetence by Mia or the
  blacksmith.
- Do not erase 伊萊's unscoped summary from the first-run causal chain, and do not
  inflate it into fraud, recklessness, or sole responsibility.
- Do not use a new apprentice or apothecary assistant merely to preserve market
  functionality.
- Do not make romance immediate or separate from the survival story.
- Do not let the second-run correction become a random hidden pickup or optional
  item hand-in.
