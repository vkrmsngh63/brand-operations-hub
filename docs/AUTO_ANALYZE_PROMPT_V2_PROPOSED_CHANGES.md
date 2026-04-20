# AUTO-ANALYZE PROMPT V2 — PROPOSED CHANGES
## Specific additions/modifications to the V2 prompts drafted during session_2026-04-20_phase1g-test-followup-part3

**Created:** April 20, 2026
**Status:** PROPOSED — not yet merged into `AUTO_ANALYZE_PROMPT_V2.md`
**Purpose:** Capture the prompt-engineering changes discussed during the 2026-04-20 session so the next session can review, refine, and merge them into the canonical V2 prompts. Each change below includes the problem it addresses, the exact text to add or modify, and the precise location in `AUTO_ANALYZE_PROMPT_V2.md` where it belongs.

---

## How to use this document

1. Next session reviews each proposed change with director for final wording.
2. Approved changes get merged into `AUTO_ANALYZE_PROMPT_V2.md` at the specified locations.
3. Director re-pastes the updated prompt into the Auto-Analyze UI before the next test run.
4. This doc is archived or deleted once all proposed changes are merged or explicitly rejected.

---

## Change 1 — "When in doubt, place in existing matching topic"

### Problem it addresses
Director observed that the model creates new topics too readily when an existing topic would serve the keyword's intent. Current prompt at Step 2 (Create or Identify the Primary Topic) says "If no sufficiently specific topic exists, create one" — but it doesn't explicitly favor existing topics when the decision is close. Result: the tree grows wider than necessary, with near-duplicate topics that should have been consolidated.

### Proposed addition — placement in `AUTO_ANALYZE_PROMPT_V2.md`

**Location:** Inside the Initial Prompt V2, Step 2 (Create or Identify the Primary Topic), immediately after the existing CRITICAL paragraph. Currently that paragraph ends on line 104 with "The parent topic "[Condition] [body location] symptoms" remains in the hierarchy as a broader organizational node."

**Text to add immediately after line 104:**

```
TIE-BREAKER RULE — When uncertain between placing a keyword in an existing
topic versus creating a new one, DEFAULT TO THE EXISTING TOPIC. Apply this
test: "Would content written for the existing topic substantively serve this
keyword's intent, even if a slightly more specific new topic could serve it
marginally better?" If yes, place the keyword in the existing topic with
[p]. Reserve new-topic creation for keywords whose intent is meaningfully
distinct — not just nominally different.

A marginal improvement in topic specificity does NOT justify a new topic.
A meaningful improvement — one that would change what content says, how
the searcher is addressed, or which conversion-funnel stage the topic
belongs in — does.

If you do create a new topic despite this tie-breaker, briefly note in the
Reevaluation Report why the existing topic(s) were insufficient. This
surfaces close-call decisions for admin review and feeds the Changes Ledger.
```

### Why this wording
- "Tie-breaker rule" frames the guidance as applying only in uncertain cases, not as a blanket "never create new topics."
- The test question ("Would content written for the existing topic substantively serve this keyword's intent?") is concrete and answerable, unlike generic "be careful" advice.
- The "marginal vs meaningful" distinction names the exact failure mode observed.
- The Reevaluation Report note requirement creates an audit trail admin can review, feeding into the Changes Ledger naturally.

---

## Change 2 — Cross-canvas low-volume consolidation scan

### Problem it addresses
Current Step 6 rule (b) and the Post-Batch Reevaluation trigger (7) both scan only within the current batch for low-volume keyword clusters that could be promoted. Neither scans the pre-existing canvas for low-volume keywords scattered across other topics that, combined with current-batch keywords, might warrant consolidation into a new sub-topic. Director identified this as a gap — the model should be looking cross-canvas, not just within the current batch.

### Proposed modification — placement in `AUTO_ANALYZE_PROMPT_V2.md`

**Location 1:** Step 6 (Volume-Aware Topic Granularity), rule (b). Current text at line 131:

```
(b) A cluster of keywords that share a facet and whose COMBINED search volume meets or exceeds [VOLUME_THRESHOLD] warrants a dedicated sub-topic for that facet, even if each individual keyword's volume is below the threshold. After placing all keywords in the batch, scan for such clusters and promote them.
```

**Replace with:**

