# Agent Update Protocol

Last updated: 2026-07-08

This document defines how future Codex or agent sessions update project notes,
handoffs, and progress records. Use this as the formatting contract before
creating or editing any planning document.

## Purpose

Keep every agent working from the same documentation shape:

- Runtime JS/data remains the source of truth for implemented behavior.
- Markdown documents explain direction, constraints, and handoff state.
- New planning files are avoided unless no existing authoritative document can
  hold the information cleanly.
- Progress updates are written only when the user explicitly asks for a handoff
  or checkpoint. When written, they use fixed status, priority, and validation
  fields so another session can continue without reinterpreting free-form notes.

## Manual Documentation Trigger

Default behavior: do not update progress Markdown during ordinary implementation.

Update `docs/AGENT_SESSION_LOG.md` or other progress/checkpoint notes only when
the user explicitly asks for one of these actions:

- Record current progress.
- Update the handoff.
- Save unfinished work for the next session.
- Summarize current state into project files.
- Modify documentation rules or authoritative planning documents.

If work leaves useful context but the user did not ask for a checkpoint, mention
the context briefly in the final response instead of editing documentation.

Do not treat every code, data, asset, or balance change as a reason to update
Markdown. The documentation layer is a manual handoff system, not an automatic
development log.

## Do Not Create New Planning Docs By Default

Before adding a new `.md` file, check this routing table and update the existing
document that owns the topic:

| Topic | Update This File |
| --- | --- |
| Town state, broken town recovery, NPC return, facility gates | `docs/TOWN_REBUILD_CONVERGENCE.md` |
| Chapter titles, Lv1-Lv70 bands, quest placement, reward/source planning | `docs/CHAPTER_QUEST_FRAMEWORK.md` |
| Mainline suspense, screenwriting rules, character arcs, character entry/exit, story-to-system adaptation | `docs/MAIN_STORY_BIBLE.md` |
| Narrative voice, prose rules, NPC dialogue, side-story tone, multi-speaker staging | `docs/NARRATIVE_WRITING_GUIDE.md` |
| Casino showcase route, owner side quest, ticket/prize direction | `docs/CASINO_ROUTE_FRAMEWORK.md` |
| Equipment series, weapon-form quadrants, affinity/group positioning | `docs/EQUIPMENT_SERIES_FRAMEWORK.md` |
| Visual rules, approved style references, image hierarchy | `docs/ART_STYLE_GUIDE.md` |
| Copy-ready prompts and category prompt standards | `docs/IMAGE_GENERATION_PROMPTS.md` |
| Old systems, obsolete art/data/docs, compatibility leftovers | `docs/OBSOLETE_CLEANUP_PLAN.md` |
| Latest checkpoint, next resume task, verification commands | `docs/AGENT_SESSION_LOG.md` |
| Documentation format and update rules | `docs/AGENT_UPDATE_PROTOCOL.md` |

Only create a new planning document when the topic is truly new and would make an
existing document confusing. If a new authoritative document is created, also
update:

- `docs/README.md`
- `AGENTS.md`
- `docs/AGENT_SESSION_LOG.md`, when the resume context changes
- `scripts/BetaConvergenceCheck.mjs`, when the document must be verified

## Required Header

Every authoritative Markdown file must start with this structure:

```markdown
# Document Title

Last updated: YYYY-MM-DD
```

Use the current local date. Keep the title stable after the document becomes
authoritative.

## Fixed Status Terms

Use only these status labels in progress records:

- `planned` - accepted direction, not started.
- `in_progress` - active implementation or writing pass.
- `blocked` - cannot continue without user input or external state.
- `paused` - intentionally stopped by current project priority.
- `deferred` - valid, but later than current milestone.
- `done` - completed and validated enough for the current phase.
- `removed` - deleted or intentionally retired.

Do not invent near-synonyms such as "todo", "maybe", "wip", "complete-ish",
or "later".

## Fixed Priority Terms

Use only these priority labels:

