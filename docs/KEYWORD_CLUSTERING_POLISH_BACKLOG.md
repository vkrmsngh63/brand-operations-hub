# KEYWORD CLUSTERING — POLISH BACKLOG

**Companion to `KEYWORD_CLUSTERING_DATA_CONTRACT.md`.**

**Purpose:** outstanding polish + feature work that did NOT gate W#1 graduation (2026-05-12) but is queued for future sessions. Each item is sized + scoped + carries an explicit priority. Items migrated here from `KEYWORD_CLUSTERING_ACTIVE.md` standing instructions (b)–(l) at the 2026-05-12 graduation session, plus three NEW items surfaced during the graduation Data Capture Interview.

**Loading rule:** read this doc fully if your Rule 22 re-entry task touches a polish item. Otherwise, the Data Contract is sufficient.

**Last updated:** 2026-05-12 (W#1 graduation session — sidecar created).

---

## 🚨 HIGH priority

### H-1. Action history table + per-action undo

**Status:** NOT STARTED. Feature confirmed missing in 2026-05-05-d investigation.

**What it is:** today's `useEmitAuditEvent()` is explicitly a Phase-2 stub no-op (`src/lib/workflow-components/use-workflow-context.tsx:193-206`); there is no `AuditEvent` table in `prisma/schema.prisma`; the activity log during runs is in-memory only (cleared when overlay closes); no per-action undo exists (only destructive Reset Workflow). A D3 run executes hundreds of AI ops with zero persistent record.

**Work split:**
- (a) `AuditEvent` schema (per-action audit row with op type, payload, timestamp, user, before/after state)
- (b) Wire `useEmitAuditEvent()` to real DB inserts in operation-applier paths (every ADD_TOPIC / MOVE_KEYWORD / etc.)
- (c) Action History UI tab in the AST panel — chronological list of every op with filter/search
- (d) Per-action undo design session BEFORE build — some ops easy reverses (ADD_TOPIC ↔ DELETE_TOPIC), others compose nontrivially (SPLIT_TOPIC, MERGE_TOPICS with auto-reparenting)

**Estimated:** 3–5 sessions total. Largely additive — doesn't gate downstream workflows; can run parallel with other work.

---

## 🟡 MEDIUM priority

### M-1. Pending server-side migrations (3 items — NEW 2026-05-12 graduation interview)

**Surfaced 2026-05-12** during the graduation Data Capture Interview when director said: *"We want nothing stored locally and this functionality should have been moved server side. It would help to check what other things are stored locally so that we can decide to move them server side."*

**Architectural principle in play:** director's standing 2026-05-08-c principle — *"no matter where the user logs in, they can pick up where they left off."* The three items below violate it.

**Data Contract impact:** when each migration ships, `KEYWORD_CLUSTERING_DATA_CONTRACT.md` bumps to v2 per Rule 23 versioned-contract pattern.

#### M-1.a Main Terms — `localStorage kst_mt` → server-side
- **Migration scope:** new `MainTerm` table FK'd to `ProjectWorkflow` (OR extend `Keyword` with an `isMainTerm` flag — decision deferred to design moment); API route at `/api/projects/[projectId]/main-terms` (GET + PUT replace-whole-list inside a $transaction); `AutoAnalyze.tsx` wiring change; localStorage → DB one-time backfill on first load (read existing `kst_mt`, POST, clear localStorage key).
- **Estimated:** 1–2 sessions.

#### M-1.b Terms In Focus — session-only React state → server-side
- **Migration scope:** new `TermInFocus` table FK'd to `ProjectWorkflow`; API route at `/api/projects/[projectId]/terms-in-focus`; `AutoAnalyze.tsx` wiring change; NO backfill (session-only state has nothing to migrate, every Project starts empty).
- **Estimated:** 1 session — lightest of the three. Worst-case before migration: state clears on every page refresh.

#### M-1.c Auto-Analyze checkpoint — `localStorage aa_checkpoint_{Project.id}` → server-side
- **Migration scope:** new `AutoAnalyzeCheckpoint` table FK'd to `Project` (NOT `ProjectWorkflow` — the existing localStorage key uses `Project.id`) OR extend `UserPreference`; API route; `AutoAnalyze.tsx` Resume-detection wiring (key UX consideration: detect a paused-elsewhere run when user opens a different browser/device and offer cross-device Resume); localStorage → DB one-time backfill.
- **Estimated:** 1–2 sessions, largest of the three (full run-state JSON payload + cross-device UX).

**Explicit non-migration:** Anthropic API key (`localStorage aa_apikey_{projectId}`) STAYS client-side per 2026-04-24 Session 3a deliberate security split. Storing a user's third-party API secret in our DB even encrypted is a meaningful security delta from the original design call.

### M-2. Auto-Analyze cost forecasting + credit-balance check

**Status:** spec captured in ROADMAP 2026-05-05-d. NOT STARTED.

**What it is:** Auto-Analyze overlay shows running cumulative cost but no estimated remaining or estimated total. No pre-flight Anthropic-credit check, no in-run heartbeat warning. Bursitis Test 2 D3 RESUME hit this at batch 85 — three retries failed with `credit balance too low` and the run halted ~36 min until director topped up.

**Director-proposed algorithm:** sliding-window estimator (average of last 10 successful batches' cost × batches remaining + sliding-avg consolidation cost × consolidations remaining).

**Work scope:** ~50–100 LOC in `AutoAnalyze.tsx` for the in-run cost projection + small Anthropic API balance query helper for pre-flight + warning threshold logic for mid-run heartbeat.

**Estimated:** 1 session.

### M-3. Late-run validation-retry rate telemetry

**Status:** ROADMAP entry captured 2026-05-05-d. NOT STARTED.

**What it is:** At canvas ≥235 topics + >150k input tokens, batches occasionally drop ~5 keywords on first attempt; retry recovers cleanly but cost doubles. Bursitis Test 2 D3 RESUME hit this on batches 78 + 80 ($1.316 + $1.187 per batch vs. ~$0.65 nominal).

**Work scope:** instrument first — validation-retry rate per 10-batch sliding window with yellow-warning threshold at the in-run UI. Decide on behavioral fix only AFTER data lands across multiple runs.

**Estimated:** 1 session (telemetry only); behavioral fix is a separate downstream decision.

---

## 🔵 LOW priority — polish bundle

### L-1. Archived-terms post-run visibility
Auto-Analyze archives ARE persisted to `RemovedKeyword` table with `removedSource='auto-ai-detected-irrelevant'` and surface in the "🗑 Removed Terms" overlay with AI reasoning visible — but discoverability is poor. After a run that archives 117 keywords (Bursitis Test 2 cons #8 stress test), no banner/toast points the director to the table. ~10–20 LOC.

### L-2. Auto-Analyze overlay font-size pass
Director feedback 2026-05-05-d: all data in the Auto-Analyze overlay is too small. Apply typography pass +1pt or +2pt across activity log, settings panel labels, status header, controls. ~30–50 LOC.

### L-3. Pre-flight visibility on Resume
Carried over from 2026-05-04-d. The Auto-Analyze pre-flight runner validates settings + prompts before a run; on Resume, the runner runs again but its output isn't surfaced as clearly. ~20–40 LOC.

### L-4. Canvas-size in workspace top-bar
Carried over. Show current canvas topic count + keyword count in the workspace top-bar so director can spot-check scale without opening the AST panel. ~15–25 LOC.

### L-5. Bulk-archive consolidation pattern at scale
Observed 2026-05-05-d: consolidation #4 archived 31 keywords, consolidation #8 archived 117 keywords — all celebrity+bursa homographs the per-batch model didn't catch but whole-canvas consolidation did. Working as designed but expensive ($0.699 + ~3 min for cons #8). Captured as "Improve per-batch celebrity-homograph detection" — could be a prompt-engineering pass or a per-batch homograph-detection sub-step.

---

## 🟣 CARRY-OVERS from prior sessions

### C-1. `[FLAKE]` visibility investigation
Telemetry from 2026-05-04 should log `[FLAKE]` lines for every catch-block error; director's prior Vercel pastes showed full stack traces but NO `[FLAKE]` lines visible. Same gap captured 2026-05-04-c + 2026-05-04-d. Independent of any other workflow. Standalone session. ~1 session.

### C-2. Phase-3 scaling reconsideration for atomic-batch fold-in
At canvas 700+ topics with ~3,500 keywords per batch × 50 concurrent workers, the single-transaction connection-hold model in the atomic-batch fold-in becomes its own ceiling. Architectural work; not blocking today's launch scale. ~2–4 sessions when triggered.

### C-3. Backend integration tests for canvas/rebuild fold-in
Repo currently has no Prisma route-level test harness; existing tests cover underlying primitives. Pickup when test harness is set up OR after live verification across full D3 proves no remaining edge cases. ~1–2 sessions.

### C-4. Auto-fire toggle absence investigation
Carried over from 2026-05-04-d. Look at whether the auto-fire toggle (for consolidations) is genuinely absent or just hidden. ~0.5 session.

### C-5. Wrap remaining unwrapped routes
`/projects` GET N+1 etc. — apply the `withRetry` parity pattern from 2026-05-04-b to the remaining ~30–50 LOC of unwrapped routes. ~1 session.

### C-6. GoTrueClient multi-instance fix
~15 LOC. Carried over.

### C-7. V3-era cleanup pass
Deferred from Session E D4 (April). Remove V3 dead code now that V4 prompts are live. ~1 session.

---

## ⛔ EXPLICITLY LAST (director directive 2026-05-03-b)

### Z-1. Action-by-action feedback workflow + Prompt Refining button
Director's explicit 2026-05-03-b directive: this is the **last** item to build. ~5–7 sessions. Per-action feedback UI lets admin flag good/bad ops during a run; flagged ops feed into a Prompt Refining button that proposes V5 prompt updates. Foundational for moving from V4 → V5, but not until everything else stabilizes.

---

## 🟡 PARTIAL prereq monitoring (passive)

### P-1. Banner UI verification for cold-start render-layer fix (prereq #1)

**Status:** 🟡 PARTIAL. Happy-path verified live 2026-05-03-b across 5–10 hard refreshes (zero banner fired). Banner code path covered by unit tests + code review. Per the 2026-05-12 graduation decision, this folds into normal director use — if a flake ever fires during a future Auto-Analyze run or workspace cold-start, observe whether the banner renders correctly and at that moment flip prereq #1 to ✅ VERIFIED LIVE. No active session needed; passive monitoring.

**Reason the natural-flake event is rare:** the #3 withRetry parity fix + #4 Supabase Pro + #5b atomic-batch fold-in have engineered the natural-flake trigger close to never-fires (zero flakes across the 86-batch D3 RESUME at scale). The banner UI may legitimately never render in production — and that would be a feature of the system stability, not a verification gap.

---

## How items leave this backlog

- Items shipping: move to `KEYWORD_CLUSTERING_ARCHIVE.md` as a new STATE block + ROADMAP entry flipped to ✅ DONE; remove from this doc.
- Items deferred indefinitely: leave here with status updated.
- Items consolidated: cross-reference here.

**Cross-references:**
- `KEYWORD_CLUSTERING_DATA_CONTRACT.md` — current canonical W#1 contract (v1)
- `KEYWORD_CLUSTERING_ARCHIVE.md` — full W#1 development history
- `ROADMAP.md` — platform-wide priority view; W#1 polish items linked back here from ROADMAP rows