```
(b) A cluster of keywords that share a facet and whose COMBINED search volume
meets or exceeds [VOLUME_THRESHOLD] warrants a dedicated sub-topic for that
facet, even if each individual keyword's volume is below the threshold.
After placing all keywords in the batch, scan for such clusters across
BOTH (i) the keywords just placed in the current batch AND (ii) keywords
already placed in the Topics Layout Table from prior batches. If a qualifying
cluster spans current-batch and prior-canvas keywords, create a new dedicated
sub-topic for that facet, reassign the prior-canvas keywords' primary
placements to the new sub-topic (per reassignment rules in the Reevaluation
Pass Trigger 2), and reflect the reassignment in the Reevaluation Report.
```

**Location 2:** Post-Batch Funnel Reevaluation Pass, Trigger (7) Volume-Based Cluster Promotion. Current text at line 163:

```
(7) Volume-Based Cluster Promotion — After placing all keywords in the batch, scan the touched branches for clusters of keywords that share a facet and whose combined search volume meets or exceeds [VOLUME_THRESHOLD], but which are currently scattered across a broader parent topic rather than having their own dedicated sub-topic. Signal: while reviewing the completed placements for the batch, you identify two or more keywords within the same branch that share a qualifying facet, their individual volumes are below [VOLUME_THRESHOLD], but their combined volume meets or exceeds it. Action: create a dedicated sub-topic for that facet cluster, reassign the relevant keywords' primary placements to the new sub-topic, create secondary placements if not already present, and update parent topic descriptions.
```

**Replace "scan the touched branches" with "scan both the touched branches and the entire prior-canvas for keywords with the same facet as any keyword in this batch."** Full replacement:

```
(7) Volume-Based Cluster Promotion — After placing all keywords in the batch,
scan BOTH (i) the branches touched by this batch AND (ii) the entire
prior-canvas for keywords with the same facet as any keyword in this batch.
Identify clusters of keywords that share a facet and whose combined search
volume meets or exceeds [VOLUME_THRESHOLD], but which are currently scattered
across broader parent topics rather than having their own dedicated sub-topic.
Signal: while reviewing the completed placements for the batch, you identify
two or more keywords (drawn from current batch and/or prior canvas) within
the same facet that their combined volume meets or exceeds [VOLUME_THRESHOLD].
Action: create a dedicated sub-topic for that facet cluster, reassign the
relevant keywords' primary placements (both current-batch and prior-canvas)
to the new sub-topic, create secondary placements if not already present,
and update parent topic descriptions. Note all reassignments of prior-canvas
keywords explicitly in the Reevaluation Report so admin can review whether
previously-approved placements should be moved.
```

