# Next session

**Written:** 2026-06-04-b (`session_2026-06-04-b_w1-h1-slice-2-manual-edit-recording` — **W#1 (Keyword Clustering) polish H-1 (action history + per-action undo) — SLICE 2 of a 3–5 session epic — record MANUAL edits at the server save-points — ✅ DEPLOYED-AND-VERIFIED on real Chrome (director made manual topic renames on project `c270927b-0241-445d-a648-c36c9887b934`; a live DB query confirmed 5 new `[manual] UPDATE_TOPIC_TITLE` rows landed — alongside slice 1's 22 `[ai]` rows = 27 total).** The session ran entirely on `main` (W#1 is graduated and lives on `main` per Rule 22); the build `8fcc3fd` was committed directly on `main` (no workflow-branch ff-merge), pushed `2361bab..8fcc3fd`, and ping-pong synced to `workflow-2-competition-scraping` (both branches at `8fcc3fd`). **SLICE 2 = record MANUAL edits at the server save-points:** instrumented the W#1 keyword-clustering server mutation routes so a user's hand edits ALSO land in the shared `AuditEvent` table — **best-effort and POST-COMMIT (OUTSIDE the mutation transaction), so a recorder failure can NEVER roll back a user's edit.** NEW `src/lib/audit-recorder-server.ts` (a best-effort, non-throwing in-route direct inserter; the server counterpart to slice 1's client `audit-recorder.ts`) + `src/lib/audit-payload.ts` extended (+3 event types `UPDATE_KEYWORD`/`ADD_PATHWAY`/`REMOVE_PATHWAY` + pure `topicUpdateEvents()` + `keywordUpdateEvents()`; +13 node:test). **KEY Rule 3 finding:** `canvas/sister-links` + `canvas/pathways` (named in the backlog) have NO client caller — they're driven ONLY by the AI `canvas/rebuild` pipeline — so they were instrumented FUTURE-PROOF per the director's pick (records nothing today; auto-records the day a manual editor exists). **Advances (a.139)** = W#1 H-1 (ADVANCED, NOT closed — slice 2 of 3–5 shipped + verified; (a.139) stays OPEN as the epic). **Closes (a.140)** = W#1 H-1 slice 2 → ✅ DONE. **§4 Step 1c forced-picker FIRED → (a.141) RECOMMENDED-NEXT = W#1 H-1 SLICE 3 — the Action-History UI tab** (director chose "H-1 slice 3 — History screen (Recommended)"). **The next session RUNS ON `main`; start command `./catch-up-workflow 1` (or `./resume`).** **FIRST action next session = read `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 (the slice-3 note) + the existing GET `/api/projects/[projectId]/audit-events` route + `src/lib/audit-payload.ts` (the event vocabulary the UI renders), then PLAN the slice-3 UI shape WITH the director — audience / sections / columns / filters / placement in the AST panel — BEFORE coding** per `feedback_plan_output_shape_before_building`.)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This session is `session_2026-06-04-b` — the SECOND session of 2026-06-04 (suffix `-b`); the FIRST 2026-06-04 session had NO suffix = slice 1. The harness `currentDate` = 2026-06-04. **Next session: keep trusting the harness `currentDate`; if it is still 2026-06-04 the next suffix is `-c`; if it has rolled forward use the new date with NO suffix. Do NOT regress to a 2026-06-03 suffix and do NOT invent a suffix ahead of the harness.** The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session.

> ⚠️ **BRANCH: next session runs on `main`.** The (a.141) pick is W#1 H-1 slice 3 — W#1 is graduated and lives on `main` per Rule 22. **Start command: `./catch-up-workflow 1`** (the Rule 33 graduated-W#1 re-entry — switches to `main` + prints `docs/KEYWORD_CLUSTERING_PRIMER.md`) — OR `./resume` (reads THIS file) OR `./resume-workflow 1` (reads `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md`, which also queues H-1 slice 3). Confirm `git branch --show-current` shows `main` immediately after entry.

> ⚠️ **BRANCH STATE — NOTHING IS HELD. BOTH BRANCHES ARE AT `8fcc3fd`.** The build `8fcc3fd` was committed directly on `main` and ping-pong-synced to `workflow-2-competition-scraping`; after this end-of-session doc-batch commits on `main` + syncs, both branches sit at the doc-batch SHA. **Expect `git log origin/main..HEAD --oneline` to be EMPTY at entry** (the normal graduated-workflow steady state). If it is NOT empty, something did not sync as expected — investigate before coding.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry — and slice 3 ALSO expects NO schema change.** Slice 2: NO → STAYED NO → NO at exit (reused the existing `AuditEvent` table). **Slice 3 (the Action-History UI tab) is a PURE READ of the existing GET `/api/projects/[projectId]/audit-events` endpoint → NO new schema, NO `prisma db push`, very likely NO new route at all (the GET already returns recent history newest-first).** If anything unexpectedly seems to need a schema change, STOP, run the Rule 23 Change Impact Audit, and get an explicit Rule 9 deploy gate before any `prisma db push` (additive only; never `migrate reset` against prod).

> ⚠️ **NO OWED DEPLOY, NO OWED VERIFICATION carried in.** Slice 2 was director-verified PASS on real Chrome (5 `[manual] UPDATE_TOPIC_TITLE` rows on live topic renames; 27 history rows total). Nothing is held back; there is no stranded commit and no unverified surface carried into next session.

> ⚠️ **H-1 IS A MULTI-SESSION EPIC (~3–5 sessions) — slices 1 + 2 done; slice 3 = the History UI tab.** Slice 1 (AI-run recording) + slice 2 (manual-edit recording) both shipped + verified. Slice 3 makes the recorded history VISIBLE for the first time (a chronological, filterable list). The per-action UNDO design + engine (slice 4+) follow in later sessions. Per `feedback_plan_output_shape_before_building`, the slice-3 UI shape (audience / sections / columns / filters / placement in the AST panel) MUST be planned WITH the director BEFORE coding — this is a USER-FACING SURFACE, so this is non-negotiable.

> ⚠️ **W#2 IS COMPLETE — do NOT reopen it.** W#2 (Competition Scraping) graduated 2026-06-03 and its entire residue (P-26 / P-27 / P-53) is formally retired won't-do — FULLY EMPTY. Do NOT author new W#2 work unless the director explicitly asks. The deferred W#2 Archive/Data-Contract split + the finalized-HRL Data Capture Interview stay intentionally held until W#3 needs to read W#2 data.

> ⚠️ **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) is a FUTURE task, NOT next session.** Captured verbatim in `docs/polish-item-specs/P-63-central-ai-model-registry-self-serve.md` §1 (2026-06-03-g) + §7. Fire it ONLY when the director wants a non-Anthropic model live AND supplies that provider's API/SDK docs. Do NOT start it unprompted.

