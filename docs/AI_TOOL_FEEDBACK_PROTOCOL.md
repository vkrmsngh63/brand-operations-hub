# AI TOOL FEEDBACK PROTOCOL
## Platform-wide standard for every AI-using tool in PLOS

**Created:** April 20, 2026
**Created in session:** session_2026-04-20_phase1g-test-followup-part3 (Claude Code)
**Status:** Group A doc — always loaded at session start

**Purpose:** Every workflow tool in PLOS that uses an AI model must integrate with a shared, cross-project feedback system. This document defines that system — the minimum integration points, the data model, the admin UX, and the philosophy behind it. It is referenced by every future workflow's design doc so new tools are built with feedback-on-rails from day one, not bolted on afterwards.

---

## 1. The philosophy (why this exists)

AI models make mistakes. They mis-classify, they drop data, they over-create or under-create structure, they invent plausible-sounding rationales for wrong decisions. The platform must assume this as baseline and design around it — not treat it as an edge case.

Without a feedback system:
- Every AI run's mistakes are caught (or missed) in isolation.
- Admin re-teaches the same lesson in every project.
- The model never gets better for this platform's specific use cases.
- The cost of AI mistakes scales linearly with the number of projects, making Phase 3 (500 projects/week) infeasible.

With a feedback system:
- Mistakes get corrected in-session AND stored as training data.
- Future runs load the most relevant prior feedback as few-shot examples, steering the model away from known failure modes.
- Pattern analysis surfaces recurring issues, driving prompt improvements and tool-rule updates.
- The platform gets smarter with every project completed — this is a compounding competitive advantage.

This is a Phase 1 design decision with Phase 4 implications. Every tool built from April 2026 forward must plug into it.

---

## 2. Required integration points (MANDATORY for every AI-using tool)

### 2.1 Structured decision output with reasoning

Every AI decision the tool makes (topic assignment, keyword classification, content generation choice, placement decision, etc.) must include the model's explicit rationale — not just the conclusion.

Implementation:
- The AI's prompt must instruct it to emit reasoning alongside each decision.
- The tool must parse and store the reasoning in a structured form.
- The reasoning is shown to admin in the review UI so admin understands WHY the model made the call.

Rationale: without reasoning, admin cannot distinguish "model made a calculated call admin disagrees with" from "model hallucinated." Both need different corrective actions.

### 2.2 Admin review surface — three actions and two feedback channels

Every AI decision must be reviewable by admin through a standardized UI with:

**Three actions:**
- **Approve** — admin agrees with the decision. Recorded as positive reinforcement.
- **Redo** — admin wants the model to reconsider with new input. Triggers a targeted re-analysis of just this decision, not the whole batch.
- **Reject** — admin overrides the decision manually (or discards it entirely). Recorded as negative reinforcement with strong weight.

**Two feedback channels (text inputs shown with every action):**
- **Specific feedback** — scoped to THIS decision in THIS project only. Used immediately for the Redo action's re-analysis. Not stored as cross-project training data.
- **Global Rule** — scoped to ALL projects across ALL tools. Stored in the central `ai_feedback_records` repository as cross-project training data. Should be a statement of principle ("keywords with [X] facet should always be placed under a dedicated sub-topic"), not a project-specific correction ("move 'bursa city' out of this topic").