### Why this wording
- Explicitly names "prior-canvas" as a distinct scope from "touched branches" — preventing the model from interpreting "scan the canvas" as scanning only what it modified this batch.
- Requires explicit Reevaluation Report entries for prior-canvas reassignments (critical for admin visibility — prior-canvas changes may override admin's earlier approvals).
- Tie-in to the Changes Ledger and stability scoring ensures high-score prior-canvas keywords don't get silently moved.

---

## Change 3 — Comprehensiveness check for facet extraction and topic chains

### Problem it addresses
Director observed that when a keyword like "bursitis pain in older women" is processed, the model should comprehensively create:
- Primary topic for bursitis pain specifically
- Secondary placement under "bursitis in women" (with full upstream chain: "How bursitis affects different sexes differently" → "Who does bursitis affect?")
- Secondary placement under "bursitis in older people" (with full upstream chain: "How does bursitis affect a person by age" → "Who does bursitis affect?")

Current prompt Steps 3-5 (facet identification, secondary placement, upstream chain construction) describe this process, but in practice the model is being lazy — it skips facets, creates partial upstream chains, or drops the secondary placement altogether under output-length pressure. The result is a tree that's less comprehensive than the keyword data warrants.

### Proposed addition — placement in `AUTO_ANALYZE_PROMPT_V2.md`

**Location:** Inside the Initial Prompt V2, as a new "Step 4b — Comprehensiveness Verification" immediately after Step 4 (Create Secondary Placements for Meaningful Facets). Current Step 4 ends at line 116 with "(d) Place the keyword under the most specific facet topic with a [s] annotation."

**Text to insert as new section immediately after line 116:**

```
Step 4b — Comprehensiveness Verification (MANDATORY per-keyword self-check):

Before moving to Step 5, perform an explicit verification for each keyword
just analyzed. Answer these questions internally AND record your answers
in the Comprehensiveness Check block of your Reevaluation Report:

(i) How many distinct facets did you identify in this keyword?
    (Demographic, situational, temporal, severity, and any contextual
    modifiers each count as separate facets.)

(ii) How many total topic placements does this keyword have in your output?
     (1 primary + N secondary = 1 + N total.)

(iii) If (ii) < (i) + 1 (where +1 is the primary placement), you have
      SKIPPED FACETS. For each skipped facet, EITHER:
      - Add the missing secondary placement with full upstream chain, OR
      - Explicitly justify why this facet does NOT warrant a secondary
        placement (e.g., the facet is a stopword, is redundant with the
        primary topic's focus, or is too niche for cross-cutting topic
        creation).

(iv) For each secondary placement, verify the full upstream chain exists
     from the facet-specific sub-topic up to a root-level (Depth 0) topic.
     Missing intermediate topics must be created as empty narrative-bridging
     topics.

COMPREHENSIVENESS PRINCIPLE — A keyword that carries N meaningful facets
should generate 1 primary placement and up to N secondary placements, each
with its own complete upstream chain. Under-placement (omitting secondary
placements to save output length) degrades the funnel's structural integrity
and is a worse failure mode than over-placement.

COMPREHENSIVENESS CHECK BLOCK — Include this in your Reevaluation Report:

  For each keyword in this batch, list:
  - Keyword text
  - Facets identified: [list]
  - Placements made: [list with topic titles and [p]/[s] annotation]
  - Facets not placed as secondary (with justification): [list or "None"]
```

### Example application of Step 4b

For keyword "bursitis pain in older women":
- (i) Facets identified: [pain, older-age, gender-women]
- (ii) Placements: 1 primary (bursitis pain) + 2 secondary (bursitis in women, bursitis in older people) = 3 total
- (iii) 3 ≥ 1 + 3 = 4. Wait — 3 < 4, one facet skipped. Adjust: the "pain" facet IS the primary, not a separate secondary. So facets excluding primary's core = 2 (older-age, gender-women). 1 + 2 = 3. Match. No skip.
- (iv) Both secondary placements have full upstream chains verified.

### Why this wording
- Makes comprehensiveness a self-check the model must pass, not a nice-to-have.
- Forces the model to articulate why a facet was skipped (preventing silent omission).
- The Comprehensiveness Check block in the Reevaluation Report gives admin direct visibility into whether the model is being comprehensive, across every keyword.
- The explicit principle ("under-placement is a worse failure mode than over-placement") biases the model toward thoroughness.

---

## Change 4 — Stability score metadata injection

### Problem it addresses
The stability-score system (`MODEL_QUALITY_SCORING.md`) requires the model to respect friction gradients on high-confidence topics. The prompt must instruct the model how to interpret scores.

### Proposed addition — placement in `AUTO_ANALYZE_PROMPT_V2.md`

**Location:** Inside the Initial Prompt V2, as a new section inserted immediately before "Step 7 — Conversion Funnel Stage Ordering" (currently at line 137).

**Text to insert:**

```
Step 6b — Respecting Stability Scores (MANDATORY):

Each topic in the Topics Layout Table carries a stability_score from 0 to 10,
passed as metadata alongside the topic's other fields. This score reflects
how well-validated the topic is — through admin approvals, cross-batch
consistency, and related signals.

Score interpretation:

- Score >= 7.0 — Topic is well-validated. DO NOT modify its name, parent
  relationship, or conversion-funnel-stage assignment unless you have a
  compelling structural reason. If you must modify, you MUST emit a
  JUSTIFY_RESTRUCTURE payload in your Reevaluation Report explaining:
  (i) the prior state, (ii) the new state, (iii) the specific reason the
  modification is warranted despite the high score, and (iv) the expected
  quality improvement admin should see.

- Score 4.0 - 6.9 — Topic is established but not locked. Modify only when
  the improvement is clearly meaningful, not marginal. Document the
  modification in the Reevaluation Report as usual.

- Score < 4.0 — Topic is open to restructuring based on new evidence.
  Apply normal Reevaluation Pass thresholds.

- Score not provided or zero — Treat as 0.0 (fully open). This is the
  default for newly-created topics.

RATIONALE: High-score topics represent admin's accumulated prior approvals.
Modifying them without justification wastes admin's prior decisions and
causes downstream churn. A friction gradient — higher bar for higher-score
items — balances the need to improve the tree with the need to respect
established structure.

Adding keywords or descriptive detail to a high-score topic does NOT
require JUSTIFY_RESTRUCTURE. Only structural changes (renames, parent
changes, merges, splits) require it.
```

### Why this wording
- Names the exact threshold (7.0, 4.0) so the model has deterministic behavior.
- Requires JUSTIFY_RESTRUCTURE for structural changes only — leaves room for additive updates (keyword placements, description enrichment) without friction.
- The rationale paragraph explains WHY — helps the model internalize the principle rather than mechanically following rules.

---

## Change 5 — Explicit multi-placement reinforcement

### Problem it addresses
Director clarified that intentional multi-placement (a keyword belonging genuinely under multiple topics) is DESIRED and should not be confused with "workaround duplication" (model placing a keyword in two topics because it couldn't decide). The current prompt describes secondary placements but doesn't explicitly celebrate multi-placement when intent genuinely spans topics.

### Proposed addition — placement in `AUTO_ANALYZE_PROMPT_V2.md`

**Location:** In the Initial Prompt V2, at the start of the "Keyword Placement Decision Framework — Primary and Secondary Topic Placement" section (currently line 88). Insert as a new paragraph after the section heading and before "Every keyword must be placed into exactly one PRIMARY topic..."

**Text to insert immediately after line 88:**

```
MULTI-PLACEMENT IS A FEATURE, NOT A COMPROMISE.

When a keyword's intent genuinely spans multiple topics — for example,
"bursitis pain in older women" belongs under "bursitis pain" (symptom
focus) AND "bursitis in women" (demographic focus) AND "bursitis in older
people" (age-demographic focus) — the keyword SHOULD be placed under all
three topics: one primary ([p]) and two secondary ([s]) placements.

Multi-placement is NOT:
- A way to hedge when you cannot decide between two topics (pick the more
  specific one as primary; use secondary only if the other topic represents
  a meaningfully distinct facet);
- A way to add the keyword everywhere it might fit (each secondary placement
  must pass the "meaningfully different therapeutic consideration, content
  angle, or product positioning" test in Step 4);
- Duplication for safety (each placement must be structurally justified).

Multi-placement IS:
- The correct representation for a keyword whose intent has multiple
  meaningful facets, each of which warrants dedicated content, strategy,
  or product positioning downstream;
- A signal to downstream workflows (content development, conversion funnel
  design, etc.) that this keyword is relevant across multiple narrative
  branches.

Aim for comprehensiveness in multi-placement per Step 4b.
```

### Why this wording
- Explicitly names the distinction between legitimate multi-placement and workaround duplication.
- Uses the "IS / IS NOT" format to clarify by contrast.
- Connects multi-placement to the downstream purpose (content, funnel, strategy) so the model understands why comprehensiveness matters.

---

## Change 6 — Salvage-ignored-keywords follow-up prompt (NEW separate prompt, tool-generated)

### Problem it addresses
When a batch has missing keywords (placed in input but not in the AI's output), current behavior is a full batch retry, which is expensive and re-runs the whole analysis. Director's suggestion: spawn a targeted follow-up that asks the model to place JUST the missing keywords without re-doing the full batch.

### Proposed prompt template (tool-generated, not in canonical V2)

The tool generates this prompt automatically when it detects missing keywords in the response. It is NOT stored in `AUTO_ANALYZE_PROMPT_V2.md` — it's constructed at runtime by the tool's code.

```
FOLLOW-UP REQUEST — MISSING KEYWORDS IN PRIOR BATCH RESPONSE

In your previous response for batch <BATCH_NUM>, the following <N> keywords
from the input batch were not placed in the Topics Layout Table:

- <KEYWORD_1>
- <KEYWORD_2>
- <KEYWORD_N>

The rest of the batch was placed successfully. Do NOT re-analyze or
reorganize anything else — all other keywords in the batch have been
processed correctly and applied to the canvas.

For each missing keyword, respond with EXACTLY ONE of:

(A) Placement — If the keyword is topically relevant to [PRIMARY_SEED_WORDS],
    apply Steps 1-5 of the Initial Prompt to place it, including all
    required secondary placements and upstream chains. Output the
    placements in delta format (only new rows or modified rows).

(B) Irrelevance flag — If the keyword is NOT topically relevant to
    [PRIMARY_SEED_WORDS] (e.g., it is a homograph, geographic reference
    unrelated to the niche, or noise), flag it for removal by listing it
    in a dedicated IRRELEVANT_KEYWORDS block. Admin will review and decide
    whether to move it to the Removed Terms table.

Output format:

=== DELTA ROWS FOR PLACEMENTS ===
<Depth>\t<Topic>\t<Alternate Titles>\t<Relationship>\t<Parent Topic>\t<Conversion Path>\t<Sister Nodes>\t<Keywords>\t<Topic Description>
...
=== END DELTA ROWS ===

=== IRRELEVANT_KEYWORDS ===
<keyword_1>\t<reason-why-not-relevant>
<keyword_2>\t<reason-why-not-relevant>
=== END IRRELEVANT_KEYWORDS ===

=== REEVALUATION REPORT ===
(Report only on the missing-keyword placements; do not re-report on the
rest of the batch.)
=== END REEVALUATION REPORT ===
```

### Why this wording
- Scoped to the missing keywords only — prevents the model from re-doing the whole batch.
- Offers the model an explicit escape hatch (mark as irrelevant) for keywords that genuinely don't fit the niche — addresses the "bursa" Turkey-city problem directly.
- Delta format keeps the output small.
- Separate blocks allow the tool to parse placements, irrelevance flags, and reasoning separately.

### When NOT to use this prompt
- When the batch had "Lost N keywords" (previously-applied keywords erased): this is a structurally broken response. Do full batch retry instead — a targeted follow-up won't fix the underlying structural failure.

---

## Change 7 — Session-boundary continuation reinforcement

### Problem it addresses
On long runs, the model may lose track of which keywords belong to which batch and what state it ended each batch in. The current prompt's Section 5 (Continuing with New Keyword Batches) covers this but could be stronger.

### Proposed addition — minor enhancement

**Location:** Section 5 of Initial Prompt V2 (line 189-194). Add as a new point (e) at the end:

```
(e) Between batches, the most recent Topics Layout Table and the list of
keywords placed in prior batches are the ONLY authoritative sources of
prior state. If your internal working memory contradicts the table you
receive as input, trust the table — it reflects what the tool has
successfully applied to the canvas, including admin corrections made
during human-in-loop review.
```

---

## Summary — all proposed changes in order

| # | Change | Location in prompt doc | Size |
|---|---|---|---|
| 1 | Tie-breaker rule ("when in doubt, existing topic") | Step 2, after line 104 | +12 lines |
| 2 | Cross-canvas low-volume consolidation scan | Step 6(b) (line 131) and Trigger (7) (line 163) | modified |
| 3 | Comprehensiveness check (Step 4b) | After line 116 | +30 lines |
| 4 | Stability score metadata handling (Step 6b) | Before Step 7 (line 137) | +25 lines |
| 5 | Multi-placement reinforcement | After line 88 | +20 lines |
| 6 | Salvage-ignored-keywords follow-up prompt | Tool-generated, not canonical | separate |
| 7 | Session-boundary continuation | Section 5 (line 189) | +6 lines |

Total: ~95 lines added, plus 2 modifications to existing text.

Estimated output impact:
- Changes 3, 4, 5 increase input prompt size by ~75 lines total (~600 tokens)
- Changes add required output sections (Comprehensiveness Check block, JUSTIFY_RESTRUCTURE payloads when triggered) — +500-2000 tokens of output per batch
- Net: moderate input cost increase (cached after first batch), moderate output cost increase — quality-for-cost tradeoff that addresses identified issues

---

## Next session review process

1. Director and Claude Code review each change against the latest production canvas behavior.
2. Wording refined through discussion.
3. Approved changes merged into `AUTO_ANALYZE_PROMPT_V2.md` with a single commit.
4. Director re-pastes the updated prompt into Auto-Analyze UI.
5. Next test run validates the changes.
6. This file is archived or deleted once all changes are processed.

---

END OF DOCUMENT
