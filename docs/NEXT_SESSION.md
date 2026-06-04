# Next session

**Written:** 2026-06-04 (`session_2026-06-04_w1-h1-slice-1-action-history-recorder` — **W#1 (Keyword Clustering) polish H-1 (action history + per-action undo) — SLICE 1 of a 3–5 session epic — ✅ DEPLOYED-AND-VERIFIED on real Chrome (director ran Auto-Analyze on project `c270927b-0241-445d-a648-c36c9887b934`; 22 `AuditEvent` rows confirmed; director "Done").** The session ran entirely on `main` (W#1 is graduated and lives on `main` per Rule 22); the build `8bad366` was committed directly on `main` (no workflow-branch ff-merge), pushed `416cb6c..8bad366`, and ping-pong synced to `workflow-2-competition-scraping` (both branches at `8bad366`). **SLICE 1 = the recorder foundation + AI-run recording:** NEW `src/lib/audit-payload.ts` (the pure W#1 audit-event vocabulary + `{eventType, payload}` builders; +10 node:test) + `src/lib/audit-recorder.ts` (a best-effort, non-throwing, batched client sender) + the route `src/app/api/projects/[projectId]/audit-events/route.ts` (POST validates eventType against the vocab + inserts `AuditEvent` rows; GET returns recent history) + `AutoAnalyze.tsx` wiring (`doApplyV3` records every applied AI op, one batch per apply pass, fire-and-forget — never blocks or fails the run). **KEY Rule 3 finding:** the shared `AuditEvent` table ALREADY existed in BOTH `prisma/schema.prisma` (line 715) AND the live DB (added 2026-05-06, commit `701775f`, UNUSED since) — so slice 1 shipped with **NO schema change**, and W#1 records via its OWN keyword-clustering route, NOT the library `useEmitAuditEvent()` hook. **Advances (a.139)** = W#1 H-1 (ADVANCED, NOT closed — slice 1 of 3–5 shipped + verified; (a.139) stays OPEN as the epic). **§4 Step 1c forced-picker FIRED → (a.140) RECOMMENDED-NEXT = W#1 H-1 SLICE 2 — record MANUAL edits at the ~10 server save-points.** **The next session RUNS ON `main`; start command `./catch-up-workflow 1` (or `./resume`).** **FIRST action next session = read `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 (slice-2 note) + reuse `src/lib/audit-payload.ts` + the `audit-events` route, then PRESENT the slice-2 scope to the director BEFORE coding** per `feedback_plan_output_shape_before_building`.)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This session is `session_2026-06-04` — the FIRST session of 2026-06-04 (NO suffix); the prior session was `session_2026-06-03-h` (the EIGHTH + last of 2026-06-03). The harness `currentDate` = 2026-06-04. **Next session: keep trusting the harness `currentDate`; do NOT regress to a 2026-06-03 suffix and do NOT invent a suffix ahead of the harness.** The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session.

> ⚠️ **BRANCH: next session runs on `main`.** The (a.140) pick is W#1 H-1 slice 2 — W#1 is graduated and lives on `main` per Rule 22. **Start command: `./catch-up-workflow 1`** (the Rule 33 graduated-W#1 re-entry — switches to `main` + prints `docs/KEYWORD_CLUSTERING_PRIMER.md`) — OR `./resume` (reads THIS file) OR `./resume-workflow 1` (reads `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md`, which also queues H-1 slice 2). Confirm `git branch --show-current` shows `main` immediately after entry.

> ⚠️ **BRANCH STATE — NOTHING IS HELD. BOTH BRANCHES ARE AT `8bad366`.** The build `8bad366` was committed directly on `main` and ping-pong-synced to `workflow-2-competition-scraping`; after this end-of-session doc-batch commits on `main` + syncs, both branches sit at the doc-batch SHA. **Expect `git log origin/main..HEAD --oneline` to be EMPTY at entry** (the normal graduated-workflow steady state). If it is NOT empty, something did not sync as expected — investigate before coding.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry — and slice 2 ALSO expects NO schema change.** Slice 1: NO → STAYED NO → NO at exit (the `AuditEvent` table pre-existed; verified via `information_schema`). **Slice 2 (manual-edit recording) reuses the SAME existing `AuditEvent` table → NO new schema, NO `prisma db push`.** If anything unexpectedly seems to need a schema change, STOP, run the Rule 23 Change Impact Audit, and get an explicit Rule 9 deploy gate before any `prisma db push` (additive only; never `migrate reset` against prod).

> ⚠️ **NO OWED DEPLOY, NO OWED VERIFICATION carried in.** Slice 1 was director-verified PASS on real Chrome (22 `AuditEvent` rows on a live Auto-Analyze run; "Done"). Nothing is held back; there is no stranded commit and no unverified surface carried into next session.

> ⚠️ **H-1 IS A MULTI-SESSION EPIC (~3–5 sessions) — slice 1 done; slice 2 = manual edits.** Next session does ONLY slice 2 (record manual edits at the server save-points), NOT the whole epic. The Action-History UI tab (slice 3) + the per-action undo design + engine (slice 4+) follow in later sessions. Per `feedback_plan_output_shape_before_building`, confirm the slice-2 scope WITH the director BEFORE coding.

> ⚠️ **W#2 IS COMPLETE — do NOT reopen it.** W#2 (Competition Scraping) graduated 2026-06-03 and its entire residue (P-26 / P-27 / P-53) is formally retired won't-do — FULLY EMPTY. Do NOT author new W#2 work unless the director explicitly asks. The deferred W#2 Archive/Data-Contract split + the finalized-HRL Data Capture Interview stay intentionally held until W#3 needs to read W#2 data.

> ⚠️ **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) is a FUTURE task, NOT next session.** Captured verbatim in `docs/polish-item-specs/P-63-central-ai-model-registry-self-serve.md` §1 (2026-06-03-g) + §7. Fire it ONLY when the director wants a non-Anthropic model live AND supplies that provider's API/SDK docs. Do NOT start it unprompted.

