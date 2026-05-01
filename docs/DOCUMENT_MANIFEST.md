# DOCUMENT MANIFEST
## Ground-truth registry of every handoff document in the PLOS system

**Last updated:** May 1, 2026 (Twenty-eighth Claude Code session — Scale Session E build — code + docs SHIPPED; D3 full-Bursitis validation deferred to director's discretionary follow-up. Per `INPUT_CONTEXT_SCALING_DESIGN.md` §6 Scale Session E. New code: applier `consolidationMode` 3rd-arg flag (`src/lib/operation-applier.ts`) — rejects ADD_TOPIC + ADD_KEYWORD atomically with descriptive error when set; 7 new applier tests cover the contract from every angle (rejected ops / allowed ops / atomic failure / explicit-false equivalence / no-options regression). 248 src/lib tests pass total (was 240; +7 new + 1 from prior background; zero regressions). New doc: `docs/AUTO_ANALYZE_CONSOLIDATION_PROMPT_V4.md` — separate Initial Prompt + Primer pair derived from V4 with three surgical changes (full-canvas consolidation framing; restricted operation vocabulary minus ADD_TOPIC + ADD_KEYWORD; Reevaluation Pass scoped to whole canvas). `AutoAnalyze.tsx` wired with consolidation cadence + min-canvas-size settings + two new prompt textareas + auto-fire gate inside runLoop after every Nth successful regular batch + Consolidate Now admin button + checkpoint round-trip for the cadence counter. Defense in depth — prompt forbids ADD_TOPIC/ADD_KEYWORD, wiring sets consolidationMode flag, applier rejects atomically; three independent layers. Touch recording (Q15 → A) for consolidation ops works through existing recordTouchesFromOps inside doApplyV3. `npx tsc --noEmit` clean; `npm run build` clean; `npm run lint` at exact baseline parity (16e/41w; zero new — one mid-session 4-error slip via unescaped quotes in two new tooltips, caught + fixed via `&ldquo;`/`&rdquo;` escaping). No deploys this session — code + docs to commit; push at director's discretion. Multi-workflow: schema-change-in-flight flag stays "No"; W#2 still 🆕 about-to-start; no parallel chat.)
**Last updated in session:** session_2026-05-01_scale-session-e-build (Claude Code)
**Previously updated in session:** session_2026-04-30-c_scale-session-d-build (Claude Code) — Scale Session D build — third build session of the day after Sessions B + C. CODE + DOCS + LIVE VALIDATION session. New `docs/AUTO_ANALYZE_PROMPT_V4.md` (837 lines, derives from V3 with three surgical additions: tiered TSV input format docs in INPUT TABLE COLUMNS / HOW TO READ THE TABLE; `intent_fingerprint` field added to ADD_TOPIC / UPDATE_TOPIC_TITLE / SPLIT_TOPIC into[] / MERGE_TOPICS as `merged_intent_fingerprint` (required) + UPDATE_TOPIC_DESCRIPTION (optional); Reevaluation Pass trigger 3a expanded with CROSS-CANVAS INTENT-EQUIVALENCE DETECTION VIA INTENT FINGERPRINTS subsection; V3 untouched as historical reference). `AutoAnalyze.tsx` wired: new `recencyWindow` state (default 5) + persistence in `aa_settings_{projectId}` + UI input visible next to Vol threshold; touch-tracker round-trip through `aa_checkpoint_{projectId}` localStorage (rehydrate via `deserializeTouchTracker` on resume + reset on fresh start + serialize on saveCheckpoint); `currentBatchNumRef` stamped at top of every runLoop iteration; `recordTouchesFromOps` called after successful `applyOperations` walking alias resolutions; `buildOperationsInputTsv` call site flipped to `serializationMode: 'tiered'` with full `tierContext`. New `scripts/inspect-fingerprints.mjs` (small read-only Prisma inspection script for fingerprint quality spot-checks). Live small-batch validation on Bursitis Test (local dev): 2 confirmed batches (3rd in flight at session-doc-write time); cost $0.534 confirmed; all 43/43 topics carry valid intent fingerprints — word counts 10–15 (avg 12.0; spec target 5–15); reconciliation 0 off-canvas → Reshuffled across both batches; sample fingerprints read as genuinely searcher-centric. Adaptive-thinking runaway on first batch attempt → captured as informational entry in CORRECTIONS_LOG. 240 src/lib tests pass (no new tests this session — wire-up validated empirically); `npx tsc --noEmit` clean; `npm run build` clean; `npm run lint` at exact baseline parity (16e/41w; zero new). No deploys this session — Sessions B + C + D bundled for director's discretionary single push. Multi-workflow: schema-change-in-flight flag stays "No"; W#2 still 🆕 about-to-start. Cross-doc: KEYWORD_CLUSTERING_ACTIVE gained POST-2026-04-30-SCALE-SESSION-D STATE block (Session C block demoted); INPUT_CONTEXT_SCALING_DESIGN §6 Scale Session D flipped to SHIPPED; ROADMAP Active Tools row updated; CHAT_REGISTRY new row; CORRECTIONS_LOG new informational entry.)
**Last updated in session:** session_2026-04-30-c_scale-session-d-build (Claude Code)
**Previously updated in session:** session_2026-04-30-b_scale-session-c-build (Claude Code)
**Previously updated in session:** session_2026-04-30_scale-session-b-build (Claude Code)
**Previously updated in session:** session_2026-04-29-c_defense-in-depth-impl-2 (Claude Code)
**Previously updated in session:** session_2026-04-29-b_defense-in-depth-impl-1 (Claude Code)
**Previously updated in session:** session_2026-04-29_defense-in-depth-audit-design (Claude Code)
**Previously updated in session:** session_2026-04-28_canvas-blanking-and-closure-staleness-fix (Claude Code)
**Previously updated in session:** session_2026-04-28_deeper-analysis-and-fix-design (Claude Code)
**Previously updated in session:** session_2026-04-28_scale-session-0-outcome-c-and-full-run-feedback (Claude Code)
**Previously updated in session:** session_2026-04-27_input-context-scaling-design (Claude Code)
**Previously updated in session:** session_2026-04-27_v3-prompt-small-batch-test-and-context-scaling-concern (Claude Code)
**Previously updated in session (earlier):** session_2026-04-26_workflow-transition-architecture-and-v3-prompt-refinement (Claude Code)
**Previously updated in session (earlier):** session_2026-04-26_phase1-polish-bundle (Claude Code)
**Previously updated in session (earlier):** session_2026-04-25_phase1g-test-followup-part3-pivot-session-E (Claude Code)
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

**Purpose:** This is the authoritative registry of what handoff documents exist, where each fits in the system, and their last-modified status. When a new chat starts, the user consults this manifest to confirm which files to upload. When doc drift is suspected, this manifest is the reference for "what should exist."

**Maintenance rule:** Updated at end of every chat. Timestamps and per-doc changes summarize what happened in that chat.

---

## Group A — Canonical location: `/docs/` in repo (post-Ckpt-9)

As of Phase M Ckpt 9 (2026-04-17), **all Group A docs live at `/docs/` in the repo**, no longer uploaded per-chat. Claude Code reads them directly from disk at session start. The user's local copies on their filesystem serve as a backup and for the rare case of a claude.ai rollback (see `CLAUDE_CODE_MIGRATION.md` §8).

These 13 documents form the persistent handoff context.

| # | Document | Purpose | Last modified | Modified this session? |
|---|---|---|---|---|
| 1 | `PROJECT_CONTEXT.md` | Big-picture project context, philosophy, methodology, discover-as-you-build approach | 2026-04-17 | NO |
| 2 | `PLATFORM_ARCHITECTURE.md` | Technical architecture — routes, schema, auth, file structure, tech debt | 2026-04-30 (Scale Session B — §10 gains "🚀 Scale Session B SHIPPED" entry: 3-step `intentFingerprint` migration, applier extension, parser snake_case translation, route patches, G3 PATCH guard, wiring-layer omit-when-empty, 22 new src/lib tests, R3 still pending in future Scale Session C serializer.) | NO |
| 3 | `PLATFORM_REQUIREMENTS.md` | Platform-wide requirements — scale, user-model, review cycle, audit, concurrency, phasing | 2026-04-17 | NO |
| 4 | `NAVIGATION_MAP.md` | Every route + click path through PLOS — UI navigation source of truth | 2026-04-17 | NO |
| 5 | `DATA_CATALOG.md` | Every data item — where it lives, Human Reference Language, cross-workflow sharing contracts | 2026-04-30 (Scale Session B — §5.2 FIELDS list extended to include `intentFingerprint`; new §5.2a section.) | NO |
| 6 | `ROADMAP.md` | Development execution plan — completed work + remaining phases | 2026-05-01 (Scale Session E — Active Tools row updated end-of-session: "Last Session" cell summarises Scale Session E code + docs work; "Next Session" cell elevated to (a) Scale Session E D3 full-Bursitis validation (recommended) with four alternates; schema-change-in-flight flag stays "No". Header timestamp.) | ✅ YES |
| 7 | `CORRECTIONS_LOG.md` | Append-only log of mistakes + extracted patterns | 2026-04-30 (Scale Session D — 1 new INFORMATIONAL entry on V4 first-batch adaptive-thinking runaway pattern. Pattern preservation, not a Claude mistake — captured so future sessions know to flip Thinking mode to Enabled+12000 if a V4 batch stalls.) | NO |
| 8 | `CHAT_REGISTRY.md` | Chronological log of chats + URLs + work-summaries (post-Ckpt-9: Claude Code sessions use session-identifier format) | 2026-05-01 (Scale Session E — new top row for session_2026-05-01_scale-session-e-build; twenty-eighth Claude Code session.) | ✅ YES |
| 9 | `HANDOFF_PROTOCOL.md` | Rules for how chats operate — start/mid/end protocols, communication rules, interview rules | 2026-04-27 (V3 small-batch test + context-scaling concern session — NEW Rule 24 added: Pre-capture search before adding any ROADMAP item or proposing new architectural concern. Mandatory structured search of ROADMAP, tool's ACTIVE/DESIGN docs, PLATFORM_ARCHITECTURE, CORRECTIONS_LOG, plus code verification for behavior-related concerns; surfacing of search results to director before reading back proposed entry. Drafted in response to a HIGH-severity Claude mistake captured in CORRECTIONS_LOG 2026-04-27 entry.) | NO |
| 10 | `DOCUMENTATION_ARCHITECTURE.md` | Design of the doc-system itself (DLMS, tool graduation, group A/B, workflow interview pattern, Claude Code migration) | 2026-04-17 | NO |
| 11 | `NEW_CHAT_PROMPT.md` | **Historical** — claude.ai era briefing template. Post-Phase-M, Claude Code sessions use `CLAUDE_CODE_STARTER.md` instead. | 2026-04-17 | NO |
| 12 | `DOCUMENT_MANIFEST.md` | This file — ground-truth doc registry | 2026-05-01 (Scale Session E — timestamps + modified flags + this-session summary; new Group B row for `AUTO_ANALYZE_CONSOLIDATION_PROMPT_V4.md`) | ✅ YES |
| 13 | `CLAUDE_CODE_MIGRATION.md` | Migration plan and operational rules for shifting from claude.ai to Claude Code. Executed successfully in Ckpt 9+9.5. | 2026-04-17 | NO |
| 14 | `AI_TOOL_FEEDBACK_PROTOCOL.md` | Platform-wide standard for every AI-using tool in PLOS. Defines required integration points (structured decision output with reasoning, admin review surface with 3 actions + 2 feedback channels, feedback-repo write/read-back, quality scoring, model/provider registry), 3-phase implementation roll-out, and the primer text to include in every new workflow's design doc. | 2026-04-20 | NO |
| 15 | `MODEL_QUALITY_SCORING.md` | Stability-score algorithm spec. Defines 0-10 stability_score per AI output item, factors that add/subtract to score, model's interpretation instructions, JUSTIFY_RESTRUCTURE payload requirement for high-score modifications, admin scoring guidelines (1-5 scale with 4 evaluation dimensions), meta-note on how algorithm was derived + review triggers + how to propose weight changes. | 2026-04-20 | NO |
| 16 | `MULTI_WORKFLOW_PROTOCOL.md` | **NEW 2026-04-29.** Methodology for parallel Claude Code chats on different PLOS workflows. Branch strategy (W#1 on `main`; W#k for k ≥ 2 on `workflow-N-<slug>` feature branches). Doc section ownership table (which sections of which Group A docs each chat owns + which are append-only + which need cross-workflow surfacing). Drift coordination (mandatory pull-rebase before commit + before drift check; schema-change handshake; dev-server exclusivity; build/test non-exclusivity). The "Current Active Tools" table at top of `ROADMAP.md` is the single source of truth for parallel-workflow state — every session reads at start, updates its own row at end. Includes Appendix A (canonical W#2 launch prompt) + Appendix B (canonical W#1 continuation prompt) for paste-ready session-start use. Read at session start whenever today's task references W#k for k ≥ 2 OR the Active Tools table shows multiple workflows in flight. | 2026-04-29 (created this session) | ✅ YES |

**Group A count: 16 documents.** 3 modified this session (ROADMAP, CHAT_REGISTRY, DOCUMENT_MANIFEST). 13 not modified this session.

**Created this session (Group A):** no new Group A docs.

**Created this session (Group B):**
- `docs/AUTO_ANALYZE_CONSOLIDATION_PROMPT_V4.md` — separate Initial Prompt + Primer pair derived from V4 with three surgical changes: framing as a full-canvas consolidation pass (no batch keywords; full Tier 0 input only); restricted operation vocabulary minus ADD_TOPIC + ADD_KEYWORD (explicit FORBIDDEN OPERATIONS section); Reevaluation Pass scoped to whole canvas (vs. just touched branches). All other V4 reasoning machinery (Topic Naming, Intent-Equivalence Principle, Stability Score Interpretation, Conversion Funnel Stage Ordering, JUSTIFY_RESTRUCTURE payload shape) carried verbatim. Empty op list explicitly called out as the expected outcome on a well-maintained canvas. Director re-pastes both into the new dedicated panel slots before running consolidation.

**Modified this session (Group B):**
- `docs/KEYWORD_CLUSTERING_ACTIVE.md` — new POST-2026-05-01-SCALE-SESSION-E STATE block prepended; prior POST-2026-04-30-SCALE-SESSION-D STATE block demoted to "preserved as historical context — superseded by Session E above"; header timestamp updated; 5-option NEXT menu with (a) Scale Session E D3 full-Bursitis validation recommended.
- `docs/INPUT_CONTEXT_SCALING_DESIGN.md` — §6 Scale Session E subsection flipped to ✅ SHIPPED with full per-deliverable status (D1 + D2 SHIPPED; D3 full-Bursitis validation deferred to director; D4 V3-era cleanup deferred until post-validation); header timestamp.

**Modified this session (operational, not Group A):**
- None this session.

**Code changes this session (src/ + scripts/):**

*New files:*
- `docs/AUTO_ANALYZE_CONSOLIDATION_PROMPT_V4.md` — listed under Group B above.

*Modified files (2):*
- `src/lib/operation-applier.ts` — new optional `ApplyOptions` 3rd arg (`{ consolidationMode?: boolean }`); forbidden-ops set; per-op pre-check inside the operations forEach (ADD_TOPIC + ADD_KEYWORD rejected with descriptive error when set). ~25 LOC net add; zero existing behavior changed (default behavior is `consolidationMode: false` → identical to pre-Session-E).
- `src/lib/operation-applier.test.ts` — 7 new applier consolidation-mode tests (rejected ops / allowed ops / atomic failure / explicit-false equivalence / no-options regression). ~120 LOC append. 248 src/lib tests pass total (was 240; +7 new + 1 from prior background; zero regressions).
- `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` — ~250 LOC net add across ~12 surgical edits: 4 new state vars (`consolidationCadence`, `consolidationMinCanvasSize`, `consolidationInitialPrompt`, `consolidationPrimerPrompt`) + persistence in `aa_settings_{projectId}` + checkpoint round-trip in `aa_checkpoint_{projectId}`; new `batchesSinceConsolidationRef` counter (reset in `startRunLoop`; persisted/rehydrated in checkpoint with graceful default 0 on pre-E checkpoints); new `consolidationBusy` state; new `assembleConsolidationPrompt()` (uses `serializationMode: 'full'`); new `runConsolidationPass(triggerSource)` (assembles → callApi → parseOperationsJsonl → doApplyV3 with consolidationMode flag); new `handleConsolidateNow` admin button handler (pre-check guards: canvas ≥2 topics, prompt loaded ≥100 chars, API key in direct mode); `doApplyV3` extended with optional 3rd-arg `{ consolidationMode?: boolean }` forwarding to `applyOperations`; runLoop auto-fire gate after every successful regular batch apply (increments counter; fires `runConsolidationPass('auto')` when cadence + canvas-size + prompt-presence checks pass; one-time-per-cycle warn-log when cadence + canvas-size both met but prompt is missing); UI: cadence + min-canvas-size inputs in Configure section with live ON/OFF status string; two new prompt textareas in Prompt section separated by thin top-border with char counters; "⚙ Consolidate Now" button next to Reconcile Now in Controls bar with tooltip explaining cost range. Mid-session lint slip: 4 unescaped-quote errors introduced in two new tooltip strings; caught + fixed in same session via `&ldquo;` / `&rdquo;` HTML entity escaping.

**Code commits this session:**
- (pending end-of-session commit) — Scale Session E build: 2 code files modified + 1 test file appended + 1 new consolidation prompt doc + 5 Group A/B doc files modified.

**End-of-session doc commit (this commit, pending Rule-9 push approval):**
- `src/lib/operation-applier.ts` (consolidationMode 3rd-arg flag + per-op restriction)
- `src/lib/operation-applier.test.ts` (7 new consolidation-mode tests)
- `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` (Scale Session E wire-up)
- `docs/AUTO_ANALYZE_CONSOLIDATION_PROMPT_V4.md` (new separate consolidation prompt pair)
- `docs/KEYWORD_CLUSTERING_ACTIVE.md` (new POST-2026-05-01-SCALE-SESSION-E STATE block; header; Session-D demotion)
- `docs/INPUT_CONTEXT_SCALING_DESIGN.md` (§6 Scale Session E flipped to ✅ SHIPPED; header)
- `docs/ROADMAP.md` (Active Tools row final state; header)
- `docs/CHAT_REGISTRY.md` (new top row; header)
- `docs/DOCUMENT_MANIFEST.md` (this file — timestamps + per-doc flags + this-session summary; new Group B row for AUTO_ANALYZE_CONSOLIDATION_PROMPT_V4.md)

**Push status:** pending director's discretionary approval at end of session. Sessions B + C + D were already pushed to origin/main per Session D's history; this commit adds E to that bundle.

**Earlier-session code changes (Scale Sessions B + C + D and prior — already documented in this manifest's prior-session entries; not duplicated here).**

---

## Group B — Uploaded when the chat's scope includes the relevant tool

These are tool-specific working documents. They travel with chats that touch the specific tool, and stay behind when they don't.

### Currently active Group B documents

| Document | Tool/System | Status | Last modified | Modified this chat? |
|---|---|---|---|---|
| `KEYWORD_CLUSTERING_ACTIVE.md` | Keyword Clustering (workflow 1) | Active development | 2026-05-01 (Scale Session E — new POST-2026-05-01-SCALE-SESSION-E STATE block prepended; prior Scale-Session-D STATE block demoted to "preserved as historical context — superseded by Session E above"; header timestamp updated; 5-option NEXT menu with (a) Scale Session E D3 full-Bursitis validation recommended) | ✅ YES |
| `DEFENSE_IN_DEPTH_AUDIT_DESIGN.md` | Keyword Clustering / Auto-Analyze redundancy + invariant-enforcement design | Audit COMPLETE 2026-04-29-c except deliberately-deferred items (R3, G3 still gated on this Scale Session B — G3 SHIPPED 2026-04-30 in Scale Session B; R3 deferred to Scale Session C serializer). | 2026-04-29-c (per-section status updates from Defense-in-Depth Impl Session 2; this session SHIPPED §5.4 G3 but didn't edit this doc — G3-shipped note will land in a future doc-cleanup pass) | NO |
| `PIVOT_DESIGN.md` | Keyword Clustering / Auto-Analyze architectural pivot | Pivot complete (Sessions A-E done); doc retained for historical reference | 2026-04-27 (Scale Session A — §5 input-scaling row pointer updated to reference new INPUT_CONTEXT_SCALING_DESIGN.md; header timestamp) | NO |
| `AUTO_ANALYZE_CONSOLIDATION_PROMPT_V4.md` | Keyword Clustering / Auto-Analyze CONSOLIDATION prompts | LIVE — canonical for what the director pastes into the Auto-Analyze panel's Consolidation slots as of Scale Session E; separate Initial Prompt + Primer pair derived from V4 with three surgical changes (full-canvas consolidation framing; restricted operation vocabulary minus ADD_TOPIC + ADD_KEYWORD; Reevaluation Pass scoped to whole canvas) | 2026-05-01 (Scale Session E — new file; director re-pastes into the new Consolidation slots before running the first auto-fire-or-admin pass) | ✅ YES (created) |
| `AUTO_ANALYZE_PROMPT_V4.md` | Keyword Clustering / Auto-Analyze prompts (regular per-batch) | LIVE — canonical for what the director re-pastes into the Auto-Analyze panel's regular Initial + Primer slots as of Scale Session D; derived from V3 with three surgical additions (tiered TSV input format, `intent_fingerprint` field per relevant op, Reevaluation Pass 3a cross-canvas detection) | 2026-04-30 (Scale Session D — new file, 837 lines; director re-pasted into Auto-Analyze UI mid-session for the small-batch validation run; UNCHANGED in Session E) | NO |
| `AUTO_ANALYZE_PROMPT_V3.md` | Keyword Clustering / Auto-Analyze prompts (HISTORICAL) | Historical reference only — superseded by V4 as of Scale Session D 2026-04-30; preserved untouched until V4 is field-validated through Scale Session E, then archivable | 2026-04-26 (Workflow-transition architecture session — Strategy 3 layered placement + intent-equivalence rewrite; file grew 629 → 769 lines; was canonical through Scale Sessions B + C; demoted to historical reference at Session D when V4 became canonical) | NO |
| `AUTO_ANALYZE_PROMPT_V2.md` | Keyword Clustering / Auto-Analyze prompts (HISTORICAL) | Historical reference only — the V2 full-table-rewrite contract that ran every Bursitis batch through Session 3b verification; preserved untouched until V3 is field-validated through Pivot Sessions D + E, then archivable | 2026-04-18 (last canonical edit predating the pivot) | NO |
| `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` | Keyword Clustering / Auto-Analyze prompts (HISTORICAL) | Mostly superseded by V3 — surviving wording (Change 1 tie-breaker, Change 3 Comprehensiveness Verification redrafted, Change 4 JUSTIFY_RESTRUCTURE 6-field payload, Change 5 multi-placement, Change 2 Loc 1 cross-canvas scan) folded into V3 with locked wording; obsolete pieces (Reevaluation Report block, never-delete rule, full-table-rewrite output format, salvage IRRELEVANT_KEYWORDS template, session-boundary continuation) obsolete by construction; archivable in future cleanup | 2026-04-24 (Session 2b — last design refinement; locked then for "mechanical Session 6 merge" which is now subsumed by V3) | NO |
| `INPUT_CONTEXT_SCALING_DESIGN.md` | Keyword Clustering / Auto-Analyze input-side context-scaling architectural concern | 2026-05-01 — Scale Sessions B + C + D + E SHIPPED (D1 + D2 of E shipped; D3 full-Bursitis validation deferred to director's discretionary follow-up; D4 V3-era cleanup deferred until post-validation). Tier mechanism + consolidation pass mechanism now exist and inter-operate end-to-end on local dev. | 2026-05-01 (Scale Session E build session — §6 Scale Session E subsection flipped to ✅ SHIPPED with full per-deliverable status; header timestamp.) | ✅ YES |

### Graduated Group B documents (split into Archive + Data Contract)

*(None yet — no workflows have graduated. First graduation will likely be Keyword Clustering once Phase 1 polish items are complete and the first downstream workflow needs to consume its data contract.)*

### Planned Group B documents (will be created as workflows begin)

| Document | Tool/System | Trigger to create |
|---|---|---|
| `COMPETITION_SCRAPING_DESIGN.md` | Workflow 2 | First workflow-requirements interview chat for Workflow 2 |
| `THERAPEUTIC_STRATEGY_DESIGN.md` | Workflow 3 | First design chat for Workflow 3 |
| *(13 more planned — one per workflow)* | Workflows 4–14 | Same pattern |
| `SHARED_WORKFLOW_SCAFFOLD_DESIGN.md` | Platform infrastructure | Before Workflow 2 build begins (Phase 1α) |

---

## Claude Code operational files (not Group A, not Group B — read from disk at session start)

After Phase M Ckpt 9, Claude Code reads these files directly from `/docs/` in the repo. They're not uploaded to any chat (because Claude Code doesn't use upload) and they're not tool-specific.

| Document | Purpose | When read |
|---|---|---|
| `CLAUDE_CODE_STARTER.md` | Paste-at-session-start prompt that establishes the non-negotiable communication rules and Claude Code–specific safety rules (M1–M7) before any work begins. | Read at the start of every Claude Code session. |

**Created:** 2026-04-17 (Ckpt 8, this chat). **Lives at:** `/docs/CLAUDE_CODE_STARTER.md` (after Ckpt 9's `/docs/` setup).

---

## Group C — Reference materials (optional, uploaded when directly relevant)

These are not handoff documents per se — they're supporting materials the user may reference.

| Document | Purpose | Uploaded when |
|---|---|---|
| `HOW_TO_WORK_WITH_CLAUDE.md` | User's working-with-Claude notes (if it exists in user's setup) | Only when working methodology itself is in scope |
| Legacy KST dumps, screenshots | Historical reference | Only when a specific legacy feature is being ported |

---

## File locations (where the canonical copies live)

**User's local filesystem (authoritative copies):**
The user maintains canonical copies of all Group A + Group B docs on their local machine and uploads them to each chat. Filenames match this manifest exactly.

**Repo (subset):**
Some docs live inside the repo for historical/technical reasons:
- `src/app/HANDOFF.md` — legacy location; should be relocated to `/docs` or deleted in Ckpt 9 cleanup
- `src/app/ROADMAP.md` — legacy location; same plan

These in-repo copies are NOT authoritative. The user's uploaded copies are authoritative.

**Chat-generated copies:**
When Claude produces updated docs at end-of-chat, they're generated in Claude's sandbox at `/home/claude/outputs/` and presented to the user via the `present_files` mechanism for download. The user then overwrites their local canonical copies with the downloaded versions.

---

## End-of-chat changes summary (this chat — Phase M Ckpt 8)

**Chat URL:** https://claude.ai/chat/fc8025bf-551a-4b3c-8483-ec6d8ed9e33c

**Work completed:** Phase M Checkpoint 8 — Admin Notes added to `/dashboard` and `/plos` pages; `/plos` Keyword Analysis card rewired from deleted `/keyword-clustering` to `/projects`. Three edits (`AdminNotes.tsx` type extension, `dashboard/page.tsx` 📝 button, `plos/page.tsx` 📝 button + route rewire) + two new 11-line wrapper files (`dashboard/notes/page.tsx`, `plos/notes/page.tsx`). `npm run build` clean in 18.5s; 17/17 static pages, zero TypeScript errors. Committed as `ac62a3a`; branch now 4 commits ahead of origin/main. Not pushed — Phase M deploy hold continues through Ckpt 9. **Critical procedural note:** during staging, 13 pre-existing files from Ckpts 1–5 were swept in by `git add -A`; per user's direction, used Option A (clean split) — unstaged the leftovers via `git reset HEAD <paths>`, committed only this chat's 7 files. Leftovers remain in working tree for Ckpt 9 cleanup. **Mistake:** Pattern 11 recurrence (4th consecutive chat) — Claude asked user to "paste the file" without a concrete command; user escalated correctly; Pattern 11 mitigation extended to cover ALL imperative instructions, and a new Rule 9 was added to the NEW_CHAT_PROMPT banner.

**STRATEGIC ADDITION (this chat, end-phase):** User raised the copy-paste-round-trip cost proactively; Claude recommended migration to Claude Code (direct repo access + command execution). User approved. Timing locked in: **finish Ckpt 9 in claude.ai (deploy step stays in known-good tool), THEN migrate to Claude Code for Phase 1g-test and all subsequent work.** Docs location: `/docs/` at repo root (Option X). Group A grows from 12 → 13 with addition of `CLAUDE_CODE_MIGRATION.md`. New operational file `CLAUDE_CODE_STARTER.md` created (not Group A; read at session start by Claude Code). Both files to be placed in `/docs/` during Ckpt 9's Task 1.

**Documents modified or created this chat (12 total — 10 Group A updated/created + 1 Group B updated + 1 new non-Group-A file):**

| Document | Key changes |
|---|---|
| `CORRECTIONS_LOG.md` | Header updated. TWO new entries prepended to Entries section: (1) "Asked user to paste the file without a concrete command — Pattern 11 recurrence mid-chat (FOURTH consecutive chat)" — severity High; documents the slip, the user's escalation, the diagnosis (Read-It-Back test was applied only to decision questions, not imperative task instructions), and the extension. (2) "Pre-existing .bak/untracked files in git status handled via Option A clean split" — procedural pattern entry (not a mistake) that formalizes the approach for every chat before Ckpt 9 + provides canonical inventory of 13 leftover files. Pattern 11 section at bottom expanded with recurrence count (now 4), post-Ckpt-8 update explaining why docs alone were insufficient, and revised mitigation covering all imperative instructions (paste/share/upload/show/etc.). |
| `ROADMAP.md` | Header updated. Current-status row for Phase M updated to "Ckpts 1–8 done; Ckpt 9 remains." Ckpt 7 completion summary retained; new Ckpt 8 completion summary appended with full detail. "Current state entering Checkpoint 9" replaces old "entering Checkpoint 8." Ckpt 8 section marked ✅ COMPLETE. Ckpt 9 promoted to 🎯 NEXT with full task list. NEW subsection "Pre-Ckpt-9 leftovers inventory" added with complete 13-file table + committed-.bak breakdown + procedural rule for all chats before Ckpt 9. |
| `NAVIGATION_MAP.md` | Header updated. Status note section rewritten for Ckpt 8 state — all Phase M UI work complete; deploy hold notice updated to show 4 commits ahead. Top-level route map (§1) updated to "Current (end of Ckpt 8)" — shows `/dashboard/notes`, `/plos/notes` as live, Keyword Analysis card routing to `/projects`. "Target (after Ckpt 8)" block removed as it's now the current state. `/dashboard` section updated with 📝 Notes button. `/plos` section updated with 📝 Notes button + rewired card. New `/dashboard/notes` and `/plos/notes` route detail sections added. Keyword Clustering click-path (§3) simplified to single working path. "AFTER Ckpt 8" click-paths removed (now they're the current paths). Gotcha 1 marked ✅ RESOLVED. Gotcha 6 updated (Ckpts 1–8). Planned-changes (§5) rewritten: Ckpt 8 marked DONE; Ckpt 9 is the only remaining checkpoint. |
| `PLATFORM_ARCHITECTURE.md` | Header updated. Directory structure note marks `/dashboard/notes/` and `/plos/notes/` as LIVE. §3 routes table rewritten for Ckpt 8 state. §3 planned-routes section stripped down (only `/projects/[id]/<future-workflow>` placeholder remains). §5.4 completion status updated through Ckpt 8; remaining = Ckpt 9 only. §7 AdminNotes shared-component note updated (now 4 systems; `SystemKey` line 34 shape noted). §10 Known Technical Debt got new "Phase M Ckpt 8" subsection containing the full 13-file leftover inventory + committed-.bak file list + procedural rule. §12 Phase M deployment note updated for Ckpt 8 state with all 4 commit hashes. |
| `KEYWORD_CLUSTERING_ACTIVE.md` | Header updated. "POST-CKPT-7 STATE" banner renamed to "POST-CKPT-8 STATE" and rewritten — clean end-to-end navigation path now working, no 404s or workarounds. §2 "How the user accesses the tool" simplified to single working path (current); "Current (pre-Ckpt-8)" and "Post-Ckpt-8 (target)" blocks removed. §1 "Card on `/plos`" stale warning replaced with ✅ confirmation of Ckpt 8 rewire. No changes to §3+ (tool internals unchanged — Ckpt 8 only touched navigation INTO the tool, not the tool itself). |
| `CHAT_REGISTRY.md` | New top row added for chat `fc8025bf-551a-4b3c-8483-ec6d8ed9e33c`. Summary covers all three tasks (Dashboard notes, PLOS notes, KC card rewire), the Option A product decision, commit `ac62a3a` details (7 files, +1661/-560, branch 4-ahead), the procedural handling of 13 pre-existing leftovers (Option A clean split), Pattern 11 4th-recurrence mistake, and the resume point for Ckpt 9. Prior Ckpt 7 row preserved unchanged below. |
| `NEW_CHAT_PROMPT.md` | Header updated. Communication banner Pattern 11 line updated to reflect 4th recurrence (not just "multiple"). New Rule 9 added to the banner: "EVERY imperative instruction to the user must come with a concrete method" — covers paste/share/upload/show/etc. with mechanical test description + concrete failure example from Ckpt 8. "Where we are" section rewritten for end-of-Ckpt-8 state (4 commits ahead, all Phase M UI work done). NEW prominent section: "🚨 Known git-status leftovers — DO NOT COMMIT UNSWEPT 🚨" — lists all 13 leftovers with origin and disposition + committed-.bak file list + procedural rule. "Objective for this chat" fully rewritten for Ckpt 9 (deploy + cleanup) — 5 concrete tasks: handle legacy docs, clean .bak files, final build+commit, deploy via push, visual verification on vklf.com. "Attached documents" updated (Group A only — no Group B needed for deploy). Known deferred items updated. NEW "AFTER CKPT 9 COMPLETES" section pointing to Phase 1g-test as next work. Maintenance notes at bottom updated to preserve Rule 9 + leftovers section. |
| `DOCUMENT_MANIFEST.md` | This file. Header timestamps updated. Group A table expanded to 13 rows (`CLAUDE_CODE_MIGRATION.md` added as #13). Modified-this-chat column updated for all 13 docs (4 NO + 9 ✅ YES). New "Claude Code operational files" section added for `CLAUDE_CODE_STARTER.md`. End-of-chat changes summary updated with methodology-shift scope. |
| `HANDOFF_PROTOCOL.md` | Header updated. New §9 added: "Claude Code vs. claude.ai — applicability of this protocol." Documents that the entire protocol (Rules 1–20) applies to both environments; lists mechanical differences (how each Step is executed differently); notes which rules become STRONGER in Claude Code (Rule 5, 14a, 10) and which become EASIER (Rule 1, 3, 8); covers end-of-session doc updates and session management patterns; includes the paste-dance escape hatch (Rule M6). |
| `DOCUMENTATION_ARCHITECTURE.md` | Header updated. New §15 added: "Claude Code methodology shift — doc system evolution." Covers: what the doc system was built for (ephemeral-everything), what changes in Claude Code (filesystem access, git as conveyor belt), what STAYS the same (all core structures), the `/docs/` layout post-Ckpt-9, rollback considerations, maintenance expectations. |
| `CLAUDE_CODE_MIGRATION.md` | **NEW Group A doc #13.** Full migration plan: §1 rationale, §2 what stays the same, §3 what changes, §4 exact setup sequence (install → auth → smoke test → first session), §5 safety rules M1–M7 for Claude Code sessions, §6 CHAT_REGISTRY transition approach, §7 updated Group A inventory, §8 rollback plan, §9 post-migration validation, §10 open questions for future sessions. |
| `CLAUDE_CODE_STARTER.md` | **NEW operational file (not Group A).** Paste-at-session-start prompt establishing 19 non-negotiable rules (communication + Claude Code–specific safety + session management + doc access). Includes a one-liner session-start prompt the user actually pastes: "Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task: [X]. Start by running the mandatory start-of-session sequence." |

**Group A docs NOT modified this chat (3):** `PROJECT_CONTEXT.md`, `PLATFORM_REQUIREMENTS.md`, `DATA_CATALOG.md`. Their last-chat-modified timestamps remain from the April-17 `cc15409c-...` architectural-reveal chat.

---

## Document lifecycle management (reference)

Per `DOCUMENTATION_ARCHITECTURE.md` §5 (Tool Graduation Ritual):
- Group B docs have three states: **Active development** → **Graduated** → **Archived**
- Graduation splits the doc into `<TOOL>_ARCHIVE.md` (full history) + `<TOOL>_DATA_CONTRACT.md` (what downstream tools need to know)
- Trigger for graduation: tool is production-stable AND a downstream tool needs to consume its data

Per `DOCUMENTATION_ARCHITECTURE.md` §2 (Group system):
- Group A is system-wide; always uploaded
- Group B is tool-specific; uploaded when the chat's scope includes that tool
- Group C is optional reference material

Per `HANDOFF_PROTOCOL.md` Document Update Checklist (end-of-chat):
- Checks 11 conditions; updates are triggered when conditions match
- Always-updated: CHAT_REGISTRY, NEW_CHAT_PROMPT, DOCUMENT_MANIFEST (ran this chat ✅)
- CORRECTIONS_LOG updated when mistakes occurred this chat (ran this chat ✅ — Pattern 11 4th-recurrence entry + Option A leftover-handling procedural entry + methodology-shift decision entry all added)
- Navigation/routes updated when routes changed (ran this chat ✅ — NAVIGATION_MAP + PLATFORM_ARCHITECTURE updated for `/dashboard/notes`, `/plos/notes`, `/plos` KC-card rewire)
- Roadmap updated when a roadmap item completed (ran this chat ✅ — Ckpt 8 marked complete; Ckpt 9 scope expanded to include `/docs/` setup; Claude Code migration added as top-priority post-Ckpt-9 item)
- Tool-specific doc updated when tool changed (ran this chat ✅ — KEYWORD_CLUSTERING_ACTIVE updated for `/plos` navigation-path fix)
- Protocol docs updated for methodology shift (ran this chat ✅ — HANDOFF_PROTOCOL §9 added for Claude Code; DOCUMENTATION_ARCHITECTURE §15 added for doc-system evolution)
- New docs created (ran this chat ✅ — CLAUDE_CODE_MIGRATION.md as Group A #13; CLAUDE_CODE_STARTER.md as non-Group-A operational file)

---

END OF DOCUMENT
