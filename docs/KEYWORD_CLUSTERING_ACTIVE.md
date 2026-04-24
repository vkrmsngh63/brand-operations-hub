# KEYWORD CLUSTERING — ACTIVE DOCUMENT
## Current state of the Keyword Clustering workflow tool (Group B, tool-specific)

**Last updated:** April 24, 2026 (Phase 1g-test follow-up Part 3 — Session 2 — investigations-only; first direct DB queries against live Bursitis canvas; P3-F7 root cause identified as two-way status/canvas sync drift; Removed Terms display bug root cause identified; fix directions agreed with director for both; P3-F8 layout regression + Task 5 prompt changes review rolled to Session 2b or Session 3; docs-only commit, no code)
**Last updated in session:** session_2026-04-24_phase1g-test-followup-part3-session2 (Claude Code)
**Previously updated in session:** session_2026-04-20_phase1g-test-followup-part3 (Claude Code)
**Previously updated in session (earlier):** session_2026-04-19_phase1g-test-followup-part2 (Claude Code)
**Previously updated (claude.ai era):** https://claude.ai/chat/fc8025bf-551a-4b3c-8483-ec6d8ed9e33c

**Purpose:** This is the working document for the Keyword Clustering tool during its active development phase. Covers everything built so far, what's pending, technical details, and known issues.

**When this tool graduates to stable completion:** This doc will be split into `KEYWORD_CLUSTERING_ARCHIVE.md` (full history) and `KEYWORD_CLUSTERING_DATA_CONTRACT.md` (what downstream tools need to know). See `DOCUMENTATION_ARCHITECTURE.md` §5 for the Tool Graduation Ritual.

**Upload this doc when:** Working on ANY feature, test, or bugfix related to Keyword Clustering.

---

## ⚠️ POST-SESSION-2 STATE (READ FIRST — updated 2026-04-24 session)

**As of 2026-04-24 (Phase 1g-test follow-up Part 3 — Session 2 — INVESTIGATIONS ONLY, no code commits; first direct DB queries against live Bursitis canvas; P3-F7 and Removed Terms root causes diagnosed; P3-F8 layout + Task 5 prompt review rolled forward to Session 2b or Session 3):**

### DB access verified + first queries run
- `DATABASE_URL` + `DIRECT_URL` confirmed in `.env.local` (Supabase pooler + direct connection). Prisma client queries succeed against live Bursitis data. Direct DB querying now engaged as standard practice per director's 2026-04-20 instruction.
- Four read-only queries run jointly with director: project list → baseline counts → full canvas tree walk → P3-F7 diagnostic (sum linked keywords vs AI-Sorted DB count, cross-reference to find drift).

### Bursitis canvas DB snapshot — 2026-04-24
- `Project` "Bursitis" id `6a6bd586-e873-4bae-a4a3-2612236dc270`, userId `3261bf98-3d77-413e-9de2-01e612fc753a`. `ProjectWorkflow` id `816f5de1-0356-4fe3-80de-de69a64f49dc`, status `active`, lastActivityAt `2026-04-20T03:30:41Z`.
- **Keywords: 2,328 total** (matches original import count per CORRECTIONS_LOG 2026-04-18 entry — confirms prior "remove from AST" action did NOT hard-delete any Keyword rows, even though the code path IS capable of hard-delete). Split: 238 AI-Sorted + 2,090 Unsorted. No other sortingStatus values exist.
- **CanvasNodes: 104.** Max `CanvasNode.id = 104`. Tree: 1 depth-0 root + 8 depth-1 + 22 depth-2 + 41 depth-3 + 27 depth-4 + 5 depth-5. Tree well-formed (all nodes chain to root; zero orphans).
- **Pathway: 1. SisterLink: 1,360.**
- 🚩 **`CanvasState.nextNodeId = 5` despite max CanvasNode.id = 104** — stale counter. New-node creation via this counter would collide with existing IDs. Flagged for Session 3 triage.

### Qualitative structural observations from tree walk
- Root `[1] "What is bursitis?"` with 8 depth-1 narrative-bridge children.
- 🚨 **HIP bursitis topics misplaced under KNEE parent:** `[4] "What causes bursitis in the knee?"` (itself under `[9] Knee bursitis`) contains `[5] Trochanteric bursitis`, `[28] Iliopsoas bursitis`, `[29] How is hip bursitis diagnosed?`, `[34] What is the hip bursa?`, `[57] What causes bursitis in the hip?` as children. All HIP topics. Direct fingerprint of P3-F2 silent-reshuffling at work.
- `[3] "Where does bursitis occur?"` — depth-1 bridge node with 0 keywords + 0 placements, but parent of every body-part subtree. Possibly intentional narrative bridging; possibly post-merge orphan. TBD by director.
- `[21] "Who does bursitis affect?"` has only one child: `[22] "How bursitis affects women differently"` (3 secondaries, 0 primaries). Director's bursitis-pain-in-older-women example expects an age-demographic sibling (e.g., "How bursitis affects older people"). The sibling does NOT exist — direct P3-F5 evidence of under-placement.
- Aggregate duplication: separate "Treating [body part] bursitis" chains for 7 body parts + separate "Exercises for [body part] bursitis" chains for 4 — consistent with lack of tie-breaker rule (P3-F1). ~45 of 104 nodes are singleton `kw=1` — suggests over-specificity for many topics.
- Secondary-placement coverage: only 56 placement slots across 51 distinct keywords vs 222 primaries = ~25% secondary-coverage rate. Confirms P3-F5 under-placement pressure.

### P3-F7 diagnosis — TWO-WAY sync drift (root cause identified)

**Architectural root:** two separate sources of truth for "keyword is placed" — `Keyword.sortingStatus` (updated by `doApply` step 11) and `CanvasNode.linkedKwIds` / `kwPlacements` (updated by `doApply` step 3's canvas rebuild). Updates are one-directional (status only gets ADDED as AI-Sorted, never REMOVED). No reconciliation pass. Drift accumulates batch-by-batch.

**Bug 1 — Silent Placements (58 kw, all on canvas as [p] primary but `sortingStatus='Unsorted'`):**
`doApply` step 11 at `AutoAnalyze.tsx` line 1179 iterates ONLY `batch.keywordIds` when marking AI-Sorted:
```
for (const id of batch.keywordIds) { if (allLinkedIds.has(id)) placed.push(id); }
if (placed.length > 0) onBatchUpdateKeywords(placed.map(id => ({ id, sortingStatus: 'AI-Sorted' })));
```
Step 9 (lines 1147–1165) updates `Keyword.topic` for EVERY keyword matching any text in the AI's response, regardless of batch. When Mode A's full-table view places prior-batch keywords as [p] primary in later batches' responses, step 9 fires (topic updated + canvasLoc set) but step 11 does NOT fire (keyword not in this batch's input IDs) → silent placement.

**Bug 2 — Ghost AI-Sorted (74 kw, two sub-groups):**
- **Sub-group 1 (49 kw with non-empty topic + canvasLoc — "reshuffle casualties"):** Keyword was correctly placed in an earlier batch (step 9 set topic; step 11 set status). A later batch's canvas rebuild removed the keyword from canvas. Step 11 only ADDS to AI-Sorted — never REMOVES. Stale AI-Sorted status persists. Topic/canvasLoc strings survive intact because step 9's `existingTopics.push` only appends.
- **Sub-group 2 (25 kw with empty topic + empty canvasLoc — "linkedKwIds carryover"):** `doApply` line 1003 fallback: `linkedKwIds: linkedIds.length > 0 ? linkedIds : (existing?.linkedKwIds || [])`. When the AI's response has empty `kwRaw` for a node, the node inherits linkedKwIds from its pre-existing state. Inherited keywords flow into `allLinkedIds` at step 11 → marked AI-Sorted if in batch.keywordIds → step 9 never touched them (not in parsed response text) → resulting state is AI-Sorted with blank topic, no canvasLoc, no canvas presence after next rebuild.

