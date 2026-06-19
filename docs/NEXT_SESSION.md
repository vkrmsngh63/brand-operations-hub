# Next session

**Written:** 2026-06-19-d (`session_2026-06-19-d_w1-variant-b-step3-run-loop` — **W#1 (Keyword Clustering) — VARIANT B ("AI 2") STEP 3 COMPLETE — the GATED VISIBLE phase BEGINS: the client RUN-LOOP is built + DEPLOYED (INERT) — a PURE run-engine (`run-engine.ts`, 12 node:test ✅) + the run-loop overlay (`VariantBAutoAnalyze.tsx`, 1050 LOC). Committed on `main` + pushed to origin/main (director-approved deploy `8506f28`), but NOTHING imports the overlay yet, so the live site is BYTE-FOR-BYTE UNCHANGED for users.** This file now queues **Variant B ("AI 2") — Step 4: the Manual/AI 1/AI 2 three-way toggle + idempotent keyword-clone + persistence** — the step that WIRES this session's overlay to a launch point + makes AI 2 reachable. **§4 Step 1c forced-picker NOT fired — the continuation is named by the plan `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` §4 → (a.146) RECOMMENDED-NEXT = VARIANT B STEP 4.** **The next session RUNS ON `main`; start command `./resume-workflow 1` (or bare `./resume`).**)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This session is `session_2026-06-19-d` — the FOURTH session of 2026-06-19 (suffix `-d`); the FIRST was `-a` (planning + Step-0), the SECOND `-b` (Step 1 schema), the THIRD `-c` (Step 2 the 7 pure libs). **Next session: keep trusting the harness `currentDate`; if it is still 2026-06-19 the next suffix is `-e`; if it has rolled forward use the new date with NO suffix. Do NOT regress to an earlier suffix and do NOT invent a suffix ahead of the harness.** The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session.

> ⚠️ **BRANCH: next session runs on `main`.** The (a.146) pick is Variant B ("AI 2") Step 4 — Variant B is additive W#1 (keyword-clustering-surface) work; W#1 is graduated and lives on `main` per Rule 22. **Start command: `./resume-workflow 1`** (reads `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md`, which queues Variant B Step 4) — OR `./resume` (reads THIS file, which mirrors the same launch prompt) — OR `./catch-up-workflow 1` (the Rule 33 graduated-W#1 re-entry — switches to `main` + prints `docs/KEYWORD_CLUSTERING_PRIMER.md`). Confirm `git branch --show-current` shows `main` immediately after entry. If you're on a `workflow-N-<slug>` branch, STOP and surface to the director.

> ⚠️ **THE VISIBLE PHASE IS GATED — PLAN THE SHAPE WITH THE DIRECTOR FIRST.** Step 4 changes a visible surface (a third toggle button + a keyword-clone confirmation). Per Rule 14f + `feedback_plan_output_shape_before_building`, present the toggle's placement + persistence behavior + the keyword-clone confirmation flow, and get the director's go-ahead, BEFORE coding. Do NOT unilaterally ship a v1 surface.

> ⚠️ **STEP 3 IS DONE + DEPLOYED but INERT — do NOT rebuild it.** `src/lib/variant-b/run-engine.ts` (12 node:test) + `…/components/variant-b/VariantBAutoAnalyze.tsx` (the overlay) are built + committed (`8506f28`) + on the live site, but nothing imports the overlay yet. **Step 4 WIRES the overlay to a launch point; it builds ON the overlay, it does not re-implement it.** Pattern the toggle change on the existing `aiMode` two-state control — read it, then extend it to three-state.

> ⚠️ **NO SCHEMA CHANGE EXPECTED — the schema-owner flag STAYS No.** The §3 Variant B schema delta already LANDED 2026-06-19-b. Step 4 reads/writes those existing columns + `UserPreference` (`kc_variant_{projectId}`); it should need no new schema. Do NOT claim the schema-change-in-flight flag unless a genuinely new schema need surfaces (it should not).

> ⚠️ **VARIANT B MUST BE BYTE-FOR-BYTE NON-DISRUPTIVE to Manual and AI 1.** All new code lives under `src/lib/variant-b/` + `components/variant-b/`; the three-state toggle ROUTES to AI 1's existing overlay / the new VB overlay / the manual workspace without modifying AI 1's path. Do NOT edit `auto-analyze-v3.ts`, `operation-applier.ts`, or `AutoAnalyze.tsx` (the VB overlay was patterned on `AutoAnalyze.tsx`, not a fork of it). The keyword-clone creates a SEPARATE `keyword-clustering-vb` `ProjectWorkflow` namespace — AI 1's keywords are untouched.

> ⚠️ **H-1 SLICE 4 IS DEFERRED, still OPEN — do NOT lose it.** The previously-queued W#1 task — H-1 slice 4 (action-history before-state enrichment + the History context fix) + the per-action undo engine — is DEFERRED, NOT cancelled. It remains OPEN in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 and is the (a.142) task, queued behind Variant B.

> ⚠️ **W#2 IS COMPLETE — do NOT reopen it.** W#2 (Competition Scraping) graduated 2026-06-03 and its entire residue is formally retired won't-do. Do NOT author new W#2 work unless the director explicitly asks.

---

## What we did this session (in plain terms)

We built the "run" screen for AI 2 — the screen you click to start an AI 2 analysis.

**It's the twin of the AI 1 screen you already use.** It has the same Start / Pause / Resume / Cancel controls, a spending limit (off by default, but you can switch it on and change it any time, even mid-run), a cost preview that shows you the per-step and total cost before anything runs, and a saved checkpoint so a run survives a page refresh. We deliberately made it look identical to the AI 1 screen so there's nothing new to learn.

**Underneath it we built the engine that drives the whole pipeline.** That's the piece that takes the AI's answers and runs them through all the logic we built in the last three sessions (merge, nest, order, place, tidy, bookkeeping) to produce the finished funnel. It's fully automated-test-covered.

**It's safely on the live site, but not connected to any button yet.** Nothing you see or click has changed. The next step adds the third "AI 2" button that turns it on — that's a visible change, so we'll plan it WITH you first.

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (the (a.143)/(a.145)/(a.146) Variant B entries + the W#1 row + the total-roadmap summary) + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (the W#1 live backlog, incl. H-1) + `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` (the approved Variant B plan; §4 Step-3 status flipped this session) + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (the W#1 pointer queuing Variant B Step 4).

- **(a.146) = VARIANT B ("AI 2") Step 4 — the Manual/AI 1/AI 2 three-way toggle + keyword-clone + persistence** — **NEXT SESSION (see below). GATED — plan the toggle + clone shape WITH the director first.** On `main`. NO schema change needed.
- **(a.145) = VARIANT B ("AI 2") Step 3 — the client run-loop (pure run-engine + overlay)** — ✅ DONE 2026-06-19-d (built + deployed inert). The (a.145) umbrella ("Step 3+ the gated visible phase") stays OPEN as Steps 4-6 + the diagnostic remain. On `main`.
- **(a.144) = VARIANT B ("AI 2") Step 2 — the remaining pure pipeline libs** — ✅ DONE 2026-06-19-c (all 7 built + tested). On `main`.
- **(a.143) = VARIANT B ("AI 2") — the full multi-session build** — IN PROGRESS; Steps 0-3 are COMPLETE; Steps 4-6 + the AI-spend diagnostic + the candidate approve/reject list remain. Stays OPEN. On `main`.
- **(a.142) = W#1 H-1 slice 4 (before-state enrichment + the History context fix)** — **DEFERRED but OPEN**, queued behind Variant B. On `main`.
- **(a.139) = W#1 H-1 (the action-history + undo epic)** — ADVANCED, NOT closed. Slices 1 + 2 + 3 done; slice 4 (the (a.142) pick) + the per-action undo engine remain, deferred behind Variant B. On `main`.
- **W#1 M-2 — ✅ DONE 2026-06-03-h** + **W#2 — ✅ COMPLETE 2026-06-03-h (residue fully retired)** + **P-63 Phase 2 / P-64 — ✅ DONE 2026-06-03-g** + **P-63 Phase 1 — ✅ DONE 2026-06-03-f** + **P-50 — ✅ DONE 2026-06-03-e** + **P-43 — ✅ RESOLVED 2026-06-03-d.**
- **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) — FUTURE.** Fired only when the director wants a non-Anthropic model live + supplies that provider's API docs. NOT a near-term item.
- **W#1's remaining live polish backlog** — after H-1: M-1 (3 server-side migrations), M-3 (validation-retry telemetry), L-1..L-5 low, C-1..C-7 carry-overs, Z-1 explicitly-last, P-1 passive prereq. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`. On `main`.
- **The deferred W#2 Archive/Data-Contract split + finalized-HRL Data Capture Interview** — held until W#3 starts and needs to read W#2 data. NOT a blocker.
- **(P-62, under Workflow 11)** "Post Launch Optimization & Surveillance" card + page — future-workflow.

## What we'll do next session (in plain terms)

1. **First we agree on what the third button looks like — together, before any code.** This is the part that turns AI 2 on: a third button (Manual / AI 1 / AI 2) on the keyword screen. Because it's a visible change, we plan its placement and behaviour WITH you first, then build.
2. **Then we wire the run screen to that button.** Clicking "AI 2" opens the run screen we built this session. The first time you use AI 2 on a project, we copy your keyword list into a separate AI 2 workspace (so AI 1 and AI 2 stay independent) and remember your AI-1-vs-AI-2 choice for that project.
3. **After that, the result lands on the canvas.** Step 5 takes the finished funnel and writes it to the canvas using the same safe save path AI 1 already uses (with the same safeguard against accidental wipes).
4. **Finally the comparison screen.** A separate read-only tab that runs the same keyword list through both engines and shows the differences side by side.

## What's still left in the total roadmap (in plain terms)

- **W#1 Variant B ("AI 2") — the new second analysis engine, IN PROGRESS, the (a.143)/(a.146) pick.** Plan approved; the entire internal logic engine + the run screen are now built; next is the third button that turns it on (planned WITH you first). On `main`.
- **W#1 H-1 (action history + undo) — IN PROGRESS but DEFERRED behind Variant B, the (a.139) epic.** Slices 1–3 done; slice 4 (the (a.142) pick) makes the recorded changes read in full context; the per-action Undo comes after. On `main`.
- **W#1's other polish** — M-1 (move a few things off the browser onto the server), M-3 (retry-rate telemetry), plus low-priority items. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`.
- **W#2 (Competition Scraping) — ✅ COMPLETE.** Graduated + every item shipped or formally retired.
- **P-63 (central AI-model registry) — Phase 2 ✅ DONE + live; Phase 3 (add ChatGPT + Gemini) is a future task** fired when you want a non-Anthropic model and give us its docs. **P-64 (drag-reorder) ✅ DONE.**
- **The deferred W#2 Data Contract** — held until W#3 needs to read W#2 data; NOT a blocker.
- **P-62 (NEW capture)** — the Workflow-11 surveillance card + page. Future-workflow.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started. W#3 kickoff is also the trigger to author the deferred W#2 Data Contract.

---

## Status of last session

**W#1 VARIANT B ("AI 2") STEP 3 COMPLETE — the client run-loop built + DEPLOYED INERT — 2026-06-19-d.** The gated visible phase begins: a PURE run-engine + the run-loop overlay, committed on `main` + pushed to origin/main (director-approved), but nothing imports the overlay yet — ZERO user-visible change.

**Session shape:**

- **What was built (Step 3 — the client run-loop, in two parts):** (1) `src/lib/variant-b/run-engine.ts` (252 LOC) — the PURE, `node --test`-covered orchestration core: `carrierToCandidates` (parse one carrier's intent-enumeration response → candidate topics), `foldIntentsToTree` (deterministic merge→hierarchy→order→placement→vertical-rank→reorg-sweep→provenance), `computeFunnelStats`, `buildCarrierBatches`; honors the flat per-batch payload + D-SHELLS + D-MISFIT + the UNION read-path via `assembleRulebook` — **12 node:test ✅**; (2) `…/keyword-clustering/components/variant-b/VariantBAutoAnalyze.tsx` (1050 LOC) — the run-loop overlay patterned on AI 1's `AutoAnalyze.tsx` + REUSING its `aa-*` CSS (SSE intent-enumeration one flat call per carrier, direct + server execution modes via `ExecutionModeSelect` + `authFetch`, bounded concurrency default 6, pause/resume/cancel, a `vb_checkpoint_{projectId}` localStorage checkpoint, ForensicLog NDJSON download, spend cap + live cost forecast).
- **FOUR director shape-decisions (Rule 14f gated planning, all reversible):** (1) mirror AI 1's panel; (2) the spending limit is OFF by default + editable mid-run; (3) cost is shown as a per-step + total breakdown before Start; (4) "pause after each batch" is choosable at launch AND flippable mid-run.
- **Reachability (the load-bearing fact):** the overlay is NOT yet wired to any launch point — Step 4 (the toggle) does that; `onComplete` is the seam for Step 5 (materialize). The deployed code is INERT — ZERO user-visible change on the live site.

**Schema-change-in-flight flag: NO at entry → STAYED NO entire session → NO at exit (Step 3 reads/writes the existing columns; the §3 delta already landed 2026-06-19-b). NEXT session (Step 4) STAYS No — the toggle reads/writes the existing columns + `UserPreference`.**

**Rule 14f pickers fired this session:** the four run-loop shape-decisions (mirror AI 1; spend-limit OFF default; cost per-step+total breakdown; pause-after-each-batch flippable) + the Rule 9 deploy gate (director approved "Deploy now (recommended)"). §4 Step 1c did NOT fire — the next task is the named continuation (Step 4).

**DEFERRED items (Rule 26):** TaskList returned ZERO tasks; the H-1 slice 4 (a.142) item remains the one open DEFERRED item tracked in the polish backlog, queued behind Variant B; no NEW `DEFERRED:` task created this session.

**EXIT baselines (the run-loop built + DEPLOYED INERT; pre-deploy + post-merge verification all green):** root `tsc --noEmit` clean (exit 0); ext tsc clean; `npm run build` ✓ compiled successfully, **78 routes UNCHANGED**; `src/lib node:test` = **1654/1654 pass, 0 fail** (**+12** new run-engine tests; the `src/lib/variant-b` subset 145→157); extension `npm test` 915/915 UNCHANGED; Playwright SKIPPED per Rule 27 (the surface is not reachable yet — no browser walkthrough possible until Step 4 wires the launch point).

**NO new CORRECTIONS_LOG §Entry this session** — ZERO top-tier slips + no notable correction (header bump only). ONE optional informational observation, deliberately NOT logged: `src/lib/variant-b/conservative-merge.ts` is flagged binary/`data` by the `file` command (a stray non-text byte, pre-existing, tsc-clean + tests pass) — a tooling-ergonomics note only (`grep` skips it without `-a`), not a defect. **NO new memory file this session.**

**Non-Group-A repo changes** — NEW `src/lib/variant-b/run-engine.ts` (252 LOC) + `run-engine.test.ts` (182 LOC, 12 node:test) + NEW `src/app/projects/[projectId]/keyword-clustering/components/variant-b/VariantBAutoAnalyze.tsx` (1050 LOC) = 3 files, all new (+1484 LOC); build commit `8506f28` (range `03fd6cf..8506f28`). NO schema change, NO new route, NO extension source change. **Group B docs** — `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (full rewrite — queues Variant B Step 4) + `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` §4 (the Step-3 run-loop key flipped ⬜→✅ with `run-engine.ts` 12 node:test + the overlay; the four shape-decisions recorded).

**EIGHTY-NINTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ZERO `prisma db push`, ZERO migrations, ZERO AI/model spend (the overlay is built but never run — no live SSE call fired this session). ONE director-approved deploy push (`8506f28` → origin/main; inert code, no visible change). The parent does ONE end-of-session commit covering this doc batch + ping-pong sync. NO new memory file created; zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session).
- **NEXT session (Variant B Step 4 — the three-way toggle + keyword-clone):** **NO `prisma db push` expected** (the toggle reads/writes the existing columns + `UserPreference`); do NOT claim the schema-owner flag unless a genuinely new schema need surfaces. The keyword-clone is idempotent (clone only when B has zero keywords) and creates a SEPARATE `keyword-clustering-vb` namespace — it never mutates AI 1's keywords. The AI-spend diagnostic is a later GATED sub-step behind the "Build niche rulebook" cost-confirm button — never auto-run. A real-site deploy of the wired toggle follows the standard Rule 9 deploy gate + the Rule 27 director real-Chrome verification (the toggle is the first user-visible Variant B surface). No drops, no `migrate reset` against prod, ever.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the W#1 continuity primer `docs/KEYWORD_CLUSTERING_PRIMER.md` + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` + `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` + the rest of the `Workflow 1 AI V2/` package + `src/lib/variant-b/{types,carrier-dedup,rulebook,seed-rulebook,rulebook-assembly,intent-enumeration,topic-labeling,conservative-merge,hierarchy,ordering,placement,provenance,reorg-sweeps,prompts,run-engine}.ts` (+ their `.test.ts`) + `…/components/variant-b/VariantBAutoAnalyze.tsx` + `prisma/schema.prisma` + `docs/MULTI_WORKFLOW_PROTOCOL.md` + the memory directory + the `./catch-up-workflow` + `./resume-workflow` + `./resume` scripts.

---

## Branch

**`main`** — entered at start of next session. The (a.146) pick is Variant B ("AI 2") Step 4 — Variant B is additive W#1 (keyword-clustering-surface) work; W#1 is graduated and lives on `main` per Rule 22. **Start command: `./resume-workflow 1`** (reads `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md`, which queues Variant B Step 4) — OR `./resume` (reads THIS file) — OR `./catch-up-workflow 1` (the Rule 33 graduated-W#1 re-entry). Verify with `git branch --show-current` immediately after entry; should be `main`. If you're on a `workflow-N-<slug>` branch, STOP and surface to the director.

**Expected branch state on entry** (after this session's end-of-session commit — this doc batch — on `main` + syncs): **`main` and `workflow-2-competition-scraping` are BOTH at the doc-batch SHA.** **Verify with `git log origin/main..HEAD --oneline` showing EMPTY** (the normal graduated-workflow steady state). `git status` clean apart from historical untracked .zip + .html artifacts at repo root. If `git log origin/main..HEAD` is NOT empty at entry, something did not sync as expected — investigate before coding.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- **`Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` §4 — read the build order** (Step 3 is now ✅; Step 4 is the next ⬜ item, with its per-surface contract) + §5 safety + §6 non-negotiables + §1 decisions (incl. D-CMP comparison-is-a-separate-view + D-SHELLS / D-MISFIT).
- **`…/keyword-clustering/page.tsx`** — the `aiMode: boolean` two-state toggle that becomes three-state (`'manual'|'ai1'|'ai2'`) + the `KeywordWorkspace` prop wiring; read it BEFORE extending it.
- **`…/keyword-clustering/components/variant-b/VariantBAutoAnalyze.tsx`** (this session's overlay — Step 4 mounts it behind the new "AI 2" button) + `…/keyword-clustering/components/AutoAnalyze.tsx` (the AI 1 overlay the toggle routes to; read it, do NOT modify it).
- **`src/lib/variant-b/run-engine.ts`** (the pure engine the overlay drives) + the rest of `src/lib/variant-b/*` (the whole engine) — Step 4 wires the overlay's `onComplete` toward Step 5 (`materialize.ts`, not yet built).
- `src/lib/auth.ts` — `verifyProjectWorkflowAuth(req, projectId, 'keyword-clustering-vb')` (resolves-or-creates the VB `ProjectWorkflow` row — drives the idempotent keyword-clone) + `src/hooks/useKeywords.ts` `bulkImport` (the clone path).
- `docs/KEYWORD_CLUSTERING_PRIMER.md` (the W#1 continuity primer — the map of W#1's real surfaces incl. the canvas/rebuild route + the model registry + `useKeywords.bulkImport` + `UserPreference`).
- `docs/HANDOFF_PROTOCOL.md` Rule 3 (code wins over docs) + Rule 9 (deploy gate) + Rule 14f (forced-picker) + Rule 18 (mid-build Read-It-Back) + Rule 22 (graduated-tool re-entry) + Rule 25 (multi-workflow) + Rule 26 + Rule 27 (verification — the toggle is the first user-visible VB surface, so director real-Chrome verification applies) + Rule 30 (Session bookends) + Rule 31 + §4 Step 4b extended template.
- `docs/ROADMAP.md` — the (a.143)/(a.145)/(a.146) Variant B entries + the W#1 row + the total-roadmap summary.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-19-c (the newer-authority-wins / verticalRank-is-computed lesson) + §Entry 2026-06-19-b (the dedup-key-namespace lesson) + §Entry 2026-06-19-a (the surface-cue-must-not-outrank-descriptors lesson) + §Entry 2026-05-31 (the TOP-TIER SLIP).
- **All existing memory files** — esp. `feedback_plan_output_shape_before_building.md` (plan the visible toggle + clone shape WITH the director first — THE governing memory for this phase), `feedback_browser_first_ai_with_server_migration.md` (the VB run loop is browser-side; the execution-mode dropdown is already in the overlay), `feedback_playwright_for_repeatable_walkthroughs.md` (fire the Playwright picker before the toggle→clone→run→rebuild walkthrough), `feedback_no_fabricated_instructions.md` (Step 4 is the named continuation; do not invent scope; P-63 Phase 3 is FUTURE), `feedback_deferred_items_registry.md`, `feedback_default_to_recommendation.md` / `feedback_recommendation_style.md`, `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md`, `feedback_session_bookends_plain_summary.md`, `feedback_destructive_ops_confirmation.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; the FIRST read is `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` §4 (the build order).** **This session runs on `main` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

Today's task: return to Workflow #1 (Keyword Clustering) to build **Variant B ("AI 2") — Step 4: the Manual/AI 1/AI 2 three-way toggle + idempotent keyword-clone + persistence**. This is a graduated-tool re-entry session (Rule 22), NOT a transition session. Variant B is the new intent-driven keyword→funnel pipeline added ALONGSIDE Manual / AI 1 for A/B testing on identical input — it MUST be byte-for-byte non-disruptive to Manual and AI 1.

**Session goal ((a.146) = Variant B Step 4):** Step 3 (the run-loop overlay `VariantBAutoAnalyze.tsx` + the pure `run-engine.ts`) shipped 2026-06-19-d but is INERT — nothing imports the overlay. Step 4 WIRES it to a launch point + makes AI 2 reachable, in plan §4 order — `…/keyword-clustering/page.tsx` `aiMode: boolean → 'manual'|'ai1'|'ai2'` (three buttons; route to AI 1's `AutoAnalyze.tsx` overlay / the new `VariantBAutoAnalyze.tsx` overlay / the manual workspace; persist the AI-1-vs-AI-2 choice in `UserPreference` `kc_variant_{projectId}`) + first-AI-2-activation idempotent keyword-clone via `verifyProjectWorkflowAuth(…, 'keyword-clustering-vb')` (clone only when B has zero keywords) + a "Re-sync from AI 1" set-difference action (by keyword string). Then Step 5 `materialize.ts` (finished Topic tree → `/canvas/rebuild` payload; diff + `deleteNodeIds` on re-runs; honor the >50%-shrink guard) → Step 6 the A/B comparison view (a SEPARATE read-only tab — NOT a 4th toggle value). The AI-spend `diagnostic.ts` + thin route (behind "Build niche rulebook") + the candidate approve/reject list are ALSO gated.

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: main   (W#1 is graduated and lives on main; Variant B is additive W#1 work)

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: EMPTY — main and workflow-2 are BOTH at the 2026-06-19-d doc-batch SHA.
#   Nothing is held back. If NOT empty, something did not sync as expected — investigate before coding.
```

If `git branch --show-current` shows anything other than `main`, run `./catch-up-workflow 1` (or `git checkout main`).

**Plan-the-shape-first (BEFORE coding — this is the governing constraint of the phase):** per Rule 14f + `feedback_plan_output_shape_before_building`, the toggle is a visible surface and is GATED. BEFORE writing any UI code, present to me: the three-way toggle's placement + the order of the buttons + the persistence behaviour; the keyword-clone confirmation flow (what the user sees the first time they click AI 2 on a project); and the "Re-sync from AI 1" affordance. Get my explicit go-ahead, then build. Do NOT ship a unilateral v1 surface.

**Fix/build shape (Step 4):** extend the existing `aiMode` two-state control in `page.tsx` to three-state — read it first; do NOT fork it. Mount the EXISTING `VariantBAutoAnalyze.tsx` overlay behind the new "AI 2" button (it is already built — Step 4 wires it, it does not re-implement it). Route the "AI 1" button to the existing `AutoAnalyze.tsx` (read it, do NOT modify it). The keyword-clone creates a SEPARATE `keyword-clustering-vb` `ProjectWorkflow` namespace via `verifyProjectWorkflowAuth` — AI 1's keywords are never mutated. Honor the non-negotiables + the four locked resolutions + D-SHELLS / D-MISFIT + the four run-loop shape-decisions (mirror AI 1; spend limit OFF default; cost per-step+total breakdown; pause-after-each-batch flippable).

**Forced-picker shape (before coding):** the toggle + clone shape confirmation is a Rule 14f picker — present + get explicit approval before building. The §4 Step 1c next-pick at end-of-session is a Rule 14f picker (likely Step 5 materialize, or Step 6 the comparison tab if Step 4 finishes with room).

**Schema-change-in-flight flag:** **NO at entry → STAYS No** (the toggle reads/writes the existing columns + `UserPreference`). Do NOT claim the flag unless a genuinely new schema need surfaces; if one does, present it for approval + claim the flag immediately before the push (single-schema-owner serialization per `docs/MULTI_WORKFLOW_PROTOCOL.md`), then flip back.

**Test coverage decision:** the toggle → clone → run → rebuild path wants a Playwright E2E walkthrough — fire the Rule 14f Playwright picker WITH me before that 5+ step browser walkthrough per `feedback_playwright_for_repeatable_walkthroughs`; `materialize.ts` (Step 5) wants `node --test`.

**Scoreboard targets** (this session adds a route/page change so the `npm run build` route count + the full aggregate re-lock):

- Root `tsc --noEmit` clean (expect green).
- Extension tsc SKIPPED per Rule 27 (Variant B is a W#1 web-app + lib change, not extension-side).
- Extension `npm test` = 915 (UNCHANGED unless unexpectedly touched).
- `src/lib node:test` — 1654 at entry; grows by `materialize.ts`'s tests (Step 5); re-run to lock.
- `npm run build` route count — 78 at entry; re-run to lock (the toggle adds no route, but a clone/persist API path might add +N — confirm).
- Check 6 Playwright per Rule 27 (decide WITH me — the toggle is the first user-visible VB surface, so the E2E walkthrough + director real-Chrome verification apply).

**Deploy mechanics:** the toggle is the first USER-VISIBLE Variant B surface — it deploys under the standard Rule 9 deploy gate + push pattern (commit on `main` → push origin/main → ping-pong sync to `workflow-2-competition-scraping` → end-of-session doc-batch). NO extension build expected. Director real-Chrome verification on vklf.com per Rule 27 for the deployed toggle (the first time the director will SEE AI 2).

**Group A docs to update at session end:** ROADMAP header bump + the (a.143)/(a.146) status notes + the W#1 row (Last Session + Next Session) + CHAT_REGISTRY header bump (212th session) + DOCUMENT_MANIFEST header + register any new files + CORRECTIONS_LOG header (+ a NEW §Entry only if notable) + NEXT_SESSION full rewrite. (HANDOFF_PROTOCOL header bump only if a rule changes; CLAUDE_CODE_STARTER header bump if it deploys.)

**Group B docs to update at session end:** `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (queue the next Variant B step) + `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` §4 (flip the Step-4 key ⬜→✅ as it lands) + `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` (v2 bump IF a downstream consumer needs the new `CanvasNode` cols + `CLREntry` + `Project.nicheSlug` registered) + `docs/DATA_CATALOG.md` (register the new Variant B data items if/when they need a downstream contract).

**Standing carry-overs into this session:**

- **(a.146) = Variant B ("AI 2") Step 4 (the three-way toggle + keyword-clone + persistence)** — plan the toggle + clone shape WITH me first; the diagnostic's AI spend is gated. On `main`.
- **(a.143) = Variant B ("AI 2") — the full multi-session build** — IN PROGRESS; Steps 0-3 COMPLETE; Steps 4-6 + the diagnostic remain. On `main`.
- **(a.142) = W#1 H-1 slice 4 (before-state enrichment + the History context fix)** — DEFERRED but OPEN, queued behind Variant B.
- **(a.139) = W#1 H-1 (the action-history + undo epic)** — slices 1 + 2 + 3 done; slice 4 + the per-action undo engine deferred behind Variant B.
- **W#1 M-2 — ✅ DONE 2026-06-03-h** + **W#2 — ✅ COMPLETE 2026-06-03-h (residue fully retired)** + **P-63 Phase 2 / P-64 — ✅ DONE 2026-06-03-g.**
- **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) — FUTURE; do NOT start unprompted.**
- **The deferred W#2 Archive/Data-Contract split** — held until W#3 needs to read W#2 data; do NOT author now.
- **P-62** — the Workflow-11 surveillance card + page (future-workflow; NOT a near-term item).

---

## Why this pointer was written this way (debug aid)

- **(a.146) = Variant B Step 4 is the PICK because it is the named continuation of the (a.143) build** — Steps 0-3 (the entire PURE engine + the run-loop) landed by 2026-06-19-d, and the next item in the plan §4 build order is the three-way toggle (Step 4). §4 Step 1c did NOT fire (the next task is named by the plan, not chosen).
- **Step 4 is the step that turns AI 2 ON.** This session's overlay is built + deployed but INERT (nothing imports it); Step 4 wires it to a launch point + makes AI 2 reachable — that is the load-bearing difference from Step 3.
- **The phase is GATED.** Step 4 is a visible surface (a toggle + a clone confirmation), so `feedback_plan_output_shape_before_building` governs — plan the shape WITH the director before coding.
- **The branch is `main`** — W#1 is graduated and lives on `main` per Rule 22; Variant B is additive W#1 work. Use `./resume-workflow 1` (or `./resume` / `./catch-up-workflow 1`); verify the branch immediately.
- **NOTHING is held ahead of main.** Step 3 (`8506f28`) + this doc batch commit directly on `main` + ping-pong-sync; so `git log origin/main..HEAD` is EMPTY at entry.
- **NO SCHEMA CHANGE THIS SESSION.** The §3 delta already landed 2026-06-19-b; Step 4 reads/writes the existing columns + `UserPreference`. Leave the schema-owner flag No.
- **STEP 3 IS DONE.** `run-engine.ts` + `VariantBAutoAnalyze.tsx` are built + tested + committed + deployed inert. Step 4 wires the overlay in; it does not re-implement it. Pattern the toggle on the existing two-state `aiMode` control — read it, then extend it.
- **VARIANT B IS NON-DISRUPTIVE BY DESIGN.** New code under `src/lib/variant-b/` + `components/variant-b/`; the toggle ROUTES to AI 1's path without modifying it; the keyword-clone uses a separate `keyword-clustering-vb` namespace. Do NOT modify `auto-analyze-v3.ts`, `operation-applier.ts`, or `AutoAnalyze.tsx`.
- **H-1 slice 4 is DEFERRED, not dropped.** It stays OPEN in the polish backlog (the (a.142) task), queued behind Variant B's build.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.146.alt1) W#1 H-1 slice 4 (before-state enrichment + the History context fix)** — the DEFERRED action-history fix (the (a.142) task); pick this up instead if the director re-prioritizes the History work ahead of Variant B. On `main`.
- **(a.146.alt2) W#1 H-1 the per-action undo engine** — depends on slice 4's before-state, so it comes after slice 4. On `main`.
- **(a.146.alt3) W#1 M-1 server-side migrations** (Main Terms / Terms In Focus / Auto-Analyze checkpoint → server-side per the "pick up on any device" principle; canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` M-1.a/b/c). On `main`.
- **(a.146.alt4) W#1 M-3 validation-retry telemetry** (instrument the late-run validation-retry rate; telemetry-only first). On `main`.
- **(a.146.alt5) W#1 LOW polish bundle** (L-1..L-5 — small low-priority items; a quick W#1 win if the director wants something lighter). On `main`.
- **(a.146.alt6) P-63 Phase 3** (the OpenAI/ChatGPT + Google Gemini provider adapters — a FUTURE task; ONLY if the director explicitly wants a non-Anthropic model live AND supplies that provider's API/SDK docs). On `workflow-2-competition-scraping`.
