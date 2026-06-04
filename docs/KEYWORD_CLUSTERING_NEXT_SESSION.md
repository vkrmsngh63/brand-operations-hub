# W#1 next session — Keyword Clustering

**Written:** 2026-05-19-g-7 (initial population — created alongside the `./resume-workflow 1` enhancement to make W#1 re-entry roadmap-driven rather than interactive-prompt-driven; future W#1 sessions update this file at end-of-session per HANDOFF_PROTOCOL §4 Step 1).

**For:** the next W#1 (Keyword Clustering graduated tool) re-entry session.

**Queued next task:** **H-1 — Action history table + per-action undo** (highest-priority OPEN item in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`). Estimated 3-5 sessions; largely additive; doesn't gate downstream workflows. **This is the director's confirmed (a.139) RECOMMENDED-NEXT pick (§4 Step 1c, 2026-06-03-h).** The primary `./resume` pointer `docs/NEXT_SESSION.md` is also written for H-1.

> **NOTE (2026-06-03-h — M-2 now ✅ DONE):** W#1 polish item **M-2 (Auto-Analyze cost forecasting + spend cap + out-of-credit handling)** shipped + was director-verified on real Chrome (commits `129cfcb` + `ab24154`, two deploys to `main`). It added the pure helper `src/lib/cost-estimator.ts` (+19 node:test) wired into `AutoAnalyze.tsx`. See `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` M-2 (✅ DONE). H-1 below is the next W#1 item.

> **NOTE (2026-06-03-f — platform-wide change touched W#1, NOT via this pointer):** W#1's `AutoAnalyze.tsx` model picker was migrated to the central AI-model registry by **P-63 Phase 1** (a platform-wide consolidation developed on `workflow-2-competition-scraping`, NOT a W#1 backlog session). The picker now reads its models via `getModelsForMenu('keyword-clustering')` (6 models, Sonnet 4.6 default preserved — byte-identical behavior); inline `AA_PRICING` → `aaPrice()` off the central `MODEL_PRICING`; thinking routed through `anthropicAdapter.mapThinkingOption`. This is plumbing only — no behavior change, no W#1 backlog item closed. The H-1 queued task below is UNAFFECTED. See `docs/AI_MODEL_REGISTRY.md` (site #3 = W#1 consumer) + `docs/polish-item-specs/P-63-central-ai-model-registry-self-serve.md`.

---

## Branch

`main`

W#1 is graduated and lives on `main` per Rule 22. Verify with `git branch --show-current` immediately after `./resume-workflow 1`; should be `main`. If you're on a `workflow-N-<slug>` branch, STOP and surface to director.

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it.
Today's task: return to Workflow #1 (Keyword Clustering) — start H-1 (Action history table + per-action undo) per `KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 entry. This is a graduated-tool re-entry session, NOT a transition session. Verify branch state with `git branch --show-current` before any doc reads — should be `main`.

Per HANDOFF_PROTOCOL.md Rule 22 (Graduated-Tool Re-Entry Protocol):

1. Run the mandatory start-of-session sequence (Group A docs + branch verification per CLAUDE_CODE_STARTER.md Step 2).
2. Additionally load these Group B docs:
   - `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` (read fully — canonical small/stable artifact downstream consumers reference)
   - `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (read fully — H-1 entry has the work-split breakdown)
   - `docs/KEYWORD_CLUSTERING_ARCHIVE.md` (skim table of contents; load specific STATE blocks only when needed — the Archive is ~4600 lines and intentionally not loaded by default)
3. Per Rule 21, scan ROADMAP.md + DATA_CATALOG.md for any director directives addressed to W#1 captured since graduation.
4. Per Rule 23, run a Change Impact Audit before any code change: identify affected data items (`AuditEvent` is a new table; `useEmitAuditEvent()` currently a stub no-op), look up downstream consumers in DATA_CATALOG.md Cross-Tool Data Flow Map §7.2.1, classify the change (Additive for H-1 — new optional `AuditEvent` table doesn't break any consumer; downstream tools can read or ignore).
5. Walk director through H-1's 4-part work split:
   - **(a) `AuditEvent` schema** — per-action audit row with op type, payload, timestamp, user, before/after state.
   - **(b) Wire `useEmitAuditEvent()` to real DB inserts** in operation-applier paths (every ADD_TOPIC / MOVE_KEYWORD / etc.).
   - **(c) Action History UI tab in the AST panel** — chronological list of every op with filter/search.
   - **(d) Per-action undo DESIGN SESSION BEFORE build** — some ops easy reverses (ADD_TOPIC ↔ DELETE_TOPIC); others compose nontrivially (SPLIT_TOPIC, MERGE_TOPICS with auto-reparenting). Director-confirmed design session must precede build per Rule 18 mid-build directive Read-It-Back.
6. Pick which slice of (a)-(d) to ship in this session via Rule 14f forced-picker — small + reversible + audit-table-first is the conservative shape (schema + minimal wiring; UI + undo follow in subsequent sessions).
7. Produce the drift check with this added context. Wait for go-ahead.

## How to override

If H-1 isn't what you want to do this W#1 session:
- **Edit this file before running `./resume-workflow 1`.** Replace the H-1 references in the `Queued next task` line + `Launch prompt` section above with whatever item from `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` you want (M-1.a / M-1.b / M-1.c / M-2 / M-3 / L-1..L-5 / C-1..C-7 / Z-1) or a freeform task.
- **OR — tell Claude in your CURRENT session "update KEYWORD_CLUSTERING_NEXT_SESSION.md to queue <task>"** before exiting, and Claude will rewrite this file for you.
- **OR — use the escape-hatch path** (manual 3-step `cd + git checkout main + claude + paste launch prompt`) and paste a custom launch prompt directly.

## How items get queued here

Per HANDOFF_PROTOCOL §4 Step 1 W#1-additional-row (NEW 2026-05-19-g-7):
- When you (director) add a new W#1 polish item to the backlog and pick "do it next session" at the timing forced-picker, Claude updates this file with the new task.
- When a W#1 session completes work on a polish item, the end-of-session protocol either:
  - Picks the next-highest-priority OPEN item from the polish backlog as the new queued task, OR
  - Fires the §4 Step 1c "No obvious next task" forced-picker if multiple equally-priority items remain.

## Why this pointer was written this way (debug aid)

Initial population 2026-05-19-g-7. The director's directive that triggered creating this file (verbatim): *"I don't want to tell the session what item to work on. I want it to check the roadmap to know what the next item on the roadmap is. Normally I simply tell you to add new fixes, features, etc to the roadmap and then you give me choices on when we should tackle them (for example right away or at some later point). So please tell me exactly what I should type in the terminal to have you know where to pick up from with full context and instructions based on the roadmap for each workflow."*

H-1 was picked as the initial queued item because it's the highest-priority OPEN entry in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (under "🚨 HIGH priority") and has been queued at top since graduation 2026-05-12 without anyone yet starting it. The director may legitimately want to do a different W#1 task instead — see "How to override" above.
