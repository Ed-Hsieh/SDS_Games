# Narrative Writing Guide

Last updated: 2026-07-16

## Purpose

This is the authoritative writing guide for SDS_Games narrative prose, NPC
dialogue, quest story copy, side stories, town events, world landmark text, and
multi-speaker scenes.

Runtime JS/data remains the source of truth for shipped behavior. This document
defines the intended narrative voice and authoring rules that future story data
should follow.

## Narrative North Star

Write as a novelist, not as a task generator.

The goal is to build a long-running fantasy RPG story that can keep players
curious through plot, character desire, secrets, atmosphere, and later payoff.
Side stories may use fantasy, romance, mystery, historical memory, survival, or
other tones as long as they stay inside the world and support the larger work.

A quest should not feel like a checklist with dialogue wrapped around it. It
should leave the player with at least one of these:

- A stronger reason to care about a person.
- A clearer sense of what changed in town.
- A clue that makes a route, monster, boss, or object feel less random.
- A small mystery or emotional texture that can echo later.

For mainline suspense, chapter-level reveals, long-form character arcs, and
screenwriting structure, use `docs/MAIN_STORY_BIBLE.md`. This guide owns the
voice and prose quality; the story bible owns the larger plot architecture.

## Prose Rules

- Runtime narrative prose uses first-person perspective by default. Write as
  `我`, not as an external narrator saying `你`, unless the line is direct NPC
  speech.
- Paragraph and sentence length follow the dramatic need. Do not enforce a
  fixed two-to-four-sentence paragraph, and do not insert short sentences merely
  to satisfy a rhythm formula.
- Vary rhythm deliberately. Action and danger may tighten into short lines;
  discovery, intimacy, grief, and observation may breathe through longer
  sentences. A short line earns its place by changing pressure, focus, or
  meaning.
- Use concrete images and sensory details: sound, hand movement, light, mud,
  metal, cloth, smell, breath, wet paper, old wood, dust. Prefer these over
  abstract praise, abstract emotion, or explanatory mood labels.
- Avoid flat, balanced, explanatory sentence patterns. Do not make every scene
  read like a report.
- Break patterned structures. Do not use mechanical transitions such as
  `首先`, `其次`, `最後`, `不僅...而且...`, or other list-like essay scaffolding
  in prose scenes.
- Avoid common AI-sounding phrases and summary moves, including `總而言之`,
  `彷彿`, `令人嘆為觀止`, and repeated moralizing lines such as `你忽然明白`.
- Also forbid modern essay filler such as `在當今社會中` and
  `這是一段...的旅程`.
- Use concrete senses beyond sight: smell, dampness, ash, cloth texture, boot
  grit, metal noise, breathing, distant voices, old wood, cold stone.
- Do not over-explain emotion or cause-and-effect. Let the player feel the gap.
- Scene transitions can be direct. Avoid always starting with patterns like
  `當...的時候`.
- Do not repeat the same opening structure across town-memory or landmark text.
  Each place should have its own trace, sound, smell, or human residue.
- Keep story paragraphs purposeful. A short sharp paragraph is often better than
  a decorative one.

## Storytelling Craft Prompt

Use this reusable prompt before drafting or revising player-facing story text.
It adapts the practical principles in StorytellingDB's `Storytelling 101` to the
current game and does not replace the accepted screenplay causality.

> 把這個場景寫成玩家能親身走進去的黑暗奇幻小說。不得改動已定案的
> 劇情事件、角色知識邊界、目標、世界規則與結果。動筆前先確認場景的
> 戲劇目的：視角人物此刻想得到什麼、什麼正在阻礙他、結束前發生了
> 什麼實質變化、哪個問題會把讀者帶往下一幕。所有行動都必須承接前因，
> 不能因為任務需要或巧合而突然發生。讓空間、天候、聲音、氣味、觸感、
> 工具與人留下的痕跡真正限制或推動人物；場景不是背景板。透過選擇、
> 反應、迴避、沉默與每個人不同的說話方式呈現性格，不要直接解釋角色。
> 場景容許時，把外在危機和人物自身或關係中的壓力疊在一起。重要情緒
> 要用行為與感官證據讓玩家看見；只有不值得停留的轉場與背景資訊才概述。
> 節奏服從意義：動作可以壓縮，後果可以停留，句子與段落可以自由伸縮，
> 不遵守固定格式。維持既定視角，只揭露該視角有可能知道的事。場景應在
> 真正的變化、決定、發現、代價或更尖銳的未知之後結束。保留言外之意；
> 角色不會方便地說出全部想法，旁白也不替故事宣布主題。刪除重複已知
> 資訊、只為顯得文藝、或無法推動劇情、人物、環境、衝突與後續回收的句子。

