# BROWSER FREEZE FIX — DESIGN DOC
## Layout-pass + atomic-rebuild scaling fix for Keyword Clustering's Auto-Analyze

**Created:** May 2, 2026 (`session_2026-05-02-b_browser-freeze-fix-design` — design-only session producing this doc + small profiling instrumentation; Bursitis Test 2 profiling pass deferred to director's discretionary follow-up)
**Created in session:** session_2026-05-02-b_browser-freeze-fix-design (Claude Code)
**Group:** B (tool-specific to Keyword Clustering's Auto-Analyze panel + canvas rendering pipeline; loaded when browser-freeze, layout-pass, atomic-rebuild, or canvas-scalability work is in scope)

**Purpose:** This is the canonical reference doc for the browser-freeze concern that surfaced during `session_2026-05-01-c` when a 105-topic canvas locked the JS main thread mid-apply, triggered Chrome's "page unresponsive" popup, and required a refresh that rolled back Batch 28's apply. It captures the code-reading-based diagnosis, a director-facing DevTools profiling protocol to confirm the bottleneck empirically, the fix-approach picker with a recommendation, and a per-pick implementation sketch.

**Background — why this design exists:**

The 2026-05-01-c live run on the original Bursitis Test project drove the canvas to 105 topics across 27 successful regular batches. Batch 28 attempt 2's apply phase triggered the freeze; the page never recovered; refresh required. Pre-freeze totalSpent was $10.82 confirming the batch's API call DID complete and was charged (~$0.30) but its result never persisted because the post-apply pipeline locked the thread before `saveCheckpoint()` could fire.

**Director's framing through the 2026-05-01-c session:** *"page-unresponsive popup appeared mid-Batch-28-apply"* + *"refresh required"*. End-of-session capture: HIGH-severity ROADMAP entry; standing instructions for next session: option (a) **browser-freeze fix design — RECOMMENDED**.

**Why this matters for scaling:** the platform targets 500 Projects/week with 50 concurrent workers in Phase 3 (per `PLATFORM_REQUIREMENTS.md §1`); per-Project canvases of 500+ topics are within Phase 3's normal range. If 105 topics already triggers a freeze, 500 topics would render the tool unusable. The freeze also blocks Phase 2 multi-user work — workers can't be onboarded onto a UI that locks up.

**Director's standing preference (`feedback_recommendation_style.md`):** the recommendation must be MOST THOROUGH AND RELIABLE — not fastest, cheapest, or "easiest." The recommendation in §4 below reflects that.

---

## 0. Status, scope, and what this design assumes

### 0.1 Status of this work

| Item | Status |
|---|---|
| Code-reading diagnosis of the apply pipeline (this doc §1) | ✅ COMPLETE (2026-05-02-b) |
| Profiling instrumentation in `AutoAnalyze.tsx` + `canvas-layout.ts` | ✅ SHIPPED (2026-05-02-b — see §6) |
| DevTools profiling protocol (this doc §3) | ✅ COMPLETE (2026-05-02-b) |
| Director runs profiling on Bursitis Test 2 + reports timings | ❌ NOT YET (next session) |
| Fix-approach decision (A/B/C in §4) | ❌ NOT YET — director picks AFTER profiling confirms diagnosis |
| Implementation per the chosen approach | ❌ NOT YET — separate session(s) |

### 0.2 What this design covers

1. **Diagnosis** — what the apply pipeline does at 105 nodes and which step lands in the "Chrome page unresponsive" zone.
2. **Profiling protocol** — director-facing Chrome DevTools recording instructions to confirm the bottleneck empirically before committing implementation budget.
3. **Fix approaches** — three architectural directions (algorithmic / requestAnimationFrame chunking / Web Worker offload) with tradeoffs and a recommendation.
4. **Implementation sketches** — what the code changes would look like under each approach, contingent on the director's pick after profiling.
5. **Profiling instrumentation reference** — what was added in 2026-05-02-b, where it lives, how to query it.

### 0.3 What this design does NOT cover

- **The recency-stickiness fix** (option (b) on the standing-instructions menu) — orthogonal architectural concern; tracked in `ROADMAP.md` and `INPUT_CONTEXT_SCALING_DESIGN.md`.
- **The GoTrueClient multi-instance warning** (option (c) on the standing-instructions menu) — tracked in `ROADMAP.md` as LOW-MEDIUM separate item.
- **Any algorithmic improvements to `runLayoutPass` beyond what's needed to clear the freeze** — out of scope for this fix (e.g., layout aesthetics, multi-pathway separation refinements).

### 0.4 Multi-workflow protocol coordination

Per `MULTI_WORKFLOW_PROTOCOL.md`:

- **Branch:** `main` (W#1's home).
- **Schema-change-in-flight flag:** stays `No` for this design and any implementation that follows from it. The fix is purely UI/rendering — no schema changes needed.
- **Cross-workflow doc edits:** none anticipated.

---

## 1. Diagnosis — what the apply pipeline does on the browser's main thread

### 1.1 The apply pipeline (plain language)

When Auto-Analyze finishes a batch (model returns ops), this is what happens IN THE BROWSER, on the same JS thread that has to keep the UI responsive:

| # | Step | Where it lives | Main-thread time at n=105 |
|---|---|---|---|
| 1 | Apply ops to in-memory state | `applyOperations` → `src/lib/operation-applier.ts` | ~10–50ms (cheap; pure data transform) |
| 2 | Materialize the rebuild payload | `materializeRebuildPayload` → `src/lib/auto-analyze-v3.ts:539` | ~5–20ms (Map-lookup-based; fast) |
| 3 | Compute every node's height | `calcNodeHeight × n` → `src/lib/canvas-layout.ts:94` | **~500–3,000ms** (canvas `measureText` per node × wrapped lines) |
| 4 | **`runLayoutPass`** — 4-step push-down layout | `src/lib/canvas-layout.ts:188-296` | **~5,000–10,000+ ms** (THE SUSPECT) |
| 5 | Copy positions back into payload | inline in `AutoAnalyze.tsx:1011-1020` | ~1–5ms |
| 6 | `JSON.stringify(payload)` | inline in `AutoAnalyze.tsx:1037` | ~50–200ms (synchronous) |
| 7 | HTTP POST `/canvas/rebuild` | `await authFetch(...)` | several seconds (server-side; **NOT main-thread blocking**) |
| 8 | `saveCheckpoint()` + checkpoint persistence | localStorage write | ~10–50ms |
| 9 | React re-render after state setter | React reconciliation + SVG paint | ~200–1,000ms |

**Steps 3 and 4 are synchronous on the main thread.** Their combined time has to fit under Chrome's "page unresponsive" threshold (about 5 seconds of unresponsive main thread). At n=105 with 21 ops applied, the combined time exceeds the threshold and the popup fires.

### 1.2 Why `runLayoutPass` (Step 4 above) is slow

The function runs four sub-steps. Three of them have algorithmic problems that explode at scale.

#### Sub-step 1 — reset roots (`canvas-layout.ts` lines 199-203)

Cheap. `O(n)` straight loop. Negligible.

#### Sub-step 2 — tree walk (`canvas-layout.ts` lines 207-265)

Recursively positions each child below its parent. Inside the recursion, two helper functions are called repeatedly:

- **`subtreeBottom(nodes, childMap, nodeId, collapsed)` — line 139.** Computes the maximum y+h across a subtree. Inside, it calls `nodes.find(n => n.id === nodeId)` — that's an **O(n) linear scan** of the entire node array. Then it recurses into children, repeating the find at each step.
- **`ancestorCollapsed(nodes, nodeId, collapsed)` — line 129.** Walks up from a node to find any collapsed ancestor. Inside, it ALSO calls `nodes.find()` per step — another O(n × depth) operation.

These are called ~n times during the tree walk. Each call does O(n × depth) work. Total: roughly **O(n³)** in the worst case. At n=105: ~1M+ ops, ~100-500ms (estimate; profiling will confirm).

#### Sub-step 3 — overlap resolution loop (`canvas-layout.ts` lines 269-292) — **THE PRIMARY SUSPECT**

> ```ts
> for (let pass = 0; pass < 60; pass++) {
>   let moved = false;
>   const sorted = nodes
>     .filter(n => !ancestorCollapsed(nodes, n.id, collapsed))   // O(n × depth) per node
>     .sort((a, b) => a.y - b.y);
>   for (let i = 0; i < sorted.length; i++) {
>     const a = sorted[i];
>     for (let j = i + 1; j < sorted.length; j++) {
>       const b = sorted[j];
>       if (positioned.has(a.id) && positioned.has(b.id) && a.pathwayId === b.pathwayId) continue;
>       const hOverlap = a.x < b.x + b.w && a.x + a.w > b.x;
>       if (!hOverlap) continue;
>       const needed = a.y + a.h + OVERLAP_GAP;
>       if (b.y < needed) { b.y = needed; b.baseY = b.y; moved = true; }
>     }
>   }
>   if (!moved) break;
> }
> ```

Three layers of cost:

1. **The outer loop runs up to 60 passes.** Early-exits when no node moves; in practice the first pass finds many overlaps and triggers many moves, the second pass finds the cascading overlaps from the first pass's moves, etc. After several batches of structural changes, "many passes" is realistic.
2. **Each pass calls `ancestorCollapsed` for every node in the filter step** — O(n × depth) per node, so the filter alone is O(n² × depth).
3. **The inner double-loop is O(n²)** with a cheap inner iteration (a few comparisons, no expensive lookups).

So per pass: O(n² × depth) for the filter + O(n²) for the double-loop ≈ O(n² × depth). Across all 60 passes worst-case: O(60 × n² × depth). At n=105 with depth ~3-5, that's ~3-5 million ops. JS executes simple ops at ~100M/sec, so worst case ~30-50ms — **but** the `ancestorCollapsed` calls dominate; they're not simple ops, they're array searches with branching, so realistic execution is closer to ~500ms-2,000ms per pass × 5-15 passes = **2-15+ seconds**. This is the freeze zone.

**This sub-step is the most likely dominant cost.** Profiling will give exact numbers per pass.

#### Sub-step 4 — separate pathways (`canvas-layout.ts` lines 349-396)

For each pathway, computes a bounding box from `nodes.filter(n => n.pathwayId === p.id && !ancestorCollapsed(nodes, n.id, collapsed))`. The `ancestorCollapsed` call is the hotspot here too. Then double-loops pathways and pushes whole subtrees apart on overlap. Probably O(p² × n × depth) where p is pathway count. Smaller than sub-step 3 unless pathways are numerous.

### 1.3 Why `calcNodeHeight × 105` (Step 3 in §1.1) is slow

`calcNodeHeight` (`canvas-layout.ts:94`) uses the canvas 2D context's `measureText` API to wrap each node's title, alt-titles, and description into lines. `measureText` in Chrome takes ~0.05-0.5ms per call depending on text length. With descriptions of 50-200 chars each wrapping into 4-15 lines, each `calcNodeHeight` call takes ~5-30ms. Across 105 nodes: **~500-3,000ms total**.

This is the secondary hotspot. It's algorithmically correct (no O(n²) waste) but linear-with-large-constant.

### 1.4 Empirical evidence the freeze is in steps 3-4 of §1.1

From the 2026-05-01-c session log (per `KEYWORD_CLUSTERING_ACTIVE.md` POST-2026-05-01-c STATE block):

- The model returned (Batch 28 attempt 2 API call completed; charged ~$0.30).
- The "passed validation" log fired (= validation step finished).
- The "Applied 21 operations → 105 topics" log fired (= step 1 of §1.1 finished — `applyOperations` returned).
- **The "Layout pass complete" log NEVER fired** (= the pipeline never reached the end of step 4 of §1.1).
- Page-unresponsive popup appeared.
- Refresh required.

The "Layout pass complete" log lives in `AutoAnalyze.tsx:1027-1031` (after this session's instrumentation; was at line 1008 before). Its absence pins the freeze to the block between line 996 (start of `calcNodeHeight` loop) and line 1027 (the log). **That block is `calcNodeHeight × n` followed by `runLayoutPass`** — exactly the steps §1.2 and §1.3 above identify as expensive.

### 1.5 Confidence

**~90% confidence the bottleneck is `runLayoutPass` Sub-step 3 (overlap resolution loop) + Sub-step 2 (tree walk).** The math is solid; the empirical log absence is corroborating; no other codepath in the apply pipeline plausibly takes 5+ seconds synchronously.

The remaining ~10% uncertainty: it's possible `calcNodeHeight × n` alone could account for most of the time on a long-description canvas (each node having 200+ char descriptions, wrapping into 15+ lines). The DevTools recording will distinguish this — the ratio of `aa.calcHeights` to `aa.runLayoutPass` will tell us which dominates.

---

## 2. What is NOT the bottleneck (and why)

| Suspect | Why we ruled it out |
|---|---|
| **The atomic rebuild API call** (`/canvas/rebuild`, `AutoAnalyze.tsx:1042`) | It's `await fetch(...)`. Server-side work. Browser stays responsive while it runs. The Chrome "unresponsive" popup fires for synchronous main-thread blocking, not for slow network calls. |
| **The Prisma transaction inside the rebuild route** (`src/app/api/projects/[projectId]/canvas/rebuild/route.ts:259`) | Server-side. Latency, not freeze. Slow rebuild transactions show up as a long network bar in DevTools but don't freeze the UI. |
| **The G1 payload-sanity guard** (`src/lib/canvas-rebuild-guard.ts`) | Cheap O(1) decision. Server-side. |
| **`materializeRebuildPayload`** (`src/lib/auto-analyze-v3.ts:539`) | Map-lookup-based. O(n). At n=105, ~5-20ms. Confirmed via code reading. |
| **`recordTouchesFromOps`** (`AutoAnalyze.tsx:964`) | Walks the ops array once with Map lookups. O(ops). At ops=21, sub-millisecond. |
| **React re-render after state setters** | Happens AFTER the freeze block ends, on the post-rebuild refetch. Could contribute another 200-1,000ms but isn't the main freeze cause. |

---

## 3. Profiling protocol — director-facing DevTools recording instructions

This section is written for the director to follow. Copy-paste-ready clicks and observations. The instrumentation shipped in 2026-05-02-b adds visible timing markers to the recording so you can find the relevant block instantly.

### 3.1 Setup (~5 minutes)

1. **Make sure the latest code is deployed to vklf.com.** This session's commit needs to be pushed AND Vercel needs to have redeployed before this protocol works (the instrumentation lives in the deployed code). Confirm by visiting https://vklf.com and checking the build version, OR confirm Vercel shows "Ready" for the latest commit on the dashboard.

2. **Open Chrome.** Other browsers have similar performance tools but the protocol below is Chrome-specific. Use the latest stable version.

3. **Sign in to vklf.com** as your normal admin user.

4. **Navigate to "Bursitis Test 2"** project's Keyword Clustering workspace (Projects → Bursitis Test 2 → Keyword Analysis card → Keyword Clustering).

5. **Confirm the canvas is at ~43 topics** (the paused checkpoint state from yesterday). If it's been wiped or grown, the protocol still works — just note the canvas size at recording time.

### 3.2 Open DevTools Performance tab (~2 minutes)

1. **Open Chrome DevTools.** Right-click anywhere on the page → "Inspect" — OR — press `F12` (Windows/Linux) / `Cmd+Opt+I` (Mac).

2. **Click the "Performance" tab** at the top of DevTools. (If you don't see it, click the `>>` overflow arrow to find it.)

3. **Click the gear icon ⚙️** at the top-right of the Performance tab to expand the recording settings, then:
   - **CPU throttling:** leave at "No throttling" (we want real timings).
   - **Network throttling:** leave at "No throttling".
   - **Hardware concurrency:** leave at default.
   - You can collapse the gear panel after.

4. **Make sure the Performance tab is in the foreground** (clicked, not just open in a hidden tab). Recording requires it.

### 3.3 Run Auto-Analyze + record one batch's apply phase (~5-15 minutes)

1. **In the Auto-Analyze panel,** verify all four prompts are pasted (Initial + Primer + Consolidation Initial + Consolidation Primer). The pre-flight runner extension shipped this morning (P11+P12) will confirm all four — if any show as failed, paste them before continuing.

2. **Click "▶ Resume"** to resume the run from the checkpoint at Batch 7. Let it run normally — do NOT start recording yet.

3. **Run a few batches without recording first.** Watch the activity log. After each batch's apply, you should now see a log line like:
   > `Layout pass complete (43 nodes positioned; heights=180ms, layout=320ms)`

   The `heights=` and `layout=` numbers are the new measurement output from this session's instrumentation. They give you running-batch ground truth even WITHOUT running a Performance recording.

4. **When the canvas grows past ~80 topics,** that's the right size to start recording. Pause the run before the next batch starts (click ⏸ Pause).

5. **In DevTools Performance tab, click the round Record button (●)** at top-left of the Performance panel. The button changes to a stop icon (⏹).

6. **Click "▶ Resume" in Auto-Analyze** — let it run ONE more batch. Watch for the apply phase ("Applying X operations → Y topics" log line). The recording should capture the full apply phase.

7. **As soon as the "Canvas rebuilt" log fires** (= apply phase finished), click the **stop icon (⏹)** in DevTools to stop the recording.

8. **Wait 2-5 seconds** for DevTools to process the recording. A flame chart appears.

### 3.4 Reading the recording (~10 minutes)

The recording shows a flame chart with multiple rows. You're looking for our four named timing markers.

1. **Find the "Timings" track** in the flame chart. It's usually the second track from the top, below "Animations" and above "Main". The Timings track is where our `performance.measure()` markers appear.

2. **Look for these four labels in the Timings track:**
   - `aa.calcHeights` — the calcNodeHeight × n loop time.
   - `aa.runLayoutPass` — the runLayoutPass time. **THIS IS THE PRIMARY SUSPECT.**
   - `aa.stringify` — the JSON.stringify(payload) time.
   - `aa.rebuildHTTP` — the HTTP POST time (this includes server-side time).

   AND (sub-step breakdown of `aa.runLayoutPass`):
   - `layout.step1-resetRoots`
   - `layout.step2-treeWalk`
   - `layout.step3-overlapResolve` ← **likely the dominant sub-step**
   - `layout.step4-separatePathways`

3. **Click on each label.** The bottom panel shows the duration. Write down all four (or eight) durations.

4. **Cross-check against the activity log.** The "heights=Xms, layout=Yms" line should match the `aa.calcHeights` and `aa.runLayoutPass` numbers from the Timings track.

### 3.5 What to share back

Share these results with Claude in the next session:

- Canvas size when the recording was made (e.g., "85 topics, 38 sister links").
- The four (or eight) timing measurements in milliseconds.
- Optionally: a screenshot of the flame chart with the Timings track visible.
- Optionally: any additional named functions you see dominating the "Main" track (the big track below "Timings"). Look for function names like `runLayoutPass`, `subtreeBottom`, `ancestorCollapsed`, `calcNodeHeight`, or React component names. The function names + their durations help confirm the diagnosis.
- Whether you observed the freeze itself during the recording. If yes — note when (e.g., "around the 8-second mark of the recording") and what was happening. If no — that's also useful (confirms the freeze threshold is canvas-size-dependent).

### 3.6 Optional — second recording at higher canvas size

If you can push the canvas past 100 topics safely (mindful of the freeze risk), a second recording at that size is the highest-value data point because it captures the actual freeze regime. Same protocol; just at a larger canvas.

If the freeze fires during the recording, that's actually GREAT for diagnosis — DevTools captures the full block. Just refresh the page after to recover, and the recording is still useful.

---

## 4. Fix-approach picker — design output of this session

The director picks one of these AFTER profiling confirms the diagnosis. The recommendation reflects "most thorough and reliable" per `feedback_recommendation_style.md` + `HANDOFF_PROTOCOL.md` Rule 14f.

### 4.1 Approach A — Algorithmic fix (recommended; addresses root cause) — RECOMMENDED

**Idea:** Replace the O(n) `nodes.find()` calls with O(1) Map lookups; replace recursive `subtreeBottom` with memoized post-order DFS; cap or eliminate the 60-pass overlap loop with a sweep-and-prune algorithm; replace `ancestorCollapsed`'s nested find with a precomputed parent-chain set.

**Concretely:**
- **`buildChildMap`** already exists at `canvas-layout.ts:178` and produces a `Map<parentId, children[]>`. Add a parallel `buildNodeMap(nodes)` returning `Map<id, node>` that all code-paths use instead of `nodes.find()`. Single one-time O(n) construction; subsequent lookups are O(1).
- **`subtreeBottom`** memoize results in a `Map<nodeId, number>` populated post-order in one O(n) DFS. Prevents re-computation across the recursion.
- **`ancestorCollapsed`** precompute "is any ancestor collapsed?" for every node in one O(n) DFS at the start of `runLayoutPass` and pass the result Set into the helpers. Eliminates the per-call walk-up.
- **Sub-step 3 overlap loop** replace the 60-pass O(n²) double-loop with a sweep-and-prune algorithm: sort nodes by y, then sweep — each node only needs to be compared against still-active nodes whose y+h hasn't passed it. Reduces from O(60 × n²) to **O(n log n)**. The 60-pass cap stays as a safety net (capped to 5 passes — if more is needed, log a warning).
- **`calcNodeHeight × n`** memoize per-content rather than per-call: a `Map<contentHash, height>` keyed on `(title, description, altTitles, w)`. Re-runs of the same content (which happens after every rebuild that didn't change the content) hit the cache. For changed content, the call still runs.

**Expected impact:** layout pass at 105 nodes drops from 5,000-10,000+ ms to ~50-200ms. At 500 nodes drops from "wholly unusable" to ~500-1,000ms. Sustainable scaling lift.

**Pros (zoom out):**
- **Most thorough and reliable.** Fixes the ROOT CAUSE — the algorithm is just inefficient JS. Modern Map lookups are mature; sweep-and-prune is a textbook fix.
- **Scales to 500+ topics** without further refactoring. Phase 3 ready.
- **No new infrastructure.** No Web Worker setup, no message-passing, no new build config.
- **Improvement compounds.** Every other code path that calls `runLayoutPass` (`CanvasPanel.tsx` parent-child link form, `autoLayoutChild`) gets faster too.
- **Test surface stays simple.** Pure functions with deterministic outputs; existing test patterns work.

**Cons (zoom in):**
- **Largest design surface** of the three options. ~6-8 functions to refactor.
- **Behavioral risk.** A subtle off-by-one in sweep-and-prune could mis-position nodes. Mitigation: keep all existing tests passing; add new tests at the boundary cases (deep nesting, many pathways, all-collapsed). Consider running the new layout side-by-side with the old one for one batch and asserting equivalence (debug-mode invariant).
- **Implementation budget.** Probably 2-3 sessions: one to refactor + add tests; one to validate live; one for follow-up tuning if needed.

**Reversibility:** every refactored function can be flag-gated initially (`if (process.env.NEW_LAYOUT_ALGO) ...`) and the old code paths kept until validation confirms parity. Easy to revert if anything goes wrong.

**Why this is most thorough and reliable:** it solves the actual problem — the algorithm. (B) and (C) below paper over the symptom (UI responsiveness) without making the underlying work faster. A single 5-second freeze becomes a 5-second progress bar (B) or a hidden-from-UI 5-second worker job (C); the user still waits 5 seconds. **(A) makes the wait disappear.** Per Rule 14 + the director's standing preference.

### 4.2 Approach B — requestAnimationFrame chunking (defensive layer; doesn't fix root cause)

**Idea:** Make the layout pass yield to the browser's render loop periodically, so the Chrome "page unresponsive" popup never fires. The total work is unchanged; it's just spread across many short chunks instead of one big synchronous block.

**Concretely:**
- Wrap `runLayoutPass` in an `async` generator-style runner that does `await new Promise(r => requestAnimationFrame(r))` between major sub-steps (Step 1, Step 2, Step 3, Step 4) AND inside Step 3's outer 60-pass loop yields every K iterations.
- The pipeline at `AutoAnalyze.tsx:1006` becomes `await runLayoutPassAsync(layoutNodes, ...)`.
- During the pause, the browser can paint, handle clicks, run animations.

**Expected impact:** the freeze popup never fires (browser stays responsive). The user perceives a 5-10 second "thinking" state but can still scroll, see the activity log update, click Pause if needed.

**Pros (zoom out):**
- **Smallest design surface.** ~10-30 LOC change across 1-2 files.
- **No algorithmic change.** Existing layout-pass behavior preserved 1:1 (just spread over time).
- **Unblocks the immediate Phase 1 risk** — Bursitis runs no longer freeze; the run can complete.
- **Defensible as a stop-gap** — ship now to unblock; ship (A) properly later.

**Cons (zoom in):**
- **Doesn't fix the root cause.** Total CPU time is the same; the user still waits 5+ seconds per apply at 105 nodes. At 500 nodes, the wait might be 30+ seconds — chunking just spreads the misery.
- **Not Phase 3 acceptable.** A worker can't tolerate 30-second waits per batch in production.
- **Test surface gets harder.** Async generators are harder to test than pure functions. State could observably mutate mid-pass if other code mutates `nodes` during a yield.
- **Workaround mentality.** If shipped, becomes the "good-enough fix" that defers (A) indefinitely. Director's standing preference is "most thorough and reliable" — this fails that bar.

**Reversibility:** trivial — a single flag toggle reverts to the synchronous version.

### 4.3 Approach C — Web Worker offload (heavy infrastructure; bypass main thread entirely)

**Idea:** Move `runLayoutPass` to a Web Worker. The main thread sends the node array via `postMessage`; the worker computes the layout; the main thread receives the updated positions back. Main thread stays 100% responsive throughout.

**Concretely:**
- New file `src/workers/layout-worker.ts` containing a worker entry point that receives `{ nodes, pathways, collapsed }` and returns updated positions.
- Next.js 16 supports Web Workers via `new Worker(new URL('./layout-worker.ts', import.meta.url))` syntax. May need to enable a config flag.
- `runLayoutPass` becomes `runLayoutPassInWorker(nodes, ...) → Promise<...>`.
- Main thread blocks on the Promise but doesn't block on CPU — the browser keeps painting + handling input.

**Expected impact:** zero main-thread blocking. UI stays fully responsive. User can scroll, click, see the activity log update — for the entire ~5-10 second layout duration. The compute time itself doesn't go down (worker runs the same algorithm), just hidden from the UI.

**Pros (zoom out):**
- **Cleanest UX outcome.** No "thinking" freeze, no progress bar — UI just behaves normally while a background worker thinks.
- **Future-proof.** Web Worker pattern is standard for any compute-heavy operation in Phase 3 (e.g., reconciliation on 10,000-keyword projects, large CSV import, rendering 500-node SVGs).
- **Eliminates one entire class of "main thread is busy" bugs** (event-loop starvation, missed setTimeout fires, etc.).

**Cons (zoom in):**
- **Largest infrastructure cost.** Web Worker bundling config in Next.js, postMessage serialization (every node array gets cloned both directions — for 500 nodes that's a few MB serialized), worker lifecycle management (when does it spawn / terminate).
- **Doesn't fix the algorithm.** A 5-second worker job is still 5 seconds; the user waits the same total time, just with a responsive UI in the foreground. **At 500 nodes the worker's job becomes 30+ seconds even though the UI doesn't freeze.** That's fine for one-off runs but not for batch-after-batch normal operation.
- **Subtle data-race risk.** If the user edits the canvas (drag, resize, parent-link) while the worker is running, the worker's result may be stale on receipt. Mitigation possible but adds complexity.
- **Test surface much harder.** Workers don't run in `node --test` without setup. The whole layout-pass test suite would need new infrastructure.
- **Implementation budget largest** — 3-5 sessions easily.

**Reversibility:** harder than (A) or (B). Once the Web Worker path is the default, reverting means undoing the bundling config + the worker plumbing. Possible but expensive.

**When (C) WOULD be the right pick:** if profiling shows the layout algorithm itself, even after (A)'s improvements, still takes >250ms at 500 nodes. Then offloading to a worker is the right next step. As of this design, profiling hasn't happened yet, so (C) is premature.

### 4.4 Recommendation — explicit pick

**Approach A is the recommended fix.** Most thorough and reliable. Fixes the root cause. Scales to Phase 3 without further refactoring. The implementation budget is the highest of the three but the outcome is permanent — at 500 nodes the layout pass will be ~500-1,000ms, well below any freeze threshold AND fast enough that the UI feels instantaneous.

**Approach B can be added on top of A as a defense-in-depth layer** if profiling at 500+ nodes still shows >2-second blocks. Cheap to add, doesn't prevent (A). Not recommended as a standalone fix.

**Approach C is deferred** — revisit only if (A)'s improved layout algorithm still doesn't meet the Phase 3 responsiveness bar.

---

## 5. Implementation plan sketch (per pick)

### 5.1 If director picks A — Algorithmic fix

**Session structure:** 2-3 sessions.

**Session 1 — refactor + tests (this is design + code; ~3-4 hours):**

1. Add `buildNodeMap(nodes): Map<string, LayoutNode>` to `canvas-layout.ts`. Single source of truth for id → node lookups.
2. Refactor `subtreeBottom` to take `nodeMap` + use it; add a memo Map populated post-order in a single DFS.
3. Refactor `ancestorCollapsed` to compute a precomputed `Set<string>` of "any-ancestor-collapsed" ids once per `runLayoutPass` call.
4. Replace Sub-step 3's 60-pass O(n²) overlap loop with sweep-and-prune. Cap residual passes at 5.
5. Add memoization to `calcNodeHeight` keyed on content hash; export a `clearLayoutCache()` for tests / forced re-layout.
6. Add new tests in `src/lib/canvas-layout.test.ts` (NEW — doesn't exist yet). Test cases: deep nesting (depth 10), many pathways (10+ pathways with 50 nodes each), all-collapsed root, node-with-no-parent-AND-no-pathway floater, the 105-node freeze regime.
7. Add an invariant test: run the new algorithm AND the old algorithm on the same input, assert positions match within ±1px tolerance. Keep this assertion gated on a test-only flag; verifies parity during the transition.
8. `npx tsc --noEmit` clean; `node --test src/lib/*.test.ts` clean; `npm run build` clean; lint at baseline parity.

**Session 2 — live validation (this is field-test; ~1-2 hours):**

1. Push Session 1 to vklf.com.
2. Resume Bursitis Test 2 from checkpoint; run the canvas to ~150 topics; observe `aa.runLayoutPass` measurements via the existing instrumentation. Expected: drops from multi-second to <300ms at 150 topics.
3. Push past 200 topics if possible. Same expected outcome.
4. If everything is clean, the new algorithm becomes the default; the old one can be deleted in a future cleanup pass.

**Session 3 (only if needed) — tuning:**

If Session 2 reveals an unexpected behavior (e.g., positions drift slightly relative to the old algorithm in a way users notice), tune. Probably not needed.

### 5.2 If director picks B — requestAnimationFrame chunking

**Session structure:** 1-2 sessions.

**Session 1 — implementation + tests:**

1. Add `runLayoutPassAsync` to `canvas-layout.ts` that wraps `runLayoutPass` and yields between sub-steps via `await new Promise(r => requestAnimationFrame(r))`.
2. Yield inside Sub-step 3 every 5 passes.
3. Update `AutoAnalyze.tsx:1006` to `await runLayoutPassAsync(...)`.
4. Tests: verify the async version returns the same final positions as the sync version on 5+ canvas snapshots.
5. Smoke test in browser dev mode: confirm UI stays responsive during a 5-second layout pass.

**Session 2 — live validation:** push to vklf.com; verify the freeze popup doesn't fire on the original 105-node Bursitis run. Note: the user STILL sees ~5 seconds of "thinking" — the activity log will update during it because the main thread is no longer fully blocked.

### 5.3 If director picks C — Web Worker offload

**Session structure:** 3-5 sessions.

**Session 1 — Worker infrastructure:** Set up Next.js 16 worker bundling, create `layout-worker.ts`, smoke test postMessage round-trip.

**Session 2 — Move runLayoutPass to worker:** Move the layout function (and its helpers) into the worker. Update the call site to use `runLayoutPassInWorker`. Handle the `await Worker.postMessage(...) → onmessage` round-trip.

**Session 3 — Worker lifecycle + tests:** Decide when the worker spawns / terminates. Add tests (this is the hard part — `node --test` doesn't run workers natively).

**Session 4 — Live validation:** Push to vklf.com; verify UI stays responsive.

**Session 5 (likely needed) — edge cases:** Stale-result detection if the user edits the canvas during a worker run. Worker error handling.

---

## 6. Profiling instrumentation reference (shipped this session, 2026-05-02-b)

Three blocks of `performance.mark()` + `performance.measure()` calls were added to capture timings of the suspect operations. Sub-millisecond overhead per mark; safe to leave in production.

### 6.1 In `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` (around lines 996-1048)

Four named measures, all visible in DevTools Performance > Timings track:

| Measure name | What it measures | Lines |
|---|---|---|
| `aa.calcHeights` | The `calcNodeHeight × n` loop time | 1001-1004 |
| `aa.runLayoutPass` | The full `runLayoutPass` time | 1006-1009 |
| `aa.stringify` | `JSON.stringify(payload)` time | 1036-1039 |
| `aa.rebuildHTTP` | The HTTP POST to `/canvas/rebuild` time | 1041-1048 |

The activity log also surfaces `aa.calcHeights` and `aa.runLayoutPass` numbers via the updated "Layout pass complete" log line at lines 1027-1031. So the director sees per-batch timings without needing to open DevTools.

### 6.2 In `src/lib/canvas-layout.ts` (inside `runLayoutPass`)

Four sub-step measures, named `layout.step1` through `layout.step4`, visible in the same Timings track. Lets you see WHICH sub-step of the layout pass dominates.

| Measure name | What it measures |
|---|---|
| `layout.step1-resetRoots` | Step 1 (reset root nodes to baseY) |
| `layout.step2-treeWalk` | Step 2 (tree-walk children type-aware) |
| `layout.step3-overlapResolve` | Step 3 (60-pass overlap resolution) — likely dominant |
| `layout.step4-separatePathways` | Step 4 (push pathways apart) |

The Step 3 measure also stashes the actual pass count used (out of the 60 max) on a non-standard `_passes` field of the measure entry. Diagnostic only; not part of the public API.

### 6.3 Querying from console

Director or a future Claude session can query timings without DevTools too:

```js
performance.getEntriesByType('measure').filter(m => m.name.startsWith('aa.') || m.name.startsWith('layout.'))
```

Returns an array of `{ name, duration, startTime }` entries. Useful for capturing many batches' worth of timings in a single console paste.

### 6.4 SSR / non-browser safety

`canvas-layout.ts` could in theory be imported from server code; the instrumentation is guarded by `typeof performance !== 'undefined'`. `AutoAnalyze.tsx` is `'use client'` so the unguarded `performance.mark` calls there are browser-only by construction.

---

## 7. Open questions + deferred items

### 7.1 Open questions

1. **What's the actual breakpoint?** Is it 105 topics universally, or canvas-shape-dependent (e.g., does deep nesting trigger it earlier)? Profiling on Bursitis Test 2 should show this — if the layout pass at 43 topics is already ~1000ms, deep nesting matters.
2. **Does `calcNodeHeight × n` dominate at certain content shapes?** If descriptions are very long (200+ chars wrapping into 15+ lines), `calcNodeHeight` could be the primary cost rather than `runLayoutPass`. Profiling will distinguish.
3. **Does the React re-render after `setNodes` add measurable freeze time?** Currently not instrumented (would need to be added inside React's lifecycle, which isn't trivial). Probably 200-1,000ms at 105 nodes; secondary concern.
4. **Are there any cases where the 60-pass overlap loop genuinely needs many passes?** If yes, the sweep-and-prune approach must handle them too. Profiling will show actual pass count.

### 7.2 Deferred items (per Rule 14e — captured here, not unanchored)

- **CanvasPanel re-render perf** — separate concern from the apply-phase freeze; tracked here as future work. **Captured to: this doc §7.2.**
- **`calcNodeHeight` SSR fallback returns the constant 160px** — not a freeze concern; out-of-scope. **Captured to: this doc §7.2.**
- **Memoization invalidation strategy** — if `calcNodeHeight` is memoized, invalidation on content change must be correct. Sub-task of Approach A. **Captured to: this doc §5.1 Session 1 step 5.**

---

## 8. Resume Prompt — canonical re-entry

When the director wants to continue work on this design (next session is the profiling pass; later sessions are the implementation):

```
Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it.
Today's task: continue browser-freeze fix design — <profiling pass | implementation Approach A | other>.
Per HANDOFF_PROTOCOL.md Rule 25 + MULTI_WORKFLOW_PROTOCOL.md, work belongs on `main`;
check ROADMAP.md "Current Active Tools" table to confirm no W#2 schema work is in flight.

Per Rule 22 (Graduated-Tool Re-Entry style for design-doc continuation), additionally
load these Group B docs:
  - docs/BROWSER_FREEZE_FIX_DESIGN.md (this doc — full read)
  - docs/KEYWORD_CLUSTERING_ACTIVE.md (top STATE block + relevant historical blocks)
  - docs/INPUT_CONTEXT_SCALING_DESIGN.md (only if cross-referencing scaling work)

Start by running the mandatory start-of-session sequence.
```

---

END OF DOCUMENT
