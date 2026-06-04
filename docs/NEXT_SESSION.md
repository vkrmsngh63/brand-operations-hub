# Next session

**Written:** 2026-06-04-c (`session_2026-06-04-c_w1-h1-slice-3-context-gap-paused` — **W#1 (Keyword Clustering) polish H-1 (action history + per-action undo) — SLICE 3 (the Action-History UI tab) is BUILT + DEPLOYED but ⏸️ PAUSED on a director-caught CONTEXT-QUALITY GAP.** The slice-3 UI + a follow-up shipped LAST turn (`7356ea4` the read-only filterable grouped `HistoryPanel.tsx` + the pure node:tested `audit-labels.ts` wired into `KeywordWorkspace.tsx`; `5f7aba0` the follow-up — collapsed the two split columns into ONE plain "What happened" sentence via `describeEvent()` AND started capturing before-state for FUTURE manual edits; combined 9 files +1166/-31; both already on `main` + ping-pong-synced). **THIS session committed NO code** — it is the director's real-Chrome REVIEW of the deployed result, which the director **REJECTED as still insufficient**, plus the root-cause diagnosis and the deferral of the fix to slice 4. **The director's verbatim feedback:** *"No, this functionality needs a lot of improvement. There is still no context and no column for prior state. For example, one line states 'Renamed topic to "Bursitis — what it is, where it hurts, and how to find relief". This tells us very little. Which specific topic? What was the topic title before? etc. I want you to make a note of this issue and pause it here. Also tell me what else is remaining on the Roadmap so that we can work on something else next."* — and then: *"let's end session here and pick up with the current issue we were working on next session."* So the NEXT-SESSION task IS this History context-fix (slice 4), NOT a different workflow. **§4 Step 1c forced-picker NOT fired (the director explicitly named the next task) → (a.142) RECOMMENDED-NEXT = W#1 H-1 SLICE 4 — before-state enrichment + the History context fix.** **The next session RUNS ON `main`; start command `./catch-up-workflow 1` (or `./resume`).**)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This session is `session_2026-06-04-c` — the THIRD session of 2026-06-04 (suffix `-c`); the FIRST had NO suffix = slice 1, the SECOND `-b` = slice 2. The harness `currentDate` = 2026-06-04. **Next session: keep trusting the harness `currentDate`; if it is still 2026-06-04 the next suffix is `-d`; if it has rolled forward use the new date with NO suffix. Do NOT regress to a 2026-06-03 suffix and do NOT invent a suffix ahead of the harness.** The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session.

> ⚠️ **BRANCH: next session runs on `main`.** The (a.142) pick is W#1 H-1 slice 4 — W#1 is graduated and lives on `main` per Rule 22. **Start command: `./catch-up-workflow 1`** (the Rule 33 graduated-W#1 re-entry — switches to `main` + prints `docs/KEYWORD_CLUSTERING_PRIMER.md`) — OR `./resume` (reads THIS file) OR `./resume-workflow 1` (reads `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md`, which also queues H-1 slice 4). Confirm `git branch --show-current` shows `main` immediately after entry.

> ⚠️ **BRANCH STATE — NOTHING IS HELD. BOTH BRANCHES ARE AT `5f7aba0`.** The slice-3 build (`7356ea4`) + the follow-up (`5f7aba0`) were committed directly on `main` last turn and ping-pong-synced to `workflow-2-competition-scraping`; after this end-of-session doc-batch commits on `main` + syncs, both branches sit at the doc-batch SHA. **Expect `git log origin/main..HEAD --oneline` to be EMPTY at entry** (the normal graduated-workflow steady state). If it is NOT empty, something did not sync as expected — investigate before coding.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry — and slice 4 is ANTICIPATED to STAY NO.** The History tab is a pure read of the existing `AuditEvent` table. Slice 4's before-state enrichment writes RICHER `payload` JSON (a `before` value + a human-anchorable identity) into the EXISTING `payload` column — **no new column, no new table, no migration anticipated.** If anything unexpectedly seems to need a schema change, STOP, run the Rule 23 Change Impact Audit, and get an explicit Rule 9 deploy gate before any `prisma db push` (additive only; never `migrate reset` against prod).

> ⚠️ **THIS IS A COURSE-CORRECTION CARRY-IN, NOT A FRESH FEATURE.** The slice-3 History UI is already deployed and works — but the director (correctly) found it reads too thin because the underlying data is after-only. The next session's job is to ENRICH THE RECORDING so the SAME History panel reads in full context. Do NOT re-design or re-build the panel from scratch; the panel + its `describeEvent()` renderer already exist (`HistoryPanel.tsx` + `src/lib/audit-labels.ts`) — they will start showing full context automatically once the data carries before-state + which-item.

> ⚠️ **A KEY LIMITATION TO ACCEPT UP FRONT: the 27 EXISTING rows (+ all past AI rows) CANNOT be backfilled.** Those rows were recorded after-only; the before-state simply isn't in the database, and it cannot be reconstructed. Slice 4 makes FUTURE recordings complete; it does NOT (and cannot) repair the historical rows. Surface this to the director plainly: "from here forward the history will read in full; the older rows stay thin." If the director wants the old rows cleaned up/hidden, that is a separate small decision (e.g. a "recorded before full-context was available" marker) — confirm WITH the director, do not assume.

> ⚠️ **H-1 IS A MULTI-SESSION EPIC (~3–5 sessions) — slices 1 + 2 + 3 done; slice 4 = before-state enrichment + the History context fix (then the per-action undo engine).** Slice 1 (AI-run recording) + slice 2 (manual-edit recording) + slice 3 (the visible History UI tab) all shipped. Slice 4 enriches the recording so the history reads in full context (which-item + from→to for AI ops too), which is ALSO the before-state the per-action UNDO needs — so slice 4 bundles both. Per `feedback_plan_output_shape_before_building`, if any new user-visible surface or label change is involved, plan it WITH the director before coding.

> ⚠️ **W#2 IS COMPLETE — do NOT reopen it.** W#2 (Competition Scraping) graduated 2026-06-03 and its entire residue (P-26 / P-27 / P-53) is formally retired won't-do — FULLY EMPTY. Do NOT author new W#2 work unless the director explicitly asks.

> ⚠️ **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) is a FUTURE task, NOT next session.** Captured verbatim in `docs/polish-item-specs/P-63-central-ai-model-registry-self-serve.md` §1 + §7. Fire it ONLY when the director wants a non-Anthropic model live AND supplies that provider's API/SDK docs.

