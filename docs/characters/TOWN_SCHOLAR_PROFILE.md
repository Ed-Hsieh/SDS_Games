# Town Scholar Character Profile

Last updated: 2026-07-16

## Purpose

This file is the detailed character dossier for `town_scholar`, currently
understood as the old village clerk and paperwork keeper, not a historian or
all-knowing scholar.

Runtime JS/data remains the source of truth for shipped behavior. This file owns
the intended character canon until runtime dialogue, traveler-handbook logic,
quest clues, and multi-speaker scenes are rewritten.

## Runtime Mapping

- Runtime id: `town_scholar`
- Accepted display name: 伊萊
- Current role label: scholar / clerk / records keeper
- Current portrait path: `src/assets/images/art/characters/portraits/town_scholar.webp`
- Primary systems touched later: traveler handbook, encyclopedia framing,
  clue lookup, route investigation, main quest evidence flow, town-humanity
  records, multi-speaker scenes
- Canon status: in progress, accepted as a core investigation partner

## Core Identity

伊萊 is a clerk, not a historian.

He does not record history from above. He handles the paper that lets a small
village function: letters, tax records, route notices, repair requests, delivery
receipts, funeral paperwork, missing-person lists, and internal village matters.

The tragedy of his archive is not that someone wrote a grand chronicle of
disaster. The tragedy is that ordinary paperwork stopped.

A tax route ended mid-year.  
A repair request was never closed.  
A family name moved from a supply list to a missing-person page.  
Some letters were never sent.

He sits in the remains of interrupted daily life and helps the protagonist search
for possibility.

## Personality

He is:

- Elderly.
- Kind.
- Warm in a quiet, practical way.
- A little talkative or fussy.
- Capable of dry, harmless muttering.
- More gentle than sharp.

He can be "嘴碎", but not cruel. His small complaints should make him feel like
a lived-in old man, not a smug intellectual.

He should feel safe to approach.

## Fixed Background

- 伊萊 is local to the village.
- He has long served as the village clerk.
- His work covered external correspondence and internal village administration.
- He handled tax, letters, notices, and routine civic records.
- He knows where old villages used to be, where road markers stood, and how
  patrols or trade groups used to move.
- He does not know what the outside world looks like now.
- He does not know what happened at many outside locations after contact broke.
- He is doing his best to investigate the outside together with the protagonist.

## Twenty Years Ago

伊萊 was friends with the village elder.

When the old expedition went out, 伊萊 did not go because his role was paperwork,
supplies, outgoing documents, and village administration. The disaster did not
fall on him directly in the field. It fell on his friend, on the people whose
names he had handled, and on the village that came back with missing spaces.

He knows the exact expedition lists.

He has:

- Names of people who went.
- Funeral paperwork for those with bodies or accepted deaths.
- Missing-person information for those who never returned.
- Administrative traces of families and village duties that broke afterward.

He does not possess a clean historical answer. He possesses the administrative
debris of a day that never fully ended.

## What The Broken Records Mean

Do not frame the broken paperwork as stolen or deliberately removed unless a full
future payoff is approved.

Current accepted meaning:

- Records broke because life broke.
- People responsible for tasks disappeared.
- Roads stopped carrying letters.
- Bodies were not found.
- Reports never arrived.
- The village had too many unresolved losses to close the books.

This keeps the story focused on small people crushed by disaster instead of
creating an unsupported conspiracy.

## Public Function

伊萊 is the player's investigation partner.

He should not feel like a quest giver who already knows the answer. He should
feel like the person the protagonist can return to with evidence, so both of
them can search through old paperwork for a possible next step.

Runtime may still surface this as quest dialogue, but the narrative intent is:

- The protagonist brings a clue.
- 伊萊 compares it with old documents.
- He finds a possible route, old name, tax trail, supply record, repair note, or
  missing-person connection.
- The next objective grows out of that possibility.

He should say why a clue matters.

## Private Desire

