# KEYWORD CLUSTERING — DATA CONTRACT (v1)

**Workflow #1 of 14 in PLOS — GRADUATED 2026-05-12.**

**Status:** ✅ GRADUATED. Production-Readiness Gate met at 5 of 6 prereqs ✅ VERIFIED LIVE; prereq #1 (cold-start banner UI) at 🟡 PARTIAL — happy-path verified live; banner code path covered by unit tests + code review; natural-flake confirmation engineered close to never-fires by the #2/#3/#5b fixes and stays "fold into normal director use" rather than a graduation blocker.

**Purpose of this doc:** the small, stable, downstream-facing contract for W#1. Loaded as a Group B doc whenever a downstream workflow consumes W#1 data OR whenever W#1 is revisited per HANDOFF_PROTOCOL Rule 22 (Graduated-Tool Re-Entry Protocol). Full development history of W#1 lives in `KEYWORD_CLUSTERING_ARCHIVE.md` (loaded only on revisit; ~4600 lines of session-by-session state blocks).

**Companion docs:**
- `KEYWORD_CLUSTERING_ARCHIVE.md` — full history, all STATE blocks, all session deltas
- `KEYWORD_CLUSTERING_POLISH_BACKLOG.md` — outstanding polish + feature work that didn't gate graduation
- `INPUT_CONTEXT_SCALING_DESIGN.md` — Scale Sessions A–E architecture rationale (tiered serialization, intent fingerprints, atomic-batch fold-in)
- `AUTO_ANALYZE_PROMPT_V4.md` + `AUTO_ANALYZE_CONSOLIDATION_PROMPT_V4.md` — the live V4 prompts that drive Auto-Analyze
- `DATA_CATALOG.md` §5 — finalized per-data-item entries (Human Reference Language + technical name + downstream sharing)

---

## §1. Purpose (one-paragraph summary)

Keyword Clustering is the first workflow in every Project. It ingests the Project's full keyword universe (the All Search Terms, or "AST" — typically thousands to tens of thousands of search terms with volumes) and produces a structured **topic hierarchy** on a 2D canvas. The hierarchy organizes every relevant keyword under topics that match its compound searcher intent, arranged in conversion-funnel order from awareness to decision. Keywords that don't fit the Project's scope are soft-archived to the Removed Terms table with AI-attributed reasoning. The output (canvas + topic hierarchy + keyword placements + removed terms) is the structural foundation that every downstream PLOS workflow consumes when shaping competitor analysis, narrative architecture, brand identity, content production, multi-media assets, and launch strategy.

---

## §2. Data items W#1 produces (12 items)

Each item below has a finalized Human Reference Language phrase (how the director naturally describes it) + technical name (exact table or storage location) + downstream R/W flag. Full per-item detail lives in `DATA_CATALOG.md` §5.x — entries below cross-reference.

HRLs finalized 2026-05-12 in W#1 graduation Data Capture Interview (Step 3 of the graduation ritual).

