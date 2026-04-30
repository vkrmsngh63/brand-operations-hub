# INPUT CONTEXT SCALING DESIGN
## Tiered Canvas Serialization for Auto-Analyze (Keyword Clustering)

**Created:** April 27, 2026 (Scale Session A — design-only session producing this doc + locked decisions + multi-session plan; no code, no DB)
**Created in session:** session_2026-04-27_input-context-scaling-design (Claude Code)
**Last updated:** April 30, 2026 (Scale Session C SHIPPED — see §6's Scale Session C subsection for SHIPPED notes; tiered serialization mechanism landed behind a default-OFF feature flag in `src/lib/auto-analyze-v3.ts`; Sessions D/E remain as forward work)
**Last updated in session:** session_2026-04-30-b_scale-session-c-build (Claude Code)
**Previously updated in session:** session_2026-04-30_scale-session-b-build (Claude Code)
**Previously updated in session:** session_2026-04-28_scale-session-0-outcome-c-and-full-run-feedback (Claude Code)
**Group:** B (tool-specific to Keyword Clustering's Auto-Analyze; loaded when scaling-related work is in scope)

**Purpose:** This is the canonical reference doc for the proposed input-side context-scaling solution for Auto-Analyze. It captures the locked design from Scale Session A (this session) and serves as the build spec for Scale Sessions B–E **if and when their trigger conditions fire**. Until then, the design is a contingent specification — the build path is gated behind the empirical validation of Scale Session 0 (next session).

**Background — why this design exists:**

V3's architectural pivot (Pivot Sessions A–E, 2026-04-25) solved THREE of four scaling concerns: keyword preservation (zero ghosts via "silence is preservation"), output-token scaling (operations-only output stays small), wall-clock per batch (~4× reduction). The fourth — **input scaling** — was acknowledged as a known trade-off in `PIVOT_DESIGN.md` lines 205 + 246 but no mitigation was designed. The full canvas TSV is serialized into every Auto-Analyze batch's prompt; per-topic cost ≈ 150–300 tokens; on long runs the input grows past Sonnet 4.6's 200k context window somewhere between roughly 600–1,000 topics — well within the size of a full Bursitis (2,329-keyword) project run.

V2 had a Mode A → Mode B auto-switch with delta OUTPUT credited with *"avoiding the projected 200k context wall"* on the 2026-04-20 51-batch Bursitis run (`ROADMAP.md` line 162). Pivot Session E (2026-04-25) deleted Mode A→B in full — `assemblePrompt`, `processBatch`, `validateResult`, `doApply`, `runSalvage`, `mergeDelta`, `parseKatMapping`, `extractBlock`, `buildCurrentTsv`, `AA_DELIMITERS`, `AA_OUTPUT_INSTRUCTIONS`, output-contract picker UI, Mode A→B auto-switch, `_deltaSwitch` error path, `deltaMode` state — all gone. **This deletion was correct for output-side concerns.** Mode A→B was an output-side delta mechanism; the remaining concern is input-side and requires a different design. **Mode A→B is NOT a viable rebuild target for the input-scaling problem.**

The director's directive entering Scale Session A (verbatim from `KEYWORD_CLUSTERING_ACTIVE.md` 2026-04-27 STATE block): *"fundamentally understand the issue and come up with a sturdy solution that not only scales up but does so without compromising quality."*

**Expected effects after this design lands (if built):** input grows with batch-relevant subtree size + recently-touched topics + low-stability topics, NOT with whole-canvas size. Caps the input scaling. Preserves V3's quality-preserving properties (silence is preservation; intent-equivalence detection; Reevaluation Pass coverage; JUSTIFY_RESTRUCTURE on stability ≥ 7.0). On a 1,000-topic canvas where ~50 topics are "actively being worked on," input drops ~5–10× vs. full-canvas serialization.

---

## 0. Scope reframe — test before build (NEW 2026-04-27, Cluster 5 lock; OUTCOME C FIRED 2026-04-28 — build path activated)

Before Scale Session B begins, **Scale Session 0 — empirical validation on Opus 4.7 1M-context** runs first. The director's anticipated production project size (≤ 500 topics per project) sits comfortably below the standard 200k Sonnet 4.6 wall (~600–800 topics) and trivially below a 1M-context window. **A model-upgrade-only solution may suffice without any of the design below being built.**

**Trigger conditions for proceeding to Scale Session B:**

1. **Outcome C from Scale Session 0 — V3 + Opus 4.7 still hits the wall or has unacceptable quality regression.** Build the design.
2. **A production project's canvas exceeds ~600 topics under the standard 200k window** in actual operation. Build the design.
3. **Anthropic deprecates 1M context, or 1M-tier pricing becomes economically prohibitive at Phase 3 scale (500 Projects/week).** Build the design.

If none of these fire, the design stays captured but unbuilt. This avoids the Pivot Session A failure mode in reverse: don't engineer a sturdy solution to a failure that doesn't actually fire at real-world scale.

### Status update — 2026-04-28: Outcome C FIRED + threshold (b) also FIRED

Scale Session 0 ran 2026-04-28. Director ran a full-Bursitis V3 Auto-Analyze on Sonnet 4.6 (151 of 281 batches) plus a separate Opus 4.7 cost test at run start.

**Empirical findings:**

| Trigger condition | Result | Status |
|---|---|---|
| Outcome A (V3 + Opus 4.7 1M handles ≤500 topics cleanly) | Opus 4.7 was economically prohibitive at run start (per-batch cost approached $1+ vs. Sonnet's $0.30-$0.85). Director switched back to Sonnet 4.6 after the cost test. | ❌ NOT FIRED |
| Outcome B (V3 + Opus 4.7 quality regression) | Not tested — director never ran enough batches on Opus 4.7 to evaluate quality. | (n/a) |
| Outcome C (V3 + Opus 4.7 still hits wall OR unacceptable cost) | Cost was unacceptable (Opus 4.7) AND wall was hit on Sonnet 4.6 at batch 151 (input 220,091 tokens, beyond standard 200k limit). | ✅ **FIRED** |
| Threshold (b) — production project exceeds ~600 topics under standard 200k window | Bursitis run reached ~700 topics at batch 151 before being stopped. | ✅ **FIRED** |

**Effect:** Scale Sessions B–E are now activated as the build path per `§6` below. **Build path is no longer gated; it is the next-priority forward action for Workflow #1.**

**Run cost data points (full activity log preserved in CHAT_REGISTRY entry):**

| Batch | Canvas size | Input tokens sent | Per-batch cost |
|---|---|---|---|
| 1 | 9 topics | ~19,925 | $0.30 |
| 30 | 141 topics | ~61,770 | $0.36 |
| 60 | 232 topics | ~87,013 | $0.38 |
| 90 | 384 topics | ~126,594 | $0.51 |
| 120 | 528 topics | ~169,365 | $0.64 |
| 151 | ~700 topics | **~220,000** | **$0.87 (over context limit)** |

Total cost for 151 of 281 batches: ~$70-80. Approximately $130-150 projected if the run had completed (which it could not, due to the wall).

**Status as of 2026-04-28 (end of Scale Session 0):** design from Scale Session A is the build spec. Scale Session B is the next session.

---

## 1. The unified mechanism — Tiered Canvas Serialization

V3 currently ships every topic on the canvas at full detail every batch. The proposed design ships every topic at one of **three tiers** of detail, decided per-topic per-batch by a tier decider that combines three signals: **batch-relevance**, **recency**, and **stability**.

The key insight is that D2 (selective subtree), D4 (topic-summary for stable topics), and D5 (recency-based hybrid) from the original five candidate directions (`ROADMAP.md` 🚨 section, lines 414–418) are all the same general pattern with different signals — and they fold into one mechanism with a multi-signal tier decider. D3 (periodic consolidation) layers on as an orthogonal complement; D1 (1M-context model) layers on as cap-headroom.

### 1.1 The three tiers (Cluster 1 locks)

| Tier | Per-topic columns shipped | Approx tokens | Used for |
|---|---|---|---|
| **Tier 0 — Full** | Stable ID, title, description, parent_id, relationship, conversion path, stability score, sister nodes, full keyword list with placements (UUID + text + p/s) | 150–300 | Topics in batch-relevant subtree; recently-touched topics; low-stability topics |
| **Tier 1 — Summary** | Stable ID, title, parent_id, stability score, **intent fingerprint**, keyword count, top-volume keyword (text + volume) | 30–50 | Default for stable + settled + off-batch topics |
| **Tier 2 — Skeleton** | Stable ID, title, parent_id | 10–15 | Deeply stale + high-stability + far-from-batch topics (rare) |

**Note on Tier 2:** the parent_id field is required (not just Stable ID + title) so the model can walk the hierarchy when an ancestor is at Tier 2. Without parent_id the chain breaks.

### 1.2 The intent fingerprint (Cluster 1, Q1 + Q2)

The intent fingerprint is the load-bearing field that lets the model detect intent-equivalence cross-canvas when a topic is at Tier 1.

**Format (Q2 lock):** Short canonical phrase, **5–15 words, in searcher-centric language**. Target ~20 tokens average. Example: *"Older bursitis sufferers seeking gentle, low-cost home relief."* Matches the existing V3 prompt's "topic titles in searcher-centric language" guidance — fingerprints are essentially a one-line expanded version of a good topic title.

**Who writes it (Q1 lock):** the AI, as part of these operations:
- **`ADD_TOPIC`** — required field `intent_fingerprint`
- **`MERGE_TOPICS`** — required field `merged_intent_fingerprint` (the merged topic's fingerprint)
- **`SPLIT_TOPIC`** — required field `intent_fingerprint` on each `into[]` element
- **`UPDATE_TOPIC_TITLE`** — required field `intent_fingerprint` (since title change usually shifts the topic's intent expression)
- **`UPDATE_TOPIC_DESCRIPTION`** — *optional* field; defaults to keeping existing fingerprint (most description changes are pure refinement; the AI may opt to refresh if a description rewrite shifts intent meaning)

**Where it lives:** new column `intentFingerprint String` on `CanvasNode` (NOT NULL after backfill). Mirrors the `stableId` migration pattern from Pivot Session B.

**Cluster 1 Q3 lock — Tier 1 keyword summary:** count + top-volume keyword. Example: *"12 keywords (8p + 4s), top volume kw: 'bursitis pain in older adults' (1,200)"*. The wiring layer or applier picks the highest-volume keyword from the topic's primary placements; ties broken alphabetically. Director accepted the "top kw is a noisy proxy" risk in exchange for placement-decision quality at Tier 1.

**Cluster 1 Q4 lock — three tiers from day one** (vs. starting with two): more compression headroom; AND-rule on Tier 2 eligibility keeps it rare and safe.

---

## 2. Tier decider rules (Cluster 2 locks)

For each topic on the canvas, every batch, the tier decider runs:

```
Tier 2 (Skeleton) — IF ALL of:
    - stability_score >= 7.0 (Q7 lock)
    AND not touched in last 10 batches (Q8 lock — stricter than the regular recency window)
    AND not in batch-relevance subtree

Otherwise Tier 0 (Full) — IF ANY of:
    - topic is in batch-relevance subtree (Cluster 3 mechanism)
    - topic was "touched" (per Q5) in last N batches (Q6 lock; N configurable, default 5)
    - topic's stability_score < 7.0 (Q7 lock)

Otherwise Tier 1 (Summary) — the default for stable, settled, off-batch topics

Q9 lock — no ancestor force-promotion. Tier 1's intent fingerprint and Tier 2's
title + parent_id are sufficient for the model to walk the hierarchy.
```

### 2.1 What counts as "touched" (Q5 lock)

**Q5 → B.** A topic is "touched" if any of these operations from the current or recent batch reference it:

- **Structural:** `ADD_TOPIC`, `MERGE_TOPICS`, `SPLIT_TOPIC`, `MOVE_TOPIC`, `DELETE_TOPIC`, `UPDATE_TOPIC_TITLE`, `UPDATE_TOPIC_DESCRIPTION`
- **Keyword ops:** `ADD_KEYWORD`, `MOVE_KEYWORD`, `REMOVE_KEYWORD`, `ARCHIVE_KEYWORD` (where the topic is referenced as `topic` / `from` / `to`)
- **Sister-link ops:** `ADD_SISTER_LINK`, `REMOVE_SISTER_LINK` (both endpoints are touched)

Touch propagation to ancestors was rejected (Q5 → C) — Tier 1 ancestors already preserve hierarchy navigation via parent_id.

### 2.2 Recency window N (Q6 lock)

**Q6 → D.** Configurable via Auto-Analyze settings (new field). **Default N = 5 batches.** Persisted via the existing `UserPreference` mechanism (`aa_settings_{projectId}` JSON blob; same pattern as other Auto-Analyze settings per `DATA_CATALOG.md §5.8`). With batch size 8 the default covers ~40 keywords' worth of recent work — matches the natural duration of "still actively building this region."

### 2.3 Stability threshold for Tier 1 demotion (Q7 lock)

**Q7 → A.** **7.0** — matches the existing JUSTIFY_RESTRUCTURE gate from `MODEL_QUALITY_SCORING.md`. Single threshold across both mechanisms. Clean conceptual model: *"topics ≥ 7.0 are settled enough that we both expect the model NOT to restructure them AND are willing to compress them to Tier 1."*

**Dormant in first ship.** No topic crosses 7.0 until the stability-scoring algorithm ships in a future session (currently captured in `PIVOT_DESIGN.md §5` as a deferred item). Until then, the recency signal does all the demotion work. The tier decider's code reads `stabilityScore` from each topic — when the algorithm ships and starts populating real values, stability-based demotion activates automatically without further Scale-Session work.

### 2.4 Tier 2 eligibility (Q8 lock)

**Q8 → A.** AND-rule — all three signals must converge:
- `stabilityScore >= 7.0`
- not touched in last 10 batches (twice the regular recency window — "deeply stale")
- not in batch-relevance subtree

Conservative by design. Tier 2 is the most aggressively compressed tier and therefore the highest risk of intent-equivalence misses; the AND-rule keeps it rare. Until stability scoring ships, Tier 2 is effectively never used.

### 2.5 Parent-path inclusion (Q9 lock)

**Q9 → C.** No ancestor force-promotion. When a Tier 0 topic has Tier-1 or Tier-2 ancestors, the model walks the hierarchy via `parent_id` (always present at every tier). Tier 1's intent fingerprint + Tier 2's title + parent_id are sufficient for placement reasoning.

---

## 3. Batch-relevance heuristic (Cluster 3 locks)

The batch-relevance signal asks: *"for this batch's keywords, which existing topics are likely candidates for placement (or related restructure operations)?"*

### 3.1 Mechanism (Q10 lock)

**Q10 → A.** Heuristic in the wiring layer — pure local string matching, no extra model call. Avoids cost + latency of a second model call per batch. The forgiving design property of the tier decider — false negatives mean Tier 1 (still readable), not hidden — keeps the precision bar moderate.

### 3.2 Subtree inclusion (Q11 lock)

**Q11 → C.** For each candidate topic identified by the heuristic, the **one-hop neighborhood** is promoted to Tier 0:
- The candidate topic itself
- Its immediate parent
- Its immediate siblings (same parent)
- Its immediate children

The model needs the candidate's children (for "should this new keyword join the candidate's primary or be a *new* child *under* the candidate?") and its parent + siblings (for "child vs. sibling" decisions).

### 3.3 Match algorithm (Q12 lock)

**Q12 → C.** Stem-based token-overlap against **(topic title + intent fingerprint + existing keyword text)**.

**Pseudocode:**
```
for each new keyword K in current batch:
    K_stems = stem_tokens(lowercase(K), strip_stopwords)
    for each topic T in canvas:
        T_strings = [T.title, T.intent_fingerprint] + [kw.text for kw in T.keywords]
        T_stems = union of stem_tokens(strip_stopwords(s)) for s in T_strings
        score[T] += |K_stems ∩ T_stems|
    candidates = [T for T in canvas if score[T] >= 2]
    promote to Tier 0: candidates + one_hop_neighborhood(candidates)
```

**Cost:** bounded and well below any LLM call. On a 1,000-topic canvas: ~3M token-ops per batch, sub-millisecond on modern hardware.

### 3.4 Autonomous decisions (per Rule 14d — flagged for director override)

- **Match threshold:** fixed at "≥2 stems shared" for the first ship. Tunable later if validation reveals poor recall.
- **False-negative behavior:** if no topics pass the threshold, no batch-relevance signal fires this batch; recency + stability still apply.
- **Wiring layer location:** match logic lives in `src/lib/auto-analyze-v3.ts` alongside `buildOperationsInputTsv`. ~100 LOC addition.
- **Tokenization:** lowercase, split on non-alphanumeric, strip stopwords (a, the, of, in, etc.), Porter stem.

---

## 4. Consolidation pass + fingerprint backfill (Cluster 4 locks)

### 4.1 Consolidation pass — orthogonal complement (D3)

Consolidation is the recovery mechanism: it runs as a separate full-canvas pass that DOES see every topic at Tier 0, so Reevaluation triggers can fire on parts of the canvas that the regular Auto-Analyze batches skipped via Tier 1 / Tier 2 compression. Counters Constraint C (Reevaluation Pass coverage) on demoted topics.

**Cadence (Q13 lock):** **Q13 → C.** Both auto-firing and admin-triggered:
- **Auto-fire** every 10 batches (configurable via Auto-Analyze settings; default cadence = 10). Gated to canvas size > 100 topics so it doesn't waste spend on small canvases (autonomous detail per Rule 14d).
- **Admin-triggered** "Consolidate Now" button in the Auto-Analyze panel.

**Operation vocabulary (Q14 lock):** **Q14 → B.** Full V3 vocabulary minus `ADD_TOPIC` and `ADD_KEYWORD` — no new keywords introduced during consolidation. Valid: `MERGE_TOPICS`, `SPLIT_TOPIC`, `MOVE_TOPIC`, `DELETE_TOPIC`, `UPDATE_TOPIC_TITLE`, `UPDATE_TOPIC_DESCRIPTION`, `MOVE_KEYWORD`, `REMOVE_KEYWORD`, `ARCHIVE_KEYWORD`, `ADD_SISTER_LINK`, `REMOVE_SISTER_LINK`. Atomic apply (same as Auto-Analyze).

**Touch recording (Q15 lock):** **Q15 → A.** Yes — consolidation operations record touches for the recency signal. A topic modified during consolidation gets standard recency treatment (Tier 0 for the next N batches) so the next few regular Auto-Analyze batches can verify the consolidation took.

### 4.2 Fingerprint backfill (Q16 lock)

**Q16 → A.** One-time AI-generated backfill pass per project, runs in Scale Session B:
- For each existing topic, send `(title + description + keyword list)` to the AI; receive intent fingerprint; write to DB
- Idempotent script `scripts/backfill-intent-fingerprints.ts` (mirrors `scripts/backfill-stable-ids.ts` from Pivot Session B)
- Batched (~25 topics per Anthropic call)
- Cost: ~$0.30–$1.00 per project
- Tested on test project first (~25 topics); then run on Bursitis (~104 topics)
- Re-runnable safely

Topics without a fingerprint cannot be safely demoted to Tier 1 — they're force-pinned to Tier 0 until backfilled.

---

## 5. How the four constraints are addressed

| Constraint | Mechanism in this design | Status |
|---|---|---|
| **A. Silence is preservation** | The applier is unchanged; tiering only affects what the model sees, not what the tool does with the result. Operation-applier logic (Pivot Session B's `src/lib/operation-applier.ts`) preserves all keywords structurally. | ✅ Preserved unchanged. |
| **B. Intent-equivalence detection** | The intent fingerprint per topic at Tier 1 carries searcher-centric intent expression in compressed form. The model can detect intent-equivalence cross-canvas using fingerprints alone. Risk: if fingerprints are weak, duplicates leak through and Reevaluation merges later. Mitigation: AI writes fingerprints (Q1 lock) so they're internally consistent with topic-naming voice; Reevaluation Pass triggers can fire on fingerprints. | ⚠️ Preserved IF fingerprint quality holds (load-bearing assumption to validate in Scale Session D). |
| **C. Reevaluation Pass triggers** | Tier 0 topics get full Reevaluation coverage every batch (recently-touched + low-stability + batch-relevant). Tier 1 / Tier 2 topics get **partial** coverage — Pass 3a (intent-equivalence) can still fire on fingerprints; Passes that need full descriptions don't fire on demoted topics this batch. **Recovery via consolidation pass (D3)** which sees every topic at Tier 0 on a slower cadence. | ⚠️ Mostly preserved with consolidation as the recovery mechanism. |
| **D. JUSTIFY_RESTRUCTURE on stability ≥ 7.0** | Stability score is in Tier 1 (and effectively in Tier 2 since topics ≥ 7.0 stability could land at Tier 2 only if all signals converge). Topics the model might want to restructure (< 7.0 stability) get force-promoted to Tier 0 anyway via the stability signal. | ✅ Preserved. |

---

## 6. Multi-session implementation plan (Cluster 5 lock)

### Scale Session A — DONE (this session, 2026-04-27)
Design + locked decisions + multi-session plan. This doc is the deliverable.

### Scale Session 0 — Empirical validation on Opus 4.7 (~1 session, NEXT)
**Trigger:** none — this session runs before any build commitment.

**Scope:** Validate whether V3 on Opus 4.7 1M-context handles the director's anticipated production scale (≤500 topics per project) without quality regression. No code changes.

**Deliverables:**
1. Verify Opus 4.7's 1M-context tier availability + pricing via Anthropic docs / API capability check.
2. Switch the Auto-Analyze model selector to Opus 4.7 (1M context if available); director's existing in-flight test project can serve as a starting point.
3. Run focused tests on V3:
   - **Production-typical:** 200–500-keyword project; verify quality (compound primaries, complement pairs, unifying parents, empty bridge topics) holds; observe input-token usage, cost, wall-clock.
   - **Stress test (optional):** push a Bursitis-sized run on Opus 4.7 1M; observe whether the wall is hit at all, at what topic count, and at what cumulative cost.
4. Decision based on outcome:
   - **Outcome A — works cleanly within forecast scale.** Defer Scale Sessions B–E indefinitely. Switch production model. Update this doc's §0 with "VALIDATED 2026-MM-DD on Opus 4.7 — design unbuilt."
   - **Outcome B — quality regression on Opus 4.7.** Diagnose: prompt re-tune for Opus, NOT a scaling problem. Open separate prompt-refinement session.
   - **Outcome C — V3 + Opus 4.7 still hits wall or unacceptable cost.** Trigger fires. Proceed to Scale Session B.

**Validation criteria:**
- Director qualitative inspection of canvas matches yesterday's "everything is working perfectly so far" outcome.
- Scaling math holds: at director's anticipated max topic count, total input + output tokens stay comfortable on whichever context window is in use.
- Cost per batch within tolerance (rough target: stays under $0.50/batch on production-typical projects).

**Risk profile:** Low. No code, no schema, no prompt changes. Just running the existing tool with a different model selector.

### Scale Session B — Schema migration + applier + fingerprint backfill (~1 session) — ✅ SHIPPED 2026-04-30
**Trigger:** Outcome C from Scale Session 0.

**Shipped 2026-04-30 in `session_2026-04-30_scale-session-b-build` (Claude Code).** All deliverables below executed live. Two pushes deployed (Part 1 commit `350e7dc` + Part 2 — Step 3 schema flip + cleanup + docs). 37 Bursitis Test topics live-backfilled by a small fresh AI run on the local dev server before Step 3. Backfill script (`scripts/backfill-intent-fingerprints.ts`) cost ~$0.20 across dry-run + real. 22 new src/lib unit tests (16 applier fingerprint + 6 parser fingerprint) → 210 total. Build clean; lint at exact baseline parity. Per-deliverable status notes in §6's Scale Session B subsection are SHIPPED unless otherwise marked. See `KEYWORD_CLUSTERING_ACTIVE.md` POST-2026-04-30-SCALE-SESSION-B STATE block for full session-level summary. **Scale Session C is the next-priority forward action.**

**Scope:** Add `intentFingerprint` column to DB. Update operation-applier. Run backfill script.

**Deliverables:**
1. **3-step schema migration** (mirrors Pivot Session B's stableId pattern):
   - **Step 1 (Rule-8 gate):** Add `intentFingerprint String?` (nullable). Pure additive. `npx prisma db push`.
   - **Step 2:** Run `scripts/backfill-intent-fingerprints.ts` — AI-generates fingerprint for each existing topic. Idempotent. Test project first; then Bursitis. Rule-8 gate on API spend (~$1–$2).
   - **Step 3 (Rule-8 gate):** Tighten `intentFingerprint String?` → NOT NULL. Verification query first (zero NULL rows). **Pre-flight Rule-16 zoom-out:** audit existing callers (`prisma.canvasNode.create`, `prisma.canvasNode.upsert`); patch to supply `intentFingerprint` at create time before tightening — same lesson as Pivot Session B's Rule-16 entry in `CORRECTIONS_LOG.md` 2026-04-25.
2. **Update `src/lib/operation-applier.ts`:** add `intentFingerprint` field validation on `AddTopicOp`, `MergeTopicsOp`, `SplitTopicOp` `into[]` element, `UpdateTopicTitleOp`. Optional on `UpdateTopicDescriptionOp`. ~50 LOC + ~10 unit tests.
3. **Update `src/lib/auto-analyze-v3.ts`:** parser snake_case → camelCase translation for `intent_fingerprint`. ~10 LOC + ~3 unit tests.
4. **Backfill script** `scripts/backfill-intent-fingerprints.ts`. ~150 LOC.
5. **Patch existing routes** (`canvas/nodes/route.ts` POST + `canvas/rebuild/route.ts` upsert.create) to supply `intentFingerprint` (placeholder `""` for non-AI flows; AI refreshes on first UPDATE_TOPIC_TITLE).

**Validation:** `npm run build` clean; `npx tsc --noEmit` clean; 74+13 tests passing; backfill verified on test project before Bursitis.

**Risk profile:** Medium. Schema constraint change is the highest-risk piece. Mitigated by Rule-16 caller audit before Step 3.

### Scale Session C — Tier serialization + decider + heuristic (~1 session) — ✅ SHIPPED 2026-04-30
**Trigger:** Scale Session B complete.

**Shipped 2026-04-30 in `session_2026-04-30-b_scale-session-c-build` (Claude Code).** Second build session of the day, immediately following Scale Session B (commit `1d04a10`). All deliverables landed in `src/lib/auto-analyze-v3.ts` behind a default-OFF feature flag (`serializationMode: 'tiered'` arg; today's only callers pass nothing → default `'full'`). 30 new src/lib unit tests (5 stemmer + 4 batch-relevance + 8 decideTier + 5 touch-tracker + 4 row-formatter / tier-headers + 4 buildOperationsInputTsv integration) → 240 total passing. `npx tsc --noEmit` clean; `npm run build` clean; `npm run lint` at exact baseline parity. Production V3 input TSV byte-identical to commit `1d04a10` (verified by an explicit byte-parity test). See `KEYWORD_CLUSTERING_ACTIVE.md` POST-2026-04-30-SCALE-SESSION-C STATE block for the full session-level summary.

**Scope:** Build the tiered serialization mechanism behind a feature flag. No prompt change yet.

**Deliverables:**
1. **SHIPPED.** `buildOperationsInputTsv` extended with `serializationMode: 'full' | 'tiered'` arg (default `'full'`). Existing 3-arg call sites byte-identical. Existing function body refactored into a private `buildFullTsv` helper.
2. **SHIPPED.** Tier decider function (`decideTier`) implementing Cluster 2 locks. Pure signal-based — accepts `stabilityScore`, `batchesSinceTouch`, `isInBatchRelevantSubtree`, `recencyWindow`. Subtree wins, then recency, then stability; Tier 2 AND-rule (stability ≥ 7.0 AND not touched in >10 batches AND not in subtree). Constants exported: `STABILITY_TIER_THRESHOLD = 7.0`, `DEFAULT_RECENCY_WINDOW = 5`, `TIER_2_DEEP_STALE_THRESHOLD = 10`.
3. **SHIPPED.** Batch-relevance heuristic (`computeBatchRelevantSubtree`) implementing Cluster 3 locks. Stem-based token-overlap against (title + intentFingerprint + linked-keyword text); aggregated score across batch keywords; threshold ≥2 stems; one-hop neighborhood (self + parent + siblings + children). `BATCH_RELEVANCE_MIN_STEMS = 2` exported. Hand-rolled simple stemmer with -ss / -is / -us / -as preservation rules (autonomous detail per Rule 14d; swap-in for full Porter is a one-function change).
4. **SHIPPED (helpers; AutoAnalyze.tsx wire-up deferred to Scale Session D).** Touch tracker — `TouchTracker = Map<stableId, lastTouchedBatchNum>` with `createTouchTracker`, `recordTouchesFromOps` (walks alias resolutions), `batchesSinceTouch`, `serializeTouchTracker` / `deserializeTouchTracker` (JSON-safe for the existing `aa_checkpoint_{projectId}` localStorage round-trip). Q5 → B touch rule applied conservatively (every topic ref in every op body that resolves to a stableId is stamped, including reassign targets and parents). Q5 → C: no propagation to ancestors. Touches against deleted topics become harmless garbage entries.
5. **SHIPPED.** Tier 1 / Tier 2 row format functions. Tier 1 row: 6 columns (Stable ID, Title, Parent Stable ID, Stability Score, Intent Fingerprint, Keyword Summary). Tier 2 row: 3 columns (Stable ID, Title, Parent Stable ID). Keyword summary string per Cluster 1 Q3 lock: `'{N} keywords ({P}p + {S}s), top volume kw: "{text}" ({V})'`. Empty topic emits `'0 keywords'`. Top-volume picked by volume desc, ties broken alphabetically; missing/non-numeric volumes sort as 0. `KeywordLite.volume` extended to `number | string | undefined` to accept the ambient `Keyword` shape (string from import path; Int in Prisma — formatter coerces). Tiered TSV builder emits three sections delimited by `=== TIER 0 ===` / `=== TIER 1 ===` / `=== TIER 2 ===`; empty tiers omitted.
6. **SHIPPED.** **Empty-fingerprint pin** (per §4.2 last paragraph): topics with empty `intentFingerprint` cannot be safely demoted (Tier 1's load-bearing intent-equivalence signal would be missing). The serializer force-pins them to Tier 0 regardless of decider signals. Defensive — most live topics have real fingerprints from Session B's backfill, but the safety net catches any future production rows that ever land with `''`.
7. **SHIPPED.** 30 unit tests (the design's "~25" target was matched-plus-five for full Cluster-2 truth-table coverage and the byte-parity guarantee).

**Validation outcome:** Build clean; `npx tsc --noEmit` clean; 240 src/lib tests passing (was 210; +30 this session); `npm run lint` at exact baseline parity (16 errors / 41 warnings; zero new); production V3 unchanged (flag OFF; byte-parity test explicit).

**Risk profile:** Low. No DB changes; no prompt changes; no UI changes; behind feature flag with default-OFF.

### Scale Session D — V4 prompt rewrite + integration + small-batch validation (~1 session)
**Trigger:** Scale Session C complete.

**Scope:** New `docs/AUTO_ANALYZE_PROMPT_V4.md`. Wire tier mode into `AutoAnalyze.tsx` as default. Small-batch validation.

**Deliverables:**
1. **`AUTO_ANALYZE_PROMPT_V4.md`:**
   - Updated INPUT TABLE COLUMNS section explaining three tiers and parent_id navigation.
   - Updated OPERATION SYNTAX with new required `intent_fingerprint` field on relevant operations.
   - Updated Reevaluation Pass section: trigger 3a (intent-equivalence) explicitly mentions cross-canvas detection via fingerprints.
   - V3 stays as historical reference.
2. **`AutoAnalyze.tsx`:** flip feature flag ON; new settings field "Recency Window (batches)" default N=5.
3. **Director re-pastes V4 prompts** into Auto-Analyze panel.
4. **Small-batch validation** on test project (3–5 batches): verify fingerprints written on every relevant op; tier decider produces sensible distribution; intent-equivalence holds qualitatively; reconciliation passes (0 off-canvas → Reshuffled); no quality regression vs. yesterday's V3-refined small-batch test.

**Validation criteria:** All Cluster 1–4 properties observable; no quality regression; input token reduction ≥ 30% on Tier-1-eligible portion of canvas (rough target).

**Risk profile:** Medium. New prompt + new wiring = quality regression risk. Mitigated by small-batch validation before any large run.

### Scale Session E — Consolidation pass + auto-fire + full-Bursitis validation (~1 session)
**Trigger:** Scale Session D complete.

**Scope:** Consolidation mode (auto + admin-triggered). Full-Bursitis validation demonstrating the wall is solved.

**Deliverables:**
1. Consolidation prompt mode (separate Initial Prompt + Primer; restricted vocabulary).
2. `AutoAnalyze.tsx` consolidation mode: "Consolidate Now" button + auto-fire every N=10 batches when canvas > 100 topics.
3. Full-canvas validation run: fresh full Bursitis run with V4 + tier mode + auto-consolidation. Goal: reach ≥ 600 topics with stable per-batch input cost.
4. Cleanup of any V3-era code paths simplifiable post-V4 default.

**Validation criteria:** Bursitis run reaches ≥ 600 topics; no quality regression; per-batch wall-clock matches/improves V3; reconciliation continues clean.

**Risk profile:** Medium-low. Riskiest pieces shipped in B–D.

### Scale Session F — Stability-scoring algorithm (future; conditional on use)
**Trigger:** Decision to activate the stability signal in the tier decider.

Already deferred per `PIVOT_DESIGN.md §5`. When this ships, stability-based demotion to Tier 1 (and Tier 2 eligibility) activates automatically — no additional Scale-Session work required.

### Estimated cumulative spend (Scale Sessions 0 through E)
| Session | Anthropic API | Other |
|---|---|---|
| 0 | ~$5–$30 (validation runs) | None |
| B | ~$1–$2 (backfill) | None |
| C | $0 | None |
| D | ~$5–$15 (small-batch) | None |
| E | ~$30–$60 (full Bursitis under V4) | None |
| Total (only if all run) | ~$40–$110 | None |

### Rollback strategy
- Git safety branch tagged before each session's destructive ops (`pre-scale-b-step3`, etc.)
- Feature flags during Scale Sessions C and D so tier mode can be toggled OFF
- V3 prompts and code paths preserved through Scale Session E (deletion deferred)
- Backfill script idempotency — re-runnable for fingerprint regeneration

---

## 7. Open questions / deferred items

Per `HANDOFF_PROTOCOL.md` Rule 14e — every deferral has an explicit destination.

| Item | Why deferred | Where captured |
|---|---|---|
| Stability-scoring algorithm | Algorithm is a separate workstream. Until it ships, the stability signal in the tier decider is dormant; recency does all demotion work. | This doc §6 Scale Session F + `PIVOT_DESIGN.md §5` |
| Pre-pass model call as a quality enhancement to batch-relevance heuristic (D-from-Q10) | Heuristic is sufficient for the first ship per the forgiving-design property; pre-pass is a future enhancement if validation reveals heuristic recall is poor. | This doc §3.1 + future ROADMAP item if triggered |
| Embedding-based semantic batch-relevance | More precise than stem-based token-overlap but adds dependency. Future enhancement. | This doc §3.1 + future ROADMAP item if triggered |
| Cross-workflow generalization of tiered serialization (W#5 Conversion Funnel, W#3 Therapeutic Strategy may need similar mechanisms) | Far-future workflows; their scaling profiles may differ. Re-evaluate at each workflow's design interview. | `DATA_CATALOG.md` workflow placeholders 6.x; future workflow design interviews |
| Possible cost-optimization: cache the canvas TSV at a stable prefix breakpoint | Anthropic prompt caching reduces cost but doesn't reduce tokens-toward-window count. Caching is already absorbing the static parts of the V3 prompt; canvas-TSV caching is a cost optimization, not a wall solution. | This doc §0 (clarification at top) — not pursued as a wall solution |

---

## 8. Glossary

- **Tier 0 / Tier 1 / Tier 2** — three levels of detail at which a topic is serialized into the prompt input. See §1.1.
- **Intent fingerprint** — short canonical phrase (5–15 words, searcher-centric) capturing a topic's compound intent. See §1.2.
- **Tier decider** — the function that picks one of three tiers per topic per batch based on three signals (batch-relevance, recency, stability). See §2.
- **Batch-relevance heuristic** — local stem-based token-overlap matching that identifies candidate topics for the current batch's keywords. See §3.
- **Consolidation pass** — separate full-canvas pass (auto-fired or admin-triggered) that runs Reevaluation triggers on the whole canvas, recovering coverage on demoted topics. See §4.1.
- **One-hop neighborhood** — for a candidate topic: itself + immediate parent + immediate siblings + immediate children. See §3.2.
- **Touched** — a topic was referenced by an operation in the current or recent batch. See §2.1.
- **Recency window N** — how many batches a touched topic stays at Tier 0. Default 5; configurable. See §2.2.
- **Outcome A / B / C** — three possible outcomes from Scale Session 0 that determine whether Scale Sessions B–E proceed. See §0 + §6.

---

## 9. Cross-references

- **`PIVOT_DESIGN.md`** — V3's architectural pivot (Pivot Sessions A–E). This design extends V3, doesn't replace it.
- **`AUTO_ANALYZE_PROMPT_V3.md`** — current V3 prompts. Updated to V4 in Scale Session D.
- **`src/lib/operation-applier.ts`** — the operation vocabulary. Extended with `intent_fingerprint` field in Scale Session B.
- **`src/lib/auto-analyze-v3.ts`** — wiring layer. Extended with tier serialization + tier decider + batch-relevance heuristic in Scale Session C.
- **`MODEL_QUALITY_SCORING.md`** — defines stability score and JUSTIFY_RESTRUCTURE gate at ≥ 7.0. The Tier 1 demotion threshold reuses the same value.
- **`ROADMAP.md`** 🚨 Canvas Serialization INPUT Context-Scaling section — pre-design statement of the architectural concern. Now superseded by this design doc.
- **`KEYWORD_CLUSTERING_ACTIVE.md`** POST-2026-04-27-INPUT-CONTEXT-SCALING-DESIGN STATE block — session-specific state notes pointing here.
- **`PLATFORM_ARCHITECTURE.md` §10 Known Technical Debt** — cross-reference entry.
- **`CORRECTIONS_LOG.md` 2026-04-27 entry** — the synthesis-failure mistake that motivated `HANDOFF_PROTOCOL.md` Rule 24 + `CLAUDE_CODE_STARTER.md` non-negotiable rule #21. This design session's structured search per Rule 24 is documented in §0 (test before build) and the historical lineage above.

---

END OF DOCUMENT