---

## What we did this session (in plain terms)

We looked at the new History screen on the live site, decided it still isn't good enough, figured out why, and wrote it down to fix first thing next time.

**The History screen is built and live — but it doesn't tell you enough yet.** Last turn we built the screen that shows the list of changes (the AI's and yours) and made each one read as a plain sentence. When you looked at it on the live site, you (rightly) said it still doesn't give enough context: a line like *"Renamed topic to 'Bursitis — what it is, where it hurts, and how to find relief'"* doesn't say WHICH topic was renamed, or what its title was BEFORE.

**We found out why.** For the changes the AI made — and for the 27 changes recorded before today — we only ever saved the "after" picture, never the "before." So the screen literally has no "before" to show for those rows. We started saving the full before-and-after for changes YOU make by hand last turn, but that doesn't cover the AI's changes or the older rows.

**We wrote the issue down and paused.** Rather than rush a half-fix, we made a tracked note of exactly what's wrong, and we'll fix it first next session by recording the full before-and-after (and which exact topic) for the AI's changes too — which is the same recording the future "undo a single change" feature will need anyway.

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (the W#1 live backlog) + `docs/COMPETITION_SCRAPING_PRIMER.md` §5 (the W#2 residue table — now FULLY EMPTY) + `docs/polish-item-specs/P-63-*.md` + `docs/DATA_CATALOG.md` §4.10 (the `AuditEvent` entry + the new known-limitation note).

- **(a.142) = W#1 H-1 slice 4 (before-state enrichment + the History context fix)** — **NEXT SESSION (see below).** Capture the before-state + a human-anchorable identity for AI operations during the apply pass so the History reads in full from→to + which-item context. Anticipated NO schema change. On `main`.
- **(a.141) = W#1 H-1 slice 3 (the Action-History UI tab)** — **UI SHIPPED + DEPLOYED but ⏸️ PAUSED, NOT closed.** The visible list is live; the director rejected its context quality; the context fix is folded into (a.142). On `main`.
- **(a.139) = W#1 H-1 (the action-history + undo epic)** — ADVANCED, NOT closed. Slices 1 + 2 + 3 done; slice 4 (the context fix + before-state enrichment) is the (a.142) pick; the per-action undo engine follows (it reuses slice 4's before-state). On `main`.
- **W#1 M-2 — ✅ DONE 2026-06-03-h** + **W#2 — ✅ COMPLETE 2026-06-03-h (residue fully retired)** + **P-63 Phase 2 / P-64 — ✅ DONE 2026-06-03-g** + **P-63 Phase 1 — ✅ DONE 2026-06-03-f** + **P-50 — ✅ DONE 2026-06-03-e** + **P-56 Option-2 — ✅ CLOSED (won't-do) 2026-06-03-e** + **P-43 — ✅ RESOLVED 2026-06-03-d.**
- **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) — FUTURE.** Fired when the director wants a non-Anthropic model live + supplies that provider's API docs. NOT a near-term item.
- **A candidate later-slice gap (informational):** AI-sourced keyword archives (`auto-ai-detected-irrelevant` on `removed-keywords` POST) are NOT recorded yet — slice 2 was manual-only scope. Capture for a later slice if the director wants AI-archives in the history.
- **W#1's remaining live polish backlog** — after H-1: M-1 (3 server-side migrations), M-3 (validation-retry telemetry), L-1..L-5 low, C-1..C-7 carry-overs, Z-1 explicitly-last, P-1 passive prereq. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`. On `main`.
- **The deferred W#2 Archive/Data-Contract split + finalized-HRL Data Capture Interview** — held until W#3 starts and needs to read W#2 data. NOT a blocker.
- **(P-62, under Workflow 11)** "Post Launch Optimization & Surveillance" card + page — future-workflow.

