# Next session

**Written:** 2026-06-19-a (`session_2026-06-19-a_w1-variant-b-ai2-plan-step-0-foundation` — **W#1 (Keyword Clustering) — VARIANT B ("AI 2") PLANNING + STEP-0 FOUNDATION — a PLANNING + PURE-FOUNDATION-CODE session (NO schema change, NO deploy, NO AI/model spend).** Variant B = a new intent-driven keyword→funnel pipeline added ALONGSIDE the existing Manual / AI 1 modes on the keyword-clustering surface for A/B testing on identical input, built byte-for-byte non-disruptive to Manual and AI 1. The implementation plan `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` is APPROVED IN PRINCIPLE; STEP 0 — the pure foundation libs under `src/lib/variant-b/` — is BUILT + test-passing on disk (carrier-dedup 17 node:test ✅, rulebook 22 node:test ✅ incl. the reviewer-round-2 placement fixes; `tsc` clean for variant-b). FOUR director-confirmed decisions (D-NICHE/D-DIAG/D-CAND/D-CMP) recorded. **§4 Step 1c forced-picker NOT fired — the director EXPLICITLY chose Variant B → (a.143) RECOMMENDED-NEXT = VARIANT B ("AI 2") STEP 1 — the GATED schema delta.** **The next session RUNS ON `main`; start command `./resume-workflow 1` (or bare `./resume`).**)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This session is `session_2026-06-19-a` — the FIRST session of 2026-06-19 (suffix `-a`); the prior session was `session_2026-06-04-c`. **Next session: keep trusting the harness `currentDate`; if it is still 2026-06-19 the next suffix is `-b`; if it has rolled forward use the new date with NO suffix. Do NOT regress to a 2026-06-04 suffix and do NOT invent a suffix ahead of the harness.** The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session.

> ⚠️ **BRANCH: next session runs on `main`.** The (a.143) pick is Variant B ("AI 2") Step 1 — Variant B is additive W#1 (keyword-clustering-surface) work; W#1 is graduated and lives on `main` per Rule 22. **Start command: `./resume-workflow 1`** (reads `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md`, which queues Variant B Step 1) — OR `./resume` (reads THIS file, which mirrors the same launch prompt) — OR `./catch-up-workflow 1` (the Rule 33 graduated-W#1 re-entry — switches to `main` + prints `docs/KEYWORD_CLUSTERING_PRIMER.md`). Confirm `git branch --show-current` shows `main` immediately after entry. If you're on a `workflow-N-<slug>` branch, STOP and surface to the director.

> ⚠️ **THIS IS A GATED SCHEMA-CHANGE SESSION — DO NOT push the schema without BOTH director approval AND the schema-owner flag claim.** Step 1 begins with the §3 schema delta: nullable `CanvasNode` columns (`zone`, `stage`, `verticalRank`, `siblingOrder`, `isSpine`, `variantBMeta`) + a new `CLREntry` table + a nullable `Project.nicheSlug`. Per `docs/MULTI_WORKFLOW_PROTOCOL.md`: **(1) present the delta for explicit director approval; (2) claim the ROADMAP "Current Active Tools" schema-change-in-flight flag IMMEDIATELY BEFORE the push (NOT before — it was deliberately left "No" at the end of the planning session); (3) `prisma db push` (no migrations dir); (4) flip the flag back to No after.** No `prisma db push` until BOTH approval AND the flag-claim are done. Run a Rule 23 Change Impact Audit first (the delta is ADDITIVE — nullable cols AI 1 never references + a brand-new table + a nullable col — no existing read/write/render path changes).

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry — it FLIPS to Yes in-session, immediately before the gated `prisma db push`, then back to No after.** It was deliberately left "No" at the end of the planning session. Claim it ONLY at the moment of the push, never earlier; release it immediately after. This is the single-schema-owner serialization point — confirm no other workflow holds the flag before claiming it.

> ⚠️ **VARIANT B MUST BE BYTE-FOR-BYTE NON-DISRUPTIVE to Manual and AI 1.** All new code lives under `src/lib/variant-b/` + `components/variant-b/`; the schema additions are nullable cols (AI 1 never reads them) + a brand-new isolated `CLREntry` table + a nullable `Project.nicheSlug`. AI 1 keeps using `sortOrder`; VB uses `siblingOrder`/`verticalRank` — no shared column is mutated. Do NOT edit `auto-analyze-v3.ts`, `operation-applier.ts`, or `AutoAnalyze.tsx` (VB patterns ON `AutoAnalyze.tsx` but does not modify it). The three-state toggle change in `page.tsx` is a localized enum/button/route swap; the Manual + AI 1 branches keep their exact current behavior.

> ⚠️ **STEP 0 IS DONE — do NOT rebuild it.** The pure foundation libs `src/lib/variant-b/{types,carrier-dedup,rulebook}.ts` (+ their `.test.ts`) are built + test-passing on disk + committed. Step 1 builds ON them (the seed reads `rulebook.ts`; the assembler unions it with DB rows). One comment-only correction is queued: `rulebook.ts`'s header comment saying libs "read these directly" will be changed to "feeds the assembler" (the libs take the assembled rulebook as a PARAMETER; they never import niche-aware constants directly).

> ⚠️ **H-1 SLICE 4 IS DEFERRED, still OPEN — do NOT lose it.** The previously-queued W#1 task — H-1 slice 4 (action-history before-state enrichment + the History context fix) + the per-action undo engine that follows it — is DEFERRED, NOT cancelled. The director chose Variant B as the immediate next priority. H-1 slice 4 remains OPEN in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 and is the (a.142) task, queued behind Variant B's first build.

> ⚠️ **W#2 IS COMPLETE — do NOT reopen it.** W#2 (Competition Scraping) graduated 2026-06-03 and its entire residue is formally retired won't-do. Do NOT author new W#2 work unless the director explicitly asks.

---

## What we did this session (in plain terms)

We designed and got sign-off on a second analysis engine for Keyword Clustering, and we wrote + tested the first, safest layer of code for it.

**We designed "AI 2" — a smarter way to turn a keyword list into a marketing funnel.** Right now the Keyword Clustering tool has two buttons: do it by hand ("Manual") and let the current AI do it ("AI 1"). "AI 2" (we call it Variant B) is a new, smarter engine that understands what a searcher actually WANTS behind each keyword and organizes the list into a clear funnel. It will sit RIGHT NEXT TO the Manual and AI 1 buttons so you can run both engines on the same keyword list and compare the results side by side.

**We got the plan approved and made four key decisions together.** The full plan is written down and approved in principle. Along the way you confirmed four choices: how a project says which health niche it's in (a small, optional field); that the one-time "learn this niche" step (which costs a little AI money) only runs when you press a clearly-labelled button that shows the cost first; that proposed rule changes wait in a simple approve/reject list before they count; and that the side-by-side comparison is its own separate read-only screen, not a fourth button.

**We built and tested the safest first layer of code.** We wrote the "rulebook" (how intents map to funnel stages) and the de-duplication logic as brand-new files that can't touch or break Manual or AI 1 — and we covered them with 39 automated tests, all passing. We also fixed a subtle rule bug a reviewer caught (the word "vs" was steering some searches into the wrong funnel zone).

**Nothing touched the database or cost any AI money this session.** The one part that changes the database is deliberately held for next session and won't run until you approve it.

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (the (a.143) Variant B entry + the W#1 row + the total-roadmap summary) + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (the W#1 live backlog, incl. H-1) + `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` (the approved Variant B plan) + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (the W#1 pointer the parent already wrote queuing Variant B Step 1).

- **(a.143) = VARIANT B ("AI 2") Step 1 — the GATED schema delta** — **NEXT SESSION (see below).** Then the full Variant B build order. On `main`.
- **(a.142) = W#1 H-1 slice 4 (before-state enrichment + the History context fix)** — **DEFERRED but OPEN**, queued behind Variant B. Capture before-state + a human-anchorable identity for AI operations so the Action-History reads in full context. On `main`.
- **(a.139) = W#1 H-1 (the action-history + undo epic)** — ADVANCED, NOT closed. Slices 1 + 2 + 3 done; slice 4 (the (a.142) pick) + the per-action undo engine remain, deferred behind Variant B. On `main`.
- **W#1 M-2 — ✅ DONE 2026-06-03-h** + **W#2 — ✅ COMPLETE 2026-06-03-h (residue fully retired)** + **P-63 Phase 2 / P-64 — ✅ DONE 2026-06-03-g** + **P-63 Phase 1 — ✅ DONE 2026-06-03-f** + **P-50 — ✅ DONE 2026-06-03-e** + **P-43 — ✅ RESOLVED 2026-06-03-d.**
- **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) — FUTURE.** Fired only when the director wants a non-Anthropic model live + supplies that provider's API docs. NOT a near-term item.
- **W#1's remaining live polish backlog** — after H-1: M-1 (3 server-side migrations), M-3 (validation-retry telemetry), L-1..L-5 low, C-1..C-7 carry-overs, Z-1 explicitly-last, P-1 passive prereq. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`. On `main`.
- **The deferred W#2 Archive/Data-Contract split + finalized-HRL Data Capture Interview** — held until W#3 starts and needs to read W#2 data. NOT a blocker.
- **(P-62, under Workflow 11)** "Post Launch Optimization & Surveillance" card + page — future-workflow.

## What we'll do next session (in plain terms)

1. **We make the one database change AI 2 needs — but only after you approve it.** AI 2 needs a few new (optional) fields and one new table to store the funnel rules. Nothing breaks for Manual or AI 1 because the new fields are optional and the table is brand new. We'll show you exactly what's changing and wait for your go-ahead before touching the database.
2. **We load the rulebook into the database and build the part that reads it.** Once the storage exists, we seed it with the universal rulebook we already wrote, then build the piece that combines the universal rules with any niche-specific rules you've approved.
3. **We build the "learn this niche" button (with the cost shown first).** This is the one step that spends a little AI money — it studies a sample of your keywords to learn the niche's vocabulary. It only runs when you press a clearly-labelled button that shows the cost first.
4. **Then we build the rest of AI 2 piece by piece** — the analysis logic, the run screen (modelled on the AI 1 screen you already know), the new third button, copying keywords from AI 1, writing the result to the canvas, and finally the side-by-side comparison screen. Each piece gets automated tests; we deploy and you verify on the live site as we go.

## What's still left in the total roadmap (in plain terms)

- **W#1 Variant B ("AI 2") — the new second analysis engine, IN PROGRESS, the (a.143) pick.** Plan approved; the safe foundation libs built + tested; next is the gated database change, then the full build. On `main`.
- **W#1 H-1 (action history + undo) — IN PROGRESS but DEFERRED behind Variant B, the (a.139) epic.** Slices 1–3 done (recording AI changes + your hand changes + the visible History screen); slice 4 (the (a.142) pick) makes the recorded changes read in full context; the per-action Undo comes after. On `main`.
- **W#1's other polish** — M-1 (move a few things off the browser onto the server), M-3 (retry-rate telemetry), plus low-priority items. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`.
- **W#2 (Competition Scraping) — ✅ COMPLETE.** Graduated + every item shipped or formally retired.
- **P-63 (central AI-model registry) — Phase 2 ✅ DONE + live; Phase 3 (add ChatGPT + Gemini) is a future task** fired when you want a non-Anthropic model and give us its docs. **P-64 (drag-reorder) ✅ DONE.**
- **The deferred W#2 Data Contract** — held until W#3 needs to read W#2 data; NOT a blocker.
- **P-62 (NEW capture)** — the Workflow-11 surveillance card + page. Future-workflow.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started. W#3 kickoff is also the trigger to author the deferred W#2 Data Contract.
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**W#1 VARIANT B ("AI 2") PLANNING + STEP-0 FOUNDATION — 2026-06-19-a.** The Variant B implementation plan was reconciled to live code and APPROVED IN PRINCIPLE (`Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md`), and STEP 0 (pure foundation libs — no DB, no AI) was built + test-passing on disk under `src/lib/variant-b/`. A planning + pure-foundation-code session: NO schema change, NO deploy, NO AI/model spend.

**Session shape:**

- **What was decided/approved:** the Variant B plan (approved in principle) + FOUR director-confirmed decisions (each Claude's recommendation → director-selected): D-NICHE (nullable `Project.nicheSlug` as the niche anchor); D-DIAG (the ~500-keyword niche-rulebook diagnostic runs behind an explicit "Build niche rulebook" cost-confirm button); D-CAND (a minimal temporary approve/reject list over `candidate` CLR entries — Lessons UI deferred); D-CMP (the A/B comparison = a SEPARATE read-only view, NOT a fourth mode of the three-state run control).
- **What was built (Step 0, on disk, isolated NEW files — do NOT touch Manual or AI 1):** `src/lib/variant-b/types.ts` (pipeline shapes); `carrier-dedup.ts` (rulebook §6 carrier dedup — 17 node:test ✅); `rulebook.ts` (the universal-layer rulebook as typed code constants — descriptors §1, zones/stages §2/§3, placement rules R1–R11 §5 with precedence baked into priority, ignorable set §6, merge policy §8, natural-sequence hints + `verticalRank()` §10 — 22 node:test ✅ incl. the reviewer-round-2 placement fixes). `tsc` clean for variant-b.
- **What was corrected (reviewer round 2, applied to `rulebook.ts`):** P1 descriptor-driven R7/R3 split (dropped the bare `vs`/`or`/`which` phrase cue that mis-routed condition-vs-condition differentials to Evaluation); P2 stage splits (R9C cost→price, R10S safety→side-effects/safety); P3 verticalRank kept; P4 D-meta on the intent/topic object; P5 intended placement gaps → needs-placement queue.

**FOUR LOCKED RESOLUTIONS to carry into the build (do NOT re-litigate):** (1) runtime read-path = universal(code) ∪ active-niche ∪ approved-candidate DB `CLREntry` rows, injected as a parameter into every pure lib + prompt; (2) generous/high-recall intent enumeration (over-enumeration acceptable; validators FLAG omission/fabrication for review, never penalize over-enumeration, never auto-delete); (3) reorg-sweep cadence configurable (`variantB.reorgCadence`) + a guaranteed final full sweep; (4) the A/B comparison is a separate read-only view, NOT a fourth mode.

**Schema-change-in-flight flag NO at entry → STAYED NO entire session → NO at exit (Step 0 is pure code, no DB). NEXT session (Variant B Step 1) FLIPS the flag to Yes in-session, immediately before the gated `prisma db push`, then back to No — never claim it earlier.**

**Rule 14f pickers fired this session:** NONE (the four director-confirmed decisions D-NICHE/D-DIAG/D-CAND/D-CMP were recorded in the plan ahead of this session; the director explicitly chose Variant B as the next priority, so §4 Step 1c did not fire).

**DEFERRED items (Rule 26):** the H-1 slice 4 (a.142) task remains the one open DEFERRED item, queued behind Variant B; no NEW `DEFERRED:` task created this session.

**EXIT baselines (planning + pure-foundation-code; documentation-only guardrail this session):** the Step-0 libs are `tsc` clean for variant-b + `node --test`-passing (carrier-dedup 17 ✅, rulebook 22 ✅ = 39 tests); the aggregate scoreboard (root tsc / ext tsc / `npm run build` route count / full `src/lib node:test` / extension `npm test` / Playwright) was NOT re-run this session per the documentation-only guardrail — it re-runs next session at the gated Step-1 build.

**ONE NEW CORRECTIONS_LOG §Entry 2026-06-19-a** — a HIGH-importance DESIGN CORRECTION (NOT a top-tier slip): the reviewer-caught placement-cue defect (a bare `vs`/`or`/`which` phrase cue outranked the descriptor-driven rules and mis-routed condition-vs-condition differentials to Evaluation); fixed to a descriptor-driven R7/R3 split + stage splits; the LESSON = a surface phrase cue must never outrank the structured descriptor signals — encode placement on the intent's typed descriptors, and route ambiguous cases to a needs-placement queue rather than guessing a default. **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** **NO new memory file this session.**

**Non-Group-A repo changes** — the whole NEW `Workflow 1 AI V2/` design-doc package (9 files incl. `VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md`) + NEW `src/lib/variant-b/{types.ts, carrier-dedup.ts, carrier-dedup.test.ts, rulebook.ts, rulebook.test.ts}` = the Variant B Step-0 foundation. **Group B docs** — `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` was rewritten by the parent BEFORE this batch (queues Variant B Step 1).

**EIGHTY-SIXTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ZERO `prisma db push`, ZERO `migrate reset`, ZERO drops, ZERO dev-data deletes, ZERO AI/model spend, ZERO deploy pushes. Pure documentation + pure-foundation-code (the Step-0 libs are isolated new files; no existing file mutated except their own creation). The parent does ONE commit covering the Step-0 code + this doc batch + ping-pong sync, under the standard end-of-session pattern. NO new memory file created; zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session).
- **NEXT session (Variant B Step 1):** **WILL run `prisma db push`** — but ONLY after (1) presenting the §3 delta for explicit director approval AND (2) claiming the schema-change-in-flight flag in-session immediately before the push. The delta is ADDITIVE (nullable `CanvasNode` cols AI 1 never references + a brand-new `CLREntry` table + a nullable `Project.nicheSlug`); run the Rule 23 Change Impact Audit (classify Additive) first; never `migrate reset` against prod. Release the flag immediately after the push. The diagnostic's AI spend (a later Step-1 sub-step) is gated behind the explicit "Build niche rulebook" cost-confirm button — never auto-run.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the W#1 continuity primer `docs/KEYWORD_CLUSTERING_PRIMER.md` + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` + `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` + the rest of the `Workflow 1 AI V2/` package + `src/lib/variant-b/{types,carrier-dedup,rulebook}.ts` (+ their `.test.ts`) + `docs/MULTI_WORKFLOW_PROTOCOL.md` + the memory directory + the `./catch-up-workflow` + `./resume-workflow` + `./resume` scripts.

---

## Branch

**`main`** — entered at start of next session. The (a.143) pick is Variant B ("AI 2") Step 1 — Variant B is additive W#1 (keyword-clustering-surface) work; W#1 is graduated and lives on `main` per Rule 22. **Start command: `./resume-workflow 1`** (reads `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md`, which queues Variant B Step 1) — OR `./resume` (reads THIS file) — OR `./catch-up-workflow 1` (the Rule 33 graduated-W#1 re-entry). Verify with `git branch --show-current` immediately after entry; should be `main`. If you're on a `workflow-N-<slug>` branch, STOP and surface to the director.

**Expected branch state on entry** (after this session's end-of-session commit — the Step-0 code + this doc batch — on `main` + syncs): **`main` and `workflow-2-competition-scraping` are BOTH at the doc-batch SHA.** **Verify with `git log origin/main..HEAD --oneline` showing EMPTY** (the normal graduated-workflow steady state). `git status` clean apart from historical untracked .zip + .html artifacts at repo root. If `git log origin/main..HEAD` is NOT empty at entry, something did not sync as expected — investigate before coding.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- **`Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` — read FULLY, the FIRST read** (the approved plan: §1 decisions log, §2 live-code findings, §3 the GATED schema delta, §4 the ordered build, §5 safety/blast-radius, §6 non-negotiables, §8 the reviewer-round-2 placement corrections, §9 the wrap-up/resume spec).
- `Workflow 1 AI V2/README.md`, `variantB-technical-spec.md`, `variantB-binding-addendum.md` (precedence: addendum > spec > primer), and `rulebook-v0.2.md` (authority for all funnel rules/ordering).
- **`docs/MULTI_WORKFLOW_PROTOCOL.md`** — the single-schema-owner coordination rules; confirm no other workflow holds the schema-change-in-flight flag before claiming it.
- **`src/lib/variant-b/rulebook.ts` + `carrier-dedup.ts` + `types.ts` (+ their `.test.ts`)** — the Step-0 code Step 1 builds ON (the seed reads `rulebook.ts`; the assembler unions it with DB rows; the comment-only "feeds the assembler" correction lands here).
- `docs/DATA_CATALOG.md` (for the Rule 23 Change Impact Audit against the §3 delta).
- `docs/KEYWORD_CLUSTERING_PRIMER.md` (the W#1 continuity primer — the map of W#1's real surfaces incl. the canvas/rebuild route + the model registry).
- `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` (read fully — the canonical small/stable artifact; NO v2 bump shipped this session).
- `docs/HANDOFF_PROTOCOL.md` Rule 3 (code wins over docs) + Rule 9 (deploy gate) + Rule 14f (forced-picker) + Rule 18 (mid-build Read-It-Back) + Rule 22 (graduated-tool re-entry) + Rule 23 (Change Impact Audit) + Rule 25 (multi-workflow) + Rule 26 + Rule 27 (verification) + Rule 30 (Session bookends) + Rule 31 + §4 Step 4b extended template.
- `docs/ROADMAP.md` — the (a.143) Variant B entry + the W#1 row + the total-roadmap summary.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-19-a (this session — the surface-cue-must-not-outrank-descriptors lesson) + §Entry 2026-05-31 (the TOP-TIER SLIP).
- **All existing memory files** — esp. `feedback_plan_output_shape_before_building.md` (plan the schema delta + any new visible surface WITH the director first), `feedback_no_fabricated_instructions.md` (Variant B Step 1 is the director's explicitly-named next task; do not invent scope; P-63 Phase 3 is FUTURE), `feedback_browser_first_ai_with_server_migration.md` (VB's run loop is browser-side), `feedback_deferred_items_registry.md`, `feedback_default_to_recommendation.md` / `feedback_recommendation_style.md`, `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md`, `feedback_session_bookends_plain_summary.md`, `feedback_destructive_ops_confirmation.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; the FIRST read is `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` (read it FULLY).** **This session runs on `main` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

Today's task: return to Workflow #1 (Keyword Clustering) to build **Variant B ("AI 2") — Step 1: the GATED schema delta** (then continue the Variant B build order). This is a graduated-tool re-entry session (Rule 22), NOT a transition session. Variant B is the new intent-driven keyword→funnel pipeline added ALONGSIDE Manual / AI 1 for A/B testing on identical input — it MUST be byte-for-byte non-disruptive to Manual and AI 1.

**Session goal ((a.143) = Variant B Step 1 — the GATED schema delta + the start of the build):** apply the §3 schema delta (nullable `CanvasNode` cols `zone/stage/verticalRank/siblingOrder/isSpine/variantBMeta` + a new `CLREntry` table + a nullable `Project.nicheSlug`) — **GATED: present it for my explicit approval AND claim the schema-owner flag immediately before the push, never earlier.** After the schema: seed the universal rulebook from `src/lib/variant-b/rulebook.ts` into `CLREntry` (idempotent seed), build `rulebook-assembly.ts` (the runtime read-path — the union of universal code ∪ DB niche + approved-candidate rows), then the "Build niche rulebook" diagnostic behind its cost-confirm button + the minimal candidate approve/reject list. Then continue the build order as time allows (plan §4).

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: main   (W#1 is graduated and lives on main; Variant B is additive W#1 work)

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: EMPTY — main and workflow-2 are BOTH at the 2026-06-19-a doc-batch SHA.
#   Nothing is held back. If NOT empty, something did not sync as expected — investigate before coding.
```

If `git branch --show-current` shows anything other than `main`, run `./catch-up-workflow 1` (or `git checkout main`).

**Plan-the-shape-first (before coding):** per Rule 14f + `feedback_plan_output_shape_before_building`, present the EXACT §3 schema delta to me and get explicit approval BEFORE any `prisma db push`. Also confirm WITH me, before building the assembler + diagnostic: (a) the niche-slug provisioning UX (where `Project.nicheSlug` is first entered — project settings vs the AI 2 first-run dialog, plan §7 Q5); (b) the diagnostic's cost-forecast + confirm UX shape (the "Build niche rulebook" button — what the cost preview shows). Do NOT start coding the schema until I approve the delta; do NOT run the diagnostic's AI spend without the cost-confirm gate.

**Fix/build shape (Step 1):** ① Rule 23 Change Impact Audit on the §3 delta (classify Additive; confirm against `DATA_CATALOG.md`) → ② present the delta + get approval → ③ claim the schema-change-in-flight flag in the ROADMAP "Current Active Tools" table → ④ `prisma db push` (no migrations dir) → ⑤ flip the flag back to No. Then: `seed-rulebook.ts` (idempotent seed of `rulebook.ts` constants as `scope="universal"` `CLREntry` rows) → **`rulebook-assembly.ts` (THE runtime read-path — a pure-function core with a thin DB adapter; `node --test`-covered with synthetic DB rows)** → `diagnostic.ts` + a thin route under `src/app/api/.../variant-b/` (the cost-confirm "Build niche rulebook" flow) → the minimal candidate approve/reject list. Apply the queued comment-only correction in `rulebook.ts` ("read these directly" → "feeds the assembler"). **Honor the four locked resolutions + the non-negotiables (no growing-canvas loop; browser-side execution; reuse `useKeywords.bulkImport`, `/canvas/rebuild`, the model registry; NO embeddings).**

**Forced-picker shape (before coding):** the schema-delta approval is the load-bearing Rule 14f picker (present the delta, get explicit go-ahead). The niche-slug-UX + diagnostic-cost-UX confirmations are Rule 14f pickers. The §4 Step 1c next-pick at end-of-session is a Rule 14f picker.

**Schema-change-in-flight flag:** **NO at entry → FLIPS to Yes in-session, immediately before the gated `prisma db push`, then back to No after.** Never claim it earlier; confirm no other workflow holds it before claiming (single-schema-owner serialization per `docs/MULTI_WORKFLOW_PROTOCOL.md`). The delta is ADDITIVE (nullable cols + a brand-new table + a nullable col); never `migrate reset` against prod.

**Test coverage decision:** `node --test` per pure lib (mirror `operation-applier.test.ts`) — the assembler especially gets pure-function coverage with synthetic DB rows. Decide deeper coverage (Playwright E2E for the toggle → clone → run → rebuild path) WITH me as the build progresses; the schema + seed + assembler step is verified by tsc + node:test + a director check of the seeded rows.

**Scoreboard targets** (re-establish the aggregate baseline this session — it was not re-run during the planning session):

- Root tsc clean (expect green; Step-0 libs already clean for variant-b — confirm the whole tree)
- Extension tsc SKIPPED per Rule 27 (Variant B is a W#1 web-app + lib change, not extension-side)
- Extension `npm test` = 915 (UNCHANGED unless unexpectedly touched)
- `src/lib node:test` — the full aggregate INCLUDING the new variant-b suites (carrier-dedup 17 + rulebook 22 already on disk + the new assembler suite) — re-run to lock the exact number
- `npm run build` route count — re-run to lock the baseline; the thin variant-b diagnostic route will add +1 when it lands
- Check 6 Playwright per Rule 27 (decide WITH me — the schema/seed/assembler step is likely covered by node:test + a director check; the E2E lands with the toggle + run-loop later in the build)

**Deploy mechanics:** the Variant B Step-1 schema change follows the standard Rule 9 deploy gate + push pattern (after the gated `prisma db push` + the code: commit on `main` → push origin/main → ping-pong sync to `workflow-2-competition-scraping` → end-of-session doc-batch). **The schema change is the gated step — get explicit approval before the push.** NO extension build expected. Director verification: confirm on the live DB that the new columns + `CLREntry` table exist and the universal rulebook seeded.

**Group A docs to update at session end:** ROADMAP header bump + the (a.143) status note (Step 1 progress) + the W#1 row (Last Session + Next Session + the schema-flag note — flip it back to No after the push) + CHAT_REGISTRY header bump (209th session) + DOCUMENT_MANIFEST header + register the new `src/lib/variant-b/` Step-1 files + CORRECTIONS_LOG header (+ a NEW §Entry only if notable) + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite. (HANDOFF_PROTOCOL header bump only if a rule changes.)

**Group B docs to update at session end:** `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (queue the next Variant B step) + `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` (v2 bump IF the schema delta lands — register the new `CanvasNode` cols + `CLREntry` + `Project.nicheSlug`) + `docs/DATA_CATALOG.md` (register the new Variant B data items) + `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` (flip the §4 Step-1 items from ⬜ to ✅ as they land; append-only build notes if useful).

**Standing carry-overs into this session:**

- **(a.143) = Variant B ("AI 2") Step 1 (the GATED schema delta + the start of the build)** — plan + approve the delta first, then seed + assembler + diagnostic. On `main`.
- **(a.142) = W#1 H-1 slice 4 (before-state enrichment + the History context fix)** — DEFERRED but OPEN, queued behind Variant B.
- **(a.139) = W#1 H-1 (the action-history + undo epic)** — slices 1 + 2 + 3 done; slice 4 + the per-action undo engine deferred behind Variant B.
- **W#1 M-2 — ✅ DONE 2026-06-03-h** + **W#2 — ✅ COMPLETE 2026-06-03-h (residue fully retired)** + **P-63 Phase 2 / P-64 — ✅ DONE 2026-06-03-g.**
- **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) — FUTURE; do NOT start unprompted.**
- **The deferred W#2 Archive/Data-Contract split** — held until W#3 needs to read W#2 data; do NOT author now.
- **P-62** — the Workflow-11 surveillance card + page (future-workflow; NOT a near-term item).

---

## Why this pointer was written this way (debug aid)

- **(a.143) = Variant B Step 1 is the PICK because the director EXPLICITLY chose it** — the Variant B plan was approved in principle and Step 0 was built + tested during the 2026-06-19-a planning session, and the director directed a clean continuity wrap-up queuing Variant B Step 1. §4 Step 1c did NOT fire (the director named the task).
- **The branch is `main`** — W#1 is graduated and lives on `main` per Rule 22; Variant B is additive W#1 work. Use `./resume-workflow 1` (or `./resume` / `./catch-up-workflow 1`); verify the branch immediately.
- **NOTHING is held ahead of main.** The Step-0 code + this doc batch commit directly on `main` + ping-pong-sync; so `git log origin/main..HEAD` is EMPTY at entry.
- **THE FIRST ACTION IS GATED.** Step 1 starts with the schema delta — but the `prisma db push` is gated on (1) explicit director approval of §3 AND (2) the schema-owner flag claimed in-session immediately before the push. The flag was deliberately left "No" at the end of the planning session — do NOT claim it earlier.
- **STEP 0 IS ALREADY DONE.** `src/lib/variant-b/{types,carrier-dedup,rulebook}.ts` are built + tested + committed; Step 1 builds ON them (the seed reads `rulebook.ts`; the assembler unions it with DB rows).
- **VARIANT B IS NON-DISRUPTIVE BY DESIGN.** New code under `src/lib/variant-b/` + `components/variant-b/`; nullable schema cols AI 1 never reads + a brand-new isolated `CLREntry` table + a nullable `Project.nicheSlug`. Do NOT modify `auto-analyze-v3.ts`, `operation-applier.ts`, or `AutoAnalyze.tsx`.
- **H-1 slice 4 is DEFERRED, not dropped.** It stays OPEN in the polish backlog (the (a.142) task), queued behind Variant B's first build.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.143.alt1) W#1 H-1 slice 4 (before-state enrichment + the History context fix)** — the DEFERRED action-history fix (the (a.142) task); pick this up instead if the director re-prioritizes the History work ahead of Variant B. On `main`.
- **(a.143.alt2) W#1 H-1 the per-action undo engine** — depends on slice 4's before-state, so it comes after slice 4. On `main`.
- **(a.143.alt3) W#1 M-1 server-side migrations** (Main Terms / Terms In Focus / Auto-Analyze checkpoint → server-side per the "pick up on any device" principle; canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` M-1.a/b/c). On `main`.
- **(a.143.alt4) W#1 M-3 validation-retry telemetry** (instrument the late-run validation-retry rate; telemetry-only first). On `main`.
- **(a.143.alt5) W#1 LOW polish bundle** (L-1..L-5 — small low-priority items; a quick W#1 win if the director wants something lighter). On `main`.
- **(a.143.alt6) P-63 Phase 3** (the OpenAI/ChatGPT + Google Gemini provider adapters — a FUTURE task; ONLY if the director explicitly wants a non-Anthropic model live AND supplies that provider's API/SDK docs). On `workflow-2-competition-scraping`.