---

## What we did this session (in plain terms)

We added the second half of Workflow #1's "action history" feature — recording the changes YOU make by hand.

**Your manual edits are now recorded too.** Last session we started recording every change the AI makes during an analysis. This session we added recording for the changes you make by hand — renaming a topic, moving it, editing or removing keywords, restoring removed ones. You made some real topic renames on the live site, and we confirmed 5 new "manual edit" rows landed in the database (alongside last session's 22 AI rows — 27 history rows total now).

**It can never break or undo your edit.** The recording runs AFTER your edit is safely saved, completely outside the part that actually saves your change. So even if the recorder ever hiccups, it can never roll back or break one of your edits — your edit always wins.

**A useful discovery about two of the "save points."** The plan named two server routes (the ones that connect topics with "sister links" and "pathways") as places to record. When we checked the code, we found nothing in the app actually calls those routes by hand — those connections are only ever created by the AI's rebuild step. So we wired in the recorder there too but left it dormant: it records nothing today, and will automatically start recording the day a hand-editing tool for them exists. Nothing wasted, nothing fragile.

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (the W#1 live backlog) + `docs/COMPETITION_SCRAPING_PRIMER.md` §5 (the W#2 residue table — now FULLY EMPTY) + `docs/polish-item-specs/P-63-*.md` + `docs/DATA_CATALOG.md` §6.1 (the deferred W#2 Data Contract).

- **(a.141) = W#1 H-1 slice 3 (the Action-History UI tab)** — **NEXT SESSION (see below).** A pure read of the existing GET `/api/projects/[projectId]/audit-events` endpoint; NO schema change. On `main`.
- **(a.139) = W#1 H-1 (the action-history + undo epic)** — ADVANCED, NOT closed. Slices 1 + 2 ✅ DONE; slice 3 (History UI tab) is the (a.141) next pick; the per-action undo (slice 4+) follows. On `main`.
- **W#1 M-2 — ✅ DONE 2026-06-03-h** + **W#2 — ✅ COMPLETE 2026-06-03-h (residue fully retired)** + **P-63 Phase 2 / P-64 — ✅ DONE 2026-06-03-g** + **P-63 Phase 1 — ✅ DONE 2026-06-03-f** + **P-50 — ✅ DONE 2026-06-03-e** + **P-56 Option-2 — ✅ CLOSED (won't-do) 2026-06-03-e** + **P-43 — ✅ RESOLVED 2026-06-03-d.**
- **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) — FUTURE.** Fired when the director wants a non-Anthropic model live + supplies that provider's API docs. NOT a near-term item.
- **A candidate later-slice gap (informational):** AI-sourced keyword archives (`auto-ai-detected-irrelevant` on `removed-keywords` POST) are NOT recorded yet — slice 2 was manual-only scope. Capture for a later slice if the director wants AI-archives in the history.
- **W#1's remaining live polish backlog** — after H-1: M-1 (3 server-side migrations), M-3 (validation-retry telemetry), L-1..L-5 low, C-1..C-7 carry-overs, Z-1 explicitly-last, P-1 passive prereq. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`. On `main`.
- **The deferred W#2 Archive/Data-Contract split + finalized-HRL Data Capture Interview** — held until W#3 starts and needs to read W#2 data. NOT a blocker.
- **(P-62, under Workflow 11)** "Post Launch Optimization & Surveillance" card + page — future-workflow.

## What we'll do next session (in plain terms)

1. **We build the History screen** — the place where you can finally SEE the recorded history. For the first time, every change (the AI's and yours) becomes visible as a chronological list inside the Keyword Clustering workspace.
2. **We plan its shape with you FIRST.** This is a screen YOU will look at, so before any coding we decide together: what it shows (which columns), how it reads (plain labels for each change type), how you filter it (by AI vs manual, by what changed, maybe by time), and where it sits in the workspace. Only after you approve the shape do we build it.
3. **No database change is expected** — the history is already being recorded; this slice just reads it back and shows it. We'll build it, run the test scoreboard, and get your go-ahead to deploy.

## What's still left in the total roadmap (in plain terms)

- **W#1 H-1 (action history + undo) — IN PROGRESS, the (a.139) epic.** Slice 1 (AI-run recording) + slice 2 (manual-edit recording) both done + verified; slice 3 (the visible History screen) is the (a.141) next pick; the actual per-action Undo comes in a later slice. On `main`.
- **W#1's other polish** — M-1 (move a few things off the browser onto the server so you can pick up on any device), M-3 (retry-rate telemetry), plus a bundle of low-priority items. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`.
- **W#2 (Competition Scraping) — ✅ COMPLETE.** Graduated + every item shipped or formally retired. Re-entry via the primer + `./catch-up-workflow 2` only if you ever want to revisit.
- **P-63 (central AI-model registry) — Phase 2 ✅ DONE + live; Phase 3 (add ChatGPT + Gemini) is a future task** fired when you want a non-Anthropic model and give us its docs. **P-64 (drag-reorder) ✅ DONE.**
- **The deferred W#2 Data Contract** — held until W#3 needs to read W#2 data; NOT a blocker.
- **P-62 (NEW capture)** — the Workflow-11 surveillance card + page. Future-workflow.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started. W#3 kickoff is also the trigger to author the deferred W#2 Data Contract.
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**W#1 H-1 SLICE 2 ✅ DEPLOYED-AND-VERIFIED — 2026-06-04-b.** Recording MANUAL edits at the server save-points; director-verified PASS on real Chrome (5 `[manual] UPDATE_TOPIC_TITLE` rows on live topic renames; 27 history rows total). Both branches now at `8fcc3fd`.

**Session shape (a single-feature build + one deploy):**

- **Build (`8fcc3fd`, main `2361bab→8fcc3fd`, 10 files +449/-16):** NEW `src/lib/audit-recorder-server.ts` (a best-effort, non-throwing in-route direct inserter — validates eventType vocab + `withRetry` `createMany`; the server counterpart to slice 1's client `audit-recorder.ts`) + `src/lib/audit-payload.ts` extended (+3 event types `UPDATE_KEYWORD`/`ADD_PATHWAY`/`REMOVE_PATHWAY`; + pure `topicUpdateEvents()` [content/structure diff — records title/description/reparent/reorder/keyword-link, SKIPS pure-layout x/y/w/h drags, folds reparent+reorder into one MOVE_TOPIC] + `keywordUpdateEvents()` [content diff — skips canvasLoc/topicApproved]) + `src/lib/audit-payload.test.ts` (+13 node:test; vocabulary length 16→19) + 7 instrumented route files (`canvas/nodes` POST/PATCH/DELETE, `keywords` POST/PATCH/DELETE, `keywords/[keywordId]` PATCH/DELETE, `removed-keywords` POST [MANUAL source only], `removed-keywords/[removedId]/restore` POST, plus FUTURE-PROOF `canvas/sister-links` POST/DELETE + `canvas/pathways` POST/DELETE). Best-effort + POST-COMMIT (OUTSIDE the mutation transaction) so a recorder failure can never roll back a user's edit. Director "Yes — deploy to main".

**THE Rule 3 "code wins over docs" finding (INFORMATIONAL — NOT a slip):** the H-1 backlog named `canvas/sister-links` + `canvas/pathways` POST/DELETE as manual save-points, but a code trace (`src/hooks/useCanvas.ts` + `src/hooks/useKeywords.ts` + `KeywordWorkspace.tsx`) + a repo-wide grep proved **NO client gesture calls either route** — sister-links + pathways are created/destroyed ONLY by the AI `canvas/rebuild` pipeline (direct prisma, wholesale delete+recreate). Surfaced to the director and instrumented FUTURE-PROOF (records nothing today; auto-records the day a manual editor exists) per the director's explicit pick. NEW REUSABLE PATTERN: *"Before instrumenting a server route as a 'manual edit' recorder, grep for its actual client callers — a route existing in the API surface does NOT mean a user gesture reaches it; some routes are only hit by an internal pipeline."* Also informational: AFTER-only snapshots this slice (the per-action-undo slice enriches before-state later); AI-sourced keyword archives (`auto-ai-detected-irrelevant` on `removed-keywords` POST) deliberately NOT recorded (manual-only scope) — a candidate gap for a later slice.

**Schema-change-in-flight flag NO at entry → STAYED NO entire session → NO at exit (the table pre-existed). NEXT session (slice 3, the History UI tab) ALSO expects NO schema change (a pure read of the existing GET endpoint).**

**Rule 14f pickers fired this session:** the slice-2 scope confirm (which routes are in scope + the content-field-diff vs layout-skip boundary + the future-proof orphaned-routes decision); the Rule 9 deploy gate (director "Yes — deploy to main"); the §4 Step 1c next-pick (→ H-1 slice 3, director chose "H-1 slice 3 — History screen (Recommended)").

**ZERO open DEFERRED items at exit (Rule 26):** the session's 4 working tasks (extend `audit-payload.ts` + tests; build the server recorder; instrument the routes; scoreboard + deploy) were all completed; ZERO `DEFERRED:` tasks were created. The remaining W#1 backlog items + the deferred W#2 Data Contract + P-62 are documented roadmap continuation, NOT TaskList DEFERRED items.

**EXIT baselines locked (verified post-deploy):** root tsc clean (UNCHANGED) + extension tsc SKIPPED per Rule 27 (no extension source touched — UNCHANGED) + extension `npm test` = **915/915 UNCHANGED** (not re-run; no extension change) + src/lib `node:test` = **1469** (+13 over 1456 — the new `topicUpdateEvents`/`keywordUpdateEvents` tests) + `npm run build` = **78 routes** (UNCHANGED — slice 2 instruments existing routes, adds none); Check 6 Playwright SKIPPED per Rule 27 (verified by tsc + node:test + director real-Chrome live-check). One tsc error caught + fixed mid-build (`recordFlake`'s `FlakeContext` accepts only `projectWorkflowId`, not `projectId`).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-06-04-b** (NO top-tier slip — a clean single-feature build session) capturing the Rule 3 finding + the NEW REUSABLE PATTERN (grep for a route's actual client callers before instrumenting it as a "manual edit" recorder) + the two informational notes. **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** **NO new memory file this session.**

**Group B docs updated** — `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (H-1 slice 2 → ✅ DONE 2026-06-04-b with an as-built note + slice 3 queued) + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (queue (a.141) = H-1 slice 3) + `docs/WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md` §3.10 (W#1 now records via BOTH a client recorder [AI runs] AND a NEW server-side recorder [manual edits], still NOT the library hook) + `docs/DATA_CATALOG.md` §4.10 (the `AuditEvent` event vocabulary extended — manual source now LIVE + 3 new event types). `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` UNCHANGED (NO v2 bump — no schema migration shipped; the table pre-existed and is unchanged).

**EIGHTY-FOURTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ZERO `prisma db push`, ZERO `migrate reset`, ZERO drops, ZERO dev-data deletes (the `AuditEvent` table pre-existed — no migration). Read-only verification DB queries only (counting the manual rows). ONE deploy push (`8fcc3fd` → `main` + ping-pong sync to `workflow-2-competition-scraping`), under an explicit director Rule 9 deploy gate. NO new memory file created; zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session).
- **NEXT session (W#1 H-1 slice 3):** builds the Action-History UI tab — a PURE READ of the existing GET `/api/projects/[projectId]/audit-events` endpoint; expects NO schema change, NO `prisma db push`, very likely NO new route. If anything unexpectedly seems to need a schema change, STOP, run the Rule 23 Change Impact Audit (classify Additive) + get an explicit Rule 9 deploy gate before any `prisma db push` (additive only; never `migrate reset` against prod). No other Rule 8/9/29 triggers anticipated.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the W#1 continuity primer `docs/KEYWORD_CLUSTERING_PRIMER.md` + `src/lib/audit-payload.ts` + `src/lib/audit-recorder.ts` + `src/lib/audit-recorder-server.ts` + `src/app/api/projects/[projectId]/audit-events/route.ts` + the 7 instrumented route files + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` + the memory directory + the `./catch-up-workflow` + `./resume-workflow` + `./resume` scripts.

---

## Branch

**`main`** — entered at start of next session. The (a.141) pick is W#1 H-1 slice 3 — W#1 is graduated and lives on `main` per Rule 22. **Start command: `./catch-up-workflow 1`** (the Rule 33 graduated-W#1 re-entry — switches to `main` + prints `docs/KEYWORD_CLUSTERING_PRIMER.md`) — OR `./resume` (reads THIS file) OR `./resume-workflow 1` (reads `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md`, which also queues H-1 slice 3). Verify with `git branch --show-current` immediately after entry; should be `main`.

**Expected branch state on entry** (after this session's end-of-session doc-batch commits on `main` + syncs): **`main` and `workflow-2-competition-scraping` are BOTH at the doc-batch SHA (both were at `8fcc3fd` after the build; the doc-batch commits on `main` then ping-pong syncs — nothing is held back).** **Verify with `git log origin/main..HEAD --oneline` showing EMPTY** (the normal graduated-workflow steady state). `git status` clean apart from historical untracked .zip + .html artifacts at repo root. If `git log origin/main..HEAD` is NOT empty at entry, something did not sync as expected — investigate before coding.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- **`docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 — the FIRST read** (the slice-3 note; present the History-UI-tab shape to the director).
- **`src/app/api/projects/[projectId]/audit-events/route.ts`** — the existing GET endpoint the UI tab will read (recent history newest-first); REUSE it, do NOT re-create it.
- **`src/lib/audit-payload.ts`** — the event vocabulary (`UPDATE_TOPIC_TITLE`, `MOVE_TOPIC`, `UPDATE_KEYWORD`, etc.) the UI must render into plain human labels.
- `docs/KEYWORD_CLUSTERING_PRIMER.md` (the W#1 continuity primer — the map of W#1's real surfaces, incl. the workspace / AST panel where the History tab will live).
- `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` (read fully — the canonical small/stable artifact downstream consumers reference; NO v2 bump shipped this session).
- `docs/DATA_CATALOG.md` §4.10 (the `AuditEvent` data item — now LIVE, recording AI runs + manual edits) + §7.2.1 (the Cross-Tool Data Flow Map — Change Impact Audit lookup).
- `docs/WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md` §3.10 (the audit shape — W#1 records via its own client + server recorders, not the library hook).
- `docs/HANDOFF_PROTOCOL.md` Rule 3 (code wins over docs) + Rule 9 (deploy gate) + Rule 14f (forced-picker) + Rule 18 (mid-build Read-It-Back) + Rule 22 (graduated-tool re-entry) + Rule 25 (multi-workflow) + Rule 26 + Rule 27 (verification) + Rule 30 (Session bookends) + Rule 31 + §4 Step 4b extended template.
- `docs/ROADMAP.md` — the W#1 polish-backlog references + the W#2 COMPLETE record + the total-roadmap summary.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-04-b (this session — the grep-for-actual-client-callers pattern) + §Entry 2026-06-04 (slice 1) + §Entry 2026-05-31 (the TOP-TIER SLIP).
- **All existing memory files** — esp. `feedback_plan_output_shape_before_building.md` (the slice-3 UI shape MUST be planned WITH the director before coding — this is a user-facing screen, non-negotiable), `feedback_no_fabricated_instructions.md` (H-1 slice 3 is the confirmed (a.141) pick; do not invent scope; P-63 Phase 3 is FUTURE — do not start unprompted), `feedback_deferred_items_registry.md`, `feedback_default_to_recommendation.md` / `feedback_recommendation_style.md`, `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md`, `feedback_session_bookends_plain_summary.md`, `feedback_destructive_ops_confirmation.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; the FIRST read is `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 (the slice-3 note).** **This session runs on `main` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal ((a.141) = W#1 H-1 slice 3):** build the **Action-History UI tab** — the chronological, filterable list in the Keyword Clustering workspace that reads GET `/api/projects/[projectId]/audit-events` and makes the recorded AI + manual history VISIBLE for the first time. Slices 1 (AI-run recording) + 2 (manual-edit recording) both shipped + were verified live; the data is already there (27 history rows on the verification project). **FIRST action: read `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 (slice-3 note) + the existing GET `/api/projects/[projectId]/audit-events` route + `src/lib/audit-payload.ts` (the event vocabulary), then present the slice-3 UI SHAPE to me in plain terms and let me confirm it BEFORE any coding** (per `feedback_plan_output_shape_before_building` + Rule 18). This is a USER-FACING SCREEN, so planning the shape WITH me first is non-negotiable. Do NOT start coding until I confirm.

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: main   (W#1 is graduated and lives on main)

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: EMPTY — main and workflow-2 are BOTH at the 2026-06-04-b doc-batch SHA.
#   Nothing is held back. If NOT empty, something did not sync as expected — investigate before coding.
```

If `git branch --show-current` shows anything other than `main`, run `./catch-up-workflow 1` (or `git checkout main`).

**Plan-the-shape-first (before coding) — the most important step:** fire a Rule 14f AskUserQuestion to design the History UI tab WITH me. Decide together, BEFORE writing any component: (a) AUDIENCE + DEPTH — plain human labels for each change type (e.g. "Renamed topic", "Moved topic", "Removed keyword"), not raw `eventType` tokens; (b) PLACEMENT — where in the workspace / AST panel the tab lives; (c) COLUMNS — what each row shows (when, who/source [AI vs manual], what changed, the topic/keyword affected); (d) FILTERS — by source (AI vs manual), by change type, possibly by time/run-batch; (e) SECTIONS / grouping — flat chronological vs grouped by run-batch. Only after I approve the shape do you build it.

**Build shape (slice 3):** a read-only UI tab — fetch from the existing GET `/api/projects/[projectId]/audit-events` (newest-first), map each `AuditEvent` row's `eventType` to a plain label via a pure helper, render the list with the agreed columns + filters. **Reuse the existing GET endpoint + `src/lib/audit-payload.ts` event vocabulary — do NOT re-create the recorder, the route, or the table.** Put the label-mapping + any filter logic in a pure, node:tested helper.

**Forced-picker shape (before coding):** the design picker above is the Rule 14f shape-confirmation. The deploy gate is itself a Rule 14f picker; the §4 Step 1c next-pick at end-of-session is a Rule 14f picker.

**Schema-change-in-flight flag:** **NO at entry — and slice 3 ALSO expects NO schema change** (it is a pure read of the existing GET endpoint; very likely NO new route either). If anything unexpectedly seems to need a schema change, STOP, run the Rule 23 Change Impact Audit (classify Additive) + get my explicit authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (additive only; never `migrate reset` against prod).

**Test coverage decision:** add node:test coverage for the pure `eventType` → plain-label mapping helper + any pure filter logic. Decide deeper component-level coverage WITH me per the slice shipped.

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (expect green; catch any type issue per change)
- Extension tsc SKIPPED per Rule 27 (UNCHANGED — slice 3 is a W#1 web-app change, not extension-side)
- Extension `npm test` = 915 (UNCHANGED unless unexpectedly touched)
- src/lib `node:test` = 1469 (entry 1469; +N for the new label-mapping/filter tests)
- `npm run build` = 78 routes (entry 78; UNCHANGED expected — a read-only UI tab adds no new route)
- Check 6 Playwright per Rule 27 (decide WITH me — a UI tab MAY warrant a Playwright spec; consider one if the list rendering/filtering is non-trivial)

**Deploy mechanics:** the slice-3 change follows the standard Rule 9 deploy gate + push pattern (commit on `main` → push origin/main → ping-pong sync to `workflow-2-competition-scraping` → end-of-session doc-batch). NO `prisma db push` expected. NO extension build expected.

**Group A docs to update at session end:** ROADMAP header bump + the (a.141) close (if slice 3 lands) / (a.142) open + the H-1 backlog status note + CHAT_REGISTRY header bump (207th session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header (+ a NEW §Entry only if notable) + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite. (HANDOFF_PROTOCOL header bump only if a rule changes.)

**Group B docs to update at session end:** `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (H-1 slice-3 status note + queue the next H-1 slice — likely slice 4, the per-action undo design) + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (queue the next H-1 slice) + `docs/DATA_CATALOG.md` (extend `AuditEvent` §4.10 only if the vocabulary or read surface changes) + `docs/WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md` §3.10 (only if the audit shape refines further).

**Standing carry-overs into this session:**

- **(a.141) = W#1 H-1 slice 3 (the Action-History UI tab)** — plan the shape WITH me first, then build the read-only list. A pure read of the existing GET endpoint; NO schema change. On `main`.
- **(a.139) = W#1 H-1 (the action-history + undo epic)** — slices 1 + 2 ✅ DONE; this slice is slice 3; slice 4+ (the per-action undo) follows.
- **W#1 M-2 — ✅ DONE 2026-06-03-h** + **W#2 — ✅ COMPLETE 2026-06-03-h (residue fully retired)** + **P-63 Phase 2 / P-64 — ✅ DONE 2026-06-03-g** + **P-63 Phase 1 — ✅ DONE 2026-06-03-f** + **P-50 — ✅ DONE 2026-06-03-e** + **P-56 Option-2 — ✅ CLOSED (won't-do) 2026-06-03-e** + **P-43 — ✅ RESOLVED 2026-06-03-d.**
- **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) — FUTURE; do NOT start unprompted.**
- **AI-archive recording (the `auto-ai-detected-irrelevant` source) — a candidate later-slice gap** (not recorded in slice 2's manual-only scope).
- **The deferred W#2 Archive/Data-Contract split** — held until W#3 needs to read W#2 data; do NOT author now.
- **P-62** — the Workflow-11 surveillance card + page (future-workflow; NOT a near-term item).

---

## Why this pointer was written this way (debug aid)

- **(a.141) = W#1 H-1 slice 3 is the PICK because the director chose it at the §4 Step 1c forced-picker** ("H-1 slice 3 — History screen (Recommended)"). Slices 1 + 2 recorded the history (AI + manual); the natural next step is making it VISIBLE.
- **The branch is `main`** — W#1 is graduated and lives on `main` per Rule 22. Use `./catch-up-workflow 1` (or `./resume` / `./resume-workflow 1`); verify the branch immediately.
- **NOTHING is held ahead of main.** The build `8fcc3fd` committed directly on `main` + ping-pong-synced; the end-of-session doc-batch commits on `main` normally. So `git log origin/main..HEAD` is EMPTY at entry.
- **The FIRST action is SHAPE PLANNING, not coding.** This is a user-facing screen; `feedback_plan_output_shape_before_building` is binding — design the columns / labels / filters / placement WITH the director before instrumenting any component.
- **The Schema-change-in-flight flag is NO at entry AND stays NO** — slice 3 is a pure read of the existing GET endpoint (established in slice 1). No anticipated `prisma db push`, very likely no new route.
- **Reuse, do not re-create.** The GET `/api/projects/[projectId]/audit-events` route + `src/lib/audit-payload.ts` shipped in slices 1 + 2 — slice 3 reads them and renders. It does not rebuild the recorder, the inbox, or the table.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.141.alt1) W#1 H-1 slice 4 — the per-action undo design** (design the undo shape + the before-state enrichment; could be sequenced before slice 3 if the director wants undo over visibility first, though the director chose the History screen first). On `main`.
- **(a.141.alt2) AI-archive recording in the history** (record the `auto-ai-detected-irrelevant` source on `removed-keywords` POST that slice 2 left out of its manual-only scope — a small follow-up). On `main`.
- **(a.141.alt3) W#1 M-1 server-side migrations** (Main Terms / Terms In Focus / Auto-Analyze checkpoint → server-side per the "pick up on any device" principle; canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` M-1.a/b/c). On `main`.
- **(a.141.alt4) W#1 M-3 validation-retry telemetry** (instrument the late-run validation-retry rate; telemetry-only first). On `main`.
- **(a.141.alt5) W#1 LOW polish bundle** (L-1..L-5 — small low-priority items; a quick W#1 win if the director wants something lighter). On `main`.
- **(a.141.alt6) P-63 Phase 3** (the OpenAI/ChatGPT + Google Gemini provider adapters — a FUTURE task; ONLY if the director explicitly wants a non-Anthropic model live this session AND supplies that provider's API/SDK docs). On `workflow-2-competition-scraping`.
