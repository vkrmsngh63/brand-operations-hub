# W#1 next session — Keyword Clustering

**Written:** 2026-06-04-c (rewritten at the end of `session_2026-06-04-c_w1-h1-slice-3-context-gap-paused` — H-1 slice 3 [the Action-History UI tab] is BUILT + DEPLOYED but ⏸️ PAUSED on a director-caught context-quality gap; this file now queues H-1 slice 4 [before-state enrichment + the History context fix]). Initial population 2026-05-19-g-7. Future W#1 sessions update this file at end-of-session per HANDOFF_PROTOCOL §4 Step 1.

**For:** the next W#1 (Keyword Clustering graduated tool) re-entry session.

**Queued next task:** **H-1 SLICE 4 — before-state enrichment + the History context fix** (the next slice of the H-1 action-history epic in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`) — capture the before-state + a human-anchorable identity (WHICH topic/keyword) for AI operations during the apply pass so the EXISTING History panel + `describeEvent()` renderer can show full from→to + which-item context. **This is the director's EXPLICITLY-named next task (§4 Step 1c did NOT fire — verbatim: *"let's end session here and pick up with the current issue we were working on next session."*).** The primary `./resume` pointer `docs/NEXT_SESSION.md` is also written for H-1 slice 4.

> **NOTE (2026-06-04-c — H-1 SLICE 3 ⏸️ PAUSED on a context-quality gap):** the Action-History UI tab is BUILT + DEPLOYED (shipped LAST turn as `7356ea4` the read-only filterable grouped `HistoryPanel.tsx` + the pure node:tested `audit-labels.ts` wired into `KeywordWorkspace.tsx`; `5f7aba0` the follow-up — one plain "What happened" sentence via `describeEvent()` + before-state capture for FUTURE manual edits; combined 9 files +1166/-31; both on `main` + ping-pong-synced). The director reviewed it on real Chrome and REJECTED it as still insufficient (verbatim: *"No, this functionality needs a lot of improvement. There is still no context and no column for prior state. For example, one line states 'Renamed topic to "Bursitis — ...". This tells us very little. Which specific topic? What was the topic title before? etc."*). **Root cause:** the AI's changes + the 27 older rows are AFTER-ONLY snapshots (the before-state was never captured for AI ops — the pure operation-applier exposes no per-op diffs, `src/lib/audit-payload.ts` lines 22-27); the `5f7aba0` from→to fix covers only future MANUAL edits; a rename row lacks a stable human-anchorable identity. **The fix = slice 4 (this queued task):** enrich the AI apply pass to capture before-state + which-item — the SAME enrichment the future per-action Undo needs. **The 27 existing after-only rows CANNOT be backfilled** — slice 4 fixes FUTURE recordings only. See `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 (c) ⏸️ PAUSED + (d) the slice-4 requirement + `docs/CORRECTIONS_LOG.md` §Entry 2026-06-04-c.

> **NOTE (2026-06-04-b — H-1 SLICE 2 ✅ DONE + VERIFIED):** recording MANUAL edits at the server save-points shipped + was director-verified (commit `8fcc3fd`; 5 new `[manual] UPDATE_TOPIC_TITLE` rows on real topic renames — alongside slice 1's 22 `[ai]` rows = 27 total). NEW `src/lib/audit-recorder-server.ts` + extended `src/lib/audit-payload.ts` (+3 event types + `topicUpdateEvents()` + `keywordUpdateEvents()`; +13 node:test); best-effort + POST-COMMIT so a recorder failure can never roll back a user's edit; NO schema change. See `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 (slice 2 ✅ DONE).

> **NOTE (2026-06-04 — H-1 SLICE 1 ✅ DONE + VERIFIED):** the action-history recorder foundation + AI-run recording shipped + was director-verified (commit `8bad366`; 22 `AuditEvent` rows on a live Auto-Analyze run). NEW `src/lib/audit-payload.ts` + `src/lib/audit-recorder.ts` + the route `src/app/api/projects/[projectId]/audit-events/route.ts` + `AutoAnalyze.tsx` wiring. The shared `AuditEvent` table ALREADY existed (no schema change); W#1 records via its OWN route, NOT the library `useEmitAuditEvent()` hook. See `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 (slice 1 ✅ DONE).

> **NOTE (2026-06-03-h — M-2 ✅ DONE):** W#1 polish item **M-2 (Auto-Analyze cost forecasting + spend cap + out-of-credit handling)** shipped + was director-verified (commits `129cfcb` + `ab24154`). See `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` M-2 (✅ DONE).

---

## Branch

`main`

W#1 is graduated and lives on `main` per Rule 22. Verify with `git branch --show-current` immediately after `./resume-workflow 1`; should be `main`. If you're on a `workflow-N-<slug>` branch, STOP and surface to director.

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it.
Today's task: return to Workflow #1 (Keyword Clustering) — H-1 SLICE 4 (before-state enrichment + the History context fix), the next slice of the H-1 action-history epic per `KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 entry. This is a graduated-tool re-entry session, NOT a transition session. Verify branch state with `git branch --show-current` before any doc reads — should be `main`.

Per HANDOFF_PROTOCOL.md Rule 22 (Graduated-Tool Re-Entry Protocol):

1. Run the mandatory start-of-session sequence (Group A docs + branch verification per CLAUDE_CODE_STARTER.md Step 2).
2. Additionally load these Group B docs + code:
   - `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` (read fully — canonical small/stable artifact downstream consumers reference)
   - `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (read fully — the H-1 entry has the slice-by-slice status; slices 1 + 2 ✅ DONE, slice 3 ⏸️ PAUSED on the context gap = (c), slice 4 = the bundled (d) requirement)
   - `docs/KEYWORD_CLUSTERING_ARCHIVE.md` (skim table of contents; load specific STATE blocks only when needed — the Archive is ~4600 lines and intentionally not loaded by default)
   - **`src/lib/audit-payload.ts`** (esp. the lines 22-27 design note on why the pure applier exposes no per-op diffs today — THIS is the file slice 4 enriches so AI ops emit before-state + a human-anchorable identity)
   - **`src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx`** (`doApplyV3` — where AI ops are applied + recorded; slice 4 enriches the per-op payload here)
   - **`src/lib/audit-labels.ts`** (`describeEvent()` — the plain-English renderer that ALREADY exists; confirm what fields it can render once the data carries before-state + which-item)
   - **`src/app/projects/[projectId]/keyword-clustering/components/HistoryPanel.tsx`** (the deployed read-only panel — do NOT rebuild it)
3. Per Rule 21, scan ROADMAP.md + DATA_CATALOG.md for any director directives addressed to W#1 captured since slice 3. The `AuditEvent` data item is LIVE in DATA_CATALOG §4.10 with a KNOWN DATA-COMPLETENESS LIMITATION note (before-state for AI ops is after-only today — slice 4 fixes this).
4. Per Rule 23, run a Change Impact Audit before any code change. **NOTE: slice 4 enriches the recorded `payload` JSON (a `before` value + a human-anchorable identity) into the EXISTING `AuditEvent.payload` column — anticipated NO schema change, NO new route.** Classify Additive (richer payload; breaks no consumer — the GET + the panel already tolerate extra payload fields).
5. **H-1 SLICE 4 scope — before-state enrichment + the History context fix:** enrich the AI apply pass (`doApplyV3` + the `aiOperationEvent`/`aiBatchEvents` builders in `src/lib/audit-payload.ts`) so each recorded AI op's `payload` carries `before` + a human-anchorable identity (a stable topic/keyword id + a readable name) alongside the existing `after`. Reuse the existing recorder, route, table, and `describeEvent()` renderer — do NOT re-create them. Put any new pure diff/identity logic in a node:tested helper. Verify `describeEvent()` renders the richer payload as full from→to + which-item (extend it only if needed). **The 27 existing after-only rows cannot be backfilled — confirm WITH the director whether to leave them or mark them "recorded before full context was available."**
6. **Plan the slice-4 PLAN WITH the director via a Rule 14f forced-picker BEFORE coding** (per `feedback_plan_output_shape_before_building`): which AI ops carry a before-state + identity; how the apply path exposes the before-state (thread the pre-apply snapshot through `doApplyV3` vs have the applier emit diffs); the human-anchorable identity to record; whether to mark/hide the old after-only rows. Add node:test coverage for the pure before-state/identity logic.
7. Produce the drift check with this added context. Wait for go-ahead. **Director real-Chrome verification target: confirm a FRESH AI run + a FRESH hand edit both produce History rows that read in full from→to + which-item context** (the old 27 rows will stay thin — that's expected). The FUTURE slice after slice 4 = the per-action undo engine (it reuses slice 4's before-state). An informational follow-up: recording AI-sourced keyword archives (`auto-ai-detected-irrelevant`) that slice 2's manual-only scope left out.

## How to override

If H-1 isn't what you want to do this W#1 session:
- **Edit this file before running `./resume-workflow 1`.** Replace the H-1 references in the `Queued next task` line + `Launch prompt` section above with whatever item from `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` you want (M-1.a / M-1.b / M-1.c / M-3 / L-1..L-5 / C-1..C-7 / Z-1) or a freeform task.
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

H-1 was picked as the initial queued item because it's the highest-priority OPEN entry in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (under "🚨 HIGH priority"). As of 2026-06-04-c, H-1 slices 1 (the recorder foundation + AI-run recording), 2 (manual-edit recording), and 3 (the Action-History UI tab) are all built + deployed, but the director reviewed slice 3 on real Chrome and (correctly) found it reads too thin — the AI's changes + the older rows were recorded after-only, so the screen can't show "which topic" or the "before" value. So this pointer now queues **H-1 slice 4 (before-state enrichment + the History context fix)** — the director's EXPLICITLY-named next task (*"pick up with the current issue we were working on next session"*). H-1 remains the active epic (the per-action undo engine follows slice 4 and reuses its before-state). The director may legitimately want to do a different W#1 task instead — see "How to override" above.
