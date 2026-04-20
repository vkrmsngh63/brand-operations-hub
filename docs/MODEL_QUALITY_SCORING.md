# MODEL QUALITY SCORING
## Stability-score algorithm for AI outputs across all PLOS tools

**Created:** April 20, 2026
**Created in session:** session_2026-04-20_phase1g-test-followup-part3 (Claude Code)
**Status:** Group A doc — always loaded at session start

**Purpose:** Defines the quality scoring algorithm that informs whether AI outputs (topics, classifications, generated content, etc.) are treated as authoritative, tentative, or under review. Paired with `AI_TOOL_FEEDBACK_PROTOCOL.md` — the feedback system is the input; the scoring algorithm is the output that informs the model's behavior in subsequent runs.

---

## 1. Philosophy — a friction gradient, not a lock

The core problem this solves: "How should the AI balance respecting admin-approved prior work against adapting the structure when new data demands it?"

Two extremes both fail:
- **Never modify prior work** — model can't improve the tree even when new keywords reveal better organization; quality degrades as the dataset grows.
- **Always free to modify** — model re-shuffles admin-approved work on every batch; admin's prior decisions are wasted.

The right answer is a **friction gradient**: modifications to high-confidence items require stronger justification; low-confidence items remain freely malleable. This gives the model permission to improve while protecting admin's accumulated decisions.

---

## 2. The stability score

Each AI output item (a topic, a keyword placement, a generated piece of content, etc.) carries a `stability_score` ranging from 0 (brand-new, uncertain) to 10 (deeply validated).

### 2.1 Factors that ADD to the score

| Factor | Weight | Rationale |
|---|---|---|
| Age (batches since creation without name/parent change) | +0.1 per batch | Stability over time implies the model's own repeated endorsement |
| Admin approvals during human-in-loop review | +2.0 per approval | Direct positive signal from the authority |
| Keywords placed under it that admin hasn't moved | +0.2 per keyword | Indirect positive signal — admin accepted the placement |
| Cross-batch consistency (model keeps proposing same name/structure) | +0.3 per consistent batch | Model self-consistency implies conviction |
| Cross-project precedent (similar topics approved in other projects) | +0.5 | Platform-wide accumulated wisdom |

### 2.2 Factors that SUBTRACT from the score

| Factor | Weight | Rationale |
|---|---|---|
| Admin rejections | −3.0 per rejection | Direct negative signal; stronger than positive to bias conservative |
| Keywords moved OUT by admin or AI | −0.2 per keyword | The structure didn't hold |
| Model internally disagreeing with itself (different names proposed across batches) | −0.3 per disagreement | Lack of self-consistency implies uncertainty |
| Admin marks as "Redo" (without reject) | −0.5 | Admin is unsatisfied but not firmly against |

Score is clamped to [0, 10]. A rejected-then-redone topic can go negative temporarily in intermediate calculations but is clamped before storage.

---

## 3. How the model sees the score

Each topic is passed to the model in the prompt with stability metadata:

```
Topic: "How bursitis affects women differently" (stability: 8.2/10, 14 keywords, admin-approved 3×)
```

The prompt includes this instruction:

```
For each topic in the Topics Layout Table, a stability score is provided.
Interpret the score as follows:

- Score >= 7.0 — This topic is well-validated. Do not modify its name or parent
  relationship unless you have a compelling structural reason. If you must
  modify, you MUST emit a JUSTIFY_RESTRUCTURE payload in your Reevaluation
  Report section explaining why.

- Score 4.0 - 6.9 — This topic is established but not locked. Modify only
  when the improvement is clearly meaningful, not marginal.

- Score < 4.0 — This topic is open to restructuring based on new evidence.
  Apply normal reevaluation thresholds.

- Score unknown / not provided — Treat as 0.0 (fully open).

You must respect this gradient. High-score topics should only be modified
with strong justification; low-score topics remain malleable.
```

This text should be added to the Initial Prompt in Step 7 or just before the "Post-Batch Funnel Reevaluation Pass" section.

---

## 4. The `JUSTIFY_RESTRUCTURE` payload

When the model modifies a topic with stability_score ≥ 7.0, it must include in its Reevaluation Report:

```
JUSTIFY_RESTRUCTURE:
- Topic affected: <topic title + stable_id>
- Prior state: <name, parent, depth>
- New state: <name, parent, depth>
- Score: <current stability score>
- Reason: <explicit justification — must not be generic>
- Expected quality improvement: <what admin should see as better>
```

Admin reviews these payloads with extra scrutiny during human-in-loop review. A topic modified without JUSTIFY_RESTRUCTURE but with score ≥ 7.0 triggers a validation error.

---

## 5. Admin scoring guidelines (for Human-in-Loop review)

During human-in-loop review, admin may optionally score individual AI decisions on a 1-5 scale. This score feeds the admin_action weighting and becomes part of the feedback repository.

### 5.1 The scale