---

## What we did this session (in plain terms)

We started Workflow #1's "action history" feature — the permanent record of every change made during an analysis.

**The history recorder is now live for AI runs.** When you run Auto-Analyze, every change the AI makes (creating topics, moving keywords, splitting, merging, and so on) is now permanently written to the database as it happens — instead of the old in-memory list that vanished when the overlay closed. You ran a real analysis on the real site and we confirmed 22 history rows landed in the database, and you said "Done." This recording is "best-effort" by design: if the recorder ever hiccups, it never slows down or breaks your analysis.

**A pleasant surprise saved us a database change.** The plan was to build a new "history table" in the database this session. When we checked, that table already existed — it had been quietly added months ago for a different workflow and never used. So we just started using it. That meant no database change at all this session, which is the safest possible outcome.

**We deliberately split the feature.** There's a second half — recording the changes YOU make by hand (not just the AI). When we looked closely, those manual edits happen in more places than expected, and the most reliable way to record them is on the server side at the "save" points. Rather than rush a ten-place change into one session, you chose to ship the AI-run recording now (done + verified) and do the manual-edit recording next session.

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (the W#1 live backlog) + `docs/COMPETITION_SCRAPING_PRIMER.md` §5 (the W#2 residue table — now FULLY EMPTY) + `docs/polish-item-specs/P-63-*.md` + `docs/DATA_CATALOG.md` §6.1 (the deferred W#2 Data Contract).

- **(a.140) = W#1 H-1 slice 2 (record MANUAL edits at the server save-points)** — **NEXT SESSION (see below).** Reuses the existing `AuditEvent` table; NO schema change. On `main`.
- **(a.139) = W#1 H-1 (the action-history + undo epic)** — ADVANCED, NOT closed. Slice 1 ✅ DONE 2026-06-04; slices 2–4+ remaining. On `main`.
- **W#1 M-2 — ✅ DONE 2026-06-03-h** + **W#2 — ✅ COMPLETE 2026-06-03-h (residue fully retired)** + **P-63 Phase 2 / P-64 — ✅ DONE 2026-06-03-g** + **P-63 Phase 1 — ✅ DONE 2026-06-03-f** + **P-50 — ✅ DONE 2026-06-03-e** + **P-56 Option-2 — ✅ CLOSED (won't-do) 2026-06-03-e** + **P-43 — ✅ RESOLVED 2026-06-03-d.**
- **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) — FUTURE.** Fired when the director wants a non-Anthropic model live + supplies that provider's API docs. NOT a near-term item.
- **W#1's remaining live polish backlog** — after H-1: M-1 (3 server-side migrations), M-3 (validation-retry telemetry), L-1..L-5 low, C-1..C-7 carry-overs, Z-1 explicitly-last, P-1 passive prereq. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`. On `main`.
- **The deferred W#2 Archive/Data-Contract split + finalized-HRL Data Capture Interview** — held until W#3 starts and needs to read W#2 data. NOT a blocker.
- **(P-62, under Workflow 11)** "Post Launch Optimization & Surveillance" card + page — future-workflow.

