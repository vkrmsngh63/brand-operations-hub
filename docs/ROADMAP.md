# ROADMAP
## Product Launch Operating System (PLOS) — Development Execution Plan

**Last updated:** April 29, 2026 (Defense-in-Depth Audit Implementation Session 1 — Option β. Shipped: ESLint custom rule `no-prop-reads-in-runloop` + 4 `@runloop-reachable` annotations; runtime invariant R2 (post-Reconcile-Now diff-empty WARN); server-side guards G1 (`/canvas/rebuild` payload-sanity, 50% threshold) + G2 (`/canvas/nodes` GET retry-on-transient for P1001/P1002/P1008/P2034 with backoff [100ms, 500ms]). 30 new src/lib unit tests + 13 ESLint rule tests; build clean; lint clean for the new rule. R3 deferred to Scale Session B; R4 deferred per director Q2 = Option B. ROADMAP "🛡️ Redundancy + Defense-in-Depth Audit" item flipped from 📋 DESIGNED ONLY to 🔄 IN PROGRESS (Session 1 of 2 done). Active Tools table row for W#1 updated.)
**Last updated in session:** session_2026-04-29-b_defense-in-depth-impl-1 (Claude Code)
**Previously updated in session:** session_2026-04-29_defense-in-depth-audit-design (Claude Code)
**Previously updated in session:** session_2026-04-28_canvas-blanking-and-closure-staleness-fix (Claude Code)
**Previously updated in session:** session_2026-04-28_deeper-analysis-and-fix-design (Claude Code)
**Previously updated in session:** session_2026-04-28_scale-session-0-outcome-c-and-full-run-feedback (Claude Code)
**Previously updated in session:** session_2026-04-27_input-context-scaling-design (Claude Code)
**Previously updated in session (earlier):** session_2026-04-27_v3-prompt-small-batch-test-and-context-scaling-concern (Claude Code)
**Previously updated in session:** session_2026-04-26_workflow-transition-architecture-and-v3-prompt-refinement (Claude Code)
**Previously updated in session:** session_2026-04-26_phase1-polish-bundle (Claude Code)
**Previously updated in session (earlier):** session_2026-04-25_phase1g-test-followup-part3-pivot-session-D (Claude Code)
**Previously updated in session (earlier):** session_2026-04-25_phase1g-test-followup-part3-pivot-session-C (Claude Code)
**Previously updated in session (earlier):** session_2026-04-25_phase1g-test-followup-part3-pivot-session-B (Claude Code)
**Previously updated in session (earlier):** session_2026-04-25_phase1g-test-followup-part3-pivot-session-A (Claude Code)
**Previously updated in session (earlier):** session_2026-04-25_phase1g-test-followup-part3-session3b-verify (Claude Code)
**Previously updated in session (earlier):** session_2026-04-25_phase1g-test-followup-part3-session3b (Claude Code)
**Previously updated in session (earlier):** session_2026-04-24_phase1g-test-followup-part3-session3a (Claude Code)
**Previously updated in session (earlier):** session_2026-04-24_phase1g-test-followup-part3-session2b (Claude Code)
**Previously updated in session (earlier):** session_2026-04-24_phase1g-test-followup-part3-session2 (Claude Code)
**Previously updated in session (earlier):** session_2026-04-20_phase1g-test-followup-part3 (Claude Code)
**Previously updated in session (earlier):** session_2026-04-19_phase1g-test-followup-part2 (Claude Code)
**Previously updated (claude.ai era):** https://claude.ai/chat/75cc8985-b70a-49f4-8b64-444c34ef541f

**Scale context (added 2026-04-17):** PLOS targets 500 Projects/week with 50 concurrent workers in Phase 3, with headroom for 5,000 Projects/week in Phase 4. See `PLATFORM_REQUIREMENTS.md §1` for full scale targets. All roadmap items must be evaluated against Phase 3 as the minimum target scale.

---

## Status legend
- ✅ COMPLETE
- 🟡 CODE COMPLETE (not tested)
- 🔄 IN PROGRESS
- ❌ NOT STARTED
- 📋 DESIGNED ONLY
- 🎯 NEXT PRIORITY

---

## Current Active Tools

**Single source of truth for parallel workflow state.** Every session reads this at start; every session updates its own row at end-of-session. Schema-change-in-flight flag is the coordination point — when "Yes" for any workflow, no other workflow's session may modify `prisma/schema.prisma`. See `MULTI_WORKFLOW_PROTOCOL.md` for the full coordination rules.

| Workflow | Status | Branch | Last Session | Next Session | Schema-change in flight? |
|---|---|---|---|---|---|
| W#1 Keyword Clustering | 🔄 Active dev — stabilization | `main` | 2026-04-29-b defense-in-depth-impl-1 (Option β Session 1: shipped ESLint rule `no-prop-reads-in-runloop` + 4 annotations on AutoAnalyze.tsx; R2 post-Reconcile-Now diff-empty WARN; G1 `/canvas/rebuild` payload-sanity at 50% threshold; G2 `/canvas/nodes` GET retry on P1001/P1002/P1008/P2034 with backoff [100ms,500ms]; 30 new src/lib tests + 13 ESLint rule tests; build clean. R3+G3 deferred to Scale Session B; R4 deferred per director Q2=B) | Implementation Session 2 of Defense-in-Depth Audit (Option β cont.: forensic NDJSON log + run-start pre-flight P1-P10; ~3-4 hrs) — OR (b) Scale Session B build / (c) Phase-1 UI polish / (d) Action-by-action feedback design | No |
| W#2 Competition Scraping & Deep Analysis | 🆕 About to start | `workflow-2-competition-scraping` (created by W#2's first session) | (none yet) | Workflow Requirements Interview per HANDOFF_PROTOCOL Rule 18 | No |
| W#3 Therapeutic Strategy | Not yet started | — | — | — | — |
| W#4–14 | Not yet started | — | — | — | — |

**Status-cell vocabulary:** 🆕 about-to-start / 🔄 active-dev / 🛠 schema-change-session / ✅ graduated / ⏸ paused / — no-current-work. See `MULTI_WORKFLOW_PROTOCOL.md` §5 for definitions.

---

## The 4-phase model (canonical)

Per `PLATFORM_REQUIREMENTS.md §11`, platform development is structured around four phases. This roadmap restructures all roadmap items into these phases.

```
Phase 1 — Admin-solo tooling
  Goal: admin runs 50 Projects/week solo through all 14 workflows
  Gate to Phase 2: all 14 workflow tools built; one end-to-end Project completed

Phase 2 — Multi-user infrastructure
  Goal: platform ready for worker onboarding
  Gate to Phase 3: infrastructure complete; 1 test worker running successfully

Phase 3 — Worker ramp
  Goal: scale from 1 test worker to 50 workers at 500 Projects/week
  Gate to Phase 4: stable 500/week operation

Phase 4 — Scale hardening
  Goal: scale from 500/week to 5,000/week
  Gate: ongoing
```

---

## Current status overview

| Phase / Milestone | Status |
|---|---|
| **Platform foundations** (Phases 0, 1a–1f, 1g-rebuild, 1-foundation, Phase 2 rebrand, Phase D) | ✅ COMPLETE |
| **Phase M** (DB refactor + API rewrite + UI rework) | ✅ COMPLETE — All 9 checkpoints + 9.5 bug-fix deployed to vklf.com |
| **Phase 1 — Admin-solo tooling** | 🔄 IN PROGRESS — Keyword Clustering (workflow 1) is the first tool; 13 more to build |
| **Phase 2 — Multi-user infrastructure** | ❌ NOT STARTED — architectural sketches exist; no build work |
| **Phase 3 — Worker ramp** | ❌ NOT STARTED |
| **Phase 4 — Scale hardening** | ❌ NOT STARTED |

---

## 🔔 SCALE SESSION 0 — OUTCOME C FIRED 2026-04-28 (build path activated)

The empirical validation pre-step of `INPUT_CONTEXT_SCALING_DESIGN.md` (Scale Session 0) ran 2026-04-28. Director ran a full-Bursitis V3 Auto-Analyze on Sonnet 4.6 (151 of 281 batches completed before stopping) plus a separate Opus 4.7 cost test at run start.

**Empirical findings:**

1. **Sonnet 4.6 hit the 200k context wall at batch 151** — input grew from 19,929 tokens (empty canvas) → 220,091 tokens (canvas of ~700 topics). The wall was reached well before the run could complete; an additional ~130 batches would have been needed.
2. **Opus 4.7 was economically prohibitive** — director's cost test at run start showed per-batch costs approached or exceeded $1, vs. ~$0.30–$0.85 on Sonnet 4.6. Director switched back to Sonnet 4.6.
3. **Per-batch cost on Sonnet 4.6 grew monotonically** with canvas size (~$0.20 → ~$0.85), driven entirely by input-token growth (the prompt body itself stays cached at ~18k tokens). Total run cost: ~$70–80 for 54% completion.

**Trigger conditions met (per `INPUT_CONTEXT_SCALING_DESIGN.md §0`):**
- Outcome C: V3 + Opus 4.7 still hits wall or has unacceptable cost — **YES, fired**.
- Threshold (b): a production project's canvas exceeded ~600 topics under standard 200k window — **YES, the Bursitis run reached ~700 topics**.

**Effect on roadmap:**
- **Scale Session B is now the next-priority forward action** for Workflow #1 build work (per `INPUT_CONTEXT_SCALING_DESIGN.md §6` locked plan): schema migration adding `intentFingerprint` column + applier extension + AI-generated backfill script.
- Scale Sessions C, D, E follow B in sequence per the locked plan.

**Three additional findings from the same run that are NOT scaling-related (separate sections below):**
- 🚨 **HIGH-severity canvas-blanking bug** (batches 70 + 134) — wiring layer intermittently sent ~20k tokens of input (no canvas state) instead of full canvas; model rebuilt from scratch; reconciliation flipped 84 keywords/event to Reshuffled status; 168 keywords across the two events stuck in Reshuffled forever because batch queue is fixed at run-start. NOT polish — see "Canvas-blanking bug" section below.
- 4 new Phase-1 polish items (Mid-run batch queue refresh + Skeleton View on canvas + AST split-view row alignment + Topics table row numbers) — see "NEW Phase-1 polish item" entries below.
- 2 new architectural design items (action-by-action feedback + second-pass refinement workflow; intelligent hybrid cost/quality strategy) — see new sections below.

---

## COMPLETED work (summary — pre-April-17-reveal)

These phases/milestones are complete and remain valid after the April 17 architectural reveal. The reveal did NOT invalidate any prior work — all code, schema, and infrastructure built so far is kept.

- **Phase 0:** Foundation (GitHub, Codespaces, Next.js, Supabase, Vercel, Domain)
- **Phase 1a–1f:** Core Keyword Clustering migration
- **Phase 1g:** Auto-Analyze system code (code complete; not yet tested — Phase 1g-test remains)
- **Phase 1-foundation:** Security (JWT auth) + bulk APIs + code quality
- **Phase 1g-rebuild:** Atomic canvas rebuild
- **Phase 2 (rebrand):** PLOS Rebrand + 3-tier navigation + Think Tank + Admin Notes (PMS + Think Tank)
- **Phase D (documentation overhaul):** 11-document handoff system with Document Lifecycle Management (DLMS)
- **Phase M Checkpoints 1–4 (2026-04-16):** Database schema refactor (Project + ProjectWorkflow + workflow-data tables on projectWorkflowId)
- **Phase M Checkpoint 5 (2026-04-17):** All server-side API routes aligned with new schema; `npm run build` clean; committed at `14d68e7`
- **Phase M Checkpoint 6 (2026-04-17, chat `7a745b12-...`):** Built `/projects` page and `/projects/[projectId]` detail page. Scale-aware from day one: live search (name + description), sort (last activity / name / created), filter by completion status and workflow stage, infinite scroll, edit pencil + full Edit Project modal, two-step delete confirm, inline New Project form, expand-accordion showing 14 workflow cards with Mark Done/Reopen toggle, empty state, no-results state, toast notifications. Visual vocabulary matches `/dashboard` and `/plos`. All CRUD saves to database via Ckpt 5 API. Committed locally; not deployed (Phase M hold window). Commit: `3b69cf2`.
- **Phase M Checkpoint 7 (2026-04-17, chat `7e0b8456-...`):** Refactored Keyword Clustering from `/keyword-clustering` (dual-state page with built-in Projects List) to `/projects/[projectId]/keyword-clustering` (single-state, Project pre-picked from URL). Moved `components/` folder alongside the new page wrapper. Wrote new 164-line `page.tsx` (down from 225) that reads projectId from URL, fetches Project name, shows friendly error on 404/403, and renders the workspace. Top-bar Back button returns to `/projects/[projectId]` detail page. Deleted old `/keyword-clustering` folder. Also cleaned up stray `src/app/projects/projectId/` folder (no brackets) left behind from Ckpt 6. `npm run build` passed cleanly. Commit: `5cc10c5`. Not pushed (still Phase M deploy hold). **`/plos` Keyword Analysis card still points at deleted route — will 404 if clicked; fix is Ckpt 8's scope.**
- **Phase M Checkpoint 8 (2026-04-17, chat `fc8025bf-...`):** Admin Notes added to Dashboard and PLOS pages; broken Keyword Analysis card on `/plos` rewired to `/projects`. Physical changes: (1) `src/components/AdminNotes.tsx` — `SystemKey` type extended from `"think-tank" | "pms"` to `"think-tank" | "pms" | "dashboard" | "plos"` (line 34; only change to the component). (2) New file `src/app/dashboard/notes/page.tsx` (11 lines; mirror of PMS notes page — `system="dashboard"`, `systemLabel="Dashboard"`, `systemIcon="🚀"`, `backRoute="/dashboard"`). (3) New file `src/app/plos/notes/page.tsx` (11 lines; same pattern — `system="plos"`, `systemLabel="Product Launch Operating System"`, `systemIcon="🚀"`, `backRoute="/plos"`). (4) `src/app/dashboard/page.tsx` — 📝 Notes button added to top-right flex container, immediately left of Sign Out (+17 lines). (5) `src/app/plos/page.tsx` — Keyword Analysis card `route` changed from `"/keyword-clustering"` to `"/projects"`; 📝 Notes button added to top bar, grouped with Sign Out in a right-side flex wrapper (+5 net lines). `npm run build` passed cleanly in 18.5s; 17/17 static pages, zero TypeScript errors, both `/dashboard/notes` and `/plos/notes` appear as routes in the build output. Committed locally as `ac62a3a`; branch now 4 commits ahead of origin/main. Not pushed — Phase M deploy hold continues through Ckpt 9. **Pre-existing leftovers in git status** (13 files from Ckpts 1–5) were unstaged via `git reset HEAD` per Option A (clean split); they remain in the working tree for Ckpt 9 cleanup. See `CORRECTIONS_LOG.md` for the canonical inventory and handling procedure. **Mistake logged:** Pattern 11 recurrence (fourth consecutive chat) — Claude asked user to "paste the file" without a concrete command; Pattern 11 mitigation updated to cover all imperative instructions, not just decision questions.

---

## ✅ PHASE M — ALL CHECKPOINTS COMPLETE (2026-04-17)

### Final state
- **Database:** ✅ New Project + ProjectWorkflow schema live in Supabase
- **Server code (API routes):** ✅ Rewritten for new schema; deployed (Ckpt 5)
- **`/projects` page:** ✅ Scale-aware list page deployed (Ckpt 6)
- **`/projects/[projectId]` detail page:** ✅ Built (Ckpt 9.5 — discovered missing post-deploy) + deployed
- **`/projects/[projectId]/keyword-clustering`:** ✅ Single-state KC workspace deployed (Ckpt 7)
- **`/keyword-clustering` (old dual-state route):** ✅ Deleted (Ckpt 7)
- **`/dashboard/notes` + Dashboard 📝 Notes button:** ✅ Deployed (Ckpt 8; note-creation fixed in Ckpt 9.5)
- **`/plos/notes` + PLOS 📝 Notes button:** ✅ Deployed (Ckpt 8; note-creation fixed in Ckpt 9.5)
- **`/plos` Keyword Analysis card:** ✅ Rewired to `/projects` (Ckpt 8), deployed
- **`/docs/` handoff docs folder:** ✅ Created + populated with 15 docs (Ckpt 9)
- **Legacy `src/app/HANDOFF.md` + `ROADMAP.md`:** ✅ Deleted (Ckpt 9)
- **All 51 `.bak` files:** ✅ Deleted (Ckpt 9); `.gitignore` now catches future ones
- **Live site:** ✅ vklf.com running Phase M code; full happy-path verified working

### Checkpoint completion summaries
- **Ckpt 9 (2026-04-17, chat `75cc8985-...`):** Deploy + cleanup + `/docs/` setup. Committed as `3a2b928`: 58 files changed, 5131 insertions, 26869 deletions. Pushed as part of a 5-commit push (Ckpts 5-9 together). Vercel build "Ready" in ~2 min. Visual verification on vklf.com passed for: login, Dashboard + 📝 Notes nav, PLOS + 📝 Notes nav, `/plos` Keyword Analysis → `/projects` rewire, `/projects` list page, expanded accordion, `/projects/[id]/keyword-clustering` reachable via accordion card. Failed for: Admin Notes creation on Dashboard/PLOS (API allowlist missed new systems), `/projects` accordion missing Business Ops card, clicking Project title → 404 because `/projects/[projectId]/page.tsx` had never existed despite docs claiming it was built in Ckpt 6. Triggered Ckpt 9.5 in the same chat.
- **Ckpt 9.5 (2026-04-17, same chat):** Three bug fixes. Fix 1: extended admin-notes API allowlist to include `'dashboard'` and `'plos'` (2-line change in `src/app/api/admin-notes/route.ts`). Fix 2: added `business-operations` as 15th entry in `WORKFLOW_DEFS` in `src/app/projects/page.tsx` (1-line insert). Fix 3: created `src/app/projects/[projectId]/page.tsx` from scratch (487 lines) — Project header + 15-card workflow grid + 404/403/loading states + coming-soon toast + back-nav. Committed as `fcf2373`: 3 files changed, 491 insertions, 3 deletions. Pushed; Vercel "Ready" in ~2 min. Re-verification on vklf.com: all three bugs fixed.

### Phase M — officially complete

**Deploy hold lifted.** vklf.com is now stable and coherent. The DB schema, API routes, UI pages, and Admin Notes all align. The full Phase 1 happy-path works end-to-end: Dashboard → PLOS → Keyword Analysis card → Projects list → click Project → detail page → Keyword Clustering workspace → Back to Project → Back to Projects.

**Safety branch `phase-m-safety-net` at `f545e2a`:** Can now be deleted in a future chat if desired (it served its purpose as a pre-Phase-M anchor; no longer needed).

**Phase 1g-test can now begin.**

---

## 🎯 Post-Phase-M — Claude Code Migration (TOP PRIORITY) — user executes, no Claude chat needed

After Phase M is fully deployed and verified (DONE as of 2026-04-17), the user performs a ~30-minute offline migration:

1. **Install Claude Code** in Codespaces (`npm install -g @anthropic-ai/claude-code` or current equivalent — check https://docs.claude.com for current install command)
2. **Authenticate** (uses existing Anthropic account)
3. **Smoke test** — run `claude` in Codespaces terminal, ask a trivial question, verify file reading works
4. **Read `docs/CLAUDE_CODE_MIGRATION.md`** end-to-end — this is the user's orientation to the new methodology
5. **Ready for first Claude Code session** (Phase 1g-test kickoff)

This migration is logged as a roadmap item (this section) and captured in `docs/CLAUDE_CODE_MIGRATION.md`. No code changes. No Claude chat required during the migration itself.

**The final message of chat `75cc8985-...` (the chat that deployed Ckpt 9 + Ckpt 9.5) includes a "🚨 Ready to switch to Claude Code" section with exact steps.**

### First Claude Code session — Phase 1g-test kickoff
**After migration:** First real Claude Code session tackles Phase 1g-test — live-testing Auto-Analyze on Keyword Clustering. Starter prompt: `docs/CLAUDE_CODE_STARTER.md`. See `docs/KEYWORD_CLUSTERING_ACTIVE.md` §6 for Phase 1g-test scope.

---

## Phase 1 — Admin-solo tooling (ONGOING — 🔄 IN PROGRESS)

### Goal and gate
**Goal:** Admin can complete all 14 PLOS workflows end-to-end for a single Project at production quality.
**Gate to Phase 2:** All 14 workflow tools built. ≥1 Project has been run end-to-end by admin. Keyword Clustering's polish items completed.

### Workflow build plan (the 14 PLOS workflows)

#### Workflow 1 — Keyword Analysis & Intent Discovery (🔑)
**Status:** 🔄 IN PROGRESS (partially built — Phase 1a–1g-rebuild done; Phase 1g-test PARTIAL as of 2026-04-18; polish items remain)

**Polish items remaining:**
- ✅ **Phase 1g-test (partial — 2026-04-18 kickoff session):** First live Auto-Analyze run completed on Bursitis Project (2,328 keywords). Tool runs end-to-end in principle. Findings: Adaptive Thinking produces 0 output tokens on large prompts (workaround: Enabled mode w/ 12k budget). Mode A full-table appears to drop pre-existing topics as the table grows (3-of-3 retries failed on batch 2) — **note: this diagnosis was later reframed in the follow-up session; see `KEYWORD_CLUSTERING_ACTIVE.md §6.5` update.** Vercel 5-min timeout is a real ceiling. Multiple doc drifts corrected.
- ✅ **Phase 1g-test follow-up Tasks 1–3 (completed 2026-04-18 follow-up session — deployed):**
  1. ✅ Canonical V2 prompts committed to `docs/AUTO_ANALYZE_PROMPT_V2.md` as `27eb180`
  2. ✅ Mode A → Mode B auto-switch broadened to fire on HC4/HC5 validation failures as `84062f5` — **validated live in production**: fired correctly on batch 2 of the follow-up Bursitis run
  3. ✅ Budget input UX fix (plus 3 other inputs with same bug: Batch size / Stall / Vol threshold) committed as `b9dc8b9` — **validated live in production** by user on vklf.com
- ✅ **Phase 1g-test follow-up Part 2 (completed 2026-04-19 session — deployed + validated live):**
  1. ✅ **Stale-closure bug in `buildCurrentTsv` fixed** — now reads from `nodesRef.current` / `keywordsRef.current` / new `sisterLinksRef.current`. Comment added near refs block documenting the `runLoop`-reachable invariant.
  2. ✅ **Missing `await` on `doApply` in `handleApplyBatch` fixed** — function made async, awaits `doApply(...)` before subsequent state flips. `handleSkipBatch` audited: no change needed (doesn't call `doApply`).
  3. Both fixes shipped in commit `a6b3b19` (17 insertions, 9 deletions in `AutoAnalyze.tsx` only), pushed to origin/main, auto-deployed to vklf.com.
  4. **Validated live across 7 consecutive clean batches** on Bursitis (canvas 22 → 27 → 33 → 36 → 39 → 41 → 49 → 53 nodes; "0 removed" every batch; all keywords placed every batch; input-token growth proportional to canvas size — the live fingerprint the fix is working). See `CORRECTIONS_LOG.md` 2026-04-19 entry for full numeric details.
- ✅ **Phase 1g-test follow-up Part 3 (completed 2026-04-20 session — DESIGN work only, no code changes):** Narrated and analyzed the full 51-batch Bursitis Auto-Analyze run that was left processing independently at end of 2026-04-19 session. Outcome was variant (a) from the prior session's prediction set: reactive Mode A→B switch fired at batch 40 (canvas of 95 nodes) on a narrow 1-topic/1-keyword slip ("Wrist bursitis"), avoiding the projected 200k context wall. Mode B then carried 11 more batches (40-51). Batch 52 hit a serious Mode B "Lost 6 keywords" failure (including foundational "bursa" and "omental bursa") — run cancelled during retry 2. Director identified the more critical qualitative issues (see §Phase 1g-test follow-up Part 3 Findings below). Session produced a multi-session execution plan for the accumulated polish items. Code commit: NONE (design-only session). Doc commits: see session log below.
- ✅ **Phase 1g-test follow-up Part 3 — Session 2 (completed partially 2026-04-24 — investigations-only, docs-only commit):** First direct DB queries against live Bursitis canvas (DATABASE_URL + DIRECT_URL verified in `.env.local`; 4 read-only queries run jointly with director). P3-F7 root cause diagnosed as TWO-WAY sync drift between `Keyword.sortingStatus` and `CanvasNode.linkedKwIds` — Bug 1 "silent placements" (58 kw, `doApply` step 11 only iterates `batch.keywordIds`) + Bug 2 "ghost AI-Sorted" (74 kw, split into 49 reshuffle casualties where step 11 only adds never removes + 25 linkedKwIds-carryover ghosts via the `existing?.linkedKwIds || []` fallback at line 1003). Director's two-part fix agreed: primary root-cause stack via Sessions 3-6 (salvage mechanism + prompt changes + stable topic IDs + stability scoring + Changes Ledger) + backup post-batch reconciliation pass in Session 3 scope. Removed Terms bug root cause diagnosed: `ASTTable.tsx` line 116 initializes state empty, no persistence; `handleRemove` hard-deletes via `prisma.keyword.deleteMany`. Director's fix agreed: Option B new `RemovedKeyword` table scoped to ProjectWorkflow with `removedSource` + `aiReasoning` fields to support future Auto-Remove. Full detail in `KEYWORD_CLUSTERING_ACTIVE.md` POST-SESSION-2 STATE block. Qualitative structural observations captured (HIP topics misplaced under KNEE parent — P3-F2 fingerprint; empty "Where does bursitis occur?" bridge node; missing age-demographic sibling for bursitis-pain-in-older-women — P3-F5; ~45 singleton kw=1 nodes suggesting over-specificity — P3-F1). Additional finding flagged: `CanvasState.nextNodeId = 5` despite max CanvasNode.id = 104 (stale counter — Session 3 triage).
- ✅ **Phase 1g-test follow-up Part 3 — Session 2b (completed 2026-04-24 — investigations-only continuation, docs-only commit):** P3-F8 canvas-layout regression diagnostic complete — root cause is that the React migration ported rendering but dropped the HTML tool's four-job layout engine (`cvsNodeH` content-driven height + `cvsPushDownOverlaps` holistic push-down pass + `cvsAutoLayoutChild` auto-layout-on-link + `cvsSeparatePathways`). Session 3 P3-F8 scope locked in per director's Q1/Q2/Q3 answers (one-shot port of all four functions, layout pass after every Auto-Analyze batch, pathway separation NOT deferred). Task 5 prompt changes review complete — all 7 line refs verified zero-drift; Change 3 comprehensiveness-check math bug redrafted; Change 2 Loc 2 grammar fix + Change 4 payload expanded to full 6 fields + Change 5 example labels polished; Q4 (keyword reassignment out of ≥7.0 topic requires JUSTIFY_RESTRUCTURE), Q5 (salvage IRRELEVANT_KEYWORDS auto-archives to `RemovedKeyword` table with auto-ai-detected-irrelevant source; distinct from the deferred Auto-Remove button), Q6 (`Stability Score` becomes 10th TSV column) resolutions all baked into `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md`. `keyword_sorting_tool_v18.html` now tracked in git per Option A clean-split timing. Full detail in `KEYWORD_CLUSTERING_ACTIVE.md` POST-SESSION-2b STATE block.
- ✅ **Phase 1g-test follow-up Part 3 — Session 3a (completed 2026-04-24 — first code-write session of Part 3, deployed):** Director approved a Session 3a/3b split at session start. Five of nine Session 3 items shipped: (#6) Opus 4.7 added to Auto-Analyze model dropdown + AA_PRICING table — listed first; default unchanged (Sonnet 4.6); pricing $5/$25 placeholder until Model Registry. Haiku 4.5 already present, no change. (#5) `CanvasState.nextNodeId` stale-counter fix as self-heal-on-read — canvas GET endpoint now returns `max(stored_nextNodeId, max(CanvasNode.id) + 1)` (and same for pathways); heals existing stale values without one-off migration. (#7) Cost tracker fix — cost-recording moved from after-validation-passes to immediately after `processBatch` returns; `batch.cost` accumulates across attempts; HC4/HC5 retries + Mode A→B switches now show in totalSpent. (#8) B1 settings persistence — settings auto-save (800ms debounce) + load-on-mount; **apiKey** stays in browser localStorage per-project (avoids storing the secret in plain-text Postgres); all other settings sync via existing `UserPreference` table per-user-per-project (cross-device). (#3) `RemovedKeyword` table added (Prisma migration applied to live Supabase with director's explicit approval); two new API routes (`GET/POST /api/projects/[projectId]/removed-keywords`, `POST /api/projects/[projectId]/removed-keywords/[removedId]/restore`); `ASTTable.tsx` no longer hard-deletes — `handleRemove` calls a new `onSoftArchive` parent callback that runs the copy-then-delete transaction; `handleRestore` calls `onRestoreRemoved`; modal gets a "Source" column with Manual/AI-auto badge (forward-ready for Session-3b salvage writes); `KeywordWorkspace.tsx` owns the `removedKeywords` state + HTTP plumbing. Build clean (25s, 17/17 pages, zero TypeScript errors). Single commit `25811c3` pushed; Vercel redeploy underway. **Director visual-verification on vklf.com pending.** Two autonomous design calls flagged in CORRECTIONS_LOG 2026-04-24c entry for director review (self-heal-on-read approach + apiKey-in-localStorage scoping).
- ✅ **Phase 1g-test follow-up Part 3 — Session 3b (completed 2026-04-25 — second code-write session of Part 3, awaiting push):** All 3 deferred items from Session 3a shipped in commit `6c09e50` (build clean 22.5s, 17/17 pages, zero TypeScript errors). **Item #1 — P3-F7 post-batch reconciliation pass** as new step 12 in `AutoAnalyze.doApply`. Walks the entire AST table; flips on-canvas-Unsorted/Reshuffled to AI-Sorted (heals Bug 1 silent placements + reabsorbs reshuffled keywords just re-placed); flips off-canvas-AI-Sorted to NEW `'Reshuffled'` status (Bug 2 reshuffle ghosts surfaced as visible alarm per director's Option B framing during drift-check). Each off-canvas flip emits a structured `aaLog` line forward-compatible with future `ai_feedback_records` schema. New Reshuffled status: yellow `.ast-pill-r` badge in AST + RemovedKeyword display + TIFTable; column is `String @default("Unsorted")` so no schema migration; type union in `useKeywords.ts` extended; ASTTable + MTTable + TIFTable filter logic treats Reshuffled as Unsorted-equivalent; AutoAnalyze "Unsorted only" scope renamed to "Unsorted + Reshuffled" with both values picked up by default. **Item #2 — Salvage-ignored-keywords mechanism** as new `runSalvage()` in AutoAnalyze. Trigger: `runLoop` validation flow detects HC3-only failure (every error starts "Missing " — no HC4/HC5 lost-data triggers) and fires salvage instead of full retry per director's Option A framing. Builds Change-6-template follow-up prompt at runtime with Q5-resolution wording (auto-archive language); calls `callApi`; salvage cost added to `batch.cost`; parses three blocks (DELTA ROWS, IRRELEVANT_KEYWORDS, REEVALUATION REPORT). Delta rows merged into `originalResult.topicsTableTsv` via refactored `mergeDelta(deltaTsv, baseTsv?)` (the optional second arg is new). IRRELEVANT_KEYWORDS POSTed PER-keyword to `/api/projects/[projectId]/removed-keywords` with `removedSource='auto-ai-detected-irrelevant'` + model's reason as `aiReasoning`. Archived ids removed from `batch.keywordIds`/`batch.keywords` + `onRefreshKeywords()` synced; re-validation; doApply if pass; falls through to retry on salvage error or unresolved missing. **Item #4 — P3-F8 four-function canvas-layout port** as new `src/lib/canvas-layout.ts` (321 lines) with all four functions as pure exports that mutate passed nodes in place. `calcNodeHeight(node)` uses browser canvas measureText with word-aware wrap matching HTML's `cvsWrap`; respects `userMinH`; SSR-safe fallback. `runLayoutPass(nodes, pathways, collapsed?)` is the 4-step holistic pass (reset roots → tree-walk type-aware placement → 60-pass overlap resolution → pathway separation). `autoLayoutChild(child, parent, relType, allNodes, collapsed?)` is type-aware (linear = align parent-left below all peer subtrees; nested = align parent-center+indent below nested siblings only); moves entire child subtree by delta. `separatePathways(nodes, pathways, collapsed?)` is horizontal pathway push-apart. Constants mirror HTML except NODE_W=220 + NESTED_INDENT=30 (kept React's existing values). Wired into `AutoAnalyze.doApply` step 7.5 — fires on every batch's apply per Q1 lockdown — and into `CanvasPanel.handleLinkClick` for type-aware auto-position on parent-child link form (coalesced single-server-PATCH for parent-link change + position changes). Build clean. Single commit `6c09e50` — **NOT YET PUSHED, awaiting director approval per Rule 9 deploy gate.** **Two NEW Phase-1 polish ROADMAP items captured during drift-check** (see below): "P3-F7 root-cause audit" (HC5 text-matching audit + canvas rebuild text-match audit + new HC6 "no keyword unlinks" check + Bursitis 49-ghost spot-audit) + "Keyword accounting + ghost detection panel" (history-of-every-keyword-ever-added compared against AST ∪ RemovedTerms; admin Ghost Keywords panel with Restore/Archive bulk actions). Both schedule with Session 4 or 5; not blocking.
- 🎯 **Phase 1g-test follow-up REMAINING (post-Pivot-Session-A):**
  1. ✅ **Session-3b push DONE 2026-04-25** (`6c09e50` + `8afcb9f` + `aa7eb4b` pushed, Vercel deployed).
  2. ✅ **Tier-1 + activity-log Tier-2 verification on vklf.com DONE 2026-04-25** (5 of 5 UI checks pass; canvas-layout engine + atomic rebuild + reconciliation pass all confirmed firing; reconciliation produced exact 58/74 match to Session 2 P3-F7 diagnosis).
  3. ✅ **Pivot decision committed + Pivot Session A complete 2026-04-25** (this session — three deliverables locked; full spec in `docs/PIVOT_DESIGN.md`).
  4. ✅ **Pivot Session B DONE 2026-04-25** — see Pivot Session B section below for what shipped.
  5. ✅ **Pivot Session C DONE 2026-04-25** — see Pivot Session C section below. Initial Prompt + Primer rewrite landed as `docs/AUTO_ANALYZE_PROMPT_V3.md`; legacy V2 untouched as historical reference; director re-pastes V3 into the Auto-Analyze UI before the next test run.
  6. ✅ **Pivot Session D DONE 2026-04-25** — V3 wiring layer shipped + live-validated on Bursitis. New `src/lib/auto-analyze-v3.ts` (TSV serializer + JSONL parser + applier-state translation + rebuild-payload materializer); `AutoAnalyze.tsx` integration with `outputContract` picker (V3 default, V2 selectable as defense-in-depth); 28 new unit tests (74 total pass). 5+ Bursitis batches all succeeded with **zero keyword loss** (validated structurally — `Reconciliation: 0 off-canvas → Reshuffled` on every successful apply). Real metrics vs V2 baseline: **~5× output reduction, ~4–7× cost reduction, ~4× wall-clock reduction** (less dramatic than the design's $0.03–0.10 estimate; output dominated by per-batch topic creation; the structural keyword-preservation win is the bigger architectural claim). 5 mid-session bugs caught + fixed in flight (root-topic relationship validation drift; Prisma 6 P2025 on loose upsert key; global-PK collision band-aided via global autoheal in `/canvas` GET; missing-CanvasState synthesis; BATCH_REVIEW newTopics not populated) — full detail in `CORRECTIONS_LOG.md` 2026-04-25 Pivot-Session-D entry. 3 cosmetic items deferred to Infrastructure TODOs below.
  7. ✅ **Pivot Session E DONE 2026-04-25** — V2 code paths deleted from `AutoAnalyze.tsx`; UUID-PK schema migration shipped (Option D from a 4-option gate; director picked Option D after disclosing "data loss is OK"); 3 cosmetic Pivot-D Infrastructure TODOs resolved. The "audit-only transition window" from the original plan was foreshortened by mutual agreement after Pivot D's clean validation made the safety-margin unnecessary. AutoAnalyze.tsx went from 2486 → 1331 lines. `CanvasNode.id`, `Pathway.id`, `CanvasNode.parentId`, `pathwayId`, `SisterLink.nodeA`/`nodeB` are now String UUIDs; `CanvasState` drops nextNodeId/nextPathwayId; gains nextStableIdN. Schema migration via `prisma db push --accept-data-loss` after Rule-8 approval (Bursitis's 31 test topics wiped; no production data outside the canvas was touched). 74 tests pass, build clean.
  8. ✅ **Phase-1 polish bundle DONE 2026-04-26** — three deferred items shipped in one session (commits `950e4b5` + `c891c36`, both pushed). See "Phase-1 polish bundle (2026-04-26)" section below for full delivery summary.
  9. ✅ **Visual verification of canvas-layout engine on a populated 40-topic canvas DONE 2026-04-26** — director confirmed: no overlapping nodes; descriptions fit inside boxes; type-aware placement working; pathway separation acceptable. The original "blank-canvas" framing was relaxed to "existing-clean-canvas-with-new-batch-on-top" by mutual agreement when director's existing project met the cleanliness bar (40 topics, no overlap, no overflow). One cosmetic bug surfaced + fixed in same session ("+x more" cut-off — see Phase-1 polish bundle section below).
  10. ✅ **UI hint recommending Direct mode for large-keyword Projects DONE 2026-04-26** — conditional inline hint added in `AutoAnalyze.tsx` under the API Mode dropdown. Visible only when `apiMode === 'server'` AND `est.nKeywords >= 100`. Threshold (100) is a placeholder; empirical-threshold-validation item captured below.
  11. ✅ **Adaptive-Thinking warning for large-prompt 0-output-tokens risk DONE 2026-04-26** — conditional inline warning added in `AutoAnalyze.tsx` under the Thinking row. Visible only when `thinkingMode === 'adaptive'` AND `nodes.length >= 50`. Threshold (50) is a placeholder; empirical-threshold-validation item captured below.
  12. 🎯 **NEXT (post-Phase-1-polish-bundle): pick from** (a) other Phase-1 polish items including the new Funnel-Order Pass, (b) Sessions 7-9 Human-in-Loop mode build per `AI_TOOL_FEEDBACK_PROTOCOL.md`, or (c) Workflow #2 (Competition Scraping) — needs new Workflow Requirements Interview per HANDOFF_PROTOCOL Rule 18 first.

### Phase-1 polish bundle (2026-04-26) — three items + one cosmetic fix DONE

Director picked option (a) post-Pivot-E and bundled three deferred Phase-1 items in one session. All shipped, all on vklf.com.

**Item 1 — Visual verification of canvas-layout engine.** Director used existing 40-topic populated canvas (cleanliness met the bar). Confirmed: no overlap, descriptions fit, type-aware placement works, pathway separation OK. One cosmetic bug found + fixed in same session: `+x more` keyword-count indicator was vertically clipped (bottom of letterforms cut off) on topic boxes that wrap content past the foreignObject's `KW_PREVIEW_H=36` boundary. **Fix:** removed the standalone `+x more` element entirely; folded the hidden-count info into the expand button label (button now reads `▼ N (+M)` when M keywords are hidden beyond the preview, where N = total). Two-attempt fix — first attempt (`950e4b5`) added CSS `white-space: nowrap` to address word-break-clipping which turned out NOT to be the actual cause; second attempt (`c891c36`) addressed the actual vertical-clipping cause. See `CORRECTIONS_LOG.md` 2026-04-26 entry for the diagnostic-without-screenshot lesson.

**Item 2 — Direct-mode UI hint.** Conditional inline hint in `AutoAnalyze.tsx` under the API Mode dropdown. Visible only when `apiMode === 'server'` AND `est.nKeywords >= 100`. Wording: *"⚠ With N unsorted keywords (~M batches), batches may exceed Vercel's 5-min server timeout and fail mid-flight. Switch API Mode to Direct (browser → Anthropic) to avoid this."* Code comment notes the hint becomes obsolete after AWS migration (per Phase 2 server-side execution plan).

**Item 3 — Adaptive-Thinking 0-output warning.** Conditional inline warning in `AutoAnalyze.tsx` under the Thinking row (after the Stall input). Visible only when `thinkingMode === 'adaptive'` AND `nodes.length >= 50`. Wording: *"⚠ With N topics on the canvas, Adaptive Thinking can occasionally produce 0 output tokens (a fully wasted API call). If you see a batch fail with empty output, switch Thinking to Enabled with a Budget of 12000+."* Code comment notes V3 may have made this obsolete; revisit once empirical data from V3 runs confirms.

**Architectural-question raised mid-session — funnel-stage ordering of root-level topics.** Director observed during the visual verification that the AI does great semantic clustering (right keywords → right topics; right sub-topics under right parents) BUT root-level (depth-1) topics on canvas appear in the order the model emitted them, not in conversion-funnel arc order (awareness → consideration → decision → treatment). V3 prompt's Step 7 asks the model to think about funnel ordering, but the operation vocabulary deliberately excludes position operations (PIVOT_DESIGN.md §1.5), so the model has no mechanism to express that ordering. Captured as new Phase-1 polish item below (`Funnel-Order Pass`). Director picked Option A: defer build to a future session, capture design summary now, continue today's bundle.

**Director-flagged process slip:** Claude's first "+x more" fix attempt was a guess based on the symptom description ("cut off horizontally") without first asking for or seeing a screenshot. Term was ambiguous (Claude read it as "right side clipped"; director meant "cut along a horizontal line through the middle"). First attempt didn't address the actual cause; second attempt (after director uploaded a screenshot to `docs/cutoff.png` for diagnostic, since deleted) succeeded. Captured in `CORRECTIONS_LOG.md` 2026-04-26 entry — pattern: when fixing a UI bug without ability to see the rendered output, ask for a screenshot or specific verbal disambiguation BEFORE coding.

**Empirical-threshold validation — new follow-up item below.** Director's call: the 100-keyword and 50-topic thresholds are placeholders; needs validation against real-batch-run data.

### NEW Phase-1 polish item — Empirical validation of UI-hint thresholds (raised 2026-04-26)

Both UI hints from the Phase-1 polish bundle (Direct-mode hint, Adaptive-Thinking warning) currently fire at placeholder thresholds (100 unsorted keywords / 50 canvas topics) chosen by Claude as round-number defaults without empirical justification. Director's request: validate each threshold against real-batch-run data and adjust if needed.

**Direct-mode hint threshold validation:** the hint warns server-mode users that batches may exceed Vercel's 5-min timeout. Need data on: at what unsorted-keyword-count does a server-mode V3 batch actually exceed 5 min wall-clock? Per Pivot D real-world data, V3 batches are 5-7 min — meaning even small batches in server mode are likely to fail. The threshold should probably be much lower than 100 (perhaps 1 — i.e., always warn in server mode). Validation: capture wall-clock per server-mode batch across the next 3-5 runs; pick the keyword count at which 5-min ceiling is reliably hit; adjust threshold.

**Adaptive-Thinking warning threshold validation:** the warning addresses a V2-era bug where Adaptive Thinking on a large prompt produced 0 output tokens. V3 outputs are smaller; bug may not trigger at all on V3. Validation: across the next 3-5 V3 runs with Adaptive Thinking enabled, log canvas size at run-start and watch for any 0-output failures. If no failures across all runs, remove the warning entirely (and the hint code). If failures appear, find the canvas-size threshold at which they reliably occur.

**Where to store the data:** a small append-only log captured in this doc under a "Hint-threshold validation runs" sub-section; rows are `{date, run-id, server-mode? , unsorted-kw-count, canvas-topic-count, batch-wall-clock-min, adaptive-thinking?, 0-output-failure?}`. After 3-5 entries, claim the threshold and update the hint code.

**Estimated effort:** zero net effort — the data collection happens during natural test runs; threshold update is a 1-line code change per hint when the data warrants it.

### NEW Phase-1 polish item — BATCH_REVIEW screen Apply button feedback (raised 2026-04-27)

When admin clicks the Apply button in the BATCH_REVIEW screen, the button currently stays visually unchanged during the apply operation. Admin can't tell if the click registered. There's no visual feedback during the apply step (which can take several seconds for canvas rebuild + reconciliation). If the apply fails (validation error, network issue, etc.), the button stays in its same state, masking the failure too.

**Director's design (2026-04-27):**
- During apply: button becomes **disabled** + **faded color** (not clickable; visually distinct from normal state)
- On apply **success**: button + entire BATCH_REVIEW overlay dismiss automatically (current behavior, but now visually clear that "click → fade → success → dismiss")
- On apply **error**: button returns to normal enabled state (overlay stays open so admin can retry or skip)

**Implementation note:** straightforward React state change in the BATCH_REVIEW component. ~30-60 min of code work. Captured as polish, not architectural.

### NEW Phase-1 polish item — BATCH_REVIEW screen show operations as scannable tables (raised 2026-04-27)

The BATCH_REVIEW screen currently shows new topics created (per Pivot D commit `d624556` fix) and the analyzed keywords list — but not the full operation set in a way admin can scan quickly. Without operation visibility, "Review each batch" cannot fully serve its design purpose: the admin can see WHAT was created but not the structural changes (existing-topic edits, splits/merges/moves, sister-link changes, JUSTIFY_RESTRUCTURE payloads) the model emitted alongside.

**Director's design (2026-04-27):** render the batch's operations as scannable tables, NOT prose. Distinct tables for:
- (a) **New topics created** — columns: title, description, parent, relationship
- (b) **Keyword placements** — columns: keyword text, target topic, primary/secondary
- (c) **Existing-topic modifications** — UPDATE_TOPIC_TITLE / UPDATE_TOPIC_DESCRIPTION / MOVE_TOPIC / MERGE_TOPICS / SPLIT_TOPIC / DELETE_TOPIC, each with reason
- (d) **Sister-link changes** — ADD_SISTER_LINK / REMOVE_SISTER_LINK
- (e) **JUSTIFY_RESTRUCTURE payloads** prominently flagged when present (high-stability-topic modifications)

**Goal:** admin can scan a batch's full effect in seconds, not parse paragraphs. Surfaced during 2026-04-27 V3 small-batch test when director observed the screen was insufficient for validation.

**Implementation note:** moderate effort. The `processBatchV3` function already returns parsed operations; the BATCH_REVIEW UI component needs to organize them by operation type and render each group as a table. ~2-4 hours of code work depending on table styling polish. Captured as polish, not architectural.

### NEW Phase-1 polish item — Search-volume display on canvas topic boxes + cross-tool display convention (raised 2026-04-27)

**Behavior on canvas topic boxes (W#1 only at this layer):**

(a) **Each topic box** shows TWO total-volume figures:
- Total search volume across all PRIMARY keywords on that topic, in the **primary keyword color**
- Total search volume across all SECONDARY keywords on that topic, in the **secondary keyword color**

(b) **For each keyword displayed:**
- In the topic box's keyword-preview area (the first few keywords shown directly on the topic): the volume appears in **parentheses to the right** of the keyword text
- In the expand-arrow overlay (the box that opens when admin clicks ▼ on the topic): same — volume in parentheses to the right of each keyword

(c) **Bold formatting based on Auto-Analyze panel's volume threshold:**
- Keyword volume **≥ threshold** → **bold**
- Keyword volume **< threshold** → not bold
- Applied in BOTH the topic box preview AND the expand-arrow overlay

**Out of scope at this layer:** W#1 tables (AST / MT / TIF / KAS / TVT). The director explicitly confirmed canvas-only for the W#1 implementation.

**Cross-tool display convention (PLATFORM-LEVEL DIRECTIVE, NEW 2026-04-27):** the same display convention applies anywhere topics + keywords are surfaced in downstream workflow tools — Therapeutic Strategy (W#3), Conversion Funnel & Narrative Architecture (W#5), and any future workflow that displays topics + keywords. The same volume-totals + per-keyword-volumes-in-parens + bold-by-threshold convention follows the data into those tools. Forward-pointers added to W#3 and W#5 ROADMAP entries per `HANDOFF_PROTOCOL.md` Rule 21 (pre-interview directive scan) so the convention is surfaced as the first item of those workflows' Workflow Requirements Interviews when they happen.

**Implementation note:** W#1 canvas implementation is moderate scope (CanvasPanel topic box rendering + expand-arrow overlay + per-keyword chip rendering — multiple files touched). The cross-tool convention is captured as a directive but does not require any W#1-time code work for downstream tools — those tools will implement when they're built.

**Open question to resolve at implementation time:** does this display convention also belong codified in `PLATFORM_ARCHITECTURE.md` as a "shared display conventions" subsection so it's discoverable independently of ROADMAP entries? Director's call when implementation lands.

### Phase-2 server-side execution — explicit tie-back to Direct-mode UI hint (added 2026-04-26)

Per existing Phase 2 plan ("🚨 Server-side execution of AI jobs"), AI jobs will move from browser-direct to server-side persistent workers when the platform leaves Vercel (likely AWS migration). The Direct-mode UI hint added in the 2026-04-26 polish bundle exists *only* as a workaround for Vercel's 5-min serverless timeout. Once server-side execution is live and not bound by a 5-min ceiling, server-side becomes the preferred default for AI jobs and Direct mode is retained only as an escape hatch (admin ad-hoc testing, debugging, privacy-sensitive scenarios). The Direct-mode UI hint can be removed at that point. Code comment in `AutoAnalyze.tsx` (next to the hint conditional) notes this dependency.

### Infrastructure TODOs — all 3 RESOLVED in Pivot Session E (2026-04-25)

All three items deferred from Pivot Session D were resolved in Pivot Session E. Kept here for traceability.

1. ✅ **`keywordScope` activity-log label drift** — RESOLVED. Activity Log now emits the dropdown label ("Unsorted + Reshuffled") rather than the raw enum.

2. ✅ **`CanvasNode.id` global-PK design issue** — RESOLVED via the UUID migration (Option D). `CanvasNode.id` and `Pathway.id` are now `String @id @default(uuid())`. The latent bugs in `/canvas/nodes` POST and `/canvas/pathways` POST that band-aided around the integer-counter race are gone by construction. The original framing of this TODO listed Options A/B; Option D went beyond that and is strictly better given director's "data loss is OK" disclosure (no production canvas data exists outside Bursitis test data).

3. ✅ **`handleCancel` / `handleResumeCheckpoint` in-progress batch cleanup** — RESOLVED. `handleCancel` flips any `in_progress` batch to `failed`; `handleResumeCheckpoint` downgrades restored `in_progress` to `queued`.

### Phase 1g-test follow-up Part 3 Findings (2026-04-20 session) — critical issues surfaced

These are the problems director and Claude Code identified during the 2026-04-20 session, captured in detail so the next session doesn't re-derive them. Every item links to the solution design already discussed — implementation details are in the session plan further below.

**P3-F1 — Mode A qualitatively superior; Mode B silently overwrites Mode A's better work.** Director confirmed Mode A output is markedly better structurally than Mode B. But once the reactive switch fires, Mode B can modify topics Mode A created, masking Mode A's quality in the final admin-reviewable output. Admin currently has no way to distinguish which mode produced which part of the tree. **Fix design:** Changes Ledger with per-action provenance (mode/model/batch/settings); admin quality scoring (1-5) per action rolled up per mode; Mode A "protected" mode prevents Mode B overwrites of admin-marked-good Mode A actions; final review "mode difference" view.

**P3-F2 — Mode A quietly reshuffling topics under the hood, invisible to validation.** "0 removed" fires every batch, but canvas count oscillates (80→81→80→82→81→80...). "Unusually high: N new topics" warnings grow from 27 to 82. The model renames/splits/merges topics while validation checks only for by-name disappearance. **Fix design:** explicit topic-delete mechanism in model's output contract (DELETE row with keyword-reassignment + sub-topic-reparent payloads); "batch changes report" in output (Added/Renamed/Merged/Split/Deleted with reasons); Changes Ledger makes changes visible and reviewable; stability scoring with friction gradient (see `MODEL_QUALITY_SCORING.md`) discourages re-evaluation of already-good topics without justification.

**P3-F3 — Batch 52 Mode B "Lost 6" core keywords including "bursa".** Mode B is not a complete safety net. Delta merges can silently drop previously-applied keywords. The safety check caught it and triggered retry; director cancelled during retry 2. **Fix design:** salvage-ignored-keywords mechanism (targeted follow-up for "Missing" keywords); full-batch retry retained for "Lost" (Lost = structurally broken response, targeted follow-up won't fix). Also ties to stable topic IDs + Changes Ledger for audit.

**P3-F4 — Director's "bursa / Turkey-city" insight — homograph keywords force the model into bad behavior.** Bursitis keywords include "bursa" (fluid sac) but also "bursa" (Turkish city) + "bursa iş ilanları" (Turkish "Bursa job listings"). Current prompt forces the model to place every batch keyword under some topic. For irrelevant homographs, the model either (a) invents an awkward topic, (b) drops the keyword (safety check catches), or (c) shoves it under a loosely-related topic (quality corruption — invisible). **Fix design:** "Irrelevant Keywords" floating topic as a runtime safety valve the model can use freely; admin reviews Irrelevant Keywords topic in human-in-loop and either confirms irrelevance (→ Removed Terms) or corrects placement. Pending Deletion canvas region uses the same pattern for obsolete topics.

**P3-F5 — Model is not comprehensive in topic-chain creation.** Director's example: for keyword "bursitis pain in older women", the model should create placements in "bursitis pain" (primary) + "bursitis in women" (with upstream "Who does bursitis affect?" → "How bursitis affects different sexes differently") + "bursitis in older people" (with upstream "How does bursitis affect a person by age"). Current prompt's Steps 3-5 describe the process but model is being lazy under output-length pressure. **Fix design:** add Step 4b Comprehensiveness Verification to the Initial Prompt (see `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` Change 3) — model must self-check facet extraction against placement count per keyword; omitted facets require explicit justification in Reevaluation Report.

**P3-F6 — "Unusually high: N new topics" is misleading because it counts renames as new.** The code's diff detection compares response-row topic names against pre-existing canvas topic names. Renames ("Bursitis causes" → "Causes of bursitis") are counted as "new topics." Multiplied across 80+ rows per batch, the count becomes alarming noise. **Fix design:** (primary) stable topic IDs so renames are explicit RENAME operations, not name-mismatches; (fallback) fuzzy/semantic matching layer for interim detection. Also: detailed activity log per batch breaking down "Renamed: X / Restructured: Y / Truly new: Z / Unchanged: W" instead of a single "N new topics" count.

**P3-F7 — Keyword being left out of batches (director's AST Table observation).** Director sees "Unsorted" status interspersed with "AI Sorted" status in the AST Table after a run, and checked that the Unsorted keywords don't appear in Topics or Analysis tables. Theories: (a) batches are pre-decided at run start and orphaned keywords are missed permanently; (b) AI is not analyzing them; (c) status isn't updating despite canvas verification passing. **Fix design:** investigate batching code (Session 2 investigation scope). Add redundancy: tool independently re-scans AST post-batch and flags any keyword that should be AI-sorted but isn't; re-queues missed keywords into subsequent batches; logs to activity log AND Changes Ledger.

**UPDATE 2026-04-24 (Session 2 diagnosis):** Root cause identified as TWO-WAY sync drift between `Keyword.sortingStatus` and `CanvasNode.linkedKwIds`. Two distinct bugs share one architectural flaw (two sources of truth updated unidirectionally, no reconciliation). **Bug 1 — "silent placements" (58 kw):** `doApply` step 11 at `AutoAnalyze.tsx` line 1179 iterates only `batch.keywordIds` when marking AI-Sorted, but step 9 at line 1147–1165 updates `Keyword.topic` for every keyword matching any text in the AI's response. Mode A's full-table view places prior-batch keywords as [p] primary in later batches → step 9 fires (topic updated) → step 11 doesn't (not in batch.keywordIds) → silent placement. **Bug 2 — "ghost AI-Sorted" (74 kw):** split into (a) 49 reshuffle casualties where step 11 only ADDS to AI-Sorted, never REMOVES — later canvas rebuilds remove kw from canvas but status stays stale; (b) 25 linkedKwIds-carryover ghosts via the `existing?.linkedKwIds || []` fallback at line 1003 — when AI response has empty `kwRaw` for a node, node inherits prior linkedKwIds → step 11 marks inherited kw AI-Sorted (if in batch.keywordIds) while step 9 never touches them. **Theory (a) from original P3-F7 entry partly validated (batches are pre-decided at buildQueue time), but not the core bug — core issue is status/canvas drift from unidirectional updates.** Director's two-part fix direction agreed: primary stack via root-cause fixes already in Sessions 3-6 (salvage-ignored-keywords + prompt changes + stable topic IDs + stability scoring + Changes Ledger) + backup via post-batch reconciliation pass in Session 3 scope. Per director: "Whatever fix we apply here should be a backup to that primary fix." See `KEYWORD_CLUSTERING_ACTIVE.md` POST-SESSION-2 STATE block for full detail + Session 3 block below for implementation scope.

**P3-F8 — Canvas layout regressions.** Overlapping nodes, descriptions extending outside node boxes, wrong ordering/placement. These were fixed in the HTML tool (`keyword_sorting_tool_v18.html`); regressed during React migration. `resolveOverlap` function exists in the React tool (per `PLATFORM_ARCHITECTURE.md` line 388) but appears insufficient. **Fix design:** Session 2 diagnostic pass — compare HTML tool's layout code to React tool's `resolveOverlap`. Director will upload HTML tool to repo root after 2026-04-20 session wrap-up.

**UPDATE 2026-04-24 Session 2b (diagnosis complete):** Root cause is a single architectural gap — the React port migrated canvas *rendering* (node cards, connectors, drag, zoom, single-node overlap nudge) but did NOT port the HTML tool's four-job *layout engine*. The four missing jobs: (1) `cvsNodeH` content-driven node-height calculation using canvas `measureText` (React has `NODE_H=160` constant; `h` from DB, never recomputed — direct cause of description overflow); (2) `cvsPushDownOverlaps` holistic 4-step pass (reset → tree-walk `layoutChildren` → 60-pass overlap resolution → pathway separation) called after every structural change including every Auto-Analyze batch apply (React has no equivalent; only `resolveOverlap(nodeId)` which fires on drag/resize only — direct cause of overlapping nodes and wrong order after Auto-Analyze batches); (3) `cvsAutoLayoutChild` type-aware auto-positioning when parent-child links are formed (React has no equivalent — direct cause of wrong linear-vs-nested placement); (4) `cvsSeparatePathways` horizontal push-apart for overlapping pathway borders (React has no equivalent). Bonus gap #5: `baseY`/`y` separation for clean collapse/expand restoration (React has only `y`). **Director's fix direction agreed (Q1/Q2/Q3 in Session 2b):** one-shot port of all four functions in a single Session 3 commit; layout pass runs after every Auto-Analyze batch (not just run-end); pathway separation included (NOT deferred). Item #5 (`baseY`/`y`) defers to a follow-up session. Full diagnostic detail in `KEYWORD_CLUSTERING_ACTIVE.md` POST-SESSION-2b STATE block.

**P3-F9 — Cost tracker missing failed-attempt costs + too-small UI + no estimated-vs-actual.** Known issue carried from 2026-04-18. Director added: need manual "Add API Cost" button with rows per entry, total cost display per tool per project, both estimated and actual with variance. See new roadmap item "Cost Ledger" below.

**P3-F10 — Claude's Q4 framing error (logged in CORRECTIONS_LOG).** Claude framed Mode A cost/time as "wasted" relative to Mode B in Q4 analysis, assuming quality parity between modes. Director correctly pushed back: quality matters more than speed/cost for a product-launch hierarchy. Claude acknowledged the error openly; the "functional prerequisite" claim downgrade above is the direct correction.

**P3-F11 — Auto-Analyze settings don't persist across hard refresh (API key, initial prompt, primer prompt, model).** Known; promoted to active work. Move from localStorage-only to `UserPreference` DB table with auto-save on change + load-on-mount.

### Phase 1g-test Part 3 session plan (updated based on 2026-04-20 director feedback)

Multi-session execution plan for the accumulated polish items. Director approved the structure; Claude Code maintains this plan and updates it as each session completes.

**Session 1 — DONE (2026-04-20, this session):** Design capture. All findings and solutions in docs. New docs created: `AI_TOOL_FEEDBACK_PROTOCOL.md`, `MODEL_QUALITY_SCORING.md`, `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md`. Updates to ROADMAP, CORRECTIONS_LOG, KEYWORD_CLUSTERING_ACTIVE, CHAT_REGISTRY, DOCUMENT_MANIFEST. Docs-only commit + push.

**Session 2 — Investigations (COMPLETED PARTIALLY 2026-04-24 — no code commits, diagnoses-only doc commit):**
- ✅ DATABASE_URL + DIRECT_URL confirmed in `.env.local`; Prisma client queries succeed against live Bursitis data. Direct DB querying now standard practice.
- ✅ First direct Bursitis canvas queries run jointly with director (4 read-only queries: project list, baseline counts, full tree walk, P3-F7 diagnostic). Qualitative structural observations captured in `KEYWORD_CLUSTERING_ACTIVE.md` POST-SESSION-2 STATE block.
- ✅ P3-F7 keyword-left-out bug: root cause diagnosed as two-way status/canvas sync drift. Two distinct bugs (58 silent placements + 74 ghost AI-Sorted split into 49 reshuffle casualties + 25 linkedKwIds-carryover). Fix direction agreed: primary root-cause stack via Sessions 3-6 + backup post-batch reconciliation pass (Session 3 — see below).
- ✅ Removed Terms display bug: root cause diagnosed. `ASTTable.tsx` state not persisted; `handleRemove` hard-deletes. Fix direction agreed: Option B new `RemovedKeyword` table (Session 3 — see below).
- 🎯 **NOT STARTED, rolled to Session 2b or merged into Session 3:** P3-F8 canvas layout regression diagnostic (compare `keyword_sorting_tool_v18.html` at repo root to React `resolveOverlap`).
- 🎯 **NOT STARTED, rolled to Session 2b or merged into Session 3:** Task 5 — draft proposed prompt changes from `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` with exact final wording for director review.
- End-of-session commit: diagnosis docs only (KEYWORD_CLUSTERING_ACTIVE + ROADMAP + CORRECTIONS_LOG + CHAT_REGISTRY + DOCUMENT_MANIFEST). No code. `keyword_sorting_tool_v18.html` remains untracked — will be committed in the session that actually uses it (Option A clean split).

**Session 2b — Remaining Session 2 scope (COMPLETED 2026-04-24 — director picked Session 2b over collapse-into-Session-3 at session start):**
- ✅ P3-F8 canvas layout regression diagnostic DONE. Root cause: React port migrated rendering surface but dropped the HTML tool's four-job layout engine (content-driven height `cvsNodeH`; holistic push-down `cvsPushDownOverlaps`; auto-layout-on-link `cvsAutoLayoutChild`; pathway separation `cvsSeparatePathways`). Session 3 scope locked in per director's Q1/Q2/Q3 answers. Full detail in `KEYWORD_CLUSTERING_ACTIVE.md` POST-SESSION-2b STATE block.
- ✅ Task 5 prompt changes review DONE. All 7 proposed changes in `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` — line references verified zero-drift against current `AUTO_ANALYZE_PROMPT_V2.md`; Change 3 had a math bug in the comprehensiveness check (original conflated "core intent" with "qualifying facets" — redrafted with clean definitions + unambiguous 1+N(facets) formula + rewritten worked example); Change 2 Location 2 grammar fix; Change 4 JUSTIFY_RESTRUCTURE payload expanded from 4 to full 6 fields matching `MODEL_QUALITY_SCORING.md §4`; Change 5 example labels de-overlapped; Changes 1/6/7 no change. Three design questions resolved — Q4 (keyword reassignment out of ≥7.0 topic requires JUSTIFY_RESTRUCTURE), Q5 (salvage IRRELEVANT_KEYWORDS auto-archives to `RemovedKeyword` table with `removedSource='auto-ai-detected-irrelevant'` + `aiReasoning` — NOT blocked by director's "don't program Auto-Remove" standing instruction because that instruction applies to the proactive full-canvas-scan button, not to per-batch model-initiated salvage behavior), Q6 (`Stability Score` becomes 10th TSV column — Primer Section 2 updated with column definition, parsing rule 12, constraint rule 16, output format rule).
- ✅ `keyword_sorting_tool_v18.html` committed this session per Option A clean-split timing — this was the session that actually used it.
- End-of-session commit: diagnosis + refinement docs + newly-tracked HTML tool. No code.

**Session 3a — DONE 2026-04-24 (deployed; director visual-verification pending):**
- ✅ **(#3) Removed Terms fix — Option B `RemovedKeyword` table.** Schema added + Prisma migration applied to live Supabase (director-approved per Rule 8). Two new API routes (`GET/POST /api/projects/[projectId]/removed-keywords`, `POST .../[removedId]/restore`). `ASTTable.tsx` rewired: `handleRemove` → `onSoftArchive` parent callback (transactional copy-then-delete); `handleRestore` → `onRestoreRemoved` callback. Modal gets new "Source" column with Manual/AI-auto badge. `KeywordWorkspace.tsx` owns `removedKeywords` state + HTTP plumbing. Forward-ready for Session-3b salvage writes.
- ✅ **(#5) `CanvasState.nextNodeId` stale-counter fix — self-heal on read.** Canvas GET endpoint now returns `max(stored_nextNodeId, max(CanvasNode.id) + 1)` and same for pathways. Single source of truth at read time. Heals existing stale values (Bursitis 5→105) on next read; immune to future stale writes; no migration required.
- ✅ **(#6) Opus 4.7 in model dropdown** + AA_PRICING table. Listed first; default unchanged (Sonnet 4.6); pricing $5/$25 placeholder until Model Registry. Haiku 4.5 was already present.
- ✅ **(#7) Cost tracker fix.** Cost-recording moved from after-validation-passes to immediately after `processBatch` returns. `batch.cost` now accumulates across attempts; per-attempt log line added. HC4/HC5 retries + Mode A→B auto-switches now reflected in totalSpent.
- ✅ **(#8) B1 settings persistence.** Auto-save 800ms debounced; load on mount. **apiKey** in browser localStorage per-project (avoids plain-text DB exposure of the secret); all other settings sync via existing `UserPreference` table per-user-per-project (cross-device).
- Commit `25811c3`, pushed to origin/main, Vercel redeploy underway.

**Session 3b — DONE 2026-04-25 (committed `6c09e50`, NOT YET PUSHED, awaiting director approval per Rule 9):**
- ✅ **(#1) P3-F7 post-batch reconciliation pass.** New step 12 in `AutoAnalyze.doApply`. Walks entire AST table (not just batch.keywordIds): on-canvas + Unsorted/Reshuffled → AI-Sorted; off-canvas + AI-Sorted → NEW `'Reshuffled'` status (per director's Option B framing during drift-check — every off-canvas flip is alarming, not silent). Each off-canvas flip emits structured aaLog line. New `'Reshuffled'` status: yellow `.ast-pill-r` badge across AST + RemovedKeyword display + TIFTable; type union extended; column is String so no schema migration; AutoAnalyze "Unsorted only" scope label renamed to "Unsorted + Reshuffled" + filter picks up both.
- ✅ **(#2) Salvage-ignored-keywords mechanism.** New `runSalvage()` in AutoAnalyze. Triggered by `runLoop` validation flow on HC3-only failure (per director's Option A framing — Moment 2 unplaced post-doApply already healed by reconciliation pass). Builds Change-6 follow-up prompt with Q5-resolution wording at runtime; calls `callApi`; cost added to batch.cost. Parses DELTA ROWS + IRRELEVANT_KEYWORDS + REEVALUATION REPORT. Delta rows merged via refactored `mergeDelta(deltaTsv, baseTsv?)` (new optional 2nd arg). IRRELEVANT_KEYWORDS POSTed per-keyword to `/api/projects/[projectId]/removed-keywords` with `removedSource='auto-ai-detected-irrelevant'` + `aiReasoning`. Archived ids dropped from batch + parent state synced; re-validates; doApply if pass; fall-through-to-retry on salvage error.
- ✅ **(#4) P3-F8 four-function canvas-layout port.** New `src/lib/canvas-layout.ts` (321 lines): `calcNodeHeight` (browser canvas measureText with word-aware wrap), `runLayoutPass` (4-step: reset roots → tree-walk type-aware placement → 60-pass overlap → pathway separation), `autoLayoutChild` (type-aware linear vs nested; moves subtree by delta), `separatePathways` (Q2: included). All pure functions mutating passed nodes array in place. Constants mirror HTML except NODE_W=220 + NESTED_INDENT=30 (React values preserved). Wired into `AutoAnalyze.doApply` step 7.5 (per Q1 — every batch) and `CanvasPanel.handleLinkClick` (autoLayoutChild on link-form). Existing `resolveOverlap(nodeId)` retained for drag/resize. baseY/y collapse-restore deferred to follow-up.
- Build clean (22.5s, 17/17 pages, zero TypeScript errors). Commit `6c09e50` 9 files (+786/-38), 1 new file (`src/lib/canvas-layout.ts`). **PUSHED 2026-04-25 in Session 3b verify** with director's explicit Rule-9 approval, alongside the prior unpushed `8afcb9f` (Session-3a doc updates) and the Session-3b doc-updates commit `aa7eb4b`. Vercel redeployed; vklf.com confirmed live.

**Session 3b verification — DONE 2026-04-25 (post-deploy verification on vklf.com):**
- ✅ **5 of 5 Tier-1 UI checks PASS:** Opus 4.7 in model dropdown; "Unsorted + Reshuffled" scope label; settings persistence across panel close/reopen + hard refresh; Removed Terms "Source" column; manual remove → soft-archive with "Manual" badge.
- ✅ **Tier-2 engine verification (via runtime activity log) PASS:** Canvas-layout engine fires (`Layout pass complete (104 nodes positioned)`); atomic rebuild works (`Canvas rebuilt atomically (104 nodes, 0 removed)`); reconciliation pass works correctly with structured per-keyword aaLog lines + clean summary line.
- ✅ **MAJOR FINDING — exact 58/74 match to Session 2 P3-F7 diagnosis.** Batch 1 reconciliation produced `58 on-canvas → AI-Sorted, 74 off-canvas → Reshuffled` — identical to Session 2's direct-DB-query diagnosis (58 silent placements + 74 ghost AI-Sorted). Validates the new code is working AND the architectural diagnosis was correct. The 74 keyword UUIDs are forensic data for the new "P3-F7 root-cause audit" polish item.
- ⏳ **Salvage-mechanism live verification — NOT verified this session.** Batch 1 passed validation cleanly; salvage only fires on HC3-only failures. Deferred to natural occurrence in future runs.
- ❌ **Visual verification of canvas-layout engine output — DEFERRED.** Populated 95-node Bursitis canvas couldn't show a clean baseline. Director correctly flagged: blank-canvas test would have been the right setup. Captured as new Phase-1 polish item below.
- 💰 **Cost data point:** Sonnet 4.6 classic mode on Bursitis-sized canvas (95 nodes, batch size 4, ~67k input tokens, ~110k output tokens, 26 min wall-clock) = **$1.89 per batch** with attempt-1 success. At the original 523-batch run scope, projected ~$985-1,250 total. Reinforces Mode A→B safety net design rationale.
- 🟢 **State change to Bursitis canvas:** 95→104 nodes; 58 keywords flipped Unsorted/other → AI-Sorted (Bug 1 healed); 74 keywords flipped AI-Sorted → Reshuffled (Bug 2 surfaced). No data lost. Reshuffled keywords now visible with yellow `.ast-pill-r` badge in AST table; auto-eligible for re-placement on next run because default scope is "Unsorted + Reshuffled."
- Run was cancelled after batch 1 applied (batch 2 was in thinking phase; cancel stopped before any DB writes). Commit chain queued for this session is doc-updates-only — no code changes this session.

**NEW Phase-1 polish item — Blank-canvas visual verification of canvas-layout engine** (raised by director 2026-04-25 Session 3b verify, post-cancel):
The batch-1 verification confirmed the layout engine *fires* (via activity log) but couldn't visually verify the output because Bursitis's existing 95-node canvas already had visual artifacts that masked any new engine output. Director's call: *"The canvas already had a lot of information before and I can't tell if anything is broken. Maybe we should have or should do a test on a blank canvas next time."* Plan:
1. Create a small test Project (or open an existing empty one) with a fresh canvas and the same prompts pasted in.
2. Paste 8-12 keywords representative of a small niche.
3. Run one Direct-mode (or classic-mode small) batch.
4. After apply, eyeball the canvas for: (a) no overlapping nodes; (b) descriptions fitting inside their boxes (not overflowing); (c) child nodes type-aware-positioned (linear children below parent's full subtree; nested children below parent center+indent); (d) pathway separation between separate root pathways.
5. Take a screenshot for the docs as a regression baseline for any future canvas-layout changes.
Schedules with Session 4 or as standalone quick task. Not blocking Session 4 (Changes Ledger) — but if any visual issue is found, raise that to top priority. Estimated time: 30-60 minutes including the small batch run.

**NEW Phase-1 polish item — P3-F7 root-cause audit** (raised by director 2026-04-25 Session 3b drift-check):
The reconciliation pass shipped in Session 3b is the BACKUP per Session 2 framing. Director correctly raised the meta-question: if HC5 forbids the AI from removing keywords AND validation rejects responses that lose them, why do ghosts exist at all? Three candidate causes need audit:
1. **Audit HC5 for text-matching edge cases** — internal whitespace normalization (multiple spaces, tabs, non-breaking spaces), unicode variants, smart quotes vs straight quotes. Add test cases for each.
2. **Audit canvas rebuild's keyword text-matching** at AutoAnalyze.tsx line ~1228 (`allKeywords.find(k => k.keyword.toLowerCase() === kwText.toLowerCase())`). When AI's response includes a keyword text but the AST table's matching fails, the keyword is silently dropped — HC5 may pass while the rebuild fails to link. Either match more aggressively (normalize whitespace + unicode) or fail loudly when a response keyword doesn't match any AST keyword.
3. **Add new safety net "HC6 — no keyword unlinks."** Compare set of keywords currently linked to ANY canvas topic against the set after rebuild. If any pre-existing keyword stops being linked to any topic, fail the batch. Stricter than HC5 (which only checks text appears somewhere in response).
4. **One-time spot-audit of Bursitis's 49 ghost AI-Sorted keywords** (direct DB query, like Session 2 used) to confirm whether they're (1) legacy from old code or (2)/(3) active bugs.
Schedules with Session 4 or 5 (whichever has lighter scope). Not blocking.

**NEW Phase-1 polish item — Keyword accounting + ghost detection panel** (raised by director 2026-04-25 Session 3b after the audit-item above):
Defense-in-depth feature catching keywords that disappear from BOTH the AST table AND Removed Terms. Complements but does not replace Item #1's reconciliation pass: Item #1 fixes status-vs-canvas mismatches for keywords still in the AST table; this catches keywords that have disappeared from BOTH visible surfaces.
1. System maintains a permanent record of every keyword ever added to a project's AST table — likely a new history table that captures each new-keyword event (added by import, manual entry, or any other path) so the record is immutable even if a keyword is later hard-deleted by accident.
2. Reconciliation check compares historical record against the union of (a) keywords currently in AST + (b) keywords currently in Removed Terms. Anything in history NOT in either is a "ghost" — silently disappeared.
3. Reconciliation runs on-demand from the panel + automatically as a background check on workspace load.
4. New "Ghost Keywords" admin panel — common place to see all ghosts. Per row: keyword text, when added (and by whom if known), last-known location/status before disappearing, suspected disappearance timeframe. Per-row actions: **Restore** (re-add to AST as Unsorted) or **Archive to Removed Terms** (move with reason "auto-archived during ghost recovery"). Bulk select supported.
5. Panel location TBD when scheduled — either a tab inside the Keyword Clustering workspace (if tool-specific) OR a project-wide admin page (if pattern generalizes to other workflows).
Schedules with Session 4 or as its own session right after. Not blocking.

**Session 3 cleanup item (deferred — capture for later):**
- The hard-delete `DELETE /api/projects/[projectId]/keywords` endpoint is no longer called by ASTTable (replaced by soft-archive). Likely dead code — verify no other caller, then remove. Low priority; not blocking. Logged here as an Infrastructure TODO.

### 🚨 Canvas Serialization INPUT Context-Scaling — Architectural Concern (NEW 2026-04-27; DESIGN CAPTURED 2026-04-27 in `INPUT_CONTEXT_SCALING_DESIGN.md`; OUTCOME C FIRED 2026-04-28; SCALE SESSIONS B–E NOW TRIGGERED)

**Status as of 2026-04-28:** Scale Session 0 ran empirically. **Outcome C fired** — V3 on Sonnet 4.6 full-Bursitis run hit the 200k context wall at batch 151 (input 220k tokens, well over standard 200k limit), and the director's separate Opus 4.7 cost test confirmed that model-upgrade-only is economically prohibitive (per-batch cost approached $1+ on Opus 4.7 vs. ~$0.30–$0.85 on Sonnet 4.6 across 151 batches). **The locked design in `INPUT_CONTEXT_SCALING_DESIGN.md` is now the build spec; Scale Sessions B–E are activated per `INPUT_CONTEXT_SCALING_DESIGN.md §6`.** Updated 2026-04-28 from "build gated pending Scale Session 0 outcome" → "build path triggered."

**Empirical evidence — full-Bursitis V3 run on Sonnet 4.6 (2026-04-28):**

| Batch | Canvas size | Input tokens | Per-batch cost |
|---|---|---|---|
| 1 | 9 topics | ~19,925 | $0.30 |
| 30 | 141 topics | ~61,770 | $0.36 |
| 60 | 232 topics | ~87,013 | $0.38 |
| 90 | 384 topics | ~126,594 | $0.51 |
| 120 | 528 topics | ~169,365 | $0.64 |
| 151 | ~700 topics | **~220,000** | **$0.87** (over context limit) |

Total cost for 151 batches (54% of planned 281): ~$70–80. Wall hit before director could complete the run. **Confirms the projection in `INPUT_CONTEXT_SCALING_DESIGN.md §0` that "production-typical" 500-topic projects sit at ~80% utilization on standard 200k window — too tight for safety even if not strictly broken.**

**Status legend:** the architectural concern has a captured, locked design (`docs/INPUT_CONTEXT_SCALING_DESIGN.md`, Group B, ~470 lines). Implementation is NOW the next action.

**This is NOT a polish item. It is a fundamental architectural limitation that, if it fires, requires the designed solution to be built before any project larger than ~500-600 topics can complete an Auto-Analyze run.** Captured per `HANDOFF_PROTOCOL.md` Rule 24 (Pre-capture search performed; lineage section below documents the search results).

**The concern:** Under V3's operations-based output contract (Pivot Sessions A-E, 2026-04-25), THREE of four scaling concerns were solved — keyword preservation (zero ghosts via "silence is preservation"), output-token scaling (operations-only output stays small), wall-clock per batch (~4× reduction). The fourth — **input scaling** — was acknowledged as a known trade-off but no mitigation was designed. The full canvas TSV is serialized into every batch's prompt; per-topic cost ≈ 150-300 tokens; on long runs the input will grow past Sonnet 4.6's 200k context window somewhere between roughly 600-1,000 topics — well within the size of a full Bursitis (2,329 keyword) run.

**Empirical data point — 2026-04-27 V3 small-batch test (clean canvas, 8 keywords/batch):**

| Canvas size | Approx input tokens | Cache hit (after batch 1) | Headroom (200k) |
|---|---|---|---|
| Empty | ~19,925 | 0 | comfortable |
| 9 topics (after batch 1) | ~21,066 | ~18,136 | comfortable |
| 11 topics (after batch 2) | ~21,629 | ~18,136 | comfortable |
| 25 topics (after batch 3) | ~23,854 | ~18,136 | comfortable |
| 100 topics (projected) | ~40-50k | growing | comfortable |
| 300 topics (projected) | ~80-100k | growing | tightening |
| 500 topics (projected) | ~120-160k | growing | warning zone |
| 800-1,000 topics (projected) | ~180-300k | growing | **wall** |

**Code reality (verified 2026-04-27):** `src/lib/auto-analyze-v3.ts` line 98 `buildOperationsInputTsv` takes the full `nodesRef.current`, `sisterLinksRef.current`, `keywordsRef.current` every batch. Zero filtering, zero truncation, zero subset, zero summarization. `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` line 542 calls it unconditionally with full canvas state.

**Why this is critical, not polish:**
- Caps the size of project canvas a single Auto-Analyze run can complete
- Will affect every keyword-clustering project at PLOS scale (50 Projects/week Phase 1 → 500/week Phase 3 — many projects will have 1,000+ keywords)
- Requires a designed solution that scales WITHOUT compromising V3's quality-preserving properties — particularly the intent-equivalence detection (`AUTO_ANALYZE_PROMPT_V3.md` Step 2 + Reevaluation Pass 3a) which depends on the model reasoning about the WHOLE canvas to detect distinct compound intents bundled into one topic

**HISTORICAL LINEAGE — search results per Rule 24 (do not rebuild already-deleted work):**

V2 had a `Mode A → Mode B auto-switch` with delta OUTPUT that was credited with **"avoiding the projected 200k context wall"** during the 2026-04-20 51-batch Bursitis run (this same `ROADMAP.md`, line 162). Pivot Session E (2026-04-25) **deleted that mechanism in full** — `assemblePrompt`, `processBatch`, `validateResult`, `doApply`, `runSalvage`, `mergeDelta`, `parseKatMapping`, `extractBlock`, `buildCurrentTsv`, `AA_DELIMITERS`, `AA_OUTPUT_INSTRUCTIONS`, output-contract picker UI, Mode A→B auto-switch, `_deltaSwitch` error path, `deltaMode` state — all gone. The deletion was correct for output-side concerns (V3's operations-output is structurally small) but inadvertently left input-side context-scaling without ANY mitigation in V3.

`PIVOT_DESIGN.md` lines 205 + 246 explicitly acknowledged this trade-off at the time: *"the canvas TSV input grows per batch and isn't cached"* and *"the cost-stops-scaling-with-canvas claim is partly true — the input TSV grows linearly with canvas size."* But `PIVOT_DESIGN.md §5` Open questions / deferred items did NOT include input-scaling at the time. The §5 retroactive update (2026-04-27) corrects that omission.

**This means: V3's Mode A→B is NOT a viable rebuild target. Mode A→B was an OUTPUT-side delta mechanism. The remaining concern is INPUT-side and needs a different design.**

**Required before any build (REQUIRED, not suggested):** dedicated design session(s) to fundamentally understand the issue and produce a sturdy solution. Possible directions to evaluate (none tested yet — list is starter set, NOT a recommendation):
- **Higher-context model variants** if/when available for Sonnet 4.6 (e.g., 1M context). Buys 5× headroom; doesn't solve the underlying scaling problem.
- **Selective subtree serialization** — ship only the canvas branches relevant to the current keyword batch's likely placements + a separately-maintained cross-canvas index for intent-equivalence detection. Preserves whole-canvas reasoning via the index, ships smaller TSV.
- **Periodic out-of-band consolidation passes** — separate sessions that compact the canvas (merge near-duplicates, archive low-volume orphans, prune empty bridges no longer load-bearing). Reduces canvas size between Auto-Analyze runs.
- **Topic-summary mode** — mature stable topics (high stabilityScore, settled keyword set) ship as compact stubs (title + keyword count + summary) instead of full description + keyword list. Variable-detail TSV.
- **Hybrid serialization** — full TSV for branches recently touched by the last N batches; summary mode for branches not touched in the last N batches. Captures "recent activity is high-detail; stale activity is low-detail."

**Status:** Design captured 2026-04-27 (Scale Session A) in `docs/INPUT_CONTEXT_SCALING_DESIGN.md`. Build deferred pending Scale Session 0 outcome. **Solution does NOT regress on the four root causes V3 solved** (keyword preservation, output scaling, wall-clock, intent-equivalence detection — see design doc §5 constraint-mapping table).

**Locked design summary (full detail in `INPUT_CONTEXT_SCALING_DESIGN.md`):** unified Tiered Canvas Serialization mechanism — every topic on the canvas, every batch, the tier decider picks one of three tiers (Tier 0 Full / Tier 1 Summary / Tier 2 Skeleton) using three signals (recency in the last N batches, batch-relevance via local stem-based heuristic, stability score ≥ 7.0). Plus periodic consolidation pass (D3) as orthogonal complement that recovers Reevaluation coverage on demoted topics. Plus 1M-context model (D1) as cap-headroom. Folds the original five candidate directions (D1+D2+D3+D4+D5) into a single coherent design.

**Multi-session implementation plan (Scale Sessions A through E):** A done; **0 next** (empirical validation on Opus 4.7); B–E conditional on Outcome C from Scale Session 0. Trigger conditions for proceeding to Scale Session B: (a) V3 + Opus 4.7 1M test reveals quality regression on intent-equivalence / compound primaries / Reevaluation Pass triggers, OR (b) any production project's canvas exceeds ~600 topics under standard 200k window, OR (c) Anthropic deprecates 1M context or it becomes economically prohibitive at Phase 3 scale.

**Cross-references:**
- `INPUT_CONTEXT_SCALING_DESIGN.md` (the locked design and multi-session plan — primary build spec)
- `PIVOT_DESIGN.md §5` (input-scaling row, retroactively added 2026-04-27; pointer to the design doc)
- `PLATFORM_ARCHITECTURE.md §10` Known Technical Debt (cross-reference)
- `KEYWORD_CLUSTERING_ACTIVE.md` POST-2026-04-27-INPUT-CONTEXT-SCALING-DESIGN STATE block (session-specific state)
- `CORRECTIONS_LOG.md` 2026-04-27 entry (the synthesis-failure that surfaced this concern + Rule 24 capture)

### ✅ Canvas-Blanking Intermittent Bug (FIXED 2026-04-29 bug-fix session; HIGH severity; 3 layers of defense shipped)

**Status:** ✅ FIXED in 2026-04-29 bug-fix session via 3 independent layers of defense. The original locked surgical fix was expanded to fundamental long-term per director's mid-session directive *"fix the fundamental problem long term."* All three layers are independent — either layer alone catches the bug; all three must fail simultaneously for the bug class to recur. **Defense layers shipped:**

- **Layer 1 (primary):** New pure helper `parseCanvasFetchResponses` in `src/lib/canvas-fetch-parser.ts` — checks `response.ok`, requires array body for nodes + plain-object body for state, returns structured ok/error result. `useCanvas.fetchCanvas` rewritten to use it: preserves prior client state on any failure, throws so callers can pause, sets `error` state for UI surfacing. Plus uniform throw-on-failure contract across all five `useCanvas` methods (`addNode`/`updateNodes`/`deleteNode`/`updateCanvasState` previously silently swallowed errors); state applied only on success; `deleteNode`'s optimistic remove rolls back on server rejection.
- **Layer 2 (independent guard):** New `lastSeenNodesCountRef` + per-batch fail-fast pre-flight at top of `runLoop` while-loop. If `nodesRef.current.length === 0` AND `lastSeenNodesCountRef.current > 0`, immediately `setAaState('API_ERROR')` and pause. Catches any future failure mode that produces the same symptom from a different root cause.
- **Layer 3 (existing infrastructure now wired):** runLoop's outer try/catch already routed thrown errors to `API_ERROR` state. The Layer 1 throw contract now actually propagates through `await onRefreshCanvas()` → `doApplyV3` → runLoop catch, so a transient `/canvas/nodes` 5xx pauses the run instead of silently rolling forward into the next batch.

**Sturdy testing:** 16 unit tests in `src/lib/canvas-fetch-parser.test.ts` covering every failure mode the parser must reject — HTTP 500, HTTP 401, the exact 2026-04-28 trigger shape `{ error: 'Failed to fetch nodes' }`, null/undefined/string bodies, mixed-success cases, defensive normalization of partial state bodies. All pass.

**Live data:** Bursitis canvas was wiped wholesale at end-of-session per director's data-deprioritization directive (one Prisma transaction: 690 nodes + 241 sister links + 4 pathways deleted; 2,256 keywords reset to Unsorted; canvas state reset to nextStableIdN=1; 73 archived keywords preserved). The 17 orphan-root nodes from the original blanking events are gone along with the rest of the canvas. Future runs start clean. Director can fire a small ~2-batch fresh AI run on Bursitis any time to empirically confirm the fixes hold under live load (~$1-2, ~15 min).

**Cross-references for fix-validation purposes:**
- `src/lib/canvas-fetch-parser.ts` + `src/lib/canvas-fetch-parser.test.ts` (Layer 1 + tests).
- `src/hooks/useCanvas.ts` (rewritten hook with uniform throw contract; line numbers shifted from prior version).
- `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` `runLoop` (Layer 2 fail-fast pre-flight + `lastSeenNodesCountRef` initialization).
- `src/app/projects/[projectId]/keyword-clustering/components/CanvasPanel.tsx:97` (mount-time `fetchCanvas` wrapped with `.catch(console.error)` to keep browser console clean since the hook now throws).

**Original ROOT-CAUSE DIAGNOSIS detail (preserved for forensic reference):**

The bug surfaced via `src/hooks/useCanvas.ts` line 75 — `setNodes(Array.isArray(nodesData) ? nodesData : [])`. When `/api/projects/[id]/canvas/nodes` returned a 5xx error (response body `{ error: 'Failed to fetch nodes' }`), the response was non-array → `setNodes([])` fired silently. Two design defects combined: `response.ok` was never checked + the "not an array" fallback was `[]` instead of `prev`. Both defects fixed in Layer 1.

**Root cause (diagnosed 2026-04-28):**

Two design defects in `useCanvas.fetchCanvas` (`src/hooks/useCanvas.ts:66-84`) combine:

1. **`response.ok` is never checked** for the `/canvas/nodes` GET request. A 5xx response with a JSON error body parses fine via `await nodesRes.json()`, so we never enter the catch block.
2. **The "not an array" fallback is `[]` instead of `prev`** at line 75: `setNodes(Array.isArray(nodesData) ? nodesData : []);`. Treating an error body as "no nodes exist" silently destroys client state.

The matching API route at `src/app/api/projects/[projectId]/canvas/nodes/route.ts:24-30` returns exactly the shape that triggers the bug whenever Prisma errors (`{ error: 'Failed to fetch nodes' }`, status 500). Connection-pool flake on the Supabase pgbouncer pooler under sustained run load (~2,500-3,800 transactions in ~3 hours of a 151-batch run) is the most likely 5xx trigger — empirically that happened twice in 151 batches (~1.3% rate).

**The cascade after a single failed GET:**

| Step | File:line | What happens |
|---|---|---|
| 1 | `useCanvas.ts:75` | `setNodes([])` fires silently. |
| 2 | `AutoAnalyze.tsx:158` | `useEffect` → `nodesRef.current = []`. |
| 3 | `AutoAnalyze.tsx:542-546` | Next batch's `assemblePromptV3` builds input TSV from empty `nodesRef.current`. |
| 4 | `auto-analyze-v3.ts:115` | `buildOperationsInputTsv` early-returns the bare 9-column header. |
| 5 | (Anthropic) | User message = ~2k tokens. System prompt cached at ~18k. **Total ~19,929 input tokens — exact match to the run-log observation.** |
| 6 | Model | Sees an empty canvas; builds 11-12 fresh root/near-root topics from scratch using only the 8 batch keywords. |
| 7 | `AutoAnalyze.tsx:619-633, 682-685` | `validateResultV3` and `doApplyV3` use the same empty `nodesRef.current` → applier runs over empty state → succeeds. |
| 8 | `auto-analyze-v3.ts:610-613` | `materializeRebuildPayload` computes `deleteNodeIds = []` (because `originalNodes = []`). |
| 9 | `canvas/rebuild/route.ts` | Receives 12 new nodes + empty `deleteNodeIds`. Upserts → CREATE the 12. **The 284 pre-existing nodes are NOT deleted.** DB ends with 296 nodes. |
| 10 | `AutoAnalyze.tsx:819` | `await onRefreshCanvas()` — usually succeeds this time (pooler recovers). DB returns 296 nodes; canvas state recovers in next batch. |

**Forensic confirmation in live Bursitis DB (queried 2026-04-28 deeper-analysis session):**
- `nextStableIdN = 691`, total nodes = 690 — every stable ID `t-1`..`t-690` contiguous. No nodes were destroyed.
- 4 orphan ROOT topics with NO PARENT, all created in two single transactions with identical timestamps:
  - `t-285`, `t-286`, `t-287` + descendants `t-288`..`t-291` — created `2026-04-28T00:45:41.836Z` (the batch-70 blanking event). Titles match the V3 prompt's example funnel-stage roots almost verbatim.
  - `t-594` + descendants `t-595`..`t-604` — created `2026-04-28T03:16:35.901Z` (the batch-134 blanking event).
- `t-286` "What is bursitis?" duplicates `t-2` (28 keywords). `t-285` "What can you do about bursitis?" duplicates `t-13` (71 keywords). `t-595` and `t-600` duplicate the same titles a third time. **Pure blanking artifacts.**
- The model's behavior was correct for the inputs it received (an empty TSV → build a fresh funnel skeleton). The bug is upstream of the model.

**Cascade impact — keywords silently abandoned:**
- 84 + 84 = **168 keywords** flipped to Reshuffled status across the two events.
- Batch queue is built once at run-start (`buildQueue` in `AutoAnalyze.tsx`) and is fixed for the run's duration. Reshuffled-status keywords created mid-run are NOT re-batched into the running session.
- Even though the run's scope is "Unsorted + Reshuffled" (which would pick up these keywords on a NEW run), within THIS run they're stuck.
- Result: director's "many keywords are simply skipped in the AST table" feedback is partially explained by this bug — those 168 keywords sit at Reshuffled status until the user starts a fresh run.
- (Live DB now shows only 84 of 168 stuck Reshuffled — see "Reconciliation-Pass Closure-Staleness Bug" below for why the second event's 84 weren't re-flipped over the first event's 84, and why neither were healed by later batches.)

**Likely-cause checklist verdicts (was speculative; now resolved):**
- ✗ React state staleness between batches — not the cause of blanking (but is the cause of the no-heal cascade — see closure-staleness section).
- ✗ Server-side rebuild API race — not the cause; rebuild succeeded.
- ✗ Cancel/restart artifact — not the cause; no other `setNodes([])` exists.
- ✗ Anthropic prompt-cache mis-handling — not the cause; the wiring layer literally serializes empty TSV at `auto-analyze-v3.ts:115`.
- ✓ **`fetchCanvas` silently blanks on non-array response** — confirmed; only path producing the empty-TSV signature.

**Fix design (locked 2026-04-28 deeper-analysis session):**

1. **Primary** — make `useCanvas.fetchCanvas` defensive (`src/hooks/useCanvas.ts:69-75`):
   - Check `nodesRes.ok && stateRes.ok` before parsing.
   - On any failure (HTTP error, non-array body, parse exception), preserve previous state instead of zeroing — change the fallback to `if (Array.isArray(nodesData)) setNodes(nodesData);` and likewise drop the `|| null`/`|| []` defaults inside the same branch.
   - Surface the failure to the caller via thrown error so `AutoAnalyze` can pause the run instead of silently rolling forward.
2. **Secondary** — fail-fast pre-flight in `runLoop` (`AutoAnalyze.tsx`): at top of per-batch start, if `nodesRef.current.length === 0` AND we know the previous batch had nodes, set `aaState = 'API_ERROR'` and pause. Catches any future failure mode that produces the same symptom from a different root cause. ~10 lines.
3. **Belt-and-braces (in-batch)** — wire up the pause-the-run handling at `AutoAnalyze.tsx:819-820` so a refresh failure doesn't silently roll into the next batch.
4. **Post-fix cleanup of live data** — soft-archive the ≤8 keywords directly attached to the 17 orphan-root nodes (`t-285`..`t-291`, `t-594`..`t-604`); delete the 17 nodes. The keywords return to "Unsorted" and get re-placed in a future run. This cleanup should ride along with the fix-deployment session, NOT be done before the fix lands (otherwise a future run could regenerate the same orphans).
- **Estimated effort:** ~1-2 hours code + a small unit test on `useCanvas` for the non-array branch + the orphan cleanup. Build clean. Push gated by Rule 9.

**Cross-references:**
- `src/hooks/useCanvas.ts:75` — the smoking-gun line.
- `src/app/api/projects/[projectId]/canvas/nodes/route.ts:24-30` — the matching server-side error response.
- `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx:542-546, 619-633, 682-685` — the cascade points.
- `auto-analyze-v3.ts:115, 610-613` — pure-functional cascade points.
- `KEYWORD_CLUSTERING_ACTIVE.md` POST-2026-04-28-DEEPER-ANALYSIS STATE block — session-specific context with full forensic detail.
- `PLATFORM_ARCHITECTURE.md §10` Known Technical Debt — cross-reference entry.
- "🚨 Reconciliation-Pass Closure-Staleness Bug" section below — orthogonal but compounding bug; both motivate the Defense-in-Depth Audit item further below.
- This entry's symptom + reconciliation behavior were captured in the 2026-04-28 session activity log (preserved in CHAT_REGISTRY entry for the session).

---

### ✅ Reconciliation-Pass Closure-Staleness Bug (FIXED 2026-04-29 bug-fix session; HIGH severity; 3 layers of defense shipped)

**Status:** ✅ FIXED in 2026-04-29 bug-fix session via 3 independent layers of defense. The original locked one-token fix at `AutoAnalyze.tsx:830` was expanded to fundamental long-term per director's mid-session directive *"fix the fundamental problem long term."* The fix prevents the bug class structurally, not just the bug instance — accidental reintroduction of the same closure-capture pattern is now physically prevented inside `doApplyV3`. **Defense layers shipped:**

- **Layer 1 (primary — structural):** Reconciliation logic extracted to pure helper `computeReconciliationUpdates(keywords, placedSet, archivedSet)` in `src/lib/reconciliation.ts`. The helper takes its inputs explicitly, has no closure to capture from, is pure — it cannot be wrong in the same way the inline loop was. The original 2026-04-28 inline loop at lines 822-848 of `AutoAnalyze.tsx` is replaced with a single call to this helper.
- **Layer 2 (shadow pattern):** At `doApplyV3` function entry, `allKeywords` and `pathways` are SHADOWED by locals pointing at `keywordsRef.current` / `pathwaysRef.current`. The local names match the prop names, so closure-frozen props are physically unreachable for every read inside the function. The reconciliation pass call site automatically resolves to fresh data; line 707 (`originalPathwayIds: pathways.map(...)`) and line 858 (`allKeywords.find(x => x.id === id)` for unplaced-log) automatically resolve to fresh data. New `pathwaysRef` added to match the existing `nodesRef`/`keywordsRef`/`sisterLinksRef` pattern.
- **Layer 3 (convention enforcement via documented invariant):** Line-153 invariant comment was rewritten from a passive *"runLoop-reachable code must read via *Ref.current"* to a positive description of the shadow strategy as the new convention. Future code added to `doApplyV3` reads fresh state by default. ESLint custom-rule enforcement of the shadow pattern is captured in the Defense-in-Depth Audit design item below for a future dedicated session.

**Sturdy testing:** 10 unit tests in `src/lib/reconciliation.test.ts` covering empty input, archived-skip, all four cells of the reconciliation truth table (on-canvas+Unsorted heal, on-canvas+Reshuffled heal, off-canvas+AI-Sorted punish, on-canvas+AI-Sorted no-op), mixed batch with all four behaviors interleaved, and — critically — the 2026-04-28 stale-vs-fresh contrast test that exactly reproduces the 84-keyword regression scenario. The contrast test passes the helper TWO different keyword lists (the closure-frozen "stale" view showing 84 as AI-Sorted vs. the ref-current "fresh" view showing 84 as Reshuffled, both with the same placedSet); proves the helper's output reflects the input it's given (no hidden snapshot) and that the fresh input correctly heals all 84 stuck-Reshuffled keywords. Plus a hidden-snapshot regression-guard test that pins the helper's purity. All 10 pass.

**Live data:** Bursitis canvas was wiped wholesale at end-of-session per director's data-deprioritization directive. The 84 stuck-Reshuffled keywords + 232 status-drift residuals were eliminated by the wipe along with the rest of the canvas. The Reconcile Now admin button shipped as a forward-looking forensic + healing tool — useful any time future drift appears.

**Cross-references for fix-validation purposes:**
- `src/lib/reconciliation.ts` + `src/lib/reconciliation.test.ts` (Layer 1 + tests).
- `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` (Layer 2 shadow pattern at doApplyV3 entry; Layer 3 line-153 comment rewrite; new `pathwaysRef`).
- `CORRECTIONS_LOG.md` 2026-04-18 entry (the foundational stale-closure pattern this regression mirrored).
- "🛡️ Redundancy + Defense-in-Depth Audit" item below — partial implementation: the per-fix redundancy matrix is implicit in this session's 3-layer approach; the rest still pending design.

**Pattern recurrence:** This is a regression of the documented closure-staleness pattern from `CORRECTIONS_LOG.md` 2026-04-18 (Bug A: `buildCurrentTsv` reading props instead of refs) + 2026-04-19 (fix validated live). The prevention rule was added: a code comment now sits at `AutoAnalyze.tsx:153` saying *"runLoop-reachable code must read nodes/allKeywords/sisterLinks via *Ref.current, not raw props — the async runLoop closure freezes props. See CORRECTIONS_LOG 2026-04-18."* The Pivot Session E rewrite (2026-04-25) deleted the original `buildCurrentTsv` along with all V2 code paths. The reconciliation pass added later in Session 3b wrote new code at `AutoAnalyze.tsx:822-848` that mostly honors the line-153 invariant — `keywordsRef.current` is used at line 656 in the same function — but **line 830's `for (const kw of allKeywords)` violates it**.

**Symptom:** the reconciliation pass walks `allKeywords` (the React prop, frozen into `doApplyV3`'s closure at component-render time) instead of `keywordsRef.current` (the always-fresh ref). When a prior batch's reconciliation flips a keyword's status to `Reshuffled`, the parent's keyword state updates, but the closure's view of that keyword still says `AI-Sorted`. So:

- The `if (onCanvas && status === 'Reshuffled') → flip to AI-Sorted` healing branch never fires for that keyword on later batches — closure says it's `AI-Sorted`, no flip needed.
- The `if (!onCanvas && status === 'AI-Sorted') → flip to Reshuffled` punishment branch can fire on a misleadingly-stale view.

**Empirical confirmation in live DB (2026-04-28 Bursitis canvas):**
- 84 keywords currently `Reshuffled` — ALL still ON the canvas (`linkedKwIds` includes them). They could have been healed by reconciliation in batches 71-133 and 135-151 but weren't.
- 147 keywords AI-Sorted but actually OFF canvas (ghost AI-Sorted) — partly attributable to the same closure-staleness preventing punishment-branch recognition in some batches.
- 85 keywords Unsorted/Reshuffled but actually ON canvas (silent placements) — same root cause from the healing direction.

**The math (why the 84 number is exactly 84, not 168):** at run start, the project carried ~84 `AI-Sorted` keywords from a prior in-flight run. The closure-frozen `allKeywords` showed those 84 as AI-Sorted forever. When batch 70 canvas-blanked and reconciliation ran with `placedSet = {8 batch keywords}`, each of the 84 hit `!onCanvas && status === 'AI-Sorted'` → flipped to Reshuffled. Batches 71-133 (healthy canvases) saw the same 84 in stale closure as `AI-Sorted` AND on canvas → no flip → no healing. Batch 134 re-flipped the same 84 (idempotent PATCH). Batches 135-151 same as 71-133. End state: 84 stuck Reshuffled despite being on canvas. **This count exactly matches the live DB.**

**Fix design (locked):** change `for (const kw of allKeywords)` to `for (const kw of keywordsRef.current)` at `AutoAnalyze.tsx:830`. Single-line change. Restores the line-153 invariant. Add a regression test that simulates the closure-stale scenario (mock `allKeywords` prop to an outdated copy while `keywordsRef.current` reflects updated statuses; verify reconciliation reads the ref).

**Post-fix cleanup of live data:** after the fix ships, the 232 status drift residuals (147 + 85) plus the 84 stuck Reshuffled won't be healed automatically by future runs unless those keywords come into scope. Two options:
- (a) Add a one-shot **"Reconcile Now"** admin button that walks AST × canvas with current-from-server data and fires `reconcileUpdates` against the live DB. ~50 lines code; localized to AutoAnalyze.tsx or a sibling utility component.
- (b) Run a one-off SQL/Prisma script with explicit confirmation. ~20 lines, ~10 min admin time.
Option (a) is more useful long-term — it doubles as a forensic tool for future runs and is captured as a candidate redundancy in the Defense-in-Depth Audit item below.

**Scope:** ~5 minutes code + ~15 minutes test + standard build/push gating. Independent of the canvas-blanking fix; can ship separately or together (recommended together — both are wiring-layer fixes; both heal the visible "skipped keywords" symptom; ~3 hours total in one focused session).

**Why this matters (not just for the 84):** the bug's blast radius is bigger than the 84 stuck Reshuffled keywords. Every reconciliation pass on every batch of every run on every project has been reading stale `allKeywords` since Session 3b shipped (2026-04-25). The 232 status-drift residuals (147 + 85) visible in the live DB are partly explained by this — though sorting out which residuals are from this bug vs. P3-F7 silent-placement vs. canvas-blanking would require a forensic pass we haven't done.

**Cross-references:**
- `CORRECTIONS_LOG.md` 2026-04-18 entry (the foundational stale-closure diagnosis) + 2026-04-19 entry (the fix validation).
- `AutoAnalyze.tsx:153` (the canonical invariant comment).
- `AutoAnalyze.tsx:656` (correct usage of `keywordsRef.current` in the same function — proves the invariant was understood when most of `doApplyV3` was written; line 830 is the lone regression).
- `PLATFORM_ARCHITECTURE.md` line 407 (platform-level recognition of the refs-vs-stale-closure pattern).
- This bug compounds the canvas-blanking bug (above) but is INDEPENDENT — fixing one does not fix the other.
- `KEYWORD_CLUSTERING_ACTIVE.md` POST-2026-04-28-DEEPER-ANALYSIS STATE block (this session's findings).
- "🛡️ Redundancy + Defense-in-Depth Audit" item below — this bug's escape despite the documented invariant is one of the two motivating cases for that item.

---

### 🛡️ Redundancy + Defense-in-Depth Audit (🔄 IN PROGRESS — captured 2026-04-28; partially implemented 2026-04-29; design completed 2026-04-29; **Implementation Session 1 of 2 completed 2026-04-29-b**; Implementation Session 2 pending)

**Status (updated 2026-04-29 second session of day):** **Implementation Session 1 (Option β) shipped.** Per the design's two-session split, Session 1 shipped the structural defenses: ESLint custom rule `no-prop-reads-in-runloop` (codifies the line-163 invariant as a build-time gate; bootstrapped on `runLoop` / `doApplyV3` / `processBatchV3` / `validateResultV3`); runtime invariant R2 (post-Reconcile-Now diff-empty WARN); server-side guard G1 (`/canvas/rebuild` rejects payloads with >50% shrink and no explicit deleteNodeIds — locked at 50% per director's Q1 = Option A); server-side guard G2 (`/canvas/nodes` GET retries Prisma transient codes P1001/P1002/P1008/P2034 with backoff [100ms, 500ms]). 30 new src/lib unit tests + 13 ESLint rule tests; `npm run build` clean; `npm run lint` clean for the new rule. R3 (Tier-1 intentFingerprint invariant) and G3 (empty-intentFingerprint reject) explicitly deferred to Scale Session B per design. R4 (dev-mode ref-vs-prop watermark) explicitly deferred per design §3.2.4 + director's Q2 = Option B.

**Implementation Session 2 (still pending):** ships forensic structured log (§4 — NDJSON ring buffer + download button) + run-start pre-flight self-test (§6 — P1-P10). ~3-4 hours. Independent of any other backlog item.

**Design doc (now annotated with what's shipped):** `DEFENSE_IN_DEPTH_AUDIT_DESIGN.md` (Group B; ~720 lines).

**Earlier — Partially implemented 2026-04-29 as part of the Bug 1 + Bug 2 fixes**, per director's *"fix the fundamental problem long term"* directive. The per-fix redundancy matrix for those two specific bugs is implicit in the 3-layer-each defense pattern shipped (see the two FIXED entries above and Sections 1.A + 1.B of the design doc).

**What shipped in earlier sessions (counts toward this item, not a separate item):**
- 2026-04-29 (bug-fix session) — per-fix redundancy matrix for Bug 1: 3 layers (defensive `useCanvas` contract + runLoop fail-fast pre-flight = R1 + existing API_ERROR routing). Each layer alone catches the bug.
- 2026-04-29 (bug-fix session) — per-fix redundancy matrix for Bug 2: 3 layers (pure helper extraction + shadow pattern + line-153 convention rewrite). Each layer alone prevents the bug class.
- 2026-04-29 (bug-fix session) — Reconcile Now admin button. Doubles as a verification tool for any future bug.
- **2026-04-29-b (Implementation Session 1) — ESLint rule `no-prop-reads-in-runloop`** turning the line-163 invariant into a build-time gate (Layer 4 of Bug 2's per-fix matrix).
- **2026-04-29-b (Implementation Session 1) — runtime invariant R2** post-Reconcile-Now diff-empty WARN (extra Layer 2 for Reconcile Now's matrix entry).
- **2026-04-29-b (Implementation Session 1) — server-side guard G1** `/canvas/rebuild` payload-sanity (independent server-side defense for Bug 1's matrix entry, regardless of which client connects).
- **2026-04-29-b (Implementation Session 1) — server-side guard G2** `/canvas/nodes` GET retry-on-transient (suppresses the underlying pgbouncer flake server-side so the run never pauses on a transient).

**What's still pending implementation (Session 2 scope, per design §4 + §6):**

1. **Forensic instrumentation** — NDJSON per-batch structured log (in-memory ring buffer up to 1000 records ≈ 250KB) + "Download log" button next to Reconcile Now. Records: ts, session_id, project_id, batch_num, phase (pre/post apply, pre/post API call), canvas counts, TSV input/output tokens, model, cost, reconciliation counts, errors. Client-side download only in v1 (Phase 2 multi-user can promote to server-side per-run logging later). Dry-run mode designed but DEFERRED per design §0.4.
2. **Run-start pre-flight self-test (P1-P10)** — expanding the existing 3 checks (API key + seed words + prompt length) to 10: add primer-prompt parseable, `nodesRef.current` matches `/canvas/nodes` GET (count + sample stableIds), `keywordsRef.current` matches `/keywords` GET, pathways consistency, cheap test API call (~$0.001 with Sonnet 4.6 to verify key + model availability), localStorage probe. Per-check display in the panel; "Skip pre-flight" checkbox off by default. Total runtime ~2-3 seconds before $50 of API spend.

**What's deferred beyond Session 2:**
- **R3** (Tier-1 intentFingerprint runtime invariant) and **G3** (empty-fingerprint reject server-side) — both depend on the `intentFingerprint` schema column from Scale Session B; folded into that build's tests.
- **R4** (dev-mode ref-vs-prop watermark check) — director Q2 = Option B (defer until R1+R2 prove value, per design §3.2.4 recommendation).
- **Dry-run mode** — design §4.3; recommended deferred per §0.4 until empirical signal warrants.

**Estimated effort:** Session 1 (DONE 2026-04-29-b) ~3-4 hrs. **Session 2 (pending):** ~3-4 hrs. **Director's framing matches the two-session split** — see design §7 Option β recommendation.

**Sequencing:** Session 1 done. Session 2 OR Scale Session B build is the natural next-priority. Per design §7's note, completing the audit (Session 2) before Scale Session B is the cleanest sequencing — pre-flight P5/P6 catches Scale Session B's tier-decider regressions and structured logging gives forensic data on Scale Session B's first production runs. But Scale Session B is also unblocked now (G3 lands as part of that session, R3 is built into its serializer). Director's call.

**Director's framing (verbatim 2026-04-28):** *"think if redundancies may be needed and if so, to add them, in case our fixes fail during a session (which has happened before)."*

**The pattern this addresses.** The Auto-Analyze pipeline went through a deliberate simplification in Pivot Session E (2026-04-25) that DELETED several defense-in-depth mechanisms: Mode A→B reactive switch, salvage, the full-table-rewrite correction path, and the IRRELEVANT_KEYWORDS recovery template. The deletions were correct for V2's failure modes; they make sense under V3's "silence is preservation" architecture. BUT the live 2026-04-28 run revealed two NEW failure modes the deletions left uncovered:

- The canvas-blanking bug (`useCanvas.fetchCanvas` silent zero-set) — silently abandoned 168 keywords mid-run. There was NO server-side or client-side guard that caught it; reconciliation surfaced it but didn't prevent it.
- The closure-staleness reconciliation regression — silent status drift across every run since Session 3b. The line-153 invariant comment exists but didn't prevent the line-830 violation from being written.

Both bugs would have been caught earlier by belt-and-braces mechanisms that V3 deliberately doesn't have. The principle holds: post-pivot architectures need their own defense-in-depth, not just structural correctness.

**Goals of the design session:**

1. **Per-fix redundancy matrix.** For each fix on the current backlog (Bug A: canvas-blanking; Bug B: closure-staleness; Mid-run queue refresh; Cleanup C orphan-roots; Scale Sessions B-E; second-pass refinement), enumerate:
   - What does the primary fix do?
   - What is the failure mode if the primary fix breaks or is incompletely applied?
   - What's the visible signature of that failure?
   - What backup mechanism (if any) would catch it independently?
   - Is the backup worth the code complexity it adds?
2. **Codebase-wide invariant enforcement.** The line-153 invariant ("runLoop-reachable code must read via *Ref.current") is a code-comment-only convention. Consider:
   - A custom ESLint rule that flags prop reads inside identified runLoop-reachable functions.
   - A runtime invariant check that asserts ref freshness at key boundaries (e.g., dev-mode warning if `nodesRef.current.length === 0` at start of a batch when canvas had >0 nodes at end of previous batch).
   - A unit-test pattern that simulates closure-stale scenarios for any new runLoop-reachable function.
3. **Forensic instrumentation.** Some bugs only show their signature in production-scale runs. Consider:
   - Optional verbose logging of canvas/keyword sizes at each batch boundary, written to a structured log file the admin can download.
   - "Dry-run" mode that runs the full pipeline against synthetic data and verifies invariants without DB writes.
   - A "Reconcile Now" admin button that re-runs reconciliation against current-from-server state at any time (heals residual drift; doubles as a forensic tool).
4. **Server-side guards.** Some failures could be caught at the API boundary rather than relying on client-side state hygiene:
   - `/canvas/rebuild` could reject payloads where `deleteNodeIds.length === 0` AND the new-node count is dramatically smaller than the existing canvas size (potential canvas-blanking signature).
   - `/canvas/nodes` GET could be wrapped in a retry-on-transient-error layer so the underlying connection-pool flake doesn't surface as "canvas is empty."
5. **Pre-flight checks at run start.** Before any batches process, run a self-test: confirm `nodesRef.current` matches DB; confirm `keywordsRef.current` matches DB; confirm the prompts loaded correctly. Fail fast if anything is off, before $50 of API spend.

**Estimated effort:** 1 design session (3-4 hours) producing the matrix + the locked list of redundancies to build + a multi-session implementation plan. The implementation work itself depends on what the matrix recommends — could be 1 session for ESLint+runtime-invariant alone, or more if server-side guards are in scope.

**Sequencing:** EITHER ride alongside the canvas-blanking + closure-staleness fix session (so the redundancies for those two specific fixes get added in the same commit), OR run as its own session AFTER those fixes ship (so the design matrix can use the empirical signal from the fixes' first production runs). Director's call.

**Cross-references:**
- `PIVOT_DESIGN.md` (the original simplification rationale; this item revisits what was deleted vs. what should be re-added under V3 framing).
- `AI_TOOL_FEEDBACK_PROTOCOL.md` (the action-by-action-feedback design item is partly redundant-by-design — second pass catches what first pass missed).
- `MODEL_QUALITY_SCORING.md` (stability scoring is a redundancy mechanism for preventing structural churn on well-validated topics).
- `CORRECTIONS_LOG.md` 2026-04-18 entry (the original stale-closure pattern whose recurrence motivates the codebase-wide-invariant-enforcement goal).
- This entry's TWO DIRECT MOTIVATING BUGS:
  - "🚨 Canvas-Blanking Intermittent Bug" section above.
  - "🚨 Reconciliation-Pass Closure-Staleness Bug" section above.

---

### 🚨 Canvas-Blanking Intermittent Bug — ORIGINAL CAPTURE (2026-04-28 Scale Session 0; superseded by the diagnosed entry above; preserved for reference)

**Status:** Empirically observed in 2026-04-28 full-Bursitis V3 run on Sonnet 4.6 — twice, at batches 70 and 134 of a 151-batch run. Root cause not yet diagnosed; needs code reading + DB query before fix design. **Captured as a top-level architectural concern, NOT polish, because it silently abandons keywords from the run mid-flight.**

**Symptom:** Between batch 69 (canvas 284 topics, healthy) and batch 70 (canvas count drops to 12 nodes after apply), the wiring layer sent only ~19,929 tokens of input to the model — the size of the cached prompt body alone, with NO canvas state attached. The model, seeing essentially an empty canvas, built a small fresh one from scratch using just the 8 keywords in that batch. The reconciliation pass correctly caught the symptom: `Reconciliation: 2 on-canvas → AI-Sorted, 84 off-canvas → Reshuffled` — 84 keywords lost their canvas anchor in one batch.

**Confirmed twice in a single run (~64 batches apart, no obvious common trigger):**

| Batch | Input tokens sent | Canvas before | Canvas after apply | Reshuffled |
|---|---|---|---|---|
| 69 | ~100,403 | 284 topics | 284 topics | 0 (healthy) |
| **70** | **~19,929** | 284 topics | **12 topics** | **84** |
| 71 | ~103,519 | (back to ~290) | 298 topics | 0 (recovered) |
| 133 | ~186,769 | 584 topics | 584 topics | 0 (healthy) |
| **134** | **~19,937** | 584 topics | **11 topics** | **84** |
| 135 | ~192,834 | (back to ~600) | 607 topics | 0 (recovered) |

**Note:** the canvas appears to "recover" in the next batch because the rebuild-API state is intact server-side (reconciliation reads server state, not the model's response) — the model's view of an empty canvas was the only thing actually empty.

**Cascade impact — keywords silently abandoned:**
- 84 + 84 = **168 keywords** flipped to Reshuffled status across the two events.
- Batch queue is built once at run-start (`buildQueue` in `AutoAnalyze.tsx`) and is fixed for the run's duration. Reshuffled-status keywords created mid-run are NOT re-batched into the running session.
- Even though the run's scope is "Unsorted + Reshuffled" (which would pick up these keywords on a NEW run), within THIS run they're stuck.
- Result: director's "many keywords are simply skipped in the AST table" feedback is partially explained by this bug — those 168 keywords sit at Reshuffled status until the user starts a fresh run.

**Likely cause space (not yet diagnosed):**
- React state staleness between batches — `nodesRef.current` / `keywordsRef.current` momentarily empty at the moment `buildOperationsInputTsv` is called.
- Server-side rebuild API race — atomic-rebuild API returns success but ref-state hasn't yet reflected the rebuild on subsequent batch start.
- Cancel/restart artifact — a hidden state-reset path being triggered intermittently.
- Anthropic prompt-cache mis-handling — the wiring layer thinks the canvas is in cache and elides it from the user message; not yet observed but worth checking.

**Investigation plan (next session, OPTION B from director's choices):**
1. Read `src/lib/auto-analyze-v3.ts` `buildOperationsInputTsv` end-to-end + tracing how `nodesRef.current` / `keywordsRef.current` / `sisterLinksRef.current` get populated and refreshed between batches.
2. Read `AutoAnalyze.tsx` `runLoop` step-by-step looking for any path that could empty the refs between batch N apply and batch N+1 start.
3. Read the canvas-rebuild API + atomic-rebuild flow looking for race-condition risk.
4. DB query against the live test project's CanvasNode + Keyword tables right now: what's the actual canvas state? How many keywords are stuck in Reshuffled status today?
5. Check if there's a way to log the canvas size at the start of each batch's `buildOperationsInputTsv` call (forensics for next run).

**Fix design — TBD pending diagnosis. Possible directions:**
- Pre-flight check at batch start: if `nodesRef.current.length === 0` and `nodesOnLastApply > 0`, fail fast with a clear error and pause the run (stop the cascade).
- Forced refetch of canvas state from server before each batch's `buildOperationsInputTsv` call (defensive — slower but eliminates state-staleness window).
- Mid-run queue refresh (smaller, separate polish item below) — even if this bug is fixed, the queue-refresh fix is independently useful.

**Why this is HIGH severity, not polish:**
- Silent data loss mid-run — director's quality feedback on the run is partially confounded by which keywords were genuinely placed vs. which ended up Reshuffled because of this bug.
- Frequency: ~1.3% of batches (2 in 151) — low absolute rate but high blast radius (~1% of total keywords per event).
- Director's "many keywords skipped" feedback IS this bug — fix it and the visible symptom largely disappears.
- Combined with the "Mid-run batch queue refresh" polish item below, the keywords-skipped problem is structurally addressed.

**Cross-references:**
- This entry's symptom + reconciliation behavior were captured in the 2026-04-28 session activity log (preserved in CHAT_REGISTRY entry for the session).
- `KEYWORD_CLUSTERING_ACTIVE.md` POST-2026-04-28 STATE block — session-specific context.
- `PLATFORM_ARCHITECTURE.md §10` Known Technical Debt — cross-reference entry.
- Related to but DISTINCT from P3-F7 silent-placements + ghost-AI-Sorted bugs (P3-F7 was about status-flip drift in `doApply`; this is about the wiring layer not sending canvas state to the model in the first place).

---

### NEW Phase-1 polish item — Mid-run batch queue refresh (raised 2026-04-28)

When the post-batch reconciliation pass creates new `Reshuffled` status keywords mid-run (whether from the canvas-blanking bug above or from any future Reshuffled-causing event), those keywords are NOT picked up by the current Auto-Analyze session — the batch queue is built once at run-start in `buildQueue` and is fixed.

**Director's design (2026-04-28):** at each batch's apply step, after reconciliation runs, scan for any keyword whose status was just flipped to Reshuffled AND that was not already in the run's batch queue → append those keywords to the queue (as new tail batches). The estimated-batches counter in the activity log updates accordingly. This way the run self-heals from any mid-run reshuffles regardless of cause.

**Edge cases to handle:**
- Avoid infinite loops: a batch processed at the tail that triggers MORE reshuffles must not append yet again from the same set (track origin batch).
- Cap the run at a sane multiple of the original queue length (e.g., 1.5×) to prevent runaway.
- Activity log line: `Queue extended: +N keywords from reconciliation reshuffles`.

**Implementation note:** Localized to `AutoAnalyze.tsx` `doApply` and `buildQueue` — no DB schema changes. ~1–2 hours of code work after design lock-in.

**Captured as polish, not architectural** — it's a defensive / UX-quality enhancement, not a fundamental design change. The architectural canvas-blanking bug above is the PRIMARY problem; this is the BACKUP.

---

### NEW Phase-1 polish item — Skeleton View on canvas (raised 2026-04-28)

Director-requested canvas display mode that maximizes node density per field of view by rendering each topic as a minimalist box (title + first 3 keywords only, no description, no expand chevron, smaller box dimensions).

**Use case:** with canvases now reaching 600+ topics, the standard view becomes unwieldy for whole-canvas review. Skeleton View lets admin scan structure quickly + spot orphans / misplacements / duplicates.

**Director's spec:**
- Toggle in canvas top-bar: "Skeleton View" / "Full View" (default Full).
- Skeleton View renders: title, parent_id (for hierarchy), first 3 keywords only (no volumes, no badges).
- Box dimensions reduced (~50% of full size) to fit ~4× the nodes per viewport.
- Toggling back to Full View restores the layout pass output (positions don't shift).

**Implementation note:** Localized to `CanvasPanel.tsx` topic-box rendering + a state variable toggling between the two render modes. Layout engine doesn't need to change (heights are computed dynamically per node anyway). ~2–3 hours of code work.

---

### NEW Phase-1 polish item — AST table split-view topic-vs-description row alignment (raised 2026-04-28)

In the AST table's split view, each keyword row has cells in the 'Topics' column and the 'Topic Descriptions' column. The cell heights drift apart because:
- Topic Description cells typically have more text → taller height.
- Topic cells have less text → shorter height.
- Result: a topic and its description aren't on the same horizontal line; the description is far below where its associated topic appears.

**Observation:** the columns share a moveable border that auto-adjusts cell heights. **And** during apply, the table briefly shows the cells perfectly aligned (so the rendering CAN handle alignment) — but the moment the data finishes applying, the alignment breaks again.

**Director's design:** topic cell and topic-description cell for the same keyword row must always have the same height — equal to the larger of the two natural heights — so the description aligns flush with its topic. Same behavior the table has during the brief apply window, but persistent.

**Implementation note:** Localized to AST table CSS/JS — likely a flexbox / grid cell-stretching issue. The brief-during-apply correct rendering suggests a CSS rule fires only during a transient state. Find that rule, make it the default. ~1–2 hours of code work.

---

### NEW Phase-1 polish item — Topics table row numbering (raised 2026-04-28)

Add a row-number column (1, 2, 3, …) as the leftmost column in the Topics table, so admin can reference "topic #47" in conversation / notes.

**Implementation note:** Localized to Topics table rendering — pure UI, no schema. ~30–60 min of code work.

---

### NEW Architectural Design Item — Action-by-action feedback + second-pass refinement workflow (raised 2026-04-28; design pending; extends `AI_TOOL_FEEDBACK_PROTOCOL.md`)

**Status:** captured as a forward-pointing design item; full design needs a dedicated session analogous to Scale Session A. The director was explicit: "this is what I want us to engage in next" — but priority vs. Scale Sessions B–E TBD by director.

**Purpose:** today's BATCH_REVIEW screen shows the post-state of a batch (new topics + analyzed keywords) but does NOT show admin the structural decision-by-decision rationale of the model. Director needs:
- (1) Each action with **WHEN** it happened (batch / order within batch) and **WHY** (model's reasoning for that specific operation).
- (2) An admin-editable **adjustment column** where admin can write "your reasoning was wrong because X" / "the right reasoning would have been Y."
- (3) An admin-add-row capability for actions NOT taken but that SHOULD have been taken — admin types in the missing op + the reason it should have happened.
- (4) A workflow downstream of the feedback: the model runs a **second pass** that uses the feedback to refine the run, AND ALSO refines pass-1 output autonomously (separate from feedback).

**Relationship to existing docs:**
- `AI_TOOL_FEEDBACK_PROTOCOL.md` defines the platform-wide standard for AI feedback: structured decision output with reasoning, admin review surface with 3 actions + 2 feedback channels, feedback-repo write/read-back, quality scoring, model/provider registry. **The director's ask EXTENDS this** with per-action reasoning capture (the current op vocabulary in `operation-applier.ts` doesn't have a `reason` field on each op; it would need to be added) + admin adjustment column + admin-add-row capability + second-pass orchestration.
- `MODEL_QUALITY_SCORING.md` defines the 0-10 stability score per output item and 1-5 admin scoring with 4 dimensions. Compatible with the new design but doesn't cover it.
- The "Changes Ledger" concept from P3-F1 (Mode A / Mode B distinction) is the same family of mechanism — full per-action provenance — that this design item builds on.

**Preliminary scope (will be locked in at the dedicated design session):**
- Add `reason` field to every operation in the V3 vocabulary (`AddTopicOp`, `MergeTopicsOp`, `MoveKeywordOp`, etc.). Schema migration analogous to Pivot Session B's `stableId` and Scale Session B's `intentFingerprint` patterns.
- New BATCH_REVIEW UI: scannable table per operation type (per the `BATCH_REVIEW screen show operations as scannable tables` polish item from 2026-04-27 — this design subsumes that one and supersedes it).
- New "Action Adjustments" panel for admin to write feedback per action.
- New "Missed Action" form for admin to add rows with op + reason.
- Second-pass orchestration: a new Auto-Analyze mode that takes the feedback corpus + current canvas as input + emits new operations to refine.
- Storage: extend the existing `ai_feedback_records`-pattern table family.

**Estimated effort (rough; will be refined at the dedicated design session):** ~3–5 build sessions analogous to Pivot Sessions B–E.

**Director's framing (verbatim 2026-04-28):** *"what the tool should have provided to me is not just what topics were created but when and why and what modifications were made, when and why. I want to be able to see each action in a table format with an associated reason why and a column to its right where I can provide an adjustment to that reasoning. I should also be able to provide feedback and reasoning for actions that were not taken (so that data is not in the table) but should have been taken and the reason why (by adding those specific things in the table). Then I want us to figure out which things can be addressed by the prompt, which things can be addressed by workflow changes or programmatic changes in our tool, etc. I am also considering adding a second pass to our workflow to fix things that your proposed fixes may not address so that this kind of action-by-action feedback can allow the tool to address specific issues in the second pass in addition to refining the pass 1 output on its own aside from my feedback."*

**Cross-references:**
- `AI_TOOL_FEEDBACK_PROTOCOL.md` — base pattern this extends.
- `MODEL_QUALITY_SCORING.md` — adjacent mechanism (stability score; admin 1-5 grading).
- `INPUT_CONTEXT_SCALING_DESIGN.md §4.1` — the consolidation pass concept is one form of "second pass" but is mechanically distinct from this director-feedback-driven second pass; the two should be evaluated together at design time to decide whether they collapse into one mechanism or stay separate.

---

### NEW Architectural Design Item — Intelligent hybrid cost/quality strategy (raised 2026-04-28; design pending)

**Status:** captured as a forward-pointing design item; will be designed AFTER Scale Sessions B–E ship (so we know the post-Tiered-Serialization cost baseline).

**The question:** *"Is there an intelligent way to improve output while reducing cost while not overhauling all the code/approach we have come up with so far? Note that cost reduction should take a lower priority to quality improvements."*

**Candidate levers (starter set, NOT a recommendation; full design will evaluate):**
- **Hybrid model use** — Sonnet 4.6 for routine batches, Opus 4.7 for batches with high-difficulty signals (e.g., new keyword-cluster terrain, high-stability-score restructures, JUSTIFY_RESTRUCTURE-bearing batches), Haiku 4.5 for trivial batches (e.g., post-canvas-mature stretches with no new compound intents). Dispatcher logic decides per-batch model.
- **Smaller batches with denser per-batch context** — fewer keywords per batch (4 instead of 8) might let the model do more per keyword without overall token explosion. Trade-off: more API calls, more wall-clock; possibly lower per-token cost via better Tier-0 hit rate.
- **Prompt-caching optimization** — current setup caches the prompt body (~18k tokens) but not the canvas TSV. If the canvas TSV could be split into a stable-prefix breakpoint + a delta, prompt caching could absorb the stable part. Need to verify Anthropic prompt-cache semantics + breakpoint behavior.
- **Second-pass-only-for-low-confidence regions** — pass 1 is fast/cheap (Sonnet, batch size 8); pass 2 is slow/expensive (Opus, batch size 4) but ONLY runs on batches that pass-1 flagged as low-confidence (e.g., high stability-score modifications, intent-equivalence violations, JUSTIFY_RESTRUCTURE payloads). Combines the action-by-action feedback design above.
- **Stability-score-weighted per-batch effort** — high-stability topics ship as Tier 1/2 (already in the Tiered Serialization design); low-stability topics get extra reasoning passes. Composes with the Tier mechanism.

**Director's quality-over-cost framing (verbatim 2026-04-28):** *"Note that cost reduction should take a lower priority to quality improvements."* — Any design produced for this item must lead with quality and treat cost as a secondary optimization.

**Estimated effort:** ~1 dedicated design session producing a design doc analogous to `INPUT_CONTEXT_SCALING_DESIGN.md`; build effort then depends on which levers are chosen.

**Cross-references:**
- `INPUT_CONTEXT_SCALING_DESIGN.md` — the Tiered Canvas Serialization design is the FIRST cost-reduction-while-preserving-quality lever; this item extends the conversation to OTHER levers AFTER B–E ship.
- `MODEL_QUALITY_SCORING.md` — stability score is the primary signal candidate for the dispatcher logic.
- `AI_TOOL_FEEDBACK_PROTOCOL.md` model registry — the dispatcher logic's per-model decisions tie into the model registry concept.

---

### 🚨 ARCHITECTURAL PIVOT — TOP PRIORITY (NEW 2026-04-25 Session 3b verify, supersedes Sessions 4-6 below)

**Captured in `CORRECTIONS_LOG.md` 2026-04-25 high-severity architectural-insight entry. Read that entry first; this section is the action plan that flows from it.**

**The single architectural problem:** the Auto-Analyze prompts ask the AI to **rebuild and re-emit the entire topics layout table** on every batch (Initial Prompt: *"provide the complete updated Integrated Topics Layout Table as your final output for this batch"*; Primer rule 3: *"Never delete existing topics or keywords — only add new ones or add keywords to existing topics"*). The AI is being used as a **state-rebuilder**. This single architectural choice is the root cause of all three observed pain points:

1. **Keywords get removed from topics they belong in.** The AI fails to *re-emit* prior placements when the table grows (attention dilution, output-length pressure, string-matching drift). Verification batch reproduced the entire 58/74 Bursitis ghost set on its first run — exact match to Session 2's direct-DB diagnosis. The reconciliation pass surfaces these losses; it does not prevent them.
2. **Cost and output token count scale with canvas size, not batch size.** Verification batch: 110,245 output tokens for 4 new keywords = ~27,500 output tokens per new keyword, of which only ~3-5k is genuinely new content; the other ~105k is redundant re-emission of the existing 95-node table. **Cost-per-batch grows linearly with canvas size.** $1.89 per Sonnet 4.6 classic-mode batch on a 95-node canvas; ~$4 on a 200-node canvas; eventually we hit max output token limits and the run breaks entirely.
3. **Wall-clock time is bottlenecked by output-token generation rate** (~50-80 tokens/sec on Sonnet 4.6). 110,245 tokens / 60 tokens/sec ≈ 30 minutes per batch (verified: 26 min for the verification batch). API isn't slow; we're asking for a huge output. Operation-only output would finish in under a minute.

**Why this wasn't visible earlier:** smaller canvases had small re-emitted tables; ghost rates were tolerable; cost-tracker was undercounting (failed-attempt costs missing — fixed in Session 3a) so per-batch numbers looked smaller; reconciliation pass didn't exist (Session 3b shipped it) so ghosts were silently broken instead of surfaced as Reshuffled. The architecture has had this scaling property since the beginning. Recent fixes weren't regressions — they were x-rays. Now we see the underlying problem clearly.

**The pivot — change the AI's output contract.** Instead of returning the complete updated TSV table, the AI returns a **list of operations** against the existing table. Operation vocabulary (initial draft):

```
ADD_TOPIC id=<new-stable-id> title=... parent=<id> relationship=linear|nested depth=<N> description=...
RENAME_TOPIC id=<id> from=<old-title> to=<new-title>
MOVE_TOPIC id=<id> new_parent=<id> new_relationship=...
MERGE_TOPICS source_id=<id> target_id=<id> reconciled_description=...
SPLIT_TOPIC source_id=<id> into=[<new-id-1>, <new-id-2>] keyword_assignments={...}
DELETE_TOPIC id=<id> reason=... reassign_keywords_to=<id>
ADD_KEYWORD topic=<id> keyword=<exact-text> placement=primary|secondary
MOVE_KEYWORD keyword=<exact-text> from=<id> to=<id> placement=primary|secondary
REMOVE_KEYWORD keyword=<exact-text> from=<id>
ADD_SISTER_LINK topic_a=<id> topic_b=<id>
REMOVE_SISTER_LINK topic_a=<id> topic_b=<id>
```

The tool — deterministic code, not the AI — applies these operations to the existing canvas. Validation runs on the **applied result**, not on the AI's emitted output.

**Direct consequences of the pivot:**

- **Output drops from 100,000+ tokens to under 1,000** for a small batch. Cost drops 99%+. Wall-clock drops to well under a minute. (Input — the existing canvas as context — stays similar; prompt caching can amortize input cost further.)
- **Keywords cannot silently disappear.** The AI literally cannot drop a keyword without explicit `MOVE_KEYWORD`, `REMOVE_KEYWORD`, or `DELETE_TOPIC reassign_keywords_to=...` operations. Anything not mentioned in the operation list stays exactly where it was.
- **Reconciliation pass / Reshuffled status / salvage mechanism become vestigial.** They keep working but their failure-mode coverage drops near zero. Long-term they can be deprecated; near-term they keep running as defense-in-depth while the pivot is being validated.
- **Stable topic IDs become a hard prerequisite, not a polish item.** Operations need stable identifiers to refer to topics across batches. Session 5's stable-ID work is promoted into the pivot; it does not stand alone.
- **Changes Ledger (currently planned Session 4) becomes ~80% subsumed by the pivot.** The operation list IS a Changes Ledger entry. Session 4 narrows from "build the ledger from scratch" to "Changes Ledger UI: filter / sort / admin actions on the operations the AI already structured for us."
- **Validation rewrites:** instead of "diff the AI's emitted table against the existing one," it becomes "validate the operation set is internally consistent (no orphan moves, no duplicate adds, all referenced IDs exist) and the post-application state passes invariants (no unlinked keywords, all topics have valid parents, etc.)."
- **Mode A / Mode B distinction simplifies.** Input still differs by mode; output contract is now uniformly "operations only" regardless of mode.
- **The Initial Prompt and Primer Prompt both need substantial rewrites.** Reevaluation triggers and topic-naming guidance survive; the table-emission instructions and the "never delete" rule get replaced with operation-emission instructions and explicit deletion-via-`DELETE_TOPIC` rules.

**Pivot session plan (multi-session, supersedes Sessions 4-6 below):**

**Pivot Session A — Design + stable topic IDs (~1 session):**
- Finalize operation vocabulary (the list above is a draft; decide on edge cases like simultaneous MOVE + RENAME, batch-internal ordering rules, error handling on apply failures).
- Decide on stable-ID format (UUID vs. short hash vs. monotonic counter; collision-safe vs. human-readable).
- DB schema migration: add `stable_id` column to `CanvasNode` table; backfill existing rows with generated IDs; index it.
- Update `RemovedKeyword` / canvas-rebuild / API endpoints to read/write stable IDs alongside the existing title-based identifiers (transitional period — both work).
- Director's explicit Rule-8 approval before `npx prisma db push`.

**Pivot Session B — Deterministic operation applier + validation rewrite (~1 session):**
- Code the operation-applier function: takes (existing canvas, operation list) → (new canvas, validation result).
- Write per-operation validators: each operation is checked for internal consistency before any are applied.
- Write the post-application invariant checks: no unlinked keywords, no orphan topics, all parent references valid, etc.
- Unit-test the applier against synthetic operation sets (no AI involved at this stage).

**Pivot Session C — Prompt rewrite (~1 session):**
- Rewrite Initial Prompt: keep the philosophy/context/conversion-funnel framing; replace the "provide the complete updated Integrated Topics Layout Table" instruction with "emit a list of operations using the following vocabulary"; rewrite the reevaluation-pass section so triggers issue MERGE / SPLIT / RENAME / MOVE_TOPIC operations.
- Rewrite Primer: column-definitions section becomes operation-definitions; output-format section becomes operation-syntax; rules-and-constraints section gets the deletion-via-`DELETE_TOPIC reassign_keywords_to=...` rule (replacing the never-delete rule).
- Update `docs/AUTO_ANALYZE_PROMPT_V2.md` (or create `_V3.md`) with the new prompts.
- Director re-pastes new prompts into Auto-Analyze UI.

**Pivot Session D — Wire it together + validate end-to-end (~1 session):**
- Update `AutoAnalyze.tsx` to send operations-output prompts and parse operation-list responses.
- Replace the existing canvas-rebuild flow (which expects a TSV table) with the operation-applier (which expects a list of operations).
- Run small test project on a fresh canvas with the new prompts; iterate until clean.
- Run a small test on a populated test project; verify keyword-loss rate drops to zero.
- Run a single batch on Bursitis as the cost-comparison data point. Expect ~$0.05-0.20 cost vs. the $1.89 we just saw. Expect <1 minute wall-clock vs. 26 minutes.

**Pivot Session E — Migration to operations-default + deprecation plan for band-aids (~1 session):**
- Make operations-output the default mode.
- Mark the legacy table-rewrite output as deprecated; keep code path for rollback during a transition window.
- Run reconciliation pass + Reshuffled / salvage logic in "audit-only" mode for a few sessions to validate the pivot is producing zero new ghosts.
- Once validated, deprecate (remove) the band-aid code paths in a future cleanup session.

**Pivot Session F — Re-scope Sessions 4-6 (~½ session of doc work, no code):**
- Session 4 (Changes Ledger UI): now narrowly about UI on top of operations data — filter/sort/admin-action surface. Probably can collapse into 1 session given the operations infrastructure already exists.
- Session 5 (Stability scoring): unchanged in spirit; stable topic IDs already done in Pivot Session A. Stability scoring is now a smaller standalone task.
- Session 6 (Prompt modifications): mostly subsumed by Pivot Session C's rewrite. The Q4/Q5/Q6 design questions and the Session-2b refinements still apply — fold the parts that survive into Pivot Session C; archive the parts that are now obsolete.

**Estimated pivot total:** 4-6 sessions across 2-3 weeks vs. Sessions 4-6 + ongoing Phase-1 polish patching which would be ~6-9 sessions of patching that doesn't fix the root cause.

**Decision committed 2026-04-25 (Pivot Session A).** Director re-examined the insight from Session 3b verification, considered the trade-off vs. continuing with Sessions 4-6, and committed to the pivot. Reasoning logged in `CORRECTIONS_LOG.md` 2026-04-25 architectural-insight entry; locked design captured in new `docs/PIVOT_DESIGN.md`.

### Pivot Session A — ✅ COMPLETE (2026-04-25, this session)

Design-heavy session, no code, no DB changes. Three deliverables locked:

1. **Operation vocabulary (13 operations).** Topic operations: `ADD_TOPIC`, `UPDATE_TOPIC_TITLE`, `UPDATE_TOPIC_DESCRIPTION`, `MOVE_TOPIC`, `MERGE_TOPICS`, `SPLIT_TOPIC`, `DELETE_TOPIC`. Keyword operations: `ADD_KEYWORD`, `MOVE_KEYWORD`, `REMOVE_KEYWORD`, `ARCHIVE_KEYWORD` (replaces the earlier "Irrelevant Keywords floating topic" design — cleaner direct mechanism). Sister-link operations: `ADD_SISTER_LINK`, `REMOVE_SISTER_LINK`. Cross-cutting rules: atomic batch apply (all-or-nothing); sequential within-batch ordering; new-topic aliases `$new1`/`$new2`/... (applier resolves to real `t-N` at apply time); keywords referenced by database UUID (not text — sidesteps text-matching ghost-bug class); reasons on every structural op (`MERGE`/`SPLIT`/`DELETE`/`MOVE`); JUSTIFY_RESTRUCTURE 6-field payload on stability ≥7.0 from day one (gate exists immediately even though no topic crosses 7.0 until scoring algorithm ships). Deliberately excluded: pathway operations (admin-driven), position/size operations (layout engine's job), reserved-topic aliases like `IRRELEVANT_KEYWORDS`/`PENDING_DELETION` (replaced by `ARCHIVE_KEYWORD` and deferred respectively).

2. **Stable-ID format.** `t-1`, `t-2`, ... per project. New-topic aliases within a batch: `$new1`, `$new2` (`$` prefix is reserved syntax). Backfill rule for existing topics: `stableId = "t-" + id`.

3. **Database migration plan.** Two columns added to `CanvasNode`: `stableId String` (NOT NULL after backfill) + `stabilityScore Float @default(0.0)`. Three-step sequence: (Step 1) add nullable `stableId String?` + defaulted `stabilityScore`; (Step 2) committed Prisma-based backfill script in `scripts/backfill-stable-ids.ts` that walks every existing CanvasNode row setting `stableId = "t-" + id`, idempotent, logs every update; (Step 3) tighten to `String` NOT NULL + add `@@unique([projectWorkflowId, stableId])`. Ships in Pivot Session B with explicit Rule-8 approval before each step. Other tables (`SisterLink`, `Pathway`, `RemovedKeyword`, `Keyword`) — no schema changes.

Director-locked design choices during the session:
- Q1 vocabulary completeness: complete (no pathway ops; no position ops).
- Q2 atomic batch apply: yes (all-or-nothing).
- Q3 ARCHIVE_KEYWORD vs Irrelevant Keywords floating topic: ARCHIVE_KEYWORD (cleaner direct mechanism; not blocked by the standing "no Auto-Remove button without prompting" instruction since ARCHIVE_KEYWORD is per-batch model-initiated salvage, not the admin-initiated Auto-Remove button).
- Q4 JUSTIFY_RESTRUCTURE timing: from day one (director's sharper call than Claude's defer-recommendation; reasoning: this is the direct mechanism that prevents silent overwrites of well-placed work, which is one of the four root-cause failures).
- Q5 stable-ID prefix: `t-` (single-letter, compact for output token cost).
- Q6 alias convention: `$new1` (the `$` prefix is reserved).
- Q7 backfill: derive from existing integer IDs (1:1 mapping for debugging value).
- Q9 schema additions: both columns (`stableId` + `stabilityScore`) added together in one migration.
- Q10 backfill mechanism: committed Prisma-based script (auditable; re-runnable; matches platform's "code over manual DB edits" pattern).
- Q11 sequencing: 3-step (conservative; verification gate between backfill and constraint-tightening).

Director-flagged process correction during session: Claude jumped into design mechanics (Q1-Q4) without first anchoring each design choice to the four root-cause failures the pivot exists to address. Director correctly re-emphasized the failure modes (keyword loss + cost scaling + slow batches) and demanded Claude map each design decision to the failure it prevents. Captured as a low-severity entry in `CORRECTIONS_LOG.md` 2026-04-25 — reminder for future sessions to lead with failure-mode mapping when locking architectural decisions, not bury it after-the-fact.

Full locked design specification: see `docs/PIVOT_DESIGN.md` (new Group B doc).

### Pivot Session B — ✅ COMPLETE (2026-04-25, this session)

Code-heavy session. All scope from PIVOT_DESIGN.md §3 + §4 shipped. Both Rule gates honored: Rule 8 explicit approval before each `prisma db push`; Rule 9 explicit approval gate pending at end of session before `git push origin main`.

**1. 3-step DB migration applied to live Supabase.**
- **Step 1** — `npx prisma db push` after editing `prisma/schema.prisma` to add `stableId String?` (nullable) + `stabilityScore Float @default(0.0)` to `CanvasNode`. Pure additive; existing data untouched. Director's Rule-8 approval before push.
- **Step 2** — Self-test first: `scripts/test-backfill-on-fresh-project.ts` (since cleaned up post-success) created a temporary `Project` + `ProjectWorkflow` + 3 `CanvasNode` rows, ran the backfill restricted to that project, verified `stableId` correctly set, deleted the temp data via cascade. PASS. Then ran `node scripts/backfill-stable-ids.ts` unconstrained on live DB — populated all 104 Bursitis rows: `t-1` through `t-104`. Verification: 0 null/missing rows remained.
- **Step 3** — `npx prisma db push --accept-data-loss` after editing schema to `stableId String` (NOT NULL) + `@@unique([projectWorkflowId, stableId])`. Pre-flight verification (`scripts/verify-no-stable-id-duplicates.ts`) confirmed 104 rows / 0 nulls / 0 duplicates. Rule-8 explicit re-approval after director understood the `--accept-data-loss` flag was Prisma's generic safety prompt, not actual data destruction.
- Other tables (`SisterLink`, `Pathway`, `RemovedKeyword`, `Keyword`) — no changes per §3.5.

**2. `src/lib/operation-applier.ts` (~600 LOC, pure function, no I/O, no Prisma).**
Public API: `applyOperations(state, operations) → { ok: true, newState, archivedKeywords, aliasResolutions } | { ok: false, errors }`. Implements all 13 operations from PIVOT_DESIGN §1: 7 topic ops (`ADD_TOPIC`, `UPDATE_TOPIC_TITLE`, `UPDATE_TOPIC_DESCRIPTION`, `MOVE_TOPIC`, `MERGE_TOPICS`, `SPLIT_TOPIC`, `DELETE_TOPIC`) + 4 keyword ops (`ADD_KEYWORD`, `MOVE_KEYWORD`, `REMOVE_KEYWORD`, `ARCHIVE_KEYWORD`) + 2 sister-link ops (`ADD_SISTER_LINK`, `REMOVE_SISTER_LINK`). Atomic batch apply via deep-cloned scratch state — input state never mutated; bad op rolls everything back. Alias resolver (`$newN` → `t-N` at apply time) honors sequential within-batch ordering; forward-refs to undefined aliases rejected. Per-operation pre-validators inline within each apply function. Post-application invariant checks: parent chain acyclic, parents resolve, sister links reference real nodes, no original keyword silently lost (every original keyword must be either still placed OR in the archive list). JUSTIFY_RESTRUCTURE 6-field shape enforced for `MERGE_TOPICS`/`SPLIT_TOPIC`/`DELETE_TOPIC`/`MOVE_TOPIC`/`UPDATE_TOPIC_TITLE` when a target node has stabilityScore ≥ 7.0 — matches `MODEL_QUALITY_SCORING.md §4`.

**3. `src/lib/operation-applier.test.ts` — 43 unit tests, all passing.**
Runs via `node --test src/lib/operation-applier.test.ts`. Built-in `node:test` + `node:assert/strict` — no new dependencies. Coverage: every op type happy + error paths, alias chaining, atomic rollback on bad late op, JUSTIFY_RESTRUCTURE gate behavior, invariant violations, realistic batch combining adds + keywords + sister links + description update.

**4. Two pre-existing production routes patched** to supply `stableId: \`t-${id}\`` at create time:
- `src/app/api/projects/[projectId]/canvas/nodes/route.ts` (POST — manual canvas-node creation).
- `src/app/api/projects/[projectId]/canvas/rebuild/route.ts` (the upsert.create branch — fires every time Auto-Analyze applies a batch).
Both patches were a **necessary scope expansion** because Step 3's NOT NULL constraint shipped to production before Pivot Session D's wiring. Without these patches, the next manual node create OR Auto-Analyze run would fail at runtime. Director approved Option A (patch now, ~3 lines per file) over Option B (roll back NOT NULL).

**5. Diagnostic scripts kept in `scripts/`** for historical/diagnostic value:
- `scripts/backfill-stable-ids.ts` — populates any `CanvasNode` row whose `stableId` doesn't yet start with `t-`. Idempotent. After this session, no rows match. Optional `--project-workflow-id=<uuid>` flag for scope-restricted runs.
- `scripts/verify-no-stable-id-duplicates.ts` — read-only check for duplicate `(projectWorkflowId, stableId)` pairs. Useful spot-check.

**6. Minor tsconfig change** — added `"allowImportingTsExtensions": true` so the test file's explicit `.ts` import resolves under both `tsc --noEmit` and `node --test`'s type-strip mode.

**Build status:** `npm run build` clean (17/17 pages, zero TypeScript errors); `npx tsc --noEmit` clean (apart from a pre-existing unrelated `.next/dev/types/validator.ts` reference to a deleted route — Phase M build cruft, not introduced this session); `node --test src/lib/operation-applier.test.ts` 43/43 pass.

**Live data state:** `CanvasNode` table has `stableId` (NOT NULL) + `stabilityScore` (default 0.0) columns; `@@unique([projectWorkflowId, stableId])` enforced at DB level; 104 Bursitis rows have `t-1`…`t-104`; no row's user-visible content was changed.

**Next session — Pivot Session C** — DONE 2026-04-25; see Pivot Session C section below.

---

### Pivot Session C — ✅ COMPLETE (2026-04-25, this session)

Doc-only session. No code, no DB, no live-site impact. Single deliverable: rewritten Auto-Analyze prompts that match the canonical operation vocabulary in `src/lib/operation-applier.ts`. Director's Rule-9 approval gate at end of session before push.

**1. New file `docs/AUTO_ANALYZE_PROMPT_V3.md`** (~640 lines). Mirrors V2's structure (frontmatter + how-to-use + how-to-update + Initial Prompt code block + Primer code block), but the two prompt blocks are rewritten end-to-end for the operation-based output contract.

**2. Initial Prompt V3.** Philosophy / context / conversion-funnel framing kept verbatim from V2 (the director's voice — searcher intent, narrative flow, conversion stages, Topic Naming guidelines, seed-word substitution). The action-numbered task list rewritten: AI now decides what changes the canvas needs, then expresses those changes as operations from the Primer's vocabulary. New explicit rule: "Anything you do not mention in your operation list stays exactly where it was. Silence is preservation." Multi-placement-is-a-feature paragraph (V2 proposed-changes Change 5 — locked wording) inserted at the start of the Placement Decision Framework. Tie-breaker rule (V2 Change 1 — locked wording) inserted into Step 2. Step 4b Comprehensiveness Verification (V2 Change 3 redrafted version with the math-bug fix) inserted after Step 4. Step 6's volume-aware rule (b) updated with the cross-canvas scan (V2 Change 2 Loc 1 — locked wording) and stability-score friction tie-in. New Step 6b Respecting Stability Scores (synthesized from `MODEL_QUALITY_SCORING.md §3` and V2 Change 4 6-field payload) inserted before Step 7. Step 7 Conversion Funnel Stage Ordering kept verbatim. Post-Batch Funnel Reevaluation Pass rewritten: each of the seven triggers now maps to a specific operation (`ADD_TOPIC` + `MOVE_KEYWORD`, `MOVE_KEYWORD`, `SPLIT_TOPIC`, `MERGE_TOPICS`, `MOVE_TOPIC`, `MOVE_TOPIC` (relationship change), `ADD_TOPIC` + `MOVE_KEYWORD`). The "never delete topics entirely" V2 constraint replaced with explicit `DELETE_TOPIC` rules (must have no children, requires `reassign_keywords_to`, accepts the literal `"ARCHIVE"` for irrelevant-keyword path). Reevaluation Report block deleted from output — operations carry `reason` fields inline. Output instruction tightened: emit exactly one delimited block (`=== OPERATIONS === ... === END OPERATIONS ===`); no markdown fences, no commentary outside the block; empty operation list is valid output.

**3. Topics Layout Table Primer V3.** CONTEXT and HOW TO READ THE TABLE blocks kept (with stable-IDs in the example). WHAT THE TOPICS LAYOUT TABLE IS rewritten to clarify the AI receives the table as TSV input but does NOT re-emit it. New INPUT TABLE COLUMNS section: 9-column TSV with Stable ID as the first column (the AI's reference handle), plus Title, Description, Parent Stable ID, Relationship, Conversion Path, Stability Score, Sister Nodes, Keywords (each keyword formatted `<uuid>|<text> [p|s]`). New THE OPERATION VOCABULARY section: full spec of all 13 operations matching `operation-applier.ts` exactly — required fields, plain-English semantics, applier-handled side effects (e.g., MERGE auto-reparents children + rewrites sister links; SPLIT/DELETE drop sister links; aliases resolve at apply time; ARCHIVE_KEYWORD removes ALL placements). New CROSS-CUTTING RULES section: atomic batch apply, sequential ordering, alias rules, keywords-by-UUID, reasons on structural ops, JUSTIFY_RESTRUCTURE 6-field payload at stability ≥ 7.0 with full field spec. New GENERAL CONSTRAINTS section: 13 numbered rules covering deletion-via-DELETE_TOPIC (replaces V2 "never delete"), no-orphan-keywords (REMOVE_KEYWORD legal only with another placement), parent-cycles forbidden, Conversion Path read-only, stability scores read-only, complete upstream chains, etc. New OPERATION SYNTAX block: JSON Lines inside `=== OPERATIONS ===` / `=== END OPERATIONS ===`; snake_case keys throughout. Worked example with three operations (ADD_TOPIC + ADD_KEYWORD + MOVE_KEYWORD) shown verbatim.

**4. V2 file untouched.** `docs/AUTO_ANALYZE_PROMPT_V2.md` remains as-is at its 2026-04-18 canonical state. It is the historical record of what was actually pasted into the production UI through every Bursitis run including the Session-3b verification — preserving it lets us cite "behaviour X happened on V2 prompts" in any future post-mortem. V3 is the new canonical the director re-pastes after this session; future cleanup session will archive V2 once V3 is field-validated through Pivot Sessions D and E.

**5. V2 proposed-changes file (`docs/AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md`) is now mostly superseded** by the operation-based contract. The pieces that survived (Change 1 tie-breaker rule; Change 3 Step 4b Comprehensiveness Verification with the redrafted math; Change 4 JUSTIFY_RESTRUCTURE 6-field payload; Change 5 multi-placement-is-a-feature) were folded directly into V3 with their locked wording. The pieces that did not survive (the standalone Reevaluation Report block, the "never delete topics" rule, the per-batch full-table-rewrite output format) are obsolete by construction. The proposed-changes file remains untouched this session and can be archived in a future cleanup.

**6. Three design questions resolved during the session's drift check** (locked with director's go-ahead):
- **Operation output syntax = JSON Lines.** One self-contained JSON object per line, no top-level array, inside a `=== OPERATIONS ===` / `=== END OPERATIONS ===` block. Reversible if Pivot Session D's parser favors a different shape.
- **Input-state format = TSV with Stable ID as first column.** Matches V2's TSV familiarity for the model; debuggable by humans who paste into a sheet; first column gives the AI a clean handle for operations. Reversible.
- **Reevaluation Report block = scrapped.** Operations carry `reason` fields inline; the reasons collectively are the audit log. Comprehensiveness Check is an internal per-keyword self-check (Step 4b); the operations themselves are the verifiable artifact admin reviews.

**Build / safety status:** This session changed only docs. No `npm run build` rerun needed. No DB. No code paths touched. The AutoAnalyze panel still pastes V2 from localStorage / the panel's React state until the director manually re-pastes V3 into the panel before the next test run.

**Next session — Pivot Session D** — Wire `applyOperations` into the Auto-Analyze rebuild path; build the V3-shaped input-TSV serializer; verify end-to-end on a fresh test Project; verify keyword-loss rate drops to zero on a populated test Project; run a single Bursitis batch as the cost-comparison data point.

---

### Pivot Session D — ✅ COMPLETE (2026-04-25, this session)

Wiring + validation session. Code shipped + live-tested on Bursitis. 7 commits pushed in-session (1 main wiring + 5 mid-session bug fixes + 1 diagnostic enrichment). **Real-world cost-comparison data point in hand.**

**1. New wiring layer `src/lib/auto-analyze-v3.ts`** (~470 LOC, pure-data, no I/O). Four exported helpers:
- `buildOperationsInputTsv(nodes, sisterLinks, keywords)` — emits the 9-column TSV per AUTO_ANALYZE_PROMPT_V3.md ("INPUT TABLE COLUMNS"): Stable ID, Title, Description, Parent Stable ID, Relationship, Conversion Path, Stability Score, Sister Nodes, Keywords (each formatted `<uuid>|<text> [p|s]`). Header row first, then rows sorted by stableId integer suffix (deterministic). Empty canvas → header row only. Tab/newline-safe sanitization on title/description.
- `parseOperationsJsonl(rawResponse)` — extracts the `=== OPERATIONS === ... === END OPERATIONS ===` block, parses each non-blank line as JSON, translates snake_case keys (`op`, `new_parent`, `justify_restructure` with snake_case sub-fields, etc.) to the camelCase Operation discriminated union from `src/lib/operation-applier.ts`. Returns `{operations, errors}`. Empty operations list with no errors is valid (rare but legal — see V3 prompt). Malformed lines reported per-line; valid lines still parsed.
- `buildCanvasStateForApplier(nodes, sisterLinks, nextNodeId)` — translates live Prisma rows to the applier's pure-data shape. Resolves integer parentId → parent stableId. Expands `kwPlacements` `'p'`/`'s'` to `'primary'`/`'secondary'`. Canonicalizes sister links. Seeds `nextStableIdCounter = nextNodeId` so applier-issued stableIds are `t-N` with N matching the integer id we'll persist.
- `materializeRebuildPayload({originalNodes, originalSisterLinks, originalPathwayIds, applierNewState, nextPathwayId})` — translates applier output back to a `/canvas/rebuild` POST body. New nodes get integer ids = the integer suffix of their applier-issued `t-N` stableId (which can't collide because we seeded the counter past the global max). Pathways: existing nodes keep their pathway; new root-level topics get a fresh pathway; nested topics inherit their root's pathway (via parent-chain walk). Sister-link + node + pathway diffing handles deletions.

**2. New unit-test file `src/lib/auto-analyze-v3.test.ts`** (28 tests, all passing). Covers serializer (TSV shape + sort order + sister-links + multi-placement + sanitization), parser (snake_case translation + null/missing relationship handling + error reporting + unknown ops), CanvasState builder (parentId resolution + p/s translation + counter pass-through + sister-link canonicalization), end-to-end (ADD_TOPIC + ADD_KEYWORD on empty canvas; existing canvas + new child preserves parent's id and pathway; DELETE_TOPIC ARCHIVE returns archived keyword id; ADD_SISTER_LINK appears in payload.sisterLinks; REMOVE_SISTER_LINK queues original link id for deletion). Combined with the 43 applier tests = **74 tests pass**. Run with `node --test --experimental-strip-types src/lib/auto-analyze-v3.test.ts`.

**3. `AutoAnalyze.tsx` integration.** New `outputContract` setting (`'v3-operations'` default | `'v2-tsv'` legacy), persisted via `UserPreference` + checkpoint. New UI picker in the config section labeled "Output contract". New `assemblePromptV3` (V3 prompts only — `AA_OUTPUT_INSTRUCTIONS` NOT appended since V3 prompts contain their own operations-block instructions; user content includes the input TSV plus the batch keywords with UUID + text + volume). New `processBatchV3` (calls API, returns BatchResult with raw response in `topicsTableTsv` slot for compatibility). New `validateResultV3` (parses operations, dry-run applies via `applyOperations` for validation, surfaces errors as correction context, checks every batch keyword ended placed-or-archived). New `doApplyV3` (fetches canonical canvasState; runs applier; materializes rebuild payload; runs canvas-layout pass; POSTs to `/canvas/rebuild`; POSTs each `ARCHIVE_KEYWORD` intent to `/removed-keywords` with `removedSource='auto-ai-detected-irrelevant'`; updates keyword.topic + canvasLoc; runs same P3-F7 status reconciliation as V2; verifies all batch keywords landed). `runLoop` and `handleApplyBatch` dispatch on `outputContractRef`. V2 code paths preserved as defense-in-depth and selectable. `BatchObj` interface gains optional `_v3Ops` to stash parsed operations across BATCH_REVIEW pauses. ~444 lines added to AutoAnalyze.tsx; build clean.

**4. `CanvasNode` type extended in `src/hooks/useCanvas.ts`** with `stableId: string` + `stabilityScore: number` (additive; `/canvas/nodes` GET already returned them via Prisma findMany).

**5. End-to-end live validation on Bursitis** (5+ batches across multiple runs):

| Metric | V2 baseline | V3 actual (median Bursitis batch) | Improvement |
|---|---|---|---|
| Output tokens | 110,245 | 15K–27K | ~5× |
| Cost per batch | $1.89 | $0.27–$0.46 | ~4–7× |
| Wall-clock per batch | ~26 min | ~5–7 min | ~4× |
| Keyword loss per batch | variable | **0** | ✅ structural |

Reconciliation pass after every successful apply reported `0 off-canvas → Reshuffled` — meaning no previously-AI-Sorted keyword was bumped off the canvas by the new batch. The "silence is preservation" architectural property held in production. Real cost is meaningfully above the design's optimistic $0.03–0.10 estimate (output dominates because each operation is ~100–300 tokens and the AI emits 15–25 ops per batch on a still-growing canvas) but the structural keyword-preservation win is the bigger architectural claim and it's solid.

**6. Five mid-session bugs caught + fixed in flight** (full root-cause + fix detail in `CORRECTIONS_LOG.md` 2026-04-25 Pivot-Session-D entry; commits in chronological order):

| # | Commit | Bug | One-line fix |
|---|---|---|---|
| 1 | `c3d2a80` | Applier rejected ADD_TOPIC root topics with null relationship | Skip linear|nested check when `parent === null`; widened type to `Relationship | null` |
| (diag) | `1c44238` | `/canvas/rebuild` 500 hid Prisma error | Add `detail` field with underlying error message (truncated 1KB) |
| 2 | `6b70913` | Prisma 6 P2025 on `prisma.canvasNode.upsert` | Switch where to `projectWorkflowId_stableId` composite from Pivot Session B |
| 3 | `43f773f` | Global-PK collision on `CanvasNode.id` | `/canvas` GET autoheal uses global max instead of per-project max |
| 4 | `d485cf9` | Synthesized CanvasState missing for projects with no row | Return defaults with global-max-aware counters when row absent |
| 5 | `d624556` | BATCH_REVIEW screen always showed "Topics: None" for V3 | Populate `newTopics` from parsed ADD_TOPIC operations |

**7. Three cosmetic items deferred** (per Rule 14e — captured in Infrastructure TODOs above):
- `keywordScope` activity-log label drift (cosmetic ~3-line fix)
- `CanvasNode.id` global-PK schema design issue (proper fix needs migration)
- `handleCancel` / `handleResumeCheckpoint` in-progress batch status cleanup (cosmetic ~10-line fix)

**Build / safety status:** `npm run build` clean across every commit (17/17 pages, zero TypeScript errors); `node --test` 74/74 pass. No DB schema changes (Pivot Session B already shipped them). Live data state after this session: Bursitis canvas grew to 31 nodes (V3 created 24 new topics across the test batches with full upstream chains + sister links + correct keyword placements); some keywords flipped from Unsorted → AI-Sorted via the V3 reconciliation pass; no keyword loss; no node loss.

**Next session — Pivot Session E** — Migration to operations-default + deprecation plan for V2 band-aid code paths. Address the 3 cosmetic Infrastructure TODOs as part of the same session.

---

### Sessions 4-6 (PRE-PIVOT PLAN — kept for reference; supersedes if pivot proceeds)

**Session 4 — Changes Ledger foundation** *(MAY BE SUPERSEDED by pivot — see above. If pivot proceeds, this re-scopes to "Changes Ledger UI" only since the operation list itself becomes the ledger):*
- Design and implement `ai_action_ledger` DB table (schema TBD; provenance fields per P3-F1).
- Implement Changes Ledger UI panel in Auto-Analyze (filterable by action type / mode / admin status).
- Implement dependency-DAG for batch actions so cascading redos work correctly.
- Wire up Changes Ledger writes from each batch completion.
- Commit + push.

**Session 5 — Stability scoring foundation + stable topic IDs** *(STABLE-IDs PORTION PROMOTED into pivot Session A as a hard prerequisite; stability scoring portion remains as standalone polish):*
- ~~Add stable_id field to topics in DB; migrate existing topics.~~ **→ moved to Pivot Session A.**
- ~~Update prompt output contract to use stable IDs for RENAME/MERGE/SPLIT/DELETE operations~~ **→ moved to Pivot Session C.**
- Implement stability_score computation per `MODEL_QUALITY_SCORING.md`.
- Inject stability metadata into prompts.
- Commit + push.

**Session 6 — Prompt modifications (merge `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` into V2)** *(MOSTLY SUPERSEDED by pivot Session C's full prompt rewrite. The 7 proposed changes from Session 2b would mostly live inside the new operation-based prompt — Change 3 DELETE row type becomes the `DELETE_TOPIC` operation; Change 4 JUSTIFY_RESTRUCTURE payload attaches to RENAME/MERGE/SPLIT/MOVE_TOPIC operations on stability-score ≥7 topics; Change 6 salvage template stays as runtime tool code; Changes 1/2/5/7 wording refinements survive into the new prompt):*
- Wording refinements + Q4/Q5/Q6 resolutions already locked in during Session 2b — Session 6 is mechanical merge.
- Initial Prompt V2 insertions at the 2026-04-18-committed line references (verified zero-drift in Session 2b): Change 5 after line 88, Change 1 after line 104, Change 3 (redrafted per Session 2b) after line 116, Change 4 (6-field JUSTIFY_RESTRUCTURE payload) before line 137 (Step 7), Change 2 Loc 1 replaces line 131, Change 2 Loc 2 replaces line 163, Change 7 appends point (e) to Section 5.
- Primer V2 updates (Q6 resolution): add `Stability Score` to COLUMN DEFINITIONS; add parsing rule 12 (float default 0.0 clamped [0.0, 10.0]); add rule 16 to RULES AND CONSTRAINTS (preserve existing, emit 0.0 for new, structural changes to ≥7.0 require JUSTIFY_RESTRUCTURE); update OUTPUT FORMAT header to 10 columns; add output rule for one-decimal float.
- Change 6 salvage template is tool-code (not canonical V2) — code merge happens in Session 3.
- **Prerequisite:** Session 5 must ship stability scoring (score computation + metadata flow through rebuild endpoint) BEFORE Session 6 merges the prompt text that references it. Otherwise the prompt will reference `Stability Score` column with no score data flowing.
- Director re-pastes updated prompt into Auto-Analyze UI.
- Run small test project to validate changes don't regress.
- Commit: prompt doc only.

**Session 7-9 — Human-in-Loop mode (first-class):**
- Multi-session build. UI, state machine, pending-approval flow, cascading redo via DAG, two-box feedback (specific + Global Rule), session resume, keyboard shortcuts, batch pausing, bulk approve, side-by-side compare, reasoning pane, session-history sidebar, export review transcript, admin-confidence tag per approval.
- First-class mode = full radio-group peer with Auto-Apply and Review-Each-Batch modes.
- Per `AI_TOOL_FEEDBACK_PROTOCOL.md` §2.2.

**Session 10-12 — Feedback Repository (3 phases per `AI_TOOL_FEEDBACK_PROTOCOL.md` §3):**
- Phase 1 — DB table `ai_feedback_records` + write paths from Human-in-Loop UI + regular-mode feedback inputs.
- Phase 2 — Read-back / few-shot injection into prompts at generation time.
- Phase 3 — Pattern analysis (Claude Code periodically analyzes repo; proposes improvements).

**Session 13 — Cost Ledger + Model Registry:**
- `api_cost_ledger` DB table + UI for manual-entry + estimated-vs-actual + totals.
- `ai_models` DB table + admin settings page for add/deprecate.
- Prominent in-run cost panel (addresses P3-F9 small-text concern).

**Session 14 — Feedback-summarization-to-prompt-improvements button (Q2 suggestion):**
- Button in Auto-Analyze UI that engages a model (Opus 4.7) to analyze all feedback entries + current prompts, propose specific prompt additions/modifications, return as diff for admin review.
- Think about this as a meta-tool: model-1 runs the Auto-Analyze; model-2 analyzes model-1's feedback to improve model-1's prompts. Process, meta-prompt, and provider selection to be designed in this session.

**Session 15+ — Parallel chat workflow-fundamentals integration:**
- Director is running a parallel chat about reworking the Auto-Analyze workflow at the fundamentals level. Once director shares conclusions, integrate into this roadmap. **Reminder for future sessions: ASK DIRECTOR for the parallel chat's conclusions at or before Session 5.**

**Session X — Layout polish (canvas issues, table row numbers, copy-table button, depth-0/1 indentation rule, search-in-canvas, depth indicators):**
- Scope covers all the director's 2026-04-20 "add to roadmap" items.

**Session Y — Auto-Remove Irrelevant Terms button:**
- Director requested explicit deferral — do NOT program this without being prompted. Ask director for specifics when this item comes up.

**Session Z — Prompt-sync button in Auto-Analyze + Prompt-editor panel in UI:**
- Previously on roadmap; retain position.

**Session AA — Cross-provider abstraction (Gemini, GPT, Perplexity):**
- Requires abstracting API client layer from Anthropic-specific.
- Phase-2-sized work; not urgent in Phase 1.
- **Phase 1-polish items — accumulated across kickoff + follow-up sessions:**
  - **Auto-Analyze overlay resize + move + persistence** (refined 2026-04-18 follow-up): overlay should be resizable by dragging the bottom-right corner or any edge, movable by dragging the top bar, AND the adjusted size + position should persist in localStorage (survives page refresh, per-user-per-device).
  - **Prompt-sync button in Auto-Analyze** (NEW 2026-04-18 follow-up): one-click button in the AA panel that syncs the currently-displayed Initial + Primer prompts back to `docs/AUTO_ANALYZE_PROMPT_V2.md` in the repo via a new server-side endpoint + GitHub API (PAT stored as Vercel env var). **Design question to resolve at implementation time:** stay with "repo is source of truth" (button = one-way UI→repo sync) vs. move prompts into DB and keep repo copy as a snapshot. First is simpler; second fits the platform's general "persist in DB, not localStorage/file" pattern.
  - **Persist Auto-Analyze settings in `UserPreference`** (carried from kickoff session) so prompts, apiKey, model, etc. survive panel close / page refresh even before a run starts.
  - ⚠️ **Proactive Mode A → Mode B switch — DOWNGRADED 2026-04-20 from "functional prerequisite" to "cost-optimization option, pending qualitative comparison"**: The 2026-04-19 session framed this as a functional prerequisite because Mode A was projected to hit the 200k context wall. The 2026-04-20 run (51 full batches, Mode A ran clean for 39 batches on canvas of 95 nodes before reactive switch fired at a narrow 1-topic/1-keyword slip; never hit the context wall) RE-OPENED the question. Director confirmed Mode A qualitative output was markedly superior to Mode B. The proactive switch remains a valid cost/time optimization, but should NOT be implemented before qualitative A/B comparison confirms Mode B can produce comparable structural quality. **Director's decision locked in 2026-04-20:** keep Mode A as default; add multi-trigger safety nets (see next item); accept higher cost as quality tax. Retain proactive switch as a future optimization to be validated, NOT a prerequisite.
  - 🎯 **Multi-trigger Mode A → Mode B safety nets (NEW 2026-04-20, REPLACES the single-trigger reactive switch as the safety model):** Stack multiple independent triggers so switch behavior is deterministic, not luck-dependent. Triggers: (1) Reactive — already shipped (HC4/HC5 validation failure or truncation). (2) Token-budget — fires when input tokens pass a safe threshold like 150k (well below 200k context wall), even if Mode A output is "clean." (3) Batch-count or canvas-size — admin-configurable optional; default OFF. (4) Manual — admin can press "Force Mode B from next batch" mid-run. Implementation: modify `runLoop` in AutoAnalyze.tsx to evaluate all active triggers before each batch; first-matching trigger switches. Complements, does not replace, the reactive trigger.
  - **Row-count self-check in Mode A prompt** (NEW 2026-04-18 follow-up): add language to the Initial Prompt V2 asking the AI to count existing rows in its input and verify its output contains the same count of pre-existing rows plus new additions. Reliability uncertain (LLMs are bad at self-policing output-length constraints) but worth trying as belt-and-suspenders. Docs edit in `docs/AUTO_ANALYZE_PROMPT_V2.md`, not a code change.
  - **Cap Mode A batch size** (NEW 2026-04-18 follow-up): cap Mode A batches at 4 keywords (vs. adaptive's 8/12/18 tiers) until the switch to Mode B occurs. Reduces Mode A output token count and thus attention-dilution surface area. Marginal help only — attention issue comes from the *existing* table size, not new-batch size — but cheap to implement.
  - **Add Haiku 4.5 to the Model dropdown** (NEW 2026-04-18 follow-up): AutoAnalyze currently supports model selection but Haiku 4.5 isn't listed in the dropdown options. Small code addition to the `<select>` in AutoAnalyze.tsx settings panel. Required prerequisite for the comparative-testing item below.
  - **Comparative Mode A robustness testing across Opus 4.7 / Sonnet 4-6 / Haiku 4.5** (NEW 2026-04-18 follow-up, depends on Haiku integration): run a small test Project through Mode A with each of the three current models and see which exhibits least dropped-rows / lost-keywords behavior. Informs model default recommendation in the UI.
  - **Include failed-attempt costs in tool's Total Spent** (NEW 2026-04-18 follow-up): when a batch's API call succeeds (tokens spent) but validation fails and triggers a retry or Mode switch, the Anthropic charges are still incurred but the tool's cost tracker only counts successful validations. Example from follow-up session: batch 2's Mode A attempt consumed ~33k output tokens (≈$0.50 cost to Anthropic) but "Total spent" reflected only the Mode B retry's $0.399. Fix: accumulate all attempts into cost tracking, differentiate applied-vs-rejected tokens in the display if useful.
  - **Changes Ledger (NEW 2026-04-20, HIGH PRIORITY):** Filterable, sortable table showing every AI-proposed change per batch with full provenance (mode, model, batch #, settings, stability score of affected topics, admin status). Filters: action type (topic create / rename / merge / split / delete / keyword move / keyword add / keyword remove / facet promotion), mode (A/B), admin action status (pending / approved / redone / rejected), date/batch range. Dependency-aware redo: rejecting a parent action automatically flags dependent child actions as "pending — their parent is under revision" via a per-batch DAG. Present in BOTH regular Auto-Analyze mode (as post-hoc audit + feedback entry surface) AND Human-in-Loop mode (as interactive approval surface). Feeds the `ai_feedback_records` repository. See `AI_TOOL_FEEDBACK_PROTOCOL.md` §2.3.
  - **Human-in-Loop first-class review mode (NEW 2026-04-20, HIGH PRIORITY):** Full-fledged review mode on equal footing with Auto-Apply and Review-Each-Batch. Admin reviews each proposed action with Approve / Redo / Reject actions and two text inputs: Specific feedback (this-decision-only, fuels immediate Redo re-analysis) and Global Rule (cross-project training data, written to feedback repo). Additional features per `AI_TOOL_FEEDBACK_PROTOCOL.md` §2.2: batch pausing, bulk approve, side-by-side before/after compare, expandable reasoning pane per action, keyboard shortcuts (A/R/N/Shift+A/Space), session-history sidebar, export review transcript, optional admin-confidence tag per approval, session-resumable across devices. Multi-session build (Sessions 7-9).
  - **Feedback Repository (NEW 2026-04-20, HIGH PRIORITY):** See `AI_TOOL_FEEDBACK_PROTOCOL.md` for full spec. DB table `ai_feedback_records` stores every admin action with full context snapshot. Three phases: Phase 1 capture only; Phase 2 read-back/few-shot injection into prompts; Phase 3 pattern analysis by Claude Code. Platform-wide — every AI-using tool must integrate (mandatory baseline for all new workflow tools). Schema includes project_id, tool, ai_model, ai_mode, decision_type, decision_payload, admin_action (approve/redo/reject), admin_specific_feedback, admin_global_rule, context_snapshot, quality_score. See also `MODEL_QUALITY_SCORING.md`.
  - **Stability scoring algorithm (NEW 2026-04-20):** See `MODEL_QUALITY_SCORING.md`. Per-topic stability_score (0-10) accumulates from age, admin approvals, kept keywords, cross-batch consistency, cross-project precedent. Decays from admin rejections, moved-out keywords, model self-disagreement. Score >=7 requires JUSTIFY_RESTRUCTURE payload from model for structural modifications. Admin scoring (1-5) optional during Human-in-Loop review. Meta-note on how algorithm was derived lives in the MODEL_QUALITY_SCORING.md doc — future sessions can propose weight changes with rationale.
  - **Stable topic IDs (NEW 2026-04-20, HIGH PRIORITY — prerequisite for Changes Ledger accuracy):** Currently the tool identifies topics by exact title-string match, which means renames look like "new topic" to the diff detector. Fix: each topic gets a persistent stable_id on creation; model's structured output refers to topics by ID for RENAME / MERGE / SPLIT / DELETE operations; admin still sees titles in UI. Enables accurate change detection and feeds directly into Changes Ledger + stability scoring. Requires: DB field addition, prompt output-contract redesign, migration of existing topics. Session 5 scope.
  - **Irrelevant Keywords floating topic (NEW 2026-04-20):** Special free-floating topic on the canvas that the model can use as a runtime safety valve when batch keywords are semantically unrelated to the niche (e.g., "bursa" the Turkish city in a bursitis niche). Model parks unrelated keywords here rather than forcing them into an awkward topic or dropping them. Admin reviews Irrelevant Keywords topic in human-in-loop UI or Changes Ledger → confirms irrelevance (→ flows to Removed Terms table) or corrects placement. Addresses P3-F4 homograph problem. Prompt modification required (instruct model to use this topic for clearly-irrelevant keywords).
  - **Pending Deletion canvas region (NEW 2026-04-20):** Separate visual zone on the canvas (top-right quadrant, light-red dashed border, label "Pending Deletion") where the model parks topics it proposes to delete. Topics there render greyed-out with "⚠ pending" badge; keywords formerly under these topics stay attached until admin decides. Admin review via canvas click or Changes Ledger shows: model's deletion reason, affected keywords + proposed new homes, affected sub-topics + proposed new parents. Actions: Approve Deletion (cascade executes) / Reject (topic returns to normal) / Redo (back to model with feedback). Pairs with topic-delete DELETE row-type in prompt output contract.
  - **Salvage-ignored-keywords mechanism (NEW 2026-04-20):** When a batch has "Missing N batch keywords" (same-batch keywords not placed), tool spawns a targeted follow-up prompt (see `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` Change 6) that asks the model to either place the missed keyword OR flag it as irrelevant. Avoids re-running the full batch. DOES NOT apply to "Lost N keywords" (previously-placed erased) — that's a structurally broken response; use full-batch retry instead. Also logs each salvage event to activity log AND Changes Ledger.
  - **Model Registry (NEW 2026-04-20):** DB table `ai_models` with fields {provider, model_id, display_name, status (active/deprecated), release_date, deprecation_date, input_price_per_1m, output_price_per_1m, capabilities_json}. Tool dropdowns read from the registry. New models: admin adds a row → appears in all tools platform-wide. Deprecated: greyed-out-but-selectable with warning + suggested replacement. Retained for audit/reproducibility. Phase-1 interim: Opus 4.7 + Haiku 4.5 hardcoded add in Session 3 to unblock testing.
  - **Cost Ledger (NEW 2026-04-20):** DB table `api_cost_ledger` with fields {id, project_id, tool, date, estimated_amount, actual_amount, source_note, created_by, created_at}. UI: "Add API Cost Manually" button in each AI-using tool → modal with new-row form. Summary page with rows by date, running totals per tool per project, grand total, estimated-vs-actual variance. In-run display: prominent cost panel near progress bar showing "Running total: $X estimated | Projected final: $Y" + "Actual (billing): $Z (not yet entered)." Projected final = current-batch-average × remaining batches.
  - **Feedback-summarization-to-prompt-improvements button (NEW 2026-04-20):** Button in Auto-Analyze UI that engages a model (recommended: Opus 4.7) to analyze all `ai_feedback_records` entries + current Initial/Primer prompts + propose specific prompt additions/modifications with rationale. Admin reviews proposed changes as a diff, approves/edits/rejects. Approved changes merge into prompts. Think about this as a meta-tool: model-1 runs Auto-Analyze; model-2 analyzes model-1's feedback to improve model-1's prompts. Design details (meta-prompt, provider, output format) to be specified at implementation time (Session 14).
  - **Cross-project training corpus (NEW 2026-04-20, long-term):** Use raw-keywords-input + admin-approved-final-canvas pairs as training data. Two paths: (i) few-shot/retrieval-augmented — include relevant completed-project examples in prompts at generation time; works today, effective from 1-5 good examples; 20+ is sweet spot. (ii) Fine-tuning — retrain model weights on paired examples; not currently exposed via public Claude API; requires 100-500+ projects typically. Practical path: few-shot from day 1, fine-tuning when corpus reaches scale (~Phase 3).
  - **Activity Log v2 (NEW 2026-04-20):** Detailed per-batch entries replacing the current "Unusually high: N new topics" single-metric. New format breaks down: "Renamed: X / Restructured: Y / Truly new: Z / Unchanged: W / Deleted: V / Merged: U / Split: T." Actionable signal instead of alarm-noise. Depends on stable topic IDs (Session 5) for accurate classification.
  - **Independent AST-table post-batch verification (NEW 2026-04-20):** Don't trust the AI's "all 8 keywords verified on canvas" claim at face value. Tool independently re-scans the AST table after each batch apply, flags any keyword whose status wasn't correctly updated to AI-Sorted, logs the discrepancy to activity log + Changes Ledger, and re-queues any orphaned keywords into a subsequent batch. Addresses P3-F7. Session 3 scope.
  - **Prompt modifications staged (NEW 2026-04-20):** See `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` for 7 specific proposed prompt changes (tie-breaker "default to existing topic"; cross-canvas low-volume consolidation scan; comprehensiveness verification Step 4b; stability-score metadata handling Step 6b; multi-placement reinforcement; salvage-ignored-keywords follow-up prompt; session-boundary continuation reinforcement). Each change has exact wording + exact placement in the V2 prompt doc. Director reviews in Session 6; approved changes merged.
- **Phase 1-verify:** Verify canvas rebuild edge cases (large batches, node deletion overlap, pathway updates)
- **Phase 1-gap:** Port remaining KST features (see §below for full list)
- **Phase 1-persist:** Migrate must-persist localStorage items to database (MT Table, Removed Terms, etc.)
- **Phase 1h:** UX polish (keyboard shortcuts, accessibility)

#### Workflow 2 — Competition Scraping & Deep Analysis (🔍)
**Status:** ❌ NOT STARTED

**Prerequisite:** Phase 1α — Shared Workflow-Tool Scaffold must be designed and built BEFORE this workflow begins. Per `PLATFORM_REQUIREMENTS.md §12` and `HANDOFF_PROTOCOL.md` Rule 20.

**Next step:** Workflow Requirements Interview (per HANDOFF_PROTOCOL Rule 18), producing `COMPETITION_SCRAPING_DESIGN.md`. The interview will cover: purpose, users, throughput, inputs (from Keyword Clustering), outputs, readiness rules, UX shape, concurrency, review cycle, audit, reset, data persistence, quality bar, scaffold fit.

#### Workflow 3 — Therapeutic Strategy & Product Family Design (🧬)
**Status:** ❌ NOT STARTED. Prereq: scaffold + Workflow 2 Data Contract.

**Forward-directive captured 2026-04-27 (per `HANDOFF_PROTOCOL.md` Rule 21):** when this workflow displays topics + keywords (which it will, since therapeutic strategy depends on the W#1 keyword-clustered conversion funnel as input), it must use the platform-wide **search-volume display + bold-by-threshold convention** established for W#1's canvas. Spec: each topic displayed shows two volume totals (primary keywords total in primary color + secondary keywords total in secondary color); each keyword shows its volume in parentheses to the right; keywords with volume ≥ Auto-Analyze threshold are bold, below are not bold. See the W#1 ROADMAP entry "NEW Phase-1 polish item — Search-volume display on canvas topic boxes + cross-tool display convention (raised 2026-04-27)" for the full spec. This directive must be surfaced as the FIRST item of the W#3 Workflow Requirements Interview when it happens.

#### Workflow 4 — Brand Identity & IP (🏷️)
**Status:** ❌ NOT STARTED.

#### Workflow 5 — Conversion Funnel & Narrative Architecture (🎯)
**Status:** ❌ NOT STARTED. Prereq: scaffold + W#1, W#2, W#3, W#4 Data Contracts.

**NARRATIVE-DRIVEN COMPREHENSIVENESS — director directive captured 2026-04-26:**

Topic creation in PLOS has TWO layers:

1. **Keyword-driven comprehensiveness — Workflow #1's job.** Each keyword is decomposed into compound intent + component dimensions; primary placement at the most-specific compound topic + secondary placements at each dimension topic ensure every facet has a topic home; bridge topics + complementary topics are created when the dimension pattern suggests them. This is what's specified in `AUTO_ANALYZE_PROMPT_V3.md` (Strategy 3 layered placement + intent-equivalence rule). Workflow #1's complement-detection (Step 4c) is bounded — it operates only on keyword-surfaced dimensions with natural complements (age → young/old, gender → men/women, severity → mild/severe, etc.).

2. **Narrative-driven comprehensiveness — Workflow #5's job.** AFTER Workflow #1's keyword-driven pass, the conversion funnel is reviewed for **narrative gaps that no keyword surfaced**. Director's explicit example: given existing topics "How bursitis affects you differently based on age" and "How bursitis affects men and women differently", Workflow #5 may identify that a higher-level unifying parent "How does bursitis affect different people differently depending on their situation" is needed for narrative cohesion, AND that a sibling such as "Bursitis in athletes" should be added even though no keyword surfaced it — because it plugs a hole in the conversion funnel that allows for smoother **overarching narratives** (across the funnel from awareness to conversion), **micro-narratives** (within a single page or section), and **cross-narratives** (where a link within one piece of text connects to another piece of text on another page).

**The goal is not comprehensiveness for its own sake — it is to plug holes in the conversion funnel so narratives flow smoothly.** Topics added at this stage may have NO primary keywords and few or no secondary keywords; they exist purely to scaffold the narrative path from awareness to conversion. This is broader than W#1's complement-detection — W#5 generates topics from a holistic narrative-arc view of the funnel, not from keyword-surfaced dimension patterns.

**Reminder mechanism (per `HANDOFF_PROTOCOL.md` Rule 21):** when the Workflow #5 design session begins, this directive must be explicitly surfaced to the director at the start of the session. The Workflow Requirements Interview for W#5 must treat narrative-driven comprehensiveness as a first-class design requirement, not an afterthought. Forward-pointer to this entry is in `DATA_CATALOG.md` §6.4 to ensure the W#5 design session loads it.

**Build prerequisites:** Shared Workflow-Tool Scaffold (Phase 1α), W#1 Data Contract, plus dependencies on W#2, W#3, W#4 Data Contracts (which produce the competitive landscape, product-strategy, and brand-identity data the funnel must accommodate). Full Workflow Requirements Interview happens at W#5 design time.

**Forward-directive captured 2026-04-27 (per `HANDOFF_PROTOCOL.md` Rule 21):** when this workflow displays topics + keywords (which it will, since the conversion funnel is built directly on top of W#1's topic hierarchy + augmented per the narrative-driven directive above), it must use the platform-wide **search-volume display + bold-by-threshold convention** established for W#1's canvas. Spec: each topic displayed shows two volume totals (primary keywords total in primary color + secondary keywords total in secondary color); each keyword shows its volume in parentheses to the right; keywords with volume ≥ Auto-Analyze threshold are bold, below are not bold. See the W#1 ROADMAP entry "NEW Phase-1 polish item — Search-volume display on canvas topic boxes + cross-tool display convention (raised 2026-04-27)" for the full spec. This directive must be surfaced as the SECOND item of the W#5 Workflow Requirements Interview (the first is the narrative-driven-comprehensiveness directive captured 2026-04-26 above).

#### Workflow 6 — Content Development (✍️)
**Status:** ❌ NOT STARTED.

#### Workflow 7 — Multi-Media Assets & App Development (🎬)
**Status:** ❌ NOT STARTED.

#### Workflow 8 — Marketplace Optimization & Launch (🏪)
**Status:** ❌ NOT STARTED.

#### Workflow 9 — Clinical Evidence & Endorsement (🔬)
**Status:** ❌ NOT STARTED.

#### Workflow 10 — Therapeutic Engagement & Review Generation (💊)
**Status:** ❌ NOT STARTED.

#### Workflow 11 — Post-Launch Optimization (📈)
**Status:** ❌ NOT STARTED.

#### Workflow 12 — Compliance & Risk Mitigation (⚖️)
**Status:** ❌ NOT STARTED.

#### Workflow 13 — Exit Strategy & Portfolio Management (🚪)
**Status:** ❌ NOT STARTED.

#### Workflow 14 — Analytics & System Administration (📊)
**Status:** ❌ NOT STARTED.

#### Standalone — Business Operations (⚙️)
**Status:** ❌ NOT STARTED. Not part of the 14-workflow sequence — runs continuously alongside launched products.

### Phase 1α — Shared Workflow-Tool Scaffold
**Status:** 📋 DESIGNED ONLY — no build work

**Prereq to Workflow 2.** Build a reusable shell that provides: standard page wrapper (auth + status + project context), standard topbar, status indicator, deliverables area, workflow-specific content area (pluggable), worker-facing status controls (Phase 2), admin review controls (Phase 2), audit-event emission helper (Phase 2).

Per `PLATFORM_REQUIREMENTS.md §12.4` — scaffold is built once, then each subsequent workflow plugs in.

### Phase 1 polish items — ongoing

(Items that improve Phase 1 tooling but don't block the 14-workflow build order.)

- **Funnel-Order Pass — dedicated AI pass that orders sibling topics by conversion-funnel stage (NEW 2026-04-26, raised by director during Phase-1 polish bundle session):** Today the V3 prompt asks the model to think about funnel ordering (Initial Prompt Step 7, lines 221–234 of `docs/AUTO_ANALYZE_PROMPT_V3.md` — *"Root-level topics represent distinct stages of the conversion funnel, ordered from awareness to purchase"*) but provides no operation in the vocabulary that lets the model express that ordering. PIVOT_DESIGN.md §1.5 deliberately excluded position/size operations because *"Layout is the layout engine's concern; the AI never positions nodes manually."* Result: root-level (depth-1) topics on the canvas appear in the order the model emitted them (essentially internal processing order), not in funnel arc order. Same issue applies to ordering of nested children within a common parent. Director observed this on a populated canvas during the 2026-04-26 polish bundle session.

  **Recommended design (locked in same session, build deferred):**

  1. **Run as a dedicated pass, separate from clustering.** Triggered manually via a new "Order siblings by funnel stage" button in the Auto-Analyze panel (or as a right-click on a parent topic for scoped re-runs). NOT bundled into the clustering batches because: (a) it adds cognitive load to an already-complex per-batch prompt; (b) ordering is canvas-global while clustering is batch-local — a global ordering decision from a partial-canvas view is unstable by design and would shift on every batch.

  2. **Operate per-parent.** One ordering call per parent that has multiple children. Root-level call orders all depth-1 topics among themselves; one call per non-leaf parent for its children. Each call's input is small (just the sibling titles, descriptions, and a short funnel-stage hint) and the output is a small ordered list. A canvas with N non-leaf topics needs ~N calls; a 200-topic canvas might need ~20 calls; total cost in pennies, total wall-clock in minutes.

  3. **Apply via baseY.** Layout engine already sorts each bucket of siblings by `baseY` (`src/lib/canvas-layout.ts` line 224–225 + 257–259). The order pass applies its decisions by overwriting baseY values for the sibling group. Either via a new lightweight operation (e.g., `REORDER_SIBLINGS parent=t-N order=[t-3,t-7,t-1]` — applier translates to evenly-spaced baseY values) OR by adding a `funnelOrder` field to CanvasNode that the layout engine prefers over baseY. Decision deferred to design session.

  4. **Lives in Workflow #1 (Keyword Clustering), NOT Workflow #5.** Workflow #5 (Conversion Funnel & Narrative Architecture) is far away (Workflow #2 hasn't started). Funnel-stage ordering of clustering output needs to work today for keyword-clustering output to be usable. Workflow #5 will do FULL funnel design later (entry points, micro-journeys, asset placement) — pure visual ordering of clustering output is a smaller, cleaner concern that belongs with the tool that produced the canvas.

  5. **Piecemeal feasibility.** Per-parent operation means hundreds of topics are no obstacle — order one parent's children at a time; checkpoint between calls; re-run any parent's ordering after canvas changes without redoing the whole canvas.

  **Manual workaround until built:** layout engine's baseY sort means the admin can drag a topic vertically and the new position is preserved across future layout passes. Useful for small canvases; not scalable.

  **Estimated build:** 1 design session (decide between new operation vs. new field; design the pass UI; design the per-parent prompt) + 1 build session (ship the operation/field, the prompt, the UI button, the state machine for the pass).

  **Priority:** moderate — important for the keyword-clustering output to read as a real funnel for downstream workflows, but not blocking the rest of Phase 1. Schedule alongside or after the other Phase-1 polish items.

- **Keyword Clustering: aiMode persistence (NEW 2026-04-17)** — the Manual/AI toggle on the Keyword Clustering top bar currently resets every time the user opens the page. Would benefit from persisting the last-chosen mode per-user per-workflow (via `UserPreference` table). Low priority — admin will generally use one mode or the other per session. Not blocking any other work.
- **Auto-Analyze prompts edition UI** — currently prompts live in localStorage with no in-tool editor. Add a prompt-editor panel somewhere in AI mode.
- **Export-to-Excel** — Keyword Clustering currently exports as TSV only. Add `.xlsx` export using existing `xlsx` package.
- **Row numbers on all tables (Manual + AI UI) — NEW 2026-04-20:** Admin-facing tables (AST, MT, TIF, KAS, TVT, Topics) gain a leftmost row-number column so admin can reference specific rows by number ("row 47 is placed under the wrong topic"). Must not interfere with existing sort/filter/drag functionality.
- **Search feature in canvas/analysis/topics UI — NEW 2026-04-20:** Text input for filtering. In Analysis and Topics table modes: standard filter-as-you-type. In mindmap canvas mode: searched-for keyword highlights all topics containing that keyword and fades out other topics; clicking outside the highlighted topics clears the search and returns canvas to normal.
- **Depth 0 / Depth 1 indentation rule for Topics table — NEW 2026-04-20:** Currently the single top-level Depth-0 topic makes almost everything else Depth-1+, which makes Depth-0 categorization visually useless. Rule: Depth 1 renders on the SAME visual line as its Depth 0 parent (not right-indented). Depth 2+ continues the normal indentation pattern.
- **Copy-Table button on Topics table — NEW 2026-04-20:** One-click button that copies the entire Topics table to clipboard in TSV or Excel-paste-ready format, preserving visual organization when pasted into Excel/Google Sheets.
- **Auto-Remove Irrelevant Terms button — NEW 2026-04-20, DEFER (director explicit request):** New button in AI UI to the left of Auto-Analyze button. Functionality analogous to Auto-Analyze but flags keywords for removal from AST Table; admin approves/rejects flagged keywords; approved-for-removal terms flow to Removed Terms table. **DIRECTOR EXPLICITLY INSTRUCTED: do NOT program this without being prompted with details.** Future session must ASK director for specifics before implementing.
- **Removed Terms table not displaying removed terms — BUG 2026-04-20:** Director reports the Removed Terms table is not showing terms that have been removed. Code exists in `ASTTable.tsx` and `ast-table.css` — the bug is in the display path, not the absence of the feature. Session 2 investigation scope.
- **Canvas layout fixes — NEW 2026-04-20 (ported from HTML tool):** Node overlap, description overflow outside node boxes, wrong ordering/placement (non-linear paths). These WERE fixed in `keyword_sorting_tool_v18.html` but regressed during React migration. `resolveOverlap` function exists in React code but appears insufficient. Director will upload HTML tool to repo root at `keyword_sorting_tool_v18.html` after 2026-04-20 session. Session 2 diagnostic: compare HTML layout code to current React implementation.
- **Cross-canvas low-volume consolidation (prompt modification) — NEW 2026-04-20:** See `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` Change 2. Current prompt scans only within the current batch for low-volume keyword clusters; needs to also scan pre-existing canvas.
- **Comprehensiveness verification Step 4b (prompt modification) — NEW 2026-04-20:** See `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` Change 3. Model must self-check facet extraction against placement count for each keyword, justify any skipped facets, include a Comprehensiveness Check block in Reevaluation Report.
- **Tie-breaker rule — "when in doubt, place in existing topic" (prompt modification) — NEW 2026-04-20:** See `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` Change 1. Explicit tie-breaker for close decisions + requirement to note close-call decisions in Reevaluation Report.
- **Multi-placement reinforcement (prompt modification) — NEW 2026-04-20:** See `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` Change 5. Explicitly celebrate intentional multi-placement (e.g., "bursitis pain in older women" correctly belongs in 3 topics) while clarifying it's NOT workaround-hedging.
- **Parallel-chat workflow-fundamentals integration — NEW 2026-04-20 (REMINDER):** Director is running a parallel chat about reworking the Auto-Analyze workflow at the fundamentals level. Director will share conclusions later. **REMINDER for future sessions: ask director for the parallel-chat conclusions at or before Session 5, and integrate them into this roadmap before Session 6's prompt merge.**

---

## Phase 2 — Multi-user infrastructure (❌ NOT STARTED)

### Goal and gate
**Goal:** Platform ready for worker onboarding at scale. All infrastructure for 50 concurrent workers.
**Gate to Phase 3:** Infrastructure complete. 1 test worker running successfully through ≥1 workflow on ≥1 Project.

### Phase 2 scope (summary)

Details in `PLATFORM_REQUIREMENTS.md §2, §3, §4, §5` and `PLATFORM_ARCHITECTURE.md §13`:

- **🚨 Server-side execution of AI jobs (NEW 2026-04-20 explicit notation, previously implicit):** Director explicitly requested that Phase 2 move AI job execution from browser-side (current Phase 1 architecture — loop runs in admin's browser, calls Anthropic directly or via Vercel proxy) to server-side persistent background workers. **Director clarification:** platform will run multiple Auto-Analyze (and other AI tool) jobs on multiple projects in multiple tools simultaneously at full deployment. System must be designed from the beginning to handle this OR at the very least migration to multi-concurrent-job server-side setup must NOT require a complete overhaul. Architecture implications: (1) Job queue (likely Redis or Postgres-backed); (2) Persistent worker processes (not Vercel serverless — 5-min timeout); (3) Run-state persistence so interrupted jobs resume; (4) Live progress streaming from server to browser (WebSocket or SSE); (5) Server-side API key management (secure vault or user-specific encrypted storage). Phase 1 can continue with browser-side for admin-solo use; Phase 2 transition plan to be designed before Worker #1 onboards. Per `PLATFORM_REQUIREMENTS.md §3` concurrency requirements.
- **Assignment system** — three-way table (userId, workflow, projectId), admin grants access. Permission middleware on every API endpoint.
- **Worker-facing views** — PLOS landing page, Projects list, and workflow tools all filter to the worker's assignments.
- **Review cycle** — states (assigned / in-progress / submitted-for-review / acceptable / revision-requested) + ReviewNote table + email/in-app notifications.
- **Audit trail infrastructure** — AuditEvent table + shared emission helper. Opt-in per workflow.
- **Real-time collaboration infrastructure** — per-workflow strategy. Keyword Clustering: OT/CRDT for 10–20 concurrent editors (Pattern D per PLATFORM_REQUIREMENTS §3.2). Others TBD.
- **Role column on User records** — at minimum `admin | worker`. Possibly UserRole table or UserProfile extension.
- **Migrate card-label edits from localStorage to database** — `/dashboard` 3 system cards + `/plos` 14 workflow cards currently save to browser. In Phase 2 these need to be shared across admin and all workers. Add `cardLabels` table or similar; migrate existing localStorage values on first login.
- **Workflow deliverable storage** — new `workflow-deliverables` bucket, private with signed URLs. `Deliverable` table for metadata.
- **Phase 2 open questions** (per PLATFORM_REQUIREMENTS §13) — admin monitoring dashboard design, worker landing page design, notification system design, bulk Project creation tool, deliverable versioning policy.

### Phase 2 tech-debt items
(From Ckpts 5–7 and earlier work. These are items that don't block Phase 1 but must be addressed before workers come online.)

- **Race condition on `nextNodeId` / `nextPathwayId`** in canvas POST routes (Ckpt 5). Two concurrent requests could collide on primary key. Fix: wrap in `$transaction` with SERIALIZABLE isolation, or switch to UUID primary keys.
- **Asymmetric `canvasState` upsert logic** between canvas/nodes/route.ts POST and canvas/pathways/route.ts POST — normalize before Phase 2 concurrency work.
- **`ops as any` TypeScript workaround** in `canvas/rebuild/route.ts`.
- **Shared Keyword type file** in `src/types/keyword.ts`.
- **Unify volume type** (Prisma Int vs TS string).
- **Mutable state in CanvasPanel drag handlers**.
- **ASTRow memoization**.
- **Error state in useCanvas + retry UI**.
- **Optimistic update rollback**.

### Phase 2 platform-schema tech debt
- No assignment table yet
- No review-cycle infrastructure yet
- No audit-trail infrastructure yet
- No role column on User records
- No real-time collaboration infrastructure
- No Shared Workflow-Tool Scaffold yet (also counts as Phase 1α blocker)
- No workflow-readiness resolver yet
- No "reset workflow data" feature in any workflow yet
- No workflow deliverable storage strategy yet
- No Think Tank localStorage → DB migration yet

---

## Phase 3 — Worker ramp (❌ NOT STARTED)

**Goal:** 1 test worker → 50 workers → 500 Projects/week.
**Duration:** ~10 weeks (5 workers/week ramp per PLATFORM_REQUIREMENTS §11).
**Focus:** Operational iteration. Quality monitoring dashboards. Worker onboarding materials. Iteration on pain points surfaced by real worker usage.

No specific items yet — will be populated as Phase 2 nears completion.

---

## Phase 4 — Scale hardening (❌ NOT STARTED)

**Goal:** 500/week → 5,000/week.
**Gate:** Ongoing.
**Focus:** Infrastructure migration (likely AWS evaluation), database optimization (possibly partitioning AuditEvent table at 5,000 Projects/week × 14 workflows = 70,000 rows/week), cost management, performance tuning.

Planning lives in `PLATFORM_REQUIREMENTS.md §10`.

---

## Infrastructure TODOs (apply across all phases)

- **Repo hygiene (Ckpt 9):** `.bak` files littered through repo; `.gitignore` doesn't catch them; `HANDOFF.md` and `ROADMAP.md` living inside `src/app/` where Next.js may interpret them.
- **Think Tank localStorage → DB:** Think Tank projects still save to browser only.
- **Admin-notes bucket access:** Currently public; switch to private + signed URLs.
- **Middleware deprecation:** Next.js 16 renamed the `middleware` convention to `proxy`. Pre-existing warning; fix at convenience.
- **Rich text editor:** Uses deprecated `document.execCommand`. Pre-existing; doesn't block anything.
- **Prisma Studio hygiene:** Occasional orphan rows appear in dev data. Not impacting production.

---

END OF DOCUMENT
