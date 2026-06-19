# Next session

**Written:** 2026-06-19-e (`session_2026-06-19-e_w1-variant-b-step4-toggle` — **W#1 (Keyword Clustering) — VARIANT B ("AI 2") STEP 4 COMPLETE + DEPLOYED + DIRECTOR REAL-CHROME-VERIFIED — the Manual/AI 1/AI 2 three-way toggle + idempotent keyword-clone + persistence is LIVE on vklf.com. This is the FIRST user-visible Variant B surface — it WIRES the (previously inert) `VariantBAutoAnalyze.tsx` overlay to a launch point + makes AI 2 reachable.** Committed on `main` (build `8896b92` + a same-session re-sync fix `b7dfdd5`), pushed to origin/main + ping-pong-synced to `workflow-2-competition-scraping` — both branches end at `b7dfdd5`. This file now queues **Variant B ("AI 2") — Step 5: `materialize.ts` (the finished Topic tree → `/canvas/rebuild` payload)** — the step that lets an AI 2 run actually LAND on the canvas. **§4 Step 1c forced-picker NOT fired — the continuation is named by the plan `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` §4 → (a.147) RECOMMENDED-NEXT = VARIANT B STEP 5.** **The next session RUNS ON `main`; start command `./resume-workflow 1` (or bare `./resume`).**)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This session is `session_2026-06-19-e` — the FIFTH session of 2026-06-19 (suffix `-e`); the FIRST was `-a` (planning + Step-0), `-b` (Step 1 schema), `-c` (Step 2 the 7 pure libs), `-d` (Step 3 the run-loop). **Next session: keep trusting the harness `currentDate`; if it is still 2026-06-19 the next suffix is `-f`; if it has rolled forward use the new date with NO suffix. Do NOT regress to an earlier suffix and do NOT invent a suffix ahead of the harness.** The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session.

> ⚠️ **BRANCH: next session runs on `main`.** The (a.147) pick is Variant B ("AI 2") Step 5 — Variant B is additive W#1 (keyword-clustering-surface) work; W#1 is graduated and lives on `main` per Rule 22. **Start command: `./resume-workflow 1`** (reads `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md`, which queues Variant B Step 5) — OR `./resume` (reads THIS file, which mirrors the same launch prompt) — OR `./catch-up-workflow 1` (the Rule 33 graduated-W#1 re-entry — switches to `main` + prints `docs/KEYWORD_CLUSTERING_PRIMER.md`). Confirm `git branch --show-current` shows `main` immediately after entry. If you're on a `workflow-N-<slug>` branch, STOP and surface to the director.

> ⚠️ **STEP 5 WRITES THE CANVAS — PLAN THE SHAPE WITH THE DIRECTOR FIRST.** `materialize.ts` is the step that takes the finished AI 2 funnel and writes it to the canvas. Per Rule 14f + `feedback_plan_output_shape_before_building`, present the materialize→rebuild behaviour (how a re-run diffs against the existing AI 2 canvas, what `deleteNodeIds` is passed, how the >50%-shrink guard surfaces to the user) and get the director's go-ahead BEFORE coding. The pure-logic core wants `node --test`; the run→materialize→rebuild path wants a real-Chrome/Playwright walkthrough — decide WITH the director.

> ⚠️ **STEP 4 IS DONE + DEPLOYED + VERIFIED — do NOT rebuild it.** The three-way toggle (`page.tsx` `mode: 'manual'|'ai1'|'ai2'`), the workflow-aware `?workflow=` APIs (via `src/lib/kc-workflow.ts`), the AI 2 workspace mirror + keyword-clone + Re-sync (via `src/lib/variant-b/keyword-sync.ts`), and the live mount of `VariantBAutoAnalyze.tsx` are all built + committed (`8896b92` + `b7dfdd5`) + on the live site + director-verified. **Step 5 builds ON this — it wires the overlay's `onComplete` toward `materialize.ts`; it does not re-implement the toggle or the overlay.**

> ⚠️ **NO SCHEMA CHANGE EXPECTED — the schema-owner flag STAYS No.** The §3 Variant B schema delta already LANDED 2026-06-19-b (the 6 nullable `CanvasNode` cols + `CLREntry` + `Project.nicheSlug`). Step 5's `materialize.ts` WRITES those existing nullable columns through the existing `/canvas/rebuild` route — it should need no new schema. Do NOT claim the schema-change-in-flight flag unless a genuinely new schema need surfaces (it should not).

> ⚠️ **VARIANT B MUST BE BYTE-FOR-BYTE NON-DISRUPTIVE to Manual and AI 1.** All new code lives under `src/lib/variant-b/` + `components/variant-b/`; the `?workflow=` API param defaults to AI 1 so every existing caller is unchanged; the keyword-clone uses a SEPARATE `keyword-clustering-vb` `ProjectWorkflow` namespace — AI 1's keywords + canvas are untouched. `materialize.ts` must write ONLY under the VB `projectWorkflowId`. Do NOT edit `auto-analyze-v3.ts`, `operation-applier.ts`, or `AutoAnalyze.tsx`.

> ⚠️ **H-1 SLICE 4 IS DEFERRED, still OPEN — do NOT lose it.** The previously-queued W#1 task — H-1 slice 4 (action-history before-state enrichment + the History context fix) + the per-action undo engine — is DEFERRED, NOT cancelled. It remains OPEN in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 and is the (a.142) task, queued behind Variant B.

> ⚠️ **W#2 IS COMPLETE — do NOT reopen it.** W#2 (Competition Scraping) graduated 2026-06-03 and its entire residue is formally retired won't-do. Do NOT author new W#2 work unless the director explicitly asks.

---

## What we did this session (in plain terms)

We turned AI 2 on.

**There's now a third button — "AI 2" — next to Manual and AI 1 on the keyword screen.** Each button has a little tooltip explaining what it does. Clicking "AI 2" opens AI 2's own workspace: its own keyword list, its own canvas, and the "run" screen we built last session.

**The first time you switch a project to AI 2, we copy your keyword list over for you** (and show a small blue notice telling you we did), so AI 1 and AI 2 stay completely independent. After that, a "Re-sync from AI 1" button lets you pull across any new keywords you've added on the AI 1 side — it shows you how many it's about to add and asks you to confirm first. It only ADDS; it never deletes.

**It remembers your choice per project, across devices** — pick AI 2 on your laptop and it's still AI 2 when you open the same project on another machine.

**It's live on the real site and you checked it yourself.** During that check you found one bug — the "Re-sync" button wasn't actually adding keywords — and we fixed it the same session and re-deployed. That's exactly what the hybrid check is for: the automated tests cover the mechanical logic, and your eyes-on check catches the things only a real browser can.

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (the (a.143)/(a.145)/(a.146)/(a.147) Variant B entries + the W#1 row + the total-roadmap summary) + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (the W#1 live backlog, incl. H-1) + `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` (the approved Variant B plan; §4 Step-4 status flipped this session) + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (the W#1 pointer queuing Variant B Step 5).

- **(a.147) = VARIANT B ("AI 2") Step 5 — `materialize.ts` (finished Topic tree → `/canvas/rebuild` payload)** — **NEXT SESSION (see below). GATED — plan the materialize→rebuild shape WITH the director first.** On `main`. NO schema change needed.
- **(a.146) = VARIANT B ("AI 2") Step 4 — the Manual/AI 1/AI 2 three-way toggle + keyword-clone + persistence** — ✅ DONE + DEPLOYED + director real-Chrome-verified 2026-06-19-e (AI 2 is now reachable; the first user-visible Variant B surface). On `main`.
- **(a.145) = VARIANT B ("AI 2") Step 3 — the client run-loop (pure run-engine + overlay)** — ✅ DONE 2026-06-19-d (built + deployed inert). The (a.145) umbrella ("Step 3+ the gated visible phase") stays OPEN as Steps 5-6 + the diagnostic remain. On `main`.
- **(a.144) = VARIANT B ("AI 2") Step 2 — the remaining pure pipeline libs** — ✅ DONE 2026-06-19-c (all 7 built + tested). On `main`.
- **(a.143) = VARIANT B ("AI 2") — the full multi-session build** — IN PROGRESS; Steps 0-4 are COMPLETE; Steps 5-6 + the AI-spend diagnostic + the candidate approve/reject list remain. Stays OPEN. On `main`.
- **(a.142) = W#1 H-1 slice 4 (before-state enrichment + the History context fix)** — **DEFERRED but OPEN**, queued behind Variant B. On `main`.
- **(a.139) = W#1 H-1 (the action-history + undo epic)** — ADVANCED, NOT closed. Slices 1 + 2 + 3 done; slice 4 (the (a.142) pick) + the per-action undo engine remain, deferred behind Variant B. On `main`.
- **W#1 M-2 — ✅ DONE 2026-06-03-h** + **W#2 — ✅ COMPLETE 2026-06-03-h (residue fully retired)** + **P-63 Phase 2 / P-64 — ✅ DONE 2026-06-03-g** + **P-63 Phase 1 — ✅ DONE 2026-06-03-f** + **P-50 — ✅ DONE 2026-06-03-e** + **P-43 — ✅ RESOLVED 2026-06-03-d.**
- **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) — FUTURE.** Fired only when the director wants a non-Anthropic model live + supplies that provider's API docs. NOT a near-term item.
- **W#1's remaining live polish backlog** — after H-1: M-1 (3 server-side migrations), M-3 (validation-retry telemetry), L-1..L-5 low, C-1..C-7 carry-overs, Z-1 explicitly-last, P-1 passive prereq. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`. On `main`.
- **The deferred W#2 Archive/Data-Contract split + finalized-HRL Data Capture Interview** — held until W#3 starts and needs to read W#2 data. NOT a blocker.
- **(P-62, under Workflow 11)** "Post Launch Optimization & Surveillance" card + page — future-workflow.

## What we'll do next session (in plain terms)

1. **First we agree on what "saving an AI 2 result to the canvas" looks like — together, before any code.** Specifically: when you re-run AI 2, how the new result merges with what's already on the AI 2 canvas, and the safeguard that stops an accidental run from wiping most of your canvas.
2. **Then we build the piece that writes the result to the canvas.** AI 2 already produces a finished funnel in memory; this step takes that funnel and lays it out on the AI 2 canvas using the same safe save path AI 1 already uses (with the same anti-wipe guard).
3. **After that, the comparison screen.** A separate read-only tab that runs the same keyword list through both engines and shows the differences side by side.
4. **The remaining gated extras** — the optional one-time "Build niche rulebook" AI step and the approve/reject list — stay gated and only get built when you ask.

## What's still left in the total roadmap (in plain terms)

- **W#1 Variant B ("AI 2") — the new second analysis engine, IN PROGRESS, the (a.143)/(a.147) pick.** Plan approved; the entire internal logic engine, the run screen, AND the third "AI 2" button are now built + live; next is making an AI 2 result land on the canvas (planned WITH you first), then the comparison screen. On `main`.
- **W#1 H-1 (action history + undo) — IN PROGRESS but DEFERRED behind Variant B, the (a.139) epic.** Slices 1–3 done; slice 4 (the (a.142) pick) makes the recorded changes read in full context; the per-action Undo comes after. On `main`.
- **W#1's other polish** — M-1 (move a few things off the browser onto the server), M-3 (retry-rate telemetry), plus low-priority items. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`.
- **W#2 (Competition Scraping) — ✅ COMPLETE.** Graduated + every item shipped or formally retired.
- **P-63 (central AI-model registry) — Phase 2 ✅ DONE + live; Phase 3 (add ChatGPT + Gemini) is a future task** fired when you want a non-Anthropic model and give us its docs. **P-64 (drag-reorder) ✅ DONE.**
- **The deferred W#2 Data Contract** — held until W#3 needs to read W#2 data; NOT a blocker.
- **P-62 (NEW capture)** — the Workflow-11 surveillance card + page. Future-workflow.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started. W#3 kickoff is also the trigger to author the deferred W#2 Data Contract.

---

## Status of last session

**W#1 VARIANT B ("AI 2") STEP 4 COMPLETE + DEPLOYED + DIRECTOR REAL-CHROME-VERIFIED — the Manual/AI 1/AI 2 three-way toggle is LIVE — 2026-06-19-e.** AI 2 is now reachable: the first user-visible Variant B surface, wiring the previously-inert overlay to a launch point. Committed on `main` (build `8896b92` + a same-session re-sync fix `b7dfdd5`), pushed to origin/main + ping-pong-synced to `workflow-2-competition-scraping`.

**Session shape:**

- **What was built (Step 4 — the toggle that turns AI 2 on):** `page.tsx` `aiMode: boolean → mode: 'manual'|'ai1'|'ai2'` (three buttons + hover tooltips; persists the per-project choice in `UserPreference` `kc_variant_{projectId}`, remembering all three modes; `KeywordWorkspace` remounted via `key` across the AI 1↔AI 2 boundary for clean data isolation). The keyword + canvas APIs made workflow-aware via an ADDITIVE `?workflow=` query param (allowlist `keyword-clustering`|`keyword-clustering-vb`, default = AI 1 so every existing caller is byte-for-byte unchanged): `keywords/route.ts` + `canvas/route.ts` + `canvas/rebuild/route.ts` + `canvas/nodes/route.ts` + `canvas/pathways/route.ts`, fronted by the new pure helper `src/lib/kc-workflow.ts` (`pickKcWorkflow`/`resolveKcWorkflow`, path-traversal-rejecting allowlist, +4 node:test); `useKeywords`/`useCanvas` take an optional `workflow`. The AI 2 mode of `KeywordWorkspace` = a full workspace mirror scoped to `keyword-clustering-vb` (keyword list + canvas + Run AI 2 + Re-sync) with a first-activation auto-clone from AI 1 (only when VB empty) + blue notice + an add-only "Re-sync from AI 1" with a `window.confirm` count preview, via the pure `src/lib/variant-b/keyword-sync.ts` (+5 node:test); it mounts `VariantBAutoAnalyze`. New CSS `.ws-vb-bar`/`.ws-vb-notice`.
- **SIX director shape-decisions (Rule 14f, all reversible):** (1) toggle labels "Manual/AI 1/AI 2" + hover tooltips; (2) first-time keyword copy = auto-copy then notice (NOT confirm-first); (3) re-sync = button + confirm-preview of the count; (4) persistence remembers all three modes per project (extends the plan's "A"|"B" to manual/ai1/ai2); (5) the AI 2 screen = a full workspace mirror, not a minimal launch screen; (6) verification approach (Rule 27 picker) = HYBRID — node:test for the mechanical logic + director real-Chrome for visual/integration.
- **ONE bug, caught by the director's real-Chrome verification + fixed same-session (`b7dfdd5`):** re-sync silently failed because the keyword API returns `volume` as Int but `bulkImport` did `(r.volume||'').trim()` (`.trim()` on a number throws) — fix `String(r.volume ?? '').trim()` + widen `BulkImportRow.volume` to `string|number`. The first-activation clone was unaffected (direct POST; server coerces). This is the hybrid verification working as intended (logged informationally in CORRECTIONS_LOG), NOT a process slip.

**Schema-change-in-flight flag: NO at entry → STAYED NO entire session → NO at exit (Step 4 reads/writes the existing columns + `UserPreference`; the §3 delta already landed 2026-06-19-b). NEXT session (Step 5) STAYS No — `materialize.ts` writes the existing nullable columns through `/canvas/rebuild`.**

**Rule 14f pickers fired this session:** the six Step-4 shape-decisions + the Rule 27 verification-approach picker (hybrid) + the Rule 9 deploy gate fired TWICE (initial deploy + fix redeploy, director approved both). §4 Step 1c did NOT fire — the next task is the named continuation (Step 5).

**DEFERRED items (Rule 26):** TaskList returned ZERO tasks; the H-1 slice 4 (a.142) item remains the one open DEFERRED item tracked in the polish backlog, queued behind Variant B; no NEW `DEFERRED:` task created this session.

**EXIT baselines (Step 4 built + DEPLOYED + verified; pre-deploy + post-fix verification all green):** root `tsc --noEmit` clean (exit 0); ext tsc clean; `npm run build` ✓ compiled successfully, **78 routes UNCHANGED** (the `?workflow=` param is additive to existing routes); `src/lib node:test` = **1654 → 1663 (+9)** (kc-workflow +4, variant-b/keyword-sync +5); extension `npm test` 915/915 UNCHANGED; Playwright NOT re-run (the existing chromium suite uses a static stub-page harness that does not cover the authenticated keyword-clustering page — the hybrid's automated leg is the +9 node:tests; director real-Chrome verification PASSED all checklist items incl. re-sync after the fix).

**ONE new INFORMATIONAL CORRECTIONS_LOG §Entry this session** — the re-sync volume-coercion bug found in director real-Chrome verification + fixed same-session, framed as the HYBRID VERIFICATION WORKING AS INTENDED (the manual leg caught what node:test could not), NOT a top-tier slip. **NO new memory file this session.**

**Non-Group-A repo changes** — NEW `src/lib/kc-workflow.ts` (26 LOC) + `kc-workflow.test.ts` (23 LOC, +4 node:test) + NEW `src/lib/variant-b/keyword-sync.ts` (38 LOC) + `keyword-sync.test.ts` (43 LOC, +5 node:test); MODIFIED `…/keyword-clustering/page.tsx` + `…/keyword-clustering/components/KeywordWorkspace.tsx` + `…/keyword-clustering/components/workspace.css` + `src/hooks/useKeywords.ts` + `src/hooks/useCanvas.ts` + 5 routes (`keywords/route.ts` + `canvas/route.ts` + `canvas/rebuild/route.ts` + `canvas/nodes/route.ts` + `canvas/pathways/route.ts`) = 14 files (+450 / −88); build commit `8896b92` + fix `b7dfdd5` (range `68f009c..b7dfdd5`). NO schema change, NO new route, NO extension source change. **Group B docs** — `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (full rewrite — queues Variant B Step 5) + `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` §4 (the Step-4 keys flipped ⬜→✅ with `8896b92`/`b7dfdd5` + the workflow-aware-API approach note + the six shape-decisions recorded).

**NINETIETH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ZERO `prisma db push`, ZERO migrations, ZERO AI/model spend (the AI 2 surface is now reachable but the director's verification was UI/integration, not a live SSE analysis run — no model spend fired). TWO director-approved deploy pushes (`8896b92` then `b7dfdd5` → origin/main + ping-pong; the first user-visible Variant B surface + the re-sync fix). The parent does ONE end-of-session commit covering this doc batch + ping-pong sync. NO new memory file created; zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session).
- **NEXT session (Variant B Step 5 — `materialize.ts`):** **NO `prisma db push` expected** (`materialize.ts` writes the existing nullable columns through `/canvas/rebuild`); do NOT claim the schema-owner flag unless a genuinely new schema need surfaces. The rebuild write is atomic + honors the >50%-shrink guard via `deleteNodeIds` — `materialize.ts` must write ONLY under the VB `projectWorkflowId`, never AI 1's. The AI-spend diagnostic is a later GATED sub-step behind the "Build niche rulebook" cost-confirm button — never auto-run. A real-site deploy of materialize follows the standard Rule 9 deploy gate + the Rule 27 director real-Chrome verification. No drops, no `migrate reset` against prod, ever.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the W#1 continuity primer `docs/KEYWORD_CLUSTERING_PRIMER.md` + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` + `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` + the rest of the `Workflow 1 AI V2/` package + `src/lib/variant-b/{types,carrier-dedup,rulebook,seed-rulebook,rulebook-assembly,intent-enumeration,topic-labeling,conservative-merge,hierarchy,ordering,placement,provenance,reorg-sweeps,prompts,run-engine,keyword-sync}.ts` (+ their `.test.ts`) + `src/lib/kc-workflow.ts` (+`.test.ts`) + `…/components/variant-b/VariantBAutoAnalyze.tsx` + `…/keyword-clustering/page.tsx` + `…/keyword-clustering/components/KeywordWorkspace.tsx` + `prisma/schema.prisma` + `docs/MULTI_WORKFLOW_PROTOCOL.md` + the memory directory + the `./catch-up-workflow` + `./resume-workflow` + `./resume` scripts.

---

## Branch

**`main`** — entered at start of next session. The (a.147) pick is Variant B ("AI 2") Step 5 — Variant B is additive W#1 (keyword-clustering-surface) work; W#1 is graduated and lives on `main` per Rule 22. **Start command: `./resume-workflow 1`** (reads `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md`, which queues Variant B Step 5) — OR `./resume` (reads THIS file) — OR `./catch-up-workflow 1` (the Rule 33 graduated-W#1 re-entry). Verify with `git branch --show-current` immediately after entry; should be `main`. If you're on a `workflow-N-<slug>` branch, STOP and surface to the director.

**Expected branch state on entry** (after this session's end-of-session commit — this doc batch — on `main` + syncs): **`main` and `workflow-2-competition-scraping` are BOTH at the doc-batch SHA.** **Verify with `git log origin/main..HEAD --oneline` showing EMPTY** (the normal graduated-workflow steady state). `git status` clean apart from historical untracked .zip + .html artifacts at repo root. If `git log origin/main..HEAD` is NOT empty at entry, something did not sync as expected — investigate before coding.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- **`Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` §4 — read the build order** (Steps 0-4 are now ✅; Step 5 `materialize.ts` is the next ⬜ item, with its per-surface contract) + §5 safety (the >50%-shrink guard) + §6 non-negotiables + §1 decisions (incl. D-CMP comparison-is-a-separate-view + D-SHELLS / D-MISFIT).
- **`src/app/api/projects/[projectId]/canvas/rebuild/route.ts`** (the atomic `withRetry($transaction)` rebuild write path materialize feeds — now `?workflow=`-aware after Step 4) + **`src/lib/canvas-rebuild-guard.ts`** (the >50%-shrink blanking guard `G1_SHRINK_THRESHOLD = 0.5` + its `node --test`) + **`src/lib/canvas-layout.ts` / `reconciliation.ts`** (the pure render/heal helpers if VB renders on the canvas).
- **`src/lib/variant-b/run-engine.ts`** (the pure engine — `foldIntentsToTree` produces the finished `Topic` tree that materialize consumes; read the `Topic`/`Funnel` shapes in `src/lib/variant-b/types.ts`) + **`…/components/variant-b/VariantBAutoAnalyze.tsx`** (the overlay whose `onComplete` Step 5 wires to materialize).
- **`src/lib/kc-workflow.ts`** + **`src/hooks/useCanvas.ts`** (the `?workflow=keyword-clustering-vb` scoping path Step 5 writes through) + **`…/keyword-clustering/components/KeywordWorkspace.tsx`** (the AI 2 workspace that triggers + renders the materialized canvas).
- `docs/KEYWORD_CLUSTERING_PRIMER.md` (the W#1 continuity primer — the map of W#1's real surfaces incl. the canvas/rebuild route + the model registry + `UserPreference`).
- `docs/HANDOFF_PROTOCOL.md` Rule 3 (code wins over docs) + Rule 9 (deploy gate) + Rule 14f (forced-picker) + Rule 18 (mid-build Read-It-Back) + Rule 22 (graduated-tool re-entry) + Rule 25 (multi-workflow) + Rule 26 + Rule 27 (verification — materialize is a visible canvas write, so director real-Chrome verification applies) + Rule 30 (Session bookends) + Rule 31 + §4 Step 4b extended template.
- `docs/ROADMAP.md` — the (a.143)/(a.145)/(a.146)/(a.147) Variant B entries + the W#1 row + the total-roadmap summary.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-19-e (the re-sync volume-coercion / hybrid-verification informational entry) + §Entry 2026-06-19-c (the newer-authority-wins / verticalRank-is-computed lesson) + §Entry 2026-06-19-b (the dedup-key-namespace lesson) + §Entry 2026-06-19-a (the surface-cue-must-not-outrank-descriptors lesson) + §Entry 2026-05-31 (the TOP-TIER SLIP).
- **All existing memory files** — esp. `feedback_plan_output_shape_before_building.md` (plan the materialize→rebuild shape WITH the director first — THE governing memory for this phase), `feedback_browser_first_ai_with_server_migration.md` (the VB run loop is browser-side; materialize runs client-side then writes through the existing route), `feedback_playwright_for_repeatable_walkthroughs.md` (fire the Playwright picker before the run→materialize→rebuild walkthrough), `feedback_no_fabricated_instructions.md` (Step 5 is the named continuation; do not invent scope; P-63 Phase 3 is FUTURE), `feedback_deferred_items_registry.md`, `feedback_default_to_recommendation.md` / `feedback_recommendation_style.md`, `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md`, `feedback_session_bookends_plain_summary.md`, `feedback_destructive_ops_confirmation.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; the FIRST read is `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` §4 (the build order).** **This session runs on `main` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

Today's task: return to Workflow #1 (Keyword Clustering) to build **Variant B ("AI 2") — Step 5: `materialize.ts` (the finished Topic tree → `/canvas/rebuild` payload)**. This is a graduated-tool re-entry session (Rule 22), NOT a transition session. Variant B is the new intent-driven keyword→funnel pipeline added ALONGSIDE Manual / AI 1 for A/B testing on identical input — it MUST be byte-for-byte non-disruptive to Manual and AI 1.

**Session goal ((a.147) = Variant B Step 5):** Step 4 (the Manual/AI 1/AI 2 toggle + keyword-clone + persistence) shipped + deployed + was director-verified 2026-06-19-e — AI 2 is now reachable and its run-loop overlay is mounted, but an AI 2 run's finished funnel has nowhere to land yet. Step 5 builds `src/lib/variant-b/materialize.ts` (finished `Topic` tree → `/canvas/rebuild` payload: minted `stableId`, `parentId` by stableId, `title`, `kwPlacements`, `linkedKwIds`, computed `intentFingerprint`, the new nullable columns; diff vs B's existing canvas + pass `deleteNodeIds` on re-runs; write atomically under the VB `projectWorkflowId` via the existing `/canvas/rebuild` route — now `?workflow=keyword-clustering-vb`-aware after Step 4 — honoring the >50%-shrink guard) and wires the overlay's `onComplete` to it. Then Step 6 the A/B comparison view (a SEPARATE read-only tab — NOT a 4th toggle value). The AI-spend `diagnostic.ts` + thin route (behind "Build niche rulebook") + the candidate approve/reject list are ALSO gated.

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: main   (W#1 is graduated and lives on main; Variant B is additive W#1 work)

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: EMPTY — main and workflow-2 are BOTH at the 2026-06-19-e doc-batch SHA.
#   Nothing is held back. If NOT empty, something did not sync as expected — investigate before coding.
```

If `git branch --show-current` shows anything other than `main`, run `./catch-up-workflow 1` (or `git checkout main`).

**Plan-the-shape-first (BEFORE coding — this is the governing constraint of the phase):** per Rule 14f + `feedback_plan_output_shape_before_building`, materialize WRITES the canvas and is GATED. BEFORE writing any code, present to me: how a re-run diffs against the existing AI 2 canvas (what gets reused vs replaced); exactly what `deleteNodeIds` is computed + passed; how the >50%-shrink guard surfaces (does the user see a confirm, or is the run blocked?). Get my explicit go-ahead, then build. Do NOT ship a unilateral v1.

**Fix/build shape (Step 5):** build `src/lib/variant-b/materialize.ts` as a PURE function (`Topic` tree + existing-canvas snapshot → rebuild payload + `deleteNodeIds`) so it is `node --test`-covered; the thin wiring (overlay `onComplete` → materialize → `useCanvas` rebuild scoped to `keyword-clustering-vb`) is the only impure glue. Reuse the EXISTING `/canvas/rebuild` route + `canvas-rebuild-guard.ts` — do NOT re-implement the write path or the shrink guard. Write ONLY under the VB `projectWorkflowId` — AI 1's canvas is never touched. Honor the non-negotiables + the four locked resolutions + D-SHELLS / D-MISFIT + the four run-loop shape-decisions + the six Step-4 shape-decisions.

**Forced-picker shape (before coding):** the materialize→rebuild shape confirmation is a Rule 14f picker — present + get explicit approval before building. The §4 Step 1c next-pick at end-of-session is a Rule 14f picker (likely Step 6 the comparison tab, or the gated diagnostic if the director re-prioritizes).

**Schema-change-in-flight flag:** **NO at entry → STAYS No** (`materialize.ts` writes the existing nullable columns through `/canvas/rebuild`). Do NOT claim the flag unless a genuinely new schema need surfaces; if one does, present it for approval + claim the flag immediately before the push (single-schema-owner serialization per `docs/MULTI_WORKFLOW_PROTOCOL.md`), then flip back.

**Test coverage decision:** `materialize.ts`'s pure core wants `node --test`; the run → materialize → rebuild path wants a real-Chrome/Playwright walkthrough — fire the Rule 14f Playwright picker WITH me before that 5+ step browser walkthrough per `feedback_playwright_for_repeatable_walkthroughs`. The toggle/clone leg is already director-verified (Step 4); this session's verification focuses on the canvas write.

**Scoreboard targets** (Step 5 adds a pure lib + thin wiring):

- Root `tsc --noEmit` clean (expect green).
- Extension tsc SKIPPED per Rule 27 (Variant B is a W#1 web-app + lib change, not extension-side).
- Extension `npm test` = 915 (UNCHANGED unless unexpectedly touched).
- `src/lib node:test` — 1663 at entry; grows by `materialize.ts`'s tests; re-run to lock.
- `npm run build` route count — 78 at entry; re-run to lock (materialize reuses the existing `/canvas/rebuild` route, so expect 78 UNCHANGED).
- Check 6 Playwright per Rule 27 (decide WITH me — materialize is a visible canvas write, so the E2E walkthrough + director real-Chrome verification apply).

**Deploy mechanics:** materialize makes an AI 2 result LAND on the canvas — a user-visible behaviour — so it deploys under the standard Rule 9 deploy gate + push pattern (commit on `main` → push origin/main → ping-pong sync to `workflow-2-competition-scraping` → end-of-session doc-batch). NO extension build expected. Director real-Chrome verification on vklf.com per Rule 27 for the deployed materialize (running AI 2 + confirming the funnel lands correctly + a re-run diffs correctly).

**Group A docs to update at session end:** ROADMAP header bump + the (a.143)/(a.147) status notes + the W#1 row (Last Session + Next Session) + CHAT_REGISTRY header bump (213th session) + DOCUMENT_MANIFEST header + register `materialize.ts` (+`.test.ts`) + CORRECTIONS_LOG header (+ a NEW §Entry only if notable) + NEXT_SESSION full rewrite. (HANDOFF_PROTOCOL header bump only if a rule changes; CLAUDE_CODE_STARTER header bump if it deploys.)

**Group B docs to update at session end:** `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (queue the next Variant B step — Step 6) + `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` §4 (flip the Step-5 key ⬜→✅ as it lands) + `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` (v2 bump IF a downstream consumer needs the new `CanvasNode` cols + `CLREntry` + `Project.nicheSlug` registered) + `docs/DATA_CATALOG.md` (register the new Variant B data items if/when they need a downstream contract).

**Standing carry-overs into this session:**

- **(a.147) = Variant B ("AI 2") Step 5 (`materialize.ts`)** — plan the materialize→rebuild shape WITH me first; write only under the VB `projectWorkflowId`; honor the shrink guard. On `main`.
- **(a.143) = Variant B ("AI 2") — the full multi-session build** — IN PROGRESS; Steps 0-4 COMPLETE; Steps 5-6 + the diagnostic remain. On `main`.
- **(a.142) = W#1 H-1 slice 4 (before-state enrichment + the History context fix)** — DEFERRED but OPEN, queued behind Variant B.
- **(a.139) = W#1 H-1 (the action-history + undo epic)** — slices 1 + 2 + 3 done; slice 4 + the per-action undo engine deferred behind Variant B.
- **W#1 M-2 — ✅ DONE 2026-06-03-h** + **W#2 — ✅ COMPLETE 2026-06-03-h (residue fully retired)** + **P-63 Phase 2 / P-64 — ✅ DONE 2026-06-03-g.**
- **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) — FUTURE; do NOT start unprompted.**
- **The deferred W#2 Archive/Data-Contract split** — held until W#3 needs to read W#2 data; do NOT author now.
- **P-62** — the Workflow-11 surveillance card + page (future-workflow; NOT a near-term item).

---

## Why this pointer was written this way (debug aid)

- **(a.147) = Variant B Step 5 is the PICK because it is the named continuation of the (a.143) build** — Steps 0-4 (the entire PURE engine + the run-loop + the toggle that makes AI 2 reachable) landed by 2026-06-19-e, and the next item in the plan §4 build order is `materialize.ts` (Step 5). §4 Step 1c did NOT fire (the next task is named by the plan, not chosen).
- **Step 5 is the step that makes an AI 2 result land on the canvas.** Step 4 made AI 2 reachable + deployed it; an AI 2 run now produces a finished funnel in memory but has nowhere to write it — Step 5 wires the overlay's `onComplete` to materialize → the existing `/canvas/rebuild` route.
- **The phase is GATED.** Step 5 writes the canvas, so `feedback_plan_output_shape_before_building` governs — plan the materialize→rebuild shape (diff/delete behaviour + the shrink guard) WITH the director before coding.
- **The branch is `main`** — W#1 is graduated and lives on `main` per Rule 22; Variant B is additive W#1 work. Use `./resume-workflow 1` (or `./resume` / `./catch-up-workflow 1`); verify the branch immediately.
- **NOTHING is held ahead of main.** Step 4 (`8896b92` + `b7dfdd5`) + this doc batch commit directly on `main` + ping-pong-sync; so `git log origin/main..HEAD` is EMPTY at entry.
- **NO SCHEMA CHANGE THIS SESSION.** The §3 delta already landed 2026-06-19-b; `materialize.ts` writes the existing nullable columns through `/canvas/rebuild`. Leave the schema-owner flag No.
- **STEP 4 IS DONE.** The toggle + the workflow-aware APIs + the AI 2 workspace + the overlay mount are built + tested + committed + deployed + director-verified. Step 5 wires the overlay's `onComplete` to materialize; it does not re-implement the toggle or the overlay. Reuse the existing `/canvas/rebuild` route + `canvas-rebuild-guard.ts` — do not re-implement the write path.
- **VARIANT B IS NON-DISRUPTIVE BY DESIGN.** New code under `src/lib/variant-b/` + `components/variant-b/`; the `?workflow=` API param defaults to AI 1 so existing callers are unchanged; materialize writes ONLY under the VB `projectWorkflowId`. Do NOT modify `auto-analyze-v3.ts`, `operation-applier.ts`, or `AutoAnalyze.tsx`.
- **H-1 slice 4 is DEFERRED, not dropped.** It stays OPEN in the polish backlog (the (a.142) task), queued behind Variant B's build.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.147.alt1) Variant B ("AI 2") Step 6 — the A/B comparison view** — a SEPARATE read-only tab; could be built before Step 5 if the director wants the comparison surface first, but it has less to show until materialize lands AI 2 results on the canvas. On `main`.
- **(a.147.alt2) W#1 H-1 slice 4 (before-state enrichment + the History context fix)** — the DEFERRED action-history fix (the (a.142) task); pick this up instead if the director re-prioritizes the History work ahead of Variant B. On `main`.
- **(a.147.alt3) W#1 H-1 the per-action undo engine** — depends on slice 4's before-state, so it comes after slice 4. On `main`.
- **(a.147.alt4) W#1 M-1 server-side migrations** (Main Terms / Terms In Focus / Auto-Analyze checkpoint → server-side per the "pick up on any device" principle; canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` M-1.a/b/c). On `main`.
- **(a.147.alt5) W#1 M-3 validation-retry telemetry** (instrument the late-run validation-retry rate; telemetry-only first). On `main`.
- **(a.147.alt6) P-63 Phase 3** (the OpenAI/ChatGPT + Google Gemini provider adapters — a FUTURE task; ONLY if the director explicitly wants a non-Anthropic model live AND supplies that provider's API/SDK docs). On `main`.
