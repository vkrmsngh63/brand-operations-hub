# W#1 next session — Keyword Clustering

**Written:** 2026-06-19-b (end of the Variant B Step-1 session — the GATED §3 schema delta is director-APPROVED + APPLIED, the seed + assembler runtime read-path is built, and the first two Step-2 thinking-libs [intent-enumeration + topic-labeling] are built + test-passing; this file now queues **Variant B ("AI 2") — Step 2: the remaining pure pipeline libs, `conservative-merge.ts` next**). H-1 slice 4 is DEFERRED — see note below. Future W#1 sessions update this file at end-of-session per HANDOFF_PROTOCOL §4 Step 1.

**For:** the next W#1 (Keyword Clustering graduated tool) re-entry session.

**Queued next task:** **VARIANT B ("AI 2") — STEP 2: the remaining pure pipeline libs, in plan §4 order.** Step 1 is done (the schema delta LANDED; seed + assembler built). Step 2 continues the build with the remaining PURE libs — **`conservative-merge.ts` (next)** → `hierarchy.ts` → `ordering.ts` → `placement.ts` → `reorg-sweeps.ts` → `provenance.ts` → `prompts.ts`. Each is `node --test`-covered and each takes the assembled rulebook as a PARAMETER (they never import niche-aware constants directly). The full approved plan + all decisions live in **`Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md`** §4 (the build order) alongside the design package (`README.md`, `variantB-technical-spec.md`, `variantB-binding-addendum.md`, `rulebook-v0.2.md`).

> **✅ STEP 1 DONE (2026-06-19-b):** the GATED §3 schema delta was director-APPROVED + APPLIED via `prisma db push` (additive — 6 nullable `CanvasNode` cols `zone/stage/verticalRank/siblingOrder/isSpine/variantBMeta` + the new `CLREntry` table [DB-backed versioned rulebook, scoped `universal|niche:<slug>`] + nullable `Project.nicheSlug`; the schema-owner flag was claimed No→Yes → push against live Supabase, no data touched → flipped back Yes→No). The runtime read-path is built: `seed-rulebook.ts` (idempotent universal seed, 9 node:test ✅) + `rulebook-assembly.ts` (THE union read-path `assembleRulebook` + free helpers + a thin DB adapter, 16 node:test ✅). The first two Step-2 thinking-libs are built: `intent-enumeration.ts` (14 ✅) + `topic-labeling.ts` (13 ✅). Full `src/lib/variant-b` suite = 91 node:test ✅; root tsc clean.

> **⚠️ NO SCHEMA CHANGE NEEDED for any remaining Step-2 lib** — they are PURE functions + READS; the schema-owner flag STAYS No. Do NOT claim the flag this session unless a genuinely new schema need surfaces (it should not). The AI-spend diagnostic (`diagnostic.ts` + its thin route, behind the "Build niche rulebook" cost-confirm button) + the candidate approve/reject list + any user-visible screen change remain GATED — re-confirm WITH the director before building those.

> **NOTE (2026-06-19-b — H-1 SLICE 4 DEFERRED, still OPEN):** the previously-queued W#1 task — H-1 slice 4 (action-history before-state enrichment + the History context fix) + the per-action undo engine that follows it — is DEFERRED, NOT cancelled. The director chose Variant B as the immediate priority. H-1 slice 4 remains OPEN in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 and is the (a.142) task, queued behind Variant B (see "How to override").

---

## Branch

`main`

W#1 is graduated and lives on `main` per Rule 22. Variant B is additive W#1 (keyword-clustering-surface) work and is built on `main`. Verify with `git branch --show-current` immediately after `./resume-workflow 1`; should be `main`. If you're on a `workflow-N-<slug>` branch, STOP and surface to the director.

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it.
Today's task: return to Workflow #1 (Keyword Clustering) to build **Variant B ("AI 2") — Step 2: the remaining pure pipeline libs (`conservative-merge.ts` first)**. This is a graduated-tool re-entry session (Rule 22), NOT a transition session. Verify branch state with `git branch --show-current` before any doc reads — should be `main`.

Per HANDOFF_PROTOCOL.md Rule 22 (Graduated-Tool Re-Entry Protocol):

1. Run the mandatory start-of-session sequence (Group A docs + branch verification per CLAUDE_CODE_STARTER.md Step 2). **NO schema change is expected this session** — the Step-2 libs are pure + reads — so you do NOT need to claim the schema-owner flag; still glance at the ROADMAP "Current Active Tools" table to confirm no other workflow holds it.
2. Read the Variant B sources of truth (Group B for this task):
   - **`Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md`** §4 (the build order — Step 2 libs are listed with their per-lib contracts) + §5 (safety) + §6 (non-negotiables) + §8 (the reviewer-round-2 placement corrections that `placement.ts` must honor).
   - `Workflow 1 AI V2/README.md`, `variantB-technical-spec.md`, `variantB-binding-addendum.md` (precedence: addendum > spec), and `rulebook-v0.2.md` (authority for all funnel rules/ordering).
   - The Step-0/Step-1 code already on disk: `src/lib/variant-b/{types,carrier-dedup,rulebook,seed-rulebook,rulebook-assembly,intent-enumeration,topic-labeling}.ts` (+ their `.test.ts`). The assembler (`rulebook-assembly.ts`) is THE read-path every new lib consumes via its `AssembledRulebook` parameter.
