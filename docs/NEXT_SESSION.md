# Next session

**Written:** 2026-06-03-e (`session_2026-06-03-e_p50-condition-pathology-card-and-p63-ai-registry-phase-0` — TWO work items this session: **P-50 (Condition Pathology dashboard card) ✅ DEPLOYED-AND-VERIFIED + CLOSED** on real Chrome (vklf.com, director "PASS") via `workflow-2-competition-scraping` → `main` (`a51eea2 → a107e42`); and **P-63 (NEW — a self-serve central AI-model registry) Phase 0 BUILT but HELD UNDEPLOYED** (director "Hold, batch with Phase 1" + "Pause here; review first"). P-50: a 🩺 "Condition Pathology" placeholder card added at dashboard position 3 in BOTH `WORKFLOW_DEFS` arrays (`src/app/projects/page.tsx` + `src/app/projects/[projectId]/page.tsx`); `active:false, route:null`; NO schema, NO new route, NO extension change, NO W# renumbering. P-63 Phase 0 (commit `6c6959c`, parent `a107e42`): a PURELY ADDITIVE new module `src/lib/ai-models/` (`types.ts` + `registry.ts` seeded from the existing W#2 `models.ts`/`pricing.ts` + `provider-adapter.ts` with the shipped `anthropicAdapter` + `registry.test.ts`/`provider-adapter.test.ts`, +15 node:test incl. the "every runnable model has an integrated provider" invariant), registered as site #4 in `docs/AI_MODEL_REGISTRY.md` §1; nothing consumes it yet → provably cannot break any existing AI task. **Closes (a.135) (P-50 ✅ DEPLOYED-AND-VERIFIED — P-50 CLOSED). Opens (a.136) RECOMMENDED-NEXT = P-63 Phase 1** on `workflow-2-competition-scraping`. **The next session RUNS ON `workflow-2-competition-scraping`; the start command is `./catch-up-workflow 2`** (the dedicated graduated-W#2 re-entry — this is what the director will paste). **FIRST action next session = read `docs/polish-item-specs/P-63-central-ai-model-registry-self-serve.md` §6 (Phase 0 as-built) + §7 (remaining phases), THEN deploy the held Phase 0 commit `6c6959c` together with Phase 1's first surface.** §4 Step 1c forced-picker NOT fired this session — the next task is unambiguous (the director explicitly chose pause-and-review after Phase 0, with Phase 1 as the clear continuation). THREE Rule 14f pickers fired this session (the P-50 icon picker → 🩺; the P-50 Rule 9 deploy gate → "Yes — deploy to main"; the P-63 4-question design picker + the "Hold" / "Pause" choices).)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This session is `session_2026-06-03-e` — the FIFTH session of 2026-06-03 (suffix `-e`); the FIRST was `session_2026-06-03` (no suffix) = P-61, the SECOND was `session_2026-06-03-b` = W#2 graduation, the THIRD was `session_2026-06-03-c` = W#1 Rule-33 backfill, the FOURTH was `session_2026-06-03-d` = P-43 subshell cwd fix. The harness `currentDate` = 2026-06-03. **Next session: keep trusting the harness `currentDate`; do NOT regress or invent a suffix ahead of it.** The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session.

> ⚠️ **BRANCH: next session runs on `workflow-2-competition-scraping`.** The (a.136) pick is P-63 Phase 1; P-63 is platform-wide but was built + held on `workflow-2-competition-scraping`, so Phase 1 continues there. **Start command: `./catch-up-workflow 2`** (the dedicated Rule 33 graduated-W#2 re-entry — switches to `workflow-2-competition-scraping` + prints `docs/COMPETITION_SCRAPING_PRIMER.md`). This session ALSO ran on `workflow-2-competition-scraping`, so this is NOT a branch change — confirm `git branch --show-current` shows `workflow-2-competition-scraping` immediately after entry.

> ⚠️ **BRANCH STATE — PHASE 0 IS HELD AHEAD OF MAIN. READ THIS.** This session committed TWO build commits on `workflow-2-competition-scraping`: `a107e42` (P-50, DEPLOYED — ff-merged to `main`, so `main` IS at `a107e42`) and `6c6959c` (P-63 Phase 0, HELD — NOT merged to main). **`main` is at `a107e42`. `workflow-2-competition-scraping` is at `6c6959c` PLUS this session's end-of-session doc-batch SHA (the doc batch is pushed BRANCH-ONLY — NOT ff-merged to main, so the held Phase 0 stays undeployed).** So at next-session entry, `workflow-2-competition-scraping` is AHEAD of `main` by the P-63 Phase 0 commit + the doc-batch commit. **Expect `git log origin/main..HEAD --oneline` to show `6c6959c` (P-63 Phase 0) + the 2026-06-03-e doc-batch SHA — that is EXPECTED and CORRECT, NOT a missed merge.** Phase 1 is the session that finally ff-merges Phase 0 (`6c6959c`) to `main` together with Phase 1's first surface, under a fresh Rule 9 deploy gate.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry next session.** This session: NO → STAYED NO → NO at exit (P-50 is a static card edit; P-63 Phase 0 is a code-only additive module; the storage seam is in-memory/code-backed). **P-63 Phase 1 stays NO** — Phase 1 repoints pickers + routes calls through the adapter + moves files with re-export shims; it does NOT touch the DB. **The P-63 DB persistence is DEFERRED to Phase 2** (the self-serve UI phase). If/when Phase 2 lands, the schema is ADDITIVE only; run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (never `migrate reset` against prod).

> ⚠️ **OWED: DEPLOY THE HELD PHASE 0.** P-63 Phase 0 (`6c6959c`) was BUILT + fully tested (+15 node:test green) but deliberately NOT deployed (director "Hold, batch with Phase 1"). **The held Phase 0 must be deployed together with Phase 1's first surface** — do NOT leave it stranded. There is NO owed vklf.com VERIFICATION carried in (P-50 was verified "PASS"; P-63 Phase 0 has nothing user-facing to verify yet — it ships + verifies when Phase 1 wires the first real picker).

> ⚠️ **W#2 IS GRADUATED — P-63 is a platform-wide item that rides on the W#2 branch, NOT a reopening.** W#2 (Competition Scraping) is ✅ GRADUATED 2026-06-03 (continuity-first). P-63 is a PLATFORM-WIDE AI-model-registry consolidation (it touches W#2 pickers AND W#1's `AutoAnalyze.tsx`) that happens to be developed on `workflow-2-competition-scraping`. Building it does NOT un-graduate W#2. The deferred W#2 Archive/Data-Contract split + finalized-HRL Data Capture Interview stay intentionally held until W#3 needs to read W#2 data — do NOT author them now.

> ⚠️ **W#1 WILL BE TOUCHED in P-63 Phase 1 (deliberately, platform-wide).** W#1 (Keyword Clustering) is graduated and lives on `main`, but P-63 is platform-wide: Phase 1 repoints W#1's `AutoAnalyze.tsx` model picker to the central registry (a director-approved cross-workflow change). This is the EXCEPTION to "don't touch W#1" — it is in-scope for P-63 per the platform-wide design. Do the W#1 surface as one of the Phase 1 surfaces (scoreboard green before + after), on `workflow-2-competition-scraping`.

---

## What we did this session (in plain terms)

This session did two things — one finished + shipped, one started + paused on purpose.

**1. We added a new "Condition Pathology" card to the dashboard (DONE + LIVE).** Between the "Competition Scraping & Deep Analysis" card and the "Therapeutic Strategy & Product Family Design" card there is now a new 🩺 "Condition Pathology" card. It is a placeholder for now — it shows on the dashboard but doesn't open anything yet (the actual capability comes later). You verified it live on the real site and said "PASS."

**2. We laid the safe, hidden foundation for a future "one place to manage all your AI models" control panel (BUILT, but deliberately NOT switched on yet).** You asked for a single central place that holds every AI model (the model, its company, its thinking options, its pricing), with a self-serve "add / remove" screen, so that whenever you add or remove a model it automatically shows up (or disappears) everywhere a model can be picked — with no hardcoded lists anywhere. We designed it with you and built the foundation. Two important safety ideas:

- **Two separate layers.** One layer is the "list + labels + pricing" that every picker reads from (changing this is always safe). The other layer is the actual "connection" that lets a model run. They're kept apart on purpose.
- **A model can only be marked "ready to run" once its company's connection is actually wired up.** So you can never add, say, a Google model, have it appear in the picker, and then have it silently fail when used — the system won't let a model be "runnable" until the real connection exists. If you add a model from a company we haven't connected yet, it gets saved as "integration pending" and the screen tells you the exact instruction to give Claude to get it connected.

We built this as a brand-new, completely separate piece of code that **nothing uses yet** — so it literally cannot break any existing AI feature (proven by the tests). You chose to pause and review the foundation before we connect the real pickers to it, so it's saved on the working branch but NOT yet live. Next session we connect the real pickers and ship both together.

**We also retired one small optional leftover (P-56 Option-2):** the faint flicker that only shows while you're READING (not while selecting) isn't worth building a whole new redraw engine for, so we're not doing it. The real bug (flicker blocking selection) stayed fixed.

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` + `docs/COMPETITION_SCRAPING_PRIMER.md` §5 (the W#2 residue table) + `docs/polish-item-specs/P-63-*.md` + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (the W#1 live backlog) + `docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md` + `docs/DATA_CATALOG.md` §6.1 (the deferred W#2 Data Contract).

- **(a.136) = P-63 Phase 1** — **NEXT SESSION (see below).** Repoint every model picker to the central registry + deploy the held Phase 0 commit `6c6959c`. On `workflow-2-competition-scraping`.
- **P-50 — ✅ DONE 2026-06-03-e.** The Condition Pathology placeholder card is live + verified.
- **P-56 Option-2 — ✅ CLOSED (won't-do) 2026-06-03-e.** The optional idle-flicker redraw follow-up is retired (reopenable).
- **Remaining W#2 residue items** — P-53 (Export Table on the Category + Type pages — largely absorbed by P-55), P-26 / P-27 (capture bugs). All LOW/non-blocking; the director picks the order after P-63.
- **P-43 — ✅ RESOLVED 2026-06-03-d.** The recurring cwd-leak class is structurally killed.
- **The deferred W#2 Archive/Data-Contract split + finalized-HRL Data Capture Interview** — held until W#3 starts and needs to read W#2 data. NOT a blocker.
- **W#1's live polish backlog** — HIGH H-1 (action history + per-action undo) is the queued-next W#1 item; plus M-1/M-2/M-3 medium, L-1..L-5 low, C-1..C-7 carry-overs, Z-1 explicitly-last, P-1 passive prereq. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`. On `main`. (NOTE: W#1's `AutoAnalyze.tsx` picker is touched by P-63 Phase 1, which is separate from this backlog.)
- **(P-62, under Workflow 11)** "Post Launch Optimization & Surveillance" card + page — future-workflow, NOT a W#2 residue item.

## What we'll do next session (in plain terms)

1. **We connect the real model pickers to the new central AI-model registry** — one screen at a time, checking nothing breaks between each. This is the "Phase 1" that makes the foundation we built this session actually do its job.
2. **We ship the foundation (built this session) together with the first connected picker** — the foundation is currently held back; next session it goes live as part of Phase 1.
3. **It follows the normal build-and-deploy routine** — build, run the test scoreboard, deploy to vklf.com, and you verify on real Chrome (the AI pickers still work exactly as before for the models you already use — the change is plumbing, not behavior).

## What's still left in the total roadmap (in plain terms)

- **P-63 (central AI-model registry) — NEXT, the (a.136) pick.** Phase 0 built + held; Phase 1 connects the pickers + deploys. Phase 2 (later) adds the self-serve add/remove screen + saves models in the database. On `workflow-2-competition-scraping`.
- **P-50 (Condition Pathology card) — ✅ DONE 2026-06-03-e.** Live + verified.
- **P-56 Option-2 — ✅ CLOSED (won't-do) 2026-06-03-e.**
- **P-43 (the internal cwd-leak fix) — ✅ DONE 2026-06-03-d.**
- **Other W#2 residue items** — P-53, P-26 / P-27. Low-priority; the director picks the order.
- **W#2 graduation — ✅ DONE 2026-06-03 (continuity-first).** Re-entry via the primer + `./catch-up-workflow 2`.
- **W#1 (Keyword Clustering) Rule-33 backfill — ✅ DONE 2026-06-03-c.** On `main`.
- **The deferred W#2 Data Contract** — held until W#3 needs to read W#2 data; NOT a blocker.
- **W#1's live polish backlog** — HIGH H-1 (action history + undo) queued; canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`. On `main`.
- **P-52 (AI model registry + Rule 32 + Opus 4.8 rollout)** — ✅ DEPLOYED-AND-VERIFIED; its TWO carry-overs (Opus 4.8 pricing + the W#1 `AutoAnalyze.tsx` migration) are now ABSORBED into P-63.
- **P-61 / P-54 / P-55 / P-56 / P-57 / P-58 / P-59 / P-60 — ✅ ALL CLOSED.** The full W#2 polish queue is drained.
- **P-62 (NEW capture)** — the Workflow-11 surveillance card + page. Future-workflow.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started. W#3 kickoff is also the trigger to author the deferred W#2 Data Contract.
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**TWO work items — 2026-06-03-e.** **P-50 (Condition Pathology card) ✅ DEPLOYED-AND-VERIFIED + CLOSED** (build `a107e42`, `main` `a51eea2 → a107e42`, director real-Chrome "PASS"); **P-63 (NEW — self-serve central AI-model registry) Phase 0 BUILT but HELD UNDEPLOYED** (commit `6c6959c`, director "Hold, batch with Phase 1" + "Pause here; review first"). ONE deploy (P-50), ONE Rule 9 deploy gate (P-50 "Yes — deploy to main"); P-63 Phase 0 committed but NOT deployed (`main` stays at `a107e42`).

**Session shape (P-50: read/CREATE the spec → icon picker → build the card in both arrays → deploy gate → deploy → director PASS; P-63: capture the verbatim ask → 4-question design picker WITH the director → build the additive Phase 0 module + tests → register site #4 → director Hold → end-of-session doc-batch):**

- **P-50:** TWO Rule 14f pickers (the icon choice → 🩺; the Rule 9 deploy gate → "Yes — deploy to main"). NEW spec `docs/polish-item-specs/P-50-condition-pathology-dashboard-card.md` (Rule 31 — created, then status-bumped to DEPLOYED-AND-VERIFIED). ~5 LOC across the two `WORKFLOW_DEFS` arrays.
- **P-63:** the director proposed a single central AI-model registry (models + company + thinking options + pricing) with a self-serve add/remove UI auto-propagating to EVERY picker, no hardcoded lists. Designed WITH the director via a 4-question Rule 14f picker (all answered) + follow-up clarifying Qs. KEY DESIGN = TWO LAYERS: (A) data-driven presentation + (B) a provider-adapter integration layer; a `runnable`-vs-`integration-pending` status gate makes it issue-free (a model can't be runnable unless its provider's adapter is shipped). Supersedes/extends P-52 + ABSORBS both P-52 carry-overs. Phase 0 (`6c6959c`, PURELY ADDITIVE): NEW `src/lib/ai-models/` (`types.ts` + `registry.ts` seeded from the existing W#2 `models.ts`/`pricing.ts` + `provider-adapter.ts` with the shipped `anthropicAdapter` + `isProviderIntegrated`) + `registry.test.ts`/`provider-adapter.test.ts` (+15 node:test incl. the "every runnable model has an integrated provider" invariant). Registered as site #4 in `docs/AI_MODEL_REGISTRY.md` §1 (Rule 32 hook clean). Director chose "Hold, batch with Phase 1" + "Pause here; review first" → Phase 0 held undeployed. NEW spec `docs/polish-item-specs/P-63-central-ai-model-registry-self-serve.md`.
- **1 PENDING:** the end-of-session doc-batch commit (this doc-batch agent's output) — the Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY) + HANDOFF_PROTOCOL header bump + the Group B updates (the COMPETITION_SCRAPING_PRIMER §5 flip + the two NEW polish-item-specs). **This doc-batch is pushed BRANCH-ONLY to `workflow-2-competition-scraping` — it does NOT ff-merge to `main`, because an ff-merge would deploy the held Phase 0. ONE push only (the prior deploy push for P-50 was done in-session under its own Rule 9 gate).**

**Schema-change-in-flight flag NO at entry → STAYED NO entire session → NO at exit. NEXT session (P-63 Phase 1) = NO at entry anticipated** (Phase 1 is plumbing — pickers + adapter routing + file moves with re-export shims; the DB persistence is Phase 2).

**ZERO open DEFERRED items at exit (Rule 26):** TaskList returned EMPTY at entry; zero in-session TaskList tasks created; ZERO open DEFERRED at exit. The other W#2 residue items + the deferred W#2 Data Contract + P-62 + the W#1 live backlog are documented roadmap continuation, NOT TaskList DEFERRED items.

**NEW baselines locked (verified post-build):** root tsc clean (UNCHANGED) + extension tsc clean (UNCHANGED) + extension `npm test` = **915/915 UNCHANGED** + src/lib `node:test` = **1384/1384** (+15 over 1369 — the P-63 Phase 0 `registry.test.ts` + `provider-adapter.test.ts`; P-50 added 0) + `npm run build` = **74 routes UNCHANGED** (P-50 adds no route; P-63 Phase 0 adds no route); Check 6 Playwright SKIPPED per Rule 27 (P-50 = a static card edit; P-63 Phase 0 = an additive lib module — no DOM-timing/route change).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-06-03-e** (NO top-tier slip — a clean build/partial-deploy session) capturing (a) the P-63 TWO-LAYER design (presentation vs integration); (b) the `runnable`-vs-`integration-pending` status invariant as the issue-free mechanism; (c) the "additive Phase 0 = provably non-breaking" pattern; (d) the P-56 Option-2 won't-do decision. **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** **NO new memory file this session.**

**Group B docs updated** — `docs/COMPETITION_SCRAPING_PRIMER.md` (§5 residue table — P-50 → ✅ DONE/CLOSED, P-56 Option-2 → CLOSED-WONTDO, P-63 added as the NEW active platform-wide item: Phase 0 done, Phase 1 next) + NEW `docs/polish-item-specs/P-50-condition-pathology-dashboard-card.md` + NEW `docs/polish-item-specs/P-63-central-ai-model-registry-self-serve.md` + `docs/AI_MODEL_REGISTRY.md` (site #4 registered + the consolidation note). `docs/COMPETITION_SCRAPING_DESIGN.md` UNCHANGED (NO §B entry — P-50 is a platform-dashboard card + P-63 is a platform-wide registry, not W#2 product-design choices; P-63's design record is its spec). `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` UNCHANGED (NO new Deploy session #N — P-50 is a platform dashboard card, not a W#2-feature deploy). `docs/REVIEWS_PHASE_2_DESIGN.md` / `docs/COMPETITION_DATA_V2_DESIGN.md` UNCHANGED.

**SEVENTY-NINTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ZERO destructive ops. NO `prisma db push`, NO `migrate reset`, NO drop, NO dev-data deletes. TWO in-session build commits (`a107e42` P-50, `6c6959c` P-63 Phase 0 — both additive, non-destructive). P-50 was deployed to `main` under a Rule 9 gate; P-63 Phase 0 was committed but HELD undeployed on the workflow branch (director "Hold"). NO new memory file created; zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session).
- **NEXT session (P-63 Phase 1):** Phase 1 is plumbing (repoint pickers + route calls through the adapter + move files with re-export shims) — NO schema change, NO destructive ops anticipated. It DOES ff-merge the held Phase 0 (`6c6959c`) to `main` together with Phase 1's first surface, under a fresh Rule 9 deploy gate (a normal deploy, not destructive). The P-63 DB persistence (Phase 2, later) is the only schema-touching phase; when it lands it is ADDITIVE only — run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 gate BEFORE any `prisma db push` (never `migrate reset` against prod). No other Rule 8/9/29 triggers anticipated.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the W#2 continuity primer `docs/COMPETITION_SCRAPING_PRIMER.md` + the W#1 continuity primer `docs/KEYWORD_CLUSTERING_PRIMER.md` + the NEW `src/lib/ai-models/` module + the two NEW specs (P-50 + P-63) + `docs/AI_MODEL_REGISTRY.md` + the memory directory + the `./catch-up-workflow` + `./resume-workflow` scripts.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. The (a.136) pick is P-63 Phase 1; P-63 was built + held on `workflow-2-competition-scraping`, so Phase 1 continues there. **Start command: `./catch-up-workflow 2`** (the dedicated Rule 33 graduated-W#2 re-entry — switches to `workflow-2-competition-scraping` + prints `docs/COMPETITION_SCRAPING_PRIMER.md`). This session ALSO ran on `workflow-2-competition-scraping`, so this is NOT a branch change. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch is pushed BRANCH-ONLY onto `workflow-2-competition-scraping`): `main` is at `a107e42` (P-50 deployed). `workflow-2-competition-scraping` is at `6c6959c` (P-63 Phase 0, HELD) PLUS the 2026-06-03-e doc-batch SHA. **`workflow-2-competition-scraping` is AHEAD of `main` by the P-63 Phase 0 commit + the doc-batch commit — this is EXPECTED, not a missed merge.** **Verify with `git log origin/main..HEAD --oneline` showing `6c6959c` + the 2026-06-03-e doc-batch SHA**; `git status` clean apart from historical untracked .zip + .html artifacts at repo root.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block; P-63 has a spec — read it):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- **`docs/polish-item-specs/P-63-central-ai-model-registry-self-serve.md` — the FIRST read** (the P-63 canonical source-of-truth; read §1 verbatim ask + §4 locked decisions + §6 Phase 0 as-built + §7 remaining phases). **Phase 1's first action after reading = deploy the held Phase 0 commit `6c6959c` together with Phase 1's first surface.**
- **`docs/AI_MODEL_REGISTRY.md`** — site #4 is the new P-63 platform-level registry; read the consolidation note + the Rule 32 hook context.
- **`docs/COMPETITION_SCRAPING_PRIMER.md`** §5 — the W#2 residue table (P-63 is the new active platform-wide item; P-50 + P-56 Option-2 now closed).
- **`docs/HANDOFF_PROTOCOL.md`** Rule 3 (workflow ownership — P-63 is platform-wide incl. W#1) + Rule 9 (deploy gate) + Rule 14f (forced-picker) + Rule 23 (Change Impact Audit) + Rule 25 (multi-workflow) + Rule 26 + Rule 27 (verification) + Rule 30 (Session bookends) + Rule 31 (read-guarantee + audit-shipped-state) + Rule 32 (AI-model-selection registry) + §4 Step 4b extended template.
- The actual code surfaces P-63 Phase 1 touches: the NEW `src/lib/ai-models/` module (`registry.ts` + `provider-adapter.ts` + `types.ts`); the existing W#2 `models.ts` + `pricing.ts`; the 6 W#2 model-picker modals; W#1's `AutoAnalyze.tsx`; the W#2 AI-call paths that use `messages.create`.
- `docs/ROADMAP.md` — the P-63 polish-backlog entry (the full phase plan) + the W#2 graduation record + the total-roadmap summary.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-03-e (this session — the P-63 two-layer design + the `runnable`-vs-`integration-pending` invariant + the additive-foundation pattern) + §Entry 2026-06-03-d (the subshell-CWD PATTERN) + §Entry 2026-05-31 (the TOP-TIER SLIP — never act on an instruction that is not verbatim in a director message; honor explicit picker choices; restart on degraded tooling).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - **`feedback_plan_output_shape_before_building.md`** — P-63 Phase 1 touches AI pickers + the eventual UI; plan any user-visible shape WITH the director BEFORE coding.
  - **`feedback_no_fabricated_instructions.md`** — P-63 Phase 1 is the confirmed (a.136) pick; the locked decisions live in the P-63 spec §4 — do not invent scope.
  - **`feedback_browser_first_ai_with_server_migration.md`** — relevant to the AI-execution model surfaces P-63 touches.
  - **`feedback_recommendation_style.md`** + **`feedback_default_to_recommendation.md`** — recommend the most thorough/reliable shape; skip the forced-picker only when re-confirming a default-approved recommendation.
  - **`feedback_remaining_roadmap_summary.md`** + **`feedback_handoff_carryovers_to_roadmap.md`** — the handoff must summarize the total remaining roadmap + capture every carry-over as a ROADMAP entry.
  - **`feedback_session_bookends_plain_summary.md`** — bookend with plain-terms summaries.
  - `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_exports_include_all_table_data.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; the FIRST read is `docs/polish-item-specs/P-63-central-ai-model-registry-self-serve.md` (read §1 verbatim ask + §4 locked decisions + §6 Phase 0 as-built + §7 remaining phases), then `docs/AI_MODEL_REGISTRY.md` (site #4) + `docs/COMPETITION_SCRAPING_PRIMER.md` §5.** **This session runs on `workflow-2-competition-scraping` — verify the branch first (it is the SAME branch as last session; not a change).** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal ((a.136) = P-63 Phase 1):** make the central AI-model registry (built additively as Phase 0 last session, commit `6c6959c`, currently HELD undeployed) actually do its job — repoint every model picker to read from it + route the live model calls through the provider adapter — and DEPLOY the held Phase 0 together with Phase 1's first surface. **FIRST action: read the P-63 spec §6 + §7, then plan Phase 1's surface order WITH me. Then: deploy `6c6959c` together with Phase 1's first surface under a Rule 9 deploy gate.** The Phase 1 scope (per the spec §7): (1) repoint the 6 W#2 model-picker modals + W#1's `AutoAnalyze.tsx` to read options + pricing + thinking-options FROM the central registry (no hardcoded lists); (2) route the live `messages.create` calls through the provider adapter (zero behavior change for Anthropic — the only currently-integrated provider); (3) physically move `models.ts`/`pricing.ts` under `src/lib/ai-models/` with back-compat re-export shims so nothing else breaks; (4) reconcile W#1's thinking options into the registry's `thinkingOptions`. **Do it ONE surface at a time, with the full scoreboard green before AND after each surface** — so any regression is isolated to a single surface. **W#2 is GRADUATED + W#1 is graduated — but P-63 is PLATFORM-WIDE, so touching W#1's `AutoAnalyze.tsx` picker IS in scope (director-approved cross-workflow change). Do NOT author the deferred W#2 Data Contract.**

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping   (SAME branch as last session — not a change)

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: 6c6959c (P-63 Phase 0, HELD) + the 2026-06-03-e doc-batch SHA
#   — workflow-2 is AHEAD of main by these; this is EXPECTED (the held Phase 0), NOT a missed merge.
#   main is at a107e42 (P-50 deployed).
```

If `git branch --show-current` shows anything other than `workflow-2-competition-scraping`, run `./catch-up-workflow 2`.

**FIRST step (read the P-63 spec + plan the surface order + deploy the held Phase 0 with surface #1 — under a Rule 9 gate):** read `docs/polish-item-specs/P-63-*.md` §6 (Phase 0 as-built) + §7 (the Phase 1 plan); present me the proposed surface order for Phase 1 (which picker first, etc.) in plain terms; then build surface #1, run the scoreboard, and DEPLOY `6c6959c` + surface #1 together under a Rule 9 deploy gate; I verify on real Chrome that the AI pickers still work exactly as before.

**Schema-change-in-flight flag:** **NO at entry.** P-63 Phase 1 is plumbing (pickers + adapter routing + file moves with re-export shims) — NO schema change. The P-63 DB persistence is DEFERRED to Phase 2. If Phase 1 unexpectedly needs schema, it is ADDITIVE only; run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (never `migrate reset` against prod).

**Output-shape (plan WITH the director per `feedback_plan_output_shape_before_building` + `feedback_session_bookends_plain_summary`):** the Phase 1 surface order + any user-visible change is planned WITH me before coding. The model pickers should look + behave IDENTICALLY to before for the models I already use (the change is plumbing, not behavior). If the recommended surface order is obvious + default-approved, describe it plainly and proceed per `feedback_default_to_recommendation`; otherwise fire a Rule 14f picker for any real fork.

**Forced-picker shape (before coding):** fire a Rule 14f AskUserQuestion for any real fork (surface order, any visible-behavior decision). The deploy gate is itself a Rule 14f picker. The §4 Step 1c next-pick at end-of-session is a Rule 14f picker.

**Test coverage decision:** each repointed surface should keep its existing behavior green; add node:test coverage for any new pure helper that assembles picker options / pricing / thinking-options from the registry (run as part of the scoreboard). The +15 Phase 0 invariants (incl. "every runnable model has an integrated provider") must stay green. A pure render-wiring change may need no new Playwright spec beyond tsc + the visual verification per Rule 27.

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (expect UNCHANGED unless a surface change introduces a type issue — catch it per surface)
- Extension tsc clean (expect UNCHANGED — P-63 Phase 1 is PLOS-side; no extension source expected)
- Extension `npm test` = 915 (entry 915)
- src/lib `node:test` = 1384 (entry 1384; +N if Phase 1 adds pure helpers)
- `npm run build` = 74 routes (entry 74; P-63 Phase 1 adds no route)
- Check 6 Playwright per Rule 27 (SKIPPED unless a surface change is regression-prone)
- Keep the scoreboard green BEFORE AND AFTER each surface (the additive-then-migrate-one-at-a-time discipline from the P-63 spec).

**Deploy mechanics:** P-63 Phase 1 follows the standard Rule 9 deploy gate + 3-push pattern, BUT note: this session's deploy ALSO carries the held Phase 0 commit `6c6959c` (ff-merge `6c6959c` + Phase 1's first surface to `main` together → ping-pong sync back → end-of-session doc-batch). The end-of-session doc-batch then ff-merges normally (since nothing is held back after Phase 1's first deploy).

**Group A docs to update at session end:** ROADMAP header bump + the (a.136) close / (a.137) open + the P-63 polish-backlog phase update + CHAT_REGISTRY header bump (202nd session) + DOCUMENT_MANIFEST header + flags (note the held Phase 0 is now deployed) + CORRECTIONS_LOG header (+ 1 NEW §Entry only if anything notable) + HANDOFF_PROTOCOL header bump + CLAUDE_CODE_STARTER header bump + AI_MODEL_REGISTRY (update site #4 as Phase 1 surfaces land) + NEXT_SESSION full rewrite.

**Group B docs to update at session end:** `docs/COMPETITION_SCRAPING_PRIMER.md` §5 (update the P-63 row to Phase 1 state) + the P-63 polish-item-spec (Phase 1 as-built; write `docs/AI_MODEL_REGISTRY_PRIMER.md` at end of Phase 1 per the director's ask) + `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` (a new "Deploy session #N" section if a user-facing surface deployed).

**Standing carry-overs into this session:**

- **(a.136) = P-63 Phase 1** — read the spec, plan the surface order, deploy the held Phase 0 (`6c6959c`) with surface #1. On `workflow-2-competition-scraping`.
- **The held Phase 0 commit `6c6959c`** — must be deployed together with Phase 1's first surface; do NOT leave it stranded.
- **P-50 — ✅ DONE 2026-06-03-e** + **P-56 Option-2 — ✅ CLOSED (won't-do) 2026-06-03-e** + **P-43 — ✅ RESOLVED 2026-06-03-d.**
- **Other W#2 residue items** — P-53, P-26 / P-27 (the director picks the order after P-63).
- **The deferred W#2 Archive/Data-Contract split** — held until W#3 needs to read W#2 data; do NOT author now.
- **W#1's live polish backlog** (HIGH H-1 action-history+undo queued; canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`) — W#1 is graduated + lives on `main`; do NOT touch unless the director picks a W#1 backlog item explicitly. (W#1's `AutoAnalyze.tsx` picker is touched by P-63 Phase 1, which is the platform-wide registry change — separate from this backlog.)
- **P-62** — the Workflow-11 surveillance card+page (future-workflow; NOT a W#2 residue item).

---

## Why this pointer was written this way (debug aid)

- **(a.136) = P-63 Phase 1 is the PICK because the director chose pause-and-review after Phase 0, with Phase 1 as the explicit clear continuation.** No §4 Step 1c forced-picker fired — the next task is unambiguous (Phase 1 is the named continuation of the P-63 work just started).
- **The branch STAYS `workflow-2-competition-scraping`** — P-63 was built + held there. This is the SAME branch this session ran on (not a change). Use `./catch-up-workflow 2`; verify the branch immediately.
- **The held Phase 0 commit `6c6959c` is AHEAD of main on purpose.** The director chose to hold it undeployed and batch it with Phase 1. The end-of-session doc-batch was pushed BRANCH-ONLY (NOT ff-merged to main) specifically to keep Phase 0 undeployed — so `git log origin/main..HEAD` showing `6c6959c` + the doc-batch SHA at entry is EXPECTED, not a missed merge. Phase 1 is the session that deploys it.
- **The FIRST action is to READ the P-63 spec §6/§7 + plan the surface order — then deploy the held Phase 0 with surface #1.** Phase 1 is plumbing; the safety comes from migrating one surface at a time with the scoreboard green between each (the additive-then-migrate discipline from the spec).
- **The Schema-change-in-flight flag is NO at entry** — Phase 1 is plumbing; the DB persistence is Phase 2.
- **P-63 is platform-wide, so touching W#1's `AutoAnalyze.tsx` IS in scope** — this is the deliberate exception to "don't touch W#1," because the central registry consolidates EVERY picker platform-wide (director-approved).

## Alternate next-session candidates if director shifts priorities at session start

- **(a.136.alt1) P-63 Phase 1** (current PICK — pre-loaded above). Read the spec §6/§7, plan the surface order, deploy the held Phase 0 (`6c6959c`) with surface #1. On `workflow-2-competition-scraping` via `./catch-up-workflow 2`.
- **(a.136.alt2) P-53 Excel "Export Table" for the Category + Type pages** (largely ABSORBED by P-55's grouped spreadsheets; LOW residue — a quick palate-cleanser if the director wants to defer P-63 Phase 1).
- **(a.136.alt3) P-26 / P-27 capture bugs** (below-fold scroll capture + capture bugs #9 / #15 — LOW; extension-side).
- **(a.136.alt4) W#1 HIGH item H-1** (action history + per-action undo — the queued-next W#1 polish item; canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`; on `main` via `./catch-up-workflow 1` or `./resume-workflow 1`). A deliberate W#1 pick if the director wants to advance W#1 instead. NOTE: even if P-63 Phase 1 is deferred, the held Phase 0 commit `6c6959c` should NOT be left stranded indefinitely — it stays branch-ahead-of-main until a P-63 Phase 1 session deploys it.
- **(a.136.alt5) P-62 Workflow-11 surveillance card + page** (future-workflow seed; the spec exists; design WITH the director when W#11 kicks off — NOT a W#2 residue item).
