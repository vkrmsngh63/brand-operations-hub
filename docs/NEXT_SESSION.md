# Next session

**Written:** 2026-05-29-b (`session_2026-05-29-b_p52-ai-model-registry-rule-32-opus-4-8-rollout` — W#2 + W#1 platform-wide polish P-52 — AI model registry doc + central model-selection methodology (NEW Rule 32) + Opus 4.8 rollout ✅ DEPLOYED-AND-VERIFIED 2026-05-29-b end-to-end on vklf.com on the `main` track (platform-wide; spans W#1 Keyword Clustering + W#2 Competition Scraping) — single build commit `5b9784a` (14 files +343/-31) ff-merged to main + ping-ponged to `workflow-2-competition-scraping` under ONE Rule 9 deploy gate. Director Phase 4 verbatim verdict: **"passed."** NEW reusable PATTERN: **"SDK-free constants module lets client components import shared constants without bundling the server SDK"**. **Closes (a.111) RECOMMENDED-NEXT.** **Opens (a.112) RECOMMENDED-NEXT = P-49 W5 Reviews Analysis Table Fix Session C** on `workflow-2-competition-scraping` — the only remaining Reviews Analysis Table work; carries the only remaining schema change (`CapturedReview.sortRankInReviewsTable Int?`).

> ⚠️ **DATE-STAMP DRIFT RESOLVED:** the director confirmed the real calendar date is **2026-05-29**. The prior 2026-05-30 / 05-31 / 05-31-b session stamps had drifted ~1-2 days ahead of the real calendar; this session corrected that by stamping the real date `2026-05-29-b` and logging the drift in CORRECTIONS_LOG §Entry 2026-05-29-b. In changelog ordering, this `2026-05-29-b` entry is the NEWEST even though its date is numerically lower than `2026-05-31-b` — that is expected. **Future sessions should TRUST the harness `currentDate`.**

> ⚠️ **BRANCH CHANGE: next session is on `workflow-2-competition-scraping`, NOT `main`.** (a.112) / Fix Session C is W#2-only Reviews Analysis Table work. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically. The prior (a.111) session ran on `main` because it was platform-wide; this one returns to the W#2 branch.

---

## What we did this session (in plain terms)

Today was a tidy-up-and-add-the-newest-model day, on the main code line because it touched both your tools.

We did three things:

1. **Made one master list of every place you pick an AI model.** PLOS now has a single document (`docs/AI_MODEL_REGISTRY.md`) that names every spot — across both the Keyword Clustering tool and the Competition Scraping tool — where someone chooses an AI model, plus where each model's price lives. So we always know where the model choices are.
2. **Added a rule that keeps that list honest.** A new process rule (Rule 32) says: any time we add a new "pick a model" feature in the future, it must be registered in that document. We also wired a small automatic checker that nudges us at the start of a session if it spots a model picker that isn't registered yet.
3. **Added the newest model, Opus 4.8, everywhere.** It's now selectable in every model dropdown across both tools, and it's in the pricing tables that estimate cost. While doing this we also cleaned up a quiet hazard: three of the review-summarize pop-ups each kept their own private copy of the model list; now they all read from ONE shared list, so adding a future model is a one-line change instead of three.

We did NOT change which model is the default (Competition Scraping still defaults to Opus 4.7; Keyword Clustering still defaults to Sonnet 4.6).

**Your verbatim Phase 4 verification verdict: "passed."**

**Numbers:**

- **SIX Rule 14f decisions with a (Recommended) marker — all chosen = 6/6 = 100% Yes-to-Recommended** (a 4-question design batch + the deploy gate + the verification-method pick). PLUS a 7th picker — the date-stamp resolution — that had no recommended marker (you chose the real-date option). Running cumulative across recent sessions: **121/124 = 97.6%**.
- **ONE Rule 9 deploy gate fired** (single build `5b9784a` — director "Deploy now").
- **~4 pushes total** (deploy push to main + ping-pong workflow-2 + the end-of-session doc-batch push + ping-pong).
- **Schema-change-in-flight = NO the entire session** (entry NO → exit NO). Model lists + pricing tables are code constants — no database migration, no data risk.
- **Post-merge /scoreboard all GREEN at NEW LOCKED baselines:** root tsc clean + extension tsc clean + extension `npm test` = 910/910 UNCHANGED + src/lib `node:test` = **1059/1059** (+6 from 1053 — 5 new `models.test.ts` cases + 1 new `pricing.test.ts` case) + `npm run build` = **68 routes UNCHANGED** (constants only; no new route); Check 6 Playwright SKIPPED per Rule 27.
- **NO extension zip this session** (no extension code changed — the browser extension has no model selection).

**TWO carry-overs are still OPEN** (you may resolve the first offline):

- **Official Opus 4.8 pricing numbers** — the cost estimator currently uses a placeholder (same as Opus 4.7) with a note to confirm. If you can send the official input / output / cache-read / cache-write per-million-tokens numbers, the estimates become exact.
- **Keyword Clustering shared-list cleanup** — Opus 4.8 was added directly into the Keyword Clustering tool's three spots this session (the safer change for a live tool). Migrating that tool to read from the same shared list is a future tidy-up.

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (the P-52 entry now ✅ DEPLOYED + the P-49 entry) + `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3/§4 + `docs/AI_MODEL_REGISTRY.md`.

- **(a.112) P-49 W5 Reviews Analysis Table Fix Session C** — NEXT SESSION; on `workflow-2-competition-scraping` (see below). The only remaining Reviews Analysis Table work; carries the only remaining schema change.
- **Category page Sessions 1-3 + Type page Sessions 4-5** (the 5-session corrective rebuild from 2026-05-28; specs `P-49-W5-S4-category-page.md` + `P-49-W5-S5-type-page.md`).
- **Opus 4.8 pricing numbers + W#1 shared-list migration** — the two P-52 carry-overs above.

## What we'll do next session (in plain terms)

Next session is **P-49 W5 Reviews Analysis Table Fix Session C** — the LAST remaining piece of work on the big competitor-reviews-analysis table. In plain terms:

1. **A new "plain prose" AI summary option per competitor.** Right now the per-competitor AI summary comes out as bullet points. Fix Session C adds a second flavor: a NEW non-bulleted, plain-paragraph summary flow, plus an "Auto-create" button to generate it.
2. **Export to Excel.** A button to export the whole table to a spreadsheet (the D-7 item).
3. **Drag-to-reorder the review rows.** Let you drag individual review rows up and down to set their order (the D-6 item). This is the one piece that needs a small database change — a new `sortRankInReviewsTable` number column on each captured review to remember the order.

Because of that new column, **the database-change flag is YES at the start of next session** (the only schema change left in the whole P-49 W5 arc).

## What's still left in the total roadmap (in plain terms)

- **P-52 (NEW) AI model registry + central model-selection methodology (Rule 32) + Opus 4.8 rollout** — ✅ DEPLOYED-AND-VERIFIED 2026-05-29-b on `main`. TWO carry-overs OPEN: official Opus 4.8 pricing numbers (director may supply offline) + the deferred W#1 shared-list migration.
- **P-49 W#2 Reviews Phase 2 (IN-FLIGHT — Fix Sessions A + B + D + FU-1 + FU-2 ✅ DEPLOYED; only Fix Session C + Category Sessions 1-3 + Type Sessions 4-5 remaining)** — Fix Session C is the only remaining Reviews Analysis Table work (non-bulleted prose AI flow + Excel export + drag-to-reorder + `CapturedReview.sortRankInReviewsTable` — the only remaining schema change); then the Category + Type page corrective rebuilds. Estimate ~6-7 more sessions until P-49 W5 closes.
- **P-50 NEW Condition Pathology card** — small single-session UI addition (one card insertion in two card-array files); director already approved scope; slot in any future session or do standalone on `main`.
- **P-51 NEW per-Project competitive landscape AI summary on `/comprehensive-analysis` page** — slot AFTER P-49 closes (per director directive: P-51 is BETWEEN P-49 and P-50 in next-priority order); spec doc skeleton in place; build session opens with Q&A.
- **P-48 Session 3 (Diagnostic #2 for screen-recording stutter)** — empirical instrumentation to determine why every SCREEN_RECORDING webm is captured at ~6-7 fps actual rate; deferred.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; running tally ~31-33+ (no notable new reproductions this session). Single-session fix.
- **P-26 below-fold scroll capture bugs** + **P-27 capture bugs #9 + #15** — LOW priority; re-evaluate after P-49 closes.
- **W#2 graduation** — deferred until P-49 closes at the workstream-by-workstream level.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started.
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load (Fix Session D's FF1 surfaced transient connection-pool saturation under heavy AI runs; the autosave-retry helper papers over it client-side — a future infra-side look at pool sizing may be warranted if 500s recur) + Supabase file-size offline check.

---

## Status of last session

**P-52 AI model registry doc + central model-selection methodology (NEW Rule 32) + Opus 4.8 rollout ✅ DEPLOYED-AND-VERIFIED 2026-05-29-b** end-to-end on vklf.com on the `main` track (platform-wide; spans W#1 + W#2). DEPLOY session: ONE Rule 9 deploy gate fired on the single build `5b9784a`. Director Phase 4 verbatim verdict: "passed."

**Session shape (DEPLOY — 1 work commit + end-of-session doc-batch + 1 ff-merge + ping-pong sync):**

- 1 work commit: `5b9784a` (14 files +343/-31). NEW files: `.claude/hooks/check-model-registry-drift.sh` + `docs/AI_MODEL_REGISTRY.md` + `docs/polish-item-specs/P-52-ai-model-registry.md` + `src/lib/competition-scraping/review-analysis/models.ts` + `models.test.ts`. MODIFIED: `.claude/settings.json` + `docs/HANDOFF_PROTOCOL.md` (Rule 32) + the 3 W#2 summarize modals (now import `models.ts`) + W#1 `AutoAnalyze.tsx` (Opus 4.8 inline) + `client.ts` (re-exports `models.ts`) + `pricing.ts` + `pricing.test.ts`.
- 1 PENDING: end-of-session doc-batch commit (this doc-batch agent's output) — carries the Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + HANDOFF_PROTOCOL header bump + CLAUDE_CODE_STARTER + this NEXT_SESSION) + the NEW `docs/AI_MODEL_REGISTRY.md` registration + 1 Group B doc (REVIEWS_PHASE_2_DESIGN.md §B 2026-05-29-b).

**SIX Rule 14f decisions with explicit (Recommended) markers — all chosen = 6/6 = 100% Yes-to-Recommended** (Phase 1 design batch [4 questions] + deploy gate [1] + Rule 27 verify-method [1]); PLUS a 7th picker (date-stamp resolution) with no recommended marker (director chose the real-date option). Running cumulative = **121/124 = 97.6% Yes-to-Recommended**.

**ONE Rule 9 deploy gate fired this session.**

**Schema-change-in-flight flag NO entire session (entry NO → exit NO)** — model lists + pricing tables are code constants; zero migration, zero data risk.

**ZERO DEFERRED items at session end (Rule 26)** — TaskList clean.

**Baselines locked from this session:** root tsc clean + extension tsc clean + extension `npm test` = **910/910 UNCHANGED** + src/lib `node:test` = **1059/1059** (+6 from 1053 entry) + `npm run build` = **68 routes UNCHANGED**.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-29-b** capturing: (1) DATE-STAMP DRIFT RESOLVED (real date confirmed 2026-05-29); (2) NEW reusable PATTERN — "SDK-free constants module lets client components import shared constants without bundling the server SDK"; (3) NEW Rule 32 + the auto-detect SessionStart hook shipped; (4) P-43 cwd-leak running tally ~31-33+ (no notable new reproductions). NO new memory file.

**NEW §B 2026-05-29-b entry appended to `docs/REVIEWS_PHASE_2_DESIGN.md`** (EIGHTEENTH build/deploy-session §B entry per Rule 18; TENTH W5 entry — Opus 4.8 added to the §A.7 Opus-only menu as an additive supersedence note + the 3 W#2 modals refactored to import the central list).

**NEW Group A doc `docs/AI_MODEL_REGISTRY.md` created + registered** in DOCUMENT_MANIFEST. **NEW spec doc `docs/polish-item-specs/P-52-ai-model-registry.md`** (Rule 31). **NEW HANDOFF_PROTOCOL Rule 32** added inline (in the build commit; recorded in the header bump).

**ROADMAP P-52 entry flipped to ✅ DEPLOYED-AND-VERIFIED 2026-05-29-b (build `5b9784a`)** with the spec-doc cross-reference added to its Where field per Rule 31 step 3.

**FIFTY-FIFTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. (a.112) / Fix Session C is W#2-only Reviews Analysis Table work. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch lands + the standard 3-push ping-pong sync fires): `main` and `workflow-2-competition-scraping` both at the post-doc-batch SHA after ff-merge. Verify with `git status` showing a clean working tree (apart from historical untracked .zip + .html artifacts at repo root) and `git log origin/main..HEAD --oneline | wc -l` = 0.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files since this NEXT_SESSION.md references P-43 + P-49 + P-50 + P-51 + P-52; read §3 of each at session start):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate) + **Rule 32 (NEW this session — Model-selection registry; relevant only if Fix Session C touches a model picker, which it should NOT)** + Rule 14f (forced-picker mechanics — expect a Q8 flow-naming pick at session start, a design picker on the non-bulleted flow shape, a deploy picker) + Rule 9 (deploy gate) + Rule 8/29 (the `prisma db push` for the new column is a schema op — affirm backups/intactness) + Rule 18 + Rule 23 (Change Impact Audit — additive nullable column; zero data loss) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + §4 Step 4b extended template.
- **`docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 "Fix Session C" sub-section** (THE source-of-truth for this session — non-bulleted flow + Auto-create button + Excel export D-7 + drag-to-reorder D-6 + the `CapturedReview.sortRankInReviewsTable Int?` column + Q8 flow-naming) + §4 (open questions).
- `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §3 (pointer table — Reviews Analysis Table page now "Fix A + B + D + FU-1 + FU-2 ✅ DEPLOYED-AND-VERIFIED; Fix Session C remaining").
- `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-31-b (the FU-1 + FU-2 entry — the structured-analysis shape + the editable traceability box Fix Session C must not regress) + §B 2026-05-29-b (this session — the central `models.ts` list; do NOT re-duplicate it if Fix Session C adds a flow).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-29-b (this session's informational entry — the date-stamp resolution + the SDK-free-constants Pattern).
- **The Reviews Analysis Table surfaces** (the build targets): `src/app/projects/[projectId]/competition-scraping/competitor-reviews-analysis/page.tsx` + its `components/` (the 3 summarize modals + the table rows) + `src/lib/competition-scraping/review-analysis/prompts.ts` (the per-competitor flow — add the NEW non-bulleted prose flow alongside the existing bulleted v4) + `src/lib/competition-scraping/handlers/review-analysis-run-batch.ts` + `prisma/schema.prisma` (add `CapturedReview.sortRankInReviewsTable Int?`).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - `feedback_plan_output_shape_before_building.md` — DIRECTLY relevant: plan the non-bulleted prose flow's output shape (sections / length / tone) + the Excel export columns + the drag-reorder UX WITH the director via a Rule 14f picker BEFORE writing prompts/code.
  - `feedback_browser_first_ai_with_server_migration.md` + `feedback_default_to_recommendation.md` + `feedback_recommendation_style.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md` + `feedback_playwright_for_repeatable_walkthroughs.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31 (with the 2026-05-28-b mechanical read-guarantee + audit-shipped-state mandate sub-sections), the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; read §3 of each listed spec at session start — especially `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 "Fix Session C".** **This session is on `workflow-2-competition-scraping` — verify the branch first.**

**Session goal (a.112 / P-49 W5 Fix Session C):** the LAST remaining Reviews Analysis Table work, on `workflow-2-competition-scraping`. FOUR pieces per the spec doc §3 "Fix Session C": (a) NEW per-competitor NON-bulleted prose AI flow (a plain-paragraph alternative to the existing bulleted v4 structured flow); (b) an "Auto-create non-bulleted" button to run it; (c) Excel export of the table (D-7); (d) drag-to-reorder the review rows (D-6), backed by a NEW `CapturedReview.sortRankInReviewsTable Int?` schema column. **Resolve Q8 (the flow-value naming convention) at session start.** **Schema-change-in-flight = YES entry state** (the `sortRankInReviewsTable` column is the only remaining schema change in the P-49 W5 arc). 1-2 Rule 9 deploy gates planned.

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

**Phase 0 (resolve Q8 + design the output shape — per `feedback_plan_output_shape_before_building.md`, fire a Rule 14f picker BEFORE writing):**

- **Q8 flow-naming:** decide the flow-value naming convention for the new non-bulleted prose flow (how it's stored/keyed alongside the existing bulleted flow).
- **Non-bulleted prose flow output shape:** sections / length range / tone / whether it cites source reviews like the bulleted flow does.
- **Excel export:** which columns, sheet layout, file naming.
- **Drag-reorder UX:** drag affordance, persistence timing, how `sortRankInReviewsTable` is assigned + re-normalized.

**Phase 1 (schema):** add `CapturedReview.sortRankInReviewsTable Int?` (additive, nullable, zero data loss) via `npx prisma db push` (affirm Rule 8/29 backup posture before running). FLIP Schema-change-in-flight YES → NO at the first deploy push.

**Phase 2 (build):**

- Add the NEW non-bulleted prose flow to `prompts.ts` (alongside the existing bulleted v4 — do NOT remove the bulleted flow) + the Auto-create button + modal wiring.
- Excel export (D-7) of the table.
- Drag-to-reorder review rows (D-6) writing `sortRankInReviewsTable`.
- Test coverage: positive tests on the new prompt builder + the sort-rank assignment/normalization + the Excel column mapper; negative tests asserting the existing bulleted flow + structured traceability table are unchanged.

**Phase 3 (deploy decision Rule 14f):** if Phase 2 lands + scoreboard-verifies, fire a deploy-now-vs-exit picker. If deploy fires, ff-merge to main + Vercel auto-redeploy + Phase 4 director real-Chrome verification on the new prose flow + Auto-create button + Excel export + drag-reorder persistence on vklf.com.

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (UNCHANGED)
- Extension tsc clean (UNCHANGED)
- Extension `npm test` = 910/910 (likely UNCHANGED — Fix Session C is PLOS-side; confirm)
- src/lib `node:test` ≥ 1059 (entry 1059; expect +N for the new prompt builder + sort-rank + Excel-mapper tests)
- `npm run build` = 68 routes (likely UNCHANGED unless a new export route is added; confirm)
- Check 6 Playwright SKIPPED per Rule 27 (BUILD/DEPLOY session)

**Deploy mechanics:** 1-2 Rule 9 deploy gates planned. If deploy fires, expect the standard 3-push pattern per ff-merge (push + ff-merge to main + push main + ping-pong workflow-2) per `feedback_approval_scope_per_decision_unit.md`.

**Schema-change-in-flight flag:** **YES entry → flips to NO at the first deploy push** (the `CapturedReview.sortRankInReviewsTable` column).

**Group A docs to update at session end:** ROADMAP header bump + P-49 polish-backlog entry status update (Fix Session C ✅ DEPLOYED-AND-VERIFIED + deploy commit hash + Schema-change-in-flight YES→NO note) + CHAT_REGISTRY header bump (178th session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header + 1 NEW §Entry + HANDOFF_PROTOCOL header bump (likely header-bump-only — no new rule expected) + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite (likely Category page Block 1, the next remaining P-49 item).

**Group B docs to update at session end:** `docs/REVIEWS_PHASE_2_DESIGN.md` NEW §B entry (NINETEENTH build/deploy-session entry; ELEVENTH W5 entry). `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` (§3 Fix Session C ✅ DONE + Q8 RESOLVED + Status updated) + `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` (§3 pointer table — Reviews Analysis Table page CLOSED; Category + Type pages remaining).

**Standing carry-overs into this session:**

- **Opus 4.8 pricing numbers (P-52 carry-over)** — director may supply offline; not blocking for Fix Session C.
- **W#1 `AutoAnalyze.tsx` shared-list migration (P-52 carry-over)** — a future `main`-track tidy-up; not for this session.
- **Category page Sessions 1-3 + Type page Sessions 4-5** — STILL PENDING; resume after Fix Session C closes the Reviews Analysis Table page.

---

## Alternate next-session candidates if director shifts priorities at session start

- **(a.112.alt1) P-49 W5 Reviews Analysis Table Fix Session C** (current PICK — pre-loaded above). The only remaining Reviews Analysis Table work; on `workflow-2-competition-scraping`; carries the only remaining schema change (`CapturedReview.sortRankInReviewsTable`).
- **(a.112.alt2) P-49 W5 Category page Block 1 planning resume** (answer the 6 open questions from `docs/polish-item-specs/P-49-W5-S4-category-page.md` §4). Behind Fix Session C but queued.
- **(a.112.alt3) Resolve the P-52 Opus 4.8 pricing carry-over + W#1 shared-list migration** (a small `main`-track follow-up to this session, if the director supplies official pricing numbers and wants the W#1 cleanup done now).
- **(a.112.alt4) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`). Running tally ~31-33+; quick palate-cleanser.
- **(a.112.alt5) P-50 Condition Pathology card** (single-session — add a NEW card to two card-array files). Director already approved scope; quick palate-cleanser on `main`.
- **(a.112.alt6) P-51 per-Project competitive landscape AI summary** (per `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md` skeleton — build session opens with Q&A). Slotted AFTER P-49 closes, but available if director wants to start the Q&A early.
