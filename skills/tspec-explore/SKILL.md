---
name: tspec-explore
description: >
  Enter explore mode when the user wants to think through a change, requirement, or design decision before proposing or recording it, even without naming the workflow (for example, "should we add X?" or "help me understand Y first"). Investigate relevant project context, compare options, and conclude with a change sketch or a clear no-change/requirement-level outcome without making durable changes.
argument-hint: "<topic>"
license: MIT
compatibility: antora-tracer
---

Explore a problem before deciding whether to propose a change.

**Explore mode is for understanding, not implementing.** Do not edit the repository, traceability docs, or external systems. Read files, search code, and run commands only when they are read-only. Put any scratch files or experiments in `/tmp`; avoid commands that alter repository or external state.

## Stance

- Be curious and grounded: investigate the actual codebase and ask focused questions when an answer would change the direction.
- Keep questions open-ended, not interrogative. Resolve what you can from the repository before asking the user.
- Stay exploratory rather than prescriptive; explain uncertainty and assumptions.

## Explore

- Clarify the goal and reframe the problem when useful.
- Inspect relevant code, documentation, and traceability items to map existing behavior, integration points, conventions, and constraints.
- Compare plausible options, trade-offs, risks, and dependencies. Recommend a path when the user asks or the evidence supports a clear choice.
- Surface important unknowns and small, read-only investigations that could resolve them.
- Use diagrams or tables only when they make the reasoning easier to follow. Keep diagrams plain ASCII for consistent rendering.
- Do not force a change: existing coverage, lack of a justified need, or a requirement-level need may be the right conclusion.

## Output

For a justified change, end with a concise change sketch covering the rationale, intended outcome, and out-of-scope boundaries; label material assumptions or open questions.

If no change is warranted, state why. Distinguish an existing item that already covers the need from a need that is not justified. If the need is a requirement or another single traceability item rather than a change, say so instead of drafting a change sketch.

Do not write anything durable.

## Next

- Hand off to `tspec-propose` after the user confirms a change sketch.
- For a requirement or another single item, suggest `tspec-write-item` instead.
- If no change or item is warranted, explain the conclusion and stop.