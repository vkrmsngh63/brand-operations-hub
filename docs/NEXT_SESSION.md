# Next session

**Written:** 2026-05-30 (`session_2026-05-30_p49-w5-reviews-analysis-table-fix-session-b` — W#2 polish P-49 W5 Reviews Analysis Table Fix Session B ✅ DEPLOYED-AND-VERIFIED 2026-05-30 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — the SECOND of the 3-session corrective-fix plan locked 2026-05-28-b — initial build commit `351342a` (19 files +1115/-63) plus ONE fix-forward commit FF1 `add00ad` (4 files +257/-55, the only Phase-4 redirect) ff-merged to main under 2 Rule 9 deploy gates. Director Phase 4 verbatim PASS verdict: "Both worked now, everything passed". Closed D-8 + D-9 + D-10 (bulleted half) + D-11 + the Q3 schema-gap carry-over. NEW reusable PATTERN memorialized: **"Write-back-on-cache-hit gap"** (FF1 root cause). **Closes (a.108) RECOMMENDED-NEXT** = P-49 W5 Reviews Analysis Table Fix Session B ✅ DEPLOYED-AND-VERIFIED 2026-05-30. **Opens (a.109) RECOMMENDED-NEXT = P-49 W5 Reviews Analysis Table Fix Session C** on `workflow-2-competition-scraping` per `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 "Fix Session C" sub-section.

---

## What we did this session (in plain terms)

Today's session was a code + ship + verify day. We landed the second of the three corrective-fix sessions on the Competitor Reviews Analysis Table page — this one was about making the AI summaries actually FLOW from the table into the right places on the URL detail page, and about fixing a missing piece of the database so review titles stop getting thrown away.

**The initial build commit `351342a` shipped 6 changes:**

1. **Review titles are no longer dropped.** We added a new (optional) `title` column to the captured-review database table. The browser extension already grabs the review title (e.g. on Amazon and Walmart), but the save step was silently throwing it away before storing it. We wired the title through end-to-end — extension save adapters (Amazon / eBay / Etsy / Walmart) → the website's save endpoint → the editing endpoint → the data shape → the table. On the table, the review-row body now shows the title and the body merged together ("Title. Body") at display time, while editing still only touches the body so the title column never gets corrupted. The database change was additive + optional, took 1.50 seconds, and lost zero data.
2. **Per-review summaries now write back (D-9).** When the AI summarizes a single review, that summary now also lands in the "Your Analysis" box for that review on the URL detail page.
3. **Per-competitor bulleted summaries now write back (D-10, bulleted half).** When the AI produces a competitor-wide bulleted summary, it now gets appended to the bottom of the "Overall Analysis — Captured Reviews" box on the URL detail page (never overwriting what's already there).
4. **Per-review summary cells are now editable (D-11).** We added an Edit button on the per-review summary cells — the same Edit-button style as the banner row — and edits sync back to the database as the single source of truth.
5. **Persistence-on-refresh confirmed (D-8).** Summaries still appear correctly after a page refresh, now also after the schema change.
6. **AUDIT WIN — we did NOT build something that already existed.** The plan claimed the "Overall Analysis — Captured Reviews" box didn't render on the URL detail page. The session-start audit (required by Rule 31) caught that the box ALREADY existed — it shipped weeks ago in P-46 Workstream 2 Session 4. So the only real gap for that box was the write-back (item 3), not building the box. This saved redundant work.

**After deploy, director surfaced ONE round of Phase 4 verification with ONE redirect (FF1).** The summaries that had been generated BEFORE this deploy never showed up in the boxes. Root cause: the write-back code only ran when the AI produced a FRESH summary — but old summaries come back from the cache, which short-circuited before the write-back ran. **FF1 `add00ad`** fixes this by running the write-backs on cache hits too (with a content-check so the same bullet list doesn't get appended twice). This is a genuinely reusable lesson — any feature that does something "after the AI runs" needs to handle the cache-hit path too, not just the fresh-run path.

**Director's verbatim Phase 4 verification result on FF1: "Both worked now, everything passed".**

**Numbers:**

- **FIVE Rule 14f forced-pickers fired this session — 5/5 = 100% Yes-to-Recommended** (Q9 same-as-banner Recommended + Q3 add-this-session Recommended [a "explain in simpler terms" interjection landed on Q3 first; the re-framed plain-terms picker then resolved Recommended — that was a comprehension check, not a reversal] + Phase 2 scope picker Recommended + Phase 3 deploy gate Recommended + FF1 deploy gate Recommended). Running cumulative across recent 10 sessions: 101/104 = 97.1%.
- **TWO Rule 9 deploy gates fired** (initial build `351342a` + FF1 `add00ad` — both director-Yes; standard 3-push pattern per ff-merge per `feedback_approval_scope_per_decision_unit.md`).
- **~6 pushes total** (initial-deploy push main + ping-pong workflow-2 + FF1-deploy push main + ping-pong workflow-2 + the end-of-session doc-batch push pattern).
- **Schema-change-in-flight = YES entry → FLIPPED YES → NO at the initial deploy push** (Q3 `CapturedReview.title` additive nullable column; `db push` 1.50s; zero data loss; exit NO).
- **Post-FF1 /scoreboard 5/5 GREEN at NEW LOCKED baselines:** root tsc clean + extension tsc clean + extension `npm test` = 910/910 UNCHANGED + src/lib `node:test` = **1018/1018** (+34 net cumulative — mergeTitleAndBody 7 + tiptap summary/append helpers 12 + tiptap plaintext/contains 5 + run-batch write-back + cache 6 + review-analysis-update PER_REVIEW 2 + url-reviews title 3 + reviews-by-id title 2, minus 1 replaced test) + `npm run build` = **68 routes UNCHANGED** (the PATCH reuses the existing `[analysisId]` route; GET `/review-analysis` already existed); Check 6 Playwright SKIPPED per Rule 27.

## What's pending from prior sessions — 1 OPEN QUESTION (Q8) + the Fix Session C scope

These are the resume points for Fix Session C. Captured verbatim in `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 "Fix Session C" + §4.

- **Q8 — per-batch endpoint flow-value naming convention for the NEW per-competitor non-bulleted flow.** Options: (a) `flow=per-competitor-nonbulleted` (mirrors the existing `per-competitor-bulleted` shipped W5 Session 3); (b) `flow=per-product-nonbulleted` (matches the enum level `PER_PRODUCT` for clarity). **Decide at start of Fix Session C (THIS upcoming session).**

Also pending (pushed back behind Fix Session C):

- **Category page Block 1 planning resume** (6 open questions from `docs/polish-item-specs/P-49-W5-S4-category-page.md` §4). STILL PENDING; resume after Fix Session C closes.
- **Type page Sessions 4-5** (per `docs/polish-item-specs/P-49-W5-S5-type-page.md` §3). STILL PENDING.

## What we'll do next session (in plain terms)

Next session is **P-49 W5 Reviews Analysis Table Fix Session C** on the `workflow-2-competition-scraping` branch per (a.109) — the THIRD and final corrective-fix session on this page. The session ID is TBD (a likely candidate: `session_2026-05-31_p49-w5-reviews-analysis-table-fix-session-c`).

This is the heaviest of the 3 Fix Sessions. It has FOUR distinct pieces, and the new AI flow is the biggest one:

1. **NEW per-competitor non-bulleted AI flow** (the heaviest piece). A brand-new AI flow that takes each competitor's bulleted summary and produces a detailed prose (paragraph) write-up of that competitor's shortcomings, suitable for a product-comparison page. It writes into the "Competitor Comprehensive Reviews Analysis (non-bulleted)" column (Column 10) AND appends to the bottom of the "Overall Analysis — Captured Reviews" box on the URL detail page (D-10 non-bulleted half). This reuses the validated per-batch flow-dispatch architecture from W5 Session 3's per-competitor bulleted flow, plus the brand-new write-back-on-cache-hit handling from THIS session.
2. **NEW "Auto-create Competitor Comprehensive Reviews Analysis (non-bulleted)" top-of-page button + modal** (mirrors the existing bulleted button + modal) + a per-URL inline non-bulleted button for granular runs.
3. **Excel export (D-7)** — a top-of-page "Export Table" button that exports the Reviews Analysis Table data to an Excel file.
4. **Drag-to-reorder review rows (D-6)** — drag review rows within a URL on this page. Requires a NEW `CapturedReview.sortRankInReviewsTable Int?` schema column (reuse the P-46 W3 S3 @dnd-kit shared debounced-mutation Pattern from 2026-05-23-f).

**Recommended session shape (subject to director's pickers at session start):**

- **Phase 1 (planning Q8 resolution — likely 5-15 min):**
  - Answer Q8 (flow-value naming — `flow=per-competitor-nonbulleted` mirroring the existing bulleted flow is the natural default; pick (b) if director prefers enum-clarity naming).
  - Confirm the Q3-analogue schema-change shape for THIS session's new column (additive nullable `CapturedReview.sortRankInReviewsTable Int?`; expect zero data loss; `npx prisma db push` fires mid-session; Schema-change-in-flight flag FLIPS NO → YES at that point).
  - **Per `feedback_plan_output_shape_before_building.md`, plan the NEW non-bulleted AI flow's output shape with director BEFORE coding** — the prompt content, the paragraph structure/length, the placement, and how it merges into the Overall Analysis box. The flow is brand-new, so this is a genuine output-shape design decision, not a re-confirmation. Fire a Rule 14f picker on the prompt shape.
  - Update `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 (Fix Session C sub-section) + remove Q8 from §4 once answered.
- **Phase 2 (build — Fix Session C scope; likely 120-180 min):** code the 4 pieces per the spec doc §3 "Fix Session C" sub-section. Test coverage: ship the same Pattern as Fix Sessions A + B (positive tests pinning the new non-bulleted flow's prompt + dispatch + write-back-on-cache-hit + the drag-reorder mutation + the Excel export serializer; negative tests asserting unrelated surfaces unchanged).
- **Phase 3 (deploy decision Rule 14f picker):** if Phase 2 lands + scoreboard-verifies, fire a deploy-now-vs-exit picker. If director picks deploy, ff-merge to main + Vercel auto-redeploy + Phase 4 director real-Chrome verification (see deploy mechanics below).

**Director's pre-session homework (optional):**

- Q8 confirmation (flow-value naming — `flow=per-competitor-nonbulleted` by default).
- Think about the desired SHAPE of the non-bulleted prose write-up (how long, what structure, how it reads on a comparison page) — we'll design it together at the top of the session.

**Session shape estimate:** ~120-180 minutes in-Claude depending on Phase 2 scope + FF cycles. BUILD session by default after Phase 1 closes. Phase 3 deploy decision is a Rule 14f picker. Schema-change-in-flight = **YES entry** (the new `CapturedReview.sortRankInReviewsTable` column — additive only; nullable; zero data loss); FLIPPED YES → NO at deploy push completion per the canonical schema-change-ships-to-production transition. After Fix Session C closes, the Reviews Analysis Table page is DONE, and the corrective rebuild moves to the Category page (Sessions 1-3) then the Type page (Sessions 4-5).

## What's still left in the total roadmap (in plain terms)

- **P-49 W#2 Reviews Phase 2 (IN-FLIGHT — Fix Sessions A + B ✅ DEPLOYED; Fix Session C + Category Sessions 1-3 + Type Sessions 4-5 remaining)** — remaining work: the final Fix Session on the Reviews Analysis Table page (Fix C this upcoming session — non-bulleted flow + Excel + drag + 1 more schema column) + the 5-session corrective rebuild from 2026-05-28 (Category Sessions 1-3 + Type Sessions 4-5) pushed back behind the Fix Sessions + Phase 4 verification per session + opportunistic polish. Estimate ~6 more sessions until P-49 W5 closes (Fix C + Category 1 + Category 2 + Category 3 + Type 4 + Type 5).
- **P-50 NEW Condition Pathology card** — small single-session UI addition (one card insertion in two card-array files); director already approved scope; slot in any future session or do standalone on `main`.
- **P-51 NEW per-Project competitive landscape AI summary on `/comprehensive-analysis` page** — slot AFTER P-49 closes (per director directive: P-51 is BETWEEN P-49 and P-50 in next-priority order); spec doc skeleton already in place; build session opens with Q&A per director's directive.
- **P-48 Session 3 (Diagnostic #2 for screen-recording stutter)** — empirical instrumentation to determine why every SCREEN_RECORDING webm is captured at ~6-7 fps actual rate; deferred from earlier sessions.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md` to permanently prevent the cwd-leak Pattern Class; running tally ~31-33+ across recent sessions (minimal/no new reproductions today — absolute-path discipline held). Single-session fix would mechanically prevent this entire bug class.
- **P-26 below-fold scroll capture bugs** + **P-27 capture bugs #9 + #15** — LOW priority; re-evaluate after P-49 closes.
- **W#2 graduation** — deferred until P-49 closes at the workstream-by-workstream level.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started.
- **Infrastructure TODOs** — Supabase file-size offline check (separate operational concern; not blocking workflows).

---

## Status of last session

**P-49 W5 Reviews Analysis Table Fix Session B ✅ DEPLOYED-AND-VERIFIED 2026-05-30** end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`. DEPLOY session: 2 Rule 9 deploy gates fired across initial build `351342a` + FF1 `add00ad`.

**Session shape (DEPLOY — 2 work commits + end-of-session doc-batch + 2 ff-merges + 2 ping-pong syncs):**

- 2 work commits: `351342a` (initial 19 files +1115/-63) + `add00ad` (FF1 4 files +257/-55).
- 1 PENDING: end-of-session doc-batch commit (this doc-batch agent's output) — carries the 7-doc Group A bundle + 1 Group B doc (REVIEWS_PHASE_2_DESIGN.md §B 2026-05-30) + 2 MODIFIED polish-item-specs.

**FIVE Rule 14f forced-pickers fired this session — 5/5 = 100% Yes-to-Recommended:** (1) Q9 per-review Edit UI (same Edit-button as banner Recommended); (2) Q3 schema-change shape (add the column this session Recommended — a "explain in simpler terms" interjection landed first; the re-framed plain-terms picker resolved Recommended; a comprehension check, NOT a reversal); (3) Phase 2 build-scope picker (Recommended); (4) Phase 3 initial-build deploy gate (Recommended); (5) FF1 deploy gate (Recommended). Running cumulative across recent 10 sessions = **101/104 = 97.1% Yes-to-Recommended**.

**TWO Rule 9 deploy gates fired this session.**

**Schema-change-in-flight flag YES entry → FLIPPED YES → NO at the initial deploy push** — entry YES (Q3 `CapturedReview.title` carry-over from Fix Session A) + FLIPPED YES → NO at the `351342a` → main push + exit NO. Additive nullable column; zero data loss; `db push` 1.50s.

**ZERO DEFERRED items at session end (Rule 26)** — 7 in-session tasks; all 7 completed cleanly.

**Baselines locked from this session:** root tsc clean + extension tsc clean + extension `npm test` = **910/910 UNCHANGED** + src/lib `node:test` = **1018/1018** (+34 from 984 entry) + `npm run build` = **68 routes UNCHANGED**.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-30** capturing: (1) NEW reusable PATTERN — "Write-back-on-cache-hit gap" (write-backs tied to fresh-AI-persist silently skip already-cached data; fix is to fire them on cache hits too, with content-dedup for append-semantics targets; the FF1 root cause + a reusable lesson for any AI-run-side-effect feature); (2) Audit-shipped-state mandate paid off (positive) — the Rule 31 session-start audit caught that D-10's "box missing" sub-claim was stale (the box shipped in P-46 W2 Session 4), saving redundant work; (3) P-43 cwd-leak Pattern Class — minimal/no new reproductions this session (absolute-path discipline held; running tally stays ~31-33+).

**NEW §B 2026-05-30 entry appended to `docs/REVIEWS_PHASE_2_DESIGN.md`** (FIFTEENTH build/deploy-session §B entry per Rule 18; SEVENTH W5 entry; captures Fix Session B deploy + FF1 + scoreboard deltas + Q3 schema + the write-back-on-cache-hit Pattern + the audit finding).

**2 polish-item-specs MODIFIED this session:**

- `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` — Status flipped to "Fix Session B SHIPPED-AND-VERIFIED 2026-05-30" + §2 2026-05-30 joint-discussion entry + §3 Fix Session B items all marked ✅ DONE + §4 reduced to Q8 (Q3 + Q9 + Q10 RESOLVED).
- `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` — §3 pointer table — Reviews Analysis Table page status flipped to "Fix Sessions A + B ✅ DEPLOYED-AND-VERIFIED; Fix Session C remaining".

**FIFTY-SECOND end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-49 W5 Reviews Analysis Table Fix Session C begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping` and pre-load context. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry** (after this session's end-of-session doc-batch lands + the standard 3-push ping-pong sync fires): `workflow-2-competition-scraping` **even with `origin/main`** — both branches at the same SHA = the post-doc-batch SHA after ff-merge. Verify with `git log main..HEAD --oneline` showing **0 commits ahead** at session entry. If shown as N>0 commits ahead, the doc-batch may not have ff-merged — surface to director.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files since this NEXT_SESSION.md references P-43 + P-49 + P-50 + P-51; Claude reads all matching §3 sections as part of the start-of-session routine):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate as of 2026-05-28-b).
- **`docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 end-to-end** (THE source-of-truth for Fix Session C scope — read the "Fix Session C" sub-section in particular; all 4 pieces — non-bulleted flow + non-bulleted button + Excel + drag) + §4 (Q8 — pick at session-start planning) + §2 (the Fix Session B 2026-05-30 joint-discussion entry summarizing the write-backs + Q3 schema + the FF1 cache-hit fix + verbatim director "Both worked now, everything passed" PASS verdict).
- Master spec doc `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` (skim §3 pointer table for context — Reviews Analysis Table page is now 🟡 PARTIAL after Fix Sessions A + B; Category page still 🟡 SPEC LOCKED + wrong-spec-build SHIPPED + REVERTED; Type page still 🟢 SPEC LOCKED + not yet shipped) + the §1 verbatim spec for the non-bulleted flow (the verbatim instruction for the "Auto-create Competitor Comprehensive Reviews Analysis (non-bulleted)" button + the merge-into-Overall-Analysis-box directive).
- `docs/polish-item-specs/P-49-W5-S4-category-page.md` §3 (canonical reference for Category page Sessions 1-3 — pushed back behind Fix Session C but useful background) + `docs/polish-item-specs/P-49-W5-S5-type-page.md` §3 (Type page Sessions 4-5 — also pushed back).
- `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-30 (THE canonical entry for Fix Session B deploy + FF1 + scoreboard deltas + Q3 schema + the write-back-on-cache-hit Pattern) + §B 2026-05-29 (Fix Session A 4-FF cascade) + §B 2026-05-27-c (W5 Session 3 Per-Competitor bulleted — the v3 critique-only theme-emergent prompt + PATCH endpoint + flow-dispatch architecture the NEW non-bulleted flow extends) + §B 2026-05-27-b (W5 Session 2 per-batch endpoint architecture) + §B 2026-05-28-b (the divergence + 3-session fix plan) + §B 2026-05-28 (the scope-misread rollback + 5-session corrective rebuild plan).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-30 (THE Fix Session B informational entry — the "Write-back-on-cache-hit gap" Pattern + the audit-shipped-state positive win + P-43 running tally) + §Entry 2026-05-29 (Fix Session A — the bundling-Pattern record + Q3 schema-gap discovery + the Cell-level click handlers Pattern) + §Entry 2026-05-27-c (the "Edit affordance for cached AI output Pattern" the non-bulleted flow's write-back relies on).
- `docs/ROADMAP.md` lines 1-30 (header + recent session sequence) + the **P-49 polish-backlog entry** (Status: "🟢 IN-FLIGHT 2026-05-30 — Fix Session B ✅ DEPLOYED-AND-VERIFIED; Fix Session C + Category Sessions 1-3 + Type Sessions 4-5 remaining" with cross-reference to the 4 P-49 spec docs + the Fix Session A + B deploy commit hashes).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - `feedback_plan_output_shape_before_building.md` — DIRECTLY relevant to Fix Session C: the NEW non-bulleted AI flow is a genuine output-shape design decision (prompt content + paragraph structure/length + placement), NOT a re-confirmation — plan the output shape with director BEFORE coding via a Rule 14f picker.
  - `feedback_browser_first_ai_with_server_migration.md` — the default-to-browser-first AI directive; PARTIALLY SUPERSEDED for the Reviews Analysis Table page's AI flows per director's verbatim server-side spec.
  - `feedback_recommendation_style.md` + `feedback_default_to_recommendation.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_deferred_items_registry.md` + `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md`.
- **Fix Sessions A + B shipped reference files** (the canonical reference implementation — Fix Session C extends these with the NEW non-bulleted flow + Excel + drag):
  - `src/app/projects/[projectId]/competition-scraping/competitor-reviews-analysis/page.tsx` — Table 2 page; Fix Session C ADDS the non-bulleted top-of-page button + modal + Column 10 rendering + drag-to-reorder review rows + Excel export button.
  - `src/lib/competition-scraping/handlers/review-analysis-run-batch.ts` — the per-batch handler with flow-dispatch branches + the NEW `writeBackPerCompetitorReviews` shared helper + write-back-on-cache-hit handling shipped THIS session; Fix Session C ADDS the per-competitor non-bulleted flow branch + its write-back (reads `analysisJson.flow` per Q8).
  - `src/lib/competition-scraping/tiptap-helpers.ts` — `summaryStringToTipTapDoc` / `appendSummaryToTipTapDoc` / `tipTapDocToPlainText` / `tipTapDocContainsSummary`; Fix Session C reuses these for the non-bulleted write-back's append + content-dedup.
  - `src/lib/competition-scraping/handlers/review-analysis-update.ts` (PATCH handler; now accepts PER_REVIEW edits) + `src/lib/competition-scraping/handlers/review-analysis-list.ts` (persistence-on-refresh).
  - `src/app/projects/[projectId]/competition-scraping/url/[urlId]/page.tsx` + `UrlDetailContent.tsx` — the "Overall Analysis — Captured Reviews" box (already renders; the non-bulleted write-back appends to its `CompetitorUrl.overallAnalyses["reviews"]` slot).
  - The existing per-competitor bulleted modal + the global "Summarize Reviews for All Competitors" button + `GlobalCompetitorSummarizeModal.tsx` (W5 Session 3) — the NEW non-bulleted button + modal mirror this shape.
  - `prisma/schema.prisma` — read the `CapturedReview` model (now carries `title String?` from Fix Session B + the existing `sortRank Int?` from W4); Fix Session C adds `CapturedReview.sortRankInReviewsTable Int?` (additive, nullable, zero data loss) + fires `npx prisma db push` mid-session (Schema-change-in-flight FLIPS NO → YES at that point).
  - The P-46 W3 S3 @dnd-kit shared debounced-mutation Pattern (2026-05-23-f) — reuse for the drag-to-reorder review rows.
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (1-2 gates planned by default for Fix Session C — schema change + new AI flow both warrant a Phase 3 deploy-decision picker after Phase 2 lands) + Rule 14f (forced-picker mechanics — expect ~4-6 to fire: Q8 + non-bulleted prompt-shape picker + Phase 2 build-scope picker + Phase 3 deploy-now-vs-exit picker + per-FF deploy gates + §4 Step 1c next-task picker at session-end) + Rule 18 (§A frozen + §B append-only; today's §B 2026-05-30 is the latest entry to anchor cross-references against) + Rule 21 + Rule 22 + Rule 23 (Change Impact Audit — PLOS-side UI + src/lib + schema-change-in-flight FLIPS NO → YES mid-session at `prisma db push`) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + Rule 31 (read §3 of the spec doc at session start via the SessionStart hook + audit shipped state) + §4 Step 4b extended template.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31 (with NEW 2026-05-28-b mechanical read-guarantee + audit-shipped-state mandate sub-sections), the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block listing the polish-item-specs files; read §3 of each at session start as part of your pre-build read sequence. ALSO audit any shipped sister surfaces on the in-flight P-49 W5 workstream against the master verbatim spec at session start per the audit-shipped-state mandate — this paid off twice now (it caught the stale "Overall Analysis box missing" sub-claim in Fix Session B).**

**Session goal:** P-49 W5 Reviews Analysis Table Fix Session C on `workflow-2-competition-scraping` per `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 "Fix Session C" sub-section — (1) NEW per-competitor non-bulleted AI flow (prose paragraph write-up of competitor shortcomings) writing into Column 10 "Competitor Comprehensive Reviews Analysis (non-bulleted)" + appending to the bottom of the "Overall Analysis — Captured Reviews" box on the URL detail page (D-10 non-bulleted half) — reuses the W5 Session 3 per-batch flow-dispatch architecture + the write-back-on-cache-hit handling from Fix Session B; (2) NEW "Auto-create Competitor Comprehensive Reviews Analysis (non-bulleted)" top-of-page button + modal (mirrors the bulleted button + modal) + per-URL inline non-bulleted button; (3) Excel export (D-7) — top-of-page "Export Table" button exporting the Reviews Analysis Table to an Excel file; (4) drag-to-reorder review rows (D-6) — requires NEW `CapturedReview.sortRankInReviewsTable Int?` schema column (reuse the P-46 W3 S3 @dnd-kit shared debounced-mutation Pattern); (5) /scoreboard + deploy decision Rule 14f. **Schema-change-in-flight = YES entry state** (the new `sortRankInReviewsTable` column). 1-2 Rule 9 deploy gates planned.

**Branch verify (do this immediately after the resume script lands):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping

git log main..HEAD --oneline | wc -l
# Expected: 0 (workflow branch even with main after the standard 3-push ping-pong sync)

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)
```

If `git branch --show-current` shows `main`, STOP and surface to director. If `git log main..HEAD --oneline | wc -l` shows N>0, surface — the doc-batch ff-merge may not have completed.

**Phase 1 (Q8 resolution + non-bulleted prompt-shape design + audit-shipped-state confirmation — likely 5-20 min):**

Per the audit-shipped-state mandate, confirm at session start that the `/competitor-reviews-analysis` page on the live site still matches the Fix Session A + B end-state (10-column layout + show/hide + click-to-edit + Column 8 plain-text count + Column 8/9 expand-collapse cells + persistence-on-refresh + drag-to-resize + sticky header + the new write-backs landing in the URL detail page boxes + the title display-merge on review-row body). Spot-check on vklf.com. If anything has regressed out-of-band, surface to director.

Ask director Q8 (flow-value naming — `flow=per-competitor-nonbulleted` mirroring the existing bulleted flow by default; pick (b) `flow=per-product-nonbulleted` if director prefers enum-clarity). Confirm the schema-change shape (additive nullable `CapturedReview.sortRankInReviewsTable Int?` column; zero data loss; `npx prisma db push` fires mid-session). **Per `feedback_plan_output_shape_before_building.md`, fire a Rule 14f picker on the NEW non-bulleted AI flow's output shape BEFORE coding** — the prompt content, the paragraph structure/length, the placement, how it merges into the Overall Analysis box. This is a genuine output-shape design decision (the flow is brand-new), not a re-confirmation. Update `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 (Fix Session C sub-section) + remove Q8 from §4.

**Phase 2 (build — Fix Session C scope; fires a Rule 14f scope picker first):**

Fire a Rule 14f forced-picker after Phase 1 closes:

- **Option A (Recommended):** Proceed to Phase 2 (build the full Fix Session C scope per §3 — the 4 pieces above; YES schema change for the new sort-rank column; the non-bulleted flow is the heaviest piece).
- **Option B:** Split — ship the non-bulleted flow + non-bulleted button this session; defer Excel + drag-to-reorder to a follow-up. (Useful if the non-bulleted flow's Phase 4 surfaces many redirects.)
- **Option C (escape-hatch):** Director writes free-text directive shaping the scope differently.

If director picks Option A, build the Fix Session C scope per the consolidated §3 spec. Test coverage: ship the same Pattern as Fix Sessions A + B (positive tests pinning the non-bulleted flow's prompt + dispatch + write-back-on-cache-hit + the drag-reorder mutation + the Excel export serializer; negative tests asserting unrelated surfaces unchanged).

**Phase 3 (deploy decision):**

If Phase 2 lands + scoreboard-verifies, fire a Rule 14f deploy-now-vs-exit picker. If director picks deploy, ff-merge to main + Vercel auto-redeploy + Phase 4 director real-Chrome verification on:

- the NEW per-competitor non-bulleted flow generating prose write-ups + landing in Column 10;
- the non-bulleted write-back appending to the bottom of the "Overall Analysis — Captured Reviews" box on the URL detail page (never overwriting the bulleted content above it);
- the NEW "Auto-create ... (non-bulleted)" button + modal working (top-of-page + per-URL inline);
- the Excel export producing a correct file;
- drag-to-reorder review rows persisting via the new `sortRankInReviewsTable` column.

If Phase 4 surfaces redirects, bundle multi-redirect Phase 4 issues into single FFs per the canonical "Same-day Phase 4 multi-redirect bundling Pattern" — and remember the write-back-on-cache-hit lesson from Fix Session B (the new non-bulleted write-back must fire on cache hits too, with content-dedup, or pre-deploy-generated non-bulleted summaries won't appear).

**Scoreboard targets** (entry baselines = today's Fix Session B exit baselines):

- Root tsc clean (UNCHANGED)
- Extension tsc clean (UNCHANGED)
- Extension `npm test` = 910/910 (UNCHANGED — Fix Session C is PLOS-side only; no extension changes)
- src/lib `node:test` ≥ 1018 (entry 1018; expect +N for new non-bulleted flow prompt + dispatch tests + write-back-on-cache-hit tests + drag-reorder mutation tests + Excel serializer tests; rough estimate +15-30)
- `npm run build` = 68 routes (likely UNCHANGED — the non-bulleted flow reuses the existing per-batch route via the `flow` discriminator; confirm no new route is needed for Excel export — a client-side serializer adds 0 routes; a server-side export endpoint would add +1)
- Check 6 Playwright SKIPPED per Rule 27 standing precedent (BUILD/DEPLOY session)

**Deploy mechanics:** 1-2 Rule 9 deploy gates planned by default for this session (1 if Phase 2 + Phase 3 deploy fires; +N for FF cycles after Phase 4). If deploy fires, expect the standard 3-push pattern per ff-merge (workflow-2 push + ff-merge to main + push main + ping-pong workflow-2) per `feedback_approval_scope_per_decision_unit.md`; if fix-forwards needed, bundle multi-redirect Phase 4 issues into single FFs.

**Schema-change-in-flight flag:** **YES entry** (the new `CapturedReview.sortRankInReviewsTable Int?` column — additive only; nullable; zero data loss). FLIPPED YES → NO at deploy push completion per the canonical schema-change-ships-to-production transition.

**Group A docs to update at session end** (7-doc bundle assuming no new rules or memory files): ROADMAP header bump + P-49 polish-backlog entry status update (Fix Session C outcome + cumulative Fix-Session-A-B-C deploy commit hashes + Reviews Analysis Table page CLOSED) + CHAT_REGISTRY header bump (175th session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header + 1 NEW §Entry capturing Fix Session C outcome + HANDOFF_PROTOCOL header bump only + CLAUDE_CODE_STARTER header bump only + NEXT_SESSION full rewrite for next session (likely Category page Block 1 planning resume).

**Group B docs to update at session end:** NEW §B 2026-05-31 (or session-letter date) entry in `docs/REVIEWS_PHASE_2_DESIGN.md` (SIXTEENTH build/deploy-session §B entry per Rule 18; EIGHTH W5 entry). UPDATE `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §2 + §3 + §4 in real-time during the session (Fix Session C closes the page — mark §3 Fix Session C items ✅ DONE + resolve Q8 in §4 + flip the Status line to all-3-Fix-Sessions DONE). UPDATE `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §3 pointer table — Reviews Analysis Table page status flips from 🟡 PARTIAL toward ✅ DONE (Fix Session C closes D-6 drag + D-7 Excel + D-10 non-bulleted half + the new per-competitor non-bulleted AI flow).

**Standing carry-overs from this session:**

- **Q8** (flow-value naming for the NEW per-competitor non-bulleted flow) — resolved at start of Fix Session C (THIS upcoming session).
- **Non-bulleted AI flow output shape** (prompt content + paragraph structure/length + placement) — designed with director at the top of Fix Session C per `feedback_plan_output_shape_before_building.md`.
- **Category page Block 1 planning resume** (6 questions from 2026-05-28's NEXT_SESSION pointer) — STILL PENDING; pushed back behind Fix Session C; will resume after Fix Session C closes.
- **Type page Sessions 4-5** — STILL PENDING; behind Category page.

---

## Alternate next-session candidates if director shifts priorities at session start

- **(A.109.alt1) P-49 W5 Reviews Analysis Table Fix Session C** (current PICK — pre-loaded above). Closes the Reviews Analysis Table page entirely (the third + final Fix Session).
- **(A.109.alt2) P-49 W5 Category page Block 1 planning resume** (2026-05-28's plan; pushed back behind the Fix Sessions but still queued — answer the 6 open questions from `docs/polish-item-specs/P-49-W5-S4-category-page.md` §4 + open Block 2 schema planning). Useful if director wants to keep both Reviews Analysis Table fix work AND Category page planning moving in parallel; but Fix Session C is the natural next step since it closes the page.
- **(A.109.alt3) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`). Running tally ~31-33+ reproductions; would mechanically prevent the entire bug class. Useful as a quick palate-cleanser session between heavier P-49 work.
- **(A.109.alt4) P-50 Condition Pathology card** (single-session — add a NEW card to two card-array files). Director already approved scope; also a quick palate-cleanser session.
- **(A.109.alt5) P-51 per-Project competitive landscape AI summary** (per `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md` skeleton — build session opens with Q&A per director directive). Slotted AFTER P-49 closes per director's priority order, but available if director wants to start the Q&A early.
