# Next session

**Written:** 2026-05-31-b (`session_2026-05-31-b_p49-w5-fu1-edit-delete-overall-analysis-box-plus-fu2-deleted-reviews-sync-bug` — W#2 polish P-49 W5 FU-1 (EDIT + delete entries in the "Overall Analysis — Captured Reviews" traceability box, individually + in bulk) + FU-2 (deleted-reviews sync bug) ✅ DEPLOYED-AND-VERIFIED 2026-05-31-b end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — single build commit `7d89d75` (10 files) ff-merged to main under ONE Rule 9 deploy gate. Director Phase 4 verbatim verdict: **"Everything passed."** FU-1 reverses Fix Session D's read-only decision (the traceability box is now fully editable). TWO NEW reusable PATTERNS: **"Cross-page stale client cache → re-fetch on tab refocus (visibilitychange/focus)"** + **"Structured-edit PATCH re-derives the flattened back-compat field"**. **Closes (a.110) RECOMMENDED-NEXT partially** — FU-1 + FU-2 shipped; (a.110)'s "THEN Fix Session C" was always a separate later session and remains PENDING. **Opens (a.111) RECOMMENDED-NEXT = AI model registry doc + central model-selection methodology rule + Opus 4.8 rollout** on the **`main`** track (platform-wide; spans W#1 Keyword Clustering + W#2 Competition Scraping; NEW ROADMAP entry P-52).

> ⚠️ **DATE-STAMP UNCERTAINTY (flag for director):** the harness `currentDate` reads **2026-05-29**, but git history shows the prior "Fix Session D" shipped **2026-05-31** (commit `ca7266a`). These conflict. This session was stamped **`2026-05-31-b`** as the most git-consistent choice. If the real calendar date differs, the `2026-05-31-b` stamp across this doc-batch may need director correction.

> ⚠️ **BRANCH CHANGE: next session is on `main`, NOT `workflow-2-competition-scraping`.** (a.111) is a platform-wide infrastructure item that touches BOTH the live W#1 Keyword Clustering tool (`AutoAnalyze.tsx`) and W#2 Competition Scraping, so it runs on the `main` track in its own session per director's session-start Q2=A pick. The start-of-session branch verification MUST land on `main` — do not start it on the workflow-2 branch.

---

## What we did this session (in plain terms)

Today was a build + ship + verify day, and it grew at the very start: you raised TWO new issues.

**Issue 1 — you EXPANDED what we'd planned.** We had queued a "delete entries from the new 3-column table" feature. You widened it: you want to EDIT entries too (rename a category, reword a complaint), not just delete them. So the read-only table from last session is now fully editable.

**Issue 2 — a brand-new, bigger idea.** You want a single place that lists every spot across both tools (Keyword Clustering and Competition Scraping) where someone picks an AI model, a rule that keeps that list up to date whenever we add a new model-picker, and the newest model (Opus 4.8) added everywhere. Because that touches the live Keyword Clustering tool, we agreed to give it its OWN session on the main code line — so that's what next session is.

We built and shipped Issue 1 (now called FU-1) plus a bug fix (FU-2) today:

1. **FU-1 — the traceability box is now editable + deletable.** On a competitor's detail page, the 3-column box can now be edited (rename a category, reword a complaint) and trimmed: you can delete a single complaint, a whole category, or a single customer review listed under a complaint — one at a time, or several at once with checkboxes and a "Delete selected" button (with a confirm step). If you later re-run the AI, it warns you that re-running will replace your hand-edits. Importantly, all of this only changes the AI-generated analysis — it never deletes your actual captured reviews.
2. **FU-2 — the deleted-reviews sync bug is fixed.** Before, if you deleted a review on a competitor's detail page, it still showed up on the big reviews-analysis table (and the "N of M summarized" count was wrong) until you reloaded. Now, when you click back to that table's tab, it quietly re-checks and refreshes itself, so the deleted review disappears right away.

**Your verbatim Phase 4 verification verdict: "Everything passed."**

**Numbers:**

- **THREE Rule 14f picker batches — all Yes-to-Recommended:** (1) the session-direction picker (2 questions: tackle the box edit/delete + the sync bug now / give the model work its own session on main); (2) the FU-1 design picker (4 questions: what a delete removes / what's editable / how bulk-select works / the re-run warning); (3) the deploy gate. That's 7 picker decisions, 7/7 = 100% Yes-to-Recommended. Running cumulative across recent 10 sessions: **115/118 = 97.5%**.
- **ONE Rule 9 deploy gate fired** (single build `7d89d75` — director "Deploy now").
- **Three pushes total** (deploy push to main + ping-pong workflow-2 + the end-of-session doc-batch push + ping-pong).
- **Schema-change-in-flight = NO the entire session** (entry NO → exit NO). The edit/delete lives inside the database column that already existed (`ReviewAnalysis.analysisJson`) — no migration, no data risk.
- **Post-merge /scoreboard all GREEN at NEW LOCKED baselines:** root tsc clean + extension tsc clean + extension `npm test` = 910/910 UNCHANGED + src/lib `node:test` = **1053/1053** (+15 from 1038 — 11 traceability mutation/validator/row-index cases + 4 PATCH-categories cases) + `npm run build` = **68 routes UNCHANGED** (reused the existing PATCH route — no new route); Check 6 Playwright SKIPPED per Rule 27.
- **NO extension zip this session** (zero extension code changed).

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (the NEW P-52 entry + the P-49 entry) + `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3/§4.

- **(a.111) AI model registry + methodology + Opus 4.8 rollout (P-52)** — NEXT SESSION; on `main` (see below).
- **Fix Session C (P-49 W5)** — STILL PENDING — the only remaining work on the Reviews Analysis Table page: NEW per-competitor non-bulleted prose AI flow + Auto-create non-bulleted button + Excel export (D-7) + drag-to-reorder review rows (D-6) + NEW `CapturedReview.sortRankInReviewsTable Int?` column (the only remaining schema change). Q8 (flow-naming) resolved at its session start.
- **Category page Sessions 1-3 + Type page Sessions 4-5** (the 5-session corrective rebuild from 2026-05-28; specs `P-49-W5-S4-category-page.md` + `P-49-W5-S5-type-page.md`).

## What we'll do next session (in plain terms)

Next session is the **AI model registry + central model-selection methodology + Opus 4.8 rollout** — a platform-wide infrastructure session on the `main` code line (because it touches both the Keyword Clustering tool and the Competition Scraping tool).

In plain terms, three deliverables:

1. **A central tracking doc** that lists every place in PLOS where a user picks an AI model — so we always know where the model choices live.
2. **A process rule** (like our existing Rule 31 spec-capture rule) so that any time we add a new "pick a model" function in the future, it gets registered in that doc automatically.
3. **Add the newest model, Opus 4.8, everywhere** — to every model dropdown and to the pricing tables that estimate cost.

We already did the detective work this session (a read-only audit): there are FIVE places that offer model choices, and several of them duplicate the same model list instead of sharing one. Part of the work is tidying that up so they all read from ONE shared list — which makes adding Opus 4.8 (and any future model) a one-line change.

**One thing we may need from you first:** the official Opus 4.8 pricing numbers (input / output / cache-read / cache-write per million tokens) so the cost estimates are accurate. If you can supply those, the pricing tables will be exact; if not, we'll fall back to a placeholder and note it.

## What's still left in the total roadmap (in plain terms)

- **P-52 (NEW) AI model registry + central model-selection methodology + Opus 4.8 rollout** — NEXT SESSION on `main`; platform-wide; spans W#1 + W#2. OPEN BLOCKER: official Opus 4.8 pricing numbers (director may supply offline).
- **P-49 W#2 Reviews Phase 2 (IN-FLIGHT — Fix Sessions A + B + D + FU-1 + FU-2 ✅ DEPLOYED; only Fix Session C + Category Sessions 1-3 + Type Sessions 4-5 remaining)** — Fix Session C is the only remaining Reviews Analysis Table work (non-bulleted prose AI flow + Excel export + drag-to-reorder + `CapturedReview.sortRankInReviewsTable` — the only remaining schema change); then the Category + Type page corrective rebuilds. Estimate ~6-7 more sessions until P-49 W5 closes.
- **P-50 NEW Condition Pathology card** — small single-session UI addition (one card insertion in two card-array files); director already approved scope; slot in any future session or do standalone on `main`.
- **P-51 NEW per-Project competitive landscape AI summary on `/comprehensive-analysis` page** — slot AFTER P-49 closes (per director directive: P-51 is BETWEEN P-49 and P-50 in next-priority order); spec doc skeleton in place; build session opens with Q&A.
- **P-48 Session 3 (Diagnostic #2 for screen-recording stutter)** — empirical instrumentation to determine why every SCREEN_RECORDING webm is captured at ~6-7 fps actual rate; deferred.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; running tally ~31-33+ (no notable new reproductions today). Single-session fix.
- **P-26 below-fold scroll capture bugs** + **P-27 capture bugs #9 + #15** — LOW priority; re-evaluate after P-49 closes.
- **W#2 graduation** — deferred until P-49 closes at the workstream-by-workstream level.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started.
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load (Fix Session D's FF1 surfaced transient connection-pool saturation under heavy AI runs; the autosave-retry helper papers over it client-side — a future infra-side look at pool sizing / connection management may be warranted if 500s recur) + Supabase file-size offline check.

---

## Status of last session

**P-49 W5 FU-1 (edit+delete the traceability box) + FU-2 (deleted-reviews sync bug) ✅ DEPLOYED-AND-VERIFIED 2026-05-31-b** end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`. DEPLOY session: ONE Rule 9 deploy gate fired on the single build `7d89d75`. Director Phase 4 verbatim verdict: "Everything passed."

**Session shape (DEPLOY — 1 work commit + end-of-session doc-batch + 1 ff-merge + ping-pong sync):**

- 1 work commit: `7d89d75` (10 files: `reviews-traceability.ts` + `.test.ts`; `review-analysis-update.ts` + `.test.ts`; `ReviewsTraceabilityTable.tsx`; `UrlDetailContent.tsx`; `competitor-reviews-analysis/page.tsx` + `PerCompetitorSummarizeModal.tsx` + `GlobalCompetitorSummarizeModal.tsx`; `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md`).
- 1 PENDING: end-of-session doc-batch commit (this doc-batch agent's output) — carries the Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION) + 1 Group B doc (REVIEWS_PHASE_2_DESIGN.md §B 2026-05-31-b) + 2 MODIFIED polish-item-specs.

**THREE Rule 14f picker batches — 7 decisions, 7/7 = 100% Yes-to-Recommended:** (1) session-direction (2 questions); (2) FU-1 design (4 questions); (3) deploy gate. Running cumulative across recent 10 sessions = **115/118 = 97.5% Yes-to-Recommended**.

**ONE Rule 9 deploy gate fired this session.**

**Schema-change-in-flight flag NO entire session (entry NO → exit NO)** — the structured edit lives in the EXISTING `ReviewAnalysis.analysisJson` Json column; zero migration, zero data risk.

**1 NEW DEFERRED item at session end (Rule 26)** — 5 in-session tasks: #2-#5 completed (Phase 1 design / Phase 2a build edit+delete / Phase 2b FU-2 / Phase 3 scoreboard+deploy); #1 = the AI-model registry + Opus 4.8 work, DEFERRED with destination = the NEW P-52 ROADMAP entry.

**Baselines locked from this session:** root tsc clean + extension tsc clean + extension `npm test` = **910/910 UNCHANGED** + src/lib `node:test` = **1053/1053** (+15 from 1038 entry) + `npm run build` = **68 routes UNCHANGED**.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-31-b** capturing: (1) NEW reusable PATTERN — "Cross-page stale client cache → re-fetch on tab refocus (visibilitychange/focus)" (FU-2 root cause + fix); (2) director scope-expansion at session start handled via Rule 24 search → capture → Rule 14f sequencing; (3) NEW reusable PATTERN — "Structured-edit PATCH re-derives the flattened back-compat field" (FU-1 mechanism); (4) date-stamp uncertainty flag; (5) P-43 cwd-leak running tally ~31-33+ (no notable new reproductions). NO new memory file (the two new Patterns live in code + the CORRECTIONS_LOG entry).

**NEW §B 2026-05-31-b entry appended to `docs/REVIEWS_PHASE_2_DESIGN.md`** (SEVENTEENTH build/deploy-session §B entry per Rule 18; NINTH W5 entry).

**2 polish-item-specs MODIFIED this session:**

- `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` — Status line updated (Fix Sessions A + B + D + FU-1 + FU-2 ✅ DEPLOYED-AND-VERIFIED) + §3 FU-1 + FU-2 marked ✅ SHIPPED-AND-VERIFIED + §4 Q11 RESOLVED.
- `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` — §3 pointer table — Reviews Analysis Table page now "Fix A + B + D + FU-1 + FU-2 ✅ DEPLOYED-AND-VERIFIED; only Fix Session C remaining".

**NEW ROADMAP entry P-52 created** (AI model registry + central model-selection methodology + Opus 4.8 rollout; destination for the deferred Issue 2; queued as (a.111) on the `main` track).

**FIFTY-FOURTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Branch

**`main`** — entered at start of next session. (a.111) / P-52 is a platform-wide infrastructure item touching BOTH the live W#1 Keyword Clustering tool (`AutoAnalyze.tsx`) and W#2 Competition Scraping, so it runs on `main` in its own session per director's session-start Q2=A pick. Verify with `git branch --show-current` immediately after entry; should be on `main`. **If you are on `workflow-2-competition-scraping`, switch to `main` (`git checkout main && git pull`) before starting — this session is intentionally NOT on the workflow-2 branch.** (The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch; for this session, after the resume lands, checkout `main` explicitly.)

**Expected branch state on entry** (after this session's end-of-session doc-batch lands + the standard 3-push ping-pong sync fires): `main` and `workflow-2-competition-scraping` both at the post-doc-batch SHA after ff-merge. Verify with `git status` showing a clean working tree (apart from historical untracked .zip + .html artifacts at repo root) and `git log origin/main..HEAD --oneline | wc -l` = 0.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files since this NEXT_SESSION.md references P-43 + P-49 + P-50 + P-51 + P-52; read §3 of each at session start):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate as of 2026-05-28-b) + Rule 14f (forced-picker mechanics — expect a design picker on the registry-doc structure + methodology rule, a build-scope picker, a deploy picker) + Rule 9 (deploy gate) + Rule 18 + Rule 23 (Change Impact Audit — this session touches the LIVE W#1 AutoAnalyze tool; treat W#1 changes with extra care) + Rule 24 (the registry-doc capture already searched; PRIOR TREATMENT in REVIEWS_PHASE_2_DESIGN §A.7 + MODEL_QUALITY_SCORING) + Rule 25 (Multi-Workflow — this session spans W#1 + W#2 on `main`) + Rule 26 + Rule 27 + Rule 30 (Session bookends) + §4 Step 4b extended template.
- **`docs/ROADMAP.md` the NEW P-52 polish-backlog entry** (THE source-of-truth for this session — carries the 3-part scope, the 5-audited call sites, the Opus 4.8 pricing blocker, and the Rule 24 prior-treatment search result).
- `docs/REVIEWS_PHASE_2_DESIGN.md` §A.7 (the W#2 model policy "Opus 4.7 default + Opus 4.6 selectable" — the existing locked decision the new model lists extend) + §B 2026-05-31-b (the latest entry; FU-1 + FU-2 + the 2 new Patterns).
- `docs/MODEL_QUALITY_SCORING.md` (W#1 model-stability scoring — adjacent but NOT model-selection UI; read to avoid conflating the two).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-31-b (this session's informational entry — the 2 new Patterns + the date-stamp flag).
- **The FIVE audited model-choice call sites** (the reference surfaces for this session — read before designing the central list refactor):
  - W#1 `AutoAnalyze.tsx` — `AA_PRICING` (~L95-100), the default `claude-sonnet-4-6` (~L128), and the `<select>` options (~L2116-2120); 5 models hardcoded in 3 spots, NO central list. **This is the LIVE W#1 tool — change with care.**
  - `src/lib/competition-scraping/review-analysis/client.ts` — `DEFAULT_MODEL_VERSION` + `SUPPORTED_MODEL_VERSIONS` + `isSupportedModelVersion` (the W#2 shared seam).
  - `src/lib/competition-scraping/review-analysis/pricing.ts` — `MODEL_PRICING` (the W#2 pricing table) + validated in `review-analysis-run-batch.ts`.
  - `src/app/projects/[projectId]/competition-scraping/competitor-reviews-analysis/components/PerReviewSummarizeModal.tsx` + `PerCompetitorSummarizeModal.tsx` + `GlobalCompetitorSummarizeModal.tsx` — each DUPLICATES `SUPPORTED_MODEL_VERSIONS` locally instead of importing (the refactor target — make them import the central list).
  - (the browser extension has NO model selection — nothing to change there.)
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - `feedback_plan_output_shape_before_building.md` — DIRECTLY relevant: design the central registry-doc structure + the methodology rule WITH the director via a Rule 14f picker BEFORE writing them (audience / sections / where the doc lives / how the rule enforces registration).
  - `feedback_browser_first_ai_with_server_migration.md` — relevant context on how AI batch flows + model pickers are structured across W#1 + W#2.
  - `feedback_default_to_recommendation.md` + `feedback_recommendation_style.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md` + `feedback_playwright_for_repeatable_walkthroughs.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31 (with the 2026-05-28-b mechanical read-guarantee + audit-shipped-state mandate sub-sections), the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; read §3 of each listed spec at session start.** **This session is on `main` — verify the branch first.**

**Session goal (a.111 / P-52):** AI model registry doc + central model-selection methodology rule + Opus 4.8 rollout, on the `main` track (platform-wide; spans W#1 Keyword Clustering + W#2 Competition Scraping). THREE deliverables: (a) a central tracking DOC listing every place a user picks an AI model across W#1 + W#2; (b) a METHODOLOGY/process rule (likely a NEW HANDOFF_PROTOCOL rule mirroring Rule 31's spec-capture mechanism) so any newly-added model-choice function gets registered in the doc; (c) ADD Opus 4.8 (`claude-opus-4-8`) as an option in every model picker + every pricing table. **Schema-change-in-flight = NO entry state** (model lists + pricing tables are code constants; no schema work anticipated). 0-1 Rule 9 deploy gates planned (1 if Phase 3 deploy picker fires Yes — note this WILL change the live W#1 AutoAnalyze tool, so Phase 4 verification must cover W#1's model picker too).

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: main   (if it shows workflow-2-competition-scraping, run: git checkout main && git pull)

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline | wc -l
# Expected: 0 (main even with origin/main after the standard 3-push ping-pong sync)
```

If `git branch --show-current` shows `workflow-2-competition-scraping`, switch to `main` (`git checkout main && git pull`) — this session is intentionally on the main code line.

**OPEN BLOCKER to surface at session start:** the pricing tables need official Opus 4.8 numbers (input / output / cache-read / cache-write per-MTok). Ask the director whether they can supply these now; if not, add Opus 4.8 to the model lists with a placeholder/fallback pricing entry and flag it clearly so cost estimation degrades gracefully.

**Phase 1 (design the registry doc structure + the methodology rule — per `feedback_plan_output_shape_before_building.md`, fire a Rule 14f picker BEFORE writing):**

- **Registry doc structure:** where does it live (a new `docs/AI_MODEL_REGISTRY.md`? a section in an existing doc?), what columns/sections (call-site path + which models offered + default model + pricing source + workflow), and how it cross-references the spec docs.
- **Methodology rule:** a NEW HANDOFF_PROTOCOL rule (mirroring Rule 31) requiring that any newly-added model-choice function be registered in the doc — including how the rule is enforced (a checklist item? a hook auto-detection like the P-NN spec-doc mechanism?).
- **Refactor shape:** confirm the 3 W#2 modals should IMPORT the central `SUPPORTED_MODEL_VERSIONS` list from `client.ts` instead of each duplicating it (the recommended cleanup), and decide whether W#1 `AutoAnalyze.tsx`'s 3 hardcoded spots also migrate to read from a shared source this session or stay as-is with Opus 4.8 added inline.

**Phase 2 (build):**

- Add Opus 4.8 (`claude-opus-4-8`) to `client.ts` (`SUPPORTED_MODEL_VERSIONS`; keep `DEFAULT_MODEL_VERSION` per director's call) + `pricing.ts` (`MODEL_PRICING`, with real or placeholder Opus 4.8 pricing) + the 3 W#2 modals (or, better, refactor them to import the central list) + W#1 `AutoAnalyze.tsx`'s 3 spots (`AA_PRICING` + default + `<select>` options).
- Write the central registry doc + add the methodology rule.
- Test coverage: positive tests pinning the central model list + validator including Opus 4.8 + the pricing-table entry; negative tests asserting unsupported model strings still rejected and unrelated surfaces unchanged.

**Phase 3 (deploy decision Rule 14f):** if Phase 2 lands + scoreboard-verifies, fire a deploy-now-vs-exit picker. If deploy fires, ff-merge to main + Vercel auto-redeploy + Phase 4 director real-Chrome verification on BOTH the W#1 Keyword Clustering model picker AND the W#2 review-summarize modals showing Opus 4.8 selectable + cost estimates rendering.

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (UNCHANGED)
- Extension tsc clean (UNCHANGED)
- Extension `npm test` = 910/910 (UNCHANGED — no extension model selection)
- src/lib `node:test` ≥ 1053 (entry 1053; expect +N for the Opus-4.8-in-list + pricing-table + validator tests; rough estimate +5-12)
- `npm run build` = 68 routes (likely UNCHANGED — no new route; model lists + pricing are constants. Confirm.)
- Check 6 Playwright SKIPPED per Rule 27 (BUILD/DEPLOY session)

**Deploy mechanics:** 0-1 Rule 9 deploy gates planned. If deploy fires, expect the standard 3-push pattern per ff-merge (push + ff-merge to main + push main + ping-pong workflow-2 so the branches stay in sync) per `feedback_approval_scope_per_decision_unit.md`.

**Schema-change-in-flight flag:** **NO entry, NO exit** — model lists + pricing tables are code constants; no schema work anticipated.

**Group A docs to update at session end** (assuming the methodology rule is added): ROADMAP header bump + P-52 entry status update (✅ SHIPPED or partial + deploy commit hash) + CHAT_REGISTRY header bump (177th session) + DOCUMENT_MANIFEST header + the NEW registry doc registered + flags + CORRECTIONS_LOG header + 1 NEW §Entry + **HANDOFF_PROTOCOL header bump + the NEW methodology rule added inline** (this is NOT a header-bump-only session — a new rule lands) + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite (likely Fix Session C, the next remaining P-49 item).

**Group B docs to update at session end:** NEW central AI-model registry doc (the deliverable). `docs/REVIEWS_PHASE_2_DESIGN.md` §A.7 is FROZEN per Rule 18 — if the model policy materially changes, capture the supersedence in a NEW §B entry, NOT by editing §A. UPDATE the P-49 spec docs only if the W#2 modal model lists move to the shared import (note it).

**Standing carry-overs into this session:**

- **Opus 4.8 pricing numbers** — director may supply offline; else placeholder + flag.
- **Whether W#1 `AutoAnalyze.tsx` migrates to a shared model list this session or just gets Opus 4.8 added inline** — Phase 1 Rule 14f pick (the live-tool change argues for the smaller, safer inline addition first, then a refactor later — but director decides).
- **Fix Session C (P-49 W5)** — STILL PENDING; resumes after this session.
- **Category page Block 1 + Type page Sessions 4-5** — STILL PENDING; behind Fix Session C.

---

## Alternate next-session candidates if director shifts priorities at session start

- **(a.111.alt1) AI model registry + methodology rule + Opus 4.8 rollout (P-52)** (current PICK — pre-loaded above). Platform-wide; on `main`; touches the live W#1 tool. OPEN BLOCKER: Opus 4.8 pricing numbers.
- **(a.111.alt2) P-49 W5 Reviews Analysis Table Fix Session C** (non-bulleted prose AI flow + Excel export + drag-to-reorder + `CapturedReview.sortRankInReviewsTable` schema column). The only remaining Reviews Analysis Table work; on `workflow-2-competition-scraping`; carries the only schema change. Could be done first if director prefers to finish the §1-verbatim compliance work before the platform-wide model work.
- **(a.111.alt3) P-49 W5 Category page Block 1 planning resume** (answer the 6 open questions from `docs/polish-item-specs/P-49-W5-S4-category-page.md` §4). Behind the Reviews Analysis Table work but still queued.
- **(a.111.alt4) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`). Running tally ~31-33+; quick palate-cleanser.
- **(a.111.alt5) P-50 Condition Pathology card** (single-session — add a NEW card to two card-array files). Director already approved scope; quick palate-cleanser on `main`.
- **(a.111.alt6) P-51 per-Project competitive landscape AI summary** (per `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md` skeleton — build session opens with Q&A). Slotted AFTER P-49 closes per director's priority order, but available if director wants to start the Q&A early.
