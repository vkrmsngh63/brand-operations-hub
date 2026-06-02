<!--
WORKFLOW CONTINUITY PRIMER — TEMPLATE
Copy this file to docs/<TOOL>_PRIMER.md when a workflow graduates and fill every
[BRACKET]. This is the "map + pointers" doc (per HANDOFF_PROTOCOL Rule 33): it
states WHAT is built and POINTS to the always-current deep docs — it does NOT
duplicate them (duplication drifts; pointers don't). Keep it SHORT (~1-2 screens).
The catch-up command (`./catch-up-workflow <N>`) tells a future session to read
THIS file first, so it is the single front door back into the workflow.
-->

# [WORKFLOW NAME] (W#[N]) — Continuity Primer

**Read this first when returning to W#[N] to fix or extend it.** It is the map; the
docs it links are the territory. After reading this + the docs it points you to,
you should be able to continue the workflow seamlessly from where it was left.

**Graduated:** [DATE] · **Branch:** `[BRANCH]` · **Live at:** [URL/surface]
**Status source-of-truth (current baselines, open items):** `docs/ROADMAP.md` + `docs/CLAUDE_CODE_STARTER.md` header (do NOT trust any numbers hard-coded below — read those for the live counts).

---

## 1. What this workflow IS (one paragraph)

[Plain-English: what the workflow does for the user, end to end.]

## 2. What is CODED into it (the surfaces — high level, not exhaustive)

- **App pages:** [list the user-facing routes + one-line purpose each] → code under `[dir]`.
- **Behind-the-scenes endpoints:** [count + the directory] → `[dir]`.
- **Shared logic / helpers:** [the lib directory + the few load-bearing modules].
- **Browser extension (if any):** [purpose + where source/tests live].
- **Saved-data shapes (database models):** [model names] in `prisma/schema.prisma`.

## 3. POINTERS — the deep docs (always current; load as the task needs)

| If you need… | Read |
|---|---|
| Full **functionality** / design intent | [design docs, e.g. `docs/<TOOL>_DESIGN.md`] |
| Full **code** map / data contract | [`docs/<TOOL>_DATA_CONTRACT.md` / archive] |
| The **rules** we followed | `docs/HANDOFF_PROTOCOL.md` + `docs/CLAUDE_CODE_STARTER.md` (+ workflow-specific §s) |
| **Mistakes we wanted to avoid** | `docs/CORRECTIONS_LOG.md` ([which entries / date range]) |
| Per-feature **specs** (verbatim director asks) | `docs/polish-item-specs/[P-NN-*]` |
| **Verification** history / known-deferred bugs | [`docs/<TOOL>_VERIFICATION_BACKLOG.md`] |
| Operating memory (how the director collaborates) | `/home/.../memory/MEMORY.md` (background only; verify before acting) |

## 4. How to safely CHANGE it (the guardrails)

- Branch: do W#[N] work on `[BRANCH]`; deploy to `main` only via the Rule 9 gate.
- Before coding: Rule 3 (code wins over docs — verify against source), Rule 23 (Change Impact Audit if data shapes move), Rule 14f (forced-picker for real decisions).
- Tests/baselines to keep green: [where they live] — read `docs/CLAUDE_CODE_STARTER.md` header for the current pass counts, then `/scoreboard` before any deploy.
- Schema changes: additive + `prisma db push` only with explicit director authorization (Rule 8/9).

## 5. OPEN items at graduation (what's left / deferred)

- [List the OPEN / deferred items with their ROADMAP IDs, or "none — fully closed."]
- Canonical open-items list: `docs/ROADMAP.md` (search "W#[N]" / the polish-item IDs).

---

**Re-entry command:** `./catch-up-workflow [N]` (switches to `[BRANCH]`, pulls, and launches a session pointed at this primer). See HANDOFF_PROTOCOL Rule 33.
