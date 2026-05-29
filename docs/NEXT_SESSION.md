# Next session

**Written:** 2026-05-31 (`session_2026-05-31_p49-w5-reviews-analysis-table-fix-session-d` — W#2 polish P-49 W5 Reviews Analysis Table Fix Session D ✅ DEPLOYED-AND-VERIFIED 2026-05-31 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — RE-SEQUENCED ahead of the planned Fix Session C per director's session-start Rule 14f pick — initial build commit `4db2b5c` (8 files +1052/-276) plus ONE fix-forward commit FF1 `889667e` (4 files +318/-54, the only Phase-4 redirect) ff-merged to main under 2 Rule 9 deploy gates. Director Phase 4 verdict: table feature "Both worked"; FF1 "Pass". The "Overall Analysis — Captured Reviews" box on the URL detail page is now a read-only 3-column traceability table (Category / Complaint / source captured reviews + star counts). NEW reusable PATTERN: **"Transient DB-auth 500 under AI-batch load → client-side autosave retry"** (FF1 root cause). **Closes (a.109) RECOMMENDED-NEXT with a twist** — (a.109) was "P-49 W5 Fix Session C"; this session RE-SEQUENCED and shipped Fix Session D instead; Fix Session C remains pending. **Opens (a.110) RECOMMENDED-NEXT = P-49 W5 Reviews Analysis Table follow-ups** on `workflow-2-competition-scraping` (delete-from-table feature + deleted-reviews sync bug + THEN Fix Session C).

---

## What we did this session (in plain terms)

Today was a code + ship + verify day, and it took a turn at the very start. We had planned to do "Fix Session C" (a new AI writing style + an Excel export + drag-to-reorder). But while we were sitting down to design the new AI writing style, you re-pasted an earlier feature idea — turning the big "Overall Analysis — Captured Reviews" box on a competitor's detail page into a neat 3-column table — and decided you'd rather build THAT today. So we re-ordered the plan: we shipped the table feature ("Fix Session D") today, and "Fix Session C" is still on the list for next time.

**The initial build commit `4db2b5c` did two big things:**

1. **The AI now produces structured output instead of a free-text bullet list.** Previously the per-competitor review summary was just a wall of bullets. Now the AI returns its findings as a tidy structure — a set of categories, each with complaints, and for each complaint, exactly which of that competitor's reviews it came from. To make this reliable, we label the reviews R1, R2, R3... when we hand them to the AI, and the AI cites those labels; the system then maps each label back to the real review. We still keep a plain-text version of the summary under the hood so nothing else on the main table breaks.
2. **The box on the URL detail page became a read-only 3-column table.** Column 1 = Category, Column 2 = the specific complaint, Column 3 = the actual customer reviews behind that complaint (full review text + star count). We put this table at the top of that area, and the old free-text box is still there underneath — just relabeled "Your notes — Captured Reviews" so you can still type your own notes.

You confirmed three design choices up front (all the recommended option): table on top with your notes below it; the generated table is read-only; and the source column shows the full review text.

**After deploy, you reported one problem (FF1).** Lots of the "Your Analysis" and notes boxes were showing "Save failed — HTTP 500", and a page refresh fixed it. We traced it: every time you type in one of those boxes, it saves, and each save quietly does a small database write to confirm your access. During and right after a heavy AI run, the database connection pool gets briefly overloaded, that small write fails, and the save errors out — leaving the box stuck until you refresh. This was NOT caused by today's table work; the heavy AI run just exposed a pre-existing fragility. **FF1 `889667e`** fixes it by automatically retrying those saves a few times with increasing delays (only for temporary server/network errors, never for real "you can't do that" errors). A brief database hiccup now heals itself silently.

**Your verbatim Phase 4 verification results: the table feature "Both worked"; FF1 "Pass".**

**Two NEW items came up that we deliberately did NOT build today** (you'll decide on them next session):

- You want to be able to DELETE entries from the new 3-column table — one at a time and in bulk. This reverses today's "read-only" decision, so it needs a quick design chat first (what exactly does a delete remove, and how does the select-and-delete work).
- You found a bug: when you delete a captured review on a competitor's detail page, it still shows up on the big reviews-analysis table for that product. That's a stale-cache problem on the analysis page — it needs a refresh-after-delete fix.

**Numbers:**

- **SEVEN Rule 14f forced-pickers fired this session — 7/7 = 100% Yes-to-Recommended** (the re-sequence-to-Fix-D pick + 3 design-decision picks [box layout / editability / source-text] + the initial-build deploy gate + the FF1 deploy gate + the end-of-session "what's next" pick [defer both new issues, then Fix C]). There was also one comprehension interjection — you paused the design picker to ask "what were you referring to" and then re-pasted the addendum; that was a clarification that led to the re-sequence, not a reversal. Running cumulative across recent 10 sessions: 108/111 = 97.3%.
- **TWO Rule 9 deploy gates fired** (initial build `4db2b5c` + FF1 `889667e` — both director-Yes).
- **~5 pushes total** (initial-deploy push main + ping-pong workflow-2 + FF1-deploy push main + ping-pong workflow-2 + the end-of-session doc-batch push pattern).
- **Schema-change-in-flight = NO the entire session** (entry NO → exit NO). The new structured table data lives inside the database column that already existed (`ReviewAnalysis.analysisJson`) — no database migration, no data risk. (This differs from the prior pointer's plan, which expected a YES entry for a `sortRankInReviewsTable` column — that column belongs to Fix Session C, which we did not build.)
- **Post-FF1 /scoreboard all GREEN at NEW LOCKED baselines:** root tsc clean + extension tsc clean + extension `npm test` = 910/910 UNCHANGED + src/lib `node:test` = **1038/1038** (+20 from 1018 — +11 for the structured prompt/resolver/flatten + traceability helpers, +9 for the autosave-retry helper) + `npm run build` = **68 routes UNCHANGED** (the table reuses the existing GET /review-analysis route — no new route); Check 6 Playwright SKIPPED per Rule 27.

## What's pending from prior sessions — the 2 NEW follow-ups + Q8 + the Fix Session C scope

Captured in `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 (Fix Session D ✅ DONE + the 2 follow-up items + Fix Session C) + §4 (Q11 delete-from-table design + Q8 flow-naming).

- **FU-1 — delete-from-table feature (NEW director item; resolve design first).** Delete entries from the Overall Analysis traceability table, individually + in bulk. Reverses the read-only decision. Open design (Q11 in §4): delete unit (complaint row? whole category? a single source review in Column 3?), individual + bulk-select UX, and that the delete trims `analysisJson.categories` via PATCH WITHOUT touching the underlying `CapturedReview`s.
- **FU-2 — deleted-reviews sync bug (NEW director bug).** Deleting captured reviews on a URL detail page doesn't remove them from the `/competitor-reviews-analysis` table. Root cause: the analysis page lazy-loads reviews into a `reviewsByUrl` state cache on row-expand (`competitor-reviews-analysis/page.tsx` ~L519-545) and doesn't invalidate/refetch after a cross-page deletion; dependent summary maps (`summaryByReviewId` / `competitorSummaryByUrlId`) likely also need pruning.
- **Q8 — flow-value naming** for the NEW per-competitor non-bulleted flow (Fix Session C). Options: (a) `flow=per-competitor-nonbulleted` (mirrors the shipped bulleted flow — natural default); (b) `flow=per-product-nonbulleted`. Decide at start of Fix Session C.

Also still pending (behind the above):

- **Category page Block 1 planning resume** (6 open questions from `docs/polish-item-specs/P-49-W5-S4-category-page.md` §4).
- **Type page Sessions 4-5** (per `docs/polish-item-specs/P-49-W5-S5-type-page.md` §3).

## What we'll do next session (in plain terms)

Next session is **P-49 W5 Reviews Analysis Table follow-ups** on the `workflow-2-competition-scraping` branch per (a.110), in this order:

1. **Delete-from-table feature (FU-1) — START with a design chat, THEN build.** You want to delete entries from the new 3-column table (one at a time + in bulk). Because this reverses today's "read-only" decision, we'll plan the shape together FIRST (per `feedback_plan_output_shape_before_building.md`): what a delete removes (a complaint? a whole category? a single source review?), how the select-and-delete works, and how the delete trims the saved data without touching the actual customer reviews. Then build it.
2. **Deleted-reviews sync bug (FU-2).** Make the big reviews-analysis table refresh its cached reviews when you delete a review elsewhere, so deleted reviews disappear from that table (and from the summary counts) right away.
3. **Fix Session C** (the heaviest piece, comes after the two above) — a brand-new per-competitor non-bulleted (prose-paragraph) AI writing style + its button/modal + an Excel "Export Table" button + drag-to-reorder for the review rows + a new `CapturedReview.sortRankInReviewsTable` database column. THIS is where the schema-change-in-flight flag flips to YES.

**Recommended session shape (subject to your pickers at session start):**

- **Phase 1 (FU-1 design chat — likely 10-25 min):** plan the delete-from-table shape with you via a Rule 14f picker (delete unit / individual + bulk-select UX / PATCH-trims-analysisJson.categories without touching CapturedReviews). Update `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §4 Q11 with the answer + §3.
- **Phase 2 (build FU-1 + FU-2):** code the delete-from-table feature + the deleted-reviews sync fix. Test coverage: positive tests pinning the PATCH-trim logic (analysisJson.categories trimmed; CapturedReviews untouched) + the cache-invalidation/refetch on the analysis page; negative tests asserting unrelated surfaces unchanged.
- **Phase 3 (deploy decision Rule 14f):** if Phase 2 lands + scoreboard-verifies, fire a deploy-now-vs-exit picker. Whether to bundle Fix Session C into the same session or split it to a later session is itself a Rule 14f pick at the top of the session (FU-1 + FU-2 are smaller; Fix C is large + carries the only schema change — splitting it is the likely Recommended shape).

**Director's pre-session homework (optional):**

- Think about the delete-from-table behavior: when you delete from the new 3-column table, what should disappear — a single complaint line, a whole category, or just one of the customer reviews listed under a complaint? And do you want a checkbox-style multi-select for bulk deletes?

**Session shape estimate:** ~60-120 minutes for FU-1 + FU-2 (plus the design chat); Fix Session C is a separate ~120-180-minute body of work that may be its own session. **Schema-change-in-flight at next-session entry = NO** (FU-1 + FU-2 are both UI/handler-side, no schema change), flipping **YES only when Fix Session C's `CapturedReview.sortRankInReviewsTable` migration fires** (additive, nullable, zero data loss).

## What's still left in the total roadmap (in plain terms)

- **P-49 W#2 Reviews Phase 2 (IN-FLIGHT — Fix Sessions A + B + D ✅ DEPLOYED; FU-1 + FU-2 + Fix Session C + Category Sessions 1-3 + Type Sessions 4-5 remaining)** — remaining work: the 2 NEW follow-ups (delete-from-table feature + deleted-reviews sync bug, next session) + Fix Session C (non-bulleted prose AI flow + Excel export + drag-to-reorder + 1 new schema column) + the 5-session corrective rebuild from 2026-05-28 (Category Sessions 1-3 + Type Sessions 4-5). Estimate ~7-8 more sessions until P-49 W5 closes.
- **P-50 NEW Condition Pathology card** — small single-session UI addition (one card insertion in two card-array files); director already approved scope; slot in any future session or do standalone on `main`.
- **P-51 NEW per-Project competitive landscape AI summary on `/comprehensive-analysis` page** — slot AFTER P-49 closes (per director directive: P-51 is BETWEEN P-49 and P-50 in next-priority order); spec doc skeleton already in place; build session opens with Q&A.
- **P-48 Session 3 (Diagnostic #2 for screen-recording stutter)** — empirical instrumentation to determine why every SCREEN_RECORDING webm is captured at ~6-7 fps actual rate; deferred.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md` to permanently prevent the cwd-leak Pattern Class; running tally ~31-33+ (no notable new reproductions today — absolute-path discipline held). Single-session fix.
- **P-26 below-fold scroll capture bugs** + **P-27 capture bugs #9 + #15** — LOW priority; re-evaluate after P-49 closes.
- **W#2 graduation** — deferred until P-49 closes at the workstream-by-workstream level.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started.
- **Infrastructure TODOs** — Supabase file-size offline check (separate operational concern; not blocking workflows). NOTE: today's FF1 surfaced a transient Supabase connection-pool saturation under heavy AI batch load — the autosave-retry helper papers over it client-side; a future infra-side look at pool sizing / connection management may be warranted if the 500s recur on other autosave surfaces.

---

## Status of last session

**P-49 W5 Reviews Analysis Table Fix Session D ✅ DEPLOYED-AND-VERIFIED 2026-05-31** end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — RE-SEQUENCED ahead of the planned Fix Session C per director's session-start Rule 14f pick. DEPLOY session: 2 Rule 9 deploy gates fired across initial build `4db2b5c` + FF1 `889667e`.

**Session shape (DEPLOY — 2 work commits + end-of-session doc-batch + 2 ff-merges + 2 ping-pong syncs):**

- 2 work commits: `4db2b5c` (initial 8 files +1052/-276) + `889667e` (FF1 4 files +318/-54).
- 1 PENDING: end-of-session doc-batch commit (this doc-batch agent's output) — carries the Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION) + 1 Group B doc (REVIEWS_PHASE_2_DESIGN.md §B 2026-05-31) + 2 MODIFIED polish-item-specs.

**SEVEN Rule 14f forced-pickers fired this session — 7/7 = 100% Yes-to-Recommended:** (1) re-sequence-to-Fix-D; (2-4) three design-decision pickers (box layout / editability / source-text); (5) initial-build deploy gate; (6) FF1 deploy gate; (7) end-of-session sequencing picker for the 2 new issues (defer-both Recommended). ALSO one comprehension interjection (the director paused the output-shape design picker to ask "what were you referring to" + re-pasted the addendum — a clarification that LED to the re-sequence pick, NOT a reversal). Running cumulative across recent 10 sessions = **108/111 = 97.3% Yes-to-Recommended**.

**TWO Rule 9 deploy gates fired this session.**

**Schema-change-in-flight flag NO entire session (entry NO → exit NO)** — the structured traceability shape lives in the EXISTING `ReviewAnalysis.analysisJson` Json column; zero migration, zero data risk.

**2 NEW DEFERRED items at session end (Rule 26)** — 6 in-session tasks completed; 2 NEW DEFERRED follow-ups captured (delete-from-table feature [FU-1] + deleted-reviews sync bug [FU-2]).

**Baselines locked from this session:** root tsc clean + extension tsc clean + extension `npm test` = **910/910 UNCHANGED** + src/lib `node:test` = **1038/1038** (+20 from 1018 entry) + `npm run build` = **68 routes UNCHANGED**.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-31** capturing: (1) NEW reusable PATTERN — "Transient DB-auth 500 under AI-batch load → client-side autosave retry" (per-keystroke autosaves route through `verifyProjectWorkflowAuth`'s `projectWorkflow.upsert` DB write; under heavy-AI-run Supabase pool saturation the upsert transiently throws → HTTP 500 → box stranded until refresh; fix = shared `saveWithRetry` with exponential backoff on 5xx/network, applied to both analysis boxes); (2) the Fix-D-ahead-of-Fix-C re-sequence (process note, not a slip); (3) audit-shipped-state mandate held (the box rendered exactly as Fix B left it); (4) P-43 cwd-leak running tally ~31-33+ (no notable new reproductions). NO new memory file (the autosave-retry Pattern lives in code + the CORRECTIONS_LOG entry).

**NEW §B 2026-05-31 entry appended to `docs/REVIEWS_PHASE_2_DESIGN.md`** (SIXTEENTH build/deploy-session §B entry per Rule 18; EIGHTH W5 entry; captures the re-sequence + structured v4 prompt + traceability table + box→table change + "Your notes" relabel + FF1 autosave-retry + scoreboard deltas + schema-change NO).

**2 polish-item-specs MODIFIED this session:**

- `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` — Status line updated (Fix Sessions A + B + D ✅ DEPLOYED-AND-VERIFIED) + §2 NEW 2026-05-31 joint-discussion entry + §3 Fix Session D scope marked ✅ DONE + the 2 NEW follow-up items added + §4 NEW Q11 delete-from-table design question.
- `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` — §3 pointer table — Reviews Analysis Table page now "Fix Sessions A + B + D ✅ DEPLOYED-AND-VERIFIED; Fix Session C + 2 new follow-ups remaining".

**FIFTY-THIRD end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-49 W5 Reviews Analysis Table follow-ups begin here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping` and pre-load context. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry** (after this session's end-of-session doc-batch lands + the standard 3-push ping-pong sync fires): `workflow-2-competition-scraping` **even with `origin/main`** — both branches at the post-doc-batch SHA after ff-merge. Verify with `git log main..HEAD --oneline` showing **0 commits ahead** at session entry. If shown as N>0 commits ahead, the doc-batch may not have ff-merged — surface to director.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files since this NEXT_SESSION.md references P-43 + P-49 + P-50 + P-51; read §3 of each at session start):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate as of 2026-05-28-b).
- **`docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 end-to-end** (THE source-of-truth — the Fix Session D scope is now ✅ DONE; the 2 NEW follow-up items FU-1 + FU-2 are listed there; Fix Session C scope is the "Fix Session C" sub-section) + §4 (Q11 delete-from-table design — resolve at session-start planning; Q8 flow-naming for Fix C) + §2 (the Fix Session D 2026-05-31 joint-discussion entry — the re-sequence + the 3 design decisions + structured v4 + box→table + FF1 autosave-retry + verbatim director "Both worked" / "Pass" verdicts).
- Master spec doc `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` (skim §3 pointer table — Reviews Analysis Table page is now "Fix Sessions A + B + D ✅ DEPLOYED-AND-VERIFIED; Fix Session C + 2 new follow-ups remaining"; Category page still 🟡 SPEC LOCKED + wrong-spec-build REVERTED; Type page still 🟢 SPEC LOCKED).
- `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-31 (THE canonical entry for Fix Session D — the structured-analysis shape + the read-only traceability table + the autosave-retry Pattern + scoreboard deltas) + §B 2026-05-30 (Fix Session B — the box write-back this session replaced) + §B 2026-05-27-c (W5 Session 3 Per-Competitor bulleted — the v3 prompt + per-batch flow-dispatch architecture the v4 structured prompt extends, which Fix Session C's non-bulleted flow also reuses) + §B 2026-05-27-b (W5 Session 2 per-batch endpoint architecture).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-31 (THE Fix Session D informational entry — the "Transient DB-auth 500 → autosave retry" Pattern + the re-sequence process note + the 2 follow-up items + P-43 running tally) + §Entry 2026-05-30 (Fix Session B — "Write-back-on-cache-hit gap") + §Entry 2026-05-27-c (the "Edit affordance for cached AI output Pattern").
- `docs/ROADMAP.md` lines 1-30 (header + recent session sequence) + the **P-49 polish-backlog entry** (Status: "🟢 IN-FLIGHT 2026-05-31 — Fix Session D ✅ DEPLOYED-AND-VERIFIED; FU-1 + FU-2 + Fix Session C remaining" with the deploy commit hashes + the 2 follow-up items).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - `feedback_plan_output_shape_before_building.md` — DIRECTLY relevant: FU-1 (delete-from-table) reverses the Fix D read-only decision and is a genuine output-shape/UX design decision — plan it with director via a Rule 14f picker BEFORE coding.
  - `feedback_default_to_recommendation.md` + `feedback_recommendation_style.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_deferred_items_registry.md` + `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md` + `feedback_browser_first_ai_with_server_migration.md`.
- **Fix Session D shipped reference files** (the canonical reference implementation):
  - `src/lib/competition-scraping/reviews-traceability.ts` — parse + buildRows + mergeReviewTitleBody; FU-1 (delete-from-table) trims the parsed `categories` and PATCHes back; the table render is `ReviewsTraceabilityTable.tsx`.
  - `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/ReviewsTraceabilityTable.tsx` — the read-only 3-column table; FU-1 adds the delete affordances (individual + bulk).
  - `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx` — fetches the latest PER_PRODUCT analysis via GET /review-analysis + renders the table + the relabeled "Your notes — Captured Reviews" box.
  - `src/lib/competition-scraping/review-analysis/prompts.ts` — the v4 structured prompt + `flattenCategoriesToSummaryString`; Fix Session C's non-bulleted flow adds a sibling prompt.
  - `src/lib/competition-scraping/handlers/review-analysis-run-batch.ts` — `resolveReviewRefs` + the per-batch flow-dispatch; Fix Session C adds the per-competitor non-bulleted branch.
  - `src/lib/competition-scraping/handlers/review-analysis-update.ts` — the PATCH handler; FU-1's delete trims `analysisJson.categories` via this endpoint (extend to accept a category/bullet/reviewRef trim op WITHOUT touching CapturedReviews).
  - `src/lib/rich-text/save-with-retry.ts` — the NEW shared autosave-retry helper (FF1); reuse for any other rich-text autosave surface that 500s under load.
  - `src/app/projects/[projectId]/competition-scraping/competitor-reviews-analysis/page.tsx` (~L519-545) — the `reviewsByUrl` lazy-load cache + `summaryByReviewId` / `competitorSummaryByUrlId` maps; FU-2's fix invalidates/refetches these after a cross-page review deletion.
  - `prisma/schema.prisma` — `CapturedReview` model (carries `title String?` + `sortRank Int?`); Fix Session C adds `sortRankInReviewsTable Int?` (additive, nullable) + fires `npx prisma db push` (Schema-change-in-flight FLIPS NO → YES at that point — for Fix C only, NOT for FU-1 + FU-2).
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (1-2 gates planned) + Rule 14f (forced-picker mechanics — expect the FU-1 design picker + a build-scope picker + a deploy picker + per-FF deploy gates + the §4 Step 1c next-task picker) + Rule 18 (§A frozen + §B append-only; today's §B 2026-05-31 is the latest entry to anchor cross-references against) + Rule 21 + Rule 22 + Rule 23 (Change Impact Audit — FU-1 + FU-2 are UI/handler-side, NO schema change; Fix C carries the only schema change) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + Rule 31 (read §3 of the spec doc at session start + audit shipped state) + §4 Step 4b extended template.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31 (with the 2026-05-28-b mechanical read-guarantee + audit-shipped-state mandate sub-sections), the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block listing the polish-item-specs files; read §3 of each at session start. ALSO audit the shipped state of the in-flight P-49 W5 surfaces against the spec at session start per the audit-shipped-state mandate — confirm the new read-only 3-column traceability table on the URL detail page + the relabeled "Your notes — Captured Reviews" box + the main `/competitor-reviews-analysis` table still match the Fix Session A + B + D end-state on vklf.com.**

**Session goal:** P-49 W5 Reviews Analysis Table follow-ups on `workflow-2-competition-scraping` per (a.110), in this order: (1) **FU-1 delete-from-table feature** — delete entries from the Overall Analysis traceability table individually + in bulk; START with a Rule 14f design chat (delete unit / individual + bulk-select UX / the delete trims `analysisJson.categories` via PATCH WITHOUT touching the underlying `CapturedReview`s) per `feedback_plan_output_shape_before_building.md`, THEN build; (2) **FU-2 deleted-reviews sync bug** — invalidate/refetch the `/competitor-reviews-analysis` page's `reviewsByUrl` cache + the dependent summary maps (`summaryByReviewId` / `competitorSummaryByUrlId`) on a cross-page review deletion so deleted reviews disappear from that table + its counts; (3) **Fix Session C** (likely a SEPARATE session — decide at session start) = NEW per-competitor non-bulleted prose AI flow + non-bulleted button/modal + Excel export (D-7) + drag-to-reorder review rows (D-6) + NEW `CapturedReview.sortRankInReviewsTable Int?` column. **Schema-change-in-flight = NO entry state** for FU-1 + FU-2 (both UI/handler-side); flips **YES only when Fix Session C's `sortRankInReviewsTable` migration fires**. 1-2 Rule 9 deploy gates planned.

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

**Phase 1 (FU-1 design chat + audit-shipped-state confirmation — likely 10-25 min):**

Per the audit-shipped-state mandate, confirm at session start that the URL detail page still renders the read-only 3-column traceability table on top + the relabeled "Your notes — Captured Reviews" box below it, and that the main `/competitor-reviews-analysis` table still matches the Fix A + B end-state. Spot-check on vklf.com.

**Per `feedback_plan_output_shape_before_building.md`, fire a Rule 14f picker on the FU-1 delete-from-table design BEFORE coding** — this REVERSES Fix Session D's read-only decision, so it is a genuine UX/output-shape design decision, not a re-confirmation:

- **Delete unit:** does a delete remove a single complaint (bullet) row? a whole category group? a single source review in Column 3 (re-rendering the bullet without that review)?
- **Individual + bulk-select UX:** per-row delete affordance + a bulk-select (checkbox/multi-select) mode + a confirm step?
- **Persistence:** the delete trims the stored `analysisJson.categories` (remove the bullet/category/reviewRef) via a PATCH to the per-competitor `ReviewAnalysis` row WITHOUT touching the underlying `CapturedReview`s.

Update `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §4 Q11 with the resolved design + §3.

**Phase 2 (build FU-1 + FU-2 — fires a Rule 14f scope picker first):**

Fire a Rule 14f forced-picker after Phase 1 closes:

- **Option A (Recommended):** build FU-1 + FU-2 this session; defer Fix Session C to its own session (FU-1 + FU-2 are smaller + carry NO schema change; Fix C is large + carries the only schema change, so isolating it keeps the deploy gate clean).
- **Option B:** build FU-1 + FU-2 + Fix Session C all this session (heavier; YES schema change for Fix C's sort-rank column).
- **Option C (escape-hatch):** director writes free-text directive shaping the scope differently.

Test coverage: positive tests pinning the FU-1 PATCH-trim logic (analysisJson.categories trimmed correctly for each delete unit; CapturedReviews untouched) + the FU-2 cache-invalidation/refetch on the analysis page; negative tests asserting unrelated surfaces unchanged.

**Phase 3 (deploy decision):**

If Phase 2 lands + scoreboard-verifies, fire a Rule 14f deploy-now-vs-exit picker. If director picks deploy, ff-merge to main + Vercel auto-redeploy + Phase 4 director real-Chrome verification on:

- deleting individual + bulk entries from the Overall Analysis traceability table (the deleted entries vanish from the table; the underlying captured reviews stay);
- deleting a captured review on a URL detail page → it disappears from the `/competitor-reviews-analysis` table + its "N of M summarized" count for that product without a manual refresh.

If Phase 4 surfaces redirects, bundle multi-redirect Phase 4 issues into single FFs per the "Same-day Phase 4 multi-redirect bundling Pattern".

**Scoreboard targets** (entry baselines = today's Fix Session D exit baselines):

- Root tsc clean (UNCHANGED)
- Extension tsc clean (UNCHANGED)
- Extension `npm test` = 910/910 (UNCHANGED — FU-1 + FU-2 are PLOS-side only)
- src/lib `node:test` ≥ 1038 (entry 1038; expect +N for the FU-1 PATCH-trim tests + the FU-2 cache-invalidation tests; rough estimate +8-15)
- `npm run build` = 68 routes (likely UNCHANGED — FU-1 reuses the existing PATCH route; FU-2 is client-side cache logic. Confirm no new route is needed.)
- Check 6 Playwright SKIPPED per Rule 27 (BUILD/DEPLOY session)

**Deploy mechanics:** 1-2 Rule 9 deploy gates planned. If deploy fires, expect the standard 3-push pattern per ff-merge (workflow-2 push + ff-merge to main + push main + ping-pong workflow-2) per `feedback_approval_scope_per_decision_unit.md`.

**Schema-change-in-flight flag:** **NO entry** (FU-1 + FU-2 are UI/handler-side; no schema change). If the session ALSO builds Fix Session C (Option B), the flag flips **YES** when the `CapturedReview.sortRankInReviewsTable Int?` migration fires (additive, nullable, zero data loss) → NO at deploy push completion.

**Group A docs to update at session end** (assuming no new rules or memory files): ROADMAP header bump + P-49 polish-backlog entry status update (FU-1 + FU-2 outcome + deploy commit hashes) + CHAT_REGISTRY header bump (176th session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header + 1 NEW §Entry + HANDOFF_PROTOCOL header bump only + CLAUDE_CODE_STARTER header bump only + NEXT_SESSION full rewrite (likely Fix Session C, or the next remaining P-49 item).

**Group B docs to update at session end:** NEW §B (next session-letter date) entry in `docs/REVIEWS_PHASE_2_DESIGN.md` (SEVENTEENTH build/deploy-session §B entry per Rule 18; NINTH W5 entry). UPDATE `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §2 + §3 + §4 in real-time during the session (mark FU-1 + FU-2 ✅ DONE + resolve Q11 in §4). UPDATE `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §3 pointer table.

**Standing carry-overs from this session:**

- **Q11** (FU-1 delete-from-table design) — resolved at start of the next session via a Rule 14f picker.
- **FU-2** (deleted-reviews sync bug) — built alongside FU-1.
- **Q8** (flow-value naming for Fix Session C's non-bulleted flow) — resolved at the start of Fix Session C.
- **Fix Session C** (non-bulleted flow + Excel + drag + `sortRankInReviewsTable` schema column) — STILL PENDING; sits behind FU-1 + FU-2.
- **Category page Block 1 planning resume** (6 questions) — STILL PENDING; behind Fix Session C.
- **Type page Sessions 4-5** — STILL PENDING; behind Category page.

---

## Alternate next-session candidates if director shifts priorities at session start

- **(A.110.alt1) P-49 W5 Reviews Analysis Table follow-ups — FU-1 delete-from-table + FU-2 deleted-reviews sync bug** (current PICK — pre-loaded above). The 2 NEW director items from Fix Session D's Phase 4; FU-1 needs a design chat first.
- **(A.110.alt2) P-49 W5 Reviews Analysis Table Fix Session C** (non-bulleted prose AI flow + Excel export + drag-to-reorder + `sortRankInReviewsTable` schema column). The heavy original Fix C; could be done before the 2 follow-ups if director prefers to finish the §1-verbatim compliance work first. Carries the only schema change.
- **(A.110.alt3) P-49 W5 Category page Block 1 planning resume** (answer the 6 open questions from `docs/polish-item-specs/P-49-W5-S4-category-page.md` §4). Pushed back behind the Reviews Analysis Table work but still queued.
- **(A.110.alt4) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`). Running tally ~31-33+; quick palate-cleanser.
- **(A.110.alt5) P-50 Condition Pathology card** (single-session — add a NEW card to two card-array files). Director already approved scope; quick palate-cleanser.
- **(A.110.alt6) P-51 per-Project competitive landscape AI summary** (per `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md` skeleton — build session opens with Q&A). Slotted AFTER P-49 closes per director's priority order, but available if director wants to start the Q&A early.