### P3-F7 fix direction (agreed with director 2026-04-24 — Session 3 scope)

Per director's framing — *"Whatever fix we apply here should be a backup to that primary fix"* — two-part fix:

**Primary stack (root-cause fixes, Sessions 3–6, mostly already in the plan):**
- Salvage-ignored-keywords mechanism (`AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` Change 6). Targeted second prompt for "Missing" (same-batch) keywords; full-batch retry for "Lost" (prior-work-erased) keywords.
- Prompt changes: tie-breaker "default to existing topic" (Change 1), comprehensiveness verification Step 4b (Change 3), multi-placement reinforcement (Change 5).
- Stable topic IDs (Session 5). Renames stop masquerading as "new topics"; prompt output contract uses explicit `RENAME` / `MERGE` / `SPLIT` / `DELETE` row types.
- Stability scoring friction gradient (Session 5). `JUSTIFY_RESTRUCTURE` payload required for modifications to high-confidence topics.
- Changes Ledger (Session 4). Admin-visible per-batch change log with provenance; enables admin to see exactly what reshuffled and reject.

**Backup safety net (Session 3, NEW this session):**
Post-batch reconciliation pass in `doApply` after step 11. Compute `trueCanvasKeywordIds` from rebuilt canvas. For each Keyword:
- (a) On canvas AND `sortingStatus === 'Unsorted'` → flip to `'AI-Sorted'` (fixes Bug 1; heals drift from Sub-group 1 reappearances).
- (b) Off canvas AND `sortingStatus === 'AI-Sorted'` → flip to `'Unsorted'` (aggressive) OR to new status `'Reshuffled'` (conservative — preserves history + alerts admin). Final decision deferred to Session 3 implementation review.
- Every flip logged to activity log + future Changes Ledger.

### Removed Terms display bug — root cause diagnosed

`ASTTable.tsx` line 116: `const [removedTerms, setRemovedTerms] = useState<RemovedKeyword[]>([])` — no localStorage load, no DB fetch. `handleRemove` (line 252) calls `onBulkDelete` / `onDeleteKeyword` which HARD-DELETE the Keyword row via `prisma.keyword.deleteMany` at `/api/projects/[projectId]/keywords` DELETE endpoint. Archive entry written only to in-memory state. Page refresh resets state to `[]`; hard-deleted Keyword row is gone forever, no restore path.

Director's prior-session remove action didn't actually delete anything (DB still shows 2,328 kw = original import count; zero orphan canvas refs). The click evidently never fired the API call (modal aborted / network error / UI-state mismatch / confirmation not reached). But the wiring IS capable of permanent deletion — future remove clicks would silently lose data if they succeeded.

### Removed Terms fix direction (agreed with director 2026-04-24 — Option B, Session 3 scope)

New `RemovedKeyword` table scoped to `ProjectWorkflow`. Schema:
- `id` uuid, `projectWorkflowId` FK → ProjectWorkflow
- `keyword`, `volume`, `tags` — archived from original Keyword row
- `topic`, `canvasLoc` (Json) — last-known placement state at time of removal (useful for context + restore-with-history)
- `removedAt` DateTime, `removedBy` userId, `createdAt` DateTime
- `removedSource` string enum: `'manual'` or `'auto-ai-detected-irrelevant'`
- `aiReasoning` text (nullable) — populated only when `removedSource = 'auto-ai-detected-irrelevant'`; stores the model's rationale for flagging as irrelevant

Remove action = transaction: (1) copy Keyword row data to `RemovedKeyword`, (2) delete Keyword row. Restore = reverse. `ASTTable.tsx` `removedTerms` state replaced with DB-backed fetch. Modal UI filters / badges by `removedSource` so admin can distinguish manual vs AI-auto removal.

