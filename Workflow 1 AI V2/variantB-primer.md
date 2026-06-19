> **Part of the Variant B handoff package — uploaded to the `Workflow 1 AI V2/` folder in the repo. Start with `README.md` in that folder for reading order and precedence.**

# PRIMER — Workflow #1, Variant B: Intent-Driven Keyword→Funnel Builder
**Audience: Claude Code (Codespaces).** Read this before the Technical Specification. This primer explains *what* you're building and *why*, in plain terms, so the spec's choices make sense. The spec is the prescriptive contract; this is the orientation.

---

## 1. What this feature is
A **new variant** of Workflow #1's keyword-analysis stage, built to run *alongside* the existing implementation so the operator can A/B test them on the same input.

- **Input:** one spreadsheet — Column A = keywords (search phrases), Column B = monthly search volume. 5,000–10,000 rows.
- **Output:** an **ordered, hierarchical conversion-funnel tree of intent-topics**, plus a **provenance index** mapping every keyword to all the topics it touches and where they sit in the funnel.
- **Method:** a multi-step pipeline, most of it parallel AI work, governed by a shared, evolving reference document.

You are **adding** this; you are **not** modifying or replacing the existing Workflow #1 keyword analysis. Both must run independently for comparison.

## 2. The core mental model (the single most important thing to internalize)
**The unit of analysis is the intent, not the keyword.**
- A keyword is just a clue. A single keyword can carry **several distinct intents** (e.g., `diverticulitis and colon cancer` → "can it cause cancer?" *and* "which do I have?"). These are different worries needing different answers.
- At the analysis step, a keyword **unfolds into one or more possible intents.** The keyword is **never discarded** — it stays attached to every intent and topic it produced (provenance).
- Equivalent intents (from any keywords) collapse into one **topic**. A topic = one canonical intent + every duplicate of it + all the source keywords.
- Topics nest into a tree (specific under general) and are placed along a **funnel** (early/awareness → late/purchase).
- Because of multiple intents *and* nesting, **one keyword legitimately appears under many topics.**

## 3. The pipeline at a glance
1. **Initialize the rulebook** for this project (inherit + adapt the shared reference). *(internal logic still under design — see spec.)*
2. **Carrier dedup** — fold word-for-word-equivalent phrases into one (cheap, mechanical, conservative).
3. **Intent enumeration & profiling** — read each phrase whole; list *all plausible* intents; for each, fill structured notes + a free-text summary. (The heart of it. Parallel.)
4. **Topic labeling** — give each intent a searcher-voice title and a "belongs/excludes" boundary; compute a comparison fingerprint.
5. **Tight-topic formation** — merge only *identical* intents; keep similar-but-distinct ones apart (very conservative).
6. **Hierarchy build** — nest topics, invent connecting "shell" topics, attach primary/secondary keywords, order them.
7. **Funnel placement** — assign each topic a zone and stage; order the tree to mirror the sufferer's journey. *(Vertical ordering still under design — see spec.)*

Output: the tree + the provenance index.

## 4. The living rulebook (Central Reference / "CLR")
Every AI step reads from one shared **Central Reference** — note-type definitions, allowed values, the funnel zones/stages, the placement rules, naming conventions. Key properties:
- **It is never frozen.** It improves continuously, within a project and across projects.
- **Versioned + pinned.** Each parallel run ("wave") is pinned to one version so workers stay consistent; the version increments as corrections land.
- **Scoped.** Every entry is tagged **Universal** (true for all health niches) or **Niche: [name]** (true only for that condition). A project sees Universal + its own niche; never another niche's entries.
- **Grown by one loop:** start from a universal default → validate against a sample → correct mistakes via the improvement screen → each correction becomes a scoped, versioned entry → recurring niche entries get promoted to Universal.

## 5. The improvement loop (Lessons Learned Module)
A panel beside each running AI task. As the AI produces output, a table logs each decision (the input, the output, the AI's one-line reason, an Undo, and a "Lesson" box). When the operator writes a lesson, the module turns it into a **safe, versioned, scoped change** to a prompt or a rulebook entry — either *adding* an instruction or *modifying* an existing one (shown as a before/after diff, approved explicitly, reversible, with an impact check that offers to re-process only affected items). This is the same mechanism that grows the rulebook. A standalone spec for this module already exists; the Technical Spec references it.

## 6. Glossary (use these exact terms in code and comments)
- **Intent Instance** — one distinct possible intent carried by one keyword.
- **Possible intent** — we enumerate *all plausible* intents; ambiguity yields more. Nothing is forced down to one.
- **Topic** — a class of equivalent Intent Instances (one canonical intent + duplicates + source keywords).
- **Primary keyword** — a keyword that is a perfect-fit source of a topic (a keyword can be primary in several topics, one per distinct intent).
- **Secondary keyword** — a keyword carried *up* into a topic's ancestors by nesting (inherited, not a perfect fit).
- **Shell topic** — a broader connecting topic the system invents to link a specific topic to the spine; may be empty of a primary keyword.
- **Spine** — the central column of major parent topics, ordered down the funnel.
- **Zone** — a coarse journey region; **Stage** — a finer slice inside a zone.
- **Vertical order** — sequence of parents down the funnel (journey order). **Horizontal order** — left-to-right order among same-depth siblings.
- **Provenance Index** — keyword → its intents → their topics → funnel positions (and the inverse).
- **Note-type (descriptor) / Profile** — the fixed set of questions answered about each intent; the filled set is its profile.
- **Summary** — a free-text capture of the full read of a keyword; the fallback that catches anything the structured notes miss.
- **Fingerprint** — a deterministic ID built from a profile; identical profiles → identical fingerprint.
- **Carrier dedup** — folding word-for-word-equivalent phrases before analysis.

## 7. Non-negotiable principles (do not violate these when implementing)
- **Parallel + stateless workers.** Per-keyword and per-topic work runs in parallel; each worker reads only the **pinned CLR version**, never the growing tree.
- **Reason on small, sort on big.** Heavy AI reasoning only on single keywords/topics/label-sets; large operations are mechanical sorts/joins.
- **Conservative merge.** Merge two intents *only* if their profiles are identical. If one contains the other plus an extra explicit aspect, they are **distinct** → the extra-specific one **nests under** the other. Never merge on containment.
- **Enumerate possible intents generously.** Surface every plausible intent; a missed intent is invisible and lost. Spurious ones are visible (low support/volume) and pruned later.
- **Never discard the source keyword.** Every intent/topic shows its keywords.
- **Full-volume accounting.** Each topic is credited the full volume of every keyword feeding it (true reachable demand), with a separate de-duplicated niche total kept to avoid overstating size.
- **Everything scoped + versioned.** Every rulebook entry and every change carries a scope (Universal/Niche) and a version; nothing is overwritten in place.

## 8. How it fits for A/B testing
Variant B is selectable alongside the existing Variant A. Both consume the **same input spreadsheet** and produce their own output, so the operator can compare results on identical data. Implement it as an additive, isolated section (behind a variant flag/selector consistent with your existing Workflow #1 conventions) — never as an edit to the existing path.
