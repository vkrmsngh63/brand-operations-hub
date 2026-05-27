# Next session

**Written:** 2026-05-27 (`session_2026-05-27_p49-w5-session-1.5-reviews-phase-3-design-lock` — post-session doc-batch handoff after **W#2 polish P-49 Reviews Phase 3 design lock + schema enum extension + shared ExecutionModeSelect component SHIPPED at code level via build commit `252e1dd` on `workflow-2-competition-scraping` — W5 Session 1.5 director-driven planning conversation locked the 3-table + 7-flow + browser-first execution + 7 v1 prompts + 4-option toggle expansion across ~20 Rule 14f forced-pickers (19/19 = 100% Yes-to-Recommended on pickers answered + 2 free-text redirects); per-batch server endpoint scaffold + `prompts.ts` rewrite + Table 2 page + first live end-to-end run DEFERRED to next W5 session (a.103) in a deliberately narrow code-mechanics scope cut**) — pure BUILD session; NO production deploy; ZERO Rule 9 deploy gates fired this session; build commit stays on workflow branch until next W5 deploy session. Build commit `252e1dd` (6 files +181/-10) carrying MODIFY `prisma/schema.prisma` (`ReviewAnalysisLevel` enum extended with PER_REVIEW + PER_CATEGORY; `npx prisma db push` 1.19s additive zero data loss) + MODIFY `src/lib/shared-types/competition-scraping.ts` (union widened to all 5 values + validator narrowed) + MODIFY `src/lib/competition-scraping/handlers/review-analysis-run.ts` (row type widened to keep tsc green; handler scheduled for replacement next session) + NEW `src/lib/workflow-components/execution-mode.ts` (type + constants + validator matching W#1's verbatim labels at AutoAnalyze.tsx lines 2094-2099) + NEW `src/lib/workflow-components/execution-mode-select.tsx` (controlled `<select>` React component for modal consumption) + NEW `src/lib/workflow-components/execution-mode.test.ts` (7 node:test cases pinning labels to W#1's verbatim text + validator semantics). ~20 Rule 14f forced-pickers fired (19/19 = 100% Yes-to-Recommended on pickers answered + 2 free-text redirects on the row-structure + cost-caps pickers; both redirects produced superior outcomes vs the offered picker options). ZERO Rule 9 deploy gates fired (pure BUILD session). **Schema-change-in-flight flag FLIPPED NO → YES mid-session at `npx prisma db push` completion** (PER_REVIEW + PER_CATEGORY enum values added to `ReviewAnalysisLevel`; additive; zero data loss); STAYS YES until next W5 deploy session ff-merges to main + Vercel auto-redeploys. NEW reusable Pattern memorialized via NEW memory file `feedback_browser_first_ai_with_server_migration.md` — "Default new AI batch flows to browser-side execution (W#1's existing pattern); add execution-mode dropdown now for seamless future server-side migration; mirror dropdown into W#1's existing modal at the same time so both workflows can migrate together." Pre-build /scoreboard 5/5 GREEN at entry baselines (root tsc clean / extension tsc clean / **910 ext** / **899 src/lib** / **65 routes**). Post-build /scoreboard 5/5 GREEN at new src/lib baseline: src/lib **906/906** (+7); npm run build **65 routes UNCHANGED**; extension **910/910 UNCHANGED**. **Closes (a.102) RECOMMENDED-NEXT** = P-49 W5 Session 1.5 director-driven output-shape planning ✅ DONE 2026-05-27; **opens (a.103) RECOMMENDED-NEXT = P-49 W5 Session 2 — per-batch server endpoint scaffold + delete shipped per-product two-sweep handler + rewrite `prompts.ts` with 7 flow-specific builders + start Table 2 page + Per-Review Summarize button + modal + browser batch loop + first live end-to-end run on a small product corpus** on `workflow-2-competition-scraping`.

---

## What we did this session (in plain terms)

Today's session in plain terms: We had a long planning conversation with director where they laid out a much bigger vision than what was originally locked in the Reviews Phase 2 design doc. Instead of one analysis on each product's detail page, director wants a whole new system with three new tables (one per analysis level: per-competitor / per-category / per-type) reachable via a 4-option toggle at the top of the Competition Scraping page, plus seven different AI run buttons across those tables, plus everything running in the browser the way Workflow #1 already does (so we don't fight Vercel's per-request time limit), plus a forward-looking execution-mode dropdown that's ready for the eventual server-side migration.

**The locked design has 9 main parts:**

1. **4-option toggle at the top of the Competition Scraping page** giving access to four surface views (existing two surfaces + two new tables).
2. **Three brand-new tables** — Table 2 Competitor Reviews Analysis (per-review nested rows) / Table 3 By Category (one row per competitor grouped) / Table 4 By Type (one row per competitor grouped). Tables 3 + 4 drop Stars + Reviews Summary columns per director's Round 2 free-text redirect.
3. **Seven AI run flows** across the three tables — Per-Review Summarize + Per-Competitor-Per-Product Comprehensive (bulleted + non-bulleted) + Per-Category Comprehensive (bulleted + non-bulleted) + Per-Type Comprehensive (bulleted + non-bulleted).
4. **Browser-first execution mirroring W#1's existing pattern** — BatchObj queue + localStorage checkpoint + per-batch server endpoint for the Anthropic call. Locked via mid-planning architectural redirect from director after Claude had proposed a Vercel-suspend-resume server-side worker pattern.
5. **Execution-mode dropdown** added NOW to all future modals (Browser default / Server future) for seamless future server-side migration off Vercel; W#1's existing modal gets the mirror at the same opportunistic time.
6. **Seven v1 prompts drafted + locked** during the planning conversation — flat-bullet structured / third-person neutral analyst tone / soft length targets / echoed IDs for redundancy. Prompt content drafted in conversation; rewrite into `prompts.ts` is next session.
7. **No cost caps** — locked via Round 3 free-text redirect. Pre-flight estimate + running tally kept as transparency only with no enforcement.
8. **One flow at a time per Project** — cells lock with pending badge during a run; pause = preserve cells + resume from cursor; cancel = keep partial.
9. **Excel export + drag-reorder + click-to-edit + show-hide columns** all locked as Table-feature scope; implementation deferred to opportunistic future W5 sessions.

We locked all that with ~20 forced-pickers and director picked the recommended option 19/19 times on the ones they answered, plus redirected via free-text twice (once to drop Stars + Reviews Summary columns from Tables 3 + 4, and once to remove all cost caps). Then we did just two small code changes today: added two new enum values to the schema (PER_REVIEW + PER_CATEGORY) and built a tiny shared dropdown component that next session's modals will use. Everything else (the new per-batch server endpoint, rewriting the AI prompts, building the actual table pages, firing the first live AI call) is deferred to next session.

**What landed code-side via build commit `252e1dd` (6 files +181/-10):**

- MODIFY `prisma/schema.prisma` — `ReviewAnalysisLevel` enum extended with PER_REVIEW + PER_CATEGORY for the 7-flow analysis surface. `npx prisma db push` completed cleanly in 1.19s (additive, zero data loss; schema-change-in-flight FLIPPED NO → YES).
- MODIFY `src/lib/shared-types/competition-scraping.ts` — `ReviewAnalysisLevel` union widened to all 5 values + `isReviewAnalysisLevel` narrowed against all 5 values + comment block expanded to document the 7-flow mapping.
- MODIFY `src/lib/competition-scraping/handlers/review-analysis-run.ts` — `ReviewAnalysisRow.level` union widened to all 5 values to keep tsc green (handler scheduled for replacement by per-batch endpoint in next W5 session).
- NEW `src/lib/workflow-components/execution-mode.ts` — type + constants + `isExecutionMode` validator (browser/server modes matching W#1's verbatim labels at AutoAnalyze.tsx lines 2094-2099).
- NEW `src/lib/workflow-components/execution-mode-select.tsx` — controlled `<select>` React component for modal consumption (W#2 future modals + future W#1 refactor).
- NEW `src/lib/workflow-components/execution-mode.test.ts` — 7 node:test cases pinning labels to W#1's verbatim text + validator semantics.

**The mid-planning architectural redirect (verbatim from director):** *"If keeping things server-side significantly constrains us, we can run things on the browser side and have the option to move things server-side when things scale up..."* — this surfaced AFTER Claude had designed a Vercel-suspend-resume server-side worker pattern; redirect pivoted to W#1's browser-first pattern + added execution-mode dropdown for forward compat. **Memorialized as NEW reusable Pattern in NEW memory file `feedback_browser_first_ai_with_server_migration.md`** — applies to all future AI batch flows on Vercel across PLOS workflows.

**Pre-build /scoreboard 5/5 GREEN at entry baselines** (root tsc clean / extension tsc clean / **910 ext** / **899 src/lib** / **65 routes**); Check 6 Playwright SKIPPED per Rule 27.

**Post-build /scoreboard 5/5 GREEN at new src/lib baseline:** src/lib `node:test` = **906/906** (+7 — exact match with 7 new cases in `execution-mode.test.ts`); `npm run build` = **65 routes UNCHANGED**; extension `npm test` = **910/910** UNCHANGED; Check 6 SKIPPED per Rule 27. **NEW baseline locked: src/lib `node:test` = 906/906** (+7 from 899); routes = **65 UNCHANGED**; extension = **910/910 UNCHANGED**.

## What we'll do next session (in plain terms)

**Next session is P-49 W5 Session 2 — per-batch server endpoint scaffold + `prompts.ts` rewrite + start Table 2 page + first live end-to-end run** on `workflow-2-competition-scraping` per (a.103). This is the natural continuation of today's design lock — we shipped the design + the small enabling code primitives today; next session ships the big lifts.

What we'll do next session: Build the per-batch server endpoint that processes one batch of AI work at a time (replacing today's shipped-but-scheduled-for-replacement two-sweep handler at `src/lib/competition-scraping/handlers/review-analysis-run.ts`), rewrite `src/lib/competition-scraping/review-analysis/prompts.ts` with the 7 flow-specific prompt builders director locked today (per-review summarize + per-competitor comprehensive bulleted/non-bulleted + per-category comprehensive bulleted/non-bulleted + per-type comprehensive bulleted/non-bulleted), start building Table 2 (the Competitor Reviews Analysis Table with per-review nested rows) with the Per-Review Summarize button + modal (consuming the new shared ExecutionModeSelect component) + browser batch loop (mirroring W#1's BatchObj queue + localStorage checkpoint pattern), and fire the first real AI call against a small set of real reviews to see what comes out.

**Session shape estimate:** ~2-4 hours in-Claude (longer than today's because of the multi-piece code mechanics + the first live AI call + likely first-iteration tweaks on the v1 prompts). BUILD session by default. ZERO Rule 9 deploy gates planned by default (build commits stay on workflow branch until next W5 deploy session). Schema-change-in-flight STAYS YES entire session (carrying PER_REVIEW + PER_CATEGORY enum values shipped today via `npx prisma db push`; awaits next W5 deploy session to ship to production). Director should evaluate at session start whether the start-of-session deploy-now-vs-exit picker fires (less likely today because Session 2 still doesn't land enough user-visible UI to warrant a deploy; more likely after Session 3+ when Tables 3 + 4 ship).

**Pre-build read list for next session:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/ROADMAP.md` lines 1-30 (header + recent session sequence) + the **P-49 polish-backlog entry** (Status: "🟢 IN-FLIGHT 2026-05-27 — W5 Session 1.5 Reviews Phase 3 design lock + schema enum extension + shared ExecutionModeSelect component SHIPPED at code level via `252e1dd`; W5 Session 2 per-batch server endpoint scaffold + prompts.ts rewrite + Table 2 page start + first live e2e run NEXT per (a.103)").
- **`docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-27** (THE canonical reference for the new locked design — 3-table + 7-flow + browser-first execution + 7 v1 prompts + 4-option toggle + supersedence of §A.10/§A.11/§A.12/§A.7) + §B 2026-06-02 (predecessor W5 Session 1 entry; foundation primitives + plumbing handler that today's design lock builds on top of) + §A.7-§A.12 (UX + interaction spec — original spec; cross-check against §B 2026-05-27 for the superseding decisions).
- **`docs/CORRECTIONS_LOG.md` §Entry 2026-05-27** (THE meta-pattern entry — captures the NEW reusable Pattern verbatim + 4 sub-observations + Rule 14f free-text escape-hatch calibration data point + supersedence of §A.10/§A.11/§A.12/§A.7).
- **`feedback_browser_first_ai_with_server_migration.md`** (PRIMARY directive for next session's per-batch endpoint scaffold + browser batch loop implementation; THE memory file that governs the execution architecture).
- **`feedback_plan_output_shape_before_building.md`** (predecessor memory file from W5 Session 1; today's planning conversation executed its protocol successfully + locked the output shape; relevant cross-reference for any future surface-shape-planning conversations).
- All other existing memory files (`feedback_recommendation_style.md` + `feedback_default_to_recommendation.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_deferred_items_registry.md` + `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md`).
- **The Claude API skill** (since this session rewrites `prompts.ts` + fires the first live AI call).
- **W#1's `AutoAnalyze.tsx` at `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx`** lines covering the BatchObj queue + localStorage checkpoint + per-batch fetch + pause/resume/cancel semantics (the canonical implementation pattern this session mirrors for W#2).
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (zero gates expected) + Rule 14f (forced-picker mechanics — expect ~3-5 to fire: 1 architecture-decision picker for the per-batch endpoint + 1 cost-confirmation picker before the first live AI call + 1 §4 Step 1c next-task picker at session-end + possible 1-2 more during prompts.ts rewrite if any sub-decisions surface) + Rule 18 (§A frozen + §B append-only) + Rule 21 + Rule 22 + Rule 23 (Change Impact Audit — PLOS-side handlers + src/lib + schema-change-in-flight STAYS YES) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + §4 Step 4b extended template.

---

## Status of last session

**W#2 polish P-49 Reviews Phase 3 design lock + schema enum extension + shared ExecutionModeSelect component SHIPPED at code level via build commit `252e1dd` on `workflow-2-competition-scraping` — W5 Session 1.5 director-driven planning conversation locked the 3-table + 7-flow + browser-first execution + 7 v1 prompts + 4-option toggle expansion across ~20 Rule 14f forced-pickers (19/19 = 100% Yes-to-Recommended on pickers answered + 2 free-text redirects); per-batch server endpoint scaffold + `prompts.ts` rewrite + Table 2 page + first live end-to-end run DEFERRED to next W5 session (a.103) in a deliberately narrow code-mechanics scope cut** (`session_2026-05-27_p49-w5-session-1.5-reviews-phase-3-design-lock`) — pure BUILD session; NO production deploy; ZERO Rule 9 deploy gates fired.

**Session shape (BUILD only — ~20 Rule 14f forced-pickers fired = 19 answered Yes-to-Recommended + 2 free-text redirects; ZERO Rule 9 deploy gates):**

- **Planning portion:**
  - Director-driven Reviews Phase 3 design lock conversation surfaced a comprehensive expansion directive at session start (4-option toggle + 3 brand-new tables + 7 AI run flows + browser-first execution + 7 v1 prompts + Excel export + drag-reorder + click-to-edit + show-hide columns).
  - Planning walked all 6 design dimensions (Audience/Purpose + Sections/Topics + Depth/Length + Perspective/Tone + UI Placement + Interaction) via ~20 Rule 14f forced-pickers.
  - **Mid-planning architectural redirect** from director: *"If keeping things server-side significantly constrains us, we can run things on the browser side and have the option to move things server-side when things scale up..."* — this redirect pivoted the execution architecture from a Vercel-suspend-resume server-side worker pattern to W#1's existing browser-first execution pattern (BatchObj queue + localStorage checkpoint + per-batch server endpoint) + added an execution-mode dropdown for forward compat.
  - **TWO free-text redirects** during planning (positive calibration data points for Rule 14f's escape-hatch design): Round 2 row-structure picker REDIRECTED with *"Thanks for identifying this oversight. I want you to not include the Reviews and Stars columns in these tables"* (Tables 3 + 4 drop both Stars + Reviews Summary columns); Round 3 cost-caps picker REDIRECTED with *"I don't want any caps"* (removing all cost enforcement; pre-flight estimate + running tally kept as transparency only).
  - **19/19 = 100% Yes-to-Recommended on pickers answered + 2 free-text redirects** (positive calibration data points).

- **Build portion (deliberately narrow scope cut):**
  - Pre-build /scoreboard 5/5 GREEN at entry baselines (root tsc clean / extension tsc clean / 910 ext / 899 src/lib / 65 routes); Check 6 SKIPPED per Rule 27.
  - Code mechanics: MODIFY `prisma/schema.prisma` (`ReviewAnalysisLevel` enum extended with PER_REVIEW + PER_CATEGORY; `npx prisma db push` 1.19s additive zero data loss) + MODIFY `src/lib/shared-types/competition-scraping.ts` (union widened) + MODIFY `src/lib/competition-scraping/handlers/review-analysis-run.ts` (row type widened to keep tsc green; handler scheduled for replacement next session) + NEW `src/lib/workflow-components/execution-mode.ts` (type + constants + validator matching W#1's verbatim labels) + NEW `src/lib/workflow-components/execution-mode-select.tsx` (controlled `<select>` React component) + NEW `src/lib/workflow-components/execution-mode.test.ts` (7 node:test cases).
  - Build commit `252e1dd` landed (6 files +181/-10).
  - Post-build /scoreboard 5/5 GREEN at new src/lib baseline: src/lib `node:test` = **906/906** (+7 — exact match with 7 new cases in execution-mode.test.ts); npm run build = **65 routes UNCHANGED**; extension `npm test` = **910/910** UNCHANGED; Check 6 SKIPPED.
  - **Schema-change-in-flight flag FLIPPED NO → YES** at `npx prisma db push` completion; STAYS YES through end of session and carries forward to next W5 session.

- **Scope cut decision:**
  - After design lock + small enabling code primitives shipped, Claude proposed a broader code-mechanics scope (per-batch endpoint scaffold + prompts.ts rewrite + Table 2 page start + W#1 AutoAnalyze refactor) but **director's directive to cleanly close this session** at the design-lock + small-shippable-code-mechanics boundary led to the scope cut. Big lifts deferred to next W5 session.

- **End-of-session:**
  - NEW memory file `feedback_browser_first_ai_with_server_migration.md` created memorializing the meta-pattern; `MEMORY.md` got a one-line pointer added under the Feedback memories section; auto-mirrored to `.codespace-backup/memory/` via PostToolUse hook per Rule 29.
  - Doc-batch covers the 9-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION + REVIEWS_PHASE_2_DESIGN.md §B 2026-05-27 — NINTH build/deploy-session §B entry per Rule 18 — FIRST W5 Session 1.5 entry + COMPETITION_SCRAPING_DESIGN.md §B 2026-05-27 cross-reference pointer entry).

**~20 Rule 14f forced-pickers fired total this session — 19 answered Yes-to-Recommended + 2 free-text redirects.** Calibration: 19/19 = 100% on the pickers answered. Running cumulative 70/73 = 95.9% across recent 10 sessions including this session's 19 answered + 2 redirected.

**ZERO Rule 9 deploy gates fired this session** (pure BUILD session; build commit `252e1dd` stays on `workflow-2-competition-scraping` until next W5 deploy session).

**Schema-change-in-flight flag FLIPPED NO → YES mid-session at `npx prisma db push` completion** (PER_REVIEW + PER_CATEGORY enum values added to `ReviewAnalysisLevel`; additive; zero data loss); STAYS YES through end of session and carries forward to next W5 session.

**ZERO DEFERRED items at session end (Rule 26)** after the (a.103) capture lands in this NEXT_SESSION.md — 14 tasks created across the session; 8 completed; 4 marked `DEFERRED:` with destinations noted in this NEXT_SESSION.md as the (a.103) RECOMMENDED-NEXT (per-batch endpoint scaffold + prompts.ts rewrite + W#1 AutoAnalyze refactor to shared component opportunistic + PENDING REVIEWS_PHASE_2_DESIGN.md §B update handled by this doc-batch).

**Baselines locked from this session:** src/lib `node:test` = **906/906** (+7 from 899 entry baseline); `npm run build` = **65 routes UNCHANGED**; extension `npm test` = **910/910 UNCHANGED**. Files live on `workflow-2-competition-scraping` (NOT yet in production — pure BUILD session).

**NEW reusable Pattern memorialized via NEW memory file `feedback_browser_first_ai_with_server_migration.md`** — "Default new AI batch flows to browser-side execution (W#1's existing pattern); add execution-mode dropdown now for seamless future server-side migration; mirror dropdown into W#1's existing modal at the same time so both workflows can migrate together." Director's verbatim trigger captured. Applies to all future AI batch flows on Vercel across PLOS workflows.

**Reviews Phase 3 design lock supersedes REVIEWS_PHASE_2_DESIGN.md §A.10 + §A.11 + §A.12 + §A.7 substantially** — per Rule 18 §A is frozen; new locked decisions captured in NEW §B 2026-05-27 entry (NINTH build/deploy-session §B entry; FIRST W5 Session 1.5 entry). Future workstreams reading §A.10/§A.11/§A.12/§A.7 should always cross-check §B 2026-05-27 for the superseding design.

**P-43 cwd-leak Pattern Class reproduced ~2 more times this session** (post-build `npm run build` invocation inherited extension cwd from a previous `cd .../extensions/competition-scraping && npx tsc --noEmit` and ran the extension's build script instead of root Next.js; required re-run with explicit `cd /workspaces/brand-operations-hub` prefix). Running tally now ~22+ across recent sessions; **strong empirical signal continues mounting** for the P-43 mechanical prevention small fix.

**FORTY-SIXTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-49 W5 Session 2 begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping` and pre-load context. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` **4 commits ahead of `origin/main`** (build commit `04f74cf` from W5 Session 1 + W5 Session 1 doc-batch commit `25b1a3a` + this session's build commit `252e1dd` + this session's end-of-session doc-batch commit). Verify with `git log main..HEAD --oneline` showing **4 commits ahead** at session entry. If shown as 0 commits ahead, all 4 commits may have been ff-merged to main unexpectedly between sessions — surface to director.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.**

**Today's task: W#2 polish P-49 Reviews Phase 2 Workstream 5 AI review analysis Session 2 on `workflow-2-competition-scraping`.** Closes **(a.103) RECOMMENDED-NEXT**. BUILD session — ZERO Rule 9 deploy gates planned by default. Schema-change-in-flight flag STAYS YES entire session (carrying PER_REVIEW + PER_CATEGORY enum values shipped 2026-05-27 via `npx prisma db push` until next W5 deploy session).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Verify SHA relationships with `git log main..HEAD --oneline` — should show **4 commits ahead at session entry** (build commits `04f74cf` + `252e1dd` + 2 doc-batch commits from W5 Session 1 + W5 Session 1.5).

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/ROADMAP.md` lines 1-30 (header + recent session sequence) + the **P-49 polish-backlog entry** (Status: "🟢 IN-FLIGHT 2026-05-27 — W5 Session 1.5 Reviews Phase 3 design lock + schema enum extension + shared ExecutionModeSelect component SHIPPED at code level via `252e1dd`; W5 Session 2 per-batch server endpoint scaffold + prompts.ts rewrite + Table 2 page start + first live e2e run NEXT per (a.103)").
- **`docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-27** (THE canonical reference for the new locked design — 3-table + 7-flow + browser-first execution + 7 v1 prompts + 4-option toggle + supersedence of §A.10/§A.11/§A.12/§A.7; this entry IS the spec for next session's work) + §B 2026-06-02 (predecessor W5 Session 1 entry; foundation primitives + plumbing handler that today's design lock builds on top of) + §A.7-§A.12 (UX + interaction spec — original spec; cross-check against §B 2026-05-27 for the superseding decisions) + earlier §B entries (2026-05-26 through 2026-06-02) for full Reviews Phase 2 lineage context.
- **`docs/CORRECTIONS_LOG.md` §Entry 2026-05-27** (THE meta-pattern entry — captures the NEW reusable Pattern verbatim + 4 sub-observations + Rule 14f free-text escape-hatch calibration data point + supersedence of §A.10/§A.11/§A.12/§A.7).
- **`feedback_browser_first_ai_with_server_migration.md`** (PRIMARY directive for this session's per-batch endpoint scaffold + browser batch loop implementation; THE memory file that governs the execution architecture).
- **`feedback_plan_output_shape_before_building.md`** (predecessor memory file; relevant cross-reference for the design-lock context).
- All other existing memory files (`feedback_recommendation_style.md` + `feedback_default_to_recommendation.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_deferred_items_registry.md` + `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md`).
- **The Claude API skill** (since this session rewrites `prompts.ts` + fires the first live AI call).
- **W#1's `AutoAnalyze.tsx` at `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx`** — read the BatchObj queue + localStorage checkpoint + per-batch fetch + pause/resume/cancel semantics sections. This is the canonical implementation pattern this session mirrors for W#2. Pay particular attention to lines 2094-2099 (the execution-mode dropdown labels) since the new shared `ExecutionModeSelect` component shipped today pins exactly those labels.
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (zero gates expected) + Rule 14f (forced-picker mechanics — expect ~3-5 to fire: 1 architecture-decision picker for the per-batch endpoint + 1 cost-confirmation picker before the first live AI call + 1 §4 Step 1c next-task picker at session-end + possible 1-2 more during prompts.ts rewrite if any sub-decisions surface) + Rule 18 (§A frozen + §B append-only) + Rule 21 + Rule 22 + Rule 23 (Change Impact Audit — PLOS-side handlers + src/lib + schema-change-in-flight STAYS YES) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + §4 Step 4b extended template.

**Task shape (P-49 W5 Session 2 — per-batch server endpoint scaffold + `prompts.ts` rewrite + Table 2 page start + first live end-to-end run):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or code mechanics. The 3 plain-terms sections at top above provide the launch context.

2. **Branch state verify** — `git branch --show-current` (should be `workflow-2-competition-scraping`) + `git log main..HEAD --oneline` (should show **4 commits ahead at session entry**: build commits `04f74cf` + `252e1dd` + 2 doc-batch commits from W5 Session 1 + W5 Session 1.5). If anything else, surface to director.

3. **Pre-build reads** — execute the pre-build read list above. ~15-20 min.

4. **Pre-build /scoreboard** — confirm 5/5 GREEN at the new baselines on `workflow-2-competition-scraping` (root tsc clean / extension tsc clean / **910 ext** / **906 src/lib** / **65 routes**); Check 6 Playwright SKIP via Rule 14f forced-picker per Rule 27 (Recommended per standing non-deploy SKIP precedent; treated as default-approved).

5. **Code mechanics — per-batch endpoint scaffold + prompts.ts rewrite + Table 2 page start + browser batch loop + first live e2e run:**
   - **NEW `src/app/api/projects/[projectId]/competition-scraping/review-analysis/run-batch/route.ts`** — thin shim for the per-batch endpoint that receives one batch + makes one Anthropic call + returns the result.
   - **NEW `src/lib/competition-scraping/handlers/review-analysis-run-batch.ts`** — ~200-300 LOC DI-seam handler for the per-batch endpoint.
   - **DELETE `src/lib/competition-scraping/handlers/review-analysis-run.ts` + test file + the shipped two-sweep API route shim** — the W5 Session 1 handler is replaced wholesale by the new per-batch endpoint per the locked design (browser drives the queue + makes per-batch calls; no more server-side multi-batch orchestration). Migrate any still-relevant unit tests from the old handler's test file to the new per-batch handler's test file.
   - **Rewrite `src/lib/competition-scraping/review-analysis/prompts.ts`** with the 7 flow-specific prompt builders director locked in today's planning conversation (per-review summarize + per-competitor comprehensive bulleted/non-bulleted + per-category comprehensive bulleted/non-bulleted + per-type comprehensive bulleted/non-bulleted). Each builder is a typed function taking the relevant slice of CapturedReview + Project context and returning a `{ systemPrompt, userPrompt, modelVersion }` shape. Add unit tests for each builder (prompt-content snapshot tests + edge-case input handling).
   - **Start Table 2 page** — NEW `src/app/projects/[projectId]/competition-scraping/competitor-reviews-analysis/page.tsx` (Table 2 — Competitor Reviews Analysis Table with per-review nested rows). Reuse existing TanStack Table patterns from the P-46 W2 Competition Data table where possible. Wire the 4-option toggle at the top of the parent Competition Scraping page (re-confirm placement per §B 2026-05-27 design lock).
   - **NEW Per-Review Summarize button + modal** — the modal consumes the new shared `ExecutionModeSelect` component shipped today + the new browser batch loop. Modal also includes: pre-flight cost estimate (transparency-only per §A.7 supersedence) + running cost tally (transparency-only) + pause/resume/cancel affordances (cells lock with pending badge during run; pause preserves cells + resumes from cursor; cancel keeps partial).
   - **Browser batch loop** — mirror W#1's BatchObj queue + localStorage checkpoint + per-batch fetch + pause/resume/cancel semantics from `AutoAnalyze.tsx` (read it first; don't reinvent). The browser orchestrates the queue + calls the new `/api/projects/[projectId]/competition-scraping/review-analysis/run-batch` endpoint one batch at a time + persists results via existing PATCH routes.
   - **Run `/scoreboard`** to confirm 5/5 GREEN at the same or near baselines (src/lib **906/906** or **906+N** for any new test cases; routes **66+** for new run-batch route, **65-** for deleted run route, net likely **+1 or unchanged**; extension **910/910** UNCHANGED).

6. **First live end-to-end run — Rule 14f cost-confirmation picker MUST fire BEFORE the live call.** Surface the cost estimate (via the existing `token-counter.ts` + `pricing.ts` modules from W5 Session 1) to director + ask explicit Yes/No before firing the live Anthropic API call. Once director says Yes, fire the live call against a small product corpus from production via the new Table 2 page + Per-Review Summarize button + modal + browser batch loop. Share the actual output with director for the FIRST real-world validation of the v1 prompt + output shape. Iterate within this session if needed.

7. **§4 Step 1c forced-picker at session-end** — locks the next-next task per Rule 14f. Likely alternatives: P-49 W5 Session 3 (Recommended if Session 2 lands the per-batch endpoint + first live run cleanly + Table 2 page renders results properly) vs P-49 W5 DEPLOY session (if Session 2 produces shipping-ready Per-Review Summarize end-to-end + director wants to ship the Table 2 + per-review flow to production) vs P-43 mechanical prevention small fix (~22+ cwd-leak reproductions running tally — increasingly competitive) vs P-48 Session 3 (Diagnostic #2) vs P-50 Condition Pathology card.

8. **End-of-session doc-batch** covers ROADMAP (header bump + P-49 polish-backlog entry status update for W5 Session 2 outcome + (a.103) closes + (a.104) opens) + CHAT_REGISTRY (header bump — 168th session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header + new §Entry 2026-XX-XX capturing W5 Session 2 outcome + any Patterns memorialized + first live e2e run results) + NEXT_SESSION (rewritten for next-next task per (a.104)) + HANDOFF_PROTOCOL (header bump only expected) + CLAUDE_CODE_STARTER (header bump only) + REVIEWS_PHASE_2_DESIGN.md §B 2026-XX-XX (TENTH build/deploy-session entry per Rule 18 — captures per-batch endpoint scaffold + 7 v1 prompts + Table 2 page start + first live e2e run outcome + any further design refinements that surface during build mechanics).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** every Rule 14f picker fired during the code mechanics should surface the recommended path + default to it unless director shifts.

**Per `feedback_approval_scope_per_decision_unit.md` (build-session push pattern memorialized 2026-05-27):** ONE push to `origin/workflow-2-competition-scraping` carrying any new build commits + the doc-batch commit at session-end. NO ff-merge to main this session unless the start-of-session deploy-now picker fires + director picks Deploy-now (less likely today since Session 2 still doesn't land enough user-visible UI to warrant a deploy).

**Schema-change-in-flight flag:** **STAYS YES entire session** (carrying PER_REVIEW + PER_CATEGORY enum values shipped 2026-05-27 via `npx prisma db push`; no new schema work planned this session — new per-batch endpoint reads + writes against the existing post-2026-05-27-migration schema).

**Rule 9 triggers planned this session: ZERO** (build session only by default; build commits stay on `workflow-2-competition-scraping` until next W5 deploy session).

---

## Pre-session notes (offline steps for director between sessions)

**No specific pre-session offline steps for the W5 Session 2 per-batch endpoint scaffold + first live e2e run.** Director can pre-think about which small product corpus to use for the first live AI call (a small competitor with ~10-50 captured reviews is ideal for the first run; lets us validate v1 prompt output without burning much cost), but no formal pre-session writing required.

**Optional director pre-thinking (helps the first live run move faster, NOT required):**

- **Which competitor + which product** to fire the first live Per-Review Summarize run against? (Recommended: a small Amazon competitor with ~10-50 captured reviews; lets us validate per-review v1 prompts without burning much cost.)
- **Any preferred model version?** (Recommended: Claude Opus 4.7 per the existing W#1 default; selectable via the W5 Session 1 client.ts seam.)
- **Any preferred initial scope cap** (e.g., "fire 10 per-review summaries only on first run before unlocking the rest")? Director-driven cost vigilance helps the first live run stay safe.

**Standing optional offline step (NOT blocking — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking W5 Session 2 at all — can happen any time. Director-independent.

---

## Standing carry-overs

**None this session.** No carry-overs at session entry; no carry-overs at session end. The (a.103) RECOMMENDED-NEXT = P-49 W5 Session 2 is the natural continuation of today's design lock + small enabling code primitives. 14 in-session tasks; 8 completed; 4 marked `DEFERRED:` with destinations noted in this NEXT_SESSION.md as the (a.103) RECOMMENDED-NEXT (per-batch endpoint scaffold + prompts.ts rewrite + W#1 AutoAnalyze refactor to shared component opportunistic + PENDING REVIEWS_PHASE_2_DESIGN.md §B update handled by this doc-batch).

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (build session does only push + possibly ff-merge if start-of-session deploy-now picker fires; no rebases, no force pushes, no `git reset --hard`, no `git branch -D`). **Note:** the DELETE of `src/lib/competition-scraping/handlers/review-analysis-run.ts` + its test file + the shipped two-sweep API route shim is a regular code-level delete (not a Rule 8 destructive op); replaced wholesale by the new per-batch endpoint per the locked design.

**Rule 9 triggers planned this session: ZERO** by default — build session only; no production deploy planned. Build commits stay on `workflow-2-competition-scraping` until next W5 deploy session.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe (including the NEW `feedback_browser_first_ai_with_server_migration.md` memory file from this session — auto-mirrored via PostToolUse hook). **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits an alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any code mechanics.

---

## Why this pointer was written this way (debug aid)

Today's session executed the (a.102) RECOMMENDED-NEXT task locked at the 2026-06-02 W5 Session 1 post-session doc-batch — P-49 W5 Session 1.5 director-driven planning of the per-product analysis output shape — and **shipped the Reviews Phase 3 design lock + schema enum extension + shared ExecutionModeSelect component at code level** but **deliberately deferred the per-batch endpoint scaffold + prompts.ts rewrite + Table 2 page + first live end-to-end run** per a deliberately narrow code-mechanics scope cut after the design lock conversation surfaced a much bigger vision than originally locked in §A.10/§A.11/§A.12. The session memorialized a NEW reusable Pattern via NEW memory file `feedback_browser_first_ai_with_server_migration.md` that applies to ALL FUTURE AI batch flows on Vercel across PLOS workflows.

The natural next-session task per (a.103) RECOMMENDED-NEXT is **P-49 W5 Session 2 — per-batch server endpoint scaffold + delete shipped per-product two-sweep handler + rewrite `prompts.ts` with 7 flow-specific builders + start Table 2 page + Per-Review Summarize button + modal + browser batch loop + first live end-to-end run on `workflow-2-competition-scraping`**.

- **(Recommended)** P-49 W5 Session 2 — per-batch endpoint scaffold + prompts.ts rewrite + Table 2 page start + first live e2e run; ~2-4 hours in-Claude; BUILD session; ZERO Rule 9 deploy gates planned by default; Schema-change-in-flight STAYS YES (carrying from today's `npx prisma db push`). Recommended because (a) it's the natural continuation of today's design lock — we shipped the design + small enabling code primitives today; next session ships the big lifts; (b) the per-batch endpoint scaffold + browser batch loop are direct mirrors of W#1's existing successful execution pattern + the new memory file `feedback_browser_first_ai_with_server_migration.md` governs the implementation; (c) the 7 v1 prompts locked today during the planning conversation need to be written into `prompts.ts` to enable the first live AI call; (d) the first live AI call is THE moment of truth for the v1 prompts + the locked design — until we see actual output against actual reviews, the design is theoretical.

The shape of P-49 W5 Session 2 is **plain-terms summary + branch state verify + pre-build reads + pre-build /scoreboard + code mechanics (per-batch endpoint scaffold + prompts.ts rewrite + Table 2 page start + Per-Review Summarize button + modal + browser batch loop + delete shipped two-sweep handler + run /scoreboard) + Rule 14f cost-confirmation picker before first live AI call + first live end-to-end run + iterate if needed + §4 Step 1c next-session picker + end-of-session doc-batch (9-doc bundle including REVIEWS_PHASE_2_DESIGN.md §B TENTH build/deploy-session entry) + 1 push to workflow branch**.

**After W5 Session 2 ships,** the next-next sessions step through W5 Sessions 3-10 (Table 3 + Table 4 + Excel export + drag-reorder + click-to-edit + show-hide columns + Phase 4 verification + W5 deploy session). The Per-Review flow shipped in Session 2 is the canonical pattern; Tables 3 + 4 reuse the modal + browser batch loop + per-batch endpoint with only the prompt flow + grouping shape changing.

**Alternate next-session candidates if director shifts priorities at session start:**

- **P-43 mechanical prevention small fix.** **Increasingly justifiable** given ~22+ cwd-leak reproductions across recent sessions. NOT recommended as the immediate next session — opportunistic; defer to after W5 Session 2 ships. Today's end-of-session §4 Step 1c picker did NOT offer P-43 as an alternative because the (a.103) shape (W5 Session 2) is the natural continuation of today's narrow scope cut; P-43 stays competitive for the next picker after W5 Session 2 lands cleanly.
- **P-48 Session 3 (Diagnostic #2) — opportunistic insertion.** NOT recommended — W5 Session 2 is the natural next step per the design lock that just landed.
- **P-50 Condition Pathology card — small `main`-branch standalone session.** NOT recommended as the next-session task — P-50 is ~10 min in-Claude + lives on `main` not `workflow-2-competition-scraping`. Could slot opportunistically.
- **P-26 below-fold scroll capture evaluation.** NOT recommended — LOW alternate; re-evaluate after Reviews Phase 2 + Phase 3 closes (specifically after W5 closes).
- **P-27 Bug #9 + Bug #15 re-evaluation.** NOT recommended — likely obsolete after P-46.
- **W#2 graduation step.** NOT recommended UNTIL Reviews Phase 2 + Phase 3 + P-48 stutter + P-43 + P-26 + P-27 all close.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above.

Check `ROADMAP.md` for the canonical state. Check `docs/REVIEWS_PHASE_2_DESIGN.md` for the canonical interview-locked spec + the §B 2026-05-26 through §B 2026-05-27 build/deploy-session entries (the full Reviews Phase 2/3 lineage now spanning W2 Amazon + W4 Captured Reviews UI + W2 eBay + W2 Etsy + W2 Walmart + W5 AI review analysis Session 1 + W5 Session 1.5 Reviews Phase 3 design lock). Check `docs/CORRECTIONS_LOG.md` §Entry 2026-05-27 (today's closing entry) for the NEW reusable Pattern memorialization ("Default new AI batch flows to browser-side execution; add execution-mode dropdown now for seamless future server-side migration") + 4 sub-observations including the Rule 14f free-text escape-hatch calibration data point + the supersedence of §A.10/§A.11/§A.12/§A.7.

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-05-27 (W5 Session 1.5 Reviews Phase 3 design lock + schema enum extension + shared ExecutionModeSelect shipped at code level; W5 Session 2 NEXT):

- **P-49 W5 Session 2 — NEXT (a.103).** ~2-4 hours estimated for the per-batch endpoint scaffold + prompts.ts rewrite + Table 2 page start + first live end-to-end run on a small product corpus. BUILD session by default; ZERO Rule 9 deploy gates planned unless start-of-session deploy-now picker fires. Schema-change-in-flight STAYS YES (carrying today's `npx prisma db push`).
- **P-49 W5 Sessions 3-10 (estimated) — Tables 3 + 4 + Excel export + drag-reorder + click-to-edit + show-hide columns + Phase 4 verification + W5 deploy session.** Per the §B 2026-05-27 design lock these later sessions ship Tables 3 + 4 (By Category + By Type) with the comprehensive per-grouping AI flows + the table-feature scope (Excel export + drag-reorder + click-to-edit + show-hide columns) + Phase 4 verification + W5 deploy session. The Per-Review flow shipped in Session 2 is the canonical pattern; Sessions 3-4 reuse it with the grouping shape + prompt flow changing.
- **P-49 total build arc ~6-10 sessions remaining** (W5 Sessions 2-10 ish — depending on how much Tables 3 + 4 + the table-feature scope + Phase 4 verification + W5 deploy session bundles into single sessions vs multiple).
- **P-50 Condition Pathology card.** ~10 min in-Claude. Lives on `main` branch. Can slot into any deploy session OR done standalone. NOT on the critical path.
- **P-48 Session 3 (Diagnostic #2) — DEFERRED to opportunistic insertion.** ~30-60 min in-Claude.
- **P-43 mechanical prevention candidate (LOW informational).** ~1 small session. Add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`. **Empirical signal continues mounting** — ~2 more reproductions today; running tally ~22+ across recent sessions. **Increasingly worth slotting in opportunistically** — today's end-of-session §4 Step 1c picker did NOT offer P-43 as an alternative because the (a.103) shape (W5 Session 2) is the natural continuation of today's narrow scope cut; P-43 stays competitive for the next picker after W5 Session 2 completes.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions, OR drop. Re-evaluate after Reviews Phase 2/3 closes.
- **P-27 Bug #9 + Bug #15 — DEFERRED LOW.** ~0-1 sessions. Likely obsolete after P-46.
- **W#2 graduation step (further deferred).** Gated by Reviews Phase 2/3 closure at the workstream-by-workstream level. With today's W5 Session 1.5 design lock + small enabling code primitives shipped at code level, the remaining work is: W5 Sessions 2-10 (~6-10 sessions). Likely 2-3 months out at current sessions-per-week cadence.
- **THEN STOP AND EXPLICITLY ASK DIRECTOR for any next round of competition-scraping additions** per your standing directive after Reviews Phase 2/3 + P-48 stutter + P-43 + P-26 + P-27 all close.
- **After your next round of additions ships:** W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Director-independent.

---

## Personalized Handoff (parent Claude — copy into the director-facing summary)

**What we did this session (3-minute read):**

Today we had a long planning conversation where you laid out a much bigger vision than what was originally locked in the Reviews Phase 2 design doc. We locked the new Reviews Phase 3 design across ~20 forced-pickers (you picked the recommended option 19/19 times on the ones you answered, plus redirected via free-text twice — once to drop Stars + Reviews Summary columns from Tables 3 + 4, and once to remove all cost caps). Mid-planning you also redirected on the execution architecture — instead of a Vercel-suspend-resume server-side worker pattern I'd proposed, you redirected to W#1's existing browser-first execution pattern + asked for an execution-mode dropdown NOW for seamless future server-side migration. That redirect memorialized a **NEW reusable Pattern** in a new memory file `feedback_browser_first_ai_with_server_migration.md` — applies to ALL FUTURE AI batch flows on Vercel across PLOS workflows.

Then we did just two small code changes today: added two new enum values to the schema (PER_REVIEW + PER_CATEGORY) via `npx prisma db push` and built a tiny shared dropdown component at `src/lib/workflow-components/execution-mode-select.tsx` that next session's modals will use. Everything else (the new per-batch server endpoint, rewriting the AI prompts, building the actual Table 2 page, firing the first live AI call) is deferred to next session in a deliberately narrow scope cut to avoid mid-build edits to W#1's working modal.

**Your verbatim mid-planning architectural redirect (captured in the new memory file):** *"If keeping things server-side significantly constrains us, we can run things on the browser side and have the option to move things server-side when things scale up..."*

**The locked design has 9 main parts** (full detail in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-27):

1. 4-option toggle at the top of the Competition Scraping page.
2. Three brand-new tables — Table 2 Competitor Reviews Analysis (per-review nested rows) / Table 3 By Category / Table 4 By Type.
3. Seven AI run flows across the three tables.
4. Browser-first execution mirroring W#1's existing BatchObj queue + localStorage checkpoint + per-batch server endpoint pattern.
5. Execution-mode dropdown (Browser default / Server future) added NOW to all future modals.
6. Seven v1 prompts drafted + locked during the planning conversation (rewrite into `prompts.ts` is next session).
7. No cost caps — pre-flight estimate + running tally kept as transparency only.
8. One flow at a time per Project — cells lock with pending badge during run; pause = preserve + resume from cursor; cancel = keep partial.
9. Excel export + drag-reorder + click-to-edit + show-hide columns all locked as Table-feature scope (deferred to opportunistic future W5 sessions).

**What landed code-side via build commit `252e1dd` (6 files +181/-10 — schema enum extension + shared ExecutionModeSelect component ONLY):**

- MODIFY `prisma/schema.prisma` — `ReviewAnalysisLevel` enum extended with PER_REVIEW + PER_CATEGORY. `npx prisma db push` 1.19s additive zero data loss. Schema-change-in-flight FLIPPED NO → YES.
- MODIFY `src/lib/shared-types/competition-scraping.ts` — union widened + validator narrowed.
- MODIFY `src/lib/competition-scraping/handlers/review-analysis-run.ts` — row type widened (handler scheduled for replacement next session).
- NEW `src/lib/workflow-components/execution-mode.ts` — type + constants + validator matching W#1's verbatim labels.
- NEW `src/lib/workflow-components/execution-mode-select.tsx` — controlled `<select>` React component for modal consumption.
- NEW `src/lib/workflow-components/execution-mode.test.ts` — 7 node:test cases.

**Reviews Phase 3 design lock supersedes REVIEWS_PHASE_2_DESIGN.md §A.10 + §A.11 + §A.12 + §A.7 substantially** — per Rule 18 §A is frozen; new locked decisions live in §B 2026-05-27 (NINTH build/deploy-session §B entry; FIRST W5 Session 1.5 entry). Future workstreams should cross-check §B 2026-05-27 for the superseding design.

**Pre-build scoreboard:** src/lib **899/899** → **906/906** post-build (+7); npm run build **65 routes UNCHANGED**; extension **910/910** UNCHANGED. NEW baseline: src/lib **906/906** + 65 routes UNCHANGED + extension UNCHANGED.

**Rule 14f forced-picker calibration this session:** 19/19 = 100% Yes-to-Recommended on the pickers answered + 2 free-text redirects (Round 2 row-structure + Round 3 cost-caps). Running cumulative across recent 10 sessions: 70/73 = 95.9%.

**P-43 cwd-leak Pattern Class reproduced ~2 more times this session** (post-build `npm run build` inherited extension cwd from a previous `cd .../extensions/competition-scraping && npx tsc --noEmit` and ran the extension's build script instead of root Next.js; required re-run with explicit absolute-path `cd /workspaces/brand-operations-hub` prefix). Running tally now ~22+ across recent sessions. **Strong empirical signal continues mounting** for the P-43 mechanical prevention small fix; increasingly competitive for opportunistic insertion.

**Files now live on `workflow-2-competition-scraping` (NOT yet in production — pure BUILD session):**

- `prisma/schema.prisma` (PER_REVIEW + PER_CATEGORY enum values added — schema-change-in-flight YES until next W5 deploy).
- `src/lib/shared-types/competition-scraping.ts` (union widened).
- `src/lib/competition-scraping/handlers/review-analysis-run.ts` (row type widened; scheduled for replacement next session).
- `src/lib/workflow-components/execution-mode.ts` (NEW shared module).
- `src/lib/workflow-components/execution-mode-select.tsx` (NEW shared component).
- `src/lib/workflow-components/execution-mode.test.ts` (NEW test file; 7 cases).

**Push status:**

- (1) Workflow-branch push to `origin/workflow-2-competition-scraping` carrying BOTH build commit `252e1dd` + end-of-session doc-batch commit — PENDING (about to fire).
- Branch state at end-of-session: `workflow-2-competition-scraping` **4 commits ahead of `origin/main`** (W5 Session 1 build `04f74cf` + W5 Session 1 doc-batch `25b1a3a` + W5 Session 1.5 build `252e1dd` + W5 Session 1.5 end-of-session doc-batch commit); main is unchanged from yesterday's W2 Walmart post-deploy doc-batch SHA.

**Deferred items at session end (Rule 26):** **ZERO.** 14 in-session tasks; 8 completed; 4 marked `DEFERRED:` with destinations noted in this NEXT_SESSION.md as the (a.103) RECOMMENDED-NEXT (per-batch endpoint scaffold + prompts.ts rewrite + W#1 AutoAnalyze refactor to shared component opportunistic + PENDING REVIEWS_PHASE_2_DESIGN.md §B update handled by this doc-batch).

**END-OF-SESSION INSTRUCTIONS for you (the director, offline between sessions):**

**Optional pre-thinking on the first live run (helps Session 2 move faster, NOT required):**

- **Which competitor + which product** to fire the first live Per-Review Summarize run against? (Recommended: a small Amazon competitor with ~10-50 captured reviews; lets us validate per-review v1 prompts without burning much cost.)
- **Any preferred model version?** (Recommended: Claude Opus 4.7 per the existing W#1 default; selectable via the W5 Session 1 client.ts seam.)
- **Any preferred initial scope cap** (e.g., "fire 10 per-review summaries only on first run before unlocking the rest")? Director-driven cost vigilance helps the first live run stay safe.

The standing optional offline step (raise the Supabase Global File Size Limit) remains available any time — see "Pre-session notes" above for the steps. NOT blocking.

**NEXT-SESSION INSTRUCTIONS for the next Claude Code session (the easy path):**

When you start the next session in Codespaces, run `./resume` (or `./resume-workflow 2`) — that will switch you to `workflow-2-competition-scraping` and pre-load context. Then paste the launch prompt above (the "Launch prompt" section). The next Claude will produce a plain-terms summary of what it'll do (per Rule 30) BEFORE asking director for go-ahead. Once director gives go-ahead, Claude will execute the pre-build read list + pre-build /scoreboard + code mechanics (per-batch endpoint scaffold + prompts.ts rewrite + Table 2 page start + Per-Review Summarize button + modal + browser batch loop + delete shipped two-sweep handler) + fire the first live end-to-end run (with Rule 14f cost-confirmation picker BEFORE the live call) + iterate if needed + close (a.103). Expected ~2-4 hours in-Claude (longer than today's because of the multi-piece code mechanics + the first live AI call + likely first-iteration tweaks on the v1 prompts). BUILD session — ZERO Rule 9 deploy gates planned by default. Schema-change-in-flight STAYS YES.

**ESCAPE HATCH (if `./resume` doesn't work or you want a different task):**

If you'd rather pick a different next-session task, surface that at session start before the planning conversation opens — the Rule 14f forced-picker mechanics will accommodate. The alternate candidates are listed in the "Alternate next-session candidates" section above; W5 Session 2 is the canonical next step per today's design lock + the directly-actionable §B 2026-05-27 entry, but if you want to insert P-43 opportunistically given the ~22+ cwd-leak reproductions running tally (mechanical prevention fix that's increasingly competitive) or run P-50 Condition Pathology card on `main` branch standalone, that's available.

**Offline between sessions:** None blocking. Optional pre-thinking on the first live run target (above) helps Session 2 move faster but is NOT required. Optional Supabase file size limit raise remains available.

**Open questions / carry-overs:** None at session end. Today's session shipped the Reviews Phase 3 design lock + schema enum extension + shared ExecutionModeSelect component at code level + memorialized a NEW reusable Pattern that governs how next session's execution architecture runs. **The (a.103) RECOMMENDED-NEXT task — W5 Session 2 per-batch endpoint scaffold + prompts.ts rewrite + Table 2 page start + first live e2e run — is the natural continuation** of today's design lock + small enabling code primitives shipped via build commit `252e1dd`.

---
