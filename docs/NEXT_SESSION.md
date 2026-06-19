# Next session

**Written:** 2026-06-19-b (`session_2026-06-19-b_w1-variant-b-step1-schema-and-rulebook-plumbing` — **W#1 (Keyword Clustering) — VARIANT B ("AI 2") STEP 1 — the GATED §3 schema delta is director-APPROVED + APPLIED, PLUS the seed/assembler runtime read-path + the first two Step-2 thinking-libs (intent-enumeration + topic-labeling) — a SCHEMA + PURE-LIB build session (NO deploy, NO AI/model spend).** The gated process was honored exactly: director approval → schema-change-in-flight flag claimed (No→Yes) → `prisma db push` against live Supabase (no migrations dir, additive, no data touched, Prisma Client regenerated) → flag flipped back (Yes→No). Full `src/lib/variant-b` suite = 91 node:test ✅; root tsc clean. **§4 Step 1c forced-picker NOT fired — the next task is the named continuation of the build order → (a.144) RECOMMENDED-NEXT = VARIANT B ("AI 2") STEP 2 — the remaining pure pipeline libs, `conservative-merge.ts` next.** **The next session RUNS ON `main`; start command `./resume-workflow 1` (or bare `./resume`).**)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This session is `session_2026-06-19-b` — the SECOND session of 2026-06-19 (suffix `-b`); the FIRST was `session_2026-06-19-a`. **Next session: keep trusting the harness `currentDate`; if it is still 2026-06-19 the next suffix is `-c`; if it has rolled forward use the new date with NO suffix. Do NOT regress to an earlier suffix and do NOT invent a suffix ahead of the harness.** The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session.

> ⚠️ **BRANCH: next session runs on `main`.** The (a.144) pick is Variant B ("AI 2") Step 2 — Variant B is additive W#1 (keyword-clustering-surface) work; W#1 is graduated and lives on `main` per Rule 22. **Start command: `./resume-workflow 1`** (reads `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md`, which queues Variant B Step 2) — OR `./resume` (reads THIS file, which mirrors the same launch prompt) — OR `./catch-up-workflow 1` (the Rule 33 graduated-W#1 re-entry — switches to `main` + prints `docs/KEYWORD_CLUSTERING_PRIMER.md`). Confirm `git branch --show-current` shows `main` immediately after entry. If you're on a `workflow-N-<slug>` branch, STOP and surface to the director.

> ⚠️ **NO SCHEMA CHANGE EXPECTED — the schema-owner flag STAYS No.** Step 2 is the remaining PURE pipeline libs (pure functions + reads). None of them needs a schema change. Do NOT claim the schema-change-in-flight flag this session unless a genuinely new schema need surfaces (it should not). The §3 Variant B schema delta already LANDED 2026-06-19-b.

> ⚠️ **THE AI-SPEND DIAGNOSTIC + ANY SCREEN CHANGE REMAIN GATED.** The "Build niche rulebook" diagnostic (`diagnostic.ts` + its thin route, behind a cost-confirm button), the candidate approve/reject list, and any user-visible UI surface are GATED — present them and re-confirm WITH the director (Rule 14f) before building. The Step-2 PURE libs are NOT gated — build them straight through with test coverage.

> ⚠️ **VARIANT B MUST BE BYTE-FOR-BYTE NON-DISRUPTIVE to Manual and AI 1.** All new code lives under `src/lib/variant-b/` + `components/variant-b/`; the schema additions are nullable cols (AI 1 never reads them) + the brand-new isolated `CLREntry` table + a nullable `Project.nicheSlug`. AI 1 keeps using `sortOrder`; VB uses `siblingOrder`/`verticalRank` — no shared column is mutated. Do NOT edit `auto-analyze-v3.ts`, `operation-applier.ts`, or `AutoAnalyze.tsx`.

> ⚠️ **STEP 1 IS DONE — do NOT rebuild it.** The schema delta is applied; `seed-rulebook.ts` + `rulebook-assembly.ts` (the runtime read-path) are built + test-passing on disk + committed; `intent-enumeration.ts` + `topic-labeling.ts` (the first two Step-2 libs) are built + test-passing. Step 2 builds ON the assembler — every new lib takes the `AssembledRulebook` (from `rulebook-assembly.ts`) as a parameter; it never imports niche-aware constants directly.

> ⚠️ **H-1 SLICE 4 IS DEFERRED, still OPEN — do NOT lose it.** The previously-queued W#1 task — H-1 slice 4 (action-history before-state enrichment + the History context fix) + the per-action undo engine — is DEFERRED, NOT cancelled. It remains OPEN in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 and is the (a.142) task, queued behind Variant B.

> ⚠️ **W#2 IS COMPLETE — do NOT reopen it.** W#2 (Competition Scraping) graduated 2026-06-03 and its entire residue is formally retired won't-do. Do NOT author new W#2 work unless the director explicitly asks.

---

## What we did this session (in plain terms)

We gave the new "AI 2" engine its memory, and we built the parts that read it and start the AI's thinking.

**We made the one database change AI 2 needs — and only after you approved it.** AI 2 needs a few new optional fields and one brand-new table to store the funnel rules. We showed you exactly what was changing, you approved it, and then we made the change carefully (the kind of change that only adds things, never touches or deletes any of your existing data). Nothing breaks for Manual or AI 1 because the new fields are optional and the table is brand new.

**We loaded the rulebook into the database and built the part that reads it.** We seeded the universal rulebook (the one we wrote and tested last session) into the new table, then built the piece that combines those universal rules with any niche-specific rules you approve — so every later step reads ONE assembled rulebook.

**We built the first two "thinking" pieces.** One asks the AI to list every plausible intent behind a keyword (it's deliberately generous — better to over-list and prune than to miss one — and it flags, never silently deletes). The other gives each cluster a clear, comparable label (a stable fingerprint + a plain searcher-facing title + the boundary that separates it from its siblings).

**Everything stayed safe.** 91 automated tests passing, nothing touching Manual or AI 1, no AI money spent. We also caught and fixed a small bug (two different rule rows were accidentally getting the same internal key, so one was being dropped) — a test caught it before it could ever matter. And we confirmed the database password file was never in our code history, so nothing needs to be reset.

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (the (a.143)/(a.144) Variant B entries + the W#1 row + the total-roadmap summary) + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (the W#1 live backlog, incl. H-1) + `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` (the approved Variant B plan; §4 status keys updated this session) + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (the W#1 pointer queuing Variant B Step 2).

- **(a.144) = VARIANT B ("AI 2") Step 2 — the remaining pure pipeline libs (conservative-merge next)** — **NEXT SESSION (see below).** Then Steps 3-6. On `main`. NO schema change needed.
- **(a.143) = VARIANT B ("AI 2") — the full multi-session build** — IN PROGRESS; Step 1 (schema + seed + assembler) done, Step 2 started (intent-enumeration + topic-labeling done). Stays OPEN. On `main`.
- **(a.142) = W#1 H-1 slice 4 (before-state enrichment + the History context fix)** — **DEFERRED but OPEN**, queued behind Variant B. On `main`.
- **(a.139) = W#1 H-1 (the action-history + undo epic)** — ADVANCED, NOT closed. Slices 1 + 2 + 3 done; slice 4 (the (a.142) pick) + the per-action undo engine remain, deferred behind Variant B. On `main`.
- **W#1 M-2 — ✅ DONE 2026-06-03-h** + **W#2 — ✅ COMPLETE 2026-06-03-h (residue fully retired)** + **P-63 Phase 2 / P-64 — ✅ DONE 2026-06-03-g** + **P-63 Phase 1 — ✅ DONE 2026-06-03-f** + **P-50 — ✅ DONE 2026-06-03-e** + **P-43 — ✅ RESOLVED 2026-06-03-d.**
- **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) — FUTURE.** Fired only when the director wants a non-Anthropic model live + supplies that provider's API docs. NOT a near-term item.
- **W#1's remaining live polish backlog** — after H-1: M-1 (3 server-side migrations), M-3 (validation-retry telemetry), L-1..L-5 low, C-1..C-7 carry-overs, Z-1 explicitly-last, P-1 passive prereq. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`. On `main`.
- **The deferred W#2 Archive/Data-Contract split + finalized-HRL Data Capture Interview** — held until W#3 starts and needs to read W#2 data. NOT a blocker.
- **(P-62, under Workflow 11)** "Post Launch Optimization & Surveillance" card + page — future-workflow.

## What we'll do next session (in plain terms)

1. **We build the rest of AI 2's "thinking" pieces, one at a time.** Now that the rulebook is loaded and readable, we build the remaining logic pieces in order — first the careful merging step (deciding which clusters are really the same and which should nest under another), then the structure pieces (building the funnel shape, ordering the parts, placing each cluster in the right stage), then the cleanup sweeps, the bookkeeping, and the prompt templates. Each gets automated tests.
2. **Nothing visible changes yet, and no AI money is spent yet.** These are all internal logic pieces with tests. The "learn this niche" button (the one step that spends a little AI money) and any new screen still wait for your go-ahead before we build them.
3. **After this logic layer, we build the screens.** Then come the run screen (modelled on the AI 1 screen you already know), the new third button, copying keywords from AI 1, writing the result to the canvas, and finally the side-by-side comparison screen — each deployed for you to verify on the live site as we go.

## What's still left in the total roadmap (in plain terms)

- **W#1 Variant B ("AI 2") — the new second analysis engine, IN PROGRESS, the (a.143)/(a.144) pick.** Plan approved; the foundation + the database + the read-path + the first two thinking pieces built + tested; next is the rest of the logic pieces, then the screens. On `main`.
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

**W#1 VARIANT B ("AI 2") STEP 1 — schema delta + seed + assembler + the first two Step-2 libs — 2026-06-19-b.** The GATED §3 schema delta was director-APPROVED and APPLIED, then the runtime read-path + the first two Step-2 thinking-libs were built + test-passing on disk. A schema + pure-lib build session: NO deploy, NO AI/model spend.

**Session shape:**

- **What landed (the GATED schema delta — additive, director-APPROVED + APPLIED):** 6 nullable `CanvasNode` columns (`zone`, `stage`, `verticalRank`, `siblingOrder`, `isSpine`, `variantBMeta`); a new `CLREntry` table (the DB-backed versioned rulebook, scoped `universal | niche:<slug>`); a nullable `Project.nicheSlug`. Serialization honored exactly: director approval → flag claimed No→Yes → `prisma db push` against live Supabase (no migrations dir, additive, no data touched, Prisma Client regenerated) → flag flipped back Yes→No.
- **What was built (Step 1 read-path + the first two Step-2 libs, all node:test-covered):** `seed-rulebook.ts` (idempotent universal-rulebook seed — writes `rulebook.ts` constants as `scope="universal"` `CLREntry` rows, insert-only — 9 ✅); `rulebook-assembly.ts` (THE runtime read-path — pure `assembleRulebook(rows, opts)` unioning the universal code floor ∪ DB niche/approved-candidate rows into one `AssembledRulebook`, niche overrides + re-sort, latest-version-wins, status/scope filtering + free helpers + the thin `loadAssembledRulebook` DB adapter — 16 ✅); `intent-enumeration.ts` (Step-3 high-recall prompt builder, flat constant payload, niche-aware + strict-JSON parser + validators that FLAG under-enumeration/fabrication but never auto-delete — 14 ✅); `topic-labeling.ts` (Step-4 deterministic fingerprint/merge-bucket key + searcher title + specificity markers + contrastive boundary — 13 ✅). `types.ts` extended with `DescriptorProfile` + `IntentInstance`. The Step-0 libs (`types.ts`, `carrier-dedup.ts`, `rulebook.ts`) committed from disk this session.
- **One bug fixed mid-build (LOW severity, caught by a test):** two distinct niche `value`-type `CLREntry` rows (an alias row + a condition-term row) collapsed to the same empty natural-key and one was dropped by latest-version dedup; fixed `naturalKeyOf` to give `value`-type rows distinct identities (`alias:<lower>` vs `condition-term`).
- **Security note resolved (plan §7.6):** `.env` with Supabase creds is gitignored AND was never in git history — no rotation needed.

**FOUR LOCKED RESOLUTIONS to carry into the build (do NOT re-litigate):** (1) runtime read-path = universal(code) ∪ active-niche ∪ approved-candidate DB `CLREntry` rows, injected as a parameter into every pure lib + prompt; (2) generous/high-recall intent enumeration (over-enumeration acceptable; validators FLAG omission/fabrication for review, never penalize over-enumeration, never auto-delete); (3) reorg-sweep cadence configurable (`variantB.reorgCadence`) + a guaranteed final full sweep; (4) the A/B comparison is a separate read-only view, NOT a fourth mode.

**Schema-change-in-flight flag: NO at entry → flipped YES (claimed immediately before the gated `prisma db push`) → flipped back NO at the push completion → NO at exit. NEXT session (Variant B Step 2) STAYS No — no remaining Step-2 pure lib needs a schema change; only the later GATED diagnostic + screen surfaces might, and those re-confirm with the director first.**

**Rule 14f pickers fired this session:** the schema-delta approval (the load-bearing gate). §4 Step 1c did NOT fire — the next task is the named continuation of the plan §4 build order.

**DEFERRED items (Rule 26):** the H-1 slice 4 (a.142) task remains the one open DEFERRED item, queued behind Variant B; no NEW `DEFERRED:` task created this session.

**EXIT baselines (schema + pure-lib build; pre-deploy verification, no deploy):** full `src/lib/variant-b` suite = **91 node:test pass, 0 fail** (Step-0 carrier-dedup 17 + rulebook 22; NEW this session seed-rulebook 9 + rulebook-assembly 16 + intent-enumeration 14 + topic-labeling 13 = +52); root `tsc --noEmit` clean (exit 0); ext tsc / extension `npm test` / `npm run build` route count / Playwright SKIPPED per Rule 27 (Variant B is W#1 web-app + lib work; no new route landed — the diagnostic route is a later Step-1 sub-step).

**ONE NEW CORRECTIONS_LOG §Entry 2026-06-19-b** — a LOW-severity INFORMATIONAL note (NOT a top-tier slip): the `value`-row natural-key dedup bug (two distinct niche value rows collapsed to the same empty key; one dropped by latest-version dedup; fixed `naturalKeyOf` to give each sub-type its own key namespace — caught by a test, never deployed) + the `.env`-never-in-history security note. The LESSON = a natural-key/dedup function must produce a DISTINCT key for every semantically-distinct row sub-type, and a test should assert that two distinct-but-similar rows both survive the dedup. **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** **NO new memory file this session.**

**Non-Group-A repo changes** — the §3 schema delta in `prisma/schema.prisma` (6 nullable `CanvasNode` cols + the new `CLREntry` table + nullable `Project.nicheSlug`) + `prisma db push` (Prisma Client regenerated) + NEW `src/lib/variant-b/{seed-rulebook,rulebook-assembly,intent-enumeration,topic-labeling}.ts` (+ their `.test.ts`) + the `types.ts` extension + the Step-0 foundation libs committed from disk. **Group B docs** — `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (full rewrite — queues Variant B Step 2) + `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` §4 (Step-1 schema + seed + assembler ⬜→✅; Step-2 intent-enumeration + topic-labeling ⬜→✅).

**EIGHTY-SEVENTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ONE `prisma db push` (the GATED §3 schema delta) — director-APPROVED, schema-owner flag claimed immediately before the push, additive (no data touched, no drops, no `migrate reset`), flag flipped back immediately after. ZERO AI/model spend, ZERO deploy pushes. The parent does ONE commit covering the schema + the Step-1/Step-2 libs + this doc batch + ping-pong sync. NO new memory file created; zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session).
- **NEXT session (Variant B Step 2):** the remaining PURE pipeline libs — **NO `prisma db push` expected** (pure functions + reads); do NOT claim the schema-owner flag unless a genuinely new schema need surfaces. NO AI spend (the diagnostic's AI spend is a later GATED sub-step behind the "Build niche rulebook" cost-confirm button — never auto-run). No drops, no `migrate reset` against prod, ever.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the W#1 continuity primer `docs/KEYWORD_CLUSTERING_PRIMER.md` + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` + `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` + the rest of the `Workflow 1 AI V2/` package + `src/lib/variant-b/{types,carrier-dedup,rulebook,seed-rulebook,rulebook-assembly,intent-enumeration,topic-labeling}.ts` (+ their `.test.ts`) + `prisma/schema.prisma` + `docs/MULTI_WORKFLOW_PROTOCOL.md` + the memory directory + the `./catch-up-workflow` + `./resume-workflow` + `./resume` scripts.

---

## Branch

**`main`** — entered at start of next session. The (a.144) pick is Variant B ("AI 2") Step 2 — Variant B is additive W#1 (keyword-clustering-surface) work; W#1 is graduated and lives on `main` per Rule 22. **Start command: `./resume-workflow 1`** (reads `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md`, which queues Variant B Step 2) — OR `./resume` (reads THIS file) — OR `./catch-up-workflow 1` (the Rule 33 graduated-W#1 re-entry). Verify with `git branch --show-current` immediately after entry; should be `main`. If you're on a `workflow-N-<slug>` branch, STOP and surface to the director.

**Expected branch state on entry** (after this session's end-of-session commit — the schema + the Step-1/Step-2 libs + this doc batch — on `main` + syncs): **`main` and `workflow-2-competition-scraping` are BOTH at the doc-batch SHA.** **Verify with `git log origin/main..HEAD --oneline` showing EMPTY** (the normal graduated-workflow steady state). `git status` clean apart from historical untracked .zip + .html artifacts at repo root. If `git log origin/main..HEAD` is NOT empty at entry, something did not sync as expected — investigate before coding.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- **`Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` §4 — read the build order** (the Step-2 libs are listed with their per-lib contracts; Step-1 keys are now ✅) + §5 safety + §6 non-negotiables + §8 the reviewer-round-2 placement corrections (which `placement.ts` must honor).
- `Workflow 1 AI V2/README.md`, `variantB-technical-spec.md`, `variantB-binding-addendum.md` (precedence: addendum > spec > primer), and `rulebook-v0.2.md` (authority for all funnel rules/ordering).
- **`src/lib/variant-b/rulebook-assembly.ts` + `seed-rulebook.ts` + `intent-enumeration.ts` + `topic-labeling.ts` + `rulebook.ts` + `carrier-dedup.ts` + `types.ts` (+ their `.test.ts`)** — the Step-0/Step-1 code Step 2 builds ON (every new lib takes the `AssembledRulebook` from `rulebook-assembly.ts` as a parameter).
- `docs/KEYWORD_CLUSTERING_PRIMER.md` (the W#1 continuity primer — the map of W#1's real surfaces incl. the canvas/rebuild route + the model registry).
- `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` (read fully — the canonical small/stable artifact; consider a v2 bump if/when the new `CanvasNode` cols + `CLREntry` + `Project.nicheSlug` need registering for a downstream consumer).
- `docs/HANDOFF_PROTOCOL.md` Rule 3 (code wins over docs) + Rule 9 (deploy gate) + Rule 14f (forced-picker) + Rule 18 (mid-build Read-It-Back) + Rule 22 (graduated-tool re-entry) + Rule 25 (multi-workflow) + Rule 26 + Rule 27 (verification) + Rule 30 (Session bookends) + Rule 31 + §4 Step 4b extended template.
- `docs/ROADMAP.md` — the (a.143)/(a.144) Variant B entries + the W#1 row + the total-roadmap summary.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-19-b (this session — the dedup-key-namespace lesson) + §Entry 2026-06-19-a (the surface-cue-must-not-outrank-descriptors lesson) + §Entry 2026-05-31 (the TOP-TIER SLIP).
- **All existing memory files** — esp. `feedback_plan_output_shape_before_building.md` (plan any load-bearing lib output shape + any new visible surface WITH the director first), `feedback_no_fabricated_instructions.md` (Variant B Step 2 is the named continuation; do not invent scope; P-63 Phase 3 is FUTURE), `feedback_browser_first_ai_with_server_migration.md` (VB's run loop is browser-side), `feedback_deferred_items_registry.md`, `feedback_default_to_recommendation.md` / `feedback_recommendation_style.md`, `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md`, `feedback_session_bookends_plain_summary.md`, `feedback_destructive_ops_confirmation.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; the FIRST read is `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` §4 (the build order).** **This session runs on `main` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

Today's task: return to Workflow #1 (Keyword Clustering) to build **Variant B ("AI 2") — Step 2: the remaining pure pipeline libs (`conservative-merge.ts` first)**. This is a graduated-tool re-entry session (Rule 22), NOT a transition session. Variant B is the new intent-driven keyword→funnel pipeline added ALONGSIDE Manual / AI 1 for A/B testing on identical input — it MUST be byte-for-byte non-disruptive to Manual and AI 1.

**Session goal ((a.144) = Variant B Step 2 — the remaining pure pipeline libs):** build the Step-2 libs in plan §4 order, each `node --test`-covered, each taking the assembled rulebook (from `rulebook-assembly.ts`, already on disk) as a parameter — **`conservative-merge.ts` (next)** → `hierarchy.ts` → `ordering.ts` → `placement.ts` → `reorg-sweeps.ts` → `provenance.ts` → `prompts.ts`. **NO schema change needed** (they are pure + reads — leave the schema-owner flag No). The AI-spend diagnostic + the candidate approve/reject list + any screen change remain GATED — re-confirm with me first.

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: main   (W#1 is graduated and lives on main; Variant B is additive W#1 work)

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: EMPTY — main and workflow-2 are BOTH at the 2026-06-19-b doc-batch SHA.
#   Nothing is held back. If NOT empty, something did not sync as expected — investigate before coding.
```

If `git branch --show-current` shows anything other than `main`, run `./catch-up-workflow 1` (or `git checkout main`).

**Plan-the-shape-first (before coding the load-bearing libs):** per Rule 14f + `feedback_plan_output_shape_before_building`, confirm WITH me any lib where a design choice is load-bearing — e.g. `placement.ts`'s misfit taxonomy + the no-match→needs-placement-queue behavior; `hierarchy.ts`'s explosion guard + empty-shell policy; `reorg-sweeps.ts`'s cadence default. The straightforward pure libs (`conservative-merge`, `ordering`, `provenance`, `prompts`) can be built straight through with test coverage; surface anything ambiguous.

**Fix/build shape (Step 2):** build each lib pure + `node --test`-covered, consuming the `AssembledRulebook` as a parameter (the assembler is `rulebook-assembly.ts`). Honor the four locked resolutions + the non-negotiables (no growing-canvas loop; browser-side execution; reuse `useKeywords.bulkImport`, `/canvas/rebuild`, the model registry; NO embeddings). `placement.ts` must honor the §8 reviewer-round-2 placement corrections (descriptor-driven R7/R3, no bare-`vs` cue, no-match → needs-placement queue).

**Forced-picker shape (before coding):** the load-bearing-lib output-shape confirmations are Rule 14f pickers. The AI-spend diagnostic + the candidate approve/reject list + any screen change are GATED — present + get explicit approval before building. The §4 Step 1c next-pick at end-of-session is a Rule 14f picker (likely the next continuation — the run-loop/overlay, or the remaining libs if Step 2 doesn't finish).

**Schema-change-in-flight flag:** **NO at entry → STAYS No** (the Step-2 libs are pure + reads). Do NOT claim the flag unless a genuinely new schema need surfaces; if one does, present it for approval + claim the flag immediately before the push (single-schema-owner serialization per `docs/MULTI_WORKFLOW_PROTOCOL.md`), then flip back.

**Test coverage decision:** `node --test` per pure lib (mirror `operation-applier.test.ts` + the existing variant-b suites). Decide deeper coverage (Playwright E2E for the toggle → clone → run → rebuild path) WITH me when the run-loop + screens land later in the build — Step 2 is verified by tsc + node:test.

**Scoreboard targets** (this session re-runs the variant-b node:test suite + root tsc; the aggregate `src/lib node:test` + `npm run build` route count re-lock when a route lands):

- Root `tsc --noEmit` clean (expect green).
- Extension tsc SKIPPED per Rule 27 (Variant B is a W#1 web-app + lib change, not extension-side).
- Extension `npm test` = 915 (UNCHANGED unless unexpectedly touched).
- `src/lib node:test` — the full `src/lib/variant-b` suite grows by each new lib's tests (91 at entry); re-run to lock the exact number.
- `npm run build` route count — re-run to lock; the thin variant-b diagnostic route adds +1 only when the GATED diagnostic lands (not this session).
- Check 6 Playwright per Rule 27 (decide WITH me — Step 2 is likely covered by node:test; the E2E lands with the toggle + run-loop later).

**Deploy mechanics:** Step 2 is pure libs — **no live-site deploy expected this session** (no user-visible surface lands). If the director chooses to deploy any wired surface later, it follows the standard Rule 9 deploy gate + push pattern (commit on `main` → push origin/main → ping-pong sync to `workflow-2-competition-scraping` → end-of-session doc-batch). NO extension build expected.

**Group A docs to update at session end:** ROADMAP header bump + the (a.143)/(a.144) status notes (Step 2 progress) + the W#1 row (Last Session + Next Session) + CHAT_REGISTRY header bump (210th session) + DOCUMENT_MANIFEST header + register the new `src/lib/variant-b/` Step-2 files + CORRECTIONS_LOG header (+ a NEW §Entry only if notable) + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite. (HANDOFF_PROTOCOL header bump only if a rule changes.)

**Group B docs to update at session end:** `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (queue the next Variant B step) + `Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md` §4 (flip the Step-2 lib keys ⬜→✅ as they land) + `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` (v2 bump IF a downstream consumer needs the new `CanvasNode` cols + `CLREntry` + `Project.nicheSlug` registered) + `docs/DATA_CATALOG.md` (register the new Variant B data items if/when they need a downstream contract).

**Standing carry-overs into this session:**

- **(a.144) = Variant B ("AI 2") Step 2 (the remaining pure pipeline libs — conservative-merge next)** — build straight through with test coverage; the diagnostic + screens stay GATED. On `main`.
- **(a.143) = Variant B ("AI 2") — the full multi-session build** — IN PROGRESS; Step 1 done, Step 2 started. On `main`.
- **(a.142) = W#1 H-1 slice 4 (before-state enrichment + the History context fix)** — DEFERRED but OPEN, queued behind Variant B.
- **(a.139) = W#1 H-1 (the action-history + undo epic)** — slices 1 + 2 + 3 done; slice 4 + the per-action undo engine deferred behind Variant B.
- **W#1 M-2 — ✅ DONE 2026-06-03-h** + **W#2 — ✅ COMPLETE 2026-06-03-h (residue fully retired)** + **P-63 Phase 2 / P-64 — ✅ DONE 2026-06-03-g.**
- **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) — FUTURE; do NOT start unprompted.**
- **The deferred W#2 Archive/Data-Contract split** — held until W#3 needs to read W#2 data; do NOT author now.
- **P-62** — the Workflow-11 surveillance card + page (future-workflow; NOT a near-term item).

---

## Why this pointer was written this way (debug aid)

- **(a.144) = Variant B Step 2 is the PICK because it is the named continuation of the (a.143) build** — Step 1 (the schema delta + seed + assembler) landed 2026-06-19-b, and the next item in the plan §4 build order is the remaining Step-2 pure libs (conservative-merge first). §4 Step 1c did NOT fire (the next task is named by the plan, not chosen).
- **The branch is `main`** — W#1 is graduated and lives on `main` per Rule 22; Variant B is additive W#1 work. Use `./resume-workflow 1` (or `./resume` / `./catch-up-workflow 1`); verify the branch immediately.
- **NOTHING is held ahead of main.** The schema + the Step-1/Step-2 libs + this doc batch commit directly on `main` + ping-pong-sync; so `git log origin/main..HEAD` is EMPTY at entry.
- **NO SCHEMA CHANGE THIS SESSION.** The §3 delta already landed; the Step-2 libs are pure + reads. Leave the schema-owner flag No; only the later GATED diagnostic + screen surfaces would touch schema, and those re-confirm with the director first.
- **STEP 1 IS ALREADY DONE.** The schema delta is applied; `seed-rulebook.ts` + `rulebook-assembly.ts` are built + tested + committed; `intent-enumeration.ts` + `topic-labeling.ts` are built + tested. Step 2 builds ON the assembler.
- **VARIANT B IS NON-DISRUPTIVE BY DESIGN.** New code under `src/lib/variant-b/` + `components/variant-b/`; nullable schema cols AI 1 never reads + the brand-new isolated `CLREntry` table + a nullable `Project.nicheSlug`. Do NOT modify `auto-analyze-v3.ts`, `operation-applier.ts`, or `AutoAnalyze.tsx`.
- **H-1 slice 4 is DEFERRED, not dropped.** It stays OPEN in the polish backlog (the (a.142) task), queued behind Variant B's build.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.144.alt1) W#1 H-1 slice 4 (before-state enrichment + the History context fix)** — the DEFERRED action-history fix (the (a.142) task); pick this up instead if the director re-prioritizes the History work ahead of Variant B. On `main`.
- **(a.144.alt2) W#1 H-1 the per-action undo engine** — depends on slice 4's before-state, so it comes after slice 4. On `main`.
- **(a.144.alt3) W#1 M-1 server-side migrations** (Main Terms / Terms In Focus / Auto-Analyze checkpoint → server-side per the "pick up on any device" principle; canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` M-1.a/b/c). On `main`.
- **(a.144.alt4) W#1 M-3 validation-retry telemetry** (instrument the late-run validation-retry rate; telemetry-only first). On `main`.
- **(a.144.alt5) W#1 LOW polish bundle** (L-1..L-5 — small low-priority items; a quick W#1 win if the director wants something lighter). On `main`.
- **(a.144.alt6) P-63 Phase 3** (the OpenAI/ChatGPT + Google Gemini provider adapters — a FUTURE task; ONLY if the director explicitly wants a non-Anthropic model live AND supplies that provider's API/SDK docs). On `workflow-2-competition-scraping`.