He wants the village's broken daily life to become readable again.

This is not abstract truth-seeking. He wants names, routes, debts, letters, and
unfinished tasks to stop lying in piles without meaning.

He wants to help living people move forward without letting the missing become
blank spaces.

## Wound And Fear

His wound is survival from the desk.

He did not march out with the elder. He did not see the slaughter. But he handled
the paper before and after it. He saw names become absences without witnessing
the moment of death.

His fear:

- The paper he hands out may send another living person to die.
- A reasonable clue may be outdated enough to become lethal.
- The protagonist may trust him, follow his route, and not return.
- The village may once again become a pile of names with no bodies and no
  answers.

## Belief

His belief:

> Even incomplete records can help the living, if someone is patient enough to
> look.

The first run tests this belief brutally.

## Relationship With Village Elder

伊萊 and the elder are old friends.

They should carry a shared history that does not need to be explained every time
they appear together. 伊萊 knows who the elder used to be before the failed
expedition. The elder knows 伊萊 has spent twenty years surrounded by the names of
people they both failed to bring back.

Their tension is quiet:

- The elder fears sending people out.
- 伊萊 fears handing people the paper that sends them out.
- Both are trying to protect the protagonist in different ways.

The Chapter 2 ledger scene does not announce this friendship as a relationship
milestone. It lets the player see how they divide familiar work: 伊萊 replaces a
page, the elder signs what is ready, and each knows which unfinished task the
other will try to carry into the night. Their deeper history belongs to later
events and optional character material. Chapter 5 must earn the empty-chair
payoff through additional shared decisions rather than relying on one early
speech.

## Relationship With Mia

伊萊 knows Mia's father appears in the old expedition records.

He may have handled paperwork connected to the father's departure, missing
status, or funeral absence. This does not make him responsible, but it means her
family wound is not theoretical to him.

If their scenes touch the old lists, write them with restraint. A name on a page
can be heavier than a speech.

Their Chapter 5 relationship must also carry a present-tense consequence. Mia
trusts 伊萊's work because he normally states what a page can and cannot prove.
That trust is why his shortened handling summary matters: it does not order her
to use a tool, but it removes one ordinary reason to question the standard
procedure. Her death therefore strikes both his affection for her and the value
he assigns to useful paperwork.

## First Run

In the first run, 伊萊 begins as warm support.

He helps the protagonist by searching old paperwork:

- Old road markers.
- Tax routes.
- Trade paths.
- Repair notes.
- Funeral records.
- Missing-person lists.
- Internal village records.

He does not know the outside truth. During Chapters 1-4, his incomplete records
remain useful because he states their limits and compares them with current
evidence.

His accepted first-run pain occurs in Chapter 5:

- Mia reads patient symptoms, the blacksmith reads damaged gear, and 伊萊
  reads route timing. Together they identify the four fronts as one rhythm.
- Four source pages correctly show that small fire, ice, thunder, and poison
  residues previously collected separately by route crews remain intact under a
  standard extraction forceps at ratchet setting two. They are distinct from the
  fresh front samples the protagonist can later gather for a combined test.
- Because a field team cannot consult four ledgers during an emergency, he
  compresses their common result into one line: `標準二格固定可安全處理`.
- The source pages say `分離樣本`. The summary line does not keep that scope
  beside its conclusion. No record describes a combined four-element shard, so
  the omission feels practical rather than dangerous before the Boss exists.
- The blacksmith's technically sound tool and 伊萊's concise summary together
  make the known procedure feel settled. Mia saves the protagonist, but the
  forceps crushes the contracting extracted shard and the point-blank release
  kills her.
- At the aftermath table, the field summary lies beside the broken forceps.
  伊萊 sees `安全` in his own handwriting and understands that four accurate
  facts became one untested conclusion when he removed their boundary.

He is not a reckless killer, did not hide a warning, and is not the sole cause.
The blacksmith states that he would have selected the same forceps without the
summary. Even so, 伊萊's writing is a real causal contribution; removing it would
thin his arc back into passive regret.

