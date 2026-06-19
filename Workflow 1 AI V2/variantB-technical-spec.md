> **Part of the Variant B handoff package — uploaded to the `Workflow 1 AI V2/` folder in the repo. Start with `README.md` in that folder. NOTE: `variantB-binding-addendum.md` overrides this spec wherever they conflict.**

# TECHNICAL SPECIFICATION — Workflow #1, Variant B
**Audience: Claude Code (Codespaces).** Read the Primer first. This document is the prescriptive contract.

## §0. How to read this
- **§1–§4 (data model, orchestration, per-step contracts, Lessons integration) are prescriptive.** Implement them as written. Where a default value is given, use it (expose it as config).
- **Two steps (Step 1 and the vertical-ordering part of Steps 6–7) are STUBBED**, with their interfaces fully defined so nothing downstream is blocked. Their internal logic is pending two design discussions the operator has flagged. **Do not invent their internal logic** — implement the defined interfaces and leave the marked internals behind a clearly-named TODO that raises `NotImplemented` until specs land.
- **§5 (environment & integration) is NOT to be guessed.** Mirror the existing Workflow #1 conventions and use the operator's answers to the intake questions. Where you must make a binding choice, surface it for approval rather than deciding silently.
- Field types: `str, int, float, bool, enum, list<T>, map<K,V>, ref(Object), datetime`.

---

## §1. Shared Data Model
All steps read/write these objects. Persist per the operator's storage answer (§5); the schemas are fixed regardless of store.

### 1.1 `CLREntry` (one rulebook item)
```
id: str
type: enum{descriptor, value, value_ladder, zone, stage, placement_rule, naming_convention, merge_policy, ignorable_set}
payload: map           # type-specific (see 1.2–1.3 and §3)
scope: enum{universal} | str "niche:<slug>"
status: enum{candidate, active, retired}
version: int
supersedes: ref(CLREntry) | null
created_from: enum{bootstrap, manual} | ref(LessonRow)
created_at: datetime
```

### 1.2 `DescriptorDef` (payload of a `descriptor`-type CLREntry)
```
key: str               # stable machine key, e.g. "subject_type"
name: str
definition: str        # what the AI should answer
group: enum{subject, situation, action, meta}
value_menu: list<str> | "open"   # controlled vocab, or free text
laddered: bool
ladder_ref: ref(CLREntry value_ladder) | null
applicability: str | null        # when this note applies; null = always
```
A reserved descriptor **`summary` (group=meta, value_menu="open")** is always present and always filled (the free-text fallback).

### 1.3 `ValueLadder` (payload of a `value_ladder` CLREntry)
```
descriptor_key: str
rungs: list<{ value: str, parent_value: str|null }>   # general↔specific, e.g. right_ankle→ankle→lower_limb
```

### 1.4 `KeywordRow`
```
id: str
keyword: str
volume: int
```

### 1.5 `CarrierCluster`
```
id: str
representative: str
members: list<{ keyword: str, volume: int }>
summed_volume: int
```

### 1.6 `IntentInstance`
```
id: str
source_keyword: str
carrier_cluster_id: ref(CarrierCluster)
profile: map<descriptor_key, list<str>>   # values per note-type; lists allow multi-valued notes
summary: str
meaning_units: list<str>                  # words/phrases the read relied on
clarity: enum{clear, moderate, ambiguous}
confidence: float                          # 0..1
clr_version: int                           # the pinned version used
```

### 1.7 `Topic`
```
id: str
canonical_profile: map<descriptor_key, list<str>>
fingerprint: str                           # deterministic from canonical_profile
title: str                                 # searcher-voice unless neutral (see Step 4)
title_voice: enum{searcher, neutral}
boundary_belongs: str
boundary_excludes: str
specificity_markers: list<str>             # which notes make this more specific than its parent
member_instances: list<ref(IntentInstance)>   # the PRIMARY sources of this topic
primary_keywords: list<str>                # derived from member_instances
inherited_keywords: list<str>              # SECONDARY (carried up by nesting)
volume_full: int                           # sum of full volume of all contributing keywords (reach)
parent_id: ref(Topic) | null
children: list<ref(Topic)>                 # ORDERED (horizontal order)
sibling_order: int                         # position among siblings
depth: int                                 # 0 = spine root level; unbounded
is_spine: bool
zone: ref(CLREntry zone) | null
stage: ref(CLREntry stage) | null
funnel_vertical_rank: float | null         # journey order (see Step 7 stub)
```

