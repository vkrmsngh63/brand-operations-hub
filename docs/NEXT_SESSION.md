# Next session

**Written:** 2026-06-03-h (`session_2026-06-03-h_w2-residue-retired-and-w1-m2-cost-forecasting` — **TWO work items: (1) W#2 (Competition Scraping) residue is now FULLY RETIRED (P-26 / P-27 / P-53 → ✅ CLOSED won't-do via alternate methods — W#2 is COMPLETE; docs-only close-out `e3238a4`, NO Rule 9 gate) AND (2) W#1 (Keyword Clustering) polish M-2 (Auto-Analyze cost forecasting + spend cap + out-of-credit handling) ✅ DEPLOYED-AND-VERIFIED + CLOSED on real Chrome (vklf.com, director "Pass") across TWO deploys to `main`.** The session STARTED on `workflow-2-competition-scraping` (the W#2 residue close-out), then switched to `main` for the W#1 M-2 work; **ended on `main`**; both branches synced at `ab24154`. **ITEM 1 (`e3238a4`):** the director retired all three residue items won't-do (verbatim *"We don't need P-26, P-27 and P-53 anymore. The system has alternate methods that make these fixes unnecessary."*) via a Rule 14f picker after a code-truth walkthrough — P-53 ABSORBED by P-55 spreadsheets; P-26 covered by the two-halves workaround + spreadsheets; P-27 sidestepped by P-45 screen-recording (bug #15 a non-fixable Chrome limit). **W#2 residue is now FULLY EMPTY — W#2 is COMPLETE.** **ITEM 2 (M-2): Deploy 1 (`129cfcb`, main `e3238a4→129cfcb`):** NEW pure helper `src/lib/cost-estimator.ts` (`projectRunCost` sliding-window forecast + `classifyAnthropicError` + `evaluateSpendCap`; +19 node:test) wired into `AutoAnalyze.tsx` — inline live cost forecast + an optional spend cap that pauses + smart out-of-credit stop-and-Resume (instead of the naive 3× backoff ~36-min halt). **Deploy 2 / FF1 (`ab24154`, main `129cfcb→ab24154`):** explicit "No cap" checkbox replacing the unintuitive "0 = no cap". Both director "Yes — deploy to main". NO schema, NO new route. **Closes (a.138)** = W#2 residue ✅ CLOSED + W#1 M-2 ✅ DONE/CLOSED. **§4 Step 1c forced-picker FIRED → (a.139) RECOMMENDED-NEXT = W#1 H-1 (action history table + per-action undo)** — the HIGH-priority W#1 backlog item; a multi-session epic (~3-5 sessions); next session does the design + DB schema. **The next session RUNS ON `main` (W#1 lives on `main`); start command `./catch-up-workflow 1` (or `./resume`).** **FIRST action next session = read `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 (+ the H-1 work-split a/b/c/d) and PRESENT the action-history + undo design shape to the director BEFORE coding** per `feedback_plan_output_shape_before_building`.)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This session is `session_2026-06-03-h` — the EIGHTH session of 2026-06-03 (suffix `-h`); the FIRST was `session_2026-06-03` (no suffix) = P-61, `-b` = W#2 graduation, `-c` = W#1 Rule-33 backfill, `-d` = P-43 subshell cwd fix, `-e` = P-50 + P-63 Phase 0, `-f` = P-63 Phase 1, `-g` = P-63 Phase 2 + P-64. The harness `currentDate` = 2026-06-03. **Next session: keep trusting the harness `currentDate`; do NOT regress or invent a suffix ahead of it.** The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session.

> ⚠️ **BRANCH: next session runs on `main`.** The (a.139) pick is W#1 H-1 — W#1 is graduated and lives on `main` per Rule 22. **Start command: `./catch-up-workflow 1`** (the Rule 33 graduated-W#1 re-entry — switches to `main` + prints `docs/KEYWORD_CLUSTERING_PRIMER.md`) — OR `./resume` (reads THIS file) OR `./resume-workflow 1` (roadmap-driven; reads `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md`, which also queues H-1). **This is a BRANCH CHANGE from where this session ENDED (`main` after the M-2 work) only in the sense that the next task is W#1 work — confirm `git branch --show-current` shows `main` immediately after entry.**

> ⚠️ **BRANCH STATE — NOTHING IS HELD. BOTH BRANCHES ARE AT `ab24154`.** Both M-2 deploys ff-merged to `main` in-session, each ping-pong-synced back to `workflow-2-competition-scraping`; the W#2 residue close-out `e3238a4` likewise ff-merged + synced. So at next-session entry, **`main` and `workflow-2-competition-scraping` are BOTH at `ab24154`** (after this end-of-session doc-batch ff-merges to `main`, both will be at the doc-batch SHA). **Expect `git log origin/main..HEAD --oneline` to be EMPTY at entry** (the normal graduated-workflow steady state). If it is NOT empty, something did not ff-merge as expected — investigate before coding.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry — but H-1 WILL flip it YES.** This session: NO → STAYED NO → NO at exit (M-2 added no schema; the W#2 close-out was docs-only). **NEXT session (W#1 H-1) WILL introduce an additive Prisma model `AuditEvent`** (the per-action audit row) + wire the currently-stubbed `useEmitAuditEvent()` to real DB inserts. **Treat this as an ANTICIPATED additive schema change: run the Rule 23 Change Impact Audit (look up downstream consumers in DATA_CATALOG §7.2.1; classify Additive — a new optional table breaks no consumer) + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push`; additive only; never `migrate reset` against prod.** Flip the schema-change-in-flight flag to YES when the schema work starts, and back to NO once the additive `prisma db push` lands.

> ⚠️ **NO OWED DEPLOY, NO OWED VERIFICATION carried in.** M-2 (both deploys) was director-verified PASS on real Chrome. The W#2 residue close-out had no deploy (docs-only). Nothing is held back; there is no stranded commit and no unverified surface carried into next session.

> ⚠️ **H-1 IS A MULTI-SESSION EPIC (~3-5 sessions) — design FIRST, build SMALL.** H-1 is action-history + per-action undo, the highest-priority OPEN W#1 backlog item. **Next session does the DESIGN + the DB schema slice ONLY (the `AuditEvent` table + wiring `useEmitAuditEvent()`), NOT the whole epic.** Per `feedback_plan_output_shape_before_building` + Rule 18 (mid-build Read-It-Back), the per-action undo design (which ops reverse trivially vs compose nontrivially — SPLIT_TOPIC, MERGE_TOPICS with auto-reparenting) MUST be confirmed WITH the director BEFORE any undo build. The conservative shape is audit-table-first (schema + minimal wiring; the Action-History UI tab + the undo engine follow in subsequent sessions).

> ⚠️ **W#2 IS COMPLETE — do NOT reopen it.** W#2 (Competition Scraping) graduated 2026-06-03 and as of 2026-06-03-h its entire residue (P-26 / P-27 / P-53) is formally retired won't-do — the residue is FULLY EMPTY. Do NOT author new W#2 work unless the director explicitly asks. The deferred W#2 Archive/Data-Contract split + the finalized-HRL Data Capture Interview stay intentionally held until W#3 needs to read W#2 data.

> ⚠️ **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) is a FUTURE task, NOT next session.** Captured verbatim in `docs/polish-item-specs/P-63-central-ai-model-registry-self-serve.md` §1 (2026-06-03-g) + §7. Fire it ONLY when the director wants a non-Anthropic model live AND supplies that provider's API/SDK docs. Do NOT start it unprompted.

