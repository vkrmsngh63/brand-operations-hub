# Auto-Analyze V3 Prompts — Operation-Based Output Contract

**Last updated:** 2026-04-25 (Pivot Session C — first version of the operation-based prompts; replaces the V2 full-table-rewrite contract per `docs/PIVOT_DESIGN.md`)
**Last updated in session:** session_2026-04-25_phase1g-test-followup-part3-pivot-session-C (Claude Code)

**Purpose:** The two text prompts used by the Keyword Clustering tool's Auto-Analyze feature, rewritten for the architectural pivot from "AI as state-rebuilder" to "AI as state-mutator" per `docs/PIVOT_DESIGN.md`. Under V3, the AI receives the existing canvas as input and emits a list of change operations against it (defined by the vocabulary in `src/lib/operation-applier.ts`). It no longer re-emits the entire Topics Layout Table on every batch.

**Why a new V3 file (not an in-place edit of V2):** V2 is the historical record of what was actually pasted into the production UI through every Bursitis run including the most recent Session 3b verification. Preserving V2 lets us cite "behaviour X happened on V2 prompts" in any future post-mortem. V3 is the new canonical the director re-pastes after Pivot Session C; legacy V2 stays untouched as historical reference until a future cleanup session archives it.

**Predecessor file:** `docs/AUTO_ANALYZE_PROMPT_V2.md` (last canonical 2026-04-18; remains intact as historical reference).

**Canonical operation vocabulary:** `src/lib/operation-applier.ts` `Operation` discriminated union. The prompts below MUST match that vocabulary exactly. If the prompts and the applier ever drift, the applier wins (per `HANDOFF_PROTOCOL.md` Rule 3).

---

## How these prompts are used

The Auto-Analyze panel in the Keyword Clustering tool (at `/projects/[projectId]/keyword-clustering` on vklf.com) has two large text inputs:

- **Initial Prompt** — the first prompt below. Defines the clustering task: context, workflow, placement decision framework, reevaluation triggers, output expectations.
- **Topics Layout Table Primer** — the second prompt below. Defines the input table format, the operation vocabulary the AI emits, the operation syntax, and the cross-cutting rules.

Before starting a run, the director pastes each prompt into its corresponding text input in the panel. The tool then interpolates three placeholder values at runtime:

- `[PRIMARY_SEED_WORDS]` — filled with the seed word(s) the user enters (e.g., `bursitis`).
- `[VOLUME_THRESHOLD]` — filled with the volume threshold the user sets.
- `[condition]` — a generic niche-name placeholder used inside examples only. Not runtime-replaced — it stays as-is in the prompt to show the model the shape of example titles.

At runtime, the tool also serializes the current canvas state as TSV input (described in the Primer) and includes it in the model's context.

---

## How to update these prompts

1. Edit this file directly with the new version.
2. Commit the change with a message describing what changed (e.g., `"AA V3 prompts: tighten Step 7 conversion-stage ordering"`).
3. Remember that changing this file does NOT automatically update what's pasted in the browser UI. After editing, the director must re-paste the new version into the Auto-Analyze panel before the next run.

If the operation vocabulary in `src/lib/operation-applier.ts` changes (new operation, renamed field, dropped operation), update both the applier and these prompts in the same session — they are a contract pair.

---

## 1. Initial Prompt V3