Revision questions:

- Can the scene's immediate desire and resistance be named in one sentence?
- Does each beat follow from the previous beat, or does the plot simply order it
  to happen?
- What is observably different at the end of the scene?
- Does the protagonist make, refuse, or prepare a meaningful choice?
- Is the setting changing what people can do, rather than only decorating them?
- Are important feelings visible in action, voice, silence, or physical detail?
- Does dialogue contain personality, friction, misunderstanding, concealment, or
  subtext instead of clean exposition?
- Is exposition arriving because the present action needs it?
- Does the final beat open a relevant question or consequence without using an
  artificial cliffhanger?
- Can any sentence, paragraph, title, or sensory image be removed with no loss?

## Title Rules

Story titles are promises and memory anchors, not database labels.

- Title the dramatic object, choice, wound, contradiction, or unanswered image
  the player will remember. Prefer a concrete noun or action over an abstract
  mood.
- A title may withhold meaning, but the scene must eventually make that meaning
  legible. Mystery is not permission for unrelated poetic wording.
- Avoid titles that merely restate the objective, chapter number, location name,
  system function, or outcome.
- Avoid interchangeable fantasy phrases built from words such as darkness,
  fate, oath, burial, awakening, echo, or scar unless that exact image is present
  and causally important in the scene.
- Read the title after the scene. If it could label three other scenes without
  changing meaning, replace it.
- Runtime ids remain stable technical identifiers. A player-facing title may be
  revised without renaming the id.

## Runtime Viewpoint Contract

The master story bible is omniscient planning, but shipped scene prose is not an
unrestricted omniscient narrator. Every runtime scene must declare one of these
closed viewpoint modes:

- `protagonist_limited`: default playable view. Player-visible narration uses
  first person `我` and may describe only what the protagonist senses, remembers,
  does, or reasonably infers.
- `character_limited:<id>`: the protagonist is absent. The audience follows one
  named character and receives only that character's current knowledge,
  perception, spoken self-talk, or internal voice.
- `split_limited`: the scene cuts between `protagonist_limited` and one explicitly
  named `character_limited` view, then clearly returns. The metadata must state
  the order.
- `witnessed_memory`: the protagonist directly experiences a bounded memory
  performance. Information shown here may become protagonist knowledge after the
  memory ends.
- `audience_montage`: an external montage may show simultaneous places and
  visible actions, but it cannot expose unspoken motives or hidden cosmology.

Do not use unrestricted omniscience as a shortcut. If no character could know a
fact yet, keep it in planning notes until a later reveal.

Character-limited tragedy cutaways follow this contract:

1. The first run may leave the protagonist behind so the audience can understand
   why a character accepts danger or death.
2. The cutaway reveals motive and immediate perception, not the complete world
   mechanism or the second-run rescue answer.
3. Audience knowledge does not automatically become protagonist knowledge. It
   cannot open an objective, handbook conclusion, dialogue option, or route flag
   until the protagonist discovers equivalent evidence inside the current run.
4. Use a visible and audible transition into the cutaway and an equally clear
   return. Do not let pronouns silently switch owners.
5. Prefer quiet spoken self-talk when it suits the character. Internal voice is
   allowed, but it must sound like that character rather than an explanatory
   narrator.
6. The second run reveals the missing cause through current-run action, evidence,
   or witnessed memory. It does not simply replay the first-run cutaway with more
   exposition.

The current 66-scene review draft still contains second-person `你` as staging
shorthand. Before runtime migration, convert every `protagonist_limited` player-
visible narration beat to first-person `我`. Stage actions and metadata may use
`player` or `protagonist`; NPC dialogue keeps its natural grammatical person.