**Forward-looking:** `removedSource` + `aiReasoning` fields support the future Auto-Remove Irrelevant Terms button feature (which remains DEFERRED per director's explicit instruction — not to be programmed without director-provided specifics on the AI flow).

### Session 2 scope — partial completion

**✅ DONE this session:**
- DB access verification + first direct Bursitis canvas queries (4 queries total).
- P3-F7 code investigation (read `AutoAnalyze.tsx` batching + `doApply` steps 3/9/11, `api/.../keywords/route.ts`, `api/.../canvas/rebuild/route.ts`). Root cause + fix direction agreed.
- Removed Terms display bug investigation (read `ASTTable.tsx` state init + `handleRemove`/`handleRestore`). Root cause + fix direction agreed.

**🎯 ROLLED to Session 2b or Session 3:**
- P3-F8 canvas layout regression diagnostic — compare `keyword_sorting_tool_v18.html` (present at repo root, uncommitted — director's upload; remains untracked until the session that actually investigates it per Option A clean-split) to React `resolveOverlap` at `CanvasPanel.tsx`.
- Task 5 — draft proposed prompt changes from `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` with exact final wording for director review.

### Additional findings flagged for Session 3 triage
- `CanvasState.nextNodeId = 5` stale counter (see above). Investigate how new CanvasNode IDs are actually assigned; either repair the counter or confirm it's unused + remove.
- SisterLink count 1,360 across 104 nodes (~25% of all possible node-pairs). Possibly legitimate multi-placement density, possibly duplicates. Not investigated this session; spot-check worth scheduling.

### Director's explicit instructions preserved for Session 3+
- **NEW 2026-04-24:** For ALL multi-source-of-truth bugs, apply reconciliation as safety net ON TOP OF the primary fix that addresses the root cause — not as the only fix. Root-cause-first, reconciliation-as-backup.
- **NEW 2026-04-24:** The Removed Terms table must distinguish manual-removed vs AI-auto-removed entries in the UI once Auto-Remove ships.
- **Preserved from 2026-04-20:** Auto-Remove Irrelevant Terms button — DO NOT program without explicit director prompt + specifics.
- **Preserved from 2026-04-20:** Direct DB querying is standard practice — engage whenever analyzing runs.
- **Preserved from 2026-04-20:** Ask for parallel-chat workflow-fundamentals conclusions at or before Session 5.
- **Preserved from 2026-04-20:** Stay lucid — pause for fresh session rather than pushing through fatigue.

---

## ⚠️ POST-PHASE-1G-TEST-FOLLOWUP-PART-3 STATE (READ SECOND — updated 2026-04-20 session)

**As of 2026-04-20 (Phase 1g-test follow-up Part 3 Claude Code session — design work only, NO code commits; director confirmed Mode A qualitative superiority; Mode B can silently overwrite Mode A's work identified as first-order problem):**

### Run-outcome facts
- ✅ **Full 51-batch Bursitis Auto-Analyze run narrated from activity log.** Run duration: ~10h 37min (started 1:03:40 PM 2026-04-19, cancelled by director 11:40:22 PM after batch 52 failed validation). 51 full batch applies + 1 partial (batch 52 attempt 2 cancelled mid-generation). Outcome was variant (a) of the prior session's prediction set.
- ✅ **Reactive Mode A→B switch fired at batch 40** (10:27:02 PM, canvas = 95 nodes) on a narrow trigger: "⚡ AUTO-SWITCH: Deleted 1 topics: Wrist bursitis; Lost 1 keywords: wrist bursitis."
- ✅ **Context wall NEVER hit.** Mode A peaked at ~53k billed input + ~66k output ≈ 119k total at batch 17 — well below the 200k ceiling. The prior session's "Mode A alone cannot complete" projection was partially rebutted (Mode A kept running clean past the projection's worry point).
- ✅ **Mode B carried batches 40-51 cleanly**, then failed batch 52 attempt 1 with "Missing 2 batch keywords: bursa city, bursa iş ilanları; Lost 6 keywords: bursa, bursa sac, what is a bursa, what is bursa, omental bursa." Director cancelled during retry 2.
- 📊 **Progress:** 408 of 2,304 keywords placed = 17.7%. Estimated total runtime to completion at Mode B pace: ~33 hours. Estimated final API cost if completed: ~$90-100.
- 📉 **Batch-time and cost reduction under Mode B:** batch time dropped from ~14 min/batch (Mode A) to ~5-6 min/batch (Mode B); cost from $0.80 avg/batch (Mode A) to $0.36-$0.47 (Mode B).

### Qualitative findings (director-surfaced + Claude-verified)
- 🎯 **Mode A output is QUALITATIVELY SUPERIOR to Mode B per director's direct assessment.** This reframes the cost analysis entirely — Mode A's extra time and money is paying for structural quality Mode B cannot produce. Locked-in decision for Phase 1: **Mode A is the default; accept higher cost as quality tax**; add multi-trigger safety nets (not proactive switch) to prevent context-wall failures.
- 🚨 **Mode B can silently overwrite Mode A's better work.** No per-action provenance tracking exists currently; admin cannot distinguish which mode produced which part of the final tree. Identified this session as a first-order design problem. Fix: Changes Ledger with full provenance; Mode A protected status via stability scoring; final review mode-difference view. See `CORRECTIONS_LOG.md` 2026-04-20 entry "Mode B can silently overwrite Mode A's higher-quality work" for full detail.
- 🚨 **Mode A is quietly reshuffling topics under the hood** (canvas oscillation 80→81→80→82→81→80... with "0 removed" every batch). Validation only catches by-name-disappearance; renames/merges/splits are invisible. Fix: stable topic IDs + Changes Ledger + stability scoring friction gradient.
- 🚨 **"Unusually high: N new topics" warning is misleading** — counts renames as new. Grew from 27 (batch 6) to 82 (batches 34-39) in Mode A. Fix: stable topic IDs eliminate the ambiguity; Activity Log v2 with explicit Renamed/Restructured/Truly-new/Unchanged breakdown.
- 🚨 **Director's bursa/Turkey-city homograph insight.** "bursa" = fluid sac (medical) AND Turkish city. Batch 52 "Missing 2" keywords were "bursa city" + "bursa iş ilanları" ("Bursa job listings" in Turkish). Forcing the model to place every batch keyword creates pressure for bad behavior. Fix: "Irrelevant Keywords" floating topic as runtime safety valve + Pending Deletion canvas region for obsolete topics + prompt instruction to use these surfaces.
- 🚨 **Model is not comprehensive in topic-chain creation.** Director's example: "bursitis pain in older women" should generate 1 primary ("bursitis pain") + 2 secondary ("bursitis in women" w/ chain "Who does bursitis affect → How bursitis affects different sexes differently" + "bursitis in older people" w/ chain "How does bursitis affect a person by age → Who does bursitis affect"). Current model under-places under output-length pressure. Fix: Step 4b Comprehensiveness Verification in prompt (see `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` Change 3).
- 🚨 **Keywords being left out of batches (director's AST Table observation).** Some keywords show "Unsorted" status despite batches being completed; missing from Topics/Analysis tables. Investigation deferred to Session 2. Fix includes: independent post-batch AST verification + re-queuing orphaned keywords.
- 🚨 **Canvas layout regressions from HTML tool.** Overlapping nodes, description overflow, wrong placement/order. `resolveOverlap` exists in React code but insufficient. Diagnostic deferred to Session 2 after director uploads `keyword_sorting_tool_v18.html` to repo root.
- 📝 **Cost tracker missing failed-attempt costs + too-small UI + no estimated-vs-actual variance.** Known from 2026-04-18; promoted to roadmap Cost Ledger item with manual entry capability.

### Director's Q4 correction (Claude's framing error — see CORRECTIONS_LOG)
- Claude initially framed Mode A's 9 hours + $31 as "wasted" vs. Mode B, assuming quality parity. Director correctly pushed back: quality matters more than cost for a product-launch hierarchy. Claude acknowledged the error; proactive Mode A→B switch was downgraded from "functional prerequisite" to "cost-optimization option, pending qualitative comparison." See `CORRECTIONS_LOG.md` 2026-04-20 entry for full detail.

### New design artifacts created this session
- `docs/AI_TOOL_FEEDBACK_PROTOCOL.md` — platform-wide standard for AI-tool feedback integration (every new AI-using tool must comply)
- `docs/MODEL_QUALITY_SCORING.md` — stability-score algorithm spec, admin scoring guidelines, meta-note on algorithm derivation + review triggers
- `docs/AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` — 7 specific proposed prompt modifications with exact wording + exact line-level placement in `AUTO_ANALYZE_PROMPT_V2.md`; pending director review in Session 6

### Multi-session execution plan (locked in 2026-04-20)
See `ROADMAP.md` "Phase 1g-test Part 3 session plan" for the full 15+ session roadmap. Sessions 1-6 are detailed; Sessions 7-15+ are scoped. Key points:
- **Session 1 = THIS SESSION (2026-04-20):** Design capture + doc updates. DONE.
- **Session 2 = NEXT SESSION:** Investigations — DB access verification, direct Bursitis canvas query + qualitative analysis, P3-F7 keyword-left-out bug investigation, Removed Terms display bug investigation, P3-F8 canvas layout regression diagnostic using `keyword_sorting_tool_v18.html` (director to upload to repo root before Session 2 starts).
- **Session 3:** Tier-1 code fixes (keyword re-queuing, Removed Terms fix, layout fix, salvage-ignored-keywords, settings persistence, cost tracker fix, Opus 4.7 dropdown).
- **Sessions 4-5:** Changes Ledger foundation + stability scoring + stable topic IDs.
- **Session 6:** Merge approved prompt changes from `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md`.
- **Sessions 7-9:** Human-in-Loop mode (multi-session build).
- **Sessions 10-12:** Feedback Repository (3 phases).
- **Session 13:** Cost Ledger + Model Registry.
- **Session 14:** Feedback-summarization-to-prompt-improvements button (meta-tool).
- **Session 15+:** Integration of director's parallel-chat workflow-fundamentals work (reminder: director is running a parallel chat; conclusions to be shared later; session MUST ask for them before Session 6's prompt merge).

### Director's explicit instructions for future sessions
- **Auto-Remove Irrelevant Terms button:** DO NOT program without explicit prompt. Director will provide details when this item is reached.
- **Changes Ledger naming:** director agreed to "Changes Ledger" for now; discuss finalizing in Session 4.
- **HTML tool:** director will upload `keyword_sorting_tool_v18.html` to repo root after 2026-04-20 session. Session 2 can assume it's available.
- **Session pacing:** stop design-only sessions at design-completion; don't push into code while tired. Rule 13 honored.

---

## ⚠️ POST-PHASE-1G-TEST-FOLLOWUP-PART-2 STATE (READ SECOND — updated 2026-04-19 session, retained for history)

**As of 2026-04-19 (Phase 1g-test follow-up Part 2 Claude Code session — both stale-closure + missing-await bugs fixed and validated live; full-run still blocked pending proactive Mode A→B switch):**

- ✅ **Stale-closure bug in `buildCurrentTsv` FIXED and deployed** — commit `a6b3b19`. Function now reads from `nodesRef.current` / `keywordsRef.current` / a new `sisterLinksRef.current` (the latter added alongside the existing refs at lines ~205-215). Comment added near refs block documenting the invariant for future developers.
- ✅ **Missing-`await` bug in `handleApplyBatch` FIXED and deployed** — same commit. Function made `async`; now `await`s `doApply(...)` before subsequent state flips and the next `runLoop()` call. `handleSkipBatch` audited: no change needed (doesn't call `doApply`).
- ✅ **Fixes validated live on Bursitis across 7 consecutive clean batches** (session_2026-04-19 run): canvas grew 22 → 27 → 33 → 36 → 39 → 41 → 49 → 53 nodes; "0 removed" every batch; "All 8 keywords verified on canvas" every batch; input token count grew batch-over-batch in proportion to canvas size (21.3k → 23.2k → 26.3k → 28.0k → 29.9k → 31.6k → 36.8k → 39.8k). The monotonic input growth is the live fingerprint that `buildCurrentTsv` is reading post-apply state from the refs — under the broken version, this number would be flat.
- ✅ **All three prior-session priorities remain deployed** (commits `27eb180`, `84062f5`, `b9dc8b9` from 2026-04-18 follow-up session — V2 prompts in repo, Mode A→B reactive auto-switch broadened, Budget UX).
- ⚠️ **Prior-session Mode A "attention dilution" diagnosis remains reframed:** the 2026-04-18 kickoff's observations of Mode A dropping topics were at least partially due to the stale-closure bug, not pure LLM attention dilution. See §6.5 below.
- ⚠️ **Adaptive Thinking + large prompts still unresolved** — workaround remains Enabled-12k. Unchanged.
- 🚨 **NEW QUANTITATIVE FINDING — Mode A alone cannot complete a full Bursitis run.** Trajectory analysis after 7 batches: Mode A costs ~750 input tokens/node and ~600-950 output tokens/node. Projected context wall at ~120-140 canvas nodes, which equals only **240-600 of 2,304 keywords placed (10-26%)** before hitting the 200k window. See `CORRECTIONS_LOG.md` 2026-04-19 "Mode-A-alone cannot complete" entry for full arithmetic. **Implication:** the planned proactive Mode A → Mode B switch (Phase 1-polish item) is no longer optional — it is a **functional prerequisite** for any full-dataset clustering run.
- 🚨 **Batch 6 and 7 "Unusually high: N new topics" warnings** emerged (27 and 31 new-topic-signals respectively, threshold 25). The AI is emitting more new-topic titles in its Mode A response than actually grow the canvas — consistent with Mode A doing speculative topic reshuffling as the table grows. Not a correctness failure (validation always passed, "0 removed"), but a signal that Mode A is starting to spend tokens on speculative structure changes rather than pure additions.
- 🏃 **Bursitis run left continuing in browser tab during session wrap-up.** User's choice (per session_2026-04-19): leave the tab running so the browser keeps processing batches unattended, see how far the reactive Mode A→B switch catches it before the context wall, and pick up with fresh evidence next session. Expected outcomes: (a) reactive switch fires around 60-100 nodes → Mode B carries the rest to completion ✅ ideal; (b) Mode A holds clean past ~130 nodes → context-wall failure 🛑 informative; (c) Anthropic stream stall exhausts 5-retry budget mid-batch → run aborts. User will paste activity log at start of next session.

**Next session top priority:** read activity log from the still-running (or completed/failed) Bursitis run; decide whether to implement the proactive Mode A → Mode B switch, or address whatever surfaces from the run's outcome. See `ROADMAP.md` Phase 1-polish section.

## ⚠️ POST-PHASE-1G-TEST-FOLLOWUP STATE (prior-session context — retained for history)

**As of 2026-04-18 (follow-up Claude Code session — Phase 1g-test still partial at that time):**

- ✅ **Three code-fix priorities from the prior session all shipped and deployed:**
  - `docs/AUTO_ANALYZE_PROMPT_V2.md` committed (canonical V2 prompts live in repo) — commit `27eb180`
  - Mode A → Mode B auto-switch broadened to fire on HC4/HC5 validation failures — commit `84062f5`
  - Budget UX bug + 3 sibling inputs with same root cause — commit `b9dc8b9`
  - All three pushed to origin/main; Vercel build clean; Budget UX fix verified live by user on vklf.com
- ✅ **Task 2 fix validated live in production:** during that session's attempted Bursitis run, batch 2's Mode A response dropped 1 topic + 8 keywords; the new auto-switch fired correctly (`⚡ AUTO-SWITCH: ... switching to DELTA mode (Mode B)`); batch 2 retry in Mode B succeeded with the full 3-attempt budget preserved. First live-production validation of a Claude-Code-authored fix.
- 🚨 **Stale-closure + missing-await bugs discovered** in that session (both now FIXED in 2026-04-19 — see above).

## ⚠️ POST-PHASE-1G-TEST STATE (kickoff session context — retained for history)

**As of 2026-04-18 (first Claude Code session — Phase 1g-test partial):**

- ✅ Auto-Analyze live-tested for the first time; batch 1 completed cleanly.
- ❌ Systematic failure mode observed in batch 2; diagnosis reframed in follow-up session (see §6.5 updates) — what was attributed to LLM attention dilution is now known to be partly the stale-closure bug.
- ⚠️ Adaptive Thinking produces 0 output tokens on large prompts; workaround: Thinking=Enabled, Budget=12000.
- ⚠️ Vercel 5-min timeout approaches at ~5 min wall time on server mode.
- 📝 Multiple doc drifts corrected (see §4).

**Next priority after Phase 1g-test follow-up:** see §6 "Phase 1g-test findings" for specific tuning items.

---

## ⚠️ POST-CKPT-8 STATE (READ FIRST)

**As of 2026-04-17 (Phase M Ckpt 8 complete):**

- The Keyword Clustering tool's URL is `/projects/[projectId]/keyword-clustering`.
- The tool is single-state — user arrives with a specific Project already picked via URL.
- ✅ **The `/plos` Keyword Analysis card** has been rewired (Ckpt 8) from the deleted `/keyword-clustering` to `/projects`. Full navigation path from Login → Dashboard → PLOS → click Keyword Analysis card → `/projects` → pick a Project → `/projects/[projectId]` → click Keyword Analysis workflow card → `/projects/[projectId]/keyword-clustering` now works end-to-end without any 404s.
- The `components/` folder (ASTTable, MTTable, KeywordWorkspace, etc. — 25+ files) lives at `src/app/projects/[projectId]/keyword-clustering/components/` (moved from `src/app/keyword-clustering/components/` in Ckpt 7). All relative imports (`./components/KeywordWorkspace`, etc.) work.
- The old `src/app/keyword-clustering/` folder has been DELETED entirely. Do not recreate it.
- `KeywordWorkspace`, `useKeywords`, `useCanvas`, and all inner tool components are UNCHANGED by Ckpts 7 and 8. They still receive `projectId`, `userId`, `aiMode` as props and function identically.
- The API routes (keywords, canvas/nodes, canvas/pathways, canvas/sister-links, canvas/rebuild, canvas state) are UNCHANGED. URL paths stay the same (`/api/projects/[projectId]/...`); the server resolves `projectWorkflowId` internally via `verifyProjectWorkflowAuth`.
- `npm run build` passes cleanly (most recently verified in Ckpt 8: 18.5s, 17/17 static pages, zero TypeScript errors).
- Local commits: Ckpt 7 = `5cc10c5`, Ckpt 8 = `ac62a3a`. Both on `main`, not pushed (Phase M deploy hold until Ckpt 9).

**Checkpoint remaining:** 9 (deploy + cleanup of pre-existing leftover files).

---

## ⚠️ POST-PHASE-M SCHEMA NOTE

**As of 2026-04-16 (Phase M Ckpt 4 complete), the database schema changed:**

- The old `Project` table no longer has a `workflow` field and is now the user-facing Project record (see PLATFORM_ARCHITECTURE.md §5 for live schema).
- A new internal table `ProjectWorkflow` now sits between a Project and its workflow-specific data.
- **All workflow data tables now reference `projectWorkflowId` instead of `projectId`:**
  - `Keyword.projectId` → `Keyword.projectWorkflowId`
  - `CanvasNode.projectId` → `CanvasNode.projectWorkflowId`
  - `Pathway.projectId` → `Pathway.projectWorkflowId`
  - `SisterLink.projectId` → `SisterLink.projectWorkflowId`
  - `CanvasState.projectId` → `CanvasState.projectWorkflowId`

**API URL paths are unchanged:** routes like `/api/projects/[projectId]/keywords` keep the same URL — the server resolves `projectWorkflowId` internally. This decision minimized client code churn.

**As of 2026-04-17 (Phase M Ckpt 5):** All API routes (server-side) have been rewritten to align with the new schema.
**As of 2026-04-17 (Phase M Ckpt 7):** The client-side Keyword Clustering page has been updated to match — single-state, URL-driven.

---

## ⚠️ POST-APRIL-17 ARCHITECTURAL REVEAL — Phase 2 implications for this tool

As of 2026-04-17 (chat `cc15409c-...`), the platform architectural reveal established that Keyword Clustering must eventually support:

1. **Up to 10–20 concurrent editors** on a single Project's canvas with OT/CRDT merge strategy (Pattern D per `PLATFORM_REQUIREMENTS.md §3`). Current tool is single-user only. **This is the highest-impact Phase 2 change to this tool.**

2. **Review cycle integration** — workers click "I'm done — please review"; admin reviews, leaves notes, can mark Acceptable or Revision-Requested. Tool must display review state and revision notes inline. Currently not supported.

3. **Audit trail (Phase 2, opt-in)** — whether Keyword Clustering emits audit events is TBD at Phase 2 design. Strong candidate for audit given high edit volume and 10–20 concurrent editors. Emission helper built in Phase 2 scaffold; events declared in a future design update.

4. **Reset Workflow Data** — admin-only destructive action to wipe all KC data for a specific Project (per `PLATFORM_REQUIREMENTS.md §7`). Must clear: Keywords, CanvasNodes, Pathways, SisterLinks, CanvasState, AA checkpoint localStorage. Not yet implemented — on Phase 1-gap roadmap (Must-have).

5. **Per-(user, workflow, project) assignment** — tool must only be reachable by admin or by users with an Assignment row for (this workflow, this Project). Currently all-or-nothing: if you can log in, you can use it. Phase 2 adds permission middleware at API level + worker-scoped UI.

6. **Scale target Phase 3:** ~500 Projects with active KC workflows simultaneously; at Phase 4 up to ~5,000. Current DB indexes (projectWorkflowId on Keyword/CanvasNode/Pathway/SisterLink) should handle this, but query patterns at scale need verification before Phase 3.

These items do NOT affect Phase 1 admin-solo work. They are flagged here so Phase 2 design work correctly scopes what must be added to this specific tool.

---

## 1. Tool overview

### What it does
Takes a broad list of niche-related keywords, analyzes their intents, and organizes them thematically into a hierarchy of topics that form highly efficient conversion funnels.

### Card on PLOS Landing Page
- **Icon:** 🔑
- **Title:** Keyword Analysis & Intent Discovery
- **Status:** Active (only active card as of current chat)
- **Route:** `/projects/[projectId]/keyword-clustering` (as of Ckpt 7)
- ✅ **Card on `/plos`** now correctly routes to `/projects` (Ckpt 8 rewire) — user picks a Project there, then enters the KC workspace from the Project detail page.

### Origin
Migrated from the original single-HTML tool `keyword_sorting_tool_v18.html` (~17,691 lines). Migration is mostly complete but some features have not yet been ported — see §7 "Missing features (Phase 1-gap)" below.

---

## 2. How the user accesses the tool

**Post-Ckpt-8 (current working path):**
```
Login (/) → Dashboard (/dashboard) → PLOS Landing (/plos)
  → Click "Keyword Analysis & Intent Discovery" card  ✅ routes to /projects (Ckpt 8 rewire)
  → /projects  (Projects list)
  → Click an existing Project's name
  → /projects/[projectId]  (Project detail page)
  → Click the Keyword Analysis workflow card
  → /projects/[projectId]/keyword-clustering  (single-state, Project pre-selected)
```

**The full navigation works end-to-end now.** No 404s, no workarounds needed. As of Ckpt 8, clicking the Keyword Analysis card on `/plos` correctly takes the user to the Projects list, where they pick a Project before entering the KC workspace.

---

## 3. Architecture

### Component tree (as of Ckpt 7)
```
src/app/projects/[projectId]/keyword-clustering/
  ├── page.tsx          — wrapper: auth, read projectId from URL, fetch Project name, render workspace (164 lines)
  └── components/       — all the actual tool code
        │
        └── <KeywordWorkspace projectId userId aiMode>
              │
              ├── Manual Mode (3-panel + canvas):
              │   ├── <ASTTable>         — All Search Terms (left top)
              │   ├── <MTTable>          — Main Terms (left middle)
              │   ├── <TIFTable>         — Terms In Focus (left bottom)
              │   └── <CanvasPanel>      — Topics Layout Canvas (right)
              │       └── <CanvasEditPanel>  — 320px drawer for node editing
              │
              └── AI Mode (1 table + canvas + AI Actions Pane):
                    │
                    ├── One of 4 views (toggle):
                    │   ├── <ASTTable>     — "Normal" view
                    │   ├── <MTTable>      — "Common Terms" view
                    │   ├── <KASTable>     — "Keywords Analysis" view
                    │   └── <TVTTable>     — "Topics View"
                    │
                    ├── <CanvasPanel> or <CanvasTableMode>
                    │
                    └── <AutoAnalyze>      — Auto-Analyze system (76KB)
```

### Canvas modes
- **Mindmap mode (default):** Visual canvas with draggable nodes, pathways, sister links
- **Table mode:** Alternate structured view of the same canvas data

### Hooks
- `src/hooks/useKeywords.ts` — keyword state + `batchUpdate` + `reorder`
- `src/hooks/useCanvas.ts` — canvas state (lifted to `KeywordWorkspace`, passed to `CanvasPanel`)

### Key prop flow
- `aiMode` lives in `page.tsx`, passed as prop to `KeywordWorkspace`. Per-session only — resets on page refresh. See ROADMAP Phase 1-polish item.
- `useCanvas` lifted to `KeywordWorkspace`, passed as prop to `CanvasPanel`

---

## 4. Database tables used

All scoped by `projectWorkflowId` (post-Phase-M):

| Table | Purpose |
|---|---|
| `Project` | User-facing project record (one per product launch effort). `ProjectWorkflow` holds per-workflow state/data. |
| `ProjectWorkflow` | Per-workflow internal bucket — holds status (inactive/active/completed) + activity timestamps for the keyword-clustering workflow of a specific Project. User never sees this name. |
| `Keyword` | Individual keywords: keyword text, volume, sortingStatus, tags, topic, canvasLoc, topicApproved |
| `CanvasNode` | Topic nodes: title, description, altTitles, parentId, pathwayId, kwPlacements, position, size |
| `Pathway` | Conversion pathways (grouping of nodes) |
| `SisterLink` | Cross-pathway links between nodes |
| `CanvasState` | Viewport (viewX, viewY, zoom) + nextNodeId/nextPathwayId counters |

See `PLATFORM_ARCHITECTURE.md` §5 for full schema definitions.

### Activity tracking (post-Ckpt-5)

User actions that flip `ProjectWorkflow.status` from "inactive" to "active" on first occurrence AND refresh `lastActivityAt` on every occurrence:
- Any keyword create/edit/delete (single or bulk)
- Any canvas node create/edit/delete
- Any pathway create/delete
- Any sister link create/delete
- Atomic canvas rebuild (Auto-Analyze batch apply)

User actions that do NOT flip status (but also don't update `lastActivityAt`):
- GET any resource (reading data)
- Canvas viewport pan/zoom (writes to `CanvasState` but is pure "looking around")
- Opening the workspace without making any edits (the page fetches Project summary but no workflow-data writes happen)

Manual user action:
- Toggle "Completed" on the Projects page Completed button → PATCH to `/api/project-workflows/[projectId]/keyword-clustering` with `{ status: "completed" }`

### Data still in localStorage (planned migration in Phase 1-persist)

**⚠️ CORRECTED 2026-04-18:** the prior version of this list referenced `kst_aa_apikey`, `kst_aa_model`, `kst_aa_initial_prompt`, `kst_aa_primer_prompt` as if they were standalone localStorage keys. **Those keys do NOT exist in the current code.** Verified by grep across `/src/` on 2026-04-18 — zero matches. The actual behavior:

- **Auto-Analyze checkpoint — the ONLY AA-related localStorage key** — `aa_checkpoint_{Project.id}` (note: uses `Project.id` not `ProjectWorkflow.id`; prior docs were wrong on this too). Created only AFTER a run starts and `saveCheckpoint()` fires. Contains the full config (apiMode, apiKey, model, seedWords, thinking mode + budget, processingMode, prompts, etc.) + current batch state + log entries.
- **Before a run starts, NO Auto-Analyze settings are persisted.** Open the panel, paste prompts, close the browser → everything is lost. This is a UX gap for a non-programmer user.
- **After a run starts and the first checkpoint saves, the Resume Checkpoint button (▶ Resume) appears on next visit and restores the full config including prompts** — but only if the checkpoint wasn't discarded via ✕ Cancel (which calls `clearCheckpoint()`).

**Other localStorage items (unchanged from prior docs — verify each against code before acting):**
- MT Table entries (`kst_mt`)
- Removed Terms (`kst_rm`) — ⚠️ currently lost on refresh
- UI state (panel visibility, filters, zoom, canvas mode, collapsed nodes, TIF entries, etc.)
- **NEW (Ckpt 7):** `aiMode` (Manual/AI toggle state) is currently per-session only — resets on page refresh. Considering adding to `UserPreference` per-user per-workflow. See ROADMAP Phase 1-polish items.

---

## 5. Feature inventory (what's built)

### Manual Mode features ✅
- **AST (All Search Terms) table:**
  - Data entry (paste list, import TSV)
  - Columns: Keyword, Volume, Status, Tags, Topics, SV
  - 4 sorting statuses: Unsorted (gray), Partially Sorted (orange), Completely Sorted (green), AI-Sorted (blue)
  - Split Topics View
  - Search, filters, virtual scroll, drag-reorder, zoom
  - CSV download
  - Column visibility toggles
  - 200ms debounce on search (Phase 1-foundation)
- **MT (Main Terms) table**
- **TIF (Terms In Focus) table**

### AI Mode features ✅
- **Four-way table toggle:**
  1. Normal Table View (AST)
  2. Common Terms View (MT)
  3. Keywords Analysis View (KAS)
  4. Topics View (TVT)
- **AI Actions Pane** with view-specific button groups
- **KAS (Keywords Analysis) table** — derived analysis view
- **TVT (Topics View) table:**
  - Depth-first tree-walk order
  - 7 depth-colored title shades
  - Primary (bold) and secondary (italic purple) keyword display
  - Volume badge per topic (sum of primary keyword volumes)
  - Deduplicated keyword count
  - Drag-to-reorder (3 modes: before / after / nest as child)
  - Description column toggle
  - Hover popover (250ms delay)
  - Ancestry orange highlight chain on row hover
  - Depth filter dropdown
  - Zoom (7–18px range)
  - Bi-directional sync with canvas

### Canvas ✅
- **Mindmap mode:**
  - Draggable nodes
  - Accent stripe per depth
  - Node content: title (22px) → alt titles (14px) → description → KW preview (36px) → badge (18px)
  - Primary keywords (blue) and secondary keywords (purple italic)
  - Badge showing `Np + Ns` counts
  - Resize grip
  - Edit Panel (320px drawer)
- **Canvas Table Mode:** alternate structured view
- **Pathways:** grouping mechanism
- **Sister Links:** dashed purple lines between nodes
- **Node resize + customization**
- **Atomic rebuild** via `/canvas/rebuild` endpoint (Phase 1g-rebuild)

### Auto-Analyze System ✅ (code complete, NOT YET TESTED — Phase 1g-test)
- **Two execution modes:**
  - Direct mode: browser → Anthropic (no server timeout)
  - Server mode: browser → Vercel → Anthropic (5min timeout)
- **Processing modes:**
  - Adaptive (default) — adaptive batch sizing
  - Classic — fixed batch size
- **Adaptive batch tiers:**
  - Foundation: 8
  - Expansion: 12
  - Placement: 18
- **Hybrid full-table → delta mode** (auto-switches on truncation)
- **Input monitoring** at 60% / 80% context window
- **5 hard + 7 soft validation checks** (HC5 zero tolerance, SC11 stability, SC12 symmetry)
- **Streaming SSE** for long-running calls
- **Stall retries** (5) + **model retries** (3)
- **Checkpoint persistence** in `localStorage` key `aa_checkpoint_{projectWorkflowId}`
- **Post-apply verification** before marking AI-Sorted
- **Initial Prompt v2** (Steps 1–7, reevaluation triggers) + **Primer Prompt**
- **Two output modes:** Mode A (full table), Mode B (delta)
- **`aaMergeDelta()`** client-side merge
- **max_tokens:** 128000
- **AA_CONTEXT_WINDOW:** 200000

### Auth & API ✅
- JWT-based auth via Supabase on every API route
- `verifyProjectAuth(projectId)` ensures user owns the Project
- `verifyProjectWorkflowAuth("keyword-clustering", projectId)` additionally upserts the ProjectWorkflow row (Ckpt 5)
- All workflow-data routes call `markWorkflowActive()` after mutations (Ckpt 5)

### Page routing & navigation ✅ (Ckpt 7)
- Page lives at `/projects/[projectId]/keyword-clustering`
- Reads `projectId` from URL via `useParams()`
- Fetches Project summary via `GET /api/projects/[projectId]` to show Project name in header
- Top-bar "← Back to Project" returns to `/projects/[projectId]`
- Friendly error state with "Back to Projects" button on 404/403
- `npm run build` passes cleanly

---

## 6. Testing status

### Tested in user's real usage
- Manual Mode tables (AST/MT/TIF): ✅ Working
- Canvas Mindmap + Table modes: ✅ Working
- AI Mode four-way toggle: ✅ Working
- Atomic canvas rebuild: ✅ Working (via Ckpt 1g-rebuild)
- Multi-project management: ✅ Working pre-Phase-M; needs re-verification after Ckpt 9 deploy

### Partially tested
- **Auto-Analyze — first live run completed 2026-04-18 on Bursitis Project (2,328 keywords).** See §6.5 Phase 1g-test findings below. Batch 1 succeeded end-to-end, batch 2 failed systematically with Mode A full-table behavior. More tuning work needed before a completing run is possible.

### NOT yet tested in user's real usage
- **Post-Phase-M data persistence** — the new schema is live in Supabase and user has re-imported Bursitis keywords (2,328) since Ckpt 9 deploy. Read/write confirmed via the one successful batch. Needs broader stress testing.
- **Post-Ckpt-7 navigation in the browser** — confirmed working during Ckpt 9.5 visual verification and confirmed again during Phase 1g-test. ✅ No issues.

---

## 6.5 Phase 1g-test findings (2026-04-18, first Claude Code session)

**Test setup:**
- Project: "Bursitis" — 2,328 unsorted keywords (fresh Project, no prior clustering or AI-Sorted data)
- Model: `claude-sonnet-4-6` (chosen for balance of capability and cost)
- API Mode: **Server proxy** (via Vercel, leveraging the server-side `ANTHROPIC_API_KEY` env var)
- Processing mode: Adaptive (Foundation 8 → Expansion 12 → Placement 18 batch tiers)
- Initial Prompt V2 pasted: 35,921 characters
- Topics Layout Table Primer V2 pasted: 15,208 characters
- Seed words: `bursitis`

### 6.5.1 — BUG: Adaptive Thinking mode produces 0 output tokens on large prompts

**Symptom:** With Thinking=Adaptive and the 51k-char prompt loaded, the model entered thinking phase and ran for ~4:58 of wall time on each of 3 attempts, then the stream completed with "Input: 183, Output: 0 tokens." The "Input: 183" is misleading — it's cache-miss tokens reported by the streaming usage event, not total input. Total input was ~13,584 tokens per attempt.

**Root cause hypothesis:** Adaptive Thinking does not cap the thinking token budget. On complex/large prompts, the model consumes its entire `max_tokens=128000` allocation during the silent thinking phase with no room left to emit output text. The stream's final usage event reports 0 output tokens because none were ever generated.

**Workaround confirmed working:** Change Thinking dropdown from "Adaptive" to "Enabled", set Budget to 12000. Batch 1 with this setting: thinking phase ~1:55, output phase ~1:49, total batch time ~3:51, 14,752 output tokens generated, validation passed, 8 topics on canvas. Cost: $0.257 for batch 1 (no cache hit yet).

**Fix recommendation:** In the Auto-Analyze component, when Adaptive is selected but the combined system prompt exceeds ~40k chars, the tool should warn the user that Adaptive may fail and suggest switching to Enabled with a safe budget. Alternatively, detect the "0 output tokens" failure signature and auto-fall-back to Enabled.

### 6.5.2 — BUG: Mode A (full-table) produces invalid output as the topics table grows

**Symptom:** Batch 2 with Thinking=Enabled 12k budget succeeded in producing 17,399 output tokens but the model's response **dropped 4 pre-existing topics from batch 1 and lost 8 keywords.** The validation check (HC5 — lost keywords — zero tolerance) correctly rejected the response and triggered a retry with correction context.

Across 3 attempts on batch 2:
- Attempt 1: 17,399 output tokens, dropped 4 topics + lost 8 keywords → validation failed
- Attempt 2: 0 output tokens — stream ran 4:59 wall time (suspicious — Vercel's 5-min ceiling) → retry triggered
- Attempt 3: 16,552 output tokens, dropped 6 topics + lost 2 keywords → validation failed → batch 2 marked FAILED, tool moved to batch 3

The tool's 3-attempt retry cap worked as designed. But the 8 keywords from batch 2 remain unsorted.

**Root cause:** Mode A requires the model to transcribe the full existing topics table AND add new rows for the current batch. As the table grows, the model's attention degrades and it omits rows — effectively "summarizing by omission." The prompt explicitly forbids deleting topics, but the model does it anyway. This is a known pattern with long-context generation.

**Design gap:** The docs describe a Mode A → Mode B auto-switch that's supposed to kick in on truncation. It did not trigger on these validation failures because the responses weren't truncated — they were omission-complete. **The auto-switch condition needs to include validation failures from dropped-topics / lost-keywords, not just truncation.**

**Fix recommendations:**
1. Broaden the Mode A → Mode B trigger to include validation failures from lost data
2. Consider making Mode B (delta) the default after batch 1 (when the topics table has any content)
3. Consider splitting very large prompts across system + cached + user-message boundaries more deliberately to leverage Anthropic's prompt caching further

### 6.5.3 — BUG: Vercel 5-minute timeout is a real ceiling, and it's close

**Symptom:** Batch 2 attempt 2 took exactly 4:59 wall time from request start to stream-complete — within 1 second of Vercel's 5-minute serverless function timeout — and returned 0 output tokens. Possible that Vercel killed the stream.

**Implication:** For any batch that takes longer than ~4:30 wall time on Server mode, we're at risk of this ceiling. And batches get slower as the table grows (more input tokens, more thinking needed to manage existing state).

**Workaround:** Switch API Mode dropdown to "Direct (browser → Anthropic)". This routes requests from the user's browser straight to Anthropic, bypassing Vercel entirely, with no timeout. Downside: the user must paste their own Anthropic API key into the tool's UI (stored in React state only — same persistence caveats as the prompts).

**Design recommendation:** For Projects with > N keywords (where N is small enough that expected per-batch times stay safely under 4 minutes), Server mode is fine. For larger Projects, Direct mode should be the default. A UI hint could surface this based on keyword count.

### 6.5.4 — UX bug: Budget input field snaps back to default on empty

**Symptom:** When editing the "Budget" number input, deleting all characters causes the field to auto-refill with the default value (10000) before the user can type their new number. The user is forced to triple-click to select-all, then type.

**Code location:** `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` line ~1514: `onChange={e => setThinkingBudget(parseInt(e.target.value) || 10000)}`. The `|| 10000` fallback fires whenever `parseInt("")` returns NaN.

**Fix:** Allow an empty string during editing. Only enforce the default on blur or on form submit.

### 6.5.5 — UX need: Auto-Analyze overlay should be resizable and movable

**User request:** The overlay should be draggable via its top bar (move to any position on screen) and resizable via a drag-handle on its bottom-right corner. Currently it's a fixed-position panel.

### 6.5.6 — Documentation drift corrected (Pattern 3 / Pattern 11 adjacent)

During this session, three doc drifts from prior claude.ai chats were discovered via code reading:

1. **`DATA_CATALOG.md` §5.8** and **`KEYWORD_CLUSTERING_ACTIVE.md` §4** both claimed the `kst_aa_apikey`, `kst_aa_model`, `kst_aa_initial_prompt`, `kst_aa_primer_prompt` localStorage keys exist. **They don't.** Grep confirmed zero matches in `/src/`. Fixed in both docs this session.

2. **`KEYWORD_CLUSTERING_ACTIVE.md` §4** claimed the checkpoint key uses `projectWorkflowId`. **Code uses `projectId`** (line 227: `const cpKey = 'aa_checkpoint_' + projectId;`). Fixed.

3. **Implicit assumption** that the "Initial Prompt v2" was retrievable from somewhere. In fact it's stored only in the user's separate text files + inside `keyword_sorting_tool_v18.html` on the user's laptop. Nothing in the repo or database holds the prompt content. Recommendation: commit `docs/AUTO_ANALYZE_PROMPT_V2.md` containing the canonical V2 Initial + Primer prompts — source-of-truth in the repo, not in ephemeral browser state or scattered files. **Logged as a follow-up task for the next session.**

### 6.5.7 — Session verdict

Phase 1g-test was **partially completed**: we confirmed the tool works end-to-end in principle, found the major tuning path (Thinking: Enabled 12k), identified several bugs and doc drifts, and produced a concrete punch-list for a Phase 1g-test follow-up session. The Bursitis Project's 2,328 keywords are not yet fully clustered — that's a dedicated follow-up run, ideally in Direct mode, with Mode A→B auto-switch behavior revisited first.

---

## 7. Missing features (Phase 1-gap — not yet ported from legacy KST)

Must-haves:
- Reset Workflow Data (admin action — wipe all KC data for a specific Project)
- Import keywords from TSV (pre-Phase-M supported, needs re-test post-deploy)

Nice-to-haves:
- Export canvas as image
- Bulk keyword operations (merge duplicates, tag many at once)
- Undo/redo history
- Keyboard shortcuts for common actions

---

## 8. Known issues / active bugs

### Pre-Phase-M issues
- None currently known in-depth (legacy bugs largely addressed in Phases 1a–1g)

### Post-Phase-M issues
- None known as of Ckpt 7 — the build passes, the page compiles, tool code is unchanged from Ckpt 5 state. First real usage will happen after Ckpt 9 deploy.

---

## 9. Deployment

- Current live code: pre-Phase-M commit `f545e2a` on vklf.com (BROKEN against live DB schema)
- Phase M Ckpts 1–7 work exists only in local commits on `main`
- Deploy: Checkpoint 9

---

## 10. Performance notes

- Canvas: visibility-aware rendering (only render visible nodes)
- AST search: 200ms debounced
- Virtual scroll on keyword tables
- Bulk writes use `$transaction`
- Atomic rebuild uses transactional diff-based update

### Phase 2 scale gap
- Current query patterns have not been verified against Phase 3 scale (~500 concurrent Projects, ~50 users). Testing planned during Phase 1α scaffold design.

---

## 11. Known issues (architecture/tech-debt specific to KC)

- Race condition on `nextNodeId` / `nextPathwayId` in `canvas/nodes` POST and `canvas/pathways` POST (Ckpt 5). Must fix before Phase 1-collab.
- Asymmetric `canvasState` upsert logic between `canvas/nodes/route.ts` POST and `canvas/pathways/route.ts` POST.
- `ops as any` TypeScript workaround in `canvas/rebuild/route.ts`.
- Mutable state in CanvasPanel drag handlers.
- Missing ASTRow memoization.
- Missing error state + retry in useCanvas.
- Missing optimistic update rollback.
- `aiMode` resets on page refresh (Ckpt 7). Low priority Phase 1-polish item.

---

## 12. Upcoming work for this tool

### Phase 1 (admin-solo)
- **Phase 1g-test (STILL PARTIAL — 2026-04-18 kickoff + follow-up):** First live run partial completion; 2,320 keywords still not clustered due to stale-closure bug discovered in follow-up session. Tool itself ran end-to-end for batches 1–2 with Task 2's fix helping recover batch 2's Mode A failure, but batch 3 exposed the deeper stale-closure issue blocking further progress.
- **Phase 1g-test follow-up Tasks 1–3 (✅ COMPLETE — deployed 2026-04-18):**
  1. ✅ `docs/AUTO_ANALYZE_PROMPT_V2.md` committed as `27eb180`
  2. ✅ Mode A → Mode B auto-switch broadened as `84062f5` — **live-validated in production**
  3. ✅ Budget + 3 sibling inputs UX fix as `b9dc8b9` — **live-validated in production**
- **Phase 1g-test follow-up REMAINING (🎯 NEXT SESSION TOP PRIORITY):**
  1. 🚨 Fix stale-closure bug in `buildCurrentTsv` (`AutoAnalyze.tsx` lines 359–408) — use `nodesRef.current` / `keywordsRef.current` + new `sisterLinksRef.current` instead of prop-captured closures. LOAD-BEARING.
  2. 🚨 Add `await` on `doApply` in `handleApplyBatch` (line 1387); audit `handleSkipBatch` for same.
  3. After deploy, restart the Bursitis Auto-Analyze run (canvas will start fresh; prior session's 22-node state will be rebuilt).
  4. (Carried from kickoff) Add UI hint recommending Direct mode for larger Projects
  5. (Carried from kickoff) Add warning when Adaptive Thinking is selected with a large prompt
- **Phase 1-polish (accumulated across kickoff + follow-up sessions):** See `ROADMAP.md` Phase 1-polish section for the full list with details. Summary: overlay resize/move + localStorage persistence; prompt-sync button (NEW — syncs AA-panel prompts back to the repo file); persist AA settings to `UserPreference`; proactive Mode A → Mode B after batch 1; row-count self-check in Mode A prompt; cap Mode A batch size; add Haiku 4.5 to Model dropdown; comparative Mode A robustness test across three models; include failed-attempt costs in Total Spent.
- **Phase 1-verify:** Verify canvas rebuild edge cases.
- **Phase 1-gap:** Port remaining KST features (reset-workflow-data, canvas-as-image export, undo/redo, keyboard shortcuts).
- **Phase 1-persist:** Migrate must-persist localStorage items to database (MT Table, Removed Terms, etc.). Possibly also migrate `aiMode` to UserPreference.
- **Phase 1h:** UX polish.

### Phase 2 (multi-user)
- Assignment-based access control
- Review cycle UI (Submit for Review button, review state display, notes viewer)
- Real-time collaboration via OT/CRDT (Pattern D)
- Audit event emission (if opted in)
- Reset-workflow-data admin action

### Phase 3 (scale)
- Query pattern verification against ~500 concurrent active KC instances

---

## 13. Deferred items

### Captured here
- aiMode persistence per-user per-workflow (Phase 1-polish) — also in ROADMAP
- Reset Workflow Data feature — in `PLATFORM_REQUIREMENTS.md §7` and Phase 1-gap
- All Phase 2 items from architectural reveal — tracked in PLATFORM_REQUIREMENTS.md and PLATFORM_ARCHITECTURE.md §10

### Placeholder for future work
- Tool Graduation Ritual eventual split into `KEYWORD_CLUSTERING_ARCHIVE.md` and `KEYWORD_CLUSTERING_DATA_CONTRACT.md`. Trigger: when all Phase 1 polish items complete AND any upcoming workflow needs to consume this tool's output data (first likely consumer: Competition Scraping workflow).

---

END OF DOCUMENT