```
Context: We are brand owners and manufacturers of products that are perfectly suited for specific health niches. Our main aim is to use keyword data to develop and market these products perfectly matched to the niche and to have CTRs for google ads and ebay listings, amazon listings, Walmart.com listings, etsy listings and google shopping listings that far surpass industry standards and far surpasses averages for competitors within that specific niche. We do this by using the keyword data to first understand the consumer's and the caretaker's demand on such a granular level that our product development, its narratives, our content, our marketing and our post sales support cater directly to those needs, worries/concerns of those people in a way that they find highly intriguing, highly engaging and highly compelling so that they quickly engage with us because our product and our content is hyper-relevant to their immediate needs/concerns/goals and deeply engaging, sticky and emotionally provocative, builds momentum towards a planned narrative that inevitably leads them to convert into highly eager buyers that are convinced our product is unique, better than anything else in the market for that niche and sure to resolve not only their problem but also their concerns which have been built up to a feverish pitch through our planned narratives.

All of this starts with analyzing the keywords data and uncovering all the possible intents of the searcher, including both their explicit and implicit intents, while also uncovering all the emotional driving factors that led the searcher to use that specific search term so that we can customize our product (in addition to carrying out conventional research and development) to that specific intent and emotional driving factors (by leveraging them towards amplifying those emotional responses such as concerns, hopes, etc) to lead to deeper content engagement, further micro-actions such as clicking on links to read further or reading the next piece of content, etc and to eventually lead to macro-actions such as signing up for the email newsletter and placing an immediate order with eagerness and surety.

To that end, the first step after we generate a list of search terms using the specific seed words representing the health condition our product does/will target is to do the following:

- Analyze each keyword on its own to uncover what the searcher's intent is. That means uncovering what situation they are in, what are their explicit and implicit concerns/worries, what are their explicit and implicit goals and to state all of these things in a way such that when all these descriptions are put into a common repository (such as a table), the next step becomes easier.

- To group all the search terms into common intent clusters and organizing the intent clusters relative to each other to develop highly effective conversion funnels where the content weaves through those intent clusters using a well planned narrative that builds intrigue, engagement, emotional, logical and micro-action based momentum and eventually and inevitably leads to a highly eager, emotionally satisfying sale perfectly primed to have the customer know that the product will work and to leave a positive feedback on the platform where they purchased the product.

- To flesh out this conversion funnel with specific topics and topic descriptions (representing the search intents and search terms) by developing intra-topic and inter-topic narratives that layout a clear and predictive emotional and logical narrative path from where the searcher is in their mind (with their motives, concerns, etc) to the ultimate goal - a macro-conversion event - an eager and satisfying sale of our product. This process will also involve creating sub-topics and other topics not yet present in the conversion funnel so that the narrative from one major topic to another (further down the conversion funnel) or from one sub-topic to another that is below it in the conversion funnel (within a major topic's discussion) is smooth and will predictably lead the searcher to stay engage, build onto the emotional and action-based momentum and compel them to move further down the conversion funnel by assimilating and acknowledging the narrative and the facts that it delivers and also agreeing with its propositions, conclusions and suggestions (often to read the next part of the content or click on a link to read further or to signup for an email news letter or to purchase the product).

- It is after this conversion funnel with all its topics, sub-topics (and their descriptions) representing all the intents, worries/concerns, motivations, goals, etc are connected with highly effective, well thought out narratives, that we can then allow it to influence our research and development so that the product itself can reinforce the planned narratives in the conversion funnel. Once the product development has been completed with this conversion funnel with the topics, sub-topics and narratives in mind, we can then feed the product's actual philosophy, mode of actions, clinical support back into the planned conversion funnel and refine it into the final conversion funnel that represents a line of reasoning that is not only in-line with the searcher's intents, worries/concerns, motives, etc but also in line with the product's actual philosophy, mode of actions and clinical support.

- Once all this is done, a master conversion funnel document can be produced that will layout the entire conversion funnel's content that goes through all the topics, sub-topics answering to all the intents of all the search terms.

- Once this master conversion funnel document is produced, it can be used as a guide to build out a precise content strategy for each search term because we will now know how to lead that specific searcher's intent towards all the downstream conversion funnel topics and sub-topics without any upstream topics/sub-topics adding unnecessary, distracting bulk to the discussion.

Topic Naming — Searcher-Centric Language:
Every topic title in the conversion funnel must be written in language that a condition sufferer would naturally use, respond to, and find engaging. The conversion funnel is not an internal utility document — it is a direct blueprint for the narrative that the sufferer will experience. Topic titles should mirror the thoughts, questions, and concerns that are already running through the sufferer's mind.

Guidelines for topic naming:
(a) Use natural questions and concerns as topic titles. Instead of "[Condition] demographics", use "Who gets [condition]?" or "Who does [condition] affect?". Instead of "[Condition] etiology", use "What causes [condition]?". Instead of "[Condition] by anatomical location", use "Where does [condition] hurt?".
(b) Use the vocabulary of the sufferer, not the clinician. Prefer "pain that won't go away" over "chronic [condition]", "treatments you can try at home" over "conservative management options", "when to see a doctor" over "clinical referral thresholds". The sufferer should feel the funnel is speaking their language.
(c) Topic titles for demographic or facet-based sub-topics should frame the facet as the sufferer experiences it. Instead of "[Condition] in females", use "[Condition] in women" or "How [condition] affects women differently". Instead of "Age-related [condition]", use "[Condition] as you get older" or "Why [condition] gets worse with age".
(d) Organizational parent topics (empty narrative-bridging topics that exist to structure the hierarchy) must still use engaging, sufferer-centric language. They serve as the headlines and chapter titles of the narrative — they must catch attention and signal relevance, not read like database categories.
(e) When naming a topic, always ask: "If a sufferer saw this as a heading on a page, would they feel compelled to read on?" If the answer is no, rephrase.


Where we currently are in the workflow:

We have a table (which we refer to as the 'Normal Keywords Extended Table') that has thousands of keywords and data associated with those keywords (such as search term volume). In this table, the 'Keyword' column has the individual search terms and among the many columns, there is also a column for 'Topics' in which we are supposed to list the individual search term intents that represent the worries/concerns, motives, goals, etc of the searchers that used that specific search term. We refer to this data as 'Topics' because, as you saw in the context laid out above, these 'Topics' then guide us towards creating narratives, identifying other narrative-supporting topics and sub-topics and towards developing fully fleshed out, well thought out conversion funnel paths that lead to our desired micro-goals (such as reading the next piece of content on the same page or clicking on a link to read the next part of the content further down the conversion path) and eventually lead to our desired macro-goals (signing up for an email newsletter or making an eager, emotionally satisfying sale).

We also have another table we refer to as the 'Topics Layout Table' which we use to present the conversion funnel. Unlike the keyword-centric Normal Keywords Extended Table, the Topics Layout Table is topics-centric: it lays out topics and sub-topics in a relational, hierarchical structure representing the narrative-driven conversion path, with the top of the funnel being generic awareness topics and the bottom being the searcher's commitment to a specific solution (and ultimately a sale of our product).

You receive the current state of the Topics Layout Table as TSV input every batch. **You DO NOT re-emit this table on output.** Instead, you analyze a batch of new keywords against the existing canvas and emit a list of change operations that the tool applies deterministically to the canvas. The operations are defined in the Topics Layout Table Primer (provided below).

This operation-based contract has one structural property that is critical to grasp: **anything you do not mention in your operation list stays exactly where it was.** Existing topics, descriptions, parent-child relationships, sister links, stability scores, and keyword placements are preserved by default. You change only what you mean to change, by emitting an operation that names what changes. Silence is preservation.

This is different from prior versions of the workflow where you re-emitted the entire Topics Layout Table on every batch. That contract caused keywords to silently disappear, made cost scale with canvas size rather than batch size, and made wall-clock time grow as the canvas grew. Under the operation-based contract, those failure modes are structurally impossible.


At the current stage of our workflow, we have a batch of selected search terms from the 'Normal Keywords Extended Table' and we want you to do the following:

1. Analyze each selected search term to identify its core intent and qualifying facets (per the Keyword Placement Decision Framework below). For each keyword, decide its primary topic and any meaningful secondary topic placements.

2. Decide what changes the existing Topics Layout Table needs to accommodate this batch:
   - Are new topics needed (because no existing topic captures the keyword's core intent or a meaningful facet)?
   - Are existing topics' titles or descriptions wrong, given what these new keywords reveal?
   - Should existing topics be merged, split, moved, or deleted (with re-assignment of their keywords)?
   - Are sister-link relationships between topics changing?
   - Are any keywords irrelevant to the niche and should be archived?

3. Run the Post-Batch Funnel Reevaluation Pass (defined further below) to scan for structural improvements warranted by what this batch revealed.

4. Express every change you decided on as one or more operations from the vocabulary in the Topics Layout Table Primer. Emit the operations in the exact JSON-line syntax the Primer specifies.

5. Do not emit operations for things that are not changing. Existing topics whose titles, parents, descriptions, sister-links, and keyword placements are unchanged should not appear in your output. The applier preserves them automatically.


Keyword Placement Decision Framework — Primary and Secondary Topic Placement:

MULTI-PLACEMENT IS A FEATURE, NOT A COMPROMISE.

When a keyword's intent genuinely spans multiple topics — for example, "bursitis pain in older women" belongs under "bursitis pain" (symptom focus) AND "bursitis in women" (gender facet) AND "bursitis in older people" (age-group facet) — the keyword SHOULD be placed under all three topics: one primary ([p]) and two secondary ([s]) placements.

Multi-placement is NOT:
- A way to hedge when you cannot decide between two topics (pick the more specific one as primary; use secondary only if the other topic represents a meaningfully distinct facet);
- A way to add the keyword everywhere it might fit (each secondary placement must pass the "meaningfully different therapeutic consideration, content angle, or product positioning" test in Step 4);
- Duplication for safety (each placement must be structurally justified).

Multi-placement IS:
- The correct representation for a keyword whose intent has multiple meaningful facets, each of which warrants dedicated content, strategy, or product positioning downstream;
- A signal to downstream workflows (content development, conversion funnel design, etc.) that this keyword is relevant across multiple narrative branches.

Aim for comprehensiveness in multi-placement per Step 4b.


Every keyword must be placed into exactly one PRIMARY topic and zero or more SECONDARY topics. This dual-placement system ensures that every meaningful facet of a keyword is captured structurally in the funnel — not merely noted in a description — so that downstream therapeutic strategy, content development, and landing page creation can draw on the full analytical depth of every relevant topic branch.

DEFINITIONS:
- Primary topic: The most specific, intent-accurate topic for this keyword. This is where the keyword's core information need lives and where the most directly relevant content would be written. In operations, primary placements use placement="primary".
- Secondary topic: A topic representing a meaningful facet, demographic angle, or cross-cutting theme that this keyword also belongs to. Secondary topics capture dimensions of the searcher's identity, situation, or concern that influence what content should say and how the product should be positioned, even though the searcher is not independently seeking content focused solely on that facet. In operations, secondary placements use placement="secondary".

PLACEMENT PROCESS — For each keyword, follow these steps:

Step 1 — Identify the Core Intent:
Ask: "What does this searcher want to learn, solve, or do?" Strip away all demographic, situational, temporal, and severity qualifiers. The answer is the candidate for the primary topic. For example, for "[condition] [body location] [symptom] in [age] year old [gender]" — the core intent is learning about that specific condition's symptoms at that body location.

Step 2 — Create or Identify the Primary Topic:
The primary topic should be the most specific existing topic that matches the core intent. If no sufficiently specific topic exists, create one. The primary topic must be specific enough that semantically and thematically similar keywords naturally cluster together. Keywords should only share a primary topic if they would be well-served by the same page of content.

CRITICAL: If the keyword contains a facet that meaningfully changes what content should say (e.g., a gender, age group, or severity qualifier), the primary topic should reflect that specificity. Do not place "female [condition] [body location] symptoms" into a generic "[Condition] [body location] symptoms" topic — create a nested sub-topic like "[Condition] [body location] symptoms in women" and make that the primary topic. The parent topic "[Condition] [body location] symptoms" remains in the hierarchy as a broader organizational node.

TIE-BREAKER RULE — When uncertain between placing a keyword in an existing topic versus creating a new one, DEFAULT TO THE EXISTING TOPIC. Apply this test: "Would content written for the existing topic substantively serve this keyword's intent, even if a slightly more specific new topic could serve it marginally better?" If yes, place the keyword in the existing topic with primary placement. Reserve new-topic creation for keywords whose intent is meaningfully distinct — not just nominally different.

A marginal improvement in topic specificity does NOT justify a new topic. A meaningful improvement — one that would change what content says, how the searcher is addressed, or which conversion-funnel stage the topic belongs in — does.

If you do create a new topic despite this tie-breaker, briefly note in the ADD_TOPIC operation's description (or in the reason field of any structural operation that follows) why the existing topic(s) were insufficient. This surfaces close-call decisions for admin review.

Step 3 — Identify Qualifying Facets:
List every facet in the keyword that describes the searcher's identity or circumstances: demographic qualifiers (age, gender, ethnicity), situational qualifiers (occupation, activity, lifestyle), temporal qualifiers (acute, chronic, duration, post-surgical), severity qualifiers (mild, severe, recurring), and any other contextual modifier. Qualifying facets do NOT include the core intent (that's the primary topic's focus and is counted separately as the primary placement).

Step 4 — Create Secondary Placements for Meaningful Facets:
For each qualifying facet, ask: "Does this facet create a meaningfully different therapeutic consideration, content angle, or product positioning need?" If yes, the keyword gets a secondary placement under a topic dedicated to that facet.

Secondary placements require complete topic hierarchies. For each facet-based secondary placement:
(a) Identify or create the cross-cutting organizational topic for that facet dimension. Use searcher-centric language for the topic title (e.g., "Who does [condition] affect?" rather than "[Condition] demographics").
(b) Create the facet-specific topic nested under it (e.g., "How [condition] affects women differently" nested under "Who does [condition] affect?").
(c) Ensure the full chain of parent topics exists back to a root-level topic. If any intermediate topics are missing, ADD_TOPIC them as empty narrative-bridging topics.
(d) ADD_KEYWORD the keyword under the most specific facet topic with placement="secondary".

Step 4b — Comprehensiveness Verification (MANDATORY per-keyword self-check):

Before moving to Step 5, perform an explicit verification for each keyword you just analyzed:

(i) How many distinct QUALIFYING FACETS did you identify in this keyword? Qualifying facets are demographic, situational, temporal, severity, and contextual modifiers — NOT the core intent. The core intent is the primary topic's focus and is counted separately as the primary placement.

(ii) How many total topic placements does this keyword have in your output? Count 1 primary + N secondary placements.

(iii) The correct total is: (1 primary for the core intent) + (1 secondary per qualifying facet) = 1 + N(facets). If your total in (ii) is less than 1 + (i), you have SKIPPED FACETS. For each skipped facet, EITHER:
- Add the missing secondary placement with full upstream chain (one ADD_KEYWORD operation, plus ADD_TOPIC operations for any missing intermediate topics), OR
- Explicitly justify why this facet does NOT warrant a secondary placement (e.g., the facet is a stopword, is redundant with the primary topic's focus, or is too niche for cross-cutting topic creation). The justification lives in the ADD_KEYWORD operation's surrounding context — admin reviews the operation list as a whole.

(iv) For each secondary placement, verify the full upstream chain exists from the facet-specific sub-topic up to a root-level topic. Missing intermediate topics must be created as empty narrative-bridging topics via ADD_TOPIC.

COMPREHENSIVENESS PRINCIPLE — A keyword that carries N qualifying facets should generate 1 primary placement (for the core intent) and up to N secondary placements (one per facet), each with its own complete upstream chain. Under-placement (omitting secondary placements to save output length) degrades the funnel's structural integrity and is a worse failure mode than over-placement.

Worked example for keyword "bursitis pain in older women":
- Core intent (primary placement): "Bursitis pain"
- Qualifying facets identified: [older-age, gender-women] → (i) = 2
- Secondary placements: "How bursitis affects older people" + "How bursitis affects women differently" → 2 secondary
- Total placements: 1 primary + 2 secondary = 3 → (ii) = 3
- Check: 1 + (i) = 1 + 2 = 3. (ii) = 3. Match. No facets skipped.
- Upstream chain verified for each secondary placement.

Step 5 — Build Complete Upstream Chains:
For both the primary and every secondary placement, verify that a complete chain of parent topics exists from the keyword's topic all the way to a root-level topic. If any intermediate topics are missing, create them via ADD_TOPIC. These intermediate topics may be empty (no keywords assigned) — they serve as narrative scaffolding that ensures the conversion funnel has a logical, step-by-step flow from the most general awareness down to the most specific concern.

Topic roles:
- Keyword-holding topics: Have keywords directly assigned. These represent specific searcher intents.
- Narrative-bridging topics: Empty of keywords. They exist to connect topics in the hierarchy and provide chapter structure for the narrative flow. They must still have descriptive titles (in searcher-centric language) and topic descriptions.
- Cross-cutting topics: Capture a facet theme across multiple branches of the funnel. Connected to location-specific or condition-specific topics via ADD_SISTER_LINK operations.

Step 6 — Volume-Aware Topic Granularity:
The user has specified a volume threshold of [VOLUME_THRESHOLD]. Apply these rules:

(a) Any keyword with search volume at or above [VOLUME_THRESHOLD] ALWAYS gets its own dedicated sub-topic as its primary placement if its facets or specificity meaningfully distinguish it from sibling keywords. Never absorb a high-volume keyword into a generic parent topic when a more specific sub-topic would serve it better.

(b) A cluster of keywords that share a facet and whose COMBINED search volume meets or exceeds [VOLUME_THRESHOLD] warrants a dedicated sub-topic for that facet, even if each individual keyword's volume is below the threshold. After placing all keywords in the batch, scan for such clusters across BOTH (i) the keywords just placed in the current batch AND (ii) keywords already placed in the Topics Layout Table from prior batches. If a qualifying cluster spans current-batch and prior-canvas keywords, ADD_TOPIC a new dedicated sub-topic for that facet, MOVE_KEYWORD the prior-canvas keywords' primary placements to the new sub-topic, and reflect the reassignment via the operations themselves. Respect stability-score friction (Step 6b): if a prior-canvas keyword's current primary topic has stability_score >= 7.0, the surrounding structural operation must include a JUSTIFY_RESTRUCTURE payload explaining why the new sub-topic is a clearly superior home.

(c) In small niches (where the total keyword count is low), the effective threshold should be applied more liberally — the goal is to capture as many distinct audience segments as the data supports, because each unique keyword represents a scarce opportunity to reach a specific searcher.

(d) The volume threshold is a floor for guaranteed topic creation, not a ceiling. If a facet creates a meaningfully different therapeutic or content consideration, a dedicated topic is warranted regardless of volume.

Step 6b — Respecting Stability Scores (MANDATORY):

Each topic in the Topics Layout Table carries a stability_score from 0.0 to 10.0 in the Stability Score column of the input TSV (see the Topics Layout Table Primer). This score reflects how well-validated the topic is — through admin approvals, cross-batch consistency, keyword-placement stability, and related signals.

Score interpretation:

- Score >= 7.0 — Topic is well-validated. DO NOT modify its name, parent relationship, or conversion-funnel-stage assignment unless you have a compelling structural reason. If you must modify, you MUST emit a JUSTIFY_RESTRUCTURE payload alongside the operation that does so. The payload's six fields are defined in the Primer's CROSS-CUTTING RULES section.

- Score 4.0 - 6.9 — Topic is established but not locked. Modify only when the improvement is clearly meaningful, not marginal. The reason field on each structural operation is sufficient documentation; no JUSTIFY_RESTRUCTURE required.

- Score < 4.0 — Topic is open to restructuring based on new evidence. Apply normal Reevaluation Pass thresholds.

- Score not provided or 0.0 — Treat as fully open. This is the default for newly-created topics.

RATIONALE: High-score topics represent admin's accumulated prior approvals. Modifying them without justification wastes admin's prior decisions and causes downstream churn. A friction gradient — higher bar for higher-score items — balances the need to improve the tree with the need to respect established structure.

JUSTIFY_RESTRUCTURE applies to: UPDATE_TOPIC_TITLE, MOVE_TOPIC, MERGE_TOPICS (when EITHER source or target is at threshold), SPLIT_TOPIC, DELETE_TOPIC. It does NOT apply to UPDATE_TOPIC_DESCRIPTION (descriptive-only edits are safe even on stable topics) or to the additive keyword-placement operations (ADD_KEYWORD, MOVE_KEYWORD, REMOVE_KEYWORD, ARCHIVE_KEYWORD, ADD_SISTER_LINK, REMOVE_SISTER_LINK).

Adding keywords or descriptive detail to a high-score topic does NOT require JUSTIFY_RESTRUCTURE. Only structural changes do.

Step 7 — Conversion Funnel Stage Ordering:
The Topics Layout Table is not just a topical taxonomy — it is a conversion funnel with a deliberate narrative arc. Every topic must be placed at the correct stage in the journey from initial awareness to final conversion. When creating or repositioning topics, apply these ordering principles:

(a) Root-level topics represent distinct stages of the conversion funnel, ordered from awareness to purchase. A typical health niche funnel progresses through stages like: recognizing something is wrong → understanding what the condition is → learning who it affects and why → exploring what can be done → evaluating specific solutions → taking action. Root topics should reflect this natural progression using searcher-centric language (e.g., "Something doesn't feel right", "What is [condition]?", "Who does [condition] affect?", "What can you do about it?", "Finding the right solution", "Taking the next step").

(b) Linear children within each branch must move the narrative forward toward conversion. Each linear topic should represent the next natural thought the searcher would have after absorbing the previous topic. Ask: "After reading about this topic, what would this person want to know next?" That answer is the next linear child.

(c) Nested children represent deeper exploration within the current funnel stage — not jumps to a different stage. A nested topic under "Where does [condition] hurt?" might be "Hip [condition] symptoms" — this is a deeper dive within the same stage (understanding symptoms), not a jump to treatment options. If a topic would naturally come after the parent rather than within it, it should be linear, not nested.

(d) When placing a keyword, consider where the searcher is in their journey. A keyword like "[condition] symptoms" belongs in the awareness/recognition stage. A keyword like "best [treatment] for [condition]" belongs in the solution evaluation stage. A keyword like "buy [product] for [condition]" belongs in the action stage. The topic hierarchy for each keyword must reflect this — the keyword's topic should sit within the correct funnel stage, and its upstream chain should trace back through that stage's root topic.

(e) As new topics are created across batches, the funnel should become more detailed within each stage without breaking the stage progression. New keywords may reveal sub-stages (e.g., within the treatment exploration stage: "treatments you can try at home" → "when home remedies aren't enough" → "professional treatment options"). These should be ordered linearly to maintain the narrative momentum toward conversion.

(f) Cross-cutting topics (created for secondary placements) also follow funnel ordering within their own branch. A branch like "Who does [condition] affect?" → "How [condition] affects women differently" should position its nested sub-topics in a logical narrative order, not just as a flat list of demographics.


Post-Batch Funnel Reevaluation Pass:

After analyzing all keywords in the batch and before emitting your operation list, perform a scoped reevaluation of the funnel structure. The purpose is to ensure the Topics Layout Table improves in overall quality and efficiency as a conversion funnel framework with each batch — not just grows larger. The funnel is a living structure that should get sharper, not merely bigger.

The reevaluation is scoped to branches that this batch directly touched (where new keywords were placed, new topics were created, or signals were flagged during analysis). Do not re-evaluate branches that had no interaction with this batch.

There are seven types of structural changes that may be warranted. Each maps to one or more operations from the Primer's vocabulary. As you analyze keywords, watch for the signals below. When a signal fires AND meets the threshold, emit the corresponding operations.

(1) Facet Promotion → ADD_TOPIC + MOVE_KEYWORD operations.
   Signal: a qualifying facet within an existing branch now has (a) ≥ 2 keywords sharing it, or (b) keywords whose combined search volume meets/exceeds [VOLUME_THRESHOLD], or (c) any single keyword at/above the threshold carrying that facet.
   Action: ADD_TOPIC for the new facet-specific sub-topic (parent = the broader topic, relationship typically nested). For every keyword whose primary placement should now shift to the new topic, MOVE_KEYWORD from old topic to new. Update secondary placements via additional MOVE_KEYWORD or ADD_KEYWORD as needed.

(2) Keyword Reassignment → MOVE_KEYWORD operations.
   Signal: a newly created or pre-existing topic is a clearly superior home for keywords currently in a different topic.
   Action: MOVE_KEYWORD for each affected keyword. Apply this test before moving: "Would content written for the new topic address this keyword's intent more directly and completely than content written for the current topic?" Move only on a clear yes — not a marginal improvement. If the source topic has stability_score >= 7.0 and you are moving keywords AWAY from it (which materially changes its keyword set), accompany the moves with a paired UPDATE_TOPIC_DESCRIPTION on the source if its description should be revised; reassigning keywords away from a high-stability topic does not by itself require JUSTIFY_RESTRUCTURE (the topic's structural identity is unchanged), but if the reassignment materially weakens the source's reason-to-exist, consider whether DELETE_TOPIC or MERGE_TOPICS is the more honest operation.

(3) Topic Splitting → SPLIT_TOPIC operation.
   Signal: an existing topic has accumulated keywords with meaningfully divergent sub-intents that would require substantially different content narratives, and each sub-intent cluster has at least 2 keywords.
   Action: SPLIT_TOPIC. Specify the source topic (by stable ID), the new sibling/nested topics (each with alias, title, description, and the keyword UUIDs going to it), and a plain-English reason. SPLIT_TOPIC requires the source topic to have NO child topics — if it does, MOVE_TOPIC the children FIRST (earlier in the operation list).

(4) Topic Merging → MERGE_TOPICS operation.
   Signal: two existing topics at the same level have converged in intent. Their descriptions substantially overlap; their keywords would be equally well-served by either topic; maintaining both creates fragmentation without narrative distinction.
   Action: MERGE_TOPICS. Specify source and target stable IDs, the merged title and description, and a reason. The applier auto-reparents source's children under target and rewrites source's sister links to target — you do NOT need to emit separate MOVE_TOPIC or sister-link operations for them.

(5) Hierarchy Repositioning → MOVE_TOPIC operation.
   Signal: an existing topic's parent-child placement is suboptimal — wrong parent, wrong depth, or wrong branch given the broader pattern now visible.
   Action: MOVE_TOPIC. Specify the topic's stable ID, the new parent (or null for root), the new relationship (linear/nested), and a reason. The topic's subtree (children, grandchildren, etc.) move with it automatically; you do not need to emit operations for them.

(6) Narrative Flow Refinement → MOVE_TOPIC operation (with same parent, different relationship).
   Signal: a topic's linear-vs-nested classification is wrong — a "nested" topic actually represents a narrative next step (linear), or vice versa.
   Action: MOVE_TOPIC with the same parent but a different relationship value. UPDATE_TOPIC_DESCRIPTION may be paired if the description should reflect the corrected role.

(7) Volume-Based Cluster Promotion → ADD_TOPIC + MOVE_KEYWORD operations.
   Signal: while reviewing the completed placements for the batch, you identify two or more keywords (drawn from current batch and/or prior canvas) within the same facet, where their combined volume meets or exceeds [VOLUME_THRESHOLD]. Scan BOTH (i) branches touched by this batch AND (ii) the entire prior canvas for keywords carrying any facet from this batch.
   Action: ADD_TOPIC for the new dedicated sub-topic; MOVE_KEYWORD for each affected keyword (current-batch and prior-canvas). If any reassigned prior-canvas keyword's current primary topic has stability_score >= 7.0 AND the operation that touches that topic is structural (rename, move, merge, split, delete), include a JUSTIFY_RESTRUCTURE payload on that operation per Step 6b.

Reevaluation Thresholds (apply before emitting any operation):

Facet promotion threshold: A qualifying facet warrants its own sub-topic when (a) at least 2 keywords within the same parent branch share it, or (b) a single keyword with search volume at or above [VOLUME_THRESHOLD] carries that facet, or (c) multiple keywords sharing the facet have a combined volume at or above [VOLUME_THRESHOLD]. Below these thresholds, the facet is captured via secondary placements and topic description notes.

Split threshold: A topic warrants splitting when it contains keywords representing two or more clearly distinguishable sub-intents, each sub-intent cluster has at least 2 keywords, and the sub-intents would require meaningfully different content narratives.

Merge threshold: Two topics warrant merging when their topic descriptions overlap substantially, their keywords would be equally well-served by either topic, and maintaining both creates no meaningful narrative distinction in the funnel.

Reassignment threshold: A keyword's primary placement should be moved from an existing topic to a different topic only when the new topic is a clearly superior fit — not a marginal improvement. If the current placement is adequate even though the new topic is slightly better, leave the keyword where it is.

Reevaluation Constraints:

(a) Topics that should be removed entirely are deleted via DELETE_TOPIC, with reassign_keywords_to set to either another topic ref OR the literal string "ARCHIVE". There is no "leave the topic for manual review" half-state — if you mean to remove the topic, emit DELETE_TOPIC; otherwise, leave it alone. (This replaces the V2 "never delete topics entirely" rule. The new contract gives you a clean, explicit removal path while still requiring a reason and, on high-stability topics, a JUSTIFY_RESTRUCTURE payload.)

(b) DELETE_TOPIC and SPLIT_TOPIC require the source topic to have NO child topics. If the topic has children, MOVE_TOPIC the children to a new parent FIRST, earlier in the operation list.

(c) Only re-evaluate branches that were directly touched by the current batch — meaning branches where new keywords were placed, new topics were created, or signals were flagged during analysis. Do not re-evaluate untouched branches.

(d) Do not change a topic's Conversion Path. The applier preserves Conversion Path from prior state. If you believe a topic genuinely belongs in a different funnel, note it in your operation's reason field for admin review; do not silently move it.

(e) Do not silently rearrange the funnel. Every structural change (MERGE_TOPICS, SPLIT_TOPIC, MOVE_TOPIC, DELETE_TOPIC, UPDATE_TOPIC_TITLE) must carry a non-empty reason field. The reasons collectively are the audit log — there is no separate Reevaluation Report block in your output.


Continuing with New Keyword Batches:

This workflow is iterative. After a batch has been processed, the next batch will be provided automatically along with the post-applied Topics Layout Table as input. When this happens:

(a) The Topics Layout Table you receive is the starting state. All existing topics, keywords, relationships, descriptions, sister-links, and stability scores must be treated as the established funnel structure.

(b) Analyze the new batch following Steps 1–7, using the existing table as context — mapping new keywords to existing topics where appropriate, and creating new topics only when intent genuinely doesn't fit any existing topic.

(c) Output operations only for changes. Do not echo unchanged state.

(d) The Topics Layout Table is cumulative — it grows with each batch. Never propose to "reset" or "rebuild" it.

(e) Between batches, the Topics Layout Table you receive is the ONLY authoritative source of prior state. If your internal working memory contradicts the table, trust the table — it reflects what the tool has applied to the canvas, including admin corrections made during human-in-loop review.


Note a few important things:

- The Topics Layout Table may be empty when we first start analyzing the search terms (i.e., the input TSV contains only the header row). In that case, every keyword's primary placement requires ADD_TOPIC for its primary topic and ADD_TOPIC operations for the full upstream chain to a root. The 'Topics Layout Table Primer' is provided below as part of this prompt — it describes the input table format, the operation vocabulary, the operation syntax, and the cross-cutting rules.

- The primary seed word (which is also the niche health condition we are targeting) for the keywords data is [PRIMARY_SEED_WORDS]. This means this/these seed word(s) will be present in almost all keywords and may not play a big role in figuring out the intent of the searcher except when it appears by itself (in which case it will represent the topmost, most generic intent and topic node).


AUTOMATED PROCESSING CONTEXT:

This analysis is being executed via an automated API pipeline. Your output will be parsed programmatically — not read in a chat interface. Therefore:
- Do NOT produce interactive artifacts, HTML tables, visual mindmaps, or downloadable files.
- Do NOT ask for the next batch of keywords — batch sequencing is handled automatically.
- Do NOT include markdown code fences around your output.
- Do NOT re-emit the Topics Layout Table or any topic, description, keyword placement, or sister link whose state is unchanged. Emit operations only for changes.
- Do NOT emit any text outside the OPERATIONS block. No commentary, no Reevaluation Report, no "here's what I did." The reason field on each structural operation is the audit record.
- Focus on the analytical quality of your placement decisions, the precision of the operations you emit, and your justifications on structural operations.
- Your output MUST contain exactly one delimited block: `=== OPERATIONS ===` ... `=== END OPERATIONS ===`. Each line inside the block is one JSON-formatted operation. The exact operation syntax is in the Topics Layout Table Primer.
- An empty operation list is valid output if the batch genuinely warrants no changes (rare but possible). Emit just the opening and closing delimiters with nothing between them.
```

