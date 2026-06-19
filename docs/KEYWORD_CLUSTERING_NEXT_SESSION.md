# W#1 next session — Keyword Clustering

**Written:** 2026-06-19 (end of the Variant B planning + Step-0 foundation session — the implementation plan in `Workflow 1 AI V2/` is APPROVED IN PRINCIPLE and Step 0 [the pure foundation libs] is BUILT + test-passing; this file now queues **Variant B ("AI 2") — Step 1: the GATED schema delta**). Prior queued task (H-1 slice 4) is DEFERRED — see note below. Future W#1 sessions update this file at end-of-session per HANDOFF_PROTOCOL §4 Step 1.

**For:** the next W#1 (Keyword Clustering graduated tool) re-entry session.

**Queued next task:** **VARIANT B ("AI 2") — STEP 1: the GATED schema delta.** Variant B is the new intent-driven keyword→funnel pipeline added ALONGSIDE the existing Manual / AI 1 keyword-clustering modes for A/B testing on identical input (it must be byte-for-byte non-disruptive to Manual and AI 1). The full approved plan + all decisions live in **`Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md`** (the canonical in-repo record) alongside the design package (`README.md`, `variantB-technical-spec.md`, `variantB-binding-addendum.md`, `rulebook-v0.2.md`).

> **⚠️ GATED FIRST ACTION — DO NOT push the schema without director approval.** Step 1 begins with the schema delta: nullable `CanvasNode` columns (`zone`, `stage`, `verticalRank`, `siblingOrder`, `isSpine`, `variantBMeta`) + a new `CLREntry` table + a nullable `Project.nicheSlug`. Per `docs/MULTI_WORKFLOW_PROTOCOL.md`: **(1) present the delta for explicit director approval; (2) claim the ROADMAP "Current Active Tools" schema-change-in-flight flag IMMEDIATELY BEFORE the push (NOT before — it was deliberately left "No" at the end of the planning session); (3) `prisma db push` (no migrations dir); (4) flip the flag back to No after.** No `prisma db push` until both approval AND the flag-claim are done.

> **NOTE (2026-06-19 — Variant B STEP 0 ✅ DONE + test-passing, on disk, committed):** the pure foundation libs are built under `src/lib/variant-b/`: `types.ts` (pipeline shapes), `carrier-dedup.ts` (rulebook §6 — 17 node:test ✅), and `rulebook.ts` (the universal-layer rulebook encoded as typed constants — descriptors §1, zones/stages §2/§3, placement rules R1–R11 §5, ordering §10 — 22 node:test ✅ including the reviewer-round-2 placement fixes). `tsc` clean for `variant-b`. These are isolated new files — they do NOT touch Manual or AI 1.

> **NOTE (2026-06-19 — H-1 SLICE 4 DEFERRED, still OPEN):** the previously-queued W#1 task — H-1 slice 4 (action-history before-state enrichment + the History context fix) — is DEFERRED, NOT cancelled. The director chose Variant B as the immediate next priority. H-1 slice 4 (and the per-action undo engine that follows it) remain OPEN in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 and should be picked up after Variant B's first build, or sooner if the director re-prioritizes (see "How to override").

---

## Branch

`main`

W#1 is graduated and lives on `main` per Rule 22. Variant B is additive W#1 (keyword-clustering-surface) work and is built on `main`. Verify with `git branch --show-current` immediately after `./resume-workflow 1`; should be `main`. If you're on a `workflow-N-<slug>` branch, STOP and surface to director.

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it.
Today's task: return to Workflow #1 (Keyword Clustering) to build **Variant B ("AI 2") — Step 1: the GATED schema delta** (then continue the Variant B build order). This is a graduated-tool re-entry session, NOT a transition session. Verify branch state with `git branch --show-current` before any doc reads — should be `main`.

Per HANDOFF_PROTOCOL.md Rule 22 (Graduated-Tool Re-Entry Protocol):