- `P0` - blocks the current active rebuild direction.
- `P1` - should be handled in the current milestone.
- `P2` - useful follow-up after the active milestone.
- `P3` - backlog or polish.

## Fixed Progress Item Format

Use this format for concrete work items:

```markdown
- [status] [P#] [area] Short task title
  Owner file(s): `path/or/module.js`
  Source of truth: `path/or/data.js`
  Validation: `command or manual check`
  Notes: One concise sentence explaining context or edge cases.
```

Rules:

- Keep the first line short enough to scan.
- Use one work item per bullet.
- If the task is data-only, `Owner file(s)` and `Source of truth` can point to
  the same file.
- If validation is not available yet, write `Validation: pending`.

## Fixed Session Log Format

`docs/AGENT_SESSION_LOG.md` must keep this section order:

```markdown
## Current Direction

## Completed In Recent Passes

## Current Runtime Status

## Next Good Step

## Next Resume Task

## Verification Commands
```

Rules:

- Update the session log only when the user explicitly asks for a handoff or
  progress checkpoint.
- Keep it as a checkpoint, not a diary.
- Replace `Next Resume Task` when the actual next task changes.
- Do not append long historical timelines. Move durable direction into the
  relevant authoritative document instead.

## Fixed Implementation Handoff Format

Use this format inside `Next Resume Task` or a dedicated handoff section:

```markdown
## Next Resume Task

Continue with ...

Target result:

- ...

Suggested implementation files:

- `path/to/file.js`

Validation:

- `command`

Out of scope:

- ...
```

Keep `Out of scope` explicit when combat, tower, image generation, mobile UI, or
other paused topics should not be pulled into the next pass.

## Fixed Cleanup Item Format

Use this format inside `docs/OBSOLETE_CLEANUP_PLAN.md`:

```markdown
- [status] [P#] `path/or/pattern`
  Reason: Why this is obsolete.
  Safe when: Concrete condition that makes removal safe.
  Follow-up: What must be updated after removal.
  Validation: Check that confirms nothing still depends on it.
```

Never delete a legacy path only because it looks old. The cleanup item must say
what proves it is obsolete.

## Fixed Image Prompt Category Format

Use this format inside `docs/IMAGE_GENERATION_PROMPTS.md` when adding a prompt
category:

```markdown
## Category Name

Use for:

Style line:

Composition line:

Prompt template:

Reference examples:

Quality notes:
```

Boss-drop equipment prompts must mention the matching boss-held or boss-worn
object when the item comes from a boss.

## Update Workflow

Follow this sequence only when the user asks for documentation or checkpoint
updates:

1. Read `AGENTS.md` and `docs/README.md`.
2. Choose the existing authoritative document that owns the topic.
3. Update runtime JS/data first when the change affects game behavior.
4. Update only the related Markdown files.
5. Update `docs/AGENT_SESSION_LOG.md` only when resume context changes.
6. If an authoritative document is added or removed, update
   `scripts/BetaConvergenceCheck.mjs`.
7. Run the relevant validation command and record the command name when useful.

## Source Of Truth Rule

When Markdown and runtime data disagree:

- Runtime JS/data wins for current behavior.
- Markdown should be updated to reflect the intended direction.
- If the runtime is intentionally not updated yet, mark the item as `planned`,
  `in_progress`, `paused`, or `deferred` instead of describing it as complete.

## Forbidden Patterns

Do not:

- Create random `OPEN_TASKS.md`, `TODO.md`, `ROADMAP_NEW.md`, or duplicate
  planning files for topics already routed above.
- Update `AGENT_SESSION_LOG.md` after every implementation step.
- Spend ordinary development time maintaining a running Markdown diary.
- Add mobile UI requirements unless the user explicitly resumes mobile work.
- Reintroduce `art-v2` as a long-term fallback strategy.
- Pull combat redesign, tower rewrite, or image generation into a pass where the
  session log says they are paused.
- Keep obsolete compatibility layers alive just to avoid touching the core flow.
- Record progress without owner files and validation notes.
