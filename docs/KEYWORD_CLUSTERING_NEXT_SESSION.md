# W#1 next session — Keyword Clustering

**Written:** 2026-06-19-c (end of the Variant B Step-2 session — ALL 7 remaining PURE pipeline libs are built + `node --test`-covered, completing the Variant B PURE ENGINE; this file now queues **Variant B ("AI 2") — Step 3+: the GATED VISIBLE phase (the client run-loop + overlay first)**). H-1 slice 4 is DEFERRED — see note below. Future W#1 sessions update this file at end-of-session per HANDOFF_PROTOCOL §4 Step 1.

**For:** the next W#1 (Keyword Clustering graduated tool) re-entry session.

**Queued next task:** **VARIANT B ("AI 2") — STEP 3+: the GATED VISIBLE phase, in plan §4 order.** The PURE engine (Steps 0-2) is COMPLETE + test-passing on disk. Step 3+ WIRES it into the keyword-clustering surface — **Step 3 the client run-loop + overlay (`components/variant-b/`, patterned on `AutoAnalyze.tsx`)** → Step 4 the Manual/AI 1/AI 2 three-way toggle + idempotent keyword-clone + persistence → Step 5 `materialize.ts` (finished Topic tree → `/canvas/rebuild` payload) → Step 6 the A/B comparison view (a SEPARATE read-only tab). **EVERY surface in this phase is GATED — plan the shape WITH the director (Rule 14f + `feedback_plan_output_shape_before_building`) BEFORE coding.** The full approved plan + all decisions live in **`Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md`** §4 (the build order) alongside the design package (`README.md`, `variantB-technical-spec.md`, `variantB-binding-addendum.md`, `rulebook-v0.2.md`).

> **✅ STEP 2 COMPLETE (2026-06-19-c):** all 7 remaining pure pipeline libs are built + `node --test`-covered, each taking the `AssembledRulebook` as a parameter — `conservative-merge.ts` (15 ✅), `hierarchy.ts` (7 ✅), `ordering.ts` (7 ✅ — `verticalRank` COMPUTED zone→stage per rulebook v0.2 §10), `placement.ts` (6 ✅ — first-match-by-priority + R11, no-match ⇒ needs-placement queue, never guesses), `provenance.ts` (5 ✅), `reorg-sweeps.ts` (7 ✅ — cadence knob `variantB.reorgCadence` + guaranteed final sweep), `prompts.ts` (7 ✅). Full `src/lib/variant-b` suite = 145 node:test ✅ (+54 over 91); root tsc clean. **The PURE ENGINE is now COMPLETE** (Step 0 foundation + Step 1 schema/seed/assembler + Step 2 all libs). **TWO new LOCKED director decisions:** (D-SHELLS) conservative demand-aware shell generation — NO speculative cross-product shells; (D-MISFIT) placement misfits queue for review, never guess a zone.

> **⚠️ THE NEXT PHASE IS GATED — plan every screen shape WITH the director FIRST.** Step 3+ is visible surfaces (a run-loop overlay, a third toggle button, a comparison screen) PLUS the AI-spend diagnostic. Per Rule 14f + `feedback_plan_output_shape_before_building`, present the audience/sections/depth/placement of every visible surface AND the cost shape of any AI-spend step, get the director's go-ahead, THEN build. Do NOT ship a unilateral v1 screen. (The PURE libs were buildable straight-through; the visible surfaces are NOT.)

> **⚠️ NO SCHEMA CHANGE EXPECTED — the schema-owner flag STAYS No.** The §3 Variant B schema delta already LANDED 2026-06-19-b; Step 3+ reads/writes those existing columns. Do NOT claim the flag this session unless a genuinely new schema need surfaces (it should not).

> **NOTE (2026-06-19-b — H-1 SLICE 4 DEFERRED, still OPEN):** the previously-queued W#1 task — H-1 slice 4 (action-history before-state enrichment + the History context fix) + the per-action undo engine that follows it — is DEFERRED, NOT cancelled. The director chose Variant B as the immediate priority. H-1 slice 4 remains OPEN in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 and is the (a.142) task, queued behind Variant B (see "How to override").

---

## Branch

`main`

