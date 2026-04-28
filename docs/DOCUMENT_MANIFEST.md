# DOCUMENT MANIFEST
## Ground-truth registry of every handoff document in the PLOS system

**Last updated:** April 28, 2026 (Scale Session 0 — empirical validation; Outcome C fired. Director ran a full-Bursitis V3 Auto-Analyze (151 of 281 batches on Sonnet 4.6) plus Opus 4.7 cost test at run start. Sonnet 4.6 hit the 200k context wall at batch 151; Opus 4.7 was economically prohibitive. Scale Sessions B–E now triggered. Run also surfaced HIGH-severity canvas-blanking bug at batches 70 + 134 (168 keywords stuck in Reshuffled status across the 2 events) plus 4 new Phase-1 polish items + 2 new architectural design items. No code, DB, schema, or prompt changes this session.)
**Last updated in session:** session_2026-04-28_scale-session-0-outcome-c-and-full-run-feedback (Claude Code)
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
| 2 | `PLATFORM_ARCHITECTURE.md` | Technical architecture — routes, schema, auth, file structure, tech debt | 2026-04-28 (Scale Session 0 outcome session — §10 Known Technical Debt updated to (1) reflect Scale Sessions B–E activated as the build path AND (2) add NEW HIGH-severity entry for canvas-blanking bug observed at batches 70 + 134 of the 2026-04-28 full-Bursitis V3 run.) | ✅ YES |
| 3 | `PLATFORM_REQUIREMENTS.md` | Platform-wide requirements — scale, user-model, review cycle, audit, concurrency, phasing | 2026-04-17 | NO |
| 4 | `NAVIGATION_MAP.md` | Every route + click path through PLOS — UI navigation source of truth | 2026-04-17 | NO |
| 5 | `DATA_CATALOG.md` | Every data item — where it lives, Human Reference Language, cross-workflow sharing contracts | 2026-04-26 (Workflow-transition architecture session — §7 PROMOTED from "Shared Data Registry" to "Cross-Tool Data Flow Map" with new structure: §7.1 summary table, §7.2 per-tool detail (W#1 entry with provisional outputs + anticipated downstream consumers), §7.3 Phase 2 platform-shared items, §7.4 decision criteria, §7.5 maintenance referenced by Rules 18 + 23. §6.4 (W#5 placeholder) gets a forward-pointer to ROADMAP W#5 entry per Rule 21.) | NO |
| 6 | `ROADMAP.md` | Development execution plan — completed work + remaining phases | 2026-04-28 (Scale Session 0 outcome session — top-of-doc Scale Session 0 Outcome C summary block added announcing build-path activation; Canvas Serialization INPUT section updated with empirical run data + status flip from "build gated" to "build activated"; NEW HIGH-severity Canvas-Blanking Intermittent Bug section added (peer to Architectural Pivot); 4 new Phase-1 polish items (Mid-run batch queue refresh, Skeleton View on canvas, AST split-view row alignment, Topics table row numbers); 2 new architectural design items (Action-by-action feedback + second-pass refinement workflow extending AI_TOOL_FEEDBACK_PROTOCOL; Intelligent hybrid cost/quality strategy); header timestamp updated.) | ✅ YES |
| 7 | `CORRECTIONS_LOG.md` | Append-only log of mistakes + extracted patterns | 2026-04-27 (V3 small-batch test + context-scaling concern session — 1 new HIGH-severity entry: failed to synthesize prior treatment of input-side context-scaling when proposing a new ROADMAP item, despite having read the relevant docs earlier in the same session. Director caught + flagged as critical, requesting instruction-set update. New HANDOFF_PROTOCOL Rule 24 (Pre-capture search) + CLAUDE_CODE_STARTER non-negotiable rule #21 added in same session.) | NO |
| 8 | `CHAT_REGISTRY.md` | Chronological log of chats + URLs + work-summaries (post-Ckpt-9: Claude Code sessions use session-identifier format) | 2026-04-28 (Scale Session 0 outcome session — new row for session_2026-04-28_scale-session-0-outcome-c-and-full-run-feedback; nineteenth Claude Code session) | ✅ YES |
| 9 | `HANDOFF_PROTOCOL.md` | Rules for how chats operate — start/mid/end protocols, communication rules, interview rules | 2026-04-27 (V3 small-batch test + context-scaling concern session — NEW Rule 24 added: Pre-capture search before adding any ROADMAP item or proposing new architectural concern. Mandatory structured search of ROADMAP, tool's ACTIVE/DESIGN docs, PLATFORM_ARCHITECTURE, CORRECTIONS_LOG, plus code verification for behavior-related concerns; surfacing of search results to director before reading back proposed entry. Drafted in response to a HIGH-severity Claude mistake captured in CORRECTIONS_LOG 2026-04-27 entry.) | NO |
| 10 | `DOCUMENTATION_ARCHITECTURE.md` | Design of the doc-system itself (DLMS, tool graduation, group A/B, workflow interview pattern, Claude Code migration) | 2026-04-17 | NO |
| 11 | `NEW_CHAT_PROMPT.md` | **Historical** — claude.ai era briefing template. Post-Phase-M, Claude Code sessions use `CLAUDE_CODE_STARTER.md` instead. | 2026-04-17 | NO |
| 12 | `DOCUMENT_MANIFEST.md` | This file — ground-truth doc registry | 2026-04-28 (Scale Session 0 outcome session — timestamps + modified flags + this-session summary) | ✅ YES |
| 13 | `CLAUDE_CODE_MIGRATION.md` | Migration plan and operational rules for shifting from claude.ai to Claude Code. Executed successfully in Ckpt 9+9.5. | 2026-04-17 | NO |
| 14 | `AI_TOOL_FEEDBACK_PROTOCOL.md` | Platform-wide standard for every AI-using tool in PLOS. Defines required integration points (structured decision output with reasoning, admin review surface with 3 actions + 2 feedback channels, feedback-repo write/read-back, quality scoring, model/provider registry), 3-phase implementation roll-out, and the primer text to include in every new workflow's design doc. | 2026-04-20 | NO |
| 15 | `MODEL_QUALITY_SCORING.md` | Stability-score algorithm spec. Defines 0-10 stability_score per AI output item, factors that add/subtract to score, model's interpretation instructions, JUSTIFY_RESTRUCTURE payload requirement for high-score modifications, admin scoring guidelines (1-5 scale with 4 evaluation dimensions), meta-note on how algorithm was derived + review triggers + how to propose weight changes. | 2026-04-20 | NO |

**Group A count: 15 documents.** 5 modified this session (ROADMAP, PLATFORM_ARCHITECTURE, KEYWORD_CLUSTERING_ACTIVE [Group B], INPUT_CONTEXT_SCALING_DESIGN [Group B], CHAT_REGISTRY, DOCUMENT_MANIFEST). 10 not modified this session.

**Not created this session (Group A):** no new Group A docs.

**Created this session (Group B):**
- None — pure analysis + ROADMAP-update session; no new Group B docs created. Two architectural design items captured (action-by-action feedback workflow; intelligent hybrid cost/quality strategy) as forward-pointing ROADMAP entries; their dedicated design docs will be created in future design sessions.

**Modified this session (Group B):**
- `docs/KEYWORD_CLUSTERING_ACTIVE.md` — new POST-2026-04-28-SCALE-SESSION-0-OUTCOME-C STATE block added above the prior POST-2026-04-27-INPUT-CONTEXT-SCALING-DESIGN block (which is now demoted to "preserved as historical context"); header timestamp updated; standing instructions for next session updated with 4 NEXT choices.
- `docs/INPUT_CONTEXT_SCALING_DESIGN.md` — §0 status update added (Outcome C fired; build path activated; threshold (b) also fired); header `Last updated` line added; ~50 lines of new content.

**Modified this session (operational, not Group A):**
- None this session.

**Code changes this session (src/):**
- NONE. This was a pure analysis + doc-update session. No src/ changes.

**Code commits already pushed mid-session:** none (no code changes).

**End-of-session doc commit (this commit, pending Rule-9 push approval):**
- `docs/ROADMAP.md` (top-of-doc Scale Session 0 Outcome C summary block; Canvas Serialization INPUT section updated with empirical run data + status flip; NEW Canvas-Blanking Intermittent Bug section; 4 new Phase-1 polish items; 2 new architectural design items; header timestamp)
- `docs/KEYWORD_CLUSTERING_ACTIVE.md` (new POST-2026-04-28-SCALE-SESSION-0-OUTCOME-C STATE block above prior STATE blocks)
- `docs/INPUT_CONTEXT_SCALING_DESIGN.md` (§0 status update; outcome C fired; build path activated; threshold (b) also fired; header)
- `docs/PLATFORM_ARCHITECTURE.md` (§10 Canvas Serialization INPUT entry updated to reflect Outcome C + new Canvas-Blanking Intermittent Bug entry; header)
- `docs/CHAT_REGISTRY.md` (new top row for session_2026-04-28_scale-session-0-outcome-c-and-full-run-feedback; nineteenth Claude Code session)
- `docs/DOCUMENT_MANIFEST.md` (this file — timestamps + modified flags + this-session summary)

**Earlier-session code changes (Phase-1 polish bundle and prior — already documented in this manifest's prior-session entries; not duplicated here).**

---

## Group B — Uploaded when the chat's scope includes the relevant tool

These are tool-specific working documents. They travel with chats that touch the specific tool, and stay behind when they don't.

### Currently active Group B documents

| Document | Tool/System | Status | Last modified | Modified this chat? |
|---|---|---|---|---|
| `KEYWORD_CLUSTERING_ACTIVE.md` | Keyword Clustering (workflow 1) | Active development | 2026-04-28 (Scale Session 0 outcome session — new POST-2026-04-28-SCALE-SESSION-0-OUTCOME-C STATE block above prior STATE blocks; header timestamp updated) | ✅ YES |
| `PIVOT_DESIGN.md` | Keyword Clustering / Auto-Analyze architectural pivot | Pivot complete (Sessions A-E done); doc retained for historical reference | 2026-04-27 (Scale Session A — §5 input-scaling row pointer updated to reference new INPUT_CONTEXT_SCALING_DESIGN.md; header timestamp) | ✅ YES |
| `AUTO_ANALYZE_PROMPT_V3.md` | Keyword Clustering / Auto-Analyze prompts | LIVE — canonical for what the director re-pastes into the Auto-Analyze panel; updated 2026-04-26 with Strategy 3 layered placement + intent-equivalence binding rule | 2026-04-26 (Workflow-transition architecture session — Strategy 3 layered placement + intent-equivalence rewrite; file grew 629 → 769 lines; director must re-paste into Auto-Analyze UI before next run) | ✅ YES |
| `AUTO_ANALYZE_PROMPT_V2.md` | Keyword Clustering / Auto-Analyze prompts (HISTORICAL) | Historical reference only — the V2 full-table-rewrite contract that ran every Bursitis batch through Session 3b verification; preserved untouched until V3 is field-validated through Pivot Sessions D + E, then archivable | 2026-04-18 (last canonical edit predating the pivot) | NO |
| `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` | Keyword Clustering / Auto-Analyze prompts (HISTORICAL) | Mostly superseded by V3 — surviving wording (Change 1 tie-breaker, Change 3 Comprehensiveness Verification redrafted, Change 4 JUSTIFY_RESTRUCTURE 6-field payload, Change 5 multi-placement, Change 2 Loc 1 cross-canvas scan) folded into V3 with locked wording; obsolete pieces (Reevaluation Report block, never-delete rule, full-table-rewrite output format, salvage IRRELEVANT_KEYWORDS template, session-boundary continuation) obsolete by construction; archivable in future cleanup | 2026-04-24 (Session 2b — last design refinement; locked then for "mechanical Session 6 merge" which is now subsumed by V3) | NO |
| `INPUT_CONTEXT_SCALING_DESIGN.md` | Keyword Clustering / Auto-Analyze input-side context-scaling architectural concern | 2026-04-28 — Outcome C fired; build path activated; design now the build spec for Scale Sessions B–E (next-priority forward action for W#1) | 2026-04-28 (Scale Session 0 outcome session — §0 status update; outcome C fired; build path activated; threshold (b) also fired; header) | ✅ YES |

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
