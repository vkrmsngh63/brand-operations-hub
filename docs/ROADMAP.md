# ROADMAP
## Product Launch Operating System (PLOS) — Development Execution Plan

**Last updated:** April 25, 2026 (Phase 1g-test follow-up Part 3 — Pivot Session A — director committed to the architectural pivot after re-examining the insight from Session 3b verification; Pivot Session A's three deliverables are locked: (1) operation vocabulary — 13 operations with atomic batch apply, sequential within-batch ordering, new-topic aliases `$new1`/`$new2`, keywords-by-database-UUID, JUSTIFY_RESTRUCTURE on stability ≥7 from day one; (2) stable-ID format `t-1`/`t-2`/... per project with backfill rule `stableId = "t-" + id`; (3) DB migration plan — additive `stableId` + `stabilityScore` columns on `CanvasNode` via 3-step sequence (nullable add → committed-script backfill → tighten NOT NULL + unique index), ships in Pivot Session B with Rule-8 approval; new Group B doc `docs/PIVOT_DESIGN.md` created as build spec for Pivot Sessions B/C/D/E; design-only session, no code, no DB changes)
**Last updated in session:** session_2026-04-25_phase1g-test-followup-part3-pivot-session-A (Claude Code)
**Previously updated in session:** session_2026-04-25_phase1g-test-followup-part3-session3b-verify (Claude Code)
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
  4. 🎯 **NEXT: Pivot Session B** — DB migration (3-step) + operation-applier code + per-operation pre-validators + post-application invariant checks + unit tests against synthetic operation sets. Two Rule-gated approvals: Rule 8 before each `prisma db push`; Rule 9 before push at end of session.
  5. **Blank-canvas visual verification of canvas-layout engine** — Phase-1 polish item; can run as standalone quick task or be folded into Pivot Session D's small-test-Project work (which already creates a fresh canvas).
  6. Add UI hint recommending Direct mode for large-keyword Projects (deferred from kickoff session — possibly obsolete after pivot since cost no longer scales with canvas size; revisit at Pivot Session E).
  7. Add warning when Adaptive Thinking is selected with a large prompt (0-output-tokens risk — possibly obsolete after pivot since output tokens drop dramatically; revisit at Pivot Session E).

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

**Next session — Pivot Session B (database migration + applier code + validation).** See PIVOT_DESIGN.md §4 Pivot Session B for scope. Two Rule-gated approvals: Rule 8 (DB migration) at start of session, before each `prisma db push`; Rule 9 (deploy) at end of session, before push.

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

#### Workflow 4 — Brand Identity & IP (🏷️)
**Status:** ❌ NOT STARTED.

#### Workflow 5 — Conversion Funnel & Narrative Architecture (🎯)
**Status:** ❌ NOT STARTED.

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