### 1.8 `ProvenanceIndex`
```
by_keyword: map<keyword, list<{ intent_instance_id, topic_id, zone, stage, vertical_rank, neighbor_up: topic_id|null, neighbor_down: topic_id|null }>>
by_topic: map<topic_id, { primary_keywords: list<str>, inherited_keywords: list<str> }>
niche_dedup_total_volume: int              # volume counted once per keyword
```

### 1.9 `LessonRow` and `RulebookChange` — see §4.

---

## §2. Orchestration model
- **Wave:** a parallel batch of workers, all pinned to one `clr_version`. Record the version on every object produced.
- **Step DAG:** `1 → 2 → 3 → 4 → 5 → 6 → 7`. Steps 2–4 are embarrassingly parallel per item; 5–7 operate on the accumulated set but use cheap candidate-restriction / per-slice parallelism (see each step). No step holds the whole growing tree in an LLM context.
- **Batch size default:** 75 items per worker (config key `variantB.batch_size`).
- **Idempotency:** each item carries a stable `id`; re-running a failed batch must not duplicate. Persist intermediate outputs between steps.

---

## §3. Per-step technical contracts

### Step 1 — Initialize the rulebook (CLR) for the project — **STUB (interface defined)**
- **In:** `KeywordRow[]`, current CLR version.
- **Out:** a pinned `clr_version` for the project; a queue of `candidate` CLREntries (proposed new values/rules) for operator review.
- **Defined interface to implement now:** load the active CLR at a pinned version; expose `get_clr(version)`; expose `propose_clr_entry(entry)` (writes a `candidate`).
- **Internal logic PENDING discussion** (how the rulebook is assembled/bootstrapped, the diagnostic-sample method): implement as `TODO(rulebook_assembly)` raising `NotImplemented`. Downstream steps must accept a CLR version as input and not depend on Step 1's internals.

### Step 2 — Carrier dedup — **FULL**
- **In:** `KeywordRow[]`.
- **Out:** `CarrierCluster[]`.
- **Algorithm:** for each keyword, produce a normalized key: (a) remove the niche term and the closed ignorable stopword set from the active `ignorable_set` CLREntry — **default closed set = {"for","the","a"}; do NOT remove prepositions (in/on/from) or quantifiers (all/best/natural)**; (b) lemmatize plurals; (c) sort remaining tokens. Group keywords with identical normalized keys. Elect the highest-volume member as representative. Sum volumes.
- **Parallelization:** map (normalize) in parallel; reduce (group) is a mechanical hash-group.
- **Validation:** assert no cluster mixes distinct normalized keys; spot-report the 20 largest clusters for operator audit.
- **Errors:** none expected; empty/blank keyword → its own singleton cluster, flagged.
- **Lessons hook:** table rows = {representative, members}; lesson can edit the `ignorable_set` (a modify-CLR change).

