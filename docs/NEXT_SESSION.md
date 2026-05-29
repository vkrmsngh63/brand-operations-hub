# Next session

**Written:** 2026-05-29-d (`session_2026-05-29-d_p49-w5-fix-session-c-deploy-2-drag-to-reorder` — W#2 polish P-49 W5 Reviews Analysis Table Fix Session C "Deploy 2" — drag-to-reorder ✅ DEPLOYED-AND-VERIFIED 2026-05-29-d end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — ONE Rule 9 deploy gate (single build `194e66f`, 11 files +743/-29), director-Yes; both branches at `194e66f` pre-doc-batch. Director Phase 4 verbatim verdict: **"Passed."** TWO NEW reusable PATTERNS: **"Reorder-field discriminator on a shared reorder endpoint"** + **"Spec-named storage column may not exist — audit before building"** (the Rule 3 `CompetitorUrl.sortRank`-never-existed finding). **Closes (a.113) RECOMMENDED-NEXT** — with Deploy 2 shipped, the Competitor Reviews Analysis Table page is fully §1-compliant / CLOSED. **Opens (a.114) RECOMMENDED-NEXT = P-49 W5 Category page corrective rebuild — Block 1 planning resume** on `workflow-2-competition-scraping`.

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** The 2026-05-29 date-stamp drift was resolved two sessions ago; this session correctly stamped `2026-05-29-d` (continuing the same calendar day's letter sequence after `-c`). Do NOT re-introduce 2026-05-30 / 05-31 stamps. Future sessions keep trusting the harness `currentDate`.

> ⚠️ **BRANCH: next session stays on `workflow-2-competition-scraping`.** (a.114) / Category page corrective rebuild is W#2-only Reviews Phase 2 work. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry next session.** Block 1 of the Category page rebuild is the scaffold (route + flat 13-column table + grouping + column show/hide + click-to-edit; NO drag, NO AI, NO Excel per the 5-session plan) and is primarily a PLANNING resume — answer the 6 open questions in the Category page spec §4 BEFORE any code. The drag-persistence schema question (Q-F) is a Session-3 concern, not Block 1.

---

## What we did this session (in plain terms)

Today we shipped "Deploy 2" — the very last piece of work on the competitor-reviews-analysis table. In plain terms:

1. **Drag whole competitors up and down.** You can now grab a small drag handle on a competitor (URL) row and move it up or down; all of that competitor's review rows move along with it. The new order is remembered, and because it uses the SAME "row order" the Competitor Content Table already uses, reordering competitors on one page reflects on the other too.
2. **Drag individual review rows within a competitor.** Inside a competitor, you can reorder the individual review rows by dragging their handle. That order is saved per-review using the small "order number" column we shipped last session.
3. **The order sticks across refreshes, and the Excel export follows what's on screen.**

A useful behind-the-scenes catch this session: the spec told us to save the competitor order in a database column called `CompetitorUrl.sortRank` — but that column never actually existed in the code. We checked the real code first (our standing rule: the shipped code wins over the docs), found the Competitor Content Table actually stores its order in a shared per-user "row order" list, and you chose to reuse that same list so the order reflects across both pages. No database change was needed.

**Your verbatim Phase 4 verification verdict: "Passed."**

**With this, the entire Competitor Reviews Analysis Table page is done and matches the spec.** The only remaining P-49 W5 work is the two sibling pages: the Category page and the Type page (a corrective rebuild planned across 5 sessions).

**Numbers:**

- **THREE Rule 14f decisions — all chosen = 3/3 = 100% Yes-to-Recommended** (order-sync-across-both-tables + drag-affordance [grip handle] + the deploy gate). Running cumulative: **133/136 = 97.8%**.
- **ONE Rule 9 deploy gate fired** (single build `194e66f`).
- **Three pushes total** (the deploy ff-merge + ping-pong happened during the session; the end-of-session doc-batch push + ping-pong are pending — the parent handles them).
- **Schema-change-in-flight = NO entire session** (the order columns/fields already existed; no database migration).
- **Post-merge /scoreboard all GREEN at NEW LOCKED baselines:** root tsc clean + extension tsc clean + extension `npm test` = 910/910 UNCHANGED + src/lib `node:test` = **1101/1101** (+21 from 1080) + `npm run build` = **68 routes UNCHANGED** (reused the existing table-preferences + reviews-reorder endpoints; no new route); Check 6 Playwright SKIPPED per Rule 27.
- **NO extension zip this session** (no extension code changed).

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (P-49 entry) + `docs/polish-item-specs/P-49-W5-S4-category-page.md` §4 + `docs/polish-item-specs/P-49-W5-S5-type-page.md` + `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §3.

- **(a.114) P-49 W5 Category page corrective rebuild — Block 1 planning resume** — NEXT SESSION; on `workflow-2-competition-scraping` (see below). The Category page is Sessions 1-3 of the 5-session corrective rebuild; the Type page is Sessions 4-5.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.

## What we'll do next session (in plain terms)

Next session is **P-49 W5 Category page corrective rebuild — Block 1 planning resume** — the start of the Category page (and after it, the Type page). In plain terms:

1. **Resume the planning conversation first.** There are 6 open design questions in the Category page spec we need to settle with you BEFORE writing any code (how the "Stars" column behaves, how the "Reviews Summary" column renders, whether the non-bulleted column is included now, which Excel library, the AI prompt wording, and how the two-level drag order is stored).
2. **Then build the Category page scaffold (Session 1 of the 5-session plan):** the page route + a flat 13-column table grouped by category (first row of each group carries the category label) + column show/hide checkboxes + click-to-edit cells. NO drag, NO AI, NO Excel yet — those land in Sessions 2 and 3.

Because Block 1 is planning + a scaffold, **the database-change flag is NO at the start of next session**.

## What's still left in the total roadmap (in plain terms)

- **P-49 W#2 Reviews Phase 2 (IN-FLIGHT — the Competitor Reviews Analysis Table page is now CLOSED [Fix A + B + D + FU-1 + FU-2 + Fix C Deploy 1 + Deploy 2 all ✅ DEPLOYED]; the Category page Sessions 1-3 + the Type page Sessions 4-5 remain)** — the Category + Type page corrective rebuilds. Estimate ~5 more sessions until P-49 W5 closes.
- **P-52 (AI model registry + Rule 32 + Opus 4.8 rollout)** — ✅ DEPLOYED-AND-VERIFIED 2026-05-29-b on `main`. TWO carry-overs OPEN: official Opus 4.8 pricing numbers (director may supply offline) + the deferred W#1 shared-list migration.
- **P-50 NEW Condition Pathology card** — small single-session UI addition; director already approved scope; slot in any future session or do standalone on `main`.
- **P-51 NEW per-Project competitive landscape AI summary on `/comprehensive-analysis` page** — slot AFTER P-49 closes (director directive: P-51 is BETWEEN P-49 and P-50 in next-priority order); spec skeleton in place; build session opens with Q&A.
- **P-48 Session 3 (Diagnostic #2 for screen-recording stutter)** — empirical instrumentation; deferred.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; running tally ~31-33+ (no notable new reproductions this session). Single-session fix.
- **P-26 below-fold scroll capture bugs** + **P-27 capture bugs #9 + #15** — LOW priority; re-evaluate after P-49 closes.
- **W#2 graduation** — deferred until P-49 closes.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started.
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load (Fix Session D's FF1 surfaced transient connection-pool saturation; the autosave-retry helper papers over it client-side) + Supabase file-size offline check.

---

## Status of last session

**P-49 W5 Reviews Analysis Table Fix Session C "Deploy 2" — drag-to-reorder ✅ DEPLOYED-AND-VERIFIED 2026-05-29-d** end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`. DEPLOY session: ONE Rule 9 deploy gate fired (single build). Director Phase 4 verbatim verdict: "Passed." With it, the Competitor Reviews Analysis Table page is fully §1-compliant / CLOSED.

**Session shape (DEPLOY — 1 build commit + end-of-session doc-batch; 1 ff-merge + ping-pong sync):**

- Build: `194e66f` (11 files +743/-29: NEW `src/lib/competition-scraping/reviews-table-reorder.ts` + `.test`; MODIFIED `competitor-reviews-analysis/page.tsx`, `handlers/reviews-reorder.ts` + `.test`, `url-reviews.ts` + `.test`, `reviews-by-id.ts` + `.test`, `captured-reviews-helpers.test.ts`, `shared-types/competition-scraping.ts`).
- 1 PENDING: end-of-session doc-batch commit (this doc-batch agent's output) — carries the 7-doc Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY [unchanged content; listed for completeness]) + HANDOFF_PROTOCOL header bump + 1 Group B doc (REVIEWS_PHASE_2_DESIGN.md §B 2026-05-29-d) + 2 MODIFIED polish-item-specs.

**THREE Rule 14f decisions — all chosen = 3/3 = 100% Yes-to-Recommended** (order-sync-across-both-tables [Synced, Recommended] + drag-affordance [grip handle, Recommended] + the deploy gate). Running cumulative = **133/136 = 97.8% Yes-to-Recommended**.

**ONE Rule 9 deploy gate fired this session.**

**Schema-change-in-flight flag NO entry → NO exit** — the `CapturedReview.sortRankInReviewsTable` column already shipped in Deploy 1; Deploy 2 only consumes it + uses the existing `UserTablePreferences.rowOrder` field for URL-row order. No `prisma db push` this session.

**ZERO DEFERRED items at entry and exit (Rule 26)** — all in-scope work (URL-row drag + review-row drag) shipped in the single deploy. ZERO new DEFERRED.

**Baselines locked from this session:** root tsc clean + extension tsc clean + extension `npm test` = **910/910 UNCHANGED** + src/lib `node:test` = **1101/1101** (+21 from 1080 entry — +17 NEW `reviews-table-reorder.test.ts` pure-helper cases + 4 NEW `reviews-reorder.test.ts` field-discriminator cases) + `npm run build` = **68 routes UNCHANGED** (reused the existing `/table-preferences` + `/reviews/reorder` endpoints — no new route).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-29-d** (no slips) capturing: (1) the CRITICAL Rule 3 (code-wins-over-docs) finding — the spec-named `CompetitorUrl.sortRank` URL-row persistence column NEVER existed (the Content Table actually uses `UserTablePreferences.rowOrder`); (2) NEW reusable PATTERN — "Spec-named storage column may not exist — audit before building"; (3) NEW reusable PATTERN — "Reorder-field discriminator on a shared reorder endpoint" (the `field` param added to `reviews-reorder.ts` lets a second page persist an independent order of the same rows with no new route); (4) P-43 cwd-leak running tally ~31-33+ (no notable new reproductions). NO new memory file.

**NEW §B 2026-05-29-d entry appended to `docs/REVIEWS_PHASE_2_DESIGN.md`** (TWENTIETH build/deploy-session §B entry per Rule 18; TWELFTH W5 entry — the two drag surfaces + the shared `rowOrder` mechanism + the `field`-discriminator reorder pattern + the Rule 3 finding; notes Deploy 2 must not regress the Deploy 1 non-bulleted flow / Excel export / tooltips / traceability box).

**ROADMAP P-49 entry status updated to "🟢 IN-FLIGHT 2026-05-29-d — Fix Session C Deploy 2 ✅ DEPLOYED-AND-VERIFIED"** with the build commit hash + the Reviews Analysis Table page CLOSED note + (a.114) Category page Block 1 planning resume queued.

**FIFTY-SEVENTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. (a.114) / Category page corrective rebuild is W#2-only Reviews Phase 2 work. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch lands + the standard 3-push ping-pong sync fires): `main` and `workflow-2-competition-scraping` both at the post-doc-batch SHA after ff-merge. Verify with `git status` showing a clean working tree (apart from historical untracked .zip + .html artifacts at repo root) and `git log origin/main..HEAD --oneline | wc -l` = 0.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files since this NEXT_SESSION.md references P-43 + P-49 + P-50 + P-51 + P-52; read §3 + §4 of each at session start):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate) + Rule 32 (model-selection registry — RELEVANT for Sessions 2/5 which add AI flows + model pickers, NOT for Block 1 scaffold) + Rule 14f (forced-picker mechanics — expect the 6 open-question pickers BEFORE any code, per `feedback_plan_output_shape_before_building.md`) + Rule 9 (deploy gate — likely NOT fired in a planning/scaffold session) + Rule 18 + Rule 23 (Change Impact Audit) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + §4 Step 4b extended template.
- **`docs/polish-item-specs/P-49-W5-S4-category-page.md` §1 (verbatim) + §2 (joint-discussion adjustments Q1-Q4 already locked) + §3 (the rolled-up 13-column spec) + §4 (the 6 STILL-OPEN questions Q-A through Q-F)** — THE source-of-truth for the Category page. The 6 open questions to settle in Block 1 planning: **Q-A** Column 8 "Stars" semantics (URL-level `productStarRating` vs per-review star breakdown); **Q-B** Column 9 "Reviews Summary" rendering (stacked list vs count+expand); **Q-C** Column 11 "non-bulleted" — NOTE: a per-competitor non-bulleted flow NOW EXISTS as of Fix Session C Deploy 1 (`per-competitor-nonbulleted`), so option (a) "(not generated) placeholder + add a new flow later" is partially overtaken — confirm with director whether the Category page reuses the shipped per-competitor non-bulleted flow or needs its own per-category non-bulleted flow; **Q-D** Excel library (`xlsx` vs `exceljs` vs CSV) — note the Reviews Analysis Table page already shipped an xlsx export in `reviews-table-export.ts`, so MIRROR that choice; **Q-E** AI prompt content (drafted jointly at Session 2 start); **Q-F** two-level drag persistence schema (new `CompetitorUrl` columns vs a separate order table) — a Session-3 concern.
- `docs/polish-item-specs/P-49-W5-S5-type-page.md` (the sibling Type page — Sessions 4-5; mostly parameterized off the Category spec).
- `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §3 (pointer table — Reviews Analysis Table page now CLOSED; Category + Type pages remaining) + the cross-cutting joint-discussion decisions.
- `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-29-d (this session — the drag pattern + the shared `rowOrder` mechanism) + §B 2026-05-29-c (the non-bulleted prose flow + Excel export the Category page may reuse) + §A (the frozen design intent for the Reviews Phase 2 system).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-29-d (this session's informational entry — the 2 NEW Patterns + the Rule 3 audit win).
- **The sibling Reviews Analysis Table surfaces** (the patterns to MIRROR for the Category page): `src/app/projects/[projectId]/competition-scraping/competitor-reviews-analysis/page.tsx` (the 13-column table + grouping + click-to-edit + the @dnd-kit drag pattern shipped this session) + `src/lib/competition-scraping/handlers/review-analysis-run-batch.ts` (the per-batch flow dispatch — add new Category flow values to `SHIPPED_FLOWS` per Q1) + `src/lib/competition-scraping/review-analysis/reviews-table-export.ts` (the xlsx export to mirror) + `prisma/schema.prisma` (confirm `CompetitorUrl.competitionCategory` + `CompetitorUrl.type` fields per Q3; the two-level drag schema for Q-F is a Session-3 design).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - `feedback_plan_output_shape_before_building.md` — DIRECTLY relevant: settle the 6 open questions (column semantics, rendering, AI prompts, Excel, drag schema) WITH the director via Rule 14f pickers BEFORE writing code.
  - `feedback_default_to_recommendation.md` + `feedback_recommendation_style.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_browser_first_ai_with_server_migration.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31 (with the 2026-05-28-b mechanical read-guarantee + audit-shipped-state mandate sub-sections), the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; read §3 + §4 of each listed spec at session start — especially `docs/polish-item-specs/P-49-W5-S4-category-page.md` §3 + §4 (the 6 open questions Q-A through Q-F).** **This session is on `workflow-2-competition-scraping` — verify the branch first.**

**Session goal (a.114 / P-49 W5 Category page corrective rebuild — Block 1 planning resume):** RESUME the Category page planning conversation and settle the 6 open questions BEFORE any code, then (if time + director go-ahead) build the Session-1 scaffold. The Category page is Sessions 1-3 of the 5-session corrective rebuild (Type page = Sessions 4-5). Block 1 = column-by-column spec confirmation + the 6 open-question resolutions. Session 1 scaffold = the page route + a flat 13-column table grouped by category (first row of each group carries the category label) + column show/hide checkboxes + click-to-edit cells; NO drag, NO AI, NO Excel (those are Sessions 2-3). **Schema-change-in-flight = NO entry state.** 0 Rule 9 deploy gates likely (planning + scaffold; deploy may come at the end of Session 1 if the scaffold is complete + director chooses to deploy).

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline | wc -l
# Expected: 0 (workflow-2 even with main after the standard 3-push ping-pong sync)
```

If `git branch --show-current` shows `main`, run `./resume-workflow 2` (or `git checkout workflow-2-competition-scraping && git pull`) — this session is the W#2 Reviews Phase 2 Category page work, NOT a `main`-track item.

**Phase 0 (audit-shipped-state + resume the planning conversation — per `feedback_plan_output_shape_before_building.md`, settle the 6 open questions via Rule 14f pickers BEFORE writing any code):**

- **Audit-shipped-state (Rule 31):** confirm the sibling Reviews Analysis Table page's patterns are intact (the 13-column table + grouping + click-to-edit + @dnd-kit drag shipped this arc) — they are the templates to mirror. Confirm `CompetitorUrl.competitionCategory` + `CompetitorUrl.type` fields exist (per spec Q3). Note that a per-competitor non-bulleted AI flow NOW EXISTS (`per-competitor-nonbulleted`, shipped Fix Session C Deploy 1) — this overtakes part of open question Q-C.
- **6 open-question planning pickers (spec §4):** Q-A (Column 8 "Stars" semantics) + Q-B (Column 9 "Reviews Summary" rendering) + Q-C (Column 11 non-bulleted — reuse the shipped per-competitor flow vs a new per-category flow) + Q-D (Excel library — recommend mirroring the shipped `reviews-table-export.ts` `xlsx` choice) + Q-E (AI prompt content — drafted jointly at Session 2 start, NOT Block 1) + Q-F (two-level drag persistence schema — a Session-3 concern, flag for later).

**Phase 1 (Session-1 scaffold build, if director gives go-ahead after planning):**

- Page route + a flat 13-column table grouped by `CompetitorUrl.competitionCategory` (first row of each group carries the category label; URLs with null/empty category → `(Uncategorized)` bucket per spec Q3) + column show/hide checkboxes + click-to-edit cells (editable columns per spec §3: 1, 2, 3, 4, 5, 6, 7, 10, 11, 12, 13). NO drag, NO AI, NO Excel.
- Test coverage: positive tests on the grouping + the column-config helper(s); negative tests asserting the sibling Reviews Analysis Table page is unchanged.

**Phase 2 (deploy decision Rule 14f, only if the scaffold lands + scoreboard-verifies):** fire a deploy-now-vs-exit picker. If deploy fires, ff-merge to main + Vercel auto-redeploy + Phase 4 director real-Chrome verification on vklf.com.

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (UNCHANGED)
- Extension tsc clean (UNCHANGED)
- Extension `npm test` = 910/910 (likely UNCHANGED — Category page is PLOS-side; confirm)
- src/lib `node:test` ≥ 1101 (entry 1101; expect +N for the grouping + column-config helper tests if a scaffold is built)
- `npm run build` = 68 routes (likely +1 if a NEW Category page route is added — confirm)
- Check 6 Playwright SKIPPED per Rule 27 (BUILD/PLANNING session)

**Deploy mechanics:** 0-1 Rule 9 deploy gates planned (planning + scaffold; a deploy may come only if the Session-1 scaffold completes). If deploy fires, expect the standard 3-push pattern (push + ff-merge to main + push main + ping-pong workflow-2) per `feedback_approval_scope_per_decision_unit.md`.

**Schema-change-in-flight flag:** **NO entry → NO exit** (Block 1 is planning + a scaffold over existing `CompetitorUrl` fields; the two-level drag-persistence schema [Q-F] is a Session-3 concern).

**Group A docs to update at session end:** ROADMAP header bump + P-49 polish-backlog entry status update (Category page Block 1 / Session 1 progress) + CHAT_REGISTRY header bump (180th session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header (+ 1 NEW §Entry if anything notable) + HANDOFF_PROTOCOL header bump (likely header-bump-only — no new rule expected) + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite (likely Category page Session 2 — the two AI flows — or a continuation of Block 1 planning).

**Group B docs to update at session end:** `docs/REVIEWS_PHASE_2_DESIGN.md` NEW §B entry (TWENTY-FIRST build/deploy-session entry; THIRTEENTH W5 entry) IF code ships. `docs/polish-item-specs/P-49-W5-S4-category-page.md` (resolve the answered §4 open questions into §2/§3; mark Session 1 scaffold ✅ DONE if built) + `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` (§3 pointer table — Category page progress).

**Standing carry-overs into this session:**

- **Opus 4.8 pricing numbers (P-52 carry-over)** — director may supply offline; relevant if the Category page AI flows surface cost estimates (Session 2, not Block 1).
- **W#1 `AutoAnalyze.tsx` shared-list migration (P-52 carry-over)** — a future `main`-track tidy-up; not for this session.
- **Type page Sessions 4-5** — STILL PENDING; resume after the Category page (Sessions 1-3) closes.

---

## Alternate next-session candidates if director shifts priorities at session start

- **(a.114.alt1) P-49 W5 Category page corrective rebuild — Block 1 planning resume** (current PICK — pre-loaded above). The next P-49 W5 work; on `workflow-2-competition-scraping`; Schema-change-in-flight NO; planning + Session-1 scaffold.
- **(a.114.alt2) Resolve the P-52 Opus 4.8 pricing carry-over + W#1 shared-list migration** (a small `main`-track follow-up, if the director supplies official pricing numbers and wants the W#1 cleanup done now).
- **(a.114.alt3) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`). Running tally ~31-33+; quick palate-cleanser.
- **(a.114.alt4) P-50 Condition Pathology card** (single-session — add a NEW card to two card-array files). Director already approved scope; quick palate-cleanser on `main`.
- **(a.114.alt5) P-51 per-Project competitive landscape AI summary** (per `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md` skeleton — build session opens with Q&A). Slotted AFTER P-49 closes, but available if director wants to start the Q&A early.
