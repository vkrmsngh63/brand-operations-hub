# W#1 next session — Keyword Clustering

**Written:** 2026-06-04-b (rewritten at the end of `session_2026-06-04-b_w1-h1-slice-2-manual-edit-recording` — H-1 slice 2 shipped; this file now queues H-1 slice 3). Initial population 2026-05-19-g-7. Future W#1 sessions update this file at end-of-session per HANDOFF_PROTOCOL §4 Step 1.

**For:** the next W#1 (Keyword Clustering graduated tool) re-entry session.

**Queued next task:** **H-1 SLICE 3 — the Action-History UI tab** (the next slice of the H-1 action-history epic in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`) — a chronological, filterable list in the workspace reading the GET `/api/projects/[projectId]/audit-events` endpoint, making the recorded AI + manual history VISIBLE for the first time. **This is the director's confirmed (a.141) RECOMMENDED-NEXT pick (§4 Step 1c, 2026-06-04-b — "H-1 slice 3 — History screen (Recommended)").** The primary `./resume` pointer `docs/NEXT_SESSION.md` is also written for H-1 slice 3.

> **NOTE (2026-06-04-b — H-1 SLICE 2 now ✅ DONE + VERIFIED):** recording MANUAL edits at the server save-points shipped + was director-verified on real Chrome (commit `8fcc3fd`, one deploy to `main`; real topic renames on project `c270927b-0241-445d-a648-c36c9887b934` landed 5 new `[manual] UPDATE_TOPIC_TITLE` rows — alongside slice 1's 22 `[ai]` rows = 27 total; director PASS). It added NEW `src/lib/audit-recorder-server.ts` (a best-effort, non-throwing in-route inserter; the server counterpart to slice 1's client recorder) + extended `src/lib/audit-payload.ts` (+3 event types `UPDATE_KEYWORD`/`ADD_PATHWAY`/`REMOVE_PATHWAY`; + pure `topicUpdateEvents()` + `keywordUpdateEvents()`; +13 node:test) + instrumented 10 real manual routes + 2 future-proof orphaned routes (`canvas/sister-links` + `canvas/pathways` — NO client caller; driven only by the AI rebuild pipeline). Recording is best-effort + POST-COMMIT (OUTSIDE the mutation transaction) so a recorder failure can never roll back a user's edit. **NO schema change** (reused the existing `AuditEvent` table). See `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 (slice 2 ✅ DONE).

> **NOTE (2026-06-04 — H-1 SLICE 1 ✅ DONE + VERIFIED):** the action-history recorder foundation + AI-run recording shipped + was director-verified on real Chrome (commit `8bad366`, one deploy to `main`; a live Auto-Analyze run landed 22 `AuditEvent` rows; director "Done"). It added NEW `src/lib/audit-payload.ts` (the W#1 audit-event vocabulary + builders; +10 node:test) + `src/lib/audit-recorder.ts` (best-effort batched client sender) + the route `src/app/api/projects/[projectId]/audit-events/route.ts` (POST validate+insert / GET history) + `AutoAnalyze.tsx` wiring. **KEY as-built (Rule 3):** the shared `AuditEvent` table ALREADY existed in BOTH `prisma/schema.prisma` (line 715) AND the live DB (added 2026-05-06, commit `701775f`, UNUSED since) — so slice 1 shipped with **NO schema change**, and W#1 records via its OWN keyword-clustering route, NOT the library `useEmitAuditEvent()` hook. See `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 (slice 1 ✅ DONE).

> **NOTE (2026-06-03-h — M-2 ✅ DONE):** W#1 polish item **M-2 (Auto-Analyze cost forecasting + spend cap + out-of-credit handling)** shipped + was director-verified (commits `129cfcb` + `ab24154`). See `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` M-2 (✅ DONE).

> **NOTE (2026-06-03-f — platform-wide change touched W#1, NOT via this pointer):** W#1's `AutoAnalyze.tsx` model picker was migrated to the central AI-model registry by **P-63 Phase 1** (a platform-wide consolidation developed on `workflow-2-competition-scraping`, NOT a W#1 backlog session). The picker now reads its models via `getModelsForMenu('keyword-clustering')` (6 models, Sonnet 4.6 default preserved — byte-identical behavior); inline `AA_PRICING` → `aaPrice()` off the central `MODEL_PRICING`; thinking routed through `anthropicAdapter.mapThinkingOption`. This is plumbing only — no behavior change, no W#1 backlog item closed. The H-1 queued task below is UNAFFECTED. See `docs/AI_MODEL_REGISTRY.md` (site #3 = W#1 consumer) + `docs/polish-item-specs/P-63-central-ai-model-registry-self-serve.md`.

---

## Branch

`main`

W#1 is graduated and lives on `main` per Rule 22. Verify with `git branch --show-current` immediately after `./resume-workflow 1`; should be `main`. If you're on a `workflow-N-<slug>` branch, STOP and surface to director.

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it.
Today's task: return to Workflow #1 (Keyword Clustering) — H-1 SLICE 3 (the Action-History UI tab), the next slice of the H-1 action-history epic per `KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 entry. This is a graduated-tool re-entry session, NOT a transition session. Verify branch state with `git branch --show-current` before any doc reads — should be `main`.

Per HANDOFF_PROTOCOL.md Rule 22 (Graduated-Tool Re-Entry Protocol):

1. Run the mandatory start-of-session sequence (Group A docs + branch verification per CLAUDE_CODE_STARTER.md Step 2).
2. Additionally load these Group B docs:
   - `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` (read fully — canonical small/stable artifact downstream consumers reference)
   - `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (read fully — the H-1 entry has the slice-by-slice status; slices 1 + 2 ✅ DONE, slice 3 = (c) below)
   - `docs/KEYWORD_CLUSTERING_ARCHIVE.md` (skim table of contents; load specific STATE blocks only when needed — the Archive is ~4600 lines and intentionally not loaded by default)
   - **`src/app/api/projects/[projectId]/audit-events/route.ts`** (the existing GET endpoint the UI tab will read — reuse it; do NOT re-create it)
   - **`src/lib/audit-payload.ts`** (the event vocabulary `UPDATE_TOPIC_TITLE` / `MOVE_TOPIC` / `UPDATE_KEYWORD` / etc. the UI must render into plain human labels)
3. Per Rule 21, scan ROADMAP.md + DATA_CATALOG.md for any director directives addressed to W#1 captured since slice 2. The `AuditEvent` data item is LIVE in DATA_CATALOG §4.10 (now recording AI runs + manual edits).
4. Per Rule 23, run a Change Impact Audit before any code change. **NOTE (Rule 3, established slices 1 + 2): the `AuditEvent` table ALREADY exists + the GET `/audit-events` endpoint already returns recent history — slice 3 is a PURE READ and expects NO schema change, very likely NO new route.** Classify Read-only (rendering existing rows; breaks no consumer).
5. **H-1 SLICE 3 scope — the Action-History UI tab:** a read-only, chronological, filterable list in the workspace / AST panel that fetches from the GET `/api/projects/[projectId]/audit-events` (newest-first), maps each `AuditEvent` row's `eventType` to a plain human label via a pure helper, and renders the agreed columns + filters (by source [AI vs manual], by change type, possibly by time/run-batch). Reuse the existing GET + `src/lib/audit-payload.ts` vocabulary — do NOT re-create the recorder, the route, or the table. Put the label-mapping + filter logic in a pure, node:tested helper.
6. **Plan the slice-3 UI SHAPE WITH the director via a Rule 14f forced-picker BEFORE coding** (per `feedback_plan_output_shape_before_building` — this is a USER-FACING SCREEN, so confirm audience/plain-labels + columns + filters + placement before any component code). Add node:test coverage for the pure label-mapping + filter logic.
7. Produce the drift check with this added context. Wait for go-ahead. The FUTURE slice after slice 3 = (d) the per-action undo design + engine (design WITH the director before build; will need before-state enrichment that slice 2 left as after-only snapshots). An informational follow-up: recording AI-sourced keyword archives (`auto-ai-detected-irrelevant`) that slice 2's manual-only scope left out.

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

H-1 was picked as the initial queued item because it's the highest-priority OPEN entry in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (under "🚨 HIGH priority"). As of 2026-06-04-b, H-1 slices 1 (the recorder foundation + AI-run recording) and 2 (manual-edit recording at the server save-points) are both ✅ DONE + director-verified, so this pointer now queues **H-1 slice 3 (the Action-History UI tab — the visible history screen)** — the director's confirmed (a.141) §4 Step 1c pick ("H-1 slice 3 — History screen (Recommended)"). H-1 remains the active epic (slice 4+ = the per-action undo engine). The director may legitimately want to do a different W#1 task instead — see "How to override" above.
