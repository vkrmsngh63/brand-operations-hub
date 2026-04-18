# Auto-Analyze V2 Prompts — Canonical Source

**Last updated:** 2026-04-18 (first committed version — source of truth moves from the director's laptop into the repo)
**Last updated in session:** session_2026-04-18_phase1g-test-followup (Claude Code)

**Purpose:** The two text prompts used by the Keyword Clustering tool's Auto-Analyze feature to cluster keywords into topics. These are the canonical, source-of-truth versions — authored by the director for the PLOS Keyword Clustering workflow. Prior to this commit, they lived only in text files on the director's local laptop and inside `keyword_sorting_tool_v18.html`; nothing in the repo or database held the content. This doc makes the repo the authoritative source.

**Why the repo (not localStorage):** Prior handoff docs claimed the prompts persisted in browser localStorage under `kst_aa_initial_prompt` / `kst_aa_primer_prompt` keys. Those keys do not exist in the current code (verified by grep 2026-04-18 — zero matches in `/src/`). In practice the prompts lived only in the Auto-Analyze panel's React state and were lost any time the panel closed or the page refreshed before a run started. Committing them here solves that.

---

## How these prompts are used

The Auto-Analyze panel in the Keyword Clustering tool (at `/projects/[projectId]/keyword-clustering` on vklf.com) has two large text inputs:

- **Initial Prompt** — the first prompt below. Defines the clustering task: context, workflow, placement decision framework, reevaluation triggers, output expectations.
- **Topics Layout Table Primer** — the second prompt below. Defines the TSV column schema, parsing rules, ordering rules, and output format for the Topics Layout Table.

Before starting a run, the director pastes each prompt into its corresponding text input in the panel. The tool then interpolates three placeholder values at runtime:

- `[PRIMARY_SEED_WORDS]` — filled with the seed word(s) the user enters (e.g., `bursitis`).
- `[VOLUME_THRESHOLD]` — filled with the volume threshold the user sets.
- `[condition]` — a generic niche-name placeholder used inside examples only. Not runtime-replaced — it stays as-is in the prompt to show the model the shape of example titles.

---

## How to update these prompts

1. Edit this file directly with the new version.
2. Commit the change with a message describing what changed (e.g., `"AA V2 prompts: tighten Step 7 conversion-stage ordering"`).
3. Remember that changing this file does NOT automatically update what's pasted in the browser UI. After editing, the director must re-paste the new version into the Auto-Analyze panel before the next run.

Keeping the director's laptop copy and this file in sync: treat this file as the source of truth. If the laptop copy diverges, reconcile to this file or update this file to match (whichever has the latest intentional edits).

---

## 1. Initial Prompt V2

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

Note that we have a table (which we refer to as the 'Normal Keywords Extended Table') that has thousands of keywords and data associated with those keywords (such as search term volume). In this table, the 'Keyword' column has the individual search terms and among the many columns, there is also a column for 'Topics' in which we are supposed to list the individual search term intents that represent the worries/concerns, motives, goals, etc of the searchers that used that specific search term. We refer to this data as 'Topics' because, as you saw in the context laid out above, these 'Topics' then guide us towards creating narratives, identifying other narrative-supporting topics and sub-topics and towards developing fully fleshed out, well thought out conversion funnel paths that lead to our desired micro-goals (such as reading the next piece of content on the same page or clicking on a link to read the next part of the content further down the conversion path) and eventually lead to our desired macro-goals (signing up for an email newsletter or making an eager, emotionally satisfying sale). The topic descriptions are essentially more in-depth explanations of the data in the topics column. Note that since a specific search term can have multiple intents/topics representing them, the 'Normal Keywords Extended Table' sub-divides the main row in which the search term in present into sub-rows for each 'Topic' and its associated 'Topic Description' in the same sub-row.


Also note that we also have another table we refer to as the 'Topics Layout Table' which we are using as a method of presenting the conversion funnel such that unlike the 'Normal Keywords Extended Table' that takes a keyword-centric approach to presenting the data, the 'Topics Layout Table' takes a topics-centric approach that lays out the topics and subtopics in a relational and hierarchal manner representing a narrative-driven conversion path with the top of the conversion funnel representing topics that are generic and far from geared towards taking action towards treating the problem and that too with our specific product (which is a part of the conversion funnel towards the bottom with the bottom-most parts representing a sale of our product).

At the current stage of our workflow, we have a batch of selected search terms from the 'Normal Keywords Extended Table' and we want you to do the following:

1. Analyze each selected search term by itself to first come up with the topics that the search term you are analyzing belongs in. Then also come up with the upstream topics/sub-topics that the topic you just nested the search term under should come under.

2. Then you should come up with a title and description for all the topics and sub-topics you just identified related to the search term being analyzed (including the topic the search term will be nested under and the upstream topics that this topic will be nested under).

3. Then you should provide this data in a table form where you list the topic in the 'Keyword' column and then provide the name of the main topic that the search term will be nested under (in the 'Main Topic' column), then you should provide the Title and Description of this Main Topic in the 'Title' and "Topic Description' columns respectively, then you should provide all the other topics that the 'Main Topic' will be nested under in the Upstream Topics column and then for each of those topics provide the title and description for those Upstream Topics in the 'Upstream Topic Title' and 'Upstream Topic Description' respectively. To the right of both description columns should be a 'Topic Location' column that should identify where the topic should be located in the relational, hierarchal conversion funnel by mentioning the topic that the topic is under as parent topic or nested under as a child topic.

The Upstream Topics should NOT be placed in separate, horizontally repeating column groups (e.g., 'UT1 Title', 'UT2 Title'). Instead, the main row for each keyword should be sub-divided vertically into as many sub-rows as there are Upstream Topics. Columns for the Keyword, Main Topic, Main Topic Title, Main Topic Description, Main Topic Location should be merged across all sub-rows for that keyword. Only the Upstream Topic columns (Upstream Topic, UT Title, UT Description, UT Location) should vary across sub-rows. This keeps the table compact horizontally and makes the upstream hierarchy scannable vertically.

When a keyword is placed in both a primary and one or more secondary topics, the Keywords Analysis Table should list ALL placements. The Main Topic column should indicate whether each placement is primary or secondary by appending "(primary)" or "(secondary)" after the topic title. The primary placement must always appear as the first sub-row group for each keyword.

Keyword Placement Decision Framework — Primary and Secondary Topic Placement:

Every keyword must be placed into exactly one PRIMARY topic and zero or more SECONDARY topics. This dual-placement system ensures that every meaningful facet of a keyword is captured structurally in the funnel — not merely noted in a description — so that downstream therapeutic strategy, content development, and landing page creation can draw on the full analytical depth of every relevant topic branch.

DEFINITIONS:
- Primary topic: The most specific, intent-accurate topic for this keyword. This is where the keyword's core information need lives and where the most directly relevant content would be written. In the Topics Layout Table's Keywords column, primary placements are annotated with [p] after the keyword string.
- Secondary topic: A topic representing a meaningful facet, demographic angle, or cross-cutting theme that this keyword also belongs to. Secondary topics capture dimensions of the searcher's identity, situation, or concern that influence what content should say and how the product should be positioned, even though the searcher is not independently seeking content focused solely on that facet. In the Keywords column, secondary placements are annotated with [s].

PLACEMENT PROCESS — For each keyword, follow these steps:

Step 1 — Identify the Core Intent:
Ask: "What does this searcher want to learn, solve, or do?" Strip away all demographic, situational, temporal, and severity qualifiers. The answer is the candidate for the primary topic. For example, for "[condition] [body location] [symptom] in [age] year old [gender]" — the core intent is learning about that specific condition's symptoms at that body location.

Step 2 — Create or Identify the Primary Topic:
The primary topic should be the most specific existing topic that matches the core intent. If no sufficiently specific topic exists, create one. The primary topic must be specific enough that semantically and thematically similar keywords naturally cluster together. Keywords should only share a primary topic if they would be well-served by the same page of content.

CRITICAL: If the keyword contains a facet that meaningfully changes what content should say (e.g., a gender, age group, or severity qualifier), the primary topic should reflect that specificity. Do not place "female [condition] [body location] symptoms" into a generic "[Condition] [body location] symptoms" topic — create a nested sub-topic like "[Condition] [body location] symptoms in women" and make that the primary topic. The parent topic "[Condition] [body location] symptoms" remains in the hierarchy as a broader organizational node.

Step 3 — Identify Qualifying Facets:
List every facet in the keyword that describes the searcher's identity or circumstances: demographic qualifiers (age, gender, ethnicity), situational qualifiers (occupation, activity, lifestyle), temporal qualifiers (acute, chronic, duration, post-surgical), severity qualifiers (mild, severe, recurring), and any other contextual modifier.

Step 4 — Create Secondary Placements for Meaningful Facets:
For each qualifying facet, ask: "Does this facet create a meaningfully different therapeutic consideration, content angle, or product positioning need?" If yes, the keyword gets a secondary placement under a topic dedicated to that facet.

Secondary placements require complete topic hierarchies. For each facet-based secondary placement:
(a) Identify or create the cross-cutting organizational topic for that facet dimension. Use searcher-centric language for the topic title (e.g., "Who does [condition] affect?" rather than "[Condition] demographics").
(b) Create the facet-specific topic nested under it (e.g., "How [condition] affects women differently" nested under "Who does [condition] affect?" → "How [condition] differs between men and women").
(c) Ensure the full chain of parent topics exists back to a root-level topic, creating empty narrative-bridging topics as needed. These empty topics will guide narrative development even before keywords are assigned to them.
(d) Place the keyword under the most specific facet topic with a [s] annotation.

Step 5 — Build Complete Upstream Chains:
For both the primary and every secondary placement, verify that a complete chain of parent topics exists from the keyword's topic all the way to a root-level (Depth 0) topic. If any intermediate topics are missing, create them. These intermediate topics may be empty (no keywords assigned) — they serve as narrative scaffolding that ensures the conversion funnel has a logical, step-by-step flow from the most general awareness down to the most specific concern.

Topic roles:
- Keyword-holding topics: Have keywords directly assigned. These represent specific searcher intents.
- Narrative-bridging topics: Empty of keywords. They exist to connect topics in the hierarchy and provide chapter structure for the narrative flow. They must still have descriptive titles (in searcher-centric language) and topic descriptions.
- Cross-cutting topics: Capture a facet theme across multiple branches of the funnel. Connected to location-specific or condition-specific topics via Sister Node relationships.

Step 6 — Volume-Aware Topic Granularity:
The user has specified a volume threshold of [VOLUME_THRESHOLD]. Apply these rules:

(a) Any keyword with search volume at or above [VOLUME_THRESHOLD] ALWAYS gets its own dedicated sub-topic as its primary placement if its facets or specificity meaningfully distinguish it from sibling keywords. Never absorb a high-volume keyword into a generic parent topic when a more specific sub-topic would serve it better.

(b) A cluster of keywords that share a facet and whose COMBINED search volume meets or exceeds [VOLUME_THRESHOLD] warrants a dedicated sub-topic for that facet, even if each individual keyword's volume is below the threshold. After placing all keywords in the batch, scan for such clusters and promote them.

(c) In small niches (where the total keyword count is low), the effective threshold should be applied more liberally — the goal is to capture as many distinct audience segments as the data supports, because each unique keyword represents a scarce opportunity to reach a specific searcher.

(d) The volume threshold is a floor for guaranteed topic creation, not a ceiling. If a facet creates a meaningfully different therapeutic or content consideration, a dedicated topic is warranted regardless of volume.

Step 7 — Conversion Funnel Stage Ordering:
The Topics Layout Table is not just a topical taxonomy — it is a conversion funnel with a deliberate narrative arc. Every topic must be placed at the correct stage in the journey from initial awareness to final conversion. When creating or positioning topics, apply these ordering principles:

(a) Root-level topics (Depth 0) represent distinct stages of the conversion funnel, ordered from awareness to purchase. A typical health niche funnel progresses through stages like: recognizing something is wrong → understanding what the condition is → learning who it affects and why → exploring what can be done → evaluating specific solutions → taking action. Root topics should reflect this natural progression using searcher-centric language (e.g., "Something doesn't feel right", "What is [condition]?", "Who does [condition] affect?", "What can you do about it?", "Finding the right solution", "Taking the next step").

(b) Linear children within each branch must move the narrative forward toward conversion. Each linear topic should represent the next natural thought the searcher would have after absorbing the previous topic. Ask: "After reading about this topic, what would this person want to know next?" That answer is the next linear child.

(c) Nested children represent deeper exploration within the current funnel stage — not jumps to a different stage. A nested topic under "Where does [condition] hurt?" might be "Hip [condition] symptoms" — this is a deeper dive within the same stage (understanding symptoms), not a jump to treatment options. If a topic would naturally come after the parent rather than within it, it should be linear, not nested.

(d) When placing a keyword, consider where the searcher is in their journey. A keyword like "[condition] symptoms" belongs in the awareness/recognition stage. A keyword like "best [treatment] for [condition]" belongs in the solution evaluation stage. A keyword like "buy [product] for [condition]" belongs in the action stage. The topic hierarchy for each keyword must reflect this — the keyword's topic should sit within the correct funnel stage, and its upstream chain should trace back through that stage's root topic.

(e) As new topics are created across batches, the funnel should become more detailed within each stage without breaking the stage progression. New keywords may reveal sub-stages (e.g., within the treatment exploration stage: "treatments you can try at home" → "when home remedies aren't enough" → "professional treatment options"). These should be ordered linearly to maintain the narrative momentum toward conversion.

(f) Cross-cutting topics (created for secondary placements) also follow funnel ordering within their own branch. A branch like "Who does [condition] affect?" → "How [condition] affects women differently" should position its nested sub-topics in a logical narrative order, not just as a flat list of demographics.

Post-Batch Funnel Reevaluation Pass:
After placing all keywords in the current batch but before finalizing the Integrated Topics Layout Table, you must perform a scoped reevaluation of the funnel structure. The purpose of this pass is to ensure that the Topics Layout Table improves in overall quality and efficiency as a conversion funnel framework with each batch — not just grows larger. The funnel is a living structure that should get sharper, not merely bigger.
This reevaluation is not a full audit of the entire table. It is triggered by specific signals you observe during keyword analysis and scoped to only the branches and topics that were directly touched or flagged during the current batch. You must track these signals as you work through each keyword and then act on them collectively after all keywords in the batch have been initially placed.
Reevaluation Triggers and Actions:
There are seven types of structural changes that may be warranted. During keyword analysis, watch for the signals described below. When you observe a signal, flag it internally and address it during the reevaluation pass.
(1) Facet Promotion — A qualifying facet that was previously captured only in a topic description or only through secondary placements now has enough keywords or sufficient combined volume within the same parent branch to warrant its own dedicated nested sub-topic as a primary placement target. Signal: while placing a keyword, you note that a qualifying facet within a branch now has (a) 2 or more keywords sharing it, or (b) keywords whose combined search volume meets or exceeds the volume threshold [VOLUME_THRESHOLD], or (c) any single keyword at or above the volume threshold that contains this facet. Action: create the new sub-topic nested under the relevant parent, reassign keywords whose primary placement should shift to the new more-specific topic, update secondary placements as needed, and update the parent topic's description.
(2) Keyword Reassignment — A newly created topic (whether from facet promotion, splitting, or direct creation during this batch) is a better home for keywords that currently sit in an existing topic from a prior batch. Signal: while creating a new topic or sub-topic, you notice that keywords already assigned to the parent or a sibling topic would be more directly and completely served by content written for the new topic. Action: move the affected keywords from their current topic to the new topic. Update the Keywords field of both the source and destination topics. Only reassign when the new topic is a clearly superior fit — not a marginal improvement. Apply this test: "Would content written for the new topic address this keyword's intent more directly and completely than content written for the current topic?" If the answer is not a clear yes, leave the keyword where it is.
(3) Topic Splitting — An existing topic has accumulated keywords with meaningfully divergent sub-intents that were initially grouped together because the volume did not justify separation. Now it does. Signal: while placing a keyword into an existing topic, you observe that the topic's Keywords field contains clusters of keywords that would require substantially different content narratives to address properly, and each cluster has at least 2 keywords. Action: split the topic into two or more sibling or nested topics as appropriate, distribute the keywords according to their sub-intents, write new topic descriptions for each resulting topic, update all parent-child and sister-node relationships, and ensure the split topics maintain correct depth-first tree-walk order in the table.
(4) Topic Merging — Two existing topics at the same level have converged in intent as more keywords have been analyzed. They cover essentially the same searcher need from slightly different angles, and maintaining both creates unnecessary fragmentation in the funnel without adding meaningful narrative distinction. Signal: while analyzing a keyword, you find that two existing topics are equally good candidates and their topic descriptions substantially overlap. Action: merge the two topics into one, combine their Keywords fields, reconcile their topic descriptions into a single comprehensive description, update all parent-child and sister-node relationships, remove the now-redundant topic row, and ensure the table maintains correct depth-first tree-walk order. Preserve the title of whichever topic is more descriptive or better established, and add the other title to the Alternate Titles field.
(5) Hierarchy Repositioning — New keyword analysis reveals that an existing topic's parent-child relationship is suboptimal. The topic may be nested under the wrong parent, may belong at a different depth level, or may need to be moved to a different branch of the funnel. Signal: while tracing a keyword's upstream chain, you notice that the path passes through topics in a sequence that does not reflect the natural narrative flow of the searcher's journey, or that a topic would logically sit better under a different parent given the broader pattern now visible. Action: move the topic to its correct position, update its Parent Topic, Depth, and Relationship fields, update the former parent's and new parent's relationships and sister nodes as needed, and adjust any child topics that move with it (their depths must remain parent depth + 1). Ensure the table maintains correct depth-first tree-walk order after the move.
(6) Narrative Flow Refinement — The linear vs. nested relationship classification between topics needs adjustment. A topic marked as nested (a deeper dive within the parent's scope) may actually represent a natural next narrative step (linear), or vice versa, now that the broader funnel shape is clearer with more keywords providing context. Signal: while reviewing the upstream chain of a newly placed keyword, you notice that the relationship labels do not accurately describe how the searcher would naturally move between topics. Action: change the Relationship field from nested to linear or from linear to nested as appropriate, and update the topic description to reflect the corrected narrative role.
(7) Volume-Based Cluster Promotion — After placing all keywords in the batch, scan the touched branches for clusters of keywords that share a facet and whose combined search volume meets or exceeds [VOLUME_THRESHOLD], but which are currently scattered across a broader parent topic rather than having their own dedicated sub-topic. Signal: while reviewing the completed placements for the batch, you identify two or more keywords within the same branch that share a qualifying facet, their individual volumes are below [VOLUME_THRESHOLD], but their combined volume meets or exceeds it. Action: create a dedicated sub-topic for that facet cluster, reassign the relevant keywords' primary placements to the new sub-topic, create secondary placements if not already present, and update parent topic descriptions.
Reevaluation Thresholds:
To avoid unnecessary churn, apply these thresholds before acting on any signal:
Facet promotion threshold: A qualifying facet warrants its own sub-topic when (a) at least 2 keywords within the same parent branch share it, or (b) a single keyword with search volume at or above [VOLUME_THRESHOLD] carries that facet, or (c) multiple keywords sharing the facet have a combined volume at or above [VOLUME_THRESHOLD]. Below these thresholds, the facet is captured via secondary placements and topic description notes.
Split threshold: A topic warrants splitting when it contains keywords representing two or more clearly distinguishable sub-intents, each sub-intent cluster has at least 2 keywords, and the sub-intents would require meaningfully different content narratives to address properly.
Merge threshold: Two topics warrant merging when their topic descriptions overlap substantially, their keywords would be equally well-served by either topic, and maintaining both creates no meaningful narrative distinction in the funnel.
Reassignment threshold: A keyword's primary placement should be moved from an existing topic to a different topic only when the new topic is a clearly superior fit — not a marginal improvement. If the current placement is adequate even though the new topic is slightly better, leave the keyword where it is.
Reevaluation Constraints:
The following constraints govern what the reevaluation pass may and may not do:
(a) Never delete topics entirely. Topics that lose all their keywords through reassignment should be flagged in the reevaluation report for manual review rather than auto-deleted. A topic may still serve a narrative or organizational function in the funnel even without directly assigned keywords (e.g., organizational parent topics that exist to structure the hierarchy rather than to hold keywords).
(b) Only reevaluate branches of the funnel that were directly touched by the current batch — meaning branches where new keywords were placed, new topics were created, or signals were flagged during analysis. Do not reevaluate branches that had no interaction with the current batch.
(c) Do not change the Conversion Path of existing topics without explicit justification that the topic genuinely belongs in a different funnel.
(d) Do not silently rearrange the funnel. All structural changes made during the reevaluation pass must be reported in a dedicated Reevaluation Report section of your output (described below).
Reevaluation Report:
After completing the reevaluation pass, include a Reevaluation Report as part of your output. This report must list every structural change made during the reevaluation, grouped by change type. For each change, state:

The change type (facet promotion, keyword reassignment, topic split, topic merge, hierarchy repositioning, narrative flow refinement, or volume-based cluster promotion).
The specific topics and keywords affected.
The reason the change was triggered (what signal you observed during which keyword's analysis).
What the structure looked like before the change and what it looks like after.

If the reevaluation pass produced no structural changes (no signals were flagged or no signals met the thresholds), state this explicitly: "Reevaluation Pass: No structural changes warranted in this batch."
The Reevaluation Report ensures that every change to the funnel structure is visible, traceable, and reviewable. The Integrated Topics Layout Table should already reflect all reevaluation changes — the report documents what was changed and why, not what is being proposed for approval.

4. After completing the keyword analysis and the reevaluation pass, immediately integrate all analyzed data into the Topics Layout Table and provide the complete updated Integrated Topics Layout Table as your final output for this batch.

5. Continuing with New Keyword Batches
This workflow is iterative. After a batch of keywords has been fully analyzed and integrated into the Topics Layout Table, the next batch will be provided automatically. When this happens:
(a) The most recently updated Topics Layout Table (from the previous cycle) is the starting state. All existing topics, keywords, relationships, and descriptions in that table must be preserved and treated as the established funnel structure.
(b) Analyze the new batch of keywords following Steps 1–5, using the existing Topics Layout Table as context — mapping new keywords to existing topics where appropriate, and creating new topics only when the intent genuinely doesn't fit any existing topic.
(c) Provide all three required output blocks (Keywords Analysis Table, Integrated Topics Layout Table, and Reevaluation Report) using the exact delimiter format specified in your output instructions.
(d) The Topics Layout Table is cumulative — it grows with each batch. Never reset or rebuild it from scratch unless the user explicitly requests it.

Note a few important things:

- The 'Topics Layout Table' may be empty when we first start analyzing the search terms and you will be expected to fill out the initial data for the initially analyzed search terms. The 'Topics Layout Table Primer' is provided below as part of this prompt — it describes the column definitions, tree-walk ordering, data integrity rules, and TSV format for the Topics Layout Table.

- Also note that the primary seed word (which is also the niche health condition we are targeting) for the keywords data is [PRIMARY_SEED_WORDS]. This means this/these seed word(s) will be present in almost all keywords and may not play a big role in figuring out the intent of the searcher except when it appears by itself (in which case it will represent the topmost, most generic intent and topic node).

AUTOMATED PROCESSING CONTEXT:
This analysis is being executed via an automated API pipeline. Your output will be parsed programmatically — not read in a chat interface. Therefore:
- Do NOT produce interactive artifacts, HTML tables, visual mindmaps, or downloadable files.
- Do NOT ask for the next batch of keywords — batch sequencing is handled automatically.
- Do NOT include markdown code fences around your data outputs.
- Focus entirely on the analytical quality of your keyword analysis, topic placement (with [p] and [s] annotations), reevaluation, and the accuracy and completeness of your structured data outputs.
- Your output MUST contain exactly three delimited blocks in the format specified in your output instructions. The quality of the analysis is paramount — the output format simply ensures it can be read by the automated system.
```

---

## 2. Topics Layout Table Primer V2

```
CONTEXT: What We Are Doing

We are brand owners developing health products targeted at specific health niches. We use keyword data from search engines to deeply understand the searcher's explicit and implicit intents, emotional drivers, concerns, goals, and motivations. This understanding drives:

1. Product development — so the product itself addresses the real needs uncovered from keyword analysis
2. Conversion funnel creation — a narrative-driven content strategy that leads searchers from initial awareness through to an eager, satisfying purchase
3. Content strategy — hyper-relevant content for Google Ads, Amazon, eBay, Walmart, Etsy, and Google Shopping that achieves click-through rates far above industry averages

Our methodology centers on organizing keyword intents into Topics (representing distinct searcher intents, concerns, or stages) and arranging those Topics into a structured conversion funnel — a narrative path that moves a searcher from broad awareness to confident purchase.


WHAT THE TOPICS LAYOUT TABLE IS

The Topics Layout Table is a structured representation of our conversion funnel. It is exported as a TSV (tab-separated values) file from our tool and captures the complete hierarchy of topics, their relationships, descriptions, linked keywords, and which conversion path they belong to.

Think of it as a flattened tree — each row is a topic node, and the combination of Depth, Parent Topic, and Relationship columns tells you exactly where it sits in the hierarchy.


COLUMN DEFINITIONS

Depth — Numeric indent level. 0 = root topic (top of funnel). 1 = direct child of a root. 2 = grandchild, etc. Higher depth = further down or more specific in the funnel.

Topic — The primary title of this topic node. This is the main label used throughout the tool. This is the only required column. Topic titles must use searcher-centric language — phrased as the condition sufferer would naturally think, ask, or respond to (e.g., "Who gets [condition]?" rather than "[Condition] demographics").

Alternate Titles — Comma-separated list of alternate names for this same topic. These represent different phrasings of the same intent (e.g., "[condition] in women" and "female [condition]"). Leave empty if there are no alternates.

Relationship — How this topic connects to its Parent Topic. Values: "linear" (peer-sequence — this topic follows the parent as the next step in the narrative), "nested" (sub-topic — this topic is a deeper dive within the parent's scope). Root topics (Depth 0) have no relationship.

Parent Topic — The title of the topic directly above this one in the hierarchy. Empty for root topics.

Conversion Path — The name of the conversion funnel this topic belongs to. Typically named after the root topic of that funnel. A single table can contain multiple conversion paths (e.g., a main commercial funnel and a separate academic/research path).

Sister Nodes — Comma-separated titles of topics that are peers to this one — same level, same parent context, but representing parallel or closely related intents (e.g., "How [condition] affects women" and "How [condition] affects men"). Sister links are non-hierarchical.

Keywords — Comma-separated list of search terms linked to this topic, each annotated with a placement type: [p] for primary placement or [s] for secondary placement. Example: female hip pain symptoms [p], women joint pain hip [s]. A keyword should appear with [p] in exactly one topic and with [s] in zero or more additional topics. If no annotation is present, the keyword is treated as [p] by default (backward compatibility). Each keyword string (excluding the annotation) must exactly match a keyword already loaded in the tool's All Search Terms table. Keywords not found will be skipped and reported in an error overlay after import.

Topic Description — A detailed description of this topic: what it covers, the searcher's emotional state at this stage, what concerns the content addresses, what the content goals are. Must not contain tab characters or newline characters — these break TSV parsing.


CRITICAL TSV PARSING RULES

These rules describe exactly how the tool's parser processes the TSV data. Violating any of these will cause silent data loss or broken imports:

1. Column headers are case-insensitive. The parser converts all headers to lowercase before matching. "Topic", "TOPIC", and "topic" all match correctly.

2. Only the Topic column is required. All other columns are optional. Missing columns are treated as empty values for all rows.

3. Rows with an empty Topic value are silently skipped. Every row must have a non-empty Topic title.

4. The values NaN, nan, null, and undefined are auto-stripped to empty strings. This handles dirty data from spreadsheet exports.

5. Relationship matching is case-insensitive. Only the value "nested" (any casing) is recognized as a nested relationship. Any other value (including "linear", empty, or unrecognized strings) defaults to "linear".

6. Comma-separated fields (Alternate Titles, Sister Nodes, Keywords) are split by comma, each item is trimmed of whitespace, and empty strings are discarded.

7. Tab characters within cell values break TSV parsing. The parser splits each line by tab, so a tab inside a description will shift all subsequent columns. Replace any tabs with spaces before output.

8. Newline characters within cell values break TSV parsing. Each line is parsed as one row, so a newline inside a description creates a phantom row. Replace any newlines with spaces before output.

9. Keyword linking is by exact string match. The parser matches each keyword string from the Keywords column against KW[].keyword in the tool's All Search Terms table. The [p] and [s] placement annotations are stripped before matching. If no match is found, that keyword is skipped and reported in an error overlay listing every unmatched keyword and the topic it was assigned to. The keyword must already exist in the tool before import.

10. Parent Topic is matched by exact title string. The Parent Topic value must exactly match an existing or newly-imported Topic title (case-sensitive). Mismatched parent references result in orphaned nodes.

11. The first row is treated as a header if it contains both "topic" and "depth" (case-insensitive) in its cells. Otherwise the first row is treated as data.


HOW TO READ THE TABLE

The table is ordered by a depth-first tree walk — you read it top to bottom and it follows the narrative flow of the conversion funnel:

  Depth 0: Understanding your symptoms          (Root topic, top of funnel)
  Depth 1:   Where does it hurt?                 (Linear child, next narrative step)
  Depth 2:     Hip pain symptoms                 (Nested child, sub-topic)
  Depth 2:     Shoulder pain symptoms            (Another nested child)
  Depth 1:   What can you do about it?           (Linear child, next narrative step)

Linear relationships ("linear") represent the forward flow of the conversion funnel — Topic A leads narratively to Topic B.

Nested relationships ("nested") represent deeper exploration within a parent topic — sub-topics that the reader might explore before moving forward.

Sister links represent parallel peers — topics at the same conceptual level that address similar or overlapping intents from different angles.


HOW TO UPDATE THE TABLE WHEN ANALYZING NEW KEYWORDS

When you receive a batch of new keywords to analyze, follow this process for each keyword:

Step 1: Analyze the Keyword's Intent
For each keyword, determine:
- What is the searcher's situation?
- What are their explicit and implicit concerns/worries?
- What are their explicit and implicit goals?
- What emotional state are they in?

Step 2: Determine Primary Topic Placement
Based on the intent analysis, identify the most specific topic that matches this keyword's core intent:
- If an existing topic captures this exact intent, add the keyword to that topic's Keywords column with [p] annotation
- If the keyword's facets make it meaningfully different from existing keywords in the nearest topic, create a new nested sub-topic that reflects the specificity, and place the keyword there with [p]
- If no appropriate topic exists in the current funnel, create a new topic (with complete upstream chain) and place the keyword with [p]

A keyword has exactly one primary [p] placement.

Step 2b: Determine Secondary Topic Placements
For each meaningful qualifying facet in the keyword (demographic, situational, temporal, severity):
- Ask: "Does this facet create a different therapeutic consideration, content angle, or product positioning need?"
- If yes, identify or create a cross-cutting topic hierarchy for that facet dimension and place the keyword there with [s] annotation
- Ensure each secondary placement has a complete upstream chain of parent topics back to a root
- Topics created for secondary placements may be empty (no primary keywords) — they serve as narrative scaffolding

A keyword may have zero or more secondary [s] placements.

Step 3: Create New Topics (if needed)
When creating a new topic row, fill in ALL columns:
- Depth: Based on its position relative to its parent
- Topic: A clear, descriptive title for the intent cluster — written in searcher-centric language that a condition sufferer would find engaging and relevant. Ask: "If a sufferer saw this as a heading, would they feel compelled to read on?"
- Alternate Titles: Any alternate phrasings (comma-separated, or empty)
- Relationship: "linear" if it is a next narrative step from the parent, "nested" if it is a deeper dive within the parent
- Parent Topic: The exact title of the parent topic it connects to
- Conversion Path: Usually the same conversion path as the parent. Use a different path only if this intent clearly does not belong in the main commercial funnel
- Sister Nodes: If this new topic is a peer/parallel to another existing topic, list that topic's title here — and also add this new topic's title to the sister topic's Sister Nodes column
- Keywords: The keyword(s) that belong to this topic, each annotated with [p] or [s]
- Topic Description: Detailed description of the intent, the reader's state, content goals

Step 4: Maintain Table Order and Funnel Stage Progression
The table must remain in depth-first tree-walk order. When inserting a new row:
- A new linear child should appear after the parent's last descendant (all its nested children and their descendants)
- A new nested child should appear directly after the parent (before the parent's linear children)
Additionally, the ordering must reflect the conversion funnel's narrative progression:
- Root-level topics (Depth 0) should represent distinct funnel stages ordered from awareness to conversion
- Linear children must move the narrative forward within their branch — each represents the next natural thought the searcher would have
- Nested children represent deeper exploration within the current stage, not jumps to a different stage
- When placing a keyword, consider where the searcher is in their journey (symptom recognition, understanding, exploring options, evaluating solutions, taking action) and ensure the topic sits within the correct funnel stage

Step 5: Build Complete Upstream Chains
For both primary and secondary placements, verify that a complete chain of parent topics exists from the keyword's topic all the way to a root-level (Depth 0) topic. If any intermediate topics are missing, create them as empty narrative-bridging topics. These topics may have no keywords but must have titles (in searcher-centric language) and topic descriptions.

Step 6: Check for Sister Relationships
After placing all keywords, review whether any new topics are conceptual peers of existing topics. If so:
- Add sister references in both directions (each topic lists the other in its Sister Nodes column)
- Sister topics do NOT need to share the same parent — they just need to represent parallel/overlapping intents


RULES AND CONSTRAINTS

1. Every keyword must have exactly one primary placement — annotated with [p] in exactly one topic's Keywords field.
2. A keyword may have zero or more secondary placements — annotated with [s] in additional topics' Keywords fields, representing meaningful facets.
3. Never delete existing topics or keywords — only add new ones or add keywords to existing topics.
4. Preserve the exact titles of existing topics — the tool matches by title, so changing an existing title will break the connection.
5. Depth must be consistent — a child's depth must be exactly parent's depth + 1.
6. Conversion Path must be consistent — children must be in the same conversion path as their parent.
7. Sister links must be bidirectional — if Topic A lists Topic B as a sister, Topic B must also list Topic A.
8. Alternate Titles are comma-separated — use commas to separate multiple alternate titles.
9. Keywords are comma-separated — use commas to separate multiple keywords in the Keywords column, each with its [p] or [s] annotation.
10. No tabs or newlines inside any cell value — these characters break TSV parsing. Use spaces instead.
11. Keyword strings must exactly match what is loaded in the tool — do not paraphrase, re-case, or alter keyword strings. The [p] or [s] annotation is appended after a space following the keyword string.
12. Primary placement is unique — each keyword must appear with [p] in exactly one topic's Keywords field. It may appear with [s] in zero or more additional topics.
13. Empty topics are valid — topics with no assigned keywords serve as narrative-bridging or organizational nodes. They must still have titles (in searcher-centric language) and topic descriptions.
14. Complete upstream chains are required — every topic must have a chain of parent topics back to a Depth 0 root. If intermediate topics do not exist, create them as empty narrative-bridging topics.
15. Topic titles must use searcher-centric language — titles should mirror the thoughts, questions, and concerns of the condition sufferer. Avoid clinical, academic, or utilitarian labels. If a sufferer would not find the title engaging as a content headline, rephrase it.


OUTPUT FORMAT

Return the complete updated table in TSV format with exactly these column headers (tab-separated, on the first line):

Depth    Topic    Alternate Titles    Relationship    Parent Topic    Conversion Path    Sister Nodes    Keywords    Topic Description

Include ALL existing rows (even if unchanged) plus any new rows, in correct depth-first tree-walk order.

Output rules:
- Each row on its own line, cells separated by tab characters
- No tab characters or newlines within any cell value
- Comma-separated lists (Alternate Titles, Sister Nodes, Keywords) use ", " (comma followed by space) as the separator
- Keywords in the Keywords column must include placement annotations: "keyword [p]" for primary, "keyword [s]" for secondary. Default (no annotation) is treated as primary.
- Depth is a plain integer (0, 1, 2, 3, etc.)
- Relationship is lowercase: "linear" or "nested" (empty for root topics)
- Do not wrap any values in quotes
- Do not include any markdown formatting, code fences, or extra whitespace around the TSV output
```

---

END OF DOCUMENT