## Quest And Objective Clarity

Novelistic prose must still tell the player what to do.

- NPC dialogue should give concrete direction in character. If the player must
  visit three landmarks, the dialogue should make that understandable before the
  player opens a ledger.
- Quest ledger objective copy can be structured and clear. It does not need to be
  as literary as scene prose.
- Commission or task content may use lists when clarity matters.
- Do not let a character talk only about abstract systems such as indexes,
  categories, or preparation if the quest needs an immediate action.
- If a task unlocks through a clue, the clue must be visible in dialogue,
  landmark text, town change, or the ledger. Avoid hidden-only intent.

## Runtime Scene Template

Accepted story prose must be visible in the actual game, not only in planning
notes.

For quest-opening and quest-report scenes, write in this order:

1. Define the screenplay beat: why the scene happens, what changed from the
   previous scene, who is present, what tension or clue moves forward, and what
   the player must do next.
2. Write the scene as prose with narration and character dialogue together.
3. Convert the prose into runtime dialogue lines:
   - Use `speaker: 'narration'` for scene description, sensory prose, physical
     action, and internal framing. These lines must not show a speaker title or
     portrait in the UI.
   - Use NPC speaker lines only for spoken dialogue. Character names may appear
     in the dialogue header or speaker tag, but narration should not pretend to
     be said by the NPC.
   - Keep narration and dialogue in the same runtime sequence so the player
     experiences the complete scene inside the game.
   - Consecutive narration, action, and scene-description beats form one
     continuous prose block. They may contain paragraph breaks, but the player
     does not click between them. Character speech remains one deliberate line
     at a time so speaker changes and reactions retain timing.
   - Split a narration block only when control, viewpoint, location, visible
     participant state, or dramatic time genuinely changes. Do not split it to
     manufacture rhythm in the UI.
4. Put only clear task wording in the objective UI or quest ledger.

Do not write a polished novel draft in a document and then ship only shortened
NPC instructions. If the scene needs the broken road marker, damp paper, the
elder's pause, or the scholar's desk to make sense, those details belong in the
runtime dialogue sequence.

## Layered Dialogue Scene Metadata

The current dialogue portraits contain baked-in backgrounds and are temporary.
The future presentation will compose a scene from independent background,
character, expression, and UI layers. That runtime and art rebuild is deferred
until the complete master screenplay is accepted.

While writing the screenplay, each scene must preserve enough intent for that
later composition. Record these fields at scene level or on the relevant beat:

- `background`: a stable location/state id when known, or a concise working
  description when the final asset does not exist.
- `participants`: every visible character required by the scene.
- `speaker`: the active speaker for a spoken line; narration has no portrait.
- `expression`: the visible emotional state for the active character when it
  differs from the carried state.
- `enter` and `exit`: presentation changes within the scene, separate from
  durable map or town relocation.
- `poseOrLightingNote`: optional and used only when a story beat cannot be
  communicated by the reusable expression set alone.
- `worldState`: optional broken, recovering, repaired, weather, time, or chapter
  state when it materially changes the background.
- `viewpoint`: one closed runtime viewpoint mode. `split_limited` must name the
  exact order of views.
- `knowledgeBoundary`: required for `character_limited`, `split_limited`,
  `witnessed_memory`, and `audience_montage`; state what the audience learns,
  what the protagonist learns, and what remains hidden.
- `storyCg`: optional id or working description for a rare full-scene
  illustration beat. Use it only when the composition itself carries a major
  story payoff that ordinary dialogue layers cannot replace.

Dialogue art uses one closed vocabulary of at most nine reusable expressions:

- `neutral`: ordinary conversation and listening.
- `soft`: warmth, affection, tenderness, or quiet reassurance.
- `pleased`: humor, a smile, satisfaction, or visible relief.
- `guarded`: caution, seriousness, suspicion, or masking emotion.
- `resolute`: determination, command, focus, or accepted responsibility.
- `angry`: hostility, frustration, accusation, or open confrontation.
- `afraid`: fear, shock, panic, or startled vulnerability.
- `grieving`: sorrow, crying, mourning, or emotional loss.
- `hurt`: injury, exhaustion, illness, or physical collapse.