He does not quit. He does not collapse theatrically. He keeps sitting at the desk
and keeps helping.

But he is lower.

- His jokes fade.
- His hands slow over certain names.
- He removes `安全通路` from the expedition form and writes only `最後可證實位置`.
- He will not write `安全` unless the sample, method, and limit can fit beside it.
- He spends the night after Mia's death reconstructing every omitted scope in
  the handling pages. This is why he notices the elder's first-run departure only
  after the chair, scar shard, repaired boots, and provisions are already gone.
- He still speaks gently, but the air around him feels tired.
- He seems close to being unable to continue, yet continues anyway.

This is his first-run tragedy: not death, but a living collapse of confidence.

## Second Run

The second-run solution does not rely on a freeform player-question system or an
inherited physical item.

Accepted evidence chain:

- Achievement memory `醒來時，水已經涼了` preserves the forceps ratchet click.
- When the blacksmith tests the standard tool before the Elemental Lord route,
  the protagonist recognizes the sound and asks what the handling summary
  actually proves.
- 伊萊 reopens the four current-run source pages and states that they prove only
  separated-residue safety, not the behavior of a converged object. He refuses
  to sign the generalized summary.
- Fresh residues from all four fronts are brought together in the current run;
  these are not the older routine samples summarized on the first-run page.
  伊萊 records how the combined sample contracts under contact and keeps
  `交會樣本`, the tested method, and the unproven limits on the same line.
- The blacksmith removes the ratchet and prepares a spider-silk loop; purified
  slime gel receives the residue without crushing it.
- Mia remains the operator and makes the medical decision. 伊萊's role is
  evidence scope, timing, comparison, and an honest written handling record.
- The same Boss injury and operation occur. The pressure-free procedure keeps the
  shard intact and Mia survives.
- Because the scoped page is completed before nightfall, 伊萊 also has time to
  notice the elder clearing the scar-shard record and pass the preparation clues
  to the protagonist before dawn.
- He survives the true ending. At the final archive table, the elder asks that
  the record say he was stopped and agreed to stop. 伊萊 answers:
  `我會寫得更麻煩一點：我們終於沒有讓一個人替所有人負責。` This is his
  final character answer: honest records preserve shared action instead of
  turning one survivor, hero, or victim into the whole explanation.

Second-run emotional meaning:

- He learns that his paperwork does not only close the books on the dead.
- With present-run evidence gathered early enough, it can still help the living
  avoid a repeated loss.
- His correction is not to stop summarizing. It is to make uncertainty usable
  instead of silently editing it out.
- He does not become a prophet. He remains an ordinary clerk whose ordinary work
  finally reaches the right page.

## Fate Direction

Current direction: do not kill him early.

伊萊 is too important as a living investigation partner. His survival allows the
second run to reinterpret earlier documents and make old daily records painful
and useful.

Possible later fates, not accepted:

- He survives and becomes the quiet witness of both runs.
- He is injured or forced away after a major archive-related event.
- He risks himself to preserve records only if the story has already shown why
  those records matter to living people.

Do not assign a death until his investigation role across chapters is clearer.

## Entrusted Flame

His entrusted flame is not a grand history book. It is the stubborn act of
keeping ordinary traces readable.

Possible relics, not approved:

- A ledger index with unfinished names.
- A bundle of unsent letters.
- A repaired route register.

No relic should be implemented yet.

## Dialogue Voice

伊萊 is slightly talkative, but that does not mean every line is long. He gives
the needed answer first, then often adds one useful half-step: a limitation, a
related civic detail, a self-correction, or a dry observation prompted by the
document in his hands.

He should sound:

- Kind.
- Elderly.
- Slightly fussy.
- Patient.
- Warm even when anxious.

He can mutter about paper, ink, damp corners, bad handwriting, and old filing
habits. These details should humanize him and make investigation tactile.