---

## What we did this session (in plain terms)

This session did two things: it finished off Workflow #2 (Competition Scraping) for good, and it added a money-safety feature to Workflow #1's AI analysis.

**Finishing Workflow #2.** There were three small leftover items on the Competition Scraping list (an extra "export" button, a "capture below the fold" feature, and a couple of video-capture quirks). After we walked through each one together, you decided we don't need any of them — the system already covers those needs other ways (the spreadsheet exports already give you those tables; the "capture in two halves" trick already gets the below-the-fold content; and screen-recording already handles the video cases). So we formally retired all three. Workflow #2 is now completely done — nothing left on it.

**Money-safety for Workflow #1's AI runs.** When you run Auto-Analyze, it now shows you a live cost forecast as it goes — how much you've spent, an estimated total, and an estimated amount remaining. You can also set an optional spending cap: if a run is about to go over your limit, it pauses and waits for you (you can change the cap or resume). And if your Anthropic account runs out of credit mid-run, it now stops immediately and tells you to top up and Resume — instead of the old behavior where it silently ground through about 36 minutes of failed retries before giving up. You checked all of this on the real site and said "Pass." (We also swapped a confusing "type 0 for no cap" field for a simple "No cap" checkbox after you flagged it.)

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (the W#1 live backlog) + `docs/COMPETITION_SCRAPING_PRIMER.md` §5 (the W#2 residue table — now FULLY EMPTY) + `docs/polish-item-specs/P-63-*.md` + `docs/DATA_CATALOG.md` §6.1 (the deferred W#2 Data Contract).

- **(a.139) = W#1 H-1 (action history table + per-action undo)** — **NEXT SESSION (see below).** HIGH-priority; a multi-session epic; next session does design + the `AuditEvent` DB schema. On `main`.
- **W#1 M-2 — ✅ DONE 2026-06-03-h** (Auto-Analyze cost forecasting + spend cap + out-of-credit handling, live + verified).
- **W#2 — ✅ COMPLETE 2026-06-03-h** (graduated 2026-06-03; entire residue P-26 / P-27 / P-53 retired won't-do — residue FULLY EMPTY).
- **P-63 Phase 2 — ✅ DONE 2026-06-03-g** + **P-64 — ✅ DONE 2026-06-03-g** + **P-63 Phase 1 — ✅ DONE 2026-06-03-f** + **P-50 — ✅ DONE 2026-06-03-e** + **P-56 Option-2 — ✅ CLOSED (won't-do) 2026-06-03-e** + **P-43 — ✅ RESOLVED 2026-06-03-d.**
- **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) — FUTURE.** Fired when the director wants a non-Anthropic model live + supplies that provider's API docs. NOT a near-term item.
- **W#1's remaining live polish backlog** — after H-1: M-1 (3 server-side migrations), M-3 (validation-retry telemetry), L-1..L-5 low, C-1..C-7 carry-overs, Z-1 explicitly-last, P-1 passive prereq. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`. On `main`.
- **The deferred W#2 Archive/Data-Contract split + finalized-HRL Data Capture Interview** — held until W#3 starts and needs to read W#2 data. NOT a blocker.
- **(P-62, under Workflow 11)** "Post Launch Optimization & Surveillance" card + page — future-workflow.

## What we'll do next session (in plain terms)

1. **We start the "action history + undo" feature for Workflow #1** — a record of every change you make during an analysis (so there's a permanent log instead of an in-memory one that vanishes), and the foundation for being able to undo individual actions.
2. **This is a big feature, so next session is just the first slice** — we'll design it together first (especially the undo part, because some actions are easy to reverse and some are tricky), then build only the underlying "history table" in the database plus the wiring to record into it. The visible history screen and the actual undo come in later sessions.
3. **We follow the normal routine** — design-with-you, build the database table, run the test scoreboard, and (because this adds a new database table) get your explicit go-ahead before the database change goes live.

## What's still left in the total roadmap (in plain terms)

- **W#1 H-1 (action history + undo) — NEXT, the (a.139) pick.** A multi-session feature; next session is design + the database table. On `main`.
- **W#1's other polish** — M-1 (move a few things off the browser onto the server so you can pick up on any device), M-3 (retry-rate telemetry), plus a bundle of low-priority items. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`.
- **W#2 (Competition Scraping) — ✅ COMPLETE.** Graduated + every item shipped or formally retired. Re-entry via the primer + `./catch-up-workflow 2` only if you ever want to revisit.
- **P-63 (central AI-model registry) — Phase 2 ✅ DONE + live; Phase 3 (add ChatGPT + Gemini) is a future task** fired when you want a non-Anthropic model and give us its docs. **P-64 (drag-reorder) ✅ DONE.**
- **The deferred W#2 Data Contract** — held until W#3 needs to read W#2 data; NOT a blocker.
- **P-62 (NEW capture)** — the Workflow-11 surveillance card + page. Future-workflow.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started. W#3 kickoff is also the trigger to author the deferred W#2 Data Contract.
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**W#2 residue FULLY RETIRED (W#2 COMPLETE) + W#1 M-2 ✅ DEPLOYED-AND-VERIFIED + CLOSED — 2026-06-03-h.** TWO work items; M-2's two deploys each director-verified PASS on real Chrome (vklf.com). Both branches now at `ab24154`.

**Session shape (a retire-residue close-out + a two-deploy single-feature build):**

- **ITEM 1 — W#2 residue retired (`e3238a4`, docs-only, ff-merged to main + ping-pong, NO Rule 9 gate):** the director retired P-26 / P-27 / P-53 won't-do via a Rule 14f picker after a code-truth walkthrough (P-53 ABSORBED by P-55 spreadsheets; P-26 covered by the two-halves workaround + spreadsheets; P-27 sidestepped by P-45 screen-recording — bug #15 a non-fixable Chrome limit). The in-session edits: the ROADMAP "Update 2026-06-03-h" W#2-polish close-out block + the COMPETITION_SCRAPING_PRIMER §5 residue-table flip (P-53 + P-26/P-27 → CLOSED won't-do + "residue FULLY EMPTY"). **W#2 residue is now FULLY EMPTY — W#2 is COMPLETE.**
- **ITEM 2, Deploy 1 — M-2 feature (`129cfcb`, main `e3238a4→129cfcb`):** a NEW node:tested pure helper `src/lib/cost-estimator.ts` (`projectRunCost` sliding-window est-total/remaining forecast; `classifyAnthropicError` credit-vs-other classifier; `evaluateSpendCap` ok/warn/over; +19 node:test in `cost-estimator.test.ts`) wired into `AutoAnalyze.tsx` — inline live cost forecast in the progress header + minibar ("$X · est. total ~$Y · ~$Z left"); an optional spend cap that warns near + pauses before a batch when reached (resumable, editable mid-pause); smart out-of-credit handling (a "credit balance too low" error stops immediately with a top-up-and-Resume message + requeues the batch without consuming a retry, instead of the naive 3× backoff ~36-min halt). Director "Yes — deploy to main".
- **ITEM 2, Deploy 2 / FF1 — UX fix (`ab24154`, main `129cfcb→ab24154`):** replaced the unintuitive "0 = no cap" with an explicit "No cap" checkbox (default on; the cap number input disables when checked; effective cap = `noCap ? 0 : spendCapUsd`; default cap seeded at $25). UI-only; no logic/schema/route/test change. Director "Yes — deploy to main".

**Schema-change-in-flight flag NO at entry → STAYED NO entire session → NO at exit (M-2 added no schema; the W#2 close-out was docs-only). NEXT session (W#1 H-1) WILL flip YES when its additive `AuditEvent` schema lands.**

**Rule 14f pickers fired this session:** THREE beyond the deploy gates — the W#2-residue retirement decision; the M-2 design-shape pickers (display shape = inline header; protection = both A [forecast/cap] + B [out-of-credit handling]); the §4 Step 1c next-pick (→ H-1). PLUS TWO Rule 9 deploy gates (M-2 Deploy 1 + FF1, both "Yes"). The W#2 close-out had NO Rule 9 gate (docs-only, no live-site impact).

**ZERO open DEFERRED items at exit (Rule 26):** TaskList empty at entry; 4 in-session build tasks all completed; ZERO open DEFERRED at exit. The remaining W#1 backlog items (H-1, M-1, M-3, LOW bundle, carry-overs) + the deferred W#2 Data Contract + P-62 are documented roadmap continuation, NOT TaskList DEFERRED items.

**EXIT baselines locked (verified post-deploy):** root tsc clean (UNCHANGED) + extension tsc clean (UNCHANGED — not re-run; no extension source touched) + extension `npm test` = **915/915 UNCHANGED** (not re-run; no extension change) + src/lib `node:test` = **1446** (+19 over 1427 — the `cost-estimator.test.ts` suite) + `npm run build` = **77 routes UNCHANGED** (M-2 added no route); Check 6 Playwright SKIPPED per Rule 27 (verified by tsc + node:test + director real-Chrome PASS).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-06-03-h** (NO top-tier slip — a clean retire-residue + single-feature build session) capturing: (1) the W#2 residue retired-via-alternate-methods decision; (2) the NEW REUSABLE PATTERN — "when a provider exposes no balance API, bound run spend with a user-set cap + reactively classify the out-of-credit error (stop+pause, don't naively retry) rather than trying to pre-check a balance that can't be queried"; (3) the explicit-toggle-over-magic-sentinel UX fix ("No cap" checkbox). **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** **NO new memory file this session.**

**Group B docs updated** — `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (M-2 → ✅ DONE 2026-06-03-h with an as-built note; H-1 now the RECOMMENDED-NEXT HIGH item) + `docs/COMPETITION_SCRAPING_PRIMER.md` §5 (the in-session residue-table flip — P-53 + P-26/P-27 → CLOSED won't-do + "residue FULLY EMPTY"). `docs/COMPETITION_SCRAPING_DESIGN.md` UNCHANGED (NO §B entry — the residue retirement is a roadmap-state decision, not a W#2 product-design change). `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` UNCHANGED (NO new Deploy session #N — M-2 is a W#1 surface, not a W#2 vklf.com deploy).

**EIGHTY-SECOND end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ZERO `prisma db push`, ZERO `migrate reset`, ZERO drops, ZERO dev-data deletes. M-2 added a pure lib helper + tests + UI wiring (no schema); the W#2 close-out was docs-only. THREE logical pushes (the W#2 close-out ff-merge + ping-pong; M-2 Deploy 1 push main + ping-pong; M-2 FF1 push main + ping-pong), TWO under an explicit director Rule 9 deploy gate. NO new memory file created; zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session).
- **NEXT session (W#1 H-1):** WILL introduce an **additive Prisma model `AuditEvent`** + wire `useEmitAuditEvent()` to real DB inserts. Run the Rule 23 Change Impact Audit (classify Additive) + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (additive only; never `migrate reset` against prod). Flip the schema-change-in-flight flag YES when the schema work starts, back to NO once the additive `prisma db push` lands. No other Rule 8/9/29 triggers anticipated.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the W#1 continuity primer `docs/KEYWORD_CLUSTERING_PRIMER.md` + the W#2 continuity primer `docs/COMPETITION_SCRAPING_PRIMER.md` + the NEW `src/lib/cost-estimator.ts` + `cost-estimator.test.ts` + `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` + the memory directory + the `./catch-up-workflow` + `./resume-workflow` + `./resume` scripts.

---

## Branch

**`main`** — entered at start of next session. The (a.139) pick is W#1 H-1 — W#1 is graduated and lives on `main` per Rule 22. **Start command: `./catch-up-workflow 1`** (the Rule 33 graduated-W#1 re-entry — switches to `main` + prints `docs/KEYWORD_CLUSTERING_PRIMER.md`) — OR `./resume` (reads THIS file) OR `./resume-workflow 1` (reads `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md`, which also queues H-1). Verify with `git branch --show-current` immediately after entry; should be `main`.

**Expected branch state on entry** (after this session's end-of-session doc-batch ff-merges to `main`): **`main` and `workflow-2-competition-scraping` are BOTH at the doc-batch SHA (both were at `ab24154` after M-2; the doc-batch ff-merges normally — nothing is held back).** **Verify with `git log origin/main..HEAD --oneline` showing EMPTY** (the normal graduated-workflow steady state). `git status` clean apart from historical untracked .zip + .html artifacts at repo root. If `git log origin/main..HEAD` is NOT empty at entry, something did not ff-merge as expected — investigate before coding.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- **`docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 — the FIRST read** (the work-split a/b/c/d; present the action-history + undo design shape to the director).
- `docs/KEYWORD_CLUSTERING_PRIMER.md` (the W#1 continuity primer — the map of W#1's real surfaces).
- `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` (read fully — the canonical small/stable artifact downstream consumers reference; bumps to v2 when a schema migration ships).
- `docs/DATA_CATALOG.md` §7.2.1 (the Cross-Tool Data Flow Map — the Change Impact Audit downstream-consumer lookup for the new `AuditEvent` table).
- `docs/HANDOFF_PROTOCOL.md` Rule 3 (code wins over docs) + Rule 9 (deploy gate) + Rule 14f (forced-picker) + Rule 18 (mid-build Read-It-Back) + Rule 22 (graduated-tool re-entry) + Rule 23 (Change Impact Audit) + Rule 25 (multi-workflow) + Rule 26 + Rule 27 (verification) + Rule 30 (Session bookends) + Rule 31 (read-guarantee + audit-shipped-state) + §4 Step 4b extended template.
- `docs/ROADMAP.md` — the W#1 polish-backlog references + the W#2 graduation/COMPLETE record + the total-roadmap summary.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-03-h (this session — the residue-retired + no-balance-API-bound-spend + explicit-toggle patterns) + §Entry 2026-05-31 (the TOP-TIER SLIP).
- **All existing memory files** — esp. `feedback_plan_output_shape_before_building.md` (design the action-history + undo shape WITH the director before coding — H-1's undo part especially), `feedback_no_fabricated_instructions.md` (H-1 is the confirmed (a.139) pick; do not invent scope; P-63 Phase 3 is a FUTURE task — do not start unprompted), `feedback_browser_first_ai_with_server_migration.md` + the M-1 server-migration principle, `feedback_default_to_recommendation.md` / `feedback_recommendation_style.md`, `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md`, `feedback_session_bookends_plain_summary.md`, `feedback_destructive_ops_confirmation.md` (the `AuditEvent` additive `prisma db push` is a Rule 23 + Rule 9 trigger).

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; the FIRST read is `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 (the work-split).** **This session runs on `main` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal ((a.139) = W#1 H-1):** start **H-1 — Action history table + per-action undo**, the highest-priority OPEN W#1 polish item. **This is a multi-session epic (~3-5 sessions); THIS session does the DESIGN + the DB schema slice ONLY — the additive `AuditEvent` table + wiring the currently-stubbed `useEmitAuditEvent()` to real DB inserts. The Action-History UI tab + the per-action undo engine come in subsequent sessions.** **FIRST action: read `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 (the work-split a/b/c/d), then present the action-history + undo design shape to me in plain terms and let me confirm it BEFORE any coding** (per `feedback_plan_output_shape_before_building` + Rule 18). Do NOT start coding until I confirm the design.

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: main   (W#1 is graduated and lives on main)

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: EMPTY — main and workflow-2 are BOTH at the 2026-06-03-h doc-batch SHA.
#   Nothing is held back. If NOT empty, something did not ff-merge as expected — investigate before coding.
```

If `git branch --show-current` shows anything other than `main`, run `./catch-up-workflow 1` (or `git checkout main`).

**Design-first (plan WITH the director per `feedback_plan_output_shape_before_building` + Rule 18 mid-build Read-It-Back):** H-1's per-action undo is the design-sensitive part — some ops reverse trivially (ADD_TOPIC ↔ DELETE_TOPIC); others compose nontrivially (SPLIT_TOPIC, MERGE_TOPICS with auto-reparenting). Present the `AuditEvent` row shape (op type, payload, timestamp, user, before/after state) + the audit-table-first slice + the undo approach, and get my confirmation before building.

**Forced-picker shape (before coding):** fire a Rule 14f AskUserQuestion to let me confirm the H-1 first-slice shape (audit-table-first is the conservative recommendation); the deploy gate is itself a Rule 14f picker; the §4 Step 1c next-pick at end-of-session is a Rule 14f picker.

**Schema-change-in-flight flag:** **NO at entry — but this session WILL flip it YES** when the additive `AuditEvent` Prisma model lands. **Run the Rule 23 Change Impact Audit (classify Additive — a new optional table breaks no downstream consumer; check DATA_CATALOG §7.2.1) + get my explicit authorization via the Rule 9 deploy gate BEFORE any `prisma db push`; additive only; never `migrate reset` against prod.** Flip the flag YES when the schema work starts, back to NO once the additive `prisma db push` lands.

**Test coverage decision:** add node:test coverage for any new pure logic (e.g. an undo-reversal resolver if one is built this slice); the schema + wiring slice itself may warrant unit coverage of the `useEmitAuditEvent()` insert path. Decide the depth WITH me per the slice shipped.

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (expect green; catch any type issue per change)
- Extension tsc clean (UNCHANGED — H-1 is a W#1 web-app + schema change, not extension-side)
- Extension `npm test` = 915 (UNCHANGED unless unexpectedly touched)
- src/lib `node:test` = 1446 (entry 1446; +N for new pure logic)
- `npm run build` = 77 routes (entry 77; +1 if H-1 adds an audit-history API route — likely for the (b) wiring slice)
- Check 6 Playwright per Rule 27 (decide WITH the director — a new UI tab in a later slice may warrant a spec)

**Deploy mechanics:** the H-1 schema slice follows the standard Rule 9 deploy gate + 3-push pattern (ff-merge to `main` → ping-pong sync back → end-of-session doc-batch), with the additive `prisma db push` gated by an explicit director Rule 9 authorization. NO extension build expected.

**Group A docs to update at session end:** ROADMAP header bump + the (a.139) close (if H-1's first slice fully lands) / (a.140) open + the H-1 backlog status note + CHAT_REGISTRY header bump (205th session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header (+ a NEW §Entry only if notable) + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite. (HANDOFF_PROTOCOL header bump only if a rule changes.)

**Group B docs to update at session end:** `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (H-1 status note for the slice shipped) + `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` (bump to v2 if the `AuditEvent` schema migration ships, per the Rule 23 versioned-contract pattern) + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (queue the next H-1 slice) + `docs/DATA_CATALOG.md` (register the `AuditEvent` data item + its Three Living Questions per Rule 7 if a new data item is captured).

**Standing carry-overs into this session:**

- **(a.139) = W#1 H-1 (action history + per-action undo)** — design first, then build the `AuditEvent` schema slice. On `main`.
- **W#1 M-2 — ✅ DONE 2026-06-03-h** + **W#2 — ✅ COMPLETE 2026-06-03-h (residue fully retired)** + **P-63 Phase 2 / P-64 — ✅ DONE 2026-06-03-g** + **P-63 Phase 1 — ✅ DONE 2026-06-03-f** + **P-50 — ✅ DONE 2026-06-03-e** + **P-56 Option-2 — ✅ CLOSED (won't-do) 2026-06-03-e** + **P-43 — ✅ RESOLVED 2026-06-03-d.**
- **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) — FUTURE; do NOT start unprompted.**
- **The deferred W#2 Archive/Data-Contract split** — held until W#3 needs to read W#2 data; do NOT author now.
- **P-62** — the Workflow-11 surveillance card + page (future-workflow; NOT a near-term item).

---

## Why this pointer was written this way (debug aid)

- **(a.139) = W#1 H-1 is the PICK because the director chose it at the §4 Step 1c forced-picker.** W#2 is now COMPLETE (residue fully retired) and W#1 M-2 just shipped, so the queue advances to the highest-priority OPEN W#1 backlog item — H-1, queued at the top of `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` since W#1 graduation.
- **The branch is `main`** — W#1 is graduated and lives on `main` per Rule 22. Use `./catch-up-workflow 1` (or `./resume` / `./resume-workflow 1`); verify the branch immediately.
- **NOTHING is held ahead of main.** Both M-2 deploys + the W#2 close-out were ff-merged in-session; the end-of-session doc-batch ff-merges normally. So `git log origin/main..HEAD` is EMPTY at entry.
- **The FIRST action is DESIGN, not coding.** H-1 is a multi-session epic; next session does the design + the schema slice only, and the per-action undo design must be confirmed with the director before any undo build.
- **The Schema-change-in-flight flag is NO at entry but WILL flip YES this session** — H-1's `AuditEvent` table is an anticipated additive Prisma change requiring the Rule 23 Change Impact Audit + the Rule 9 deploy gate before any `prisma db push`.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.139.alt1) W#1 M-1 server-side migrations** (Main Terms / Terms In Focus / Auto-Analyze checkpoint → server-side per the director's "pick up where they left off on any device" principle; canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` M-1.a/b/c). On `main`.
- **(a.139.alt2) W#1 M-3 validation-retry telemetry** (instrument the late-run validation-retry rate; telemetry-only first, behavioral fix later). On `main`.
- **(a.139.alt3) P-63 Phase 3** (build the OpenAI/ChatGPT + Google Gemini provider adapters — a FUTURE task; ONLY if the director explicitly wants a non-Anthropic model live this session AND supplies that provider's API/SDK docs). On `workflow-2-competition-scraping` (platform-wide registry work).
- **(a.139.alt4) W#1 LOW polish bundle** (L-1 archived-terms post-run visibility / L-2 overlay font-size pass / L-3 pre-flight visibility on Resume / L-4 canvas-size top-bar / L-5 — small low-priority items; a quick W#1 win if the director wants something lighter than H-1). On `main`.
- **(a.139.alt5) P-62 Workflow-11 surveillance card + page** (future-workflow seed; the spec exists; design WITH the director when W#11 kicks off — NOT a near-term item).