The screenplay may retain more precise semantic emotion words, but those words
must alias to one of these nine reusable visual slots. Do not add a tenth
portrait expression; use an existing alias or an approved `storyCg` for a true
one-off climax. Individual supporting characters may use fewer than nine. Do not
plan one generated portrait per line.

Rare emotional climaxes may use `storyCg` instead of expanding the closed
portrait set.
Accepted future examples include the flower field in Ailo's true-ending memory
and Frey's final moment holding the standard. A story CG is a one-off full-scene
illustration, not a dialogue portrait and not a reusable location background.
Record the need in the script, but do not generate it before the screenplay is
accepted.

Script completion must not wait for art. Missing backgrounds or expression
variants remain asset requirements derived from accepted scenes; they are not a
reason to shorten, rewrite, or postpone the scene.

## Master Screenplay Block Format

Every fully written scene in `docs/MAIN_STORY_BIBLE.md` must use the same block.
Do not invent a shorter chapter-specific format.

Required metadata:

- `stageClass`: one of `regional_canvas`, `location_scene`, `town_scene`, or
  `memory_or_ending`.
- `background`: stable id when accepted, otherwise `working:` plus one concise
  visual description.
- `worldState`: chapter, time, weather, damage/recovery state, and run difference
  only when visible.
- `viewpoint`: one value from the closed Runtime Viewpoint Contract.
- `participants`: all visible character ids; narration-only scenes use `none`.
- `entry`: how the scene begins and which participant is already present.
- `exit`: how the scene releases control and where the player returns.
- `objective`: the clear player action opened or completed by the scene.
- `inputs`: required current-run flags and approved achievement-memory gates.
- `outputs`: flags, relationship records, handbook entries, town/place states,
  and service changes caused by the scene.
- `assetNotes`: reuse, missing background/expression, or deferred CG needs. This
  field records work; it never authorizes image generation by itself.

After metadata, write one runtime-order table:

| Field | Allowed Content |
| --- | --- |
| `Order` | Stable integer sequence inside the scene. |
| `Condition` | `any`, `first_run`, `second_run`, or one explicit flag/achievement condition. Avoid prose logic. |
| `Beat` | `narration`, `speaker`, `enter`, `cutaway`, or `exit`. `cutaway` changes viewpoint without ending the scene. |
| `Speaker` | Character id for `speaker`; `-` for narration and stage actions. The current review draft may use second-person staging shorthand, but final `protagonist_limited` runtime narration must use first-person `我` without imposing a portrait or biography. |
| `Expression` | One of the nine closed expressions for a visible speaker; `-` for narration, enter, and exit. |
| `Runtime Text / Stage Action` | Final player-visible prose or a concise entry/exit action. Planning explanation does not belong here. |

Use one row per displayed beat. Do not hide required prose in metadata. Do not
repeat quest rewards inside dialogue when the visible world change already
communicates them. Run-specific rows replace or supplement the adjacent `any`
beat only when the condition is explicit.

## Spoken Dialogue Realism Contract

Dialogue is not a collection of beautiful lines. A character speaks because a
specific person, problem, object, or decision is in front of them now. The line
must first sound like something that person would actually choose to say; style
and memorable phrasing are secondary.

Every spoken beat must obey these rules:

- Start from the speaker's identity, current purpose, relationship distance,
  and present physical situation.
- Ask why the line must be spoken now. Delete or relocate a line that exists only
  because the audience needs lore, a system explanation, or a character summary.
- Let information arrive through ordinary questions, partial answers, evidence,
  correction, hesitation, and disagreement. Do not compress a setting briefing
  into one convenient speech.
- A character may state only what they currently know or reasonably infer. The
  screenplay's omniscient knowledge must not leak into hints, expressions, or
  strangely precise warnings.
- Put care into concrete instructions, preparation, exchanged objects, and
  practical choices. Prefer `明早再去。晚上會看不清路。` to a declaration
  that the listener is too important to lose.
