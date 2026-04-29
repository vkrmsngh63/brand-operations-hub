# DEFENSE-IN-DEPTH AUDIT DESIGN
## Redundancy + invariant-enforcement design for the Auto-Analyze pipeline (Keyword Clustering)

**Created:** April 29, 2026 (Defense-in-Depth Audit design session — design-only, no code, no DB, no schema, no prompt changes)
**Created in session:** session_2026-04-29_defense-in-depth-audit-design (Claude Code)
**Implementation Session 1 shipped:** April 29, 2026 (`session_2026-04-29-b_defense-in-depth-impl-1`) — Option β Session 1 landed §2 ESLint rule + 4 annotations + §3.R2 post-Reconcile-Now diff-empty WARN + §5.G1 `/canvas/rebuild` payload-sanity at 50% threshold (per director Q1=A) + §5.G2 `/canvas/nodes` GET retry on Prisma transient codes with backoff [100ms,500ms]. R3 deferred to Scale Session B; R4 deferred per director Q2=B; G3 deferred to Scale Session B. 30 new src/lib unit tests + 13 ESLint rule tests; build clean. **Session 2 (§4 forensic instrumentation + §6 pre-flight self-test) still pending.**
**Group:** B (tool-specific to Keyword Clustering's Auto-Analyze; loaded when defense-in-depth or invariant-enforcement work is in scope)

**Purpose:** This is the canonical reference doc for the proposed redundancy + defense-in-depth mechanisms layered around the Auto-Analyze pipeline. It captures the locked design from this session and serves as the build spec for follow-up implementation sessions. The design covers SIX areas:

1. Per-fix redundancy matrix — for each fix on the current backlog, what could still go wrong, and what backup catches it
2. ESLint custom-rule design — turn the line-163 invariant from a comment into a lint check
3. Runtime invariant check design — assertions at key boundaries that fire before damage spreads
4. Forensic instrumentation design — make a future bug visible the first time it happens, not the tenth
5. Server-side guards design — reject impossible-shaped payloads at the API boundary, retry transient flakes
6. Run-start pre-flight self-test design — verify the world is sane before spending $50 on a doomed run

**Background — why this design exists:**

The 2026-04-28 full-Bursitis V3 run revealed two HIGH-severity bugs that escaped every prior layer of testing:

- **Bug 1 (canvas-blanking)** — `useCanvas.fetchCanvas` silently zeroed client state on a 5xx flake from `/canvas/nodes`. Twice in 151 batches, the model received an empty TSV, rebuilt a fresh skeleton from scratch, and reconciliation flipped 84 keywords/event to Reshuffled. 168 keywords lost their canvas anchor mid-run.
- **Bug 2 (closure-staleness)** — `AutoAnalyze.tsx:830` walked the closure-frozen `allKeywords` prop instead of `keywordsRef.current`, in violation of the documented invariant at line 153. Every reconciliation pass on every batch since 2026-04-25 was reading stale data; 84 keywords got stuck Reshuffled forever.

Both bugs were FIXED in the 2026-04-29 bug-fix session with three layers of defense each — a strong precedent the director set with the directive *"fix the fundamental problem long term."* The structural prevention worked: each fix now has both a primary mechanism AND independent backups; the bug class can't recur unless multiple layers fail simultaneously.

**But the per-fix work didn't extend the same protection codebase-wide.** The line-153 invariant comment exists, was understood, and was still violated at line 830 — proving that documented conventions don't catch regressions reliably under cognitive load. The 5xx flake on `/canvas/nodes` had no server-side mitigation; the canvas-blanking signature couldn't have been refused at the API boundary; nothing watched batch boundaries for size anomalies; no pre-flight self-test fired before the run consumed $80.

This design fills the codebase-wide gap.

**Director's framing (verbatim 2026-04-28):** *"think if redundancies may be needed and if so, to add them, in case our fixes fail during a session (which has happened before)."*

**Scope reframe — design only, no code this session.** This doc captures locked decisions and a multi-session implementation plan. Implementation work is deliberately deferred — the design must land first so the director can see the full surface before committing implementation budget across what could be 1-3 follow-up sessions.

---

## 0. Status, scope, and what this design assumes

### 0.1 What's already shipped (counts toward this design's per-fix matrix, not separate work)

**Updated 2026-04-29-b after Implementation Session 1 (Option β Session 1):** the rows below were the table-stakes from the prior bug-fix session; in this session we layered the codebase-wide defenses on top — ESLint rule (§2), runtime invariant R2 (§3), and server-side guards G1+G2 (§5) all SHIPPED. See the per-section "Status updated" notes below for current state of each piece.

The 2026-04-29 bug-fix session shipped these defenses **for the two specific shipped bugs**:

| Mechanism | Where | Layer |
|---|---|---|
| `parseCanvasFetchResponses` pure helper | `src/lib/canvas-fetch-parser.ts` | Bug 1 Layer 1 |
| `useCanvas` uniform throw-on-failure contract (5 methods) | `src/hooks/useCanvas.ts:56-209` | Bug 1 Layer 1 |
| `runLoop` fail-fast pre-flight (canvas non-zero → zero between batches) | `AutoAnalyze.tsx:902-930` | Bug 1 Layer 2 |
| `lastSeenNodesCountRef` watermark | `AutoAnalyze.tsx:154-161, 861` | Bug 1 Layer 2 |
| Existing `runLoop` outer try/catch routing to `API_ERROR` | `AutoAnalyze.tsx:1005-1034` | Bug 1 Layer 3 (now actually wired) |
| `computeReconciliationUpdates` pure helper | `src/lib/reconciliation.ts` | Bug 2 Layer 1 |
| `doApplyV3` entry shadow-binding (`allKeywords`, `pathways`) | `AutoAnalyze.tsx:690-704` | Bug 2 Layer 2 |
| New `pathwaysRef` matching the existing `nodesRef`/`keywordsRef`/`sisterLinksRef` pattern | `AutoAnalyze.tsx:153, 179` | Bug 2 Layer 2 |
| Line-163 invariant comment rewritten to describe the shadow strategy positively | `AutoAnalyze.tsx:163-171` | Bug 2 Layer 3 |
| Reconcile Now admin button | `AutoAnalyze.tsx:1156-1245` | Forensic + healing tool |
| 26 new unit tests + 74 existing all passing | `*.test.ts` | Test suite |

These are the table stakes. Everything in this design layers around / on top of them.

### 0.2 What this design covers

The five remaining design goals from the ROADMAP "🛡️ Redundancy + Defense-in-Depth Audit" item, expanded into six sections per the director's working list:

1. **Per-fix redundancy matrix** — extends the per-fix Layer-N pattern to every backlog item, not just the two shipped bugs.
2. **ESLint custom-rule design** — codifies the line-163 invariant as a lint check.
3. **Runtime invariant check design** — dev-mode assertions + production-warn checks at key boundaries.
4. **Forensic instrumentation design** — verbose batch-boundary logging + downloadable structured log + dry-run mode.
5. **Server-side guards design** — `/canvas/rebuild` payload-shape rejections + `/canvas/nodes` retry wrapper.
6. **Run-start pre-flight self-test design** — verify refs match DB + prompts loaded, before $50 of API spend.

### 0.3 What this design does NOT cover

- **The two shipped bug-fixes themselves** — they're in the ROADMAP "Canvas-Blanking" + "Reconciliation-Pass Closure-Staleness" entries, FIXED.
- **Tiered Canvas Serialization** — that's `INPUT_CONTEXT_SCALING_DESIGN.md` Scale Sessions B-E.
- **Action-by-action feedback workflow** — separate design, ROADMAP "Action-by-action feedback + second-pass refinement" entry.
- **Hybrid cost/quality strategy** — separate design, ROADMAP "Intelligent hybrid cost/quality strategy" entry.

### 0.4 Reversibility framing for the director

Most mechanisms in this design are **easy to remove later** if they prove noisy or unhelpful. Specifically:

- ESLint custom rule — disabling is a one-line config change.
- Runtime invariant checks — gated by a dev-mode flag; production behavior unchanged unless the check fires a structured log line.
- Forensic instrumentation — opt-in; off by default.
- Server-side guards — designed as configurable thresholds; loosening them is a one-line edit.
- Pre-flight self-test — runs before any spend, takes <2 seconds; bypass via a config option.

**One mechanism is closer to one-way:** if we add the dry-run mode (Section 4.3), the test fixtures it depends on become a minor maintenance burden. Removing them later loses the dry-run capability. Recommendation: build dry-run AFTER the other mechanisms ship and we know what synthetic scenarios are useful.

### 0.5 Mechanical assumption: the test runner

All test patterns in this design assume the existing `node --test --experimental-strip-types` runner that `src/lib/canvas-fetch-parser.test.ts` and `src/lib/reconciliation.test.ts` already use. No new test infrastructure required.

### 0.6 Mechanical assumption: ESLint

The codebase uses ESLint 9 with `defineConfig` from `eslint/config` and `eslint-config-next/{core-web-vitals,typescript}`. Custom rules attach via the `defineConfig` array. No plugin extraction required for our case (the rule lives in `eslint-rules/` adjacent to the config). See Section 2 for the mechanical detail.

---

## 1. Per-fix redundancy matrix

For each item on the current backlog, this section answers five questions that make redundancy decisions explicit:

- **What does the primary fix do?**
- **What's the failure mode if it breaks or is incompletely applied?**
- **What's the visible signature of that failure?**
- **What backup mechanism (if any) catches it independently?**
- **Is the backup worth the code complexity?**

The matrix is grouped by item. **Items A and B are already shipped** — included for completeness so future readers can verify the redundancy is real, not just promised. **Items C-F are pending implementation.**

### 1.A — Bug 1: Canvas-Blanking Intermittent Bug (SHIPPED)

| Question | Answer |
|---|---|
| Primary fix | `parseCanvasFetchResponses` rejects non-array nodes / non-object state / HTTP errors → `useCanvas.fetchCanvas` preserves prior state and **throws** instead of zeroing. |
| Failure mode if primary breaks | A future change to `parseCanvasFetchResponses` could reintroduce a permissive path (e.g., "accept null body and fall through to `[]`"); a future change to `useCanvas` could swallow the throw. |
| Visible signature | Same as the original bug — TSV size collapses to ~20k tokens; canvas count drops to 12 nodes after apply; reconciliation flips dozens of keywords to Reshuffled. |
| Backup mechanism | **Layer 2 — `runLoop` fail-fast pre-flight at lines 919-929.** Watches `lastSeenNodesCountRef` vs. `nodesRef.current.length`. If the previous batch ended with N>0 nodes and the current batch starts with 0, immediately `setAaState('API_ERROR')` and pause. Catches the bug at the wiring layer regardless of why state went empty. |
| Backup worth it? | **Yes, already shipped.** The Layer 2 check is ~12 lines and runs once per batch (cost: free). It catches not just regressions of the original bug but ANY future failure mode that produces the same symptom from a different root cause. |
| Layer 3 | The existing `runLoop` outer try/catch already routes thrown errors to `API_ERROR`. The Layer 1 throw contract now actually propagates through that path. |

**Status:** ✅ All three layers shipped.

### 1.B — Bug 2: Reconciliation-Pass Closure-Staleness (SHIPPED)

| Question | Answer |
|---|---|
| Primary fix | Reconciliation logic extracted to pure `computeReconciliationUpdates(keywords, placedSet, archivedSet)`. The pure helper takes its inputs explicitly — there's no closure to capture from. |
| Failure mode if primary breaks | A future engineer could call the helper with the wrong keyword list — passing `allKeywords` (the prop) instead of `keywordsRef.current`. |
| Visible signature | Status drift across batches; "Reshuffled" count climbs without explanation; `Reconcile Now` shows a non-zero diff after every run. |
| Backup mechanism | **Layer 2 — `doApplyV3` entry shadow-binding at lines 703-704.** Locals named `allKeywords` and `pathways` are bound to `keywordsRef.current` / `pathwaysRef.current` at the top of the function. The closure-frozen props are physically unreachable for every read inside the function — accidental reintroduction of `for (const kw of allKeywords)` reading the prop is structurally prevented. |
| Backup worth it? | **Yes, already shipped.** Two lines of code at function entry; zero runtime cost; structural rather than convention-based. |
| Layer 3 | Line-163 invariant comment rewritten to describe the shadow strategy as the new convention; future code added to `doApplyV3` reads fresh state by default. |

**Status:** ✅ All three layers shipped. **A FUTURE Layer 4 from this design's Section 2:** ESLint custom rule that flags any prop read by name inside an identified runLoop-reachable function. That rule turns Layer 3's documented convention into a build-time gate.

### 1.C — Mid-run Batch Queue Refresh (PENDING — Phase-1 polish item)

This polish item exists in `ROADMAP.md` independently. The current behavior: `buildQueue` at run-start freezes the batch list; keywords created mid-run (by reconciliation flipping things to Reshuffled) are NOT picked up by the running session. The fix: add a "Refresh Queue" button + auto-refresh trigger.

| Question | Answer |
|---|---|
| Primary fix | Add a button in the Auto-Analyze panel that re-runs `buildQueue` against `keywordsRef.current` and merges newly-eligible keywords into the unprocessed tail of `batchesRef.current`. |
| Failure mode if primary breaks | Refresh appends duplicate keyword IDs (already-batched + newly-batched), causing double-processing. Or refresh runs while a batch is in flight, mutating `batchesRef.current` mid-iteration. |
| Visible signature | A batch processes the same keyword twice (duplicate placements; reconciliation log shows "X already placed"); the run mid-batch crash-loops with index errors. |
| Backup mechanism | **Layer 2 (recommended):** the merge logic uses a `Set<string>` of already-queued keyword IDs and skips duplicates explicitly. Pure helper `mergeQueueRefresh(existingBatches, freshlyEligibleKeywords)` returns the new tail; gated on `aaState !== 'RUNNING'` (button disabled while running). **Layer 3:** unit-test pattern that verifies the merge is idempotent (call it twice on the same input → second call returns empty tail). |
| Backup worth it? | **Yes** — the duplicate-processing failure is silent (no exception), so the structural Set-based dedup is essential. The idempotency test is ~15 lines and prevents the regression. |

**Estimated implementation effort:** ~2-3 hours including tests. Independent of any other item; can ride alongside or stand alone.

### 1.D — Scale Session B (Tiered Canvas Serialization + intentFingerprint backfill)

This is the largest pending architectural item. `INPUT_CONTEXT_SCALING_DESIGN.md` is the canonical spec. Defense-in-depth concerns specific to it:

| Question | Answer |
|---|---|
| Primary fix | Schema migration adds `intentFingerprint` column to `CanvasNode`; tier-decider chooses tier per topic per batch; serializer emits 3 different per-topic shapes. |
| Failure mode if primary breaks | (a) Tier-decider produces an empty / undefined `intentFingerprint` on Tier 1 → cross-canvas intent-equivalence detection fails silently. (b) AI-generated backfill script generates wrong fingerprints for existing topics → Tier 1 misclassifies for the rest of the topic's life. (c) Serializer rounding mis-classifies a topic that should have been Tier 0 as Tier 2 → model gets impoverished context for an actively-being-worked topic. |
| Visible signature | Long-tail intent-equivalence violations the model wouldn't have made under V3 baseline; quality regression hard to attribute. |
| Backup mechanism | **Layer 2 — runtime invariant check (per Section 3 of this design):** at the top of every batch's TSV build, assert that every Tier 1 topic has a non-empty `intentFingerprint`. If not, fall back to Tier 0 for that topic and log a warning. **Layer 3 — forensic instrumentation (per Section 4):** the structured log for each batch records the tier distribution (count of T0 / T1 / T2) and median intent-fingerprint length. Anomalies show up in the log without any user action. **Layer 4 — server-side guard (per Section 5):** the `/canvas/nodes` PATCH that writes `intentFingerprint` rejects empty-string fingerprints with a 400 (force the AI to retry rather than persist a degenerate value). |
| Backup worth it? | **Yes** — Scale Session B's failure modes are quality regressions (silent), not crashes (loud). Every layer of detection is high-value. The fall-back-to-Tier-0 path is ~5 lines; the structured log is built once and reused for every batch; the server-side guard is ~3 lines. |

**Cross-reference:** Section 3 (runtime invariants), Section 4 (forensic instrumentation), Section 5 (server-side guards) — implementation of each backup is detailed in those sections.

### 1.E — Action-by-Action Feedback + Second-Pass Refinement Workflow (DESIGN-PENDING)

This is the workflow design from director feedback item #7. Relevance to defense-in-depth:

| Question | Answer |
|---|---|
| Primary fix | A new workflow pass where the admin reviews each AI action (place keyword X at topic Y) and can flag wrong decisions; the second AI pass uses the flags as additional context. |
| Failure mode if primary breaks | Flag persistence fails silently (admin marks 100 actions as "wrong"; flags don't survive page reload); second-pass prompt template misincorporates flags (e.g., misformats them as instructions and the AI ignores them). |
| Visible signature | Second pass produces same wrong placements the admin already corrected; flags appear to "do nothing." |
| Backup mechanism | **Layer 2 — Reconcile Now-style verification button** ("Verify Flags Persisted"): admin can click any time and see flag count + sample 5 random flag rows. **Layer 3 — server-side guard:** the `/feedback` POST endpoint returns the persisted flag's UUID; the client confirms by GET-fetching it before showing the admin "saved." |
| Backup worth it? | **Yes** — the silent-loss failure mode is the worst kind for an admin trust problem. The verification button is ~30 lines; the round-trip GET is ~5 lines. Both are cheap. |

**Cross-reference:** This item's implementation is sized in its own design session (analogous to Scale Session A). The redundancy notes here just lock in what to budget for in that design.

### 1.F — Reconcile Now (SHIPPED — but documenting the matrix entry for completeness)

The Reconcile Now button shipped 2026-04-29. Defense-in-depth notes:

| Question | Answer |
|---|---|
| Primary fix | One-shot drift healer — fetches keywords + canvas + removed-keywords fresh from server, runs `computeReconciliationUpdates`, PATCHes the result. |
| Failure mode if primary breaks | Button silently fetches cached/stale data, computes a wrong diff, PATCHes wrong updates. |
| Visible signature | Reconcile Now shows "fixed N keywords" but a follow-up Reconcile Now shows the same N still need fixing (idempotency violation). |
| Backup mechanism | **Already structural:** `handleReconcileNow` uses `authFetch` directly (no closure-stale data path) and the `computeReconciliationUpdates` helper is the same one the per-batch reconciliation uses (provably correct via shared test suite). **Layer 2 — runtime invariant check:** after PATCH, run a follow-up reconcile-diff in-memory; assert it's empty. If non-empty, log a warning ("Reconcile Now didn't fully heal — investigate"). |
| Backup worth it? | **Marginal.** The structural correctness is high. The Layer-2 check costs ~5 lines. Recommendation: include it for cheap, but not blocking. |

### 1.G — Summary table

| Item | Primary | Layer 2 | Layer 3 / 4 | Status |
|---|---|---|---|---|
| **A. Canvas-blanking** | Defensive `useCanvas` contract | runLoop fail-fast pre-flight | API_ERROR routing | ✅ SHIPPED |
| **B. Closure-staleness** | Pure `computeReconciliationUpdates` helper | `doApplyV3` shadow-binding | Line-163 invariant comment + (future) ESLint rule | ✅ SHIPPED (Layer 4 from §2 pending) |
| **C. Queue refresh** | Refresh button | Set-based dedup; gated on `aaState` | Idempotency unit-test pattern | ⏳ PENDING |
| **D. Scale Session B** | Tier-decider + intentFingerprint | Tier-1-empty-fingerprint runtime invariant + fallback to Tier 0 | Forensic structured log + server-side reject empty fingerprint | ⏳ PENDING (build sessions B-E) |
| **E. Action-by-action feedback** | Flag persistence + second-pass prompt | Verify Flags Persisted button | Server-side flag GET round-trip | ⏳ PENDING (separate design) |
| **F. Reconcile Now** | Pure helper + fresh fetch | Post-PATCH diff-empty assertion (cheap, optional) | (none needed) | ✅ SHIPPED (Layer 2 nice-to-have) |

---

## 2. ESLint custom-rule design — `no-prop-reads-in-runloop`

**Status updated 2026-04-29-b: SHIPPED.** Rule lives at `eslint-rules/no-prop-reads-in-runloop.js` (~165 lines including doc); unit tests at `eslint-rules/no-prop-reads-in-runloop.test.mjs` (13 tests, passing); wired into `eslint.config.mjs` as a local plugin. `@runloop-reachable` annotations added to `AutoAnalyze.tsx` on `runLoop`, `doApplyV3`, `processBatchV3`, `validateResultV3`. Smoke test verified the rule fires on a temporary `for (const kw of allKeywords)` insertion in `runLoop`. Lint clean for the new rule across the codebase.


### 2.1 The problem this rule solves

Bug 2 was a violation of a documented convention. The line-163 comment said "runLoop-reachable code MUST read via `*Ref.current`." A future engineer wrote `for (const kw of allKeywords)` at line 830 and the convention was silently broken. The 2026-04-29 fix shipped a structural defense (shadow-binding at function entry), but ONLY for `doApplyV3`. Every OTHER runLoop-reachable function — `runLoop` itself, `processBatchV3`, `validateResultV3`, future ones — still relies on documented convention.

A custom ESLint rule turns the convention into a build-time gate.

### 2.2 The rule's contract (locked)

**Name:** `no-prop-reads-in-runloop`

**What it flags:** Any direct identifier read of a name in the `RUNLOOP_REACHABLE_PROPS` allow-list, inside a function body that is annotated as runLoop-reachable.

**Where it applies:** `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` (and any future runLoop-reachable file).

**Allow-list of prop names this rule guards:** `nodes`, `allKeywords`, `sisterLinks`, `pathways`. (These are the four refs the line-163 invariant identifies; adding new refs to the pattern means adding their prop names here.)

**How a function declares itself runLoop-reachable:** a JSDoc-style annotation immediately above the function:

```typescript
/** @runloop-reachable */
async function doApplyV3(...) { ... }
```

The annotation is the lint trigger. No annotation → no check (functions outside the runLoop don't need this guard).

### 2.3 What the rule allows

- **Reading via `*Ref.current`:** `nodesRef.current` is fine (the ref is the freshness contract).
- **Shadow-binding:** `const allKeywords = keywordsRef.current` at function entry binds a local that shadows the prop. After this line, `allKeywords` reads resolve to the local (the linted AST sees the local declaration, not the prop). This is exactly the pattern `doApplyV3` uses now.
- **Reading the prop in a non-runLoop-reachable function:** UI rendering reads `nodes` directly all the time. Those functions don't carry the annotation, so no flag.

### 2.4 Mechanical implementation

**File location:** `eslint-rules/no-prop-reads-in-runloop.js` (a sibling to `eslint.config.mjs`).

**Wiring into the existing config:** `eslint.config.mjs` adds a new rule entry:

```javascript
import noPropReadsInRunloop from './eslint-rules/no-prop-reads-in-runloop.js';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { local: { rules: { 'no-prop-reads-in-runloop': noPropReadsInRunloop } } },
    rules: { 'local/no-prop-reads-in-runloop': 'error' },
  },
  globalIgnores([...]),
]);
```

**Rule logic (pseudo-code):**

1. Walk every `FunctionDeclaration` / `FunctionExpression` / `ArrowFunctionExpression`.
2. If the leading comment block contains `@runloop-reachable`, mark this function as guarded.
3. Inside a guarded function's body, walk every `Identifier` node.
4. For each identifier, check: (a) is its name in the allow-list? (b) is it defined as a local (shadow-binding) in the function's scope? (c) is it accessed through `Ref.current` (parent is `MemberExpression` with `.current`)?
5. Flag (a)-true AND (b)-false AND (c)-false reads with: *"Prop `{name}` read directly in @runloop-reachable function. Read via `{name}Ref.current` or shadow-bind at function entry. See `AutoAnalyze.tsx:163` invariant."*

### 2.5 What the rule does NOT do

- **Does not flag prop READS at function entry for shadow-binding.** `const allKeywords = keywordsRef.current` is a `VariableDeclaration` with the local on the LHS — the rule only checks reads, not declarations.
- **Does not flag prop reads in nested non-runLoop functions inside a runLoop-reachable function.** If `doApplyV3` defines an inner helper that's not itself annotated, the inner helper's reads are NOT checked. (The shadow-binding pattern at the outer entry already protects them.)
- **Does not catch reads through aliases.** `const x = allKeywords; for (const kw of x)` would slip past the rule's identifier-name check. Acceptable trade-off — the lint catches the dominant 99% case (the literal name), and aliasing is rare and conspicuous in code review.

### 2.6 Bootstrapping the annotations

The rule fires only on annotated functions. To bootstrap, the implementation session adds `@runloop-reachable` annotations to:

- `runLoop` (line 902)
- `doApplyV3` (line 690 — already follows the pattern; annotation just makes it lint-checkable)
- `processBatchV3` (the API-call function — reads `nodes`/`allKeywords` to build TSV)
- `validateResultV3` (line 619 — reads `nodesRef.current` correctly today; annotation locks it in)
- Any future async function called from `runLoop`'s body

Once annotated, `npm run lint` will catch a future `for (const kw of allKeywords)` regression at build time.

### 2.7 Estimated implementation effort

- Rule file: ~80 lines of AST walker + tests.
- Config wiring: 5 lines.
- Annotation bootstrap: 4 functions × 1 line each = 4 lines.
- Test fixtures: ~6 small `.tsx` snippets exercising allow / flag cases.
- **Total: ~3-4 hours** for a confident implementation including the test fixtures.

### 2.8 Reversibility

**Easy to remove.** Delete the rule file + remove 5 lines from `eslint.config.mjs` + delete 4 annotation comments. The pattern in code keeps working without the lint check. ~5 minutes.

---

## 3. Runtime invariant check design

### 3.1 The problem this section solves

The line-163 invariant is a static convention. The ESLint rule (Section 2) catches violations at build time. **But some failure modes don't violate the convention** — they emerge from data drift, race conditions, or external flakes. Runtime invariant checks fire at the moment a violation actually happens, when the data is still in scope and a useful diagnostic can be captured.

Already shipped:
- `runLoop` fail-fast pre-flight at lines 919-929 (Bug 1 Layer 2): "if canvas was non-empty last batch and is empty now, pause."

This section designs the FULL set of runtime invariant checks the codebase should have.

### 3.2 The four runtime invariants (locked)

#### 3.2.1 Invariant R1: Canvas non-zero → zero between batches signals state corruption

**Already shipped.** Documenting for completeness.

- **Location:** `runLoop` per-iteration top, `AutoAnalyze.tsx:912-929`.
- **Check:** `lastSeenNodesCountRef.current > 0 && nodesRef.current.length === 0`
- **Action:** `setAaState('API_ERROR')` + pause.
- **Severity:** ERROR — pauses the run.

#### 3.2.2 Invariant R2: Reconciliation diff after PATCH must be empty

**Status updated 2026-04-29-b: SHIPPED.** Implemented in `handleReconcileNow` (`AutoAnalyze.tsx`) immediately after the successful PATCH and before `onRefreshKeywords`. Re-runs `computeReconciliationUpdates` against the in-memory post-PATCH keyword set; logs WARN to the activity log if `verify.updates.length > 0` instructing admin to re-click Reconcile Now. ~22 lines including comment. WARN-level only.

**New.** This is the optional Layer 2 backup for Reconcile Now (Section 1.F).

- **Location:** `handleReconcileNow` after the successful PATCH, before `onRefreshKeywords`.
- **Check:** Re-run `computeReconciliationUpdates(updatedKeywords, placedSet, archivedSet)` in-memory. Assert `result.updates.length === 0`.
- **Action:** If non-empty, log a warning to the activity log: *"Reconcile Now: PATCH succeeded but a follow-up diff still shows N pending updates. Either the server didn't apply all updates, or the input data changed mid-operation. Try clicking Reconcile Now again."*
- **Severity:** WARN — does not pause anything; admin can re-click.
- **Estimated effort:** ~10 lines.

#### 3.2.3 Invariant R3: Tier-1 topic must have non-empty intentFingerprint (Scale Session B build prerequisite)

**New, gated on Scale Session B landing.**

- **Location:** the Tier-1-eligible decision branch in the future serializer.
- **Check:** before emitting Tier 1 row, assert `topic.intentFingerprint && topic.intentFingerprint.length > 0`.
- **Action:** if the fingerprint is missing, fall back to Tier 0 for THIS topic (full row) and log a warning. The run continues with degraded but not broken context.
- **Severity:** WARN with fallback (does not fail the batch).
- **Estimated effort:** ~5 lines per the Scale Session B implementation.

#### 3.2.4 Invariant R4: Refs match props at function entry (dev-mode only)

**Status updated 2026-04-29-b: DEFERRED per director Q2 = Option B** ("ship R1, R2, R3 first; consider R4 only after the cheap ones are in place and we've seen whether the dev-mode signal is useful"). Easily added later — ~25 lines.

**New.** A targeted assertion for the line-163 invariant pattern at runtime.

- **Location:** at the top of each `@runloop-reachable` function. A small helper:

```typescript
function assertRefsMatchInDev(label: string) {
  if (process.env.NODE_ENV !== 'development') return;
  // Compare nodesRef.current vs. nodes prop, etc.
  // Allow stale ref (the typical case during state propagation),
  // but DETECT the case where the prop is NEWER than the ref —
  // the symptom of a missed useEffect-update race.
  ...
}
```

- **Check:** in dev-mode only, compare `nodesRef.current` length to the most-recently-seen-nodes-count. If the props say there are 100 nodes but the ref still has 50, that's the race condition that motivated the Bug 2 shadow-binding pattern.
- **Action:** dev-mode `console.warn` with the function label and the discrepancy.
- **Severity:** dev-mode WARN — invisible in production.
- **Estimated effort:** ~25 lines including the helper + per-function call site.
- **Caveat:** this invariant is the trickiest of the four; it relies on a "watermark" of the most-recent-prop-update-tick, which means adding small bookkeeping to the existing `useEffect` pattern. **Recommendation:** ship R1, R2, R3 first; consider R4 only after the cheap ones are in place and we've seen whether the dev-mode signal is useful.

### 3.3 What this section does NOT do

- **Does not add production-mode assertions.** Production-mode assertions either crash the user-facing UI (bad) or get silently caught and ignored (worse). The four invariants above are all production-mode WARN-level (R1 pauses but does not crash) or dev-mode-only (R4).
- **Does not write a generic invariant framework.** Every check is hand-coded at its specific site. The cost of a framework outweighs the benefit at four checks.

### 3.4 Reversibility

R1: already shipped, removable with a 12-line revert.
R2: ~10 lines, removable trivially.
R3: blocked by Scale Session B; folded into that build's test suite.
R4: ~25 lines + per-function calls, removable trivially.

---

## 4. Forensic instrumentation design

### 4.1 The problem this section solves

The 2026-04-28 canvas-blanking bug fired at batches 70 and 134. The director only spotted the symptom by reading the activity log carefully after the fact. There was no automatic capture of "the canvas was 284 topics at the start of batch 70, then became 12 nodes after apply" — that detail had to be reconstructed by reading the activity log line-by-line.

For the NEXT bug — one we don't yet know exists — the goal is: **capture enough state at every batch boundary that, when the bug fires, the diagnostic data is already there.** No need to re-run the bug to understand it.

### 4.2 The structured log design (locked)

**Format:** newline-delimited JSON (NDJSON), one record per batch boundary.

**Per-record fields:**

```json
{
  "ts": "2026-04-29T14:23:01.234Z",
  "session_id": "<runId>",
  "project_id": "<projectId>",
  "batch_num": 70,
  "phase": "pre_apply" | "post_apply" | "pre_api_call" | "post_api_call",
  "canvas_node_count": 284,
  "canvas_keyword_count": 1208,
  "tsv_input_tokens": 100403,
  "tsv_output_tokens": 4521,
  "model": "claude-sonnet-4-6",
  "cost_this_batch": 0.38,
  "reconciliation": { "to_ai_sorted": 0, "to_reshuffled": 0 },
  "errors": []
}
```

**Where it's written:** in the browser, the records accumulate in an in-memory ring buffer (max 1000 records ≈ ~250 KB). On user click of a "Download log" button (in the Auto-Analyze panel footer alongside Reconcile Now), the buffer is serialized to a `.ndjson` file and triggers a browser download.

**No server persistence in v1.** The director is the only user; the file lands in their downloads folder. Phase 2 multi-user could promote this to server-side per-run logging if needed.

### 4.3 The dry-run mode design (locked, but deferred per §0.4)

**What it is:** a special run mode where the pipeline executes end-to-end against a synthetic in-memory canvas + keyword set, with **no DB writes** and **no API calls** (the "model response" is replaced by a hand-crafted operation list from a fixture file).

**Why useful:** lets the test suite exercise the full `runLoop` → `processBatchV3` → `validateResultV3` → `doApplyV3` chain without spending money or touching real data. Catches integration bugs the unit tests miss (e.g., refs being out of sync between batches).

**Mechanical shape:**

- New config option in the Auto-Analyze panel: "Dry-run mode" (off by default).
- When on: `processBatchV3` is replaced with a function that reads the next operation set from `src/lib/test-fixtures/dry-run-batches/batch-N.json`. Cost stays $0; no AbortController; no API key required.
- `doApplyV3` is unchanged — operations apply to the synthetic canvas same as real ones — except the rebuild API call is mocked to return success without touching DB.
- The dry-run produces a structured log just like a real run, plus a final assertion pass: "did the synthetic canvas reach the expected end state?"

**Why defer:** the maintenance burden of test fixtures is real. Recommendation: ship structured-log first (§4.2) and runtime invariants (§3); revisit dry-run after a few months of production use, when we know what synthetic scenarios are most valuable.

### 4.4 What this section does NOT do

- **Does not add production telemetry to a third-party service.** The structured log lives client-side; export is manual. Adding Datadog / Sentry / similar is a Phase 2 decision; not in scope here.
- **Does not retroactively log past runs.** This is forward-only.

### 4.5 Estimated effort

- Structured log + ring buffer + download button: ~3-4 hours including a small unit test on the ring-buffer eviction behavior.
- Dry-run mode (deferred): ~6-8 hours including 2-3 fixture batches.

### 4.6 Reversibility

Structured log: easy to remove (delete the buffer + the download button + the per-batch emit calls). ~30 minutes.
Dry-run mode (when built): the fixtures and the conditional are removable, but the dry-run code path adds a permanent option to the config UI. Slightly stickier — see §0.4.

---

## 5. Server-side guards design

### 5.1 The problem this section solves

Bug 1's root trigger was a 5xx flake on `/canvas/nodes` GET, returning `{ error: 'Failed to fetch nodes' }, status: 500`. The CLIENT now handles this defensively (Bug 1 Layer 1 — useCanvas throws, preserves prior state). But the underlying transient flake — likely a Supabase pgbouncer connection pool issue under sustained load — is still untreated. **Two batches in 151 (~1.3%) is too high a base rate.**

Server-side guards do two things:
1. **Reject impossible-shaped payloads at the API boundary.** The canvas-blanking signature (e.g., `deleteNodeIds.length === 0` AND `nodes.length << current canvas size`) shouldn't be acceptable as a rebuild request.
2. **Retry transient flakes server-side** so they don't surface to the client at all.

### 5.2 Guard G1: `/canvas/rebuild` payload sanity check

**Status updated 2026-04-29-b: SHIPPED.** Pure helper at `src/lib/canvas-rebuild-guard.ts` (~75 lines) exposing `evaluateRebuildPayload({ newNodeCount, currentNodeCount, hasExplicitDeletes, nodesProvided })` and `G1_SHRINK_THRESHOLD = 0.5`. Threshold locked at **50%** per director's Q1 = Option A. Wired into POST `/api/projects/[projectId]/canvas/rebuild` at the top of the `try` block (after auth, before any DB op): if `body.nodes` is provided, the route counts current rows and rejects HTTP 400 with a structured reason if the helper says "blocked." 13 unit tests covering matrix cells (pass-through: delete-only, explicit-deletes, empty current, growth, no-change, 40%, exactly 50%; block: 51%, 95% / batch-70 signature, 98% / batch-134 signature, full-wipe).


**Location:** `src/app/api/projects/[projectId]/canvas/rebuild/route.ts` POST handler, at the top of the `try` block (after auth, before any DB op).

**Check (lock-1):** if `body.nodes` is provided and `body.deleteNodeIds` is empty AND the new node count is dramatically smaller than the existing canvas size (>50% drop), reject with HTTP 400 and the message: *"Rebuild rejected: payload would shrink canvas from N to M nodes without explicit deletions. This is the canvas-blanking signature. If intentional, include deleteNodeIds."*

**Threshold tuning:** start with **>50% drop** as the trigger. The 2026-04-28 events shrank the canvas from 284 → 12 (95% drop) and 584 → 11 (98% drop). 50% gives ample headroom for legitimate batch operations (which typically modify <5% of nodes).

**Why this is safe:** in normal operation, every rebuild payload either grows the canvas or leaves it stable. A shrink is rare — and a >50% shrink without explicit `deleteNodeIds` is the exact bug signature.

**Failure mode of the guard itself:** an unusual but legitimate operation (e.g., an admin-initiated mass cleanup) gets rejected. Mitigation: the rejection message tells the caller exactly how to express their intent — pass `deleteNodeIds` for the topics being removed.

**Estimated effort:** ~10 lines in the route handler + a unit test on the count-comparison logic. ~30 minutes.

### 5.3 Guard G2: `/canvas/nodes` GET retry-on-transient-error wrapper

**Status updated 2026-04-29-b: SHIPPED.** Pure helper at `src/lib/prisma-retry.ts` (~85 lines) exposing `withRetry(fn, options)` and `isTransientPrismaError(e)`. Transient codes: P1001, P1002, P1008, P2034. Backoff: 100ms before retry 1, 500ms before retry 2 — total worst-case extra latency ≈ 600ms. Hard errors pass through immediately. Wired into GET `/api/projects/[projectId]/canvas/nodes` only this session (the bug's exact trigger surface). 17 unit tests including transient-then-success on attempt 2/3, hard-error-after-transient stops retry, custom predicate honored, sleep-mock verifies backoff sequence.


**Location:** `src/app/api/projects/[projectId]/canvas/nodes/route.ts` GET handler, wrapping the `prisma.canvasNode.findMany` call.

**Behavior:** if the Prisma call throws a connection-pool / timeout / 5xx-class error (matched against a small list of error codes), retry up to 2 more times with exponential backoff (100ms, 500ms). If all 3 attempts fail, return 500 as today.

**Why this matters:** the client's defensive contract (Bug 1 Layer 1) preserves state on 500 — but a paused run is still a user-visible disruption. If the 500 was just a flaky pool connection and a 100ms retry would have succeeded, the run shouldn't have been paused.

**Implementation shape:**

```typescript
async function findManyWithRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < maxAttempts; i++) {
    try { return await fn(); }
    catch (e) {
      lastError = e;
      if (!isTransient(e)) throw e;
      if (i < maxAttempts - 1) await new Promise(r => setTimeout(r, 100 * 5 ** i));
    }
  }
  throw lastError;
}
```

**`isTransient` definition:** matches Prisma error codes for connection-pool / timeout / serialization failure (P1001, P1002, P1008, P2034). Hard errors (NOT_FOUND, UNAUTHORIZED, validation) pass through immediately.

**Failure mode of the guard itself:** a slow flake that's persistent (not transient) costs an extra ~600ms of latency before the inevitable 500 surfaces. Acceptable.

**Estimated effort:** ~20 lines including the helper + applying it to the GET handler. Plus a unit test on `isTransient`. ~45 minutes.

### 5.4 Guard G3: `/canvas/nodes` PATCH rejects empty intentFingerprint (Scale Session B prerequisite)

**Location:** `src/app/api/projects/[projectId]/canvas/nodes/route.ts` PATCH handler.

**Check:** if the update body sets `intentFingerprint`, require the value to be a non-empty string. Empty/null/undefined → reject with 400.

**Why this matters:** a degenerate fingerprint persisted to DB causes Tier 1 misclassification for the rest of the topic's life (Section 1.D failure mode (a)).

**Estimated effort:** ~3 lines. Folded into Scale Session B implementation, not a separate session.

### 5.5 What this section does NOT do

- **Does not add server-side rate limiting.** That's a Phase 2 / 3 concern at platform scale.
- **Does not add a server-side run-state machine** that "knows" a run is in flight. Each API call stays stateless. The CLIENT owns the run lifecycle; server-side guards just refuse impossible payloads.
- **Does not change the response shape on the happy path.** All current callers continue to work unchanged.

### 5.6 Reversibility

G1: 10 lines, easy to remove or relax (change the threshold).
G2: helper + wrapping; removable. The wrapping pattern could be promoted to other GET handlers later — bonus, not blocking.
G3: 3 lines, trivial.

---

## 6. Run-start pre-flight self-test design

### 6.1 The problem this section solves

A typical Auto-Analyze run on Bursitis costs $70-150 and takes 2-4 hours. **The cost of a doomed run is non-trivial.** If the prompts didn't load, or the canvas refs are out of sync with the DB, or the API key is invalid, the run should fail at second 1, not minute 47.

Already exists implicitly:
- `handleStart` checks API key + seed words + initial prompt length (lines 1052-1057).

This section designs the FULL pre-flight self-test that should run before `runLoop()` starts.

### 6.2 The pre-flight checklist (locked)

The pre-flight runs as a sequential set of checks. ANY failure → display a structured error in the panel + abort the start. None → proceed to `runLoop()`.

| # | Check | Why |
|---|---|---|
| **P1** | API key set (already exists) | Fail at second 1, not minute 1 |
| **P2** | Seed words present (already exists) | Same |
| **P3** | Initial prompt > 100 chars (already exists) | Same |
| **P4** | Primer prompt present and parseable | Catches a missed paste of the V3 prompt update |
| **P5** | `nodesRef.current` matches `/canvas/nodes` GET response (count + sample of stableIds) | Catches the "client lost state mid-session and didn't refetch" case |
| **P6** | `keywordsRef.current` matches `/keywords` GET response (count + sample of IDs) | Same as P5 for keywords |
| **P7** | `pathwaysRef.current` populated if canvas has nodes with `pathwayId` | Catches the "pathway ref empty but canvas references pathway IDs" inconsistency |
| **P8** | At least one keyword in scope (already exists, lines 1056-1057) | Don't start a no-op run |
| **P9** | Cheap test API call to Anthropic with the configured model + a 50-token prompt | Verifies API key validity + model availability + cache responsiveness; cost ~$0.001 |
| **P10** | Browser localStorage writable (write+read+delete a probe key) | The settings persistence + checkpoint-resume both depend on this; better to fail loudly at start than silently mid-run |

### 6.3 What each check actually does (mechanical detail)

**P5: `nodesRef.current` matches `/canvas/nodes` GET**

```
fresh = await fetch /canvas/nodes
if (fresh.length !== nodesRef.current.length) → FAIL with diff
sampleIds = first 5 stableIds from fresh, sorted
localIds = first 5 stableIds from nodesRef, sorted
if (sampleIds !== localIds) → FAIL with mismatch detail
```

**Why this matters:** if the user opened the project, ran an Auto-Analyze, paused mid-way, switched tabs for an hour, resumed — and during that hour, an admin in another session modified the canvas — the resumed run would write against stale state. P5 catches it.

**P6: same pattern for keywords.** Cheap (one GET each).

**P7: pathway-ref consistency**

```
canvasPathwayIds = unique pathwayId values from nodesRef.current
if (canvasPathwayIds.length > 0 && pathwaysRef.current.length === 0) → FAIL
```

**Why this matters:** the 2026-04-29 fix added `pathwaysRef`. A future bug where the ref isn't populated (e.g., the parent component forgot to pass `pathways` prop) would be caught here, before the run starts emitting bad rebuild payloads.

**P9: cheap test API call**

```
response = await fetch /api/claude (model: configured, prompt: "Reply with 'OK'", max_tokens: 50)
if (!response.ok) → FAIL with the API error message
```

Cost ~$0.001 with Sonnet 4.6. Catches: invalid API key, model name typo, model deprecated, rate limit (gives a clear message before the user discovers it 30 batches in).

### 6.4 Pre-flight UX

When the user clicks Start, instead of jumping straight into `runLoop()`, the panel shows:

```
Pre-flight checks…
  ✓ API key set
  ✓ Seed words: 12 words
  ✓ Initial prompt: 8,234 chars
  ✓ Primer prompt: 1,029 chars
  ✓ Canvas: 284 nodes match server
  ✓ Keywords: 1,208 in scope
  ✓ Pathways: 4 referenced, 4 loaded
  ✓ Test API call: OK ($0.001)
  ✓ localStorage writable
[Starting run…]
```

Total time: ~2-3 seconds. Each check shows ✓ as it passes; the first ✗ stops the chain and reports the failure.

### 6.5 Skip / bypass option

A small "Skip pre-flight" checkbox below Start, off by default. For: power users who know they want to resume despite a transient external flake; testing harness behavior; debugging the pre-flight itself.

Off-by-default = safe-by-default. The user has to actively opt out.

### 6.6 Estimated effort

- P5–P7 + P10: ~60 lines of pre-flight runner + display.
- P9: ~25 lines including model-name plumbing.
- UX (the per-check display): ~30 lines.
- Tests: pre-flight runner is unit-testable (pure function returning `{ passed: boolean, checks: CheckResult[] }`). ~40 lines of tests.
- **Total: ~3-4 hours** for a confident implementation.

### 6.7 Reversibility

The whole pre-flight is gated behind a single function call at the top of `handleStart`. Removing it: delete the call + the runner module + the UI panel. ~10 minutes.

---

## 7. Implementation sequencing — three options the director can pick from

The design above is one cohesive vision but it doesn't have to ship in one session. Three sensible sequencing options:

### Option α — The Full Audit Bundle (1 session, ambitious)

Ship Sections 2 + 3 + 5 + 6 in a single session. ~6-8 hours. Forensic instrumentation (Section 4) deferred to its own session.

**What's in:** ESLint custom rule, runtime invariants R1-R3 (R4 deferred), all three server-side guards (G1, G2; G3 with Scale Session B), full pre-flight self-test.

**Reversibility:** every component independently removable; the bundle isn't an architectural commitment.

**Risk profile:** medium-high. Six discrete additions with discrete tests. Build will compile cleanly because every change is additive. Risk is in the runtime invariant R4 (deferred) and the pre-flight P9 model-call (could surface API integration issues).

**Recommended IF:** the director wants to lock in the redundancies before any further architectural work (Scale Session B, action-by-action feedback) lands more code that would need its own redundancy story.

### Option β — Two-session split (recommended)

**Session 1 (~3-4 hours):** Sections 2 (ESLint) + 3 (runtime invariants R1-R3) + 5.1-5.2 (server-side guards G1, G2). The "structural" defenses.

**Session 2 (~3-4 hours):** Section 4 (forensic instrumentation: structured log; dry-run mode deferred per §0.4) + Section 6 (pre-flight self-test).

**Why split here:** Session 1 is mostly invisible-to-the-user infrastructure. Session 2 is user-facing (download log button, pre-flight UX). Splitting lets the director see Session 1's effect (lint enforcement, invariant checks fire on real bugs) before committing to Session 2's larger UI surface.

**Risk profile:** low. Each session is sized conservatively; both compile clean; both have clear test patterns.

**Recommended as the default** — matches how INPUT_CONTEXT_SCALING_DESIGN was phased (design first; then implementation across 4 sessions B-E).

### Option γ — Cherry-pick highest-impact pieces only

Ship just Section 2 (ESLint) + Section 5.1 (G1 payload sanity check) in a small ~1.5-hour session. The two cheapest, highest-blast-radius items:

- ESLint catches a future Bug-2-class regression at build time forever.
- G1 catches a future Bug-1-class regression (mass-shrink without explicit deletes) at the API boundary, regardless of whether it came from the wiring layer or a new client bug.

Defer everything else to a later session if/when a new bug fires that motivates it.

**Why:** if the director's calculus is "we just shipped 3 layers per bug; the system is in a much better state; let's see what the next month of usage surfaces before locking in more infrastructure," γ is the right answer.

**Risk profile:** very low. Two small, well-scoped changes.

**Recommended IF:** the director wants empirical signal from the next few production runs before sizing more defense work.

### Option recommendation

**β.** Session 1's structural defenses (lint + runtime invariants + server-side guards) are the highest-confidence, cheapest-to-build pieces. Session 2's forensic instrumentation + pre-flight is more involved but produces visible UX. The two-session split lets each session be sized confidently and gives the director a checkpoint between them.

**Why not α:** six disjoint changes in one session is at the edge of where context-degradation risk starts mattering (per the starter's Rule 16 triggers).

**Why not γ:** the director's framing was *"think if redundancies may be needed and if so, to add them, in case our fixes fail during a session."* That's a vote for completeness, not minimalism.

### Sequencing relative to other backlog items

Per `KEYWORD_CLUSTERING_ACTIVE.md` POST-2026-04-29 STATE block, the standing four "NEXT" choices are (b) Scale Session B build, (c) THIS Defense-in-Depth Audit (now landed as design), (d) Phase-1 UI polish, (e) Action-by-action feedback design.

**Recommendation:** Implementation Session 1 (per Option β) before Scale Session B, because:
- Scale Session B adds significant code (tier-decider, intentFingerprint serializer, AI-backfill script) that benefits from the lint rule + runtime invariants being in place to catch regressions in.
- The server-side guard G3 (empty-fingerprint reject) is a Scale Session B prerequisite.
- The cost of Session 1 is small (~3-4 hours) compared to Scale Session B's larger surface.

Implementation Session 2 (forensic + pre-flight) can ship anytime — independent of all other work.

---

## 8. Open questions for the director

These are items I'd want to confirm before implementation work begins:

1. **G1 threshold (50% drop).** Comfortable with 50%? Or prefer more conservative (e.g., 30%) for tighter blast radius?
2. **R4 dev-mode invariant** (the ref-vs-prop staleness check). Build it, or defer until we see whether R1-R3 produce useful signal?
3. **Pre-flight P9 API test call.** Comfortable spending ~$0.001 per Start to verify the API works? Or prefer to skip and let the first real batch surface API errors?
4. **Forensic structured log scope (Section 4.2).** Client-side download is the v1 plan. Phase 2 multi-user makes server-side per-run logging a real consideration — but should we explicitly punt that to Phase 2, or design for it now?
5. **Dry-run mode (Section 4.3).** Defer per §0.4? Or include in Session 2?
6. **Implementation sequencing — α, β, or γ?** β is my recommendation, but director's call.

These are not blocking the design's completeness — they're the natural director-decision points the implementation session(s) will resolve.

---

## 9. Cross-references

- `ROADMAP.md` "🛡️ Redundancy + Defense-in-Depth Audit" — the source ROADMAP item this design fulfills. Status will flip from PARTIAL → DESIGNED ONLY when this doc lands.
- `ROADMAP.md` "✅ Canvas-Blanking Intermittent Bug" — the FIXED entry that motivated Section 1.A's matrix entry.
- `ROADMAP.md` "✅ Reconciliation-Pass Closure-Staleness Bug" — the FIXED entry that motivated Section 1.B's matrix entry.
- `INPUT_CONTEXT_SCALING_DESIGN.md` — Tiered Canvas Serialization spec; Section 1.D's matrix entry coordinates with its build sessions.
- `PIVOT_DESIGN.md` — the architectural simplification rationale; Section 0 of THIS doc references it for what was deleted vs. what should be re-added under V3 framing.
- `AI_TOOL_FEEDBACK_PROTOCOL.md` — Section 1.E's matrix entry is a defense-in-depth view of the future feedback workflow.
- `MODEL_QUALITY_SCORING.md` — stability scoring is a redundancy mechanism; not directly referenced in this design but conceptually adjacent.
- `CORRECTIONS_LOG.md` 2026-04-18 entry — the foundational stale-closure pattern Bug 2 regressed against; the ESLint rule (Section 2) is the structural fix for that pattern's recurrence.
- `AutoAnalyze.tsx:163-171` — the line-163 invariant comment that this design's Section 2 codifies into a build check.
- `src/lib/canvas-fetch-parser.ts` — the Layer 1 helper for Bug 1; Section 1.A documents its place in the redundancy matrix.
- `src/lib/reconciliation.ts` — the Layer 1 helper for Bug 2; Section 1.B documents its place in the redundancy matrix.

---

END OF DOCUMENT