## What we'll do next session (in plain terms)

1. **We record the changes you make by hand** during an analysis — the second half of the action-history feature. The AI's changes are already recorded (this session); next session adds your manual edits (creating/renaming/moving/deleting topics, adding/removing keywords, restoring removed ones).
2. **We do it on the server side at the "save" points** so the recording is reliable, and we make sure a recording hiccup can never roll back or break one of your edits. We skip the purely-cosmetic moves (dragging a node around, zooming, resizing) — those aren't worth recording.
3. **No database change is expected** — we reuse the same history table that's already there. We'll design the exact list of places to record with you first, then build + run the test scoreboard + get your go-ahead to deploy.

## What's still left in the total roadmap (in plain terms)

- **W#1 H-1 (action history + undo) — IN PROGRESS, the (a.139) epic.** Slice 1 (AI-run recording) done + verified; slice 2 (manual edits) is the (a.140) next pick; the visible History screen + the actual per-action Undo come in later slices. On `main`.
- **W#1's other polish** — M-1 (move a few things off the browser onto the server so you can pick up on any device), M-3 (retry-rate telemetry), plus a bundle of low-priority items. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`.
- **W#2 (Competition Scraping) — ✅ COMPLETE.** Graduated + every item shipped or formally retired. Re-entry via the primer + `./catch-up-workflow 2` only if you ever want to revisit.
- **P-63 (central AI-model registry) — Phase 2 ✅ DONE + live; Phase 3 (add ChatGPT + Gemini) is a future task** fired when you want a non-Anthropic model and give us its docs. **P-64 (drag-reorder) ✅ DONE.**
- **The deferred W#2 Data Contract** — held until W#3 needs to read W#2 data; NOT a blocker.
- **P-62 (NEW capture)** — the Workflow-11 surveillance card + page. Future-workflow.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started. W#3 kickoff is also the trigger to author the deferred W#2 Data Contract.
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**W#1 H-1 SLICE 1 ✅ DEPLOYED-AND-VERIFIED — 2026-06-04.** The action-history recorder foundation + AI-run recording; director-verified PASS on real Chrome (22 `AuditEvent` rows on a live Auto-Analyze run; "Done"). Both branches now at `8bad366`.

**Session shape (a single-feature build + one deploy):**