- Do not disguise system data, material behavior, evidence synthesis, or
  service availability as figurative dialogue. Treatment, repair, route
  evidence, and stock should be explained with concrete actions and immediate
  consequences a person would actually say aloud. Personification and crafted
  metaphors are allowed only when that character's accepted voice explicitly
  uses them in that situation.
- Spoken dialogue is literal first. An ordinary speaker must describe what was
  observed: an object's position, direction, condition, change, or consequence.
  Do not give an inanimate subject a human or animal action merely to compress
  atmosphere into the line. Write `黑色樹根一路向北延伸` instead of
  `地下的根往北走`; write `麻痺還沒有完全退` instead of making medicine
  `壓住` a symptom. Figurative wording belongs in narration, or in the speech
  of a character whose accepted voice and immediate situation explicitly
  justify it.
- Before accepting any spoken beat, identify its grammatical subject and verb.
  If a road walks, a root searches, paper wants, medicine remembers, a door
  stands guard, or another object performs an intentional action, rewrite the
  line as a physical observation. Approved character-specific jokes and Ailo's
  deliberately disordered speech are the only current Chapter 1 exceptions;
  exceptions must not spread into another character's voice.
- Avoid polished symmetry, aphorisms, quotable morals, and lines that sound
  written to advertise the character. A memorable line must grow out of the
  immediate action rather than announce a theme.
- Use pauses, gaze, hand movement, distance, tools, and object handling to carry
  emotion the character would not say aloud. These actions must either perform
  work or reveal a choice; do not attach decorative gestures to every line.
- Do not let narration restate the emotion already carried by dialogue or
  action. If a hand remains on the map, the narration need not explain that the
  elder is worried.
- Keep dialogue and action as separate runtime beats. Spoken text belongs to the
  character; physical action and scene observation belong to narration without
  a speaker label.

Expression continuity follows the same causal rule:

- An expression represents the visible state a character is allowing others to
  see, not every emotion implied by the sentence.
- Do not change expression merely because the speaker or line changed. Carry the
  current expression until an observable event, realization, decision, or loss
  changes it.
- Warm behavior does not automatically require `soft`. A neutral face may carry
  concern through a better lamp, a tightened bandage, or a chair moved closer.
- Strong expressions must be earned by the scene. Do not use them early to
  reveal fear, grief, suspicion, or affection the character is still masking.

Before accepting a spoken line, answer:

1. What does this character want from the listener right now?
2. What does the character know, and what remains unknown?
3. Would this person say the line aloud, or show it through action instead?
4. Is the information arriving because the present exchange needs it?
5. Could the same line be spoken unchanged by another character? If so, restore
   the speaker's role, habits, relationship, and material world.
6. What specifically caused the assigned expression, and should it persist into
   the next beat?

## Character Voice

Every recurring NPC needs a distinct speaking posture.

- Humor is character-based, not a default tone.
- A practical NPC should sound practical even when afraid.
- A scholar can be sharp, fussy, or dry, but should still give useful direction.
- A village leader can hold back fear without becoming a generic quest board.
- Do not flatten every NPC into the same calm narrator.
- Relationship and town-humanity records should preserve what the player has
  already experienced. They should not expose future hints as if they were UI
  advice.

## Side Story Rules

Side stories are allowed to be more adventurous than simple errands.

### Mainline Character Ownership

The main story must make every core character understandable without optional
content. Side stories deepen a character; they never repair missing mainline
causality or emotional setup.

Apply the skip test before approving any character route:

> If the player skips every optional side story, can they still understand who
> this character is, what they fear and want, why they make the decisive choice,
> and what changed by the end of each run?

If the answer is no, move the required beat into the main screenplay.

Mandatory mainline ownership for a core character includes:

- A lived introduction that is more than a service menu.
- Core desire, fear, value, and contradiction shown through action.
- At least one relationship that does not exist only through the protagonist.
- Every clue required to understand a fixed death, rescue, betrayal, route, or
  ending.
- The decisive choice and a visible first-run/second-run endpoint performance.

Optional side stories may own:

- Daily work, friendship, romance, humor, habits, and private memories.
- Additional relationship warmth or tension.
- A local town-state or revisit variant that is not required by the main plot.
- Extra context that changes emotional intensity but not basic comprehension.