W#1 is graduated and lives on `main` per Rule 22. Variant B is additive W#1 (keyword-clustering-surface) work and is built on `main`. Verify with `git branch --show-current` immediately after `./resume-workflow 1`; should be `main`. If you're on a `workflow-N-<slug>` branch, STOP and surface to the director.

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it.
Today's task: return to Workflow #1 (Keyword Clustering) to build **Variant B ("AI 2") — Step 3+: the GATED VISIBLE phase (the client run-loop + overlay first)**. This is a graduated-tool re-entry session (Rule 22), NOT a transition session. Verify branch state with `git branch --show-current` before any doc reads — should be `main`.

Per HANDOFF_PROTOCOL.md Rule 22 (Graduated-Tool Re-Entry Protocol):

1. Run the mandatory start-of-session sequence (Group A docs + branch verification per CLAUDE_CODE_STARTER.md Step 2). **NO schema change is expected this session** — the visible surfaces read/write the existing columns — so you do NOT need to claim the schema-owner flag; still glance at the ROADMAP "Current Active Tools" table to confirm no other workflow holds it.
2. Read the Variant B sources of truth (Group B for this task):
   - **`Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md`** §4 (the build order — Step 2 keys are all ✅; Steps 3-6 are the next ⬜ items with their per-surface contracts) + §5 (safety) + §6 (non-negotiables) + §1 (decisions, incl. D-CMP comparison-is-a-separate-view + the new D-SHELLS / D-MISFIT).
   - `Workflow 1 AI V2/README.md`, `variantB-technical-spec.md`, `variantB-binding-addendum.md` (precedence: addendum > spec), and `rulebook-v0.2.md` (authority for all funnel rules/ordering).
   - The PURE engine already on disk (Step 3+ wires it in, does NOT re-implement it): `src/lib/variant-b/{types,carrier-dedup,rulebook,seed-rulebook,rulebook-assembly,intent-enumeration,topic-labeling,conservative-merge,hierarchy,ordering,placement,provenance,reorg-sweeps,prompts}.ts` (+ their `.test.ts`).
   - **`…/keyword-clustering/components/AutoAnalyze.tsx`** — the AI 1 run-loop overlay the VB run-loop is PATTERNED ON (read it; do NOT modify it) + `…/keyword-clustering/page.tsx` (the `aiMode` two-state toggle that becomes three-state).
