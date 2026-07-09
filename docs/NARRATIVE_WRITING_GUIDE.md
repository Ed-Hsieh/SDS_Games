# Narrative Writing Guide

Last updated: 2026-07-08

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
- Keep each paragraph or runtime narration beat to two to four sentences.
  Alternate longer sensory sentences with very short beats to create pauses and
  pressure.
- Use uneven sentence rhythm. Mix long sensory sentences with very short beats.
  Short Chinese beats of three to five characters are welcome when they create
  pressure.
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
4. Put only clear task wording in the objective UI or quest ledger.

Do not write a polished novel draft in a document and then ship only shortened
NPC instructions. If the scene needs the cracked bell, damp paper, the elder's
pause, or the scholar's desk to make sense, those details belong in the runtime
dialogue sequence.

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