## What we'll do next session (in plain terms)

1. **We fix the History screen's context — by recording more, not by redesigning the screen.** The screen itself is fine; the problem is the data behind it. Next session we make the recorder save the full before-and-after (and which exact topic/keyword) for the AI's changes too — so each line can finally say WHICH topic and what it was BEFORE.
2. **The old rows stay thin — we'll be upfront about that.** The 27 changes already recorded only have an "after," and that can't be recovered. From the fix onward, the history reads in full; the older rows stay as they are. If you'd like, we can mark the older rows as "recorded before full context was available" — your call.
3. **This is also the groundwork for "undo."** The same before-and-after we start recording is exactly what a future "undo a single change" button needs — so this fix moves the undo feature forward too.
4. **We test it and get your go-ahead to deploy.** No database change is expected — we're just recording richer detail in the existing history. We'll run the test scoreboard, deploy, and you'll verify on the live site that a fresh AI run + a fresh hand edit both show full context.

## What's still left in the total roadmap (in plain terms)

- **W#1 H-1 (action history + undo) — IN PROGRESS, the (a.139) epic.** Slices 1–3 done (recording AI changes + your hand changes + the visible History screen); slice 4 (the (a.142) next pick) makes the recorded changes read in full context; the actual per-action Undo comes in a later slice. On `main`.
- **W#1's other polish** — M-1 (move a few things off the browser onto the server so you can pick up on any device), M-3 (retry-rate telemetry), plus a bundle of low-priority items. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`.
- **W#2 (Competition Scraping) — ✅ COMPLETE.** Graduated + every item shipped or formally retired.
- **P-63 (central AI-model registry) — Phase 2 ✅ DONE + live; Phase 3 (add ChatGPT + Gemini) is a future task** fired when you want a non-Anthropic model and give us its docs. **P-64 (drag-reorder) ✅ DONE.**
- **The deferred W#2 Data Contract** — held until W#3 needs to read W#2 data; NOT a blocker.
- **P-62 (NEW capture)** — the Workflow-11 surveillance card + page. Future-workflow.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started. W#3 kickoff is also the trigger to author the deferred W#2 Data Contract.
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**W#1 H-1 SLICE 3 ⏸️ PAUSED ON A CONTEXT-QUALITY GAP — 2026-06-04-c.** The slice-3 Action-History UI tab is BUILT + DEPLOYED (shipped last turn as `7356ea4` + the follow-up `5f7aba0`; both on `main` + ping-pong-synced). This session the director reviewed it on real Chrome and REJECTED it as still insufficient context (no "which topic", no before-state for AI/older rows). NO new code committed this session — it is the review, the root-cause diagnosis, and the deferral of the fix to slice 4. Both branches at `5f7aba0`.