1. Run the mandatory start-of-session sequence (Group A docs + branch verification per CLAUDE_CODE_STARTER.md Step 2). Because Variant B requires a schema change, ALSO read `docs/MULTI_WORKFLOW_PROTOCOL.md` (the schema-owner coordination rules) and check the ROADMAP "Current Active Tools" table — confirm no other workflow holds the schema-change-in-flight flag before you claim it.
2. Read the Variant B sources of truth (Group B for this task):
   - **`Workflow 1 AI V2/VARIANT_B_IMPLEMENTATION_PLAN_APPROVED.md`** (read fully — the approved plan, decisions log, live-code reconciliation, schema delta §3, build order §4, safety §5, non-negotiables §6, the reviewer-round-2 placement corrections §8, and the wrap-up/resume spec §9).
   - `Workflow 1 AI V2/README.md`, `variantB-technical-spec.md`, `variantB-binding-addendum.md` (precedence: addendum > spec), and `rulebook-v0.2.md` (authority for all funnel rules/ordering).
   - The Step-0 code already on disk: `src/lib/variant-b/types.ts`, `carrier-dedup.ts`, `rulebook.ts` (+ their `.test.ts`).
3. Per Rule 23, run a Change Impact Audit before the schema change. The delta is ADDITIVE: nullable `CanvasNode` columns (AI 1 never references them), a brand-new `CLREntry` table, and a nullable `Project.nicheSlug` — no existing read/write/render path changes. Classify Additive; confirm against `DATA_CATALOG.md`.
4. **GATED:** present the exact schema delta (plan §3) to the director for explicit approval. Only after approval: claim the schema-change-in-flight flag in the ROADMAP "Current Active Tools" table, run `prisma db push`, then flip the flag back to No. NEVER push before approval + flag-claim.
5. After the schema lands: seed the universal rulebook from `src/lib/variant-b/rulebook.ts` into `CLREntry` (idempotent seed), build `rulebook-assembly.ts` (the runtime read-path — see locked resolution #1 below), then the "Build niche rulebook" diagnostic behind its cost-confirm button.
6. Then the remaining build order (plan §4): remaining pure libs (intent-enumeration, topic-labeling, conservative-merge, hierarchy/shells, ordering, placement, reorg-sweeps, provenance, prompts) → client run-loop + overlay (`components/variant-b/`) → three-state Manual/AI 1/AI 2 toggle + keyword-clone → materialize → /canvas/rebuild → the A/B comparison view.
7. **Locked resolutions to honor (do NOT re-litigate):**
   - **(1) Runtime read-path = the UNION.** Every pure lib + every prompt-builder receives an `AssembledRulebook` = universal(code `rulebook.ts`) ∪ active-niche ∪ approved-candidate DB `CLREntry` rows, scoped to `universal` + `niche:<project.nicheSlug>`. The libs never import niche-aware constants directly, so DB niche aliases reach carrier-dedup, value-ladders reach hierarchy/shells, and niche/approved placement edge-rules reach placement.
   - **(2) Generous/high-recall intent enumeration** — the Step-3 prompt instructs enumerating EVERY plausible intent; over-enumeration is acceptable (spurious low-volume intents are pruned downstream); a missed intent is unrecoverable. Validators flag UNDER-enumeration (omission) + fabrication; they never penalize over-enumeration and never auto-delete.
   - **(3) Reorg-sweep cadence configurable + guaranteed final sweep** (`variantB.reorgCadence`); sweeps run on the condensed skeleton + one parent-slice — never re-feed the whole tree.
   - **(4) A/B comparison = a SEPARATE read-only view** (its own tab/panel), NOT a fourth value of the Manual / AI 1 / AI 2 control (which stays three-state).
   - **(5) The one non-negotiable:** NO growing-canvas loop — per-batch AI payloads stay small + flat regardless of tree size; never serialize the accumulated tree into an analysis prompt (that's AI 1's `buildOperationsInputTsv` bottleneck, which Variant B exists to remove).
8. Plan the schema-delta step + present it WITH the director (Rule 14f forced-picker before the push, per `feedback_plan_output_shape_before_building`). Produce the drift check with this added context. Wait for go-ahead.

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

Variant B was queued as the immediate next W#1 task by explicit director direction during the 2026-06-19 planning session (the plan was approved in principle, Step 0 was built + tested, and the director directed a clean continuity wrap-up queuing Variant B Step 1). H-1 slice 4 was the prior queued task and is deferred (still OPEN). The schema-change-in-flight flag was deliberately left "No" at end of the planning session — it must be claimed in the NEXT session immediately before the gated `prisma db push`, never earlier.