Do not hide a rescue condition, route key, villain escalation, or final choice
inside optional content. Rewards for optional character stories are assigned
only after their map location and owning system are locked.

Allowed tones include:

- Local mystery.
- Broken-town survival.
- Romance or unspoken affection.
- Old history and inherited guilt.
- Family, debt, trust, rumor, or civic repair.
- Strange fantasy objects, curses, bargains, and folklore.

Rules:

- Keep side stories grounded in existing world logic.
- Do not create new monsters, materials, factions, or systems casually. If a
  story needs one, record the downstream content needs before implementation.
- Medium and long side stories should have a story-matched reward or gameplay
  result, such as access, a service change, a recipe, equipment, information, or
  a durable town-state shift.
- Avoid fake choices and fake consequences. If a consequence is introduced, it
  should be used later or clearly stay local.

## Multi-Speaker Scene Rules

Multi-speaker dialogue should feel like staged story, not a list of names.

Supported scene beats should include:

- `narration`: describes the immediate situation, weather, sound, smell, arrival,
  silence, or physical action.
- `speaker`: a character line with portrait, name, and role.
- `enter`: a character temporarily enters the scene presentation.
- `exit`: a character leaves the scene presentation.

These beats should also carry the layered scene metadata above whenever the
background, visible participants, or expression changes.

Do not physically move a town or map NPC icon for every scene. Use a temporary
event stage layer for most appearances:

- Ordinary event: narration plus active speaker portrait is enough.
- Important event: show temporary participant portraits or stand-ins; active
  speaker brightens and inactive speakers recede.
- Durable story change: only then update the real town/map NPC position or
  availability.

This keeps story presentation expressive without confusing the player's mental
map of where NPCs actually are.

## World And System Coupling

Story should connect to systems instead of floating above them.

- Landmarks should not be only monster popups. They can carry clues, traces,
  route logic, local memory, resource context, or boss convergence.
- Bosses are major clues and chapter convergence points, not only combat checks.
- Town changes should read like lived changes, not abstract reward statements.
- NPC appearances should connect to function when appropriate: forge, market,
  route safety, clue records, casino temptation, or service recovery.
- Dungeon stories should explain why the dungeon matters to preparation, gear,
  local history, or a side route.

## Prohibited Patterns

Do not:

- Write quests as only `go to A, do B, return C` without a stronger reason.
- Use repeated template openings for memory, landmark, or town-state copy.
- Summarize every scene with a lesson.
- Hide the actual objective behind abstract flavor.
- Add unsupported materials, items, monsters, NPCs, or factions just to make a
  sentence sound richer.
- Move real NPC map positions for temporary dialogue unless the world state truly
  changed.

## Authoring Checklist

Before accepting new narrative copy, check:

- Does the player know what to do?
- Is the viewpoint declared, and does every fact belong to that viewpoint?
- If the audience sees something the protagonist does not, is the knowledge
  boundary explicit and prevented from opening gameplay state early?
- Does at least one character sound specific?
- Does the scene include concrete sensory detail?
- Is there any unnecessary explanation that could be removed?
- Does the text avoid repeated openings and AI-sounding summary lines?
- Does the scene connect to a clue, town state, route, monster ecology, item
  source, relationship, or future payoff?
- Does any new noun require a new asset, item, monster, material, NPC, or system?

## Ownership

- Use this file for narrative voice, prose rules, dialogue staging, and
  side-story tone.
- Use `docs/MAIN_STORY_BIBLE.md` for mainline suspense, screenwriting rules,
  character arcs, character entry/exit, and story-to-system adaptation.
- Use `docs/CHAPTER_QUEST_FRAMEWORK.md` for chapter placement, quest spine,
  level bands, boss convergence, and reward/source planning.
- Use `docs/TOWN_REBUILD_CONVERGENCE.md` for town-state recovery, NPC return,
  facility gates, and town service wiring.
- Use runtime data such as `QuestStories.js`, `NPCDialogues.js`,
  `WorldStories.js`, and quest databases as the source of truth for implemented
  story behavior.