| # | HRL (canonical equivalents — all are how the director speaks of this item) | Technical name | Downstream R/W | Catalog ref |
|---|---|---|---|---|
| 1 | *"the keywords"* / *"the search terms"* / *"the list of keywords"* | `Keyword` table; FK `projectWorkflowId` | per-consumer at consumer's design interview | §5.1 |
| 2 | *"the topics"* / *"the topic nodes"* / *"the mindmap topics"* / *"nodes"* / *"boxes"* | `CanvasNode` table; FK `projectWorkflowId` | per-consumer | §5.2 |
| 2a | *"searcher intent"* | `CanvasNode.intentFingerprint` (String NOT NULL) | per-consumer | §5.2a |
| 3 | *"Primary Keywords"* (no shorthand — "Primaries" is NOT used) | `CanvasNode.kwPlacements[kwId] === 'p'` (bold dark text on canvas) | per-consumer | §5.3 |
| 4 | *"Secondary Keywords"* (no shorthand — "Secondaries" is NOT used) | `CanvasNode.kwPlacements[kwId] === 's'` (italic purple text on canvas) | per-consumer | §5.4 |
| 5 | *"pathways"* / *"conversion pathways"* | `Pathway` table | per-consumer (likely W#5 Conversion Funnel) | §5.5 |
| 6 | *"sister links"* / *"deferred sister links"* | `SisterLink` table | DEFERRED (managed by future second-pass functionality, not first-pass Auto-Analyze) | §5.6 |
| 7 | *"where the canvas is"* (the position the canvas reloads to) | `CanvasState` table | N/A (UI viewport state, per-(user, project-workflow)) | §5.7 |
| 8 | *"the auto-analyze settings"* / *"the AI prompts"* / *"my Anthropic key"* (LOCKED 2026-04-24) | `UserPreference` table (settings JSON blob) + `localStorage` `aa_apikey_{projectId}` (apiKey only — deliberate security split) | N/A (per-user-per-project settings; key per-browser-per-project) | §5.8 |
| 9 | *"the auto-analyze progress"* / *"where I left off in auto-analyze"* / *"the checkpoint"* / *"the saved run"* | `localStorage` `aa_checkpoint_{Project.id}` (server-side migration pending — see §6 limitation #8) | N/A (per-browser-per-project run progress today) | §5.9 |
| 10 | *"the removed terms"* / *"the archived keywords"* / *"the trash"* — Modal labels "🗑 Removed Terms" (LOCKED 2026-04-24) | `RemovedKeyword` table; FK `projectWorkflowId` | DOWNSTREAM-READ — surfacing for content development decisions on excluded scope | §5.10 |
| 11 | *"Main Terms"* (no shorthand — "MT entries" is RETIRED) | `localStorage` `kst_mt` (server-side migration pending — see §6 limitation #8) | per-consumer | §5.11 |
| 12 | *"Terms In Focus"* (no shorthand — "TIF terms" is RETIRED) | Session-only React state (server-side migration pending — see §6 limitation #8) | per-consumer | §5.12 |

---

## §3. Data items W#1 consumes from upstream

W#1 is the first workflow in every Project — it has **no upstream PLOS workflow** to read from. The only cross-workflow reads are:

- `Project.name` — READ-ONLY (edited on `/projects` page only; shown in workflow chrome)
- `Project.description` — READ-ONLY (same)

---

## §4. Operation vocabulary (Auto-Analyze model output → applier)

Auto-Analyze runs the V4 prompt against per-batch keyword inputs + periodic full-canvas consolidations. The model emits an ordered list of operations per batch / per consolidation; the applier (`src/lib/operation-applier.ts`) consumes them atomically (one batch = one DB transaction). Per-batch and consolidation modes use the same vocabulary except where noted.

**Structural ops (canvas hierarchy):**
- `ADD_TOPIC` — create a new topic node; payload includes title, description, parent_id, relationship (linear/nested), intent_fingerprint
- `MOVE_TOPIC` — reparent a topic (subtree moves with it); payload includes new parent_id + new relationship
- `UPDATE_TOPIC_TITLE` — rename a topic; payload includes new title + intent_fingerprint
- `UPDATE_TOPIC_DESCRIPTION` — edit description only (does NOT require JUSTIFY_RESTRUCTURE on stable topics)
- `DELETE_TOPIC` — remove a topic (requires it be empty of primary placements)
- `MERGE_TOPICS` — combine two topics; payload includes source+target stable IDs, merged title/description, merged_intent_fingerprint; applier auto-reparents children + rewrites sister links to target
- `SPLIT_TOPIC` — split a topic into N siblings/nested topics; payload includes source stable ID + `into[]` (each entry has alias, title, description, keyword IDs going to it, intent_fingerprint); applier requires source to have no child topics first

**Keyword-placement ops:**
- `ADD_KEYWORD` — place a keyword under a topic; payload includes topic stable ID + placement ('p' primary | 's' secondary)
- `MOVE_KEYWORD` — re-place a keyword from one topic to another (or change placement type); payload includes source + target topic stable IDs + new placement
- `REMOVE_KEYWORD` — un-place a keyword (keyword stays in the Keyword table; `sortingStatus` flips to Reshuffled if no remaining placement)
- `ARCHIVE_KEYWORD` — soft-archive a keyword as out-of-scope; writes to `RemovedKeyword` table with `removedSource='auto-ai-detected-irrelevant'` + `aiReasoning`

**JUSTIFY_RESTRUCTURE payload modifier** — applies to UPDATE_TOPIC_TITLE / MOVE_TOPIC / MERGE_TOPICS / SPLIT_TOPIC / DELETE_TOPIC when target topic's stability_score ≥ 7.0. The model must include a justification string that survives admin review.

**Sister-link ops (consolidation mode: REJECTED per 2026-05-05-b Option A invisibility cleanup):**
- `ADD_SISTER_LINK`, `REMOVE_SISTER_LINK` — exist in the schema and applier for future second-pass functionality, but are invisible to the consolidation model (TSV input omits the "Sister Nodes" column; prompt vocabulary strips them; applier rejects them atomically in consolidationMode as a backstop). Existing 82 sister links on Bursitis Test 2 persist as data, managed by the future second-pass functionality run (not yet built).

---

## §5. Cross-Tool Integration Points

**Downstream workflows consume W#1's outputs as follows** (specific R/W flags per consumer are locked at consumer's design interview, NOT here):

| Downstream | What it likely reads from W#1 | Decided? |
|---|---|---|
| W#2 Competition Scraping | Director EXPLICITLY REJECTED W#1 topic hierarchy as W#2 input at 2026-05-04 interview — W#2 is fully self-contained input-wise | ✅ DECIDED (W#2 reads nothing from W#1) |
| W#3 Therapeutic Strategy | Per-topic primary keywords → product family architecture | TBD at W#3 design interview |
| W#4 Brand Identity | Searcher-centric topic titles + intent fingerprints → brand-language alignment | TBD at W#4 design interview |
| W#5 Conversion Funnel & Narrative Architecture | READ topic hierarchy (structural foundation) + WRITE narrative-bridge topics back to canvas (canonical placement TBD — separate W#5 table OR `narrativeBridge` flag on `CanvasNode`); per 2026-04-26 directive captured in ROADMAP | Partial decision: confirmed bidirectional; mechanism TBD |
| W#6 Content Development | Topic hierarchy → content production scope | TBD at W#6 design interview |
| W#7 Multi-Media Assets | Topic hierarchy → asset production scope | TBD at W#7 design interview |
| W#8–W#14 | TBD per individual interview | TBD |

**Reciprocal output declarations from W#1 (per Rule 18):** the data items in §2 ARE the reciprocal declarations — downstream interviews pull from this list rather than asking W#1 "do you produce X?".

---

## §6. Known limitations + deliberate deferrals

1. **Banner UI for cold-start render-layer fix (prereq #1) — 🟡 PARTIAL.** Happy-path verified live 2026-05-03-b across 5–10 hard refreshes. Banner code path covered by unit tests + code review. Natural-flake verification deferred because the #3 withRetry parity fix + #4 Supabase Pro upgrade + #5b atomic-batch fold-in have engineered the natural-flake event close to never-fires (zero flakes across the 86-batch D3 RESUME at scale 2026-05-05-d). If a flake ever fires during normal director use, banner is verified passively.
2. **Sister-link emission deferred to second-pass functionality.** Per the 2026-05-05-b Option A invisibility cleanup, the consolidation model never sees sister links (TSV column omitted + vocabulary stripped + applier backstop). Sister links persist as data on the canvas (82 on Bursitis Test 2) and are managed by a future second-pass functionality run that runs AFTER first-pass Auto-Analyze produces a stable topic hierarchy. Not yet built.
3. **Phase-3 scaling reconsideration captured as ROADMAP.** At canvas 700+ topics with ~3,500 keywords per batch × 50 concurrent workers, the single-transaction connection-hold model in the atomic-batch fold-in becomes its own ceiling. Captured for future architectural work; not blocking today's launch scale.
4. **Action-by-action feedback workflow + Prompt Refining button — EXPLICITLY LAST** per director's 2026-05-03-b directive. ~5–7 sessions estimated. Lives in polish backlog.
5. **Auto-Analyze action history table + per-action undo — NEW HIGH polish item.** `useEmitAuditEvent()` is a Phase-2 stub no-op; no `AuditEvent` table; activity log is in-memory only. Only destructive Reset Workflow exists today. Multi-session feature build (~3–5 sessions). Lives in polish backlog.
6. **Late-run validation-retry rate telemetry — MEDIUM.** At canvas ≥235 topics + >150k input tokens, batches occasionally drop 5 keywords on first attempt; retry recovers cleanly but cost doubles. Instrument first, decide on behavioral fix later. Lives in polish backlog.
7. **Auto-Analyze cost forecasting + credit-balance check — MEDIUM.** No pre-flight Anthropic-credit check; no in-run cost projection. Sliding-window estimator algorithm spec captured. Lives in polish backlog.
8. **Three client-side data items pending server-side migration (surfaced 2026-05-12 in graduation Data Capture Interview).** Main Terms (today: `localStorage kst_mt`), Terms In Focus (today: session-only React state — clears on refresh), and Auto-Analyze checkpoint (today: `localStorage aa_checkpoint_{Project.id}`) all violate the platform-standing 2026-05-08-c "no matter where the user logs in, they can pick up where they left off" principle. Director's 2026-05-12 decision: keep Data Contract v1 locked with current technical names; capture migrations in polish backlog; bump to v2 per Rule 23 versioned-contract pattern when migrations ship. Anthropic API key (`localStorage aa_apikey_{projectId}`) is the deliberate exception — server-side storage of a user's third-party secret is a meaningful security delta from the 2026-04-24 design call and stays client-side. See `KEYWORD_CLUSTERING_POLISH_BACKLOG.md` §"Pending server-side migrations" for migration scope + estimated session counts.

---

## §7. Resume Prompt (Rule 22 re-entry template)

When the director wants to return to W#1 for any reason — bug fix, polish work, new feature, downstream consumer needs clarification — they paste the following as the first message of a fresh Claude Code session. This avoids loading the heavy 4600-line Archive doc by default; the Data Contract (this doc) is loaded instead.

**Step 1 — In a Codespaces terminal, switch to `main` and pull the latest:**

```
cd /workspaces/brand-operations-hub && git fetch origin && git checkout main && git pull --rebase origin main
```

**Step 2 — Launch Claude Code:**

```
claude
```

**Step 3 — As your first message, paste this (edit the bracketed reason for your specific revisit):**

```
Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it.
Today's task: return to Workflow #1 (Keyword Clustering) — [your specific
reason / what you want to do]. This is a graduated-tool re-entry session,
NOT a transition session. Verify branch state with
`git branch --show-current` before any doc reads — should be `main`.

Per HANDOFF_PROTOCOL.md Rule 22 (Graduated-Tool Re-Entry Protocol):

1. Run the mandatory start-of-session sequence (Group A docs + branch
   verification per CLAUDE_CODE_STARTER.md Step 2).
2. Additionally load these Group B docs:
   - docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md  (this doc — read fully)
   - docs/KEYWORD_CLUSTERING_ARCHIVE.md  (skim table of contents; load
     specific STATE blocks only if the change requires them)
   - docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md  (read fully if your task
     touches a polish item)
3. Per Rule 21, scan ROADMAP.md + DATA_CATALOG.md for any director
   directives addressed to W#1 captured since graduation.
4. Per Rule 23, run a Change Impact Audit before any code change: identify
   affected data items, look up downstream consumers in DATA_CATALOG.md
   Cross-Tool Data Flow Map §7.2.1, classify the change
   (Additive / Compatible-modifying / Breaking), surface the audit before
   coding.
5. Produce the drift check with this added context. Wait for go-ahead.
```

---

## §8. Pointer to the Archive

Full history of W#1's build — every Scale Session, every Defense-in-Depth audit, every Pivot rationale, every bug fix, every STATE block from sessions 2026-04-15 through 2026-05-12 — lives in `docs/KEYWORD_CLUSTERING_ARCHIVE.md`. The Archive is heavy (~4600 lines) and intentionally not loaded by default at session start; Rule 22 re-entry loads it selectively when the change requires historical context.

If a future Claude is confused about WHY a particular code choice was made (e.g., "why is the consolidation TSV 8 columns and not 9?"), the Archive's STATE blocks are the source of truth. The Data Contract (this doc) describes WHAT W#1 produces; the Archive describes HOW it got there.
