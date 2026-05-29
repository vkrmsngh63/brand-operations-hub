# Next session

**Written:** 2026-05-29-c (`session_2026-05-29-c_p49-w5-fix-session-c-deploy-1-nonbulleted-prose-excel-tooltips` — W#2 polish P-49 W5 Reviews Analysis Table Fix Session C "Deploy 1" ✅ DEPLOYED-AND-VERIFIED 2026-05-29-c end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — FOUR Rule 9 deploy gates (Deploy 1 build `a24e92c` + FF1 `ecad5af` + FF2 `9da50ec` + FF3 `0631762`), all director-Yes; both branches at `0631762` pre-doc-batch. Director Phase 4 verbatim verdict: **"Everything passed."** THREE NEW reusable PATTERNS: **"Body-portal + viewport-fixed positioning for tooltips/overlays that must escape table-row stacking-context + overflow:auto clipping"** + **"Second-pass AI transform reads a prior flow's output, not raw inputs"** + **"analysisJson.flow discriminator lets two same-level (PER_PRODUCT) rows coexist per URL"**. **Closes (a.112) RECOMMENDED-NEXT PARTIALLY** (Deploy 1 = non-bulleted prose flow + Excel export + the `CapturedReview.sortRankInReviewsTable` schema column; drag-to-reorder DEFERRED to next session per a director Rule 14f reliability pick). **Opens (a.113) RECOMMENDED-NEXT = P-49 W5 Fix Session C "Deploy 2" — drag-to-reorder** on `workflow-2-competition-scraping`.

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** The 2026-05-29 date-stamp drift was resolved last session; this session correctly stamped `2026-05-29-c` (continuing the same calendar day's letter sequence). Do NOT re-introduce 2026-05-30 / 05-31 stamps. Future sessions keep trusting the harness `currentDate`.

> ⚠️ **BRANCH: next session stays on `workflow-2-competition-scraping`.** (a.113) / Fix Session C "Deploy 2" is W#2-only Reviews Analysis Table work. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry next session.** The only schema change in the whole P-49 W5 arc (`CapturedReview.sortRankInReviewsTable Int?`) ALREADY SHIPPED to production THIS session in Deploy 1. Deploy 2 (drag-to-reorder) merely CONSUMES that existing column — no new migration.

---

## What we did this session (in plain terms)

Today we shipped "Deploy 1" — the first half of the last big piece of work on the competitor-reviews-analysis table. In plain terms:

1. **A new "plain paragraphs" AI summary per competitor.** The per-competitor AI summary already came out as bullet points. We added a second flavor: a NEW non-bulleted, plain-paragraph critique. The interesting twist — it does NOT re-read the raw reviews; it reads the bullet summary you already generated and rewrites it into readable theme-labeled paragraphs (a "second pass"). There's an "Auto-create" button at the top (which skips and flags any competitor that doesn't have a bullet summary yet) and a per-competitor button too. The result shows in a new column, can be edited in place, survives a page refresh, and gets added to the bottom of the "Overall Analysis — Captured Reviews" box without overwriting what's there.
2. **Export the table to Excel.** A new "Export Table" button downloads the table as a spreadsheet — only the columns you currently have visible — with the text wrapped so it's readable.
3. **Hover tooltips on every button.** Each of the six buttons on the page now shows a little fade-in explanation when you hover. (We needed three quick follow-up fixes to get the last-column tooltips to stop getting clipped behind the table — they now render in a small floating layer above everything.)
4. **A behind-the-scenes database column.** We added a small new "order number" column to each captured review. It does nothing visible yet — it's the thing NEXT session's drag-to-reorder will use to remember the order you set.

We DID NOT ship drag-to-reorder this session — you chose (the reliable option) to split it into its own "Deploy 2" because it's the riskiest, most separable piece.

**Your verbatim Phase 4 verification verdict: "Everything passed."**

**Numbers:**

- **NINE Rule 14f decisions — all chosen = 9/9 = 100% Yes-to-Recommended** (a 4-question design batch + the Deploy 1 gate + the split-into-Deploy-2 pick + three fix-forward gates). Running cumulative: **130/133 = 97.7%**.
- **FOUR Rule 9 deploy gates fired** (Deploy 1 `a24e92c` + FF1 `ecad5af` + FF2 `9da50ec` + FF3 `0631762`).
- **Three pushes total** (the four deploy ff-merges + ping-pongs happened during the session; the end-of-session doc-batch push + ping-pong are pending — the parent handles them).
- **Schema-change-in-flight = YES at entry → flipped to NO at the Deploy 1 push** (the new `sortRankInReviewsTable` column shipped to production with zero data loss).
- **Post-merge /scoreboard all GREEN at NEW LOCKED baselines:** root tsc clean + extension tsc clean + extension `npm test` = 910/910 UNCHANGED + src/lib `node:test` = **1080/1080** (+21 from 1059) + `npm run build` = **68 routes UNCHANGED** (Excel is client-side; no new route); Check 6 Playwright SKIPPED per Rule 27.
- **NO extension zip this session** (no extension code changed).

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (P-49 entry) + `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3/§4 + `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §3.

- **(a.113) P-49 W5 Fix Session C "Deploy 2" — drag-to-reorder** — NEXT SESSION; on `workflow-2-competition-scraping` (see below). The LAST remaining piece on the Reviews Analysis Table page.
- **Category page Sessions 1-3 + Type page Sessions 4-5** (the corrective rebuild from 2026-05-28; specs `P-49-W5-S4-category-page.md` + `P-49-W5-S5-type-page.md`).
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.

## What we'll do next session (in plain terms)

Next session is **P-49 W5 Reviews Analysis Table Fix Session C "Deploy 2" — drag-to-reorder** — the very last piece of work on this table. In plain terms:

1. **Drag a whole competitor (URL) row up or down** to reorder competitors, with all of that competitor's review rows moving along with it.
2. **Drag the individual review rows within a competitor** up or down to set their order.
3. **Remember the order across refreshes.** The competitor-row order reuses the existing order field the URL detail page already uses; the review-row order uses the small column we shipped this session.

Because that column already shipped, **the database-change flag is NO at the start of next session** — no migration needed.

## What's still left in the total roadmap (in plain terms)

- **P-49 W#2 Reviews Phase 2 (IN-FLIGHT — Fix Sessions A + B + D + FU-1 + FU-2 ✅ DEPLOYED + Fix C "Deploy 1" ✅ DEPLOYED 2026-05-29-c; only Fix C "Deploy 2" drag-to-reorder + Category Sessions 1-3 + Type Sessions 4-5 remaining)** — Deploy 2 is the only remaining Reviews Analysis Table work; then the Category + Type page corrective rebuilds. Estimate ~6 more sessions until P-49 W5 closes.
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

**P-49 W5 Reviews Analysis Table Fix Session C "Deploy 1" ✅ DEPLOYED-AND-VERIFIED 2026-05-29-c** end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`. DEPLOY session: FOUR Rule 9 deploy gates fired (Deploy 1 + 3 fix-forwards). Director Phase 4 verbatim verdict: "Everything passed."

**Session shape (DEPLOY — 1 build commit + 3 fix-forwards + end-of-session doc-batch; 4 ff-merges + ping-pong syncs):**

- Deploy 1 build: `a24e92c` (10 files: `prisma/schema.prisma`, `competitor-reviews-analysis/page.tsx`, NEW `PerCompetitorNonBulletedModal.tsx` + `GlobalCompetitorNonBulletedModal.tsx`, `handlers/review-analysis-run-batch.ts` + `.test`, `review-analysis/prompts.ts` + `.test`, NEW `review-analysis/reviews-table-export.ts` + `.test`).
- FF1 `ecad5af` (page.tsx — HoverTooltip + tooltips on the 2 non-bulleted buttons).
- FF2 `9da50ec` (page.tsx — tooltips on the remaining 4 buttons + width:100% on their styles).
- FF3 `0631762` (page.tsx — body-portal tooltip rendering with viewport-fixed positioning).
- 1 PENDING: end-of-session doc-batch commit (this doc-batch agent's output) — carries the 7-doc Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY) + HANDOFF_PROTOCOL header bump + 1 Group B doc (REVIEWS_PHASE_2_DESIGN.md §B 2026-05-29-c) + 2 MODIFIED polish-item-specs.

**NINE Rule 14f decisions — all chosen = 9/9 = 100% Yes-to-Recommended** (4-question design batch [prose layout / length / input-source / Excel scope] + Deploy 1 gate + Deploy-2-sequencing pick + FF1 gate + FF2 gate + FF3 gate). Q8 (flow-value naming) resolved DIRECTLY = `per-competitor-nonbulleted` (already in the VALID_FLOWS allowlist + consistent with `per-competitor-bulleted`), NOT a director picker. Running cumulative = **130/133 = 97.7% Yes-to-Recommended**.

**FOUR Rule 9 deploy gates fired this session.**

**Schema-change-in-flight flag YES entry → FLIPPED YES → NO at the Deploy 1 push (`a24e92c` → main); exit NO** — `CapturedReview.sortRankInReviewsTable` additive nullable column via `prisma db push`; zero data loss.

**1 NEW DEFERRED item at session end (Rule 26)** — 7 in-session tasks; 6 completed; 1 DEFERRED = drag-to-reorder (Deploy 2), destination = this NEXT_SESSION.md + ROADMAP (a.113). ZERO open DEFERRED at exit (the parent closes the task after this pointer lands).

**Baselines locked from this session:** root tsc clean + extension tsc clean + extension `npm test` = **910/910 UNCHANGED** + src/lib `node:test` = **1080/1080** (+21 from 1059 entry — +9 prompts.test [non-bulleted builder/normalizer + SHIPPED_FLOWS tripwire update], +11 NEW reviews-table-export.test, +4 run-batch.test non-bulleted dispatch; one tripwire test UPDATED not added so net +21) + `npm run build` = **68 routes UNCHANGED** (Excel is client-side).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-29-c** (no slips) capturing: (1) NEW reusable PATTERN — "Body-portal + viewport-fixed positioning for tooltips/overlays..."; (2) NEW reusable PATTERN — "Second-pass AI transform reads a prior flow's output, not raw inputs" + the `analysisJson.flow` discriminator note; (3) positive audit-shipped-state win — the PATCH endpoint already supported non-bulleted edits with ZERO change (its `{summary}` branch spreads existingJson, preserving the flow discriminator); (4) P-43 cwd-leak running tally ~31-33+ (no notable new reproductions). NO new memory file.

**NEW §B 2026-05-29-c entry appended to `docs/REVIEWS_PHASE_2_DESIGN.md`** (NINETEENTH build/deploy-session §B entry per Rule 18; ELEVENTH W5 entry — the non-bulleted prose flow + `analysisJson.flow` discriminator + Excel export + the `sortRankInReviewsTable` column + the body-portal tooltip pattern; drag-to-reorder deferred to Deploy 2).

**Rule 32:** the 2 NEW non-bulleted modals registered as W#2 CONSUMERS in `docs/AI_MODEL_REGISTRY.md` (they import `SUPPORTED_MODEL_VERSIONS` from the central `models.ts`; no new declaration site — the Rule 32 hook correctly did not flag drift).

**ROADMAP P-49 entry status updated to "🟢 IN-FLIGHT 2026-05-29-c — Fix Session C Deploy 1 ✅ DEPLOYED-AND-VERIFIED"** with the 4 deploy commit hashes + the Schema-change-in-flight YES→NO note + (a.113) Deploy 2 queued.

**FIFTY-SIXTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. (a.113) / Fix Session C "Deploy 2" is W#2-only Reviews Analysis Table work. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch lands + the standard 3-push ping-pong sync fires): `main` and `workflow-2-competition-scraping` both at the post-doc-batch SHA after ff-merge. Verify with `git status` showing a clean working tree (apart from historical untracked .zip + .html artifacts at repo root) and `git log origin/main..HEAD --oneline | wc -l` = 0.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files since this NEXT_SESSION.md references P-43 + P-49 + P-50 + P-51 + P-52; read §3 of each at session start):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate) + Rule 32 (model-selection registry — NOT relevant; Deploy 2 is drag-only, no model picker) + Rule 14f (forced-picker mechanics — expect a drag-affordance/persistence-timing design picker + a deploy picker) + Rule 9 (deploy gate) + Rule 18 + Rule 23 (Change Impact Audit — drag-reorder is a write to existing columns; no schema change) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + §4 Step 4b extended template.
- **`docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 "Fix Session C" sub-section items 8/9/10 + §4** (THE source-of-truth for Deploy 2 — item 8 [`sortRankInReviewsTable` column, already DONE-shipped this session], item 9 [drag URL rows via `CompetitorUrl.sortRank`], item 10 [drag review rows via `CapturedReview.sortRankInReviewsTable`]) + the §2 2026-05-29-c joint-discussion note (the 4 Deploy-1 design decisions + the Deploy-1/Deploy-2 split).
- `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §3 (pointer table — Reviews Analysis Table page now "Fix A+B+D+FU-1+FU-2 + Fix C Deploy 1 ✅ DEPLOYED-AND-VERIFIED; Fix C Deploy 2 drag-to-reorder remaining") + the cross-cutting "Drag-to-reorder" design fact.
- `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-29-c (this session — the non-bulleted prose flow + `analysisJson.flow` discriminator + Excel export + the `sortRankInReviewsTable` column + the body-portal tooltip pattern; Deploy 2 must NOT regress any of these) + §B 2026-05-31-b (the editable traceability box Deploy 2 must not regress).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-29-c (this session's informational entry — the 3 NEW Patterns + the audit-shipped-state PATCH win).
- **The Reviews Analysis Table surfaces** (the build targets): `src/app/projects/[projectId]/competition-scraping/competitor-reviews-analysis/page.tsx` (where the rows render + where the drag handlers wire in) + the existing **`src/app/projects/[projectId]/competition-scraping/components/UrlTable.tsx`** (the canonical @dnd-kit dnd pattern to MIRROR for URL-row drag) + `src/lib/competition-scraping/handlers/reviews-reorder.ts` (the existing URL-detail-page `sortRank` reorder persistence — EXTEND it for `sortRankInReviewsTable` OR add a NEW endpoint; do NOT overload the existing `sortRank` which is the URL-detail-page order) + `prisma/schema.prisma` (the `CapturedReview.sortRankInReviewsTable Int?` column already shipped this session — CONFIRM it's present, no new migration).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - `feedback_plan_output_shape_before_building.md` — DIRECTLY relevant: plan the drag affordance + the persistence timing + how `sortRankInReviewsTable` is assigned + re-normalized WITH the director via a Rule 14f picker BEFORE writing code.
  - `feedback_default_to_recommendation.md` + `feedback_recommendation_style.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_browser_first_ai_with_server_migration.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31 (with the 2026-05-28-b mechanical read-guarantee + audit-shipped-state mandate sub-sections), the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; read §3 of each listed spec at session start — especially `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 "Fix Session C" items 8/9/10.** **This session is on `workflow-2-competition-scraping` — verify the branch first.**

**Session goal (a.113 / P-49 W5 Fix Session C "Deploy 2"):** the LAST remaining Reviews Analysis Table work — drag-to-reorder, on `workflow-2-competition-scraping`. TWO pieces per the spec doc §3 "Fix Session C" items 9 + 10: (a) drag-to-reorder URL (competitor) rows so a whole competitor moves with all its child review rows, persisted via the existing `CompetitorUrl.sortRank` (single source of truth across pages); (b) drag-to-reorder the review rows within a URL, persisted via the already-shipped `CapturedReview.sortRankInReviewsTable` column. Use @dnd-kit (already installed) and MIRROR the `UrlTable.tsx` dnd pattern. Sort the rendered rows by the rank fields. **Schema-change-in-flight = NO entry state** (the `sortRankInReviewsTable` column already shipped in Deploy 1). 0-1 Rule 9 deploy gates planned.

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline | wc -l
# Expected: 0 (workflow-2 even with main after the standard 3-push ping-pong sync)
```

If `git branch --show-current` shows `main`, run `./resume-workflow 2` (or `git checkout workflow-2-competition-scraping && git pull`) — this session is the W#2 Reviews Analysis Table work, NOT a `main`-track item.

**Phase 0 (audit-shipped-state + design the drag UX — per `feedback_plan_output_shape_before_building.md`, fire a Rule 14f picker BEFORE writing):**

- **Audit-shipped-state (Rule 31):** confirm the `CapturedReview.sortRankInReviewsTable Int?` column is present in `prisma/schema.prisma` (shipped Deploy 1) and that the Deploy 1 non-bulleted flow + Excel export + tooltips render correctly before adding drag (do not regress them).
- **Drag UX design picker:** the drag affordance (handle vs whole-row grab), persistence timing (on-drop vs debounced), and how `sortRankInReviewsTable` (review rows) + `CompetitorUrl.sortRank` (URL rows) are assigned + re-normalized after a reorder. Confirm whether review-row reorder is scoped strictly within a single URL group (it should be).

**Phase 1 (build):**

- URL-row drag: mirror `UrlTable.tsx` @dnd-kit pattern; persist via `CompetitorUrl.sortRank`; child review rows move with their parent.
- Review-row drag within a URL: persist via `CapturedReview.sortRankInReviewsTable`. EXTEND `reviews-reorder.ts` or add a NEW endpoint — do NOT overload the existing `sortRank` reorder (that is the URL-detail-page order).
- Sort the rendered rows by the rank fields (URL rows by `CompetitorUrl.sortRank`; review rows within a URL by `sortRankInReviewsTable`, falling back to capture order for NULL ranks).
- Test coverage: positive tests on the rank assignment/re-normalization helper(s) + the new persistence path; negative tests asserting the Deploy 1 non-bulleted flow + Excel export + the structured traceability table are unchanged.

**Phase 2 (deploy decision Rule 14f):** if Phase 1 lands + scoreboard-verifies, fire a deploy-now-vs-exit picker. If deploy fires, ff-merge to main + Vercel auto-redeploy + Phase 4 director real-Chrome verification on URL-row drag + review-row drag + persistence-on-refresh on vklf.com.

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (UNCHANGED)
- Extension tsc clean (UNCHANGED)
- Extension `npm test` = 910/910 (likely UNCHANGED — Deploy 2 is PLOS-side; confirm)
- src/lib `node:test` ≥ 1080 (entry 1080; expect +N for the rank assignment/re-normalization + persistence tests)
- `npm run build` = 68 routes (likely UNCHANGED unless a NEW reorder route is added for `sortRankInReviewsTable`; confirm — a new route is plausible here)
- Check 6 Playwright SKIPPED per Rule 27 (BUILD/DEPLOY session)

**Deploy mechanics:** 0-1 Rule 9 deploy gates planned. If deploy fires, expect the standard 3-push pattern per ff-merge (push + ff-merge to main + push main + ping-pong workflow-2) per `feedback_approval_scope_per_decision_unit.md`.

**Schema-change-in-flight flag:** **NO entry → NO exit** (the `CapturedReview.sortRankInReviewsTable` column already shipped in Deploy 1; Deploy 2 only consumes it).

**Group A docs to update at session end:** ROADMAP header bump + P-49 polish-backlog entry status update (Fix Session C "Deploy 2" ✅ DEPLOYED-AND-VERIFIED + deploy commit hash + Reviews Analysis Table page now CLOSED/fully §1-compliant) + CHAT_REGISTRY header bump (179th session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header + 1 NEW §Entry + HANDOFF_PROTOCOL header bump (likely header-bump-only — no new rule expected) + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite (likely Category page Block 1 planning, the next remaining P-49 item).

**Group B docs to update at session end:** `docs/REVIEWS_PHASE_2_DESIGN.md` NEW §B entry (TWENTIETH build/deploy-session entry; TWELFTH W5 entry). `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` (§3 Fix Session C items 9 + 10 ✅ DONE → Fix Session C fully CLOSED + Status updated to page-complete) + `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` (§3 pointer table — Reviews Analysis Table page CLOSED; Category + Type pages remaining).

**Standing carry-overs into this session:**

- **Opus 4.8 pricing numbers (P-52 carry-over)** — director may supply offline; not blocking for Deploy 2.
- **W#1 `AutoAnalyze.tsx` shared-list migration (P-52 carry-over)** — a future `main`-track tidy-up; not for this session.
- **Category page Sessions 1-3 + Type page Sessions 4-5** — STILL PENDING; resume after Deploy 2 closes the Reviews Analysis Table page.

---

## Alternate next-session candidates if director shifts priorities at session start

- **(a.113.alt1) P-49 W5 Reviews Analysis Table Fix Session C "Deploy 2" — drag-to-reorder** (current PICK — pre-loaded above). The only remaining Reviews Analysis Table work; on `workflow-2-competition-scraping`; Schema-change-in-flight NO (the column already shipped).
- **(a.113.alt2) P-49 W5 Category page Block 1 planning resume** (answer the 6 open questions from `docs/polish-item-specs/P-49-W5-S4-category-page.md` §4). Behind Deploy 2 but queued.
- **(a.113.alt3) Resolve the P-52 Opus 4.8 pricing carry-over + W#1 shared-list migration** (a small `main`-track follow-up, if the director supplies official pricing numbers and wants the W#1 cleanup done now).
- **(a.113.alt4) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`). Running tally ~31-33+; quick palate-cleanser.
- **(a.113.alt5) P-50 Condition Pathology card** (single-session — add a NEW card to two card-array files). Director already approved scope; quick palate-cleanser on `main`.
- **(a.113.alt6) P-51 per-Project competitive landscape AI summary** (per `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md` skeleton — build session opens with Q&A). Slotted AFTER P-49 closes, but available if director wants to start the Q&A early.