His talkative rhythm may take these forms:

- Answer the question, then add one relevant detail.
- Notice he has wandered and return himself to the immediate clue.
- State what the evidence proves and what it does not prove.
- Recall one ordinary tax, repair, delivery, funeral, or route detail connected
  to the object in front of him.
- Speak while searching, sorting, unfolding, or comparing documents.
- Correct his own noun or conclusion when precision matters.

A tangent must add evidence, human texture, a limitation, or character. If it
does none of these, remove it. His self-correction shows care with language; it
must not become forgetfulness, incompetence, or constant indecision.

Good line shape:

- A small practical complaint.
- A concrete clue from a document.
- A gentle warning about uncertainty.
- One afterthought that makes the answer more useful rather than merely longer.

Expression use:

- `neutral`: searching, comparing, explaining ordinary records, or correcting a
  term without emotional pressure.
- `pleased`: welcoming someone, making room, or offering a small joke grounded
  in the chair, paper, ink, damp, or another object physically present.
- `guarded`: records conflict, a conclusion exceeds its evidence, or his words
  may send a living person into danger. It carries precision and contained fear,
  not scholar-like suspicion.

Accepted calibration examples:

- `你就是米婭救回來的那位？` He moves the papers off the chair, then adds:
  `請坐。椅子會響但不會塌的——至少昨天還不會。`
- `這張圖只能告訴我們舊路怎麼走。` He points to the field ridge, hunter
  walkway, and old camp before explaining that a traveler may have left traces.
- `看到什麼就記什麼，沒看到也記下一筆。這東西已經夠會誤導人了。連水漬都想冒充山脈。`
  He taps the paper corner rather than presenting the joke as a polished maxim.

Avoid:

- Sharp scholar arrogance.
- Abstract exposition about "truth" or "history".
- Acting as if he already knows what the player must discover.
- Saying only system terms like index, category, or preparation.
- Speaking as a riddle.
- Making every line a paper joke or a three-sentence monologue.
- Using rambling as disguised world exposition.
- Repeating self-correction until the player cannot trust his competence.
- Giving a tangent no route back to the immediate problem.

As first-run losses accumulate, his voice does not become a different
personality. The extra helpful sentence, object humor, and conversational warmth
gradually disappear. He answers only what is necessary, chooses words more
slowly, and keeps working. That absence should let the player feel how close he
is to no longer being able to continue.

## Story-System Notes

- He should be tied to the traveler handbook and clue records.
- Encyclopedia framing can use him, but he should not become an omniscient
  database narrator.
- Main quest objectives involving him should feel like evidence lookup, not
  mission assignment.
- When he gives directions, he must explain the basis: old road, tax route,
  repair note, missing-person entry, supply order, or a mismatch between old
  paperwork and current evidence.
- His first-run emotional decline should be reflected in dialogue and town-humanity
  records after Mia's operation.
- The first-run field summary, source pages, and broken forceps are scene props,
  not inventory rewards or inherited second-run objects.
- Second-run evidence triggers should change his lookup path without requiring
  freeform questions.

## Open Questions

- Does the expedition list contain any later NPC family connections beyond
  Mia's father?
- Final clothing, habitual hand movement, and layered-expression details remain
  for the dialogue-art pass. No personal relic or additional archive crisis is
  required for his completed base-campaign arc.

## Do Not Do

- Do not make him a historian recording tragedy from above.
- Do not make him an oracle.
- Do not make him withhold clear objectives for fake mystery.
- Do not add stolen documents or hidden sabotage without a complete future payoff.
- Do not make him responsible for the old expedition.
- Do not erase his Chapter 5 causal contribution by describing him as a purely
  passive observer who only understands the contraction after Mia dies.
- Do not turn the shortened summary into fraud, stupidity, or sole blame. Its
  danger comes from a reasonable field format crossing an untested boundary.
- Do not kill him simply to raise stakes.
