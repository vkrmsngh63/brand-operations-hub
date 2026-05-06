# Auto-Analyze Consolidation Prompts V4 — Operation-Based Consolidation Pass

**Created:** 2026-05-01 (Scale Session E build session — derives from `AUTO_ANALYZE_PROMPT_V4.md` per `INPUT_CONTEXT_SCALING_DESIGN.md` §4.1 + §6 Scale Session E. Two text prompts the director pastes into the Auto-Analyze panel's Consolidation slots; consumed by both the auto-fire-every-N-batches gate and the admin-triggered Consolidate Now button.)
**Created in session:** session_2026-05-01_scale-session-e-build (Claude Code)

**Purpose:** The two text prompts used by the Keyword Clustering tool's Auto-Analyze CONSOLIDATION pass. The consolidation pass is a separate full-canvas-at-Tier-0 pass that complements the regular per-batch Auto-Analyze runs:

- The regular per-batch run analyzes a fixed batch of new keywords against the canvas, where the canvas is shown to the model in three compressed tiers (Tier 0 / 1 / 2) per `INPUT_CONTEXT_SCALING_DESIGN.md`.
- The consolidation pass receives no batch keywords. Its input is the full canvas at Tier 0 — every topic in full detail. Its job is to scan the whole canvas for structural improvements that the per-batch tier-mode runs may have missed because some topics were compressed away.

**Vocabulary restriction (Cluster 4 Q14 lock + 2026-05-05 sister-link drift cleanup — Option A):** the consolidation pass MUST NOT emit `ADD_TOPIC`, `ADD_KEYWORD`, `ADD_SISTER_LINK`, or `REMOVE_SISTER_LINK`. The applier rejects any of these four operations atomically when consolidation mode is set (`src/lib/operation-applier.ts` `applyOperations(state, ops, { consolidationMode: true })`). The two ADD ops are forbidden because consolidation only restructures existing topics; the two sister-link ops are forbidden because sister links are deferred out of every Auto-Analyze pass entirely — they belong to a separate second-pass functionality run after first-pass Auto-Analyze is correctly producing topics (director's standing plan; surfaced 2026-05-05 mid-D3 after consolidation #1 emitted 3 sister-link ops despite the broader plan). Allowed operations the model knows about: `MERGE_TOPICS`, `SPLIT_TOPIC`, `MOVE_TOPIC`, `DELETE_TOPIC`, `UPDATE_TOPIC_TITLE`, `UPDATE_TOPIC_DESCRIPTION`, `MOVE_KEYWORD`, `REMOVE_KEYWORD`, `ARCHIVE_KEYWORD`.

**Option A approach (the model never sees sister links):** the consolidation prompts (sections 1 + 2 below) and the consolidation TSV input have been deliberately stripped of all references to sister-link operations and the Sister Nodes column. The model literally cannot see existing sister links on the canvas; the operation vocabulary it knows excludes the sister-link ops; existing sister links remain as data on the canvas but are managed only by the future second-pass functionality. The applier-side rejection of `ADD_SISTER_LINK` + `REMOVE_SISTER_LINK` in consolidation mode stays as a silent backstop in case the model invents the ops from prior training. (The earlier "explicit deferral framing" approach — telling the model what's forbidden and why — was rejected mid-session: it imposed cognitive load and risked priming the model to think about what it's been told not to think about. See `docs/CORRECTIONS_LOG.md` 2026-05-05 entry on the mid-session pivot from explicit-forbiddance to invisibility.)

**Predecessor file:** `docs/AUTO_ANALYZE_PROMPT_V4.md` — V4 of the regular per-batch prompts (canonical since 2026-04-30 Scale Session D). The Consolidation prompts borrow V4's topic-naming + intent-equivalence + stability-score + conversion-funnel-ordering language verbatim; only the framing (consolidation vs. per-batch keyword placement), the input-format section (always Tier 0, no batch keywords, no Sister Nodes column), and the operation-vocabulary section (no ADD_TOPIC / ADD_KEYWORD / sister-link ops) differ.

**Canonical operation vocabulary:** `src/lib/operation-applier.ts` `Operation` discriminated union, minus the four consolidation-forbidden types (ADD_TOPIC, ADD_KEYWORD, ADD_SISTER_LINK, REMOVE_SISTER_LINK).

**Canonical input format:** `src/lib/auto-analyze-v3.ts` `buildOperationsInputTsv(... { serializationMode: 'full', omitSisterNodesColumn: true })`. Consolidation always uses `'full'` (no tier compression — §4.1's purpose is to give the model every topic at full detail so the Reevaluation Pass triggers can fire on parts of the canvas that the per-batch runs have only seen at Tier 1 or Tier 2) AND `omitSisterNodesColumn: true` (Option A — the model's input has 8 columns, not 9; the Sister Nodes column is dropped so existing sister links are invisible to the consolidation model).

---

## How these prompts are used

The Auto-Analyze panel in the Keyword Clustering tool has two text inputs dedicated to consolidation prompts (separate from the regular Initial Prompt + Primer pair):

- **Consolidation Initial Prompt** — the first prompt below. Defines the consolidation task: full-canvas scan, restricted vocabulary, structural-improvements focus.
- **Consolidation Primer** — the second prompt below. Defines the input table format (always full Tier 0), the allowed operation vocabulary, the operation syntax, and the cross-cutting rules.

Two trigger paths share these prompts:

1. **Auto-fire** every N batches (default N=10; gated to canvas size > 100 topics; both configurable via Auto-Analyze settings). After each successful regular batch's apply, the wiring layer increments a counter; when the counter hits the cadence and the gate condition is met, the consolidation pass fires before the next regular batch begins.
2. **Admin-triggered "Consolidate Now"** button in the Auto-Analyze panel. Available when the panel is IDLE (or PAUSED). Runs one consolidation pass on the current canvas state and then returns control.

Before starting any run, the director pastes each prompt into its corresponding text input in the panel. The tool then interpolates two placeholder values at runtime:

- `[PRIMARY_SEED_WORDS]` — filled with the seed word(s) the user enters (e.g., `bursitis`).
- `[VOLUME_THRESHOLD]` — filled with the volume threshold the user sets.

At runtime, the tool serializes the current canvas state as TSV input (full Tier 0; described in the Primer) and includes it in the model's context. There is NO batch of new keywords for consolidation — the input is canvas-only.

---

## How to update these prompts

1. Edit this file directly with the new version.
2. Commit the change with a message describing what changed.
3. Remember that changing this file does NOT automatically update what's pasted in the browser UI. After editing, the director must re-paste the new version into the Auto-Analyze Consolidation slots before the next run.

If the operation vocabulary in `src/lib/operation-applier.ts` changes, update both the applier and these prompts in the same session — they are a contract pair (and `applyOperations` enforces the consolidation-mode restriction independently).

---

## 1. Consolidation Initial Prompt V4

```
Context: We are brand owners and manufacturers of products that are perfectly suited for specific health niches. Our main aim is to use keyword data to develop and market these products perfectly matched to the niche and to have CTRs for google ads and ebay listings, amazon listings, Walmart.com listings, etsy listings and google shopping listings that far surpass industry standards and far surpasses averages for competitors within that specific niche. We do this by using the keyword data to first understand the consumer's and the caretaker's demand on such a granular level that our product development, its narratives, our content, our marketing and our post sales support cater directly to those needs, worries/concerns of those people in a way that they find highly intriguing, highly engaging and highly compelling so that they quickly engage with us because our product and our content is hyper-relevant to their immediate needs/concerns/goals and deeply engaging, sticky and emotionally provocative, builds momentum towards a planned narrative that inevitably leads them to convert into highly eager buyers that are convinced our product is unique, better than anything else in the market for that niche and sure to resolve not only their problem but also their concerns which have been built up to a feverish pitch through our planned narratives.

We have already analyzed many batches of keywords against this canvas and built it up over time. The canvas now holds the structured representation of our conversion funnel — every topic, every keyword placement, every parent-child relationship.

This call is a CONSOLIDATION PASS — not a per-batch keyword-placement run.

THE CONSOLIDATION PASS — WHAT IT IS AND WHAT IT IS NOT:

A consolidation pass scans the ENTIRE canvas (every topic at full detail — Tier 0) for STRUCTURAL improvements warranted by the cumulative state. It is not a place to introduce new topics or new keywords; both ADD_TOPIC and ADD_KEYWORD are FORBIDDEN in this pass and the applier will reject the entire batch atomically if either is emitted.

The reason consolidation passes exist: per-batch Auto-Analyze runs see the canvas in three compressed tiers (Tier 0 / Tier 1 / Tier 2) — only topics in the batch's relevant subtree, recently touched, or low-stability stay at full detail. Topics that are off-batch, settled, and stable get compressed to a one-line summary or just a stable ID + title. The per-batch model can therefore miss intent-equivalence violations, suboptimal hierarchy placements, or other structural issues on the parts of the canvas it has only seen in compressed form. This consolidation pass closes that gap by giving you EVERY topic at full detail and asking you to scan for structural improvements across the WHOLE canvas (not just branches recently touched).

Your job in this consolidation pass:

(1) Scan the ENTIRE canvas — every topic, every branch — looking for the seven types of structural improvement enumerated in the Consolidation Reevaluation Pass section below. The triggers and thresholds are the same ones used in regular per-batch Reevaluation, but they apply to the whole canvas this pass — not just to recently-touched branches.

(2) Emit operations RESTRICTED TO the consolidation vocabulary: MERGE_TOPICS, SPLIT_TOPIC, MOVE_TOPIC, DELETE_TOPIC, UPDATE_TOPIC_TITLE, UPDATE_TOPIC_DESCRIPTION, MOVE_KEYWORD, REMOVE_KEYWORD, ARCHIVE_KEYWORD. ADD_TOPIC and ADD_KEYWORD are FORBIDDEN — emitting either fails the entire batch atomically.

(3) Use SPLIT_TOPIC to introduce new topics when an existing topic violates intent-equivalence. SPLIT_TOPIC creates new topics via its `into[]` array and is fully allowed — it is not the same as ADD_TOPIC. The constraint is: do not introduce new topics OR new keywords that don't have a structural justification rooted in restructuring an existing topic or keyword placement.

(4) Be conservative on high-stability topics. Topics with stability_score >= 7.0 represent admin's accumulated prior approvals; modifying them requires a JUSTIFY_RESTRUCTURE payload (six fields; see the Primer's CROSS-CUTTING RULES section). Be specific in the justification — admin reads these payloads carefully and rejects vague ones.

(5) An EMPTY operation list is a valid output. If the canvas is structurally clean and no consolidation operations are warranted, emit just the opening and closing OPERATIONS delimiters with nothing between them. This is the expected outcome on a well-maintained canvas; do not invent operations to look productive.


Topic Naming — Searcher-Centric Language:
Every topic title in the conversion funnel must be written in language that a condition sufferer would naturally use, respond to, and find engaging. The conversion funnel is not an internal utility document — it is a direct blueprint for the narrative that the sufferer will experience. Topic titles should mirror the thoughts, questions, and concerns that are already running through the sufferer's mind.

Guidelines for topic naming (apply when emitting UPDATE_TOPIC_TITLE or naming new topics inside SPLIT_TOPIC):
(a) Use natural questions and concerns as topic titles. Instead of "[Condition] demographics", use "Who gets [condition]?" or "Who does [condition] affect?". Instead of "[Condition] etiology", use "What causes [condition]?". Instead of "[Condition] by anatomical location", use "Where does [condition] hurt?".
(b) Use the vocabulary of the sufferer, not the clinician. Prefer "pain that won't go away" over "chronic [condition]", "treatments you can try at home" over "conservative management options", "when to see a doctor" over "clinical referral thresholds". The sufferer should feel the funnel is speaking their language.
(c) Topic titles for demographic or facet-based sub-topics should frame the facet as the sufferer experiences it. Instead of "[Condition] in females", use "[Condition] in women" or "How [condition] affects women differently". Instead of "Age-related [condition]", use "[Condition] as you get older" or "Why [condition] gets worse with age".
(d) Organizational parent topics (empty narrative-bridging topics that exist to structure the hierarchy) must still use engaging, sufferer-centric language. They serve as the headlines and chapter titles of the narrative — they must catch attention and signal relevance, not read like database categories.
(e) When renaming a topic or naming a new topic from a SPLIT, always ask: "If a sufferer saw this as a heading on a page, would they feel compelled to read on?" If the answer is no, rephrase.


The Intent-Equivalence Principle (binding end-state rule):

The Topics Layout Table has a target end-state. In its ideal finished form:

(1) Every unique searcher intent has its own primary topic. No two distinct intents are bundled into a single topic. The primary topic IS the intent — they are the same thing.

(2) Each primary topic sits within a deliberate, progressive hierarchy of parent topics that organizes the searcher's narrative journey from awareness through to conversion.

(3) Two keywords share a primary topic ONLY IF they share the same compound intent — the same searcher in the same situation seeking the same outcome. Word-level similarity (similar tokens, similar phrasing) is INSUFFICIENT for primary co-placement; intent-equivalence is the binding test.

(4) Empty bridge topics, complementary topic pairs, and unifying parent topics are FEATURES of a well-structured funnel — they are deliberate narrative scaffolding, not exceptions to be tolerated. They give the conversion funnel its chapter-and-section structure.

CONSEQUENCE FOR CONSOLIDATION: scan the canvas for existing topics that violate intent-equivalence — a single topic whose primary keywords carry meaningfully different compound intents. SPLIT_TOPIC is the operation that fixes these violations. Per the binding rule, even a single primary keyword whose compound intent diverges from the topic's other primary keywords warrants splitting (because the topic is no longer an intent-equivalence class). Splits driven by intent-equivalence violations have no minimum cluster size — distinct compound intents must live in distinct topics regardless of how many keywords are involved.

Also scan for the inverse failure mode: two existing topics whose intents have CONVERGED (their descriptions substantially overlap; their keywords would be equally well-served by either; maintaining both creates fragmentation without narrative distinction). MERGE_TOPICS is the operation that fixes these.


Stability Score Interpretation (binding):

Each topic carries a stability_score from 0.0 to 10.0 in the Stability Score column. This score reflects how well-validated the topic is — through admin approvals, cross-batch consistency, keyword-placement stability, and related signals.

- Score >= 7.0 — Topic is well-validated. DO NOT modify its name, parent relationship, or conversion-funnel-stage assignment unless you have a compelling structural reason. If you must modify, you MUST emit a JUSTIFY_RESTRUCTURE payload alongside the operation that does so. The payload's six fields are defined in the Primer's CROSS-CUTTING RULES section.

- Score 4.0 - 6.9 — Topic is established but not locked. Modify only when the improvement is clearly meaningful, not marginal. The reason field on each structural operation is sufficient documentation; no JUSTIFY_RESTRUCTURE required.

- Score < 4.0 — Topic is open to restructuring based on new evidence. Apply normal Reevaluation Pass thresholds.

- Score not provided or 0.0 — Treat as fully open. This is the default for newly-created topics.

JUSTIFY_RESTRUCTURE applies to: UPDATE_TOPIC_TITLE, MOVE_TOPIC, MERGE_TOPICS (when EITHER source or target is at threshold), SPLIT_TOPIC, DELETE_TOPIC. It does NOT apply to UPDATE_TOPIC_DESCRIPTION (descriptive-only edits are safe even on stable topics) or to the keyword-placement operations (MOVE_KEYWORD, REMOVE_KEYWORD, ARCHIVE_KEYWORD).

In a consolidation pass, the high-stability gate is especially important — many topics on a mature canvas have stability scores at or near the threshold. Be specific in justifications; cite which intent-equivalence violation, which structural pattern, or which evidence from the canvas warrants modifying a well-validated topic. Generic justifications ("better fit," "cleaner structure") are NOT acceptable.


Conversion Funnel Stage Ordering:
The Topics Layout Table is not just a topical taxonomy — it is a conversion funnel with a deliberate narrative arc. Every topic belongs at a specific stage in the journey from initial awareness to final conversion.

(a) Root-level topics represent distinct stages of the conversion funnel, ordered from awareness to purchase. A typical health niche funnel progresses through stages like: recognizing something is wrong → understanding what the condition is → learning who it affects and why → exploring what can be done → evaluating specific solutions → taking action.

(b) Linear children within each branch must move the narrative forward toward conversion. Each linear topic should represent the next natural thought the searcher would have after absorbing the previous topic.

(c) Nested children represent deeper exploration within the current funnel stage — not jumps to a different stage. If a topic would naturally come after the parent rather than within it, it should be linear, not nested.

(d) Cross-cutting topics also follow funnel ordering within their own branch.

In a consolidation pass, scan for topics whose hierarchy placement (parent + relationship) is wrong relative to where they belong in the funnel. MOVE_TOPIC is the operation that fixes these. Conversion Path is read-only metadata; do not emit operations that try to change a topic's Conversion Path.


Consolidation Reevaluation Pass:

Scan the entire canvas for the seven types of structural improvement listed below. Each maps to one or more operations from the consolidation vocabulary. The triggers and thresholds match the regular per-batch Reevaluation Pass, but in a consolidation pass the scope is the WHOLE canvas — not just touched branches.

(1) Facet Promotion → SPLIT_TOPIC + MOVE_KEYWORD operations.
   Signal: an existing topic contains keywords that share a facet that warrants its own dedicated sub-topic — at least 2 keywords share it, OR keywords whose combined search volume meets/exceeds [VOLUME_THRESHOLD], OR any single keyword at/above the threshold carrying that facet.
   Action: SPLIT_TOPIC the existing topic into the original (with its remaining keywords) plus a new sibling topic for the facet. Migrate the affected keywords via the SPLIT_TOPIC `into[]` array's keyword_ids assignment. (Note: ADD_TOPIC is forbidden in consolidation mode — facet promotion is performed via SPLIT_TOPIC, which creates new topics as part of an existing-topic restructure rather than introducing them out of thin air.)

(2) Keyword Reassignment → MOVE_KEYWORD operations.
   Signal: an existing topic is a clearly superior home for keywords currently in a different topic (perhaps a more recent topic better captures the keyword's compound intent than its current placement).
   Action: MOVE_KEYWORD for each affected keyword. Apply this test before moving: "Would content written for the new topic address this keyword's intent more directly and completely than content written for the current topic?" Move only on a clear yes — not a marginal improvement. If the source topic has stability_score >= 7.0 and you are moving keywords AWAY from it, accompany the moves with a paired UPDATE_TOPIC_DESCRIPTION on the source if its description should be revised.

(3) Topic Splitting → SPLIT_TOPIC operation.
   Signals (two variants — the first is the higher-priority case):

   (3a) INTENT-EQUIVALENCE VIOLATION (high-priority, binding). An existing topic bundles multiple distinct compound intents in its primary keywords, violating the intent-equivalence rule. This must be split regardless of cluster size — even a single primary keyword whose compound intent diverges from the topic's other primary keywords warrants splitting (because the topic is no longer an intent-equivalence class). Detect by examining each topic's primary keyword set: do all primary keywords share the same compound intent (same searcher in same situation seeking same outcome)? If no, the topic violates intent-equivalence. Note: secondary placements at the topic do NOT trigger splitting — only primary co-placement of distinct compound intents does.

   (3b) DIVERGENT SUB-INTENT ACCUMULATION (legacy threshold). An existing topic has accumulated keywords with meaningfully divergent sub-intents that would require substantially different content narratives, with each sub-intent cluster having at least 2 keywords. This is the milder case — the topic may be passing intent-equivalence at the primary-bundling level but is structurally too broad for content production.

   Action for both: SPLIT_TOPIC. Specify the source topic (by stable ID), the new sibling/nested topics (each with alias, title, description, intent_fingerprint, and the keyword UUIDs going to it), and a plain-English reason. SPLIT_TOPIC requires the source topic to have NO child topics — if it does, MOVE_TOPIC the children FIRST (earlier in the operation list). For (3a), the reason field must explicitly cite the intent-equivalence violation and identify the distinct compound intents being separated.

(4) Topic Merging → MERGE_TOPICS operation.
   Signal: two existing topics at the same level have converged in intent. Their descriptions substantially overlap; their keywords would be equally well-served by either topic; maintaining both creates fragmentation without narrative distinction.
   Action: MERGE_TOPICS. Specify source and target stable IDs, the merged title and description, the merged_intent_fingerprint, and a reason. The applier auto-reparents source's children under target — you do NOT need to emit separate MOVE_TOPIC operations for them.

(5) Hierarchy Repositioning → MOVE_TOPIC operation.
   Signal: an existing topic's parent-child placement is suboptimal — wrong parent, wrong depth, or wrong branch given the broader pattern visible across the canvas.
   Action: MOVE_TOPIC. Specify the topic's stable ID, the new parent (or null for root), the new relationship (linear/nested), and a reason. The topic's subtree (children, grandchildren, etc.) move with it automatically.

(6) Narrative Flow Refinement → MOVE_TOPIC operation (with same parent, different relationship).
   Signal: a topic's linear-vs-nested classification is wrong — a "nested" topic actually represents a narrative next step (linear), or vice versa.
   Action: MOVE_TOPIC with the same parent but a different relationship value. UPDATE_TOPIC_DESCRIPTION may be paired if the description should reflect the corrected role.

(7) Empty / Stale / Redundant Topic Cleanup → DELETE_TOPIC operation.
   Signal: a topic has no primary keyword placements and no narrative scaffolding role that would justify keeping it; OR a topic has been entirely subsumed by a sibling that captures all of its intent better; OR a topic was created speculatively in an earlier batch and never accumulated keywords.
   Action: DELETE_TOPIC with reassign_keywords_to set to either another topic ref (if any keywords remain — typically secondary placements) OR the literal string "ARCHIVE" (which archives keywords whose only placement was at this topic). Constraint: the topic MUST have NO child topics — MOVE_TOPIC the children FIRST.

Consolidation Reevaluation Constraints:

(a) Scan the WHOLE canvas, not just specific branches. The point of the consolidation pass is to catch issues in branches that recent per-batch runs only saw at Tier 1 or Tier 2 compression.

(b) Be conservative on stability ≥ 7.0 topics. Each restructuring operation against a stable topic requires a JUSTIFY_RESTRUCTURE payload with specific, non-generic justification.

(c) Do not introduce new topics or new keywords. ADD_TOPIC and ADD_KEYWORD are FORBIDDEN. New topics created via SPLIT_TOPIC's `into[]` are fine — those are restructurings of existing topics, not introductions.

(d) Do not change a topic's Conversion Path. The applier preserves Conversion Path. If you believe a topic genuinely belongs in a different funnel, note it in your operation's reason field for admin review; do not silently move it.

(e) Every structural change (MERGE_TOPICS, SPLIT_TOPIC, MOVE_TOPIC, DELETE_TOPIC, UPDATE_TOPIC_TITLE) must carry a non-empty reason field. The reasons collectively are the audit log — there is no separate Reevaluation Report block in your output.

(f) An empty operation list is valid output. A well-maintained canvas may genuinely warrant zero consolidation operations on a given pass — emit just the opening and closing delimiters in that case.


AUTOMATED PROCESSING CONTEXT:

This consolidation pass is executed via an automated API pipeline. Your output will be parsed programmatically — not read in a chat interface. Therefore:
- Do NOT produce interactive artifacts, HTML tables, visual mindmaps, or downloadable files.
- Do NOT include markdown code fences around your output.
- Do NOT re-emit the Topics Layout Table or any topic, description, or keyword placement whose state is unchanged. Emit operations only for changes.
- Do NOT emit any text outside the OPERATIONS block. No commentary, no Reevaluation Report, no "here's what I did." The reason field on each structural operation is the audit record.
- Focus on the analytical quality of your placement decisions, the precision of the operations you emit, and your justifications on structural operations.
- Your output MUST contain exactly one delimited block: `=== OPERATIONS ===` ... `=== END OPERATIONS ===`. Each line inside the block is one JSON-formatted operation. The exact operation syntax is in the Topics Layout Table Primer (Consolidation).
- An empty operation list is valid output if the canvas genuinely warrants no changes (and is the expected outcome on a well-maintained canvas). Emit just the opening and closing delimiters with nothing between them.
- Do NOT emit `ADD_TOPIC` or `ADD_KEYWORD` — both are FORBIDDEN in consolidation mode and the applier will reject the entire batch atomically if either is emitted.
```

---

## 2. Topics Layout Table Primer V4 (Consolidation)

```
CONTEXT: What We Are Doing

We are brand owners developing health products targeted at specific health niches. We use keyword data from search engines to deeply understand the searcher's explicit and implicit intents, emotional drivers, concerns, goals, and motivations. This understanding drives:

1. Product development — so the product itself addresses the real needs uncovered from keyword analysis
2. Conversion funnel creation — a narrative-driven content strategy that leads searchers from initial awareness through to an eager, satisfying purchase
3. Content strategy — hyper-relevant content for Google Ads, Amazon, eBay, Walmart, Etsy, and Google Shopping that achieves click-through rates far above industry averages

Our methodology centers on organizing keyword intents into Topics (representing distinct searcher intents, concerns, or stages) and arranging those Topics into a structured conversion funnel — a narrative path that moves a searcher from broad awareness to confident purchase.


WHAT THE TOPICS LAYOUT TABLE IS

The Topics Layout Table is the structured representation of our conversion funnel. Each row is a topic node; the combination of Stable ID, Parent Stable ID, and Relationship places that node in the hierarchy. Each topic carries a stability score reflecting how well-validated it is, plus its keyword placements.

YOU RECEIVE THE TABLE AS TSV INPUT. The tool serializes the current state of the canvas as tab-separated values and includes it in your prompt context. **You DO NOT re-emit this table on output.** Your job is to emit a list of consolidation operations against the table, using the restricted vocabulary defined further below.

Anything you do not mention in your operation list stays exactly where it was. Silence is preservation.


INPUT TABLE FORMAT — CONSOLIDATION PASS (full Tier 0 only)

In a consolidation pass, the entire canvas is shown to you in a single Tier 0 section — every topic at full 8-column detail. There are no Tier 1 or Tier 2 sections. There is no batch of new keywords to place. The purpose of consolidation is to scan the whole canvas at full detail for structural improvements that the per-batch tier-mode runs may have missed because some topics were compressed away.

The TSV input begins with a `=== TIER 0 ===` delimiter line on its own line, then the column header row, then data rows — one per topic on the canvas, sorted by Stable ID numeric suffix (roughly creation order). On a fresh project with no topics, you would see only the column header row with no data rows (and no consolidation operations would be warranted — emit the empty OPERATIONS block).


TIER 0 COLUMNS (full detail — 8 columns, tab-separated, in this exact order, header row first)

Stable ID — A persistent identifier for each topic, formatted "t-N" (e.g., "t-42"). This is the handle you use to reference topics in your operations. Stable IDs survive renames, parent changes, the surviving target of a merge, and any other modification. They are the only reliable way to address a topic in this system.

Title — The current display title of the topic. Used for human readability; it is NOT the address. To rename a topic, use UPDATE_TOPIC_TITLE referencing the topic's Stable ID — do not match by title.

Description — The topic's current description. Plain text; tabs and newlines have been replaced with spaces in the input.

Parent Stable ID — The Stable ID of the parent topic (e.g., "t-1"). Empty for root topics.

Relationship — How this topic connects to its parent. Values: "linear" (peer-sequence — this topic is the next narrative step from the parent), "nested" (sub-topic — deeper dive within parent's scope). Empty for root topics.

Conversion Path — The name of the conversion funnel this topic belongs to (typically the title of the funnel's root topic). A single canvas can contain multiple conversion paths.

Stability Score — A float from 0.0 to 10.0 reflecting how well-validated this topic is, based on admin approvals, cross-batch consistency, keyword-placement stability, and related signals. See the Initial Prompt's Stability Score Interpretation section.

Keywords — Comma-separated list of keyword placements at this topic. Each item is formatted "<keyword_uuid>|<keyword_text> [<placement_marker>]" where placement_marker is "p" (primary) or "s" (secondary). Example: `5e8c-f9-abc|female hip pain symptoms [p], 9d2f-cd-xyz|women joint pain hip [s]`. The keyword_uuid is the only field you reference in operations; the keyword_text is provided for your analytical reasoning and human readability.


INPUT PARSING NOTES

The TSV input is generated deterministically by the tool. You read it; you do not parse-and-re-emit it.

- Stable IDs always begin with "t-".
- Newly-created stable IDs (in your SPLIT_TOPIC operations) use aliases starting with "$" (e.g., "$new1") — these never appear in input.
- Keywords are referenced in operations exclusively by their UUID, never by their text. Whitespace, smart quotes, case, and unicode in keyword text all create silent text-matching failures; UUIDs do not.
- Empty cells (e.g., empty Parent Stable ID for root topics) appear as a single empty string between tab delimiters.
- The order of topics is by Stable ID numeric suffix (roughly creation order). The arrangement does NOT correspond to conversion-funnel order — topics may belong to many different funnels. Use Parent Stable ID + each topic's title and description to reason about funnel placement.


THE CONSOLIDATION OPERATION VOCABULARY

Your output is a list of operations from the following vocabulary. Operations are applied in the order you emit them. Anything not mentioned in your operations stays exactly where it was — silence is preservation.

The consolidation vocabulary is V4's full vocabulary MINUS two operations: ADD_TOPIC and ADD_KEYWORD. Both are FORBIDDEN in consolidation mode and the applier will reject the entire batch atomically if either is emitted. The remaining operations are listed below.

OPERATION SYNTAX

Each operation is a single JSON object emitted on its own line. The operation's type goes in an "op" field. All other fields are operation-specific. Wrap your operations in a single delimited block:

=== OPERATIONS ===
{"op": "MERGE_TOPICS", "source_id": "t-19", "target_id": "t-42", "merged_title": "Bursitis triggers", "merged_description": "Common situations and activities that bring on bursitis pain", "merged_intent_fingerprint": "Bursitis sufferers identifying activities and situations that bring on their pain", "reason": "t-19 and t-42 captured the same compound intent; consolidating to remove fragmentation"}
{"op": "MOVE_KEYWORD", "keyword_id": "9d2f-cd-xyz", "from": "t-7", "to": "t-42", "placement": "primary"}
=== END OPERATIONS ===

If your operation list is empty (the canvas is structurally clean — the expected outcome on a well-maintained canvas), emit:

=== OPERATIONS ===
=== END OPERATIONS ===

KEYS USE snake_case. The exact field names per operation are listed below; emit them verbatim.

FORBIDDEN OPERATIONS IN CONSOLIDATION MODE — DO NOT EMIT:

- `ADD_TOPIC` — forbidden. Consolidation does not introduce new topics out of thin air. New topics created as part of restructuring an existing topic are introduced via SPLIT_TOPIC's `into[]` array, which is allowed.
- `ADD_KEYWORD` — forbidden. Consolidation does not introduce new keyword placements; it only restructures existing placements via MOVE_KEYWORD, REMOVE_KEYWORD, or ARCHIVE_KEYWORD.

Emitting either forbidden operation causes the applier to reject the entire batch atomically with the error `<OPERATION> is not allowed in consolidation mode`.


TOPIC OPERATIONS (allowed in consolidation mode)

UPDATE_TOPIC_TITLE — Rename a topic. Nothing else changes.
Fields:
  - op: "UPDATE_TOPIC_TITLE"
  - id: Stable ID of the topic to rename
  - to: new title (non-empty)
  - intent_fingerprint: REQUIRED. A renamed topic's intent expression has shifted (otherwise why rename?), so refresh the fingerprint to match the new title. Format: short canonical phrase, 5–15 words, in searcher-centric language, capturing the topic's compound intent (audience + situation + goal). Example: "Older bursitis sufferers seeking gentle, low-cost home relief."
  - justify_restructure: required if the topic's stability_score >= 7.0 (see CROSS-CUTTING RULES section below)

UPDATE_TOPIC_DESCRIPTION — Rewrite a topic's description. Title and position unchanged.
Fields:
  - op: "UPDATE_TOPIC_DESCRIPTION"
  - id: Stable ID
  - to: new description
  - intent_fingerprint: OPTIONAL. Most description rewrites are pure refinement and the existing fingerprint stays accurate; in those cases omit this field. Supply a new fingerprint ONLY if the description rewrite has shifted the topic's compound intent in a way the existing fingerprint no longer captures.
(Description-only edits are safe even on high-stability topics. NO JUSTIFY_RESTRUCTURE required.)

MOVE_TOPIC — Re-parent a topic and its entire subtree.
Fields:
  - op: "MOVE_TOPIC"
  - id: Stable ID
  - new_parent: Stable ID, or null (for becoming a root)
  - new_relationship: "linear" or "nested" (required when new_parent is non-null)
  - reason: plain-English audit reason (non-empty)
  - justify_restructure: required if the moved topic's stability_score >= 7.0
Constraint: the new parent cannot be the topic itself or any descendant of the topic (no parent-cycles).

MERGE_TOPICS — Combine two topics into one. The applier:
  - re-parents source's children under target,
  - merges keyword placements with target winning on collision,
  - removes source.
Do NOT emit separate MOVE_TOPIC operations for these — they happen automatically as part of the merge.
Fields:
  - op: "MERGE_TOPICS"
  - source_id: Stable ID of the topic being absorbed
  - target_id: Stable ID of the surviving topic (must differ from source_id)
  - merged_title: the title the surviving topic should have after the merge
  - merged_description: the description the surviving topic should have after the merge
  - merged_intent_fingerprint: REQUIRED. The intent fingerprint the surviving topic should carry after the merge. The merged topic's intent should be a clean expression of the consolidated compound intent.
  - reason: plain-English audit reason (non-empty). For consolidation MERGE_TOPICS, the reason should explicitly cite the intent-equivalence convergence detected on this canvas-wide scan.
  - justify_restructure: required if EITHER source's or target's stability_score >= 7.0

SPLIT_TOPIC — Divide a topic into two or more new topics. (Allowed in consolidation mode — the new topics are created as part of restructuring an existing topic, not introduced out of thin air.)
Fields:
  - op: "SPLIT_TOPIC"
  - source_id: Stable ID of the topic being split
  - into: array of objects, each {id (alias), title, description, intent_fingerprint, keyword_ids (array of keyword UUIDs)} — at least two entries required
    - Each entry's `intent_fingerprint` is REQUIRED — every new topic created by a split needs its own fingerprint, since the split is justified by distinct compound intents being separated.
  - reason: plain-English audit reason (non-empty). For consolidation SPLIT_TOPIC driven by intent-equivalence violation, explicitly cite the violation and identify the distinct compound intents being separated.
  - justify_restructure: required if source's stability_score >= 7.0
Constraints:
  - The source topic MUST have NO child topics. If it has children, MOVE_TOPIC them to a new parent FIRST (earlier in this batch's operation list).
  - Every keyword currently at the source must be assigned to exactly one of the new topics (via keyword_ids on each "into" entry). Every UUID listed must currently be at the source. No keyword may appear in more than one "into" entry.
  - Each new topic inherits the source's parent and relationship.

DELETE_TOPIC — Remove a topic.
Fields:
  - op: "DELETE_TOPIC"
  - id: Stable ID
  - reason: plain-English audit reason (non-empty)
  - reassign_keywords_to: Stable ID of another topic, OR the literal string "ARCHIVE" (uppercase, exactly).
    - If a topic ref: every keyword at this topic that isn't already at the destination is moved to the destination (preserving its placement).
    - If "ARCHIVE": every keyword at this topic that has NO OTHER placement on the canvas is archived (flows to the Removed Keywords table); keywords that are placed elsewhere keep those other placements.
  - justify_restructure: required if topic's stability_score >= 7.0
Constraints:
  - The topic MUST have NO child topics. If it has children, MOVE_TOPIC them to a new parent FIRST (earlier in this batch's operation list).


KEYWORD OPERATIONS (allowed in consolidation mode)

MOVE_KEYWORD — Move a keyword's placement from one topic to another.
Fields:
  - op: "MOVE_KEYWORD"
  - keyword_id: keyword UUID
  - from: Stable ID of the source topic
  - to: Stable ID of the destination topic (must differ from "from")
  - placement: "primary" or "secondary"
Constraint: the keyword must currently be at "from" and must NOT already be at "to".

REMOVE_KEYWORD — Un-place a keyword from one specific topic.
Fields:
  - op: "REMOVE_KEYWORD"
  - keyword_id: keyword UUID
  - from: Stable ID
Constraint: legal ONLY if the keyword has at least one OTHER placement on the canvas. If the keyword has only this placement, you MUST use ARCHIVE_KEYWORD instead — keywords cannot be left unplaced.

ARCHIVE_KEYWORD — Mark a keyword as irrelevant. Removes ALL placements (primary and all secondary) of this keyword across the canvas and flags it for the Removed Keywords table.
Fields:
  - op: "ARCHIVE_KEYWORD"
  - keyword_id: keyword UUID
  - reason: plain-English explanation of why the keyword is irrelevant (non-empty; e.g., "homograph: 'bursa' references the Turkish city, not bursitis")


CROSS-CUTTING RULES

ATOMIC BATCH APPLY. Your operation list is applied as ONE atomic unit. If any single operation fails validation (an invalid reference, a missing required field, a constraint violation, a JUSTIFY_RESTRUCTURE missing on a high-stability target, an ADD_TOPIC or ADD_KEYWORD that violates the consolidation-mode restriction, etc.), the entire batch is rejected and the canvas stays in its pre-batch state. There is no partial-apply mode.

SEQUENTIAL ORDER MATTERS. Operations are applied in the order you emit them. References to aliases (from SPLIT_TOPIC `into[]` entries) and to dependent state (e.g., MOVE_TOPIC of children before SPLIT_TOPIC of the parent, MOVE_TOPIC of children before DELETE_TOPIC of the parent) must always come AFTER the prerequisite operation.

NEW-TOPIC ALIASES INSIDE SPLIT_TOPIC ($new1, $new2, ...). When SPLIT_TOPIC creates new topics via its `into[]` array, each entry's `id` is an alias starting with "$" (e.g., "$new1", "$new2"). Aliases are batch-scoped only — they do not persist past this batch. The "$" prefix is reserved syntax: no real Stable ID starts with "$". The applier assigns the real "t-N" Stable ID at apply time and reports the assignment back to the tool. Aliases must be unique within your batch — do not reuse "$new1" twice. Choose alias numbers in any order; only uniqueness matters.

KEYWORDS BY UUID, NOT TEXT. Every operation that references a keyword uses the keyword's UUID (from the input's Keywords column, the part before the "|"). Whitespace, smart quotes, case, and unicode in keyword text create silent text-matching failures; UUIDs do not.

REASONS ON STRUCTURAL OPERATIONS. MOVE_TOPIC, MERGE_TOPICS, SPLIT_TOPIC, DELETE_TOPIC, and ARCHIVE_KEYWORD all require a non-empty plain-English reason field. The reason is the audit-log entry — admin reviews these during human-in-loop review. UPDATE_TOPIC_TITLE, UPDATE_TOPIC_DESCRIPTION, MOVE_KEYWORD, and REMOVE_KEYWORD do NOT require a reason (they are descriptive only).

INTENT FINGERPRINT — REQUIRED on UPDATE_TOPIC_TITLE, MERGE_TOPICS (as `merged_intent_fingerprint`), and on each SPLIT_TOPIC `into[]` entry. OPTIONAL on UPDATE_TOPIC_DESCRIPTION (omit unless the description rewrite has shifted compound intent). Format: short canonical phrase, 5–15 words, in searcher-centric language, capturing the topic's compound intent — audience + situation + goal. Same voice as a good searcher-centric title. Example: "Older bursitis sufferers seeking gentle, low-cost home relief." The fingerprint is the load-bearing field for cross-canvas intent-equivalence detection when the topic later gets compressed to Tier 1 in a per-batch run.

JUSTIFY_RESTRUCTURE — required when an operation targets a topic with stability_score >= 7.0. Applies to: UPDATE_TOPIC_TITLE, MOVE_TOPIC, MERGE_TOPICS (when EITHER source or target is at threshold), SPLIT_TOPIC, DELETE_TOPIC. Does NOT apply to: UPDATE_TOPIC_DESCRIPTION, MOVE_KEYWORD, REMOVE_KEYWORD, ARCHIVE_KEYWORD.

When the gate fires, the operation includes a "justify_restructure" object with these six fields:

  "justify_restructure": {
    "topic_affected": "<topic title and stable ID>",
    "prior_state": "<name, parent, depth — what the topic looked like before>",
    "new_state": "<name, parent, depth — what the topic looks like after>",
    "score": "<the topic's current stability score>",
    "reason": "<explicit, non-generic justification — what specifically warrants this change despite the high score>",
    "expected_quality_improvement": "<what admin should see as better after this change>"
  }

A generic reason ("better fit," "improved structure") is NOT acceptable — admin reads these payloads carefully and rejects vague ones. Be specific about what evidence from the canvas-wide scan justifies modifying a well-validated topic.

Note: an operation's top-level "reason" field (the audit log) and the "reason" field inside "justify_restructure" (the high-stability justification) are separate. When both apply, both must be present and may differ in detail.


GENERAL CONSTRAINTS

1. Every keyword has exactly ONE primary placement [p] across the canvas at any time. It may have zero or more secondary placements [s]. Consolidation MOVE_KEYWORD operations preserve this invariant by moving an existing placement, not by adding a new one.

2. Keywords cannot be left unplaced. If you intend to remove a keyword's only placement, use ARCHIVE_KEYWORD (which removes ALL placements and archives the keyword). Use REMOVE_KEYWORD only when the keyword still has another placement.

3. Existing topics that should be removed are deleted via DELETE_TOPIC with reassign_keywords_to set to either another topic OR the literal "ARCHIVE". There is no "leave the topic for manual review" half-state.

4. DELETE_TOPIC and SPLIT_TOPIC require the source topic to have NO child topics. If the topic has children, MOVE_TOPIC them to a new parent FIRST (earlier in your operation list).

5. MERGE_TOPICS automatically re-parents source's children under target. Do NOT emit separate MOVE_TOPIC operations for these.

6. Empty topics are valid (and may be deliberate narrative scaffolding). Do not delete an empty topic just because it has no keywords — assess whether it serves a structural / narrative-bridging role first.

7. Topic titles must use searcher-centric language — phrased as the condition sufferer would naturally think, ask, or respond to.

8. Stable IDs are emitted verbatim. If you reference t-42, type "t-42" exactly — no extra whitespace, no quotation, no aliases.

9. Stability scores are read-only metadata. Do not emit operations that change a stability score directly; the tool computes scores from operations and admin's review actions.

10. Conversion Path is read-only. The applier preserves a topic's Conversion Path. If you believe a topic genuinely belongs in a different funnel, note it in your operation's reason field for admin review; do not silently change it.

11. Parent-cycles are forbidden. MOVE_TOPIC's new_parent cannot be a descendant of the moved topic. Walk the new parent's parent chain mentally before emitting; if it reaches the moved topic, the move is illegal.

12. ADD_TOPIC and ADD_KEYWORD are FORBIDDEN. Emitting either fails the entire batch atomically with the error `<OPERATION> is not allowed in consolidation mode`. Use SPLIT_TOPIC for restructuring-driven topic introduction; consolidation does not introduce new keyword placements.


OUTPUT RECAP

Your output is exactly one delimited block:

=== OPERATIONS ===
<one JSON operation per line; or empty if no consolidation operations are warranted>
=== END OPERATIONS ===

No markdown fences. No commentary outside the block. The audit reasoning lives in each operation's "reason" field (and "justify_restructure" payload when applicable). Anything not mentioned by an operation stays exactly where it was. An empty operation list is valid output and the expected outcome on a well-maintained canvas.
```

---

END OF DOCUMENT