- **Build (`8bad366`, main `416cb6c→8bad366`, 5 files +487):** NEW `src/lib/audit-payload.ts` (162 LOC — the pure W#1 audit-event vocabulary: the 13 operation-applier op types + 3 manual-only CREATE/DELETE/RESTORE_KEYWORD + the `{eventType, payload}` builders `aiBatchEvents`/`manualEvent`/`aiOperationEvent`/`isKnownAuditEventType`; +10 node:test in `audit-payload.test.ts`) + NEW `src/lib/audit-recorder.ts` (55 LOC — a best-effort, non-throwing, batched [chunk 200] client sender `recordAuditEvents()` + `newAuditBatchId()`) + NEW route `src/app/api/projects/[projectId]/audit-events/route.ts` (128 LOC — POST records a batch [validates eventType against the vocab, skips unknowns, inserts `AuditEvent` rows] + GET recent-history newest-first) + MODIFIED `AutoAnalyze.tsx` (+16 — `doApplyV3` records every applied AI op, one batch per apply pass, after a committed rebuild; fire-and-forget). Director "Yes — deploy to main".

**TWO Rule 3 "code wins over docs" findings (INFORMATIONAL — NOT a slip):** (1) the H-1 backlog claimed there is no `AuditEvent` table — FALSE: the shared generic `AuditEvent` table already existed in BOTH the schema (line 715) AND the live DB (added 2026-05-06, commit `701775f`, during a W#2 build slice; UNUSED since); verified via a read-only `information_schema` query (all 7 columns present) — so **the anticipated additive schema change was UNNECESSARY; the slice collapsed to PURE CODE, NO schema change, NO db-push gate.** (2) W#1 does NOT use the library `useEmitAuditEvent()` hook (its own auth/userId flow in `page.tsx`; manual edits flow through `useCanvas.ts` + `useKeywords.ts`) — recording was implemented via a dedicated W#1 `audit-recorder.ts` + route, NOT the library hook (the stub stays a documented no-op).

**Schema-change-in-flight flag NO at entry → STAYED NO entire session → NO at exit (the table pre-existed). NEXT session (slice 2, manual edits) ALSO expects NO schema change (reuses the same table).**

**Rule 14f pickers fired this session:** the H-1 first-slice shape (start-recording-now); the record-scope pick (director first chose "both now"); the build-approach confirm; the mid-build pace re-pick (director chose "ship AI now, manual next" after the scattered-sites discovery); the Rule 9 deploy gate (director "Yes — deploy to main"); the §4 Step 1c next-pick (→ H-1 slice 2).

**ZERO open DEFERRED items at exit (Rule 26):** tasks #1–#5 completed; task #6 was a `DEFERRED:` task (H-1 slice 2 — record manual edits at the server save-points) — its content was migrated into `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 (slice-2 note) + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md`, then the task was closed. The remaining W#1 backlog items + the deferred W#2 Data Contract + P-62 are documented roadmap continuation, NOT TaskList DEFERRED items.

**EXIT baselines locked (verified post-deploy):** root tsc clean (UNCHANGED) + extension tsc clean (UNCHANGED — not re-run; no extension source touched) + extension `npm test` = **915/915 UNCHANGED** (not re-run; no extension change) + src/lib `node:test` = **1456** (+10 over 1446 — the new `audit-payload.test.ts`) + `npm run build` = **78 routes** (+1 over 77 — the new `/api/projects/[projectId]/audit-events` route); Check 6 Playwright SKIPPED per Rule 27 (verified by tsc + node:test + director real-Chrome PASS).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-06-04** (NO top-tier slip — a clean single-feature build session) capturing the TWO Rule 3 findings + the NEW REUSABLE PATTERN: *"When a feature's storage scaffolding may already exist from a prior workflow's build, verify BOTH the code (schema) AND the live-DB state (read-only `information_schema` query) before assuming a schema migration is needed — pre-existing scaffolding can collapse a 'build-the-table' slice into pure code and remove a Rule 9 db-push gate entirely."* **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** **NO new memory file this session.**

**Group B docs updated** — `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (H-1 slice 1 → ✅ DONE 2026-06-04 with an as-built note + slice 2 queued) + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (queue (a.140) = H-1 slice 2) + `docs/WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md` §3.10 (the first-audit-consumer refinement) + `docs/DATA_CATALOG.md` (the `AuditEvent` data item flipped from PLANNED to LIVE — W#1 first consumer). `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` UNCHANGED (NO v2 bump — no schema migration shipped; the table pre-existed).

**EIGHTY-THIRD end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ZERO `prisma db push`, ZERO `migrate reset`, ZERO drops, ZERO dev-data deletes (the `AuditEvent` table pre-existed — no migration). Read-only `information_schema` queries only. ONE deploy push (`8bad366` → `main` + ping-pong sync to `workflow-2-competition-scraping`), under an explicit director Rule 9 deploy gate. NO new memory file created; zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session).
- **NEXT session (W#1 H-1 slice 2):** records MANUAL edits at the ~10 server mutation routes — reuses the EXISTING `AuditEvent` table; expects NO schema change, NO `prisma db push`. If anything unexpectedly seems to need a schema change, STOP, run the Rule 23 Change Impact Audit (classify Additive) + get an explicit Rule 9 deploy gate before any `prisma db push` (additive only; never `migrate reset` against prod). Instrument best-effort and OUTSIDE the DB transaction so a recorder failure never rolls back a user's edit. No other Rule 8/9/29 triggers anticipated.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the W#1 continuity primer `docs/KEYWORD_CLUSTERING_PRIMER.md` + the NEW `src/lib/audit-payload.ts` + `src/lib/audit-recorder.ts` + `src/app/api/projects/[projectId]/audit-events/route.ts` + `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` + the memory directory + the `./catch-up-workflow` + `./resume-workflow` + `./resume` scripts.

---

## Branch

**`main`** — entered at start of next session. The (a.140) pick is W#1 H-1 slice 2 — W#1 is graduated and lives on `main` per Rule 22. **Start command: `./catch-up-workflow 1`** (the Rule 33 graduated-W#1 re-entry — switches to `main` + prints `docs/KEYWORD_CLUSTERING_PRIMER.md`) — OR `./resume` (reads THIS file) OR `./resume-workflow 1` (reads `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md`, which also queues H-1 slice 2). Verify with `git branch --show-current` immediately after entry; should be `main`.

**Expected branch state on entry** (after this session's end-of-session doc-batch commits on `main` + syncs): **`main` and `workflow-2-competition-scraping` are BOTH at the doc-batch SHA (both were at `8bad366` after the build; the doc-batch commits on `main` then ping-pong syncs — nothing is held back).** **Verify with `git log origin/main..HEAD --oneline` showing EMPTY** (the normal graduated-workflow steady state). `git status` clean apart from historical untracked .zip + .html artifacts at repo root. If `git log origin/main..HEAD` is NOT empty at entry, something did not sync as expected — investigate before coding.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- **`docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 — the FIRST read** (the slice-2 note; present the manual-edit-recording scope to the director).
- **`src/lib/audit-payload.ts` + `src/app/api/projects/[projectId]/audit-events/route.ts`** — the slice-1 as-built; REUSE these, do NOT re-create them.
- `docs/KEYWORD_CLUSTERING_PRIMER.md` (the W#1 continuity primer — the map of W#1's real surfaces, incl. `src/hooks/useCanvas.ts` + `src/hooks/useKeywords.ts` + the server mutation routes).
- `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` (read fully — the canonical small/stable artifact downstream consumers reference; NO v2 bump shipped this session).
- `docs/DATA_CATALOG.md` §4.10 (the `AuditEvent` data item — now LIVE, W#1 first consumer) + §7.2.1 (the Cross-Tool Data Flow Map — Change Impact Audit lookup).
- `docs/WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md` §3.10 (the first-audit-consumer refinement — why W#1 records via its own route, not the library hook).
- `docs/HANDOFF_PROTOCOL.md` Rule 3 (code wins over docs) + Rule 9 (deploy gate) + Rule 14f (forced-picker) + Rule 18 (mid-build Read-It-Back) + Rule 22 (graduated-tool re-entry) + Rule 23 (Change Impact Audit) + Rule 25 (multi-workflow) + Rule 26 + Rule 27 (verification) + Rule 30 (Session bookends) + Rule 31 + §4 Step 4b extended template.
- `docs/ROADMAP.md` — the W#1 polish-backlog references + the W#2 COMPLETE record + the total-roadmap summary.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-04 (this session — the two Rule 3 findings + the verify-both-code-AND-live-DB pattern) + §Entry 2026-05-31 (the TOP-TIER SLIP).
- **All existing memory files** — esp. `feedback_plan_output_shape_before_building.md` (confirm the slice-2 scope WITH the director before coding), `feedback_no_fabricated_instructions.md` (H-1 slice 2 is the confirmed (a.140) pick; do not invent scope; P-63 Phase 3 is FUTURE — do not start unprompted), `feedback_deferred_items_registry.md`, `feedback_default_to_recommendation.md` / `feedback_recommendation_style.md`, `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md`, `feedback_session_bookends_plain_summary.md`, `feedback_destructive_ops_confirmation.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; the FIRST read is `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 (the slice-2 note).** **This session runs on `main` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal ((a.140) = W#1 H-1 slice 2):** record **MANUAL edits at the server save-points** — the next slice of the H-1 action-history epic. Slice 1 (the recorder foundation + AI-run recording) shipped + was verified live last session. **THIS slice instruments the ~10 server mutation routes so a user's hand edits also land in the `AuditEvent` table:** canvas/nodes POST/PATCH/DELETE, keywords POST/PATCH + keywords/[id] PATCH/DELETE, removed-keywords POST, removed-keywords/[id]/restore, canvas/sister-links POST/DELETE. **FIRST action: read `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 (slice-2 note) + `src/lib/audit-payload.ts` + the `audit-events` route, then present the slice-2 scope to me in plain terms and let me confirm it BEFORE any coding** (per `feedback_plan_output_shape_before_building` + Rule 18). Do NOT start coding until I confirm.

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: main   (W#1 is graduated and lives on main)

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: EMPTY — main and workflow-2 are BOTH at the 2026-06-04 doc-batch SHA.
#   Nothing is held back. If NOT empty, something did not sync as expected — investigate before coding.
```

If `git branch --show-current` shows anything other than `main`, run `./catch-up-workflow 1` (or `git checkout main`).

**Build shape (slice 2):** instrument each of the ~10 server mutation routes BEST-EFFORT and OUTSIDE the DB transaction, so a recorder failure can never roll back a user's edit. **Reuse `src/lib/audit-payload.ts`** — add a pure `topicUpdateEvents(before, update)` helper (diff the content fields → events) + node:test for it. **SKIP pure layout changes** — node x/y drag, pan/zoom, resize are NOT action-history-worthy. The existing `AuditEvent` table + the GET `/api/projects/[projectId]/audit-events` read surface are already in place — do NOT re-create them.

**Forced-picker shape (before coding):** fire a Rule 14f AskUserQuestion to let me confirm (a) which routes are in scope and (b) the content-field-diff vs layout-skip boundary, before you write any route instrumentation. The deploy gate is itself a Rule 14f picker; the §4 Step 1c next-pick at end-of-session is a Rule 14f picker.

**Schema-change-in-flight flag:** **NO at entry — and slice 2 ALSO expects NO schema change** (it reuses the existing `AuditEvent` table). If anything unexpectedly seems to need a schema change, STOP, run the Rule 23 Change Impact Audit (classify Additive) + get my explicit authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (additive only; never `migrate reset` against prod).

**Test coverage decision:** add node:test coverage for the new `topicUpdateEvents` pure helper (the content-field diff → events). Decide any deeper route-level coverage WITH me per the slice shipped.

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (expect green; catch any type issue per change)
- Extension tsc clean (UNCHANGED — slice 2 is a W#1 server change, not extension-side)
- Extension `npm test` = 915 (UNCHANGED unless unexpectedly touched)
- src/lib `node:test` = 1456 (entry 1456; +N for the new `topicUpdateEvents` tests)
- `npm run build` = 78 routes (entry 78; UNCHANGED expected — slice 2 instruments existing routes, adds no new route)
- Check 6 Playwright per Rule 27 (decide WITH me — server-side recording is verified by tsc + node:test + a live director check that manual edits land rows)

**Deploy mechanics:** the slice-2 change follows the standard Rule 9 deploy gate + push pattern (commit on `main` → push origin/main → ping-pong sync to `workflow-2-competition-scraping` → end-of-session doc-batch). NO `prisma db push` expected. NO extension build expected.

**Group A docs to update at session end:** ROADMAP header bump + the (a.140) close (if slice 2 lands) / (a.141) open + the H-1 backlog status note + CHAT_REGISTRY header bump (206th session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header (+ a NEW §Entry only if notable) + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite. (HANDOFF_PROTOCOL header bump only if a rule changes.)

**Group B docs to update at session end:** `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (H-1 slice-2 status note) + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (queue the next H-1 slice — likely slice 3, the Action-History UI tab) + `docs/DATA_CATALOG.md` (extend the `AuditEvent` §4.10 entry if the manual-edit event vocabulary grows) + `docs/WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md` §3.10 (only if the audit shape refines further).

**Standing carry-overs into this session:**

- **(a.140) = W#1 H-1 slice 2 (record MANUAL edits at the server save-points)** — confirm scope, then instrument the ~10 routes best-effort/outside-transaction. Reuses the existing `AuditEvent` table; NO schema change. On `main`.
- **(a.139) = W#1 H-1 (the action-history + undo epic)** — slice 1 ✅ DONE; this slice is slice 2; slices 3–4+ (History UI tab + per-action undo) follow.
- **W#1 M-2 — ✅ DONE 2026-06-03-h** + **W#2 — ✅ COMPLETE 2026-06-03-h (residue fully retired)** + **P-63 Phase 2 / P-64 — ✅ DONE 2026-06-03-g** + **P-63 Phase 1 — ✅ DONE 2026-06-03-f** + **P-50 — ✅ DONE 2026-06-03-e** + **P-56 Option-2 — ✅ CLOSED (won't-do) 2026-06-03-e** + **P-43 — ✅ RESOLVED 2026-06-03-d.**
- **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) — FUTURE; do NOT start unprompted.**
- **The deferred W#2 Archive/Data-Contract split** — held until W#3 needs to read W#2 data; do NOT author now.
- **P-62** — the Workflow-11 surveillance card + page (future-workflow; NOT a near-term item).

---

## Why this pointer was written this way (debug aid)

- **(a.140) = W#1 H-1 slice 2 is the PICK because the director chose it at the §4 Step 1c forced-picker** after the mid-build SPLIT — slice 1 shipped AI-run recording (verified live), and the natural continuation is recording the user's manual edits.
- **The branch is `main`** — W#1 is graduated and lives on `main` per Rule 22. Use `./catch-up-workflow 1` (or `./resume` / `./resume-workflow 1`); verify the branch immediately.
- **NOTHING is held ahead of main.** The build `8bad366` committed directly on `main` + ping-pong-synced; the end-of-session doc-batch commits on `main` normally. So `git log origin/main..HEAD` is EMPTY at entry.
- **The FIRST action is SCOPE CONFIRMATION, not coding.** The manual-edit emission sites are scattered; confirm the exact route list + the content-field-diff vs layout-skip boundary with the director before instrumenting.
- **The Schema-change-in-flight flag is NO at entry AND stays NO** — slice 2 reuses the existing `AuditEvent` table (established Rule 3 in slice 1). No anticipated `prisma db push`.
- **Reuse, do not re-create.** `src/lib/audit-payload.ts` + the `audit-events` route shipped last session — slice 2 extends `audit-payload.ts` (the `topicUpdateEvents` helper) and instruments the server routes; it does not rebuild the recorder or the inbox.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.140.alt1) W#1 H-1 slice 3 — the Action-History UI tab** (the chronological list reading GET `/api/projects/[projectId]/audit-events`; could be done before slice 2 if the director wants to SEE the AI-run history first). On `main`.
- **(a.140.alt2) W#1 M-1 server-side migrations** (Main Terms / Terms In Focus / Auto-Analyze checkpoint → server-side per the "pick up on any device" principle; canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` M-1.a/b/c). On `main`.
- **(a.140.alt3) W#1 M-3 validation-retry telemetry** (instrument the late-run validation-retry rate; telemetry-only first). On `main`.
- **(a.140.alt4) W#1 LOW polish bundle** (L-1..L-5 — small low-priority items; a quick W#1 win if the director wants something lighter). On `main`.
- **(a.140.alt5) P-63 Phase 3** (the OpenAI/ChatGPT + Google Gemini provider adapters — a FUTURE task; ONLY if the director explicitly wants a non-Anthropic model live this session AND supplies that provider's API/SDK docs). On `workflow-2-competition-scraping`.
