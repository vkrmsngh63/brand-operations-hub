# Variant B ("AI 2") — Implementation Plan & Live-Code Reconciliation (External Reviewer Copy)

*Self-contained. Assumes the reader knows the `Workflow 1 AI V2/` handoff package (primer, technical-spec, binding-addendum, rulebook-v0.2). Focuses on live-code findings, decisions, and the build. Precedence honored: binding-addendum > technical-spec > primer/walkthrough; rulebook-v0.2 is authority for funnel rules/ordering. Repo: `brand-operations-hub`. Framework note: this is not stock Next.js — framework guides under `node_modules/next/dist/docs/` govern any route/handler work.*

---

## 1. DECISIONS LOG

### 1A. Director-confirmed choices (each was Claude's recommendation, then selected by the director)

**D-NICHE — How does a project declare its health niche (the DB rulebook is scoped `universal` + `niche:<slug>`, but a Project carries only `name`/`description`)?**
- **Chosen:** Add a nullable `Project.nicheSlug` column. CLR niche scope = `"niche:" + project.nicheSlug`.
- **Origin:** Claude's recommendation → director-confirmed.
- **Rationale:** Only option giving a single, explicit, persistent, queryable source of truth; survives renames; invisible to AI 1 because nullable. (Alternatives rejected: per-run overlay field doesn't persist as a project property; deriving from the project name is implicit and breaks on rename.)

**D-DIAG — How should the in-core automated diagnostic (rulebook §9, ~500-keyword sample that builds the niche layer, a real one-time AI spend) be triggered?**
- **Chosen:** An explicit "Build niche rulebook" button that shows a cost forecast and requires confirm; re-runnable as the keyword set grows.
- **Origin:** Claude's recommendation → director-confirmed.
- **Rationale:** Deliberate, auditable, repeatable setup step with the spend shown before it happens — no surprise charge buried inside the first analysis run. (Alternatives rejected: auto-on-first-run spends without a dedicated decision point; skipping forfeits niche accuracy and forces a retrofit.)

**D-CAND — How are candidate CLR entries handled in the first build, given the human-correction Lessons Module UI is a deferred fast-follow?**
- **Chosen:** A minimal temporary approval list (review / approve / reject) over `status="candidate"` entries; only approved entries become `active` and are used by runs.
- **Origin:** Claude's recommendation → director-confirmed.
- **Rationale:** Keeps a human in the loop and protects a versioned, never-overwritten store from unreviewed pollution; a natural stepping-stone to the full Lessons UI. (Alternatives rejected: auto-promote writes unreviewed entries permanently — long-term data-quality debt; hold-inert wastes the diagnostic's output entirely.)

**D-CMP — Where does the A/B comparison surface live (no exact existing W#1 reporting analog was found in the code)?**
- **Chosen:** A dedicated, **separate read-only** "A/B Comparison" view (its own tab/panel) on the keyword-clustering page — explicitly NOT a fourth value of the Manual / AI 1 / AI 2 run control, which stays three-state.
- **Origin:** Claude's recommendation → director-confirmed.
- **Rationale:** Discoverable, persists independently of whether a run is active, sits with the variants it compares, and has room to grow the metric set. (Alternatives rejected: an overlay pane couples it to AI 2 being open; a standalone route adds navigation overhead and is less discoverable.)

### 1B. Engineering adjustments adopted while reconciling the package to live code (Claude's calls, inside the approved plan; flagged for the reviewer)

- **A-AUTH/FETCH** — The package's "callApi pattern" has no such symbol; the real client helper is `authFetch`. **Adopted:** use `authFetch` for the analyze / rebuild / keyword calls. One-line: match the actual helper name and tests.
- **A-EXECMODE** — `ExecutionModeSelect` selects the *API route* (`'direct'` = browser→Anthropic vs `'server'` = browser→Vercel `/api/ai/analyze`→Anthropic), not a "browser vs server pipeline venue." **Adopted:** Variant B's fetch layer honors both routes exactly like AI 1, defaulting to AI 1's default; the run loop is browser-side regardless of which route each call takes.
- **A-COST** — `calcCost` is not exported by `cost-estimator.ts`; it is a local closure inside `AutoAnalyze.tsx`. **Adopted:** reuse the module's real exports (`projectRunCost`, `evaluateSpendCap`) for forecasting/spend-cap and port the small `calcCost` pattern into Variant B's loop (pricing read from the model registry). One-line: no new cost lib; reuse what exists.
- **A-CLONE-IDEMP** — `Keyword` has no DB uniqueness on the keyword text. **Adopted:** keyword-clone idempotency is enforced in app logic (clone only when B's workflow has zero keywords; "re-sync" computes the set difference by keyword string). One-line: can't lean on a constraint that doesn't exist.
- **A-STABLEID** — `CanvasNode` requires `stableId` and is unique on `(projectWorkflowId, stableId)`; the rebuild route upserts by that key. **Adopted:** the materializer mints deterministic `stableId`s for VB nodes and tracks `canvasState.nextStableIdN`, exactly like AI 1. One-line: satisfy the existing upsert key.
- **A-SHRINK** — The >50%-shrink rebuild guard will block a VB *re-run* that shrinks B's own tree >50% unless `deleteNodeIds` is supplied. **Adopted:** the materializer always diffs against B's existing canvas and passes `deleteNodeIds` for removed stableIds. One-line: use the guard's intended escape hatch rather than weaken it.
- **A-RULEBOOK-AS-CODE** — Resolves the package's two open stubs. **Adopted:** the universal rulebook layer is encoded as typed code constants that (a) seed the DB and (b) feed the pure libs, so logic never drifts from the rulebook ("applier wins"); `TODO(rulebook_assembly)` → seed + diagnostic; `TODO(vertical_ordering)` → deterministic ordering (§10) + reorganization sweeps (§11). One-line: implement, do not stub.

---

## 2. LIVE-CODE FINDINGS & MISMATCHES

> Note for the reviewer: the package file `variantB-codebase-intake.md` is the intake **brief** (the list of questions), not a filled intake report — so there was no prior report to trust. Everything below was verified directly against the live tree.

**Reuse points — confirmed as-described:**
- `useKeywords.bulkImport` — `src/hooks/useKeywords.ts`. Dedupes, normalizes volume suffixes (`5K→5000`, `5M→…`), writes scoped to `projectWorkflowId`. ✅
- `POST /api/projects/[id]/canvas/rebuild` — `src/app/api/projects/[projectId]/canvas/rebuild/route.ts`. Atomic `withRetry(() => prisma.$transaction(ops,{timeout:30000,maxWait:5000}))`, upserts by `projectWorkflowId_stableId`. ✅
- **>50%-shrink blanking guard** — present and isolated in `src/lib/canvas-rebuild-guard.ts` (`G1_SHRINK_THRESHOLD = 0.5`; blocks when `drop/currentNodeCount > 0.5` and no `deleteNodeIds`; has its own `node --test`). ✅
- `CanvasNode.parentId` — `String?`, FK-less self-relation → unlimited nesting, app-enforced. ✅
- `CanvasNode.linkedKwIds` — `Json @default("[]")`. ✅
- Model registry / `useModelsForMenu` — `src/lib/ai-models/useModelsForMenu.ts` + `registry.ts`; the `'keyword-clustering'` menu is already populated with Anthropic models. ✅
- `forensic-log.ts` — `ForensicLog` class with `toNdjson()` + `buildForensicDownload()`; `ForensicRecord` has optional per-batch fields (`batch_num`, input/output token counts, `cost_this_batch`, `phase`) — directly reusable for the headline metric. ✅
- `prisma-retry.ts` — `withRetry<T>(fn,opts)`, transient codes `P1001/P1002/P1008/P2034`. ✅
- `verifyAuth` — `src/lib/auth.ts`; **bonus found:** `verifyProjectWorkflowAuth(req, projectId, workflow)` resolves-or-creates the `ProjectWorkflow` row and returns its `projectWorkflowId` — exactly what's needed to create `keyword-clustering-vb`. ✅
- `/api/ai/analyze` — `src/app/api/ai/analyze/route.ts`, SSE proxy to Anthropic, `maxDuration = 300`. ✅
- `db.ts` prisma singleton — `src/lib/db.ts`. ✅
- `canvas-layout.ts` / `reconciliation.ts` — present, pure render/heal helpers; reusable if VB renders on the canvas. ✅
- `AutoAnalyze.tsx` — `…/keyword-clustering/components/AutoAnalyze.tsx`. Full state machine (`IDLE/CONFIGURING/RUNNING/PAUSED/BATCH_REVIEW/API_ERROR/VALIDATION_ERROR/ALL_COMPLETE`), pause/resume/cancel, spend-cap (`spendCapUsd` + explicit `noCap` toggle), `localStorage` checkpoint (`aa_checkpoint_{projectId}`), activity log, downloadable forensic NDJSON. The model to pattern VB's loop on. ✅
- `operation-applier.ts` + `operation-applier.test.ts` — confirmed; the `node:test`/`node:assert/strict` pure-builder style (and ~17 sibling `*.test.ts` in `src/lib/`) is the test pattern VB mirrors. ✅
- Growing-canvas anti-pattern — `src/lib/auto-analyze-v3.ts › buildOperationsInputTsv` confirmed to serialize **every** node into each batch prompt; even its "tiered" mode compresses detail but still emits all nodes. VB must not replicate. ✅

**Schema facts — confirmed, with nuance:**
- `CanvasNode.kwPlacements` — exists, but typed `Json @default("{}")`; the `{kwId:'primary'|'secondary'}` shape is an **application convention, not schema-enforced**. VB writes the same shape AI 1 reads.
- `CanvasNode.intentFingerprint` — **NOT NULL confirmed**, and **not unique** (no `@unique`). VB computes it from the descriptor profile; shells get a computed fingerprint too — no uniqueness constraint to fight.
- New nullable columns (`zone`, `stage`, `verticalRank`, `siblingOrder`, `isSpine`, `variantBMeta`) — **confirmed absent** today; safe to add nullable. (AI 1 uses the existing `sortOrder Int @default(0)`; VB adds `siblingOrder`/`verticalRank` rather than overloading it.)
- `ProjectWorkflow` — `@@unique([projectId, workflow])`, `workflow` is a free string → `keyword-clustering-vb` is a clean separate namespace. ✅
- `Keyword` — has `projectWorkflowId`, **no `projectId` column** (the TS `Keyword.projectId` is a UI label; DB access is via `projectWorkflow.projectId`), and **no unique constraint on the keyword text** (only `@@index([projectWorkflowId])`). ✅ / drives A-CLONE-IDEMP.
- `UserPreference` — `(userId, key, value @db.Text)`, `@@unique([userId, key])`; per-user, so the project is encoded in the key `kc_variant_{projectId}` = `"A"|"B"`. ✅
- `AuditEvent` — time column is **`timestamp`** (not `createdAt`). ✅
- `CLREntry`, `LessonRow`, `RulebookChange` — **confirmed absent**; safe to add.

**Mismatches / things in the package that were wrong, missing, or named differently:**
1. **`calcCost` misnamed** — not an export of `cost-estimator.ts`; it's a local helper in `AutoAnalyze.tsx`. → A-COST.
2. **"callApi pattern" does not exist** — the real helper is `authFetch`. → A-AUTH/FETCH.
3. **`ExecutionModeSelect` semantics differ** — it is a route selector (`direct` vs `server` proxy), not a browser-vs-server pipeline switch. → A-EXECMODE.
4. **No niche anchor on `Project`** — the package's DB-rulebook niche scoping (`niche:<slug>`) had no home in the schema; nothing existed to derive it from. → D-NICHE adds `Project.nicheSlug`.
5. **Keyword-clone idempotency** — the package called the clone "idempotent" but there's no DB uniqueness to make it so; idempotency is app-level. → A-CLONE-IDEMP.
6. **`kwPlacements` shape** — package treats it as a typed `{kwId:'primary'|'secondary'}` map; in the schema it's untyped `Json`. Convention only. → A-stable behavior, no schema change.
7. **Intake "report" absent** — `variantB-codebase-intake.md` is the question brief, not a completed report; the reviewer should not assume any prior findings file exists.

**The Manual / AI 1 / AI 2 toggle** — `…/keyword-clustering/page.tsx` currently holds `const [aiMode, setAiMode] = useState(false)` (two buttons Manual/AI), passed as a prop into `KeywordWorkspace`. It is **not persisted today**. The three-state change is localized (enum + one extra button + a routing branch); persistence is added via `UserPreference`. ✅ as-described.

**Single-schema-owner protocol** — confirmed in `docs/MULTI_WORKFLOW_PROTOCOL.md`: `prisma db push`, **no migrations directory**, coordination via the ROADMAP "Current Active Tools" in-flight flag (serialized — only one chat edits the schema at a time, not a permanent single owner). ✅ as-described.

**Browser-side execution** — confirmed: no queue/worker/job system; the app is browser-first with a thin SSE proxy (`maxDuration=300`). VB's pipeline is a client loop with bounded concurrent fetches. ✅ as-described.

---

## 3. PROPOSED SCHEMA DELTA  *(GATED — will not `prisma db push` without explicit approval, and only after claiming the ROADMAP schema-owner flag)*

**3a. Nullable columns on `CanvasNode`** (nullable ⇒ AI 1's read/write/render paths are untouched):
```prisma
zone          String?   // CLR zone key (rulebook §2)
stage         String?   // CLR stage key (rulebook §3)
verticalRank  Float?    // journey order = zoneRank.stageRank (rulebook §10)
siblingOrder  Int?      // horizontal order within parent (rulebook §10)
isSpine       Boolean?  // top-level major parent
variantBMeta  Json?     // canonical profile, boundary belongs/excludes, title_voice, summary, dedup bookkeeping
```

**3b. New table `CLREntry`** (DB-backed rulebook; scoped + versioned; never overwritten — a change writes a new version pointing at its predecessor):
```prisma
model CLREntry {
  id           String   @id @default(uuid())
  type         String   // descriptor | value | value_ladder | zone | stage | placement_rule | naming_convention | merge_policy | ignorable_set
  payload      Json     // type-specific (DescriptorDef / ValueLadder / placement_rule / …)
  scope        String   // "universal" | "niche:<slug>"
  status       String   @default("active") // candidate | active | retired
  version      Int      @default(1)
  supersedesId String?  // ref(CLREntry) the new version replaces
  createdFrom  String   @default("bootstrap") // bootstrap | manual | lesson:<id>
  createdAt    DateTime @default(now())
  @@index([scope, type, status])
  @@index([version])
}
```

**3c. Niche anchor:**
```prisma
// on model Project
nicheSlug String?   // nullable; AI 1 ignores it; CLR scope = "niche:" + nicheSlug
```

Deferred (NOT in this delta): the Lessons-Module tables `LessonRow` and `RulebookChange` (fast-follow).

---

## 4. IMPLEMENTATION PLAN (ordered build steps; files to create/modify)

**Status key:** ✅ done & test-passing · ⬜ planned.

**Architecture note (runtime read path):** the pure libs are PURE — they take the
assembled rulebook (and per-stage config drawn from it) as a PARAMETER and never
import niche-aware constants directly. `rulebook.ts` is the universal DEFAULT
layer that feeds (a) the DB seed and (b) the assembler (`rulebook-assembly.ts`,
Step 1), which unions it with DB niche + approved-candidate entries. (The header
comment in `rulebook.ts` saying libs "read these directly" will be corrected to
"feeds the assembler" — comment-only; `carrier-dedup` already takes injected config.)

**Step 0 — Pure foundation (no DB, no AI, fully `node --test`-covered):**
- ✅ `src/lib/variant-b/types.ts` — pipeline shapes (`KeywordRow`, `CarrierCluster`, configs); documents that intent/cluster/provenance are pipeline-internal, not DB tables.
- ✅ `src/lib/variant-b/carrier-dedup.ts` (+ `.test.ts`, 17 tests) — Step 2: takes injected `CarrierDedupConfig` (conditionTerm/aliases/ignorableStopwords from the assembled rulebook); alias→canonical, strip condition term + `{for,the,a}` only (prepositions/qualifiers preserved), conservative plural lemmatization, word-order normalization, hash-group, highest-volume representative, summed volume, flagged degenerate clusters.
- ✅ `src/lib/variant-b/rulebook.ts` (+ `.test.ts`, 22 tests) — universal DEFAULT layer encoded: descriptors (§1), zones+stages (§2/§3), placement rules R1–R11 with the §5 precedence baked into priority, ignorable set (§6), merge policy (§8), natural-sequence hints + `verticalRank()` (§10). Feeds the DB seed and the assembler (NOT consumed directly by libs for niche-aware logic).

**Step 1 — Schema delta + seed + assembler + diagnostic (GATED on §3 approval):**
- ✅ **(2026-06-19-b)** Apply the §3 delta after approval + schema-owner-flag claim → `prisma db push`. **DONE:** director-APPROVED; flag claimed No→Yes → `prisma db push` against live Supabase (no migrations dir, additive, no data touched, Prisma Client regenerated) → flag flipped Yes→No. Landed: 6 nullable `CanvasNode` cols (`zone/stage/verticalRank/siblingOrder/isSpine/variantBMeta`) + the new `CLREntry` table + nullable `Project.nicheSlug`.
- ✅ **(2026-06-19-b)** `src/lib/variant-b/seed-rulebook.ts` (+ `.test.ts`, 9 tests) — idempotent seed writing `rulebook.ts` constants as `scope="universal"` `CLREntry` rows (keyed by `(type, scope, natural-key)`; insert-only). Note: `naturalKeyOf` gives `value`-type rows distinct key namespaces (`alias:<lower>` vs `condition-term`) after a dedup-collision bug was caught by a test.
- ✅ **(2026-06-19-b)** **`src/lib/variant-b/rulebook-assembly.ts` (+ `.test.ts`, 16 tests) — THE RUNTIME READ PATH.** Builds the effective `AssembledRulebook` = UNION of the universal code layer (`rulebook.ts`) **and** DB `CLREntry` rows where `scope ∈ {"universal", "niche:"+project.nicheSlug}` and `status ∈ {"active","approved-candidate"}`, pinned to one `clrVersion`. Niche/approved entries extend the universal set; where they supersede (placement rules, merge policy, ladders) the niche entry wins and the merged set is re-sorted by priority. Every pure lib and every prompt-builder receives THIS object as a parameter (they never import niche-aware constants directly), so diagnostic output + approved candidates reach the pipeline. Pure-function core (DB read is a thin adapter) → `node --test`-covered with synthetic DB rows.
- ⬜ `src/lib/variant-b/diagnostic.ts` + a thin read/seed route under `src/app/api/.../variant-b/` — the "Build niche rulebook" flow (cost forecast → confirm → ~500-keyword blend → niche-layer `candidate` entries; convergence gates per §9).
- ⬜ Minimal candidate approve/reject list (interim, pre-Lessons-UI). Approving flips `candidate`→`approved-candidate` so the assembler picks it up.

**Step 2 — Remaining pure pipeline libs (`src/lib/variant-b/`, each `node --test`; each takes the assembled rulebook as a parameter):**
- ✅ **(2026-06-19-b)** `intent-enumeration.ts` (+ `.test.ts`, 14 tests) — Step 3 prompt builder (pinned-assembled-CLR-only, small/constant payload) + strict-JSON parser + schema validation + sampled blind-pass / round-trip checks. **Recall bias (explicit in the prompt): enumerate EVERY plausible intent; over-enumeration is acceptable (spurious low-volume intents are visible + pruned downstream), a missed intent is unrecoverable. Validators FLAG under-enumeration (omission) and fabrication for review — they do NOT penalize over-enumeration and never auto-delete.**
- ✅ **(2026-06-19-b)** `topic-labeling.ts` (+ `.test.ts`, 13 tests) — Step 4: deterministic fingerprint from canonicalized profile, searcher/neutral title, contrastive boundary, specificity markers.
- ⬜ `conservative-merge.ts` — Step 5: candidate generation by fingerprint bucket + normalized-token-overlap neighborhood (non-vector; never all-pairs); merge iff identical profile; containment ⇒ nest-candidate, never merge. Merge policy read from the assembled rulebook.
- ⬜ `hierarchy.ts` — Step 6: strict-specialization nesting; demand-aware shell generation by climbing the assembled rulebook's value-ladders (universal templates **+ DB niche ladders**; empty shells allowed; explosion guard); seat primary, propagate secondary to all ancestors; mark `isSpine`.
- ⬜ `ordering.ts` — §10: `verticalRank` = zone→stage; `siblingOrder` = natural-sequence hint (from the assembled rulebook) else descending volume; AI ordering only for flagged-ambiguous groups.
- ⬜ `placement.ts` — §5: evaluate the assembled rulebook's placement rules (universal **+ DB niche / approved edge-rules**, merged + re-sorted by priority) by ascending priority, first match wins; precedence + misfit taxonomy; no-match ⇒ needs-placement queue (never guess).
- ⬜ `reorg-sweeps.ts` — §11: sweeps on the condensed skeleton + one parent-slice at a time; never re-feeds the whole tree. **Cadence is a config knob (`variantB.reorgCadence`, default ≈ every batch-wave / ~N topics) AND a final full sweep always runs at end of assembly.**
- ⬜ `provenance.ts` — by_keyword / by_topic index, `niche_dedup_total_volume`, per-topic `volume_full`.
- ⬜ `prompts.ts` — versioned code-constant templates that inject the ASSEMBLED rulebook (universal + niche + approved) at runtime; carry the Lessons-marker line for the future fast-follow.

**Step 3 — Client run-loop + overlay (`components/variant-b/`, patterned on `AutoAnalyze.tsx`):**
- ⬜ state machine (idle/running/paused/review/error/complete), pause/resume/cancel, spend-cap (`evaluateSpendCap`), `localStorage` checkpoint (`vb_checkpoint_{projectId}`), activity log, NDJSON forensic log (`forensic-log.ts`), bounded concurrency (default 6), model picker (`useModelsForMenu('keyword-clustering')`), `ExecutionModeSelect`, cost forecast, fetches via `authFetch` honoring execution mode.

**Step 4 — Toggle + keyword-clone + persistence:**
- ⬜ `…/keyword-clustering/page.tsx` — `aiMode: boolean` → `'manual' | 'ai1' | 'ai2'` (three buttons); route to AI 1's overlay / VB's overlay / manual workspace. Persist the AI-1-vs-AI-2 choice in `UserPreference` (`kc_variant_{projectId}`).
- ⬜ First AI 2 activation: `verifyProjectWorkflowAuth(…, 'keyword-clustering-vb')` to create the workflow, then idempotent keyword-clone (only when B has zero keywords); a "Re-sync from AI 1" action (set-difference by keyword string).

**Step 5 — Materialize → `/canvas/rebuild`:**
- ⬜ `src/lib/variant-b/materialize.ts` — finished `Topic` tree → rebuild payload (minted `stableId`, `parentId` by stableId, `title`, `kwPlacements`, `linkedKwIds`, computed `intentFingerprint`, and the new nullable columns); diff vs B's existing canvas and pass `deleteNodeIds` on re-runs; write atomically under the VB `projectWorkflowId`.

**Step 6 — A/B Comparison view (SEPARATE, read-only — NOT a fourth value of the run control):**
- ⬜ The Manual / AI 1 / AI 2 control stays exactly three-state. The comparison is a distinct read-only surface (its own tab/panel on the keyword-clustering page): headline per-batch payload size / cost across the run (flat for AI 2 vs growing for AI 1, from each run's forensic NDJSON) + topic count, max depth, topics per zone, reachable (`volume_full`) vs dedup volume, count of keywords in multiple topics. Reads existing data only; writes nothing.

**Deferred (recorded, not built):** Lessons Module UI + `LessonRow`/`RulebookChange`; pgvector; server-side execution.

**Test plan:** `node --test` per pure lib (mirroring `operation-applier.test.ts`); a payload-flatness unit test asserting VB's per-batch prompt size stays in a constant band as the tree grows; Playwright E2E for toggle → first-activation clone (idempotent) → run → rebuild-writes-under-`keyword-clustering-vb` → re-sync; headline-metric proof by running AI 1 and AI 2 on identical input and comparing exported forensic logs; the repo scoreboard (tsc + build route count + `src/lib` node:test + Playwright) before any deploy.

---

## 5. SAFETY / BLAST RADIUS

- **Schema:** every new `CanvasNode` column is **nullable** — AI 1's reads, writes, canvas render, and the rebuild route's upsert path never reference them, so they are unchanged. `CLREntry` is a brand-new isolated table. `Project.nicheSlug` is nullable and AI-1-irrelevant. AI 1 keeps using `sortOrder`; VB uses `siblingOrder`/`verticalRank` — no shared column is mutated.
- **Storage isolation:** VB writes only to its own `ProjectWorkflow` (`keyword-clustering-vb`); the `(projectId, workflow)` unique constraint guarantees A and B never collide. The keyword-clone reads AI 1's keywords and writes copies into B; AI 1's rows are untouched.
- **No edits to Variant A modules:** `auto-analyze-v3.ts`, `operation-applier.ts`, and `AutoAnalyze.tsx` are **not modified**. VB is new code under `src/lib/variant-b/` and `components/variant-b/`. VB never emits incremental operations and never calls `buildOperationsInputTsv`.
- **Toggle:** the `page.tsx` change is a localized enum/button/route swap; the Manual and AI 1 branches keep their exact current behavior; persistence is additive and falls back to current behavior when absent.
- **Rebuild guard:** reused unchanged (protects both variants). First VB run is safe (empty B canvas ⇒ guard not triggered); re-runs pass `deleteNodeIds` so the guard is satisfied without weakening it for AI 1.
- **Gated/risky steps:** the schema `prisma db push` will not happen without explicit approval of §3 **and** after claiming the ROADMAP "Current Active Tools" schema-owner flag (no parallel schema work). The diagnostic's AI spend is gated behind an explicit cost-confirmed button. The candidate approval list keeps unreviewed rule changes out of active use.

---

## 6. NON-NEGOTIABLES CHECK

- **No growing-canvas loop / flat per-batch payloads** — ✅ committed. Analysis prompts carry only the pinned CLR + the current item; the accumulated tree never enters an analysis prompt; reorganization sweeps operate on the condensed skeleton + a single parent-slice. A unit test will assert per-batch payload size stays flat as the tree grows.
- **Browser-side execution** — ✅ the pipeline runs as a client loop with bounded concurrent fetches; the server stays a thin SSE proxy.
- **Reuse the existing paste loader** — ✅ `useKeywords.bulkImport` verbatim.
- **Reuse the `/canvas/rebuild` write path** — ✅ materialize once and write atomically through the existing route + its shrink guard.
- **Reuse the model registry** — ✅ `useModelsForMenu('keyword-clustering')` + registry pricing.
- **No embeddings** — ✅ non-vector candidate generation (fingerprint bucket + normalized-token-overlap); no pgvector.

---

## 7. OPEN QUESTIONS / UNRESOLVED

1. **Schema-delta approval (blocking Step 1):** §3 is presented for explicit sign-off; nothing is pushed until approved and the schema-owner flag is claimed.
2. **Diagnostic sample size & convergence in practice:** the §9 floor is ~500 keywords (top 300 by volume + 200 for diversity) with convergence gates (out-of-vocab <5%, coverage-gap <2%, placement-miss <5%, inter-pass agreement >85%); whether vocabulary-rich niches need more pull is an empirical call to confirm after the first real run.
3. **Round-trip / blind-pass scorer for Step 3 validation:** the spec defines these checks; the exact scoring threshold for "low-fidelity" flags isn't pinned and may need tuning against real output.
4. **Comparison-metric exactness:** the headline payload/cost curves are well-defined from forensic logs; the secondary metric set (zone distribution, multi-topic keyword count) is proposed and open to additions before the tab is built.
5. **Niche-slug provisioning UX:** `Project.nicheSlug` is the agreed storage; where/how it's first entered (project settings vs the AI 2 first-run dialog) is a minor UI placement still to confirm.
6. **Security hygiene (not a VB task):** a live `.env` with Supabase credentials is in the working tree — confirm it is gitignored / never committed; rotate if it ever entered git history.

## 8. Rulebook placement corrections (reviewer round 2 — to apply to rulebook.ts when plan mode lifts)

- **P1 — Descriptor-driven R7/R3 split (fix the bare-'vs' cross-zone shadow).** Drop the bare `'vs'/'or'/'which'` phrase cues entirely (they outranked descriptor rules and mis-routed condition-vs-condition differentials to Evaluation). **R7** (Evaluation/option-vs-option) now fires on product/treatment signals only: `subject_type ∈ {comparison, product}` · `primary_action=compare-options` · `awareness_level=product-aware` · phrase cue `best`/`top`. **R3** (Cause & Diagnosis/differential) fires on condition/diagnosis signals: `subject_type=diagnosis/test` · `primary_action=get-diagnosis`. An ambiguous "X vs Y" with weak descriptors now matches neither → falls through to the **needs-placement queue** (never defaults to a zone). **Dependency:** the Step-3 enumeration prompt must label condition-vs-condition as `subject_type=diagnosis/test` and product/treatment comparisons as `subject_type=comparison`, so placement has the signal.
- **P2 — Stage-granularity splits.** R9 split: `subject_type=cost` → Decision & Purchase **price** (new rule R9C); `find-where-to-buy`/`transactional` → **where-to-buy** (R9). R10 split: `learn-usage/dosage` → Post-Purchase **usage/dosage** (R10); `check-safety/side-effects` → **side-effects/safety** (new rule R10S). Routed by each triggering signal.
- **P3 — verticalRank unchanged** (unknown-stage→front-of-zone is correct for parent/spine shells). Genuine misfits (zone known, no stage — misfit #3) get the generic stage via `genericStageForZone` **in placement.ts**, so only true zone-level parents ride the null-stage→front path.
- **P4 — D-meta fields live on the intent/topic object, not the descriptor vocab.** `subject_type`…`summary` are the descriptor menu; D1 search-volume, D2 clarity, D3 confidence, D4 multiplicity (per-keyword intent count) live on `IntentInstance`/`Topic` (`types.ts`) and persist in `variantBMeta`. Volume drives sibling ordering; multiplicity is derived from the enumeration count.
- **P5 — Intended universal-layer placement gaps.** Subject types with no universal rule — `definition, prognosis, provider, lifestyle/self-care, comorbidity, anatomy, prevalence` (and the `awareness`/`general-noticing` zone) — fall to the needs-placement queue (misfit #1, rule-gap) until a niche/lessons rule adds coverage. Intended, not a bug.
- **Test additions** (when written): R3-not-R7 for condition-vs-condition; R7 for product comparison; ambiguous-vs → needs-placement; cost→price; usage→usage/dosage; safety→side-effects/safety.

## 9. SESSION WRAP-UP — execution spec (docs/continuity only; NO build, NO schema, NO spend)

Resume target for Variant B = **`./resume-workflow 1`** (Variant B is W#1 Keyword-Clustering-surface work; W#1 is graduated on `main`). That script reads **`docs/KEYWORD_CLUSTERING_NEXT_SESSION.md`** → copies it to `.claude/active-workflow-prompt.md` (single-use) → the SessionStart hook injects it. The bare `./resume` reads `docs/NEXT_SESSION.md`. Update BOTH so either command lands on Variant B Step 1.

**9.1 `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (rewrite — the W#1 queued-next pointer):**
- **Queued next task:** *Variant B ("AI 2") — Step 1: the GATED schema delta.* Branch `main`.
- State: implementation plan in `Workflow 1 AI V2/` approved-in-principle; **Step 0 DONE + test-passing** (`src/lib/variant-b/types.ts`, `carrier-dedup.ts` 17✅, `rulebook.ts` + reviewer-round-2 placement fixes 22✅; tsc clean; files untracked on `main`).
- **Next action = the schema delta** (CanvasNode nullable cols `zone/stage/verticalRank/siblingOrder/isSpine/variantBMeta` + new `CLREntry` table + `Project.nicheSlug`). **Do NOT push until the director approves it AND the schema-owner flag is claimed. Do NOT claim the flag now — claim it in-session, immediately before the push** (MULTI_WORKFLOW_PROTOCOL).
- Then in order: seed-rulebook + `rulebook-assembly.ts` (the union read-path) + diagnostic (behind the cost-confirm button) → remaining pure libs → client run-loop + overlay → three-state toggle + keyword-clone → materialize → /canvas/rebuild → A/B comparison (separate read-only view).
- **Locked resolutions to carry in:** (1) effective rulebook = universal(code) ∪ active-niche ∪ approved-candidate DB entries, injected into every pure lib + prompt; (2) generous/high-recall intent enumeration (over-enumerate OK; validators flag omission, never penalize over-enumeration); (3) reorg-sweep cadence configurable + guaranteed final sweep; (4) A/B comparison = separate read-only view, NOT a 4th mode.
- Group B docs to load next session: the four `Workflow 1 AI V2/` core docs (README, technical-spec, binding-addendum, rulebook-v0.2) + this plan file + `docs/MULTI_WORKFLOW_PROTOCOL.md`.
- Note: **H-1 slice 4 (action-history before-state) is DEFERRED, still OPEN** in `KEYWORD_CLUSTERING_POLISH_BACKLOG.md` — director chose Variant B as the immediate next; H-1 remains queued behind it.

**9.2 `docs/NEXT_SESSION.md` (update the platform-wide `./resume` pointer):** `## Branch` = `main`; `## Launch prompt` mirrors 9.1 (Variant B Step 1, schema delta pending approval) so a bare `./resume` also lands here.

**9.3 `docs/ROADMAP.md`:**
- **Current Active Tools table (line ~523):** update the **W#1 row** — Last Session = this session (Variant B Step 0 + plan); Next Session = "Variant B ("AI 2") Step 1 — schema delta pending director approval"; **Schema-change in flight? = No** (add inline note: "next session flips to Yes immediately before the gated CanvasNode/CLREntry/nicheSlug push").
- **Add a new Variant B roadmap entry** (next-to-do, existing `(a.NNN)` ID format) capturing: approved-in-principle plan; Step 0 done; the gated schema delta as the next action; the full build order; and the four locked resolutions.

**9.4 Standard §4 Step 1 doc-batch (via the `plos-doc-batch` agent or end-of-session skill):** CHAT_REGISTRY (new session entry), DOCUMENT_MANIFEST (register `Workflow 1 AI V2/` + `src/lib/variant-b/` + this plan), CORRECTIONS_LOG (optional — the bare-'vs' placement-cue correction). The three resume-critical files (9.1–9.3) are mandatory; the rest complete the protocol.

**Guardrails for this wrap-up:** documentation/continuity writes ONLY. No `prisma db push`, no schema-owner flag claim, no code build, no AI/model spend. Step 0 files stay as-is on disk (untracked); committing them is part of the next build session, not this wrap-up (unless director says otherwise).

*End of writeup. Plan file updated with the wrap-up execution spec; the doc/continuity writes (9.1–9.4) execute on approval. No schema, build, or spend.*