---

## 2. Topics Layout Table Primer V3

```
CONTEXT: What We Are Doing

We are brand owners developing health products targeted at specific health niches. We use keyword data from search engines to deeply understand the searcher's explicit and implicit intents, emotional drivers, concerns, goals, and motivations. This understanding drives:

1. Product development — so the product itself addresses the real needs uncovered from keyword analysis
2. Conversion funnel creation — a narrative-driven content strategy that leads searchers from initial awareness through to an eager, satisfying purchase
3. Content strategy — hyper-relevant content for Google Ads, Amazon, eBay, Walmart, Etsy, and Google Shopping that achieves click-through rates far above industry averages

Our methodology centers on organizing keyword intents into Topics (representing distinct searcher intents, concerns, or stages) and arranging those Topics into a structured conversion funnel — a narrative path that moves a searcher from broad awareness to confident purchase.


WHAT THE TOPICS LAYOUT TABLE IS

The Topics Layout Table is the structured representation of our conversion funnel. Each row is a topic node; the combination of Stable ID, Parent Stable ID, and Relationship places that node in the hierarchy. Each topic carries a stability score reflecting how well-validated it is, plus its keyword placements and any sister-link relationships to peer topics in other branches.

YOU RECEIVE THE TABLE AS TSV INPUT EVERY BATCH. The tool serializes the current state of the canvas as tab-separated values and includes it in your prompt context. **You DO NOT re-emit this table on output.** Your job is to emit a list of change operations against the table, using the vocabulary defined further below.

Anything you do not mention in your operation list stays exactly where it was. Silence is preservation.


INPUT TABLE COLUMNS

The TSV input has these columns (tab-separated, in this exact order, with the first row as header):

Stable ID — A persistent identifier for each topic, formatted "t-N" (e.g., "t-42"). This is the handle you use to reference topics in your operations. Stable IDs survive renames, parent changes, the surviving target of a merge, and any other modification. They are the only reliable way to address a topic in this system.

Title — The current display title of the topic. Used for human readability; it is NOT the address. To rename a topic, use UPDATE_TOPIC_TITLE referencing the topic's Stable ID — do not match by title.

Description — The topic's current description. Plain text; tabs and newlines have been replaced with spaces in the input.

Parent Stable ID — The Stable ID of the parent topic (e.g., "t-1"). Empty for root topics.

Relationship — How this topic connects to its parent. Values: "linear" (peer-sequence — this topic is the next narrative step from the parent), "nested" (sub-topic — deeper dive within parent's scope). Empty for root topics.

Conversion Path — The name of the conversion funnel this topic belongs to (typically the title of the funnel's root topic). A single canvas can contain multiple conversion paths.

Stability Score — A float from 0.0 to 10.0 reflecting how well-validated this topic is, based on admin approvals, cross-batch consistency, keyword-placement stability, and related signals. See the Initial Prompt's Step 6b for full interpretation. New topics created in this batch are implicitly at 0.0 and the tool tracks them; you do not emit a stability_score field on any operation.

Sister Nodes — Comma-separated list of Stable IDs of topics that are sister-linked to this one (e.g., "t-19, t-23"). Empty if no sister links. Sister links are non-hierarchical sideways connections.

Keywords — Comma-separated list of keyword placements at this topic. Each item is formatted "<keyword_uuid>|<keyword_text> [<placement_marker>]" where placement_marker is "p" (primary) or "s" (secondary). Example: `5e8c-f9-abc|female hip pain symptoms [p], 9d2f-cd-xyz|women joint pain hip [s]`. The keyword_uuid is the only field you reference in operations; the keyword_text is provided for your analytical reasoning and human readability.


INPUT PARSING NOTES

The TSV input is generated deterministically by the tool. You read it; you do not parse-and-re-emit it.

- Stable IDs always begin with "t-".
- Newly-created stable IDs (in your operations) use aliases starting with "$" (e.g., "$new1") — these never appear in input.
- Keywords are referenced in operations exclusively by their UUID, never by their text. Whitespace, smart quotes, case, and unicode in keyword text all create silent text-matching failures; UUIDs do not.
- Empty cells (e.g., empty Sister Nodes) appear as a single empty string between tab delimiters.
- The first row is the header (column names); subsequent rows are data.
- An empty table (header row only, no data rows) means the canvas is empty — every keyword's primary placement requires you to ADD_TOPIC the full chain.


HOW TO READ THE TABLE

The table is ordered roughly top-down in conversion-funnel order. Each row's Parent Stable ID points back to its parent in the same table. Walking from any topic up its parent chain (via Parent Stable ID) reaches a root topic (one whose Parent Stable ID is empty). For example:

  Stable ID  | Title                         | Parent Stable ID | Relationship
  t-1        | Understanding your symptoms   | (empty)          | (empty)         (Root, top of funnel)
  t-2        |   Where does it hurt?         | t-1              | linear          (Linear child, next narrative step)
  t-3        |     Hip pain symptoms         | t-2              | nested          (Nested child, sub-topic)
  t-4        |     Shoulder pain symptoms    | t-2              | nested          (Another nested child)
  t-5        |   What can you do about it?   | t-1              | linear          (Linear child of t-1, next narrative step)

(Stability Score, Conversion Path, Sister Nodes, and Keywords columns omitted from this display example for readability — they are present on every row in the actual TSV.)

Linear relationships represent the forward flow of the conversion funnel — Topic A leads narratively to Topic B.
Nested relationships represent deeper exploration within a parent topic — sub-topics that the reader might explore before moving forward.
Sister links represent parallel peers — topics at the same conceptual level that address similar or overlapping intents from different angles, possibly under different parents.


THE OPERATION VOCABULARY

Your output is a list of operations from the following vocabulary. Operations are applied in the order you emit them. Anything not mentioned in your operations stays exactly where it was — silence is preservation.

OPERATION SYNTAX

Each operation is a single JSON object emitted on its own line. The operation's type goes in an "op" field. All other fields are operation-specific. Wrap your operations in a single delimited block:

=== OPERATIONS ===
{"op": "ADD_TOPIC", "id": "$new1", "title": "Bursitis triggers", "description": "Common situations and activities that bring on bursitis pain", "parent": "t-42", "relationship": "nested"}
{"op": "ADD_KEYWORD", "topic": "$new1", "keyword_id": "5e8c-f9-abc", "placement": "primary"}
{"op": "MOVE_KEYWORD", "keyword_id": "9d2f-cd-xyz", "from": "t-19", "to": "$new1", "placement": "primary"}
=== END OPERATIONS ===

If your operation list is empty (the batch produced no changes — rare but valid), emit:

=== OPERATIONS ===
=== END OPERATIONS ===

KEYS USE snake_case. The exact field names per operation are listed below; emit them verbatim.


TOPIC OPERATIONS

ADD_TOPIC — Create a new topic.
Fields:
  - op: "ADD_TOPIC"
  - id: a new alias starting with "$" (e.g., "$new1") — see Aliases section under CROSS-CUTTING RULES below
  - title: searcher-centric topic title (non-empty)
  - description: full description (plain text, no tabs or newlines)
  - parent: Stable ID of an existing topic, OR an alias from earlier in this batch, OR null (for root topics)
  - relationship: "linear" or "nested" (required for non-root topics; ignored for root)

UPDATE_TOPIC_TITLE — Rename a topic. Nothing else changes.
Fields:
  - op: "UPDATE_TOPIC_TITLE"
  - id: Stable ID or alias of the topic to rename
  - to: new title (non-empty)
  - justify_restructure: required if the topic's stability_score >= 7.0 (see CROSS-CUTTING RULES section below)

UPDATE_TOPIC_DESCRIPTION — Rewrite a topic's description. Title and position unchanged.
Fields:
  - op: "UPDATE_TOPIC_DESCRIPTION"
  - id: Stable ID or alias
  - to: new description
(Description-only edits are safe even on high-stability topics. NO JUSTIFY_RESTRUCTURE required.)

MOVE_TOPIC — Re-parent a topic and its entire subtree.
Fields:
  - op: "MOVE_TOPIC"
  - id: Stable ID or alias
  - new_parent: Stable ID, alias, or null (for becoming a root)
  - new_relationship: "linear" or "nested" (required when new_parent is non-null)
  - reason: plain-English audit reason (non-empty)
  - justify_restructure: required if the moved topic's stability_score >= 7.0
Constraint: the new parent cannot be the topic itself or any descendant of the topic (no parent-cycles).

MERGE_TOPICS — Combine two topics into one. The applier:
  - re-parents source's children under target,
  - rewrites source's sister links to point to target (deduplicating self-links and duplicates),
  - merges keyword placements with target winning on collision,
  - removes source.
Do NOT emit separate MOVE_TOPIC or sister-link operations for these — they happen automatically as part of the merge.
Fields:
  - op: "MERGE_TOPICS"
  - source_id: Stable ID or alias of the topic being absorbed
  - target_id: Stable ID or alias of the surviving topic (must differ from source_id)
  - merged_title: the title the surviving topic should have after the merge
  - merged_description: the description the surviving topic should have after the merge
  - reason: plain-English audit reason (non-empty)
  - justify_restructure: required if EITHER source's or target's stability_score >= 7.0

SPLIT_TOPIC — Divide a topic into two or more new topics.
Fields:
  - op: "SPLIT_TOPIC"
  - source_id: Stable ID or alias of the topic being split
  - into: array of objects, each {id (alias), title, description, keyword_ids (array of keyword UUIDs)} — at least two entries required
  - reason: plain-English audit reason (non-empty)
  - justify_restructure: required if source's stability_score >= 7.0
Constraints:
  - The source topic MUST have NO child topics. If it has children, MOVE_TOPIC them to a new parent FIRST (earlier in this batch's operation list).
  - Every keyword currently at the source must be assigned to exactly one of the new topics (via keyword_ids on each "into" entry). Every UUID listed must currently be at the source. No keyword may appear in more than one "into" entry.
  - Each new topic inherits the source's parent and relationship (the applier handles this — you don't specify them per "into" entry).
  - Sister links pointing to or from the source topic are DROPPED (not transferred to the new topics — there is no canonical mapping for which new topic inherits each link). If you want the new topics to be sister-linked to peers from the source's old links, emit ADD_SISTER_LINK operations explicitly later in the same batch.

DELETE_TOPIC — Remove a topic.
Fields:
  - op: "DELETE_TOPIC"
  - id: Stable ID or alias
  - reason: plain-English audit reason (non-empty)
  - reassign_keywords_to: Stable ID or alias of another topic, OR the literal string "ARCHIVE" (uppercase, exactly).
    - If a topic ref: every keyword at this topic that isn't already at the destination is moved to the destination (preserving its placement).
    - If "ARCHIVE": every keyword at this topic that has NO OTHER placement on the canvas is archived (flows to the Removed Keywords table); keywords that are placed elsewhere keep those other placements.
  - justify_restructure: required if topic's stability_score >= 7.0
Constraints:
  - The topic MUST have NO child topics. If it has children, MOVE_TOPIC them to a new parent FIRST (earlier in this batch's operation list).
  - Sister links touching the deleted topic are removed automatically (the topic no longer exists, so there is nothing to link to). No follow-up REMOVE_SISTER_LINK is needed.


KEYWORD OPERATIONS

ADD_KEYWORD — Place a keyword at a topic.
Fields:
  - op: "ADD_KEYWORD"
  - topic: Stable ID or alias
  - keyword_id: keyword UUID (from the Keywords column of the input TSV — the part before the "|")
  - placement: "primary" or "secondary"
Constraint: the keyword cannot already be placed at this topic.

MOVE_KEYWORD — Move a keyword's placement from one topic to another.
Fields:
  - op: "MOVE_KEYWORD"
  - keyword_id: keyword UUID
  - from: Stable ID or alias of the source topic
  - to: Stable ID or alias of the destination topic (must differ from "from")
  - placement: "primary" or "secondary"
Constraint: the keyword must currently be at "from" and must NOT already be at "to".

REMOVE_KEYWORD — Un-place a keyword from one specific topic.
Fields:
  - op: "REMOVE_KEYWORD"
  - keyword_id: keyword UUID
  - from: Stable ID or alias
Constraint: legal ONLY if the keyword has at least one OTHER placement on the canvas. If the keyword has only this placement, you MUST use ARCHIVE_KEYWORD instead — keywords cannot be left unplaced.

ARCHIVE_KEYWORD — Mark a keyword as irrelevant. Removes ALL placements (primary and all secondary) of this keyword across the canvas and flags it for the Removed Keywords table.
Fields:
  - op: "ARCHIVE_KEYWORD"
  - keyword_id: keyword UUID
  - reason: plain-English explanation of why the keyword is irrelevant (non-empty; e.g., "homograph: 'bursa' references the Turkish city, not bursitis")


SISTER-LINK OPERATIONS

ADD_SISTER_LINK — Create a sideways link between two topics.
Fields:
  - op: "ADD_SISTER_LINK"
  - topic_a: Stable ID or alias
  - topic_b: Stable ID or alias (must differ from topic_a)
Constraint: the link must not already exist (in either direction — sister links are bidirectional and the applier deduplicates on canonicalized order).

REMOVE_SISTER_LINK — Remove an existing sister link.
Fields:
  - op: "REMOVE_SISTER_LINK"
  - topic_a: Stable ID or alias
  - topic_b: Stable ID or alias


CROSS-CUTTING RULES

ATOMIC BATCH APPLY. Your operation list is applied as ONE atomic unit. If any single operation fails validation (an invalid reference, a missing required field, a constraint violation, a JUSTIFY_RESTRUCTURE missing on a high-stability target, etc.), the entire batch is rejected and the canvas stays in its pre-batch state. There is no partial-apply mode. Get the whole list right.

SEQUENTIAL ORDER MATTERS. Operations are applied in the order you emit them. You may ADD_TOPIC $new1 and then ADD_KEYWORD topic=$new1 later in the same batch — as long as $new1 was defined earlier in the list. References to aliases and to dependent state (e.g., MOVE_TOPIC of children before SPLIT_TOPIC of the parent) must always come AFTER the prerequisite operation.

NEW-TOPIC ALIASES ($new1, $new2, ...). When you create a new topic via ADD_TOPIC or SPLIT_TOPIC's "into" entries, you assign it an alias starting with "$" (e.g., "$new1", "$new2"). Aliases are batch-scoped only — they do not persist past this batch. The "$" prefix is reserved syntax: no real Stable ID starts with "$". The applier assigns the real "t-N" Stable ID at apply time and reports the assignment back to the tool. Aliases must be unique within your batch — do not reuse "$new1" twice. Choose alias numbers in any order; only uniqueness matters.

KEYWORDS BY UUID, NOT TEXT. Every operation that references a keyword uses the keyword's UUID (from the input's Keywords column, the part before the "|"). Whitespace, smart quotes, case, and unicode in keyword text create silent text-matching failures; UUIDs do not.

REASONS ON STRUCTURAL OPERATIONS. MOVE_TOPIC, MERGE_TOPICS, SPLIT_TOPIC, DELETE_TOPIC, and ARCHIVE_KEYWORD all require a non-empty plain-English reason field. The reason is the audit-log entry — admin reviews these during human-in-loop review. ADD_TOPIC, UPDATE_TOPIC_TITLE, UPDATE_TOPIC_DESCRIPTION, ADD_KEYWORD, MOVE_KEYWORD, REMOVE_KEYWORD, ADD_SISTER_LINK, REMOVE_SISTER_LINK do NOT require a reason (they are additive or descriptive only).

JUSTIFY_RESTRUCTURE — required when an operation targets a topic with stability_score >= 7.0. Applies to: UPDATE_TOPIC_TITLE, MOVE_TOPIC, MERGE_TOPICS (when EITHER source or target is at threshold), SPLIT_TOPIC, DELETE_TOPIC. Does NOT apply to: UPDATE_TOPIC_DESCRIPTION, ADD_TOPIC (new topics start at 0.0), ADD_KEYWORD, MOVE_KEYWORD, REMOVE_KEYWORD, ARCHIVE_KEYWORD, ADD_SISTER_LINK, REMOVE_SISTER_LINK.

When the gate fires, the operation includes a "justify_restructure" object with these six fields:

  "justify_restructure": {
    "topic_affected": "<topic title and stable ID>",
    "prior_state": "<name, parent, depth — what the topic looked like before>",
    "new_state": "<name, parent, depth — what the topic looks like after>",
    "score": "<the topic's current stability score>",
    "reason": "<explicit, non-generic justification — what specifically warrants this change despite the high score>",
    "expected_quality_improvement": "<what admin should see as better after this change>"
  }

A generic reason ("better fit," "improved structure") is NOT acceptable — admin reads these payloads carefully and rejects vague ones. Be specific about what evidence from this batch's keywords or this batch's facet pattern justifies modifying a well-validated topic.

Note: an operation's top-level "reason" field (the audit log) and the "reason" field inside "justify_restructure" (the high-stability justification) are separate. When both apply, both must be present and may differ in detail.


GENERAL CONSTRAINTS

1. Every keyword has exactly ONE primary placement [p] across the canvas at any time. It may have zero or more secondary placements [s].

2. Keywords cannot be left unplaced. If you intend to remove a keyword's only placement, use ARCHIVE_KEYWORD (which removes ALL placements and archives the keyword). Use REMOVE_KEYWORD only when the keyword still has another placement.

3. Existing topics that should be removed are deleted via DELETE_TOPIC with reassign_keywords_to set to either another topic OR the literal "ARCHIVE". There is no "leave the topic for manual review" half-state. If you mean to remove the topic, emit DELETE_TOPIC; otherwise, leave it alone. (This replaces the V2 "never delete topics entirely" rule.)

4. DELETE_TOPIC and SPLIT_TOPIC require the source topic to have NO child topics. If the topic has children, MOVE_TOPIC them to a new parent FIRST (earlier in your operation list).

5. MERGE_TOPICS automatically re-parents source's children under target and rewrites source's sister links to target. Do NOT emit separate MOVE_TOPIC or sister-link operations for these.

6. Sister links are bidirectional and stored once (not twice). Emit ADD_SISTER_LINK once for any new sister relationship (in either field-order; the applier canonicalizes).

7. Empty topics are valid. Topics with no assigned keywords serve as narrative-bridging or organizational nodes. They must still have searcher-centric titles and topic descriptions.

8. Complete upstream chains are required. Every topic must have a chain of parent topics back to a root (a topic with parent = null). If you place a keyword under a deeply nested new topic, every intermediate topic in the chain must also exist (either already on the canvas or created in this batch via ADD_TOPIC).

9. Topic titles must use searcher-centric language — phrased as the condition sufferer would naturally think, ask, or respond to. See the Initial Prompt's Topic Naming guidelines.

10. Stable IDs are emitted verbatim. If you reference t-42, type "t-42" exactly — no extra whitespace, no quotation, no aliases.

11. Stability scores are read-only metadata. Do not emit operations that change a stability score directly; the tool computes scores from your operations and admin's review actions. New topics created in this batch implicitly start at 0.0.

12. Conversion Path is read-only. The applier preserves a topic's Conversion Path. If you believe a topic genuinely belongs in a different funnel, note it in your operation's reason field for admin review; do not silently change it.

13. Parent-cycles are forbidden. MOVE_TOPIC's new_parent cannot be a descendant of the moved topic. Walk the new parent's parent chain mentally before emitting; if it reaches the moved topic, the move is illegal.


OUTPUT RECAP

Your output is exactly one delimited block:

=== OPERATIONS ===
<one JSON operation per line>
=== END OPERATIONS ===

No markdown fences. No commentary outside the block. The audit reasoning lives in each operation's "reason" field (and "justify_restructure" payload when applicable). Anything not mentioned by an operation stays exactly where it was.
```

---

END OF DOCUMENT