**Session shape (a course-correction — NO new build commit this session):**

- **What shipped LAST TURN (not this session):** `7356ea4` (the read-only filterable grouped `HistoryPanel.tsx` + the pure node:tested `audit-labels.ts`, wired into `KeywordWorkspace.tsx`) + `5f7aba0` (the follow-up — collapsed the two split columns into ONE plain-English "What happened" sentence via `describeEvent()` AND started capturing the BEFORE-state for FUTURE manual edits at the W#1 server routes so a hand-edit rename now records old→new; combined 9 files +1166/-31). Both already on `main` + ping-pong-synced — nothing held.
- **What happened THIS session:** the director reviewed the deployed result on real Chrome and REJECTED it as still insufficient (verbatim above). Root cause diagnosed + surfaced; the issue tracked as `DEFERRED:` Task #5; the fix deferred to slice 4.

**THE DIRECTOR-CAUGHT QUALITY GAP (course-correction — NOT a top-tier slip):** even after the `5f7aba0` follow-up (one plain sentence + from→to for future manual edits), the History panel still doesn't say WHICH topic was renamed or what its title was BEFORE for the AI's changes + the 27 older rows. **Root cause:** those rows are AFTER-ONLY snapshots — the before-state was never captured for AI operations (the pure operation-applier exposes no per-op diffs — `src/lib/audit-payload.ts` lines 22-27), and the from→to capture in `5f7aba0` covers only FUTURE manual edits; a rename row also lacks a stable human-anchorable identity. **THE LESSON:** *after-only audit snapshots can't be backfilled, and a "to"-only sentence isn't enough context — capture the human-anchorable identity + the before-state at the moment the action is applied, for AI operations too, not just manual edits.* **The fix = H-1 slice 4 (before-state + which-item enrichment for AI ops during the apply pass) — the SAME enrichment the future per-action Undo needs; anticipated to STAY schema-NO.**

**Schema-change-in-flight flag NO at entry → STAYED NO entire session → NO at exit (no migration; the History tab is a pure read). NEXT session (slice 4, before-state enrichment) is ANTICIPATED to STAY NO — richer `payload` JSON into the existing column, not a new schema.**

**Rule 14f pickers fired this session:** NONE. The director gave verbatim direction (pause the work, list the rest of the roadmap, resume the History context-fix next session), so the default-to-recommendation / no-fabricated-instructions paths applied — no design picker, no Rule 9 deploy gate (no code committed), no §4 Step 1c next-pick (the director named the task).

**ONE open DEFERRED item at exit (Rule 26):** `DEFERRED:` Task #5 — *History panel needs full context per row — which topic + before-state, incl. AI events* — created this session, carried forward as the (a.142) next-session task. Task #4 (manual from→to) was marked completed. The remaining W#1 backlog items + the deferred W#2 Data Contract + P-62 are documented roadmap continuation, NOT TaskList DEFERRED items.

**EXIT baselines (course-correction — NO new code committed this session; the slice-3 build's baselines hold):** root tsc clean (UNCHANGED) + extension tsc SKIPPED per Rule 27 (no extension source — UNCHANGED) + extension `npm test` = **915/915 UNCHANGED** (not re-run) + src/lib `node:test` UNCHANGED from the slice-3 build (the `audit-labels.ts` + `audit-payload.ts` tests landed in the prior-turn commits `7356ea4` + `5f7aba0`, not this session) + `npm run build` = **78 routes UNCHANGED** (the History tab added no route — a pure read of the existing GET); Check 6 Playwright SKIPPED per Rule 27.

**ONE NEW CORRECTIONS_LOG §Entry 2026-06-04-c** — a COURSE-CORRECTION (a director-caught quality gap, NOT a top-tier slip): the from→to fix did not solve the director's real need; the lesson = after-only snapshots can't be backfilled and a "to"-only sentence isn't enough context; the fix is before-state enrichment for AI ops (slice 4). **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** **NO new memory file this session.**

**Group B docs updated** — `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (H-1 slice 3 → UI SHIPPED + ⏸️ PAUSED on the context gap with the verbatim example + root cause; slice 4 (d) now bundles the context-quality requirement) + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (queue (a.142) = H-1 slice 4) + `docs/DATA_CATALOG.md` §4.10 (the known data-completeness limitation note — before-state for AI ops is still PENDING/after-only today). `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` UNCHANGED (NO v2 bump — no schema migration).

**EIGHTY-FIFTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ZERO `prisma db push`, ZERO `migrate reset`, ZERO drops, ZERO dev-data deletes, ZERO build commits (a course-correction — the slice-3 UI + follow-up shipped last turn). Read-only review of the deployed History panel only. ZERO deploy pushes this session; the end-of-session doc-batch is the only push, under the standard end-of-session pattern. NO new memory file created; zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session).
- **NEXT session (W#1 H-1 slice 4):** enriches the recorder so AI operations capture before-state + a human-anchorable identity during the apply pass. Anticipated NO schema change (richer `payload` JSON into the existing column). If anything unexpectedly seems to need a schema change, STOP, run the Rule 23 Change Impact Audit (classify Additive) + get an explicit Rule 9 deploy gate before any `prisma db push` (additive only; never `migrate reset` against prod). No other Rule 8/9/29 triggers anticipated.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the W#1 continuity primer `docs/KEYWORD_CLUSTERING_PRIMER.md` + `src/lib/audit-payload.ts` + `src/lib/audit-labels.ts` + `src/lib/audit-recorder.ts` + `src/lib/audit-recorder-server.ts` + `src/app/api/projects/[projectId]/audit-events/route.ts` + `HistoryPanel.tsx` + `KeywordWorkspace.tsx` + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` + the memory directory + the `./catch-up-workflow` + `./resume-workflow` + `./resume` scripts.

---

## Branch

**`main`** — entered at start of next session. The (a.142) pick is W#1 H-1 slice 4 — W#1 is graduated and lives on `main` per Rule 22. **Start command: `./catch-up-workflow 1`** (the Rule 33 graduated-W#1 re-entry — switches to `main` + prints `docs/KEYWORD_CLUSTERING_PRIMER.md`) — OR `./resume` (reads THIS file) OR `./resume-workflow 1` (reads `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md`, which also queues H-1 slice 4). Verify with `git branch --show-current` immediately after entry; should be `main`.

**Expected branch state on entry** (after this session's end-of-session doc-batch commits on `main` + syncs): **`main` and `workflow-2-competition-scraping` are BOTH at the doc-batch SHA (both were at `5f7aba0` after the slice-3 build + follow-up; the doc-batch commits on `main` then ping-pong syncs — nothing is held back).** **Verify with `git log origin/main..HEAD --oneline` showing EMPTY** (the normal graduated-workflow steady state). `git status` clean apart from historical untracked .zip + .html artifacts at repo root. If `git log origin/main..HEAD` is NOT empty at entry, something did not sync as expected — investigate before coding.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- **`docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 — the FIRST read** (the slice-3 ⏸️ PAUSED note (c) + the slice-4 requirement bundled into (d); the verbatim director feedback + the root cause are here).
- **`src/lib/audit-payload.ts`** — the apply-pass event builders + the design note at lines 22-27 explaining why the pure applier exposes no per-op diffs today. **This is the file slice 4 enriches** — make the AI apply path emit before-state + a human-anchorable identity.
- **`src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx`** — `doApplyV3` is where the AI ops are applied + recorded (slice 1's wiring); slice 4 enriches the per-op payload here.
- **`src/lib/audit-labels.ts`** (`describeEvent()`) — the plain-English renderer that ALREADY exists; once the data carries before-state + which-item, this should render full from→to context with minimal/no change. Read it to confirm what fields it can already render.
- **`src/app/projects/[projectId]/keyword-clustering/components/HistoryPanel.tsx`** — the deployed read-only panel; do NOT rebuild it; confirm it surfaces whatever richer fields `describeEvent()` produces.
- `docs/DATA_CATALOG.md` §4.10 (the `AuditEvent` data item + the new KNOWN DATA-COMPLETENESS LIMITATION note + §7.2.1 the Cross-Tool Data Flow Map).
- `docs/KEYWORD_CLUSTERING_PRIMER.md` (the W#1 continuity primer — the map of W#1's real surfaces, incl. the operation-applier + the apply pass).
- `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` (read fully — the canonical small/stable artifact; NO v2 bump shipped this session).
- `docs/HANDOFF_PROTOCOL.md` Rule 3 (code wins over docs) + Rule 9 (deploy gate) + Rule 14f (forced-picker) + Rule 18 (mid-build Read-It-Back) + Rule 22 (graduated-tool re-entry) + Rule 23 (Change Impact Audit) + Rule 25 (multi-workflow) + Rule 26 + Rule 27 (verification) + Rule 30 (Session bookends) + Rule 31 + §4 Step 4b extended template.
- `docs/ROADMAP.md` — the W#1 polish-backlog references + the W#2 COMPLETE record + the total-roadmap summary.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-04-c (this session — the after-only-snapshots-can't-be-backfilled lesson) + §Entry 2026-06-04-b (slice 2) + §Entry 2026-06-04 (slice 1) + §Entry 2026-05-31 (the TOP-TIER SLIP).
- **All existing memory files** — esp. `feedback_plan_output_shape_before_building.md` (if slice 4 introduces any new visible label/column, plan it WITH the director first), `feedback_no_fabricated_instructions.md` (H-1 slice 4 is the director's explicitly-named next task; do not invent scope; P-63 Phase 3 is FUTURE — do not start unprompted), `feedback_deferred_items_registry.md`, `feedback_default_to_recommendation.md` / `feedback_recommendation_style.md`, `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md`, `feedback_session_bookends_plain_summary.md`, `feedback_destructive_ops_confirmation.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; the FIRST read is `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 (the slice-3 ⏸️ PAUSED note + the slice-4 requirement).** **This session runs on `main` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal ((a.142) = W#1 H-1 slice 4 — before-state enrichment + the History context fix):** the History screen we built in slice 3 is live, but on real Chrome I (the director) found it reads too thin — a line like *"Renamed topic to 'Bursitis — ...'"* doesn't say WHICH topic or what the title was BEFORE. The root cause: the AI's changes (and the 27 older rows) were recorded AFTER-ONLY — the before-state was never captured for AI operations, and the from→to fix that shipped last turn covers only future MANUAL edits. **Your job: enrich the recording so AI operations capture the before-state + a human-anchorable identity (WHICH topic/keyword) at the moment they are applied — so the existing History panel + `describeEvent()` renderer can show full from→to + which-item context.** Do NOT rebuild the History panel; it already exists. **FIRST action: read `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 (the (c) PAUSED note + (d) slice-4 requirement) + `src/lib/audit-payload.ts` (esp. the lines 22-27 design note on why the pure applier exposes no per-op diffs) + `AutoAnalyze.tsx` `doApplyV3` (where AI ops are applied + recorded) + `src/lib/audit-labels.ts` `describeEvent()` (the renderer), then present the slice-4 PLAN to me in plain terms and let me confirm it BEFORE any coding** (per `feedback_plan_output_shape_before_building` + Rule 18). Do NOT start coding until I confirm.

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: main   (W#1 is graduated and lives on main)

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: EMPTY — main and workflow-2 are BOTH at the 2026-06-04-c doc-batch SHA.
#   Nothing is held back. If NOT empty, something did not sync as expected — investigate before coding.
```

If `git branch --show-current` shows anything other than `main`, run `./catch-up-workflow 1` (or `git checkout main`).

**Plan-the-shape-first (before coding):** fire a Rule 14f AskUserQuestion to confirm the slice-4 plan WITH me. Decide together, BEFORE writing code: (a) WHICH AI ops carry a before-state + identity (the rename/move/keyword-edit ops where "before" is meaningful — vs ops where it isn't, like a pure create); (b) HOW the apply path exposes the before-state (the pure applier currently returns no per-op diffs — confirm whether to thread the pre-apply topic/keyword snapshot through `doApplyV3`, or have the applier emit diffs); (c) the human-anchorable identity to record (a stable topic/keyword id + a readable name so a row can say WHICH topic); (d) the after-only OLD rows — confirm WITH me whether to leave them as-is or mark them "recorded before full context was available" (the 27 existing rows can't be backfilled).

**Build shape (slice 4):** enrich the AI apply pass (`doApplyV3` + `src/lib/audit-payload.ts`'s `aiOperationEvent`/`aiBatchEvents` builders) so each recorded AI op's `payload` carries `before` + a human-anchorable identity alongside the existing `after`. **Reuse the existing recorder, route, table, and `describeEvent()` renderer — do NOT re-create them.** Put any new pure diff/identity logic in a node:tested helper. Verify the existing `describeEvent()` renders the richer payload as full from→to + which-item (extend it only if needed).

**Forced-picker shape (before coding):** the slice-4 plan picker above is the Rule 14f shape-confirmation. The deploy gate is itself a Rule 14f picker; the §4 Step 1c next-pick at end-of-session is a Rule 14f picker.

**Schema-change-in-flight flag:** **NO at entry — and slice 4 is ANTICIPATED to STAY NO** (richer `payload` JSON into the existing `AuditEvent.payload` column — no new column, no new table, no migration). If anything unexpectedly seems to need a schema change, STOP, run the Rule 23 Change Impact Audit (classify Additive) + get my explicit authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (additive only; never `migrate reset` against prod).

**Test coverage decision:** add node:test coverage for the pure before-state/identity diff logic + any change to `describeEvent()`. Decide deeper coverage WITH me per the slice shipped.

**Scoreboard targets** (entry baselines = this session's exit baselines = the slice-3 build's baselines):

- Root tsc clean (expect green; catch any type issue per change)
- Extension tsc SKIPPED per Rule 27 (UNCHANGED — slice 4 is a W#1 web-app + lib change, not extension-side)
- Extension `npm test` = 915 (UNCHANGED unless unexpectedly touched)
- src/lib `node:test` = current slice-3 baseline (+N for the new before-state/identity helper tests) — re-run to lock the exact number
- `npm run build` = 78 routes (UNCHANGED expected — enriching the recorder adds no new route)
- Check 6 Playwright per Rule 27 (decide WITH me — likely covered by node:test + a director real-Chrome verification that a fresh AI run + a fresh hand edit both show full context)

**Deploy mechanics:** the slice-4 change follows the standard Rule 9 deploy gate + push pattern (commit on `main` → push origin/main → ping-pong sync to `workflow-2-competition-scraping` → end-of-session doc-batch). NO `prisma db push` expected. NO extension build expected. **Director real-Chrome verification: confirm a FRESH AI run + a FRESH hand edit both produce History rows that read in full from→to + which-item context** (the old 27 rows will stay thin — that's expected).

**Group A docs to update at session end:** ROADMAP header bump + the (a.142) close (if slice 4 lands) / (a.143) open + the H-1 backlog status note + CHAT_REGISTRY header bump (208th session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header (+ a NEW §Entry only if notable) + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite. (HANDOFF_PROTOCOL header bump only if a rule changes.)

**Group B docs to update at session end:** `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (H-1 slice-4 status note + queue the next H-1 slice — likely the per-action undo engine) + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (queue the next H-1 slice) + `docs/DATA_CATALOG.md` §4.10 (clear/update the KNOWN DATA-COMPLETENESS LIMITATION note once before-state is captured for AI ops) + `docs/WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md` §3.10 (only if the audit shape refines further).

**Standing carry-overs into this session:**

- **(a.142) = W#1 H-1 slice 4 (before-state enrichment + the History context fix)** — plan WITH me first, then enrich the AI apply pass. Anticipated NO schema change. On `main`.
- **(a.141) = W#1 H-1 slice 3 (the Action-History UI tab)** — UI SHIPPED + DEPLOYED but ⏸️ PAUSED on the context gap; this slice fixes it via richer recording, not a panel rebuild.
- **(a.139) = W#1 H-1 (the action-history + undo epic)** — slices 1 + 2 + 3 done; this is slice 4; the per-action undo engine follows (it reuses slice 4's before-state).
- **W#1 M-2 — ✅ DONE 2026-06-03-h** + **W#2 — ✅ COMPLETE 2026-06-03-h (residue fully retired)** + **P-63 Phase 2 / P-64 — ✅ DONE 2026-06-03-g** + **P-63 Phase 1 — ✅ DONE 2026-06-03-f** + **P-50 — ✅ DONE 2026-06-03-e** + **P-56 Option-2 — ✅ CLOSED (won't-do) 2026-06-03-e** + **P-43 — ✅ RESOLVED 2026-06-03-d.**
- **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) — FUTURE; do NOT start unprompted.**
- **The 27 existing after-only History rows cannot be backfilled** — slice 4 fixes FUTURE recordings; confirm WITH me whether to mark the old rows.
- **AI-archive recording (the `auto-ai-detected-irrelevant` source) — a candidate later-slice gap** (not recorded in slice 2's manual-only scope).
- **The deferred W#2 Archive/Data-Contract split** — held until W#3 needs to read W#2 data; do NOT author now.
- **P-62** — the Workflow-11 surveillance card + page (future-workflow; NOT a near-term item).

---

## Why this pointer was written this way (debug aid)

- **(a.142) = W#1 H-1 slice 4 is the PICK because the director EXPLICITLY named it** — *"let's end session here and pick up with the current issue we were working on next session."* The "current issue" is the History context gap caught at the slice-3 review. §4 Step 1c did NOT fire (the director gave a verbatim directive).
- **The branch is `main`** — W#1 is graduated and lives on `main` per Rule 22. Use `./catch-up-workflow 1` (or `./resume` / `./resume-workflow 1`); verify the branch immediately.
- **NOTHING is held ahead of main.** The slice-3 build `7356ea4` + follow-up `5f7aba0` committed directly on `main` + ping-pong-synced; this session committed no code; the end-of-session doc-batch commits on `main` normally. So `git log origin/main..HEAD` is EMPTY at entry.
- **The FIX IS RICHER RECORDING, NOT A PANEL REBUILD.** The History panel + `describeEvent()` already exist + are deployed; they read thin only because the data is after-only. Enrich the AI apply pass to capture before-state + which-item; the panel then reads in full automatically.
- **The before-state can't be reconstructed for old rows.** The 27 existing rows + all past AI rows are after-only; slice 4 fixes FUTURE recordings only — be upfront with the director.
- **Slice 4 is also undo groundwork.** The before-state it captures is exactly what the future per-action undo engine needs — so this fix is a two-for-one.
- **The Schema-change-in-flight flag is NO at entry AND anticipated to stay NO** — slice 4 writes richer `payload` JSON into the existing `AuditEvent.payload` column.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.142.alt1) Mark/hide the after-only OLD History rows** (a small standalone tweak — flag the 27 pre-slice-4 rows as "recorded before full context was available" — could be done first or folded into slice 4). On `main`.
- **(a.142.alt2) AI-archive recording in the history** (record the `auto-ai-detected-irrelevant` source on `removed-keywords` POST that slice 2 left out of its manual-only scope — a small follow-up). On `main`.
- **(a.142.alt3) W#1 H-1 the per-action undo engine** (the undo feature itself — but it DEPENDS on slice 4's before-state, so it should come AFTER slice 4). On `main`.
- **(a.142.alt4) W#1 M-1 server-side migrations** (Main Terms / Terms In Focus / Auto-Analyze checkpoint → server-side per the "pick up on any device" principle; canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` M-1.a/b/c). On `main`.
- **(a.142.alt5) W#1 M-3 validation-retry telemetry** (instrument the late-run validation-retry rate; telemetry-only first). On `main`.
- **(a.142.alt6) W#1 LOW polish bundle** (L-1..L-5 — small low-priority items; a quick W#1 win if the director wants something lighter). On `main`.
- **(a.142.alt7) P-63 Phase 3** (the OpenAI/ChatGPT + Google Gemini provider adapters — a FUTURE task; ONLY if the director explicitly wants a non-Anthropic model live this session AND supplies that provider's API/SDK docs). On `workflow-2-competition-scraping`.