3. Build the Step-2 libs in plan §4 order, each `node --test`-covered, each taking the assembled rulebook as a parameter:
   - **`conservative-merge.ts` (NEXT)** — Step 5: candidate generation by fingerprint bucket + normalized-token-overlap neighborhood (non-vector; never all-pairs); merge iff identical profile; containment ⇒ nest-candidate, never merge. Merge policy read from the assembled rulebook.
   - then `hierarchy.ts` (Step 6 — strict-specialization nesting + demand-aware shell generation by climbing value-ladders; mark `isSpine`), `ordering.ts` (§10 — `verticalRank`=zone→stage, `siblingOrder`=natural-sequence hint else descending volume), `placement.ts` (§5 — evaluate placement rules by ascending priority, first match wins; no-match ⇒ needs-placement queue, NEVER guess), `reorg-sweeps.ts` (§11 — sweeps on the condensed skeleton + one parent-slice; cadence config knob `variantB.reorgCadence` + a guaranteed final full sweep), `provenance.ts` (by_keyword/by_topic index + `niche_dedup_total_volume` + per-topic `volume_full`), `prompts.ts` (versioned code-constant templates that inject the ASSEMBLED rulebook at runtime; carry the Lessons-marker line).
4. **Locked resolutions to honor (do NOT re-litigate):**
   - **(1) Runtime read-path = the UNION.** Every pure lib + every prompt-builder receives an `AssembledRulebook` = universal(code `rulebook.ts`) ∪ active-niche ∪ approved-candidate DB `CLREntry` rows. The libs never import niche-aware constants directly — they read the assembled object (built by `rulebook-assembly.ts`, already on disk).
   - **(2) Generous/high-recall intent enumeration** — over-enumeration is acceptable; validators flag UNDER-enumeration (omission) + fabrication; they never penalize over-enumeration and never auto-delete. (Already encoded in `intent-enumeration.ts`.)
   - **(3) Reorg-sweep cadence configurable + guaranteed final sweep** (`variantB.reorgCadence`); sweeps run on the condensed skeleton + one parent-slice — never re-feed the whole tree.
   - **(4) A/B comparison = a SEPARATE read-only view** (its own tab/panel), NOT a fourth value of the Manual / AI 1 / AI 2 control (which stays three-state).
   - **(5) The one non-negotiable:** NO growing-canvas loop — per-batch AI payloads stay small + flat regardless of tree size; never serialize the accumulated tree into an analysis prompt.
5. **GATED — re-confirm WITH the director before building (Rule 14f):** the AI-spend diagnostic (`diagnostic.ts` + its thin route, behind the "Build niche rulebook" cost-confirm button), the candidate approve/reject list, and any user-visible screen change. The Step-2 PURE libs are NOT gated — build them straight through with test coverage.
6. Plan the output/coverage shape WITH the director for any lib where a design choice is load-bearing (e.g. `placement.ts`'s misfit taxonomy, `hierarchy.ts`'s explosion guard) per `feedback_plan_output_shape_before_building`.

## How to override

If Variant B isn't what you want to do this W#1 session:
- **Edit this file before running `./resume-workflow 1`.** Replace the Variant B references in the `Queued next task` line + `Launch prompt` section with whatever item you want — e.g. resume **H-1 slice 4** (before-state enrichment; the deferred action-history fix) or another item from `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`.
- **OR — tell Claude in your CURRENT session "update KEYWORD_CLUSTERING_NEXT_SESSION.md to queue <task>"** before exiting, and Claude will rewrite this file.
- **OR — use the escape-hatch path** (manual 3-step `cd + git checkout main + claude + paste launch prompt`).

## How items get queued here

Per HANDOFF_PROTOCOL §4 Step 1 W#1-additional-row:
- When the director adds a new W#1 item and picks "do it next session," Claude updates this file with the new task.
- When a W#1 session completes work, the end-of-session protocol picks the next-highest-priority OPEN item (or fires the §4 Step 1c "no obvious next task" forced-picker).

## Why this pointer was written this way (debug aid)

Variant B Step 2 is the named continuation of the (a.143) build — Step 1 (the schema delta + seed + assembler) landed 2026-06-19-b, and the next item in the plan §4 build order is the remaining Step-2 pure libs (conservative-merge first). The §4 Step 1c forced-picker did NOT fire (the next task is named by the plan, not chosen). H-1 slice 4 was the prior queued task and is deferred (still OPEN). The schema-owner flag is "No" and STAYS No — no remaining Step-2 lib needs a schema change; only the later GATED diagnostic + screen surfaces would, and those re-confirm with the director first.
