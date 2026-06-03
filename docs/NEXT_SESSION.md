# Next session

**Written:** 2026-06-03-f (`session_2026-06-03-f_p63-phase-1-central-ai-registry-consumed-everywhere` — **P-63 Phase 1 — the central AI-model registry is now FULLY CONSUMED platform-wide AND DEPLOYED-AND-VERIFIED across THREE clean deploys** (and the Phase 0 foundation HELD from `-e` shipped with Deploy 1, so nothing is held back this time). Plumbing only — ZERO visible change on every surface; each deploy director-verified PASS on real Chrome (vklf.com). **Deploy 1 (`256306b`, main `a107e42→256306b`):** dependency inversion — the model list + pricing/cost-math physically MOVED into `src/lib/ai-models/{models,pricing}.ts` (the canonical home) with back-compat re-export shims at the old W#2 paths; this ff-merge ALSO carried the held P-63 Phase 0 `6c6959c` + the `-e` doc-batch `27fef33` to main (held Phase 0 now deployed). **Deploy 2 (`474ac4b`, main `256306b→474ac4b`):** all SEVEN W#2 review-analysis modals (PerReview / PerCompetitor[+NonBulleted] / GlobalCompetitor[+NonBulleted] / Category / Type) render their model `<option>`s via `getModelsForMenu('review-analysis')` — identical DOM (spec said "6 modals" → corrected to 7; `TypeAiRunModal` was missing from the §2 consumers table). **Deploy 3 (`8d4099e`, main `474ac4b→8d4099e`):** W#1 `AutoAnalyze.tsx` migrated to the registry (LAST hardcoded model list gone) via `getModelsForMenu('keyword-clustering')`; inline `AA_PRICING` → `aaPrice()` off site #4 `MODEL_PRICING`; thinking routed through `anthropicAdapter.mapThinkingOption` (byte-identical request body). **KEY Phase-1 design addition = a per-record `menus` tag + a `getModelsForMenu(menu)` accessor** (one registry → many menus without leakage). **NEW `docs/AI_MODEL_REGISTRY_PRIMER.md` shipped** (the director-requested add/remove/edit-a-model + integrate-a-company catch-up guide). **Closes (a.136) (P-63 Phase 1 ✅ DEPLOYED-AND-VERIFIED — Phase 1 CLOSED). Opens (a.137) RECOMMENDED-NEXT = P-63 Phase 2** on `workflow-2-competition-scraping`. **The next session RUNS ON `workflow-2-competition-scraping`; the start command is `./catch-up-workflow 2`** (the dedicated graduated-W#2 re-entry — this is what the director will paste). **FIRST action next session = read `docs/polish-item-specs/P-63-*.md` §7 (Phase 2) + `docs/AI_MODEL_REGISTRY_PRIMER.md` + `docs/AI_MODEL_REGISTRY.md`, THEN plan the admin-screen output shape + confirm D1 (DB storage) + D4 (admin-page placement) WITH the director via a Rule 14f picker BEFORE coding.** §4 Step 1c forced-picker fired this session → P-63 Phase 2 is the director's pick. FIVE Rule 14f pickers fired this session (the deploy-pacing picker → "Cautious — 3 deploys"; the three Rule 9 deploy gates → all "Yes — deploy to main"; the §4 Step 1c next-pick → P-63 Phase 2).)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This session is `session_2026-06-03-f` — the SIXTH session of 2026-06-03 (suffix `-f`); the FIRST was `session_2026-06-03` (no suffix) = P-61, the SECOND `-b` = W#2 graduation, the THIRD `-c` = W#1 Rule-33 backfill, the FOURTH `-d` = P-43 subshell cwd fix, the FIFTH `-e` = P-50 + P-63 Phase 0. The harness `currentDate` = 2026-06-03. **Next session: keep trusting the harness `currentDate`; do NOT regress or invent a suffix ahead of it.** The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session.

> ⚠️ **BRANCH: next session runs on `workflow-2-competition-scraping`.** The (a.137) pick is P-63 Phase 2; P-63 is platform-wide but is being developed on `workflow-2-competition-scraping`, so Phase 2 continues there. **Start command: `./catch-up-workflow 2`** (the dedicated Rule 33 graduated-W#2 re-entry — switches to `workflow-2-competition-scraping` + prints `docs/COMPETITION_SCRAPING_PRIMER.md`). This session ALSO ran on `workflow-2-competition-scraping`, so this is NOT a branch change — confirm `git branch --show-current` shows `workflow-2-competition-scraping` immediately after entry.

> ⚠️ **BRANCH STATE — NOTHING IS HELD THIS TIME. BOTH BRANCHES ARE AT `8d4099e`.** Unlike last session (which held Phase 0 ahead of main), Phase 1 is FULLY DEPLOYED across three in-session ff-merges to `main` — so at next-session entry, **`main` and `workflow-2-competition-scraping` are BOTH at `8d4099e`** (after this end-of-session doc-batch ff-merges to main, both will be at the doc-batch SHA). **Expect `git log origin/main..HEAD --oneline` to be EMPTY at entry** (nothing held; this is the normal graduated-workflow steady state). If it is NOT empty, something did not ff-merge as expected — investigate before coding.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry, but FLIPS YES once Phase 2 coding starts.** This session: NO → STAYED NO → NO at exit (Phase 1 is pure plumbing — pickers + adapter routing + file moves with re-export shims; nothing touched the DB). **P-63 Phase 2 is the schema-touching phase** — it adds an ADDITIVE Prisma model for DB-backed registry storage behind the SAME registry accessors. **The flag flips YES the moment Phase 2 schema work begins.** Run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (never `migrate reset` against prod). The schema is ADDITIVE only — no column drops, no destructive migration.

> ⚠️ **NO OWED DEPLOY, NO OWED VERIFICATION carried in.** Phase 1 was deployed across three deploys, each director-verified PASS on real Chrome (Deploy 3 incl. a live test analysis run). Nothing is held back; there is no stranded commit and no unverified surface carried into next session.

> ⚠️ **W#2 IS GRADUATED — P-63 is a platform-wide item that rides on the W#2 branch, NOT a reopening.** W#2 (Competition Scraping) is ✅ GRADUATED 2026-06-03 (continuity-first). P-63 is a PLATFORM-WIDE AI-model-registry consolidation (it touches W#2 pickers AND W#1's `AutoAnalyze.tsx`) that happens to be developed on `workflow-2-competition-scraping`. Building it does NOT un-graduate W#2. The deferred W#2 Archive/Data-Contract split + finalized-HRL Data Capture Interview stay intentionally held until W#3 needs to read W#2 data — do NOT author them now.

> ⚠️ **PLAN THE ADMIN-SCREEN SHAPE WITH THE DIRECTOR BEFORE CODING (per `feedback_plan_output_shape_before_building`).** Phase 2 is the self-serve browser "AI Models" admin screen — a real user-facing UI surface. The output shape (sections, fields, placement, the integration-pending popover) MUST be planned WITH the director via a Rule 14f picker before any coding, AND the two deferred design decisions confirmed: **D1** (DB storage — recommend DB-backed for true self-serve runtime add/remove) + **D4** (admin-page placement — working assumption: a global platform-level "AI Models" admin page). "Ship v1 and iterate" ≠ unilateral design.

---

## What we did this session (in plain terms)

This session connected the new central "list of AI models" to everything that picks a model — and shipped it live, three careful steps in a row, with you checking each one on the real site.

**The big picture.** Last session we built a brand-new, hidden "one place that holds every AI model" (the model, its company, its thinking options, its pricing) — but nothing used it yet. This session we made everything actually use it, and switched it on. After this session, EVERY model picker in the whole platform — both the Keyword Clustering "Auto-Analyze" picker and all seven of the Competition Scraping review-analysis pop-ups — reads its model list from that one central place. There are no more scattered, hardcoded model lists anywhere.

**It was plumbing only — nothing looks or behaves any differently.** The pickers show the exact same models, in the same order, with the same default, and the AI runs exactly as before. This was deliberate: we moved the wiring without changing the behavior, and proved it with the test scoreboard staying green at every step. You verified all three steps on real Chrome and said "PASS" each time (the last one included a real test analysis run).

**We did it in three careful deploys instead of one big one** — you chose the cautious pace. Step 1 moved the master list into its new home (leaving tiny "forwarding" files at the old locations so nothing else broke). Step 2 pointed all seven Competition Scraping pop-ups at the central list. Step 3 pointed the Keyword Clustering picker at it too — the last hardcoded list, now gone.

**One neat safety idea we added:** each model now carries a small "which menus is this allowed to appear in" tag. The three Opus models are allowed in BOTH the Competition pop-ups and the Keyword Clustering picker; the other models (Sonnet, Haiku, an older Opus) are tagged for Keyword Clustering only. So the wider Keyword Clustering menu can never accidentally leak into the Competition pop-ups, which are meant to be Opus-only.

**We also wrote the catch-up guide you asked for** — a new document (`docs/AI_MODEL_REGISTRY_PRIMER.md`) that explains, in plain steps, how to add / remove / edit a model and how to bring on a whole new AI company. It even has a one-line command you can paste to have Claude walk you through it.

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` + `docs/COMPETITION_SCRAPING_PRIMER.md` §5 (the W#2 residue table) + `docs/polish-item-specs/P-63-*.md` + `docs/AI_MODEL_REGISTRY_PRIMER.md` + `docs/AI_MODEL_REGISTRY.md` + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (the W#1 live backlog) + `docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md` + `docs/DATA_CATALOG.md` §6.1 (the deferred W#2 Data Contract).

- **(a.137) = P-63 Phase 2** — **NEXT SESSION (see below).** The self-serve browser "AI Models" admin screen + DB-backed storage + the integration-pending popover. On `workflow-2-competition-scraping`.
- **P-63 Phase 1 — ✅ DONE 2026-06-03-f.** The central registry is fully consumed + deployed; the held Phase 0 shipped with it.
- **P-50 — ✅ DONE 2026-06-03-e** + **P-56 Option-2 — ✅ CLOSED (won't-do) 2026-06-03-e** + **P-43 — ✅ RESOLVED 2026-06-03-d.**
- **Remaining W#2 residue items** — P-53 (Export Table on the Category + Type pages — largely absorbed by P-55), P-26 / P-27 (capture bugs). All LOW/non-blocking; the director picks the order after P-63.
- **The deferred W#2 Archive/Data-Contract split + finalized-HRL Data Capture Interview** — held until W#3 starts and needs to read W#2 data. NOT a blocker.
- **W#1's live polish backlog** — HIGH H-1 (action history + per-action undo) is the queued-next W#1 item; plus M-1/M-2/M-3 medium, L-1..L-5 low, C-1..C-7 carry-overs, Z-1 explicitly-last, P-1 passive prereq. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`. On `main`. (W#1's `AutoAnalyze.tsx` picker was migrated to the registry by P-63 Phase 1 — separate from this backlog.)
- **(P-62, under Workflow 11)** "Post Launch Optimization & Surveillance" card + page — future-workflow, NOT a W#2 residue item.

## What we'll do next session (in plain terms)

1. **We build the self-serve "AI Models" screen you asked for** — a real page where you can add / remove / edit an AI model (its company, thinking options, pricing) yourself, and have it show up everywhere automatically. First we'll plan exactly what that screen looks like, together, before writing any code.
2. **We start saving the models in the database** so your add/remove changes stick (right now the list lives in code). This is the part that touches the database — we'll do it carefully, additively (only adding, never deleting), and only after you explicitly approve.
3. **We add the "integration pending" pop-up** — if you add a model from a company we haven't connected yet, the screen will tell you the exact instruction to give Claude to get it wired up and running.
4. **It follows the normal routine** — plan-with-you, build, run the test scoreboard, deploy to vklf.com, you verify on real Chrome.

## What's still left in the total roadmap (in plain terms)

- **P-63 (central AI-model registry) Phase 2 — NEXT, the (a.137) pick.** The self-serve add/remove screen + database storage + the integration-pending pop-up. On `workflow-2-competition-scraping`. (Phase 0 + Phase 1 are done + live.)
- **P-63 Phase 1 — ✅ DONE 2026-06-03-f.** Live + verified.
- **P-50 (Condition Pathology card) — ✅ DONE 2026-06-03-e.**
- **P-56 Option-2 — ✅ CLOSED (won't-do) 2026-06-03-e.**
- **P-43 (the internal cwd-leak fix) — ✅ DONE 2026-06-03-d.**
- **Other W#2 residue items** — P-53, P-26 / P-27. Low-priority; the director picks the order.
- **W#2 graduation — ✅ DONE 2026-06-03 (continuity-first).** Re-entry via the primer + `./catch-up-workflow 2`.
- **W#1 (Keyword Clustering) Rule-33 backfill — ✅ DONE 2026-06-03-c.** On `main`.
- **The deferred W#2 Data Contract** — held until W#3 needs to read W#2 data; NOT a blocker.
- **W#1's live polish backlog** — HIGH H-1 (action history + undo) queued; canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`. On `main`.
- **P-52 (AI model registry + Rule 32 + Opus 4.8 rollout)** — ✅ DEPLOYED-AND-VERIFIED; its TWO carry-overs (Opus 4.8 pricing + the W#1 `AutoAnalyze.tsx` migration) are now ABSORBED + DELIVERED by P-63 Phase 1.
- **P-61 / P-54 / P-55 / P-56 / P-57 / P-58 / P-59 / P-60 — ✅ ALL CLOSED.** The full W#2 polish queue is drained.
- **P-62 (NEW capture)** — the Workflow-11 surveillance card + page. Future-workflow.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started. W#3 kickoff is also the trigger to author the deferred W#2 Data Contract.
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**P-63 Phase 1 ✅ DEPLOYED-AND-VERIFIED — 2026-06-03-f.** THREE clean deploys, each director-verified PASS on real Chrome (vklf.com). The central AI-model registry is now FULLY CONSUMED platform-wide (all 7 W#2 review-analysis modals + W#1 `AutoAnalyze.tsx`) and the held Phase 0 from `-e` shipped with Deploy 1. Both branches now at `8d4099e`.

**Session shape (a cautious 3-deploy, migrate-one-surface-at-a-time-with-the-scoreboard-green-between-each plumbing session):**

- **Deploy 1 (`256306b`, main `a107e42→256306b`):** dependency inversion — the model list + pricing/cost-math physically MOVED into `src/lib/ai-models/models.ts` + `ai-models/pricing.ts` (the canonical home); the old W#2 paths `competition-scraping/review-analysis/{models,pricing}.ts` became back-compat re-export shims so every existing importer keeps working unchanged. This ff-merge ALSO carried the held P-63 Phase 0 commit `6c6959c` + the `-e` doc-batch `27fef33` to main (the held Phase 0 is now deployed). Director PASS.
- **Deploy 2 (`474ac4b`, main `256306b→474ac4b`):** all SEVEN W#2 review-analysis modals (PerReview / PerCompetitor[+NonBulleted] / GlobalCompetitor[+NonBulleted] / Category / Type run-modals) now render their model `<option>` list from the registry via `getModelsForMenu('review-analysis')` instead of mapping `SUPPORTED_MODEL_VERSIONS`; raw-id labels preserved → identical DOM. NOTE: the spec said "6 modals" but there are 7 — `TypeAiRunModal` was missing from the AI_MODEL_REGISTRY §2 consumers table; corrected this session. Director PASS.
- **Deploy 3 (`8d4099e`, main `474ac4b→8d4099e`):** W#1 Keyword Clustering `AutoAnalyze.tsx` migrated to the registry — the LAST hardcoded model list is gone. Model `<select>` → `getModelsForMenu('keyword-clustering')` (friendly `displayLabel`s, 6 models, Sonnet 4.6 default preserved); inline `AA_PRICING` removed → `aaPrice()` projects input/output from site #4 `MODEL_PRICING`; thinking request param routed through `anthropicAdapter.mapThinkingOption` (adaptive→auto / enabled→extended / disabled→none — byte-identical request body, temperature logic preserved). Director PASS (incl. a live test analysis run).
- **KEY Phase-1 design addition:** a per-record `menus` tag (`AiPickerMenuId = 'review-analysis' | 'keyword-clustering'`) on every `AiModelRecord` + a `getModelsForMenu(menu)` accessor. The 3 Opus models (4.8/4.7/4.6) are tagged for BOTH menus; Sonnet 4.6 / Opus 4.5 / Haiku 4.5 are tagged `keyword-clustering`-only — so W#1's wider menu can never leak into W#2's Opus-only modals. Opus `thinkingOptions` reconciled to `['none','auto','extended']`.
- **Director's requested deliverable shipped:** NEW `docs/AI_MODEL_REGISTRY_PRIMER.md` — the catch-up guide for add/remove/edit a model + integrate a new company, with the one-line pointer command.
- **1 PENDING:** the end-of-session doc-batch commit (this doc-batch agent's output) — the Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY) + HANDOFF_PROTOCOL header bump + the Group B updates (the P-63 spec + the COMPETITION_SCRAPING_PRIMER §5 flip + the VERIFICATION_BACKLOG note + the NEW primer). **This doc-batch ff-merges normally to `main` (nothing is held back after Phase 1). The three deploy pushes + 3 ping-pong syncs were done in-session under their own Rule 9 gates; this doc-batch is the 4th push + ping-pong.**

**Schema-change-in-flight flag NO at entry → STAYED NO entire session → NO at exit. NEXT session (P-63 Phase 2) = NO at entry, FLIPS YES once Phase 2 schema coding starts** (the additive Prisma model for DB-backed storage).

**FIVE Rule 14f pickers fired this session:** (1) the deploy-pacing picker → "Cautious — 3 deploys"; (2/3/4) the three Rule 9 deploy gates (all "Yes — deploy to main"); (5) the §4 Step 1c next-pick → P-63 Phase 2.

**ZERO open DEFERRED items at exit (Rule 26):** TaskList returned EMPTY at entry; zero in-session TaskList tasks created; ZERO open DEFERRED at exit. The other W#2 residue items + the deferred W#2 Data Contract + P-62 + the W#1 live backlog are documented roadmap continuation, NOT TaskList DEFERRED items.

**EXIT baselines locked (verified post-deploy):** root tsc clean (UNCHANGED) + extension tsc clean (UNCHANGED) + extension `npm test` = **915/915 UNCHANGED** + src/lib `node:test` = **1387** (+3 over 1384 — Deploy 2 +2 menu-accessor tests, Deploy 3 +1 W#1-menu-tagging test) + `npm run build` = **74 routes UNCHANGED** (no new route); Check 6 Playwright SKIPPED per Rule 27 for all 3 deploys (Deploy 1 = pure module relocation; Deploy 2 = render-wiring producing byte-identical DOM; Deploy 3 = faithful refactor — no Playwright spec covers these surfaces; verified by tsc + node:test + director real-Chrome).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-06-03-f** (NO top-tier slip — a clean 3-deploy plumbing session) capturing the reusable patterns: (a) the per-record `menus`-tag mechanism that lets ONE registry back surfaces with different model menus without leakage; (b) the dependency-inversion-via-shims pattern; (c) adapter-routing-as-faithful-refactor (byte-identical request body); (d) the migrate-one-surface-at-a-time-with-scoreboard-green-between-each discipline; (e) the spec "6 modals" vs actual 7 (`TypeAiRunModal`) count correction. **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** **NO new memory file this session.**

**Group B docs updated** — `docs/polish-item-specs/P-63-central-ai-model-registry-self-serve.md` (Status + §6/§7 flipped to "Phase 1 ✅ DEPLOYED-AND-VERIFIED 2026-06-03-f (3 deploys); Phase 2 next" + the as-built Phase 1 recorded: the `menus` tag + `getModelsForMenu` + the 7-not-6 modal count + the W#1 migration + the primer shipped) + `docs/COMPETITION_SCRAPING_PRIMER.md` §5 (the P-63 row → Phase 1 DEPLOYED, Phase 2 the new active item) + `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` (a brief platform-deploy note — the 7 W#2 modals were repointed, zero behavior change, director PASS) + NEW `docs/AI_MODEL_REGISTRY_PRIMER.md`. `docs/COMPETITION_SCRAPING_DESIGN.md` UNCHANGED (NO §B entry — Phase 1 is a platform-wide registry plumbing change, not a W#2 product-design choice; P-63's design record is its spec). `docs/REVIEWS_PHASE_2_DESIGN.md` / `docs/COMPETITION_DATA_V2_DESIGN.md` UNCHANGED.

**EIGHTIETH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ZERO destructive ops. NO `prisma db push`, NO `migrate reset`, NO drop, NO dev-data deletes, NO schema change. THREE in-session deploys (`256306b` / `474ac4b` / `8d4099e` — all additive plumbing), each ff-merged to `main` under its own Rule 9 deploy gate (a normal deploy, not destructive). NO new memory file created; zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session).
- **NEXT session (P-63 Phase 2):** Phase 2 IS the schema-touching phase — it adds an ADDITIVE Prisma model for DB-backed registry storage behind the SAME registry accessors. The schema-change-in-flight flag flips YES once Phase 2 schema work starts. The schema is ADDITIVE only (no column drops, no destructive migration). Run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (never `migrate reset` against prod). No other Rule 8/9/29 triggers anticipated.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the W#2 continuity primer `docs/COMPETITION_SCRAPING_PRIMER.md` + the W#1 continuity primer `docs/KEYWORD_CLUSTERING_PRIMER.md` + the `src/lib/ai-models/` module (now the canonical home for `models.ts` + `pricing.ts`) + the P-63 spec + `docs/AI_MODEL_REGISTRY.md` + the NEW `docs/AI_MODEL_REGISTRY_PRIMER.md` + the memory directory + the `./catch-up-workflow` + `./resume-workflow` scripts.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. The (a.137) pick is P-63 Phase 2; P-63 is being developed on `workflow-2-competition-scraping`, so Phase 2 continues there. **Start command: `./catch-up-workflow 2`** (the dedicated Rule 33 graduated-W#2 re-entry — switches to `workflow-2-competition-scraping` + prints `docs/COMPETITION_SCRAPING_PRIMER.md`). This session ALSO ran on `workflow-2-competition-scraping`, so this is NOT a branch change. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch ff-merges to `main`): **`main` and `workflow-2-competition-scraping` are BOTH at the doc-batch SHA (both were at `8d4099e` after Deploy 3; the doc-batch ff-merges normally — nothing is held back).** **Verify with `git log origin/main..HEAD --oneline` showing EMPTY** (the normal graduated-workflow steady state — UNLIKE last session, which held Phase 0 ahead of main). `git status` clean apart from historical untracked .zip + .html artifacts at repo root. If `git log origin/main..HEAD` is NOT empty at entry, something did not ff-merge as expected — investigate before coding.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block; P-63 has a spec — read it):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- **`docs/polish-item-specs/P-63-central-ai-model-registry-self-serve.md` — the FIRST read** (the P-63 canonical source-of-truth; read §1 verbatim ask + §4 locked decisions + §6 Phase 1 as-built + §7 Phase 2 plan + the deferred D1 + D4 decisions).
- **`docs/AI_MODEL_REGISTRY_PRIMER.md`** — the NEW catch-up guide; Phase 2's admin screen is the self-serve front-end of exactly what this primer documents doing by hand.
- **`docs/AI_MODEL_REGISTRY.md`** — site #4 is now the canonical home (`models.ts`/`pricing.ts` live under `ai-models/`); read the §2 consumer table (all 7 W#2 modals + W#1 AutoAnalyze) + the `menus`-tag / `getModelsForMenu` notes.
- **`docs/COMPETITION_SCRAPING_PRIMER.md`** §5 — the W#2 residue table (P-63 Phase 2 is the new active platform-wide item; Phase 1 + P-50 + P-56 Option-2 now closed).
- **`docs/HANDOFF_PROTOCOL.md`** Rule 3 (workflow ownership — P-63 is platform-wide incl. W#1) + Rule 9 (deploy gate) + Rule 14f (forced-picker) + Rule 23 (Change Impact Audit — Phase 2 touches schema) + Rule 25 (multi-workflow) + Rule 26 + Rule 27 (verification) + Rule 30 (Session bookends) + Rule 31 (read-guarantee + audit-shipped-state) + Rule 32 (AI-model-selection registry) + §4 Step 4b extended template.
- The actual code surfaces P-63 Phase 2 touches: the `src/lib/ai-models/` module (`registry.ts` + `models.ts` + `pricing.ts` + `provider-adapter.ts` + `types.ts`); the storage-seam accessors (Phase 2 swaps in a DB-backed implementation behind them); the Prisma schema (additive model); the new admin page surface.
- `docs/ROADMAP.md` — the P-63 polish-backlog entry (Phase 1 ✅ DEPLOYED + the Phase 2 plan) + the W#2 graduation record + the total-roadmap summary.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-03-f (this session — the `menus`-tag / shim / adapter-faithful-refactor / migrate-one-at-a-time patterns) + §Entry 2026-06-03-e (the P-63 two-layer design + the `runnable`-vs-`integration-pending` invariant + the additive-foundation pattern) + §Entry 2026-05-31 (the TOP-TIER SLIP — never act on an instruction that is not verbatim in a director message; honor explicit picker choices; restart on degraded tooling).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - **`feedback_plan_output_shape_before_building.md`** — Phase 2 is a real user-facing admin UI; plan its shape (sections / fields / placement / the integration-pending popover) WITH the director via a Rule 14f picker BEFORE coding; confirm D1 + D4 first.
  - **`feedback_no_fabricated_instructions.md`** — P-63 Phase 2 is the confirmed (a.137) pick; the locked decisions live in the P-63 spec §4 — do not invent scope.
  - **`feedback_destructive_ops_confirmation.md`** — Phase 2 is the schema-touching phase; the flag flips YES; Rule 23 audit + Rule 9 gate before any `prisma db push`; ADDITIVE only; never `migrate reset` against prod.
  - **`feedback_browser_first_ai_with_server_migration.md`** — relevant to the AI-execution model surfaces the registry backs.
  - **`feedback_recommendation_style.md`** + **`feedback_default_to_recommendation.md`** — recommend the most thorough/reliable shape (recommend DB-backed for D1); skip the forced-picker only when re-confirming a default-approved recommendation.
  - **`feedback_remaining_roadmap_summary.md`** + **`feedback_handoff_carryovers_to_roadmap.md`** — the handoff must summarize the total remaining roadmap + capture every carry-over as a ROADMAP entry.
  - **`feedback_session_bookends_plain_summary.md`** — bookend with plain-terms summaries.
  - `feedback_approval_scope_per_decision_unit.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_exports_include_all_table_data.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; the FIRST read is `docs/polish-item-specs/P-63-central-ai-model-registry-self-serve.md` (read §1 verbatim ask + §4 locked decisions + §6 Phase 1 as-built + §7 Phase 2 plan + the deferred D1 + D4 decisions), then `docs/AI_MODEL_REGISTRY_PRIMER.md` + `docs/AI_MODEL_REGISTRY.md` (site #4, now the canonical home) + `docs/COMPETITION_SCRAPING_PRIMER.md` §5.** **This session runs on `workflow-2-competition-scraping` — verify the branch first (it is the SAME branch as last session; not a change).** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal ((a.137) = P-63 Phase 2):** build the self-serve browser "AI Models" admin screen (company → model → thinking options → pricing) + DB-backed storage (an additive Prisma model behind the SAME registry accessors) + the integration-pending popover (D2). The registry is already fully consumed platform-wide (Phase 1, done + live), so Phase 2 makes it self-serve. **FIRST action: read the P-63 spec §7 + the primer, then PLAN the admin-screen output shape WITH me AND confirm the two deferred design decisions via a Rule 14f picker BEFORE coding** — **D1** (DB storage — I recommend DB-backed for true self-serve runtime add/remove, but confirm) + **D4** (admin-page placement — working assumption: a global platform-level "AI Models" admin page). Do NOT start coding the UI or the schema until the shape + D1 + D4 are confirmed.

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping   (SAME branch as last session — not a change)

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: EMPTY — main and workflow-2 are BOTH at the 2026-06-03-f doc-batch SHA.
#   Nothing is held back (UNLIKE last session, which held Phase 0 ahead of main).
#   If NOT empty, something did not ff-merge as expected — investigate before coding.
```

If `git branch --show-current` shows anything other than `workflow-2-competition-scraping`, run `./catch-up-workflow 2`.

**FIRST step (read the P-63 spec §7 + the primer + plan the admin-screen shape + confirm D1 + D4 — BEFORE any coding):** read `docs/polish-item-specs/P-63-*.md` §7 (the Phase 2 plan + the deferred D1/D4 decisions) + `docs/AI_MODEL_REGISTRY_PRIMER.md`; present me the proposed admin-screen output shape (sections, fields, placement, the integration-pending popover) in plain terms; fire a Rule 14f picker to confirm D1 (DB storage) + D4 (admin-page placement); only after I approve the shape + D1 + D4 do you start coding.

**Schema-change-in-flight flag:** **NO at entry, FLIPS YES once Phase 2 schema coding starts.** Phase 2 adds an ADDITIVE Prisma model for DB-backed registry storage behind the SAME registry accessors. The schema is ADDITIVE only (no column drops, no destructive migration). Run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (never `migrate reset` against prod).

**Output-shape (plan WITH the director per `feedback_plan_output_shape_before_building` + `feedback_session_bookends_plain_summary`):** the admin-screen sections / fields / placement + the integration-pending popover are planned WITH me before coding. "Ship v1 and iterate" ≠ unilateral design. If a sub-decision is an obvious default-approved recommendation, describe it plainly and proceed per `feedback_default_to_recommendation`; otherwise fire a Rule 14f picker.

**Forced-picker shape (before coding):** fire a Rule 14f AskUserQuestion for D1 (DB storage) + D4 (admin-page placement) + any real fork in the admin-screen shape. The deploy gate is itself a Rule 14f picker. The §4 Step 1c next-pick at end-of-session is a Rule 14f picker.

**Test coverage decision:** the DB-backed storage implementation behind the registry accessors should keep the existing accessor contract green (the Phase 0 + Phase 1 invariants — incl. "every runnable model has an integrated provider" + the `menus`-tag accessors — must stay green). Add node:test coverage for the new DB-backed accessor behavior; a real admin UI surface likely warrants a Playwright spec per Rule 27 (decide WITH the director per the surface complexity).

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (expect green; catch any type issue per change)
- Extension tsc clean (expect UNCHANGED — P-63 Phase 2 is PLOS-side; no extension source expected)
- Extension `npm test` = 915 (entry 915)
- src/lib `node:test` = 1387 (entry 1387; +N for the new DB-backed accessor tests)
- `npm run build` = 74 routes (entry 74; +1 if the admin page is a new route)
- Check 6 Playwright per Rule 27 (likely a NEW spec for the admin UI — decide WITH the director)

**Deploy mechanics:** P-63 Phase 2 follows the standard Rule 9 deploy gate + 3-push pattern (ff-merge to `main` → ping-pong sync back → end-of-session doc-batch). The schema work is gated: Rule 23 Change Impact Audit + explicit director authorization at the Rule 9 gate BEFORE any `prisma db push`; ADDITIVE only.

**Group A docs to update at session end:** ROADMAP header bump + the (a.137) close / (a.138) open + the P-63 polish-backlog phase update (Phase 2 ✅) + CHAT_REGISTRY header bump (203rd session) + DOCUMENT_MANIFEST header + flags (the new Prisma model + admin page registered) + CORRECTIONS_LOG header (+ 1 NEW §Entry only if anything notable) + HANDOFF_PROTOCOL header bump + CLAUDE_CODE_STARTER header bump + AI_MODEL_REGISTRY (update site #4 for the DB-backed storage) + AI_MODEL_REGISTRY_PRIMER (update for the self-serve admin screen) + NEXT_SESSION full rewrite.

**Group B docs to update at session end:** `docs/COMPETITION_SCRAPING_PRIMER.md` §5 (update the P-63 row to Phase 2 state) + the P-63 polish-item-spec (Phase 2 as-built) + `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` (a new "Deploy session #N" section if a user-facing surface deployed) + the Prisma schema doc / DATA_CATALOG if a new data item is captured (Rule 7 Living Questions if so).

**Standing carry-overs into this session:**

- **(a.137) = P-63 Phase 2** — read the spec §7 + the primer, plan the admin-screen shape, confirm D1 + D4, then build (schema additive + gated). On `workflow-2-competition-scraping`.
- **P-63 Phase 1 — ✅ DONE 2026-06-03-f** + **P-50 — ✅ DONE 2026-06-03-e** + **P-56 Option-2 — ✅ CLOSED (won't-do) 2026-06-03-e** + **P-43 — ✅ RESOLVED 2026-06-03-d.**
- **Other W#2 residue items** — P-53, P-26 / P-27 (the director picks the order after P-63).
- **The deferred W#2 Archive/Data-Contract split** — held until W#3 needs to read W#2 data; do NOT author now.
- **W#1's live polish backlog** (HIGH H-1 action-history+undo queued; canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`) — W#1 is graduated + lives on `main`; do NOT touch unless the director picks a W#1 backlog item explicitly. (W#1's `AutoAnalyze.tsx` picker was migrated by P-63 Phase 1 — separate from this backlog.)
- **P-62** — the Workflow-11 surveillance card+page (future-workflow; NOT a W#2 residue item).

---

## Why this pointer was written this way (debug aid)

- **(a.137) = P-63 Phase 2 is the PICK because the director chose it at the §4 Step 1c forced-picker** (the natural continuation of the now-complete Phase 1 — the registry is fully consumed, so the next step is making it self-serve).
- **The branch STAYS `workflow-2-competition-scraping`** — P-63 is being developed there. This is the SAME branch this session ran on (not a change). Use `./catch-up-workflow 2`; verify the branch immediately.
- **NOTHING is held ahead of main this time.** Phase 1 was fully deployed across three in-session ff-merges; the end-of-session doc-batch ff-merges normally. So `git log origin/main..HEAD` is EMPTY at entry — the normal graduated-workflow steady state (UNLIKE last session, which held Phase 0 ahead of main).
- **The FIRST action is to READ the P-63 spec §7 + the primer + PLAN the admin-screen shape + confirm D1 + D4 — BEFORE any coding.** Phase 2 is a real user-facing UI + the first schema-touching P-63 phase, so the plan-with-director discipline + the schema gate both apply.
- **The Schema-change-in-flight flag is NO at entry but FLIPS YES once Phase 2 schema coding starts** — Phase 2 adds an additive Prisma model; Rule 23 audit + Rule 9 gate before any `prisma db push`; ADDITIVE only; never `migrate reset` against prod.
- **P-63 is platform-wide** — but Phase 2 is the admin screen + storage, so it does not re-touch W#1/W#2 surface code (those were migrated in Phase 1). The admin screen is a new global platform-level surface (D4 working assumption).

## Alternate next-session candidates if director shifts priorities at session start

- **(a.137.alt1) P-63 Phase 2** (current PICK — pre-loaded above). Read the spec §7 + the primer, plan the admin-screen shape, confirm D1 + D4, then build (schema additive + gated). On `workflow-2-competition-scraping` via `./catch-up-workflow 2`.
- **(a.137.alt2) P-53 Excel "Export Table" for the Category + Type pages** (largely ABSORBED by P-55's grouped spreadsheets; LOW residue — a quick palate-cleanser if the director wants to defer P-63 Phase 2).
- **(a.137.alt3) P-26 / P-27 capture bugs** (below-fold scroll capture + capture bugs #9 / #15 — LOW; extension-side).
- **(a.137.alt4) W#1 HIGH item H-1** (action history + per-action undo — the queued-next W#1 polish item; canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`; on `main` via `./catch-up-workflow 1` or `./resume-workflow 1`). A deliberate W#1 pick if the director wants to advance W#1 instead.
- **(a.137.alt5) P-62 Workflow-11 surveillance card + page** (future-workflow seed; the spec exists; design WITH the director when W#11 kicks off — NOT a W#2 residue item).