### Step 3 — Intent enumeration & profiling — **FULL (AI step, the core)**
- **In:** `CarrierCluster[]` representatives, pinned CLR version, latest Lessons table for this task.
- **Out:** `IntentInstance[]` (often >1 per representative).
- **Procedure (per representative):** the model (a) reads the whole phrase, identifies `meaning_units`; (b) enumerates **all plausible distinct intents**; (c) for each, fills `profile` from the `DescriptorDef` set (choosing from each note's `value_menu`; lists where multi-valued); (d) writes the `summary`; (e) sets `clarity`, `confidence`; (f) emits an out-of-vocabulary flag if a needed value isn't in a menu.
- **Prompt contract:**
  - *System prompt* (stored as a versioned CLR/prompt entry; starts from this outline, evolves via Lessons): role = health-search intent analyst; instruction to enumerate *all plausible* intents generously (a missed intent is unacceptable); instruction to read whole phrase incl. prepositions/phrases; the active `DescriptorDef` list with definitions + menus; the standing instruction to consult the Lessons table; and the reserved marker line for Lessons insertions.
  - *Required output* — strict JSON, validated against this schema:
    ```
    { "intents": [ {
        "profile": { "<descriptor_key>": ["<value>", ...], ... },
        "summary": "string",
        "meaning_units": ["string", ...],
        "clarity": "clear|moderate|ambiguous",
        "confidence": 0.0,
        "out_of_vocab": [ {"descriptor_key":"...","proposed_value":"..."} ]
    } ] }
    ```
- **Parallelization:** fully parallel per representative; aggregate JSON into `IntentInstance` rows.
- **Validation (automatable):**
  - *Schema validation* — reject/retry malformed JSON.
  - *Intent-set agreement* — run a second blind pass on a sampled X% (default 5%); compare the *set* of intents; flag disagreements (catches **omission** and **fabrication**).
  - *Round-trip* — a separate pass reconstructs the intent from `profile` alone; a scorer compares to the source phrase; flag low-fidelity (catches under-expressive profiles).
- **Errors/edges:** `out_of_vocab` flags → surface as candidate `value` CLREntries (operator approves). Low confidence → route to a re-pass with more context.
- **Lessons hook:** table rows = {input: keyword + meaning_units; output: the profile(s); reason: one line}. Lessons can add/modify the system prompt or a `DescriptorDef`/value.

### Step 4 — Topic labeling — **FULL**
- **In:** `IntentInstance[]`.
- **Out:** candidate `Topic` objects (one per instance pre-merge), with `fingerprint`, `title`, `title_voice`, `boundary_belongs`, `boundary_excludes`, `specificity_markers`.
- **Algorithm:**
  - `fingerprint` = deterministic hash of the canonicalized `profile` (sorted keys/values, normalized via CLR). Identical profiles → identical fingerprint.
  - `title` per the **searcher-voice rule**: phrase it as the headline of the content the searcher wants ("Remedies for left ankle bursitis", "Is bursitis serious?"); set `title_voice=searcher`. When a first-person framing is unnatural (third-party/clinical/comparison framings, e.g., "How doctors diagnose bursitis", "MRI vs CT for bursitis"), use a neutral title; set `title_voice=neutral`. (AI step with this rule in the prompt; output includes the chosen voice.)
  - `boundary_belongs`/`boundary_excludes` must be contrastive and name a concrete neighbor where known.
- **Validation:** title↔profile consistency check; boundary must reference a concrete neighbor; voice tag present.
- **Lessons hook:** table rows = {input: profile; output: title + boundary + voice}. Lessons can modify naming conventions.

### Step 5 — Tight-topic formation (merge) — **FULL**
- **In:** candidate `Topic[]`.
- **Out:** merged tight `Topic[]` with `member_instances`/`primary_keywords` populated.
- **Algorithm:**
  - *Candidate generation* (cheap): compare only topics sharing a fingerprint or within a similarity neighborhood (use embeddings if available in Workflow #1; otherwise a normalized-token overlap heuristic). **Never all-pairs.**
  - *Merge rule (CONSERVATIVE):* merge two topics **iff** their canonical profiles are **identical** after CLR normalization. Combine their `member_instances`/keywords.
  - *Containment ≠ merge:* if profile B ⊂ profile A (A has all of B's notes/values **plus** at least one extra explicit note/value), DO NOT merge. Mark the pair as a **nest candidate** (B = parent, A = child) and pass to Step 6. (Example: `…in left knee` vs `…pain in left knee` → distinct; the latter nests under the former.)
  - *Purity check:* after merge, verify all member instances share one profile; split on any divergence.
- **Parallelization:** candidate groups processed independently in parallel.
- **Validation (cardinal):** sample executed merges; audit for any collapsed distinction (target near-zero false-merges). Over-splitting is the accepted safe direction.
- **Lessons hook:** table rows = {the two topics; merge/keep decision; reason}. Lessons can tighten/loosen the (default = exact-match) merge policy.

### Step 6 — Hierarchy build (nest + shells + ordering) — **FULL on structure; vertical-order STUB**
- **In:** tight `Topic[]` + the nest candidates from Step 5.
- **Out:** a connected tree: every topic has `parent_id`, ordered `children`, `sibling_order`, `depth`, `is_spine`; primary seated; secondary propagated.
- **Algorithm:**
  - *Nest:* A nests under B iff A's profile is a strict specialization of B's (all of B's notes/values present in A, plus extra). Use `specificity_markers`.
  - *Shell generation (multi-dimensional):* for a topic specific along several laddered notes (e.g., location=knee, age=older, sex=women), climb each `ValueLadder` to generate broader shell topics ("bursitis in knee", "bursitis in women", "bursitis in older people", "bursitis in older women", …). **Demand-aware guardrail:** create a shell only if (a) a real keyword maps to it, or (b) it is a defined natural grouping level in the CLR; do **not** generate every mathematical combination. Shells may have no primary keyword (empty allowed).
  - *Primary/secondary:* seat each topic's source keywords as `primary_keywords`; propagate every contributing keyword **up into all ancestors** it descends from as `inherited_keywords` (rule: if a keyword can attach as secondary under a parent, it must).
  - *Spine + horizontal order:* mark major parents as `is_spine=true`; order each parent's `children` and set `sibling_order` (default ordering rule = by descending `volume_full`, then alphabetical — overridable via CLR/operator).
  - *Label reconciliation:* merge synonymous branch labels operating only on the unique-label set.
  - *Vertical order (`funnel_vertical_rank`)* — **STUB**: PENDING the journey-ordering discussion. Implement `TODO(vertical_ordering)` and leave `funnel_vertical_rank=null` until specced. Everything else in this step is implemented.
- **Validation:** parent-child validity (each child is a true specialization); sibling-consistency (same kind/level); orphan/coverage (every keyword seated as primary or secondary somewhere); shell-explosion guard fires (no combinatorial blowup).
- **Lessons hook:** table rows = {topic; chosen parent/shells; reason}. Lessons can modify nest rules, ladders, sibling-order rule.

### Step 7 — Funnel placement — **FULL on zone/stage; vertical-order STUB**
- **In:** the tree.
- **Out:** every node has `zone` and `stage`; the `ProvenanceIndex` is built.
- **Algorithm:**
  - *Placement rules:* each `placement_rule` CLREntry = `{ conditions: list<{descriptor_key, op, value}>, zone, stage, priority: int }`. For each topic, evaluate rules in ascending `priority`; first match assigns zone+stage. **Conflict precedence default:** `action`-group conditions outrank `subject`-group. No match → push topic to a `needs_placement` queue (operator-visible) — do not guess.
  - *Index build:* construct `ProvenanceIndex.by_keyword` and `by_topic`; compute `niche_dedup_total_volume` (each keyword's volume counted once) and `volume_full` per topic (each keyword's full volume credited to every topic it feeds).
  - *Vertical ordering* — **STUB** (same `TODO(vertical_ordering)` as Step 6); sets `funnel_vertical_rank` once specced.
- **Validation:** coverage/gap audit (all placed or in `needs_placement`); volume reconciliation (sum of dedup contributions == niche_dedup_total).
- **Lessons hook:** table rows = {topic; assigned zone/stage; reason}. Lessons can add/modify/reorder placement rules.

---

## §4. Lessons Learned Module integration
Implement per the standalone **Lessons Learned Module spec** (already provided). Variant B specifics:
- Each AI step (1,3,4,5,6,7) registers its task with the module, declaring its **input excerpt** and **output excerpt** fields (named per step above).
- `LessonRow`: `{ id, task, project, input_excerpt, output_excerpt, ai_reasoning, user_lesson, status:{pending,approved,undone}, resulting_change: ref(RulebookChange)|null }`.
- `RulebookChange`: `{ id, kind:{add_instruction, modify_instruction, add_clr_entry, modify_clr_entry}, target, before, after, scope, version, approved_by, impact:{affected_ids:list, resweep_offered:bool}, reversible:true }`.
- **Modifications are safe by construction:** show `before`/`after` diff; never overwrite — write a new version with `supersedes`; allow rollback; require explicit approval (or batch-approval in streaming mode); compute `impact` (which already-produced items are affected) and offer a targeted re-sweep of only those.
- Prompts are **centrally managed per task**: a change to a task's prompt applies to all projects running that task.

---

## §5. Environment & integration — **DO NOT GUESS; intake required**
For each item below, mirror existing Workflow #1 conventions and confirm with the operator. Where unspecified, raise the question; do not pick silently.

**Intake questions (answer these to make the spec fully bound):**
1. **Stack:** language(s), backend framework, frontend framework of Workflow #1?
2. **Repo layout:** where does Workflow #1 live, and how is it modularized (services/packages/dirs)? Where should Variant B's new section sit?
3. **Persistence:** datastore type (SQL/NoSQL/files) and ORM/conventions? How are existing Workflow #1 artifacts stored?
4. **Orchestration:** how are AI tasks run — synchronous, a job/queue system, workers? How is the existing "AI task overlay" implemented (model select, batch size, progress/cost metrics)?
5. **Prompts:** where do prompts currently live and how are they versioned/edited?
6. **Existing Variant A:** how is the current keyword-analysis stage structured (so Variant B mirrors its boundaries and shares the input loader)?
7. **A/B toggling:** how do you want to select Variant A vs B (feature flag, route, config, UI toggle)?
8. **Model access:** how does code call models (SDK/provider, auth)? Are embeddings available (used in Step 5 candidate generation)?

**Binding rule for Claude Code:** implement §1–§4 against whatever Workflow #1 already uses for storage, jobs, prompts, and UI. Do not introduce a new datastore, queue, or UI framework. If a needed pattern is absent, surface it as a question rather than inventing one.

---

## §6. A/B testing harness
- Variant A (existing) and Variant B (this) consume the **same input spreadsheet** via the shared input loader.
- Variant B writes its outputs (the tree + provenance index) to its own namespace; Variant A is untouched.
- Selection via the operator's chosen toggle (§5 Q7).
- **Comparison surface:** expose both outputs side-by-side and a small set of comparison metrics (e.g., topic count, max depth, # topics per zone, total reachable vs dedup volume, # keywords appearing in multiple topics, coverage %). Exact comparison-UI placement mirrors existing Workflow #1 reporting.

---

## §7. Build order (integrate into the existing roadmap in this dependency order)
1. **Data model + storage bindings** (§1, §5 persistence) — nothing else compiles without it.
2. **CLR access layer + versioning/scoping** (§1.1–1.3, §4 change/version machinery) — the shared substrate.
3. **Lessons Learned Module integration** (§4) — needed by every AI step; build the harness early.
4. **Step 2 (carrier dedup)** — simplest, validates the input loader + pipeline plumbing.
5. **Step 3 (intent enumeration)** — the core; validate the prompt contract + JSON schema + the three checks.
6. **Step 4, then Step 5** — labeling, then conservative merge.
7. **Step 6 (hierarchy/shells/order)** — structure only; leave `funnel_vertical_rank` stubbed.
8. **Step 7 (zone/stage placement + index)** — leave vertical ordering stubbed.
9. **A/B harness + comparison surface** (§6).
10. **Blocked until design discussions land:** Step 1 internals (`TODO(rulebook_assembly)`) and vertical ordering (`TODO(vertical_ordering)`). Wire the interfaces now; fill when specs arrive.

---
*End of Technical Specification. §1–§4 prescriptive; Step 1 and vertical ordering stubbed pending discussion; §5 must bind to the operator's existing Workflow #1 — do not invent.*