**Why two channels:** Without separation, admin feedback either over-generalizes (one specific correction becomes a global rule that doesn't apply elsewhere) or under-generalizes (same correction given 50 times because the model never learns cross-project). Surfacing the right question — "Am I teaching the model for this project only, or for all future projects?" — prevents both failure modes.

### 2.3 Feedback repository write

Every admin action + feedback entry creates a row in `ai_feedback_records` with full context snapshot. Required fields:

```
{
  id: UUID (primary key)
  project_id: UUID (foreign key to Project)
  tool: string (e.g., "keyword_clustering", "competition_scraping")
  ai_model: string (e.g., "claude-opus-4-7")
  ai_mode: string (e.g., "mode-a-full-table", "mode-b-delta") — nullable
  batch_id: UUID (nullable — for tools with batch processing)
  decision_type: string (e.g., "primary-placement", "topic-create", "topic-merge")
  decision_payload: JSON (the structured decision including model reasoning)
  admin_action: enum ("approve", "redo", "reject")
  admin_specific_feedback: text (nullable — project-scoped)
  admin_global_rule: text (nullable — cross-project-scoped)
  context_snapshot: JSON (tool-specific state snapshot — canvas tree, keyword list, etc.)
  created_by: UUID (foreign key to User)
  created_at: timestamp
  quality_score: integer 1-5 (nullable — admin rating)
}
```

The tool's UI passes all fields to the API endpoint; the API writes the row; the row is immutable (corrections are new rows, not edits).

### 2.4 Feedback repository read-back

At prompt-generation time, every AI-using tool retrieves the N most-relevant prior `admin_global_rule` entries and includes them as few-shot examples in the model's prompt. This reinforces correct behavior based on accumulated platform wisdom.

Relevance scoring is tool-specific (will differ between Keyword Clustering and e.g. Content Development), but the shared principle:
- Filter to `tool` matching the current tool
- Within that, filter by decision type (e.g., topic-placement for keyword clustering)
- Within that, rank by recency + admin_action weight (rejects > redos > approves) + text-similarity to current context
- Default N = 20 most relevant; configurable per tool

### 2.5 Quality scoring over time

Every AI output carries a `quality_score` that accumulates from admin interactions:

- Admin approve: +1 weight
- Admin redo: 0 weight (neutral — "I asked for a retry, not a pass/fail")
- Admin reject: −3 weight

Scores inform whether downstream processes treat the output as authoritative or tentative. Example: a topic with quality_score ≥ 4 is treated as locked for structural changes (model warned against modifying); score ≤ 2 is flagged for admin review in future runs.

See `docs/MODEL_QUALITY_SCORING.md` for the full scoring algorithm, including admin scoring guidelines and meta-notes for algorithm improvement.

### 2.6 Model/provider registry integration

Every AI-using tool reads model selection from the central `ai_models` DB table, not hardcoded strings. New models are available platform-wide once added to the registry. Deprecated models show with a warning but remain selectable for audit/reproducibility.

See `docs/ROADMAP.md` "Model Registry" item for the table schema and rollout plan.

---

## 3. Implementation phasing

The feedback system rolls out in three phases. Every new tool must meet Phase 1 requirements from day one; Phases 2 and 3 unlock progressively as the corpus grows.

### Phase 1 — Capture only
- DB table `ai_feedback_records` exists
- Every tool writes to it when admin interacts with the review UI
- No read-back yet
- Goal: accumulate the corpus

### Phase 2 — Read-back / few-shot injection
- Tools retrieve relevant prior feedback at prompt-generation time
- Relevant examples are injected into the model's prompt as few-shot examples
- Adds ~5k input tokens per AI call; with prompt caching, minimal cost impact
- Goal: steer the model toward known-good behavior based on accumulated feedback

### Phase 3 — Pattern analysis
- Claude Code periodically analyzes the feedback table
- Identifies recurring patterns ("admin rejected X type of decision 73% of the time when condition Y")
- Proposes specific prompt improvements or tool-rule changes for admin review
- Goal: the platform itself proposes improvements without admin needing to infer patterns manually

Phase 1 is the baseline for all tools. Phase 2 activates when the corpus has ≥50 entries for a given tool's decision type. Phase 3 activates opportunistically — whenever admin or Claude Code notices a pattern worth investigating.

---

## 4. Primer text — include in every new workflow's design doc

When building a new workflow tool (per `HANDOFF_PROTOCOL.md` Rule 18 Workflow Requirements Interview), include the following text in the tool's DESIGN.md so the tool is architected for feedback-on-rails from day one:

```
FEEDBACK-ON-RAILS REQUIREMENT (platform-wide standard)

This tool uses AI for <FUNCTION_DESCRIPTION>. As part of the PLOS
platform's cross-project learning system, this tool MUST integrate
with the central feedback repository per AI_TOOL_FEEDBACK_PROTOCOL.md.

Required integration points:

1. Structured decision output with reasoning — every AI decision
   includes rationale, not just conclusion.

2. Admin review surface — three actions (Approve/Redo/Reject) plus
   two text inputs (Specific feedback and Global Rule).

3. Feedback repository write — every admin action creates a row in
   ai_feedback_records with full context snapshot.

4. Feedback repository read-back — at prompt-generation time, the
   tool retrieves the N most-relevant prior feedback entries and
   includes them as few-shot examples.

5. Quality scoring — every AI output carries a stability/quality
   score that accumulates from admin approvals and decays from
   rejections; scores inform downstream treatment.

6. Model/provider registry — model selection reads from the central
   ai_models table, not hardcoded values.

See KEYWORD_CLUSTERING_ACTIVE.md for reference implementation.
```

---

## 5. Maintenance and evolution

This doc is the platform-wide standard. Changes require:
- Explicit director approval
- Update to all tool DESIGN.md docs that reference it
- Migration plan for existing tools if breaking changes

If a specific tool requires an exception (some aspect of this protocol doesn't fit that tool's workflow), the exception must be documented in the tool's DESIGN.md with justification and approved by the director.

---

END OF DOCUMENT
