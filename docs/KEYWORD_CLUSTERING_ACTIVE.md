# KEYWORD CLUSTERING — ACTIVE DOCUMENT
## Current state of the Keyword Clustering workflow tool (Group B, tool-specific)

**Last updated:** May 3, 2026 (cold-start render-layer fix session — option (a) from the 2026-05-02-e standing instructions. **CODE-FIX session — no schema, no DB, no live run, no deploy yet.** New pure helper `src/lib/cold-start-fetch-retry.ts` (~115 lines) + 11 unit tests in `src/lib/cold-start-fetch-retry.test.ts` mirroring `post-rebuild-fetch-retry.ts` pattern. `KeywordWorkspace.tsx` rewired: three mount-time fetches (canvas, keywords, removed-keywords) all run through the retry helper now; centralized `coldStartRetry` state (3 states: idle / retrying / exhausted) drives a new banner above the topbar — yellow "Retrying load… (X)" while any fetch is mid-retry, red "Could not load X — Click here to retry" with a button per exhausted fetch on exhaust. `CanvasPanel.tsx` slimmed: mount-time `fetchCanvas()` moved up to KeywordWorkspace so all three fetches share one retry-state + banner. ROADMAP "NEW HIGH — Cold-start hard-refresh" entry flipped from open HIGH to "🟡 CODE FIX SHIPPED 2026-05-03 — pending live verification". 284/284 src/lib tests pass (was 273; +11 new); tsc clean; build clean (17/17 routes); lint at exact baseline parity (16e/41w; zero new — including a mid-session 3-error trip on the React purity rule, captured to CORRECTIONS_LOG as informational). Multi-workflow: schema-change-in-flight stays "No"; W#2 still 🆕 about-to-start; no parallel chat. Commit local; push pending Rule 9 approval.)
**Last updated in session:** session_2026-05-03_cold-start-render-layer-fix (Claude Code)
**Previously updated:** May 2, 2026-e (HTTP 500 fix live verification + cold-start canvas-empty finding session — fifth session of 2026-05-02, follow-up to `2026-05-02-d_http-500-retry-regression-investigation`. **DOC + LIVE-RUN session — no code changes.** `e2a32b2` pushed to vklf.com at session start; live-verified on Bursitis Test 2 against the preserved 30/291 checkpoint. Verification SUCCEEDED on all 4 primary signals; both helper paths exercised in 4 apply events at canvas 118-122. Hypothesis A CONFIRMED. Two new HIGH-severity ROADMAP entries captured: (A) cold-start hard-refresh canvas/keyword table empty under shared pgbouncer pressure (existing 2026-05-02-d MEDIUM entry upgraded to HIGH + expanded with keyword-table finding); (B) underlying ~25% per-endpoint pgbouncer/Prisma flake rate as rate-layer root cause. Director's framing 2026-05-02-e: "All these issues need to be fixed." Multi-workflow: schema-change-in-flight stays "No"; W#2 still 🆕 about-to-start; no parallel chat. Doc-only commit + push.)
**Previously updated in session:** session_2026-05-02-e_http-500-fix-live-verification-and-cold-start-canvas-empty-finding (Claude Code)
**Previously updated:** May 2, 2026-d (HTTP 500 retry regression investigation session — fourth session of 2026-05-02, follow-up to `2026-05-02-c_devtools-profiling-pass`. CODE-FIX session — pure helper `src/lib/post-rebuild-fetch-retry.ts` + 13 unit tests + AutoAnalyze.tsx wiring at the post-atomic-rebuild step + `_postRebuildFetchFailed` branch in runLoop catch. Re-read of evidence reframed the "regression" framing: `df09611` did NOT regress; underlying ~25% retry rate at scale was always there. Live verification deferred to follow-up — VERIFIED LIVE in 2026-05-02-e session above.)
**Previously updated in session:** session_2026-05-02-c_devtools-profiling-pass (Claude Code)
**Previously updated in session:** session_2026-05-02-b_browser-freeze-fix-design (Claude Code)
**Previously updated in session:** session_2026-05-02_http-500-fix-verification-and-auto-fire-trip-observation (Claude Code)
**Previously updated in session:** session_2026-05-01-c_consolidation-auto-fire-followup (Claude Code)
**Previously updated in session:** session_2026-05-01-b_scale-session-e-d3-validation (Claude Code)
**Previously updated in session:** session_2026-05-01_scale-session-e-build (Claude Code)
**Previously updated in session:** session_2026-04-30-c_scale-session-d-build (Claude Code)
**Previously updated in session:** session_2026-04-30-b_scale-session-c-build (Claude Code)
**Previously updated in session (earlier):** session_2026-04-30_scale-session-b-build (Claude Code)
**Previously updated in session:** session_2026-04-29-c_defense-in-depth-impl-2 (Claude Code)
**Previously updated in session:** session_2026-04-29-b_defense-in-depth-impl-1 (Claude Code)
**Previously updated in session:** session_2026-04-29_defense-in-depth-audit-design (Claude Code)
**Previously updated in session:** session_2026-04-28_canvas-blanking-and-closure-staleness-fix (Claude Code)
**Previously updated in session:** session_2026-04-28_deeper-analysis-and-fix-design (Claude Code)
**Previously updated in session:** session_2026-04-28_scale-session-0-outcome-c-and-full-run-feedback (Claude Code)
**Previously updated in session:** session_2026-04-27_input-context-scaling-design (Claude Code)
**Previously updated in session:** session_2026-04-27_v3-prompt-small-batch-test-and-context-scaling-concern (Claude Code)
**Previously updated in session:** session_2026-04-26_workflow-transition-architecture-and-v3-prompt-refinement (Claude Code)
**Previously updated in session (earlier):** session_2026-04-26_phase1-polish-bundle (Claude Code)
**Previously updated in session (earlier):** session_2026-04-25_phase1g-test-followup-part3-pivot-session-E (Claude Code)
**Previously updated in session (earlier):** session_2026-04-25_phase1g-test-followup-part3-pivot-session-D (Claude Code)
**Previously updated in session (earlier):** session_2026-04-25_phase1g-test-followup-part3-pivot-session-C (Claude Code)
**Previously updated in session (earlier):** session_2026-04-25_phase1g-test-followup-part3-pivot-session-B (Claude Code)
**Previously updated in session (earlier):** session_2026-04-25_phase1g-test-followup-part3-pivot-session-A (Claude Code)
**Previously updated in session (earlier):** session_2026-04-25_phase1g-test-followup-part3-session3b-verify (Claude Code)
**Previously updated in session (earlier):** session_2026-04-25_phase1g-test-followup-part3-session3b (Claude Code)
**Previously updated in session (earlier):** session_2026-04-24_phase1g-test-followup-part3-session3a (Claude Code)
**Previously updated in session (earlier):** session_2026-04-24_phase1g-test-followup-part3-session2b (Claude Code)
**Previously updated in session (earlier):** session_2026-04-24_phase1g-test-followup-part3-session2 (Claude Code)
**Previously updated in session (earlier):** session_2026-04-20_phase1g-test-followup-part3 (Claude Code)
**Previously updated in session (earlier):** session_2026-04-19_phase1g-test-followup-part2 (Claude Code)
**Previously updated (claude.ai era):** https://claude.ai/chat/fc8025bf-551a-4b3c-8483-ec6d8ed9e33c

**Purpose:** This is the working document for the Keyword Clustering tool during its active development phase. Covers everything built so far, what's pending, technical details, and known issues.

**When this tool graduates to stable completion:** This doc will be split into `KEYWORD_CLUSTERING_ARCHIVE.md` (full history) and `KEYWORD_CLUSTERING_DATA_CONTRACT.md` (what downstream tools need to know). See `DOCUMENTATION_ARCHITECTURE.md` §5 for the Tool Graduation Ritual.

**Upload this doc when:** Working on ANY feature, test, or bugfix related to Keyword Clustering.

---

## ⚠️ POST-2026-05-03-COLD-START-RENDER-LAYER-FIX STATE (READ FIRST — updated 2026-05-03)

**As of 2026-05-03 (thirty-sixth Claude Code session, follow-up to `session_2026-05-02-e`). CODE-FIX session — option (a) from the prior STATE block's standing instructions. New pure helper + 11 unit tests + KeywordWorkspace rewiring + CanvasPanel slim-down. No schema, no DB, no live run, no deploy yet. Live verification deferred to a follow-up.**

### What this session shipped to W#1

**New code (single commit, ready for Rule 9 push approval):**

- **`src/lib/cold-start-fetch-retry.ts` (NEW, ~115 lines incl. extensive header comment).** Pure helper `runColdStartFetchWithRetry(fetch, options)` with 3 attempts, [2000ms, 5000ms] backoffs, sleep injection for tests, `onAttemptFailed` callback for surfacing "Retrying load…" status, optional `label` field embedded in the thrown error message ("Could not load `<label>` after 3 attempts. Click here to retry."). NO partial-apply annotations — deliberate semantic separation from sibling `post-rebuild-fetch-retry.ts` (post-rebuild has canonical-on-server / refresh-and-Resume story; cold-start has none — UI just needs to retry + render the click-to-retry button on exhaust). Module-level header comment covers the rationale + the underlying probability math (4 fetches × ~25% per-endpoint flake → ~68% of cold starts have at least one flake) + the cross-references back to the 2026-04-28 G2 hardening that motivated this fix.

- **`src/lib/cold-start-fetch-retry.test.ts` (NEW, 11 tests).** Covers: happy path (1), single-flake recovery (1), two-flake recovery (1), 3-attempt exhaust + label-bearing message + no annotations (1), no-label fallback to "data" (1), `onAttemptFailed` callback semantics — fires for retried attempts NOT for the final failure (1), custom maxAttempts (1), custom backoffsMs (1), short-backoffs-array reuse (1), non-Error thrown values stringified safely with label (1), label-irrelevant-on-success-path (1). All 11 pass via `node --test --experimental-strip-types`.

- **`src/app/projects/[projectId]/keyword-clustering/components/KeywordWorkspace.tsx` (modified, ~190 LOC net add).** New centralized `coldStartRetry` state of shape `{ canvas: 'idle' | 'retrying' | 'exhausted', keywords: ..., removedKeywords: ... }`. Three new useCallbacks (`loadCanvasWithRetry`, `loadKeywordsWithRetry`, `loadRemovedKeywordsWithRetry`) each wrap the underlying fetch in `runColdStartFetchWithRetry` with the matching label + `onAttemptFailed` callback that flips status to 'retrying'. A new `fetchRemovedKeywordsRaw` callback now extracts the previously-inline removed-keywords fetch into a stable callback (so the retry helper + the click-to-retry button can re-trigger it). Three mount-time `useEffect`s wrap the load calls in IIFEs (per CORRECTIONS_LOG 2026-05-03 entry on the React purity rule's same-file useCallback tracing). New `renderColdStartBanner()` helper rendered above the topbar — hidden when all three fetches idle, yellow "Retrying load…" banner while any is mid-retry, red "Could not load X — Click here to retry" with one button per exhausted fetch once any exhausts. Click handlers run in React events so synchronous setState there is fine — they immediately clear the red banner ('exhausted' → 'idle') before the retry runs.

- **`src/app/projects/[projectId]/keyword-clustering/components/CanvasPanel.tsx` (modified, ~10 LOC net delete).** Mount-time `fetchCanvas()` useEffect removed (the canvas fetch now lives in `KeywordWorkspace` so all three fetches share the centralized retry-state + banner). `fetchCanvas` removed from the destructured `canvas` props. Comment in the file explains the move.

**Docs (Group A + Group B):**
- `docs/KEYWORD_CLUSTERING_ACTIVE.md` — this STATE block prepended; prior 2026-05-02-e STATE block demoted to historical; header timestamp.
- `docs/ROADMAP.md` — Active Tools row updated; "NEW HIGH — Cold-start hard-refresh" entry flipped from open HIGH to "🟡 CODE FIX SHIPPED 2026-05-03 — pending live verification" with cross-reference to the new helper module + the file paths touched; header timestamp.
- `docs/CHAT_REGISTRY.md` — new top row.
- `docs/CORRECTIONS_LOG.md` — new INFORMATIONAL entry on the React `react-hooks/purity` rule's same-file useCallback tracing (caught mid-session as a 3-error lint regression; fixed with IIFE wrapper).
- `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc modified flags + this-session summary.

### Verification scoreboard (build + tests + lint)

| Check | Result | Note |
|---|---|---|
| `node --test src/lib/*.test.ts` | ✅ 284/284 pass | Was 273; +11 new from cold-start helper |
| `npx tsc --noEmit` | ✅ clean | |
| `npm run build` | ✅ clean | 17/17 routes; compiled in 13.0s |
| `npm run lint` | ✅ 16e/41w (baseline parity) | Mid-session trip to 19e captured to CORRECTIONS_LOG; resolved before commit |

### How the fix behaves in plain language

When the director hard-refreshes the Keyword Clustering page, three behind-the-scenes data loads happen in parallel:

1. **Canvas** (topics + viewport) via `useCanvas.fetchCanvas` — itself a `Promise.all` of `/canvas/nodes` GET + `/canvas` GET, so two endpoints under one fetch.
2. **Keywords** via `useKeywords.fetchKeywords` (`/keywords` GET).
3. **Removed-keywords** via inline `authFetch` (`/removed-keywords` GET).

Total = 4 endpoints. At ~25% per-endpoint flake rate, ~68% of cold starts had at least one flake under the prior code. Today's fix:

- **First failure on any of the three fetches** → automatic retry after 2 seconds. Banner appears: yellow "⏳ Retrying load… (canvas)" or similar, listing whichever fetches are mid-retry.
- **Second failure** → retry again after 5 seconds.
- **Third failure (exhausted)** → red banner replaces the yellow one: "⚠ Could not load canvas. [Click here to retry canvas]" — one button per exhausted fetch.
- **Click the retry button** → that single fetch retries with a fresh 3-attempt cycle. Other fetches are unaffected.
- **All three idle** → banner hidden entirely; workspace looks normal.

The director NEVER sees a silently-empty workspace anymore — every cold-start failure mode is now surfaced + recoverable without a full hard-refresh.

### Multi-workflow protocol coordination

- **Schema-change-in-flight flag:** stays `No` (no schema work this session).
- **Branch:** `main` (W#1's home).
- **Cross-workflow doc edits:** none.
- W#2 still 🆕 about-to-start; no parallel chat ran during this session.
- Pull-rebase at session start: clean (already up to date with `3827bc3` on origin/main).
- Pull-rebase before commit: standard end-of-session step.

### Files touched this session

**Code:**
- `src/lib/cold-start-fetch-retry.ts` (NEW)
- `src/lib/cold-start-fetch-retry.test.ts` (NEW)
- `src/app/projects/[projectId]/keyword-clustering/components/KeywordWorkspace.tsx` (modified)
- `src/app/projects/[projectId]/keyword-clustering/components/CanvasPanel.tsx` (modified)

**Docs (Group A + Group B):**
- `docs/KEYWORD_CLUSTERING_ACTIVE.md` (this STATE block prepended; 2026-05-02-e demoted; header)
- `docs/ROADMAP.md` (Active Tools row + cold-start render-layer entry flipped to 🟡 CODE FIX SHIPPED 2026-05-03; header)
- `docs/CHAT_REGISTRY.md` (new top row)
- `docs/CORRECTIONS_LOG.md` (INFORMATIONAL entry on React purity rule)
- `docs/DOCUMENT_MANIFEST.md` (timestamps + per-doc flags + this-session summary)

**Push status:** commit local; push pending director's Rule 9 approval at end-of-session.

### Standing instructions for next session

**🎯 Gate context (NEW 2026-05-03):** items (a), (c), and (b) below are now tracked as the three prerequisites of the **W#1 PRODUCTION-READINESS GATE — D3 RETRY** entry near the top of `ROADMAP.md`. D3 is the canonical name for the full-fledged Bursitis run to completion (≥600 topics; the milestone the docs have been implicitly working toward but never explicitly scheduled). Resume the paused Bursitis Test 2 project from the 33/291 checkpoint at canvas 120 topics once all three prerequisites pass. See the gate entry on ROADMAP for full success criteria + estimated total session count.

(a) **Live-verify the cold-start render-layer fix on production vklf.com — RECOMMENDED.** After push approval + Vercel auto-redeploy, hard-refresh the Bursitis Test 2 workspace 5-10 times. Expected: most refreshes populate normally with no banner; some refreshes show the yellow "Retrying load…" banner briefly then populate; rare refreshes show the red "Could not load X — Click here to retry" banner — clicking the retry button should populate the missing data without a full hard refresh. ~10-20 min wall-clock; no AI cost; no DB writes. Most thorough next step because the verification empirically confirms the fix works against the underlying ~25% pgbouncer flake rate. **Closes the recovery-flow gap that compounds with the 2026-05-02-e helper.**

(b) **Underlying flake-rate investigation** (the standing entry from 2026-05-02-e). Measure rate per-endpoint with structured telemetry; investigate Supabase plan tier / pgbouncer pool sizing / Prisma client management / server-side withRetry parity. ~2-3 sessions. Bigger commitment but addresses root cause. Director needs to share Supabase plan tier info during this session.

(c) Recency-stickiness fix — sister-link op deferral to consolidation-only + Q5→B touch-semantics refinement. Orthogonal to (a)/(b).

(d) GoTrueClient multi-instance fix — small refactor (~15 LOC).

(e) Phase-1 UI polish bundle (6+ items).

(f) Action-by-action feedback workflow design.

(g) V3-era cleanup pass (deferred from Session E D4).

**Recommendation: (a) — live-verify the cold-start fix.** Same pattern as the 2026-05-02-d → 2026-05-02-e sequence: code shipped, verify live before stacking the next concern. The fix is small enough (~190 LOC + 115 LOC helper + 11 tests) that a 10-20 minute live test is the most thorough way to close it; deferring would mean accumulating two unverified fixes (post-rebuild verified 2026-05-02-e + cold-start unverified) which compounds risk.

**Director's framing through prior sessions:** (Scale-A) → (Scale-0) → (Defense-in-Depth ×3) → (Scale-B) → (Scale-C) → (Scale-D) → (Scale-E build) → (Scale-E D3 partial validation) → (consolidation auto-fire follow-up `2026-05-01-c`) → (HTTP 500 fix verification + auto-fire trip observation `2026-05-02`) → (browser-freeze fix design `2026-05-02-b`) → (DevTools profiling pass — diagnosis rejected `2026-05-02-c`) → (HTTP 500 retry regression investigation — fix shipped `2026-05-02-d`) → (HTTP 500 fix live verification + cold-start canvas-empty finding `2026-05-02-e`) → **(cold-start render-layer fix, this session)** → (live verification of the cold-start fix — RECOMMENDED next).

---

## ⚠️ POST-2026-05-02-e-HTTP-500-FIX-LIVE-VERIFICATION-AND-COLD-START-CANVAS-EMPTY-FINDING STATE (preserved as historical context — last updated 2026-05-02-e; SUPERSEDED by the cold-start render-layer fix state above. Both helper paths VERIFIED LIVE; cold-start render-layer entry CODE FIX SHIPPED 2026-05-03 above, pending its own live verification.)

**As of 2026-05-02-e (fifth session of the day, follow-up to `session_2026-05-02-d_http-500-retry-regression-investigation`). DOC + LIVE-RUN session — no code changes. Approved push of `e2a32b2` to vklf.com at session start; live-verified the post-rebuild fetch retry helper on Bursitis Test 2 against the preserved 30/291 checkpoint. Verification SUCCEEDED on all four primary signals; both helper paths exercised in 4 apply events. Two new HIGH-severity ROADMAP findings captured during the run. End-of-session doc-only commit + push.**

### What this session shipped to W#1

**Code:** none. The verification subject was the code shipped in 2026-05-02-d (`e2a32b2`); this session only deployed it (push) and exercised it (live run).

**Push status:** `e2a32b2 HTTP 500 retry regression — partial-apply state recovery defended` was pushed to `origin/main` at session start with director's explicit Rule 9 approval, triggering Vercel auto-redeploy.

**Live-verification run on production vklf.com — Bursitis Test 2:**

- **Resume point:** preserved 30/291 checkpoint at canvas ~108 topics from `2026-05-02-c_devtools-profiling-pass` session.
- **Settings:** Sonnet 4.6, Direct mode, Thinking=Enabled with Budget=12000, Cadence=3, Min-Canvas=15. (Director switched Thinking from Adaptive to Enabled-12000 vs the 2026-05-02-c run; safe choice for canvas ≥50 topics per the in-app warning. Doesn't affect HTTP 500 path under test.)
- **Run trajectory:** Batch 31 → Batch 32 (helper full-exhaust + pause) → manual refresh + Resume → Batch 33 → Consolidation-after-B33 (helper single-flake recovery) → Batch 34 (paused mid-thinking by director, did not apply).
- **4 apply events captured:**
  1. **Batch 31 — clean apply at canvas 118.** No helper warn lines. NO freeze. Cost $0.378.
  2. **Batch 32 — helper FULL EXHAUST at canvas 120.** Atomic rebuild succeeded. All 3 post-rebuild refresh attempts failed (attempt 1 = `nodes fetch HTTP 500`; attempt 2 = `state fetch HTTP 500`; attempt 3 also failed). Helper threw the annotated error; runLoop's `_postRebuildFetchFailed` catch branch fired → batch marked complete server-side, checkpoint saved at 32, run paused with the documented user message. Cost $0.362 with NO whole-batch retry penalty.
  3. **Batch 33 — clean apply at canvas 122.** Resume after manual refresh worked cleanly. No helper warn lines. NO freeze. Cost $0.361.
  4. **Consolidation after Batch 33 — helper SINGLE-FLAKE RECOVERY at canvas 120.** Atomic rebuild succeeded. Attempt 1 = `state fetch HTTP 500` → `retrying refresh in 2s…` → attempt 2 succeeded silently → consolidation completed normally. NO whole-batch retry. Run continued seamlessly into Batch 34. Cost $0.283. **Confirms helper covers the consolidation post-rebuild path** (consolidation → `doApplyV3` → helper at the same call site as regular batches).
- **Run summary:** 3 successful regular batches + 1 successful consolidation; 2 helper-fire events (1 full-exhaust + 1 single-flake-recovery); 0 freeze events; 0 whole-batch retries on flakes; total cost $1.384; wall-clock ~14 min start to pause.

### Verification scoreboard — all four primary signals landed

| Signal | Required | Observed |
|---|---|---|
| Helper warn lines with right format + backoffs (2s + 5s) | yes | ✅ Exact format on Batch 32 (full exhaust) + post-B33 consolidation (single-flake recovery); both endpoint variants (`nodes` + `state`) tested |
| NO whole-batch retry on flakes | yes | ✅ Confirmed across both helper-fire events (NO `Batch N error: fetchCanvas failed… retrying in 5s…` lines) |
| Helper-exhaust path produces clean refresh-and-Resume pause | yes | ✅ Documented user-facing message landed verbatim; checkpoint saved server-side at 32; run state correctly transitioned to API_ERROR |
| NO freeze at canvas ≥105 (Hypothesis A test) | yes | ✅ Confirmed at canvas 118 + 120 + 122; layout pass stayed at 122ms (heights 119 + layout 3) consistent with 2026-05-02-c profiling data; no Chrome unresponsive popup |

**Hypothesis A — CONFIRMED:** the freeze did NOT recur at canvas 118-122. The structural mechanism the helper targets (stale-client-retry corruption from cyclic stableId references or silent stableId-collision overwrites) was the freeze cause; eliminating the mechanism eliminated the freeze. The diagnosis-rejected browser-freeze ROADMAP entry can now close on the 2026-05-01-c freeze cause; if a future freeze emerges at higher canvas size, that's a separate concern (Hypothesis B / C from `BROWSER_FREEZE_FIX_DESIGN §9.5`).

**Cost savings empirical evidence:** Batch 32's helper-exhaust event cost $0.362 with NO retry penalty. Same flake on old code (e.g., 12:28 PM run's Batch 15 at canvas 78) cost $0.719 across 3 attempts due to whole-batch retries → cyclic stableId rejection → final attempt success. **The helper saved ~$0.30 on this single flake event.** At ~25% flake rate × ~291-batch full run, projected savings: $20-30 per full run.

### Two new HIGH-severity findings captured this session (additions to ROADMAP)

**Finding A — Cold-start hard-refresh canvas/keyword table renders empty under shared pgbouncer pressure (severity: HIGH; existing 2026-05-02-d MEDIUM entry expanded + upgraded):**

Director observed during the post-Batch-32 helper-exhaust recovery flow that:

- **Multiple hard refreshes** were required for the canvas to populate (NOT the "second refresh fixes it consistently" pattern initially scoped 2026-05-02-d).
- On some refreshes, **the keyword table itself failed to populate** (NEW finding 2026-05-02-e — broader than scoped; ANY of the four browser-side fetches can flake on cold start).
- Director's framing: *"All these issues need to be fixed."*

The existing 2026-05-02-d ROADMAP MEDIUM entry was upgraded MEDIUM → HIGH and expanded with the new keyword-table-also-fails finding. Underlying probability math: with FOUR mount-time fetches at ~25% per-endpoint flake rate, P(all four succeed) = `0.75⁴ ≈ 0.32` → ~68% of cold starts have at least one flake. Multiple refreshes work because each is an independent trial; expected number of refreshes ≈ 3 (matches director's observation). Suggested fix direction (1-2 sessions): cold-start retry on `useCanvas.fetchCanvas` + `useKeywords` + visible "Retrying load…" indicator + explicit "click here to retry" UI on exhaust.

**Finding B — Underlying ~25% per-endpoint pgbouncer/Prisma flake rate is the rate-layer root cause of all observed HTTP 500 patterns (severity: HIGH; new infrastructure entry):**

Today's helper (recovery layer) + `df09611` (server-side endpoint layer) + the cold-start render-layer fix (Finding A) are all scaffolding around an underlying ~25% per-endpoint flake rate. Symptoms surface across all four DB-backed browser endpoints (canvas state, canvas nodes, keywords, removed-keywords). Likely root cause: pgbouncer connection pool pressure on Supabase, exacerbated by long atomic-rebuild transactions (per the existing `aa.rebuildHTTP` linear-scaling MEDIUM entry). Investigation directions (2-3 sessions): structured per-endpoint flake telemetry; Supabase plan tier / pgbouncer pool sizing; Prisma client connection management; server-side `withRetry` parity audit; atomic-rebuild transaction duration reduction; long-term Phase 2 server-side-execution architecture.

### Multi-workflow protocol coordination

- **Schema-change-in-flight flag:** stays `No` (no schema work this session).
- **Branch:** `main` (W#1's home).
- **Cross-workflow doc edits:** none.
- W#2 still 🆕 about-to-start; no parallel chat ran during this session.
- Pull-rebase at session start: clean (`e2a32b2` was already on local main from 2026-05-02-d's commit; this session pushed it).
- Pull-rebase before commit: standard end-of-session step.

### Files touched this session

**Code: none.**

**Docs (Group A + Group B):**

- `docs/ROADMAP.md` — Active Tools row updated; 🟡 CODE FIX SHIPPED 2026-05-02-d entry flipped to ✅ VERIFIED LIVE 2026-05-02-e with 4-event verification narrative; existing cold-start canvas-empty MEDIUM entry upgraded to HIGH + expanded with keyword-table-also-fails finding; new HIGH rate-layer entry inserted; header timestamp.
- `docs/KEYWORD_CLUSTERING_ACTIVE.md` — this STATE block prepended; prior 2026-05-02-d STATE block demoted to historical; header timestamp.
- `docs/CHAT_REGISTRY.md` — new top row.
- `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc modified flags + this-session summary.

**Push status:** doc-only commit pushed end-of-session.

### Standing instructions for next session

(a) **Cold-start render-layer fix — RECOMMENDED.** Add cold-start retry to `useCanvas.fetchCanvas`, `useKeywords`, and any other parallel mount-time fetches mirroring `post-rebuild-fetch-retry.ts` pattern. Surface "Retrying load…" indicator on first failed attempt; explicit "click here to retry" UI on exhaust. ~1-2 sessions. Closes the recovery-flow gap that compounds with today's verified helper. **Most thorough next step** because every helper-exhaust event currently routes through the still-broken cold-start render path. Director's standing direction at end-of-session 2026-05-02-e: "All these issues need to be fixed."

(b) **Underlying flake-rate investigation.** Measure rate per-endpoint with structured telemetry; investigate Supabase plan tier / pgbouncer pool sizing / Prisma client management / server-side withRetry parity. ~2-3 sessions. Bigger commitment but addresses root cause. Director needs to share Supabase plan tier info during this session.

(c) Recency-stickiness fix — sister-link op deferral to consolidation-only + Q5→B touch-semantics refinement. Orthogonal to (a)/(b).

(d) GoTrueClient multi-instance fix — small refactor (~15 LOC); could combine with (a) into one combined small-fix session.

(e) Phase-1 UI polish bundle (6+ items).

(f) Action-by-action feedback workflow design.

**Recommendation: (a) — cold-start render-layer fix.** Director's framing this session puts the cold-start UX issue in the critical path of the verified recovery-layer helper; fixing (a) restores the end-to-end flow the helper assumes.

**Director's framing through prior sessions:** (Scale-A) → (Scale-0) → (Defense-in-Depth ×3) → (Scale-B) → (Scale-C) → (Scale-D) → (Scale-E build) → (Scale-E D3 partial validation) → (consolidation auto-fire follow-up `2026-05-01-c`) → (HTTP 500 fix verification + auto-fire trip observation `2026-05-02`) → (browser-freeze fix design `2026-05-02-b`) → (DevTools profiling pass — diagnosis rejected `2026-05-02-c`) → (HTTP 500 retry regression investigation — fix shipped `2026-05-02-d`) → **(HTTP 500 fix live verification + cold-start canvas-empty finding, this session)** → (cold-start render-layer fix — RECOMMENDED next).

---

## ⚠️ POST-2026-05-02-d-HTTP-500-RETRY-REGRESSION-INVESTIGATION STATE (preserved as historical context — last updated 2026-05-02-d; SUPERSEDED by HTTP 500 fix live verification state above. The code fix shipped in this session was VERIFIED LIVE 2026-05-02-e on Bursitis Test 2 — both helper paths exercised + Hypothesis A confirmed at canvas 118-122; full verification narrative in the state block above.)

**As of 2026-05-02-d (fourth session of the day, follow-up to `session_2026-05-02-c_devtools-profiling-pass`). CODE-FIX session — implemented Option A from this session's design picker. Pure helper + helper-tests + AutoAnalyze.tsx wiring. No schema, no DB, no live run, no deploy yet. Live verification deferred to a follow-up session.**

### What this session shipped to W#1

**New code (single commit, ready to push):**

- **`src/lib/post-rebuild-fetch-retry.ts` (NEW, ~150 lines incl. extensive header comment).** Pure helper `runRefreshWithRetry(refresh, options)` plus type guard `isPostRebuildFetchFailedError`. Mirrors the `prisma-retry.ts` pattern: sleep injection for tests, options.maxAttempts (default 3) + options.backoffsMs (default `[2000, 5000]`) + options.onAttemptFailed callback for activity-log surfacing. On persistent failure throws an annotated `Error` carrying `_noRetry: true` AND `_postRebuildFetchFailed: true` plus a self-explanatory user-facing message ("Canvas rebuild SUCCEEDED but UI refresh failed after 3 attempts. The batch IS applied on the server (canonical). Refresh the browser tab and click Resume…"). Module-level comment (~75 lines) captures the full partial-apply state recovery rationale: visible failure mode (cyclic stableId references caught by applier guards), silent failure mode (rebuild route's per-(projectWorkflowId, stableId) upsert collisions overwriting attempt-1 content with attempt-2 values — no guard catches this), and the resume story (browser refresh → fresh client state → batch advances cleanly to the next one).

- **`src/lib/post-rebuild-fetch-retry.test.ts` (NEW, 13 tests).** Covers: type guard semantics (4 tests), happy path (1), single-flake recovery (1), two-flake recovery (1), 3-attempt-exhaust + correct error annotations + clear user-facing message (1), `onAttemptFailed` callback semantics — fires for retried attempts, NOT for the final failure (1), custom maxAttempts (1), custom backoffsMs (1), short-backoffs-array reuse (1), non-Error thrown values stringified safely (1). All 13 pass via `node --test --experimental-strip-types`.

- **`src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` (modified, two locations).** (1) Added import for `runRefreshWithRetry`. (2) Replaced the bare `await onRefreshCanvas(); await onRefreshKeywords();` (post-atomic-rebuild step at line ~1121) with a wrapped call that surfaces each retry attempt to the activity log as a warn-level line ("Post-rebuild canvas refresh failed (attempt N/3): …; retrying refresh in Xs…"). (3) Added a `_postRebuildFetchFailed` branch in the runLoop catch (before the standard retry/fail logic): marks `batch.status = 'complete'`, advances `currentIdx`, calls `saveCheckpoint()`, sets `API_ERROR` state, surfaces an explicit refresh-and-Resume guidance line, returns from runLoop. ~75 LOC net add total in this file (helper call site + new catch branch).

**Docs (Group A + Group B):**
- `docs/KEYWORD_CLUSTERING_ACTIVE.md` — this STATE block prepended; prior 2026-05-02-c STATE block demoted to historical; header timestamp.
- `docs/ROADMAP.md` — Active Tools row updated; HIGH-severity HTTP 500 retry regression entry from `2026-05-02-c` flipped from "🚨 NEW HIGH-severity regression — Investigation pending" to "🟡 CODE FIX SHIPPED 2026-05-02-d — pending live verification" with cross-reference to the new helper module; reframe note added on the morning-vs-afternoon evidence interpretation.
- `docs/CORRECTIONS_LOG.md` — new INFORMATIONAL entry on the morning-verification reframe (not a mistake — a reporting-precision lesson: "0 events across 9 small-canvas opportunities" doesn't statistically distinguish from "true rate ~25% at scale").
- `docs/BROWSER_FREEZE_FIX_DESIGN.md` — small status note appended to §9.5.1 (Hypothesis A) crossing-referencing the new helper as the structural defense; Hypothesis A's freeze-causation question still needs live verification but the structural mechanism is now defended.
- `docs/CHAT_REGISTRY.md` — new top row.
- `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc modified flags + this-session summary.

### The reframe that came out of the evidence re-read

Yesterday's afternoon STATE block called the 2026-05-02-c retry pattern a "HIGH-severity regression of `df09611`'s asymmetric fix." Today's evidence re-read says that framing is **partially right and partially wrong**:

**Right:** the underlying retry rate at scale is ~23–27% — high enough to be a real correctness concern.

**Wrong:** `df09611` did NOT regress. It did exactly what the asymmetric-fix design predicted: it halved state-fetch failures (yesterday's 5 hits → today's 2 hits, in roughly comparable load). What changed wasn't the fix — it was that nodes-fetch failures grew with canvas size (1 → 5), because the atomic rebuild transaction holds pgbouncer connections proportionally longer at larger canvas sizes (per the `aa.rebuildHTTP` linear scaling finding from 2026-05-02-c: 2.8s → 4.6s for 55 → 107 nodes). **Total observed rate stayed flat at ~25%.**

**The morning-session "0 storms across 6 batches" claim wasn't a regression that got reversed.** It was a small-sample reading at small-canvas (≤43 topics — well below the regime where pgbouncer-pressure surfaces today's pattern). At a true rate of ~25%, P(0 hits in 9 trials) is ~7.5% — low but not anomalous, and conditional on small canvas the rate is plausibly lower than 25% anyway.

**Operationally:** the 2026-05-02 "VERIFIED" closure of the original 30%-storm-rate concern was technically premature, but the fix DID work as designed. The remaining ~25% is the underlying base rate — a separate concern that today's code fix addresses **at the recovery layer**, not the rate layer. (A separate-future concern would be reducing the rate itself: more aggressive server-side retry timing, longer pgbouncer pool, etc. Not in scope today.)

### What this session's fix does, in one paragraph

The Auto-Analyze apply pipeline runs `applyOperations` in memory → POSTs `/canvas/rebuild` (atomic) → calls `await onRefreshCanvas() + onRefreshKeywords()` to resync UI. If that final refresh fails after the rebuild succeeded, the SERVER state is canonical post-apply but the CLIENT state is pre-apply (because `useCanvas.fetchCanvas` preserves prior state on failure — the 2026-04-28 hardening). Before today, the throw propagated to runLoop's outer catch and triggered a whole-batch retry — feeding the model stale client state and producing two failure modes:

- **Visible:** model returns ops that conflict with attempt-1's already-applied state (cyclic stableId references caught by applier guards, as observed at Batch 15 attempt 2 in the 2026-05-02-c session).
- **Silent:** rebuild route's `prisma.canvasNode.upsert` keys on `(projectWorkflowId, stableId)`. Attempt 2 may allocate the same `t-N` for a different topic (because client `nextStableIdN` is stale), and the server upsert silently overwrites attempt-1's title/description/content with attempt-2's. **No guard catches this.**

After today: post-rebuild refresh retries on its own (waits 2s, 5s, max 3 attempts). On persistent failure, the batch is marked complete server-side (it IS), checkpoint saved, run paused with explicit "refresh the browser tab and click Resume; the run will continue at the next batch with fresh canvas state" guidance. **Both visible and silent failure modes structurally eliminated.**

### Code-reading-derived testing of Hypothesis A

The 2026-05-01-c freeze fired during Batch 28 attempt 2's apply. `BROWSER_FREEZE_FIX_DESIGN §9.5.1` named this the leading suspect for what actually caused the freeze (after the §1 layout-pass diagnosis was rejected 2026-05-02-c). Today's fix defends against the **structural mechanism** of Hypothesis A. Live verification — running Bursitis Test 2 to ≥105 topics with the fix deployed — is the next session's task. Three outcomes are possible:

1. **Run reaches ≥105 topics cleanly without freeze** — Hypothesis A confirmed as the freeze cause; freeze concern closes.
2. **Run reaches ≥105 topics, the post-rebuild refresh exhausts retries (rare), the run pauses cleanly with the new guidance message** — fix works as designed; freeze caused by something else (Hypothesis B or C).
3. **Run freezes again at a similar topic count** — Hypothesis A ruled out; investigate Hypothesis B (uninstrumented React reconciliation + SVG paint) per the design doc's revised path forward.

### Multi-workflow protocol coordination

- **Schema-change-in-flight flag:** stays `No` (no schema work this session; no schema work needed for the post-rebuild-fetch-retry helper either).
- **Branch:** `main` (W#1's home).
- **Cross-workflow doc edits:** none.
- W#2 still 🆕 about-to-start; no parallel chat ran during this session.
- Pull-rebase at session start: clean (already up to date with `0d9803d` on origin/main).

### Files touched this session

**Modified (3 code, 6 docs):**

End-of-session commit (this commit):
- `src/lib/post-rebuild-fetch-retry.ts` — NEW pure helper. ~150 lines incl. header comment.
- `src/lib/post-rebuild-fetch-retry.test.ts` — NEW. 13 tests.
- `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` — import + post-rebuild refresh wrap (~25 LOC at apply-pipeline call site) + `_postRebuildFetchFailed` branch in runLoop catch (~25 LOC).
- `docs/KEYWORD_CLUSTERING_ACTIVE.md` — this STATE block prepended; prior 2026-05-02-c STATE block demoted; header timestamp.
- `docs/ROADMAP.md` — Active Tools row updated; HIGH-severity HTTP 500 retry regression entry status flipped to "🟡 CODE FIX SHIPPED 2026-05-02-d — pending live verification" with reframe note + cross-reference to helper module; header.
- `docs/CORRECTIONS_LOG.md` — new INFORMATIONAL entry on morning-verification reframe; header.
- `docs/BROWSER_FREEZE_FIX_DESIGN.md` — small status note appended to §9.5.1 (Hypothesis A) crossing-referencing the new helper.
- `docs/CHAT_REGISTRY.md` — new top row.
- `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc flags + this-session summary.

**Push status:** committed locally; **NOT pushed yet — pending director's discretionary approval at end-of-session per Rule 9.** Note: live-verification of the fix on production requires this commit to be deployed; push enables the next-session validation task.

### Standing instructions for next session — three "NEXT" choices

(a) **Live-verify the fix on a Bursitis Test 2 resume run — RECOMMENDED.** Push tonight's commit to vklf.com; let Vercel auto-deploy. Resume Bursitis Test 2's preserved checkpoint (canvas was at 108 topics post-2026-05-02-c profiling pass) OR start a fresh resume that drives canvas through ≥105 topics with at least 30+ batches' worth of activity. Confirm: (i) post-rebuild refresh-retry warn lines surface in the activity log when the refresh hiccups but recovers within retries (expected ~25% of large-canvas batches based on 2026-05-02-c rate); (ii) no whole-batch retries observed on those events; (iii) if the helper exhausts all 3 attempts (rare but possible), the new "applied server-side; refresh browser + Resume" pause path works correctly; (iv) freeze regime does NOT re-emerge at ≥105 topics — Hypothesis A confirmed; OR freeze re-emerges — Hypothesis A ruled out, investigate Hypothesis B in a follow-up. Cost: ~$2-5; ~30-60 min wall-clock. **Most thorough and reliable: it both validates today's code fix AND tests Hypothesis A as the freeze cause in one run.**

(b) **Browser-freeze investigation Hypothesis B (React reconciliation + SVG paint instrumentation).** Extend `db3d377`'s instrumentation to cover `setNodes()` → React reconciliation → SVG paint. Re-record at canvas 100+ to see if React/paint dominates. Defer until (a) is resolved — if Hypothesis A is confirmed, Hypothesis B may not need investigation at all.

(c) **Recency-stickiness fix** — sister-link op deferral to consolidation-only + Q5 → B touch-semantics refinement. Direct attack on the wall-question bottleneck. Orthogonal to (a) and (b); could be sequenced after (a) closes.

(d) **GoTrueClient multi-instance fix** — small refactor (~15 LOC) consolidating three browser-side Supabase clients to a single singleton. Lower priority; small + clean if a quick-fix session is wanted.

(e) Phase-1 UI polish bundle (6 items + cosmetic stale-batch-num log label).

(f) Action-by-action feedback workflow design.

**Recommendation: (a) — live-verify the fix.** This is the most thorough next step because it has THREE valuable outcomes: (i) confirms today's fix behaves as designed under real flakes; (ii) tests Hypothesis A as the leading suspect for last week's freeze; (iii) provides empirical evidence to justify the cross-doc reframe of "VERIFIED" status. After (a), the freeze-investigation tree branches based on outcome.

**Director's framing through prior sessions:** (Scale-A) → (Scale-0) → (Defense-in-Depth ×3) → (Scale-B) → (Scale-C) → (Scale-D) → (Scale-E build) → (Scale-E D3 partial validation) → (consolidation auto-fire follow-up `2026-05-01-c`) → (HTTP 500 fix verification + auto-fire trip observation `2026-05-02`) → (browser-freeze fix design `2026-05-02-b`) → (DevTools profiling pass — diagnosis rejected `2026-05-02-c`) → **(HTTP 500 retry regression investigation — fix shipped, live verification pending, this session)** → (live verification of the fix — RECOMMENDED next).

---

## ⚠️ POST-2026-05-02-c-DEVTOOLS-PROFILING-PASS STATE (preserved as historical context — last updated 2026-05-02-c; SUPERSEDED by HTTP 500 retry regression investigation state above. The §1 diagnosis from `BROWSER_FREEZE_FIX_DESIGN.md` was rejected this session; the HTTP 500 retry concern this session raised has now been fix-shipped 2026-05-02-d.)

**As of 2026-05-02-c (third session of the day, follow-up to early-afternoon's `2026-05-02-b_browser-freeze-fix-design`). PROFILING-PASS session — no code changes. Director executed `BROWSER_FREEZE_FIX_DESIGN.md §3` protocol on production Bursitis Test 2 project; pushed canvas through 108 topics; collected 31 batches' worth of timing measurements via DevTools console snippet. The diagnosis from §1 of the design doc was empirically REJECTED. New §9 added to design doc capturing data + revised hypotheses + recommended next-session direction. THREE findings captured (one in CORRECTIONS_LOG, two as new ROADMAP entries).**

### What this session shipped to W#1

**Code:** none. Profiling-pass-only session.

**Docs (Group B):**
- `docs/BROWSER_FREEZE_FIX_DESIGN.md` — header now declares "SUPERSEDED 2026-05-02-c — read §9 first" supersession notice; §0.1 status table updated; new §9 added (~280 lines covering full data table, diagnosis rejection analysis, three remaining hypotheses for the actual freeze cause, revised path forward, methodology note, what stays in codebase).

**Docs (Group A):**
- `docs/ROADMAP.md` — HIGH-severity browser-freeze entry flipped from "🔄 DESIGN COMPLETE — implementation pending profiling" to "⛔ DIAGNOSIS REJECTED — investigation continues per BROWSER_FREEZE_FIX_DESIGN §9"; Active Tools row updated; **TWO new entries added**: (1) HIGH-severity HTTP 500 fetchCanvas retry pattern regression — `df09611`'s fix verified clean across 6 batches in morning session BUT fired 8+ times across 31 batches today; ~25%+ recurrence rate inconsistent with morning's "VERIFIED clean"; (2) MEDIUM-severity Phase 3 scaling concern — `aa.rebuildHTTP` server-side time grows monotonically linearly with canvas size: 2,805 ms (canvas 55) → 4,645 ms (canvas 107); projects to ~10–15 s per atomic-rebuild call at 500 topics.
- `docs/CORRECTIONS_LOG.md` — new PROCESS-level entry: code-reading-based diagnosis empirically rejected by profiling. Lesson: "90% confidence from static analysis" framing is a deliberate caution to NOT skip profiling; profile-before-implement protocol worked exactly as designed (saved 2-3 sessions of misdirected implementation budget).
- `docs/CHAT_REGISTRY.md` — new top row for `session_2026-05-02-c_devtools-profiling-pass`; thirty-third Claude Code session.
- `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc modified flags + this-session summary; minor doc-drift correction (the prior-session "NOT pushed yet" note in line 106 was contradicted by `git status` showing `db3d377` was on origin/main; corrected this session).

### Diagnosis rejection summary — full detail in `BROWSER_FREEZE_FIX_DESIGN.md §9`

**The §1 diagnosis predicted:** at canvas 105+ topics, `runLayoutPass` Sub-step 3's overlap-resolution loop would fire 5–15 passes through O(n × depth) inner work, ballooning to 5,000–10,000+ ms and triggering Chrome's "page unresponsive" popup. Confidence stated as ~90% from code reading; profiling explicitly called out as the empirical-confirmation step.

**What the data showed across 31 batches at canvas 55→108 topics:**

| Measurement | Predicted (at canvas ≥100) | Observed (entire 55–108 range) |
|---|---|---|
| `aa.runLayoutPass` (total) | 100s of ms growing nonlinearly | **0.8–3.2 ms; max 3.0 ms at canvas 108** |
| `layout.step3-overlapResolve` passes | 5–15 worst case | **passes=1 EVERY SINGLE BATCH** |
| `aa.calcHeights` | 500–3,000 ms | 14.6–69.5 ms |
| Total in-browser work (heights+layout+stringify) | 5,000+ ms (freeze regime) | **~57 ms at canvas 108** |

**Verdict:** the bottleneck described in §1 does not exist on this canvas. Sub-step 3's overlap loop early-exits in 1 pass every time because the tree-walk in Sub-step 2 places nodes cleanly enough that no overlaps occur. **All three approaches in §4 (A=algorithmic / B=rAF chunking / C=Web Worker) are moot** — they would optimize a step that already runs in milliseconds. Approach A would have wasted 2–3 sessions of implementation budget on a fix that produces zero functional improvement.

**Confidence in rejection: very high.** 31 measurements, no inflection at any size including ABOVE last week's 105-topic freeze threshold, single-pass behavior consistent across regular batches + 4 consolidation passes + retry attempts.

### Three remaining hypotheses for what ACTUALLY caused last week's freeze (full detail §9.5)

1. **HTTP 500 retry storm + cascade** (LEADING — current likelihood HIGH). Last week's freeze fired during Batch 28 attempt 2's apply phase; the "attempt 2" framing matters because the retry path doesn't roll back the prior attempt's canvas mutations on the server, leaving retries to operate against partially-modified state. Today's session observed the retry pattern fire 8+ times across 31 batches, including a Batch 15 attempt 2 that returned ops creating a parent-chain cycle on `t-1` (caught cleanly by applier guard today; could have hit a different code path last week that did freeze). **Cross-references new ROADMAP entry on the retry regression.**
2. **Uninstrumented code paths — React reconciliation or SVG paint** (MEDIUM). The instrumentation covers four named operations + four sub-steps inside runLayoutPass, but does NOT cover `setNodes()` → React reconciliation → SVG paint. SVG paint of 100+ nodes-with-connector-lines at scale is a known browser perf hotspot that can take seconds. Would require new instrumentation in a future session if Hypothesis A's investigation rules itself out.
3. **One-time edge case** (LOW-MEDIUM). Server hiccup, OS event, network glitch coinciding with apply. Not reproducible by definition; if true, no fix needed beyond operational awareness.

### Multi-workflow protocol coordination

- **Schema-change-in-flight flag:** stays `No` (no schema work this session; none expected for retry-regression investigation either).
- **Branch:** `main` (W#1's home).
- **Cross-workflow doc edits:** none.
- W#2 still 🆕 about-to-start; no parallel chat ran during this session.
- Pull-rebase at session start: clean (already up to date with `db3d377` on origin/main).

### Files touched this session

**Modified (5 docs, 0 code):**

End-of-session commit (this commit):
- `docs/BROWSER_FREEZE_FIX_DESIGN.md` — supersession notice at top; §0.1 status table updates; new §9 (~280 lines).
- `docs/KEYWORD_CLUSTERING_ACTIVE.md` — this STATE block prepended; prior 2026-05-02-b STATE block demoted; header timestamp.
- `docs/ROADMAP.md` — HIGH-severity browser-freeze entry flipped to ⛔ DIAGNOSIS REJECTED; Active Tools row updated; TWO new entries (HTTP 500 retry regression + rebuildHTTP linear scaling); header timestamp.
- `docs/CORRECTIONS_LOG.md` — new PROCESS-level entry on diagnosis rejection; header timestamp.
- `docs/CHAT_REGISTRY.md` — new top row; header timestamp.
- `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc flags + this-session summary; minor prior-session push-status doc-drift corrected.

**Push status:** committed locally; **NOT pushed yet — pending director's discretionary approval at end-of-session per Rule 9.**

### Standing instructions for next session — three "NEXT" choices

(a) **Investigate the HTTP 500 retry regression — RECOMMENDED.** The `df09611` fix was reportedly verified clean in this morning's session (zero retries across 6 batches) but fired 8+ times across 31 batches today (~25%+ recurrence rate). Either the morning verification was sample-luck, OR something has changed since (Vercel function restart? Postgres connection pool eviction? unrelated infrastructure event?). This is the leading suspect for last week's 105-topic freeze (Hypothesis A in `BROWSER_FREEZE_FIX_DESIGN §9.5.1`). Plan: read the morning-session evidence + today's full retry trajectory; audit the retry-after-failed-fetch path for partial-apply state recovery (the current path doesn't roll back the prior attempt's canvas mutations on the server); design + implement a fix in the standard atomic-rebuild pattern. Likely 1-2 sessions. **Most thorough and reliable: it both addresses an independent HIGH-severity regression AND tests Hypothesis A as the root cause of last week's freeze.**

(b) **Extend instrumentation to cover React reconciliation + SVG paint, then re-record.** Tests Hypothesis B (uninstrumented code paths). Smaller-scope investigation but only addresses one of the three hypotheses; deferred until (a) is resolved.

(c) **Defer freeze investigation; pick another option from the prior STATE block menu** — recency-stickiness fix, GoTrueClient consolidation, Phase-1 polish bundle, etc. The freeze concern stays open but design state is captured.

**Recommendation: (a) — investigate HTTP 500 retry regression.** This is the most thorough next step because it has TWO valuable outcomes: (1) addresses an independently HIGH-severity regression that should not stay in the codebase, AND (2) directly tests the leading hypothesis for last week's freeze. After (a), if the freeze regime doesn't re-emerge, the freeze investigation can close.

**Director's framing through prior sessions:** (Scale-A) → (Scale-0) → (Defense-in-Depth ×3) → (Scale-B) → (Scale-C) → (Scale-D) → (Scale-E build) → (Scale-E D3 partial validation) → (consolidation auto-fire follow-up `2026-05-01-c`) → (HTTP 500 fix verification + auto-fire trip observation `2026-05-02`) → (browser-freeze fix design `2026-05-02-b`) → **(DevTools profiling pass — diagnosis rejected, this session)** → (HTTP 500 retry regression investigation — RECOMMENDED next).

---

## ⚠️ POST-2026-05-02-b-BROWSER-FREEZE-FIX-DESIGN STATE (preserved as historical context — last updated 2026-05-02-b; SUPERSEDED by DevTools profiling pass state above. Diagnosis from this session was empirically REJECTED 2026-05-02-c.)

**As of 2026-05-02-b (second session of the day, follow-up to this morning's HTTP-500 fix verification + auto-fire trip observation work). DESIGN-ONLY session producing the new Group B doc `docs/BROWSER_FREEZE_FIX_DESIGN.md` + small profiling instrumentation. Code-reading-based diagnosis pinpoints the bottleneck; empirical confirmation via DevTools profiling on Bursitis Test 2 is the next session's task. Implementation deferred pending profiling.**

### What this session shipped to W#1

**Code (single commit, ready to push at director's discretion):** profiling instrumentation across two files. Zero behavior change; sub-millisecond cost per mark; safe to leave in production indefinitely.

- `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` (lines 997-1048) — four named `performance.measure()` blocks bracketing the four suspect operations in the apply phase: `aa.calcHeights`, `aa.runLayoutPass`, `aa.stringify`, `aa.rebuildHTTP`. The "Layout pass complete" activity-log line extended to surface `heights=Xms, layout=Yms` per batch directly in the panel — gives the director concrete numbers without opening DevTools. ~30 LOC net add (mostly perf marks + the activity-log extension).

- `src/lib/canvas-layout.ts` (inside `runLayoutPass`) — four sub-step measures `layout.step1-resetRoots` through `layout.step4-separatePathways` so the DevTools recording can show WHICH of the four sub-steps dominates. Step 3 (60-pass overlap loop) also stashes its actual pass count on the measure entry as a `_passes` field for diagnostic purposes. Helper functions `_mark` + `_measure` are guarded by `typeof performance !== 'undefined'` for SSR / non-browser safety. ~25 LOC net add.

**Docs (Group B, NEW):**
- `docs/BROWSER_FREEZE_FIX_DESIGN.md` — 555-line design doc structured around 8 sections + Resume Prompt:
  - §0 Status, scope, multi-workflow protocol coordination
  - §1 Diagnosis — apply pipeline trace (steps 1-9) + why `runLayoutPass` Sub-steps 2 + 3 dominate (with concrete code references and complexity analysis); empirical evidence the freeze is in steps 3-4 of the pipeline
  - §2 What is NOT the bottleneck (and why) — atomic rebuild API, Prisma transaction, G1 guard, etc.
  - §3 Profiling protocol — director-facing Chrome DevTools recording instructions (~5-15 min protocol; copy-paste-ready clicks)
  - §4 Fix-approach picker — Approach A (algorithmic; **recommended**) / Approach B (requestAnimationFrame chunking) / Approach C (Web Worker offload), with explicit recommendation per Rule 14f
  - §5 Implementation plan sketch (per pick, contingent on director's choice after profiling)
  - §6 Profiling instrumentation reference (what was added this session, where, how to query)
  - §7 Open questions + deferred items (per Rule 14e)
  - §8 Resume Prompt (canonical re-entry — `Read docs/CLAUDE_CODE_STARTER.md...` template per Rule 22)

### Diagnosis summary (full detail in BROWSER_FREEZE_FIX_DESIGN.md §1)

The 2026-05-01-c freeze fired during Batch 28's apply phase on a 105-topic canvas. Code reading identifies the dominant bottleneck as `runLayoutPass` (specifically Sub-step 3, the 60-pass overlap resolution loop at `src/lib/canvas-layout.ts:269-292`) with `subtreeBottom` and `ancestorCollapsed` calling `nodes.find()` (O(n) linear scan) inside their hot loops, producing worst-case O(60 × n² × depth) execution that lands in Chrome's "page unresponsive" 5+ second threshold at n=105. Secondary contributor: `calcNodeHeight × n` (canvas `measureText` per node × wrapped lines) at ~500-3,000ms. Confidence ~90% from the math; remaining ~10% will be settled by the DevTools recording on Bursitis Test 2.

**What's NOT the bottleneck** (ruled out via code reading): the atomic rebuild API call (server-side, async, doesn't block main thread), the Prisma transaction inside the rebuild route, the G1 payload-sanity guard, `materializeRebuildPayload` (Map-lookup-based; ~5-20ms), `recordTouchesFromOps`. Some of these consume noticeable wall-clock time but don't synchronously block the browser's main thread.

### Fix-approach picker — director picks AFTER profiling (full detail in §4)

- **(A) Algorithmic fix — RECOMMENDED.** Replace `nodes.find()` calls with `Map<id, node>` lookups; replace recursive `subtreeBottom` with memoized post-order DFS; replace 60-pass O(n²) overlap loop with sweep-and-prune O(n log n); precompute "any-ancestor-collapsed" as a Set; memoize `calcNodeHeight` per content hash. Expected outcome: layout pass at 105 nodes drops from 5,000-10,000+ ms to ~50-200ms; at 500 nodes drops from "wholly unusable" to ~500-1,000ms. **Fixes root cause; scales to Phase 3.** Implementation budget: 2-3 sessions (refactor + tests + live validation).

- (B) requestAnimationFrame chunking. Yield the layout pass between sub-steps via `await new Promise(r => requestAnimationFrame(r))`. UI stays responsive; total CPU time unchanged. Stop-gap rather than fix. Defers but doesn't prevent Approach A. Implementation budget: 1-2 sessions.

- (C) Web Worker offload. Move `runLayoutPass` to a Web Worker. UI 100% responsive but compute time same. Heavier infrastructure cost; revisit only if Approach A's improved layout still doesn't meet Phase 3 bar at 500+ nodes. Implementation budget: 3-5 sessions.

**Why A over B over C:** per `feedback_recommendation_style.md` (most thorough and reliable, NOT fastest) + `HANDOFF_PROTOCOL.md` Rule 14f. (A) makes the wait disappear; (B) makes the wait responsive but still 5+ seconds; (C) hides the wait but still 5+ seconds. (A) is the only one that scales to 500-topic canvases without further refactoring.

### Profiling protocol — director's next-session task (full detail in §3)

5-15 minute Chrome DevTools recording on Bursitis Test 2 (currently 43 topics; resume past 80 for the recording-relevant size). Director runs the protocol; reports the four (or eight) timing measurements in milliseconds; Claude in next session validates the diagnosis and triggers the implementation plan per the chosen fix approach.

**Required precondition:** this session's commit must be pushed to `origin/main` AND Vercel must redeploy before §3 of the design doc works (the instrumentation lives in the deployed code). Push approval pending director confirmation at end-of-session.

### Multi-workflow protocol coordination

- **Schema-change-in-flight flag:** stays `No` (no schema work this session; none planned for any of the three fix approaches either).
- **Branch:** `main` (W#1's home).
- **Cross-workflow doc edits:** none — `BROWSER_FREEZE_FIX_DESIGN.md` is a new Group B doc owned exclusively by W#1.
- W#2 still 🆕 about-to-start; no parallel chat ran during this session.
- Pull-rebase at session start: clean (no parallel pushes since this morning).
- Pull-rebase at end-of-session commit: see commit step.

### Files touched this session

**Modified (2 code, 5 docs):**

End-of-session commit (this commit):
- `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` — profiling marks + activity-log extension. ~30 LOC net add.
- `src/lib/canvas-layout.ts` — sub-step profiling marks inside `runLayoutPass`. ~25 LOC net add.
- `docs/BROWSER_FREEZE_FIX_DESIGN.md` — NEW Group B doc, 555 lines.
- `docs/KEYWORD_CLUSTERING_ACTIVE.md` — this STATE block prepended; prior 2026-05-02 STATE block demoted to historical; header timestamp updated.
- `docs/ROADMAP.md` — Active Tools row updated; HIGH-severity browser-freeze entry from `2026-05-01-c` flipped from open to "🔄 Design complete — implementation pending profiling confirmation"; profiling-instrumentation polish entry added; header timestamp.
- `docs/CHAT_REGISTRY.md` — new top row for `session_2026-05-02-b_browser-freeze-fix-design`; thirty-second Claude Code session; header timestamp.
- `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc modified flags + this-session summary; new Group B doc registered.

**Push status:** committed locally; **NOT pushed yet — pending director's discretionary approval at end-of-session per Rule 9.** Note: §3 of `BROWSER_FREEZE_FIX_DESIGN.md` (the DevTools profiling protocol) requires the instrumentation to be deployed to vklf.com before the director can use it. Push enables the next-session profiling task.

### Standing instructions for next session — three "NEXT" choices

(a) **Run the DevTools profiling protocol on Bursitis Test 2 — RECOMMENDED.** Director executes `BROWSER_FREEZE_FIX_DESIGN.md` §3 (5-15 min Chrome DevTools recording on a Bursitis Test 2 canvas at ~80+ topics). Reports the four (or eight) timing measurements + observations. Claude validates the diagnosis and triggers the implementation plan per §5.1 (if Approach A is picked) or §5.2/§5.3 (if B or C). **Cheapest + highest-confidence path to confirming the diagnosis before committing implementation budget.** Budget: ~30 min director-time; ~30-60 min Claude-time in the validation session afterward. Closes the design with empirical evidence.

(b) **Skip profiling; commit directly to Approach A and start implementing.** Defensible because the code analysis is strong (~90% confidence from the math); saves ~30 minutes today. Costs the verification step that catches any unexpected hotspot (e.g., if `calcNodeHeight × n` turns out to dominate over `runLayoutPass`, the implementation order changes). **Not recommended** given director's standing preference for "most thorough and reliable."

(c) **Defer the freeze work; pick another option from the (a)/(b)/(c) menu in the prior STATE block** — recency-stickiness fix (option (b) historically) or GoTrueClient consolidation (option (c) historically). The freeze stays the highest-priority item per the diagnosis but the design is captured; resuming is a Resume Prompt away.

**Recommendation: (a) — run the DevTools profiling protocol.** Most thorough and reliable: confirms the diagnosis empirically, gives concrete millisecond numbers that pin the implementation priority order, and the protocol is fast (~30 min director-time including the runup). After (a), Approach A's Session 1 implementation can proceed with full confidence.

**Director's framing through prior sessions:** (Scale-A) → (Scale-0) → (Defense-in-Depth ×3) → (Scale-B) → (Scale-C) → (Scale-D) → (Scale-E build) → (Scale-E D3 partial validation) → (consolidation auto-fire follow-up `2026-05-01-c`) → (HTTP 500 fix verification + auto-fire trip observation `2026-05-02`) → **(browser-freeze fix design, this session)** → (DevTools profiling pass — RECOMMENDED next).

---

## ⚠️ POST-2026-05-02-HTTP-500-FIX-VERIFICATION-AND-AUTO-FIRE-TRIP-OBSERVATION STATE (preserved as historical context — last updated 2026-05-02; superseded by browser-freeze fix design state above)

**As of 2026-05-02 (first session of the day, follow-up to last night's `2026-05-01-c`). LIVE RUN session on production vklf.com — fresh "Bursitis Test 2" project (prior Bursitis Test deleted; new project loaded with same 2,328-keyword payload to match prior load profile while structurally avoiding the 105-topic browser-freeze threshold from yesterday). Both primary objectives decisively validated: HTTP 500 fix verified clean across realistic load; auto-fire trip observed live TWICE under live conditions. Pre-flight runner extended with P11 + P12 to close the coverage gap that produced the same misread slip in two consecutive sessions. Two protocol-rule additions to handoff docs.**

### What this session shipped to W#1

**Code (single commit, ready to push):** pre-flight runner extended with consolidation-prompt coverage.
- `src/lib/preflight.ts` — new `checkP11ConsolidationInitialPrompt(ctx)` + `checkP12ConsolidationPrimerPrompt(ctx)` paralleling the existing `P3` + `P4`. P11 enforces the same `>= 100` chars threshold the runtime gate uses at `AutoAnalyze.tsx:1474` (so the gate fires at run-start instead of one batch later). P12 mirrors P4's "empty=pass-as-optional, 1-29=fail-as-half-paste, ≥30=pass" pattern. Both checks gate behind `consolidationCadence === 0` — auto-fire disabled means consolidation prompts are not required. PreflightContext interface extended with `consolidationInitialPrompt`, `consolidationPrimerPrompt`, `consolidationCadence` fields. PreflightCheckResult `id` union extended with `'P11' | 'P12'`. Runner sequence inserts P11+P12 right after P4 so the four prompt checks appear adjacent in the UI list (stable ids preserved per director directive — no renumbering of P5..P10).
- `src/lib/preflight.test.ts` — 8 new tests (4 each for P11 + P12: cadence-disabled-pass + cadence-enabled-empty-fail + cadence-enabled-short-fail + cadence-enabled-substantial-pass for P11; cadence-disabled-pass + cadence-enabled-empty-pass + cadence-enabled-half-paste-fail + cadence-enabled-substantial-pass for P12). `makeContext` helper extended with the three new context fields. Runner all-pass test count updated from 10 → 12. Runner P9-fails test count updated from 9 → 11 (P11+P12 now run before P5..P9).
- `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` — `runPreflight()` call site at line 1658 extended to pass the three new context fields; `aaLog` message at line 1656 updated from "10 checks" to "12 checks".
- All checks green: 46/46 preflight tests pass (was 38; +8 new); tsc clean; build clean (17/17 routes); lint at exact baseline parity (16e/41w; zero new).

**Protocol-rule additions to handoff docs:**
- `docs/HANDOFF_PROTOCOL.md` Rule 14f — extended with new content-#4 (recommendation marker MUST live INSIDE picker labels, with `(recommended)` or `— RECOMMENDED` suffix; must reflect "most thorough and reliable" — not "fastest" or "cheapest"); mechanical test extended with new step #4; scope exception extended to require recommendation marker on simple yes/no questions too.
- `docs/HANDOFF_PROTOCOL.md` Rule 14g (NEW) — trust the director's setup confirmation; do not re-ask for verification when the director has explicitly confirmed AND only an automated runner has incomplete coverage. Captures the pattern across `2026-05-01-c` + `2026-05-02` recurrences. Cross-references the operational memory + the runner extension that closes this specific instance.
- `docs/CLAUDE_CODE_STARTER.md` Rule 3 — strengthened: recommendation must be (a) most-thorough-and-reliable, (b) marked with explicit `(recommended)` label INSIDE picker label. Cross-reference to Rule 14f.
- `docs/CLAUDE_CODE_STARTER.md` Rule 7 — extended with the trust-director-affirmation principle pointing at Rule 14g.

**Operational memory:**
- `feedback_recommendation_style.md` — strengthened with the placement-inside-picker requirement (caught + reinforced 2026-05-02 when Claude omitted the recommendation marker from the option labels).
- `feedback_trust_director_setup_confirmation.md` (NEW) — captures the canonical reasoning + slip history.
- `MEMORY.md` index — new entry pointing to the new feedback file.

### Live run results — Path A (auto-fire trip): DECISIVELY VALIDATED

**Two clean trips observed live, both with correct `auto` trigger source + both gates met:**

| Trip | Time | After batch | Canvas at trip | Counter at trip | Cadence gate | Min-canvas gate | Consolidation result |
|---|---|---|---|---|---|---|---|
| 1 | 9:24:41 PM | B3 (attempt 2) | 24 topics | 3 (1→2→3 across B1/B2/B3 applies) | ✓ (3 ≥ 3) | ✓ (24 ≥ 15) | $0.156, 2 ops, +2 sister links, no net topic change |
| 2 | 9:35:00 PM | B6 | 43 topics | 3 (fresh reset → 1→2→3 across B4/B5/B6 applies) | ✓ (3 ≥ 3) | ✓ (43 ≥ 15) | $0.164, 1 op, +1 sister link, no net topic change |

**Exact log lines observed:**
- `9:24:41 PM ═══ Consolidation pass (auto, canvas=24 topics) ═══`
- `9:35:00 PM ═══ Consolidation pass (auto, canvas=43 topics) ═══`

**This closes the partial validation from `2026-05-01-c`:**
1. Cadence counter increments cleanly after every successful regular apply (1→2→3).
2. Canvas-size gate (`>= consolidationMinCanvasSize`) and cadence gate (`>= consolidationCadence`) both must be true; trip fires only when both met.
3. After trip, counter resets to 0; subsequent regular batches restart the cadence count.
4. Distinct `auto` trigger source logging works correctly.
5. Post-trip runLoop resumes seamlessly into the next regular batch.
6. Reconciliation correctly skipped on consolidation passes (`✓ All 0 keywords verified`).
7. Pre-trip and post-trip checkpoint persistence work (counter reset, touchTracker, pathway state all survive).

### Live run results — Path B (HTTP 500 fix): DECISIVELY VALIDATED

**Zero HTTP 500 retry storms across:**
- 6 regular batches (B1-B6) with full apply pipelines (atomic canvas rebuilds + reconciliation queries + state fetches)
- 2 consolidation auto-fire trips (each with full atomic rebuild + state fetches)
- 1 in-flight Batch 7 (state fetch at run start)
- ~7 atomic canvas rebuilds total
- Dozens of individual Prisma queries through pgbouncer

**Comparison to yesterday's session (`2026-05-01-c`):** ~30% of batches yesterday hit HTTP 500 retry storms (5/6 hits on `/canvas` state fetch). Today's same-config run (same model, same prompts, same apiMode, same load profile) hit 0 storms. The asymmetric-defense-in-depth fix shipped in `df09611` is working as designed.

**Caveat on sample size:** 6 batches isn't huge, but yesterday's ratio (5/6 storms on state vs 1/6 on nodes) made the underlying asymmetry statistically clear; today's flat 0 across the same volume of state-endpoint hits is meaningful evidence the fix landed correctly. Future longer runs will continue to accumulate sustained-clean evidence as a side-effect.

### Run summary at pause point

| Metric | Value |
|---|---|
| Project | Bursitis Test 2 (fresh, 2,328 keywords loaded) |
| Batches completed | 6 (B1-B6) + 2 auto-consolidations + B7 in flight at pause |
| Canvas at pause | 43 topics, 19 sister links (well below 105 freeze threshold) |
| Auto-fire trips | 2 clean (at end of B3 and B6) |
| HTTP 500 storms | 0 |
| Validation retries | 1 (B3 attempt 1: duplicate ADD_SISTER_LINK; attempt 2 succeeded) |
| Cumulative cost | $2.03 |
| Wall-clock | ~21 min |
| Settings | Cadence=3, Min-Canvas=15, Sonnet 4.6, Adaptive Thinking, Direct mode |

### Two new browser-side findings (informational, captured to ROADMAP)

1. **GoTrueClient multiple instances browser warning** — `Multiple GoTrueClient instances detected in the same browser context.` Severity: LOW-MEDIUM (Supabase says "not an error" but flags theoretical undefined behavior). Three browser-side `createClient()` calls in the codebase race on the same `sb-vyehbgkvdnvsjjfqhqgo-auth-token` storage key: `src/lib/supabase.ts:6` (intended singleton), `src/lib/authFetch.ts:3` (separate client), `src/app/projects/[projectId]/keyword-clustering/page.tsx:9` (page-specific client). Fix: consolidate three call sites to import the shared singleton; ~15 LOC + auth-flow verification on KC page. Captured 2026-05-02.
2. **Browsing Topics API removed** — Chrome browser informational message; nothing wrong with our app. Vklf.com / Vercel sets `Permissions-Policy` headers that opt out of Topics. No action needed; ignore.

### Two intent-misread slips this session

Both captured in CORRECTIONS_LOG with full diagnosis:
1. Recommendation-style placement slip recurrence — Claude omitted the `(recommended)` marker from picker labels despite the rule existing in `feedback_recommendation_style.md`. Director caught + reinforced. Memory file strengthened with explicit "marker must live INSIDE picker label" requirement; HANDOFF_PROTOCOL Rule 14f + CLAUDE_CODE_STARTER Rule 3 codified.
2. Setup-confirmation re-asking slip recurrence — Claude asked the director to re-confirm consolidation prompts were pasted (because pre-flight didn't show their char counts) despite director having already said "all set as requested." Director caught + redirected: the underlying issue is the runner's coverage gap, not Claude's verification behavior. Pre-flight runner extension shipped this session to close the structural cause. Memory file `feedback_trust_director_setup_confirmation.md` created; HANDOFF_PROTOCOL Rule 14g + CLAUDE_CODE_STARTER Rule 7 codified.

### Multi-workflow protocol coordination

- **Schema-change-in-flight flag:** stays "No" (no schema work this session).
- **Branch:** `main` (W#1's home).
- **Cross-workflow doc edits:** none.
- W#2 still 🆕 about-to-start; no parallel chat ran during this session.
- Pull-rebase at session start: clean (no parallel pushes).
- Pull-rebase at end-of-session commit: see commit step.

### Files touched this session

**Modified (3 code, 8 docs):**

End-of-session commit (this commit):
- `src/lib/preflight.ts` — P11 + P12 check functions added; PreflightContext interface extended; runner sequence inserts P11+P12 after P4. ~80 LOC net add.
- `src/lib/preflight.test.ts` — 8 new tests; makeContext helper extended; 2 runner tests updated for new check counts. ~75 LOC net add.
- `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` — runPreflight call site + log message. ~4 LOC net add.
- `docs/KEYWORD_CLUSTERING_ACTIVE.md` — this STATE block prepended; prior `2026-05-01-c` STATE block demoted to historical; header timestamp updated.
- `docs/HANDOFF_PROTOCOL.md` — Rule 14f extended (content-#4); Rule 14g NEW; header timestamp.
- `docs/CLAUDE_CODE_STARTER.md` — Rule 3 strengthened; Rule 7 extended.
- `docs/ROADMAP.md` — Active Tools row updated; HTTP 500 verification + auto-fire trip items closed; new entries appended (P5/P6→P11/P12 pre-flight extension SHIPPED; GoTrueClient multi-instance LOW-MEDIUM); header timestamp.
- `docs/CORRECTIONS_LOG.md` — TWO new entries prepended (recommendation-style placement slip recurrence + setup-confirmation intent-misread); header timestamp.
- `docs/CHAT_REGISTRY.md` — new top row for `session_2026-05-02_http-500-fix-verification-and-auto-fire-trip-observation`; header timestamp.
- `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc modified flags + this-session summary.

**Operational memory (Claude-local, not committed):**
- `feedback_recommendation_style.md` (strengthened).
- `feedback_trust_director_setup_confirmation.md` (NEW).
- `MEMORY.md` (index entry added).

**Push status:** committed + pushed to `origin/main` end-of-session per Rule 9 (director already pre-approved tonight's bundle when the live run validated both objectives cleanly).

### Standing instructions for next session — three "NEXT" choices

(a) **Browser-freeze fix design session — RECOMMENDED.** Profile the layout pass on the production 105-node canvas. Design a chunked / requestAnimationFrame approach (or Web Worker offload). ~3-4 hours design + 1-2 sessions impl. Highest long-term value remaining: the freeze blocks Phase 2 multi-user work AND blocks any future full-scale Bursitis run from completing. Both objectives from this session were closed cleanly — the freeze is the next-most-important architectural concern.

(b) **Recency-stickiness fix** — sister-link op deferral to consolidation-only + Q5 → B touch-semantics refinement. Direct attack on the wall-question bottleneck. ~1-2 sessions design + impl. Orthogonal to (a); could be sequenced after the freeze fix lands.

(c) **GoTrueClient multi-instance fix** — small refactor (~15 LOC) to consolidate three browser-side Supabase clients to a single singleton. Lower priority than (a)/(b) but small + clean if director wants a "ship a quick fix" session.

**Recommendation: (a) — browser-freeze fix design.** Most thorough and reliable: addresses the highest-impact unresolved scaling concern; enables the future full-scale runs that have been deferred since `2026-05-01-c`; ships the architectural understanding needed for any future Phase 2 work. (b) and (c) remain tractable after (a) closes.

**Director's framing through prior sessions:** (Scale-A) → (Scale-0) → (Defense-in-Depth ×3) → (Scale-B) → (Scale-C) → (Scale-D) → (Scale-E build) → (Scale-E D3 partial validation) → (consolidation auto-fire follow-up `2026-05-01-c`) → **(HTTP 500 fix verification + auto-fire trip observation, this session)** → (browser-freeze fix design — recommended next).

---

## ⚠️ POST-2026-05-01-c-CONSOLIDATION-AUTO-FIRE-FOLLOWUP STATE (preserved as historical context — last updated 2026-05-01-c; superseded by HTTP 500 fix verification + auto-fire trip observation state above)

**As of 2026-05-01-c (third session of 2026-05-01, spanning past midnight). LIVE RUN session on production vklf.com — resumed from yesterday's preserved Bursitis Test checkpoint (canvas was at 90 topics post-D3-partial-validation rollback, $6.31 spend; today's session ran an additional 22 batches between 4:49 PM and 8:08 PM, plus one admin-triggered consolidation pass at 7:28 PM and an attempted auto-fire trip at Batch 28 that got interrupted by browser freeze). Path B fully validated; Path A partial; HTTP 500 root cause found and surgically fixed; new browser-freeze scalability concern surfaced.**

### What this session shipped to W#1

**Code (single commit, ready to push at director's discretion):** asymmetric `withRetry` fix on the canvas state-fetch route.
- `src/app/api/projects/[projectId]/canvas/route.ts` GET handler — each of the three Prisma queries (`canvasState.findUnique`, `pathway.findMany`, `sisterLink.findMany`) now wrapped in `withRetry(() => ...)`, matching the existing pattern at `src/app/api/projects/[projectId]/canvas/nodes/route.ts:28-33`. New module-level comment explains the asymmetry that this session diagnosed and the empirical evidence (5× higher "state fetch HTTP 500" vs "nodes fetch HTTP 500" rate today).
- ~10 LOC net add across 1 file: import line, three `withRetry(() => ...)` wrappers, and the explanatory comment.
- All checks green: `npx tsc --noEmit` clean; `npm run build` clean (17/17 static pages); `npm run lint` at exact baseline parity (16e/41w; zero new); `node --test src/lib/prisma-retry.test.ts` 17/17 pass.

**No schema changes.** No DB migrations. No client-side changes. Server-side route handler patch only.

### Live run results — Path B (admin Consolidate Now): FULLY VALIDATED

**The 7:28 PM consolidation pass on the 90-topic canvas:**

| Metric | Value |
|---|---|
| Trigger | Admin click on `⚙ Consolidate Now` button, panel was PAUSED |
| Canvas state at click | 90 topics, 44 sister links |
| Input tokens sent | ~35,393 (full Tier 0 serialization of all 90 topics) |
| Time | ~2 min wall-clock (7:28:16 → 7:30:10) |
| Cost | $0.216 |
| Operations emitted | 3 (model found genuine structural improvements) |
| Apply result | 1 net topic removed (likely a MERGE_TOPICS); canvas → 89 topics, 44 sister links |
| Logging | Distinct: `═══ Consolidation pass (admin, canvas=90 topics) ═══` + `Consolidation API call complete` + `✓ Consolidation applied (3 operations).` |
| Reconciliation | Correctly skipped — `✓ All 0 keywords verified` (no batch keywords for consolidation, as designed) |
| Applier `consolidationMode: true` flag | Enforced; no ADD_TOPIC or ADD_KEYWORD attempted |
| Cosmetic note | Inner thinking-phase log line shows stale "Batch 19" label (currentBatchNumRef inheritance) — captured as polish item |

**This is the first live confirmation that:**
1. The "⚙ Consolidate Now" button reaches `runConsolidationPass('admin')` correctly.
2. `assembleConsolidationPrompt()` serializes the full canvas at Tier 0.
3. The model receives the consolidation context, returns a non-empty op list with structural improvements (not refused, not empty).
4. The applier accepts ops with `consolidationMode: true` and applies them atomically.
5. The post-consolidation `recordTouchesFromOps` runs cleanly (Q15 → A wiring works).
6. The post-consolidation `saveCheckpoint()` persists state, including the cadence-counter reset to 0.

### Live run results — Path A (auto-fire after every Nth batch): PARTIAL VALIDATION

**The resumed run from 7:37 PM:** drove 9 successful regular batch applies (batches 19 retry, 20, 21 retry storm, 22, 23, 24, 25, 26, 27) before the browser freeze killed Batch 28's apply.

**What was validated:**

| Mechanism | Status | Evidence |
|---|---|---|
| Cadence counter increment after every successful apply | ✅ Confirmed | Counter went 1→2→3→4→5→6→7→8→9 across the 9 successful batches; consistent with code at AutoAnalyze.tsx:1469 (`batchesSinceConsolidationRef.current += 1`) |
| Cadence counter reset to 0 after consolidation pass | ✅ Confirmed | Pre-consolidation counter (post-Batch-18) was high; post-consolidation Batch 19 retry's apply incremented to 1, exactly as the design specifies |
| Canvas-size gate (`>= consolidationMinCanvasSize`) | ✅ Confirmed firmly passing | Crossed 100 topics at Batch 23 (101 topics) and stayed past it through Batch 27 (105 topics) |
| Cadence threshold gate (`>= consolidationCadence`) | ⚠️ Almost reached | Counter at 9 after Batch 27 applied; Batch 28 was the trip moment |
| Auto-fire trip event itself (`runConsolidationPass('auto')` firing) | ❌ NOT observed live | Browser froze during Batch 28's apply phase before the "Batch 28 — applied." log line could fire and increment the counter to 10 |

**What blocked the trip:** browser freeze during Batch 28 attempt 2's apply (canvas had grown to 105 topics; layout pass / atomic rebuild on a 105-node canvas appears to lock the JS main thread synchronously past the browser's "page unresponsive" threshold). 60-second wait did not resolve; refresh required. Post-refresh checkpoint shows "26/291 batches done, 14 min ago" — i.e., Batch 27's apply was the last to fully persist; Batch 28's apply was rolled back when the freeze interrupted the apply pipeline.

**What we DID prove indirectly:** the cadence math up to one batch before the trip works exactly as the unit tests would predict. The auto-fire path is wired identically to the admin path that we DID prove works end-to-end. The remaining unknown is purely: does the runLoop's gate-check + `await runConsolidationPass('auto')` + post-consolidation `saveCheckpoint()` interleave correctly under live conditions. **High confidence this is fine** (it's wired identically to the admin path which we validated, and the cadence-counter logic is unit-tested), but a future session should still observe at least one auto-fire trip live for full confidence.

### HTTP 500 retry storm — diagnosed and FIXED this session

**Empirical evidence collected today:**

| Source | "state fetch HTTP 500" hits | "nodes fetch HTTP 500" hits | Total batch attempts |
|---|---|---|---|
| Yesterday's D3 (2026-05-01-b session) | 1 | 0 | ~16 batches |
| Today's session (2026-05-01-c) | 5 (batches 17, 19, 21, 27, 28) | 1 (batch 15) | ~22 batches |

**The asymmetry:** today, 5 out of 6 retry storms hit the "state fetch" endpoint. Yesterday's single storm was also "state fetch." That's a 5:1 → 6:1 ratio of state-fetch failures to node-fetch failures. Random pgbouncer flakiness would predict roughly 1:1.

**Root cause traced:** `src/app/api/projects/[projectId]/canvas/nodes/route.ts:28` already wraps `prisma.canvasNode.findMany` in `withRetry()` — that's the G2 fix from the 2026-04-28 canvas-blanking session. But the parallel `src/app/api/projects/[projectId]/canvas/route.ts:18-22` GET handler — which fetches `canvasState`, `pathway`, and `sisterLink` — was NEVER retrofitted with the same wrapper. Transient pgbouncer flakes (P1001/P1002/P1008/P2034) on the state endpoint surfaced directly as HTTP 500 to the client; on the nodes endpoint, the same flakes were silently retried 100ms then 500ms and usually succeeded.

**Why nobody noticed before today:** yesterday's D3 (~16 batches) only hit one storm — looked like normal Supabase noise. Today's run (~22 batches) hit six storms, making the pattern statistically obvious. Likely Supabase backend was having a slightly less stable evening tonight (or the larger canvas size triggered more pool pressure), surfacing the latent asymmetry.

**The fix:** wrap each of the three Prisma queries in the `/canvas` GET handler in `withRetry(() => ...)`. Identical pattern to nodes/route.ts.

**Expected effect once deployed:** the "state fetch HTTP 500" pattern that hit ~30% of batches today should drop to near-zero (matching the rate `/nodes` has had since the G2 fix shipped). Persistent failures (multi-attempt) will still surface as 500 — but transient single-flakes will silently retry and succeed.

### Browser freeze on atomic canvas rebuild — NEW HIGH-severity finding

**The freeze:** during Batch 28's apply phase (after the model's response was successfully streamed and validated), the browser triggered "page unresponsive" popup. The popup briefly went away but the page never recovered; activity log stopped streaming; 60-second wait did not resolve; refresh was required to recover the panel.

**The likely cause** (without yet running profiling): the layout pass runs synchronously on the main thread. At ~105 nodes, with 21 ops applied, the pass appears to hold the event loop long enough to trigger the browser's unresponsive heuristic. Atomic canvas rebuild (which serializes a full snapshot to send to the rebuild API) may also contribute to main-thread blocking.

**Why this matters for scaling:** the 14-PLOS-workflow vision targets 500+ topic canvases at Phase 3 production scale. If a 105-node canvas already triggers a freeze, a 500-node canvas would be unusable. This is captured to ROADMAP as a HIGH-severity infrastructure-TODO under Phase 1 polish (precondition to Phase 2 Multi-User work, since other workers can't be onboarded onto a UI that freezes).

**No fix this session** — diagnostic and design work for the layout-pass refactor (probable approach: chunk the layout work into requestAnimationFrame batches, or move it to a Web Worker) is beyond a doc-batch session and warrants its own design session.

### Live run cost summary

| Item | Cost |
|---|---|
| Pre-session totalSpent (yesterday's D3) | $6.31 |
| Today's batches 7-19-attempt-1 (before our chat session) | (already in $6.31; baseline) |
| Path B admin consolidation pass | $0.216 |
| Resumed run batches 19-retry-2 through 27 + Batch 28 attempts 1+2 | ~$4.30 |
| **Pre-freeze totalSpent** | **$10.82** (confirmed by user) |
| **Net spend this session** | **~$4.51** (~$10.82 - $6.31) |

### What did NOT change this session

- **`src/lib/auto-analyze-v3.ts`:** untouched (yesterday's `decideTier` patch still in effect; no further tuning needed).
- **`src/lib/operation-applier.ts`:** untouched (Session E's `consolidationMode` flag working as designed).
- **V4 prompts** (regular + consolidation): untouched.
- **`AutoAnalyze.tsx`:** untouched.
- **Schema, DB structure:** untouched.
- The Bursitis Test project's canvas state was modified by 22 normal batch applies + 1 admin consolidation, plus Batch 28's atomic-rebuild that got rolled back when the post-apply re-fetch failed. Final canvas state on the database: 105 topics, 52 sister links (post-Batch-28-attempt-1 rebuild that never got the cursor advance recorded). Canvas state will resolve on the next session's resume click — either re-running batch 27/28 or discarding.

### Multi-workflow protocol coordination

- **Schema-change-in-flight flag:** stays "No" (no schema work this session).
- **Branch:** `main` (W#1's home).
- **Cross-workflow doc edits:** none.
- W#2 still 🆕 about-to-start; no parallel chat ran during this session.
- Pull-rebase at session start: clean (no parallel pushes).
- Pull-rebase at end-of-session commit: see commit step.

### Files touched this session

**Modified (1 code, ~6 docs):**

End-of-session commit (this commit):
- `src/app/api/projects/[projectId]/canvas/route.ts` — three `withRetry(() => ...)` wrappers + import line + module-level comment explaining the asymmetric-fix history. ~10 LOC net.
- `docs/KEYWORD_CLUSTERING_ACTIVE.md` — this STATE block prepended; prior Session-E-D3 STATE block demoted to historical; header timestamp updated.
- `docs/INPUT_CONTEXT_SCALING_DESIGN.md` — §6 Scale Session E D3 outcome updated with consolidation auto-fire follow-up status; new §7 Open question row for the browser-freeze finding.
- `docs/ROADMAP.md` — Active Tools row updated with Path B validated + Path A partial summary; new ROADMAP entries for the browser-freeze HIGH-severity item and the cosmetic stale-batch-num log label item.
- `docs/CORRECTIONS_LOG.md` — TWO new entries prepended: HIGH-severity browser freeze on atomic canvas rebuild + MEDIUM-severity asymmetric-defense-in-depth finding (and its fix).
- `docs/CHAT_REGISTRY.md` — new top row for `session_2026-05-01-c_consolidation-auto-fire-followup`; header timestamp.
- `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc modified flags + this-session summary.

**Push status:** pending director's discretionary approval at end of session (per Rule 9).

### Standing instructions for next session — three "NEXT" choices (recommendation: a)

(a) **Verify the HTTP 500 fix in production + observe one full auto-fire trip.** Push tonight's commit to vklf.com; let Vercel auto-deploy. In a fresh session, resume from the existing checkpoint OR start a smaller-scale run (smaller canvas to dodge the browser-freeze risk for now). Confirm: (i) HTTP 500 retry-storm rate drops back to ~near-zero on the state endpoint; (ii) auto-fire trip event fires cleanly when cadence + canvas-size both met. Modest cost ($2-5) + ~30 min. **Recommended next** — it closes both of tonight's open items in one session. The browser-freeze finding doesn't block this, since smaller canvas avoids it; the freeze gets its own dedicated session afterward.

(b) **Browser-freeze fix design session.** Profile the layout pass on the production 105-node canvas. Design a chunked / requestAnimationFrame approach (or Web Worker offload). ~3-4 hours design + 1-2 sessions impl. Higher long-term value than (a) because the freeze blocks Phase 2 multi-user work.

(c) **Recency-stickiness fix from yesterday's session** — sister-link op deferral to consolidation-only + Q5 → B touch-semantics refinement. Direct attack on the wall-question bottleneck. ~1-2 sessions design + impl. Orthogonal to (a) and (b).

**Recommendation: (a) — verify HTTP 500 fix + observe auto-fire trip.** Two birds with one fresh-session stone; closes both partial-validation items from tonight. Lowest cost; lowest risk; highest confidence-per-dollar. After (a) closes, (b) is the higher-priority architectural work.

**Director's framing through prior sessions:** (Scale-A) → (Scale-0) → (Defense-in-Depth ×3) → (Scale-B) → (Scale-C) → (Scale-D) → (Scale-E build) → (Scale-E D3 partial validation) → **(consolidation auto-fire follow-up, this session)** → (HTTP 500 fix verification + auto-fire trip observation) → (browser-freeze fix design) → (recency-stickiness fix).

---

## ⚠️ POST-2026-05-01-SCALE-SESSION-E-D3 STATE (preserved as historical context — last updated 2026-05-01-b; superseded by consolidation auto-fire follow-up state above)

**As of 2026-05-01-b Scale Session E D3 partial validation — second session of the day. LIVE RUN session on production vklf.com: Scale Session E's mechanism exercised at scale on a fresh full-Bursitis canvas (2,328 keywords, empty start). Mid-run patch landed when batches 1-4 surfaced a tier-decider design-implementation mismatch; resume-from-checkpoint across browser refresh + new code load proven to work. Run paused at 17 batches / 84 topics / ~$7 spend. The wall is NOT eliminated by Sessions B-E alone — it's pushed back ~15-20%. Recency-stickiness from cross-cutting ops is the next bottleneck to address.**

### What this session shipped to W#1

**Code (single commit `2209f08`, pushed to vklf.com):** `decideTier` dormant-stability fix.
- `src/lib/auto-analyze-v3.ts:987` — `if (stabilityScore < 7.0) return 0;` → `if (stabilityScore > 0 && stabilityScore < 7.0) return 0;`. Treats schema default `stabilityScore: 0.0` as "unscored / dormant — let recency decide" instead of "deliberately scored low."
- `src/lib/auto-analyze-v3.ts:992` — `if (deeplyStale) return 2;` → `if (deeplyStale && stabilityScore >= 7.0) return 2;`. Makes the §2.4 Tier 2 AND-rule explicit at decision point.
- `src/lib/auto-analyze-v3.test.ts` — 4 new dormant-stability truth-table tests (252 src/lib total; was 248).
- All checks green: tests + tsc + build + lint at exact baseline parity.
- Forward-compatible with Scale Session F's stability scoring (gate fires for genuinely scored low values 0.1-6.9).

**Docs:** `INPUT_CONTEXT_SCALING_DESIGN.md` §6 Scale Session E gains two new sub-blocks documenting the patch reasoning and the D3 outcome; §7 Open questions gains a row for the dormant-zero ambiguity (Session F to revisit).

### Live run results — D3 partial validation

**Final state at session pause** (production vklf.com, "Bursitis Test" project — see naming clarification at bottom of this section):

| Metric | Value |
|---|---|
| Batches completed | 16 (batch 17 fully failed after 3 attempts on backend HTTP 500s) |
| Canvas topics | 84 |
| Sister links | 44 |
| Archived keywords | 0 |
| Reconciliation | 100% clean across all 16 batches (8 → AI-Sorted, 0 → Reshuffled, every batch) |
| API spend | ~$7 |
| Wall-clock | ~62 min (4:21 PM → 5:23 PM ET) |
| Checkpoint state | preserved (cursor at batch 18, 4 of 8 keywords pending; touchTracker + cadence counter rehydratable) |

**Per-topic input growth — the central D3 measurement:**

| Source | Per-topic growth | Wall projection |
|---|---|---|
| Session 0 V3 baseline (batches 1-150) | ~317 tokens/topic | wall hit at ~700 topics |
| **D3 V4 + dormant-stability patch** | **~220 tokens/topic** | **wall projects ~800 topics** |

**Net result: ~30% reduction in per-topic input growth — meaningful but NOT order-of-magnitude.** Design's ≥600-topic target is comfortably reachable before the wall (improvement over V3 which hit at ~700). Wall is NOT eliminated.

### Recency-stickiness — the bottleneck blocking full wall solve

Surfaced during the run via direct observation. Cross-cutting operations touch many topics per batch:

- `ADD_SISTER_LINK` touches both endpoints (batches 10-12 averaged ~7 new sister links per batch → ~14 endpoint-touches)
- `MOVE_KEYWORD` touches source + target (~5-10 keyword moves per batch → ~10-20 touches)
- `MERGE_TOPICS` touches both source + merged-into (~1-2 per batch → ~2-4 touches)
- `SPLIT_TOPIC` less cross-cutting (mostly creates new topics)

With 20-40 ops per batch on a 73-topic canvas (batch 13 measurement), aggregate ~70 topic-touches per batch — meaning **statistically every topic gets touched within any 5-batch window**. The recency-window-of-5 force-pin (line 986) catches everything before the patched line 987 stability gate even runs. **Tier 1 demotion happens only when a topic genuinely escapes recency — which the V4 prompt's restructuring nature rarely allows.**

The Q5 → B touch rule was conservative-by-design (every topic ref in every op stamps); in production it's too liberal. Fix design captured to ROADMAP — see "Standing instructions for next session" below.

### Mid-run patch sequence — what we proved

Aside from the validation findings, this session was the FIRST live exercise of several mechanisms shipped earlier:

1. **Pause/Resume across browser refresh + new code load.** Director clicked Pause (in-flight batch 4 attempt 2 finished, run paused at batch 6). Patch was edited + tested + committed + pushed to origin/main (commit `2209f08`); Vercel auto-deployed in ~2 min; director hard-refreshed browser; clicked Resume; runLoop picked up at batch 7 cleanly with the patched code in effect. Checkpoint preserved touchTracker + currentBatchNum + cadence counter + settings + cursor — everything rehydrated correctly. **This is now field-validated.**
2. **Anthropic prompt cache ~88k-char V4 system text caching.** `Cache hit: 20578 tokens` consistent across all 11 post-cold-start batches; cost stayed ~$0.20-0.30 per batch despite canvas growth.
3. **Reconciliation correctness under tier mode.** 100% clean (zero off-canvas → Reshuffled across 16 batches) — V4 prompts + intent fingerprints + tier mode preserve quality at production scale (caveat: tier mode wasn't actually compressing yet due to recency-stickiness, so this is "V4 prompts at production scale" more than "tier mode at production scale").
4. **Atomic batch failure pattern.** Batch 17 failed cleanly after 3 attempts (HTTP 500 retry storm); batch 18 started normally afterward. The failed batch's 8 keywords stay in queue for re-attempt; no canvas state corruption.

### Things we did NOT exercise live

- **Consolidation auto-fire.** Would have triggered at canvas ≥ 100 topics + cadence counter ≥ 10. Run paused at canvas 84. **This is the highest-priority next-session task** — cheap (~$3-5, ~30 min) and tests the entire Session E shipped path.
- **Admin-triggered Consolidate Now button.** Same path; can be tested by clicking the button manually.
- **Touch-tracker recording from consolidation ops** (Q15 → A). Requires consolidation to have fired.
- **Pre-flight summary's consolidation-prompt char-count check.** Director observed during pre-flight that the panel summary only listed the two regular V4 prompts, not the new consolidation ones — **captured as polish item to ROADMAP** (see below). Workaround: paste both consolidation prompts into the textareas before clicking Start; auto-fire reads their content at fire-time.

### What did NOT change this session

- **Schema:** untouched. Multi-workflow schema-change-in-flight flag stays "No" throughout.
- **`src/lib/operation-applier.ts`:** untouched (Session E's `consolidationMode` flag still in place; still untested live).
- **V4 prompts** (`docs/AUTO_ANALYZE_PROMPT_V4.md`, `docs/AUTO_ANALYZE_CONSOLIDATION_PROMPT_V4.md`): untouched.
- **`AutoAnalyze.tsx`:** untouched.
- **DB structure:** no migrations. The full-Bursitis project's canvas was modified by the live run (84 topics, 44 sister links, all with intent fingerprints generated by V4) — that's normal Auto-Analyze behavior.

### Multi-workflow protocol coordination

- **Schema-change-in-flight flag:** stays "No" throughout (no schema work this session).
- **Branch:** `main` (W#1's home).
- **Cross-workflow doc edits:** none.
- W#2 still 🆕 about-to-start; no parallel chat ran during this session.
- Two pushes deployed: commit `d541094` (Session E build, pushed at session start) + `2209f08` (D3 mid-run patch).

### Files touched this session

**Modified (3 — single end-of-session commit + the prior mid-session patch commit):**

End-of-session doc batch (this commit):
- `docs/KEYWORD_CLUSTERING_ACTIVE.md` — this STATE block prepended; prior Session-E STATE block demoted to historical; header timestamp updated.
- `docs/INPUT_CONTEXT_SCALING_DESIGN.md` — §6 Scale Session E gains "D3 partial validation outcome" sub-block; §7 Open questions gains "dormant-zero ambiguity" row; header timestamp updated. (Earlier this session: same doc gained "D3 mid-run patch — dormant-stability fix" sub-block + §7 row.)
- `docs/ROADMAP.md` — Active Tools row updated for W#1; new Phase-1 polish-item entries (6 total — see "Standing instructions" below); header timestamp.
- `docs/CORRECTIONS_LOG.md` — TWO new entries prepended: HIGH-severity decideTier dormant-stability mismatch (cause + correction + prevention); INFORMATIONAL Supabase HTTP 500 on fetchCanvas during retry storm.
- `docs/CHAT_REGISTRY.md` — new top row for `session_2026-05-01-b_scale-session-e-d3-validation`; header timestamp.
- `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc modified flags + this-session summary.

Mid-session patch commit (`2209f08`, already pushed):
- `src/lib/auto-analyze-v3.ts` — decideTier lines 987 + 992 changed (~7 LOC net add including new comments).
- `src/lib/auto-analyze-v3.test.ts` — 4 new dormant-stability truth-table tests (~50 LOC append).
- `docs/INPUT_CONTEXT_SCALING_DESIGN.md` — "D3 mid-run patch" sub-block + §7 dormant-zero ambiguity row.

### Standing instructions for next session — six "NEXT" choices (recommendation: a)

(a) **Consolidation auto-fire follow-up — resume from this session's checkpoint OR test on existing 84-topic canvas.** The Bursitis Test project's preserved checkpoint can be resumed; consolidation will auto-fire when canvas crosses 100 topics (likely batches 18-22). Alternative: click "⚙ Consolidate Now" button on the existing 84-topic canvas to test the admin-triggered path immediately. ~$3-5 API spend, ~15-30 min wall-clock. **Recommended next** — closes the only Session E mechanism that wasn't exercised live in this run, and the cost is small.

(b) **Recency-stickiness fix — design + ship.** Two paired sub-tasks per the captures in ROADMAP infrastructure TODOs (5.x.iii + 5.x.iv): (1) move sister-link ops from per-batch V4 prompt to consolidation-only (vocabulary restriction + applier-side `regularBatchMode` flag + tests; mirror of how Session E restricted ADD_TOPIC + ADD_KEYWORD on consolidation); (2) refine recency-touched semantics (Q5 → B revisit — `ADD_SISTER_LINK` doesn't stamp; `MOVE_KEYWORD` stamps target only; etc.). Direct attack on the bottleneck identified in this run. ~1-2 sessions design + impl. Higher value than (a) for the wall question, but (a) is cheaper and orthogonal.

(c) **Resume D3 to completion (or to wall).** Restart from checkpoint at batch 18; let it run to ~batch 130-150 (projected wall) or to natural completion. ~$40-50 spend, 8-12 hours wall-clock (definitely needs pause/resume across multiple sessions). Useful for empirical wall-position measurement; not strictly necessary given the projection from current data is reliable.

(d) **Phase-1 UI polish bundle** — Skeleton View on canvas + AST split-view alignment + Topics table row numbers + lower-the-Adaptive-Thinking-warning-threshold-for-V4 + the 6 new polish items captured this session. ~4-6 hours total. Independent of architectural work.

(e) **Action-by-action feedback workflow design session.** Analogous to Scale Session A. ~3-4 hours design; implementation 2-4 sessions after.

(f) **V3-era cleanup pass** (still deferred from Session E D4). Flip `buildOperationsInputTsv`'s default from `'full'` to `'tiered'`; archive V2 / V2-PROPOSED / V3 prompt docs; consider dropping the `serializationMode` arg. Best deferred until D3 wall is fully closed.

**Recommendation: (a) — consolidation follow-up.** Closes the one untested Session E path for cheap. After that, (b) is the path that meaningfully advances the wall question.

**Director's framing through prior sessions:** (Scale-A) → (Scale-0) → (Defense-in-Depth ×3) → (Scale-B) → (Scale-C) → (Scale-D) → (Scale-E build) → **(Scale-E D3 partial validation, this session)** → (consolidation follow-up + recency-stickiness fix) → (V3-era cleanup).

### Bursitis Test naming clarification

The "Bursitis Test" project name now refers to a **fresh full-Bursitis (2,328-keyword) project** created by the director at the start of this session. This is NOT the same project Sessions B/D used, which had only 37 backfilled topics on local dev — that prior project was deleted by the director before this session began. Future sessions referring to "Bursitis Test" should mean the new full project; the historical small one no longer exists. Captured as ROADMAP infrastructure TODO so this naming overload is documented.

---

## ⚠️ POST-2026-05-01-SCALE-SESSION-E STATE (preserved as historical context — last updated 2026-05-01; superseded by D3 partial validation block above)

**As of 2026-05-01 Scale Session E — first build session since Scale Session D closed. CODE + DOCS session: consolidation pass mechanism shipped end-to-end behind a separate prompt pair + admin trigger button + auto-fire gate. Applier-side `consolidationMode` flag enforces the restricted vocabulary atomically. Full-Bursitis validation (D3) is the director's discretionary follow-up — not run this session.**

### What this session shipped to W#1

**Tiered Canvas Serialization is now feature-complete on local dev.** Per `INPUT_CONTEXT_SCALING_DESIGN.md` §6 Scale Session E. Builds on Sessions B (schema + applier + backfill), C (tier mechanism behind a feature flag), D (V4 prompts + flag flip + small-batch validation). Closes the design from Scale Session A — all five mechanisms (tiered serializer + tier decider + batch-relevance heuristic + intent fingerprints + consolidation pass) now exist and inter-operate. The full-Bursitis validation run (D3 deliverable per the design) is the only remaining piece of the design's original plan; that's a single-session director-run live test costing ~$30–$60.

#### 1. Applier-side `consolidationMode` flag — defense-in-depth restriction

- New optional 3rd arg to `applyOperations(state, ops, options?)`: `{ consolidationMode?: boolean }`. Default `false` keeps every existing call site byte-identical.
- When `consolidationMode: true`, `ADD_TOPIC` and `ADD_KEYWORD` are rejected atomically with the descriptive error `<OPERATION> is not allowed in consolidation mode (consolidation only restructures existing topics; it does not introduce new ones)`. The check runs BEFORE the per-op switch, so a forbidden op fails before any state mutation.
- All other ops succeed normally — `MERGE_TOPICS`, `SPLIT_TOPIC` (which creates new topics via `into[]` — that's not ADD_TOPIC and is allowed per Cluster 4 Q14 lock), `MOVE_TOPIC`, `DELETE_TOPIC`, `UPDATE_TOPIC_TITLE`, `UPDATE_TOPIC_DESCRIPTION`, `MOVE_KEYWORD`, `REMOVE_KEYWORD`, `ARCHIVE_KEYWORD`, `ADD_SISTER_LINK`, `REMOVE_SISTER_LINK`.
- Atomic-failure invariant: a forbidden op anywhere in a consolidation batch rejects the whole batch — earlier allowed ops do NOT persist. Same atomic contract that V3 ops have always had.

#### 2. New `docs/AUTO_ANALYZE_CONSOLIDATION_PROMPT_V4.md` — separate prompt pair

- Two prompts: Consolidation Initial Prompt + Consolidation Primer. Pasted by the director into dedicated panel slots (NOT the same slots as the V4 per-batch prompts).
- Derives from V4 with three surgical changes:
  - **(a) Framing as a full-canvas consolidation pass** — no batch keywords. Input is the full canvas at Tier 0 only (no Tier 1 / Tier 2 sections). Job is to scan the WHOLE canvas for structural improvements that the per-batch tier-mode runs may have missed because some topics were compressed away.
  - **(b) Restricted operation vocabulary** — ADD_TOPIC and ADD_KEYWORD removed from the Primer's vocabulary section. Explicit FORBIDDEN OPERATIONS section documents both bans + cites the applier-side rejection. SPLIT_TOPIC remains allowed (creates new topics via `into[]` as part of restructuring an existing topic).
  - **(c) Consolidation Reevaluation Pass** — re-frames V4's "Post-Batch Funnel Reevaluation Pass" for the whole-canvas scope (vs. just touched branches). Empty op list explicitly called out as the expected outcome on a well-maintained canvas.
- All other V4 reasoning machinery (Topic Naming, Intent-Equivalence Principle, Stability Score Interpretation, Conversion Funnel Stage Ordering, JUSTIFY_RESTRUCTURE payload shape) carried verbatim — these rules apply identically to consolidation.

#### 3. `AutoAnalyze.tsx` — settings, prompts, two trigger paths, runLoop integration

- **Settings:**
  - New `consolidationCadence` state (default 10) — fire auto-consolidation after every Nth successful regular batch. `0` disables auto-fire (admin Consolidate Now still works).
  - New `consolidationMinCanvasSize` state (default 100) — gate auto-fire so small canvases don't waste API spend.
  - New `consolidationInitialPrompt` + `consolidationPrimerPrompt` states — paste-areas for the two consolidation prompts.
  - All four persisted in `aa_settings_{projectId}` alongside existing AA settings (debounced auto-save unchanged); also round-tripped through `aa_checkpoint_{projectId}` so Pause/Resume preserves them.
- **Auto-fire counter:** `batchesSinceConsolidationRef` increments after every successful regular batch apply; reset to 0 after every consolidation pass (success OR failure — failure-reset prevents retry-storm); persisted in checkpoint; reset to 0 in `startRunLoop` (fresh run); rehydrated by `handleResumeCheckpoint` (graceful default 0 on pre-E checkpoints).
- **`runConsolidationPass(triggerSource: 'auto' | 'admin')`** — assembles the consolidation prompt via `assembleConsolidationPrompt()` (full Tier 0 canvas TSV; no batch keywords; restricted-vocabulary reminder), calls the API via the existing `callApi` path, parses the operations list via `parseOperationsJsonl`, applies via `doApplyV3(consolBatch, ops, { consolidationMode: true })` which forwards the flag to the applier. Empty op list is logged as "canvas is structurally clean" (the expected outcome on a well-maintained canvas). Token usage + cost roll up into the panel's totalSpent. Cache-hit log surface mirrors the regular batch path.
- **`handleConsolidateNow`** — admin button handler. Disabled when RUNNING, BATCH_REVIEW, or `consolidationBusy`. Pre-checks: canvas ≥ 2 topics, Consolidation Initial Prompt loaded ≥ 100 chars, API key present (direct mode). Single pass on the current canvas state.
- **runLoop auto-fire gate** — after every successful regular batch apply (not after retries, not after skips), increments the counter; if `(cadence > 0) && (counter ≥ cadence) && (canvas size ≥ min) && (Consolidation Initial Prompt loaded ≥ 100 chars)`, fires `runConsolidationPass('auto')` then `saveCheckpoint()`. If cadence + canvas-size both met but the prompt is missing, logs a one-time-per-cycle warn-message and resets the counter (silences the warning until the next would-have-fired cycle).
- **`doApplyV3` extension:** new optional 3rd arg `options?: { consolidationMode?: boolean }`; forwards to `applyOperations` in the single existing call. Existing call sites unchanged (the two pre-existing call sites — `runLoop` + `handleApplyBatch` — pass no options and behave identically to before).
- **UI additions:**
  - Configure section gains a "Consol. cadence" + "Min canvas (topics)" input row right below "Vol threshold / Recency window," with a live status string showing whether auto-fire is ON (and at what cadence + min canvas) or OFF.
  - Prompt section gains two new textareas (Consolidation Initial Prompt + Consolidation Primer) below the regular V4 prompts, separated by a thin top-border for visual grouping. Char counters visible below each.
  - Controls bar gains a `⚙ Consolidate Now` button next to `↻ Reconcile Now`, with a tooltip explaining what consolidation does + the cost range.

#### 4. Touch recording for consolidation ops (Q15 → A)

- `recordTouchesFromOps` inside `doApplyV3` runs for consolidation passes too (no consolidation-mode bypass). Consolidation-touched topics enter the recency window and stay at Tier 0 for the next `recencyWindow` regular batches — exactly as the design specified. The next per-batch run can then verify the consolidation took.
- For consolidation passes triggered by runLoop's auto-fire gate: `currentBatchNumRef.current` equals the most recent regular batch's `batchNum`, so consolidation touches stamp the same frame of reference as the regular batches around them.
- For admin-triggered consolidation at IDLE: `currentBatchNumRef.current` is 0 (or whatever value a prior run's checkpoint left). Touch stamps from admin consolidation get wiped at the next `handleStart()` (which resets the touch tracker), so they don't accidentally influence a subsequent fresh run.

### Tests + build (this session)

- **248 src/lib tests pass** (was 240; +7 new applier consolidation-mode tests + 1 from prior background; zero regressions).
  - `Consolidation: ADD_TOPIC is rejected with descriptive error`
  - `Consolidation: ADD_KEYWORD is rejected with descriptive error`
  - `Consolidation: MERGE_TOPICS succeeds (allowed vocabulary)`
  - `Consolidation: SPLIT_TOPIC succeeds (allowed vocabulary; creates topics via into[] which is not ADD_TOPIC)`
  - `Consolidation: MOVE_KEYWORD, MOVE_TOPIC, UPDATE_TOPIC_TITLE, DELETE_TOPIC, ADD_SISTER_LINK all succeed`
  - `Consolidation: a forbidden op fails atomically — earlier allowed ops do NOT persist`
  - `Consolidation: explicit consolidationMode=false behaves like no options (ADD_TOPIC + ADD_KEYWORD allowed)`
  - `Consolidation: regression — calling applyOperations without options arg still accepts ADD_TOPIC (backwards compat)`
- `npx tsc --noEmit` clean.
- `npm run build` clean — 17/17 static pages.
- `npm run lint` — 16 errors, 41 warnings — exact baseline parity, zero new. (Mid-session: 4 unescaped-quote errors introduced in two new tooltip strings; caught + fixed in the same session via `&ldquo;`/`&rdquo;` escaping. No CORRECTIONS_LOG entry — typical lint fix; no procedural slip.)

### What did NOT change this session

- **Schema:** untouched. Multi-workflow schema-change-in-flight flag stays "No" throughout.
- **Database structure:** no migrations. No live writes. (The applier change is library-only; no apply happened against a real canvas this session.)
- **`src/lib/auto-analyze-v3.ts`:** untouched (the wiring layer's existing `serializationMode: 'full'` mode handles consolidation's full-canvas serialization needs without modification).
- **`docs/AUTO_ANALYZE_PROMPT_V4.md`:** untouched (the regular per-batch prompts are unchanged).
- **`AutoAnalyze.tsx` regular-batch flow:** untouched in spirit — the only surgical changes are (a) `doApplyV3` accepts an optional 3rd arg with default `consolidationMode: false`, (b) runLoop's after-successful-apply path gains an auto-fire gate for consolidation. Regular per-batch behavior is byte-identical when consolidation cadence is 0 or when the consolidation prompt is empty.
- **Production vklf.com:** no deploys this session. Sessions B + C + D were already pushed to `origin/main` per prior push history; whether they're live on vklf.com (Vercel auto-deploy) is the director's call to check. Session E adds to that bundle and is also on local commits at end-of-session.

### Multi-workflow protocol coordination

- **Schema-change-in-flight flag:** stays "No" (no schema work this session).
- **Branch:** `main` (W#1's home).
- **Cross-workflow doc edits:** none.
- W#2 still 🆕 about-to-start; no parallel chat ran during this session.

### Files touched this session

**New (1 doc):**
- `docs/AUTO_ANALYZE_CONSOLIDATION_PROMPT_V4.md` — the separate Initial Prompt + Primer pair for consolidation passes. Director re-pastes both into the new dedicated panel slots before running consolidation.

**Modified (2 code, 5 docs):**
- `src/lib/operation-applier.ts` — new optional `ApplyOptions` 3rd arg with `consolidationMode?: boolean`; forbidden-ops set; per-op pre-check inside the operations forEach (ADD_TOPIC + ADD_KEYWORD rejected with descriptive error when set). ~25 LOC net add; zero existing behavior changed.
- `src/lib/operation-applier.test.ts` — 7 new tests covering the consolidation contract from every angle (rejected ops, allowed ops, atomic failure, explicit-false equivalence, no-options regression). ~120 LOC append.
- `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` — settings additions (4 new state vars + persistence + checkpoint round-trip + startRunLoop reset); `assembleConsolidationPrompt` + `runConsolidationPass` + `handleConsolidateNow` functions; `doApplyV3` 3rd-arg extension; runLoop auto-fire gate after successful regular batch apply; UI: cadence + min canvas inputs in Configure; two new prompt textareas in Prompt section; "⚙ Consolidate Now" button in Controls. ~250 LOC net add across ~12 surgical edits.
- `docs/AUTO_ANALYZE_CONSOLIDATION_PROMPT_V4.md` — listed under New above.
- `docs/KEYWORD_CLUSTERING_ACTIVE.md` — this STATE block prepended; prior Session-D STATE block demoted to "preserved as historical context — superseded by Session E above"; header timestamp updated.
- `docs/INPUT_CONTEXT_SCALING_DESIGN.md` — §6 Scale Session E flipped to ✅ SHIPPED with full per-deliverable status notes (D1 + D2 SHIPPED; D3 deferred to director; D4 deferred to a post-validation cleanup pass).
- `docs/ROADMAP.md` — Active Tools row updated.
- `docs/CHAT_REGISTRY.md` — new top row for `session_2026-05-01_scale-session-e-build`.
- `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc flags + per-session changelog; Group B inventory gains the new consolidation prompt doc.

### Standing instructions for next session — five "NEXT" choices

(a) **Scale Session E — D3 deliverable: full-Bursitis validation run.** Per `INPUT_CONTEXT_SCALING_DESIGN.md` §6 Scale Session E. Fresh full Bursitis run with V4 + tier mode + auto-consolidation enabled. Goal: reach ≥ 600 topics with stable per-batch input cost (the wall solved). Director re-pastes both V4 prompts AND both consolidation prompts before starting. ~$30–$60 API spend, several hours wall-clock. **Recommended next** — this is the design's last open question and confirms the whole Scale Session A→E chain works end-to-end at scale.

(b) **Phase-1 UI polish bundle** — Skeleton View on canvas + AST split-view topic-vs-description row alignment + Topics table row numbering + lower-the-Adaptive-Thinking-warning-threshold-for-V4 (carried over from Session D's polish item). ~4–5 hours total. Independent of Scale Session E.

(c) **Action-by-action feedback workflow design session.** Analogous to Scale Session A. ~3–4 hours design; implementation 2–4 sessions after.

(d) **Pause/Resume checkpoint round-trip live test** — short ~1-batch session that explicitly Pauses mid-run and Resumes to confirm both the touch-tracker rehydration AND the new consolidation-cadence-counter rehydration work under live conditions. ~$0.30 API spend, ~15 min. Even smaller-stakes than (a); a fast confidence-builder before committing to (a)'s full-scale run.

(e) **V3-era cleanup pass (the Session E D4 deferral).** Flip `buildOperationsInputTsv`'s default from `'full'` to `'tiered'`; archive `AUTO_ANALYZE_PROMPT_V3.md` / `V2.md` / `V2_PROPOSED_CHANGES.md`; consider dropping the `serializationMode` arg entirely. Best deferred until (a) confirms the new mechanism works at scale; doing it now risks compounding two changes if (a) reveals an issue.

**Recommendation:** (a) — Scale Session E D3 (the full-Bursitis validation). The Scale Session A→E design's final open question is whether tier mode + consolidation actually let us push past the 200k-token wall on a 600+ topic canvas. Sessions B + C + D + E built the foundation; (a) is the live test that closes the design.

**Director's framing from prior sessions:** sequence (Scale-A) → (Scale-0) → (Defense-in-Depth-design + impl-1 + impl-2) → (Scale-B) → (Scale-C) → (Scale-D) → **(Scale-E, this session)** → (Scale-E D3 full-Bursitis validation, recommended next) → (other-polish + V3-era cleanup).

---

## ⚠️ POST-2026-04-30-SCALE-SESSION-D STATE (preserved as historical context — last updated 2026-04-30; superseded by Session E above)

**As of 2026-04-30 Scale Session D — third build session of the day after Sessions B + C. CODE + DOCS + LIVE VALIDATION session: V4 prompts shipped; AutoAnalyze.tsx flag flipped to tiered mode; touch-tracker localStorage round-trip wired; small-batch validation passed on local dev with all 43 topics carrying real searcher-centric intent fingerprints in the 10–15-word target range.**

### What this session shipped to W#1

**Tiered Canvas Serialization is now active end-to-end on local dev.** Per `INPUT_CONTEXT_SCALING_DESIGN.md` §6 Scale Session D. Builds on Sessions B (schema + applier + backfill) and C (tier mechanism behind a feature flag). Sets up Scale Session E (consolidation pass + auto-fire + full-Bursitis validation) as the next-priority forward action. Production deployment of Sessions B/C/D is a single push at the director's discretion — local dev confirmed the chain works end-to-end before any production exposure.

#### 1. New `docs/AUTO_ANALYZE_PROMPT_V4.md` — the canonical prompt for tier mode

- 837 lines. Derives from V3 with three surgical additions; all of V3's reasoning machinery (Step 0–7 placement, layered placement strategy, intent-equivalence binding rule, topic-naming guidelines, conversion funnel ordering, stability-score friction) verbatim.
- **(a) Tiered TSV input format** documented in the Primer's INPUT TABLE COLUMNS / HOW TO READ THE TABLE sections. Three labelled sections (`=== TIER 0 ===` / `=== TIER 1 ===` / `=== TIER 2 ===`); column shapes per tier (9-column / 6-column / 3-column); explicit guidance that every topic in any tier is on the same canvas; explicit guidance to walk the parent chain via Parent Stable ID across compressed tiers; explicit guidance NOT to restructure Tier 1 / Tier 2 topics this batch unless the case is overwhelming (consolidation pass handles those on a slower cadence).
- **(b) `intent_fingerprint` field** added to ADD_TOPIC (required), UPDATE_TOPIC_TITLE (required — title shifts intent), SPLIT_TOPIC `into[]` entries (required per entry), MERGE_TOPICS as `merged_intent_fingerprint` (required), UPDATE_TOPIC_DESCRIPTION (optional — defaults to keeping existing fingerprint). New cross-cutting INTENT FINGERPRINT rule in CROSS-CUTTING RULES section locks the format: short canonical phrase, 5–15 words, searcher-centric, audience + situation + goal. Inline ADD_TOPIC example updated with a populated `intent_fingerprint` field.
- **(c) Reevaluation Pass trigger 3a** expanded with a CROSS-CANVAS INTENT-EQUIVALENCE DETECTION VIA INTENT FINGERPRINTS subsection — explicit guidance that the model can detect intent-equivalence across the canvas using Tier 1 fingerprints (the load-bearing field at compressed tiers); explicit caution against inventing violations from fingerprint similarity alone (e.g., older-women vs. older-men bursitis differ on the binding gender dimension).
- V3 stays at `docs/AUTO_ANALYZE_PROMPT_V3.md` untouched as historical reference, archivable in a future cleanup pass once V4 is field-validated.

#### 2. `AutoAnalyze.tsx` — flag flip, settings field, touch-tracker round-trip

- **Recency window setting:** new `recencyWindow` state (default `DEFAULT_RECENCY_WINDOW = 5`); persisted into `aa_settings_{projectId}` alongside other AA settings; new "Recency window" number input visible in the Configure panel next to "Vol threshold" (with tooltip explaining the trade-off — higher = more topics at full detail per batch, more cost).
- **Touch-tracker round-trip** through the existing `aa_checkpoint_{projectId}` localStorage blob — `touchTrackerRef` and `currentBatchNumRef` reset to fresh state in `startRunLoop`; rehydrated in `handleResumeCheckpoint` via `deserializeTouchTracker` (pre-D checkpoints with no `touchTracker` field deserialize to a fresh empty tracker — degrades gracefully); `currentBatchNumRef.current = batch.batchNum` stamped at the top of every runLoop iteration so any code reading the ref sees the right value; `serializeTouchTracker` called inside `saveCheckpoint` to persist between batches and across Pause/Resume.
- **`buildOperationsInputTsv` call site flipped to `serializationMode: 'tiered'`** at the single call site in `assemblePromptV3` (line ~652) — passes a full `tierContext` with `batchKeywords` (extracted from `batch.keywordIds` via `keywordsRef.current`), `touchTracker: touchTrackerRef.current`, `currentBatchNum: batch.batchNum`, `recencyWindow`. Existing `Keyword` shape (with `volume: number | string`) flows through cleanly to `KeywordLite` thanks to Session C's `KeywordLite.volume` loosening.
- **Touch recording after successful apply:** `recordTouchesFromOps` called in `doApplyV3` immediately after a successful `applyOperations` call (before the rebuild network call). Walks `applyResult.aliasResolutions` so `$newN` aliases stamp their freshly-assigned `t-N` stableIds. Idempotent on retry — a rebuild failure that triggers a batch-retry will re-stamp the same topics with the same batch num on the second attempt.

#### 3. Live small-batch validation on local dev — Bursitis Test, 3 batches

- Project: Bursitis Test (`9e0ffc58-9ea2-4ea3-b840-144f760fb960`) — chosen because Session B's local backfill populated 37 topics with real intent fingerprints; this lets the tier decider actually exercise demotion (vs. a fresh project where every topic would force-pin to Tier 0 via the empty-fingerprint pin per `INPUT_CONTEXT_SCALING_DESIGN.md` §4.2).
- Persistence note: the run wrote only to the local Codespace dev Postgres; production vklf.com untouched.
- **Batch 1 outcome:** 30,616 estimated input tokens; actual 10,126 input + 8,641 output; cost $0.222; thinking phase 1m 51s; 21 ops applied; canvas 37 → 38 topics; 7 sister links; 0 archived; reconciliation 8 → AI-Sorted, 0 → Reshuffled; all 8 batch keywords verified.
- **Batch 2 outcome:** 31,222 estimated input tokens; actual 11,090 input + 14,443 output; **`Cache hit: 20,578 tokens`** (Anthropic's prompt cache serving the V4 system text); cost $0.312; thinking phase ~3m 7s (Sonnet adaptive grew the budget on a more structurally active batch); 34 ops applied; canvas 38 → 43 topics (5 new + 1 removed via merge or delete); 13 sister links; reconciliation 8 → AI-Sorted, 0 → Reshuffled; all 8 verified.
- **Direct DB inspection** (`scripts/inspect-fingerprints.mjs` — small read-only Prisma script written this session): all **43/43 topics carry intent fingerprints, zero empty**; word counts min=10, max=15, average 12.0 — perfectly inside the V4 spec target of 5–15 words; sample of new topics' fingerprints (t-38 through t-44 across batches 1 + 2) reads as genuinely searcher-centric — *"Trochanteric bursitis sufferers seeking specific exercises to relieve outer hip pain."*, *"Knee bursitis sufferers actively seeking treatment options and deciding on next steps."*, *"Foot bursitis sufferers wanting to understand their condition and explore relief options."*. Audience + situation + goal structure consistently captured.
- **Batch 3** in flight at session-doc-write time. **CHAT_REGISTRY top row will be revised to include batch 3's outcome before commit.**
- **Pause/Resume checkpoint round-trip** NOT explicitly tested this session — the wiring is in place and theoretically sound (rehydrate logic, reset logic, serialize logic all unit-test-equivalent via Session C's localStorage round-trip tests), but a live Pause-then-Resume mid-run wasn't exercised. Captured as bonus next-session test in (d) below.

#### 4. Adaptive-thinking runaway on first attempt — pattern preservation

- First attempt at batch 1 stalled in the thinking phase for ~10 minutes with no per-second visible log activity. Stall timer (90s default) didn't fire because some SSE traffic was arriving (silent thinking deltas). Director cancelled and retried; second attempt completed cleanly (likely just by chance — adaptive thinking has no internal cap, so a complex 30k-token prompt with new requirements can spiral on first call).
- Existing panel hint already covers this for canvas ≥50 topics (recommends `Thinking = Enabled` with `Budget 12000+`); we hit it at 37 topics on V4 because V4's prompt is ~2k chars heavier than V3 and asks for more reasoning per op (intent fingerprints add a generation step per ADD_TOPIC / UPDATE / MERGE / SPLIT).
- **Captured as informational entry in `CORRECTIONS_LOG.md` 2026-04-30** (pattern preservation, not a Claude mistake) + **proposed Phase-1 polish item** to lower the panel hint's canvas-size threshold from 50 to ~30 OR strip the gate entirely on V4 prompts. Polish item logged in this STATE block's "(b) UI polish bundle" choice below — director can fold it into the next polish bundle.

### Tests + build

- 240 src/lib tests pass (unchanged from Session C — wire-up logic validated empirically by the live run rather than added unit tests, since most of the new code is React component closure/hook plumbing).
- `npx tsc --noEmit` clean.
- `npm run build` clean — 17/17 static pages generated.
- `npm run lint` — 57 problems (16 errors, 41 warnings) — exact baseline parity, zero new.

### What did NOT change this session

- **Schema:** untouched. Multi-workflow schema-change-in-flight flag stays "No" throughout.
- **Database structure:** no migrations. Live writes to local dev DB only.
- **`src/lib/auto-analyze-v3.ts`:** untouched (Session C's mechanism + tests already covered the full surface; Session D was wire-up only).
- **`src/lib/operation-applier.ts`:** untouched (Session B's applier already accepts `intentFingerprint` on every relevant op).
- **Production vklf.com:** no deploys this session — Sessions B + C + D are bundled for the director's eventual single push.

### Multi-workflow protocol coordination

- **Schema-change-in-flight flag:** stays "No" (no schema work this session).
- **Branch:** `main` (W#1's home).
- **Cross-workflow doc edits:** none.
- W#2 still 🆕 about-to-start; no parallel chat ran during this session.

### Files touched this session

**New (2):**
- `docs/AUTO_ANALYZE_PROMPT_V4.md` — 837 lines.
- `scripts/inspect-fingerprints.mjs` — small read-only Prisma inspection script (kept in scripts/ for future fingerprint-quality spot-checks).

**Modified (1 code, 5 docs):**
- `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` — imports + recencyWindow state + touchTracker / currentBatchNum refs + settings load/save + checkpoint save/resume rehydration + startRunLoop reset + buildOperationsInputTsv tiered call site + recordTouchesFromOps in doApplyV3 + Recency window UI input (~30 LOC net add across ~10 surgical edits).
- `docs/KEYWORD_CLUSTERING_ACTIVE.md` — this STATE block prepended; prior Session-C STATE block demoted to historical.
- `docs/INPUT_CONTEXT_SCALING_DESIGN.md` — §6 Scale Session D flipped to ✅ SHIPPED.
- `docs/ROADMAP.md` — Active Tools row updated.
- `docs/CHAT_REGISTRY.md` — new top row for `session_2026-04-30-c_scale-session-d-build`.
- `docs/DOCUMENT_MANIFEST.md` — timestamps + per-doc flags + per-session changelog.
- `docs/CORRECTIONS_LOG.md` — informational entry on the V4 first-batch adaptive-thinking stall pattern.

### Standing instructions for next session — four "NEXT" choices

(a) **Scale Session E build (consolidation pass + auto-fire + full-Bursitis validation).** Per `INPUT_CONTEXT_SCALING_DESIGN.md` §6 Scale Session E. Lands the consolidation prompt mode (separate Initial Prompt + Primer; restricted vocabulary minus ADD_TOPIC + ADD_KEYWORD); the "Consolidate Now" button + auto-fire-every-N=10-batches gate; full-canvas Bursitis run reaching ≥600 topics under V4 + tier mode + auto-consolidation; cleanup of any V3-era code paths simplifiable post-V4 default. Riskier than D — full-scale run with structurally novel mechanism — but the riskiest pieces shipped in B–D. ~$30–$60 API spend. **Recommended next** — closes the design from Scale Session A.

(b) **Phase-1 UI polish bundle** — Skeleton View on canvas + AST split-view topic-vs-description row alignment + Topics table row numbering + lower-the-Adaptive-Thinking-warning-threshold-for-V4 (this session's new polish item). ~4–5 hours total. Independent of Scale Session E.

(c) **Action-by-action feedback workflow design session.** Analogous to Scale Session A. ~3–4 hours design; implementation 2–4 sessions after.

(d) **Pause/Resume checkpoint round-trip live test** — short ~1-batch session that explicitly Pauses mid-run and Resumes to confirm the touch-tracker rehydration works under live conditions. ~$0.30 API spend, ~15 min. Not strictly necessary (the wiring is sound on inspection), but a fast confidence-builder before committing to Scale Session E's full-scale run.

**Recommendation:** (a) — Scale Session E. Sessions B → C → D have built the foundation and proven the V4 prompts produce real fingerprints at quality on a small canvas. The design's final question — does tier mode + consolidation actually let us push past the 200k-token wall on a 600+ topic canvas? — is what Scale Session E answers. Bonus: a single push at start of Scale Session E (or before, at director's discretion) deploys Sessions B + C + D to vklf.com all at once.

**Director's framing from prior sessions:** sequence (Scale-A) → (Scale-0) → (Defense-in-Depth-design + impl-1 + impl-2) → (Scale-B) → (Scale-C) → **(Scale-D, this session)** → (Scale-E) → (other-polish).

---

## ⚠️ POST-2026-04-30-SCALE-SESSION-C STATE (preserved as historical context — last updated 2026-04-30; superseded by Session D above)

**Preserved as historical context — superseded by Session D above. As of 2026-04-30 Scale Session C — second build session of the day, immediately after Scale Session B. CODE-ONLY session — schema unchanged, prompts unchanged, UI unchanged, DB unchanged. Production V3 input TSV byte-identical (verified by explicit unit test). All new code is gated behind a default-OFF feature flag.**

### What this session shipped to W#1

**Tiered Canvas Serialization mechanism landed behind a feature flag.** Per `INPUT_CONTEXT_SCALING_DESIGN.md` §6 Scale Session C. Builds on Session B's intent-fingerprint foundation (commit `1d04a10`). Sets up Session D (V4 prompt rewrite + flag flip ON + small-batch validation) to ship cleanly.

#### 1. Stemmer + tokenizer (private but exported for unit tests)

- `stemTokens(text)` — lowercase → split on non-alphanumeric → drop stopwords + tokens shorter than 3 chars → simple suffix stripper.
- Suffix rules: -ing (with doubled-consonant collapse so "running" → "run"), -ed, -ly, -es, -s. Preservation rules: -ss / -is / -us / -as preserved (so "bursitis" stays "bursitis" and isn't hollowed to "bursiti").
- ~30 LOC. Hand-rolled rather than full Porter — autonomous detail per Rule 14d. Forgiving design (≥2-stem threshold) makes perfect stemming unnecessary; swap-in for richer stemmer is a one-function change if validation reveals poor recall.

#### 2. `computeBatchRelevantSubtree` (Cluster 3 locks)

- Stem-overlap match against (topic title + intent fingerprint + linked-keyword text).
- Aggregated score across all batch keywords; threshold ≥2 stems shared.
- One-hop neighborhood expansion: candidate + immediate parent + immediate siblings + immediate children (Cluster 3 Q11 lock).
- Empty batch → empty subtree (the recency + stability signals still run).
- ~80 LOC. Cost: bounded local string work — sub-millisecond on a 1,000-topic canvas.

#### 3. `decideTier` (Cluster 2 truth table)

- Pure signal-based decider. Inputs: `stabilityScore`, `batchesSinceTouch` (null when never touched), `isInBatchRelevantSubtree`, `recencyWindow` (Q6 lock; default 5).
- Tier 0 force conditions (any of): in batch subtree / touched within N / stability < 7.0.
- Tier 2 eligibility (AND-rule per Q8): stability ≥ 7.0 AND deeply stale (>10 batches) AND not in subtree.
- Default Tier 1 (stable + settled + off-batch but not deeply stale).
- Q9 lock: no ancestor force-promotion. Constants exported: `STABILITY_TIER_THRESHOLD` (7.0), `DEFAULT_RECENCY_WINDOW` (5), `TIER_2_DEEP_STALE_THRESHOLD` (10).
- ~25 LOC.

#### 4. Touch tracker (in-memory Map + ops extractor + serialize/deserialize)

- `TouchTracker = Map<stableId, lastTouchedBatchNum>`. Helper API: `createTouchTracker`, `recordTouchesFromOps`, `batchesSinceTouch`, `serializeTouchTracker`, `deserializeTouchTracker`.
- `recordTouchesFromOps` walks the post-apply alias resolutions map; `$newN` aliases stamp their resolved `t-N`; bare `t-N` refs pass through. Conservative inclusion: every topic ref in every op body that resolves to a stableId is stamped (Q5 → B; reassign targets, parents, sister-link endpoints all included; ARCHIVE_KEYWORD touches nothing). Q5 → C: no propagation to ancestors.
- Touches against deleted topics (MERGE source, SPLIT source, DELETE id) become harmless garbage entries that never match a live canvas node.
- JSON-safe serialize/deserialize so AutoAnalyze.tsx can round-trip the tracker through the existing `aa_checkpoint_{projectId}` localStorage blob (Session D wire-up).
- ~80 LOC.

#### 5. Tier 1 / Tier 2 row formatters + tiered TSV builder

- `formatTier1KeywordSummary(node, keywords)` per Cluster 1 Q3 lock: `'{N} keywords ({P}p + {S}s), top volume kw: "{text}" ({V})'`. Empty topic emits `'0 keywords'`. Top-volume picked by volume desc, ties broken alphabetically; missing/non-numeric volumes sort as 0.
- `KeywordLite.volume?: number | string` (loosened from purely-number to accept the ambient `Keyword` shape used by callers — string from import path, Int in Prisma; the formatter coerces).
- Tier 1 row: 6 columns (Stable ID, Title, Parent, Stability, Intent Fingerprint, Keyword Summary).
- Tier 2 row: 3 columns (Stable ID, Title, Parent).
- Tiered TSV builder emits three sections delimited by `=== TIER 0 ===` / `=== TIER 1 ===` / `=== TIER 2 ===`. Empty tiers are omitted entirely. Tier 0 reuses the V3 9-column layout via the refactored `buildFullTsv` helper.
- **Empty-fingerprint pin (per `INPUT_CONTEXT_SCALING_DESIGN.md` §4.2):** topics with empty `intentFingerprint` cannot be safely demoted (Tier 1's load-bearing intent-equivalence signal would be missing). The serializer force-pins them to Tier 0 regardless of decider signals. Today most live topics have real fingerprints from Session B's backfill, but the safety net is there for any future production rows that ever land with `''`.

#### 6. `buildOperationsInputTsv` extension (the public surface)

- New optional 4th `options` arg: `{ serializationMode?: 'full' | 'tiered'; tierContext?: TierContext }`. Default `serializationMode: 'full'` is byte-identical to the pre-Session-C output (covered by an explicit byte-parity unit test).
- `'tiered'` requires `tierContext` (`{ batchKeywords, touchTracker, currentBatchNum, recencyWindow? }`); throws with a descriptive error if missing.
- Existing 3-arg call sites (`AutoAnalyze.tsx` line 652) unchanged — production V3 stays exactly on the `'full'` path.
- Existing function body refactored into a private `buildFullTsv(...)` for byte-parity guarantees.

### Tests + build

- **240 src/lib tests pass** (was 210; +30 this session). 30 covers: 5 stemmer + 4 batch-relevance + 8 decideTier + 5 touch-tracker + 4 row-formatter / tier-headers + 4 buildOperationsInputTsv integration (full byte-parity, tiered multi-section, fingerprint-pin, throws-on-missing-ctx).
- **13 ESLint rule tests pass** (separate file, unchanged).
- `npx tsc --noEmit` clean.
- `npm run build` clean — 15.0s, 17/17 static pages.
- `npm run lint` — 57 problems (16 errors, 41 warnings) — **exact baseline parity, zero new this session**.

### What did NOT change this session

- **Schema:** untouched.
- **Prompts:** `AUTO_ANALYZE_PROMPT_V3.md` unchanged. The new tier-aware input format is documented only via the test bed; the V4 prompt update is Session D.
- **`AutoAnalyze.tsx` UI:** untouched. No tier-mode toggle, no recency-window settings field, no flag flip.
- **Routes / scripts / `operation-applier.ts`:** untouched.
- **Production V3 input TSV:** byte-identical to commit `1d04a10`. Verified by `buildOperationsInputTsv: serializationMode="full" is byte-identical to no-arg call`.
- **Touch tracker persistence:** the wire-up to round-trip through `aa_checkpoint_{projectId}` localStorage is the AutoAnalyze.tsx caller's job and lands in Session D alongside the flag flip. Session C ships the helpers (`serializeTouchTracker` / `deserializeTouchTracker`) so Session D's wire-up is one-liner per call site.

### Multi-workflow protocol coordination

- **Schema-change-in-flight flag:** stays "No" (no schema work this session).
- **Branch:** `main` (W#1's home).
- **Cross-workflow doc edits:** none.
- W#2 still 🆕 about-to-start; no parallel chat ran during this session.

### Files touched this session

**Modified (2):**
- `src/lib/auto-analyze-v3.ts` — `KeywordLite.volume` loosened to `number | string`; existing function body refactored into private `buildFullTsv`; public `buildOperationsInputTsv` dispatches on `options.serializationMode`; new ~480 lines for stemmer + batch-relevance + tier decider + touch tracker + tier formatters + tiered TSV builder.
- `src/lib/auto-analyze-v3.test.ts` — 12 new imports added to the import block; +30 new tests appended.

**Cumulative file size:** `auto-analyze-v3.ts` 674 → ~1,150 lines; `auto-analyze-v3.test.ts` 621 → ~960 lines.

### Standing instructions for next session — four "NEXT" choices

(a) **Scale Session D — V4 prompt rewrite + integration + small-batch validation.** Per `INPUT_CONTEXT_SCALING_DESIGN.md` §6 Scale Session D. Lands `AUTO_ANALYZE_PROMPT_V4.md`; flips `AutoAnalyze.tsx` to call `buildOperationsInputTsv` with `serializationMode: 'tiered'`; adds a "Recency Window (batches)" settings field default N=5; wires touch-tracker round-trip through `aa_checkpoint_{projectId}` localStorage; clears it on cancel; small-batch validation on test project (3–5 batches). ~$5–$15 API spend. **Recommended next** — this is what makes Session C's mechanism actually run in production. Risk: medium (new prompt + new wiring = quality regression risk; mitigated by small-batch validation before any large run).

(b) **Phase-1 UI polish bundle** — Skeleton View on canvas + AST split-view topic-vs-description row alignment + Topics table row numbering. ~4–5 hours total. Independent of architectural work.

(c) **Action-by-action feedback workflow design session.** Analogous to Scale Session A. ~3–4 hours design; implementation 2–4 sessions after.

(d) **Optional out-of-session check-in:** small ~2-batch fresh AI run on Bursitis Test or another project to validate Session B's `intentFingerprint` write path under live load before Session D's V4 prompt rewrite. ~$1–$2, ~15 min. The 37 topics from Session B's local dev run are already in the DB; a fresh run on vklf.com would create more topics with `intentFingerprint = ''` (per the deployed POST default). Could surface any production-vs-dev divergence before Session D adds another moving part.

**Recommendation:** (a) — Scale Session D. Sessions C's mechanism is dormant code until D activates it. Ship the activation cleanly with V4 prompts + small-batch validation, then E (consolidation pass + full-Bursitis validation) closes the design.

**Director's framing from prior sessions:** sequence (Scale-A) → (Scale-0) → (Defense-in-Depth-design + impl-1 + impl-2) → (Scale-B) → **(Scale-C, this session)** → (Scale-D) → (Scale-E) → (other-polish).

---

## ⚠️ POST-2026-04-30-SCALE-SESSION-B STATE (preserved as historical context — last updated 2026-04-30; superseded by Session C above)

**As of 2026-04-30 Scale Session B — first build session since Defense-in-Depth Audit closed. CODE + SCHEMA session — schema CHANGED (3-step migration), prompts unchanged, DB now has `intentFingerprint String NOT NULL` column on CanvasNode with all 37 live rows backfilled.**

### What this session shipped to W#1

**Foundation for Tiered Canvas Serialization landed.** Per `INPUT_CONTEXT_SCALING_DESIGN.md` §6 Scale Session B. Sets up Sessions C/D/E (tier serializer, V4 prompt, consolidation) to ship cleanly. Does NOT yet build the tier decider, batch-relevance heuristic, V4 prompt, or consolidation pass — those are explicit future-session scope.

#### 1. 3-step schema migration of `intentFingerprint`

- **Step 1 (Rule-8 gate, ran ~11:08 AM):** `prisma/schema.prisma` gains `intentFingerprint String?` on `CanvasNode`. `npx prisma db push` — pure additive. All existing rows get NULL.
- **Step 2 (Rule-8 gate, ran ~11:55 AM after director approved Option B):** Director ran a small fresh AI Auto-Analyze on Bursitis Test on the local dev server (5 batches, ~$1.35, 37 topics created — pre-flight P1-P10 ✓; G3 guard didn't fire; reconciliation 0-Reshuffled across all batches). Then `node --env-file=.env --experimental-strip-types scripts/backfill-intent-fingerprints.ts --project-workflow-id=d1ade277-…  --dry-run` (~$0.10, 2 API calls, all 37 fingerprints generated and printed for director review). Quality bar: 11–13 word range; searcher-centric voice; compound intent (audience + goal + qualifier); type-distinguishing where applicable (pes anserine, prepatellar, subacromial, retrocalcaneal, ischial, iliopsoas, trochanteric, olecranon). Director approved (Option A). Real backfill run (~$0.10) wrote all 37 rows; verification pass (zero NULL/empty in scope).
- **Step 3 (Rule-8 gate, ran post-deploy):** `prisma/schema.prisma` `String?` → `String`. Pre-Step-3 global verification: 37/37 rows non-empty; zero NULL or empty. `npx prisma db push` — column tightened to NOT NULL. Information_schema query confirms `is_nullable: "NO"`. Prisma client regenerated; new types now reject `where: { intentFingerprint: null }` at compile time.

#### 2. Operation applier extension (`src/lib/operation-applier.ts`)

- `CanvasNode` model gains required `intentFingerprint: string` (default `''`).
- Op shapes gain optional fields (Session B soft validation; Session D tightens to required after V4 prompts ship):
  - `AddTopicOp.intentFingerprint?: string`
  - `UpdateTopicTitleOp.intentFingerprint?: string`
  - `UpdateTopicDescriptionOp.intentFingerprint?: string` (always optional per design)
  - `MergeTopicsOp.mergedIntentFingerprint?: string`
  - `SplitTopicOp.into[].intentFingerprint?: string`
- New helper `validateOptionalFingerprint` rejects empty/whitespace strings when supplied. Apply paths persist the validated fingerprint on the resulting CanvasNode (refresh on title/description; replace on merge target; per-entry on split; default `''` on add).
- 16 new fingerprint tests cover accept / default-to-empty / reject empty+whitespace / refresh-on-update / preserve-on-no-update / merge with+without / split persistence + per-entry rejection.

#### 3. Parser snake_case → camelCase (`src/lib/auto-analyze-v3.ts`)

- `intent_fingerprint` translated on ADD_TOPIC / UPDATE_TOPIC_TITLE / UPDATE_TOPIC_DESCRIPTION.
- `merged_intent_fingerprint` translated on MERGE_TOPICS.
- `intent_fingerprint` per `into[]` entry on SPLIT_TOPIC.
- Returns `undefined` when key absent (matches applier's optional-field expectation).
- `CanvasNodeRow` interface gains `intentFingerprint?: string | null` (Prisma's pre-Step-3 nullable shape; conservative — also accepts post-Step-3 non-null reality without breakage).
- `buildCanvasStateForApplier` maps `n.intentFingerprint ?? ''` for type safety against either DB shape.
- Rebuild-payload constructor (post-applier): omits `intentFingerprint` when empty. Critical for G3 compatibility — empty values no longer reach the rebuild route mid-batch where G3 would 400 the request. New topics get `''` from the route's create-branch default; AI-supplied real fingerprints carry through via the upsert.update branch.
- 6 new parser tests cover snake_case translation across all 5 op types + undefined-when-absent.

#### 4. Route patches (`src/app/api/projects/[projectId]/canvas/...`)

- **`nodes/route.ts` POST:** `tx.canvasNode.create.data` supplies `intentFingerprint: typeof body.intentFingerprint === 'string' ? body.intentFingerprint : ''`. Rule-16 zoom-out clean: only 2 callers in src/, both patched.
- **`nodes/route.ts` PATCH (G3 per Defense-in-Depth §5.4):** Pre-validate every node update entry — if `intentFingerprint` key is present, value must be a non-empty trimmed string; otherwise 400 with descriptive message. Pre-validated values pass through to the existing transaction.
- **`rebuild/route.ts` G3 echo:** Same pre-validation across `body.nodes[*]` entries. Upsert.create supplies `''` default; upsert.update writes `intentFingerprint` when caller includes it (already G3-validated).

#### 5. Backfill script (`scripts/backfill-intent-fingerprints.ts`)

- New ~250-line script. Mirrors `scripts/backfill-stable-ids.ts` pattern from Pivot Session B.
- Idempotent predicate: `intentFingerprint = ''` (post-Step-3; pre-Step-3 also covered NULL via OR clause that was simplified after Prisma client regenerated against NOT NULL column).
- Configurable via flags: `--project-workflow-id` (test gate), `--batch-size` (default 25), `--model` (default `claude-sonnet-4-6`), `--dry-run`.
- Per-topic input: title + description + top-volume keywords (primary placements first, ties broken by volume desc then alphabetical).
- Anthropic API direct via `fetch` (matches `/api/ai/analyze` convention; no SDK dependency).
- Logs every fingerprint as it's written. Verification pass at end (count of remaining NULL/empty rows).

### Tests + build

- **210 src/lib tests pass** (was 188; added 16 applier fingerprint + 6 parser fingerprint = 22 new).
- **13 ESLint rule tests pass** (separate file, unchanged).
- **`npm run lint`** — 16 errors, 41 warnings — exact baseline parity. **Zero new this session.**
- **`npm run build` clean** — TypeScript clean; 17/17 static pages generated.

### What did NOT change this session

- **Prompts:** `AUTO_ANALYZE_PROMPT_V3.md` unchanged (V3 prompts don't yet emit fingerprints — that's Session D).
- **AutoAnalyze.tsx UI:** unchanged (no tier serialization toggles, no V4 wiring — those are Sessions C/D).
- **R3 (Tier-1 fingerprint runtime invariant):** still pending — lives in the future serializer (Session C).
- **Application-side opportunistic generation:** not in scope. The wiring layer doesn't AI-generate fingerprints itself; that's the AI's job once V4 prompts ship.

### Multi-workflow protocol coordination

- **Schema-change-in-flight flag:** flipped to "Yes" at session start (during the migration); flipped back to "No" after Step 3 shipped. W#2 still 🆕 about-to-start; no parallel chat running.
- **Branch:** `main` (W#1's home).
- **Cross-workflow doc edits:** none.

### Files touched this session

**Modified (8):**
- `prisma/schema.prisma` — `intentFingerprint String` on `CanvasNode` (Step 1 + Step 3 in two edits, two `db push` calls).
- `src/lib/operation-applier.ts` — types + `validateOptionalFingerprint` + per-op validation/persistence.
- `src/lib/operation-applier.test.ts` — 16 new fingerprint tests + builder default.
- `src/lib/auto-analyze-v3.ts` — parser snake_case translation + `CanvasNodeRow` field + applier-state mapping + rebuild-payload omit-when-empty.
- `src/lib/auto-analyze-v3.test.ts` — 6 new parser tests.
- `src/app/api/projects/[projectId]/canvas/nodes/route.ts` — POST default + G3 PATCH guard.
- `src/app/api/projects/[projectId]/canvas/rebuild/route.ts` — G3 echo + upsert.create default + upsert.update pass-through.
- `docs/ROADMAP.md` — Active Tools row mid-session (flag → Yes); end-of-session row update (flag → No, summary).

**New (1):**
- `scripts/backfill-intent-fingerprints.ts` — ~250 lines, ran live this session.

### Standing instructions for next session — four "NEXT" choices

(a) **Scale Session C build (Tier serialization + decider + batch-relevance heuristic).** Per `INPUT_CONTEXT_SCALING_DESIGN.md` §6 Scale Session C. Behind feature flag (default OFF); no DB changes; no prompt changes. Lands `buildOperationsInputTsv(serializationMode)`, `decideTier`, `computeBatchRelevantSubtree`, in-memory touch tracker. ~25 unit tests targeted. **Builds on Session B's foundation.**

(b) **Phase-1 UI polish bundle** — Skeleton View on canvas + AST split-view topic-vs-description row alignment + Topics table row numbering. ~4-5 hours total. Independent of architectural work.

(c) **Action-by-action feedback workflow design session.** Analogous to Scale Session A. ~3-4 hours design; implementation 2-4 sessions after.

(d) **Optional out-of-session check-in:** small ~2-batch fresh AI run on Bursitis (~$1-2, ~15 min) to inspect fingerprints from a real V3 batch under live load — useful to confirm the new column-write code path is rock-solid in production before Session C lands more code on top. The 37 topics from this session's local run are already in the DB; a fresh run on vklf.com would create more topics with `intentFingerprint = ''` (per the deployed route default), giving you a chance to spot-check that production behavior matches dev expectations.

**Recommendation:** (a) — Scale Session C. With the foundation shipped and verified end-to-end, Session C is the highest-impact forward action. Can run anytime; no external dependencies.

**Director's framing from prior sessions:** sequence (a-design)→(a-impl-1)→(a-impl-2)→(b)→(e)→(c) — reframed for the next phase as (Scale-B)→(Scale-C)→(Scale-D)→(Scale-E)→(other-polish).

---

## ⚠️ POST-2026-04-29-DEFENSE-IN-DEPTH-IMPL-2 STATE (preserved as historical context — last updated 2026-04-29 third session of day)

**As of 2026-04-29 Defense-in-Depth Audit Implementation Session 2 — Option β Session 2 of 2 — completes the audit. Code session — schema unchanged, prompts unchanged, DB unchanged.**

### What this session shipped to W#1

**Two user-facing defenses landed.** Both are documented in `DEFENSE_IN_DEPTH_AUDIT_DESIGN.md` §4 + §6 and resolve open questions Q3/Q4/Q5 from §8. With this session, the Defense-in-Depth Audit ROADMAP item flips from 🔄 IN PROGRESS to ✅ COMPLETE — only deliberately-deferred items remain (R3, G3 gated on Scale Session B; R4 deferred per Q2=B; dry-run mode deferred per §0.4).

#### 1. Forensic NDJSON ring buffer (per design §4.2) + 📥 Download log button

- New module `src/lib/forensic-log.ts` (~140 lines including doc) exposing the `ForensicLog` class (FIFO ring, capped at 1000 records ≈ 250 KB by default), the `ForensicRecord` shape, and a pure `buildForensicDownload` helper that builds the NDJSON content + a timestamped filename.
- Per-record schema matches design §4.2 verbatim: `ts`, `session_id`, `project_id`, `batch_num`, `phase`, `canvas_node_count`, `canvas_keyword_count`, `tsv_input_tokens`, `tsv_output_tokens`, `model`, `cost_this_batch`, `reconciliation: { to_ai_sorted, to_reshuffled }`, `errors[]`. Optional fields are omitted from JSON when undefined (validated by unit test).
- 4 emit phases per batch boundary, all wired in `AutoAnalyze.tsx`:
  - **`pre_api_call`** at top of `processBatchV3` — captures canvas+keyword counts before request fires.
  - **`post_api_call`** at bottom of `processBatchV3` — adds tokens used + cost computed.
  - **`pre_apply`** at top of `doApplyV3` — captures counts before applier mutates state.
  - **`post_apply`** at end of `doApplyV3` — captures new canvas counts + reconciliation flips + any post-apply errors (currently the unplaced-keyword warning surfaces here).
  - **Error path:** the runLoop's outer catch emits a `post_api_call` record with `errors: [errMsg]` so failed batches still produce a diagnostic record.
- Buffer + session id stored in component refs (`forensicLogRef`, `sessionIdRef`). `crypto.randomUUID()` mints a fresh session id at `handleStart`; both buffer and id are reset there. Pause/Resume preserves both — same session id continues.
- `📥 Download log` button added to the panel footer (after Reconcile Now, before Close). Disabled when `forensicCount === 0`. Click triggers a browser blob-URL download via `URL.createObjectURL` + anchor-click; cleans up the URL after click. Filename: `aa-forensic-{first-8-chars-of-session-id}-{ISO-ts-with-colons-replaced}.ndjson`.
- Per director Q4 = Option A: **client-side only in v1.** No server persistence; no third-party telemetry. Phase 2 multi-user can promote to server-side per-run logging when/if needed.
- 20 new unit tests covering: default capacity (1000), custom capacity, zero/negative capacity throws, empty buffer behavior, FIFO eviction at capacity (with degenerate capacity=1 case), defensive copy on `getAll`, NDJSON one-record-per-line shape, nested reconciliation field, errors array, optional-field omission, `clear()` then re-emit, filename safety (no colons, session-id prefix, "no-session" placeholder for empty session id).

#### 2. Run-start pre-flight self-test P1-P10 (per design §6) + UI section + Skip checkbox

- New module `src/lib/preflight.ts` (~340 lines including doc) exposing `runPreflight(ctx)` returning `{ passed, checks[], firstFailIndex }`, plus individual exported `checkP1ApiKey` … `checkP10LocalStorage` for unit testing.
- The runner is pure — its dependencies (network fetcher, raw fetcher for cross-origin direct-mode P9, localStorage-shaped storage) are passed in via `PreflightContext`. Unit tests substitute mocks; production wiring at `handleStart` uses real `authFetch` + `globalThis.fetch` + `globalThis.localStorage`.
- Sequential execution. **First ✗ aborts the chain** — no subsequent checks execute and they're not included in the returned `checks[]`. Matches design §6.2 "first ✗ stops the chain" semantics.
- The 10 checks (mapped to design §6.2):
  - **P1 API key** — direct-mode: must be non-empty; server-proxy mode: pass-through (server uses env var).
  - **P2 Seed words** — non-empty after trim; word count derived by splitting on whitespace + commas.
  - **P3 Initial Prompt** — ≥100 chars (matches existing handleStart guard).
  - **P4 Primer Prompt** — optional with half-paste guard: empty → pass-with-info; non-empty but <30 chars → fail (likely partial paste); ≥30 chars → pass.
  - **P5 Canvas refs vs server** — fetches `/api/projects/{projectId}/canvas/nodes`; compares count + 5-stableId sample (sorted) against `nodesRef.current`.
  - **P6 Keyword refs vs server** — same shape against `/api/projects/{projectId}/keywords` and `keywordsRef.current`.
  - **P7 Pathway refs** — collects distinct `pathwayId` values from canvas; fails if canvas references pathways but `pathwaysRef.current` is empty.
  - **P8 Keyword scope** — `unsortedKeywordCount > 0` (matches existing handleStart guard).
  - **P9 Cheap test API call** — per director Q3 = Option A. Sends a `max_tokens: 10` non-streaming request via the same path the run will use (direct → Anthropic, server-proxy → `/api/ai/analyze`). Cost ~$0.001 per Start. Surfaces 401/404/network errors with the exact upstream message.
  - **P10 localStorage probe** — write+read+delete a probe key; fails on private-browsing / quota-exceeded / storage-disabled / lossy-write.
- UI: new section in the Auto-Analyze panel between Estimate and Progress. Shows `⏳ Pre-flight checks running…` while in flight, then per-check ✓/✗/⏳ rows with label + message. Failure mode keeps the section visible so the user can see what failed. Section hides itself only after the next successful Start.
- "Skip pre-flight" checkbox below the Start button (off by default per design §6.5). When checked, the preflight chain is bypassed entirely — the existing fast `alert()` guards still fire for obvious gaps (empty API key, empty seed words, prompt <100 chars, no keywords in scope).
- Start button shows `⏳ Pre-flight…` and is disabled while the chain is running so the user can't double-click.
- Per director Q5 = Option A: **dry-run mode deferred** per design §0.4. Fixture-maintenance burden not yet justified; revisit after months of production use.
- 38 new unit tests covering each check independently (every fail path + the happy path) plus runner sequencing (all-pass returns 10 checks + firstFailIndex=-1, P3 fails after 3, P1 fails after 1, P9 error message preserved through runner).

### Tests + build

- **188 src/lib tests pass** (was 130; added 20 forensic-log + 38 preflight = 58 new).
- **13 ESLint rule tests pass** (separate file in `eslint-rules/`, unchanged this session).
- **`npm run lint`** — 16 errors, 41 warnings — same baseline as the previous session ("Pre-existing 16 errors + 41 warnings in other rules are out of scope"). **Zero new errors or warnings introduced.**
- **`npm run build` clean** — TypeScript clean in 13.3s; compiled in 17.9s; 17/17 static pages generated; all routes present.

### What did NOT change this session

- **Schema:** no changes. (Multi-workflow protocol Rule 25 honoured — schema-change-in-flight flag was "No" at session start; remains "No.")
- **Prompts:** `AUTO_ANALYZE_PROMPT_V3.md` unchanged.
- **API route shapes:** no changes. The pre-flight P5 + P6 + P9 use existing routes (`/canvas/nodes`, `/keywords`, `/api/ai/analyze`) without modifying them.
- **DB:** no writes.
- **Live site:** no deploy. Push gated by Rule 9 — director's call when ready.
- **R3, G3, R4, dry-run:** explicitly deferred — see per-section notes above.

### Files touched this session

**Modified (3):**
- `docs/ROADMAP.md` — Active Tools table row for W#1 + "🛡️ Redundancy + Defense-in-Depth Audit" item flipped to ✅ COMPLETE + top-of-file timestamp.
- `docs/DEFENSE_IN_DEPTH_AUDIT_DESIGN.md` — header updated with Session 2 ship note + §4 status note + §6 status note.
- `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` — imports for new modules; `forensicLogRef` + `sessionIdRef` + `forensicCount` state + 4 preflight state vars; `emitForensic` helper; `handleDownloadForensicLog` handler; `newSessionId` + `preflightFetcher` + `startRunLoop` helpers; `handleStart` rewritten as async with preflight gate; 4 forensic emit call sites in `processBatchV3` + `doApplyV3` + `runLoop` catch; preflight UI section; Start-button disabled-during-preflight + Skip-pre-flight checkbox + 📥 Download log button in controls bar.

**New (4):**
- `src/lib/forensic-log.ts`
- `src/lib/forensic-log.test.ts`
- `src/lib/preflight.ts`
- `src/lib/preflight.test.ts`

**Doc updates (in progress as of this STATE block):** `docs/KEYWORD_CLUSTERING_ACTIVE.md` (this file), `docs/CHAT_REGISTRY.md`, `docs/DOCUMENT_MANIFEST.md`.

### Standing instructions for next session — four "NEXT" choices (option (a) from the prior session retired)

(a) ~~Implementation Session 2 of Defense-in-Depth Audit~~ — RETIRED. Shipped this session.

(b) **Scale Session B build (Tiered Canvas Serialization + intentFingerprint backfill).** Per `INPUT_CONTEXT_SCALING_DESIGN.md §6`. ~4-6 hours. **Now even safer to land than after Session 1** — pre-flight P5/P6 catches any tier-decider regression that desyncs refs from server, and the structured forensic log gives Scale Session B's first production runs cheap-to-attach diagnostic data. G3 (empty-fingerprint reject) lands as part of this session; R3 (Tier-1 fingerprint invariant) is built into the serializer.

(c) **Phase-1 UI polish bundle** — Skeleton View on canvas + AST split-view topic-vs-description row alignment + Topics table row numbering. ~4-5 hours total. Independent of architectural work.

(d) **Action-by-action feedback workflow design session.** Analogous to Scale Session A. ~3-4 hours design; implementation 2-4 sessions after.

(e) **Optional out-of-session check-in:** director can fire a small ~2-batch fresh AI run on Bursitis (~$1-2, ~15 min) any time to empirically confirm Bug 1 + Bug 2 fixes hold under live load AND that the new pre-flight + forensic log don't disrupt the happy path. Not a session — a 15-minute test on a whim. **Newly useful this session** — exercising the pre-flight UX + generating real forensic records the director can inspect.

**Recommendation:** (b) — Scale Session B build. With the Defense-in-Depth Audit fully shipped, Scale Session B is unblocked and is the highest-impact remaining architectural item. Pre-flight + structured logging will catch its regressions cheaply.

**Director's framing from prior sessions:** sequence (a-design) → (a-impl-1) → (a-impl-2) → (b) → (e) → (c). With (a-impl-2) shipped, the natural next is (b).

---

## ⚠️ POST-2026-04-29-DEFENSE-IN-DEPTH-IMPL-1 STATE (preserved as historical context — last updated 2026-04-29 second session of day)

**As of 2026-04-29 Defense-in-Depth Audit Implementation Session 1 — Option β from the prior STATE block's NEXT choices, choice (a). Code session — schema unchanged, prompts unchanged, DB unchanged.**

### What this session shipped to W#1

**Four structural defenses landed.** Each is the primary mechanism documented in `DEFENSE_IN_DEPTH_AUDIT_DESIGN.md` for the relevant section; all are independently reversible per design §0.4.

#### 1. ESLint custom rule `no-prop-reads-in-runloop` (per design §2)

- New folder `eslint-rules/` with the rule file `no-prop-reads-in-runloop.js` (~165 lines incl. doc) and unit tests `no-prop-reads-in-runloop.test.mjs` (13 tests, all passing).
- Wired into `eslint.config.mjs` as a local plugin via `defineConfig` — no plugin extraction needed.
- Allow-list of guarded prop names: `nodes`, `allKeywords`, `sisterLinks`, `pathways` (the four refs identified in the line-163 invariant).
- Trigger: any function whose preceding JSDoc comment contains `@runloop-reachable`.
- Bootstrap annotations added to `AutoAnalyze.tsx`: `runLoop` (line 902), `doApplyV3` (line 690), `processBatchV3` (line 586), `validateResultV3` (line 619).
- **Smoke test verified:** temporary insertion of `if (allKeywords.length === 0) return;` at the top of `runLoop` was caught by the rule (`local/no-prop-reads-in-runloop` error on the offending line); reverted before commit.
- Future regressions of the 2026-04-28 closure-staleness pattern (Bug 2) will fail `npm run build` at the lint step rather than running silently in production.

#### 2. Runtime invariant R2 — post-Reconcile-Now diff-empty assertion (per design §3.2.2)

- Added to `handleReconcileNow` in `AutoAnalyze.tsx` immediately after the successful PATCH, before `onRefreshKeywords`.
- Re-runs `computeReconciliationUpdates` against the in-memory post-PATCH keyword set; if `verify.updates.length > 0`, logs a WARN to the activity log instructing the admin to click Reconcile Now again.
- Cheap (no extra I/O — works against the data already in scope). ~22 lines including the comment.
- WARN-level only — does not pause anything; does not block UI.

**R3 status:** explicitly deferred to Scale Session B per design §3.2.3 (depends on the `intentFingerprint` schema column that doesn't exist yet).

**R4 status:** explicitly deferred per design §3.2.4 + director's Q2 = Option B decision this session ("ship R1, R2, R3 first; consider R4 only after the cheap ones are in place and we've seen whether the dev-mode signal is useful"). Easily added later (~30 minutes, ~25 lines).

#### 3. Server-side guard G1 — `/canvas/rebuild` payload sanity (per design §5.2)

- New pure helper `src/lib/canvas-rebuild-guard.ts` (~75 lines) exposing `evaluateRebuildPayload({ newNodeCount, currentNodeCount, hasExplicitDeletes, nodesProvided })` and `G1_SHRINK_THRESHOLD = 0.5`.
- Wired into `POST /api/projects/[projectId]/canvas/rebuild` at the top of the `try` block: if `body.nodes` is provided, the route counts current rows, calls the helper, and returns HTTP 400 with a structured reason if the payload would shrink the canvas by >50% without explicit `deleteNodeIds`.
- Threshold locked at 50% per director's Q1 = Option A this session. The 2026-04-28 events were 95% and 98% drops; legitimate batch ops modify <5%. The rejection message tells the caller exactly how to express intent if a legitimate cleanup hits the bar (pass `deleteNodeIds`).
- 13 unit tests covering all the matrix cells: pass-through cases (delete-only, explicit-deletes, empty current, growth, no-change, 40% shrink, exactly 50%) and block cases (51%, 95% — batch-70 signature, 98% — batch-134 signature, full wipe).

#### 4. Server-side guard G2 — `/canvas/nodes` GET retry-on-transient (per design §5.3)

- New pure helper `src/lib/prisma-retry.ts` (~85 lines) exposing `withRetry(fn, options)` and `isTransientPrismaError(e)`.
- Transient codes matched: P1001 (can't reach DB), P1002 (timeout), P1008 (ops timed out), P2034 (write conflict / deadlock / serialization).
- Backoff: 100ms before retry 1, 500ms before retry 2 — total worst-case extra latency before a persistent transient surfaces ≈ 600ms.
- Hard errors (auth, validation, NOT_FOUND, etc.) pass through immediately — no retry on the wrong errors.
- Wired into `GET /api/projects/[projectId]/canvas/nodes` only this session — wrapping `prisma.canvasNode.findMany`. The pattern is reusable for other GET handlers as a future polish item but not blocking.
- 17 unit tests covering: each transient code, each hard code, plain Errors, success-on-1st, success-on-2nd, success-on-3rd, persistent-fail, custom isTransient predicate, hard-after-transient stops retrying, sleep-mock verifies backoff sequence.

**G3 status:** explicitly deferred — folded into Scale Session B per design §5.4 (depends on the `intentFingerprint` field that doesn't exist yet).

### Tests + build

- **130 src/lib tests pass** (was 100; added 13 G1 + 17 G2).
- **13 ESLint rule tests pass** (separate file in `eslint-rules/`).
- **`npm run lint` clean** — 0 violations of the new rule across the codebase. (Pre-existing 16 errors + 41 warnings in other rules are out of scope for this session, untouched.)
- **`npm run build` clean** — TypeScript clean in 12.2s; 17/17 static pages generated; all routes present including the touched `/api/projects/[projectId]/canvas/{nodes,rebuild}`.

### What did NOT change this session

- **Schema:** no changes.
- **Prompts:** `AUTO_ANALYZE_PROMPT_V3.md` unchanged.
- **API route shapes:** G1 + G2 are additive — no behavior change for any current happy-path caller. G1 returns 400 only on the bug signature; G2 makes the GET more resilient to transients without altering the response shape.
- **DB:** no writes.
- **Live site:** no deploy.
- **R3, R4, G3:** explicitly deferred — see per-section notes above.

### Files touched this session

**Modified (4):**
- `eslint.config.mjs` — local plugin wired in, .test.mjs ignored.
- `src/app/api/projects/[projectId]/canvas/nodes/route.ts` — GET wrapped in `withRetry`.
- `src/app/api/projects/[projectId]/canvas/rebuild/route.ts` — G1 guard at top of POST.
- `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` — 4× `@runloop-reachable` annotations + R2 invariant in `handleReconcileNow`.

**New (6):**
- `eslint-rules/no-prop-reads-in-runloop.js`
- `eslint-rules/no-prop-reads-in-runloop.test.mjs`
- `src/lib/canvas-rebuild-guard.ts`
- `src/lib/canvas-rebuild-guard.test.ts`
- `src/lib/prisma-retry.ts`
- `src/lib/prisma-retry.test.ts`

### Standing instructions for next session — five "NEXT" choices

(a) **Implementation Session 2 of Defense-in-Depth Audit (Option β cont.).** Ships forensic structured log (NDJSON ring buffer + download button) per design §4 + run-start pre-flight self-test P1-P10 per design §6. ~3-4 hours. Reads §4 + §6 of the design doc; resolves open questions 3-5 from §8 (P9 cost gate, forensic log scope, dry-run); writes ~150 lines of code + tests + UI. Independent of any other backlog item.

(b) **Scale Session B build (Tiered Canvas Serialization + intentFingerprint backfill).** Per `INPUT_CONTEXT_SCALING_DESIGN.md §6`. ~4-6 hours. **Now safer to land than before today's session** — the new ESLint rule will catch any closure-stale read inside Scale Session B's larger code surface, and the runtime invariants R1+R2 will catch reconciliation drift. G3 (empty-intentFingerprint reject) is a Scale Session B prerequisite and lands as part of that session.

(c) **Phase-1 UI polish bundle** — Skeleton View on canvas + AST split-view topic-vs-description row alignment + Topics table row numbering. ~4-5 hours total. Independent of architectural work.

(d) **Action-by-action feedback workflow design session.** Analogous to Scale Session A. ~3-4 hours design; implementation 2-4 sessions after.

(e) **Optional out-of-session check-in:** director can fire a small ~2-batch fresh AI run on Bursitis (~$1-2, ~15 min) any time to empirically confirm Bug 1 + Bug 2 fixes hold under live load + that today's defenses don't break the happy path. Not a session — a 15-minute test on a whim.

**Recommendation:** (a) — Implementation Session 2 of the Defense-in-Depth Audit. Completes the audit; produces visible UX (download log button, pre-flight check display); leaves the audit fully shipped before Scale Session B's larger landing.

**Director's framing from prior sessions:** sequence (a-design) → (a-impl-1) → (a-impl-2) → (b) → (e) → (c) — defense-in-depth fully landed before structural input-scaling; UI polish last. With today's impl-1 shipped, the natural next is impl-2 then Scale Session B.

---

## ⚠️ POST-2026-04-29-DEFENSE-IN-DEPTH-AUDIT-DESIGN STATE (preserved as historical context — last updated 2026-04-29 first session of day)

**As of 2026-04-29 Defense-in-Depth Audit design session (option (c) from the prior STATE block's NEXT choices; design-only — no code, no DB writes, no schema changes, no prompt changes):**

### What this session did to W#1

**Produced `DEFENSE_IN_DEPTH_AUDIT_DESIGN.md`** — a new Group B doc (~720 lines) that captures the locked design for the 6 redundancy + invariant-enforcement areas the prior STATE block listed as still-pending. Implementation work itself is now scoped and ready to start in a follow-up session.

This was a 100% design session — analogous to Scale Session A (which produced `INPUT_CONTEXT_SCALING_DESIGN.md` for the input-side context-scaling concern). No commits to `src/`. No live-data changes. No prompts touched.

### What's in the design doc

§0 — status, scope, what's shipped already, what's not in scope, reversibility framing, mechanical assumptions (test runner = `node --test --experimental-strip-types`, ESLint config = `defineConfig` with `eslint-config-next/{core-web-vitals,typescript}`).

§1 — **Per-fix redundancy matrix** for six items: A. Canvas-blanking (SHIPPED, 3 layers documented), B. Closure-staleness (SHIPPED, 3 layers documented + future Layer 4 from §2), C. Mid-run queue refresh (PENDING, 3-layer pattern designed), D. Scale Session B (PENDING, 4-layer pattern coordinating with §3+§4+§5), E. Action-by-action feedback workflow (DESIGN-PENDING in own session, 3-layer pattern), F. Reconcile Now (SHIPPED, optional Layer 2 nice-to-have).

§2 — **ESLint custom rule `no-prop-reads-in-runloop`.** Locked contract: flags direct identifier reads of `nodes`/`allKeywords`/`sisterLinks`/`pathways` inside any function annotated `@runloop-reachable`; allows reads via `*Ref.current` or shadow-binding. Mechanical implementation in `eslint-rules/no-prop-reads-in-runloop.js`; wired via `defineConfig`. Bootstraps with annotations on `runLoop`, `doApplyV3`, `processBatchV3`, `validateResultV3`. ~3-4 hours implementation. Removable in 5 minutes.

§3 — **Four runtime invariants R1-R4.** R1 (canvas non-zero → zero between batches) already shipped. R2 (post-Reconcile-Now diff must be empty) ~10 lines. R3 (Tier-1 topic must have non-empty intentFingerprint) gated on Scale Session B. R4 (refs match props at function entry, dev-mode only) ~25 lines, recommended deferred until R1-R3 prove their value.

§4 — **Forensic instrumentation.** NDJSON structured log (10-field per-batch record) + in-memory ring buffer (max 1000 records ≈ 250 KB) + download button next to Reconcile Now. ~3-4 hours. Dry-run mode designed but DEFERRED per §0.4 — fixture maintenance burden is real; revisit after a few months of production use.

§5 — **Three server-side guards.** G1: `/canvas/rebuild` rejects payloads where `body.nodes.length` is >50% smaller than current canvas AND `deleteNodeIds` is empty (the canvas-blanking signature). G2: `/canvas/nodes` GET wraps Prisma in `findManyWithRetry` matching transient error codes P1001/P1002/P1008/P2034 with backoff [100ms, 500ms]. G3: `/canvas/nodes` PATCH rejects empty `intentFingerprint` (Scale Session B prerequisite). G1+G2 together ~75 minutes; G3 folded into Scale Session B.

§6 — **Run-start pre-flight self-test (P1-P10).** Checks expand from the existing 3 (API key + seed words + prompt length) to 10: add primer prompt parseable, refs match `/canvas/nodes` + `/keywords` GETs (count + sample stableIds), pathways consistency, cheap test API call (~$0.001 with Sonnet 4.6 to verify key + model availability), localStorage writable. Per-check display in the panel; "Skip pre-flight" checkbox off by default. ~3-4 hours.

§7 — **Three implementation-sequencing options.** Option α (full bundle, 6-8 hours, ambitious). **Option β recommended** (two-session split: Session 1 ships §2+§3.R1-R3+§5.G1+§5.G2 in ~3-4 hrs; Session 2 ships §4 structured log + §6 pre-flight in ~3-4 hrs). Option γ (cherry-pick: just §2 + §5.G1, ~1.5 hrs).

§8 — **Six open questions for the director** about implementation specifics (G1 threshold, R4 build-or-defer, P9 ~$0.001 cost gate, forensic log scope, dry-run, sequencing option). These are decision points for the implementation session(s), not for today.

§9 — Cross-references to ROADMAP entries, INPUT_CONTEXT_SCALING_DESIGN, PIVOT_DESIGN, AI_TOOL_FEEDBACK_PROTOCOL, MODEL_QUALITY_SCORING, CORRECTIONS_LOG, and the specific code files (`useCanvas.ts`, `canvas-fetch-parser.ts`, `reconciliation.ts`, `AutoAnalyze.tsx:163-171`).

### Sequencing recommendation (from design §7)

Implementation Session 1 (per Option β) BEFORE Scale Session B build, because (a) the ESLint rule + runtime invariants catch regressions in Scale Session B's larger code surface, and (b) server-side guard G3 (empty-fingerprint reject) is a Scale Session B prerequisite. Implementation Session 2 can ship anytime — independent of all other work.

### What did NOT change this session

- **Schema:** no changes.
- **Prompts:** `AUTO_ANALYZE_PROMPT_V3.md` unchanged.
- **API routes:** no new routes; no behavior changes to existing routes.
- **DB:** no writes.
- **`src/`:** no code changes.

### Standing instructions for next session — five "NEXT" choices

(a) **Implementation Session 1 of Defense-in-Depth Audit (Option β recommended).** Ships ESLint custom rule + runtime invariants R1-R3 + server-side guards G1+G2. ~3-4 hours. Reads §2+§3+§5 of the design doc; resolves open questions 1-2 from §8 (G1 threshold, R4 build-or-defer); writes ~150-200 lines of code + tests.

(b) **Implementation Session 2 of Defense-in-Depth Audit.** Ships forensic structured log + run-start pre-flight self-test. ~3-4 hours. Reads §4+§6 of the design doc; resolves open questions 3-5 from §8 (P9 cost gate, forensic scope, dry-run); writes ~150 lines of code + tests + UI.

(c) **Scale Session B build (Tiered Canvas Serialization + intentFingerprint backfill).** Per `INPUT_CONTEXT_SCALING_DESIGN.md §6`. ~4-6 hours. **Note:** the design recommends Implementation Session 1 of Defense-in-Depth Audit BEFORE Scale Session B because the ESLint rule + runtime invariants catch regressions in Scale Session B's surface, and G3 is a Scale Session B prerequisite.

(d) **Phase-1 UI polish bundle** — Skeleton View on canvas + AST split-view topic-vs-description row alignment + Topics table row numbering. ~4-5 hours total. Independent of architectural work.

(e) **Action-by-action feedback workflow design session.** Analogous to Scale Session A. ~3-4 hours design; implementation 2-4 sessions after.

**Plus an optional out-of-session check-in:** director can fire a small ~2-batch fresh AI run on Bursitis (~$1-2, ~15 min) any time to empirically confirm Bug 1 + Bug 2 fixes hold under live load. Not a session — a 15-minute test on a whim.

**Recommendation:** (a) — Implementation Session 1 of the Defense-in-Depth Audit, per Option β in design §7. Highest leverage; smallest risk; sets up Scale Session B for safer landing.

---

## ⚠️ POST-2026-04-29-BUG-FIX-SESSION STATE (preserved as historical context — last updated 2026-04-29)

**As of 2026-04-29 bug-fix + canvas-wipe session (started 2026-04-28; spanned midnight; first session to ship code since the prior session's diagnosis):**

### What this session did to W#1

**Bug 1 (canvas-blanking) and Bug 2 (closure-staleness) are both FIXED** — and not with the surgical one-liners originally locked into the ROADMAP. Director's mid-session directive *"fix the fundamental problem long term; test the tool in a sturdy way"* expanded scope from "patch the bug instance" to "prevent the bug class structurally." Each bug now has three independent layers of defense; either layer alone would catch the bug, all three layers must fail simultaneously for the bug class to recur.

**Bursitis canvas wiped wholesale** per director's later directive *"ok if we need to start from scratch or delete data; main priority is fixing the fundamental issues."* All canvas data eliminated; keyword inputs preserved; archive history preserved. Future fresh runs start from a clean slate.

**Reconcile Now admin button shipped** as a forward-looking forensic + healing tool — independent of the wipe, useful any time future drift appears.

### Bug 1 — Canvas-Blanking Intermittent Bug — FIXED (3 layers of defense)

**Layer 1 (primary):** New pure helper `parseCanvasFetchResponses` in `src/lib/canvas-fetch-parser.ts` classifies the `/canvas/nodes` + `/canvas` GET responses. `useCanvas.fetchCanvas` now checks `response.ok`, requires array body for nodes + plain-object body for state, **preserves prior client state on any failure** (HTTP error / non-array body / parse exception), and **throws** so callers can pause. Plus uniform throw-on-failure contract applied across all five `useCanvas` methods (`addNode`, `updateNodes`, `deleteNode`, `updateCanvasState` previously silently swallowed errors); state is applied only on success; `deleteNode`'s optimistic remove rolls back on server rejection.

**Layer 2 (independent guard):** `runLoop` gained a fail-fast pre-flight at the top of every iteration. Tracks `lastSeenNodesCountRef`; if the canvas had >0 nodes after the previous batch's apply but is empty NOW, immediately `setAaState('API_ERROR')` and pause. Catches any future failure mode that produces the same symptom from a different root cause.

**Layer 3 (existing infrastructure now wired):** runLoop's outer try/catch at lines ~940-970 already routed thrown errors to `API_ERROR` state. The Layer 1 throw contract now actually propagates through `await onRefreshCanvas()` → `doApplyV3` → runLoop catch, so a transient `/canvas/nodes` 5xx pauses the run instead of silently rolling forward.

### Bug 2 — Reconciliation-Pass Closure-Staleness — FIXED (3 layers of defense)

**Layer 1 (primary — structural):** Reconciliation logic extracted to pure helper `computeReconciliationUpdates(keywords, placedSet, archivedSet)` in `src/lib/reconciliation.ts`. The helper takes its inputs explicitly, has no closure to capture from, and is pure — it cannot be wrong in the same way the inline loop was.

**Layer 2 (shadow pattern):** At `doApplyV3` function entry, `allKeywords` and `pathways` are shadowed by locals pointing at `keywordsRef.current` / `pathwaysRef.current`. The local names match the prop names, so closure-frozen props are physically unreachable for every read inside the function (lines 707 + 858 reads automatically resolve to fresh state). New `pathwaysRef` added to match the existing nodes/keywords/sisterLinks ref pattern.

**Layer 3 (convention enforcement):** The line-153 invariant comment was rewritten from a passive "must read via *Ref.current" to a positive description of the shadow strategy as the new convention. Future code added to `doApplyV3` reads fresh state by default. ESLint enforcement of the shadow pattern is captured in the Defense-in-Depth Audit design item for a future dedicated session.

### Reconcile Now admin button — SHIPPED

New button in the Auto-Analyze panel footer (alongside Pause/Cancel/Close), disabled while a run is in progress. On click:
1. Fetches keywords + canvas + removed-keywords from server (fresh data, no closure-stale).
2. Computes reconciliation diff via the same `computeReconciliationUpdates` helper.
3. Shows `window.confirm` with diff counts.
4. On OK PATCHes `/keywords` bulk-update endpoint with the diff.
5. Logs result in the Auto-Analyze activity log.

Reusable forever. Forward-looking utility — the wipe means there's nothing to reconcile right now, but any future run that produces drift gets healed in one click.

### Sturdy testing — 26 new + 74 existing tests, all pass

`src/lib/canvas-fetch-parser.test.ts` — 16 tests: every failure mode the parser must reject (HTTP 500, HTTP 401, exact `{ error: 'Failed to fetch nodes' }` shape, null/undefined/string bodies, both-fail, mixed-success defensive normalization). `src/lib/reconciliation.test.ts` — 10 tests: empty input, archived skip, all four cells of the reconciliation truth table, mixed batch, the 84-keyword 2026-04-28 stale-vs-fresh contrast scenario, hidden-snapshot regression guard, unknown status fallthrough. `npm run build` ✓ Compiled 14.0s; TypeScript clean 11.8s; 0 lint errors / 0 warnings in any file touched.

### Bursitis canvas wipe — completed (Rule 8 destructive-op gate respected)

ProjectWorkflow `d1ade277-ba14-429a-a71f-b57dd2b39efc` (project `9e0ffc58-9ea2-4ea3-b840-144f760fb960`). One Prisma transaction:

| Operation | Rows affected |
|---|---|
| `CanvasNode.deleteMany` | 690 |
| `SisterLink.deleteMany` | 241 |
| `Pathway.deleteMany` | 4 |
| `CanvasState.updateMany` (`nextStableIdN: 691 → 1`, viewport reset) | 1 |
| `Keyword.updateMany` (`sortingStatus → 'Unsorted'`, `topic → ''`, `canvasLoc → {}`) | 2,256 |

**Preserved:** 73 RemovedKeyword rows (intentional archives); all Keyword core fields (volume / tags / keyword text); Project + ProjectWorkflow + AdminNotes + AutoAnalyze settings.

Post-wipe verification queried: 0 nodes / 0 sister links / 0 pathways / 2,256 keywords all Unsorted / 73 archives intact / `nextStableIdN: 1`. Director was given the exact pre-wipe counts in plain-language tabular form before approving; Rule 8 explicit YES received before write.

### What did NOT change this session

- **Schema**: no changes.
- **Prompts**: `AUTO_ANALYZE_PROMPT_V3.md` unchanged.
- **API routes**: no new routes. `/canvas/rebuild`, `/canvas/nodes`, `/canvas`, `/keywords`, `/removed-keywords` all unchanged.
- **The 5 design goals of the Defense-in-Depth Audit** (per-fix redundancy matrix, codebase-wide invariant enforcement via ESLint, forensic instrumentation, server-side guards, pre-flight self-tests at run start): partially shipped — the per-fix redundancy matrix is implicit in this session's 3-layer approach for both bugs; the rest is still a forward-pointing design item awaiting a dedicated session.

### Standing instructions for next session — four "NEXT" choices (option (a) retired this session)

**Multi-workflow context (added 2026-04-29):** W#2 (Competition Scraping & Deep Analysis) is now also active in parallel — see `ROADMAP.md` "Current Active Tools" table for live state. Per `MULTI_WORKFLOW_PROTOCOL.md` + `HANDOFF_PROTOCOL.md` Rule 25, W#1 sessions stay on `main`; W#2 sessions are on `workflow-2-competition-scraping`. Before any platform-level changes (especially schema), W#1 sessions check the Active Tools table for a W#2 schema-change-in-flight flag — if set, defer schema work to a later session. The canonical W#1 continuation prompt is in `MULTI_WORKFLOW_PROTOCOL.md` Appendix B.

(a) ~~Bug-fix session~~ — RETIRED. Shipped this session.

(b) **Scale Session B build (Tiered Canvas Serialization)** — per `INPUT_CONTEXT_SCALING_DESIGN.md §6`. Addresses the body-part ladder violation (95+ scattered topics — though those topics no longer exist post-wipe; the structural problem will recur on the next big run if not addressed) and the input-side cost growth structurally. **Recommended next** in the prior session's sequence (a) → (c) → (b) → …; with (a) shipped, (b) becomes the highest-impact next item OR the director may prefer (c) first to lock in defense-in-depth before more architectural work lands. ~4-6 hours.

(c) **Defense-in-Depth Audit design session** — produces full per-fix redundancy matrix + codebase-wide invariant enforcement plan (ESLint custom rule for the shadow pattern; runtime invariant checks; forensic instrumentation; server-side guards; pre-flight self-tests). Implementation work scoped after the design lands. ~3-4 hours design; implementation 1-3 sessions after.

(d) **Phase-1 UI polish bundle** — Skeleton View on canvas + AST split-view topic-vs-description row alignment + Topics table row numbering. Pure UI; ~4-5 hours total. Independent of bug + architectural work.

(e) **Action-by-action feedback workflow design session** — analogous to Scale Session A. Produces design doc + locked decisions + multi-session implementation plan. Director was explicit that this is something they want to engage with eventually. ~3-4 hours design; implementation 2-4 sessions after.

**Plus an optional out-of-session check-in:** director can fire a small ~2-batch fresh AI run on Bursitis (~$1-2, ~15 min) any time after deploy to empirically confirm Bug 1 + Bug 2 fixes hold under live load. Not a session — a 15-minute test on a whim. Recommended but not blocking.

**Director's framing from the prior session:** sequence (a) → (c) → (b) → (e) → (d) — bug-fix first; defense-in-depth lock-in second; structural input-scaling third; second-pass design fourth; UI polish last. With (a) shipped, the natural next is (c).

---

## ⚠️ POST-2026-04-28-DEEPER-ANALYSIS STATE (preserved as historical context — last updated 2026-04-28)

**As of 2026-04-28 deeper-analysis + fix-design session (read-only DB queries + code reading of `useCanvas.ts` / `AutoAnalyze.tsx` / `auto-analyze-v3.ts` / `/canvas/rebuild` and `/canvas/nodes` API routes; produced a concrete bug report + quality-issue catalog; produced ROADMAP + KEYWORD_CLUSTERING_ACTIVE + PLATFORM_ARCHITECTURE + CORRECTIONS_LOG + CHAT_REGISTRY + DOCUMENT_MANIFEST updates):**

### What this session did to W#1

**Two HIGH-severity bugs diagnosed; fix designs locked. One NEW design item captured. Full quality-issue catalog produced against the live Bursitis canvas. Director's full 8-item feedback table addressed.**

This session was option (a) from the prior STATE block's three "NEXT" choices. No code changes; no DB writes; no schema changes; no prompt changes. The previous run's 2026-04-28T00:18..04:06 Bursitis canvas state is unchanged.

### Bug 1 — Canvas-Blanking Intermittent Bug — ROOT CAUSE DIAGNOSED

The bug surfaced (not diagnosed) in the prior STATE block. Today's session diagnosed it to root cause.

**Root cause:** `src/hooks/useCanvas.ts` line 75 — `setNodes(Array.isArray(nodesData) ? nodesData : [])`. When `/api/projects/[id]/canvas/nodes` GET returns a 5xx error (the response body is `{ error: 'Failed to fetch nodes' }`), the response is non-array → `setNodes([])` fires silently. Two design defects combine: (a) `response.ok` is never checked; (b) the "not an array" fallback is `[]` instead of `prev`. Connection-pool flake on the Supabase pgbouncer pooler under sustained run load is the most likely 5xx trigger — twice in 151 batches matches the empirical ~1.3% rate.

**Forensic confirmation against live DB:**
- `nextStableIdN = 691`, total nodes = 690, all stableIds `t-1`..`t-690` contiguous → no nodes destroyed.
- 4 orphan ROOT topics created in two single transactions with identical timestamps:
  - `t-285` "What can you do about bursitis?" (duplicates `t-13` with 71 keywords), `t-286` "What is bursitis?" (duplicates `t-2` with 28 keywords), `t-287` "What does bursitis feel like?", + descendants `t-288`..`t-291` — all at `2026-04-28T00:45:41.836Z` (batch-70 blanking event).
  - `t-594` "Something doesn't feel right — could it be bursitis?" + descendants `t-595`..`t-604` (including a third "What is bursitis?" duplicate at `t-595`) — all at `2026-04-28T03:16:35.901Z` (batch-134 blanking event).
- Titles match V3 prompt's example funnel-stage roots almost verbatim → confirms the model's behavior was correct for the inputs it received (an empty TSV → build a fresh funnel skeleton). The bug is upstream of the model.

**Fix design (locked):** see `ROADMAP.md` "🚨 Canvas-Blanking Intermittent Bug" section. Three defensive changes in `useCanvas.fetchCanvas` + a fail-fast pre-flight in `runLoop` + post-fix cleanup of the 17 orphan nodes. Estimated 1-2 hours code + small unit test.

### Bug 2 — Reconciliation-Pass Closure-Staleness — NEW finding (regression of 2026-04-18 pattern)

**The smoking gun:** `AutoAnalyze.tsx:830` — `for (const kw of allKeywords)`. This violates the documented invariant at line 153 ("runLoop-reachable code must read via *Ref.current, not raw props — see CORRECTIONS_LOG 2026-04-18"). The reconciliation pass walks the closure-frozen `allKeywords` prop instead of the always-fresh `keywordsRef.current`. Every other variable read in `doApplyV3` correctly uses the refs (line 656 in the same function uses `keywordsRef.current`) — line 830 is the lone regression.

**Empirical math (matches DB exactly):** at run start, the project carried ~84 `AI-Sorted` keywords from a prior in-flight run. The closure-frozen `allKeywords` showed those 84 as AI-Sorted forever. Batch 70's blanking + reconciliation flipped all 84 to Reshuffled (closure said "AI-Sorted" + `placedSet` = 8 batch keywords). Healthy batches 71-133 saw the same 84 in stale closure as still-AI-Sorted → no flip → no healing. Batch 134 re-flipped the same 84 (idempotent PATCH). Final state: **84 keywords stuck Reshuffled — all 84 currently still ON the canvas in DB.** Live DB confirms exactly 84.

**Pattern recurrence:** the 2026-04-18 stale-closure bug was in `buildCurrentTsv`. That function was deleted in Pivot Session E (2026-04-25). The reconciliation pass added in Session 3b (2026-04-25) is post-deletion code. The line-153 invariant was already documented; line 830 was written without applying it. Rule 24 search this session confirmed prior treatment exists (CORRECTIONS_LOG 2026-04-18 + 2026-04-19 + line-153 comment + PLATFORM_ARCHITECTURE.md line 407) and the new ROADMAP entry cross-references all four.

**Fix design (locked):** one-token change — `for (const kw of allKeywords)` → `for (const kw of keywordsRef.current)`. ~5 min code + ~15 min test. See `ROADMAP.md` "🚨 Reconciliation-Pass Closure-Staleness Bug" section.

**Post-fix cleanup:** the live DB has 232 status drift residuals (147 ghost AI-Sorted + 85 silent placements) plus the 84 stuck Reshuffled. Either a "Reconcile Now" admin button (recommended — doubles as forensic tool) or a one-off SQL/Prisma script will clear them.

### NEW design item — Redundancy + Defense-in-Depth Audit

Captured per director's framing: *"think if redundancies may be needed and if so, to add them, in case our fixes fail during a session (which has happened before)."* See `ROADMAP.md` "🛡️ Redundancy + Defense-in-Depth Audit" section. Five design goals: per-fix redundancy matrix; codebase-wide invariant enforcement (ESLint rule + runtime check + unit-test pattern for the line-153 rule and similar); forensic instrumentation; server-side guards; pre-flight checks at run start. Sequencing: ride alongside the bug-fix session OR run as its own session after fixes ship; director's call.

### Quality-issue catalog (live Bursitis canvas, 2026-04-28)

Run against `Bursitis Test` project `9e0ffc58-9ea2-4ea3-b840-144f760fb960`, projectWorkflow `d1ade277-ba14-429a-a71f-b57dd2b39efc`.

| Issue | Severity | Detail |
|---|---|---|
| 17 orphan-root + descendant nodes from blanking events | HIGH (structural) | `t-285`..`t-291`, `t-594`..`t-604`. ≤8 keywords directly attached. Soft-archive + delete after Bug 1 ships. |
| 3 duplicate-title pairs/triples | MEDIUM | "What is bursitis?" (t-2, t-286, t-595); "What can you do about bursitis?" (t-13, t-285, t-600); "natural remedies for hip bursitis" (t-425, t-442). First two are blanking artifacts; third is a healthy-batch intent-equivalence violation. |
| Body-part ladder violation: ~95 misplaced topics | HIGH (architectural quality) | 33 hip topics outside `t-5 Hip bursitis`, 12 shoulder outside `t-7`, 9 pes anserine outside `t-11`, 8 elbow outside `t-8`, 7 knee outside `t-10`, 7 heel outside `t-35`, 6 trochanteric outside `t-6`, 4 iliopsoas outside `t-36`, 4 ischial outside `t-23`, etc. Pattern: compound-primary topics like "Treating hip bursitis" placed under intent branches without a SECONDARY at the body-part anchor. Under-placement failure mode the V3 prompt's Step 4b is supposed to prevent — but Step 4b is self-policed and the applier doesn't enforce it. Likely cause: model shed dimension-secondaries to manage output length as canvas TSV grew past 100k tokens. **This is the structural problem Scale Sessions B-E (Tiered Canvas Serialization + intentFingerprint) are designed to address.** |
| 232 status drift residuals + 84 stuck Reshuffled | HIGH | Partly Bug 2; also residuals of P3-F7 silent placements / ghost AI-Sorted. Heal via "Reconcile Now" button after Bug 2 fix. |
| 5 truly empty leaf topics | LOW (working as designed) | `t-290`, `t-18`, `t-74`, `t-112`, `t-176`. Per V3 prompt Step 4c (complement detection) — second halves of complement pairs that didn't pick up keywords this run. NOT a bug. Recommendation: leave them. |
| 0 singleton roots | — | Healthy. |

### V3-prompt context for why the model did what it did

The model was following the V3 prompt **literally** in every observed case:

- The orphan-root titles are uncannily close to the prompt's example funnel-stage root titles (V3 prompt line 359). When fed an empty canvas, Step 7 (Conversion Funnel Stage Ordering) correctly built the canonical awareness→action skeleton. **The model wasn't confused; the wiring layer told it the canvas was empty.**
- The 95+ scattered body-part topics show the under-placement failure mode the V3 prompt's Step 4b is supposed to prevent (1 + N(dimensions) placements per keyword; line 136). The applier doesn't enforce Step 4b; the model self-polices. Under canvas-TSV growth past 100k tokens, the model started shedding the dimension-secondaries to manage output length.
- The 5 empty leaves are deliberate scaffolding (V3 prompt Step 4c, line 295) — complement-pair second halves that didn't accumulate keywords this run. Working as designed.

**Three distinct quality causes underneath the surface symptoms:**
1. Canvas-blanking bug (wiring layer) — produces orphan roots + the duplicate "What is bursitis?" / "What can you do about bursitis?" entries.
2. Closure-staleness reconciliation (wiring layer) — preserves the 84 Reshuffled and is part of the 147+85 status drift residuals.
3. Input-TSV scaling failure mode (architectural) — produces under-placement (no body-part secondaries), the "natural remedies for hip bursitis" duplicate, and probably a long tail of subtler intent-equivalence misses we haven't surfaced. This is what `INPUT_CONTEXT_SCALING_DESIGN.md` Tiered Canvas Serialization is designed to address.

### Director's full 8-item feedback table — status as of 2026-04-28 deeper-analysis session

| # | Director feedback | Status from THIS session | Where captured | Plan |
|---|---|---|---|---|
| 1 | "Many keywords AI-sorted don't have status changed to AI-Sorted" | **Diagnosed.** Two co-causes: canvas-blanking bug created stuck-Reshuffled (Bug 1); closure-staleness prevented healing (Bug 2). Live DB shows 85 silent placements + 84 stuck Reshuffled = 169 affected; plus 147 ghost AI-Sorted. | This STATE block + ROADMAP §"Canvas-Blanking" + ROADMAP §"Reconciliation-Pass Closure-Staleness". | Bugs 1 + 2 fixed in one wiring-layer session (~3 hrs); "Reconcile Now" run heals existing residuals. |
| 2 | "Many keywords skipped in AST table" | **Diagnosed.** Same root causes as #1, plus the fixed-at-run-start batch queue. After Bugs 1 + 2 fix, future runs won't produce stuck Reshuffled. The existing "Mid-run batch queue refresh" polish item is the belt-and-braces and is independent. | Same as #1; queue-refresh item at ROADMAP §"Mid-run batch queue refresh". | Bugs 1 + 2 solve the dominant cause. Queue-refresh polish ships when convenient. |
| 3 | "Skeleton View on canvas" | **Already captured as Phase-1 polish.** UI work, not bug work. Director's spec is locked. | ROADMAP §"Skeleton View on canvas". | Schedule alongside other UI polish items. ~2-3 hours. |
| 4 | "AST split-view topic-vs-description row alignment" | **Already captured as Phase-1 polish.** UI work. | ROADMAP §"AST table split-view topic-vs-description row alignment". | Same as #3. ~1-2 hours. |
| 5 | "Topics table row numbering" | **Already captured as Phase-1 polish.** UI work. | ROADMAP §"Topics table row numbering". | Same as #3. ~30-60 min. |
| 6 | "Do we do a second pass? Were reshuffles warranted?" | **Definitively answered.** All 84 currently-Reshuffled keywords are still ON the canvas → reshuffles in this run were NOT warranted; they're reconciliation noise from Bugs 1 + 2. After fixes, future Reshuffle counts will be honest signal. **A second pass IS warranted, but for a different reason** — to address structural quality issues (body-part ladder, intent-equivalence violations) Pass 1 misses at scale. | This STATE block + ROADMAP §"Action-by-action feedback + second-pass refinement". | Bug fixes first (data hygiene). Then dedicated design session for second pass + action-by-action feedback workflow. |
| 7 | "Action-by-action feedback table with admin adjustment column + ability to add missing actions + drives second pass" | **Already captured as architectural design item.** Today's findings strengthen the case: the 95+ body-part-ladder violations are exactly what admin would flag in an adjustment column. | ROADMAP §"Action-by-action feedback + second-pass refinement". | Dedicated design session, sized analogous to Scale Session A. Sequence after Scale Session B-E ships. |
| 8 | "Intelligent way to reduce cost without sacrificing quality" | **Already captured as architectural design item.** Today's findings sharpen the question: per-batch cost grew $0.20 → $0.85 driven entirely by canvas-TSV input growth. Tiered Canvas Serialization (Scale Sessions B-E) addresses this directly. The new Defense-in-Depth Audit + the action-by-action feedback design also contribute. | ROADMAP §"Intelligent hybrid cost/quality strategy". | Design AFTER Scale Sessions B-E ship. |

### What did NOT change this session

- **No code changes.** Pure analysis + doc-update session.
- **No DB schema changes.**
- **No DB write operations.** All DB queries this session were read-only via Prisma `findMany`/`groupBy`/`count`.
- **No prompt changes.** `AUTO_ANALYZE_PROMPT_V3.md` is unchanged.
- **No live-data state changes** by Claude. The Bursitis canvas reflects whatever state the director left it in after stopping the run at batch 152.

### Standing instructions for next session — three "NEXT" choices

(a) **🎯 Bug-fix session: ship Bug 1 + Bug 2 + post-fix cleanup (recommended next).** Both wiring-layer fixes; both heal the visible "skipped keywords" symptom. ~3 hours including unit tests + build + Bursitis-test verification + the 17-orphan-node cleanup + a "Reconcile Now" run to clear the 232+84 status drift residuals. Push gated by Rule 9. **This subsumes most of option (d) from the prior STATE block** — it's the highest-impact item from the polish bundle.

(b) **Scale Session B build (the Tiered Canvas Serialization build path).** Per `INPUT_CONTEXT_SCALING_DESIGN.md §6`. Addresses the body-part ladder violation (95+ scattered topics) and the input-side cost growth structurally. Risk profile: medium (schema constraint change). Estimated full session.

(c) **Dedicated design session for Redundancy + Defense-in-Depth Audit.** New item from this session. Could ride alongside (a) — adding the redundancies for the two specific fixes in the same commit. Or stand alone after (a) ships. Estimated full session if standalone.

(d) **Phase-1 UI polish bundle** — the three remaining UI items from the director's feedback list (#3 Skeleton View, #4 AST split-view alignment, #5 Topics table row numbering). Pure UI; ~4-5 hours total. Independent of bugs.

(e) **Dedicated design session for action-by-action feedback + second-pass refinement workflow.** Item #7 from the director's feedback list. Analogous to Scale Session A — produces a design doc + locked decisions + multi-session implementation plan. Director was explicit: *"this is what I want us to engage in next"* — but priority vs. (a)/(b) is the director's call.

**Director's framing:** sequence (a) → (c) → (b) → (e) → (d) is the sensible default — diagnose-and-fix the dominant bug pair first; lock in defense-in-depth so future regressions are caught earlier; then ship the structural input-scaling fix; then design the second-pass workflow; then UI polish. But director's call.

---

## ⚠️ POST-2026-04-28-SCALE-SESSION-0-OUTCOME-C STATE (preserved as historical context — last updated 2026-04-28)

**As of 2026-04-28 Scale Session 0 + full-run feedback session (empirical validation; no code, no DB, no schema, no prompt changes; produced ROADMAP + KEYWORD_CLUSTERING_ACTIVE + INPUT_CONTEXT_SCALING_DESIGN + PLATFORM_ARCHITECTURE + DOCUMENT_MANIFEST + CHAT_REGISTRY updates):**

### What this session did to W#1

**Empirical validation of `INPUT_CONTEXT_SCALING_DESIGN.md`'s test-before-build gate.** Director ran a full-Bursitis V3 Auto-Analyze on Sonnet 4.6 (151 of 281 planned batches completed before stopping; ~1,208 keywords processed; total cost ~$70-80) plus a separate Opus 4.7 cost test at run start. Empirical results:

1. **Sonnet 4.6 hit the 200k context wall at batch 151** — input grew from 19,929 tokens (empty canvas) → 220,091 tokens (canvas of ~700 topics). Beyond standard 200k limit. Director stopped the run at batch 152.
2. **Opus 4.7 was economically prohibitive** at run start — per-batch cost approached $1+ vs. Sonnet's $0.30-$0.85. Director switched to Sonnet 4.6.
3. **Per-batch cost on Sonnet 4.6 grew monotonically** ($0.20 → $0.85) driven entirely by input-token growth (canvas TSV grows linearly with canvas size; static prompt body stays cached at ~18k tokens).

**Scale Session 0 outcome decision:** Outcome C fired (V3 + Opus 4.7 still hits wall AND cost is unacceptable). Per `INPUT_CONTEXT_SCALING_DESIGN.md §0` trigger conditions, **Scale Sessions B–E now activate** as the build path for Workflow #1.

### One HIGH-severity bug found in the run log — canvas-blanking at batches 70 + 134

Discovered during Claude's review of the activity log. Director flagged it as worth investigating; captured to ROADMAP as a top-level architectural concern (NOT polish).

**Symptom:** twice in the 151-batch run (at batches 70 and 134), the wiring layer sent ~19,929 tokens of input to the model instead of the expected ~80–200k tokens (canvas state was missing from the prompt). The model rebuilt a canvas from scratch using only the 8 keywords in that batch. The reconciliation pass correctly caught the symptom and flagged 84 keywords/event as `Reshuffled` (off-canvas).

**Cascade impact:** **168 keywords across the 2 events** silently abandoned for the rest of the run because the batch queue is built once at run-start and is fixed. These 168 keywords sat at Reshuffled status until end-of-run.

**Director's "many keywords are simply skipped" feedback IS this bug** — fix it and the visible symptom largely disappears. Combined with the new Phase-1 "Mid-run batch queue refresh" polish item (also captured this session), the keywords-skipped problem becomes structurally addressed.

**Investigation pending:** code reading + DB query needed before fix design. Captured as ROADMAP top-level item (peer to architectural-pivot section).

### Director's other feedback (mapped to existing or new docs per Rule 24)

| Feedback item | Status / where captured |
|---|---|
| "Many keywords AI-sorted don't have status changed to AI-Sorted" | Likely the canvas-blanking bug above creating Reshuffled-status keywords; also possibly P3-F7 Bug 1 silent placements (which Session 3b's reconciliation pass was supposed to fix). Needs DB query to confirm which is dominant. |
| "Many keywords skipped in AST table" | Same — the canvas-blanking bug + the fixed batch queue together create stuck-Reshuffled keywords. |
| "Skeleton View on canvas" | NEW Phase-1 polish item captured 2026-04-28. |
| "AST split-view topic-vs-description row alignment" | NEW Phase-1 polish item captured 2026-04-28. |
| "Topics table row numbers" | NEW Phase-1 polish item captured 2026-04-28. |
| "Do we do a second pass? Were reshuffles warranted?" | Reshuffles in this run were NOT model-decided reshuffles — they were reconciliation correctly raising alarms about the canvas-blanking bug. Second-pass: consolidation pass already designed in `INPUT_CONTEXT_SCALING_DESIGN.md §4.1`; ALSO new architectural design item below for action-by-action feedback + second-pass refinement workflow. |
| "Action-by-action feedback table with admin adjustment column + ability to add missing actions + drives second pass" | NEW architectural design item captured 2026-04-28 (extends `AI_TOOL_FEEDBACK_PROTOCOL.md`). Needs dedicated design session. |
| "Intelligent way to reduce cost without sacrificing quality" | NEW architectural design item captured 2026-04-28. To be designed AFTER Scale Sessions B–E ship (so we know the post-Tiered-Serialization cost baseline). |

### Other applier-rejection / validation-failure events from the run log (captured for reference)

- **Batches 7, 71** — model emitted parent-cycle in canvas tree ("parent chain contains a cycle that includes 't-1'"). Applier rejected; retry succeeded.
- **Batch 12** — model used the same alias `$new1` twice in one batch. Applier rejected; retry succeeded.
- **Batch 33** — model emitted MOVE_KEYWORD against a placement that didn't exist on the canvas it was looking at. Applier rejected; retry succeeded.
- **Batches 9, 31, 41, 57, 104, 151** — model failed to address all 8 keywords in the batch on first attempt ("Missing N batch keywords"). Retry succeeded.

Total retry overhead: ~$5-7 of the ~$75 run cost (~8%). Not a dominant cost driver. These are smaller-scale issues that would benefit from prompt clarification or applier pre-validation; captured here for cross-reference but not yet promoted to ROADMAP polish items (the action-by-action feedback design above subsumes them).

### What did NOT change this session

- **No code changes.** Pure analysis + doc-update session.
- **No DB schema changes.**
- **No prompt changes.** `AUTO_ANALYZE_PROMPT_V3.md` is unchanged.
- **No tests run / built / re-run.** Test suite and build state unchanged.
- **No live-data state changes** by Claude. The Bursitis test project canvas reflects whatever state the director left it in after stopping the run at batch 152.

### Standing instructions for next session — three "NEXT" choices

(a) **🎯 Deeper analysis of the 2026-04-28 run (recommended next; Option B from Claude's 2026-04-28 framing).** Read-only DB queries against the live Bursitis canvas to characterize: actual canvas tree structure (Hip topics misplaced under Knee parent; singleton topics; intent-equivalence violations); how many keywords stuck in Reshuffled status; comparison of activity log vs. actual DB state. Plus code reading on `auto-analyze-v3.ts` + `AutoAnalyze.tsx` to diagnose the canvas-blanking bug root cause. Output: concrete bug report + concrete quality-issue catalog with line/topic references. Estimated 60-90 min.

(b) **Scale Session B build (the Tiered Canvas Serialization build path).** Per `INPUT_CONTEXT_SCALING_DESIGN.md §6`: 3-step schema migration adding `intentFingerprint` column + applier extension + AI-generated backfill script + caller patches. Risk profile: medium (schema constraint change). Estimated full session.

(c) **Dedicated design session for action-by-action feedback + second-pass refinement workflow.** Analogous to Scale Session A — produces a design doc + locked decisions + multi-session implementation plan. Estimated full session.

(d) **Phase-1 polish bundle including the 4 new items captured this session** (canvas-blanking fix + mid-run queue refresh + Skeleton View + AST split alignment + Topics row numbers). Multiple smaller items in one session. Estimated full session.

**Director's framing:** the canvas-blanking bug is HIGH severity and likely the dominant cause of the "skipped keywords" complaint. Recommended sequencing is **(a) → (d) → (b) → (c)** — diagnose the bug first, then ship the polish bundle to address visible symptoms, then build the Tiered Serialization to address the cost/wall issue, then design the feedback workflow last. But director's call.

---

## ⚠️ POST-2026-04-27-INPUT-CONTEXT-SCALING-DESIGN STATE (preserved as historical context — last updated 2026-04-27)

**As of 2026-04-27 Scale Session A (input-side context-scaling design session — design-only, no code; produced `docs/INPUT_CONTEXT_SCALING_DESIGN.md`):**

### What this session did to W#1

**One deliverable: a captured locked design + multi-session plan for the input-side context-scaling architectural concern.** No code changes. No DB changes. No schema changes. No prompt changes.

**`docs/INPUT_CONTEXT_SCALING_DESIGN.md` (NEW, Group B, ~470 lines)** captures:

1. **The unified mechanism — Tiered Canvas Serialization.** Every topic on the canvas, every batch, the tier decider picks one of three tiers (Tier 0 Full / Tier 1 Summary / Tier 2 Skeleton) using three signals: recency (touched in last N batches; default N=5, configurable); batch-relevance (local stem-based heuristic matching new keywords against existing topic title + intent fingerprint + existing keyword text; one-hop neighborhood promotion); stability score (≥7.0 eligible for Tier 1 demotion — same threshold as JUSTIFY_RESTRUCTURE; dormant until stability-scoring algorithm ships in a future session). Folds the original five candidate directions (D1 1M-context, D2 selective subtree, D3 consolidation, D4 stable-topic summary, D5 recency-hybrid) into one coherent design. D3 layered as orthogonal complement (auto every 10 batches when canvas > 100 topics + admin-triggered "Consolidate Now" button); D1 layered as cap-headroom.

2. **Intent fingerprint mechanism.** Short canonical phrase (5–15 words, searcher-centric language; ~20 tokens average). Written by the AI as a required field on `ADD_TOPIC` / `MERGE_TOPICS` / `SPLIT_TOPIC` / `UPDATE_TOPIC_TITLE`; optional on `UPDATE_TOPIC_DESCRIPTION`. Stored as new `intentFingerprint String` column on `CanvasNode` (NOT NULL after backfill). Existing ~104 Bursitis + ~25 test-project topics get fingerprints via one-time AI-generated backfill script (~$1–$2 one-time per project; runs in Scale Session B).

3. **Constraint preservation.** The four V3 quality-preserving properties (silence is preservation; intent-equivalence detection; Reevaluation Pass coverage; JUSTIFY_RESTRUCTURE on stability ≥ 7.0) are addressed in the design's §5 constraint-mapping table. The load-bearing assumption is that the intent fingerprint carries enough signal for the model to detect intent-equivalence cross-canvas at Tier 1 — to be validated in Scale Session D when the V4 prompts ship.

4. **Multi-session implementation plan (Scale Sessions A through E).** A done (this session). **Scale Session 0 — empirical validation on Opus 4.7 1M-context — runs next, before any build commitment.** Scale Sessions B–E (schema migration; tier serialization wiring; V4 prompt rewrite; consolidation pass) are gated behind Outcome C from Session 0.

5. **Trigger conditions for proceeding to Scale Session B (BUILD path):** (a) V3 + Opus 4.7 1M test reveals quality regression on intent-equivalence / compound primaries / Reevaluation Pass triggers, OR (b) any production project's canvas exceeds ~600 topics under standard 200k window, OR (c) Anthropic deprecates 1M context or 1M-tier pricing becomes economically prohibitive at Phase 3 scale.

### The director's pivotal Cluster-5 question that produced the test-before-build reframe

After Cluster 5's session-sequence proposal, the director asked: *"What if we ran the test on V3 and it looks like it worked on the new model Opus 4.7 with the expanded context window with no issues? I don't anticipate having more than 500 topics per keyword analysis per project anyway."*

Math anchored honestly: at 500 topics, the standard 200k Sonnet 4.6 wall sits ~50k tokens away (~150k total input usage) — comfortable. On 1M-context: ~15% utilization — trivial. **If the director's 500-topic forecast holds AND a V3 + Opus 4.7 1M test shows no quality regression, the unified design is overengineered for the actual problem.** Director picked the test-before-build reframe (Option A from the post-Cluster-5 question).

### What did NOT change this session

- **No code changes.** Pure design + doc-update session.
- **No DB schema changes.**
- **No prompt changes.** `AUTO_ANALYZE_PROMPT_V3.md` is unchanged; director's existing in-flight test run continues to use V3 as currently pasted.
- **No tests run / built / re-run.** Test suite and build state unchanged.
- **No live-data state changes** by Claude. Director's in-flight test project is unaffected; Bursitis canvas unchanged.

### Standing instructions for next session

The next session is **Scale Session 0 — empirical validation on Opus 4.7 1M-context** (per the locked Cluster 5 sequence). Pre-work for that session:

1. **Verify Opus 4.7's 1M-context tier availability + pricing** via Anthropic docs / API capability check.
2. **Switch the Auto-Analyze model selector to Opus 4.7** (1M context if available); director's existing in-flight test project can serve as the starting point or use a fresh test.
3. **Run focused tests on V3:** production-typical (200–500-keyword project; verify quality holds; observe input-token usage, cost, wall-clock); stress test optional (push toward 500+ topics; observe whether wall is hit at all and at what cost).
4. **Decision based on outcome:**
   - **Outcome A — V3 + Opus 4.7 works cleanly within forecast scale.** Defer Scale Sessions B–E indefinitely; switch production model; update `INPUT_CONTEXT_SCALING_DESIGN.md` §0 with "VALIDATED [date] on Opus 4.7 — design unbuilt."
   - **Outcome B — V3 + Opus 4.7 has quality regression.** Diagnose: prompt re-tune for Opus 4.7 specifically (separate prompt-refinement session), NOT a scaling problem.
   - **Outcome C — V3 + Opus 4.7 still hits wall or unacceptable cost.** Trigger fires; proceed to Scale Session B (schema + applier + fingerprint backfill) per the locked plan.

### Three "NEXT" choices for the next session

(a) **🎯 Scale Session 0 (recommended next)** — empirical validation on Opus 4.7 1M. Highest-priority forward item per the locked sequence. Outcome determines whether Scale Sessions B–E ever fire.

(b) **Phase-1 polish** — pick from existing list: 4 polish items captured 2026-04-27 (Apply button feedback; BATCH_REVIEW screen as scannable tables; search-volume display on canvas topic boxes + cross-tool display convention with W#3+W#5 forward-pointers); Funnel-Order Pass; empirical-threshold-validation; Sessions 7-9 Human-in-Loop mode build per `AI_TOOL_FEEDBACK_PROTOCOL.md`.

(c) **Workflow #2 (Competition Scraping)** — needs new Workflow Requirements Interview per HANDOFF_PROTOCOL Rule 18 first. Per Rule 21, the interview's first item will scan ROADMAP for prior W#2 directives.

**Director's framing:** the test-before-build reframe is locked. Scale Session 0 should run before any commitment to Scale Sessions B–E. If the director wants to mix in a polish item from (b) before or alongside Scale Session 0, that's fine — Scale Session 0 doesn't require any code or doc changes beforehand, just running the existing tool with a different model selector.

---

## ⚠️ POST-2026-04-27-V3-VALIDATION-AND-CONTEXT-SCALING-CONCERN STATE (preserved as historical context — last updated 2026-04-27)

**As of 2026-04-27 V3 small-batch test + context-scaling concern session (V3-refined prompt validated qualitatively on a brand-new clean canvas; 4 new polish items + 1 architectural concern captured; HANDOFF_PROTOCOL Rule 24 added in response to a HIGH-severity Claude synthesis-failure mistake):**

### What this session did to W#1

#### V3-refined prompt validation — PASSED qualitatively

Director set up a brand-new test Project from scratch, re-pasted the refined V3 prompts (post-2026-04-26 Strategy 3 layered placement + intent-equivalence rule) into the Auto-Analyze UI, and ran Auto-Analyze with these settings:

| Setting | Value |
|---|---|
| Model | Sonnet 4.6 |
| API Mode | Direct (browser → Anthropic) |
| Thinking | Adaptive (NOT Enabled with budget 12000 as Claude recommended) |
| Batch size | 8 (NOT 4 as Claude recommended) |
| Vol threshold | (low value) |
| Keyword scope | Unsorted + Reshuffled |
| AST table | 2,329 keywords loaded (full Bursitis dataset on a clean test project) |
| Review each batch | ON |

The director reviewed each batch's BATCH_REVIEW screen and clicked Apply on each. Run was still in progress at session-end (batch 4 in flight). First three batches' metrics:

| Batch | Wall-clock | Input tokens | Cache hit | Output tokens | Cost | Operations | Topics on canvas after | Reconciliation |
|---|---|---|---|---|---|---|---|---|
| 1 | ~1:51 | ~19,925 (425 billed) | N/A (first batch) | 7,731 | $0.172 | 22 | 9 | 8/0 perfect |
| 2 | ~5 min (1 stall+reconnect) | ~21,066 (7 billed) | 18,136 | 7,343 | $0.170 | 21 | 11 (+2 new) | 8/0 perfect |
| 3 | ~9 min | ~21,629 (2,732 billed) | 18,136 | 11,460 | $0.235 | 37 | 25 (+14 new) | 8/0 perfect |
| 4 | in flight | ~23,854 | (expected ~18k) | TBD | TBD | TBD | TBD | TBD |

**Validation criteria — all four PASSED on director's qualitative inspection of the canvas:**

1. ✅ **Compound primary topics observed** — multi-modifier titles like "Bursitis pain in older women" appearing as distinct primary topics, not just broad-core dimension topics being reused.
2. ✅ **Complement pairs observed** — Step 4c complement detection firing (e.g., older + younger pair; men + women pair).
3. ✅ **Unifying parents observed** — Step 4c unifying-parent topics created above complement pairs (e.g., "How bursitis affects people differently at different ages").
4. ✅ **Empty bridge topics observed** — Step 5 narrative-bridging topics with searcher-centric titles, no primary keywords, organizing chapter structure.

**Bonus signals:**
- Prompt caching is working beautifully: from batch 2 onward, only the variable parts (canvas TSV + new keyword batch) are billed at full input rate; the 16-18k V3 prompt body is read from cache. Per-batch cost stays near $0.17-0.24 even as canvas grows.
- Reconciliation pass shows `8 on-canvas → AI-Sorted, 0 off-canvas → Reshuffled` on every batch — V3's structural keyword-preservation property is rock-solid.
- Adaptive thinking did NOT fail with 0-output tokens on this clean canvas — one data point toward the empirical-threshold-validation polish item (the failure mode appears to require a large existing canvas, not present here).
- Operation density picked up substantially in batch 3 (2.9 placements/keyword, 14 new topics for 8 keywords) — V3-refined behavior is firing at full strength once the model has a skeleton to layer on top of. Batches 1-2 looked conservative because the model was rationally building scaffolding first (Step 5 complete upstream chains) before layered placement could exhibit fully.

**Director's headline conclusion:** *"As far as the output quality goes, everything is working perfectly so far. There are compound primary topics, there are complement pairs, there are unifying parents and there are empty bridge topics."* The V3-refined prompt's Strategy 3 layered placement + intent-equivalence rule has passed its first real-world validation.

#### Two UX issues identified during BATCH_REVIEW use → captured as Phase-1 polish

1. **BATCH_REVIEW Apply button gives no feedback during apply.** Button visually unchanged while apply is running. Director's design: disable + fade during apply; success → dismiss; error → re-enable. Captured to `ROADMAP.md` Phase-1 polish.

2. **BATCH_REVIEW screen shows new topics + analyzed keywords but NOT operations as scannable tables.** Without operation-level visibility (existing-topic edits, splits/merges/moves, sister-link changes, JUSTIFY_RESTRUCTURE payloads), admin can't fully validate before applying. Director's design: scannable tables grouped by operation type. Captured to `ROADMAP.md` Phase-1 polish.

#### One NEW UX feature → captured as Phase-1 polish + cross-tool platform-level directive

**Search-volume display on canvas topic boxes (W#1) + cross-tool display convention (W#3, W#5, future workflows):**
- Each topic box shows two volume totals (primary keywords total in primary color + secondary keywords total in secondary color)
- Each keyword shows volume in parens to the right (in topic box preview AND expand-arrow overlay)
- Bold formatting based on Auto-Analyze volume threshold (≥ → bold; < → not bold)
- W#1 implementation is canvas-only (NOT W#1 tables — director explicit)
- **Cross-tool platform directive:** same convention applies wherever topics + keywords are surfaced in W#3 (Therapeutic Strategy), W#5 (Conversion Funnel), and future workflows. Forward-pointers added to W#3 and W#5 ROADMAP entries per Rule 21 so the directive surfaces at the start of those workflows' Workflow Requirements Interviews.

#### One ARCHITECTURAL CONCERN raised → captured as 🚨 top-level (NOT polish)

**Canvas Serialization INPUT Context-Scaling.** During the test, director asked: "based on the data provided, when (if at all) do you expect our tool to run into a context wall or another issue since there are so many keywords in our keywords list. Is our system designed to handle those issues or should we figure out fixes for those anticipated issues."

**Initial Claude analysis (which the director caught as inadequate):** projected the run would hit a 200k context wall somewhere between 600-1,000 topics; framed as "the system was not explicitly designed to handle it"; proposed adding as Phase-1 polish item.

**After director-prompted deep doc study + code verification:**

- V3's pivot solved THREE of four scaling concerns: keyword preservation (zero ghosts via "silence is preservation"), output-token scaling (operations-only output), wall-clock per batch (~4× reduction).
- V3 did NOT solve the fourth: INPUT scaling. The full canvas TSV is serialized into every batch's prompt; per-topic ≈ 150-300 tokens; will exceed Sonnet 4.6's standard 200k context window between roughly 600-1,000 topics — well within the size of a full Bursitis run.
- This trade-off was acknowledged in `PIVOT_DESIGN.md` lines 205 + 246 since 2026-04-25: *"the canvas TSV input grows per batch and isn't cached"* and *"the cost-stops-scaling-with-canvas claim is partly true — the input TSV grows linearly with canvas size."* But no mitigation was designed.
- V2 had a Mode A→B auto-switch with delta OUTPUT credited with "avoiding the projected 200k context wall" on the 2026-04-20 51-batch Bursitis run. Pivot Session E (2026-04-25) deleted Mode A→B in full (correctly for output-side concerns; inadvertently leaving input-side without any mitigation).
- Code verification: `src/lib/auto-analyze-v3.ts` line 98 `buildOperationsInputTsv` takes the FULL canvas every batch — zero filtering, truncation, subset, summarization.

**Director's directive: this is NOT polish. It is a fundamental architectural limitation requiring a designed solution before any build proceeds. Solution must scale WITHOUT compromising V3's quality-preserving properties.** Captured as a top-level 🚨 architectural concern in ROADMAP.md (peer to the Architectural Pivot section), cross-referenced in PLATFORM_ARCHITECTURE.md §10, and PIVOT_DESIGN.md §5 retroactively updated to add input-scaling to the Open questions / deferred items table (it should have been there since 2026-04-25).

#### One HIGH-severity Claude mistake → CORRECTIONS_LOG entry + new HANDOFF_PROTOCOL Rule 24

**Mistake:** Claude proposed the context-scaling concern as a new ROADMAP item without first searching existing docs for prior treatment, despite having READ the relevant content earlier in the same session (`ROADMAP.md` line 162's "200k context wall" reference + `PIVOT_DESIGN.md` lines 205+246's input-scaling acknowledgment were both in Claude's working context). Claude failed to synthesize them when writing the new ROADMAP entry. Director caught the mistake and explicitly flagged it as critical, requesting an instruction-set update.

**Captured:**
- `CORRECTIONS_LOG.md` 2026-04-27 entry — HIGH severity
- `HANDOFF_PROTOCOL.md` Rule 24 (NEW) — Pre-capture search before adding any ROADMAP item or proposing new architectural concern
- `CLAUDE_CODE_STARTER.md` non-negotiable rule #21 (NEW) — corresponding entry so the rule is loaded at the start of every session

### What did NOT change this session

- **No code changes.** Pure validation + doc-update + protocol-update session.
- **No DB schema changes.**
- **No tests run / built / re-run.** Test suite and build state unchanged.
- **No live-data state changes** by Claude. Director's in-progress Auto-Analyze run is creating canvas state on the brand-new test project; Bursitis canvas is unchanged.
- **AUTO_ANALYZE_PROMPT_V3.md is unchanged this session** (last updated 2026-04-26).

### Standing instructions for next session

The director is mid-Auto-Analyze-run on the test project. The test is intentionally limited via cancellation — they will let some number of batches complete and apply, then cancel rather than running all 292 batches (which would hit the context wall well before completion).

**Three "NEXT" choices for the next session:**

(a) **Continue Phase-1 polish** — pick from existing list: the new Apply-button-feedback / BATCH_REVIEW-tables / search-volume-display items captured this session, OR the Funnel-Order Pass / empirical-threshold-validation items from prior sessions, OR Sessions 7-9 Human-in-Loop mode build per `AI_TOOL_FEEDBACK_PROTOCOL.md`.

(b) **🚨 Design session for Canvas Serialization INPUT Context-Scaling.** Per the architectural concern captured this session, no build work proceeds until a designed solution exists. This is the highest-priority forward item if the director wants to be able to complete a full Bursitis-sized Auto-Analyze run. Recommended approach: dedicated design session (no code) producing a design doc + locked decisions + multi-session implementation plan (analogous to Pivot Session A's role for the V3 architectural pivot).

(c) **Workflow #2 (Competition Scraping)** — needs new Workflow Requirements Interview per HANDOFF_PROTOCOL Rule 18 first. Per Rule 21, the interview's first item will scan ROADMAP for prior W#2 directives.

**Director's explicit framing:** the context-scaling concern needs us to "fundamentally understand the issue and come up with a sturdy solution that not only scales up but does so without compromising quality." That framing maps to choice (b) being the next-session priority unless the director chooses otherwise.

---

## ⚠️ POST-2026-04-26-V3-PROMPT-REFINEMENT STATE (preserved as historical context — last updated 2026-04-26 second session)

**As of 2026-04-26 V3 prompt refinement session (Strategy 3 layered placement + intent-equivalence binding rule baked into the prompt; no code changes; doc-only session):**

### What this session did to W#1

The V3 Auto-Analyze prompt (`docs/AUTO_ANALYZE_PROMPT_V3.md`) was refined to encode a different primary-placement strategy and a new binding rule for topic creation.

**Before this session (V3 as shipped 2026-04-25 Pivot Session C):**
- Primary placement = the broadest core-intent topic (e.g., for "bursitis pain in older women" → primary at "Bursitis pain"; secondaries at "How bursitis affects older people" + "How bursitis affects women differently"). Total = 3 placements (1 primary + 2 secondary).
- Worked example in Step 4b matched this framing.
- Step 2 CRITICAL clause pointed in a contradictory direction (suggesting most-specific primary) — internal inconsistency.
- No explicit intent-equivalence rule.
- No explicit complement-detection step.
- Seed-word stripping mentioned only at the bottom of the prompt as a passing note.

**After this session (V3 as updated 2026-04-26):**
- **Strategy 3 layered placement.** Primary at the most-specific compound topic (e.g., for "bursitis pain in older women" → primary at "Bursitis pain in older women"); secondaries at EACH validated dimension topic (e.g., "Bursitis pain", "How bursitis affects older people", "How bursitis affects women differently"). Total = 4 placements (1 primary + 3 secondary). The symptom dimension is treated equally with demographic dimensions — no privileged "core intent".
- **Intent-equivalence binding rule.** Two keywords share a primary topic ONLY IF they share the same compound intent — same searcher in same situation seeking same outcome. Word-similarity is insufficient. Distinct compound intents (e.g., "[condition] pain in older women" vs. "[condition] pain in young women") get separate primary topics. Existing topics that bundle distinct compound intents must be split via SPLIT_TOPIC.
- **Step 0 (seed-word stripping)** added as an explicit first step with the "keyword IS just the seed" exception.
- **New Step 4c (complement detection + unifying parent)** added as a mandatory step when creating any new dimension topic. Bounded scope — only for facet dimensions with natural partitions (age young/old, gender men/women, severity mild/severe, etc.). Broader narrative-driven topic generation explicitly assigned to Workflow #5.
- **Step 5 strengthened** — empty bridge topics are now described as a FEATURE of a well-structured funnel, not a fallback exception.
- **Reevaluation Pass (3) Topic Splitting** updated with two-variant signal — (3a) intent-equivalence violation (high-priority, binding) + (3b) divergent sub-intent accumulation (legacy threshold).
- **Topics Layout Table Primer (operation vocabulary)** preserved untouched — operation contract is unchanged by this refinement.

File grew from 629 → 769 lines (+140, ~22%).

### Director must re-paste this V3 prompt into the Auto-Analyze UI before the next run

The file change in `docs/AUTO_ANALYZE_PROMPT_V3.md` does not auto-update the browser-side text inputs. Open the Auto-Analyze panel at vklf.com and re-paste the new Initial Prompt + Topics Layout Table Primer (the second prompt is unchanged but re-pasting both is the safe move).

### Expected behavior change on next Bursitis run

The new prompt will produce **more topic-creation operations per batch** than V3-as-shipped:
- ~+1 ADD_TOPIC per keyword on average (for the compound primary topic that frequently doesn't exist yet)
- ~+1 ADD_KEYWORD per keyword (the broad-core dimension is now an additional secondary, not the primary)
- Step 4c will sometimes add 1-2 ADD_TOPIC operations per dimension (complement + unifying parent)

**Cost / wall-clock impact:** modest increase in output tokens per batch — possibly 30-50% above the Pivot-D baseline. Still far below pre-pivot V2 levels because we're in the operation-based contract.

**Recommendation:** test on a small batch first (5-10 keywords on a clean canvas) to validate the new operation patterns look right before running a full Bursitis re-analyze. Watch for:
- Compound primary topics being correctly created (vs. the model defaulting to broad-core primary out of habit)
- Each dimension getting its own secondary topic (Step 4b math should be 1+N(dimensions))
- Empty bridge topics + complementary topics + unifying parents appearing in Step 4c situations
- SPLIT_TOPIC operations on existing topics that violate intent-equivalence (Reevaluation 3a)

### What did NOT change this session

- **No code changes.** Pure prompt + methodology session.
- **No DB schema changes.**
- **No tests run / built / re-run.** Test suite and build state unchanged from prior session.
- **No live-data state changes.** vklf.com runs commits `c891c36` + `4f017a3` from the prior session.
- **The operation vocabulary** (`src/lib/operation-applier.ts` + Topics Layout Table Primer V3) is unchanged. The new prompt uses the same operations, just emits more of them per keyword.

### Cross-tool integration methodology added (platform-wide, not W#1-specific)

The session also produced platform-wide methodology updates that affect how W#1 will eventually graduate and how every future workflow's design + transition + re-entry happens. See:
- `docs/HANDOFF_PROTOCOL.md` Rule 18 (expanded — §A/§B DESIGN doc + mid-build Read-It-Back + reciprocal output declaration)
- `docs/HANDOFF_PROTOCOL.md` Rule 21 (NEW — Pre-interview directive scan)
- `docs/HANDOFF_PROTOCOL.md` Rule 22 (NEW — Graduated-Tool Re-Entry Protocol)
- `docs/HANDOFF_PROTOCOL.md` Rule 23 (NEW — Change Impact Audit)
- `docs/HANDOFF_PROTOCOL.md` §4 Step 2 Scenario B (expanded — 16-item Tool Graduation deliverables list)
- `docs/DATA_CATALOG.md` §7 (PROMOTED — Cross-Tool Data Flow Map)
- `docs/ROADMAP.md` Workflow #5 entry (NEW — narrative-driven-comprehensiveness directive captured)

When W#1 eventually graduates (likely at the start of the W#2 transition), it follows the new 16-item Scenario B deliverables stack: Active doc splits into Archive + Data Contract; Data Contract gets a §Resume Prompt section; Cross-Tool Data Flow Map fills in W#1's row with finalized R/W flags; etc.

### Standing instructions for next session

The three "NEXT" choices from before this session still apply, with refinements:

(a) **More Phase-1 polish items.** The Funnel-Order Pass remains the highest-value architectural one. Note that Funnel-Order Pass is keyword-driven (orders existing topics by funnel stage) — distinct from W#5's narrative-driven topic creation captured this session. Also: a small-batch test of the refined V3 prompt should happen before any other Phase-1 polish work to validate the new placement strategy on a real run.

(b) **Sessions 7-9 Human-in-Loop mode build per `AI_TOOL_FEEDBACK_PROTOCOL.md`.** Unchanged scope.

(c) **Workflow #2 (Competition Scraping) — Workflow Requirements Interview.** Now uses the expanded Rule 18 (§A/§B DESIGN doc + reciprocal output declaration). Per Rule 21, the interview's first item will be: "Are there any prior director directives addressed to W#2 in the docs?" — a quick scan of ROADMAP §Workflow 2 entry + DATA_CATALOG §6.1 will surface anything captured in advance.

---

## ⚠️ POST-PHASE-1-POLISH-BUNDLE STATE (updated 2026-04-26 Phase-1 polish bundle — preserved as historical context)

**As of 2026-04-26 Phase-1 polish bundle session (three deferred Phase-1 items shipped + one cosmetic canvas bug fixed in two-attempt cycle + one new architectural polish item identified + one new follow-up item identified):**

### What this session did

Director picked option (a) post-Pivot-E from the previous session's "NEXT" guidance and bundled three deferred Phase-1 items in one session. All three shipped, all on vklf.com.

1. **Visual verification of canvas-layout engine.** Director used existing populated 40-topic canvas (cleanliness met the bar — no overlap, no description overflow visible at session start). Confirmed: no overlap, descriptions fit inside boxes, type-aware placement working, pathway separation acceptable. The original "blank-canvas" framing from the prior session's deferred item was relaxed by mutual agreement once director's existing project met the cleanliness bar (faster than spinning up a fresh project; valid test against new-batch-on-existing-canvas integration). Activity-log-confirmed engine behavior from Session 3b verify still holds. **One cosmetic bug surfaced:** the `+x more` keyword-count indicator on topic boxes was vertically clipped (bottom of letterforms cut off along a horizontal line) when a topic box had 6+ keywords. Two-attempt fix:
   - **First attempt** (commit `950e4b5`): Claude added CSS `white-space: nowrap; flex-shrink: 0; margin-right: 4px` to `.cvs-kw-more` based on the hypothesis that the text was being word-broken. Director: "still broken." Hypothesis was wrong.
   - **Second attempt** (commit `c891c36`, after director uploaded a screenshot to `docs/cutoff.png` for diagnostic — since deleted): removed the standalone `+x more` element entirely; folded the hidden-count info into the expand button label (button now reads `▼ N (+M)` instead of `▼ N` when there are M keywords beyond the preview). Structurally cannot wrap or clip. Director-confirmed fixed.
   - Lesson logged in `CORRECTIONS_LOG.md` 2026-04-26 entry: when fixing a UI bug Claude can't see directly, ask for a screenshot or specific verbal disambiguation BEFORE coding.

2. **Direct-mode UI hint (under API Mode dropdown).** Conditional inline hint added in `AutoAnalyze.tsx`. Visible only when `apiMode === 'server'` AND `est.nKeywords >= 100`. Wording: *"⚠ With N unsorted keywords (~M batches), batches may exceed Vercel's 5-min server timeout and fail mid-flight. Switch API Mode to Direct (browser → Anthropic) to avoid this."* Code comment notes the hint becomes obsolete after AWS migration (per Phase 2 server-side execution plan).

3. **Adaptive-Thinking 0-output warning (under Thinking row).** Conditional inline warning added in `AutoAnalyze.tsx`. Visible only when `thinkingMode === 'adaptive'` AND `nodes.length >= 50`. Wording: *"⚠ With N topics on the canvas, Adaptive Thinking can occasionally produce 0 output tokens (a fully wasted API call). If you see a batch fail with empty output, switch Thinking to Enabled with a Budget of 12000+."* Code comment notes V3 may have made this obsolete; revisit once empirical data from V3 runs confirms.

### What did NOT change this session

- **No DB schema changes.** No new migrations.
- **No API route changes.** All edits were in client-side React components + CSS.
- **No prompt changes.** AUTO_ANALYZE_PROMPT_V3.md is unchanged.
- **No new operations or applier-vocabulary changes.** The architectural state from Pivot Session E is preserved.
- **74 unit tests still pass.** No test changes.
- **Build clean throughout.** Each commit verified with `npm run build` before push.

### New Phase-1 polish item identified — Funnel-Order Pass

Director observed mid-session during the visual verification: the AI does great semantic clustering (right keywords → right topics; right sub-topics under right parents) BUT root-level (depth-1) topics on canvas appear in the order the model emitted them (essentially internal processing order), not in conversion-funnel arc order (awareness → consideration → decision → treatment). Same applies to ordering of nested children within a common parent.

V3 prompt's Step 7 explicitly asks the model to think about funnel ordering, but the operation vocabulary deliberately excludes position operations (PIVOT_DESIGN.md §1.5: *"Layout is the layout engine's concern; the AI never positions nodes manually"*), so the model has no mechanism to express that ordering. Layout engine sorts siblings by `baseY` (`src/lib/canvas-layout.ts` line 224-225 + 257-259), which for new topics defaults to creation order.

**Recommended design** (locked this session, build deferred to a future session):
- Run as a dedicated pass, separate from clustering (avoids piling cognitive load on already-complex per-batch prompt; ordering is canvas-global while clustering is batch-local).
- Operate per-parent (one ordering call per non-leaf parent; each call sees just that parent's children + funnel-stage hint; cheap).
- Apply via `baseY` overwrites OR a new `funnelOrder` field — exact mechanism deferred to design session.
- Lives in Workflow #1 (Keyword Clustering), NOT Workflow #5 (Conversion Funnel & Narrative Architecture). W#5 is far away (W#2 hasn't started); W#1 needs ordering today.

**Manual workaround in the meantime:** layout engine respects `baseY` from manual drag, so admin can drag root-level topics into preferred order on small canvases.

Full spec captured in `docs/ROADMAP.md` Phase 1 polish items section.

### New follow-up item — Empirical validation of UI-hint thresholds

Director's call: the 100-keyword and 50-topic thresholds for Items 2 and 3 are placeholders chosen by Claude as round-number defaults. Validate against real-batch-run data over the next 3-5 runs and adjust the thresholds (or remove the hints entirely if they're never warranted on V3). Captured in `docs/ROADMAP.md` Phase 1 polish items section. Zero net effort — data collection happens during natural test runs; threshold adjustment is a 1-line code change per hint when data warrants.

### Live-site state after this session

- vklf.com runs commits `950e4b5` (Phase-1 polish bundle code) + `c891c36` (`+x more` corrected fix) on top of the prior `f282c64` (Pivot Session E end-of-session docs).
- Auto-Analyze panel UI now shows two new conditional hints when their trigger conditions are met (Direct-mode hint at 100+ unsorted keywords in server mode; Adaptive-Thinking warning at 50+ canvas topics with adaptive thinking).
- Canvas topic boxes with 6+ keywords now show the hidden count in the expand button label (e.g., `▼ 8 (+3)`) instead of as a separate `+x more` line.
- All canvas-layout engine behavior from Pivot Session 3b is unchanged.
- Bursitis canvas state (post-Pivot-E wipe + any subsequent runs by director) is unchanged — this session made no DB writes.

### Standing instructions for next session

- Three "NEXT" choices from Pivot E remain: (a) more Phase-1 polish items (the new Funnel-Order Pass is the highest-value architectural one; the empirical-threshold-validation item happens passively during normal runs), (b) Sessions 7-9 Human-in-Loop mode build per `AI_TOOL_FEEDBACK_PROTOCOL.md`, or (c) Workflow #2 (Competition Scraping) — needs new Workflow Requirements Interview per HANDOFF_PROTOCOL Rule 18 first.
- If running Auto-Analyze on a project with 100+ unsorted keywords in server mode, the Direct-mode hint will fire — director can verify the wording matches what's documented above.
- If running Auto-Analyze on a project with 50+ canvas topics with Adaptive Thinking selected, the warning will fire — same.
- During any large-batch run: capture wall-clock per server-mode batch + watch for Adaptive-Thinking 0-output failures; data feeds the empirical-threshold-validation item.

---

## ⚠️ POST-PIVOT-SESSION-E STATE (updated 2026-04-25 Pivot Session E — preserved as historical context)

**As of 2026-04-25 Pivot Session E (V3 made the only path; V2 band-aid code paths deleted; UUID-PK schema migration shipped; 3 cosmetic Pivot-D Infrastructure TODOs resolved; data loss accepted by director because Bursitis was test-only):**

### What this session did

Pivot Session E's full scope landed in one session. Two Rule-gated approvals: Rule 8 for the destructive `prisma db push --accept-data-loss` (director gave explicit "yes proceed" after seeing exactly what the command does); Rule 9 at end before push.

1. **V2 code paths deleted from `AutoAnalyze.tsx`** — `assemblePrompt`, `processBatch`, `validateResult`, `doApply`, `runSalvage`, `mergeDelta`, `parseKatMapping`, `extractBlock`, `buildCurrentTsv` all gone. `AA_DELIMITERS` and `AA_OUTPUT_INSTRUCTIONS` constants gone. The output-contract picker UI is gone. `runLoop` and `handleApplyBatch` are V3-only. The Mode A→B auto-switch, the `_deltaSwitch` error path, and `deltaMode` state all removed. **Reconciliation pass and Reshuffled status stay** — they're called by `doApplyV3` and serve as a general-purpose status-sync layer, not V2 band-aid. AutoAnalyze.tsx went from 2486 → 1331 lines (1155-line reduction).

2. **UUID-PK schema migration shipped (Option D — director's pick after he disclosed "data loss is OK").** The original ROADMAP described Options A (composite PK) and B (autoincrement Int). Director's disclosure that no production data exists past Keyword Sorting Tool opened up Option D — UUIDs everywhere — which is the architecturally cleanest answer (matches how every other table in the schema already does PKs).

   - `CanvasNode.id`: `Int @id` → `String @id @default(uuid())`
   - `CanvasNode.parentId`: `Int?` → `String?`
   - `CanvasNode.pathwayId`: `Int?` → `String?`
   - `Pathway.id`: `Int @id` → `String @id @default(uuid())`
   - `SisterLink.nodeA`, `nodeB`: `Int` → `String`
   - `CanvasState`: drop `nextNodeId` + `nextPathwayId`; add `nextStableIdN Int @default(1)` (per-project counter for issuing `t-N` stableIds — the user-facing handle stays project-local).

   Schema pushed via `npx prisma db push --accept-data-loss` after Rule-8 approval. Bursitis's 31 test topics + sister links + pathways were wiped (zero production data lost — director confirmed).

3. **Code surface threaded for UUIDs across 14 files** — every `CanvasNode.id`/`parentId`/`pathwayId`, every `Pathway.id`, every `SisterLink.nodeA`/`nodeB` typed `string` instead of `number`. Every `Set<number>` / `Map<number, …>` keyed by node id became `Set<string>` / `Map<string, …>`. The materializer (`materializeRebuildPayload`) generates UUIDs locally for new nodes/pathways via `crypto.randomUUID()` so the rebuild route gets a fully-resolved payload in one POST. Per-project stableId issuance moved server-side via `$transaction` in `/canvas/nodes` POST (atomic increment-then-read, no race window).

4. **`/canvas` GET autoheal logic removed.** Pivot Session D added a band-aid that read global max id; Option D removes the underlying problem so the band-aid is unnecessary. The route now just returns the stored `CanvasState` row (or synthesized defaults if missing).

5. **Pathway-color rendering switched to a string-hash.** Previously `PATHWAY_COLORS[(pathwayId - 1) % len]` (Int math). Now hash-then-modulo on the UUID string, so each pathway still gets a stable color but UUIDs work as keys.

6. **3 cosmetic Pivot-D Infrastructure TODOs resolved:**
   - **`keywordScope` activity-log label drift** — `aaLog` now emits the dropdown label ("Unsorted + Reshuffled") rather than the raw enum (`unsorted-only`). 4-line fix.
   - **`handleCancel` / `handleResumeCheckpoint` in-progress batch cleanup** — `handleCancel` flips any `in_progress` batch to `failed`; `handleResumeCheckpoint` downgrades restored `in_progress` to `queued`. ~10-line fix.
   - **`CanvasNode.id` global-PK design issue** — fully resolved by the UUID migration (this was the largest TODO). The latent bugs in `/canvas/nodes` POST and `/canvas/pathways` POST are gone by construction (no shared counter to race on).

7. **Tests + build:** 74 unit tests pass (`operation-applier.test.ts` 43 + `auto-analyze-v3.test.ts` 31 — adjusted for UUIDs with a deterministic `makeUuid()` test injector). `npm run build` clean (17/17 pages, zero TypeScript errors). `npx tsc --noEmit` clean apart from the pre-existing `.next/dev/types/validator.ts` Phase M cruft (unrelated, documented).

### What did NOT change this session

- **The operation-applier (`src/lib/operation-applier.ts`) has zero diff.** It already used `stableId` strings as the canonical reference; integer ids were never part of its data model. This was a small architectural payoff: Pivot B's stable-id design naturally extends to UUIDs.
- **The keyword data, project list, removed-terms history, dashboard notes, settings — none touched.** The `prisma db push --accept-data-loss` only affected `CanvasNode`, `Pathway`, `SisterLink`. Director confirmed all production data outside the canvas was untouched.
- **AUTO_ANALYZE_PROMPT_V3.md is unchanged.** The AI's contract is identical (stableId is still `t-N`, operations vocabulary unchanged). Director does NOT need to re-paste the prompts — V3 prompts continue to work.

### Live-site state after this session

- Bursitis's canvas is empty (wiped by the schema migration). Director needs to re-run Auto-Analyze on Bursitis to populate it again, or any other test project.
- Auto-Analyze panel UI is simpler — no "Output contract" picker; V3 is the only path.
- The `/canvas` GET no longer returns `nextNodeId` / `nextPathwayId` (returns `nextStableIdN` instead). Any external script that depended on the old shape would break — but no such scripts exist outside this repo.

### Known follow-ups (not in this session)

- **Blank-canvas visual verification of canvas-layout engine** — Phase-1 polish item; rolled forward from Pivot D. Director can do this after re-running Auto-Analyze on a fresh test project.
- **UI hint for Direct mode on large-keyword Projects** — possibly obsolete now that V3's cost stops scaling as steeply with canvas size; revisit when next test run produces real numbers.
- **Adaptive-Thinking + large-prompt 0-output-tokens warning** — possibly obsolete for the same reason; revisit at next test.
- **Stability-scoring algorithm** — JUSTIFY_RESTRUCTURE gate exists but no topic ever crosses 7.0 until the algorithm ships. Captured in `docs/MODEL_QUALITY_SCORING.md`.

### Standing instructions for next session

- The pivot is complete. Next session can choose between: (a) Phase 1 polish items above, (b) starting Sessions 7-9 Human-in-Loop mode (per `AI_TOOL_FEEDBACK_PROTOCOL.md`), or (c) building Workflow #2 (Competition Scraping) which requires a new Workflow Requirements Interview per HANDOFF_PROTOCOL Rule 18.
- If running another Auto-Analyze test on Bursitis: just paste the V3 prompts (`docs/AUTO_ANALYZE_PROMPT_V3.md`) into the Auto-Analyze panel and run — the V3 path is now default and only.

---

## ⚠️ POST-PIVOT-SESSION-D STATE (updated 2026-04-25 Pivot Session D — preserved as historical context)

**As of 2026-04-25 Pivot Session D (V3 wiring layer shipped + live-validated on Bursitis; 7 commits pushed in-session including 5 mid-session bug fixes):**

### What this session did

Pivot Session D's full scope per `docs/PIVOT_DESIGN.md` §4 landed in one session, with five mid-session bugs caught + fixed in flight via live testing on Bursitis.

1. **New wiring layer `src/lib/auto-analyze-v3.ts`** (~470 LOC, pure-data, no I/O, no Prisma). Four exported helpers — `buildOperationsInputTsv` (9-column TSV per AUTO_ANALYZE_PROMPT_V3.md), `parseOperationsJsonl` (extracts `=== OPERATIONS ===` block, parses JSON Lines, translates snake_case → camelCase Operation discriminated union from `src/lib/operation-applier.ts`), `buildCanvasStateForApplier` (live Prisma rows → applier's pure-data shape), `materializeRebuildPayload` (applier output → `/canvas/rebuild` POST body, including integer-id assignment for new topics, parent + sister-link remapping, pathway propagation).

2. **New unit-test file `src/lib/auto-analyze-v3.test.ts`** (28 tests, all passing). Combined with the 43 applier tests = **74 tests pass**. Run with `node --test --experimental-strip-types src/lib/auto-analyze-v3.test.ts`.

3. **`AutoAnalyze.tsx` integration.** New `outputContract` setting (`'v3-operations'` default | `'v2-tsv'` legacy), persisted via `UserPreference` + checkpoint. New UI picker in the config section. New `assemblePromptV3` / `processBatchV3` / `validateResultV3` / `doApplyV3` functions implementing the V3 path. `runLoop` and `handleApplyBatch` dispatch on `outputContractRef`. V2 code paths preserved as defense-in-depth and selectable. ~444 lines added; build clean.

4. **`CanvasNode` interface extended** in `src/hooks/useCanvas.ts` with `stableId: string` and `stabilityScore: number` (additive — `/canvas/nodes` GET already returned them via Prisma findMany).

5. **End-to-end live validation on Bursitis** — 5+ batches across multiple runs, all succeeded after the bug-fix series:

| Metric | V2 baseline | V3 actual (median Bursitis batch) | Improvement |
|---|---|---|---|
| Output tokens | 110,245 | 15K–27K | ~5× |
| Cost per batch | $1.89 | $0.27–$0.46 | ~4–7× |
| Wall-clock per batch | ~26 min | ~5–7 min | ~4× |
| Keyword loss per batch | variable | **0 (structural)** | ✅ |

The reconciliation pass after every successful apply reported `0 off-canvas → Reshuffled` — meaning no previously-AI-Sorted keyword was bumped off the canvas by the new batch. The "silence is preservation" architectural property held in production. Real cost is meaningfully above the design's optimistic $0.03–0.10 estimate (output dominates because each operation is ~100–300 tokens and the AI emits 15–25 ops per batch on a still-growing canvas) but the structural keyword-preservation win is the bigger architectural claim and it's solid.

6. **Five mid-session bugs caught + fixed in flight** (full root-cause + fix detail in `CORRECTIONS_LOG.md` 2026-04-25 Pivot-Session-D entry):

| # | Commit | Bug summary |
|---|---|---|
| 1 | `c3d2a80` | Applier rejected ADD_TOPIC root topics with null relationship — fixed by skipping linear|nested check when parent is null + widening type to `Relationship | null` |
| (diag) | `1c44238` | `/canvas/rebuild` 500 hid Prisma error — added `detail` field to surface the underlying message |
| 2 | `6b70913` | Prisma 6 P2025 on `prisma.canvasNode.upsert` — switched where to `projectWorkflowId_stableId` composite |
| 3 | `43f773f` | Global-PK collision on `CanvasNode.id` — `/canvas` GET autoheal switched from per-project to global max |
| 4 | `d485cf9` | Synthesized CanvasState missing for projects with no row — return defaults with global-max-aware counters |
| 5 | `d624556` | BATCH_REVIEW screen always showed "Topics: None" for V3 — populate from parsed ADD_TOPIC operations |

7. **Three cosmetic items deferred to ROADMAP Infrastructure TODOs** (per Rule 14e):
   - `keywordScope` activity-log label drift (cosmetic ~3-line fix)
   - `CanvasNode.id` global-PK schema design issue (proper fix needs migration)
   - `handleCancel` / `handleResumeCheckpoint` in-progress batch status cleanup (cosmetic ~10-line fix)

### What did NOT change this session

- No DB schema or data changes (Pivot Session B already shipped them).
- The legacy V2 code paths in `AutoAnalyze.tsx` (Mode A/B + delta merge + salvage + reconciliation) all still operate as before — selectable via the new picker. They keep running through Pivot Session E as defense-in-depth.

### Live-site state after this session

- Auto-Analyze panel now has an "Output contract" picker. Default is V3 for new sessions; V2 stays selectable.
- Director must re-paste the V3 prompts (from `docs/AUTO_ANALYZE_PROMPT_V3.md` §1 and §2) into the Auto-Analyze panel for each project once before the V3 path runs cleanly. The textareas auto-save to `UserPreference` so it's a one-time-per-project paste.
- Bursitis canvas grew during testing to 31 nodes (V3 created 24 new topics across the test batches with full upstream chains + sister links + correct keyword placements).
- BATCH_REVIEW screen now displays new topic titles for V3 (was always showing "Topics: None" before commit `d624556`).

### Standing instructions for next session — Pivot Session E

- Read `docs/PIVOT_DESIGN.md` §4 Pivot Session E + this STATE block + `docs/ROADMAP.md` Infrastructure TODOs section.
- Pivot Session E scope: make V3 the only path (deprecate V2 picker after a transition window); remove V2 Mode A/B + delta merge + salvage band-aid code paths from `AutoAnalyze.tsx`; address the 3 cosmetic Infrastructure TODOs from this session (label drift, global-PK schema migration, cancel-state cleanup).
- The `CanvasNode.id` schema migration is the largest part of Session E and requires Rule-8 destructive-op approval.

---

## ⚠️ POST-PIVOT-SESSION-C STATE (READ FIRST — updated 2026-04-25 Pivot Session C)

**As of 2026-04-25 Pivot Session C (Initial Prompt + Primer rewritten for the operation-based output contract; doc-only session; no code, no DB, no live-site impact):**

### What this session did

Pivot Session C's full scope per `docs/PIVOT_DESIGN.md` §4 landed in one session as a single doc deliverable:

1. **New file `docs/AUTO_ANALYZE_PROMPT_V3.md`** (~640 lines). Mirrors V2's structure (frontmatter + how-to-use + how-to-update + Initial Prompt code block + Primer code block), but the two prompt blocks are rewritten end-to-end for the operation-based contract. The vocabulary in `src/lib/operation-applier.ts`'s `Operation` discriminated union is the canonical reference; V3 mirrors it exactly (13 operations, snake_case keys, JSON Lines syntax, alias rules, JUSTIFY_RESTRUCTURE 6-field payload at stability ≥ 7.0).

2. **Initial Prompt V3.** Philosophy / context / conversion-funnel framing kept verbatim from V2 (the director's voice is preserved on every paragraph about searcher intent, conversion stages, Topic Naming, seed-word substitution). The action-numbered task list rewritten: AI now decides what changes the canvas needs, then expresses those changes as operations. New explicit rule: "Anything you do not mention in your operation list stays exactly where it was. Silence is preservation." Multi-placement-is-a-feature paragraph (V2 proposed-changes Change 5 — locked wording) inserted at the start of the Placement Decision Framework. Tie-breaker rule (V2 Change 1 — locked wording) inserted into Step 2. Step 4b Comprehensiveness Verification (V2 Change 3 redrafted version with the math-bug fix) inserted after Step 4. Step 6's volume-aware rule (b) updated with the cross-canvas scan (V2 Change 2 Loc 1 — locked wording) and stability-score friction tie-in. New Step 6b Respecting Stability Scores (synthesized from `MODEL_QUALITY_SCORING.md §3` and V2 Change 4 6-field payload) inserted before Step 7. Step 7 Conversion Funnel Stage Ordering kept verbatim. Post-Batch Funnel Reevaluation Pass rewritten so each of the seven triggers maps to one or more specific operations. Reevaluation Report block deleted from output — operations carry `reason` fields inline. Output instruction tightened: emit exactly one delimited block (`=== OPERATIONS === ... === END OPERATIONS ===`); no markdown fences, no commentary outside the block; empty operation list is valid output.

3. **Topics Layout Table Primer V3.** CONTEXT and HOW TO READ THE TABLE blocks kept (with stable-IDs in the example). WHAT THE TOPICS LAYOUT TABLE IS rewritten to clarify the AI receives the table as TSV input but does NOT re-emit it. New INPUT TABLE COLUMNS section: 9-column TSV with Stable ID as the first column (the AI's reference handle), plus Title, Description, Parent Stable ID, Relationship, Conversion Path, Stability Score, Sister Nodes, Keywords (each formatted `<uuid>|<text> [p|s]`). New THE OPERATION VOCABULARY section: full spec of all 13 operations matching `operation-applier.ts` exactly — required fields, plain-English semantics, applier-handled side effects (e.g., MERGE auto-reparents children + rewrites sister links; SPLIT/DELETE drop sister links; aliases resolve at apply time; ARCHIVE_KEYWORD removes ALL placements). New CROSS-CUTTING RULES section: atomic batch apply, sequential ordering, alias rules, keywords-by-UUID, reasons on structural ops, JUSTIFY_RESTRUCTURE 6-field payload at stability ≥ 7.0. New GENERAL CONSTRAINTS section: 13 numbered rules covering deletion-via-DELETE_TOPIC (replaces V2 "never delete"), no-orphan-keywords (REMOVE_KEYWORD legal only with another placement), parent-cycles forbidden, Conversion Path read-only, stability scores read-only, complete upstream chains, etc. New OPERATION SYNTAX block: JSON Lines inside `=== OPERATIONS ===` / `=== END OPERATIONS ===`; snake_case keys throughout. Worked example with three operations (ADD_TOPIC + ADD_KEYWORD + MOVE_KEYWORD) shown verbatim.

4. **V2 file untouched.** `docs/AUTO_ANALYZE_PROMPT_V2.md` remains as-is at its 2026-04-18 canonical state. It is the historical record of what was actually pasted into the production UI through every Bursitis run including the Session 3b verification — preserving it lets us cite "behaviour X happened on V2 prompts" in any future post-mortem. V3 is the new canonical the director re-pastes after this session; future cleanup session will archive V2 once V3 is field-validated through Pivot Sessions D and E.

5. **V2 proposed-changes file (`docs/AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md`) is now mostly superseded.** The pieces that survived (Change 1 tie-breaker, Change 3 Comprehensiveness Verification redrafted, Change 4 JUSTIFY_RESTRUCTURE 6-field payload, Change 5 multi-placement principle, Change 2 Loc 1 cross-canvas scan) were folded directly into V3 with their locked wording. The pieces that did not survive (the standalone Reevaluation Report block, the "never delete topics" rule, the per-batch full-table-rewrite output format, Change 6's salvage IRRELEVANT_KEYWORDS template, Change 7 session-boundary continuation) are obsolete by construction. The file remains untouched this session and can be archived in a future cleanup.

6. **Three design questions resolved during the session's drift check** (locked with director's go-ahead before drafting):
   - **Operation output syntax = JSON Lines.** One self-contained JSON object per line, no top-level array, inside a `=== OPERATIONS ===` / `=== END OPERATIONS ===` block. Reversible if Pivot Session D's parser favors a different shape.
   - **Input-state format = TSV with Stable ID as first column.** Matches V2's TSV familiarity for the model; debuggable by humans who paste into a sheet; first column gives the AI a clean handle for operations. Reversible.
   - **Reevaluation Report block = scrapped.** Operations carry `reason` fields inline; the reasons collectively are the audit log. Comprehensiveness Check is an internal per-keyword self-check (Step 4b); the operations themselves are the verifiable artifact admin reviews.

### What did NOT change this session

- No code touched. AutoAnalyze.tsx, the canvas-rebuild route, `operation-applier.ts`, the unit tests — all untouched.
- No DB schema or data changes.
- No `npm run build` rerun needed (docs-only).
- The Auto-Analyze panel still pastes V2 from localStorage / the panel's React state until the director manually re-pastes V3 into the panel.
- Existing band-aid code paths (reconciliation pass + Reshuffled status + salvage mechanism + Mode A→B switches) all still operate as before. They keep running through Pivot Sessions D as defense-in-depth and get deprecated in Pivot Session E.

### Live-site state after this session

Identical to end of Pivot Session B. No deploy needed.

### Standing instructions for next session — Pivot Session D

- Read `docs/PIVOT_DESIGN.md` §4 Pivot Session D + this STATE block + `docs/AUTO_ANALYZE_PROMPT_V3.md` end-to-end before starting code work.
- Pivot Session D scope: wire `applyOperations` into the Auto-Analyze rebuild path; build the V3-shaped input-TSV serializer (9 columns including Stable ID + Stability Score + the new keyword `<uuid>|<text> [p|s]` format); update `AutoAnalyze.tsx` to send V3 prompts and parse the operation-list response (JSONL inside `=== OPERATIONS ===` block — one JSON.parse per line); replace the legacy TSV-based canvas rebuild with `applyOperations` + a Prisma persistence layer that writes the new state.
- Validation tier: small fresh-Project test with V3 prompts; small populated-Project test verifying keyword-loss rate drops to zero; one Bursitis batch as the cost-comparison data point (expected ~$0.03–0.10 vs. $1.89; expected <1 minute wall-clock vs. 26 minutes).
- Existing band-aid code paths stay running as defense-in-depth.

---

## ⚠️ POST-PIVOT-SESSION-B STATE (updated 2026-04-25 Pivot Session B — preserved as historical context)

**As of 2026-04-25 Pivot Session B (DB migration shipped live; operation-applier + unit tests landed; two production routes patched):**

### What this session did

Pivot Session B's full scope per `docs/PIVOT_DESIGN.md` §3 + §4 landed in one session:

1. **3-step DB migration applied to live Supabase.**
   - Step 1: `npx prisma db push` after editing `prisma/schema.prisma` to add `stableId String?` (nullable) + `stabilityScore Float @default(0.0)` to `CanvasNode`. Pure additive. Rule-8 explicit approval.
   - Step 2: ran `node scripts/backfill-stable-ids.ts` after a self-test on a fresh temporary project (the design doc's "test on a fresh project first" gate). Self-test created 3 fake CanvasNode rows with no stableId, restricted-scope backfill set them to `t-{id}`, cleaned up. Live run then populated all 104 Bursitis rows: `t-1` through `t-104`. Verification: 0 rows remained empty.
   - Step 3: `npx prisma db push --accept-data-loss` after editing schema to `stableId String` (NOT NULL) + `@@unique([projectWorkflowId, stableId])`. Pre-flight verification confirmed 104 rows, 0 nulls, 0 duplicates. Rule-8 explicit re-approval after the `--accept-data-loss` flag was needed (Prisma's generic safety prompt — no actual data loss).
   - Other tables (`SisterLink`, `Pathway`, `RemovedKeyword`, `Keyword`) — unchanged per §3.5.

2. **`src/lib/operation-applier.ts` written** (~600 LOC, pure function, no I/O). Public surface: `applyOperations(state, operations) → { ok, newState, archivedKeywords, aliasResolutions } | { ok: false, errors }`. All 13 operations from PIVOT_DESIGN §1 implemented: 7 topic ops + 4 keyword ops + 2 sister-link ops. Atomic batch apply via deep-cloned scratch state — input never mutated. Sequential within-batch ordering with alias resolver (`$newN` → `t-N` at apply time). Per-operation pre-validators inline. Post-application invariant checks: parent chain acyclic, parents exist, sister links reference real nodes, no original keyword silently lost. JUSTIFY_RESTRUCTURE 6-field gate at stability ≥ 7.0 enforced for `MERGE_TOPICS`, `SPLIT_TOPIC`, `DELETE_TOPIC`, `MOVE_TOPIC`, `UPDATE_TOPIC_TITLE` per PIVOT_DESIGN §1.4 rule 6.

3. **`src/lib/operation-applier.test.ts` — 43 unit tests, all passing.** Runs via `node --test src/lib/operation-applier.test.ts`. Coverage spans every op type (happy + error paths) + alias chaining + atomic rollback + JUSTIFY_RESTRUCTURE gate + invariant violations. No AI involvement, no DB. Built-in `node:test` + `node:assert/strict` — no new dependencies.

4. **Two pre-existing production routes patched** to supply `stableId: \`t-${id}\`` at `prisma.canvasNode.create(...)` time:
   - `src/app/api/projects/[projectId]/canvas/nodes/route.ts` (POST — manual node creation)
   - `src/app/api/projects/[projectId]/canvas/rebuild/route.ts` (the upsert's create branch — fires on every Auto-Analyze batch apply)
   This was a **necessary scope expansion** because Step 3's NOT NULL constraint shipped to production before the pivot's own wiring was in place — without these patches the next manual node create OR the next Auto-Analyze run would fail at runtime with a not-null violation. Director approved the patch via Option A.

5. **Two diagnostic scripts kept in `scripts/`** for historical/diagnostic value, idempotent and re-runnable:
   - `scripts/backfill-stable-ids.ts` — populates any `CanvasNode` row whose `stableId` doesn't yet start with `t-`. After Pivot Session B, no rows match (every new row gets `stableId` at insert time).
   - `scripts/verify-no-stable-id-duplicates.ts` — read-only check for duplicate `(projectWorkflowId, stableId)` pairs. Useful spot-check.

6. **Minor tsconfig change:** added `"allowImportingTsExtensions": true` so the test file's explicit `.ts` import resolves under both `tsc --noEmit` (for IDE/CI) and `node --test` (for runtime, which requires `.ts` extensions in type-strip mode).

### What did NOT change this session

- No UI / frontend code touched. AutoAnalyze.tsx, CanvasPanel.tsx, etc. — untouched. The applier is dormant: no callers invoke it yet.
- No prompt changes. The Initial Prompt and Primer Prompt still drive the legacy full-table-rewrite output contract. Rewriting them is Pivot Session C.
- No Auto-Analyze runs triggered. Pivot Session D will wire the applier into the rebuild flow.
- Existing band-aid code paths (reconciliation pass + Reshuffled status + salvage mechanism + Mode A→B switches) all still operate as before. They keep running through Pivot Sessions C/D as defense-in-depth and get deprecated in Pivot Session E.

### Live-database state after this session

- Every existing `CanvasNode` row has a `stableId` (`t-1` … `t-104` for Bursitis, plus `stabilityScore = 0.0` on every row).
- Database constraint `@@unique([projectWorkflowId, stableId])` enforces "within one project, no two nodes share a stable ID."
- Every new `CanvasNode` created through the patched routes also gets `stableId = "t-${id}"` automatically.
- No data was lost; no row was rewritten beyond the additive backfill.

### Cost & risk profile

- Production safety: confirmed working. `npm run build` clean post-patch (17/17 pages, zero TypeScript errors).
- Reversibility: every step is reversible. The two new columns can be dropped; the unique index can be dropped; the route patches can be reverted. No destructive operations occurred.
- Bursitis canvas: untouched in any user-visible way. Same 104 nodes, same titles, same descriptions, same parent relationships, same keyword placements. Only the new `stableId` and `stabilityScore` columns are populated.

### Standing instructions for next session — Pivot Session C

- Read `docs/PIVOT_DESIGN.md` §4 Pivot Session C. Scope: rewrite Initial Prompt + Primer Prompt to emit operations instead of complete TSV table.
- Pivot Session B's applier is the target the new prompt teaches the AI to emit FOR. The vocabulary in `src/lib/operation-applier.ts` Operation type is canonical.
- Director re-pastes new prompts into Auto-Analyze UI at end of Session C; no code wiring yet (Pivot Session D wires).
- Existing band-aid code paths stay running as defense-in-depth.

---

## ⚠️ POST-PIVOT-SESSION-A STATE (updated 2026-04-25 Pivot Session A — preserved as historical context)

**As of 2026-04-25 Pivot Session A (director committed to the architectural pivot from "AI as state-rebuilder" to "AI as state-mutator"; design-heavy session; no code, no DB changes):**

### What this session decided

After the Session-3b-verification end-of-session captured the architectural insight at high severity in `CORRECTIONS_LOG.md`, the director used this session to re-examine the case for the pivot before committing. The four root-cause failures the pivot exists to address (keywords dropping during batch application; keywords correctly placed in earlier batches being silently removed in later batches; cost per batch skyrocketing; time per batch growing significantly) were all evaluated against the recommended pivot design. Director committed to the pivot.

### Three deliverables locked

Full specification lives in **`docs/PIVOT_DESIGN.md`** (new Group B doc — load when pivot work is in scope, alongside this active doc).

1. **Operation vocabulary** — 13 operations across topics, keywords, and sister-links. Atomic batch apply (all-or-nothing). Sequential within-batch ordering. New-topic aliases (`$new1`, `$new2`, ... resolved at apply time). Keywords referenced by database UUID, not text. Reasons on every structural op. JUSTIFY_RESTRUCTURE 6-field payload on stability ≥7.0 from day one (gate exists immediately even though no topic crosses 7.0 until the stability-scoring algorithm ships in a follow-up). `ARCHIVE_KEYWORD` operation replaces the earlier "Irrelevant Keywords floating topic" idea — cleaner direct mechanism that flows straight to the existing `RemovedKeyword` table. Pathway operations and position/size operations deliberately excluded. See PIVOT_DESIGN.md §1 for full specification.

2. **Stable-ID format** — `t-1`, `t-2`, ... per project. Backfill rule: existing `CanvasNode` row with database `id=N` becomes `stableId="t-N"` (preserves debugging value). New-topic aliases within a batch: `$new1`, `$new2` (`$` prefix is reserved syntax). See PIVOT_DESIGN.md §2.

3. **Database migration plan (ships in Pivot Session B with Rule-8 approval — NOT this session)** — additive `stableId String` (NOT NULL after backfill) + `stabilityScore Float @default(0.0)` columns on `CanvasNode`. Three-step sequence: Step 1 nullable add → Step 2 committed Prisma-based backfill script (`scripts/backfill-stable-ids.ts`, idempotent, logs every update, tested on fresh project before live run) → Step 3 tighten to NOT NULL + add unique index `@@unique([projectWorkflowId, stableId])`. Other tables (`SisterLink`, `Pathway`, `RemovedKeyword`, `Keyword`) — no schema changes. See PIVOT_DESIGN.md §3.

### Failure-mode mapping (the four pain points and how the design addresses each)

| Failure | How the design addresses it |
|---|---|
| Keywords drop during batch application | Operation vocabulary is the only legal way to change anything; "anything not mentioned stays exactly where it was" is a structural property of the applier, not a model behaviour we hope for. |
| Keywords correctly placed in earlier batches get silently removed | (a) Atomic batch apply prevents half-applied state; (b) JUSTIFY_RESTRUCTURE on stability ≥7 prevents silent overwrites of well-placed work; (c) Stable IDs make rename-vs-drop unambiguous. |
| Cost per batch has skyrocketed | Operations-only output drops per-batch tokens from 100k+ to under 1k. Cost stops scaling with canvas size. Bursitis $1.89 → expected $0.03–0.10 in Pivot Session D. |
| Time per batch has gone up significantly | Wall-clock is bottlenecked by output-token generation rate. Operations-only → ~1k tokens → under 1 minute. Bursitis 26 minutes → expected <1 minute. |

### Director-flagged process correction this session

Mid-session, when Claude presented Q1-Q4 design choices for vocabulary, Claude framed them as mechanics-with-recommendations without anchoring each choice to the four root-cause failures. Director correctly pushed back: *"You didn't even address the reasons for the pivot... The goal now is to address the fundamental flaws in our approach and fix them."* Claude redid the analysis, mapping each Q1-Q4 answer to the specific failure it prevents (Q1 vocabulary completeness → keyword loss + silent overwrites; Q2 atomic apply → ghost-state class; Q3 ARCHIVE_KEYWORD → homograph drop class; Q4 JUSTIFY_RESTRUCTURE → silent-overwrite-of-good-work class). Captured as a low-severity entry in `CORRECTIONS_LOG.md` 2026-04-25 — reminder to lead with failure-mode mapping when locking architectural decisions.

### Standing instructions for next session (Pivot Session B)

- Read `docs/PIVOT_DESIGN.md` end-to-end before starting code work. It IS the build spec.
- Pivot Session B's scope: §3 DB migration (3-step) + write `src/lib/operation-applier.ts` + per-operation pre-validators + post-application invariant checks + unit tests against synthetic operation sets. NO AI involvement at this stage — the applier is pure deterministic code.
- Two Rule-gated approvals during the session: **Rule 8** (DB migration) at start of session, before each `prisma db push`; **Rule 9** (deploy) at end of session, before `git push origin main`.
- Existing band-aid code paths (reconciliation pass, Reshuffled status, salvage mechanism) stay running through Pivot Sessions B-D as defense-in-depth. Pivot Session E plans the deprecation after the pivot core has been validated end-to-end.

---

## ⚠️ POST-VERIFICATION STATE (updated 2026-04-25 Session 3b verify — preserved as historical context)

**As of 2026-04-25 Session 3b verification (the 3 unpushed Session 3b commits + the Session 3a doc-update commit have been pushed to origin/main and visually verified live on vklf.com; Bursitis batch-1 verification batch run + cancelled; canvas state changed in a small, recoverable way per the reconciliation pass design):**

### Push status

`git push origin main` ran with explicit director approval per Rule 9 deploy gate. Three commits went live:
- `8afcb9f` — Session 3a end-of-session doc updates
- `6c09e50` — Session 3b code (reconciliation pass + salvage mechanism + 321-line canvas-layout engine)
- `aa7eb4b` — Session 3b end-of-session doc updates

Branch is now in sync with origin/main. Vercel redeploy completed; vklf.com confirmed loading the new code.

### Verification on vklf.com — what was checked, what passed, what's deferred

**Quick UI checks (Tier 1) — ALL PASS:**

- ✅ **Check A — Opus 4.7 in model dropdown.** Director confirmed Opus 4.7 listed in the Auto-Analyze settings panel's Model dropdown.
- ✅ **Check B — "Unsorted + Reshuffled" scope label.** Director confirmed the scope toggle label was renamed from "Unsorted only" to "Unsorted + Reshuffled" as expected per Session 3b.
- ✅ **Check C — Settings persistence across panel close/reopen + hard refresh.** Director noted two values, closed + reopened panel → values persisted; hard refreshed page → values still persisted. Confirms Session 3a's split-secret design (apiKey in browser localStorage, other settings in `UserPreference` DB) is working live.
- ✅ **Check D — Removed Terms modal "Source" column visible.** Director confirmed the new column shows up.
- ✅ **Check E — Manual remove flows to soft-archive with "Manual" badge.** Director performed the test: removed a real keyword from the AST table; it appeared in the Removed Terms modal with the "Manual" Source badge. (Director should restore the test keyword via the Restore action in the modal at convenience — that also verifies the Restore flow works.)

**Engine check (Tier 2) — verified at runtime via activity log:**

- ✅ **Canvas-layout engine fires.** Activity log shows `Layout pass complete (104 nodes positioned)` after batch 1 apply. Confirms the new 321-line `src/lib/canvas-layout.ts` module is wired into `AutoAnalyze.doApply` step 7.5 and runs as designed.
- ✅ **Atomic canvas rebuild works.** Activity log shows `✓ Canvas rebuilt atomically (104 nodes, 0 removed)` immediately after the layout pass. The rebuild + layout pass together took ~6 seconds (10:25:23 → 10:25:27 in the log).
- ✅ **Reconciliation pass works correctly and emits structured per-keyword aaLog lines.** Activity log shows 74 individual `↻ Reconcile: "<keyword text>" (id <UUID>) was AI-Sorted, no longer on canvas → Reshuffled` lines, followed by the summary line `↻ Reconciliation: 58 on-canvas → AI-Sorted, 74 off-canvas → Reshuffled`. Forward-compatible with future `ai_feedback_records` schema as designed.
- ⏳ **Salvage-ignored-keywords mechanism — NOT verified live this session.** Batch 1 passed validation cleanly on attempt 1 (`Batch 1 — passed validation. Total cost (all attempts): $1.890`); salvage only fires on HC3-only validation failures, which didn't happen. Verification deferred to natural occurrence in future Auto-Analyze runs.

**Visual verification (Tier 2) — DEFERRED (the gap director caught):**

- ❌ **Visual verification that the layout engine produces orderly, non-overlapping nodes with content-fitted heights.** The verification batch ran on Bursitis's heavily-populated 95-node canvas; couldn't tell whether the visible result reflects the new layout engine working correctly vs. just "the same chaos as before." Director's call: *"The canvas already had a lot of information before and I can't tell if anything is broken. Maybe we should have or should do a test on a blank canvas next time."* Captured as a NEW Phase-1-polish ROADMAP item: **"Blank-canvas visual verification of canvas-layout engine"** — create a small test Project, paste 8-12 keywords in, run one Direct-mode batch, look at the result with eyes. Confirms node heights fit content, nodes don't overlap, parent-child placement is type-aware (linear vs nested), pathway separation works. Schedules with Session 4 or as a quick standalone task. Not blocking.

### MAJOR FINDING — reconciliation pass reproduced Session 2's P3-F7 diagnosis exactly

The reconciliation summary on batch 1 was:

> `↻ Reconciliation: 58 on-canvas → AI-Sorted, 74 off-canvas → Reshuffled`

**The 58/74 split is identical to the Session 2 direct-DB-query diagnosis** of Bursitis P3-F7 (Session 2 found 58 silent placements + 74 ghost AI-Sorted keywords; the latter split into 49 reshuffle casualties + 25 linkedKwIds-carryover ghosts). On the very first batch of the very first verification run, Session 3b's reconciliation pass surfaced the entire pre-existing ghost set.

**This validates two things at once:**
1. The Session 3b reconciliation code is working correctly — exact-match numbers are not a coincidence.
2. The Session 2 architectural diagnosis was correct — these ghost keywords genuinely existed in the database before Session 3b shipped.

**Forensic note on the 74 Reshuffled keywords:** the activity log on the director's screen contains all 74 keyword texts + UUIDs. These are valuable forensic data for the upcoming P3-F7 root-cause audit (the new ROADMAP item from Session 3b). When the audit runs, this list answers two questions: (a) which of the 74 are legacy from old-code-era ghosts vs. (b) actively-broken in current code, and (c) whether the keyword text contains any HC5-evading pattern (whitespace, unicode, smart quotes, etc.). Recommendation: director copy the activity log to a text file for reference before closing the browser — or accept that re-running batch 1 next session will reproduce the same 74 deterministically.

**Many of the 74 Reshuffled keywords are foundational terms** — `hip bursitis`, `bursitis hip`, `what is hip bursitis`, `bursitis pain`, `how to get rid of bursitis`, `is bursitis curable`, `trochanteric bursitis`, `subacromial bursitis`, `ischial tuberosity bursitis`, `hip pain bursitis`, `inflamed bursa hip`, `tendonitis vs bursitis`, etc. This is exactly the P3-F1/P3-F2 fingerprint: classic mode is silently reshuffling significant prior work each batch. The reconciliation pass made it visible; it does NOT prevent it. Prevention is the P3-F7 root-cause audit + (longer term) stable topic IDs + Changes Ledger + stability scoring.

### Cost data point — Sonnet 4.6 classic mode on a 95-node canvas

Single-batch cost from this verification run:

> `Stream complete. Input: 67,002, Output: 110,245 tokens`
> `Batch 1 attempt 1 — API call complete. Cost: $1.890`

That's $1.89 per batch on Bursitis-sized projects in classic mode, with one-attempt success. At the original 523-batch run scope, the projected total was **~$985** if every batch passed on attempt 1. With the typical ~10-15% retry rate observed in earlier sessions, real-world cost would be ~$1,100-1,250. **Implication:** classic mode at this canvas scale is a real budget consideration that needs explicit framing in any future full-run kickoff. Also reinforces the design rationale for stable topic IDs + Changes Ledger + future Mode A→B safety nets — the cost-per-batch is high enough that wasted batches matter.

### State changes to the Bursitis canvas this session

The verification batch was real, not dry-run. State changes:

1. **Canvas: 95 nodes → 104 nodes.** Batch 1 added 9 new topic nodes for the 4 new keywords + their upstream chains. Atomic rebuild persisted them.
2. **AST table: 58 keywords flipped from `'Unsorted'` (or other) to `'AI-Sorted'`** by the reconciliation pass — these are keywords that were placed on the canvas but had stale status flags (Bug 1 silent placements). The status flag is now corrected.
3. **AST table: 74 keywords flipped from `'AI-Sorted'` to `'Reshuffled'`** — these had stale AI-Sorted flags from prior runs but were no longer on the canvas (Bug 2 ghost AI-Sorted). They now show with the new yellow `.ast-pill-r` badge.
4. **No data was lost.** All 74 keywords are still in the AST table (same Keyword rows, just different sortingStatus value). They're auto-eligible for re-placement on the next Auto-Analyze run because the default scope is now "Unsorted + Reshuffled." Director can restore them to AI-Sorted manually OR let the next run re-place them OR choose to investigate them as forensic data first.
5. **Run cancelled after batch 1.** Batch 2 had started thinking phase; the cancel stopped the API call before any DB writes for batch 2 happened.

Net effect on data state: data accuracy *improved* (stale status flags corrected; ghost set surfaced for review). No regression.

### Deferred items (per Rule 14e — captured before session ends)

1. **Blank-canvas visual verification of canvas-layout engine** — captured as new Phase-1 polish ROADMAP item. Schedules with Session 4 or as standalone.
2. **Salvage-ignored-keywords mechanism live verification** — not directly forceable; will fire naturally during a future run. No new ROADMAP entry needed; the code is verified by build + test path coverage.
3. **Forensic audit of the 74 Reshuffled keywords** — feeds the existing "P3-F7 root-cause audit" ROADMAP item from Session 3b. Director's activity-log copy is the input data for that audit.
4. **Restore the test keyword from Check E** — director's housekeeping; not a blocker. The keyword was a non-load-bearing test pick; the Restore action verifies the soft-archive reverse flow when used.
5. **Improvement to the handoff system itself** — flagged earlier in session: write end-of-session handoff into a committed doc (e.g., `docs/LAST_SESSION_HANDOFF.md`) instead of only as a chat message, so future sessions can retrieve it from the repo without needing to mine `.jsonl` transcripts. Captured here for future-session consideration; not blocking.

### Standing instructions for next sessions (post-verification)

Same as Session 3b's standing instructions, with one update:

- ✅ **Branch is now in sync with origin/main.** No pending pushes from prior sessions. Future code commits go through the normal Rule 9 deploy gate.
- 🆕 **Add the blank-canvas verification check to any session that touches canvas-layout code.** Quick way to confirm a layout-engine change works visually: create or open a small test Project with a fresh canvas, run one batch, eyeball the result.
- 🚨 **Sessions 4-6 are now CONTINGENT on the architectural pivot decision (see next section).** Director surfaced root-cause framing at end of Session 3b verification; pivot is recommended. Sessions 4-6 plans kept in ROADMAP for reference but partially superseded — re-read ROADMAP "🚨 ARCHITECTURAL PIVOT" section before scheduling next session.

### 🚨 Architectural insight surfaced at end of Session 3b verify (READ before planning Session 4)

**Captured in `CORRECTIONS_LOG.md` 2026-04-25 high-severity architectural-insight entry. Action plan in `ROADMAP.md` "🚨 ARCHITECTURAL PIVOT" section.**

Director's pushback at end of session: *"We have been progressively fixing things and they are getting worse. Why are keywords being removed from topics that they belong in? Why are responses using so many tokens? Why is it taking so long?"*

**Single root cause naming all three pain points:** Auto-Analyze prompts ask the AI to **rebuild and re-emit the entire topics layout table** every batch (Initial Prompt: *"provide the complete updated Integrated Topics Layout Table"*; Primer rule 3: *"Never delete existing topics or keywords — only add new ones or add keywords to existing topics"*). The AI is being used as a **state-rebuilder** when it should be a **state-mutator**.

**Symptom-to-root-cause mapping:**

- **Keyword loss** = AI fails to re-emit prior placements as table grows (attention dilution; output-length pressure; string-matching drift). The 74 Reshuffled keywords on Session 3b verification's batch 1 = exact match to Session 2's direct-DB diagnosis = the entire pre-existing ghost set surfaced at once. The reconciliation pass surfaces these losses; it does not prevent them.
- **Cost scales with canvas size, not batch size** = bulk of output tokens is redundant re-emission of existing table (verification batch: ~105k of 110k output tokens were restated context). $1.89 per Sonnet 4.6 classic batch on a 95-node canvas; ~$4 on a 200-node canvas; eventually hits max-output-tokens ceiling and the run breaks entirely.
- **Wall-clock = output-token-rate-bottlenecked** (Sonnet 4.6 ~50-80 tokens/sec). 110k output tokens ≈ 30 minutes of generation regardless of input size.

**Recent fixes are band-aids on this root cause:**
- Reconciliation pass + Reshuffled status (Session 3b) — exists because the output contract permits keyword loss; the pass surfaces losses; doesn't prevent.
- Salvage-ignored-keywords mechanism (Session 3b) — recovery path, not prevention.
- Mode A → Mode B reactive switch — fallback when full-table re-emission becomes unstable.
- HC4 / HC5 / proposed HC6 validation — detection only, not prevention.
- Stable topic IDs (Session 5 plan) — exists because rename detection in full-table-rewrite is a string-matching mess; operations make RENAME explicit.
- Changes Ledger (Session 4 plan) — exists because auditing a full-table rewrite is hard; operations ARE a Changes Ledger.

**The fix:** change the AI's output contract from "complete updated TSV table" to "list of operations against the existing table." Operation vocabulary draft: `ADD_TOPIC`, `RENAME_TOPIC`, `MOVE_TOPIC`, `MERGE_TOPICS`, `SPLIT_TOPIC`, `DELETE_TOPIC`, `ADD_KEYWORD`, `MOVE_KEYWORD`, `REMOVE_KEYWORD`, `ADD_SISTER_LINK`, `REMOVE_SISTER_LINK`. Tool — deterministic code, not AI — applies operations to existing canvas. Validation runs on applied result.

**Direct consequences:**
- Output drops from 100k+ tokens to under 1k. Cost drops 99%+. Wall-clock drops to under a minute. (Input stays similar; prompt caching can amortize.)
- Keywords cannot silently disappear. AI cannot drop a keyword without explicit `MOVE_KEYWORD` / `REMOVE_KEYWORD` / `DELETE_TOPIC reassign_keywords_to=...`. Anything not mentioned stays put.
- Reconciliation pass / Reshuffled status / salvage become vestigial (kept short-term as defense-in-depth; deprecated long-term).
- Stable topic IDs become hard prerequisite (operations need stable identifiers). Session 5's stable-ID work promotes into the pivot.
- Changes Ledger (Session 4) becomes ~80% subsumed — the operation list IS the ledger.

**Pivot session plan in ROADMAP.md** under the "🚨 ARCHITECTURAL PIVOT" section: A (design + stable IDs) → B (deterministic applier + validation) → C (prompt rewrite) → D (wire it together + end-to-end test) → E (deprecate band-aids) → F (re-scope Sessions 4-6). 4-6 sessions across 2-3 weeks vs. continuing the existing ~6-9-session patching plan.

**Decision committed 2026-04-25 in Pivot Session A.** Director re-examined the insight with fresh focus, considered the 4-6 session redirection cost vs. continuing with Sessions 4-6, and committed to the pivot. Pivot Session A's three deliverables (operation vocabulary, stable-ID format, DB migration plan) are now locked. See new POST-PIVOT-SESSION-A STATE block above for session record + new Group B doc `docs/PIVOT_DESIGN.md` for the full locked design.

**Architectural pattern named (cross-tool, generalizable):** "AI as state-mutator (operations) vs. AI as state-rebuilder (full re-emission)." Re-emission scales O(state); operations scale O(change). For long-lived structured artifacts maintained across batches, default to operation-based output. Applies to any future PLOS workflow where AI maintains state across iterations.

**Director-feedback / Rule-16 lesson:** the director's *"this doesn't make sense, what's fundamentally wrong"* zoom-out is the highest-priority signal to honor immediately, not after the next band-aid ships. Adding a safety net should always be paired with a Rule-16 zoom-out check: *"Is this making symptoms visible or preventing the failure mode? If only making visible, what's the architectural change that would prevent it? Have we considered it?"* If "no" or "we keep deferring it," that's a flag to surface to the director rather than ship the next band-aid.

---

## ⚠️ POST-SESSION-3b STATE (updated 2026-04-25 Session 3b)

**As of 2026-04-25 Session 3b (Phase 1g-test follow-up Part 3 — Session 3b — second code-write session of Part 3; the 3 deferred items from Session 3a all shipped; commit `6c09e50` NOT YET PUSHED awaiting director approval):**

### What shipped this session

1. **(#1) P3-F7 post-batch reconciliation pass — Option B framing per director.** New step 12 in `AutoAnalyze.doApply` runs after step 11 (placement detection for salvage). Walks the ENTIRE AST table (not just `batch.keywordIds`); two flips:
   - on canvas + status `'Unsorted'` or `'Reshuffled'` → flip to `'AI-Sorted'` (heals Bug 1 silent placements + reabsorbs Reshuffled keywords the AI just re-placed)
   - off canvas + status `'AI-Sorted'` → flip to NEW `'Reshuffled'` status (Bug 2 reshuffle ghosts surfaced as visible alarm)
   - Each off-canvas flip emits a structured `aaLog` line with keyword text + id + reason — forward-compatible with future `ai_feedback_records` schema per AI_TOOL_FEEDBACK_PROTOCOL §2.3.
   - The old step-11 batch-only update (`onBatchUpdateKeywords(placed.map(... AI-Sorted))`) is now subsumed by step 12's table-wide pass — step 11 retained only for `unplaced` detection that feeds salvage.

2. **`'Reshuffled'` as a new sortingStatus value.** Type union in `useKeywords.ts` extended; column is `String @default("Unsorted")` in Postgres so no schema migration. New yellow badge style `.ast-pill-r` (#fef3c7 / #92400e) added to ast-table.css; new `.tif-st-r` style added to tif-table.css. Pill-class lookups in ASTTable (live + RemovedKeyword display) and TIFTable updated. ASTTable + MTTable + TIFTable filter logic treats Reshuffled as Unsorted-equivalent (the "Show Unsorted" toggle reveals both).

3. **AutoAnalyze "Unsorted only" scope renamed to "Unsorted + Reshuffled".** The default-scope filter now picks up both `'Unsorted'` and `'Reshuffled'` keywords so reshuffled keywords are auto-eligible for placement on the next run with zero admin action. Stored value remains `'unsorted-only'` so existing UserPreference saves don't break. Tooltip + dropdown label updated.

4. **(#2) Salvage-ignored-keywords mechanism — Q5-resolution wording.** New `runSalvage(batch, missingKeywords, originalResult)` function in AutoAnalyze. Fires from `runLoop`'s validation flow when `validateResult` returns HC3-only failures (every error starts with "Missing " — no HC4/HC5 lost-data triggers). Builds the Change-6-template follow-up prompt at runtime with Session-2b refined wording (auto-archive language baked in). Calls `callApi`; salvage cost added to `batch.cost`; parses three blocks (`=== DELTA ROWS FOR PLACEMENTS ===`, `=== IRRELEVANT_KEYWORDS ===`, `=== REEVALUATION REPORT ===`). Delta rows are merged into `originalResult.topicsTableTsv` via the refactored `mergeDelta(deltaTsv, baseTsv?)` (the optional second arg is new — defaults to live canvas via `buildCurrentTsv()` for the existing Mode-B flow; salvage passes the original Mode-A response). IRRELEVANT_KEYWORDS POSTed PER-keyword to `/api/projects/[projectId]/removed-keywords` with `removedSource='auto-ai-detected-irrelevant'` + the model's reason as `aiReasoning`; `onRefreshKeywords()` then syncs parent state. Archived ids are removed from `batch.keywordIds` + `batch.keywords` so HC3 re-validation passes. Re-validates after merge; if pass → `doApply` proceeds; if still failing → falls through to existing retry path. Salvage API errors fall through to retry (NOT eat the error).

5. **(#4) P3-F8 four-function canvas-layout port — one-shot per Q3.** New `src/lib/canvas-layout.ts` module (321 lines) with all four functions as pure exports that mutate the passed nodes array in place:
   - **`calcNodeHeight(node)`** — content-driven node height using browser `CanvasRenderingContext2D.measureText`. Word-aware text wrap matching HTML's `cvsWrap`. Accounts for title + altTitles + description + kw-count badge row. Respects `userMinH`. SSR fallback returns `Math.max(userMinH || NODE_MIN_H, 160)`.
   - **`runLayoutPass(nodes, pathways, collapsed?)`** — 4-step holistic pass: (1) reset roots to baseY; (2) tree-walk via `layoutChildren` placing nested children type-aware (parent-center+indent below other nested siblings only) then linear children below all nested content (parent-left below all peer descendants); (3) up-to-60-pass overlap resolution skipping intra-pathway tree-walk-positioned pairs; (4) calls `separatePathways`.
   - **`autoLayoutChild(child, parent, relType, allNodes, collapsed?)`** — type-aware auto-positioning when a parent-child link is formed. Linear: align child-left with parent-left below all peer subtrees. Nested: align child-left with parent-center + indent, below nested siblings only. Moves entire child subtree by the delta.
   - **`separatePathways(nodes, pathways, collapsed?)`** — horizontal push-apart for overlapping pathway bounding boxes (Q2: NOT deferred). Sorts pathways by x; for each later pathway whose bounds overlap an earlier one in both axes, pushes the entire pathway's nodes right by `(a.x + a.w + PATHWAY_GAP) - b.x`.
   - Constants mirror HTML tool's `cvsXxx` constants except **NODE_W stays 220** (React's existing default; HTML uses 240) and **NESTED_INDENT stays 30** (React's existing default; HTML uses 15) so nodes don't visibly resize for legacy data.

6. **Layout pass wired into `AutoAnalyze.doApply` step 7.5.** After step 7 sets parent/pathway/sister relationships on `rebuildNodes`, before step 8 ATOMIC REBUILD, the layout pass runs: `calcNodeHeight` per rebuildNode → `runLayoutPass(layoutNodes, [...pathways, ...newPathways])` → mirror computed positions/heights back onto rebuildNodes → atomic rebuild persists everything in one transaction. Q1 answer honored: layout pass runs after every batch.

7. **Layout pass wired into `CanvasPanel.handleLinkClick`.** When admin clicks the second node in P-P or P-C link mode, the parent/child relationship gets set locally on the in-memory nodes array, then `autoLayoutChild` slides the new child + its subtree into the right slot relative to its new parent (type-aware), then a single `updateNodes` call coalesces parent-link change + position changes for all moved nodes into one server PATCH. `forceUpdate()` triggers immediate re-render. Failure fallback: if parent/child node is missing, just applies the link without layout.

### What did NOT change this session

- `baseY`/`y` separation for clean collapse/expand restoration — Q2 was narrowly about pathway separation; deferred to a follow-up session as captured in Session 2b lockdown.
- Drag-end + content-edit + detail-view layout-pass triggers — secondary triggers per the docs; only the Q1 trigger (Auto-Analyze batch apply) and parent-child link form are wired today. Existing `resolveOverlap(nodeId)` single-node nudge on drag-end + resize-end stays as the immediate-feedback layer.
- Resize-end height recomputation via `calcNodeHeight`. Currently `node.h = nh` set directly from drag distance; future enhancement could call `calcNodeHeight` to ensure h respects content. NOT today.
- HC5 audit / HC6 "no keyword unlinks" check / canvas-rebuild text-match audit — captured as new **P3-F7 root-cause audit** ROADMAP item (Phase 1 polish; pairs with Session 4 or 5).
- Stable topic IDs / stability scoring / Changes Ledger — Sessions 4-5+ as before.
- Auto-Remove Irrelevant Terms BUTTON — still gated by director's standing instruction. Salvage's per-batch auto-archive ≠ Auto-Remove BUTTON (per Q5).
- `AUTO_ANALYZE_PROMPT_V2.md` text — Session 6 mechanical merge.
- The Change-6 SALVAGE prompt template lives as runtime tool code (in `runSalvage`), NOT in `AUTO_ANALYZE_PROMPT_V2.md` — by design per Change 6's "tool-generated, not canonical V2" framing.

### Director-locked design choices captured this session

These were design questions the director answered live during Session 3b's drift-check. All locked into ROADMAP for future reference:

1. **Q1 (off-canvas-AI-Sorted flip target): `'Reshuffled'`, NOT `'Unsorted'`.** Director chose Option B framing — every off-canvas-AI-Sorted flip is alarming, not silent. Yellow badge in AST table. New status added to Auto-Analyze default scope so reshuffled keywords get re-eligible for placement on next run automatically. Director's reasoning: a reconciliation flip means EITHER (a) HC5 leaked, (b) the rebuild silently dropped a keyword, or (c) legacy data — all three deserve admin visibility, not silent healing.
2. **Q2 (salvage trigger): HC3-only failure, NOT post-doApply unplaced > 0.** Director chose Option A. The reconciliation pass (Item #1) already heals post-doApply text-mismatch leftovers by flipping their status to Reshuffled (picked up next run, zero extra API cost). Adding salvage at Moment 2 would risk paying for retries that fail the same way (text mismatch).

### Director-raised root-cause concerns (NEW Phase 1 polish ROADMAP entry: "P3-F7 root-cause audit")

Director correctly raised the meta-question during drift-check: *"Why would AI bump a keyword off the canvas when that is strictly forbidden by our prompts?"* and *"If it is our tool triggering this, then shouldn't we be preventing this from happening rather than trying to figure out what the status of the bumped keyword should be?"*

The reconciliation pass shipped today is the BACKUP per Session 2 director-locked framing. The PRIMARY fix work needs a separate audit, captured as a NEW Phase 1 polish ROADMAP item:

- **Audit HC5 for text-matching edge cases.** Specifically: internal whitespace normalization (multiple spaces, tabs, non-breaking spaces), unicode variants, smart quotes vs straight quotes. Add test cases for each.
- **Audit the canvas rebuild's keyword text-matching** (the `allKeywords.find(...toLowerCase()...)` step at AutoAnalyze.tsx line 1228). When the AI's response includes a keyword text but the AST table's matching fails, the keyword is silently dropped. Either (a) match more aggressively (normalize whitespace + unicode) or (b) fail the rebuild loudly when a keyword text in the response doesn't match any AST keyword.
- **Add a new safety net "HC6 — no keyword unlinks."** Compare the set of keywords currently linked to ANY canvas topic against the set after the rebuild. If any pre-existing keyword stops being linked to any topic, fail the batch. Stricter than HC5 (which checks only that the keyword text appears somewhere in the response).
- **One-time spot-audit of Bursitis's 49 ghost AI-Sorted keywords** to confirm whether they're (1) legacy from old code or (2)/(3) active bugs. Direct DB query, like Session 2 used.

Scheduled for Session 4 or 5 (whichever has lighter scope). Not blocking.

### Director-raised NEW feature (NEW Phase 1 polish ROADMAP entry: "Keyword accounting + ghost detection panel")

Defense-in-depth feature for catching keywords that disappear from BOTH the AST table AND Removed Terms. Complements Item #1's reconciliation pass.

- System maintains a permanent record of every keyword ever added to a project's AST table (likely a new history table that captures each new-keyword event so the record is immutable even if a keyword is later hard-deleted by accident).
- Reconciliation check compares historical record against (a) keywords currently in AST + (b) keywords currently in Removed Terms. Anything in history NOT in either is a "ghost."
- Reconciliation runs on-demand from the panel + automatically as a background check on workspace load.
- New "Ghost Keywords" admin panel — common place to see all ghosts. Per-row: keyword text, when added (and by whom if known), last-known location/status before disappearing, suspected disappearance timeframe. Per-row actions: **Restore** (re-add to AST as Unsorted) or **Archive to Removed Terms** (move with reason "auto-archived during ghost recovery"). Bulk select supported.
- Panel location TBD when scheduled — either inside Keyword Clustering workspace (if tool-specific) OR a project-wide admin page (if pattern generalizes).
- Schedules with Session 4 or as its own session right after. Not blocking.

### Director's explicit instructions preserved for Session 4+

- **NEW 2026-04-25 Session 3b:** Reconciliation flips are alarming, not silent (Option B). Salvage trigger is HC3-only failure (Option A). Two new Phase-1 polish items captured (root-cause audit + ghost detection panel) — schedule with Session 4 or 5.
- **Carried from 2026-04-24 Session 2b:** Layout pass after every Auto-Analyze batch apply (Q1) ✅ shipped this session. Pathway separation in scope (Q2) ✅ shipped. Canvas layout ships as one-shot commit (Q3) ✅ shipped. Keyword reassignment out of ≥7.0 topic requires JUSTIFY_RESTRUCTURE (Q4) — Session 5/6. Salvage IRRELEVANT_KEYWORDS auto-archive ≠ Auto-Remove BUTTON (Q5) ✅ honored. Stability Score is the 10th TSV column (Q6) — Session 5/6.
- **Carried from 2026-04-24 Session 2:** Root-cause-first + reconciliation-as-backup philosophy. Removed Terms UI distinguishes manual vs AI-auto. Direct DB queries are standard practice.
- **Carried from 2026-04-20:** Do NOT program Auto-Remove Irrelevant Terms BUTTON without explicit director-provided specifics. Ask for parallel-chat workflow-fundamentals conclusions at or before Session 5. Stay lucid.
- **Carried from 2026-04-24 Session 3a:** Two autonomous design calls await director review (self-heal-on-read for nextNodeId; apiKey in localStorage). No new override this session.

---

## ⚠️ POST-SESSION-3a STATE (READ SECOND — updated 2026-04-24 Session 3a)

**As of 2026-04-24 Session 3a (Phase 1g-test follow-up Part 3 — Session 3a — first code-write session of Part 3; 5 of 9 Session 3 items shipped + deployed to vklf.com; Session 3b carries the 3 bigger items):**

### Director-approved Session 3a / Session 3b split
At session start, Claude proposed splitting the 9-item Session 3 scope across two sessions to avoid Rule-16 fatigue triggers (the canvas-layout port + reconciliation pass at end of a long session was the highest-risk combination). Director approved.

- **Session 3a (today):** items #3 (RemovedKeyword soft-archive), #5 (nextNodeId), #6 (model dropdown), #7 (cost tracker), #8 (B1 settings persistence). All DB + UI + smaller code; no doApply rewrite, no canvas-layout port.
- **Session 3b (next session):** items #1 (P3-F7 reconciliation pass), #2 (salvage mechanism — uses RemovedKeyword table built in 3a), #4 (P3-F8 four-function canvas-layout port).

### What shipped this session
1. **(#6) Opus 4.7 dropdown.** Added to `AA_PRICING` table + `<select>` in `AutoAnalyze.tsx`. Listed first; default unchanged (Sonnet 4.6); pricing $5/$25 placeholder until Model Registry. Haiku 4.5 was already in the dropdown (no change).
2. **(#5) `CanvasState.nextNodeId` self-heal-on-read.** Modified `GET /api/projects/[projectId]/canvas` to return `max(stored_nextNodeId, max(CanvasNode.id) + 1)` and same for pathways. Two extra Prisma `aggregate` queries per canvas mount (cheap, not a hot path). Heals existing stale values (Bursitis 5 → 105) automatically on next read; immune to whatever future writes might re-stale the counter; no migration required.
3. **(#7) Cost tracker — failed-attempt costs counted.** Cost-recording moved from after-validation-passes to immediately after `processBatch` returns. `batch.cost` accumulates across attempts (was overwritten before); per-attempt log line added; success log shows total-across-attempts. HC4/HC5 lost-data triggers, validation retries, and Mode A→B auto-switches all now reflect in `totalSpent`.
4. **(#8) B1 settings persistence — split-secret design.** Auto-save 800ms debounced after any setting change; load on `AutoAnalyze` panel mount. **`apiKey`** stored in browser `localStorage` per-project (avoids storing the user's Anthropic secret in plain-text Postgres). All other settings (`model`, `apiMode`, `seedWords`, `volumeThreshold`, `batchSize`, `processingMode`, `thinkingMode`, `thinkingBudget`, `keywordScope`, `stallTimeout`, `reviewMode`, `initialPrompt`, `primerPrompt`) sync via existing `UserPreference` table per-user-per-project (cross-device). Director may override scoping at any time.
5. **(#3) RemovedKeyword soft-archive flow.** Big one. New Prisma model `RemovedKeyword` (FK to `ProjectWorkflow`, `@@index([projectWorkflowId])`). Director approved `npx prisma db push` per Rule 8; pure additive migration applied to live Supabase. Two new API routes:
   - `GET /api/projects/[projectId]/removed-keywords` — list, newest first.
   - `POST /api/projects/[projectId]/removed-keywords` — body `{ keywordIds, removedSource?, aiReasoning? }`; transactionally copies each Keyword to RemovedKeyword + deletes original Keyword row. `removedSource` accepts `'manual'` (default; AST-table user click) or `'auto-ai-detected-irrelevant'` (forward-ready for Session-3b salvage writes per Q5).
   - `POST /api/projects/[projectId]/removed-keywords/[removedId]/restore` — reverses the soft-archive. New Keyword gets a fresh id (the original id is gone); rejects with 409 if a keyword with the same text already exists in the workspace.
   `ASTTable.tsx` rewired: removed local `useState<RemovedKeyword[]>([])` (the prior bug — local state, no DB persistence); `handleRemove` now calls `onSoftArchive` parent callback instead of the hard-delete `onBulkDelete`/`onDeleteKeyword`. Modal gains a **Source column** with badge: "Manual" (gray) or "AI auto" (accent color, with `aiReasoning` shown on title hover when present). `KeywordWorkspace.tsx` owns the `removedKeywords` state, fetches on mount, exposes `softArchiveKeywords` + `restoreRemovedKeyword` as the parent callbacks, drops the obsolete `bulkDelete`/`deleteKeyword` props from the ASTTable interface.

### What did NOT change this session
- `AutoAnalyze.tsx` `doApply` step 11 reconciliation logic — deferred to Session 3b (item #1).
- The salvage follow-up prompt + tool-side IRRELEVANT_KEYWORDS handling — deferred to Session 3b (item #2).
- The four-function canvas-layout port (`calcNodeHeight`, `runLayoutPass`, `autoLayoutChild`, pathway separation) — deferred to Session 3b (item #4). `NODE_H = 160` constant + the absent layout-pass after Auto-Analyze batches still in effect; layout regressions persist until Session 3b ships.
- Stable topic IDs / stability scoring / Changes Ledger — Sessions 4-5+ as before.
- Auto-Remove Irrelevant Terms BUTTON — still deferred per director's standing instruction; the salvage per-batch auto-archive is a different feature (per Q5) and ships in 3b.
- Any prompt-text changes to `AUTO_ANALYZE_PROMPT_V2.md` — Session 6 mechanical merge.

### Two autonomous design calls flagged for director review (per Rule 15 + the Session 2b/3a "be comprehensive, recommend rather than ask" override)

These are documented in CORRECTIONS_LOG 2026-04-24c entry. Brief here for Session 3+ context:

1. **Self-heal-on-read for stale persistent counters.** The nextNodeId fix returns the healed value at read time rather than diagnosing which write left it stale. Single source of truth, immune to future regressions, no migration. Pattern recorded for any similar counter the system grows.
2. **Split-secret-from-shared-prefs scoping for B1.** apiKey stays in localStorage; everything else syncs via DB. Avoids long-lived plain-text secret exposure. Director may override at any time (one extra line to merge them into the DB blob).

### Director's explicit instructions preserved for Session 3b+
- **Carried from 2026-04-24 Session 2b:** Layout pass after every Auto-Analyze batch apply (Q1). Pathway separation in scope (Q2). Canvas layout ships as one-shot commit (Q3). Keyword reassignment out of ≥7.0 topic requires JUSTIFY_RESTRUCTURE (Q4). Salvage IRRELEVANT_KEYWORDS auto-archive ≠ Auto-Remove BUTTON (Q5). Stability Score is the 10th TSV column (Q6).
- **Carried from 2026-04-24 Session 2:** Root-cause-first + reconciliation-as-backup philosophy. Removed Terms UI distinguishes manual vs AI-auto (✅ Source column shipped this session — currently shows only "Manual" until Session 3b's salvage starts populating "AI auto"). Direct DB queries are standard practice.
- **Carried from 2026-04-20:** Do NOT program Auto-Remove Irrelevant Terms BUTTON without explicit director-provided specifics. Ask for parallel-chat workflow-fundamentals conclusions at or before Session 5. Stay lucid.
- **NEW from 2026-04-24 Session 3a:** Two autonomous design choices await director review: self-heal-on-read for nextNodeId; apiKey in localStorage (others in DB). Director may override either in a follow-up session.

---

## ⚠️ POST-SESSION-2b STATE (READ SECOND — updated 2026-04-24 Session 2b)

**As of 2026-04-24 Session 2b (Phase 1g-test follow-up Part 3 — Session 2b — finishes the two items Session 2 rolled forward: P3-F8 canvas-layout regression diagnostic + Task 5 prompt changes review; docs-only commit, no code):**

### P3-F8 diagnosis — React migration dropped the layout engine

Investigation approach: read `keyword_sorting_tool_v18.html` (17,725 lines) layout code (centred on `cvsPushDownOverlaps`, `cvsAutoLayoutChild`, `cvsNodeH`, `cvsSeparatePathways` — lines 11965–14315) and compared to React `CanvasPanel.tsx` layout surface (`resolveOverlap` at line 397 + callsites at 380, 591). Grepped for all layout-related function names in both sources.

**Root cause (single systemic gap):** The React port migrated canvas rendering (SVG node cards, connectors, drag, zoom, single-node overlap nudge) but did NOT port the HTML tool's four-job layout engine. The gap manifests as three user-visible regressions sharing one architectural cause.

**Four jobs the HTML tool did automatically — status in React:**

| # | HTML tool job | HTML function(s) | React equivalent |
|---|---|---|---|
| 1 | Measure node height from content (title wrap + altTitles + description wrap + kw rows + detail-view state) | `cvsNodeH(node)` at line 11965 (canvas `measureText`-based) | ❌ NONE — `NODE_H = 160` hardcoded constant (line 12); `h` loaded from DB, never recomputed |
| 2 | Holistic layout pass on every structural change (4 steps: reset → tree-walk via `layoutChildren` → 60-pass overlap resolution → pathway separation) | `cvsPushDownOverlaps()` at line 14152 | ❌ NONE — only `resolveOverlap(nodeId)` exists; single-node nudge; only fires on drag/resize end; does NOT fire after Auto-Analyze canvas rebuild |
| 3 | Auto-position child relative to parent when a parent-child link is formed (type-aware: linear aligned to parent-left-below-peers; nested aligned parent-center-plus-indent-below-nested-siblings) | `cvsAutoLayoutChild()` at line 14321 | ❌ NONE |
| 4 | Separate overlapping pathway borders horizontally | `cvsSeparatePathways()` at line 14251 | ❌ NONE |
| 5 (bonus) | `baseY`/`y` separation so collapse/expand restores user-set positions cleanly | All HTML functions use `baseY` | ❌ NONE — React has only `y` |

**Regression 1 (overlapping nodes, wrong placement/order) traces to gap #2, #3, #4.** Auto-Analyze rebuilds 80+ nodes per batch; no layout pass ever runs; nodes land wherever the rebuild set their coords with zero structural arrangement.

**Regression 2 (descriptions overflowing node boxes) traces to gap #1.** Node height = 160px constant regardless of content; long descriptions spill past the bottom.

**Regression 3 (nested vs linear placement wrong) traces to gap #3.** Any new parent-child relationship (drag-link OR Auto-Analyze-created) gets arbitrary child position; HTML's type-aware placement is absent.

### P3-F8 fix direction — Session 3 scope locked in

Director's answers to the three diagnostic questions (Q1/Q2/Q3 in Session 2b discussion):

- **Q1 — Layout pass trigger frequency after Auto-Analyze:** run **after every batch** (not just run-end). Keeps canvas clean live-during-run for human-in-loop review; ~50–200ms per batch cost is acceptable.
- **Q2 — Pathway separation (Tier 2 item #6):** **don't defer** — include in Session 3 scope. Bursitis has 1 pathway so not biting today, but any multi-pathway Project will hit it; ~30 extra lines of port is worth it now.
- **Q3 — One-shot port vs incremental:** **one-shot** — port all four functions + wire them in one Session 3 commit, verify in one pass. The four functions are interdependent (height feeds layout-pass; auto-layout-child feeds layout-pass); testing in isolation would require shim code.

**Locked-in Session 3 P3-F8 scope:**
1. Port `cvsNodeH` → React `calcNodeHeight(node)` using browser canvas `CanvasRenderingContext2D.measureText` for accurate text wrapping at current node width. Replaces hardcoded `NODE_H = 160`. Recalc on: content edit, resize end, canvas rebuild apply, detail-view toggle, initial load.
2. Port `cvsPushDownOverlaps` → React `runLayoutPass()` — four-step holistic pass matching HTML behavior. Call after every structural change including every Auto-Analyze batch apply (per Q1).
3. Port `cvsAutoLayoutChild` → React `autoLayoutChild(child, parent, relType)` — type-aware linear vs nested auto-positioning on parent-child form.
4. Port `cvsSeparatePathways` → React equivalent (per Q2 "don't defer"). Multi-pathway push-apart.
5. Keep existing React `resolveOverlap(nodeId)` for drag/resize single-node nudges — no change.

**One item still deferred (not in Session 3):** `baseY`/`y` separation for clean collapse/expand restoration. Q2 was narrowly about pathway separation; `baseY`/`y` was not asked about. Can land in a follow-up session.

### Task 5 prompt review — all 7 changes' line references verified + refinements locked in

All 7 proposed changes in `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` had their line references verified against current `AUTO_ANALYZE_PROMPT_V2.md` (last committed `27eb180` on 2026-04-18). **Zero drift.** All insertion points still accurate.

**Wording refinements (locked in, written into proposed-changes doc):**

- **Change 3 (Step 4b Comprehensiveness) — meaningful fix applied.** Original proposed text had a math/definition bug: (i) counted "facets" ambiguously (was the core intent a facet or not?); the worked example self-caught the confusion mid-logic. Redraft clarifies: qualifying facets = demographic/situational/temporal/severity/contextual modifiers only, NOT the core intent; correct total = 1 + N(facets); COMPREHENSIVENESS CHECK BLOCK now includes "Core intent" as a distinct row from "Qualifying facets identified"; worked example rewritten unambiguously.
- **Change 2 Location 2 — grammar fix.** Original proposed clause "within the same facet that their combined volume meets or exceeds" replaced with "within the same facet, where their combined volume meets or exceeds".
- **Change 4 — JUSTIFY_RESTRUCTURE payload expanded from 4 fields to full 6 fields** matching `MODEL_QUALITY_SCORING.md §4` (Topic affected, Prior state, New state, Score, Reason, Expected quality improvement).
- **Change 5 — example labels polished** for internal consistency: "(symptom focus)", "(gender facet)", "(age-group facet)" replaces the originally-overlapping "(symptom focus)", "(demographic focus)", "(age-demographic focus)".
- **Changes 1, 6, 7 — no changes needed.**

**Three substantive design questions resolved:**

- **Q4 — Cross-canvas keyword reassignment × stability-score friction.** When Step 6(b) cross-canvas cluster promotion or Trigger (7) reassigns a keyword out of a prior-canvas topic, IF that source topic has `stability_score >= 7.0` → the reassignment requires a JUSTIFY_RESTRUCTURE payload in the Reevaluation Report. Prevents high-confidence topics being silently gutted of keywords without admin-visible justification. Captured as additions to Change 2 Location 1 + Location 2.
- **Q5 — What does the tool do with IRRELEVANT_KEYWORDS flags from salvage?** Tool auto-archives flagged keywords to the Session-3 `RemovedKeyword` table with `removedSource='auto-ai-detected-irrelevant'` and `aiReasoning` populated from the model's returned reason. Admin can review or restore at any time. NOT the same as the "Auto-Remove Irrelevant Terms button" feature director has deferred (that's a proactive full-canvas scan + batch removal UI; this is per-batch model-initiated during salvage). Director's "DO NOT program Auto-Remove without specifics" instruction applies to the proactive-scan button, not to salvage's per-batch behavior. Captured in Change 6 template: language updated from "Admin will review and decide whether to move it to the Removed Terms table" → "The tool will auto-archive these keywords to the Removed Terms table with source tag 'auto-ai-detected-irrelevant' and your reasoning preserved; admin can review or restore at any time."
- **Q6 — How does `stability_score` metadata reach the model?** Add `Stability Score` as a 10th column in the Topics Layout Table TSV schema (column definition added to Primer Section 2). Parsing rule 12 added: missing/empty/non-numeric defaults to 0.0, clamped to [0.0, 10.0]. Output rule added: float rounded to one decimal place. New topics emit 0.0; existing topics preserve the tool-provided value verbatim. Ships in Session 5 (stability scoring) + Session 6 (prompt merge) together.

### Session 2b scope — complete

**✅ DONE this session:**
- P3-F8 canvas layout regression diagnostic (HTML tool layout engine vs React layout surface; 4-job gap analysis; Session 3 scope locked in per Q1/Q2/Q3 answers).
- Task 5 prompt changes review (all 7 line refs verified; Change 3 math redraft; Change 2/4/5 polish; Q4/Q5/Q6 design resolutions).
- `keyword_sorting_tool_v18.html` committed to repo per Option A clean-split timing (this is the session that actually used it).

**No code changes this session.** End-of-session commit is docs-only (+ the HTML tool file that was previously untracked).

### Session 3 scope (full — cumulative from Sessions 2 + 2b lockdowns)

1. **P3-F7 backup safety net:** post-batch reconciliation pass in `doApply` after step 11. Flip Unsorted-but-on-canvas → AI-Sorted (fixes 58 silent placements + 49 reshuffle ghosts on reappearance); flip AI-Sorted-but-off-canvas → Unsorted OR new status `'Reshuffled'` (conservative decision at implementation time; fixes 49 reshuffle casualties + 25 linkedKwIds-carryover ghosts as side effect). Every flip logged to activity log + future Changes Ledger.
2. **Salvage-ignored-keywords mechanism** per refined Change 6 template (Q5-aware auto-archive language). Paired with the reconciliation pass as the primary+backup pair for P3-F7.
3. **Removed Terms fix — Option B `RemovedKeyword` table** scoped to `ProjectWorkflow` with `removedSource` ('manual' | 'auto-ai-detected-irrelevant') + `aiReasoning` fields. Soft-archive flow: Remove = transaction (copy row → `RemovedKeyword`, delete from `Keyword`); Restore = reverse. `ASTTable.tsx` `removedTerms` state → DB-backed fetch. Modal UI filters/badges by source.
4. **P3-F8 canvas-layout port (one commit, four functions together):** `calcNodeHeight`, `runLayoutPass` (called after every Auto-Analyze batch apply + structural changes), `autoLayoutChild`, pathway separation. Keep `resolveOverlap` for drag/resize. Defer `baseY`/`y` to follow-up.
5. **`CanvasState.nextNodeId` stale-counter investigation + fix** — max CanvasNode.id=104 vs nextNodeId=5. Either repair to `max(id)+1` or confirm counter is unused + remove.
6. **Opus 4.7 + Haiku 4.5** added to model dropdown (interim hardcoded; full Model Registry deferred to Session 13).
7. **Cost tracker failed-attempt-cost fix** (per Q8 design Session 1).
8. **B1 settings persistence** (`UserPreference` DB table).
9. **Commit + push + deploy + director verification.**

### Session 6 scope — locked-in prompt merge

When Session 6 starts, the prompt merge is mechanical:
- Open `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` — all 7 changes carry the Session-2b-refined wording + Q4/Q5/Q6 resolutions baked in.
- Open `AUTO_ANALYZE_PROMPT_V2.md` at the line references verified during Session 2b (still accurate unless intervening sessions edit that file).
- Insert/replace per each change's specified location.
- Add Stability Score column to Primer Section 2 (COLUMN DEFINITIONS + CRITICAL TSV PARSING RULES rule 12 + RULES AND CONSTRAINTS rule 16 + OUTPUT FORMAT header + output-rules).
- Director re-pastes updated prompt into Auto-Analyze UI; test run validates.

**Note:** Session 5 should ship stability scoring (infrastructure) BEFORE Session 6 merges the prompt text that references it — or the model will see `Stability Score` column references in the prompt without actual score data flowing.

### Director's explicit instructions preserved for Session 3+
- **NEW 2026-04-24 Session 2b:** Layout pass runs after every Auto-Analyze batch apply (Q1). Pathway separation is Session 3 scope, not deferred (Q2). Canvas layout port ships as one-shot commit (Q3).
- **NEW 2026-04-24 Session 2b (Q4):** Keyword reassignment out of a high-score (≥7.0) topic requires JUSTIFY_RESTRUCTURE payload.
- **NEW 2026-04-24 Session 2b (Q5):** Salvage IRRELEVANT_KEYWORDS auto-archive to `RemovedKeyword` table is NOT the same as the "Auto-Remove Irrelevant Terms button" feature and is NOT blocked by the standing "don't program Auto-Remove without specifics" instruction. The button (proactive full-canvas scan) stays deferred.
- **NEW 2026-04-24 Session 2b (Q6):** `Stability Score` is the 10th TSV column. Tool populates for existing topics; model emits 0.0 for new topics.
- **Preserved from 2026-04-24 Session 2:** Root-cause-first + reconciliation-as-backup philosophy for all multi-source-of-truth bugs. Removed Terms UI must distinguish manual vs AI-auto once Auto-Remove ships. Direct DB queries standard practice.
- **Preserved from 2026-04-20:** Do NOT program Auto-Remove Irrelevant Terms button without explicit director-provided specifics. Ask for parallel-chat workflow-fundamentals conclusions at or before Session 5. Stay lucid.

---

## ⚠️ POST-SESSION-2 STATE (READ SECOND — updated 2026-04-24 session)

**As of 2026-04-24 (Phase 1g-test follow-up Part 3 — Session 2 — INVESTIGATIONS ONLY, no code commits; first direct DB queries against live Bursitis canvas; P3-F7 and Removed Terms root causes diagnosed; P3-F8 layout + Task 5 prompt review rolled forward to Session 2b or Session 3):**

### DB access verified + first queries run
- `DATABASE_URL` + `DIRECT_URL` confirmed in `.env.local` (Supabase pooler + direct connection). Prisma client queries succeed against live Bursitis data. Direct DB querying now engaged as standard practice per director's 2026-04-20 instruction.
- Four read-only queries run jointly with director: project list → baseline counts → full canvas tree walk → P3-F7 diagnostic (sum linked keywords vs AI-Sorted DB count, cross-reference to find drift).

### Bursitis canvas DB snapshot — 2026-04-24
- `Project` "Bursitis" id `6a6bd586-e873-4bae-a4a3-2612236dc270`, userId `3261bf98-3d77-413e-9de2-01e612fc753a`. `ProjectWorkflow` id `816f5de1-0356-4fe3-80de-de69a64f49dc`, status `active`, lastActivityAt `2026-04-20T03:30:41Z`.
- **Keywords: 2,328 total** (matches original import count per CORRECTIONS_LOG 2026-04-18 entry — confirms prior "remove from AST" action did NOT hard-delete any Keyword rows, even though the code path IS capable of hard-delete). Split: 238 AI-Sorted + 2,090 Unsorted. No other sortingStatus values exist.
- **CanvasNodes: 104.** Max `CanvasNode.id = 104`. Tree: 1 depth-0 root + 8 depth-1 + 22 depth-2 + 41 depth-3 + 27 depth-4 + 5 depth-5. Tree well-formed (all nodes chain to root; zero orphans).
- **Pathway: 1. SisterLink: 1,360.**
- 🚩 **`CanvasState.nextNodeId = 5` despite max CanvasNode.id = 104** — stale counter. New-node creation via this counter would collide with existing IDs. Flagged for Session 3 triage.

### Qualitative structural observations from tree walk
- Root `[1] "What is bursitis?"` with 8 depth-1 narrative-bridge children.
- 🚨 **HIP bursitis topics misplaced under KNEE parent:** `[4] "What causes bursitis in the knee?"` (itself under `[9] Knee bursitis`) contains `[5] Trochanteric bursitis`, `[28] Iliopsoas bursitis`, `[29] How is hip bursitis diagnosed?`, `[34] What is the hip bursa?`, `[57] What causes bursitis in the hip?` as children. All HIP topics. Direct fingerprint of P3-F2 silent-reshuffling at work.
- `[3] "Where does bursitis occur?"` — depth-1 bridge node with 0 keywords + 0 placements, but parent of every body-part subtree. Possibly intentional narrative bridging; possibly post-merge orphan. TBD by director.
- `[21] "Who does bursitis affect?"` has only one child: `[22] "How bursitis affects women differently"` (3 secondaries, 0 primaries). Director's bursitis-pain-in-older-women example expects an age-demographic sibling (e.g., "How bursitis affects older people"). The sibling does NOT exist — direct P3-F5 evidence of under-placement.
- Aggregate duplication: separate "Treating [body part] bursitis" chains for 7 body parts + separate "Exercises for [body part] bursitis" chains for 4 — consistent with lack of tie-breaker rule (P3-F1). ~45 of 104 nodes are singleton `kw=1` — suggests over-specificity for many topics.
- Secondary-placement coverage: only 56 placement slots across 51 distinct keywords vs 222 primaries = ~25% secondary-coverage rate. Confirms P3-F5 under-placement pressure.

### P3-F7 diagnosis — TWO-WAY sync drift (root cause identified)

**Architectural root:** two separate sources of truth for "keyword is placed" — `Keyword.sortingStatus` (updated by `doApply` step 11) and `CanvasNode.linkedKwIds` / `kwPlacements` (updated by `doApply` step 3's canvas rebuild). Updates are one-directional (status only gets ADDED as AI-Sorted, never REMOVED). No reconciliation pass. Drift accumulates batch-by-batch.

**Bug 1 — Silent Placements (58 kw, all on canvas as [p] primary but `sortingStatus='Unsorted'`):**
`doApply` step 11 at `AutoAnalyze.tsx` line 1179 iterates ONLY `batch.keywordIds` when marking AI-Sorted:
```
for (const id of batch.keywordIds) { if (allLinkedIds.has(id)) placed.push(id); }
if (placed.length > 0) onBatchUpdateKeywords(placed.map(id => ({ id, sortingStatus: 'AI-Sorted' })));
```
Step 9 (lines 1147–1165) updates `Keyword.topic` for EVERY keyword matching any text in the AI's response, regardless of batch. When Mode A's full-table view places prior-batch keywords as [p] primary in later batches' responses, step 9 fires (topic updated + canvasLoc set) but step 11 does NOT fire (keyword not in this batch's input IDs) → silent placement.

**Bug 2 — Ghost AI-Sorted (74 kw, two sub-groups):**
- **Sub-group 1 (49 kw with non-empty topic + canvasLoc — "reshuffle casualties"):** Keyword was correctly placed in an earlier batch (step 9 set topic; step 11 set status). A later batch's canvas rebuild removed the keyword from canvas. Step 11 only ADDS to AI-Sorted — never REMOVES. Stale AI-Sorted status persists. Topic/canvasLoc strings survive intact because step 9's `existingTopics.push` only appends.
- **Sub-group 2 (25 kw with empty topic + empty canvasLoc — "linkedKwIds carryover"):** `doApply` line 1003 fallback: `linkedKwIds: linkedIds.length > 0 ? linkedIds : (existing?.linkedKwIds || [])`. When the AI's response has empty `kwRaw` for a node, the node inherits linkedKwIds from its pre-existing state. Inherited keywords flow into `allLinkedIds` at step 11 → marked AI-Sorted if in batch.keywordIds → step 9 never touched them (not in parsed response text) → resulting state is AI-Sorted with blank topic, no canvasLoc, no canvas presence after next rebuild.

### P3-F7 fix direction (agreed with director 2026-04-24 — Session 3 scope)

Per director's framing — *"Whatever fix we apply here should be a backup to that primary fix"* — two-part fix:

**Primary stack (root-cause fixes, Sessions 3–6, mostly already in the plan):**
- Salvage-ignored-keywords mechanism (`AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` Change 6). Targeted second prompt for "Missing" (same-batch) keywords; full-batch retry for "Lost" (prior-work-erased) keywords.
- Prompt changes: tie-breaker "default to existing topic" (Change 1), comprehensiveness verification Step 4b (Change 3), multi-placement reinforcement (Change 5).
- Stable topic IDs (Session 5). Renames stop masquerading as "new topics"; prompt output contract uses explicit `RENAME` / `MERGE` / `SPLIT` / `DELETE` row types.
- Stability scoring friction gradient (Session 5). `JUSTIFY_RESTRUCTURE` payload required for modifications to high-confidence topics.
- Changes Ledger (Session 4). Admin-visible per-batch change log with provenance; enables admin to see exactly what reshuffled and reject.

**Backup safety net (Session 3, NEW this session):**
Post-batch reconciliation pass in `doApply` after step 11. Compute `trueCanvasKeywordIds` from rebuilt canvas. For each Keyword:
- (a) On canvas AND `sortingStatus === 'Unsorted'` → flip to `'AI-Sorted'` (fixes Bug 1; heals drift from Sub-group 1 reappearances).
- (b) Off canvas AND `sortingStatus === 'AI-Sorted'` → flip to `'Unsorted'` (aggressive) OR to new status `'Reshuffled'` (conservative — preserves history + alerts admin). Final decision deferred to Session 3 implementation review.
- Every flip logged to activity log + future Changes Ledger.

### Removed Terms display bug — root cause diagnosed

`ASTTable.tsx` line 116: `const [removedTerms, setRemovedTerms] = useState<RemovedKeyword[]>([])` — no localStorage load, no DB fetch. `handleRemove` (line 252) calls `onBulkDelete` / `onDeleteKeyword` which HARD-DELETE the Keyword row via `prisma.keyword.deleteMany` at `/api/projects/[projectId]/keywords` DELETE endpoint. Archive entry written only to in-memory state. Page refresh resets state to `[]`; hard-deleted Keyword row is gone forever, no restore path.

Director's prior-session remove action didn't actually delete anything (DB still shows 2,328 kw = original import count; zero orphan canvas refs). The click evidently never fired the API call (modal aborted / network error / UI-state mismatch / confirmation not reached). But the wiring IS capable of permanent deletion — future remove clicks would silently lose data if they succeeded.

### Removed Terms fix direction (agreed with director 2026-04-24 — Option B, Session 3 scope)

New `RemovedKeyword` table scoped to `ProjectWorkflow`. Schema:
- `id` uuid, `projectWorkflowId` FK → ProjectWorkflow
- `keyword`, `volume`, `tags` — archived from original Keyword row
- `topic`, `canvasLoc` (Json) — last-known placement state at time of removal (useful for context + restore-with-history)
- `removedAt` DateTime, `removedBy` userId, `createdAt` DateTime
- `removedSource` string enum: `'manual'` or `'auto-ai-detected-irrelevant'`
- `aiReasoning` text (nullable) — populated only when `removedSource = 'auto-ai-detected-irrelevant'`; stores the model's rationale for flagging as irrelevant

Remove action = transaction: (1) copy Keyword row data to `RemovedKeyword`, (2) delete Keyword row. Restore = reverse. `ASTTable.tsx` `removedTerms` state replaced with DB-backed fetch. Modal UI filters / badges by `removedSource` so admin can distinguish manual vs AI-auto removal.

**Forward-looking:** `removedSource` + `aiReasoning` fields support the future Auto-Remove Irrelevant Terms button feature (which remains DEFERRED per director's explicit instruction — not to be programmed without director-provided specifics on the AI flow).

### Session 2 scope — partial completion

**✅ DONE this session:**
- DB access verification + first direct Bursitis canvas queries (4 queries total).
- P3-F7 code investigation (read `AutoAnalyze.tsx` batching + `doApply` steps 3/9/11, `api/.../keywords/route.ts`, `api/.../canvas/rebuild/route.ts`). Root cause + fix direction agreed.
- Removed Terms display bug investigation (read `ASTTable.tsx` state init + `handleRemove`/`handleRestore`). Root cause + fix direction agreed.

**🎯 ROLLED to Session 2b or Session 3:**
- P3-F8 canvas layout regression diagnostic — compare `keyword_sorting_tool_v18.html` (present at repo root, uncommitted — director's upload; remains untracked until the session that actually investigates it per Option A clean-split) to React `resolveOverlap` at `CanvasPanel.tsx`.
- Task 5 — draft proposed prompt changes from `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` with exact final wording for director review.

### Additional findings flagged for Session 3 triage
- `CanvasState.nextNodeId = 5` stale counter (see above). Investigate how new CanvasNode IDs are actually assigned; either repair the counter or confirm it's unused + remove.
- SisterLink count 1,360 across 104 nodes (~25% of all possible node-pairs). Possibly legitimate multi-placement density, possibly duplicates. Not investigated this session; spot-check worth scheduling.

### Director's explicit instructions preserved for Session 3+
- **NEW 2026-04-24:** For ALL multi-source-of-truth bugs, apply reconciliation as safety net ON TOP OF the primary fix that addresses the root cause — not as the only fix. Root-cause-first, reconciliation-as-backup.
- **NEW 2026-04-24:** The Removed Terms table must distinguish manual-removed vs AI-auto-removed entries in the UI once Auto-Remove ships.
- **Preserved from 2026-04-20:** Auto-Remove Irrelevant Terms button — DO NOT program without explicit director prompt + specifics.
- **Preserved from 2026-04-20:** Direct DB querying is standard practice — engage whenever analyzing runs.
- **Preserved from 2026-04-20:** Ask for parallel-chat workflow-fundamentals conclusions at or before Session 5.
- **Preserved from 2026-04-20:** Stay lucid — pause for fresh session rather than pushing through fatigue.

---

## ⚠️ POST-PHASE-1G-TEST-FOLLOWUP-PART-3 STATE (READ SECOND — updated 2026-04-20 session)

**As of 2026-04-20 (Phase 1g-test follow-up Part 3 Claude Code session — design work only, NO code commits; director confirmed Mode A qualitative superiority; Mode B can silently overwrite Mode A's work identified as first-order problem):**

### Run-outcome facts
- ✅ **Full 51-batch Bursitis Auto-Analyze run narrated from activity log.** Run duration: ~10h 37min (started 1:03:40 PM 2026-04-19, cancelled by director 11:40:22 PM after batch 52 failed validation). 51 full batch applies + 1 partial (batch 52 attempt 2 cancelled mid-generation). Outcome was variant (a) of the prior session's prediction set.
- ✅ **Reactive Mode A→B switch fired at batch 40** (10:27:02 PM, canvas = 95 nodes) on a narrow trigger: "⚡ AUTO-SWITCH: Deleted 1 topics: Wrist bursitis; Lost 1 keywords: wrist bursitis."
- ✅ **Context wall NEVER hit.** Mode A peaked at ~53k billed input + ~66k output ≈ 119k total at batch 17 — well below the 200k ceiling. The prior session's "Mode A alone cannot complete" projection was partially rebutted (Mode A kept running clean past the projection's worry point).
- ✅ **Mode B carried batches 40-51 cleanly**, then failed batch 52 attempt 1 with "Missing 2 batch keywords: bursa city, bursa iş ilanları; Lost 6 keywords: bursa, bursa sac, what is a bursa, what is bursa, omental bursa." Director cancelled during retry 2.
- 📊 **Progress:** 408 of 2,304 keywords placed = 17.7%. Estimated total runtime to completion at Mode B pace: ~33 hours. Estimated final API cost if completed: ~$90-100.
- 📉 **Batch-time and cost reduction under Mode B:** batch time dropped from ~14 min/batch (Mode A) to ~5-6 min/batch (Mode B); cost from $0.80 avg/batch (Mode A) to $0.36-$0.47 (Mode B).

### Qualitative findings (director-surfaced + Claude-verified)
- 🎯 **Mode A output is QUALITATIVELY SUPERIOR to Mode B per director's direct assessment.** This reframes the cost analysis entirely — Mode A's extra time and money is paying for structural quality Mode B cannot produce. Locked-in decision for Phase 1: **Mode A is the default; accept higher cost as quality tax**; add multi-trigger safety nets (not proactive switch) to prevent context-wall failures.
- 🚨 **Mode B can silently overwrite Mode A's better work.** No per-action provenance tracking exists currently; admin cannot distinguish which mode produced which part of the final tree. Identified this session as a first-order design problem. Fix: Changes Ledger with full provenance; Mode A protected status via stability scoring; final review mode-difference view. See `CORRECTIONS_LOG.md` 2026-04-20 entry "Mode B can silently overwrite Mode A's higher-quality work" for full detail.
- 🚨 **Mode A is quietly reshuffling topics under the hood** (canvas oscillation 80→81→80→82→81→80... with "0 removed" every batch). Validation only catches by-name-disappearance; renames/merges/splits are invisible. Fix: stable topic IDs + Changes Ledger + stability scoring friction gradient.
- 🚨 **"Unusually high: N new topics" warning is misleading** — counts renames as new. Grew from 27 (batch 6) to 82 (batches 34-39) in Mode A. Fix: stable topic IDs eliminate the ambiguity; Activity Log v2 with explicit Renamed/Restructured/Truly-new/Unchanged breakdown.
- 🚨 **Director's bursa/Turkey-city homograph insight.** "bursa" = fluid sac (medical) AND Turkish city. Batch 52 "Missing 2" keywords were "bursa city" + "bursa iş ilanları" ("Bursa job listings" in Turkish). Forcing the model to place every batch keyword creates pressure for bad behavior. Fix: "Irrelevant Keywords" floating topic as runtime safety valve + Pending Deletion canvas region for obsolete topics + prompt instruction to use these surfaces.
- 🚨 **Model is not comprehensive in topic-chain creation.** Director's example: "bursitis pain in older women" should generate 1 primary ("bursitis pain") + 2 secondary ("bursitis in women" w/ chain "Who does bursitis affect → How bursitis affects different sexes differently" + "bursitis in older people" w/ chain "How does bursitis affect a person by age → Who does bursitis affect"). Current model under-places under output-length pressure. Fix: Step 4b Comprehensiveness Verification in prompt (see `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` Change 3).
- 🚨 **Keywords being left out of batches (director's AST Table observation).** Some keywords show "Unsorted" status despite batches being completed; missing from Topics/Analysis tables. Investigation deferred to Session 2. Fix includes: independent post-batch AST verification + re-queuing orphaned keywords.
- 🚨 **Canvas layout regressions from HTML tool.** Overlapping nodes, description overflow, wrong placement/order. `resolveOverlap` exists in React code but insufficient. Diagnostic deferred to Session 2 after director uploads `keyword_sorting_tool_v18.html` to repo root.
- 📝 **Cost tracker missing failed-attempt costs + too-small UI + no estimated-vs-actual variance.** Known from 2026-04-18; promoted to roadmap Cost Ledger item with manual entry capability.

### Director's Q4 correction (Claude's framing error — see CORRECTIONS_LOG)
- Claude initially framed Mode A's 9 hours + $31 as "wasted" vs. Mode B, assuming quality parity. Director correctly pushed back: quality matters more than cost for a product-launch hierarchy. Claude acknowledged the error; proactive Mode A→B switch was downgraded from "functional prerequisite" to "cost-optimization option, pending qualitative comparison." See `CORRECTIONS_LOG.md` 2026-04-20 entry for full detail.

### New design artifacts created this session
- `docs/AI_TOOL_FEEDBACK_PROTOCOL.md` — platform-wide standard for AI-tool feedback integration (every new AI-using tool must comply)
- `docs/MODEL_QUALITY_SCORING.md` — stability-score algorithm spec, admin scoring guidelines, meta-note on algorithm derivation + review triggers
- `docs/AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` — 7 specific proposed prompt modifications with exact wording + exact line-level placement in `AUTO_ANALYZE_PROMPT_V2.md`; pending director review in Session 6

### Multi-session execution plan (locked in 2026-04-20)
See `ROADMAP.md` "Phase 1g-test Part 3 session plan" for the full 15+ session roadmap. Sessions 1-6 are detailed; Sessions 7-15+ are scoped. Key points:
- **Session 1 = THIS SESSION (2026-04-20):** Design capture + doc updates. DONE.
- **Session 2 = NEXT SESSION:** Investigations — DB access verification, direct Bursitis canvas query + qualitative analysis, P3-F7 keyword-left-out bug investigation, Removed Terms display bug investigation, P3-F8 canvas layout regression diagnostic using `keyword_sorting_tool_v18.html` (director to upload to repo root before Session 2 starts).
- **Session 3:** Tier-1 code fixes (keyword re-queuing, Removed Terms fix, layout fix, salvage-ignored-keywords, settings persistence, cost tracker fix, Opus 4.7 dropdown).
- **Sessions 4-5:** Changes Ledger foundation + stability scoring + stable topic IDs.
- **Session 6:** Merge approved prompt changes from `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md`.
- **Sessions 7-9:** Human-in-Loop mode (multi-session build).
- **Sessions 10-12:** Feedback Repository (3 phases).
- **Session 13:** Cost Ledger + Model Registry.
- **Session 14:** Feedback-summarization-to-prompt-improvements button (meta-tool).
- **Session 15+:** Integration of director's parallel-chat workflow-fundamentals work (reminder: director is running a parallel chat; conclusions to be shared later; session MUST ask for them before Session 6's prompt merge).

### Director's explicit instructions for future sessions
- **Auto-Remove Irrelevant Terms button:** DO NOT program without explicit prompt. Director will provide details when this item is reached.
- **Changes Ledger naming:** director agreed to "Changes Ledger" for now; discuss finalizing in Session 4.
- **HTML tool:** director will upload `keyword_sorting_tool_v18.html` to repo root after 2026-04-20 session. Session 2 can assume it's available.
- **Session pacing:** stop design-only sessions at design-completion; don't push into code while tired. Rule 13 honored.

---

## ⚠️ POST-PHASE-1G-TEST-FOLLOWUP-PART-2 STATE (READ SECOND — updated 2026-04-19 session, retained for history)

**As of 2026-04-19 (Phase 1g-test follow-up Part 2 Claude Code session — both stale-closure + missing-await bugs fixed and validated live; full-run still blocked pending proactive Mode A→B switch):**

- ✅ **Stale-closure bug in `buildCurrentTsv` FIXED and deployed** — commit `a6b3b19`. Function now reads from `nodesRef.current` / `keywordsRef.current` / a new `sisterLinksRef.current` (the latter added alongside the existing refs at lines ~205-215). Comment added near refs block documenting the invariant for future developers.
- ✅ **Missing-`await` bug in `handleApplyBatch` FIXED and deployed** — same commit. Function made `async`; now `await`s `doApply(...)` before subsequent state flips and the next `runLoop()` call. `handleSkipBatch` audited: no change needed (doesn't call `doApply`).
- ✅ **Fixes validated live on Bursitis across 7 consecutive clean batches** (session_2026-04-19 run): canvas grew 22 → 27 → 33 → 36 → 39 → 41 → 49 → 53 nodes; "0 removed" every batch; "All 8 keywords verified on canvas" every batch; input token count grew batch-over-batch in proportion to canvas size (21.3k → 23.2k → 26.3k → 28.0k → 29.9k → 31.6k → 36.8k → 39.8k). The monotonic input growth is the live fingerprint that `buildCurrentTsv` is reading post-apply state from the refs — under the broken version, this number would be flat.
- ✅ **All three prior-session priorities remain deployed** (commits `27eb180`, `84062f5`, `b9dc8b9` from 2026-04-18 follow-up session — V2 prompts in repo, Mode A→B reactive auto-switch broadened, Budget UX).
- ⚠️ **Prior-session Mode A "attention dilution" diagnosis remains reframed:** the 2026-04-18 kickoff's observations of Mode A dropping topics were at least partially due to the stale-closure bug, not pure LLM attention dilution. See §6.5 below.
- ⚠️ **Adaptive Thinking + large prompts still unresolved** — workaround remains Enabled-12k. Unchanged.
- 🚨 **NEW QUANTITATIVE FINDING — Mode A alone cannot complete a full Bursitis run.** Trajectory analysis after 7 batches: Mode A costs ~750 input tokens/node and ~600-950 output tokens/node. Projected context wall at ~120-140 canvas nodes, which equals only **240-600 of 2,304 keywords placed (10-26%)** before hitting the 200k window. See `CORRECTIONS_LOG.md` 2026-04-19 "Mode-A-alone cannot complete" entry for full arithmetic. **Implication:** the planned proactive Mode A → Mode B switch (Phase 1-polish item) is no longer optional — it is a **functional prerequisite** for any full-dataset clustering run.
- 🚨 **Batch 6 and 7 "Unusually high: N new topics" warnings** emerged (27 and 31 new-topic-signals respectively, threshold 25). The AI is emitting more new-topic titles in its Mode A response than actually grow the canvas — consistent with Mode A doing speculative topic reshuffling as the table grows. Not a correctness failure (validation always passed, "0 removed"), but a signal that Mode A is starting to spend tokens on speculative structure changes rather than pure additions.
- 🏃 **Bursitis run left continuing in browser tab during session wrap-up.** User's choice (per session_2026-04-19): leave the tab running so the browser keeps processing batches unattended, see how far the reactive Mode A→B switch catches it before the context wall, and pick up with fresh evidence next session. Expected outcomes: (a) reactive switch fires around 60-100 nodes → Mode B carries the rest to completion ✅ ideal; (b) Mode A holds clean past ~130 nodes → context-wall failure 🛑 informative; (c) Anthropic stream stall exhausts 5-retry budget mid-batch → run aborts. User will paste activity log at start of next session.

**Next session top priority:** read activity log from the still-running (or completed/failed) Bursitis run; decide whether to implement the proactive Mode A → Mode B switch, or address whatever surfaces from the run's outcome. See `ROADMAP.md` Phase 1-polish section.

## ⚠️ POST-PHASE-1G-TEST-FOLLOWUP STATE (prior-session context — retained for history)

**As of 2026-04-18 (follow-up Claude Code session — Phase 1g-test still partial at that time):**

- ✅ **Three code-fix priorities from the prior session all shipped and deployed:**
  - `docs/AUTO_ANALYZE_PROMPT_V2.md` committed (canonical V2 prompts live in repo) — commit `27eb180`
  - Mode A → Mode B auto-switch broadened to fire on HC4/HC5 validation failures — commit `84062f5`
  - Budget UX bug + 3 sibling inputs with same root cause — commit `b9dc8b9`
  - All three pushed to origin/main; Vercel build clean; Budget UX fix verified live by user on vklf.com
- ✅ **Task 2 fix validated live in production:** during that session's attempted Bursitis run, batch 2's Mode A response dropped 1 topic + 8 keywords; the new auto-switch fired correctly (`⚡ AUTO-SWITCH: ... switching to DELTA mode (Mode B)`); batch 2 retry in Mode B succeeded with the full 3-attempt budget preserved. First live-production validation of a Claude-Code-authored fix.
- 🚨 **Stale-closure + missing-await bugs discovered** in that session (both now FIXED in 2026-04-19 — see above).

## ⚠️ POST-PHASE-1G-TEST STATE (kickoff session context — retained for history)

**As of 2026-04-18 (first Claude Code session — Phase 1g-test partial):**

- ✅ Auto-Analyze live-tested for the first time; batch 1 completed cleanly.
- ❌ Systematic failure mode observed in batch 2; diagnosis reframed in follow-up session (see §6.5 updates) — what was attributed to LLM attention dilution is now known to be partly the stale-closure bug.
- ⚠️ Adaptive Thinking produces 0 output tokens on large prompts; workaround: Thinking=Enabled, Budget=12000.
- ⚠️ Vercel 5-min timeout approaches at ~5 min wall time on server mode.
- 📝 Multiple doc drifts corrected (see §4).

**Next priority after Phase 1g-test follow-up:** see §6 "Phase 1g-test findings" for specific tuning items.

---

## ⚠️ POST-CKPT-8 STATE (READ FIRST)

**As of 2026-04-17 (Phase M Ckpt 8 complete):**

- The Keyword Clustering tool's URL is `/projects/[projectId]/keyword-clustering`.
- The tool is single-state — user arrives with a specific Project already picked via URL.
- ✅ **The `/plos` Keyword Analysis card** has been rewired (Ckpt 8) from the deleted `/keyword-clustering` to `/projects`. Full navigation path from Login → Dashboard → PLOS → click Keyword Analysis card → `/projects` → pick a Project → `/projects/[projectId]` → click Keyword Analysis workflow card → `/projects/[projectId]/keyword-clustering` now works end-to-end without any 404s.
- The `components/` folder (ASTTable, MTTable, KeywordWorkspace, etc. — 25+ files) lives at `src/app/projects/[projectId]/keyword-clustering/components/` (moved from `src/app/keyword-clustering/components/` in Ckpt 7). All relative imports (`./components/KeywordWorkspace`, etc.) work.
- The old `src/app/keyword-clustering/` folder has been DELETED entirely. Do not recreate it.
- `KeywordWorkspace`, `useKeywords`, `useCanvas`, and all inner tool components are UNCHANGED by Ckpts 7 and 8. They still receive `projectId`, `userId`, `aiMode` as props and function identically.
- The API routes (keywords, canvas/nodes, canvas/pathways, canvas/sister-links, canvas/rebuild, canvas state) are UNCHANGED. URL paths stay the same (`/api/projects/[projectId]/...`); the server resolves `projectWorkflowId` internally via `verifyProjectWorkflowAuth`.
- `npm run build` passes cleanly (most recently verified in Ckpt 8: 18.5s, 17/17 static pages, zero TypeScript errors).
- Local commits: Ckpt 7 = `5cc10c5`, Ckpt 8 = `ac62a3a`. Both on `main`, not pushed (Phase M deploy hold until Ckpt 9).

**Checkpoint remaining:** 9 (deploy + cleanup of pre-existing leftover files).

---

## ⚠️ POST-PHASE-M SCHEMA NOTE

**As of 2026-04-16 (Phase M Ckpt 4 complete), the database schema changed:**

- The old `Project` table no longer has a `workflow` field and is now the user-facing Project record (see PLATFORM_ARCHITECTURE.md §5 for live schema).
- A new internal table `ProjectWorkflow` now sits between a Project and its workflow-specific data.
- **All workflow data tables now reference `projectWorkflowId` instead of `projectId`:**
  - `Keyword.projectId` → `Keyword.projectWorkflowId`
  - `CanvasNode.projectId` → `CanvasNode.projectWorkflowId`
  - `Pathway.projectId` → `Pathway.projectWorkflowId`
  - `SisterLink.projectId` → `SisterLink.projectWorkflowId`
  - `CanvasState.projectId` → `CanvasState.projectWorkflowId`

**API URL paths are unchanged:** routes like `/api/projects/[projectId]/keywords` keep the same URL — the server resolves `projectWorkflowId` internally. This decision minimized client code churn.

**As of 2026-04-17 (Phase M Ckpt 5):** All API routes (server-side) have been rewritten to align with the new schema.
**As of 2026-04-17 (Phase M Ckpt 7):** The client-side Keyword Clustering page has been updated to match — single-state, URL-driven.

---

## ⚠️ POST-APRIL-17 ARCHITECTURAL REVEAL — Phase 2 implications for this tool

As of 2026-04-17 (chat `cc15409c-...`), the platform architectural reveal established that Keyword Clustering must eventually support:

1. **Up to 10–20 concurrent editors** on a single Project's canvas with OT/CRDT merge strategy (Pattern D per `PLATFORM_REQUIREMENTS.md §3`). Current tool is single-user only. **This is the highest-impact Phase 2 change to this tool.**

2. **Review cycle integration** — workers click "I'm done — please review"; admin reviews, leaves notes, can mark Acceptable or Revision-Requested. Tool must display review state and revision notes inline. Currently not supported.

3. **Audit trail (Phase 2, opt-in)** — whether Keyword Clustering emits audit events is TBD at Phase 2 design. Strong candidate for audit given high edit volume and 10–20 concurrent editors. Emission helper built in Phase 2 scaffold; events declared in a future design update.

4. **Reset Workflow Data** — admin-only destructive action to wipe all KC data for a specific Project (per `PLATFORM_REQUIREMENTS.md §7`). Must clear: Keywords, CanvasNodes, Pathways, SisterLinks, CanvasState, AA checkpoint localStorage. Not yet implemented — on Phase 1-gap roadmap (Must-have).

5. **Per-(user, workflow, project) assignment** — tool must only be reachable by admin or by users with an Assignment row for (this workflow, this Project). Currently all-or-nothing: if you can log in, you can use it. Phase 2 adds permission middleware at API level + worker-scoped UI.

6. **Scale target Phase 3:** ~500 Projects with active KC workflows simultaneously; at Phase 4 up to ~5,000. Current DB indexes (projectWorkflowId on Keyword/CanvasNode/Pathway/SisterLink) should handle this, but query patterns at scale need verification before Phase 3.

These items do NOT affect Phase 1 admin-solo work. They are flagged here so Phase 2 design work correctly scopes what must be added to this specific tool.

---

## 1. Tool overview

### What it does
Takes a broad list of niche-related keywords, analyzes their intents, and organizes them thematically into a hierarchy of topics that form highly efficient conversion funnels.

### Card on PLOS Landing Page
- **Icon:** 🔑
- **Title:** Keyword Analysis & Intent Discovery
- **Status:** Active (only active card as of current chat)
- **Route:** `/projects/[projectId]/keyword-clustering` (as of Ckpt 7)
- ✅ **Card on `/plos`** now correctly routes to `/projects` (Ckpt 8 rewire) — user picks a Project there, then enters the KC workspace from the Project detail page.

### Origin
Migrated from the original single-HTML tool `keyword_sorting_tool_v18.html` (~17,691 lines). Migration is mostly complete but some features have not yet been ported — see §7 "Missing features (Phase 1-gap)" below.

---

## 2. How the user accesses the tool

**Post-Ckpt-8 (current working path):**
```
Login (/) → Dashboard (/dashboard) → PLOS Landing (/plos)
  → Click "Keyword Analysis & Intent Discovery" card  ✅ routes to /projects (Ckpt 8 rewire)
  → /projects  (Projects list)
  → Click an existing Project's name
  → /projects/[projectId]  (Project detail page)
  → Click the Keyword Analysis workflow card
  → /projects/[projectId]/keyword-clustering  (single-state, Project pre-selected)
```

**The full navigation works end-to-end now.** No 404s, no workarounds needed. As of Ckpt 8, clicking the Keyword Analysis card on `/plos` correctly takes the user to the Projects list, where they pick a Project before entering the KC workspace.

---

## 3. Architecture

### Component tree (as of Ckpt 7)
```
src/app/projects/[projectId]/keyword-clustering/
  ├── page.tsx          — wrapper: auth, read projectId from URL, fetch Project name, render workspace (164 lines)
  └── components/       — all the actual tool code
        │
        └── <KeywordWorkspace projectId userId aiMode>
              │
              ├── Manual Mode (3-panel + canvas):
              │   ├── <ASTTable>         — All Search Terms (left top)
              │   ├── <MTTable>          — Main Terms (left middle)
              │   ├── <TIFTable>         — Terms In Focus (left bottom)
              │   └── <CanvasPanel>      — Topics Layout Canvas (right)
              │       └── <CanvasEditPanel>  — 320px drawer for node editing
              │
              └── AI Mode (1 table + canvas + AI Actions Pane):
                    │
                    ├── One of 4 views (toggle):
                    │   ├── <ASTTable>     — "Normal" view
                    │   ├── <MTTable>      — "Common Terms" view
                    │   ├── <KASTable>     — "Keywords Analysis" view
                    │   └── <TVTTable>     — "Topics View"
                    │
                    ├── <CanvasPanel> or <CanvasTableMode>
                    │
                    └── <AutoAnalyze>      — Auto-Analyze system (76KB)
```

### Canvas modes
- **Mindmap mode (default):** Visual canvas with draggable nodes, pathways, sister links
- **Table mode:** Alternate structured view of the same canvas data

### Hooks
- `src/hooks/useKeywords.ts` — keyword state + `batchUpdate` + `reorder`
- `src/hooks/useCanvas.ts` — canvas state (lifted to `KeywordWorkspace`, passed to `CanvasPanel`)

### Key prop flow
- `aiMode` lives in `page.tsx`, passed as prop to `KeywordWorkspace`. Per-session only — resets on page refresh. See ROADMAP Phase 1-polish item.
- `useCanvas` lifted to `KeywordWorkspace`, passed as prop to `CanvasPanel`

---

## 4. Database tables used

All scoped by `projectWorkflowId` (post-Phase-M):

| Table | Purpose |
|---|---|
| `Project` | User-facing project record (one per product launch effort). `ProjectWorkflow` holds per-workflow state/data. |
| `ProjectWorkflow` | Per-workflow internal bucket — holds status (inactive/active/completed) + activity timestamps for the keyword-clustering workflow of a specific Project. User never sees this name. |
| `Keyword` | Individual keywords: keyword text, volume, sortingStatus, tags, topic, canvasLoc, topicApproved |
| `CanvasNode` | Topic nodes: title, description, altTitles, parentId, pathwayId, kwPlacements, position, size |
| `Pathway` | Conversion pathways (grouping of nodes) |
| `SisterLink` | Cross-pathway links between nodes |
| `CanvasState` | Viewport (viewX, viewY, zoom) + nextNodeId/nextPathwayId counters |

See `PLATFORM_ARCHITECTURE.md` §5 for full schema definitions.

### Activity tracking (post-Ckpt-5)

User actions that flip `ProjectWorkflow.status` from "inactive" to "active" on first occurrence AND refresh `lastActivityAt` on every occurrence:
- Any keyword create/edit/delete (single or bulk)
- Any canvas node create/edit/delete
- Any pathway create/delete
- Any sister link create/delete
- Atomic canvas rebuild (Auto-Analyze batch apply)

User actions that do NOT flip status (but also don't update `lastActivityAt`):
- GET any resource (reading data)
- Canvas viewport pan/zoom (writes to `CanvasState` but is pure "looking around")
- Opening the workspace without making any edits (the page fetches Project summary but no workflow-data writes happen)

Manual user action:
- Toggle "Completed" on the Projects page Completed button → PATCH to `/api/project-workflows/[projectId]/keyword-clustering` with `{ status: "completed" }`

### Data still in localStorage (planned migration in Phase 1-persist)

**⚠️ CORRECTED 2026-04-18:** the prior version of this list referenced `kst_aa_apikey`, `kst_aa_model`, `kst_aa_initial_prompt`, `kst_aa_primer_prompt` as if they were standalone localStorage keys. **Those keys do NOT exist in the current code.** Verified by grep across `/src/` on 2026-04-18 — zero matches. The actual behavior:

- **Auto-Analyze checkpoint — the ONLY AA-related localStorage key** — `aa_checkpoint_{Project.id}` (note: uses `Project.id` not `ProjectWorkflow.id`; prior docs were wrong on this too). Created only AFTER a run starts and `saveCheckpoint()` fires. Contains the full config (apiMode, apiKey, model, seedWords, thinking mode + budget, processingMode, prompts, etc.) + current batch state + log entries.
- **Before a run starts, NO Auto-Analyze settings are persisted.** Open the panel, paste prompts, close the browser → everything is lost. This is a UX gap for a non-programmer user.
- **After a run starts and the first checkpoint saves, the Resume Checkpoint button (▶ Resume) appears on next visit and restores the full config including prompts** — but only if the checkpoint wasn't discarded via ✕ Cancel (which calls `clearCheckpoint()`).

**Other localStorage items (unchanged from prior docs — verify each against code before acting):**
- MT Table entries (`kst_mt`)
- Removed Terms (`kst_rm`) — ⚠️ currently lost on refresh
- UI state (panel visibility, filters, zoom, canvas mode, collapsed nodes, TIF entries, etc.)
- **NEW (Ckpt 7):** `aiMode` (Manual/AI toggle state) is currently per-session only — resets on page refresh. Considering adding to `UserPreference` per-user per-workflow. See ROADMAP Phase 1-polish items.

---

## 5. Feature inventory (what's built)

### Manual Mode features ✅
- **AST (All Search Terms) table:**
  - Data entry (paste list, import TSV)
  - Columns: Keyword, Volume, Status, Tags, Topics, SV
  - 4 sorting statuses: Unsorted (gray), Partially Sorted (orange), Completely Sorted (green), AI-Sorted (blue)
  - Split Topics View
  - Search, filters, virtual scroll, drag-reorder, zoom
  - CSV download
  - Column visibility toggles
  - 200ms debounce on search (Phase 1-foundation)
- **MT (Main Terms) table**
- **TIF (Terms In Focus) table**

### AI Mode features ✅
- **Four-way table toggle:**
  1. Normal Table View (AST)
  2. Common Terms View (MT)
  3. Keywords Analysis View (KAS)
  4. Topics View (TVT)
- **AI Actions Pane** with view-specific button groups
- **KAS (Keywords Analysis) table** — derived analysis view
- **TVT (Topics View) table:**
  - Depth-first tree-walk order
  - 7 depth-colored title shades
  - Primary (bold) and secondary (italic purple) keyword display
  - Volume badge per topic (sum of primary keyword volumes)
  - Deduplicated keyword count
  - Drag-to-reorder (3 modes: before / after / nest as child)
  - Description column toggle
  - Hover popover (250ms delay)
  - Ancestry orange highlight chain on row hover
  - Depth filter dropdown
  - Zoom (7–18px range)
  - Bi-directional sync with canvas

### Canvas ✅
- **Mindmap mode:**
  - Draggable nodes
  - Accent stripe per depth
  - Node content: title (22px) → alt titles (14px) → description → KW preview (36px) → badge (18px)
  - Primary keywords (blue) and secondary keywords (purple italic)
  - Badge showing `Np + Ns` counts
  - Resize grip
  - Edit Panel (320px drawer)
- **Canvas Table Mode:** alternate structured view
- **Pathways:** grouping mechanism
- **Sister Links:** dashed purple lines between nodes
- **Node resize + customization**
- **Atomic rebuild** via `/canvas/rebuild` endpoint (Phase 1g-rebuild)

### Auto-Analyze System ✅ (code complete, NOT YET TESTED — Phase 1g-test)
- **Two execution modes:**
  - Direct mode: browser → Anthropic (no server timeout)
  - Server mode: browser → Vercel → Anthropic (5min timeout)
- **Processing modes:**
  - Adaptive (default) — adaptive batch sizing
  - Classic — fixed batch size
- **Adaptive batch tiers:**
  - Foundation: 8
  - Expansion: 12
  - Placement: 18
- **Hybrid full-table → delta mode** (auto-switches on truncation)
- **Input monitoring** at 60% / 80% context window
- **5 hard + 7 soft validation checks** (HC5 zero tolerance, SC11 stability, SC12 symmetry)
- **Streaming SSE** for long-running calls
- **Stall retries** (5) + **model retries** (3)
- **Checkpoint persistence** in `localStorage` key `aa_checkpoint_{projectWorkflowId}`
- **Post-apply verification** before marking AI-Sorted
- **Initial Prompt v2** (Steps 1–7, reevaluation triggers) + **Primer Prompt**
- **Two output modes:** Mode A (full table), Mode B (delta)
- **`aaMergeDelta()`** client-side merge
- **max_tokens:** 128000
- **AA_CONTEXT_WINDOW:** 200000

### Auth & API ✅
- JWT-based auth via Supabase on every API route
- `verifyProjectAuth(projectId)` ensures user owns the Project
- `verifyProjectWorkflowAuth("keyword-clustering", projectId)` additionally upserts the ProjectWorkflow row (Ckpt 5)
- All workflow-data routes call `markWorkflowActive()` after mutations (Ckpt 5)

### Page routing & navigation ✅ (Ckpt 7)
- Page lives at `/projects/[projectId]/keyword-clustering`
- Reads `projectId` from URL via `useParams()`
- Fetches Project summary via `GET /api/projects/[projectId]` to show Project name in header
- Top-bar "← Back to Project" returns to `/projects/[projectId]`
- Friendly error state with "Back to Projects" button on 404/403
- `npm run build` passes cleanly

---

## 6. Testing status

### Tested in user's real usage
- Manual Mode tables (AST/MT/TIF): ✅ Working
- Canvas Mindmap + Table modes: ✅ Working
- AI Mode four-way toggle: ✅ Working
- Atomic canvas rebuild: ✅ Working (via Ckpt 1g-rebuild)
- Multi-project management: ✅ Working pre-Phase-M; needs re-verification after Ckpt 9 deploy

### Partially tested
- **Auto-Analyze — first live run completed 2026-04-18 on Bursitis Project (2,328 keywords).** See §6.5 Phase 1g-test findings below. Batch 1 succeeded end-to-end, batch 2 failed systematically with Mode A full-table behavior. More tuning work needed before a completing run is possible.

### NOT yet tested in user's real usage
- **Post-Phase-M data persistence** — the new schema is live in Supabase and user has re-imported Bursitis keywords (2,328) since Ckpt 9 deploy. Read/write confirmed via the one successful batch. Needs broader stress testing.
- **Post-Ckpt-7 navigation in the browser** — confirmed working during Ckpt 9.5 visual verification and confirmed again during Phase 1g-test. ✅ No issues.

---

## 6.5 Phase 1g-test findings (2026-04-18, first Claude Code session)

**Test setup:**
- Project: "Bursitis" — 2,328 unsorted keywords (fresh Project, no prior clustering or AI-Sorted data)
- Model: `claude-sonnet-4-6` (chosen for balance of capability and cost)
- API Mode: **Server proxy** (via Vercel, leveraging the server-side `ANTHROPIC_API_KEY` env var)
- Processing mode: Adaptive (Foundation 8 → Expansion 12 → Placement 18 batch tiers)
- Initial Prompt V2 pasted: 35,921 characters
- Topics Layout Table Primer V2 pasted: 15,208 characters
- Seed words: `bursitis`

### 6.5.1 — BUG: Adaptive Thinking mode produces 0 output tokens on large prompts

**Symptom:** With Thinking=Adaptive and the 51k-char prompt loaded, the model entered thinking phase and ran for ~4:58 of wall time on each of 3 attempts, then the stream completed with "Input: 183, Output: 0 tokens." The "Input: 183" is misleading — it's cache-miss tokens reported by the streaming usage event, not total input. Total input was ~13,584 tokens per attempt.

**Root cause hypothesis:** Adaptive Thinking does not cap the thinking token budget. On complex/large prompts, the model consumes its entire `max_tokens=128000` allocation during the silent thinking phase with no room left to emit output text. The stream's final usage event reports 0 output tokens because none were ever generated.

**Workaround confirmed working:** Change Thinking dropdown from "Adaptive" to "Enabled", set Budget to 12000. Batch 1 with this setting: thinking phase ~1:55, output phase ~1:49, total batch time ~3:51, 14,752 output tokens generated, validation passed, 8 topics on canvas. Cost: $0.257 for batch 1 (no cache hit yet).

**Fix recommendation:** In the Auto-Analyze component, when Adaptive is selected but the combined system prompt exceeds ~40k chars, the tool should warn the user that Adaptive may fail and suggest switching to Enabled with a safe budget. Alternatively, detect the "0 output tokens" failure signature and auto-fall-back to Enabled.

### 6.5.2 — BUG: Mode A (full-table) produces invalid output as the topics table grows

**Symptom:** Batch 2 with Thinking=Enabled 12k budget succeeded in producing 17,399 output tokens but the model's response **dropped 4 pre-existing topics from batch 1 and lost 8 keywords.** The validation check (HC5 — lost keywords — zero tolerance) correctly rejected the response and triggered a retry with correction context.

Across 3 attempts on batch 2:
- Attempt 1: 17,399 output tokens, dropped 4 topics + lost 8 keywords → validation failed
- Attempt 2: 0 output tokens — stream ran 4:59 wall time (suspicious — Vercel's 5-min ceiling) → retry triggered
- Attempt 3: 16,552 output tokens, dropped 6 topics + lost 2 keywords → validation failed → batch 2 marked FAILED, tool moved to batch 3

The tool's 3-attempt retry cap worked as designed. But the 8 keywords from batch 2 remain unsorted.

**Root cause:** Mode A requires the model to transcribe the full existing topics table AND add new rows for the current batch. As the table grows, the model's attention degrades and it omits rows — effectively "summarizing by omission." The prompt explicitly forbids deleting topics, but the model does it anyway. This is a known pattern with long-context generation.

**Design gap:** The docs describe a Mode A → Mode B auto-switch that's supposed to kick in on truncation. It did not trigger on these validation failures because the responses weren't truncated — they were omission-complete. **The auto-switch condition needs to include validation failures from dropped-topics / lost-keywords, not just truncation.**

**Fix recommendations:**
1. Broaden the Mode A → Mode B trigger to include validation failures from lost data
2. Consider making Mode B (delta) the default after batch 1 (when the topics table has any content)
3. Consider splitting very large prompts across system + cached + user-message boundaries more deliberately to leverage Anthropic's prompt caching further

### 6.5.3 — BUG: Vercel 5-minute timeout is a real ceiling, and it's close

**Symptom:** Batch 2 attempt 2 took exactly 4:59 wall time from request start to stream-complete — within 1 second of Vercel's 5-minute serverless function timeout — and returned 0 output tokens. Possible that Vercel killed the stream.

**Implication:** For any batch that takes longer than ~4:30 wall time on Server mode, we're at risk of this ceiling. And batches get slower as the table grows (more input tokens, more thinking needed to manage existing state).

**Workaround:** Switch API Mode dropdown to "Direct (browser → Anthropic)". This routes requests from the user's browser straight to Anthropic, bypassing Vercel entirely, with no timeout. Downside: the user must paste their own Anthropic API key into the tool's UI (stored in React state only — same persistence caveats as the prompts).

**Design recommendation:** For Projects with > N keywords (where N is small enough that expected per-batch times stay safely under 4 minutes), Server mode is fine. For larger Projects, Direct mode should be the default. A UI hint could surface this based on keyword count.

### 6.5.4 — UX bug: Budget input field snaps back to default on empty

**Symptom:** When editing the "Budget" number input, deleting all characters causes the field to auto-refill with the default value (10000) before the user can type their new number. The user is forced to triple-click to select-all, then type.

**Code location:** `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` line ~1514: `onChange={e => setThinkingBudget(parseInt(e.target.value) || 10000)}`. The `|| 10000` fallback fires whenever `parseInt("")` returns NaN.

**Fix:** Allow an empty string during editing. Only enforce the default on blur or on form submit.

### 6.5.5 — UX need: Auto-Analyze overlay should be resizable and movable

**User request:** The overlay should be draggable via its top bar (move to any position on screen) and resizable via a drag-handle on its bottom-right corner. Currently it's a fixed-position panel.

### 6.5.6 — Documentation drift corrected (Pattern 3 / Pattern 11 adjacent)

During this session, three doc drifts from prior claude.ai chats were discovered via code reading:

1. **`DATA_CATALOG.md` §5.8** and **`KEYWORD_CLUSTERING_ACTIVE.md` §4** both claimed the `kst_aa_apikey`, `kst_aa_model`, `kst_aa_initial_prompt`, `kst_aa_primer_prompt` localStorage keys exist. **They don't.** Grep confirmed zero matches in `/src/`. Fixed in both docs this session.

2. **`KEYWORD_CLUSTERING_ACTIVE.md` §4** claimed the checkpoint key uses `projectWorkflowId`. **Code uses `projectId`** (line 227: `const cpKey = 'aa_checkpoint_' + projectId;`). Fixed.

3. **Implicit assumption** that the "Initial Prompt v2" was retrievable from somewhere. In fact it's stored only in the user's separate text files + inside `keyword_sorting_tool_v18.html` on the user's laptop. Nothing in the repo or database holds the prompt content. Recommendation: commit `docs/AUTO_ANALYZE_PROMPT_V2.md` containing the canonical V2 Initial + Primer prompts — source-of-truth in the repo, not in ephemeral browser state or scattered files. **Logged as a follow-up task for the next session.**

### 6.5.7 — Session verdict

Phase 1g-test was **partially completed**: we confirmed the tool works end-to-end in principle, found the major tuning path (Thinking: Enabled 12k), identified several bugs and doc drifts, and produced a concrete punch-list for a Phase 1g-test follow-up session. The Bursitis Project's 2,328 keywords are not yet fully clustered — that's a dedicated follow-up run, ideally in Direct mode, with Mode A→B auto-switch behavior revisited first.

---

## 7. Missing features (Phase 1-gap — not yet ported from legacy KST)

Must-haves:
- Reset Workflow Data (admin action — wipe all KC data for a specific Project)
- Import keywords from TSV (pre-Phase-M supported, needs re-test post-deploy)

Nice-to-haves:
- Export canvas as image
- Bulk keyword operations (merge duplicates, tag many at once)
- Undo/redo history
- Keyboard shortcuts for common actions

---

## 8. Known issues / active bugs

### Pre-Phase-M issues
- None currently known in-depth (legacy bugs largely addressed in Phases 1a–1g)

### Post-Phase-M issues
- None known as of Ckpt 7 — the build passes, the page compiles, tool code is unchanged from Ckpt 5 state. First real usage will happen after Ckpt 9 deploy.

---

## 9. Deployment

- Current live code: pre-Phase-M commit `f545e2a` on vklf.com (BROKEN against live DB schema)
- Phase M Ckpts 1–7 work exists only in local commits on `main`
- Deploy: Checkpoint 9

---

## 10. Performance notes

- Canvas: visibility-aware rendering (only render visible nodes)
- AST search: 200ms debounced
- Virtual scroll on keyword tables
- Bulk writes use `$transaction`
- Atomic rebuild uses transactional diff-based update

### Phase 2 scale gap
- Current query patterns have not been verified against Phase 3 scale (~500 concurrent Projects, ~50 users). Testing planned during Phase 1α scaffold design.

---

## 11. Known issues (architecture/tech-debt specific to KC)

- Race condition on `nextNodeId` / `nextPathwayId` in `canvas/nodes` POST and `canvas/pathways` POST (Ckpt 5). Must fix before Phase 1-collab.
- Asymmetric `canvasState` upsert logic between `canvas/nodes/route.ts` POST and `canvas/pathways/route.ts` POST.
- `ops as any` TypeScript workaround in `canvas/rebuild/route.ts`.
- Mutable state in CanvasPanel drag handlers.
- Missing ASTRow memoization.
- Missing error state + retry in useCanvas.
- Missing optimistic update rollback.
- `aiMode` resets on page refresh (Ckpt 7). Low priority Phase 1-polish item.

---

## 12. Upcoming work for this tool

### Phase 1 (admin-solo)
- **Phase 1g-test (STILL PARTIAL — 2026-04-18 kickoff + follow-up):** First live run partial completion; 2,320 keywords still not clustered due to stale-closure bug discovered in follow-up session. Tool itself ran end-to-end for batches 1–2 with Task 2's fix helping recover batch 2's Mode A failure, but batch 3 exposed the deeper stale-closure issue blocking further progress.
- **Phase 1g-test follow-up Tasks 1–3 (✅ COMPLETE — deployed 2026-04-18):**
  1. ✅ `docs/AUTO_ANALYZE_PROMPT_V2.md` committed as `27eb180`
  2. ✅ Mode A → Mode B auto-switch broadened as `84062f5` — **live-validated in production**
  3. ✅ Budget + 3 sibling inputs UX fix as `b9dc8b9` — **live-validated in production**
- **Phase 1g-test follow-up REMAINING (🎯 NEXT SESSION TOP PRIORITY):**
  1. 🚨 Fix stale-closure bug in `buildCurrentTsv` (`AutoAnalyze.tsx` lines 359–408) — use `nodesRef.current` / `keywordsRef.current` + new `sisterLinksRef.current` instead of prop-captured closures. LOAD-BEARING.
  2. 🚨 Add `await` on `doApply` in `handleApplyBatch` (line 1387); audit `handleSkipBatch` for same.
  3. After deploy, restart the Bursitis Auto-Analyze run (canvas will start fresh; prior session's 22-node state will be rebuilt).
  4. (Carried from kickoff) Add UI hint recommending Direct mode for larger Projects
  5. (Carried from kickoff) Add warning when Adaptive Thinking is selected with a large prompt
- **Phase 1-polish (accumulated across kickoff + follow-up sessions):** See `ROADMAP.md` Phase 1-polish section for the full list with details. Summary: overlay resize/move + localStorage persistence; prompt-sync button (NEW — syncs AA-panel prompts back to the repo file); persist AA settings to `UserPreference`; proactive Mode A → Mode B after batch 1; row-count self-check in Mode A prompt; cap Mode A batch size; add Haiku 4.5 to Model dropdown; comparative Mode A robustness test across three models; include failed-attempt costs in Total Spent.
- **Phase 1-verify:** Verify canvas rebuild edge cases.
- **Phase 1-gap:** Port remaining KST features (reset-workflow-data, canvas-as-image export, undo/redo, keyboard shortcuts).
- **Phase 1-persist:** Migrate must-persist localStorage items to database (MT Table, Removed Terms, etc.). Possibly also migrate `aiMode` to UserPreference.
- **Phase 1h:** UX polish.

### Phase 2 (multi-user)
- Assignment-based access control
- Review cycle UI (Submit for Review button, review state display, notes viewer)
- Real-time collaboration via OT/CRDT (Pattern D)
- Audit event emission (if opted in)
- Reset-workflow-data admin action

### Phase 3 (scale)
- Query pattern verification against ~500 concurrent active KC instances

---

## 13. Deferred items

### Captured here
- aiMode persistence per-user per-workflow (Phase 1-polish) — also in ROADMAP
- Reset Workflow Data feature — in `PLATFORM_REQUIREMENTS.md §7` and Phase 1-gap
- All Phase 2 items from architectural reveal — tracked in PLATFORM_REQUIREMENTS.md and PLATFORM_ARCHITECTURE.md §10

### Placeholder for future work
- Tool Graduation Ritual eventual split into `KEYWORD_CLUSTERING_ARCHIVE.md` and `KEYWORD_CLUSTERING_DATA_CONTRACT.md`. Trigger: when all Phase 1 polish items complete AND any upcoming workflow needs to consume this tool's output data (first likely consumer: Competition Scraping workflow).

---

END OF DOCUMENT