| Score | Meaning | When to use |
|---|---|---|
| 5 — Excellent | Action captures searcher intent perfectly; enhances funnel quality; searcher-centric language is strong; conversion-funnel stage is correct | Use sparingly — reserve for actions you'd want as few-shot examples for future projects |
| 4 — Good | Action is correct, well-reasoned; minor tweaks could sharpen it but not needed | The default for approved actions that you're genuinely happy with |
| 3 — Acceptable | Action works but could be better; you might tweak it manually after the run but won't Redo it now | Use when approving despite reservations |
| 2 — Problematic | Action is off-base; a Redo with specific feedback is recommended | Always pair with specific feedback when using this score |
| 1 — Wrong | Action should not have been taken at all; Reject and add a Global Rule | Always pair with a Global Rule when using this score — the model must learn this is forbidden |

### 5.2 Four dimensions to evaluate

When scoring, evaluate the action against all four:

1. **Intent alignment** — does the placement/classification match the searcher's intent as you understand it?
2. **Searcher-centric language** — is the topic title phrased as the condition sufferer would think/speak/respond to?
3. **Conversion-funnel stage appropriateness** — is this action placing content at the correct stage of the funnel (awareness / understanding / evaluation / action)?
4. **Structural integrity** — does the action respect the upstream chain, sister-node relationships, and hierarchy rules?

A 5 requires all four to be strong. A 1 typically means at least one is fundamentally wrong.

### 5.3 When to skip scoring

Not every decision needs a score. Skip scoring when:
- You're mid-session-fatigue and can't judge confidently (mark as Approved without score)
- The action is trivial (typo fix, obvious placement)
- You're doing a bulk-approve sweep

Low-confidence scores are worse than no score — if unsure, don't force a number.

---

## 6. Meta-note — how this algorithm was derived, and how to improve it

This algorithm was drafted in session_2026-04-20_phase1g-test-followup-part3 based on:
- Observed AI behavior during the Bursitis Auto-Analyze run (51+ batches, heavy topic reshuffling masked by "0 removed" validation)
- Director's design intent that modifications should be allowed but require friction proportional to admin confidence
- Standard ML-ops practice for human-feedback-reinforced systems

**The weights in §2 are starting points, not final.** They were chosen to:
- Bias conservative (rejection weight > approval weight by 50%)
- Make admin approvals decisive (2.0 per approval → 4 approvals pushes a new topic to the "locked" threshold of 7.0+)
- Make age a slow-accumulating signal (0.1 per batch → 70 batches to reach 7.0 on age alone; ensures age doesn't dominate admin signal)

**Review triggers.** Revisit the weights when any of these conditions is true:
- Admin reports that high-score topics are getting modified too often (weight on approval is too low OR prompt text is too permissive)
- Admin reports that low-score topics are being treated as locked (age weight is too high OR initial score defaults are wrong)
- A completed project's final tree looks structurally right but admin feels the model "fought them" on every batch (rejection weight may be too high)
- A completed project's final tree has drifted from admin's early decisions (approval weight is too low)

**How to propose improvements.** Future sessions can propose weight changes by:
1. Stating which condition above triggered the review
2. Proposing new weights with justification
3. Running a replay against historical feedback data to see how scores would have differed
4. Committing the change with rationale in this doc's revision history

---

## 7. Integration with the Changes Ledger

The stability score is visible in the Changes Ledger (see `KEYWORD_CLUSTERING_ACTIVE.md` Changes Ledger section). Each entry shows:
- The topic's stability score BEFORE the action
- The proposed action (and its effect on score if approved)
- Whether the action required a JUSTIFY_RESTRUCTURE payload

This gives admin visibility into which modifications are against high-confidence work and deserve extra scrutiny.

---

## 8. Prompt and tool integration checklist

For a tool to fully integrate with this scoring system, it must:

- [ ] Store stability_score per tracked item (topics in Keyword Clustering; other item types in other tools)
- [ ] Update score via the algorithm in §2 at each admin interaction
- [ ] Pass current scores as metadata in every AI prompt
- [ ] Instruct the model via the text in §3 about how to interpret scores
- [ ] Require JUSTIFY_RESTRUCTURE payload when model modifies score ≥ 7.0 items
- [ ] Surface scores in the Changes Ledger and Human-in-Loop review UI
- [ ] Accept admin scoring (1-5 scale) and convert to algorithm inputs per §5

---

## 9. Open questions for future sessions

- How should cross-project precedent be computed? (Exact similarity metric is tool-specific — needs per-tool spec.)
- Should scores decay over time if a topic is untouched? (Current design: no decay — age is additive. But a long-untouched topic might represent staleness, not stability.)
- How should Mode A vs. Mode B modifications be weighted differently? (Currently no distinction — but Mode A's holistic view may justify score changes that Mode B's narrow view doesn't.)

These are deferred to a dedicated design session once Phase 1 scoring is in the field.

---

END OF DOCUMENT