3. **Plan EVERY visible-surface shape WITH the director BEFORE coding** (Rule 14f + `feedback_plan_output_shape_before_building`) — this phase is gated. Then build in plan §4 order:
   - **Step 3 — the client run-loop + overlay** (`components/variant-b/`, patterned on `AutoAnalyze.tsx`): state machine (idle/running/paused/review/error/complete), pause/resume/cancel, spend-cap (`evaluateSpendCap`), `localStorage` checkpoint (`vb_checkpoint_{projectId}`), activity log, NDJSON forensic log (`forensic-log.ts`), bounded concurrency (default 6), model picker (`useModelsForMenu('keyword-clustering')`), `ExecutionModeSelect`, cost forecast; fetches via `authFetch` honoring execution mode. Browser-side execution; the server stays a thin SSE proxy.
   - **Step 4 — the Manual/AI 1/AI 2 three-way toggle** (`page.tsx` `aiMode: boolean → 'manual'|'ai1'|'ai2'`, three buttons; route to AI 1's overlay / VB's overlay / manual workspace) + idempotent keyword-clone (`verifyProjectWorkflowAuth(…, 'keyword-clustering-vb')`, clone only when B has zero keywords; a "Re-sync from AI 1" set-difference action) + persistence via `UserPreference` (`kc_variant_{projectId}`).
   - **Step 5 — `materialize.ts`** (finished `Topic` tree → `/canvas/rebuild` payload: minted `stableId`, `parentId` by stableId, `title`, `kwPlacements`, `linkedKwIds`, computed `intentFingerprint`, the new nullable columns; diff vs B's existing canvas + pass `deleteNodeIds` on re-runs; write atomically under the VB `projectWorkflowId`, honoring the >50%-shrink guard). `node --test`-covered.
   - **Step 6 — the A/B comparison view** (a SEPARATE read-only tab/panel — explicitly NOT a 4th toggle value: headline per-batch payload size/cost across the run [flat for AI 2 vs growing for AI 1, from each run's forensic NDJSON] + topic count, max depth, topics per zone, reachable vs dedup volume, multi-topic keyword count; reads existing data only, writes nothing).
   - **ALSO still GATED:** the AI-spend `diagnostic.ts` + its thin route (the "Build niche rulebook" cost-confirm flow) + the candidate approve/reject list (approving flips `candidate`→`approved-candidate` so the assembler picks it up).
4. **Locked resolutions to honor (do NOT re-litigate):**
   - **(1) Runtime read-path = the UNION.** Every pure lib + every prompt-builder receives an `AssembledRulebook` = universal(code `rulebook.ts`) ∪ active-niche ∪ approved-candidate DB `CLREntry` rows. The libs never import niche-aware constants directly — they read the assembled object (built by `rulebook-assembly.ts`, already on disk).
   - **(2) Generous/high-recall intent enumeration** — over-enumeration is acceptable; validators flag UNDER-enumeration (omission) + fabrication; they never penalize over-enumeration and never auto-delete. (Already encoded in `intent-enumeration.ts`.)
   - **(3) Reorg-sweep cadence configurable + guaranteed final sweep** (`variantB.reorgCadence`); sweeps run on the condensed skeleton + one parent-slice — never re-feed the whole tree.
   - **(4) A/B comparison = a SEPARATE read-only view** (its own tab/panel), NOT a fourth value of the Manual / AI 1 / AI 2 control (which stays three-state).
   - **(5) The one non-negotiable:** NO growing-canvas loop — per-batch AI payloads stay small + flat regardless of tree size; never serialize the accumulated tree into an analysis prompt.
   - **(D-SHELLS, locked 2026-06-19-c):** shell generation = the conservative demand-aware default — NO speculative cross-product shells (a shell exists only when a real keyword maps to it OR it is a defined CLR ladder rung). Encoded in `hierarchy.ts`.
   - **(D-MISFIT, locked 2026-06-19-c):** placement misfits queue for review tagged with a misfit type — the tool never assigns a best-guess zone. Encoded in `placement.ts`.
5. **GATED — re-confirm WITH the director before building (Rule 14f):** the ENTIRE Step 3+ visible phase (the run-loop overlay, the three-way toggle + keyword-clone, the comparison tab) PLUS the AI-spend diagnostic + the candidate approve/reject list. Unlike the Step-2 pure libs (which were buildable straight-through), every surface in this phase is gated — plan the shape WITH the director first.
6. Plan the output/coverage shape WITH the director for EVERY visible surface + EVERY AI-spend step per `feedback_plan_output_shape_before_building` — present audience/sections/depth/placement (and cost for the diagnostic), get explicit go-ahead, THEN build. Per `feedback_browser_first_ai_with_server_migration`, add an execution-mode dropdown to the VB run modal now (mirror W#1). For the toggle → clone → run → rebuild walkthrough, fire the Rule 14f Playwright picker per `feedback_playwright_for_repeatable_walkthroughs` before the 5+ step browser verification.

## How to override

If Variant B isn't what you want to do this W#1 session:
- **Edit this file before running `./resume-workflow 1`.** Replace the Variant B references in the `Queued next task` line + `Launch prompt` section with whatever item you want — e.g. resume **H-1 slice 4** (before-state enrichment; the deferred action-history fix) or another item from `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`.
- **OR — tell Claude in your CURRENT session "update KEYWORD_CLUSTERING_NEXT_SESSION.md to queue <task>"** before exiting, and Claude will rewrite this file.
- **OR — use the escape-hatch path** (manual 3-step `cd + git checkout main + claude + paste launch prompt`).

## How items get queued here

Per HANDOFF_PROTOCOL §4 Step 1 W#1-additional-row:
- When the director adds a new W#1 item and picks "do it next session," Claude updates this file with the new task.
- When a W#1 session completes work, the end-of-session protocol picks the next-highest-priority OPEN item (or fires the §4 Step 1c "no obvious next task" forced-picker).

## Why this pointer was written this way (debug aid)

Variant B Step 3+ is the named continuation of the (a.143) build — Steps 0-2 (the entire PURE engine) landed by 2026-06-19-c, and the next item in the plan §4 build order is the GATED VISIBLE phase (the client run-loop + overlay first). The §4 Step 1c forced-picker did NOT fire (the next task is named by the plan, not chosen). The load-bearing difference from the last three sessions: Steps 0-2 were pure libs buildable straight-through, but Step 3+ is visible surfaces + AI spend, so `feedback_plan_output_shape_before_building` governs — plan each screen WITH the director before coding. H-1 slice 4 was an earlier queued task and is deferred (still OPEN). The schema-owner flag is "No" and STAYS No — the visible surfaces read/write the existing columns; the §3 delta already landed 2026-06-19-b.
