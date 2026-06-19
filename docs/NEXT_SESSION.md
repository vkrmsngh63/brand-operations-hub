# Next session

**Written:** 2026-06-19-c (`session_2026-06-19-c_w1-variant-b-step2-pure-libs` — **W#1 (Keyword Clustering) — VARIANT B ("AI 2") STEP 2 COMPLETE — ALL 7 remaining PURE pipeline libs built + `node --test`-covered (`conservative-merge` · `hierarchy` · `ordering` · `placement` · `provenance` · `reorg-sweeps` · `prompts`) — a PURE-LIB build session (NO schema change, NO deploy, NO AI/model spend).** Each lib takes the assembled rulebook (`rulebook-assembly.ts`) as a parameter, pure + deterministic, byte-for-byte non-disruptive to Manual and AI 1. The Variant B PURE ENGINE is now COMPLETE. Full `src/lib/variant-b` suite = 145 node:test ✅ (+54 over 91); root tsc clean. **§4 Step 1c forced-picker NOT fired — the PURE engine is complete; the continuation is named by the plan → (a.145) RECOMMENDED-NEXT = VARIANT B ("AI 2") STEP 3+ — the GATED VISIBLE phase (run-loop + overlay → three-state toggle + keyword-clone → materialize → /canvas/rebuild → A/B comparison), which re-confirms WITH the director before building.** **The next session RUNS ON `main`; start command `./resume-workflow 1` (or bare `./resume`).**)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This session is `session_2026-06-19-c` — the THIRD session of 2026-06-19 (suffix `-c`); the FIRST was `session_2026-06-19-a`, the SECOND `-b`. **Next session: keep trusting the harness `currentDate`; if it is still 2026-06-19 the next suffix is `-d`; if it has rolled forward use the new date with NO suffix. Do NOT regress to an earlier suffix and do NOT invent a suffix ahead of the harness.** The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session.

> ⚠️ **BRANCH: next session runs on `main`.** The (a.145) pick is Variant B ("AI 2") Step 3+ — Variant B is additive W#1 (keyword-clustering-surface) work; W#1 is graduated and lives on `main` per Rule 22. **Start command: `./resume-workflow 1`** (reads `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md`, which queues Variant B Step 3) — OR `./resume` (reads THIS file, which mirrors the same launch prompt) — OR `./catch-up-workflow 1` (the Rule 33 graduated-W#1 re-entry — switches to `main` + prints `docs/KEYWORD_CLUSTERING_PRIMER.md`). Confirm `git branch --show-current` shows `main` immediately after entry. If you're on a `workflow-N-<slug>` branch, STOP and surface to the director.

> ⚠️ **THE NEXT PHASE IS GATED — PLAN THE SHAPE WITH THE DIRECTOR FIRST.** Step 3+ is the VISIBLE phase (a run-loop overlay, a third toggle button, a comparison screen) PLUS the AI-spend diagnostic. Per Rule 14f + `feedback_plan_output_shape_before_building`, present the audience/sections/depth/placement of every visible surface AND the cost shape of any AI-spend step, and get the director's go-ahead, BEFORE coding. Do NOT unilaterally ship a v1 screen. The PURE libs were buildable straight-through; the visible surfaces are NOT.

> ⚠️ **NO SCHEMA CHANGE EXPECTED — the schema-owner flag STAYS No.** The §3 Variant B schema delta already LANDED 2026-06-19-b (6 nullable `CanvasNode` cols + the `CLREntry` table + nullable `Project.nicheSlug`). Step 3+ reads/writes those existing columns; it should need no new schema. Do NOT claim the schema-change-in-flight flag unless a genuinely new schema need surfaces (it should not).

> ⚠️ **VARIANT B MUST BE BYTE-FOR-BYTE NON-DISRUPTIVE to Manual and AI 1.** All new code lives under `src/lib/variant-b/` + `components/variant-b/`; the schema additions are nullable cols (AI 1 never reads them) + the isolated `CLREntry` table + a nullable `Project.nicheSlug`. AI 1 keeps using `sortOrder`; VB uses `siblingOrder`/`verticalRank` — no shared column is mutated. Do NOT edit `auto-analyze-v3.ts`, `operation-applier.ts`, or `AutoAnalyze.tsx` (pattern the VB run-loop on `AutoAnalyze.tsx`, do not modify it).

> ⚠️ **THE PURE ENGINE IS DONE — do NOT rebuild it.** Step 0 (`types`, `carrier-dedup`, `rulebook`), Step 1 (the schema delta + `seed-rulebook` + `rulebook-assembly`), and ALL of Step 2 (`intent-enumeration`, `topic-labeling`, `conservative-merge`, `hierarchy`, `ordering`, `placement`, `provenance`, `reorg-sweeps`, `prompts`) are built + test-passing on disk + committed. Step 3+ WIRES this engine into a client run-loop; it builds ON the libs, it does not re-implement them.

> ⚠️ **TWO NEW LOCKED DECISIONS (2026-06-19-c) — do NOT re-litigate.** (D-SHELLS) shell generation = the conservative demand-aware default — NO speculative cross-product shells. (D-MISFIT) placement misfits queue for review tagged with a misfit type — never guess a zone. These are encoded in `hierarchy.ts` + `placement.ts`.

> ⚠️ **H-1 SLICE 4 IS DEFERRED, still OPEN — do NOT lose it.** The previously-queued W#1 task — H-1 slice 4 (action-history before-state enrichment + the History context fix) + the per-action undo engine — is DEFERRED, NOT cancelled. It remains OPEN in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 and is the (a.142) task, queued behind Variant B.

> ⚠️ **W#2 IS COMPLETE — do NOT reopen it.** W#2 (Competition Scraping) graduated 2026-06-03 and its entire residue is formally retired won't-do. Do NOT author new W#2 work unless the director explicitly asks.

---

## What we did this session (in plain terms)

We finished the entire "thinking engine" for the new AI 2 analysis mode.

**We built the last seven logic pieces — all in brand-new files, all with automated tests.** Now that AI 2 can read its rulebook (built last session), we built every remaining step that turns a keyword list into a finished marketing funnel: deciding which clusters are really the same and which should nest under another (the careful merge); building the nesting structure WITHOUT exploding into endless empty shells; ordering the parts and placing each one in the right funnel stage; sweeping through periodically to tidy up; keeping the bookkeeping; and writing the AI prompt templates.

**We locked in two of your design calls so they don't get re-argued later.** First, on building the structure: you initially said "make every combination," we pointed out that would undo the safeguard we'd already agreed on to stop the funnel exploding into thousands of empty boxes, and you chose to keep the careful default instead — so AI 2 only creates a box when a real keyword needs it or it's a defined grouping level. Second, on placing clusters that don't fit a known stage: you said the tool should never guess — it puts those into a "needs review" list with a note about why, rather than dropping them somewhere wrong.

**Everything stayed safe.** 145 automated tests passing, nothing visible changed, no AI money spent. (We also caught and fixed two tiny test glitches before saving — nothing that ever reached the live site.)

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (the (a.143)/(a.144)/(a.145) Variant B entries + the W#1 row + the total-roadmap summary) + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (the W#1 live backlog, incl. H-1) + `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` (the approved Variant B plan; §4 status keys updated this session) + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (the W#1 pointer queuing Variant B Step 3).

- **(a.145) = VARIANT B ("AI 2") Step 3+ — the GATED VISIBLE phase (run-loop + overlay first)** — **NEXT SESSION (see below). GATED — plan the screen shapes WITH the director first.** On `main`. NO schema change needed.
- **(a.144) = VARIANT B ("AI 2") Step 2 — the remaining pure pipeline libs** — ✅ DONE 2026-06-19-c (all 7 built + tested). On `main`.
- **(a.143) = VARIANT B ("AI 2") — the full multi-session build** — IN PROGRESS; the PURE engine (Steps 0-2) is COMPLETE; the GATED VISIBLE phase (Steps 3-6) + the AI-spend diagnostic remain. Stays OPEN. On `main`.
- **(a.142) = W#1 H-1 slice 4 (before-state enrichment + the History context fix)** — **DEFERRED but OPEN**, queued behind Variant B. On `main`.
- **(a.139) = W#1 H-1 (the action-history + undo epic)** — ADVANCED, NOT closed. Slices 1 + 2 + 3 done; slice 4 (the (a.142) pick) + the per-action undo engine remain, deferred behind Variant B. On `main`.
- **W#1 M-2 — ✅ DONE 2026-06-03-h** + **W#2 — ✅ COMPLETE 2026-06-03-h (residue fully retired)** + **P-63 Phase 2 / P-64 — ✅ DONE 2026-06-03-g** + **P-63 Phase 1 — ✅ DONE 2026-06-03-f** + **P-50 — ✅ DONE 2026-06-03-e** + **P-43 — ✅ RESOLVED 2026-06-03-d.**
- **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) — FUTURE.** Fired only when the director wants a non-Anthropic model live + supplies that provider's API docs. NOT a near-term item.
- **W#1's remaining live polish backlog** — after H-1: M-1 (3 server-side migrations), M-3 (validation-retry telemetry), L-1..L-5 low, C-1..C-7 carry-overs, Z-1 explicitly-last, P-1 passive prereq. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`. On `main`.
- **The deferred W#2 Archive/Data-Contract split + finalized-HRL Data Capture Interview** — held until W#3 starts and needs to read W#2 data. NOT a blocker.
- **(P-62, under Workflow 11)** "Post Launch Optimization & Surveillance" card + page — future-workflow.

## What we'll do next session (in plain terms)

1. **First we agree on what the screens look like — together, before any code.** The next phase is the part you'll actually see and click: a "run" screen for AI 2 (modelled on the AI 1 screen you already know), a new third button (Manual / AI 1 / AI 2), and a side-by-side comparison screen. Because these are visible surfaces, we plan their layout and behaviour WITH you first, then build.
2. **Then we build the run screen and wire the engine into it.** The run screen drives the finished logic engine — start/pause/resume/cancel, a spend cap, a saved checkpoint so a run survives a refresh, the model picker — and writes the result onto the canvas using the same save path AI 1 already uses.
3. **The "learn this niche" button still waits for your go-ahead.** That's the one step that spends a little AI money; we'll show you the cost before anything runs.
4. **Finally the comparison screen.** A separate read-only tab that runs the same keyword list through both engines and shows the differences side by side.

## What's still left in the total roadmap (in plain terms)

- **W#1 Variant B ("AI 2") — the new second analysis engine, IN PROGRESS, the (a.143)/(a.145) pick.** Plan approved; the entire internal logic engine is now built + tested; next is the screens (planned WITH you first). On `main`.
- **W#1 H-1 (action history + undo) — IN PROGRESS but DEFERRED behind Variant B, the (a.139) epic.** Slices 1–3 done; slice 4 (the (a.142) pick) makes the recorded changes read in full context; the per-action Undo comes after. On `main`.
- **W#1's other polish** — M-1 (move a few things off the browser onto the server), M-3 (retry-rate telemetry), plus low-priority items. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`.
- **W#2 (Competition Scraping) — ✅ COMPLETE.** Graduated + every item shipped or formally retired.
- **P-63 (central AI-model registry) — Phase 2 ✅ DONE + live; Phase 3 (add ChatGPT + Gemini) is a future task** fired when you want a non-Anthropic model and give us its docs. **P-64 (drag-reorder) ✅ DONE.**
- **The deferred W#2 Data Contract** — held until W#3 needs to read W#2 data; NOT a blocker.
- **P-62 (NEW capture)** — the Workflow-11 surveillance card + page. Future-workflow.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started. W#3 kickoff is also the trigger to author the deferred W#2 Data Contract.
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**W#1 VARIANT B ("AI 2") STEP 2 COMPLETE — all 7 remaining pure pipeline libs built + tested — 2026-06-19-c.** A pure-lib build session: NO schema change, NO deploy, NO AI/model spend. The Variant B PURE ENGINE is now complete.

**Session shape:**

- **What was built (the 7 remaining Step-2 pure libs, each taking the `AssembledRulebook` as a parameter, each `node --test`-covered):** `conservative-merge.ts` (Step 5 — fingerprint-bucket merge iff identical canonical profile, containment ⇒ nest-candidate, never all-pairs, self-purifying re-bucketing, merge policy from the assembled rulebook — 15 ✅); `hierarchy.ts` (Step 6 — ladder-aware strict-specialization nesting, demand-aware ladder-rung shell generation one ladder at a time [NO cross-product/explosion], secondary propagation to all ancestors, spine marking + depth — 7 ✅); `ordering.ts` (§10 — sibling order = natural-sequence hint else descending volume, `verticalRank` = zone→stage COMPUTED — 7 ✅); `placement.ts` (§5 — first-match-by-priority zone/stage + R11 secondary affinity, no-match ⇒ needs-placement queue with a misfit-type tag, never guesses — 6 ✅); `provenance.ts` (by_keyword/by_topic index, sibling neighbors, `niche_dedup_total_volume`, per-topic reach incl. inherited — 5 ✅); `reorg-sweeps.ts` (§11 — cadence knob `variantB.reorgCadence` + guaranteed final sweep, condensed-skeleton/per-parent slices, prunes dead shells + re-ranks mechanically, FLAGS judgment calls — 7 ✅); `prompts.ts` (central versioned templates injecting the assembled rulebook + the Lessons-marker line, wraps the existing enumeration builder, adds a topic-title AI-assist template — 7 ✅).
- **Two NEW locked director design decisions:** D-SHELLS (conservative demand-aware shell generation — no speculative cross-product shells; the director re-confirmed the plan's anti-explosion default after first picking "every combination") + D-MISFIT (placement misfits queue for review tagged with a misfit type — never guess a zone).
- **Two minor self-caught test bugs fixed before commit:** a `prompts` flatness assertion (the "(none yet)" Lessons placeholder is longer than a short test lesson) + a TS cast (`as Record` → `as unknown as Record`). Final suite 145/145 green; root tsc clean.

**FOUR LOCKED RESOLUTIONS to carry into the build (do NOT re-litigate):** (1) runtime read-path = universal(code) ∪ active-niche ∪ approved-candidate DB `CLREntry` rows, injected as a parameter into every pure lib + prompt; (2) generous/high-recall intent enumeration (over-enumeration acceptable; validators FLAG omission/fabrication, never penalize over-enumeration, never auto-delete); (3) reorg-sweep cadence configurable (`variantB.reorgCadence`) + a guaranteed final full sweep; (4) the A/B comparison is a separate read-only view, NOT a fourth mode. **PLUS the two new locked decisions (D-SHELLS, D-MISFIT).**

**Schema-change-in-flight flag: NO at entry → STAYED NO entire session → NO at exit (all 7 libs are pure + reads; the §3 delta already landed 2026-06-19-b). NEXT session (Step 3+) STAYS No — the visible surfaces read/write the existing columns.**

**Rule 14f pickers fired this session:** the two director design picks (D-SHELLS shell-generation default; D-MISFIT placement-queue). §4 Step 1c did NOT fire — the PURE engine is complete; the next task is the named continuation (the GATED VISIBLE phase).

**DEFERRED items (Rule 26):** TaskList returned ZERO tasks; the H-1 slice 4 (a.142) item remains the one open DEFERRED item tracked in the polish backlog, queued behind Variant B; no NEW `DEFERRED:` task created this session.

**EXIT baselines (pure-lib build; pre-deploy verification, no deploy — the libs are not yet imported by any route/page):** full `src/lib/variant-b` suite = **145 node:test pass, 0 fail** (+54 over 91 — conservative-merge 15 + hierarchy 7 + ordering 7 + placement 6 + provenance 5 + reorg-sweeps 7 + prompts 7); root `tsc --noEmit` clean (exit 0); ext tsc / extension `npm test` / `npm run build` route count / Playwright SKIPPED per Rule 27 (Variant B is W#1 web-app + lib work; no app/route/extension file touched).

**ONE NEW CORRECTIONS_LOG §Entry 2026-06-19-c** — a LOW-severity INFORMATIONAL note (NOT a top-tier slip): a DOC-DRIFT RESOLUTION (rulebook v0.2 §10 finalized ordering supersedes the older `variantB-technical-spec.md` "vertical-order STUB" — `verticalRank` is now COMPUTED zone→stage; newer-authority wins per Rule 3) + the two minor self-caught test bugs. **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** **NO new memory file this session.**

**Non-Group-A repo changes** — NEW `src/lib/variant-b/{conservative-merge,hierarchy,ordering,placement,provenance,reorg-sweeps,prompts}.ts` (+ their `.test.ts`) = 14 files (7 libs + 7 tests), all new; build commit `edb69ff`. NO schema change, NO new route, NO extension source change. **Group B docs** — `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (full rewrite — queues Variant B Step 3) + `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` §4 (the 7 Step-2 lib keys flipped ⬜→✅ with test counts; D-SHELLS + D-MISFIT added to the decisions section).

**EIGHTY-EIGHTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ZERO `prisma db push`, ZERO migrations, ZERO AI/model spend, ZERO deploy pushes (the 7 pure libs are not wired to any surface). The parent does ONE commit covering the build commit `edb69ff` + this doc batch + ping-pong sync. NO new memory file created; zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session).
- **NEXT session (Variant B Step 3+ — the GATED VISIBLE phase):** **NO `prisma db push` expected** (the visible surfaces read/write the existing columns); do NOT claim the schema-owner flag unless a genuinely new schema need surfaces. The AI-spend diagnostic is a later GATED sub-step behind the "Build niche rulebook" cost-confirm button — never auto-run. A real-site deploy of any wired surface follows the standard Rule 9 deploy gate. No drops, no `migrate reset` against prod, ever.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the W#1 continuity primer `docs/KEYWORD_CLUSTERING_PRIMER.md` + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` + `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` + the rest of the `Workflow 1 AI V2/` package + `src/lib/variant-b/{types,carrier-dedup,rulebook,seed-rulebook,rulebook-assembly,intent-enumeration,topic-labeling,conservative-merge,hierarchy,ordering,placement,provenance,reorg-sweeps,prompts}.ts` (+ their `.test.ts`) + `prisma/schema.prisma` + `docs/MULTI_WORKFLOW_PROTOCOL.md` + the memory directory + the `./catch-up-workflow` + `./resume-workflow` + `./resume` scripts.

---

## Branch

**`main`** — entered at start of next session. The (a.145) pick is Variant B ("AI 2") Step 3+ — Variant B is additive W#1 (keyword-clustering-surface) work; W#1 is graduated and lives on `main` per Rule 22. **Start command: `./resume-workflow 1`** (reads `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md`, which queues Variant B Step 3) — OR `./resume` (reads THIS file) — OR `./catch-up-workflow 1` (the Rule 33 graduated-W#1 re-entry). Verify with `git branch --show-current` immediately after entry; should be `main`. If you're on a `workflow-N-<slug>` branch, STOP and surface to the director.

**Expected branch state on entry** (after this session's end-of-session commit — the 7 libs + 7 tests + this doc batch — on `main` + syncs): **`main` and `workflow-2-competition-scraping` are BOTH at the doc-batch SHA.** **Verify with `git log origin/main..HEAD --oneline` showing EMPTY** (the normal graduated-workflow steady state). `git status` clean apart from historical untracked .zip + .html artifacts at repo root. If `git log origin/main..HEAD` is NOT empty at entry, something did not sync as expected — investigate before coding.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- **`Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` §4 — read the build order** (Step 2 keys are now all ✅; Steps 3-6 are the next ⬜ items, each with its per-surface contract) + §5 safety + §6 non-negotiables + §1 decisions (incl. D-CMP comparison-is-a-separate-view + the new D-SHELLS / D-MISFIT).
- `Workflow 1 AI V2/README.md`, `variantB-technical-spec.md`, `variantB-binding-addendum.md` (precedence: addendum > spec > primer), and `rulebook-v0.2.md` (authority for all funnel rules/ordering; the §10 ordering that `ordering.ts` implements).
- **`src/lib/variant-b/*` (the whole engine: `types`, `carrier-dedup`, `rulebook`, `seed-rulebook`, `rulebook-assembly`, `intent-enumeration`, `topic-labeling`, `conservative-merge`, `hierarchy`, `ordering`, `placement`, `provenance`, `reorg-sweeps`, `prompts`, + their `.test.ts`)** — the PURE engine Step 3+ wires into a client run-loop.
- **`…/keyword-clustering/components/AutoAnalyze.tsx`** — the AI 1 run-loop overlay the VB run-loop is PATTERNED ON (read it, do NOT modify it) + `…/keyword-clustering/page.tsx` (the `aiMode` two-state toggle that becomes three-state).
- `docs/KEYWORD_CLUSTERING_PRIMER.md` (the W#1 continuity primer — the map of W#1's real surfaces incl. the canvas/rebuild route + the model registry + `useKeywords.bulkImport` + `UserPreference`).
- `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` (read fully — consider a v2 bump if/when a downstream consumer needs the new `CanvasNode` cols + `CLREntry` + `Project.nicheSlug` registered).
- `docs/HANDOFF_PROTOCOL.md` Rule 3 (code wins over docs) + Rule 9 (deploy gate) + Rule 14f (forced-picker) + Rule 18 (mid-build Read-It-Back) + Rule 22 (graduated-tool re-entry) + Rule 25 (multi-workflow) + Rule 26 + Rule 27 (verification) + Rule 30 (Session bookends) + Rule 31 + §4 Step 4b extended template.
- `docs/ROADMAP.md` — the (a.143)/(a.144)/(a.145) Variant B entries + the W#1 row + the total-roadmap summary.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-19-c (this session — the newer-authority-wins / verticalRank-is-computed lesson) + §Entry 2026-06-19-b (the dedup-key-namespace lesson) + §Entry 2026-06-19-a (the surface-cue-must-not-outrank-descriptors lesson) + §Entry 2026-05-31 (the TOP-TIER SLIP).
- **All existing memory files** — esp. `feedback_plan_output_shape_before_building.md` (plan EVERY visible surface + AI-prompt shape WITH the director first — this is THE governing memory for the next phase), `feedback_browser_first_ai_with_server_migration.md` (VB's run loop is browser-side; add an execution-mode dropdown), `feedback_no_fabricated_instructions.md` (Step 3+ is the named continuation; do not invent scope; P-63 Phase 3 is FUTURE), `feedback_deferred_items_registry.md`, `feedback_default_to_recommendation.md` / `feedback_recommendation_style.md`, `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md`, `feedback_session_bookends_plain_summary.md`, `feedback_destructive_ops_confirmation.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; the FIRST read is `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` §4 (the build order).** **This session runs on `main` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

Today's task: return to Workflow #1 (Keyword Clustering) to build **Variant B ("AI 2") — Step 3+: the GATED VISIBLE phase (the client run-loop + overlay first)**. This is a graduated-tool re-entry session (Rule 22), NOT a transition session. Variant B is the new intent-driven keyword→funnel pipeline added ALONGSIDE Manual / AI 1 for A/B testing on identical input — it MUST be byte-for-byte non-disruptive to Manual and AI 1.

**Session goal ((a.145) = Variant B Step 3+ — the GATED VISIBLE phase):** the PURE engine (Steps 0-2) is COMPLETE + test-passing on disk. Step 3+ WIRES it into the keyword-clustering surface, in plan §4 order — Step 3 the client run-loop + overlay under `components/variant-b/` (patterned on `AutoAnalyze.tsx`: state machine, pause/resume/cancel, spend-cap, `localStorage` checkpoint `vb_checkpoint_{projectId}`, activity log, NDJSON forensic log, bounded concurrency, model picker `useModelsForMenu('keyword-clustering')`, `ExecutionModeSelect`, cost forecast) → Step 4 the Manual/AI 1/AI 2 three-way toggle + idempotent keyword-clone + persistence (`UserPreference` `kc_variant_{projectId}`) → Step 5 `materialize.ts` (finished Topic tree → `/canvas/rebuild` payload, diff + `deleteNodeIds` on re-runs, honor the >50%-shrink guard) → Step 6 the A/B comparison view (a SEPARATE read-only tab — NOT a 4th toggle value). The AI-spend `diagnostic.ts` + thin route (behind "Build niche rulebook") + the candidate approve/reject list are ALSO gated.

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: main   (W#1 is graduated and lives on main; Variant B is additive W#1 work)

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: EMPTY — main and workflow-2 are BOTH at the 2026-06-19-c doc-batch SHA.
#   Nothing is held back. If NOT empty, something did not sync as expected — investigate before coding.
```

If `git branch --show-current` shows anything other than `main`, run `./catch-up-workflow 1` (or `git checkout main`).

**Plan-the-shape-first (BEFORE coding — this is the governing constraint of the phase):** per Rule 14f + `feedback_plan_output_shape_before_building`, every visible surface in this phase is GATED. BEFORE writing any UI code, present to me: the run-loop overlay's layout + states + controls; the three-way toggle's placement + persistence behavior + the keyword-clone confirmation; the comparison tab's metrics + layout. AND present the cost shape of the AI-spend diagnostic BEFORE building it. Get my explicit go-ahead on each shape, then build. Do NOT ship a unilateral v1 screen.

**Fix/build shape (Step 3+):** build the run-loop overlay by PATTERNING on `AutoAnalyze.tsx` (read it; do NOT modify it). The overlay drives the existing pure engine (`src/lib/variant-b/*`) as a browser-side client loop with bounded concurrent fetches; the server stays a thin SSE proxy. Honor the non-negotiables (no growing-canvas loop; browser-side execution; reuse `useKeywords.bulkImport`, `/canvas/rebuild` + its shrink guard, the model registry; NO embeddings) + the four locked resolutions + the two new locked decisions (D-SHELLS, D-MISFIT). Per `feedback_browser_first_ai_with_server_migration`, add an execution-mode dropdown to the VB run modal now (mirror W#1).

**Forced-picker shape (before coding):** every visible-surface shape confirmation + the AI-spend diagnostic cost confirm are Rule 14f pickers — present + get explicit approval before building. The §4 Step 1c next-pick at end-of-session is a Rule 14f picker (likely the next step in the visible phase, or the comparison tab if the run-loop doesn't finish).

**Schema-change-in-flight flag:** **NO at entry → STAYS No** (the visible surfaces read/write the existing columns). Do NOT claim the flag unless a genuinely new schema need surfaces; if one does, present it for approval + claim the flag immediately before the push (single-schema-owner serialization per `docs/MULTI_WORKFLOW_PROTOCOL.md`), then flip back.

**Test coverage decision:** `node --test` for any new pure helper (`materialize.ts`); the run-loop overlay + the toggle + the clone path want a Playwright E2E walkthrough (toggle → clone → run → rebuild) — fire the Rule 14f Playwright picker WITH me before that 5+ step browser walkthrough per `feedback_playwright_for_repeatable_walkthroughs`.

**Scoreboard targets** (this session re-runs the variant-b node:test suite + root tsc; the aggregate `src/lib node:test` + `npm run build` route count re-lock when a route lands):

- Root `tsc --noEmit` clean (expect green).
- Extension tsc SKIPPED per Rule 27 (Variant B is a W#1 web-app + lib change, not extension-side).
- Extension `npm test` = 915 (UNCHANGED unless unexpectedly touched).
- `src/lib node:test` — the full `src/lib/variant-b` suite (145 at entry) grows by `materialize.ts`'s tests; re-run to lock the exact number.
- `npm run build` route count — re-run to lock; the thin variant-b diagnostic route + any new VB route add +N only when they land.
- Check 6 Playwright per Rule 27 (decide WITH me — the toggle → clone → run → rebuild E2E lands with the run-loop + screens).

**Deploy mechanics:** the visible surfaces deploy under the standard Rule 9 deploy gate + push pattern (commit on `main` → push origin/main → ping-pong sync to `workflow-2-competition-scraping` → end-of-session doc-batch). NO extension build expected. Director real-Chrome verification on vklf.com per Rule 27 for any deployed surface.

**Group A docs to update at session end:** ROADMAP header bump + the (a.143)/(a.145) status notes + the W#1 row (Last Session + Next Session) + CHAT_REGISTRY header bump (211th session) + DOCUMENT_MANIFEST header + register the new `components/variant-b/` + `materialize.ts` files + CORRECTIONS_LOG header (+ a NEW §Entry only if notable) + NEXT_SESSION full rewrite. (HANDOFF_PROTOCOL header bump only if a rule changes; CLAUDE_CODE_STARTER header bump if it deploys.)

**Group B docs to update at session end:** `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (queue the next Variant B step) + `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` §4 (flip the Step-3/4/5/6 keys ⬜→✅ as they land) + `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` (v2 bump IF a downstream consumer needs the new `CanvasNode` cols + `CLREntry` + `Project.nicheSlug` registered) + `docs/DATA_CATALOG.md` (register the new Variant B data items if/when they need a downstream contract).

**Standing carry-overs into this session:**

- **(a.145) = Variant B ("AI 2") Step 3+ (the GATED VISIBLE phase — run-loop + overlay first)** — plan every screen shape WITH me first; the diagnostic's AI spend is gated. On `main`.
- **(a.143) = Variant B ("AI 2") — the full multi-session build** — IN PROGRESS; the PURE engine (Steps 0-2) is COMPLETE; the visible phase (Steps 3-6) + the diagnostic remain. On `main`.
- **(a.142) = W#1 H-1 slice 4 (before-state enrichment + the History context fix)** — DEFERRED but OPEN, queued behind Variant B.
- **(a.139) = W#1 H-1 (the action-history + undo epic)** — slices 1 + 2 + 3 done; slice 4 + the per-action undo engine deferred behind Variant B.
- **W#1 M-2 — ✅ DONE 2026-06-03-h** + **W#2 — ✅ COMPLETE 2026-06-03-h (residue fully retired)** + **P-63 Phase 2 / P-64 — ✅ DONE 2026-06-03-g.**
- **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) — FUTURE; do NOT start unprompted.**
- **The deferred W#2 Archive/Data-Contract split** — held until W#3 needs to read W#2 data; do NOT author now.
- **P-62** — the Workflow-11 surveillance card + page (future-workflow; NOT a near-term item).

---

## Why this pointer was written this way (debug aid)

- **(a.145) = Variant B Step 3+ is the PICK because it is the named continuation of the (a.143) build** — Steps 0-2 (the entire PURE engine) landed by 2026-06-19-c, and the next item in the plan §4 build order is the GATED VISIBLE phase (the run-loop + overlay first). §4 Step 1c did NOT fire (the next task is named by the plan, not chosen).
- **The phase is GATED — that is the load-bearing difference from the last three sessions.** Steps 0-2 were pure libs buildable straight through; Step 3+ is visible surfaces + AI spend, so `feedback_plan_output_shape_before_building` governs — plan each screen WITH the director before coding.
- **The branch is `main`** — W#1 is graduated and lives on `main` per Rule 22; Variant B is additive W#1 work. Use `./resume-workflow 1` (or `./resume` / `./catch-up-workflow 1`); verify the branch immediately.
- **NOTHING is held ahead of main.** The 7 libs + 7 tests + this doc batch commit directly on `main` + ping-pong-sync; so `git log origin/main..HEAD` is EMPTY at entry.
- **NO SCHEMA CHANGE THIS SESSION.** The §3 delta already landed 2026-06-19-b; the visible surfaces read/write the existing columns. Leave the schema-owner flag No.
- **THE PURE ENGINE IS DONE.** All of `src/lib/variant-b/*` is built + tested + committed. Step 3+ wires it in; it does not re-implement it. Pattern the run-loop on `AutoAnalyze.tsx` — read it, do NOT modify it.
- **VARIANT B IS NON-DISRUPTIVE BY DESIGN.** New code under `src/lib/variant-b/` + `components/variant-b/`; nullable schema cols AI 1 never reads + the isolated `CLREntry` table + a nullable `Project.nicheSlug`. Do NOT modify `auto-analyze-v3.ts`, `operation-applier.ts`, or `AutoAnalyze.tsx`.
- **H-1 slice 4 is DEFERRED, not dropped.** It stays OPEN in the polish backlog (the (a.142) task), queued behind Variant B's build.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.145.alt1) W#1 H-1 slice 4 (before-state enrichment + the History context fix)** — the DEFERRED action-history fix (the (a.142) task); pick this up instead if the director re-prioritizes the History work ahead of Variant B. On `main`.
- **(a.145.alt2) W#1 H-1 the per-action undo engine** — depends on slice 4's before-state, so it comes after slice 4. On `main`.
- **(a.145.alt3) W#1 M-1 server-side migrations** (Main Terms / Terms In Focus / Auto-Analyze checkpoint → server-side per the "pick up on any device" principle; canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` M-1.a/b/c). On `main`.
- **(a.145.alt4) W#1 M-3 validation-retry telemetry** (instrument the late-run validation-retry rate; telemetry-only first). On `main`.
- **(a.145.alt5) W#1 LOW polish bundle** (L-1..L-5 — small low-priority items; a quick W#1 win if the director wants something lighter). On `main`.
- **(a.145.alt6) P-63 Phase 3** (the OpenAI/ChatGPT + Google Gemini provider adapters — a FUTURE task; ONLY if the director explicitly wants a non-Anthropic model live AND supplies that provider's API/SDK docs). On `workflow-2-competition-scraping`.
